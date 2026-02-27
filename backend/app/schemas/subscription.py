"""
MacroMate – Subscription Schemas (Pydantic)
Request/Response-Modelle für Abo-Management.
"""

from datetime import datetime
from pydantic import BaseModel


class SubscriptionResponse(BaseModel):
    """Öffentliche Subscription-Daten."""
    id: int
    plan: str
    status: str
    current_period_start: datetime | None = None
    current_period_end: datetime | None = None
    cancelled_at: datetime | None = None
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class SubscriptionStatus(BaseModel):
    """Einfacher Abo-Status für das Frontend."""
    plan: str  # free | pro | team
    is_active: bool
    is_premium: bool  # Convenience: plan != 'free' && is_active
    features: list[str]


class LemonSqueezyWebhookPayload(BaseModel):
    """Webhook-Payload von Lemon Squeezy (vereinfacht)."""
    meta: dict
    data: dict
