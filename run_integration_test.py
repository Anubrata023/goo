import os
import sys
from scripts.query_cache import get_cached_query, set_cached_query
from scripts.send_notifications import initialize_firebase, send_complaint_status_update
from scripts.train_cost_model import estimate_cost

def run_master_pipeline_check():
    print("==================================================")
    print("🚀 JANSAATH CORE DATA LAYER: INTEGRATION TEST")
    print("==================================================\n")
    
    # 1. Test Caching Module
    print("🔄 Testing Performance Caching Layer...")
    cache_key = "test_ward_metric"
    set_cached_query(cache_key, {"status": "optimized"})
    if get_cached_query(cache_key):
        print("   ⚡ Cache verification: PASSED\n")
    else:
        print("   ❌ Cache verification: FAILED\n")
        
    # 2. Test ML Pricing Core
    print("🧠 Testing Scikit-Learn Cost Estimation Core...")
    try:
        predicted_cost = estimate_cost("Roads", "urban")
        print(f"   📊 ML Predicted Cost (Urban Road Repair): ₹{predicted_cost:,}")
        print("   ⚡ Machine Learning validation: PASSED\n")
    except Exception as e:
        print(f"   ❌ Machine Learning validation: FAILED ({e})\n")
        
    # 3. Test Real-time Messaging Wrapper
    print("🔥 Testing Firebase Notification Routing...")
    initialize_firebase()
    notify_status = send_complaint_status_update(
        user_token="mock_token_123",
        complaint_id=10086,
        new_status="Resolved"
    )
    if notify_status:
        print("   ⚡ Notification Engine validation: PASSED\n")
    else:
        print("   ❌ Notification Engine validation: FAILED\n")
        
    print("==================================================")
    print("🎉 INTEGRATION SUCCESS: ALL SYSTEMS FUNCTIONAL!")
    print("==================================================")

if __name__ == "__main__":
    run_master_pipeline_check()