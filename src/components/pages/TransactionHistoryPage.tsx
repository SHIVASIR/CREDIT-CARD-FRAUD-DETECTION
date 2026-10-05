import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Info,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  X,
  Clock,
  CreditCard,
  RefreshCw,
  Database,
  Zap,
  Tag,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { PredictionResult, RiskLevel, PredictionStatus, TransactionSource } from '../../types';
import { TransactionDetailModal } from '../TransactionDetailModal';

interface TransactionHistoryPageProps {
  history: PredictionResult[];
  onClearHistory: () => Promise<void>;
  onAnalyzeNew: () => void;
  onRefreshHistory?: () => Promise<void>;
  initialSearchQuery?: string;
}

type FilterCategory = 'ALL' | 'FRAUD' | 'LEGIT' | 'HIGH' | 'MED' | 'LOW';
type SourceFilterCategory = 'ALL' | 'SINGLE' | 'BATCH';
type SortField = 'timestamp' | 'amount' | 'probability' | 'id';
type SortOrder = 'desc' | 'asc';

export const TransactionHistoryPage: React.FC<TransactionHistoryPageProps> = ({
  history,
  onClearHistory,
  onAnalyzeNew,
  onRefreshHistory,
  initialSearchQuery = '',
}) => {
  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [filterType, setFilterType] = useState<FilterCategory>('ALL');
  const [sourceFilter, setSourceFilter] = useState<SourceFilterCategory>('ALL');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // React to initialSearchQuery changes from navigation
  React.useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
      setFilterType('ALL');
      setSourceFilter('ALL');
      setCurrentPage(1);
    }
  }, [initialSearchQuery]);

  // Pagination States
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal & Interactive States
  const [selectedTxn, setSelectedTxn] = useState<PredictionResult | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Handle Refresh from disk storage
  const handleRefresh = async () => {
    if (!onRefreshHistory) return;
    setIsRefreshing(true);
    try {
      await onRefreshHistory();
    } finally {
      setTimeout(() => setIsRefreshing(false), 350);
    }
  };

  // Handle Clear History Execution
  const handleExecuteClear = async () => {
    setIsClearing(true);
    try {
      await onClearHistory();
      setIsConfirmingClear(false);
      setCurrentPage(1);
    } finally {
      setIsClearing(false);
    }
  };

  // Filter Logic
  const filtered = useMemo(() => {
    return history.filter((item) => {
      // 1. Text Search across ID, Amount, Prediction, Risk, Model Version, and Source
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const itemSource = (item.source || (item.id.includes('BCH') ? 'Batch' : 'Single')).toLowerCase();
        const itemModelVer = (item.model_version || 'v1.2').toLowerCase();
        const matchesId = item.id.toLowerCase().includes(q);
        const matchesAmount = item.amount.toString().includes(q);
        const matchesPrediction = item.prediction.toLowerCase().includes(q);
        const matchesRisk = item.risk_level.toLowerCase().includes(q);
        const matchesSource = itemSource.includes(q);
        const matchesModel = itemModelVer.includes(q);
        const matchesInsights = item.model_insights?.some(
          (ins) => ins.factor.toLowerCase().includes(q) || ins.description.toLowerCase().includes(q)
        );

        if (!matchesId && !matchesAmount && !matchesPrediction && !matchesRisk && !matchesSource && !matchesModel && !matchesInsights) {
          return false;
        }
      }

      // 2. Primary Status & Risk Filter
      if (filterType === 'FRAUD' && item.prediction !== 'Fraudulent') return false;
      if (filterType === 'LEGIT' && item.prediction !== 'Legitimate') return false;
      if (filterType === 'HIGH' && item.risk_level !== 'High') return false;
      if (filterType === 'MED' && item.risk_level !== 'Medium') return false;
      if (filterType === 'LOW' && item.risk_level !== 'Low') return false;

      // 3. Source Filter
      const actualSource: TransactionSource = item.source || (item.id.includes('BCH') ? 'Batch' : 'Single');
      if (sourceFilter === 'SINGLE' && actualSource !== 'Single') return false;
      if (sourceFilter === 'BATCH' && actualSource !== 'Batch') return false;

      return true;
    });
  }, [history, searchQuery, filterType, sourceFilter]);

  // Sort Logic
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let diff = 0;
      if (sortField === 'timestamp') {
        diff = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else if (sortField === 'amount') {
        diff = b.amount - a.amount;
      } else if (sortField === 'probability') {
        diff = b.fraud_probability - a.fraud_probability;
      } else if (sortField === 'id') {
        diff = a.id.localeCompare(b.id);
      }
      return sortOrder === 'desc' ? diff : -diff;
    });
  }, [filtered, sortField, sortOrder]);

  // Pagination Calculations
  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedItems = useMemo(() => {
    return sorted.slice(startIndex, endIndex);
  }, [sorted, startIndex, endIndex]);

  // Reset page when filters or search change
  const handleFilterChange = (type: FilterCategory) => {
    setFilterType(type);
    setCurrentPage(1);
  };

  const handleSourceFilterChange = (source: SourceFilterCategory) => {
    setSourceFilter(source);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  // Export CSV with all 8 specified metadata fields
  const exportCSV = () => {
    if (sorted.length === 0) return;
    const headers = [
      'Transaction ID',
      'Timestamp',
      'Amount (INR)',
      'Prediction',
      'Fraud Probability (%)',
      'Risk Level',
      'Model Version',
      'Source',
    ];

    const rows = sorted.map((item) => {
      const src = item.source || (item.id.includes('BCH') ? 'Batch' : 'Single');
      const ver = item.model_version || 'v1.2';
      return [
        `"${item.id}"`,
        `"${new Date(item.timestamp).toISOString()}"`,
        item.amount,
        `"${item.prediction}"`,
        (item.fraud_probability * 100).toFixed(2),
        `"${item.risk_level}"`,
        `"${ver}"`,
        `"${src}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fraudshield_transaction_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // High-level summary metrics
  const totalFraudCount = history.filter((i) => i.prediction === 'Fraudulent').length;
  const totalLegitCount = history.filter((i) => i.prediction === 'Legitimate').length;
  const totalBatchCount = history.filter((i) => (i.source || (i.id.includes('BCH') ? 'Batch' : 'Single')) === 'Batch').length;
  const totalSingleCount = history.length - totalBatchCount;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Storage Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight font-sans">
              Transaction History
            </h1>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <Database className="w-3 h-3" />
              <span>Persistent Storage (data/transactions.json)</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Audit ledger of real-time and batch transaction evaluations. Complete with model versioning, probability scores, and feature attribution traces.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {onRefreshHistory && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              title="Reload transactions from server disk database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          )}

          <button
            onClick={exportCSV}
            disabled={history.length === 0}
            className="px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            title="Download full filtered history as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsConfirmingClear(true)}
            disabled={history.length === 0}
            className="px-3 py-1.5 rounded-lg border border-rose-200/80 dark:border-rose-900/60 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            title="Clear all stored transactions"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
            Total Audited
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {history.length.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">records</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400 block">
            Fraudulent Intercepted
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {totalFraudCount.toLocaleString()}
            </span>
            <span className="text-[11px] text-rose-500/80 font-medium">
              ({history.length > 0 ? ((totalFraudCount / history.length) * 100).toFixed(1) : 0}%)
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400 block">
            Legitimate Cleared
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {totalLegitCount.toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-500/80 font-medium">
              ({history.length > 0 ? ((totalLegitCount / history.length) * 100).toFixed(1) : 0}%)
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
            Source Provenance
          </span>
          <div className="flex items-center gap-2 mt-1.5 text-xs font-semibold">
            <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <Zap className="w-3 h-3" />
              {totalSingleCount} Single
            </span>
            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            <span className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400">
              <FileSpreadsheet className="w-3 h-3" />
              {totalBatchCount} Batch
            </span>
          </div>
        </div>
      </div>

      {/* Filter, Search & Sorting Controls */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3.5 transition-colors">
        {/* Top Controls: Search + Sort Field + Order + Page Size */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="input-search-history"
              type="text"
              placeholder="Search by Transaction ID, amount, decision, risk, or insights..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-8.5 pr-8 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Sort by:</span>
            <select
              id="select-sort-history"
              value={sortField}
              onChange={(e) => {
                setSortField(e.target.value as SortField);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="timestamp">Timestamp (Recency)</option>
              <option value="amount">Amount</option>
              <option value="probability">Fraud Probability</option>
              <option value="id">Transaction ID</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer flex items-center gap-1 text-xs font-medium"
              title="Toggle Sort Direction"
            >
              {sortOrder === 'desc' ? (
                <>
                  <ArrowDown className="w-3 h-3 text-blue-600" />
                  <span>Desc</span>
                </>
              ) : (
                <>
                  <ArrowUp className="w-3 h-3 text-blue-600" />
                  <span>Asc</span>
                </>
              )}
            </button>

            {/* Page Size Selector */}
            <div className="flex items-center gap-1 ml-1 pl-2 border-l border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Show:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
          {/* Classification & Risk Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mr-1 font-medium flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>Status:</span>
            </span>
            {(
              [
                { id: 'ALL', label: `All (${history.length})` },
                { id: 'FRAUD', label: 'Fraudulent' },
                { id: 'LEGIT', label: 'Legitimate' },
                { id: 'HIGH', label: 'High Risk' },
                { id: 'MED', label: 'Medium Risk' },
                { id: 'LOW', label: 'Low Risk' },
              ] as const
            ).map((pill) => (
              <button
                key={pill.id}
                onClick={() => handleFilterChange(pill.id)}
                className={`text-xs px-2.5 py-0.5 rounded-md font-medium transition-all cursor-pointer ${
                  filterType === pill.id
                    ? 'bg-slate-900 dark:bg-blue-600 text-white font-semibold shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Source Filters (Single vs Batch) */}
          <div className="flex items-center gap-1.5 self-start sm:self-center">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mr-1 font-medium">
              Source:
            </span>
            {(
              [
                { id: 'ALL', label: 'All Sources' },
                { id: 'SINGLE', label: 'Single', icon: Zap },
                { id: 'BATCH', label: 'Batch', icon: FileSpreadsheet },
              ] as const
            ).map((pill) => {
              const Icon = 'icon' in pill ? pill.icon : null;
              return (
                <button
                  key={pill.id}
                  onClick={() => handleSourceFilterChange(pill.id)}
                  className={`text-xs px-2 py-0.5 rounded-md font-medium transition-all inline-flex items-center gap-1 cursor-pointer ${
                    sourceFilter === pill.id
                      ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {Icon && <Icon className="w-2.5 h-2.5" />}
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transaction Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden transition-colors">
        {sorted.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CreditCard className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              No Transactions Found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              No stored transaction matches the current filters or query. Try resetting filters or analyzing a new transaction.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              {(searchQuery || filterType !== 'ALL' || sourceFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('ALL');
                    setSourceFilter('ALL');
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
              <button
                onClick={onAnalyzeNew}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 cursor-pointer shadow-xs"
              >
                Analyze New Transaction
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider select-none">
                <tr>
                  <th
                    className="px-4 py-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Transaction ID</span>
                      {sortField === 'id' && (sortOrder === 'desc' ? <ArrowDown className="w-3 h-3 text-blue-600" /> : <ArrowUp className="w-3 h-3 text-blue-600" />)}
                    </div>
                  </th>
                  <th
                    className="px-3 py-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                    onClick={() => handleSort('timestamp')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Timestamp</span>
                      {sortField === 'timestamp' && (sortOrder === 'desc' ? <ArrowDown className="w-3 h-3 text-blue-600" /> : <ArrowUp className="w-3 h-3 text-blue-600" />)}
                    </div>
                  </th>
                  <th
                    className="px-3 py-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Amount</span>
                      {sortField === 'amount' && (sortOrder === 'desc' ? <ArrowDown className="w-3 h-3 text-blue-600" /> : <ArrowUp className="w-3 h-3 text-blue-600" />)}
                    </div>
                  </th>
                  <th className="px-3 py-3">Prediction</th>
                  <th
                    className="px-3 py-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                    onClick={() => handleSort('probability')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Fraud Probability</span>
                      {sortField === 'probability' && (sortOrder === 'desc' ? <ArrowDown className="w-3 h-3 text-blue-600" /> : <ArrowUp className="w-3 h-3 text-blue-600" />)}
                    </div>
                  </th>
                  <th className="px-3 py-3">Risk Level</th>
                  <th className="px-3 py-3">Model Version</th>
                  <th className="px-3 py-3">Source</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                {paginatedItems.map((item) => {
                  const isBatch = item.source === 'Batch' || item.id.includes('BCH');
                  const source = item.source || (isBatch ? 'Batch' : 'Single');
                  const modelVersion = item.model_version || 'v1.2';
                  const isFraud = item.prediction === 'Fraudulent';

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedTxn(item)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      {/* Transaction ID */}
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100 font-mono text-[11px] whitespace-nowrap">
                        <span className="hover:underline text-blue-600 dark:text-blue-400">
                          {item.id}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="px-3 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>
                            {new Date(item.timestamp).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-3 py-3 text-right font-bold text-slate-900 dark:text-slate-100 font-mono whitespace-nowrap">
                        ₹{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      {/* Prediction */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            isFraud
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          }`}
                        >
                          {isFraud ? (
                            <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          )}
                          <span>{item.prediction}</span>
                        </span>
                      </td>

                      {/* Fraud Probability */}
                      <td className="px-3 py-3 text-right font-mono font-bold text-[11px] whitespace-nowrap">
                        <span
                          className={
                            item.fraud_probability >= 0.7
                              ? 'text-rose-600 dark:text-rose-400'
                              : item.fraud_probability >= 0.3
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }
                        >
                          {(item.fraud_probability * 100).toFixed(1)}%
                        </span>
                      </td>

                      {/* Risk Level */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase ${
                            item.risk_level === 'High'
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                              : item.risk_level === 'Medium'
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          }`}
                        >
                          {item.risk_level}
                        </span>
                      </td>

                      {/* Model Version */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
                          {modelVersion}
                        </span>
                      </td>

                      {/* Source */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border ${
                            source === 'Batch'
                              ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                              : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                          }`}
                        >
                          {source === 'Batch' ? (
                            <FileSpreadsheet className="w-2.5 h-2.5 shrink-0" />
                          ) : (
                            <Zap className="w-2.5 h-2.5 shrink-0" />
                          )}
                          <span>{source}</span>
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTxn(item);
                          }}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold inline-flex items-center gap-0.5 cursor-pointer"
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

        {/* Pagination Bar */}
        {sorted.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div>
              Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{startIndex + 1}</span> to{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">{endIndex}</span> of{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">{totalItems}</span> transactions
            </div>

            <div className="flex items-center gap-1.5">
              {/* First Page */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={safeCurrentPage <= 1}
                className="p-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="First Page"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>

              {/* Previous Page */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage <= 1}
                className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 text-xs"
              >
                <ChevronLeft className="w-3 h-3" />
                <span>Prev</span>
              </button>

              {/* Page Number Chips */}
              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 1)
                  .map((p, idx, arr) => {
                    const prevP = arr[idx - 1];
                    const showEllipsis = prevP && p - prevP > 1;

                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                        <button
                          onClick={() => setCurrentPage(p)}
                          className={`w-7 h-7 rounded text-xs font-semibold transition-colors cursor-pointer ${
                            safeCurrentPage === p
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              {/* Next Page */}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage >= totalPages}
                className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 text-xs"
              >
                <span>Next</span>
                <ChevronRight className="w-3 h-3" />
              </button>

              {/* Last Page */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={safeCurrentPage >= totalPages}
                className="p-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Last Page"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        transaction={selectedTxn}
        onClose={() => setSelectedTxn(null)}
      />

      {/* Clear Confirmation Modal */}
      {isConfirmingClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 animate-in zoom-in-95 duration-150 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Clear All Transaction History?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This will permanently delete all {history.length} stored records from persistent server storage (<code>data/transactions.json</code>). This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmingClear(false)}
                disabled={isClearing}
                className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteClear}
                disabled={isClearing}
                className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isClearing ? 'Clearing...' : 'Confirm Clear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
