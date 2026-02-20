"""
MacroMate – Datenbank-Setup (SQLite + SQLAlchemy)
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

# ── Engine & Session ──
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},  # Nur für SQLite nötig
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ── Base-Klasse für alle Models ──
Base = declarative_base()


def get_db():
    """Dependency: liefert eine DB-Session pro Request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
