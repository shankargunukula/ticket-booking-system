# rag/indexer.py
from database.connection import SessionLocal, Movie, Showtime, init_db
from rag.embedder import get_embedding

def seed_production_database():
    """Seeds the production DB with text data and native vector field inputs."""
    init_db()
    db = SessionLocal()

    if db.query(Movie).count() > 0:
        db.close()
        return

    # 1. Prepare raw inputs
    m1_text = "Title: Interstellar. Plot: Explorers travel through a wormhole in space to save humanity. Vibes: cosmic, mind-bending, space, emotional"
    m2_text = "Title: Paddington 2. Plot: A cozy bear gets framed for stealing a pop-up book. Vibes: cozy, heartwarming, comedy, family, feel-good"

    # 2. Add records along with their vector arrays directly
    m1 = Movie(
        title="Interstellar",
        plot_summary="Explorers travel through a wormhole...",
        vibes="cosmic, mind-bending, space, emotional",
        embedding=get_embedding(m1_text) # Injected array
    )
    m2 = Movie(
        title="Paddington 2",
        plot_summary="A cozy bear gets framed...",
        vibes="cozy, heartwarming, comedy, family, feel-good",
        embedding=get_embedding(m2_text)
    )

    db.add_all([m1, m2])
    db.commit()

    s1 = Showtime(movie_id=m1.id, theater_name="Downtown IMAX", time_slot="08:00 PM")
    s2 = Showtime(movie_id=m2.id, theater_name="Cinema West", time_slot="04:15 PM")

    db.add_all([s1, s2])
    db.commit()
    db.close()
    print("Production pgvector database initialization successful!")
