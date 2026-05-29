import asyncio
import logging
from datasets import load_dataset
from tqdm import tqdm
from sqlalchemy import text
from sqlalchemy.dialects.postgresql import insert
from app.db import async_session
from app.models import Corpus, Query
from app.ingestion.embedder import embed_texts

logger = logging.getLogger("ingestion")
logger.setLevel(logging.INFO)

BATCH_SIZE = 256

async def run_ingestion_pipeline(session, log_callback=None):
    def log_msg(msg: str):
        logger.info(msg)
        if log_callback:
            log_callback(msg)

    log_msg("Starting FiQA Ingestion Pipeline...")
    
    # 1. Load dataset from Hugging Face
    log_msg("Downloading FiQA dataset from Hugging Face (BeIR/fiqa)...")
    try:
        corpus_ds = load_dataset("BeIR/fiqa", "corpus")["corpus"]
        queries_ds = load_dataset("BeIR/fiqa", "queries")["queries"]
        qrels_ds = load_dataset("BeIR/fiqa-qrels")["validation"]
    except Exception as e:
        log_msg(f"ERROR downloading dataset: {str(e)}")
        raise e
        
    log_msg(f"Loaded {len(corpus_ds)} passages and {len(queries_ds)} queries.")

    # 2. Build ground truth map (query-id -> corpus-ids)
    log_msg("Compiling gold relevance ground truth map...")
    ground_truth = {}
    for row in qrels_ds:
        qid = str(row["query-id"])
        did = str(row["corpus-id"])
        ground_truth.setdefault(qid, []).append(did)
    
    log_msg(f"Relevance answer key mapped for {len(ground_truth)} golden queries.")

    # 3. Batch embed corpus passages and insert idempotently
    log_msg(f"Generating BGE embeddings and inserting {len(corpus_ds)} corpus passages...")
    docs = list(corpus_ds)
    
    # Keep track of records written
    inserted_count = 0
    
    for i in range(0, len(docs), BATCH_SIZE):
        batch = docs[i : i + BATCH_SIZE]
        texts = [d["text"] for d in batch]
        
        # Local BGE embedding
        embeddings = embed_texts(texts)
        
        # Batch insert with ON CONFLICT DO NOTHING
        async with session.begin_nested():
            for doc, emb in zip(batch, embeddings):
                doc_id = str(doc["_id"])
                content = doc["text"]
                token_count = len(content.split())
                
                stmt = insert(Corpus).values(
                    doc_id=doc_id,
                    content=content,
                    embedding=emb,
                    token_count=token_count
                ).on_conflict_do_nothing(index_elements=["doc_id"])
                
                res = await session.execute(stmt)
                if res.rowcount > 0:
                    inserted_count += 1
            
            await session.commit()
            
        if (i // BATCH_SIZE) % 10 == 0 or i + BATCH_SIZE >= len(docs):
            log_msg(f"Processed chunks: {min(i + BATCH_SIZE, len(docs))}/{len(docs)} [Idempotent unique inserts: {inserted_count}]")

    # 4. Ingest golden queries with ON CONFLICT DO NOTHING
    log_msg("Ingesting golden queries into queries table...")
    queries_list = list(queries_ds)
    queries_inserted = 0
    
    async with session.begin_nested():
        for q in queries_list:
            qid = str(q["_id"])
            if qid not in ground_truth:
                continue
            
            stmt = insert(Query).values(
                query_id=qid,
                text=q["text"],
                relevant_doc_ids=ground_truth[qid]
            ).on_conflict_do_nothing(index_elements=["query_id"])
            
            res = await session.execute(stmt)
            if res.rowcount > 0:
                queries_inserted += 1
        
        await session.commit()
    
    log_msg(f"Golden query sets successfully synced: {queries_inserted} unique entries loaded.")
    log_msg("✅ FiQA Ingestion Pipeline completed successfully!")

async def main():
    async with async_session() as session:
        await run_ingestion_pipeline(session)

if __name__ == "__main__":
    # Custom logger for CLI running
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
    asyncio.run(main())
