# agents/tools.py
import json
from langchain_core.tools import tool
from database.connection import get_movie_collection
from rag.embedder import get_embedding

@tool
def search_movie_by_vibe(semantic_query: str) -> str:
    """Useful when the user asks for movie recommendations based on vibes, feelings, plots, themes, or moods."""
    collection = get_movie_collection()
    query_vector = get_embedding(semantic_query)

    # Query ChromaDB using the pre-computed vector space
    results = collection.query(
        query_embeddings=[query_vector],
        n_results=1,
        where={"is_playing": True}
    )

    if not results or not results["metadatas"] or len(results["metadatas"][0]) == 0:
        return "No matching vibes currently available in theaters."

    # Safely extract values from the top result layer list array
    metadata = results["metadatas"][0][0]
    return f"Top Choice: '{metadata['title']}'. Description: {metadata['plot_summary']} Vibes: {metadata['vibes']}."

@tool
def check_theater_showtimes(movie_title: str) -> str:
    """Useful when the user explicitly requests specific timings, screens, or availability schedules for a concrete movie title."""
    collection = get_movie_collection()

    # Query all records from the database
    all_records = collection.get()

    if not all_records or not all_records["metadatas"]:
        return f"Sorry, '{movie_title}' is not playing right now."

    # Local substring lookup match implementation for text string matching
    target_metadata = None
    for meta in all_records["metadatas"]:
        if movie_title.lower() in meta.get("title", "").lower():
            target_metadata = meta
            break

    if not target_metadata:
        return f"Sorry, '{movie_title}' is not playing right now."

    raw_showtimes = target_metadata.get("showtimes")
    if not raw_showtimes:
        return f"'{target_metadata['title']}' is registered but has no scheduled showtimes today."

    showtimes_list = json.loads(raw_showtimes)
    schedule = [f"Theater: {s['theater_name']} at {s['time_slot']}" for s in showtimes_list]
    return f"Showtimes for '{target_metadata['title']}': " + " | ".join(schedule)
