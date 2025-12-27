"""
Inventory and Logistics API Endpoints
Provides access to Logistics Agent for stock management and routing
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from core.logging_config import logger
from agents.logistics_agent import logistics_agent


router = APIRouter(prefix="/api/v1/inventory", tags=["inventory"])


# Request/Response Models
class InventoryItem(BaseModel):
    """Inventory item model"""
    id: int
    item_name: str
    category: str
    current_stock: int
    threshold: int
    unit: str = "units"
    auto_reorder_enabled: bool = True
    supplier: Optional[str] = None


class ReorderRequest(BaseModel):
    """Request model for manual reorder"""
    item_id: int
    item_name: str
    quantity: int
    supplier: Optional[str] = None


class RouteOptimizationRequest(BaseModel):
    """Request model for route optimization"""
    origin: str
    destinations: List[str]
    vehicle_type: str = "car"


class AmbulanceDispatchRequest(BaseModel):
    """Request model for ambulance dispatch"""
    patient_location: str
    patient_name: str
    severity: str
    hospital: str
    ambulance_id: Optional[str] = None


@router.get("/critical")
async def get_critical_stock():
    """
    Get all inventory items with critical stock levels
    
    Returns:
        List of items below threshold with alerts
    """
    try:
        logger.info("Fetching critical stock items")
        
        # Mock inventory data for demonstration
        # In production, this would query the inventory table
        mock_inventory = [
            {
                "id": 1,
                "item_name": "Paracetamol 500mg",
                "category": "medicine",
                "current_stock": 50,
                "threshold": 200,
                "unit": "tablets",
                "auto_reorder_enabled": True,
                "supplier": "MediSupply Co."
            },
            {
                "id": 2,
                "item_name": "ORS Packets",
                "category": "medicine",
                "current_stock": 0,
                "threshold": 100,
                "unit": "packets",
                "auto_reorder_enabled": True,
                "supplier": "HealthCare Supplies"
            },
            {
                "id": 3,
                "item_name": "Surgical Masks",
                "category": "ppe",
                "current_stock": 30,
                "threshold": 500,
                "unit": "pieces",
                "auto_reorder_enabled": True,
                "supplier": "SafetyFirst Ltd."
            },
            {
                "id": 4,
                "item_name": "Insulin Vials",
                "category": "medicine",
                "current_stock": 5,
                "threshold": 20,
                "unit": "vials",
                "auto_reorder_enabled": True,
                "supplier": "PharmaCare"
            }
        ]
        
        # Monitor stock levels
        alerts = await logistics_agent.monitor_stock_levels(mock_inventory)
        
        # Get inventory summary
        summary = await logistics_agent.get_inventory_summary(mock_inventory)
        
        return {
            "summary": summary,
            "critical_items": [alert.to_dict() for alert in alerts],
            "total_alerts": len(alerts),
            "checked_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error fetching critical stock: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch critical stock: {str(e)}"
        )


@router.post("/reorder")
async def create_reorder(request: ReorderRequest):
    """
    Create a reorder request for an item
    
    Args:
        request: ReorderRequest with item details
        
    Returns:
        Reorder details and status
    """
    try:
        logger.info(f"Creating reorder for: {request.item_name}")
        
        # Process reorder through logistics agent
        result = await logistics_agent.auto_reorder(
            item_id=request.item_id,
            item_name=request.item_name,
            quantity=request.quantity,
            supplier=request.supplier,
            auto_reorder_enabled=True
        )
        
        return {
            "reorder": result,
            "message": f"Reorder created for {request.item_name}",
            "created_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error creating reorder: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create reorder: {str(e)}"
        )


@router.get("/summary")
async def get_inventory_summary():
    """
    Get overall inventory health summary
    
    Returns:
        Summary statistics and health score
    """
    try:
        logger.info("Generating inventory summary")
        
        # Mock inventory data
        mock_inventory = [
            {"id": 1, "item_name": "Paracetamol", "category": "medicine", "current_stock": 50, "threshold": 200},
            {"id": 2, "item_name": "ORS", "category": "medicine", "current_stock": 0, "threshold": 100},
            {"id": 3, "item_name": "Masks", "category": "ppe", "current_stock": 30, "threshold": 500},
            {"id": 4, "item_name": "Insulin", "category": "medicine", "current_stock": 5, "threshold": 20},
            {"id": 5, "item_name": "Bandages", "category": "supplies", "current_stock": 150, "threshold": 100},
            {"id": 6, "item_name": "Gloves", "category": "ppe", "current_stock": 800, "threshold": 500},
        ]
        
        summary = await logistics_agent.get_inventory_summary(mock_inventory)
        
        return summary
        
    except Exception as e:
        logger.error(f"Error generating summary: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate summary: {str(e)}"
        )


@router.post("/route-optimize")
async def optimize_delivery_route(request: RouteOptimizationRequest):
    """
    Optimize delivery route for multiple destinations
    
    Args:
        request: RouteOptimizationRequest with origin and destinations
        
    Returns:
        Optimized route with distance and time estimates
    """
    try:
        logger.info(f"Optimizing route from {request.origin} to {len(request.destinations)} destinations")
        
        # Get optimized route from logistics agent
        result = await logistics_agent.optimize_route(
            origin=request.origin,
            destinations=request.destinations,
            vehicle_type=request.vehicle_type
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Error optimizing route: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to optimize route: {str(e)}"
        )


@router.post("/ambulance-dispatch")
async def dispatch_ambulance(request: AmbulanceDispatchRequest):
    """
    Dispatch ambulance for patient transport
    
    Args:
        request: AmbulanceDispatchRequest with patient and location details
        
    Returns:
        Dispatch confirmation with ETA
    """
    try:
        logger.info(f"Dispatching ambulance for patient: {request.patient_name}")
        
        # Validate severity
        valid_severities = ["low", "medium", "high", "critical"]
        if request.severity.lower() not in valid_severities:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid severity. Must be one of: {', '.join(valid_severities)}"
            )
        
        # Dispatch through logistics agent
        result = await logistics_agent.dispatch_ambulance(
            patient_location=request.patient_location,
            patient_name=request.patient_name,
            severity=request.severity,
            hospital=request.hospital,
            ambulance_id=request.ambulance_id
        )
        
        if result.get("status") == "error":
            raise HTTPException(status_code=500, detail=result.get("error"))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error dispatching ambulance: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to dispatch ambulance: {str(e)}"
        )


@router.get("/items")
async def list_inventory_items(
    category: Optional[str] = Query(None, description="Filter by category"),
    low_stock_only: bool = Query(False, description="Show only low stock items")
):
    """
    List all inventory items with optional filters
    
    Args:
        category: Optional category filter
        low_stock_only: Show only items below threshold
        
    Returns:
        List of inventory items
    """
    try:
        logger.info(f"Listing inventory items - Category: {category}, Low stock: {low_stock_only}")
        
        # Mock inventory data
        mock_inventory = [
            {"id": 1, "item_name": "Paracetamol 500mg", "category": "medicine", "current_stock": 50, "threshold": 200, "unit": "tablets"},
            {"id": 2, "item_name": "ORS Packets", "category": "medicine", "current_stock": 0, "threshold": 100, "unit": "packets"},
            {"id": 3, "item_name": "Surgical Masks", "category": "ppe", "current_stock": 30, "threshold": 500, "unit": "pieces"},
            {"id": 4, "item_name": "Insulin Vials", "category": "medicine", "current_stock": 5, "threshold": 20, "unit": "vials"},
            {"id": 5, "item_name": "Bandages", "category": "supplies", "current_stock": 150, "threshold": 100, "unit": "rolls"},
            {"id": 6, "item_name": "Gloves", "category": "ppe", "current_stock": 800, "threshold": 500, "unit": "pairs"},
        ]
        
        # Apply filters
        filtered_items = mock_inventory
        
        if category:
            filtered_items = [item for item in filtered_items if item["category"] == category]
        
        if low_stock_only:
            filtered_items = [item for item in filtered_items if item["current_stock"] < item["threshold"]]
        
        return {
            "items": filtered_items,
            "total": len(filtered_items),
            "filters_applied": {
                "category": category,
                "low_stock_only": low_stock_only
            }
        }
        
    except Exception as e:
        logger.error(f"Error listing inventory items: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list inventory items: {str(e)}"
        )
