"""
Nutrition API endpoints
Handles meal planning and nutrition analysis
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from agents.nutrition_agent import nutrition_agent
from agents.orchestrator import orchestrator

router = APIRouter()


class NutritionPlanRequest(BaseModel):
    """Request model for nutrition plan generation"""
    patient_id: Optional[int] = None
    patient_info: dict
    dietary_restrictions: List[str] = []
    health_conditions: List[str] = []


class NutritionGapRequest(BaseModel):
    """Request model for nutrition gap analysis"""
    patient_info: dict
    current_diet: dict


@router.post("/plan", response_model=dict)
async def generate_meal_plan(request: NutritionPlanRequest):
    """
    Generate personalized meal plan for a patient
    
    Args:
        request: Nutrition plan request with patient info
        
    Returns:
        Personalized meal plan with recommendations
    """
    try:
        data = {
            'patient_info': request.patient_info,
            'dietary_restrictions': request.dietary_restrictions,
            'health_conditions': request.health_conditions
        }
        
        # Execute through orchestrator
        result = await orchestrator.execute_workflow(
            workflow_type="nutrition_plan",
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


@router.post("/gap-analysis", response_model=dict)
async def analyze_nutrition_gap(request: NutritionGapRequest):
    """
    Analyze nutritional gaps in current diet
    
    Args:
        request: Current diet information
        
    Returns:
        Analysis of nutritional gaps and recommendations
    """
    try:
        data = {
            'patient_info': request.patient_info,
            'current_diet': request.current_diet
        }
        
        result = await nutrition_agent.analyze_nutrition_gap(data)
        
        if result.get('status') == 'error':
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get('error', 'Gap analysis failed')
            )
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/recommendations/{age}/{gender}")
async def get_nutrition_recommendations(
    age: int,
    gender: str,
    bmi: Optional[float] = None,
    conditions: Optional[str] = None
):
    """
    Get general nutrition recommendations
    
    Args:
        age: Patient age
        gender: Patient gender
        bmi: Optional BMI value
        conditions: Optional comma-separated health conditions
        
    Returns:
        Nutrition recommendations
    """
    patient_info = {
        'age': age,
        'gender': gender,
        'bmi': bmi
    }
    
    health_conditions = []
    if conditions:
        health_conditions = [c.strip() for c in conditions.split(',')]
    
    recommendations = nutrition_agent._generate_recommendations(
        patient_info=patient_info,
        health_conditions=health_conditions
    )
    
    return {
        'patient_info': patient_info,
        'health_conditions': health_conditions,
        'recommendations': recommendations,
        'bmi_category': nutrition_agent._get_bmi_category(bmi) if bmi else 'unknown'
    }
