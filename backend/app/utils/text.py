import PyPDF2
import docx
import io
import re
import spacy
from typing import List, Dict, Optional

# Load spaCy for location NER
# Note: User needs to run 'python -m spacy download en_core_web_sm' in backend container
try:
    nlp = spacy.load("en_core_web_sm")
except:
    nlp = None

def clean_text(text: str) -> str:
    """Strip excessive whitespace and normalize newlines."""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF using PyPDF2."""
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() or ""
    return text

def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract text from DOCX using python-docx."""
    doc = docx.Document(io.BytesIO(file_bytes))
    return "\n".join([para.text for para in doc.paragraphs])

def chunk_cv(text: str) -> List[Dict[str, str]]:
    """
    Split CV text into semantic sections.
    Detects headers like EXPERIENCE, EDUCATION, etc.
    """
    sections = [
        "EXPERIENCE", "WORK EXPERIENCE", "EMPLOYMENT",
        "EDUCATION", "ACADEMIC",
        "SKILLS", "TECHNICAL SKILLS", "TECHNOLOGIES",
        "PROJECTS", "PORTFOLIO",
        "SUMMARY", "OBJECTIVE", "ABOUT",
        "CERTIFICATIONS", "AWARDS"
    ]
    
    header_pattern = re.compile(r'^(' + '|'.join(sections) + r')\b', re.IGNORECASE | re.MULTILINE)
    
    matches = list(header_pattern.finditer(text))
    
    if not matches:
        return [{"section": "other", "content": text}]
    
    chunks = []
    for i in range(len(matches)):
        start_idx = matches[i].start()
        end_idx = matches[i+1].start() if i+1 < len(matches) else len(text)
        
        section_name = matches[i].group(1).upper()
        content = text[matches[i].end():end_idx].strip()
        
        if len(content) > 20:
            chunks.append({
                "section": section_name,
                "content": content
            })
            
    return chunks

def extract_location_from_cv(text: str) -> Optional[str]:
    ... # Already implemented above

def cv_builder_to_text(data: Dict) -> str:
    """Convert structured CV data to plain text for chunking."""
    lines = []
    p = data.get("personal", {})
    lines.append(p.get("name", ""))
    lines.append(f"{p.get('location', '')} | {p.get('email', '')} | {p.get('phone', '')}")
    
    if data.get("summary"):
        lines.append("\nSUMMARY")
        lines.append(data["summary"])
        
    if data.get("experience"):
        lines.append("\nEXPERIENCE")
        for exp in data["experience"]:
            lines.append(f"{exp.get('role')} at {exp.get('company')} ({exp.get('start_date')} - {exp.get('end_date')})")
            lines.append(exp.get("description", ""))
            
    if data.get("education"):
        lines.append("\nEDUCATION")
        for edu in data["education"]:
            lines.append(f"{edu.get('degree')} in {edu.get('field')} - {edu.get('institution')}")
            
    if data.get("skills"):
        lines.append("\nSKILLS")
        lines.append(", ".join(data["skills"]))
        
    if data.get("projects"):
        lines.append("\nPROJECTS")
        for proj in data["projects"]:
            lines.append(f"{proj.get('name')}: {proj.get('description')}")
            
    return "\n".join(lines)
