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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { EconomicEvent } from '../../types';
import { cn } from '../../utils/format';
import { useEconomicCalendarFeed } from '../../hooks/useEconomicCalendarFeed';
import { getPHTDateKey, isSamePHTDay } from '../../hooks/useEconomicCalendarFeed';
import { formatEventTimePHT, formatCountdown, IMPACT_META, MARKET_EFFECT_META, getMarketEffect, compareActualToForecast } from '../../utils/economicCalendar';
import { loadNotificationReadState, saveNotificationReadState, NOTIFICATION_READ_STORAGE_KEY } from '../../utils/notifications';
import { useAppContext } from '../../context/AppContext';

export const NotificationBell: React.FC<{ onViewAll: () => void }> = ({ onViewAll }) => {
  const { theme } = useAppContext();
  const { events, loading } = useEconomicCalendarFeed();
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // The bell isn't guaranteed to sit at the true right edge of the screen —
  // it can have other header buttons (account filter, add account, etc.)
  // to its right, and their combined width varies per screen and per
  // breakpoint. A static `right-0`/`left-0` anchor on the popover
  // therefore has no reliable relationship to the actual viewport edges,
  // and can push the panel off-screen on narrow widths. Instead we measure
  // the button's real on-screen position and clamp the panel to always
  // stay fully within the viewport, recomputed on open and on resize so a
  // live window-resize (not just a fresh mobile load) also stays correct.
  const [panelPos, setPanelPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const VIEWPORT_MARGIN = 12;
  const PREFERRED_PANEL_WIDTH = 320; // matches the w-80 the panel used to render at

  const computePanelPos = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const width = Math.min(PREFERRED_PANEL_WIDTH, window.innerWidth - VIEWPORT_MARGIN * 2);
    // Prefer right-aligning the panel to the button (matches the original
    // dropdown-under-the-icon look), then clamp so neither edge can ever
    // land outside the viewport regardless of where the button sits.
    const idealLeft = rect.right - width;
    const maxLeft = window.innerWidth - width - VIEWPORT_MARGIN;
    const left = Math.max(VIEWPORT_MARGIN, Math.min(idealLeft, maxLeft));
    setPanelPos({ top: rect.bottom + 8, left, width });
  }, []);

  // Keep the panel correctly positioned through a live window resize (e.g.
  // un-maximizing/shrinking the desktop window) while it's open, not just
  // at the moment it was opened.
  useEffect(() => {
    if (!isOpen) return;
    computePanelPos();
    window.addEventListener('resize', computePanelPos);
    // capture:true so this also catches scroll events bubbling from a
    // nested scroll container (e.g. the app's main content area), not
    // just window-level scrolling.
    window.addEventListener('scroll', computePanelPos, { capture: true, passive: true });
    return () => {
      window.removeEventListener('resize', computePanelPos);
      window.removeEventListener('scroll', computePanelPos, true);
    };
  }, [isOpen, computePanelPos]);

  // Today's (PHT) USD high-impact events, earliest first — the same
  // filter the Economic Calendar card uses, narrowed to today only.
  const todaysHighImpact = useMemo(() => {
    const today = new Date();
    return events
      .filter(e => e.currency === 'USD' && e.impact === 'high' && e.time && isSamePHTDay(e.time, today))
      .sort((a, b) => (a.time?.getTime() || 0) - (b.time?.getTime() || 0));
  }, [events]);

  // Reconcile localStorage against "today" whenever the feed changes —
  // this is what makes the badge both reset at midnight PHT and reappear
  // if a brand-new event id shows up mid-day.
  useEffect(() => {
    const todayKey = getPHTDateKey(new Date());
    const stored = loadNotificationReadState();
    if (stored.date !== todayKey) {
      saveNotificationReadState({ date: todayKey, readIds: [] });
      setReadIds([]);
    } else {
      setReadIds(stored.readIds);
    }
  }, [todaysHighImpact.length]);

  const hasUnread = todaysHighImpact.some(evt => !readIds.includes(evt.id));

  // Marks every event currently in today's list as read — called the
  // moment the dropdown opens, per the "once opened, the red dot hides"
  // requirement. The list itself stays visible in the dropdown regardless.
  const markAllRead = useCallback(() => {
    const todayKey = getPHTDateKey(new Date());
    const ids = todaysHighImpact.map(evt => evt.id);
    saveNotificationReadState({ date: todayKey, readIds: ids });
    setReadIds(ids);
  }, [todaysHighImpact]);

  const handleToggle = () => {
    setIsOpen(prev => {
      const next = !prev;
      if (next) {
        markAllRead();
        computePanelPos();
      }
      return next;
    });
  };

  const handleNavigate = () => {
    setIsOpen(false);
    onViewAll();
  };

  // Close on outside click / Escape, same pattern as the account filter dropdown.
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative flex-shrink-0" ref={containerRef}>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        aria-label="Notifications"
        aria-expanded={isOpen}
        className={cn(
          'relative h-9 w-9 flex items-center justify-center rounded-lg text-xs font-medium border transition-colors',
          theme !== 'light'
            ? 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
            : 'border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
        )}
      >
        <Bell className="w-4 h-4" />
        {hasUnread && (
          <span className={cn(
            'absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2',
            theme !== 'light' ? 'ring-zinc-900' : 'ring-white'
          )} />
        )}
      </button>

      {isOpen && panelPos && (
        <div
          style={{ position: 'fixed', top: panelPos.top, left: panelPos.left, width: panelPos.width }}
          className={cn(
            'rounded-xl shadow-2xl z-50 overflow-hidden border',
            theme !== 'light' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
          )}
        >
          <div className={cn(
            'flex items-center justify-between gap-2 px-3 py-2.5 border-b',
            theme !== 'light' ? 'border-zinc-800 bg-zinc-900/95' : 'border-zinc-200 bg-white'
          )}>
            <div className="flex items-center gap-1.5 min-w-0">
              <Bell className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" />
              <h3 className={cn('text-xs font-semibold truncate', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>Today's USD High-Impact Events</h3>
            </div>
            <span className={cn(
              'px-1.5 py-0.5 rounded-full text-[10px] flex-shrink-0',
              theme !== 'light' ? 'bg-black/30 text-zinc-400' : 'bg-zinc-100 text-zinc-500'
            )}>
              {todaysHighImpact.length}
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && todaysHighImpact.length === 0 ? (
              <div className="p-3 space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={cn('h-10 rounded-lg animate-pulse', theme !== 'light' ? 'bg-zinc-800/40' : 'bg-zinc-100')} />
                ))}
              </div>
            ) : todaysHighImpact.length === 0 ? (
              <div className="text-center py-6 px-3">
                <Calendar className={cn('w-5 h-5 mx-auto mb-2', theme !== 'light' ? 'text-zinc-700' : 'text-zinc-400')} />
                <p className="text-zinc-500 text-xs">No high-impact USD events scheduled today</p>
              </div>
            ) : (
              <div className={cn('divide-y', theme !== 'light' ? 'divide-zinc-800/60' : 'divide-zinc-100')}>
                {todaysHighImpact.map(evt => {
                  const meta = IMPACT_META[evt.impact];
                  return (
                    <button
                      key={evt.id}
                      onClick={handleNavigate}
                      className={cn(
                        'w-full text-left px-3 py-2.5 transition-colors',
                        theme !== 'light' ? 'hover:bg-zinc-800/40' : 'hover:bg-zinc-50'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[11px] text-zinc-500 whitespace-nowrap">{formatEventTimePHT(evt.time)}</span>
                        <span className={cn('px-1.5 py-0.5 rounded-full text-[10px] border flex-shrink-0', meta.className)}>
                          {meta.label}
                        </span>
                      </div>
                      <p className={cn('text-xs font-medium truncate', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>
                        {evt.title.replace(/^United States\s*/i, '')}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={handleNavigate}
            className={cn(
              'w-full text-center px-3 py-2.5 text-xs font-medium border-t transition-colors',
              theme !== 'light'
                ? 'text-amber-300 hover:text-amber-200 hover:bg-zinc-800/40 border-zinc-800'
                : 'text-amber-600 hover:text-amber-700 hover:bg-zinc-50 border-zinc-200'
            )}
          >
            View All Market Notices
          </button>
        </div>
      )}
    </div>
  );
};

// Full-width card: fetches /api/calendar on mount (and every 5 min after),
// parses it, and renders a dark, sleek table of USD high-impact events.
