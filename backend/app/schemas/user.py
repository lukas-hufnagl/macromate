"""
MacroMate – User Schemas (Pydantic)
Request/Response-Modelle für Registrierung, Login, Profil und User-Daten.
"""

from datetime import datetime
from pydantic import BaseModel, field_validator


# ── Request Schemas ──

class UserCreate(BaseModel):
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
        if len(v) < 8:
            raise ValueError("Passwort muss mindestens 8 Zeichen lang sein")
        if not any(c.isupper() for c in v):
            raise ValueError("Passwort muss mindestens einen Großbuchstaben enthalten")
        if not any(c.isdigit() for c in v):
            raise ValueError("Passwort muss mindestens eine Zahl enthalten")
        return v


class UserLogin(BaseModel):
    username: str
    password: str


class ProfileUpdate(BaseModel):
    gender: str | None = None
    age: int | None = None
    height_cm: float | None = None
    weight_kg: float | None = None
    activity_level: str | None = None
    goal: str | None = None
    allergies: list[str] | None = None
    diet_type: str | None = None

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, v):
        if v and v not in ("male", "female", "other"):
            raise ValueError("gender must be male, female, or other")
        return v

    @field_validator("activity_level")
    @classmethod
    def validate_activity(cls, v):
        valid = ("sedentary", "light", "moderate", "active", "very_active")
        if v and v not in valid:
            raise ValueError(f"activity_level must be one of {valid}")
        return v

    @field_validator("goal")
    @classmethod
    def validate_goal(cls, v):
        if v and v not in ("lose", "maintain", "gain"):
            raise ValueError("goal must be lose, maintain, or gain")
        return v

    @field_validator("diet_type")
    @classmethod
    def validate_diet_type(cls, v):
        valid = (None, "", "vegan", "vegetarisch", "pescetarisch", "keto", "paleo", "keine")
        if v and v not in valid:
            raise ValueError(f"diet_type must be one of {valid}")
        return v


# ── Response Schemas ──

class ProfileResponse(BaseModel):
    gender: str | None = None
    age: int | None = None
    height_cm: float | None = None
    weight_kg: float | None = None
    activity_level: str | None = None
    goal: str | None = None
    allergies: list[str] = []
    diet_type: str | None = None
    onboarding_completed: bool = False

    model_config = {"from_attributes": True}


class TDEEResponse(BaseModel):
    bmr: float
    tdee: float
    target_calories: int
    protein_g: int
    fat_g: int
    carbs_g: int
    goal: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_premium: bool = False
    plan: str = "free"
    onboarding_completed: bool = False
    household_id: int | None = None
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
