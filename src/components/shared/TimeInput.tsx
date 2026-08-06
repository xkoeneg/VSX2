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
import type { TimeInputProps } from '../../types';


export const TimeInput: React.FC<TimeInputProps> = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const [h, m] = value ? value.split(':') : ['', ''];
  const hour = h || '00';
  const minute = m || '00';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const setHour = (newHour: string) => onChange(`${newHour}:${minute}`);
  const setMinute = (newMinute: string) => onChange(`${hour}:${newMinute}`);

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  return (
    <div ref={wrapRef} className="relative">
      <label className="block text-xs text-zinc-400 mb-1.5">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full bg-zinc-800 border border-zinc-700 rounded-xl flex items-center hover:border-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors group select-none overflow-hidden"
      >
        <div className="flex items-center pl-4 pr-2 text-zinc-400 group-hover:text-zinc-300 transition-colors">
          <Clock className="w-4 h-4" />
        </div>
        <div className="flex-1 py-3 pl-1 text-left">
          <span className={cn('text-sm', value ? 'text-white' : 'text-zinc-500')}>
            {value || 'Select time'}
          </span>
        </div>
        {value ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange(''); }}
            className="px-3 py-3 text-zinc-500 hover:text-rose-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </span>
        ) : (
          <div className="pr-4 py-3 text-zinc-600">
            <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl z-30 p-2 flex gap-2 w-full min-w-[180px]">
          <div className="flex-1">
            <div className="text-[10px] text-zinc-500 text-center mb-1">Hour</div>
            <div className="h-40 overflow-y-auto rounded-lg bg-zinc-900/50">
              {hours.map(hh => (
                <button
                  key={hh}
                  type="button"
                  onClick={() => setHour(hh)}
                  className={cn(
                    'w-full text-center px-2 py-1.5 text-sm hover:bg-zinc-700 transition-colors',
                    hour === hh ? 'text-white bg-zinc-700 font-medium' : 'text-zinc-400'
                  )}
                >
                  {hh}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <div className="text-[10px] text-zinc-500 text-center mb-1">Min</div>
            <div className="h-40 overflow-y-auto rounded-lg bg-zinc-900/50">
              {minutes.map(mm => (
                <button
                  key={mm}
                  type="button"
                  onClick={() => setMinute(mm)}
                  className={cn(
                    'w-full text-center px-2 py-1.5 text-sm hover:bg-zinc-700 transition-colors',
                    minute === mm ? 'text-white bg-zinc-700 font-medium' : 'text-zinc-400'
                  )}
                >
                  {mm}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Modern Date Input with full clickable container
