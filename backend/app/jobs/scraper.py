import asyncio
from concurrent.futures import ThreadPoolExecutor
from typing import List
import pandas as pd

_executor = ThreadPoolExecutor(max_workers=2)


def _scrape_sync(query: str, location: str, limit: int) -> List[dict]:
    try:
        from jobspy import scrape_jobs
        
        df_local = scrape_jobs(
            site_name=["indeed", "linkedin", "glassdoor"],
            search_term=query,
            location=location,
            results_wanted=limit,
            is_remote=False
        )
        
        df_remote = scrape_jobs(
            site_name=["indeed", "linkedin", "glassdoor"],
            search_term=query,
            location=location,
            results_wanted=limit,
            is_remote=True
        )
        
        dfs = []
        if df_local is not None and not df_local.empty:
            dfs.append(df_local)
        if df_remote is not None and not df_remote.empty:
            dfs.append(df_remote)
            
        if not dfs:
            return []
            
        df = pd.concat(dfs).drop_duplicates(subset=['job_url'])
        if len(df) > limit:
            df = df.head(limit)
            
    except Exception as e:
        print(f"[scraper] jobspy error: {e}")
        return []

    results = []
    for i, row in df.iterrows():
        min_sal = row.get("min_amount")
        max_sal = row.get("max_amount")
        curr_val = row.get("currency")
        curr = str(curr_val).strip().upper() if pd.notna(curr_val) and curr_val else "USD"
        
        sym_map = {"USD": "$", "GBP": "£", "EUR": "€", "INR": "₹", "BDT": "৳", "CAD": "CA$", "AUD": "A$"}
        sym = sym_map.get(curr, f"{curr} ")
        
        salary = None
        if pd.notna(min_sal) and pd.notna(max_sal):
            salary = f"{sym}{int(min_sal):,} – {sym}{int(max_sal):,}"
        elif pd.notna(min_sal):
            salary = f"{sym}{int(min_sal):,}+"

        results.append({
            "id": str(i),
            "title": str(row.get("title") or ""),
            "company": str(row.get("company") or ""),
            "location": str(row.get("location") or ""),
            "salary": salary,
            "url": str(row.get("job_url") or ""),
            "description": str(row.get("description") or "")[:600],
            "date_posted": str(row.get("date_posted") or ""),
            "source": str(row.get("site") or ""),
        })

    return results


def parse_natural_lang_query(nl_query: str) -> dict:
    import json
    import os
    from groq import Groq
    
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return {"query": nl_query, "location": "Dhaka"}
    
    try:
        client = Groq(api_key=api_key)
        prompt = f"""You are a query parsing assistant. Extract the job search term/keywords and the location from the user's natural language request.
User request: "{nl_query}"

Respond ONLY with a JSON object in this format (no other text, no markdown block):
{{
  "query": "the refined job search keywords (e.g. 'ML Intern')",
  "location": "the extracted location or 'Dhaka' if not specified (e.g. 'San Francisco')"
}}"""
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
            response_format={"type": "json_object"}
        )
        data = json.loads(response.choices[0].message.content)
        return {
            "query": data.get("query", nl_query),
            "location": data.get("location", "Dhaka")
        }
    except Exception as e:
        print(f"[scraper] failed to parse natural query: {e}")
        return {"query": nl_query, "location": "Dhaka"}


async def search_jobs(query: str, location: str = "Dhaka", limit: int = 10) -> List[dict]:
    parsed = parse_natural_lang_query(query)
    refined_query = parsed["query"]
    extracted_location = parsed["location"]
    
    # If the user did not override the default location "Dhaka", use the extracted one
    loc = location if location != "Dhaka" else extracted_location
    
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_executor, _scrape_sync, refined_query, loc, limit)