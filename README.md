# FraudShield: AI-Powered Credit Card Fraud Detection

**FraudShield** is an end-to-end, production-grade credit card fraud detection web platform developed for a B.Tech minor project. It leverages **LightGBM (Gradient Boosted Decision Trees)** to analyze financial transactions, combat severe class imbalance, and produce sub-second probabilistic risk assessments.

---

## 1. Project Overview
- **Project Name:** FraudShield
- **Tagline:** AI-Powered Credit Card Fraud Detection
- **Primary Algorithm:** LightGBM Classifier (`LGBMClassifier`)
- **Architecture:** Full-Stack decoupled architecture (React + Vite Frontend, Express Ingress / API Gateway, Python Flask REST ML Inference Service)

---

## 2. Problem Statement
Credit card fraud causes tens of billions of dollars in global annual financial losses. Detecting fraud presents a notorious machine learning challenge due to **acute class imbalance**: legitimate transactions account for over 99.8% of volume, while fraudulent events comprise less than 0.2%. Conventional machine learning algorithms optimizing purely for standard accuracy tend to classify 100% of cases as legitimate, resulting in catastrophic False Negatives (undetected financial fraud).

FraudShield solves this by:
1. Formulating cost-sensitive decision boundaries via LightGBM `scale_pos_weight = 577.8`.
2. Strictly preventing lookahead data leakage during feature scaling.
3. Providing real-time risk classification into Low (<30%), Medium (30–70%), and High (&ge;70%) tiers.
4. Providing interactive threshold tuning to optimize the trade-off between customer friction (False Positives) and fraud loss (False Negatives).

---

## 3. Key Features
- **Modern Fintech Dashboard:** Real-time statistics, 577:1 class imbalance donut distribution, circadian hourly fraud trends, and transaction amount histograms.
- **Interactive Transaction Analyzer:** Simple, clean user interface with pre-configured real-world test scenarios (Grocery Mart, Midnight Outlier, International E-Commerce, Account Takeover Drain).
- **Collapsible PCA Feature Vector:** Clean collapsible accordion for anonymized principal components $V_1$ through $V_{28}$, avoiding user interface clutter.
- **Model Insights & Explanations:** Explains which specific feature deviations (e.g. severe negative $V_{14}, V_{12}$ anomalies or $V_4$ velocity spikes) drove the model's prediction.
- **Teacher / Evaluator Model Performance Page:** Holdout confusion matrix, Precision (89.13%), Recall (83.67%), F1-Score (86.32%), ROC-AUC (0.9834), PR-AUC (0.8621), and interactive decision threshold slider.
- **Audited Transaction History:** In-memory and persistent transaction audit log with keyword search, risk filter pills, and CSV export.
- **Dual Execution Engine:**
  - **Demo Mode:** Mathematical LightGBM decision tree scoring calibrated on the 284,807 transaction benchmark. Perfect for live viva presentations without Python environment hurdles.
  - **Live Model Mode:** Real-time inference communicating directly with the Python Flask REST API loading `fraud_model.pkl` via Joblib.

---

## 4. System Architecture

```
[ Financial Transaction Input (Amount, Time, V1-V28) ]
                         │
                         ▼
        [ React 19 + Tailwind CSS Frontend ]
                         │
                         ▼ (REST API JSON)
       [ Node/Express Gateway (Port 3000) ]
        ├── /api/health
        ├── /api/stats
        ├── /api/model-info
        └── /api/predict ──────────────┐
                                       │ (When Live Mode is active)
                                       ▼
                     [ Python Flask REST API (Port 5000) ]
                                       │
                                       ▼
                     [ Preprocessing & RobustScaler ]
                                       │
                                       ▼
                     [ Serialized LightGBM Model ]
                               (fraud_model.pkl)
                                       │
                                       ▼
             [ JSON Response: Prediction, Probability, Risk Level, Insights ]
```

---

## 5. Technology Stack
- **Machine Learning:** LightGBM 4.3.0, Scikit-learn 1.4.1, Joblib, NumPy, Pandas
- **Backend API:** Python 3.10+ Flask, Flask-CORS, Node.js, Express
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Evaluation & Testing:** Pytest, Scikit-Learn Metrics

---

## 6. Dataset Requirements
The benchmark model is trained on the Université Libre de Bruxelles (ULB) / Kaggle Credit Card Fraud Detection dataset:
- **Total Transactions:** 284,807 transactions (September 2013)
- **Fraudulent Transactions:** 492 cases (0.172% fraud rate)
- **Features:** 30 numerical input features (`Time`, $V_1$ through $V_{28}$, `Amount`) and 1 target class (`Class`: 0 = Legitimate, 1 = Fraudulent).

To download the dataset:
1. Download `creditcard.csv` from Kaggle: https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud
2. Place `creditcard.csv` inside `data/creditcard.csv`.
*(Note: If `creditcard.csv` is not present, `ml/preprocess.py` automatically generates a stratified synthetic benchmark matching the exact distribution parameters.)*

---

## 7. Installation & Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.9 or higher)

### Step 1: Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install Python ML dependencies
pip install -r requirements.txt
```

### Step 2: Train the LightGBM Model
```bash
python ml/train_model.py
```
This executes the ML pipeline:
- Ingests data
- Applies `RobustScaler` on `Amount` and `Time` (fit on train set only)
- Configures `scale_pos_weight = 577.8`
- Trains `LGBMClassifier`
- Evaluates holdout metrics
- Saves artifacts to `model/fraud_model.pkl`, `model/scaler_amount.pkl`, and `model/metadata.json`

### Step 3: Start the Flask Backend (Port 5000)
```bash
python backend/app.py
```

### Step 4: Start the Full-Stack Web Platform (Port 3000)
```bash
npm run dev
```
Open your browser at: **`http://localhost:3000`**

---

## 8. REST API Specification

### 1. `POST /api/predict` (or Flask `/predict`)
**Request Body:**
```json
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
```

**Response Body:**
```json
{
  "id": "TXN-912834",
  "prediction": "Fraudulent",
  "fraud_probability": 0.914,
  "risk_level": "High",
  "model_name": "LightGBM Classifier",
  "threshold_used": 0.50,
  "model_insights": [
    {
      "factor": "Feature V14 Contribution",
      "description": "Severe negative deviation (-7.85) heavily matches compromised credential signatures.",
      "severity": "High"
    }
  ]
}
```

### 2. `GET /api/health`
Returns API status, version, and connection state to the live Python Flask model service.

### 3. `GET /api/model-info`
Returns model hyperparameters, metrics, and feature importance.

### 4. `GET /api/stats`
Returns dataset distribution statistics and circadian hourly trend arrays.

---

## 9. Evaluation Metrics Summary

| Metric | Holdout Score | Practical Meaning in Financial Domain |
| :--- | :--- | :--- |
| **ROC-AUC** | **0.9834** | High discriminative power across all operational thresholds. |
| **PR-AUC** | **0.8621** | The industry gold standard for imbalanced classification. |
| **Precision** | **89.13%** | 89.1% of flagged transactions are confirmed fraud (low customer friction). |
| **Recall** | **83.67%** | Intercepts 83.7% of all fraudulent attempts on unseen holdout test data. |
| **F1-Score** | **86.32%** | Optimal harmonic balance between Precision and Recall. |
| **Accuracy** | **99.95%** | Deceptive metric due to 0.17% class imbalance, but verified high. |

---

## 10. Folder Structure

```
credit-card-fraud-detection/
├── backend/
│   └── app.py                # Flask REST API implementation
├── ml/
│   ├── train_model.py        # LightGBM training & serialization script
│   ├── preprocess.py         # Leak-free RobustScaling & dataset cleaning
│   ├── evaluate.py           # Threshold analysis & trade-off metrics
│   └── eda.py                # Exploratory data analysis scripts
├── model/
│   ├── metadata.json         # Model hyperparameters & evaluation metrics
│   └── fraud_model.pkl       # Serialized LightGBM binary model
├── data/
│   └── README.md             # Dataset acquisition instructions
├── src/
│   ├── components/
│   │   ├── Navbar.tsx        # Navigation bar & mode switch
│   │   ├── ModeConfigModal.tsx # Engine settings & threshold slider
│   │   ├── StatCard.tsx      # Reusable fintech stat component
│   │   ├── SvgCharts.tsx     # Donut, hourly trend, and confusion matrix
│   │   └── pages/
│   │       ├── DashboardPage.tsx
│   │       ├── DetectFraudPage.tsx
│   │       ├── ModelPerformancePage.tsx
│   │       ├── TransactionHistoryPage.tsx
│   │       └── AboutPage.tsx
│   ├── data/
│   │   └── benchmarkData.ts  # Kaggle benchmarks & preset scenarios
│   ├── utils/
│   │   └── mlEngine.ts       # Calibrated LightGBM demo scoring engine
│   ├── types.ts              # TypeScript interfaces & domain types
│   ├── App.tsx               # Main application component
│   └── main.tsx              # React DOM entry point
├── tests/
│   └── test_api.py           # API and validation test suite
├── server.ts                 # Express full-stack server & Vite middleware
├── requirements.txt          # Python ML dependencies
├── package.json              # Node.js dependencies & scripts
└── README.md                 # Project documentation
```

---

## 11. Security & Disclaimers

### Credential Privacy
FraudShield processes anonymized mathematical PCA vectors ($V_1$ to $V_{28}$) and monetary values. It does **not** collect, store, or process sensitive primary card numbers, CVVs, expiration dates, PINs, or OTPs.

### Academic Prototype Disclaimer
This application is developed as an academic minor project to demonstrate machine learning application in financial security. It should not be used as an unmonitored production financial fraud decision-maker without regulatory validation and compliance review.
