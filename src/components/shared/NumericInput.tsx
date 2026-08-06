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
import { parseFormattedPrice } from '../../utils/format';
import { useRef } from 'react';
import { cn } from '../../utils/format';
import { sanitizeNumericInput } from '../../utils/format';
import type { NumericInputProps } from '../../types';


export const NumericInput: React.FC<NumericInputProps> = ({
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder = '0',
  className = '',
  allowNegative = false,
  label,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // STRICT VALIDATION: Strip everything except digits, decimal, and negative (if allowed)
    const sanitized = sanitizeNumericInput(rawValue, allowNegative);
    const numericValue = parseFormattedPrice(sanitized);
    onChange(sanitized, numericValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const controlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Home', 'End', 'Enter', 'Escape'];
    if (controlKeys.includes(e.key)) return;
    if (e.ctrlKey || e.metaKey) return;
    if (e.key === '.' || e.key === ',') return;
    if (allowNegative && e.key === '-') return;
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    const pattern = allowNegative ? /^-?[0-9.,]*$/ : /^[0-9.,]*$/;
    if (!pattern.test(text)) {
      e.preventDefault();
    }
  };

  return (
    <div className="w-full">
      {label && <label className="block text-xs text-zinc-400 mb-1.5">{label}</label>}
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        className={cn(
          'w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-zinc-600',
          className
        )}
      />
    </div>
  );
};

// Pending Review — empty-state celebration bear. Pure inline SVG animated
// with CSS keyframe transforms (GPU-accelerated, no JS ticking, no external
// animation library / network fetch needed for a Lottie file), so it costs
// nothing at 60fps and can't touch chart or journal render cycles. It takes
// no props and is wrapped in memo, so it mounts once per empty-state entry
// and never re-renders just because App (or the Discipline Tracker view)
// re-renders for unrelated reasons — the animation itself lives entirely in
// CSS, so even repeated mounts are cheap.
