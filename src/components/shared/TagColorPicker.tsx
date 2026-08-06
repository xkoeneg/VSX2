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
import { useClickOutside } from '../../hooks/useClickOutside';
import { useRef, useEffect } from 'react';
import { cn } from '../../utils/format';
import type { TagColor } from '../../types';
import { TAG_COLOR_PALETTE } from '../../constants/tagColors';
import type { TagColorPickerProps } from '../../types';


export const TagColorPicker: React.FC<TagColorPickerProps> = ({ anchorRect, currentColor, onSelect, onClose }) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  useClickOutside(popoverRef, onClose, true);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Keep the popover on-screen: prefer opening below the dot, but flip
  // above if it would run off the bottom of the viewport.
  const popoverWidth = 176;
  const viewportW = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const viewportH = typeof window !== 'undefined' ? window.innerHeight : 768;
  const estimatedHeight = 258;
  const left = Math.min(anchorRect.left, viewportW - popoverWidth - 8);
  const top = anchorRect.bottom + 6 + estimatedHeight > viewportH
    ? Math.max(8, anchorRect.top - estimatedHeight - 6)
    : anchorRect.bottom + 6;

  return (
    <div
      ref={popoverRef}
      onClick={(e) => e.stopPropagation()}
      style={{ position: 'fixed', top, left, width: popoverWidth }}
      className="z-[100] bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl p-1.5"
    >
      <p className="px-2 pt-1 pb-1.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500">Tag Color</p>
      <div className="flex flex-col gap-0.5">
        {TAG_COLOR_PALETTE.map(c => (
          <button
            key={c.id}
            type="button"
            onClick={() => { onSelect(c.id); onClose(); }}
            className={cn(
              'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-left transition-colors',
              c.id === currentColor ? 'bg-zinc-700 text-white' : 'text-zinc-300 hover:bg-zinc-700/70'
            )}
          >
            <span className={cn('w-3 h-3 rounded-full shrink-0', c.swatch)} />
            <span className="flex-1">{c.label}</span>
            {c.id === currentColor && <Check className="w-3.5 h-3.5 shrink-0" />}
          </button>
        ))}
      </div>
    </div>
  );
};

// Compact multi-select dropdown for tag fields — closed state looks like the
// Symbol/Session inputs and shows selected tags as removable badges inline,
// each tinted with that tag's own saved color; open state is a checklist
// with a per-option Notion-style color dot, an "Add Custom Tag" row, and
// delete-with-confirm.
