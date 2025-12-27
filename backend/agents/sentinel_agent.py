"""
Sentinel Agent - Disease Surge Prediction
Monitors environmental and social data to predict disease surges 24-48 hours ahead
"""
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import asyncio
from core.logging_config import logger
from services.weather_service import WeatherService
from services.gemini_service import GeminiService


class SurgePrediction:
    """Data structure for surge predictions"""
    def __init__(
        self,
        surge_likelihood: str,
        confidence_score: int,
        predicted_cases: int,
        factors: Dict[str, Any],
        recommended_actions: List[str],
        prediction_time: datetime = None
    ):
        self.surge_likelihood = surge_likelihood
        self.confidence_score = confidence_score
        self.predicted_cases = predicted_cases
        self.factors = factors
        self.recommended_actions = recommended_actions
        self.prediction_time = prediction_time or datetime.now()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "surge_likelihood": self.surge_likelihood,
            "confidence_score": self.confidence_score,
            "predicted_cases": self.predicted_cases,
            "factors": self.factors,
            "recommended_actions": self.recommended_actions,
            "prediction_time": self.prediction_time.isoformat()
        }


class SentinelAgent:
    """
    Sentinel Agent for predictive surge forecasting
    Uses environmental data, social events, and AI to predict disease surges
    """
    
    def __init__(self):
        self.weather_service = WeatherService()
        self.gemini_service = GeminiService()
        
        # Risk factors for different weather conditions
        self.weather_risk_factors = {
            "high_temp_humidity": {
                "conditions": lambda temp, humidity: temp > 30 and humidity > 70,
                "diseases": ["dengue", "malaria", "cholera"],
                "risk_multiplier": 2.0
            },
            "cold_dry": {
                "conditions": lambda temp, humidity: temp < 15 and humidity < 40,
                "diseases": ["flu", "pneumonia", "common cold"],
                "risk_multiplier": 1.8
            },
            "monsoon": {
                "conditions": lambda temp, humidity: humidity > 85,
                "diseases": ["dengue", "malaria", "leptospirosis", "diarrhea"],
                "risk_multiplier": 2.5
            }
        }
        
        # Festival/event calendar (simplified)
        self.high_risk_events = [
            {"name": "Diwali", "month": 10, "duration_days": 5, "risk_multiplier": 1.5},
            {"name": "Holi", "month": 3, "duration_days": 3, "risk_multiplier": 1.4},
            {"name": "Ganesh Chaturthi", "month": 9, "duration_days": 10, "risk_multiplier": 1.6},
        ]
    
    async def fetch_environmental_data(self, location: str) -> Dict[str, Any]:
        """
        Fetch environmental data from various sources
        
        Args:
            location: Location name (city/village)
            
        Returns:
            Dictionary containing weather and environmental data
        """
        try:
            # Get weather forecast (7 days)
            weather_data = await self.weather_service.get_forecast(location)
            
            # Get AQI data (air quality index)
            aqi_data = await self._get_aqi_data(location)
            
            # Check for upcoming events
            upcoming_events = self._check_upcoming_events()
            
            return {
                "weather": weather_data,
                "aqi": aqi_data,
                "events": upcoming_events,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error fetching environmental data: {e}")
            return {
                "weather": None,
                "aqi": None,
                "events": [],
                "error": str(e)
            }
    
    async def _get_aqi_data(self, location: str) -> Optional[Dict[str, Any]]:
        """
        Get Air Quality Index data
        Placeholder for SAFAR API integration
        """
        # TODO: Integrate with SAFAR AQI API
        # For now, return mock data
        return {
            "aqi": 85,
            "category": "moderate",
            "pollutants": {
                "pm25": 45,
                "pm10": 85,
                "no2": 25
            }
        }
    
    def _check_upcoming_events(self) -> List[Dict[str, Any]]:
        """
        Check for upcoming festivals/events in the next 7 days
        """
        current_date = datetime.now()
        current_month = current_date.month
        current_day = current_date.day
        
        upcoming = []
        for event in self.high_risk_events:
            # Simplified check - just checking month
            if event["month"] == current_month:
                upcoming.append({
                    "name": event["name"],
                    "risk_multiplier": event["risk_multiplier"],
                    "duration_days": event["duration_days"]
                })
        
        return upcoming
    
    async def predict_surge(
        self,
        location: str,
        historical_data: Optional[List[Dict]] = None
    ) -> SurgePrediction:
        """
        Predict disease surge for a location
        
        Args:
            location: Location name
            historical_data: Optional historical patient data
            
        Returns:
            SurgePrediction object with forecast details
        """
        try:
            # Fetch current environmental data
            env_data = await self.fetch_environmental_data(location)
            
            # Calculate risk factors
            risk_factors = self._calculate_risk_factors(env_data)
            
            # Use AI to analyze and predict
            ai_prediction = await self._ai_analyze_surge_risk(
                env_data,
                risk_factors,
                historical_data
            )
            
            # Combine all factors to create final prediction
            prediction = self._create_prediction(
                env_data,
                risk_factors,
                ai_prediction
            )
            
            return prediction
            
        except Exception as e:
            logger.error(f"Error in surge prediction: {e}")
            # Return a safe default prediction
            return SurgePrediction(
                surge_likelihood="unknown",
                confidence_score=0,
                predicted_cases=0,
                factors={"error": str(e)},
                recommended_actions=["Check system logs for errors"]
            )
    
    def _calculate_risk_factors(self, env_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate risk factors from environmental data
        """
        risk_score = 0
        risk_multipliers = []
        contributing_factors = []
        
        # Weather-based risks
        weather = env_data.get("weather", {})
        if weather:
            temp = weather.get("temperature", 25)
            humidity = weather.get("humidity", 50)
            
            for factor_name, factor_info in self.weather_risk_factors.items():
                if factor_info["conditions"](temp, humidity):
                    risk_score += 30
                    risk_multipliers.append(factor_info["risk_multiplier"])
                    contributing_factors.append({
                        "type": "weather",
                        "name": factor_name,
                        "diseases": factor_info["diseases"]
                    })
        
        # AQI-based risks
        aqi = env_data.get("aqi", {})
        if aqi:
            aqi_value = aqi.get("aqi", 0)
            if aqi_value > 100:
                risk_score += 20
                contributing_factors.append({
                    "type": "air_quality",
                    "name": "poor_aqi",
                    "diseases": ["asthma", "respiratory infections"]
                })
        
        # Event-based risks
        events = env_data.get("events", [])
        if events:
            for event in events:
                risk_score += 25
                risk_multipliers.append(event["risk_multiplier"])
                contributing_factors.append({
                    "type": "event",
                    "name": event["name"],
                    "diseases": ["communicable diseases"]
                })
        
        # Calculate average multiplier
        avg_multiplier = sum(risk_multipliers) / len(risk_multipliers) if risk_multipliers else 1.0
        
        return {
            "base_risk_score": min(risk_score, 100),
            "risk_multiplier": avg_multiplier,
            "contributing_factors": contributing_factors,
            "total_factors": len(contributing_factors)
        }
    
    async def _ai_analyze_surge_risk(
        self,
        env_data: Dict[str, Any],
        risk_factors: Dict[str, Any],
        historical_data: Optional[List[Dict]]
    ) -> Dict[str, Any]:
        """
        Use Gemini AI to analyze surge risk with contextual reasoning
        """
        try:
            # Prepare prompt for AI analysis
            prompt = f"""
You are a public health expert analyzing disease surge risks for a rural area in India.

Current Environmental Data:
- Weather: {env_data.get('weather', 'Not available')}
- Air Quality: {env_data.get('aqi', 'Not available')}
- Upcoming Events: {env_data.get('events', 'None')}

Risk Factors Identified:
- Base Risk Score: {risk_factors.get('base_risk_score', 0)}/100
- Contributing Factors: {len(risk_factors.get('contributing_factors', []))} factors detected

Based on this data, provide:
1. Likelihood of disease surge in next 24-48 hours (low/medium/high/critical)
2. Confidence level (0-100)
3. Estimated number of cases (0-500)
4. Top 3 recommended preventive actions
5. Diseases most likely to surge

Format your response as:
LIKELIHOOD: [low/medium/high/critical]
CONFIDENCE: [0-100]
CASES: [number]
ACTIONS:
1. [action 1]
2. [action 2]
3. [action 3]
DISEASES: [disease list]
"""
            
            # Call Gemini AI
            ai_response = await self.gemini_service.generate_text(
                prompt=prompt,
                system_instruction="You are a medical epidemiology expert specializing in rural healthcare.",
                temperature=0.3  # Lower temperature for more consistent predictions
            )
            
            # Parse AI response
            parsed = self._parse_ai_response(ai_response)
            return parsed
            
        except Exception as e:
            logger.error(f"Error in AI analysis: {e}")
            return {
                "likelihood": "medium",
                "confidence": 50,
                "predicted_cases": 10,
                "actions": ["Monitor situation closely"],
                "diseases": ["general"]
            }
    
    def _parse_ai_response(self, response: str) -> Dict[str, Any]:
        """
        Parse structured response from AI
        """
        result = {
            "likelihood": "medium",
            "confidence": 50,
            "predicted_cases": 10,
            "actions": [],
            "diseases": []
        }
        
        try:
            lines = response.strip().split('\n')
            current_section = None
            
            for line in lines:
                line = line.strip()
                if line.startswith("LIKELIHOOD:"):
                    result["likelihood"] = line.split(":", 1)[1].strip().lower()
                elif line.startswith("CONFIDENCE:"):
                    conf_str = line.split(":", 1)[1].strip()
                    result["confidence"] = int(''.join(filter(str.isdigit, conf_str)) or 50)
                elif line.startswith("CASES:"):
                    cases_str = line.split(":", 1)[1].strip()
                    result["predicted_cases"] = int(''.join(filter(str.isdigit, cases_str)) or 10)
                elif line.startswith("ACTIONS:"):
                    current_section = "actions"
                elif line.startswith("DISEASES:"):
                    diseases_str = line.split(":", 1)[1].strip()
                    result["diseases"] = [d.strip() for d in diseases_str.split(",")]
                elif current_section == "actions" and line.startswith(("1.", "2.", "3.")):
                    action = line.split(".", 1)[1].strip() if "." in line else line
                    result["actions"].append(action)
        except Exception as e:
            logger.warning(f"Error parsing AI response: {e}")
        
        return result
    
    def _create_prediction(
        self,
        env_data: Dict[str, Any],
        risk_factors: Dict[str, Any],
        ai_prediction: Dict[str, Any]
    ) -> SurgePrediction:
        """
        Create final surge prediction combining all analysis
        """
        # Adjust AI prediction based on risk multiplier
        adjusted_cases = int(
            ai_prediction["predicted_cases"] * risk_factors.get("risk_multiplier", 1.0)
        )
        
        return SurgePrediction(
            surge_likelihood=ai_prediction["likelihood"],
            confidence_score=ai_prediction["confidence"],
            predicted_cases=adjusted_cases,
            factors={
                "weather_data": env_data.get("weather"),
                "aqi_data": env_data.get("aqi"),
                "events": env_data.get("events"),
                "risk_factors": risk_factors,
                "diseases_likely": ai_prediction.get("diseases", [])
            },
            recommended_actions=ai_prediction["actions"]
        )
    
    async def trigger_alerts(
        self,
        prediction: SurgePrediction,
        alert_threshold: int = 70
    ) -> Dict[str, Any]:
        """
        Trigger alerts if surge likelihood is high
        
        Args:
            prediction: SurgePrediction object
            alert_threshold: Confidence threshold for triggering alerts (default: 70)
            
        Returns:
            Dictionary with alert status and actions taken
        """
        alerts_triggered = []
        
        try:
            # Check if alert should be triggered
            if prediction.confidence_score >= alert_threshold:
                logger.warning(
                    f"SURGE ALERT: {prediction.surge_likelihood} likelihood "
                    f"with {prediction.confidence_score}% confidence"
                )
                
                # Alert admin dashboard (would integrate with notification system)
                alerts_triggered.append({
                    "type": "admin_dashboard",
                    "status": "sent",
                    "message": f"Surge predicted: {prediction.predicted_cases} cases expected"
                })
                
                # Alert logistics agent for inventory check
                if prediction.surge_likelihood in ["high", "critical"]:
                    alerts_triggered.append({
                        "type": "logistics_agent",
                        "status": "sent",
                        "message": "Check inventory levels for surge preparation"
                    })
                
                # Notify ASHA workers
                alerts_triggered.append({
                    "type": "asha_workers",
                    "status": "sent",
                    "message": f"Be prepared for potential surge: {', '.join(prediction.factors.get('diseases_likely', []))}"
                })
            
            return {
                "alerts_triggered": len(alerts_triggered),
                "alerts": alerts_triggered,
                "should_alert": prediction.confidence_score >= alert_threshold
            }
            
        except Exception as e:
            logger.error(f"Error triggering alerts: {e}")
            return {
                "alerts_triggered": 0,
                "alerts": [],
                "error": str(e)
            }


# Global instance
sentinel_agent = SentinelAgent()
