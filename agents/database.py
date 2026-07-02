from supabase import create_client
from config import Config
import uuid
import json

# Initialize Supabase client
supabase = create_client(
    Config.SUPABASE_URL,
    Config.SUPABASE_SERVICE_KEY
)

def save_complaint_to_supabase(complaint_data: dict) -> dict:
    """
    Save a new complaint to Supabase.
    
    complaint_data should contain:
    - user_phone: str
    - raw_text: str
    - category: str
    - severity: int
    - summary_en: str
    - summary_hi: str
    - ward: str (ward name - will be mapped to ward_id)
    - lat: float
    - lng: float
    - embedding: list (768 floats)
    - priority_score: float
    """
    try:
        # First, get ward_id from ward name
        ward = complaint_data.get("ward", "Chinhat")
        ward_result = supabase.table("wards").select("id").eq("name", ward).execute()
        
        if not ward_result.data:
            print(f"⚠️ Ward '{ward}' not found in database. Using default.")
            ward_id = 1  # Default to first ward
        else:
            ward_id = ward_result.data[0]["id"]
        
        # Prepare data for insertion
        severity = complaint_data.get("severity")
        estimated_affected = complaint_data.get("estimated_affected")
        cost_estimate = complaint_data.get("cost_estimate")

        data = {
            "id": complaint_data.get("id", str(uuid.uuid4())),
            "user_phone": complaint_data.get("user_phone", "919800000000"),
            "ward_id": ward_id,
            "raw_text": complaint_data.get("raw_text", ""),
            "category": complaint_data.get("category"),
            "severity": int(severity) if severity is not None else None,
            "summary_en": complaint_data.get("summary_en"),
            "summary_hi": complaint_data.get("summary_hi"),
            "sentiment": complaint_data.get("sentiment"),
            "scheme_match": complaint_data.get("scheme_match", []),
            "estimated_affected": int(estimated_affected) if estimated_affected is not None else None,
            "priority_score": complaint_data.get("priority_score"),
            "geo_confidence": complaint_data.get("geo_confidence", 0.5),
            "cost_estimate": int(cost_estimate) if cost_estimate is not None else None,
            "lat": complaint_data.get("lat", 0.0),
            "lng": complaint_data.get("lng", 0.0),
            "status": "new"
        }
        
        # Add embedding if provided
        if complaint_data.get("embedding"):
            data["embedding"] = complaint_data["embedding"]
        
        # Insert into Supabase
        result = supabase.table("complaints").insert(data).execute()
        
        if result.data:
            print(f"✅ Complaint {data['id']} saved to Supabase")
            return result.data[0]
        else:
            print(f"❌ Failed to save complaint: {result}")
            return None
            
    except Exception as e:
        print(f"❌ Error saving to Supabase: {e}")
        return None

def find_duplicate_complaints(embedding: list, ward_name: str, threshold: float = 0.80) -> list:
    """
    Find duplicate complaints using pgvector similarity search.
    
    Args:
        embedding: 768-dim vector from Google AI Studio
        ward_name: Name of the ward (e.g., "Chinhat")
        threshold: Similarity threshold (0.80 = 80% similar)
    
    Returns:
        List of duplicate complaints with similarity scores
    """
    try:
        # Get ward_id from ward name
        ward_result = supabase.table("wards").select("id").eq("name", ward_name).execute()
        if not ward_result.data:
            print(f"⚠️ Ward '{ward_name}' not found")
            return []
        
        ward_id = ward_result.data[0]["id"]
        
        # Call the pgvector RPC function
        result = supabase.rpc(
            "match_complaints",
            {
                "query_embedding": embedding,
                "ward_id": ward_id,
                "match_threshold": threshold
            }
        ).execute()
        
        if result.data:
            print(f"🔍 Found {len(result.data)} duplicate complaints")
            return result.data
        else:
            print("✅ No duplicates found")
            return []
            
    except Exception as e:
        print(f"❌ Error finding duplicates: {e}")
        return []

def get_complaint_by_id(complaint_id: str) -> dict:
    """Get a complaint by its ID"""
    try:
        result = supabase.table("complaints").select("*").eq("id", complaint_id).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"❌ Error fetching complaint: {e}")
        return None

def update_complaint_status(complaint_id: str, new_status: str) -> dict:
    """Update the status of a complaint (used for Kanban board)"""
    try:
        result = supabase.table("complaints").update(
            {"status": new_status, "updated_at": "now()"}
        ).eq("id", complaint_id).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"❌ Error updating status: {e}")
        return None

def get_all_complaints(limit: int = 100) -> list:
    """Get all complaints sorted by priority"""
    try:
        result = supabase.table("complaints").select("*").order("priority_score", desc=True).limit(limit).execute()
        return result.data if result.data else []
    except Exception as e:
        print(f"❌ Error fetching complaints: {e}")
        return []
