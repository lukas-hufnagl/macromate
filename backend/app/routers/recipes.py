"""
MacroMate – Recipes Router
CRUD-Endpoints für Rezepte.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.auth import get_current_user
from app.models.user import User
from app.models.recipe import Recipe
from app.models.ingredient import Ingredient
from app.schemas.recipe import RecipeCreate, RecipeUpdate, RecipeResponse
from app.services.builtin_recipes import get_builtin_recipes

router = APIRouter(prefix="/api/recipes", tags=["Recipes"])


@router.get("/discover")
def discover_recipes(
    category: str | None = Query(None),
    meal_type: str | None = Query(None),
    current_user: User = Depends(get_current_user),
):
    """Vordefinierte Rezepte zum Entdecken – gefiltert nach Allergien und Ernährung."""
    recipes = get_builtin_recipes()
    # Filter by user's allergies & diet
    user_allergies = current_user.allergies or []
    user_diet = current_user.diet_type

    from app.services.builtin_recipes import get_builtin_recipes_for_generation
    filtered = get_builtin_recipes_for_generation(
        categories=[category] if category else None,
        diet_type=user_diet if user_diet and user_diet != "keine" else None,
        allergies=user_allergies,
    )

    if meal_type:
        filtered = [r for r in filtered if r["meal_type"] == meal_type]

    return filtered


@router.get("/", response_model=list[RecipeResponse])
def get_recipes(
    category: str | None = Query(None, description="Filter nach Kategorie"),
    meal_type: str | None = Query(None, description="Filter nach Mahlzeittyp"),
    search: str | None = Query(None, description="Suche nach Name"),
    min_calories: float | None = Query(None, description="Min Kalorien pro Portion"),
    max_calories: float | None = Query(None, description="Max Kalorien pro Portion"),
    min_protein: float | None = Query(None, description="Min Protein pro Portion"),
    max_protein: float | None = Query(None, description="Max Protein pro Portion"),
    min_fat: float | None = Query(None, description="Min Fett pro Portion"),
    max_fat: float | None = Query(None, description="Max Fett pro Portion"),
    min_carbs: float | None = Query(None, description="Min Carbs pro Portion"),
    max_carbs: float | None = Query(None, description="Max Carbs pro Portion"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Alle Rezepte des eingeloggten Users abrufen.
    Filterbar nach Kategorie, Mahlzeittyp, Name und Makronährstoff-Bereichen.
    """
    query = db.query(Recipe).filter(Recipe.user_id == current_user.id)

    if category:
        query = query.filter(Recipe.category == category.lower())
    if meal_type:
        query = query.filter(Recipe.meal_type == meal_type.lower())
    if search:
        query = query.filter(Recipe.name.ilike(f"%{search}%"))

    # Makro-Filter
    if min_calories is not None:
        query = query.filter(Recipe.calories >= min_calories)
    if max_calories is not None:
        query = query.filter(Recipe.calories <= max_calories)
    if min_protein is not None:
        query = query.filter(Recipe.protein >= min_protein)
    if max_protein is not None:
        query = query.filter(Recipe.protein <= max_protein)
    if min_fat is not None:
        query = query.filter(Recipe.fat >= min_fat)
    if max_fat is not None:
        query = query.filter(Recipe.fat <= max_fat)
    if min_carbs is not None:
        query = query.filter(Recipe.carbs >= min_carbs)
    if max_carbs is not None:
        query = query.filter(Recipe.carbs <= max_carbs)

    return query.order_by(Recipe.created_at.desc()).all()


@router.get("/{recipe_id}", response_model=RecipeResponse)
def get_recipe(
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Einzelnes Rezept abrufen."""
    recipe = (
        db.query(Recipe)
        .filter(Recipe.id == recipe_id, Recipe.user_id == current_user.id)
        .first()
    )
    if not recipe:
        raise HTTPException(status_code=404, detail="Rezept nicht gefunden")
    return recipe


@router.post("/", response_model=RecipeResponse, status_code=status.HTTP_201_CREATED)
def create_recipe(
    data: RecipeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Neues Rezept erstellen.
    Enthält Basisinfos, Nährwerte und optionale Zutatenliste.
    """
    recipe = Recipe(
        user_id=current_user.id,
        name=data.name,
        description=data.description,
        instructions=data.instructions,
        category=data.category,
        meal_type=data.meal_type,
        image_url=data.image_url,
        calories=data.calories,
        protein=data.protein,
        fat=data.fat,
        carbs=data.carbs,
        servings=data.servings,
    )
    db.add(recipe)
    db.flush()  # ID generieren, damit Ingredients die recipe_id haben

    # Zutaten hinzufügen
    for ing_data in data.ingredients:
        ingredient = Ingredient(
            recipe_id=recipe.id,
            name=ing_data.name,
            quantity=ing_data.quantity,
            unit=ing_data.unit,
        )
        db.add(ingredient)

    db.commit()
    db.refresh(recipe)
    return recipe


@router.put("/{recipe_id}", response_model=RecipeResponse)
def update_recipe(
    recipe_id: int,
    data: RecipeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Rezept aktualisieren.
    Nur gesetzte Felder werden überschrieben (partielles Update).
    """
    recipe = (
        db.query(Recipe)
        .filter(Recipe.id == recipe_id, Recipe.user_id == current_user.id)
        .first()
    )
    if not recipe:
        raise HTTPException(status_code=404, detail="Rezept nicht gefunden")

    # Einfache Felder updaten
    update_data = data.model_dump(exclude_unset=True, exclude={"ingredients"})
    for key, value in update_data.items():
        setattr(recipe, key, value)

    # Wenn neue Zutaten mitgegeben wurden: alte löschen, neue erstellen
    if data.ingredients is not None:
        db.query(Ingredient).filter(Ingredient.recipe_id == recipe.id).delete()
        for ing_data in data.ingredients:
            ingredient = Ingredient(
                recipe_id=recipe.id,
                name=ing_data.name,
                quantity=ing_data.quantity,
                unit=ing_data.unit,
            )
            db.add(ingredient)

    db.commit()
    db.refresh(recipe)
    return recipe


@router.delete("/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recipe(
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Rezept löschen (inkl. zugehöriger Zutaten via Cascade)."""
    recipe = (
        db.query(Recipe)
        .filter(Recipe.id == recipe_id, Recipe.user_id == current_user.id)
        .first()
    )
    if not recipe:
        raise HTTPException(status_code=404, detail="Rezept nicht gefunden")

    db.delete(recipe)
    db.commit()
