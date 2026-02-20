"""
MacroMate – Health & General Tests
"""


class TestHealth:
    def test_health_endpoint(self, client):
        res = client.get("/api/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ok"
        assert data["app"] == "MacroMate"
        assert "env" in data

    def test_security_headers(self, client):
        res = client.get("/api/health")
        assert res.headers.get("X-Content-Type-Options") == "nosniff"
        assert res.headers.get("X-Frame-Options") == "DENY"
        assert res.headers.get("X-XSS-Protection") == "1; mode=block"


class TestNotFound:
    def test_404(self, client):
        res = client.get("/api/nonexistent")
        assert res.status_code in (404, 405)
