from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import date, datetime


class ApplicationCreate(BaseModel):
    job_title: str
    company: str
    location: Optional[str] = None
    job_url: Optional[str] = None
    status: str = "applied"
    notes: Optional[str] = None
    interview_date: Optional[datetime] = None


class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    job_url: Optional[str] = None
    interview_date: Optional[datetime] = None


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
    interview_date: Optional[Any] = None


class GoalCreate(BaseModel):
    text: str
    due_date: Optional[date] = None


class GoalOut(BaseModel):
    id: str
    text: str
    due_date: Optional[str]
    completed: bool
    created_at: Any
