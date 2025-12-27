"""
ASHA Worker Support API Endpoints
Provides access to ASHA Support Agent for workflow guidance and offline sync
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any
from pydantic import BaseModel
from core.logging_config import logger
from agents.asha_support_agent import asha_support_agent


router = APIRouter(prefix="/api/v1/asha", tags=["asha-support"])


# Request Models
class OfflineSyncRequest(BaseModel):
    """Request model for offline data sync"""
    asha_worker_id: int
    offline_records: List[Dict[str, Any]]


class ActionSuggestionRequest(BaseModel):
    """Request model for action suggestions"""
    patient_data: Dict[str, Any]


@router.post("/voice-guide")
async def get_voice_instructions(
    step: str = Query(..., description="Workflow step identifier"),
    language: str = Query("hi", description="Language code (en/hi/mr/ta/te/bn)")
):
    """
    Get voice-guided instructions for a workflow step
    
    Args:
        step: Workflow step (e.g., "record_blood_pressure")
        language: Language code
        
    Returns:
        Voice instructions with text and audio URL
    """
    try:
        logger.info(f"Getting voice instructions for step: {step}")
        
        instructions = await asha_support_agent.generate_voice_instructions(
            step=step,
            language=language
        )
        
        return instructions
        
    except Exception as e:
        logger.error(f"Error getting voice instructions: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get voice instructions: {str(e)}"
        )


@router.post("/offline-sync")
async def sync_offline_data(request: OfflineSyncRequest):
    """
    Sync offline data when ASHA worker comes online
    
    Args:
        request: OfflineSyncRequest with worker ID and offline records
        
    Returns:
        Sync status and results
    """
    try:
        logger.info(f"Syncing offline data for ASHA worker {request.asha_worker_id}")
        
        result = await asha_support_agent.offline_sync_handler(
            asha_worker_id=request.asha_worker_id,
            offline_records=request.offline_records
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Error syncing offline data: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Offline sync failed: {str(e)}"
        )


@router.post("/suggest-action")
async def suggest_next_action(request: ActionSuggestionRequest):
    """
    Get AI-powered action suggestions based on patient data
    
    Args:
        request: ActionSuggestionRequest with patient data
        
    Returns:
        Suggested actions and urgency level
    """
    try:
        logger.info("Generating action suggestions")
        
        suggestions = await asha_support_agent.suggest_next_action(
            patient_data=request.patient_data
        )
        
        return suggestions
        
    except Exception as e:
        logger.error(f"Error generating suggestions: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate suggestions: {str(e)}"
        )


@router.get("/pending-tasks")
async def get_pending_tasks(
    asha_worker_id: int = Query(..., description="ASHA worker ID")
):
    """
    Get pending tasks for ASHA worker
    
    Args:
        asha_worker_id: ASHA worker ID
        
    Returns:
        List of pending tasks
    """
    try:
        tasks = await asha_support_agent.get_pending_tasks(
            asha_worker_id=asha_worker_id
        )
        
        return {
            "asha_worker_id": asha_worker_id,
            "tasks": tasks,
            "total": len(tasks)
        }
        
    except Exception as e:
        logger.error(f"Error fetching pending tasks: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch pending tasks: {str(e)}"
        )


@router.get("/workflows")
async def get_available_workflows():
    """
    Get list of available workflow steps
    
    Returns:
        List of workflow steps with descriptions
    """
    try:
        workflows = asha_support_agent.get_available_workflows()
        
        return {
            "workflows": workflows,
            "total": len(workflows)
        }
        
    except Exception as e:
        logger.error(f"Error fetching workflows: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch workflows: {str(e)}"
        )
