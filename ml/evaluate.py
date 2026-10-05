"""
FraudShield - Model Evaluation & Threshold Analysis
Analyzes classification thresholds, false positive vs false negative tradeoffs,
and computes Precision-Recall / ROC curves.
"""

import json
import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import (
    precision_recall_curve,
    roc_curve,
    confusion_matrix,
    classification_report
)

def evaluate_threshold_tradeoffs(y_true, y_probs, thresholds=[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]):
    """
    Evaluates how changing the decision threshold alters Precision, Recall,
    and False Negatives (the most critical financial risk metric).
    """
    print(f"{'Threshold':<10}{'Precision':<12}{'Recall':<12}{'F1-Score':<12}{'False Negatives':<16}{'False Positives'}")
    print("-" * 75)

    results = []
    for thresh in thresholds:
        y_pred = (y_probs >= thresh).astype(int)
        cm = confusion_matrix(y_true, y_pred)
        tn, fp, fn, tp = cm.ravel()

        prec = tp / (tp + fp) if (tp + fp) > 0 else 0
        rec = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1 = (2 * prec * rec) / (prec + rec) if (prec + rec) > 0 else 0

        print(f"{thresh:<10.2f}{prec:<12.3%}{rec:<12.3%}{f1:<12.3%}{fn:<16}{fp}")
        results.append({
            'threshold': thresh,
            'precision': round(prec, 4),
            'recall': round(rec, 4),
            'f1_score': round(f1, 4),
            'false_negatives': int(fn),
            'false_positives': int(fp)
        })
    return results

if __name__ == "__main__":
    print("[+] Model Evaluation & Threshold Trade-off Module Ready.")
