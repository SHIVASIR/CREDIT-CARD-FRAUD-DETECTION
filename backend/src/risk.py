"""
FraudShield Risk Calculation Engine
Centralizes risk-level assignment and classification based on MVP risk thresholds.
"""

from src.config import LOW_RISK_CUTOFF, HIGH_RISK_CUTOFF, DEFAULT_DECISION_THRESHOLD

def calculate_risk(
    fraud_probability: float,
    threshold: float = DEFAULT_DECISION_THRESHOLD,
    low_cutoff: float = LOW_RISK_CUTOFF,
    high_cutoff: float = HIGH_RISK_CUTOFF
) -> dict:
    """
    Computes classification decision and assigned MVP risk tier.
    
    MVP Thresholds:
      0.00 – 0.30: Low
      0.30 – 0.70: Medium
      0.70 – 1.00: High
    """
    prob_clean = max(0.0001, min(0.9999, float(fraud_probability)))

    if prob_clean >= high_cutoff:
        risk_level = "High"
        prediction = "Fraudulent"
    elif prob_clean >= low_cutoff:
        risk_level = "Medium"
        prediction = "Fraudulent" if prob_clean >= threshold else "Legitimate / Review"
    else:
        risk_level = "Low"
        prediction = "Legitimate"

    return {
        "prediction": prediction,
        "fraud_probability": round(prob_clean, 4),
        "risk_level": risk_level
    }
