# CareerPilot Dependencies & Documentation

This document contains setup instructions, project goals, and dependency listings for CareerPilot, with a focus on the frontend stack and how to run the full project locally via the Makefile.

---

## 1. Project Goals
CareerPilot is an AI-powered agentic career co-pilot designed to streamline the job hunt and skill-acquisition process:
1. **Intelligent Grounding:** Retrieve and process the user's CV as the single source of truth for downstream actions (preventing AI hallucination of qualifications).
2. **Deterministic Fit Analysis:** Parse live job descriptions and compare them programmatically against the CV context, scoring matching levels and mapping skill gaps.
3. **Automated Tailoring:** Generate job-specific cover letters that mention only true experience, with a feedback mechanism to refine results in real-time.
4. **Accountability Pipeline:** Log applications on a Kanban board, view deadlines on a calendar, and track goals to maintain structured job-seeking productivity.

---

## 2. Dependencies

The frontend uses the following packages to deliver a fast, responsive interface:

### Core Dependencies
* **`next`** (`16.2.6`): React framework for server rendering, App Router layout, and optimized bundling.
* **`react` / `react-dom`** (`19.2.4`): UI rendering.
* **`typescript`** (`^5`): Static typing.
* **`axios`** (`^1.16.1`): HTTP client for communicating with the backend FastAPI service.
* **`framer-motion`** (`^12.40.0`): Dynamic layout animations and page transitions.
* **`recharts`** (`^3.8.1`): Composable chart components for data visualization on the dashboard.
* **`lucide-react`** (`^1.16.0`): Clean modern vector iconography.
* **`clsx`** (`^2.1.1`): Utility for constructing conditional className strings.
* **`tailwind-merge`** (`^3.6.0`): Merge Tailwind CSS classes dynamically without style conflicts.
* **`date-fns`** (`^4.3.0`): Date formatting utilities.

### Dev Dependencies
* **`tailwindcss`** (`^4`): Utility-first CSS framework.
* **`@tailwindcss/postcss`** (`^4`): PostCSS runner for Tailwind styles.
* **`eslint`** / **`eslint-config-next`** (`16.2.6`): Code quality linting.

---

## 3. Setup & Local Development Instructions

From the project root, use the **Makefile** to run the backend and frontend together.

### Prerequisites
* **Docker** and **Docker Compose** (for the backend stack: database, Redis, embed service, API)
* **Make**
* **Node.js** (v18 or higher recommended)
* **npm** (v9 or higher)

Ensure a root `.env` file exists for Docker services (see project docs under `docs/` if you need API keys or database settings).

### Run the project (recommended)

From the repository root:

```bash
make
```

Equivalent commands: `make dev`, `make run`, or `make start`.

This will:

1. Create `frontend/.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1` if it does not exist
2. Run `npm install` in `frontend/` if `node_modules` is missing
3. Start the backend stack in Docker (`db`, `redis`, `embed`, `backend`)
4. Start the Next.js dev server on your machine (hot reload)

When everything is up:

* **Frontend:** [http://localhost:3000](http://localhost:3000)
* **Backend API:** [http://localhost:8000](http://localhost:8000)

Press **Ctrl+C** in the terminal to stop the frontend and shut down the backend containers started by `make dev`.

To stop the backend stack without starting the frontend again:

```bash
make dev-down
```

List all Makefile targets:

```bash
make help
```

### Other useful commands

| Command | Description |
|---------|-------------|
| `make install-frontend` | Install frontend npm dependencies only |
| `make frontend-env` | Create `frontend/.env.local` with the default API URL |
| `make frontend-dev` | Run only the frontend dev server (backend must already be running) |
| `make backend-dev` | Run only the backend stack in Docker (foreground) |
| `make frontend-build` | Production build of the frontend |
| `make docker-up` | Run the **entire** stack in Docker, including the frontend container |
| `make docker-down` | Stop all Docker Compose services |

### Manual setup (optional)

If you prefer not to use `make dev`, you can set up the frontend by hand:

**Install dependencies**

```bash
cd frontend
npm install
```

**Environment variables**

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Or from the project root: `make frontend-env`.

**Run the frontend only** (with the backend already running on port 8000):

```bash
make frontend-dev
```

### Production build (optional)

From the project root:

```bash
make frontend-build
```

Or from `frontend/`: `npm run build`. This writes the optimized bundle under `frontend/.next`.
