import json
import google.generativeai as genai
from config import Config

# Configure Gemini (FREE via Google AI Studio)
genai.configure(api_key=Config.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")

# ============================================
# TRIAGE PROMPT - From v3.0 PDF Section 2
# ============================================
TRIAGE_PROMPT = """
You are a civic complaint analyst for an Indian MP's office.

Analyse this citizen complaint and respond ONLY in JSON:

{{
  "category": one of [Water, Roads, Electricity, Health, Education, Sanitation, Agriculture, Other],
  "severity": integer 1-10 (10 = life-safety emergency),
  "summary_en": "one clear sentence in English",
  "summary_hi": "same sentence in Hindi",
  "sentiment": one of [urgent, frustrated, neutral, appreciative],
  "scheme_match": ["list of matching government schemes"],
  "estimated_affected": integer (estimated number of people affected)
}}

Complaint: {complaint_text}
Ward: {ward_name}, District: {district}
"""

def triage_complaint(complaint_text: str, ward_name: str = "Chinhat") -> dict:
    """Call Gemini 2.0 Flash to analyze a complaint"""
    prompt = TRIAGE_PROMPT.format(
        complaint_text=complaint_text,
        ward_name=ward_name,
        district="Lucknow"
    )
    
    response = model.generate_content(prompt)
    
    # Clean markdown if present
    raw_text = response.text.strip()
    if raw_text.startswith("```json"):
        raw_text = raw_text[7:]
    if raw_text.endswith("```"):
        raw_text = raw_text[:-3]
    
    try:
        return json.loads(raw_text)
    except json.JSONDecodeError:
        # Fallback
        return {
            "category": "Other",
            "severity": 5,
            "summary_en": complaint_text[:100],
            "summary_hi": complaint_text[:100],
            "sentiment": "neutral",
            "scheme_match": [],
            "estimated_affected": 10
        }

def process_voice_complaint(audio_file_path: str) -> dict:
    """Send audio directly to Gemini for transcription + triage"""
    audio_file = genai.upload_file(audio_file_path)
    response = model.generate_content([
        audio_file,
        "Listen to this complaint in any Indian language. Transcribe it, "
        "translate to English, and respond in the TRIAGE_PROMPT JSON format."
    ])
    try:
        return json.loads(response.text)
    except:
        return {"category": "Other", "severity": 5, "summary_en": "Could not process audio"}

def process_photo_complaint(image_file_path: str) -> dict:
    """Send image directly to Gemini for description + triage"""
    image_file = genai.upload_file(image_file_path)
    response = model.generate_content([
        image_file,
        "Describe this image as a civic infrastructure complaint: what is "
        "broken, estimated severity 1-10, and likely category. Respond in JSON."
    ])
    try:
        return json.loads(response.text)
    except:
        return {"category": "Other", "severity": 5, "summary_en": "Could not process image"}

def get_embedding(text: str) -> list:
    """Get embedding vector (FREE via Google AI Studio)"""
    result = genai.embed_content(
        model="models/embedding-001",
        content=text,
        task_type="semantic_similarity"
    )
    return result["embedding"]  # 768 floats
