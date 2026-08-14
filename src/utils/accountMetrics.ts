import type { AccountMetrics, Account, Trade } from '../types';


// Cumulative trade P&L for the account's CURRENT cycle only. Every past
// trade still counts toward the raw sum (nothing is deleted on a payout
// reset), but cycleBaselinePnL — stamped at the moment of the last "Record
// Payout / Reset Cycle" action — is subtracted back out so current-cycle
// metrics (balance, progress bars, the P&L stat) read as if the account
// just restarted at its starting balance. Defaults to 0 for every account
// that has never been reset, so behavior is unchanged for LIVE/FUTURES/
// non-Funded CFD accounts.
export const getAccountCyclePnL = (account: Account, accountTrades: Trade[]): number => {
  const totalPnL = accountTrades.reduce((s, t) => s + t.profitLoss, 0);
  return totalPnL - (account.cycleBaselinePnL || 0);
};

export const calculateAccountMetrics = (
  account: Account,
  accountTrades: Trade[]
): AccountMetrics => {
  const startingBalance = account.startingBalance;
  const accountPnL = getAccountCyclePnL(account, accountTrades);
  const currentBalance = startingBalance + accountPnL;

  const tradingType = account.tradingAccountType || 'LIVE';
  const maxDrawdownAllowance = account.maxDrawdownAllowance || 0;

  let threshold = 0;
  let drawdownAmount = 0;
  let drawdownProgress = 0;
  let isBreached = false;
  let isLocked = false;
  let lockThreshold: number | undefined;

  let highestBalance = startingBalance;

  if (tradingType === 'FUTURES' && account.type === 'Funded' && maxDrawdownAllowance > 0) {
    // Funded stage uses a simpler running peak-equity trailing stop instead
    // of the Eval-stage day-by-day EOD tracking below — most funded futures
    // programs trail off live/intraday peak equity, not just close-of-day.
    // Scoped to trades since the last payout reset (cycleStartedAt) so a
    // reset genuinely restarts the trailing calculation from a flat peak.
    const cycleTrades = account.cycleStartedAt
      ? accountTrades.filter(t => new Date(t.timestamp).getTime() >= new Date(account.cycleStartedAt!).getTime())
      : accountTrades;
    const sortedCycleTrades = [...cycleTrades].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    let runningBalance = startingBalance;
    let peakEquity = startingBalance;
    for (const trade of sortedCycleTrades) {
      runningBalance += trade.profitLoss;
      peakEquity = Math.max(peakEquity, runningBalance);
    }

    const thresholdLockAmount = account.thresholdLockAmount ?? startingBalance;

    // Trailing minimum rises dollar-for-dollar with peak equity until it
    // clears thresholdLockAmount, then Math.min holds it there for good —
    // "rise while trailing, then lock" in a single expression.
    threshold = Math.min(thresholdLockAmount, peakEquity - maxDrawdownAllowance);
    isLocked = (peakEquity - maxDrawdownAllowance) >= thresholdLockAmount;
    lockThreshold = isLocked ? thresholdLockAmount : undefined;

    highestBalance = peakEquity;
    drawdownAmount = Math.max(0, highestBalance - currentBalance);
    drawdownProgress = Math.min((drawdownAmount / maxDrawdownAllowance) * 100, 100);
    isBreached = currentBalance <= threshold;

  } else if (tradingType === 'FUTURES' && maxDrawdownAllowance > 0) {
    const sortedTrades = [...accountTrades].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const tradesByDate = new Map<string, Trade[]>();
    for (const trade of sortedTrades) {
      const date = trade.date;
      if (!tradesByDate.has(date)) {
        tradesByDate.set(date, []);
      }
      tradesByDate.get(date)!.push(trade);
    }

    let runningBalance = startingBalance;
    let eodPeak = startingBalance;
    const dates = Array.from(tradesByDate.keys()).sort();

    for (const date of dates) {
      const dayTrades = tradesByDate.get(date)!;
      let intradayPeak = runningBalance;

      for (const trade of dayTrades) {
        runningBalance += trade.profitLoss;
        intradayPeak = Math.max(intradayPeak, runningBalance);
      }

      const currentThreshold = Math.max(eodPeak - maxDrawdownAllowance, startingBalance - maxDrawdownAllowance);
      if (runningBalance <= currentThreshold) {
        isBreached = true;
      }

      eodPeak = Math.max(eodPeak, intradayPeak);

      const profitCapTrigger = startingBalance + maxDrawdownAllowance;
      if (eodPeak >= profitCapTrigger) {
        isLocked = true;
        lockThreshold = startingBalance;
      }
    }

    highestBalance = Math.max(eodPeak, runningBalance, account.highestBalance || startingBalance);

    if (isLocked) {
      threshold = startingBalance;
    } else {
      const initialThreshold = startingBalance - maxDrawdownAllowance;
      threshold = Math.max(highestBalance - maxDrawdownAllowance, initialThreshold);
    }

    drawdownAmount = highestBalance - currentBalance;
    drawdownProgress = Math.min((drawdownAmount / maxDrawdownAllowance) * 100, 100);

    if (currentBalance <= threshold) {
      isBreached = true;
    }

  } else if (tradingType === 'CFD') {
    const fixedMin = account.fixedMinBalance || 0;
    threshold = fixedMin;
    drawdownAmount = Math.max(0, startingBalance - currentBalance);

    if (fixedMin > 0) {
      const allowance = startingBalance - fixedMin;
      drawdownProgress = allowance > 0
        ? Math.min((drawdownAmount / allowance) * 100, 100)
        : 0;
    }

    isBreached = currentBalance <= fixedMin;
    highestBalance = Math.max(startingBalance, currentBalance);

  } else {
    threshold = 0;
    drawdownAmount = Math.max(0, startingBalance - currentBalance);
    drawdownProgress = startingBalance > 0
      ? Math.min((drawdownAmount / startingBalance) * 100, 100)
      : 0;
    isBreached = currentBalance <= 0;
    highestBalance = Math.max(startingBalance, currentBalance);
  }

  const profitProgress = account.profitTarget && account.profitTarget > 0
    ? Math.min((accountPnL / account.profitTarget) * 100, 100)
    : 0;

  const bufferAvailable = currentBalance - threshold;

  return {
    currentBalance,
    highestBalance,
    threshold,
    drawdownAmount,
    drawdownProgress,
    profitProgress,
    isBreached,
    isLocked,
    lockThreshold,
    bufferAvailable,
  };
};

// Reusable modal backdrop
