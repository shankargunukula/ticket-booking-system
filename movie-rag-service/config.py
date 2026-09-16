# config.py
import os

# Update to your production PostgreSQL connection string
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://username:password@localhost:5432/movie_production_db")

LOCAL_EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# LLM Configurations (Replace with your actual API key and endpoint)
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
LLM_MODEL_NAME = "gpt-4o"  # Or local endpoints like "llama3" via Ollama
