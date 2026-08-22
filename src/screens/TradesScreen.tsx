import type React from 'react';
import { useState, useMemo, useCallback, useEffect, memo } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Calendar,
  Shield,
  Eye,
  EyeOff,
  Plus,
  X,
  Edit2,
  Trash2,
  Check,
  ChevronsUpDown,
  Image as ImageIcon,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  AlertCircle,
  Lightbulb,
  Filter,
  Grid,
  List,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Brain,
  Percent,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Save,
  Upload,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Link,
  Download,
  HardDrive,
  FolderSync,
  ToggleLeft,
  ToggleRight,
  Wallet,
  LineChart,
  Clock,
  CalendarDays,
  Calculator,
  CornerDownLeft,
  GripVertical,
  Expand,
  SlidersHorizontal,
  ArrowUpDown,
  Sun,
  Moon,
  PanelLeft,
  Flame,
  ClipboardPaste,
  ZoomIn,
  Send,
  ImagePlus,
  StickyNote,
  Box,
  Search,
  ArrowLeft,
  Database,
  Settings,
  Scale,
  Layers,
  ShieldCheck,
  Zap,
  AlertTriangle,
  Star,
  Flag,
  Bookmark,
  Lock,
  Crosshair,
  Rocket,
  Award,
  Bell,
  Gem,
  Anchor,
  Compass,
  Swords,
  Smile,
  Palette,
  Quote,
  RefreshCw,
  ListChecks,
  Dumbbell,
  Coffee,
  Heart,
  type LucideIcon,
} from 'lucide-react';
import { formatCurrency, formatCurrencyAbsolute, formatDate } from '../utils/format';
import { TrackingBadge } from '../components/shared/TrackingBadge';
import { SessionBadge } from '../components/shared/SessionBadge';
import { PageHeader } from '../components/shared/PageHeader';
import { SESSION_OPTIONS, SESSION_SHORT_LABEL } from '../constants/trading';
import type {
  Account,
AccountMetrics,
CalculatorProps,
ChallengeConfig,
ChallengePreset,
ChallengePresetCategory,
ChatMessage,
Confluence,
CustomPillar,
DateInputProps,
EconomicEvent,
EditableTagInputProps,
EmotionTag,
GalleryView,
MTColumnRole,
MarketEffect,
MarketNotice,
MarketSessionDef,
Mistake,
MultiSelectDropdownProps,
NoticeType,
NotificationReadState,
NumericInputProps,
PHTWindow,
ParsedMTTrade,
PillarsPerRow,
RoutineCategory,
RoutineIconColor,
RoutineIconKind,
RoutineItem,
Rule,
RuleAccentColor,
RuleAccentStyle,
RuleBulletStyle,
RuleIconKind,
RuleItemType,
RulePillar,
RuleSeverity,
RuleTextSize,
SessionOption,
SetupType,
SortOrder,
StoredData,
Strategy,
StrategyStep,
TagColor,
TagColorPickerProps,
TagColorStyle,
TagSelectDropdownProps,
TimeInputProps,
TimeframeChart,
TimeframeChartInputProps,
Trade,
TradeFilter,
TradeImage,
TradeSortField,
TradingAccountType,
ViewType,
WeekDay,
WikiCandle,
WikiCategory,
WikiEntry
} from '../types';
import { cn } from '../utils/format';
import { useAppContext } from '../context/AppContext';
import { renderStatCard, renderAccountFilter, renderAccountTypeBadge, renderTradingAccountTypeBadge } from '../components/shared/RenderHelpers';

// ============================================================================
// Memoized list-item components
// ----------------------------------------------------------------------------
// Defined at module scope (not inside TradesScreen) so their identity is
// stable across TradesScreen re-renders — a component redefined inside its
// parent's function body is a *new* component type on every render, which
// would remount instead of reconcile.
//
// TradesScreen reads ~250 values out of one big app context, so almost any
// state change anywhere in the app (typing in an unrelated field, a
// calculator keypress, a dropdown toggle) causes it to re-render. Without
// memoization, that also re-renders and re-diffs every trade card/row in
// the gallery and table. React.memo stops that: as long as a given card's
// own props are unchanged, React skips it entirely.
//
// The custom comparator intentionally ignores the two callback props
// (onOpenDetail / onToggleSelected). They're stable closures over the
// trade's id, not over any state that would change their behavior between
// renders, so treating a re-created function reference as "changed" would
// defeat the whole point of memoizing here.
// ============================================================================

interface TradeFeaturedCardProps {
  trade: Trade;
  accountDisplayName: string | undefined;
  privacyMode: boolean;
  tradeSelectMode: boolean;
  isSelected: boolean;
  displayNumber: number;
  theme: string;
  tc: { text: string; textSecondary: string; textMuted: string; border: string };
  onOpenDetail: (id: string) => void;
  onToggleSelected: (id: string) => void;
}

const tradeFeaturedCardPropsAreEqual = (prev: TradeFeaturedCardProps, next: TradeFeaturedCardProps) =>
  prev.trade === next.trade &&
  prev.accountDisplayName === next.accountDisplayName &&
  prev.privacyMode === next.privacyMode &&
  prev.tradeSelectMode === next.tradeSelectMode &&
  prev.isSelected === next.isSelected &&
  prev.displayNumber === next.displayNumber &&
  prev.theme === next.theme;

const TradeFeaturedCard = memo(function TradeFeaturedCard({
  trade, accountDisplayName, privacyMode, tradeSelectMode, isSelected, displayNumber, theme, tc, onOpenDetail, onToggleSelected,
}: TradeFeaturedCardProps) {
  const coverImage = trade.executionImages[0]?.url || trade.timeframes.flatMap(tf => tf.images)[0]?.url;
  const isWin = trade.profitLoss >= 0;
  const isBreakeven = Math.abs(trade.profitLoss) < 10;
  const outcomeCardClass = theme !== 'light'
    ? (isBreakeven
        ? 'bg-zinc-800/50 group-hover:bg-zinc-800/70'
        : isWin
          ? 'bg-emerald-500/10 border-t-0 group-hover:bg-emerald-500/15'
          : 'bg-rose-500/10 border-t-0 group-hover:bg-rose-500/15')
    : (isBreakeven
        ? 'bg-zinc-50 group-hover:bg-zinc-100'
        : isWin
          ? 'bg-emerald-50 border-t-0 group-hover:bg-emerald-100'
          : 'bg-rose-50 border-t-0 group-hover:bg-rose-100');
  const outcomeBorderClass = theme !== 'light'
    ? (isBreakeven
        ? 'border-zinc-700 hover:border-zinc-500'
        : isWin
          ? 'border-emerald-500/30 hover:border-emerald-500/50'
          : 'border-rose-500/30 hover:border-rose-500/50')
    : (isBreakeven
        ? 'border-zinc-200 hover:border-zinc-300'
        : isWin
          ? 'border-emerald-300 hover:border-emerald-400'
          : 'border-rose-300 hover:border-rose-400');

  // CRITICAL: while in select mode, a click anywhere on the card (including the
  // checkbox overlay) must ONLY toggle selection — it must never open the Trade
  // Details modal. Trade Details can only open when select mode is OFF.
  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (tradeSelectMode) {
      onToggleSelected(trade.id);
      return;
    }
    onOpenDetail(trade.id);
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelected(trade.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        // transform-gpu + backface-hidden push the hover lift/scale onto
        // their own GPU layer so they animate via compositing instead of
        // triggering layout/paint on the whole card each frame.
        "group h-full flex flex-col border rounded-xl overflow-hidden cursor-pointer transition-transform transition-colors duration-200 ease-out min-w-0 transform-gpu backface-hidden will-change-transform",
        theme !== 'light' ? 'bg-zinc-900/40' : 'bg-white',
        tradeSelectMode
          ? isSelected
            ? 'border-indigo-400/80 ring-2 ring-indigo-400/40'
            : theme !== 'light' ? 'border-zinc-800/70 hover:border-zinc-600' : 'border-zinc-200 hover:border-zinc-300'
          : cn(outcomeBorderClass, 'hover:-translate-y-0.5')
      )}
    >
      <div className="aspect-video bg-zinc-800 flex items-center justify-center relative overflow-hidden flex-shrink-0">
        <span className="absolute top-2 left-2 z-10 flex items-center justify-center w-5 h-5 rounded bg-black/60 text-[10px] font-mono font-bold text-zinc-300 border border-white/10">
          {displayNumber}
        </span>
        {tradeSelectMode && (
          <button
            type="button"
            onClick={handleCheckboxClick}
            className={cn(
              'absolute top-2 right-2 z-20 flex items-center justify-center w-5 h-5 rounded-md border transition-colors',
              isSelected ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-black/50 border-white/40 text-transparent hover:border-white/70'
            )}
            aria-label={isSelected ? 'Unselect trade' : 'Select trade'}
          >
            <Check className="w-3 h-3" />
          </button>
        )}
        {coverImage ? (
          <img src={coverImage} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 transform-gpu" />
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-zinc-600">
            <ImageIcon className="w-7 h-7" />
            <span className="text-[10px]">No image</span>
          </div>
        )}
        {/* Badge row at the bottom of the thumbnail — hidden entirely for unreviewed trades */}
        {trade.rulesFollowed === 'followed' || trade.rulesFollowed === 'broken' ? (
          <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-end gap-1.5 px-2.5 py-1.5 bg-gradient-to-t from-black/80 to-transparent">
            <span className={cn(
              'flex items-center justify-center w-4 h-4 rounded-full border font-bold',
              trade.rulesFollowed === 'followed'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
            )}>
              {trade.rulesFollowed === 'followed' ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
            </span>
          </div>
        ) : null}
        {tradeSelectMode && isSelected && (
          <div className="absolute inset-0 bg-indigo-500/10 z-[5] pointer-events-none" />
        )}
      </div>
      <div className={cn('p-3.5 min-w-0 flex-1 flex flex-col transition-colors duration-200', outcomeCardClass)}>
        <div className="flex items-start justify-between gap-2">
          <h4 className={cn("font-semibold truncate tracking-tight text-sm min-w-0", tc.text)}>{trade.symbol}</h4>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={cn('text-sm font-mono font-bold tracking-tight tabular-nums whitespace-nowrap', isBreakeven ? tc.textSecondary : isWin ? 'text-emerald-400' : 'text-rose-400')}>
              {formatCurrency(trade.profitLoss, privacyMode)}
            </span>
            {trade.trackingNumber && <TrackingBadge value={trade.trackingNumber} size="sm" />}
          </div>
        </div>
        <p className={cn("text-xs truncate mt-0.5", tc.textSecondary)}>{accountDisplayName}</p>
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
              <span key={s} className={cn(
                "px-1.5 py-0.5 rounded-md border text-[10px] whitespace-nowrap",
                theme !== 'light' ? 'bg-zinc-800/80 border-zinc-700/50 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-600'
              )}>{s}</span>
            ))}
          </div>
          <span className={cn("text-[11px] font-medium whitespace-nowrap flex-shrink-0", tc.textMuted)}>{formatDate(trade.date)}</span>
        </div>
      </div>
    </div>
  );
}, tradeFeaturedCardPropsAreEqual);

interface TradeRowProps {
  trade: Trade;
  accountDisplayName: string | undefined;
  privacyMode: boolean;
  displayNumber: number;
  theme: string;
  tc: { text: string; textSecondary: string; textMuted: string; border: string };
  onOpenDetail: (id: string) => void;
}

const tradeRowPropsAreEqual = (prev: TradeRowProps, next: TradeRowProps) =>
  prev.trade === next.trade &&
  prev.accountDisplayName === next.accountDisplayName &&
  prev.privacyMode === next.privacyMode &&
  prev.displayNumber === next.displayNumber &&
  prev.theme === next.theme;

const TradeRow = memo(function TradeRow({ trade, accountDisplayName, privacyMode, displayNumber, theme, tc, onOpenDetail }: TradeRowProps) {
  const isWin = trade.profitLoss >= 0;
  const isBreakeven = Math.abs(trade.profitLoss) < 10;
  const rowRR = trade.riskAmount > 0 ? trade.profitLoss / trade.riskAmount : null;
  const position = trade.profitLoss >= 0 ? 'Long' : 'Short';
  return (
    <tr
      onClick={() => onOpenDetail(trade.id)}
      className={cn(
        "cursor-pointer transition-colors",
        theme !== 'light' ? 'border-b border-zinc-800/70 hover:bg-white/[0.02]' : 'border-b border-zinc-200 hover:bg-zinc-50'
      )}
    >
      <td className="px-3 py-2.5">
        <span className={cn(
          'text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide',
          isBreakeven
            ? (theme !== 'light' ? 'bg-zinc-700/40 border-zinc-600/40 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-600')
            : isWin
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
              : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
        )}>
          {isBreakeven ? 'B/E' : isWin ? 'Win' : 'Loss'}
        </span>
      </td>
      <td className={cn("px-3 py-2.5 text-sm whitespace-nowrap", tc.textMuted)}>{formatDate(trade.date)}</td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={cn("text-sm font-mono tabular-nums flex-shrink-0", tc.textMuted)}>{displayNumber}</span>
          {trade.trackingNumber && <TrackingBadge value={trade.trackingNumber} size="sm" />}
        </div>
      </td>
      <td className={cn("px-3 py-2.5 text-sm", tc.textMuted)}>
        {trade.session ? (SESSION_SHORT_LABEL[trade.session] || trade.session.toLowerCase()) : '-'}
      </td>
      <td className={cn("px-3 py-2.5 text-sm", tc.textMuted)}>{position}</td>
      <td className="px-3 py-2.5 text-sm font-mono tabular-nums text-right font-bold whitespace-nowrap">
        <span className={isWin ? 'text-emerald-400' : 'text-rose-400'}>{formatCurrency(trade.profitLoss, privacyMode)}</span>
      </td>
      <td className="px-3 py-2.5 text-xs font-medium text-right whitespace-nowrap">
        {rowRR !== null ? (
          <span className={cn(
            'px-1.5 py-0.5 rounded border tabular-nums',
            rowRR >= 1
              ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
              : rowRR >= 0
                ? cn(tc.textSecondary, theme !== 'light' ? 'border-zinc-700 bg-zinc-800/60' : 'border-zinc-200 bg-zinc-100')
                : 'text-rose-400 border-rose-500/30 bg-rose-500/10'
          )}>
            {rowRR >= 1 ? '+' : ''}{rowRR.toFixed(2)}R
          </span>
        ) : '-'}
      </td>
      <td className={cn("px-3 py-2.5 text-sm text-right tabular-nums whitespace-nowrap", tc.textMuted)}>
        {trade.riskAmount > 0 ? formatCurrencyAbsolute(trade.riskAmount, privacyMode) : '-'}
      </td>
      <td className={cn("px-3 py-2.5 text-sm font-semibold truncate max-w-[100px]", tc.text)}>{trade.symbol}</td>
      <td className={cn("px-3 py-2.5 text-sm truncate max-w-[120px]", tc.textMuted)}>{trade.setupTypes.join(', ') || '-'}</td>
      <td className={cn("px-3 py-2.5 text-sm truncate max-w-[120px]", tc.textMuted)}>{accountDisplayName || '-'}</td>
    </tr>
  );
}, tradeRowPropsAreEqual);

// ============================================================================
// TradeAnalyticsCard — the header analytics card shown above the trade
// gallery/table. Replaces the old flat "TOTAL | WINS | LOSSES | BE | WIN
// RATE" text bar with a compact Win/Loss/Break-even donut gauge (win rate
// centered inside it) plus a breakdown grid of key metrics. The three legend
// chips preserve the old bar's click-to-filter behavior against
// `tradeFilter`. This card's visual language (dark glass panel, three-color
// donut, win-rate-in-center) is intentionally mirrored by the
// WinRateGaugePreviewCard tile in LoginPage.tsx's background scatter, so the
// login screen's preview accurately reflects this real feature.
// ============================================================================

interface TradeAnalyticsCardProps {
  trades: Trade[];
  stats: {
    totalTrades: number;
    winRate: number;
    profitFactor: number;
    avgWin: number;
    avgLoss: number;
  };
  privacyMode: boolean;
  theme: string;
  tc: { text: string; textMuted: string };
  tradeFilter: TradeFilter;
  setTradeFilter: React.Dispatch<React.SetStateAction<TradeFilter>>;
}

function TradeAnalyticsCard({ trades, stats, privacyMode, theme, tc, tradeFilter, setTradeFilter }: TradeAnalyticsCardProps) {
  const total = trades.length;
  const wins = trades.filter(t => t.profitLoss >= 10).length;
  const losses = trades.filter(t => t.profitLoss <= -10).length;
  const breakeven = total - wins - losses;
  const netPnl = trades.reduce((sum, t) => sum + t.profitLoss, 0);
  const isNetPositive = netPnl >= 0;

  // Win Rate donut — single teal arc over a dark track, rounded cap,
  // starting at 12 o'clock and sweeping clockwise by win rate %. Thicker
  // stroke relative to diameter so it reads as a bold ring.
  // Win rate is the standard wins / total computation: every trade counts
  // as either a win or a loss by the actual sign of its P&L (a +$3 "BE"
  // trade still counts as a win here), so there's no neutral bucket
  // diluting the percentage. This intentionally differs from the W/L/BE
  // chip counts below, which still use the $10 breakeven band for display.
  const winRateWins = trades.filter(t => t.profitLoss > 0).length;
  const winRatePct = total > 0 ? (winRateWins / total) * 100 : 0;
  // Win rate counting breakeven trades against the rate (using the $10
  // band shared with the W/L/BE chips below, where a trade only counts
  // as a win if it clears the $10 threshold) — a stricter, less forgiving
  // read on the same trades, shown as a small secondary figure next to
  // the exact win rate above.
  const winRateWithBEPct = total > 0 ? (wins / total) * 100 : 0;
  const r = 42;
  const strokeWidth = 12;
  const c = 2 * Math.PI * r;
  const winRateArc = total > 0 ? (winRatePct / 100) * c : 0;

  // Shared card shell — same compact icon+label+value pattern as the
  // Discipline Tracker stat tiles, just with a touch more breathing room
  // (p-5) than the very first compact pass so it doesn't feel cramped.
  const cardClass = cn(
    "bg-zinc-900/50 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all flex items-center gap-3",
    theme === 'light' && 'bg-white border-zinc-200'
  );
  const iconCircleClass = "p-3 rounded-xl flex-shrink-0";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6 items-start">
      {/* Card 1 — Net P&L, now leading the row. */}
      <div className={cardClass}>
        <div className={cn(iconCircleClass, isNetPositive ? "bg-emerald-500/10" : "bg-rose-500/10")}>
          {isNetPositive
            ? <TrendingUp className="w-5 h-5 text-emerald-400" />
            : <TrendingDown className="w-5 h-5 text-rose-400" />}
        </div>
        <div className="min-w-0">
          <p className={cn("text-[10px] font-semibold tracking-wider uppercase", tc.textMuted)}>Net P&amp;L</p>
          <p className={cn("text-xl font-bold tabular-nums leading-tight", isNetPositive ? 'text-emerald-400' : 'text-rose-400')}>
            {formatCurrency(netPnl, privacyMode)}
          </p>
        </div>
      </div>

      {/* Card 2 — Win Rate donut, no trades-count line, just the ring and
          the label — matching the reference image as-is. */}
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
          <p className={cn("text-[10px] font-semibold tracking-wider uppercase", tc.textMuted)}>Win Rate</p>
          <div className="flex items-baseline gap-1.5">
            <p className={cn("text-xl font-bold tabular-nums leading-tight", tc.text)}>
              {total > 0 ? `${winRatePct.toFixed(1)}%` : '—'}
            </p>
            <p className={cn("text-[11px] font-medium tabular-nums leading-tight", tc.textMuted)} title="Win rate counting breakeven trades as wins">
              {total > 0 ? `${winRateWithBEPct.toFixed(1)}% w/ BE` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Card 3 — Win / Loss / Break-Even breakdown; chips stay clickable
          against `tradeFilter`, same as the old bar. */}
      <div className={cardClass}>
        <div className={cn(iconCircleClass, "bg-white/5")}>
          <Scale className={cn("w-5 h-5", tc.textMuted)} />
        </div>
        <div className="min-w-0">
          <p className={cn("text-[10px] font-semibold tracking-wider uppercase", tc.textMuted)}>Win / Loss Ratio</p>
          <p className="text-xl font-bold tabular-nums leading-tight">
            <button
              type="button"
              onClick={() => setTradeFilter(prev => prev === 'profit' ? 'all' : 'profit')}
              className={cn(
                "text-emerald-400 rounded transition-colors",
                tradeFilter === 'profit' ? 'ring-1 ring-emerald-500/40 bg-emerald-500/10 px-1' : 'hover:text-emerald-300'
              )}
            >
              {wins}W
            </button>
            <span className={cn("mx-1", tc.textMuted)}>-</span>
            <button
              type="button"
              onClick={() => setTradeFilter(prev => prev === 'loss' ? 'all' : 'loss')}
              className={cn(
                "text-rose-400 rounded transition-colors",
                tradeFilter === 'loss' ? 'ring-1 ring-rose-500/40 bg-rose-500/10 px-1' : 'hover:text-rose-400'
              )}
            >
              {losses}L
            </button>
            <span className={cn("mx-1", tc.textMuted)}>-</span>
            <button
              type="button"
              onClick={() => setTradeFilter(prev => prev === 'breakeven' ? 'all' : 'breakeven')}
              className={cn(
                "rounded transition-colors",
                tc.textMuted,
                tradeFilter === 'breakeven' ? 'ring-1 ring-zinc-400/40 bg-zinc-400/10 px-1' : (theme !== 'light' ? 'hover:text-zinc-300' : 'hover:text-zinc-600')
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
          <Target className={cn("w-5 h-5", tc.textMuted)} />
        </div>
        <div className="min-w-0">
          <p className={cn("text-[10px] font-semibold tracking-wider uppercase", tc.textMuted)}>Profit Factor</p>
          <p className={cn("text-xl font-bold tabular-nums leading-tight", tc.text)}>
            {total > 0 && isFinite(stats.profitFactor) ? stats.profitFactor.toFixed(2) : 'N/A'}
            <span className={cn("text-xs font-medium tabular-nums ml-1.5", tc.textMuted)}>
              <span className="text-emerald-500">{formatCurrency(stats.avgWin, privacyMode)}</span>
              <span className="mx-0.5">/</span>
              <span className="text-rose-400">{formatCurrency(-stats.avgLoss, privacyMode)}</span>
            </span>
          </p>
        </div>
      </div>

      {/* Card 5 — Total Trades, now trailing the row. */}
      <div className={cardClass}>
        <div className={cn(iconCircleClass, "bg-indigo-500/10")}>
          <BarChart3 className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="min-w-0">
          <p className={cn("text-[10px] font-semibold tracking-wider uppercase", tc.textMuted)}>Total Trades</p>
          <p className={cn("text-xl font-bold tabular-nums leading-tight", tc.text)}>{total}</p>
        </div>
      </div>
    </div>
  );
}

export function TradesScreen() {
  const {
    view, setView, privacyMode, setPrivacyMode, theme, setTheme, mainScrollRef, isExportConfirmOpen,
    setIsExportConfirmOpen, sidebarCollapsed, setSidebarCollapsed, isSettingsModalOpen,
    setIsSettingsModalOpen, settingsModalTab, setSettingsModalTab, isMobileSidebarOpen,
    setIsMobileSidebarOpen, galleryView, setGalleryView, tradeSubView, setTradeSubView, dbSearch, setDbSearch,
    dbAccountFilter, setDbAccountFilter, dbSessionFilter, setDbSessionFilter, dbOutcomeFilter,
    setDbOutcomeFilter, dbRulesFilter, setDbRulesFilter, dbPage, setDbPage, dbViewMode, setDbViewMode,
    DB_PAGE_SIZE, tradeFilter, setTradeFilter, tradeSortField, setTradeSortField, tradeSortOrder,
    setTradeSortOrder, viewportWidth, equityChartContainerRef, equityChartWidth, setEquityChartWidth,
    selectedAccounts, setSelectedAccounts, showAccountDropdown, setShowAccountDropdown, calculatorState,
    setCalculatorState, activeInputRef, resetCalculator, handleNumberInputFocus, handleCalculatorChange,
    updateFieldFromCalculator, handleCalculatorEnter, closeCalculator, accounts, setAccounts, trades,
    setTrades, rules, setRules, strategies, setStrategies, notices, setNotices, wikiEntries, setWikiEntries,
    setupTypes, setSetupTypes, confluences, setConfluences, mistakesList, setMistakesList, emotionsList,
    setEmotionsList, customSymbols, setCustomSymbols, customPillars, setCustomPillars, tradeImportInputRef,
    isImportingTrades, setIsImportingTrades, tradeImportToast, setTradeImportToast,
    tradeImportToastTimeoutRef, showTradeImportToast, pillarsPerRow, setPillarsPerRow, DEFAULT_CREED_QUOTES,
    customCreedQuotes, setCustomCreedQuotes, customCreedQuotesLoaded, setCustomCreedQuotesLoaded,
    allCreedQuotes, creedIndex, setCreedIndex, isEditingCreed, setIsEditingCreed, creedDraftText,
    setCreedDraftText, creedDraftTag, setCreedDraftTag, currentCreedQuote, isCurrentCreedCustom,
    shuffleDailyCreed, openCreedEditor, saveCreedEdit, deleteCurrentCreedQuote, CREED_EMPHASIS_WORDS,
    renderCreedQuoteText, PRE_SESSION_CHECKLIST_ITEMS, preSessionChecklist, setPreSessionChecklist,
    togglePreSessionItem, resetPreSessionChecklist, preSessionCompletedCount, showAddAccount,
    setShowAddAccount, showEditAccount, setShowEditAccount, showAddTrade, setShowAddTrade, showEditTrade,
    setShowEditTrade, showTradeDetail, setShowTradeDetail, detailNotesDraft, setDetailNotesDraft,
    detailRulesFollowedDraft, setDetailRulesFollowedDraft, showDisciplineReview, setShowDisciplineReview,
    disciplineReviewDraft, setDisciplineReviewDraft, showRuleReviewModal, setShowRuleReviewModal,
    isEditingRuleReview, setIsEditingRuleReview, showAddRule, setShowAddRule, showManageRulesModal,
    setShowManageRulesModal, showAddStrategy, setShowAddStrategy, viewStrategyId, setViewStrategyId,
    newStrategy, setNewStrategy, editingStrategyId, setEditingStrategyId, strategyPendingDelete,
    setStrategyPendingDelete, stepPendingDeleteId, setStepPendingDeleteId, draggingStepImageId,
    setDraggingStepImageId, dragOverStepImageId, setDragOverStepImageId, draggingCoverImageId,
    setDraggingCoverImageId, dragOverCoverImageId, setDragOverCoverImageId, draggingStrategyId,
    setDraggingStrategyId, dragOverStrategyId, setDragOverStrategyId, strategyCoverIndex,
    setStrategyCoverIndex, strategyImageInputRef, strategyCarouselRef, canScrollLeftStrategy,
    setCanScrollLeftStrategy, canScrollRightStrategy, setCanScrollRightStrategy, updateStrategyScrollState,
    scrollStrategyCarousel, strategyStepImageInputRefs, showAddNotice, setShowAddNotice, editingNoticeId,
    setEditingNoticeId, showAddWiki, setShowAddWiki, editingTrade, setEditingTrade, lightboxImage,
    setLightboxImage, showExpandGallery, setShowExpandGallery, executionImageIndex, setExecutionImageIndex,
    timeframeImageIndices, setTimeframeImageIndices, showTradeTimeFields, setShowTradeTimeFields,
    showTradePriceLevels, setShowTradePriceLevels, rulesAdherenceError, setRulesAdherenceError,
    showAccountTypeDropdown, setShowAccountTypeDropdown, showTradingAccountTypeDropdown,
    setShowTradingAccountTypeDropdown, showSymbolDropdown, setShowSymbolDropdown, symbolCustomInput,
    setSymbolCustomInput, showSessionDropdown, setShowSessionDropdown, showTradeControlsPanel,
    setShowTradeControlsPanel, tradeSelectMode, setTradeSelectMode, selectedTradeIds, setSelectedTradeIds,
    showDeleteSelectedConfirm, setShowDeleteSelectedConfirm, accountPendingDelete, setAccountPendingDelete,
    tradePendingDelete, setTradePendingDelete, noticeImageInputRef, accountDropdownRef,
    tradingAccountTypeDropdownRef, accountTypeDropdownRef, symbolDropdownRef, sessionDropdownRef,
    tradeControlsPanelRef, calendarMonth, setCalendarMonth, streakGridWindow, setStreakGridWindow,
    disciplineCalendarMonth, setDisciplineCalendarMonth, openDisciplineDay, setOpenDisciplineDay,
    disciplineCalendarGridRef, emotionsTimeframe, setEmotionsTimeframe, mistakesTimeframe,
    setMistakesTimeframe, disciplineAnalyticsTimeframeOptions, newAccount, setNewAccount, editingAccount,
    setEditingAccount, initializeEmptyTimeframes, newTrade, setNewTrade, priceInputs, setPriceInputs, newRule,
    setNewRule, editingRuleId, setEditingRuleId, showRuleIconPicker, setShowRuleIconPicker, ruleIconPickerTab,
    setRuleIconPickerTab, emptyNoticeDraft, newNotice, setNewNotice, newWiki, setNewWiki, editingWikiId,
    setEditingWikiId, viewWikiId, setViewWikiId, wikiImageInputRef, selectedTimeframeTab,
    setSelectedTimeframeTab, calculatedRR, lifeDisciplineStartDate, setLifeDisciplineStartDate,
    lifeDisciplineChecks, setLifeDisciplineChecks, lifeDisciplineGraceDays, setLifeDisciplineGraceDays,
    lifeDisciplineRecheckNotes, setLifeDisciplineRecheckNotes, lifeDisciplineMissedReasons,
    setLifeDisciplineMissedReasons, challengeConfig, setChallengeConfig, hasStartedChallenge,
    setHasStartedChallenge, hasActiveChallengeProgress, dayDetailsModal, setDayDetailsModal,
    isEditingDayReason, setIsEditingDayReason, dayReasonDraftText, setDayReasonDraftText,
    isRecheckTokenPromptOpen, setIsRecheckTokenPromptOpen, recheckTokenReasonDraft,
    setRecheckTokenReasonDraft, dayDetailsHonestyGuardrail, setDayDetailsHonestyGuardrail,
    isEditingDayChecklist, setIsEditingDayChecklist, isChallengeConfigOpen, setIsChallengeConfigOpen,
    challengeModalMode, setChallengeModalMode, isResetChallengeConfirmOpen, setIsResetChallengeConfirmOpen,
    challengeConfigDraft, setChallengeConfigDraft, isCustomDuration, setIsCustomDuration, newRoutineItemText,
    setNewRoutineItemText, editingRoutineItem, setEditingRoutineItem, editingRoutineItemText,
    setEditingRoutineItemText, iconPickerOpenFor, setIconPickerOpenFor, iconPickerTab, setIconPickerTab,
    iconPickerPos, setIconPickerPos, iconPickerPopoverRef, iconPickerTriggerRefs, ICON_PICKER_WIDTH,
    ICON_PICKER_EST_HEIGHT, GAP, computeIconPickerPos, toggleIconPicker, categoryPendingDelete,
    setCategoryPendingDelete, itemPendingDelete, setItemPendingDelete, userChallengePresets,
    setUserChallengePresets, isLoadPresetMenuOpen, setIsLoadPresetMenuOpen, isSavingPresetDraft,
    setIsSavingPresetDraft, savePresetNameDraft, setSavePresetNameDraft, isManagePresetsOpen,
    setIsManagePresetsOpen, presetPendingDelete, setPresetPendingDelete, loadPresetMenuRef, loadedPresetId,
    setLoadedPresetId, isPresetSaveChoiceOpen, setIsPresetSaveChoiceOpen, presetSaveChoiceRef,
    lifeDisciplineToast, setLifeDisciplineToast, lifeDisciplineToastTimeoutRef, showLifeDisciplineToast,
    emptyLifeDisciplineChecks, toggleLifeDisciplineItem, completeAllLifeDisciplineToday,
    isLifeDisciplineDayComplete, lifeDisciplineTokensUsed, lifeDisciplineTokensRemaining,
    toggleLifeDisciplineGraceDay, openDayDetailsModal, startEditDayChecklist, saveDayChecklistEdits,
    toggleDayDetailsFailedItem, startEditDayReason, saveDayDetailsReason, openRecheckTokenPrompt,
    confirmUseRecheckToken, undoRecheckDay, handleLifeDisciplineTileClick, findMatchingUserPreset,
    handleSaveCurrentAsPresetClick, overwriteExistingUserPreset, chooseSaveAsNewPreset,
    openChallengeConfigModal, applyChallengePreset, saveDraftAsPreset, requestDeleteUserChallengePreset,
    confirmDeleteUserChallengePreset, addDraftRoutineItem, addDraftWeeklyItem, requestDeleteDraftRoutineItem,
    confirmDeleteDraftRoutineItem, startEditDraftRoutineItem, commitEditDraftRoutineItem,
    toggleWeeklyRoutinesEnabled, toggleDraftItemDay, addDraftCategory, renameDraftCategory,
    setDraftCategoryIcon, setDraftCategoryIconColor, requestDeleteDraftCategory, confirmDeleteDraftCategory,
    cleanChallengeConfigDraft, saveChallengeConfigUpdate, resetChallengeProgress, saveChallengeConfig,
    tradeNumberAccountRef, accountFilteredTrades, filteredTrades, dbFilteredTrades, dbPageCount,
    dbPagedTrades, getDisplayTradeNumber, stats, equityData, ruleViolationCounts, calendarDays,
    handleAddAccount, handleUpdateAccount, handleDeleteAccount, confirmDeleteAccount, handleImportTradesFile,
    handleAddTrade, openEditTrade, handleSaveEditedTrade, handleDeleteTrade, confirmDeleteTrade,
    handleSaveDetailNotes, handleSaveDisciplineReview, handleCancelRuleReviewEdit, closeRuleReviewModal,
    toggleTradeSelectMode, toggleTradeSelected, toggleSelectAllTrades, handleDeleteSelectedTrades,
    confirmDeleteSelectedTrades, getTodayLocalDate, tc, resetTradeForm, handleSaveRule, openAddRuleModal,
    openEditRuleModal, closeRuleModal, handleDeleteRule, handleAddDivider, handleUpdateDividerLabel,
    showAddPillarModal, setShowAddPillarModal, newPillar, setNewPillar, pillarPendingDelete,
    setPillarPendingDelete, openAddPillarModal, closeAddPillarModal, handleAddPillar, handleDeletePillar,
    moveStrategy, handleStrategyImagesPick, removeStrategyImage, moveStrategyImage, openAddStrategyModal,
    openEditStrategyModal, closeStrategyModal, addStrategyStep, updateStrategyStep, requestRemoveStrategyStep,
    removeStrategyStep, confirmRemoveStrategyStep, handleStrategyStepImagesPick, removeStrategyStepImage,
    moveStrategyStepImage, handleSaveStrategy, handleDeleteStrategy, confirmDeleteStrategy,
    handleNoticeImagePick, handleAddNotice, handleOpenAddNotice, handleEditNotice, handleDeleteNotice,
    WIKI_FORM_DEFAULT, handleAddWiki, handleOpenAddWiki, handleOpenEditWiki, handleDeleteWiki,
    handleWikiImagePick, addWikiKeyRule, updateWikiKeyRule, removeWikiKeyRule, handleDeleteSetupType,
    handleDeleteConfluence, handleDeleteMistakeType, handleChangeSetupTypeColor, handleChangeConfluenceColor,
    handleChangeMistakeColor, handleDeleteEmotion, handleChangeEmotionColor, colorForEmotion, colorForMistake,
    handleFileUpload, handleAddImageUrl, handleRemoveImage, handleReorderImages, updateTimeframeNotes,
    exportBackup, importBackup,
  } = useAppContext();

  // Resets the Database sub-view back to Overview once TradesScreen has
  // actually unmounted — deliberately NOT done from the sidebar's click
  // handler. App.tsx keeps the outgoing screen mounted for one extra render
  // via useDeferredValue(view) while the next screen's chunk loads; if this
  // reset fired synchronously on click instead, tradeSubView would flip to
  // 'overview' one render before TradesScreen actually unmounts, flashing
  // the Overview sub-view for a frame. Running it in the cleanup function
  // ties the reset to the real unmount instead of the click event, so
  // there's nothing left mounted to flash.
  useEffect(() => {
    return () => {
      setTradeSubView('overview');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const SORT_FIELD_LABELS = { date: 'Date', pnl: 'P&L', rr: 'R:R' } as const;
  type GallerySize = 'small' | 'medium' | 'large';
  const GALLERY_SIZE_LABELS: Record<GallerySize, string> = { small: 'Small', medium: 'Medium', large: 'Large' };
  const GALLERY_SIZE_COLUMNS: Record<GallerySize, { base: number; sm: number; md: number; lg: number; xl: number }> = {
    small: { base: 2, sm: 3, md: 4, lg: 4, xl: 6 },
    medium: { base: 1, sm: 1, md: 2, lg: 3, xl: 4 },
    large: { base: 1, sm: 1, md: 2, lg: 3, xl: 3 },
  };
  const [gallerySize, setGallerySize] = useState<GallerySize>('small');
  const galleryColumnCount = (() => {
    const cols = GALLERY_SIZE_COLUMNS[gallerySize];
    if (viewportWidth >= 1280) return cols.xl;
    if (viewportWidth >= 1024) return cols.lg;
    if (viewportWidth >= 768) return cols.md;
    if (viewportWidth >= 640) return cols.sm;
    return cols.base;
  })();
  const activeTradeFilterCount = (selectedAccounts.includes('all') ? 0 : 1) + (tradeFilter !== 'all' ? 1 : 0);
  const resetTradeControls = () => {
    setSelectedAccounts(['all']);
    setTradeFilter('all');
    setTradeSortField('date');
    setTradeSortOrder('desc');
  };

  // ---- Notion-style Trade History ----
  // Two sub-views share the same sidebar entry (no new menu items):
  // 1. "overview" — a lightweight inline page: a 6-card featured gallery on
  //    top, then a 5-row "RECENT ENTRIES" preview with an "Open Full Database"
  //    button that swaps to the database sub-view.
  // 2. "database" — a full-width Notion-spreadsheet view with breadcrumbs, a
  //    filter bar (search / account / session / outcome / rules), a dense
  //    table of all trades, and pagination.

  const recentTrades = filteredTrades;
  const recentPreviewTrades = filteredTrades.slice(0, 10);

  // O(1) account lookups instead of accounts.find(...) inside every card/row
  // render (was O(accounts) per trade, O(trades * accounts) per gallery/table
  // paint). Only recomputed when the accounts list itself changes.
  const accountsById = useMemo(() => {
    const map = new Map<string, Account>();
    for (const a of accounts) map.set(a.id, a);
    return map;
  }, [accounts]);

  // Trade cards/rows show the account name next to every single trade, so a
  // broker-style name like "Main - 514181822" is mostly noise — the trailing
  // account number rarely helps unless it's the only thing telling two
  // accounts apart. `getAccountNameParts` only treats a trailing run of 3+
  // digits (optionally separated by a space/dash) as an account-number
  // suffix — short trailing digits ("Account 2") and plain multi-word names
  // ("John Oliver") don't match, so those are always shown as-is.
  const getAccountNameParts = (name: string): { base: string; hasNumberSuffix: boolean } => {
    const trimmed = (name || '').trim();
    const m = trimmed.match(/^(.+?)[\s-]*(\d{3,})$/);
    if (!m || !m[1].trim()) return { base: trimmed, hasNumberSuffix: false };
    return { base: m[1].trim(), hasNumberSuffix: true };
  };

  // Per-account short display name: the base name with the number suffix
  // hidden, UNLESS another account shares the same base — then the number
  // is kept (on every account sharing that base) so they stay distinguishable.
  const accountDisplayNameById = useMemo(() => {
    const parts = new Map<string, { base: string; hasNumberSuffix: boolean }>();
    const baseCounts = new Map<string, number>();
    for (const a of accounts) {
      const p = getAccountNameParts(a.name);
      parts.set(a.id, p);
      if (p.hasNumberSuffix) {
        const key = p.base.toLowerCase();
        baseCounts.set(key, (baseCounts.get(key) || 0) + 1);
      }
    }
    const map = new Map<string, string>();
    for (const a of accounts) {
      const p = parts.get(a.id)!;
      const isAmbiguous = p.hasNumberSuffix && (baseCounts.get(p.base.toLowerCase()) || 0) > 1;
      map.set(a.id, p.hasNumberSuffix && !isAmbiguous ? p.base : a.name);
    }
    return map;
  }, [accounts]);

  // Stable callback identities for the memoized card/row components below —
  // setShowTradeDetail is already a useState setter (always stable);
  // toggleTradeSelected is itself wrapped in useCallback in useAppState.
  // Wrapping them again here costs nothing and documents the intent.
  const handleOpenTradeDetail = useCallback((id: string) => setShowTradeDetail(id), [setShowTradeDetail]);
  const handleToggleTradeSelected = useCallback((id: string) => toggleTradeSelected(id), [toggleTradeSelected]);

  const renderFeaturedCard = (trade: Trade) => (
    <TradeFeaturedCard
      key={trade.id}
      trade={trade}
      accountDisplayName={accountDisplayNameById.get(trade.accountId)}
      privacyMode={privacyMode}
      tradeSelectMode={tradeSelectMode}
      isSelected={selectedTradeIds.includes(trade.id)}
      displayNumber={getDisplayTradeNumber(trade)}
      theme={theme}
      tc={tc}
      onOpenDetail={handleOpenTradeDetail}
      onToggleSelected={handleToggleTradeSelected}
    />
  );

  const renderOverviewView = () => (
    <div className="space-y-6 min-w-0">
      {/* Page header */}
      <PageHeader
        title="Trade History"
        description="Analyze trade execution history & trade logs"
        actions={
          <>
            {renderAccountFilter()}

            <button
              type="button"
              onClick={toggleTradeSelectMode}
              className={cn(
                'flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm transition-colors border',
                tradeSelectMode
                  ? 'bg-white text-black border-white hover:bg-zinc-200'
                  : theme !== 'light'
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                    : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200'
              )}
            >
              <Check className="w-4 h-4" />
              <span className="hidden sm:inline">{tradeSelectMode ? 'Cancel' : 'Select'}</span>
            </button>
            <button
              type="button"
              disabled={isImportingTrades}
              onClick={() => tradeImportInputRef.current?.click()}
              title={isImportingTrades ? 'Importing…' : 'Import MT4/MT5'}
              aria-label={isImportingTrades ? 'Importing…' : 'Import MT4/MT5'}
              className={cn(
                'flex items-center justify-center w-9 h-9 rounded-lg transition-colors border flex-shrink-0',
                theme !== 'light' ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200',
                isImportingTrades && 'opacity-60 cursor-not-allowed'
              )}
            >
              <Upload className={cn('w-4 h-4', isImportingTrades && 'animate-pulse')} />
            </button>
            <button onClick={() => { resetTradeForm(); resetCalculator(); setShowAddTrade(true); }} className={cn("flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm transition-colors", theme !== 'light' ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900')}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Trade</span>
            </button>
          </>
        }
      />

      {tradeSelectMode && (
        <div className={cn(
          'flex items-center justify-between flex-wrap gap-3 px-4 py-3 rounded-xl border sticky top-0 z-20',
          theme !== 'light' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
        )}>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSelectAllTrades}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                theme !== 'light' ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200'
              )}
            >
              {selectedTradeIds.length === filteredTrades.length && filteredTrades.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
            <span className={cn('text-sm', tc.textMuted)}>{selectedTradeIds.length} selected</span>
          </div>
          <button
            type="button"
            onClick={handleDeleteSelectedTrades}
            disabled={selectedTradeIds.length === 0}
            className="flex items-center gap-2 px-4 py-1.5 bg-rose-500/90 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected ({selectedTradeIds.length})
          </button>
        </div>
      )}

      {/* HEADER ANALYTICS ROW — 4 standalone stat cards: Total Trades, a
          Win Rate donut (1:1 match to the Login screen's win-rate preview
          tile), the Win/Loss/BE breakdown, and Profit Factor + Avg Win/Loss.
          The W/L/BE values in card 3 stay clickable against `tradeFilter`:
          clicking one narrows the gallery + table below to just that
          outcome, clicking the active one again clears it back to 'all'. */}
      <TradeAnalyticsCard
        trades={accountFilteredTrades}
        stats={stats}
        privacyMode={privacyMode}
        theme={theme}
        tc={tc}
        tradeFilter={tradeFilter}
        setTradeFilter={setTradeFilter}
      />
      {tradeFilter !== 'all' && (
        <div className="flex items-center gap-2 -mt-2 mb-4">
          <span className={cn("text-xs", tc.textMuted)}>
            Showing only {tradeFilter === 'profit' ? 'wins' : tradeFilter === 'loss' ? 'losses' : 'breakeven trades'}
          </span>
          <button
            type="button"
            onClick={() => setTradeFilter('all')}
            className={cn("text-xs underline underline-offset-2 transition-colors", tc.textMuted, theme !== 'light' ? 'hover:text-white' : 'hover:text-zinc-900')}
          >
            Clear
          </button>
        </div>
      )}

      {/* TOP SECTION — Featured Gallery Grid (scrollable frame, all trades) */}
      {recentTrades.length > 0 && (
        <div>
          {/* Frame — matches the Discipline Tracker card tone/border exactly. The frame IS the
              scroll container: cards scroll edge-to-edge against its inner walls, no nested wrapper. */}
          <div className={cn(
            "border rounded-xl max-h-[520px] overflow-y-auto overscroll-contain scroll-smooth p-5 shadow-[0_20px_45px_rgba(0,0,0,0.5),inset_0_2px_12px_rgba(0,0,0,0.25)] scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent",
            theme !== 'light' ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-white border-zinc-200'
          )}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {recentTrades.map(renderFeaturedCard)}
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM SECTION — Recent Entry Log Preview */}
      <div className="!mt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className={cn("text-xs font-semibold uppercase tracking-wider", tc.textMuted)}>Recent Entries</h3>
          <button
            type="button"
            onClick={() => setTradeSubView('database')}
            className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Expand className="w-3.5 h-3.5" />
            Open Full Database
          </button>
        </div>

        <div className={cn(
          "rounded-xl overflow-hidden",
          theme !== 'light' ? 'bg-zinc-900/40 border border-zinc-800/80' : 'bg-white border border-zinc-200'
        )}>
          {recentPreviewTrades.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px]">
                <thead>
                  <tr className={cn("text-left", theme !== 'light' ? 'border-b border-zinc-800/70 bg-white/[0.02]' : 'border-b border-zinc-200 bg-zinc-50')}>
                    <th className={cn("px-3 py-2.5 text-[11px] uppercase tracking-wider font-medium", tc.textMuted)}>#</th>
                    <th className={cn("px-3 py-2.5 text-[11px] uppercase tracking-wider font-medium", tc.textMuted)}>Date</th>
                    <th className={cn("px-3 py-2.5 text-[11px] uppercase tracking-wider font-medium", tc.textMuted)}>Account</th>
                    <th className={cn("px-3 py-2.5 text-[11px] uppercase tracking-wider font-medium", tc.textMuted)}>Symbol</th>
                    <th className={cn("px-3 py-2.5 text-[11px] uppercase tracking-wider font-medium", tc.textMuted)}>Side</th>
                    <th className={cn("px-3 py-2.5 text-[11px] uppercase tracking-wider font-medium", tc.textMuted)}>Session</th>
                    <th className={cn("px-3 py-2.5 text-[11px] uppercase tracking-wider font-medium", tc.textMuted)}>Setups</th>
                    <th className={cn("px-3 py-2.5 text-[11px] uppercase tracking-wider font-medium text-right", tc.textMuted)}>R-Multiple</th>
                    <th className={cn("px-3 py-2.5 text-[11px] uppercase tracking-wider font-medium text-right", tc.textMuted)}>P&amp;L</th>
                    <th className={cn("px-3 py-2.5 text-[11px] uppercase tracking-wider font-medium text-right", tc.textMuted)}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPreviewTrades.map(trade => {
                    const accountName = accountDisplayNameById.get(trade.accountId);
                    const isWin = trade.profitLoss >= 0;
                    const rowRR = trade.riskAmount > 0 ? trade.profitLoss / trade.riskAmount : null;
                    const side = trade.profitLoss >= 0 ? 'LONG' : 'SHORT';
                    const isRowSelected = selectedTradeIds.includes(trade.id);

                    // CRITICAL: while in select mode, clicking the row (or its checkbox)
                    // must ONLY toggle selection and must never open Trade Details.
                    const handleRowClick = (e: React.MouseEvent) => {
                      e.stopPropagation();
                      if (tradeSelectMode) {
                        toggleTradeSelected(trade.id);
                        return;
                      }
                      setShowTradeDetail(trade.id);
                    };

                    return (
                      <tr
                        key={trade.id}
                        onClick={handleRowClick}
                        className={cn(
                          "border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors",
                          tradeSelectMode && isRowSelected && "bg-indigo-500/10"
                        )}
                      >
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {tradeSelectMode && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); toggleTradeSelected(trade.id); }}
                                className={cn(
                                  'flex items-center justify-center w-4 h-4 rounded border transition-colors flex-shrink-0',
                                  isRowSelected ? 'bg-indigo-500 border-indigo-400 text-white' : 'border-zinc-600 text-transparent hover:border-zinc-400'
                                )}
                                aria-label={isRowSelected ? 'Unselect trade' : 'Select trade'}
                              >
                                <Check className="w-2.5 h-2.5" />
                              </button>
                            )}
                            <span className="inline-flex items-center justify-center min-w-[1.5rem] px-1.5 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/50 text-[11px] font-mono font-semibold text-zinc-300">
                              {getDisplayTradeNumber(trade)}
                            </span>
                          </div>
                        </td>
                        <td className={cn("px-3 py-2.5 text-sm whitespace-nowrap", tc.textSecondary)}>{formatDate(trade.date)}</td>
                        <td className={cn("px-3 py-2.5 text-sm whitespace-nowrap truncate max-w-[160px]", tc.textSecondary)}>
                          {accountName || '-'}
                        </td>
                        <td className={cn("px-3 py-2.5 text-sm font-semibold truncate max-w-[100px]", tc.text)}>{trade.symbol}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className={cn(
                            'text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide',
                            isWin ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                          )}>
                            {side}
                          </span>
                        </td>
                        <td className={cn("px-3 py-2.5 text-xs whitespace-nowrap", tc.textMuted)}>
                          {trade.session ? (SESSION_SHORT_LABEL[trade.session] || trade.session.toLowerCase()) : '-'}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 flex-wrap max-w-[220px]">
                            {trade.setupTypes.length > 0 ? trade.setupTypes.slice(0, 2).map(s => (
                              <span key={s} className="px-1.5 py-0.5 bg-zinc-800/80 border border-zinc-700/50 rounded text-[10px] text-zinc-300 whitespace-nowrap">{s}</span>
                            )) : <span className="text-xs text-zinc-600">-</span>}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-xs font-medium text-right whitespace-nowrap">
                          {rowRR !== null ? (
                            <span className={cn('px-1.5 py-0.5 rounded border tabular-nums', rowRR >= 1 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : rowRR >= 0 ? cn(tc.textSecondary, theme !== 'light' ? 'border-zinc-700 bg-zinc-800/60' : 'border-zinc-200 bg-zinc-100') : 'text-rose-400 border-rose-500/30 bg-rose-500/10')}>
                              {rowRR >= 1 ? '+' : ''}{rowRR.toFixed(2)}R
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-3 py-2.5 text-sm font-mono tabular-nums text-right font-bold whitespace-nowrap">
                          <span className={isWin ? 'text-emerald-400' : 'text-rose-400'}>{formatCurrency(trade.profitLoss, privacyMode)}</span>
                        </td>
                        <td className="px-3 py-2.5 text-right whitespace-nowrap">
                          {!tradeSelectMode && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); openEditTrade(trade); }}
                              className={cn(
                                "inline-flex items-center justify-center w-7 h-7 rounded-lg transition-colors",
                                tc.textMuted,
                                theme !== 'light' ? 'hover:text-white hover:bg-zinc-800' : 'hover:text-zinc-900 hover:bg-zinc-100'
                              )}
                              title="Edit trade"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-14 h-14 mx-auto rounded-full bg-zinc-800 flex items-center justify-center mb-3">
                <TrendingUp className={cn("w-7 h-7", tc.textMuted)} />
              </div>
              <h3 className={cn("text-base font-medium mb-1.5", tc.text)}>No trades yet</h3>
              <p className={cn("mb-3 text-sm", tc.textMuted)}>Add your first trade to get started</p>
              <button onClick={() => { resetTradeForm(); setShowAddTrade(true); }} className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors", theme !== 'light' ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900')}>
                <Plus className="w-4 h-4" />
                Add Trade
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderDatabaseView = () => {
    const activeDbFilterCount =
      (dbSearch.trim() ? 1 : 0) +
      (dbAccountFilter !== 'all' ? 1 : 0) +
      (dbSessionFilter !== 'all' ? 1 : 0) +
      (dbOutcomeFilter !== 'all' ? 1 : 0) +
      (dbRulesFilter !== 'all' ? 1 : 0);

    const resetDbFilters = () => {
      setDbSearch('');
      setDbAccountFilter('all');
      setDbSessionFilter('all');
      setDbOutcomeFilter('all');
      setDbRulesFilter('all');
      setDbPage(0);
    };

    return (
      <div className="space-y-5 min-w-0">
        {/* Breadcrumbs + back button */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm min-w-0">
            <button
              type="button"
              onClick={() => setTradeSubView('overview')}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-medium cursor-pointer flex-shrink-0",
                theme !== 'light'
                  ? 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-200 hover:text-white'
                  : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-600 hover:text-zinc-900'
              )}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Overview</span>
            </button>
            <span className={theme !== 'light' ? 'text-zinc-700' : 'text-zinc-300'}>/</span>
            <span className={cn("font-medium truncate", tc.text)}>All Trades Database</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* All Accounts — same global account filter used on the Dashboard,
                exposed here too since it already drives dbFilteredTrades via
                filteredTrades -> accountFilteredTrades. */}
            <div className="relative" ref={accountDropdownRef}>
              <button
                onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors border',
                  theme !== 'light' ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200'
                )}
              >
                <Filter className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline truncate max-w-[120px]">{selectedAccounts.includes('all') ? 'All Accounts' : `${selectedAccounts.length} Selected`}</span>
                <ChevronsUpDown className="w-4 h-4 flex-shrink-0" />
              </button>

              {showAccountDropdown && (
                <div className={cn(
                  "absolute right-0 sm:left-0 mt-2 min-w-[200px] w-64 rounded-lg shadow-xl z-50 p-2 border",
                  theme !== 'light' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                )}>
                  <button
                    onClick={() => setSelectedAccounts(['all'])}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded text-sm truncate transition-colors',
                      selectedAccounts.includes('all')
                        ? (theme !== 'light' ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-900')
                        : (theme !== 'light' ? 'text-zinc-400 hover:bg-zinc-800' : 'text-zinc-500 hover:bg-zinc-100')
                    )}
                  >
                    All Accounts
                  </button>
                  <div className={cn("my-2 border-t", theme !== 'light' ? 'border-zinc-800' : 'border-zinc-200')} />
                  {accounts.map(acc => (
                    <button
                      key={acc.id}
                      onClick={() => {
                        if (selectedAccounts.includes('all')) {
                          setSelectedAccounts([acc.id]);
                        } else if (selectedAccounts.includes(acc.id)) {
                          const newSelection = selectedAccounts.filter(a => a !== acc.id);
                          setSelectedAccounts(newSelection.length === 0 ? ['all'] : newSelection);
                        } else {
                          setSelectedAccounts([...selectedAccounts, acc.id]);
                        }
                      }}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded text-sm flex items-center justify-between transition-colors',
                        selectedAccounts.includes(acc.id)
                          ? (theme !== 'light' ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-900')
                          : (theme !== 'light' ? 'text-zinc-400 hover:bg-zinc-800' : 'text-zinc-500 hover:bg-zinc-100')
                      )}
                    >
                      <span className="truncate flex-1 mr-2">{acc.name}</span>
                      {renderAccountTypeBadge(acc)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Table / Gallery view toggle */}
            <div className={cn(
              "flex items-center gap-0.5 p-0.5 rounded-lg border flex-shrink-0",
              theme !== 'light' ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'
            )}>
              <button
                type="button"
                onClick={() => setDbViewMode('table')}
                title="Table view"
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-md transition-colors',
                  dbViewMode === 'table'
                    ? (theme !== 'light' ? 'bg-zinc-700 text-white' : 'bg-white text-zinc-900 shadow-sm')
                    : (theme !== 'light' ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900')
                )}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setDbViewMode('gallery')}
                title="Gallery view"
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-md transition-colors',
                  dbViewMode === 'gallery'
                    ? (theme !== 'light' ? 'bg-zinc-700 text-white' : 'bg-white text-zinc-900 shadow-sm')
                    : (theme !== 'light' ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900')
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              disabled={isImportingTrades}
              onClick={() => tradeImportInputRef.current?.click()}
              title={isImportingTrades ? 'Importing…' : 'Import MT4/MT5'}
              aria-label={isImportingTrades ? 'Importing…' : 'Import MT4/MT5'}
              className={cn(
                'flex items-center justify-center w-9 h-9 rounded-lg transition-colors border flex-shrink-0',
                theme !== 'light' ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200',
                isImportingTrades && 'opacity-60 cursor-not-allowed'
              )}
            >
              <Upload className={cn('w-4 h-4', isImportingTrades && 'animate-pulse')} />
            </button>
            <button onClick={() => { resetTradeForm(); resetCalculator(); setShowAddTrade(true); }} className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors flex-shrink-0", theme !== 'light' ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900')}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Trade</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className={cn(
          "flex items-center gap-2 flex-wrap p-3 border rounded-xl",
          theme !== 'light' ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-white border-zinc-200'
        )}>
          <div className="relative flex-1 min-w-[180px]">
            <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none", tc.textMuted)} />
            <input
              type="text"
              value={dbSearch}
              onChange={(e) => { setDbSearch(e.target.value); setDbPage(0); }}
              placeholder="Search trades..."
              className={cn(
                "w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-indigo-500/50 transition-colors",
                theme !== 'light' ? 'bg-zinc-900 border-white/10 text-white placeholder-zinc-500' : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400'
              )}
            />
          </div>
          <select
            value={dbAccountFilter}
            onChange={(e) => { setDbAccountFilter(e.target.value); setDbPage(0); }}
            className={cn(
              "px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-indigo-500/50 transition-colors cursor-pointer",
              theme !== 'light' ? 'bg-zinc-900 border-white/10 text-zinc-300' : 'bg-white border-zinc-200 text-zinc-700'
            )}
          >
            <option value="all">All Accounts</option>
            {accounts.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <select
            value={dbSessionFilter}
            onChange={(e) => { setDbSessionFilter(e.target.value); setDbPage(0); }}
            className={cn(
              "px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-indigo-500/50 transition-colors cursor-pointer",
              theme !== 'light' ? 'bg-zinc-900 border-white/10 text-zinc-300' : 'bg-white border-zinc-200 text-zinc-700'
            )}
          >
            <option value="all">All Sessions</option>
            {SESSION_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={dbOutcomeFilter}
            onChange={(e) => { setDbOutcomeFilter(e.target.value as TradeFilter); setDbPage(0); }}
            className={cn(
              "px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-indigo-500/50 transition-colors cursor-pointer",
              theme !== 'light' ? 'bg-zinc-900 border-white/10 text-zinc-300' : 'bg-white border-zinc-200 text-zinc-700'
            )}
          >
            <option value="all">All Outcomes</option>
            <option value="profit">Profit</option>
            <option value="loss">Loss</option>
            <option value="breakeven">Breakeven</option>
          </select>
          <select
            value={dbRulesFilter}
            onChange={(e) => { setDbRulesFilter(e.target.value as 'all' | 'followed' | 'broken'); setDbPage(0); }}
            className={cn(
              "px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-indigo-500/50 transition-colors cursor-pointer",
              theme !== 'light' ? 'bg-zinc-900 border-white/10 text-zinc-300' : 'bg-white border-zinc-200 text-zinc-700'
            )}
          >
            <option value="all">All Rules</option>
            <option value="followed">Rules Followed</option>
            <option value="broken">Rules Broken</option>
          </select>
          {activeDbFilterCount > 0 && (
            <button
              type="button"
              onClick={resetDbFilters}
              className={cn("flex items-center gap-1.5 px-3 py-2 text-xs transition-colors flex-shrink-0", tc.textMuted, theme !== 'light' ? 'hover:text-white' : 'hover:text-zinc-900')}
            >
              <X className="w-3.5 h-3.5" />
              Clear ({activeDbFilterCount})
            </button>
          )}
        </div>

        {/* Result count */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className={cn("text-sm", tc.textMuted)}>
            {dbFilteredTrades.length} {dbFilteredTrades.length === 1 ? 'trade' : 'trades'}
          </p>
        </div>

        {/* Full-page table / gallery */}
        {dbPagedTrades.length > 0 ? (
          dbViewMode === 'gallery' ? (
            <div className={cn("border rounded-xl p-4", theme !== 'light' ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-white border-zinc-200')}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {dbPagedTrades.map(trade => renderFeaturedCard(trade))}
              </div>

              {/* Pagination */}
              {dbPageCount > 1 && (
                <div className={cn("flex items-center justify-between px-1 pt-4 mt-4 border-t flex-wrap gap-2", theme !== 'light' ? 'border-white/10' : 'border-zinc-200')}>
                  <p className={cn("text-xs", tc.textMuted)}>
                    Page {dbPage + 1} of {dbPageCount} · {dbFilteredTrades.length} total
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDbPage(p => Math.max(0, p - 1))}
                      disabled={dbPage === 0}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-colors",
                        tc.textSecondary,
                        theme !== 'light' ? 'hover:bg-white/5' : 'hover:bg-zinc-100'
                      )}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Prev
                    </button>
                    <span className={cn("text-xs px-2", tc.textMuted)}>{dbPage + 1} / {dbPageCount}</span>
                    <button
                      type="button"
                      onClick={() => setDbPage(p => Math.min(dbPageCount - 1, p + 1))}
                      disabled={dbPage >= dbPageCount - 1}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-colors",
                        tc.textSecondary,
                        theme !== 'light' ? 'hover:bg-white/5' : 'hover:bg-zinc-100'
                      )}
                    >
                      Next
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
          <div className={cn("rounded-xl overflow-hidden border", theme !== 'light' ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-white border-zinc-200')}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className={cn("text-left", theme !== 'light' ? 'border-b border-zinc-800/70 bg-white/[0.02]' : 'border-b border-zinc-200 bg-zinc-50')}>
                    <th className={cn("px-3 py-2.5 text-[11px] uppercase tracking-wider font-medium", tc.textMuted)}>Outcome</th>
                    <th className={cn("px-3 py-2.5 text-[11px] uppercase tracking-wider font-medium", tc.textMuted)}>Date</th>
                    <th className={cn("px-3 py-2.5 text-[11px] uppercase tracking-wider font-medium", tc.textMuted)}>Trade #</th>
                    <th className={cn("px-3 py-2.5 text-[11px] uppercase tracking-wider font-medium", tc.textMuted)}>Session</th>
                    <th className={cn("px-3 py-2.5 text-[11px] uppercase tracking-wider font-medium", tc.textMuted)}>Position</th>
                    <th className={cn("px-3 py-2.5 text-[11px] uppercase tracking-wider font-medium text-right", tc.textMuted)}>Net P&L</th>
                    <th className={cn("px-3 py-2.5 text-[11px] uppercase tracking-wider font-medium text-right", tc.textMuted)}>R Multiple</th>
                    <th className={cn("px-3 py-2.5 text-[11px] uppercase tracking-wider font-medium text-right", tc.textMuted)}>Risk ($)</th>
                    <th className={cn("px-3 py-2.5 text-[11px] uppercase tracking-wider font-medium", tc.textMuted)}>Symbol</th>
                    <th className={cn("px-3 py-2.5 text-[11px] uppercase tracking-wider font-medium", tc.textMuted)}>Strategy</th>
                    <th className={cn("px-3 py-2.5 text-[11px] uppercase tracking-wider font-medium", tc.textMuted)}>Account</th>
                  </tr>
                </thead>
                <tbody>
                  {dbPagedTrades.map(trade => (
                    <TradeRow
                      key={trade.id}
                      trade={trade}
                      accountDisplayName={accountDisplayNameById.get(trade.accountId)}
                      privacyMode={privacyMode}
                      displayNumber={getDisplayTradeNumber(trade)}
                      theme={theme}
                      tc={tc}
                      onOpenDetail={handleOpenTradeDetail}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {dbPageCount > 1 && (
              <div className={cn("flex items-center justify-between px-4 py-3 border-t flex-wrap gap-2", theme !== 'light' ? 'border-white/10' : 'border-zinc-200')}>
                <p className={cn("text-xs", tc.textMuted)}>
                  Page {dbPage + 1} of {dbPageCount} · {dbFilteredTrades.length} total
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDbPage(p => Math.max(0, p - 1))}
                    disabled={dbPage === 0}
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-colors",
                      tc.textSecondary,
                      theme !== 'light' ? 'hover:bg-white/5' : 'hover:bg-zinc-100'
                    )}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Prev
                  </button>
                  <span className={cn("text-xs px-2", tc.textMuted)}>{dbPage + 1} / {dbPageCount}</span>
                  <button
                    type="button"
                    onClick={() => setDbPage(p => Math.min(dbPageCount - 1, p + 1))}
                    disabled={dbPage >= dbPageCount - 1}
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-colors",
                      tc.textSecondary,
                      theme !== 'light' ? 'hover:bg-white/5' : 'hover:bg-zinc-100'
                    )}
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
          )
        ) : (
          <div className={cn("text-center py-12 border rounded-xl", theme !== 'light' ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-white border-zinc-200')}>
            <div className="w-14 h-14 mx-auto rounded-full bg-zinc-800 flex items-center justify-center mb-3">
              <Database className={cn("w-7 h-7", tc.textMuted)} />
            </div>
            <h3 className={cn("text-base font-medium mb-1.5", tc.text)}>No trades match your filters</h3>
            <p className={cn("mb-3 text-sm", tc.textMuted)}>Try adjusting or clearing your filters</p>
            <button onClick={resetDbFilters} className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors", theme !== 'light' ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900')}>
              Clear Filters
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 min-w-0">
      {/* Hidden file input for MT4/MT5 import — shared by the trigger button(s)
          in both the Overview and Database sub-views below (only one of
          which is ever mounted at a time). */}
      <input
        ref={tradeImportInputRef}
        type="file"
        accept=".csv,.html,.htm,text/csv,text/html"
        hidden
        className="hidden"
        onChange={handleImportTradesFile}
      />
      {tradeSubView === 'overview' ? renderOverviewView() : renderDatabaseView()}

      {/* Import feedback toast */}
      {tradeImportToast && (
        <div
          key={tradeImportToast.message}
          style={{ animation: 'tradeImportToastIn 0.25s ease-out' }}
          className={cn(
            'fixed bottom-6 right-6 z-[60] max-w-sm px-4 py-3 rounded-lg text-sm font-medium shadow-2xl select-none',
            tradeImportToast.type === 'success' ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'
          )}
        >
          {tradeImportToast.message}
        </div>
      )}
      <style>{`
        @keyframes tradeImportToastIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
