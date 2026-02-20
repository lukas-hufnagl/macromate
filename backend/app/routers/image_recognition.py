"""
MacroMate – Image Recognition Router
Erkennt Rezepte aus hochgeladenen Bildern via Google Gemini Vision API
und liefert automatisch Nährwerte.
"""

import base64
import json
import re
import httpx
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from pydantic import BaseModel

from app.auth import get_current_user
from app.models.user import User
from app.config import settings

router = APIRouter(prefix="/api/recognize", tags=["Image Recognition"])


# ── Response Models ──

class RecognizedIngredient(BaseModel):
    name: str
    quantity: float
    unit: str


class RecognizedRecipe(BaseModel):
    name: str
    description: str
    instructions: str
    category: str
    meal_type: str
    servings: int
    calories: float
    protein: float
    fat: float
    carbs: float
    ingredients: list[RecognizedIngredient]
    confidence: float  # 0-1 Confidence Score


GEMINI_PROMPT = """Analysiere dieses Bild eines Gerichts/Essens. Antworte NUR mit validem JSON (keine Markdown-Codeblöcke, kein Text davor/danach):
{"name":"Name","description":"Kurz 1-2 Sätze","instructions":"1. Schritt\n2. Schritt\n3. Schritt","category":"vegan|vegetarisch|fleisch|fisch","meal_type":"frühstück|hauptgericht|snack|dessert","servings":4,"calories":450,"protein":30,"fat":15,"carbs":45,"ingredients":[{"name":"Zutat","quantity":200,"unit":"g"}],"confidence":0.85}

Regeln:
- Nährwerte PRO PORTION, realistisch schätzen
- instructions: max 5-8 kurze Schritte
- category: vegan/vegetarisch/fleisch/fisch
- meal_type: frühstück/hauptgericht/snack/dessert
- confidence: 0.0-1.0
- Halte die Antwort kompakt!
"""


def _repair_truncated_json(text: str) -> str:
    """Versucht abgeschnittenes JSON zu reparieren."""
    # Abgeschnittene Strings schließen
    # Zähle offene Anführungszeichen
    in_string = False
    escaped = False
    for ch in text:
        if escaped:
            escaped = False
            continue
        if ch == '\\':
            escaped = True
            continue
        if ch == '"':
            in_string = not in_string

    if in_string:
        text += '"'

    # Offene Klammern/Brackets schließen
    stack = []
    in_str = False
    esc = False
    for ch in text:
        if esc:
            esc = False
            continue
        if ch == '\\':
            esc = True
            continue
        if ch == '"':
            in_str = not in_str
            continue
        if in_str:
            continue
        if ch in ('{', '['):
            stack.append('}' if ch == '{' else ']')
        elif ch in ('}', ']'):
            if stack:
                stack.pop()

    # Trailing commas entfernen und Klammern schließen
    text = re.sub(r',\s*$', '', text)
    text += ''.join(reversed(stack))
    return text


async def recognize_with_gemini(image_data: bytes, mime_type: str) -> RecognizedRecipe:
    """Erkennt ein Gericht via Google Gemini Vision API."""
    api_key = settings.GEMINI_API_KEY

    if not api_key or api_key == "your_gemini_api_key_here":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini API Key nicht konfiguriert. Bitte GEMINI_API_KEY in .env setzen.",
        )

    b64_image = base64.b64encode(image_data).decode("utf-8")

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": GEMINI_PROMPT},
                    {
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": b64_image,
                        }
                    },
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 4096,
            "response_mime_type": "application/json",
        },
    }

    # Modelle in Reihenfolge versuchen (Fallback bei Quota-Limits)
    # Jedes Modell hat sein eigenes Free-Tier-Kontingent
    models = [
        "gemini-2.0-flash",
        "gemini-2.5-flash",
        "gemini-2.0-flash-lite",
        "gemini-2.5-flash-lite",
    ]

    data = None
    last_error = ""

    async with httpx.AsyncClient(timeout=30.0) as client:
        for model in models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            resp = await client.post(url, json=payload)

            if resp.status_code == 200:
                data = resp.json()
                break
            elif resp.status_code == 429:
                # Quota erschöpft → nächstes Modell
                last_error = f"{model}: Quota erschöpft"
                continue
            elif resp.status_code == 404:
                # Modell nicht verfügbar → überspringen
                last_error = f"{model}: nicht verfügbar"
                continue
            else:
                last_error = resp.text[:500]
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Gemini API Fehler ({resp.status_code}): {last_error}",
                )

    if data is None:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Alle Gemini-Modelle haben ihr Kontingent erreicht. Bitte warte einige Minuten. ({last_error})",
        )

    # Antwort parsen
    try:
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        # JSON aus der Antwort extrahieren (Gemini gibt manchmal Markdown zurück)
        text = text.strip()
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\s*", "", text)
            text = re.sub(r"\s*```$", "", text)

        # Abgeschnittenes JSON reparieren
        try:
            recipe_data = json.loads(text)
        except json.JSONDecodeError:
            # Versuche abgeschnittenes JSON zu reparieren
            repaired = _repair_truncated_json(text)
            recipe_data = json.loads(repaired)

        # Validierung & Defaults
        valid_categories = {"vegan", "vegetarisch", "fleisch", "fisch"}
        valid_meal_types = {"frühstück", "hauptgericht", "snack", "dessert"}

        category = recipe_data.get("category", "vegetarisch").lower()
        if category not in valid_categories:
            category = "vegetarisch"

        meal_type = recipe_data.get("meal_type", "hauptgericht").lower()
        if meal_type not in valid_meal_types:
            meal_type = "hauptgericht"

        ingredients = []
        for ing in recipe_data.get("ingredients", []):
            try:
                qty = float(ing.get("quantity") or 1)
            except (TypeError, ValueError):
                qty = 1.0
            ingredients.append(
                RecognizedIngredient(
                    name=str(ing.get("name") or "Unbekannt"),
                    quantity=qty,
                    unit=str(ing.get("unit") or "Stück"),
                )
            )

        if not ingredients:
            ingredients = [RecognizedIngredient(name="Zutat eintragen", quantity=1, unit="Stück")]

        def safe_float(val, default: float) -> float:
            try:
                return float(val) if val is not None else default
            except (TypeError, ValueError):
                return default

        def safe_int(val, default: int) -> int:
            try:
                return int(val) if val is not None else default
            except (TypeError, ValueError):
                return default

        return RecognizedRecipe(
            name=str(recipe_data.get("name") or "Erkanntes Gericht"),
            description=str(recipe_data.get("description") or ""),
            instructions=str(recipe_data.get("instructions") or ""),
            category=category,
            meal_type=meal_type,
            servings=safe_int(recipe_data.get("servings"), 2),
            calories=safe_float(recipe_data.get("calories"), 400),
            protein=safe_float(recipe_data.get("protein"), 25),
            fat=safe_float(recipe_data.get("fat"), 15),
            carbs=safe_float(recipe_data.get("carbs"), 40),
            ingredients=ingredients,
            confidence=safe_float(recipe_data.get("confidence"), 0.7),
        )

    except (KeyError, json.JSONDecodeError, IndexError) as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Gemini-Antwort konnte nicht verarbeitet werden: {str(e)}",
        )


@router.post("/image", response_model=RecognizedRecipe)
async def recognize_recipe_from_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """
    Erkennt ein Rezept aus einem hochgeladenen Bild.
    Unterstützt: JPEG, PNG, WebP, GIF
    Nutzt Google Gemini Vision API für die Erkennung.
    """
    # Dateityp prüfen
    allowed_types = {
        "image/jpeg", "image/png", "image/webp", "image/gif",
        "image/jpg",
    }

    content_type = file.content_type or ""
    if content_type not in allowed_types:
        # Fallback: Dateiendung prüfen
        ext = (file.filename or "").lower().split(".")[-1]
        ext_to_mime = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "webp": "image/webp", "gif": "image/gif"}
        content_type = ext_to_mime.get(ext, "")
        if not content_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nur Bilder werden unterstützt (JPEG, PNG, WebP, GIF)",
            )

    # Bild lesen (max 10 MB)
    image_data = await file.read()
    if len(image_data) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Bild zu groß (max. 10 MB)",
        )

    # Rezept erkennen
    recipe = await recognize_with_gemini(image_data, content_type)

    return recipe


@router.get("/status")
async def recognition_status():
    """Prüft ob die Bild-Erkennung konfiguriert ist."""
    api_key = settings.GEMINI_API_KEY
    configured = bool(api_key and api_key != "your_gemini_api_key_here")
    return {
        "available": configured,
        "provider": "Google Gemini Vision" if configured else None,
    }
