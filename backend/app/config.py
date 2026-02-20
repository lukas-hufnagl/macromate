"""
MacroMate Backend – Konfiguration
Alle sicherheitsrelevanten Einstellungen werden hier zentral verwaltet.
"""

import secrets
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── Umgebung ──
    # "develop" | "test" | "production"  – steuert DB-Name, Logs, etc.
    APP_ENV: str = "develop"

    # ── Datenbank ──
    # Wird automatisch je nach APP_ENV gesetzt, kann aber überschrieben werden.
    DATABASE_URL: str = ""

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
        "http://localhost:5174",
    ]

    def model_post_init(self, __context: object) -> None:
        """Setzt DATABASE_URL automatisch anhand APP_ENV, falls nicht explizit gesetzt."""
        if not self.DATABASE_URL:
            db_map = {
                "develop": "sqlite:///./macromate_dev.db",
                "test": "sqlite:///./macromate_test.db",
                "production": "sqlite:///./macromate.db",
            }
            self.DATABASE_URL = db_map.get(self.APP_ENV, db_map["develop"])

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
