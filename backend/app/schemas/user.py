"""
MacroMate – User Schemas (Pydantic)
Request/Response-Modelle für Registrierung, Login und User-Daten.
"""

from datetime import datetime
from pydantic import BaseModel, field_validator


# ── Request Schemas ──

class UserCreate(BaseModel):
    """Schema für die Registrierung."""
    username: str
    email: str
    password: str

    @field_validator("username")
    @classmethod
    def username_min_length(cls, v: str) -> str:
        if len(v.strip()) < 3:
            raise ValueError("Username muss mindestens 3 Zeichen lang sein")
        return v.strip()

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        """Einfache Passwort-Validierung – später erweiterbar."""
        if len(v) < 8:
            raise ValueError("Passwort muss mindestens 8 Zeichen lang sein")
        if not any(c.isupper() for c in v):
            raise ValueError("Passwort muss mindestens einen Großbuchstaben enthalten")
        if not any(c.isdigit() for c in v):
            raise ValueError("Passwort muss mindestens eine Zahl enthalten")
        return v


class UserLogin(BaseModel):
    """Schema für den Login."""
    username: str
    password: str


# ── Response Schemas ──

class UserResponse(BaseModel):
    """Öffentliche User-Daten (ohne Passwort!)."""
    id: int
    username: str
    email: str
    is_premium: bool = False
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """JWT-Token Response nach erfolgreichem Login."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
