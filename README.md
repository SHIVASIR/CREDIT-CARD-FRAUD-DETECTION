# 🛡️ FraudShield

### AI-Powered Credit Card Fraud Detection & Risk Analysis Platform

FraudShield is a machine-learning-powered platform designed to detect potentially fraudulent credit card transactions using **LightGBM**.

The platform goes beyond simple fraud classification by providing **fraud probability, risk levels, transaction analytics, batch detection, fraud alerts, model performance metrics, transaction history, and explainable AI insights**.

> 🚧 **Project Status:** Active Development
> 🎓 **Project Type:** B.Tech CSE Minor Project

---

## 🚀 Overview

Credit card fraud detection is a challenging machine learning problem because fraudulent transactions are usually much smaller in number than legitimate transactions.

FraudShield addresses this problem using a **LightGBM-based binary classification model** combined with a professional web interface.

The system analyzes transaction features and produces:

```text
Transaction
     ↓
Preprocessing
     ↓
LightGBM Model
     ↓
Fraud Probability
     ↓
Risk Assessment
     ↓
Prediction + Insights
```

The goal is to make machine-learning-based fraud detection **accurate, understandable, and easy to interact with**.

---

# ✨ Features

## 🤖 AI Fraud Detection

* LightGBM-based fraud classification
* Legitimate vs fraudulent prediction
* Fraud probability
* Configurable risk thresholds
* Low / Medium / High risk classification

---

## 📊 Interactive Dashboard

The dashboard provides an overview of analyzed transactions:

* Total transactions
* Fraudulent transactions
* Legitimate transactions
* Fraud rate
* High-risk transactions
* Average transaction amount
* Fraud trends
* Risk distribution
* Recent suspicious transactions

---

## 🔍 Single Transaction Analysis

Analyze an individual transaction through a user-friendly interface.

The system provides:

* Transaction prediction
* Fraud probability
* Risk level
* Model information
* Prediction timestamp
* Detailed transaction information

---

## 📁 Batch Fraud Detection

Upload a CSV containing multiple transactions and analyze them together.

### Workflow

```text
Upload CSV
    ↓
Validate Dataset
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

Batch analysis provides:

* Total transactions
* Fraudulent transactions
* Legitimate transactions
* High-risk transactions
* Medium-risk transactions
* Low-risk transactions

Results can be exported for further analysis.

---

## 🚨 Fraud Alert Center

High-risk transactions can generate fraud alerts.

Alerts include:

* Transaction ID
* Timestamp
* Transaction amount
* Fraud probability
* Risk level
* Alert status

Available states:

* Unread
* Reviewed
* Unresolved

---

## 🧠 Explainable AI

FraudShield is designed to provide insight into model predictions.

Where supported, **SHAP** can be used with LightGBM to show:

* Important contributing features
* Direction of contribution
* Contribution magnitude
* Feature-level prediction explanations

> Feature contribution indicates how a model uses a feature for a prediction; it does not establish causation.

---

## 📈 Model Performance

The platform evaluates the fraud detection model using metrics suitable for imbalanced classification:

* Accuracy
* Precision
* Recall
* F1-score
* ROC-AUC
* PR-AUC
* Confusion Matrix

Additional visualizations include:

* ROC Curve
* Precision-Recall Curve
* Feature Importance
* Class Distribution

Accuracy is not treated as the only performance indicator because fraud datasets are typically highly imbalanced.

---

## ⚖️ Class Imbalance Handling

Fraud detection datasets commonly contain significantly fewer fraudulent transactions than legitimate transactions.

FraudShield therefore considers appropriate imbalance-handling techniques such as:

* Class weighting
* LightGBM imbalance parameters
* Carefully validated sampling strategies

The selected approach should be evaluated using fraud-focused metrics rather than accuracy alone.

---

## 📚 Transaction History

The platform can maintain a history of analyzed transactions.

Each record can contain:

| Field          | Description                       |
| -------------- | --------------------------------- |
| Transaction ID | Unique transaction identifier     |
| Timestamp      | Time of analysis                  |
| Amount         | Transaction amount                |
| Prediction     | Legitimate/Fraudulent             |
| Probability    | Model-estimated fraud probability |
| Risk           | Low/Medium/High                   |
| Model Version  | Model used for prediction         |
| Source         | Single/Batch                      |

History supports:

* Search
* Filtering
* Sorting
* Detailed transaction views

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │   Transaction Data   │
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
                    │     Handling         │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      LightGBM        │
                    │   Classification     │
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

# 🛠️ Tech Stack

### Machine Learning

* **Python**
* **LightGBM**
* **Scikit-learn**
* **Pandas**
* **NumPy**
* **SHAP** *(optional/where implemented)*

### Data Visualization

* Matplotlib
* Seaborn
* Frontend charting library

### Backend

* Flask
* REST API
* SQLite
* SQLAlchemy *(where used)*

### Frontend

* React *(if enabled)*
* HTML
* CSS
* JavaScript

### Development

* Git
* GitHub
* VS Code / Google AI Studio / compatible development environment

---

# 📂 Project Structure

```text
FraudShield/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── assets/
│   └── styles/
│
├── backend/
│   ├── app.py
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── database/
│
├── ml/
│   ├── train_model.py
│   ├── preprocess.py
│   ├── evaluate.py
│   ├── eda.py
│   └── explain.py
│
├── data/
│   └── README.md
│
├── model/
│   ├── fraud_model.pkl
│   └── metadata.json
│
├── tests/
│
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

> The exact structure may change as development progresses.

---

# 📊 Machine Learning Workflow

## 1. Data Collection

Obtain a suitable anonymized credit-card transaction dataset.

## 2. Data Inspection

Analyze:

* Dataset dimensions
* Feature types
* Missing values
* Duplicate records
* Target distribution

## 3. Data Preprocessing

Perform appropriate:

* Cleaning
* Missing-value handling
* Feature preparation
* Validation

## 4. Exploratory Data Analysis

Analyze:

* Fraud distribution
* Transaction amounts
* Feature relationships
* Correlations
* Outliers
* Temporal patterns where available

## 5. Class Imbalance

Apply and evaluate an appropriate strategy for the minority fraud class.

## 6. Model Training

Train a:

**LightGBM Binary Classifier**

## 7. Evaluation

Evaluate using:

```text
Precision
Recall
F1-score
ROC-AUC
PR-AUC
Confusion Matrix
```

## 8. Model Persistence

Save the trained model and its metadata.

## 9. Deployment

Expose the trained model through the Flask API.

---

# 🔌 API

The backend is designed around REST endpoints such as:

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

### Example Prediction Response

```json
{
  "prediction": "Fraudulent",
  "fraud_probability": 0.914,
  "risk_level": "High"
}
```

The actual response structure may evolve with the implementation.

---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/FraudShield.git
cd FraudShield
```

## 2. Create a Virtual Environment

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### macOS / Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

# 📦 Dataset Setup

Place the required anonymized dataset inside:

```text
data/
```

For example:

```text
data/
└── creditcard.csv
```

Do not commit sensitive or private financial data to GitHub.

---

# 🧠 Train the Model

Run:

```bash
python ml/train_model.py
```

The training process should:

1. Load the dataset
2. Validate the data
3. Preprocess features
4. Handle class imbalance
5. Train LightGBM
6. Evaluate the model
7. Save the trained model
8. Save model metadata

The generated model should be stored inside:

```text
model/
```

---

# ▶️ Run the Backend

```bash
python backend/app.py
```

The Flask API will then be available locally according to the configured host and port.

---

# 💻 Run the Frontend

If using React:

```bash
npm install
npm run dev
```

Use the frontend environment configuration to point to the Flask API.

---

# 🧪 Testing

Run the project's tests using the configured test runner.

For example:

```bash
pytest
```

Testing should cover:

* Data validation
* Model prediction
* API endpoints
* Invalid inputs
* CSV uploads
* Frontend interactions

---

# 📈 Model Evaluation

The project does not rely exclusively on accuracy.

For an imbalanced fraud-detection problem:

### Precision

Measures how many transactions predicted as fraud are actually fraudulent.

### Recall

Measures how many actual fraudulent transactions were successfully detected.

### F1-score

Balances precision and recall.

### ROC-AUC

Measures class-separation performance across classification thresholds.

### PR-AUC

Provides useful insight into precision/recall behavior, particularly for imbalanced classification.

### Confusion Matrix

Provides:

```text
True Positive
True Negative
False Positive
False Negative
```

---

# 🔐 Security & Privacy

FraudShield is designed around anonymized transaction features.

The application should **never require**:

* Actual card numbers
* CVV
* PIN
* OTP
* Banking passwords

Sensitive credentials should never be included in the dataset or GitHub repository.

Additional security considerations include:

* Environment variables for secrets
* Input validation
* Sanitized API errors
* Secure deployment configuration
* No sensitive information in logs

---

# ⚠️ Limitations

The project has several limitations:

* Historical data may not represent future fraud patterns.
* Fraud patterns can change over time.
* Dataset imbalance can affect model behavior.
* Model probability is not absolute certainty.
* False positives can affect legitimate users.
* False negatives can allow fraudulent transactions to pass undetected.
* Production deployment would require extensive validation and monitoring.

---

# 🔮 Future Scope

Potential future improvements include:

* Real-time transaction-stream processing
* Advanced anomaly detection
* Deep-learning-based fraud detection
* Continuous model retraining
* Advanced SHAP-based explanations
* Real-time notifications
* Role-based access control
* Cloud deployment
* PostgreSQL
* Kafka-based transaction streaming
* Model monitoring
* Data drift detection
* Model version management
* Advanced fraud-pattern analysis

---

# 🎯 Project Objectives

The major objectives of FraudShield are:

* Develop an effective ML-based fraud detection system.
* Use LightGBM for structured transaction classification.
* Address the class imbalance problem.
* Evaluate the model using appropriate metrics.
* Provide fraud probability rather than only binary output.
* Convert model probability into understandable risk levels.
* Provide a user-friendly fraud analysis interface.
* Provide analytical tools for understanding transaction behavior.
* Demonstrate how an ML model can be integrated into a complete web application.

---

# 👥 Project Team

### B.Tech CSE (Hons.) — Cloud Computing & Machine Learning

**Project:** Credit Card Fraud Detection using LightGBM

**Team Size:** 4 Members

**Team Lead:** Shivanshu Kumar Singh

> Add the remaining team members and university details here if you want them publicly visible.

---

# 🎓 Academic Context

This project is developed as a **B.Tech CSE Minor Project** to demonstrate the practical application of:

* Machine Learning
* Data Science
* Classification
* Imbalanced Dataset Handling
* LightGBM
* REST APIs
* Full-Stack Development
* Data Visualization
* Explainable AI

---

# 📌 Project Status

```text
🟢 Core ML Pipeline       In Development
🟢 Fraud Prediction       In Development
🟢 Web Interface          In Development
🟡 Batch Detection        Planned/In Development
🟡 Explainable AI         Planned/In Development
🟡 Alert System           Planned/In Development
🟡 Advanced Analytics     Planned/In Development
```

Update these statuses as the actual implementation progresses.

---

# 🤝 Contributing

This project is primarily an academic project, but suggestions and improvements are welcome.

If contributing:

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/your-feature
```

3. Commit your changes.

```bash
git commit -m "Add your feature"
```

4. Push the branch.

```bash
git push origin feature/your-feature
```

5. Open a Pull Request.

---

# 📄 License

Add the appropriate license before making the repository public.

For example:

```text
MIT License
```

if you choose to release the project under MIT.

---

# ⚠️ Disclaimer

FraudShield is an **academic prototype** developed for educational and demonstration purposes.

The predictions generated by the system are probabilistic and should not be treated as definitive financial decisions.

A production-grade fraud detection system would require extensive validation, security controls, monitoring, domain expertise, privacy protections, and compliance with applicable laws and regulations.

---

# ⭐ If You Find This Project Interesting

Consider giving the repository a ⭐ and following the development of FraudShield.

---

### Built with 🧠 Machine Learning + 💻 Full-Stack Development + 🛡️ Fraud Intelligence

**FraudShield — Turning Transaction Data into Fraud-Risk Intelligence.**
