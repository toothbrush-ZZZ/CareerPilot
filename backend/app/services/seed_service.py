import os
import shutil
import logging
from sqlalchemy import text
from datetime import date
from app.services import auth_service, cv_service

logger = logging.getLogger(__name__)

DEMO_USER_ID = "d3b07384-d113-4956-a5cc-9c60dfd2948b"
DEMO_EMAIL = "demo@careerpilot.ai"
DEMO_PASSWORD = "demopassword"
DEMO_NAME = "Devin Pilot (Demo)"

DEMO_CV_TEXT = """Devin Pilot (Demo)
Software Engineer | AI Specialist
Email: demo@careerpilot.ai | Web: www.example.com
Location: San Francisco, CA

SUMMARY
Senior software engineer with 5+ years of experience building scalable AI solutions and full-stack web applications. Passionate about Retrieval-Augmented Generation (RAG) and Agentic workflows.

EXPERIENCE
- Senior AI Engineer at TechFlow (2023 - Present)
  * Designed and built enterprise RAG pipelines reducing query latency by 40%.
  * Lead a team of 4 engineers to deploy multi-agent LLM systems for automated customer support.
  * Technologies used: Python, FastAPI, PostgreSQL, pgvector, PyTorch, Ollama.
- Software Developer at DevCorp (2021 - 2023)
  * Developed high-traffic web applications using React, Next.js, Node.js, and Redis.
  * Optimized SQL queries, improving database response times by 30%.

EDUCATION
- B.S. in Computer Science from Stanford University (2017 - 2021)
"""

async def seed_demo_data(db) -> bool:
    """
    Seeds/checks demo data.
    If the demo user does not exist, it creates it.
    If the demo user exists but has no data, it inserts sample data.
    Does NOT wipe existing data by default (unless called during a reset).
    """
    try:
        await db.execute(text("SET LOCAL row_security = off"))
        
        # Check if demo user exists
        result = await db.execute(
            text("SELECT id FROM profiles WHERE id = :uid"),
            {"uid": DEMO_USER_ID}
        )
        user_row = result.first()
        
        if not user_row:
            logger.info("Demo user does not exist, creating new profile.")
            hashed_pw = auth_service.hash_password(DEMO_PASSWORD)
            await db.execute(
                text("""
                    INSERT INTO profiles (id, email, password_hash, full_name, location_city, location_country)
                    VALUES (:uid, :email, :pw, :name, 'San Francisco', 'USA')
                """),
                {
                    "uid": DEMO_USER_ID,
                    "email": DEMO_EMAIL,
                    "pw": hashed_pw,
                    "name": DEMO_NAME
                }
            )
            
        # Seed CV chunks if none exist
        cv_count_res = await db.execute(
            text("SELECT COUNT(*) FROM cv_chunks WHERE user_id = :uid"),
            {"uid": DEMO_USER_ID}
        )
        if cv_count_res.scalar() == 0:
            logger.info("Seeding demo CV chunks...")
            try:
                await cv_service.process_and_store_cv(
                    DEMO_CV_TEXT.encode(),
                    "cv.txt",
                    DEMO_USER_ID,
                    db
                )
                
                user_dir = f"uploads/{DEMO_USER_ID}"
                os.makedirs(user_dir, exist_ok=True)
                with open(f"{user_dir}/cv.txt", "w") as f:
                    f.write(DEMO_CV_TEXT)
            except Exception as e:
                logger.error(f"Error seeding demo CV chunk embeddings: {e}")
                # Fallback to simple insert without calling embedding service if service is offline
                await db.execute(
                    text("""
                        INSERT INTO cv_chunks (user_id, section, content)
                        VALUES (:uid, 'Summary', :content)
                    """),
                    {"uid": DEMO_USER_ID, "content": "Senior software engineer with 5+ years of experience building scalable AI solutions."}
                )

        # Seed Applications if none exist
        app_count_res = await db.execute(
            text("SELECT COUNT(*) FROM applications WHERE user_id = :uid"),
            {"uid": DEMO_USER_ID}
        )
        if app_count_res.scalar() == 0:
            logger.info("Seeding demo applications...")
            sample_apps = [
                {
                    "job_title": "Senior AI Engineer",
                    "company": "OpenAI",
                    "location": "San Francisco, CA",
                    "job_url": "https://openai.com/careers",
                    "status": "interviewing",
                    "notes": "Recruiter call completed. Technical assessment scheduled next Wednesday."
                },
                {
                    "job_title": "Full Stack Engineer",
                    "company": "Vercel",
                    "location": "Remote, US",
                    "job_url": "https://vercel.com/careers",
                    "status": "applied",
                    "notes": "Applied via portal. Referral from former colleague."
                },
                {
                    "job_title": "Backend Developer",
                    "company": "Supabase",
                    "location": "Singapore",
                    "job_url": "https://supabase.com/careers",
                    "status": "offer",
                    "notes": "Received verbal offer. Negotiation phase."
                },
                {
                    "job_title": "AI Research Assistant",
                    "company": "Google DeepMind",
                    "location": "London, UK",
                    "job_url": "https://deepmind.google/careers",
                    "status": "rejected",
                    "notes": "Coding round was good but they decided to move forward with a candidate having a PhD."
                }
            ]
            for app in sample_apps:
                await db.execute(
                    text("""
                        INSERT INTO applications (user_id, job_title, company, location, job_url, status, notes)
                        VALUES (:uid, :job, :comp, :loc, :url, :status, :notes)
                    """),
                    {
                        "uid": DEMO_USER_ID,
                        "job": app["job_title"],
                        "comp": app["company"],
                        "loc": app["location"],
                        "url": app["job_url"],
                        "status": app["status"],
                        "notes": app["notes"]
                    }
                )

        # Seed Goals if none exist
        goals_count_res = await db.execute(
            text("SELECT COUNT(*) FROM goals WHERE user_id = :uid"),
            {"uid": DEMO_USER_ID}
        )
        if goals_count_res.scalar() == 0:
            logger.info("Seeding demo goals...")
            sample_goals = [
                {"text": "Solve 5 LeetCode medium questions every week", "due_date": date(2026, 6, 15), "completed": False},
                {"text": "Build a premium Next.js portfolio website", "due_date": date(2026, 6, 1), "completed": True},
                {"text": "Obtain the Google Professional Cloud Architect certification", "due_date": date(2026, 7, 30), "completed": False},
                {"text": "Connect with 5 Senior AI Engineers on LinkedIn", "due_date": date(2026, 5, 30), "completed": True}
            ]
            for goal in sample_goals:
                await db.execute(
                    text("""
                        INSERT INTO goals (user_id, text, due_date, completed)
                        VALUES (:uid, :text, :due, :completed)
                    """),
                    {
                        "uid": DEMO_USER_ID,
                        "text": goal["text"],
                        "due": goal["due_date"],
                        "completed": goal["completed"]
                    }
                )
            
        return True
    except Exception as e:
        logger.error(f"Error seeding demo data: {e}")
        return False

async def reset_demo_data(db) -> bool:
    """
    Clears all data associated with the stable demo account
    and re-seeds it back to a pristine state.
    """
    try:
        logger.info("Resetting demo data...")
        
        # Deleting profile (which will cascade to goals, cv_chunks, and applications)
        await db.execute(
            text("DELETE FROM profiles WHERE id = :uid"),
            {"uid": DEMO_USER_ID}
        )
        
        # Clean up files in uploads/
        user_dir = f"uploads/{DEMO_USER_ID}"
        if os.path.exists(user_dir):
            try:
                shutil.rmtree(user_dir)
            except Exception as file_err:
                logger.error(f"Error cleaning up demo upload directory: {file_err}")
            
        # Reseed everything!
        success = await seed_demo_data(db)
        return success
    except Exception as e:
        logger.error(f"Error resetting demo data: {e}")
        return False
