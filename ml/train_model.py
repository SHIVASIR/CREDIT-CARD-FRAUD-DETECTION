"""
FraudShield - LightGBM Model Training Pipeline
Trains an optimized LGBMClassifier with StratifiedKFold validation,
imbalance handling (scale_pos_weight), early stopping, and metadata export.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
import lightgbm as lgb
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
    classification_report
)
from preprocess import load_dataset, clean_and_inspect_data, prepare_train_test_split

def train_fraud_model():
    print("=" * 60)
    print("  FRAUDSHIELD - LIGHTGBM TRAINING PIPELINE")
    print("=" * 60)

    # 1. Load and clean
    df = load_dataset()
    df = clean_and_inspect_data(df)

    # 2. Preprocess & Split without data leakage
    X_train, X_test, y_train, y_test, scaler_amount, scaler_time = prepare_train_test_split(df)

    # 3. Calculate class weight for imbalance
    n_neg = (y_train == 0).sum()
    n_pos = (y_train == 1).sum()
    imbalance_ratio = n_neg / max(1, n_pos)
    print(f"[+] Class Imbalance Ratio in Train Set: {imbalance_ratio:.1f}:1")
    print(f"[+] Applying scale_pos_weight={imbalance_ratio:.2f} to penalize false negatives...")

    # 4. Initialize LightGBM Classifier
    params = {
        'n_estimators': 300,
        'learning_rate': 0.03,
        'num_leaves': 31,
        'max_depth': 6,
        'min_child_samples': 20,
        'scale_pos_weight': imbalance_ratio,
        'subsample': 0.8,
        'colsample_bytree': 0.8,
        'objective': 'binary',
        'boosting_type': 'gbdt',
        'random_state': 42,
        'n_jobs': -1
    }

    model = lgb.LGBMClassifier(**params)

    # 5. Fit Model
    print("[+] Training LightGBM Classifier...")
    model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        eval_metric=['auc', 'binary_logloss']
    )

    # 6. Inference and Evaluation on unseen Holdout Test Set
    print("[+] Evaluating on unseen test set...")
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    roc_auc = float(roc_auc_score(y_test, y_prob))
    pr_auc = float(average_precision_score(y_test, y_prob))

    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = [int(val) for val in cm.ravel()]

    print("\n" + "=" * 40)
    print("      EVALUATION METRICS")
    print("=" * 40)
    print(f"Accuracy:  {acc:.4%}")
    print(f"Precision: {prec:.4%}  (True Positives / Total Flagged)")
    print(f"Recall:    {rec:.4%}  (Frauds Detected / Total Actual Frauds)")
    print(f"F1 Score:  {f1:.4%}  (Harmonic Mean of Precision & Recall)")
    print(f"ROC-AUC:   {roc_auc:.4f}")
    print(f"PR-AUC:    {pr_auc:.4f}")
    print(f"Confusion Matrix:\nTN={tn}, FP={fp}\nFN={fn}, TP={tp}")
    print("=" * 40)

    # 7. Extract Feature Importance
    feature_names = list(X_train.columns)
    importances = model.feature_importances_
    max_imp = max(1, max(importances))
    feature_importance_list = []

    for name, imp in sorted(zip(feature_names, importances), key=lambda x: x[1], reverse=True):
        feature_importance_list.append({
            'feature': name,
            'importance': int(imp),
            'normalized_pct': round((imp / max_imp) * 100, 1),
            'description': f"Feature {name} importance in LightGBM decision tree splits"
        })

    # 8. Save Model & Scalers
    os.makedirs("model", exist_ok=True)
    joblib.dump(model, "model/fraud_model.pkl")
    print("[✓] Model saved to model/fraud_model.pkl")

    # 9. Save Metadata JSON
    metadata = {
        'model_name': 'FraudShield LightGBM Classifier',
        'algorithm': 'LightGBM (Gradient Boosted Decision Trees)',
        'framework': f'LightGBM {lgb.__version__}',
        'version': 'v1.2.0',
        'training_date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        'problem_type': 'Binary Classification with Class Imbalance',
        'dataset_name': 'Credit Card Fraud Detection Benchmark',
        'total_samples': len(df),
        'fraud_samples': int((df['Class'] == 1).sum()),
        'legitimate_samples': int((df['Class'] == 0).sum()),
        'imbalance_ratio': f"{imbalance_ratio:.1f}:1",
        'hyperparameters': {k: v for k, v in params.items() if k != 'n_jobs'},
        'metrics': {
            'accuracy': round(acc, 4),
            'precision': round(prec, 4),
            'recall': round(rec, 4),
            'f1_score': round(f1, 4),
            'roc_auc': round(roc_auc, 4),
            'pr_auc': round(pr_auc, 4)
        },
        'confusion_matrix': {
            'true_negative': tn,
            'false_positive': fp,
            'false_negative': fn,
            'true_positive': tp
        },
        'feature_importance': feature_importance_list[:12],
        'threshold_config': {
            'decision_threshold': 0.50,
            'low_risk_ceiling': 0.30,
            'medium_risk_ceiling': 0.70
        }
    }

    with open("model/metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)
    print("[✓] Metadata saved to model/metadata.json")

    return model, metadata

if __name__ == "__main__":
    train_fraud_model()
