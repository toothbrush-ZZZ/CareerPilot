#!/usr/bin/env python3
"""End-to-end backend smoke test against http://localhost:8000."""
import json
import sys
import time
import uuid
from typing import Any, Optional

import httpx

BASE = "http://localhost:8000"
EMBED = "http://localhost:8001"
EMAIL = f"smoke_{uuid.uuid4().hex[:8]}@example.com"
PASSWORD = "TestPass123!"


class Runner:
    def __init__(self):
        self.client = httpx.Client(timeout=120.0)
        self.token: Optional[str] = None
        self.user_id: Optional[str] = None
        self.passed = 0
        self.failed = 0
        self.warnings = 0

    def ok(self, name: str, detail: str = ""):
        self.passed += 1
        print(f"  PASS  {name}" + (f" — {detail}" if detail else ""))

    def fail(self, name: str, detail: str):
        self.failed += 1
        print(f"  FAIL  {name} — {detail}")

    def warn(self, name: str, detail: str):
        self.warnings += 1
        print(f"  WARN  {name} — {detail}")

    def req(
        self,
        method: str,
        path: str,
        *,
        auth: bool = False,
        expected_status: int | tuple[int, ...] = 200,
        **kwargs,
    ) -> httpx.Response:
        headers = kwargs.pop("headers", {}) or {}
        if auth and self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        url = f"{BASE}{path}" if path.startswith("/") else f"{BASE}/{path}"
        return self.client.request(method, url, headers=headers, **kwargs)

    def check(
        self,
        name: str,
        method: str,
        path: str,
        *,
        auth: bool = False,
        expected_status: int | tuple[int, ...] = 200,
        validate=None,
        timeout: float | None = None,
        **kwargs,
    ) -> Any:
        try:
            if timeout:
                old = self.client.timeout
                self.client.timeout = timeout
            r = self.req(method, path, auth=auth, **kwargs)
            if timeout:
                self.client.timeout = old
        except Exception as e:
            self.fail(name, str(e))
            return None

        statuses = (
            (expected_status,)
            if isinstance(expected_status, int)
            else expected_status
        )
        if r.status_code not in statuses:
            body = r.text[:300]
            self.fail(name, f"HTTP {r.status_code} (expected {statuses}): {body}")
            return None

        try:
            data = r.json() if r.content else {}
        except json.JSONDecodeError:
            data = r.text

        if validate:
            err = validate(data)
            if err:
                self.fail(name, err)
                return None

        self.ok(name, f"HTTP {r.status_code}")
        return data


def main() -> int:
    r = Runner()
    print("CareerPilot Backend Smoke Test")
    print("=" * 50)

    # Layer 1 — health
    print("\n[Layer 1] Health")
    r.check("GET /", "GET", "/")
    r.check(
        "GET /health",
        "GET",
        "/health",
        validate=lambda d: None if d.get("status") == "ok" else "status not ok",
    )

    try:
        er = httpx.get(f"{EMBED}/health", timeout=10)
        if er.status_code == 200 and er.json().get("status") == "ok":
            r.ok("GET embed /health", er.json().get("model", ""))
        else:
            r.fail("GET embed /health", f"HTTP {er.status_code}")
    except Exception as e:
        r.fail("GET embed /health", str(e))

    # Layer 2 — auth
    print("\n[Layer 2] Auth")
    signup = r.check(
        "POST /auth/signup",
        "POST",
        "/api/v1/auth/signup",
        json={"email": EMAIL, "password": PASSWORD, "full_name": "Smoke Test"},
        expected_status=(200, 201),
        validate=lambda d: (
            None
            if d.get("access_token") and d.get("user_id")
            else "missing token or user_id"
        ),
    )
    if not signup:
        print("\nAborting: cannot authenticate.")
        return 1

    r.token = signup["access_token"]
    r.user_id = signup["user_id"]

    r.check(
        "POST /auth/login",
        "POST",
        "/api/v1/auth/login",
        json={"email": EMAIL, "password": PASSWORD},
        validate=lambda d: None if d.get("access_token") else "no token",
    )

    bad = r.client.get(
        f"{BASE}/api/v1/profile",
        headers={"Authorization": "Bearer invalid"},
    )
    if bad.status_code == 401:
        r.ok("Invalid token returns 401")
    else:
        r.fail("Invalid token", f"HTTP {bad.status_code}")

    # Layer 3 — features
    print("\n[Layer 3] Profile")
    r.check("GET /profile", "GET", "/api/v1/profile", auth=True)
    r.check(
        "POST /profile",
        "POST",
        "/api/v1/profile",
        auth=True,
        json={
            "full_name": "Smoke Test",
            "location_city": "Dhaka",
            "location_country": "Bangladesh",
        },
        validate=lambda d: None if d.get("status") == "success" else "unexpected body",
    )

    print("\n[Layer 3] CV")
    r.check(
        "GET /cv/status (empty)",
        "GET",
        "/api/v1/cv/status",
        auth=True,
        validate=lambda d: None if d.get("has_cv") is False else "expected has_cv=false",
    )

    cv_payload = {
        "personal": {
            "name": "Smoke Test",
            "location": "Dhaka, Bangladesh",
            "email": EMAIL,
            "phone": "+8801000000000",
        },
        "summary": "Backend engineer with Python and FastAPI experience building APIs.",
        "experience": [
            {
                "role": "Software Engineer",
                "company": "Test Corp",
                "start_date": "2022",
                "end_date": "Present",
                "description": "Built REST APIs with Python, FastAPI, and PostgreSQL for production systems.",
            }
        ],
        "education": [
            {
                "degree": "BSc",
                "field": "Computer Science",
                "institution": "Test University",
            }
        ],
        "skills": ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker"],
        "projects": [
            {
                "name": "CareerPilot",
                "description": "Job search assistant with RAG over CV data.",
            }
        ],
    }

    built = r.check(
        "POST /cv/build",
        "POST",
        "/api/v1/cv/build",
        auth=True,
        json=cv_payload,
        timeout=90.0,
        validate=lambda d: (
            None
            if d.get("chunks_stored", 0) > 0
            else f"no chunks stored: {d}"
        ),
    )

    if built:
        r.check(
            "GET /cv/status (with CV)",
            "GET",
            "/api/v1/cv/status",
            auth=True,
            validate=lambda d: (
                None
                if d.get("has_cv") and d.get("chunk_count", 0) > 0
                else f"unexpected: {d}"
            ),
        )

    print("\n[Layer 3] Jobs")
    r.check("GET /jobs/location", "GET", "/api/v1/jobs/location", auth=True)

    fit = r.check(
        "POST /jobs/manual-fit",
        "POST",
        "/api/v1/jobs/manual-fit",
        auth=True,
        json={
            "job_description": (
                "We need Python, FastAPI, PostgreSQL, Docker, 3+ years backend experience."
            )
        },
        timeout=90.0,
        validate=lambda d: (
            None
            if "fit_score" in d and "fit_percentage" in d
            else f"missing fit fields: {list(d.keys())}"
        ),
    )
    if fit:
        r.ok("manual-fit score", f"{fit.get('fit_percentage')}%")

    print("  ... job search (may take up to 60s)")
    t0 = time.time()
    jobs = r.check(
        "GET /jobs/search",
        "GET",
        "/api/v1/jobs/search",
        auth=True,
        params={"query": "python developer", "max_results": 3},
        timeout=90.0,
        validate=lambda d: (
            None if isinstance(d, list) else f"expected list, got {type(d).__name__}"
        ),
    )
    if jobs is not None:
        r.ok("jobs/search count", f"{len(jobs)} jobs in {time.time() - t0:.1f}s")

    print("\n[Layer 3] Tracker")
    r.check(
        "POST /tracker/applications",
        "POST",
        "/api/v1/tracker/applications",
        auth=True,
        json={
            "job_title": "Backend Engineer",
            "company": "Acme Corp",
            "status": "applied",
            "location": "Remote",
        },
        validate=lambda d: None if d.get("status") == "success" else str(d),
    )

    apps = r.check(
        "GET /tracker/applications",
        "GET",
        "/api/v1/tracker/applications",
        auth=True,
        validate=lambda d: None if isinstance(d, list) else "not a list",
    )

    app_id = None
    if apps and len(apps) > 0:
        app_id = str(apps[0].get("id"))
        r.check(
            "PATCH /tracker/applications/{id}",
            "PATCH",
            f"/api/v1/tracker/applications/{app_id}",
            auth=True,
            json={"status": "interviewing", "notes": "Smoke test"},
        )

    r.check(
        "POST /tracker/goals",
        "POST",
        "/api/v1/tracker/goals",
        auth=True,
        json={"text": "Apply to 5 jobs", "due_date": "2026-06-01"},
    )

    goals = r.check(
        "GET /tracker/goals",
        "GET",
        "/api/v1/tracker/goals",
        auth=True,
        validate=lambda d: None if isinstance(d, list) else "not a list",
    )

    if goals and len(goals) > 0:
        gid = str(goals[0].get("id"))
        r.check(
            "PATCH /tracker/goals/{id}/toggle",
            "PATCH",
            f"/api/v1/tracker/goals/{gid}/toggle",
            auth=True,
        )

    if app_id:
        r.check(
            "DELETE /tracker/applications/{id}",
            "DELETE",
            f"/api/v1/tracker/applications/{app_id}",
            auth=True,
        )

    print("\n[Layer 3] Dashboard")
    r.check(
        "GET /dashboard/stats",
        "GET",
        "/api/v1/dashboard/stats",
        auth=True,
        validate=lambda d: (
            None
            if "total_applications" in d and "nudges" in d
            else f"missing keys: {d}"
        ),
    )

    print("\n[Layer 3] Assistant")
    chat = r.check(
        "POST /assistant/chat",
        "POST",
        "/api/v1/assistant/chat",
        auth=True,
        json={"message": "What Python skills are on my CV?", "session_id": "smoke-session"},
        timeout=90.0,
        validate=lambda d: (
            None if d.get("response") and d.get("session_id") else f"bad response: {d}"
        ),
    )
    if chat and "trouble connecting" in (chat.get("response") or "").lower():
        r.warn("assistant/chat", "AI providers unavailable — infra OK, keys/Ollama needed")

    r.check(
        "DELETE /assistant/session",
        "DELETE",
        "/api/v1/assistant/session/smoke-session",
        auth=True,
    )

    print("\n[Layer 3] Cover letter")
    letter = r.check(
        "POST /cover-letter/generate",
        "POST",
        "/api/v1/cover-letter/generate",
        auth=True,
        json={
            "job_description": "Python backend role requiring FastAPI and PostgreSQL.",
            "company_name": "Acme",
            "role_title": "Backend Engineer",
            "user_name": "Smoke Test",
        },
        timeout=90.0,
        expected_status=(200, 503),
    )
    if letter and letter.get("letter_text"):
        if len(letter["letter_text"]) < 50:
            r.warn("cover-letter/generate", "letter very short — check AI keys")
        else:
            r.ok("cover-letter/generate", f"{len(letter['letter_text'])} chars")
    elif letter is not None:
        r.warn("cover-letter/generate", "AI unavailable (503) — configure API keys or Ollama")

    print("\n[Cleanup] DELETE /cv")
    r.check("DELETE /cv", "DELETE", "/api/v1/cv", auth=True)

    # Summary
    print("\n" + "=" * 50)
    print(f"Results: {r.passed} passed, {r.failed} failed, {r.warnings} warnings")
    print(f"Test user: {EMAIL}")
    return 1 if r.failed else 0


if __name__ == "__main__":
    sys.exit(main())
