import os
import pandas as pd
from prophet import Prophet
from supabase import create_client
from dotenv import load_dotenv

# Initialize configurations and access keys
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def train_and_upload_forecasts():
    # Read the historical parameters we generated in Step 1
    if not os.path.exists("data/raw/historical_complaints.csv"):
        print("❌ Historical complaints file missing. Run generate_historical.py first!")
        return
        
    historical_df = pd.read_csv("data/raw/historical_complaints.csv")
    
    # Clean the database forecasts table before running to avoid duplicating entries during testing
    print("🧹 Purging old forecast metrics...")
    try:
        supabase.table("forecasts").delete().neq("id", 0).execute()
    except Exception as e:
        print(f"⚠️ Warning during table purge: {e}")
    
    # Process forecasts independently per ward
    ward_ids = historical_df["ward_id"].unique()
    
    for ward_id in ward_ids:
        print(f"🔮 Processing predictive mathematics for Ward ID: {ward_id}...")
        
        # Filter data for specific ward and format correctly for Meta Prophet (requires 'ds' and 'y')
        ward_data = historical_df[historical_df["ward_id"] == ward_id][["ds", "y"]].copy()
        ward_data["ds"] = pd.to_datetime(ward_data["ds"])
        
        # Initialize Prophet configured to intercept yearly fluctuations (monsoons)
        try:
            model = Prophet(
                yearly_seasonality=True,
                weekly_seasonality=False,
                daily_seasonality=False,
                changepoint_prior_scale=0.05
            )
            model.fit(ward_data)
            
            # Generate timestamps projecting out 4 weeks into the future
            future = model.make_future_dataframe(periods=4, freq="W")
            forecast = model.predict(future)
            
            # Pull only the last 4 rows (the newly predicted points)
            upcoming_forecasts = forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]].tail(4)
        except Exception as e:
            print(f"⚠️ Prophet modeling failed ({e}). Using robust mathematical fallback model...")
            import numpy as np
            from datetime import timedelta
            
            # Ensure chronological order
            ward_data = ward_data.sort_values("ds")
            last_date = ward_data["ds"].max()
            
            # Project next 4 weeks
            future_dates = [last_date + timedelta(weeks=i) for i in range(1, 5)]
            
            # Fit polynomial trend (degree 1)
            x = np.arange(len(ward_data))
            y = ward_data["y"].values
            slope, intercept = np.polyfit(x, y, 1)
            
            # Predict future values with seasonal multipliers matching generate_historical.py
            future_x = np.arange(len(ward_data), len(ward_data) + 4)
            upcoming_rows = []
            
            for f_date, fx in zip(future_dates, future_x):
                month = f_date.month
                if 6 <= month <= 8:  # Monsoon peak
                    seasonal_factor = 2.0
                elif month in [12, 1]:  # Winter peak
                    seasonal_factor = 1.3
                else:
                    seasonal_factor = 1.0
                
                # Apply trend and seasonality
                yhat = (slope * fx + intercept) * seasonal_factor
                yhat = max(0.0, yhat)
                
                # Set confidence bounds
                yhat_lower = max(0.0, yhat - 3)
                yhat_upper = yhat + 3
                
                upcoming_rows.append({
                    "ds": pd.Timestamp(f_date),
                    "yhat": yhat,
                    "yhat_lower": yhat_lower,
                    "yhat_upper": yhat_upper
                })
            
            upcoming_forecasts = pd.DataFrame(upcoming_rows)
        
        # Upload predictions row-by-row into Supabase
        for _, row in upcoming_forecasts.iterrows():
            payload = {
                "ward_id": int(ward_id),
                "forecast_date": row["ds"].date().isoformat(),
                "predicted_count": max(0, int(row["yhat"])),
                "upper_bound": max(0, int(row["yhat_upper"])),
                "lower_bound": max(0, int(row["yhat_lower"]))
            }
            supabase.table("forecasts").insert(payload).execute()
            
    print("✅ AI Forecasting run successfully pushed to cloud database!")

if __name__ == "__main__":
    train_and_upload_forecasts()