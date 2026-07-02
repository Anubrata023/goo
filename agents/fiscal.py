"""
AGENT 3: FISCAL UNDERWRITER
Estimates cost and matches government schemes.
"""

# Fallback cost estimates (Person C will replace with scikit-learn model)
FALLBACK_COSTS = {
    "Water": 45000,
    "Roads": 80000,
    "Electricity": 60000,
    "Education": 200000,
    "Health": 150000,
    "Sanitation": 50000,
    "Agriculture": 100000,
    "Other": 30000
}

# Government schemes per category
SCHEME_MAPPING = {
    "Water": ["Jal Jeevan Mission", "AMRUT"],
    "Roads": ["PMGSY", "CRIF"],
    "Education": ["Samagra Shiksha", "Mid-Day Meal"],
    "Health": ["NHM", "Ayushman Bharat"],
    "Sanitation": ["Swachh Bharat", "AMRUT"],
    "Electricity": ["DDUGJY", "IPDS"],
    "Agriculture": ["PM-KISAN", "Soil Health Card"],
    "Other": ["LADS (MP's Local Area Development Scheme)"]
}

def estimate_cost(category: str, population: int = 100) -> int:
    """
    Estimate cost based on category.
    Person C will replace this with scikit-learn model.
    """
    return FALLBACK_COSTS.get(category, 30000)

def match_schemes(category: str) -> list:
    """Return matching government schemes for the category."""
    return SCHEME_MAPPING.get(category, ["LADS"])

def fiscal_node(state: dict) -> dict:
    """
    Agent 3: Adds cost estimate and scheme matches to the state.
    """
    category = state.get("category", "Other")
    population = state.get("estimated_affected", 100)
    
    state["cost_estimate"] = estimate_cost(category, population)
    state["scheme_match"] = match_schemes(category)
    
    print(f"💰 Cost estimate: ₹{state['cost_estimate']:,}")
    print(f"📜 Schemes: {state['scheme_match']}")
    
    return state