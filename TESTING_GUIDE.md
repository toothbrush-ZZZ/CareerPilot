# CareerPilot Testing Guide

## Prerequisites

- Docker and Docker Compose installed
- Docker daemon running with proper permissions
- `.env` file configured with required environment variables

## Quick Start Testing

### 1. Start All Services

```bash
cd /home/zzz/Desktop/Projects/CareerPilot
docker-compose up -d
```

Wait for all services to be healthy (30-60 seconds):
```bash
docker-compose ps
```

### 2. Verify Service Health

**Backend API:**
```bash
curl http://localhost:8000/
```
Expected: `{"status":"ok","service":"careerpilot-api"}`

**Health Check (includes Redis):**
```bash
curl http://localhost:8000/health
```
Expected: `{"status":"ok","redis":"ok"}`

**Embed Service:**
```bash
curl http://localhost:8001/health
```
Expected: `{"status":"ok","model":"BAAI/bge-small-en-v1.5","dimension":384}`

**Frontend:**
```bash
curl http://localhost:3000
```
Expected: HTML response (landing page)

### 3. Test Authentication Flow

**Sign up new user:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!","full_name":"Test User"}'
```

Save the `access_token` from response for subsequent tests.

**Login:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'
```

### 4. Test Profile Management

**Get profile:**
```bash
curl http://localhost:8000/api/v1/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Update profile:**
```bash
curl -X POST http://localhost:8000/api/v1/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test User","location_city":"Dhaka","location_country":"Bangladesh"}'
```

### 5. Test CV Upload

**Check CV status (before upload):**
```bash
curl http://localhost:8000/api/v1/cv/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Upload CV:**
```bash
curl -X POST http://localhost:8000/api/v1/cv/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/your/resume.pdf"
```

**Check CV status (after upload):**
```bash
curl http://localhost:8000/api/v1/cv/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Test Job Search

**Search for jobs:**
```bash
curl "http://localhost:8000/api/v1/jobs/search?query=python%20developer&location=Dhaka&max_results=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get user location:**
```bash
curl http://localhost:8000/api/v1/jobs/location \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Manual fit score:**
```bash
curl -X POST http://localhost:8000/api/v1/jobs/manual-fit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"job_description":"We need Python, FastAPI, PostgreSQL experience"}'
```

### 7. Test AI Assistant

**Chat with AI assistant (requires CV upload):**
```bash
curl -X POST http://localhost:8000/api/v1/assistant/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"What skills are on my CV?","session_id":"test-session-1"}'
```

**Clear chat session:**
```bash
curl -X DELETE "http://localhost:8000/api/v1/assistant/session/test-session-1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 8. Test Application Tracker

**Create application:**
```bash
curl -X POST http://localhost:8000/api/v1/tracker/applications \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"job_title":"Backend Engineer","company":"Test Corp","location":"Remote","status":"applied"}'
```

**List applications:**
```bash
curl http://localhost:8000/api/v1/tracker/applications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Update application status:**
```bash
curl -X PATCH "http://localhost:8000/api/v1/tracker/applications/APP_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"interviewing"}'
```

**Create goal:**
```bash
curl -X POST http://localhost:8000/api/v1/tracker/goals \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Apply to 5 jobs this week","due_date":"2026-06-01"}'
```

**List goals:**
```bash
curl http://localhost:8000/api/v1/tracker/goals \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 9. Test Dashboard

**Get dashboard stats:**
```bash
curl http://localhost:8000/api/v1/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 10. Test Cover Letter Generation

**Generate cover letter:**
```bash
curl -X POST http://localhost:8000/api/v1/cover-letter/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"job_description":"Python backend role at a fintech startup","company_name":"Acme","role_title":"Backend Engineer","user_name":"Test User"}'
```

## Frontend Testing

### Access Frontend
Open browser at: http://localhost:3000

### Test Flow
1. **Landing Page** - Verify page loads and demo login works
2. **Login/Signup** - Test authentication flow
3. **Dashboard** - Verify dashboard loads with stats
4. **CV Upload** - Test CV upload and processing
5. **Job Search** - Test job search functionality
6. **AI Assistant** - Test chat interface
7. **Tracker** - Test Kanban board and goals
8. **Profile** - Test profile management

## Automated Testing

### Run Evaluation Suite
```bash
cd /home/zzz/Desktop/Projects/CareerPilot/evals
python run_evals.py
```

### Run Frontend Tests
```bash
cd /home/zzz/Desktop/Projects/CareerPilot/frontend
npm test
```

### Run Backend Tests
```bash
cd /home/zzz/Desktop/Projects/CareerPilot/backend
pytest
```

## Troubleshooting

### Docker Permission Issues
If you get "permission denied" error:
```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Services Not Starting
```bash
docker-compose logs
docker-compose ps
```

### Database Connection Issues
```bash
docker-compose restart db
docker-compose logs db
```

### Redis Connection Issues
```bash
docker-compose restart redis
docker-compose logs redis
```

### Backend Not Responding
```bash
docker-compose restart backend
docker-compose logs backend
```

### Frontend Not Responding
```bash
docker-compose restart frontend
docker-compose logs frontend
```

## Cleanup

### Stop All Services
```bash
docker-compose down
```

### Stop and Remove Volumes
```bash
docker-compose down -v
```

### Rebuild and Restart
```bash
docker-compose down
docker-compose build
docker-compose up -d
```

## Success Criteria

✅ All Docker services start and are healthy
✅ Backend API responds to health checks
✅ Authentication flow works (signup/login)
✅ CV upload and processing works
✅ Job search returns results
✅ AI assistant responds (if AI keys configured)
✅ Tracker CRUD operations work
✅ Dashboard returns accurate stats
✅ Frontend loads and is accessible
✅ All four pillars functional

## Notes

- Some features require AI API keys (Groq, Gemini) or Ollama running
- CV upload requires the embed service to be running
- Job search may take 10-30 seconds due to external API calls
- Demo account: demo@careerpilot.ai / demopassword
