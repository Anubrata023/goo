import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_historical_data():
    """Generates 2 years of weekly complaint data with seasonal patterns for Lucknow"""
    # Define our base wards with varying complaint rates and monsoon sensitivities
    wards = [
        {"id": 1, "name": "Chinhat", "base": 15, "seasonality": 2.5},
        {"id": 2, "name": "Kakori", "base": 10, "seasonality": 2.0},
        {"id": 3, "name": "Sarojini Nagar", "base": 20, "seasonality": 1.8},
        {"id": 4, "name": "Alambagh", "base": 12, "seasonality": 1.5},
    ]
    
    start_date = datetime.now() - timedelta(weeks=104)  # Look back 2 years
    end_date = datetime.now()
    weeks = []
    
    current_date = start_date
    while current_date <= end_date:
        weeks.append(current_date)
        current_date += timedelta(weeks=1)
        
    data = []
    for ward in wards:
        base = ward["base"]
        seasonality = ward["seasonality"]
        
        for i, week_date in enumerate(weeks):
            month = week_date.month
            
            # Simulate real Indian seasonality patterns (Monsoon spikes in June-August)
            if 6 <= month <= 8:  
                seasonal_factor = seasonality
            elif month in [12, 1]:  # Winter heating/electricity fluctuations
                seasonal_factor = 1.3
            else:
                seasonal_factor = 1.0
                
            # Inject random noise to simulate actual erratic real-world behaviors
            noise = np.random.normal(1.0, 0.15)
            # Add a slight upward trend over the two years as civic awareness grows
            trend = 1 + (i / len(weeks)) * 0.2
            
            count = int(base * seasonal_factor * noise * trend)
            data.append({
                "ds": week_date.strftime("%Y-%m-%d"),
                "ward_id": ward["id"],
                "y": max(0, count)  # Complaints cannot be negative numbers
            })
            
    df = pd.DataFrame(data)
    df.to_csv("data/raw/historical_complaints.csv", index=False)
    print(f"✅ Created {len(df)} historical data frames at data/raw/historical_complaints.csv")

if __name__ == "__main__":
    generate_historical_data()