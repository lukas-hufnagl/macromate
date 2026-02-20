"""
MacroMate – Recipe Model
Speichert Rezepte mit Nährwertangaben und Kategorie.
"""

from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship

from app.database import Base


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(String(1000), default="")
    instructions = Column(Text, default="")  # Zubereitungsanleitung
    category = Column(String(50), nullable=False)
    # Kategorien: "vegan", "vegetarisch", "fleisch", "fisch"
    meal_type = Column(String(50), nullable=False, default="hauptgericht")
    # Mahlzeittyp: "frühstück", "hauptgericht", "snack", "dessert"
    image_url = Column(String(500), default="")

    # ── Nährwerte pro Portion ──
    calories = Column(Float, nullable=False, default=0)
    protein = Column(Float, nullable=False, default=0)    # in Gramm
    fat = Column(Float, nullable=False, default=0)         # in Gramm
    carbs = Column(Float, nullable=False, default=0)       # in Gramm
    servings = Column(Integer, default=1)                   # Anzahl Portionen

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # ── Beziehungen ──
    owner = relationship("User", back_populates="recipes")
    ingredients = relationship("Ingredient", back_populates="recipe", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Recipe(id={self.id}, name='{self.name}', cal={self.calories})>"
