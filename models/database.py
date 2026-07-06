"""
Supabase database operations.
"""

from supabase import create_client
from config import Config
import uuid

# Initialize Supabase client
supabase = create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_KEY)

def get_ward_id(ward_name: str) -> int:
    """Get ward ID from ward name."""
    try:
        result = supabase.table("wards").select("id").eq("name", ward_name).execute()
        if result.data:
            return result.data[0]["id"]
        return None
    except:
        return None

def save_complaint(data: dict) -> dict:
    """
    Save a complaint to Supabase.
    
    Expected fields:
    - id: str (UUID)
    - phone: str
    - ward: str (ward name)
    - text: str (raw text)
    - category: str
    - severity: int
    - summary_en: str
    - summary_hi: str
    - priority_score: float
    - embedding: list (768 floats)
    - cost_estimate: int
    - scheme_match: list
    - estimated_affected: int
    """
    try:
        # Get ward_id
        ward_id = get_ward_id(data.get("ward", "Chinhat"))
        if not ward_id:
            # Fallback: get first ward
            result = supabase.table("wards").select("id").limit(1).execute()
            ward_id = result.data[0]["id"] if result.data else 1
        
        complaint_data = {
            "id": data.get("id", str(uuid.uuid4())[:8]),
            "user_phone": data.get("phone", "919800000000"),
            "ward_id": ward_id,
            "raw_text": data.get("text", ""),
            "category": data.get("category"),
            "severity": data.get("severity"),
            "summary_en": data.get("summary_en"),
            "summary_hi": data.get("summary_hi"),
            "priority_score": data.get("priority_score"),
            "embedding": data.get("embedding"),
            "cost_estimate": data.get("cost_estimate"),
            "scheme_match": data.get("scheme_match", []),
            "estimated_affected": data.get("estimated_affected"),
            "status": "new"
        }
        
        result = supabase.table("complaints").insert(complaint_data).execute()
        return result.data[0] if result.data else None
        
    except Exception as e:
        print(f"❌ Error saving complaint: {e}")
        return None

def find_duplicates(embedding: list, ward_name: str, threshold: float = 0.80) -> list:
    """
    Find duplicate complaints using pgvector similarity search.
    """
    try:
        ward_id = get_ward_id(ward_name)
        if not ward_id:
            return []
        
        result = supabase.rpc("match_complaints", {
            "query_embedding": embedding,
            "ward_id": ward_id,
            "match_threshold": threshold
        }).execute()
        
        return result.data if result.data else []
        
    except Exception as e:
        print(f"❌ Error finding duplicates: {e}")
        return []

def update_status(complaint_id: str, status: str) -> dict:
    """Update complaint status."""
    try:
        result = supabase.table("complaints").update(
            {"status": status}
        ).eq("id", complaint_id).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"❌ Error updating status: {e}")
        return None

def get_all_complaints(limit: int = 100) -> list:
    """Get all complaints sorted by priority."""
    try:
        result = supabase.table("complaints").select("*").order("priority_score", desc=True).limit(limit).execute()
        return result.data if result.data else []
    except Exception as e:
        print(f"❌ Error fetching complaints: {e}")
        return []

def get_complaint_by_id(complaint_id: str) -> dict:
    """Get a single complaint by ID."""
    try:
        result = supabase.table("complaints").select("*").eq("id", complaint_id).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"❌ Error fetching complaint: {e}")
        return None
