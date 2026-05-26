from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    location_city: Optional[str] = None
    location_country: Optional[str] = None

class CVUploadResponse(BaseModel):
    chunks_stored: int
    sections: List[str]
    extracted_location: Optional[str]

class ChatMessage(BaseModel):
    role: str # user | assistant
    content: str

class ChatRequest(BaseModel):
    message: str
    session_id: str

class ChatResponse(BaseModel):
    response: str
    session_id: str
    history: List[ChatMessage]

class CoverLetterRequest(BaseModel):
    job_description: str
    company_name: str
    role_title: str
    user_name: str = "the applicant"

class CoverLetterResponse(BaseModel):
    letter_text: str
    word_count: int
    key_cv_points_used: List[str]
    tone: str = "professional"

class RefineRequest(BaseModel):
    existing_letter: str
    feedback: str
    job_description: str

class ApplicationCreate(BaseModel):
    job_title: str
    company: str
    location: Optional[str] = None
    job_url: Optional[str] = None
    status: str = "applied"
    notes: Optional[str] = None

class GoalCreate(BaseModel):
    text: str
    due_date: Optional[str] = None # YYYY-MM-DD
