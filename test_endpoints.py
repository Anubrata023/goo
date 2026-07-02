import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    print("🔍 Testing /api/health...")
    try:
        r = requests.get(f"{BASE_URL}/api/health")
        print(f"   Status: {r.status_code}")
        print(f"   Response: {r.json()}")
        return r.status_code == 200
    except requests.exceptions.ConnectionError:
        return False

def test_submit():
    print("\n🔍 Testing /api/complaints/submit...")
    data = {"text": "Handpump broken in Chinhat for 3 weeks", "ward": "Chinhat"}
    r = requests.post(f"{BASE_URL}/api/complaints/submit", json=data)
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        result = r.json()
        print(f"   ID: {result.get('complaint_id')}")
        print(f"   Category: {result.get('analysis', {}).get('category')}")
        print(f"   Priority: {result.get('analysis', {}).get('priority_score')}")
        return result.get("complaint_id")
    return None

def test_get_complaints():
    print("\n🔍 Testing /api/complaints...")
    r = requests.get(f"{BASE_URL}/api/complaints")
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        print(f"   Total complaints: {data.get('count', 0)}")
    return r.status_code == 200

def test_duplicate(complaint_id):
    print("\n🔍 Testing duplicate detection...")
    data = {"text": "Water pump not working in Chinhat", "ward": "Chinhat"}
    r = requests.post(f"{BASE_URL}/api/complaints/submit", json=data)
    if r.status_code == 200:
        result = r.json()
        print(f"   Is duplicate: {result.get('is_duplicate')}")
        if result.get('is_duplicate'):
            print(f"   ✅ Duplicate detected!")
        else:
            print(f"   ⚠️ Duplicate not detected")
    return r.status_code == 200

if __name__ == "__main__":
    print("="*50)
    print("JANSAATH API TEST SUITE")
    print("="*50)
    
    if test_health():
        complaint_id = test_submit()
        test_get_complaints()
        if complaint_id:
            test_duplicate(complaint_id)
    else:
        print("❌ Server not responding. Make sure it's running on http://localhost:8000")
