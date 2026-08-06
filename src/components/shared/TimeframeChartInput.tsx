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
import { useEffect, useRef, useState } from 'react';
import type { TimeframeChart, TradeImage } from '../../types';
import { cn } from '../../utils/format';
import type { TimeframeChartInputProps } from '../../types';


export const TimeframeChartInput: React.FC<TimeframeChartInputProps> = ({
  timeframe,
  images,
  notes,
  onAddImage,
  onUploadImage,
  onRemoveImage,
  onReorderImages,
  onPreviewImage,
  onNotesChange,
  isExecution = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  // Drag-and-drop reorder state — purely local UI state for showing which
  // thumbnail is being dragged / hovered over. Actual reordering happens via
  // onReorderImages, which updates the trade's timeframes state.
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  // Brief inline feedback when a "Paste Link" attempt fails (empty/blocked
  // clipboard, or clipboard content that doesn't look like an image link).
  const [pasteFeedback, setPasteFeedback] = useState<string | null>(null);
  // Notes are collapsed by default to keep the grid compact; if a note was
  // already written for this timeframe, start expanded so it isn't hidden.
  const [showNotes, setShowNotes] = useState(!!notes.trim());

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUrlSubmit = () => {
    const url = prompt('Enter image URL:');
    if (url?.trim()) {
      onAddImage(url.trim());
    }
    setShowMenu(false);
  };

  // Reads the user's most recently copied text and, if it looks like an
  // image link, adds it straight away via the same onAddImage handler used
  // by the "Image URL" button — skipping the manual prompt + Ctrl+V step.
  // Clipboard access is read-only text and only ever feeds the existing
  // add-image-url state handler; nothing else about the trade is touched.
  const handleQuickPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text?.trim()) {
        setPasteFeedback('Clipboard is empty');
        setTimeout(() => setPasteFeedback(null), 2000);
        return;
      }
      const trimmed = text.trim();
      const isImage = /\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i.test(trimmed) || trimmed.includes('tradingview.com/x/');
      if (isImage) {
        onAddImage(trimmed);
        setShowMenu(false);
      } else {
        setPasteFeedback('Clipboard link doesn\'t look like an image');
        setTimeout(() => setPasteFeedback(null), 2000);
      }
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      setPasteFeedback('Clipboard access blocked');
      setTimeout(() => setPasteFeedback(null), 2000);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUploadImage(file);
    setShowMenu(false);
    e.target.value = '';
  };

  // ---- Native HTML5 drag-and-drop reordering ----
  // Each thumbnail carries its own index + the owning timeframe name via
  // dataTransfer, so a drop is only honored when it lands back inside the
  // same timeframe block (dragging between "Daily" and "1H", for example,
  // is a no-op). This only reorders the images array for this timeframe —
  // it never touches any other trade field.
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('draggedIndex', index.toString());
    e.dataTransfer.setData('category', timeframe);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const draggedIdx = parseInt(e.dataTransfer.getData('draggedIndex'), 10);
    const originCategory = e.dataTransfer.getData('category');
    setDraggedIndex(null);
    setDragOverIndex(null);
    if (originCategory !== timeframe) return; // only reorder within the same timeframe block
    if (Number.isNaN(draggedIdx)) return;
    onReorderImages(draggedIdx, targetIndex);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="bg-zinc-800/60 rounded-xl p-3 border border-zinc-700/80">
      <div className="flex items-center justify-between gap-1 mb-2">
        <h4 title={timeframe} className={cn('text-sm font-semibold truncate min-w-0', isExecution ? 'text-white' : 'text-zinc-300')}>
          {timeframe}
        </h4>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-zinc-500 shrink-0">{images.length}</span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setShowNotes(v => !v); }}
            className={cn(
              'flex items-center gap-1 p-1.5 rounded-lg transition-colors shrink-0',
              showNotes ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:bg-zinc-700 hover:text-white',
              notes.trim() && !showNotes && 'text-sky-400'
            )}
            title={showNotes ? 'Hide note' : 'Add note'}
          >
            <StickyNote className="w-3.5 h-3.5" />
            <ChevronDown className={cn('w-3 h-3 transition-transform', showNotes && 'rotate-180')} />
          </button>
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleQuickPaste();
              }}
              className="p-1.5 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors"
              title="Quick Paste from Clipboard"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
            </button>
            {pasteFeedback && (
              <div className="absolute right-0 top-full mt-1 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-20 whitespace-nowrap">
                <p className="text-[11px] text-amber-400">{pasteFeedback}</p>
              </div>
            )}
          </div>
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-zinc-400 hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-20 overflow-hidden min-w-[160px]">
                <button
                  type="button"
                  onClick={handleUrlSubmit}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
                >
                  <Link className="w-3.5 h-3.5" />
                  Image URL
                </button>
                <label className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  Upload File
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {images.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto py-1 mb-2">
          {images.map((img, index) => (
            <div
              key={img.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                'relative shrink-0 h-20 w-36 rounded-lg overflow-hidden group cursor-grab active:cursor-grabbing transition-all bg-black/40 border border-white/10',
                draggedIndex === index && 'opacity-40',
                dragOverIndex === index && draggedIndex !== index && 'ring-2 ring-sky-400'
              )}
            >
              <img
                src={img.url}
                alt={timeframe}
                draggable={false}
                className="w-full h-full object-cover pointer-events-none"
              />
              <button
                type="button"
                onClick={() => onPreviewImage(img.url)}
                className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 opacity-0 group-hover:opacity-100 transition-all"
                title="View full size"
              >
                <Eye className="w-4 h-4 text-white drop-shadow" />
              </button>
              {isExecution && index === 0 && (
                <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/70 rounded text-[9px] font-semibold text-sky-300 uppercase tracking-wide">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => onRemoveImage(img.id)}
                className="absolute top-1 right-1 p-1 bg-black/60 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showNotes && (
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Notes..."
          autoFocus
          className="w-full min-h-[80px] bg-zinc-700/50 border border-zinc-600/50 rounded-lg px-2 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 resize-y"
        />
      )}
    </div>
  );
};

// Detect symbol type for point calculation
