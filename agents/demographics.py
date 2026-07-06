"""
AGENT 5: DEMOGRAPHICS NODE
Integrates with Google Cloud BigQuery to pull demographic data (Census/NFHS).
Adjusts priority based on population density and vulnerability.
"""
import os
from config import Config

def get_ward_demographics(ward_name: str) -> dict:
    """
    Query Google Cloud BigQuery for ward demographics.
    Falls back to mock data if credentials are not set (for hackathon demo).
    """
    try:
        from google.cloud import bigquery
        # Check if GCP is configured
        if not os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
            raise ValueError("GCP credentials not found. Falling back to mock data.")

        client = bigquery.Client()
        
        # Example of how we would query a public demographic dataset in BQ
        query = f"""
            SELECT population, vulnerability_index, literacy_rate
            FROM `bigquery-public-data.census_bureau_international.midyear_population`
            WHERE country_code = 'IN' AND region = @ward_name
            LIMIT 1
        """
        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("ward_name", "STRING", ward_name)
            ]
        )
        
        query_job = client.query(query, job_config=job_config)
        results = list(query_job.result())
        
        if results:
            row = results[0]
            return {
                "population": row.population,
                "vulnerability_index": getattr(row, "vulnerability_index", 0.5), # Defaulting as public census might not have this exact column
                "literacy_rate": getattr(row, "literacy_rate", 70)
            }
            
    except Exception as e:
        print(f"⚠️ BigQuery fetch skipped/failed: {e}. Using simulated Google Cloud data.")
        
    # Simulated Google Cloud BigQuery response for Hackathon Demo
    mock_data = {
        "Chinhat": {"population": 125000, "vulnerability_index": 0.85, "literacy_rate": 65},
        "Gomti Nagar": {"population": 85000, "vulnerability_index": 0.30, "literacy_rate": 92},
        "Hazratganj": {"population": 45000, "vulnerability_index": 0.20, "literacy_rate": 95}
    }
    
    return mock_data.get(ward_name, {"population": 50000, "vulnerability_index": 0.5, "literacy_rate": 70})

def demographics_node(state: dict) -> dict:
    """
    LangGraph Node: Fetches demographic data via BigQuery and calculates demographic weight.
    """
    print("📊 Demographics Agent: Querying Google Cloud BigQuery for census data...")
    
    ward = state.get("ward", "Chinhat")
    demographics = get_ward_demographics(ward)
    
    state["demographics"] = demographics
    
    # Calculate a demographic multiplier based on vulnerability
    # High vulnerability (0.8) -> multiplier 1.8. Low (0.2) -> 0.8.
    vulnerability = demographics.get("vulnerability_index", 0.5)
    demographic_weight = 0.5 + (vulnerability * 1.5)
    
    state["demographic_weight"] = demographic_weight
    
    print(f"   Ward: {ward}")
    print(f"   Vulnerability Index: {vulnerability}")
    print(f"   Demographic Weight: {demographic_weight:.2f}")
    
    return state
