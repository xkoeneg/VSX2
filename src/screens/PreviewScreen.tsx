import type React from 'react';
import { useMemo, useState } from 'react';
import {
  Eye,
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
  DollarSign,
  Percent,
  Activity,
  Calendar,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { cn } from '../utils/format';

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

// Preview mode only ever exposes these two tabs — no Dashboard, no
// Settings, no Add Trade. Kept as its own narrow union (rather than
// reusing the app-wide `ViewType`) so nothing else is even reachable
// from this screen's state.
type PreviewTab = 'trades' | 'calendar';

function formatMoney(value: number): string {
  const sign = value < 0 ? '-' : '';
  return `${sign}$${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface PreviewScreenProps {
  userId: string;
  /** Called when the viewer clicks "Exit Preview" — App.tsx wires this to strip the /preview path. */
  onExit: () => void;
}

export function PreviewScreen({ userId, onExit }: PreviewScreenProps) {
  const [passcode, setPasscode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PreviewData | null>(null);
  const [openTradeId, setOpenTradeId] = useState<string | null>(null);
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('Enter the viewer passcode.');
      return;
    }
    setIsVerifying(true);
    setError(null);
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_preview_journal', {
        p_user_id: userId,
        p_passcode: passcode.trim(),
      });
      if (rpcError) throw rpcError;
      if (!rpcData || rpcData.ok !== true) {
        setError('Incorrect passcode, or this journal is not currently shared.');
        setIsVerifying(false);
        return;
      }
      setData({
        profile: rpcData.profile,
        accounts: rpcData.accounts || [],
        trades: rpcData.trades || [],
      });
    } catch (err) {
      console.error('Preview passcode verification failed', err);
      setError('Something went wrong verifying that passcode. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Locked gate — shown until a correct passcode has been verified server-side.
  if (!data) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0c0f] px-4 py-10">
        <div className="w-full max-w-sm bg-zinc-950/85 backdrop-blur-2xl border border-zinc-800/80 shadow-2xl rounded-2xl p-6 sm:p-7">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Eye className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-white">Read-Only Preview</h2>
            <p className="mt-1.5 text-sm text-zinc-500">
              Enter the viewer passcode shared with you to view this trading journal.
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2.5 text-sm text-red-300">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label htmlFor="preview-passcode" className="block text-xs font-medium text-zinc-400 mb-1.5">
                Viewer Passcode
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  id="preview-passcode"
                  type="text"
                  autoComplete="off"
                  autoFocus
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value.toUpperCase().slice(0, 16))}
                  placeholder="e.g. 7K2QX9RT"
                  className="w-full h-11 pl-9 pr-3.5 rounded-lg bg-[#15171b] border border-zinc-800 text-white text-[16px] font-mono tracking-widest placeholder:text-zinc-600 placeholder:tracking-normal placeholder:font-sans outline-none transition-colors focus:border-emerald-600/60"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-zinc-100 text-zinc-900 text-sm font-medium hover:bg-emerald-500 hover:text-black transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isVerifying && <Loader2 className="w-4 h-4 animate-spin" />}
              {isVerifying ? 'Verifying…' : 'View Journal'}
            </button>
          </form>

          <button
            type="button"
            onClick={onExit}
            className="w-full mt-4 flex items-center justify-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <UnlockedPreview
      data={data}
      onExit={onExit}
      openTradeId={openTradeId}
      setOpenTradeId={setOpenTradeId}
      monthCursor={monthCursor}
      setMonthCursor={setMonthCursor}
    />
  );
}

// ----------------------------------------------------------------------------
// Everything below only ever renders once a valid passcode has been verified
// server-side for this userId.
// ----------------------------------------------------------------------------

function UnlockedPreview({
  data,
  onExit,
  openTradeId,
  setOpenTradeId,
  monthCursor,
  setMonthCursor,
}: {
  data: PreviewData;
  onExit: () => void;
  openTradeId: string | null;
  setOpenTradeId: (id: string | null) => void;
  monthCursor: Date;
  setMonthCursor: React.Dispatch<React.SetStateAction<Date>>;
}) {
  const [previewTab, setPreviewTab] = useState<PreviewTab>('trades');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const displayName = data.profile.displayName || 'This Trader';
  const accountsById = useMemo(() => new Map(data.accounts.map(a => [a.id, a])), [data.accounts]);
  const sortedTrades = useMemo(
    () => [...data.trades].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [data.trades]
  );

  const stats = useMemo(() => {
    const total = data.trades.length;
    const wins = data.trades.filter(t => t.profitLoss > 0).length;
    const totalPnl = data.trades.reduce((sum, t) => sum + t.profitLoss, 0);
    const grossWin = data.trades.filter(t => t.profitLoss > 0).reduce((s, t) => s + t.profitLoss, 0);
    const grossLoss = Math.abs(data.trades.filter(t => t.profitLoss < 0).reduce((s, t) => s + t.profitLoss, 0));
    const winRate = total > 0 ? (wins / total) * 100 : 0;
    const profitFactor = grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? Infinity : 0;
    return { total, winRate, totalPnl, profitFactor };
  }, [data.trades]);

  const dailyStats = useMemo(() => {
    const map = new Map<string, { pnl: number; trades: number }>();
    for (const t of data.trades) {
      const key = t.date?.slice(0, 10);
      if (!key) continue;
      const existing = map.get(key);
      if (existing) {
        existing.pnl += t.profitLoss;
        existing.trades += 1;
      } else {
        map.set(key, { pnl: t.profitLoss, trades: 1 });
      }
    }
    return map;
  }, [data.trades]);

  const openTrade = openTradeId ? data.trades.find(t => t.id === openTradeId) || null : null;

  return (
    <div className="min-h-screen w-full bg-[#0d0f12] text-white flex">
      <PreviewSidebar
        activeTab={previewTab}
        onTabChange={(tab) => {
          setPreviewTab(tab);
          setIsMobileNavOpen(false);
        }}
        isMobileNavOpen={isMobileNavOpen}
        onCloseMobileNav={() => setIsMobileNavOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Read-only banner — always visible, never scrolls away, matches the
            "Exit Preview" requirement in the spec. */}
        <div className="sticky top-0 z-30 bg-amber-500/10 border-b border-amber-500/30 backdrop-blur-sm">
          <div className="px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(true)}
                className="md:hidden flex-shrink-0 p-1.5 -ml-1 rounded-lg text-amber-200 hover:bg-amber-500/10 transition-colors"
                aria-label="Open menu"
              >
                <PanelIcon />
              </button>
              <p className="text-sm text-amber-200 flex items-center gap-2 min-w-0">
                <span className="flex-shrink-0">👀</span>
                <span className="truncate">
                  Viewing <span className="font-semibold text-amber-100">{displayName}'s</span> Journal
                  <span className="hidden sm:inline"> (Read-Only Mode)</span>
                </span>
              </p>
            </div>
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

        <div className="max-w-6xl w-full mx-auto px-4 py-6 space-y-6">
          {/* Header */}
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

          {previewTab === 'trades' ? (
            <>
              {/* High-level stats — no edit actions anywhere on this screen. */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                  icon={<DollarSign className="w-4 h-4" />}
                  label="Total P&L"
                  value={formatMoney(stats.totalPnl)}
                  positive={stats.totalPnl >= 0}
                />
                <StatCard
                  icon={<Percent className="w-4 h-4" />}
                  label="Win Rate"
                  value={`${stats.winRate.toFixed(1)}%`}
                  positive={stats.winRate >= 50}
                />
                <StatCard
                  icon={<Target className="w-4 h-4" />}
                  label="Total Trades"
                  value={String(stats.total)}
                />
                <StatCard
                  icon={stats.profitFactor >= 1 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  label="Profit Factor"
                  value={Number.isFinite(stats.profitFactor) ? stats.profitFactor.toFixed(2) : '∞'}
                  positive={stats.profitFactor >= 1}
                />
              </div>

              {/* Trade list */}
              <div>
                <h2 className="text-sm font-medium text-zinc-400 mb-3">Trade History</h2>
                <div className="space-y-2">
                  {sortedTrades.length === 0 && (
                    <p className="text-sm text-zinc-600 py-8 text-center">No trades to show yet.</p>
                  )}
                  {sortedTrades.map(trade => {
                    const account = trade.accountId ? accountsById.get(trade.accountId) : undefined;
                    return (
                      <button
                        key={trade.id}
                        type="button"
                        onClick={() => setOpenTradeId(trade.id)}
                        className="w-full flex items-center justify-between gap-3 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-left transition-colors"
                      >
                        <div className="min-w-0 flex items-center gap-3">
                          <div className={cn(
                            'w-1.5 h-8 rounded-full flex-shrink-0',
                            trade.profitLoss >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
                          )} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{trade.symbol}</p>
                            <p className="text-xs text-zinc-500 truncate">
                              {account?.name || 'Account'} · {formatDateLabel(trade.date)}
                            </p>
                          </div>
                        </div>
                        <span className={cn(
                          'text-sm font-semibold flex-shrink-0',
                          trade.profitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        )}>
                          {formatMoney(trade.profitLoss)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* Performance Calendar tab */
            <MonthCalendar monthCursor={monthCursor} setMonthCursor={setMonthCursor} dailyStats={dailyStats} />
          )}
        </div>
      </div>

      {openTrade && (
        <PreviewTradeDetail
          trade={openTrade}
          accountName={openTrade.accountId ? accountsById.get(openTrade.accountId)?.name : undefined}
          onClose={() => setOpenTradeId(null)}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Minimal, self-contained preview sidebar.
//
// Deliberately NOT the real `Sidebar.tsx` — that component reads dozens of
// fields off `useAppContext()` (the same full-app, authenticated-owner
// context PreviewScreen intentionally avoids per the module comment at the
// top of this file). Reusing it here would either require faking that
// entire context or threading a bunch of no-op state through it just to
// satisfy its props. This sidebar hardcodes exactly the two tabs preview
// mode is allowed to show — nothing else is reachable from it.
// ----------------------------------------------------------------------------
const PREVIEW_TABS: { id: PreviewTab; icon: React.ElementType; label: string }[] = [
  { id: 'trades', icon: TrendingUp, label: 'Trade History' },
  { id: 'calendar', icon: Calendar, label: 'Performance Calendar' },
];

function PanelIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  );
}

function PreviewSidebar({
  activeTab,
  onTabChange,
  isMobileNavOpen,
  onCloseMobileNav,
}: {
  activeTab: PreviewTab;
  onTabChange: (tab: PreviewTab) => void;
  isMobileNavOpen: boolean;
  onCloseMobileNav: () => void;
}) {
  const nav = (
    <div className="flex flex-col h-full w-full px-3.5 py-4 select-none">
      <div className="pb-4 mb-2 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-zinc-800 to-zinc-900 border border-emerald-500/20">
            <Activity className="w-[18px] h-[18px] text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.55)]" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-lg uppercase tracking-wider leading-none truncate text-white">VSX</h1>
            <p className="text-[10px] font-medium uppercase tracking-widest truncate mt-0.5 text-zinc-500">
              Trading Journal
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCloseMobileNav}
          aria-label="Close menu"
          className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Only these two tabs are reachable in preview mode — no Dashboard,
          no Settings, no Add Trade. */}
      <nav className="flex flex-col gap-1 w-full">
        {PREVIEW_TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'w-full flex items-center gap-3 pl-2.5 pr-3 py-2.5 rounded-lg border-l-4 transition-all text-sm cursor-pointer',
                isActive
                  ? 'border-cyan-400 bg-cyan-500/10 text-white font-medium'
                  : 'border-transparent text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              )}
            >
              <tab.icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-cyan-300' : 'text-cyan-400/80')} />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-zinc-800 flex items-center gap-2 text-xs text-zinc-600">
        <Eye className="w-3.5 h-3.5 flex-shrink-0" />
        <span>Read-only preview</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: static column */}
      <div className="hidden md:block w-60 flex-shrink-0 bg-[#0a0c0f] border-r border-zinc-800">
        {nav}
      </div>

      {/* Mobile: slide-over drawer */}
      {isMobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="w-64 h-full bg-[#0a0c0f] border-r border-zinc-800">{nav}</div>
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onCloseMobileNav} />
        </div>
      )}
    </>
  );
}

function StatCard({ icon, label, value, positive }: { icon: React.ReactNode; label: string; value: string; positive?: boolean }) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3">
      <div className="flex items-center gap-1.5 text-zinc-500 mb-1.5">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className={cn(
        'text-lg font-semibold',
        positive === undefined ? 'text-white' : positive ? 'text-emerald-400' : 'text-rose-400'
      )}>
        {value}
      </p>
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
}: {
  monthCursor: Date;
  setMonthCursor: React.Dispatch<React.SetStateAction<Date>>;
  dailyStats: Map<string, { pnl: number; trades: number }>;
}) {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const pad = (n: number) => String(n).padStart(2, '0');

  type DayCell = { day: number | null; pnl: number; trades: number };

  const paddedDays: DayCell[] = [
    ...Array.from({ length: startWeekday }, (): DayCell => ({ day: null, pnl: 0, trades: 0 })),
    ...Array.from({ length: daysInMonth }, (_, i): DayCell => {
      const day = i + 1;
      const key = `${year}-${pad(month + 1)}-${pad(day)}`;
      const stat = dailyStats.get(key);
      return { day, pnl: stat?.pnl ?? 0, trades: stat?.trades ?? 0 };
    }),
  ];
  while (paddedDays.length % 7 !== 0) paddedDays.push({ day: null, pnl: 0, trades: 0 });
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
                                {formatMoney(day.pnl)}
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
                          {formatMoney(weekPnl)}
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
                                {formatMoneyCompact(day.pnl)}
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
                        {formatMoney(weekPnl)}
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
}: {
  trade: PreviewTrade;
  accountName?: string;
  onClose: () => void;
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
              {formatMoney(trade.profitLoss)}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Field label="Symbol" value={trade.symbol} />
            <Field label="Entry" value={trade.entryPrice ?? '—'} />
            <Field label="Stop Loss" value={`${trade.stopLoss ?? '—'}${trade.slPoints ? ` (${trade.slPoints} pts)` : ''}`} />
            <Field label="Take Profit" value={`${trade.takeProfit ?? '—'}${trade.tpPoints ? ` (${trade.tpPoints} pts)` : ''}`} />
          </div>

          {(trade.riskAmount || tradeRR !== null) && (
            <div className="flex flex-wrap gap-3">
              {trade.riskAmount ? (
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
            {trade.rulesFollowed && (
              <span className={cn(
                'px-3 py-1.5 rounded-lg text-sm',
                trade.rulesFollowed === 'followed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              )}>
                Rules {trade.rulesFollowed}
              </span>
            )}
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
