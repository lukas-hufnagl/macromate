"""Add allergies and diet_type columns to users table."""
from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS allergies JSON DEFAULT '[]'"))
    conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS diet_type VARCHAR(30) DEFAULT NULL"))
    conn.commit()
    print("Done – allergies & diet_type columns added.")
