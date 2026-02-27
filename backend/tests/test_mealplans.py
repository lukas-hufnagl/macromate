"""
MacroMate – MealPlan Endpoint Tests
Tests für Meal-Plan-Generierung, Abruf, Löschung und Einkaufsliste.
"""

from datetime import date, timedelta

from tests.conftest import create_test_recipe

# Use future dates so the 'no past plans' validation passes
_D1 = (date.today() + timedelta(days=1)).isoformat()
_D2 = (date.today() + timedelta(days=2)).isoformat()
_D3 = (date.today() + timedelta(days=3)).isoformat()
_D4 = (date.today() + timedelta(days=10)).isoformat()
_D5 = (date.today() + timedelta(days=20)).isoformat()


class TestMealPlanGeneration:
    """Testet die Meal-Plan-Generierung."""

    def _setup_recipes(self, client, headers):
        """Erstellt mehrere Rezepte verschiedener Typen für die Plan-Generierung."""
        create_test_recipe(client, headers, "Müsli mit Obst",
                           calories=400, protein=15, fat=10, carbs=65,
                           category="vegetarisch", meal_type="frühstück",
                           ingredients=[{"name": "Haferflocken", "quantity": 80, "unit": "g"}])
        create_test_recipe(client, headers, "Hähnchen Bowl",
                           calories=600, protein=45, fat=20, carbs=60,
                           category="fleisch", meal_type="hauptgericht",
                           ingredients=[{"name": "Hähnchen", "quantity": 200, "unit": "g"},
                                        {"name": "Reis", "quantity": 150, "unit": "g"}])
        create_test_recipe(client, headers, "Lachs mit Gemüse",
                           calories=550, protein=40, fat=25, carbs=35,
                           category="fisch", meal_type="hauptgericht",
                           ingredients=[{"name": "Lachs", "quantity": 180, "unit": "g"},
                                        {"name": "Brokkoli", "quantity": 200, "unit": "g"}])
        create_test_recipe(client, headers, "Proteinriegel",
                           calories=200, protein=20, fat=8, carbs=20,
                           category="vegetarisch", meal_type="snack",
                           ingredients=[{"name": "Proteinpulver", "quantity": 30, "unit": "g"}])

    def test_generate_meal_plan(self, client, auth_headers):
        """Tagesplan generieren mit Makro-Zielen."""
        self._setup_recipes(client, auth_headers)

        res = client.post("/api/mealplans/generate", json={
            "date": _D1,
            "goals": {
                "calories": 2000,
                "protein": 150,
                "fat": 65,
                "carbs": 250,
            },
        }, headers=auth_headers)
        assert res.status_code == 200
        data = res.json()
        assert data["date"] == _D1
        assert data["target_calories"] == 2000
        assert data["target_protein"] == 150
        assert len(data["entries"]) > 0
        assert "actual_calories" in data
        assert "actual_protein" in data

    def test_generate_meal_plan_no_recipes(self, client, auth_headers):
        """Plan ohne eigene Rezepte → 200 (nutzt builtin-Rezepte)."""
        res = client.post("/api/mealplans/generate", json={
            "date": _D1,
            "goals": {"calories": 2000, "protein": 150, "fat": 65, "carbs": 250},
        }, headers=auth_headers)
        assert res.status_code == 200
        data = res.json()
        assert len(data["entries"]) > 0

    def test_generate_replaces_existing_plan(self, client, auth_headers):
        """Doppelte Generierung für gleiches Datum überschreibt alten Plan."""
        self._setup_recipes(client, auth_headers)

        # Generate first plan
        client.post("/api/mealplans/generate", json={
            "date": _D1,
            "goals": {"calories": 2000, "protein": 150, "fat": 65, "carbs": 250},
        }, headers=auth_headers)

        # Generate again for same date
        res = client.post("/api/mealplans/generate", json={
            "date": _D1,
            "goals": {"calories": 1800, "protein": 120, "fat": 55, "carbs": 220},
        }, headers=auth_headers)
        assert res.status_code == 200
        assert res.json()["target_calories"] == 1800

        # Only one plan for that date
        plans = client.get("/api/mealplans/", headers=auth_headers)
        date_plans = [p for p in plans.json() if p["date"] == _D1]
        assert len(date_plans) == 1

    def test_generate_with_category_filter(self, client, auth_headers):
        """Plan mit Kategorie-Filter generieren."""
        self._setup_recipes(client, auth_headers)

        res = client.post("/api/mealplans/generate", json={
            "date": _D2,
            "goals": {"calories": 2000, "protein": 150, "fat": 65, "carbs": 250},
            "categories": ["vegetarisch"],
        }, headers=auth_headers)
        assert res.status_code == 200

    def test_generate_unauthorized(self, client):
        res = client.post("/api/mealplans/generate", json={
            "date": _D1,
            "goals": {"calories": 2000, "protein": 150, "fat": 65, "carbs": 250},
        })
        assert res.status_code == 401


class TestMealPlanCRUD:
    """Testet Abruf und Löschung von Meal Plans."""

    def _generate_plan(self, client, headers, plan_date=None):
        """Helper: Erzeugt Rezepte und generiert einen Plan."""
        if plan_date is None:
            plan_date = _D3
        create_test_recipe(client, headers, "Quick Recipe",
                           calories=500, protein=30, fat=20, carbs=50,
                           ingredients=[{"name": "Zutat", "quantity": 100, "unit": "g"}])
        res = client.post("/api/mealplans/generate", json={
            "date": plan_date,
            "goals": {"calories": 2000, "protein": 150, "fat": 65, "carbs": 250},
        }, headers=headers)
        assert res.status_code == 200
        return res.json()

    def test_list_meal_plans(self, client, auth_headers):
        """Alle Pläne auflisten."""
        self._generate_plan(client, auth_headers, _D3)
        self._generate_plan(client, auth_headers, _D4)

        res = client.get("/api/mealplans/", headers=auth_headers)
        assert res.status_code == 200
        assert len(res.json()) >= 2

    def test_list_with_date_filter(self, client, auth_headers):
        """Pläne mit Datumsfilter abrufen."""
        self._generate_plan(client, auth_headers, _D3)
        self._generate_plan(client, auth_headers, _D5)

        # Filter to only get the second plan
        filter_start = (date.today() + timedelta(days=8)).isoformat()
        filter_end = (date.today() + timedelta(days=25)).isoformat()
        res = client.get(
            f"/api/mealplans/?start_date={filter_start}&end_date={filter_end}",
            headers=auth_headers,
        )
        assert res.status_code == 200
        plans = res.json()
        for p in plans:
            assert p["date"] >= filter_start

    def test_get_plan_by_id(self, client, auth_headers):
        """Einzelnen Plan per ID abrufen."""
        plan = self._generate_plan(client, auth_headers)
        res = client.get(f"/api/mealplans/{plan['id']}", headers=auth_headers)
        assert res.status_code == 200
        assert res.json()["id"] == plan["id"]

    def test_get_plan_not_found(self, client, auth_headers):
        """Nicht-existenten Plan → 404."""
        res = client.get("/api/mealplans/99999", headers=auth_headers)
        assert res.status_code == 404

    def test_delete_plan(self, client, auth_headers):
        """Plan löschen."""
        plan = self._generate_plan(client, auth_headers)
        res = client.delete(f"/api/mealplans/{plan['id']}", headers=auth_headers)
        assert res.status_code == 204

        # Verify it's gone
        res2 = client.get(f"/api/mealplans/{plan['id']}", headers=auth_headers)
        assert res2.status_code == 404

    def test_delete_plan_not_found(self, client, auth_headers):
        """Nicht-existenten Plan löschen → 404."""
        res = client.delete("/api/mealplans/99999", headers=auth_headers)
        assert res.status_code == 404

    def test_list_plans_unauthorized(self, client):
        res = client.get("/api/mealplans/")
        assert res.status_code == 401


class TestShoppingList:
    """Testet die Einkaufslisten-Generierung."""

    def test_shopping_list(self, client, auth_headers):
        """Einkaufsliste für Zeitraum generieren."""
        # Create recipe with specific ingredients
        create_test_recipe(client, auth_headers, "Einkauf-Rezept",
                           calories=500, protein=30, fat=20, carbs=50,
                           ingredients=[
                               {"name": "Hähnchen", "quantity": 200, "unit": "g"},
                               {"name": "Reis", "quantity": 150, "unit": "g"},
                           ])

        # Generate a plan
        client.post("/api/mealplans/generate", json={
            "date": _D1,
            "goals": {"calories": 2000, "protein": 150, "fat": 65, "carbs": 250},
        }, headers=auth_headers)

        # Get shopping list
        res = client.get(
            f"/api/mealplans/shopping-list/?start_date={_D1}&end_date={_D1}",
            headers=auth_headers,
        )
        assert res.status_code == 200
        data = res.json()
        assert "items" in data
        assert data["start_date"] == _D1
        assert data["end_date"] == _D1

    def test_shopping_list_empty(self, client, auth_headers):
        """Einkaufsliste ohne Pläne ist leer."""
        res = client.get(
            "/api/mealplans/shopping-list/?start_date=2099-01-01&end_date=2099-01-31",
            headers=auth_headers,
        )
        assert res.status_code == 200
        assert res.json()["items"] == []

    def test_shopping_list_requires_dates(self, client, auth_headers):
        """Einkaufsliste ohne Datum → 422."""
        res = client.get("/api/mealplans/shopping-list/", headers=auth_headers)
        assert res.status_code == 422
