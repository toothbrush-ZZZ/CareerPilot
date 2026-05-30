# CareerPilot Architecture Diagram

## System Overview

CareerPilot is a full-stack RAG-based career management platform with four main pillars:
1. Job Hunter Agent
2. Profile & Resume Intelligence (RAG Core)
3. Personal AI Assistant
4. Productivity & Progress Tracker

## Architecture Diagram

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

## Data Flow

### CV Upload & Processing Flow
```
User uploads CV (PDF/DOCX)
    ↓
Frontend sends file to /api/v1/cv/upload
    ↓
CV Service extracts text using pdfplumber/python-docx
    ↓
Text is chunked by section (Experience, Education, Skills)
    ↓
Chunks sent to Embed Service for vector embeddings
    ↓
Embeddings stored in PostgreSQL with pgvector
    ↓
CV chunks indexed for RAG queries
```

### Job Search Flow
```
User enters natural language query
    ↓
Job Hunter Agent parses query using LLM
    ↓
Agent calls multiple scrapers in parallel:
    - Remotive API (remote jobs)
    - Arbeitnow API (developer jobs)
    - JobSpy (LinkedIn, Indeed, Glassdoor)
    - BDJobs (local jobs)
    ↓
Results ranked by location match and skills fit
    ↓
Fit scores computed using vector similarity with CV
    ↓
Ranked results returned to frontend
```

### AI Assistant Chat Flow
```
User sends chat message
    ↓
Assistant retrieves user's CV chunks from vector DB
    ↓
Context assembled with CV + chat history (from Redis)
    ↓
LLM Factory tries providers in order:
    1. Groq (fast inference)
    2. Gemini (advanced reasoning)
    3. Ollama (local fallback)
    ↓
Response generated with RAG-grounded context
    ↓
Chat history updated in Redis
    ↓
Response returned to frontend
```

### Application Tracker Flow
```
User creates/updates application
    ↓
Tracker Service validates and stores in PostgreSQL
    ↓
Dashboard stats recalculated
    ↓
Progress metrics updated
    ↓
AI Nudge Agent analyzes progress
    ↓
Personalized nudges generated if needed
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **UI Components**: Shadcn/ui, Radix UI
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with pgvector extension
- **Cache**: Redis
- **ORM**: SQLAlchemy (async)
- **Authentication**: JWT with bcrypt
- **AI Providers**: Groq, Gemini, Ollama

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Embedding Service**: FastEmbed (BAAI/bge-small-en-v1.5)
- **Job Scraping**: JobSpy, BeautifulSoup, Selenium

## Key Design Decisions

### RAG Architecture
- User's CV is the single source of truth
- All AI responses are grounded in actual user data
- Vector similarity search for semantic matching
- Prevents hallucination of user background

### Multi-Provider AI Strategy
- Provider fallback chain ensures reliability
- Local Ollama instance for privacy-sensitive operations
- Groq for fast real-time responses
- Gemini for complex reasoning tasks

### Scalability Considerations
- Async/await throughout for high throughput
- Redis caching reduces database load
- Connection pooling for database
- Stateless JWT authentication
- Containerized services for horizontal scaling

### Security
- Row Level Security (RLS) in PostgreSQL
- Password hashing with bcrypt
- JWT token expiration
- Input validation with Pydantic
- CORS configuration for frontend

## Performance Optimizations

### Database
- Indexed columns for fast lookups
- Vector similarity search with pgvector
- Connection pooling
- Async queries

### Caching
- Redis for job search results (30-minute TTL)
- Redis for user profiles (1-hour TTL)
- Redis for AI chat history (1-hour TTL)

### API
- Parallel job scraping with individual timeouts
- Provider fallback for AI services
- Response compression
- Efficient data serialization

## Deployment Architecture

### Development
```
Docker Compose with:
- Frontend (Next.js dev server)
- Backend (FastAPI with --reload)
- PostgreSQL (with pgvector)
- Redis
- Embed Service
```

### Production
```
Recommended:
- Frontend: Vercel/Railway/Render
- Backend: Railway/Render/AWS
- Database: Supabase/Neon (managed PostgreSQL with pgvector)
- Redis: Upstash/Redis Cloud
- Embed Service: Railway/Render
```

## Monitoring & Observability

### Logging
- Structured logging with Python logging
- Request/response logging
- Error tracking and alerting

### Metrics
- API response times
- Database query performance
- Cache hit rates
- AI provider success rates

### Health Checks
- `/health` endpoint checks API and Redis
- Embed service `/health` endpoint
- Database connection monitoring

## Future Scalability

### Horizontal Scaling
- Stateless authentication (JWT)
- Containerized services
- Load balancer ready
- Database connection pooling

### Vertical Scaling
- Async I/O for high throughput
- Efficient memory usage
- CPU-bound operations in separate services
- Resource limits in Docker

### Data Scaling
- Database indexing strategy
- Vector search optimization
- Cache layer for hot data
- Pagination for large datasets

## System Design Analysis

### Scaling to 10,000 Users

#### Current Architecture Capacity
- **Database**: PostgreSQL with pgvector can handle 10K+ users with proper indexing
- **Cache**: Redis can handle 10K+ concurrent sessions with proper memory allocation
- **API**: FastAPI with async can handle ~1000 req/sec with proper scaling
- **Embedding Service**: Dedicated service can handle embedding generation at scale

#### Required Changes for 10K Users

**Database Scaling**
- Implement read replicas for query scaling
- Add connection pooling with PgBouncer
- Optimize vector search with HNSW indexes for pgvector
- Implement database sharding if needed (by user_id)

**Cache Scaling**
- Redis Cluster for horizontal scaling
- Implement cache warming for frequently accessed data
- Add cache invalidation strategy for consistency
- Use Redis for session storage with proper TTL

**API Scaling**
- Implement horizontal scaling with Kubernetes or Docker Swarm
- Add rate limiting per user
- Implement API gateway for load balancing
- Add CDN for static assets

**Embedding Service Scaling**
- Implement queue-based processing (Celery/RQ)
- Add multiple embedding service instances
- Implement caching for common embeddings
- Consider batch processing for efficiency

### Estimated Cost Per User/Month

#### Infrastructure Costs (10K Users)

**Database**
- Managed PostgreSQL (Supabase/Neon): $25-50/month for 10K users
- Storage: 10GB @ $0.125/GB = $1.25/month
- Bandwidth: 100GB @ $0.09/GB = $9/month
- **Total Database**: ~$35-60/month

**Cache**
- Redis Cloud (Upstash): $5-10/month for 10K users
- Memory: 1GB for sessions + 2GB for cache = 3GB @ $0.20/GB = $0.60/month
- **Total Cache**: ~$5.50-10.50/month

**API Hosting**
- Railway/Render: $20-50/month for 3-5 instances
- CPU: 2-4 cores @ $10/core = $20-40/month
- Memory: 4-8GB @ $0.50/GB = $2-4/month
- **Total API**: ~$22-54/month

**Embedding Service**
- Dedicated instance: $10-20/month
- GPU not required for BAAI/bge-small-en-v1.5
- **Total Embedding**: ~$10-20/month

**Frontend Hosting**
- Vercel/Netlify: Free tier sufficient for 10K users
- Bandwidth: 100GB free tier
- **Total Frontend**: $0/month

**AI API Costs**
- Groq: $0.59/1M tokens, estimated 100K tokens/user/month = $5.90/month
- Gemini: Free tier sufficient for 10K users
- Ollama: Free (self-hosted)
- **Total AI**: ~$5.90/month

**Total Infrastructure Cost**: ~$78-150/month
**Cost Per User**: ~$0.008-0.015/month

### Key Bottlenecks

#### Current Bottlenecks

1. **Vector Search Performance**
   - Issue: pgvector similarity search can be slow with large datasets
   - Impact: Slow job matching and CV search
   - Solution: Implement HNSW indexes, consider approximate search

2. **Job Scraping Latency**
   - Issue: External API calls can be slow and rate-limited
   - Impact: Slow job search responses
   - Solution: Implement caching, rate limiting, and fallback strategies

3. **Embedding Generation**
   - Issue: Embedding service can be CPU-intensive
   - Impact: Slow CV processing
   - Solution: Implement queue-based processing, multiple instances

4. **Database Connection Pool**
   - Issue: Limited connections can cause bottlenecks
   - Impact: Slow API responses under load
   - Solution: Implement PgBouncer, increase pool size

#### Scaling Bottlenecks

1. **Session Storage**
   - Issue: Redis memory limits with 10K concurrent sessions
   - Impact: Session loss, poor user experience
   - Solution: Redis Cluster, implement session cleanup

2. **Vector Database Size**
   - Issue: 10K users * 100 CV chunks/user = 1M vectors
   - Impact: Slow vector search, high memory usage
   - Solution: Implement vector pruning, use HNSW indexes

3. **API Rate Limits**
   - Issue: External APIs (Groq, job boards) have rate limits
   - Impact: Service degradation under load
   - Solution: Implement caching, rate limiting, fallback providers

4. **File Storage**
   - Issue: CV files and generated content storage
   - Impact: High storage costs, slow access
   - Solution: Use S3-compatible storage, implement CDN

### Optimization Strategies

#### Performance Optimizations

1. **Implement Caching Strategy**
   - Cache job search results for 30 minutes
   - Cache user profiles for 1 hour
   - Cache AI responses for 24 hours
   - Expected improvement: 50-70% reduction in API calls

2. **Optimize Vector Search**
   - Implement HNSW indexes for pgvector
   - Use approximate search for large datasets
   - Implement vector pruning for old data
   - Expected improvement: 10-20x faster vector search

3. **Implement Queue-Based Processing**
   - Use Celery/RQ for background tasks
   - Implement job queue for CV processing
   - Implement queue for embedding generation
   - Expected improvement: Better user experience, higher throughput

4. **Implement CDN**
   - Use Cloudflare for static assets
   - Implement edge caching for API responses
   - Expected improvement: 50-80% faster load times

#### Cost Optimization

1. **Use Free Tiers**
   - Supabase free tier for database
   - Upstash free tier for Redis
   - Vercel free tier for frontend
   - Expected savings: $50-100/month

2. **Optimize AI Usage**
   - Use Ollama for free local inference
   - Implement caching for AI responses
   - Use Groq for fast, cheap inference
   - Expected savings: $30-50/month

3. **Optimize Storage**
   - Implement automatic file cleanup
   - Use compression for CV files
   - Implement CDN for static assets
   - Expected savings: $10-20/month
