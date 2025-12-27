"""
Patient API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from core.database import get_db
from models.patient import Patient

router = APIRouter()


# Pydantic schemas
class PatientCreate(BaseModel):
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    village: Optional[str] = None
    district: Optional[str] = None
    state: str = 'Maharashtra'
    language_preference: str = 'en'


class PatientResponse(BaseModel):
    id: int
    name: str
    age: Optional[int]
    gender: Optional[str]
    phone: Optional[str]
    village: Optional[str]
    district: Optional[str]
    state: str
    language_preference: str
    
    class Config:
        from_attributes = True


@router.post("/", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    """Create a new patient"""
    db_patient = Patient(**patient.dict())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient


@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(patient_id: int, db: Session = Depends(get_db)):
    """Get patient by ID"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@router.get("/", response_model=List[PatientResponse])
async def list_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all patients"""
    patients = db.query(Patient).offset(skip).limit(limit).all()
    return patients
