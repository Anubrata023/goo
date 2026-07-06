from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import uuid
import json
import tempfile
import shutil

from config import Config
from agents.graph import create_graph, ComplaintState
from agents.intake import process_voice_complaint, process_photo_complaint
from models.database import save_complaint, get_all_complaints, update_status, get_complaint_by_id
from agents.drafting import draft_consolidated_project

app = FastAPI(title="JanSaath API v3.0", version="3.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# DATA MODELS
# ============================================
class ComplaintSubmit(BaseModel):
    text: str
    ward: str = "Chinhat"
    phone: str = "919800000000"

class StatusUpdate(BaseModel):
    status: str

class ComplaintResponse(BaseModel):
    status: str
    complaint_id: str
    is_duplicate: bool = False
    analysis: dict

class SMSWebhook(BaseModel):
    sender: str
    message: str

# ============================================
# Root & Health Check
# ============================================
@app.get("/")
def read_root():
    return {"message": "Welcome to JanSaath API v3.0! Visit /docs for the API documentation."}

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "JanSaath Backend v3.0",
        "demo_mode": Config.DEMO_MODE,
        "gemini_configured": bool(Config.GEMINI_API_KEY),
        "supabase_configured": bool(Config.SUPABASE_URL),
        "gcp_configured": bool(os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))
    }

# ============================================
# MAIN SUBMIT ENDPOINT - Uses LangGraph
# ============================================
@app.post("/api/complaints/submit", response_model=ComplaintResponse)
async def submit_complaint(complaint: ComplaintSubmit):
    """
    Submit a complaint - runs through all 5 LangGraph agents:
    1. Intake: Gemini triage
    2. Geospatial: Duplicate detection
    3. Fiscal: Cost estimation
    4. Demographics: BigQuery Integration
    5. Priority: Score calculation
    """
    try:
        print("\n" + "="*50)
        print("📝 NEW COMPLAINT SUBMITTED")
        print("="*50)
        
        # Step 1: Initialize state
        state = ComplaintState(
            raw_input=complaint.text,
            ward=complaint.ward,
            phone=complaint.phone
        )
        
        # Step 2: Run through LangGraph pipeline
        graph = create_graph()
        result = graph.invoke(state)
        
        print("\n📊 Final Analysis:")
        print(f"   Category: {result.get('category')}")
        print(f"   Severity: {result.get('severity')}/10")
        print(f"   Priority: {result.get('priority_score')}/100")
        print(f"   Cost: ₹{result.get('cost_estimate'):,}")
        print(f"   Duplicate: {result.get('is_duplicate')}")
        
        # Step 3: Generate complaint ID
        complaint_id = str(uuid.uuid4())[:8]
        
        # Step 4: Save to Supabase
        saved = save_complaint({
            "id": complaint_id,
            "phone": complaint.phone,
            "ward": complaint.ward,
            "text": complaint.text,
            "category": result.get("category"),
            "severity": result.get("severity"),
            "summary_en": result.get("summary_en"),
            "summary_hi": result.get("summary_hi"),
            "priority_score": result.get("priority_score"),
            "embedding": result.get("embedding"),
            "cost_estimate": result.get("cost_estimate"),
            "scheme_match": result.get("scheme_match"),
            "estimated_affected": result.get("estimated_affected")
        })
        
        if not saved:
            raise HTTPException(status_code=500, detail="Failed to save complaint")
        
        # Step 5: Return response
        return ComplaintResponse(
            status="received",
            complaint_id=complaint_id,
            is_duplicate=result.get("is_duplicate", False),
            analysis={
                "category": result.get("category"),
                "severity": result.get("severity"),
                "summary_en": result.get("summary_en"),
                "summary_hi": result.get("summary_hi"),
                "priority_score": result.get("priority_score"),
                "cost_estimate": result.get("cost_estimate"),
                "scheme_match": result.get("scheme_match"),
                "is_duplicate": result.get("is_duplicate", False)
            }
        )
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# GET ALL COMPLAINTS
# ============================================
@app.get("/api/complaints")
async def get_complaints():
    """Get all complaints sorted by priority (for admin dashboard)."""
    try:
        complaints = get_all_complaints(limit=100)
        return {"complaints": complaints, "count": len(complaints)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# GET SINGLE COMPLAINT
# ============================================
@app.get("/api/complaints/{complaint_id}")
async def get_complaint(complaint_id: str):
    """Get a single complaint by ID."""
    try:
        complaint = get_complaint_by_id(complaint_id)
        if not complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")
        return complaint
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# UPDATE STATUS (for Kanban board)
# ============================================
@app.patch("/api/complaints/{complaint_id}/status")
async def update_complaint_status(complaint_id: str, update: StatusUpdate):
    """Update complaint status (new → under_review → funds_allocated → resolved)."""
    try:
        result = update_status(complaint_id, update.status)
        if not result:
            raise HTTPException(status_code=404, detail="Complaint not found")
        return {"status": "updated", "complaint": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# PROJECT CONSOLIDATION ENDPOINT (HACKATHON)
# ============================================
@app.get("/api/projects/recommendations")
async def get_project_recommendations(ward: str = "Chinhat"):
    """
    Consolidates complaints in a ward and generates a master project proposal using Gemini.
    """
    try:
        all_complaints = get_all_complaints(limit=50)
        # Mock filtering by ward if ward_id is not exactly mapped in demo
        ward_complaints = [c for c in all_complaints if c.get("ward_id") == 1 or True][:10] 
        
        if not ward_complaints:
            return {"message": "No complaints found to consolidate."}
            
        proposal_markdown = draft_consolidated_project(ward, ward_complaints)
        
        return {
            "ward": ward,
            "complaints_analyzed": len(ward_complaints),
            "proposal_markdown": proposal_markdown
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# GOOGLE MAPS HOTSPOT ENDPOINT (GeoJSON)
# ============================================
@app.get("/api/maps/hotspots")
async def get_map_hotspots():
    """
    Returns complaint data formatted as GeoJSON for Google Maps Platform HeatmapLayer.
    """
    try:
        complaints = get_all_complaints(limit=100)
        
        features = []
        for c in complaints:
            import random
            lat = c.get("lat") or (26.8467 + random.uniform(-0.05, 0.05))
            lng = c.get("lng") or (80.9462 + random.uniform(-0.05, 0.05))
            
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [lng, lat] # GeoJSON uses [longitude, latitude]
                },
                "properties": {
                    "id": c.get("id"),
                    "category": c.get("category"),
                    "severity": c.get("severity"),
                    "weight": c.get("priority_score", 50) / 10
                }
            }
            features.append(feature)
            
        return {
            "type": "FeatureCollection",
            "features": features
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# SMS GATEWAY WEBHOOK (Low-Connectivity Fallback)
# ============================================
@app.post("/api/complaints/sms")
async def submit_sms(sms: SMSWebhook):
    """
    Simulated SMS gateway for low-connectivity citizens.
    Processes text through the same LangGraph pipeline.
    """
    try:
        print(f"\n📱 SMS RECEIVED from {sms.sender}: {sms.message}")
        
        complaint = ComplaintSubmit(
            text=f"[SMS] {sms.message}",
            phone=sms.sender,
            ward="Unknown"
        )
        
        response = await submit_complaint(complaint)
        
        return {
            "status": "sms_processed",
            "reply": f"Your complaint ID is {response.complaint_id}. Priority: {response.analysis.get('priority_score')}/100"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# AUDIO AND PHOTO ENDPOINTS
# ============================================
@app.post("/api/complaints/voice")
async def submit_voice(file: UploadFile = File(...), ward: str = Form("Chinhat")):
    """Submit a voice complaint - Gemini transcribes AND triages."""
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name
    
    try:
        result = process_voice_complaint(tmp_path)
        os.unlink(tmp_path)
        
        complaint_id = str(uuid.uuid4())[:8]
        saved = save_complaint({
            "id": complaint_id,
            "phone": "919800000000",
            "ward": ward,
            "text": result.get("summary_en", "Voice complaint"),
            "category": result.get("category"),
            "severity": result.get("severity"),
            "summary_en": result.get("summary_en"),
            "summary_hi": result.get("summary_hi"),
            "priority_score": result.get("priority_score", 50),
            "cost_estimate": result.get("cost_estimate", 45000),
            "scheme_match": result.get("scheme_match", [])
        })
        
        return {
            "status": "received",
            "complaint_id": complaint_id,
            "analysis": result
        }
    except Exception as e:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/complaints/photo")
async def submit_photo(file: UploadFile = File(...), ward: str = Form("Chinhat")):
    """Submit a photo complaint - Gemini analyzes vision."""
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name
    
    try:
        result = process_photo_complaint(tmp_path)
        os.unlink(tmp_path)
        
        complaint_id = str(uuid.uuid4())[:8]
        saved = save_complaint({
            "id": complaint_id,
            "phone": "919800000000",
            "ward": ward,
            "text": result.get("summary_en", "Photo complaint"),
            "category": result.get("category"),
            "severity": result.get("severity"),
            "summary_en": result.get("summary_en"),
            "summary_hi": result.get("summary_hi"),
            "priority_score": result.get("priority_score", 50),
            "cost_estimate": result.get("cost_estimate", 45000),
            "scheme_match": result.get("scheme_match", [])
        })
        
        return {
            "status": "received",
            "complaint_id": complaint_id,
            "analysis": result
        }
    except Exception as e:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
        raise HTTPException(status_code=500, detail=str(e))
