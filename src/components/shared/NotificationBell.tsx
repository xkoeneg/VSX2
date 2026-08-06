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

export const NotificationBell: React.FC<{ onViewAll: () => void }> = ({ onViewAll }) => {
  const { events, loading } = useEconomicCalendarFeed();
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

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
      if (next) markAllRead();
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
        onClick={handleToggle}
        aria-label="Notifications"
        aria-expanded={isOpen}
        className="relative h-9 w-9 flex items-center justify-center rounded-lg text-xs font-medium border border-zinc-700 bg-zinc-800 text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
      >
        <Bell className="w-4 h-4" />
        {hasUnread && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-zinc-900" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-xl shadow-2xl z-50 overflow-hidden bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-b border-zinc-800 bg-zinc-900/95">
            <div className="flex items-center gap-1.5 min-w-0">
              <Bell className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
              <h3 className="text-xs font-semibold text-white truncate">Today's USD High-Impact Events</h3>
            </div>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/30 text-zinc-400 flex-shrink-0">
              {todaysHighImpact.length}
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && todaysHighImpact.length === 0 ? (
              <div className="p-3 space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 rounded-lg bg-zinc-800/40 animate-pulse" />
                ))}
              </div>
            ) : todaysHighImpact.length === 0 ? (
              <div className="text-center py-6 px-3">
                <Calendar className="w-5 h-5 mx-auto text-zinc-700 mb-2" />
                <p className="text-zinc-600 text-xs">No high-impact USD events scheduled today</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/60">
                {todaysHighImpact.map(evt => {
                  const meta = IMPACT_META[evt.impact];
                  return (
                    <button
                      key={evt.id}
                      onClick={handleNavigate}
                      className="w-full text-left px-3 py-2.5 hover:bg-zinc-800/40 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[11px] text-zinc-400 whitespace-nowrap">{formatEventTimePHT(evt.time)}</span>
                        <span className={cn('px-1.5 py-0.5 rounded-full text-[10px] border flex-shrink-0', meta.className)}>
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-xs text-white font-medium truncate">
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
            className="w-full text-center px-3 py-2.5 text-xs font-medium text-amber-300 hover:text-amber-200 hover:bg-zinc-800/40 border-t border-zinc-800 transition-colors"
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
