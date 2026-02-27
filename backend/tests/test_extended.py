"""
MacroMate – Extended Auth & User Tests
Zusätzliche Tests für Auth-Flows, Passwort-Änderung, und User-Response.
"""


class TestChangePassword:
    """Testet die Passwort-Änderung."""

    def test_change_password_success(self, client, auth_headers):
        """Passwort erfolgreich ändern."""
        res = client.post("/api/auth/change-password", json={
            "old_password": "TestPass123",
            "new_password": "NewStrongPass1",
        }, headers=auth_headers)
        assert res.status_code == 200
        assert "erfolgreich" in res.json()["message"].lower()

        # Login with new password
        res2 = client.post("/api/auth/login", json={
            "username": "testuser",
            "password": "NewStrongPass1",
        })
        assert res2.status_code == 200

    def test_change_password_wrong_old(self, client, auth_headers):
        """Falsches altes Passwort → 400."""
        res = client.post("/api/auth/change-password", json={
            "old_password": "WrongOld123",
            "new_password": "NewStrongPass1",
        }, headers=auth_headers)
        assert res.status_code == 400

    def test_change_password_too_short(self, client, auth_headers):
        """Zu kurzes neues Passwort → 400."""
        res = client.post("/api/auth/change-password", json={
            "old_password": "TestPass123",
            "new_password": "short",
        }, headers=auth_headers)
        assert res.status_code == 400

    def test_change_password_unauthorized(self, client):
        """Ohne Auth → 401."""
        res = client.post("/api/auth/change-password", json={
            "old_password": "x", "new_password": "y",
        })
        assert res.status_code == 401


class TestUserResponse:
    """Testet das User-Response-Format."""

    def test_me_has_plan_field(self, client, auth_headers):
        """User-Response enthält 'plan' Feld."""
        res = client.get("/api/auth/me", headers=auth_headers)
        data = res.json()
        assert "plan" in data
        assert data["plan"] == "free"

    def test_me_has_required_fields(self, client, auth_headers):
        """User-Response enthält alle Pflichtfelder."""
        res = client.get("/api/auth/me", headers=auth_headers)
        data = res.json()
        assert "id" in data
        assert "username" in data
        assert "email" in data
        assert "is_premium" in data
        assert "created_at" in data

    def test_register_response_format(self, client):
        """Register-Response hat Token + User."""
        res = client.post("/api/auth/register", json={
            "username": "formatuser",
            "email": "format@example.com",
            "password": "StrongPass1",
        })
        data = res.json()
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        assert "user" in data
        assert data["user"]["username"] == "formatuser"


class TestRecipeFilters:
    """Testet Rezept-Filter-Endpoints."""

    def _create_recipes(self, client, headers):
        """Erstellt Rezepte mit verschiedenen Kategorien und Meal-Types."""
        client.post("/api/recipes", json={
            "name": "Veganer Salat", "calories": 300, "protein": 10,
            "fat": 15, "carbs": 30, "category": "vegan",
            "meal_type": "hauptgericht", "servings": 1,
            "ingredients": [{"name": "Salat", "quantity": 200, "unit": "g"}],
        }, headers=headers)
        client.post("/api/recipes", json={
            "name": "Steak", "calories": 800, "protein": 60,
            "fat": 40, "carbs": 10, "category": "fleisch",
            "meal_type": "hauptgericht", "servings": 1,
            "ingredients": [{"name": "Rindfleisch", "quantity": 300, "unit": "g"}],
        }, headers=headers)
        client.post("/api/recipes", json={
            "name": "Müsli", "calories": 350, "protein": 12,
            "fat": 8, "carbs": 55, "category": "vegetarisch",
            "meal_type": "frühstück", "servings": 1,
            "ingredients": [{"name": "Haferflocken", "quantity": 80, "unit": "g"}],
        }, headers=headers)

    def test_filter_by_category(self, client, auth_headers):
        """Rezepte nach Kategorie filtern."""
        self._create_recipes(client, auth_headers)
        res = client.get("/api/recipes?category=vegan", headers=auth_headers)
        assert res.status_code == 200
        for recipe in res.json():
            assert recipe["category"] == "vegan"

    def test_filter_by_meal_type(self, client, auth_headers):
        """Rezepte nach Meal-Type filtern."""
        self._create_recipes(client, auth_headers)
        res = client.get("/api/recipes?meal_type=frühstück", headers=auth_headers)
        assert res.status_code == 200
        for recipe in res.json():
            assert recipe["meal_type"] == "frühstück"

    def test_search_recipes(self, client, auth_headers):
        """Rezepte nach Name suchen."""
        self._create_recipes(client, auth_headers)
        res = client.get("/api/recipes?search=Steak", headers=auth_headers)
        assert res.status_code == 200
        assert any("Steak" in r["name"] for r in res.json())

    def test_recipe_has_ingredients(self, client, auth_headers):
        """Rezept-Response enthält Zutaten."""
        res = client.post("/api/recipes", json={
            "name": "Pasta", "calories": 500, "protein": 20,
            "fat": 15, "carbs": 70, "category": "vegetarisch",
            "meal_type": "hauptgericht", "servings": 2,
            "ingredients": [
                {"name": "Nudeln", "quantity": 200, "unit": "g"},
                {"name": "Tomatensoße", "quantity": 100, "unit": "ml"},
            ],
        }, headers=auth_headers)
        data = res.json()
        assert len(data["ingredients"]) == 2
        assert data["ingredients"][0]["name"] == "Nudeln"

    def test_update_recipe_ingredients(self, client, auth_headers):
        """Zutaten beim Update aktualisieren."""
        create_res = client.post("/api/recipes", json={
            "name": "Orig", "calories": 500, "protein": 20,
            "fat": 15, "carbs": 70, "category": "fleisch",
            "meal_type": "hauptgericht", "servings": 1,
            "ingredients": [{"name": "Alt", "quantity": 100, "unit": "g"}],
        }, headers=auth_headers)
        recipe_id = create_res.json()["id"]

        update_res = client.put(f"/api/recipes/{recipe_id}", json={
            "name": "Updated", "calories": 600, "protein": 25,
            "fat": 20, "carbs": 80, "category": "fleisch",
            "meal_type": "hauptgericht", "servings": 1,
            "ingredients": [
                {"name": "Neu1", "quantity": 200, "unit": "g"},
                {"name": "Neu2", "quantity": 50, "unit": "ml"},
            ],
        }, headers=auth_headers)
        assert update_res.status_code == 200
        data = update_res.json()
        assert data["name"] == "Updated"
        assert len(data["ingredients"]) == 2
        assert data["ingredients"][0]["name"] == "Neu1"
