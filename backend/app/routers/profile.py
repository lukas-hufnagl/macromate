"""
MacroMate – Profile Router
Handles user profile, onboarding, and TDEE calculation.
Uses Mifflin-St Jeor equation for BMR.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_user
from app.models.user import User
from app.schemas.user import ProfileUpdate, ProfileResponse, TDEEResponse

router = APIRouter(prefix="/api/profile", tags=["Profile"])

ACTIVITY_MULTIPLIERS = {
    "sedentary": 1.2,
    "light": 1.375,
    "moderate": 1.55,
    "active": 1.725,
    "very_active": 1.9,
}


def calculate_tdee(gender: str, age: int, height_cm: float, weight_kg: float, activity_level: str, goal: str) -> TDEEResponse:
    """Mifflin-St Jeor BMR + activity multiplier + goal adjustment."""
    if gender == "male":
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    else:
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161

    multiplier = ACTIVITY_MULTIPLIERS.get(activity_level, 1.55)
    tdee = bmr * multiplier

    if goal == "lose":
        target = tdee - 500
    elif goal == "gain":
        target = tdee + 300
    else:
        target = tdee

    target = max(1200, round(target))

    # Macro split based on goal
    if goal == "gain":
        protein_g = round(weight_kg * 2.0)
        fat_g = round(target * 0.25 / 9)
        carbs_g = round((target - protein_g * 4 - fat_g * 9) / 4)
    elif goal == "lose":
        protein_g = round(weight_kg * 2.2)
        fat_g = round(target * 0.25 / 9)
        carbs_g = round((target - protein_g * 4 - fat_g * 9) / 4)
    else:
        protein_g = round(weight_kg * 1.8)
        fat_g = round(target * 0.28 / 9)
        carbs_g = round((target - protein_g * 4 - fat_g * 9) / 4)

    carbs_g = max(50, carbs_g)

    return TDEEResponse(
        bmr=round(bmr, 1),
        tdee=round(tdee, 1),
        target_calories=target,
        protein_g=protein_g,
        fat_g=fat_g,
        carbs_g=carbs_g,
        goal=goal,
    )


@router.get("", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("", response_model=ProfileResponse)
def update_profile(
    data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)

    all_fields = [current_user.gender, current_user.age, current_user.height_cm,
                  current_user.weight_kg, current_user.activity_level, current_user.goal]
    if all(f is not None for f in all_fields):
        current_user.onboarding_completed = True

    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/tdee", response_model=TDEEResponse)
def get_tdee(current_user: User = Depends(get_current_user)):
    if not all([current_user.gender, current_user.age, current_user.height_cm,
                current_user.weight_kg, current_user.activity_level, current_user.goal]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profil unvollständig. Bitte zuerst Onboarding abschließen.",
        )

    return calculate_tdee(
        gender=current_user.gender,
        age=current_user.age,
        height_cm=current_user.height_cm,
        weight_kg=current_user.weight_kg,
        activity_level=current_user.activity_level,
        goal=current_user.goal,
    )


@router.post("/tdee/preview", response_model=TDEEResponse)
def preview_tdee(data: ProfileUpdate):
    """Preview TDEE without saving (for onboarding wizard)."""
    if not all([data.gender, data.age, data.height_cm, data.weight_kg, data.activity_level, data.goal]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Alle Felder erforderlich für TDEE-Berechnung.",
        )
    return calculate_tdee(
        gender=data.gender,
        age=data.age,
        height_cm=data.height_cm,
        weight_kg=data.weight_kg,
        activity_level=data.activity_level,
        goal=data.goal,
    )
