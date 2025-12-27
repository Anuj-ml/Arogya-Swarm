"""
Tests for API endpoints
"""
import pytest
from httpx import AsyncClient
from main import app


@pytest.mark.asyncio
async def test_health_check():
    """Test health check endpoint"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"


@pytest.mark.asyncio
async def test_root_endpoint():
    """Test root endpoint"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
        assert data["status"] == "operational"


@pytest.mark.asyncio
async def test_surge_status():
    """Test surge status endpoint"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/surge/current-status?location=TestLocation")
        assert response.status_code == 200
        data = response.json()
        assert "location" in data
        assert "alert_level" in data
        assert "surge_likelihood" in data


@pytest.mark.asyncio
async def test_inventory_summary():
    """Test inventory summary endpoint"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/inventory/summary")
        assert response.status_code == 200
        data = response.json()
        assert "total_items" in data
        assert "health_score" in data
        assert isinstance(data["total_items"], int)


@pytest.mark.asyncio
async def test_inventory_critical():
    """Test critical inventory endpoint"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/inventory/critical")
        assert response.status_code == 200
        data = response.json()
        assert "summary" in data
        assert "critical_items" in data
        assert "total_alerts" in data


@pytest.mark.asyncio
async def test_analytics_dashboard():
    """Test analytics dashboard endpoint"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/analytics/dashboard")
        assert response.status_code == 200
        data = response.json()
        assert "overview" in data
        assert "trends" in data
        assert "performance" in data


@pytest.mark.asyncio
async def test_staff_list():
    """Test staff listing endpoint"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/staff/")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            assert "id" in data[0]
            assert "name" in data[0]
            assert "role" in data[0]


@pytest.mark.asyncio
async def test_prescriptions_list():
    """Test prescriptions listing endpoint"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/prescriptions/")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


@pytest.mark.asyncio
async def test_create_prescription():
    """Test prescription creation endpoint"""
    prescription_data = {
        "patient_id": 101,
        "patient_name": "Test Patient",
        "doctor_name": "Dr. Test",
        "medications": [
            {
                "name": "Test Medicine",
                "dosage": "1 tablet",
                "frequency": "2 times daily",
                "duration": "5 days"
            }
        ],
        "diagnosis": "Test Diagnosis"
    }
    
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/api/v1/prescriptions/", json=prescription_data)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["patient_name"] == "Test Patient"
        assert data["status"] == "active"
