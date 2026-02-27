"""
MacroMate – MealPlan Router
Endpoints für Tagesplan-Generierung, Abruf, Sharing und Einkaufsliste.
"""

import secrets
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_user
from app.models.user import User
from app.models.mealplan import MealPlan, MealPlanEntry
from app.models.recipe import Recipe
from app.schemas.mealplan import (
    MealPlanGenerate,
    MealPlanResponse,
    MealPlanEntryResponse,
    ShoppingListResponse,
    ShoppingListItem,
)
from app.services.mealplan_generator import generate_meal_plan
from app.services.builtin_recipes import get_builtin_recipes_for_generation

router = APIRouter(prefix="/api/mealplans", tags=["MealPlans"])


def _build_mealplan_response(meal_plan: MealPlan) -> MealPlanResponse:
    """Hilfsfunktion: MealPlan-DB-Objekt → Response mit berechneten Nährwerten."""
    entries = []
    total_cal = total_pro = total_fat = total_carbs = 0

    for entry in meal_plan.entries:
        recipe = entry.recipe
        factor = entry.servings / (recipe.servings or 1)

        e_cal = recipe.calories * factor
        e_pro = recipe.protein * factor
        e_fat = recipe.fat * factor
        e_carb = recipe.carbs * factor

        entries.append(
            MealPlanEntryResponse(
                id=entry.id,
                recipe_id=entry.recipe_id,
                recipe=recipe,
                servings=entry.servings,
                meal_slot=entry.meal_slot,
                total_calories=round(e_cal, 1),
                total_protein=round(e_pro, 1),
                total_fat=round(e_fat, 1),
                total_carbs=round(e_carb, 1),
            )
        )
        total_cal += e_cal
        total_pro += e_pro
        total_fat += e_fat
        total_carbs += e_carb

    return MealPlanResponse(
        id=meal_plan.id,
        date=meal_plan.date,
        target_calories=meal_plan.target_calories,
        target_protein=meal_plan.target_protein,
        target_fat=meal_plan.target_fat,
        target_carbs=meal_plan.target_carbs,
        entries=entries,
        actual_calories=round(total_cal, 1),
        actual_protein=round(total_pro, 1),
        actual_fat=round(total_fat, 1),
        actual_carbs=round(total_carbs, 1),
        created_at=meal_plan.created_at,
    )


@router.post("/generate", response_model=MealPlanResponse)
def generate_plan(
    data: MealPlanGenerate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generiert einen Tagesplan basierend auf Kalorien- und Makronährstoffzielen.
    - Holt alle Rezepte des Users (optional gefiltert nach Kategorie)
    - Falls der User keine eigenen Rezepte hat, nutzt built-in Rezepte
    - Nutzt den MealPlan-Generator-Service für die optimale Kombination
    - Speichert den Plan in der DB
    """
    # Rezepte des Users holen
    query = db.query(Recipe).filter(Recipe.user_id == current_user.id)
    if data.categories:
        query = query.filter(Recipe.category.in_(data.categories))
    user_recipes = query.all()

    use_builtin = len(user_recipes) == 0

    if use_builtin:
        # Use built-in recipes — create temporary Recipe-like objects
        user_allergies = current_user.allergies or []
        user_diet = current_user.diet_type
        builtin = get_builtin_recipes_for_generation(
            categories=data.categories,
            diet_type=user_diet,
            allergies=user_allergies,
        )
        if not builtin:
            raise HTTPException(status_code=400, detail="Keine passenden Rezepte für deine Ernährungspräferenzen gefunden.")

        # Save builtin recipes to DB for this user (so MealPlanEntry can reference them)
        recipes = []
        for br in builtin:
            recipe = Recipe(
                user_id=current_user.id,
                name=br["name"],
                description=br.get("description", ""),
                instructions=br.get("instructions", ""),
                category=br["category"],
                meal_type=br["meal_type"],
                calories=br["calories"],
                protein=br["protein"],
                fat=br["fat"],
                carbs=br["carbs"],
                servings=br["servings"],
            )
            db.add(recipe)
            recipes.append(recipe)
        db.flush()  # assign IDs
    else:
        recipes = user_recipes

    if not recipes:
        raise HTTPException(status_code=400, detail="Keine Rezepte vorhanden. Bitte erst Rezepte anlegen.")

    # No past meal plans
    if data.date < date.today():
        raise HTTPException(status_code=400, detail="Du kannst keine Essenspläne für die Vergangenheit erstellen.")

    # Bestehenden Plan für das Datum löschen
    existing = (
        db.query(MealPlan)
        .filter(MealPlan.user_id == current_user.id, MealPlan.date == data.date)
        .first()
    )
    if existing:
        db.delete(existing)
        db.flush()

    # MealPlan-Generator aufrufen
    selected = generate_meal_plan(recipes, data.goals)

    # Plan in DB speichern
    meal_plan = MealPlan(
        user_id=current_user.id,
        date=data.date,
        target_calories=data.goals.calories,
        target_protein=data.goals.protein,
        target_fat=data.goals.fat,
        target_carbs=data.goals.carbs,
    )
    db.add(meal_plan)
    db.flush()

    for item in selected:
        entry = MealPlanEntry(
            meal_plan_id=meal_plan.id,
            recipe_id=item["recipe_id"],
            servings=item["servings"],
            meal_slot=item["meal_slot"],
        )
        db.add(entry)

    db.commit()
    db.refresh(meal_plan)

    return _build_mealplan_response(meal_plan)


@router.get("/", response_model=list[MealPlanResponse])
def get_meal_plans(
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Alle Tagespläne des Users abrufen, optional nach Zeitraum gefiltert."""
    query = db.query(MealPlan).filter(MealPlan.user_id == current_user.id)

    if start_date:
        query = query.filter(MealPlan.date >= start_date)
    if end_date:
        query = query.filter(MealPlan.date <= end_date)

    plans = query.order_by(MealPlan.date.desc()).all()
    return [_build_mealplan_response(p) for p in plans]


@router.get("/{plan_id}", response_model=MealPlanResponse)
def get_meal_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Einzelnen Tagesplan abrufen."""
    plan = (
        db.query(MealPlan)
        .filter(MealPlan.id == plan_id, MealPlan.user_id == current_user.id)
        .first()
    )
    if not plan:
        raise HTTPException(status_code=404, detail="Tagesplan nicht gefunden")
    return _build_mealplan_response(plan)


@router.get("/shared/{share_token}", response_model=MealPlanResponse)
def get_shared_plan(
    share_token: str,
    db: Session = Depends(get_db),
):
    """Öffentlich geteilten Tagesplan anzeigen (kein Login nötig)."""
    plan = db.query(MealPlan).filter(MealPlan.share_token == share_token).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Geteilter Plan nicht gefunden oder Link ungültig.")
    return _build_mealplan_response(plan)


@router.post("/{plan_id}/share")
def share_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Plan teilen – generiert einen Share-Token und gibt die URL zurück."""
    plan = (
        db.query(MealPlan)
        .filter(MealPlan.id == plan_id, MealPlan.user_id == current_user.id)
        .first()
    )
    if not plan:
        raise HTTPException(status_code=404, detail="Tagesplan nicht gefunden")

    if not plan.share_token:
        plan.share_token = secrets.token_urlsafe(16)
        db.commit()
        db.refresh(plan)

    return {"share_token": plan.share_token}


@router.delete("/{plan_id}/share", status_code=204)
def unshare_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Plan-Sharing beenden – löscht den Share-Token."""
    plan = (
        db.query(MealPlan)
        .filter(MealPlan.id == plan_id, MealPlan.user_id == current_user.id)
        .first()
    )
    if not plan:
        raise HTTPException(status_code=404, detail="Tagesplan nicht gefunden")
    plan.share_token = None
    db.commit()


@router.delete("/{plan_id}", status_code=204)
def delete_meal_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Tagesplan löschen."""
    plan = (
        db.query(MealPlan)
        .filter(MealPlan.id == plan_id, MealPlan.user_id == current_user.id)
        .first()
    )
    if not plan:
        raise HTTPException(status_code=404, detail="Tagesplan nicht gefunden")
    db.delete(plan)
    db.commit()


@router.get("/shopping-list/", response_model=ShoppingListResponse)
def get_shopping_list(
    start_date: date = Query(..., description="Startdatum"),
    end_date: date = Query(..., description="Enddatum"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Einkaufsliste für einen Zeitraum generieren.
    Fasst alle Zutaten aller Mahlzeitenpläne im Zeitraum zusammen.
    """
    plans = (
        db.query(MealPlan)
        .filter(
            MealPlan.user_id == current_user.id,
            MealPlan.date >= start_date,
            MealPlan.date <= end_date,
        )
        .all()
    )

    # Zutaten aggregieren: Name+Unit als Key, Mengen summieren
    aggregated: dict[str, dict] = {}

    for plan in plans:
        for entry in plan.entries:
            recipe = entry.recipe
            factor = entry.servings / (recipe.servings or 1)

            for ingredient in recipe.ingredients:
                key = f"{ingredient.name.lower()}|{ingredient.unit.lower()}"
                if key in aggregated:
                    aggregated[key]["total_quantity"] += ingredient.quantity * factor
                else:
                    aggregated[key] = {
                        "name": ingredient.name,
                        "total_quantity": ingredient.quantity * factor,
                        "unit": ingredient.unit,
                    }

    items = [
        ShoppingListItem(
            name=v["name"],
            total_quantity=round(v["total_quantity"], 1),
            unit=v["unit"],
        )
        for v in sorted(aggregated.values(), key=lambda x: x["name"])
    ]

    return ShoppingListResponse(items=items, start_date=start_date, end_date=end_date)
