"""
Arogya-Swarm: Complete Rural Health Agentic Assistant
Main FastAPI application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from core.error_handlers import global_exception_handler, validation_exception_handler
from core.logging_config import logger

# Create FastAPI app
app = FastAPI(
    title="Arogya-Swarm API",
    description="Predictive, preventive, and resilient AI system for rural healthcare",
    version="1.0.0",
    debug=settings.DEBUG
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register exception handlers
app.add_exception_handler(Exception, global_exception_handler)

# Import and register routers
from api.v1 import patients, diagnosis, nutrition, surge, inventory, telemedicine
from agents.orchestrator import orchestrator, AgentType
from agents.diagnostic_triage_agent import diagnostic_triage_agent
from agents.nutrition_agent import nutrition_agent as nutrition_agent_instance
from agents.sentinel_agent import sentinel_agent
from agents.logistics_agent import logistics_agent
from agents.telemedicine_orchestrator import telemedicine_orchestrator

# Register agents with orchestrator
orchestrator.register_agent(AgentType.TRIAGE, diagnostic_triage_agent)
orchestrator.register_agent(AgentType.NUTRITION, nutrition_agent_instance)
# Note: Other agents are accessed directly via their APIs

# Register API routers
app.include_router(patients.router, prefix="/api/v1/patients", tags=["patients"])
app.include_router(diagnosis.router, prefix="/api/v1/diagnosis", tags=["diagnosis"])
app.include_router(nutrition.router, prefix="/api/v1/nutrition", tags=["nutrition"])
app.include_router(surge.router)  # prefix already defined in surge.py
app.include_router(inventory.router)  # prefix already defined in inventory.py
app.include_router(telemedicine.router)  # prefix already defined in telemedicine.py


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Arogya-Swarm API",
        "version": "1.0.0",
        "status": "operational"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "environment": settings.APP_ENV
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
