# 🍽️ MacroMate – Smart Meal Prep Planner

Eine moderne Web-App zur Mahlzeitenplanung basierend auf Kalorien- und Makronährstoffzielen.

## Techstack

| Layer     | Technologie                        |
|-----------|------------------------------------|
| Frontend  | React 18 + TypeScript + Vite       |
| Styling   | Tailwind CSS 3                     |
| State     | Zustand                            |
| Backend   | FastAPI (Python 3.11+)             |
| Datenbank | SQLite (lokal)                     |
| Auth      | JWT + bcrypt (gehashte Passwörter) |

## Schnellstart

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
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
