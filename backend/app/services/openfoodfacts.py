"""
MacroMate – Ingredient Search Service
Two-tier search:
  1. USDA FoodData Central (free, reliable, no rate issues)
     + built-in German↔English food dictionary for translation
  2. Google Gemini AI as fallback for anything not in USDA
Includes an in-memory cache (TTL-based) for fast repeat lookups.
Supports any language via the app's i18n locale.
"""

import json
import re
import time
import asyncio
import httpx

from app.config import settings

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
USDA_SEARCH_URL = "https://api.nal.usda.gov/fdc/v1/foods/search"
USDA_API_KEY = "DEMO_KEY"  # Free, 30 req/hour. Get your own at https://api.data.gov/signup/

# ── German → English food dictionary (most common ingredients) ──
DE_EN_FOOD = {
    "reis": "rice", "hähnchenbrust": "chicken breast", "hähnchen": "chicken",
    "hühnerbrust": "chicken breast", "hühnchen": "chicken", "huhn": "chicken",
    "ei": "egg", "eier": "eggs", "milch": "milk", "butter": "butter",
    "käse": "cheese", "brot": "bread", "brötchen": "bread roll",
    "kartoffel": "potato", "kartoffeln": "potatoes", "nudeln": "pasta",
    "spaghetti": "spaghetti", "tomate": "tomato", "tomaten": "tomatoes",
    "zwiebel": "onion", "zwiebeln": "onions", "knoblauch": "garlic",
    "paprika": "bell pepper", "gurke": "cucumber", "salat": "lettuce",
    "spinat": "spinach", "brokkoli": "broccoli", "blumenkohl": "cauliflower",
    "karotte": "carrot", "karotten": "carrots", "möhre": "carrot", "möhren": "carrots",
    "zucchini": "zucchini", "aubergine": "eggplant", "pilze": "mushrooms",
    "champignons": "mushrooms", "erbsen": "peas", "bohnen": "beans",
    "linsen": "lentils", "kichererbsen": "chickpeas",
    "rindfleisch": "beef", "schweinefleisch": "pork", "hackfleisch": "ground beef",
    "lachs": "salmon", "thunfisch": "tuna", "garnelen": "shrimp",
    "tofu": "tofu", "tempeh": "tempeh", "seitan": "seitan",
    "haferflocken": "oats", "müsli": "muesli", "cornflakes": "cornflakes",
    "joghurt": "yogurt", "quark": "quark", "sahne": "cream",
    "honig": "honey", "zucker": "sugar", "mehl": "flour",
    "olivenöl": "olive oil", "sonnenblumenöl": "sunflower oil", "öl": "oil",
    "avocado": "avocado", "banane": "banana", "apfel": "apple",
    "birne": "pear", "orange": "orange", "zitrone": "lemon",
    "erdbeeren": "strawberries", "blaubeeren": "blueberries", "himbeeren": "raspberries",
    "mandeln": "almonds", "walnüsse": "walnuts", "erdnüsse": "peanuts",
    "cashews": "cashews", "nüsse": "nuts", "erdnussbutter": "peanut butter",
    "schokolade": "chocolate", "kakao": "cocoa",
    "mozzarella": "mozzarella", "parmesan": "parmesan", "feta": "feta",
    "schinken": "ham", "speck": "bacon", "wurst": "sausage",
    "sojasoße": "soy sauce", "senf": "mustard", "ketchup": "ketchup",
    "essig": "vinegar", "salz": "salt", "pfeffer": "pepper",
    "basilikum": "basil", "oregano": "oregano", "petersilie": "parsley",
    "thymian": "thyme", "rosmarin": "rosemary", "zimt": "cinnamon",
    "ingwer": "ginger", "kurkuma": "turmeric", "chili": "chili",
    "vollkornbrot": "whole wheat bread", "pumpernickel": "pumpernickel",
    "süßkartoffel": "sweet potato", "süßkartoffeln": "sweet potatoes",
    "couscous": "couscous", "quinoa": "quinoa", "bulgur": "bulgur",
    "magerquark": "low fat quark", "skyr": "skyr",
    "proteinpulver": "protein powder", "whey": "whey protein",
    "kochschinken": "cooked ham", "putenbrust": "turkey breast",
    "pute": "turkey", "truthahn": "turkey", "ente": "duck",
    "kabeljau": "cod", "forelle": "trout", "hering": "herring",
    "mais": "corn", "kidney bohnen": "kidney beans",
    "vollkornnudeln": "whole wheat pasta", "glasnudeln": "glass noodles",
    "reisnudeln": "rice noodles", "basmati": "basmati rice",
    "jasminreis": "jasmine rice", "vollkornreis": "brown rice",
    "kokosmilch": "coconut milk", "kokosöl": "coconut oil",
    "leinsamen": "flax seeds", "chiasamen": "chia seeds",
    "sonnenblumenkerne": "sunflower seeds", "kürbiskerne": "pumpkin seeds",
    "rosinen": "raisins", "datteln": "dates", "feigen": "figs",
    "krabben": "crab", "muscheln": "mussels", "tintenfisch": "squid",
    "hirse": "millet", "amaranth": "amaranth", "buchweizen": "buckwheat",
    "sojamilch": "soy milk", "hafermilch": "oat milk", "mandelmilch": "almond milk",
    "frischkäse": "cream cheese", "ricotta": "ricotta", "mascarpone": "mascarpone",
    "hüttenkäse": "cottage cheese", "gouda": "gouda", "emmentaler": "emmental",
    "camembert": "camembert", "brie": "brie",
}

# ── In-Memory Cache ──
_cache: dict[tuple[str, str], tuple[float, list[dict]]] = {}
CACHE_TTL = 3600  # 1 hour
CACHE_MAX_SIZE = 500


def _cache_get(query: str, lang: str) -> list[dict] | None:
    key = (query.lower().strip(), lang)
    if key in _cache:
        ts, results = _cache[key]
        if time.time() - ts < CACHE_TTL:
            return results
        else:
            del _cache[key]
    return None


def _cache_set(query: str, lang: str, results: list[dict]):
    if len(_cache) >= CACHE_MAX_SIZE:
        sorted_keys = sorted(_cache.keys(), key=lambda k: _cache[k][0])
        for k in sorted_keys[: CACHE_MAX_SIZE // 5]:
            del _cache[k]
    _cache[(query.lower().strip(), lang)] = (time.time(), results)


def _translate_to_english(query: str) -> str:
    """Translate German query to English using built-in dictionary."""
    q_lower = query.lower().strip()
    # Exact match
    if q_lower in DE_EN_FOOD:
        return DE_EN_FOOD[q_lower]
    # Partial match: find best matching key
    for de_term, en_term in DE_EN_FOOD.items():
        if de_term.startswith(q_lower) or q_lower.startswith(de_term):
            return en_term
    # No translation found - return original (might already be English)
    return query


def _parse_json(text: str):
    """Parse JSON from potentially messy AI response."""
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        pass
    match = re.search(r"```(?:json)?\s*\n?(.*?)\n?```", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except json.JSONDecodeError:
            pass
    for pattern in [r"\[.*\]", r"\{[^{}]*\}"]:
        m = re.search(pattern, text, re.DOTALL)
        if m:
            try:
                return json.loads(m.group(0))
            except json.JSONDecodeError:
                pass
    raise ValueError(f"Could not parse JSON: {text[:200]}")


# ── USDA FoodData Central Search ──

async def search_usda(query: str, lang: str = "de", limit: int = 8) -> list[dict]:
    """
    Search USDA FoodData Central for ingredients.
    Translates German queries to English using built-in dictionary.
    Returns results with nutrition per 100g.
    """
    en_query = _translate_to_english(query) if lang != "en" else query

    params = {
        "api_key": USDA_API_KEY,
        "query": en_query,
        "pageSize": limit,
        "dataType": ["Foundation", "SR Legacy"],  # Best for raw ingredients
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(USDA_SEARCH_URL, params=params)
            resp.raise_for_status()
            data = resp.json()
        except Exception as e:
            print(f"USDA search error: {e}")
            return []

    results = []
    seen_names = set()

    for food in data.get("foods", []):
        # Get a clean name
        name = food.get("description", "").strip()
        if not name or name.lower() in seen_names:
            continue

        # Parse nutrients from the array — handle kcal vs kJ properly
        food_nutrients = food.get("foodNutrients", [])
        
        # Find calories: prefer KCAL unit, fall back to kJ conversion
        calories = 0
        energy_kj = 0
        protein = 0
        fat = 0
        carbs = 0
        
        for n in food_nutrients:
            nname = n.get("nutrientName", "")
            unit = n.get("unitName", "").upper()
            val = n.get("value", 0) or 0
            
            if nname == "Energy":
                if unit == "KCAL":
                    calories = val
                elif unit == "KJ":
                    energy_kj = val
            elif nname == "Protein":
                protein = val
            elif nname == "Total lipid (fat)":
                fat = val
            elif nname == "Carbohydrate, by difference":
                carbs = val
        
        # If no kcal found, convert from kJ
        if not calories and energy_kj:
            calories = round(energy_kj / 4.184, 1)

        if not any([calories, protein, fat, carbs]):
            continue

        # Use German name from dictionary if available, but keep English detail
        display_name = name
        if lang == "de":
            # Try to find a German name, but append English specifics
            en_lower = name.lower()
            best_de = None
            for de_term, en_term in DE_EN_FOOD.items():
                if en_term.lower() in en_lower or en_lower.startswith(en_term.lower()):
                    best_de = de_term.capitalize()
                    break
            if best_de:
                # Add specifics from English name that aren't in the base term
                display_name = best_de
                # If English name has more detail, append it
                en_base = _translate_to_english(best_de.lower()).lower()
                extra = name.lower().replace(en_base, "").strip(" ,()-")
                if extra and len(extra) > 2:
                    display_name = f"{best_de} ({extra.title()})"

        seen_names.add(name.lower())
        results.append({
            "name": display_name,
            "name_en": name,
            "calories_100g": round(float(calories), 1),
            "protein_100g": round(float(protein), 1),
            "fat_100g": round(float(fat), 1),
            "carbs_100g": round(float(carbs), 1),
            "image_url": "",
            "brand": "",
            "source": "usda",
        })

    return results


# ── Gemini Fallback ──

GEMINI_SUGGESTIONS_PROMPT = """Du bist ein Ernährungsexperte und Lebensmittel-Datenbank.
Der Benutzer sucht nach Lebensmitteln/Zutaten mit dem Suchbegriff: "{query}"

Gib genau {limit} passende Lebensmittel-Vorschläge mit Nährwerten pro 100g zurück.
Sprache für die Namen: {lang}

Antworte NUR mit einem JSON-Array (kein Markdown, kein Text davor/danach):
[
  {{"name": "Hähnchenbrust", "calories_100g": 165, "protein_100g": 31.0, "fat_100g": 3.6, "carbs_100g": 0.0}},
  {{"name": "Hähnchenschenkel", "calories_100g": 209, "protein_100g": 26.0, "fat_100g": 10.9, "carbs_100g": 0.0}}
]

Regeln:
- Nur echte, gängige Lebensmittel und Rohzutaten
- Nährwerte realistisch und genau pro 100g
- NUR das JSON-Array zurückgeben
"""


async def _gemini_call(prompt: str, max_retries: int = 2) -> str:
    """Gemini API call with retry on 429."""
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise ValueError("GEMINI_API_KEY not configured")

    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(
                    f"{GEMINI_API_URL}?key={api_key}",
                    json={
                        "contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {"temperature": 0.3, "maxOutputTokens": 2048},
                    },
                )
                resp.raise_for_status()
                data = resp.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429 and attempt < max_retries - 1:
                wait_time = (2 ** attempt) * 3
                print(f"Gemini rate limit, retrying in {wait_time}s...")
                await asyncio.sleep(wait_time)
                continue
            raise


async def search_gemini(query: str, lang: str = "de", limit: int = 5) -> list[dict]:
    """Gemini-based ingredient search as fallback."""
    lang_names = {
        "de": "Deutsch", "en": "English", "fr": "Français",
        "es": "Español", "it": "Italiano",
    }
    prompt = GEMINI_SUGGESTIONS_PROMPT.format(
        query=query, lang=lang_names.get(lang, "Deutsch"), limit=limit
    )
    try:
        text = await _gemini_call(prompt)
        data = _parse_json(text)
        items = data if isinstance(data, list) else [data] if isinstance(data, dict) else []
        return [
            {
                "name": item.get("name", "").strip(),
                "calories_100g": round(float(item.get("calories_100g", 0)), 1),
                "protein_100g": round(float(item.get("protein_100g", 0)), 1),
                "fat_100g": round(float(item.get("fat_100g", 0)), 1),
                "carbs_100g": round(float(item.get("carbs_100g", 0)), 1),
                "image_url": "",
                "brand": "",
                "source": "gemini",
            }
            for item in items[:limit]
            if item.get("name", "").strip()
        ]
    except Exception as e:
        print(f"Gemini ingredient search error: {e}")
        return []


# ── Main Search Function ──

async def search_ingredients(query: str, lang: str = "de", limit: int = 8) -> list[dict]:
    """
    Search for ingredients:
      1. Check cache
      2. Try USDA (free, reliable, great for raw ingredients)
      3. Fallback to Gemini if USDA has too few results
    """
    if not query or len(query.strip()) < 2:
        return []

    # Check cache
    cached = _cache_get(query, lang)
    if cached is not None:
        return cached[:limit]

    # Try USDA first
    results = await search_usda(query, lang=lang, limit=limit)

    # If USDA has too few results, try Gemini
    if len(results) < 2:
        gemini_results = await search_gemini(query, lang=lang, limit=limit - len(results))
        existing_names = {r["name"].lower() for r in results}
        for gr in gemini_results:
            if gr["name"].lower() not in existing_names:
                results.append(gr)
                existing_names.add(gr["name"].lower())

    # Cache results
    if results:
        _cache_set(query, lang, results)

    return results[:limit]
