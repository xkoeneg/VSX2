import type React from 'react';

// ============================================================================
// Shared domain types for the VSX trading journal.
// Extracted verbatim from the original single-file App.tsx.
// ============================================================================

export const WIKI_CATEGORIES = ['PD Arrays', 'Market Structure', 'Terminology', 'Execution Models'] as const;

export type TradingAccountType = 'CFD' | 'LIVE' | 'FUTURES' | 'DEMO';

export interface Account {
  id: string;
  name: string;
  startingBalance: number;
  type: 'Eval' | 'Phase 1' | 'Phase 2' | 'Funded' | 'Custom Challenge';
  customTypeName?: string;
  propFirm: string;
  createdAt: string;
  hasProfitTarget?: boolean;
  profitTarget?: number;
  maxDrawdown?: number;
  tradingAccountType?: TradingAccountType;
  highestBalance?: number;
  maxDrawdownAllowance?: number;
  fixedMinBalance?: number;
}

export interface TradeImage {
  id: string;
  url: string;
  type: 'url' | 'base64';
}

export interface TimeframeChart {
  name: string;
  images: TradeImage[];
  notes: string;
}

export interface Trade {
  id: string;
  accountId: string;
  symbol: string;
  profitLoss: number;
  entryPrice: number;
  exitPrice?: number; // Close price — mainly populated by MT4/MT5 import, optional for manual entries
  stopLoss: number;
  takeProfit: number;
  slPoints: number;
  tpPoints: number;
  lotSize?: number; // Position size in lots — populated by MT4/MT5 import
  orderType?: 'buy' | 'sell'; // Trade direction — populated by MT4/MT5 import
  setupTypes: string[];
  confluences: string[];
  mistakes: string[];
  // Optional because a trade starts with no Followed/Broken judgment made
  // at all (e.g. right after MT4/MT5 import) — 'followed' | 'broken' alone
  // couldn't represent "not yet categorized" and forced every new trade to
  // be one or the other before any review had happened.
  rulesFollowed?: 'followed' | 'broken';
  // True only once the Discipline & Psychology Review has actually been
  // saved for this trade (see handleSaveDisciplineReview in useAppState).
  // This is the single source of truth for Pending Review vs. Rule
  // Adherence Log membership — kept independent of rulesFollowed since
  // that field can be set from a separate flow (Trade Detail modal).
  // Optional (not required) so any other Trade-construction code you have
  // elsewhere (e.g. a normalizeTrade/migration helper) doesn't need to be
  // touched just to keep compiling — missing/undefined is treated the same
  // as false everywhere this is checked.
  isReviewed?: boolean;
  timeframes: TimeframeChart[];
  executionImages: TradeImage[];
  riskAmount: number;
  mistakesAnalysis: string;
  lessonsLearned: string;
  emotions?: string[]; // Emotions experienced during the trade (Discipline & Psychology Review)
  notes?: string; // Free-form psychological / session observation notes
  timestamp: string;
  date: string;
  startTime?: string;
  endTime?: string;
  absoluteTradeNumber: number; // Assigned at creation, never changes
  trackingNumber?: string; // Manual Trade # (e.g. Notion log ref, day marker)
  session?: SessionOption; // Trading session the trade was taken in
  importTicketId?: string; // MT4/MT5 broker ticket ID — set on import, used to dedupe re-uploads of the same report
}

export type RuleSeverity = 'critical' | 'warning' | 'guide';

export type RulePillar = string;

export type RuleAccentColor = 'emerald' | 'amber' | 'crimson' | 'indigo' | 'cyan';

export type RuleIconKind = 'emoji' | 'icon';

export type RuleBulletStyle = 'bullet' | 'number' | 'icon';

export type RuleTextSize = 'normal' | 'large';

export type RuleItemType = 'rule' | 'divider';

export interface Rule {
  id: string;
  category: string;
  title: string;
  description: string;
  severity: RuleSeverity;
  pillar: RulePillar;
  // Notion-style rich customization — all optional so existing rules saved
  // before this feature still render fine via pillar-based fallbacks.
  iconKind?: RuleIconKind; // 'emoji' (raw emoji char) or 'icon' (key into RULE_ICON_MAP)
  iconValue?: string;
  color?: RuleAccentColor;
  bulletStyle?: RuleBulletStyle;
  textSize?: RuleTextSize;
  // Divider support — when itemType is 'divider' this entry renders as a
  // labeled section break inside its pillar's rule list instead of a rule.
  itemType?: RuleItemType;
  dividerLabel?: string;
}

export interface CustomPillar {
  id: string;
  label: string; // full label, e.g. "Capital & Execution Rules"
  shortLabel: string; // shorter label used in compact headers
  icon: string; // key into RULE_ICON_MAP
  color: RuleAccentColor;
}

export interface StrategyStep {
  id: string;
  title: string; // e.g. "Step 1: Asian High Sweep & MSS"
  notes: string; // short description / checklist rule for this step
  images: TradeImage[]; // optional zoomed-in chart screenshot(s) for this step — supports multiple
}

export interface Strategy {
  id: string;
  title: string;
  market: string; // e.g. "NYC / NQ" — market/session tag
  steps: StrategyStep[]; // ordered, dynamic step-by-step execution builder
  images: TradeImage[]; // main cover / ideal A+ chart example(s) — supports multiple, first one used as gallery thumbnail
}

export interface ChatMessage {
  id: string;
  text: string;
  timestamp: string;
}

export type NoticeType = 'mistake' | 'insight';

export interface MarketNotice {
  id: string;
  type: NoticeType;
  title: string;
  session: SessionOption | ''; // NY / London / Asia / Pre-market Open filter
  tag: string; // free-text asset/session tag, e.g. "NQ Futures"
  imageUrl: string; // TradingView chart screenshot reference
  description: string; // What Happened / Trap Description
  consequence: string; // Consequence / Risk
  prevention: string; // Prevention Rule / Solution (bold actionable fix)
  timestamp: string;
  // Legacy free-form observation log, kept only so old backups round-trip
  // cleanly. No longer surfaced in the Market Notices UI.
  messages: ChatMessage[];
}

export type WikiCategory = typeof WIKI_CATEGORIES[number];

export interface WikiEntry {
  id: string;
  title: string;
  content: string; // short gallery-card description / core definition
  category: string;
  imageUrl: string; // preview + full-res diagram (url or base64 data URI)
  keyRules: string[]; // Key Rules / Conditions — rendered as bullet points
  bestSession: string; // Trading Context — e.g. "NY Open", "London"
  timeframe: string; // Trading Context — e.g. "5m / 15m HTF"
  contextNotes: string; // Trading Context — freeform notes
}

export interface WikiCandle { x: number; open: number; close: number; high: number; low: number; }

export interface SetupType {
  id: string;
  name: string;
  color: TagColor;
}

export interface Confluence {
  id: string;
  name: string;
  color: TagColor;
}

export interface Mistake {
  id: string;
  name: string;
  color: TagColor;
}

export interface EmotionTag {
  id: string;
  name: string;
  color: TagColor;
}

export type TagColor = 'gray' | 'blue' | 'purple' | 'green' | 'yellow' | 'orange' | 'red' | 'pink';

export interface TagColorStyle {
  id: TagColor;
  label: string;
  swatch: string; // solid dot used in the color picker + active checkbox
  chip: string; // subtle tinted badge used for selected chips/options
}

export type SessionOption = 'NYC' | 'London' | 'Asia' | 'Pre-market Open';

export type ViewType = 'dashboard' | 'trades' | 'discipline' | 'lifeDiscipline' | 'playbook' | 'notices' | 'wiki' | 'calendar';

export type GalleryView = 'list' | 'preview' | 'gallery';

export type TradeFilter = 'all' | 'profit' | 'loss' | 'breakeven';

export type TradeSortField = 'date' | 'pnl' | 'symbol' | 'rr';

export type SortOrder = 'asc' | 'desc';

export type RoutineIconKind = 'emoji' | 'icon';

export type RoutineIconColor = 'emerald' | 'amber' | 'cyan' | 'rose' | 'violet' | 'white';

export interface RoutineCategory {
  id: string;
  label: string;
  items: RoutineItem[];
  iconKind?: RoutineIconKind;
  iconValue?: string; // raw emoji char (iconKind 'emoji') or a key into ROUTINE_ICON_MAP (iconKind 'icon')
  iconColor?: RoutineIconColor; // only meaningful when iconKind === 'icon'
}

export type WeekDay = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';

export interface RoutineItem {
  id: string;
  text: string;
  // Day-Specific (Weekly) Routines — optional; when absent/'daily' the item
  // applies every day, exactly as before. Only meaningful when the parent
  // challenge has weeklyRoutinesEnabled turned on (see ChallengeConfig);
  // with that flag off, every item behaves as 'daily' regardless of these
  // fields, so turning the feature off is always non-destructive.
  frequency?: 'daily' | 'specific';
  days?: WeekDay[]; // which day(s) this item applies to when frequency === 'specific'
}

export interface ChallengeConfig {
  title: string;
  durationDays: number;
  recheckTokens: number; // max allowed grace re-checks for missed days
  motto: string; // optional identity / vision anchor
  categories: RoutineCategory[];
  // Master switch for Day-Specific (Weekly) Routines. Off by default so
  // existing challenges keep behaving exactly as before; turning it on
  // unlocks the per-item Frequency/Schedule option and the "Today's Weekly
  // Targets" section on the dashboard.
  weeklyRoutinesEnabled?: boolean;
}

export interface ChallengePresetCategory {
  label: string;
  items: string[];
  iconKind?: RoutineIconKind;
  iconValue?: string;
  iconColor?: RoutineIconColor;
}

export interface ChallengePreset {
  id: string;
  name: string;
  description: string;
  durationDays: number;
  recheckTokens: number;
  motto: string;
  categories: ChallengePresetCategory[];
}

export interface RuleAccentStyle {
  id: RuleAccentColor;
  label: string;
  dot: string; // solid swatch used in the color picker
  text: string; // icon/accent text color
  bg: string; // icon badge background
  ring: string; // selected-swatch ring color
}

export type PillarsPerRow = 2 | 3 | 4 | 5 | 6;

export interface PHTWindow {
  openMin: number; // minutes since PHT midnight (0-1439)
  closeMin: number; // minutes since PHT midnight; > 1440 represents "past midnight, next day"
}

export interface MarketSessionDef {
  key: string;
  name: string;
  cityLabel: string;
  clockTimeZone: string; // drives the live local-time digital clock
  dstTimeZone: string | null; // null = fixed window, no DST toggle (Tokyo)
  summerWindow: PHTWindow;
  winterWindow: PHTWindow; // identical to summerWindow when dstTimeZone is null
  killzoneWindow: PHTWindow;
  killzoneBadgeLabel: string;
}

export interface StoredData {
  version: number;
  accounts: Account[];
  trades: Trade[];
  rules: Rule[];
  strategies: Strategy[];
  notices: MarketNotice[];
  wikiEntries: WikiEntry[];
  setupTypes: SetupType[];
  confluences: Confluence[];
  mistakesList: Mistake[];
  emotionsList: EmotionTag[];
  customSymbols: string[];
  customPillars: CustomPillar[];
}

export interface ParsedMTTrade {
  ticketId: string;
  symbol: string;
  orderType: 'buy' | 'sell';
  lotSize: number;
  openTime: string;   // ISO 8601 ("yyyy-MM-ddTHH:mm:ss") when parseable, else the raw broker string
  closeTime: string;  // ISO 8601 when parseable, else the raw broker string
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  takeProfit: number;
  profitLoss: number; // net P/L: profit + commission + swap + taxes (whichever columns are present)
}

export type MTColumnRole = 'ticket' | 'time' | 'type' | 'size' | 'symbol' | 'price' | 'sl' | 'tp' | 'profit' | 'commission' | 'swap' | 'taxes';

export interface EconomicEvent {
  id: string;
  title: string;
  currency: string;
  impact: 'high' | 'medium' | 'low' | 'none';
  time: Date | null;
  previous: string;
  forecast: string;
  actual: string;
}

export type MarketEffect = 'bullish' | 'bearish' | 'neutral';

export interface NotificationReadState {
  date: string; // PHT date key this read-list applies to
  readIds: string[];
}

export interface CalculatorProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onEnter: () => void;
  initialPosition: { top: number; left: number };
  allowNegative?: boolean;
  theme?: 'light' | 'dark' | 'minecraft';
}

export interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export interface MultiSelectDropdownProps {
  label: string;
  options: { id: string; name: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  onAddNew?: (name: string) => void;
  onDeleteOption?: (id: string, name: string) => void;
  placeholder?: string;
  colorScheme?: 'default' | 'red' | 'emerald' | 'rose';
  layout?: 'flex' | 'grid';
}

export interface TagColorPickerProps {
  anchorRect: DOMRect;
  currentColor: TagColor;
  onSelect: (color: TagColor) => void;
  onClose: () => void;
}

export interface TagSelectDropdownProps {
  label: string;
  options: { id: string; name: string; color?: TagColor }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  onAddNew?: (name: string) => void;
  onDeleteOption?: (id: string, name: string) => void;
  onColorChange?: (id: string, color: TagColor) => void;
  placeholder?: string;
  colorScheme?: 'emerald' | 'rose';
}

export interface EditableTagInputProps {
  values: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  placeholder?: string;
  colorScheme?: 'default' | 'violet' | 'red';
}

export interface TimeframeChartInputProps {
  timeframe: string;
  images: TradeImage[];
  notes: string;
  onAddImage: (url: string) => void;
  onUploadImage: (file: File) => void;
  onRemoveImage: (imageId: string) => void;
  onReorderImages: (fromIndex: number, toIndex: number) => void;
  onPreviewImage: (url: string) => void;
  onNotesChange: (notes: string) => void;
  isExecution?: boolean;
}

export interface AccountMetrics {
  currentBalance: number;
  highestBalance: number;
  threshold: number;
  drawdownAmount: number;
  drawdownProgress: number;
  profitProgress: number;
  isBreached: boolean;
  isLocked: boolean;
  lockThreshold?: number;
}

export interface NumericInputProps {
  value: string;
  onChange: (value: string, numericValue: number) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  allowNegative?: boolean;
  label?: string;
}

