import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, ArrowRight, Activity } from 'lucide-react';

interface RiskDistributionCardProps {
  distribution: {
    low: number;
    medium: number;
    high: number;
    lowPct: number;
    medPct: number;
    highPct: number;
  };
  totalCount: number;
  onNavigateToDetect?: () => void;
}

export const RiskDistributionCard: React.FC<RiskDistributionCardProps> = ({
  distribution,
  totalCount,
  onNavigateToDetect,
}) => {
  const { low, medium, high, lowPct, medPct, highPct } = distribution;

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition-colors">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Risk Tier Distribution
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Automated classification routing &bull; N = {totalCount.toLocaleString()}
            </p>
          </div>
          <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
            Multi-Tier Policy
          </span>
        </div>

        {/* Segmented Visual Proportion Bar */}
        <div className="space-y-1.5 mb-4">
          <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden p-0.5 gap-0.5">
            {lowPct > 0 && (
              <div
                style={{ width: `${Math.max(lowPct > 0 ? 3 : 0, lowPct)}%` }}
                className="bg-emerald-500 rounded-l-full transition-all"
                title={`Low Risk: ${lowPct.toFixed(2)}%`}
              />
            )}
            {medPct > 0 && (
              <div
                style={{ width: `${Math.max(medPct > 0 ? 3 : 0, medPct)}%` }}
                className="bg-amber-500 transition-all"
                title={`Medium Risk: ${medPct.toFixed(2)}%`}
              />
            )}
            {highPct > 0 && (
              <div
                style={{ width: `${Math.max(highPct > 0 ? 3 : 0, highPct)}%` }}
                className="bg-rose-500 rounded-r-full transition-all"
                title={`High Risk: ${highPct.toFixed(2)}%`}
              />
            )}
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-0.5 font-mono">
            <span>Low: {lowPct.toFixed(1)}%</span>
            <span>Medium: {medPct.toFixed(1)}%</span>
            <span>High: {highPct.toFixed(1)}%</span>
          </div>
        </div>

        {/* 3 Tier Cards */}
        <div className="space-y-2.5">
          {/* Low Risk */}
          <div className="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/30">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-950 dark:text-emerald-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Low Risk (&lt; 30%)</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-emerald-800 dark:text-emerald-300 font-bold">
                  {low.toLocaleString()}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-semibold uppercase">
                  Auto-Approve
                </span>
              </div>
            </div>
            <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400 mt-1">
              Frictionless authorization for routine, normal-deviation transactions.
            </p>
          </div>

          {/* Medium Risk */}
          <div className="p-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/30">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-950 dark:text-amber-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Medium Risk (30% – 70%)</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-amber-800 dark:text-amber-300 font-bold">
                  {medium.toLocaleString()}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-semibold uppercase">
                  Step-Up 2FA
                </span>
              </div>
            </div>
            <p className="text-[11px] text-amber-800/80 dark:text-amber-400 mt-1">
              Challenges transaction with secondary SMS or biometric verification.
            </p>
          </div>

          {/* High Risk */}
          <div className="p-2.5 rounded-lg bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/30">
            <div className="flex items-center justify-between text-xs font-semibold text-rose-950 dark:text-rose-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>High Risk (&ge; 70%)</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-rose-800 dark:text-rose-300 font-bold">
                  {high.toLocaleString()}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-semibold uppercase">
                  Block &amp; Intercept
                </span>
              </div>
            </div>
            <p className="text-[11px] text-rose-800/80 dark:text-rose-400 mt-1">
              Immediate payment decline and operational SOC security dispatch.
            </p>
          </div>
        </div>
      </div>

      {onNavigateToDetect && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <button
            onClick={onNavigateToDetect}
            className="w-full py-2 px-3 rounded-lg bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Run Transaction Evaluation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
