"""
Telemedicine API Endpoints
Provides access to Telemedicine Orchestrator for consultations and bookings
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from core.logging_config import logger
from agents.telemedicine_orchestrator import telemedicine_orchestrator


router = APIRouter(prefix="/api/v1/telemedicine", tags=["telemedicine"])


# Request/Response Models
class BookingRequest(BaseModel):
    """Request model for booking consultation"""
    patient_id: int
    patient_name: str
    doctor_name: str
    scheduled_time: str  # ISO format datetime string
    call_type: str = "video"
    duration_minutes: int = 15


class PaymentVerificationRequest(BaseModel):
    """Request model for payment verification"""
    booking_id: int
    order_id: str
    payment_id: str
    signature: str


@router.post("/book")
async def book_consultation(request: BookingRequest):
    """
    Book a telemedicine consultation
    
    Args:
        request: BookingRequest with patient and doctor details
        
    Returns:
        Booking details including meeting link and payment order
    """
    try:
        logger.info(f"Booking consultation for patient {request.patient_name}")
        
        # Parse scheduled time
        scheduled_time = datetime.fromisoformat(request.scheduled_time.replace('Z', '+00:00'))
        
        # Create booking
        booking = await telemedicine_orchestrator.book_consultation(
            patient_id=request.patient_id,
            patient_name=request.patient_name,
            doctor_name=request.doctor_name,
            scheduled_time=scheduled_time,
            call_type=request.call_type,
            duration_minutes=request.duration_minutes
        )
        
        return {
            "status": "success",
            "booking": booking.to_dict(),
            "message": "Consultation booked successfully. Please complete payment."
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error booking consultation: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to book consultation: {str(e)}"
        )


@router.get("/bookings")
async def get_bookings(
    patient_id: Optional[int] = Query(None, description="Filter by patient ID"),
    doctor_name: Optional[str] = Query(None, description="Filter by doctor name"),
    status: Optional[str] = Query(None, description="Filter by status")
):
    """
    Get telemedicine bookings with optional filters
    
    Args:
        patient_id: Optional patient ID filter
        doctor_name: Optional doctor name filter
        status: Optional status filter
        
    Returns:
        List of bookings
    """
    try:
        logger.info(f"Fetching bookings - Patient: {patient_id}, Doctor: {doctor_name}, Status: {status}")
        
        # Mock bookings data
        # In production, this would query the telemedicine_bookings table
        mock_bookings = [
            {
                "booking_id": 12345,
                "patient_id": 1,
                "patient_name": "Sunita Devi",
                "doctor_name": "Dr. Priya Sharma",
                "doctor_specialization": "General Physician",
                "scheduled_time": "2024-12-27T10:00:00",
                "call_type": "video",
                "duration_minutes": 15,
                "amount": 200,
                "status": "confirmed",
                "meeting_link": "https://meet.jit.si/arogya-1-1735286400-abc123"
            },
            {
                "booking_id": 12346,
                "patient_id": 2,
                "patient_name": "Ramesh Kumar",
                "doctor_name": "Dr. Rajesh Kumar",
                "doctor_specialization": "Pediatrician",
                "scheduled_time": "2024-12-27T14:30:00",
                "call_type": "video",
                "duration_minutes": 15,
                "amount": 250,
                "status": "pending_payment",
                "meeting_link": None
            }
        ]
        
        # Apply filters
        filtered_bookings = mock_bookings
        
        if patient_id is not None:
            filtered_bookings = [b for b in filtered_bookings if b["patient_id"] == patient_id]
        
        if doctor_name:
            filtered_bookings = [b for b in filtered_bookings if b["doctor_name"] == doctor_name]
        
        if status:
            filtered_bookings = [b for b in filtered_bookings if b["status"] == status]
        
        return {
            "bookings": filtered_bookings,
            "total": len(filtered_bookings)
        }
        
    except Exception as e:
        logger.error(f"Error fetching bookings: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch bookings: {str(e)}"
        )


@router.post("/payment/verify")
async def verify_payment(request: PaymentVerificationRequest):
    """
    Verify payment for a booking
    
    Args:
        request: PaymentVerificationRequest with payment details
        
    Returns:
        Payment verification result
    """
    try:
        logger.info(f"Verifying payment for booking {request.booking_id}")
        
        result = await telemedicine_orchestrator.process_payment(
            booking_id=request.booking_id,
            order_id=request.order_id,
            payment_id=request.payment_id,
            signature=request.signature
        )
        
        if result["status"] == "failed":
            raise HTTPException(status_code=400, detail=result["message"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying payment: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Payment verification failed: {str(e)}"
        )


@router.get("/summary/{patient_id}")
async def get_case_summary(patient_id: int):
    """
    Get AI-generated case summary for a patient
    
    Args:
        patient_id: Patient ID
        
    Returns:
        Case summary text
    """
    try:
        logger.info(f"Generating case summary for patient {patient_id}")
        
        summary = await telemedicine_orchestrator.generate_case_summary(
            patient_id=patient_id
        )
        
        return {
            "patient_id": patient_id,
            "summary": summary,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating case summary: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate case summary: {str(e)}"
        )


@router.get("/doctors")
async def get_doctors():
    """
    Get list of available doctors
    
    Returns:
        List of doctors with specializations and fees
    """
    try:
        doctors = telemedicine_orchestrator.get_doctors_list()
        
        return {
            "doctors": doctors,
            "total": len(doctors)
        }
        
    except Exception as e:
        logger.error(f"Error fetching doctors list: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch doctors list: {str(e)}"
        )


@router.get("/slots")
async def get_available_slots(
    doctor_name: str = Query(..., description="Doctor name"),
    date: str = Query(..., description="Date in YYYY-MM-DD format")
):
    """
    Get available time slots for a doctor
    
    Args:
        doctor_name: Doctor name
        date: Date string in YYYY-MM-DD format
        
    Returns:
        List of available time slots
    """
    try:
        # Parse date
        target_date = datetime.fromisoformat(date)
        
        slots = await telemedicine_orchestrator.get_available_slots(
            doctor_name=doctor_name,
            date=target_date
        )
        
        return {
            "doctor_name": doctor_name,
            "date": date,
            "available_slots": slots,
            "total_slots": len(slots)
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
    except Exception as e:
        logger.error(f"Error fetching available slots: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch available slots: {str(e)}"
        )
