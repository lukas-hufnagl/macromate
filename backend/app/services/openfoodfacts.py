"""
MacroMate – Ingredient Search Service
Two-tier search:
  1. Local German DB (instant, ~200+ common ingredients)
  2. OpenFoodFacts (API fallback, free, good EU coverage)
Results are cached in-memory.
"""

import time
import httpx

from app.services.local_ingredients import search_local_ingredients

OFF_SEARCH_URL = "https://world.openfoodfacts.org/cgi/search.pl"

# ── In-Memory Cache ──
_cache: dict[tuple[str, str], tuple[float, list[dict]]] = {}
CACHE_TTL = 3600
CACHE_MAX_SIZE = 500


def _cache_get(query: str, lang: str) -> list[dict] | None:
    key = (query.lower().strip(), lang)
    if key in _cache:
        ts, results = _cache[key]
        if time.time() - ts < CACHE_TTL:
            return results
        del _cache[key]
    return None


def _cache_set(query: str, lang: str, results: list[dict]):
    if len(_cache) >= CACHE_MAX_SIZE:
        sorted_keys = sorted(_cache.keys(), key=lambda k: _cache[k][0])
        for k in sorted_keys[: CACHE_MAX_SIZE // 5]:
            del _cache[k]
    _cache[(query.lower().strip(), lang)] = (time.time(), results)


# ── OpenFoodFacts Search ──

async def search_openfoodfacts(query: str, lang: str = "de", limit: int = 8) -> list[dict]:
    """Search OpenFoodFacts for ingredients. Free, unlimited, great EU coverage."""
    params = {
        "search_terms": query,
        "search_simple": 1,
        "action": "process",
        "json": 1,
        "page_size": limit * 2,
        "lc": lang,
        "fields": "product_name,brands,nutriments,image_small_url",
    }

    async with httpx.AsyncClient(timeout=4.0) as client:
        try:
            resp = await client.get(OFF_SEARCH_URL, params=params)
            resp.raise_for_status()
            data = resp.json()
        except Exception:
            return []

    results = []
    seen_names = set()

    for product in data.get("products", []):
        name = product.get("product_name", "").strip()
        if not name or len(name) < 2 or name.lower() in seen_names:
            continue

        n = product.get("nutriments", {})
        calories = n.get("energy-kcal_100g", 0) or n.get("energy_100g", 0) or 0
        if calories > 900 and not n.get("energy-kcal_100g"):
            calories = round(calories / 4.184, 1)
        protein = n.get("proteins_100g", 0) or 0
        fat = n.get("fat_100g", 0) or 0
        carbs = n.get("carbohydrates_100g", 0) or 0

        if not any([calories, protein, fat, carbs]):
            continue

        brand = product.get("brands", "").split(",")[0].strip() if product.get("brands") else ""
        image = product.get("image_small_url", "")

        seen_names.add(name.lower())
        results.append({
            "name": name,
            "name_en": name,
            "calories_100g": round(float(calories), 1),
            "protein_100g": round(float(protein), 1),
            "fat_100g": round(float(fat), 1),
            "carbs_100g": round(float(carbs), 1),
            "image_url": image,
            "brand": brand,
            "source": "openfoodfacts",
        })

        if len(results) >= limit:
            break

    return results


# ── Main Search ──

async def search_ingredients(query: str, lang: str = "de", limit: int = 8) -> list[dict]:
    """
    Search for ingredients:
    1. Local German DB (instant) — covers ~200+ common ingredients
    2. OpenFoodFacts API (fallback for items not found locally)
    Results are cached in-memory for 1 hour.
    """
    if not query or len(query.strip()) < 2:
        return []

    cached = _cache_get(query, lang)
    if cached is not None:
        return cached[:limit]

    # Tier 1: Local instant search
    local_results = search_local_ingredients(query, limit=limit)

    # If local DB has enough results, return immediately
    if len(local_results) >= limit:
        _cache_set(query, lang, local_results)
        return local_results[:limit]

    # Tier 2: OpenFoodFacts API for remaining items
    remaining = limit - len(local_results)
    existing_names = {r["name"].lower() for r in local_results}

    try:
        off_results = await search_openfoodfacts(query, lang=lang, limit=remaining + 2)
    except Exception:
        off_results = []

    # Merge: local first, then OFF (deduplicated)
    results = list(local_results)
    for r in off_results:
        if r["name"].lower() not in existing_names:
            results.append(r)
            existing_names.add(r["name"].lower())
            if len(results) >= limit:
                break

    if results:
        _cache_set(query, lang, results)

    return results[:limit]
