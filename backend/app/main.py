"""
MacroMate – FastAPI Application Entry Point
Production-ready mit Logging, Rate-Limiting, Security Headers & Error Handling.
"""

import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import settings
from app.database import engine, Base
from app.limiter import limiter

# ── Alle Models importieren, damit SQLAlchemy sie kennt ──
from app.models.user import User  # noqa: F401
from app.models.recipe import Recipe  # noqa: F401
from app.models.ingredient import Ingredient  # noqa: F401
from app.models.mealplan import MealPlan, MealPlanEntry  # noqa: F401
from app.models.subscription import Subscription  # noqa: F401
from app.models.favorite import Favorite  # noqa: F401
from app.models.household import Household  # noqa: F401
# ── Router importieren ──
from app.routers import auth, recipes, mealplans, ingredients, subscriptions, favorites, profile, households

# ── Logging ──
logging.basicConfig(
    level=logging.INFO if settings.APP_ENV != "production" else logging.WARNING,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("macromate")


# ── Lifespan (ersetzt deprecated @app.on_event) ──
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup & Shutdown Logik."""
    # ── Startup ──
    logger.info("🚀 MacroMate startet (APP_ENV=%s)", settings.APP_ENV)
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Datenbank-Tabellen erstellt / verifiziert")

    # Premium-User Setup
    from app.database import SessionLocal
    from app.models.user import User as UserModel
    db = SessionLocal()
    try:
        for email in settings.premium_email_list:
            user = db.query(UserModel).filter(UserModel.email == email).first()
            if user and not user.is_premium:
                user.is_premium = True
                db.commit()
                logger.info("👑 Premium aktiviert für: %s", email)
    except Exception as e:
        logger.error("Premium-Setup Fehler: %s", e)
    finally:
        db.close()

    yield  # ← App läuft

    # ── Shutdown ──
    logger.info("MacroMate wird beendet.")


# ── App erstellen ──
app = FastAPI(
    title="MacroMate API",
    description="Smart Meal Prep Planner – REST API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs" if settings.APP_ENV != "production" else None,
    redoc_url="/api/redoc" if settings.APP_ENV != "production" else None,
)

# ── Rate Limiter registrieren ──
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# ── Security Headers Middleware ──
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        if settings.APP_ENV == "production":
            response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
        return response


# ── Request Logging Middleware ──
class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start) * 1000
        logger.info(
            "%s %s → %s (%.0fms)",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
        )
        return response


# Middleware-Reihenfolge: zuletzt hinzugefügt = zuerst ausgeführt
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Global Exception Handler ──
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Fängt alle unbehandelten Exceptions und gibt sauberes JSON zurück."""
    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Interner Serverfehler. Bitte versuche es später erneut."
            if settings.APP_ENV == "production"
            else str(exc),
        },
    )


# ── Router einbinden ──
app.include_router(auth.router)
app.include_router(recipes.router)
app.include_router(mealplans.router)
app.include_router(ingredients.router)
app.include_router(subscriptions.router)
app.include_router(favorites.router)
app.include_router(profile.router)
app.include_router(households.router)


@app.get("/api/health")
def health_check():
    """Health-Check Endpoint."""
    return {
        "status": "ok",
        "app": "MacroMate",
        "version": "1.0.0",
        "env": settings.APP_ENV,
    }
