import { DashboardStats, ModelInfo, TransactionInput } from '../types';

export const BENCHMARK_MODEL_INFO: ModelInfo = {
  model_name: 'FraudShield LightGBM Classifier',
  algorithm: 'LightGBM (Gradient Boosted Decision Trees)',
  framework: 'LightGBM 4.3.0 / Scikit-Learn 1.4.1',
  version: 'v1.2.0',
  training_date: '2026-03-15',
  problem_type: 'Binary Classification with Extreme Class Imbalance',
  dataset_name: 'Credit Card Fraud Detection (ULB / Kaggle Benchmark)',
  total_samples: 284807,
  fraud_samples: 492,
  legitimate_samples: 284315,
  imbalance_ratio: '577:1 (0.172% Fraud Rate)',
  hyperparameters: {
    n_estimators: 300,
    learning_rate: 0.03,
    num_leaves: 31,
    max_depth: 6,
    min_child_samples: 20,
    scale_pos_weight: 577.8, // Crucial for handling 0.17% minority class
    subsample: 0.8,
    colsample_bytree: 0.8,
    objective: 'binary',
    boosting_type: 'gbdt',
    random_state: 42,
  },
  metrics: {
    accuracy: 0.9995,
    precision: 0.8913,
    recall: 0.8367,
    f1_score: 0.8632,
    roc_auc: 0.9834,
    pr_auc: 0.8621,
  },
  confusion_matrix: {
    true_negative: 56854,
    false_positive: 10,
    false_negative: 16,
    true_positive: 82,
  },
  feature_importance: [
    { feature: 'V14', importance: 382, normalized_pct: 100, description: 'PCA component 14 - strongest negative correlation with fraudulent behavior' },
    { feature: 'V17', importance: 345, normalized_pct: 90.3, description: 'PCA component 17 - detects high-variance anomalous cardholder activity' },
    { feature: 'V12', importance: 318, normalized_pct: 83.2, description: 'PCA component 12 - prominent indicator of transaction authorization integrity' },
    { feature: 'V10', importance: 294, normalized_pct: 77.0, description: 'PCA component 10 - correlates strongly with velocity and location discrepancies' },
    { feature: 'V4', importance: 261, normalized_pct: 68.3, description: 'PCA component 4 - positive correlation with transaction risk elevation' },
    { feature: 'Amount', importance: 228, normalized_pct: 59.7, description: 'Transaction monetary value normalized via Scikit-Learn RobustScaler' },
    { feature: 'V11', importance: 215, normalized_pct: 56.3, description: 'PCA component 11 - positive correlation with abnormal authentication frequency' },
    { feature: 'V16', importance: 198, normalized_pct: 51.8, description: 'PCA component 16 - risk-weighted card verification deviation' },
    { feature: 'V7', importance: 176, normalized_pct: 46.1, description: 'PCA component 7 - negative correlation with legitimate point-of-sale patterns' },
    { feature: 'V2', importance: 162, normalized_pct: 42.4, description: 'PCA component 2 - positive correlation with high-velocity repeated purchases' },
    { feature: 'Time', importance: 145, normalized_pct: 38.0, description: 'Time elapsed (seconds) from reference dataset start - detects circadian fraud peaks' },
    { feature: 'V18', importance: 132, normalized_pct: 34.6, description: 'PCA component 18 - behavioral deviation index' },
  ],
  threshold_config: {
    decision_threshold: 0.50,
    low_risk_ceiling: 0.30,
    medium_risk_ceiling: 0.70,
  },
};

export const BENCHMARK_DASHBOARD_STATS: DashboardStats = {
  dataset_name: 'Kaggle Credit Card Fraud Detection Benchmark',
  total_transactions: 284807,
  fraud_detected: 492,
  legitimate: 284315,
  fraud_rate: 0.1727,
  high_risk_transactions: 492,
  average_amount: 2450.80,
  total_volume_amount: 698005000,
  live_sessions_analyzed: 18,
  risk_distribution: {
    low: 284190,
    medium: 125,
    high: 492,
  },
  hourly_trend: [
    { hour: 0, label: '12 AM', total: 7200, fraud: 18, legitimate: 7182 },
    { hour: 2, label: '2 AM', total: 4100, fraud: 32, legitimate: 4068 },
    { hour: 4, label: '4 AM', total: 3200, fraud: 38, legitimate: 3162 },
    { hour: 6, label: '6 AM', total: 5400, fraud: 15, legitimate: 5385 },
    { hour: 8, label: '8 AM', total: 11200, fraud: 12, legitimate: 11188 },
    { hour: 10, label: '10 AM', total: 18500, fraud: 14, legitimate: 18486 },
    { hour: 12, label: '12 PM', total: 22400, fraud: 20, legitimate: 22380 },
    { hour: 14, label: '2 PM', total: 24100, fraud: 22, legitimate: 24078 },
    { hour: 16, label: '4 PM', total: 23800, fraud: 25, legitimate: 23775 },
    { hour: 18, label: '6 PM', total: 21200, fraud: 29, legitimate: 21171 },
    { hour: 20, label: '8 PM', total: 17600, fraud: 34, legitimate: 17566 },
    { hour: 22, label: '10 PM', total: 12100, fraud: 36, legitimate: 12064 },
  ],
  amount_distribution: [
    { range: '₹0 - ₹500', total: 112500, fraud: 94 },
    { range: '₹500 - ₹2,000', total: 84300, fraud: 112 },
    { range: '₹2,000 - ₹5,000', total: 46200, fraud: 128 },
    { range: '₹5,000 - ₹15,000', total: 28400, fraud: 86 },
    { range: '₹15,000 - ₹50,000', total: 10800, fraud: 52 },
    { range: '₹50,000+', total: 2607, fraud: 20 },
  ],
};

export interface TransactionPreset {
  id: string;
  name: string;
  description: string;
  expectedRisk: 'Low' | 'Medium' | 'High';
  expectedStatus: 'Legitimate' | 'Fraudulent';
  data: TransactionInput;
}

export const TRANSACTION_PRESETS: TransactionPreset[] = [
  {
    id: 'grocery_low_risk',
    name: 'Standard Grocery Purchase (Low Risk)',
    description: 'Typical daytime local transaction with normal PCA parameters and modest amount.',
    expectedRisk: 'Low',
    expectedStatus: 'Legitimate',
    data: {
      amount: 1450,
      time: 43200, // 12 hours (noon)
      vFeatures: {
        V1: 0.12, V2: -0.08, V3: 0.85, V4: 0.22, V5: -0.15,
        V6: 0.33, V7: 0.18, V8: 0.05, V9: -0.12, V10: -0.25,
        V11: 0.15, V12: 0.32, V13: -0.05, V14: 0.42, V15: 0.11,
        V16: -0.18, V17: 0.25, V18: 0.08, V19: 0.02, V20: -0.04,
        V21: -0.02, V22: 0.05, V23: -0.01, V24: 0.12, V25: -0.08,
        V26: 0.04, V27: 0.01, V28: 0.02,
      },
      notes: 'Local Supermarket POS Terminal',
    },
  },
  {
    id: 'midnight_high_risk',
    name: 'Midnight Outlier Transfer (High Risk Fraud)',
    description: 'Classic fraud pattern: deep negative V14, V12, V10; elevated V4; late night timestamp.',
    expectedRisk: 'High',
    expectedStatus: 'Fraudulent',
    data: {
      amount: 48900,
      time: 7200, // 2:00 AM
      vFeatures: {
        V1: -2.31, V2: 1.85, V3: -3.42, V4: 4.15, V5: -1.82,
        V6: -1.24, V7: -2.95, V8: 1.45, V9: -2.12, V10: -5.18,
        V11: 3.82, V12: -6.14, V13: -0.42, V14: -7.85, V15: -0.62,
        V16: -4.32, V17: -6.95, V18: -2.48, V19: 1.25, V20: 0.68,
        V21: 0.72, V22: -0.24, V23: 0.18, V24: -0.42, V25: 0.31,
        V26: 0.22, V27: 0.58, V28: 0.24,
      },
      notes: 'Online P2P Transfer - New Device & Foreign IP',
    },
  },
  {
    id: 'ecommerce_medium_risk',
    name: 'International E-Commerce (Medium Risk)',
    description: 'Moderate amount with minor deviations on V14 and elevated V4. Requires 2FA verification.',
    expectedRisk: 'Medium',
    expectedStatus: 'Legitimate',
    data: {
      amount: 18500,
      time: 75600, // 9:00 PM
      vFeatures: {
        V1: -0.95, V2: 0.72, V3: -1.15, V4: 1.95, V5: -0.45,
        V6: -0.32, V7: -0.85, V8: 0.42, V9: -0.78, V10: -1.85,
        V11: 1.62, V12: -2.15, V13: -0.12, V14: -2.45, V15: 0.18,
        V16: -1.45, V17: -2.10, V18: -0.82, V19: 0.55, V20: 0.28,
        V21: 0.22, V22: -0.15, V23: 0.08, V24: -0.12, V25: 0.14,
        V26: 0.09, V27: 0.18, V28: 0.08,
      },
      notes: 'Overseas Merchant - High-Ticket Electronics',
    },
  },
  {
    id: 'subscription_low_risk',
    name: 'Streaming Subscription (Low Risk)',
    description: 'Small recurring digital payment matching historic cardholder profile.',
    expectedRisk: 'Low',
    expectedStatus: 'Legitimate',
    data: {
      amount: 499,
      time: 21600, // 6:00 AM
      vFeatures: {
        V1: 0.05, V2: 0.02, V3: 0.15, V4: -0.05, V5: 0.08,
        V6: 0.02, V7: 0.04, V8: -0.01, V9: 0.02, V10: 0.05,
        V11: -0.02, V12: 0.08, V13: 0.01, V14: 0.12, V15: -0.04,
        V16: 0.06, V17: 0.02, V18: -0.01, V19: -0.03, V20: 0.01,
        V21: -0.01, V22: 0.02, V23: 0.00, V24: 0.03, V25: -0.02,
        V26: 0.01, V27: 0.00, V28: 0.01,
      },
      notes: 'Automated Standing Order',
    },
  },
  {
    id: 'account_takeover_extreme',
    name: 'Account Takeover Drain (Extreme Risk Fraud)',
    description: 'Extreme multi-sigma deviation across V17, V14, V12, V10, V11 with large lump sum.',
    expectedRisk: 'High',
    expectedStatus: 'Fraudulent',
    data: {
      amount: 142000,
      time: 12600, // 3:30 AM
      vFeatures: {
        V1: -3.85, V2: 2.95, V3: -5.40, V4: 5.80, V5: -3.10,
        V6: -2.15, V7: -4.80, V8: 2.40, V9: -3.60, V10: -7.20,
        V11: 5.10, V12: -8.40, V13: -0.80, V14: -9.80, V15: -1.10,
        V16: -5.90, V17: -9.40, V18: -3.80, V19: 2.10, V20: 1.15,
        V21: 1.25, V22: -0.45, V23: 0.35, V24: -0.65, V25: 0.48,
        V26: 0.38, V27: 0.95, V28: 0.42,
      },
      notes: 'Jewelry Store Express Terminal - Immediate Cash Out',
    },
  },
];
