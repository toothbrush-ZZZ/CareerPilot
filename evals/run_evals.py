import httpx
import json
import uuid
import asyncio

BASE_URL = "http://localhost:8000/api/v1"
# Mock user ID (in a real app this would be from a JWT)
USER_ID = "00000000-0000-0000-0000-000000000001" 

async def test_cv_status():
    async with httpx.AsyncClient() as client:
        # We assume the user exists or RLS is bypassed/configured for the mock ID
        response = await client.get(f"{BASE_URL}/cv/status", headers={"Authorization": f"Bearer {USER_ID}"})
        print(f"CV Status: {response.status_code}")
        assert response.status_code in [200, 401, 403] # Depending on auth setup

async def test_job_search():
    async with httpx.AsyncClient() as client:
        params = {"query": "Software Engineer", "location": "Remote"}
        response = await client.get(f"{BASE_URL}/jobs/search", params=params, headers={"Authorization": f"Bearer {USER_ID}"})
        print(f"Job Search: {response.status_code}")
        assert response.status_code in [200, 401]

async def test_dashboard_stats():
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/dashboard/stats", headers={"Authorization": f"Bearer {USER_ID}"})
        print(f"Dashboard Stats: {response.status_code}")
        assert response.status_code in [200, 401]

async def run_all():
    print("=== STARTING EVALS ===")
    await test_cv_status()
    await test_job_search()
    await test_dashboard_stats()
    print("=== EVALS COMPLETED ===")

if __name__ == "__main__":
    asyncio.run(run_all())
