import { useEffect, useRef, useState } from 'react';
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Brain,
  ChevronRight,
  Scale,
  Wallet,
  CloudCog,
  ShieldCheck,
  Users,
  Flame,
  Clock,
  Gauge,
  Activity,
  Coins,
  Lock,
  KeyRound,
  X,
} from 'lucide-react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, supabase } from '../lib/supabaseClient';
import { cn } from '../utils/format';
import VSXLogo from '../components/shared/VSXLogo';

// ============================================================================
// LoginPage — full-screen auth gate shown whenever there's no active
// Supabase session (see App.tsx: `!session ? <LoginPage /> : <AppShell />`).
// Not a dialog/overlay — there's nothing to show "behind" it pre-auth, so it
// renders as its own screen rather than a modal.
//
// Layout: full-viewport "war room map" backdrop + a perfectly centered,
// crisp auth card floating above it.
//   - Backdrop (absolute inset-0, hidden below lg): a dense anamorphic 3D
//     scatter of ~25 static preview tiles pulled from the real app screens
//     (equity chart, calendar, trade history, gauges, asset tickers, notes,
//     rules...), spread across the entire viewport edge to edge. Tiles near
//     the screen's outer edge are large, tilted, and pushed toward the
//     camera; tiles near the center are small, flat, and pushed back — like
//     looking down at a curved tactical table from above.
//   - Foreground: the actual auth container — header, Google OAuth, divider,
//     email/password form, mode switcher, trust badges.
//
// All three auth paths (Google OAuth, email sign in, email sign up) are
// handled here; the actual Supabase calls live in lib/supabaseClient.ts so
// this component only ever deals with form state + the resulting
// { data, error }.
// ============================================================================

type AuthMode = 'signIn' | 'signUp';

// ----------------------------------------------------------------------------
// Viewer-passcode brute-force guard.
//
// IMPORTANT: this is a client-side speed bump, not the real defense. It
// stops someone idly mashing the form or running a naive script against
// THIS browser, but localStorage is trivially cleared/spoofed and an
// automated attacker can just call the Supabase RPC directly with a fresh
// client token every time — so it does NOT by itself satisfy "prevent
// automated brute-force access". The actual gate has to live server-side,
// in the verify_viewer_access RPC (see sql/002_viewer_two_factor.sql),
// which rate-limits by client token AND by which profile a passcode
// matches, independent of whatever this browser reports. Keep both: this
// layer gives instant feedback and avoids spamming the network; the SQL
// layer is what actually can't be bypassed by clearing site data.
// ----------------------------------------------------------------------------
const VIEWER_ATTEMPT_MAX = 8;
const VIEWER_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
const VIEWER_TOKEN_KEY = 'vsx-viewer-attempt-token';
const VIEWER_ATTEMPT_STATE_KEY = 'vsx-viewer-attempt-state';

type ViewerAttemptState = { count: number; lockedUntil: number | null };

// Random-ish per-browser token, persisted so the count survives a page
// reload but reset by clearing site data — same caveat as above, this is
// telling the server "which browser is asking", not proving it.
function getViewerAttemptToken(): string {
  try {
    let token = localStorage.getItem(VIEWER_TOKEN_KEY);
    if (!token) {
      token = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
        ? crypto.randomUUID()
        : `t_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(VIEWER_TOKEN_KEY, token);
    }
    return token;
  } catch {
    // localStorage unavailable (private mode, etc.) — fall back to a
    // per-page-load token; the server-side limiter is still authoritative.
    return `t_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
}

function loadViewerAttemptState(): ViewerAttemptState {
  try {
    const raw = localStorage.getItem(VIEWER_ATTEMPT_STATE_KEY);
    if (!raw) return { count: 0, lockedUntil: null };
    const parsed = JSON.parse(raw);
    return {
      count: typeof parsed.count === 'number' ? parsed.count : 0,
      lockedUntil: typeof parsed.lockedUntil === 'number' ? parsed.lockedUntil : null,
    };
  } catch {
    return { count: 0, lockedUntil: null };
  }
}

function saveViewerAttemptState(state: ViewerAttemptState): void {
  try {
    localStorage.setItem(VIEWER_ATTEMPT_STATE_KEY, JSON.stringify(state));
  } catch {
    // best effort only
  }
}

// Minimal multicolor Google "G" mark — inline so the button doesn't need an
// external image asset (and works instantly, no network round trip / flash
// of missing icon).
function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-5 h-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 16.1 3 9.3 7.5 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 45c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.6 36.4 26.9 37.5 24 37.5c-5.2 0-9.6-3.3-11.3-7.9l-6.6 5.1C9.2 40.4 16 45 24 45z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.5l6.6 5.4C41.8 35.6 45 30.4 45 24c0-1.4-.1-2.7-.4-3.5z"/>
    </svg>
  );
}

// ============================================================================
// Showcase preview cards — static, non-interactive mock-ups styled after the
// real screens (Dashboard's Total P&L hero + equity chart, Accounts panel,
// Discipline banner, RulesPlaybook's rule list, TradeHistory rows,
// PerformanceCalendar's heatmap/month grid, MarketNotices, Knowledge Wiki,
// asset ticker strip, session clock, streak counter, risk gauge). Purely
// decorative: fixed demo numbers, no context/hooks, so the login screen
// never depends on live app data.
// ============================================================================

function PnLPreviewCard() {
  return (
    <div className="w-80 rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-900/60 p-5 shadow-2xl">
      <p className="text-[11px] uppercase tracking-wider font-medium text-zinc-500 mb-2">Total Profit &amp; Loss</p>
      <div className="flex items-baseline gap-2.5 flex-wrap mb-4">
        <span className="text-3xl font-bold tracking-tight tabular-nums text-emerald-500">$48,216.90</span>
        <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500">
          <TrendingUp className="w-3 h-3" />
          +12.4%
        </span>
      </div>
      <div className="flex gap-2">
        <div className="px-2.5 py-1.5 rounded-xl bg-zinc-800/60 min-w-[64px]">
          <p className="text-[9px] uppercase tracking-wider text-zinc-500">Trades</p>
          <p className="text-xs font-semibold text-white tabular-nums">312</p>
        </div>
        <div className="px-2.5 py-1.5 rounded-xl bg-zinc-800/60 min-w-[64px]">
          <p className="text-[9px] uppercase tracking-wider text-zinc-500">Win Rate</p>
          <p className="text-xs font-semibold text-white tabular-nums">64.8%</p>
        </div>
        <div className="px-2.5 py-1.5 rounded-xl bg-zinc-800/60 min-w-[64px]">
          <p className="text-[9px] uppercase tracking-wider text-zinc-500">Profit Factor</p>
          <p className="text-xs font-semibold text-white tabular-nums">2.14</p>
        </div>
      </div>
    </div>
  );
}

function DisciplinePreviewCard() {
  return (
    <div className="w-72 rounded-2xl border border-l-4 border-zinc-800/80 border-l-emerald-500 bg-zinc-900/70 p-4 shadow-2xl shadow-[0_0_18px_rgba(16,185,129,0.12)]">
      <div className="flex items-center gap-1.5 mb-3">
        <Brain className="w-4 h-4 text-violet-400" />
        <h3 className="text-sm font-semibold text-white tracking-tight">Discipline</h3>
      </div>
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="text-2xl font-bold tabular-nums text-emerald-400">78%</span>
        <span className="text-[9px] text-zinc-500 uppercase tracking-wider">follow rate</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-3">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: '78%' }} />
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="text-xs font-semibold tabular-nums">61</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400">
          <XCircle className="w-3.5 h-3.5" />
          <span className="text-xs font-semibold tabular-nums">17</span>
        </div>
        <span className="flex items-center gap-0.5 text-xs font-medium text-zinc-500 ml-1">
          Full <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}

// Mirrors the Win/Loss ratio stat — compact horizontal card, good filler
// between the larger showcase pieces.
function TradeStatsPreviewCard() {
  return (
    <div className="w-64 rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-4 shadow-2xl flex items-center gap-3">
      <div className="p-2.5 rounded-xl bg-zinc-800/60 flex-shrink-0">
        <Scale className="w-4 h-4 text-zinc-400" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider font-medium text-zinc-500">Win / Loss Ratio</p>
        <p className="text-lg font-semibold tabular-nums flex items-baseline gap-1.5">
          <span>
            <span className="text-emerald-500">202W</span>
            <span className="text-zinc-500 mx-1">-</span>
            <span className="text-rose-500">110L</span>
          </span>
          <span className="text-[10px] font-normal text-zinc-500">(312 · 64.8%)</span>
        </p>
      </div>
    </div>
  );
}

function AccountsPreviewCard() {
  return (
    <div className="w-72 rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-4 shadow-2xl relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/60" />
      <div className="pl-2">
        <div className="flex items-start justify-between mb-2 gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-white truncate mb-0.5">Apex 100K</h3>
            <p className="text-xs text-zinc-500 truncate">Apex Trader Funding</p>
          </div>
          <Wallet className="w-4 h-4 text-zinc-500 flex-shrink-0" />
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-3">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: '62%' }} />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-zinc-500">P&amp;L</span>
          <span className="text-sm font-semibold tabular-nums text-emerald-500">+$6,240.00</span>
        </div>
      </div>
    </div>
  );
}

// Mirrors RulesPlaybook's rule list — left-accent-bar rows in a handful of
// the same accent colors used for rule categories.
function PlaybookPreviewCard() {
  const rules: Array<{ label: string; accent: string }> = [
    { label: 'Wait for confirmation candle', accent: 'border-l-emerald-500' },
    { label: 'Max 2% risk per trade', accent: 'border-l-violet-500' },
    { label: 'No trading during news spikes', accent: 'border-l-amber-500' },
  ];
  return (
    <div className="w-72 rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-4 shadow-2xl">
      <p className="text-xs font-semibold text-white mb-3">Rules Playbook</p>
      <div className="space-y-2">
        {rules.map((r, i) => (
          <div key={i} className={cn('flex items-center gap-2 rounded-lg border-l-4 bg-zinc-800/40 px-2.5 py-2', r.accent)}>
            <span className="text-xs text-zinc-300 truncate">{r.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Mirrors PerformanceCalendar's win/loss heatmap grid — same rounded cells
// tinted emerald/rose/neutral depending on the day's outcome.
function CalendarHeatmapPreviewCard() {
  const cells: Array<'win' | 'loss' | 'none'> = [
    'win', 'win', 'loss', 'none', 'win', 'loss', 'win',
    'loss', 'win', 'win', 'none', 'win', 'win', 'loss',
  ];
  return (
    <div className="w-72 rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-4 shadow-2xl">
      <p className="text-xs font-semibold text-white mb-3">Performance Calendar</p>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((c, i) => (
          <div
            key={i}
            className={cn(
              'aspect-square rounded-md border',
              c === 'win' && 'bg-emerald-500/25 border-emerald-500/40',
              c === 'loss' && 'bg-rose-500/25 border-rose-500/40',
              c === 'none' && 'bg-zinc-800/40 border-zinc-800/60'
            )}
          />
        ))}
      </div>
    </div>
  );
}

// Bigger sibling of the heatmap card — a full month grid with day numbers,
// mirroring CalendarScreen's month view. Used as one of the large "anchor"
// tiles near the outer edge of the scatter.
function MonthCalendarPreviewCard() {
  const days: Array<{ n: number; kind: 'win' | 'loss' | 'none' | 'blank' }> = [
    { n: 0, kind: 'blank' }, { n: 0, kind: 'blank' }, { n: 1, kind: 'win' }, { n: 2, kind: 'loss' },
    { n: 3, kind: 'none' }, { n: 4, kind: 'win' }, { n: 5, kind: 'win' },
    { n: 6, kind: 'loss' }, { n: 7, kind: 'win' }, { n: 8, kind: 'none' }, { n: 9, kind: 'win' },
    { n: 10, kind: 'loss' }, { n: 11, kind: 'win' }, { n: 12, kind: 'win' },
    { n: 13, kind: 'none' }, { n: 14, kind: 'win' }, { n: 15, kind: 'loss' }, { n: 16, kind: 'win' },
    { n: 17, kind: 'win' }, { n: 18, kind: 'none' }, { n: 19, kind: 'win' },
  ];
  return (
    <div className="w-80 rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-4 shadow-2xl">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-white">August</p>
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">+$9,410</p>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => (
          <div
            key={i}
            className={cn(
              'aspect-square rounded-md border flex items-center justify-center text-[9px] font-medium tabular-nums',
              d.kind === 'blank' && 'border-transparent',
              d.kind === 'win' && 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
              d.kind === 'loss' && 'bg-rose-500/20 border-rose-500/40 text-rose-300',
              d.kind === 'none' && 'bg-zinc-800/40 border-zinc-800/60 text-zinc-500'
            )}
          >
            {d.kind !== 'blank' ? d.n : ''}
          </div>
        ))}
      </div>
    </div>
  );
}

// Mirrors TradeHistory's table: header row + a handful of trade rows with
// date/symbol/side/P&L columns, same uppercase-label header treatment.
function TradeHistoryPreviewCard() {
  const rows: Array<{ date: string; symbol: string; side: string; pnl: number }> = [
    { date: '08/04', symbol: 'NQ', side: 'Long', pnl: 420.5 },
    { date: '08/05', symbol: 'ES', side: 'Short', pnl: -180.25 },
    { date: '08/06', symbol: 'GC', side: 'Long', pnl: 610.0 },
    { date: '08/07', symbol: 'CL', side: 'Long', pnl: 95.75 },
  ];
  return (
    <div className="w-80 rounded-2xl border border-zinc-800/80 bg-zinc-900/70 shadow-2xl overflow-hidden">
      <div className="px-4 pt-3 pb-2 border-b border-white/5">
        <p className="text-xs font-semibold text-white">Trade History</p>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/5 text-left">
            <th className="px-3 py-1.5 text-[9px] text-zinc-500 uppercase tracking-wider font-medium">Date</th>
            <th className="px-3 py-1.5 text-[9px] text-zinc-500 uppercase tracking-wider font-medium">Symbol</th>
            <th className="px-3 py-1.5 text-[9px] text-zinc-500 uppercase tracking-wider font-medium">Side</th>
            <th className="px-3 py-1.5 text-[9px] text-zinc-500 uppercase tracking-wider font-medium text-right">P&amp;L</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-white/5 last:border-0">
              <td className="px-3 py-1.5 text-xs text-zinc-400 whitespace-nowrap">{r.date}</td>
              <td className="px-3 py-1.5 text-xs text-white font-semibold">{r.symbol}</td>
              <td className="px-3 py-1.5 text-xs text-zinc-400">{r.side}</td>
              <td className={cn('px-3 py-1.5 text-xs font-mono text-right font-bold', r.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                {r.pnl >= 0 ? '+' : ''}{r.pnl.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Mirrors Dashboard's equity curve — a small SVG sparkline with a gradient
// fill under the line, same shape language as renderEquityChart().
function EquityChartPreviewCard() {
  const points = [4, 18, 12, 30, 26, 44, 38, 58, 50, 70, 64, 82];
  const w = 260;
  const h = 64;
  const step = w / (points.length - 1);
  const max = Math.max(...points);
  const min = Math.min(...points);
  const coords = points.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / (max - min)) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const line = `M${coords.join(' L')}`;
  const area = `${line} L${w},${h} L0,${h} Z`;
  return (
    <div className="w-72 rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-4 shadow-2xl">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-white">Equity Curve</p>
        <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400">
          <TrendingUp className="w-3 h-3" /> +18.2%
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16" preserveAspectRatio="none">
        <defs>
          <linearGradient id="loginEquityFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(16,185,129)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="rgb(16,185,129)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#loginEquityFill)" stroke="none" />
        <path d={line} fill="none" stroke="rgb(16,185,129)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// Win/Loss/Break-even donut gauge — three stacked stroke-dasharray arcs
// (emerald win, rose loss, zinc break-even) with the win rate centered
// inside, plus a legend and breakdown grid. Mirrors TradesScreen's real
// TradeAnalyticsCard header (Trade History's Win/Loss donut + Total
// Trades / Win-Loss / Profit Factor / Avg Win-Loss metrics) so this login
// preview reflects an actual in-app feature rather than a generic gauge.
function WinRateGaugePreviewCard() {
  const wins = 202;
  const losses = 110;
  const breakeven = 15;
  const total = wins + losses + breakeven;
  const winRate = (wins / (wins + losses)) * 100;

  const r = 42;
  const strokeWidth = 12;
  const c = 2 * Math.PI * r;
  const winLen = (wins / total) * c;
  const lossLen = (losses / total) * c;
  const beLen = (breakeven / total) * c;

  return (
    <div className="w-56 rounded-2xl border border-white/10 bg-zinc-900/70 p-3 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="relative w-14 h-14 flex-shrink-0">
          <svg viewBox="0 0 112 112" className="w-full h-full -rotate-90">
            <circle cx="56" cy="56" r={r} fill="none" stroke="rgb(39,39,42)" strokeWidth={strokeWidth} />
            <circle
              cx="56" cy="56" r={r} fill="none" stroke="rgb(16,185,129)" strokeWidth={strokeWidth}
              strokeDasharray={`${winLen} ${c - winLen}`} strokeDashoffset={0}
            />
            <circle
              cx="56" cy="56" r={r} fill="none" stroke="rgb(244,63,94)" strokeWidth={strokeWidth}
              strokeDasharray={`${lossLen} ${c - lossLen}`} strokeDashoffset={-winLen}
            />
            <circle
              cx="56" cy="56" r={r} fill="none" stroke="rgb(161,161,170)" strokeWidth={strokeWidth}
              strokeDasharray={`${beLen} ${c - beLen}`} strokeDashoffset={-(winLen + lossLen)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold tabular-nums text-white leading-none">{winRate.toFixed(1)}%</span>
            <span className="text-[6px] uppercase tracking-wider text-zinc-500 mt-0.5">Win Rate</span>
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1 text-[9px] font-medium">
            <span className="w-1 h-1 rounded-full bg-emerald-500" />
            <span className="text-zinc-500">Wins</span>
            <span className="text-emerald-400 font-semibold tabular-nums">{wins}</span>
          </span>
          <span className="flex items-center gap-1 text-[9px] font-medium">
            <span className="w-1 h-1 rounded-full bg-rose-500" />
            <span className="text-zinc-500">Losses</span>
            <span className="text-rose-400 font-semibold tabular-nums">{losses}</span>
          </span>
          <span className="flex items-center gap-1 text-[9px] font-medium">
            <span className="w-1 h-1 rounded-full bg-zinc-400" />
            <span className="text-zinc-500">B/E</span>
            <span className="text-zinc-300 font-semibold tabular-nums">{breakeven}</span>
          </span>
        </div>
      </div>
      <div className="mt-2.5 pt-2 border-t border-white/5 grid grid-cols-2 gap-x-2 gap-y-1.5">
        <div>
          <p className="text-[6px] uppercase tracking-wider text-zinc-500 mb-0.5">Total Trades</p>
          <p className="text-[10px] font-semibold tabular-nums text-white">{total}</p>
        </div>
        <div>
          <p className="text-[6px] uppercase tracking-wider text-zinc-500 mb-0.5">Profit Factor</p>
          <p className="text-[10px] font-semibold tabular-nums text-white">2.14</p>
        </div>
        <div>
          <p className="text-[6px] uppercase tracking-wider text-zinc-500 mb-0.5">Win / Loss</p>
          <p className="text-[10px] font-semibold tabular-nums">
            <span className="text-emerald-500">{wins}W</span>
            <span className="text-zinc-600 mx-0.5">-</span>
            <span className="text-rose-500">{losses}L</span>
          </p>
        </div>
        <div>
          <p className="text-[6px] uppercase tracking-wider text-zinc-500 mb-0.5">Avg Win / Loss</p>
          <p className="text-[10px] font-semibold tabular-nums">
            <span className="text-emerald-500">$420</span>
            <span className="text-zinc-600 mx-0.5">/</span>
            <span className="text-rose-500">$180</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// Horizontal risk-per-trade gauge with a marker along a gradient track.
function RiskGaugePreviewCard() {
  return (
    <div className="w-64 rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-4 shadow-2xl">
      <div className="flex items-center gap-1.5 mb-3">
        <Gauge className="w-4 h-4 text-amber-400" />
        <p className="text-xs font-semibold text-white">Risk Per Trade</p>
      </div>
      <div className="relative h-2 rounded-full overflow-hidden bg-gradient-to-r from-emerald-500/60 via-amber-500/60 to-rose-500/60 mb-2">
        <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow ring-2 ring-zinc-950" style={{ left: '34%' }} />
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] text-zinc-500">Target 2.0%</span>
        <span className="text-sm font-semibold tabular-nums text-white">1.8%</span>
      </div>
    </div>
  );
}

// Asset ticker strip — small badges for instruments traded, each with a
// live-style price delta, mirroring icon usage across Dashboard/Trades.
function AssetTickerPreviewCard() {
  const assets: Array<{ sym: string; chg: number }> = [
    { sym: 'NQ', chg: 0.84 },
    { sym: 'ES', chg: -0.21 },
    { sym: 'GC', chg: 1.12 },
    { sym: 'CL', chg: -0.46 },
  ];
  return (
    <div className="w-72 rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-4 shadow-2xl">
      <div className="flex items-center gap-1.5 mb-3">
        <Coins className="w-4 h-4 text-zinc-400" />
        <p className="text-xs font-semibold text-white">Watchlist</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {assets.map((a, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-2.5 py-1.5">
            <span className="text-xs font-semibold text-white">{a.sym}</span>
            <span className={cn('flex items-center gap-0.5 text-[10px] font-medium tabular-nums', a.chg >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
              {a.chg >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {a.chg >= 0 ? '+' : ''}{a.chg.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Market session clock — three trading sessions with an open/closed dot,
// paper-textured filler tile.
function SessionClockPreviewCard() {
  const sessions: Array<{ name: string; time: string; open: boolean }> = [
    { name: 'Asia', time: '00:00 – 09:00', open: false },
    { name: 'London', time: '08:00 – 17:00', open: true },
    { name: 'New York', time: '13:00 – 22:00', open: true },
  ];
  return (
    <div className="w-64 rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-4 shadow-2xl">
      <div className="flex items-center gap-1.5 mb-3">
        <Clock className="w-4 h-4 text-zinc-400" />
        <p className="text-xs font-semibold text-white">Sessions</p>
      </div>
      <div className="space-y-1.5">
        {sessions.map((s, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className={cn('w-1.5 h-1.5 rounded-full', s.open ? 'bg-emerald-500' : 'bg-zinc-600')} />
              {s.name}
            </span>
            <span className="text-zinc-500 tabular-nums">{s.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Day-streak counter — flame icon + big number, mirrors Discipline streak
// stats.
function StreakPreviewCard() {
  return (
    <div className="w-56 rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-4 shadow-2xl flex items-center gap-3">
      <div className="p-2.5 rounded-xl bg-amber-500/10 flex-shrink-0">
        <Flame className="w-5 h-5 text-amber-400" />
      </div>
      <div>
        <p className="text-xl font-bold tabular-nums text-white leading-none">12</p>
        <p className="text-[10px] uppercase tracking-wider text-zinc-500 mt-1">day streak</p>
      </div>
    </div>
  );
}

// Sticky-note style rule/note card — textured "paper" filler tile, mirrors
// individual rule entries and journal notes.
function RuleNotePreviewCard() {
  return (
    <div className="w-64 rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-4 shadow-2xl">
      <div className="flex items-center gap-1.5 mb-2">
        <Activity className="w-3.5 h-3.5 text-violet-400" />
        <p className="text-[10px] uppercase tracking-wider text-zinc-500">Note</p>
      </div>
      <p className="text-xs text-zinc-300 leading-relaxed">
        Cut size in half after two losers in a row. Reset at the next winning day.
      </p>
    </div>
  );
}

// Mirrors MarketNotices' notice cards.
function NoticePreviewCard() {
  return (
    <div className="w-64 rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-4 shadow-2xl">
      <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Market Notice</p>
      <p className="text-sm font-semibold text-white mb-1">FOMC Rate Decision</p>
      <p className="text-xs text-zinc-500">High impact · 2:00 PM EST</p>
    </div>
  );
}

// Mirrors the Knowledge Wiki's entry cards — category chip + title + snippet.
function WikiPreviewCard() {
  return (
    <div className="w-64 rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-4 shadow-2xl">
      <span className="inline-block text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 mb-2">
        Strategy
      </span>
      <p className="text-sm font-semibold text-white mb-1">Order Block Entries</p>
      <p className="text-xs text-zinc-500 line-clamp-2">
        Identify the last down candle before an impulsive move up, then wait for price to return to that zone.
      </p>
    </div>
  );
}

// ============================================================================
// "War room map" backdrop — an anamorphic 3D scatter of ~25 preview tiles
// spread across the full viewport (100vw x 100vh), edge to edge. The wall
// isn't a flat grid: each tile's position, rotation, scale and z-depth are
// derived from its distance from screen center, so tiles near the outer
// edge read as large, tilted panels leaning toward the viewer, while tiles
// near the center (behind/beside the modal) read as small, flat details
// seen from directly above — the "curved tactical table" effect.
// ============================================================================

type Ring = 'outer' | 'mid' | 'inner';
type Variant = 'glass' | 'paper' | 'glow';

interface TileConfig {
  Card: () => JSX.Element;
  top: number; // percent of viewport, may be <0 or >100 to bleed off-edge
  left: number;
  ring: Ring;
  variant: Variant;
  seed: number;
}

// Per-ring visual language:
//  - outer: big, close, heavily tilted — the "leaning off the edge of the map" panels
//  - mid:   near-neutral scale/depth — the flat mid-ground of the table
//  - inner: small, flat, pushed back — fine detail glimpsed near the modal
const RING_CONFIG: Record<Ring, {
  scaleBase: number; scaleStep: number;
  zBase: number; zStep: number;
  maxTilt: number; opacity: number; floatDepth: number;
}> = {
  outer: { scaleBase: 1.18, scaleStep: 0.09, zBase: 170, zStep: 45, maxTilt: 32, opacity: 0.95, floatDepth: 28 },
  mid: { scaleBase: 0.82, scaleStep: 0.07, zBase: -10, zStep: 30, maxTilt: 15, opacity: 0.82, floatDepth: 16 },
  inner: { scaleBase: 0.46, scaleStep: 0.05, zBase: -190, zStep: 26, maxTilt: 6, opacity: 0.5, floatDepth: 10 },
};

const ROTATE_Z_JITTER = [-5, 4, -3, 6, -4, 3, 5, -6, 2, -2, 4, -3];

// Float timing/delay cycled per tile so nothing bobs in unison.
const FLOAT_CYCLE = [
  { duration: '4s', delay: '0s' },
  { duration: '4.6s', delay: '0.4s' },
  { duration: '5s', delay: '0.8s' },
  { duration: '4.3s', delay: '1.2s' },
  { duration: '4.8s', delay: '0.2s' },
  { duration: '5.4s', delay: '0.6s' },
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// The 25-tile layout: hand-placed across every edge (top, bottom, left,
// right, corners), the mid-ground, and a handful of small inner tiles
// flanking the modal — pulling from 17 distinct card types so nothing
// repeats back-to-back.
const TILE_LAYOUT: TileConfig[] = [
  // ---- outer ring: large, tilted, edge-bleeding anchor panels ----
  { Card: EquityChartPreviewCard, top: 2, left: 13, ring: 'outer', variant: 'glow', seed: 0 },
  { Card: MonthCalendarPreviewCard, top: -4, left: 50, ring: 'outer', variant: 'glass', seed: 1 },
  { Card: TradeHistoryPreviewCard, top: 5, left: 87, ring: 'outer', variant: 'paper', seed: 2 },
  { Card: WinRateGaugePreviewCard, top: 95, left: 12, ring: 'outer', variant: 'glow', seed: 3 },
  { Card: PnLPreviewCard, top: 101, left: 50, ring: 'outer', variant: 'glass', seed: 4 },
  { Card: AssetTickerPreviewCard, top: 93, left: 88, ring: 'outer', variant: 'paper', seed: 5 },
  { Card: AccountsPreviewCard, top: 46, left: -5, ring: 'outer', variant: 'glow', seed: 6 },
  { Card: RuleNotePreviewCard, top: 70, left: -7, ring: 'outer', variant: 'paper', seed: 7 },
  { Card: StreakPreviewCard, top: 40, left: 105, ring: 'outer', variant: 'glow', seed: 8 },
  { Card: RiskGaugePreviewCard, top: 67, left: 103, ring: 'outer', variant: 'paper', seed: 9 },

  // ---- mid ring: near-neutral scale, fills the mid-ground ----
  { Card: DisciplinePreviewCard, top: 15, left: 27, ring: 'mid', variant: 'glass', seed: 10 },
  { Card: CalendarHeatmapPreviewCard, top: 19, left: 75, ring: 'mid', variant: 'paper', seed: 11 },
  { Card: TradeStatsPreviewCard, top: 79, left: 25, ring: 'mid', variant: 'glass', seed: 12 },
  { Card: PlaybookPreviewCard, top: 81, left: 73, ring: 'mid', variant: 'paper', seed: 13 },
  { Card: NoticePreviewCard, top: 30, left: 7, ring: 'mid', variant: 'glow', seed: 14 },
  { Card: WikiPreviewCard, top: 61, left: 93, ring: 'mid', variant: 'glass', seed: 15 },
  { Card: SessionClockPreviewCard, top: 9, left: 61, ring: 'mid', variant: 'paper', seed: 16 },
  { Card: EquityChartPreviewCard, top: 89, left: 45, ring: 'mid', variant: 'glass', seed: 17 },
  { Card: AssetTickerPreviewCard, top: 50, left: 17, ring: 'mid', variant: 'paper', seed: 18 },

  // ---- inner ring: small, flat details near the modal ----
  { Card: TradeHistoryPreviewCard, top: 37, left: 22, ring: 'inner', variant: 'glass', seed: 19 },
  { Card: CalendarHeatmapPreviewCard, top: 59, left: 80, ring: 'inner', variant: 'paper', seed: 20 },
  { Card: WinRateGaugePreviewCard, top: 23, left: 82, ring: 'inner', variant: 'glow', seed: 21 },
  { Card: PnLPreviewCard, top: 71, left: 20, ring: 'inner', variant: 'glass', seed: 22 },
  { Card: RuleNotePreviewCard, top: 13, left: 42, ring: 'inner', variant: 'paper', seed: 23 },
  { Card: StreakPreviewCard, top: 85, left: 62, ring: 'inner', variant: 'glass', seed: 24 },
];

// ============================================================================
// STATIC 3D RESOLUTION — the anamorphic math (rotation/scale/depth from
// distance-to-center) runs exactly once, here, at module evaluation time —
// i.e. as the JS file itself loads and its top-level statements execute,
// which happens before LoginPage or WarRoomBackdrop ever render. The output
// is a plain array of literal CSS strings (`outerTransform`, `zIndex`, float
// timing, etc.), so by the time React renders the very first frame, every
// tile's 3D position is already a hardcoded value being read off this array
// — not a calculation happening during/after that render. There is no
// dynamic layout hook, no effect, and nothing computed post-mount: the
// `<Tile>` component below does zero math, it only interpolates strings
// that already exist in RESOLVED_TILES.
// ============================================================================
interface ResolvedTile {
  Card: () => JSX.Element;
  variant: Variant;
  outerStyle: React.CSSProperties;
  innerStyle: React.CSSProperties & Record<string, string | number>;
}

function resolveTile(tile: TileConfig): ResolvedTile {
  const cfg = RING_CONFIG[tile.ring];
  const dx = clamp((tile.left - 50) / 55, -1, 1);
  const dy = clamp((tile.top - 50) / 55, -1, 1);
  const rotateY = (-dx * cfg.maxTilt).toFixed(1);
  const rotateX = (dy * cfg.maxTilt).toFixed(1);
  const rotateZ = ROTATE_Z_JITTER[tile.seed % ROTATE_Z_JITTER.length];
  const scale = (cfg.scaleBase + (tile.seed % 4) * cfg.scaleStep).toFixed(2);
  const z = cfg.zBase + (tile.seed % 3) * cfg.zStep;
  const float = FLOAT_CYCLE[tile.seed % FLOAT_CYCLE.length];

  return {
    Card: tile.Card,
    variant: tile.variant,
    outerStyle: {
      top: `${tile.top}%`,
      left: `${tile.left}%`,
      transform: `translate(-50%, -50%) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) translateZ(${z}px) scale(${scale})`,
      transformStyle: 'preserve-3d',
      zIndex: Math.round(z + 300),
      willChange: 'transform',
    },
    innerStyle: {
      opacity: cfg.opacity,
      willChange: 'transform',
      '--depth': `${cfg.floatDepth}px`,
      animationDuration: float.duration,
      animationDelay: float.delay,
    },
  };
}

// Resolved once, at module scope — a hardcoded, static lookup table by the
// time any component sees it.
const RESOLVED_TILES: ResolvedTile[] = TILE_LAYOUT.map(resolveTile);

// Wraps a preview card with texture/lighting per variant: 'glass' (translucent,
// blurred edge highlight), 'paper' (subtle diagonal fiber texture), or
// 'glow' (emerald/cyan ambient projection-panel glow behind it).
function TileFrame({ variant, children }: { variant: Variant; children: React.ReactNode }) {
  // `transform-gpu` (translateZ(0)) + `will-change` promote each frame to its
  // own GPU compositor layer up front, so the blur/shadow/ring paint happens
  // once off the main thread instead of being recomputed as the parent
  // Tile's 3D transform settles on mount.
  //
  // PERF NOTE: `filter: blur()` and `backdrop-filter: blur()` are among the
  // most expensive things a browser can rasterize, and cost scales with
  // blur radius. The old glow variant ran TWO blur(150px)/blur(48px) layers
  // per tile across ~10 glow tiles, all nested inside animating 3D
  // transforms (the float + scene-drift keyframes) — that combination is
  // what was actually causing the ongoing jank, not just the mount flash.
  // Radii below are cut roughly 3-4x (150→48px, 3xl→xl) which is still
  // visually a soft ambient glow but is dramatically cheaper per frame.
  // The 'glass' variant's `backdrop-blur-[1px]` is dropped entirely — at
  // 1px it was doing almost nothing visually while still forcing a
  // continuous re-sample of whatever's behind it on every animation frame.
  if (variant === 'glow') {
    return (
      <div className="relative transform-gpu" style={{ willChange: 'transform, opacity' }}>
        <div className="absolute -inset-6 rounded-2xl bg-emerald-600/10 blur-xl -z-10 transform-gpu" aria-hidden="true" />
        <div className="rounded-2xl ring-1 ring-emerald-500/25 shadow-[0_0_45px_-8px_rgba(16,185,129,0.5)] transform-gpu">
          {children}
        </div>
      </div>
    );
  }
  if (variant === 'paper') {
    return (
      <div
        className="rounded-2xl ring-1 ring-white/5 transform-gpu"
        style={{
          backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 7px)',
          willChange: 'transform, opacity',
        }}
      >
        {children}
      </div>
    );
  }
  return (
    <div className="rounded-2xl ring-1 ring-white/10 transform-gpu" style={{ willChange: 'transform, opacity' }}>
      {children}
    </div>
  );
}

// A single positioned/tilted tile in the scatter. Every value in
// `outerStyle`/`innerStyle` was already computed at module load (see
// RESOLVED_TILES above) — this component does no math and has no dynamic
// hooks. It exists purely to lay out already-static, hardcoded style
// objects into the DOM, so the very first HTML frame the browser paints
// already has the correct 3D position, rotation, scale and depth baked in.
function Tile({ Card, variant, outerStyle, innerStyle }: ResolvedTile) {
  return (
    <div className="absolute transform-gpu" style={outerStyle}>
      <div className="login-card-float transform-gpu" style={innerStyle}>
        <TileFrame variant={variant}>
          <Card />
        </TileFrame>
      </div>
    </div>
  );
}

// Full-viewport backdrop that sits behind the centered auth modal: a dense
// anamorphic 3D scatter of preview tiles covering every edge of the screen,
// plus ambient emerald/cyan glows and ambient lighting. Purely decorative —
// pointer-events disabled so it never intercepts clicks — and hidden below
// `lg` in favor of a clean, uncluttered modal.
function WarRoomBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#0a0c0f]" aria-hidden="true">
      {/* Base ambient glows, one per corner plus a cyan accent, so the deep
          background never reads as flat black even where no tile lands.
          transform-gpu promotes these blurred layers to the compositor so
          they don't get re-painted on every frame of the scatter mounting. */}
      <div className="absolute -top-24 -left-24 w-[460px] h-[460px] rounded-full bg-emerald-600/10 blur-[150px] transform-gpu" />
      <div className="absolute -top-24 -right-24 w-[460px] h-[460px] rounded-full bg-cyan-500/10 blur-[150px] transform-gpu" />
      <div className="absolute -bottom-24 -left-24 w-[460px] h-[460px] rounded-full bg-cyan-500/10 blur-[150px] transform-gpu" />
      <div className="absolute -bottom-24 -right-24 w-[460px] h-[460px] rounded-full bg-emerald-600/10 blur-[150px] transform-gpu" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-emerald-500/5 blur-[160px] transform-gpu" />

      {/* The anamorphic scatter itself — a shared perspective origin at
          screen center, with a slow independent drift so the whole scene
          breathes. Hidden on small/medium viewports.
          `contain: layout paint` scopes reflow/repaint to this subtree so
          the 25 tiles computing their 3D transforms on mount can never
          trigger a layout pass on the auth card or the rest of the page.

          Reveal is pure CSS (`login-scatter-reveal`, fill-mode backwards)
          instead of a React `isMounted` state flip. A JS-driven toggle means
          React commits a class/style change on this whole subtree in the
          same tick that 25 CSS animations all start for the first time —
          that combined synchronous style recalc is what read as a
          split-second stutter right after refresh. A CSS-only animation
          just gets scheduled by the browser's own render pipeline with
          everything else, no extra JS-forced layout pass involved. */}
      <div
        className="hidden lg:block absolute inset-0 transform-gpu login-scatter-reveal"
        style={{
          perspective: '1400px',
          contain: 'layout paint',
          willChange: 'opacity',
        }}
      >
        <div className="login-scene-drift absolute inset-0 transform-gpu" style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}>
          {RESOLVED_TILES.map((tile, i) => (
            <Tile key={i} {...tile} />
          ))}
        </div>
      </div>

      {/* Soft edge vignette so the outer rim recedes slightly and the
          centered modal stays the clear focal point, without crushing the
          tiles that peek out alongside it into invisibility */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_15%,rgba(10,12,15,0.75)_100%)]" />
      <div className="absolute inset-0 bg-black/40" />

      <style>{`
        @keyframes login-scatter-reveal {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .login-scatter-reveal {
          animation: login-scatter-reveal 0.3s ease-out both;
        }
        @keyframes login-scene-drift {
          0% { transform: translate3d(-0.8%, -0.5%, 0) rotate(-0.25deg); }
          50% { transform: translate3d(0.8%, 0.5%, 0) rotate(0.25deg); }
          100% { transform: translate3d(-0.8%, -0.5%, 0) rotate(-0.25deg); }
        }
        .login-scene-drift {
          animation: login-scene-drift 52s ease-in-out infinite;
        }
        @keyframes login-card-float {
          0% { transform: translateZ(var(--depth)) translateY(-10px); }
          50% { transform: translateZ(var(--depth)) translateY(10px); }
          100% { transform: translateZ(var(--depth)) translateY(-10px); }
        }
        .login-card-float {
          animation-name: login-card-float;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .login-scatter-reveal, .login-scene-drift, .login-card-float { animation: none !important; opacity: 1; }
        }
        /* Edge/IE renders its own built-in eye icon inside type="password"
           inputs, which sits in the same right-aligned spot as our custom
           Eye/EyeOff toggle button and shows up as a second icon stacked
           on top of it. Chrome/Firefox don't add one, so this is a no-op
           there — safe to apply globally rather than per-input. */
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>
    </div>
  );
}

export function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // Set by PreviewScreen.tsx's reactive session guard right before it calls
  // onExit() — i.e. the owner turned "Public / Viewer Passcodes" off while
  // this viewer's tab was still open, and it just got kicked back here.
  // Read-once-and-clear so it doesn't persist across an unrelated sign-in.
  useEffect(() => {
    try {
      if (sessionStorage.getItem('vsx-preview-revoked') === '1') {
        sessionStorage.removeItem('vsx-preview-revoked');
        setInfoMsg('Public preview access is currently disabled by the owner.');
      }
    } catch {
      // sessionStorage unavailable — not worth failing sign-in over.
    }
  }, []);

  // "Have a Viewer Passcode?" — a second, unrelated entry path for people
  // who were shared a read-only preview but don't have (and don't need) an
  // account of their own. Kept as local state on this same screen rather
  // than a route, since — like the rest of this app — there's no router;
  // finding the owner and redirecting is what actually changes the URL
  // (see handleViewerPasscodeSubmit below).
  const [showPasscodeGate, setShowPasscodeGate] = useState(false);
  const [viewerPasscodeInput, setViewerPasscodeInput] = useState('');
  const [masterPasswordInput, setMasterPasswordInput] = useState('');
  const [showViewerMasterPassword, setShowViewerMasterPassword] = useState(false);
  const [isCheckingPasscode, setIsCheckingPasscode] = useState(false);
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  // Mirrors localStorage so the lockout banner/countdown can actually
  // re-render; localStorage writes alone don't trigger React updates.
  const [viewerAttemptState, setViewerAttemptState] = useState<ViewerAttemptState>(() => loadViewerAttemptState());

  const viewerLockedOut = Boolean(viewerAttemptState.lockedUntil && viewerAttemptState.lockedUntil > Date.now());
  const viewerLockoutMinutesLeft = viewerAttemptState.lockedUntil
    ? Math.max(1, Math.ceil((viewerAttemptState.lockedUntil - Date.now()) / 60000))
    : 0;

  const passcodeGateMouseDownOnBackdrop = useRef(false);
  const handleViewerPasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Re-check lockout at submit time too (not just via the disabled
    // button) in case state went stale across tabs.
    const currentState = loadViewerAttemptState();
    if (currentState.lockedUntil && currentState.lockedUntil > Date.now()) {
      setViewerAttemptState(currentState);
      setPasscodeError(`Too many failed attempts. Try again in ${Math.max(1, Math.ceil((currentState.lockedUntil - Date.now()) / 60000))} minute(s).`);
      return;
    }

    if (!viewerPasscodeInput.trim() || !masterPasswordInput.trim()) {
      setPasscodeError('Enter both the passcode and the master password.');
      return;
    }

    setIsCheckingPasscode(true);
    setPasscodeError(null);
    try {
      // verify_viewer_access is a SECURITY DEFINER RPC — it looks up which
      // profile (if any) has this passcode as either its investor_passcode
      // or friend_passcode, checks the master password against that
      // profile's bcrypt hash, AND enforces its own server-side rate limit
      // keyed by p_client_token (see sql/002_viewer_two_factor.sql). This
      // is the actual gate — the client-side lockout above is only a UX
      // nicety layered on top of it.
      //
      // On success it returns a short-lived, single-purpose access_token
      // (not the passcode or password) so the /preview page can silently
      // confirm access server-side without prompting the person again —
      // that's what removes the old second passcode modal there.
      const { data, error } = await supabase.rpc('verify_viewer_access', {
        p_passcode: viewerPasscodeInput.trim(),
        p_master_password: masterPasswordInput,
        p_client_token: getViewerAttemptToken(),
      });
      if (error) throw error;

      if (data?.locked_out) {
        const lockedUntil = data.locked_until ? new Date(data.locked_until).getTime() : Date.now() + VIEWER_LOCKOUT_MS;
        const nextState: ViewerAttemptState = { count: VIEWER_ATTEMPT_MAX, lockedUntil };
        saveViewerAttemptState(nextState);
        setViewerAttemptState(nextState);
        setPasscodeError(`Too many failed attempts. Try again in ${Math.max(1, Math.ceil((lockedUntil - Date.now()) / 60000))} minute(s).`);
        setIsCheckingPasscode(false);
        return;
      }

      if (!data?.allowed || !data?.owner_id || !data?.access_token) {
        const nextState: ViewerAttemptState = { count: currentState.count + 1, lockedUntil: null };
        saveViewerAttemptState(nextState);
        setViewerAttemptState(nextState);
        const remaining = VIEWER_ATTEMPT_MAX - nextState.count;
        setPasscodeError(
          remaining > 0
            ? `Incorrect passcode or master password. ${remaining} attempt(s) left before a 15-minute lockout.`
            : 'Incorrect passcode or master password.'
        );
        setIsCheckingPasscode(false);
        return;
      }

      // Success — clear the local attempt counter and hand off to the
      // preview page via a one-time access token, not the raw credentials.
      const clearedState: ViewerAttemptState = { count: 0, lockedUntil: null };
      saveViewerAttemptState(clearedState);
      setViewerAttemptState(clearedState);

      // Full navigation (not client-side state) so App.tsx's route check
      // picks up /preview/[id] fresh, outside AppProvider/AuthGate.
      window.location.href = `/preview/${data.owner_id}?access_token=${encodeURIComponent(data.access_token)}&mode=${encodeURIComponent(data.view_mode)}`;
    } catch (err) {
      console.error('Viewer access verification failed', err);
      setPasscodeError('Something went wrong checking that. Please try again.');
      setIsCheckingPasscode(false);
    }
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setErrorMsg(null);
    setInfoMsg(null);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Shared by both ways Supabase can signal "this email is already
  // registered" on sign-up: an explicit error, or (depending on the
  // project's email-confirmation settings) a 200 response whose `user`
  // comes back with an empty `identities` array instead of an error.
  // Unlike switchMode(), this deliberately KEEPS the email the person
  // already typed — they just switched intents (sign up -> sign in),
  // not accounts, so re-typing it would just be friction.
  const handleExistingAccount = () => {
    setMode('signIn');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setInfoMsg(null);
    setErrorMsg('An account with this email already exists. Please Sign In instead.');
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    setIsGoogleSubmitting(true);
    const { error } = await signInWithGoogle();
    // On success the browser navigates away to Google's consent screen, so
    // there's no "success" branch to handle here — only surface a failure
    // to *start* the OAuth flow (e.g. provider misconfigured).
    if (error) {
      setErrorMsg(error.message);
      setIsGoogleSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Enter both an email and a password.');
      return;
    }
    if (mode === 'signUp') {
      if (password.length < 8) {
        setErrorMsg('Password must be at least 8 characters.');
        return;
      }
      if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/;'`~]/.test(password)) {
        setErrorMsg('Password must include at least one special character.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
    }

    setIsSubmitting(true);
    const { data, error } =
      mode === 'signIn'
        ? await signInWithEmail(email.trim(), password)
        : await signUpWithEmail(email.trim(), password);
    setIsSubmitting(false);

    if (error) {
      // Supabase's wording varies by project/version ("User already
      // registered", "already registered", etc.) so match loosely rather
      // than on one exact string.
      if (mode === 'signUp' && /already (registered|exists|in use)/i.test(error.message)) {
        handleExistingAccount();
        return;
      }
      setErrorMsg(error.message);
      return;
    }

    // Some Supabase projects don't return an error for a duplicate sign-up
    // at all — instead `data.user` comes back with an empty `identities`
    // array (this is how Supabase avoids leaking which emails are already
    // registered via error responses). Same handling as the error case above.
    if (mode === 'signUp' && data.user && data.user.identities && data.user.identities.length === 0) {
      handleExistingAccount();
      return;
    }

    // Supabase's signUp() succeeds with a user but NO session whenever email
    // confirmation is required by the project's Auth settings — that's not
    // an error, but it also doesn't log the person in yet, so tell them.
    if (mode === 'signUp' && data.user && !data.session) {
      setInfoMsg('Check your inbox to confirm your email, then sign in.');
      return;
    }
    // Otherwise: session is now set, App.tsx's onAuthStateChange listener
    // picks it up and swaps this screen out for the dashboard automatically
    // — nothing else to do here.
  };

  const inputClass =
    'w-full h-11 px-3.5 rounded-lg bg-[#15171b] border border-zinc-800 text-white text-[16px] ' +
    'placeholder:text-zinc-500 outline-none transition-colors focus:border-zinc-500 focus:bg-[#181a1f]';

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#0a0c0f] px-4 py-10 overflow-hidden">
      {/* Anamorphic, edge-to-edge scatter of preview tiles + ambient glows.
          Purely decorative backdrop behind the centered modal. */}
      <WarRoomBackdrop />

      {/* Centered, floating auth modal */}
      <div className="relative z-10 w-full max-w-sm bg-zinc-950/85 backdrop-blur-2xl border border-zinc-800/80 shadow-2xl shadow-black/80 rounded-2xl p-6 sm:p-7">
        {/* Header — brand mark plus dynamic Sign In / Create Account copy
            so it never claims "welcome back" for a first-time visitor. */}
        <div className="mb-7 text-center">
          <div className="flex justify-center mb-4">
            <VSXLogo className="w-9 h-9" showText subtext="TRADING JOURNAL" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            {mode === 'signIn' ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="mt-1.5 text-sm text-zinc-500">
            {mode === 'signIn'
              ? 'Enter your account details to access your journal.'
              : 'Start tracking your trading discipline and analytics.'}
          </p>
        </div>

          {/* Google OAuth — front and center */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleSubmitting || isSubmitting}
            className="w-full h-11 flex items-center justify-center gap-2.5 rounded-lg bg-white text-zinc-900 text-sm font-medium hover:bg-zinc-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isGoogleSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* Error / info banners */}
          {errorMsg && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2.5 text-sm text-red-300">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {infoMsg && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-emerald-900/50 bg-emerald-950/40 px-3 py-2.5 text-sm text-emerald-300">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* Email / password form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="auth-email" className="block text-xs font-medium text-zinc-400 mb-1.5">
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="auth-password" className="block text-xs font-medium text-zinc-400">
                  Password
                </label>
                {mode === 'signIn' && (
                  <button
                    type="button"
                    onClick={() => setInfoMsg('Password reset isn\'t wired up yet — check back soon.')}
                    className="text-xs font-medium text-zinc-500 hover:text-white transition-colors"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'signUp' ? '8+ characters, 1 special' : '••••••••'}
                  className={cn(inputClass, 'pr-11')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signUp' && (
              <div>
                <label htmlFor="auth-confirm-password" className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="auth-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className={cn(inputClass, 'pr-11')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(v => !v)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isGoogleSubmitting}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-zinc-100 text-zinc-900 text-sm font-medium hover:bg-emerald-500 hover:text-black hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'signIn' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Bottom form switcher */}
          <p className="mt-5 text-center text-xs text-zinc-500">
            {mode === 'signIn' ? (
              <>Don't have an account?{' '}
                <button type="button" onClick={() => switchMode('signUp')} className="text-zinc-300 hover:text-white hover:underline underline-offset-2 transition-colors duration-200">
                  Sign up
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button type="button" onClick={() => switchMode('signIn')} className="text-zinc-300 hover:text-white hover:underline underline-offset-2 transition-colors duration-200">
                  Sign in
                </button>
              </>
            )}
          </p>

          {/* Viewer passcode entry — separate from the account auth above;
              anyone with a passcode can reach a read-only preview without
              creating or signing into an account. */}
          <button
            type="button"
            onClick={() => {
              setShowPasscodeGate(true);
              setPasscodeError(null);
              setViewerPasscodeInput('');
              setMasterPasswordInput('');
              setShowViewerMasterPassword(false);
              setViewerAttemptState(loadViewerAttemptState());
            }}
            className="w-full mt-3 flex items-center justify-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Have a Viewer Passcode?
          </button>

          {/* Trust badges */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80 flex items-center justify-center gap-4 text-[10px] uppercase tracking-wider text-zinc-500">
            <span className="flex items-center gap-1.5">
              <CloudCog className="w-3.5 h-3.5" />
              Cloud Synced
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Encrypted
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Multi-Account
            </span>
          </div>
      </div>

      {showPasscodeGate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onMouseDown={(e) => {
            // Records whether THIS press started on the backdrop itself
            // (e.currentTarget) vs. bubbled up from something inside the
            // card (e.g. the user pressing down inside the passcode/
            // password input to start selecting text). Click fires on
            // whichever element the mouseup lands on — if you start a
            // selection inside the card and drag past its edge before
            // releasing, mouseup (and therefore click) fires on this
            // backdrop div even though the drag began inside the card, so
            // checking only the click target isn't enough on its own.
            passcodeGateMouseDownOnBackdrop.current = e.target === e.currentTarget;
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && passcodeGateMouseDownOnBackdrop.current) {
              setShowPasscodeGate(false);
            }
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm bg-zinc-950/95 border border-zinc-800/80 rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                Viewer Passcode
              </h3>
              <button
                type="button"
                onClick={() => setShowPasscodeGate(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-500 mb-4">
              Enter the passcode and master password someone shared with you to view their trading journal in read-only mode.
            </p>

            {passcodeError && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2.5 text-sm text-red-300">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{passcodeError}</span>
              </div>
            )}

            {viewerLockedOut && !passcodeError && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-900/50 bg-amber-950/30 px-3 py-2.5 text-sm text-amber-300">
                <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Locked for {viewerLockoutMinutesLeft} more minute(s) after too many failed attempts.</span>
              </div>
            )}

            <form onSubmit={handleViewerPasscodeSubmit} className="space-y-3">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  autoFocus
                  autoComplete="off"
                  disabled={viewerLockedOut}
                  value={viewerPasscodeInput}
                  onChange={(e) => setViewerPasscodeInput(e.target.value.toUpperCase().slice(0, 16))}
                  placeholder="Passcode — e.g. 7K2QX9RT"
                  className={cn(inputClass, 'pl-9 font-mono tracking-widest placeholder:tracking-normal placeholder:font-sans disabled:opacity-50')}
                />
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type={showViewerMasterPassword ? 'text' : 'password'}
                  autoComplete="off"
                  disabled={viewerLockedOut}
                  value={masterPasswordInput}
                  onChange={(e) => setMasterPasswordInput(e.target.value)}
                  placeholder="Master password"
                  className={cn(inputClass, 'pl-9 pr-11 disabled:opacity-50')}
                />
                <button
                  type="button"
                  onClick={() => setShowViewerMasterPassword(v => !v)}
                  aria-label={showViewerMasterPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showViewerMasterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="submit"
                disabled={isCheckingPasscode || viewerLockedOut}
                className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-zinc-100 text-zinc-900 text-sm font-medium hover:bg-emerald-500 hover:text-black transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isCheckingPasscode && <Loader2 className="w-4 h-4 animate-spin" />}
                {isCheckingPasscode ? 'Verifying…' : viewerLockedOut ? 'Locked' : 'View Journal'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
