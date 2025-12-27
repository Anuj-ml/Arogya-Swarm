"""
Surge Prediction API Endpoints
Provides access to Sentinel Agent surge forecasting
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from datetime import datetime, timedelta
from pydantic import BaseModel
from core.logging_config import logger
from agents.sentinel_agent import sentinel_agent, SurgePrediction


router = APIRouter(prefix="/api/v1/surge", tags=["surge-prediction"])


# Request/Response Models
class SurgePredictionRequest(BaseModel):
    """Request model for surge prediction"""
    location: str
    include_historical: bool = False


class SurgePredictionResponse(BaseModel):
    """Response model for surge prediction"""
    surge_likelihood: str
    confidence_score: int
    predicted_cases: int
    factors: dict
    recommended_actions: List[str]
    prediction_time: str
    location: str


class EnvironmentalDataResponse(BaseModel):
    """Response model for environmental data"""
    weather: Optional[dict]
    aqi: Optional[dict]
    events: List[dict]
    timestamp: str
    location: str


@router.post("/predict", response_model=SurgePredictionResponse)
async def predict_surge(request: SurgePredictionRequest):
    """
    Predict disease surge for a location
    
    Args:
        request: SurgePredictionRequest with location and options
        
    Returns:
        SurgePredictionResponse with forecast details
    """
    try:
        logger.info(f"Predicting surge for location: {request.location}")
        
        # Get prediction from Sentinel Agent
        prediction = await sentinel_agent.predict_surge(
            location=request.location,
            historical_data=None  # TODO: Fetch from database if requested
        )
        
        # Trigger alerts if needed
        alert_result = await sentinel_agent.trigger_alerts(prediction)
        
        logger.info(
            f"Surge prediction complete: {prediction.surge_likelihood} "
            f"({prediction.confidence_score}% confidence), "
            f"Alerts triggered: {alert_result['alerts_triggered']}"
        )
        
        return SurgePredictionResponse(
            surge_likelihood=prediction.surge_likelihood,
            confidence_score=prediction.confidence_score,
            predicted_cases=prediction.predicted_cases,
            factors=prediction.factors,
            recommended_actions=prediction.recommended_actions,
            prediction_time=prediction.prediction_time.isoformat(),
            location=request.location
        )
        
    except Exception as e:
        logger.error(f"Error predicting surge: {e}")
        raise HTTPException(status_code=500, detail=f"Surge prediction failed: {str(e)}")


@router.get("/environmental-data", response_model=EnvironmentalDataResponse)
async def get_environmental_data(
    location: str = Query(..., description="Location name (city/village)")
):
    """
    Get current environmental data for a location
    
    Args:
        location: Location name
        
    Returns:
        EnvironmentalDataResponse with weather, AQI, and event data
    """
    try:
        logger.info(f"Fetching environmental data for: {location}")
        
        # Fetch data from Sentinel Agent
        env_data = await sentinel_agent.fetch_environmental_data(location)
        
        return EnvironmentalDataResponse(
            weather=env_data.get("weather"),
            aqi=env_data.get("aqi"),
            events=env_data.get("events", []),
            timestamp=env_data.get("timestamp", datetime.now().isoformat()),
            location=location
        )
        
    except Exception as e:
        logger.error(f"Error fetching environmental data: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch environmental data: {str(e)}"
        )


@router.get("/current-status")
async def get_current_status(
    location: str = Query(..., description="Location name")
):
    """
    Get current surge status summary
    
    Args:
        location: Location name
        
    Returns:
        Dictionary with current status and quick summary
    """
    try:
        # Get quick prediction
        prediction = await sentinel_agent.predict_surge(location)
        
        # Determine alert level
        alert_level = "normal"
        if prediction.confidence_score >= 70:
            if prediction.surge_likelihood == "critical":
                alert_level = "critical"
            elif prediction.surge_likelihood == "high":
                alert_level = "high"
            else:
                alert_level = "elevated"
        
        return {
            "location": location,
            "alert_level": alert_level,
            "surge_likelihood": prediction.surge_likelihood,
            "confidence": prediction.confidence_score,
            "predicted_cases": prediction.predicted_cases,
            "status_message": (
                f"{prediction.surge_likelihood.upper()} risk: "
                f"{prediction.predicted_cases} cases predicted"
            ),
            "top_action": prediction.recommended_actions[0] if prediction.recommended_actions else "Monitor situation",
            "checked_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting current status: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get current status: {str(e)}"
        )


@router.get("/history")
async def get_prediction_history(
    location: Optional[str] = Query(None, description="Filter by location"),
    days: int = Query(7, description="Number of days to retrieve", ge=1, le=30)
):
    """
    Get historical surge predictions
    
    Args:
        location: Optional location filter
        days: Number of days to retrieve (1-30)
        
    Returns:
        List of historical predictions
    """
    try:
        # TODO: Implement database query for historical predictions
        # For now, return a placeholder
        logger.info(f"Fetching prediction history for {location or 'all locations'}, last {days} days")
        
        return {
            "message": "Historical data retrieval not yet implemented",
            "location": location,
            "days_requested": days,
            "predictions": []
        }
        
    except Exception as e:
        logger.error(f"Error fetching prediction history: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch prediction history: {str(e)}"
        )


@router.post("/test-alert")
async def test_alert_system(
    location: str = Query(..., description="Location for test"),
    threshold: int = Query(70, description="Alert threshold", ge=0, le=100)
):
    """
    Test the alert system with a prediction
    
    Args:
        location: Location for test
        threshold: Alert threshold (0-100)
        
    Returns:
        Alert test results
    """
    try:
        logger.info(f"Testing alert system for: {location}")
        
        # Get prediction
        prediction = await sentinel_agent.predict_surge(location)
        
        # Trigger alerts with custom threshold
        alert_result = await sentinel_agent.trigger_alerts(prediction, threshold)
        
        return {
            "test_location": location,
            "threshold_used": threshold,
            "prediction": prediction.to_dict(),
            "alert_result": alert_result,
            "test_time": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error testing alert system: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Alert system test failed: {str(e)}"
        )
