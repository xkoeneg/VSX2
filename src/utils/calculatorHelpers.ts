import { sanitizeNumericInput } from './format';

export const sanitizeCalculatorValue = (value: string, allowNegative: boolean = true): string => {
  return sanitizeNumericInput(value, allowNegative);
};

// Tracks viewport width so we can compute responsive column counts
