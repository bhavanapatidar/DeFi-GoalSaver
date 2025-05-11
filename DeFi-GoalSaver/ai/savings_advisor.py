import numpy as np
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import pandas as pd
from datetime import datetime, timedelta
import joblib
from typing import Dict, List, Tuple, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SavingsAdvisor:
    def __init__(self):
        self.risk_model = RandomForestClassifier(n_estimators=100)
        self.savings_model = RandomForestRegressor(n_estimators=100)
        self.scaler = StandardScaler()
        self.is_trained = False

    def preprocess_user_data(self, user_data: Dict) -> np.ndarray:
        """
        Preprocess user input data for model prediction
        """
        features = [
            user_data['age'],
            user_data['monthly_income'],
            user_data['monthly_expenses'],
            user_data['current_savings'],
            user_data['risk_tolerance'],  # 1-5 scale
            user_data['financial_goals']['emergency_fund'],
            user_data['financial_goals']['retirement'],
            user_data['financial_goals']['major_purchase'],
            user_data['spending_pattern']['discretionary'],
            user_data['spending_pattern']['essential'],
            user_data['spending_pattern']['investment']
        ]
        return np.array(features).reshape(1, -1)

    def calculate_risk_profile(self, user_data: Dict) -> Dict:
        """
        Calculate user's risk profile based on various factors
        """
        risk_factors = {
            'income_stability': self._calculate_income_stability(user_data),
            'expense_ratio': self._calculate_expense_ratio(user_data),
            'savings_rate': self._calculate_savings_rate(user_data),
            'debt_ratio': self._calculate_debt_ratio(user_data),
            'emergency_fund': self._calculate_emergency_fund_adequacy(user_data)
        }

        risk_score = sum(risk_factors.values()) / len(risk_factors)
        risk_category = self._categorize_risk(risk_score)

        return {
            'risk_score': risk_score,
            'risk_category': risk_category,
            'risk_factors': risk_factors
        }

    def generate_savings_plan(self, user_data: Dict) -> Dict:
        """
        Generate personalized savings plan based on user data and risk profile
        """
        risk_profile = self.calculate_risk_profile(user_data)
        
        # Calculate optimal savings targets
        targets = self._calculate_savings_targets(user_data, risk_profile)
        
        # Generate weekly savings recommendations
        weekly_plan = self._generate_weekly_plan(user_data, targets)
        
        # Calculate timeline for goals
        timelines = self._calculate_goal_timelines(user_data, targets)

        return {
            'risk_profile': risk_profile,
            'savings_targets': targets,
            'weekly_plan': weekly_plan,
            'goal_timelines': timelines
        }

    def _calculate_income_stability(self, user_data: Dict) -> float:
        """Calculate income stability score (0-1)"""
        # Implementation would consider job stability, income history, etc.
        return 0.8  # Placeholder

    def _calculate_expense_ratio(self, user_data: Dict) -> float:
        """Calculate expense to income ratio (0-1)"""
        monthly_income = user_data['monthly_income']
        monthly_expenses = user_data['monthly_expenses']
        return min(monthly_expenses / monthly_income, 1.0)

    def _calculate_savings_rate(self, user_data: Dict) -> float:
        """Calculate current savings rate (0-1)"""
        monthly_income = user_data['monthly_income']
        monthly_savings = user_data['monthly_income'] - user_data['monthly_expenses']
        return min(monthly_savings / monthly_income, 1.0)

    def _calculate_debt_ratio(self, user_data: Dict) -> float:
        """Calculate debt to income ratio (0-1)"""
        monthly_income = user_data['monthly_income']
        monthly_debt = user_data.get('monthly_debt_payments', 0)
        return min(monthly_debt / monthly_income, 1.0)

    def _calculate_emergency_fund_adequacy(self, user_data: Dict) -> float:
        """Calculate emergency fund adequacy (0-1)"""
        monthly_expenses = user_data['monthly_expenses']
        emergency_fund = user_data.get('emergency_fund', 0)
        target_emergency_fund = monthly_expenses * 6  # 6 months of expenses
        return min(emergency_fund / target_emergency_fund, 1.0)

    def _categorize_risk(self, risk_score: float) -> str:
        """Categorize risk based on risk score"""
        if risk_score >= 0.8:
            return "Conservative"
        elif risk_score >= 0.6:
            return "Moderate"
        elif risk_score >= 0.4:
            return "Balanced"
        elif risk_score >= 0.2:
            return "Aggressive"
        else:
            return "Very Aggressive"

    def _calculate_savings_targets(self, user_data: Dict, risk_profile: Dict) -> Dict:
        """Calculate optimal savings targets based on user data and risk profile"""
        monthly_income = user_data['monthly_income']
        risk_category = risk_profile['risk_category']

        # Define target savings rates based on risk category
        target_rates = {
            "Conservative": 0.30,
            "Moderate": 0.25,
            "Balanced": 0.20,
            "Aggressive": 0.15,
            "Very Aggressive": 0.10
        }

        target_savings_rate = target_rates[risk_category]
        monthly_target = monthly_income * target_savings_rate

        return {
            'monthly_target': monthly_target,
            'weekly_target': monthly_target / 4,
            'target_savings_rate': target_savings_rate
        }

    def _generate_weekly_plan(self, user_data: Dict, targets: Dict) -> List[Dict]:
        """Generate weekly savings plan with specific recommendations"""
        weekly_target = targets['weekly_target']
        current_savings = user_data['current_savings']
        goals = user_data['financial_goals']

        weekly_plan = []
        for week in range(1, 5):  # Generate 4-week plan
            # Adjust weekly target based on progress and goals
            adjusted_target = self._adjust_weekly_target(
                weekly_target,
                current_savings,
                goals,
                week
            )

            weekly_plan.append({
                'week': week,
                'target_amount': adjusted_target,
                'recommendations': self._generate_weekly_recommendations(
                    adjusted_target,
                    user_data,
                    week
                )
            })

        return weekly_plan

    def _adjust_weekly_target(self, base_target: float, current_savings: float,
                            goals: Dict, week: int) -> float:
        """Adjust weekly target based on progress and goals"""
        # Implementation would consider progress towards goals
        return base_target  # Placeholder

    def _generate_weekly_recommendations(self, target: float, user_data: Dict,
                                       week: int) -> List[str]:
        """Generate specific recommendations for the week"""
        recommendations = []
        
        # Add recommendations based on user's spending pattern
        if user_data['spending_pattern']['discretionary'] > 0.3:
            recommendations.append(
                f"Consider reducing discretionary spending by ${target * 0.2:.2f} this week"
            )
        
        if user_data['spending_pattern']['essential'] > 0.7:
            recommendations.append(
                "Review essential expenses for potential optimization"
            )
        
        # Add goal-specific recommendations
        if user_data['financial_goals']['emergency_fund']:
            recommendations.append(
                "Prioritize emergency fund contributions this week"
            )
        
        return recommendations

    def _calculate_goal_timelines(self, user_data: Dict, targets: Dict) -> Dict:
        """Calculate estimated timelines for achieving financial goals"""
        monthly_savings = targets['monthly_target']
        goals = user_data['financial_goals']
        
        timelines = {}
        
        # Calculate emergency fund timeline
        if goals['emergency_fund']:
            emergency_fund_target = user_data['monthly_expenses'] * 6
            current_emergency = user_data.get('emergency_fund', 0)
            months_to_emergency = (emergency_fund_target - current_emergency) / monthly_savings
            timelines['emergency_fund'] = {
                'target_amount': emergency_fund_target,
                'months_to_completion': max(0, months_to_emergency)
            }
        
        # Calculate retirement timeline
        if goals['retirement']:
            # Simplified retirement calculation
            retirement_target = user_data['monthly_income'] * 12 * 25  # 25x annual income
            current_retirement = user_data.get('retirement_savings', 0)
            months_to_retirement = (retirement_target - current_retirement) / monthly_savings
            timelines['retirement'] = {
                'target_amount': retirement_target,
                'months_to_completion': max(0, months_to_retirement)
            }
        
        return timelines

    def save_model(self, path: str):
        """Save the trained model to disk"""
        if self.is_trained:
            model_data = {
                'risk_model': self.risk_model,
                'savings_model': self.savings_model,
                'scaler': self.scaler
            }
            joblib.dump(model_data, path)
            logger.info(f"Model saved to {path}")
        else:
            logger.warning("No trained model to save")

    def load_model(self, path: str):
        """Load a trained model from disk"""
        try:
            model_data = joblib.load(path)
            self.risk_model = model_data['risk_model']
            self.savings_model = model_data['savings_model']
            self.scaler = model_data['scaler']
            self.is_trained = True
            logger.info(f"Model loaded from {path}")
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")

# Example usage
if __name__ == "__main__":
    # Example user data
    user_data = {
        'age': 30,
        'monthly_income': 5000,
        'monthly_expenses': 3000,
        'current_savings': 10000,
        'risk_tolerance': 3,
        'financial_goals': {
            'emergency_fund': True,
            'retirement': True,
            'major_purchase': False
        },
        'spending_pattern': {
            'discretionary': 0.3,
            'essential': 0.6,
            'investment': 0.1
        }
    }

    # Initialize and use the savings advisor
    advisor = SavingsAdvisor()
    savings_plan = advisor.generate_savings_plan(user_data)
    
    # Print the results
    print("\nRisk Profile:")
    print(f"Risk Category: {savings_plan['risk_profile']['risk_category']}")
    print(f"Risk Score: {savings_plan['risk_profile']['risk_score']:.2f}")
    
    print("\nSavings Targets:")
    print(f"Monthly Target: ${savings_plan['savings_targets']['monthly_target']:.2f}")
    print(f"Weekly Target: ${savings_plan['savings_targets']['weekly_target']:.2f}")
    
    print("\nWeekly Plan:")
    for week in savings_plan['weekly_plan']:
        print(f"\nWeek {week['week']}:")
        print(f"Target Amount: ${week['target_amount']:.2f}")
        print("Recommendations:")
        for rec in week['recommendations']:
            print(f"- {rec}")
    
    print("\nGoal Timelines:")
    for goal, timeline in savings_plan['goal_timelines'].items():
        print(f"\n{goal.replace('_', ' ').title()}:")
        print(f"Target Amount: ${timeline['target_amount']:.2f}")
        print(f"Months to Completion: {timeline['months_to_completion']:.1f}") 