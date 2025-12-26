"""
Agent Orchestrator
Coordinates all 9 AI agents using a swarm protocol
"""
from typing import Dict, Any, Optional, List
from core.logging_config import logger
from enum import Enum


class AgentType(Enum):
    """Types of agents in the system"""
    SENTINEL = "sentinel"  # Surge prediction
    LOGISTICS = "logistics"  # Supply chain
    TRIAGE = "triage"  # Diagnostic triage
    PRIVACY = "privacy"  # Data privacy
    NUTRITION = "nutrition"  # Meal planning
    TELEMEDICINE = "telemedicine"  # Doctor handoff
    COMMUNICATION = "communication"  # SMS/WhatsApp
    IMAGE = "image"  # Image analysis
    ASHA = "asha"  # ASHA support


class AgentOrchestrator:
    """
    Orchestrates communication between agents
    Implements a simple swarm protocol for coordination
    """
    
    def __init__(self):
        self.agents = {}
        self.agent_states = {}
        logger.info("Agent Orchestrator initialized")
    
    def register_agent(self, agent_type: AgentType, agent_instance):
        """Register an agent with the orchestrator"""
        self.agents[agent_type] = agent_instance
        self.agent_states[agent_type] = {
            'status': 'idle',
            'last_action': None,
            'last_result': None
        }
        logger.info(f"Registered agent: {agent_type.value}")
    
    async def execute_workflow(
        self,
        workflow_type: str,
        input_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute a multi-agent workflow
        
        Args:
            workflow_type: Type of workflow to execute
            input_data: Input data for the workflow
            
        Returns:
            Workflow execution results
        """
        logger.info(f"Executing workflow: {workflow_type}")
        
        try:
            if workflow_type == "patient_triage":
                return await self._triage_workflow(input_data)
            elif workflow_type == "surge_prediction":
                return await self._surge_workflow(input_data)
            elif workflow_type == "nutrition_plan":
                return await self._nutrition_workflow(input_data)
            elif workflow_type == "telemedicine_booking":
                return await self._telemedicine_workflow(input_data)
            else:
                logger.warning(f"Unknown workflow type: {workflow_type}")
                return {'error': f'Unknown workflow: {workflow_type}'}
                
        except Exception as e:
            logger.error(f"Workflow execution error: {e}")
            return {'error': str(e)}
    
    async def _triage_workflow(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Patient triage workflow
        Coordinates Triage Agent, Communication Agent
        """
        results = {
            'workflow': 'patient_triage',
            'steps': []
        }
        
        # Step 1: Run triage analysis
        if AgentType.TRIAGE in self.agents:
            triage_agent = self.agents[AgentType.TRIAGE]
            triage_result = await triage_agent.analyze(data)
            results['steps'].append({
                'agent': 'triage',
                'action': 'symptom_analysis',
                'result': triage_result
            })
            results['triage'] = triage_result
        
        # Step 2: If high severity, alert communication agent (if registered)
        if results.get('triage', {}).get('severity') in ['high', 'critical']:
            if AgentType.COMMUNICATION in self.agents:
                comm_agent = self.agents[AgentType.COMMUNICATION]
                alert_result = await comm_agent.send_alert(
                    patient_id=data.get('patient_id'),
                    severity=results['triage']['severity']
                )
                results['steps'].append({
                    'agent': 'communication',
                    'action': 'send_alert',
                    'result': alert_result
                })
            else:
                results['steps'].append({
                    'agent': 'communication',
                    'action': 'send_alert',
                    'result': {'status': 'skipped', 'reason': 'agent_not_registered'}
                })
        
        return results
    
    async def _surge_workflow(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Surge prediction workflow
        Coordinates Sentinel Agent, Logistics Agent, Communication Agent
        """
        results = {
            'workflow': 'surge_prediction',
            'steps': []
        }
        
        # Step 1: Predict surge
        if AgentType.SENTINEL in self.agents:
            sentinel_agent = self.agents[AgentType.SENTINEL]
            prediction = await sentinel_agent.predict_surge(data)
            results['steps'].append({
                'agent': 'sentinel',
                'action': 'predict_surge',
                'result': prediction
            })
            results['prediction'] = prediction
        
        # Step 2: If high likelihood, trigger logistics
        if results.get('prediction', {}).get('likelihood', 0) > 70:
            if AgentType.LOGISTICS in self.agents:
                logistics_agent = self.agents[AgentType.LOGISTICS]
                logistics_result = await logistics_agent.prepare_supplies(
                    predicted_cases=results['prediction'].get('predicted_cases', 0)
                )
                results['steps'].append({
                    'agent': 'logistics',
                    'action': 'prepare_supplies',
                    'result': logistics_result
                })
        
        return results
    
    async def _nutrition_workflow(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Nutrition planning workflow
        Coordinates Nutrition Agent
        """
        results = {
            'workflow': 'nutrition_plan',
            'steps': []
        }
        
        if AgentType.NUTRITION in self.agents:
            nutrition_agent = self.agents[AgentType.NUTRITION]
            meal_plan = await nutrition_agent.generate_plan(data)
            results['steps'].append({
                'agent': 'nutrition',
                'action': 'generate_meal_plan',
                'result': meal_plan
            })
            results['meal_plan'] = meal_plan
        
        return results
    
    async def _telemedicine_workflow(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Telemedicine workflow
        Coordinates Telemedicine Agent, Communication Agent
        """
        results = {
            'workflow': 'telemedicine_booking',
            'steps': []
        }
        
        if AgentType.TELEMEDICINE in self.agents:
            tele_agent = self.agents[AgentType.TELEMEDICINE]
            booking = await tele_agent.create_booking(data)
            results['steps'].append({
                'agent': 'telemedicine',
                'action': 'create_booking',
                'result': booking
            })
            results['booking'] = booking
        
        return results
    
    def get_agent_status(self, agent_type: AgentType) -> Dict[str, Any]:
        """Get current status of an agent"""
        return self.agent_states.get(agent_type, {'status': 'not_registered'})
    
    def get_all_statuses(self) -> Dict[str, Any]:
        """Get status of all agents"""
        return {
            agent_type.value: state
            for agent_type, state in self.agent_states.items()
        }


# Global orchestrator instance
orchestrator = AgentOrchestrator()
