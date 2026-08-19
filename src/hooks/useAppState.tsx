import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
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
import { sanitizeCalculatorValue } from '../utils/calculatorHelpers';
import {
  Account, Trade, Rule, Strategy, MarketNotice, WikiEntry, SetupType, Confluence, Mistake, EmotionTag,
  CustomPillar, TradeImage, TimeframeChart, StrategyStep, ChatMessage, RoutineCategory, RoutineItem,
  ChallengeConfig, ChallengePreset, EconomicEvent, ParsedMTTrade, ViewType, GalleryView, TradeFilter,
  TradeSortField, SortOrder, PillarsPerRow, NoticeType, SessionOption, WikiCategory, RulePillar,
  RuleAccentColor, StoredData, NotebookEntry, NotebookDeletedFolder,
} from '../types';
import {
  WIKI_CATEGORIES,
} from '../constants/wiki';
import {
  TIMEFRAMES, ACCOUNT_TYPES, TRADING_ACCOUNT_TYPES, PRESET_SYMBOLS, SESSION_OPTIONS, EMOTION_OPTIONS, SESSION_SHORT_LABEL,
} from '../constants/trading';
import {
  RULE_PILLARS, RULE_PILLAR_META, RULE_PILLAR_SHORT_LABEL, RULE_SEVERITIES, RULE_SEVERITY_META,
  RULE_ACCENT_PALETTE, getRuleAccent, RULE_PILLAR_DEFAULT_COLOR, RULE_PILLAR_DEFAULT_ICON,
  RULE_ACCENT_BORDER_TOP, getAllPillarIds, getPillarMeta, getPillarShortLabel, getPillarDefaultColor,
  getPillarDefaultIcon, RULE_ICON_MAP, RULE_ICON_OPTIONS, RULE_EMOJI_OPTIONS, RULE_BULLET_STYLES,
  RULE_TEXT_SIZES, PILLAR_GRID_COLS_CLASS, PILLARS_PER_ROW_OPTIONS, getRuleIconComponent, tagMatchesRuleTitle,
} from '../constants/rules';
import {
  ROUTINE_ICON_MAP, ROUTINE_EMOJI_OPTIONS, ROUTINE_ICON_COLOR_CLASS, WEEKDAY_BY_JS_INDEX,
  WEEKDAY_CHECKBOX_ORDER, WEEKDAY_FULL_NAME, WEEKLY_CATEGORY_ID, WEEKLY_CATEGORY_LABEL,
  getWeekdayForDateKey, getLocalDateKey, itemAppliesOnDate, DURATION_PRESET_OPTIONS,
  DEFAULT_CHALLENGE_CONFIG, CHALLENGE_PRESETS, makeRoutineItems,
} from '../constants/lifeDiscipline';
import { NOTICE_TYPE_META } from '../constants/notices';
import { getTagColorStyle, DEFAULT_TAG_COLOR } from '../constants/tagColors';
import { generateId } from '../utils/id';
import standardTradingConceptsSeed from '../data/standardTradingConcepts.json';
import {
  formatCurrency, formatCurrencyAbsolute, formatCurrencyCompact, sanitizeNumericInput,
  parseFormattedPrice, formatPriceInput, formatDate, cn, buildLiveTimestamp,
} from '../utils/format';
import {
  DATA_SCHEMA_VERSION, createEmptyTimeframes, normalizeTradeImage, normalizeTimeframeChart,
  normalizeAccount, normalizeTrade, normalizeTrades, normalizeStringField, guessRulePillar,
  normalizeRule, normalizeCustomPillar, normalizeStrategyStep, normalizeStrategySteps,
  normalizeStrategyImages, normalizeStrategy, normalizeChatMessage, normalizeNotice, normalizeWiki,
  normalizeNamedItem, migrateStoredData, normalizeNotebookEntry, normalizeNotebookDeletedFolder,
} from '../utils/normalize';
import {
  parseMTNumber, parseMTTimestamp, classifyMTHeaders, rowToMTTrade, splitMTDelimitedLine,
  parseMT4MT5Csv, parseMT4MT5Html, parseMTFile, readMTReportFileText,
} from '../utils/mt4Import';
import { formatTimeDisplay, calculateTradeDurationMinutes, formatTradeDuration } from '../utils/tradeDuration';
import { detectSymbolType, calculatePoints, compressImage } from '../utils/image';
import { calculateAccountMetrics } from '../utils/accountMetrics';
import { useViewportWidth } from './useViewportWidth';
import { useClickOutside } from './useClickOutside';
import type { TagColor, RoutineIconKind, WeekDay, RoutineIconColor, RuleSeverity, RuleIconKind, RuleBulletStyle, RuleTextSize } from '../types';

// ============================================================================
// useDebouncedSupabaseWriter — generic debounced "save this payload to
// Supabase" helper, used in place of the old useDebouncedLocalStorageWriter
// now that NOTHING in this app persists to localStorage anymore. Same
// shape/rationale as the old hook (avoid re-serializing/upserting a
// multi-field payload on every keystroke/click), just pointed at a Supabase
// `upsert` call instead of `localStorage.setItem`.
// ============================================================================
function useDebouncedSupabaseWriter(delay: number = 500) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<(() => Promise<void>) | null>(null);

  const write = useCallback((runUpsert: () => Promise<void>, onError: (e: any) => void) => {
    pendingRef.current = runUpsert;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const fn = pendingRef.current;
      pendingRef.current = null;
      if (fn) {
        fn().catch(onError);
      }
    }, delay);
  }, [delay]);

  // Flush any pending write immediately (e.g. on tab close) so nothing is
  // silently dropped just because the debounce window hadn't elapsed yet.
  useEffect(() => {
    const flush = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      const fn = pendingRef.current;
      pendingRef.current = null;
      if (fn) fn().catch(() => {});
    };
    window.addEventListener('beforeunload', flush);
    return () => {
      window.removeEventListener('beforeunload', flush);
      flush();
    };
  }, []);

  return { write };
}

// ----------------------------------------------------------------------------
// Standard Trading Concepts — a read-only, pre-written seed library of core
// ICT / Price Action terms (FVG, Order Block, MSS, killzones, etc.) that the
// Knowledge Wiki can one-click import into the user's own wikiEntries. Kept
// as a typed module-level constant (parsed once, not per-render) so the
// import handler and the "already imported?" check both read from the same
// source of truth.
// ----------------------------------------------------------------------------
type StandardConceptSeed = {
  id: string;
  title: string;
  category: WikiCategory;
  overview: string;
  checklist: string[];
  sessionConfluence: { session: string; timeframe: string; notes?: string };
  tags: string[];
};

const STANDARD_TRADING_CONCEPTS = standardTradingConceptsSeed as StandardConceptSeed[];

// ----------------------------------------------------------------------------
// Notebook — default folders. A couple of sensible built-ins, always
// present, merged ahead of whatever custom folders the user has added
// (`notebookFolders` in journal_data). Not persisted themselves — they're
// implicit, so removing/renaming them here doesn't require a migration.
// ----------------------------------------------------------------------------
const DEFAULT_NOTEBOOK_FOLDERS = ['Mindset', 'Daily Reflections'] as const;

// ============================================================================
// useAppState — the entire journal's state + business logic.
//
// This hook is a (mostly) verbatim extraction of what used to be the top of
// the giant App() component. Every screen/modal component reads from and
// calls into this via AppContext (see src/context/AppContext.tsx) rather
// than receiving a long prop list -- that's what lets screens live in their
// own files without every function signature having to change.
// ============================================================================
export function useAppState() {
  // ---- Supabase Auth ----
  // `authLoading` covers the brief window before the very first
  // getSession() resolves — App.tsx uses it to show a blank/loading screen
  // instead of flashing the LoginPage before we actually know whether a
  // session already exists (e.g. from a previous visit's persisted token).
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Declared here (ahead of the auth effect below) purely so the effect's
  // SIGNED_IN handler can call setView without forward-referencing it.
  const [view, setView] = useState<ViewType>('dashboard');

  // Tracks the signed-in user across onAuthStateChange firings so the
  // effect below can tell a genuine "you just logged in" transition apart
  // from supabase-js re-emitting a SIGNED_IN event for the SAME user —
  // which it does on window/tab focus (it revalidates the session on
  // visibilitychange), on token refresh in some client versions, and when
  // multiple tabs are open. None of those are an actual new login, so none
  // of them should ever reset the active screen.
  const previousUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const applySession = (newSession: Session | null, opts?: { authoritative?: boolean }) => {
      if (!isMounted) return;

      if (newSession) {
        previousUserIdRef.current = newSession.user?.id ?? null;
        setSession(newSession);
        setAuthLoading(false);
        return;
      }

      // No session came back. This can be a transient false-negative —
      // the same race that used to flicker the sidebar's display name back
      // to "Account" on refresh — not necessarily a real sign-out. If we
      // treated it as authoritative here, `userId` below would briefly go
      // null, and any add/edit/delete a person makes during that window
      // would silently skip its Supabase write (see the `if (userId)`
      // guards further down) with no error and no retry — invisible data
      // loss that only surfaces on the next reload. So: only actually
      // clear the session (and send the user to LoginPage / stop syncing)
      // on an explicit SIGNED_OUT event. Otherwise keep whatever session
      // we already have and let the next getSession()/onAuthStateChange
      // firing correct things.
      if (opts?.authoritative) {
        previousUserIdRef.current = null;
        setSession(null);
      }
      setAuthLoading(false);
    };

    // Picks up any session already persisted (localStorage, by default)
    // from a previous visit, without waiting for onAuthStateChange to fire.
    supabase.auth.getSession().then(({ data: { session } }) => {
      applySession(session);
    });

    // Fires on every subsequent sign-in, sign-out, token refresh, tab
    // focus/visibility change, and (for the Google OAuth redirect flow)
    // when Supabase picks the session up out of the URL after the provider
    // sends the user back. This is the single source of truth App.tsx
    // reads to decide LoginPage vs the dashboard — no manual "did login
    // succeed?" plumbing needed anywhere.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      const previousUserId = previousUserIdRef.current;
      const newUserId = newSession?.user?.id ?? null;

      applySession(newSession, { authoritative: event === 'SIGNED_OUT' });

      // Force the landing screen back to the Dashboard ONLY on a genuine
      // fresh sign-in — nobody was signed in a moment ago, and now someone
      // is (password sign-in, or Google OAuth bouncing back through this
      // same listener). Checking event === 'SIGNED_IN' alone isn't enough:
      // supabase-js fires that same event again for the SAME user on
      // window/tab focus (Alt-Tab back into the app, switching browser
      // tabs, PWA regaining focus), which — before this check — was
      // silently yanking people back to Dashboard from whatever screen
      // they were actually on. Comparing the user id across firings is
      // what tells a real login apart from that re-emission.
      if (event === 'SIGNED_IN' && previousUserId === null && newUserId !== null) {
        setView('dashboard');
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOutUser = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  // Convenience derived value — every accounts/trades Supabase call below
  // is scoped to this, both to satisfy RLS and as a client-side belt-and-
  // suspenders check against accidentally reading/writing without a user.
  const userId = session?.user?.id ?? null;

  // State
  const [privacyMode, setPrivacyMode] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'minecraft'>('dark');

  // Ref to the main scrollable workspace container. Used to reset scroll
  // position back to the top whenever the active page/tab changes, so
  // switching between sidebar links (e.g. Trade History -> Dashboard ->
  // Trade History) always lands the user at the top of the fresh view
  // instead of preserving the previous page's scroll offset.
  const mainScrollRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0;
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [view]);

  // Keep the actual <body> background in sync with the active theme. Without
  // this, the browser's default white background can peek through as a gap
  // (e.g. mobile browser chrome resizing viewport height) since our app
  // container is sized with h-dvh rather than covering the true document.
  useEffect(() => {
    document.body.style.backgroundColor = theme === 'light' ? '#fafafa' : theme === 'minecraft' ? '#2b2b2b' : '#0b0c0e';
  }, [theme]);
  const [isExportConfirmOpen, setIsExportConfirmOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Sleek Settings Modal — houses everything that used to live as loose
  // clutter at the bottom of the sidebar (theme/privacy + data backup).
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsModalTab, setSettingsModalTab] = useState<'appearance' | 'backup'>('appearance');
  // PHASE 0 (Mobile Instrumentation): tracks whether the off-canvas mobile
  // sidebar drawer is open. Fully independent from `sidebarCollapsed`, which
  // remains the desktop-only expand/collapse control.
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [galleryView, setGalleryView] = useState<GalleryView>('gallery');
  const [tradeSubView, setTradeSubView] = useState<'overview' | 'database'>('overview');
  const [dbSearch, setDbSearch] = useState('');
  const [dbAccountFilter, setDbAccountFilter] = useState<string>('all');
  const [dbSessionFilter, setDbSessionFilter] = useState<string>('all');
  const [dbOutcomeFilter, setDbOutcomeFilter] = useState<TradeFilter>('all');
  const [dbRulesFilter, setDbRulesFilter] = useState<'all' | 'followed' | 'broken'>('all');
  const [dbPage, setDbPage] = useState(0);
  const [dbViewMode, setDbViewMode] = useState<'table' | 'gallery'>('table');
  const DB_PAGE_SIZE = 25;
  const [tradeFilter, setTradeFilter] = useState<TradeFilter>('all');
  const [tradeSortField, setTradeSortField] = useState<TradeSortField>('date');
  const [tradeSortOrder, setTradeSortOrder] = useState<SortOrder>('desc');
  const viewportWidth = useViewportWidth();
  const equityChartContainerRef = useRef<HTMLDivElement>(null);
  const [equityChartWidth, setEquityChartWidth] = useState(800);
  useEffect(() => {
    const el = equityChartContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) setEquityChartWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(['all']);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  // Calculator state
  const [calculatorState, setCalculatorState] = useState<{
    show: boolean;
    fieldId: string;
    value: string;
    position: { top: number; left: number };
    allowNegative: boolean;
  }>({ show: false, fieldId: '', value: '', position: { top: 0, left: 0 }, allowNegative: false });

  const activeInputRef = useRef<HTMLInputElement | null>(null);

  const resetCalculator = useCallback(() => {
    setCalculatorState({ show: false, fieldId: '', value: '', position: { top: 0, left: 0 }, allowNegative: false });
  }, []);

  const handleNumberInputFocus = (e: React.FocusEvent<HTMLInputElement>, fieldId: string, currentValue: string, allowNegative: boolean = false) => {
    const rect = e.target.getBoundingClientRect();
    activeInputRef.current = e.target;

    const CALC_WIDTH = 220;
    const CALC_HEIGHT = 280;
    const MARGIN = 10;

    const spaceBelow = window.innerHeight - rect.bottom;
    let top: number;
    if (spaceBelow >= CALC_HEIGHT + MARGIN) {
      top = rect.bottom + 4;
    } else {
      const aboveTop = rect.top - CALC_HEIGHT - 4;
      top = aboveTop >= MARGIN ? aboveTop : Math.max(MARGIN, window.innerHeight - CALC_HEIGHT - MARGIN);
    }

    setCalculatorState({
      show: true,
      fieldId,
      value: currentValue,
      position: {
        top,
        left: Math.max(MARGIN, Math.min(rect.left, window.innerWidth - CALC_WIDTH - MARGIN)),
      },
      allowNegative,
    });
  };

  // Calculator change handler - enforces strict validation
  const handleCalculatorChange = (value: string) => {
    // The calculator already sanitizes input, but double-check here
    const sanitized = sanitizeCalculatorValue(value, calculatorState.allowNegative);
    setCalculatorState(prev => ({ ...prev, value: sanitized }));
    updateFieldFromCalculator(calculatorState.fieldId, sanitized);
  };

  const updateFieldFromCalculator = (fieldId: string, value: string) => {
    const numVal = parseFormattedPrice(value);

    if (fieldId.startsWith('trade-')) {
      const key = fieldId.replace('trade-', '');
      setPriceInputs(prev => ({ ...prev, [key]: value }));

      if (key === 'entryPrice') {
        setNewTrade(prev => ({
          ...prev,
          entryPrice: numVal,
          slPoints: calculatePoints(prev.symbol || '', numVal, prev.stopLoss || 0),
          tpPoints: calculatePoints(prev.symbol || '', numVal, prev.takeProfit || 0),
        }));
      } else if (key === 'stopLoss') {
        setNewTrade(prev => ({
          ...prev,
          stopLoss: numVal,
          slPoints: calculatePoints(prev.symbol || '', prev.entryPrice || 0, numVal),
        }));
      } else if (key === 'takeProfit') {
        setNewTrade(prev => ({
          ...prev,
          takeProfit: numVal,
          tpPoints: calculatePoints(prev.symbol || '', prev.entryPrice || 0, numVal),
        }));
      } else if (key === 'profitLoss') {
        setNewTrade(prev => ({ ...prev, profitLoss: numVal }));
      } else if (key === 'riskAmount') {
        setNewTrade(prev => ({ ...prev, riskAmount: numVal }));
      } else if (key === 'trackingNumber') {
        setNewTrade(prev => ({ ...prev, trackingNumber: value }));
      }
    } else if (fieldId.startsWith('account-')) {
      const key = fieldId.replace('account-', '');
      if (key === 'startingBalance') {
        setNewAccount(prev => ({ ...prev, startingBalance: numVal, highestBalance: numVal }));
      } else if (key === 'profitTarget') {
        setNewAccount(prev => ({ ...prev, profitTarget: numVal }));
      } else if (key === 'maxDrawdownAllowance') {
        setNewAccount(prev => ({ ...prev, maxDrawdownAllowance: numVal }));
      } else if (key === 'fixedMinBalance') {
        setNewAccount(prev => ({ ...prev, fixedMinBalance: numVal }));
      }
    } else if (fieldId.startsWith('editaccount-')) {
      const key = fieldId.replace('editaccount-', '');
      if (key === 'startingBalance') {
        setEditingAccount(prev => ({ ...prev, startingBalance: numVal }));
      } else if (key === 'profitTarget') {
        setEditingAccount(prev => ({ ...prev, profitTarget: numVal }));
      } else if (key === 'maxDrawdownAllowance') {
        setEditingAccount(prev => ({ ...prev, maxDrawdownAllowance: numVal }));
      } else if (key === 'fixedMinBalance') {
        setEditingAccount(prev => ({ ...prev, fixedMinBalance: numVal }));
      }
    }
  };

  const handleCalculatorEnter = useCallback(() => {
    // Previously this tried to auto-advance focus to "the next field" in the
    // form, but the next *visible* field is often in a completely different
    // section (e.g. Risk ($) -> Setup Types, once Entry/SL/TP is collapsed
    // and the file inputs are skipped), which still yanked the modal down to
    // wherever that section happened to sit. Enter on the calculator should
    // just confirm the value and close the popup in place — no focus jump,
    // no scroll, nothing. The field that was being edited simply keeps its
    // value and stays right where the user is looking.
    if (activeInputRef.current) {
      // Re-focus the field itself (no-op if it's already focused) purely so
      // the blinking cursor / focus ring stays put after the popup closes,
      // with zero scrolling.
      activeInputRef.current.focus({ preventScroll: true });
    }
  }, []);

  const closeCalculator = useCallback(() => {
    setCalculatorState(prev => ({ ...prev, show: false }));
  }, []);

  // Data state
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  // True while the initial Supabase fetch for accounts/trades is in flight
  // (and again briefly after sign-in). Screens can use this to avoid
  // flashing an "empty" state before the real data has arrived.
  const [accountsTradesLoading, setAccountsTradesLoading] = useState(true);

  // One-time snapshot of whatever accounts/trades used to live in
  // localStorage, captured synchronously on first render — i.e. BEFORE any
  // effect (including the debounced 'tradingJournal' save effect further
  // down) has a chance to run and potentially overwrite that key. Used
  // exactly once, by the Supabase migration effect below, to carry
  // pre-existing local data up to a freshly-signed-in user's account so it
  // isn't silently orphaned by this localStorage -> Supabase switch.
  const legacyAccountsTradesRef = useRef<{ accounts: Account[]; trades: Trade[] } | null>(null);
  if (legacyAccountsTradesRef.current === null) {
    try {
      const stored = localStorage.getItem('tradingJournal');
      const raw = stored ? JSON.parse(stored) : null;
      const migratedLegacy = raw ? migrateStoredData(raw) : null;
      legacyAccountsTradesRef.current = {
        accounts: migratedLegacy?.accounts ?? [],
        trades: migratedLegacy?.trades ?? [],
      };
    } catch (e) {
      console.error('Failed to read legacy localStorage accounts/trades for migration:', e);
      legacyAccountsTradesRef.current = { accounts: [], trades: [] };
    }
  }
  const hasAttemptedMigrationRef = useRef(false);

  const [rules, setRules] = useState<Rule[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [notices, setNotices] = useState<MarketNotice[]>([]);
  const [wikiEntries, setWikiEntries] = useState<WikiEntry[]>([]);
  const [setupTypes, setSetupTypes] = useState<SetupType[]>([]);
  const [confluences, setConfluences] = useState<Confluence[]>([]);
  const [mistakesList, setMistakesList] = useState<Mistake[]>([]);
  const [emotionsList, setEmotionsList] = useState<EmotionTag[]>(() =>
    EMOTION_OPTIONS.map(name => ({ id: generateId(), name, color: 'purple' as TagColor }))
  );
  const [customSymbols, setCustomSymbols] = useState<string[]>([]);
  const [customPillars, setCustomPillars] = useState<CustomPillar[]>([]);

  // ---- Notebook ----
  // Custom folder NAMES only — small config-like list, persisted inside the
  // journal_data blob (see Journal Data section) alongside setupTypes/
  // confluences/etc. The entries themselves live in their own Supabase
  // table (own-row-per-entry, like `trades`) and are loaded/state-managed
  // separately below.
  const [notebookFolders, setNotebookFolders] = useState<string[]>([]);
  // Per-folder color override (folder name/path -> NOTEBOOK_COVER_COLORS
  // id) and soft-deleted folders — both small config-like slices, so they
  // live in journal_data right alongside notebookFolders itself.
  const [notebookFolderColors, setNotebookFolderColors] = useState<Record<string, string>>({});
  const [notebookDeletedFolders, setNotebookDeletedFolders] = useState<NotebookDeletedFolder[]>([]);
  const [notebookEntries, setNotebookEntries] = useState<NotebookEntry[]>([]);
  // True while the initial Supabase fetch for notebook entries is in
  // flight — mirrors accountsTradesLoading's purpose for this table.
  const [notebookEntriesLoading, setNotebookEntriesLoading] = useState(true);

  // ---- MT4/MT5 Trade Import: UI state ----
  const tradeImportInputRef = useRef<HTMLInputElement | null>(null);
  const [isImportingTrades, setIsImportingTrades] = useState(false);
  const [tradeImportToast, setTradeImportToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const tradeImportToastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showTradeImportToast = (type: 'success' | 'error', message: string) => {
    setTradeImportToast({ type, message });
    if (tradeImportToastTimeoutRef.current) clearTimeout(tradeImportToastTimeoutRef.current);
    tradeImportToastTimeoutRef.current = setTimeout(() => setTradeImportToast(null), 4000);
  };
  useEffect(() => () => {
    if (tradeImportToastTimeoutRef.current) clearTimeout(tradeImportToastTimeoutRef.current);
  }, []);

  // ---- MT4/MT5 Trade Import: duplicate ticket-ID check ----
  // Duplicate checking is done ENTIRELY against the live `trades` array in
  // state (see handleImportTradesFile below) — no separate tracking list or
  // localStorage log. This keeps the guard automatically correct: deleting a
  // trade removes its ticket ID from `trades`, so re-importing the same file
  // immediately works again, and since `trades` itself is the persisted
  // source of truth, the check is just as reliable across refreshes and app
  // relaunches.
  // How many pillar columns the Trading Rules card shows per row (2–6).
  // Purely a display preference — not persisted to the trading journal
  // schema, so it always starts at a sensible default per session.
  const [pillarsPerRow, setPillarsPerRow] = useState<PillarsPerRow>(3);

  // ---- Playbook: Daily Trading Creed quote card ----
  // Each quote carries its own short attribution/tag line (shown bottom-right
  // of the card) instead of one static label for every quote.
  interface CreedQuote { text: string; tag: string; }
  const DEFAULT_CREED_QUOTES: CreedQuote[] = [
    { text: "Discipline is choosing between what you want now and what you want most.", tag: "Rule #0: Mindset First" },
    { text: "The market rewards patience and punishes impulse. Wait for A+ setups only.", tag: "Rule #1: Patience Over Impulse" },
    { text: "Protect your capital first. Profits are a byproduct of survival.", tag: "Rule #2: Capital Preservation" },
    { text: "Plan the trade, trade the plan. No exceptions, no excuses.", tag: "Rule #3: Process Over Outcome" },
    { text: "You don't need to trade every day to be a great trader.", tag: "Rule #4: Selective Execution" },
    { text: "Cut losses fast, let winners run — the oldest rule, still the truest.", tag: "Rule #5: Risk Management" },
  ];
  // User's own quotes — now persisted per-user in Supabase (see the
  // "Preferences: Supabase" section below), not localStorage. `customCreedQuotesLoaded`
  // doubles as the general "preferences have loaded" gate, kept under its
  // original name so nothing downstream has to change.
  const [customCreedQuotes, setCustomCreedQuotes] = useState<CreedQuote[]>([]);
  const [customCreedQuotesLoaded, setCustomCreedQuotesLoaded] = useState(false);
  const allCreedQuotes = useMemo(() => [...DEFAULT_CREED_QUOTES, ...customCreedQuotes], [customCreedQuotes]);
  const [creedIndex, setCreedIndex] = useState(0);
  const [isEditingCreed, setIsEditingCreed] = useState(false);
  const [creedDraftText, setCreedDraftText] = useState('');
  const [creedDraftTag, setCreedDraftTag] = useState('');
  const currentCreedQuote: CreedQuote = allCreedQuotes[creedIndex] ?? DEFAULT_CREED_QUOTES[0];
  const isCurrentCreedCustom = creedIndex >= DEFAULT_CREED_QUOTES.length;
  // Tracks the calendar date (YYYY-MM-DD) the current creedIndex was picked
  // for, seeded from the loaded preferences row (see loadPreferences) and
  // updated by the daily-rotation effect / shuffleDailyCreed above. Kept in
  // a ref (not state) since it's bookkeeping for the rotation effect, not
  // something any component reads directly.
  const dailyCreedDateRef = useRef<string>('');

  // Daily auto-rotation — once per calendar day the card lands on a fresh
  // quote automatically; the chosen index + date are cached (in the Supabase
  // `preferences` row's dailyCreedState field — see loadPreferences below) so
  // it stays put for the rest of the day (and across reloads/devices) until
  // the date rolls over or the user hits Shuffle. This effect only handles
  // the "date rolled over, pick something new" case; the initial restore of
  // a same-day pick happens once, straight out of loadPreferences.
  useEffect(() => {
    if (!customCreedQuotesLoaded) return;
    const todayKeyStr = new Date().toLocaleDateString('en-CA');
    if (dailyCreedDateRef.current === todayKeyStr) return; // already rotated today
    const newIndex = Math.floor(Math.random() * allCreedQuotes.length);
    dailyCreedDateRef.current = todayKeyStr;
    setCreedIndex(newIndex);
  }, [customCreedQuotesLoaded, allCreedQuotes.length]);

  // Shuffle — jumps to a different random quote from the combined pool
  // (defaults + the user's favorites) and remembers the pick for today.
  const shuffleDailyCreed = () => {
    dailyCreedDateRef.current = new Date().toLocaleDateString('en-CA');
    setCreedIndex(prev => {
      if (allCreedQuotes.length <= 1) return prev;
      let next = prev;
      while (next === prev) next = Math.floor(Math.random() * allCreedQuotes.length);
      return next;
    });
  };

  const openCreedEditor = () => {
    setCreedDraftText(currentCreedQuote.text);
    setCreedDraftTag(currentCreedQuote.tag);
    setIsEditingCreed(true);
  };

  const saveCreedEdit = () => {
    const text = creedDraftText.trim();
    if (!text) { setIsEditingCreed(false); return; }
    const tag = creedDraftTag.trim() || 'Rule #0: Mindset First';
    if (isCurrentCreedCustom) {
      const customIdx = creedIndex - DEFAULT_CREED_QUOTES.length;
      setCustomCreedQuotes(prev => prev.map((q, i) => (i === customIdx ? { text, tag } : q)));
    } else {
      // Built-in quotes are immutable — editing one forks a new custom quote
      // instead, and the card switches to display that new copy.
      setCustomCreedQuotes(prev => {
        setCreedIndex(DEFAULT_CREED_QUOTES.length + prev.length);
        return [...prev, { text, tag }];
      });
    }
    setIsEditingCreed(false);
  };

  const deleteCurrentCreedQuote = () => {
    if (!isCurrentCreedCustom) return;
    const customIdx = creedIndex - DEFAULT_CREED_QUOTES.length;
    setCustomCreedQuotes(prev => prev.filter((_, i) => i !== customIdx));
    setCreedIndex(0);
    setIsEditingCreed(false);
  };

  // Highlights key psychological "power words" inside a creed quote with an
  // accent gradient so they stand out from the surrounding italic text —
  // works for the built-in quotes and gracefully no-ops for custom quotes
  // that don't happen to use any of these phrases.
  const CREED_EMPHASIS_WORDS = [
    'plan the trade', 'trade the plan', 'let winners run', 'cut losses',
    'great trader', 'no exceptions', 'no excuses', 'discipline', 'patience',
    'impulse', 'capital', 'survival', 'protect', 'rewards', 'punishes', 'a+',
  ];
  const renderCreedQuoteText = (text: string) => {
    const sorted = [...CREED_EMPHASIS_WORDS].sort((a, b) => b.length - a.length);
    const escaped = sorted.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');
    const parts = text.split(pattern);
    return parts.map((part, i) => {
      const isMatch = sorted.some(w => w.toLowerCase() === part.toLowerCase());
      return isMatch ? (
        <span key={i} className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent font-bold not-italic">
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      );
    });
  };

  // ---- Playbook: Pre-Session Protocol checklist ----
  const PRE_SESSION_CHECKLIST_ITEMS: { id: string; label: string }[] = [
    { id: 'htf-levels', label: 'HTF Levels Marked' },
    { id: 'news-check', label: 'News Event Check' },
    { id: 'mindset-check', label: 'Mindset Check' },
    { id: 'max-loss-set', label: 'Max Loss Limit Set' },
  ];
  const [preSessionChecklist, setPreSessionChecklist] = useState<Record<string, boolean>>({
    'htf-levels': false,
    'news-check': false,
    'mindset-check': false,
    'max-loss-set': false,
  });
  const togglePreSessionItem = (id: string) => {
    setPreSessionChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const resetPreSessionChecklist = () => {
    setPreSessionChecklist({ 'htf-levels': false, 'news-check': false, 'mindset-check': false, 'max-loss-set': false });
  };
  const preSessionCompletedCount = Object.values(preSessionChecklist).filter(Boolean).length;

  // Modal state
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showEditAccount, setShowEditAccount] = useState<string | null>(null);
  const [showAddTrade, setShowAddTrade] = useState(false);
  const [showEditTrade, setShowEditTrade] = useState(false);
  const [showTradeDetail, setShowTradeDetail] = useState<string | null>(null);
  const [detailNotesDraft, setDetailNotesDraft] = useState<{ mistakesAnalysis: string; lessonsLearned: string }>({ mistakesAnalysis: '', lessonsLearned: '' });
  // Widened to include undefined: rulesFollowed itself is now optional on
  // Trade (a trade can exist with no Followed/Broken judgment made yet), so
  // seeding this draft straight from t.rulesFollowed (see the useEffect
  // around line 1797) needs the state to be able to hold that same
  // "not set" case instead of being forced to fake a starting value.
  const [detailRulesFollowedDraft, setDetailRulesFollowedDraft] = useState<'followed' | 'broken' | undefined>(undefined);
  const [showDisciplineReview, setShowDisciplineReview] = useState<string | null>(null);
  const [disciplineReviewDraft, setDisciplineReviewDraft] = useState<{ emotions: string[]; mistakes: string[]; notes: string }>({ emotions: [], mistakes: [], notes: '' });
  // 2-pane split-view modal opened from Rule Adherence Log items — left pane is
  // a static, read-only trade preview; right pane toggles between a read-only
  // psychology summary and the editable review form, sharing the same
  // disciplineReviewDraft state as the Pending Review "+ Review" flow above.
  const [showRuleReviewModal, setShowRuleReviewModal] = useState<string | null>(null);
  const [isEditingRuleReview, setIsEditingRuleReview] = useState(false);
  const [showAddRule, setShowAddRule] = useState(false);
  const [showManageRulesModal, setShowManageRulesModal] = useState(false);
  const [showAddStrategy, setShowAddStrategy] = useState(false);
  const [viewStrategyId, setViewStrategyId] = useState<string | null>(null);
  const [newStrategy, setNewStrategy] = useState<{ title: string; market: string; description: string; steps: StrategyStep[]; images: TradeImage[] }>({ title: '', market: '', description: '', steps: [], images: [] });
  const [editingStrategyId, setEditingStrategyId] = useState<string | null>(null);
  const [strategyPendingDelete, setStrategyPendingDelete] = useState<string | null>(null);
  const [stepPendingDeleteId, setStepPendingDeleteId] = useState<string | null>(null);
  const [draggingStepImageId, setDraggingStepImageId] = useState<string | null>(null);
  const [dragOverStepImageId, setDragOverStepImageId] = useState<string | null>(null);
  // Drag-reorder state for the main cover carousel's multi-image manager in
  // the edit modal (separate from the per-step drag state above).
  const [draggingCoverImageId, setDraggingCoverImageId] = useState<string | null>(null);
  const [dragOverCoverImageId, setDragOverCoverImageId] = useState<string | null>(null);
  // Drag-reorder state for the Market Notice screenshot manager (mirrors the
  // cover-image drag state above, scoped separately for the notice modal).
  const [draggingNoticeImageId, setDraggingNoticeImageId] = useState<string | null>(null);
  const [dragOverNoticeImageId, setDragOverNoticeImageId] = useState<string | null>(null);
  // Step-by-step breakdown builder for Market Notices (mirrors the Strategy
  // Model step builder above) — lets a single insight/trap be explained
  // across multiple stages, each with its own notes and screenshot(s).
  const [noticeStepPendingDeleteId, setNoticeStepPendingDeleteId] = useState<string | null>(null);
  const [draggingNoticeStepImageId, setDraggingNoticeStepImageId] = useState<string | null>(null);
  const [dragOverNoticeStepImageId, setDragOverNoticeStepImageId] = useState<string | null>(null);
  // Drag-reorder state for the Strategy Model gallery itself — lets the user
  // drag any strategy card into any position (e.g. pin a model to the front).
  const [draggingStrategyId, setDraggingStrategyId] = useState<string | null>(null);
  const [dragOverStrategyId, setDragOverStrategyId] = useState<string | null>(null);
  // Which cover slide the Preview Mode carousel is currently showing —
  // reset to 0 whenever a different strategy is opened.
  const [strategyCoverIndex, setStrategyCoverIndex] = useState(0);
  const strategyImageInputRef = useRef<HTMLInputElement>(null);
  // Scroll container for the single-row "Active Strategy Models" carousel —
  // the < / > nav buttons and drag-to-scroll both act on this ref.
  const strategyCarouselRef = useRef<HTMLDivElement>(null);
  // Live scroll-position state driving the nav arrows' active/disabled look —
  // recalculated on every scroll event (mouse drag, arrow click, trackpad, etc.)
  // and whenever the strategy list itself changes (add/remove/reorder).
  const [canScrollLeftStrategy, setCanScrollLeftStrategy] = useState(false);
  const [canScrollRightStrategy, setCanScrollRightStrategy] = useState(false);
  const updateStrategyScrollState = useCallback(() => {
    const el = strategyCarouselRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollLeftStrategy(el.scrollLeft > 1);
    setCanScrollRightStrategy(el.scrollLeft < maxScrollLeft - 1);
  }, []);
  useEffect(() => {
    const el = strategyCarouselRef.current;
    if (!el) return;
    updateStrategyScrollState();
    el.addEventListener('scroll', updateStrategyScrollState, { passive: true });
    window.addEventListener('resize', updateStrategyScrollState);
    return () => {
      el.removeEventListener('scroll', updateStrategyScrollState);
      window.removeEventListener('resize', updateStrategyScrollState);
    };
  }, [strategies, updateStrategyScrollState]);
  const scrollStrategyCarousel = (direction: 'left' | 'right') => {
    const el = strategyCarouselRef.current;
    if (!el) return;
    // Scroll by exactly one "page" — the container's own visible width,
    // which is precisely the 5-card + gap offset since 5 cards fill it edge-to-edge.
    const amount = el.clientWidth;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };
  // Dynamic step builder can have any number of steps, each with its own
  // optional screenshot uploader — keyed ref map instead of one ref per step.
  const strategyStepImageInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  // Same keyed-ref pattern as strategyStepImageInputRefs, scoped to the
  // Market Notice step builder's per-step screenshot uploaders.
  const noticeStepImageInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [showAddNotice, setShowAddNotice] = useState(false);
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);
  const [showAddWiki, setShowAddWiki] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const [showExpandGallery, setShowExpandGallery] = useState(false);
  const [executionImageIndex, setExecutionImageIndex] = useState(0);
  const [timeframeImageIndices, setTimeframeImageIndices] = useState<Record<string, number>>({});

  const [showTradeTimeFields, setShowTradeTimeFields] = useState(false);
  const [showTradePriceLevels, setShowTradePriceLevels] = useState(false);
  const [rulesAdherenceError, setRulesAdherenceError] = useState(false);

  // Dropdown state
  const [showAccountTypeDropdown, setShowAccountTypeDropdown] = useState(false);
  const [showTradingAccountTypeDropdown, setShowTradingAccountTypeDropdown] = useState(false);
  const [showSymbolDropdown, setShowSymbolDropdown] = useState(false);
  const [symbolCustomInput, setSymbolCustomInput] = useState('');
  const [showSessionDropdown, setShowSessionDropdown] = useState(false);
  const [showTradeControlsPanel, setShowTradeControlsPanel] = useState(false);

  // Trade selection (for bulk delete on Trade History page)
  const [tradeSelectMode, setTradeSelectMode] = useState(false);
  const [selectedTradeIds, setSelectedTradeIds] = useState<string[]>([]);
  const [showDeleteSelectedConfirm, setShowDeleteSelectedConfirm] = useState(false);
  const [accountPendingDelete, setAccountPendingDelete] = useState<string | null>(null);
  const [tradePendingDelete, setTradePendingDelete] = useState<string | null>(null);

  const noticeImageInputRef = useRef<HTMLInputElement>(null);
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const tradingAccountTypeDropdownRef = useRef<HTMLDivElement>(null);
  const accountTypeDropdownRef = useRef<HTMLDivElement>(null);
  const symbolDropdownRef = useRef<HTMLDivElement>(null);
  const sessionDropdownRef = useRef<HTMLDivElement>(null);
  const tradeControlsPanelRef = useRef<HTMLDivElement>(null);

  useClickOutside(accountDropdownRef, useCallback(() => setShowAccountDropdown(false), []), showAccountDropdown);
  useClickOutside(tradingAccountTypeDropdownRef, useCallback(() => setShowTradingAccountTypeDropdown(false), []), showTradingAccountTypeDropdown);
  useClickOutside(accountTypeDropdownRef, useCallback(() => setShowAccountTypeDropdown(false), []), showAccountTypeDropdown);
  useClickOutside(symbolDropdownRef, useCallback(() => setShowSymbolDropdown(false), []), showSymbolDropdown);
  useClickOutside(sessionDropdownRef, useCallback(() => setShowSessionDropdown(false), []), showSessionDropdown);
  useClickOutside(tradeControlsPanelRef, useCallback(() => setShowTradeControlsPanel(false), []), showTradeControlsPanel);

  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // Discipline Tracker — Streak Progress Grid lookback window (30/60/90 trades)
  const [streakGridWindow, setStreakGridWindow] = useState<30 | 60 | 90>(30);

  // Discipline Tracker — Mini Discipline Calendar month, independent of the
  // main Performance Calendar's month so browsing one doesn't affect the other.
  const [disciplineCalendarMonth, setDisciplineCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // Discipline Tracker — Mini Discipline Calendar day popover: the date string
  // (YYYY-MM-DD) of the currently open day flyout, or null when closed.
  const [openDisciplineDay, setOpenDisciplineDay] = useState<string | null>(null);
  const disciplineCalendarGridRef = useRef<HTMLDivElement>(null);
  useClickOutside(disciplineCalendarGridRef, useCallback(() => setOpenDisciplineDay(null), []), openDisciplineDay !== null);

  // Discipline Tracker — Psychology & Behavioral Analytics timeframe filters.
  // The Emotions and Mistakes cards each track their own independent
  // timeframe so the user can compare e.g. "This Week" emotions against
  // "All-Time" mistakes; the section's Global Timeframe dropdown is a master
  // toggle that snaps both cards to the same value when changed.
  type DisciplineAnalyticsTimeframe = 'week' | 'month' | 'lastMonth' | '3months' | 'all';
  const [emotionsTimeframe, setEmotionsTimeframe] = useState<DisciplineAnalyticsTimeframe>('month');
  const [mistakesTimeframe, setMistakesTimeframe] = useState<DisciplineAnalyticsTimeframe>('month');
  const disciplineAnalyticsTimeframeOptions: { value: DisciplineAnalyticsTimeframe; label: string }[] = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: '3months', label: 'Last 3 Months' },
    { value: 'all', label: 'All-Time' },
  ];

  // Form state
  const [newAccount, setNewAccount] = useState<Partial<Account>>({
    name: '',
    startingBalance: 10000,
    type: 'Eval',
    propFirm: '',
    hasProfitTarget: false,
    profitTarget: 0,
    maxDrawdown: 0,
    tradingAccountType: 'LIVE',
    highestBalance: 10000,
    maxDrawdownAllowance: 0,
    fixedMinBalance: 0,
  });
  const [editingAccount, setEditingAccount] = useState<Partial<Account>>({});

  const initializeEmptyTimeframes = (): TimeframeChart[] => {
    return TIMEFRAMES.map(tf => ({
      name: tf,
      images: [],
      notes: '',
    }));
  };

  const [newTrade, setNewTrade] = useState<Partial<Trade>>({
    symbol: 'NQ',
    profitLoss: 0,
    entryPrice: 0,
    stopLoss: 0,
    takeProfit: 0,
    setupTypes: [],
    confluences: [],
    mistakes: [],
    rulesFollowed: undefined,
    timeframes: initializeEmptyTimeframes(),
    executionImages: [],
    riskAmount: 0,
    mistakesAnalysis: '',
    lessonsLearned: '',
    accountId: '',
    date: new Date().toLocaleDateString('en-CA'), // Initialize with today's local date
  });

  const [priceInputs, setPriceInputs] = useState({
    entryPrice: '',
    stopLoss: '',
    takeProfit: '',
    profitLoss: '',
    riskAmount: '',
  });

  const [newRule, setNewRule] = useState<Partial<Rule>>({ category: '', title: '', description: '', severity: 'warning', pillar: 'risk', iconKind: 'icon', iconValue: RULE_PILLAR_DEFAULT_ICON.risk, color: RULE_PILLAR_DEFAULT_COLOR.risk, bulletStyle: 'bullet', textSize: 'normal' });
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [showRuleIconPicker, setShowRuleIconPicker] = useState(false);
  const [ruleIconPickerTab, setRuleIconPickerTab] = useState<'emoji' | 'icons' | 'color'>('emoji');
  const emptyNoticeDraft = { type: 'mistake' as NoticeType, title: '', session: '' as SessionOption | '', tag: '', images: [] as TradeImage[], steps: [] as StrategyStep[], description: '', whatHappenedTitle: '', keyTakeawayTitle: '', consequence: '', prevention: '', preventionTitle: '' };
  const [newNotice, setNewNotice] = useState<{ type: NoticeType; title: string; session: SessionOption | ''; tag: string; images: TradeImage[]; steps: StrategyStep[]; description: string; whatHappenedTitle: string; keyTakeawayTitle: string; consequence: string; prevention: string; preventionTitle: string }>(emptyNoticeDraft);
  const [newWiki, setNewWiki] = useState<Partial<WikiEntry> & { images: TradeImage[] }>({ title: '', content: '', category: WIKI_CATEGORIES[0], images: [], keyRules: [], bestSession: '', timeframe: '', contextNotes: '' });
  const [editingWikiId, setEditingWikiId] = useState<string | null>(null);
  // Which entry's full-detail modal is open, if any.
  const [viewWikiId, setViewWikiId] = useState<string | null>(null);
  // Deleting a wiki entry always goes through a confirmation prompt first
  // (see DeleteWikiConfirm) — this holds the id awaiting confirmation.
  const [wikiPendingDelete, setWikiPendingDelete] = useState<string | null>(null);
  // Same confirmation pattern for a single Key Rules / Conditions row inside
  // the Add/Edit Wiki modal — holds the row's index awaiting confirmation.
  const [wikiRulePendingDeleteIndex, setWikiRulePendingDeleteIndex] = useState<number | null>(null);
  const wikiImageInputRef = useRef<HTMLInputElement>(null);
  // Points at the "Upload diagram image" dropzone inside the Add/Edit Wiki
  // modal. When set, the modal scrolls it into view and focuses it on open —
  // used by the "quick image edit" click from the main preview placeholder.
  const wikiImageDropzoneRef = useRef<HTMLDivElement>(null);
  // True for one render after the modal opens when it should immediately
  // draw attention to the image dropzone (see handleOpenEditWiki's focusImage arg).
  const [wikiImageFocusRequested, setWikiImageFocusRequested] = useState(false);
  // True while a file is being dragged over the modal's image dropzone, so it
  // can render an active drop-target state.
  const [isWikiImageDragActive, setIsWikiImageDragActive] = useState(false);
  // Drag-to-reorder state for the multi-image grid in the Add/Edit Wiki
  // modal — mirrors draggingCoverImageId/dragOverCoverImageId for strategies.
  const [draggingWikiImageId, setDraggingWikiImageId] = useState<string | null>(null);
  const [dragOverWikiImageId, setDragOverWikiImageId] = useState<string | null>(null);
  // Which slide of a multi-image wiki entry is currently shown, in both the
  // Knowledge Wiki workbench panel and the full-detail preview modal.
  const [wikiCoverIndex, setWikiCoverIndex] = useState(0);
  // Option B: "AI Auto-Fill" — true while a request to the auto-fill
  // endpoint is in flight, drives the button's loading/pulse state.
  const [isWikiAutoFilling, setIsWikiAutoFilling] = useState(false);

  const [selectedTimeframeTab, setSelectedTimeframeTab] = useState<string>('Execution/Result');

  // R:R calculation
  const calculatedRR = useMemo(() => {
    const pnl = newTrade.profitLoss || 0;
    const risk = newTrade.riskAmount || 0;
    if (risk === 0) return null;
    return pnl / risk;
  }, [newTrade.profitLoss, newTrade.riskAmount]);

  // Shared debounced writers for the large, high-frequency Supabase payloads
  // below (journal data + preferences). Same rationale as before: these
  // payloads can carry multi-MB base64 screenshots, so re-serializing +
  // upserting on every keystroke would stutter the UI.
  const { write: writeJournalData } = useDebouncedSupabaseWriter(500);
  const { write: writePreferences } = useDebouncedSupabaseWriter(500);

  // ==========================================================================
  // Journal Data: Supabase (per-user, synced across devices)
  // ==========================================================================
  // Rules/Playbook (rules, strategies, customPillars), Market Notices,
  // Knowledge Wiki, and Custom Tags (setupTypes, confluences, mistakesList,
  // emotionsList, customSymbols) all live together as one JSONB document in
  // `public.journal_data`, one row per user (`user_id` is the primary key
  // and the sole thing every query filters on). This mirrors how
  // accounts/trades already store their full object as `data jsonb` — it
  // lets the client-side shape evolve without a schema migration every
  // time, while RLS still guarantees the row is only ever readable/writable
  // by its owner.
  const [journalDataLoading, setJournalDataLoading] = useState(true);
  const hasLoadedJournalDataRef = useRef(false);

  const loadJournalData = useCallback(async (uid: string) => {
    setJournalDataLoading(true);
    hasLoadedJournalDataRef.current = false;
    try {
      const { data: row, error } = await supabase
        .from('journal_data')
        .select('data')
        .eq('user_id', uid)
        .maybeSingle();
      if (error) throw error;

      const migrated = migrateStoredData({ ...(row?.data as StoredData | undefined) });
      setRules(migrated.rules);
      setStrategies(migrated.strategies);
      setNotices(migrated.notices);
      setWikiEntries(migrated.wikiEntries);
      setSetupTypes(migrated.setupTypes);
      setConfluences(migrated.confluences);
      setMistakesList(migrated.mistakesList);
      setEmotionsList(migrated.emotionsList);
      setCustomSymbols(migrated.customSymbols);
      setCustomPillars(migrated.customPillars);
      setNotebookFolders(migrated.notebookFolders);
      setNotebookFolderColors(migrated.notebookFolderColors);
      setNotebookDeletedFolders(migrated.notebookDeletedFolders);
    } catch (e) {
      console.error('Failed to load journal data from Supabase:', e);
      showTradeImportToast('error', 'Failed to load your Playbook/Notices/Wiki/Tags — check your connection and reload.');
    } finally {
      hasLoadedJournalDataRef.current = true;
      setJournalDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) loadJournalData(userId);
  }, [userId, loadJournalData]);

  // Debounced save — fires on every change to any of these slices, but is
  // deliberately a no-op until the initial load above has actually
  // completed (hasLoadedJournalDataRef), so the empty default state this
  // hook starts with can never race ahead and overwrite what's already
  // saved server-side before it's even been fetched.
  useEffect(() => {
    if (!userId || !hasLoadedJournalDataRef.current) return;
    const payload = { rules, strategies, notices, wikiEntries, setupTypes, confluences, mistakesList, emotionsList, customSymbols, customPillars, notebookFolders, notebookFolderColors, notebookDeletedFolders };
    writeJournalData(
      async () => {
        const { error } = await supabase
          .from('journal_data')
          .upsert({ user_id: userId, data: payload }, { onConflict: 'user_id' });
        if (error) throw error;
      },
      (e: any) => {
        console.error('Failed to save journal data to Supabase:', e);
        showTradeImportToast('error', 'Failed to save your changes — they may not sync to other devices. Check your connection.');
      }
    );
  }, [userId, rules, strategies, notices, wikiEntries, setupTypes, confluences, mistakesList, emotionsList, customSymbols, customPillars, notebookFolders, notebookFolderColors, notebookDeletedFolders, writeJournalData]);

  // ==========================================================================
  // Accounts & Trades: Supabase (per-user, synced across devices)
  // ==========================================================================
  // Each row stores the full Account/Trade object as jsonb in `data` (so the
  // client-side shape can evolve without a schema migration every time),
  // plus `id`, `user_id`, and (for trades) `account_id` as real columns for
  // RLS, foreign keys, and indexing. `rowToRecord` reassembles the two back
  // into a plain Account/Trade for React state.
  const rowToRecord = useCallback(<T extends { id: string }>(row: { id: string; data: any }): T => ({
    ...(row.data as T),
    id: row.id,
  }), []);

  const loadAccountsAndTrades = useCallback(async (uid: string) => {
    setAccountsTradesLoading(true);
    try {
      const [{ data: accountRows, error: accErr }, { data: tradeRows, error: tradeErr }] = await Promise.all([
        supabase.from('accounts').select('id, data').eq('user_id', uid),
        supabase.from('trades').select('id, data').eq('user_id', uid),
      ]);
      if (accErr) throw accErr;
      if (tradeErr) throw tradeErr;

      let loadedAccounts = (accountRows || []).map(r => rowToRecord<Account>(r));
      let loadedTrades = (tradeRows || []).map(r => rowToRecord<Trade>(r));

      // One-time migration: if this user has nothing in Supabase yet but
      // this browser had pre-existing accounts/trades in localStorage
      // (from before this feature shipped), push that data up now instead
      // of silently orphaning it. Runs at most once per mount.
      if (
        !hasAttemptedMigrationRef.current &&
        loadedAccounts.length === 0 &&
        loadedTrades.length === 0
      ) {
        hasAttemptedMigrationRef.current = true;
        const legacy = legacyAccountsTradesRef.current;
        if (legacy && (legacy.accounts.length > 0 || legacy.trades.length > 0)) {
          try {
            if (legacy.accounts.length > 0) {
              const { error } = await supabase.from('accounts').insert(
                legacy.accounts.map(a => ({ id: a.id, user_id: uid, data: a }))
              );
              if (error) throw error;
            }
            if (legacy.trades.length > 0) {
              const { error } = await supabase.from('trades').insert(
                legacy.trades.map(t => ({ id: t.id, user_id: uid, account_id: t.accountId, data: t }))
              );
              if (error) throw error;
            }
            loadedAccounts = legacy.accounts;
            loadedTrades = legacy.trades;
            showTradeImportToast('success', 'Moved your existing accounts and trades to your account — they’ll now sync across devices.');
          } catch (e) {
            console.error('Failed to migrate legacy accounts/trades to Supabase:', e);
            showTradeImportToast('error', 'Found local accounts/trades but couldn’t sync them to your account. They’re safe locally — try reloading.');
          }
        }
      }

      setAccounts(loadedAccounts);
      setTrades(loadedTrades);
    } catch (e) {
      console.error('Failed to load accounts/trades from Supabase:', e);
      showTradeImportToast('error', 'Failed to load your accounts/trades — check your connection and reload.');
    } finally {
      setAccountsTradesLoading(false);
    }
  }, [rowToRecord]);

  useEffect(() => {
    if (userId) {
      loadAccountsAndTrades(userId);
    }
  }, [userId, loadAccountsAndTrades]);

  // ==========================================================================
  // Notebook Entries: Supabase (per-user, synced across devices)
  // ==========================================================================
  // Own row per entry in `public.notebook_entries` (id, user_id, data jsonb),
  // same pattern as `trades` — NOT folded into the journal_data blob, since
  // entries can grow large/numerous over time unlike that blob's small
  // config-like slices. `notebookFolders` (just the folder names) is the
  // one small piece of Notebook state that DOES live in journal_data — see
  // the Journal Data section above.
  const loadNotebookEntries = useCallback(async (uid: string) => {
    setNotebookEntriesLoading(true);
    try {
      const { data: rows, error } = await supabase
        .from('notebook_entries')
        .select('id, data')
        .eq('user_id', uid);
      if (error) throw error;
      const normalized = (rows || []).map(r => normalizeNotebookEntry({ ...(r.data as any), id: r.id }));

      // Auto-purge: entries in "Recently Deleted" for 30+ days are removed
      // for good, same as most note apps' trash retention window. Runs
      // quietly (no toast) — this is routine housekeeping, not a
      // user-triggered action, so a failure here just means it retries
      // next load rather than something worth interrupting the user for.
      const purgeCutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const toPurge = normalized.filter(e => e.isDeleted && e.deletedAt && new Date(e.deletedAt).getTime() < purgeCutoff);
      if (toPurge.length > 0) {
        toPurge.forEach(e => {
          supabase.from('notebook_entries').delete().eq('id', e.id).eq('user_id', uid).then(({ error: purgeError }) => {
            if (purgeError) console.error('Failed to auto-purge notebook entry from Supabase:', purgeError);
          });
        });
      }
      const purgeIds = new Set(toPurge.map(e => e.id));
      setNotebookEntries(normalized.filter(e => !purgeIds.has(e.id)));
    } catch (e) {
      console.error('Failed to load notebook entries from Supabase:', e);
      showTradeImportToast('error', 'Failed to load your Notebook — check your connection and reload.');
    } finally {
      setNotebookEntriesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) loadNotebookEntries(userId);
  }, [userId, loadNotebookEntries]);

  // ---- Notebook: CRUD handlers ----
  // Same shape as the Account/Trade handlers above: optimistic local state
  // update + fire-and-forget Supabase call scoped to user_id, with an
  // explicit toast (not a silent no-op) if there's no authenticated user or
  // the write fails, so data loss is never invisible.
  const handleAddNotebookEntry = useCallback((entry: { title: string; body: string; folder: string; tags: string[]; color?: string }) => {
    const now = new Date().toISOString();
    const newEntry: NotebookEntry = {
      id: generateId(),
      title: entry.title,
      body: entry.body,
      folder: entry.folder,
      tags: entry.tags,
      pinned: false,
      favorite: false,
      color: entry.color,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };
    setNotebookEntries(prev => [...prev, newEntry]);
    if (userId) {
      supabase.from('notebook_entries').insert({ id: newEntry.id, user_id: userId, data: newEntry }).then(({ error }) => {
        if (error) {
          console.error('Failed to save notebook entry to Supabase:', error);
          showTradeImportToast('error', 'Failed to save the new note — it may not appear on other devices.');
        }
      });
    } else {
      console.error('Cannot save notebook entry to Supabase: no authenticated user id.');
      showTradeImportToast('error', 'Not signed in — this note was NOT saved and will be lost on refresh.');
    }
    return newEntry;
  }, [userId]);

  const handleUpdateNotebookEntry = useCallback((id: string, updates: Partial<Pick<NotebookEntry, 'title' | 'body' | 'folder' | 'tags' | 'color' | 'reminderAt'>>) => {
    setNotebookEntries(prev => {
      const existing = prev.find(e => e.id === id);
      if (!existing) return prev;
      const updated: NotebookEntry = { ...existing, ...updates, updatedAt: new Date().toISOString() };
      if (userId) {
        supabase.from('notebook_entries').update({ data: updated }).eq('id', id).eq('user_id', userId).then(({ error }) => {
          if (error) {
            console.error('Failed to update notebook entry in Supabase:', error);
            showTradeImportToast('error', 'Failed to save note changes — it may not sync to other devices.');
          }
        });
      } else {
        console.error('Cannot update notebook entry in Supabase: no authenticated user id.');
        showTradeImportToast('error', 'Not signed in — these note changes were NOT saved and will be lost on refresh.');
      }
      return prev.map(e => e.id === id ? updated : e);
    });
  }, [userId]);

  const handleToggleNotebookEntryPin = useCallback((id: string) => {
    setNotebookEntries(prev => {
      const existing = prev.find(e => e.id === id);
      if (!existing) return prev;
      const updated: NotebookEntry = { ...existing, pinned: !existing.pinned, updatedAt: new Date().toISOString() };
      if (userId) {
        supabase.from('notebook_entries').update({ data: updated }).eq('id', id).eq('user_id', userId).then(({ error }) => {
          if (error) {
            console.error('Failed to update notebook entry pin in Supabase:', error);
            showTradeImportToast('error', 'Failed to save pin change — it may not sync to other devices.');
          }
        });
      } else {
        console.error('Cannot update notebook entry in Supabase: no authenticated user id.');
        showTradeImportToast('error', 'Not signed in — this change was NOT saved and will be lost on refresh.');
      }
      return prev.map(e => e.id === id ? updated : e);
    });
  }, [userId]);

  // Same shape as handleToggleNotebookEntryPin, but a separate boolean —
  // Favorites get their own view in the folder rail, independent of pin
  // (which only affects sort order within whatever view is active).
  const handleToggleNotebookEntryFavorite = useCallback((id: string) => {
    setNotebookEntries(prev => {
      const existing = prev.find(e => e.id === id);
      if (!existing) return prev;
      const updated: NotebookEntry = { ...existing, favorite: !existing.favorite, updatedAt: new Date().toISOString() };
      if (userId) {
        supabase.from('notebook_entries').update({ data: updated }).eq('id', id).eq('user_id', userId).then(({ error }) => {
          if (error) {
            console.error('Failed to update notebook entry favorite in Supabase:', error);
            showTradeImportToast('error', 'Failed to save favorite change — it may not sync to other devices.');
          }
        });
      } else {
        console.error('Cannot update notebook entry in Supabase: no authenticated user id.');
        showTradeImportToast('error', 'Not signed in — this change was NOT saved and will be lost on refresh.');
      }
      return prev.map(e => e.id === id ? updated : e);
    });
  }, [userId]);

  // Creates a fresh entry as a copy of an existing one (new id/timestamps,
  // never pinned/favorited/deleted, "(Copy)" appended to a non-empty
  // title) — a plain insert, same path as handleAddNotebookEntry.
  const handleDuplicateNotebookEntry = useCallback((id: string) => {
    setNotebookEntries(prev => {
      const existing = prev.find(e => e.id === id);
      if (!existing) return prev;
      const now = new Date().toISOString();
      const copy: NotebookEntry = {
        ...existing,
        id: generateId(),
        title: existing.title.trim() ? `${existing.title} (Copy)` : '',
        pinned: false,
        favorite: false,
        isDeleted: false,
        deletedAt: undefined,
        createdAt: now,
        updatedAt: now,
      };
      if (userId) {
        supabase.from('notebook_entries').insert({ id: copy.id, user_id: userId, data: copy }).then(({ error }) => {
          if (error) {
            console.error('Failed to save duplicated notebook entry to Supabase:', error);
            showTradeImportToast('error', 'Failed to save the duplicated note — it may not appear on other devices.');
          }
        });
      } else {
        console.error('Cannot save notebook entry to Supabase: no authenticated user id.');
        showTradeImportToast('error', 'Not signed in — this note was NOT saved and will be lost on refresh.');
      }
      return [...prev, copy];
    });
  }, [userId]);

  // ---- Notebook: bulk actions (multi-select in the note list) ----
  const handleBulkMoveNotebookEntries = useCallback((ids: string[], folder: string) => {
    setNotebookEntries(prev => {
      const idSet = new Set(ids);
      const now = new Date().toISOString();
      const updated = prev.map(e => idSet.has(e.id) ? { ...e, folder, updatedAt: now } : e);
      if (userId) {
        updated.filter(e => idSet.has(e.id)).forEach(e => {
          supabase.from('notebook_entries').update({ data: e }).eq('id', e.id).eq('user_id', userId).then(({ error }) => {
            if (error) {
              console.error('Failed to bulk-move notebook entry in Supabase:', error);
              showTradeImportToast('error', 'Failed to move some notes — they may not sync to other devices.');
            }
          });
        });
      } else {
        showTradeImportToast('error', 'Not signed in — these note changes were NOT saved and will be lost on refresh.');
      }
      return updated;
    });
  }, [userId]);

  const handleBulkSoftDeleteNotebookEntries = useCallback((ids: string[]) => {
    setNotebookEntries(prev => {
      const idSet = new Set(ids);
      const now = new Date().toISOString();
      const updated = prev.map(e => idSet.has(e.id) ? { ...e, isDeleted: true, deletedAt: now, pinned: false } : e);
      if (userId) {
        updated.filter(e => idSet.has(e.id)).forEach(e => {
          supabase.from('notebook_entries').update({ data: e }).eq('id', e.id).eq('user_id', userId).then(({ error }) => {
            if (error) {
              console.error('Failed to bulk-delete notebook entry in Supabase:', error);
              showTradeImportToast('error', 'Failed to delete some notes on the server — they may reappear on reload.');
            }
          });
        });
      } else {
        showTradeImportToast('error', 'Not signed in — these notes were only removed locally and may reappear on reload.');
      }
      return updated;
    });
  }, [userId]);

  // Permanently deletes every entry AND every folder currently in "Recently
  // Deleted" — folders' still-trashed notes are already covered by the
  // entries wipe below (a deleted folder's notes were soft-deleted right
  // along with it, see handleDeleteNotebookFolder), so this just also
  // clears notebookDeletedFolders itself.
  const handleEmptyNotebookTrash = useCallback(() => {
    setNotebookEntries(prev => {
      const toDelete = prev.filter(e => e.isDeleted);
      if (toDelete.length > 0 && userId) {
        toDelete.forEach(e => {
          supabase.from('notebook_entries').delete().eq('id', e.id).eq('user_id', userId).then(({ error }) => {
            if (error) console.error('Failed to permanently delete notebook entry from Supabase:', error);
          });
        });
      }
      return prev.filter(e => !e.isDeleted);
    });
    setNotebookDeletedFolders([]);
  }, [userId]);

  // Soft delete — marks isDeleted/deletedAt instead of removing the row, so
  // the entry can appear in a "Recently Deleted" view before permanent
  // removal (see handlePermanentDeleteNotebookEntry).
  const handleSoftDeleteNotebookEntry = useCallback((id: string) => {
    setNotebookEntries(prev => {
      const existing = prev.find(e => e.id === id);
      if (!existing) return prev;
      const updated: NotebookEntry = { ...existing, isDeleted: true, deletedAt: new Date().toISOString(), pinned: false };
      if (userId) {
        supabase.from('notebook_entries').update({ data: updated }).eq('id', id).eq('user_id', userId).then(({ error }) => {
          if (error) {
            console.error('Failed to soft-delete notebook entry in Supabase:', error);
            showTradeImportToast('error', 'Failed to delete the note on the server — it may reappear on reload.');
          }
        });
      } else {
        console.error('Cannot update notebook entry in Supabase: no authenticated user id.');
        showTradeImportToast('error', 'Not signed in — this note was only removed locally and may reappear on reload.');
      }
      return prev.map(e => e.id === id ? updated : e);
    });
  }, [userId]);

  const handleRestoreNotebookEntry = useCallback((id: string) => {
    setNotebookEntries(prev => {
      const existing = prev.find(e => e.id === id);
      if (!existing) return prev;
      const updated: NotebookEntry = { ...existing, isDeleted: false, deletedAt: undefined, updatedAt: new Date().toISOString() };
      if (userId) {
        supabase.from('notebook_entries').update({ data: updated }).eq('id', id).eq('user_id', userId).then(({ error }) => {
          if (error) {
            console.error('Failed to restore notebook entry in Supabase:', error);
            showTradeImportToast('error', 'Failed to restore the note on the server — it may still show as deleted on reload.');
          }
        });
      } else {
        console.error('Cannot update notebook entry in Supabase: no authenticated user id.');
        showTradeImportToast('error', 'Not signed in — this restore was NOT saved and will be lost on refresh.');
      }
      return prev.map(e => e.id === id ? updated : e);
    });
  }, [userId]);

  const handlePermanentDeleteNotebookEntry = useCallback((id: string) => {
    setNotebookEntries(prev => prev.filter(e => e.id !== id));
    if (userId) {
      supabase.from('notebook_entries').delete().eq('id', id).eq('user_id', userId).then(({ error }) => {
        if (error) {
          console.error('Failed to permanently delete notebook entry from Supabase:', error);
          showTradeImportToast('error', 'Failed to permanently delete the note on the server — it may reappear on reload.');
        }
      });
    } else {
      console.error('Cannot delete notebook entry from Supabase: no authenticated user id.');
      showTradeImportToast('error', 'Not signed in — this note was only removed locally and may reappear on reload.');
    }
  }, [userId]);

  // ---- Notebook: folders ----
  // Folder names live in journal_data (see handling above), not their own
  // table — adding one just appends to the small persisted string list, and
  // the existing journal_data debounced writer picks up the change
  // automatically via its effect dependency array.
  const notebookFoldersWithDefaults = useMemo(() => {
    const custom = notebookFolders.filter(f => !(DEFAULT_NOTEBOOK_FOLDERS as readonly string[]).includes(f));
    return [...DEFAULT_NOTEBOOK_FOLDERS, ...custom];
  }, [notebookFolders]);

  const handleAddNotebookFolder = useCallback((name: string, color?: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setNotebookFolders(prev => {
      if (prev.includes(trimmed) || (DEFAULT_NOTEBOOK_FOLDERS as readonly string[]).includes(trimmed)) return prev;
      return [...prev, trimmed];
    });
    if (color) setNotebookFolderColors(prev => ({ ...prev, [trimmed]: color }));
  }, []);

  // Deleting a folder now moves it AND every note inside it to "Recently
  // Deleted" together (see the confirm-dialog copy in NotebookScreen.tsx),
  // instead of the old behavior of stripping the folder off its notes and
  // discarding it outright. The folder's color is carried into
  // notebookDeletedFolders so a restore doesn't lose it, and cleared out of
  // notebookFolderColors while the folder is gone so re-creating a
  // different folder with the same name doesn't inherit a stale color.
  const handleDeleteNotebookFolder = useCallback((name: string) => {
    if ((DEFAULT_NOTEBOOK_FOLDERS as readonly string[]).includes(name)) return; // default folders aren't removable
    setNotebookFolders(prev => prev.filter(f => f !== name));
    setNotebookFolderColors(prev => {
      if (!(name in prev)) return prev;
      const { [name]: _removed, ...rest } = prev;
      return rest;
    });
    setNotebookDeletedFolders(prev => {
      if (prev.some(f => f.name === name)) return prev;
      return [...prev, { name, color: notebookFolderColors[name], deletedAt: new Date().toISOString() }];
    });
    // Notes that were in the deleted folder are soft-deleted right along
    // with it (not stripped of their folder / kept live) — each entry is
    // its own Supabase row, so this has to be pushed per-entry, not just
    // via the journal_data blob (which only holds the folder names/colors).
    setNotebookEntries(prev => {
      const now = new Date().toISOString();
      const affected = prev.filter(e => e.folder === name && !e.isDeleted);
      const updated = prev.map(e => e.folder === name && !e.isDeleted ? { ...e, isDeleted: true, deletedAt: now, pinned: false } : e);
      if (affected.length > 0) {
        if (userId) {
          affected.forEach(e => {
            const updatedEntry = updated.find(u => u.id === e.id)!;
            supabase.from('notebook_entries').update({ data: updatedEntry }).eq('id', e.id).eq('user_id', userId).then(({ error }) => {
              if (error) {
                console.error('Failed to update notebook entry after folder deletion in Supabase:', error);
                showTradeImportToast('error', 'Failed to move some notes out of the deleted folder — they may reappear on reload.');
              }
            });
          });
        } else {
          console.error('Cannot update notebook entries in Supabase: no authenticated user id.');
          showTradeImportToast('error', 'Not signed in — these note changes were NOT saved and will be lost on refresh.');
        }
      }
      return updated;
    });
  }, [userId, notebookFolderColors]);

  // Explicit per-folder accent color, independent of adding/deleting a
  // folder — pass `undefined` to clear back to the deterministic name-hash
  // fallback color (see folderColor() in NotebookScreen.tsx).
  const handleSetNotebookFolderColor = useCallback((name: string, color: string | undefined) => {
    setNotebookFolderColors(prev => {
      if (!color) {
        if (!(name in prev)) return prev;
        const { [name]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [name]: color };
    });
  }, []);

  // Top-level drag-to-reorder: moves `draggedName`'s whole entry to sit
  // just before `targetName` in notebookFolders. Only ever called with two
  // top-level (depth 0) folder names — see renderFolderNode in
  // NotebookScreen.tsx, which only makes depth-0 rows draggable — so a
  // simple splice-and-reinsert on the flat list is enough; nested folders
  // underneath a moved parent are untouched since folder order is derived
  // purely from array position within this flat string list.
  const handleReorderNotebookFolder = useCallback((draggedName: string, targetName: string) => {
    if (draggedName === targetName) return;
    setNotebookFolders(prev => {
      if (!prev.includes(draggedName) || !prev.includes(targetName)) return prev;
      const withoutDragged = prev.filter(f => f !== draggedName);
      const targetIndex = withoutDragged.indexOf(targetName);
      const next = [...withoutDragged];
      next.splice(targetIndex, 0, draggedName);
      return next;
    });
  }, []);

  // Restores a trashed folder (back into notebookFolders, color intact)
  // and every note that was soft-deleted along with it.
  const handleRestoreNotebookFolder = useCallback((name: string) => {
    const deletedFolder = notebookDeletedFolders.find(f => f.name === name);
    setNotebookDeletedFolders(prev => prev.filter(f => f.name !== name));
    setNotebookFolders(prev => prev.includes(name) ? prev : [...prev, name]);
    if (deletedFolder?.color) {
      setNotebookFolderColors(prev => ({ ...prev, [name]: deletedFolder.color! }));
    }
    setNotebookEntries(prev => {
      const now = new Date().toISOString();
      const affected = prev.filter(e => e.folder === name && e.isDeleted);
      const updated = prev.map(e => e.folder === name && e.isDeleted ? { ...e, isDeleted: false, deletedAt: undefined, updatedAt: now } : e);
      if (affected.length > 0) {
        if (userId) {
          affected.forEach(e => {
            const updatedEntry = updated.find(u => u.id === e.id)!;
            supabase.from('notebook_entries').update({ data: updatedEntry }).eq('id', e.id).eq('user_id', userId).then(({ error }) => {
              if (error) {
                console.error('Failed to restore notebook entry after folder restore in Supabase:', error);
                showTradeImportToast('error', 'Failed to restore some notes on the server — they may still show as deleted on reload.');
              }
            });
          });
        } else {
          console.error('Cannot update notebook entries in Supabase: no authenticated user id.');
          showTradeImportToast('error', 'Not signed in — this restore was NOT saved and will be lost on refresh.');
        }
      }
      return updated;
    });
  }, [userId, notebookDeletedFolders]);

  // Permanently deletes a trashed folder and every note still trashed under
  // it — the folder-level equivalent of handlePermanentDeleteNotebookEntry.
  const handlePermanentDeleteNotebookFolder = useCallback((name: string) => {
    setNotebookDeletedFolders(prev => prev.filter(f => f.name !== name));
    setNotebookEntries(prev => {
      const toDelete = prev.filter(e => e.folder === name && e.isDeleted);
      if (toDelete.length > 0 && userId) {
        toDelete.forEach(e => {
          supabase.from('notebook_entries').delete().eq('id', e.id).eq('user_id', userId).then(({ error }) => {
            if (error) console.error('Failed to permanently delete notebook entry from Supabase:', error);
          });
        });
      }
      return prev.filter(e => !(e.folder === name && e.isDeleted));
    });
  }, [userId]);

  // ---- Logout cleanup ----
  // useAppState() lives inside a single AppProvider that wraps both
  // LoginPage and the dashboard (see App.tsx), so this hook — and every
  // piece of state it holds — is never unmounted on sign-out. Without this,
  // a second person signing in on the same browser/tab would briefly see
  // the previous user's data still sitting in state until the load effects
  // happened to overwrite it. The actual reset runs further down (see
  // "Logout cleanup (continued)" near the end of the Preferences section
  // below), once every piece of state it touches has been declared.
  const prevUserIdRef = useRef<string | null>(null);

  // ---- Life Discipline Hub state ----
  // Persisted in Supabase as part of the `preferences` row (see the
  // "Preferences: Supabase" section further down) — kept logically separate
  // from the journal data's versioned schema/migration pipeline since this
  // is a simple, self-contained habit tracker.
  // Shape: { startDate, checks: { date: boolean[][] }, graceDays: { date: true },
  //          config: ChallengeConfig }
  // checks[date][categoryIndex][itemIndex] mirrors config.categories order,
  // with each category's items pulled from config.categories[i].items.
  const [lifeDisciplineStartDate, setLifeDisciplineStartDate] = useState<string>(() => getLocalDateKey());
  const [lifeDisciplineChecks, setLifeDisciplineChecks] = useState<Record<string, boolean[][]>>({});
  // Dates that missed full completion but were "saved" using a re-check
  // (grace) token, up to the challenge's configured token allowance.
  const [lifeDisciplineGraceDays, setLifeDisciplineGraceDays] = useState<Record<string, boolean>>({});
  // Optional journal note attached to a Re-Checked (grace) day — captured
  // when the user spends a token from the Day Details Modal, and editable
  // afterward from that same modal. Deliberately kept separate from
  // lifeDisciplineMissedReasons below: that map's presence permanently
  // locks a tile as Failed elsewhere in the app, which must never happen
  // just because a re-check day picked up a note.
  const [lifeDisciplineRecheckNotes, setLifeDisciplineRecheckNotes] = useState<Record<string, string>>({});
  // Zero-cheating mode: once re-check tokens run out, a missed day can no
  // longer be flipped to complete. Instead the user logs a reason, which
  // permanently locks that tile as Failed (red) with an attached note.
  const [lifeDisciplineMissedReasons, setLifeDisciplineMissedReasons] = useState<Record<string, string>>({});
  const [challengeConfig, setChallengeConfig] = useState<ChallengeConfig>(DEFAULT_CHALLENGE_CONFIG);
  // Explicit "has this challenge actually been started?" flag, persisted
  // alongside the rest of the Life Discipline data. Set the moment "Start
  // Challenge" is hit (saveChallengeConfig) — deliberately NOT inferred from
  // checks/graceDays/missedReasons being non-empty, because those all stay
  // empty on Day 1 right after starting (before the first box is ever
  // checked), which was letting Duration/Tokens/Load Preset stay visible
  // in Edit Challenge for the entire first day.
  const [hasStartedChallenge, setHasStartedChallenge] = useState(false);

  // ---- Anti-cheating: "is there an active run in progress?" ----
  // A challenge is considered ACTIVE the moment it's been started, or (as a
  // fallback for data saved before hasStartedChallenge existed) the moment
  // any progress has been recorded against it — a checked habit, a spent
  // re-check token, or a logged missed-day reason. This flag — not the
  // draft — is what the Configure/Edit Challenge modal uses to decide
  // whether to show the Duration / Token Allowance / Load Preset fields, so
  // it can't be spoofed by editing the draft itself.
  const hasActiveChallengeProgress =
    hasStartedChallenge ||
    Object.keys(lifeDisciplineChecks).length > 0 ||
    Object.keys(lifeDisciplineGraceDays).length > 0 ||
    Object.keys(lifeDisciplineMissedReasons).length > 0;

  // Day Details Modal — the single click target for every non-upcoming
  // tile in the 100-Day Challenge grid (Completed, Failed, Re-checked, or
  // today/"active"). Replaces the old separate Re-Check-confirm and
  // Missed-Day-Reason modals: both of those flows, plus read-only checklist
  // preview and inline reason editing, now live inside this one modal.
  const [dayDetailsModal, setDayDetailsModal] = useState<{ dateKey: string; day: number } | null>(null);
  // Inline "Edit Reason" state for the Reason / Journal Note section —
  // works for both a Failed day's missed-reason and a Re-checked day's
  // optional note, backed by whichever of the two maps matches the tile's
  // current status (see saveDayDetailsReason below).
  const [isEditingDayReason, setIsEditingDayReason] = useState(false);
  const [dayReasonDraftText, setDayReasonDraftText] = useState('');
  // Inline "optional reason" prompt shown after clicking "Use 1 Re-Check
  // Token" and before the spend is confirmed.
  const [isRecheckTokenPromptOpen, setIsRecheckTokenPromptOpen] = useState(false);
  const [recheckTokenReasonDraft, setRecheckTokenReasonDraft] = useState('');
  // "Honesty guardrail" — on a Failed day, at least one checklist item must
  // stay unchecked (X) or the day would no longer honestly qualify as
  // Failed. Attempting to check the very last remaining X flips this on
  // instead of applying the toggle, surfacing a gentle nudge toward
  // spending a Re-Check Token (the legitimate way to mark a day fully
  // saved) rather than silently letting the checklist edit itself out of
  // Failed status.
  const [dayDetailsHonestyGuardrail, setDayDetailsHonestyGuardrail] = useState(false);
  // Failed-day checklist items are read-only by default — the user must
  // explicitly tap "Edit" to enter correction mode before any item becomes
  // tappable, so a stray tap on the modal never accidentally flips a
  // checked/failed state.
  const [isEditingDayChecklist, setIsEditingDayChecklist] = useState(false);

  // Configure Challenge modal state — edits happen on a draft copy so
  // Cancel discards changes without touching the live config.
  const [isChallengeConfigOpen, setIsChallengeConfigOpen] = useState(false);
  // Which of the two distinct entry points opened the modal:
  // 'configure' — from the always-available "Configure Challenge" button;
  //   fully editable (Duration/Tokens/Load Preset included) and saving
  //   always starts a brand-new run from Day 1, even overwriting an
  //   already-active challenge.
  // 'edit' — from the "Edit Challenge" button, only shown once a challenge
  //   is active; Duration/Tokens/Load Preset are hidden, and saving only
  //   updates Title/Motto/Routines in place without touching progress.
  const [challengeModalMode, setChallengeModalMode] = useState<'configure' | 'edit'>('configure');
  // Reset Challenge — only reachable from the Edit Challenge modal. Wipes
  // all progress (checks/grace days/missed reasons/re-check notes) and
  // restarts Day 1 today, but keeps Title/Motto/Routines/Duration/Tokens
  // exactly as currently configured. Always gated behind an explicit
  // confirmation dialog since it's destructive and can't be undone.
  const [isResetChallengeConfirmOpen, setIsResetChallengeConfirmOpen] = useState(false);
  const [challengeConfigDraft, setChallengeConfigDraft] = useState<ChallengeConfig>(DEFAULT_CHALLENGE_CONFIG);
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [newRoutineItemText, setNewRoutineItemText] = useState<Record<string, string>>({});
  const [editingRoutineItem, setEditingRoutineItem] = useState<{ categoryId: string; id: string } | null>(null);
  const [editingRoutineItemText, setEditingRoutineItemText] = useState('');
  // Notion-style Category Icon/Emoji Picker — only one popover open at a
  // time, identified by the category id it belongs to.
  const [iconPickerOpenFor, setIconPickerOpenFor] = useState<string | null>(null);
  const [iconPickerTab, setIconPickerTab] = useState<'emoji' | 'icon'>('emoji');
  // The popover uses `position: fixed` with coordinates computed from the
  // trigger button's viewport rect (rather than being positioned relative
  // to an in-flow `relative` ancestor). Fixed positioning escapes the
  // modal body's `overflow-y-auto` clipping (that container has no
  // transform/filter, so it never becomes a containing block for
  // fixed-position descendants), so the popover can render over neighboring
  // cards and the modal footer without being cut off. We anchor with
  // `bottom` (not `top`) when flipped upward so we don't need to know the
  // popover's rendered height in advance.
  const [iconPickerPos, setIconPickerPos] = useState<{ top?: number; bottom?: number; left: number } | null>(null);
  const iconPickerPopoverRef = useRef<HTMLDivElement | null>(null);
  const iconPickerTriggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const ICON_PICKER_WIDTH = 288; // matches w-72
  // Rough max height of the popover (tabs + compact grid + padding). Used
  // purely to decide flip direction — the popover itself is still capped
  // by its own max-height/overflow so this only needs to be a reasonable
  // upper bound, not pixel-perfect.
  const ICON_PICKER_EST_HEIGHT = 300;
  const GAP = 6;

  const computeIconPickerPos = (triggerEl: HTMLButtonElement) => {
    const rect = triggerEl.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const flipUp = spaceBelow < ICON_PICKER_EST_HEIGHT && spaceAbove > spaceBelow;
    const left = Math.min(Math.max(rect.left, 8), window.innerWidth - ICON_PICKER_WIDTH - 8);
    if (flipUp) {
      return { bottom: window.innerHeight - rect.top + GAP, left };
    }
    return { top: rect.bottom + GAP, left };
  };

  const toggleIconPicker = (groupId: string, iconKind: RoutineIconKind | undefined) => {
    setIconPickerOpenFor(prev => {
      const next = prev === groupId ? null : groupId;
      if (next) {
        const triggerEl = iconPickerTriggerRefs.current[groupId];
        setIconPickerPos(triggerEl ? computeIconPickerPos(triggerEl) : null);
      } else {
        setIconPickerPos(null);
      }
      return next;
    });
    setIconPickerTab(iconKind === 'icon' ? 'icon' : 'emoji');
  };
  // Delete-confirmation state for the Custom Routine Manager — deleting a
  // whole category block or a single routine item always requires an
  // explicit "Confirm Delete" to prevent accidental data loss.
  const [categoryPendingDelete, setCategoryPendingDelete] = useState<{ id: string; label: string } | null>(null);
  const [itemPendingDelete, setItemPendingDelete] = useState<{ categoryId: string; id: string; text: string } | null>(null);

  // User-saved challenge presets (persisted to Supabase as part of the
  // `preferences` row, separate from the built-in CHALLENGE_PRESETS
  // templates) + the compact Preset Selector
  // Bar's transient UI state (dropdown open, inline "save as" naming row,
  // and the Manage/Delete Presets modal).
  const [userChallengePresets, setUserChallengePresets] = useState<ChallengePreset[]>([]);
  const [isLoadPresetMenuOpen, setIsLoadPresetMenuOpen] = useState(false);
  const [isSavingPresetDraft, setIsSavingPresetDraft] = useState(false);
  const [savePresetNameDraft, setSavePresetNameDraft] = useState('');
  const [isManagePresetsOpen, setIsManagePresetsOpen] = useState(false);
  const [presetPendingDelete, setPresetPendingDelete] = useState<{ id: string; name: string } | null>(null);
  const loadPresetMenuRef = useRef<HTMLDivElement | null>(null);
  // Smart Preset Overwrite: tracks which saved preset (if any) the current
  // draft was loaded from, so "+ Save Current as Preset" can offer to
  // overwrite it instead of always creating a new one. isPresetSaveChoiceOpen
  // drives the small "Overwrite vs Save as new" popover.
  const [loadedPresetId, setLoadedPresetId] = useState<string | null>(null);
  const [isPresetSaveChoiceOpen, setIsPresetSaveChoiceOpen] = useState(false);
  const presetSaveChoiceRef = useRef<HTMLDivElement | null>(null);

  // Lightweight local toast for Daily Checklist quick actions (e.g. "Complete All").
  const [lifeDisciplineToast, setLifeDisciplineToast] = useState<string | null>(null);
  const lifeDisciplineToastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showLifeDisciplineToast = (message: string) => {
    setLifeDisciplineToast(message);
    if (lifeDisciplineToastTimeoutRef.current) clearTimeout(lifeDisciplineToastTimeoutRef.current);
    lifeDisciplineToastTimeoutRef.current = setTimeout(() => setLifeDisciplineToast(null), 2500);
  };
  useEffect(() => () => {
    if (lifeDisciplineToastTimeoutRef.current) clearTimeout(lifeDisciplineToastTimeoutRef.current);
  }, []);

  // Helper: build a fresh, empty checks matrix matching the current config's
  // routine group order and item counts.
  const emptyLifeDisciplineChecks = (config: ChallengeConfig): boolean[][] =>
    config.categories.map(cat => cat.items.map(() => false));

  // ==========================================================================
  // Preferences: Supabase (per-user, synced across devices)
  // ==========================================================================
  // Everything that used to be spread across the 'lifeDisciplineData',
  // 'lifeDisciplineUserPresets', 'customCreedQuotes', and 'dailyCreedState'
  // localStorage keys (plus theme/privacyMode/pillarsPerRow/preSessionChecklist,
  // which weren't persisted anywhere before) now lives together as one JSONB
  // document in `public.preferences`, one row per user, RLS-scoped to
  // `user_id`. Same single-row-per-user / jsonb-blob shape as `journal_data`
  // above, for the same reasons.
  const [preferencesLoading, setPreferencesLoading] = useState(true);
  const hasLoadedPreferencesRef = useRef(false);

  const loadPreferences = useCallback(async (uid: string) => {
    setPreferencesLoading(true);
    hasLoadedPreferencesRef.current = false;
    try {
      const { data: row, error } = await supabase
        .from('preferences')
        .select('data')
        .eq('user_id', uid)
        .maybeSingle();
      if (error) throw error;

      const p = (row?.data as any) || {};
      if (p.theme === 'light' || p.theme === 'dark' || p.theme === 'minecraft') setTheme(p.theme);
      if (typeof p.privacyMode === 'boolean') setPrivacyMode(p.privacyMode);
      if (typeof p.pillarsPerRow === 'number') setPillarsPerRow(p.pillarsPerRow as PillarsPerRow);
      if (p.preSessionChecklist && typeof p.preSessionChecklist === 'object') setPreSessionChecklist(p.preSessionChecklist);

      const loadedCreedQuotes: CreedQuote[] = Array.isArray(p.customCreedQuotes) ? p.customCreedQuotes : [];
      setCustomCreedQuotes(loadedCreedQuotes);
      const combinedQuoteCount = DEFAULT_CREED_QUOTES.length + loadedCreedQuotes.length;
      const todayKeyStr = new Date().toLocaleDateString('en-CA');
      if (p.dailyCreedState?.date === todayKeyStr && typeof p.dailyCreedState?.index === 'number' && p.dailyCreedState.index < combinedQuoteCount) {
        dailyCreedDateRef.current = todayKeyStr;
        setCreedIndex(p.dailyCreedState.index);
      } else {
        // Date rolled over (or no prior pick) — leave dailyCreedDateRef
        // unset so the daily-rotation effect immediately picks a fresh one.
        dailyCreedDateRef.current = '';
      }

      const ld = p.lifeDiscipline || {};
      if (ld.startDate) setLifeDisciplineStartDate(ld.startDate);
      setLifeDisciplineChecks(ld.checks || {});
      setLifeDisciplineGraceDays(ld.graceDays || {});
      setLifeDisciplineMissedReasons(ld.missedReasons || {});
      setLifeDisciplineRecheckNotes(ld.recheckNotes || {});
      setChallengeConfig(ld.config?.categories ? ld.config : DEFAULT_CHALLENGE_CONFIG);
      setHasStartedChallenge(typeof ld.hasStarted === 'boolean' ? ld.hasStarted : false);

      setUserChallengePresets(Array.isArray(p.userChallengePresets) ? p.userChallengePresets : []);
    } catch (e) {
      console.error('Failed to load preferences from Supabase:', e);
      showTradeImportToast('error', 'Failed to load your settings/Life Discipline Hub — check your connection and reload.');
    } finally {
      hasLoadedPreferencesRef.current = true;
      setPreferencesLoading(false);
      setCustomCreedQuotesLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (userId) loadPreferences(userId);
  }, [userId, loadPreferences]);

  // Debounced save — same no-op-until-loaded guard as journal data above.
  useEffect(() => {
    if (!userId || !hasLoadedPreferencesRef.current) return;
    const payload = {
      theme,
      privacyMode,
      pillarsPerRow,
      preSessionChecklist,
      customCreedQuotes,
      dailyCreedState: { date: dailyCreedDateRef.current || new Date().toLocaleDateString('en-CA'), index: creedIndex },
      lifeDiscipline: {
        startDate: lifeDisciplineStartDate,
        checks: lifeDisciplineChecks,
        graceDays: lifeDisciplineGraceDays,
        missedReasons: lifeDisciplineMissedReasons,
        recheckNotes: lifeDisciplineRecheckNotes,
        config: challengeConfig,
        hasStarted: hasStartedChallenge,
      },
      userChallengePresets,
    };
    writePreferences(
      async () => {
        const { error } = await supabase
          .from('preferences')
          .upsert({ user_id: userId, data: payload }, { onConflict: 'user_id' });
        if (error) throw error;
      },
      (e: any) => {
        // Previously silent (console.error only) — Discipline Tracker,
        // theme, and Daily Creed settings could fail to sync with zero
        // user-facing signal. A Postgres "no unique or exclusion
        // constraint matching ON CONFLICT" error (42P10) here means the
        // `preferences` table is missing a UNIQUE constraint on user_id;
        // every upsert will keep failing until that's added.
        console.error('Failed to save preferences to Supabase:', e);
        showTradeImportToast('error', 'Failed to save your settings/Discipline Tracker data — they may not sync. Check your connection.');
      }
    );
  }, [
    userId, theme, privacyMode, pillarsPerRow, preSessionChecklist, customCreedQuotes, creedIndex,
    lifeDisciplineStartDate, lifeDisciplineChecks, lifeDisciplineGraceDays, lifeDisciplineMissedReasons,
    lifeDisciplineRecheckNotes, challengeConfig, hasStartedChallenge, userChallengePresets, writePreferences,
  ]);

  // ---- Logout cleanup (continued) ----
  // See the `prevUserIdRef` declaration up in the Auth section for why this
  // exists. Placed here (rather than right next to the ref) because it
  // needs to reference state declared throughout Journal Data and
  // Preferences above.
  useEffect(() => {
    if (prevUserIdRef.current && !userId) {
      // ---- Accounts & Trades ----
      setAccounts([]);
      setTrades([]);
      setSelectedAccounts(['all']);
      setAccountsTradesLoading(true);
      hasAttemptedMigrationRef.current = false;

      // ---- Notebook ----
      setNotebookEntries([]);
      setNotebookEntriesLoading(true);

      // ---- Journal Data (Rules/Playbook, Notices, Wiki, Tags) ----
      setRules([]);
      setStrategies([]);
      setCustomPillars([]);
      setNotices([]);
      setWikiEntries([]);
      setSetupTypes([]);
      setConfluences([]);
      setMistakesList([]);
      setEmotionsList(EMOTION_OPTIONS.map(name => ({ id: generateId(), name, color: 'purple' as TagColor })));
      setCustomSymbols([]);
      setNotebookFolders([]);
      setJournalDataLoading(true);
      hasLoadedJournalDataRef.current = false;

      // ---- Preferences (settings + Life Discipline Hub + Daily Creed) ----
      setTheme('dark');
      setPrivacyMode(false);
      setPillarsPerRow(3);
      setPreSessionChecklist({ 'htf-levels': false, 'news-check': false, 'mindset-check': false, 'max-loss-set': false });
      setCustomCreedQuotes([]);
      setCreedIndex(0);
      dailyCreedDateRef.current = '';
      setLifeDisciplineStartDate(getLocalDateKey());
      setLifeDisciplineChecks({});
      setLifeDisciplineGraceDays({});
      setLifeDisciplineMissedReasons({});
      setLifeDisciplineRecheckNotes({});
      setChallengeConfig(DEFAULT_CHALLENGE_CONFIG);
      setHasStartedChallenge(false);
      setUserChallengePresets([]);
      setLoadedPresetId(null);
      setPreferencesLoading(true);
      setCustomCreedQuotesLoaded(false);
      hasLoadedPreferencesRef.current = false;
    }
    prevUserIdRef.current = userId;
  }, [userId]);

  // Close the "Load Preset" dropdown on outside click.
  useEffect(() => {
    if (!isLoadPresetMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (loadPresetMenuRef.current && !loadPresetMenuRef.current.contains(e.target as Node)) {
        setIsLoadPresetMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLoadPresetMenuOpen]);

  // Close the "Overwrite vs Save as new" preset-save-choice popover on outside click.
  useEffect(() => {
    if (!isPresetSaveChoiceOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (presetSaveChoiceRef.current && !presetSaveChoiceRef.current.contains(e.target as Node)) {
        setIsPresetSaveChoiceOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPresetSaveChoiceOpen]);

  // Close the Category Icon/Emoji Picker popover on outside click. Since the
  // popover content is portal'd to document.body (to escape the modal's
  // scrollable/clipped ancestor), we check both the trigger button and the
  // portal content rather than a single wrapping ref.
  useEffect(() => {
    if (!iconPickerOpenFor) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const triggerEl = iconPickerTriggerRefs.current[iconPickerOpenFor];
      const popoverEl = iconPickerPopoverRef.current;
      if ((!triggerEl || !triggerEl.contains(target)) && (!popoverEl || !popoverEl.contains(target))) {
        setIconPickerOpenFor(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [iconPickerOpenFor]);

  // Keep the portal'd popover glued to its trigger button as the modal (or
  // page) scrolls or the window resizes, since fixed-position coordinates
  // don't auto-follow the trigger the way an in-flow absolute popover would.
  useEffect(() => {
    if (!iconPickerOpenFor) return;
    const reposition = () => {
      const triggerEl = iconPickerTriggerRefs.current[iconPickerOpenFor];
      if (triggerEl) setIconPickerPos(computeIconPickerPos(triggerEl));
    };
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [iconPickerOpenFor]);

  // Toggle a single habit checkbox for a given date.
  const toggleLifeDisciplineItem = (dateKey: string, groupIdx: number, itemIdx: number) => {
    setLifeDisciplineChecks(prev => {
      const existing = prev[dateKey] || emptyLifeDisciplineChecks(challengeConfig);
      // Rebuild against the CURRENT challengeConfig shape (not just the
      // previously-saved `existing` array) — if a category or item was
      // added after today's checks were first saved, `existing` is shorter
      // than the live config and mapping over it would silently drop the
      // new category/item, making it un-toggleable.
      const nextForDate = challengeConfig.categories.map((cat, gI) =>
        cat.items.map((item, iI) => {
          const current = !!existing[gI]?.[iI];
          return gI === groupIdx && iI === itemIdx ? !current : current;
        })
      );
      return { ...prev, [dateKey]: nextForDate };
    });
  };

  // Quick action: mark every habit across every routine group complete for
  // the given date in a single click. Only touches items actually
  // scheduled for that date — a Tuesday-only item stays whatever it was if
  // this is clicked on a Monday, so it can't be silently pre-completed.
  const completeAllLifeDisciplineToday = (dateKey: string) => {
    setLifeDisciplineChecks(prev => {
      const existing = prev[dateKey] || emptyLifeDisciplineChecks(challengeConfig);
      return {
        ...prev,
        [dateKey]: challengeConfig.categories.map((cat, gI) =>
          cat.items.map((item, iI) => (itemAppliesOnDate(item, dateKey, challengeConfig) ? true : !!existing[gI]?.[iI]))
        ),
      };
    });
    showLifeDisciplineToast('✨ All habits marked complete for today');
  };

  // A date "counts" as complete only once every checkbox for every item
  // SCHEDULED ON THAT DATE is checked — items with a Specific-Days schedule
  // that don't run on this weekday are skipped entirely rather than
  // counted against (or for) the day. A day with zero applicable items
  // (e.g. zero categories, or every item scheduled elsewhere this week) is
  // never "complete".
  const isLifeDisciplineDayComplete = (dateKey: string) => {
    const dayChecks = lifeDisciplineChecks[dateKey];
    if (!dayChecks) return false;
    if (challengeConfig.categories.length === 0) return false;
    let hasApplicableItem = false;
    const allApplicableChecked = challengeConfig.categories.every((cat, gI) =>
      cat.items.every((item, iI) => {
        if (!itemAppliesOnDate(item, dateKey, challengeConfig)) return true; // not scheduled today — skip
        hasApplicableItem = true;
        return !!dayChecks[gI]?.[iI];
      })
    );
    return hasApplicableItem && allApplicableChecked;
  };

  // Re-check (grace) tokens: how many of the configured allowance have
  // already been spent redeeming missed days, and how many remain.
  const lifeDisciplineTokensUsed = Object.values(lifeDisciplineGraceDays).filter(Boolean).length;
  const lifeDisciplineTokensRemaining = Math.max(0, challengeConfig.recheckTokens - lifeDisciplineTokensUsed);

  // Spend (or refund) a re-check token on a missed day. Only valid for past,
  // incomplete days — the toggle is a no-op otherwise. Days with a logged
  // missed-day reason are permanently locked as Failed and can't be redeemed.
  const toggleLifeDisciplineGraceDay = (dateKey: string) => {
    if (lifeDisciplineMissedReasons[dateKey]) return; // locked — see zero-cheating mode
    setLifeDisciplineGraceDays(prev => {
      const isGraced = !!prev[dateKey];
      if (!isGraced && lifeDisciplineTokensRemaining <= 0) return prev; // no tokens left
      const next = { ...prev };
      if (isGraced) delete next[dateKey];
      else next[dateKey] = true;
      return next;
    });
  };

  // ---- Day Details Modal ----
  const openDayDetailsModal = (dateKey: string, day: number) => {
    setIsEditingDayReason(false);
    setDayReasonDraftText('');
    setIsRecheckTokenPromptOpen(false);
    setRecheckTokenReasonDraft('');
    setDayDetailsHonestyGuardrail(false);
    setIsEditingDayChecklist(false);
    setDayDetailsModal({ dateKey, day });
  };

  // Enters correction mode for the Failed-day checklist — items only
  // become tappable after this is called.
  const startEditDayChecklist = () => {
    setDayDetailsHonestyGuardrail(false);
    setIsEditingDayChecklist(true);
  };

  // Exits correction mode. Edits already apply live to lifeDisciplineChecks
  // as each item is tapped, so this is just a "done editing" confirmation
  // rather than a separate persistence step.
  const saveDayChecklistEdits = () => {
    setIsEditingDayChecklist(false);
    setDayDetailsHonestyGuardrail(false);
    showLifeDisciplineToast('✅ Checklist updated');
  };

  // Toggle a checklist item from inside the Day Details Modal on a FAILED
  // day only — lets the user correct an accidental mis-check from the
  // night before. Unlike the general toggleLifeDisciplineItem, this
  // enforces the honesty guardrail: checking the last remaining X (the
  // item that's keeping the day Failed) is blocked and instead surfaces a
  // gentle nudge to spend a Re-Check Token, since that's the legitimate
  // path to marking a fully-completed day as saved. Unchecking an item (or
  // checking one while others remain unchecked) is always allowed.
  const toggleDayDetailsFailedItem = (dateKey: string, groupIdx: number, itemIdx: number) => {
    const dayChecks = lifeDisciplineChecks[dateKey] || emptyLifeDisciplineChecks(challengeConfig);
    const isCurrentlyChecked = !!dayChecks[groupIdx]?.[itemIdx];

    if (!isCurrentlyChecked) {
      // About to check an item — count how many X's remain across the
      // items actually scheduled for this date. If this is the last one,
      // block it and nudge instead.
      const uncheckedCount = challengeConfig.categories.reduce((total, cat, gI) => {
        return total + cat.items.reduce((sub, item, iI) => {
          if (!itemAppliesOnDate(item, dateKey, challengeConfig)) return sub; // not scheduled — doesn't count
          const checked = gI === groupIdx && iI === itemIdx ? true : !!dayChecks[gI]?.[iI];
          return sub + (checked ? 0 : 1);
        }, 0);
      }, 0);
      if (uncheckedCount === 0) {
        setDayDetailsHonestyGuardrail(true);
        return;
      }
    }

    setDayDetailsHonestyGuardrail(false);
    toggleLifeDisciplineItem(dateKey, groupIdx, itemIdx);
  };

  // Starts inline editing of the Reason / Journal Note section. Seeds the
  // draft from whichever map currently backs this tile's status — a
  // Failed day's permanent missed-reason, or a Re-checked day's optional
  // note — so "Edit Reason" always opens with the existing text pre-filled.
  const startEditDayReason = (dateKey: string, status: string) => {
    const existing = status === 'grace' ? lifeDisciplineRecheckNotes[dateKey] : lifeDisciplineMissedReasons[dateKey];
    setDayReasonDraftText(existing || '');
    setIsEditingDayReason(true);
  };

  // Saves the Reason / Journal Note edit into the map matching the tile's
  // current status. For a Failed day this is the same permanent
  // missed-reason lock used elsewhere in the app (an empty reason can't be
  // saved — mirrors the old Missed Day Reason Log requirement); for a
  // Re-checked day it's just an optional note with no side effects and can
  // be cleared back to empty.
  const saveDayDetailsReason = (dateKey: string, status: string) => {
    const text = dayReasonDraftText.trim();
    if (status === 'grace') {
      setLifeDisciplineRecheckNotes(prev => {
        const next = { ...prev };
        if (text) next[dateKey] = text; else delete next[dateKey];
        return next;
      });
      showLifeDisciplineToast('📝 Note saved');
    } else if (status === 'failed') {
      if (!text) return;
      setLifeDisciplineMissedReasons(prev => ({ ...prev, [dateKey]: text }));
      // Logging/updating a reason keeps the tile permanently locked as
      // Failed — clear any grace token that may have somehow been spent
      // on it, keeping the two mechanics mutually exclusive.
      setLifeDisciplineGraceDays(prev => {
        if (!prev[dateKey]) return prev;
        const next = { ...prev };
        delete next[dateKey];
        return next;
      });
      showLifeDisciplineToast('📝 Reason logged — day locked as Failed');
    }
    setIsEditingDayReason(false);
  };

  // "Use 1 Re-Check Token" button inside the modal — reveals the optional
  // reason prompt rather than spending immediately.
  const openRecheckTokenPrompt = () => {
    setRecheckTokenReasonDraft('');
    setIsRecheckTokenPromptOpen(true);
  };

  // Deducts a token, converts the day to Re-checked, and (if provided)
  // saves the optional reason as that day's journal note.
  const confirmUseRecheckToken = (dateKey: string) => {
    if (lifeDisciplineTokensRemaining <= 0) return;
    toggleLifeDisciplineGraceDay(dateKey);
    const text = recheckTokenReasonDraft.trim();
    if (text) setLifeDisciplineRecheckNotes(prev => ({ ...prev, [dateKey]: text }));
    setIsRecheckTokenPromptOpen(false);
    setRecheckTokenReasonDraft('');
    showLifeDisciplineToast('🔁 Re-Check Token used — day marked saved');
  };

  // Refunds the token on an already re-checked day, reverting it to
  // Failed, and clears any note attached via the modal so a future
  // re-check on this day starts clean.
  const undoRecheckDay = (dateKey: string) => {
    toggleLifeDisciplineGraceDay(dateKey);
    setLifeDisciplineRecheckNotes(prev => {
      if (!prev[dateKey]) return prev;
      const next = { ...prev };
      delete next[dateKey];
      return next;
    });
    showLifeDisciplineToast('↩️ Re-Check undone — token refunded');
  };

  // Clicking a grid tile opens the Day Details Modal only for days that
  // have already passed (Complete, Failed, Re-checked). Today's tile
  // ('pending') isn't clickable — it's still in progress and is edited
  // live via the Daily Checklist section above, not through this modal —
  // and future ('upcoming') days aren't clickable either.
  const handleLifeDisciplineTileClick = (dateKey: string, day: number, status: string) => {
    if (status !== 'complete' && status !== 'failed' && status !== 'grace') return;
    openDayDetailsModal(dateKey, day);
  };

  // ---- Smart Preset Overwrite helpers ----
  // Finds the user-saved preset (never a built-in template — those are
  // read-only) that the current draft either was loaded from, or now
  // matches by title. Used by "+ Save Current as Preset" to decide whether
  // to offer an Overwrite option.
  const findMatchingUserPreset = (): ChallengePreset | undefined => {
    if (loadedPresetId) {
      const byId = userChallengePresets.find(p => p.id === loadedPresetId);
      if (byId) return byId;
    }
    const title = challengeConfigDraft.title.trim().toLowerCase();
    if (!title) return undefined;
    return userChallengePresets.find(p => p.name.trim().toLowerCase() === title);
  };

  // Entry point for the "+ Save Current as Preset" button: goes straight to
  // the "name it" prompt for a brand-new setup, or offers the Overwrite /
  // Save-as-new choice when the draft matches an existing saved preset.
  const handleSaveCurrentAsPresetClick = () => {
    setIsLoadPresetMenuOpen(false);
    const matched = findMatchingUserPreset();
    if (matched) {
      setIsPresetSaveChoiceOpen(true);
    } else {
      setSavePresetNameDraft(challengeConfigDraft.title || '');
      setIsSavingPresetDraft(true);
    }
  };

  // Updates an existing saved preset in place with the draft's current
  // duration/tokens/motto/categories, keeping its id and name.
  const overwriteExistingUserPreset = (preset: ChallengePreset) => {
    const updated: ChallengePreset = {
      ...preset,
      durationDays: challengeConfigDraft.durationDays,
      recheckTokens: challengeConfigDraft.recheckTokens,
      motto: challengeConfigDraft.motto,
      categories: challengeConfigDraft.categories.map(cat => ({
        label: cat.label, iconKind: cat.iconKind, iconValue: cat.iconValue, iconColor: cat.iconColor,
        items: cat.items.map(i => i.text),
      })),
    };
    setUserChallengePresets(prev => prev.map(p => (p.id === preset.id ? updated : p)));
    setLoadedPresetId(preset.id);
    setIsPresetSaveChoiceOpen(false);
    showLifeDisciplineToast(`🔁 Updated preset "${preset.name}"`);
  };

  // Switches out of "overwrite" mode into the ordinary "name a new preset"
  // prompt, used by the popover's "Save as new preset" option.
  const chooseSaveAsNewPreset = () => {
    setIsPresetSaveChoiceOpen(false);
    setSavePresetNameDraft('');
    setIsSavingPresetDraft(true);
  };

  // ---- Configure Challenge modal helpers ----
  const openChallengeConfigModal = (mode: 'configure' | 'edit') => {
    setChallengeModalMode(mode);
    setChallengeConfigDraft({
      ...challengeConfig,
      categories: challengeConfig.categories.map(cat => ({ ...cat, items: cat.items.map(i => ({ ...i })) })),
    });
    setIsCustomDuration(!DURATION_PRESET_OPTIONS.includes(challengeConfig.durationDays));
    setNewRoutineItemText(Object.fromEntries(challengeConfig.categories.map(cat => [cat.id, ''])));
    setEditingRoutineItem(null);
    setIsLoadPresetMenuOpen(false);
    setIsSavingPresetDraft(false);
    setSavePresetNameDraft('');
    setIsManagePresetsOpen(false);
    setPresetPendingDelete(null);
    setIconPickerOpenFor(null);
    setIconPickerTab('emoji');
    setCategoryPendingDelete(null);
    setItemPendingDelete(null);
    setLoadedPresetId(null);
    setIsPresetSaveChoiceOpen(false);
    setIsChallengeConfigOpen(true);
  };

  const applyChallengePreset = (preset: ChallengePreset) => {
    // Load Preset is hidden entirely in 'edit' mode, so this only ever runs
    // in 'configure' mode — but guard anyway so an active run's
    // Duration/Tokens can never sneak in through the back door.
    const fieldsLocked = challengeModalMode === 'edit';
    const newCategories: RoutineCategory[] = preset.categories.map(cat => {
      const catId = generateId();
      return { id: catId, label: cat.label, iconKind: cat.iconKind, iconValue: cat.iconValue, iconColor: cat.iconColor, items: cat.items.map(text => ({ id: generateId(), text })) };
    });
    setChallengeConfigDraft(prev => ({
      ...prev,
      title: prev.title?.trim() ? prev.title : preset.name,
      durationDays: fieldsLocked ? prev.durationDays : preset.durationDays,
      recheckTokens: fieldsLocked ? prev.recheckTokens : preset.recheckTokens,
      motto: preset.motto,
      categories: newCategories,
    }));
    setNewRoutineItemText(Object.fromEntries(newCategories.map(cat => [cat.id, ''])));
    if (!fieldsLocked) setIsCustomDuration(!DURATION_PRESET_OPTIONS.includes(preset.durationDays));
    setIsLoadPresetMenuOpen(false);
    // Track which saved preset this came from (only user-saved ones — the
    // built-in templates are read-only and can never be "overwritten").
    setLoadedPresetId(userChallengePresets.some(p => p.id === preset.id) ? preset.id : null);
  };

  // Saves the current draft's Title, Duration, Tokens, Motto and Routines as
  // a new reusable, user-saved preset (persisted to Supabase). Built-in
  // templates are untouched — this only ever appends to userChallengePresets.
  const saveDraftAsPreset = () => {
    const name = savePresetNameDraft.trim();
    if (!name) return;
    const newPreset: ChallengePreset = {
      id: generateId(),
      name,
      description: `${challengeConfigDraft.durationDays}-day custom preset.`,
      durationDays: challengeConfigDraft.durationDays,
      recheckTokens: challengeConfigDraft.recheckTokens,
      motto: challengeConfigDraft.motto,
      categories: challengeConfigDraft.categories.map(cat => ({ label: cat.label, iconKind: cat.iconKind, iconValue: cat.iconValue, iconColor: cat.iconColor, items: cat.items.map(i => i.text) })),
    };
    setUserChallengePresets(prev => [...prev, newPreset]);
    setSavePresetNameDraft('');
    setIsSavingPresetDraft(false);
    setLoadedPresetId(newPreset.id);
    showLifeDisciplineToast(`💾 Saved "${name}" as a preset`);
  };

  const requestDeleteUserChallengePreset = (id: string, name: string) => {
    setPresetPendingDelete({ id, name });
  };

  const confirmDeleteUserChallengePreset = () => {
    if (!presetPendingDelete) return;
    setUserChallengePresets(prev => prev.filter(p => p.id !== presetPendingDelete.id));
    setPresetPendingDelete(null);
  };

  const addDraftRoutineItem = (categoryId: string) => {
    const text = (newRoutineItemText[categoryId] || '').trim();
    if (!text) return;
    setChallengeConfigDraft(prev => ({
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === categoryId ? { ...cat, items: [...cat.items, { id: generateId(), text }] } : cat
      ),
    }));
    setNewRoutineItemText(prev => ({ ...prev, [categoryId]: '' }));
  };

  // Adds an item to the single fixed Weekly Card. Unlike addDraftRoutineItem
  // (plain daily items in regular category cards), every item here is
  // created Specific-Days from the start — there is no "Daily" option inside
  // this card. The reserved category is created lazily on first use so a
  // fresh challenge with the toggle on doesn't need a pre-seeded empty block.
  const addDraftWeeklyItem = () => {
    const text = (newRoutineItemText[WEEKLY_CATEGORY_ID] || '').trim();
    if (!text) return;
    const newItem: RoutineItem = { id: generateId(), text, frequency: 'specific', days: [] };
    setChallengeConfigDraft(prev => {
      const exists = prev.categories.some(cat => cat.id === WEEKLY_CATEGORY_ID);
      const categories = exists
        ? prev.categories.map(cat => (cat.id === WEEKLY_CATEGORY_ID ? { ...cat, items: [...cat.items, newItem] } : cat))
        : [...prev.categories, { id: WEEKLY_CATEGORY_ID, label: WEEKLY_CATEGORY_LABEL, items: [newItem] }];
      return { ...prev, categories };
    });
    setNewRoutineItemText(prev => ({ ...prev, [WEEKLY_CATEGORY_ID]: '' }));
  };

  // Deleting a routine item always routes through a confirmation prompt
  // first (see itemPendingDelete + renderDeleteRoutineItemConfirm) — this is
  // the function the "Confirm Delete" button actually calls.
  const requestDeleteDraftRoutineItem = (categoryId: string, id: string, text: string) => {
    setItemPendingDelete({ categoryId, id, text });
  };

  const confirmDeleteDraftRoutineItem = () => {
    if (!itemPendingDelete) return;
    const { categoryId, id } = itemPendingDelete;
    setChallengeConfigDraft(prev => ({
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === categoryId ? { ...cat, items: cat.items.filter(i => i.id !== id) } : cat
      ),
    }));
    setItemPendingDelete(null);
  };

  const startEditDraftRoutineItem = (categoryId: string, item: RoutineItem) => {
    setEditingRoutineItem({ categoryId, id: item.id });
    setEditingRoutineItemText(item.text);
  };

  const commitEditDraftRoutineItem = () => {
    if (!editingRoutineItem) return;
    const text = editingRoutineItemText.trim();
    if (text) {
      setChallengeConfigDraft(prev => ({
        ...prev,
        categories: prev.categories.map(cat =>
          cat.id === editingRoutineItem.categoryId
            ? { ...cat, items: cat.items.map(i => (i.id === editingRoutineItem.id ? { ...i, text } : i)) }
            : cat
        ),
      }));
    }
    setEditingRoutineItem(null);
    setEditingRoutineItemText('');
  };

  // Master toggle for Day-Specific (Weekly) Routines. Turning it off is
  // intentionally non-destructive — any per-item frequency/days already set
  // are left in the draft untouched, just ignored everywhere (itemAppliesOnDate
  // treats every item as daily while the flag is off), so re-enabling it
  // later brings back exactly what was configured before.
  const toggleWeeklyRoutinesEnabled = () => {
    setChallengeConfigDraft(prev => ({ ...prev, weeklyRoutinesEnabled: !prev.weeklyRoutinesEnabled }));
  };

  const toggleDraftItemDay = (categoryId: string, itemId: string, day: WeekDay) => {
    setChallengeConfigDraft(prev => ({
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map(i => {
                if (i.id !== itemId) return i;
                const days = i.days || [];
                const nextDays = days.includes(day) ? days.filter(d => d !== day) : [...days, day];
                return { ...i, days: nextDays };
              }),
            }
          : cat
      ),
    }));
  };

  // ---- Dynamic Category Block helpers (add / rename / delete whole groups) ----
  const addDraftCategory = () => {
    const newCat: RoutineCategory = { id: generateId(), label: 'New Category', items: [] };
    setChallengeConfigDraft(prev => ({ ...prev, categories: [...prev.categories, newCat] }));
    setNewRoutineItemText(prev => ({ ...prev, [newCat.id]: '' }));
  };

  const renameDraftCategory = (categoryId: string, label: string) => {
    setChallengeConfigDraft(prev => ({
      ...prev,
      categories: prev.categories.map(cat => (cat.id === categoryId ? { ...cat, label } : cat)),
    }));
  };

  // Sets a category's header glyph to a native emoji, or to a Lucide icon
  // (defaulting its color to white the first time an icon is picked so it's
  // always visibly colored, without clobbering a color the user already set).
  const setDraftCategoryIcon = (categoryId: string, iconKind: RoutineIconKind, iconValue: string) => {
    setChallengeConfigDraft(prev => ({
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === categoryId
          ? { ...cat, iconKind, iconValue, iconColor: iconKind === 'icon' ? (cat.iconColor || 'white') : cat.iconColor }
          : cat
      ),
    }));
  };

  const setDraftCategoryIconColor = (categoryId: string, iconColor: RoutineIconColor) => {
    setChallengeConfigDraft(prev => ({
      ...prev,
      categories: prev.categories.map(cat => (cat.id === categoryId ? { ...cat, iconColor } : cat)),
    }));
  };

  // Deleting an entire category block always routes through a confirmation
  // prompt first (see categoryPendingDelete + renderDeleteCategoryConfirm) —
  // this is the function the "Confirm Delete" button actually calls.
  const requestDeleteDraftCategory = (categoryId: string, label: string) => {
    setCategoryPendingDelete({ id: categoryId, label: label.trim() || 'this category' });
  };

  const confirmDeleteDraftCategory = () => {
    if (!categoryPendingDelete) return;
    const categoryId = categoryPendingDelete.id;
    setChallengeConfigDraft(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat.id !== categoryId),
    }));
    setNewRoutineItemText(prev => {
      const next = { ...prev };
      delete next[categoryId];
      return next;
    });
    if (editingRoutineItem?.categoryId === categoryId) {
      setEditingRoutineItem(null);
      setEditingRoutineItemText('');
    }
    if (iconPickerOpenFor === categoryId) setIconPickerOpenFor(null);
    setCategoryPendingDelete(null);
  };

  // Shared cleanup applied to the draft before it becomes the live config,
  // regardless of which footer action triggered the save.
  const cleanChallengeConfigDraft = (): ChallengeConfig => ({
    ...challengeConfigDraft,
    title: challengeConfigDraft.title.trim() || 'Life Discipline Challenge',
    durationDays: Math.min(365, Math.max(1, Math.round(challengeConfigDraft.durationDays) || 1)),
    recheckTokens: Math.max(0, Math.round(challengeConfigDraft.recheckTokens) || 0),
    categories: challengeConfigDraft.categories.map(cat => ({ ...cat, label: cat.label.trim() || 'Untitled Category' })),
  });

  // "Save Changes" — the only save path once a challenge is active. Applies
  // Title / Motto / Category & Routine Item edits to the live config while
  // leaving the active day count, streak history, and every completed/
  // failed tile completely untouched. Token Allowance and Duration are
  // never changed here even if somehow present in the draft — those fields
  // are permanently hidden once a challenge is active and can't be edited.
  const saveChallengeConfigUpdate = () => {
    const cleaned = cleanChallengeConfigDraft();
    setChallengeConfig(prev => ({
      ...cleaned,
      // Anti-cheat: hard-pin these two to whatever is already live,
      // regardless of draft contents.
      durationDays: prev.durationDays,
      recheckTokens: prev.recheckTokens,
    }));
    setIsChallengeConfigOpen(false);
  };

  // Reset Challenge — wipes every recorded day (checks, grace/re-check
  // days, missed-day reasons + notes) and restarts Day 1 from today, using
  // whatever Title/Motto/Routines/Duration/Tokens are currently configured
  // (including any unsaved edits sitting in the draft, so a user can tweak
  // routines and reset in one go). Only ever invoked after the confirmation
  // dialog below — never wired directly to a click handler.
  const resetChallengeProgress = () => {
    const cleaned = cleanChallengeConfigDraft();
    setChallengeConfig(prev => ({
      ...cleaned,
      durationDays: prev.durationDays,
      recheckTokens: prev.recheckTokens,
    }));
    setLifeDisciplineStartDate(getLocalDateKey());
    setLifeDisciplineChecks({});
    setLifeDisciplineGraceDays({});
    setLifeDisciplineMissedReasons({});
    setLifeDisciplineRecheckNotes({});
    setHasStartedChallenge(true);
    setIsResetChallengeConfirmOpen(false);
    setIsChallengeConfigOpen(false);
    showLifeDisciplineToast('Challenge reset — Day 1 starts today');
  };

  // Brand-new challenge (no active progress yet, e.g. first-ever setup):
  // Duration/Tokens are only ever set here — a single "Start Challenge"
  // action applies the full draft and lays down Day 1.
  const saveChallengeConfig = () => {
    const cleaned = cleanChallengeConfigDraft();
    setChallengeConfig(cleaned);
    setLifeDisciplineStartDate(getLocalDateKey());
    setLifeDisciplineChecks({});
    setLifeDisciplineGraceDays({});
    setLifeDisciplineMissedReasons({});
    setHasStartedChallenge(true);
    setIsChallengeConfigOpen(false);
  };

  // Initialize selected account
  useEffect(() => {
    if (accounts.length > 0 && !newTrade.accountId) {
      setNewTrade(prev => ({ ...prev, accountId: accounts[0].id }));
    }
  }, [accounts, newTrade.accountId]);

  // Smart "Trade #" suggestion: pre-fills the next sequential number for the
  // selected account (existing trade count for that account + 1) whenever the
  // Add/Edit Trade modal opens, and live-recalculates the moment the Account
  // dropdown is switched to a different account. Only reacts to the modal
  // opening or the account changing — never to trackingNumber itself — so any
  // manual value the user types (or tweaks via the calculator) is always left
  // alone until the account selection actually changes again.
  const tradeNumberAccountRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    const modalOpen = showAddTrade || showEditTrade;
    if (!modalOpen) {
      tradeNumberAccountRef.current = undefined;
      return;
    }
    const accountId = newTrade.accountId;
    if (!accountId) return;

    const justOpened = tradeNumberAccountRef.current === undefined;
    const accountChanged = !justOpened && tradeNumberAccountRef.current !== accountId;

    // Editing an existing trade: on first open, keep its own saved Trade #
    // instead of clobbering it with a fresh suggestion. Switching the account
    // afterward still recalculates live, same as the Add flow.
    if (justOpened && showEditTrade) {
      tradeNumberAccountRef.current = accountId;
      return;
    }

    if (justOpened || accountChanged) {
      const countForAccount = trades.filter(t =>
        t.accountId === accountId && (!editingTrade || t.id !== editingTrade.id)
      ).length;
      setNewTrade(prev => ({ ...prev, trackingNumber: String(countForAccount + 1) }));
    }
    tradeNumberAccountRef.current = accountId;
  }, [newTrade.accountId, showAddTrade, showEditTrade]);

  // Reset image indices
  useEffect(() => {
    if (showTradeDetail) {
      setExecutionImageIndex(0);
      setTimeframeImageIndices({});
      setSelectedTimeframeTab('Execution/Result');
      const t = trades.find(tr => tr.id === showTradeDetail);
      if (t) {
        setDetailNotesDraft({ mistakesAnalysis: t.mistakesAnalysis || '', lessonsLearned: t.lessonsLearned || '' });
        setDetailRulesFollowedDraft(t.rulesFollowed);
      }
    }
  }, [showTradeDetail]);

  // Reset the cover carousel back to the first slide whenever a (different)
  // strategy model is opened in Preview Mode.
  useEffect(() => {
    if (viewStrategyId) setStrategyCoverIndex(0);
  }, [viewStrategyId]);

  // Same idea for the Knowledge Wiki — reset to the first slide whenever a
  // (different) entry is opened in the full-detail preview modal.
  useEffect(() => {
    if (viewWikiId) setWikiCoverIndex(0);
  }, [viewWikiId]);

  // Populate Discipline & Psychology Review draft when opened
  useEffect(() => {
    const reviewTradeId = showDisciplineReview || showRuleReviewModal;
    if (reviewTradeId) {
      const t = trades.find(tr => tr.id === reviewTradeId);
      if (t) {
        setDisciplineReviewDraft({
          emotions: t.emotions || [],
          mistakes: t.mistakes || [],
          notes: t.notes || '',
        });
      }
    }
  }, [showDisciplineReview, showRuleReviewModal]);

  // Update highest balance
  useEffect(() => {
    setAccounts(prevAccounts => prevAccounts.map(account => {
      const accountTrades = trades.filter(t => t.accountId === account.id);
      if (accountTrades.length === 0) return account;

      const tradingType = account.tradingAccountType || 'LIVE';
      let highestBalance = account.startingBalance;

      if (tradingType === 'FUTURES') {
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

        let runningBalance = account.startingBalance;
        let eodPeak = account.startingBalance;
        const dates = Array.from(tradesByDate.keys()).sort();

        for (const date of dates) {
          const dayTrades = tradesByDate.get(date)!;
          let intradayPeak = runningBalance;

          for (const trade of dayTrades) {
            runningBalance += trade.profitLoss;
            intradayPeak = Math.max(intradayPeak, runningBalance);
          }

          eodPeak = Math.max(eodPeak, intradayPeak);
        }

        highestBalance = Math.max(eodPeak, runningBalance, account.highestBalance || account.startingBalance);
      } else {
        let peak = account.startingBalance;
        let equity = account.startingBalance;
        const sortedTrades = [...accountTrades].sort((a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        for (const trade of sortedTrades) {
          equity += trade.profitLoss;
          if (equity > peak) peak = equity;
        }

        const currentBalance = account.startingBalance + accountTrades.reduce((s, t) => s + t.profitLoss, 0);
        highestBalance = Math.max(peak, currentBalance, account.highestBalance || account.startingBalance);
      }

      if (highestBalance !== account.highestBalance) {
        return { ...account, highestBalance };
      }
      return account;
    }));
  }, [trades]);

  // Calculated values
  // Account-filtered trades only, before the outcome (win/loss/breakeven) filter
  // is applied. Used by the stats bar so its WINS/LOSSES/BE counts always
  // reflect the full picture, even while one of them is actively selected as
  // a filter below.
  const accountFilteredTrades = useMemo(() => {
    if (selectedAccounts.includes('all')) return trades;
    return trades.filter(t => selectedAccounts.includes(t.accountId));
  }, [trades, selectedAccounts]);

  const filteredTrades = useMemo(() => {
    let filtered = accountFilteredTrades;
    if (tradeFilter !== 'all') {
      if (tradeFilter === 'profit') filtered = filtered.filter(t => t.profitLoss >= 10);
      else if (tradeFilter === 'loss') filtered = filtered.filter(t => t.profitLoss <= -10);
      else filtered = filtered.filter(t => Math.abs(t.profitLoss) < 10);
    }
    const dir = tradeSortOrder === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (tradeSortField) {
        case 'pnl':
          return (a.profitLoss - b.profitLoss) * dir;
        case 'symbol':
          return a.symbol.localeCompare(b.symbol) * dir;
        case 'rr': {
          const rrA = a.riskAmount > 0 ? a.profitLoss / a.riskAmount : 0;
          const rrB = b.riskAmount > 0 ? b.profitLoss / b.riskAmount : 0;
          return (rrA - rrB) * dir;
        }
        case 'date':
        default: {
          const timeA = new Date(a.timestamp).getTime();
          const timeB = new Date(b.timestamp).getTime();
          if (timeA !== timeB) return (timeA - timeB) * dir;
          // Layer 2 tie-breaker: exact same date-time timestamp — fall back to the
          // manually entered Trade # (trackingNumber). Entries without a valid numeric
          // Trade # sort last regardless of direction.
          const numA = parseInt(a.trackingNumber || '', 10);
          const numB = parseInt(b.trackingNumber || '', 10);
          const validA = Number.isFinite(numA);
          const validB = Number.isFinite(numB);
          if (!validA && !validB) return 0;
          if (!validA) return 1;
          if (!validB) return -1;
          return (numA - numB) * dir;
        }
      }
    });
  }, [accountFilteredTrades, tradeFilter, tradeSortField, tradeSortOrder]);

  // Global chronological trade numbering (Top-Left Badge).
  //
  // Deliberately NOT `trade.absoluteTradeNumber` — that field is a STATIC
  // counter stamped once at creation/import time as `max(existing) + 1`
  // (see handleImportTradesFile / handleAddTrade / the backup-import path
  // below, where imports even get offset by `+ trades.length`). That's an
  // insertion-order id, not a chronological one: import a batch of OLDER
  // trades after you already have 50, and they get stamped #51-#100 instead
  // of reflowing into #1-#50, which is exactly the "#8, #7 ... #3, #2, #1
  // ... #50, #49" bug.
  //
  // Instead this is computed fresh from the full, unfiltered `trades` master
  // list every time it changes: sort ALL trades oldest -> newest by
  // timestamp, and the badge is just that trade's 1-based position in that
  // sort. The oldest trade in the whole account history is always #1, the
  // newest is always #N — automatically, regardless of import/insertion
  // order, and regardless of which account/date-range filter is currently
  // active (this map is built off `trades`, not `filteredTrades`).
  const chronologicalTradeNumberById = useMemo(() => {
    const sorted = [...trades].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      if (timeA !== timeB) return timeA - timeB;
      // Same-timestamp tiebreaker: manually entered Trade # (trackingNumber),
      // same convention as filteredTrades' date-sort tiebreak above. Falls
      // back to a stable id compare so two trades never flip order between
      // renders even if neither has a numeric trackingNumber.
      const numA = parseInt(a.trackingNumber || '', 10);
      const numB = parseInt(b.trackingNumber || '', 10);
      const validA = Number.isFinite(numA);
      const validB = Number.isFinite(numB);
      if (validA && validB && numA !== numB) return numA - numB;
      if (validA && !validB) return -1;
      if (!validA && validB) return 1;
      return a.id.localeCompare(b.id);
    });
    const map = new Map<string, number>();
    sorted.forEach((t, i) => map.set(t.id, i + 1));
    return map;
  }, [trades]);

  // Returns the trade's dynamic, globally-chronological display number (the
  // Top-Left Badge). This is intentionally independent of the current sort
  // field/order and of any active filters, so the badge on a given trade's
  // card never changes just because the list was re-sorted (Date asc/desc,
  // P&L, R:R, etc.) or filtered down to one account. Toggling
  // Ascending/Descending only changes which card sits on top — the newest
  // trade in the whole history naturally carries the highest number and the
  // oldest the lowest, so the badge and its card always travel together.
  // Wrapped in useCallback purely for referential stability: this is passed
  // down through context to trade card / row components that are now
  // React.memo'd (see TradesScreen.tsx), and a function prop that changes
  // identity every render would defeat that memoization.
  const getDisplayTradeNumber = useCallback((trade: Trade): number => {
    return chronologicalTradeNumberById.get(trade.id) ?? 0;
  }, [chronologicalTradeNumberById]);

  // Database sub-page: applies its own independent filter set on top of the
  // already account/outcome-filtered trades, then paginates the result.
  const dbFilteredTrades = useMemo(() => {
    let result = filteredTrades;
    if (dbSearch.trim()) {
      const q = dbSearch.trim().toLowerCase();
      result = result.filter(t =>
        t.symbol.toLowerCase().includes(q) ||
        (t.trackingNumber || '').toLowerCase().includes(q) ||
        // Search by the same dynamic chronological number shown on the
        // badge (not the stale/static absoluteTradeNumber), so searching
        // "#12" finds whatever trade is actually showing #12 right now.
        String(chronologicalTradeNumberById.get(t.id) ?? '').includes(q) ||
        (t.setupTypes || []).some(s => s.toLowerCase().includes(q)) ||
        (t.confluences || []).some(c => c.toLowerCase().includes(q)) ||
        (t.mistakes || []).some(m => m.toLowerCase().includes(q)) ||
        (t.notes || '').toLowerCase().includes(q) ||
        t.date.toLowerCase().includes(q)
      );
    }
    if (dbAccountFilter !== 'all') result = result.filter(t => t.accountId === dbAccountFilter);
    if (dbSessionFilter !== 'all') result = result.filter(t => t.session === dbSessionFilter);
    if (dbOutcomeFilter !== 'all') {
      if (dbOutcomeFilter === 'profit') result = result.filter(t => t.profitLoss > 0);
      else if (dbOutcomeFilter === 'loss') result = result.filter(t => t.profitLoss < 0);
      else result = result.filter(t => Math.abs(t.profitLoss) < 10);
    }
    if (dbRulesFilter !== 'all') result = result.filter(t => t.rulesFollowed === dbRulesFilter);
    return result;
  }, [filteredTrades, dbSearch, dbAccountFilter, dbSessionFilter, dbOutcomeFilter, dbRulesFilter, chronologicalTradeNumberById]);

  const dbPageCount = Math.max(1, Math.ceil(dbFilteredTrades.length / DB_PAGE_SIZE));
  const dbPagedTrades = useMemo(() => {
    const start = dbPage * DB_PAGE_SIZE;
    return dbFilteredTrades.slice(start, start + DB_PAGE_SIZE);
  }, [dbFilteredTrades, dbPage]);

  const stats = useMemo(() => {
    const filtered = filteredTrades;
    const totalPnL = filtered.reduce((sum, t) => sum + t.profitLoss, 0);
    const wins = filtered.filter(t => t.profitLoss > 0);
    const losses = filtered.filter(t => t.profitLoss <= 0);
    const winRate = filtered.length > 0 ? (wins.length / filtered.length) * 100 : 0;
    const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + t.profitLoss, 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + t.profitLoss, 0) / losses.length) : 0;
    const profitFactor = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0;

    const totalStarting = selectedAccounts.includes('all')
      ? accounts.reduce((s, a) => s + a.startingBalance, 0)
      : accounts.filter(a => selectedAccounts.includes(a.id)).reduce((s, a) => s + a.startingBalance, 0);
    const growth = totalStarting > 0 ? (totalPnL / totalStarting) * 100 : 0;

    // Current Rules/Discipline Streak: consecutive "Rules Followed" trades
    // counting back from the most recently logged trade, stopping the
    // instant a "Rules Broken" trade is hit.
    const chronoTrades = [...filtered].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    let disciplineStreak = 0;
    for (let i = chronoTrades.length - 1; i >= 0; i--) {
      if (chronoTrades[i].rulesFollowed === 'followed') disciplineStreak++;
      else break;
    }

    return { totalTrades: filtered.length, totalPnL, winRate, profitFactor, avgWin, avgLoss, growth, wins: wins.length, losses: losses.length, disciplineStreak };
  }, [filteredTrades, accounts, selectedAccounts]);

  const equityData = useMemo(() => {
    let cumulative = selectedAccounts.includes('all')
      ? accounts.reduce((s, a) => s + a.startingBalance, 0)
      : accounts.filter(a => selectedAccounts.includes(a.id)).reduce((s, a) => s + a.startingBalance, 0);

    return filteredTrades.slice().reverse().map(t => {
      cumulative += t.profitLoss;
      return cumulative;
    });
  }, [filteredTrades, accounts, selectedAccounts]);

  // Passive Playbook tracking: for every rule, count how many logged trades
  // carry a Discipline Tracker "mistake" tag that matches it. No manual
  // checkboxes anywhere — this just scans data you already entered while
  // reviewing trades.
  const ruleViolationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const rule of rules) {
      if (rule.itemType === 'divider') continue;
      let count = 0;
      for (const trade of trades) {
        if ((trade.mistakes || []).some(tag => tagMatchesRuleTitle(tag, rule.title))) count++;
      }
      counts[rule.id] = count;
    }
    return counts;
  }, [rules, trades]);

  const calendarDays = useMemo(() => {
    const { year, month } = calendarMonth;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push({ day: null, trades: [], pnl: 0 });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayTrades = filteredTrades.filter(t => t.date === dateStr);
      const pnl = dayTrades.reduce((s, t) => s + t.profitLoss, 0);
      days.push({ day: d, trades: dayTrades, pnl });
    }
    return days;
  }, [calendarMonth, filteredTrades]);

  // Handlers
  const handleAddAccount = () => {
    if (!newAccount.name) return;
    const account: Account = {
      id: generateId(),
      name: newAccount.name,
      startingBalance: newAccount.startingBalance || 10000,
      type: newAccount.type as Account['type'],
      customTypeName: newAccount.type === 'Custom Challenge' ? newAccount.customTypeName : undefined,
      propFirm: newAccount.propFirm || '',
      createdAt: new Date().toISOString(),
      hasProfitTarget: newAccount.hasProfitTarget || false,
      profitTarget: newAccount.profitTarget || 0,
      maxDrawdown: newAccount.maxDrawdown || 0,
      tradingAccountType: newAccount.tradingAccountType || 'LIVE',
      highestBalance: newAccount.startingBalance || 10000,
      maxDrawdownAllowance: newAccount.maxDrawdownAllowance || 0,
      fixedMinBalance: newAccount.fixedMinBalance || 0,
    };
    setAccounts([...accounts, account]);
    if (userId) {
      supabase.from('accounts').insert({ id: account.id, user_id: userId, data: account }).then(({ error }) => {
        if (error) {
          console.error('Failed to save account to Supabase:', error);
          showTradeImportToast('error', 'Failed to save the new account — it may not appear on other devices.');
        }
      });
    } else {
      // Not a silent no-op: without this, the account only ever exists in
      // local React state and vanishes on the next reload with no warning.
      console.error('Cannot save account to Supabase: no authenticated user id.');
      showTradeImportToast('error', 'Not signed in — this account was NOT saved and will be lost on refresh.');
    }
    setNewAccount({
      name: '',
      startingBalance: 10000,
      type: 'Eval',
      propFirm: '',
      hasProfitTarget: false,
      profitTarget: 0,
      maxDrawdown: 0,
      tradingAccountType: 'LIVE',
      highestBalance: 10000,
      maxDrawdownAllowance: 0,
      fixedMinBalance: 0,
    });
    resetCalculator();
    setShowAddAccount(false);
  };

  const handleUpdateAccount = () => {
    if (!editingAccount.id || !editingAccount.name) return;
    const updatedAccount = { ...accounts.find(a => a.id === editingAccount.id), ...editingAccount } as Account;
    setAccounts(accounts.map(a => a.id === editingAccount.id ? updatedAccount : a));
    if (userId) {
      supabase.from('accounts').update({ data: updatedAccount }).eq('id', updatedAccount.id).eq('user_id', userId).then(({ error }) => {
        if (error) {
          console.error('Failed to update account in Supabase:', error);
          showTradeImportToast('error', 'Failed to save account changes — it may not sync to other devices.');
        }
      });
    } else {
      console.error('Cannot update account in Supabase: no authenticated user id.');
      showTradeImportToast('error', 'Not signed in — these account changes were NOT saved and will be lost on refresh.');
    }
    setEditingAccount({});
    resetCalculator();
    setShowEditAccount(null);
  };

  // Funded CFD/Futures accounts only. Bumps the payout counter and stamps
  // cycleBaselinePnL with the account's cumulative trade P&L *as of right
  // now* (snapping current-cycle balance/progress metrics back to the
  // starting balance — see getAccountCyclePnL) plus cycleStartedAt with the
  // reset timestamp (scopes the Funded Futures peak-equity/trailing-stop
  // calc to trades placed since the reset). Trade history is left
  // completely untouched — every past trade still counts toward lifetime
  // analytics, it's just excluded from the new cycle's running total.
  const handleRecordPayoutReset = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return;
    const accountTrades = trades.filter(t => t.accountId === accountId);
    const totalPnL = accountTrades.reduce((s, t) => s + t.profitLoss, 0);
    const updatedAccount: Account = {
      ...account,
      payoutResetsCount: (account.payoutResetsCount || 0) + 1,
      cycleBaselinePnL: totalPnL,
      cycleStartedAt: new Date().toISOString(),
    };
    setAccounts(accounts.map(a => a.id === accountId ? updatedAccount : a));
    if (userId) {
      supabase.from('accounts').update({ data: updatedAccount }).eq('id', updatedAccount.id).eq('user_id', userId).then(({ error }) => {
        if (error) {
          console.error('Failed to record payout/reset in Supabase:', error);
          showTradeImportToast('error', 'Failed to save the payout reset — it may not sync to other devices.');
        }
      });
    } else {
      console.error('Cannot update account in Supabase: no authenticated user id.');
      showTradeImportToast('error', 'Not signed in — this payout reset was NOT saved and will be lost on refresh.');
    }
    // Keep the modal's local editing draft in sync so the payout badge and
    // baseline balance reflect the reset immediately without closing the modal.
    if (editingAccount.id === accountId) {
      setEditingAccount(prev => ({
        ...prev,
        payoutResetsCount: updatedAccount.payoutResetsCount,
        cycleBaselinePnL: updatedAccount.cycleBaselinePnL,
        cycleStartedAt: updatedAccount.cycleStartedAt,
      }));
    }
  };

  const handleDeleteAccount = (id: string) => {
    setAccountPendingDelete(id);
  };

  const confirmDeleteAccount = () => {
    if (!accountPendingDelete) return;
    const id = accountPendingDelete;
    setAccounts(accounts.filter(a => a.id !== id));
    setTrades(trades.filter(t => t.accountId !== id));
    if (selectedAccounts.includes(id)) {
      setSelectedAccounts(selectedAccounts.filter(a => a !== id));
    }
    if (userId) {
      // Trades belonging to this account are removed server-side too, via
      // the trades.account_id ON DELETE CASCADE foreign key — no separate
      // trades delete call needed here.
      supabase.from('accounts').delete().eq('id', id).eq('user_id', userId).then(({ error }) => {
        if (error) {
          console.error('Failed to delete account from Supabase:', error);
          showTradeImportToast('error', 'Failed to delete the account on the server — it may reappear on reload.');
        }
      });
    } else {
      console.error('Cannot delete account from Supabase: no authenticated user id.');
      showTradeImportToast('error', 'Not signed in — this account was only removed locally and may reappear on reload.');
    }
    setAccountPendingDelete(null);
  };

  // MT4/MT5 report timestamps are naive strings in the BROKER'S OWN server
  // time — no timezone marker at all. Your broker's server runs GMT+3 (a
  // 9:30 PM Philippine-time trade shows as 16:30 in the report), so we shift
  // by +5 hours to land on real Philippine time (UTC+8). If you ever switch
  // brokers and the server timezone changes, this is the one number to edit.
  const MT5_SERVER_UTC_OFFSET_HOURS = 3;
  const PH_UTC_OFFSET_HOURS = 8;
  const BROKER_TO_PH_SHIFT_HOURS = PH_UTC_OFFSET_HOURS - MT5_SERVER_UTC_OFFSET_HOURS;

  // Trading-day cutoff: unlike a calendar day, the trading day doesn't roll
  // over at midnight — the market just keeps running. A trade opened at,
  // say, 1:30 AM still belongs to the PREVIOUS session for Daily Count /
  // Calendar purposes, all the way up to this cutoff hour. Everything from
  // 4:00 AM onward counts as the new trading day. This is the one number to
  // edit if the desk's "end of day" ever moves.
  const TRADING_DAY_CUTOFF_HOUR = 4;

  // Given PH wall-clock Y/M/D/H components, returns the "trading day" date
  // string (YYYY-MM-DD) — the calendar date, unless it falls before the
  // cutoff hour, in which case it rolls back to the previous day.
  const getTradingDayDateStr = (year: number, monthIndex0: number, day: number, hour: number): string => {
    const asOf = new Date(year, monthIndex0, day, hour);
    asOf.setHours(asOf.getHours() - TRADING_DAY_CUTOFF_HOUR);
    const y = asOf.getFullYear();
    const mo = String(asOf.getMonth() + 1).padStart(2, '0');
    const d = String(asOf.getDate()).padStart(2, '0');
    return `${y}-${mo}-${d}`;
  };

  // Takes a naive "YYYY-MM-DDTHH:mm:ss" broker-server-time string and returns
  // the equivalent Philippine-time date/time fields, plus a correct absolute
  // ISO timestamp. Does the shift with pure UTC-epoch arithmetic first (so
  // the result never depends on what timezone the device running this app
  // happens to be set to), then hands back local Date fields the same way
  // every other trade in the app already expects (buildLiveTimestamp /
  // getTodayLocalDate also assume the device clock reads Philippine time).
  const convertBrokerTimeToPH = (isoNaive: string): { date: string; time: string; timestamp: string } | null => {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(isoNaive)) return null;
    const brokerAsUtcMs = Date.parse(`${isoNaive.slice(0, 19)}Z`);
    if (isNaN(brokerAsUtcMs)) return null;
    const phMs = brokerAsUtcMs + BROKER_TO_PH_SHIFT_HOURS * 60 * 60 * 1000;
    const phWall = new Date(phMs); // read back via UTC getters = PH wall-clock fields
    const y = phWall.getUTCFullYear();
    const mo = String(phWall.getUTCMonth() + 1).padStart(2, '0');
    const d = String(phWall.getUTCDate()).padStart(2, '0');
    const h = String(phWall.getUTCHours()).padStart(2, '0');
    const mi = String(phWall.getUTCMinutes()).padStart(2, '0');
    const s = String(phWall.getUTCSeconds()).padStart(2, '0');
    const asLocalDate = new Date(y, phWall.getUTCMonth(), Number(d), Number(h), Number(mi), Number(s));
    // `date` is the TRADING day (4 AM cutoff, not midnight) — this is what
    // Calendar/Daily Count group by. `time` stays the real wall-clock time
    // so trade history still shows "1:30 AM" instead of silently relabeling it.
    const tradingDate = getTradingDayDateStr(y, phWall.getUTCMonth(), Number(d), Number(h));
    return { date: tradingDate, time: `${h}:${mi}`, timestamp: asLocalDate.toISOString() };
  };

  // Reads an uploaded MT4/MT5 .csv or .html report, parses it, maps each
  // parsed row onto the app's Trade shape, de-dupes against trades already
  // imported (by broker ticket ID), and appends whatever's left. All
  // account-level stats (PnL, win rate, trade table) recompute automatically
  // off the `trades` state update below — no extra wiring needed here.
  const handleImportTradesFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (e.target) e.target.value = ''; // reset so re-selecting the same file re-fires onChange
    if (!file) return;

    const nameLower = file.name.toLowerCase();
    if (!nameLower.endsWith('.csv') && !nameLower.endsWith('.html') && !nameLower.endsWith('.htm')) {
      showTradeImportToast('error', 'Unsupported file type — please upload a .csv or .html MT4/MT5 report.');
      return;
    }
    if (accounts.length === 0) {
      showTradeImportToast('error', 'Add an account first, then import your trades.');
      return;
    }

    setIsImportingTrades(true);
    try {
      const text = await readMTReportFileText(file);
      const parsed = parseMTFile(file.name, text);
      if (parsed.length === 0) {
        showTradeImportToast('error', 'No valid trades found in that report.');
        return;
      }

      // Import into whichever single account is currently filtered to; if
      // "All Accounts" (or several) is selected, fall back to the first account.
      const targetAccountId = (!selectedAccounts.includes('all') && selectedAccounts.length === 1)
        ? selectedAccounts[0]
        : accounts[0].id;

      const existingTicketIds = new Set(
        trades.map(t => t.importTicketId).filter((v): v is string => !!v)
      );
      let nextTradeNumber = trades.length > 0 ? Math.max(...trades.map(t => t.absoluteTradeNumber || 0)) + 1 : 1;
      // Trade # (trackingNumber) is per-account, same convention as the Add
      // Trade modal's "smart Trade #" suggestion (existing count for that
      // account + 1, incrementing as each new one is appended below) — so
      // imported trades get numbered automatically and never need typing in.
      let nextTrackingNumberForAccount = trades.filter(t => t.accountId === targetAccountId).length + 1;
      const newCustomSymbols: string[] = [];

      // Chronological order so absoluteTradeNumber/trackingNumber assignment reads sensibly.
      const sortedParsed = [...parsed].sort((a, b) => new Date(a.openTime).getTime() - new Date(b.openTime).getTime());

      const newTrades: Trade[] = [];
      let duplicateCount = 0;
      for (const p of sortedParsed) {
        if (existingTicketIds.has(p.ticketId)) { duplicateCount++; continue; }
        existingTicketIds.add(p.ticketId);

        // Broker server time -> Philippine time (see convertBrokerTimeToPH above).
        const openPH = convertBrokerTimeToPH(p.openTime);
        const closePH = convertBrokerTimeToPH(p.closeTime);
        const dateStr = openPH ? openPH.date : new Date().toISOString().slice(0, 10);

        if (p.symbol && !PRESET_SYMBOLS.some(ps => ps.value === p.symbol) && !customSymbols.includes(p.symbol) && !newCustomSymbols.includes(p.symbol)) {
          newCustomSymbols.push(p.symbol);
        }

        newTrades.push({
          id: generateId(),
          accountId: targetAccountId,
          symbol: p.symbol,
          profitLoss: p.profitLoss,
          entryPrice: p.entryPrice,
          exitPrice: p.exitPrice,
          stopLoss: p.stopLoss,
          takeProfit: p.takeProfit,
          slPoints: calculatePoints(p.symbol, p.entryPrice, p.stopLoss),
          tpPoints: calculatePoints(p.symbol, p.entryPrice, p.takeProfit),
          lotSize: p.lotSize,
          orderType: p.orderType,
          setupTypes: [],
          confluences: [],
          mistakes: [],
          // isReviewed is the ONLY gate for Pending Review vs. Rule
          // Adherence Log — it is set exclusively by handleSaveDisciplineReview
          // when the user actually submits the "+ Review" form (Discipline &
          // Psychology Review). It is deliberately NOT derived from
          // rulesFollowed: that field is edited independently in the Trade
          // Detail modal (detailRulesFollowedDraft) and can also get
          // back-filled by the migrateStoredData/normalize pipeline on
          // reload — either of which previously caused freshly-imported
          // trades to be silently treated as "reviewed". A brand-new,
          // single-purpose boolean that nothing else in the app writes to
          // can't be flipped by either of those paths.
          isReviewed: false,
          rulesFollowed: undefined,
          timeframes: initializeEmptyTimeframes(),
          executionImages: [],
          riskAmount: 0,
          mistakesAnalysis: '',
          lessonsLearned: '',
          timestamp: openPH ? openPH.timestamp : buildLiveTimestamp(dateStr),
          date: dateStr,
          startTime: openPH ? openPH.time : undefined,
          endTime: closePH ? closePH.time : undefined,
          absoluteTradeNumber: nextTradeNumber++,
          trackingNumber: String(nextTrackingNumberForAccount++),
          importTicketId: p.ticketId,
        });
      }

      if (newTrades.length === 0) {
        showTradeImportToast(
          'error',
          duplicateCount > 0
            ? 'All trades in this file are already imported.'
            : 'No valid trades found in that report.'
        );
        return;
      }

      setTrades(prev => [...prev, ...newTrades]);
      if (newTrades.length > 0) {
        if (userId) {
          supabase.from('trades').insert(
            newTrades.map(t => ({ id: t.id, user_id: userId, account_id: t.accountId, data: t }))
          ).then(({ error }) => {
            if (error) {
              console.error('Failed to save imported trades to Supabase:', error);
              showTradeImportToast('error', 'Imported trades may not have synced to your account — reload to check.');
            }
          });
        } else {
          console.error('Cannot save imported trades to Supabase: no authenticated user id.');
          showTradeImportToast('error', 'Not signed in — imported trades were NOT saved and will be lost on refresh.');
        }
      }
      if (newCustomSymbols.length > 0) {
        setCustomSymbols(prev => [...prev, ...newCustomSymbols.filter(s => !prev.includes(s))]);
      }

      const parts = [`Imported ${newTrades.length} trade${newTrades.length === 1 ? '' : 's'}`];
      if (duplicateCount > 0) parts.push(`skipped ${duplicateCount} duplicate${duplicateCount === 1 ? '' : 's'}`);
      showTradeImportToast('success', parts.join(' — ') + '.');
    } catch (err) {
      showTradeImportToast('error', 'Could not read that file — make sure it\'s a valid MT4/MT5 export.');
    } finally {
      setIsImportingTrades(false);
    }
  };

  const handleAddTrade = () => {
    if (!newTrade.accountId || !newTrade.symbol) return;
    if (newTrade.rulesFollowed !== 'followed' && newTrade.rulesFollowed !== 'broken') {
      setRulesAdherenceError(true);
      return;
    }
    setRulesAdherenceError(false);
    const chosenDate = newTrade.date || new Date().toISOString().split('T')[0];
    const nextTradeNumber = trades.length > 0
      ? Math.max(...trades.map(t => t.absoluteTradeNumber || 0)) + 1
      : 1;
    const trade: Trade = {
      id: generateId(),
      accountId: newTrade.accountId,
      symbol: newTrade.symbol?.toUpperCase() || '',
      profitLoss: Number(newTrade.profitLoss) || 0,
      entryPrice: Number(newTrade.entryPrice) || 0,
      stopLoss: Number(newTrade.stopLoss) || 0,
      takeProfit: Number(newTrade.takeProfit) || 0,
      slPoints: calculatePoints(newTrade.symbol || '', Number(newTrade.entryPrice) || 0, Number(newTrade.stopLoss) || 0),
      tpPoints: calculatePoints(newTrade.symbol || '', Number(newTrade.entryPrice) || 0, Number(newTrade.takeProfit) || 0),
      setupTypes: newTrade.setupTypes || [],
      confluences: newTrade.confluences || [],
      mistakes: newTrade.mistakes || [],
      rulesFollowed: newTrade.rulesFollowed as 'followed' | 'broken',
      // Manually-added trades require Followed/Broken to be chosen before
      // the form will even save (see the rulesFollowed guard clause just
      // above), so there's no separate pending state to pass through here.
      isReviewed: true,
      timeframes: newTrade.timeframes || initializeEmptyTimeframes(),
      executionImages: newTrade.executionImages || [],
      riskAmount: Number(newTrade.riskAmount) || 0,
      mistakesAnalysis: newTrade.mistakesAnalysis || '',
      lessonsLearned: newTrade.lessonsLearned || '',
      timestamp: buildLiveTimestamp(chosenDate),
      date: chosenDate,
      startTime: newTrade.startTime,
      endTime: newTrade.endTime,
      absoluteTradeNumber: nextTradeNumber,
      trackingNumber: newTrade.trackingNumber?.trim() || '',
      session: newTrade.session,
    };
    setTrades([...trades, trade]);
    if (userId) {
      supabase.from('trades').insert({ id: trade.id, user_id: userId, account_id: trade.accountId, data: trade }).then(({ error }) => {
        if (error) {
          console.error('Failed to save trade to Supabase:', error);
          showTradeImportToast('error', 'Failed to save the new trade — it may not appear on other devices.');
        }
      });
    } else {
      console.error('Cannot save trade to Supabase: no authenticated user id.');
      showTradeImportToast('error', 'Not signed in — this trade was NOT saved and will be lost on refresh.');
    }
    const symbolValue = newTrade.symbol?.toUpperCase() || '';
    if (symbolValue && !PRESET_SYMBOLS.some(p => p.value === symbolValue) && !customSymbols.includes(symbolValue)) {
      setCustomSymbols(prev => [...prev, symbolValue]);
    }
    resetTradeForm();
    resetCalculator();
    setShowAddTrade(false);
  };

  const openEditTrade = (trade: Trade) => {
    setNewTrade({ ...trade });
    setPriceInputs({
      entryPrice: formatPriceInput(trade.entryPrice || 0),
      stopLoss: formatPriceInput(trade.stopLoss || 0),
      takeProfit: formatPriceInput(trade.takeProfit || 0),
      profitLoss: formatPriceInput(trade.profitLoss || 0),
      riskAmount: formatPriceInput(trade.riskAmount || 0),
    });
    setShowTradeTimeFields(!!(trade.startTime || trade.endTime));
    setShowTradePriceLevels(!!(trade.entryPrice || trade.stopLoss || trade.takeProfit));
    setRulesAdherenceError(false);
    setEditingTrade(trade);
    setShowEditTrade(true);
  };

  const handleSaveEditedTrade = () => {
    if (!editingTrade || !newTrade.accountId || !newTrade.symbol) return;
    if (newTrade.rulesFollowed !== 'followed' && newTrade.rulesFollowed !== 'broken') {
      setRulesAdherenceError(true);
      return;
    }
    setRulesAdherenceError(false);
    const chosenDate = newTrade.date || editingTrade.date;
    const updated: Trade = {
      ...editingTrade,
      accountId: newTrade.accountId,
      symbol: newTrade.symbol?.toUpperCase() || '',
      profitLoss: Number(newTrade.profitLoss) || 0,
      entryPrice: Number(newTrade.entryPrice) || 0,
      stopLoss: Number(newTrade.stopLoss) || 0,
      takeProfit: Number(newTrade.takeProfit) || 0,
      slPoints: calculatePoints(newTrade.symbol || '', Number(newTrade.entryPrice) || 0, Number(newTrade.stopLoss) || 0),
      tpPoints: calculatePoints(newTrade.symbol || '', Number(newTrade.entryPrice) || 0, Number(newTrade.takeProfit) || 0),
      setupTypes: newTrade.setupTypes || [],
      confluences: newTrade.confluences || [],
      mistakes: newTrade.mistakes || [],
      rulesFollowed: newTrade.rulesFollowed as 'followed' | 'broken',
      // Same reasoning as handleAddTrade: this save path also requires
      // Followed/Broken to already be chosen, so the trade counts as
      // reviewed the moment it saves — even if it started as an unreviewed
      // import and was edited directly instead of going through "+ Review".
      isReviewed: true,
      timeframes: newTrade.timeframes || initializeEmptyTimeframes(),
      executionImages: newTrade.executionImages || [],
      riskAmount: Number(newTrade.riskAmount) || 0,
      mistakesAnalysis: newTrade.mistakesAnalysis || '',
      lessonsLearned: newTrade.lessonsLearned || '',
      // Intentionally NOT regenerated here: the original creation timestamp is what
      // drives sort order in Trade History, and it must stay frozen for the lifetime
      // of the trade. Only handleAddTrade (brand-new trades) may call
      // buildLiveTimestamp(). Editing a trade must never bump it to "now", or the
      // trade jumps to the front of the list on every save.
      timestamp: editingTrade.timestamp,
      date: chosenDate,
      startTime: newTrade.startTime,
      endTime: newTrade.endTime,
      trackingNumber: newTrade.trackingNumber?.trim() || '',
      session: newTrade.session,
    };
    setTrades(trades.map(t => t.id === editingTrade.id ? updated : t));
    if (userId) {
      supabase.from('trades').update({ data: updated, account_id: updated.accountId }).eq('id', updated.id).eq('user_id', userId).then(({ error }) => {
        if (error) {
          console.error('Failed to update trade in Supabase:', error);
          showTradeImportToast('error', 'Failed to save trade changes — it may not sync to other devices.');
        }
      });
    } else {
      console.error('Cannot update trade in Supabase: no authenticated user id.');
      showTradeImportToast('error', 'Not signed in — these trade changes were NOT saved and will be lost on refresh.');
    }
    const symbolValue = newTrade.symbol?.toUpperCase() || '';
    if (symbolValue && !PRESET_SYMBOLS.some(p => p.value === symbolValue) && !customSymbols.includes(symbolValue)) {
      setCustomSymbols(prev => [...prev, symbolValue]);
    }
    setEditingTrade(null);
    resetTradeForm();
    resetCalculator();
    setShowEditTrade(false);
  };

  const handleDeleteTrade = (id: string) => {
    setTradePendingDelete(id);
  };

  const confirmDeleteTrade = () => {
    if (!tradePendingDelete) return;
    const id = tradePendingDelete;
    setTrades(prev => prev.filter(t => t.id !== id));
    setSelectedTradeIds(prev => prev.filter(t => t !== id));
    if (userId) {
      supabase.from('trades').delete().eq('id', id).eq('user_id', userId).then(({ error }) => {
        if (error) {
          console.error('Failed to delete trade from Supabase:', error);
          showTradeImportToast('error', 'Failed to delete the trade on the server — it may reappear on reload.');
        }
      });
    } else {
      console.error('Cannot delete trade from Supabase: no authenticated user id.');
      showTradeImportToast('error', 'Not signed in — this trade was only removed locally and may reappear on reload.');
    }
    setTradePendingDelete(null);
    setShowTradeDetail(null);
    setShowExpandGallery(false);
  };

  // Lightweight patch for post-trade notes & context criteria, editable directly from the
  // trade evaluation preview modal (does not touch the master raw trade setup fields).
  const handleSaveDetailNotes = () => {
    if (!showTradeDetail) return;
    let updatedTrade: Trade | null = null;
    setTrades(prev => prev.map(t => {
      if (t.id !== showTradeDetail) return t;
      updatedTrade = { ...t, mistakesAnalysis: detailNotesDraft.mistakesAnalysis, lessonsLearned: detailNotesDraft.lessonsLearned, rulesFollowed: detailRulesFollowedDraft };
      return updatedTrade;
    }));
    if (updatedTrade) {
      if (userId) {
        supabase.from('trades').update({ data: updatedTrade }).eq('id', showTradeDetail).eq('user_id', userId).then(({ error }) => {
          if (error) {
            console.error('Failed to save trade notes to Supabase:', error);
            showTradeImportToast('error', 'Failed to save notes — they may not sync to other devices.');
          }
        });
      } else {
        console.error('Cannot save trade notes to Supabase: no authenticated user id.');
        showTradeImportToast('error', 'Not signed in — these notes were NOT saved and will be lost on refresh.');
      }
    }
  };

  // Saves the Discipline & Psychology Review — updates only emotions, mistakes, and
  // notes on the target trade, leaving every technical field (symbol, P&L, date, etc.) untouched.
  // When saved from the Rule Adherence Log's split-view modal, the modal stays open and
  // the right pane just drops back to read-only mode; from the standalone review modal
  // (Pending Review's "+ Review" button), saving closes the modal as before.
  const handleSaveDisciplineReview = () => {
    const targetId = showRuleReviewModal || showDisciplineReview;
    if (!targetId) return;
    let updatedTrade: Trade | null = null;
    setTrades(prev => prev.map(t => {
      if (t.id !== targetId) return t;
      // This is the one and only place isReviewed flips to true — it fires
      // whether the save came from Pending Review's first-time "+ Review"
      // flow (showDisciplineReview) or from re-editing an already-reviewed
      // trade from the Rule Adherence Log (showRuleReviewModal), so a trade
      // only ever leaves Pending Review once this exact save action runs.
      updatedTrade = { ...t, emotions: disciplineReviewDraft.emotions, mistakes: disciplineReviewDraft.mistakes, notes: disciplineReviewDraft.notes, isReviewed: true };
      return updatedTrade;
    }));
    if (updatedTrade) {
      if (userId) {
        supabase.from('trades').update({ data: updatedTrade }).eq('id', targetId).eq('user_id', userId).then(({ error }) => {
          if (error) {
            console.error('Failed to save discipline review to Supabase:', error);
            showTradeImportToast('error', 'Failed to save review — it may not sync to other devices.');
          }
        });
      } else {
        console.error('Cannot save discipline review to Supabase: no authenticated user id.');
        showTradeImportToast('error', 'Not signed in — this review was NOT saved and will be lost on refresh.');
      }
    }
    if (showRuleReviewModal) {
      setIsEditingRuleReview(false);
    } else {
      setShowDisciplineReview(null);
    }
  };

  // Discards any in-progress edits in the split-view modal's right pane and
  // reverts to the trade's last-saved emotions/mistakes/notes before dropping
  // back to read-only mode. The left pane (trade preview) is never touched.
  const handleCancelRuleReviewEdit = () => {
    const t = trades.find(tr => tr.id === showRuleReviewModal);
    if (t) {
      setDisciplineReviewDraft({
        emotions: t.emotions || [],
        mistakes: t.mistakes || [],
        notes: t.notes || '',
      });
    }
    setIsEditingRuleReview(false);
  };

  const closeRuleReviewModal = () => {
    setShowRuleReviewModal(null);
    setIsEditingRuleReview(false);
  };

  // Trade multi-select helpers
  const toggleTradeSelectMode = () => {
    setTradeSelectMode(prev => !prev);
    setSelectedTradeIds([]);
  };

  // useCallback: passed down to the now-memoized trade card/row components
  // as a prop, so a stable identity keeps their memo comparison meaningful.
  const toggleTradeSelected = useCallback((id: string) => {
    setSelectedTradeIds(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  }, []);

  const toggleSelectAllTrades = () => {
    if (selectedTradeIds.length === filteredTrades.length) {
      setSelectedTradeIds([]);
    } else {
      setSelectedTradeIds(filteredTrades.map(t => t.id));
    }
  };

  const handleDeleteSelectedTrades = () => {
    if (selectedTradeIds.length === 0) return;
    setShowDeleteSelectedConfirm(true);
  };

  const confirmDeleteSelectedTrades = () => {
    const idsToDelete = selectedTradeIds;
    setTrades(prev => prev.filter(t => !idsToDelete.includes(t.id)));
    setSelectedTradeIds([]);
    setTradeSelectMode(false);
    setShowDeleteSelectedConfirm(false);
    if (idsToDelete.length > 0) {
      if (userId) {
        supabase.from('trades').delete().in('id', idsToDelete).eq('user_id', userId).then(({ error }) => {
          if (error) {
            console.error('Failed to bulk-delete trades from Supabase:', error);
            showTradeImportToast('error', 'Failed to delete some trades on the server — they may reappear on reload.');
          }
        });
      } else {
        console.error('Cannot bulk-delete trades from Supabase: no authenticated user id.');
        showTradeImportToast('error', 'Not signed in — those trades were only removed locally and may reappear on reload.');
      }
    }
  };

  // Helper to get today's date in local YYYY-MM-DD format
  // Returns the current TRADING day (YYYY-MM-DD), not the calendar day —
  // before the 4 AM cutoff this still returns yesterday's date, matching
  // how the Calendar/Daily Count group trades. Used as the default date
  // when logging a new trade.
  const getTodayLocalDate = () => {
    const now = new Date();
    return getTradingDayDateStr(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
  };

  // Theme-aware class helpers
  const tc = {
    // Background classes
    bg: theme !== 'light' ? 'bg-zinc-900' : 'bg-white',
    bgSecondary: theme !== 'light' ? 'bg-zinc-800' : 'bg-zinc-100',
    bgTertiary: theme !== 'light' ? 'bg-zinc-950' : 'bg-zinc-50',
    bgHover: theme !== 'light' ? 'hover:bg-zinc-700' : 'hover:bg-zinc-200',
    bgCard: theme !== 'light' ? 'bg-zinc-900/40' : 'bg-white',
    bgCardHover: theme !== 'light' ? 'hover:bg-zinc-900/70' : 'hover:bg-zinc-50',
    // Border classes
    border: theme !== 'light' ? 'border-zinc-800' : 'border-zinc-200',
    borderSecondary: theme !== 'light' ? 'border-zinc-700' : 'border-zinc-300',
    borderHover: theme !== 'light' ? 'hover:border-zinc-700' : 'hover:border-zinc-300',
    // Text classes
    text: theme !== 'light' ? 'text-white' : 'text-zinc-900',
    textSecondary: theme !== 'light' ? 'text-zinc-400' : 'text-zinc-600',
    textMuted: theme !== 'light' ? 'text-zinc-500' : 'text-zinc-400',
    // Input classes
    input: theme !== 'light'
      ? 'bg-zinc-900/50 border-zinc-800 text-white focus:border-zinc-600'
      : 'bg-white border-zinc-200 text-zinc-900 focus:border-zinc-400',
    // Button secondary
    btnSecondary: theme !== 'light'
      ? 'bg-zinc-800 hover:bg-zinc-700 text-white'
      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900',
  };

  const resetTradeForm = () => {
    setNewTrade({
      symbol: 'NQ',
      profitLoss: 0,
      entryPrice: 0,
      stopLoss: 0,
      takeProfit: 0,
      setupTypes: [],
      confluences: [],
      mistakes: [],
      rulesFollowed: undefined,
      timeframes: initializeEmptyTimeframes(),
      executionImages: [],
      riskAmount: 0,
      mistakesAnalysis: '',
      lessonsLearned: '',
      accountId: accounts[0]?.id || '',
      date: getTodayLocalDate(), // Fresh local date on every reset
      trackingNumber: '',
      session: undefined,
    });
    setPriceInputs({ entryPrice: '', stopLoss: '', takeProfit: '', profitLoss: '', riskAmount: '' });
    setShowTradeTimeFields(false);
    setShowTradePriceLevels(false);
    setRulesAdherenceError(false);
  };

  const handleSaveRule = () => {
    if (!newRule.title) return;
    const allPillarIds = getAllPillarIds(customPillars);
    const severity: RuleSeverity = RULE_SEVERITIES.includes(newRule.severity as RuleSeverity) ? (newRule.severity as RuleSeverity) : 'warning';
    const pillar: RulePillar = allPillarIds.includes(newRule.pillar as string) ? (newRule.pillar as RulePillar) : 'risk';
    const iconKind: RuleIconKind = newRule.iconKind === 'emoji' ? 'emoji' : 'icon';
    const iconValue = newRule.iconValue || getPillarDefaultIcon(pillar, customPillars);
    const color: RuleAccentColor = RULE_ACCENT_PALETTE.some(c => c.id === newRule.color) ? (newRule.color as RuleAccentColor) : getPillarDefaultColor(pillar, customPillars);
    const bulletStyle: RuleBulletStyle = RULE_BULLET_STYLES.some(b => b.id === newRule.bulletStyle) ? (newRule.bulletStyle as RuleBulletStyle) : 'bullet';
    const textSize: RuleTextSize = newRule.textSize === 'large' ? 'large' : 'normal';
    if (editingRuleId) {
      setRules(prev => prev.map(r => r.id === editingRuleId
        ? { ...r, category: newRule.category || '', title: newRule.title!, description: newRule.description || '', severity, pillar, iconKind, iconValue, color, bulletStyle, textSize }
        : r
      ));
    } else {
      setRules(prev => [...prev, { id: generateId(), category: newRule.category || '', title: newRule.title!, description: newRule.description || '', severity, pillar, iconKind, iconValue, color, bulletStyle, textSize }]);
    }
    setNewRule({ category: '', title: '', description: '', severity: 'warning', pillar: 'risk', iconKind: 'icon', iconValue: RULE_PILLAR_DEFAULT_ICON.risk, color: RULE_PILLAR_DEFAULT_COLOR.risk, bulletStyle: 'bullet', textSize: 'normal' });
    setEditingRuleId(null);
    setShowAddRule(false);
    setShowRuleIconPicker(false);
  };

  const openAddRuleModal = (pillar: RulePillar = 'risk') => {
    setEditingRuleId(null);
    setNewRule({ category: '', title: '', description: '', severity: 'warning', pillar, iconKind: 'icon', iconValue: getPillarDefaultIcon(pillar, customPillars), color: getPillarDefaultColor(pillar, customPillars), bulletStyle: 'bullet', textSize: 'normal' });
    setShowAddRule(true);
    setShowRuleIconPicker(false);
  };

  const openEditRuleModal = (rule: Rule) => {
    setEditingRuleId(rule.id);
    setNewRule({ ...rule });
    setShowAddRule(true);
    setShowRuleIconPicker(false);
  };

  const closeRuleModal = () => {
    setShowAddRule(false);
    setEditingRuleId(null);
    setNewRule({ category: '', title: '', description: '', severity: 'warning', pillar: 'risk', iconKind: 'icon', iconValue: RULE_PILLAR_DEFAULT_ICON.risk, color: RULE_PILLAR_DEFAULT_COLOR.risk, bulletStyle: 'bullet', textSize: 'normal' });
    setShowRuleIconPicker(false);
  };

  const handleDeleteRule = (id: string) => setRules(rules.filter(r => r.id !== id));

  // ---- Dividers ----
  // A divider is just a Rule entry with itemType: 'divider' — it lives in
  // the same `rules` array (so it naturally keeps its position within a
  // pillar's list) but only its id/pillar/dividerLabel matter.
  const handleAddDivider = (pillar: RulePillar) => {
    setRules(prev => [...prev, {
      id: generateId(),
      category: '',
      title: '',
      description: '',
      severity: 'guide',
      pillar,
      itemType: 'divider',
      dividerLabel: 'Section',
    }]);
  };

  const handleUpdateDividerLabel = (id: string, label: string) => {
    setRules(prev => prev.map(r => (r.id === id ? { ...r, dividerLabel: label } : r)));
  };

  // ---- Custom pillars ----
  // Lets the user add extra rule "columns" beyond the 3 built-in ones
  // (Risk & Capital, Execution, Psychology) — e.g. a "Capital & Execution"
  // pillar, or anything else they want to track separately.
  const [showAddPillarModal, setShowAddPillarModal] = useState(false);
  const [newPillar, setNewPillar] = useState<Partial<CustomPillar>>({ label: '', icon: 'Layers', color: 'indigo' });
  const [pillarPendingDelete, setPillarPendingDelete] = useState<string | null>(null);

  const openAddPillarModal = () => {
    setNewPillar({ label: '', icon: 'Layers', color: 'indigo' });
    setShowAddPillarModal(true);
  };

  const closeAddPillarModal = () => {
    setShowAddPillarModal(false);
    setNewPillar({ label: '', icon: 'Layers', color: 'indigo' });
  };

  const handleAddPillar = () => {
    const label = (newPillar.label || '').trim();
    if (!label) return;
    const id = `custom_${generateId()}`;
    setCustomPillars(prev => [...prev, {
      id,
      label,
      shortLabel: label,
      icon: (newPillar.icon && RULE_ICON_OPTIONS.includes(newPillar.icon)) ? newPillar.icon : 'Layers',
      color: (RULE_ACCENT_PALETTE.some(c => c.id === newPillar.color) ? newPillar.color : 'indigo') as RuleAccentColor,
    }]);
    closeAddPillarModal();
  };

  // Deleting a custom pillar also removes every rule/divider filed under it
  // (there's nowhere else for them to live once the column is gone).
  const handleDeletePillar = (id: string) => {
    setCustomPillars(prev => prev.filter(p => p.id !== id));
    setRules(prev => prev.filter(r => r.pillar !== id));
    setPillarPendingDelete(null);
  };

  // The main cover now supports multiple images — every file picked (the
  // input allows multi-select) gets appended as its own entry rather than
  // replacing whatever cover images already exist.
  // Drag-and-drop reordering of the strategy gallery itself — lets the user
  // pin any strategy model to the front or anywhere else in the grid.
  const moveStrategy = (fromStrategyId: string, toStrategyId: string) => {
    if (fromStrategyId === toStrategyId) return;
    setStrategies(prev => {
      const list = [...prev];
      const fromIdx = list.findIndex(s => s.id === fromStrategyId);
      const toIdx = list.findIndex(s => s.id === toStrategyId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const [moved] = list.splice(fromIdx, 1);
      list.splice(toIdx, 0, moved);
      return list;
    });
  };

  const handleStrategyImagesPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setNewStrategy(prev => ({ ...prev, images: [...prev.images, { id: generateId(), url, type: 'base64' as const }] }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = ''; // allow re-selecting the same file(s) again later
  };

  const removeStrategyImage = (imageId: string) => {
    setNewStrategy(prev => ({ ...prev, images: prev.images.filter(img => img.id !== imageId) }));
  };

  // Drag-and-drop reordering of the main cover images — the first slide
  // becomes both the gallery thumbnail and the carousel's opening slide.
  const moveStrategyImage = (fromImageId: string, toImageId: string) => {
    if (fromImageId === toImageId) return;
    setNewStrategy(prev => {
      const images = [...prev.images];
      const fromIdx = images.findIndex(img => img.id === fromImageId);
      const toIdx = images.findIndex(img => img.id === toImageId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const [moved] = images.splice(fromIdx, 1);
      images.splice(toIdx, 0, moved);
      return { ...prev, images };
    });
  };

  const openAddStrategyModal = () => {
    setEditingStrategyId(null);
    setNewStrategy({ title: '', market: '', description: '', steps: [], images: [] });
    strategyStepImageInputRefs.current = {};
    setStepPendingDeleteId(null);
    setDraggingStepImageId(null);
    setDragOverStepImageId(null);
    setDraggingCoverImageId(null);
    setDragOverCoverImageId(null);
    setShowAddStrategy(true);
  };

  const openEditStrategyModal = (strategy: Strategy) => {
    setEditingStrategyId(strategy.id);
    setNewStrategy({ title: strategy.title, market: strategy.market, description: strategy.description || '', steps: strategy.steps.map(s => ({ ...s, images: s.images.map(img => ({ ...img })) })), images: strategy.images.map(img => ({ ...img })) });
    strategyStepImageInputRefs.current = {};
    setStepPendingDeleteId(null);
    setDraggingStepImageId(null);
    setDragOverStepImageId(null);
    setDraggingCoverImageId(null);
    setDragOverCoverImageId(null);
    setShowAddStrategy(true);
  };

  const closeStrategyModal = () => {
    setShowAddStrategy(false);
    setEditingStrategyId(null);
    setNewStrategy({ title: '', market: '', description: '', steps: [], images: [] });
    setStepPendingDeleteId(null);
    setDraggingStepImageId(null);
    setDragOverStepImageId(null);
    setDraggingCoverImageId(null);
    setDragOverCoverImageId(null);
  };

  // Dynamic Step-by-Step Execution Builder — add / edit / remove / reorder-free
  // list of steps, each an independent { title, notes, images[] } unit.
  const addStrategyStep = () => {
    setNewStrategy(prev => ({ ...prev, steps: [...prev.steps, { id: generateId(), title: '', notes: '', images: [] }] }));
  };

  const updateStrategyStep = (id: string, field: 'title' | 'notes', value: string) => {
    setNewStrategy(prev => ({ ...prev, steps: prev.steps.map(s => s.id === id ? { ...s, [field]: value } : s) }));
  };

  // Removing a step always goes through a confirmation prompt first — this
  // just opens it; the actual removal happens in confirmRemoveStrategyStep.
  const requestRemoveStrategyStep = (id: string) => setStepPendingDeleteId(id);

  const removeStrategyStep = (id: string) => {
    setNewStrategy(prev => ({ ...prev, steps: prev.steps.filter(s => s.id !== id) }));
    delete strategyStepImageInputRefs.current[id];
  };

  const confirmRemoveStrategyStep = () => {
    if (!stepPendingDeleteId) return;
    removeStrategyStep(stepPendingDeleteId);
    setStepPendingDeleteId(null);
  };

  // Each step supports multiple screenshots — every file picked (the input
  // allows multi-select) gets appended as its own entry rather than
  // replacing whatever images the step already has.
  const handleStrategyStepImagesPick = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setNewStrategy(prev => ({
          ...prev,
          steps: prev.steps.map(s => s.id === id ? { ...s, images: [...s.images, { id: generateId(), url, type: 'base64' as const }] } : s),
        }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = ''; // allow re-selecting the same file(s) again later
  };

  const removeStrategyStepImage = (stepId: string, imageId: string) => {
    setNewStrategy(prev => ({
      ...prev,
      steps: prev.steps.map(s => s.id === stepId ? { ...s, images: s.images.filter(img => img.id !== imageId) } : s),
    }));
  };

  // Drag-and-drop reordering within a single step's image set — lets the
  // user pick which screenshot shows first (e.g. in the timeline gallery).
  const moveStrategyStepImage = (stepId: string, fromImageId: string, toImageId: string) => {
    if (fromImageId === toImageId) return;
    setNewStrategy(prev => ({
      ...prev,
      steps: prev.steps.map(s => {
        if (s.id !== stepId) return s;
        const images = [...s.images];
        const fromIdx = images.findIndex(img => img.id === fromImageId);
        const toIdx = images.findIndex(img => img.id === toImageId);
        if (fromIdx === -1 || toIdx === -1) return s;
        const [moved] = images.splice(fromIdx, 1);
        images.splice(toIdx, 0, moved);
        return { ...s, images };
      }),
    }));
  };

  const handleSaveStrategy = () => {
    if (!newStrategy.title.trim()) return;
    // Drop fully-empty step rows (no title, no notes, no images) so blank
    // "+ Add Execution Step" rows the user never filled in aren't persisted.
    const cleanedSteps = newStrategy.steps
      .map(s => ({ ...s, title: s.title.trim(), notes: s.notes.trim() }))
      .filter(s => s.title || s.notes || s.images.length > 0);
    if (editingStrategyId) {
      setStrategies(prev => prev.map(s => s.id === editingStrategyId
        ? { ...s, title: newStrategy.title.trim(), market: newStrategy.market.trim(), description: newStrategy.description.trim(), steps: cleanedSteps, images: newStrategy.images }
        : s
      ));
    } else {
      setStrategies(prev => [...prev, { id: generateId(), title: newStrategy.title.trim(), market: newStrategy.market.trim(), description: newStrategy.description.trim(), steps: cleanedSteps, images: newStrategy.images }]);
    }
    closeStrategyModal();
  };

  // Deleting a strategy always goes through a confirmation prompt first —
  // this just opens it; the actual removal happens in confirmDeleteStrategy.
  const handleDeleteStrategy = (id: string) => setStrategyPendingDelete(id);

  const confirmDeleteStrategy = () => {
    if (!strategyPendingDelete) return;
    const id = strategyPendingDelete;
    setStrategies(prev => prev.filter(s => s.id !== id));
    setStrategyPendingDelete(null);
    setViewStrategyId(prev => (prev === id ? null : prev));
  };

  const handleNoticeImagesPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setNewNotice(prev => ({ ...prev, images: [...prev.images, { id: generateId(), url, type: 'base64' as const }] }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = ''; // allow re-selecting the same file(s) again later
  };

  const removeNoticeImage = (imageId: string) => {
    setNewNotice(prev => ({ ...prev, images: prev.images.filter(img => img.id !== imageId) }));
  };

  // Drag-and-drop reordering of the notice's screenshots — mirrors
  // moveStrategyImage above; the first image is used as the card thumbnail.
  const moveNoticeImage = (fromImageId: string, toImageId: string) => {
    if (fromImageId === toImageId) return;
    setNewNotice(prev => {
      const images = [...prev.images];
      const fromIdx = images.findIndex(img => img.id === fromImageId);
      const toIdx = images.findIndex(img => img.id === toImageId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const [moved] = images.splice(fromIdx, 1);
      images.splice(toIdx, 0, moved);
      return { ...prev, images };
    });
  };

  // Dynamic Step-by-Step Breakdown builder for Market Notices — mirrors the
  // Strategy Model's addStrategyStep/updateStrategyStep/etc. exactly, just
  // scoped to newNotice.steps instead of newStrategy.steps. Lets a single
  // insight or trap be explained across multiple stages when one screenshot
  // isn't enough to walk through the full idea.
  const addNoticeStep = () => {
    setNewNotice(prev => ({ ...prev, steps: [...prev.steps, { id: generateId(), title: '', notes: '', images: [] }] }));
  };

  const updateNoticeStep = (id: string, field: 'title' | 'notes', value: string) => {
    setNewNotice(prev => ({ ...prev, steps: prev.steps.map(s => s.id === id ? { ...s, [field]: value } : s) }));
  };

  // Removing a step always goes through a confirmation prompt first — this
  // just opens it; the actual removal happens in confirmRemoveNoticeStep.
  const requestRemoveNoticeStep = (id: string) => setNoticeStepPendingDeleteId(id);

  const removeNoticeStep = (id: string) => {
    setNewNotice(prev => ({ ...prev, steps: prev.steps.filter(s => s.id !== id) }));
    delete noticeStepImageInputRefs.current[id];
  };

  const confirmRemoveNoticeStep = () => {
    if (!noticeStepPendingDeleteId) return;
    removeNoticeStep(noticeStepPendingDeleteId);
    setNoticeStepPendingDeleteId(null);
  };

  // Each step supports multiple screenshots — every file picked (the input
  // allows multi-select) gets appended as its own entry rather than
  // replacing whatever images the step already has.
  const handleNoticeStepImagesPick = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setNewNotice(prev => ({
          ...prev,
          steps: prev.steps.map(s => s.id === id ? { ...s, images: [...s.images, { id: generateId(), url, type: 'base64' as const }] } : s),
        }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = ''; // allow re-selecting the same file(s) again later
  };

  const removeNoticeStepImage = (stepId: string, imageId: string) => {
    setNewNotice(prev => ({
      ...prev,
      steps: prev.steps.map(s => s.id === stepId ? { ...s, images: s.images.filter(img => img.id !== imageId) } : s),
    }));
  };

  // Drag-and-drop reordering within a single step's image set — lets the
  // user pick which screenshot shows first.
  const moveNoticeStepImage = (stepId: string, fromImageId: string, toImageId: string) => {
    if (fromImageId === toImageId) return;
    setNewNotice(prev => ({
      ...prev,
      steps: prev.steps.map(s => {
        if (s.id !== stepId) return s;
        const images = [...s.images];
        const fromIdx = images.findIndex(img => img.id === fromImageId);
        const toIdx = images.findIndex(img => img.id === toImageId);
        if (fromIdx === -1 || toIdx === -1) return s;
        const [moved] = images.splice(fromIdx, 1);
        images.splice(toIdx, 0, moved);
        return { ...s, images };
      }),
    }));
  };

  const handleAddNotice = () => {
    if (!newNotice.title.trim()) return;
    // Drop fully-empty step rows (no title, no notes, no images) so blank
    // "+ Add Step" rows the user never filled in aren't persisted.
    const cleanedSteps = newNotice.steps
      .map(s => ({ ...s, title: s.title.trim(), notes: s.notes.trim() }))
      .filter(s => s.title || s.notes || s.images.length > 0);
    if (editingNoticeId) {
      setNotices(prev => prev.map(n =>
        n.id === editingNoticeId
          ? { ...n, ...newNotice, title: newNotice.title.trim(), steps: cleanedSteps }
          : n
      ));
    } else {
      setNotices([...notices, {
        id: generateId(),
        ...newNotice,
        title: newNotice.title.trim(),
        steps: cleanedSteps,
        timestamp: new Date().toISOString(),
        messages: [],
      }]);
    }
    setNewNotice(emptyNoticeDraft);
    setEditingNoticeId(null);
    noticeStepImageInputRefs.current = {};
    setNoticeStepPendingDeleteId(null);
    setDraggingNoticeStepImageId(null);
    setDragOverNoticeStepImageId(null);
    setShowAddNotice(false);
  };

  const handleOpenAddNotice = (type: NoticeType = 'mistake') => {
    setEditingNoticeId(null);
    setNewNotice({ ...emptyNoticeDraft, type });
    noticeStepImageInputRefs.current = {};
    setNoticeStepPendingDeleteId(null);
    setDraggingNoticeStepImageId(null);
    setDragOverNoticeStepImageId(null);
    setShowAddNotice(true);
  };

  const handleEditNotice = (notice: MarketNotice) => {
    setEditingNoticeId(notice.id);
    // Back-compat: older notices may still only have a single `imageUrl`
    // string from before multi-image support — fold it into the array so
    // existing data still shows up in the editor.
    const legacyImageUrl = (notice as unknown as { imageUrl?: string }).imageUrl;
    const migratedImages: TradeImage[] = notice.images ?? (legacyImageUrl
      ? [{ id: generateId(), url: legacyImageUrl, type: legacyImageUrl.startsWith('data:') ? 'base64' as const : 'url' as const }]
      : []);
    // Back-compat: notices saved before the step-by-step breakdown existed
    // won't have a `steps` array yet — default to empty instead of crashing.
    const migratedSteps: StrategyStep[] = (notice.steps ?? []).map(s => ({ ...s, images: s.images.map(img => ({ ...img })) }));
    setNewNotice({
      type: notice.type,
      title: notice.title,
      session: notice.session,
      tag: notice.tag,
      images: migratedImages,
      steps: migratedSteps,
      description: notice.description,
      whatHappenedTitle: notice.whatHappenedTitle,
      keyTakeawayTitle: notice.keyTakeawayTitle,
      consequence: notice.consequence,
      prevention: notice.prevention,
      preventionTitle: notice.preventionTitle,
    });
    noticeStepImageInputRefs.current = {};
    setNoticeStepPendingDeleteId(null);
    setDraggingNoticeStepImageId(null);
    setDragOverNoticeStepImageId(null);
    setShowAddNotice(true);
  };

  const handleDeleteNotice = (id: string) => {
    setNotices(notices.filter(n => n.id !== id));
    if (editingNoticeId === id) { setEditingNoticeId(null); setShowAddNotice(false); }
  };

  const WIKI_FORM_DEFAULT: Partial<WikiEntry> & { images: TradeImage[] } = { title: '', content: '', category: WIKI_CATEGORIES[0], images: [], keyRules: [], bestSession: '', timeframe: '', contextNotes: '' };

  // Normalizes a wiki entry's chart image(s) regardless of whether it's
  // legacy single-`imageUrl` data (pre-multi-image) or the newer `images`
  // array, so every place that renders a wiki entry's chart(s) reads one
  // consistent shape. Mirrors the back-compat fold-in used for notices.
  const getWikiImages = (entry: WikiEntry): TradeImage[] => {
    if (entry.images && entry.images.length > 0) return entry.images;
    const legacy = (entry as unknown as { imageUrl?: string }).imageUrl;
    return legacy ? [{ id: `${entry.id}-legacy`, url: legacy, type: legacy.startsWith('data:') ? 'base64' as const : 'url' as const }] : [];
  };

  const handleAddWiki = () => {
    if (!newWiki.title?.trim()) return;
    const cleanedRules = (newWiki.keyRules || []).map(r => r.trim()).filter(Boolean);
    const images = newWiki.images || [];
    if (editingWikiId) {
      setWikiEntries(prev => prev.map(w => w.id === editingWikiId
        ? {
            ...w,
            title: newWiki.title!.trim(),
            content: newWiki.content || '',
            category: newWiki.category || WIKI_CATEGORIES[0],
            images,
            imageUrl: images[0]?.url || '',
            keyRules: cleanedRules,
            bestSession: newWiki.bestSession || '',
            timeframe: newWiki.timeframe || '',
            contextNotes: newWiki.contextNotes || '',
          }
        : w));
    } else {
      setWikiEntries(prev => [...prev, {
        id: generateId(),
        title: newWiki.title!.trim(),
        content: newWiki.content || '',
        category: newWiki.category || WIKI_CATEGORIES[0],
        images,
        imageUrl: images[0]?.url || '',
        keyRules: cleanedRules,
        bestSession: newWiki.bestSession || '',
        timeframe: newWiki.timeframe || '',
        contextNotes: newWiki.contextNotes || '',
      }]);
    }
    setNewWiki(WIKI_FORM_DEFAULT);
    setEditingWikiId(null);
    setShowAddWiki(false);
  };

  const handleOpenAddWiki = () => {
    setEditingWikiId(null);
    setNewWiki(WIKI_FORM_DEFAULT);
    setDraggingWikiImageId(null);
    setDragOverWikiImageId(null);
    setShowAddWiki(true);
  };

  // `focusImage` is set when opening the modal from the "quick image edit"
  // entry point (clicking the empty chart placeholder on the main preview)
  // so the modal can scroll/focus straight to the upload dropzone instead of
  // the title field.
  const handleOpenEditWiki = (entry: WikiEntry, focusImage: boolean = false) => {
    setEditingWikiId(entry.id);
    setNewWiki({
      title: entry.title,
      content: entry.content,
      category: entry.category || WIKI_CATEGORIES[0],
      images: getWikiImages(entry),
      keyRules: entry.keyRules,
      bestSession: entry.bestSession,
      timeframe: entry.timeframe,
      contextNotes: entry.contextNotes,
    });
    setViewWikiId(null);
    setShowAddWiki(true);
    setWikiImageFocusRequested(focusImage);
    setDraggingWikiImageId(null);
    setDragOverWikiImageId(null);
  };

  // Deleting a wiki entry always goes through a confirmation prompt first
  // (see DeleteWikiConfirm) — this just opens it; the actual removal
  // happens in confirmDeleteWiki. Mirrors handleDeleteStrategy.
  const handleDeleteWiki = (id: string) => setWikiPendingDelete(id);

  const confirmDeleteWiki = () => {
    if (!wikiPendingDelete) return;
    const id = wikiPendingDelete;
    setWikiEntries(wikiEntries.filter(w => w.id !== id));
    if (viewWikiId === id) setViewWikiId(null);
    if (editingWikiId === id) { setEditingWikiId(null); setShowAddWiki(false); }
    setWikiPendingDelete(null);
  };

  // The diagram/chart field now supports multiple images — every file
  // picked (file input allows multi-select), dropped, or pasted gets
  // appended as its own entry rather than replacing whatever's already
  // there. Mirrors handleStrategyImagesPick.
  const appendWikiImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setNewWiki(prev => ({ ...prev, images: [...(prev.images || []), { id: generateId(), url, type: 'base64' as const }] }));
    };
    reader.readAsDataURL(file);
  };

  const handleWikiImagesPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach(appendWikiImageFile);
    e.target.value = ''; // allow re-selecting the same file(s) again later
  };

  const removeWikiImage = (imageId: string) => {
    setNewWiki(prev => ({ ...prev, images: (prev.images || []).filter(img => img.id !== imageId) }));
  };

  // Drag-and-drop reordering of the image grid — the first slide becomes
  // both the gallery thumbnail and the preview modal's opening slide.
  const moveWikiImage = (fromImageId: string, toImageId: string) => {
    if (fromImageId === toImageId) return;
    setNewWiki(prev => {
      const images = [...(prev.images || [])];
      const fromIdx = images.findIndex(img => img.id === fromImageId);
      const toIdx = images.findIndex(img => img.id === toImageId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const [moved] = images.splice(fromIdx, 1);
      images.splice(toIdx, 0, moved);
      return { ...prev, images };
    });
  };

  // Drag-and-drop onto the "Upload diagram image" dropzone in the Add/Edit
  // Wiki modal.
  const handleWikiImageDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isWikiImageDragActive) setIsWikiImageDragActive(true);
  };

  const handleWikiImageDragLeave = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWikiImageDragActive(false);
  };

  const handleWikiImageDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWikiImageDragActive(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) Array.from(files).forEach(appendWikiImageFile);
  };

  // Ctrl+V / Cmd+V while the Add/Edit Wiki modal is open — attach to the
  // modal's outermost element (or the dropzone itself) via onPaste so it
  // fires no matter which field inside the modal currently has focus.
  const handleWikiImagePaste = (e: React.ClipboardEvent<HTMLElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          appendWikiImageFile(file);
        }
        break;
      }
    }
  };

  // Ctrl+V / Cmd+V directly on the main Knowledge Wiki page (no modal open)
  // — appends to whichever concept is currently active in the detail
  // workbench. Wired up as a window-level listener below (see useEffect) so
  // it works regardless of what happens to have focus on the page.
  const handleWikiPageImagePaste = (e: ClipboardEvent) => {
    if (!viewWikiId || showAddWiki) return;
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (!file) continue;
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = ev.target?.result as string;
          setWikiEntries(prev => prev.map(w => (w.id === viewWikiId
            ? { ...w, images: [...getWikiImages(w), { id: generateId(), url: dataUrl, type: 'base64' as const }], imageUrl: w.imageUrl || dataUrl }
            : w)));
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  };

  useEffect(() => {
    if (!viewWikiId || showAddWiki) return;
    const listener = (e: ClipboardEvent) => handleWikiPageImagePaste(e);
    window.addEventListener('paste', listener);
    return () => window.removeEventListener('paste', listener);
  }, [viewWikiId, showAddWiki, setWikiEntries]);

  // Once the Add/Edit Wiki modal has rendered with a focus request pending
  // (see handleOpenEditWiki), scroll the dropzone into view and focus it,
  // then clear the request so it doesn't re-trigger on later opens.
  useEffect(() => {
    if (!showAddWiki || !wikiImageFocusRequested) return;
    const el = wikiImageDropzoneRef.current;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus({ preventScroll: true });
    }
    setWikiImageFocusRequested(false);
  }, [showAddWiki, wikiImageFocusRequested]);

  // ---- Option B: "AI Auto-Fill" -----------------------------------------
  // Fills the rest of the Add/Edit Wiki form from the typed title alone by
  // calling the Gemini API directly from the browser using
  // import.meta.env.VITE_GEMINI_API_KEY.
  //
  // ⚠️ Heads up: any `VITE_*` env var gets baked into the client bundle at
  // build time, so this key is readable by anyone who opens devtools or
  // views the bundled JS — there's no way to keep it secret in a pure
  // client-side call. That's fine for a personal/local build, but if this
  // app is ever deployed somewhere other people can reach, put a thin
  // backend (Supabase Edge Function, Vercel/Next API route, etc.) in front
  // of the Gemini call instead, so the key never ships to the browser and
  // you can rate-limit per user. Worth restricting the key itself to this
  // API in Google AI Studio / Cloud Console either way.
  const WIKI_AUTOFILL_TIMEOUT_MS = 20000;
  // gemini-2.5-flash is on Google's Oct 16, 2026 deprecation list (and some
  // developers have reported it 404ing even earlier than that date), and
  // gemini-1.5-flash / all 1.x models are already fully shut down and will
  // always 404. gemini-3.5-flash is the current GA flash model with no
  // shutdown date announced — swap this constant if Google moves the
  // goalposts again.
  const GEMINI_MODEL = 'gemini-3.5-flash';

  const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> =>
    Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error('AI auto-fill timed out')), ms)),
    ]);

  // Clean, empty structured template used whenever the AI call fails, times
  // out, or hits a rate/credit limit — never leaves the form blank or resets
  // what the user already typed.
  const buildWikiAutoFillFallback = (): Partial<WikiEntry> => ({
    category: WIKI_CATEGORIES[0],
    content: 'Short description of the concept — what it is and why it matters.',
    keyRules: ['1. Condition A', '2. Condition B', '3. Condition C'],
    bestSession: '',
    timeframe: '',
    contextNotes: 'Add any additional session/timeframe confluence notes here.',
  });

  const buildWikiAutoFillPrompt = (title: string) => `You are helping populate a personal trading knowledge-base entry for the concept "${title}" (ICT / Smart Money / price-action style trading).

Return ONLY a JSON object — no markdown, no code fences, no commentary — with exactly these fields:
{
  "category": one of "PD Arrays", "Market Structure", "Terminology", "Execution Models" — whichever best fits "${title}",
  "content": a 2-4 sentence core definition/overview of the concept,
  "keyRules": an array of 3-6 short strings, each a concrete entry criterion/condition checklist item,
  "bestSession": the trading session where this concept is most reliable (e.g. "NY Open", "London Open"), or "" if not session-specific,
  "timeframe": the typical timeframe(s) this concept is analyzed on (e.g. "5m / 15m HTF"), or "" if not applicable,
  "contextNotes": 1-2 sentences of additional confluence/context notes
}`;

  const handleWikiAutoFill = async () => {
    const title = (newWiki.title || '').trim();
    if (!title || isWikiAutoFilling) return;

    setIsWikiAutoFilling(true);
    try {
      const apiKey = (import.meta.env as Record<string, string | undefined>).VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('Missing VITE_GEMINI_API_KEY');

      const response = await withTimeout(
        fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: buildWikiAutoFillPrompt(title) }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.4,
              },
            }),
          }
        ),
        WIKI_AUTOFILL_TIMEOUT_MS
      );

      // Non-2xx covers rate limits (429), server errors (500), invalid key
      // (401/403), etc. — all of these fall through to the fallback below.
      if (!response.ok) throw new Error(`Gemini API error ${response.status}`);

      const payload = await response.json();
      const rawText = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (typeof rawText !== 'string' || !rawText.trim()) {
        throw new Error('Gemini API returned an empty response');
      }

      const result = JSON.parse(rawText) as {
        category?: string;
        content?: string;
        keyRules?: string[];
        bestSession?: string;
        timeframe?: string;
        contextNotes?: string;
      };

      if (!result || typeof result !== 'object' || (!result.content && !result.keyRules)) {
        throw new Error('AI auto-fill returned an unexpected response shape');
      }

      setNewWiki(prev => ({
        ...prev,
        category: (result.category && (WIKI_CATEGORIES as readonly string[]).includes(result.category))
          ? (result.category as WikiCategory)
          : (prev.category || WIKI_CATEGORIES[0]),
        content: result.content?.trim() || prev.content || '',
        keyRules: Array.isArray(result.keyRules) && result.keyRules.length > 0
          ? result.keyRules.map(r => String(r).trim()).filter(Boolean)
          : (prev.keyRules || []),
        bestSession: result.bestSession?.trim() || prev.bestSession || '',
        timeframe: result.timeframe?.trim() || prev.timeframe || '',
        contextNotes: result.contextNotes?.trim() || prev.contextNotes || '',
      }));
    } catch (err) {
      // API limit, timeout, network failure, missing/invalid key, or
      // malformed response — never crash the app or wipe out the title the
      // user already typed. Load the fallback template instead so they can
      // fill it in by hand.
      setNewWiki(prev => ({ ...prev, ...buildWikiAutoFillFallback() }));
      showTradeImportToast('error', 'AI limits reached or unavailable. Loaded default template instead.');
    } finally {
      setIsWikiAutoFilling(false);
    }
  };

  // Key Rules / Conditions editor — stored as a string[], edited as one
  // rule per line via a small add/remove list (mirrors the pattern used
  // for Strategy steps rather than a single freeform textarea, so each
  // rule renders as its own clean bullet in the detail modal).
  const addWikiKeyRule = () => setNewWiki(prev => ({ ...prev, keyRules: [...(prev.keyRules || []), ''] }));
  const updateWikiKeyRule = (idx: number, value: string) => setNewWiki(prev => {
    const rules = [...(prev.keyRules || [])];
    rules[idx] = value;
    return { ...prev, keyRules: rules };
  });
  const removeWikiKeyRule = (idx: number) => setNewWiki(prev => ({ ...prev, keyRules: (prev.keyRules || []).filter((_, i) => i !== idx) }));

  // Confirmation-guarded variant of removeWikiKeyRule (see
  // DeleteWikiRuleConfirm) — requestRemoveWikiKeyRule just opens the
  // prompt, confirmRemoveWikiKeyRule performs the actual removal.
  const requestRemoveWikiKeyRule = (idx: number) => setWikiRulePendingDeleteIndex(idx);

  const confirmRemoveWikiKeyRule = () => {
    if (wikiRulePendingDeleteIndex === null) return;
    removeWikiKeyRule(wikiRulePendingDeleteIndex);
    setWikiRulePendingDeleteIndex(null);
  };

  // ---- Standard Trading Concepts import (Option A) ----------------------
  // One-click populate of the pre-written ICT / Price Action library. Dedupes
  // by title (case-insensitive) so re-clicking after a partial import, or
  // after the user has already hand-written an entry with the same name,
  // never creates duplicates — only concepts genuinely missing get added.
  const missingStandardConcepts = useMemo(() => {
    const existingTitles = new Set(wikiEntries.map(w => w.title.trim().toLowerCase()));
    return STANDARD_TRADING_CONCEPTS.filter(c => !existingTitles.has(c.title.trim().toLowerCase()));
  }, [wikiEntries]);

  const allStandardConceptsImported = missingStandardConcepts.length === 0;

  const handleImportStandardConcepts = () => {
    if (missingStandardConcepts.length === 0) return;
    const newEntries: WikiEntry[] = missingStandardConcepts.map(c => ({
      id: generateId(),
      title: c.title,
      content: c.overview,
      category: c.category,
      images: [],
      imageUrl: '',
      keyRules: c.checklist,
      bestSession: c.sessionConfluence.session,
      timeframe: c.sessionConfluence.timeframe,
      contextNotes: [c.sessionConfluence.notes, c.tags.length ? `Tags: ${c.tags.join(', ')}` : '']
        .filter(Boolean)
        .join('\n\n'),
    }));
    setWikiEntries(prev => [...prev, ...newEntries]);
    return newEntries;
  };

  const handleDeleteSetupType = (id: string, name: string) => {
    setSetupTypes(prev => prev.filter(s => s.id !== id));
    setNewTrade(prev => ({ ...prev, setupTypes: (prev.setupTypes || []).filter(s => s !== name) }));
  };

  const handleDeleteConfluence = (id: string, name: string) => {
    setConfluences(prev => prev.filter(c => c.id !== id));
    setNewTrade(prev => ({ ...prev, confluences: (prev.confluences || []).filter(c => c !== name) }));
  };

  const handleDeleteMistakeType = (id: string, name: string) => {
    setMistakesList(prev => prev.filter(m => m.id !== id));
    setNewTrade(prev => ({ ...prev, mistakes: (prev.mistakes || []).filter(m => m !== name) }));
    setEditingTrade(prev => prev ? { ...prev, mistakes: prev.mistakes.filter(m => m !== name) } : prev);
  };

  // Tag color handlers — update a tag's saved color attribute; every place
  // that renders the tag (badges, chips, option rows) looks the color up
  // from setupTypes/confluences/mistakesList, so this updates it everywhere.
  const handleChangeSetupTypeColor = (id: string, color: TagColor) => {
    setSetupTypes(prev => prev.map(s => (s.id === id ? { ...s, color } : s)));
  };

  const handleChangeConfluenceColor = (id: string, color: TagColor) => {
    setConfluences(prev => prev.map(c => (c.id === id ? { ...c, color } : c)));
  };

  const handleChangeMistakeColor = (id: string, color: TagColor) => {
    setMistakesList(prev => prev.map(m => (m.id === id ? { ...m, color } : m)));
  };

  const handleDeleteEmotion = (id: string, name: string) => {
    setEmotionsList(prev => prev.filter(e => e.id !== id));
    setDisciplineReviewDraft(prev => ({ ...prev, emotions: prev.emotions.filter(e => e !== name) }));
  };

  const handleChangeEmotionColor = (id: string, color: TagColor) => {
    setEmotionsList(prev => prev.map(e => (e.id === id ? { ...e, color } : e)));
  };

  // Looks up a tag's saved color by name so every emotion/mistake badge
  // anywhere in the app (Discipline & Psychology Review modal, Rule
  // Adherence Log, Analytics Breakdown, Mini Discipline Calendar, Trade
  // Detail modal) pulls from the exact same color source — emotionsList /
  // mistakesList — instead of a hardcoded uniform badge color.
  const colorForEmotion = (name: string): TagColor =>
    (emotionsList.find(e => e.name === name)?.color as TagColor) || 'purple';
  const colorForMistake = (name: string): TagColor =>
    (mistakesList.find(m => m.name === name)?.color as TagColor) || 'red';

  // File handlers
  const handleFileUpload = async (file: File, key: string, isEditing: boolean = false) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      const compressed = await compressImage(base64);
      const newImage: TradeImage = { id: generateId(), url: compressed, type: 'base64' };

      const timeframeName = key;
      if (isEditing && editingTrade) {
        setEditingTrade(prev => {
          if (!prev) return prev;
          const timeframes = prev.timeframes.map(tf => {
            if (tf.name === timeframeName) return { ...tf, images: [...tf.images, newImage] };
            return tf;
          });
          return { ...prev, timeframes };
        });
      } else {
        setNewTrade(prev => {
          const timeframes = (prev.timeframes || initializeEmptyTimeframes()).map(tf => {
            if (tf.name === timeframeName) return { ...tf, images: [...tf.images, newImage] };
            return tf;
          });
          return { ...prev, timeframes };
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddImageUrl = (url: string, key: string, isEditing: boolean = false) => {
    if (!url.trim()) return;
    const newImage: TradeImage = { id: generateId(), url: url.trim(), type: 'url' };

    const timeframeName = key;
    if (isEditing && editingTrade) {
      setEditingTrade(prev => {
        if (!prev) return prev;
        const timeframes = prev.timeframes.map(tf => {
          if (tf.name === timeframeName) return { ...tf, images: [...tf.images, newImage] };
          return tf;
        });
        return { ...prev, timeframes };
      });
    } else {
      setNewTrade(prev => {
        const timeframes = (prev.timeframes || initializeEmptyTimeframes()).map(tf => {
          if (tf.name === timeframeName) return { ...tf, images: [...tf.images, newImage] };
          return tf;
        });
        return { ...prev, timeframes };
      });
    }
  };

  const handleRemoveImage = (key: string, imageId: string, isEditing: boolean = false) => {
    const timeframeName = key;
    if (isEditing && editingTrade) {
      setEditingTrade(prev => {
        if (!prev) return prev;
        const timeframes = prev.timeframes.map(tf => {
          if (tf.name === timeframeName) return { ...tf, images: tf.images.filter(img => img.id !== imageId) };
          return tf;
        });
        return { ...prev, timeframes };
      });
    } else {
      setNewTrade(prev => {
        const timeframes = (prev.timeframes || []).map(tf => {
          if (tf.name === timeframeName) return { ...tf, images: tf.images.filter(img => img.id !== imageId) };
          return tf;
        });
        return { ...prev, timeframes };
      });
    }
  };

  // Reorders the images array for a single timeframe category (e.g. moving a
  // later screenshot to index 0 so it becomes the new cover image). Mirrors
  // the same isEditing branch pattern as handleRemoveImage/handleAddImageUrl
  // above — only the `images` array for the matching timeframe is replaced,
  // nothing else about the trade is touched.
  const handleReorderImages = (key: string, fromIndex: number, toIndex: number, isEditing: boolean = false) => {
    if (fromIndex === toIndex || Number.isNaN(fromIndex) || Number.isNaN(toIndex)) return;
    const reorder = (images: TradeImage[]): TradeImage[] => {
      if (fromIndex < 0 || fromIndex >= images.length) return images;
      const updatedImages = [...images];
      const [removed] = updatedImages.splice(fromIndex, 1);
      const clampedTarget = Math.max(0, Math.min(toIndex, updatedImages.length));
      updatedImages.splice(clampedTarget, 0, removed);
      return updatedImages;
    };

    const timeframeName = key;
    if (isEditing && editingTrade) {
      setEditingTrade(prev => {
        if (!prev) return prev;
        const timeframes = prev.timeframes.map(tf => {
          if (tf.name === timeframeName) return { ...tf, images: reorder(tf.images) };
          return tf;
        });
        return { ...prev, timeframes };
      });
    } else {
      setNewTrade(prev => {
        const timeframes = (prev.timeframes || []).map(tf => {
          if (tf.name === timeframeName) return { ...tf, images: reorder(tf.images) };
          return tf;
        });
        return { ...prev, timeframes };
      });
    }
  };

  const updateTimeframeNotes = (timeframeName: string, notes: string, isEditing: boolean = false) => {
    if (isEditing && editingTrade) {
      setEditingTrade(prev => {
        if (!prev) return prev;
        const timeframes = prev.timeframes.map(tf => {
          if (tf.name === timeframeName) return { ...tf, notes };
          return tf;
        });
        return { ...prev, timeframes };
      });
    } else {
      setNewTrade(prev => {
        const timeframes = (prev.timeframes || initializeEmptyTimeframes()).map(tf => {
          if (tf.name === timeframeName) return { ...tf, notes };
          return tf;
        });
        return { ...prev, timeframes };
      });
    }
  };

  // Backup & Restore
  // Both directions go through the same DATA_SCHEMA_VERSION / migrateStoredData
  // machinery as the journal-data load effect above, so a backup exported by
  // an older (or newer) version of the app always imports cleanly.
  //
  // Two distinct export/import paths live below:
  //   1. Full System Backup & Restore (.json) — exportBackup / importBackup.
  //      100% of app state, including the Life Discipline Hub. This is the
  //      default/primary option, capable of a 1:1 restore.
  //   2. Trades Only Export (.csv or .json) — exportTradesOnly.
  //      Just the trade records, for spreadsheet analysis or external
  //      review. No discipline logs, habits, or full system configuration.

  // Shared shape for the Life Discipline Hub's Supabase payload, reused
  // by both the full backup export and import so the two stay in sync.
  const buildLifeDisciplineSnapshot = () => ({
    startDate: lifeDisciplineStartDate,
    checks: lifeDisciplineChecks,
    graceDays: lifeDisciplineGraceDays,
    missedReasons: lifeDisciplineMissedReasons,
    recheckNotes: lifeDisciplineRecheckNotes,
    config: challengeConfig,
    hasStarted: hasStartedChallenge,
  });

  // Full snapshot of the OTHER half of the `preferences` row — everything
  // that isn't the Life Discipline Hub itself but still only lives in
  // `preferences`, not `journal_data`. Without this, "Full System Backup"
  // silently left theme, privacy mode, pillar layout, the pre-session
  // checklist, custom Daily Creed quotes, and saved challenge presets out
  // of the export entirely — a restore could never bring those back
  // because they were never captured in the first place.
  const buildAppPreferencesSnapshot = () => ({
    theme,
    privacyMode,
    pillarsPerRow,
    preSessionChecklist,
    customCreedQuotes,
    dailyCreedState: { date: dailyCreedDateRef.current || new Date().toLocaleDateString('en-CA'), index: creedIndex },
    userChallengePresets,
  });

  // Shared "download this string as a file" helper — prefers the browser's
  // native Save As dialog (File System Access API) so the user picks the
  // filename and folder, and falls back to a classic auto-download link.
  const saveStringAsFile = async (contents: string, defaultFileName: string, mimeType: string, pickerDescription: string) => {
    const showSaveFilePicker = (window as any).showSaveFilePicker;
    if (typeof showSaveFilePicker === 'function') {
      try {
        const handle = await showSaveFilePicker({
          suggestedName: defaultFileName,
          types: [{ description: pickerDescription, accept: { [mimeType]: [`.${defaultFileName.split('.').pop()}`] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(contents);
        await writable.close();
        return;
      } catch (err: any) {
        // User closed/cancelled the Save As dialog — treat as "changed
        // their mind", not an error. Don't fall back to auto-download.
        if (err?.name === 'AbortError') return;
        // Any other failure (e.g. permission issue): fall through to the
        // classic download below rather than losing the export entirely.
      }
    }

    // Fallback for browsers without Save-As support (Firefox, Safari, etc.)
    // — this downloads straight to the default Downloads folder.
    const blob = new Blob([contents], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = defaultFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 1a. FULL SYSTEM BACKUP — exports 100% of app state: trades, accounts,
  // the rules playbook, and the complete Life Discipline Hub object (active
  // challenge config, daily check logs, and history) so a restore can
  // rehydrate everything 1:1.
  const exportBackup = async () => {
    const backupData: StoredData & {
      exportedAt: string;
      // Not part of StoredData/journal_data (see the type's own comment —
      // notebook entries live in their own `notebook_entries` table), but
      // still belongs in a FULL system backup, so it's added here rather
      // than to the shared StoredData shape.
      notebookEntries: NotebookEntry[];
      lifeDisciplineData: ReturnType<typeof buildLifeDisciplineSnapshot>;
      appPreferencesData: ReturnType<typeof buildAppPreferencesSnapshot>;
    } = {
      version: DATA_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      accounts,
      trades,
      rules,
      strategies,
      notices,
      wikiEntries,
      setupTypes,
      confluences,
      mistakesList,
      emotionsList,
      customSymbols,
      customPillars,
      notebookEntries,
      notebookFolders,
      notebookFolderColors,
      notebookDeletedFolders,
      lifeDisciplineData: buildLifeDisciplineSnapshot(),
      appPreferencesData: buildAppPreferencesSnapshot(),
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const defaultFileName = `vsx_full_backup_${new Date().toISOString().split('T')[0]}.json`;
    await saveStringAsFile(jsonString, defaultFileName, 'application/json', 'VSX Full System Backup');
  };

  // 1b. FULL SYSTEM RESTORE — overwrites and re-hydrates every context
  // (trading journal AND Life Discipline Hub) so the whole app immediately
  // matches the imported backup, no reload required.
  const importBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const raw = JSON.parse(event.target?.result as string);
        if (!raw || typeof raw !== 'object' || (!Array.isArray(raw.accounts) && !Array.isArray(raw.trades))) {
          alert('Invalid backup file: this does not look like a full system backup.');
          return;
        }
        const migrated = migrateStoredData(raw);
        setAccounts(migrated.accounts);
        setTrades(migrated.trades);
        setRules(migrated.rules);
        setStrategies(migrated.strategies);
        setNotices(migrated.notices);
        setWikiEntries(migrated.wikiEntries);
        setSetupTypes(migrated.setupTypes);
        setConfluences(migrated.confluences);
        setMistakesList(migrated.mistakesList);
        setEmotionsList(migrated.emotionsList);
        setCustomSymbols(migrated.customSymbols);
        setCustomPillars(migrated.customPillars);

        // Notebook folders (+ their colors, + soft-deleted folders) — small
        // config-like slices, restored independently off the RAW backup
        // (not `migrated`, which defaults every one of these to []/{} when
        // absent) like lifeDisciplineData/appPreferencesData below, since
        // older backups predate these fields entirely and should just no-op
        // here rather than wiping out whatever the account currently has.
        const restoredNotebookFolders: string[] | null = Array.isArray(raw.notebookFolders) ? raw.notebookFolders : null;
        if (restoredNotebookFolders) setNotebookFolders(restoredNotebookFolders);
        const restoredNotebookFolderColors: Record<string, string> | null =
          raw.notebookFolderColors && typeof raw.notebookFolderColors === 'object' && !Array.isArray(raw.notebookFolderColors)
            ? raw.notebookFolderColors
            : null;
        if (restoredNotebookFolderColors) setNotebookFolderColors(restoredNotebookFolderColors);
        const restoredNotebookDeletedFolders: NotebookDeletedFolder[] | null = Array.isArray(raw.notebookDeletedFolders)
          ? raw.notebookDeletedFolders.map(normalizeNotebookDeletedFolder)
          : null;
        if (restoredNotebookDeletedFolders) setNotebookDeletedFolders(restoredNotebookDeletedFolders);

        // Everything now lives in Supabase (accounts/trades, journal data,
        // and preferences), so a full restore replaces this user's
        // server-side rows too — otherwise the restored data would look
        // right until the next reload, when the (unchanged) Supabase rows
        // would load back in over it. No localStorage involved anywhere.
        if (userId) {
          try {
            await supabase.from('trades').delete().eq('user_id', userId);
            await supabase.from('accounts').delete().eq('user_id', userId);
            if (migrated.accounts.length > 0) {
              const { error } = await supabase.from('accounts').insert(
                migrated.accounts.map((a: Account) => ({ id: a.id, user_id: userId, data: a }))
              );
              if (error) throw error;
            }
            if (migrated.trades.length > 0) {
              const { error } = await supabase.from('trades').insert(
                migrated.trades.map((t: Trade) => ({ id: t.id, user_id: userId, account_id: t.accountId, data: t }))
              );
              if (error) throw error;
            }

            const { error: journalErr } = await supabase.from('journal_data').upsert({
              user_id: userId,
              data: {
                rules: migrated.rules,
                strategies: migrated.strategies,
                customPillars: migrated.customPillars,
                notices: migrated.notices,
                wikiEntries: migrated.wikiEntries,
                setupTypes: migrated.setupTypes,
                confluences: migrated.confluences,
                mistakesList: migrated.mistakesList,
                emotionsList: migrated.emotionsList,
                customSymbols: migrated.customSymbols,
                ...(restoredNotebookFolders ? { notebookFolders: restoredNotebookFolders } : {}),
                ...(restoredNotebookFolderColors ? { notebookFolderColors: restoredNotebookFolderColors } : {}),
                ...(restoredNotebookDeletedFolders ? { notebookDeletedFolders: restoredNotebookDeletedFolders } : {}),
              },
            }, { onConflict: 'user_id' });
            if (journalErr) throw journalErr;

            // Notebook entries — own row per entry, same delete-then-reinsert
            // pattern as trades/accounts above, since these live in their
            // own `notebook_entries` table rather than the journal_data blob.
            if (Array.isArray(raw.notebookEntries)) {
              await supabase.from('notebook_entries').delete().eq('user_id', userId);
              const restoredNotebookEntries: NotebookEntry[] = raw.notebookEntries.map((e: any) => normalizeNotebookEntry(e));
              if (restoredNotebookEntries.length > 0) {
                const { error: notebookInsertErr } = await supabase.from('notebook_entries').insert(
                  restoredNotebookEntries.map((e: NotebookEntry) => ({ id: e.id, user_id: userId, data: e }))
                );
                if (notebookInsertErr) throw notebookInsertErr;
              }
              setNotebookEntries(restoredNotebookEntries);
            }
          } catch (err) {
            console.error('Failed to sync restored backup to Supabase:', err);
            alert('Backup restored locally, but some data failed to sync to your account — check your connection and try again.');
          }
        }

        // Re-hydrate the Life Discipline Hub (active challenge config, daily
        // check logs, grace days, missed-day reasons, and history) if the
        // backup carries it — older backups won't have this key, so each
        // field is restored independently and anything missing just keeps
        // its current value rather than getting wiped.
        const lifeDiscipline = raw.lifeDisciplineData;
        let restoredLifeDiscipline: any = null;
        if (lifeDiscipline && typeof lifeDiscipline === 'object') {
          if (lifeDiscipline.startDate) setLifeDisciplineStartDate(lifeDiscipline.startDate);
          if (lifeDiscipline.checks) setLifeDisciplineChecks(lifeDiscipline.checks);
          if (lifeDiscipline.graceDays) setLifeDisciplineGraceDays(lifeDiscipline.graceDays);
          if (lifeDiscipline.missedReasons) setLifeDisciplineMissedReasons(lifeDiscipline.missedReasons);
          if (lifeDiscipline.recheckNotes) setLifeDisciplineRecheckNotes(lifeDiscipline.recheckNotes);
          if (lifeDiscipline.config?.categories) setChallengeConfig(lifeDiscipline.config);
          if (typeof lifeDiscipline.hasStarted === 'boolean') setHasStartedChallenge(lifeDiscipline.hasStarted);
          restoredLifeDiscipline = lifeDiscipline;
        }

        // Re-hydrate the rest of `preferences` (theme, privacy mode, pillar
        // layout, pre-session checklist, custom Daily Creed quotes, and
        // saved challenge presets) — the other half of the `preferences`
        // row that older backups (before this fix) never captured, so it's
        // restored independently and just no-ops on older backup files.
        const appPrefs = raw.appPreferencesData;
        let restoredAppPrefs: any = null;
        if (appPrefs && typeof appPrefs === 'object') {
          if (appPrefs.theme === 'light' || appPrefs.theme === 'dark' || appPrefs.theme === 'minecraft') setTheme(appPrefs.theme);
          if (typeof appPrefs.privacyMode === 'boolean') setPrivacyMode(appPrefs.privacyMode);
          if (typeof appPrefs.pillarsPerRow === 'number') setPillarsPerRow(appPrefs.pillarsPerRow as PillarsPerRow);
          if (appPrefs.preSessionChecklist && typeof appPrefs.preSessionChecklist === 'object') setPreSessionChecklist(appPrefs.preSessionChecklist);
          if (Array.isArray(appPrefs.customCreedQuotes)) setCustomCreedQuotes(appPrefs.customCreedQuotes);
          if (appPrefs.dailyCreedState?.date && typeof appPrefs.dailyCreedState?.index === 'number') {
            dailyCreedDateRef.current = appPrefs.dailyCreedState.date;
            setCreedIndex(appPrefs.dailyCreedState.index);
          }
          if (Array.isArray(appPrefs.userChallengePresets)) setUserChallengePresets(appPrefs.userChallengePresets);
          restoredAppPrefs = appPrefs;
        }

        if (userId && (restoredLifeDiscipline || restoredAppPrefs)) {
          try {
            const { data: existingPrefsRow } = await supabase.from('preferences').select('data').eq('user_id', userId).maybeSingle();
            const existingPrefs = (existingPrefsRow?.data as any) || {};
            const { error: prefsErr } = await supabase.from('preferences').upsert({
              user_id: userId,
              data: {
                ...existingPrefs,
                ...(restoredAppPrefs || {}),
                ...(restoredLifeDiscipline ? { lifeDiscipline: restoredLifeDiscipline } : {}),
              },
            }, { onConflict: 'user_id' });
            if (prefsErr) throw prefsErr;
          } catch (err) {
            console.error('Failed to sync restored Discipline Tracker / settings data to Supabase:', err);
            alert('Backup restored locally, but the Discipline Tracker and settings failed to sync to your account — check your connection and try again.');
          }
        }

        alert('Full system backup restored successfully!');
      } catch {
        alert('Failed to parse backup file. Please ensure it is a valid JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 2. TRADES ONLY EXPORT — two genuinely different formats behind one
  // button, because "trades only" means something different depending on
  // what the file is FOR:
  //
  //   .csv  — a flattened, human-readable spreadsheet view (Date, Account,
  //           Pair, Entry, Exit, R:R, PnL, Status) for Excel/Sheets
  //           analysis or sharing. Screenshots/notes/setups/timeframes
  //           can't live in a spreadsheet cell usefully, so this format
  //           never carries them — by nature, not by omission. Re-importing
  //           this can only ever reconstruct a basic trade.
  //
  //   .json — a TRUE 1:1 backup, scoped to just trades + the accounts they
  //           belong to. Every field survives untouched: screenshots,
  //           notes, setups, mistakes, session, timeframe charts, all of
  //           it — same normalizeTrade/normalizeAccount shape Full System
  //           Backup uses, just without rules/notices/wiki/discipline hub.
  //           Re-importing this restores trades exactly as they were.
  const exportTradesOnly = async (format: 'csv' | 'json') => {
    const defaultDate = new Date().toISOString().split('T')[0];

    if (format === 'json') {
      // Full-fidelity — only the accounts actually referenced by these
      // trades, so the file stays self-contained without dragging in
      // every account on the user's books.
      const referencedAccountIds = new Set(trades.map(t => t.accountId));
      const referencedAccounts = accounts.filter(a => referencedAccountIds.has(a.id));
      const payload = {
        version: DATA_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        scope: 'trades-only' as const,
        accounts: referencedAccounts,
        trades,
      };
      const jsonString = JSON.stringify(payload, null, 2);
      await saveStringAsFile(jsonString, `vsx_trades_${defaultDate}.json`, 'application/json', 'VSX Trades Export (Full)');
      return;
    }

    // CSV — deliberately the lightweight spreadsheet view. Quote every
    // field and escape embedded quotes/commas/newlines so symbols, etc.
    // always round-trip cleanly as text, even though the deep fields
    // can't come along.
    const accountNameById = new Map(accounts.map(a => [a.id, a.name]));
    const rows = trades.map(t => {
      const riskReward = t.riskAmount ? t.profitLoss / t.riskAmount : null;
      const status = t.profitLoss > 0 ? 'Win' : t.profitLoss < 0 ? 'Loss' : 'Breakeven';
      return {
        Date: t.date || '',
        Account: accountNameById.get(t.accountId) || 'Unknown',
        Pair: t.symbol || '',
        Entry: t.entryPrice ?? '',
        Exit: t.exitPrice ?? '',
        'R:R': riskReward !== null ? Number(riskReward.toFixed(2)) : '',
        PnL: t.profitLoss ?? 0,
        Status: status,
      };
    });
    const headers = ['Date', 'Account', 'Pair', 'Entry', 'Exit', 'R:R', 'PnL', 'Status'];
    const escapeCsvCell = (value: unknown) => `"${String(value).replace(/"/g, '""')}"`;
    const csvLines = [
      headers.join(','),
      ...rows.map(row => headers.map(h => escapeCsvCell((row as Record<string, unknown>)[h])).join(',')),
    ];
    const csvString = csvLines.join('\r\n');
    await saveStringAsFile(csvString, `vsx_trades_${defaultDate}.csv`, 'text/csv', 'VSX Trades Export (Spreadsheet)');
  };

  // 2b. TRADES ONLY IMPORT — the counterpart to exportTradesOnly above.
  // Branches on what the file actually contains:
  //   - Full-fidelity JSON (scope: 'trades-only') → true 1:1 restore of
  //     just trades + their accounts, upserted by id (safe to re-import).
  //   - Lightweight CSV, or an older flat-row JSON → basic reconstruction
  //     only, since that format never captured the deep fields.
  //
  // Account matching for the lightweight path: that export only ever
  // stored the account's NAME, not its id, so a matching account is
  // looked up by name (case-insensitive). If nothing matches, a new
  // placeholder account is created with that name so the trade has
  // somewhere valid to attach to, rather than being silently dropped.
  const parseTradesOnlyCsv = (csvText: string): Record<string, string>[] => {
    // Minimal CSV parser matching exportTradesOnly's own quoting rules
    // (every field wrapped in "…", embedded quotes doubled) — handles
    // quoted commas/newlines within a field, which a naive split(',')
    // would break on.
    const rows: string[][] = [];
    let row: string[] = [];
    let field = '';
    let inQuotes = false;
    for (let i = 0; i < csvText.length; i++) {
      const ch = csvText[i];
      if (inQuotes) {
        if (ch === '"') {
          if (csvText[i + 1] === '"') { field += '"'; i++; }
          else { inQuotes = false; }
        } else {
          field += ch;
        }
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(field); field = '';
      } else if (ch === '\r') {
        // skip — paired \n below handles the line break
      } else if (ch === '\n') {
        row.push(field); field = '';
        rows.push(row); row = [];
      } else {
        field += ch;
      }
    }
    if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }

    if (rows.length < 1) return [];
    const headers = rows[0];
    return rows.slice(1)
      .filter(r => r.some(cell => cell.trim() !== ''))
      .map(r => Object.fromEntries(headers.map((h, idx) => [h, r[idx] ?? ''])));
  };

  const importTradesOnly = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const isJson = file.name.toLowerCase().endsWith('.json');
        const parsed: any = isJson ? JSON.parse(text) : null;

        // ---- PATH A: full-fidelity JSON (scope: 'trades-only') ----
        // Real Trade/Account objects, same shape Full System Backup uses.
        // Restored with UPSERT semantics (by id) rather than always
        // appending — re-importing the same file is safe and just
        // overwrites the same trades with themselves instead of
        // duplicating them, matching what "1:1 restore" should mean.
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && Array.isArray(parsed.trades)) {
          const restoredAccounts = Array.isArray(parsed.accounts) ? parsed.accounts.map(normalizeAccount) : [];
          const restoredTrades = normalizeTrades(parsed.trades);

          const accountIds = new Set(accounts.map(a => a.id));
          const newAccounts = restoredAccounts.filter((a: Account) => !accountIds.has(a.id));
          const updatedAccountIds = new Set(restoredAccounts.map((a: Account) => a.id));

          const tradeIds = new Set(trades.map(t => t.id));
          const newTrades = restoredTrades.filter(t => !tradeIds.has(t.id));
          const updatedTrades = restoredTrades.filter(t => tradeIds.has(t.id));
          const updatedTradeIds = new Set(updatedTrades.map(t => t.id));

          setAccounts(prev => [
            ...prev.map(a => updatedAccountIds.has(a.id) ? restoredAccounts.find((r: Account) => r.id === a.id)! : a),
            ...newAccounts,
          ]);
          setTrades(prev => [
            ...prev.map(t => updatedTradeIds.has(t.id) ? restoredTrades.find(r => r.id === t.id)! : t),
            ...newTrades,
          ]);

          if (userId) {
            try {
              if (newAccounts.length > 0) {
                const { error } = await supabase.from('accounts').insert(
                  newAccounts.map((a: Account) => ({ id: a.id, user_id: userId, data: a }))
                );
                if (error) throw error;
              }
              for (const a of restoredAccounts.filter((acc: Account) => updatedAccountIds.has(acc.id) && accountIds.has(acc.id))) {
                const { error } = await supabase.from('accounts').update({ data: a }).eq('id', a.id).eq('user_id', userId);
                if (error) throw error;
              }
              if (newTrades.length > 0) {
                const { error } = await supabase.from('trades').insert(
                  newTrades.map(t => ({ id: t.id, user_id: userId, account_id: t.accountId, data: t }))
                );
                if (error) throw error;
              }
              for (const t of updatedTrades) {
                const { error } = await supabase.from('trades').update({ data: t, account_id: t.accountId }).eq('id', t.id).eq('user_id', userId);
                if (error) throw error;
              }
            } catch (err) {
              console.error('Failed to sync imported trades to Supabase:', err);
              alert('Trades restored locally, but failed to sync to your account — check your connection and try again.');
              return;
            }
          }

          alert(`Restored ${restoredTrades.length} trade${restoredTrades.length === 1 ? '' : 's'} (${newTrades.length} new, ${updatedTrades.length} updated) with full detail — screenshots, notes, setups, and everything else included.`);
          return;
        }

        // ---- PATH B: lightweight CSV, or an older flat-array JSON export
        // from before the full-fidelity format existed ----
        // Reconstructs BASIC trades only — the exported file never
        // captured screenshots, notes, setups, session, or timeframe
        // charts, so none of it can come back through this path.
        const parsedRows: any[] = isJson ? parsed : parseTradesOnlyCsv(text);

        if (!Array.isArray(parsedRows) || parsedRows.length === 0) {
          alert('No trade rows found in this file. Make sure it\'s a file exported from "Trades Only Export".');
          return;
        }

        // Resolve/create accounts by name first, so every row below has a
        // real accountId to attach to.
        const nameToAccount = new Map(accounts.map(a => [a.name.trim().toLowerCase(), a]));
        const newAccounts: Account[] = [];
        const resolveAccountId = (rawName: string): string => {
          const name = (rawName || 'Unknown').trim() || 'Unknown';
          const key = name.toLowerCase();
          const existing = nameToAccount.get(key);
          if (existing) return existing.id;
          const alreadyQueued = newAccounts.find(a => a.name.toLowerCase() === key);
          if (alreadyQueued) return alreadyQueued.id;
          const created = normalizeAccount({ name });
          newAccounts.push(created);
          nameToAccount.set(key, created);
          return created.id;
        };

        const rawTrades = parsedRows.map(row => {
          const entry = parseFloat(row['Entry']);
          const exit = parseFloat(row['Exit']);
          const pnl = parseFloat(row['PnL']);
          const rr = parseFloat(row['R:R']);
          const riskAmount = !isNaN(rr) && rr !== 0 && !isNaN(pnl) ? Math.abs(pnl / rr) : 0;
          const date = typeof row['Date'] === 'string' && row['Date'] ? row['Date'] : new Date().toISOString().split('T')[0];
          return {
            accountId: resolveAccountId(row['Account']),
            symbol: row['Pair'] || '',
            entryPrice: isNaN(entry) ? 0 : entry,
            exitPrice: isNaN(exit) ? undefined : exit,
            profitLoss: isNaN(pnl) ? 0 : pnl,
            riskAmount,
            date,
            timestamp: new Date(date).toISOString(),
          };
        });

        const normalizedNewTrades = normalizeTrades(rawTrades).map(t => ({
          ...t,
          // normalizeTrades numbers a batch starting at 1 — offset by
          // however many trades already exist so imported trades don't
          // collide with/duplicate existing #1, #2, #3...
          absoluteTradeNumber: t.absoluteTradeNumber + trades.length,
        }));

        if (newAccounts.length > 0) setAccounts(prev => [...prev, ...newAccounts]);
        setTrades(prev => [...prev, ...normalizedNewTrades]);

        if (userId) {
          try {
            if (newAccounts.length > 0) {
              const { error: accErr } = await supabase.from('accounts').insert(
                newAccounts.map(a => ({ id: a.id, user_id: userId, data: a }))
              );
              if (accErr) throw accErr;
            }
            const { error: tradeErr } = await supabase.from('trades').insert(
              normalizedNewTrades.map(t => ({ id: t.id, user_id: userId, account_id: t.accountId, data: t }))
            );
            if (tradeErr) throw tradeErr;
          } catch (err) {
            console.error('Failed to sync imported trades to Supabase:', err);
            alert('Trades imported locally, but failed to sync to your account — check your connection and try again.');
          }
        }

        const acctNote = newAccounts.length > 0 ? ` (created ${newAccounts.length} new account${newAccounts.length > 1 ? 's' : ''}: ${newAccounts.map(a => a.name).join(', ')})` : '';
        alert(`Imported ${normalizedNewTrades.length} basic trade${normalizedNewTrades.length === 1 ? '' : 's'}${acctNote}. Note: this file didn't have screenshots, notes, setups, or session data to begin with — export as .json going forward for a full 1:1 restore.`);
      } catch (err) {
        console.error('Failed to parse trades-only file:', err);
        alert('Failed to parse this file. Make sure it\'s a .csv or .json file exported from "Trades Only Export".');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 3. FULL SYSTEM RESET — wipes every feature (Trades, Accounts, Rules
  // Playbook, Strategies, Notices, Wiki, Tags, Life Discipline Hub, Daily
  // Creed, saved presets, and App Preferences — literally everything) back
  // to its factory-default state, both in React state AND in Supabase
  // (accounts, trades, journal_data, preferences rows for this user). No
  // localStorage is involved anywhere, so there's nothing else to clear.
  //
  // Why this resets so much React state, not just the Supabase rows: all of
  // it is persisted through DEBOUNCED writers (see useDebouncedSupabaseWriter
  // above) that flush on tab close. If this function only deleted the
  // Supabase rows and left any of their source state (rules, customPillars,
  // challengeConfig, theme, etc.) un-reset, that stale state would get
  // upserted straight back into Supabase the instant the pending debounce
  // fires — silently undoing the "clear". Resetting every piece of state
  // that feeds those two payloads guarantees any in-flight write only ever
  // writes back empty/default data.
  const handleFullSystemReset = async () => {
    // ---- Step 1: Delete from Supabase, sequentially, scoped strictly to
    // `user_id: userId` on every table. Order matters: `trades` carries a
    // foreign key on `account_id` referencing `accounts`, so trades must be
    // deleted BEFORE accounts or Postgres will reject the accounts delete
    // with a foreign-key-violation error. journal_data/preferences have no
    // such dependency but are kept in the same sequential chain for
    // consistency and simpler error attribution.
    //
    // This function throws on the first failure (rather than swallowing
    // the error) so callers (e.g. SettingsModal's reset-confirmation flow)
    // can `await` it, know for certain whether the server-side wipe
    // actually succeeded, and decide whether it's safe to reload — a
    // silent failure here combined with an unconditional reload is exactly
    // what let old data reappear after "resetting".
    if (userId) {
      const { error: tradesError } = await supabase.from('trades').delete().eq('user_id', userId);
      if (tradesError) {
        console.error('Failed to delete trades from Supabase during reset:', tradesError);
        throw new Error('Failed to delete trades from the server.');
      }

      const { error: accountsError } = await supabase.from('accounts').delete().eq('user_id', userId);
      if (accountsError) {
        console.error('Failed to delete accounts from Supabase during reset:', accountsError);
        throw new Error('Failed to delete accounts from the server.');
      }

      const { error: notebookError } = await supabase.from('notebook_entries').delete().eq('user_id', userId);
      if (notebookError) {
        console.error('Failed to delete notebook entries from Supabase during reset:', notebookError);
        throw new Error('Failed to delete notebook entries from the server.');
      }

      const { error: journalError } = await supabase.from('journal_data').delete().eq('user_id', userId);
      if (journalError) {
        console.error('Failed to delete journal data from Supabase during reset:', journalError);
        throw new Error('Failed to delete journal data from the server.');
      }

      const { error: prefsError } = await supabase.from('preferences').delete().eq('user_id', userId);
      if (prefsError) {
        console.error('Failed to delete preferences from Supabase during reset:', prefsError);
        throw new Error('Failed to delete preferences from the server.');
      }
    }

    // ---- Step 2: Clear localStorage ----
    // Nothing in the app is meant to persist here anymore (see the
    // `useDebouncedSupabaseWriter` comment near the top of this file), but
    // wipe it explicitly so no stale 'tradingJournal' (or any other) key
    // can ever get read back in by the legacy-migration snapshot logic on
    // a future sign-in.
    try {
      localStorage.clear();
    } catch (e) {
      console.error('Failed to clear localStorage during reset:', e);
    }

    // ---- Step 3: Reset all React state back to clean defaults ----
    // Also done even though the caller typically reloads the page right
    // after this resolves — the reload is what actually guarantees a
    // fully clean slate, but resetting state here too means the UI is
    // never left showing stale data during the brief window before that
    // reload fires (or if the caller chooses not to reload at all).

    // Accounts & Trades
    setAccounts([]);
    setTrades([]);
    setSelectedAccounts(['all']);

    // Notebook
    setNotebookEntries([]);
    setNotebookFolders([]);

    // Journal Data: Rules/Playbook, Notices, Wiki, Tags
    setRules([]);
    setCustomPillars([]); // Rules Playbook custom pillars
    setStrategies([]);
    setNotices([]);
    setWikiEntries([]);
    setSetupTypes([]);
    setConfluences([]);
    setMistakesList([]);
    setEmotionsList(EMOTION_OPTIONS.map(name => ({ id: generateId(), name, color: 'purple' as TagColor })));
    setCustomSymbols([]);

    // App Preferences/Settings
    setTheme('dark');
    setPrivacyMode(false);
    setPillarsPerRow(3);
    setPreSessionChecklist({ 'htf-levels': false, 'news-check': false, 'mindset-check': false, 'max-loss-set': false });

    // Life Discipline Hub
    setLifeDisciplineStartDate(getLocalDateKey());
    setLifeDisciplineChecks({});
    setLifeDisciplineGraceDays({});
    setLifeDisciplineRecheckNotes({});
    setLifeDisciplineMissedReasons({});
    setChallengeConfig(DEFAULT_CHALLENGE_CONFIG);
    setHasStartedChallenge(false);

    // User-saved challenge presets
    setUserChallengePresets([]);
    setLoadedPresetId(null);

    // Daily Trading Creed
    setCustomCreedQuotes([]);
    setCreedIndex(0);
    dailyCreedDateRef.current = '';
  };

  return {
    view,
    setView,
    privacyMode,
    setPrivacyMode,
    theme,
    setTheme,
    mainScrollRef,
    isExportConfirmOpen,
    setIsExportConfirmOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    settingsModalTab,
    setSettingsModalTab,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    galleryView,
    setGalleryView,
    tradeSubView,
    setTradeSubView,
    dbSearch,
    setDbSearch,
    dbAccountFilter,
    setDbAccountFilter,
    dbSessionFilter,
    setDbSessionFilter,
    dbOutcomeFilter,
    setDbOutcomeFilter,
    dbRulesFilter,
    setDbRulesFilter,
    dbPage,
    setDbPage,
    dbViewMode,
    setDbViewMode,
    DB_PAGE_SIZE,
    tradeFilter,
    setTradeFilter,
    tradeSortField,
    setTradeSortField,
    tradeSortOrder,
    setTradeSortOrder,
    viewportWidth,
    equityChartContainerRef,
    equityChartWidth,
    setEquityChartWidth,
    selectedAccounts,
    setSelectedAccounts,
    showAccountDropdown,
    setShowAccountDropdown,
    calculatorState,
    setCalculatorState,
    activeInputRef,
    resetCalculator,
    handleNumberInputFocus,
    handleCalculatorChange,
    updateFieldFromCalculator,
    handleCalculatorEnter,
    closeCalculator,
    accounts,
    setAccounts,
    trades,
    setTrades,
    accountsTradesLoading,
    journalDataLoading,
    preferencesLoading,
    // ---- Notebook ----
    notebookEntries,
    notebookEntriesLoading,
    notebookFolders: notebookFoldersWithDefaults,
    notebookFolderColors,
    notebookDeletedFolders,
    handleAddNotebookEntry,
    handleUpdateNotebookEntry,
    handleToggleNotebookEntryPin,
    handleToggleNotebookEntryFavorite,
    handleDuplicateNotebookEntry,
    handleBulkMoveNotebookEntries,
    handleBulkSoftDeleteNotebookEntries,
    handleEmptyNotebookTrash,
    handleSoftDeleteNotebookEntry,
    handleRestoreNotebookEntry,
    handlePermanentDeleteNotebookEntry,
    handleAddNotebookFolder,
    handleDeleteNotebookFolder,
    handleSetNotebookFolderColor,
    handleReorderNotebookFolder,
    handleRestoreNotebookFolder,
    handlePermanentDeleteNotebookFolder,
    rules,
    setRules,
    strategies,
    setStrategies,
    notices,
    setNotices,
    wikiEntries,
    setWikiEntries,
    setupTypes,
    setSetupTypes,
    confluences,
    setConfluences,
    mistakesList,
    setMistakesList,
    emotionsList,
    setEmotionsList,
    customSymbols,
    setCustomSymbols,
    customPillars,
    setCustomPillars,
    tradeImportInputRef,
    isImportingTrades,
    setIsImportingTrades,
    tradeImportToast,
    setTradeImportToast,
    tradeImportToastTimeoutRef,
    showTradeImportToast,
    pillarsPerRow,
    setPillarsPerRow,
    DEFAULT_CREED_QUOTES,
    customCreedQuotes,
    setCustomCreedQuotes,
    customCreedQuotesLoaded,
    setCustomCreedQuotesLoaded,
    allCreedQuotes,
    creedIndex,
    setCreedIndex,
    isEditingCreed,
    setIsEditingCreed,
    creedDraftText,
    setCreedDraftText,
    creedDraftTag,
    setCreedDraftTag,
    currentCreedQuote,
    isCurrentCreedCustom,
    shuffleDailyCreed,
    openCreedEditor,
    saveCreedEdit,
    deleteCurrentCreedQuote,
    CREED_EMPHASIS_WORDS,
    renderCreedQuoteText,
    PRE_SESSION_CHECKLIST_ITEMS,
    preSessionChecklist,
    setPreSessionChecklist,
    togglePreSessionItem,
    resetPreSessionChecklist,
    preSessionCompletedCount,
    showAddAccount,
    setShowAddAccount,
    showEditAccount,
    setShowEditAccount,
    showAddTrade,
    setShowAddTrade,
    showEditTrade,
    setShowEditTrade,
    showTradeDetail,
    setShowTradeDetail,
    detailNotesDraft,
    setDetailNotesDraft,
    detailRulesFollowedDraft,
    setDetailRulesFollowedDraft,
    showDisciplineReview,
    setShowDisciplineReview,
    disciplineReviewDraft,
    setDisciplineReviewDraft,
    showRuleReviewModal,
    setShowRuleReviewModal,
    isEditingRuleReview,
    setIsEditingRuleReview,
    showAddRule,
    setShowAddRule,
    showManageRulesModal,
    setShowManageRulesModal,
    showAddStrategy,
    setShowAddStrategy,
    viewStrategyId,
    setViewStrategyId,
    newStrategy,
    setNewStrategy,
    editingStrategyId,
    setEditingStrategyId,
    strategyPendingDelete,
    setStrategyPendingDelete,
    stepPendingDeleteId,
    setStepPendingDeleteId,
    draggingStepImageId,
    setDraggingStepImageId,
    dragOverStepImageId,
    setDragOverStepImageId,
    draggingCoverImageId,
    setDraggingCoverImageId,
    dragOverCoverImageId,
    setDragOverCoverImageId,
    draggingNoticeImageId,
    setDraggingNoticeImageId,
    dragOverNoticeImageId,
    setDragOverNoticeImageId,
    noticeStepPendingDeleteId,
    setNoticeStepPendingDeleteId,
    draggingNoticeStepImageId,
    setDraggingNoticeStepImageId,
    dragOverNoticeStepImageId,
    setDragOverNoticeStepImageId,
    noticeStepImageInputRefs,
    draggingStrategyId,
    setDraggingStrategyId,
    dragOverStrategyId,
    setDragOverStrategyId,
    strategyCoverIndex,
    setStrategyCoverIndex,
    strategyImageInputRef,
    strategyCarouselRef,
    canScrollLeftStrategy,
    setCanScrollLeftStrategy,
    canScrollRightStrategy,
    setCanScrollRightStrategy,
    updateStrategyScrollState,
    scrollStrategyCarousel,
    strategyStepImageInputRefs,
    showAddNotice,
    setShowAddNotice,
    editingNoticeId,
    setEditingNoticeId,
    showAddWiki,
    setShowAddWiki,
    editingTrade,
    setEditingTrade,
    lightboxImage,
    setLightboxImage,
    showExpandGallery,
    setShowExpandGallery,
    executionImageIndex,
    setExecutionImageIndex,
    timeframeImageIndices,
    setTimeframeImageIndices,
    showTradeTimeFields,
    setShowTradeTimeFields,
    showTradePriceLevels,
    setShowTradePriceLevels,
    rulesAdherenceError,
    setRulesAdherenceError,
    showAccountTypeDropdown,
    setShowAccountTypeDropdown,
    showTradingAccountTypeDropdown,
    setShowTradingAccountTypeDropdown,
    showSymbolDropdown,
    setShowSymbolDropdown,
    symbolCustomInput,
    setSymbolCustomInput,
    showSessionDropdown,
    setShowSessionDropdown,
    showTradeControlsPanel,
    setShowTradeControlsPanel,
    tradeSelectMode,
    setTradeSelectMode,
    selectedTradeIds,
    setSelectedTradeIds,
    showDeleteSelectedConfirm,
    setShowDeleteSelectedConfirm,
    accountPendingDelete,
    setAccountPendingDelete,
    tradePendingDelete,
    setTradePendingDelete,
    noticeImageInputRef,
    accountDropdownRef,
    tradingAccountTypeDropdownRef,
    accountTypeDropdownRef,
    symbolDropdownRef,
    sessionDropdownRef,
    tradeControlsPanelRef,
    calendarMonth,
    setCalendarMonth,
    streakGridWindow,
    setStreakGridWindow,
    disciplineCalendarMonth,
    setDisciplineCalendarMonth,
    openDisciplineDay,
    setOpenDisciplineDay,
    disciplineCalendarGridRef,
    emotionsTimeframe,
    setEmotionsTimeframe,
    mistakesTimeframe,
    setMistakesTimeframe,
    disciplineAnalyticsTimeframeOptions,
    newAccount,
    setNewAccount,
    editingAccount,
    setEditingAccount,
    initializeEmptyTimeframes,
    newTrade,
    setNewTrade,
    priceInputs,
    setPriceInputs,
    newRule,
    setNewRule,
    editingRuleId,
    setEditingRuleId,
    showRuleIconPicker,
    setShowRuleIconPicker,
    ruleIconPickerTab,
    setRuleIconPickerTab,
    emptyNoticeDraft,
    newNotice,
    setNewNotice,
    newWiki,
    setNewWiki,
    editingWikiId,
    setEditingWikiId,
    viewWikiId,
    setViewWikiId,
    wikiImageInputRef,
    wikiImageDropzoneRef,
    wikiImageFocusRequested,
    isWikiImageDragActive,
    draggingWikiImageId,
    setDraggingWikiImageId,
    dragOverWikiImageId,
    setDragOverWikiImageId,
    wikiCoverIndex,
    setWikiCoverIndex,
    isWikiAutoFilling,
    selectedTimeframeTab,
    setSelectedTimeframeTab,
    calculatedRR,
    lifeDisciplineStartDate,
    setLifeDisciplineStartDate,
    lifeDisciplineChecks,
    setLifeDisciplineChecks,
    lifeDisciplineGraceDays,
    setLifeDisciplineGraceDays,
    lifeDisciplineRecheckNotes,
    setLifeDisciplineRecheckNotes,
    lifeDisciplineMissedReasons,
    setLifeDisciplineMissedReasons,
    challengeConfig,
    setChallengeConfig,
    hasStartedChallenge,
    setHasStartedChallenge,
    hasActiveChallengeProgress,
    dayDetailsModal,
    setDayDetailsModal,
    isEditingDayReason,
    setIsEditingDayReason,
    dayReasonDraftText,
    setDayReasonDraftText,
    isRecheckTokenPromptOpen,
    setIsRecheckTokenPromptOpen,
    recheckTokenReasonDraft,
    setRecheckTokenReasonDraft,
    dayDetailsHonestyGuardrail,
    setDayDetailsHonestyGuardrail,
    isEditingDayChecklist,
    setIsEditingDayChecklist,
    isChallengeConfigOpen,
    setIsChallengeConfigOpen,
    challengeModalMode,
    setChallengeModalMode,
    isResetChallengeConfirmOpen,
    setIsResetChallengeConfirmOpen,
    challengeConfigDraft,
    setChallengeConfigDraft,
    isCustomDuration,
    setIsCustomDuration,
    newRoutineItemText,
    setNewRoutineItemText,
    editingRoutineItem,
    setEditingRoutineItem,
    editingRoutineItemText,
    setEditingRoutineItemText,
    iconPickerOpenFor,
    setIconPickerOpenFor,
    iconPickerTab,
    setIconPickerTab,
    iconPickerPos,
    setIconPickerPos,
    iconPickerPopoverRef,
    iconPickerTriggerRefs,
    ICON_PICKER_WIDTH,
    ICON_PICKER_EST_HEIGHT,
    GAP,
    computeIconPickerPos,
    toggleIconPicker,
    categoryPendingDelete,
    setCategoryPendingDelete,
    itemPendingDelete,
    setItemPendingDelete,
    userChallengePresets,
    setUserChallengePresets,
    isLoadPresetMenuOpen,
    setIsLoadPresetMenuOpen,
    isSavingPresetDraft,
    setIsSavingPresetDraft,
    savePresetNameDraft,
    setSavePresetNameDraft,
    isManagePresetsOpen,
    setIsManagePresetsOpen,
    presetPendingDelete,
    setPresetPendingDelete,
    loadPresetMenuRef,
    loadedPresetId,
    setLoadedPresetId,
    isPresetSaveChoiceOpen,
    setIsPresetSaveChoiceOpen,
    presetSaveChoiceRef,
    lifeDisciplineToast,
    setLifeDisciplineToast,
    lifeDisciplineToastTimeoutRef,
    showLifeDisciplineToast,
    emptyLifeDisciplineChecks,
    toggleLifeDisciplineItem,
    completeAllLifeDisciplineToday,
    isLifeDisciplineDayComplete,
    lifeDisciplineTokensUsed,
    lifeDisciplineTokensRemaining,
    toggleLifeDisciplineGraceDay,
    openDayDetailsModal,
    startEditDayChecklist,
    saveDayChecklistEdits,
    toggleDayDetailsFailedItem,
    startEditDayReason,
    saveDayDetailsReason,
    openRecheckTokenPrompt,
    confirmUseRecheckToken,
    undoRecheckDay,
    handleLifeDisciplineTileClick,
    findMatchingUserPreset,
    handleSaveCurrentAsPresetClick,
    overwriteExistingUserPreset,
    chooseSaveAsNewPreset,
    openChallengeConfigModal,
    applyChallengePreset,
    saveDraftAsPreset,
    requestDeleteUserChallengePreset,
    confirmDeleteUserChallengePreset,
    addDraftRoutineItem,
    addDraftWeeklyItem,
    requestDeleteDraftRoutineItem,
    confirmDeleteDraftRoutineItem,
    startEditDraftRoutineItem,
    commitEditDraftRoutineItem,
    toggleWeeklyRoutinesEnabled,
    toggleDraftItemDay,
    addDraftCategory,
    renameDraftCategory,
    setDraftCategoryIcon,
    setDraftCategoryIconColor,
    requestDeleteDraftCategory,
    confirmDeleteDraftCategory,
    cleanChallengeConfigDraft,
    saveChallengeConfigUpdate,
    resetChallengeProgress,
    saveChallengeConfig,
    tradeNumberAccountRef,
    accountFilteredTrades,
    filteredTrades,
    dbFilteredTrades,
    dbPageCount,
    dbPagedTrades,
    getDisplayTradeNumber,
    stats,
    equityData,
    ruleViolationCounts,
    calendarDays,
    handleAddAccount,
    handleUpdateAccount,
    handleRecordPayoutReset,
    handleDeleteAccount,
    confirmDeleteAccount,
    handleImportTradesFile,
    handleAddTrade,
    openEditTrade,
    handleSaveEditedTrade,
    handleDeleteTrade,
    confirmDeleteTrade,
    handleSaveDetailNotes,
    handleSaveDisciplineReview,
    handleCancelRuleReviewEdit,
    closeRuleReviewModal,
    toggleTradeSelectMode,
    toggleTradeSelected,
    toggleSelectAllTrades,
    handleDeleteSelectedTrades,
    confirmDeleteSelectedTrades,
    getTodayLocalDate,
    tc,
    resetTradeForm,
    handleSaveRule,
    openAddRuleModal,
    openEditRuleModal,
    closeRuleModal,
    handleDeleteRule,
    handleAddDivider,
    handleUpdateDividerLabel,
    showAddPillarModal,
    setShowAddPillarModal,
    newPillar,
    setNewPillar,
    pillarPendingDelete,
    setPillarPendingDelete,
    openAddPillarModal,
    closeAddPillarModal,
    handleAddPillar,
    handleDeletePillar,
    moveStrategy,
    handleStrategyImagesPick,
    removeStrategyImage,
    moveStrategyImage,
    openAddStrategyModal,
    openEditStrategyModal,
    closeStrategyModal,
    addStrategyStep,
    updateStrategyStep,
    requestRemoveStrategyStep,
    removeStrategyStep,
    confirmRemoveStrategyStep,
    handleStrategyStepImagesPick,
    removeStrategyStepImage,
    moveStrategyStepImage,
    handleSaveStrategy,
    handleDeleteStrategy,
    confirmDeleteStrategy,
    handleNoticeImagesPick,
    // Back-compat alias — several screens still destructure the old
    // single-image handler name from context even though it's unused now
    // that the notice screenshot picker supports multiple images. Keeping
    // this avoids touching every one of those call sites just to compile.
    handleNoticeImagePick: handleNoticeImagesPick,
    removeNoticeImage,
    moveNoticeImage,
    addNoticeStep,
    updateNoticeStep,
    requestRemoveNoticeStep,
    removeNoticeStep,
    confirmRemoveNoticeStep,
    handleNoticeStepImagesPick,
    removeNoticeStepImage,
    moveNoticeStepImage,
    handleAddNotice,
    handleOpenAddNotice,
    handleEditNotice,
    handleDeleteNotice,
    WIKI_FORM_DEFAULT,
    getWikiImages,
    handleAddWiki,
    handleOpenAddWiki,
    handleOpenEditWiki,
    handleDeleteWiki,
    wikiPendingDelete,
    setWikiPendingDelete,
    confirmDeleteWiki,
    handleWikiImagesPick,
    // Back-compat alias — several screens/modals destructure the old
    // single-image handler name from context even though the wiki
    // screenshot picker now supports multiple images. Keeping this avoids
    // touching every one of those call sites just to compile.
    handleWikiImagePick: handleWikiImagesPick,
    removeWikiImage,
    moveWikiImage,
    handleWikiImageDragOver,
    handleWikiImageDragLeave,
    handleWikiImageDrop,
    handleWikiImagePaste,
    handleWikiAutoFill,
    addWikiKeyRule,
    updateWikiKeyRule,
    removeWikiKeyRule,
    requestRemoveWikiKeyRule,
    wikiRulePendingDeleteIndex,
    setWikiRulePendingDeleteIndex,
    confirmRemoveWikiKeyRule,
    STANDARD_TRADING_CONCEPTS,
    missingStandardConcepts,
    allStandardConceptsImported,
    handleImportStandardConcepts,
    handleDeleteSetupType,
    handleDeleteConfluence,
    handleDeleteMistakeType,
    handleChangeSetupTypeColor,
    handleChangeConfluenceColor,
    handleChangeMistakeColor,
    handleDeleteEmotion,
    handleChangeEmotionColor,
    colorForEmotion,
    colorForMistake,
    handleFileUpload,
    handleAddImageUrl,
    handleRemoveImage,
    handleReorderImages,
    updateTimeframeNotes,
    exportBackup,
    importBackup,
    exportTradesOnly,
    importTradesOnly,
    handleFullSystemReset,
    session,
    authLoading,
    signOutUser,
  };
}
