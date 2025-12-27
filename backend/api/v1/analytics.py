"""
Analytics API Endpoints
Provides system analytics and reporting
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel
from core.logging_config import logger


router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])


class MetricValue(BaseModel):
    """Metric value model"""
    timestamp: str
    value: float


class AnalyticsResponse(BaseModel):
    """Analytics response model"""
    metric_name: str
    time_range: str
    data: List[MetricValue]
    summary: Dict[str, Any]


@router.get("/dashboard")
async def get_dashboard_analytics():
    """
    Get overall system analytics for dashboard
    
    Returns:
        Dashboard analytics including key metrics
    """
    try:
        logger.info("Fetching dashboard analytics")
        
        # Generate mock analytics data
        now = datetime.now()
        
        return {
            "overview": {
                "total_patients": 1247,
                "patients_today": 42,
                "active_consultations": 8,
                "pending_prescriptions": 15,
                "surge_alerts": 2,
                "inventory_alerts": 5
            },
            "trends": {
                "patient_registrations_7d": [
                    {"date": (now - timedelta(days=i)).strftime("%Y-%m-%d"), "count": 40 + i * 2}
                    for i in range(6, -1, -1)
                ],
                "consultations_7d": [
                    {"date": (now - timedelta(days=i)).strftime("%Y-%m-%d"), "count": 15 + i}
                    for i in range(6, -1, -1)
                ],
                "prescription_compliance": 87.5,
                "average_wait_time_minutes": 12.3
            },
            "alerts": {
                "surge_predictions": [
                    {
                        "location": "Village A",
                        "risk_level": "high",
                        "predicted_cases": 45,
                        "confidence": 78
                    },
                    {
                        "location": "Village B",
                        "risk_level": "medium",
                        "predicted_cases": 23,
                        "confidence": 65
                    }
                ],
                "critical_stock": [
                    {"item": "Paracetamol", "stock": 50, "threshold": 200},
                    {"item": "ORS Packets", "stock": 0, "threshold": 100},
                    {"item": "Masks", "stock": 30, "threshold": 500}
                ]
            },
            "performance": {
                "ai_agents_status": "operational",
                "api_uptime": 99.8,
                "average_response_time_ms": 145,
                "total_ai_calls_today": 234
            },
            "generated_at": now.isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error fetching dashboard analytics: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch dashboard analytics: {str(e)}"
        )


@router.get("/patients", response_model=AnalyticsResponse)
async def get_patient_analytics(
    days: int = Query(7, description="Number of days", ge=1, le=90)
):
    """
    Get patient-related analytics
    
    Args:
        days: Number of days for analysis
        
    Returns:
        Patient analytics data
    """
    try:
        logger.info(f"Fetching patient analytics for {days} days")
        
        now = datetime.now()
        data_points = []
        
        for i in range(days - 1, -1, -1):
            date = now - timedelta(days=i)
            data_points.append(
                MetricValue(
                    timestamp=date.isoformat(),
                    value=float(35 + (i % 7) * 3)  # Mock data pattern
                )
            )
        
        return AnalyticsResponse(
            metric_name="patient_registrations",
            time_range=f"last_{days}_days",
            data=data_points,
            summary={
                "total": sum(d.value for d in data_points),
                "average_per_day": sum(d.value for d in data_points) / days,
                "peak_day": max(data_points, key=lambda x: x.value).timestamp,
                "trend": "increasing"
            }
        )
        
    except Exception as e:
        logger.error(f"Error fetching patient analytics: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch patient analytics: {str(e)}"
        )


@router.get("/consultations")
async def get_consultation_analytics(
    days: int = Query(7, description="Number of days", ge=1, le=90)
):
    """
    Get consultation analytics
    
    Args:
        days: Number of days for analysis
        
    Returns:
        Consultation analytics
    """
    try:
        logger.info(f"Fetching consultation analytics for {days} days")
        
        now = datetime.now()
        
        return {
            "time_range": f"last_{days}_days",
            "total_consultations": 156,
            "completed": 142,
            "cancelled": 8,
            "no_show": 6,
            "by_type": {
                "video": 89,
                "phone": 45,
                "in_person": 22
            },
            "by_severity": {
                "critical": 12,
                "high": 34,
                "medium": 67,
                "low": 43
            },
            "average_duration_minutes": 18.5,
            "satisfaction_score": 4.6,
            "daily_breakdown": [
                {
                    "date": (now - timedelta(days=i)).strftime("%Y-%m-%d"),
                    "count": 20 + (i % 5) * 2
                }
                for i in range(days - 1, -1, -1)
            ]
        }
        
    except Exception as e:
        logger.error(f"Error fetching consultation analytics: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch consultation analytics: {str(e)}"
        )


@router.get("/inventory")
async def get_inventory_analytics():
    """
    Get inventory analytics
    
    Returns:
        Inventory analytics and trends
    """
    try:
        logger.info("Fetching inventory analytics")
        
        return {
            "health_score": 72,
            "total_items": 45,
            "critical_items": 5,
            "out_of_stock": 2,
            "low_stock": 3,
            "optimal_stock": 35,
            "category_breakdown": {
                "medicines": {"total": 28, "critical": 3, "value_percentage": 62},
                "ppe": {"total": 8, "critical": 2, "value_percentage": 18},
                "supplies": {"total": 9, "critical": 0, "value_percentage": 20}
            },
            "reorder_activity": {
                "orders_this_month": 12,
                "orders_pending": 4,
                "orders_completed": 8,
                "auto_reorder_success_rate": 94.5
            },
            "cost_analysis": {
                "total_inventory_value": 145000,
                "monthly_consumption_value": 12500,
                "projected_stockout_date": (datetime.now() + timedelta(days=45)).strftime("%Y-%m-%d")
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching inventory analytics: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch inventory analytics: {str(e)}"
        )


@router.get("/surge")
async def get_surge_analytics(
    days: int = Query(30, description="Number of days", ge=7, le=90)
):
    """
    Get surge prediction analytics
    
    Args:
        days: Number of days for analysis
        
    Returns:
        Surge analytics and historical accuracy
    """
    try:
        logger.info(f"Fetching surge analytics for {days} days")
        
        now = datetime.now()
        
        return {
            "time_range": f"last_{days}_days",
            "predictions_made": 42,
            "accuracy_rate": 76.5,
            "false_positives": 8,
            "true_positives": 32,
            "missed_surges": 2,
            "by_severity": {
                "critical": 5,
                "high": 12,
                "medium": 18,
                "low": 7
            },
            "contributing_factors": {
                "weather": 45,
                "seasonal": 28,
                "events": 15,
                "other": 12
            },
            "response_effectiveness": {
                "alerts_sent": 42,
                "actions_taken": 38,
                "cases_prevented": 156,
                "average_response_time_hours": 3.2
            },
            "upcoming_risks": [
                {
                    "location": "District A",
                    "date": (now + timedelta(days=2)).strftime("%Y-%m-%d"),
                    "risk_level": "high",
                    "confidence": 82
                },
                {
                    "location": "District B",
                    "date": (now + timedelta(days=5)).strftime("%Y-%m-%d"),
                    "risk_level": "medium",
                    "confidence": 68
                }
            ]
        }
        
    except Exception as e:
        logger.error(f"Error fetching surge analytics: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch surge analytics: {str(e)}"
        )


@router.get("/performance")
async def get_system_performance():
    """
    Get system performance metrics
    
    Returns:
        System performance and health metrics
    """
    try:
        logger.info("Fetching system performance metrics")
        
        return {
            "uptime": {
                "percentage": 99.87,
                "last_downtime": (datetime.now() - timedelta(days=12)).isoformat(),
                "total_uptime_hours": 720
            },
            "api_metrics": {
                "total_requests_24h": 15420,
                "average_response_time_ms": 142,
                "error_rate_percentage": 0.3,
                "slowest_endpoint": "/api/v1/diagnosis/analyze",
                "fastest_endpoint": "/api/v1/patients"
            },
            "ai_agents": {
                "total_agents": 9,
                "operational": 9,
                "total_invocations_24h": 3420,
                "average_processing_time_ms": 890,
                "top_agent": "diagnostic_triage",
                "agent_breakdown": [
                    {"name": "diagnostic_triage", "calls": 1245, "avg_time_ms": 654},
                    {"name": "nutrition", "calls": 892, "avg_time_ms": 723},
                    {"name": "sentinel", "calls": 456, "avg_time_ms": 1120},
                    {"name": "telemedicine", "calls": 334, "avg_time_ms": 456}
                ]
            },
            "database": {
                "connection_pool_size": 20,
                "active_connections": 8,
                "query_performance": "optimal",
                "slow_queries_24h": 2
            },
            "storage": {
                "images_stored": 1247,
                "total_storage_mb": 2345,
                "storage_utilization_percentage": 23.4
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching system performance: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch system performance: {str(e)}"
        )
