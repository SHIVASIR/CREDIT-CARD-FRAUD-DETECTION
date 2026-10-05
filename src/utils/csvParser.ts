import { TransactionInput } from '../types';

export interface ColumnValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  headers: string[];
  detectedColumns: {
    amountColumn: string | null;
    timeColumn: string | null;
    idColumn: string | null;
    detectedVFeatures: string[];
    missingVFeatures: string[];
  };
  previewRows: Array<Record<string, string>>;
  parsedTransactions: TransactionInput[];
  customIds: string[];
  totalRows: number;
}

/**
 * Splits a CSV line into fields respecting quoted values with commas
 */
function parseCsvLine(text: string): string[] {
  const result: string[] = [];
  let curr = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        curr += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(curr.trim());
      curr = '';
    } else {
      curr += char;
    }
  }
  result.push(curr.trim());
  return result;
}

/**
 * Parses and validates an uploaded CSV file containing transactions
 */
export function parseAndValidateTransactionsCSV(csvText: string): ColumnValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!csvText || typeof csvText !== 'string' || !csvText.trim()) {
    return {
      isValid: false,
      errors: ['The selected CSV file appears to be completely empty.'],
      warnings: [],
      headers: [],
      detectedColumns: {
        amountColumn: null,
        timeColumn: null,
        idColumn: null,
        detectedVFeatures: [],
        missingVFeatures: [],
      },
      previewRows: [],
      parsedTransactions: [],
      customIds: [],
      totalRows: 0,
    };
  }

  // Normalize line endings and filter non-empty lines
  const lines = csvText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    return {
      isValid: false,
      errors: ['The CSV file must contain a header row and at least one transaction data row.'],
      warnings: [],
      headers: [],
      detectedColumns: {
        amountColumn: null,
        timeColumn: null,
        idColumn: null,
        detectedVFeatures: [],
        missingVFeatures: [],
      },
      previewRows: [],
      parsedTransactions: [],
      customIds: [],
      totalRows: 0,
    };
  }

  // Extract raw headers
  const rawHeaders = parseCsvLine(lines[0]);
  const headers = rawHeaders.map((h) => h.replace(/^["']|["']$/g, '').trim());

  // Column mapping (case-insensitive)
  const headerMap: Record<string, number> = {};
  headers.forEach((h, idx) => {
    headerMap[h.toLowerCase()] = idx;
  });

  // 1. Validate Amount column
  let amountIndex = -1;
  let amountColumnName: string | null = null;
  const amountAliases = ['amount', 'amt', 'transaction_amount', 'transactionamount', 'tx_amount', 'value'];
  for (const alias of amountAliases) {
    if (headerMap[alias] !== undefined) {
      amountIndex = headerMap[alias];
      amountColumnName = headers[amountIndex];
      break;
    }
  }

  if (amountIndex === -1) {
    errors.push(
      `Missing required column: "Amount". Detected columns: [${headers.slice(0, 8).join(', ')}${
        headers.length > 8 ? ` and ${headers.length - 8} more` : ''
      }]. Please ensure your CSV includes an "Amount" header.`
    );
  }

  // 2. Validate Time column
  let timeIndex = -1;
  let timeColumnName: string | null = null;
  const timeAliases = ['time', 'seconds', 'step', 'timestamp_seconds', 'offset'];
  for (const alias of timeAliases) {
    if (headerMap[alias] !== undefined) {
      timeIndex = headerMap[alias];
      timeColumnName = headers[timeIndex];
      break;
    }
  }

  if (timeIndex === -1) {
    warnings.push('No "Time" column detected. Defaulting transaction timestamps to 0 seconds offset.');
  }

  // 3. Optional Transaction ID column
  let idIndex = -1;
  let idColumnName: string | null = null;
  const idAliases = ['id', 'transaction_id', 'tx_id', 'transactionid', 'reference'];
  for (const alias of idAliases) {
    if (headerMap[alias] !== undefined) {
      idIndex = headerMap[alias];
      idColumnName = headers[idIndex];
      break;
    }
  }

  // 4. Validate PCA Features V1 through V28
  const detectedVFeatures: string[] = [];
  const missingVFeatures: string[] = [];
  const vFeatureIndices: Record<string, number> = {};

  for (let i = 1; i <= 28; i++) {
    const keyUpper = `V${i}`;
    const keyLower = `v${i}`;

    if (headerMap[keyLower] !== undefined) {
      detectedVFeatures.push(keyUpper);
      vFeatureIndices[keyUpper] = headerMap[keyLower];
    } else {
      missingVFeatures.push(keyUpper);
    }
  }

  if (missingVFeatures.length > 0) {
    if (missingVFeatures.length === 28) {
      warnings.push(
        'No PCA feature columns (V1-V28) detected. Model will score transactions using Amount, Time, and standard baseline deviations.'
      );
    } else {
      warnings.push(
        `${detectedVFeatures.length}/28 PCA feature columns detected. Imputing ${missingVFeatures.length} missing features to neutral baseline (0.0).`
      );
    }
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      warnings,
      headers,
      detectedColumns: {
        amountColumn: amountColumnName,
        timeColumn: timeColumnName,
        idColumn: idColumnName,
        detectedVFeatures,
        missingVFeatures,
      },
      previewRows: [],
      parsedTransactions: [],
      customIds: [],
      totalRows: lines.length - 1,
    };
  }

  // Parse data rows
  const previewRows: Array<Record<string, string>> = [];
  const parsedTransactions: TransactionInput[] = [];
  const customIds: string[] = [];
  let skippedRows = 0;

  for (let r = 1; r < lines.length; r++) {
    const rawValues = parseCsvLine(lines[r]);
    if (rawValues.length === 0 || (rawValues.length === 1 && rawValues[0] === '')) {
      continue;
    }

    // Build row object for raw preview (first 5 rows)
    if (previewRows.length < 5) {
      const previewObj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        previewObj[h] = rawValues[idx] ?? '';
      });
      previewRows.push(previewObj);
    }

    // Extract Amount
    const rawAmountStr = rawValues[amountIndex]?.replace(/[^0-9.-]/g, '');
    const amount = parseFloat(rawAmountStr);

    if (isNaN(amount) || amount < 0) {
      skippedRows++;
      if (skippedRows <= 3) {
        warnings.push(`Row #${r}: Invalid amount value "${rawValues[amountIndex] ?? ''}". Skipped.`);
      }
      continue;
    }

    // Extract Time
    let time = 0;
    if (timeIndex !== -1 && rawValues[timeIndex]) {
      const parsedTime = parseFloat(rawValues[timeIndex]);
      if (!isNaN(parsedTime)) time = parsedTime;
    }

    // Extract ID if available
    let customId = '';
    if (idIndex !== -1 && rawValues[idIndex]) {
      customId = rawValues[idIndex].trim();
    }
    customIds.push(customId);

    // Extract V1-V28
    const vFeatures: Record<string, number> = {};
    for (let i = 1; i <= 28; i++) {
      const key = `V${i}`;
      if (vFeatureIndices[key] !== undefined) {
        const val = parseFloat(rawValues[vFeatureIndices[key]]);
        vFeatures[key] = isNaN(val) ? 0 : val;
      } else {
        vFeatures[key] = 0;
      }
    }

    parsedTransactions.push({
      amount,
      time,
      vFeatures,
      notes: `Batch Row #${r}`,
    });
  }

  if (skippedRows > 3) {
    warnings.push(`Total of ${skippedRows} rows were skipped due to invalid numeric amount values.`);
  }

  if (parsedTransactions.length === 0) {
    errors.push('No valid transaction rows could be extracted from the file.');
    return {
      isValid: false,
      errors,
      warnings,
      headers,
      detectedColumns: {
        amountColumn: amountColumnName,
        timeColumn: timeColumnName,
        idColumn: idColumnName,
        detectedVFeatures,
        missingVFeatures,
      },
      previewRows,
      parsedTransactions: [],
      customIds: [],
      totalRows: 0,
    };
  }

  return {
    isValid: true,
    errors: [],
    warnings,
    headers,
    detectedColumns: {
      amountColumn: amountColumnName,
      timeColumn: timeColumnName,
      idColumn: idColumnName,
      detectedVFeatures,
      missingVFeatures,
    },
    previewRows,
    parsedTransactions,
    customIds,
    totalRows: parsedTransactions.length,
  };
}

/**
 * Generates an authoritative benchmark sample CSV string for quick testing
 */
export function generateSampleTransactionsCSV(): string {
  const headers = [
    'Transaction_ID',
    'Time',
    'Amount',
    'V1',
    'V2',
    'V3',
    'V4',
    'V5',
    'V6',
    'V7',
    'V8',
    'V9',
    'V10',
    'V11',
    'V12',
    'V13',
    'V14',
    'V15',
    'V16',
    'V17',
    'V18',
    'V19',
    'V20',
    'V21',
    'V22',
    'V23',
    'V24',
    'V25',
    'V26',
    'V27',
    'V28',
  ];

  const rows: Array<Array<string | number>> = [
    // 1. High-Risk Fraud: Critical V14 (-8.40), V12 (-6.80), High amount, Late night (Time 14400)
    [
      'TXN-BCH-001',
      14400,
      89200.0,
      -1.42,
      2.1,
      -3.4,
      4.8,
      -1.2,
      -0.8,
      -3.2,
      1.1,
      -2.4,
      -4.9,
      3.8,
      -6.8,
      0.2,
      -8.4,
      -0.5,
      -4.1,
      -5.6,
      -1.9,
      0.8,
      0.9,
      0.65,
      -0.12,
      -0.45,
      0.15,
      0.28,
      0.42,
      0.18,
      0.08,
    ],
    // 2. Legitimate: Routine Supermarket POS (₹1,450.00)
    [
      'TXN-BCH-002',
      38200,
      1450.0,
      0.12,
      -0.08,
      0.45,
      0.18,
      -0.05,
      0.12,
      0.22,
      0.04,
      0.11,
      -0.15,
      0.22,
      0.35,
      0.1,
      0.25,
      0.14,
      0.08,
      -0.12,
      0.05,
      -0.02,
      0.04,
      -0.06,
      0.11,
      -0.05,
      0.12,
      -0.08,
      0.02,
      0.01,
      0.01,
    ],
    // 3. High-Risk Fraud: Micro-Charge Bot Probe (₹45.00) with severe anomaly
    [
      'TXN-BCH-003',
      7200,
      45.0,
      -2.85,
      3.4,
      -4.1,
      5.2,
      -2.1,
      -1.4,
      -4.2,
      1.8,
      -3.1,
      -5.8,
      4.2,
      -7.2,
      -0.4,
      -9.1,
      0.2,
      -4.8,
      -6.2,
      -2.4,
      1.2,
      0.8,
      0.72,
      -0.22,
      -0.38,
      0.24,
      0.35,
      0.48,
      0.25,
      0.12,
    ],
    // 4. Legitimate: Verified Online Coffee Purchase (₹380.00)
    [
      'TXN-BCH-004',
      32400,
      380.0,
      0.05,
      -0.02,
      0.88,
      -0.15,
      0.22,
      -0.08,
      0.14,
      0.02,
      0.08,
      0.12,
      -0.05,
      0.42,
      0.18,
      0.32,
      -0.1,
      0.15,
      0.08,
      -0.04,
      0.02,
      -0.01,
      0.03,
      -0.02,
      0.08,
      -0.04,
      0.06,
      -0.02,
      0.01,
      0.0,
    ],
    // 5. Medium-Risk: Flight Ticket (₹34,500.00) with moderate V4 deviation
    [
      'TXN-BCH-005',
      54000,
      34500.0,
      -0.65,
      1.1,
      -0.85,
      2.4,
      -0.45,
      -0.3,
      -0.8,
      0.4,
      -0.6,
      -1.2,
      1.5,
      -1.8,
      0.1,
      -2.1,
      0.1,
      -1.1,
      -1.4,
      -0.5,
      0.3,
      0.25,
      0.18,
      -0.08,
      -0.12,
      0.08,
      0.11,
      0.14,
      0.06,
      0.02,
    ],
    // 6. Legitimate: Utility Bill Payment (₹2,240.00)
    [
      'TXN-BCH-006',
      41200,
      2240.0,
      -0.15,
      0.04,
      0.65,
      0.08,
      0.12,
      -0.04,
      0.18,
      -0.02,
      0.05,
      0.04,
      -0.12,
      0.28,
      0.06,
      0.18,
      -0.05,
      0.1,
      0.02,
      -0.06,
      0.01,
      -0.02,
      0.02,
      -0.04,
      0.05,
      -0.02,
      0.04,
      -0.01,
      0.0,
      0.01,
    ],
    // 7. High-Risk Fraud: Electronics Store Takeover (₹1,24,000.00)
    [
      'TXN-BCH-007',
      10800,
      124000.0,
      -2.1,
      2.8,
      -3.8,
      4.9,
      -1.8,
      -1.1,
      -3.8,
      1.4,
      -2.8,
      -5.2,
      4.0,
      -7.1,
      -0.1,
      -8.8,
      0.3,
      -4.5,
      -5.9,
      -2.1,
      1.0,
      0.75,
      0.68,
      -0.18,
      -0.32,
      0.2,
      0.31,
      0.44,
      0.21,
      0.09,
    ],
    // 8. Legitimate: Restaurant Dinner (₹3,850.00)
    [
      'TXN-BCH-008',
      75600,
      3850.0,
      0.08,
      -0.04,
      0.52,
      -0.02,
      0.14,
      -0.06,
      0.2,
      0.01,
      0.07,
      0.08,
      -0.04,
      0.32,
      0.12,
      0.22,
      -0.08,
      0.12,
      0.04,
      -0.03,
      0.01,
      -0.01,
      0.02,
      -0.03,
      0.06,
      -0.03,
      0.05,
      -0.01,
      0.01,
      0.0,
    ],
    // 9. Legitimate: Monthly OTT Subscription (₹799.00)
    [
      'TXN-BCH-009',
      18000,
      799.0,
      -0.02,
      0.01,
      0.72,
      -0.05,
      0.18,
      -0.02,
      0.15,
      0.03,
      0.06,
      0.02,
      -0.08,
      0.25,
      0.08,
      0.16,
      -0.02,
      0.09,
      0.01,
      -0.04,
      0.02,
      -0.01,
      0.01,
      -0.02,
      0.04,
      -0.01,
      0.03,
      -0.01,
      0.0,
      0.0,
    ],
    // 10. Medium-Risk: International Gaming Platform (₹8,900.00)
    [
      'TXN-BCH-010',
      82800,
      8900.0,
      -0.45,
      0.82,
      -0.62,
      1.85,
      -0.32,
      -0.21,
      -0.65,
      0.28,
      -0.45,
      -0.85,
      1.1,
      -1.35,
      0.05,
      -1.65,
      0.08,
      -0.85,
      -1.05,
      -0.38,
      0.22,
      0.19,
      0.14,
      -0.05,
      -0.09,
      0.06,
      0.08,
      0.11,
      0.04,
      0.02,
    ],
    // 11. Legitimate: Fuel Station (₹2,500.00)
    [
      'TXN-BCH-011',
      28800,
      2500.0,
      0.02,
      -0.01,
      0.45,
      0.12,
      -0.02,
      0.08,
      0.15,
      0.02,
      0.09,
      -0.05,
      0.15,
      0.28,
      0.08,
      0.2,
      0.09,
      0.05,
      -0.08,
      0.04,
      -0.01,
      0.02,
      -0.04,
      0.08,
      -0.03,
      0.09,
      -0.05,
      0.01,
      0.01,
      0.0,
    ],
    // 12. High-Risk Fraud: Rapid Outlier ATM Withdrawal (₹50,000.00)
    [
      'TXN-BCH-012',
      12600,
      50000.0,
      -1.85,
      2.4,
      -3.2,
      4.4,
      -1.5,
      -0.95,
      -3.4,
      1.25,
      -2.6,
      -4.6,
      3.6,
      -6.4,
      0.1,
      -8.1,
      -0.2,
      -3.9,
      -5.1,
      -1.8,
      0.9,
      0.7,
      0.6,
      -0.15,
      -0.28,
      0.18,
      0.28,
      0.38,
      0.18,
      0.07,
    ],
  ];

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Triggers a browser download of CSV string
 */
export function downloadCSV(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
