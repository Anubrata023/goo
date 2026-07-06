

# JanSaath v3.0 - AI-Powered Constituency Intelligence Platform

## 📌 Overview

**JanSaath** is an AI-powered constituency intelligence platform built for the **Google Build with AI: Code for Communities Hackathon**. It enables citizens to submit complaints (text, photo, or voice) and helps MPs prioritize development projects using objective, data-driven decisions.

### The Problem

MPs receive hundreds of complaints daily through WhatsApp, social media, letters, and in-person visits. There is **no objective system** to decide what gets fixed first. Decisions are made on gut feel and political pressure - the loudest voice wins, the most remote villages lose.

### The Solution

JanSaath replaces gut feel with data by:
1. **Collecting** complaints via text, photo, and voice (any Indian language)
2. **Analyzing** them with Google's Gemini AI for free
3. **Clustering** duplicate complaints into Mega-Issues
4. **Prioritizing** using a transparent mathematical formula
5. **Generating** official project proposals with one click

### Key USP: Zero-Cost Infrastructure

Everything runs on **genuinely free infrastructure** - no credit card required for most components. Deploy to any of India's 543 constituencies at effectively ₹0 infrastructure cost.

---

## 🏆 Track

**Track 1: People's Priorities - AI for Constituency Development Planning**

---

## 🎯 Features

### Citizen Features
| Feature | Description | How It Works |
|---------|-------------|--------------|
| 📝 **Text Complaint** | Type complaint in any language | Gemini analyzes and categorizes |
| 📷 **Photo Complaint** | Upload photo of the problem | Gemini Vision reads the image |
| 🎤 **Voice Complaint** | Record voice on website | Gemini transcribes and analyzes |
| 🌐 **Multi-Lingual** | English/Hindi UI toggle | Full bilingual support |
| 🔄 **Real-Time Feed** | See all complaints live | Firebase Realtime DB |
| 👍 **Upvote** | Support complaints you care about | Atomic increment |

### MP Features
| Feature | Description | How It Works |
|---------|-------------|--------------|
| 📊 **Admin Dashboard** | KPI cards, priority-ranked list | Real-time data from Supabase |
| 🗺️ **Heatmap** | Complaint density map | Leaflet + OpenStreetMap |
| 🎯 **Insight Panel** | 5 data points per complaint | Census, OSM, MGNREGS, Earth Engine |
| 📋 **Kanban Board** | Drag-and-drop status updates | @dnd-kit library |
| 📄 **Draft Proposal** | Generate official project proposal | Gemini + Google Docs API |

### Public Features
| Feature | Description | How It Works |
|---------|-------------|--------------|
| 👁️ **Transparency Dashboard** | Real-time public data | No login required |
| 📊 **Complaint Statistics** | Charts and metrics | Recharts library |
| 🗺️ **Public Heatmap** | See all complaints | Leaflet + OpenStreetMap |

### Technical Features
| Feature | Description | How It Works |
|---------|-------------|--------------|
| 🤖 **AI Analysis** | Category, severity, bilingual summary | Gemini 2.0 Flash |
| 🔗 **Duplicate Detection** | Merge similar complaints | pgvector cosine similarity |
| 💰 **Cost Estimation** | Predict project cost | scikit-learn model |
| 📈 **Forecasting** | Predict complaint spikes | Prophet model |
| 📄 **Proposal Generation** | Complete government documents | Gemini + Google Docs API |

---

## 🛠️ Technology Stack

### 100% Free Infrastructure

| Layer | Technology | Why Free |
|-------|------------|----------|
| **AI Brain** | Google AI Studio - Gemini 2.0 Flash | 1,500 requests/day free |
| **Database** | Supabase (PostgreSQL + pgvector) | 500MB free tier |
| **Frontend** | Firebase Hosting (Spark Plan) | Free tier |
| **Backend** | Render.com | Free tier |
| **Maps** | OpenStreetMap + Leaflet.js | Open-source |
| **Forecasting** | Prophet (Meta) | Open-source |
| **Cost Model** | scikit-learn | Open-source |
| **Vector Search** | pgvector | Open-source |
| **Document Generation** | Google Docs API | Free via OAuth |
| **Image/Voice Analysis** | Gemini Multimodal | Free via AI Studio |

### Full Stack

**Frontend**
```
- React 18 + Vite
- TypeScript
- Tailwind CSS + shadcn/ui
- Leaflet.js (OpenStreetMap)
- Recharts
- Firebase (Realtime DB, Auth, Hosting)
```

**Backend**
```
- FastAPI (Python 3.11)
- LangGraph (Agent Orchestration)
- Google Gemini 2.0 Flash
- Supabase (PostgreSQL + pgvector)
- Render.com (Hosting)
```

**Data & ML**
```
- Prophet (Forecasting)
- scikit-learn (Cost Model)
- Pandas, NumPy
- Joblib (Model Persistence)
```

---

## 🏗️ Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CITIZEN INPUT LAYER                              │
├───────────────┬───────────────┬───────────────┬───────────────────────────┤
│   Web App     │   WhatsApp    │   Phone Call  │        Photo              │
│   (React)     │   (Meta API)  │   (Twilio)    │    (Gemini Vision)        │
└───────┬───────┴───────┬───────┴───────┬───────┴───────────────┬───────────┘
        │               │               │                       │
        ▼               ▼               ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LANGGRAPH PIPELINE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────┐  │
│  │   INTAKE     │───▶│ GEOSPATIAL   │───▶│   FISCAL     │───▶│ PRIORITY │  │
│  │   AGENT      │    │    AGENT     │    │    AGENT     │    │   AGENT  │  │
│  └──────────────┘    └──────────────┘    └──────────────┘    └──────────┘  │
│       │                    │                    │                  │        │
│  Gemini Triage       Duplicate           Cost               Priority      │
│  Category,           Detection           Estimation         Score         │
│  Severity,           (pgvector)          (scikit-learn)     Calculation   │
│  Bilingual Summary                                             │        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
        │               │               │                       │
        ▼               ▼               ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      DATA & OUTPUT LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │    SUPABASE      │  │   GOOGLE DOCS    │  │   PUBLIC DASHBOARD       │  │
│  │  (PostgreSQL +   │  │   (Proposal      │  │   (Transparency View)    │  │
│  │   pgvector)      │  │   Generation)    │  │                          │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4-Agent Pipeline

| Agent | What It Does | Technology |
|-------|--------------|------------|
| **1. Intake** | Gemini triage: category, severity, bilingual summary | Gemini 2.0 Flash |
| **2. Geospatial** | Duplicate detection, location verification | pgvector + OpenStreetMap |
| **3. Fiscal** | Cost estimation, scheme matching | scikit-learn model |
| **4. Priority** | Score calculation (0-100) | Mathematical formula |

### Priority Score Formula

```
Priority(x) = (0.35 × S(x)) + (0.30 × Impact(x)) + (0.20 × G(x)) + (0.15 × T(x))

Where:
- S(x) = Severity Score (1-10) from Gemini
- Impact(x) = Population / Cost (people helped per rupee)
- G(x) = Geographic Confidence (satellite + OSM verification)
- T(x) = Time Decay (older issues get higher weight)
```

---

## 📁 Project Structure

```
jansaath/
├── backend/                          # FastAPI Backend
│   ├── main.py                      # Entry point
│   ├── config.py                    # Environment config
│   ├── requirements.txt              # Dependencies
│   ├── Dockerfile                    # Containerization
│   ├── .env                          # Secrets (not committed)
│   ├── agents/
│   │   ├── intake.py                # Agent 1: Gemini triage
│   │   ├── geospatial.py            # Agent 2: Duplicate detection
│   │   ├── fiscal.py                # Agent 3: Cost estimation
│   │   ├── drafting.py              # Agent 4: Proposal generation
│   │   └── graph.py                 # LangGraph workflow
│   ├── models/
│   │   └── database.py              # Supabase operations
│   └── utils/
│       └── helpers.py               # Helper functions
│
├── frontend/                         # React Frontend
│   ├── src/
│   │   ├── App.tsx                  # Main app
│   │   ├── firebase.ts              # Firebase config
│   │   ├── components/
│   │   │   ├── citizen/             # Citizen-facing UI
│   │   │   ├── admin/               # Admin Dashboard
│   │   │   └── public/              # Public Dashboard
│   │   ├── context/
│   │   │   └── LanguageContext.tsx  # Multi-lingual support
│   │   └── utils/
│   │       └── priority.ts          # Priority calculator
│   ├── package.json
│   ├── .env
│   └── vite.config.ts
│
├── data-engineering/                 # Data & ML
│   ├── sql/
│   │   ├── schema.sql               # Database schema
│   │   ├── pgvector_functions.sql   # Duplicate detection
│   │   └── analytics_views.sql      # Dashboard views
│   ├── scripts/
│   │   ├── load_data.py             # Load to Supabase
│   │   ├── train_cost_model.py      # Train cost model
│   │   └── train_forecast.py        # Train forecast model
│   └── models/
│       ├── cost_model.pkl           # Trained cost model
│       └── forecast_models.pkl      # Trained forecast models
│
├── documentation/                    # Project Docs
│   ├── demo_script.md               # 5-minute demo script
│   ├── qa_flashcards.md             # Judge Q&A
│   ├── bug_log.md                   # Bug tracking
│   └── real_numbers.md              # Lucknow data
│
└── README.md                         # This file
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Python | 3.11+ |
| Node.js | 18+ |
| Git | Latest |
| VS Code | Latest |

### Step 1: Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/jansaath.git
cd jansaath
```

### Step 2: Set Up Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # macOS/Linux
# or
venv\Scripts\activate            # Windows

pip install -r requirements.txt

# Create .env file with:
# GEMINI_API_KEY=AIzaSy...
# SUPABASE_URL=...
# SUPABASE_SERVICE_KEY=...
```

### Step 3: Set Up Frontend

```bash
cd frontend
npm install

# Create .env file with:
# VITE_API_URL=http://localhost:8000
# VITE_FIREBASE_CONFIG=...
```

### Step 4: Set Up Database

1. Create Supabase project
2. Run `sql/schema.sql` in Supabase SQL Editor
3. Run `sql/pgvector_functions.sql`
4. Run `sql/analytics_views.sql`

### Step 5: Train ML Models

```bash
cd data-engineering
pip install -r requirements.txt
python scripts/train_cost_model.py
python scripts/train_forecast.py
```

### Step 6: Run Locally

```bash
# Terminal 1 - Backend
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Step 7: Access the App

| URL | Purpose |
|-----|---------|
| http://localhost:5173 | Frontend App |
| http://localhost:8000/docs | API Documentation (Swagger) |
| http://localhost:8000/api/health | Health Check |

---

## 📊 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Health check |
| `/api/complaints/submit` | POST | Submit text complaint |
| `/api/complaints/voice` | POST | Submit voice complaint |
| `/api/complaints/photo` | POST | Submit photo complaint |
| `/api/complaints` | GET | Get all complaints |
| `/api/complaints/{id}` | GET | Get single complaint |
| `/api/complaints/{id}/draft` | POST | Generate proposal |
| `/api/complaints/{id}/status` | PATCH | Update status |

### Example: Submit a Complaint

```bash
curl -X POST http://localhost:8000/api/complaints/submit \
  -H "Content-Type: application/json" \
  -d '{"text": "Handpump broken in Chinhat for 3 weeks", "ward": "Chinhat"}'
```

**Response:**
```json
{
  "status": "received",
  "complaint_id": "abc12345",
  "is_duplicate": false,
  "analysis": {
    "category": "Water",
    "severity": 8,
    "summary_en": "Handpump broken in Chinhat for 3 weeks",
    "summary_hi": "चिनहट में 3 हफ्ते से हैंडपंप खराब है",
    "priority_score": 78.0,
    "cost_estimate": 45000,
    "scheme_match": ["Jal Jeevan Mission"]
  }
}
```

---

## 💰 Cost Analysis

| Service | Monthly Cost | Why Free |
|---------|--------------|----------|
| Google AI Studio (Gemini) | ₹0 | 1,500 requests/day free |
| Supabase | ₹0 | 500MB free tier |
| Firebase Spark Plan | ₹0 | Free tier |
| Render.com | ₹0 | Free tier |
| OpenStreetMap + Leaflet | ₹0 | Open-source |
| LangGraph | ₹0 | Open-source |
| Prophet + scikit-learn | ₹0 | Open-source |
| Google Docs API | ₹0 | Free via OAuth |
| **TOTAL** | **₹0** | **100% free for pilot** |

**Note:** Twilio IVR would cost ~₹1,200 for 1,000 calls (trial credit covers hackathon demo).

---

## 📈 Demo Data

### 5 Demo Complaints

| ID | Complaint | Ward | Priority |
|----|-----------|------|----------|
| 001 | Handpump broken 3 weeks, no water | Chinhat | 78/100 |
| 002 | School toilets missing, girls dropping out | Kakori | 82/100 |
| 003 | Flooded road after heavy rain | Sarojini Nagar | 71/100 |
| 004 | Electric pole broken, darkness at night | Alambagh | 68/100 |
| 005 | Same handpump - 47 citizens reported (merged) | Chinhat | 78/100 |

### Real Lucknow Data

| Data Point | Value | Source |
|------------|-------|--------|
| Chinhat Population | 3,400 residents | Census 2021 |
| Nearest School | 4.2km | UDISE+ |
| Water Coverage (JJM) | 62% | Jal Jeevan Mission |
| LADS Budget | ₹5 crore | sansad.in |
| Handpump Cost | ₹45,000 | MGNREGS |

---

## 🔧 Deployment

### Backend (Render.com)

```bash
# Push to GitHub
git add .
git commit -m "Deploy backend"
git push origin main

# Deploy on Render
# 1. Go to render.com
# 2. New → Web Service → Connect GitHub
# 3. Build Command: pip install -r requirements.txt
# 4. Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
# 5. Add environment variables
```

### Frontend (Firebase Hosting)

```bash
cd frontend
npm run build
firebase deploy --only hosting
```

---

## 👥 Team

| Person | Role | Responsibilities |
|--------|------|------------------|
| **Anubrata Paul** | Backend & AI Orchestrator | FastAPI, LangGraph, Gemini, Supabase, Google Docs |
| **Rachel Debnath** | Frontend & UI/UX | React, Leaflet, Firebase, Priority Engine |
| **Aman Sagar** | Data & ML Lead | Supabase schema, Prophet, scikit-learn |
| **Ranabir Mondal** | Research, QA & Storyteller | Data prep, Demo script, Q&A, Testing |

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [Demo Script](./documentation/demo_script.md) | 5-minute presentation |
| [Q&A Flashcards](./documentation/qa_flashcards.md) | Judge preparation |
| [Real Numbers](./documentation/real_numbers.md) | Lucknow data |
| [Bug Log](./documentation/bug_log.md) | Issue tracking |

---

## 🏆 USPs

| USP | Description |
|-----|-------------|
| **Zero-Internet IVR Mesh** | Citizens call, speak in any language, no smartphone needed |
| **Mega-Issue Clustering** | AI merges 200 duplicate complaints into one signal |
| **Predictive Governance** | Forecasts complaint spikes 4 weeks ahead |
| **One-Click Legislative Package** | Complete Google Docs proposal in 3 seconds |
| **Zero-Cost Infrastructure** | Deploy to 543 constituencies at ₹0 cost |

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "ModuleNotFoundError" | `pip install -r requirements.txt` |
| "GEMINI_API_KEY not found" | Check `.env` file and `config.py` |
| "Supabase connection failed" | Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` |
| "Port 8000 already in use" | `uvicorn main:app --port 8001` |
| "Firebase not initialized" | Check `firebaseConfig` in `.env` |

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- **Google Build with AI**: Hackathon sponsor
- **Google AI Studio**: Free Gemini API
- **Supabase**: Free PostgreSQL + pgvector
- **Render**: Free backend hosting
- **OpenStreetMap**: Free maps
- **scikit-learn**: Free ML library


## 🔗 Links

| Resource | URL |
|----------|-----|
| Live Demo | https://jansaath-ui.onrender.com |
| API Documentation | https://jansaath-api.onrender.com/docs |
| GitHub Repository | https://github.com/YOUR_USERNAME/jansaath |
| Hackathon Link | https://hack2skill.com/event/codeforcommunities/ |

---

## 🎯 Final Pitch

> *"From a voice call on a Rs 500 phone to a funded government project with satellite-verified evidence and public accountability - in under 5 minutes. All built on free infrastructure. JanSaath. For 1.4 billion citizens. Built on Google AI."*

---

**⭐ If you find this project useful, please give it a star on GitHub!** ⭐


