import os
import time
import httpx

BASE_URL = os.getenv("BACKEND_URL", "http://localhost:8000").rstrip("/") + "/api/v1"
TOKEN = os.getenv("AUTH_TOKEN", "")
HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

results = []


def check(name: str, passed: bool, detail: str = ""):
    status = "✅ PASS" if passed else "❌ FAIL"
    results.append((name, passed, detail))
    print(f"{status} — {name}")
    if detail:
        print(f"       {detail}")


def run_evals():
    client = httpx.Client(base_url=BASE_URL, headers=HEADERS, timeout=30)

    # --- TC1: Health check ---
    resp = httpx.get(BASE_URL.replace("/api/v1", "") + "/health", timeout=10)
    check("TC1: Backend health check", resp.status_code == 200, f"status={resp.status_code}")

    # --- TC2: Job search returns results ---
    try:
        resp = client.post("/jobs/search", json={"query": "software engineer", "location": "Dhaka", "limit": 5})
        data = resp.json()
        jobs = data.get("jobs", [])
        check("TC2: Job search returns results", len(jobs) > 0, f"Got {len(jobs)} jobs")
        if jobs:
            first = jobs[0]
            has_fields = all(k in first for k in ["title", "company", "url"])
            check("TC2: Job cards have required fields (title/company/url)", has_fields, str(list(first.keys())))
    except Exception as e:
        check("TC2: Job search returns results", False, str(e))

    # --- TC3: Fit score is programmatic ---
    try:
        resp = client.post("/jobs/compute-fit", json={
            "job_title": "ML Engineer",
            "company": "TechCorp",
            "job_description": "Requires Python, TensorFlow, MLOps, model deployment experience",
        })
        data = resp.json()
        has_score = isinstance(data.get("score"), int) and 0 <= data["score"] <= 100
        has_matched = isinstance(data.get("matched_skills"), list)
        has_reasoning = bool(data.get("reasoning"))
        check("TC3: Fit score is integer 0–100", has_score, f"score={data.get('score')}")
        check("TC3: Fit score has matched_skills list", has_matched, str(data.get("matched_skills", "MISSING")))
        check("TC3: Fit score has reasoning string", has_reasoning, data.get("reasoning", "MISSING")[:60])
    except Exception as e:
        check("TC3: Fit score computation", False, str(e))

    # --- TC4: Conversational memory ---
    try:
        session_id = f"eval-mem-{int(time.time())}"
        client.post("/assistant/chat", json={
            "message": "My name is Alex and I want to become a data engineer.",
            "session_id": session_id,
        })
        resp = client.post("/assistant/chat", json={
            "message": "What role did I say I was targeting?",
            "session_id": session_id,
        })
        reply = resp.json().get("reply", "").lower()
        remembers = "data engineer" in reply
        check("TC4: Assistant remembers previous message in session", remembers,
              f"Reply snippet: {reply[:120]}")
    except Exception as e:
        check("TC4: Conversational memory", False, str(e))

    # --- TC5: Cover letter with job context ---
    try:
        resp = client.post("/assistant/chat", json={
            "message": "Draft a cover letter for the Backend Engineer role at Stripe.",
            "session_id": f"eval-cl-{int(time.time())}",
            "job_title": "Backend Engineer",
            "job_description": "We need 3+ years backend experience, Python, distributed systems",
        })
        reply = resp.json().get("reply", "")
        is_cover_letter = any(phrase in reply.lower() for phrase in [
            "dear", "hiring manager", "i am", "i'm", "sincerely", "cover letter"
        ])
        check("TC5: Cover letter response is formatted letter", is_cover_letter,
              f"Reply snippet: {reply[:120]}")
    except Exception as e:
        check("TC5: Cover letter via assistant", False, str(e))

    # --- TC6: Kanban state transitions ---
    try:
        resp = client.post("/tracker/applications", json={
            "job_title": "Test Engineer",
            "company": "EvalCorp",
            "status": "applied",
        })
        app_id = resp.json().get("id")
        if app_id:
            client.patch(f"/tracker/applications/{app_id}", json={"status": "interviewing"})
            client.patch(f"/tracker/applications/{app_id}", json={"status": "offer"})
            resp = client.get("/tracker/applications")
            apps = resp.json()
            app = next((a for a in apps if a["id"] == app_id), None)
            check("TC6: Kanban transitions applied→interviewing→offer", app and app.get("status") == "offer",
                  f"Final status: {app.get('status') if app else 'not found'}")
            # Cleanup
            client.delete(f"/tracker/applications/{app_id}")
        else:
            check("TC6: Kanban transitions work", False, f"Create response: {resp.json()}")
    except Exception as e:
        check("TC6: Kanban state transitions", False, str(e))

    # --- TC7: AI nudge field present in dashboard stats ---
    try:
        resp = client.get("/dashboard/stats")
        data = resp.json()
        has_nudge_field = "nudge" in data
        check("TC7: Dashboard returns nudge field", has_nudge_field,
              f"Keys: {list(data.keys())}")
        has_stats = all(k in data for k in ["total_applications", "by_status", "goals_total"])
        check("TC7: Dashboard has all stat fields", has_stats,
              f"total_apps={data.get('total_applications')}, goals={data.get('goals_total')}")
    except Exception as e:
        check("TC7: Dashboard stats + nudge", False, str(e))

    # --- TC8: Skill gap analysis with job context ---
    try:
        resp = client.post("/assistant/chat", json={
            "message": "What skills am I missing for this role?",
            "session_id": f"eval-gap-{int(time.time())}",
            "job_title": "Backend Engineer",
            "job_description": "Requires Go, Kubernetes, gRPC, distributed systems experience",
        })
        reply = resp.json().get("reply", "").lower()
        mentions_gap = any(skill in reply for skill in ["go", "kubernetes", "grpc", "skill", "missing"])
        check("TC8: Skill gap analysis mentions missing skills", mentions_gap,
              f"Reply snippet: {reply[:120]}")
    except Exception as e:
        check("TC8: Skill gap analysis", False, str(e))

    # --- Summary ---
    print("\n" + "=" * 55)
    passed = sum(1 for _, p, _ in results if p)
    total = len(results)
    print(f"Results: {passed}/{total} passed")
    if passed == total:
        print("🎉 All checks passed!")
    else:
        failed = [name for name, p, _ in results if not p]
        print(f"⚠️  Failed: {failed}")


if __name__ == "__main__":
    if not TOKEN:
        print("ERROR: Set AUTH_TOKEN environment variable before running.")
        print("Example:")
        print('  export BACKEND_URL=http://localhost:8000')
        print('  TOKEN=$(curl -s -X POST $BACKEND_URL/api/v1/auth/login \\')
        print('    -H "Content-Type: application/json" \\')
        print('    -d \'{"email":"demo@careerpilot.ai","password":"demopassword"}\' \\')
        print('    | python3 -c "import sys,json; print(json.load(sys.stdin)[\'access_token\'])")')
        print('  export AUTH_TOKEN=$TOKEN')
        print('  python evals/run_evals.py')
        exit(1)
    run_evals()
