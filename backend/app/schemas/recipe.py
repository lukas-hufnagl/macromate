"""
MacroMate – Recipe & Ingredient Schemas (Pydantic)
Request/Response-Modelle für Rezepte und Zutaten.
"""

from datetime import datetime
from pydantic import BaseModel, field_validator


# ── Ingredient Schemas ──

class IngredientBase(BaseModel):
    name: str
    quantity: float
    unit: str  # "g", "ml", "Stück", "EL", "TL"


class IngredientCreate(IngredientBase):
    pass


class IngredientResponse(IngredientBase):
    id: int

    model_config = {"from_attributes": True}


# ── Recipe Schemas ──

VALID_CATEGORIES = ["vegan", "vegetarisch", "fleisch", "fisch"]
VALID_MEAL_TYPES = ["frühstück", "hauptgericht", "snack", "dessert"]


class RecipeBase(BaseModel):
    name: str
    description: str = ""
    instructions: str = ""
    category: str
    meal_type: str = "hauptgericht"
    image_url: str = ""
    calories: float = 0
    protein: float = 0
    fat: float = 0
    carbs: float = 0
    servings: int = 1

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        v = v.lower().strip()
        if v not in VALID_CATEGORIES:
            raise ValueError(f"Kategorie muss eine von {VALID_CATEGORIES} sein")
        return v

    @field_validator("meal_type")
    @classmethod
    def validate_meal_type(cls, v: str) -> str:
        v = v.lower().strip()
        if v not in VALID_MEAL_TYPES:
            raise ValueError(f"Mahlzeittyp muss einer von {VALID_MEAL_TYPES} sein")
        return v


class RecipeCreate(RecipeBase):
    ingredients: list[IngredientCreate] = []


class RecipeUpdate(BaseModel):
    """Alle Felder optional für partielle Updates."""
    name: str | None = None
    description: str | None = None
    instructions: str | None = None
    category: str | None = None
    meal_type: str | None = None
    image_url: str | None = None
    calories: float | None = None
    protein: float | None = None
    fat: float | None = None
    carbs: float | None = None
    servings: int | None = None
    ingredients: list[IngredientCreate] | None = None


class RecipeResponse(RecipeBase):
    id: int
    user_id: int
    ingredients: list[IngredientResponse] = []
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}
