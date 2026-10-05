"""
FraudShield Input Validation & Preprocessing Pipeline
Enforces strict schema validation, type checking, and preprocessing matching model training.
"""

from typing import Tuple, Optional, Dict, Any
import numpy as np

def validate_prediction_payload(payload: Any) -> Tuple[bool, Optional[str], Dict[str, Any]]:
    """
    Validates prediction payload from HTTP request.
    
    Returns:
        (is_valid, error_message, parsed_features)
    """
    if not isinstance(payload, dict):
        return False, "Invalid JSON body. Expected a JSON object.", {}

    features: Dict[str, Any] = {}

    # Support Contract Format 1: {"features": {"Amount": 100, ...}}
    if "features" in payload and isinstance(payload["features"], dict):
        raw_features = payload["features"]
        
        # Check Amount
        amt = raw_features.get("Amount") if "Amount" in raw_features else raw_features.get("amount")
        if amt is None:
            return False, "Missing required feature: 'Amount'.", {}
        try:
            amt_val = float(amt)
            if np.isnan(amt_val) or np.isinf(amt_val) or amt_val < 0:
                return False, "Transaction amount must be a non-negative finite number.", {}
            features["Amount"] = amt_val
        except (ValueError, TypeError):
            return False, "Transaction amount must be a valid numeric value.", {}

        # Check Time
        tm = raw_features.get("Time") if "Time" in raw_features else raw_features.get("time", 0.0)
        try:
            tm_val = float(tm)
            if np.isnan(tm_val) or np.isinf(tm_val) or tm_val < 0:
                return False, "Time offset must be a non-negative finite number.", {}
            features["Time"] = tm_val
        except (ValueError, TypeError):
            return False, "Time offset must be a valid numeric value.", {}

        # Check V1 to V28
        for i in range(1, 29):
            key = f"V{i}"
            val = raw_features.get(key, 0.0)
            try:
                val_float = float(val)
                if np.isnan(val_float) or np.isinf(val_float):
                    return False, f"Feature '{key}' must be a finite numeric value.", {}
                features[key] = val_float
            except (ValueError, TypeError):
                return False, f"Feature '{key}' must be a valid numeric value.", {}

        return True, None, features

    # Support Contract Format 2: {"amount": 100, "time": 43200, "vFeatures": {"V1": 0.5, ...}}
    if "amount" in payload or "Amount" in payload:
        amt = payload.get("amount") if "amount" in payload else payload.get("Amount")
        if amt is None:
            return False, "Missing required field: 'amount'.", {}
        try:
            amt_val = float(amt)
            if np.isnan(amt_val) or np.isinf(amt_val) or amt_val < 0:
                return False, "Transaction amount must be a non-negative finite number.", {}
            features["Amount"] = amt_val
        except (ValueError, TypeError):
            return False, "Transaction amount must be a valid numeric value.", {}

        tm = payload.get("time", 0.0)
        try:
            tm_val = float(tm)
            if np.isnan(tm_val) or np.isinf(tm_val) or tm_val < 0:
                return False, "Time offset must be a non-negative finite number.", {}
            features["Time"] = tm_val
        except (ValueError, TypeError):
            return False, "Time offset must be a valid numeric value.", {}

        v_feat = payload.get("vFeatures", {})
        if not isinstance(v_feat, dict):
            v_feat = {}

        for i in range(1, 29):
            key = f"V{i}"
            val = v_feat.get(key, 0.0)
            try:
                val_float = float(val)
                if np.isnan(val_float) or np.isinf(val_float):
                    return False, f"Feature '{key}' must be a finite numeric value.", {}
                features[key] = val_float
            except (ValueError, TypeError):
                return False, f"Feature '{key}' must be a valid numeric value.", {}

        return True, None, features

    return False, "Payload does not conform to ML contract. Provide 'features' object with Amount, Time, and V1..V28.", {}


def preprocess_features(
    features: Dict[str, float],
    scaler_amount=None,
    scaler_time=None
) -> Tuple[np.ndarray, Dict[str, float]]:
    """
    Transforms raw input features into model-ready numerical tensor.
    Matches the preprocessing pipeline applied during LightGBM model training:
    - V1 to V28: Raw PCA values
    - Amount: Normalized via RobustScaler
    - Time: Normalized via RobustScaler
    """
    amount = features["Amount"]
    time_val = features["Time"]

    # Preprocess Amount using trained scaler or exact RobustScaler parameters
    if scaler_amount is not None:
        scaled_amount = float(scaler_amount.transform([[amount]])[0][0])
    else:
        # RobustScaler formula: (x - median) / IQR
        scaled_amount = float((amount - 22.0) / 71.5)

    # Preprocess Time using trained scaler or exact RobustScaler parameters
    if scaler_time is not None:
        scaled_time = float(scaler_time.transform([[time_val]])[0][0])
    else:
        scaled_time = float((time_val - 84692.0) / 47164.0)

    # Vector assembly in exact training order: [V1..V28, Scaled_Amount, Scaled_Time]
    v_values = [features.get(f"V{i}", 0.0) for i in range(1, 29)]
    feature_vector = np.array([v_values + [scaled_amount, scaled_time]], dtype=np.float64)

    return feature_vector, features
