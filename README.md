# AI Recovery Assistant

**Reform** is a movement-information interface concept built with React and Django. It demonstrates how a structured reference library can be searched, filtered and reviewed through a clear, accessible interface.

> **Scope and safety:** This is not a rehabilitation prescription or clinical product. It does not analyse camera footage, measure real movement, recommend exercises, assess recovery or diagnose conditions. Library entries are illustrative and must not replace guidance from a qualified healthcare professional.

## Live deployment

- **Frontend:** https://reform-movement-library.vercel.app
- **Django API:** https://reform-django-api.vercel.app
- **Health endpoint:** https://reform-django-api.vercel.app/api/health/

The React frontend and Django API are deployed as separate, Git-connected Vercel projects.

## Product capabilities

- Search and filter a structured movement-reference library, including professional guidance notes.
- Retrieve distinct catalogue categories for building filter controls.
- Sort entries by name or category.
- Receive paginated, validated JSON responses and structured query errors.
- Database-aware health checks in local/database mode; static demo mode explicitly reports that a database is not required.
- Review descriptions and professional-guidance notes for each entry.
- Save selected references to a temporary, browser-session discussion list.
- Original interactive concept preserved at `frontend/public/prototype.html`.

## Technology

| Layer | Stack |
|---|---|
| Frontend | React 19.3.1, Vite 8.3.8, JavaScript |
| Backend | Django 6.1.3, Python 3.13 |
| Local data | Django ORM and SQLite |
| Deployed demo data | Read-only Python catalogue (`DEMO_DATA_MODE=true`) |
| API | Read-only JSON endpoints |
| Hosting | Vercel frontend and Django Python runtime |
| CI | GitHub Actions |

## Runtime requirements

- Node.js 22.12 or newer
- Python 3.12 or newer (Python 3.13 is used in CI and deployment)

## Run locally

### 1. Start the Django API

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

### 2. Start the React frontend

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`). The Vite development server proxies `/api` requests to Django on port 8000.

## API reference

All endpoints are read-only and accept GET requests.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health/` | Service, data-mode and database readiness status |
| GET | `/api/exercises/` | List movement references |
| GET | `/api/exercises/?category=Upper-body%20mobility` | Filter by category |
| GET | `/api/exercises/?q=ankle` | Search name, category, description and professional note |
| GET | `/api/exercises/?sort=name&order=asc` | Sort by name or category |
| GET | `/api/exercises/categories/` | Return distinct category names |

### Pagination and validation

- `page` is a positive integer (default `1`).
- `page_size` is an integer from `1` to `100` (default `25`).
- `count` is the total number of matched entries; `items` contains the requested page.
- The `pagination` object reports page, page size, total items/pages and next/previous flags.
- `sort` accepts `default`, `name` or `category`; `order` accepts `asc` or `desc`.
- Invalid and oversized parameters return HTTP 400 with a structured `error` object.

Responses contain catalogue information and the project disclaimer only. This starter does not collect a patient profile, camera upload or personal rehabilitation session.

## Quality checks

Backend:

```bash
cd backend
python -m pip install -r requirements.txt
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py test
```

Frontend:

```bash
cd frontend
npm install
npm test
npm run build
```

GitHub Actions runs the frontend tests/build and Django checks/tests on pushes to `main` and pull requests.

## Deployment configuration

- **Vercel frontend root:** `frontend/`
- **Vercel frontend build:** `npm run build`
- **Vercel frontend output:** `dist/`
- **Frontend API variable:** `VITE_API_BASE_URL=https://reform-django-api.vercel.app`
- **Vercel Django API root:** `backend/`
- **API framework:** Django, using Vercel's native Python runtime.
- Set `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=false`, `DJANGO_ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` in the API project's environment.

The hosted API uses `DEMO_DATA_MODE=true` and serves a read-only, in-code demonstration catalogue. This avoids relying on an ephemeral SQLite file in a serverless function. For local development, leave `DEMO_DATA_MODE` unset or set it to `false` to use the Django ORM and run the seed command. Persistent user-specific data has not been implemented.

## Responsible-development roadmap

1. Define intended users, governance, consent and qualified clinical oversight before adding health-related functionality.
2. Evaluate accessibility and usability with appropriate domain experts.
3. Keep future camera or AI capabilities out of production until privacy, safety and validation requirements are met.
4. Avoid automated exercise prescriptions or diagnostic claims.
5. Design secure storage and retention policies before handling personal health information.

AI-based movement analysis is not implemented in this repository yet.
