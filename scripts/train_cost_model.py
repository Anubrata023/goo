import os
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

def train_cost_model():
    """Trains a scikit-learn Random Forest model on infrastructure cost benchmarks"""
    csv_path = "data/raw/mgnregs_costs.csv"
    if not os.path.exists(csv_path):
        print(f"❌ Cost benchmark data missing at {csv_path}!")
        return

    df = pd.read_csv(csv_path)

    # Convert text categories into numerical binary flags (One-Hot Encoding)
    X = pd.get_dummies(df[["category", "ward_type", "district"]])
    y = df["actual_cost"]

    # Initialize and train our Random Forest model
    model = RandomForestRegressor(n_estimators=100, random_state=42, max_depth=10)
    model.fit(X, y)

    # Ensure models directory exists and save model files
    os.makedirs("models", exist_ok=True)
    joblib.dump(model, "models/cost_model.pkl")
    joblib.dump(X.columns.tolist(), "models/cost_model_features.pkl")

    print(f"✅ Cost model trained successfully! Training Score R²: {model.score(X, y):.3f}")

def estimate_cost(category, ward_type="urban", district="Lucknow"):
    """Helper prediction function that Person A can invoke in their nodes"""
    if not os.path.exists("models/cost_model.pkl") or not os.path.exists("models/cost_model_features.pkl"):
        return 50000  # Fallback default cost if model isn't built yet
        
    model = joblib.load("models/cost_model.pkl")
    features = joblib.load("models/cost_model_features.pkl")

    # Structure incoming inputs to match training dimensions
    input_template = {col: 0 for col in features}
    if f"category_{category}" in input_template: input_template[f"category_{category}"] = 1
    if f"ward_type_{ward_type}" in input_template: input_template[f"ward_type_{ward_type}"] = 1
    if f"district_{district}" in input_template: input_template[f"district_{district}"] = 1

    X_input = pd.DataFrame([input_template])
    return int(model.predict(X_input)[0])

if __name__ == "__main__":
    train_cost_model()
    # Run quick local test verification
    print(f"🔬 Sample Cost Check: Water repair in urban Lucknow: ₹{estimate_cost('Water', 'urban'):,}")