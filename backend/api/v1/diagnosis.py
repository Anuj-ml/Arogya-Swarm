"""
Diagnosis API endpoints
Handles patient triage and symptom analysis
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from agents.diagnostic_triage_agent import diagnostic_triage_agent
from agents.orchestrator import orchestrator, AgentType

router = APIRouter()


class SymptomAnalysisRequest(BaseModel):
    """Request model for symptom analysis"""
    patient_id: Optional[int] = None
    symptoms: List[str]
    patient_info: dict


class TriageResponse(BaseModel):
    """Response model for triage results"""
    severity: str
    triage_score: int
    analysis: str
    doctor_required: bool
    recommendations: List[str]
    status: str


@router.post("/analyze", response_model=dict)
async def analyze_symptoms(request: SymptomAnalysisRequest):
    """
    Analyze patient symptoms and provide triage assessment
    
    Args:
        request: Symptom analysis request
        
    Returns:
        Triage analysis results
    """
    try:
        # Prepare data for triage agent
        data = {
            'patient_id': request.patient_id,
            'symptoms': request.symptoms,
            'patient_info': request.patient_info
        }
        
        # Execute triage workflow through orchestrator
        result = await orchestrator.execute_workflow(
            workflow_type="patient_triage",
            input_data=data
        )
        
        if 'error' in result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result['error']
            )
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/triage", response_model=dict)
async def perform_triage(request: SymptomAnalysisRequest):
    """
    Perform diagnostic triage on a patient
    
    This is a direct call to the triage agent without orchestrator
    """
    try:
        data = {
            'symptoms': request.symptoms,
            'patient_info': request.patient_info
        }
        
        result = await diagnostic_triage_agent.analyze(data)
        
        if result.get('status') == 'error':
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get('error', 'Triage analysis failed')
            )
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/priority/{patient_id}")
async def calculate_priority(
    patient_id: int,
    triage_score: int,
    wait_time_minutes: int = 0
):
    """
    Calculate patient priority for queue management
    
    Args:
        patient_id: Patient ID
        triage_score: Patient's triage score (0-100)
        wait_time_minutes: Time patient has been waiting
        
    Returns:
        Priority score
    """
    priority = diagnostic_triage_agent.calculate_priority(
        triage_score=triage_score,
        wait_time_minutes=wait_time_minutes
    )
    
    return {
        'patient_id': patient_id,
        'priority': priority,
        'triage_score': triage_score,
        'wait_time_minutes': wait_time_minutes
    }
