# Deployment Guide

CodingPrep uses PostgreSQL for application data, Redis as the Celery broker and
result backend, a Django/Gunicorn API, a Celery worker, and Nginx for the
frontend. Code execution uses three local Docker sandbox images.

## Run with Docker Compose

1. Copy `backend/.env.example` to `backend/.env` and set a strong `SECRET_KEY`,
   `DB_PASSWORD`, `GEMINI_API_KEY`, and production-safe values such as
   `DEBUG=False` and `CORS_ALLOWED_ORIGINS=https://your-domain.example`.
2. Build the sandbox images. They must exist on the Docker host because the
   Celery worker creates containers through the Docker socket:

   ```bash
   docker compose --env-file backend/.env --profile sandbox build
   ```

3. Start the application:

   ```bash
   docker compose --env-file backend/.env up -d
   ```

   The `migrate` service applies migrations before the backend and worker
   start. Visit `http://localhost` after the services are healthy.

## Important operational notes

- Do not commit `backend/.env`; it contains credentials. Keep only
  `backend/.env.example` in Git.
- The Docker socket mount is required for the current code-execution design,
  but it gives the worker powerful access to the Docker host. Run this stack on
  a dedicated host and do not expose Docker's daemon remotely.
- Back up the `postgres_data` volume before upgrades or destructive database
  operations.
- For local frontend development, leave `VITE_API_URL` unset; it defaults to
  `http://127.0.0.1:8000`. Docker builds set it to an empty value so Nginx
  proxies `/api/` requests to the backend service.

## Useful commands

```bash
docker compose --env-file backend/.env ps
docker compose --env-file backend/.env logs -f backend celery_worker
docker compose --env-file backend/.env exec backend python manage.py createsuperuser
docker compose --env-file backend/.env down
```
