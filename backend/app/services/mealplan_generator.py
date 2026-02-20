"""
MacroMate – MealPlan Generator Service

Algorithmus zur Auswahl von Rezepten, die möglichst nah an die
Kalorien- und Makronährstoffziele herankommen.

Strategie: Greedy-Ansatz mit Scoring
1. Rezepte nach Mahlzeittyp gruppieren (Frühstück, Hauptgericht, Snack)
2. Pro Slot das Rezept auswählen, das die Differenz zum Ziel am besten minimiert
3. Portionen dynamisch anpassen, um näher ans Ziel zu kommen
"""

from __future__ import annotations

import random
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.recipe import Recipe
    from app.schemas.mealplan import MacroGoals


# Aufteilung der Tageskalorien auf Mahlzeiten (in Prozent)
MEAL_SLOT_DISTRIBUTION = {
    "frühstück": 0.25,      # 25% der Tageskalorien
    "mittagessen": 0.35,    # 35%
    "abendessen": 0.30,     # 30%
    "snack": 0.10,          # 10%
}

# Mapping: meal_type → meal_slot
MEAL_TYPE_TO_SLOT = {
    "frühstück": "frühstück",
    "hauptgericht": None,  # Kann Mittag oder Abend sein
    "snack": "snack",
    "dessert": "snack",
}


def _score_recipe(
    recipe: "Recipe",
    remaining_cal: float,
    remaining_pro: float,
    remaining_fat: float,
    remaining_carbs: float,
    slot_cal_target: float,
) -> float:
    """
    Bewertet ein Rezept danach, wie gut es zu den verbleibenden Zielen passt.
    Niedrigerer Score = bessere Übereinstimmung.

    Gewichtung:
    - Kalorien: 40% (wichtigstes Kriterium)
    - Protein: 30% (zweitwichtigstes für Fitness-Ziele)
    - Fett: 15%
    - Kohlenhydrate: 15%
    """
    cal_per_serving = recipe.calories / (recipe.servings or 1)
    pro_per_serving = recipe.protein / (recipe.servings or 1)
    fat_per_serving = recipe.fat / (recipe.servings or 1)
    carbs_per_serving = recipe.carbs / (recipe.servings or 1)

    # Wie weit ist das Rezept vom Slot-Ziel entfernt?
    cal_diff = abs(cal_per_serving - slot_cal_target)
    pro_diff = abs(pro_per_serving - (remaining_pro * slot_cal_target / max(remaining_cal, 1)))
    fat_diff = abs(fat_per_serving - (remaining_fat * slot_cal_target / max(remaining_cal, 1)))
    carbs_diff = abs(carbs_per_serving - (remaining_carbs * slot_cal_target / max(remaining_cal, 1)))

    # Gewichteter Score (niedriger = besser)
    score = (
        0.40 * (cal_diff / max(remaining_cal, 1))
        + 0.30 * (pro_diff / max(remaining_pro, 1))
        + 0.15 * (fat_diff / max(remaining_fat, 1))
        + 0.15 * (carbs_diff / max(remaining_carbs, 1))
    )

    return score


def _calculate_optimal_servings(
    recipe: "Recipe",
    target_calories: float,
) -> float:
    """
    Berechnet die optimale Portionsanzahl, um möglichst nah
    an die Ziel-Kalorien für diesen Slot zu kommen.
    """
    cal_per_serving = recipe.calories / (recipe.servings or 1)
    if cal_per_serving <= 0:
        return 1.0

    optimal = target_calories / cal_per_serving
    # Auf 0.5er-Schritte runden (realistischere Portionen)
    optimal = round(optimal * 2) / 2
    # Mindestens 0.5, maximal 3 Portionen
    return max(0.5, min(3.0, optimal))


def generate_meal_plan(
    recipes: list["Recipe"],
    goals: "MacroGoals",
) -> list[dict]:
    """
    Generiert einen Tagesplan aus den verfügbaren Rezepten.

    Returns:
        Liste von Dicts mit {recipe_id, servings, meal_slot}
    """
    if not recipes:
        return []

    result: list[dict] = []
    remaining_cal = goals.calories
    remaining_pro = goals.protein
    remaining_fat = goals.fat
    remaining_carbs = goals.carbs

    # Rezepte nach Mahlzeittyp gruppieren
    breakfast_recipes = [r for r in recipes if r.meal_type == "frühstück"]
    main_recipes = [r for r in recipes if r.meal_type == "hauptgericht"]
    snack_recipes = [r for r in recipes if r.meal_type in ("snack", "dessert")]

    # Falls bestimmte Kategorien leer sind, Hauptgerichte als Fallback nutzen
    if not breakfast_recipes:
        breakfast_recipes = main_recipes[:] or recipes[:]
    if not main_recipes:
        main_recipes = recipes[:]
    if not snack_recipes:
        snack_recipes = main_recipes[:]

    # Pro Mahlzeit-Slot das beste Rezept auswählen
    slots = [
        ("frühstück", breakfast_recipes, MEAL_SLOT_DISTRIBUTION["frühstück"]),
        ("mittagessen", main_recipes, MEAL_SLOT_DISTRIBUTION["mittagessen"]),
        ("abendessen", main_recipes, MEAL_SLOT_DISTRIBUTION["abendessen"]),
        ("snack", snack_recipes, MEAL_SLOT_DISTRIBUTION["snack"]),
    ]

    used_recipe_ids: set[int] = set()

    for slot_name, available, cal_fraction in slots:
        slot_cal_target = goals.calories * cal_fraction

        # Bereits verwendete Rezepte möglichst vermeiden (Abwechslung)
        unused = [r for r in available if r.id not in used_recipe_ids]
        pool = unused if unused else available

        if not pool:
            continue

        # Bestes Rezept nach Score auswählen
        scored = [
            (r, _score_recipe(r, remaining_cal, remaining_pro, remaining_fat, remaining_carbs, slot_cal_target))
            for r in pool
        ]
        scored.sort(key=lambda x: x[1])

        # Top 3 nehmen und zufällig auswählen (etwas Variation)
        top_candidates = scored[: min(3, len(scored))]
        best_recipe = random.choice(top_candidates)[0]

        # Optimale Portionsgröße berechnen
        servings = _calculate_optimal_servings(best_recipe, slot_cal_target)

        factor = servings / (best_recipe.servings or 1)
        remaining_cal -= best_recipe.calories * factor
        remaining_pro -= best_recipe.protein * factor
        remaining_fat -= best_recipe.fat * factor
        remaining_carbs -= best_recipe.carbs * factor

        result.append({
            "recipe_id": best_recipe.id,
            "servings": servings,
            "meal_slot": slot_name,
        })

        used_recipe_ids.add(best_recipe.id)

    return result
