# database/connection.py
import os
import chromadb
from config import CHROMA_PERSISTENT_PATH

# Ensure the directory path exists locally before running initialization hooks
os.makedirs(CHROMA_PERSISTENT_PATH, exist_ok=True)

# Global client persistent initialization
chroma_client = chromadb.PersistentClient(path=CHROMA_PERSISTENT_PATH)

def get_movie_collection():
    """Retrieves or creates the Chroma collection for movies."""
    return chroma_client.get_or_create_collection(
        name="movies_collection",
        metadata={"hnsw:space": "cosine"}
    )

def init_db():
    """Initializes the collection and ensures it is clear or accessible."""
    collection = get_movie_collection()
    print(f"Chroma DB successfully initialized at: {CHROMA_PERSISTENT_PATH}")
    return collection
