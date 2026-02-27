"""
MacroMate – Favorites Router
Rezept-Favoriten verwalten.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models.favorite import Favorite
from app.models.recipe import Recipe
from app.models.user import User

router = APIRouter(prefix="/api/favorites", tags=["favorites"])


@router.get("/")
def get_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Gibt alle Favoriten-Recipe-IDs des Users zurück."""
    favs = db.query(Favorite.recipe_id).filter(
        Favorite.user_id == current_user.id
    ).all()
    return {"favorites": [f[0] for f in favs]}


@router.post("/{recipe_id}")
def add_favorite(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Fügt ein Rezept zu den Favoriten hinzu."""
    # Check recipe exists
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Rezept nicht gefunden")

    # Check not already favorited
    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.recipe_id == recipe_id,
    ).first()

    if existing:
        return {"status": "already_favorited", "recipe_id": recipe_id}

    fav = Favorite(user_id=current_user.id, recipe_id=recipe_id)
    db.add(fav)
    db.commit()

    return {"status": "favorited", "recipe_id": recipe_id}


@router.delete("/{recipe_id}")
def remove_favorite(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Entfernt ein Rezept aus den Favoriten."""
    fav = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.recipe_id == recipe_id,
    ).first()

    if not fav:
        raise HTTPException(status_code=404, detail="Favorit nicht gefunden")

    db.delete(fav)
    db.commit()

    return {"status": "unfavorited", "recipe_id": recipe_id}
