"""
FraudShield - Exploratory Data Analysis (EDA) Script
Inspects summary statistics, class distributions, correlation with target Class,
and amount differences between genuine and fraudulent card transactions.
"""

import os
import pandas as pd
import numpy as np

def run_exploratory_analysis(df):
    print("=" * 60)
    print("      FRAUDSHIELD - EXPLORATORY DATA ANALYSIS")
    print("=" * 60)

    total = len(df)
    fraud_count = (df['Class'] == 1).sum()
    legit_count = (df['Class'] == 0).sum()
    fraud_pct = (fraud_count / total) * 100

    print(f"Total Transactions:      {total:,}")
    print(f"Legitimate Transactions: {legit_count:,} ({100 - fraud_pct:.3f}%)")
    print(f"Fraudulent Transactions: {fraud_count:,} ({fraud_pct:.3f}%)")
    print(f"Class Imbalance Ratio:   {legit_count // max(1, fraud_count)}:1")

    print("\n--- Amount Statistics by Class ---")
    legit_amt = df[df['Class'] == 0]['Amount']
    fraud_amt = df[df['Class'] == 1]['Amount']

    print(f"Legitimate Mean Amount: ₹{legit_amt.mean():.2f} (Median: ₹{legit_amt.median():.2f}, Max: ₹{legit_amt.max():.2f})")
    print(f"Fraudulent Mean Amount: ₹{fraud_amt.mean():.2f} (Median: ₹{fraud_amt.median():.2f}, Max: ₹{fraud_amt.max():.2f})")

    print("\n--- Top Correlations with Target 'Class' ---")
    correlations = df.corr()['Class'].sort_values()
    print("Top Negative Correlations (Lower value = Higher Fraud probability):")
    for feat, val in correlations.head(5).items():
        print(f"  {feat:<6}: {val:+.4f}")

    print("\nTop Positive Correlations (Higher value = Higher Fraud probability):")
    for feat, val in correlations.tail(6).iloc[:-1].items():
        print(f"  {feat:<6}: {val:+.4f}")

    print("=" * 60)

if __name__ == "__main__":
    from preprocess import load_dataset
    df = load_dataset()
    run_exploratory_analysis(df)
