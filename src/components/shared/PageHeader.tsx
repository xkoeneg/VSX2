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
import { cn } from '../../utils/format';

// ---- Reusable PageHeader — used at the top of every main view (Dashboard,
// Trade History, Performance Calendar, Discipline Tracker, Rules Playbook,
// Life Discipline Hub, Market Notices, Knowledge Wiki) so title/subtitle
// sizing, typography, and spacing are 100% consistent across tabs.
// `actions` renders any right-side controls (buttons, dropdowns) on the
// same row, right-aligned.
//
// LAYOUT LOCK: this row is a hard `h-14` — a fixed height, not a min-height.
// Some tabs pass `actions` (buttons) and/or a `description`, others pass
// neither; without a fixed height those differences used to change the
// header's rendered height per tab, which pushed the first card below it
// up or down and made its top border "jump" when switching tabs. Locking
// the row to h-14 with `items-center` means every tab's header occupies
// identical space regardless of its content, so the first card's top
// border lands in the exact same pixel position on every view.
//
// NOTE ON PADDING/MARGIN: PageHeader intentionally owns NO margin or
// padding of its own (no `pb-*`/`mb-*`). The single shared content wrapper
// (in the main App render, just above the `{view === '...' && renderX()}`
// switch) already applies identical left/right/top padding to every view,
// and every tab's root container now uses the same `space-y-6` spacing
// scale. That single, shared `space-y-6` is the ONLY thing controlling the
// gap between this header and the first content card — if PageHeader also
// added its own margin, the two would combine inconsistently (margin
// collapsing behaves differently depending on the surrounding space-y
// value) and reintroduce the same drift this fix removes. Do not add
// pb-*/mb-* here; change the tab's root `space-y-*` instead, and keep it
// at 6 to match every other tab.
export const PageHeader: React.FC<{
  title: string;
  description?: string;
  actions?: React.ReactNode;
}> = ({ title, description, actions }) => (
  <div className="h-14 flex items-center justify-between gap-4">
    <div className="min-w-0">
      <h1 className="text-2xl font-bold text-white tracking-tight leading-none truncate">
        {title}
      </h1>
      {description && (
        <p className="text-xs text-slate-400 font-normal mt-1.5 leading-snug truncate">
          {description}
        </p>
      )}
    </div>
    {actions && <div className="flex items-center gap-3 flex-shrink-0">{actions}</div>}
  </div>
);

