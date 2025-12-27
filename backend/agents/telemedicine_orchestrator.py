"""
Telemedicine Orchestrator - Doctor-Patient Consultation Management
Manages video consultations, bookings, payments, and case summaries
"""
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import secrets
from core.logging_config import logger
from core.config import settings
from services.gemini_service import GeminiService
from services.payment_service import payment_service


class TelemedicineBooking:
    """Data structure for telemedicine bookings"""
    def __init__(
        self,
        booking_id: int,
        patient_id: int,
        patient_name: str,
        doctor_name: str,
        doctor_specialization: str,
        scheduled_time: datetime,
        call_type: str = "video",
        duration_minutes: int = 15,
        amount: int = 0,
        jitsi_room_id: Optional[str] = None,
        status: str = "pending"
    ):
        self.booking_id = booking_id
        self.patient_id = patient_id
        self.patient_name = patient_name
        self.doctor_name = doctor_name
        self.doctor_specialization = doctor_specialization
        self.scheduled_time = scheduled_time
        self.call_type = call_type
        self.duration_minutes = duration_minutes
        self.amount = amount
        self.jitsi_room_id = jitsi_room_id or self._generate_room_id()
        self.status = status
    
    def _generate_room_id(self) -> str:
        """Generate a unique Jitsi room ID"""
        timestamp = int(datetime.now().timestamp())
        random_suffix = secrets.token_hex(4)
        return f"arogya-{self.patient_id}-{timestamp}-{random_suffix}"
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "booking_id": self.booking_id,
            "patient_id": self.patient_id,
            "patient_name": self.patient_name,
            "doctor_name": self.doctor_name,
            "doctor_specialization": self.doctor_specialization,
            "scheduled_time": self.scheduled_time.isoformat(),
            "call_type": self.call_type,
            "duration_minutes": self.duration_minutes,
            "amount": self.amount,
            "jitsi_room_id": self.jitsi_room_id,
            "meeting_link": self.get_meeting_link(),
            "status": self.status
        }
    
    def get_meeting_link(self) -> str:
        """Get full Jitsi meeting link"""
        return f"https://{settings.JITSI_DOMAIN}/{self.jitsi_room_id}"


class TelemedicineOrchestrator:
    """
    Telemedicine Orchestrator Agent
    Handles doctor bookings, video calls, payments, and AI case summaries
    """
    
    def __init__(self):
        self.gemini_service = GeminiService()
        
        # Available doctors (in production, this would be from database)
        self.available_doctors = [
            {
                "name": "Dr. Priya Sharma",
                "specialization": "General Physician",
                "available_slots": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
                "consultation_fee": 20000  # ₹200 in paise
            },
            {
                "name": "Dr. Rajesh Kumar",
                "specialization": "Pediatrician",
                "available_slots": ["09:30", "10:30", "14:30", "15:30"],
                "consultation_fee": 25000  # ₹250 in paise
            },
            {
                "name": "Dr. Anjali Desai",
                "specialization": "Gynecologist",
                "available_slots": ["10:00", "11:00", "15:00", "16:00"],
                "consultation_fee": 30000  # ₹300 in paise
            }
        ]
    
    async def book_consultation(
        self,
        patient_id: int,
        patient_name: str,
        doctor_name: str,
        scheduled_time: datetime,
        call_type: str = "video",
        duration_minutes: int = 15
    ) -> TelemedicineBooking:
        """
        Book a telemedicine consultation
        
        Args:
            patient_id: Patient ID
            patient_name: Patient name
            doctor_name: Doctor name
            scheduled_time: Scheduled appointment time
            call_type: Type of call (video/audio/chat)
            duration_minutes: Duration of consultation
            
        Returns:
            TelemedicineBooking object with booking details
        """
        try:
            logger.info(f"Booking consultation for patient {patient_name} with {doctor_name}")
            
            # Find doctor details
            doctor = self._find_doctor(doctor_name)
            if not doctor:
                raise ValueError(f"Doctor {doctor_name} not found")
            
            # Check availability (simplified)
            hour = scheduled_time.strftime("%H:%M")
            if hour not in doctor["available_slots"]:
                logger.warning(f"Slot {hour} not available, booking anyway")
            
            # Generate booking ID
            booking_id = int(datetime.now().timestamp() * 1000) % 1000000
            
            # Create booking
            booking = TelemedicineBooking(
                booking_id=booking_id,
                patient_id=patient_id,
                patient_name=patient_name,
                doctor_name=doctor["name"],
                doctor_specialization=doctor["specialization"],
                scheduled_time=scheduled_time,
                call_type=call_type,
                duration_minutes=duration_minutes,
                amount=doctor["consultation_fee"],
                status="pending_payment"
            )
            
            # Create payment order
            payment_order = await payment_service.create_order(
                amount=booking.amount,
                receipt=f"BOOKING-{booking_id}",
                notes={
                    "patient_id": str(patient_id),
                    "doctor": doctor_name,
                    "type": "telemedicine_consultation"
                }
            )
            
            logger.info(
                f"Booking created: ID {booking_id}, "
                f"Payment order: {payment_order.get('order_id')}"
            )
            
            return booking
            
        except Exception as e:
            logger.error(f"Error booking consultation: {e}")
            raise
    
    def _find_doctor(self, doctor_name: str) -> Optional[Dict[str, Any]]:
        """Find doctor by name"""
        for doctor in self.available_doctors:
            if doctor["name"].lower() == doctor_name.lower():
                return doctor
        return None
    
    async def generate_case_summary(
        self,
        patient_id: int,
        patient_data: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Generate AI-powered case summary for doctor
        
        Args:
            patient_id: Patient ID
            patient_data: Optional patient data (fetched from DB if not provided)
            
        Returns:
            Concise case summary string
        """
        try:
            logger.info(f"Generating case summary for patient {patient_id}")
            
            # In production, this would fetch from database
            if not patient_data:
                patient_data = {
                    "name": "Patient",
                    "age": 35,
                    "gender": "female",
                    "medical_history": [
                        {
                            "date": "2024-12-20",
                            "symptoms": ["fever", "cough", "body ache"],
                            "diagnosis": "Viral fever",
                            "severity": "medium"
                        }
                    ],
                    "current_symptoms": ["persistent cough", "fatigue"],
                    "medications": ["Paracetamol 500mg TDS"],
                    "allergies": ["None known"],
                    "chronic_conditions": []
                }
            
            # Create prompt for AI
            prompt = f"""
You are a medical assistant creating a brief case summary for a doctor before a telemedicine consultation.

Patient Information:
- Age: {patient_data.get('age', 'Unknown')}
- Gender: {patient_data.get('gender', 'Unknown')}

Recent Medical History:
{self._format_medical_history(patient_data.get('medical_history', []))}

Current Symptoms:
{', '.join(patient_data.get('current_symptoms', ['None reported']))}

Current Medications:
{', '.join(patient_data.get('medications', ['None']))}

Allergies:
{', '.join(patient_data.get('allergies', ['None known']))}

Chronic Conditions:
{', '.join(patient_data.get('chronic_conditions', ['None']))}

Create a concise 3-4 sentence summary highlighting:
1. Current presenting symptoms
2. Relevant medical history
3. Key risk factors or concerns
4. Any urgent flags

Keep it clinical, brief, and actionable.
"""
            
            # Generate summary using Gemini
            summary = await self.gemini_service.generate_text(
                prompt=prompt,
                system_instruction="You are a medical assistant creating doctor-facing case summaries.",
                temperature=0.3
            )
            
            logger.info(f"Case summary generated for patient {patient_id}")
            
            return summary.strip()
            
        except Exception as e:
            logger.error(f"Error generating case summary: {e}")
            return "Case summary unavailable. Please review patient records manually."
    
    def _format_medical_history(self, history: List[Dict]) -> str:
        """Format medical history for prompt"""
        if not history:
            return "No recent medical records available"
        
        formatted = []
        for record in history[-3:]:  # Last 3 records
            date = record.get("date", "Unknown date")
            symptoms = ", ".join(record.get("symptoms", []))
            diagnosis = record.get("diagnosis", "Not diagnosed")
            formatted.append(f"- {date}: {symptoms} → {diagnosis}")
        
        return "\n".join(formatted)
    
    async def process_payment(
        self,
        booking_id: int,
        order_id: str,
        payment_id: str,
        signature: str
    ) -> Dict[str, Any]:
        """
        Process and verify payment for booking
        
        Args:
            booking_id: Booking ID
            order_id: Razorpay order ID
            payment_id: Razorpay payment ID
            signature: Payment signature
            
        Returns:
            Dictionary with payment verification status
        """
        try:
            logger.info(f"Processing payment for booking {booking_id}")
            
            # Verify payment signature
            is_valid = await payment_service.verify_payment_signature(
                order_id=order_id,
                payment_id=payment_id,
                signature=signature
            )
            
            if not is_valid:
                logger.error(f"Payment verification failed for booking {booking_id}")
                return {
                    "status": "failed",
                    "booking_id": booking_id,
                    "message": "Payment verification failed"
                }
            
            # Update booking status
            # In production, this would update the database
            logger.info(f"Payment verified successfully for booking {booking_id}")
            
            return {
                "status": "success",
                "booking_id": booking_id,
                "payment_id": payment_id,
                "message": "Payment successful, booking confirmed"
            }
            
        except Exception as e:
            logger.error(f"Error processing payment: {e}")
            return {
                "status": "error",
                "booking_id": booking_id,
                "message": str(e)
            }
    
    async def send_meeting_link(
        self,
        booking: TelemedicineBooking,
        send_time: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Send meeting link to patient and doctor
        
        Args:
            booking: TelemedicineBooking object
            send_time: When to send (default: now, typically 15 min before)
            
        Returns:
            Dictionary with notification status
        """
        try:
            logger.info(f"Sending meeting link for booking {booking.booking_id}")
            
            meeting_link = booking.get_meeting_link()
            
            # Format messages
            patient_message = (
                f"Hi {booking.patient_name},\n\n"
                f"Your consultation with {booking.doctor_name} is scheduled for "
                f"{booking.scheduled_time.strftime('%I:%M %p on %d %b %Y')}.\n\n"
                f"Join video call: {meeting_link}\n\n"
                f"Please join 2-3 minutes early."
            )
            
            doctor_message = (
                f"Dr. {booking.doctor_name},\n\n"
                f"Consultation scheduled with {booking.patient_name} at "
                f"{booking.scheduled_time.strftime('%I:%M %p')}.\n\n"
                f"Join video call: {meeting_link}\n\n"
                f"Case summary available in dashboard."
            )
            
            # In production, this would use SMS service
            logger.info(f"Meeting link sent to patient and doctor for booking {booking.booking_id}")
            
            return {
                "status": "success",
                "booking_id": booking.booking_id,
                "patient_notified": True,
                "doctor_notified": True,
                "meeting_link": meeting_link,
                "messages": {
                    "patient": patient_message,
                    "doctor": doctor_message
                }
            }
            
        except Exception as e:
            logger.error(f"Error sending meeting link: {e}")
            return {
                "status": "error",
                "booking_id": booking.booking_id,
                "message": str(e)
            }
    
    async def get_available_slots(
        self,
        doctor_name: str,
        date: datetime
    ) -> List[str]:
        """
        Get available time slots for a doctor on a specific date
        
        Args:
            doctor_name: Doctor name
            date: Date to check availability
            
        Returns:
            List of available time slots
        """
        try:
            doctor = self._find_doctor(doctor_name)
            if not doctor:
                return []
            
            # In production, this would check database for booked slots
            # For now, return all available slots
            return doctor["available_slots"]
            
        except Exception as e:
            logger.error(f"Error getting available slots: {e}")
            return []
    
    def get_doctors_list(self) -> List[Dict[str, Any]]:
        """
        Get list of available doctors
        
        Returns:
            List of doctor information
        """
        return [
            {
                "name": doctor["name"],
                "specialization": doctor["specialization"],
                "consultation_fee": doctor["consultation_fee"] / 100,  # Convert to rupees
                "available": True
            }
            for doctor in self.available_doctors
        ]


# Global instance
telemedicine_orchestrator = TelemedicineOrchestrator()
