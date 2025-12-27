"""
Patient model
"""
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from core.database import Base


class Patient(Base):
    """Patient database model"""
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    age = Column(Integer)
    gender = Column(String(10))
    phone = Column(String(15), unique=True)
    village = Column(String(100))
    district = Column(String(100))
    state = Column(String(50), default='Maharashtra')
    asha_worker_id = Column(Integer)
    language_preference = Column(String(5), default='en')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
