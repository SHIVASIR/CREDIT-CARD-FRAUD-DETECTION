import React, { useState, useRef, useMemo } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Percent,
  Download,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  ArrowUpDown,
  ChevronRight,
  ChevronLeft,
  Info,
  Layers,
  ArrowRight,
  Eye,
  FileText,
  Clock,
  Sparkles,
  IndianRupee,
} from 'lucide-react';
import { AppConfig, PredictionResult, RiskLevel, PredictionStatus } from '../../types';
import { StatCard } from '../StatCard';
import { TransactionDetailModal } from '../TransactionDetailModal';
import {
  parseAndValidateTransactionsCSV,
  generateSampleTransactionsCSV,
  downloadCSV,
  ColumnValidationResult,
} from '../../utils/csvParser';
import { evaluateTransactionDemo } from '../../utils/mlEngine';

interface BatchDetectionPageProps {
  config: AppConfig;
  onBatchProcessed?: (results: PredictionResult[]) => void;
  onNavigateToDetect: () => void;
  onNavigateToHistory: () => void;
}

type Stage = 'UPLOAD' | 'PREVIEW' | 'PROCESSING' | 'RESULTS';

export const BatchDetectionPage: React.FC<BatchDetectionPageProps> = ({
  config,
  onBatchProcessed,
  onNavigateToDetect,
  onNavigateToHistory,
}) => {
  const [stage, setStage] = useState<Stage>('UPLOAD');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [validationResult, setValidationResult] = useState<ColumnValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);

  // Batch Results
  const [batchResults, setBatchResults] = useState<PredictionResult[]>([]);
  const [selectedTxn, setSelectedTxn] = useState<PredictionResult | null>(null);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<'ALL' | 'FRAUD' | 'LEGIT'>('ALL');
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'HIGH' | 'MED' | 'LOW'>('ALL');
  const [sortField, setSortField] = useState<'index' | 'amount' | 'prob'>('prob');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection from input or drag-and-drop
  const handleFile = (file: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please upload a valid .csv file.');
      return;
    }

    setFileName(file.name);
    setFileSize(`${(file.size / 1024).toFixed(1)} KB`);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const val = parseAndValidateTransactionsCSV(text);
      setValidationResult(val);
      setStage('PREVIEW');
    };
    reader.onerror = () => {
      alert('Failed to read the file. Please ensure it is an uncorrupted text CSV.');
    };
    reader.readAsText(file);
  };

  // Drag-and-drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // 1-Click Load Benchmark Sample Template
  const handleLoadBenchmarkSample = () => {
    const csvContent = generateSampleTransactionsCSV();
    setFileName('benchmark_sample_transactions.csv');
    setFileSize('3.4 KB');
    const val = parseAndValidateTransactionsCSV(csvContent);
    setValidationResult(val);
    setStage('PREVIEW');
  };

  // Download Sample Template CSV
  const handleDownloadSampleTemplate = () => {
    const sample = generateSampleTransactionsCSV();
    downloadCSV('fraudshield_sample_template.csv', sample);
  };

  // Execute Batch Analysis through LightGBM
  const handleRunBatchAnalysis = async () => {
    if (!validationResult || !validationResult.isValid || validationResult.parsedTransactions.length === 0) {
      return;
    }

    setStage('PROCESSING');
    setIsProcessing(true);
    setProcessProgress(10);

    const total = validationResult.parsedTransactions.length;
    const transactions = validationResult.parsedTransactions.map((tx, idx) => ({
      ...tx,
      id: validationResult.customIds[idx] || `TXN-BCH-${String(1001 + idx)}`,
    }));

    try {
      // Simulate stepped progress indicator for UX
      const progressTimer = setInterval(() => {
        setProcessProgress((prev) => (prev < 90 ? prev + 15 : prev));
      }, 120);

      // Call batch prediction API on full-stack server
      const res = await fetch('/api/predict-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions,
          syncToHistory: true,
        }),
      });

      clearInterval(progressTimer);
      setProcessProgress(100);

      if (res.ok) {
        const data = await res.json();
        setBatchResults(data.results || []);
        if (onBatchProcessed) {
          onBatchProcessed(data.results || []);
        }
      } else {
        // Fallback to client-side ML engine if server is offline
        const fallbackResults: PredictionResult[] = transactions.map((t, idx) => {
          const evalResult = evaluateTransactionDemo(
            t,
            config.decision_threshold,
            config.threshold_low,
            config.threshold_high
          );
          if (t.id) evalResult.id = t.id;
          evalResult.source = 'Batch';
          evalResult.model_version = 'v1.2';
          return evalResult;
        });
        setBatchResults(fallbackResults);
        if (onBatchProcessed) {
          onBatchProcessed(fallbackResults);
        }
      }

      setTimeout(() => {
        setIsProcessing(false);
        setStage('RESULTS');
      }, 300);
    } catch (err) {
      console.warn('Server batch error, executing client-side ML fallback:', err);
      // Client-side fallback scoring
      const fallbackResults: PredictionResult[] = transactions.map((t) => {
        const evalResult = evaluateTransactionDemo(
          t,
          config.decision_threshold,
          config.threshold_low,
          config.threshold_high
        );
        if (t.id) evalResult.id = t.id;
        evalResult.source = 'Batch';
        evalResult.model_version = 'v1.2';
        return evalResult;
      });
      setBatchResults(fallbackResults);
      if (onBatchProcessed) {
        onBatchProcessed(fallbackResults);
      }
      setIsProcessing(false);
      setStage('RESULTS');
    }
  };

  // Reset entire workflow to analyze another file
  const handleClearUpload = () => {
    setStage('UPLOAD');
    setFileName('');
    setFileSize('');
    setValidationResult(null);
    setBatchResults([]);
    setSelectedTxn(null);
    setCurrentPage(1);
    setSearchQuery('');
    setClassFilter('ALL');
    setRiskFilter('ALL');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Download Output Results CSV
  const handleDownloadResultsCSV = () => {
    if (batchResults.length === 0) return;

    const headers = [
      'Transaction_ID',
      'Timestamp',
      'Amount',
      'Prediction',
      'Fraud_Probability',
      'Risk_Level',
      'Decision_Threshold',
      'Model_Engine',
      'Primary_Factor',
      'Severity',
    ];

    const rows = batchResults.map((item) => {
      const primaryFactor = item.model_insights && item.model_insights[0];
      return [
        `"${item.id}"`,
        `"${item.timestamp}"`,
        item.amount.toFixed(2),
        `"${item.prediction}"`,
        (item.fraud_probability * 100).toFixed(2) + '%',
        `"${item.risk_level}"`,
        item.threshold_used ?? 0.5,
        `"${item.model_name}"`,
        `"${primaryFactor?.factor || 'Normal Baseline'}"`,
        `"${primaryFactor?.severity || 'Low'}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    downloadCSV(`fraudshield_batch_results_${Date.now()}.csv`, csvContent);
  };

  // Summary statistics derived from batch results
  const summary = useMemo(() => {
    const total = batchResults.length;
    const fraudulent = batchResults.filter((r) => r.prediction === 'Fraudulent').length;
    const legitimate = batchResults.filter((r) => r.prediction === 'Legitimate').length;
    const highRisk = batchResults.filter((r) => r.risk_level === 'High').length;
    const mediumRisk = batchResults.filter((r) => r.risk_level === 'Medium').length;
    const lowRisk = batchResults.filter((r) => r.risk_level === 'Low').length;
    const totalAmount = batchResults.reduce((sum, r) => sum + r.amount, 0);
    const avgAmount = total > 0 ? totalAmount / total : 0;
    const fraudRate = total > 0 ? (fraudulent / total) * 100 : 0;

    return {
      total,
      fraudulent,
      legitimate,
      highRisk,
      mediumRisk,
      lowRisk,
      totalAmount,
      avgAmount,
      fraudRate,
    };
  }, [batchResults]);

  // Filtered & Sorted Results for the Table
  const filteredAndSortedResults = useMemo(() => {
    return batchResults
      .filter((item) => {
        // Text search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchId = item.id.toLowerCase().includes(q);
          const matchAmount = item.amount.toString().includes(q);
          const matchPred = item.prediction.toLowerCase().includes(q);
          const matchRisk = item.risk_level.toLowerCase().includes(q);
          const matchFactor = item.model_insights?.some((ins) => ins.factor.toLowerCase().includes(q));
          if (!matchId && !matchAmount && !matchPred && !matchRisk && !matchFactor) {
            return false;
          }
        }

        // Classification filter
        if (classFilter === 'FRAUD' && item.prediction !== 'Fraudulent') return false;
        if (classFilter === 'LEGIT' && item.prediction !== 'Legitimate') return false;

        // Risk filter
        if (riskFilter === 'HIGH' && item.risk_level !== 'High') return false;
        if (riskFilter === 'MED' && item.risk_level !== 'Medium') return false;
        if (riskFilter === 'LOW' && item.risk_level !== 'Low') return false;

        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'amount') {
          diff = a.amount - b.amount;
        } else if (sortField === 'prob') {
          diff = a.fraud_probability - b.fraud_probability;
        } else {
          diff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        }
        return sortOrder === 'desc' ? -diff : diff;
      });
  }, [batchResults, searchQuery, classFilter, riskFilter, sortField, sortOrder]);

  // Paginated records
  const totalPages = Math.ceil(filteredAndSortedResults.length / pageSize) || 1;
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedResults.slice(start, start + pageSize);
  }, [filteredAndSortedResults, currentPage]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">High-Throughput Scoring</span>
            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            <span className="text-slate-500 dark:text-slate-400 font-normal">LightGBM GBDT Inference</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
            Batch Fraud Detection
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Ingest structured CSV files containing multiple payment transactions for automated probabilistic scoring.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {stage === 'RESULTS' && (
            <>
              <button
                id="batch-download-csv-btn"
                onClick={handleDownloadResultsCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Results CSV</span>
              </button>

              <button
                id="batch-analyze-another-btn"
                onClick={handleClearUpload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Analyze Another File</span>
              </button>
            </>
          )}

          {stage === 'PREVIEW' && (
            <button
              onClick={handleClearUpload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Upload</span>
            </button>
          )}
        </div>
      </div>

      {/* Workflow Progress Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 overflow-x-auto pb-1">
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${
            stage === 'UPLOAD'
              ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
              : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
            1
          </span>
          <span>Upload CSV</span>
        </div>
        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />

        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${
            stage === 'PREVIEW'
              ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
              : stage === 'RESULTS'
              ? 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              : 'border-transparent text-slate-400'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px] flex items-center justify-center font-bold">
            2
          </span>
          <span>Validate &amp; Preview</span>
        </div>
        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />

        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${
            stage === 'RESULTS'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'border-transparent text-slate-400'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px] flex items-center justify-center font-bold">
            3
          </span>
          <span>LightGBM Results</span>
        </div>
      </div>

      {/* STAGE 1: UPLOAD CSV */}
      {stage === 'UPLOAD' && (
        <div className="space-y-5">
          {/* Drag & Drop Upload Zone */}
          <div
            id="csv-drop-zone"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 bg-white dark:bg-slate-900/60 rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer group shadow-xs"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform shadow-xs">
              <UploadCloud className="w-7 h-7" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-sans">
              Drag and drop your transaction CSV here
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Supports standard tabular CSVs with an <code className="font-mono text-blue-600 dark:text-blue-400 font-bold">Amount</code> column and optional <code className="font-mono text-slate-700 dark:text-slate-300">V1–V28</code> PCA features.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <span className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs">
                Browse Files
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLoadBenchmarkSample();
                }}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
              >
                Load Pre-Configured Benchmark (12 Txns)
              </button>
            </div>
          </div>

          {/* Quick Specifications & Download Template Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                <FileText className="w-4 h-4 text-blue-500" />
                <span>Expected CSV Schema</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Matches the authoritative <strong>Kaggle Credit Card Fraud</strong> specification:
              </p>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 pl-4 list-disc">
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Amount</strong> (Required): Numeric transaction ticket size in INR or currency.
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Time</strong> (Optional): Elapsed seconds from dataset epoch (0 to 172,800).
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">V1 to V28</strong> (Optional): PCA transformed components. Missing features are automatically imputed to neutral baseline (0.0).
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">
                  <Download className="w-4 h-4 text-emerald-500" />
                  <span>Download Sample Template</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Need a reference format? Download our pre-formatted template with sample legitimate, medium-risk, and high-risk fraud cases.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">benchmark_template.csv</span>
                <button
                  type="button"
                  onClick={handleDownloadSampleTemplate}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV Template</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 2: VALIDATE & PREVIEW */}
      {stage === 'PREVIEW' && validationResult && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Validation Status Banner */}
          {validationResult.isValid ? (
            <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-200 uppercase tracking-wider">
                    CSV Schema Verified &amp; Ready
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-400">
                    Successfully validated {validationResult.totalRows} records from <span className="font-semibold">{fileName}</span> ({fileSize}).
                  </p>
                </div>
              </div>

              <button
                id="process-batch-btn"
                onClick={handleRunBatchAnalysis}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-xs hover:shadow-sm inline-flex items-center gap-2 cursor-pointer transition-all shrink-0"
              >
                <Sparkles className="w-4 h-4 text-blue-200" />
                <span>Process {validationResult.totalRows} Transactions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-950 dark:text-rose-200 uppercase tracking-wider">
                    Validation Error: Missing Required Columns
                  </h4>
                  <p className="text-xs text-rose-800 dark:text-rose-400">
                    {validationResult.errors[0] || 'Unable to parse valid records from this file.'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleClearUpload}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 transition-colors cursor-pointer shrink-0"
              >
                Upload Different File
              </button>
            </div>
          )}

          {/* Non-blocking warnings */}
          {validationResult.warnings.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-300 space-y-1">
              <div className="flex items-center gap-2 font-semibold">
                <Info className="w-3.5 h-3.5 text-amber-600" />
                <span>Parsing Notices:</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-amber-800/90 dark:text-amber-400">
                {validationResult.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Column Detection Diagnostics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block">
                Total Rows
              </span>
              <p className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
                {validationResult.totalRows}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block">
                Amount Column
              </span>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5 font-mono">
                {validationResult.detectedColumns.amountColumn || (
                  <span className="text-rose-500">Not Found</span>
                )}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block">
                Time Column
              </span>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5 font-mono">
                {validationResult.detectedColumns.timeColumn || (
                  <span className="text-slate-400">Default (0s)</span>
                )}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block">
                PCA Features
              </span>
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5 font-mono">
                {validationResult.detectedColumns.detectedVFeatures.length} / 28 Detected
              </p>
            </div>
          </div>

          {/* First 5 Rows Preview Table */}
          {validationResult.previewRows.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
              <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-slate-500" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Raw Data Preview (First 5 Rows)
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {validationResult.headers.length} columns detected
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-3 py-2">#</th>
                      {validationResult.headers.slice(0, 8).map((h, i) => (
                        <th key={i} className="px-3 py-2 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                      {validationResult.headers.length > 8 && (
                        <th className="px-3 py-2 text-slate-400">
                          +{validationResult.headers.length - 8} more...
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono text-[11px]">
                    {validationResult.previewRows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="px-3 py-2 text-slate-400 font-semibold">{rIdx + 1}</td>
                        {validationResult.headers.slice(0, 8).map((h, cIdx) => (
                          <td key={cIdx} className="px-3 py-2 whitespace-nowrap">
                            {row[h]}
                          </td>
                        ))}
                        {validationResult.headers.length > 8 && (
                          <td className="px-3 py-2 text-slate-400">...</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Row */}
          {validationResult.isValid && (
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={handleClearUpload}
                className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel &amp; Clear
              </button>
              <button
                onClick={handleRunBatchAnalysis}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-xs hover:shadow-sm inline-flex items-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4 text-blue-200" />
                <span>Run LightGBM Model</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* STAGE 2.5: PROCESSING / SCORING */}
      {stage === 'PROCESSING' && (
        <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs text-center space-y-4 max-w-xl mx-auto animate-in fade-in duration-200">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto animate-pulse">
            <Layers className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-sans">
              Evaluating Transactions through LightGBM...
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Executing gradient boosted decision trees with SHAP feature interpretability attribution.
            </p>
          </div>

          <div className="space-y-1.5 pt-2">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${processProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Scoring records...</span>
              <span>{processProgress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 3: RESULTS */}
      {stage === 'RESULTS' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Summary Header Cards (6 Required Metrics) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* 1. Total Transactions */}
            <StatCard
              id="batch-total-txns"
              title="Total Analyzed"
              value={summary.total.toLocaleString()}
              subtitle={`Batch: ${fileName}`}
              icon={FileSpreadsheet}
              badge="Batch Ingestion"
              variant="default"
            />

            {/* 2. Fraudulent */}
            <StatCard
              id="batch-fraudulent"
              title="Fraudulent"
              value={summary.fraudulent.toLocaleString()}
              subtitle={`${summary.fraudRate.toFixed(1)}% fraud rate`}
              icon={ShieldAlert}
              badge="Class 1 Positive"
              variant="danger"
            />

            {/* 3. Legitimate */}
            <StatCard
              id="batch-legitimate"
              title="Legitimate"
              value={summary.legitimate.toLocaleString()}
              subtitle="Routine authorized"
              icon={CheckCircle2}
              badge="Class 0 Negative"
              variant="success"
            />

            {/* 4. High Risk */}
            <StatCard
              id="batch-high-risk"
              title="High Risk"
              value={summary.highRisk.toLocaleString()}
              subtitle="P(Fraud) &ge; 70%"
              icon={AlertTriangle}
              badge="Immediate Intercept"
              variant="danger"
            />

            {/* 5. Medium Risk */}
            <StatCard
              id="batch-med-risk"
              title="Medium Risk"
              value={summary.mediumRisk.toLocaleString()}
              subtitle="30% &ndash; 70% threshold"
              icon={Layers}
              badge="Step-Up 2FA"
              variant="warning"
            />

            {/* 6. Low Risk */}
            <StatCard
              id="batch-low-risk"
              title="Low Risk"
              value={summary.lowRisk.toLocaleString()}
              subtitle="&lt; 30% threshold"
              icon={ShieldCheck}
              badge="Auto-Approved"
              variant="success"
            />
          </div>

          {/* Segmented Risk Proportion Bar */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Batch Risk Level Distribution
              </span>
              <span className="font-mono text-slate-500 dark:text-slate-400">
                Avg. Ticket: ₹{summary.avgAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden p-0.5 gap-0.5">
              {summary.lowRisk > 0 && (
                <div
                  style={{ width: `${(summary.lowRisk / summary.total) * 100}%` }}
                  className="bg-emerald-500 rounded-l-full"
                  title={`Low Risk: ${summary.lowRisk} (${((summary.lowRisk / summary.total) * 100).toFixed(1)}%)`}
                />
              )}
              {summary.mediumRisk > 0 && (
                <div
                  style={{ width: `${(summary.mediumRisk / summary.total) * 100}%` }}
                  className="bg-amber-500"
                  title={`Medium Risk: ${summary.mediumRisk} (${((summary.mediumRisk / summary.total) * 100).toFixed(1)}%)`}
                />
              )}
              {summary.highRisk > 0 && (
                <div
                  style={{ width: `${(summary.highRisk / summary.total) * 100}%` }}
                  className="bg-rose-500 rounded-r-full"
                  title={`High Risk: ${summary.highRisk} (${((summary.highRisk / summary.total) * 100).toFixed(1)}%)`}
                />
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="text-emerald-600 dark:text-emerald-400">
                Low Risk: {summary.lowRisk} ({((summary.lowRisk / summary.total) * 100).toFixed(1)}%)
              </span>
              <span className="text-amber-600 dark:text-amber-400">
                Medium Risk: {summary.mediumRisk} ({((summary.mediumRisk / summary.total) * 100).toFixed(1)}%)
              </span>
              <span className="text-rose-600 dark:text-rose-400">
                High Risk: {summary.highRisk} ({((summary.highRisk / summary.total) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Searchable and Filterable Results Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden transition-colors">
            {/* Table Controls */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by ID, amount, factor..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Filters & Sorting */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Classification Filter */}
                <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5">
                  <button
                    onClick={() => {
                      setClassFilter('ALL');
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-all ${
                      classFilter === 'ALL'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    All Class
                  </button>
                  <button
                    onClick={() => {
                      setClassFilter('FRAUD');
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-all ${
                      classFilter === 'FRAUD'
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'text-slate-500 hover:text-rose-600'
                    }`}
                  >
                    Fraud Only
                  </button>
                  <button
                    onClick={() => {
                      setClassFilter('LEGIT');
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-all ${
                      classFilter === 'LEGIT'
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'text-slate-500 hover:text-emerald-600'
                    }`}
                  >
                    Legit Only
                  </button>
                </div>

                {/* Risk Level Filter */}
                <select
                  value={riskFilter}
                  onChange={(e) => {
                    setRiskFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold focus:outline-none"
                >
                  <option value="ALL">All Risk Tiers</option>
                  <option value="HIGH">High Risk Only</option>
                  <option value="MED">Medium Risk Only</option>
                  <option value="LOW">Low Risk Only</option>
                </select>

                {/* Sort Order Toggle */}
                <button
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold inline-flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors cursor-pointer"
                  title="Toggle Ascending/Descending"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>{sortOrder === 'desc' ? 'High &rarr; Low' : 'Low &rarr; High'}</span>
                </button>
              </div>
            </div>

            {/* Results Table */}
            {paginatedResults.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Search className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  No Matching Records
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Try adjusting your search query or filter parameters.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Transaction ID</th>
                      <th
                        onClick={() => {
                          if (sortField === 'amount') setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                          else {
                            setSortField('amount');
                            setSortOrder('desc');
                          }
                        }}
                        className="px-3 py-3 text-right cursor-pointer hover:text-blue-600"
                      >
                        Amount
                      </th>
                      <th
                        onClick={() => {
                          if (sortField === 'prob') setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                          else {
                            setSortField('prob');
                            setSortOrder('desc');
                          }
                        }}
                        className="px-3 py-3 text-right cursor-pointer hover:text-blue-600"
                      >
                        Fraud Prob.
                      </th>
                      <th className="px-3 py-3">Prediction</th>
                      <th className="px-3 py-3">Risk Tier</th>
                      <th className="px-4 py-3">Contributing Factor</th>
                      <th className="px-3 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                    {paginatedResults.map((txn) => {
                      const isFraud = txn.prediction === 'Fraudulent';
                      const primaryInsight = txn.model_insights && txn.model_insights[0];

                      return (
                        <tr
                          key={txn.id}
                          onClick={() => setSelectedTxn(txn)}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                        >
                          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100 font-mono text-[11px] whitespace-nowrap">
                            {txn.id}
                          </td>

                          <td className="px-3 py-3 text-right font-bold text-slate-900 dark:text-slate-100 font-mono whitespace-nowrap">
                            ₹{txn.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>

                          <td className="px-3 py-3 text-right font-mono font-bold whitespace-nowrap">
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${
                                txn.fraud_probability >= 0.7
                                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60'
                                  : txn.fraud_probability >= 0.3
                                  ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60'
                                  : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60'
                              }`}
                            >
                              {(txn.fraud_probability * 100).toFixed(1)}%
                            </span>
                          </td>

                          <td className="px-3 py-3 whitespace-nowrap">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase ${
                                isFraud
                                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              }`}
                            >
                              {txn.prediction}
                            </span>
                          </td>

                          <td className="px-3 py-3 whitespace-nowrap">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                                txn.risk_level === 'High'
                                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                  : txn.risk_level === 'Medium'
                                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                  : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              }`}
                            >
                              {txn.risk_level}
                            </span>
                          </td>

                          <td className="px-4 py-3 max-w-xs truncate text-[11px] text-slate-700 dark:text-slate-300">
                            {primaryInsight ? (
                              <span title={primaryInsight.description} className="flex items-center gap-1.5 truncate">
                                <span className="font-medium truncate">{primaryInsight.factor}</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Baseline deviation</span>
                            )}
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTxn(txn);
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

            {/* Pagination Bar */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>
                Showing {Math.min(filteredAndSortedResults.length, (currentPage - 1) * pageSize + 1)} &ndash;{' '}
                {Math.min(filteredAndSortedResults.length, currentPage * pageSize)} of{' '}
                {filteredAndSortedResults.length} records
              </span>

              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-mono text-[11px]">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Inspection Modal */}
      {selectedTxn && (
        <TransactionDetailModal
          transaction={selectedTxn}
          onClose={() => setSelectedTxn(null)}
          onNavigateToHistory={onNavigateToHistory}
        />
      )}
    </div>
  );
};
