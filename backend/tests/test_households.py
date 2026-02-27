"""
MacroMate – Household Tests
Tests for creating, joining, leaving households, and accessing shared data.
"""

import pytest


class TestHouseholdCreate:
    def test_create_household(self, client, auth_headers):
        res = client.post("/api/households", json={"name": "Familie Müller"}, headers=auth_headers)
        assert res.status_code == 201
        data = res.json()
        assert data["name"] == "Familie Müller"
        assert len(data["invite_code"]) > 0
        assert len(data["members"]) == 1

    def test_create_household_unauthenticated(self, client):
        res = client.post("/api/households", json={"name": "Test"})
        assert res.status_code == 401

    def test_cannot_create_two_households(self, client, auth_headers):
        client.post("/api/households", json={"name": "Haus 1"}, headers=auth_headers)
        res = client.post("/api/households", json={"name": "Haus 2"}, headers=auth_headers)
        assert res.status_code == 400


class TestHouseholdJoin:
    def test_join_with_code(self, client, auth_headers, second_auth_headers):
        # User 1 creates household
        res = client.post("/api/households", json={"name": "WG"}, headers=auth_headers)
        code = res.json()["invite_code"]

        # User 2 joins
        res2 = client.post("/api/households/join", json={"invite_code": code}, headers=second_auth_headers)
        assert res2.status_code == 200
        assert len(res2.json()["members"]) == 2

    def test_join_invalid_code(self, client, auth_headers):
        res = client.post("/api/households/join", json={"invite_code": "INVALID"}, headers=auth_headers)
        assert res.status_code == 404

    def test_cannot_join_when_already_in_household(self, client, auth_headers):
        client.post("/api/households", json={"name": "Haus"}, headers=auth_headers)
        res = client.post("/api/households/join", json={"invite_code": "ANYCODE"}, headers=auth_headers)
        assert res.status_code == 400

    def test_join_case_insensitive(self, client, auth_headers, second_auth_headers):
        res = client.post("/api/households", json={"name": "Test"}, headers=auth_headers)
        code = res.json()["invite_code"]
        res2 = client.post("/api/households/join", json={"invite_code": code.lower()}, headers=second_auth_headers)
        assert res2.status_code == 200


class TestHouseholdGet:
    def test_get_mine_none(self, client, auth_headers):
        res = client.get("/api/households/mine", headers=auth_headers)
        assert res.status_code == 200
        assert res.json() is None

    def test_get_mine_exists(self, client, auth_headers):
        client.post("/api/households", json={"name": "Mein Haus"}, headers=auth_headers)
        res = client.get("/api/households/mine", headers=auth_headers)
        assert res.status_code == 200
        assert res.json()["name"] == "Mein Haus"


class TestHouseholdLeave:
    def test_leave_household(self, client, auth_headers):
        client.post("/api/households", json={"name": "Temp"}, headers=auth_headers)
        res = client.post("/api/households/leave", headers=auth_headers)
        assert res.status_code == 200

        # Should be none now
        res2 = client.get("/api/households/mine", headers=auth_headers)
        assert res2.json() is None

    def test_leave_when_not_in_household(self, client, auth_headers):
        res = client.post("/api/households/leave", headers=auth_headers)
        assert res.status_code == 400

    def test_last_member_leaves_deletes_household(self, client, auth_headers, db):
        from app.models.household import Household
        client.post("/api/households", json={"name": "Solo"}, headers=auth_headers)
        client.post("/api/households/leave", headers=auth_headers)
        count = db.query(Household).count()
        assert count == 0


class TestHouseholdSecurity:
    def test_create_sets_expiry_and_max_members(self, client, auth_headers):
        res = client.post("/api/households", json={"name": "Sicher"}, headers=auth_headers)
        data = res.json()
        assert data["invite_expires_at"] is not None
        assert data["max_members"] == 5

    def test_name_too_short(self, client, auth_headers):
        res = client.post("/api/households", json={"name": "X"}, headers=auth_headers)
        assert res.status_code == 422

    def test_name_too_long(self, client, auth_headers):
        res = client.post("/api/households", json={"name": "A" * 60}, headers=auth_headers)
        assert res.status_code == 422

    def test_expired_invite_code_rejected(self, client, auth_headers, second_auth_headers, db):
        from app.models.household import Household
        from datetime import datetime, timezone, timedelta
        res = client.post("/api/households", json={"name": "Expired"}, headers=auth_headers)
        code = res.json()["invite_code"]
        hid = res.json()["id"]
        # Manually expire the code
        h = db.query(Household).get(hid)
        h.invite_expires_at = datetime.now(timezone.utc) - timedelta(hours=1)
        db.commit()
        res2 = client.post("/api/households/join", json={"invite_code": code}, headers=second_auth_headers)
        assert res2.status_code == 410


class TestHouseholdRegenerateCode:
    def test_regenerate_code_creator(self, client, auth_headers):
        res = client.post("/api/households", json={"name": "Regen"}, headers=auth_headers)
        old_code = res.json()["invite_code"]
        res2 = client.post("/api/households/regenerate-code", headers=auth_headers)
        assert res2.status_code == 200
        assert res2.json()["invite_code"] != old_code

    def test_regenerate_code_non_creator(self, client, auth_headers, second_auth_headers):
        res = client.post("/api/households", json={"name": "NoRegen"}, headers=auth_headers)
        code = res.json()["invite_code"]
        client.post("/api/households/join", json={"invite_code": code}, headers=second_auth_headers)
        res2 = client.post("/api/households/regenerate-code", headers=second_auth_headers)
        assert res2.status_code == 403

    def test_regenerate_no_household(self, client, auth_headers):
        res = client.post("/api/households/regenerate-code", headers=auth_headers)
        assert res.status_code == 400


class TestHouseholdRemoveMember:
    def test_remove_member_by_creator(self, client, auth_headers, second_auth_headers):
        res = client.post("/api/households", json={"name": "Remove"}, headers=auth_headers)
        code = res.json()["invite_code"]
        res2 = client.post("/api/households/join", json={"invite_code": code}, headers=second_auth_headers)
        member_id = [m for m in res2.json()["members"] if m["username"] != "testuser"][0]["id"]
        res3 = client.delete(f"/api/households/remove-member/{member_id}", headers=auth_headers)
        assert res3.status_code == 200
        assert "entfernt" in res3.json()["detail"]

    def test_remove_member_non_creator(self, client, auth_headers, second_auth_headers):
        res = client.post("/api/households", json={"name": "NoRemove"}, headers=auth_headers)
        code = res.json()["invite_code"]
        client.post("/api/households/join", json={"invite_code": code}, headers=second_auth_headers)
        # second user tries to remove first user
        res2 = client.delete(f"/api/households/remove-member/1", headers=second_auth_headers)
        assert res2.status_code == 403

    def test_cannot_remove_self(self, client, auth_headers):
        client.post("/api/households", json={"name": "Self"}, headers=auth_headers)
        # Get own user ID from a helper endpoint
        me = client.get("/api/auth/me", headers=auth_headers)
        my_id = me.json()["id"]
        res = client.delete(f"/api/households/remove-member/{my_id}", headers=auth_headers)
        assert res.status_code == 400


class TestHouseholdMealPlans:
    def test_get_household_mealplans_no_access(self, client, auth_headers):
        res = client.get("/api/households/999/mealplans", headers=auth_headers)
        assert res.status_code == 403

    def test_get_household_mealplans(self, client, auth_headers):
        res = client.post("/api/households", json={"name": "Test"}, headers=auth_headers)
        hid = res.json()["id"]
        res2 = client.get(f"/api/households/{hid}/mealplans", headers=auth_headers)
        assert res2.status_code == 200
        assert isinstance(res2.json(), list)
