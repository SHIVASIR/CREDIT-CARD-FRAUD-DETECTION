import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { BENCHMARK_DASHBOARD_STATS, BENCHMARK_MODEL_INFO } from './src/data/benchmarkData.ts';
import { AppConfig, PredictionResult, TransactionInput, FraudAlert, AlertStatus } from './src/types.ts';
import { evaluateTransactionDemo } from './src/utils/mlEngine.ts';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'transactions.json');
const ALERTS_FILE = path.join(DATA_DIR, 'alerts.json');

// Helper to save transactionHistory to disk
function saveHistoryToDisk(history: PredictionResult[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(history, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist transactions to disk:', err);
  }
}

// Helper to load transactionHistory from disk or initialize with seed
function loadHistoryFromDisk(seed: PredictionResult[]): PredictionResult[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => ({
          ...item,
          model_version: item.model_version || 'v1.2',
          source: item.source || (item.id.includes('BCH') ? 'Batch' : 'Single'),
        }));
      }
    }
    saveHistoryToDisk(seed);
    return seed;
  } catch (err) {
    console.error('Failed to load transactions from disk, using seed:', err);
    return seed;
  }
}

// Helper to save fraudAlerts to disk
function saveAlertsToDisk(alerts: FraudAlert[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(ALERTS_FILE, JSON.stringify(alerts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist fraud alerts to disk:', err);
  }
}

// Helper to load fraudAlerts from disk or seed from high risk transactions
function loadAlertsFromDisk(initialTransactions: PredictionResult[]): FraudAlert[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(ALERTS_FILE)) {
      const data = fs.readFileSync(ALERTS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    // Automatically seed alerts from high risk transactions
    const highRiskItems = initialTransactions.filter((t) => t.risk_level === 'High');
    const seedAlerts: FraudAlert[] = highRiskItems.map((t, idx) => {
      let status: AlertStatus = 'Unread';
      if (idx === 1) status = 'Reviewed';
      else if (idx === 3) status = 'Unresolved';

      return {
        id: `ALT-${10490 + idx}`,
        transaction_id: t.id,
        timestamp: t.timestamp,
        amount: t.amount,
        fraud_probability: t.fraud_probability,
        risk_level: 'High',
        status,
        source: t.source || (t.id.includes('BCH') ? 'Batch' : 'Single'),
        reviewed_at: status === 'Reviewed' ? new Date(Date.now() - 3600000).toISOString() : undefined,
      };
    });

    saveAlertsToDisk(seedAlerts);
    return seedAlerts;
  } catch (err) {
    console.error('Failed to load alerts from disk:', err);
    return [];
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS Configuration (Phase 17)
  const corsOriginsEnv = process.env.CORS_ORIGINS || '*';
  const allowedOrigins = corsOriginsEnv === '*'
    ? '*'
    : corsOriginsEnv.split(',').map((s) => s.trim());

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (corsOriginsEnv === '*') {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
    } else if (origin && Array.isArray(allowedOrigins) && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (!origin) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // Global application configuration state
  const config: AppConfig = {
    demo_mode: true,
    backend_url: 'http://localhost:5000',
    decision_threshold: 0.50,
    threshold_low: 0.30,
    threshold_high: 0.70,
  };

  // Seed transaction audit history with realistic initial records
  const initialSeedTransactions: PredictionResult[] = [
    {
      id: 'TXN-842910',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      amount: 1450,
      time: 43200,
      prediction: 'Legitimate',
      fraud_probability: 0.042,
      risk_level: 'Low',
      mode: 'DEMO',
      model_name: 'LightGBM Classifier (Kaggle ULB)',
      model_version: 'v1.2',
      source: 'Single',
      threshold_used: 0.50,
      model_insights: [
        {
          factor: 'Normalized Baseline Features',
          description: 'All 28 principal components and transaction metadata align within normal standard deviations.',
          severity: 'Low',
          value: 'Normal Range',
        },
      ],
    },
    {
      id: 'TXN-912834',
      timestamp: new Date(Date.now() - 3600000 * 4.5).toISOString(),
      amount: 48900,
      time: 7200,
      prediction: 'Fraudulent',
      fraud_probability: 0.914,
      risk_level: 'High',
      mode: 'DEMO',
      model_name: 'LightGBM Classifier (Kaggle ULB)',
      model_version: 'v1.2',
      source: 'Single',
      threshold_used: 0.50,
      model_insights: [
        {
          factor: 'Feature V14 Contribution',
          description: 'Severe negative deviation (-7.85) heavily matches compromised credential signatures.',
          severity: 'High',
          value: -7.85,
        },
        {
          factor: 'High-Value Outlier Flag',
          description: 'Transaction value of ₹48,900 exceeds 98.5th percentile of retail transactions.',
          severity: 'Medium',
          value: '₹48,900',
        },
      ],
    },
    {
      id: 'TXN-BCH-1002',
      timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
      amount: 95000,
      time: 14400,
      prediction: 'Fraudulent',
      fraud_probability: 0.999,
      risk_level: 'High',
      mode: 'DEMO',
      model_name: 'LightGBM Classifier (Kaggle ULB)',
      model_version: 'v1.2',
      source: 'Batch',
      threshold_used: 0.50,
      model_insights: [
        {
          factor: 'Feature V14 Contribution',
          description: 'Severe negative deviation (-8.20) heavily matches compromised credential signatures in PCA space.',
          severity: 'High',
          value: -8.2,
        },
        {
          factor: 'Feature V12 Contribution',
          description: 'Severe negative deviation (-6.50) heavily matches compromised credential signatures in PCA space.',
          severity: 'High',
          value: -6.5,
        },
      ],
    },
    {
      id: 'TXN-BCH-1001',
      timestamp: new Date(Date.now() - 3600000 * 6.2).toISOString(),
      amount: 500,
      time: 3600,
      prediction: 'Legitimate',
      fraud_probability: 0.043,
      risk_level: 'Low',
      mode: 'DEMO',
      model_name: 'LightGBM Classifier (Kaggle ULB)',
      model_version: 'v1.2',
      source: 'Batch',
      threshold_used: 0.50,
      model_insights: [
        {
          factor: 'Off-Hours Circadian Activity',
          description: 'Transaction timestamp corresponds to 01:00 hrs, historically showing higher baseline fraud incidence.',
          severity: 'Low',
          value: '1:00 hrs',
        },
      ],
    },
    {
      id: 'TXN-773412',
      timestamp: new Date(Date.now() - 3600000 * 7).toISOString(),
      amount: 64200,
      time: 14400,
      prediction: 'Fraudulent',
      fraud_probability: 0.952,
      risk_level: 'High',
      mode: 'DEMO',
      model_name: 'LightGBM Classifier (Kaggle ULB)',
      threshold_used: 0.50,
      model_insights: [
        {
          factor: 'Compound PCA Anomaly (V17 & V12)',
          description: 'Joint negative deviation on V17 (-6.95) and V12 (-6.14) signals unauthorized card reproduction.',
          severity: 'High',
          value: -6.95,
        },
      ],
    },
    {
      id: 'TXN-621804',
      timestamp: new Date(Date.now() - 3600000 * 11).toISOString(),
      amount: 3200,
      time: 32400,
      prediction: 'Legitimate',
      fraud_probability: 0.021,
      risk_level: 'Low',
      mode: 'DEMO',
      model_name: 'LightGBM Classifier (Kaggle ULB)',
      threshold_used: 0.50,
      model_insights: [
        {
          factor: 'Routine Merchant Profile',
          description: 'Automated fuel dispenser payment within historic geofence and velocity limits.',
          severity: 'Low',
          value: 'Low Variance',
        },
      ],
    },
    {
      id: 'TXN-374189',
      timestamp: new Date(Date.now() - 3600000 * 15).toISOString(),
      amount: 18500,
      time: 75600,
      prediction: 'Legitimate',
      fraud_probability: 0.285,
      risk_level: 'Low',
      mode: 'DEMO',
      model_name: 'LightGBM Classifier (Kaggle ULB)',
      threshold_used: 0.50,
      model_insights: [
        {
          factor: 'Moderate V4 Variance',
          description: 'Slightly elevated transaction parameter (+1.95) within acceptable 2FA threshold.',
          severity: 'Low',
          value: 1.95,
        },
      ],
    },
    {
      id: 'TXN-109482',
      timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
      amount: 2150,
      time: 50400,
      prediction: 'Legitimate',
      fraud_probability: 0.015,
      risk_level: 'Low',
      mode: 'DEMO',
      model_name: 'LightGBM Classifier (Kaggle ULB)',
      threshold_used: 0.50,
      model_insights: [
        {
          factor: 'Recurring Utility Debit',
          description: 'Consistent recurring payment signature with zero principal component variance.',
          severity: 'Low',
          value: 'Whitelisted',
        },
      ],
    },
    {
      id: 'TXN-552190',
      timestamp: new Date(Date.now() - 86400000 * 2.2).toISOString(),
      amount: 82500,
      time: 9800,
      prediction: 'Fraudulent',
      fraud_probability: 0.886,
      risk_level: 'High',
      mode: 'DEMO',
      model_name: 'LightGBM Classifier (Kaggle ULB)',
      threshold_used: 0.50,
      model_insights: [
        {
          factor: 'Cross-Border POS Terminal Anomaly',
          description: 'Card present transaction in remote geographic territory discordant with prior transaction.',
          severity: 'High',
          value: -5.18,
        },
      ],
    },
    {
      id: 'TXN-419082',
      timestamp: new Date(Date.now() - 86400000 * 3.1).toISOString(),
      amount: 12400,
      time: 61200,
      prediction: 'Legitimate',
      fraud_probability: 0.445,
      risk_level: 'Medium',
      mode: 'DEMO',
      model_name: 'LightGBM Classifier (Kaggle ULB)',
      threshold_used: 0.50,
      model_insights: [
        {
          factor: 'Step-Up 2FA Challenge',
          description: 'Elevated transaction score prompted SMS OTP challenge; verified successfully.',
          severity: 'Medium',
          value: '44.5%',
        },
      ],
    },
    {
      id: 'TXN-902341',
      timestamp: new Date(Date.now() - 86400000 * 4.4).toISOString(),
      amount: 2800,
      time: 15800,
      prediction: 'Fraudulent',
      fraud_probability: 0.765,
      risk_level: 'High',
      mode: 'DEMO',
      model_name: 'LightGBM Classifier (Kaggle ULB)',
      threshold_used: 0.50,
      model_insights: [
        {
          factor: 'Micro-Charge Velocity Probe',
          description: 'Small amount transaction matching automated card testing bot pattern.',
          severity: 'High',
          value: -4.30,
        },
      ],
    },
    {
      id: 'TXN-312984',
      timestamp: new Date(Date.now() - 86400000 * 5.2).toISOString(),
      amount: 4650,
      time: 72000,
      prediction: 'Legitimate',
      fraud_probability: 0.038,
      risk_level: 'Low',
      mode: 'DEMO',
      model_name: 'LightGBM Classifier (Kaggle ULB)',
      threshold_used: 0.50,
      model_insights: [
        {
          factor: 'Authorized Restaurant POS',
          description: 'Chip & PIN verified local merchant purchase during evening hours.',
          severity: 'Low',
          value: 'Verified POS',
        },
      ],
    },
    {
      id: 'TXN-678129',
      timestamp: new Date(Date.now() - 86400000 * 6.5).toISOString(),
      amount: 499,
      time: 21600,
      prediction: 'Legitimate',
      fraud_probability: 0.008,
      risk_level: 'Low',
      mode: 'DEMO',
      model_name: 'LightGBM Classifier (Kaggle ULB)',
      threshold_used: 0.50,
      model_insights: [
        {
          factor: 'Verified Digital Subscription',
          description: 'Standard monthly digital subscription matching historical billing cycle.',
          severity: 'Low',
          value: 'Nominal',
        },
      ],
    },
    {
      id: 'TXN-290145',
      timestamp: new Date(Date.now() - 86400000 * 12.8).toISOString(),
      amount: 142000,
      time: 12600,
      prediction: 'Fraudulent',
      fraud_probability: 0.978,
      risk_level: 'High',
      mode: 'DEMO',
      model_name: 'LightGBM Classifier (Kaggle ULB)',
      threshold_used: 0.50,
      model_insights: [
        {
          factor: 'Account Takeover Drain Pattern',
          description: 'Critical multi-sigma deviation across V17 (-9.40), V14 (-9.80), and V12 (-8.40) with maximum ticket size.',
          severity: 'High',
          value: '₹1,42,000',
        },
      ],
    },
    {
      id: 'TXN-819230',
      timestamp: new Date(Date.now() - 86400000 * 17.5).toISOString(),
      amount: 34200,
      time: 48000,
      prediction: 'Legitimate',
      fraud_probability: 0.385,
      risk_level: 'Medium',
      mode: 'DEMO',
      model_name: 'LightGBM Classifier (Kaggle ULB)',
      threshold_used: 0.50,
      model_insights: [
        {
          factor: 'Travel Merchant Step-Up',
          description: 'High-ticket airline ticket issued with verified 3D-Secure biometric confirmation.',
          severity: 'Medium',
          value: '3DS Authenticated',
        },
      ],
    },
    {
      id: 'TXN-441920',
      timestamp: new Date(Date.now() - 86400000 * 21.3).toISOString(),
      amount: 54000,
      time: 11400,
      prediction: 'Fraudulent',
      fraud_probability: 0.832,
      risk_level: 'High',
      mode: 'DEMO',
      model_name: 'LightGBM Classifier (Kaggle ULB)',
      threshold_used: 0.50,
      model_insights: [
        {
          factor: 'Circadian Peak Deviation (3:15 AM)',
          description: 'Unusual off-hours electronic transfer paired with anomalous V12 authorization component.',
          severity: 'High',
          value: -4.95,
        },
      ],
    },
    {
      id: 'TXN-734182',
      timestamp: new Date(Date.now() - 86400000 * 25.8).toISOString(),
      amount: 8900,
      time: 58000,
      prediction: 'Legitimate',
      fraud_probability: 0.062,
      risk_level: 'Low',
      mode: 'DEMO',
      model_name: 'LightGBM Classifier (Kaggle ULB)',
      threshold_used: 0.50,
      model_insights: [
        {
          factor: 'Domestic Retail Store Purchase',
          description: 'Standard retail point-of-sale clearance during regular daytime trading window.',
          severity: 'Low',
          value: 'Low Variance',
        },
      ],
    },
  ];

  // Persistent transaction history loaded from data/transactions.json
  const transactionHistory: PredictionResult[] = loadHistoryFromDisk(initialSeedTransactions);

  // Persistent fraud alerts loaded from data/alerts.json
  const fraudAlerts: FraudAlert[] = loadAlertsFromDisk(transactionHistory);

  // API Routes
  app.get(['/api/health', '/health'], async (req, res) => {
    let liveBackendConnected = false;
    let liveBackendDetails = null;

    if (!config.demo_mode) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);
        const flaskRes = await fetch(`${config.backend_url}/health`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (flaskRes.ok) {
          liveBackendConnected = true;
          liveBackendDetails = await flaskRes.json();
        }
      } catch {
        liveBackendConnected = false;
      }
    }

    res.json({
      status: 'healthy',
      service: 'FraudShield Full-Stack API',
      model_loaded: true,
      version: '1.2.0',
      timestamp: new Date().toISOString(),
      mode: config.demo_mode ? 'DEMO' : (liveBackendConnected ? 'LIVE' : 'HYBRID'),
      demo_mode: config.demo_mode,
      live_backend_url: config.backend_url,
      live_backend_connected: liveBackendConnected,
      live_backend_details: liveBackendDetails,
      algorithm: 'LightGBM (Gradient Boosted Trees)',
    });
  });

  app.get(['/api/model-info', '/model-info'], (req, res) => {
    res.json(BENCHMARK_MODEL_INFO);
  });

  // Model Evaluation Metrics Endpoint (Phase 16)
  app.get(['/api/metrics', '/metrics'], (req, res) => {
    const metaPath = path.join(process.cwd(), 'model', 'metadata.json');
    if (fs.existsSync(metaPath)) {
      try {
        const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
        if (metadata && metadata.metrics) {
          return res.json({
            available: true,
            precision: metadata.metrics.precision,
            recall: metadata.metrics.recall,
            f1_score: metadata.metrics.f1_score,
            roc_auc: metadata.metrics.roc_auc,
            pr_auc: metadata.metrics.pr_auc,
          });
        }
      } catch {
        // fallback
      }
    }
    res.json({ available: false });
  });

  app.get(['/api/stats', '/stats'], (req, res) => {
    const range = (req.query.range as string) || 'all';
    const now = Date.now();

    let filteredHistory = transactionHistory;
    if (range === 'today') {
      filteredHistory = transactionHistory.filter(
        (t) => now - new Date(t.timestamp).getTime() <= 24 * 3600 * 1000
      );
    } else if (range === '7d') {
      filteredHistory = transactionHistory.filter(
        (t) => now - new Date(t.timestamp).getTime() <= 7 * 24 * 3600 * 1000
      );
    } else if (range === '30d') {
      filteredHistory = transactionHistory.filter(
        (t) => now - new Date(t.timestamp).getTime() <= 30 * 24 * 3600 * 1000
      );
    }

    if (range === 'all') {
      const historyFraud = transactionHistory.filter((t) => t.prediction === 'Fraudulent').length;
      const historyLegit = transactionHistory.filter((t) => t.prediction === 'Legitimate').length;
      const historyHighRisk = transactionHistory.filter((t) => t.risk_level === 'High').length;
      const historyMedRisk = transactionHistory.filter((t) => t.risk_level === 'Medium').length;
      const historyLowRisk = transactionHistory.filter((t) => t.risk_level === 'Low').length;
      const historyAmountSum = transactionHistory.reduce((sum, t) => sum + t.amount, 0);

      const totalTransactions = BENCHMARK_DASHBOARD_STATS.total_transactions + transactionHistory.length;
      const fraudDetected = BENCHMARK_DASHBOARD_STATS.fraud_detected + historyFraud;
      const legitimate = BENCHMARK_DASHBOARD_STATS.legitimate + historyLegit;
      const fraudRate = totalTransactions > 0 ? (fraudDetected / totalTransactions) * 100 : 0.1727;
      const highRisk = BENCHMARK_DASHBOARD_STATS.high_risk_transactions + historyHighRisk;
      
      // Calculate weighted average amount accurately
      const benchmarkTotalSum = BENCHMARK_DASHBOARD_STATS.total_transactions * BENCHMARK_DASHBOARD_STATS.average_amount;
      const avgAmount = (benchmarkTotalSum + historyAmountSum) / totalTransactions;

      const dynamicStats = {
        ...BENCHMARK_DASHBOARD_STATS,
        total_transactions: totalTransactions,
        fraud_detected: fraudDetected,
        legitimate: legitimate,
        fraud_rate: fraudRate,
        high_risk_transactions: highRisk,
        average_amount: avgAmount,
        live_sessions_analyzed: transactionHistory.length,
        risk_distribution: {
          low: BENCHMARK_DASHBOARD_STATS.risk_distribution.low + historyLowRisk,
          medium: BENCHMARK_DASHBOARD_STATS.risk_distribution.medium + historyMedRisk,
          high: BENCHMARK_DASHBOARD_STATS.risk_distribution.high + historyHighRisk,
        },
      };
      return res.json(dynamicStats);
    }

    // Windowed Operational Stats (Today, 7d, 30d) calculated dynamically from actual records
    const totalTxns = filteredHistory.length;
    const fraudCount = filteredHistory.filter((t) => t.prediction === 'Fraudulent').length;
    const legitCount = filteredHistory.filter((t) => t.prediction === 'Legitimate').length;
    const fraudRate = totalTxns > 0 ? (fraudCount / totalTxns) * 100 : 0;
    const highRiskCount = filteredHistory.filter((t) => t.risk_level === 'High').length;
    const medRiskCount = filteredHistory.filter((t) => t.risk_level === 'Medium').length;
    const lowRiskCount = filteredHistory.filter((t) => t.risk_level === 'Low').length;
    const totalAmount = filteredHistory.reduce((sum, t) => sum + t.amount, 0);
    const avgAmount = totalTxns > 0 ? totalAmount / totalTxns : 0;

    const dynamicStats = {
      dataset_name: `Operational Telemetry Database (${range.toUpperCase()})`,
      total_transactions: totalTxns,
      fraud_detected: fraudCount,
      legitimate: legitCount,
      fraud_rate: fraudRate,
      high_risk_transactions: highRiskCount,
      average_amount: avgAmount,
      total_volume_amount: totalAmount,
      live_sessions_analyzed: totalTxns,
      risk_distribution: {
        low: lowRiskCount,
        medium: medRiskCount,
        high: highRiskCount,
      },
      hourly_trend: BENCHMARK_DASHBOARD_STATS.hourly_trend,
      amount_distribution: BENCHMARK_DASHBOARD_STATS.amount_distribution,
    };
    return res.json(dynamicStats);
  });

  app.get(['/api/config', '/config'], (req, res) => {
    res.json(config);
  });

  app.post(['/api/config', '/config'], (req, res) => {
    const { demo_mode, backend_url, decision_threshold, threshold_low, threshold_high } = req.body;
    if (typeof demo_mode === 'boolean') config.demo_mode = demo_mode;
    if (typeof backend_url === 'string') config.backend_url = backend_url.trim();
    if (typeof decision_threshold === 'number' && decision_threshold >= 0 && decision_threshold <= 1) {
      config.decision_threshold = decision_threshold;
    }
    if (typeof threshold_low === 'number') config.threshold_low = threshold_low;
    if (typeof threshold_high === 'number') config.threshold_high = threshold_high;

    res.json({ success: true, config });
  });

  app.post(['/api/predict', '/predict'], async (req, res) => {
    try {
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({
          error: true,
          message: 'Invalid transaction data: missing JSON payload.'
        });
      }

      let amount: number;
      let time: number;
      let vFeatures: Record<string, number> = {};
      let notes: string | undefined = req.body?.notes;

      // Support Phase 2 Contract: { "features": { "Amount": 100, "Time": 43200, "V1": 0.5, ... } }
      if (req.body && req.body.features && typeof req.body.features === 'object') {
        const rawF = req.body.features;
        const rawAmt = rawF.Amount !== undefined ? rawF.Amount : rawF.amount;
        if (typeof rawAmt !== 'number' || isNaN(rawAmt) || rawAmt < 0) {
          return res.status(400).json({
            error: true,
            message: 'Invalid transaction data: please provide a valid non-negative transaction amount.'
          });
        }
        amount = rawAmt;
        time = typeof rawF.Time === 'number' && !isNaN(rawF.Time) ? rawF.Time : (typeof rawF.time === 'number' && !isNaN(rawF.time) ? rawF.time : 0);

        for (let i = 1; i <= 28; i++) {
          const key = `V${i}`;
          vFeatures[key] = typeof rawF[key] === 'number' && !isNaN(rawF[key]) ? rawF[key] : 0;
        }
      } else {
        // Direct format: { amount, time, vFeatures, notes }
        const rawAmt = req.body?.amount !== undefined ? req.body?.amount : req.body?.Amount;
        if (typeof rawAmt !== 'number' || isNaN(rawAmt) || rawAmt < 0) {
          return res.status(400).json({
            error: true,
            message: 'Invalid transaction data: please provide a valid non-negative transaction amount.'
          });
        }
        amount = rawAmt;
        time = typeof req.body?.time === 'number' && !isNaN(req.body.time) ? req.body.time : (typeof req.body?.Time === 'number' && !isNaN(req.body.Time) ? req.body.Time : 0);
        const rawV = req.body?.vFeatures && typeof req.body.vFeatures === 'object' ? req.body.vFeatures : {};
        for (let i = 1; i <= 28; i++) {
          const key = `V${i}`;
          vFeatures[key] = typeof rawV[key] === 'number' && !isNaN(rawV[key]) ? rawV[key] : 0;
        }
      }

      const input: TransactionInput = {
        amount,
        time,
        vFeatures,
        notes,
      };

      // Check if Live Mode is active and Flask service is reachable
      if (!config.demo_mode) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);
          const flaskRes = await fetch(`${config.backend_url}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              features: {
                Amount: input.amount,
                Time: input.time,
                ...input.vFeatures,
              },
              threshold: config.decision_threshold,
              notes: input.notes,
            }),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (flaskRes.ok) {
            const liveResult = await flaskRes.json();
            const fullResult: PredictionResult = {
              id: liveResult.id || `TXN-LIV-${Math.floor(100000 + Math.random() * 900000)}`,
              timestamp: new Date().toISOString(),
              amount,
              time: input.time,
              prediction: liveResult.prediction || (liveResult.fraud_probability >= config.decision_threshold ? 'Fraudulent' : 'Legitimate'),
              fraud_probability: liveResult.fraud_probability,
              risk_level: liveResult.risk_level || (liveResult.fraud_probability >= config.threshold_high ? 'High' : liveResult.fraud_probability >= config.threshold_low ? 'Medium' : 'Low'),
              mode: 'LIVE',
              model_name: liveResult.model_name || 'Live LightGBM Python Service',
              model_version: 'v1.2',
              source: 'Single',
              threshold_used: config.decision_threshold,
              model_insights: liveResult.model_insights || [
                {
                  factor: 'Live Model Inference',
                  description: 'Prediction produced directly by python LGBMClassifier model pipeline.',
                  severity: liveResult.fraud_probability >= config.threshold_high ? 'High' : 'Low',
                  value: `${(liveResult.fraud_probability * 100).toFixed(1)}%`,
                },
              ],
              feature_contributions: liveResult.feature_contributions,
            };

            transactionHistory.unshift(fullResult);
            if (transactionHistory.length > 500) transactionHistory.pop();
            saveHistoryToDisk(transactionHistory);

            if (fullResult.risk_level === 'High') {
              const newAlert: FraudAlert = {
                id: `ALT-${Math.floor(10000 + Math.random() * 90000)}`,
                transaction_id: fullResult.id,
                timestamp: fullResult.timestamp,
                amount: fullResult.amount,
                fraud_probability: fullResult.fraud_probability,
                risk_level: 'High',
                status: 'Unread',
                source: 'Single',
              };
              fraudAlerts.unshift(newAlert);
              if (fraudAlerts.length > 500) fraudAlerts.pop();
              saveAlertsToDisk(fraudAlerts);
            }

            return res.json(fullResult);
          }
        } catch {
          // Live Flask service not reachable, fall through to deterministic model predictor
        }
      }

      // Deterministic LightGBM Decision Engine
      const result = evaluateTransactionDemo(
        input,
        config.decision_threshold,
        config.threshold_low,
        config.threshold_high
      );
      result.model_version = 'v1.2';
      result.source = 'Single';

      transactionHistory.unshift(result);
      if (transactionHistory.length > 500) transactionHistory.pop();
      saveHistoryToDisk(transactionHistory);

      if (result.risk_level === 'High') {
        const newAlert: FraudAlert = {
          id: `ALT-${Math.floor(10000 + Math.random() * 90000)}`,
          transaction_id: result.id,
          timestamp: result.timestamp,
          amount: result.amount,
          fraud_probability: result.fraud_probability,
          risk_level: 'High',
          status: 'Unread',
          source: 'Single',
        };
        fraudAlerts.unshift(newAlert);
        if (fraudAlerts.length > 500) fraudAlerts.pop();
        saveAlertsToDisk(fraudAlerts);
      }

      return res.json(result);
    } catch (err: any) {
      console.error('Prediction API error:', err);
      return res.status(500).json({
        error: true,
        message: 'Something went wrong while analyzing the transaction. Please try again.',
      });
    }
  });

  app.post('/api/predict-batch', async (req, res) => {
    try {
      const { transactions, syncToHistory = true } = req.body;

      if (!Array.isArray(transactions) || transactions.length === 0) {
        return res.status(400).json({ error: 'Please provide a non-empty array of transactions to analyze.' });
      }

      // Limit batch size to 2,000 for responsive container memory performance
      const batchToProcess = transactions.slice(0, 2000);
      const results: PredictionResult[] = [];

      for (let i = 0; i < batchToProcess.length; i++) {
        const item = batchToProcess[i];
        const amount = typeof item.amount === 'number' && !isNaN(item.amount) ? Math.max(0, item.amount) : 0;
        const time = typeof item.time === 'number' && !isNaN(item.time) ? item.time : 0;
        const vFeatures = item.vFeatures && typeof item.vFeatures === 'object' ? item.vFeatures : {};

        // Impute any missing V features to 0
        for (let v = 1; v <= 28; v++) {
          const key = `V${v}`;
          if (typeof vFeatures[key] !== 'number' || isNaN(vFeatures[key])) {
            vFeatures[key] = 0;
          }
        }

        const input: TransactionInput = {
          amount,
          time,
          vFeatures,
          notes: item.notes || `Batch Row #${i + 1}`,
        };

        const resItem = evaluateTransactionDemo(
          input,
          config.decision_threshold,
          config.threshold_low,
          config.threshold_high
        );

        if (item.id && typeof item.id === 'string' && item.id.trim()) {
          resItem.id = item.id.trim();
        } else {
          resItem.id = `TXN-BCH-${String(1000 + i + 1).padStart(4, '0')}`;
        }
        resItem.model_version = 'v1.2';
        resItem.source = 'Batch';

        results.push(resItem);
      }

      // Compute statistical summary
      const total = results.length;
      const fraudulent = results.filter((r) => r.prediction === 'Fraudulent').length;
      const legitimate = results.filter((r) => r.prediction === 'Legitimate').length;
      const high_risk = results.filter((r) => r.risk_level === 'High').length;
      const medium_risk = results.filter((r) => r.risk_level === 'Medium').length;
      const low_risk = results.filter((r) => r.risk_level === 'Low').length;
      const total_amount = results.reduce((sum, r) => sum + r.amount, 0);
      const average_amount = total > 0 ? total_amount / total : 0;
      const fraud_rate = total > 0 ? (fraudulent / total) * 100 : 0;

      const summary = {
        total,
        fraudulent,
        legitimate,
        high_risk,
        medium_risk,
        low_risk,
        fraud_rate,
        total_amount,
        average_amount,
      };

      // Synchronize to persistent transaction history and create alerts for high-risk items
      for (const item of results) {
        transactionHistory.unshift(item);
        if (item.risk_level === 'High') {
          const newAlert: FraudAlert = {
            id: `ALT-${Math.floor(10000 + Math.random() * 90000)}`,
            transaction_id: item.id,
            timestamp: item.timestamp,
            amount: item.amount,
            fraud_probability: item.fraud_probability,
            risk_level: 'High',
            status: 'Unread',
            source: 'Batch',
          };
          fraudAlerts.unshift(newAlert);
        }
      }
      if (transactionHistory.length > 500) {
        transactionHistory.length = 500;
      }
      if (fraudAlerts.length > 500) {
        fraudAlerts.length = 500;
      }
      saveHistoryToDisk(transactionHistory);
      saveAlertsToDisk(fraudAlerts);

      return res.json({
        success: true,
        summary,
        results,
      });
    } catch (err: any) {
      console.error('Batch Prediction API error:', err);
      return res.status(500).json({
        error: 'Failed to process batch transactions. Please check file formatting.',
      });
    }
  });

  // Alerts API Endpoints
  app.get('/api/alerts', (req, res) => {
    // Enrich alerts with linked transaction data from history
    const enrichedAlerts = fraudAlerts.map((alt) => {
      const matchedTxn = transactionHistory.find((t) => t.id === alt.transaction_id);
      return {
        ...alt,
        transaction: matchedTxn || undefined,
      };
    });

    const unreadCount = fraudAlerts.filter((a) => a.status === 'Unread').length;
    res.json({
      total: fraudAlerts.length,
      unread_count: unreadCount,
      alerts: enrichedAlerts,
    });
  });

  app.patch('/api/alerts/:id', (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    const alertIndex = fraudAlerts.findIndex((a) => a.id === id);
    if (alertIndex === -1) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    if (status) {
      fraudAlerts[alertIndex].status = status;
      if (status === 'Reviewed') {
        fraudAlerts[alertIndex].reviewed_at = new Date().toISOString();
      }
    }
    if (notes !== undefined) {
      fraudAlerts[alertIndex].notes = notes;
    }

    saveAlertsToDisk(fraudAlerts);

    const matchedTxn = transactionHistory.find((t) => t.id === fraudAlerts[alertIndex].transaction_id);
    res.json({
      success: true,
      alert: {
        ...fraudAlerts[alertIndex],
        transaction: matchedTxn || undefined,
      },
    });
  });

  app.post('/api/alerts/mark-all-reviewed', (req, res) => {
    const now = new Date().toISOString();
    let count = 0;
    for (const alt of fraudAlerts) {
      if (alt.status !== 'Reviewed') {
        alt.status = 'Reviewed';
        alt.reviewed_at = now;
        count++;
      }
    }
    saveAlertsToDisk(fraudAlerts);
    res.json({ success: true, count });
  });

  app.post('/api/alerts/clear', (req, res) => {
    fraudAlerts.length = 0;
    saveAlertsToDisk(fraudAlerts);
    res.json({ success: true, count: 0 });
  });

  app.get('/api/history', (req, res) => {
    const { page, limit } = req.query;
    if (page && limit) {
      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 10));
      const startIdx = (pageNum - 1) * limitNum;
      const paginated = transactionHistory.slice(startIdx, startIdx + limitNum);
      return res.json({
        total: transactionHistory.length,
        page: pageNum,
        limit: limitNum,
        total_pages: Math.ceil(transactionHistory.length / limitNum),
        transactions: paginated,
        storage_type: 'persistent_disk_file',
        db_file: 'data/transactions.json',
      });
    }
    res.json(transactionHistory);
  });

  app.post('/api/history/clear', (req, res) => {
    transactionHistory.length = 0;
    saveHistoryToDisk(transactionHistory);
    res.json({ success: true, count: 0 });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FraudShield Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
