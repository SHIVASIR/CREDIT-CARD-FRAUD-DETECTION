FraudShield: AI-Powered Credit Card Fraud Detection

FraudShield is an end-to-end credit card fraud detection web platform developed as a B.Tech minor project. It uses LightGBM (Gradient Boosted Decision Trees) to analyze transaction patterns, handle severe class imbalance, and generate probabilistic fraud-risk assessments.

🌐 Live Demo

Open FraudShield

1. Project Overview

Project Name: FraudShield

Tagline: Credit Card Fraud Detection

Primary Algorithm: LightGBM Classifier (LGBMClassifier)

Architecture: Full-stack decoupled architecture with React + Vite frontend, Express API gateway, and Python Flask ML inference service.

Live Application: https://fraudshield-2.ai.studio

2. Problem Statement

Credit card fraud is a major challenge in digital financial transactions. Fraud detection is particularly difficult because legitimate transactions greatly outnumber fraudulent transactions, creating a severe class imbalance problem.

A model optimized only for accuracy can appear highly successful while still missing a significant number of fraudulent transactions.

FraudShield addresses this challenge by:

Using LightGBM with cost-sensitive learning through scale_pos_weight.

Preventing data leakage during feature preprocessing and scaling.

Providing probabilistic fraud predictions.

Classifying transactions into Low, Medium, and High risk levels.

Providing threshold-based analysis to understand the trade-off between False Positives and False Negatives.

3. Key Features

📊 Modern Fintech Dashboard

Transaction and dataset statistics

Class distribution visualization

Fraud trend analysis

Transaction amount visualization

🔍 Interactive Transaction Analyzer

Transaction amount and time inputs

PCA-based transaction features (V1–V28)

Pre-configured transaction scenarios

Fraud probability and risk classification

🧠 Model Insights

Prediction probability

Risk level

Feature-based insights for understanding the prediction

📈 Model Performance

The application provides important fraud-detection metrics such as:

Precision

Recall

F1-Score

ROC-AUC

PR-AUC

Confusion Matrix

Decision threshold analysis

🧾 Transaction History

Transaction audit history

Search and filtering

Risk-level filters

CSV export support

⚙️ Dual Execution Engine

Demo Mode: Provides a presentation-friendly demonstration without requiring a local Python environment.

Live Model Mode: Communicates with the Python Flask REST API and loads the trained LightGBM model using Joblib.

4. System Architecture

             Financial Transaction Input
                 Amount, Time, V1-V28
                         │
                         ▼
              React + Vite Frontend
                         │
                         ▼
                 REST API / JSON
                         │
                         ▼
                Express API Gateway
                         │
                         ▼
                Python Flask API
                         │
                         ▼
            Input Validation & Preprocessing
                         │
                         ▼
               Serialized LightGBM
                  Fraud Detection Model
                         │
                         ▼
             Fraud Probability + Prediction
                         │
                         ▼
                Risk Level + Insights
                         │
                         ▼
                 FraudShield UI

5. Technology Stack

Category

Technology

Machine Learning

LightGBM, Scikit-learn

Programming

Python, TypeScript

Data Processing

Pandas, NumPy

Visualization

Matplotlib, Seaborn

ML Model Storage

Joblib

Backend API

Flask, Flask-CORS

API Gateway

Node.js, Express

Frontend

React, Vite

Styling

Tailwind CSS

Icons

Lucide Icons

Testing

Pytest, Scikit-learn Metrics

Version Control

Git & GitHub

6. Dataset

The project uses the ULB/Kaggle Credit Card Fraud Detection dataset.

Dataset Information

Total Transactions: 284,807

Fraudulent Transactions: 492

Fraud Rate: Approximately 0.172%

Features: Time, V1–V28, and Amount

Target: Class

0 = Legitimate

1 = Fraudulent

Dataset Source

The dataset can be obtained from Kaggle:

https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud

Place the downloaded file at:

data/creditcard.csv

7. Machine Learning Pipeline

Dataset
   ↓
Data Ingestion
   ↓
Data Cleaning
   ↓
Exploratory Data Analysis
   ↓
Train/Test Split
   ↓
Preprocessing & Scaling
   ↓
Class Imbalance Handling
   ↓
LightGBM Training
   ↓
Model Evaluation
   ↓
Threshold Analysis
   ↓
Model Serialization
   ↓
Flask REST API
   ↓
Web Application

Important ML Considerations

The dataset is highly imbalanced.

Preprocessing is fitted on training data to avoid leakage.

scale_pos_weight can be used to give more importance to the minority fraud class.

Accuracy is not treated as the only evaluation metric.

Precision, Recall, F1-Score, ROC-AUC and PR-AUC are considered for evaluation.

8. Installation & Setup

Prerequisites

Node.js 18+

Python 3.9+

Git

Step 1: Clone the Repository

git clone https://github.com/SHIVASIR/FraudShield.git
cd FraudShield

Replace the repository URL with your actual GitHub repository URL if the repository name or owner is different.

Step 2: Install Node Dependencies

npm install

Step 3: Install Python Dependencies

pip install -r requirements.txt

Step 4: Train the LightGBM Model

python ml/train_model.py

The training pipeline performs:

Dataset ingestion

Data preprocessing

Train/test splitting

Scaling of selected numerical features

Class imbalance handling

LightGBM model training

Model evaluation

Model serialization

Step 5: Start the Flask Backend

python backend/app.py

The Flask service runs on the configured backend port.

Step 6: Start the Web Application

npm run dev

Open the local application using the URL shown by Vite.

9. REST API

POST /api/predict

Predicts whether a transaction is potentially fraudulent.

Example Request

{
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

Example Response

{
  "id": "TXN-912834",
  "prediction": "Fraudulent",
  "fraud_probability": 0.914,
  "risk_level": "High",
  "model_name": "LightGBM Classifier",
  "threshold_used": 0.50
}

GET /api/health

Returns the API health and connection status.

GET /api/model-info

Returns model information, configuration, metrics and feature-importance information.

GET /api/stats

Returns dataset and transaction statistics used by the application.

10. Risk Classification

FraudShield presents prediction probability using three risk levels:

Probability

Risk Level

< 30%

Low

30% – 70%

Medium

≥ 70%

High

These thresholds are application-level demonstration thresholds and should not be interpreted as banking or regulatory standards.

11. Model Evaluation

Fraud detection is an imbalanced classification problem, so the project emphasizes fraud-focused metrics rather than relying only on accuracy.

The previous project evaluation reported the following holdout results:

Metric

Holdout Score

ROC-AUC

0.9834

PR-AUC

0.8621

Precision

89.13%

Recall

83.67%

F1-Score

86.32%

Accuracy

99.95%

These values should be updated if the model is retrained or the dataset, preprocessing pipeline, threshold, or evaluation split changes.

Why Accuracy Alone Is Not Enough

With a highly imbalanced dataset, a model can achieve very high accuracy while failing to detect many fraudulent transactions.

Therefore, FraudShield focuses on:

Precision: How many flagged transactions are actually fraudulent?

Recall: How many fraudulent transactions are detected?

F1-Score: Balance between precision and recall.

PR-AUC: Useful for evaluating performance on highly imbalanced datasets.

ROC-AUC: Measures overall ranking/discrimination capability.

12. Project Structure

credit-card-fraud-detection/
│
├── backend/
│   └── app.py
│
├── ml/
│   ├── train_model.py
│   ├── preprocess.py
│   ├── evaluate.py
│   └── eda.py
│
├── model/
│   ├── metadata.json
│   └── fraud_model.pkl
│
├── data/
│   └── README.md
│
├── src/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── ModeConfigModal.tsx
│   │   ├── StatCard.tsx
│   │   ├── SvgCharts.tsx
│   │   └── pages/
│   │       ├── DashboardPage.tsx
│   │       ├── DetectFraudPage.tsx
│   │       ├── ModelPerformancePage.tsx
│   │       ├── TransactionHistoryPage.tsx
│   │       └── AboutPage.tsx
│   │
│   ├── data/
│   │   └── benchmarkData.ts
│   │
│   ├── utils/
│   │   └── mlEngine.ts
│   │
│   ├── types.ts
│   ├── App.tsx
│   └── main.tsx
│
├── tests/
│   └── test_api.py
│
├── server.ts
├── requirements.txt
├── package.json
└── README.md

13. Security & Privacy

FraudShield is designed to work with anonymized transaction features.

The application does not require users to enter:

Full card numbers

CVV

PIN

OTP

Internet banking passwords

Other sensitive banking credentials

For testing and demonstrations, use sample or anonymized transaction data only.

14. Future Scope

Possible future improvements include:

Explainable AI using SHAP

Real-time transaction monitoring

Advanced threshold optimization

Model monitoring and retraining

Database integration

User authentication

Role-based access control

Cloud deployment

Advanced fraud analytics

Real-time alerts

Model drift detection

15. Project Team

Project Leader

Shiwanshu Kumar Singh

Team Members

Ashutosh

Devansh

Hariom

16. Academic Disclaimer

FraudShield is an academic B.Tech minor project created to demonstrate the application of machine learning to financial fraud detection.

The system is not intended to be used as an autonomous production banking fraud-decision system. Real-world deployment would require extensive validation, monitoring, security controls, regulatory compliance and domain-specific testing.

🔗 Links

Live Demo: https://fraudshield-2.ai.studio

Dataset: https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud

⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

FraudShield — Detect. Analyze. Protect.
