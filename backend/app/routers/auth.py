"""
MacroMate – Auth Router
Endpoints für Registrierung und Login.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import hash_password, verify_password, create_access_token, get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, db: Session = Depends(get_db)):
    """
    Neuen Benutzer registrieren.
    - Prüft ob Username/Email bereits existieren
    - Hasht das Passwort mit bcrypt
    - Erstellt JWT-Token für sofortigen Login
    """
    # Prüfe ob Username bereits vergeben
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username bereits vergeben",
        )

    # Prüfe ob Email bereits vergeben
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email bereits registriert",
        )

    # User erstellen mit gehashtem Passwort
    user = User(
        username=data.username,
        email=data.email,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Sofort Token erstellen (User ist nach Registrierung eingeloggt)
    token = create_access_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """
    Benutzer einloggen.
    - Validiert Username + Passwort
    - Gibt JWT-Token zurück
    """
    user = db.query(User).filter(User.username == data.username).first()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ungültige Anmeldedaten",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Gibt die Daten des aktuell eingeloggten Users zurück."""
    return current_user


@router.post("/change-password")
def change_password(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Passwort ändern (altes + neues Passwort erforderlich)."""
    old_password = data.get("old_password", "")
    new_password = data.get("new_password", "")

    if not verify_password(old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Altes Passwort ist falsch",
        )

    if len(new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Neues Passwort muss mindestens 8 Zeichen lang sein",
        )

    current_user.password_hash = hash_password(new_password)
    db.commit()

    return {"message": "Passwort erfolgreich geändert"}
