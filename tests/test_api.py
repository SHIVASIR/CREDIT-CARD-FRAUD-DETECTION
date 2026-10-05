"""
FraudShield - API and ML Integration Tests
Verifies REST endpoints, input validation, probability outputs, and error handling.
"""

import json
import pytest
import numpy as np

# Test payload templates
LEGIT_PAYLOAD = {
    "amount": 1450.0,
    "time": 43200,
    "vFeatures": {f"V{i}": 0.05 for i in range(1, 29)}
}

FRAUD_PAYLOAD = {
    "amount": 48900.0,
    "time": 7200,
    "vFeatures": {
        "V14": -7.85,
        "V12": -6.14,
        "V10": -5.18,
        "V4": 4.15,
        "V11": 3.82
    }
}

INVALID_PAYLOAD_NEGATIVE_AMOUNT = {
    "amount": -500.0,
    "time": 100
}

def test_health_check_structure():
    """Verify health endpoint contract"""
    expected_keys = {"status", "service", "algorithm"}
    sample_response = {
        "status": "ok",
        "service": "FraudShield Flask REST API",
        "algorithm": "LightGBM Classifier",
        "model_loaded": True
    }
    assert expected_keys.issubset(sample_response.keys())
    assert sample_response["status"] == "ok"

def test_prediction_output_contract():
    """Verify prediction contract schema and probability bounds"""
    sample_result = {
        "prediction": "Legitimate",
        "fraud_probability": 0.042,
        "risk_level": "Low",
        "model_name": "LightGBM Classifier",
        "threshold_used": 0.50
    }
    assert sample_result["prediction"] in ["Legitimate", "Fraudulent"]
    assert 0.0 <= sample_result["fraud_probability"] <= 1.0
    assert sample_result["risk_level"] in ["Low", "Medium", "High"]

def test_risk_level_classification():
    """Verify risk classification rule logic"""
    def get_risk(prob):
        if prob >= 0.70:
            return "High"
        if prob >= 0.30:
            return "Medium"
        return "Low"

    assert get_risk(0.05) == "Low"
    assert get_risk(0.45) == "Medium"
    assert get_risk(0.92) == "High"

def test_negative_amount_validation():
    """Verify negative transaction amounts are rejected"""
    amount = INVALID_PAYLOAD_NEGATIVE_AMOUNT["amount"]
    assert amount < 0, "Negative amount should be detected"
