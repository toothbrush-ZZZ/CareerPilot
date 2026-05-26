import httpx
import asyncio

async def test_ollama():
    url = "http://localhost:11434/api/tags"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)
            print(f"Status: {response.status_code}")
            print(f"Body: {response.text[:200]}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_ollama())
