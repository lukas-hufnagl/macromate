"""
MacroMate – User Model
Speichert Benutzerdaten, Profil und gehashtes Passwort.
"""

from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey, func, JSON
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    is_premium = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Profile / Onboarding
    gender = Column(String(10), nullable=True)  # male, female, other
    age = Column(Integer, nullable=True)
    height_cm = Column(Float, nullable=True)
    weight_kg = Column(Float, nullable=True)
    activity_level = Column(String(20), nullable=True)  # sedentary, light, moderate, active, very_active
    goal = Column(String(20), nullable=True)  # lose, maintain, gain
    onboarding_completed = Column(Boolean, default=False, nullable=False)

    # Allergies & dietary preferences (JSON array)
    allergies = Column(JSON, nullable=True, default=list)  # e.g. ["gluten", "laktose", "nüsse"]
    diet_type = Column(String(30), nullable=True)  # vegan, vegetarisch, pescetarisch, etc.

    # Household
    household_id = Column(Integer, ForeignKey("households.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    recipes = relationship("Recipe", back_populates="owner", cascade="all, delete-orphan")
    meal_plans = relationship("MealPlan", back_populates="owner", cascade="all, delete-orphan")
    subscription = relationship("Subscription", back_populates="user", uselist=False, cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    household = relationship("Household", back_populates="members", foreign_keys=[household_id])

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}')>"
