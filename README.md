# CareerPilot 🚀

An AI-powered career management SaaS platform that aggregates job listings, evaluates resume fit, tracks applications, generates cover letters, and provides AI career counseling.

![CareerPilot](https://img.shields.io/badge/CareerPilot-AI%20Powered-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

- **🔍 Live Job Hunting & Scraping**
  - Real-time job aggregation from multiple sources (LinkedIn, Indeed, Glassdoor, BDJobs)
  - AI-powered job matching based on your CV
  - Location-aware search with postal code normalization

- **📊 Kanban Pipeline Tracker**
  - Organize applications in columns (Applied, Interviewing, Offer, Rejected)
  - Track application status with notes and metadata
  - Set and monitor career goals

- **🤝 AI Career Assistant Chat**
  - Personalized career advice based on your CV
  - Skills gap analysis and learning recommendations
  - Cover letter generation for specific jobs
  - Mock interview practice

- **📄 CV Processing & Analysis**
  - Upload and parse PDF/DOCX resumes
  - Automatic skill extraction and embedding
  - Location detection from CV content
  - Fit scoring against job descriptions

- **🎯 Smart Job Ranking**
  - Location-based job prioritization
  - Skills match scoring
  - Multi-source aggregation with deduplication

## 🏗️ Architecture

CareerPilot uses a modern, scalable architecture with RAG (Retrieval-Augmented Generation) at its core:

- **Frontend**: Next.js 16+ with TypeScript, Tailwind CSS, and Shadcn/ui
- **Backend**: FastAPI with Python, SQLAlchemy, and async PostgreSQL
- **Database**: PostgreSQL with pgvector for vector similarity search
- **Cache**: Redis for performance optimization
- **AI**: Multi-provider strategy (Groq, Gemini, Ollama) with fallback
- **Infrastructure**: Docker Compose for containerized deployment

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (Next.js)                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Landing    │  │   Dashboard  │  │  Job Search  │  │  AI Chat     │  │
│  │    Page      │  │              │  │              │  │              │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │                 │           │
│         └─────────────────┴─────────────────┴─────────────────┘           │
│                                   │                                        │
│                           HTTP/REST API                                    │
└───────────────────────────────────┼────────────────────────────────────────┘
                                    │
┌───────────────────────────────────┼────────────────────────────────────────┐
│                                   │                                        │
│  ┌────────────────────────────────▼────────────────────────────────┐      │
│  │                      BACKEND (FastAPI)                           │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │      │
│  │  │   Auth      │  │   CV        │  │   Jobs      │  │ Assistant │  │      │
│  │  │  Middleware │  │  Service    │  │  Service    │  │  Service  │  │      │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬─────┘  │      │
│  │         │                 │                 │               │         │      │
│  │  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐  ┌─────▼─────┐  │      │
│  │  │  Job Hunter │  │  Fit Scorer │  │  LLM Factory│  │  Tracker  │  │      │
│  │  │    Agent    │  │             │  │             │  │  Service  │  │      │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬─────┘  │      │
│  └─────────┼─────────────────┼─────────────────┼─────────────────┼───────┘      │
│            │                 │                 │                 │             │
│  ┌─────────▼─────────────────▼─────────────────▼─────────────────▼───────┐  │
│  │                     SERVICE LAYER                                    │  │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐          │  │
│  │  │  Auth     │  │  Embed    │  │  Seed     │  │  Nudge    │          │  │
│  │  │  Service  │  │  Service  │  │  Service  │  │  Agent    │          │  │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘          │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │
┌────────────────────────────────────┼────────────────────────────────────────┐
│                                     │                                        │
│         ┌───────────────────────────┴───────────────────────────┐          │
│         │                                                       │          │
│  ┌──────▼──────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──▼───────┐ │
│  │ PostgreSQL  │  │  Redis   │  │  Embed   │  │  Ollama  │  │  External │ │
│  │ + pgvector  │  │  Cache   │  │  Service │  │   (AI)   │  │   APIs    │ │
│  │             │  │          │  │          │  │          │  │           │ │
│  │ - Profiles  │  │ - Sessions│  │ - Vector │  │ - Llama  │  │ - Groq    │ │
│  │ - CV Chunks │  │ - Cache   │  │   Embed  │  │   3.2    │  │ - Gemini  │ │
│  │ - Jobs      │  │ - History │  │          │  │          │  │ - JobSpy  │ │
│  │ - Tracker   │  │          │  │          │  │          │  │ - Remotive│ │
│  └─────────────┘  └──────────┘  └──────────┘  └──────────┘  └───────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

**RAG Architecture**
- User's CV is the single source of truth
- All AI responses are grounded in actual user data
- Vector similarity search for semantic matching
- Prevents hallucination of user background

**Multi-Provider AI Strategy**
- Provider fallback chain ensures reliability
- Local Ollama instance for privacy-sensitive operations
- Groq for fast real-time responses
- Gemini for complex reasoning tasks

**Scalability**
- Async/await throughout for high throughput
- Redis caching reduces database load
- Connection pooling for database
- Stateless JWT authentication
- Containerized services for horizontal scaling


## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CareerPilot
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Demo Account

Use the instant demo feature on the landing page or login with:
- Email: `demo@careerpilot.ai`
- Password: `demopassword`

## 📚 Documentation

- [Stack Report](./STACK_REPORT.md) - Technology stack justification and architectural decisions
- [Dependencies & Setup](./DEPENDENCIES.md) - Comprehensive setup instructions and dependency list
- [API Documentation](http://localhost:8000/docs) - Interactive API documentation (after starting backend)

## 🔧 Configuration

### Required Environment Variables

```bash
# Database
POSTGRES_URL=postgresql+asyncpg://cpuser:cppass@db:5432/careerpilot

# Redis
REDIS_URL=redis://redis:6379

# Authentication
JWT_SECRET=your_jwt_secret_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Embedding Service
EMBED_URL=http://embed:8001

# AI Services (Ollama - Required)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:latest
```

### Optional Environment Variables

```bash
# AI Services (Cloud Providers)
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key

# Supabase (for social login)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

See [.env.example](./.env.example) for all available options.

## 📁 Project Structure

```
CareerPilot/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├─d─ agents/      # AI agent implementations
│   │   ├── api/         # API routes
│   │   ├── core/        # Core configuration
│   │   ├── jobs/        # Job scraping logic
│   │   ├── services/    # Business logic
│   │   └── main.py      # Application entry
├── frontend/            # Next.js frontend
│   ├── src/
│   │   ├── app/         # Next.js app directory
│   │   ├── components/  # React components
│   │   ├── services/    # API client services
│   │   └── store/       # State management
├── embed/               # Embedding service
│   ├── app/             # FastAPI embedding service
│   └── requirements.txt
├── db/                  # Database initialization
├── docker-compose.yml    # Service orchestration
└── README.md            # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - User login
- `POST /auth/change-password` - Change password
- `DELETE /auth/delete-account` - Delete account

### Jobs
- `POST /jobs/search` - Search for jobs
- `POST /jobs/compute-fit` - Compute job fit score

### CV
- `POST /cv/upload` - Upload CV
- `GET /cv/status` - Check CV status
- `DELETE /cv/delete` - Delete CV
- `POST /cv/build` - Build CV

### Profile
- `GET /profile` - Get user profile
- `PUT /profile` - Update profile

### Dashboard
- `GET /dashboard/stats` - Get dashboard statistics

### Tracker
- `POST /tracker/applications` - Create application
- `GET /tracker/applications` - Get applications
- `PUT /tracker/applications/{id}` - Update application
- `DELETE /tracker/applications/{id}` - Delete application
- `POST /tracker/goals` - Create goal
- `GET /tracker/goals` - Get goals

### Assistant
- `POST /assistant/chat` - Chat with AI assistant
- `DELETE /assistant/session/{id}` - Clear chat session

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚢 Deployment

### Production Deployment

1. Configure production environment variables
2. Build production images
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```
3. Deploy to production
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Monitoring

- Application logs: `docker-compose logs`
- Database logs: `docker-compose logs db`
- Redis logs: `docker-compose logs redis`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request