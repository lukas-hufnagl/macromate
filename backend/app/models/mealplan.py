"""
MacroMate – MealPlan Model
Speichert generierte Tagespläne mit Rezept-Zuordnungen.
"""

from sqlalchemy import Column, Integer, Float, String, ForeignKey, Date, DateTime, func
from sqlalchemy.orm import relationship

from app.database import Base


class MealPlan(Base):
    __tablename__ = "meal_plans"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)

    # ── Zielwerte für diesen Tag ──
    target_calories = Column(Float, default=2000)
    target_protein = Column(Float, default=150)
    target_fat = Column(Float, default=65)
    target_carbs = Column(Float, default=250)

    # ── Sharing ──
    share_token = Column(String(32), unique=True, nullable=True, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # ── Beziehungen ──
    owner = relationship("User", back_populates="meal_plans")
    entries = relationship("MealPlanEntry", back_populates="meal_plan", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<MealPlan(id={self.id}, date={self.date})>"


class MealPlanEntry(Base):
    """Einzelner Eintrag in einem Tagesplan (ein Rezept mit Portionsangabe)."""
    __tablename__ = "meal_plan_entries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    meal_plan_id = Column(Integer, ForeignKey("meal_plans.id"), nullable=False)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    servings = Column(Float, default=1.0)  # Portionsfaktor (z.B. 0.5 = halbe Portion)
    meal_slot = Column(String(50), default="hauptgericht")
    # meal_slot: "frühstück", "mittagessen", "abendessen", "snack"

    # ── Beziehungen ──
    meal_plan = relationship("MealPlan", back_populates="entries")
    recipe = relationship("Recipe")

    def __repr__(self):
        return f"<MealPlanEntry(recipe_id={self.recipe_id}, servings={self.servings})>"
