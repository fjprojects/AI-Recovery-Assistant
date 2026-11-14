# AI Recovery Assistant

A **React + Django** starter for a movement-session and rehabilitation-support interface concept.

## Stack
- React 19.3 + Vite 8 frontend
- Django 6.1 JSON API
- Vite proxies local `/api` calls to Django on port 8000

## Structure
- `frontend/` — React application and preserved earlier prototype at `public/prototype.html`
- `backend/` — Django project and JSON endpoints

## Run locally

### Terminal 1 — Django API
```bash
cd backend
python -m venv .venv
# Windows PowerShell: .venv\\Scripts\\Activate.ps1
# macOS/Linux: source .venv/bin/activate
python -m pip install -r requirements.txt
python manage.py runserver 8000
```

### Terminal 2 — React frontend
```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`). The React page fetches `GET /api/health/` and `GET /api/exercises/`.

## Production configuration
Set `VITE_API_BASE_URL` in `frontend/.env.local` to the deployed Django backend URL before building. On the backend configure `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=false`, `DJANGO_ALLOWED_HOSTS`, and `CORS_ALLOWED_ORIGINS`.

## Prototype scope
The listed movements are illustrative UI examples, not an exercise prescription. This project does not analyse camera footage, diagnose conditions, or replace guidance from a qualified healthcare professional. The first HTML demo is preserved separately; its UI has not yet been rewritten as React components.
