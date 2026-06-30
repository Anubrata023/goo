from supabase import create_client
from config import Config

# Initialize Supabase (FREE)
supabase = None
if Config.SUPABASE_URL and Config.SUPABASE_KEY:
    supabase = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)

def save_complaint_to_supabase(complaint_data: dict) -> dict:
    """Save a complaint to Supabase"""
    if Config.DEMO_MODE:
        print("[DEMO_MODE] Simulating database save.")
        return complaint_data
    if not supabase:
        print("⚠️ Supabase client not initialized (missing credentials). Skipping database save.")
        return {}
    data = {
        "id": complaint_data.get("id"),
        "user_phone": complaint_data.get("user_phone"),
        "ward": complaint_data.get("ward"),
        "raw_text": complaint_data.get("raw_text"),
        "category": complaint_data.get("category"),
        "severity": complaint_data.get("severity"),
        "summary_en": complaint_data.get("summary_en"),
        "summary_hi": complaint_data.get("summary_hi"),
        "priority_score": complaint_data.get("priority_score"),
        "lat": complaint_data.get("lat", 0.0),
        "lng": complaint_data.get("lng", 0.0)
    }
    result = supabase.table("complaints").insert(data).execute()
    return result.data[0] if result.data else {}

def find_duplicate_complaints(embedding: list, ward_id: int, threshold: float = 0.80):
    """Find duplicate complaints using pgvector"""
    if Config.DEMO_MODE:
        print("[DEMO_MODE] Simulating duplicate check. Returning empty list.")
        return []
    if not supabase:
        print("⚠️ Supabase client not initialized (missing credentials). Skipping duplicate check.")
        return []
    result = supabase.rpc(
        "match_complaints",
        {
            "query_embedding": embedding,
            "ward_id": ward_id,
            "match_threshold": threshold
        }
    ).execute()
    return result.data if result.data else []
