# Evaluation Suite - CareerPilot

## Test Case 1: CV Ingestion Accuracy
- **Input**: Upload sample CV PDF (test_cv.pdf)
- **Expected Output**: chunk_count >= 4, sections found includes education/experience/skills
- **Actual Output**: chunk_count = 12, sections = ["Experience", "Education", "Skills", "Projects"]
- **Status**: PASS
- **Test Command**: `curl -X POST http://localhost:8000/api/v1/cv/upload -H "Authorization: Bearer $TOKEN" -F "file=@test_cv.pdf"`

## Test Case 2: Fit Score Computation
- **Input**: User with Python/FastAPI skills vs JD requiring Python/FastAPI/Docker/AWS
- **Expected Output**: fit_percentage 50-75%, matched_skills includes python/fastapi
- **Actual Output**: fit_percentage = 65%, matched_skills = ["python", "fastapi"]
- **Status**: PASS
- **Test Command**: `curl -X POST http://localhost:8000/api/v1/jobs/manual-fit -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"job_description":"We need Python, FastAPI, Docker, AWS experience"}'`

## Test Case 3: Job Hunter Agent Returns Structured Cards
- **Input**: query = "Python developer internship Dhaka"
- **Expected Output**: Returns JobCard objects with titles, companies, locations, and fit scores
- **Actual Output**: Returns 8 job cards with structure: {role, company, location, fit_score, deadline}
- **Status**: PASS
- **Test Command**: `curl "http://localhost:8000/api/v1/jobs/search?query=python%20developer%20internship&location=Dhaka" -H "Authorization: Bearer $TOKEN"`

## Test Case 4: AI Assistant Readiness Check
- **Input**: "Am I ready for a junior Python role?"
- **Expected Output**: Context-aware response referencing user's actual skills from CV
- **Actual Output**: "Based on your CV, you have strong Python and FastAPI skills. You're well-prepared for junior Python roles, but may want to gain more experience with cloud technologies."
- **Status**: PASS
- **Test Command**: `curl -X POST http://localhost:8000/api/v1/assistant/chat -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"message":"Am I ready for a junior Python role?","session_id":"test-1"}'`

## Test Case 5: Kanban Tracker CRUD
- **Input**: Create application -> Update status -> Delete
- **Expected Output**: All operations succeed with correct status codes (201, 200, 204)
- **Actual Output**: Create: 201, Update: 200, Delete: 204
- **Status**: PASS
- **Test Command**: 
  - Create: `curl -X POST http://localhost:8000/api/v1/tracker/applications -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"job_title":"Backend Engineer","company":"Test Corp","status":"applied"}'`
  - Update: `curl -X PATCH http://localhost:8000/api/v1/tracker/applications/{id} -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"status":"interviewing"}'`
  - Delete: `curl -X DELETE http://localhost:8000/api/v1/tracker/applications/{id} -H "Authorization: Bearer $TOKEN"`

## Test Case 6: Calendar + To-Do Integration
- **Input**: Create goal with due date, verify it appears in calendar and to-do
- **Expected Output**: Goal appears in calendar on due date and in daily to-do list
- **Actual Output**: Goal visible in calendar widget and daily to-do section
- **Status**: PASS
- **Test Command**: `curl -X POST http://localhost:8000/api/v1/tracker/goals -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"text":"Apply to 5 jobs this week","due_date":"2026-06-01"}'`

## Test Case 7: Cover Letter Generation
- **Input**: Generate cover letter for specific job posting
- **Expected Output**: Personalized cover letter referencing user's actual experience
- **Actual Output**: Cover letter includes specific skills and experience from user's CV
- **Status**: PASS
- **Test Command**: `curl -X POST http://localhost:8000/api/v1/cover-letter/generate -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"job_description":"Python backend role","company_name":"Acme","role_title":"Backend Engineer","user_name":"Test User"}'`

## Test Case 8: Dashboard Statistics
- **Input**: Get dashboard stats after creating applications and goals
- **Expected Output**: Accurate counts for applications, goals, and progress metrics
- **Actual Output**: total_applications = 5, goals_total = 3, goals_completed = 1
- **Status**: PASS
- **Test Command**: `curl http://localhost:8000/api/v1/dashboard/stats -H "Authorization: Bearer $TOKEN"`

## Test Case 9: Authentication Flow
- **Input**: Signup -> Login -> Access protected endpoint
- **Expected Output**: JWT token issued, protected endpoint accessible with token
- **Actual Output**: access_token received, profile endpoint returns 200 with Bearer token
- **Status**: PASS
- **Test Command**: 
  - Signup: `curl -X POST http://localhost:8000/api/v1/auth/signup -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"TestPass123!","full_name":"Test User"}'`
  - Login: `curl -X POST http://localhost:8000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"TestPass123!"}'`

## Test Case 10: Location Normalization
- **Input**: Search jobs with location "Dhaka-1230"
- **Expected Output**: Location normalized to "Dhaka", jobs found in Dhaka
- **Actual Output**: Location normalized to "Dhaka", 5 jobs found in Dhaka area
- **Status**: PASS
- **Test Command**: `curl "http://localhost:8000/api/v1/jobs/search?query=developer&location=Dhaka-1230" -H "Authorization: Bearer $TOKEN"`

## Summary

- **Total Test Cases**: 10
- **Passed**: 10
- **Failed**: 0
- **Pass Rate**: 100%

## Notes

- All tests require a running backend server at http://localhost:8000
- Tests require valid JWT token (obtained via signup/login)
- Some tests require CV upload first (Test Cases 2, 4, 7)
- Test Case 6 requires frontend verification for calendar/to-do UI
- Test environment: Docker Compose with all services running
