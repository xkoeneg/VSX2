import type { TradingAccountType, SessionOption } from '../types';

export const TIMEFRAMES = ['Execution/Result', 'Daily', '4H', '1H', '30M', '15M', '5M', '1M'] as const;

export const ACCOUNT_TYPES = ['Eval', 'Phase 1', 'Phase 2', 'Funded', 'Custom Challenge'] as const;
export const TRADING_ACCOUNT_TYPES: TradingAccountType[] = ['CFD', 'LIVE', 'FUTURES', 'DEMO'];

export const PRESET_SYMBOLS = [
  { name: 'NASDAQ (NQ)', value: 'NQ' },
  { name: 'ES (S&P 500)', value: 'ES' },
  { name: 'Gold (XAUUSD)', value: 'XAUUSD' },
];

export const SESSION_OPTIONS: SessionOption[] = ['NYC', 'London', 'Asia', 'Pre-market Open'];

export const EMOTION_OPTIONS = ['Calm', 'FOMO', 'Revenge Trading', 'Greed', 'Impatient', 'Anxious', 'Confident', 'Hesitant'];

// Short lowercase labels for compact card badges (e.g. "nyc", "pre-market")
export const SESSION_SHORT_LABEL: Record<SessionOption, string> = {
  'NYC': 'nyc',
  'London': 'london',
  'Asia': 'asia',
  'Pre-market Open': 'pre-market',
};
