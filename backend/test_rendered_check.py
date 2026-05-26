import asyncio
import httpx
from bs4 import BeautifulSoup

async def check_rendered():
    url = "https://bdjobs.com/h/jobs/?freetext=Python"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    }
    async with httpx.AsyncClient(headers=headers, follow_redirects=True, timeout=20.0) as client:
        print(f"Fetching {url}...")
        resp = await client.get(url)
        print(f"Status: {resp.status_code}")
        print(f"Content-type: {resp.headers.get('content-type')}")
        
        soup = BeautifulSoup(resp.text, 'html.parser')
        print(f"Title: {soup.title.string if soup.title else 'No title'}")
        
        # Check for card selector
        cards = soup.select("a.group")
        print(f"Found {len(cards)} 'a.group' elements (potential job cards)")
        
        if cards:
            first_card = cards[0]
            print("\nFirst card HTML snippet:")
            print(first_card.prettify()[:1500])
        else:
            print("No job cards found in raw HTML.")

if __name__ == "__main__":
    asyncio.run(check_rendered())
