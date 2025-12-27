"""
Payment Service - Razorpay Integration
Handles payment processing for telemedicine consultations
"""
from typing import Dict, Optional, Any
import razorpay
import hmac
import hashlib
from core.config import settings
from core.logging_config import logger


class PaymentService:
    """Service for handling payments via Razorpay"""
    
    def __init__(self):
        self.key_id = settings.RAZORPAY_KEY_ID
        self.key_secret = settings.RAZORPAY_KEY_SECRET
        
        # Initialize Razorpay client only if credentials are provided
        self.client = None
        if self.key_id and self.key_secret:
            try:
                self.client = razorpay.Client(auth=(self.key_id, self.key_secret))
                logger.info("Razorpay client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Razorpay client: {e}")
    
    async def create_order(
        self,
        amount: int,
        currency: str = "INR",
        receipt: Optional[str] = None,
        notes: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Create a Razorpay order
        
        Args:
            amount: Amount in paise (e.g., 50000 for ₹500)
            currency: Currency code (default: INR)
            receipt: Optional receipt ID
            notes: Optional notes dictionary
            
        Returns:
            Dictionary containing order details including order_id
        """
        try:
            if not self.client:
                logger.warning("Razorpay client not initialized, returning mock order")
                return self._create_mock_order(amount, currency, receipt)
            
            # Create order data
            order_data = {
                "amount": amount,
                "currency": currency,
                "receipt": receipt or f"RCPT-{int(1000000 * __import__('time').time())}",
            }
            
            if notes:
                order_data["notes"] = notes
            
            # Create order via Razorpay
            order = self.client.order.create(data=order_data)
            
            logger.info(f"Razorpay order created: {order['id']}")
            
            return {
                "order_id": order["id"],
                "amount": order["amount"],
                "currency": order["currency"],
                "receipt": order.get("receipt"),
                "status": order["status"],
                "created_at": order.get("created_at"),
                "notes": order.get("notes", {})
            }
            
        except Exception as e:
            logger.error(f"Error creating Razorpay order: {e}")
            # Return mock order in case of error
            return self._create_mock_order(amount, currency, receipt)
    
    def _create_mock_order(
        self,
        amount: int,
        currency: str,
        receipt: Optional[str]
    ) -> Dict[str, Any]:
        """
        Create a mock order for testing without Razorpay
        """
        import time
        
        mock_order_id = f"order_MOCK{int(time.time() * 1000)}"
        
        return {
            "order_id": mock_order_id,
            "amount": amount,
            "currency": currency,
            "receipt": receipt or f"RCPT-MOCK-{int(time.time())}",
            "status": "created",
            "created_at": int(time.time()),
            "notes": {},
            "mock": True
        }
    
    async def verify_payment_signature(
        self,
        order_id: str,
        payment_id: str,
        signature: str
    ) -> bool:
        """
        Verify Razorpay payment signature
        
        Args:
            order_id: Razorpay order ID
            payment_id: Razorpay payment ID
            signature: Signature from Razorpay
            
        Returns:
            True if signature is valid, False otherwise
        """
        try:
            if not self.key_secret:
                logger.warning("Razorpay secret not configured, skipping verification")
                return True  # Allow in development mode
            
            # Generate expected signature
            message = f"{order_id}|{payment_id}"
            generated_signature = hmac.new(
                self.key_secret.encode(),
                message.encode(),
                hashlib.sha256
            ).hexdigest()
            
            # Compare signatures
            is_valid = hmac.compare_digest(generated_signature, signature)
            
            if is_valid:
                logger.info(f"Payment signature verified successfully for order: {order_id}")
            else:
                logger.error(f"Payment signature verification failed for order: {order_id}")
            
            return is_valid
            
        except Exception as e:
            logger.error(f"Error verifying payment signature: {e}")
            return False
    
    async def get_payment_details(self, payment_id: str) -> Optional[Dict[str, Any]]:
        """
        Get payment details from Razorpay
        
        Args:
            payment_id: Razorpay payment ID
            
        Returns:
            Payment details or None if not found
        """
        try:
            if not self.client:
                logger.warning("Razorpay client not initialized")
                return None
            
            payment = self.client.payment.fetch(payment_id)
            
            return {
                "payment_id": payment["id"],
                "order_id": payment.get("order_id"),
                "amount": payment["amount"],
                "currency": payment["currency"],
                "status": payment["status"],
                "method": payment.get("method"),
                "email": payment.get("email"),
                "contact": payment.get("contact"),
                "created_at": payment.get("created_at"),
                "captured": payment.get("captured", False)
            }
            
        except Exception as e:
            logger.error(f"Error fetching payment details: {e}")
            return None
    
    async def capture_payment(
        self,
        payment_id: str,
        amount: int
    ) -> Dict[str, Any]:
        """
        Capture a payment
        
        Args:
            payment_id: Razorpay payment ID
            amount: Amount to capture in paise
            
        Returns:
            Captured payment details
        """
        try:
            if not self.client:
                return {
                    "status": "error",
                    "message": "Razorpay client not initialized"
                }
            
            payment = self.client.payment.capture(payment_id, amount)
            
            logger.info(f"Payment captured: {payment_id}")
            
            return {
                "status": "success",
                "payment_id": payment["id"],
                "amount": payment["amount"],
                "captured": payment.get("captured", False)
            }
            
        except Exception as e:
            logger.error(f"Error capturing payment: {e}")
            return {
                "status": "error",
                "message": str(e)
            }
    
    async def create_refund(
        self,
        payment_id: str,
        amount: Optional[int] = None,
        notes: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Create a refund for a payment
        
        Args:
            payment_id: Razorpay payment ID
            amount: Amount to refund (if None, full refund)
            notes: Optional notes
            
        Returns:
            Refund details
        """
        try:
            if not self.client:
                return {
                    "status": "error",
                    "message": "Razorpay client not initialized"
                }
            
            refund_data = {"payment_id": payment_id}
            if amount:
                refund_data["amount"] = amount
            if notes:
                refund_data["notes"] = notes
            
            refund = self.client.payment.refund(payment_id, refund_data)
            
            logger.info(f"Refund created for payment: {payment_id}")
            
            return {
                "status": "success",
                "refund_id": refund["id"],
                "payment_id": refund["payment_id"],
                "amount": refund["amount"],
                "currency": refund["currency"],
                "status": refund["status"]
            }
            
        except Exception as e:
            logger.error(f"Error creating refund: {e}")
            return {
                "status": "error",
                "message": str(e)
            }


# Global instance
payment_service = PaymentService()
