# rag/indexer.py
import json
from database.connection import get_movie_collection, init_db
from rag.embedder import get_embedding

def seed_production_database():
    """Seeds the persistent Chroma collection with movie documents, vectors, and metadata."""
    init_db()
    collection = get_movie_collection()

    # Check if data already exists to prevent duplicate ingestion entries
    if collection.count() > 0:
        print("Chroma collection already contains entries. Skipping seed processing.")
        return

    # 1. Prepare raw inputs for vector calculation
    m1_text = "Title: Interstellar. Plot: Explorers travel through a wormhole in space to save humanity. Vibes: cosmic, mind-bending, space, emotional"
    m2_text = "Title: Paddington 2. Plot: A cozy bear gets framed for stealing a pop-up book. Vibes: cozy, heartwarming, comedy, family, feel-good"

    # Calculate embeddings
    m1_vector = get_embedding(m1_text)
    m2_vector = get_embedding(m2_text)

    # 2. Structure metadata and showtimes cleanly as flat dictionary attributes
    m1_metadata = {
        "title": "Interstellar",
        "plot_summary": "Explorers travel through a wormhole...",
        "vibes": "cosmic, mind-bending, space, emotional",
        "is_playing": True,
        "showtimes": json.dumps([{"theater_name": "Downtown IMAX", "time_slot": "08:00 PM"}])
    }

    m2_metadata = {
        "title": "Paddington 2",
        "plot_summary": "A cozy bear gets framed...",
        "vibes": "cozy, heartwarming, comedy, family, feel-good",
        "is_playing": True,
        "showtimes": json.dumps([{"theater_name": "Cinema West", "time_slot": "04:15 PM"}])
    }

    # 3. Batch add structural arrays natively to Chroma DB
    collection.add(
        ids=["movie_1", "movie_2"],
        embeddings=[m1_vector, m2_vector],
        metadatas=[m1_metadata, m2_metadata],
        documents=[m1_text, m2_text]
    )

    print("Production Chroma database initialization successful!")

def seed_database_and_vectors():
    """Wrapper function to align with the main entry point loop service initialization."""
    seed_production_database()
