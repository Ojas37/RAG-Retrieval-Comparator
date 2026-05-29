import logging
import numpy as np
from sqlalchemy import text
from sklearn.decomposition import PCA

logger = logging.getLogger("visualizer")
logger.setLevel(logging.INFO)

# Global cached PCA transformer
fitted_pca = None

async def fit_cached_pca(session) -> bool:
    """
    Query 1000 representative embeddings from PostgreSQL and fit a global PCA model.
    Caches the fitted PCA model in-memory.
    """
    global fitted_pca
    try:
        logger.info("Initializing global PCA fit on representative corpus embeddings...")
        
        # Pull 1,000 document vectors (limit to BGE-small 384d dimensions)
        result = await session.execute(
            text("SELECT embedding FROM corpus LIMIT 1000")
        )
        
        embeddings = []
        for row in result:
            # pgvector Vector column comes back as a list of floats or numpy array
            emb = row.embedding
            if isinstance(emb, str):
                # clean bracket string
                emb = [float(x) for x in emb.replace("[", "").replace("]", "").split(",")]
            embeddings.append(emb)
            
        vector_count = len(embeddings)
        if vector_count < 10:
            logger.warning(f"Corpus too small ({vector_count} documents) to fit PCA. Delaying fit.")
            fitted_pca = None
            return False
            
        matrix = np.array(embeddings)
        # We need n_components=2 to plot on a 2D Cartesian chart
        pca = PCA(n_components=2)
        pca.fit(matrix)
        
        fitted_pca = pca
        logger.info(f"PCA fit succeeded on matrix shape {matrix.shape}. Cached fitted model.")
        return True
        
    except Exception as e:
        logger.error(f"Error fitting PCA: {str(e)}")
        fitted_pca = None
        return False

def project_embeddings(
    query_vector: list[float], 
    doc_vectors: list[list[float]], 
    labels: list[str], 
    strategies: list[str],
    scores: list[float]
) -> list[dict]:
    """
    Transforms the 384d vectors down to 2d coordinates using the cached PCA model.
    Returns: list of dicts: [ { "x": float, "y": float, "label": str, "strategy": str, "score": float } ]
    """
    global fitted_pca
    
    # 1. Combine all vectors
    all_vectors = [query_vector] + doc_vectors
    matrix = np.array(all_vectors)  # shape (1 + N, 384)
    
    # 2. Check if PCA is loaded, otherwise use direct linear mapping fallback (so it never crashes)
    if fitted_pca is None:
        logger.warning("PCA not yet fitted. Using first 2 vector coordinates for fallback linear rendering.")
        # fallback: project first two dimensions, scale for cartesian bounds
        projected = matrix[:, :2]
        # normalize to reasonable chart bounds (e.g. 0 to 100)
        projected = (projected - np.min(projected)) / (np.max(projected) - np.min(projected) + 1e-5) * 80 + 10
    else:
        try:
            # Fast in-memory transform (no refitting!)
            projected_raw = fitted_pca.transform(matrix)
            
            # Re-scale values between nice visual limits (e.g. 10 to 90) for beautiful charting
            x_min, x_max = np.min(projected_raw[:, 0]), np.max(projected_raw[:, 0])
            y_min, y_max = np.min(projected_raw[:, 1]), np.max(projected_raw[:, 1])
            
            x_range = x_max - x_min if x_max != x_min else 1.0
            y_range = y_max - y_min if y_max != y_min else 1.0
            
            projected = np.zeros_like(projected_raw)
            projected[:, 0] = ((projected_raw[:, 0] - x_min) / x_range) * 70 + 15
            projected[:, 1] = ((projected_raw[:, 1] - y_min) / y_range) * 70 + 15
            
        except Exception as e:
            logger.error(f"Error projecting with PCA, using linear fallback: {str(e)}")
            projected = matrix[:, :2]
            projected = (projected - np.min(projected)) / (np.max(projected) - np.min(projected) + 1e-5) * 80 + 10

    # 3. Compile output structures
    points = []
    
    # Query is point #0
    points.append({
        "x": round(float(projected[0, 0]), 2),
        "y": round(float(projected[0, 1]), 2),
        "label": "Query Vector",
        "strategy": "query",
        "score": 1.0
    })
    
    # Retrieved documents are points 1 to N
    for idx, doc_coord in enumerate(projected[1:], 0):
        points.append({
            "x": round(float(doc_coord[0]), 2),
            "y": round(float(doc_coord[1]), 2),
            "label": labels[idx],
            "strategy": strategies[idx],
            "score": round(float(scores[idx]), 3)
        })
        
    return points
