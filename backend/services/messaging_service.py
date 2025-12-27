"""
Messaging Service - SMS and Communication
Integrates with MSG91 for SMS delivery
"""
from typing import Dict, Optional, Any
import httpx
from core.config import settings
from core.logging_config import logger


class MessagingService:
    """Service for sending SMS via MSG91"""
    
    def __init__(self):
        self.msg91_auth_key = settings.MSG91_AUTH_KEY
        self.msg91_base_url = "https://control.msg91.com/api/v5"
        self.sender_id = "AROGYA"  # Registered sender ID
        
        # Enable real SMS only if auth key is configured
        self.enable_real_sms = bool(self.msg91_auth_key)
        
        if not self.enable_real_sms:
            logger.warning("MSG91 not configured, SMS will be logged only")
    
    async def send_sms_via_msg91(
        self,
        phone: str,
        message: str,
        route: str = "4"  # 4 = Transactional, 1 = Promotional
    ) -> Dict[str, Any]:
        """
        Send SMS via MSG91 API
        
        Args:
            phone: Phone number with country code (e.g., 919876543210)
            message: SMS message text
            route: SMS route (4=Transactional, 1=Promotional)
            
        Returns:
            Dictionary with delivery status
        """
        try:
            # Normalize phone number
            phone = self._normalize_phone(phone)
            
            if not self.enable_real_sms:
                return self._log_mock_sms(phone, message)
            
            # Prepare MSG91 API request
            url = f"{self.msg91_base_url}/flow/"
            
            headers = {
                "authkey": self.msg91_auth_key,
                "content-type": "application/json"
            }
            
            payload = {
                "sender": self.sender_id,
                "route": route,
                "country": "91",  # India
                "sms": [
                    {
                        "message": message,
                        "to": [phone]
                    }
                ]
            }
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, headers=headers, json=payload)
                response.raise_for_status()
                
                result = response.json()
                
                logger.info(f"SMS sent successfully to {phone}")
                
                return {
                    "status": "sent",
                    "phone": phone,
                    "message_id": result.get("message_id"),
                    "provider": "MSG91"
                }
                
        except httpx.HTTPError as e:
            logger.error(f"HTTP error sending SMS: {e}")
            return {
                "status": "failed",
                "phone": phone,
                "error": str(e)
            }
        except Exception as e:
            logger.error(f"Error sending SMS: {e}")
            return {
                "status": "failed",
                "phone": phone,
                "error": str(e)
            }
    
    def _normalize_phone(self, phone: str) -> str:
        """
        Normalize phone number format
        
        Args:
            phone: Phone number in various formats
            
        Returns:
            Normalized phone number (e.g., 919876543210)
        """
        # Remove any non-digit characters
        phone = ''.join(filter(str.isdigit, phone))
        
        # Add country code if missing (assume India)
        if len(phone) == 10:
            phone = "91" + phone
        
        return phone
    
    def _log_mock_sms(self, phone: str, message: str) -> Dict[str, Any]:
        """
        Log SMS for development mode
        
        Args:
            phone: Phone number
            message: Message text
            
        Returns:
            Mock delivery status
        """
        logger.info(f"[MOCK SMS] To: {phone}, Message: {message}")
        
        return {
            "status": "sent",
            "phone": phone,
            "message_id": f"MOCK_{int(__import__('time').time() * 1000)}",
            "provider": "mock",
            "mock": True
        }
    
    async def send_otp(
        self,
        phone: str,
        otp: str,
        template_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send OTP via MSG91
        
        Args:
            phone: Phone number
            otp: OTP code
            template_id: MSG91 template ID
            
        Returns:
            Delivery status
        """
        message = f"Your Arogya-Swarm OTP is: {otp}. Valid for 10 minutes. Do not share with anyone."
        
        return await self.send_sms_via_msg91(
            phone=phone,
            message=message,
            route="4"  # Transactional route for OTP
        )
    
    async def send_bulk_sms(
        self,
        phone_numbers: list,
        message: str
    ) -> Dict[str, Any]:
        """
        Send bulk SMS to multiple numbers
        
        Args:
            phone_numbers: List of phone numbers
            message: Message text
            
        Returns:
            Bulk delivery status
        """
        results = []
        success_count = 0
        failed_count = 0
        
        for phone in phone_numbers:
            result = await self.send_sms_via_msg91(phone, message)
            results.append(result)
            
            if result["status"] == "sent":
                success_count += 1
            else:
                failed_count += 1
        
        return {
            "total": len(phone_numbers),
            "success": success_count,
            "failed": failed_count,
            "results": results
        }
    
    def get_delivery_status(self, message_id: str) -> Dict[str, Any]:
        """
        Get SMS delivery status from MSG91
        
        Args:
            message_id: MSG91 message ID
            
        Returns:
            Delivery status
        """
        # Mock implementation
        return {
            "message_id": message_id,
            "status": "delivered",
            "delivered_at": __import__('datetime').datetime.now().isoformat()
        }


# Global instance
messaging_service = MessagingService()
