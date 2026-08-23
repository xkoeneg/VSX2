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
import { useAppContext } from '../../context/AppContext';

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
  const { theme, tc } = useAppContext();
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
    <div className={cn(
      'min-w-0 rounded-xl p-4 flex flex-col border',
      theme !== 'light' ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-white border-zinc-200'
    )}>
      <div className={cn(
        'flex items-center justify-between gap-2 px-3 py-2 rounded-lg border flex-shrink-0',
        theme !== 'light' ? 'bg-zinc-800/60 border-zinc-700/50' : 'bg-zinc-100 border-zinc-200'
      )}>
        <div className="flex items-center gap-2 min-w-0">
          <Calendar className="w-4 h-4 flex-shrink-0 text-amber-400" />
          <h2 className={cn('text-sm font-semibold truncate', tc.text)}>Economic Calendar</h2>
          <span className={cn(
            'px-1.5 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0',
            theme !== 'light' ? 'bg-zinc-900/40 text-zinc-400' : 'bg-white text-zinc-500'
          )}>
            USD · High Impact
          </span>
          {!loading && !error && (
            <span className={cn(
              'px-1.5 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0',
              theme !== 'light' ? 'bg-zinc-900/40 text-zinc-400' : 'bg-white text-zinc-500'
            )}>
              {displayEvents.length}
            </span>
          )}
          {isPastDate && (
            <span className={cn(
              'px-1.5 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0',
              theme !== 'light' ? 'bg-zinc-900/40 text-zinc-400' : 'bg-white text-zinc-500'
            )}>
              Historical
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {lastUpdated && !loading && isToday && (
            <span className={cn('hidden md:inline text-[10px]', tc.textMuted)}>
              Updated {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}

          <div className={cn('flex items-center gap-0.5 rounded-lg p-0.5', theme !== 'light' ? 'bg-zinc-900/30' : 'bg-white')}>
            <button
              onClick={goPrevDay}
              className={cn(
                'p-1 rounded-md transition-colors',
                theme !== 'light' ? 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
              )}
              aria-label="Previous day"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={goToday}
              className={cn(
                'px-2 py-1 rounded-md text-[11px] font-medium transition-colors text-center whitespace-nowrap',
                isToday
                  ? (theme !== 'light' ? 'text-amber-300' : 'text-amber-700')
                  : cn(tc.textMuted, theme !== 'light' ? 'hover:bg-zinc-800/60' : 'hover:bg-zinc-100')
              )}
              aria-label="Jump to today"
            >
              {isToday ? 'Today' : selectedDateLabel}
            </button>
            <button
              onClick={goNextDay}
              className={cn(
                'p-1 rounded-md transition-colors',
                theme !== 'light' ? 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
              )}
              aria-label="Next day"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={loadCalendar}
            disabled={loading}
            className={cn(
              'p-1.5 rounded-lg transition-colors disabled:opacity-50',
              theme !== 'light' ? 'bg-zinc-900/30 hover:bg-zinc-800/60 text-zinc-300 hover:text-white' : 'bg-white hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900'
            )}
            aria-label="Refresh economic calendar"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      <div className="mt-3">
        {loading && events.length === 0 && isToday ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={cn('h-10 rounded-lg animate-pulse', theme !== 'light' ? 'bg-zinc-800/40' : 'bg-zinc-100')} />
            ))}
          </div>
        ) : error && isToday ? (
          <div className={cn(
            'text-center py-8 rounded-lg border border-dashed',
            theme !== 'light' ? 'border-rose-900/50 bg-rose-950/10' : 'border-rose-200 bg-rose-50'
          )}>
            <AlertTriangle className="w-5 h-5 mx-auto text-rose-500 mb-2" />
            <p className={cn('text-xs mb-2', theme !== 'light' ? 'text-rose-300' : 'text-rose-600')}>{error}</p>
            <button
              onClick={loadCalendar}
              className={cn(
                'inline-flex items-center gap-1 text-xs transition-colors',
                theme !== 'light' ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-500 hover:text-zinc-800'
              )}
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        ) : displayEvents.length === 0 ? (
          <div className={cn(
            'text-center py-8 rounded-lg border border-dashed',
            theme !== 'light' ? 'border-zinc-800 bg-zinc-900/30' : 'border-zinc-300 bg-zinc-50'
          )}>
            <Calendar className={cn('w-5 h-5 mx-auto mb-2', theme !== 'light' ? 'text-zinc-700' : 'text-zinc-400')} />
            <p className="text-zinc-500 text-xs">
              {isPastDate
                ? 'No cached high-impact USD events for this date'
                : 'No high-impact USD events in the current feed window'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-xs min-w-[860px]">
              <thead>
                <tr className={cn('text-zinc-500 border-b', theme !== 'light' ? 'border-zinc-800' : 'border-zinc-200')}>
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
                    <tr key={evt.id} className={cn(
                      'border-b transition-colors',
                      theme !== 'light' ? 'border-zinc-800/60 hover:bg-zinc-800/30' : 'border-zinc-100 hover:bg-zinc-50'
                    )}>
                      <td className="py-2 px-2 text-zinc-500 whitespace-nowrap">{formatEventTimePHT(evt.time)}</td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        <span className={cn(
                          'font-medium',
                          isPassed
                            ? 'text-zinc-500'
                            : isImminent
                              ? (theme !== 'light' ? 'text-amber-300' : 'text-amber-600')
                              : (theme !== 'light' ? 'text-zinc-300' : 'text-zinc-600')
                        )}>
                          {countdown}
                        </span>
                      </td>
                      <td className={cn('py-2 px-2 font-medium', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>
                        <span className="inline-flex items-center gap-1.5">
                          <span className={cn(
                            'px-1.5 py-0.5 rounded text-[10px] border flex-shrink-0',
                            theme !== 'light' ? 'border-zinc-700 text-zinc-400 bg-zinc-800/60' : 'border-zinc-200 text-zinc-500 bg-zinc-100'
                          )}>
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
                      <td className="py-2 px-2 text-right text-zinc-500 whitespace-nowrap">{evt.previous || '—'}</td>
                      <td className="py-2 px-2 text-right text-zinc-500 whitespace-nowrap">{evt.forecast || '—'}</td>
                      <td className="py-2 px-2 text-right whitespace-nowrap">
                        <span className={cn(
                          'inline-flex items-center gap-1 font-semibold',
                          trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-rose-500' : (theme !== 'light' ? 'text-white' : 'text-zinc-900')
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
