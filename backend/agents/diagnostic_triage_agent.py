"""
Diagnostic Triage Agent
Uses Gemini AI for symptom analysis and risk scoring
"""
from typing import Dict, Any, List
from services.gemini_service import gemini_service
from core.logging_config import logger


class DiagnosticTriageAgent:
    """
    Agent for diagnostic triage
    Analyzes symptoms and provides risk assessment
    """
    
    def __init__(self):
        self.name = "Diagnostic Triage Agent"
        logger.info(f"{self.name} initialized")
    
    async def analyze(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze patient symptoms
        
        Args:
            data: Dictionary containing:
                - symptoms: List of symptoms
                - patient_info: Patient demographic information
                
        Returns:
            Triage analysis with severity, recommendations, etc.
        """
        try:
            symptoms = data.get('symptoms', [])
            patient_info = data.get('patient_info', {})
            
            if not symptoms:
                return {
                    'error': 'No symptoms provided',
                    'severity': 'unknown',
                    'triage_score': 0
                }
            
            # Use Gemini service for analysis
            analysis = await gemini_service.analyze_symptoms(
                symptoms=symptoms,
                patient_info=patient_info
            )
            
            logger.info(f"Triage analysis completed for patient. Severity: {analysis.get('severity')}")
            
            return {
                'agent': self.name,
                'severity': analysis.get('severity', 'medium'),
                'triage_score': analysis.get('triage_score', 50),
                'analysis': analysis.get('analysis', ''),
                'doctor_required': analysis.get('doctor_required', True),
                'recommendations': self._generate_recommendations(analysis),
                'status': 'success'
            }
            
        except Exception as e:
            logger.error(f"Triage analysis error: {e}")
            return {
                'error': str(e),
                'severity': 'unknown',
                'status': 'error'
            }
    
    def _generate_recommendations(self, analysis: Dict[str, Any]) -> List[str]:
        """
        Generate actionable recommendations based on analysis
        
        Args:
            analysis: Triage analysis results
            
        Returns:
            List of recommendations
        """
        recommendations = []
        
        severity = analysis.get('severity', 'medium')
        
        if severity == 'critical':
            recommendations.extend([
                'Immediate medical attention required',
                'Call emergency services or arrange immediate transport',
                'Monitor vital signs continuously'
            ])
        elif severity == 'high':
            recommendations.extend([
                'Consult doctor within 24 hours',
                'Monitor symptoms closely',
                'Keep patient comfortable and hydrated'
            ])
        elif severity == 'medium':
            recommendations.extend([
                'Schedule doctor consultation',
                'Monitor symptoms for changes',
                'Maintain proper rest and hydration'
            ])
        else:  # low
            recommendations.extend([
                'Home care may be sufficient',
                'Monitor symptoms',
                'Consult doctor if symptoms worsen'
            ])
        
        return recommendations
    
    async def batch_triage(self, patients: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Perform triage on multiple patients
        
        Args:
            patients: List of patient data dictionaries
            
        Returns:
            List of triage results
        """
        results = []
        for patient_data in patients:
            result = await self.analyze(patient_data)
            results.append(result)
        return results
    
    def calculate_priority(self, triage_score: int, wait_time_minutes: int = 0) -> int:
        """
        Calculate patient priority for queue management
        
        Args:
            triage_score: Triage score (0-100)
            wait_time_minutes: Time patient has been waiting
            
        Returns:
            Priority score (higher = more urgent)
        """
        # Base priority from triage score
        priority = triage_score
        
        # Add wait time factor (increase priority for longer waits)
        wait_factor = min(wait_time_minutes / 10, 20)  # Max 20 points from waiting
        priority += wait_factor
        
        return int(priority)


# Create agent instance
diagnostic_triage_agent = DiagnosticTriageAgent()
