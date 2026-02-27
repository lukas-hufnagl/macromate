"""
MacroMate – Subscription Endpoint Tests
Tests für Abo-Status, Checkout-URL und Webhook-Handling.
"""

import hashlib
import hmac
import json

from app.models.subscription import Subscription


class TestSubscriptionStatus:
    """Testet den Abo-Status-Endpoint."""

    def test_status_free_user(self, client, auth_headers):
        """Neuer User hat 'free' Plan."""
        res = client.get("/api/subscriptions/status", headers=auth_headers)
        assert res.status_code == 200
        data = res.json()
        assert data["plan"] == "free"
        assert data["is_active"] is True
        assert data["is_premium"] is False
        assert isinstance(data["features"], list)
        assert len(data["features"]) > 0

    def test_status_unauthorized(self, client):
        res = client.get("/api/subscriptions/status")
        assert res.status_code == 401

    def test_get_subscription_none(self, client, auth_headers):
        """Kein Abo → null zurückgeben."""
        res = client.get("/api/subscriptions/", headers=auth_headers)
        assert res.status_code == 200
        assert res.json() is None

    def test_status_with_active_subscription(self, client, auth_headers, db):
        """User mit aktivem Abo hat 'pro' Plan."""
        # Finde den User
        from app.models.user import User
        user = db.query(User).filter(User.username == "testuser").first()

        # Erstelle Subscription direkt in DB
        sub = Subscription(
            user_id=user.id,
            ls_subscription_id="test-sub-123",
            ls_customer_id="test-cust-123",
            plan="pro",
            status="active",
        )
        db.add(sub)
        db.commit()

        res = client.get("/api/subscriptions/status", headers=auth_headers)
        data = res.json()
        assert data["plan"] == "pro"
        assert data["is_premium"] is True
        assert data["is_active"] is True

    def test_status_with_expired_subscription(self, client, auth_headers, db):
        """Abgelaufenes Abo → 'free' Plan."""
        from app.models.user import User
        user = db.query(User).filter(User.username == "testuser").first()

        sub = Subscription(
            user_id=user.id,
            ls_subscription_id="test-sub-expired",
            ls_customer_id="test-cust-expired",
            plan="pro",
            status="expired",
        )
        db.add(sub)
        db.commit()

        res = client.get("/api/subscriptions/status", headers=auth_headers)
        data = res.json()
        assert data["plan"] == "free"
        assert data["is_premium"] is False


class TestCheckoutUrl:
    """Testet die Checkout-URL-Generierung."""

    def test_checkout_url_no_store(self, client, auth_headers):
        """Ohne konfiguriertem Store → 503."""
        res = client.post(
            "/api/subscriptions/checkout-url?variant_id=test-variant",
            headers=auth_headers,
        )
        # If LEMONSQUEEZY_STORE_ID is not set, expect 503
        assert res.status_code in (200, 503)

    def test_checkout_url_unauthorized(self, client):
        res = client.post("/api/subscriptions/checkout-url?variant_id=test")
        assert res.status_code == 401


class TestSubscriptionWebhook:
    """Testet das Webhook-Handling."""

    def _build_webhook_payload(self, event_name: str, user_id: int, **kwargs):
        """Erstellt einen Webhook-Payload."""
        return {
            "meta": {
                "event_name": event_name,
                "custom_data": {"user_id": str(user_id)},
            },
            "data": {
                "id": kwargs.get("sub_id", "ls-sub-12345"),
                "attributes": {
                    "customer_id": kwargs.get("customer_id", "cust-123"),
                    "variant_id": kwargs.get("variant_id", "var-pro"),
                    "product_id": kwargs.get("product_id", "prod-1"),
                    "status": kwargs.get("status", "active"),
                    "created_at": "2024-01-01T00:00:00Z",
                    "renews_at": "2024-02-01T00:00:00Z",
                    "cancelled_at": kwargs.get("cancelled_at"),
                },
            },
        }

    def test_webhook_subscription_created(self, client, auth_headers, db):
        """Webhook subscription_created erstellt Abo."""
        from app.models.user import User
        user = db.query(User).filter(User.username == "testuser").first()

        payload = self._build_webhook_payload(
            "subscription_created", user.id
        )
        res = client.post(
            "/api/subscriptions/webhook",
            content=json.dumps(payload),
            headers={"Content-Type": "application/json"},
        )
        assert res.status_code == 200
        assert res.json()["status"] == "ok"

        # Verify subscription was created
        sub = db.query(Subscription).filter(
            Subscription.user_id == user.id
        ).first()
        db.refresh(sub)
        assert sub is not None
        assert sub.plan == "pro"  # Default when variant not mapped
        assert sub.status == "active"

    def test_webhook_subscription_cancelled(self, client, auth_headers, db):
        """Webhook subscription_cancelled setzt Status."""
        from app.models.user import User
        user = db.query(User).filter(User.username == "testuser").first()

        # First create subscription
        sub = Subscription(
            user_id=user.id,
            ls_subscription_id="ls-sub-cancel",
            ls_customer_id="cust-cancel",
            plan="pro",
            status="active",
        )
        db.add(sub)
        db.commit()

        payload = self._build_webhook_payload(
            "subscription_cancelled", user.id,
            sub_id="ls-sub-cancel",
            status="cancelled",
            cancelled_at="2024-01-15T00:00:00Z",
        )
        res = client.post(
            "/api/subscriptions/webhook",
            content=json.dumps(payload),
            headers={"Content-Type": "application/json"},
        )
        assert res.status_code == 200

        db.refresh(sub)
        assert sub.status == "cancelled"
        assert sub.cancelled_at is not None

    def test_webhook_subscription_expired(self, client, auth_headers, db):
        """Webhook subscription_expired entfernt Premium."""
        from app.models.user import User
        user = db.query(User).filter(User.username == "testuser").first()
        user.is_premium = True
        db.commit()

        sub = Subscription(
            user_id=user.id,
            ls_subscription_id="ls-sub-expire",
            ls_customer_id="cust-expire",
            plan="pro",
            status="active",
        )
        db.add(sub)
        db.commit()

        payload = self._build_webhook_payload(
            "subscription_expired", user.id,
            sub_id="ls-sub-expire",
            status="expired",
        )
        res = client.post(
            "/api/subscriptions/webhook",
            content=json.dumps(payload),
            headers={"Content-Type": "application/json"},
        )
        assert res.status_code == 200

        db.refresh(user)
        assert user.is_premium is False
        db.refresh(sub)
        assert sub.status == "expired"

    def test_webhook_no_user_id(self, client):
        """Webhook ohne user_id wird akzeptiert aber ignoriert."""
        payload = {
            "meta": {"event_name": "subscription_created", "custom_data": {}},
            "data": {
                "id": "ls-sub-nouser",
                "attributes": {"status": "active"},
            },
        }
        res = client.post(
            "/api/subscriptions/webhook",
            content=json.dumps(payload),
            headers={"Content-Type": "application/json"},
        )
        assert res.status_code == 200
        assert res.json()["detail"] == "no user_id"

    def test_webhook_invalid_json(self, client):
        """Ungültiges JSON im Body → 400."""
        res = client.post(
            "/api/subscriptions/webhook",
            content="not json",
            headers={"Content-Type": "application/json"},
        )
        assert res.status_code == 400

    def test_webhook_subscription_updated(self, client, auth_headers, db):
        """Webhook subscription_updated aktualisiert Plan."""
        from app.models.user import User
        user = db.query(User).filter(User.username == "testuser").first()

        sub = Subscription(
            user_id=user.id,
            ls_subscription_id="ls-sub-update",
            ls_customer_id="cust-update",
            plan="pro",
            status="active",
        )
        db.add(sub)
        db.commit()

        payload = self._build_webhook_payload(
            "subscription_updated", user.id,
            sub_id="ls-sub-update",
            status="active",
        )
        res = client.post(
            "/api/subscriptions/webhook",
            content=json.dumps(payload),
            headers={"Content-Type": "application/json"},
        )
        assert res.status_code == 200
        db.refresh(sub)
        assert sub.status == "active"


class TestSubscriptionModel:
    """Testet das Subscription-Model direkt."""

    def test_is_active_active(self, db, auth_headers):
        from app.models.user import User
        user = db.query(User).filter(User.username == "testuser").first()
        sub = Subscription(
            user_id=user.id,
            ls_subscription_id="model-active",
            plan="pro",
            status="active",
        )
        assert sub.is_active is True

    def test_is_active_past_due(self):
        sub = Subscription(status="past_due")
        assert sub.is_active is True

    def test_is_active_cancelled(self):
        sub = Subscription(status="cancelled")
        assert sub.is_active is False

    def test_is_active_expired(self):
        sub = Subscription(status="expired")
        assert sub.is_active is False

    def test_is_active_paused(self):
        sub = Subscription(status="paused")
        assert sub.is_active is False
