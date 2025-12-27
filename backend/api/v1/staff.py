"""
Staff API Endpoints
Provides staff management and allocation
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from core.logging_config import logger


router = APIRouter(prefix="/api/v1/staff", tags=["staff"])


class StaffMember(BaseModel):
    """Staff member model"""
    id: int
    name: str
    role: str
    location: str
    status: str
    phone: Optional[str] = None
    email: Optional[str] = None


class StaffAllocationRequest(BaseModel):
    """Request model for staff allocation"""
    location: str
    required_staff: int
    priority: str = "medium"
    shift: str = "morning"


@router.get("/", response_model=List[StaffMember])
async def list_staff(
    role: Optional[str] = Query(None, description="Filter by role (asha, doctor, nurse, admin)"),
    location: Optional[str] = Query(None, description="Filter by location"),
    status: Optional[str] = Query(None, description="Filter by status (active, on_leave, off_duty)")
):
    """
    List all staff members with optional filters
    
    Args:
        role: Filter by staff role
        location: Filter by location
        status: Filter by status
        
    Returns:
        List of staff members
    """
    try:
        logger.info(f"Listing staff - Role: {role}, Location: {location}, Status: {status}")
        
        # Mock staff data
        mock_staff = [
            {
                "id": 1,
                "name": "Sunita Devi",
                "role": "asha",
                "location": "Village A",
                "status": "active",
                "phone": "+91-9876543210",
                "email": "sunita@example.com"
            },
            {
                "id": 2,
                "name": "Dr. Sharma",
                "role": "doctor",
                "location": "PHC Center",
                "status": "active",
                "phone": "+91-9876543211",
                "email": "sharma@example.com"
            },
            {
                "id": 3,
                "name": "Nurse Priya",
                "role": "nurse",
                "location": "PHC Center",
                "status": "active",
                "phone": "+91-9876543212",
                "email": "priya@example.com"
            },
            {
                "id": 4,
                "name": "Ramesh Kumar",
                "role": "asha",
                "location": "Village B",
                "status": "on_leave",
                "phone": "+91-9876543213",
                "email": "ramesh@example.com"
            },
            {
                "id": 5,
                "name": "Dr. Patel",
                "role": "doctor",
                "location": "District Hospital",
                "status": "active",
                "phone": "+91-9876543214",
                "email": "patel@example.com"
            }
        ]
        
        # Apply filters
        filtered = mock_staff
        if role:
            filtered = [s for s in filtered if s["role"] == role]
        if location:
            filtered = [s for s in filtered if s["location"] == location]
        if status:
            filtered = [s for s in filtered if s["status"] == status]
        
        return [StaffMember(**s) for s in filtered]
        
    except Exception as e:
        logger.error(f"Error listing staff: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list staff: {str(e)}"
        )


@router.get("/{staff_id}", response_model=StaffMember)
async def get_staff_member(staff_id: int):
    """
    Get specific staff member details
    
    Args:
        staff_id: Staff member ID
        
    Returns:
        Staff member details
    """
    try:
        logger.info(f"Fetching staff member {staff_id}")
        
        # Mock staff data
        staff_data = {
            "id": staff_id,
            "name": "Sunita Devi",
            "role": "asha",
            "location": "Village A",
            "status": "active",
            "phone": "+91-9876543210",
            "email": "sunita@example.com"
        }
        
        return StaffMember(**staff_data)
        
    except Exception as e:
        logger.error(f"Error fetching staff member: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch staff member: {str(e)}"
        )


@router.get("/allocation/recommend")
async def recommend_staff_allocation(request: StaffAllocationRequest):
    """
    Get AI-powered staff allocation recommendations
    
    Args:
        request: StaffAllocationRequest with location and requirements
        
    Returns:
        Staff allocation recommendations
    """
    try:
        logger.info(f"Generating staff allocation recommendations for {request.location}")
        
        # Mock allocation recommendation logic
        recommendations = []
        
        if request.required_staff >= 2:
            recommendations.extend([
                {
                    "staff_id": 1,
                    "name": "Sunita Devi",
                    "role": "asha",
                    "current_location": "Village A",
                    "availability": "available",
                    "distance_km": 2.5,
                    "recommendation_score": 95,
                    "reason": "High experience, nearby location"
                },
                {
                    "staff_id": 3,
                    "name": "Nurse Priya",
                    "role": "nurse",
                    "current_location": "PHC Center",
                    "availability": "available",
                    "distance_km": 5.0,
                    "recommendation_score": 88,
                    "reason": "Medical expertise, willing to travel"
                }
            ])
        
        return {
            "location": request.location,
            "required_staff": request.required_staff,
            "priority": request.priority,
            "shift": request.shift,
            "recommendations": recommendations[:request.required_staff],
            "alternative_options": recommendations[request.required_staff:] if len(recommendations) > request.required_staff else [],
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating allocation recommendations: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate allocation recommendations: {str(e)}"
        )


@router.get("/availability/summary")
async def get_availability_summary():
    """
    Get overall staff availability summary
    
    Returns:
        Staff availability statistics
    """
    try:
        logger.info("Fetching staff availability summary")
        
        return {
            "total_staff": 45,
            "by_role": {
                "asha": {"total": 20, "available": 18, "on_leave": 2},
                "doctor": {"total": 8, "available": 7, "on_leave": 1},
                "nurse": {"total": 12, "available": 11, "on_leave": 1},
                "admin": {"total": 5, "available": 5, "on_leave": 0}
            },
            "by_location": {
                "Village A": 5,
                "Village B": 4,
                "PHC Center": 15,
                "District Hospital": 18,
                "Mobile Unit": 3
            },
            "by_shift": {
                "morning": 25,
                "evening": 15,
                "night": 5
            },
            "alerts": [
                {
                    "type": "understaffed",
                    "location": "Village B",
                    "severity": "medium",
                    "message": "Only 1 ASHA worker available, recommended: 2"
                },
                {
                    "type": "leave_request",
                    "staff_id": 4,
                    "name": "Ramesh Kumar",
                    "duration": "3 days",
                    "requires_replacement": True
                }
            ],
            "checked_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error fetching availability summary: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch availability summary: {str(e)}"
        )


@router.patch("/{staff_id}/status")
async def update_staff_status(
    staff_id: int,
    status: str = Query(..., description="New status (active, on_leave, off_duty)")
):
    """
    Update staff member status
    
    Args:
        staff_id: Staff member ID
        status: New status
        
    Returns:
        Updated status confirmation
    """
    try:
        valid_statuses = ["active", "on_leave", "off_duty"]
        if status not in valid_statuses:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        
        logger.info(f"Updating staff {staff_id} status to {status}")
        
        return {
            "staff_id": staff_id,
            "status": status,
            "updated_at": datetime.now().isoformat(),
            "message": f"Staff status updated to {status}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating staff status: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update staff status: {str(e)}"
        )
