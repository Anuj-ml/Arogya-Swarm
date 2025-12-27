"""
Communication Agent - Multilingual SMS/WhatsApp Messaging
Handles automated notifications, reminders, and broadcasts
"""
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from core.logging_config import logger
from services.messaging_service import messaging_service
from services.translation_service import translation_service


class CommunicationAgent:
    """
    Communication Agent for SMS/WhatsApp notifications
    Supports multilingual messages and automated reminders
    """
    
    def __init__(self):
        # Message templates
        self.templates = {
            "appointment_reminder": {
                "en": "Reminder: You have a doctor appointment tomorrow at {time} with {doctor}. Meeting link: {link}",
                "hi": "अनुस्मारक: कल {time} बजे {doctor} के साथ डॉक्टर की नियुक्ति है। मीटिंग लिंक: {link}",
            },
            "medication_reminder": {
                "en": "Reminder: Take your medication {medication} as prescribed.",
                "hi": "अनुस्मारक: निर्धारित अनुसार अपनी दवा {medication} लें।",
            },
            "surge_alert": {
                "en": "ALERT: Disease surge predicted in your area. Take necessary precautions. Contact PHC for guidance.",
                "hi": "चेतावनी: आपके क्षेत्र में बीमारी बढ़ने की भविष्यवाणी। आवश्यक सावधानी बरतें। मार्गदर्शन के लिए PHC से संपर्क करें।",
            },
            "test_result": {
                "en": "Your test results are ready. Please contact {facility} to collect them.",
                "hi": "आपके परीक्षण परिणाम तैयार हैं। कृपया {facility} से संपर्क करें।",
            }
        }
    
    async def send_sms(
        self,
        phone: str,
        message: str,
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Send SMS with optional translation
        
        Args:
            phone: Phone number
            message: Message text
            language: Target language code
            
        Returns:
            Delivery status
        """
        try:
            logger.info(f"Sending SMS to {phone} in language {language}")
            
            # Translate if needed
            if language != "en":
                try:
                    translated = await translation_service.translate_text(
                        text=message,
                        source_lang="en",
                        target_lang=language
                    )
                    message = translated
                except Exception as e:
                    logger.warning(f"Translation failed: {e}, sending in English")
            
            # Send via messaging service
            result = await messaging_service.send_sms_via_msg91(
                phone=phone,
                message=message
            )
            
            # Log to database
            # In production, this would insert into sms_logs table
            logger.info(f"SMS sent: Status={result['status']}")
            
            return {
                "status": result["status"],
                "phone": phone,
                "message": message,
                "language": language,
                "message_id": result.get("message_id"),
                "sent_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error sending SMS: {e}")
            return {
                "status": "failed",
                "phone": phone,
                "error": str(e)
            }
    
    async def send_appointment_reminder(
        self,
        booking_id: int,
        patient_phone: str,
        patient_language: str,
        doctor_name: str,
        appointment_time: str,
        meeting_link: str
    ) -> Dict[str, Any]:
        """
        Send appointment reminder 24 hours before
        
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
            logger.info(f"Sending appointment reminder for booking {booking_id}")
            
            # Get template
            template = self.templates["appointment_reminder"].get(
                patient_language,
                self.templates["appointment_reminder"]["en"]
            )
            
            # Format message
            message = template.format(
                time=appointment_time,
                doctor=doctor_name,
                link=meeting_link
            )
            
            # Send SMS
            result = await self.send_sms(
                phone=patient_phone,
                message=message,
                language=patient_language
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Error sending appointment reminder: {e}")
            return {
                "status": "failed",
                "booking_id": booking_id,
                "error": str(e)
            }
    
    async def send_medication_reminder(
        self,
        patient_id: int,
        patient_phone: str,
        patient_language: str,
        medication: str
    ) -> Dict[str, Any]:
        """
        Send medication adherence reminder
        
        Args:
            patient_id: Patient ID
            patient_phone: Patient phone number
            patient_language: Patient's preferred language
            medication: Medication name
            
        Returns:
            Delivery status
        """
        try:
            logger.info(f"Sending medication reminder for patient {patient_id}")
            
            # Get template
            template = self.templates["medication_reminder"].get(
                patient_language,
                self.templates["medication_reminder"]["en"]
            )
            
            # Format message
            message = template.format(medication=medication)
            
            # Send SMS
            result = await self.send_sms(
                phone=patient_phone,
                message=message,
                language=patient_language
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Error sending medication reminder: {e}")
            return {
                "status": "failed",
                "patient_id": patient_id,
                "error": str(e)
            }
    
    async def send_health_tip(
        self,
        village: str,
        tip_category: str,
        tip_message: str,
        language: str = "hi"
    ) -> Dict[str, Any]:
        """
        Broadcast health tips to all patients in a village
        
        Args:
            village: Village name
            tip_category: Category (maternal_health, child_nutrition, etc.)
            tip_message: Health tip text
            language: Language for broadcast
            
        Returns:
            Broadcast status
        """
        try:
            logger.info(f"Broadcasting health tip to village {village} - Category: {tip_category}")
            
            # In production, this would query patients table for village
            # For now, mock recipient list
            recipient_phones = [
                "919876543210",
                "919876543211",
                "919876543212"
            ]
            
            # Translate tip if needed
            if language != "en":
                try:
                    tip_message = await translation_service.translate_text(
                        text=tip_message,
                        source_lang="en",
                        target_lang=language
                    )
                except Exception as e:
                    logger.warning(f"Translation failed: {e}")
            
            # Send bulk SMS
            result = await messaging_service.send_bulk_sms(
                phone_numbers=recipient_phones,
                message=tip_message
            )
            
            return {
                "status": "completed",
                "village": village,
                "category": tip_category,
                "language": language,
                "total_recipients": result["total"],
                "success_count": result["success"],
                "failed_count": result["failed"]
            }
            
        except Exception as e:
            logger.error(f"Error broadcasting health tip: {e}")
            return {
                "status": "failed",
                "village": village,
                "error": str(e)
            }
    
    async def send_surge_alert(
        self,
        target_audience: str,
        alert_message: str,
        urgency: str = "high"
    ) -> Dict[str, Any]:
        """
        Send surge warning alerts
        
        Args:
            target_audience: "asha_workers", "admins", or "all_patients"
            alert_message: Alert message
            urgency: Alert urgency level
            
        Returns:
            Alert delivery status
        """
        try:
            logger.warning(f"Sending {urgency} urgency surge alert to {target_audience}")
            
            # Determine recipients based on audience
            if target_audience == "asha_workers":
                # In production, fetch ASHA worker phone numbers from database
                recipients = ["919876543210", "919876543211"]
            elif target_audience == "admins":
                recipients = ["919876543299"]
            elif target_audience == "all_patients":
                recipients = ["919876543210", "919876543211", "919876543212"]
            else:
                recipients = []
            
            if not recipients:
                return {
                    "status": "failed",
                    "error": "No recipients found"
                }
            
            # Send bulk alert
            result = await messaging_service.send_bulk_sms(
                phone_numbers=recipients,
                message=alert_message
            )
            
            return {
                "status": "completed",
                "target_audience": target_audience,
                "urgency": urgency,
                "total_recipients": result["total"],
                "success_count": result["success"],
                "failed_count": result["failed"],
                "sent_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error sending surge alert: {e}")
            return {
                "status": "failed",
                "target_audience": target_audience,
                "error": str(e)
            }
    
    async def get_message_logs(
        self,
        phone: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Get SMS message logs
        
        Args:
            phone: Optional phone number filter
            limit: Maximum number of logs to return
            
        Returns:
            List of message logs
        """
        try:
            # In production, query sms_logs table
            # For now, return mock data
            mock_logs = [
                {
                    "id": 1,
                    "phone": "919876543210",
                    "message": "Reminder: Doctor appointment tomorrow",
                    "type": "appointment_reminder",
                    "status": "sent",
                    "sent_at": "2024-12-26T10:00:00"
                }
            ]
            
            if phone:
                mock_logs = [log for log in mock_logs if log["phone"] == phone]
            
            return mock_logs[:limit]
            
        except Exception as e:
            logger.error(f"Error fetching message logs: {e}")
            return []


# Global instance
communication_agent = CommunicationAgent()
