"""
MacroMate – Ingredient Model
Speichert einzelne Zutaten eines Rezepts.
"""

from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    name = Column(String(200), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)  # z.B. "g", "ml", "Stück", "EL", "TL"

    # ── Beziehung ──
    recipe = relationship("Recipe", back_populates="ingredients")

    def __repr__(self):
        return f"<Ingredient(id={self.id}, name='{self.name}', qty={self.quantity}{self.unit})>"
