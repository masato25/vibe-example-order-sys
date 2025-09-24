from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import asyncio
import httpx
import os
from decimal import Decimal
from datetime import datetime, timedelta
import redis
import json

app = FastAPI(
    title="Restaurant Pricing Service",
    description="Dynamic pricing microservice for restaurant ordering system",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis connection for caching
redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    password=os.getenv("REDIS_PASSWORD"),
    decode_responses=True
)

# Pydantic models
class PricingRequest(BaseModel):
    item_ids: List[int]

class PricingResponse(BaseModel):
    item_id: int
    original_price: float
    dynamic_price: float
    discount_percentage: Optional[float] = None
    surge_multiplier: Optional[float] = None
    reason: str

class OrderCalculationRequest(BaseModel):
    items: List[dict]
    customer_id: Optional[int] = None
    order_type: str = "delivery"
    promo_code: Optional[str] = None

class OrderCalculationResponse(BaseModel):
    subtotal: float
    tax_amount: float
    delivery_fee: float
    discount_amount: float
    total_amount: float
    applied_discounts: List[dict] = []

# Business logic
class PricingEngine:
    def __init__(self):
        self.base_tax_rate = float(os.getenv("TAX_RATE", "0.0875"))
        self.base_delivery_fee = float(os.getenv("DELIVERY_FEE", "3.99"))
        self.free_delivery_minimum = float(os.getenv("FREE_DELIVERY_MINIMUM", "25.00"))
    
    async def get_menu_item_data(self, item_ids: List[int]) -> dict:
        """Fetch menu item data from Directus"""
        cache_key = f"menu_items:{':'.join(map(str, item_ids))}"
        cached_data = redis_client.get(cache_key)
        
        if cached_data:
            return json.loads(cached_data)
        
        directus_url = os.getenv("DIRECTUS_URL", "http://localhost:8055")
        items_filter = ",".join(map(str, item_ids))
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{directus_url}/items/menu_items?filter[id][_in]={items_filter}&fields=id,name,price,category_id,is_available"
            )
            data = response.json()
            
            # Cache for 5 minutes
            redis_client.setex(cache_key, 300, json.dumps(data))
            return data
    
    async def get_inventory_data(self, item_ids: List[int]) -> dict:
        """Get inventory data for pricing decisions"""
        cache_key = f"inventory:{':'.join(map(str, item_ids))}"
        cached_data = redis_client.get(cache_key)
        
        if cached_data:
            return json.loads(cached_data)
        
        directus_url = os.getenv("DIRECTUS_URL", "http://localhost:8055")
        items_filter = ",".join(map(str, item_ids))
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{directus_url}/items/inventory?filter[menu_item_id][_in]={items_filter}&fields=menu_item_id,current_stock,minimum_stock"
            )
            data = response.json()
            
            # Cache for 1 minute (more frequent updates for inventory)
            redis_client.setex(cache_key, 60, json.dumps(data))
            return data
    
    async def calculate_dynamic_pricing(self, item_ids: List[int]) -> List[PricingResponse]:
        """Calculate dynamic pricing based on various factors"""
        menu_data = await self.get_menu_item_data(item_ids)
        inventory_data = await self.get_inventory_data(item_ids)
        
        # Create lookup dictionaries
        menu_items = {item["id"]: item for item in menu_data.get("data", [])}
        inventory_items = {item["menu_item_id"]: item for item in inventory_data.get("data", [])}
        
        pricing_results = []
        
        for item_id in item_ids:
            menu_item = menu_items.get(item_id)
            if not menu_item:
                continue
                
            inventory_item = inventory_items.get(item_id)
            original_price = float(menu_item["price"])
            dynamic_price = original_price
            reason = "Base price"
            discount_percentage = None
            surge_multiplier = None
            
            # Apply inventory-based pricing
            if inventory_item:
                current_stock = inventory_item["current_stock"]
                minimum_stock = inventory_item["minimum_stock"]
                
                # Low inventory surge pricing
                if current_stock <= minimum_stock * 2:
                    surge_multiplier = 1.15  # 15% increase
                    dynamic_price = original_price * surge_multiplier
                    reason = "Low inventory surge pricing"
                
                # Very low inventory
                elif current_stock <= minimum_stock:
                    surge_multiplier = 1.25  # 25% increase
                    dynamic_price = original_price * surge_multiplier
                    reason = "Critical inventory surge pricing"
            
            # Apply time-based pricing
            current_hour = datetime.now().hour
            
            # Happy hour discounts (2-5 PM)
            if 14 <= current_hour <= 17 and not surge_multiplier:
                discount_percentage = 0.10  # 10% discount
                dynamic_price = original_price * (1 - discount_percentage)
                reason = "Happy hour discount"
            
            # Peak hour surge (6-8 PM)
            elif 18 <= current_hour <= 20 and not surge_multiplier:
                surge_multiplier = 1.10  # 10% increase
                dynamic_price = original_price * surge_multiplier
                reason = "Peak hour surge pricing"
            
            # Late night discount (after 9 PM)
            elif current_hour >= 21 and not surge_multiplier:
                discount_percentage = 0.15  # 15% discount
                dynamic_price = original_price * (1 - discount_percentage)
                reason = "Late night discount"
            
            pricing_results.append(PricingResponse(
                item_id=item_id,
                original_price=original_price,
                dynamic_price=round(dynamic_price, 2),
                discount_percentage=discount_percentage,
                surge_multiplier=surge_multiplier,
                reason=reason
            ))
        
        return pricing_results
    
    async def calculate_order_total(self, request: OrderCalculationRequest) -> OrderCalculationResponse:
        """Calculate complete order total with taxes, fees, and discounts"""
        subtotal = 0.0
        applied_discounts = []
        
        # Calculate subtotal
        for item in request.items:
            item_total = float(item.get("unit_price", 0)) * int(item.get("quantity", 1))
            subtotal += item_total
        
        # Calculate delivery fee
        delivery_fee = 0.0
        if request.order_type == "delivery":
            if subtotal < self.free_delivery_minimum:
                delivery_fee = self.base_delivery_fee
            else:
                applied_discounts.append({
                    "type": "free_delivery",
                    "description": f"Free delivery on orders over ${self.free_delivery_minimum}",
                    "amount": self.base_delivery_fee
                })
        
        # Apply promo code discounts
        discount_amount = 0.0
        if request.promo_code:
            discount_info = await self.apply_promo_code(request.promo_code, subtotal)
            if discount_info:
                discount_amount = discount_info["amount"]
                applied_discounts.append(discount_info)
        
        # Calculate tax on subtotal minus discounts
        taxable_amount = max(0, subtotal - discount_amount)
        tax_amount = taxable_amount * self.base_tax_rate
        
        # Calculate total
        total_amount = subtotal + tax_amount + delivery_fee - discount_amount
        
        return OrderCalculationResponse(
            subtotal=round(subtotal, 2),
            tax_amount=round(tax_amount, 2),
            delivery_fee=round(delivery_fee, 2),
            discount_amount=round(discount_amount, 2),
            total_amount=round(total_amount, 2),
            applied_discounts=applied_discounts
        )
    
    async def apply_promo_code(self, promo_code: str, subtotal: float) -> Optional[dict]:
        """Apply promotional code discounts"""
        # In a real implementation, this would fetch from database
        # For now, using hardcoded promotional codes
        promo_codes = {
            "WELCOME10": {"type": "percentage", "value": 0.10, "min_order": 15.00},
            "SAVE5": {"type": "fixed", "value": 5.00, "min_order": 20.00},
            "FREESHIP": {"type": "free_delivery", "value": 3.99, "min_order": 0.00}
        }
        
        promo = promo_codes.get(promo_code.upper())
        if not promo:
            return None
        
        if subtotal < promo["min_order"]:
            return None
        
        if promo["type"] == "percentage":
            discount_amount = subtotal * promo["value"]
            return {
                "type": "promo_code",
                "code": promo_code,
                "description": f"{int(promo['value'] * 100)}% off your order",
                "amount": discount_amount
            }
        elif promo["type"] == "fixed":
            return {
                "type": "promo_code",
                "code": promo_code,
                "description": f"${promo['value']} off your order",
                "amount": promo["value"]
            }
        
        return None

# Initialize pricing engine
pricing_engine = PricingEngine()

# API endpoints
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "pricing-service", "timestamp": datetime.now().isoformat()}

@app.post("/pricing/dynamic", response_model=List[PricingResponse])
async def get_dynamic_pricing(request: PricingRequest):
    """Get dynamic pricing for menu items"""
    try:
        return await pricing_engine.calculate_dynamic_pricing(request.item_ids)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pricing calculation failed: {str(e)}")

@app.post("/pricing/calculate", response_model=OrderCalculationResponse)
async def calculate_order_total(request: OrderCalculationRequest):
    """Calculate complete order total"""
    try:
        return await pricing_engine.calculate_order_total(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Order calculation failed: {str(e)}")

@app.get("/pricing/promo/{code}")
async def validate_promo_code(code: str, subtotal: float = 0.0):
    """Validate promotional code"""
    try:
        discount_info = await pricing_engine.apply_promo_code(code, subtotal)
        if discount_info:
            return {"valid": True, "discount": discount_info}
        else:
            return {"valid": False, "message": "Invalid or expired promo code"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Promo validation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)