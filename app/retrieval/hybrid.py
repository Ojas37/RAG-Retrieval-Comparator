import logging
from app.retrieval.dense import dense_retrieve_ids, dense_retrieve_detailed
from app.retrieval.sparse import sparse_retrieve_ids, sparse_retrieve_detailed
from app.config import settings

logger = logging.getLogger("retrieval_hybrid")

async def hybrid_retrieve_ids(
    query_text: str,
    query_embedding: list[float],
    top_k: int,
    session,
    k: int = None
) -> list[str]:
    """
    RRF search returning unique doc_ids for evaluation runs.
    """
    try:
        rrf_k = k or settings.rrf_k
        fetch_limit = top_k * 3  # expand lookup pool for fusion candidates
        
        # 1. Fetch dense and sparse lists in parallel/sequence
        dense_ids = await dense_retrieve_ids(query_embedding, fetch_limit, session)
        sparse_ids, _, _ = await sparse_retrieve_ids(query_text, query_embedding, fetch_limit, session)
        
        # 2. RRF Fusion math
        scores = {}
        for rank, doc_id in enumerate(dense_ids, 1):
            scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (rrf_k + rank)
            
        for rank, doc_id in enumerate(sparse_ids, 1):
            scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (rrf_k + rank)
            
        # 3. Sort by aggregated score descending
        fused_ids = sorted(scores.keys(), key=lambda x: scores[x], reverse=True)
        return fused_ids[:top_k]
        
    except Exception as e:
        logger.error(f"Error in hybrid_retrieve_ids: {str(e)}")
        # Graceful fallback to dense IDs
        return await dense_retrieve_ids(query_embedding, top_k, session)


async def hybrid_retrieve_detailed(
    query_text: str,
    query_embedding: list[float],
    top_k: int,
    session,
    k: int = None
) -> list[dict]:
    """
    RRF search returning detailed metadata chunks for side-by-side comparison.
    """
    try:
        rrf_k = k or settings.rrf_k
        fetch_limit = top_k * 3
        
        # 1. Pull detailed blocks from sub-engines
        dense_chunks = await dense_retrieve_detailed(query_embedding, fetch_limit, session)
        sparse_res = await sparse_retrieve_detailed(query_text, query_embedding, fetch_limit, session)
        sparse_chunks = sparse_res["chunks"]
        
        # 2. Extract doc_ids and match scores
        # We index metadata so we don't query DB again
        chunk_lookup = {}
        dense_ranks = {}
        for rank, chunk in enumerate(dense_chunks, 1):
            doc_id = chunk["id"].replace("chunk-dense-", "")
            chunk_lookup[doc_id] = chunk
            dense_ranks[doc_id] = rank
            
        sparse_ranks = {}
        for rank, chunk in enumerate(sparse_chunks, 1):
            doc_id = chunk["id"].replace("chunk-sparse-", "").replace(" (fallback)", "")
            chunk_lookup[doc_id] = chunk
            sparse_ranks[doc_id] = rank

        # 3. RRF aggregation
        rrf_scores = {}
        all_ids = set(dense_ranks.keys()).union(set(sparse_ranks.keys()))
        
        for doc_id in all_ids:
            score = 0.0
            if doc_id in dense_ranks:
                score += 1.0 / (rrf_k + dense_ranks[doc_id])
            if doc_id in sparse_ranks:
                score += 1.0 / (rrf_k + sparse_ranks[doc_id])
            rrf_scores[doc_id] = score
            
        # 4. Sort and build merged structures
        sorted_ids = sorted(rrf_scores.keys(), key=lambda x: rrf_scores[x], reverse=True)
        top_ids = sorted_ids[:top_k]
        
        fused_chunks = []
        for rank, doc_id in enumerate(top_ids, 1):
            base_chunk = chunk_lookup[doc_id]
            
            # Form merged highlight keywords
            query_words = [
                w.strip().lower() 
                for w in query_text.replace("?", "").replace(",", "").split() 
                if len(w.strip()) > 3
            ]
            matched = []
            content_lower = base_chunk["content"].lower()
            for w in query_words:
                if w in content_lower and w not in matched:
                    matched.append(w)
                    
            fused_chunks.append({
                "id": f"chunk-hybrid-{doc_id}",
                "rank": rank,
                "score": round(float(rrf_scores[doc_id]), 5),
                "sourceDoc": f"FiQA_doc_{doc_id}",
                "chunkIndex": rank,
                "content": base_chunk["content"],
                "matchedTerms": matched
            })
            
        return fused_chunks
        
    except Exception as e:
        logger.error(f"Error in hybrid_retrieve_detailed: {str(e)}")
        # Complete fallback on error
        d_chunks = await dense_retrieve_detailed(query_embedding, top_k, session)
        for rank, c in enumerate(d_chunks, 1):
            c["id"] = c["id"].replace("chunk-dense-", "chunk-hybrid-")
            c["rank"] = rank
        return d_chunks
