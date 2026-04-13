"""
Resumetric — ML Microservice
FastAPI + spaCy + PDFMiner
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import spacy
import io
import re
from pdfminer.high_level import extract_text_to_fp
from pdfminer.layout import LAParams

app = FastAPI(title="Resumetric ML Service", version="1.0.0")

# Load spaCy model once at startup
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    raise RuntimeError(
        "spaCy model not found. Run: python -m spacy download en_core_web_sm"
    )

# Allow calls only from the Node backend (adjust in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000"],
    allow_methods=["POST"],
    allow_headers=["*"],
)


# ─── Helpers ───────────────────────────────────────────────────────────────────

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract plain text from a PDF byte stream using PDFMiner."""
    output = io.StringIO()
    with io.BytesIO(pdf_bytes) as pdf_file:
        extract_text_to_fp(pdf_file, output, laparams=LAParams())
    return output.getvalue()


def extract_keywords(text: str) -> set[str]:
    """
    Use spaCy to extract meaningful keywords:
    - Noun chunks (skills, tools, concepts)
    - Named entities (organisations, products, technologies)
    - Single-token nouns and proper nouns
    Returns a lowercase normalised set.
    """
    doc = nlp(text)
    keywords: set[str] = set()

    # Noun chunks
    for chunk in doc.noun_chunks:
        clean = chunk.text.strip().lower()
        if 2 < len(clean) < 60:
            keywords.add(clean)

    # Named entities
    for ent in doc.ents:
        clean = ent.text.strip().lower()
        if 2 < len(clean) < 60:
            keywords.add(clean)

    # Individual nouns / proper nouns
    for token in doc:
        if token.pos_ in ("NOUN", "PROPN") and not token.is_stop and token.is_alpha:
            keywords.add(token.lemma_.lower())

    return keywords


def clean_text(text: str) -> str:
    """Basic text cleanup — collapse whitespace, strip noise."""
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^\x20-\x7E]", " ", text)
    return text.strip()


# ─── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze")
async def analyze(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
):
    # ── Validate file ──────────────────────────────────────
    if resume.content_type not in ("application/pdf",):
        raise HTTPException(status_code=400, detail="Only PDF resumes are accepted.")

    pdf_bytes = await resume.read()
    if len(pdf_bytes) > 5 * 1024 * 1024:  # 5 MB limit
        raise HTTPException(status_code=400, detail="Resume file exceeds 5 MB limit.")

    # ── Validate job description ───────────────────────────
    job_description = job_description.strip()
    if not job_description or len(job_description) < 50:
        raise HTTPException(
            status_code=400,
            detail="Job description is too short (minimum 50 characters).",
        )
    if len(job_description) > 10_000:
        raise HTTPException(
            status_code=400, detail="Job description exceeds 10 000 character limit."
        )

    # ── Parse PDF ─────────────────────────────────────────
    try:
        resume_text = extract_text_from_pdf(pdf_bytes)
    except Exception:
        raise HTTPException(status_code=422, detail="Could not parse the PDF file.")

    if not resume_text.strip():
        raise HTTPException(
            status_code=422,
            detail="No readable text found in resume. Ensure it is not image-only.",
        )

    resume_text = clean_text(resume_text)
    job_description = clean_text(job_description)

    # ── Extract keywords ──────────────────────────────────
    resume_keywords = extract_keywords(resume_text)
    jd_keywords = extract_keywords(job_description)

    if not jd_keywords:
        raise HTTPException(
            status_code=422, detail="Could not extract keywords from job description."
        )

    # ── Calculate ATS score ───────────────────────────────
    matched = jd_keywords & resume_keywords
    missing = jd_keywords - resume_keywords
    score = round((len(matched) / len(jd_keywords)) * 100, 1)

    return {
        "ats_score": score,
        "matched_keywords": sorted(matched),
        "missing_keywords": sorted(missing),
        "resume_word_count": len(resume_text.split()),
        "jd_keyword_count": len(jd_keywords),
    }
