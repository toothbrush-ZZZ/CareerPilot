from typing import List, Dict
import random

MOCK_JOBS = [
    {
        "role": "Senior Software Engineer (Full Stack)",
        "company": "TechVision AI",
        "salary_range": "$120k - $160k",
        "deadline": "2026-06-30",
        "location": "Remote",
        "job_url": "https://example.com/jobs/1",
        "job_type": "remote",
        "source": "Mock System",
        "description": "We are looking for a Senior Full Stack Engineer to lead our AI-driven analytics platform. Requirements: React, Node.js, Python, and PostgreSQL."
    },
    {
        "role": "Product Manager",
        "company": "Innovately",
        "salary_range": "Competitive",
        "deadline": "2026-07-15",
        "location": "New York, NY",
        "job_url": "https://example.com/jobs/2",
        "job_type": "hybrid",
        "source": "Mock System",
        "description": "Join our growth team as a Product Manager. You will define the roadmap for our consumer-facing career tools."
    },
    {
        "role": "Data Scientist",
        "company": "DataNexus",
        "salary_range": "$110k - $140k",
        "deadline": "2026-06-25",
        "location": "San Francisco, CA",
        "job_url": "https://example.com/jobs/3",
        "job_type": "onsite",
        "source": "Mock System",
        "description": "Apply machine learning to solve complex career optimization problems. Requirements: PyTorch, Scikit-learn, and 3+ years experience."
    },
    {
        "role": "Frontend Developer (React)",
        "company": "CreativePulse",
        "salary_range": "$90k - $120k",
        "deadline": "2026-07-05",
        "location": "Austin, TX",
        "job_url": "https://example.com/jobs/4",
        "job_type": "remote",
        "source": "Mock System",
        "description": "Help us build beautiful user interfaces for the next generation of career assistants."
    }
]

class MockJobClient:
    async def search(self, query: str, location: str = "") -> List[Dict]:
        """Provides mock job data based on keywords."""
        query_lower = query.lower()
        results = []
        
        for job in MOCK_JOBS:
            if query_lower in job["role"].lower() or query_lower in job["description"].lower():
                results.append(job)
        
        # If no specific match, return a random selection
        if not results:
            results = random.sample(MOCK_JOBS, min(3, len(MOCK_JOBS)))
            
        return results
