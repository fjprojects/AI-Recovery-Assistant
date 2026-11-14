# AI Recovery Assistant

**Reform** is a movement-information interface concept built with React and Django. It demonstrates how a structured reference library can be searched, filtered and reviewed through a clear, accessible interface.

> **Scope and safety:** This is not a rehabilitation prescription or clinical product. It does not analyse camera footage, measure real movement, recommend exercises, assess recovery or diagnose conditions. Library entries are illustrative and must not replace guidance from a qualified healthcare professional.

## Product capabilities
- Search and filter a structured movement-reference library.
- Review descriptions and professional-guidance notes for each entry.
- Save selected references to a temporary, browser-session discussion list.
- Clear API loading, empty and error states.
- Django-backed catalogue records, seed command and filtered JSON endpoints.
- Original interactive concept preserved at frontend/public/prototype.html.

## Technology
| Layer | Stack |
|---|---|
| Frontend | React 19.3, Vite 8.3, JavaScript |
| Backend | Django 6.1, Python |
| Data | Django ORM, SQLite locally, PostgreSQL via DATABASE_URL |
| API | Read-only JSON endpoints |

## Run locally

### 1. Django API
```bash
cd backend
python -m venv .venv
# Windows PowerShell: .venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo_data
python manage.py runserver 8000
```

### 2. React frontend
```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally http://localhost:5173). Vite proxies /api requests to Django on port 8000.

## API reference
| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/health/ | Health and framework version |
| GET | /api/exercises/ | List movement references |
| GET | /api/exercises/?category=Upper-body%20mobility | Filter by category |
| GET | /api/exercises/?q=ankle | Search name, category and description |

Responses are catalogue information only. No patient profile, camera upload or session record is collected by this starter.

## Quality checks
```bash
cd backend
python manage.py check
python manage.py test
```
```bash
cd frontend
npm run build
```

GitHub Actions runs the frontend build and backend tests on pushes to main and pull requests.

## Deployment notes
- Set the Vercel project root to frontend, build with npm run build and use dist as output.
- Set VITE_API_BASE_URL to the deployed Django API origin when building the frontend.
- Deploy backend as a Python web service with gunicorn config.wsgi:application.
- Configure DJANGO_SECRET_KEY, DJANGO_DEBUG=false, DJANGO_ALLOWED_HOSTS, CORS_ALLOWED_ORIGINS and a persistent PostgreSQL DATABASE_URL.
- Run python manage.py migrate and python manage.py seed_demo_data after deployment.

## Responsible-development roadmap
1. Define intended users, governance, consent and clinical oversight before adding health-related functions.
2. Evaluate accessibility and usability with qualified domain experts.
3. Keep any future camera or AI capability out of production until privacy, safety and validation requirements are met.
4. Avoid automated exercise prescriptions or diagnostic claims.

AI-based movement analysis is not implemented in this repository yet.