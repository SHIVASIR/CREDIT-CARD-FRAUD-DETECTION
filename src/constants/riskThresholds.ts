/**
 * FraudShield - Centralized MVP Risk Thresholds
 * 
 * MVP configuration:
 * 0% - 30%: LOW Risk
 * 30% - 70%: MEDIUM Risk
 * 70% - 100%: HIGH Risk
 * 
 * Note: These are MVP risk thresholds for academic demonstration
 * and evaluation, not real-world banking standards.
 */

export const MVP_RISK_THRESHOLDS = {
  LOW_MAX: 0.30,
  MEDIUM_MAX: 0.70,
  HIGH_MIN: 0.70,
  DECISION_THRESHOLD: 0.50,
  LABEL: 'MVP risk thresholds (academic benchmark, not real-world banking standards)',
} as const;

export type RiskLevel = 'Low' | 'Medium' | 'High';

export function calculateRiskLevel(
  fraudProbability: number,
  thresholdLow: number = MVP_RISK_THRESHOLDS.LOW_MAX,
  thresholdHigh: number = MVP_RISK_THRESHOLDS.HIGH_MIN
): RiskLevel {
  if (fraudProbability >= thresholdHigh) {
    return 'High';
  }
  if (fraudProbability >= thresholdLow) {
    return 'Medium';
  }
  return 'Low';
}
