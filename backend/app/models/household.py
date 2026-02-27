"""
MacroMate – Household Model
Allows users to group into households for shared meal planning.
Invite codes expire after 48h and can be regenerated.
"""

import secrets
from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship

from app.database import Base


def generate_invite_code() -> str:
    """Generate a secure 8-char uppercase invite code."""
    return secrets.token_urlsafe(6)[:8].upper()


class Household(Base):
    __tablename__ = "households"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    invite_code = Column(String(20), unique=True, nullable=False, default=generate_invite_code)
    invite_expires_at = Column(DateTime(timezone=True), nullable=True)
    max_members = Column(Integer, nullable=False, default=5)
    created_by = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    members = relationship("User", back_populates="household", foreign_keys="User.household_id")

    def __repr__(self):
        return f"<Household(id={self.id}, name='{self.name}')>"
