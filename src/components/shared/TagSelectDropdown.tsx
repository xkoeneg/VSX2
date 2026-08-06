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
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/format';
import type { TagColor } from '../../types';
import { TAG_COLOR_PALETTE, getTagColorStyle, DEFAULT_TAG_COLOR } from '../../constants/tagColors';
import { useClickOutside } from '../../hooks/useClickOutside';
import { TagColorPicker } from './TagColorPicker';
import type { TagSelectDropdownProps } from '../../types';


export const TagSelectDropdown: React.FC<TagSelectDropdownProps> = ({
  label,
  options,
  selected,
  onChange,
  onAddNew,
  onDeleteOption,
  onColorChange,
  placeholder = 'Select...',
  colorScheme = 'emerald',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [colorPickerFor, setColorPickerFor] = useState<{ id: string; rect: DOMRect } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  useClickOutside(containerRef, useCallback(() => { setIsOpen(false); setIsAdding(false); }, []), isOpen);

  useEffect(() => {
    if (isAdding) addInputRef.current?.focus();
  }, [isAdding]);

  // Legacy/fallback color when an option has no saved color yet.
  const schemeFallback: TagColor = colorScheme === 'rose' ? 'red' : 'green';

  // Look up a tag's saved color by name (selected tags are stored as plain
  // strings on the trade, so the color always comes from the live options list).
  const colorForName = (name: string): TagColor =>
    (options.find(o => o.name === name)?.color as TagColor) || schemeFallback;

  const toggleItem = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter(s => s !== name));
    } else {
      onChange([...selected, name]);
    }
  };

  const removeItem = (name: string, e: React.SyntheticEvent) => {
    e.stopPropagation();
    onChange(selected.filter(s => s !== name));
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

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-xs text-zinc-400 mb-1.5">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(v => !v)}
        className="w-full min-h-[46px] bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-600 flex items-center justify-between gap-2"
      >
        {selected.length === 0 ? (
          <span className="text-zinc-500">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1.5 flex-1">
            {selected.map(name => (
              <span
                key={name}
                className={cn('inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md text-xs font-medium', getTagColorStyle(colorForName(name)).chip)}
              >
                <span className="truncate max-w-[140px]">{name}</span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => removeItem(name, e)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') removeItem(name, e); }}
                  className="hover:bg-black/20 rounded p-0.5 shrink-0"
                >
                  <X className="w-3 h-3" />
                </span>
              </span>
            ))}
          </div>
        )}
        <ChevronDown className={cn('w-4 h-4 text-zinc-400 shrink-0 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-30 max-h-60 overflow-y-auto">
          {options.length === 0 && (
            <p className="px-3 py-2.5 text-xs text-zinc-500">No options yet</p>
          )}
          {options.map(opt => {
            const isSelected = selected.includes(opt.name);
            const optColorStyle = getTagColorStyle(opt.color || schemeFallback);
            return (
              <div
                key={opt.id}
                onClick={() => toggleItem(opt.name)}
                className="group flex items-center justify-between gap-2 px-3 py-2 hover:bg-zinc-700 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 text-sm min-w-0">
                  <div className={cn(
                    'w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors',
                    isSelected ? cn(optColorStyle.swatch, 'border-transparent') : 'border-zinc-600'
                  )}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className={cn('truncate', isSelected ? 'text-white' : 'text-zinc-300')}>{opt.name}</span>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  {onColorChange && (
                    <button
                      type="button"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        setColorPickerFor(cur => (cur?.id === opt.id ? null : { id: opt.id, rect }));
                      }}
                      title="Change tag color"
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded hover:bg-zinc-600 transition-all shrink-0 flex items-center justify-center"
                    >
                      <span className={cn('w-3 h-3 rounded-full block', optColorStyle.swatch)} />
                    </button>
                  )}
                  {onDeleteOption && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeleteConfirm({ id: opt.id, name: opt.name });
                      }}
                      title={`Delete "${opt.name}"`}
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded hover:bg-zinc-600 text-zinc-500 hover:text-white transition-all shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {colorPickerFor && onColorChange && (
            <TagColorPicker
              anchorRect={colorPickerFor.rect}
              currentColor={(options.find(o => o.id === colorPickerFor.id)?.color as TagColor) || DEFAULT_TAG_COLOR}
              onSelect={(color) => onColorChange(colorPickerFor.id, color)}
              onClose={() => setColorPickerFor(null)}
            />
          )}

          {onAddNew && (
            <div className="border-t border-zinc-700">
              {isAdding ? (
                <div className="flex items-center gap-1.5 px-3 py-2">
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
                    placeholder="New tag name..."
                    className="flex-1 min-w-0 bg-zinc-900 border border-zinc-600 rounded-md px-2 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleAddNew}
                    className="p-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-md text-zinc-300 hover:text-white transition-colors shrink-0"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAdding(true)}
                  className="w-full flex items-center gap-1.5 px-3 py-2.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Custom Tag
                </button>
              )}
            </div>
          )}
        </div>
      )}

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
// that need ad-hoc, non-persisted tags rather than a shared global option list.
