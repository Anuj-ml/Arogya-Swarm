"""
Image Analysis Agent - Medical Image Triage
Uses Gemini Vision API for medical image analysis and urgency detection
"""
from typing import Dict, List, Optional, Any
from datetime import datetime
from core.logging_config import logger
from services.image_service import image_service


class ImageAnalysis:
    """Data structure for image analysis results"""
    def __init__(
        self,
        findings: str,
        urgency: str,
        requires_doctor: bool,
        confidence: float,
        assessment: str,
        notes: str = ""
    ):
        self.findings = findings
        self.urgency = urgency
        self.requires_doctor = requires_doctor
        self.confidence = confidence
        self.assessment = assessment
        self.notes = notes
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "findings": self.findings,
            "urgency": self.urgency,
            "requires_doctor": self.requires_doctor,
            "confidence": self.confidence,
            "assessment": self.assessment,
            "notes": self.notes
        }


class ImageAnalysisAgent:
    """
    Image Analysis Agent for medical image triage
    Analyzes medical images using Gemini Vision API
    """
    
    def __init__(self):
        self.supported_formats = ['jpg', 'jpeg', 'png', 'webp']
        self.max_file_size_mb = 10
    
    async def upload_image(
        self,
        file_data: bytes,
        filename: str,
        patient_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Upload medical image to cloud storage
        
        Args:
            file_data: Image file bytes
            filename: Original filename
            patient_id: Optional patient ID for organization
            
        Returns:
            Dictionary with upload details and image URL
        """
        try:
            # Validate file
            file_extension = filename.split('.')[-1].lower() if '.' in filename else ''
            if file_extension not in self.supported_formats:
                raise ValueError(
                    f"Unsupported file format. Supported formats: {', '.join(self.supported_formats)}"
                )
            
            # Check file size
            size_mb = len(file_data) / (1024 * 1024)
            if size_mb > self.max_file_size_mb:
                raise ValueError(
                    f"File size ({size_mb:.2f}MB) exceeds maximum allowed size ({self.max_file_size_mb}MB)"
                )
            
            # Determine folder based on patient_id
            folder = f"arogya-swarm/patients/{patient_id}" if patient_id else "arogya-swarm/general"
            
            # Upload to Cloudinary
            upload_result = await image_service.upload_to_cloudinary(
                file_data=file_data,
                filename=filename,
                folder=folder
            )
            
            logger.info(f"Medical image uploaded successfully: {upload_result['url']}")
            
            return {
                "status": "success",
                "image_url": upload_result["url"],
                "public_id": upload_result["public_id"],
                "format": upload_result["format"],
                "size_bytes": upload_result.get("bytes", len(file_data)),
                "uploaded_at": datetime.now().isoformat(),
                "patient_id": patient_id
            }
            
        except ValueError as e:
            logger.error(f"Validation error in image upload: {e}")
            raise
        except Exception as e:
            logger.error(f"Error uploading image: {e}")
            raise
    
    async def analyze_image(
        self,
        image_url: str,
        context: str = "",
        patient_id: Optional[int] = None
    ) -> ImageAnalysis:
        """
        Analyze medical image using Gemini Vision
        
        Args:
            image_url: URL of the uploaded image
            context: Additional context (e.g., "wound on left arm", "skin rash")
            patient_id: Optional patient ID
            
        Returns:
            ImageAnalysis object with findings and recommendations
        """
        try:
            logger.info(f"Analyzing image for patient {patient_id}: {context}")
            
            # Perform AI analysis
            analysis_result = await image_service.analyze_with_gemini_vision(
                image_url=image_url,
                context=context
            )
            
            # Create ImageAnalysis object
            analysis = ImageAnalysis(
                findings=analysis_result["findings"],
                urgency=analysis_result["urgency"],
                requires_doctor=analysis_result["requires_doctor"],
                confidence=analysis_result["confidence"],
                assessment=analysis_result["assessment"],
                notes=analysis_result.get("notes", "")
            )
            
            # Check if urgent notification is needed
            if analysis.urgency in ["high", "critical"] and analysis.requires_doctor:
                await self._notify_doctor_if_urgent(
                    analysis=analysis,
                    patient_id=patient_id,
                    image_url=image_url
                )
            
            logger.info(
                f"Image analysis complete - Urgency: {analysis.urgency}, "
                f"Requires doctor: {analysis.requires_doctor}"
            )
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing image: {e}")
            raise
    
    async def _notify_doctor_if_urgent(
        self,
        analysis: ImageAnalysis,
        patient_id: Optional[int],
        image_url: str
    ):
        """
        Send urgent notification to on-call doctor
        
        Args:
            analysis: ImageAnalysis object
            patient_id: Patient ID
            image_url: Image URL
        """
        try:
            logger.warning(
                f"URGENT IMAGE ALERT - Patient {patient_id}: {analysis.urgency} urgency detected"
            )
            
            # In production, this would:
            # 1. Find on-call doctor from database
            # 2. Send SMS/push notification
            # 3. Create alert in doctor dashboard
            # 4. Log the alert
            
            notification_details = {
                "type": "urgent_image_alert",
                "patient_id": patient_id,
                "urgency": analysis.urgency,
                "findings": analysis.findings,
                "image_url": image_url,
                "timestamp": datetime.now().isoformat(),
                "action_required": "Review image and contact patient immediately"
            }
            
            logger.info(f"Urgent notification prepared: {notification_details}")
            
        except Exception as e:
            logger.error(f"Error sending urgent notification: {e}")
    
    async def get_patient_images(
        self,
        patient_id: int,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get all images for a patient
        
        Args:
            patient_id: Patient ID
            limit: Maximum number of images to return
            
        Returns:
            List of image records with analysis
        """
        try:
            # In production, this would query medical_records table
            # For now, return mock data
            logger.info(f"Fetching images for patient {patient_id}")
            
            mock_images = [
                {
                    "image_id": 1,
                    "patient_id": patient_id,
                    "image_url": "https://mock-storage.com/image1.jpg",
                    "context": "Skin rash on arm",
                    "urgency": "medium",
                    "findings": "Redness and inflammation observed",
                    "uploaded_at": "2024-12-26T10:00:00",
                    "analyzed": True
                }
            ]
            
            return mock_images[:limit]
            
        except Exception as e:
            logger.error(f"Error fetching patient images: {e}")
            return []
    
    def get_supported_formats(self) -> List[str]:
        """
        Get list of supported image formats
        
        Returns:
            List of supported file extensions
        """
        return self.supported_formats
    
    def validate_image_file(self, filename: str, file_size_bytes: int) -> Dict[str, Any]:
        """
        Validate image file before upload
        
        Args:
            filename: File name
            file_size_bytes: File size in bytes
            
        Returns:
            Dictionary with validation result
        """
        errors = []
        warnings = []
        
        # Check extension
        file_extension = filename.split('.')[-1].lower() if '.' in filename else ''
        if file_extension not in self.supported_formats:
            errors.append(f"Unsupported format. Use: {', '.join(self.supported_formats)}")
        
        # Check size
        size_mb = file_size_bytes / (1024 * 1024)
        if size_mb > self.max_file_size_mb:
            errors.append(f"File too large ({size_mb:.2f}MB). Maximum: {self.max_file_size_mb}MB")
        elif size_mb < 0.01:  # Less than 10KB
            warnings.append("File size very small. Image quality may be poor.")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "file_size_mb": size_mb
        }


# Global instance
image_analysis_agent = ImageAnalysisAgent()
