import time
import uuid
import logging
from datetime import datetime
from sqlalchemy import select, update, func
from app.models import Query, BenchmarkRun, RetrievalResult
from app.retrieval.dense import dense_retrieve_ids
from app.retrieval.sparse import sparse_retrieve_ids
from app.retrieval.hybrid import hybrid_retrieve_ids
from app.ingestion.embedder import embed_texts
from app.evaluation.metrics import compute_all_metrics, reciprocal_rank
from app.config import settings

logger = logging.getLogger("evaluator")
logger.setLevel(logging.INFO)

STRATEGIES = ["dense", "sparse", "hybrid"]

async def run_evaluation_benchmark(
    session, 
    run_name: str = "RAG Evaluation Run", 
    run_id: Optional[uuid.UUID] = None, 
    log_callback=None
) -> uuid.UUID:
    """
    Orchestrates the evaluation benchmark. Runs all 648 golden queries across dense,
    sparse, and hybrid strategies, computes MRR@K/Recall@K, latency percentiles,
    and updates the BenchmarkRun with complete structured config metrics.
    """
    def log_msg(msg: str):
        logger.info(msg)
        if log_callback:
            # Pushes to WebSocket queue
            log_callback(msg)

    log_msg(f"⚡ [SYSTEM] Initializing RAG Benchmarking Runner for: '{run_name}'")
    
    # 1. Register or Load BenchmarkRun in database
    if run_id is None:
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
        session.add(run_obj)
        await session.commit()
    else:
        # Load pre-registered run
        res = await session.execute(select(BenchmarkRun).where(BenchmarkRun.id == run_id))
        run_obj = res.scalar()
        if not run_obj:
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
            session.add(run_obj)
            await session.commit()
            
    log_msg(f"📂 [DATABASE] Registered benchmark run ID: {run_id}")
    
    # 2. Load all queries
    log_msg("📂 [DATABASE] Loading golden test queries from database...")
    queries_res = await session.execute(select(Query))
    queries = queries_res.scalars().all()
    query_count = len(queries)
    log_msg(f"📖 [DATASET] Loaded {query_count} golden queries with relevance ground truth.")
    
    if query_count == 0:
        log_msg("❌ [ERROR] Golden queries table is empty. Please run ingestion first!")
        run_obj.status = "failed"
        run_obj.completed_at = func.now()
        await session.commit()
        raise ValueError("Queries database table is empty.")

    # 3. Process each query
    all_query_metrics = {s: [] for s in STRATEGIES}
    
    log_msg("🎯 [EVALUATION] Starting parallel query evaluations across all 3 strategies...")
    
    # Process queries sequentially with micro-logging to avoid clogging logs
    for idx, query in enumerate(queries, 1):
        # Embed query text
        emb = embed_texts([query.text])[0]
        
        # Ground truth answers list
        relevant_answers = query.relevant_doc_ids
        
        for strategy in STRATEGIES:
            t0 = time.perf_counter()
            
            # Execute retrieval based on strategy
            if strategy == "dense":
                retrieved = await dense_retrieve_ids(emb, settings.top_k, session)
            elif strategy == "sparse":
                # Sparse fallback is automatically handled inside sparse_retrieve_ids
                retrieved, fallback_applied, fallback_count = await sparse_retrieve_ids(
                    query.text, emb, settings.top_k, session
                )
            else:
                retrieved = await hybrid_retrieve_ids(
                    query.text, emb, settings.top_k, session
                )
                
            latency_ms = max(int((time.perf_counter() - t0) * 1000), 1)
            
            # Calculate query reciprocal rank
            rr = reciprocal_rank(retrieved, relevant_answers, settings.top_k)
            
            # Record result
            res_obj = RetrievalResult(
                run_id=run_id,
                query_id=query.query_id,
                strategy=strategy,
                retrieved_ids=retrieved,
                reciprocal_rank=rr,
                latency_ms=latency_ms
            )
            session.add(res_obj)
            
            # Save metrics in temporary list for aggregate computations
            all_query_metrics[strategy].append({
                "retrieved": retrieved,
                "relevant": relevant_answers,
                "latency_ms": latency_ms
            })
            
        # Commit every 50 queries to free session memory
        if idx % 50 == 0:
            await session.commit()
            log_msg(f"🎯 [EVALUATION] Benchmarked queries: {idx}/{query_count} ... processing in progress.")

    # Final commit for query runs
    await session.commit()
    
    # 4. Compute aggregates
    log_msg("📊 [EVALUATION] Benchmarking queries completed! Computing aggregate score profiles...")
    
    dense_aggregates = compute_all_metrics(all_query_metrics["dense"])
    sparse_aggregates = compute_all_metrics(all_query_metrics["sparse"])
    hybrid_aggregates = compute_all_metrics(all_query_metrics["hybrid"])
    
    log_msg(f"📈 [METRICS] DENSE:  MRR@10 = {dense_aggregates['mrr10']} | Avg Latency = {dense_aggregates['avgLatencyMs']}ms")
    log_msg(f"📈 [METRICS] SPARSE: MRR@10 = {sparse_aggregates['mrr10']} | Avg Latency = {sparse_aggregates['avgLatencyMs']}ms")
    log_msg(f"📈 [METRICS] HYBRID: MRR@10 = {hybrid_aggregates['mrr10']} | Avg Latency = {hybrid_aggregates['avgLatencyMs']}ms")

    # 5. Save aggregate metrics to BenchmarkRun configuration and set completed_at
    # Merge metrics directly inside config dict for clean frontend queries
    updated_config = dict(run_obj.config)
    updated_config["metrics"] = {
        "dense": dense_aggregates,
        "sparse": sparse_aggregates,
        "hybrid": hybrid_aggregates
    }
    
    # We must fetch the object again or merge changes to ensure persistence
    await session.execute(
        update(BenchmarkRun)
        .where(BenchmarkRun.id == run_id)
        .values(
            status="completed",
            config=updated_config,
            completed_at=func.now()
        )
    )
    await session.commit()
    
    log_msg(f"🏁 [SYSTEM] Benchmarking run finished. Run ID: {run_id}. Visualizing dashboards.")
    return run_id
