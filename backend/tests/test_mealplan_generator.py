"""
MacroMate – MealPlan Generator Service Tests
Unit-Tests für den Meal-Plan-Algorithmus ohne DB-Abhängigkeit.
"""

from unittest.mock import MagicMock
from app.services.mealplan_generator import (
    generate_meal_plan,
    _score_recipe,
    _calculate_optimal_servings,
)


def _mock_recipe(
    id: int,
    name: str,
    calories: float,
    protein: float,
    fat: float,
    carbs: float,
    meal_type: str = "hauptgericht",
    servings: int = 1,
):
    """Erstellt ein Mock-Recipe-Objekt."""
    recipe = MagicMock()
    recipe.id = id
    recipe.name = name
    recipe.calories = calories
    recipe.protein = protein
    recipe.fat = fat
    recipe.carbs = carbs
    recipe.meal_type = meal_type
    recipe.servings = servings
    return recipe


def _mock_goals(calories=2000, protein=150, fat=65, carbs=250):
    """Erstellt ein Mock-MacroGoals-Objekt."""
    goals = MagicMock()
    goals.calories = calories
    goals.protein = protein
    goals.fat = fat
    goals.carbs = carbs
    return goals


class TestGenerateMealPlan:
    """Testet die Meal-Plan-Generierung."""

    def test_empty_recipes(self):
        """Leere Rezeptliste → leerer Plan."""
        result = generate_meal_plan([], _mock_goals())
        assert result == []

    def test_single_recipe(self):
        """Ein einzelnes Rezept wird für alle Slots verwendet."""
        recipes = [_mock_recipe(1, "Allrounder", 500, 30, 20, 50)]
        result = generate_meal_plan(recipes, _mock_goals())
        assert len(result) > 0
        assert all("recipe_id" in item for item in result)
        assert all("servings" in item for item in result)
        assert all("meal_slot" in item for item in result)

    def test_meal_slots_covered(self):
        """Alle vier Slots werden abgedeckt."""
        recipes = [
            _mock_recipe(1, "Frühstück", 400, 15, 10, 60, meal_type="frühstück"),
            _mock_recipe(2, "Mittag", 600, 40, 20, 65, meal_type="hauptgericht"),
            _mock_recipe(3, "Abend", 500, 35, 18, 50, meal_type="hauptgericht"),
            _mock_recipe(4, "Snack", 200, 10, 8, 25, meal_type="snack"),
        ]
        result = generate_meal_plan(recipes, _mock_goals())
        slots = {item["meal_slot"] for item in result}
        assert "frühstück" in slots
        assert "mittagessen" in slots
        assert "abendessen" in slots
        assert "snack" in slots

    def test_servings_in_range(self):
        """Portionen bleiben zwischen 0.5 und 3.0."""
        recipes = [
            _mock_recipe(1, "Light", 100, 5, 2, 15, meal_type="frühstück"),
            _mock_recipe(2, "Heavy", 1500, 80, 50, 120, meal_type="hauptgericht"),
            _mock_recipe(3, "Snack", 50, 3, 1, 8, meal_type="snack"),
        ]
        result = generate_meal_plan(recipes, _mock_goals())
        for item in result:
            assert 0.5 <= item["servings"] <= 3.0

    def test_variety(self):
        """Verschiedene Rezepte werden bevorzugt (keine exakten Duplikate über Slots)."""
        recipes = [
            _mock_recipe(1, "A", 500, 30, 20, 50, meal_type="frühstück"),
            _mock_recipe(2, "B", 500, 30, 20, 50, meal_type="hauptgericht"),
            _mock_recipe(3, "C", 500, 30, 20, 50, meal_type="hauptgericht"),
            _mock_recipe(4, "D", 200, 15, 8, 20, meal_type="snack"),
        ]
        result = generate_meal_plan(recipes, _mock_goals())
        recipe_ids = [item["recipe_id"] for item in result]
        # With 4 unique recipes and 4 slots, all should be different
        assert len(set(recipe_ids)) == len(recipe_ids)


class TestScoreRecipe:
    """Testet die Bewertungsfunktion."""

    def test_perfect_match_low_score(self):
        """Perfekt passendes Rezept hat niedrigen Score."""
        recipe = _mock_recipe(1, "Perfect", 500, 37.5, 16.25, 62.5, servings=1)
        score = _score_recipe(recipe, 2000, 150, 65, 250, 500)
        assert score < 0.5  # Should be very low

    def test_bad_match_high_score(self):
        """Schlecht passendes Rezept hat hohen Score."""
        recipe = _mock_recipe(1, "Bad", 2000, 5, 80, 10, servings=1)
        score = _score_recipe(recipe, 2000, 150, 65, 250, 500)
        assert score > 0.1  # Should be relatively high


class TestCalculateOptimalServings:
    """Testet die Portionsberechnung."""

    def test_exact_match(self):
        """500kcal Rezept bei 500kcal Ziel → 1 Portion."""
        recipe = _mock_recipe(1, "Match", 500, 30, 20, 50, servings=1)
        servings = _calculate_optimal_servings(recipe, 500)
        assert servings == 1.0

    def test_double_servings(self):
        """250kcal Rezept bei 500kcal Ziel → 2 Portionen."""
        recipe = _mock_recipe(1, "Small", 250, 15, 10, 25, servings=1)
        servings = _calculate_optimal_servings(recipe, 500)
        assert servings == 2.0

    def test_max_cap(self):
        """Sehr kleines Rezept wird auf 3.0 begrenzt."""
        recipe = _mock_recipe(1, "Tiny", 50, 2, 1, 5, servings=1)
        servings = _calculate_optimal_servings(recipe, 2000)
        assert servings == 3.0

    def test_min_cap(self):
        """Sehr großes Rezept wird auf 0.5 begrenzt."""
        recipe = _mock_recipe(1, "Huge", 5000, 200, 100, 400, servings=1)
        servings = _calculate_optimal_servings(recipe, 200)
        assert servings == 0.5

    def test_zero_calories(self):
        """Rezept mit 0 Kalorien → 1 Portion."""
        recipe = _mock_recipe(1, "Zero", 0, 0, 0, 0, servings=1)
        servings = _calculate_optimal_servings(recipe, 500)
        assert servings == 1.0

    def test_half_step_rounding(self):
        """Portionen werden auf 0.5er-Schritte gerundet."""
        recipe = _mock_recipe(1, "Mid", 400, 25, 15, 45, servings=1)
        servings = _calculate_optimal_servings(recipe, 500)
        # 500/400 = 1.25, rounded to 0.5 steps = 1.5
        assert servings in (1.0, 1.5)  # Depends on rounding
