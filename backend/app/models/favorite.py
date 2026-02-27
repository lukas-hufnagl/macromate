"""
MacroMate – Favorite Model
Speichert User-Favoriten für Rezepte.
"""

from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint, func
from sqlalchemy.orm import relationship

from app.database import Base


class Favorite(Base):
    __tablename__ = "favorites"
    __table_args__ = (
        UniqueConstraint("user_id", "recipe_id", name="uq_user_recipe_favorite"),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Beziehungen
    user = relationship("User", back_populates="favorites")
    recipe = relationship("Recipe")

    def __repr__(self):
        return f"<Favorite(user_id={self.user_id}, recipe_id={self.recipe_id})>"
