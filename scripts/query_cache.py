import time

# Internal global cache storage dictionary mapping keys to (timestamp, data) tuple
_query_cache = {}

def get_cached_query(cache_key, max_age_seconds=60):
    """Retrieves data from memory if it is fresh, otherwise returns None"""
    if cache_key in _query_cache:
        timestamp, cached_data = _query_cache[cache_key]
        # Check if the cache entry has expired
        if time.time() - timestamp < max_age_seconds:
            return cached_data
            
    return None

def set_cached_query(cache_key, data):
    """Saves fresh query results into memory along with a timestamp"""
    _query_cache[cache_key] = (time.time(), data)

if __name__ == "__main__":
    # Test our internal caching layer locally
    print("⏳ Running cache simulation...")
    test_key = "ward_1_stats"
    mock_db_result = {"ward_id": 1, "complaint_count": 420}
    
    # Save data to cache
    set_cached_query(test_key, mock_db_result)
    
    # Instantly read data from cache
    cached_hit = get_cached_query(test_key, max_age_seconds=5)
    if cached_hit:
        print(f"⚡ Cache Hit Success! Retrieved from memory: {cached_hit}")
    else:
        print("❌ Cache Miss.")