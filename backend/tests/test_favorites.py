"""
MacroMate – Favorites Endpoint Tests
Tests für Rezept-Favoriten (CRUD).
"""

from tests.conftest import create_test_recipe


class TestFavoritesFlow:
    """Testet den gesamten Favoriten-Workflow."""

    def test_get_favorites_empty(self, client, auth_headers):
        """Leere Favoriten-Liste bei neuem User."""
        res = client.get("/api/favorites/", headers=auth_headers)
        assert res.status_code == 200
        assert res.json()["favorites"] == []

    def test_add_favorite(self, client, auth_headers):
        """Rezept als Favorit hinzufügen."""
        recipe = create_test_recipe(client, auth_headers)
        res = client.post(f"/api/favorites/{recipe['id']}", headers=auth_headers)
        assert res.status_code == 200
        assert res.json()["status"] == "favorited"
        assert res.json()["recipe_id"] == recipe["id"]

    def test_add_favorite_duplicate(self, client, auth_headers):
        """Doppelt favorisieren gibt 'already_favorited' zurück."""
        recipe = create_test_recipe(client, auth_headers)
        client.post(f"/api/favorites/{recipe['id']}", headers=auth_headers)
        res = client.post(f"/api/favorites/{recipe['id']}", headers=auth_headers)
        assert res.status_code == 200
        assert res.json()["status"] == "already_favorited"

    def test_add_favorite_nonexistent_recipe(self, client, auth_headers):
        """Favorit für nicht-existentes Rezept → 404."""
        res = client.post("/api/favorites/99999", headers=auth_headers)
        assert res.status_code == 404

    def test_list_favorites(self, client, auth_headers):
        """Favoriten-IDs auflisten."""
        r1 = create_test_recipe(client, auth_headers, "Rezept A")
        r2 = create_test_recipe(client, auth_headers, "Rezept B")
        client.post(f"/api/favorites/{r1['id']}", headers=auth_headers)
        client.post(f"/api/favorites/{r2['id']}", headers=auth_headers)

        res = client.get("/api/favorites/", headers=auth_headers)
        assert res.status_code == 200
        favs = res.json()["favorites"]
        assert r1["id"] in favs
        assert r2["id"] in favs
        assert len(favs) == 2

    def test_remove_favorite(self, client, auth_headers):
        """Favorit entfernen."""
        recipe = create_test_recipe(client, auth_headers)
        client.post(f"/api/favorites/{recipe['id']}", headers=auth_headers)

        res = client.delete(f"/api/favorites/{recipe['id']}", headers=auth_headers)
        assert res.status_code == 200
        assert res.json()["status"] == "unfavorited"

        # Verify it's gone
        res2 = client.get("/api/favorites/", headers=auth_headers)
        assert recipe["id"] not in res2.json()["favorites"]

    def test_remove_nonexistent_favorite(self, client, auth_headers):
        """Nicht-existenten Favorit entfernen → 404."""
        recipe = create_test_recipe(client, auth_headers)
        res = client.delete(f"/api/favorites/{recipe['id']}", headers=auth_headers)
        assert res.status_code == 404


class TestFavoritesAuth:
    """Testet Authentifizierung für Favoriten-Endpoints."""

    def test_get_favorites_unauthorized(self, client):
        res = client.get("/api/favorites/")
        assert res.status_code == 401

    def test_add_favorite_unauthorized(self, client):
        res = client.post("/api/favorites/1")
        assert res.status_code == 401

    def test_delete_favorite_unauthorized(self, client):
        res = client.delete("/api/favorites/1")
        assert res.status_code == 401


class TestFavoritesIsolation:
    """Testet Datenisolierung zwischen Usern."""

    def test_favorites_per_user(self, client, auth_headers, second_auth_headers):
        """Favoriten sind User-spezifisch."""
        recipe = create_test_recipe(client, auth_headers, "User1 Rezept")
        client.post(f"/api/favorites/{recipe['id']}", headers=auth_headers)

        # User 2 should have no favorites
        res = client.get("/api/favorites/", headers=second_auth_headers)
        assert res.json()["favorites"] == []

        # User 1 should have one
        res = client.get("/api/favorites/", headers=auth_headers)
        assert len(res.json()["favorites"]) == 1
