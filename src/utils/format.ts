export const buildLiveTimestamp = (dateStr: string): string => {
  const now = new Date();
  const [year, month, day] = (dateStr || '').split('-').map(Number);
  const combined = (year && month && day)
    ? new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds())
    : now;
  return combined.toISOString();
};


export const formatCurrency = (value: number, blur: boolean = false) => {
  if (blur) return '****';
  const prefix = value >= 0 ? '+' : '-';
  return `${prefix}$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatCurrencyAbsolute = (value: number, blur: boolean = false) => {
  if (blur) return '****';
  return `$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Compact currency for very tight spaces (e.g. mobile calendar day cells) where
// a full "+$252,303.00" simply won't fit in a ~40px cell. Abbreviates thousands/
// millions instead of truncating mid-number.
export const formatCurrencyCompact = (value: number, blur: boolean = false) => {
  if (blur) return '****';
  const prefix = value >= 0 ? '+' : '-';
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${prefix}$${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  if (abs >= 1_000) return `${prefix}$${(abs / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}k`;
  return `${prefix}$${abs.toFixed(0)}`;
};

// ============================================================
// STRICT NUMERIC VALIDATION - Only allows numbers, single decimal, single negative
// ============================================================

/**
 * Strips all non-numeric characters except valid decimal point and negative sign.
 * Rules:
 * - Only digits 0-9 allowed
 * - Single decimal point allowed (not at start)
 * - Single negative sign allowed ONLY at the very beginning
 * - All letters and special symbols are completely stripped
 */
export const sanitizeNumericInput = (value: string, allowNegative: boolean = false): string => {
  let result = '';
  let hasDecimal = false;
  let hasNegative = false;

  for (let i = 0; i < value.length; i++) {
    const char = value[i];

    // Handle negative sign - only at the very beginning, only one allowed
    if (char === '-' && allowNegative && i === 0 && !hasNegative) {
      result += char;
      hasNegative = true;
      continue;
    }

    // Handle decimal point - only one allowed
    if (char === '.' && !hasDecimal) {
      result += char;
      hasDecimal = true;
      continue;
    }

    // Only digits 0-9 are allowed
    if (/[0-9]/.test(char)) {
      result += char;
    }
    // All other characters (letters, symbols, spaces) are completely ignored
  }

  return result;
};

/**
 * Parse sanitized numeric string to number.
 * Returns 0 for empty or invalid strings.
 */
export const parseFormattedPrice = (value: string): number => {
  const sanitized = sanitizeNumericInput(value, true);
  if (!sanitized || sanitized === '-' || sanitized === '.') return 0;
  return parseFloat(sanitized) || 0;
};

/**
 * Format number for display in input fields.
 */
export const formatPriceInput = (value: number): string => {
  if (value === 0) return '';
  return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 5 });
};

export const formatDate = (dateStr: string) => {
  const date = dateStr.length <= 10 ? new Date(`${dateStr}T00:00:00`) : new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const cn = (...classes: (string | boolean | undefined)[]) =>
  classes.filter(Boolean).join(' ');

// ==================== MT4/MT5 Trade Import: parsing helpers ====================
// Pure, framework-free functions that turn a raw .csv or .html file exported
// from MetaTrader 4/5's Account History ("Save as Report" / "Export to CSV")
// into a normalized list of trades. Broker report layouts vary slightly
// (MT4 vs MT5, terminal build, language pack), so columns are matched by
// keyword rather than fixed position, and duplicate headers (e.g. two
// "Price" or two "Time" columns for open vs close) are resolved positionally.

