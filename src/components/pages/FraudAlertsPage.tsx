import React, { useState, useMemo } from 'react';
import {
  Bell,
  ShieldAlert,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CheckCheck,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Eye,
  RefreshCw,
  FileSpreadsheet,
  Zap,
  Check,
  X,
  ChevronRight,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { FraudAlert, PredictionResult, AlertStatus } from '../../types';
import { TransactionDetailModal } from '../TransactionDetailModal';

interface FraudAlertsPageProps {
  alerts: FraudAlert[];
  history: PredictionResult[];
  onUpdateAlertStatus: (alertId: string, status: AlertStatus) => Promise<void>;
  onMarkAllReviewed: () => Promise<void>;
  onRefreshAlerts?: () => Promise<void>;
  onNavigateToHistoryTxn: (txnId: string) => void;
  onNavigateToDetect: () => void;
}

type FilterTab = 'ALL' | 'UNREAD' | 'HIGH' | 'REVIEWED' | 'UNRESOLVED';
type SortField = 'timestamp' | 'amount' | 'probability';

export const FraudAlertsPage: React.FC<FraudAlertsPageProps> = ({
  alerts,
  history,
  onUpdateAlertStatus,
  onMarkAllReviewed,
  onRefreshAlerts,
  onNavigateToHistoryTxn,
  onNavigateToDetect,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('UNREAD');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedTxn, setSelectedTxn] = useState<PredictionResult | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter logic
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      // 1. Text search
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesAlertId = alert.id.toLowerCase().includes(q);
        const matchesTxnId = alert.transaction_id.toLowerCase().includes(q);
        const matchesAmount = alert.amount.toString().includes(q);
        const matchesStatus = alert.status.toLowerCase().includes(q);
        if (!matchesAlertId && !matchesTxnId && !matchesAmount && !matchesStatus) {
          return false;
        }
      }

      // 2. Filter tabs
      if (activeFilter === 'UNREAD') {
        return alert.status === 'Unread';
      }
      if (activeFilter === 'HIGH') {
        return alert.risk_level === 'High';
      }
      if (activeFilter === 'REVIEWED') {
        return alert.status === 'Reviewed';
      }
      if (activeFilter === 'UNRESOLVED') {
        return alert.status === 'Unresolved' || alert.status === 'Unread';
      }

      return true; // 'ALL'
    });
  }, [alerts, searchQuery, activeFilter]);

  // Sort logic
  const sortedAlerts = useMemo(() => {
    return [...filteredAlerts].sort((a, b) => {
      let diff = 0;
      if (sortField === 'timestamp') {
        diff = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else if (sortField === 'amount') {
        diff = b.amount - a.amount;
      } else if (sortField === 'probability') {
        diff = b.fraud_probability - a.fraud_probability;
      }
      return sortOrder === 'desc' ? diff : -diff;
    });
  }, [filteredAlerts, sortField, sortOrder]);

  // Handle Mark All as Reviewed
  const handleMarkAll = async () => {
    setIsMarkingAll(true);
    try {
      await onMarkAllReviewed();
    } finally {
      setIsMarkingAll(false);
    }
  };

  // Handle Refresh
  const handleRefresh = async () => {
    if (!onRefreshAlerts) return;
    setIsRefreshing(true);
    try {
      await onRefreshAlerts();
    } finally {
      setTimeout(() => setIsRefreshing(false), 300);
    }
  };

  // Find linked transaction to view
  const handleInspectAlert = (alert: FraudAlert) => {
    const linkedTxn =
      alert.transaction ||
      history.find((t) => t.id === alert.transaction_id) || {
        id: alert.transaction_id,
        timestamp: alert.timestamp,
        amount: alert.amount,
        time: 0,
        prediction: 'Fraudulent',
        fraud_probability: alert.fraud_probability,
        risk_level: alert.risk_level,
        mode: 'DEMO',
        model_name: 'LightGBM Classifier (Kaggle ULB)',
        model_version: 'v1.2',
        source: alert.source || 'Single',
        threshold_used: 0.5,
        model_insights: [
          {
            factor: 'High-Risk Automated Alert Rule',
            description: `Transaction exceeded the high-risk supervisory cutoff threshold (${(alert.fraud_probability * 100).toFixed(1)}%).`,
            severity: 'High',
            value: `${(alert.fraud_probability * 100).toFixed(1)}%`,
          },
        ],
      };

    setSelectedTxn(linkedTxn);
  };

  // Metrics
  const totalCount = alerts.length;
  const unreadCount = alerts.filter((a) => a.status === 'Unread').length;
  const reviewedCount = alerts.filter((a) => a.status === 'Reviewed').length;
  const unresolvedCount = alerts.filter((a) => a.status === 'Unresolved').length;
  const totalExposure = alerts
    .filter((a) => a.status !== 'Reviewed')
    .reduce((sum, a) => sum + a.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight font-sans">
              Fraud Alerts Console
            </h1>
            {unreadCount > 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                <span>{unreadCount} Unread Alert{unreadCount === 1 ? '' : 's'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>All Alerts Reviewed</span>
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Supervisory alerts generated for high-risk transactions. Review potential anomalies, investigate feature deviations, and log review decisions.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onRefreshAlerts && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              title="Refresh alerts from database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>
          )}

          <button
            onClick={handleMarkAll}
            disabled={unreadCount === 0 && unresolvedCount === 0 || isMarkingAll}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            title="Mark all pending alerts as reviewed"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>{isMarkingAll ? 'Updating...' : 'Mark All as Reviewed'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
            Total High-Risk Alerts
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {totalCount.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">events</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400 block">
            Unread Notifications
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {unreadCount.toLocaleString()}
            </span>
            <span className="text-[11px] text-rose-500/80 font-medium">pending review</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400 block">
            Pending Exposure
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
              ₹{totalExposure.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400 block">
            Reviewed Ratio
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {totalCount > 0 ? Math.round((reviewedCount / totalCount) * 100) : 100}%
            </span>
            <span className="text-[11px] text-slate-500">
              ({reviewedCount}/{totalCount})
            </span>
          </div>
        </div>
      </div>

      {/* Warning Notice Banner (Professional, calm, non-alarmist) */}
      <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
        <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-amber-950 dark:text-amber-100">
            Supervisory Alert Criteria
          </p>
          <p className="text-amber-800 dark:text-amber-300/90 text-[11px] leading-relaxed">
            Alerts are automatically triggered whenever the LightGBM classifier scores a transaction above the high-risk threshold (70%+ probability). Reviewers should verify feature contributions, compare baseline merchant behavior, and mark alerts as reviewed after inspection.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="input-search-alerts"
              type="text"
              placeholder="Search by Alert ID, Transaction ID, amount, or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-8 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Sort:</span>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="timestamp">Timestamp (Recency)</option>
              <option value="amount">Amount</option>
              <option value="probability">Fraud Probability</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer flex items-center gap-1 text-xs font-medium"
              title="Toggle Sort Direction"
            >
              {sortOrder === 'desc' ? (
                <ArrowDown className="w-3 h-3 text-blue-600" />
              ) : (
                <ArrowUp className="w-3 h-3 text-blue-600" />
              )}
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 mr-1 font-medium flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Filter:</span>
          </span>

          {(
            [
              { id: 'UNREAD', label: 'Unread', count: unreadCount },
              { id: 'ALL', label: 'All', count: totalCount },
              { id: 'HIGH', label: 'High Risk', count: totalCount },
              { id: 'REVIEWED', label: 'Reviewed', count: reviewedCount },
              { id: 'UNRESOLVED', label: 'Unresolved', count: unreadCount + unresolvedCount },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-slate-900 dark:bg-blue-600 text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeFilter === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {sortedAlerts.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              No Alerts In This Category
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {activeFilter === 'UNREAD'
                ? 'All high-risk fraud alerts have been reviewed by the compliance team.'
                : 'No alerts match your active filter criteria.'}
            </p>
            {activeFilter !== 'ALL' && (
              <button
                onClick={() => setActiveFilter('ALL')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                View All Alerts
              </button>
            )}
          </div>
        ) : (
          sortedAlerts.map((alert) => {
            const isUnread = alert.status === 'Unread';
            const isReviewed = alert.status === 'Reviewed';
            const isBatch = alert.source === 'Batch' || alert.transaction_id.includes('BCH');

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl bg-white dark:bg-slate-900 border transition-all ${
                  isUnread
                    ? 'border-rose-300 dark:border-rose-900/70 shadow-xs ring-1 ring-rose-400/20'
                    : 'border-slate-200/80 dark:border-slate-800/80'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Left: Alert Identity & Badges */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                        {alert.id}
                      </span>

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase flex items-center gap-1 ${
                          isUnread
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                            : isReviewed
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                        {isReviewed && <Check className="w-2.5 h-2.5 text-emerald-600" />}
                        <span>{alert.status}</span>
                      </span>

                      {/* Risk Level Badge */}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800 uppercase flex items-center gap-1">
                        <ShieldAlert className="w-2.5 h-2.5 text-rose-600" />
                        <span>High Risk</span>
                      </span>

                      {/* Source */}
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded border flex items-center gap-1 ${
                          isBatch
                            ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                            : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                        }`}
                      >
                        {isBatch ? <FileSpreadsheet className="w-2.5 h-2.5" /> : <Zap className="w-2.5 h-2.5" />}
                        <span>{isBatch ? 'Batch' : 'Single'}</span>
                      </span>
                    </div>

                    {/* Transaction Reference & Timestamp */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400 dark:text-slate-500 font-medium">Transaction:</span>
                        <button
                          onClick={() => onNavigateToHistoryTxn(alert.transaction_id)}
                          className="font-mono font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                          title="View in Transaction Audit Log"
                        >
                          <span>{alert.transaction_id}</span>
                          <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                        </button>
                      </div>

                      <span className="text-slate-300 dark:text-slate-700">&bull;</span>

                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>
                          {new Date(alert.timestamp).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {alert.reviewed_at && (
                        <>
                          <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                            Reviewed {new Date(alert.reviewed_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Middle: Amount & Probability Score */}
                  <div className="flex items-center gap-6 py-2 lg:py-0 border-y lg:border-y-0 border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                        Amount
                      </span>
                      <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                        ₹{alert.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                        Fraud Probability
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-bold font-mono text-rose-600 dark:text-rose-400">
                          {(alert.fraud_probability * 100).toFixed(1)}%
                        </span>
                        <span className="text-[10px] text-rose-500 font-medium">Critical</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end lg:self-center flex-wrap">
                    <button
                      onClick={() => handleInspectAlert(alert)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>Inspect Details</span>
                    </button>

                    {isReviewed ? (
                      <button
                        onClick={() => onUpdateAlertStatus(alert.id, 'Unresolved')}
                        className="px-2.5 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                        title="Re-open as unresolved follow-up"
                      >
                        <HelpCircle className="w-3 h-3" />
                        <span>Mark Unresolved</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onUpdateAlertStatus(alert.id, 'Reviewed')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                        title="Confirm review of this security alert"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark as Reviewed</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        transaction={selectedTxn}
        onClose={() => setSelectedTxn(null)}
      />
    </div>
  );
};
