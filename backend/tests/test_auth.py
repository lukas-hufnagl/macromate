"""
MacroMate – Auth Endpoint Tests
"""


class TestRegister:
    def test_register_success(self, client):
        res = client.post("/api/auth/register", json={
            "username": "newuser",
            "email": "new@example.com",
            "password": "StrongPass1",
        })
        assert res.status_code == 201
        data = res.json()
        assert "access_token" in data
        assert data["user"]["username"] == "newuser"
        assert data["user"]["email"] == "new@example.com"

    def test_register_duplicate_username(self, client):
        payload = {"username": "dupeuser", "email": "a@b.com", "password": "StrongPass1"}
        client.post("/api/auth/register", json=payload)
        res = client.post("/api/auth/register", json={
            **payload, "email": "other@b.com"
        })
        assert res.status_code == 409

    def test_register_duplicate_email(self, client):
        payload = {"username": "user1", "email": "same@b.com", "password": "StrongPass1"}
        client.post("/api/auth/register", json=payload)
        res = client.post("/api/auth/register", json={
            "username": "user2", "email": "same@b.com", "password": "StrongPass1"
        })
        assert res.status_code == 409

    def test_register_weak_password(self, client):
        res = client.post("/api/auth/register", json={
            "username": "weakuser", "email": "w@b.com", "password": "short",
        })
        assert res.status_code == 422

    def test_register_short_username(self, client):
        res = client.post("/api/auth/register", json={
            "username": "ab", "email": "x@b.com", "password": "StrongPass1",
        })
        assert res.status_code == 422


class TestLogin:
    def test_login_success(self, client):
        client.post("/api/auth/register", json={
            "username": "loginuser", "email": "login@b.com", "password": "StrongPass1",
        })
        res = client.post("/api/auth/login", json={
            "username": "loginuser", "password": "StrongPass1",
        })
        assert res.status_code == 200
        assert "access_token" in res.json()

    def test_login_wrong_password(self, client):
        client.post("/api/auth/register", json={
            "username": "wrongpw", "email": "wp@b.com", "password": "StrongPass1",
        })
        res = client.post("/api/auth/login", json={
            "username": "wrongpw", "password": "WrongPass1",
        })
        assert res.status_code == 401

    def test_login_nonexistent_user(self, client):
        res = client.post("/api/auth/login", json={
            "username": "ghost", "password": "Whatever1",
        })
        assert res.status_code == 401


class TestMe:
    def test_me_authenticated(self, client, auth_headers):
        res = client.get("/api/auth/me", headers=auth_headers)
        assert res.status_code == 200
        assert res.json()["username"] == "testuser"

    def test_me_no_token(self, client):
        res = client.get("/api/auth/me")
        assert res.status_code == 401
