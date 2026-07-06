"""
AGENT 1: INTAKE ORCHESTRATOR
Handles all Gemini interactions: text, voice, photo, embeddings.
"""

import json
import google.generativeai as genai
from config import Config

# Configure Gemini
genai.configure(api_key=Config.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")

# ============================================
# TRIAGE PROMPT - Same as Day 1
# ============================================
TRIAGE_PROMPT = """
You are a civic complaint analyst for an Indian MP's office.

Analyse this complaint and respond ONLY in JSON:

{
  "category": one of [Water, Roads, Electricity, Health, Education, Sanitation, Agriculture, Other],
  "severity": integer 1-10 (10 = most urgent),
  "summary_en": "one clear sentence in English",
  "summary_hi": "same sentence in Hindi",
  "sentiment": one of [urgent, frustrated, neutral, appreciative],
  "scheme_match": ["list of matching government schemes"],
  "estimated_affected": integer (number of people affected)
}

Complaint: {complaint_text}
"""

def triage_complaint(text: str) -> dict:
    """
    Analyze text complaint using Gemini.
    Returns: category, severity, summary_en, summary_hi, etc.
    """
    prompt = TRIAGE_PROMPT.replace("{complaint_text}", text)
    response = model.generate_content(prompt)
    
    # Clean response (remove markdown)
    raw = response.text.strip()
    if raw.startswith("```json"):
        raw = raw[7:]
    if raw.endswith("```"):
        raw = raw[:-3]
    
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Fallback if Gemini returns invalid JSON
        return {
            "category": "Other",
            "severity": 5,
            "summary_en": text[:100],
            "summary_hi": text[:100],
            "sentiment": "neutral",
            "scheme_match": [],
            "estimated_affected": 10
        }

def get_embedding(text: str) -> list:
    """
    Get embedding vector (768 dimensions) using Google's free embedding-001 model.
    Used for duplicate detection.
    """
    result = genai.embed_content(
        model="models/embedding-001",
        content=text,
        task_type="semantic_similarity"
    )
    return result["embedding"]  # 768 floats

def process_voice_complaint(audio_path: str) -> dict:
    """
    Process voice complaint: send audio to Gemini, get transcription + triage.
    Gemini does transcription AND analysis in ONE FREE CALL.
    """
    audio = genai.upload_file(audio_path)
    response = model.generate_content([
        audio,
        "Listen to this complaint in any Indian language. Transcribe it, "
        "translate to English, and respond in the TRIAGE_PROMPT JSON format."
    ])
    raw = response.text.strip()
    if raw.startswith("```json"):
        raw = raw[7:]
    if raw.endswith("```"):
        raw = raw[:-3]
    try:
        return json.loads(raw)
    except:
        return {
            "category": "Other",
            "severity": 5,
            "summary_en": "Voice complaint received",
            "summary_hi": "आवाज शिकायत प्राप्त हुई",
            "sentiment": "neutral",
            "scheme_match": [],
            "estimated_affected": 10
        }

def process_photo_complaint(image_path: str) -> dict:
    """
    Process photo complaint: send image to Gemini, get description + triage.
    Gemini does vision analysis AND triage in ONE FREE CALL.
    """
    import PIL.Image
    image = PIL.Image.open(image_path)
    response = model.generate_content([
        image,
        "Describe this as a civic infrastructure complaint. "
        "What is the problem? What type of infrastructure? "
        "Respond in the TRIAGE_PROMPT JSON format with category, severity, summary_en, summary_hi."
    ])
    raw = response.text.strip()
    if raw.startswith("```json"):
        raw = raw[7:]
    if raw.endswith("```"):
        raw = raw[:-3]
    try:
        return json.loads(raw)
    except:
        return {
            "category": "Other",
            "severity": 5,
            "summary_en": "Photo complaint received",
            "summary_hi": "फोटो शिकायत प्राप्त हुई",
            "sentiment": "neutral",
            "scheme_match": [],
            "estimated_affected": 10
        }
