"""
ASHA Support Agent - Voice-guided workflows and offline support
Provides guidance, offline sync, and workflow suggestions for ASHA workers
"""
from typing import Dict, List, Optional, Any
from datetime import datetime
from core.logging_config import logger
from services.gemini_service import GeminiService
from services.translation_service import translation_service


class AshaSupportAgent:
    """
    ASHA Support Agent for workflow guidance and offline support
    Provides voice instructions and smart suggestions
    """
    
    def __init__(self):
        self.gemini_service = GeminiService()
        
        # Workflow steps in multiple languages
        self.workflow_steps = {
            "record_blood_pressure": {
                "en": "Please measure blood pressure. Normal range is 120/80. Record systolic and diastolic values.",
                "hi": "कृपया रक्तचाप नापें। सामान्य रेंज 120/80 है। सिस्टोलिक और डायस्टोलिक मान दर्ज करें।"
            },
            "record_temperature": {
                "en": "Measure temperature using thermometer. Normal is 98.6°F or 37°C. Record the reading.",
                "hi": "थर्मामीटर से तापमान नापें। सामान्य 98.6°F या 37°C है। रीडिंग दर्ज करें।"
            },
            "check_symptoms": {
                "en": "Ask patient about symptoms: fever, cough, difficulty breathing, body ache, fatigue.",
                "hi": "मरीज से लक्षणों के बारे में पूछें: बुखार, खांसी, सांस लेने में कठिनाई, शरीर में दर्द, थकान।"
            },
            "assess_malnutrition": {
                "en": "Check for malnutrition signs: weight loss, weak muscles, pale skin, swelling. Measure MUAC if available.",
                "hi": "कुपोषण के संकेत जांचें: वजन कम होना, कमजोर मांसपेशियां, पीली त्वचा, सूजन। उपलब्ध हो तो MUAC मापें।"
            }
        }
    
    async def generate_voice_instructions(
        self,
        step: str,
        language: str = "hi"
    ) -> Dict[str, Any]:
        """
        Generate voice-friendly instructions for a workflow step
        
        Args:
            step: Workflow step identifier
            language: Language code (en, hi, mr, ta, te, bn)
            
        Returns:
            Dictionary with text instructions and audio URL (if TTS is integrated)
        """
        try:
            logger.info(f"Generating voice instructions for step: {step} in {language}")
            
            # Get instruction text
            instruction = self.workflow_steps.get(step, {}).get(
                language,
                self.workflow_steps.get(step, {}).get("en", "Follow standard procedure")
            )
            
            # If instruction not in requested language, translate
            if step in self.workflow_steps and language not in self.workflow_steps[step]:
                try:
                    instruction = await translation_service.translate_text(
                        text=self.workflow_steps[step].get("en", ""),
                        source_lang="en",
                        target_lang=language
                    )
                except Exception as e:
                    logger.warning(f"Translation failed: {e}")
            
            return {
                "step": step,
                "language": language,
                "text": instruction,
                "audio_url": None,  # TODO: Integrate TTS service
                "duration_seconds": len(instruction) // 10  # Rough estimate
            }
            
        except Exception as e:
            logger.error(f"Error generating voice instructions: {e}")
            return {
                "step": step,
                "language": language,
                "text": "Please follow standard procedure",
                "error": str(e)
            }
    
    async def offline_sync_handler(
        self,
        asha_worker_id: int,
        offline_records: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Handle offline data sync when ASHA worker comes online
        
        Args:
            asha_worker_id: ASHA worker ID
            offline_records: List of records created offline
            
        Returns:
            Sync status and results
        """
        try:
            logger.info(f"Processing offline sync for ASHA worker {asha_worker_id}")
            
            synced_count = 0
            failed_count = 0
            conflicts = []
            
            for record in offline_records:
                try:
                    # Validate record
                    if not self._validate_offline_record(record):
                        failed_count += 1
                        conflicts.append({
                            "record_id": record.get("id"),
                            "error": "Invalid record format"
                        })
                        continue
                    
                    # Check for conflicts
                    # In production, this would check database for existing records
                    has_conflict = False
                    
                    if has_conflict:
                        conflicts.append({
                            "record_id": record.get("id"),
                            "type": "duplicate",
                            "action_needed": "manual_review"
                        })
                    else:
                        # Sync record to database
                        # In production, insert into appropriate table
                        synced_count += 1
                        logger.debug(f"Synced record: {record.get('id')}")
                    
                except Exception as e:
                    failed_count += 1
                    logger.error(f"Error syncing record: {e}")
            
            return {
                "status": "completed",
                "asha_worker_id": asha_worker_id,
                "total_records": len(offline_records),
                "synced": synced_count,
                "failed": failed_count,
                "conflicts": conflicts,
                "synced_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in offline sync: {e}")
            return {
                "status": "failed",
                "asha_worker_id": asha_worker_id,
                "error": str(e)
            }
    
    def _validate_offline_record(self, record: Dict[str, Any]) -> bool:
        """
        Validate offline record structure
        
        Args:
            record: Offline record dictionary
            
        Returns:
            True if valid, False otherwise
        """
        required_fields = ["id", "type", "created_at"]
        return all(field in record for field in required_fields)
    
    async def suggest_next_action(
        self,
        patient_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Use AI to suggest next action based on patient symptoms
        
        Args:
            patient_data: Patient information and symptoms
            
        Returns:
            Dictionary with suggested actions
        """
        try:
            logger.info("Generating next action suggestion")
            
            # Extract key information
            symptoms = patient_data.get("symptoms", [])
            age = patient_data.get("age", "unknown")
            gender = patient_data.get("gender", "unknown")
            vital_signs = patient_data.get("vital_signs", {})
            
            # Create prompt for AI
            prompt = f"""
You are an AI assistant helping an ASHA worker (community health worker) in rural India.

Patient Information:
- Age: {age}
- Gender: {gender}
- Symptoms: {', '.join(symptoms) if symptoms else 'None reported'}
- Vital Signs: {vital_signs if vital_signs else 'Not recorded'}

Based on this information, suggest the next 3 steps the ASHA worker should take.
Focus on:
1. What to check/measure next
2. What questions to ask
3. Whether to refer to PHC (Primary Health Center) immediately

Be practical and consider rural healthcare context.
Keep suggestions clear and actionable.

Format:
1. [First action]
2. [Second action]
3. [Third action]
URGENCY: [low/medium/high]
REFER_TO_PHC: [yes/no]
"""
            
            # Get AI suggestion
            ai_response = await self.gemini_service.generate_text(
                prompt=prompt,
                system_instruction="You are a healthcare assistant for community health workers.",
                temperature=0.3
            )
            
            # Parse response
            suggestions = self._parse_ai_suggestions(ai_response)
            
            logger.info(f"Generated {len(suggestions['actions'])} action suggestions")
            
            return suggestions
            
        except Exception as e:
            logger.error(f"Error generating suggestions: {e}")
            return {
                "actions": [
                    "Record vital signs if not done",
                    "Ask about symptom duration",
                    "Check for danger signs"
                ],
                "urgency": "medium",
                "refer_to_phc": False,
                "error": str(e)
            }
    
    def _parse_ai_suggestions(self, response: str) -> Dict[str, Any]:
        """
        Parse AI suggestion response
        """
        result = {
            "actions": [],
            "urgency": "medium",
            "refer_to_phc": False,
            "raw_response": response
        }
        
        try:
            lines = response.strip().split('\n')
            
            for line in lines:
                line = line.strip()
                
                # Extract numbered actions
                if line and line[0].isdigit() and '.' in line:
                    action = line.split('.', 1)[1].strip()
                    result["actions"].append(action)
                
                # Extract urgency
                elif line.startswith("URGENCY:"):
                    urgency = line.split(":", 1)[1].strip().lower()
                    if urgency in ["low", "medium", "high"]:
                        result["urgency"] = urgency
                
                # Extract PHC referral
                elif line.startswith("REFER_TO_PHC:"):
                    refer = line.split(":", 1)[1].strip().lower()
                    result["refer_to_phc"] = "yes" in refer
            
        except Exception as e:
            logger.warning(f"Error parsing AI suggestions: {e}")
        
        return result
    
    async def get_pending_tasks(
        self,
        asha_worker_id: int
    ) -> List[Dict[str, Any]]:
        """
        Get pending tasks for ASHA worker
        
        Args:
            asha_worker_id: ASHA worker ID
            
        Returns:
            List of pending tasks
        """
        try:
            # In production, query database for assigned tasks
            # For now, return mock tasks
            mock_tasks = [
                {
                    "task_id": 1,
                    "type": "home_visit",
                    "patient_name": "Sunita Devi",
                    "village": "Ralegaon",
                    "priority": "high",
                    "due_date": "2024-12-27",
                    "description": "Follow-up for diabetes management"
                },
                {
                    "task_id": 2,
                    "type": "vaccination",
                    "patient_name": "Baby Rahul",
                    "village": "Ralegaon",
                    "priority": "medium",
                    "due_date": "2024-12-28",
                    "description": "DPT vaccination due"
                }
            ]
            
            return mock_tasks
            
        except Exception as e:
            logger.error(f"Error fetching pending tasks: {e}")
            return []
    
    def get_available_workflows(self) -> List[Dict[str, str]]:
        """
        Get list of available workflow steps
        
        Returns:
            List of workflow steps with descriptions
        """
        return [
            {
                "step": "record_blood_pressure",
                "description": "Measure and record blood pressure",
                "category": "vital_signs"
            },
            {
                "step": "record_temperature",
                "description": "Measure and record temperature",
                "category": "vital_signs"
            },
            {
                "step": "check_symptoms",
                "description": "Check and record patient symptoms",
                "category": "assessment"
            },
            {
                "step": "assess_malnutrition",
                "description": "Assess malnutrition signs",
                "category": "nutrition"
            }
        ]


# Global instance
asha_support_agent = AshaSupportAgent()
