# agents/tools.py
from langchain_core.tools import tool
from database.connection import SessionLocal, Movie, Showtime
from rag.embedder import get_embedding

@tool
def search_movie_by_vibe(semantic_query: str) -> str:
    """Useful when the user asks for movie recommendations based on vibes, feelings, plots, themes, or moods."""
    db = SessionLocal()

    # Generate the vector representation of the query locally
    query_vector = get_embedding(semantic_query)

    # pgvector syntax: `<=>` computes Cosine Distance.
    # Sorting by low distance yields high similarity matches.
    result = (
        db.query(Movie)
        .filter(Movie.is_playing == True)
        .order_by(Movie.embedding.cosine_distance(query_vector))
        .first()
    )

    if not result:
        db.close()
        return "No matching vibes currently available in theaters."

    response = f"Top Choice: '{result.title}'. Description: {result.plot_summary} Vibes: {result.vibes}."
    db.close()
    return response

@tool
def check_theater_showtimes(movie_title: str) -> str:
    """Useful when the user explicitly requests specific timings, screens, or availability schedules for a concrete movie title."""
    db = SessionLocal()
    movie = db.query(Movie).filter(Movie.title.like(f"%{movie_title}%")).first()

    if not movie:
        db.close()
        return f"Sorry, '{movie_title}' is not playing right now."

    showtimes = db.query(Showtime).filter(Showtime.movie_id == movie.id).all()
    db.close()

    if not showtimes:
        return f"'{movie.title}' is registered but has no scheduled showtimes today."

    schedule = [f"Theater: {s.theater_name} at {s.time_slot}" for s in showtimes]
    return f"Showtimes for '{movie.title}': " + " | ".join(schedule)
