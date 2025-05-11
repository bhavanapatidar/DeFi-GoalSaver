from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional
from savings_advisor import SavingsAdvisor
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="DeFi GoalSaver AI Service")
advisor = SavingsAdvisor()

class FinancialGoals(BaseModel):
    emergency_fund: bool
    retirement: bool
    major_purchase: bool

class SpendingPattern(BaseModel):
    discretionary: float
    essential: float
    investment: float

class UserData(BaseModel):
    age: int
    monthly_income: float
    monthly_expenses: float
    current_savings: float
    risk_tolerance: int
    financial_goals: FinancialGoals
    spending_pattern: SpendingPattern
    monthly_debt_payments: Optional[float] = 0
    emergency_fund: Optional[float] = 0
    retirement_savings: Optional[float] = 0

@app.post("/api/v1/savings-plan")
async def generate_savings_plan(user_data: UserData):
    """
    Generate a personalized savings plan based on user data
    """
    try:
        # Convert Pydantic model to dict
        user_data_dict = user_data.dict()
        
        # Generate savings plan
        savings_plan = advisor.generate_savings_plan(user_data_dict)
        
        return savings_plan
    except Exception as e:
        logger.error(f"Error generating savings plan: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/risk-profile")
async def calculate_risk_profile(user_data: UserData):
    """
    Calculate user's risk profile
    """
    try:
        # Convert Pydantic model to dict
        user_data_dict = user_data.dict()
        
        # Calculate risk profile
        risk_profile = advisor.calculate_risk_profile(user_data_dict)
        
        return risk_profile
    except Exception as e:
        logger.error(f"Error calculating risk profile: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 