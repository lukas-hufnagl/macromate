# 🍽️ MacroMate – Smart Meal Prep Planner

Eine moderne SaaS-Web-App zur KI-gestützten Mahlzeitenplanung basierend auf Kalorien- und Makronährstoffzielen. Mit Landing Page, Abo-System (Lemon Squeezy), Rezept-Favoriten, Bilderkennung und professionellem UI.

## Techstack

| Layer      | Technologie                                     |
|------------|-------------------------------------------------|
| Frontend   | React 18 + TypeScript + Vite 6                  |
| Styling    | Tailwind CSS 3 (Dark/Light Mode, Glass-Cards)   |
| State      | Zustand (Auth, Recipes, MealPlans, Subscription) |
| Backend    | FastAPI (Python 3.14+)                           |
| Datenbank  | PostgreSQL 16                                    |
| Auth       | JWT + bcrypt (gehashte Passwörter)               |
| Payments   | Lemon Squeezy (Merchant of Record)               |
| KI         | Google Gemini (Nutrition Calc + Bilderkennung)   |
| DevOps     | Docker, Gunicorn, Nginx, Alembic                 |
| Tests      | pytest (88 Tests)                                |

## Schnellstart

### Docker (empfohlen)
```bash
# Entwicklung
docker compose up -d

# Produktion
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```
App öffnen: **http://localhost**

### Manuell

#### Backend
```bash
cd backend
cp .env.example .env          # Env-Vars anpassen
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

App öffnen: **http://localhost:5173**

## Features

### Kernfunktionen
- ✅ **Landing Page** – Professionelle SaaS-Startseite mit Hero, Features, Pricing, FAQ
- ✅ **User-Registrierung & Login** – JWT + bcrypt, geschützte Routen
- ✅ **Rezeptverwaltung** – Erstellen, bearbeiten, löschen mit Schritt-für-Schritt-Anleitung
- ✅ **Makro-Tracking** – Kalorien-, Protein-, Fett- und Kohlenhydrat-Ziele
- ✅ **Tagesplan-Generator** – Greedy-Algorithmus mit Scoring für optimale Rezeptauswahl
- ✅ **Einkaufsliste** – Automatisch aus Meal Plans generiert, nach Zeitraum filterbar
- ✅ **Rezept-Favoriten** – Herz-Button mit optimistischem UI-Update
- ✅ **Nährwert-Analyse** – Pro Zutat und pro Mahlzeit

### KI-Features (Pro-Plan)
- ✅ **KI-Nährwertberechnung** – Google Gemini berechnet Nährwerte aus Zutaten
- ✅ **KI-Bilderkennung** – Rezept automatisch aus Foto extrahieren
- ✅ **Zutatenerkennung** – OpenFoodFacts + Gemini-Fallback

### Abo-System
- ✅ **Lemon Squeezy Integration** – Merchant of Record (Steuern automatisch)
- ✅ **3 Pricing-Tiers** – Free (0€), Pro (4,99€/Mo), Team (9,99€/Mo)
- ✅ **Webhook-Handler** – Subscription Created/Updated/Cancelled/Expired/Paused
- ✅ **Feature-Gating** – Free-Tier-Limits (10 Rezepte, kein KI)

### UI/UX
- ✅ **Dark/Light Mode** – Solide Backgrounds im Light Mode, Glass-Cards im Dark Mode
- ✅ **Responsive Design** – Mobile-first, Tailwind CSS
- ✅ **4 Sprachen** – DE, EN, TR, RU (i18n)
- ✅ **Onboarding Tour** – Interaktive Einführung für neue User

## Architektur

```
macromate/
├── frontend/              # React SPA
│   ├── src/
│   │   ├── components/    # UI-Komponenten (RecipeForm, Navbar, etc.)
│   │   ├── pages/         # LandingPage, Dashboard, Recipes, MealPlanner, ...
│   │   ├── stores/        # Zustand Stores (auth, recipe, mealPlan, subscription)
│   │   ├── services/      # API Client (axios)
│   │   └── types/         # TypeScript Interfaces
│   └── ...
├── backend/               # FastAPI Server
│   ├── app/
│   │   ├── routers/       # auth, recipes, mealplans, subscriptions, favorites
│   │   ├── models/        # SQLAlchemy Models (User, Recipe, Subscription, ...)
│   │   ├── schemas/       # Pydantic Schemas
│   │   └── services/      # MealPlan Generator, Nutrition Calculator
│   └── tests/             # 88 Tests (pytest)
├── docker-compose.yml     # Entwicklung
├── docker-compose.prod.yml # Produktion
└── nginx.conf             # Reverse Proxy
```

## API Endpoints

| Method | Endpoint | Beschreibung |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registrierung |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Aktueller User |
| POST | `/api/auth/change-password` | Passwort ändern |
| GET | `/api/recipes` | Rezepte auflisten (Filter: category, meal_type, search) |
| POST | `/api/recipes` | Rezept erstellen |
| PUT | `/api/recipes/{id}` | Rezept aktualisieren |
| DELETE | `/api/recipes/{id}` | Rezept löschen |
| POST | `/api/recipes/calculate-nutrition` | KI-Nährwertberechnung |
| POST | `/api/mealplans/generate` | Tagesplan generieren |
| GET | `/api/mealplans` | Pläne auflisten |
| GET | `/api/mealplans/shopping-list/` | Einkaufsliste |
| GET | `/api/subscriptions/status` | Abo-Status |
| POST | `/api/subscriptions/checkout-url` | Lemon Squeezy Checkout |
| POST | `/api/subscriptions/webhook` | Webhook-Handler |
| GET | `/api/favorites/` | Favoriten-IDs |
| POST | `/api/favorites/{recipe_id}` | Favorit hinzufügen |
| DELETE | `/api/favorites/{recipe_id}` | Favorit entfernen |
| POST | `/api/recognize/` | KI-Bilderkennung |

## Tests

```bash
cd backend
python -m pytest tests/ -v
```

**88 Tests** in 6 Testdateien:

| Datei | Bereich | Tests |
|-------|---------|-------|
| `test_auth.py` | Registrierung, Login, Token | 10 |
| `test_extended.py` | Passwort, Filter, Ingredients | 12 |
| `test_recipes.py` | CRUD, Autorisierung | 6 |
| `test_favorites.py` | Favoriten CRUD, Isolation | 11 |
| `test_mealplans.py` | Generierung, Shopping List | 13 |
| `test_mealplan_generator.py` | Algorithmus Unit-Tests | 13 |
| `test_subscriptions.py` | Abo-Status, Webhooks, Model | 17 |
| `test_health.py` | Health Check, Security Headers | 3 |

## Umgebungsvariablen

Siehe [backend/.env.example](backend/.env.example) für alle konfigurierbaren Variablen:

| Variable | Beschreibung |
|----------|-------------|
| `APP_ENV` | `develop` / `test` / `production` |
| `DATABASE_URL` | PostgreSQL Connection String |
| `SECRET_KEY` | JWT-Secret (Pflicht in Production) |
| `GEMINI_API_KEY` | Google Gemini API Key |
| `LEMONSQUEEZY_STORE_ID` | Lemon Squeezy Store ID |
| `LEMONSQUEEZY_API_KEY` | Lemon Squeezy API Key |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Webhook Signature Secret |
| `LEMONSQUEEZY_VARIANT_MAP` | JSON: Variant-ID → Plan Mapping |

## Lizenz

Privates Projekt.
