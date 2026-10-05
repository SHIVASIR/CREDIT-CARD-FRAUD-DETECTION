import React from 'react';
import { ShieldAlert, ShieldCheck, ChevronRight, AlertTriangle, ExternalLink, ArrowRight } from 'lucide-react';
import { PredictionResult } from '../types';

interface RecentHighRiskTableProps {
  transactions: PredictionResult[];
  onSelectTransaction: (txn: PredictionResult) => void;
  onNavigateToHistory?: () => void;
  onNavigateToDetect?: () => void;
  timeRangeLabel: string;
}

export const RecentHighRiskTable: React.FC<RecentHighRiskTableProps> = ({
  transactions,
  onSelectTransaction,
  onNavigateToHistory,
  onNavigateToDetect,
  timeRangeLabel,
}) => {
  // Format relative time helper
  const formatRelativeTime = (timestamp: string) => {
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden transition-colors">
      {/* Table Header */}
      <div className="p-4 sm:px-5 sm:py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Recent High-Risk Transactions
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
                P(Fraud) &ge; 70%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Flagged transactions requiring immediate SOC inspection &bull; Filtered for {timeRangeLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToHistory && (
            <button
              onClick={onNavigateToHistory}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Audit Log</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      {transactions.length === 0 ? (
        <div className="p-8 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Zero High-Risk Events in This Window
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            No transactions exceeded the 70% risk threshold during this observation period. Security posture is nominal.
          </p>
          {onNavigateToDetect && (
            <button
              onClick={onNavigateToDetect}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer shadow-xs"
            >
              <span>Evaluate a Transaction</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2.5">Transaction ID</th>
                <th className="px-3 py-2.5">Timestamp</th>
                <th className="px-3 py-2.5 text-right">Amount</th>
                <th className="px-3 py-2.5 text-right">Fraud Prob.</th>
                <th className="px-3 py-2.5">Risk Tier</th>
                <th className="px-4 py-2.5">Primary Threat Trigger</th>
                <th className="px-3 py-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
              {transactions.slice(0, 8).map((txn) => {
                const primaryInsight = txn.model_insights && txn.model_insights[0];
                return (
                  <tr
                    key={txn.id}
                    onClick={() => onSelectTransaction(txn)}
                    className="hover:bg-rose-50/30 dark:hover:bg-rose-950/10 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100 font-mono text-[11px] whitespace-nowrap">
                      {txn.id}
                    </td>

                    <td className="px-3 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px]">
                      <span title={new Date(txn.timestamp).toLocaleString()}>
                        {formatRelativeTime(txn.timestamp)}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-right font-bold text-slate-900 dark:text-slate-100 font-mono whitespace-nowrap">
                      ₹{txn.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-3 py-3 text-right font-mono font-bold whitespace-nowrap">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/60 text-[11px]">
                        {(txn.fraud_probability * 100).toFixed(1)}%
                      </span>
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 uppercase">
                        {txn.risk_level}
                      </span>
                    </td>

                    <td className="px-4 py-3 max-w-xs truncate text-[11px] text-slate-700 dark:text-slate-300">
                      {primaryInsight ? (
                        <span title={primaryInsight.description} className="flex items-center gap-1.5 truncate">
                          <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                            {primaryInsight.factor}
                          </span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">High anomaly score trigger</span>
                      )}
                    </td>

                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTransaction(txn);
                        }}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold inline-flex items-center gap-0.5 cursor-pointer px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
