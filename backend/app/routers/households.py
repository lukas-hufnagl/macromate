"""
MacroMate – Household Router
Create, join, leave households for shared meal planning.
Security: expiring invite codes, max-member limits, creator-only management.
"""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_user
from app.models.user import User
from app.models.household import Household, generate_invite_code
from app.schemas.household import HouseholdCreate, HouseholdResponse, HouseholdJoin

router = APIRouter(prefix="/api/households", tags=["Households"])

INVITE_CODE_VALIDITY_HOURS = 48


@router.post("", response_model=HouseholdResponse, status_code=status.HTTP_201_CREATED)
def create_household(
    data: HouseholdCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.household_id:
        raise HTTPException(status_code=400, detail="Du bist bereits in einem Haushalt. Verlasse ihn zuerst.")

    name = data.name.strip()
    if len(name) < 2 or len(name) > 50:
        raise HTTPException(status_code=400, detail="Haushaltsname muss zwischen 2 und 50 Zeichen lang sein.")

    household = Household(
        name=name,
        created_by=current_user.id,
        invite_expires_at=datetime.now(timezone.utc) + timedelta(hours=INVITE_CODE_VALIDITY_HOURS),
    )
    db.add(household)
    db.flush()

    current_user.household_id = household.id
    db.commit()
    db.refresh(household)
    return household


@router.get("/mine", response_model=HouseholdResponse | None)
def get_my_household(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.household_id:
        return None
    return db.query(Household).filter(Household.id == current_user.household_id).first()


@router.post("/join", response_model=HouseholdResponse)
def join_household(
    data: HouseholdJoin,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.household_id:
        raise HTTPException(status_code=400, detail="Du bist bereits in einem Haushalt. Verlasse ihn zuerst.")

    code = data.invite_code.strip().upper()
    household = db.query(Household).filter(Household.invite_code == code).first()

    if not household:
        raise HTTPException(status_code=404, detail="Ungültiger Einladungscode.")

    # Check expiry
    if household.invite_expires_at and household.invite_expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="Einladungscode abgelaufen. Bitte fordere einen neuen an.")

    # Check member limit
    member_count = db.query(User).filter(User.household_id == household.id).count()
    if member_count >= household.max_members:
        raise HTTPException(status_code=403, detail=f"Haushalt ist voll (max. {household.max_members} Mitglieder).")

    current_user.household_id = household.id
    db.commit()
    db.refresh(household)
    return household


@router.post("/regenerate-code", response_model=HouseholdResponse)
def regenerate_invite_code(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Regenerate invite code (creator only). Extends validity by 48h."""
    if not current_user.household_id:
        raise HTTPException(status_code=400, detail="Du bist in keinem Haushalt.")

    household = db.query(Household).filter(Household.id == current_user.household_id).first()
    if not household or household.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Nur der Ersteller kann den Code erneuern.")

    household.invite_code = generate_invite_code()
    household.invite_expires_at = datetime.now(timezone.utc) + timedelta(hours=INVITE_CODE_VALIDITY_HOURS)
    db.commit()
    db.refresh(household)
    return household


@router.post("/leave")
def leave_household(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.household_id:
        raise HTTPException(status_code=400, detail="Du bist in keinem Haushalt.")

    household_id = current_user.household_id
    current_user.household_id = None
    db.commit()

    remaining = db.query(User).filter(User.household_id == household_id).count()
    if remaining == 0:
        household = db.query(Household).filter(Household.id == household_id).first()
        if household:
            db.delete(household)
            db.commit()

    return {"detail": "Haushalt verlassen."}


@router.delete("/remove-member/{user_id}")
def remove_member(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a member from the household (creator only)."""
    if not current_user.household_id:
        raise HTTPException(status_code=400, detail="Du bist in keinem Haushalt.")

    household = db.query(Household).filter(Household.id == current_user.household_id).first()
    if not household or household.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Nur der Ersteller kann Mitglieder entfernen.")

    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Du kannst dich nicht selbst entfernen. Nutze 'Verlassen'.")

    target = db.query(User).filter(User.id == user_id, User.household_id == household.id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Mitglied nicht gefunden.")

    target.household_id = None
    db.commit()
    return {"detail": f"{target.username} wurde entfernt."}


@router.get("/{household_id}/mealplans")
def get_household_mealplans(
    household_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.household_id != household_id:
        raise HTTPException(status_code=403, detail="Kein Zugriff auf diesen Haushalt.")

    from app.models.mealplan import MealPlan
    members = db.query(User).filter(User.household_id == household_id).all()
    member_ids = [m.id for m in members]

    plans = db.query(MealPlan).filter(MealPlan.user_id.in_(member_ids)).order_by(MealPlan.date.desc()).limit(30).all()

    return [
        {
            "id": p.id,
            "user_id": p.user_id,
            "username": next((m.username for m in members if m.id == p.user_id), "?"),
            "date": p.date.isoformat() if p.date else None,
            "target_calories": p.target_calories,
            "target_protein": p.target_protein,
            "target_fat": p.target_fat,
            "target_carbs": p.target_carbs,
        }
        for p in plans
    ]
