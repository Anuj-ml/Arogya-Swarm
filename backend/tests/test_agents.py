"""
Tests for AI agents
"""
import pytest
from agents.diagnostic_triage_agent import diagnostic_triage_agent
from agents.nutrition_agent import nutrition_agent
from agents.sentinel_agent import sentinel_agent
from agents.logistics_agent import logistics_agent


@pytest.mark.asyncio
async def test_diagnostic_triage_basic():
    """Test basic diagnostic triage"""
    result = await diagnostic_triage_agent.triage(
        symptoms=["fever", "cough", "headache"],
        patient_age=30,
        patient_gender="male",
        duration_days=3
    )
    
    assert result is not None
    assert hasattr(result, 'risk_score')
    assert hasattr(result, 'severity')
    assert hasattr(result, 'recommendations')
    assert 0 <= result.risk_score <= 100


@pytest.mark.asyncio
async def test_nutrition_meal_plan():
    """Test nutrition meal plan generation"""
    result = await nutrition_agent.create_meal_plan(
        age=30,
        gender="male",
        height_cm=170,
        weight_kg=70,
        activity_level="moderate",
        dietary_preference="vegetarian"
    )
    
    assert result is not None
    assert hasattr(result, 'meals')
    assert hasattr(result, 'bmi')
    assert hasattr(result, 'total_calories')
    assert len(result.meals) > 0


@pytest.mark.asyncio
async def test_sentinel_surge_prediction():
    """Test surge prediction"""
    result = await sentinel_agent.predict_surge(
        location="TestCity"
    )
    
    assert result is not None
    assert hasattr(result, 'surge_likelihood')
    assert hasattr(result, 'confidence_score')
    assert hasattr(result, 'predicted_cases')
    assert result.surge_likelihood in ['low', 'medium', 'high', 'critical']


@pytest.mark.asyncio
async def test_logistics_stock_monitoring(mock_inventory_item):
    """Test stock level monitoring"""
    inventory_items = [mock_inventory_item]
    
    alerts = await logistics_agent.monitor_stock_levels(inventory_items)
    
    assert isinstance(alerts, list)
    # Should have alert since stock (50) is below threshold (200)
    assert len(alerts) > 0
    if len(alerts) > 0:
        assert hasattr(alerts[0], 'item_id')
        assert hasattr(alerts[0], 'severity')


@pytest.mark.asyncio
async def test_logistics_inventory_summary(mock_inventory_item):
    """Test inventory summary generation"""
    inventory_items = [
        mock_inventory_item,
        {
            "id": 2,
            "item_name": "ORS Packets",
            "category": "medicine",
            "current_stock": 0,
            "threshold": 100
        }
    ]
    
    summary = await logistics_agent.get_inventory_summary(inventory_items)
    
    assert isinstance(summary, dict)
    assert "total_items" in summary
    assert "out_of_stock" in summary
    assert "critical_items" in summary
    assert "health_score" in summary
    assert summary["total_items"] == 2
    assert summary["out_of_stock"] == 1


@pytest.mark.asyncio
async def test_diagnostic_severity_levels():
    """Test different severity levels in triage"""
    # Test low severity
    low_result = await diagnostic_triage_agent.triage(
        symptoms=["minor headache"],
        patient_age=25,
        patient_gender="female",
        duration_days=1
    )
    
    # Test high severity
    high_result = await diagnostic_triage_agent.triage(
        symptoms=["chest pain", "difficulty breathing", "severe headache"],
        patient_age=60,
        patient_gender="male",
        duration_days=1
    )
    
    assert low_result.risk_score < high_result.risk_score
    assert low_result.severity != "critical"
