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
import { ModalBackdrop } from './ModalBackdrop';
import { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/format';
import { useClickOutside } from '../../hooks/useClickOutside';
import type { MultiSelectDropdownProps } from '../../types';


export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  options,
  selected,
  onChange,
  onAddNew,
  onDeleteOption,
  placeholder = 'None yet',
  colorScheme = 'default',
  layout = 'flex',
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const addInputRef = useRef<HTMLInputElement>(null);
  const isGrid = layout === 'grid';

  useEffect(() => {
    if (isAdding) addInputRef.current?.focus();
  }, [isAdding]);

  const toggleItem = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter(s => s !== name));
    } else {
      onChange([...selected, name]);
    }
  };

  const handleAddNew = () => {
    if (newItem.trim() && onAddNew) {
      const trimmed = newItem.trim();
      onAddNew(trimmed);
      onChange([...selected, trimmed]);
      setNewItem('');
      setIsAdding(false);
    }
  };

  const confirmDelete = () => {
    if (deleteConfirm && onDeleteOption) {
      onDeleteOption(deleteConfirm.id, deleteConfirm.name);
    }
    setDeleteConfirm(null);
  };

  const activeClasses = colorScheme === 'red'
    ? cn('bg-rose-500 text-white border-rose-500', isGrid && 'ring-1 ring-rose-400/50 shadow-[0_0_10px_-2px_rgba(239,68,68,0.6)]')
    : colorScheme === 'emerald'
      ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/80'
      : colorScheme === 'rose'
        ? 'bg-rose-950/40 text-rose-300 border border-rose-500/80'
        : cn('bg-white text-zinc-900 border-white', isGrid && 'ring-1 ring-emerald-400/50 shadow-[0_0_10px_-2px_rgba(16,185,129,0.5)]');
  const inactiveClasses = colorScheme === 'red'
    ? 'bg-zinc-800/60 text-zinc-400 border-zinc-700/80 hover:border-rose-500/50 hover:text-rose-300 hover:bg-zinc-800'
    : colorScheme === 'emerald' || colorScheme === 'rose'
      ? 'bg-[#1a1b23] text-zinc-400 border-[#232429] hover:border-gray-600 hover:text-zinc-200'
      : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/80 hover:border-zinc-500 hover:text-zinc-200 hover:bg-zinc-800';

  return (
    <div>
      <label className="block text-xs text-zinc-400 mb-2">{label}</label>
      <div className={isGrid ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2' : 'flex flex-wrap gap-2'}>
        {options.length === 0 && !onAddNew && (
          <span className="text-xs text-zinc-600 py-1.5">{placeholder}</span>
        )}
        {options.map(opt => {
          const isSelected = selected.includes(opt.name);
          return (
            <div key={opt.id} className={cn('group relative', isGrid && 'w-full')}>
              <button
                type="button"
                onClick={() => toggleItem(opt.name)}
                className={cn(
                  'text-xs font-medium border transition-all duration-150 flex items-center gap-1',
                  isGrid ? 'w-full h-9 px-3 rounded-lg justify-center' : 'px-3 py-1.5 rounded-full',
                  onDeleteOption && 'pr-6',
                  isSelected ? activeClasses : inactiveClasses
                )}
              >
                {isSelected && <Check className="w-3 h-3 shrink-0" />}
                <span>{opt.name}</span>
              </button>
              {onDeleteOption && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDeleteConfirm({ id: opt.id, name: opt.name });
                  }}
                  title={`Delete "${opt.name}"`}
                  className={cn(
                    'absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded-full transition-all duration-150',
                    'opacity-0 group-hover:opacity-100 focus:opacity-100',
                    isSelected ? 'hover:bg-black/20 text-current' : 'hover:bg-zinc-700 text-zinc-500 hover:text-white'
                  )}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        {onAddNew && (
          isAdding ? (
            <div className={cn('flex items-center gap-1', isGrid && 'col-span-full sm:col-span-1')}>
              <input
                ref={addInputRef}
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); handleAddNew(); }
                  if (e.key === 'Escape') { setIsAdding(false); setNewItem(''); }
                }}
                onBlur={() => { if (!newItem.trim()) setIsAdding(false); }}
                placeholder="New..."
                className={cn(
                  'bg-zinc-800 border border-zinc-600 px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500',
                  isGrid ? 'flex-1 h-9 rounded-lg' : 'w-24 py-1.5 rounded-full'
                )}
              />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleAddNew}
                className={cn('bg-zinc-700 hover:bg-zinc-600 text-zinc-300 hover:text-white transition-colors', isGrid ? 'h-9 w-9 rounded-lg flex items-center justify-center shrink-0' : 'p-1.5 rounded-full')}
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className={cn(
                'text-xs font-medium border border-dashed transition-all duration-150 flex items-center gap-1',
                isGrid
                  ? 'w-full h-9 px-3 rounded-lg justify-center border-gray-600 text-gray-400 hover:border-gray-400 hover:text-gray-300'
                  : 'px-3 py-1.5 rounded-full border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300'
              )}
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          )
        )}
      </div>

      {deleteConfirm && (
        <ModalBackdrop
          onClose={() => setDeleteConfirm(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/15 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Delete Tag?</h3>
            </div>
            <p className="text-sm text-zinc-400 mb-6">
              Are you sure you want to remove "{deleteConfirm.name}" from your default list? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-500/90 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </ModalBackdrop>
      )}
    </div>
  );
};

// Notion-style color palette popup — shown when the person clicks a tag's
// color dot inside a TagSelectDropdown option row. Renders as a fixed-position
// popover anchored to the dot so it always escapes the dropdown's scroll
// clipping, and closes on outside click or Escape.
