"""
FraudShield Backend Configuration
Handles environment-based settings, model paths, and CORS policies.
"""

import os

# Base directory for the backend package
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PROJECT_ROOT = os.path.abspath(os.path.join(BACKEND_DIR, ".."))

# Model and Preprocessing Scaler Paths
# Searches in backend/models first, then falls back to project root model/
DEFAULT_MODEL_PATH = os.path.join(BACKEND_DIR, "models", "fraud_model.joblib")
FALLBACK_MODEL_PATH = os.path.join(PROJECT_ROOT, "model", "fraud_model.pkl")

MODEL_PATH = os.getenv("MODEL_PATH", DEFAULT_MODEL_PATH if os.path.exists(DEFAULT_MODEL_PATH) else FALLBACK_MODEL_PATH)

SCALER_AMOUNT_PATH = os.getenv(
    "SCALER_AMOUNT_PATH",
    os.path.join(BACKEND_DIR, "models", "scaler_amount.joblib")
    if os.path.exists(os.path.join(BACKEND_DIR, "models", "scaler_amount.joblib"))
    else os.path.join(PROJECT_ROOT, "model", "scaler_amount.pkl")
)

SCALER_TIME_PATH = os.getenv(
    "SCALER_TIME_PATH",
    os.path.join(BACKEND_DIR, "models", "scaler_time.joblib")
    if os.path.exists(os.path.join(BACKEND_DIR, "models", "scaler_time.joblib"))
    else os.path.join(PROJECT_ROOT, "model", "scaler_time.pkl")
)

METADATA_PATH = os.getenv(
    "METADATA_PATH",
    os.path.join(BACKEND_DIR, "models", "metadata.json")
    if os.path.exists(os.path.join(BACKEND_DIR, "models", "metadata.json"))
    else os.path.join(PROJECT_ROOT, "model", "metadata.json")
)

# API and Server Configuration
FLASK_PORT = int(os.getenv("FLASK_PORT", 5000))
FLASK_HOST = os.getenv("FLASK_HOST", "0.0.0.0")
FLASK_DEBUG = os.getenv("FLASK_DEBUG", "False").lower() in ("true", "1", "yes")

# CORS Configuration (Phase 17)
# Can be set via comma-separated list in CORS_ORIGINS
CORS_ORIGINS_RAW = os.getenv("CORS_ORIGINS", "*")
CORS_ORIGINS = [orig.strip() for orig in CORS_ORIGINS_RAW.split(",") if orig.strip()] if CORS_ORIGINS_RAW != "*" else "*"

# Classification & Risk Thresholds (Phase 9 & 10)
DEFAULT_DECISION_THRESHOLD = float(os.getenv("DECISION_THRESHOLD", 0.50))
LOW_RISK_CUTOFF = float(os.getenv("LOW_RISK_CUTOFF", 0.30))
HIGH_RISK_CUTOFF = float(os.getenv("HIGH_RISK_CUTOFF", 0.70))
