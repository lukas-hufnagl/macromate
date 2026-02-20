"""
MacroMate – Recipe Endpoint Tests
"""


class TestRecipesCRUD:
    def _create_recipe(self, client, headers, name="Test Rezept"):
        return client.post("/api/recipes", json={
            "name": name,
            "calories": 500,
            "protein": 30,
            "fat": 20,
            "carbs": 50,
            "category": "fleisch",
            "meal_type": "hauptgericht",
            "servings": 2,
            "ingredients": [
                {"name": "Hähnchen", "quantity": 200, "unit": "g"},
                {"name": "Reis", "quantity": 150, "unit": "g"},
            ],
        }, headers=headers)

    def test_create_recipe(self, client, auth_headers):
        res = self._create_recipe(client, auth_headers)
        assert res.status_code == 201
        data = res.json()
        assert data["name"] == "Test Rezept"
        assert data["calories"] == 500
        assert len(data["ingredients"]) == 2

    def test_list_recipes(self, client, auth_headers):
        self._create_recipe(client, auth_headers, "Rezept A")
        self._create_recipe(client, auth_headers, "Rezept B")
        res = client.get("/api/recipes", headers=auth_headers)
        assert res.status_code == 200
        assert len(res.json()) >= 2

    def test_get_recipe_by_id(self, client, auth_headers):
        create_res = self._create_recipe(client, auth_headers)
        recipe_id = create_res.json()["id"]
        res = client.get(f"/api/recipes/{recipe_id}", headers=auth_headers)
        assert res.status_code == 200
        assert res.json()["id"] == recipe_id

    def test_update_recipe(self, client, auth_headers):
        create_res = self._create_recipe(client, auth_headers)
        recipe_id = create_res.json()["id"]
        res = client.put(f"/api/recipes/{recipe_id}", json={
            "name": "Aktualisiert",
            "calories": 600,
            "protein": 40,
            "fat": 25,
            "carbs": 60,
            "category": "fisch",
            "meal_type": "hauptgericht",
            "servings": 3,
            "ingredients": [
                {"name": "Lachs", "quantity": 250, "unit": "g"},
            ],
        }, headers=auth_headers)
        assert res.status_code == 200
        assert res.json()["name"] == "Aktualisiert"

    def test_delete_recipe(self, client, auth_headers):
        create_res = self._create_recipe(client, auth_headers)
        recipe_id = create_res.json()["id"]
        res = client.delete(f"/api/recipes/{recipe_id}", headers=auth_headers)
        assert res.status_code in (200, 204)

    def test_recipe_unauthorized(self, client):
        res = client.get("/api/recipes")
        assert res.status_code == 401
