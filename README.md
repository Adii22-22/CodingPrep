# CodingPrep

CodingPrep is a full-stack application for coding-interview practice. It
combines a structured curriculum, browser-based code editing, Docker-based
code execution, and Gemini-powered mock interviews.

## Features

- Structured categories, topics, lessons, and coding problems
- Monaco editor with Python, Java, and C support
- Sample runs and asynchronous submissions through Celery
- Progress tracking, saved code, and submission history
- Gemini-powered mock interviews
- Resource-limited Docker sandboxes for submitted code

## Tech stack

- Frontend: React 19, Vite, Monaco Editor
- Backend: Django 5.2, Django REST Framework, JWT authentication
- Data and async work: PostgreSQL, Redis, Celery
- Deployment: Docker Compose, Nginx, Gunicorn
- AI: Google Gemini

## Project structure

```text
CodingPrep/
├── backend/
│   ├── accounts/            Authentication and profiles
│   ├── config/              Django and Celery configuration
│   ├── curriculum/          Curriculum models and API
│   ├── engine/              Grading, sandboxing, and interviews
│   ├── sandbox/             Python, Java, and C sandbox images
│   └── requirements.txt
├── frontend/
│   ├── src/
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 13+
- Redis
- Docker

## Local development

### Backend

```bash
cd backend
python -m venv venv

# macOS/Linux
source venv/bin/activate

# Windows PowerShell
# .\venv\Scripts\Activate.ps1

pip install -r requirements.txt
```

Copy `.env.example` to `.env`, then set the database credentials,
`SECRET_KEY`, and `GEMINI_API_KEY`. For local development, use
`DEBUG=True`, `DB_HOST=localhost`, and
`CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173`.

```bash
python manage.py migrate
python manage.py seed_curriculum
python manage.py runserver
```

The API runs at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm ci
```

Create `frontend/.env` with:

```text
VITE_API_URL=http://127.0.0.1:8000
```

Then start Vite:

```bash
npm run dev
```

The frontend runs at `http://localhost:5173`.

### Celery worker

Start Redis, then in a second terminal from `backend/` run:

```bash
celery -A config worker --loglevel=info
```

On Windows, use `celery -A config worker --loglevel=info -P solo`.

### Sandbox images

The code runner requires these image names:

```bash
docker build -t codingprep-sandbox-python backend/sandbox/python/
docker build -t codingprep-sandbox-java backend/sandbox/java/
docker build -t codingprep-sandbox-c backend/sandbox/c/
```

## Docker Compose

Copy `backend/.env.example` to `backend/.env` and set strong, deployment-safe
values, including `DEBUG=False`, `ALLOWED_HOSTS`, database credentials, and
`GEMINI_API_KEY`.

```bash
docker compose --env-file backend/.env --profile sandbox build
docker compose --env-file backend/.env up -d
```

The stack serves the frontend on `http://localhost`. For deployment details
and Docker-socket safety notes, see [backend/ASYNC_DEPLOYMENT.md](backend/ASYNC_DEPLOYMENT.md).

## Environment variables

Backend (`backend/.env`):

```text
SECRET_KEY=replace-with-a-long-random-value
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=codingprep_db
DB_USER=codingprep_user
DB_PASSWORD=replace-with-a-strong-password
DB_HOST=localhost
DB_PORT=5432

REDIS_URL=redis://localhost:6379/0
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
GEMINI_API_KEY=your-gemini-api-key
```

Frontend (`frontend/.env`):

```text
VITE_API_URL=http://127.0.0.1:8000
```

## API endpoints

### Curriculum

- `GET /api/categories/`
- `GET /api/topics/`
- `GET /api/lessons/`
- `GET /api/problems/{id}/`

### Code execution

- `POST /api/engine/run/` — run against sample test cases
- `POST /api/engine/submit/` — queue a submission against all test cases
- `GET /api/engine/submission/{id}/` — poll a submission result
- `GET /api/engine/testcases/{problem_id}/` — retrieve sample test cases
- `GET` / `PUT /api/engine/saved-code/{problem_id}/` — load or save code

### AI interviews

- `POST /api/engine/interview/start/`
- `POST /api/engine/interview/chat/`
- `GET /api/engine/interview/next/{problem_id}/`
- `POST /api/engine/interview/grade/`

### Authentication

- `POST /api/accounts/register/`
- `POST /api/accounts/login/`
- `POST /api/accounts/refresh/`
- `GET /api/accounts/profile/`
- `GET /api/accounts/submissions/`

## Code execution limits

- 100 KB maximum submitted-code size
- 128 MB sandbox memory limit
- 0.5 CPU limit
- 20-second execution timeout
- Network-disabled sandbox containers
- Temporary sandbox filesystem removed after each execution

Java and C use problem-defined function signatures and type metadata. C is
currently limited to scalar `int`, `long`, and `double` parameters and return
values.

## Testing and checks

```bash
# Backend
cd backend
python manage.py test

# Frontend
cd frontend
npm run lint
npm run build
```
