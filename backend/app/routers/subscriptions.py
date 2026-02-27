"""
MacroMate – Subscription Router
Lemon Squeezy Webhook-Handling + Abo-Status-Endpoints.
"""

import hashlib
import hmac
import json
import logging
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.config import settings
from app.database import get_db
from app.models.subscription import Subscription
from app.models.user import User
from app.schemas.subscription import SubscriptionResponse, SubscriptionStatus

logger = logging.getLogger("macromate.subscriptions")

router = APIRouter(prefix="/api/subscriptions", tags=["subscriptions"])

# ── Plan Feature Mapping ──
PLAN_FEATURES = {
    "free": [
        "10 Rezepte",
        "Tägliche Meal Plans",
        "Einkaufslisten-Export",
        "Nährwert-Tracking",
        "4 Sprachen",
    ],
    "pro": [
        "Unbegrenzte Rezepte",
        "Wöchentliche Meal Plans",
        "Erweiterte Makro-Filter",
        "Favoriten & Sammlungen",
        "Nährwert-Datenbank (OpenFoodFacts)",
        "Prioritäts-Support",
    ],
    "team": [
        "Alles aus Pro",
        "Bis zu 5 Mitglieder",
        "Geteilte Rezeptsammlungen",
        "Gemeinsame Meal Plans",
        "Familien-Einkaufslisten",
        "Admin-Dashboard",
        "Premium-Support",
    ],
}

# ── Lemon Squeezy Variant → Plan Mapping ──
# Configure these with your actual Lemon Squeezy variant IDs
VARIANT_PLAN_MAP: dict[str, str] = {}
# Example: {"123456": "pro", "789012": "team"}
# Will be populated from env var LEMONSQUEEZY_VARIANT_MAP if set


def _get_variant_plan_map() -> dict[str, str]:
    """Parses variant map from config."""
    raw = getattr(settings, "LEMONSQUEEZY_VARIANT_MAP", "")
    if not raw:
        return VARIANT_PLAN_MAP
    try:
        return json.loads(raw)
    except Exception:
        return VARIANT_PLAN_MAP


def _get_user_plan(db: Session, user_id: int) -> tuple[str, bool]:
    """Returns (plan, is_active) for a user."""
    sub = db.query(Subscription).filter(
        Subscription.user_id == user_id
    ).first()

    if not sub:
        return "free", True

    if sub.is_active:
        return sub.plan, True

    return "free", True  # Expired → back to free


@router.get("/status", response_model=SubscriptionStatus)
def get_subscription_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Gibt den aktuellen Abo-Status des Users zurück."""
    plan, is_active = _get_user_plan(db, current_user.id)
    is_premium = plan != "free" and is_active

    return SubscriptionStatus(
        plan=plan,
        is_active=is_active,
        is_premium=is_premium,
        features=PLAN_FEATURES.get(plan, PLAN_FEATURES["free"]),
    )


@router.get("/", response_model=SubscriptionResponse | None)
def get_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Gibt die aktuelle Subscription zurück (oder null)."""
    sub = db.query(Subscription).filter(
        Subscription.user_id == current_user.id
    ).first()

    if not sub:
        return None
    return sub


@router.post("/checkout-url")
def get_checkout_url(
    variant_id: str,
    current_user: User = Depends(get_current_user),
):
    """
    Gibt die Lemon Squeezy Checkout-URL für den User zurück.
    Das Frontend öffnet diese URL im Browser.
    """
    store_id = getattr(settings, "LEMONSQUEEZY_STORE_ID", "")
    if not store_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Payment-System ist noch nicht konfiguriert.",
        )

    # Build checkout URL with pre-filled user data
    checkout_url = (
        f"https://{store_id}.lemonsqueezy.com/checkout/buy/{variant_id}"
        f"?checkout[email]={current_user.email}"
        f"&checkout[custom][user_id]={current_user.id}"
    )

    return {"checkout_url": checkout_url}


@router.post("/webhook", include_in_schema=False)
async def lemon_squeezy_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Lemon Squeezy Webhook Endpoint.
    Events: subscription_created, subscription_updated, subscription_cancelled, subscription_expired, subscription_paused, subscription_resumed
    """
    # ── Signature Verification ──
    webhook_secret = getattr(settings, "LEMONSQUEEZY_WEBHOOK_SECRET", "")
    if webhook_secret:
        signature = request.headers.get("X-Signature", "")
        body = await request.body()
        expected = hmac.new(
            webhook_secret.encode(),
            body,
            hashlib.sha256,
        ).hexdigest()

        if not hmac.compare_digest(signature, expected):
            logger.warning("Webhook signature mismatch!")
            raise HTTPException(status_code=400, detail="Invalid signature")
    else:
        body = await request.body()

    try:
        payload = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    event_name = payload.get("meta", {}).get("event_name", "")
    data = payload.get("data", {})
    attributes = data.get("attributes", {})

    logger.info("Lemon Squeezy webhook: %s", event_name)

    # Extract user_id from custom data
    custom_data = payload.get("meta", {}).get("custom_data", {})
    user_id = custom_data.get("user_id")

    if not user_id:
        # Try from first_subscription_item
        user_id = attributes.get("custom_data", {}).get("user_id")

    if not user_id:
        logger.warning("Webhook missing user_id: %s", event_name)
        return {"status": "ok", "detail": "no user_id"}

    user_id = int(user_id)
    ls_subscription_id = str(data.get("id", ""))
    ls_customer_id = str(attributes.get("customer_id", ""))
    ls_variant_id = str(attributes.get("variant_id", ""))
    ls_product_id = str(attributes.get("product_id", ""))
    ls_status = attributes.get("status", "active")

    # Determine plan from variant
    variant_map = _get_variant_plan_map()
    plan = variant_map.get(ls_variant_id, "pro")  # Default to pro

    # Parse dates
    period_start = None
    period_end = None
    cancelled_at = None
    if attributes.get("renews_at"):
        try:
            period_end = datetime.fromisoformat(attributes["renews_at"].replace("Z", "+00:00"))
        except Exception:
            pass
    if attributes.get("created_at"):
        try:
            period_start = datetime.fromisoformat(attributes["created_at"].replace("Z", "+00:00"))
        except Exception:
            pass
    if attributes.get("cancelled_at"):
        try:
            cancelled_at = datetime.fromisoformat(attributes["cancelled_at"].replace("Z", "+00:00"))
        except Exception:
            pass

    # Map LS status to our status
    status_map = {
        "active": "active",
        "past_due": "past_due",
        "cancelled": "cancelled",
        "expired": "expired",
        "paused": "paused",
        "on_trial": "active",
    }
    mapped_status = status_map.get(ls_status, "active")

    if event_name in ("subscription_created",):
        # Create or update subscription
        sub = db.query(Subscription).filter(
            Subscription.user_id == user_id
        ).first()

        if sub:
            sub.ls_subscription_id = ls_subscription_id
            sub.ls_customer_id = ls_customer_id
            sub.ls_variant_id = ls_variant_id
            sub.ls_product_id = ls_product_id
            sub.plan = plan
            sub.status = mapped_status
            sub.current_period_start = period_start
            sub.current_period_end = period_end
            sub.cancelled_at = None
        else:
            sub = Subscription(
                user_id=user_id,
                ls_subscription_id=ls_subscription_id,
                ls_customer_id=ls_customer_id,
                ls_variant_id=ls_variant_id,
                ls_product_id=ls_product_id,
                plan=plan,
                status=mapped_status,
                current_period_start=period_start,
                current_period_end=period_end,
            )
            db.add(sub)

        # Update user premium status
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.is_premium = True

        db.commit()
        logger.info("Subscription created for user %d: plan=%s", user_id, plan)

    elif event_name in ("subscription_updated", "subscription_resumed"):
        sub = db.query(Subscription).filter(
            Subscription.user_id == user_id
        ).first()

        if sub:
            sub.status = mapped_status
            sub.plan = plan
            sub.current_period_end = period_end
            sub.ls_variant_id = ls_variant_id

            user = db.query(User).filter(User.id == user_id).first()
            if user:
                user.is_premium = mapped_status in ("active", "past_due")

            db.commit()
            logger.info("Subscription updated for user %d: status=%s", user_id, mapped_status)

    elif event_name in ("subscription_cancelled", "subscription_expired", "subscription_paused"):
        sub = db.query(Subscription).filter(
            Subscription.user_id == user_id
        ).first()

        if sub:
            sub.status = mapped_status
            sub.cancelled_at = cancelled_at

            # If expired, remove premium
            if event_name == "subscription_expired":
                user = db.query(User).filter(User.id == user_id).first()
                if user:
                    user.is_premium = False

            db.commit()
            logger.info("Subscription %s for user %d", event_name, user_id)

    return {"status": "ok"}
