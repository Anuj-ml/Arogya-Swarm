"""
AQI Service - Air Quality Index data fetching
Integrates with SAFAR API and provides air quality information
"""
from typing import Dict, Optional, Any
import httpx
from core.config import settings
from core.logging_config import logger


class AQIService:
    """Service for fetching Air Quality Index data"""
    
    def __init__(self):
        self.safar_api_key = settings.SAFAR_API_KEY
        # SAFAR (System of Air Quality and Weather Forecasting And Research)
        self.safar_base_url = "https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69"
        
    async def get_aqi(self, city: str) -> Dict[str, Any]:
        """
        Get AQI data for a city
        
        Args:
            city: City name
            
        Returns:
            Dictionary containing AQI value, category, and pollutant levels
        """
        try:
            # If API key is not configured, return mock data
            if not self.safar_api_key:
                logger.warning("SAFAR API key not configured, returning mock AQI data")
                return self._get_mock_aqi(city)
            
            # Make API request to SAFAR
            async with httpx.AsyncClient(timeout=10.0) as client:
                params = {
                    "api-key": self.safar_api_key,
                    "format": "json",
                    "filters[city]": city
                }
                
                response = await client.get(self.safar_base_url, params=params)
                response.raise_for_status()
                
                data = response.json()
                return self._parse_safar_response(data)
                
        except httpx.HTTPError as e:
            logger.error(f"HTTP error fetching AQI data: {e}")
            return self._get_mock_aqi(city)
        except Exception as e:
            logger.error(f"Error fetching AQI data: {e}")
            return self._get_mock_aqi(city)
    
    def _parse_safar_response(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse SAFAR API response
        """
        try:
            # SAFAR API structure may vary, this is a simplified parser
            records = data.get("records", [])
            if not records:
                return self._get_mock_aqi("Unknown")
            
            record = records[0]
            aqi_value = float(record.get("aqi", 0))
            
            return {
                "aqi": aqi_value,
                "category": self._get_aqi_category(aqi_value),
                "pollutants": {
                    "pm25": float(record.get("pm25", 0)),
                    "pm10": float(record.get("pm10", 0)),
                    "no2": float(record.get("no2", 0)),
                    "so2": float(record.get("so2", 0)),
                    "co": float(record.get("co", 0)),
                    "o3": float(record.get("o3", 0))
                },
                "timestamp": record.get("last_update", ""),
                "city": record.get("city", ""),
                "source": "SAFAR"
            }
        except Exception as e:
            logger.error(f"Error parsing SAFAR response: {e}")
            return self._get_mock_aqi("Unknown")
    
    def _get_aqi_category(self, aqi: float) -> str:
        """
        Categorize AQI value according to Indian standards
        
        AQI Categories:
        0-50: Good
        51-100: Satisfactory
        101-200: Moderate
        201-300: Poor
        301-400: Very Poor
        401-500: Severe
        """
        if aqi <= 50:
            return "good"
        elif aqi <= 100:
            return "satisfactory"
        elif aqi <= 200:
            return "moderate"
        elif aqi <= 300:
            return "poor"
        elif aqi <= 400:
            return "very_poor"
        else:
            return "severe"
    
    def _get_mock_aqi(self, city: str) -> Dict[str, Any]:
        """
        Generate mock AQI data for testing
        """
        # Different mock values for different cities
        mock_data = {
            "mumbai": {"aqi": 95, "pm25": 45, "pm10": 85},
            "delhi": {"aqi": 180, "pm25": 95, "pm10": 165},
            "pune": {"aqi": 75, "pm25": 35, "pm10": 65},
            "bangalore": {"aqi": 60, "pm25": 28, "pm10": 55},
            "default": {"aqi": 85, "pm25": 40, "pm10": 75}
        }
        
        city_lower = city.lower()
        data = mock_data.get(city_lower, mock_data["default"])
        
        return {
            "aqi": data["aqi"],
            "category": self._get_aqi_category(data["aqi"]),
            "pollutants": {
                "pm25": data["pm25"],
                "pm10": data["pm10"],
                "no2": 25,
                "so2": 15,
                "co": 1.2,
                "o3": 35
            },
            "city": city,
            "source": "mock_data",
            "timestamp": "2024-12-27T00:00:00Z"
        }
    
    def get_health_recommendations(self, aqi: float) -> Dict[str, Any]:
        """
        Get health recommendations based on AQI level
        
        Args:
            aqi: AQI value
            
        Returns:
            Dictionary with health recommendations
        """
        category = self._get_aqi_category(aqi)
        
        recommendations = {
            "good": {
                "general": "Air quality is satisfactory. Enjoy outdoor activities.",
                "sensitive": "No special precautions needed.",
                "color": "green"
            },
            "satisfactory": {
                "general": "Air quality is acceptable. Most people can enjoy outdoor activities.",
                "sensitive": "Unusually sensitive people should consider limiting prolonged outdoor exertion.",
                "color": "lightgreen"
            },
            "moderate": {
                "general": "Reduce prolonged outdoor exertion.",
                "sensitive": "People with respiratory disease should avoid prolonged outdoor exertion.",
                "color": "yellow"
            },
            "poor": {
                "general": "Avoid prolonged outdoor exertion. Consider wearing a mask.",
                "sensitive": "People with respiratory or heart disease should avoid outdoor exertion.",
                "color": "orange"
            },
            "very_poor": {
                "general": "Avoid all outdoor exertion. Stay indoors. Use air purifiers.",
                "sensitive": "People with respiratory or heart disease must stay indoors.",
                "color": "red"
            },
            "severe": {
                "general": "Health alert! Everyone should avoid outdoor exertion. Stay indoors.",
                "sensitive": "Emergency condition for people with respiratory diseases.",
                "color": "maroon"
            }
        }
        
        return {
            "category": category,
            "aqi": aqi,
            **recommendations.get(category, recommendations["moderate"])
        }


# Global instance
aqi_service = AQIService()
