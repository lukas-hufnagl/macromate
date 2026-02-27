"""
MacroMate – Household Schemas
"""

from datetime import datetime
from pydantic import BaseModel, Field


class HouseholdCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)


class HouseholdMemberResponse(BaseModel):
    id: int
    username: str

    model_config = {"from_attributes": True}


class HouseholdResponse(BaseModel):
    id: int
    name: str
    invite_code: str
    invite_expires_at: datetime | None = None
    max_members: int = 5
    created_by: int
    members: list[HouseholdMemberResponse] = []
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class HouseholdJoin(BaseModel):
    invite_code: str = Field(..., min_length=4, max_length=20)
