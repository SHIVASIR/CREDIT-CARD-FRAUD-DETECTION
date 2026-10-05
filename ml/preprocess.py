"""
FraudShield - Data Preprocessing Pipeline
Handles data cleaning, missing value checks, duplicate inspection,
robust scaling, and train-test split without data leakage.
"""

import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import RobustScaler
import joblib

def load_dataset(csv_path="data/creditcard.csv"):
    """
    Loads credit card transaction dataset.
    If official Kaggle dataset is not present, generates a benchmark
    stratified sample matching the exact 30 features and 0.172% imbalance.
    """
    if os.path.exists(csv_path):
        print(f"[+] Loading actual dataset from {csv_path}...")
        df = pd.read_csv(csv_path)
    else:
        print("[-] Dataset not found at specified path.")
        print("[+] Generating high-fidelity synthetic benchmark data matching Kaggle distributions...")
        np.random.seed(42)
        n_samples = 50000
        n_fraud = int(n_samples * 0.00172) # ~86 fraud cases
        n_legit = n_samples - n_fraud

        # Generate legitimate features (Gaussian around 0)
        legit_v = np.random.normal(0, 1, size=(n_legit, 28))
        legit_time = np.random.uniform(0, 172800, size=(n_legit, 1))
        legit_amount = np.random.exponential(scale=88.0, size=(n_legit, 1))
        legit_class = np.zeros((n_legit, 1))

        # Generate fraud features with established PCA shifts (e.g. V14, V12, V10 negative shift)
        fraud_v = np.random.normal(0, 1.2, size=(n_fraud, 28))
        fraud_v[:, 13] -= 6.5 # V14 strongly negative
        fraud_v[:, 11] -= 5.0 # V12 strongly negative
        fraud_v[:, 9]  -= 4.5 # V10 strongly negative
        fraud_v[:, 3]  += 3.8 # V4 strongly positive
        fraud_v[:, 10] += 3.2 # V11 strongly positive
        fraud_time = np.random.uniform(0, 172800, size=(n_fraud, 1))
        fraud_amount = np.random.exponential(scale=125.0, size=(n_fraud, 1))
        fraud_class = np.ones((n_fraud, 1))

        legit_data = np.hstack([legit_time, legit_v, legit_amount, legit_class])
        fraud_data = np.hstack([fraud_time, fraud_v, fraud_amount, fraud_class])

        all_data = np.vstack([legit_data, fraud_data])
        np.random.shuffle(all_data)

        columns = ['Time'] + [f'V{i}' for i in range(1, 29)] + ['Amount', 'Class']
        df = pd.DataFrame(all_data, columns=columns)
        df['Class'] = df['Class'].astype(int)

    return df

def clean_and_inspect_data(df):
    """
    Checks missing values, duplicates, and column types.
    """
    print(f"Dataset Shape: {df.shape}")
    missing = df.isnull().sum().sum()
    print(f"Missing Values: {missing}")

    duplicates = df.duplicated().sum()
    print(f"Duplicates detected: {duplicates}")
    if duplicates > 0:
        print("[+] Dropping duplicates...")
        df = df.drop_duplicates()

    class_counts = df['Class'].value_counts()
    fraud_rate = (class_counts.get(1, 0) / len(df)) * 100
    print(f"Class Distribution: Legit={class_counts.get(0, 0)}, Fraud={class_counts.get(1, 0)} ({fraud_rate:.3f}%)")

    return df

def prepare_train_test_split(df, test_size=0.20, random_state=42):
    """
    Splits features and target using Stratified split to preserve 0.17% class ratio.
    Scales 'Amount' and 'Time' using RobustScaler fit ONLY on training data
    to strictly prevent Data Leakage.
    """
    X = df.drop('Class', axis=1)
    y = df['Class']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=test_size,
        stratify=y,
        random_state=random_state
    )

    # Fit RobustScaler ONLY on X_train to prevent leakage
    scaler_amount = RobustScaler()
    scaler_time = RobustScaler()

    X_train['scaled_amount'] = scaler_amount.fit_transform(X_train[['Amount']])
    X_train['scaled_time'] = scaler_time.fit_transform(X_train[['Time']])

    X_test['scaled_amount'] = scaler_amount.transform(X_test[['Amount']])
    X_test['scaled_time'] = scaler_time.transform(X_test[['Time']])

    # Drop raw unscaled columns
    X_train = X_train.drop(['Time', 'Amount'], axis=1)
    X_test = X_test.drop(['Time', 'Amount'], axis=1)

    # Save scalers for live API inference
    os.makedirs("model", exist_ok=True)
    joblib.dump(scaler_amount, "model/scaler_amount.pkl")
    joblib.dump(scaler_time, "model/scaler_time.pkl")
    print("[+] Scalers saved successfully.")

    return X_train, X_test, y_train, y_test, scaler_amount, scaler_time

if __name__ == "__main__":
    df = load_dataset()
    df = clean_and_inspect_data(df)
    X_train, X_test, y_train, y_test, _, _ = prepare_train_test_split(df)
    print(f"[✓] Train shape: {X_train.shape}, Test shape: {X_test.shape}")
