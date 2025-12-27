# Arogya-Swarm Development Guide

## 📋 Table of Contents
1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Backend Development](#backend-development)
4. [Frontend Development](#frontend-development)
5. [API Documentation](#api-documentation)
6. [Agent System](#agent-system)
7. [Testing](#testing)
8. [Deployment](#deployment)

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 16
- Docker & Docker Compose (optional)

### Environment Setup

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
```

#### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env if needed
```

### Running the Application

#### Option 1: Docker Compose (Recommended)
```bash
docker-compose up -d
```

#### Option 2: Manual Start

Terminal 1 - Backend:
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

## 📁 Project Structure

```
Arogya-Swarm/
├── backend/
│   ├── agents/                      # AI Agents
│   │   ├── orchestrator.py          # Agent coordinator
│   │   ├── diagnostic_triage_agent.py
│   │   └── nutrition_agent.py
│   ├── api/v1/                      # REST API
│   │   ├── patients.py
│   │   ├── diagnosis.py
│   │   └── nutrition.py
│   ├── services/                    # External services
│   │   ├── gemini_service.py
│   │   ├── translation_service.py
│   │   └── weather_service.py
│   ├── models/                      # Database models
│   │   └── patient.py
│   ├── core/                        # Core config
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   └── main.py                      # FastAPI app
│
└── frontend/
    └── src/
        ├── components/
        │   ├── landing/             # Landing page
        │   └── asha/                # ASHA interface
        └── App.tsx
```

## 🔧 Backend Development

### Adding a New API Endpoint

1. Create endpoint in `backend/api/v1/`:
```python
from fastapi import APIRouter
router = APIRouter()

@router.get("/example")
async def example():
    return {"message": "Hello"}
```

2. Register in `main.py`:
```python
from api.v1 import example
app.include_router(example.router, prefix="/api/v1/example", tags=["example"])
```

### Creating a New Agent

1. Create agent file in `backend/agents/`:
```python
class MyAgent:
    def __init__(self):
        self.name = "My Agent"
    
    async def process(self, data):
        # Agent logic here
        return result
```

2. Register with orchestrator in `main.py`:
```python
from agents.orchestrator import orchestrator, AgentType
from agents.my_agent import my_agent

orchestrator.register_agent(AgentType.MY_AGENT, my_agent)
```

### Database Models

Create models in `backend/models/`:
```python
from sqlalchemy import Column, Integer, String
from core.database import Base

class MyModel(Base):
    __tablename__ = "my_table"
    id = Column(Integer, primary_key=True)
    name = Column(String(255))
```

## 🎨 Frontend Development

### Creating a New Component

```tsx
import { useState } from 'react';

export default function MyComponent() {
  const [state, setState] = useState(null);
  
  return (
    <div className="container mx-auto">
      {/* Component content */}
    </div>
  );
}
```

### Styling with Tailwind CSS

Use Tailwind utility classes:
```tsx
<div className="bg-white rounded-lg shadow-md p-6">
  <h1 className="text-2xl font-bold text-gray-900">Title</h1>
</div>
```

### Adding a New Route

In `App.tsx`:
```tsx
import MyComponent from './components/MyComponent';

<Route path="/my-route" element={<MyComponent />} />
```

## 📚 API Documentation

### Patient Endpoints

**POST /api/v1/patients/**
- Create new patient
- Body: `{ name, age, gender, phone, village, district }`

**GET /api/v1/patients/{id}**
- Get patient by ID

**GET /api/v1/patients/**
- List all patients
- Query params: `skip`, `limit`

### Diagnosis Endpoints

**POST /api/v1/diagnosis/analyze**
- Analyze symptoms with AI triage
- Body: `{ symptoms: [], patient_info: {} }`

**POST /api/v1/diagnosis/triage**
- Perform diagnostic triage
- Body: `{ symptoms: [], patient_info: {} }`

### Nutrition Endpoints

**POST /api/v1/nutrition/plan**
- Generate meal plan
- Body: `{ patient_info: {}, dietary_restrictions: [], health_conditions: [] }`

**POST /api/v1/nutrition/gap-analysis**
- Analyze nutritional gaps
- Body: `{ patient_info: {}, current_diet: {} }`

## 🤖 Agent System

### Agent Types
1. **Sentinel** - Surge prediction
2. **Logistics** - Supply chain
3. **Triage** - Diagnostic triage
4. **Privacy** - Data privacy
5. **Nutrition** - Meal planning
6. **Telemedicine** - Doctor handoff
7. **Communication** - Messaging
8. **Image** - Image analysis
9. **ASHA** - ASHA support

### Agent Workflows

Execute workflows through orchestrator:
```python
result = await orchestrator.execute_workflow(
    workflow_type="patient_triage",
    input_data={...}
)
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
python scripts/test_backend.py
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Manual API Testing
Access interactive API docs at: http://localhost:8000/docs

## 🚢 Deployment

### Production Environment Variables

Backend `.env`:
```
APP_ENV=production
DEBUG=false
DATABASE_URL=postgresql://user:pass@host:5432/db
# Add all API keys
```

### Docker Deployment

Build and deploy:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Performance Optimization

1. **Backend**
   - Enable caching
   - Use connection pooling
   - Optimize database queries

2. **Frontend**
   - Build for production: `npm run build`
   - Enable service worker for offline support
   - Optimize images

## 🔐 Security

### API Key Management
- Never commit API keys to git
- Use environment variables
- Rotate keys regularly

### Database Security
- Use parameterized queries
- Enable SSL connections
- Regular backups

### Authentication
- JWT tokens for API auth
- Secure password hashing
- Session management

## 📞 Support

For issues or questions:
- GitHub Issues: https://github.com/Anuj-ml/Arogya-Swarm/issues
- Email: contact@arogya-swarm.in

## 📝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Submit pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.
