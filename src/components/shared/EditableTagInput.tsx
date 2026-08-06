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
import { useState } from 'react';
import { cn } from '../../utils/format';
import type { EditableTagInputProps } from '../../types';


export const EditableTagInput: React.FC<EditableTagInputProps> = ({ values, onAdd, onRemove, placeholder = 'Add custom...', colorScheme = 'default' }) => {
  const [draft, setDraft] = useState('');

  // All ad-hoc tag chips (Emotions, quick Mistakes, etc.) now share one
  // consistent dark-slate pill style — no more clashing per-scheme accent
  // colors (violet/red) so tags look uniform across the whole app.
  const chipClasses = 'bg-[#1f202c] text-zinc-300 border-[#303245]';

  const submit = () => {
    const trimmed = draft.trim();
    if (trimmed) {
      onAdd(trimmed);
      setDraft('');
    }
  };

  return (
    <div className="mt-2 space-y-2">
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {values.map(v => (
            <span key={v} className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border', chipClasses)}>
              {v}
              <button type="button" onClick={() => onRemove(v)} className="hover:opacity-70">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
        onBlur={submit}
        placeholder={placeholder}
        className="w-full bg-zinc-800/60 border border-dashed border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
      />
    </div>
  );
};

// Compact Timeframe Chart Input with dropdown menu
