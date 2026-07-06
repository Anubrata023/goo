import os
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

# Path to your service account key
SERVICE_ACCOUNT_FILE = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "./service-account-key.json")

def test_credentials():
    try:
        # Load credentials
        creds = Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE,
            scopes=["https://www.googleapis.com/auth/documents"]
        )
        print(f"✅ Credentials loaded successfully")
        print(f"   Client email: {creds.service_account_email}")
        
        # Build the Docs service
        service = build("docs", "v1", credentials=creds)
        
        # Try to create a document
        doc = service.documents().create(body={"title": "JanSaath - Test"}).execute()
        doc_id = doc["documentId"]
        print(f"✅ Document created successfully!")
        print(f"   Document ID: {doc_id}")
        print(f"   Link: https://docs.google.com/document/d/{doc_id}/edit")
        
        return True
        
    except Exception as e:
        print(f"❌ ERROR: {e}")
        print("\n--- Common Fixes ---")
        print("1. Check that 'Google Docs API' is enabled")
        print("2. Check that your service account has Editor role")
        print("3. Check the path in GOOGLE_APPLICATION_CREDENTIALS")
        return False

if __name__ == "__main__":
    test_credentials()