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
    if Config.DEMO_MODE:
        print("[DEMO_MODE] Returning mock Gemini triage analysis.")
        return {
            "category": "Sanitation" if any(x in complaint_text.lower() for x in ["clean", "garbage", "trash", "waste"]) else "Water" if "water" in complaint_text.lower() else "Roads",
            "severity": 7 if "emergency" in complaint_text.lower() or "accident" in complaint_text.lower() else 4,
            "summary_en": f"Demo: {complaint_text[:60]}...",
            "summary_hi": f"मॉक: {complaint_text[:60]}...",
            "sentiment": "frustrated",
            "scheme_match": ["Swachh Bharat Mission" if any(x in complaint_text.lower() for x in ["clean", "garbage", "trash", "waste"]) else "Jal Jeevan Mission"],
            "estimated_affected": 30
        }

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
    if Config.DEMO_MODE:
        return {"category": "Other", "severity": 5, "summary_en": "Mock voice complaint processed in demo mode"}
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
    if Config.DEMO_MODE:
        return {"category": "Other", "severity": 5, "summary_en": "Mock image complaint processed in demo mode"}
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
    if Config.DEMO_MODE:
        print("[DEMO_MODE] Returning mock embedding vector.")
        return [0.1] * 768
    result = genai.embed_content(
        model="models/embedding-001",
        content=text,
        task_type="semantic_similarity"
    )
    return result["embedding"]  # 768 floats
