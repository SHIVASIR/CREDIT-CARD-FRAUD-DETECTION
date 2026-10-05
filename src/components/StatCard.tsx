import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  id?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  badge?: string;
  variant?: 'default' | 'danger' | 'success' | 'warning';
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  badge,
  variant = 'default',
}) => {
  const variantStyles = {
    default: {
      border: 'border-slate-200/80 dark:border-slate-800/80',
      bgIcon: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
      valueColor: 'text-slate-900 dark:text-slate-100',
    },
    danger: {
      border: 'border-rose-200/70 dark:border-rose-900/40 bg-rose-50/10 dark:bg-rose-950/10',
      bgIcon: 'bg-rose-100/80 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
      valueColor: 'text-rose-600 dark:text-rose-400',
    },
    success: {
      border: 'border-emerald-200/70 dark:border-emerald-900/40 bg-emerald-50/10 dark:bg-emerald-950/10',
      bgIcon: 'bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
      valueColor: 'text-emerald-600 dark:text-emerald-400',
    },
    warning: {
      border: 'border-amber-200/70 dark:border-amber-900/40 bg-amber-50/10 dark:bg-amber-950/10',
      bgIcon: 'bg-amber-100/80 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
      valueColor: 'text-amber-600 dark:text-amber-400',
    },
  };

  const current = variantStyles[variant];

  return (
    <div
      id={id}
      className={`p-5 rounded-xl bg-white dark:bg-slate-900 border ${current.border} shadow-xs hover:shadow-sm transition-all flex flex-col justify-between`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${current.bgIcon}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className={`text-2xl sm:text-3xl font-bold tracking-tight font-sans ${current.valueColor}`}>
            {value}
          </span>
          {trend && (
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {trend}
            </span>
          )}
        </div>
      </div>

      {(subtitle || badge) && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="truncate pr-2">{subtitle}</span>
          {badge && (
            <span className="text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 whitespace-nowrap">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
