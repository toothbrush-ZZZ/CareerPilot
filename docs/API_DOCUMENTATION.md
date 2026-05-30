# CareerPilot API Documentation

Base URL: `http://localhost:8000`

## Authentication

### Header

All protected endpoints require:

```
Authorization: Bearer <token>
```

The token is returned by `/api/v1/auth/signup` and `/api/v1/auth/login`.

---

## Public endpoints

### GET `/`

Health check for the API server.

Response:

```json
{
  "status": "ok",
  "service": "careerpilot-api"
}
```

### GET `/health`

Checks API and Redis connectivity.

Response:

```json
{
  "status": "ok",
  "redis": "ok"
}
```

If Redis is unavailable, the response returns `{"status":"error","redis":"Service unavailable"}`.

### POST `/api/v1/auth/signup`

Create a new user account.

Request body:

```json
{
  "email": "test@example.com",
  "password": "TestPass123!",
  "full_name": "Test User"
}
```

Response:

```json
{
  "access_token": "<jwt>",
  "token_type": "bearer",
  "user_id": "<uuid>"
}
```

### POST `/api/v1/auth/login`

Authenticate with email and password.

Request body:

```json
{
  "email": "test@example.com",
  "password": "TestPass123!"
}
```

Response shape is the same as signup.

---

## Profile

### GET `/api/v1/profile`

Returns the authenticated user's profile.

Response example:

```json
{
  "id": "<uuid>",
  "email": "test@example.com",
  "full_name": "Test User",
  "location_city": "Dhaka",
  "location_country": "Bangladesh"
}
```

### POST `/api/v1/profile`

Update profile fields.

Request body:

```json
{
  "full_name": "Test User",
  "location_city": "Dhaka",
  "location_country": "Bangladesh"
}
```

Response:

```json
{
  "status": "success",
  "message": "Profile updated"
}
```

---

## CV endpoints

### POST `/api/v1/cv/upload`

Upload a PDF or DOCX resume file (max 5 MB).

Form field:

- `file` — the resume file

Response example:

```json
{
  "chunks_stored": 12,
  "sections": ["Experience", "Education", "Skills"],
  "extracted_location": "Dhaka, Bangladesh"
}
```

### GET `/api/v1/cv/status`

Returns whether the user has a stored CV and its chunk metadata.

Response example:

```json
{
  "has_cv": true,
  "chunk_count": 24,
  "sections": ["Experience", "Skills", "Education"]
}
```

### DELETE `/api/v1/cv`

Deletes the authenticated user's stored CV chunks.

Response:

```json
{
  "status": "success",
  "message": "CV deleted"
}
```

### POST `/api/v1/cv/build`

Build a CV from JSON data when no resume file is available.

Request body example:

```json
{
  "name": "Test User",
  "summary": "Software engineer with 5 years experience",
  "skills": ["Python", "FastAPI", "PostgreSQL"]
}
```

Response is the same form as `/api/v1/cv/upload`.

---

## Jobs

### GET `/api/v1/jobs/search`

Search for jobs using keywords.

Query parameters:

- `query` — required
- `location` — optional
- `max_results` — optional, default is 15

Example:

```
GET /api/v1/jobs/search?query=python%20developer&max_results=5
```

Response: list of job objects returned by job scraping/search agents.

### GET `/api/v1/jobs/location`

Returns the user's saved profile location.

Response example:

```json
{
  "location": "Dhaka"
}
```

### POST `/api/v1/jobs/manual-fit`

Compute an AI-powered fit score for a manually entered job description.

Request body:

```json
{
  "job_description": "We need a Python backend engineer with FastAPI experience."
}
```

Response example:

```json
{
  "score": 0.82,
  "summary": "Strong match on Python and backend skills, needs more cloud experience"
}
```

---

## Tracker

### GET `/api/v1/tracker/applications`

List job applications tracked by the authenticated user.

Response: array of application objects.

### POST `/api/v1/tracker/applications`

Create a new tracked application.

Request body:

```json
{
  "job_title": "Backend Engineer",
  "company": "Acme Corp",
  "location": "Remote",
  "job_url": "https://example.com/job/123",
  "status": "applied",
  "notes": "Applied via website"
}
```

Response:

```json
{
  "status": "success"
}
```

### PATCH `/api/v1/tracker/applications/{app_id}`

Update application fields.

Request body:

```json
{
  "status": "interviewing",
  "notes": "Phone screen scheduled"
}
```

Response:

```json
{
  "status": "success"
}
```

### DELETE `/api/v1/tracker/applications/{app_id}`

Delete a tracked application.

Response:

```json
{
  "status": "success"
}
```

### GET `/api/v1/tracker/goals`

List tracked career goals.

Response: array of goal objects.

### POST `/api/v1/tracker/goals`

Create a new goal.

Request body:

```json
{
  "text": "Apply to 5 jobs this week",
  "due_date": "2026-06-01"
}
```

Response:

```json
{
  "status": "success"
}
```

### PATCH `/api/v1/tracker/goals/{goal_id}/toggle`

Toggle the completed state of a goal.

Response:

```json
{
  "status": "success"
}
```
---

## Dashboard

### GET `/api/v1/dashboard/stats`

Returns dashboard metrics for the authenticated user.

Response example:

```json
{
  "total_applications": 12,
  "this_week": 3,
  "by_status": {
    "applied": 5,
    "interviewing": 2,
    "offer": 1,
    "rejected": 4
  },
  "goals_total": 4,
  "goals_completed": 2,
  "nudges": ["Follow up on 2 applications", "Update your CV summary"]
}
```

---

## AI Assistant

### POST `/api/v1/assistant/chat`

Send a chat message to the AI assistant. Requires an uploaded CV for context.

Request body:

```json
{
  "message": "What skills are on my CV?",
  "session_id": "test-session-1"
}
```

Response example:

```json
{
  "response": "Your CV highlights Python, FastAPI, and PostgreSQL.",
  "session_id": "test-session-1",
  "history": [
    { "role": "user", "content": "What skills are on my CV?" },
    { "role": "assistant", "content": "Your CV highlights..." }
  ]
}
```

### DELETE `/api/v1/assistant/session/{session_id}`

Clear the chat session history for the given session.

Response:

```json
{
  "status": "success"
}
```

---

## Cover Letter

### POST `/api/v1/cover-letter/generate`

Generate a cover letter using the user's CV context.

Request body:

```json
{
  "job_description": "Python backend role at a fintech startup.",
  "company_name": "Acme",
  "role_title": "Backend Engineer",
  "user_name": "Test User"
}
```

Response example:

```json
{
  "letter_text": "<generated cover letter>",
  "word_count": 142,
  "key_cv_points_used": ["Built scalable REST APIs", "Worked with FastAPI"],
  "tone": "professional"
}
```

### POST `/api/v1/cover-letter/refine`

Refine an existing generated cover letter with user feedback.

Request body:

```json
{
  "existing_letter": "<previous letter text>",
  "feedback": "Make it more concise and mention my remote work experience.",
  "job_description": "Python backend role at a fintech startup."
}
```

Response example is the same as `/generate`.

---

## Route summary

| Method | Path | Auth required |
|---|---|---|
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
| GET | `/api/v1/jobs/location` | Yes |
| POST | `/api/v1/jobs/manual-fit` | Yes |
| GET | `/api/v1/tracker/applications` | Yes |
| POST | `/api/v1/tracker/applications` | Yes |
| PATCH | `/api/v1/tracker/applications/{app_id}` | Yes |
| DELETE | `/api/v1/tracker/applications/{app_id}` | Yes |
| GET | `/api/v1/tracker/goals` | Yes |
| POST | `/api/v1/tracker/goals` | Yes |
| PATCH | `/api/v1/tracker/goals/{goal_id}/toggle` | Yes |
| GET | `/api/v1/dashboard/stats` | Yes |
| POST | `/api/v1/assistant/chat` | Yes |
| DELETE | `/api/v1/assistant/session/{session_id}` | Yes |
| POST | `/api/v1/cover-letter/generate` | Yes |
| POST | `/api/v1/cover-letter/refine` | Yes |

---

## Notes

- Use `http://localhost:8000/docs` for the built-in Swagger/OpenAPI UI.
- All protected endpoints require a valid JWT token.
- File upload requests must send `multipart/form-data` for `/api/v1/cv/upload`.
