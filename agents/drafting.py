import os
import json
import google.generativeai as genai
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from config import Config

# Configure Gemini to use API key instead of the Service Account (which is for Docs)
genai.configure(api_key=Config.GEMINI_API_KEY)
# Gemini model (same free key)
model = genai.GenerativeModel("gemini-2.0-flash")

# Google Docs API setup
def get_docs_service():
    """Create a Google Docs service object using service account."""
    creds = None
    creds_path = os.getenv("GOOGLE_DOCS_CREDENTIALS_PATH")
    if creds_path and os.path.exists(creds_path):
        creds = Credentials.from_service_account_file(creds_path)
    else:
        # Fallback: try using default credentials (for local development)
        import google.auth
        creds, _ = google.auth.default(scopes=["https://www.googleapis.com/auth/documents"])
    return build("docs", "v1", credentials=creds)

def generate_proposal_text(complaint_data: dict) -> str:
    """
    Use Gemini to generate a formal government project proposal.
    """
    prompt = f"""
You are a government official writing a project proposal for an MP's office.

Generate a formal project proposal for the following issue:

- Location: Ward {complaint_data.get('ward', 'Chinhat')}, Lucknow, Uttar Pradesh
- Problem Summary: {complaint_data.get('summary_en', 'Infrastructure issue')}
- Category: {complaint_data.get('category', 'Other')}
- Severity: {complaint_data.get('severity', 5)}/10
- Estimated Affected Population: {complaint_data.get('estimated_affected', 100)} people
- Estimated Cost: Rs {complaint_data.get('cost_estimate', 45000):,}
- Eligible Government Schemes: {', '.join(complaint_data.get('scheme_match', ['LADS']))}

Please write a complete proposal with the following sections:
1.  **Project Title** (concise)
2.  **Problem Statement** (describe the issue, its impact, and urgency)
3.  **Proposed Solution** (what action is needed, including specific works)
4.  **Budget Breakdown** (itemized cost estimate, including labour, materials, etc.)
5.  **Implementation Timeline** (phases, expected completion in 4 weeks)
6.  **Expected Impact** (quantifiable benefits, number of people helped)
7.  **Funding Source** (mention the eligible schemes)
8.  **Recommendation** (a clear ask for approval)

Use formal, clear, and concise language suitable for a government document.
"""
    response = model.generate_content(prompt)
    return response.text

def draft_consolidated_project(ward_name: str, complaints: list) -> str:
    """
    NEW: Hackathon specific feature.
    Takes a list of complaints for a ward, and uses Gemini to generate a
    consolidated, high-priority project recommendation for the MP.
    """
    if not complaints:
        return "No complaints found to consolidate."
        
    complaints_summary = ""
    total_cost = 0
    total_affected = 0
    categories = set()
    
    for i, c in enumerate(complaints):
        complaints_summary += f"{i+1}. {c.get('summary_en')} (Severity: {c.get('severity')})\n"
        total_cost += c.get('cost_estimate', 0)
        total_affected += c.get('estimated_affected', 0)
        categories.add(c.get('category', 'Other'))

    prompt = f"""
You are the Chief AI Strategic Advisor to an Indian Member of Parliament.
You need to consolidate multiple citizen complaints from a specific ward into one cohesive, high-priority development project proposal.

Location: Ward {ward_name}
Consolidated Budget Required: ₹{total_cost:,}
Total Estimated Affected Citizens: {total_affected}
Key Categories: {', '.join(categories)}

Raw Citizen Complaints (Extracted via AI Pipeline):
{complaints_summary}

Based on this aggregated data, draft a "Master Project Proposal" that addresses the root cause of these issues in one go.
Format as Markdown with:
1. **Executive Summary**
2. **Citizen Demand Analysis (Why this is needed based on the complaints)**
3. **Master Project Solution**
4. **Expected Impact & ROI for the Constituency**
5. **Recommended Next Steps for the MP**
"""
    response = model.generate_content(prompt)
    return response.text

def create_google_doc(proposal_text: str, complaint_id: str) -> str:
    """
    Create a Google Doc and insert the proposal text.
    Returns the public URL of the document.
    """
    try:
        service = get_docs_service()
        
        # Create a new document
        title = f"Proposal_Complaint_{complaint_id}"
        doc = service.documents().create(body={"title": title}).execute()
        doc_id = doc["documentId"]
        
        # Prepare the insert request
        requests = [
            {
                "insertText": {
                    "location": {"index": 1},
                    "text": proposal_text
                }
            }
        ]
        service.documents().batchUpdate(
            documentId=doc_id,
            body={"requests": requests}
        ).execute()
        
        # Return the viewable link
        return f"https://docs.google.com/document/d/{doc_id}/edit"
    
    except Exception as e:
        print(f" Error creating Google Doc: {e}")
        return None

def draft_proposal(complaint_data: dict) -> dict:
    """
    Full pipeline: generate text with Gemini, create Google Doc, return URL.
    """
    # 1. Generate proposal text
    proposal_text = generate_proposal_text(complaint_data)
    
    # 2. Create document
    doc_url = create_google_doc(proposal_text, complaint_data.get("id", "temp"))
    
    return {
        "proposal_text": proposal_text,
        "doc_url": doc_url,
        "status": "success" if doc_url else "failed"
    }