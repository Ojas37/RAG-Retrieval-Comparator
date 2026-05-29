import logging
from sentence_transformers import SentenceTransformer
from app.config import settings

logger = logging.getLogger("embedder")
logger.setLevel(logging.INFO)

# Global embedder variable to cache the loaded model in-memory
_model = None

def get_embedder_model() -> SentenceTransformer:
    global _model
    if _model is None:
        logger.info(f"Loading local embedding model: {settings.embedding_model} ...")
        # Loads BAAI/bge-small-en-v1.5 locally (downloads on first run, ~130MB)
        _model = SentenceTransformer(settings.embedding_model)
        logger.info("Model loaded successfully.")
    return _model

def embed_texts(texts: list[str]) -> list[list[float]]:
    """
    Generate 384-dimensional dense embeddings for a list of texts.
    Runs locally on CPU or GPU.
    """
    if not texts:
        return []
    
    model = get_embedder_model()
    # sentence-transformers encodes list[str] into a list/array of float vectors
    embeddings = model.encode(
        texts, 
        batch_size=32, 
        show_progress_bar=False, 
        convert_to_numpy=True
    )
    return embeddings.tolist()
