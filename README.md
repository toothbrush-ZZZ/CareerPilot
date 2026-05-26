# CareerPilot — AI-Powered Career Assistant

CareerPilot is a production-grade career co-pilot that helps you manage your professional journey. It leverages RAG (Retrieval-Augmented Generation) to ground AI advice in your actual CV, find jobs that fit your profile, and build ATS-optimized resumes.

## ✨ Key Features

- **Secure Authentication**: Built-in local JWT auth + Supabase support.
- **Agentic AI Assistant**: Contextual career advice grounded in your CV.
- **Multi-Provider AI**: Supports Groq (Llama 3), Google Gemini, and **Ollama** (Local/Free).
- **Job Hunter**: Parallel search across Remotive, Arbeitnow, and BDJobs with automated fit scoring.
- **ATS CV Builder**: Generate professional PDFs optimized for search engines.
- **Data Isolation**: Strict per-user data and file isolation using Postgres RLS and user-specific storage.

## 🚀 Quick Start (Local First / Free)

If you want to run the project without paid API keys, follow these steps:

### 1. Prerequisites
- **Python 3.9+**
- **Node.js 18+**
- **Docker** (for DB and Redis)
- **Ollama** (Optional, for local AI)

### 2. Setup Environment
Copy `.env.example` to `.env` and configure:
```bash
# Auth
JWT_SECRET=your_secret_here

# Infrastructure (Default for local Docker)
POSTGRES_URL=postgresql://cpuser:cppass@localhost:5432/careerpilot
REDIS_URL=redis://localhost:6379
EMBED_URL=http://localhost:8001

# AI Fallback (If no Groq/Gemini keys)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3:8b
```

### 3. Start Infrastructure
If you're running this for the first time, build the Docker images first:
```bash
docker-compose build
# or, with Docker Compose v2: docker compose build
```
Start the services:
```bash
docker-compose up -d
```

### 4. Install Dependencies
Run the setup script:
```bash
setup.bat
```

### 5. Run Application
**Backend:**
```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## 🛠 Manual Configuration (API Keys)

To enable advanced features, obtain and add these keys to `.env`:
- **Groq**: [console.groq.com](https://console.groq.com)
- **Gemini**: [aistudio.google.com](https://aistudio.google.com)
- **Adzuna**: [developer.adzuna.com](https://developer.adzuna.com) (Job search fallback)

## 📁 File Structure
- `backend/`: FastAPI application, agents, and services.
- `frontend/`: Next.js 14 dashboard with premium Tailwind styling.
- `embed/`: Lightweight embedding service for local RAG.
- `db/`: Database initialization and schema.
- `uploads/`: User-isolated CV and PDF storage.
