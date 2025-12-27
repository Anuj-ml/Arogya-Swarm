"""
Test configuration for pytest
"""
import pytest
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))


@pytest.fixture
def mock_patient_data():
    """Mock patient data for testing"""
    return {
        "name": "Test Patient",
        "age": 30,
        "gender": "male",
        "phone": "+91-9876543210",
        "village": "Test Village"
    }


@pytest.fixture
def mock_symptoms():
    """Mock symptoms data for testing"""
    return {
        "symptoms": ["fever", "cough", "headache"],
        "patient_age": 30,
        "patient_gender": "male",
        "duration_days": 3
    }


@pytest.fixture
def mock_inventory_item():
    """Mock inventory item for testing"""
    return {
        "id": 1,
        "item_name": "Paracetamol 500mg",
        "category": "medicine",
        "current_stock": 50,
        "threshold": 200,
        "unit": "tablets",
        "auto_reorder_enabled": True,
        "supplier": "MediSupply Co."
    }
