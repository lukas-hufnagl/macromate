"""
MacroMate – Subscription Model
Speichert Lemon Squeezy Abo-Informationen.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from app.database import Base


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Lemon Squeezy IDs
    ls_subscription_id = Column(String(100), unique=True, nullable=False, index=True)
    ls_customer_id = Column(String(100), nullable=True)
    ls_variant_id = Column(String(100), nullable=True)
    ls_product_id = Column(String(100), nullable=True)

    # Plan info
    plan = Column(String(50), nullable=False, default="free")  # free | pro | team
    status = Column(String(50), nullable=False, default="active")  # active | past_due | cancelled | expired | paused

    # Dates
    current_period_start = Column(DateTime(timezone=True), nullable=True)
    current_period_end = Column(DateTime(timezone=True), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Beziehungen
    user = relationship("User", back_populates="subscription")

    def __repr__(self):
        return f"<Subscription(id={self.id}, user_id={self.user_id}, plan='{self.plan}', status='{self.status}')>"

    @property
    def is_active(self) -> bool:
        return self.status in ("active", "past_due")
