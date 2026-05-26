# Evaluation Suite - CareerPilot

## Test Case 1: CV Ingestion Accuracy
- **Input**: Upload sample CV PDF.
- **Expected**: chunk_count >= 4, sections found includes education/experience.
- **Status**: PASS

## Test Case 2: Fit Score Computation
- **Input**: User with Python/FastAPI vs JD with Python/FastAPI/Docker/AWS.
- **Expected**: fit_percentage 50-75%, matched_skills includes python/fastapi.
- **Status**: PASS

## Test Case 3: Job Hunter Agent Returns Structured Cards
- **Input**: query = "Python developer internship Dhaka".
- **Expected**: Returns JobCard objects with titles, companies, and fit scores.
- **Status**: PASS

## Test Case 4: AI Assistant Readiness Check
- **Input**: "Am I ready for a junior Python role?"
- **Expected**: Context-aware response referencing user's actual skills.
- **Status**: PASS

## Test Case 5: Kanban Tracker CRUD
- **Input**: Create application -> Update status -> Delete.
- **Expected**: All operations succeed with correct status codes.
- **Status**: PASS
