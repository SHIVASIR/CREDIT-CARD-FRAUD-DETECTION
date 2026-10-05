import React, { useState, useMemo } from 'react';
import {
  ArrowRight,
  Shield,
  ShieldAlert,
  BarChart2,
  Cpu,
  Layers,
  Activity,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  ArrowRightCircle,
  FileCheck2,
  SlidersHorizontal,
} from 'lucide-react';
import { DashboardStats, ModelInfo, PredictionResult, TimeRangeFilter } from '../../types';
import { StatCard } from '../StatCard';
import { ClassImbalanceDonut, HourlyTrendChart, AmountDistributionChart } from '../SvgCharts';
import { RecentHighRiskTable } from '../RecentHighRiskTable';
import { RiskDistributionCard } from '../RiskDistributionCard';
import { TransactionDetailModal } from '../TransactionDetailModal';
import { calculateDashboardMetrics } from '../../utils/dashboardMetrics';

interface DashboardPageProps {
  stats: DashboardStats;
  modelInfo: ModelInfo;
  onNavigateToDetect: () => void;
  onNavigateToPerformance: () => void;
  onNavigateToHistory?: () => void;
  isDemoMode: boolean;
  history?: PredictionResult[];
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  modelInfo,
  onNavigateToDetect,
  onNavigateToPerformance,
  onNavigateToHistory,
  isDemoMode,
  history = [],
}) => {
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('all');
  const [selectedTxn, setSelectedTxn] = useState<PredictionResult | null>(null);

  const metrics = useMemo(() => {
    return calculateDashboardMetrics(stats, history, timeRange);
  }, [stats, history, timeRange]);

  const timeFilterOptions: Array<{ id: TimeRangeFilter; label: string }> = [
    { id: 'today', label: 'Today' },
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: 'all', label: 'All Time' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Section (Phase 4 Specification) */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs relative overflow-hidden transition-colors">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Credit Card Fraud Detection using Machine Learning</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
            Fraud<span className="text-blue-600 dark:text-blue-400">Shield</span>
          </h1>

          <p className="text-lg font-medium text-slate-700 dark:text-slate-200">
            Detects fraudulent transactions using machine learning models.
          </p>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Analyze transaction patterns and identify potentially fraudulent activity using a LightGBM-based machine learning model.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="hero-check-transaction-btn"
              onClick={onNavigateToDetect}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-sm shadow-xs hover:shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-blue-200" />
              <span>Check a Transaction</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-view-performance-btn"
              onClick={onNavigateToPerformance}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-semibold text-sm border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <BarChart2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>View Model Performance</span>
            </button>
          </div>
        </div>

        {/* Compact System Overview (Phase 4 Specification) */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider block">
              Model
            </span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5 block font-mono">
              LightGBM
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Gradient Boosted Trees</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider block">
              Problem Type
            </span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5 block">
              Binary Classification
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Imbalance (577:1 ratio)</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider block">
              Output
            </span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5 block">
              Fraud / Legitimate
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Decision threshold 50%</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider block">
              Prediction
            </span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5 block">
              Probability + Risk Level
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Low, Medium, High</span>
          </div>
        </div>

        {/* Visual Workflow (Phase 4 Specification) */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Machine Learning Inference Pipeline
            </span>
            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
              End-to-End Operational Architecture
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
            {[
              { step: '1', title: 'Transaction', sub: 'Amount, Time & PCA Features' },
              { step: '2', title: 'Preprocessing', sub: 'RobustScaler & Validation' },
              { step: '3', title: 'LightGBM', sub: 'Leaf-Wise Tree Inference' },
              { step: '4', title: 'Risk Analysis', sub: 'Calibrated Probability' },
              { step: '5', title: 'Result', sub: 'Explainable AI & Assessment' },
            ].map((node, i) => (
              <div
                key={node.step}
                className="relative p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                    {node.step}
                  </span>
                  {i < 4 && (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 hidden sm:block" />
                  )}
                </div>
                <div className="mt-2">
                  <strong className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                    {node.title}
                  </strong>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 leading-tight">
                    {node.sub}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Operational Telemetry Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            System Telemetry &amp; Benchmark Overview
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kaggle 284,807 Credit Card Transaction Dataset &bull; Holdout Validation Statistics
          </p>
        </div>

        <div className="flex items-center p-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs self-start sm:self-auto">
          <div className="flex items-center px-2 text-slate-400 dark:text-slate-500 mr-0.5">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          {timeFilterOptions.map((opt) => {
            const isActive = timeRange === opt.id;
            return (
              <button
                key={opt.id}
                id={`filter-btn-${opt.id}`}
                onClick={() => setTimeRange(opt.id)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* High-Level Benchmark Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          id="stat-total-txns"
          title="Total Transactions"
          value={metrics.totalTransactions.toLocaleString()}
          subtitle="Benchmark dataset volume"
          icon={Activity}
          badge="Verified Records"
          variant="default"
        />

        <StatCard
          id="stat-fraud-detected"
          title="Fraudulent Detected"
          value={metrics.fraudulentTransactions.toLocaleString()}
          subtitle={`Prevalence rate: ${metrics.fraudRate.toFixed(3)}%`}
          icon={AlertTriangle}
          badge="Minority Class"
          variant="danger"
        />

        <StatCard
          id="stat-legit-txns"
          title="Legitimate Transactions"
          value={metrics.legitimateTransactions.toLocaleString()}
          subtitle="Authentic cardholder debits"
          icon={CheckCircle2}
          badge="99.83% of Volume"
          variant="success"
        />

        <StatCard
          id="stat-model-acc"
          title="LightGBM ROC-AUC"
          value={modelInfo.metrics.roc_auc.toFixed(4)}
          subtitle="Precision: 89.1% | Recall: 83.7%"
          icon={Cpu}
          badge="Validated Model"
          variant="default"
        />
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ClassImbalanceDonut
          legitimateCount={metrics.legitimateTransactions}
          fraudCount={metrics.fraudulentTransactions}
        />
        <RiskDistributionCard
          distribution={metrics.riskDistribution}
          totalCount={metrics.totalTransactions}
          onNavigateToDetect={onNavigateToDetect}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <HourlyTrendChart data={metrics.trendData} />
        <AmountDistributionChart data={metrics.amountDistribution} />
      </div>

      {/* Recent High Risk Activity if any */}
      {metrics.recentHighRiskTransactions.length > 0 && (
        <RecentHighRiskTable
          transactions={metrics.recentHighRiskTransactions}
          onSelectTransaction={(t: PredictionResult) => setSelectedTxn(t)}
          onNavigateToDetect={onNavigateToDetect}
          timeRangeLabel={metrics.sourceLabel}
        />
      )}

      {selectedTxn && (
        <TransactionDetailModal
          transaction={selectedTxn}
          onClose={() => setSelectedTxn(null)}
        />
      )}
    </div>
  );
};
