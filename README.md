# 🛡️ FraudShield

### AI-Powered Credit Card Fraud Detection & Risk Analysis Platform

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-FraudShield-blue?style=for-the-badge)](https://fraudshield-2.ai.studio)
[![Python](https://img.shields.io/badge/Python-3.x-blue?style=flat-square\&logo=python)](https://www.python.org/)
[![LightGBM](https://img.shields.io/badge/ML-LightGBM-green?style=flat-square)](https://lightgbm.readthedocs.io/)
[![Flask](https://img.shields.io/badge/Backend-Flask-black?style=flat-square\&logo=flask)](https://flask.palletsprojects.com/)

> **FraudShield** is a machine-learning-powered platform designed to detect potentially fraudulent credit card transactions using **LightGBM**, while providing fraud probability, risk assessment, analytics, alerts, transaction history, and model insights through a professional web interface.

---

## 🚀 Live Demo

### 🌐 Try FraudShield

**[Open FraudShield →](https://fraudshield-2.ai.studio)**

---

# 📌 Project Overview

Credit card fraud is a major challenge in digital financial transactions. Fraudulent transactions are generally much smaller in number than legitimate transactions, making fraud detection an **imbalanced binary classification problem**.

FraudShield uses **LightGBM** to learn patterns from historical transaction data and classify transactions as:

* ✅ Legitimate
* 🚨 Potentially Fraudulent

Instead of providing only a binary prediction, the platform provides:

* Fraud probability
* Risk level
* Transaction analytics
* Fraud alerts
* Transaction history
* Batch CSV analysis
* Model performance
* Feature importance
* Explainable AI insights where supported

The goal is to transform raw transaction data into **understandable fraud-risk intelligence**.

---

# 🎯 Objectives

* Develop an ML-based credit card fraud detection system.
* Use LightGBM for binary classification.
* Handle highly imbalanced transaction data.
* Evaluate the model using fraud-focused metrics.
* Provide fraud probability instead of only binary output.
* Convert probability into understandable risk levels.
* Build an intuitive and professional web interface.
* Support individual and batch transaction analysis.
* Provide transaction analytics and fraud alerts.
* Demonstrate end-to-end ML model deployment.

---

# ✨ Key Features

## 🤖 AI Fraud Detection

* LightGBM-based classification
* Legitimate/Fraudulent prediction
* Fraud probability
* Risk classification
* Configurable risk thresholds

## 🔍 Single Transaction Analysis

Analyze individual transactions through a simple interface.

The system provides:

```text
Prediction
Fraud Probability
Risk Level
Model Information
Analysis Timestamp
```

## 📁 Batch Fraud Detection

Upload a CSV file containing multiple transactions and analyze them together.

```text
Upload CSV
     ↓
Validate File
     ↓
Preview Data
     ↓
Preprocess
     ↓
LightGBM Prediction
     ↓
Risk Classification
     ↓
Results
```

## 📊 Interactive Dashboard

The dashboard provides:

* Total transactions
* Fraud detected
* Legitimate transactions
* Fraud rate
* High-risk transactions
* Average transaction amount
* Fraud trends
* Risk distribution
* Recent suspicious transactions

## 🚨 Fraud Alert Center

High-risk transactions can generate alerts containing:

* Alert ID
* Transaction ID
* Timestamp
* Amount
* Fraud probability
* Risk level
* Review status

## 🧠 Explainable AI

Where supported, SHAP can be used with LightGBM to provide feature-level insights into predictions.

## 📚 Transaction History

Store and analyze previous predictions with:

* Search
* Filter
* Sort
* Detailed transaction view

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │  Transaction Dataset │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Data Preprocessing   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │        EDA           │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Class Imbalance      │
                    │ Handling             │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      LightGBM        │
                    │  Classification      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Model Evaluation     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    Flask REST API    │
                    └──────────┬───────────┘
                               │
                               ▼
              ┌─────────────────────────────────┐
              │         FraudShield UI          │
              └────────────────┬────────────────┘
                               │
              ┌────────────────┼─────────────────┐
              ▼                ▼                 ▼
        Prediction         Analytics          Alerts
```

---

# 🛠️ Technology Stack

| Category         | Technology                      |
| ---------------- | ------------------------------- |
| Programming      | Python                          |
| Machine Learning | LightGBM                        |
| Data Processing  | Pandas, NumPy                   |
| ML Utilities     | Scikit-learn                    |
| Explainability   | SHAP                            |
| Visualization    | Matplotlib, Seaborn             |
| Backend          | Flask                           |
| Database         | SQLite                          |
| Frontend         | React / HTML / CSS / JavaScript |
| API              | REST                            |
| Model Storage    | Joblib                          |
| Version Control  | Git & GitHub                    |

---

# 📈 Machine Learning Workflow

```text
Dataset
   ↓
Data Validation
   ↓
Data Cleaning
   ↓
EDA
   ↓
Feature Preparation
   ↓
Train/Test Split
   ↓
Class Imbalance Handling
   ↓
LightGBM
   ↓
Model Evaluation
   ↓
Model Saving
   ↓
Flask API
   ↓
FraudShield Platform
```

---

# ⚖️ Class Imbalance

Fraud datasets typically contain significantly fewer fraudulent transactions than legitimate transactions.

Therefore, FraudShield focuses on:

* Precision
* Recall
* F1-score
* ROC-AUC
* PR-AUC
* Confusion Matrix

rather than relying only on accuracy.

---

# 🚦 Risk Classification

Example application-level thresholds:

| Fraud Probability | Risk      |
| ----------------: | --------- |
|             0–30% | 🟢 Low    |
|            30–70% | 🟡 Medium |
|           70–100% | 🔴 High   |

> These thresholds are application-defined and are not official banking or financial-industry standards.

---

# 🔌 API

Example REST endpoints:

```text
GET  /health
GET  /stats
GET  /model-info
POST /predict
POST /batch-predict
GET  /transactions
GET  /transactions/<id>
GET  /alerts
```

### Example Response

```json
{
  "prediction": "Fraudulent",
  "fraud_probability": 0.914,
  "risk_level": "High"
}
```

---

# 📂 Project Structure

```text
FraudShield/
│
├── frontend/
├── backend/
├── ml/
├── data/
├── model/
├── tests/
│
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

---

# ⚙️ Installation

### Clone Repository

```bash
git clone YOUR_GITHUB_REPO_LINK
cd FraudShield
```

### Create Virtual Environment

#### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

#### macOS/Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

---

# 📊 Dataset

Place the anonymized dataset inside:

```text
data/
└── creditcard.csv
```

Do not upload private or sensitive financial data to the repository.

---

# 🧠 Train Model

```bash
python ml/train_model.py
```

The training pipeline should:

1. Load the dataset
2. Validate data
3. Preprocess features
4. Handle class imbalance
5. Train LightGBM
6. Evaluate the model
7. Save the trained model
8. Save model metadata

---

# ▶️ Run Backend

```bash
python backend/app.py
```

---

# 💻 Run Frontend

If React is used:

```bash
npm install
npm run dev
```

Configure the backend API URL through environment variables.

---

# 🧪 Testing

Run:

```bash
pytest
```

Tests should cover:

* Data validation
* Model prediction
* API endpoints
* Invalid inputs
* CSV processing
* Frontend interactions

---

# 🔐 Security & Privacy

FraudShield is designed around anonymized transaction features.

The platform should never require:

* Actual card numbers
* CVV
* PIN
* OTP
* Banking passwords

Security considerations include:

* Input validation
* Environment variables
* Sanitized API errors
* No sensitive information in logs
* No secrets committed to GitHub

---

# 🚧 Project Status

```text
🟢 Core ML Pipeline
🟢 LightGBM Model
🟢 Transaction Prediction
🟢 Web Interface
🟡 Batch Detection
🟡 Transaction History
🟡 Fraud Alerts
🟡 Explainable AI
🟡 Advanced Analytics
🟡 Report Generation
```

Update these statuses as development progresses.

---

# 🔮 Future Scope

* Real-time fraud detection
* Advanced anomaly detection
* Deep learning models
* SHAP-based advanced explanations
* Real-time notifications
* Model monitoring
* Data drift detection
* Continuous model retraining
* Cloud deployment
* Kafka-based transaction streaming
* Advanced fraud-pattern analysis

---

# ⚠️ Limitations

* Historical data may not represent future fraud patterns.
* Fraud patterns can change over time.
* Class imbalance can affect model behavior.
* Model probability is not absolute certainty.
* False positives may affect legitimate transactions.
* False negatives may allow fraudulent transactions to pass undetected.
* Production deployment requires extensive validation and monitoring.

---

# 👥 Project Team

### B.Tech CSE (Hons.) — Cloud Computing & Machine Learning

**Project:** Credit Card Fraud Detection using LightGBM

**Team Size:** 4 Members

### Team Lead

**Shivanshu Kumar Singh**

### Team Members

* Member 2 — Add Name
* Member 3 — Add Name
* Member 4 — Add Name

---

# 🎓 Academic Context

**Project Type:** B.Tech CSE Minor Project

**Domain:**

```text
Machine Learning
Data Science
FinTech
Fraud Detection
Full-Stack Development
Explainable AI
```

**Primary Algorithm:**

```text
LightGBM
```

---

# 🤝 Contributing

This is primarily an academic project, but suggestions and improvements are welcome.

```bash
git checkout -b feature/your-feature
git add .
git commit -m "Add your feature"
git push origin feature/your-feature
```

Then create a Pull Request.

---

# 📄 License

Add an appropriate license if you intend to distribute the project publicly.

For example:

```text
MIT License
```

---

# ⚠️ Disclaimer

FraudShield is an **academic machine-learning prototype** developed for educational and demonstration purposes.

The predictions generated by the system are probabilistic and should not be treated as definitive financial decisions.

A production-grade fraud-detection system would require extensive validation, security controls, monitoring, privacy protections, domain expertise, and compliance with applicable laws and regulations.

---

# ⭐ Support the Project

If you find **FraudShield** useful or interesting:

⭐ Star the repository
🍴 Fork the project
🐛 Report issues
💡 Suggest improvements

---

## 🛡️ FraudShield

### Turning Transaction Data into Fraud-Risk Intelligence.

**Built with Python • LightGBM • Flask • Machine Learning • Full-Stack Development**
