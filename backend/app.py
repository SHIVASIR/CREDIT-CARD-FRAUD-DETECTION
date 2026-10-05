"""
FraudShield - Flask REST API Backend
Serves real-time inference using the modular LightGBM predictor,
handles schema validation, CORS security, health diagnostics, and metrics.
"""

import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS

# Ensure current directory is on python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.config import FLASK_HOST, FLASK_PORT, FLASK_DEBUG, CORS_ORIGINS, DEFAULT_DECISION_THRESHOLD
from src.predictor import ModelPredictor

app = Flask(__name__)

# Configure CORS safely (Phase 17)
if CORS_ORIGINS == "*":
    CORS(app)
else:
    CORS(app, origins=CORS_ORIGINS)

# Initialize Model Predictor once at application startup (Phase 6)
predictor = ModelPredictor()

@app.route("/health", methods=["GET"])
@app.route("/api/health", methods=["GET"])
def health():
    """
    Health check endpoint (Phase 11):
    Returns status: healthy and model_loaded: true if model is in memory,
    otherwise status: degraded and model_loaded: false.
    """
    return jsonify(predictor.get_health()), 200

@app.route("/predict", methods=["POST"])
@app.route("/api/predict", methods=["POST"])
def predict():
    """
    ML Prediction Endpoint (Phase 2 & Phase 9):
    Consumes features, validates input, executes preprocessing & model inference,
    and returns probability and risk classification.
    """
    if not request.is_json:
        return jsonify({
            "error": True,
            "message": "Content-Type must be application/json."
        }), 400

    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({
            "error": True,
            "message": "Invalid transaction data: malformed JSON body."
        }), 400

    threshold = payload.get("threshold", DEFAULT_DECISION_THRESHOLD)
    try:
        threshold = float(threshold)
    except (ValueError, TypeError):
        threshold = DEFAULT_DECISION_THRESHOLD

    response_data, status_code = predictor.predict(payload, threshold=threshold)
    return jsonify(response_data), status_code

@app.route("/metrics", methods=["GET"])
@app.route("/api/metrics", methods=["GET"])
def metrics():
    """
    Model Performance Metrics Endpoint (Phase 16):
    Returns actual holdout evaluation metrics or {"available": false}.
    """
    return jsonify(predictor.get_metrics()), 200

@app.route("/api/model-info", methods=["GET"])
def model_info():
    """Model metadata endpoint"""
    if predictor.metadata:
        return jsonify(predictor.metadata), 200
    return jsonify({
        "status": "Model metadata not yet generated. Please run train_model.py first."
    }), 404

@app.route("/api/stats", methods=["GET"])
def stats():
    """Telemetry stats endpoint"""
    return jsonify({
        "dataset_name": "Kaggle Credit Card Fraud Detection Benchmark",
        "total_transactions": 284807,
        "fraud_detected": 492,
        "legitimate": 284315,
        "fraud_rate": 0.1727,
    }), 200

if __name__ == "__main__":
    print(f"[*] Starting FraudShield Flask API on {FLASK_HOST}:{FLASK_PORT}...")
    app.run(host=FLASK_HOST, port=FLASK_PORT, debug=FLASK_DEBUG)
