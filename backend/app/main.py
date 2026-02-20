"""
MacroMate – FastAPI Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base

# ── Alle Models importieren, damit SQLAlchemy sie kennt ──
from app.models.user import User  # noqa: F401
from app.models.recipe import Recipe  # noqa: F401
from app.models.ingredient import Ingredient  # noqa: F401
from app.models.mealplan import MealPlan, MealPlanEntry  # noqa: F401
# ── Router importieren ──
from app.routers import auth, recipes, mealplans, image_recognition, ingredients

# ── App erstellen ──
app = FastAPI(
    title="MacroMate API",
    description="Smart Meal Prep Planner – REST API",
    version="1.0.0",
)

# ── CORS Middleware ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Router einbinden ──
app.include_router(auth.router)
app.include_router(recipes.router)
app.include_router(mealplans.router)
app.include_router(image_recognition.router)
app.include_router(ingredients.router)


@app.on_event("startup")
def on_startup():
    """Datenbank-Tabellen beim Start erstellen, falls sie noch nicht existieren."""
    Base.metadata.create_all(bind=engine)

    # ── Premium-User Setup (aus .env: PREMIUM_EMAILS) ──
    from app.database import SessionLocal
    from app.models.user import User as UserModel
    db = SessionLocal()
    try:
        for email in settings.premium_email_list:
            user = db.query(UserModel).filter(UserModel.email == email).first()
            if user and not user.is_premium:
                user.is_premium = True
                db.commit()
                print(f"✅ Premium aktiviert für: {email}")
    except Exception as e:
        print(f"⚠️ Premium-Setup Fehler: {e}")
    finally:
        db.close()


@app.get("/api/health")
def health_check():
    """Einfacher Health-Check Endpoint."""
    return {"status": "ok", "app": "MacroMate", "version": "1.0.0"}
