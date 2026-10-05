import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, RefreshCw, Cpu, Server, Sliders, ShieldCheck } from 'lucide-react';
import { AppConfig } from '../types';

interface ModeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSaveConfig: (newConfig: Partial<AppConfig>) => Promise<void>;
  isBackendConnected: boolean;
  onRefreshHealth: () => Promise<void>;
}

export const ModeConfigModal: React.FC<ModeConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  isBackendConnected,
  onRefreshHealth,
}) => {
  const [demoMode, setDemoMode] = useState(config.demo_mode);
  const [backendUrl, setBackendUrl] = useState(config.backend_url);
  const [decisionThreshold, setDecisionThreshold] = useState(config.decision_threshold);
  const [isSaving, setIsSaving] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    await onSaveConfig({
      demo_mode: demoMode,
      backend_url: backendUrl,
      decision_threshold: decisionThreshold,
    });
    setIsSaving(false);
    onClose();
  };

  const handleTestHealth = async () => {
    setIsChecking(true);
    await onRefreshHealth();
    setIsChecking(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        id="mode-config-dialog"
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden animate-in fade-in zoom-in-95 duration-150 transition-colors"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Execution Engine &amp; Model Settings</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Configure LightGBM inference mode and API endpoints</p>
            </div>
          </div>
          <button
            id="close-config-modal-btn"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Mode Selection Cards */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Inference Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Demo Mode Card */}
              <div
                id="select-demo-mode-card"
                onClick={() => setDemoMode(true)}
                className={`cursor-pointer rounded-lg p-3.5 border transition-all ${
                  demoMode
                    ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 text-blue-950 dark:text-blue-200 ring-1 ring-blue-600/20'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-slate-900 dark:text-slate-100">Demo Mode</span>
                  </div>
                  {demoMode && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Uses mathematical LightGBM decision tree scoring calibrated on the Kaggle 284k dataset. No Python installation required.
                </p>
                <div className="mt-2.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
                    Recommended for Viva Demo
                  </span>
                </div>
              </div>

              {/* Live Model Mode Card */}
              <div
                id="select-live-mode-card"
                onClick={() => setDemoMode(false)}
                className={`cursor-pointer rounded-lg p-3.5 border transition-all ${
                  !demoMode
                    ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 text-blue-950 dark:text-blue-200 ring-1 ring-blue-600/20'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Server className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-slate-900 dark:text-slate-100">Live Model Mode</span>
                  </div>
                  {!demoMode && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Communicates directly with the Flask REST service running the serialized LightGBM model (<code className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-800 dark:text-slate-200 font-mono">fraud_model.pkl</code>).
                </p>
                <div className="mt-2.5 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                    {isBackendConnected ? 'Backend Online' : 'Backend Offline'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Backend Configuration */}
          {!demoMode && (
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Python Flask API Endpoint</label>
                <button
                  onClick={handleTestHealth}
                  disabled={isChecking}
                  className="flex items-center gap-1 text-[11px] text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
                  <span>Test Connection</span>
                </button>
              </div>
              <input
                id="input-backend-url"
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                placeholder="http://localhost:5000"
                className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100 font-mono"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Ensure <code className="bg-slate-200/80 dark:bg-slate-700 px-1 py-0.5 rounded text-slate-800 dark:text-slate-200 font-mono text-[10px]">python backend/app.py</code> is executing on this host and port.
              </p>
            </div>
          )}

          {/* Decision Threshold Setting */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">Binary Decision Threshold</label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Transactions with fraud probability &ge; this value are classified as Fraudulent.</p>
              </div>
              <span className="text-xs font-bold font-mono text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80">
                {(decisionThreshold * 100).toFixed(0)}%
              </span>
            </div>
            <input
              id="input-decision-threshold"
              type="range"
              min="0.10"
              max="0.90"
              step="0.05"
              value={decisionThreshold}
              onChange={(e) => setDecisionThreshold(parseFloat(e.target.value))}
              className="w-full accent-blue-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              <span>10% (High Recall / Catch More Fraud)</span>
              <span>50% (Standard Balance)</span>
              <span>90% (High Precision / Low False Alarms)</span>
            </div>
          </div>

          {/* Academic Integrity Notice */}
          <div className="p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-blue-900 dark:text-blue-200 leading-relaxed">
              <strong className="font-semibold">Academic Transparency Guarantee:</strong> FraudShield strictly differentiates between Demo Predictions and Live LightGBM Predictions. All predictions are explicitly watermarked with their execution origin.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/40">
          <button
            id="cancel-config-btn"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="save-config-btn"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSaving ? 'Applying...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
};
