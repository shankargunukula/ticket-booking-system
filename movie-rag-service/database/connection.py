# database/connection.py
from sqlalchemy import create_engine, Column, Integer, String, Boolean, ForeignKey, text
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from pgvector.sqlalchemy import Vector  # Import native pgvector support for SQLAlchemy
from config import DATABASE_URL

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Movie(Base):
    __tablename__ = "movies"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, unique=True, index=True)
    plot_summary = Column(String)
    vibes = Column(String)
    is_playing = Column(Boolean, default=True)

    # 384 dimensions matches the local all-MiniLM-L6-v2 model shape
    embedding = Column(Vector(384))

    showtimes = relationship("Showtime", back_populates="movie")

class Showtime(Base):
    __tablename__ = "showtimes"
    id = Column(Integer, primary_key=True, index=True)
    movie_id = Column(Integer, ForeignKey("movies.id"))
    theater_name = Column(String)
    time_slot = Column(String)

    movie = relationship("Movie", back_populates="showtimes")

def init_db():
    # Ensure pgvector extension is enabled inside your PostgreSQL cluster
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        conn.commit()
    Base.metadata.create_all(bind=engine)
