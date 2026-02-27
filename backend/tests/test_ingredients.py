"""
MacroMate – Ingredient Search Tests
Tests for the 2-tier ingredient search (local + OpenFoodFacts).
"""

import pytest
from unittest.mock import AsyncMock, patch
from app.services.openfoodfacts import (
    search_openfoodfacts,
    search_ingredients,
    _cache,
    _cache_get,
    _cache_set,
)


class TestCache:
    def setup_method(self):
        _cache.clear()

    def test_cache_miss(self):
        assert _cache_get("test", "de") is None

    def test_cache_hit(self):
        results = [{"name": "Test", "calories_100g": 100}]
        _cache_set("test", "de", results)
        assert _cache_get("test", "de") == results

    def test_cache_case_insensitive(self):
        results = [{"name": "Test"}]
        _cache_set("Reis", "de", results)
        assert _cache_get("reis", "de") == results

    def test_cache_different_lang(self):
        _cache_set("rice", "en", [{"name": "Rice"}])
        assert _cache_get("rice", "de") is None


class TestSearchIngredients:
    def setup_method(self):
        _cache.clear()

    @pytest.mark.asyncio
    async def test_empty_query(self):
        result = await search_ingredients("", "de")
        assert result == []

    @pytest.mark.asyncio
    async def test_short_query(self):
        result = await search_ingredients("r", "de")
        assert result == []

    @pytest.mark.asyncio
    async def test_cache_reuse(self):
        cached_data = [{"name": "Cached", "calories_100g": 200, "source": "openfoodfacts"}]
        _cache_set("banane", "de", cached_data)
        result = await search_ingredients("banane", "de")
        assert result == cached_data

    @pytest.mark.asyncio
    async def test_limit_respects_max(self):
        data = [{"name": f"Item{i}", "calories_100g": i * 10} for i in range(20)]
        _cache_set("viel", "de", data)
        result = await search_ingredients("viel", "de", limit=5)
        assert len(result) == 5

    @pytest.mark.asyncio
    async def test_local_results_returned_first(self):
        """Local ingredients should be returned before API results."""
        result = await search_ingredients("haferflocken", "de")
        if result:
            assert result[0]["source"] == "local"


class TestSearchEndpoint:
    def test_search_endpoint_exists(self, client):
        res = client.get("/api/ingredients/search", params={"q": "reis"})
        assert res.status_code != 404

    def test_search_missing_query(self, client):
        res = client.get("/api/ingredients/search")
        assert res.status_code in (200, 422)

    def test_search_short_query(self, client):
        res = client.get("/api/ingredients/search", params={"q": "r"})
        assert res.status_code == 422
