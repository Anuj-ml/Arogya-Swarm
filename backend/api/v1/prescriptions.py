"""
Prescriptions API Endpoints
Provides prescription management for doctors
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from core.logging_config import logger


router = APIRouter(prefix="/api/v1/prescriptions", tags=["prescriptions"])


class Medication(BaseModel):
    """Medication model"""
    name: str
    dosage: str
    frequency: str
    duration: str
    instructions: Optional[str] = None


class PrescriptionCreate(BaseModel):
    """Request model for creating prescription"""
    patient_id: int
    patient_name: str
    doctor_name: str
    medications: List[Medication]
    diagnosis: str
    notes: Optional[str] = None


class PrescriptionResponse(BaseModel):
    """Response model for prescription"""
    id: int
    patient_id: int
    patient_name: str
    doctor_name: str
    medications: List[Medication]
    diagnosis: str
    notes: Optional[str]
    created_at: str
    status: str


@router.post("/", response_model=PrescriptionResponse)
async def create_prescription(prescription: PrescriptionCreate):
    """
    Create a new prescription
    
    Args:
        prescription: PrescriptionCreate with patient and medication details
        
    Returns:
        PrescriptionResponse with created prescription
    """
    try:
        logger.info(f"Creating prescription for patient {prescription.patient_name}")
        
        # Mock prescription creation
        # In production, this would save to database
        prescription_data = {
            "id": 1001,
            "patient_id": prescription.patient_id,
            "patient_name": prescription.patient_name,
            "doctor_name": prescription.doctor_name,
            "medications": [med.dict() for med in prescription.medications],
            "diagnosis": prescription.diagnosis,
            "notes": prescription.notes,
            "created_at": datetime.now().isoformat(),
            "status": "active"
        }
        
        return PrescriptionResponse(**prescription_data)
        
    except Exception as e:
        logger.error(f"Error creating prescription: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create prescription: {str(e)}"
        )


@router.get("/", response_model=List[PrescriptionResponse])
async def list_prescriptions(
    patient_id: Optional[int] = Query(None, description="Filter by patient ID"),
    doctor_name: Optional[str] = Query(None, description="Filter by doctor name"),
    status: Optional[str] = Query("active", description="Filter by status")
):
    """
    List prescriptions with optional filters
    
    Args:
        patient_id: Optional patient ID filter
        doctor_name: Optional doctor name filter
        status: Prescription status (active, completed, cancelled)
        
    Returns:
        List of prescriptions
    """
    try:
        logger.info(f"Listing prescriptions - Patient: {patient_id}, Doctor: {doctor_name}, Status: {status}")
        
        # Mock prescriptions data
        mock_prescriptions = [
            {
                "id": 1001,
                "patient_id": 101,
                "patient_name": "Ramesh Kumar",
                "doctor_name": "Dr. Sharma",
                "medications": [
                    {
                        "name": "Paracetamol 500mg",
                        "dosage": "1 tablet",
                        "frequency": "3 times daily",
                        "duration": "5 days",
                        "instructions": "Take after meals"
                    },
                    {
                        "name": "Amoxicillin 250mg",
                        "dosage": "1 capsule",
                        "frequency": "2 times daily",
                        "duration": "7 days",
                        "instructions": "Complete full course"
                    }
                ],
                "diagnosis": "Upper Respiratory Tract Infection",
                "notes": "Follow up in 7 days if symptoms persist",
                "created_at": datetime.now().isoformat(),
                "status": "active"
            },
            {
                "id": 1002,
                "patient_id": 102,
                "patient_name": "Sunita Devi",
                "doctor_name": "Dr. Patel",
                "medications": [
                    {
                        "name": "Metformin 500mg",
                        "dosage": "1 tablet",
                        "frequency": "2 times daily",
                        "duration": "30 days",
                        "instructions": "Take with meals"
                    }
                ],
                "diagnosis": "Type 2 Diabetes",
                "notes": "Monitor blood glucose levels regularly",
                "created_at": datetime.now().isoformat(),
                "status": "active"
            }
        ]
        
        # Apply filters
        filtered = mock_prescriptions
        if patient_id:
            filtered = [p for p in filtered if p["patient_id"] == patient_id]
        if doctor_name:
            filtered = [p for p in filtered if p["doctor_name"] == doctor_name]
        if status:
            filtered = [p for p in filtered if p["status"] == status]
        
        return [PrescriptionResponse(**p) for p in filtered]
        
    except Exception as e:
        logger.error(f"Error listing prescriptions: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list prescriptions: {str(e)}"
        )


@router.get("/{prescription_id}", response_model=PrescriptionResponse)
async def get_prescription(prescription_id: int):
    """
    Get a specific prescription by ID
    
    Args:
        prescription_id: Prescription ID
        
    Returns:
        PrescriptionResponse with prescription details
    """
    try:
        logger.info(f"Fetching prescription {prescription_id}")
        
        # Mock prescription data
        prescription_data = {
            "id": prescription_id,
            "patient_id": 101,
            "patient_name": "Ramesh Kumar",
            "doctor_name": "Dr. Sharma",
            "medications": [
                {
                    "name": "Paracetamol 500mg",
                    "dosage": "1 tablet",
                    "frequency": "3 times daily",
                    "duration": "5 days",
                    "instructions": "Take after meals"
                }
            ],
            "diagnosis": "Fever and body ache",
            "notes": "Rest and stay hydrated",
            "created_at": datetime.now().isoformat(),
            "status": "active"
        }
        
        return PrescriptionResponse(**prescription_data)
        
    except Exception as e:
        logger.error(f"Error fetching prescription: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch prescription: {str(e)}"
        )


@router.patch("/{prescription_id}/status")
async def update_prescription_status(
    prescription_id: int,
    status: str = Query(..., description="New status (active, completed, cancelled)")
):
    """
    Update prescription status
    
    Args:
        prescription_id: Prescription ID
        status: New status
        
    Returns:
        Updated prescription
    """
    try:
        valid_statuses = ["active", "completed", "cancelled"]
        if status not in valid_statuses:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        
        logger.info(f"Updating prescription {prescription_id} status to {status}")
        
        return {
            "id": prescription_id,
            "status": status,
            "updated_at": datetime.now().isoformat(),
            "message": f"Prescription status updated to {status}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating prescription status: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update prescription status: {str(e)}"
        )
