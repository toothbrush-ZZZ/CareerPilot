# CareerPilot Dependencies & Documentation

## Project Goals

CareerPilot is an AI-powered career management SaaS platform designed to help users:
- **Aggregate job listings** from multiple sources in real-time
- **Evaluate resume fit** against job descriptions using AI
- **Track applications** with a Kanban-style pipeline
- **Generate cover letters** automatically based on CV context
- **Chat with AI career counselor** for personalized advice

The platform is optimized for hackathon scenarios while maintaining production-ready architecture for long-term scalability.

## Setup Instructions

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)
- Git

### Quick Start (Docker)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CareerPilot
   ```

2. **Configure environment variables**
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

### Local Development Setup

#### Frontend Development

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Access frontend**
   - http://localhost:3000

#### Backend Development

1. **Install dependencies**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Configure environment**
   ```bash
   cp ../.env.example ../.env
   # Edit .env with your configuration
   ```

3. **Start development server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Access backend**
   - API: http://localhost:8000
   - Documentation: http://localhost:8000/docs

## Dependencies

### Frontend Dependencies

#### Core Framework
- **next**: ^14.0.0 - React framework with SSR
- **react**: ^18.2.0 - UI library
- **react-dom**: ^18.2.0 - React DOM renderer
- **typescript**: ^5.0.0 - Type safety

#### UI & Styling
- **tailwindcss**: ^3.3.0 - Utility-first CSS
- **@tailwindcss/typography**: ^0.5.0 - Typography plugin
- **lucide-react**: ^0.294.0 - Icon library
- **clsx**: ^2.0.0 - Conditional class names
- **tailwind-merge**: ^2.0.0 - Tailwind class merging

#### State Management
- **zustand**: ^4.4.0 - Lightweight state management

#### HTTP Client
- **axios**: ^1.6.0 - HTTP requests

#### UI Components
- **@radix-ui/react-dialog**: ^1.0.0 - Dialog component
- **@radix-ui/react-dropdown-menu**: ^2.0.0 - Dropdown menu
- **@radix-ui/react-select**: ^2.0.0 - Select component
- **@radix-ui/react-tabs**: ^1.0.0 - Tabs component
- **@radix-ui/react-toast**: ^1.1.0 - Toast notifications

#### Development Tools
- **eslint**: ^8.50.0 - Code linting
- **eslint-config-next**: ^14.0.0 - Next.js ESLint config
- **@types/node**: ^20.0.0 - Node.js type definitions
- **@types/react**: ^18.2.0 - React type definitions
- **@types/react-dom**: ^18.2.0 - React DOM type definitions

### Backend Dependencies

#### Core Framework
- **fastapi**: ^0.104.0 - Modern Python web framework
- **uvicorn[standard]**: ^0.24.0 - ASGI server
- **pydantic**: ^2.5.0 - Data validation
- **pydantic-settings**: ^2.1.0 - Settings management

#### Database
- **sqlalchemy**: ^2.0.0 - SQL ORM
- **asyncpg**: ^0.29.0 - Async PostgreSQL driver
- **alembic**: ^1.12.0 - Database migrations

#### Authentication
- **python-jose[cryptography]**: ^3.3.0 - JWT handling
- **passlib[bcrypt]**: ^1.7.4 - Password hashing
- **python-multipart**: ^0.0.6 - Form data handling

#### HTTP Client
- **httpx**: ^0.25.0 - Async HTTP client
- **requests**: ^2.31.0 - Sync HTTP client

#### AI Services
- **google-generativeai**: ^0.3.0 - Google Gemini API
- **groq**: ^0.4.0 - Groq API client

#### Job Scraping
- **jobspy**: ^1.0.0 - Job scraping library
- **beautifulsoup4**: ^4.12.0 - HTML parsing
- **selenium**: ^4.15.0 - Web automation

#### Utilities
- **python-dotenv**: ^1.0.0 - Environment variables
- **redis**: ^5.0.0 - Redis client
- **pandas**: ^2.1.0 - Data manipulation
- **openpyxl**: ^3.1.0 - Excel file handling
- **pdfplumber**: ^0.10.0 - PDF parsing
- **python-docx**: ^1.1.0 - Word document parsing

#### Development Tools
- **pytest**: ^7.4.0 - Testing framework
- **pytest-asyncio**: ^0.21.0 - Async testing
- **black**: ^23.11.0 - Code formatting
- **pylint**: ^3.0.0 - Code linting

### Infrastructure Dependencies

#### Docker Services
- **postgres**: 15-alpine - Database
- **redis**: 7-alpine - Cache
- **ankane/pgvector**: Latest - PostgreSQL with vector support

#### Python Services
- **fastembed**: ^0.2.0 - Embedding generation
- **uvicorn**: ^0.24.0 - ASGI server

## Environment Variables

### Required Variables

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

### Optional Variables

```bash
# Supabase (for social login)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# AI Services (Cloud Providers)
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key

# Job APIs
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_API_KEY=your_adzuna_api_key
```

## Project Structure

```
CareerPilot/
├── backend/
│   ├── app/
│   │   ├── agents/          # AI agent implementations
│   │   ├── api/             # API routes
│   │   ├── core/            # Core configuration
│   │   ├── jobs/            # Job scraping logic
│   │   ├── middleware/      # Authentication middleware
│   │   ├── services/        # Business logic services
│   │   ├── utils/           # Utility functions
│   │   └── main.py          # FastAPI application entry
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile           # Backend container
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js app directory
│   │   ├── components/      # React components
│   │   ├── services/        # API client services
│   │   ├── store/           # State management
│   │   └── types/           # TypeScript types
│   ├── package.json         # Node dependencies
│   └── Dockerfile           # Frontend container
├── embed/
│   ├── app/                 # Embedding service
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile           # Embed service container
├── db/
│   └── init.sql             # Database initialization
├── docker-compose.yml       # Service orchestration
├── .env.example             # Environment template
└── README.md                # Project documentation
```

## API Documentation

### Authentication Endpoints

- `POST /auth/signup` - Register new user
- `POST /auth/login` - User login
- `POST /auth/change-password` - Change password
- `DELETE /auth/delete-account` - Delete account

### Job Endpoints

- `POST /jobs/search` - Search for jobs
- `POST /jobs/compute-fit` - Compute job fit score

### CV Endpoints

- `POST /cv/upload` - Upload CV
- `GET /cv/status` - Check CV status
- `DELETE /cv/delete` - Delete CV
- `POST /cv/build` - Build CV

### Profile Endpoints

- `GET /profile` - Get user profile
- `PUT /profile` - Update profile

### Dashboard Endpoints

- `GET /dashboard/stats` - Get dashboard statistics

### Tracker Endpoints

- `POST /tracker/applications` - Create application
- `GET /tracker/applications` - Get applications
- `PUT /tracker/applications/{id}` - Update application
- `DELETE /tracker/applications/{id}` - Delete application
- `POST /tracker/goals` - Create goal
- `GET /tracker/goals` - Get goals

### Assistant Endpoints

- `POST /assistant/chat` - Chat with AI assistant
- `DELETE /assistant/session/{id}` - Clear chat session

### Debug Endpoints

- `POST /debug/reset-demo` - Reset demo data
- `POST /debug/login-demo` - Login as demo user

## Development Guidelines

### Code Style

**Frontend:**
- Use TypeScript for type safety
- Follow React best practices
- Use Tailwind CSS for styling
- Component-based architecture

**Backend:**
- Follow PEP 8 style guide
- Use type hints for all functions
- Async/await for I/O operations
- Service layer pattern for business logic

### Git Workflow

1. Create feature branch from `main`
2. Make changes with descriptive commits
3. Test changes locally
4. Push branch and create pull request
5. Code review and merge

### Testing

**Frontend:**
- Unit tests for components
- Integration tests for API calls
- E2E tests for critical user flows

**Backend:**
- Unit tests for services
- Integration tests for API endpoints
- Database tests with fixtures

## Deployment

### Production Deployment

1. **Configure production environment variables**
   ```bash
   cp .env.example .env.production
   # Edit with production values
   ```

2. **Build production images**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

3. **Deploy to production**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Monitoring

- Application logs: `docker-compose logs`
- Database logs: `docker-compose logs db`
- Redis logs: `docker-compose logs redis`

### Backup

- Database backups: `docker-compose exec db pg_dump careerpilot > backup.sql`
- Redis backups: `docker-compose exec redis redis-cli SAVE`

## Troubleshooting

### Common Issues

**Docker containers not starting**
- Check Docker daemon is running: `docker ps`
- Check port conflicts: `lsof -i :3000`
- Review logs: `docker-compose logs`

**Database connection errors**
- Verify POSTGRES_URL in .env
- Check database container: `docker-compose ps db`
- Test connection: `docker-compose exec db psql -U cpuser -d careerpilot`

**Redis connection errors**
- Verify REDIS_URL in .env
- Check Redis container: `docker-compose ps redis`
- Test connection: `docker-compose exec redis redis-cli ping`

**AI service not responding**
- Check API keys in .env
- Verify Ollama is running: `curl http://localhost:11434/api/tags`
- Check embed service: `curl http://localhost:8001/health`

## Support

For issues and questions:
- GitHub Issues: [repository-url]/issues
- Documentation: [repository-url]/wiki
- Email: support@careerpilot.ai

## License

MIT License - See LICENSE file for details
