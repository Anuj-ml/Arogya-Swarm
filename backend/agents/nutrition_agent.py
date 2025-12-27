"""
Nutrition Agent
Generates personalized meal plans using Gemini AI
"""
from typing import Dict, Any
from services.gemini_service import gemini_service
from core.logging_config import logger


class NutritionAgent:
    """
    Agent for nutrition planning
    Creates personalized meal plans based on patient demographics and health
    """
    
    def __init__(self):
        self.name = "Nutrition Agent"
        logger.info(f"{self.name} initialized")
    
    async def generate_plan(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate personalized nutrition plan
        
        Args:
            data: Dictionary containing:
                - patient_info: Age, gender, weight, height, region
                - dietary_restrictions: List of restrictions
                - health_conditions: List of conditions
                
        Returns:
            Meal plan with recommendations
        """
        try:
            patient_info = data.get('patient_info', {})
            dietary_restrictions = data.get('dietary_restrictions', [])
            health_conditions = data.get('health_conditions', [])
            
            # Calculate BMI if height and weight provided
            if patient_info.get('weight_kg') and patient_info.get('height_cm'):
                height_m = patient_info['height_cm'] / 100
                bmi = patient_info['weight_kg'] / (height_m ** 2)
                patient_info['bmi'] = round(bmi, 2)
            
            # Generate meal plan using Gemini
            meal_plan_result = await gemini_service.generate_meal_plan(
                patient_info=patient_info,
                dietary_restrictions=dietary_restrictions,
                health_conditions=health_conditions
            )
            
            # Add additional recommendations
            recommendations = self._generate_recommendations(
                patient_info,
                health_conditions
            )
            
            logger.info(f"Meal plan generated for patient")
            
            return {
                'agent': self.name,
                'meal_plan': meal_plan_result.get('meal_plan', ''),
                'bmi': patient_info.get('bmi'),
                'bmi_category': self._get_bmi_category(patient_info.get('bmi')),
                'recommendations': recommendations,
                'dietary_restrictions': dietary_restrictions,
                'health_conditions': health_conditions,
                'status': 'success'
            }
            
        except Exception as e:
            logger.error(f"Meal plan generation error: {e}")
            return {
                'error': str(e),
                'status': 'error'
            }
    
    def _get_bmi_category(self, bmi: float) -> str:
        """Categorize BMI"""
        if not bmi:
            return 'unknown'
        
        if bmi < 18.5:
            return 'underweight'
        elif bmi < 25:
            return 'normal'
        elif bmi < 30:
            return 'overweight'
        else:
            return 'obese'
    
    def _generate_recommendations(
        self,
        patient_info: Dict[str, Any],
        health_conditions: list
    ) -> list:
        """
        Generate general nutrition recommendations
        
        Args:
            patient_info: Patient information
            health_conditions: List of health conditions
            
        Returns:
            List of recommendations
        """
        recommendations = []
        
        # BMI-based recommendations
        bmi = patient_info.get('bmi')
        if bmi:
            if bmi < 18.5:
                recommendations.extend([
                    'Increase caloric intake with nutritious foods',
                    'Include protein-rich foods in every meal',
                    'Eat frequent small meals throughout the day'
                ])
            elif bmi > 25:
                recommendations.extend([
                    'Focus on portion control',
                    'Increase vegetable and fruit intake',
                    'Reduce oil and sugar consumption'
                ])
        
        # Age-based recommendations
        age = patient_info.get('age', 0)
        if age > 60:
            recommendations.append('Ensure adequate calcium and vitamin D intake')
        elif age < 18:
            recommendations.append('Focus on growth-supporting nutrients')
        
        # Gender-specific recommendations
        gender = patient_info.get('gender')
        if gender == 'female':
            recommendations.append('Ensure adequate iron intake')
        
        # Condition-specific recommendations
        if 'diabetes' in [c.lower() for c in health_conditions]:
            recommendations.extend([
                'Monitor carbohydrate intake',
                'Choose low glycemic index foods',
                'Avoid refined sugars'
            ])
        
        if 'hypertension' in [c.lower() for c in health_conditions]:
            recommendations.extend([
                'Reduce sodium intake',
                'Include potassium-rich foods',
                'Limit processed foods'
            ])
        
        # General recommendations
        recommendations.extend([
            'Stay well hydrated (8-10 glasses of water daily)',
            'Include variety in meals',
            'Choose locally available seasonal foods'
        ])
        
        return recommendations
    
    async def analyze_nutrition_gap(
        self,
        patient_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Analyze nutritional gaps for a patient
        
        Args:
            patient_data: Patient information including current diet
            
        Returns:
            Analysis of nutritional gaps
        """
        # Simplified gap analysis
        gaps = []
        
        patient_info = patient_data.get('patient_info', {})
        current_diet = patient_data.get('current_diet', {})
        
        # Check for common gaps in rural diets
        if not current_diet.get('protein_sources'):
            gaps.append('Insufficient protein sources')
        
        if not current_diet.get('vegetables'):
            gaps.append('Low vegetable intake')
        
        if not current_diet.get('fruits'):
            gaps.append('Insufficient fruit intake')
        
        return {
            'agent': self.name,
            'gaps': gaps,
            'recommendations': self._generate_gap_recommendations(gaps),
            'status': 'success'
        }
    
    def _generate_gap_recommendations(self, gaps: list) -> list:
        """Generate recommendations for nutritional gaps"""
        recommendations = []
        
        for gap in gaps:
            if 'protein' in gap.lower():
                recommendations.append('Add dal, eggs, or local legumes to meals')
            elif 'vegetable' in gap.lower():
                recommendations.append('Include leafy greens and seasonal vegetables')
            elif 'fruit' in gap.lower():
                recommendations.append('Eat local seasonal fruits daily')
        
        return recommendations


# Create agent instance
nutrition_agent = NutritionAgent()
