import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  Lock,
  Loader2,
  AlertCircle,
  ArrowLeft,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Target,
  Scale,
  BarChart3,
  Image as ImageIcon,
  Search,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { cn } from '../utils/format';
import { SessionBadge } from '../components/shared/SessionBadge';
import { SESSION_OPTIONS, SESSION_SHORT_LABEL } from '../constants/trading';

// ============================================================================
// PreviewScreen — the `/preview/[user_id]` destination.
//
// Deliberately NOT built on top of `useAppContext()` / TradesScreen /
// CalendarScreen / TradeModals. Those are wired to one enormous app-wide
// context (state + every CRUD handler for the whole app in one object) that
// assumes an authenticated owner is editing their own data. Bolting a
// "read-only, someone else's data, no session" mode onto that would mean
// either forking that context or threading a `readOnly` flag through
// hundreds of call sites blind, which is a good way to accidentally leave
// an edit path reachable. This screen fetches its own data (via the
// `get_preview_journal` RPC — see sql/001_preview_access.sql) and renders
// it with its own minimal, non-editable UI instead.
//
// Privacy filter note: timeframe/mistakes/lessons notes aren't hidden by
// this component — they're never fetched in the first place. The RPC
// simply doesn't select those columns for anon callers, so there's nothing
// here to accidentally leak via devtools/network tab.
// ============================================================================

type PreviewTimeframe = {
  name: string;
  images: { url: string }[];
};

type PreviewTrade = {
  id: string;
  /** Stable, DB-assigned trade number (e.g. the `trade_number` column).
   *  NOT used for the #42-style badge — see chronologicalNumberById below
   *  for why — but kept on the type in case another part of this screen
   *  ever wants the raw per-account/DB value specifically. */
  tradeNumber?: number;
  /** Row insert timestamp — used only as the tiebreaker when two trades
   *  share the same `date`, to match the main app's
   *  `trade_date DESC, created_at DESC` ordering. Optional for the same
   *  reason as `tradeNumber` above. */
  createdAt?: string;
  accountId: string | null;
  symbol: string;
  date: string;
  session: string | null;
  startTime: string | null;
  endTime: string | null;
  entryPrice: number | null;
  stopLoss: number | null;
  slPoints: number | null;
  takeProfit: number | null;
  tpPoints: number | null;
  riskAmount: number | null;
  profitLoss: number;
  setupTypes: string[];
  confluences: string[];
  mistakes: string[];
  rulesFollowed: 'followed' | 'broken' | null;
  timeframes: PreviewTimeframe[];
};

type PreviewAccount = {
  id: string;
  name: string;
  type: string | null;
};

type PreviewData = {
  profile: { displayName: string | null; avatarUrl: string | null; avatarPresetColor: string | null };
  accounts: PreviewAccount[];
  trades: PreviewTrade[];
};

// 'investor' sees real dollars everywhere. 'friend' never sees a raw dollar
// figure — only R-multiples (reward as a multiple of risk) and percentages,
// so a shared friend link can't be used to back into account size. Resolved
// server-side per session (see verify_viewer_access / redeem_preview_access
// in sql/002_viewer_two_factor.sql) and threaded down as a prop; nothing
// here re-derives it from data the client already has.
type ViewMode = 'investor' | 'friend';

function formatMoney(value: number): string {
  const sign = value < 0 ? '-' : '';
  return `${sign}$${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatR(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}R`;
}

// Per-trade R-multiple: profit/loss expressed as a multiple of the amount
// risked. null when the trade has no logged risk amount to divide by —
// callers should fall back to a masked placeholder rather than 0, since 0R
// would misleadingly read as a breakeven trade.
function getTradeR(trade: PreviewTrade): number | null {
  return trade.riskAmount && trade.riskAmount > 0 ? trade.profitLoss / trade.riskAmount : null;
}

// The single shared masking rule: investor mode always gets the real
// dollar amount; friend mode gets the R-multiple (or a masked placeholder
// if this particular trade has no risk amount logged), never the dollars.
function formatPnl(viewMode: ViewMode, dollarValue: number, rMultiple: number | null): string {
  if (viewMode === 'investor') return formatMoney(dollarValue);
  return rMultiple !== null ? formatR(rMultiple) : '••••';
}

// Compact variant for tight mobile calendar cells — mirrors the main app's
// formatCurrencyCompact (e.g. $1.2k instead of $1,200.00).
function formatMoneyCompact(value: number): string {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  if (abs >= 1000) {
    return `${sign}$${(abs / 1000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}k`;
  }
  return `${sign}$${abs.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}


function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// Converts a trade's `startTime` into minutes-since-midnight so same-day
// trades can be ordered by when they were actually entered — this is the
// real tiebreaker the trade-entry modal already captures (e.g. "9:35 PM"),
// so we don't need a DB `created_at` column after all. Handles both
// 24-hour ("21:35") and 12-hour ("9:35 PM" / "9:35pm") strings defensively,
// since the exact stored format wasn't confirmed. Returns null if the
// string can't be parsed, so callers can fall back gracefully instead of
// silently mis-sorting.
function parseTimeToMinutes(time: string | null): number | null {
  if (!time) return null;
  const trimmed = time.trim();
  // 12-hour: "9:35 PM", "9:35pm", "09:35 AM"
  const twelveHour = trimmed.match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
  if (twelveHour) {
    let hours = parseInt(twelveHour[1], 10);
    const minutes = parseInt(twelveHour[2], 10);
    const isPM = twelveHour[3].toLowerCase() === 'pm';
    if (hours === 12) hours = 0;
    if (isPM) hours += 12;
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours * 60 + minutes;
  }
  // 24-hour: "21:35", "09:35", optionally with seconds "21:35:00"
  const twentyFourHour = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (twentyFourHour) {
    const hours = parseInt(twentyFourHour[1], 10);
    const minutes = parseInt(twentyFourHour[2], 10);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours * 60 + minutes;
  }
  return null;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ============================================================================
// TradeAnalyticsCard — ported from TradesScreen.tsx's header analytics card
// (Net P&L, Win Rate donut, Win/Loss/BE breakdown, Profit Factor + Avg
// Win/Loss, Total Trades). Adapted for this read-only screen:
//   - takes PreviewTrade[] instead of Trade[]
//   - no privacyMode (this screen has no privacy toggle — numbers are
//     always shown as-is) and no theme switching (always dark)
//   - uses the local formatMoney() helper instead of formatCurrency()
// ============================================================================

type PreviewTradeFilter = 'all' | 'profit' | 'loss' | 'breakeven';

interface TradeAnalyticsCardProps {
  trades: PreviewTrade[];
  stats: {
    totalTrades: number;
    winRate: number;
    profitFactor: number;
    avgWin: number;
    avgLoss: number;
  };
  tradeFilter: PreviewTradeFilter;
  setTradeFilter: React.Dispatch<React.SetStateAction<PreviewTradeFilter>>;
  viewMode: ViewMode;
}

function TradeAnalyticsCard({ trades, stats, tradeFilter, setTradeFilter, viewMode }: TradeAnalyticsCardProps) {
  const total = trades.length;
  const wins = trades.filter(t => t.profitLoss >= 10).length;
  const losses = trades.filter(t => t.profitLoss <= -10).length;
  const breakeven = total - wins - losses;
  const netPnl = trades.reduce((sum, t) => sum + t.profitLoss, 0);
  const isNetPositive = netPnl >= 0;

  // R-multiple equivalents of Net P&L / Avg Win / Avg Loss, for friend mode.
  // Trades with no logged risk amount simply don't contribute an R value —
  // there's no dollar amount to fall back to reveal.
  const tradesWithR = trades.map(t => ({ trade: t, r: getTradeR(t) })).filter(x => x.r !== null) as { trade: PreviewTrade; r: number }[];
  const netR = tradesWithR.reduce((sum, x) => sum + x.r, 0);
  const winningR = tradesWithR.filter(x => x.trade.profitLoss > 0);
  const losingR = tradesWithR.filter(x => x.trade.profitLoss < 0);
  const avgWinR = winningR.length > 0 ? winningR.reduce((s, x) => s + x.r, 0) / winningR.length : 0;
  const avgLossR = losingR.length > 0 ? Math.abs(losingR.reduce((s, x) => s + x.r, 0)) / losingR.length : 0;

  // Win Rate donut — single teal arc over a dark track, rounded cap,
  // starting at 12 o'clock and sweeping clockwise by win rate %.
  const winRateWins = trades.filter(t => t.profitLoss > 0).length;
  const winRatePct = total > 0 ? (winRateWins / total) * 100 : 0;
  const winRateWithBEPct = total > 0 ? (wins / total) * 100 : 0;
  const r = 42;
  const strokeWidth = 12;
  const c = 2 * Math.PI * r;
  const winRateArc = total > 0 ? (winRatePct / 100) * c : 0;

  const cardClass = "bg-zinc-900/50 border border-white/10 rounded-xl p-6 backdrop-blur-md hover:border-white/20 transition-all flex items-center gap-3 [container-type:inline-size]";
  const iconCircleClass = "p-3 rounded-xl flex-shrink-0";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
      {/* Card 1 — Net P&L */}
      <div className={cardClass}>
        <div className={cn(iconCircleClass, isNetPositive ? "bg-emerald-500/10" : "bg-rose-500/10")}>
          {isNetPositive
            ? <TrendingUp className="w-5 h-5 text-emerald-400" />
            : <TrendingDown className="w-5 h-5 text-rose-500" />}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase">{viewMode === 'investor' ? 'Net P&L' : 'Net R'}</p>
          <p className={cn("text-xl font-bold tabular-nums leading-tight", isNetPositive ? 'text-emerald-400' : 'text-rose-500')}>
            {viewMode === 'investor' ? formatMoney(netPnl) : formatR(netR)}
          </p>
        </div>
      </div>

      {/* Card 2 — Win Rate donut */}
      <div className={cardClass}>
        <div className="relative w-11 h-11 -ml-1.5 flex-shrink-0">
          <svg viewBox="0 0 112 112" className="w-full h-full -rotate-90">
            <circle cx="56" cy="56" r={r} fill="none" stroke="rgb(39,39,42)" strokeWidth={strokeWidth} />
            {winRateArc > 0 && (
              <circle
                cx="56" cy="56" r={r} fill="none" stroke="rgb(16,185,129)" strokeWidth={strokeWidth}
                strokeDasharray={`${winRateArc} ${c - winRateArc}`} strokeLinecap="round"
              />
            )}
          </svg>
        </div>
        <div className="min-w-0 -ml-1">
          <p className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase">Win Rate</p>
          <div className="flex items-baseline gap-1.5">
            <p className="text-xl font-bold tabular-nums leading-tight text-white">
              {total > 0 ? `${winRatePct.toFixed(1)}%` : '—'}
            </p>
            <p className="text-[11px] text-zinc-500 font-medium tabular-nums leading-tight" title="Win rate counting breakeven trades as wins">
              {total > 0 ? `${winRateWithBEPct.toFixed(1)}% w/ BE` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Card 3 — Win / Loss / Break-Even breakdown; chips stay clickable
          against `tradeFilter`, narrowing the Trade History list below. */}
      <div className={cardClass}>
        <div className={cn(iconCircleClass, "bg-white/5")}>
          <Scale className="w-5 h-5 text-zinc-400" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase">Win / Loss Ratio</p>
          <p className="text-[clamp(0.75rem,7cqw,1.25rem)] font-bold tabular-nums leading-tight whitespace-nowrap">
            <button
              type="button"
              onClick={() => setTradeFilter(prev => prev === 'profit' ? 'all' : 'profit')}
              className={cn(
                "text-emerald-400 rounded transition-colors",
                tradeFilter === 'profit' ? 'ring-1 ring-emerald-500/40 bg-emerald-500/10 px-0.5' : 'hover:text-emerald-300'
              )}
            >
              {wins}W
            </button>
            <span className="text-zinc-600 mx-0.5">-</span>
            <button
              type="button"
              onClick={() => setTradeFilter(prev => prev === 'loss' ? 'all' : 'loss')}
              className={cn(
                "text-rose-500 rounded transition-colors",
                tradeFilter === 'loss' ? 'ring-1 ring-rose-500/40 bg-rose-500/10 px-0.5' : 'hover:text-rose-400'
              )}
            >
              {losses}L
            </button>
            <span className="text-zinc-600 mx-0.5">-</span>
            <button
              type="button"
              onClick={() => setTradeFilter(prev => prev === 'breakeven' ? 'all' : 'breakeven')}
              className={cn(
                "text-zinc-400 rounded transition-colors",
                tradeFilter === 'breakeven' ? 'ring-1 ring-zinc-400/40 bg-zinc-400/10 px-0.5' : 'hover:text-zinc-300'
              )}
            >
              {breakeven}BE
            </button>
          </p>
        </div>
      </div>

      {/* Card 4 — Profit Factor / Avg Win & Loss */}
      <div className={cardClass}>
        <div className={cn(iconCircleClass, "bg-white/5")}>
          <Target className="w-5 h-5 text-zinc-400" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase">Profit Factor</p>
          <p className="text-[clamp(1rem,8cqw,1.25rem)] font-bold tabular-nums leading-tight text-white whitespace-nowrap">
            {total > 0 && isFinite(stats.profitFactor) ? stats.profitFactor.toFixed(2) : 'N/A'}
            <span className="text-[clamp(0.6rem,3cqw,0.75rem)] font-medium tabular-nums text-zinc-500 ml-1.5">
              {viewMode === 'investor' ? (
                <>
                  <span className="text-emerald-500">+{formatMoney(stats.avgWin)}</span>
                  <span className="mx-0.5">/</span>
                  <span className="text-rose-500">{formatMoney(-stats.avgLoss)}</span>
                </>
              ) : (
                <>
                  <span className="text-emerald-500">+{avgWinR.toFixed(2)}R</span>
                  <span className="mx-0.5">/</span>
                  <span className="text-rose-500">-{avgLossR.toFixed(2)}R</span>
                </>
              )}
            </span>
          </p>
        </div>
      </div>

      {/* Card 5 — Total Trades */}
      <div className={cardClass}>
        <div className={cn(iconCircleClass, "bg-indigo-500/10")}>
          <BarChart3 className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase">Total Trades</p>
          <p className="text-xl font-bold tabular-nums leading-tight text-white">{total}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PreviewFeaturedCard — ported 1:1 from TradesScreen.tsx's `TradeFeaturedCard`
// (the "gallery" trade card). Same markup/classNames as the original.
// Trimmed for this read-only screen:
//   - no tradeSelectMode / isSelected / checkbox overlay (nothing to select)
//   - no privacyMode (numbers always shown as-is, per this screen's convention)
//   - no trackingNumber badge (PreviewTrade has no trackingNumber field)
//   - uses PreviewTrade/PreviewAccount types, local formatMoney(), and
//     formatDateLabel() instead of formatCurrency()/formatDate()
// ============================================================================

interface PreviewFeaturedCardProps {
  trade: PreviewTrade;
  account: PreviewAccount | undefined;
  displayNumber: number;
  onOpenDetail: (id: string) => void;
  viewMode: ViewMode;
}

function PreviewFeaturedCard({ trade, account, displayNumber, onOpenDetail, viewMode }: PreviewFeaturedCardProps) {
  const coverImage =
    trade.timeframes.find(tf => tf.name === 'Execution/Result')?.images[0]?.url ||
    trade.timeframes.flatMap(tf => tf.images)[0]?.url;
  const isWin = trade.profitLoss >= 0;
  const isBreakeven = Math.abs(trade.profitLoss) < 10;
  const outcomeCardClass = isBreakeven
    ? 'bg-zinc-800/50 group-hover:bg-zinc-800/70'
    : isWin
      ? 'bg-emerald-900 border-t-0 shadow-none group-hover:bg-emerald-800'
      : 'bg-rose-900 border-t-0 shadow-none group-hover:bg-rose-800';
  const outcomeBorderClass = isBreakeven
    ? 'border-zinc-700 hover:border-zinc-500'
    : isWin
      ? 'border-emerald-800 hover:border-emerald-600'
      : 'border-rose-800 hover:border-rose-600';

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenDetail(trade.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "group h-full flex flex-col border rounded-xl overflow-hidden cursor-pointer bg-[#16181e] transition-transform transition-colors duration-200 ease-out min-w-0 shadow-[0_10px_30px_rgba(0,0,0,0.8)] transform-gpu backface-hidden will-change-transform",
        outcomeBorderClass,
        'hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.9)]'
      )}
    >
      <div className="aspect-video bg-zinc-800 flex items-center justify-center relative overflow-hidden flex-shrink-0">
        <span className="absolute top-2 left-2 z-10 flex items-center justify-center w-5 h-5 rounded bg-black/60 text-[10px] font-mono font-bold text-zinc-300 border border-white/10 backdrop-blur-md shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
          {displayNumber}
        </span>
        {coverImage ? (
          <img src={coverImage} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 transform-gpu" />
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-zinc-600">
            <ImageIcon className="w-7 h-7" />
            <span className="text-[10px]">No image</span>
          </div>
        )}
      </div>
      <div className={cn('p-3.5 min-w-0 flex-1 flex flex-col transition-colors duration-200', outcomeCardClass)}>
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold truncate tracking-tight text-sm min-w-0 text-white">{trade.symbol}</h4>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={cn('text-sm font-mono font-bold tracking-tight whitespace-nowrap', isBreakeven ? 'text-zinc-300' : isWin ? 'text-green-300' : 'text-red-300')}>
              {formatPnl(viewMode, trade.profitLoss, getTradeR(trade))}
            </span>
          </div>
        </div>
        <p className="text-xs text-zinc-300 truncate mt-0.5">{account?.name}</p>
        {/* Fixed-height row so cards without a session still take up the same
            vertical space as cards that have one — keeps every card (and every
            grid row) the exact same height. */}
        <div className="flex items-center mt-2 min-h-[20px]">
          {trade.session && <SessionBadge value={trade.session} size="sm" />}
        </div>
        {/* Fixed-height footer row so cards without setup badges still match
            the height of cards that have them. */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-2 min-h-[26px] min-w-0">
          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
            {trade.setupTypes.slice(0, 1).map(s => (
              <span key={s} className="px-1.5 py-0.5 bg-zinc-800/80 border border-zinc-700/50 rounded text-[10px] text-zinc-300 whitespace-nowrap">{s}</span>
            ))}
          </div>
          <span className="text-[11px] text-zinc-400 font-medium whitespace-nowrap flex-shrink-0">{formatDateLabel(trade.date)}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PreviewTradeRow — ported 1:1 from TradesScreen.tsx's `TradeRow` (the
// dense table row shown in the "table" view). Same markup/classNames/column
// order as the original. Trimmed for this read-only screen the same way
// PreviewFeaturedCard above is:
//   - no privacyMode (numbers always shown as-is)
//   - no trackingNumber badge (PreviewTrade has no trackingNumber field)
//   - uses PreviewTrade/PreviewAccount types, local formatMoney(), and
//     formatDateLabel() instead of formatCurrency()/formatCurrencyAbsolute()/formatDate()
// ============================================================================

interface PreviewTradeRowProps {
  trade: PreviewTrade;
  account: PreviewAccount | undefined;
  displayNumber: number;
  onOpenDetail: (id: string) => void;
  viewMode: ViewMode;
}

function PreviewTradeRow({ trade, account, displayNumber, onOpenDetail, viewMode }: PreviewTradeRowProps) {
  const isWin = trade.profitLoss >= 0;
  const isBreakeven = Math.abs(trade.profitLoss) < 10;
  const rowRR = trade.riskAmount && trade.riskAmount > 0 ? trade.profitLoss / trade.riskAmount : null;
  const position = trade.profitLoss >= 0 ? 'Long' : 'Short';
  return (
    <tr
      onClick={() => onOpenDetail(trade.id)}
      className="border-b border-zinc-800/70 hover:bg-white/[0.02] cursor-pointer transition-colors"
    >
      <td className="px-3 py-2.5">
        <span className={cn(
          'text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide',
          isBreakeven ? 'bg-zinc-700/40 text-zinc-300' : isWin ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/10 text-rose-500'
        )}>
          {isBreakeven ? 'B/E' : isWin ? 'Win' : 'Loss'}
        </span>
      </td>
      <td className="px-3 py-2.5 text-sm text-zinc-400 whitespace-nowrap">{formatDateLabel(trade.date)}</td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm text-zinc-500 font-mono flex-shrink-0">{displayNumber}</span>
        </div>
      </td>
      <td className="px-3 py-2.5 text-sm text-zinc-400">
        {trade.session ? (SESSION_SHORT_LABEL[trade.session as keyof typeof SESSION_SHORT_LABEL] || trade.session.toLowerCase()) : '-'}
      </td>
      <td className="px-3 py-2.5 text-sm text-zinc-400">{position}</td>
      <td className="px-3 py-2.5 text-sm font-mono text-right font-bold whitespace-nowrap">
        {viewMode === 'investor' ? (
          <span className={isWin ? 'text-emerald-400' : 'text-rose-500'}>{formatMoney(trade.profitLoss)}</span>
        ) : (
          <span className="text-zinc-600" title="Hidden in Public View — see R Multiple">••••</span>
        )}
      </td>
      <td className="px-3 py-2.5 text-xs font-medium text-right whitespace-nowrap">
        {rowRR !== null ? (
          <span className={cn('px-1.5 py-0.5 rounded border', rowRR >= 1 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : rowRR >= 0 ? 'text-zinc-300 border-zinc-700 bg-zinc-800/60' : 'text-rose-500 border-rose-500/30 bg-rose-500/10')}>
            {rowRR >= 1 ? '+' : ''}{rowRR.toFixed(2)}R
          </span>
        ) : '-'}
      </td>
      <td className="px-3 py-2.5 text-sm text-zinc-400 text-right whitespace-nowrap">
        {viewMode === 'friend'
          ? (trade.riskAmount && trade.riskAmount > 0 ? <span className="text-zinc-600">••••</span> : '-')
          : (trade.riskAmount && trade.riskAmount > 0 ? formatMoney(trade.riskAmount) : '-')}
      </td>
      <td className="px-3 py-2.5 text-sm text-white font-semibold truncate max-w-[100px]">{trade.symbol}</td>
      <td className="px-3 py-2.5 text-sm text-zinc-400 truncate max-w-[120px]">{trade.setupTypes.join(', ') || '-'}</td>
      <td className="px-3 py-2.5 text-sm text-zinc-400 truncate max-w-[120px]">{account?.name || '-'}</td>
    </tr>
  );
}

interface PreviewScreenProps {
  userId: string;
  /** Short-lived, single-purpose token from LoginPage's "Have a Viewer
   *  Passcode?" modal (`/preview/[id]?access_token=...`) — see
   *  redeem_preview_access in sql/002_viewer_two_factor.sql. Two-factor
   *  auth (passcode + master password, rate-limited server-side) already
   *  happened on LoginPage; this screen's only job is to silently confirm
   *  the token, never to re-prompt. null means someone landed on
   *  /preview/[id] directly with no token — there's deliberately no
   *  passcode form here anymore to fall back to (that was the double-modal
   *  bug); they're sent back to sign in instead. */
  accessToken: string | null;
  /** Called when the viewer clicks "Exit Preview" — App.tsx wires this to strip the /preview path. */
  onExit: () => void;
}

type PreviewAuthStatus = 'redeeming' | 'ready' | 'expired' | 'error';

export function PreviewScreen({ userId, accessToken, onExit }: PreviewScreenProps) {
  const [status, setStatus] = useState<PreviewAuthStatus>('redeeming');
  const [data, setData] = useState<PreviewData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('friend');
  const [openTradeId, setOpenTradeId] = useState<string | null>(null);
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    let cancelled = false;

    async function redeemAndLoad() {
      if (!accessToken) {
        setStatus('expired');
        return;
      }
      setStatus('redeeming');
      try {
        // redeem_preview_access confirms the token server-side and, only on
        // success, hands back which passcode it corresponds to — that's
        // what lets this screen fetch the journal itself without ever
        // showing the visitor a second passcode prompt.
        const { data: redeemData, error: redeemError } = await supabase.rpc('redeem_preview_access', {
          p_owner_id: userId,
          p_access_token: accessToken,
        });
        if (redeemError) throw redeemError;
        if (!redeemData?.valid || !redeemData?.passcode || !redeemData?.view_mode) {
          if (!cancelled) setStatus('expired');
          return;
        }

        const { data: rpcData, error: rpcError } = await supabase.rpc('get_preview_journal', {
          p_user_id: userId,
          p_passcode: redeemData.passcode,
        });
        if (rpcError) throw rpcError;
        if (!rpcData || rpcData.ok !== true) {
          if (!cancelled) setStatus('expired');
          return;
        }

        if (cancelled) return;
        // Same-day trade ordering uses `startTime` (already returned by
        // this RPC) as the tiebreaker — see sortedTrades below. `createdAt`
        // is still optional/best-effort on top of that; if
        // `get_preview_journal` is ever updated to also select a real
        // `created_at` column, ordering will prefer it automatically.
        setData({
          profile: rpcData.profile,
          accounts: rpcData.accounts || [],
          trades: rpcData.trades || [],
        });
        setViewMode(redeemData.view_mode === 'investor' ? 'investor' : 'friend');
        setStatus('ready');
      } catch (err) {
        console.error('Preview access confirmation failed', err);
        if (!cancelled) setStatus('error');
      }
    }

    redeemAndLoad();
    return () => {
      cancelled = true;
    };
  }, [userId, accessToken]);

  if (status === 'redeeming') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0c0f] px-4">
        <div className="flex flex-col items-center gap-3 text-zinc-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p className="text-sm">Confirming access…</p>
        </div>
      </div>
    );
  }

  if (status === 'expired' || status === 'error') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0c0f] px-4 py-10">
        <div className="w-full max-w-sm bg-zinc-950/85 backdrop-blur-2xl border border-zinc-800/80 shadow-2xl rounded-2xl p-6 sm:p-7 text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Lock className="w-5 h-5 text-zinc-500" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-white">
            {status === 'expired' ? 'Link expired or invalid' : 'Something went wrong'}
          </h2>
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2.5 text-sm text-red-300 text-left">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              {status === 'expired'
                ? 'This preview link is no longer valid. Ask the owner to resend it, or sign in again with the passcode and master password.'
                : 'We had trouble confirming this link. Please try again.'}
            </span>
          </div>
          <button
            type="button"
            onClick={onExit}
            className="w-full mt-5 h-11 flex items-center justify-center gap-1.5 rounded-lg bg-zinc-100 text-zinc-900 text-sm font-medium hover:bg-emerald-500 hover:text-black transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <UnlockedPreview
      data={data}
      viewMode={viewMode}
      onExit={onExit}
      openTradeId={openTradeId}
      setOpenTradeId={setOpenTradeId}
      monthCursor={monthCursor}
      setMonthCursor={setMonthCursor}
    />
  );
}

// ----------------------------------------------------------------------------
// Everything below only ever renders once a valid access token has been
// confirmed server-side for this userId (see redeem_preview_access above).
// ----------------------------------------------------------------------------

function UnlockedPreview({
  data,
  viewMode,
  onExit,
  openTradeId,
  setOpenTradeId,
  monthCursor,
  setMonthCursor,
}: {
  data: PreviewData;
  viewMode: ViewMode;
  onExit: () => void;
  openTradeId: string | null;
  setOpenTradeId: (id: string | null) => void;
  monthCursor: Date;
  setMonthCursor: React.Dispatch<React.SetStateAction<Date>>;
}) {
  const displayName = data.profile.displayName || 'This Trader';
  const accountsById = useMemo(() => new Map(data.accounts.map(a => [a.id, a])), [data.accounts]);
  // Matches the main app's ordering. The previous version compared
  // `a.date < b.date ? 1 : -1`, which returns -1 for EVERY tied pair
  // instead of 0 — an invalid comparator that scrambled same-day trades
  // into an unpredictable order (this is what put -$51.77 ahead of
  // +$111.08 despite both being Aug 13).
  //
  // Tiebreak priority for same-day trades:
  //   1. `startTime` — the actual time entered in the trade modal (e.g.
  //      "9:35 PM"). This is real per-trade data already coming back from
  //      the RPC, so it doesn't require any backend change.
  //   2. `createdAt` — DB insert timestamp, if the RPC is ever updated to
  //      return it (currently undefined on every trade).
  //   3. Stable fallback — preserves the RPC's original array order if
  //      neither of the above can disambiguate (e.g. `startTime` wasn't
  //      logged for one of the trades).
  const sortedTrades = useMemo(
    () =>
      [...data.trades].sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? 1 : -1;

        const aMinutes = parseTimeToMinutes(a.startTime);
        const bMinutes = parseTimeToMinutes(b.startTime);
        if (aMinutes !== null && bMinutes !== null && aMinutes !== bMinutes) {
          return aMinutes < bMinutes ? 1 : -1;
        }

        if (a.createdAt && b.createdAt && a.createdAt !== b.createdAt) {
          return a.createdAt < b.createdAt ? 1 : -1;
        }

        return 0;
      }),
    [data.trades]
  );

  // Badge numbers (Top-Left Badge, matches the main app's fix): always
  // computed dynamically from `sortedTrades`, oldest = 1, newest = highest.
  //
  // Deliberately NOT `trade.tradeNumber` anymore. That field is sourced
  // from the DB's static `trade_number`/`absoluteTradeNumber` column —
  // stamped once at creation/import time as an insertion-order counter —
  // which is exactly the bug the main app just fixed (see useAppState.tsx:
  // getDisplayTradeNumber). Preferring it here (`trade.tradeNumber ?? ...`)
  // was quietly reintroducing the same "#8, #7 ... #3, #2, #1 ... #50, #49"
  // bug on this screen, since the RPC does populate that stale column now.
  // Computing it fresh from `sortedTrades` every time — independent of any
  // stored counter, insertion order, or import order — keeps this screen's
  // numbering self-correcting the same way the main app's now is.
  const chronologicalNumberById = useMemo(() => {
    const map = new Map<string, number>();
    const total = sortedTrades.length;
    sortedTrades.forEach((t, i) => map.set(t.id, total - i));
    return map;
  }, [sortedTrades]);

  const getDisplayNumber = (trade: PreviewTrade) =>
    chronologicalNumberById.get(trade.id) ?? 0;

  const stats = useMemo(() => {
    const total = data.trades.length;
    const winningTrades = data.trades.filter(t => t.profitLoss > 0);
    const losingTrades = data.trades.filter(t => t.profitLoss < 0);
    const wins = winningTrades.length;
    const totalPnl = data.trades.reduce((sum, t) => sum + t.profitLoss, 0);
    const grossWin = winningTrades.reduce((s, t) => s + t.profitLoss, 0);
    const grossLoss = Math.abs(losingTrades.reduce((s, t) => s + t.profitLoss, 0));
    const winRate = total > 0 ? (wins / total) * 100 : 0;
    const avgWin = winningTrades.length > 0 ? grossWin / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? grossLoss / losingTrades.length : 0;
    // Matches the main app's card: Profit Factor here is avg win ÷ avg
    // loss (the same two numbers shown right below it), NOT gross total
    // win ÷ gross total loss. The two only agree when win count === loss
    // count — using the gross-total ratio is what produced 1.73 instead of
    // 0.96 when win/loss counts differ.
    const profitFactor = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0;
    return { total, totalTrades: total, winRate, totalPnl, profitFactor, avgWin, avgLoss };
  }, [data.trades]);

  const [tradeFilter, setTradeFilter] = useState<PreviewTradeFilter>('all');

  // Extra filter bar — mirrors TradesScreen.tsx's Database view filters
  // (dbSearch / dbAccountFilter / dbSessionFilter / dbOutcomeFilter).
  // Outcome is rendered as its own "All Outcomes" dropdown here (matching
  // TradesScreen 1:1) but bound to the same `tradeFilter` state the
  // analytics card's W/L/BE chips already control, so both stay in sync
  // instead of fighting over two separate variables. No Rules filter here —
  // rules-followed/broken is intentionally never surfaced on this read-only
  // screen (see PreviewTrade type note and PreviewTradeDetail below).
  const [dbSearch, setDbSearch] = useState('');
  const [dbAccountFilter, setDbAccountFilter] = useState('all');
  const [dbSessionFilter, setDbSessionFilter] = useState('all');

  const activeDbFilterCount =
    (dbSearch.trim() ? 1 : 0) +
    (dbAccountFilter !== 'all' ? 1 : 0) +
    (dbSessionFilter !== 'all' ? 1 : 0) +
    (tradeFilter !== 'all' ? 1 : 0);

  const resetDbFilters = () => {
    setDbSearch('');
    setDbAccountFilter('all');
    setDbSessionFilter('all');
    setTradeFilter('all');
  };

  const filteredSortedTrades = useMemo(() => {
    const q = dbSearch.trim().toLowerCase();
    return sortedTrades.filter(t => {
      if (tradeFilter === 'profit' && !(t.profitLoss >= 10)) return false;
      if (tradeFilter === 'loss' && !(t.profitLoss <= -10)) return false;
      if (tradeFilter === 'breakeven' && !(t.profitLoss > -10 && t.profitLoss < 10)) return false;
      if (dbAccountFilter !== 'all' && t.accountId !== dbAccountFilter) return false;
      if (dbSessionFilter !== 'all' && t.session !== dbSessionFilter) return false;
      if (q) {
        const haystack = [t.symbol, ...t.setupTypes, ...t.confluences].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [sortedTrades, tradeFilter, dbAccountFilter, dbSessionFilter, dbSearch]);

  // Table pagination — mirrors TradesScreen.tsx's Database view (dbPage /
  // dbPageCount / dbPagedTrades against DB_PAGE_SIZE), a fixed page of rows
  // with Prev/Next controls instead of an internally-scrolling table.
  const TABLE_PAGE_SIZE = 20;
  const [tablePage, setTablePage] = useState(0);
  const tablePageCount = Math.max(1, Math.ceil(filteredSortedTrades.length / TABLE_PAGE_SIZE));
  const pagedTableTrades = useMemo(
    () => filteredSortedTrades.slice(tablePage * TABLE_PAGE_SIZE, (tablePage + 1) * TABLE_PAGE_SIZE),
    [filteredSortedTrades, tablePage]
  );
  // Snap back to page 1 whenever the filtered set changes (filter toggle,
  // etc.) so we never get stuck on a now-out-of-range page.
  useEffect(() => {
    setTablePage(0);
  }, [tradeFilter, dbAccountFilter, dbSessionFilter, dbSearch]);

  const dailyStats = useMemo(() => {
    // rSum/rCount let the calendar show a meaningful "total R for the day"
    // in friend mode instead of a raw dollar figure — rCount only counts
    // trades that actually had a risk amount logged, so a day with no
    // risk-logged trades can fall back to a plain masked cell instead of a
    // misleading 0R.
    const map = new Map<string, { pnl: number; trades: number; rSum: number; rCount: number }>();
    for (const t of data.trades) {
      const key = t.date?.slice(0, 10);
      if (!key) continue;
      const r = getTradeR(t);
      const existing = map.get(key);
      if (existing) {
        existing.pnl += t.profitLoss;
        existing.trades += 1;
        if (r !== null) {
          existing.rSum += r;
          existing.rCount += 1;
        }
      } else {
        map.set(key, { pnl: t.profitLoss, trades: 1, rSum: r ?? 0, rCount: r !== null ? 1 : 0 });
      }
    }
    return map;
  }, [data.trades]);

  const openTrade = openTradeId ? data.trades.find(t => t.id === openTradeId) || null : null;

  return (
    <div className="min-h-screen w-full bg-[#0d0f12] text-white">
      {/* Read-only banner — always visible, never scrolls away, matches the
          "Exit Preview" requirement in the spec. No sidebar toggle needed
          since there's no sidebar in this layout. */}
      <div className="sticky top-0 z-30 bg-amber-500/10 border-b border-amber-500/30 backdrop-blur-sm">
        <div className="px-4 py-2.5 flex items-center justify-between gap-3">
          <p className="text-sm text-amber-200 flex items-center gap-2 min-w-0">
            <span className="flex-shrink-0">👀</span>
            <span className="truncate">
              Viewing <span className="font-semibold text-amber-100">{displayName}'s</span> Journal
              <span className="hidden sm:inline"> (Read-Only Mode)</span>
            </span>
            <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-white/10 text-amber-100 border border-white/10">
              {viewMode === 'investor' ? 'Investor View' : 'Public View'}
            </span>
          </p>
          <button
            type="button"
            onClick={onExit}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900/80 text-zinc-200 hover:bg-zinc-800 border border-zinc-700 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Exit Preview
          </button>
        </div>
      </div>

      {/* Single-column, full-width, vertically scrolling feed. Section order
          is fixed per spec: profile header, then Calendar, then Stats, then
          Trade History — no tabs, nothing to switch between. */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Profile header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden flex-shrink-0">
            {data.profile.avatarUrl ? (
              <img src={data.profile.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-semibold text-zinc-300">{getInitials(displayName)}</span>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold truncate">{displayName}'s Trading Journal</h1>
            <p className="text-xs text-zinc-500">Read-only preview — no edit access, personal notes hidden</p>
          </div>
        </div>

        {/* Section 1: Performance Calendar (top) */}
        <MonthCalendar monthCursor={monthCursor} setMonthCursor={setMonthCursor} dailyStats={dailyStats} viewMode={viewMode} />

        {/* Section 2: Analytics / stats cards (middle) — no edit actions
            anywhere on this screen. Ported from TradesScreen's header
            analytics row (Net P&L, Win Rate donut, Win/Loss/BE breakdown,
            Profit Factor + Avg Win/Loss, Total Trades). The W/L/BE chips
            stay clickable and narrow the Trade History list below. */}
        <TradeAnalyticsCard
          trades={data.trades}
          stats={stats}
          tradeFilter={tradeFilter}
          setTradeFilter={setTradeFilter}
          viewMode={viewMode}
        />
        {tradeFilter !== 'all' && (
          <div className="flex items-center gap-2 -mt-4">
            <span className="text-xs text-zinc-500">
              Showing only {tradeFilter === 'profit' ? 'wins' : tradeFilter === 'loss' ? 'losses' : 'breakeven trades'}
            </span>
            <button
              type="button"
              onClick={() => setTradeFilter('all')}
              className="text-xs text-zinc-500 hover:text-white underline transition-colors"
            >
              Clear
            </button>
          </div>
        )}

        {/* Section 3: Trade History (bottom) — gallery view, ported 1:1 from
            TradesScreen.tsx's "TOP SECTION — Featured Gallery Grid" scrollable
            frame (Trade History overview): fixed-height frame, scrolls
            internally instead of growing the page, same shadow/scrollbar
            treatment. Renders PreviewFeaturedCard (the read-only PreviewTrade
            port of TradeFeaturedCard) instead of TradeFeaturedCard. */}
        <div>
          <h2 className="text-sm font-medium text-zinc-400 mb-3">Trade History</h2>

          {/* Filter bar — ported 1:1 from TradesScreen.tsx's Database view
              filter bar: same input/select styling and Clear pill. Account
              filter uses a plain <select> here (vs. the main app's
              multi-select dropdown) since this screen only ever needs a
              single account at a time. Outcome isn't duplicated here — the
              analytics card's W/L/BE chips above already drive `tradeFilter`,
              which this bar's results already respect. */}
          <div className="flex items-center gap-2 flex-wrap p-3 bg-zinc-900/40 border border-zinc-800/80 rounded-xl mb-4">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              <input
                type="text"
                value={dbSearch}
                onChange={(e) => setDbSearch(e.target.value)}
                placeholder="Search trades..."
                className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
            <select
              value={dbAccountFilter}
              onChange={(e) => setDbAccountFilter(e.target.value)}
              className="px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-indigo-500/50 transition-colors cursor-pointer"
            >
              <option value="all">All Accounts</option>
              {data.accounts.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <select
              value={dbSessionFilter}
              onChange={(e) => setDbSessionFilter(e.target.value)}
              className="px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-indigo-500/50 transition-colors cursor-pointer"
            >
              <option value="all">All Sessions</option>
              {SESSION_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={tradeFilter}
              onChange={(e) => setTradeFilter(e.target.value as PreviewTradeFilter)}
              className="px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-indigo-500/50 transition-colors cursor-pointer"
            >
              <option value="all">All Outcomes</option>
              <option value="profit">Profit</option>
              <option value="loss">Loss</option>
              <option value="breakeven">Breakeven</option>
            </select>
            {activeDbFilterCount > 0 && (
              <button
                type="button"
                onClick={resetDbFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-xs text-zinc-400 hover:text-white transition-colors flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
                Clear ({activeDbFilterCount})
              </button>
            )}
          </div>

          <p className="text-sm text-zinc-500 mb-3">
            {filteredSortedTrades.length} {filteredSortedTrades.length === 1 ? 'trade' : 'trades'}
          </p>

          {filteredSortedTrades.length === 0 ? (
            <p className="text-sm text-zinc-600 py-8 text-center">
              {sortedTrades.length === 0 ? 'No trades to show yet.' : 'No trades match this filter.'}
            </p>
          ) : (
            <div className="space-y-4">
              <div
                className="preview-gallery-scroll bg-zinc-900/40 border border-zinc-800/80 rounded-2xl max-h-[520px] overflow-y-auto overscroll-contain scroll-smooth p-5 shadow-[0_20px_45px_rgba(0,0,0,0.5),inset_0_2px_12px_rgba(0,0,0,0.25)]"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {filteredSortedTrades.map(trade => (
                    <PreviewFeaturedCard
                      key={trade.id}
                      trade={trade}
                      account={trade.accountId ? accountsById.get(trade.accountId) : undefined}
                      displayNumber={getDisplayNumber(trade)}
                      onOpenDetail={setOpenTradeId}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              </div>

              {/* Table view — ported 1:1 from TradesScreen.tsx's
                  "Full-page table" (dbViewMode === 'table') branch: same
                  column set/order, cell styling, and Prev/Next pagination
                  footer, rendering PreviewTradeRow (the read-only
                  PreviewTrade port of TradeRow) instead of TradeRow.
                  TABLE_PAGE_SIZE stands in for TradesScreen's DB_PAGE_SIZE
                  constant (defined in useAppState, not available here). */}
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px]">
                    <thead>
                      <tr className="border-b border-zinc-800/70 text-left bg-white/[0.02]">
                        <th className="px-3 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Outcome</th>
                        <th className="px-3 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Date</th>
                        <th className="px-3 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Trade #</th>
                        <th className="px-3 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Session</th>
                        <th className="px-3 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Position</th>
                        <th className="px-3 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium text-right">Net P&amp;L</th>
                        <th className="px-3 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium text-right">R Multiple</th>
                        <th className="px-3 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium text-right">Risk ($)</th>
                        <th className="px-3 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Symbol</th>
                        <th className="px-3 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Strategy</th>
                        <th className="px-3 py-2.5 text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Account</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedTableTrades.map(trade => (
                        <PreviewTradeRow
                          key={trade.id}
                          trade={trade}
                          account={trade.accountId ? accountsById.get(trade.accountId) : undefined}
                          displayNumber={getDisplayNumber(trade)}
                          onOpenDetail={setOpenTradeId}
                          viewMode={viewMode}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {tablePageCount > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 flex-wrap gap-2">
                    <p className="text-xs text-zinc-500">
                      Page {tablePage + 1} of {tablePageCount} · {filteredSortedTrades.length} total
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setTablePage(p => Math.max(0, p - 1))}
                        disabled={tablePage === 0}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Prev
                      </button>
                      <span className="text-xs text-zinc-500 px-2">{tablePage + 1} / {tablePageCount}</span>
                      <button
                        type="button"
                        onClick={() => setTablePage(p => Math.min(tablePageCount - 1, p + 1))}
                        disabled={tablePage >= tablePageCount - 1}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {openTrade && (
        <PreviewTradeDetail
          trade={openTrade}
          accountName={openTrade.accountId ? accountsById.get(openTrade.accountId)?.name : undefined}
          onClose={() => setOpenTradeId(null)}
          viewMode={viewMode}
        />
      )}

      {/* Hides the gallery frame's scrollbar in Chrome/Safari — `scrollbarWidth`
          on the frame itself already handles Firefox. */}
      <style>{`
        .preview-gallery-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

// Mirrors the main app's `CalendarScreen` grid 1:1: same card chrome, cell
// borders/colors, P&L + trade-count badges, week recap column, legend, and
// nav control styling. Deliberately NOT reusing the main app's day-detail
// click-through (day cells here are read-only display, not clickable).
function MonthCalendar({
  monthCursor,
  setMonthCursor,
  dailyStats,
  viewMode,
}: {
  monthCursor: Date;
  setMonthCursor: React.Dispatch<React.SetStateAction<Date>>;
  dailyStats: Map<string, { pnl: number; trades: number; rSum: number; rCount: number }>;
  viewMode: ViewMode;
}) {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const pad = (n: number) => String(n).padStart(2, '0');

  type DayCell = { day: number | null; pnl: number; trades: number; rSum: number; rCount: number };

  const paddedDays: DayCell[] = [
    ...Array.from({ length: startWeekday }, (): DayCell => ({ day: null, pnl: 0, trades: 0, rSum: 0, rCount: 0 })),
    ...Array.from({ length: daysInMonth }, (_, i): DayCell => {
      const day = i + 1;
      const key = `${year}-${pad(month + 1)}-${pad(day)}`;
      const stat = dailyStats.get(key);
      return { day, pnl: stat?.pnl ?? 0, trades: stat?.trades ?? 0, rSum: stat?.rSum ?? 0, rCount: stat?.rCount ?? 0 };
    }),
  ];
  while (paddedDays.length % 7 !== 0) paddedDays.push({ day: null, pnl: 0, trades: 0, rSum: 0, rCount: 0 });
  const weeks: DayCell[][] = [];
  for (let i = 0; i < paddedDays.length; i += 7) weeks.push(paddedDays.slice(i, i + 7));

  const goToPrevMonth = () => setMonthCursor(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const goToNextMonth = () => setMonthCursor(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  return (
    <div className="space-y-3">
      {/* Month/year nav — identical control styling to the main app's Calendar header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white">Performance Calendar</p>
        <div className="flex items-center gap-2 h-9 select-none">
          <button
            type="button"
            onClick={goToPrevMonth}
            className="h-9 w-9 flex items-center justify-center flex-shrink-0 rounded-lg text-xs font-medium border border-zinc-700 bg-zinc-800 text-zinc-300 select-none transition-colors hover:bg-zinc-700 active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="h-9 flex items-center px-3 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300 select-none">
            <span className="text-xs font-medium whitespace-nowrap select-none">{monthNames[month]} {year}</span>
          </div>
          <button
            type="button"
            onClick={goToNextMonth}
            className="h-9 w-9 flex items-center justify-center flex-shrink-0 rounded-lg text-xs font-medium border border-zinc-700 bg-zinc-800 text-zinc-300 select-none transition-colors hover:bg-zinc-700 active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-3 sm:p-4">
        {/* Desktop/tablet: 8-column grid (7 days + Week recap column) */}
        <div className="hidden md:block">
          <div className="grid grid-cols-8 gap-2 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs text-zinc-500 font-medium py-2">{day}</div>
            ))}
            <div className="text-center text-xs text-zinc-500 font-medium py-2">Week</div>
          </div>

          <div className="space-y-2">
            {weeks.map((week, wi) => {
              const weekRealDays = week.filter(d => d.day !== null);
              const weekPnl = weekRealDays.reduce((s, d) => s + d.pnl, 0);
              const weekRSum = weekRealDays.reduce((s, d) => s + d.rSum, 0);
              const weekRCount = weekRealDays.reduce((s, d) => s + d.rCount, 0);
              const weekTradingDays = weekRealDays.filter(d => d.trades > 0).length;
              const hasWeekData = weekTradingDays > 0;
              return (
                <div key={wi} className="grid grid-cols-8 gap-2">
                  {week.map((day, di) => (
                    <div
                      key={di}
                      className={cn(
                        'rounded-xl p-2.5 min-h-[92px] flex flex-col justify-between min-w-0 transition-colors',
                        day.day === null ? 'bg-transparent' :
                        day.trades === 0 ? 'bg-zinc-800/30 border border-zinc-800/60' :
                        day.pnl > 0 ? 'bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25' :
                        day.pnl < 0 ? 'bg-rose-500/15 border border-rose-500/30 hover:bg-rose-500/25' :
                        'bg-zinc-800/40 border border-zinc-700/60'
                      )}
                    >
                      {day.day !== null && (
                        <>
                          <span className="text-xs text-zinc-500 font-medium">{day.day}</span>
                          {day.trades > 0 ? (
                            <div className="min-w-0">
                              <p className={cn('text-sm font-bold font-mono truncate', day.pnl > 0 ? 'text-emerald-400' : day.pnl < 0 ? 'text-rose-400' : 'text-zinc-300')}>
                                {viewMode === 'investor' ? formatMoney(day.pnl) : (day.rCount > 0 ? formatR(day.rSum) : '—')}
                              </p>
                              <p className="text-[10px] text-zinc-500 mt-0.5">{day.trades} trade{day.trades !== 1 ? 's' : ''}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-700">—</span>
                          )}
                        </>
                      )}
                    </div>
                  ))}

                  {/* Week recap cell */}
                  <div className={cn(
                    'rounded-xl p-2.5 min-h-[92px] flex flex-col items-center justify-center min-w-0 border',
                    !hasWeekData ? 'bg-zinc-900/40 border-zinc-800/50' :
                    weekPnl > 0 ? 'bg-emerald-500/10 border-emerald-500/25' :
                    weekPnl < 0 ? 'bg-rose-500/10 border-rose-500/25' :
                    'bg-zinc-800/40 border-zinc-700/60'
                  )}>
                    {hasWeekData ? (
                      <>
                        <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Week {wi + 1}</p>
                        <p className={cn('text-sm font-bold font-mono truncate', weekPnl > 0 ? 'text-emerald-400' : weekPnl < 0 ? 'text-rose-400' : 'text-zinc-300')}>
                          {viewMode === 'investor' ? formatMoney(weekPnl) : (weekRCount > 0 ? formatR(weekRSum) : '—')}
                        </p>
                        <p className="text-[10px] text-zinc-600">{weekTradingDays} day{weekTradingDays !== 1 ? 's' : ''}</p>
                      </>
                    ) : (
                      <span className="text-xs text-zinc-700">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile: 7-column grid; Week recap collapses to a summary line under each week */}
        <div className="md:hidden">
          <div className="grid grid-cols-7 gap-1">
            {dayNames.map(day => (
              <div key={day} className="text-center text-[10px] text-zinc-500 font-medium py-1 truncate">{day.slice(0, 2)}</div>
            ))}
          </div>

          <div className="space-y-1 mt-1">
            {weeks.map((week, wi) => {
              const weekRealDays = week.filter(d => d.day !== null);
              const weekPnl = weekRealDays.reduce((s, d) => s + d.pnl, 0);
              const weekRSum = weekRealDays.reduce((s, d) => s + d.rSum, 0);
              const weekRCount = weekRealDays.reduce((s, d) => s + d.rCount, 0);
              const weekTradingDays = weekRealDays.filter(d => d.trades > 0).length;
              const hasWeekData = weekTradingDays > 0;
              return (
                <div key={wi} className="space-y-0.5">
                  <div className="grid grid-cols-7 gap-1">
                    {week.map((day, di) => (
                      <div
                        key={di}
                        className={cn(
                          'rounded-lg p-1 min-h-[44px] flex flex-col justify-between min-w-0 transition-colors',
                          day.day === null ? 'bg-transparent' :
                          day.trades === 0 ? 'bg-zinc-800/30 border border-zinc-800/60' :
                          day.pnl > 0 ? 'bg-emerald-500/15 border border-emerald-500/30' :
                          day.pnl < 0 ? 'bg-rose-500/15 border border-rose-500/30' :
                          'bg-zinc-800/40 border border-zinc-700/60'
                        )}
                      >
                        {day.day !== null && (
                          <>
                            <span className="text-[9px] text-zinc-500 font-medium">{day.day}</span>
                            {day.trades > 0 ? (
                              <p className={cn('text-[9px] font-bold font-mono truncate leading-tight', day.pnl > 0 ? 'text-emerald-400' : day.pnl < 0 ? 'text-rose-400' : 'text-zinc-300')}>
                                {viewMode === 'investor' ? formatMoneyCompact(day.pnl) : (day.rCount > 0 ? formatR(day.rSum) : '—')}
                              </p>
                            ) : (
                              <span className="text-[9px] text-zinc-700">—</span>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {hasWeekData && (
                    <div className="flex items-center justify-between px-1 text-[10px]">
                      <span className="text-zinc-500">Week {wi + 1} · {weekTradingDays} day{weekTradingDays !== 1 ? 's' : ''}</span>
                      <span className={cn('font-mono font-semibold', weekPnl > 0 ? 'text-emerald-400' : weekPnl < 0 ? 'text-rose-400' : 'text-zinc-400')}>
                        {viewMode === 'investor' ? formatMoney(weekPnl) : (weekRCount > 0 ? formatR(weekRSum) : '—')}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-zinc-800/70 flex-wrap">
          <span className="flex items-center gap-1.5 text-xs text-zinc-500">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/40 border border-emerald-500/50" /> Profit
          </span>
          <span className="flex items-center gap-1.5 text-xs text-zinc-500">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/40 border border-rose-500/50" /> Loss
          </span>
          <span className="flex items-center gap-1.5 text-xs text-zinc-500">
            <span className="w-2.5 h-2.5 rounded-sm bg-zinc-800/60 border border-zinc-700/60" /> No trades
          </span>
        </div>
      </div>
    </div>
  );
}

function PreviewTradeDetail({
  trade,
  accountName,
  onClose,
  viewMode,
}: {
  trade: PreviewTrade;
  accountName?: string;
  onClose: () => void;
  viewMode: ViewMode;
}) {
  const execTf = trade.timeframes.find(tf => tf.name === 'Execution/Result');
  const executionImages = execTf?.images || [];
  const otherTimeframes = trade.timeframes.filter(tf => tf.name !== 'Execution/Result' && tf.images.length > 0);
  const tradeRR = trade.riskAmount && trade.riskAmount > 0 ? trade.profitLoss / trade.riskAmount : null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4 py-8"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between z-10">
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-bold text-white truncate">{trade.symbol}</h3>
            <p className="text-sm text-zinc-500 truncate">{accountName || 'Account'} · {formatDateLabel(trade.date)}</p>
          </div>
          {/* No edit/delete icons here — read-only means read-only. */}
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {executionImages.length > 0 && (
            <div className="bg-zinc-800/50 rounded-xl overflow-hidden border border-zinc-800 aspect-video">
              <img src={executionImages[0].url} alt="Execution" className="w-full h-full object-cover" />
              {/* Execution Notes intentionally omitted — privacy filter. */}
            </div>
          )}

          <div className={cn(
            'w-full flex items-center justify-center gap-3 py-4 px-4 rounded-xl border',
            trade.profitLoss >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'
          )}>
            <span className="text-sm text-zinc-400">P&L</span>
            <span className={cn('text-2xl font-bold', trade.profitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
              {formatPnl(viewMode, trade.profitLoss, tradeRR)}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Field label="Symbol" value={trade.symbol} />
            <Field label="Entry" value={trade.entryPrice ?? '—'} />
            <Field label="Stop Loss" value={`${trade.stopLoss ?? '—'}${trade.slPoints ? ` (${trade.slPoints} pts)` : ''}`} />
            <Field label="Take Profit" value={`${trade.takeProfit ?? '—'}${trade.tpPoints ? ` (${trade.tpPoints} pts)` : ''}`} />
          </div>

          {((viewMode === 'investor' && trade.riskAmount) || tradeRR !== null) && (
            <div className="flex flex-wrap gap-3">
              {viewMode === 'investor' && trade.riskAmount ? (
                <div className="bg-zinc-800/50 rounded-lg p-3 inline-block">
                  <p className="text-xs text-zinc-500 mb-1">Risk Amount</p>
                  <p className="text-sm text-white font-medium">{formatMoney(trade.riskAmount)}</p>
                </div>
              ) : null}
              {tradeRR !== null && (
                <div className="bg-zinc-800/50 rounded-lg p-3 inline-block">
                  <p className="text-xs text-zinc-500 mb-1">Risk:Reward</p>
                  <p className={cn('text-sm font-medium', tradeRR >= 1 ? 'text-emerald-400' : 'text-white')}>
                    {tradeRR >= 1 ? '+' : ''}{tradeRR.toFixed(2)}R
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {trade.setupTypes.map(s => (
              <span key={s} className="px-3 py-1.5 bg-zinc-800 rounded-lg text-sm text-zinc-300">{s}</span>
            ))}
            {trade.confluences.map(c => (
              <span key={c} className="px-3 py-1.5 bg-zinc-700 rounded-lg text-sm text-zinc-300">{c}</span>
            ))}
            {/* Rules Followed/Broken intentionally not rendered — kept
                private on this read-only screen, same treatment as the
                gallery card badge above and the filter bar's Rules dropdown. */}
          </div>

          {trade.mistakes.length > 0 && (
            <div>
              <h4 className="text-sm text-zinc-500 mb-2">Mistakes Made</h4>
              <div className="flex flex-wrap gap-2">
                {trade.mistakes.map(m => (
                  <span key={m} className="px-3 py-1.5 rounded-lg text-sm bg-rose-500/10 text-rose-300">{m}</span>
                ))}
              </div>
            </div>
          )}

          {/*
            Post-Trade Performance Notes (Mistakes Analysis / Lessons
            Learned) intentionally not rendered — this data was never
            fetched (see get_preview_journal in sql/001_preview_access.sql),
            so there's nothing here that could be revealed by mistake.
          */}

          {otherTimeframes.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-white mb-3">Timeframe Charts</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {otherTimeframes.map(tf => (
                  <div key={tf.name} className="bg-zinc-800/50 rounded-lg overflow-hidden border border-zinc-800">
                    {tf.images[0] && (
                      <div className="aspect-video">
                        <img src={tf.images[0].url} alt={tf.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-2">
                      <p className="text-xs font-medium text-zinc-300">{tf.name}</p>
                      {/* Timeframe notes intentionally omitted — privacy filter. */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-zinc-800/50 rounded-lg p-3 min-w-0">
      <p className="text-xs text-zinc-500 mb-1 truncate">{label}</p>
      <p className="text-sm text-white font-medium truncate">{value}</p>
    </div>
  );
}
