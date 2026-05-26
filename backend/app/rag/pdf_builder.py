from fpdf import FPDF
from typing import Dict, Any

class CVPDFBuilder(FPDF):
    def header(self):
        pass

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

    def generate(self, data: Dict[Any, Any], output_path: str) -> str:
        pdf = CVPDFBuilder()
        pdf.add_page()
        
        personal = data.get("personal", {})
        pdf.set_font('Helvetica', 'B', 18)
        pdf.cell(0, 10, personal.get("name", "Name Not Provided"), 0, 1, 'C')
        
        pdf.set_font('Helvetica', '', 10)
        contact_info = f"{personal.get('location', '')} | {personal.get('email', '')} | {personal.get('phone', '')}"
        pdf.cell(0, 10, contact_info, 0, 1, 'C')
        
        links = []
        if personal.get("linkedin"): links.append(f"LinkedIn: {personal['linkedin']}")
        if personal.get("github"): links.append(f"GitHub: {personal['github']}")
        if links:
            pdf.cell(0, 8, " | ".join(links), 0, 1, 'C')
            
        pdf.ln(5)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(5)
        
        if data.get("summary"):
            pdf.set_font('Helvetica', 'B', 12)
            pdf.cell(0, 10, "SUMMARY", 0, 1)
            pdf.set_font('Helvetica', '', 10)
            pdf.multi_cell(0, 5, data["summary"])
            pdf.ln(5)
            
        if data.get("experience"):
            pdf.set_font('Helvetica', 'B', 12)
            pdf.cell(0, 10, "EXPERIENCE", 0, 1)
            for exp in data["experience"]:
                pdf.set_font('Helvetica', 'B', 11)
                pdf.cell(0, 8, f"{exp.get('role')} at {exp.get('company')}", 0, 1)
                pdf.set_font('Helvetica', 'I', 10)
                pdf.cell(0, 6, f"{exp.get('start_date')} - {exp.get('end_date', 'Present')}", 0, 1)
                pdf.set_font('Helvetica', '', 10)
                pdf.multi_cell(0, 5, exp.get("description", ""))
                pdf.ln(2)
            pdf.ln(5)
            
        if data.get("education"):
            pdf.set_font('Helvetica', 'B', 12)
            pdf.cell(0, 10, "EDUCATION", 0, 1)
            for edu in data["education"]:
                pdf.set_font('Helvetica', 'B', 11)
                pdf.cell(0, 8, f"{edu.get('degree')} in {edu.get('field')}", 0, 1)
                pdf.set_font('Helvetica', '', 10)
                pdf.cell(0, 6, f"{edu.get('institution')} ({edu.get('start_year')} - {edu.get('end_year')})", 0, 1)
                if edu.get("gpa"):
                    pdf.cell(0, 6, f"GPA: {edu['gpa']}", 0, 1)
                pdf.ln(2)
            pdf.ln(5)
            
        if data.get("skills"):
            pdf.set_font('Helvetica', 'B', 12)
            pdf.cell(0, 10, "SKILLS", 0, 1)
            pdf.set_font('Helvetica', '', 10)
            pdf.multi_cell(0, 5, ", ".join(data["skills"]))
            pdf.ln(5)
            
        if data.get("projects"):
            pdf.set_font('Helvetica', 'B', 12)
            pdf.cell(0, 10, "PROJECTS", 0, 1)
            for proj in data["projects"]:
                pdf.set_font('Helvetica', 'B', 11)
                pdf.cell(0, 8, proj.get("name"), 0, 1)
                pdf.set_font('Helvetica', '', 10)
                pdf.multi_cell(0, 5, proj.get("description", ""))
                if proj.get("tech_stack"):
                    pdf.set_font('Helvetica', 'I', 9)
                    pdf.cell(0, 6, f"Tech: {', '.join(proj['tech_stack'])}", 0, 1)
                pdf.ln(2)
                
        pdf.output(output_path)
        return output_path
