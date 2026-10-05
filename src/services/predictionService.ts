import { AppConfig, PredictionResult, TransactionInput } from '../types';
import { evaluateTransactionDemo } from '../utils/mlEngine';

/**
 * ML Prediction Service Contract & Implementations (Phase 3 & Phase 4)
 * 
 * Separates API communication from UI components and cleanly isolates
 * the development mock adapter behind a polymorphic interface.
 */

export interface BackendHealthStatus {
  status: 'healthy' | 'degraded' | 'offline';
  model_loaded: boolean;
  algorithm?: string;
  version?: string;
}

export interface ModelMetricsResponse {
  available: boolean;
  precision?: number;
  recall?: number;
  f1_score?: number;
  roc_auc?: number;
  pr_auc?: number;
}

export interface IPredictionService {
  predictTransaction(input: TransactionInput, threshold?: number): Promise<PredictionResult>;
  checkBackendHealth(): Promise<BackendHealthStatus>;
  getModelMetrics(): Promise<ModelMetricsResponse>;
}

// Configurable base URL via environment variable (Phase 18)
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

/**
 * RealPredictionService (Phase 4)
 * Communicates with the actual Python/Flask ML backend over HTTP REST.
 * Sends the strict ML contract payload: { "features": { "Amount": ..., "Time": ..., "V1": ... } }
 */
export class RealPredictionService implements IPredictionService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async predictTransaction(input: TransactionInput, threshold: number = 0.50): Promise<PredictionResult> {
    // Construct Phase 2 ML Contract Payload
    const contractPayload = {
      features: {
        Amount: input.amount,
        Time: input.time,
        ...input.vFeatures,
      },
      threshold,
      notes: input.notes,
    };

    const res = await fetch(`${this.baseUrl}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contractPayload),
    });

    if (!res.ok) {
      let friendlyMessage = 'Unable to analyze this transaction right now. Please try again.';
      try {
        const errorJson = await res.json();
        if (errorJson && errorJson.message) {
          friendlyMessage = errorJson.message;
        } else if (errorJson && errorJson.error) {
          friendlyMessage = typeof errorJson.error === 'string' ? errorJson.error : friendlyMessage;
        }
      } catch {
        // use default friendly message
      }
      throw new Error(friendlyMessage);
    }

    const data = await res.json();

    return {
      id: data.id || `TXN-LIV-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: data.timestamp || new Date().toISOString(),
      amount: input.amount,
      time: input.time,
      prediction: data.prediction,
      fraud_probability: data.fraud_probability,
      risk_level: data.risk_level,
      mode: 'LIVE',
      model_name: data.model_name || 'Live LightGBM Classifier',
      threshold_used: data.threshold_used ?? threshold,
      model_insights: data.model_insights || [
        {
          factor: 'Live LightGBM Pipeline',
          description: `Direct inference returned ${(data.fraud_probability * 100).toFixed(1)}% fraud probability.`,
          severity: data.risk_level === 'High' ? 'High' : 'Low',
          value: `${(data.fraud_probability * 100).toFixed(1)}%`,
        },
      ],
      feature_contributions: data.feature_contributions || [],
    };
  }

  async checkBackendHealth(): Promise<BackendHealthStatus> {
    const res = await fetch(`${this.baseUrl}/health`);
    if (!res.ok) {
      return { status: 'degraded', model_loaded: false };
    }
    const data = await res.json();
    return {
      status: data.status === 'healthy' ? 'healthy' : 'degraded',
      model_loaded: Boolean(data.model_loaded),
      algorithm: data.algorithm,
      version: data.version,
    };
  }

  async getModelMetrics(): Promise<ModelMetricsResponse> {
    const res = await fetch(`${this.baseUrl}/metrics`);
    if (!res.ok) {
      return { available: false };
    }
    return res.json();
  }
}

/**
 * MockPredictionService (Phase 4 Development Adapter)
 * Clearly isolated mock adapter used for client-only verification, offline demos,
 * or when the Python ML backend is not yet started.
 * DOES NOT pretend to be real ML inference.
 */
export class MockPredictionService implements IPredictionService {
  async predictTransaction(input: TransactionInput, threshold: number = 0.50): Promise<PredictionResult> {
    // Artificial small delay to simulate network roundtrip in development
    await new Promise((r) => setTimeout(r, 200));

    const result = evaluateTransactionDemo(input, threshold, 0.30, 0.70);
    return {
      ...result,
      mode: 'DEMO',
      model_name: 'LightGBM Decision Engine (Development Mock Adapter)',
    };
  }

  async checkBackendHealth(): Promise<BackendHealthStatus> {
    return {
      status: 'healthy',
      model_loaded: true,
      algorithm: 'LightGBM Client Mock Adapter (Development Only)',
      version: 'v1.2.0-dev',
    };
  }

  async getModelMetrics(): Promise<ModelMetricsResponse> {
    return {
      available: true,
      precision: 0.8913,
      recall: 0.8367,
      f1_score: 0.8632,
      roc_auc: 0.9834,
      pr_auc: 0.8621,
    };
  }
}

/**
 * Unified Prediction Service Factory
 * Dispatches to RealPredictionService or MockPredictionService
 */
export class PredictionServiceManager implements IPredictionService {
  private realService: RealPredictionService;
  private mockService: MockPredictionService;
  private preferDemo: boolean;

  constructor(preferDemo = false) {
    this.realService = new RealPredictionService();
    this.mockService = new MockPredictionService();
    this.preferDemo = preferDemo;
  }

  setDemoMode(isDemo: boolean) {
    this.preferDemo = isDemo;
  }

  async predictTransaction(input: TransactionInput, threshold = 0.50): Promise<PredictionResult> {
    if (this.preferDemo) {
      return this.mockService.predictTransaction(input, threshold);
    }

    try {
      return await this.realService.predictTransaction(input, threshold);
    } catch (err: any) {
      console.warn('[PredictionService] Real ML Backend unavailable, falling back to Development Mock Adapter:', err.message);
      const fallback = await this.mockService.predictTransaction(input, threshold);
      return fallback;
    }
  }

  async checkBackendHealth(): Promise<BackendHealthStatus> {
    try {
      return await this.realService.checkBackendHealth();
    } catch {
      return { status: 'offline', model_loaded: false };
    }
  }

  async getModelMetrics(): Promise<ModelMetricsResponse> {
    try {
      return await this.realService.getModelMetrics();
    } catch {
      return { available: false };
    }
  }
}

// Export singleton instance
export const predictionService = new PredictionServiceManager();
