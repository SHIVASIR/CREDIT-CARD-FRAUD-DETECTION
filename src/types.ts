export type RiskLevel = 'Low' | 'Medium' | 'High';
export type PredictionStatus = 'Legitimate' | 'Fraudulent' | 'Legitimate / Review';
export type AppExecutionMode = 'DEMO' | 'LIVE';
export type TransactionSource = 'Single' | 'Batch';
export type AlertStatus = 'Unread' | 'Reviewed' | 'Unresolved';

export interface FraudAlert {
  id: string;
  transaction_id: string;
  timestamp: string;
  amount: number;
  fraud_probability: number;
  risk_level: RiskLevel;
  status: AlertStatus;
  notes?: string;
  reviewed_at?: string;
  source?: TransactionSource;
  transaction?: PredictionResult;
}

export interface VFeatures {
  [key: string]: number;
}

export interface TransactionInput {
  amount: number;
  time: number;
  vFeatures: VFeatures; // V1 to V28
  currency?: string;
  notes?: string;
}

export interface FlaggedInsight {
  factor: string;
  description: string;
  severity: 'High' | 'Medium' | 'Low';
  value?: number | string;
}

export interface FeatureContribution {
  feature: string;
  feature_value: number;
  contribution: number; // Signed contribution (positive = pushes toward fraud, negative = pushes toward legit)
  magnitude: number;    // Absolute contribution magnitude
  direction: 'fraud' | 'legitimate';
  description?: string;
}

export interface PredictionResult {
  id: string;
  timestamp: string;
  amount: number;
  time: number;
  prediction: PredictionStatus;
  fraud_probability: number; // 0.0 to 1.0 (e.g. 0.048 or 0.874)
  risk_level: RiskLevel;
  mode: AppExecutionMode;
  model_name: string;
  model_version?: string;
  source?: TransactionSource;
  threshold_used: number;
  model_insights: FlaggedInsight[];
  feature_contributions?: FeatureContribution[];
  vFeaturesSummary?: {
    topPositiveDeviations: Array<{ feature: string; val: number }>;
    topNegativeDeviations: Array<{ feature: string; val: number }>;
  };
}

export interface MetricSummary {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  pr_auc: number;
}

export interface ConfusionMatrixData {
  true_negative: number;
  false_positive: number;
  false_negative: number;
  true_positive: number;
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
  normalized_pct: number;
  description: string;
}

export interface ModelInfo {
  model_name: string;
  algorithm: string;
  framework: string;
  version: string;
  training_date: string;
  problem_type: string;
  dataset_name: string;
  total_samples: number;
  fraud_samples: number;
  legitimate_samples: number;
  imbalance_ratio: string;
  hyperparameters: Record<string, string | number | boolean>;
  metrics: MetricSummary;
  confusion_matrix: ConfusionMatrixData;
  feature_importance: FeatureImportanceItem[];
  threshold_config: {
    decision_threshold: number;
    low_risk_ceiling: number;
    medium_risk_ceiling: number;
  };
}

export type TimeRangeFilter = 'today' | '7d' | '30d' | 'all';

export interface DashboardStats {
  dataset_name: string;
  total_transactions: number;
  fraud_detected: number;
  legitimate: number;
  fraud_rate: number;
  high_risk_transactions: number;
  average_amount: number;
  total_volume_amount?: number;
  live_sessions_analyzed: number;
  risk_distribution: {
    low: number;
    medium: number;
    high: number;
  };
  hourly_trend: Array<{
    hour: number;
    label: string;
    total: number;
    fraud: number;
    legitimate: number;
  }>;
  amount_distribution: Array<{
    range: string;
    total: number;
    fraud: number;
  }>;
}

export interface AppConfig {
  demo_mode: boolean;
  backend_url: string;
  decision_threshold: number;
  threshold_low: number;
  threshold_high: number;
}

export interface HealthResponse {
  status: string;
  service: string;
  model_loaded: boolean;
  algorithm: string;
  version: string;
  timestamp?: string;
  demo_mode?: boolean;
}
