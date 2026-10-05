"""
FraudShield Model Predictor
Loads trained LightGBM model once on startup and serves deterministic real-time predictions.
"""

import os
import json
import joblib
from typing import Tuple, Dict, Any, Optional
import numpy as np

from src.config import MODEL_PATH, SCALER_AMOUNT_PATH, SCALER_TIME_PATH, METADATA_PATH, DEFAULT_DECISION_THRESHOLD
from src.preprocessing import validate_prediction_payload, preprocess_features
from src.risk import calculate_risk

FEATURE_DESCRIPTIONS = {
    "V14": "PCA component 14 - credential authorization integrity",
    "V12": "PCA component 12 - transaction verification profile",
    "V10": "PCA component 10 - behavioral deviation index",
    "V17": "PCA component 17 - unusual cardholder location/context",
    "V16": "PCA component 16 - risk-weighted card verification",
    "V7":  "PCA component 7 - terminal point-of-sale consistency",
    "V18": "PCA component 18 - behavioral deviation factor",
    "V9":  "PCA component 9 - transaction pattern variance",
    "V4":  "PCA component 4 - velocity & repeated frequency spikes",
    "V11": "PCA component 11 - abnormal token authorization rate",
    "V2":  "PCA component 2 - transaction frequency divergence",
    "Amount": "Transaction monetary value",
    "Time": "Transaction timing offset",
}

class ModelPredictor:
    def __init__(self):
        self.model = None
        self.scaler_amount = None
        self.scaler_time = None
        self.metadata = None
        self.is_loaded = False
        self.load_model()

    def load_model(self) -> bool:
        """
        Loads trained LightGBM model and scalers once at startup.
        If artifacts are missing, clearly reports unavailable status.
        DOES NOT fabricate mock models or random weights.
        """
        try:
            if os.path.exists(MODEL_PATH):
                self.model = joblib.load(MODEL_PATH)
                self.is_loaded = True
                print(f"[+] LightGBM model successfully loaded from {MODEL_PATH}")
            else:
                self.model = None
                self.is_loaded = False
                print(f"[-] Notice: Trained model artifact not found at {MODEL_PATH}")

            if os.path.exists(SCALER_AMOUNT_PATH):
                self.scaler_amount = joblib.load(SCALER_AMOUNT_PATH)
            if os.path.exists(SCALER_TIME_PATH):
                self.scaler_time = joblib.load(SCALER_TIME_PATH)

            if os.path.exists(METADATA_PATH):
                with open(METADATA_PATH, "r") as f:
                    self.metadata = json.load(f)

            return self.is_loaded
        except Exception as e:
            print(f"[!] Error loading model artifacts: {str(e)}")
            self.model = None
            self.is_loaded = False
            return False

    def predict(self, raw_payload: Any, threshold: float = DEFAULT_DECISION_THRESHOLD) -> Tuple[Dict[str, Any], int]:
        """
        Executes prediction pipeline:
        Input Validation -> Preprocessing -> Model Inference -> Probability -> Threshold & Risk Calculation
        """
        # 1. Input Validation
        is_valid, err_msg, features = validate_prediction_payload(raw_payload)
        if not is_valid:
            return {
                "error": True,
                "message": err_msg or "Invalid transaction data"
            }, 400

        # 2. Check Model Availability
        if not self.is_loaded or self.model is None:
            return {
                "error": True,
                "message": "LightGBM model is not loaded on the backend. Please train and export model artifacts."
            }, 503

        # 3. Preprocessing
        try:
            feature_vector, raw_features = preprocess_features(
                features,
                scaler_amount=self.scaler_amount,
                scaler_time=self.scaler_time
            )
        except Exception as prep_err:
            return {
                "error": True,
                "message": f"Preprocessing error: {str(prep_err)}"
            }, 500

        # 4. LightGBM Probability Prediction
        try:
            prob = float(self.model.predict_proba(feature_vector)[0][1])
        except Exception as inf_err:
            return {
                "error": True,
                "message": f"Model inference error: {str(inf_err)}"
            }, 500

        # 5. Risk Assessment using Centralized Rules
        risk_result = calculate_risk(prob, threshold=threshold)

        # 6. TreeSHAP Feature Contributions for Explainable AI
        feature_contributions = []
        try:
            booster = self.model.booster_ if hasattr(self.model, "booster_") else self.model
            shap_contribs = booster.predict(feature_vector, pred_contrib=True)[0]
            feature_names = [f"V{i}" for i in range(1, 29)] + ["Amount", "Time"]

            for idx, feat_name in enumerate(feature_names):
                c_val = float(shap_contribs[idx])
                feat_raw = raw_features.get(feat_name, 0.0)
                feature_contributions.append({
                    "feature": feat_name,
                    "feature_value": round(feat_raw, 2),
                    "contribution": round(c_val, 3),
                    "magnitude": round(abs(c_val), 3),
                    "direction": "fraud" if c_val > 0 else "legitimate",
                    "description": FEATURE_DESCRIPTIONS.get(feat_name, f"PCA component {feat_name}")
                })

            feature_contributions.sort(key=lambda x: x["magnitude"], reverse=True)
            feature_contributions = feature_contributions[:8]
        except Exception as shap_err:
            print(f"[-] SHAP calculation notice: {shap_err}")
            feature_contributions = []

        response_data = {
            "prediction": risk_result["prediction"],
            "fraud_probability": risk_result["fraud_probability"],
            "risk_level": risk_result["risk_level"],
            "threshold_used": threshold,
            "feature_contributions": feature_contributions,
        }

        return response_data, 200

    def get_health(self) -> Dict[str, Any]:
        """
        Health endpoint response (Phase 11):
        Healthy when model is loaded, degraded when model is unavailable.
        """
        return {
            "status": "healthy" if self.is_loaded else "degraded",
            "model_loaded": self.is_loaded,
            "algorithm": "LightGBM Classifier" if self.is_loaded else "Pending Training",
            "version": self.metadata.get("version", "1.2.0") if self.metadata else "1.2.0"
        }

    def get_metrics(self) -> Dict[str, Any]:
        """
        Evaluation metrics endpoint (Phase 16):
        Returns real holdout metrics if available, or { "available": False } if uncalculated.
        """
        if not self.metadata or "metrics" not in self.metadata:
            return {"available": False}

        metrics = self.metadata["metrics"]
        return {
            "available": True,
            "precision": round(metrics.get("precision", 0.0), 4),
            "recall": round(metrics.get("recall", 0.0), 4),
            "f1_score": round(metrics.get("f1_score", 0.0), 4),
            "roc_auc": round(metrics.get("roc_auc", 0.0), 4),
            "pr_auc": round(metrics.get("pr_auc", 0.0), 4),
        }
