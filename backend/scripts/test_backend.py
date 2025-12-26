"""
Simple test script to verify backend is working
"""
import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from services.gemini_service import GeminiService
from agents.diagnostic_triage_agent import DiagnosticTriageAgent
from agents.nutrition_agent import NutritionAgent


async def test_services():
    """Test basic service functionality"""
    print("=" * 60)
    print("AROGYA-SWARM BACKEND TEST")
    print("=" * 60)
    print()
    
    # Test 1: Diagnostic Triage Agent
    print("Test 1: Diagnostic Triage Agent")
    print("-" * 60)
    triage_agent = DiagnosticTriageAgent()
    
    test_data = {
        'symptoms': ['fever', 'cough', 'headache'],
        'patient_info': {
            'age': 35,
            'gender': 'male',
            'village': 'Wadala',
            'district': 'Mumbai'
        }
    }
    
    try:
        result = await triage_agent.analyze(test_data)
        print(f"✓ Triage analysis completed")
        print(f"  Severity: {result.get('severity')}")
        print(f"  Triage Score: {result.get('triage_score')}")
        print(f"  Doctor Required: {result.get('doctor_required')}")
        print()
    except Exception as e:
        print(f"✗ Triage test failed: {e}")
        print()
    
    # Test 2: Nutrition Agent
    print("Test 2: Nutrition Agent")
    print("-" * 60)
    nutrition_agent = NutritionAgent()
    
    nutrition_data = {
        'patient_info': {
            'age': 30,
            'gender': 'female',
            'weight_kg': 55,
            'height_cm': 160,
            'region': 'Maharashtra'
        },
        'dietary_restrictions': ['vegetarian'],
        'health_conditions': []
    }
    
    try:
        result = await nutrition_agent.generate_plan(nutrition_data)
        print(f"✓ Meal plan generated")
        print(f"  BMI: {result.get('bmi')}")
        print(f"  BMI Category: {result.get('bmi_category')}")
        print(f"  Recommendations: {len(result.get('recommendations', []))} items")
        print()
    except Exception as e:
        print(f"✗ Nutrition test failed: {e}")
        print()
    
    print("=" * 60)
    print("NOTE: Some tests may fail if API keys are not configured")
    print("Please set up your .env file with required API keys")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(test_services())
