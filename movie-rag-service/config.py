# config.py
import os

# Absolute path explicitly mapped to match container storage volumes
CHROMA_PERSISTENT_PATH = os.environ.get("CHROMA_PERSISTENT_PATH", "/app/chroma_db")

# Lightweight local embedding model
LOCAL_EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# Ollama local network resolving path address
OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://ollama-service:11434/v1")
LLM_MODEL_NAME = "llama3.2:1b"
