# CareerPilot 🚀

AI-powered career co-pilot: resume intelligence, cover letters, job discovery, and productivity tracking in a single app.

## 🎯 Demo Account

- Email: `demo@careerpilot.ai`
- Password: `demopassword`

## Overview

CareerPilot helps users manage their job search by combining CV parsing and retrieval-augmented generation (RAG) with job scraping and productivity tools. It provides an assistant grounded in the user's CV, job fit scoring, and a tracker for applications and goals.

## Key Features

- Job discovery with fit scoring (scraped job cards + AI scoring)
- CV upload and RAG: PDF/DOCX parsing → chunking → embeddings → semantic search
- Conversational AI assistant for cover letters, interview prep, and skill-gap analysis
- Application tracker and dashboard with nudges and progress metrics

## Architecture

- Frontend: Next.js, TypeScript, Tailwind CSS
- Backend: FastAPI, SQLite, ChromaDB (in-process)
- AI: Resilient LLM Routing (Groq ➔ Gemini ➔ OpenRouter fallback)
- Job scraping: python-jobspy (parallel scraper engine)

## 📖 Running the Application (Manual)

### Prerequisites
- **Docker** and **Docker Compose** (for Method 1)
- **Node.js** (v18+) and **Python** (3.10+) (for Method 2)
- API keys for **Groq**, **Gemini**, or **OpenRouter** (for LLM services and fallbacks)

### Method 1: Running with Docker (Recommended)
This is the fastest way to get the entire stack running.

1. **Set up your environment variables:**
   ```bash
   cp .env.example .env
   ```
    Open the `.env` file and fill in your API keys (e.g. `GROQ_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`) and set a `JWT_SECRET`.

2. **Start the application:**
   ```bash
   docker-compose up -d --build
   ```

3. **Access the application:**
   - Frontend Dashboard: [http://localhost:3000](http://localhost:3000)
   - Backend API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

4. **Stop the application:**
   ```bash
   docker-compose down
   ```

### Method 2: Running Locally (Without Docker)
If you prefer to run the services directly on your machine for active development:

1. **Set up your environment variables:**
   ```bash
   cp .env.example .env
   ```

2. **Start the Backend (FastAPI):**
   Open a new terminal and run:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```

3. **Start the Frontend (Next.js):**
   Open another terminal and run:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application:**
   - The frontend will be available at [http://localhost:3000](http://localhost:3000).

## Tech Stack

- Frontend: Next.js + TypeScript
- Backend: FastAPI
- Database: SQLite + aiosqlite
- Vector DB: ChromaDB (on-disk persistence)
- AI provider: Groq, Gemini (GenAI SDK), and OpenRouter
- CV parsing: pdfplumber + python-docx

## 🧪 Evaluation Suite

10 documented test cases covering all four pillars and core technical requirements. See [evals/test_cases.md](./evals/test_cases.md).

To run automated checks:

```bash
# 1. Start the backend
docker-compose up -d

# 2. Set your backend URL
export BACKEND_URL=http://localhost:8000   # or your deployed URL

# 3. Get an auth token using the demo account
TOKEN=$(curl -s -X POST $BACKEND_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@careerpilot.ai","password":"demopassword"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

# 4. Run evals
export AUTH_TOKEN=$TOKEN
python evals/run_evals.py
```

## 📐 System Design

See [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) for the architecture details, scaling analysis (0 to 10k users), cost estimates (~7.47 BDT / $0.0636 per user/month at scale), and current/production bottleneck mitigations.
