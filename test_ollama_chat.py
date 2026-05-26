import httpx
import asyncio

async def test_ollama_chat():
    url = "http://localhost:11434/api/chat"
    payload = {
        "model": "llama3.2:latest",
        "messages": [{"role": "user", "content": "Hello"}],
        "stream": False
    }
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, json=payload)
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                print(f"Response: {response.json()['message']['content']}")
            else:
                print(f"Error Body: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_ollama_chat())
