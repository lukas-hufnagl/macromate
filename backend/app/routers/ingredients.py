"""
MacroMate – Ingredients Router
Ingredient search via USDA FoodData Central.
Supports multilingual search based on app language setting.
"""

from fastapi import APIRouter, Query
from app.services.openfoodfacts import search_ingredients

router = APIRouter(prefix="/api/ingredients", tags=["Ingredients"])


@router.get("/search")
async def search_ingredient(
    q: str = Query(..., min_length=2, description="Search query for ingredient"),
    lang: str = Query("de", description="Language code (de, en, fr, es, it...)"),
    limit: int = Query(8, ge=1, le=20, description="Max results"),
):
    """
    Search for ingredients with nutrition data (per 100g).
    Uses USDA FoodData Central as the data source.
    """
    results = await search_ingredients(q, lang=lang, limit=limit)
    return {"results": results, "query": q, "lang": lang}
