"""
MacroMate Backend – Konfiguration
Alle sicherheitsrelevanten Einstellungen werden hier zentral verwaltet.
"""

import secrets
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── Datenbank ──
    DATABASE_URL: str = "sqlite:///./macromate.db"

    # ── JWT / Auth ──
    # Secret Key – in Produktion über Umgebungsvariable setzen!
    SECRET_KEY: str = secrets.token_urlsafe(64)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 Stunden

    # ── AI / APIs ──
    GEMINI_API_KEY: str = ""

    # ── CORS ──
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
