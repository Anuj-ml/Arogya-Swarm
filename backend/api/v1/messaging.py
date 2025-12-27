"""
Messaging API Endpoints
Provides access to Communication Agent for SMS and notifications
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from pydantic import BaseModel
from core.logging_config import logger
from agents.communication_agent import communication_agent


router = APIRouter(prefix="/api/v1/messaging", tags=["messaging"])


# Request Models
class SMSRequest(BaseModel):
    """Request model for sending SMS"""
    phone: str
    message: str
    language: str = "en"


class BroadcastRequest(BaseModel):
    """Request model for broadcast messaging"""
    village: Optional[str] = None
    target_audience: str  # "asha_workers", "admins", "all_patients"
    message: str
    language: str = "hi"


@router.post("/send-sms")
async def send_sms(request: SMSRequest):
    """
    Send SMS to a phone number
    
    Args:
        request: SMSRequest with phone, message, and language
        
    Returns:
        Delivery status
    """
    try:
        logger.info(f"Sending SMS to {request.phone}")
        
        result = await communication_agent.send_sms(
            phone=request.phone,
            message=request.message,
            language=request.language
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Error sending SMS: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send SMS: {str(e)}"
        )


@router.post("/reminder/appointment")
async def send_appointment_reminder(
    booking_id: int,
    patient_phone: str,
    patient_language: str,
    doctor_name: str,
    appointment_time: str,
    meeting_link: str
):
    """
    Send appointment reminder
    
    Args:
        booking_id: Booking ID
        patient_phone: Patient phone number
        patient_language: Patient's preferred language
        doctor_name: Doctor name
        appointment_time: Appointment time string
        meeting_link: Video meeting link
        
    Returns:
        Delivery status
    """
    try:
        result = await communication_agent.send_appointment_reminder(
            booking_id=booking_id,
            patient_phone=patient_phone,
            patient_language=patient_language,
            doctor_name=doctor_name,
            appointment_time=appointment_time,
            meeting_link=meeting_link
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Error sending appointment reminder: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send reminder: {str(e)}"
        )


@router.post("/reminder/medication")
async def send_medication_reminder(
    patient_id: int,
    patient_phone: str,
    patient_language: str,
    medication: str
):
    """
    Send medication reminder
    
    Args:
        patient_id: Patient ID
        patient_phone: Patient phone number
        patient_language: Patient's preferred language
        medication: Medication name
        
    Returns:
        Delivery status
    """
    try:
        result = await communication_agent.send_medication_reminder(
            patient_id=patient_id,
            patient_phone=patient_phone,
            patient_language=patient_language,
            medication=medication
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Error sending medication reminder: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send reminder: {str(e)}"
        )


@router.post("/broadcast")
async def broadcast_message(request: BroadcastRequest):
    """
    Broadcast message to a group
    
    Args:
        request: BroadcastRequest with target audience and message
        
    Returns:
        Broadcast status
    """
    try:
        logger.info(f"Broadcasting message to {request.target_audience}")
        
        if request.village:
            # Broadcast to village
            result = await communication_agent.send_health_tip(
                village=request.village,
                tip_category="general",
                tip_message=request.message,
                language=request.language
            )
        else:
            # Broadcast to audience
            result = await communication_agent.send_surge_alert(
                target_audience=request.target_audience,
                alert_message=request.message,
                urgency="medium"
            )
        
        return result
        
    except Exception as e:
        logger.error(f"Error broadcasting message: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to broadcast message: {str(e)}"
        )


@router.get("/logs")
async def get_message_logs(
    phone: Optional[str] = Query(None, description="Filter by phone number"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of logs")
):
    """
    Get message logs
    
    Args:
        phone: Optional phone number filter
        limit: Maximum number of logs to return
        
    Returns:
        List of message logs
    """
    try:
        logs = await communication_agent.get_message_logs(
            phone=phone,
            limit=limit
        )
        
        return {
            "logs": logs,
            "total": len(logs),
            "phone_filter": phone
        }
        
    except Exception as e:
        logger.error(f"Error fetching message logs: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch message logs: {str(e)}"
        )
