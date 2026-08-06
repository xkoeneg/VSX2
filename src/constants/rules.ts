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
import type { RulePillar, RuleSeverity, RuleAccentColor, RuleAccentStyle, CustomPillar, Rule, RuleBulletStyle, RuleTextSize, PillarsPerRow } from '../types';

export const RULE_PILLARS: RulePillar[] = ['risk', 'execution', 'psychology'];

export const RULE_PILLAR_META: Record<RulePillar, { label: string; Icon: LucideIcon; color: string; iconBg: string; accent: string }> = {
  risk: { label: 'Risk & Capital Rules', Icon: Shield, color: 'text-blue-400', iconBg: 'bg-blue-500/10', accent: 'border-t-sky-500' },
  execution: { label: 'Execution Rules', Icon: Zap, color: 'text-amber-400', iconBg: 'bg-amber-500/10', accent: 'border-t-amber-500' },
  psychology: { label: 'Psychology Rules', Icon: Brain, color: 'text-purple-400', iconBg: 'bg-purple-500/10', accent: 'border-t-violet-500' },
};

// Section titles used inside the unified "Trading Charter & Mandates" card
// (drops the trailing " Rules" from the pillar meta label above).
export const RULE_PILLAR_SHORT_LABEL: Record<RulePillar, string> = {
  risk: 'Risk & Capital',
  execution: 'Execution Protocol',
  psychology: 'Psychology & Mindset',
};

// ---- Rules Playbook: severity tiers ----
export const RULE_SEVERITIES: RuleSeverity[] = ['critical', 'warning', 'guide'];

export const RULE_SEVERITY_META: Record<RuleSeverity, { label: string; dot: string; badge: string }> = {
  critical: { label: 'Critical', dot: 'bg-rose-500', badge: 'bg-rose-500/15 text-rose-400 border border-rose-500/20' },
  warning: { label: 'Warning', dot: 'bg-amber-400', badge: 'bg-amber-400/15 text-amber-400 border border-amber-400/20' },
  guide: { label: 'Guide', dot: 'bg-sky-400', badge: 'bg-sky-400/15 text-sky-400 border border-sky-400/20' },
};

// ---- Rules Playbook: Notion-style icon & color customization ----

export const RULE_ACCENT_PALETTE: RuleAccentStyle[] = [
  { id: 'emerald', label: 'Emerald', dot: 'bg-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10', ring: 'ring-emerald-400' },
  { id: 'amber', label: 'Amber', dot: 'bg-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/10', ring: 'ring-amber-400' },
  { id: 'crimson', label: 'Crimson', dot: 'bg-rose-500', text: 'text-rose-400', bg: 'bg-rose-500/10', ring: 'ring-rose-400' },
  { id: 'indigo', label: 'Indigo', dot: 'bg-indigo-500', text: 'text-indigo-400', bg: 'bg-indigo-500/10', ring: 'ring-indigo-400' },
  { id: 'cyan', label: 'Cyan', dot: 'bg-cyan-500', text: 'text-cyan-400', bg: 'bg-cyan-500/10', ring: 'ring-cyan-400' },
];

export const getRuleAccent = (color?: string): RuleAccentStyle =>
  RULE_ACCENT_PALETTE.find(c => c.id === color) || RULE_ACCENT_PALETTE[0];

// Sensible per-pillar defaults so rules created before this feature (or with
// no explicit customization) still get a coherent icon + color out of the box.
export const RULE_PILLAR_DEFAULT_COLOR: Record<RulePillar, RuleAccentColor> = {
  risk: 'indigo',
  execution: 'amber',
  psychology: 'crimson',
};
export const RULE_PILLAR_DEFAULT_ICON: Record<RulePillar, string> = {
  risk: 'Shield',
  execution: 'Zap',
  psychology: 'Brain',
};

// Matches RULE_ACCENT_PALETTE — used for the top accent border of a pillar
// column, which needs a "border-t-*" class rather than the "bg-*"/"text-*"
// classes the palette itself provides.
export const RULE_ACCENT_BORDER_TOP: Record<RuleAccentColor, string> = {
  emerald: 'border-t-emerald-500',
  amber: 'border-t-amber-500',
  crimson: 'border-t-rose-500',
  indigo: 'border-t-indigo-500',
  cyan: 'border-t-cyan-500',
};

// ---- Custom pillars: dynamic resolvers ----
// The 3 built-in pillars (risk/execution/psychology) have static metadata
// above. Custom, user-created pillars store their own label/icon/color on
// the CustomPillar object itself, so every place that used to do a direct
// RULE_PILLAR_META[pillar] lookup now goes through these resolvers instead,
// falling back to the custom pillar list (and finally to a generic
// "Custom Rules" shape if somehow neither is found).
export const getAllPillarIds = (customPillars: CustomPillar[]): RulePillar[] => [
  ...RULE_PILLARS,
  ...customPillars.map(p => p.id),
];

export const getPillarMeta = (pillar: RulePillar, customPillars: CustomPillar[]): { label: string; Icon: LucideIcon; color: string; iconBg: string; accent: string } => {
  if (RULE_PILLAR_META[pillar]) return RULE_PILLAR_META[pillar];
  const cp = customPillars.find(p => p.id === pillar);
  if (cp) {
    const accent = getRuleAccent(cp.color);
    return {
      label: cp.label,
      Icon: RULE_ICON_MAP[cp.icon] || Layers,
      color: accent.text,
      iconBg: accent.bg,
      accent: RULE_ACCENT_BORDER_TOP[cp.color] || 'border-t-indigo-500',
    };
  }
  return { label: 'Custom Rules', Icon: Layers, color: 'text-zinc-400', iconBg: 'bg-zinc-500/10', accent: 'border-t-zinc-500' };
};

export const getPillarShortLabel = (pillar: RulePillar, customPillars: CustomPillar[]): string => {
  if (RULE_PILLAR_SHORT_LABEL[pillar]) return RULE_PILLAR_SHORT_LABEL[pillar];
  const cp = customPillars.find(p => p.id === pillar);
  return cp?.shortLabel || cp?.label || 'Custom';
};

export const getPillarDefaultColor = (pillar: RulePillar, customPillars: CustomPillar[]): RuleAccentColor => {
  if (RULE_PILLAR_DEFAULT_COLOR[pillar]) return RULE_PILLAR_DEFAULT_COLOR[pillar];
  const cp = customPillars.find(p => p.id === pillar);
  return cp?.color || 'indigo';
};

export const getPillarDefaultIcon = (pillar: RulePillar, customPillars: CustomPillar[]): string => {
  if (RULE_PILLAR_DEFAULT_ICON[pillar]) return RULE_PILLAR_DEFAULT_ICON[pillar];
  const cp = customPillars.find(p => p.id === pillar);
  return cp?.icon || 'Layers';
};

// Icon glyph options for the "Icons" tab of the rule icon picker.
export const RULE_ICON_MAP: Record<string, LucideIcon> = {
  Shield, Zap, Brain, Target, Flame, AlertTriangle, CheckCircle2,
  Star, Flag, Bookmark, Lock, Crosshair, Rocket, Bell, Award, Gem, Anchor, Compass, Swords, Layers,
};
export const RULE_ICON_OPTIONS: string[] = Object.keys(RULE_ICON_MAP);

// Emoji options for the "Emoji" tab of the rule icon picker.
export const RULE_EMOJI_OPTIONS: string[] = [
  '🎯', '⚡', '🧠', '🛡️', '💰', '📈', '📉', '🔥', '⏰', '✅',
  '🚫', '⚠️', '💎', '🚀', '🔒', '🎲', '📊', '🧘', '🏆', '📌',
];

export const RULE_BULLET_STYLES: { id: RuleBulletStyle; label: string }[] = [
  { id: 'bullet', label: 'Bulleted' },
  { id: 'number', label: 'Numbered' },
  { id: 'icon', label: 'Icon Badge' },
];

export const RULE_TEXT_SIZES: { id: RuleTextSize; label: string }[] = [
  { id: 'normal', label: 'Normal' },
  { id: 'large', label: 'Large' },
];

// ---- Trading Rules card: configurable "Pillars Per Row" layout ----
// Hard-capped 2–6. Written out as full, literal Tailwind class strings
// (rather than built with string interpolation like `grid-cols-${n}`) so
// Tailwind's JIT scanner can find every class it needs to generate at
// build time — interpolated class names are invisible to the scanner and
// would silently produce no CSS. Falls back to a single column on small
// screens regardless of the chosen row limit.
export const PILLAR_GRID_COLS_CLASS: Record<PillarsPerRow, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
  6: 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-6',
};
export const PILLARS_PER_ROW_OPTIONS: PillarsPerRow[] = [2, 3, 4, 5, 6];

// Resolves the icon component for a rule, falling back to the pillar default
// when the rule predates this feature or has no icon set.
export const getRuleIconComponent = (rule: Pick<Rule, 'iconValue' | 'pillar'>, customPillars: CustomPillar[] = []): LucideIcon =>
  RULE_ICON_MAP[rule.iconValue || ''] || RULE_ICON_MAP[getPillarDefaultIcon(rule.pillar, customPillars)] || Layers;

// Loosely matches a Discipline Tracker "mistake" tag against a Rule title,
// so the Playbook can passively count violations without any manual
// checkboxes. Case/whitespace-insensitive, and tolerant of the tag being a
// shorthand version of the rule (or vice versa).
export const tagMatchesRuleTitle = (tag: string, ruleTitle: string): boolean => {
  const a = tag.trim().toLowerCase();
  const b = ruleTitle.trim().toLowerCase();
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
};
