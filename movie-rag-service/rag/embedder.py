# rag/embedder.py
import numpy as np
from sentence_transformers import SentenceTransformer
from config import LOCAL_EMBED_MODEL

print(f"Loading local embedding model: {LOCAL_EMBED_MODEL}...")
model = SentenceTransformer(LOCAL_EMBED_MODEL)

def get_embedding(text: str) -> list:
    """Generates a list of floats representing the local text embedding vector."""
    embedding = model.encode(text, convert_to_numpy=True)
    return embedding.tolist()

def compute_similarity(vector_a: list, vector_b: list) -> float:
    """Computes the cosine similarity score between two vector lists."""
    a = np.array(vector_a)
    b = np.array(vector_b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))
