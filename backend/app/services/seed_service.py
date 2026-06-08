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

async def cleanup_user_data(db, user_id: str) -> None:
    """Clean up database tables, vector database collection, and uploaded files for a user ID."""
    for table in ["applications", "tasks", "goals", "skills", "roadmap_milestones"]:
        await db.execute(
            text(f"DELETE FROM {table} WHERE user_id = :uid"),
            {"uid": user_id}
        )
    await db.execute(
        text("DELETE FROM profiles WHERE id = :uid"),
        {"uid": user_id}
    )
    
    # Clean up ChromaDB collection
    from app.services.vector_store import delete_cv
    try:
        delete_cv(user_id)
    except Exception as cv_err:
        logger.warning(f"Error cleaning up CV collection for user {user_id}: {cv_err}")

    # Clean up upload directory
    user_dir = f"uploads/{user_id}"
    if os.path.exists(user_dir):
        try:
            shutil.rmtree(user_dir)
        except Exception as file_err:
            logger.warning(f"Error cleaning up upload directory for user {user_id}: {file_err}")

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
                await cleanup_user_data(db, existing_id)
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
            
            from datetime import timedelta
            eight_days_ago = datetime.utcnow() - timedelta(days=8)
            await db.execute(
                text("""
                    INSERT INTO applications (id, user_id, job_title, company, location, status, applied_at, updated_at)
                    VALUES 
                    (:id1, :uid, 'Software Engineer', 'Google', 'Mountain View', 'applied', :old_date, :old_date),
                    (:id2, :uid, 'Frontend Developer', 'Meta', 'Remote', 'interviewing', :old_date, :old_date)
                """),
                {"uid": DEMO_USER_ID, "id1": str(uuid.uuid4()), "id2": str(uuid.uuid4()), "old_date": eight_days_ago}
            )

            # Seed goals
            await db.execute(
                text("""
                    INSERT INTO goals (id, user_id, text, target, current, completed, created_at)
                    VALUES 
                    (:id1, :uid, 'Apply to 5 jobs', 5, 2, false, :now),
                    (:id2, :uid, 'Update portfolio', 1, 1, true, :now)
                """),
                {"uid": DEMO_USER_ID, "id1": str(uuid.uuid4()), "id2": str(uuid.uuid4()), "now": datetime.utcnow()}
            )

            # Seed CV
            from app.utils import text as text_utils
            from app.services.vector_store import store_cv_chunks
            chunks = text_utils.chunk_cv(DEMO_CV_TEXT)
            chunk_texts = [c["content"] for c in chunks]
            if chunk_texts:
                store_cv_chunks(DEMO_USER_ID, chunk_texts)

            await db.flush()

        await db.commit()
        return True

    except Exception as e:
        await db.rollback()
        logger.error(f"Error seeding demo data: {e}")
        return False

async def reset_demo_data(db) -> bool:
    try:
        logger.info("Resetting demo data...")
        await cleanup_user_data(db, DEMO_USER_ID)
        await db.commit()

        success = await seed_demo_data(db)
        return success
    except Exception as e:
        await db.rollback()
        logger.error(f"Error resetting demo data: {e}")
        return False

