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
import { useState, useEffect, useRef } from 'react';
import { cn } from '../../utils/format';
import { sanitizeCalculatorValue } from '../../utils/calculatorHelpers';
import { useClickOutside } from '../../hooks/useClickOutside';
import type { CalculatorProps } from '../../types';

export const PopupCalculator: React.FC<CalculatorProps> = ({ value, onChange, onClose, onEnter, initialPosition, allowNegative = true, theme = 'dark' }) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const calculatorRef = useRef<HTMLDivElement>(null);

  // CALC_WIDTH/HEIGHT are approximate rendered dimensions (w-52 = 208px,
  // plus internal padding — matches the -220/-280 margins already used
  // below in the drag-clamp math). Clamped once on mount, since
  // `initialPosition` is computed by the caller from click/focus
  // coordinates and previously had no viewport-boundary protection —
  // only dragging was clamped, so the very first render of the popup
  // could land partially or fully off-screen on a narrow viewport.
  useEffect(() => {
    const CALC_WIDTH = 220;
    const CALC_HEIGHT = 280;
    setPosition(prev => ({
      left: Math.max(8, Math.min(prev.left, window.innerWidth - CALC_WIDTH)),
      top: Math.max(8, Math.min(prev.top, window.innerHeight - CALC_HEIGHT)),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.left,
      y: e.clientY - position.top,
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        left: Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - 220)),
        top: Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - 280)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (calculatorRef.current && !calculatorRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Calculator input handler - enforces strict numeric validation
  const handleInput = (val: string) => {
    if (val === 'C') {
      onChange('');
    } else if (val === 'backspace') {
      // Remove last character and re-sanitize
      const newValue = sanitizeCalculatorValue(value.slice(0, -1), allowNegative);
      onChange(newValue);
    } else if (val === '.') {
      // Only add decimal if not already present
      if (!value.includes('.')) {
        const newValue = sanitizeCalculatorValue(value + '.', allowNegative);
        onChange(newValue);
      }
    } else if (val === '-') {
      // Toggle negative sign - only at beginning
      if (allowNegative) {
        if (value.startsWith('-')) {
          onChange(value.slice(1));
        } else if (value === '' || !value.includes('-')) {
          onChange('-' + value);
        }
      }
    } else {
      // Digit pressed - sanitize and append
      const newValue = sanitizeCalculatorValue(value + val, allowNegative);
      onChange(newValue);
    }
  };

  const handleEnter = () => {
    onEnter();
    onClose();
  };

  return (
    <div
      ref={calculatorRef}
      className={cn(
        "fixed z-[100] rounded-xl shadow-2xl p-2 w-52 select-none transition-colors",
        theme !== 'light' ? 'bg-zinc-900 border border-zinc-700' : 'bg-white border border-zinc-200'
      )}
      style={{ top: position.top, left: position.left, cursor: isDragging ? 'grabbing' : 'default' }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          "flex items-center justify-between mb-2 px-1 py-1 rounded cursor-grab transition-colors",
          theme !== 'light' ? 'hover:bg-zinc-800/50' : 'hover:bg-zinc-100'
        )}
      >
        <div className="flex items-center gap-2">
          <GripVertical className={cn("w-3 h-3", theme !== 'light' ? 'text-zinc-600' : 'text-zinc-400')} />
          <Calculator className={cn("w-3 h-3", theme !== 'light' ? 'text-zinc-500' : 'text-zinc-400')} />
          <span className={cn("text-xs", theme !== 'light' ? 'text-zinc-500' : 'text-zinc-400')}>Calculator</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "p-0.5 transition-colors rounded",
            theme !== 'light' ? 'text-zinc-500 hover:text-white hover:bg-zinc-700' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200'
          )}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className={cn(
        "rounded-lg px-3 py-2 mb-2 text-right font-mono text-lg min-h-[40px] overflow-hidden",
        theme !== 'light' ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-900'
      )}>
        {value || '0'}
      </div>
      <div className="grid grid-cols-3 gap-1 mb-1">
        {['7', '8', '9', '4', '5', '6', '1', '2', '3', (allowNegative ? '-' : '0'), '0', '.'].map(btn => (
          <button
            type="button"
            key={btn}
            onClick={() => handleInput(btn)}
            className={cn(
              "h-10 rounded-lg font-medium transition-colors",
              theme !== 'light'
                ? 'bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-white'
                : 'bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 text-zinc-900'
            )}
          >
            {btn}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1">
        <button
          type="button"
          onClick={() => handleInput('C')}
          className="h-8 bg-rose-500/20 hover:bg-rose-500/30 active:bg-rose-500/40 text-rose-500 rounded-lg font-medium transition-colors"
        >
          C
        </button>
        <button
          type="button"
          onClick={() => handleInput('backspace')}
          className={cn(
            "h-8 rounded-lg font-medium transition-colors flex items-center justify-center",
            theme !== 'light'
              ? 'bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-500 text-white'
              : 'bg-zinc-200 hover:bg-zinc-300 active:bg-zinc-400 text-zinc-900'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleEnter}
          className="h-8 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
        >
          <CornerDownLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Modern Time Input with full clickable container
