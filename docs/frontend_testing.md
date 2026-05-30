# Frontend Testing Manual

This document describes how to set up and execute frontend tests for the **CareerPilot** application. It covers two primary testing strategies:

1. **Component & Unit Tests** – using **Vitest** (the Vite‑powered test runner).
2. **End‑to‑End (E2E) Tests** – using **Playwright**.

Additionally, we provide a quick guide to run the offline scoring validation script (`test_scoring.py`) to ensure backend logic stays in sync with the UI.

---

## Table of Contents
- [Prerequisites](#prerequisites)
- [Running Unit & Component Tests (Vitest)](#running-unit--component-tests-vitest)
- [Running End‑to‑End Tests (Playwright)](#running-end‑to‑end-tests-playwright)
- [Offline Scoring Validation](#offline-scoring-validation)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites
- **Node.js** (v18 or later) – ensure `node` and `npm` are in your `$PATH`.
- **pnpm** (recommended) or **npm**/`yarn` – the project uses `pnpm` for faster installs.
- **Python 3.11+** – for running the backend scoring tests.
- **Git** – to fetch the repository.

### Installing Node & pnpm
```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Install pnpm globally
npm i -g pnpm
```

---

## Running Unit & Component Tests (Vitest)
The project ships with **Vitest** configuration out‑of‑the‑box (`vite.config.ts` includes the test config).

### 1. Install dependencies
```bash
cd $(git rev-parse --show-toplevel)  # Ensure you are at the repo root
pnpm install
```

### 2. Run the test suite
```bash
pnpm test   # Alias for "vitest run"
```

- Tests are located under `frontend/src/**/*.test.{ts,tsx}`.
- Coverage report is generated in `frontend/coverage` when you run `pnpm test --coverage`.

### 3. Watching files (optional)
```bash
pnpm test:watch   # Runs "vitest watch"
```

---

## Running End‑to‑End Tests (Playwright)
Playwright tests exercise the full UI in a headless Chromium browser.

### 1. Install Playwright browsers
```bash
pnpm exec playwright install
```

### 2. Execute the E2E suite
```bash
pnpm test:e2e   # Alias for "playwright test"
```

- Tests live in `frontend/e2e/**/*.spec.{ts,tsx}`.
- To run a single test file:
```bash
pnpm exec playwright test frontend/e2e/path/to/file.spec.ts
```

### 3. UI Mode (debugging)
```bash
pnpm exec playwright test --ui
```
This launches the Playwright Test UI where you can step through each test.

---

## Offline Scoring Validation
The backend includes a helper script (`test_scoring.py`) that validates the **FitScorer** logic against a set of synthetic job‑candidate pairs. This is useful for ensuring that UI‑driven scoring (displayed on Job Cards) matches the expected backend output.

### Run the script
```bash
# From the repository root
python ./backend/tests/test_scoring.py
```
The script prints a summary:
- Total cases evaluated
- Pass/Fail count
- Any mismatched scores with detailed diff

### Integrating with UI tests
You can call the script from a Vitest test using `child_process.exec` if you want to assert UI score values against the backend implementation.

---

## Troubleshooting
| Issue | Likely Cause | Fix |
|-------|--------------|-----|
| `pnpm: command not found` | pnpm not installed globally | Follow the *Installing Node & pnpm* steps above |
| Tests fail with `Cannot find module '@/...` | Vite alias not resolved in test config | Ensure `vitest` uses the same `vite.config.ts` – run `pnpm test` which loads the config automatically |
| Playwright cannot launch Chromium | Missing OS dependencies (e.g., libgbm) | Install the required packages for your distro (on Ubuntu: `sudo apt-get install libgbm-dev libasound2`) |
| `test_scoring.py` crashes on import | Environment variables not set (`OPENAI_API_KEY`) | Create a `.env` file at the repo root with required keys (see `ENVIRONMENT_KEYS_GUIDE.md`) |

---

## Keeping Documentation Up‑to‑Date
- When adding new UI components that affect scoring, add corresponding Vitest unit tests.
- If new backend scoring rules are introduced, update `test_scoring.py` and the related E2E assertions.
- Review this manual during sprint retrospectives to capture any tooling changes.

---

*Prepared by the Antigravity coding assistant.*
