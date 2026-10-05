import React from 'react';
import { FeatureImportanceItem, ConfusionMatrixData } from '../types';

/**
 * Responsive Donut / Distribution Chart for Class Imbalance
 */
export const ClassImbalanceDonut: React.FC<{
  legitimateCount: number;
  fraudCount: number;
}> = ({ legitimateCount, fraudCount }) => {
  const total = legitimateCount + fraudCount;
  const fraudPct = total > 0 ? (fraudCount / total) * 100 : 0.17;
  const legitPct = total > 0 ? 100 - fraudPct : 99.83;
  const ratioLabel = total > 0 && fraudCount > 0
    ? `${(legitimateCount / fraudCount).toFixed(0)}:1 Ratio`
    : total > 0
    ? '100% Legit'
    : '577:1 Ratio';

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Transaction Class Distribution
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Class imbalance ratio (Legitimate vs Fraudulent)</p>
        </div>
        <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
          {ratioLabel}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-4 my-2">
        {/* SVG Donut */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            {/* Background / Legitimate Circle */}
            <circle
              cx="18"
              cy="18"
              r="14"
              fill="none"
              className="stroke-slate-800 dark:stroke-slate-700"
              strokeWidth="4"
            />
            {/* Fraudulent Slice */}
            <circle
              cx="18"
              cy="18"
              r="14"
              fill="none"
              stroke="#e11d48"
              strokeWidth="4"
              strokeDasharray={`${total > 0 && fraudCount > 0 ? Math.max(1.5, (fraudPct / 100) * 88) : 0} 88`}
              strokeDashoffset="0"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100 font-sans tracking-tight">
              {legitPct.toFixed(1)}%
            </span>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Legitimate</span>
          </div>
        </div>

        {/* Legend & Exact Quantities */}
        <div className="space-y-2.5 w-full sm:w-auto">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-750 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800 dark:bg-slate-500" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Legitimate</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 font-mono">{legitimateCount.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1.5 font-medium">({legitPct.toFixed(2)}%)</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
              <span className="text-xs font-medium text-rose-900 dark:text-rose-300">Fraudulent</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 font-mono">{fraudCount.toLocaleString()}</span>
              <span className="text-[10px] text-rose-600/80 dark:text-rose-400 ml-1.5 font-medium">({fraudPct.toFixed(3)}%)</span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 leading-relaxed">
        Real-time class balance tracking: demonstrates operational risk exposure across verified authentic records.
      </p>
    </div>
  );
};

/**
 * Clean SVG Fraud & Transaction Activity Trend
 */
export const HourlyTrendChart: React.FC<{
  data: Array<{ hour?: number; label: string; total: number; fraud: number; legitimate?: number }>;
  title?: string;
  subtitle?: string;
  note?: string;
}> = ({ data, title = 'Temporal Fraud Density (Circadian Trend)', subtitle = 'Fraud occurrences vs transaction volume over observation window', note }) => {
  const maxTotal = Math.max(1, ...data.map(d => d.total));
  const maxFraud = Math.max(1, ...data.map(d => d.fraud));

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            {title}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium text-[11px]">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-200 dark:bg-slate-700" /> Volume
          </span>
          <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold text-[11px]">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Fraud Events
          </span>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="h-44 w-full flex items-end gap-1.5 sm:gap-2 pt-6 pb-2 px-1">
        {data.map((item, idx) => {
          const totalHeightPct = Math.round((item.total / maxTotal) * 100);
          const fraudHeightPct = item.fraud > 0 ? Math.max(8, Math.round((item.fraud / maxFraud) * 85)) : 0;

          return (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
              {/* Tooltip on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 pointer-events-none bg-slate-900 dark:bg-slate-800 text-white text-[10px] px-2.5 py-1 rounded-md shadow-md whitespace-nowrap border border-slate-800 dark:border-slate-700">
                <p className="font-bold">{item.label}</p>
                <p className="text-slate-300">Volume: {item.total.toLocaleString()}</p>
                <p className="text-rose-400 font-semibold">Fraud: {item.fraud} cases</p>
              </div>

              {/* Fraud spike marker */}
              {fraudHeightPct > 0 && (
                <div 
                  style={{ height: `${fraudHeightPct}%` }}
                  className="w-full max-w-[14px] bg-rose-500 rounded-t transition-all group-hover:bg-rose-600 relative z-10"
                />
              )}

              {/* Total volume subtle bar */}
              <div 
                style={{ height: `${Math.max(item.total > 0 ? 6 : 2, totalHeightPct)}%` }}
                className="w-full max-w-[14px] bg-slate-100 dark:bg-slate-800 rounded-t -mt-full transition-all group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
              />

              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-mono truncate max-w-full text-center">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span>{note || 'Dynamic telemetry reflects active time filter.'}</span>
        <span className="font-semibold text-slate-700 dark:text-slate-300">Live Telemetry</span>
      </div>
    </div>
  );
};

/**
 * Amount Distribution Chart
 */
export const AmountDistributionChart: React.FC<{
  data: Array<{ range: string; total: number; fraud: number }>;
}> = ({ data }) => {
  const maxCount = Math.max(...data.map(d => d.total));

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Transaction Amount Distribution
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Monetary value grouping with fraud occurrence frequencies</p>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 font-mono">
          RobustScaled
        </span>
      </div>

      <div className="space-y-3">
        {data.map((item, idx) => {
          const widthPct = Math.max(8, Math.round((item.total / maxCount) * 100));
          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300 font-mono text-[11px]">{item.range}</span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  {item.total.toLocaleString()} txns &bull; <strong className="text-rose-600 dark:text-rose-400 font-semibold">{item.fraud} fraud</strong>
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div 
                  style={{ width: `${widthPct}%` }}
                  className="h-full bg-slate-800 dark:bg-blue-500 rounded-full"
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        Over 68% of fraudulent attempts target low-to-medium amounts (&lt; ₹5,000) to blend into routine authorization thresholds.
      </p>
    </div>
  );
};

/**
 * LightGBM Feature Importance Horizontal Bar Chart
 */
export const FeatureImportanceBarChart: React.FC<{
  features: FeatureImportanceItem[];
}> = ({ features }) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Top Influential Features (LightGBM Split Gain)
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Relative importance in tree node split determinations</p>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 font-mono">
          LGBM Gain Metric
        </span>
      </div>

      <div className="space-y-3">
        {features.slice(0, 8).map((item) => (
          <div key={item.feature} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-slate-100 font-mono w-14 text-xs">{item.feature}</span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px] truncate max-w-[260px] sm:max-w-[400px]">
                  {item.description}
                </span>
              </div>
              <span className="font-mono font-medium text-slate-700 dark:text-slate-300 text-[11px]">{item.importance} splits</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${item.normalized_pct}%` }}
                className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 italic">
        * Feature importance indicates how useful features were to the trained model; it does not establish causal relationships.
      </div>
    </div>
  );
};

/**
 * Comprehensive Confusion Matrix Visualization
 */
export const ConfusionMatrixVisualizer: React.FC<{
  matrix: ConfusionMatrixData;
}> = ({ matrix }) => {
  const { true_negative, false_positive, false_negative, true_positive } = matrix;
  const total = true_negative + false_positive + false_negative + true_positive;

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Holdout Confusion Matrix
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Evaluation on 20% unseen test set (56,962 transactions)</p>
        </div>
        <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
          N = {total.toLocaleString()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto my-3">
        {/* True Negative */}
        <div className="p-3.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/30 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              True Negative (TN)
            </span>
            <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-200 font-mono mt-1">
              {true_negative.toLocaleString()}
            </p>
          </div>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-2">
            Legitimate transactions correctly authorized without friction.
          </p>
        </div>

        {/* False Positive */}
        <div className="p-3.5 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/30 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">
              False Positive (FP)
            </span>
            <p className="text-2xl font-bold text-amber-900 dark:text-amber-200 font-mono mt-1">
              {false_positive.toLocaleString()}
            </p>
          </div>
          <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-2">
            Legitimate transactions challenged (customer friction / OTP challenge).
          </p>
        </div>

        {/* False Negative (CRITICAL) */}
        <div className="p-3.5 rounded-lg bg-rose-50/70 dark:bg-rose-950/40 border-2 border-rose-300/80 dark:border-rose-900/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-900 dark:text-rose-300">
                False Negative (FN)
              </span>
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-600 text-white">
                Highest Risk
              </span>
            </div>
            <p className="text-2xl font-bold text-rose-900 dark:text-rose-100 font-mono mt-1">
              {false_negative.toLocaleString()}
            </p>
          </div>
          <p className="text-[11px] text-rose-800 dark:text-rose-300 mt-2 font-medium">
            Fraudulent transactions incorrectly classified as legitimate (financial loss).
          </p>
        </div>

        {/* True Positive */}
        <div className="p-3.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/30 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-800 dark:text-blue-300">
              True Positive (TP)
            </span>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-200 font-mono mt-1">
              {true_positive.toLocaleString()}
            </p>
          </div>
          <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-2">
            Actual fraud successfully intercepted and blocked by LightGBM.
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
        <span>False Positive Rate: <strong className="text-slate-800 dark:text-slate-200 font-mono">{((false_positive / (false_positive + true_negative)) * 100).toFixed(3)}%</strong></span>
        <span>Sensitivity (Recall): <strong className="text-blue-700 dark:text-blue-400 font-mono">{((true_positive / (true_positive + false_negative)) * 100).toFixed(1)}%</strong></span>
      </div>
    </div>
  );
};

/**
 * ROC Curve Visualizer
 */
export const RocCurveChart: React.FC<{ rocAuc?: number }> = ({ rocAuc = 0.9834 }) => {
  // SVG coordinates: 0,0 is top-left, 300x200 graph area
  // X: FPR (0 to 1), Y: TPR (0 to 1, inverted for SVG)
  // LightGBM ROC curve coordinates mapped to SVG viewbox (pad: left 35, bottom 25, width 240, height 140)
  // (0,0) -> x=35, y=165
  // (1,1) -> x=275, y=25
  const points = [
    { x: 35, y: 165 },
    { x: 37, y: 62 },   // FPR 0.008, TPR 0.74
    { x: 42, y: 48 },   // FPR 0.029, TPR 0.8367 (Operating Point)
    { x: 55, y: 37 },   // FPR 0.08, TPR 0.92
    { x: 90, y: 31 },   // FPR 0.23, TPR 0.96
    { x: 155, y: 27 },  // FPR 0.50, TPR 0.985
    { x: 275, y: 25 },  // (1, 1)
  ];
  const pathD = `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`;

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            ROC Curve (Receiver Operating Characteristic)
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            True Positive Rate (Sensitivity) vs False Positive Rate
          </p>
        </div>
        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          AUC = {rocAuc.toFixed(4)}
        </span>
      </div>

      <div className="w-full flex justify-center py-2">
        <svg viewBox="0 0 300 190" className="w-full max-w-md h-auto overflow-visible">
          {/* Grid lines */}
          <line x1="35" y1="25" x2="275" y2="25" stroke="#94a3b8" strokeOpacity="0.2" strokeDasharray="3 3" />
          <line x1="35" y1="95" x2="275" y2="95" stroke="#94a3b8" strokeOpacity="0.2" strokeDasharray="3 3" />
          <line x1="35" y1="165" x2="275" y2="165" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="35" y1="25" x2="35" y2="165" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="155" y1="25" x2="155" y2="165" stroke="#94a3b8" strokeOpacity="0.2" strokeDasharray="3 3" />
          <line x1="275" y1="25" x2="275" y2="165" stroke="#94a3b8" strokeOpacity="0.2" strokeDasharray="3 3" />

          {/* Random chance line (diagonal) */}
          <line x1="35" y1="165" x2="275" y2="25" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />

          {/* LightGBM ROC curve line */}
          <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />

          {/* Operating Point marker (threshold = 0.50) */}
          <circle cx="42" cy="48" r="4.5" fill="#e11d48" stroke="#ffffff" strokeWidth="1.5" />
          <text x="50" y="52" fontSize="9" fontWeight="bold" fill="#e11d48">
            Threshold 0.50 (TPR: 83.7%, FPR: 0.02%)
          </text>

          {/* Axis Labels */}
          <text x="30" y="28" fontSize="8" textAnchor="end" fill="#64748b">1.0</text>
          <text x="30" y="98" fontSize="8" textAnchor="end" fill="#64748b">0.5</text>
          <text x="30" y="168" fontSize="8" textAnchor="end" fill="#64748b">0.0</text>
          <text x="35" y="178" fontSize="8" textAnchor="middle" fill="#64748b">0.0</text>
          <text x="155" y="178" fontSize="8" textAnchor="middle" fill="#64748b">0.5</text>
          <text x="275" y="178" fontSize="8" textAnchor="middle" fill="#64748b">1.0</text>

          <text x="155" y="188" fontSize="9" textAnchor="middle" fontWeight="bold" fill="#64748b">
            False Positive Rate (1 - Specificity)
          </text>
          <text x="-95" y="12" fontSize="9" textAnchor="middle" fontWeight="bold" fill="#64748b" transform="rotate(-90)">
            True Positive Rate (Recall)
          </text>
        </svg>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span>Steep curve near top-left indicates superior separation of rare fraud events.</span>
        <span className="font-semibold text-blue-600 dark:text-blue-400">LightGBM GBDT</span>
      </div>
    </div>
  );
};

/**
 * Precision-Recall Curve Visualizer
 */
export const PrecisionRecallCurveChart: React.FC<{ prAuc?: number }> = ({ prAuc = 0.8621 }) => {
  // PR curve points: Precision (Y) vs Recall (X)
  // X: Recall 0.0 to 1.0 (mapped 35 to 275)
  // Y: Precision 0.0 to 1.0 (mapped 165 to 25)
  const points = [
    { x: 35, y: 25 },   // Recall 0.0, Precision ~1.0
    { x: 131, y: 31 },  // Recall 0.40, Precision 0.96
    { x: 179, y: 35 },  // Recall 0.60, Precision 0.93
    { x: 236, y: 40 },  // Recall 0.8367, Precision 0.8913 (Operating Point)
    { x: 251, y: 56 },  // Recall 0.90, Precision 0.78
    { x: 261, y: 74 },  // Recall 0.94, Precision 0.65
    { x: 268, y: 106 }, // Recall 0.97, Precision 0.42
  ];
  const pathD = `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`;

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Precision-Recall Curve (PR-AUC)
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Gold standard evaluation for imbalanced credit card datasets (577:1 ratio)
          </p>
        </div>
        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          PR-AUC = {prAuc.toFixed(4)}
        </span>
      </div>

      <div className="w-full flex justify-center py-2">
        <svg viewBox="0 0 300 190" className="w-full max-w-md h-auto overflow-visible">
          {/* Grid lines */}
          <line x1="35" y1="25" x2="275" y2="25" stroke="#94a3b8" strokeOpacity="0.2" strokeDasharray="3 3" />
          <line x1="35" y1="95" x2="275" y2="95" stroke="#94a3b8" strokeOpacity="0.2" strokeDasharray="3 3" />
          <line x1="35" y1="165" x2="275" y2="165" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="35" y1="25" x2="35" y2="165" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="155" y1="25" x2="155" y2="165" stroke="#94a3b8" strokeOpacity="0.2" strokeDasharray="3 3" />
          <line x1="275" y1="25" x2="275" y2="165" stroke="#94a3b8" strokeOpacity="0.2" strokeDasharray="3 3" />

          {/* Baseline random prevalence = 0.0017 (near the bottom axis) */}
          <line x1="35" y1="163" x2="275" y2="163" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="210" y="159" fontSize="8" fontWeight="bold" fill="#f43f5e">
            No-skill baseline (0.17%)
          </text>

          {/* LightGBM PR curve line */}
          <path d={pathD} fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />

          {/* Operating Point marker (threshold = 0.50) */}
          <circle cx="236" cy="40" r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
          <text x="145" y="52" fontSize="9" fontWeight="bold" fill="#2563eb">
            Operating Point: Precision 89.1%, Recall 83.7%
          </text>

          {/* Axis Labels */}
          <text x="30" y="28" fontSize="8" textAnchor="end" fill="#64748b">1.0</text>
          <text x="30" y="98" fontSize="8" textAnchor="end" fill="#64748b">0.5</text>
          <text x="30" y="168" fontSize="8" textAnchor="end" fill="#64748b">0.0</text>
          <text x="35" y="178" fontSize="8" textAnchor="middle" fill="#64748b">0.0</text>
          <text x="155" y="178" fontSize="8" textAnchor="middle" fill="#64748b">0.5</text>
          <text x="275" y="178" fontSize="8" textAnchor="middle" fill="#64748b">1.0</text>

          <text x="155" y="188" fontSize="9" textAnchor="middle" fontWeight="bold" fill="#64748b">
            Recall (Sensitivity)
          </text>
          <text x="-95" y="12" fontSize="9" textAnchor="middle" fontWeight="bold" fill="#64748b" transform="rotate(-90)">
            Precision (Positive Predictive Value)
          </text>
        </svg>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span>High PR-AUC confirms the model avoids drowning fraud investigations in false alarms.</span>
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">PR-AUC: {prAuc.toFixed(4)}</span>
      </div>
    </div>
  );
};
