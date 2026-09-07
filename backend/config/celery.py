import os
from celery import Celery
from decouple import config

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('config')

# Redis broker and backend (fallback to in-memory if Redis unavailable for local dev)
REDIS_URL = config('REDIS_URL', default='redis://localhost:6379/0')

app.conf.update(
    broker_url=REDIS_URL,
    result_backend=REDIS_URL,
    accept_content=['json'],
    task_serializer='json',
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # Hard limit: 30 minutes
    task_soft_time_limit=25 * 60,  # Soft limit: 25 minutes for graceful shutdown
)

app.autodiscover_tasks()
