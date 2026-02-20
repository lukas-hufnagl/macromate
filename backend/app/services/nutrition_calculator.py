"""
MacroMate – Nutrition Calculator Service
Berechnet Nährwerte (Kalorien, Protein, Fett, Carbs) automatisch
aus einer Zutatenliste mithilfe der Google Gemini API.
"""

import json
import re
import httpx

from app.config import settings

NUTRITION_PROMPT = """Du bist ein Ernährungsexperte. Berechne die Nährwerte für ein Rezept anhand der folgenden Zutatenliste.

Zutaten:
{ingredients_text}

Anzahl Portionen: {servings}

Antworte NUR mit validem JSON (keine Markdown-Codeblöcke, kein Text davor/danach):
{{"calories": 450, "protein": 30.0, "fat": 15.0, "carbs": 45.0}}

Regeln:
- Alle Nährwerte PRO PORTION angeben (Gesamtmenge geteilt durch Portionen)
- Kalorien in kcal (ganzzahlig)
- Protein, Fett, Carbs in Gramm (eine Nachkommastelle)
- Realistisch schätzen basierend auf gängigen Nährwerttabellen
- Wenn eine Zutat unklar ist, trotzdem bestmöglich schätzen
- NUR das JSON-Objekt zurückgeben, nichts anderes
"""

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"


def _format_ingredients(ingredients: list[dict], servings: int) -> str:
    """Formatiert Zutaten als lesbaren Text für den Prompt."""
    lines = []
    for ing in ingredients:
        name = ing.get("name", "").strip()
        qty = ing.get("quantity", 0)
        unit = ing.get("unit", "").strip()
        if name:
            lines.append(f"- {qty} {unit} {name}")
    return "\n".join(lines) if lines else "Keine Zutaten angegeben"


def _parse_json_response(text: str) -> dict:
    """Extrahiert JSON aus der Gemini-Antwort (mit Fallbacks)."""
    # Versuche direktes Parsen
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        pass

    # Versuche JSON aus Markdown-Codeblock zu extrahieren
    match = re.search(r"```(?:json)?\s*\n?(.*?)\n?```", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except json.JSONDecodeError:
            pass

    # Versuche erstes JSON-Objekt zu finden
    match = re.search(r"\{[^{}]*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Konnte kein gültiges JSON aus der Antwort extrahieren: {text[:200]}")


async def calculate_nutrition(
    ingredients: list[dict],
    servings: int = 1,
) -> dict:
    """
    Berechnet Nährwerte pro Portion anhand der Zutatenliste via Gemini API.

    Args:
        ingredients: Liste von Dicts mit keys: name, quantity, unit
        servings: Anzahl Portionen

    Returns:
        Dict mit keys: calories, protein, fat, carbs
    """
    if not settings.GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY ist nicht konfiguriert")

    ingredients_text = _format_ingredients(ingredients, servings)

    prompt = NUTRITION_PROMPT.format(
        ingredients_text=ingredients_text,
        servings=servings,
    )

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.2,  # Niedrig für präzisere Zahlen
            "maxOutputTokens": 256,
        },
    }

    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.post(
            f"{GEMINI_API_URL}?key={settings.GEMINI_API_KEY}",
            json=payload,
        )

    if response.status_code != 200:
        raise RuntimeError(
            f"Gemini API Fehler ({response.status_code}): {response.text[:300]}"
        )

    data = response.json()
    text = data["candidates"][0]["content"]["parts"][0]["text"]

    result = _parse_json_response(text)

    # Validierung & Defaults
    return {
        "calories": round(float(result.get("calories", 0)), 0),
        "protein": round(float(result.get("protein", 0)), 1),
        "fat": round(float(result.get("fat", 0)), 1),
        "carbs": round(float(result.get("carbs", 0)), 1),
    }
