"""
MacroMate Backend – Konfiguration
Alle sicherheitsrelevanten Einstellungen werden hier zentral verwaltet.
"""

import os
import secrets
import warnings
from pydantic import ConfigDict
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )
    # ── Umgebung ──
    # "develop" | "test" | "production"  – steuert DB-Name, Logs, etc.
    APP_ENV: str = "develop"

    # ── Datenbank (PostgreSQL) ──
    # Wird automatisch je nach APP_ENV gesetzt, kann aber überschrieben werden.
    DATABASE_URL: str = ""

    # ── JWT / Auth ──
    # In production MUSS ein fixer Key gesetzt werden!
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 Stunden

    # ── Lemon Squeezy ──
    LEMONSQUEEZY_API_KEY: str = ""
    LEMONSQUEEZY_STORE_ID: str = ""
    LEMONSQUEEZY_WEBHOOK_SECRET: str = ""
    LEMONSQUEEZY_VARIANT_MAP: str = ""  # JSON: {"variant_id": "plan_name"}

    # ── Premium ──
    PREMIUM_EMAILS: str = ""

    # ── CORS ──
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:5174",
    ]

    def model_post_init(self, __context: object) -> None:
        """Post-init: DB-URL + SECRET_KEY Defaults."""
        # ── DATABASE_URL ──
        if not self.DATABASE_URL:
            db_map = {
                "develop": "postgresql://macromate:macromate@localhost:5432/macromate_dev",
                "test": "postgresql://macromate:macromate@localhost:5432/macromate_test",
                "production": "postgresql://macromate:macromate@localhost:5432/macromate",
            }
            self.DATABASE_URL = db_map.get(self.APP_ENV, db_map["develop"])

        # ── SECRET_KEY ──
        if not self.SECRET_KEY:
            if self.APP_ENV == "production":
                raise ValueError(
                    "SECRET_KEY muss in production explizit gesetzt werden! "
                    "Generiere einen mit: python -c \"import secrets; print(secrets.token_urlsafe(64))\""
                )
            # In develop/test: auto-generieren, aber warnen
            self.SECRET_KEY = secrets.token_urlsafe(64)
            warnings.warn(
                "SECRET_KEY nicht gesetzt – verwende auto-generierten Key. "
                "JWTs werden nach Restart ungültig.",
                stacklevel=2,
            )

    @property
    def premium_email_list(self) -> list[str]:
        """Parsed PREMIUM_EMAILS Komma-getrennt zu einer Liste."""
        if not self.PREMIUM_EMAILS:
            return []
        return [e.strip() for e in self.PREMIUM_EMAILS.split(",") if e.strip()]


settings = Settings()
