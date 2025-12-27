"""
Images API Endpoints
Provides access to Image Analysis Agent for medical image upload and analysis
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query
from typing import Optional
from core.logging_config import logger
from agents.image_analysis_agent import image_analysis_agent


router = APIRouter(prefix="/api/v1/images", tags=["images"])


@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    patient_id: Optional[int] = Form(None),
    context: str = Form("")
):
    """
    Upload medical image
    
    Args:
        file: Image file
        patient_id: Optional patient ID
        context: Context description (e.g., "wound on left arm")
        
    Returns:
        Upload details including image URL
    """
    try:
        logger.info(f"Uploading image for patient {patient_id}")
        
        # Read file data
        file_data = await file.read()
        
        # Validate file
        validation = image_analysis_agent.validate_image_file(
            filename=file.filename,
            file_size_bytes=len(file_data)
        )
        
        if not validation["valid"]:
            raise HTTPException(
                status_code=400,
                detail={"errors": validation["errors"]}
            )
        
        # Upload image
        result = await image_analysis_agent.upload_image(
            file_data=file_data,
            filename=file.filename,
            patient_id=patient_id
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading image: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Image upload failed: {str(e)}"
        )


@router.post("/analyze")
async def analyze_image(
    image_url: str = Form(...),
    context: str = Form(""),
    patient_id: Optional[int] = Form(None)
):
    """
    Analyze uploaded medical image using AI
    
    Args:
        image_url: URL of the uploaded image
        context: Medical context
        patient_id: Optional patient ID
        
    Returns:
        Image analysis results with findings and urgency
    """
    try:
        logger.info(f"Analyzing image for patient {patient_id}")
        
        # Perform analysis
        analysis = await image_analysis_agent.analyze_image(
            image_url=image_url,
            context=context,
            patient_id=patient_id
        )
        
        return {
            "status": "success",
            "analysis": analysis.to_dict(),
            "image_url": image_url,
            "patient_id": patient_id
        }
        
    except Exception as e:
        logger.error(f"Error analyzing image: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Image analysis failed: {str(e)}"
        )


@router.post("/upload-and-analyze")
async def upload_and_analyze(
    file: UploadFile = File(...),
    patient_id: Optional[int] = Form(None),
    context: str = Form("")
):
    """
    Upload and analyze image in one step
    
    Args:
        file: Image file
        patient_id: Optional patient ID
        context: Medical context
        
    Returns:
        Upload details and analysis results
    """
    try:
        logger.info(f"Uploading and analyzing image for patient {patient_id}")
        
        # Upload image
        upload_result = await upload_image(file, patient_id, context)
        
        if upload_result["status"] != "success":
            raise HTTPException(status_code=500, detail="Upload failed")
        
        # Analyze image
        analysis_result = await analyze_image(
            image_url=upload_result["image_url"],
            context=context,
            patient_id=patient_id
        )
        
        return {
            "upload": upload_result,
            "analysis": analysis_result["analysis"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in upload and analyze: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Upload and analysis failed: {str(e)}"
        )


@router.get("/patient/{patient_id}")
async def get_patient_images(
    patient_id: int,
    limit: int = Query(10, ge=1, le=50)
):
    """
    Get all images for a patient
    
    Args:
        patient_id: Patient ID
        limit: Maximum number of images to return
        
    Returns:
        List of patient images with analysis
    """
    try:
        images = await image_analysis_agent.get_patient_images(
            patient_id=patient_id,
            limit=limit
        )
        
        return {
            "patient_id": patient_id,
            "images": images,
            "total": len(images)
        }
        
    except Exception as e:
        logger.error(f"Error fetching patient images: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch patient images: {str(e)}"
        )


@router.get("/formats")
async def get_supported_formats():
    """
    Get list of supported image formats
    
    Returns:
        List of supported file extensions
    """
    formats = image_analysis_agent.get_supported_formats()
    return {
        "supported_formats": formats,
        "max_size_mb": 10
    }
