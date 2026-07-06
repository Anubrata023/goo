import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Gemini
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    
    # Supabase
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
    
    # Twilio
    TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
    TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
    TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
    
    # WhatsApp
    WHATSAPP_PHONE_ID = os.getenv("WHATSAPP_PHONE_ID")
    WHATSAPP_ACCESS_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN")
    
    # Demo Mode
    DEMO_MODE = os.getenv("DEMO_MODE", "True") == "True"
    
    @classmethod
    def validate(cls):
        """Check if all required keys are set"""
        required = ["GEMINI_API_KEY", "SUPABASE_URL", "SUPABASE_SERVICE_KEY"]
        missing = [key for key in required if not getattr(cls, key)]
        if missing:
            print(f"[WARNING] Missing environment variables: {missing}")
            return False
        print("[OK] All required keys are set!")
        return True
