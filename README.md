# CodingPrep

A full-stack web application for coding interview preparation combining structured learning paths, real-time code execution in sandboxed environments, and AI-powered mock interviews.

## Overview

CodingPrep provides:
- **Structured Curriculum** - Organized learning paths from fundamentals to advanced topics
- **Real-Time Code Editor** - Monaco editor with Python, Java, and C support
- **Instant Code Execution** - Run and submit solutions with immediate feedback
- **AI Mock Interviews** - Google Gemini-powered conversational interviewer
- **Progress Tracking** - Auto-save code and track submission history
- **Secure Sandboxing** - Docker-based isolated execution with resource limits

## Tech Stack

**Frontend:**
- React 19 with Vite
- Monaco Editor
- Context API for authentication

**Backend:**
- Django 5.2 + Django REST Framework
- PostgreSQL
- Redis + Celery (async task queue)
- Google Generative AI (Gemini)
- Docker (code execution sandboxes)

## Project Structure

```
CodingPrep/
├── backend/
│   ├── config/              Settings, Celery, WSGI/ASGI
│   ├── accounts/            Authentication (JWT)
│   ├── curriculum/          Categories, Topics, Lessons, Problems
│   ├── engine/              Code execution, grading, AI interviewer
│   ├── sandbox/             Docker containers (Python, Java, C)
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/      UI components
│   │   ├── context/         AuthContext
│   │   └── api.js           Backend API client
│   └── package.json
│
└── README.md
```

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 16+
- PostgreSQL 13+
- Redis
- Docker

### Backend Setup

```bash
cd backend

python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env
# Edit .env with your PostgreSQL and API keys

python manage.py migrate
python manage.py seed_curriculum

python manage.py runserver
```

Backend runs on `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

npm install

echo "REACT_APP_API_URL=http://127.0.0.1:8000" > .env

npm run dev
```

Frontend runs on `http://localhost:5173`

### Celery Worker (for async code execution)

```bash
cd backend
celery -A config worker -l info
```

### Build Sandbox Images

```bash
docker build -t codingprep-sandbox-python backend/sandbox/python/
docker build -t codingprep-sandbox-java backend/sandbox/java/
docker build -t codingprep-sandbox-c backend/sandbox/c/
```

## Environment Variables

### Backend (.env)

```
SECRET_KEY=your-secret-key
DEBUG=True

DB_NAME=codingprep_db
DB_USER=codingprep_user
DB_PASSWORD=secure-password
DB_HOST=localhost
DB_PORT=5432

REDIS_URL=redis://localhost:6379/0

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

GEMINI_API_KEY=your-gemini-api-key
```

### Frontend (.env)

```
REACT_APP_API_URL=http://127.0.0.1:8000
```

## API Endpoints

### Curriculum
- `GET /api/categories/` - Get all categories with topics and problems
- `GET /api/topics/` - Get all topics with lessons and problems
- `GET /api/problems/{id}/` - Get problem details

### Code Execution
- `POST /api/engine/run/` - Run code against sample test cases
- `POST /api/engine/submit/` - Submit code against all test cases
- `GET /api/engine/submission/{id}/` - Check submission status
- `GET /api/engine/testcases/{problem_id}/` - Get sample test cases
- `GET /api/engine/saved-code/{problem_id}/` - Load saved code
- `PUT /api/engine/saved-code/{problem_id}/` - Save code

### AI Interviews
- `POST /api/engine/interview/start/` - Start new interview
- `POST /api/engine/interview/chat/` - Send message to AI interviewer
- `GET /api/engine/interview/next/{problem_id}/` - Get next problem prompt
- `POST /api/engine/interview/grade/` - Grade interview performance

### Authentication
- `POST /api/accounts/register/` - Register new user
- `POST /api/accounts/login/` - Login and get JWT tokens
- `POST /api/accounts/refresh/` - Refresh access token
- `GET /api/accounts/profile/` - Get user profile
- `GET /api/accounts/submissions/` - Get user's submissions

## Features

### Learn Path
- Browse curriculum organized by topics and difficulty
- Read lessons with markdown formatting
- View example problems for each topic

### Practice
- Solve coding problems in Python, Java, or C
- See sample test cases with inputs and outputs
- Run code against sample cases for immediate feedback
- Submit for grading against all test cases
- Auto-save code for each problem

### Code Execution
- Secure Docker-based sandboxing:
  - 128MB memory limit
  - 0.5 CPU cores
  - 20-second timeout
  - Network isolation
  - No filesystem persistence
- Support for multiple languages
- Automatic type inference for return values
- Detailed error messages and output

### AI Mock Interviews
- Select difficulty level (Easy, Intermediate, Pro)
- Conversational AI guidance through problems
- AI checks understanding before coding
- Code review and feedback
- Complexity analysis questions
- Performance grading

## Security

- JWT authentication with refresh tokens (45min access, 7 days refresh)
- Docker sandboxing with resource limits
- CORS protection
- Code size limits (100KB max)
- Request payload limits (5MB max)
- Password hashing with Django validators

## Performance

- Prefetch queries for curriculum
- Async code execution with Celery
- 30 submissions per minute rate limit
- Exponential backoff polling from frontend
- Auto-save debouncing (2 seconds)
- Optimized Monaco editor configuration

## Code Execution Flow

1. User submits code with language selection
2. Backend validates input (size, language)
3. Submission record created with PENDING status
4. Celery task queued for async execution
5. Docker container spawned for execution
6. Code compiled (if Java/C) or interpreted (Python)
7. Test cases executed sequentially
8. Results compared and stored
9. Frontend polls for status with exponential backoff
10. Results displayed when complete

## Troubleshooting

**Frontend stuck on "Loading"**
- Verify backend is running: `curl http://127.0.0.1:8000/api/categories/`
- Check browser console for errors
- Ensure .env has correct API_URL

**Celery tasks not executing**
- Verify Redis is running: `redis-cli ping`
- Check Celery worker logs for errors
- Restart Celery worker

**Docker container errors**
- Verify images are built: `docker images | grep codingprep`
- Check Docker daemon is running
- Rebuild images with `--no-cache` flag

**Database connection failed**
- Verify PostgreSQL is running
- Check .env credentials match PostgreSQL setup
- Run `python manage.py migrate` to create tables

**Permission denied running Docker**
- Add user to docker group: `sudo usermod -aG docker $USER`

## Known Limitations

- C language support limited to scalar types (int, long, double)
- No array support for C problems
- Synchronous polling instead of WebSockets
- One problem per interview session

## Future Enhancements

- WebSocket support for real-time updates
- Additional programming languages (Go, Rust, JavaScript)
- Leaderboard with rankings
- Community discussion forums
- Company-specific problem paths
- Video solutions
- Team collaboration features
- Mobile app

## Testing

```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
cd frontend
npm test
```

## Development Tools

**Django Admin:** http://localhost:8000/admin/
**Celery Flower:** Run `celery -A config flower` and visit http://localhost:5555

## License

MIT License - see LICENSE file for details

## Support

- Report issues on GitHub Issues
- Ask questions in GitHub Discussions
- For security issues, email privately

---

Built for coding interview preparation. Start your journey today.
