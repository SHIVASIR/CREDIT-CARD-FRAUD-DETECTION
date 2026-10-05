import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ModeConfigModal } from './components/ModeConfigModal';
import { DashboardPage } from './components/pages/DashboardPage';
import { DetectFraudPage } from './components/pages/DetectFraudPage';
import { ModelPerformancePage } from './components/pages/ModelPerformancePage';
import { AboutPage } from './components/pages/AboutPage';
import { BENCHMARK_DASHBOARD_STATS, BENCHMARK_MODEL_INFO } from './data/benchmarkData';
import { AppConfig, DashboardStats, ModelInfo, PredictionResult, TransactionInput } from './types';
import { evaluateTransactionDemo } from './utils/mlEngine';
import { apiService } from './services/api';
import { predictionService } from './services/predictionService';
import { Shield, Cpu } from 'lucide-react';

export default function App() {
  // Navigation active tab: 'dashboard' | 'predict' | 'performance' | 'about'
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);

  // Theme Management (Light / Dark)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('fraudshield-theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('fraudshield-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // App Configuration state
  const [config, setConfig] = useState<AppConfig>({
    demo_mode: true,
    backend_url: 'http://localhost:5000',
    decision_threshold: 0.50,
    threshold_low: 0.30,
    threshold_high: 0.70,
  });

  const [stats, setStats] = useState<DashboardStats>(BENCHMARK_DASHBOARD_STATS);
  const [modelInfo, setModelInfo] = useState<ModelInfo>(BENCHMARK_MODEL_INFO);
  const [history, setHistory] = useState<PredictionResult[]>([]);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Load initial backend telemetry & configuration
  useEffect(() => {
    async function initApp() {
      try {
        // 1. Fetch Config
        try {
          const cfg = await apiService.getConfig();
          if (cfg) setConfig(cfg);
        } catch {
          // fallback to default config
        }

        // 2. Fetch Health (Real /api/health verification)
        try {
          const health = await apiService.getHealth();
          const isHealthy = Boolean(health && (health.status === 'healthy' || (health as any).status === 'ok'));
          setIsBackendConnected(isHealthy);
        } catch {
          setIsBackendConnected(false);
        }

        // 3. Fetch Model Info
        try {
          const mInfo = await apiService.getModelInfo();
          if (mInfo) setModelInfo(mInfo);
        } catch {
          // fallback to benchmark metadata
        }

        // 4. Fetch Stats
        try {
          const st = await apiService.getStats();
          if (st) setStats(st);
        } catch {
          // fallback to benchmark stats
        }

        // 5. Fetch History
        try {
          const histRes = await fetch('/api/history');
          if (histRes.ok) {
            const hist = await histRes.json();
            const records = Array.isArray(hist) ? hist : hist.transactions || [];
            setHistory(records);
          }
        } catch {
          // ignore
        }
      } catch (err) {
        console.warn('Initial server fetch notice, using calibrated benchmark state:', err);
      } finally {
        setIsInitializing(false);
      }
    }

    initApp();
  }, []);

  // Handler: Analyze Transaction (Primary ML flow via PredictionService)
  const handleAnalyzeTransaction = async (input: TransactionInput): Promise<PredictionResult> => {
    predictionService.setDemoMode(config.demo_mode);
    const result = await predictionService.predictTransaction(input, config.decision_threshold);
    setHistory((prev) => [result, ...prev]);

    // Refresh dynamic telemetry stats
    apiService.getStats().then((st) => setStats(st)).catch(() => {});

    return result;
  };

  // Handler: Save Configuration
  const handleSaveConfig = async (newConfig: Partial<AppConfig>) => {
    try {
      const updated = await apiService.updateConfig(newConfig);
      setConfig(updated);
      await handleRefreshHealth();
    } catch (err) {
      setConfig((prev) => ({ ...prev, ...newConfig }));
    }
  };

  // Handler: Refresh Health Status
  const handleRefreshHealth = async () => {
    try {
      const health = await apiService.getHealth();
      const isHealthy = Boolean(health && (health.status === 'healthy' || (health as any).status === 'ok'));
      setIsBackendConnected(isHealthy);
    } catch {
      setIsBackendConnected(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 selection:bg-blue-600 selection:text-white">
      {/* Navigation (Phase 3 Information Architecture) */}
      <Navbar
        activeTab={activeTab === 'detect' ? 'predict' : activeTab}
        setActiveTab={(tab) => setActiveTab(tab)}
        config={config}
        isBackendConnected={isBackendConnected}
        onOpenConfigModal={() => setIsConfigModalOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardPage
            stats={stats}
            modelInfo={modelInfo}
            onNavigateToDetect={() => setActiveTab('predict')}
            onNavigateToPerformance={() => setActiveTab('performance')}
            isDemoMode={config.demo_mode}
            history={history}
          />
        )}

        {(activeTab === 'predict' || activeTab === 'detect') && (
          <DetectFraudPage
            config={config}
            onAnalyzeTransaction={handleAnalyzeTransaction}
            onNavigateToPerformance={() => setActiveTab('performance')}
            isBackendConnected={isBackendConnected}
          />
        )}

        {activeTab === 'performance' && (
          <ModelPerformancePage modelInfo={modelInfo} />
        )}

        {activeTab === 'about' && (
          <AboutPage />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-slate-800 dark:text-slate-200">FraudShield</span>
            <span>&bull;</span>
            <span>Credit Card Fraud Detection using Machine Learning (LightGBM)</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>{isBackendConnected ? 'Backend Online' : 'Backend Offline'}</span>
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span>Academic MVP &bull; Kaggle ULB Benchmark</span>
          </div>
        </div>
      </footer>

      {/* Mode & Threshold Config Dialog */}
      <ModeConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        isBackendConnected={isBackendConnected}
        onRefreshHealth={handleRefreshHealth}
      />
    </div>
  );
}
