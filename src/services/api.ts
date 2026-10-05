import { AppConfig, DashboardStats, HealthResponse, ModelInfo, PredictionResult, TransactionInput } from '../types';
import { predictionService, API_BASE_URL } from './predictionService';

/**
 * FraudShield API Service
 * 
 * Isolates all backend HTTP communication for single predictions,
 * system health diagnostics, telemetry stats, and model metadata.
 * Uses environment-configured base URL (VITE_API_BASE_URL).
 */

export const apiService = {
  /**
   * Health Check
   * GET /api/health
   */
  async getHealth(): Promise<HealthResponse> {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) {
      throw new Error(`Health check failed with status: ${res.status}`);
    }
    return res.json();
  },

  /**
   * Model Performance & Metadata
   * GET /api/model-info
   */
  async getModelInfo(): Promise<ModelInfo> {
    const res = await fetch(`${API_BASE_URL}/model-info`);
    if (!res.ok) {
      throw new Error(`Failed to fetch model info (status: ${res.status})`);
    }
    return res.json();
  },

  /**
   * Dashboard & Operational Telemetry Stats
   * GET /api/stats?range=all|today|7d|30d
   */
  async getStats(range = 'all'): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE_URL}/stats?range=${range}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch stats (status: ${res.status})`);
    }
    return res.json();
  },

  /**
   * App Configuration
   * GET /api/config
   */
  async getConfig(): Promise<AppConfig> {
    const res = await fetch(`${API_BASE_URL}/config`);
    if (!res.ok) {
      throw new Error(`Failed to fetch config (status: ${res.status})`);
    }
    return res.json();
  },

  /**
   * Update Configuration
   * POST /api/config
   */
  async updateConfig(newConfig: Partial<AppConfig>): Promise<AppConfig> {
    const res = await fetch(`${API_BASE_URL}/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig),
    });
    if (!res.ok) {
      throw new Error(`Failed to update config (status: ${res.status})`);
    }
    const data = await res.json();
    return data.config;
  },

  /**
   * Predict Transaction Risk (Primary ML Flow)
   * POST /api/predict
   */
  async predictTransaction(input: TransactionInput, threshold?: number): Promise<PredictionResult> {
    return predictionService.predictTransaction(input, threshold);
  },

  /**
   * Model Performance Metrics
   * GET /api/metrics
   */
  async getMetrics() {
    return predictionService.getModelMetrics();
  },
};
