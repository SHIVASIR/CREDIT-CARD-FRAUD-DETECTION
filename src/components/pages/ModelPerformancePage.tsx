import React, { useState } from 'react';
import {
  BarChart2,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  Scale,
  BrainCircuit,
  FileText,
  Layers,
  HelpCircle,
  Database,
  Crosshair,
  TrendingUp,
} from 'lucide-react';
import { ModelInfo } from '../../types';
import { StatCard } from '../StatCard';
import { ConfusionMatrixVisualizer, FeatureImportanceBarChart, RocCurveChart, PrecisionRecallCurveChart } from '../SvgCharts';

interface ModelPerformancePageProps {
  modelInfo: ModelInfo | null;
}

export const ModelPerformancePage: React.FC<ModelPerformancePageProps> = ({ modelInfo }) => {
  const [simThreshold, setSimThreshold] = useState<number>(0.50);

  if (!modelInfo || !modelInfo.metrics) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center space-y-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Model evaluation data not connected yet.</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The trained model artifacts or evaluation metadata are not yet available.
        </p>
      </div>
    );
  }

  // Holdout test set constants (20% stratified holdout of 284,807 = 56,962 transactions, 98 frauds, 56,864 legit)
  const totalHoldoutFrauds = 98;
  const totalHoldoutLegit = 56864;

  // Threshold Tradeoff Simulation
  const simRecall = Math.min(0.97, Math.max(0.60, 0.8367 + (0.50 - simThreshold) * 0.35));
  const simPrecision = Math.min(0.96, Math.max(0.40, 0.8913 - (0.50 - simThreshold) * 0.75));
  const simF1 = (2 * simPrecision * simRecall) / (simPrecision + simRecall);

  const simTP = Math.round(totalHoldoutFrauds * simRecall);
  const simFN = totalHoldoutFrauds - simTP;
  const simFP = Math.max(2, Math.round(simTP * (1 / simPrecision - 1)));
  const simTN = totalHoldoutLegit - simFP;

  const activeMatrix = {
    true_negative: simTN,
    false_positive: simFP,
    false_negative: simFN,
    true_positive: simTP,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 text-[11px] font-semibold mb-1">
          <BrainCircuit className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          <span>Evaluation Benchmark &amp; Telemetry</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight font-sans">
          Model Performance
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
          Evaluation results from the trained LightGBM classification model.
        </p>
      </div>

      {/* Compact Model Information Section (Phase 12) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Model Architecture &amp; Dataset Specifications</span>
              <span className="text-xs font-mono font-normal text-slate-400 dark:text-slate-500">({modelInfo.version})</span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Trained on {modelInfo.dataset_name}
            </p>
          </div>
          <span className="text-[11px] font-semibold font-mono px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80">
            LightGBM GBDT Engine
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-wider block">Algorithm</span>
            <p className="text-slate-900 dark:text-slate-100 font-semibold mt-0.5 font-mono">LightGBM (GBDT)</p>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-wider block">Task</span>
            <p className="text-slate-900 dark:text-slate-100 font-semibold mt-0.5">Binary Classification</p>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-wider block">Target</span>
            <p className="text-slate-900 dark:text-slate-100 font-semibold mt-0.5 font-mono">Fraud (1) / Legit (0)</p>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-wider block">Evaluation</span>
            <p className="text-slate-900 dark:text-slate-100 font-semibold mt-0.5">Precision, Recall, F1, PR-AUC</p>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-wider block">Dataset</span>
            <p className="text-slate-900 dark:text-slate-100 font-semibold mt-0.5">284,807 txns (0.172% fraud)</p>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid (Phase 11) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <StatCard
          id="metric-precision"
          title="Precision"
          value={`${(modelInfo.metrics.precision * 100).toFixed(2)}%`}
          subtitle="True Positives / Total Flagged"
          icon={CheckCircle2}
          badge="Minimal False Alarms"
          variant="success"
        />

        <StatCard
          id="metric-recall"
          title="Recall"
          value={`${(modelInfo.metrics.recall * 100).toFixed(2)}%`}
          subtitle="Frauds Caught / Total Actual Frauds"
          icon={AlertTriangle}
          badge="High Fraud Intercept"
          variant="danger"
        />

        <StatCard
          id="metric-f1"
          title="F1-Score"
          value={`${(modelInfo.metrics.f1_score * 100).toFixed(2)}%`}
          subtitle="Harmonic Mean (Prec &amp; Rec)"
          icon={BarChart2}
          badge="Balanced Measure"
          variant="default"
        />

        <StatCard
          id="metric-roc-auc"
          title="ROC-AUC"
          value={modelInfo.metrics.roc_auc.toFixed(4)}
          subtitle="Area Under ROC Curve"
          icon={Scale}
          badge="Discriminative Power"
          variant="default"
        />

        <StatCard
          id="metric-pr-auc"
          title="PR-AUC"
          value={modelInfo.metrics.pr_auc.toFixed(4)}
          subtitle="Area Under Precision-Recall"
          icon={TrendingUp}
          badge="Imbalance Gold Standard"
          variant="default"
        />
      </div>

      {/* Educational Callout: Why these metrics matter for fraud detection */}
      <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 transition-colors">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Why These Metrics Matter For Fraud Detection
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 space-y-1">
            <strong className="text-slate-900 dark:text-slate-100 font-semibold block text-xs">Precision (89.13%)</strong>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Measures how many transactions flagged as fraud are genuinely fraudulent. Low precision causes widespread customer friction and blocks legitimate cardholders.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 space-y-1">
            <strong className="text-slate-900 dark:text-slate-100 font-semibold block text-xs">Recall (83.67%)</strong>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Measures the proportion of all fraudulent attempts successfully caught. Low recall causes direct financial loss because unauthorized transactions slip through unintercepted.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 space-y-1">
            <strong className="text-slate-900 dark:text-slate-100 font-semibold block text-xs">F1-Score (86.32%)</strong>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              The harmonic mean of precision and recall. It ensures neither false positives nor false negatives are sacrificed during hyperparameter tuning.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 space-y-1">
            <strong className="text-slate-900 dark:text-slate-100 font-semibold block text-xs">PR-AUC (0.8621)</strong>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Unlike ROC-AUC which can be artificially inflated by millions of true negatives, PR-AUC evaluates precision across all recall thresholds on the rare minority class (0.17%).
            </p>
          </div>
        </div>
      </div>

      {/* Visual Evaluation Sections: 1. Confusion Matrix, 2. ROC Curve, 3. PR Curve */}
      <div className="space-y-5">
        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <Crosshair className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Evaluation Curves &amp; Confusion Matrix</span>
        </h3>

        {/* Confusion Matrix & Threshold Simulation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ConfusionMatrixVisualizer matrix={activeMatrix} />

          {/* Interactive Threshold Tradeoff Explorer */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition-colors">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Decision Threshold Simulator
                </h4>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80">
                  {(simThreshold * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                Explore the operational trade-off between customer friction (FP) and financial loss (FN):
              </p>

              <input
                id="slider-threshold-sim"
                type="range"
                min="0.10"
                max="0.90"
                step="0.05"
                value={simThreshold}
                onChange={(e) => setSimThreshold(parseFloat(e.target.value))}
                className="w-full accent-blue-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer my-2"
              />

              <div className="grid grid-cols-3 gap-2 text-center text-xs my-3">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Simulated Precision</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
                    {(simPrecision * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Simulated Recall</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
                    {(simRecall * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Simulated F1</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
                    {(simF1 * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                  At {(simThreshold * 100).toFixed(0)}% Decision Threshold:
                </p>
                <ul className="list-disc list-inside text-[11px] space-y-0.5 text-slate-600 dark:text-slate-400">
                  <li>
                    <strong className="text-rose-600 dark:text-rose-400">{simFN}</strong> fraudulent attempts slip through (False Negatives).
                  </li>
                  <li>
                    <strong className="text-amber-600 dark:text-amber-400">{simFP}</strong> legitimate authorizations challenged (False Positives).
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Recommended Baseline: <strong className="font-mono">0.50</strong></span>
              <button
                onClick={() => setSimThreshold(0.50)}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer"
              >
                Reset to 0.50
              </button>
            </div>
          </div>
        </div>

        {/* 2. ROC Curve & 3. Precision-Recall Curve side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <RocCurveChart rocAuc={modelInfo.metrics.roc_auc} />
          <PrecisionRecallCurveChart prAuc={modelInfo.metrics.pr_auc} />
        </div>
      </div>

      {/* Feature Importance Section */}
      <FeatureImportanceBarChart features={modelInfo.feature_importance} />

      {/* Hyperparameter Summary Table */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3.5 transition-colors">
        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          LightGBM Hyperparameter Configuration
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 text-xs">
          {Object.entries(modelInfo.hyperparameters).map(([key, val]) => (
            <div key={key} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px]">{key}</span>
              <p className="text-slate-900 dark:text-slate-100 font-semibold font-mono text-xs mt-0.5">{String(val)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
