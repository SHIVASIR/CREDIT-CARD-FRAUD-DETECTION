import React from 'react';
import {
  ShieldCheck,
  Cpu,
  Server,
  Code2,
  FileCode,
  Terminal,
  Lock,
  AlertCircle,
  Layers,
  Sparkles,
  GitBranch,
  Scale,
  BrainCircuit,
  Database,
  BarChart3,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 text-[11px] font-semibold mb-1">
          <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          <span>System Information &amp; Architecture</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight font-sans">
          About FraudShield
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
          An academic MVP for Credit Card Fraud Detection using LightGBM machine learning models and Explainable AI.
        </p>
      </div>

      {/* Project Overview Card */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3.5 transition-colors">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Project Purpose &amp; Academic Scope</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <strong>FraudShield</strong> is designed as a functional, presentation-ready academic MVP for credit card fraud detection. 
          The application demonstrates how gradient-boosted decision tree algorithms (LightGBM) can detect fraudulent transaction patterns under extreme class imbalance without sacrificing inference throughput or cardholder data privacy.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Algorithm</span>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">LightGBM GBDT</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Leaf-wise gradient boosting</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Imbalance Strategy</span>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">scale_pos_weight</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">577:1 penalty weighting</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Explainability</span>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">TreeSHAP Values</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Directional feature contributions</p>
          </div>
        </div>
      </div>

      {/* Logical Architecture (Phase 2 Specification) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3.5 transition-colors">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Application Architecture Flow</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The frontend never contains the ML model itself; it communicates with the backend via a clean REST API contract:
        </p>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 font-mono text-xs text-slate-800 dark:text-slate-200 overflow-x-auto space-y-1">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
            <span>USER</span> &rarr;
            <span className="text-blue-600 dark:text-blue-400 font-bold">FraudShield Frontend</span> &rarr;
            <span>Prediction Interface</span> &rarr;
            <span className="text-blue-600 dark:text-blue-400 font-bold">API / Backend</span> &rarr;
            <span>Input Validation</span> &rarr;
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Preprocessing Pipeline</span> &rarr;
            <span className="text-purple-600 dark:text-purple-400 font-bold">LightGBM Model</span> &rarr;
            <span>Fraud Probability</span> &rarr;
            <span>Classification Threshold</span> &rarr;
            <span>Risk Assessment</span> &rarr;
            <span>Frontend Result</span>
          </div>
        </div>
      </div>

      {/* End-to-End ML Pipeline */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3.5 transition-colors">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Dataset &amp; Preprocessing Methodology</span>
        </h2>

        <div className="space-y-2 pt-1 text-xs">
          {[
            {
              step: '1. Kaggle ULB Benchmark Dataset',
              desc: 'Contains 284,807 European credit card transactions with 492 fraud cases (0.172%). The 28 numerical features (V1–V28) are principal components extracted via PCA to safeguard cardholder confidentiality.',
            },
            {
              step: '2. Leakage-Free Preprocessing',
              desc: 'A stratified 80/20 train-test split was performed first. The RobustScaler was fit exclusively on the training subset, ensuring test and inference distributions remain completely unseen to prevent lookahead data leakage.',
            },
            {
              step: '3. Imbalance Handling via Cost-Sensitive Learning',
              desc: 'Rather than using synthetic oversampling (such as SMOTE), which can create artificial transactions in PCA space, LightGBM was configured with scale_pos_weight=577.8. This penalizes False Negatives directly in the loss function.',
            },
            {
              step: '4. Multi-Metric Evaluation Standards',
              desc: 'Validated using Precision (89.13%), Recall (83.67%), F1-Score (86.32%), ROC-AUC (0.9834), and PR-AUC (0.8621). PR-AUC is prioritized because it isolates performance on the rare positive class.',
            },
            {
              step: '5. Explainable AI & SHAP Integration',
              desc: 'Every prediction includes directional feature contribution values (TreeSHAP) illustrating why the model favored a fraudulent or legitimate classification, with the strict caveat that statistical correlation does not imply causation.',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 flex items-start gap-3">
              <span className="w-5 h-5 rounded-md bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div>
                <strong className="text-xs font-semibold text-slate-900 dark:text-slate-100">{item.step}</strong>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Academic Disclaimers */}
      <div className="space-y-3">
        <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
          <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block text-xs">Data Privacy &amp; Anonymization:</strong>
            <p className="mt-0.5 leading-relaxed text-emerald-800 dark:text-emerald-300 text-[11px]">
              FraudShield strictly handles anonymized numerical PCA values and transaction amounts. It does <strong>not</strong> request, store, or process real credit card numbers, CVVs, expiration dates, PINs, OTPs, or personal banking credentials.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block text-xs">Academic Prototype Scope:</strong>
            <p className="mt-0.5 leading-relaxed text-slate-600 dark:text-slate-400 text-[11px]">
              FraudShield is an academic MVP built for presentation and evaluation. Risk thresholds (0–30% Low, 30–70% Medium, 70–100% High) are MVP demo configurations and do not reflect production banking policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
