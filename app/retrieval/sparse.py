import logging
from sqlalchemy import text
from app.retrieval.dense import dense_retrieve_ids, dense_retrieve_detailed

logger = logging.getLogger("retrieval_sparse")

async def sparse_retrieve_ids(
    query_text: str, 
    query_embedding: list[float], 
    top_k: int, 
    session
) -> tuple[list[str], bool, int]:
    """
    Retrieves unique doc_ids. If full-text search returns < top_k results,
    it falls back to dense vector search to fill the remaining slots.
    Returns: (list_of_doc_ids, fallback_applied, fallback_count)
    """
    try:
        # 1. Sparse lookup
        result = await session.execute(
            text("""
                SELECT doc_id
                FROM corpus
                WHERE ts @@ plainto_tsquery('english', :q)
                ORDER BY ts_rank(ts, plainto_tsquery('english', :q)) DESC
                LIMIT :k
            """),
            {"q": query_text, "k": top_k}
        )
        sparse_ids = [row.doc_id for row in result]
        
        sparse_count = len(sparse_ids)
        if sparse_count >= top_k:
            return sparse_ids, False, 0
            
        # 2. Fallback to dense if we have fewer results than top_k
        logger.info(f"Sparse search returned {sparse_count}/{top_k} results. Triggering dense fallback.")
        fallback_needed = top_k - sparse_count
        
        # Pull enough dense elements to ensure duplicates are filtered
        dense_ids = await dense_retrieve_ids(query_embedding, top_k * 2, session)
        
        fallback_ids = []
        sparse_set = set(sparse_ids)
        
        for d_id in dense_ids:
            if d_id not in sparse_set:
                fallback_ids.append(d_id)
                if len(fallback_ids) >= fallback_needed:
                    break
        
        merged_ids = sparse_ids + fallback_ids
        return merged_ids, True, len(fallback_ids)
        
    except Exception as e:
        logger.error(f"Error in sparse_retrieve_ids: {str(e)}")
        # Complete fallback on error
        dense_ids = await dense_retrieve_ids(query_embedding, top_k, session)
        return dense_ids, True, len(dense_ids)


async def sparse_retrieve_detailed(
    query_text: str, 
    query_embedding: list[float], 
    top_k: int, 
    session
) -> dict:
    """
    Retrieves detailed results for side-by-side search explorer comparison.
    Extracts matches for high-fidelity keyword highlighting.
    Returns: { "chunks": [...], "fallback_applied": bool, "fallback_count": int }
    """
    try:
        # 1. Sparse query
        result = await session.execute(
            text("""
                SELECT doc_id, content, ts_rank(ts, plainto_tsquery('english', :q)) AS rank_score
                FROM corpus
                WHERE ts @@ plainto_tsquery('english', :q)
                ORDER BY ts_rank(ts, plainto_tsquery('english', :q)) DESC
                LIMIT :k
            """),
            {"q": query_text, "k": top_k}
        )
        
        # Build keyword matcher set for front-end highlighting
        query_words = [
            w.strip().lower() 
            for w in query_text.replace("?", "").replace(",", "").split() 
            if len(w.strip()) > 3
        ]
        
        chunks = []
        sparse_ids = []
        for rank, row in enumerate(result, 1):
            sparse_ids.append(row.doc_id)
            
            # Find which terms matched in content
            matched = []
            content_lower = row.content.lower()
            for w in query_words:
                if w in content_lower and w not in matched:
                    matched.append(w)
            
            chunks.append({
                "id": f"chunk-sparse-{row.doc_id}",
                "rank": rank,
                "score": round(float(row.rank_score), 4),
                "sourceDoc": f"FiQA_doc_{row.doc_id}",
                "chunkIndex": rank,
                "content": row.content,
                "matchedTerms": matched
            })
            
        sparse_count = len(chunks)
        if sparse_count >= top_k:
            return {
                "chunks": chunks,
                "fallback_applied": False,
                "fallback_count": 0
            }
            
        # 2. Dense fallback for detail slots
        fallback_needed = top_k - sparse_count
        dense_chunks = await dense_retrieve_detailed(query_embedding, top_k * 2, session)
        
        sparse_set = set(sparse_ids)
        fallback_count = 0
        
        for d_chunk in dense_chunks:
            # Extract doc_id from chunk-dense-ID string
            doc_id = d_chunk["id"].replace("chunk-dense-", "")
            if doc_id not in sparse_set:
                fallback_count += 1
                
                # Adapting rank, ID and custom score to merge with sparse
                merged_rank = sparse_count + fallback_count
                d_chunk["id"] = f"chunk-sparse-{doc_id} (fallback)"
                d_chunk["rank"] = merged_rank
                d_chunk["score"] = d_chunk["score"]  # Keep cosine score
                
                # Populate matched terms if any lexical overlap happens
                matched = []
                content_lower = d_chunk["content"].lower()
                for w in query_words:
                    if w in content_lower and w not in matched:
                        matched.append(w)
                d_chunk["matchedTerms"] = matched
                
                chunks.append(d_chunk)
                if fallback_count >= fallback_needed:
                    break
                    
        return {
            "chunks": chunks,
            "fallback_applied": True,
            "fallback_count": fallback_count
        }
        
    except Exception as e:
        logger.error(f"Error in sparse_retrieve_detailed: {str(e)}")
        # Complete fallback on error
        d_chunks = await dense_retrieve_detailed(query_embedding, top_k, session)
        for i, c in enumerate(d_chunks, 1):
            c["id"] = c["id"].replace("chunk-dense-", "chunk-sparse-") + " (fallback)"
        return {
            "chunks": d_chunks,
            "fallback_applied": True,
            "fallback_count": len(d_chunks)
        }
