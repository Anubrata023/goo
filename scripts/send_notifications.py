import os
import firebase_admin
from firebase_admin import credentials, messaging
from dotenv import load_dotenv

load_dotenv()

def initialize_firebase():
    """Initializes Firebase Admin SDK using your service account credentials"""
    # If already initialized by another module, skip re-initialization
    if firebase_admin._apps:
        return
        
    cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "config/firebase_service_account.json")
    
    if not os.path.exists(cred_path):
        print(f"⚠️ Firebase service account file missing at {cred_path}. Running in mockup sandbox mode...")
        return False
        
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
    print("🔥 Firebase Admin SDK successfully initialized.")
    return True

def send_complaint_status_update(user_token, complaint_id, new_status, title_text="JanSaath Update"):
    """Sends a targeted push notification to a citizen's device regarding their complaint status"""
    message_body = f"Your complaint #{complaint_id} status has been updated to '{new_status}'."
    
    # Sandbox/Demo Fallback: If no real client tokens are registered yet, log it to the console
    if not user_token or user_token == "mock_token_123":
        print(f"📡 [Notification Sandbox] Sending Push to token 'mock_token_123' -> Title: {title_text} | Body: {message_body}")
        return "sandbox_success_id"

    try:
        message = messaging.Message(
            notification=messaging.Notification(
                title=title_text,
                body=message_body,
            ),
            data={
                "complaint_id": str(complaint_id),
                "status": str(new_status)
            },
            token=user_token,
        )
        response = messaging.send(message)
        print(f"✅ Successfully sent cloud notification message: {response}")
        return response
    except Exception as e:
        print(f"❌ Failed to dispatch Firebase notification: {e}")
        return None

if __name__ == "__main__":
    # Test our notifications in sandbox mode
    initialize_firebase()
    send_complaint_status_update(
        user_token="mock_token_123", 
        complaint_id=1086, 
        new_status="In Progress",
        title_text="Lucknow Civic Alert"
    )