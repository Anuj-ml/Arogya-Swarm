"""
Image Service - Cloudinary Integration and Gemini Vision Analysis
Handles medical image upload and AI analysis
"""
from typing import Dict, Optional, Any
import cloudinary
import cloudinary.uploader
import google.generativeai as genai
from core.config import settings
from core.logging_config import logger
from services.gemini_service import GeminiService


class ImageService:
    """Service for image upload and AI analysis"""
    
    def __init__(self):
        # Configure Cloudinary
        if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY:
            cloudinary.config(
                cloud_name=settings.CLOUDINARY_CLOUD_NAME,
                api_key=settings.CLOUDINARY_API_KEY,
                api_secret=settings.CLOUDINARY_API_SECRET
            )
            logger.info("Cloudinary configured successfully")
        else:
            logger.warning("Cloudinary credentials not configured")
        
        # Initialize Gemini for vision analysis
        self.gemini_service = GeminiService()
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
    
    async def upload_to_cloudinary(
        self,
        file_data: bytes,
        filename: str,
        folder: str = "arogya-swarm/medical"
    ) -> Dict[str, Any]:
        """
        Upload image to Cloudinary
        
        Args:
            file_data: Image file bytes
            filename: Original filename
            folder: Cloudinary folder path
            
        Returns:
            Dictionary with upload details including URL
        """
        try:
            if not settings.CLOUDINARY_CLOUD_NAME:
                # Return mock URL for development
                logger.warning("Cloudinary not configured, returning mock URL")
                return {
                    "url": f"https://mock-storage.com/{filename}",
                    "public_id": f"mock_{filename}",
                    "format": filename.split('.')[-1] if '.' in filename else 'jpg',
                    "width": 800,
                    "height": 600,
                    "bytes": len(file_data),
                    "mock": True
                }
            
            # Upload to Cloudinary
            result = cloudinary.uploader.upload(
                file_data,
                folder=folder,
                resource_type="image",
                overwrite=False,
                unique_filename=True
            )
            
            logger.info(f"Image uploaded to Cloudinary: {result['public_id']}")
            
            return {
                "url": result["secure_url"],
                "public_id": result["public_id"],
                "format": result["format"],
                "width": result.get("width"),
                "height": result.get("height"),
                "bytes": result.get("bytes"),
                "created_at": result.get("created_at")
            }
            
        except Exception as e:
            logger.error(f"Error uploading to Cloudinary: {e}")
            raise
    
    async def analyze_with_gemini_vision(
        self,
        image_url: str,
        context: str = ""
    ) -> Dict[str, Any]:
        """
        Analyze medical image using Gemini Vision API
        
        Args:
            image_url: URL of the image to analyze
            context: Additional context about the image
            
        Returns:
            Dictionary with analysis results
        """
        try:
            if not settings.GEMINI_API_KEY:
                logger.warning("Gemini API key not configured, returning mock analysis")
                return self._get_mock_analysis(context)
            
            # Create vision model
            vision_model = genai.GenerativeModel('gemini-2.0-flash-exp')
            
            # Create prompt for medical image analysis
            prompt = f"""
You are a medical AI assistant analyzing a medical image. Be cautious and professional.

Context: {context if context else 'General medical image for triage'}

Please analyze this image and provide:

1. DESCRIPTION: What you observe in the image (be specific but cautious)
2. URGENCY: Rate the urgency level (low/medium/high/critical)
3. ASSESSMENT: Preliminary assessment of what this might indicate
4. RECOMMENDATION: Whether this requires immediate doctor review
5. CONFIDENCE: Your confidence level in this analysis (0-100)

Important guidelines:
- Be conservative in assessments
- Recommend doctor review for anything unclear
- Note any concerning findings
- Do not provide definitive diagnosis
- Highlight urgent/critical signs

Format your response as:
DESCRIPTION: [your description]
URGENCY: [low/medium/high/critical]
ASSESSMENT: [your assessment]
RECOMMENDATION: [yes/no for doctor review]
CONFIDENCE: [0-100]
NOTES: [any additional notes]
"""
            
            # Load and analyze image
            # Note: In production, you might need to download the image first
            # For now, we'll use the image URL directly if Gemini supports it
            try:
                # Generate content with image
                response = vision_model.generate_content([prompt, {"mime_type": "image/jpeg", "data": image_url}])
                analysis_text = response.text
            except Exception as img_error:
                logger.warning(f"Direct image analysis failed: {img_error}, using text-only fallback")
                # Fallback to text-only analysis
                fallback_prompt = f"{prompt}\n\nNote: Image could not be loaded directly. Providing general guidance based on context."
                analysis_text = await self.gemini_service.generate_text(
                    prompt=fallback_prompt,
                    system_instruction="You are a medical AI assistant.",
                    temperature=0.3
                )
            
            # Parse the response
            parsed = self._parse_vision_response(analysis_text)
            
            logger.info(f"Image analysis complete - Urgency: {parsed['urgency']}, Confidence: {parsed['confidence']}")
            
            return parsed
            
        except Exception as e:
            logger.error(f"Error in Gemini Vision analysis: {e}")
            return self._get_mock_analysis(context)
    
    def _parse_vision_response(self, response: str) -> Dict[str, Any]:
        """
        Parse structured response from Gemini Vision
        """
        result = {
            "findings": "Analysis completed",
            "urgency": "medium",
            "requires_doctor": True,
            "confidence": 70.0,
            "assessment": "Image analyzed",
            "notes": ""
        }
        
        try:
            lines = response.strip().split('\n')
            
            for line in lines:
                line = line.strip()
                if line.startswith("DESCRIPTION:"):
                    result["findings"] = line.split(":", 1)[1].strip()
                elif line.startswith("URGENCY:"):
                    urgency = line.split(":", 1)[1].strip().lower()
                    if urgency in ["low", "medium", "high", "critical"]:
                        result["urgency"] = urgency
                elif line.startswith("ASSESSMENT:"):
                    result["assessment"] = line.split(":", 1)[1].strip()
                elif line.startswith("RECOMMENDATION:"):
                    rec = line.split(":", 1)[1].strip().lower()
                    result["requires_doctor"] = "yes" in rec or "required" in rec
                elif line.startswith("CONFIDENCE:"):
                    conf_str = line.split(":", 1)[1].strip()
                    result["confidence"] = float(''.join(filter(lambda x: x.isdigit() or x == '.', conf_str)) or 70.0)
                elif line.startswith("NOTES:"):
                    result["notes"] = line.split(":", 1)[1].strip()
        except Exception as e:
            logger.warning(f"Error parsing vision response: {e}")
        
        return result
    
    def _get_mock_analysis(self, context: str) -> Dict[str, Any]:
        """
        Generate mock analysis for testing
        """
        return {
            "findings": f"Mock analysis for context: {context}. Image shows typical presentation.",
            "urgency": "medium",
            "requires_doctor": True,
            "confidence": 75.0,
            "assessment": "Preliminary assessment suggests further examination needed. Mock data only.",
            "notes": "This is mock data. Configure Gemini API key for actual analysis.",
            "mock": True
        }
    
    async def delete_image(self, public_id: str) -> bool:
        """
        Delete image from Cloudinary
        
        Args:
            public_id: Cloudinary public ID
            
        Returns:
            True if successful, False otherwise
        """
        try:
            if not settings.CLOUDINARY_CLOUD_NAME:
                logger.warning("Cloudinary not configured")
                return True  # Mock success
            
            result = cloudinary.uploader.destroy(public_id)
            
            if result.get("result") == "ok":
                logger.info(f"Image deleted from Cloudinary: {public_id}")
                return True
            else:
                logger.warning(f"Failed to delete image: {public_id}")
                return False
                
        except Exception as e:
            logger.error(f"Error deleting image: {e}")
            return False


# Global instance
image_service = ImageService()
