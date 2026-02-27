"""
MacroMate – Profile & TDEE Tests
Tests for user profile management, onboarding, and TDEE calculation.
"""

import pytest


class TestProfileGet:
    def test_get_profile_unauthenticated(self, client):
        res = client.get("/api/profile")
        assert res.status_code == 401

    def test_get_profile_empty(self, client, auth_headers):
        res = client.get("/api/profile", headers=auth_headers)
        assert res.status_code == 200
        data = res.json()
        assert data["gender"] is None
        assert data["age"] is None
        assert data["onboarding_completed"] is False


class TestProfileUpdate:
    def test_update_partial(self, client, auth_headers):
        res = client.put("/api/profile", json={"gender": "male", "age": 25}, headers=auth_headers)
        assert res.status_code == 200
        data = res.json()
        assert data["gender"] == "male"
        assert data["age"] == 25
        assert data["onboarding_completed"] is False  # not all fields yet

    def test_update_full_completes_onboarding(self, client, auth_headers):
        res = client.put("/api/profile", json={
            "gender": "male",
            "age": 25,
            "height_cm": 180,
            "weight_kg": 80,
            "activity_level": "moderate",
            "goal": "gain",
        }, headers=auth_headers)
        assert res.status_code == 200
        data = res.json()
        assert data["onboarding_completed"] is True
        assert data["goal"] == "gain"

    def test_update_invalid_gender(self, client, auth_headers):
        res = client.put("/api/profile", json={"gender": "invalid"}, headers=auth_headers)
        assert res.status_code == 422

    def test_update_invalid_activity(self, client, auth_headers):
        res = client.put("/api/profile", json={"activity_level": "ultra"}, headers=auth_headers)
        assert res.status_code == 422

    def test_update_invalid_goal(self, client, auth_headers):
        res = client.put("/api/profile", json={"goal": "fly"}, headers=auth_headers)
        assert res.status_code == 422


class TestTDEE:
    def _complete_profile(self, client, headers, **overrides):
        data = {
            "gender": "male", "age": 25, "height_cm": 180,
            "weight_kg": 80, "activity_level": "moderate", "goal": "maintain",
            **overrides,
        }
        client.put("/api/profile", json=data, headers=headers)

    def test_tdee_incomplete_profile(self, client, auth_headers):
        res = client.get("/api/profile/tdee", headers=auth_headers)
        assert res.status_code == 400

    def test_tdee_male_maintain(self, client, auth_headers):
        self._complete_profile(client, auth_headers)
        res = client.get("/api/profile/tdee", headers=auth_headers)
        assert res.status_code == 200
        data = res.json()
        assert data["goal"] == "maintain"
        assert 2000 < data["tdee"] < 3500
        assert data["target_calories"] == round(data["tdee"])
        assert data["protein_g"] > 0
        assert data["fat_g"] > 0
        assert data["carbs_g"] > 0

    def test_tdee_female_lose(self, client, auth_headers):
        self._complete_profile(client, auth_headers, gender="female", goal="lose")
        res = client.get("/api/profile/tdee", headers=auth_headers)
        data = res.json()
        assert data["target_calories"] < data["tdee"]

    def test_tdee_male_gain(self, client, auth_headers):
        self._complete_profile(client, auth_headers, goal="gain")
        res = client.get("/api/profile/tdee", headers=auth_headers)
        data = res.json()
        assert data["target_calories"] > data["tdee"]

    def test_tdee_higher_protein_for_lose(self, client, auth_headers):
        self._complete_profile(client, auth_headers, goal="lose", weight_kg=80)
        res_lose = client.get("/api/profile/tdee", headers=auth_headers)
        protein_lose = res_lose.json()["protein_g"]
        # 2.2 * 80 = 176
        assert protein_lose == round(80 * 2.2)

    def test_preview_tdee_no_auth_needed_for_data(self, client, auth_headers):
        """Preview TDEE doesn't save, just calculates."""
        res = client.post("/api/profile/tdee/preview", json={
            "gender": "male", "age": 30, "height_cm": 175,
            "weight_kg": 70, "activity_level": "light", "goal": "maintain",
        })
        assert res.status_code == 200
        data = res.json()
        assert data["target_calories"] > 1200

    def test_preview_tdee_incomplete(self, client):
        res = client.post("/api/profile/tdee/preview", json={"gender": "male"})
        assert res.status_code == 400

    def test_sedentary_lower_than_active(self, client, auth_headers):
        self._complete_profile(client, auth_headers, activity_level="sedentary")
        res1 = client.get("/api/profile/tdee", headers=auth_headers)
        cal_sedentary = res1.json()["target_calories"]

        self._complete_profile(client, auth_headers, activity_level="very_active")
        res2 = client.get("/api/profile/tdee", headers=auth_headers)
        cal_active = res2.json()["target_calories"]

        assert cal_sedentary < cal_active

    def test_minimum_calories_enforced(self, client):
        """Even extreme deficit shouldn't go below 1200 kcal."""
        res = client.post("/api/profile/tdee/preview", json={
            "gender": "female", "age": 60, "height_cm": 150,
            "weight_kg": 45, "activity_level": "sedentary", "goal": "lose",
        })
        assert res.json()["target_calories"] >= 1200
