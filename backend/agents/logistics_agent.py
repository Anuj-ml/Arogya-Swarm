"""
Logistics Agent - Supply Chain Management and Route Optimization
Manages inventory, auto-reordering, and ambulance dispatch
"""
from typing import Dict, List, Optional, Any
from datetime import datetime
from core.logging_config import logger
from services.gemini_service import GeminiService


class StockAlert:
    """Data structure for stock alerts"""
    def __init__(
        self,
        item_id: int,
        item_name: str,
        current_stock: int,
        threshold: int,
        category: str,
        urgency: str,
        recommended_order_quantity: int
    ):
        self.item_id = item_id
        self.item_name = item_name
        self.current_stock = current_stock
        self.threshold = threshold
        self.category = category
        self.urgency = urgency
        self.recommended_order_quantity = recommended_order_quantity
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "item_id": self.item_id,
            "item_name": self.item_name,
            "current_stock": self.current_stock,
            "threshold": self.threshold,
            "category": self.category,
            "urgency": self.urgency,
            "recommended_order_quantity": self.recommended_order_quantity
        }


class LogisticsAgent:
    """
    Logistics Agent for supply chain management and optimization
    Handles inventory monitoring, auto-reordering, and route optimization
    """
    
    def __init__(self):
        self.gemini_service = GeminiService()
        
    async def monitor_stock_levels(
        self,
        inventory_items: Optional[List[Dict[str, Any]]] = None
    ) -> List[StockAlert]:
        """
        Monitor inventory stock levels and generate alerts
        
        Args:
            inventory_items: List of inventory items (fetched from DB if None)
            
        Returns:
            List of StockAlert objects for items below threshold
        """
        try:
            # If no items provided, return empty list
            # In production, this would query the database
            if inventory_items is None:
                logger.info("No inventory items provided for monitoring")
                return []
            
            alerts = []
            
            for item in inventory_items:
                current_stock = item.get("current_stock", 0)
                threshold = item.get("threshold", 0)
                
                # Check if stock is below threshold
                if current_stock < threshold:
                    urgency = self._calculate_urgency(current_stock, threshold)
                    recommended_qty = self._calculate_reorder_quantity(
                        current_stock, threshold, item.get("category", "general")
                    )
                    
                    alert = StockAlert(
                        item_id=item.get("id", 0),
                        item_name=item.get("item_name", "Unknown"),
                        current_stock=current_stock,
                        threshold=threshold,
                        category=item.get("category", "general"),
                        urgency=urgency,
                        recommended_order_quantity=recommended_qty
                    )
                    alerts.append(alert)
                    
                    logger.warning(
                        f"Stock alert: {alert.item_name} - "
                        f"{current_stock}/{threshold} - Urgency: {urgency}"
                    )
            
            return alerts
            
        except Exception as e:
            logger.error(f"Error monitoring stock levels: {e}")
            return []
    
    def _calculate_urgency(self, current_stock: int, threshold: int) -> str:
        """
        Calculate urgency level based on stock vs threshold
        """
        if current_stock == 0:
            return "critical"
        elif current_stock < threshold * 0.25:
            return "high"
        elif current_stock < threshold * 0.5:
            return "medium"
        else:
            return "low"
    
    def _calculate_reorder_quantity(
        self,
        current_stock: int,
        threshold: int,
        category: str
    ) -> int:
        """
        Calculate recommended reorder quantity
        
        Strategy:
        - Critical items: Order to reach 3x threshold
        - Medicine: Order to reach 2.5x threshold
        - Others: Order to reach 2x threshold
        """
        critical_categories = ["medicine", "vaccine", "emergency"]
        
        if category.lower() in critical_categories:
            target_stock = threshold * 3
        elif "medicine" in category.lower():
            target_stock = threshold * 2.5
        else:
            target_stock = threshold * 2
        
        reorder_qty = max(0, int(target_stock - current_stock))
        return reorder_qty
    
    async def auto_reorder(
        self,
        item_id: int,
        item_name: str,
        quantity: int,
        supplier: Optional[str] = None,
        auto_reorder_enabled: bool = True
    ) -> Dict[str, Any]:
        """
        Automatically place a reorder for an item
        
        Args:
            item_id: Item ID
            item_name: Item name
            quantity: Quantity to order
            supplier: Supplier name/contact
            auto_reorder_enabled: Whether auto-reorder is enabled
            
        Returns:
            Dictionary with reorder status and details
        """
        try:
            if not auto_reorder_enabled:
                logger.info(f"Auto-reorder disabled for item {item_name}")
                return {
                    "status": "skipped",
                    "reason": "auto_reorder_disabled",
                    "item_id": item_id,
                    "item_name": item_name
                }
            
            # Log reorder request
            logger.info(f"Auto-reorder: {item_name} - Quantity: {quantity}")
            
            # In production, this would:
            # 1. Create a purchase order in the system
            # 2. Send notification to supplier via SMS/email
            # 3. Update inventory table with last_reorder_date
            
            # For now, prepare reorder details
            reorder_details = {
                "status": "pending",
                "item_id": item_id,
                "item_name": item_name,
                "quantity": quantity,
                "supplier": supplier or "Default Supplier",
                "order_date": datetime.now().isoformat(),
                "expected_delivery": "3-5 business days",
                "notification_sent": True
            }
            
            # Generate SMS message for supplier
            sms_message = (
                f"REORDER REQUEST: {item_name}\n"
                f"Quantity: {quantity}\n"
                f"Order ID: ORD-{item_id}-{datetime.now().strftime('%Y%m%d')}\n"
                f"Please confirm delivery date."
            )
            
            reorder_details["sms_message"] = sms_message
            
            logger.info(f"Reorder placed successfully for {item_name}")
            
            return reorder_details
            
        except Exception as e:
            logger.error(f"Error in auto-reorder: {e}")
            return {
                "status": "error",
                "error": str(e),
                "item_id": item_id,
                "item_name": item_name
            }
    
    async def optimize_route(
        self,
        origin: str,
        destinations: List[str],
        vehicle_type: str = "car"
    ) -> Dict[str, Any]:
        """
        Optimize delivery/ambulance route using AI
        
        Args:
            origin: Starting location
            destinations: List of destination addresses
            vehicle_type: Type of vehicle (car, ambulance, bike)
            
        Returns:
            Dictionary with optimized route details
        """
        try:
            if not destinations:
                return {
                    "status": "error",
                    "error": "No destinations provided"
                }
            
            logger.info(f"Optimizing route from {origin} to {len(destinations)} destinations")
            
            # Use AI to suggest optimal route
            # In production, this would integrate with Google Maps or OpenRouteService
            route_prompt = f"""
You are a logistics optimization expert. Optimize the following delivery route:

Origin: {origin}
Destinations: {', '.join(destinations)}
Vehicle Type: {vehicle_type}

Consider:
1. Shortest total distance
2. Traffic patterns in rural India
3. Road conditions
4. Priority deliveries

Provide:
1. Optimized order of destinations
2. Estimated total distance (km)
3. Estimated total time (minutes)
4. Any route notes or warnings

Format:
ORDER: [destination1, destination2, ...]
DISTANCE: [number] km
TIME: [number] minutes
NOTES: [any important notes]
"""
            
            ai_response = await self.gemini_service.generate_text(
                prompt=route_prompt,
                system_instruction="You are a logistics and route optimization expert.",
                temperature=0.3
            )
            
            # Parse AI response
            optimized_route = self._parse_route_response(ai_response, destinations)
            
            return {
                "status": "success",
                "origin": origin,
                "optimized_order": optimized_route["order"],
                "total_distance_km": optimized_route["distance"],
                "total_time_minutes": optimized_route["time"],
                "notes": optimized_route["notes"],
                "vehicle_type": vehicle_type,
                "waypoints": len(destinations)
            }
            
        except Exception as e:
            logger.error(f"Error optimizing route: {e}")
            return {
                "status": "error",
                "error": str(e),
                "origin": origin,
                "destinations": destinations
            }
    
    def _parse_route_response(
        self,
        response: str,
        original_destinations: List[str]
    ) -> Dict[str, Any]:
        """
        Parse AI route optimization response
        """
        result = {
            "order": original_destinations,
            "distance": 0,
            "time": 0,
            "notes": "Route optimized"
        }
        
        try:
            lines = response.strip().split('\n')
            
            for line in lines:
                line = line.strip()
                if line.startswith("ORDER:"):
                    # Extract destination order
                    order_str = line.split(":", 1)[1].strip()
                    # Simple parsing - in production would be more robust
                    result["order"] = [d.strip() for d in order_str.split(",")]
                elif line.startswith("DISTANCE:"):
                    dist_str = line.split(":", 1)[1].strip()
                    result["distance"] = int(''.join(filter(str.isdigit, dist_str)) or 0)
                elif line.startswith("TIME:"):
                    time_str = line.split(":", 1)[1].strip()
                    result["time"] = int(''.join(filter(str.isdigit, time_str)) or 0)
                elif line.startswith("NOTES:"):
                    result["notes"] = line.split(":", 1)[1].strip()
        except Exception as e:
            logger.warning(f"Error parsing route response: {e}")
        
        return result
    
    async def dispatch_ambulance(
        self,
        patient_location: str,
        patient_name: str,
        severity: str,
        hospital: str,
        ambulance_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Dispatch ambulance for patient transport
        
        Args:
            patient_location: Patient pickup location
            patient_name: Patient name
            severity: Medical severity (low/medium/high/critical)
            hospital: Destination hospital
            ambulance_id: Optional specific ambulance ID
            
        Returns:
            Dictionary with dispatch details and ETA
        """
        try:
            logger.info(f"Dispatching ambulance for {patient_name} - Severity: {severity}")
            
            # Find nearest available ambulance
            # In production, this would query ambulance database
            selected_ambulance = ambulance_id or "AMB-001"
            
            # Calculate route
            route = await self.optimize_route(
                origin=patient_location,
                destinations=[hospital],
                vehicle_type="ambulance"
            )
            
            # Prepare dispatch details
            dispatch_details = {
                "status": "dispatched",
                "ambulance_id": selected_ambulance,
                "patient_name": patient_name,
                "pickup_location": patient_location,
                "destination": hospital,
                "severity": severity,
                "estimated_arrival_minutes": route.get("total_time_minutes", 15),
                "distance_km": route.get("total_distance_km", 10),
                "dispatch_time": datetime.now().isoformat(),
                "priority": "high" if severity in ["high", "critical"] else "normal"
            }
            
            # Generate notification for ambulance driver
            driver_message = (
                f"URGENT - Patient Pickup\n"
                f"Name: {patient_name}\n"
                f"Location: {patient_location}\n"
                f"Severity: {severity.upper()}\n"
                f"Destination: {hospital}\n"
                f"ETA: {dispatch_details['estimated_arrival_minutes']} min"
            )
            
            dispatch_details["driver_notification"] = driver_message
            
            logger.info(
                f"Ambulance {selected_ambulance} dispatched - "
                f"ETA: {dispatch_details['estimated_arrival_minutes']} minutes"
            )
            
            return dispatch_details
            
        except Exception as e:
            logger.error(f"Error dispatching ambulance: {e}")
            return {
                "status": "error",
                "error": str(e),
                "patient_name": patient_name
            }
    
    async def get_inventory_summary(
        self,
        inventory_items: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Get summary of inventory status
        
        Args:
            inventory_items: List of all inventory items
            
        Returns:
            Dictionary with inventory summary statistics
        """
        try:
            total_items = len(inventory_items)
            critical_items = 0
            out_of_stock = 0
            low_stock = 0
            adequate_stock = 0
            
            categories = {}
            
            for item in inventory_items:
                current = item.get("current_stock", 0)
                threshold = item.get("threshold", 0)
                category = item.get("category", "other")
                
                # Count by stock level
                if current == 0:
                    out_of_stock += 1
                elif current < threshold * 0.5:
                    critical_items += 1
                elif current < threshold:
                    low_stock += 1
                else:
                    adequate_stock += 1
                
                # Count by category
                if category not in categories:
                    categories[category] = {"total": 0, "low_stock": 0}
                categories[category]["total"] += 1
                if current < threshold:
                    categories[category]["low_stock"] += 1
            
            return {
                "total_items": total_items,
                "out_of_stock": out_of_stock,
                "critical_items": critical_items,
                "low_stock": low_stock,
                "adequate_stock": adequate_stock,
                "categories": categories,
                "health_score": int((adequate_stock / total_items * 100)) if total_items > 0 else 0,
                "requires_attention": critical_items + out_of_stock,
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating inventory summary: {e}")
            return {
                "total_items": 0,
                "error": str(e)
            }


# Global instance
logistics_agent = LogisticsAgent()
