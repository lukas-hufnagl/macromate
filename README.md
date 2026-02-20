# 🍽️ MacroMate – Smart Meal Prep Planner

Eine moderne Web-App zur Mahlzeitenplanung basierend auf Kalorien- und Makronährstoffzielen.

## Techstack

| Layer     | Technologie                        |
|-----------|------------------------------------|
| Frontend  | React 18 + TypeScript + Vite       |
| Styling   | Tailwind CSS 3                     |
| State     | Zustand                            |
| Backend   | FastAPI (Python 3.14+)             |
| Datenbank | PostgreSQL 16                      |
| Auth      | JWT + bcrypt (gehashte Passwörter) |
| DevOps    | Docker, Gunicorn, Nginx, Alembic   |

## Schnellstart

### Docker (empfohlen)
```bash
docker compose up -d
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

## Features (MVP)
- ✅ User-Registrierung & Login (JWT + bcrypt)
- ✅ Rezepte erstellen, bearbeiten, löschen
- ✅ Kalorien- & Makroziele setzen
- ✅ Tagesplan automatisch generieren
- ✅ Nährwert-Übersicht pro Mahlzeit & Tag
- ✅ Einkaufsliste aus Meal Plan generieren
- ✅ Responsives Dark-Mode Design
