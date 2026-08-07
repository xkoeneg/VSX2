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
import { useEffect, useMemo, useState } from 'react';
import type { EconomicEvent } from '../../types';
import { cn } from '../../utils/format';
import { useEconomicCalendarFeed } from '../../hooks/useEconomicCalendarFeed';
import { formatEventTimePHT, formatCountdown, IMPACT_META, MARKET_EFFECT_META, getMarketEffect, compareActualToForecast } from '../../utils/economicCalendar';

// ============================================================
// PAST EVENTS CACHE
// ============================================================
// Whenever a USD/high-impact event prints an Actual value, we persist a
// lightweight snapshot of it to localStorage so it survives even after the
// live feed's window moves on and stops returning that event. This lets the
// card render a "Historical View" for any past date, not just today's feed.

const CALENDAR_CACHE_KEY = 'vsx.economicCalendar.pastEventsCache.v1';

interface CachedEconomicEvent {
  id: string;
  title: string;
  currency: string;
  impact: EconomicEvent['impact'];
  time: string; // ISO string, '' if unknown
  previous: string;
  forecast: string;
  actual: string;
}

function loadCalendarCache(): Record<string, CachedEconomicEvent> {
  try {
    const raw = localStorage.getItem(CALENDAR_CACHE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CachedEconomicEvent>) : {};
  } catch {
    return {};
  }
}

function saveCalendarCache(cache: Record<string, CachedEconomicEvent>) {
  try {
    localStorage.setItem(CALENDAR_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Storage can be unavailable (private mode, quota exceeded, etc.) —
    // caching is a nice-to-have, so fail silently rather than crash.
  }
}

// PHT-local yyyy-mm-dd key, used both for grouping events by "day" and for
// comparing against the currently-selected date.
function dateKeyPHT(d: Date): string {
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
}

export const EconomicCalendarCard: React.FC = () => {
  const { events, loading, error, lastUpdated, loadCalendar } = useEconomicCalendarFeed();
  // Drives the live "Time Left" countdown column — ticks independently of
  // the data refresh so countdowns stay fresh even between fetches.
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 30 * 1000);
    return () => clearInterval(tick);
  }, []);

  const usdHighImpact = useMemo(() => {
    return events
      .filter(e => e.currency === 'USD' && e.impact === 'high')
      .sort((a, b) => (a.time?.getTime() || 0) - (b.time?.getTime() || 0));
  }, [events]);

  // --- Historical cache: persist any USD/high-impact event once it has an
  // Actual value, so it's still reviewable after it drops out of the feed.
  const [pastEventsCache, setPastEventsCache] = useState<Record<string, CachedEconomicEvent>>(() => loadCalendarCache());

  useEffect(() => {
    const updates: Record<string, CachedEconomicEvent> = {};
    let changed = false;
    for (const evt of usdHighImpact) {
      if (!evt.actual) continue; // only worth caching once it has printed
      const snapshot: CachedEconomicEvent = {
        id: evt.id,
        title: evt.title,
        currency: evt.currency,
        impact: evt.impact,
        time: evt.time ? evt.time.toISOString() : '',
        previous: evt.previous,
        forecast: evt.forecast,
        actual: evt.actual,
      };
      const existing = pastEventsCache[evt.id];
      if (!existing || existing.actual !== snapshot.actual || existing.previous !== snapshot.previous || existing.forecast !== snapshot.forecast) {
        updates[evt.id] = snapshot;
        changed = true;
      }
    }
    if (changed) {
      setPastEventsCache(prev => {
        const next = { ...prev, ...updates };
        saveCalendarCache(next);
        return next;
      });
    }
    // Only re-run when the live feed actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usdHighImpact]);

  // --- Date navigation: which day's events (past, today, or upcoming) the
  // card is currently displaying. Defaults to today.
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const selectedKey = dateKeyPHT(selectedDate);
  const todayKey = dateKeyPHT(now);
  const isToday = selectedKey === todayKey;
  const isPastDate = selectedKey < todayKey;

  const goPrevDay = () => setSelectedDate(d => { const n = new Date(d); n.setDate(n.getDate() - 1); return n; });
  const goNextDay = () => setSelectedDate(d => { const n = new Date(d); n.setDate(n.getDate() + 1); return n; });
  const goToday = () => setSelectedDate(new Date());

  const selectedDateLabel = selectedDate.toLocaleDateString('en-US', {
    timeZone: 'Asia/Manila',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: selectedKey.slice(0, 4) !== todayKey.slice(0, 4) ? 'numeric' : undefined,
  });

  // Merge live feed events for the selected day with cached historical
  // snapshots for that same day. Live data wins on overlap since it's the
  // freshest source of truth (e.g. an Actual that just printed).
  const displayEvents = useMemo(() => {
    const merged = new Map<string, EconomicEvent>();

    Object.values(pastEventsCache).forEach(c => {
      if (!c.time || dateKeyPHT(new Date(c.time)) !== selectedKey) return;
      merged.set(c.id, {
        id: c.id,
        title: c.title,
        currency: c.currency,
        impact: c.impact,
        time: new Date(c.time),
        previous: c.previous,
        forecast: c.forecast,
        actual: c.actual,
      });
    });

    usdHighImpact.forEach(e => {
      if (!e.time || dateKeyPHT(e.time) !== selectedKey) return;
      merged.set(e.id, e);
    });

    return Array.from(merged.values()).sort((a, b) => (a.time?.getTime() || 0) - (b.time?.getTime() || 0));
  }, [pastEventsCache, usdHighImpact, selectedKey]);

  return (
    <div className="min-w-0 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col">
      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border flex-shrink-0 bg-amber-500/10 border-amber-500/30">
        <div className="flex items-center gap-2 min-w-0">
          <Calendar className="w-4 h-4 flex-shrink-0 text-amber-400" />
          <h2 className="text-sm font-semibold truncate text-amber-300">Economic Calendar</h2>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/30 text-zinc-300 flex-shrink-0">
            USD · High Impact
          </span>
          {!loading && !error && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/30 text-zinc-400 flex-shrink-0">
              {displayEvents.length}
            </span>
          )}
          {isPastDate && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/30 text-zinc-400 flex-shrink-0">
              Historical
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {lastUpdated && !loading && isToday && (
            <span className="hidden sm:inline text-[10px] text-zinc-500">
              Updated {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={loadCalendar}
            disabled={loading}
            className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-zinc-300 hover:text-white transition-colors disabled:opacity-50"
            aria-label="Refresh economic calendar"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-2 flex-shrink-0">
        <button
          onClick={goPrevDay}
          className="p-1 rounded-md bg-black/20 hover:bg-black/40 text-zinc-400 hover:text-white transition-colors"
          aria-label="Previous day"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={goToday}
          className={cn(
            'px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors min-w-[110px] text-center',
            isToday ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30' : 'bg-black/20 text-zinc-300 hover:bg-black/40 border border-transparent'
          )}
          aria-label="Jump to today"
        >
          {isToday ? 'Today' : selectedDateLabel}
        </button>
        <button
          onClick={goNextDay}
          className="p-1 rounded-md bg-black/20 hover:bg-black/40 text-zinc-400 hover:text-white transition-colors"
          aria-label="Next day"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="mt-3">
        {loading && events.length === 0 && isToday ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-zinc-800/40 animate-pulse" />
            ))}
          </div>
        ) : error && isToday ? (
          <div className="text-center py-8 rounded-lg border border-dashed border-rose-900/50 bg-rose-950/10">
            <AlertTriangle className="w-5 h-5 mx-auto text-rose-400 mb-2" />
            <p className="text-rose-300 text-xs mb-2">{error}</p>
            <button
              onClick={loadCalendar}
              className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        ) : displayEvents.length === 0 ? (
          <div className="text-center py-8 rounded-lg border border-dashed border-zinc-800 bg-zinc-900/30">
            <Calendar className="w-5 h-5 mx-auto text-zinc-700 mb-2" />
            <p className="text-zinc-600 text-xs">
              {isPastDate
                ? 'No cached high-impact USD events for this date'
                : 'No high-impact USD events in the current feed window'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-xs min-w-[860px]">
              <thead>
                <tr className="text-zinc-500 border-b border-zinc-800">
                  <th className="text-left font-medium py-2 px-2 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />Time (PHT)</span>
                  </th>
                  <th className="text-left font-medium py-2 px-2 whitespace-nowrap">Time Left</th>
                  <th className="text-left font-medium py-2 px-2">Event</th>
                  <th className="text-left font-medium py-2 px-2 whitespace-nowrap">Impact</th>
                  <th className="text-right font-medium py-2 px-2 whitespace-nowrap">Previous</th>
                  <th className="text-right font-medium py-2 px-2 whitespace-nowrap">Forecast</th>
                  <th className="text-right font-medium py-2 px-2 whitespace-nowrap">Actual</th>
                  <th className="text-left font-medium py-2 px-2 whitespace-nowrap">Market Effect</th>
                </tr>
              </thead>
              <tbody>
                {displayEvents.map(evt => {
                  const trend = compareActualToForecast(evt.actual, evt.forecast);
                  const meta = IMPACT_META[evt.impact];
                  const effect = getMarketEffect(evt.actual, evt.forecast);
                  const effectMeta = MARKET_EFFECT_META[effect];
                  const countdown = formatCountdown(evt.time, now);
                  const isPassed = countdown === 'Passed';
                  // "Imminent" = releasing within the next hour and not yet
                  // passed — surfaced in amber so it's easy to spot at a
                  // glance which events are about to drop.
                  const isImminent = !isPassed && evt.time !== null
                    && evt.time.getTime() - now.getTime() <= 60 * 60 * 1000;
                  return (
                    <tr key={evt.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/30 transition-colors">
                      <td className="py-2 px-2 text-zinc-400 whitespace-nowrap">{formatEventTimePHT(evt.time)}</td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        <span className={cn(
                          'font-medium',
                          isPassed ? 'text-zinc-600' : isImminent ? 'text-amber-300' : 'text-zinc-300'
                        )}>
                          {countdown}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-white font-medium">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] border border-zinc-700 text-zinc-400 bg-zinc-800/60 flex-shrink-0">
                            {evt.currency}
                          </span>
                          <span className="truncate">{evt.title.replace(/^United States\s*/i, '')}</span>
                        </span>
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        <span className={cn('px-1.5 py-0.5 rounded-full text-[10px] border', meta.className)}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right text-zinc-400 whitespace-nowrap">{evt.previous || '—'}</td>
                      <td className="py-2 px-2 text-right text-zinc-400 whitespace-nowrap">{evt.forecast || '—'}</td>
                      <td className="py-2 px-2 text-right whitespace-nowrap">
                        <span className={cn(
                          'inline-flex items-center gap-1 font-semibold',
                          trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-white'
                        )}>
                          {trend === 'up' && <TrendingUp className="w-3 h-3" />}
                          {trend === 'down' && <TrendingDown className="w-3 h-3" />}
                          {evt.actual || '—'}
                        </span>
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        <span className={cn('px-1.5 py-0.5 rounded-full text-[10px] border', effectMeta.className)}>
                          {effectMeta.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// CALCULATOR VALIDATION - Same strict rules as input fields
// ============================================================

/**
 * Validates calculator input value - strips any invalid characters.
 * Used when calculator buttons are pressed or when syncing to input fields.
 */
