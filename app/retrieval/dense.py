import logging
from sqlalchemy import text

logger = logging.getLogger("retrieval_dense")

async def dense_retrieve_ids(query_embedding: list[float], top_k: int, session) -> list[str]:
    """
    Retrieves just the unique doc_ids (fast mode, used in benchmarking evaluations).
    """
    try:
        result = await session.execute(
            text("""
                SELECT doc_id
                FROM corpus
                ORDER BY embedding <-> CAST(:emb AS vector)
                LIMIT :k
            """),
            {"emb": str(query_embedding), "k": top_k}
        )
        return [row.doc_id for row in result]
    except Exception as e:
        logger.error(f"Error in dense_retrieve_ids: {str(e)}")
        return []

async def dense_retrieve_detailed(query_embedding: list[float], top_k: int, session) -> list[dict]:
    """
    Retrieves complete chunk metadata and content including cosine similarity scores
    (detailed mode, used in search query exploration).
    Cosine Similarity = 1.0 - Cosine Distance
    """
    try:
        result = await session.execute(
            text("""
                SELECT doc_id, content, token_count,
                       1.0 - (embedding <-> CAST(:emb AS vector)) AS similarity_score
                FROM corpus
                ORDER BY embedding <-> CAST(:emb AS vector)
                LIMIT :k
            """),
            {"emb": str(query_embedding), "k": top_k}
        )
        
        chunks = []
        for rank, row in enumerate(result, 1):
            chunks.append({
                "id": f"chunk-dense-{row.doc_id}",
                "rank": rank,
                "score": round(float(row.similarity_score), 4),
                "sourceDoc": f"FiQA_doc_{row.doc_id}",
                "chunkIndex": rank,  # simple proxy for index
                "content": row.content,
                # For dense, we don't have matching keywords, we can display top high TF-IDF terms or empty
                "matchedTerms": [] 
            })
        return chunks
    except Exception as e:
        logger.error(f"Error in dense_retrieve_detailed: {str(e)}")
        return []
