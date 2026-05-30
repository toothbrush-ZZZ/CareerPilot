import PyPDF2
import docx
import io
import re
from typing import List, Dict, Optional, Any

EMAIL_REGEX = r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'
PHONE_REGEX = r'(\+?\d[\d\s\-]{7,}\d)'
MAX_CHUNK_SIZE = 800

SECTION_MAP = {
    "WORK EXPERIENCE": "EXPERIENCE",
    "EMPLOYMENT": "EXPERIENCE",
    "HISTORY": "EXPERIENCE",

    "TECHNICAL SKILLS": "SKILLS",
    "TECHNOLOGIES": "SKILLS",
    "COMPETENCIES": "SKILLS",

    "ABOUT ME": "SUMMARY",
    "ABOUT": "SUMMARY",
    "PROFILE": "SUMMARY",
    "OBJECTIVE": "SUMMARY",

    "PERSONAL PROJECTS": "PROJECTS",
    "PORTFOLIO": "PROJECTS"
}

def clean_text(text: str) -> str:
    text = re.sub(r'[•●▪■]', '-', text)

    text = re.sub(r'\n+', '\n', text)
    text = "\n".join([line.strip() for line in text.split('\n')])

    return text.strip()

def extract_text_from_pdf(file_bytes: bytes) -> str:
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))

    text = ""

    for page in pdf_reader.pages:
        page_text = page.extract_text() or ""
        text += page_text + "\n"

    return text

def extract_text_from_docx(file_bytes: bytes) -> str:
    doc = docx.Document(io.BytesIO(file_bytes))
    return "\n".join([para.text for para in doc.paragraphs])

def chunk_cv(text: str) -> List[Dict[str, Any]]:
    sections = [
        "EXPERIENCE", "WORK EXPERIENCE", "EMPLOYMENT", "HISTORY",
        "EDUCATION", "ACADEMIC", "STUDIES",
        "SKILLS", "TECHNICAL SKILLS", "TECHNOLOGIES", "COMPETENCIES",
        "PROJECTS", "PORTFOLIO", "PERSONAL PROJECTS",
        "SUMMARY", "OBJECTIVE", "ABOUT ME", "ABOUT", "PROFILE",
        "CERTIFICATIONS", "AWARDS", "ACHIEVEMENTS",
        "LANGUAGES", "INTERESTS", "SOFT SKILLS"
    ]

    header_pattern = re.compile(
        r'(?:^|\n)\s*(' +
        '|'.join(map(re.escape, sections)) +
        r')\s*[:\-|]?\s*(?=\n)',
        re.IGNORECASE
    )

    matches = list(header_pattern.finditer(text))

    if not matches:
        return [{
            "section": "OTHER",
            "content": text.strip(),
            "metadata": {
                "chunk_index": 0
            }
        }]

    chunks = []

    if matches[0].start() > 50:
        header_content = text[:matches[0].start()].strip()

        if header_content:
            chunks.append({
                "section": "HEADER",
                "content": header_content,
                "metadata": {
                    "chunk_index": 0
                }
            })

    for i in range(len(matches)):
        start_idx = matches[i].start()
        end_idx = matches[i + 1].start() if i + 1 < len(matches) else len(text)

        section_name = matches[i].group(1).upper()
        section_name = SECTION_MAP.get(section_name, section_name)

        content = text[matches[i].end():end_idx].strip()

        if len(content) <= 5:
            continue

        if len(content) > MAX_CHUNK_SIZE:

            split_contents = [
                content[i:i + MAX_CHUNK_SIZE]
                for i in range(0, len(content), MAX_CHUNK_SIZE)
            ]

            for idx, part in enumerate(split_contents):
                chunks.append({
                    "section": section_name,
                    "content": part.strip(),
                    "metadata": {
                        "chunk_index": idx
                    }
                })

            continue

        chunks.append({
            "section": section_name,
            "content": content,
            "metadata": {
                "chunk_index": 0
            }
        })

    return chunks


def extract_location_from_cv(text: str) -> Optional[str]:
    search_text = text[:2000]
    
    location_match = re.search(r'(?i)(?:location|address|city|residence|lives in|based in):\s*([A-Za-z0-9\s,.\-#]+)', search_text)
    if location_match:
        loc = location_match.group(1).split('\n')[0].strip()
        loc = re.sub(r'[|●•\-]+$', '', loc).strip()
        if len(loc) > 3:
            return loc
    
    geo_patterns = [
        r'([A-Z][a-z]+(?:[ \t][A-Z][a-z]+)*,[ \t]*[A-Z]{1}[a-zA-Z[ \t]]+(?:,[ \t]*[A-Z]{2,})?)', # City, State/Country
        r'([A-Z][a-z]+(?:[ \t][A-Z][a-z]+)*,[ \t]*\d{5}(?:-\d{4})?)', # City, Zip
    ]

    for pattern in geo_patterns:
        match = re.search(pattern, search_text)
            
        if match:
            return match.group(1).strip()
            
    common_cities = [
        "Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barisal", "Rangpur", "Mymensingh", 
        "Uttara", "Banani", "Gulshan", "Dhanmondi",
        "New York", "San Francisco", "London", "Berlin", "Austin", "Seattle", "Toronto", "Sydney"
    ]
    for city in common_cities:
        if city.lower() in search_text.lower():
            city_idx = search_text.lower().find(city.lower())
            tail = search_text[city_idx : city_idx + 60]
            # Try to capture the full line or comma-separated location
            extended_match = re.search(r'([A-Za-z0-9\s,.\-#]+)', tail)
            if extended_match:
                loc = extended_match.group(1).split('\n')[0].strip()
                return loc
            return city
            
    return None

def cv_builder_to_text(data: Dict) -> str:
    lines = []
    p = data.get("personal", {})
    lines.append(p.get("name", ""))
    contact_parts = [
    p.get("location"),
    p.get("email"),
    p.get("phone")
    ]
    lines.append(" | ".join(filter(None, contact_parts)))
    
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
        skills = data["skills"]
        if isinstance(skills, list):
            lines.append(", ".join(skills))
        else:
            lines.append(str(skills))
        
    if data.get("soft_skills"):
        lines.append("\nSOFT SKILLS")
        if isinstance(data["soft_skills"], list):
            lines.append(", ".join(data["soft_skills"]))
        else:
            lines.append(str(data["soft_skills"]))

    if data.get("projects"):
        lines.append("\nPROJECTS")
        for proj in data["projects"]:
            lines.append(f"{proj.get('name')}: {proj.get('description')}")
            
    if data.get("certifications"):
        lines.append("\nCERTIFICATIONS")
        if isinstance(data["certifications"], list):
            for cert in data["certifications"]:
                lines.append(f"- {cert}")
        else:
            lines.append(str(data["certifications"]))

    if data.get("languages"):
        lines.append("\nLANGUAGES")
        if isinstance(data["languages"], list):
            lines.append(", ".join(data["languages"]))
        else:
            lines.append(str(data["languages"]))
            
    return "\n".join(lines)
