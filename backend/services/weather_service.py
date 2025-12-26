"""
Weather Service using OpenWeatherMap API
Provides weather data for surge prediction
"""
import httpx
from core.config import settings
from core.logging_config import logger
from typing import Dict, Any, Optional


class WeatherService:
    """Service for weather data retrieval"""
    
    def __init__(self):
        self.api_key = settings.OPENWEATHER_API_KEY
        self.base_url = "https://api.openweathermap.org/data/2.5"
    
    async def get_current_weather(
        self,
        city: str = "Mumbai",
        country: str = "IN"
    ) -> Optional[Dict[str, Any]]:
        """
        Get current weather data
        
        Args:
            city: City name
            country: Country code (default: IN for India)
            
        Returns:
            Weather data dictionary
        """
        try:
            url = f"{self.base_url}/weather"
            params = {
                'q': f"{city},{country}",
                'appid': self.api_key,
                'units': 'metric'  # Celsius
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params, timeout=10.0)
                response.raise_for_status()
                
                data = response.json()
                
                return {
                    'temperature': data['main']['temp'],
                    'humidity': data['main']['humidity'],
                    'pressure': data['main']['pressure'],
                    'weather': data['weather'][0]['main'],
                    'description': data['weather'][0]['description'],
                    'wind_speed': data['wind']['speed'],
                    'clouds': data.get('clouds', {}).get('all', 0),
                    'rain': data.get('rain', {}).get('1h', 0),
                    'timestamp': data['dt']
                }
                
        except Exception as e:
            logger.error(f"Weather API error: {e}")
            return None
    
    async def get_forecast(
        self,
        city: str = "Mumbai",
        country: str = "IN",
        days: int = 3
    ) -> Optional[list]:
        """
        Get weather forecast
        
        Args:
            city: City name
            country: Country code
            days: Number of days (max 5 for free tier)
            
        Returns:
            List of forecast data
        """
        try:
            url = f"{self.base_url}/forecast"
            params = {
                'q': f"{city},{country}",
                'appid': self.api_key,
                'units': 'metric',
                'cnt': days * 8  # 8 forecasts per day (3-hour intervals)
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params, timeout=10.0)
                response.raise_for_status()
                
                data = response.json()
                
                forecasts = []
                for item in data['list']:
                    forecasts.append({
                        'timestamp': item['dt'],
                        'temperature': item['main']['temp'],
                        'humidity': item['main']['humidity'],
                        'weather': item['weather'][0]['main'],
                        'rain': item.get('rain', {}).get('3h', 0),
                        'wind_speed': item['wind']['speed']
                    })
                
                return forecasts
                
        except Exception as e:
            logger.error(f"Weather forecast error: {e}")
            return None


# Global service instance
weather_service = WeatherService()
