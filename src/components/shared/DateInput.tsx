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
import { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/format';
import { useClickOutside } from '../../hooks/useClickOutside';
import type { DateInputProps } from '../../types';


export const DateInput: React.FC<DateInputProps> = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value + 'T00:00:00') : null;
  const [viewMonth, setViewMonth] = useState(() => {
    const d = selectedDate || new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openCalendar = () => {
    const d = selectedDate || new Date();
    setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    setIsOpen(!isOpen);
  };

  const toISODate = (d: Date) => {
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${y}-${mo}-${da}`;
  };

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const firstOfMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const startOffset = firstOfMonth.getDay();
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const today = new Date();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));

  return (
    <div ref={wrapRef} className="relative">
      <label className="block text-xs text-zinc-400 mb-1.5">{label}</label>
      <button
        type="button"
        onClick={openCalendar}
        className="relative w-full bg-zinc-800 border border-zinc-700 rounded-xl flex items-center hover:border-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors group select-none overflow-hidden"
      >
        <div className="flex items-center pl-4 pr-2 text-zinc-400 group-hover:text-zinc-300 transition-colors">
          <CalendarDays className="w-4 h-4" />
        </div>
        <div className="flex-1 py-3 pl-1 text-left">
          <span className={cn('text-sm', value ? 'text-white' : 'text-zinc-500')}>
            {value ? new Date(value + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select date'}
          </span>
        </div>
        <div className="pr-4 py-3 text-zinc-600">
          <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl z-30 p-3 w-64">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
              className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-white">
              {viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
              className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="text-center text-[10px] text-zinc-500 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => (
              <button
                key={i}
                type="button"
                disabled={!d}
                onClick={() => { if (d) { onChange(toISODate(d)); setIsOpen(false); } }}
                className={cn(
                  'aspect-square text-xs rounded-lg flex items-center justify-center transition-colors',
                  !d ? 'invisible' :
                  selectedDate && isSameDay(d, selectedDate) ? 'bg-white text-zinc-900 font-medium' :
                  isSameDay(d, today) ? 'text-white border border-zinc-600' :
                  'text-zinc-300 hover:bg-zinc-700'
                )}
              >
                {d ? d.getDate() : ''}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => { onChange(toISODate(new Date())); setIsOpen(false); }}
            className="w-full mt-2 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>
      )}
    </div>
  );
};

// Multi-Select Dropdown Component
