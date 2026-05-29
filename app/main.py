import asyncio
import logging
import uuid
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text, func

from app.config import settings
from app.db import get_db, engine
from app.init_db import init_database
from app.models import Corpus, Query, BenchmarkRun, SystemConfig, RetrievalResult
from app.ingestion.embedder import embed_texts, get_embedder_model
from app.ingestion.ingest_fiqa import run_ingestion_pipeline
from app.retrieval.dense import dense_retrieve_detailed, dense_retrieve_ids
from app.retrieval.sparse import sparse_retrieve_detailed, sparse_retrieve_ids
from app.retrieval.hybrid import hybrid_retrieve_detailed, hybrid_retrieve_ids
from app.evaluation.visualizer import fit_cached_pca, project_embeddings
from app.evaluation.runner import run_evaluation_benchmark
from app.api.logs_logger import setup_websocket_logging, log_queue

# Logger setup
logger = logging.getLogger("app")
logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="RAG Retrieval Comparator API",
    description="Production backend for RAG comparisons with pgvector and MRR benchmarking"
)

# Standardized Error Exception Mappings
class RAGException(Exception):
    def __init__(self, message: str, code: str, detail: Optional[str] = None, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.code = code
        self.detail = detail
        self.status_code = status_code

@app.exception_handler(RAGException)
async def rag_exception_handler(request, exc: RAGException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.message,
            "code": exc.code,
            "detail": exc.detail or ""
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "code": "INTERNAL_SERVER_ERROR",
            "detail": str(exc)
        }
    )

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global in-memory ingestion tracker
ingestion_state = {
    "status": "idle",  # idle, running, completed, failed
    "progress": 0,
    "processed": 0,
    "total": 57638,
    "last_error": None
}

@app.on_event("startup")
async def startup_event():
    # 1. Initialize databases, extensions, tables and configurations
    await init_database()
    
    # 2. Setup WS Queue Logging Handler
    loop = asyncio.get_running_loop()
    setup_websocket_logging(loop)
    
    # 3. Fit cached PCA visualizer if embeddings exist
    async with AsyncSession(engine) as session:
        await fit_cached_pca(session)
        
    # Pre-warm embedder model to avoid lag on first request
    asyncio.create_task(asyncio.to_thread(get_embedder_model))

# 1. Health check
@app.get("/api/health", tags=["System"])
async def health_check(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "ok", "db": "connected"}
    except Exception as e:
        raise RAGException(
            message="Database connection error",
            code="DATABASE_DISCONNECTED",
            detail=str(e),
            status_code=503
        )

# 2. Config endpoints
@app.get("/api/config", tags=["Configuration"])
async def get_system_config(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(SystemConfig).where(SystemConfig.key == "hnsw_params"))
    config = res.scalar()
    if not config:
        return {"hnsw_m": 16, "hnsw_ef_construction": 64, "hnsw_ef_search": 40}
    return config.value

@app.post("/api/config/update", tags=["Configuration"])
async def update_system_config(config_data: dict, db: AsyncSession = Depends(get_db)):
    try:
        # Validate keys
        m = config_data.get("hnsw_m", 16)
        ef_const = config_data.get("hnsw_ef_construction", 64)
        ef_search = config_data.get("hnsw_ef_search", 40)
        
        # Save to database
        res = await db.execute(select(SystemConfig).where(SystemConfig.key == "hnsw_params"))
        config = res.scalar()
        if not config:
            config = SystemConfig(key="hnsw_params", value=config_data)
            db.add(config)
        else:
            config.value = {
                "hnsw_m": m,
                "hnsw_ef_construction": ef_const,
                "hnsw_ef_search": ef_search
            }
        await db.commit()
        
        # Dynamically compile new HNSW index in background
        logger.info(f"Re-compiling pgvector HNSW index with m={m}, ef_construction={ef_const} ...")
        await db.execute(text("DROP INDEX IF EXISTS hnsw_idx;"))
        await db.execute(text(f"""
            CREATE INDEX hnsw_idx ON corpus USING hnsw (embedding vector_cosine_ops)
            WITH (m = {m}, ef_construction = {ef_const});
        """))
        await db.commit()
        logger.info("New pgvector HNSW index compiled successfully.")
        
        return {"message": "Configuration updated and index compiled successfully."}
    except Exception as e:
        await db.rollback()
        raise RAGException(
            message="Error compiling index or saving config",
            code="CONFIG_UPDATE_FAILED",
            detail=str(e)
        )

# 3. Ingestion endpoints
def background_ingestion(db_url: str):
    async def _run():
        global ingestion_state
        ingestion_state["status"] = "running"
        ingestion_state["last_error"] = None
        
        # Create dedicated async session for the background task
        from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
        bg_engine = create_async_engine(db_url)
        
        try:
            async with AsyncSession(bg_engine) as session:
                def progress_cb(msg: str):
                    if "Processed chunks" in msg:
                        try:
                            # Parse progress out of msg: "Processed chunks: 256/57638"
                            parts = msg.split("Processed chunks: ")[1].split("/")
                            processed = int(parts[0])
                            total = int(parts[1].split()[0])
                            ingestion_state["processed"] = processed
                            ingestion_state["total"] = total
                            ingestion_state["progress"] = int((processed / total) * 100)
                        except Exception:
                            pass
                
                await run_ingestion_pipeline(session, log_callback=progress_cb)
                
                # Fit PCA visualizer on newly ingested corpus
                await fit_cached_pca(session)
                
                ingestion_state["status"] = "completed"
                ingestion_state["progress"] = 100
        except Exception as e:
            logger.error(f"Background ingestion crashed: {str(e)}")
            ingestion_state["status"] = "failed"
            ingestion_state["last_error"] = str(e)
        finally:
            await bg_engine.dispose()
            
    asyncio.create_task(_run())

@app.post("/api/ingest", tags=["Ingestion"])
async def trigger_ingest(background_tasks: BackgroundTasks):
    global ingestion_state
    if ingestion_state["status"] == "running":
        raise RAGException(
            message="An ingestion pipeline job is already active.",
            code="INGESTION_ALREADY_RUNNING",
            status_code=409
        )
    background_ingestion(settings.database_url)
    return {"message": "FiQA Ingestion triggered successfully in the background."}

@app.get("/api/ingest/status", tags=["Ingestion"])
async def get_ingest_status():
    global ingestion_state
    return ingestion_state

@app.get("/api/queries", tags=["Queries"])
async def get_benchmark_queries(db: AsyncSession = Depends(get_db)):
    try:
        # Load sample golden queries for query selector dropdown
        res = await db.execute(select(Query).limit(5))
        queries = res.scalars().all()
        return [{"query_id": q.query_id, "query_text": q.text} for q in queries]
    except Exception as e:
        raise RAGException(
            message="Failed to load queries",
            code="QUERIES_LOAD_FAILED",
            detail=str(e)
        )

# 4. Search Explorer Retrieval endpoint
@app.post("/api/retrieve", tags=["Retrieval"])
async def side_by_side_retrieve(query_data: dict, db: AsyncSession = Depends(get_db)):
    query_text = query_data.get("query")
    if not query_text:
        raise RAGException("Query string cannot be empty", "INVALID_QUERY_STRING")
        
    try:
        # Check if database has corpus chunks
        c_check = await db.execute(select(func.count()).select_from(Corpus))
        if c_check.scalar() == 0:
            raise RAGException(
                message="Corpus passages table is completely empty. Please run Ingestion first!",
                code="CORPUS_EMPTY",
                status_code=400
            )

        # 1. Embed query locally using BGE
        emb = embed_texts([query_text])[0]
        
        # 2. Run Dense, Sparse (with fallback), and Hybrid retrievals
        dense_results = await dense_retrieve_detailed(emb, settings.top_k, db)
        sparse_res = await sparse_retrieve_detailed(query_text, emb, settings.top_k, db)
        hybrid_results = await hybrid_retrieve_detailed(query_text, emb, settings.top_k, db)
        
        return {
            "query": query_text,
            "dense": dense_results,
            "sparse": sparse_res["chunks"],
            "sparse_fallback_applied": sparse_res["fallback_applied"],
            "sparse_fallback_count": sparse_res["fallback_count"],
            "hybrid": hybrid_results
        }
    except RAGException:
        raise
    except Exception as e:
        raise RAGException(
            message="Retrieval side-by-side search execution failed",
            code="RETRIEVAL_FAILED",
            detail=str(e)
        )

# 5. Vector Visualizer Coordinates Projection endpoint
@app.post("/api/retrieve/embeddings", tags=["Retrieval"])
async def project_embeddings_endpoint(payload: dict):
    query_text = payload.get("query")
    strategy = payload.get("strategy", "hybrid")
    
    dense_chunks = payload.get("dense", [])
    sparse_chunks = payload.get("sparse", [])
    hybrid_chunks = payload.get("hybrid", [])
    
    if not query_text:
        raise RAGException("Query text is required", "INVALID_PAYLOAD")

    # Select working chunk set based on strategy
    active_chunks = {
        "dense": dense_chunks,
        "sparse": sparse_chunks,
        "hybrid": hybrid_chunks
    }.get(strategy, hybrid_chunks)
    
    if not active_chunks:
        return []
        
    try:
        # Local BGE embedding for query
        query_emb = embed_texts([query_text])[0]
        
        # Extract embeddings for the retrieved chunks from database
        async with AsyncSession(engine) as session:
            doc_ids = []
            for chunk in active_chunks:
                # Strip helper identifiers
                doc_id = chunk["id"].replace("chunk-dense-", "").replace("chunk-sparse-", "").replace("chunk-hybrid-", "").replace(" (fallback)", "")
                doc_ids.append(doc_id)
                
            res = await session.execute(
                select(Corpus.doc_id, Corpus.content, Corpus.embedding)
                .where(Corpus.doc_id.in_(doc_ids))
            )
            
            # Map retrieved elements to embeddings lookup
            emb_lookup = {}
            for row in res:
                emb_lookup[row.doc_id] = row.embedding
                
            # Line up high-dimensional vectors (fill with zeros if chunk has gone missing)
            doc_embs = []
            labels = []
            scores = []
            strategies = []
            
            for idx, doc_id in enumerate(doc_ids):
                labels.append(f"Chunk #{idx+1} (Doc {doc_id})")
                scores.append(active_chunks[idx].get("score", 0.5))
                strategies.append(strategy)
                
                emb = emb_lookup.get(doc_id)
                if emb is None:
                    emb = [0.0] * settings.embedding_dim
                elif isinstance(emb, str):
                    emb = [float(x) for x in emb.replace("[", "").replace("]", "").split(",")]
                doc_embs.append(emb)
                
            # Call PCA projection
            projected_points = project_embeddings(
                query_vector=query_emb,
                doc_vectors=doc_embs,
                labels=labels,
                strategies=strategies,
                scores=scores
            )
            return projected_points
            
    except Exception as e:
        logger.error(f"Error projecting coordinates: {str(e)}")
        # simple visual fallback coordinates
        return [{"x": 50, "y": 50, "label": "Query Vector", "strategy": "query", "score": 1.0}]

# 6. Benchmark Runs endpoints
@app.get("/api/overview/stats", tags=["Benchmark"])
async def get_overview_statistics(db: AsyncSession = Depends(get_db)):
    try:
        # total count
        corpus_size_res = await db.execute(select(func.count()).select_from(Corpus))
        corpus_size = corpus_size_res.scalar() or 0
        
        # Latest run
        run_res = await db.execute(
            select(BenchmarkRun)
            .where(BenchmarkRun.status == "completed")
            .order_by(BenchmarkRun.created_at.desc())
            .limit(1)
        )
        latest_run = run_res.scalar()
        
        if not latest_run:
            # Safe Fallback to template matching mock numbers if empty
            return {
                "id": "baseline-empty",
                "name": "Unindexed Flat Baseline",
                "status": "completed",
                "corpusSize": corpus_size,
                "queryCount": 0,
                "embeddingModel": "BAAI/bge-small-en-v1.5 (384d)",
                "chunkStrategy": "FiQA Standard Chunking",
                "indexType": "None",
                "dense": {"mrr10": 0.00, "avgLatencyMs": 0.0, "recall10": 0.00, "p95LatencyMs": 0.0, "throughputQps": 0.0},
                "sparse": {"mrr10": 0.00, "avgLatencyMs": 0.0, "recall10": 0.00, "p95LatencyMs": 0.0, "throughputQps": 0.0},
                "hybrid": {"mrr10": 0.00, "avgLatencyMs": 0.0, "recall10": 0.00, "p95LatencyMs": 0.0, "throughputQps": 0.0}
            }
            
        metrics = latest_run.config.get("metrics", {})
        return {
            "id": str(latest_run.id),
            "name": latest_run.name,
            "status": latest_run.status,
            "corpusSize": corpus_size,
            "queryCount": 648,
            "embeddingModel": latest_run.config.get("embedding_model", "BAAI/bge-small-en-v1.5"),
            "chunkStrategy": latest_run.config.get("chunk_strategy", "Default"),
            "indexType": latest_run.config.get("index_type", "HNSW"),
            "dense": metrics.get("dense", {}),
            "sparse": metrics.get("sparse", {}),
            "hybrid": metrics.get("hybrid", {})
        }
    except Exception as e:
        raise RAGException(
            message="Failed to load overview aggregates",
            code="STATS_LOAD_FAILED",
            detail=str(e)
        )

def background_evaluator(run_id: uuid.UUID, run_name: str, db_url: str):
    async def _run():
        from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
        bg_engine = create_async_engine(db_url)
        
        try:
            async with AsyncSession(bg_engine) as session:
                def push_log_ws(msg: str):
                    logger.info(msg)
                
                await run_evaluation_benchmark(
                    session, run_name, run_id=run_id, log_callback=push_log_ws
                )
        except Exception as e:
            logger.error(f"Background evaluator benchmark crashed: {str(e)}")
        finally:
            await bg_engine.dispose()
            
    asyncio.create_task(_run())

@app.post("/api/benchmark/run", tags=["Benchmark"])
async def start_benchmark_run(payload: dict, db: AsyncSession = Depends(get_db)):
    run_name = payload.get("name", "Benchmark Evaluation")
    
    # 1. Rate Limiting Concurrency Lock
    # Check if a benchmark is already status running in database
    running_check = await db.execute(
        select(BenchmarkRun).where(BenchmarkRun.status == "running").limit(1)
    )
    if running_check.scalar() is not None:
        raise RAGException(
            message="Another evaluation process is already active. Please let the current benchmark finish to prevent CPU/database overload.",
            code="BENCHMARK_ALREADY_RUNNING",
            status_code=409
        )
        
    # Check if corpus chunks exist
    chunks_check = await db.execute(select(func.count()).select_from(Corpus))
    if chunks_check.scalar() == 0:
        raise RAGException(
            message="Corpus database is empty. You must Ingest the documents before running evaluations.",
            code="INGEST_REQUIRED",
            status_code=400
        )
        
    # 2. Pre-generate and insert run row so the frontend receives it instantly
    run_id = uuid.uuid4()
    run_obj = BenchmarkRun(
        id=run_id,
        name=run_name,
        status="running",
        config={
            "top_k": settings.top_k,
            "embedding_model": f"{settings.embedding_model} (384d)",
            "chunk_strategy": "FiQA Passages (57K document collection)",
            "index_type": "HNSW"
        }
    )
    db.add(run_obj)
    await db.commit()
    
    background_evaluator(run_id, run_name, settings.database_url)
    return {
        "message": "Benchmarking runner successfully launched.",
        "run_id": str(run_id)
    }

@app.get("/api/benchmark/history", tags=["Benchmark"])
async def get_benchmark_runs_history(db: AsyncSession = Depends(get_db)):
    try:
        res = await db.execute(
            select(BenchmarkRun).order_by(BenchmarkRun.created_at.desc())
        )
        runs = res.scalars().all()
        
        result_history = []
        for r in runs:
            metrics = r.config.get("metrics", {})
            result_history.append({
                "id": str(r.id),
                "name": r.name,
                "timestamp": r.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                "status": r.status,
                "corpusSize": 57638,
                "queryCount": 648,
                "embeddingModel": r.config.get("embedding_model", "BAAI/bge-small-en-v1.5"),
                "chunkStrategy": r.config.get("chunk_strategy", "Default"),
                "indexType": r.config.get("index_type", "HNSW"),
                "dense": metrics.get("dense", {}),
                "sparse": metrics.get("sparse", {}),
                "hybrid": metrics.get("hybrid", {})
            })
        return result_history
    except Exception as e:
        raise RAGException(
            message="Failed to load historical benchmark runs",
            code="HISTORY_LOAD_FAILED",
            detail=str(e)
        )

@app.get("/api/benchmark/{run_id}/metrics", tags=["Benchmark"])
async def get_benchmark_run_metrics(run_id: str, db: AsyncSession = Depends(get_db)):
    try:
        res = await db.execute(
            select(BenchmarkRun).where(BenchmarkRun.id == uuid.UUID(run_id))
        )
        run = res.scalar()
        if not run:
            raise RAGException("Benchmark run not found", "RUN_NOT_FOUND", status_code=404)
            
        metrics = run.config.get("metrics", {})
        return {
            "id": str(run.id),
            "name": run.name,
            "status": run.status,
            "dense": metrics.get("dense", {}),
            "sparse": metrics.get("sparse", {}),
            "hybrid": metrics.get("hybrid", {})
        }
    except Exception as e:
        raise RAGException(
            message="Failed to load metrics details",
            code="METRICS_LOAD_FAILED",
            detail=str(e)
        )

@app.get("/api/benchmark/{run_id}/status", tags=["Benchmark"])
async def get_benchmark_run_status(run_id: str, db: AsyncSession = Depends(get_db)):
    try:
        res = await db.execute(
            select(BenchmarkRun.status).where(BenchmarkRun.id == uuid.UUID(run_id))
        )
        status_val = res.scalar()
        if not status_val:
            raise RAGException("Benchmark run not found", "RUN_NOT_FOUND", status_code=404)
        return {"status": status_val}
    except RAGException:
        raise
    except Exception as e:
        raise RAGException(
            message="Failed to get benchmark status",
            code="STATUS_FETCH_FAILED",
            detail=str(e)
        )

# 7. WebSocket Live Logs Stream
@app.websocket("/api/logs/stream")
async def websocket_logs_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebSocket client connected to live logs stream.")
    try:
        while True:
            # Block waiting for items in log_queue
            log_line = await log_queue.get()
            await websocket.send_text(log_line)
            log_queue.task_done()
    except WebSocketDisconnect:
        logger.info("WebSocket logs stream client disconnected.")
    except Exception as e:
        logger.error(f"WebSocket logging crash: {str(e)}")
