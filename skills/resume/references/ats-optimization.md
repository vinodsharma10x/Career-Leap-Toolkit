# ATS Optimization Guide

Rules for making resumes pass Applicant Tracking Systems (ATS) used by most companies.

## What is ATS?

Applicant Tracking Systems (Greenhouse, Lever, Workday, iCIMS, etc.) parse resumes before a human ever sees them. If your resume isn't ATS-friendly, it may never reach a recruiter.

## Formatting Rules

### Do:
- Use standard section headings: "Experience", "Education", "Skills", "Projects", "Certifications"
- Use a single-column layout
- Use standard fonts (Times New Roman, Arial, Calibri, Helvetica)
- Use bullet points (- or •)
- Use reverse chronological order
- Include dates in a consistent, parseable format (Jan 2020, 2020-01, etc.)
- Save as PDF (most modern ATS handle PDF well) or DOCX (safest for older ATS)
- Put contact info at the top, not in headers/footers

### Don't:
- Use tables, text boxes, or columns (ATS often can't parse these)
- Use images, icons, or graphics (completely invisible to ATS)
- Use headers or footers for content (many ATS skip these)
- Use fancy fonts or special characters for bullets
- Use abbreviations without also spelling them out: "ML (Machine Learning)"
- Put important info only in a sidebar layout
- Use creative section names: "Where I've Made an Impact" instead of "Experience"

## Keyword Optimization

### How ATS Matching Works
1. ATS extracts text from your resume
2. Compares against the job description keywords
3. Ranks candidates by keyword match percentage
4. Many systems use exact string matching — "React.js" ≠ "ReactJS" ≠ "React"

### Keyword Strategy
- **Mirror the job description language exactly** — if the JD says "Kubernetes", don't write "K8s" (include both if space allows)
- **Include both acronyms and full terms:** "Amazon Web Services (AWS)"
- **Skills section is your keyword anchor** — ensure all required skills from the JD appear here
- **Sprinkle keywords naturally into bullet points** — don't just list them in Skills
- **Use the job title from the JD** in your summary if it matches your experience

### Common Keyword Categories for Tech
- Programming languages: Python, JavaScript, TypeScript, Java, Go, Rust, SQL
- Frameworks: React, Next.js, Angular, Vue.js, Django, FastAPI, Spring Boot
- Cloud: AWS, GCP, Azure (list specific services too)
- DevOps: Docker, Kubernetes, Terraform, CI/CD, GitHub Actions
- Databases: PostgreSQL, MySQL, MongoDB, Redis, DynamoDB
- Methodologies: Agile, Scrum, Kanban, TDD, CI/CD

### Common Keyword Categories for PMs
- Product management, product strategy, roadmap
- User research, usability testing, user interviews
- A/B testing, experimentation, data-driven
- Agile, Scrum, sprint planning
- Stakeholder management, cross-functional
- Analytics tools: Amplitude, Mixpanel, Google Analytics
- Design collaboration: Figma, user stories, PRDs

## File Format Recommendations

| Scenario | Best Format |
|----------|-------------|
| Applying through a company career portal | PDF (universal) |
| Older ATS system (Workday, Taleo) | DOCX (better parsing) |
| Sending directly to a recruiter | PDF (preserves formatting) |
| Uploading to LinkedIn | PDF |
| Copy-pasting into a text field | Plain text from Markdown |

## Section Heading Standards

Use these exact headings for maximum ATS compatibility:
- **Summary** or **Professional Summary** (not "About Me", "Profile")
- **Experience** or **Work Experience** (not "Career History", "Where I've Worked")
- **Education** (not "Academic Background")
- **Skills** or **Technical Skills** (not "What I Know", "Toolbox")
- **Projects** (not "Things I've Built")
- **Certifications** (not "Credentials")

## Testing Your Resume

After generating, the user can test ATS compatibility at:
- Jobscan.co (compare against a specific JD)
- Resume Worded (general ATS scoring)
- Simply copy-pasting the PDF text — if the plain text reads correctly and in order, ATS will parse it well
