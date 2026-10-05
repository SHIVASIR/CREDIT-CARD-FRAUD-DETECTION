import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Clock,
  RotateCcw,
  Zap,
  Info,
  SlidersHorizontal,
  Sliders,
  DollarSign,
  FileCheck,
  TrendingUp,
  TrendingDown,
  Scale,
} from 'lucide-react';
import { AppConfig, FeatureContribution, PredictionResult, TransactionInput, VFeatures } from '../../types';
import { TRANSACTION_PRESETS, TransactionPreset } from '../../data/benchmarkData';
import { MVP_RISK_THRESHOLDS } from '../../constants/riskThresholds';

interface DetectFraudPageProps {
  config: AppConfig;
  onAnalyzeTransaction: (input: TransactionInput) => Promise<PredictionResult>;
  onNavigateToPerformance?: () => void;
  isBackendConnected: boolean;
}

export const DetectFraudPage: React.FC<DetectFraudPageProps> = ({
  config,
  onAnalyzeTransaction,
  onNavigateToPerformance,
  isBackendConnected,
}) => {
  // Current step state in user flow: 1: Details, 2: Review, 3: Result
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form inputs
  const [amount, setAmount] = useState<string>('1450');
  const [time, setTime] = useState<string>('43200'); // 12 hours (noon in seconds)
  const [notes, setNotes] = useState<string>('Retail POS Checkout');
  const [showAllVFeatures, setShowAllVFeatures] = useState<boolean>(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('grocery_low_risk');

  // V1 to V28 vector state
  const initialVFeatures: VFeatures = {};
  for (let i = 1; i <= 28; i++) {
    initialVFeatures[`V${i}`] = 0.0;
  }
  const [vFeatures, setVFeatures] = useState<VFeatures>(initialVFeatures);

  // Interaction, Loading, and Result state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [errors, setErrors] = useState<{ amount?: string; time?: string; general?: string }>({});

  // Initialize with the grocery preset on mount
  useEffect(() => {
    applyPreset(TRANSACTION_PRESETS[0]);
  }, []);

  const applyPreset = (preset: TransactionPreset) => {
    setSelectedPresetId(preset.id);
    setAmount(preset.data.amount.toString());
    setTime(preset.data.time.toString());
    setNotes(preset.data.notes || '');
    setVFeatures({ ...preset.data.vFeatures });
    setErrors({});
  };

  const handleClearForm = () => {
    setAmount('');
    setTime('0');
    setNotes('');
    const resetVector: VFeatures = {};
    for (let i = 1; i <= 28; i++) {
      resetVector[`V${i}`] = 0.0;
    }
    setVFeatures(resetVector);
    setSelectedPresetId('');
    setErrors({});
    setResult(null);
    setCurrentStep(1);
  };

  const handleVChange = (key: string, valStr: string) => {
    const num = parseFloat(valStr);
    setVFeatures((prev) => ({
      ...prev,
      [key]: isNaN(num) ? 0 : num,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: { amount?: string; time?: string; general?: string } = {};

    const numAmount = parseFloat(amount);
    if (amount.trim() === '' || isNaN(numAmount)) {
      newErrors.amount = 'Please enter a valid transaction amount.';
    } else if (numAmount < 0) {
      newErrors.amount = 'Transaction amount cannot be negative.';
    }

    const numTime = parseFloat(time);
    if (time.trim() === '' || isNaN(numTime)) {
      newErrors.time = 'Please enter a valid time value (seconds elapsed).';
    } else if (numTime < 0) {
      newErrors.time = 'Time cannot be negative.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setCurrentStep(2);
  };

  const handleExecutePrediction = async () => {
    if (!validateForm()) {
      setCurrentStep(1);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const inputData: TransactionInput = {
        amount: parseFloat(amount),
        time: parseFloat(time) || 0,
        vFeatures,
        notes: notes.trim() || undefined,
      };

      const prediction = await onAnalyzeTransaction(inputData);
      setResult(prediction);
      setCurrentStep(3); // Result view
    } catch (err: any) {
      setErrors({
        general: err.message || 'Unable to analyze the transaction. Please try again.',
      });
      setCurrentStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeAnother = () => {
    setResult(null);
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Human readable time representation
  const seconds = parseFloat(time) || 0;
  const hourOfDay = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const timeFormatted = `${hourOfDay.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} hrs`;

  // Key predictive PCA drivers identified in LightGBM training
  const keyDrivers = [
    { key: 'V14', label: 'V14 (Credential Security)', desc: 'Strong negative values heavily trigger fraud detection' },
    { key: 'V12', label: 'V12 (Authorization Integrity)', desc: 'Transaction verification consistency metric' },
    { key: 'V10', label: 'V10 (Behavioral Variance)', desc: 'Discrepancy in cardholder routine behavior' },
    { key: 'V17', label: 'V17 (Location Context)', desc: 'Anomalous merchant or terminal terminal profile' },
    { key: 'V4',  label: 'V4 (Velocity Spike)', desc: 'High positive values indicate rapid repeat transactions' },
    { key: 'V11', label: 'V11 (Token Activity)', desc: 'Elevated authorization challenge rate' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 text-[11px] font-semibold mb-1">
          <Zap className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          <span>Prediction Pipeline</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight font-sans">
          Predict Transaction Risk
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
          Evaluate transaction risk probability and explore model decision drivers using the trained LightGBM binary classification model.
        </p>
      </div>

      {/* 4-Step Progress Indicator (Phase 5 Specification) */}
      <div className="grid grid-cols-4 gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs text-xs">
        <div className={`p-2 rounded-lg text-center transition-colors ${currentStep === 1 ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800' : 'text-slate-500 dark:text-slate-400'}`}>
          <span className="block text-[10px] uppercase tracking-wider">Step 1</span>
          <span className="text-xs">Transaction Details</span>
        </div>
        <div className={`p-2 rounded-lg text-center transition-colors ${currentStep === 2 ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800' : 'text-slate-500 dark:text-slate-400'}`}>
          <span className="block text-[10px] uppercase tracking-wider">Step 2</span>
          <span className="text-xs">Review Input</span>
        </div>
        <div className={`p-2 rounded-lg text-center transition-colors ${isLoading ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800 animate-pulse' : 'text-slate-500 dark:text-slate-400'}`}>
          <span className="block text-[10px] uppercase tracking-wider">Step 3</span>
          <span className="text-xs">Analyze Transaction</span>
        </div>
        <div className={`p-2 rounded-lg text-center transition-colors ${currentStep === 3 && result ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800' : 'text-slate-500 dark:text-slate-400'}`}>
          <span className="block text-[10px] uppercase tracking-wider">Step 4</span>
          <span className="text-xs">View Result</span>
        </div>
      </div>

      {/* Preset Scenarios Selector */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Quick Test Presets (Standard Benchmark Profiles)
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            One-click test values
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TRANSACTION_PRESETS.map((p) => {
            const isSelected = selectedPresetId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p)}
                className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span className="truncate">{p.name}</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
                      p.expectedRisk === 'High'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        : p.expectedRisk === 'Medium'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {p.expectedRisk}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  ₹{p.data.amount.toLocaleString()} &bull; {p.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: FORM INPUTS */}
      {currentStep === 1 && (
        <form onSubmit={handleProceedToReview} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-6 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Step 1: Enter Transaction Features
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generated strictly according to actual LightGBM model features (Amount, Time, and PCA V1..V28).
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearForm}
              className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 font-medium cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Form</span>
            </button>
          </div>

          {/* Privacy Notice Banner (Phase 6 Specification: No card numbers/CVVs) */}
          <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Privacy Standard:</strong> This model operates exclusively on anonymized PCA vectors and numerical transaction metadata. 
              It does <strong>not</strong> collect or accept Card Numbers, CVVs, PINs, OTPs, or user credentials.
            </p>
          </div>

          {/* Primary Fields Group: Amount & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount */}
            <div className="space-y-1.5">
              <label htmlFor="input-amount" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Transaction Amount (₹ or $) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500 text-xs font-bold">
                  ₹
                </span>
                <input
                  id="input-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
                  }}
                  placeholder="e.g. 1450.00"
                  className={`w-full pl-8 pr-3 py-2 text-sm font-mono rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none transition-colors ${
                    errors.amount
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                  }`}
                />
              </div>
              {errors.amount ? (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">{errors.amount}</p>
              ) : (
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  Normalized via RobustScaler during inference (benchmark median: ₹22.00).
                </p>
              )}
            </div>

            {/* Time / Elapsed Seconds */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="input-time" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Elapsed Time (Seconds) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {timeFormatted}
                </span>
              </div>
              <input
                id="input-time"
                type="number"
                step="60"
                min="0"
                value={time}
                onChange={(e) => {
                  setTime(e.target.value);
                  if (errors.time) setErrors((prev) => ({ ...prev, time: undefined }));
                }}
                placeholder="e.g. 43200 (12:00 PM)"
                className={`w-full px-3 py-2 text-sm font-mono rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none transition-colors ${
                  errors.time
                    ? 'border-rose-500 focus:border-rose-500'
                    : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                }`}
              />
              {errors.time ? (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">{errors.time}</p>
              ) : (
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  Seconds elapsed from observation start; captures circadian fraud patterns.
                </p>
              )}
            </div>
          </div>

          {/* Reference Notes / Description (Optional) */}
          <div className="space-y-1.5">
            <label htmlFor="input-notes" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Transaction Context / Memo <span className="text-slate-400 text-[10px] font-normal">(Optional audit label)</span>
            </label>
            <input
              id="input-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Online Store Checkout / Fuel Station POS"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Group 2: Key Diagnostic PCA Features */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  Key Diagnostic PCA Features
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Top 6 components demonstrating the highest split gain in the trained LightGBM model.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
                Critical Drivers
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {keyDrivers.map((driver) => {
                const val = vFeatures[driver.key] ?? 0;
                return (
                  <div
                    key={driver.key}
                    className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">
                        {driver.key}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        PCA Score
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-tight">
                      {driver.desc}
                    </p>
                    <input
                      type="number"
                      step="0.01"
                      value={val}
                      onChange={(e) => handleVChange(driver.key, e.target.value)}
                      className="w-full text-center font-mono text-xs py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Group 3: Expandable Full Vector (V1 to V28) */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowAllVFeatures(!showAllVFeatures)}
              className="w-full py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>All 28 Anonymized Features (V1 to V28)</span>
              </span>
              {showAllVFeatures ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAllVFeatures && (
              <div className="mt-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-3">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Principal components resulting from PCA transformation on raw banking telemetry. Zero denotes baseline mean behavior.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((idx) => {
                    const key = `V${idx}`;
                    const val = vFeatures[key] ?? 0;
                    const isKey = ['V14', 'V12', 'V10', 'V17', 'V4', 'V11'].includes(key);

                    return (
                      <div
                        key={key}
                        className={`p-2 rounded-lg border text-center ${
                          isKey
                            ? 'bg-blue-50/30 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                          <span className={isKey ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}>{key}</span>
                          {isKey && <span className="text-[8px] px-1 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold">KEY</span>}
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          value={val}
                          onChange={(e) => handleVChange(key, e.target.value)}
                          className="w-full text-center font-mono text-xs py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* General Error Banner */}
          {errors.general && (
            <div className="p-3.5 rounded-lg bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Evaluation Notice</p>
                <p className="mt-0.5 text-[11px]">{errors.general}</p>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleClearForm}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer"
            >
              Clear Form
            </button>

            <div className="flex items-center gap-2">
              <button
                id="btn-proceed-review"
                type="submit"
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors cursor-pointer"
              >
                Review Input
              </button>

              <button
                id="btn-direct-analyze"
                type="button"
                disabled={isLoading}
                onClick={handleExecutePrediction}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing transaction...</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4 text-blue-200" />
                    <span>Analyze Transaction</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* STEP 2: REVIEW INPUT BEFORE ANALYZING (Phase 5 Specification) */}
      {currentStep === 2 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-6 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Step 2: Review Transaction Features
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Confirm input parameters before dispatching to the LightGBM prediction engine.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
            >
              &larr; Edit Inputs
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700">
              <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider block">
                Transaction Amount
              </span>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1 block">
                ₹{parseFloat(amount || '0').toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700">
              <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider block">
                Transaction Timing
              </span>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1 block">
                {timeFormatted}
              </span>
              <span className="text-[10px] text-slate-400">({time}s offset)</span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700">
              <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider block">
                Context Memo
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1 block truncate">
                {notes || 'No description provided'}
              </span>
            </div>
          </div>

          {/* Key Drivers Summary */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Key Diagnostic PCA Inputs:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
              {['V14', 'V12', 'V10', 'V17', 'V4', 'V11'].map((k) => (
                <div key={k} className="p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-mono">
                  <span className="text-[10px] text-slate-400 block">{k}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{vFeatures[k] ?? 0}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 3 Action: Trigger Analyze Transaction */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Back to Form
            </button>

            <button
              id="btn-analyze-transaction"
              type="button"
              disabled={isLoading}
              onClick={handleExecutePrediction}
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs shadow-xs hover:shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Analyzing transaction...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4 text-blue-200" />
                  <span>Analyze Transaction</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: PREDICTION RESULT CARD & EXPLAINABLE AI (Phase 9 & Explainable AI) */}
      {currentStep === 3 && result && (
        <section
          id="prediction-result-card"
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-300 transition-colors"
        >
          {/* Card Top Title Banner */}
          <div className="px-6 py-3 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-400" />
              <span>TRANSACTION ANALYSIS</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              ID: {result.id}
            </span>
          </div>

          {/* Visual Outcome Banner */}
          <div
            className={`p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              result.prediction === 'Fraudulent'
                ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
                : result.prediction === 'Legitimate / Review'
                ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60'
                : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-2xl shadow-xs ${
                  result.prediction === 'Fraudulent'
                    ? 'bg-rose-600 text-white'
                    : result.prediction === 'Legitimate / Review'
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {result.prediction === 'Fraudulent' ? (
                  <AlertTriangle className="w-7 h-7" />
                ) : (
                  <CheckCircle2 className="w-7 h-7" />
                )}
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                  Model Prediction
                </span>
                <h2
                  className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                    result.prediction === 'Fraudulent'
                      ? 'text-rose-950 dark:text-rose-100'
                      : result.prediction === 'Legitimate / Review'
                      ? 'text-amber-950 dark:text-amber-100'
                      : 'text-emerald-950 dark:text-emerald-100'
                  }`}
                >
                  {result.prediction.toUpperCase()}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Algorithm: LightGBM GBDT Classifier &bull; Holdout Validated
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 block">
                Evaluated At
              </span>
              <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                {new Date(result.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Dedicated Result Metrics (Phase 9 Format) */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Box 1: Prediction */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Prediction
                </span>
                <p
                  className={`text-xl font-bold font-sans mt-1 ${
                    result.prediction === 'Fraudulent'
                      ? 'text-rose-600 dark:text-rose-400'
                      : result.prediction === 'Legitimate / Review'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {result.prediction.toUpperCase()}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Threshold: {(result.threshold_used * 100).toFixed(0)}%
                </p>
              </div>

              {/* Box 2: Fraud Probability */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Fraud Probability
                </span>
                <p className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                  {(result.fraud_probability * 100).toFixed(1)}%
                </p>
                {/* Horizontal Progress Bar */}
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, Math.max(3, result.fraud_probability * 100))}%` }}
                    className={`h-full rounded-full transition-all ${
                      result.fraud_probability >= 0.70
                        ? 'bg-rose-600'
                        : result.fraud_probability >= 0.30
                        ? 'bg-amber-500'
                        : 'bg-emerald-600'
                    }`}
                  />
                </div>
              </div>

              {/* Box 3: Risk Level (Phase 10: MVP risk thresholds) */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Risk Level
                  </span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">MVP config</span>
                </div>
                <div className="mt-1">
                  <span
                    className={`px-3 py-1 rounded text-xs font-bold uppercase inline-block border ${
                      result.risk_level === 'High'
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        : result.risk_level === 'Medium'
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    {result.risk_level.toUpperCase()}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">
                  0–30% Low &bull; 30–70% Medium &bull; 70–100% High
                </p>
              </div>
            </div>

            {/* EXPLAINABLE AI SECTION (Exact title & specs from request) */}
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Why did the model make this prediction?</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Feature-level TreeSHAP contribution analysis showing directional influence on classification log-odds.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 self-start sm:self-auto">
                  SHAP / Tree Contribution
                </span>
              </div>

              {/* Explainable AI Visual Horizontal Contribution Chart */}
              {result.feature_contributions && result.feature_contributions.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                    <span className="font-semibold text-[11px]">Feature &amp; Value</span>
                    <div className="flex items-center gap-4 text-[10px]">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> Pulls Toward Legitimate (&minus;)
                      </span>
                      <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-rose-500" /> Pulls Toward Fraud (+)
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Contribution Chart List */}
                  <div className="space-y-2.5">
                    {result.feature_contributions.map((fc: FeatureContribution, idx: number) => {
                      const maxMag = Math.max(...(result.feature_contributions || []).map((f) => f.magnitude), 1.0);
                      const barWidth = Math.min(100, Math.max(8, (fc.magnitude / maxMag) * 100));
                      const isFraud = fc.direction === 'fraud';

                      return (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-slate-100 font-mono text-xs w-16">
                                {fc.feature}
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                Val: {fc.feature_value}
                              </span>
                              {fc.description && (
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:inline-block">
                                  &bull; {fc.description}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 font-mono text-xs">
                              <span
                                className={`font-bold ${
                                  isFraud ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                                }`}
                              >
                                {isFraud ? '+' : '-'}{fc.magnitude.toFixed(3)}
                              </span>
                              <span
                                className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-semibold ${
                                  isFraud
                                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                                }`}
                              >
                                {isFraud ? 'Increases Risk' : 'Reduces Risk'}
                              </span>
                            </div>
                          </div>

                          {/* Dual-direction visual bar */}
                          <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
                            <div
                              style={{ width: `${barWidth}%` }}
                              className={`h-full rounded-full transition-all ${
                                isFraud ? 'bg-rose-500' : 'bg-emerald-500'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
                  <p className="font-semibold">Detailed feature-level explanation is unavailable.</p>
                  <p className="text-[11px] mt-1 text-amber-700 dark:text-amber-300">
                    SHAP or tree split contributions were not generated for this model output.
                  </p>
                </div>
              )}

              {/* Mandatory Causation Disclaimer */}
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
                <p className="leading-relaxed text-[11px]">
                  <strong className="text-slate-800 dark:text-slate-200">Scientific Note:</strong> Feature contribution indicates statistical association with the trained model&apos;s decision boundary and <strong>does not imply causation</strong>. High contribution indicates that the value strongly aligns with patterns identified during gradient-boosted tree learning.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                id="btn-analyze-another-txn"
                type="button"
                onClick={handleAnalyzeAnother}
                className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Analyze Another Transaction</span>
              </button>

              {onNavigateToPerformance && (
                <button
                  type="button"
                  onClick={onNavigateToPerformance}
                  className="px-4 py-2.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>View Model Performance</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
