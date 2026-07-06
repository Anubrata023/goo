"""
LangGraph workflow - connects all agents in a pipeline.
"""

from langgraph.graph import StateGraph, END
from typing import TypedDict, Optional

from agents.intake import triage_complaint, get_embedding

from agents.fiscal import estimate_cost, match_schemes
from models.database import find_duplicates
from agents.demographics import demographics_node

# ============================================
# Define State
# ============================================
class ComplaintState(TypedDict):
    raw_input: str
    ward: str
    phone: str
    
    # Added by intake agent
    category: Optional[str]
    severity: Optional[int]
    summary_en: Optional[str]
    summary_hi: Optional[str]
    sentiment: Optional[str]
    scheme_match: Optional[list]
    estimated_affected: Optional[int]
    embedding: Optional[list]
    
    # Added by geospatial agent
    is_duplicate: Optional[bool]
    duplicate_similarity: Optional[float]
    geo_confidence: Optional[float]
    
    # Added by fiscal agent
    cost_estimate: Optional[float]
    
    # Added by demographics agent
    demographics: Optional[dict]
    demographic_weight: Optional[float]
    
    # Added by priority agent
    priority_score: Optional[float]

# ============================================
# AGENT 1: INTAKE
# ============================================
def intake_node(state: ComplaintState) -> ComplaintState:
    """Gemini triage: categorize, summarize, translate."""
    print("📝 Intake Agent: Analyzing complaint...")
    
    result = triage_complaint(state["raw_input"])
    
    state["category"] = result.get("category")
    state["severity"] = result.get("severity")
    state["summary_en"] = result.get("summary_en")
    state["summary_hi"] = result.get("summary_hi")
    state["sentiment"] = result.get("sentiment")
    state["scheme_match"] = result.get("scheme_match", [])
    state["estimated_affected"] = result.get("estimated_affected", 100)
    
    # Generate embedding for duplicate detection
    text_to_embed = state["summary_en"] or state["raw_input"]
    state["embedding"] = get_embedding(text_to_embed)
    
    print(f"   Category: {state['category']}")
    print(f"   Severity: {state['severity']}/10")
    
    return state

# ============================================
# AGENT 2: GEOSPATIAL
# ============================================
def geospatial_node(state: ComplaintState) -> ComplaintState:
    """Check for duplicates using pgvector."""
    print("🔍 Geospatial Agent: Checking for duplicates...")
    
    if state.get("embedding"):
        duplicates = find_duplicates(
            state["embedding"],
            state.get("ward", "Chinhat"),
            threshold=0.80
        )
        
        if duplicates:
            state["is_duplicate"] = True
            state["duplicate_similarity"] = duplicates[0].get("similarity", 0.85)
            state["geo_confidence"] = 0.95
            print(f"   Found duplicate! Similarity: {state['duplicate_similarity']:.2f}")
        else:
            state["is_duplicate"] = False
            state["geo_confidence"] = 0.5
            print("   No duplicates found")
    else:
        state["is_duplicate"] = False
        state["geo_confidence"] = 0.5
    
    return state

# ============================================
# AGENT 3: FISCAL
# ============================================
def fiscal_node(state: ComplaintState) -> ComplaintState:
    """Estimate cost and match schemes."""
    print("💰 Fiscal Agent: Estimating cost...")
    
    category = state.get("category", "Other")
    population = state.get("estimated_affected", 100)
    
    state["cost_estimate"] = estimate_cost(category, population)
    if not state.get("scheme_match"):
        state["scheme_match"] = match_schemes(category)
    
    print(f"   Cost: ₹{state['cost_estimate']:,}")
    print(f"   Schemes: {state['scheme_match']}")
    
    return state

# ============================================
# AGENT 4: PRIORITY CALCULATOR
# ============================================
def priority_node(state: ComplaintState) -> ComplaintState:
    """Calculate priority score using severity, cost, and BigQuery demographics."""
    print("📊 Priority Agent: Calculating score...")
    
    severity = state.get("severity", 5)
    cost = state.get("cost_estimate", 45000)
    population = state.get("estimated_affected", 100)
    geo_confidence = state.get("geo_confidence", 0.5)
    
    # Get demographic weight from BigQuery node (default to 1.0 if missing)
    demographic_weight = state.get("demographic_weight", 1.0)
    
    # Impact = people per rupee
    impact = population / max(cost, 1)
    
    # Time decay (new complaints get 0.5)
    time_decay = 0.5
    
    # Priority formula: (35% severity + 30% impact + 20% confidence + 15% time) * Demographic Weight
    raw = (0.35 * severity) + (0.30 * impact * 1000) + (0.20 * geo_confidence * 10) + (0.15 * time_decay * 10)
    
    # Apply BigQuery vulnerability weight
    weighted_score = raw * demographic_weight
    
    priority_score = round(min((weighted_score / 4.0) * 10, 100), 1)
    
    state["priority_score"] = priority_score
    
    print(f"   Final Priority Score: {priority_score}/100")
    
    return state

# ============================================
# BUILD THE WORKFLOW
# ============================================
def create_graph():
    """Create and return the LangGraph workflow."""
    workflow = StateGraph(ComplaintState)
    
    # Add all nodes
    workflow.add_node("intake", intake_node)
    workflow.add_node("geospatial", geospatial_node)
    workflow.add_node("fiscal", fiscal_node)
    workflow.add_node("demographics", demographics_node) # NEW: BigQuery Integration
    workflow.add_node("priority", priority_node)
    
    # Set entry point
    workflow.set_entry_point("intake")
    
    # Define edges (pipeline flow)
    workflow.add_edge("intake", "geospatial")
    workflow.add_edge("geospatial", "fiscal")
    workflow.add_edge("fiscal", "demographics") # Modified to route to demographics
    workflow.add_edge("demographics", "priority") # Route to priority
    workflow.add_edge("priority", END)
    
    return workflow.compile()
