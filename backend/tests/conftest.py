"""
MacroMate – Test Configuration (conftest.py)
Verwendet eine PostgreSQL test-DB (per TEST_DATABASE_URL konfigurierbar).
"""

import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Test-DB: PostgreSQL (docker compose up db → macromate_test DB)
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql://macromate:macromate@localhost:5432/macromate_test",
)

# Environment auf test setzen BEVOR app importiert wird
os.environ["APP_ENV"] = "test"
os.environ["DATABASE_URL"] = TEST_DATABASE_URL
os.environ["SECRET_KEY"] = "test-secret-key-do-not-use-in-production"

from app.database import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.limiter import limiter  # noqa: E402

# Rate-Limiting in Tests deaktivieren
limiter.enabled = False

# ── Test Engine & Session ──
engine = create_engine(TEST_DATABASE_URL)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Test-DB Session Dependency Override."""
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Erstellt alle Tabellen einmalig für die Test-Session."""
    # Alle Models importieren
    from app.models.user import User  # noqa: F401
    from app.models.recipe import Recipe  # noqa: F401
    from app.models.ingredient import Ingredient  # noqa: F401
    from app.models.mealplan import MealPlan, MealPlanEntry  # noqa: F401

    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(autouse=True)
def clean_tables():
    """Leert alle Tabellen nach jedem Test für Isolation."""
    yield
    with engine.connect() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(table.delete())
        conn.commit()


@pytest.fixture
def client():
    """FastAPI TestClient."""
    return TestClient(app)


@pytest.fixture
def db():
    """Direkte DB-Session für Tests."""
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def auth_headers(client):
    """Registriert einen Test-User und gibt Auth-Headers zurück."""
    response = client.post("/api/auth/register", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "TestPass123",
    })
    assert response.status_code == 201
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
