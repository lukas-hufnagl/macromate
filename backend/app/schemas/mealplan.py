"""
MacroMate – MealPlan Schemas (Pydantic)
Request/Response-Modelle für Tagespläne und Mahlzeit-Einträge.
"""

from datetime import date, datetime
from pydantic import BaseModel

from app.schemas.recipe import RecipeResponse


# ── Request Schemas ──

class MacroGoals(BaseModel):
    """Makronährstoff-Ziele für die Plan-Generierung."""
    calories: float = 2000
    protein: float = 150    # Gramm
    fat: float = 65          # Gramm
    carbs: float = 250       # Gramm


class MealPlanGenerate(BaseModel):
    """Request um einen Tagesplan zu generieren."""
    date: date
    goals: MacroGoals
    categories: list[str] = []  # Filter: z.B. ["vegan", "vegetarisch"]


# ── Response Schemas ──

class MealPlanEntryResponse(BaseModel):
    id: int
    recipe_id: int
    recipe: RecipeResponse
    servings: float
    meal_slot: str
    # Berechnete Nährwerte (Rezept × Portionsfaktor)
    total_calories: float = 0
    total_protein: float = 0
    total_fat: float = 0
    total_carbs: float = 0

    model_config = {"from_attributes": True}


class MealPlanResponse(BaseModel):
    id: int
    date: date
    target_calories: float
    target_protein: float
    target_fat: float
    target_carbs: float
    entries: list[MealPlanEntryResponse] = []
    # Summen über alle Einträge
    actual_calories: float = 0
    actual_protein: float = 0
    actual_fat: float = 0
    actual_carbs: float = 0
    share_token: str | None = None
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class ShoppingListItem(BaseModel):
    """Ein Eintrag in der Einkaufsliste."""
    name: str
    total_quantity: float
    unit: str


class ShoppingListResponse(BaseModel):
    """Zusammengefasste Einkaufsliste für einen Zeitraum."""
    items: list[ShoppingListItem] = []
    start_date: date
    end_date: date
