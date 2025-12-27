"""
Google Gemini AI Service
Core AI reasoning and generation service
"""
import google.generativeai as genai
from core.config import settings
from core.logging_config import logger
from typing import Optional, Dict, Any

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)


class GeminiService:
    """Service for interacting with Google Gemini AI"""
    
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    async def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7
    ) -> str:
        """
        Generate text using Gemini
        
        Args:
            prompt: User prompt
            system_instruction: Optional system instruction
            temperature: Sampling temperature (0.0 to 1.0)
            
        Returns:
            Generated text response
        """
        try:
            if system_instruction:
                model = genai.GenerativeModel(
                    'gemini-2.0-flash-exp',
                    system_instruction=system_instruction
                )
            else:
                model = self.model
            
            response = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    temperature=temperature,
                )
            )
            
            return response.text
        except Exception as e:
            logger.error(f"Gemini generation error: {e}")
            raise
    
    async def analyze_symptoms(
        self,
        symptoms: list,
        patient_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Analyze patient symptoms and provide triage recommendations
        
        Args:
            symptoms: List of symptoms
            patient_info: Patient demographic information
            
        Returns:
            Triage analysis with severity and recommendations
        """
        system_instruction = """You are a medical triage assistant for rural healthcare.
        Analyze symptoms and provide:
        1. Severity level (low, medium, high, critical)
        2. Possible conditions
        3. Immediate actions needed
        4. Whether doctor consultation is required
        
        Be conservative and err on the side of caution for rural settings."""
        
        prompt = f"""
        Patient Information:
        - Age: {patient_info.get('age', 'unknown')}
        - Gender: {patient_info.get('gender', 'unknown')}
        - Location: {patient_info.get('village', 'unknown')}, {patient_info.get('district', 'unknown')}
        
        Symptoms: {', '.join(symptoms)}
        
        Provide triage analysis in the following format:
        Severity: [low/medium/high/critical]
        Possible Conditions: [list conditions]
        Immediate Actions: [list actions]
        Doctor Required: [yes/no]
        Explanation: [brief explanation]
        """
        
        try:
            response = await self.generate_text(
                prompt=prompt,
                system_instruction=system_instruction,
                temperature=0.3
            )
            
            # Parse response (simplified - in production, use structured output)
            severity_map = {
                'low': 1,
                'medium': 2,
                'high': 3,
                'critical': 4
            }
            
            severity = 'medium'  # Default
            for level in severity_map:
                if level in response.lower():
                    severity = level
                    break
            
            return {
                'severity': severity,
                'triage_score': severity_map[severity] * 25,
                'analysis': response,
                'doctor_required': 'yes' in response.lower() and 'doctor required' in response.lower()
            }
        except Exception as e:
            logger.error(f"Symptom analysis error: {e}")
            raise
    
    async def generate_meal_plan(
        self,
        patient_info: Dict[str, Any],
        dietary_restrictions: list,
        health_conditions: list
    ) -> Dict[str, Any]:
        """
        Generate personalized meal plan
        
        Args:
            patient_info: Patient information (age, gender, weight, etc.)
            dietary_restrictions: List of dietary restrictions
            health_conditions: List of health conditions
            
        Returns:
            Meal plan with breakfast, lunch, dinner, snacks
        """
        system_instruction = """You are a nutrition expert specializing in Indian rural diets.
        Create practical meal plans using locally available, affordable ingredients.
        Focus on traditional Indian foods suitable for the region."""
        
        prompt = f"""
        Create a one-day meal plan for:
        - Age: {patient_info.get('age', 'unknown')}
        - Gender: {patient_info.get('gender', 'unknown')}
        - Weight: {patient_info.get('weight_kg', 'unknown')} kg
        - Height: {patient_info.get('height_cm', 'unknown')} cm
        - Region: {patient_info.get('region', 'Maharashtra')}
        - Dietary Restrictions: {', '.join(dietary_restrictions) if dietary_restrictions else 'None'}
        - Health Conditions: {', '.join(health_conditions) if health_conditions else 'None'}
        
        Provide meal plan with:
        1. Breakfast
        2. Mid-morning snack
        3. Lunch
        4. Evening snack
        5. Dinner
        
        For each meal, include:
        - Food items (in English and Hindi)
        - Approximate portions
        - Key nutrients
        
        Also provide:
        - Estimated total calories
        - Key nutritional highlights
        """
        
        try:
            response = await self.generate_text(
                prompt=prompt,
                system_instruction=system_instruction,
                temperature=0.5
            )
            
            return {
                'meal_plan': response,
                'language': 'en',
                'generated_by': 'gemini-2.0-flash'
            }
        except Exception as e:
            logger.error(f"Meal plan generation error: {e}")
            raise


# Global service instance
gemini_service = GeminiService()
