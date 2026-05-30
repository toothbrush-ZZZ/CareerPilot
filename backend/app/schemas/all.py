from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import date

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
    last_search_results: Optional[List[Dict[str, Any]]] = None
    selected_job: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str
    history: List[ChatMessage]

class CoverLetterRequest(BaseModel):
    job_description: Optional[str] = None
    company_name: Optional[str] = None
    role_title: Optional[str] = None
    user_name: str = "the applicant"
    mode: Optional[str] = "paste"
    location: Optional[str] = None
    requirements: Optional[str] = None
    tone: Optional[str] = "formal"

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

class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    job_url: Optional[str] = None

class ApplicationOut(BaseModel):
    id: str
    job_title: str
    company: str
    location: Optional[str]
    job_url: Optional[str]
    status: str
    notes: Optional[str]
    applied_at: Any
    updated_at: Any

class GoalCreate(BaseModel):
    text: str
    due_date: Optional[date] = None

class GoalOut(BaseModel):
    id: str
    text: str
    due_date: Optional[str]
    completed: bool
    created_at: Any

class DashboardStats(BaseModel):
    total_applications: int
    this_week: int
    by_status: Dict[str, int]
    goals_completed: int
    goals_total: int
    nudges: List[str]
