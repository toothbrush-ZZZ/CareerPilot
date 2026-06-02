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
- AI: Groq (LLM) for scoring and assistant responses
- Job scraping: python-jobspy (integrated scraper)

## Quick Start

```bash
git clone <repo> && cd CareerPilot
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
docker-compose up -d
# Open the frontend at http://localhost:3000 and backend at http://localhost:8000
```

## Environment Variables

> **Note:** For security reasons, API keys are not included in this repository. Please copy `.env.example` to `.env` and insert your `GROQ_API_KEY` and `JWT_SECRET`. You can use your own Groq API key (it's free at console.groq.com).

Required variables:

```bash
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET=change_this_to_any_random_32_char_string
DATABASE_URL=sqlite+aiosqlite:///./data/careerpilot.db

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Local Development (without Docker)

Backend:

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Tech Stack

- Frontend: Next.js + TypeScript
- Backend: FastAPI
- Database: SQLite + aiosqlite
- Vector DB: ChromaDB (on-disk persistence)
- AI provider: Groq
- CV parsing: pdfplumber + python-docx

## 🧪 Evaluation Suite

8 documented test cases covering all four pillars. See [evals/TEST_CASES.md](./evals/TEST_CASES.md).

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

See [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) for the architecture diagram, scaling analysis (0→100→1k→10k users), cost estimates (~$0.01/user/month at scale), and bottleneck mitigations.

## 📋 API Reference

See [API.md](./API.md) for the full endpoint reference. Interactive Swagger docs are available at `$BACKEND_URL/docs` when the backend is running.

