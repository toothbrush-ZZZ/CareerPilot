import os
import uuid
import shutil
import logging
from sqlalchemy import text
from datetime import date, datetime
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
    try:
        try:
            await db.execute(text("SET LOCAL row_security = off"))
        except Exception:
            pass

        # Check if any user with the demo email exists
        result = await db.execute(
            text("SELECT id FROM profiles WHERE email = :email"),
            {"email": DEMO_EMAIL}
        )
        email_row = result.first()
        if email_row:
            existing_id = email_row[0]
            if existing_id != DEMO_USER_ID:
                logger.info(f"Demo user exists with different ID {existing_id}. Deleting to re-seed...")
                await db.execute(
                    text("DELETE FROM profiles WHERE id = :uid"),
                    {"uid": existing_id}
                )
                await db.flush()

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
                    INSERT INTO profiles (id, email, password_hash, full_name, location_city, location_country, created_at)
                    VALUES (:uid, :email, :pw, :name, 'San Francisco', 'USA', :created_at)
                """),
                {
                    "uid": DEMO_USER_ID,
                    "email": DEMO_EMAIL,
                    "pw": hashed_pw,
                    "name": DEMO_NAME,
                    "created_at": datetime.utcnow()
                }
            )
            await db.flush()

        # Check if CV is stored in ChromaDB
        from app.services.vector_store import _collection
        try:
            cv_count = _collection(DEMO_USER_ID).count()
        except Exception:
            cv_count = 0

        if cv_count == 0:
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
                        INSERT INTO applications (id, user_id, job_title, company, location, job_url, status, notes, applied_at, updated_at)
                        VALUES (:id, :uid, :job, :comp, :loc, :url, :status, :notes, :applied_at, :updated_at)
                    """),
                    {
                        "id": str(uuid.uuid4()),
                        "uid": DEMO_USER_ID,
                        "job": app["job_title"],
                        "comp": app["company"],
                        "loc": app["location"],
                        "url": app["job_url"],
                        "status": app["status"],
                        "notes": app["notes"],
                        "applied_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow()
                    }
                )

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
                        INSERT INTO goals (id, user_id, text, due_date, completed, created_at)
                        VALUES (:id, :uid, :text, :due, :completed, :created_at)
                    """),
                    {
                        "id": str(uuid.uuid4()),
                        "uid": DEMO_USER_ID,
                        "text": goal["text"],
                        "due": goal["due_date"],
                        "completed": goal["completed"],
                        "created_at": datetime.utcnow()
                    }
                )

        await db.commit()
        return True

    except Exception as e:
        await db.rollback()
        logger.error(f"Error seeding demo data: {e}")
        return False

async def reset_demo_data(db) -> bool:
    try:
        logger.info("Resetting demo data...")

        await db.execute(
            text("DELETE FROM profiles WHERE id = :uid"),
            {"uid": DEMO_USER_ID}
        )
        await db.commit()

        # Clean up ChromaDB collection
        from app.services.vector_store import delete_cv
        try:
            delete_cv(DEMO_USER_ID)
        except Exception as cv_err:
            logger.error(f"Error cleaning up demo CV collection: {cv_err}")

        user_dir = f"uploads/{DEMO_USER_ID}"
        if os.path.exists(user_dir):
            try:
                shutil.rmtree(user_dir)
            except Exception as file_err:
                logger.error(f"Error cleaning up demo upload directory: {file_err}")

        success = await seed_demo_data(db)
        return success
    except Exception as e:
        await db.rollback()
        logger.error(f"Error resetting demo data: {e}")
        return False
