import React from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Cpu,
  Clock,
  CreditCard,
  ArrowUpRight,
  Copy,
  Check,
  FileSpreadsheet,
  Zap,
  Tag,
} from 'lucide-react';
import { PredictionResult } from '../types';

interface TransactionDetailModalProps {
  transaction: PredictionResult | null;
  onClose: () => void;
  onNavigateToHistory?: () => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
  onNavigateToHistory,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!transaction) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(transaction.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isFraud = transaction.prediction === 'Fraudulent';
  const isHighRisk = transaction.risk_level === 'High';
  const isBatch = transaction.source === 'Batch' || transaction.id.includes('BCH');
  const sourceLabel = transaction.source || (isBatch ? 'Batch' : 'Single');
  const modelVer = transaction.model_version || 'v1.2';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isHighRisk 
                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400' 
                : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
            }`}>
              {isHighRisk ? <ShieldAlert className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Transaction Audit Inspector
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.2 rounded border ${
                  isFraud
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                }`}>
                  {transaction.prediction}
                </span>
                <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.2 rounded border ${
                  isBatch
                    ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                    : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                }`}>
                  {isBatch ? <FileSpreadsheet className="w-2.5 h-2.5" /> : <Zap className="w-2.5 h-2.5" />}
                  <span>{sourceLabel}</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono tracking-tight">
                  {transaction.id}
                </h3>
                <button
                  onClick={handleCopyId}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
                  title="Copy Transaction ID"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Top 4 Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
              <span className="text-slate-400 dark:text-slate-500 text-[10px] font-medium uppercase tracking-wider block">
                Amount
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
                ₹{transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
              <span className="text-slate-400 dark:text-slate-500 text-[10px] font-medium uppercase tracking-wider block">
                Fraud Probability
              </span>
              <p className={`text-sm font-bold font-mono mt-0.5 ${
                transaction.fraud_probability >= 0.70
                  ? 'text-rose-600 dark:text-rose-400'
                  : transaction.fraud_probability >= 0.30
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {(transaction.fraud_probability * 100).toFixed(1)}%
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
              <span className="text-slate-400 dark:text-slate-500 text-[10px] font-medium uppercase tracking-wider block">
                Risk Tier
              </span>
              <p className={`text-sm font-bold mt-0.5 ${
                transaction.risk_level === 'High'
                  ? 'text-rose-600 dark:text-rose-400'
                  : transaction.risk_level === 'Medium'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {transaction.risk_level} Risk
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
              <span className="text-slate-400 dark:text-slate-500 text-[10px] font-medium uppercase tracking-wider block">
                Decision Action
              </span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                {transaction.risk_level === 'High'
                  ? 'Block & Intercept'
                  : transaction.risk_level === 'Medium'
                  ? 'Step-Up 2FA'
                  : 'Auto-Approved'}
              </p>
            </div>
          </div>

          {/* Timestamp & Timing Meta */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Timestamp:</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">
                {new Date(transaction.timestamp).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-500">
              Time offset: {transaction.time !== undefined ? `${transaction.time}s` : 'N/A'}
            </div>
          </div>

          {/* Contributing Feature Drivers (SHAP / Tree Interpretability) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Contributing Factor Attribution (SHAP / Trees)
              </span>
              <span className="text-[10px] text-slate-400">LightGBM feature contributions</span>
            </div>

            <div className="space-y-2">
              {transaction.model_insights && transaction.model_insights.length > 0 ? (
                transaction.model_insights.map((ins, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                          {ins.factor}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                            ins.severity === 'High'
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                              : ins.severity === 'Medium'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {ins.severity} Severity
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mt-1 text-[11px] leading-relaxed">
                        {ins.description}
                      </p>
                    </div>

                    {ins.value !== undefined && (
                      <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                        {typeof ins.value === 'number' ? ins.value.toFixed(2) : ins.value}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-slate-500 text-center">
                  Standard baseline distribution. No abnormal feature deviations triggered.
                </div>
              )}
            </div>
          </div>

          {/* Model Architecture & Audit Footprint */}
          <div className="p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 text-[11px] text-blue-900 dark:text-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>
                Engine: <strong>{transaction.model_name || 'LightGBM Classifier'}</strong> &bull; Version:{' '}
                <strong className="font-mono">{modelVer}</strong> &bull; Mode: <strong>{transaction.mode}</strong>
              </span>
            </div>
            <span className="text-[10px] font-mono text-blue-700 dark:text-blue-300">
              Cutoff Threshold: {transaction.threshold_used ?? 0.50}
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850 flex items-center justify-between">
          {onNavigateToHistory ? (
            <button
              onClick={() => {
                onClose();
                onNavigateToHistory();
              }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View in Full Audit Log</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
