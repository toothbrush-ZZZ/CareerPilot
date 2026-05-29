# CareerPilot: Environment Keys Configuration Manual

This manual provides step-by-step instructions to obtain every credential, token, and configuration variable defined in [`.env.example`](file:///home/zzz/Desktop/Projects/CareerPilot/.env.example). 

By completing these steps, you will be able to unlock all features of the CareerPilot system, including AI analysis, live job searches, and secure user sessions.

---

## Table of Contents
1. [Supabase Authentication (Cloud/Hosted)](#1-supabase-authentication-cloudhosted)
2. [Generative AI Model Keys (Groq & Gemini)](#2-generative-ai-model-keys-groq--gemini)
3. [Live Job Search APIs (Adzuna)](#3-live-job-search-apis-adzuna)
4. [Infrastructure Configurations (Postgres, Redis, Embeddings)](#4-infrastructure-configurations-postgres-redis-embeddings)
5. [JWT Security Secret Token](#5-jwt-security-secret-token)
6. [Offline LLM Setup (Ollama)](#6-offline-llm-setup-ollama)

---

## 1. Supabase Authentication (Cloud/Hosted)
Supabase provides the authentication system and database hosting for CareerPilot.

### Step-by-Step Instructions:
1.  **Register/Sign In**: Go to [supabase.com](https://supabase.com) and click **Sign Up** or **Sign In** (with GitHub or email).
2.  **Create a New Project**:
    *   Click **New Project** on your dashboard.
    *   Select your organization, name your project (e.g., `CareerPilot`), set a secure database password, and choose a region close to you.
    *   Click **Create new project**. Wait 1–2 minutes for the database instance to provision.
3.  **Retrieve API Credentials**:
    *   Once provisioned, navigate to **Project Settings** (gear icon on the left sidebar) and select **API**.
    *   In the **API Keys** section, copy the following values:
        *   **Project URL**: Copy the URL (e.g., `https://your-project-id.supabase.co`) -> Save as `SUPABASE_URL`.
        *   **`anon` `public` key**: Copy the long public key -> Save as `SUPABASE_ANON_KEY`.
        *   **`service_role` key**: Click **Reveal** to display the secret key, copy it -> Save as `SUPABASE_SERVICE_KEY`.

> [!CAUTION]
> **Security Warning**: Never share your `SUPABASE_SERVICE_KEY` publicly. It bypasses Row Level Security (RLS) entirely.

---

## 2. Generative AI Model Keys (Groq & Gemini)
CareerPilot leverages Groq (for blazing-fast processing) and Google Gemini (for deep contextual tasks).

### A. Groq API Key
1.  **Access the Console**: Visit the [Groq Console](https://console.groq.com/).
2.  **Sign Up**: Create an account using Google or email.
3.  **Generate the Key**:
    *   Navigate to **API Keys** in the left sidebar menu.
    *   Click the **Create API Key** button.
    *   Name the key (e.g., `CareerPilot-LocalDev`) and click **Generate**.
    *   Copy the generated key immediately (it starts with `gsk_`).
    *   Save this value as `GROQ_API_KEY`.

### B. Google Gemini API Key
1.  **Access AI Studio**: Visit [Google AI Studio](https://aistudio.google.com/).
2.  **Sign In**: Log in using a standard Google/Gmail account.
3.  **Generate the Key**:
    *   Click the blue **Get API Key** button in the top left header.
    *   Select **Create API Key**.
    *   Choose to create the key in a **new Cloud Project** or an existing one.
    *   Copy the generated alphanumeric key.
    *   Save this value as `GEMINI_API_KEY`.

---

## 3. Live Job Search APIs (Adzuna)
Adzuna powers live job searches, allowing CareerPilot to fetch actual real-time positions globally.

### Step-by-Step Instructions:
1.  **Register a Developer Account**: Visit [developer.adzuna.com](https://developer.adzuna.com/).
2.  **Sign Up**: Fill out the developer registration form to create a free account.
3.  **Retrieve Dashboard Credentials**:
    *   Once verified, log into the developer dashboard.
    *   In your API Account overview, locate:
        *   **Application ID**: (A short hex-based string, e.g., `92c8172c`) -> Save as `ADZUNA_APP_ID`.
        *   **API Key**: (A longer hex secret string) -> Save as `ADZUNA_API_KEY`.

---

## 4. Infrastructure Configurations (Postgres, Redis, Embeddings)
These define where the database, cache, and vector embedding servers reside.

### A. Docker Compose Quickstart (Default)
If you are running the project using **Docker Compose**, these values are already pre-configured to resolve inside the container network. You do not need to change them:
*   `POSTGRES_URL=postgresql://cpuser:cppass@db:5432/careerpilot`
*   `REDIS_URL=redis://redis:6379`
*   `EMBED_URL=http://embed:8001`

### B. Manual Local Run (Non-Docker)
If running services directly on your system, adjust the URLs to point to `localhost`:
*   `POSTGRES_URL=postgresql+asyncpg://cpuser:cppass@localhost:5432/careerpilot` (Requires local Postgres + pgvector running)
*   `REDIS_URL=redis://localhost:6379` (Requires Redis server running locally)
*   `EMBED_URL=http://localhost:8001` (Requires the local `embed` service running)

---

## 5. JWT Security Secret Token
The `JWT_SECRET` is used by the FastAPI backend to securely sign and verify user authentication tokens (cookies/headers).

### Step-by-Step Instructions:
To generate a secure, high-entropy 256-bit secret key, run one of the following commands in your terminal:

*   **Using Python (Recommended)**:
    ```bash
    python -m secrets
    ```
    Or:
    ```bash
    python -c "import secrets; print(secrets.token_hex(32))"
    ```
*   **Using OpenSSL**:
    ```bash
    openssl rand -hex 32
    ```

Copy the printed hexadecimal output (a 64-character string) and save it as `JWT_SECRET` (e.g. `JWT_SECRET=4f63c8a9f62...`).

---

## 6. Offline LLM Setup (Ollama)
Ollama runs lightweight large language models directly on your hardware, completely offline and free.

### Step-by-Step Instructions:
1.  **Download Ollama**: Visit [ollama.com](https://ollama.com) and download the appropriate package for Linux, macOS, or Windows.
2.  **Install & Start**: Install the package and ensure the Ollama background daemon is running.
3.  **Pull the Model**: In your terminal, run the following command to download the Llama 3.2 lightweight model:
    ```bash
    ollama pull llama3.2:latest
    ```
4.  **Configure `.env`**:
    *   **Offline URL**: Set `OLLAMA_URL=http://localhost:11434`
    *   **Offline Model Name**: Set `OLLAMA_MODEL=llama3.2:latest`
    
    *(Note: If running the CareerPilot backend inside Docker containers while Ollama runs directly on your host machine, set `OLLAMA_URL=http://host.docker.internal:11434` to allow the Docker container to communicate with the host)*
