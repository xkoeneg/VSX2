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
import type { RoutineIconColor, RoutineCategory, WeekDay, RoutineItem, ChallengeConfig, ChallengePresetCategory, ChallengePreset } from '../types';
import { cn } from '../utils/format';



// Lucide icon options offered in the "Icons" tab of the Category Icon Picker.
export const ROUTINE_ICON_OPTIONS: { key: string; Icon: LucideIcon }[] = [
  { key: 'Sun', Icon: Sun },
  { key: 'Moon', Icon: Moon },
  { key: 'Zap', Icon: Zap },
  { key: 'TrendingUp', Icon: TrendingUp },
  { key: 'Activity', Icon: Activity },
  { key: 'Dumbbell', Icon: Dumbbell },
  { key: 'BookOpen', Icon: BookOpen },
  { key: 'Target', Icon: Target },
  { key: 'Flame', Icon: Flame },
  { key: 'Shield', Icon: Shield },
  { key: 'Star', Icon: Star },
  { key: 'ListChecks', Icon: ListChecks },
  { key: 'Clock', Icon: Clock },
  { key: 'CheckCircle2', Icon: CheckCircle2 },
  { key: 'Coffee', Icon: Coffee },
  { key: 'Heart', Icon: Heart },
  { key: 'Brain', Icon: Brain },
  { key: 'Smile', Icon: Smile },
];

export const ROUTINE_ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  ROUTINE_ICON_OPTIONS.map(({ key, Icon }) => [key, Icon])
);

// Native emoji options offered in the "Emoji" tab of the Category Icon Picker.
export const ROUTINE_EMOJI_OPTIONS: string[] = [
  '🌅', '☀️', '🌙', '⭐', '✨', '🔥', '💧', '🏃', '🏋️', '💪',
  '🧘', '📚', '✅', '🍎', '🥗', '🛌', '🧹', '💊', '🚿', '🦷',
  '🧴', '📝', '🎯', '⚡', '☕', '🍳', '🚶', '🧠', '❤️', '🙏',
  '🎧', '📱', '🚭', '🧊', '🥤', '🌿', '🕯️', '🛁', '🩺', '📅',
  '⏰', '🎒', '💼', '🏆', '🎨', '🎵', '🐾',
];

export const ROUTINE_ICON_COLORS: { id: RoutineIconColor; label: string; swatchClass: string; textClass: string }[] = [
  { id: 'emerald', label: 'Emerald', swatchClass: 'bg-emerald-400', textClass: 'text-emerald-400' },
  { id: 'amber', label: 'Amber', swatchClass: 'bg-amber-400', textClass: 'text-amber-400' },
  { id: 'cyan', label: 'Cyan', swatchClass: 'bg-cyan-400', textClass: 'text-cyan-400' },
  { id: 'rose', label: 'Rose', swatchClass: 'bg-rose-400', textClass: 'text-rose-400' },
  { id: 'violet', label: 'Violet', swatchClass: 'bg-violet-400', textClass: 'text-violet-400' },
  { id: 'white', label: 'White', swatchClass: 'bg-white', textClass: 'text-white' },
];

export const ROUTINE_ICON_COLOR_CLASS: Record<RoutineIconColor, string> = Object.fromEntries(
  ROUTINE_ICON_COLORS.map(c => [c.id, c.textClass])
) as Record<RoutineIconColor, string>;

// Shared renderer for a category's header glyph — used identically on the
// live Discipline Hub dashboard and inside the Configure Challenge modal so
// the chosen emoji/icon+color always looks the same in both places.
export const renderCategoryIcon = (
  category: Pick<RoutineCategory, 'iconKind' | 'iconValue' | 'iconColor'>,
  className: string = 'w-4 h-4',
  colorClassOverride?: string
) => {
  if (category.iconKind === 'emoji' && category.iconValue) {
    return (
      <span className={cn('inline-flex items-center justify-center leading-none flex-shrink-0 text-base', className)}>
        {category.iconValue}
      </span>
    );
  }
  const IconComp = (category.iconKind === 'icon' && category.iconValue && ROUTINE_ICON_MAP[category.iconValue]) || ListChecks;
  const colorClass = colorClassOverride || (category.iconKind === 'icon' ? ROUTINE_ICON_COLOR_CLASS[category.iconColor || 'white'] : 'text-zinc-400');
  return <IconComp className={cn(className, 'flex-shrink-0', colorClass)} />;
};

// Sun-indexed to match JS Date#getDay() (0 = Sunday ... 6 = Saturday).
export const WEEKDAY_BY_JS_INDEX: WeekDay[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// Mon-first order for the "Specific Days" checkbox row in the Configure
// Challenge modal, matching the spec's listed order (Mon, Tue, ... Sun).
export const WEEKDAY_CHECKBOX_ORDER: WeekDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const WEEKDAY_FULL_NAME: Record<WeekDay, string> = {
  Sun: 'Sunday', Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday',
};

// The single, fixed "Weekly / Day-Specific Routines" card in the Configure
// Challenge modal is just another entry in ChallengeConfig.categories, but
// pinned to this reserved id so it can always be found/filtered rather than
// treated as one of the user's freely-added "+ Add Category / Group" blocks.
// Regular category cards are strictly 100% Everyday Daily Routines — every
// item added to them is plain (no frequency/day picker at all); the Weekly
// Card is the only place Specific-Days items live, and every item inside it
// is Specific-Days only (no "Daily" option).
export const WEEKLY_CATEGORY_ID = '__weekly_fixed__';
export const WEEKLY_CATEGORY_LABEL = '📅 Weekly / Day-Specific Routines';


// Parsed the same way formatDate() does (T00:00:00 local, not UTC) so the
// weekday always matches what the user sees on their calendar/grid.
export const getWeekdayForDateKey = (dateKey: string): WeekDay =>
  WEEKDAY_BY_JS_INDEX[new Date(`${dateKey}T00:00:00`).getDay()];

// Formats a Date as a YYYY-MM-DD key using its LOCAL calendar date — NOT
// date.toISOString().slice(0, 10), which reads the date back out in UTC.
// For any positive UTC offset (e.g. UTC+8), a local midnight Date can still
// be "yesterday" in UTC, so toISOString() silently returns the wrong day.
// That wrong dateKey then flows into getWeekdayForDateKey() above and
// resolves the wrong weekday — e.g. a grid day that's actually a Saturday
// gets treated as a Friday, so 'Sat'-tagged Weekly Routine items never
// match and the "[Weekday] Specifics" section quietly disappears. Every
// dateKey derived from "today" or from stepping through the challenge grid
// must go through this helper instead.
export const getLocalDateKey = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Whether a routine item is "in scope" for a given date. Daily items (the
// default, and everything when the feature is off) always apply. A
// Specific-Days item only applies on the weekday(s) it's scheduled for; if
// it somehow has no days selected yet, it falls back to daily rather than
// silently never appearing.
export const itemAppliesOnDate = (item: RoutineItem, dateKey: string, config: ChallengeConfig): boolean => {
  if (item.frequency !== 'specific') return true; // plain daily item — always in scope
  if (!config.weeklyRoutinesEnabled) return false; // weekly feature off — Specific-Days items are out of scope entirely
  if (!item.days || item.days.length === 0) return false; // no day assigned yet — doesn't apply to any date yet
  return item.days.includes(getWeekdayForDateKey(dateKey));
};


export const DURATION_PRESET_OPTIONS = [21, 30, 75, 100];

// Note: uses fixed string ids (not the generateId() helper, which is
// defined further down the file) since this default is built once at
// module-evaluation time, before that helper's `const` has initialized.
export const makeRoutineItems = (categoryId: string, texts: string[]): RoutineItem[] =>
  texts.map((text, i) => ({ id: `${categoryId}-default-${i}`, text }));

export const DEFAULT_CHALLENGE_CONFIG: ChallengeConfig = {
  title: 'Life Discipline Challenge',
  durationDays: 100,
  recheckTokens: 3,
  motto: '',
  weeklyRoutinesEnabled: false,
  categories: [
    { id: 'cat-morning-default', label: 'Morning Routine', iconKind: 'icon', iconValue: 'Sun', iconColor: 'amber', items: makeRoutineItems('cat-morning-default', ['Brush teeth twice a day', 'Face wash / Skincare', 'Hydrate']) },
    { id: 'cat-active-default', label: 'Active / Trading Focus', iconKind: 'icon', iconValue: 'Zap', iconColor: 'cyan', items: makeRoutineItems('cat-active-default', ['Gym / Workout', 'Clean eating', 'Sleep on time']) },
    { id: 'cat-night-default', label: 'Night Routine', iconKind: 'icon', iconValue: 'Moon', iconColor: 'violet', items: makeRoutineItems('cat-night-default', ['Night shower', 'Brush teeth', 'Moisturize']) },
  ],
};



// 1-click templates offered in the Configure Challenge modal. Selecting one
// auto-populates the draft (duration, tokens, motto, routine categories)
// while still leaving every field — including the categories themselves —
// open for further editing (add/rename/delete, re-icon/re-color) before saving.
export const CHALLENGE_PRESETS: ChallengePreset[] = [
  {
    id: 'monk30',
    name: '30-Day Monk Mode',
    description: 'A month of tight focus — minimal distractions, maximum output.',
    durationDays: 30,
    recheckTokens: 3,
    motto: 'Discipline is the bridge between goals and results.',
    categories: [
      { label: 'Morning Routine', iconKind: 'icon', iconValue: 'Sun', iconColor: 'amber', items: ['Wake up before 6:30 AM', 'No phone for first 30 min', 'Hydrate + stretch'] },
      { label: 'Active / Trading Focus', iconKind: 'icon', iconValue: 'Zap', iconColor: 'cyan', items: ['Deep work block (no social media)', 'Gym / physical training', 'Review trading/execution journal'] },
      { label: 'Night Routine', iconKind: 'icon', iconValue: 'Moon', iconColor: 'violet', items: ['No screens after 10 PM', 'Plan tomorrow\'s priorities', 'Lights out by 11 PM'] },
    ],
  },
  {
    id: 'exec21',
    name: '21-Day Execution Protocol',
    description: 'Short, high-intensity streak built to install one core habit set fast.',
    durationDays: 21,
    recheckTokens: 2,
    motto: 'Execute the plan. No exceptions.',
    categories: [
      { label: 'Morning Routine', iconKind: 'icon', iconValue: 'Sun', iconColor: 'amber', items: ['Review daily execution checklist', 'Hydrate', 'Set top 3 priorities'] },
      { label: 'Active / Trading Focus', iconKind: 'icon', iconValue: 'Zap', iconColor: 'cyan', items: ['Follow trading/execution rules exactly', 'No revenge or impulsive actions', 'Log every decision'] },
      { label: 'Night Routine', iconKind: 'icon', iconValue: 'Moon', iconColor: 'violet', items: ['End-of-day review', 'Rate rule adherence 1-10', 'Prep for tomorrow'] },
    ],
  },
  {
    id: 'hard75',
    name: '75 Hard Challenge',
    description: 'The classic mental-toughness program: strict daily non-negotiables, zero grace days.',
    durationDays: 75,
    recheckTokens: 0,
    motto: 'No compromises.',
    categories: [
      { label: 'Morning Routine', iconKind: 'icon', iconValue: 'Sun', iconColor: 'amber', items: ['Follow a structured diet — no alcohol, no cheat meals', 'Drink 1 gallon of water', 'Read 10 pages of a non-fiction book'] },
      { label: 'Active / Trading Focus', iconKind: 'icon', iconValue: 'Dumbbell', iconColor: 'cyan', items: ['45-min outdoor workout', '45-min indoor workout', 'Take a progress photo'] },
      { label: 'Night Routine', iconKind: 'icon', iconValue: 'Moon', iconColor: 'violet', items: ['Log the day\'s progress', 'No screens after workouts wind down', 'Lights out on schedule'] },
    ],
  },
];

// Preset emotion tags for the Discipline & Psychology Review modal
