import asyncio
import httpx
import json

async def main():
    url = "https://api.bdjobs.com/Jobs/api/JobSearch/GetJobSearch"
    params = {"keyword": "Python", "pg": 1, "rpp": 50, "location": "14"}
    headers = {
        "Origin": "https://bdjobs.com",
        "Referer": "https://bdjobs.com/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site"
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(url, params=params, headers=headers)
        print(f"Status: {resp.status_code}")
        data = resp.json()
        print("Top-level keys:", list(data.keys()))
        for k, v in data.items():
            if isinstance(v, list):
                print(f"  '{k}' list has {len(v)} items")
                if v:
                    print(f"    First item keys: {list(v[0].keys()) if isinstance(v[0], dict) else v[0]}")
            else:
                print(f"  '{k}': {v}")

asyncio.run(main())
