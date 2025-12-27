"""
Translation Service using MyMemory API
Supports 6 languages: English, Hindi, Marathi, Tamil, Telugu, Bengali
"""
import httpx
from core.config import settings
from core.logging_config import logger
from typing import Optional

# Language mapping
LANGUAGE_CODES = {
    'en': 'en-GB',
    'hi': 'hi-IN',
    'mr': 'mr-IN',
    'ta': 'ta-IN',
    'te': 'te-IN',
    'bn': 'bn-IN'
}


class TranslationService:
    """Service for text translation"""
    
    def __init__(self):
        self.base_url = "https://api.mymemory.translated.net/get"
        self.api_key = settings.MYMEMORY_API_KEY
    
    async def translate(
        self,
        text: str,
        source_lang: str = 'en',
        target_lang: str = 'hi'
    ) -> str:
        """
        Translate text from source language to target language
        
        Args:
            text: Text to translate
            source_lang: Source language code (en, hi, mr, ta, te, bn)
            target_lang: Target language code (en, hi, mr, ta, te, bn)
            
        Returns:
            Translated text
        """
        # Return original if same language
        if source_lang == target_lang:
            return text
        
        # Convert to MyMemory format
        source = LANGUAGE_CODES.get(source_lang, 'en-GB')
        target = LANGUAGE_CODES.get(target_lang, 'hi-IN')
        
        try:
            params = {
                'q': text,
                'langpair': f'{source}|{target}'
            }
            
            if self.api_key:
                params['key'] = self.api_key
            
            async with httpx.AsyncClient() as client:
                response = await client.get(self.base_url, params=params, timeout=10.0)
                response.raise_for_status()
                
                data = response.json()
                
                if data.get('responseStatus') == 200:
                    return data['responseData']['translatedText']
                else:
                    logger.warning(f"Translation failed: {data.get('responseDetails', 'Unknown error')}")
                    return text  # Return original on error
                    
        except Exception as e:
            logger.error(f"Translation error: {e}")
            return text  # Return original on error
    
    async def translate_batch(
        self,
        texts: list,
        source_lang: str = 'en',
        target_lang: str = 'hi'
    ) -> list:
        """
        Translate multiple texts
        
        Args:
            texts: List of texts to translate
            source_lang: Source language code
            target_lang: Target language code
            
        Returns:
            List of translated texts
        """
        translated = []
        for text in texts:
            result = await self.translate(text, source_lang, target_lang)
            translated.append(result)
        return translated


# Global service instance
translation_service = TranslationService()
