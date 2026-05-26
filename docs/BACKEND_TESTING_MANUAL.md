# CareerPilot — Backend Testing Manual

Use this guide to verify the FastAPI backend (`http://localhost:8000`) and its dependencies (Postgres, Redis, embed service) are working.

---

## 1. Prerequisites

| Requirement | Purpose |
|-------------|---------|
| Docker Desktop | Postgres, Redis, embed service |
| Python 3.9+ | Run backend locally (optional if using Docker backend) |
| `.env` at repo root | Config (copy from `.env.example`) |

### Minimum `.env` for local backend + Docker infra

When you run **uvicorn on your machine** (not inside Docker), use **localhost** hosts:

```env
# Required by Settings — use placeholders if you are not using these yet
SUPABASE_URL=http://localhost
SUPABASE_ANON_KEY=placeholder
SUPABASE_SERVICE_KEY=placeholder
GROQ_API_KEY=
GEMINI_API_KEY=
ADZUNA_APP_ID=placeholder
ADZUNA_API_KEY=placeholder

# Local infrastructure (Docker Compose ports)
POSTGRES_URL=postgresql+asyncpg://cpuser:cppass@localhost:5432/careerpilot
REDIS_URL=redis://localhost:6379
EMBED_URL=http://localhost:8001

JWT_SECRET=your_local_test_secret_min_32_chars
```

> **Note:** If signup fails with a database driver error, ensure `POSTGRES_URL` uses the `postgresql+asyncpg://` scheme (SQLAlchemy async + asyncpg).

For **AI features** (assistant, cover letter, job fit), configure at least one of:
- `GROQ_API_KEY` — [console.groq.com](https://console.groq.com)
- `GEMINI_API_KEY` — [aistudio.google.com](https://aistudio.google.com)
- **Ollama** running locally (`OLLAMA_URL`, `OLLAMA_MODEL` in config defaults)

---

## 2. Start services

### 2.1 Infrastructure (recommended)

From the repo root:

```bash
docker compose up -d db redis embed
```

Wait until containers are healthy:

```bash
docker compose ps
```

### 2.2 Backend API

**Option A — local (good for debugging):**

```bash
cd backend
# Windows PowerShell
.\venv\Scripts\Activate.ps1
# Windows CMD
# venv\Scripts\activate.bat
# macOS/Linux
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Option B — Docker:**

```bash
docker compose up -d backend
```

### 2.3 Confirm processes

| Service | URL | Expected |
|---------|-----|----------|
| API | http://localhost:8000 | Running |
| Swagger UI | http://localhost:8000/docs | OpenAPI page |
| Embed | http://localhost:8001/health | `{"status":"ok",...}` |
| Postgres | localhost:5432 | `careerpilot` DB |
| Redis | localhost:6379 | PONG on ping |

---

## Windows curl notes

- Git Bash / WSL: use the curl examples exactly as shown.
- PowerShell: use `curl.exe` if `curl` is aliased to `Invoke-WebRequest`, and prefer full one-line commands.
- CMD: use `curl.exe` and keep the command on one line; JSON bodies must use escaped quotes like `-d "{\"key\":\"value\"}"`.

Example PowerShell:

```powershell
curl.exe -s -X POST "http://localhost:8000/api/v1/auth/signup" -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"TestPass123!\",\"full_name\":\"Test User\"}"
```

Example CMD:

```cmd
curl.exe -s -X POST "http://localhost:8000/api/v1/auth/signup" -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"TestPass123!\",\"full_name\":\"Test User\"}"
```

## 3. Layer 1 — No-auth health checks

Run these first. They do not need a JWT.

### 3.1 Root

```bash
curl -s http://localhost:8000/
```

> Windows PowerShell/CMD: `curl.exe -s http://localhost:8000/`

**Expected:**

```json
{"status":"ok","service":"careerpilot-api"}
```

### 3.2 Health (includes Redis)

```bash
curl -s http://localhost:8000/health
```

> Windows PowerShell/CMD: `curl.exe -s http://localhost:8000/health`

**Expected (success):**

```json
{"status":"ok","redis":"ok"}
```

**If Redis is down:**

```json
{"status":"error","redis":"<error message>"}
```

→ Start Redis: `docker compose up -d redis`

### 3.3 Embed service

```bash
curl -s http://localhost:8001/health
```

> Windows PowerShell/CMD: `curl.exe -s http://localhost:8001/health`

**Expected:**

```json
{"status":"ok","model":"BAAI/bge-small-en-v1.5","dimension":384}
```

First request to `/embed` may be slow while the model loads.

---

## 4. Layer 2 — Authentication

> Windows: Git Bash and WSL work with the curl commands as written. For PowerShell/CMD, use `curl.exe` and one-line commands if the multi-line bash syntax fails.

Protected routes need:

```http
Authorization: Bearer <access_token>
```

Tokens are issued by local signup/login (JWT signed with `JWT_SECRET`, audience `authenticated`).

### 4.1 Sign up

```bash
curl -s -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"TestPass123!\",\"full_name\":\"Test User\"}"
```

> Windows PowerShell:
> `curl.exe -s -X POST "http://localhost:8000/api/v1/auth/signup" -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"TestPass123!\",\"full_name\":\"Test User\"}"`
>
> Windows CMD:
> `curl.exe -s -X POST "http://localhost:8000/api/v1/auth/signup" -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"TestPass123!\",\"full_name\":\"Test User\"}"`

**Expected (201/200):**

```json
{
  "access_token": "<jwt>",
  "token_type": "bearer",
  "user_id": "<uuid>"
}
```

**Common failures:**

| Status | Detail | Fix |
|--------|--------|-----|
| 400 | Email already registered | Use a new email or login instead |
| 500 | DB connection | Check `POSTGRES_URL`, `docker compose up -d db` |

Save the token for later steps:

```bash
# macOS/Linux or Git Bash
export TOKEN="<paste access_token>"
export USER_ID="<paste user_id>"
```

```powershell
# Windows PowerShell
$env:TOKEN = "<paste access_token>"
$env:USER_ID = "<paste user_id>"
```

```cmd
:: Windows CMD
set TOKEN=<paste access_token>
set USER_ID=<paste user_id>
```

### 4.2 Login

```bash
curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"TestPass123!\"}"
```

> Windows PowerShell:
> `curl.exe -s -X POST "http://localhost:8000/api/v1/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"TestPass123!\"}"`
>
> Windows CMD:
> `curl.exe -s -X POST "http://localhost:8000/api/v1/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"TestPass123!\"}"`

Same response shape as signup.

### 4.3 Invalid token (sanity check)

```bash
curl -s http://localhost:8000/api/v1/profile \
  -H "Authorization: Bearer invalid"
```

> Windows PowerShell/CMD: `curl.exe -s http://localhost:8000/api/v1/profile -H "Authorization: Bearer invalid"`

**Expected:** `401` with authentication error.

---

## 5. Layer 3 — Protected endpoints (by feature)

> Windows: run these curl examples in Git Bash/WSL as written. In PowerShell/CMD, replace `curl` with `curl.exe` and avoid bash-style backslash line continuations.

Replace `$TOKEN` with your JWT in all examples.

### 5.1 Profile

**Get profile**

```bash
curl -s http://localhost:8000/api/v1/profile \
  -H "Authorization: Bearer $TOKEN"
```

> Windows PowerShell/CMD: `curl.exe -s http://localhost:8000/api/v1/profile -H "Authorization: Bearer %TOKEN%"`

**Expected:** JSON with `id`, `email`, `full_name`, `location_city`, `location_country`.

**Update profile**

```bash
curl -s -X POST http://localhost:8000/api/v1/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"full_name\":\"Test User\",\"location_city\":\"Dhaka\",\"location_country\":\"Bangladesh\"}"
```

> Windows PowerShell:
> `curl.exe -s -X POST "http://localhost:8000/api/v1/profile" -H "Authorization: Bearer $env:TOKEN" -H "Content-Type: application/json" -d "{\"full_name\":\"Test User\",\"location_city\":\"Dhaka\",\"location_country\":\"Bangladesh\"}"
>
> Windows CMD:
> `curl.exe -s -X POST "http://localhost:8000/api/v1/profile" -H "Authorization: Bearer %TOKEN%" -H "Content-Type: application/json" -d "{\"full_name\":\"Test User\",\"location_city\":\"Dhaka\",\"location_country\":\"Bangladesh\"}"

**Expected:** `{"status":"success","message":"Profile updated"}`

---

### 5.2 CV (RAG pipeline)

**Status before upload**

```bash
curl -s http://localhost:8000/api/v1/cv/status \
  -H "Authorization: Bearer $TOKEN"
```

> Windows PowerShell/CMD: `curl.exe -s http://localhost:8000/api/v1/cv/status -H "Authorization: Bearer %TOKEN%"`

**Expected:** `{"has_cv":false}`

**Upload CV** (PDF or DOCX, max 5 MB)

```bash
curl -s -X POST http://localhost:8000/api/v1/cv/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/your/resume.pdf"
```

Windows PowerShell/CMD:

```powershell
curl.exe -s -X POST "http://localhost:8000/api/v1/cv/upload" -H "Authorization: Bearer $TOKEN" -F "file=@C:\path\to\your\resume.pdf"
```

```cmd
curl.exe -s -X POST "http://localhost:8000/api/v1/cv/upload" -H "Authorization: Bearer %TOKEN%" -F "file=@C:\path\to\your\resume.pdf"
```

**Expected:** JSON with `chunks_stored`, `sections`, optional `extracted_location`.

Requires **embed service** running. If upload fails with connection error → check `EMBED_URL` and `docker compose up -d embed`.

**Status after upload**

```bash
curl -s http://localhost:8000/api/v1/cv/status \
  -H "Authorization: Bearer $TOKEN"
```

> Windows PowerShell/CMD: `curl.exe -s http://localhost:8000/api/v1/cv/status -H "Authorization: Bearer %TOKEN%"`

**Expected:** `has_cv: true`, `chunk_count` > 0, `sections` array.

**Build CV from JSON** (alternative to file upload)

```bash
curl -s -X POST http://localhost:8000/api/v1/cv/build \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"summary\":\"Software engineer\",\"skills\":[\"Python\",\"FastAPI\"]}"
```

> Windows PowerShell:
> `curl.exe -s -X POST "http://localhost:8000/api/v1/cv/build" -H "Authorization: Bearer $env:TOKEN" -H "Content-Type: application/json" -d "{\"name\":\"Test User\",\"summary\":\"Software engineer\",\"skills\":[\"Python\",\"FastAPI\"]}"
>
> Windows CMD:
> `curl.exe -s -X POST "http://localhost:8000/api/v1/cv/build" -H "Authorization: Bearer %TOKEN%" -H "Content-Type: application/json" -d "{\"name\":\"Test User\",\"summary\":\"Software engineer\",\"skills\":[\"Python\",\"FastAPI\"]}"

**Delete CV**

```bash
curl -s -X DELETE http://localhost:8000/api/v1/cv \
  -H "Authorization: Bearer $TOKEN"
```

> Windows PowerShell/CMD: `curl.exe -s -X DELETE "http://localhost:8000/api/v1/cv" -H "Authorization: Bearer %TOKEN%"`

---

### 5.3 Jobs

**Search** (may call external job APIs; can take 10–30s)

```bash
curl -s "http://localhost:8000/api/v1/jobs/search?query=python%20developer&max_results=5" \
  -H "Authorization: Bearer $TOKEN"
```

> Windows PowerShell/CMD: `curl.exe -s "http://localhost:8000/api/v1/jobs/search?query=python%20developer&max_results=5" -H "Authorization: Bearer %TOKEN%"`

**Expected:** List of job objects (source depends on scrapers: Remotive, Arbeitnow, etc.).

**User location**

```bash
curl -s http://localhost:8000/api/v1/jobs/location \
  -H "Authorization: Bearer $TOKEN"
```

> Windows PowerShell/CMD: `curl.exe -s http://localhost:8000/api/v1/jobs/location -H "Authorization: Bearer %TOKEN%"`

**Manual fit score** (needs CV uploaded + AI key or Ollama)

```bash
curl -s -X POST http://localhost:8000/api/v1/jobs/manual-fit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"job_description\":\"We need Python, FastAPI, PostgreSQL, 3+ years experience.\"}"
```

> Windows PowerShell:
> `curl.exe -s -X POST "http://localhost:8000/api/v1/jobs/manual-fit" -H "Authorization: Bearer $env:TOKEN" -H "Content-Type: application/json" -d "{\"job_description\":\"We need Python, FastAPI, PostgreSQL, 3+ years experience.\"}"
>
> Windows CMD:
> `curl.exe -s -X POST "http://localhost:8000/api/v1/jobs/manual-fit" -H "Authorization: Bearer %TOKEN%" -H "Content-Type: application/json" -d "{\"job_description\":\"We need Python, FastAPI, PostgreSQL, 3+ years experience.\"}"

---

### 5.4 Application tracker

**Create application**

```bash
curl -s -X POST http://localhost:8000/api/v1/tracker/applications \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"job_title\":\"Backend Engineer\",\"company\":\"Acme Corp\",\"status\":\"applied\",\"location\":\"Remote\"}"
```

> Windows PowerShell:
> `curl.exe -s -X POST "http://localhost:8000/api/v1/tracker/applications" -H "Authorization: Bearer $env:TOKEN" -H "Content-Type: application/json" -d "{\"job_title\":\"Backend Engineer\",\"company\":\"Acme Corp\",\"status\":\"applied\",\"location\":\"Remote\"}"
>
> Windows CMD:
> `curl.exe -s -X POST "http://localhost:8000/api/v1/tracker/applications" -H "Authorization: Bearer %TOKEN%" -H "Content-Type: application/json" -d "{\"job_title\":\"Backend Engineer\",\"company\":\"Acme Corp\",\"status\":\"applied\",\"location\":\"Remote\"}"

**List applications**

```bash
curl -s http://localhost:8000/api/v1/tracker/applications \
  -H "Authorization: Bearer $TOKEN"
```

> Windows PowerShell/CMD: `curl.exe -s http://localhost:8000/api/v1/tracker/applications -H "Authorization: Bearer %TOKEN%"`

Copy an application `id` from the response for update/delete.

**Update application**

```bash
curl -s -X PATCH "http://localhost:8000/api/v1/tracker/applications/<APP_ID>" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"interviewing\",\"notes\":\"Phone screen scheduled\"}"
```

> Windows PowerShell:
> `curl.exe -s -X PATCH "http://localhost:8000/api/v1/tracker/applications/<APP_ID>" -H "Authorization: Bearer $env:TOKEN" -H "Content-Type: application/json" -d "{\"status\":\"interviewing\",\"notes\":\"Phone screen scheduled\"}"
>
> Windows CMD:
> `curl.exe -s -X PATCH "http://localhost:8000/api/v1/tracker/applications/<APP_ID>" -H "Authorization: Bearer %TOKEN%" -H "Content-Type: application/json" -d "{\"status\":\"interviewing\",\"notes\":\"Phone screen scheduled\"}"

**Delete application**

```bash
curl -s -X DELETE "http://localhost:8000/api/v1/tracker/applications/<APP_ID>" \
  -H "Authorization: Bearer $TOKEN"
```

> Windows PowerShell/CMD: `curl.exe -s -X DELETE "http://localhost:8000/api/v1/tracker/applications/<APP_ID>" -H "Authorization: Bearer %TOKEN%"`

**Goals — create**

```bash
curl -s -X POST http://localhost:8000/api/v1/tracker/goals \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"Apply to 5 jobs this week\",\"due_date\":\"2026-06-01\"}"
```

> Windows PowerShell:
> `curl.exe -s -X POST "http://localhost:8000/api/v1/tracker/goals" -H "Authorization: Bearer $env:TOKEN" -H "Content-Type: application/json" -d "{\"text\":\"Apply to 5 jobs this week\",\"due_date\":\"2026-06-01\"}"
>
> Windows CMD:
> `curl.exe -s -X POST "http://localhost:8000/api/v1/tracker/goals" -H "Authorization: Bearer %TOKEN%" -H "Content-Type: application/json" -d "{\"text\":\"Apply to 5 jobs this week\",\"due_date\":\"2026-06-01\"}"

**Goals — list**

```bash
curl -s http://localhost:8000/api/v1/tracker/goals \
  -H "Authorization: Bearer $TOKEN"
```

> Windows PowerShell/CMD: `curl.exe -s http://localhost:8000/api/v1/tracker/goals -H "Authorization: Bearer %TOKEN%"`

**Goals — toggle complete** (use goal `id` from list)

```bash
curl -s -X PATCH "http://localhost:8000/api/v1/tracker/goals/<GOAL_ID>/toggle" \
  -H "Authorization: Bearer $TOKEN"
```

> Windows PowerShell/CMD: `curl.exe -s -X PATCH "http://localhost:8000/api/v1/tracker/goals/<GOAL_ID>/toggle" -H "Authorization: Bearer %TOKEN%"`

---

### 5.5 Dashboard

```bash
curl -s http://localhost:8000/api/v1/dashboard/stats \
  -H "Authorization: Bearer $TOKEN"
```

> Windows PowerShell/CMD: `curl.exe -s http://localhost:8000/api/v1/dashboard/stats -H "Authorization: Bearer %TOKEN%"`

**Expected:** `total_applications`, `this_week`, `by_status`, `goals_total`, `goals_completed`, `nudges` (array of strings).

---

### 5.6 AI assistant (needs CV + AI provider)

```bash
curl -s -X POST http://localhost:8000/api/v1/assistant/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"What skills are on my CV?\",\"session_id\":\"test-session-1\"}"
```

> Windows PowerShell:
> `curl.exe -s -X POST "http://localhost:8000/api/v1/assistant/chat" -H "Authorization: Bearer $env:TOKEN" -H "Content-Type: application/json" -d "{\"message\":\"What skills are on my CV?\",\"session_id\":\"test-session-1\"}"
>
> Windows CMD:
> `curl.exe -s -X POST "http://localhost:8000/api/v1/assistant/chat" -H "Authorization: Bearer %TOKEN%" -H "Content-Type: application/json" -d "{\"message\":\"What skills are on my CV?\",\"session_id\":\"test-session-1\"}"

**Expected:** `response`, `session_id`, `history`.

If all AI providers fail, response text mentions trouble connecting to AI engines.

**Clear chat session**

```bash
curl -s -X DELETE "http://localhost:8000/api/v1/assistant/session/test-session-1" \
  -H "Authorization: Bearer $TOKEN"
```

> Windows PowerShell/CMD: `curl.exe -s -X DELETE "http://localhost:8000/api/v1/assistant/session/test-session-1" -H "Authorization: Bearer %TOKEN%"`

---

### 5.7 Cover letter (Gemini preferred, Groq fallback)

```bash
curl -s -X POST http://localhost:8000/api/v1/cover-letter/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"job_description\":\"Python backend role at a fintech startup.\",\"company_name\":\"Acme\",\"role_title\":\"Backend Engineer\",\"user_name\":\"Test User\"}"
```

> Windows PowerShell:
> `curl.exe -s -X POST "http://localhost:8000/api/v1/cover-letter/generate" -H "Authorization: Bearer $env:TOKEN" -H "Content-Type: application/json" -d "{\"job_description\":\"Python backend role at a fintech startup.\",\"company_name\":\"Acme\",\"role_title\":\"Backend Engineer\",\"user_name\":\"Test User\"}"
>
> Windows CMD:
> `curl.exe -s -X POST "http://localhost:8000/api/v1/cover-letter/generate" -H "Authorization: Bearer %TOKEN%" -H "Content-Type: application/json" -d "{\"job_description\":\"Python backend role at a fintech startup.\",\"company_name\":\"Acme\",\"role_title\":\"Backend Engineer\",\"user_name\":\"Test User\"}"

**Expected:** `letter_text`, `word_count`, `key_cv_points_used`.

---

## 6. Interactive testing (Swagger)

1. Open http://localhost:8000/docs
2. Call `POST /api/v1/auth/signup` or `login`
3. Click **Authorize**, enter: `Bearer <your_token>` (include the word `Bearer`)
4. Try protected endpoints from the UI

---

## 7. Recommended test order (checklist)

Use this as a quick pass/fail list:

- [ ] `GET /` → `status: ok`
- [ ] `GET /health` → `redis: ok`
- [ ] `GET http://localhost:8001/health` → embed ok
- [ ] `POST /api/v1/auth/signup` → receive `access_token`
- [ ] `GET /api/v1/profile` with Bearer token → 200
- [ ] `POST /api/v1/profile` → update location
- [ ] `POST /api/v1/cv/upload` → chunks stored
- [ ] `GET /api/v1/cv/status` → `has_cv: true`
- [ ] `POST /api/v1/tracker/applications` → success
- [ ] `GET /api/v1/tracker/applications` → list includes new row
- [ ] `GET /api/v1/dashboard/stats` → counts reflect data
- [ ] `POST /api/v1/assistant/chat` → non-empty AI response (if keys/Ollama set)
- [ ] `GET /api/v1/jobs/search?query=developer` → returns jobs (network dependent)

---

## 8. Troubleshooting

| Symptom | Likely cause | Action |
|---------|--------------|--------|
| Backend won't start | Missing `.env` fields | Fill all required vars from `.env.example` |
| `redis: error` on `/health` | Redis not running | `docker compose up -d redis` |
| Signup 500, DB errors | Postgres down or wrong URL | `docker compose up -d db`; fix `POSTGRES_URL` host (`localhost` vs `db`) |
| CV upload 500 | Embed down | `docker compose up -d embed`; test `:8001/health` |
| 401 on all protected routes | Wrong/missing Bearer prefix | Header must be `Authorization: Bearer <token>` |
| AI returns fallback error message | No Groq/Gemini/Ollama | Add API keys or run Ollama |
| Job search empty/slow | External APIs / network | Retry; check backend logs |
| CORS errors from browser | Origin not allowed | Backend allows `http://localhost:3000` only |

**View backend logs (Docker):**

```bash
docker compose logs -f backend
```

**Reset database (destructive):**

```bash
docker compose down -v
docker compose up -d db redis embed
```

This recreates Postgres from `db/init.sql`.

---

## 9. API reference (all routes)

| Method | Path | Auth |
|--------|------|------|
| GET | `/` | No |
| GET | `/health` | No |
| POST | `/api/v1/auth/signup` | No |
| POST | `/api/v1/auth/login` | No |
| GET | `/api/v1/profile` | Yes |
| POST | `/api/v1/profile` | Yes |
| POST | `/api/v1/cv/upload` | Yes |
| GET | `/api/v1/cv/status` | Yes |
| DELETE | `/api/v1/cv` | Yes |
| POST | `/api/v1/cv/build` | Yes |
| GET | `/api/v1/jobs/search` | Yes |
| POST | `/api/v1/jobs/manual-fit` | Yes |
| GET | `/api/v1/jobs/location` | Yes |
| GET | `/api/v1/tracker/applications` | Yes |
| POST | `/api/v1/tracker/applications` | Yes |
| PATCH | `/api/v1/tracker/applications/{id}` | Yes |
| DELETE | `/api/v1/tracker/applications/{id}` | Yes |
| GET | `/api/v1/tracker/goals` | Yes |
| POST | `/api/v1/tracker/goals` | Yes |
| PATCH | `/api/v1/tracker/goals/{id}/toggle` | Yes |
| GET | `/api/v1/dashboard/stats` | Yes |
| POST | `/api/v1/assistant/chat` | Yes |
| DELETE | `/api/v1/assistant/session/{session_id}` | Yes |
| POST | `/api/v1/cover-letter/generate` | Yes |
| POST | `/api/v1/cover-letter/refine` | Yes |

---

*Generated for CareerPilot API v1.0.0 — base URL `http://localhost:8000`.*
