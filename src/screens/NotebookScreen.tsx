import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  X,
  Trash2,
  Pin,
  PinOff,
  Search,
  StickyNote,
  FolderPlus,
  Folder,
  RotateCcw,
  Filter,
  MoreHorizontal,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  ListChecks,
  Link2,
  Undo2,
  Redo2,
  ArrowUpDown,
  Star,
  Copy,
  Download,
  Printer,
  Bell,
  CheckSquare,
  Square,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  Rows3,
  Image as ImageIcon,
} from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import type { NotebookEntry, NotebookTemplate } from '../types';
import { NOTEBOOK_COVER_COLORS } from '../types';
import { cn } from '../utils/format';
import { useAppContext } from '../context/AppContext';

// Sentinel folder ids — not real folder names, never collide with a
// user-created one since folder names are validated/trimmed on create
// (see handleAddNotebookFolder).
const ALL_NOTES = '__all_notes__';
const FAVORITES = '__favorites__';
const RECENTLY_DELETED = '__recently_deleted__';

// Stable color per folder name (hashed), so a folder's swatch never
// changes across reloads even though we don't persist a color field.
const FOLDER_COLORS = [
  'bg-purple-500', 'bg-blue-500', 'bg-emerald-500', 'bg-pink-500',
  'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500',
];
const folderColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return FOLDER_COLORS[hash % FOLDER_COLORS.length];
};

// Maps a NOTEBOOK_COVER_COLORS id (e.g. 'purple') to the same swatch class
// the hash-based folderColor() above returns, so an explicitly-chosen color
// and the deterministic fallback render identically either way.
const FOLDER_COLOR_DOT_BY_ID: Record<string, string> = {
  purple: 'bg-purple-500', blue: 'bg-blue-500', emerald: 'bg-emerald-500', pink: 'bg-pink-500',
  amber: 'bg-amber-500', rose: 'bg-rose-500', cyan: 'bg-cyan-500', indigo: 'bg-indigo-500',
};

// Static Tailwind class map so the JIT scanner picks up every `text-*-500`
// class at build time (a computed `bg-x-500`.replace('bg-','text-') string
// wouldn't be statically discoverable). Used to tint the per-folder Folder
// icon with the same color as its bg-*-500 dot class.
const FOLDER_COLOR_TEXT_BY_BG: Record<string, string> = {
  'bg-purple-500': 'text-purple-500', 'bg-blue-500': 'text-blue-500', 'bg-emerald-500': 'text-emerald-500', 'bg-pink-500': 'text-pink-500',
  'bg-amber-500': 'text-amber-500', 'bg-rose-500': 'text-rose-500', 'bg-cyan-500': 'text-cyan-500', 'bg-indigo-500': 'text-indigo-500',
};
const toTextColorClass = (bgClass: string) => FOLDER_COLOR_TEXT_BY_BG[bgClass] ?? 'text-zinc-400';

// Selected/active row tint per folder color, keyed by the same bg-*-500
// string resolveFolderColor() returns — so a folder's highlight in the
// sidebar matches its own icon color instead of always being purple.
// Static literal map (not computed) so Tailwind's JIT scanner can find
// every class at build time.
const FOLDER_SELECTED_BY_BG: Record<string, { dark: string; light: string }> = {
  'bg-purple-500': { dark: 'bg-purple-500/10 text-purple-300', light: 'bg-purple-50 text-purple-700' },
  'bg-blue-500': { dark: 'bg-blue-500/10 text-blue-300', light: 'bg-blue-50 text-blue-700' },
  'bg-emerald-500': { dark: 'bg-emerald-500/10 text-emerald-300', light: 'bg-emerald-50 text-emerald-700' },
  'bg-pink-500': { dark: 'bg-pink-500/10 text-pink-300', light: 'bg-pink-50 text-pink-700' },
  'bg-amber-500': { dark: 'bg-amber-500/10 text-amber-300', light: 'bg-amber-50 text-amber-700' },
  'bg-rose-500': { dark: 'bg-rose-500/10 text-rose-300', light: 'bg-rose-50 text-rose-700' },
  'bg-cyan-500': { dark: 'bg-cyan-500/10 text-cyan-300', light: 'bg-cyan-50 text-cyan-700' },
  'bg-indigo-500': { dark: 'bg-indigo-500/10 text-indigo-300', light: 'bg-indigo-50 text-indigo-700' },
};
const toFolderSelectedClass = (bgClass: string, theme: string) =>
  (FOLDER_SELECTED_BY_BG[bgClass] ?? FOLDER_SELECTED_BY_BG['bg-purple-500'])[theme !== 'light' ? 'dark' : 'light'];

// Static Tailwind class map for note cover colors — kept as literal
// strings (not built with template literals) so Tailwind's JIT scanner
// picks them all up at build time.
const COVER_COLOR_CLASSES: Record<string, { dot: string; bar: string; text: string; bgSoft: string }> = {
  purple: { dot: 'bg-purple-500', bar: 'bg-purple-500', text: 'text-purple-400', bgSoft: 'bg-purple-500/10' },
  blue: { dot: 'bg-blue-500', bar: 'bg-blue-500', text: 'text-blue-400', bgSoft: 'bg-blue-500/10' },
  emerald: { dot: 'bg-emerald-500', bar: 'bg-emerald-500', text: 'text-emerald-400', bgSoft: 'bg-emerald-500/10' },
  pink: { dot: 'bg-pink-500', bar: 'bg-pink-500', text: 'text-pink-400', bgSoft: 'bg-pink-500/10' },
  amber: { dot: 'bg-amber-500', bar: 'bg-amber-500', text: 'text-amber-400', bgSoft: 'bg-amber-500/10' },
  rose: { dot: 'bg-rose-500', bar: 'bg-rose-500', text: 'text-rose-400', bgSoft: 'bg-rose-500/10' },
  cyan: { dot: 'bg-cyan-500', bar: 'bg-cyan-500', text: 'text-cyan-400', bgSoft: 'bg-cyan-500/10' },
  indigo: { dot: 'bg-indigo-500', bar: 'bg-indigo-500', text: 'text-indigo-400', bgSoft: 'bg-indigo-500/10' },
};

// Built-in starting points for "New note ▾". Purely UI-side content — no
// data-model change, they just seed the contentEditable body on create.
const NOTEBOOK_TEMPLATES: NotebookTemplate[] = [
  { id: 'blank', name: 'Blank note', description: 'Start from scratch', bodyHtml: '' },
  {
    id: 'daily-reflection', name: 'Daily Reflection', description: 'End-of-day trading reflection',
    bodyHtml: '<h3>What went well today?</h3><p><br></p><h3>What could improve?</h3><p><br></p><h3>Emotional state</h3><p><br></p>',
  },
  {
    id: 'gratitude', name: 'Gratitude List', description: '3 things you\u2019re grateful for',
    bodyHtml: '<h3>Gratitude</h3><ol><li><br></li><li><br></li><li><br></li></ol>',
  },
  {
    id: 'trade-postmortem', name: 'Trade Post-Mortem', description: 'Break down a specific trade',
    bodyHtml: '<h3>Setup</h3><p><br></p><h3>What I did right</h3><p><br></p><h3>What I did wrong</h3><p><br></p><h3>Lesson</h3><p><br></p>',
  },
];

// ----------------------------------------------------------------------------
// Body storage: `NotebookEntry.body` is just a `string` (no schema change),
// but this screen now treats it as a small HTML fragment produced by the
// rich-text toolbar below (execCommand on a contentEditable div — no new
// dependency). Notes saved by the OLD plain-textarea composer are still
// plain text, so anything without HTML tags is escaped + newline-converted
// the first time it's loaded here, and rendered/searched via stripHtml.
// ----------------------------------------------------------------------------
const looksLikeHtml = (s: string) => /<[a-z][\s\S]*>/i.test(s);

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const toEditableHtml = (body: string) =>
  looksLikeHtml(body) ? body : escapeHtml(body).replace(/\n/g, '<br>');

const stripHtml = (html: string) =>
  html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

const countWords = (html: string) => {
  const t = stripHtml(html).trim();
  return t ? t.split(/\s+/).length : 0;
};

const formatNoteHeading = (entry: NotebookEntry) => {
  if (entry.title.trim()) return entry.title;
  return new Date(entry.createdAt).toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
};

const formatShortDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, {
  month: '2-digit', day: '2-digit', year: 'numeric',
});

const formatFullDateTime = (iso: string) => new Date(iso).toLocaleString(undefined, {
  month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
});

// `datetime-local` inputs need "YYYY-MM-DDTHH:mm" in LOCAL time, not the
// ISO string's UTC representation.
const toDatetimeLocalValue = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// ----------------------------------------------------------------------------
// Nested folders: a folder "name" may contain '/' (e.g. "Trading/Setups"),
// which we render as a collapsible tree. This is purely a display-layer
// parse of the existing flat `notebookFolders: string[]` — no data-model
// change, so no migration. Selecting a parent node shows its own notes
// PLUS every descendant's (see visibleEntries below).
// ----------------------------------------------------------------------------
interface FolderNode {
  name: string;
  fullPath: string;
  children: FolderNode[];
}

const buildFolderTree = (folders: string[]): FolderNode[] => {
  const root: FolderNode[] = [];
  const map = new Map<string, FolderNode>();
  folders.forEach(full => {
    const parts = full.split('/').map(p => p.trim()).filter(Boolean);
    let path = '';
    let siblings = root;
    parts.forEach(part => {
      path = path ? `${path}/${part}` : part;
      let node = map.get(path);
      if (!node) {
        node = { name: part, fullPath: path, children: [] };
        map.set(path, node);
        siblings.push(node);
      }
      siblings = node.children;
    });
  });
  return root;
};

export function NotebookScreen() {
  const {
    theme, notebookEntries, notebookEntriesLoading, notebookFolders, notebookFolderColors,
    notebookDeletedFolders,
    handleAddNotebookEntry, handleUpdateNotebookEntry, handleToggleNotebookEntryPin,
    handleToggleNotebookEntryFavorite, handleDuplicateNotebookEntry,
    handleBulkMoveNotebookEntries, handleBulkSoftDeleteNotebookEntries, handleEmptyNotebookTrash,
    handleSoftDeleteNotebookEntry, handleRestoreNotebookEntry, handlePermanentDeleteNotebookEntry,
    handleAddNotebookFolder, handleDeleteNotebookFolder, handleSetNotebookFolderColor,
    handleReorderNotebookFolder, handleRestoreNotebookFolder, handlePermanentDeleteNotebookFolder,
  } = useAppContext();

  // ---- Local screen state ----
  const [activeFolder, setActiveFolder] = useState<string>(ALL_NOTES);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<'updated' | 'title' | 'created'>('updated');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState<string | null>(null);
  const [colorPickerFolder, setColorPickerFolder] = useState<string | null>(null);
  const [folderPendingDelete, setFolderPendingDelete] = useState<string | null>(null);
  // Clicking a trashed folder in Recently Deleted doesn't navigate straight
  // into it — its notes are soft-deleted too, so viewing them means
  // restoring first. This holds the folder name pending that confirmation.
  const [folderPendingRestore, setFolderPendingRestore] = useState<string | null>(null);
  const [deletedFolderPendingPermanentDelete, setDeletedFolderPendingPermanentDelete] = useState<string | null>(null);
  const [draggedFolder, setDraggedFolder] = useState<string | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [entryPendingDelete, setEntryPendingDelete] = useState<NotebookEntry | null>(null);
  const [confirmEmptyTrash, setConfirmEmptyTrash] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [entryPendingTrash, setEntryPendingTrash] = useState<NotebookEntry | null>(null);
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  // The toolbar scrolls horizontally (overflow-x-auto), which clips any
  // absolutely-positioned dropdown anchored inside it — the Style menu
  // was getting cut off/hidden behind the toolbar's own bounds. Rendering
  // it through a portal with fixed coordinates escapes that clipping.
  const [styleMenuPos, setStyleMenuPos] = useState({ top: 0, left: 0 });
  const styleButtonRef = useRef<HTMLButtonElement>(null);
  const [colorPickerPos, setColorPickerPos] = useState({ top: 0, left: 0 });
  const [showEntryFolderMenu, setShowEntryFolderMenu] = useState(false);
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  const [titleDraft, setTitleDraft] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const bodyRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<number | undefined>(undefined);
  const pendingNewNoteRef = useRef(false);
  const loadedEntryIdRef = useRef<string | null>(null);
  const savedRangeRef = useRef<Range | null>(null);

  const liveEntries = useMemo(() => notebookEntries.filter(e => !e.isDeleted), [notebookEntries]);
  const deletedEntries = useMemo(() => notebookEntries.filter(e => e.isDeleted), [notebookEntries]);
  const isTrashView = activeFolder === RECENTLY_DELETED;
  const isFavoritesView = activeFolder === FAVORITES;

  const allTags = useMemo(() => {
    const set = new Set<string>();
    liveEntries.forEach(e => e.tags.forEach(t => set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [liveEntries]);

  const folderTree = useMemo(() => buildFolderTree(notebookFolders), [notebookFolders]);

  const countForFolderPath = useCallback(
    (path: string) => liveEntries.filter(e => e.folder === path || e.folder.startsWith(`${path}/`)).length,
    [liveEntries]
  );

  const visibleEntries = useMemo(() => {
    const pool = isTrashView
      // Notes whose folder is itself in the trash are represented by that
      // folder's row (see the "Deleted folders" section above the list)
      // rather than listed flat here too — avoids showing the same note
      // twice and matches "restore the folder to see them" behavior.
      ? deletedEntries.filter(e => !notebookDeletedFolders.some(f => f.name === e.folder))
      : isFavoritesView
        ? liveEntries.filter(e => e.favorite)
        : activeFolder === ALL_NOTES
          ? liveEntries
          : liveEntries.filter(e => e.folder === activeFolder || e.folder.startsWith(`${activeFolder}/`));
    const q = search.trim().toLowerCase();
    const filtered = pool.filter(e => {
      const matchesSearch = !q
        || e.title.toLowerCase().includes(q)
        || stripHtml(e.body).toLowerCase().includes(q)
        || e.tags.some(t => t.toLowerCase().includes(q));
      const matchesTag = !activeTagFilter || e.tags.includes(activeTagFilter);
      return matchesSearch && matchesTag;
    });
    return filtered.sort((a, b) => {
      if (!isTrashView && a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (sortMode === 'title') return formatNoteHeading(a).localeCompare(formatNoteHeading(b));
      if (sortMode === 'created') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [activeFolder, isTrashView, isFavoritesView, liveEntries, deletedEntries, notebookDeletedFolders, search, activeTagFilter, sortMode]);

  const selectedEntry = useMemo(
    () => notebookEntries.find(e => e.id === selectedEntryId) ?? null,
    [notebookEntries, selectedEntryId]
  );

  // Keep selection valid as the visible list changes (folder switch, delete,
  // search, etc.) — fall back to the first visible note, or none.
  useEffect(() => {
    if (selectedEntryId && visibleEntries.some(e => e.id === selectedEntryId)) return;
    setSelectedEntryId(visibleEntries[0]?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFolder, isTrashView, visibleEntries.map(e => e.id).join(',')]);

  // Leaving multi-select mode (or switching where you're looking) drops any
  // in-progress selection rather than leaving stale ids selected.
  useEffect(() => {
    setSelectMode(false);
    setSelectedIds(new Set());
  }, [activeFolder]);

  // Auto-select a just-created note once it lands in notebookEntries — the
  // add handler updates local state synchronously (see useAppState.tsx), so
  // the newest-by-createdAt entry after a pending create is the new one.
  useEffect(() => {
    if (!pendingNewNoteRef.current) return;
    const newest = [...notebookEntries].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    if (newest) setSelectedEntryId(newest.id);
    pendingNewNoteRef.current = false;
  }, [notebookEntries]);

  // Load the selected entry into the editor whenever selection changes —
  // NOT on every keystroke, so the contentEditable's cursor never jumps.
  useEffect(() => {
    if (!selectedEntry) { loadedEntryIdRef.current = null; return; }
    if (loadedEntryIdRef.current === selectedEntry.id) return;
    loadedEntryIdRef.current = selectedEntry.id;
    setTitleDraft(selectedEntry.title);
    if (bodyRef.current) bodyRef.current.innerHTML = toEditableHtml(selectedEntry.body);
    setWordCount(countWords(selectedEntry.body));
    setTagInput('');
  }, [selectedEntry]);

  const scheduleSave = useCallback((patch: Partial<Pick<NotebookEntry, 'title' | 'body' | 'folder' | 'tags' | 'color' | 'reminderAt'>>) => {
    if (!selectedEntryId) return;
    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(() => {
      handleUpdateNotebookEntry(selectedEntryId, patch);
    }, 500);
  }, [selectedEntryId, handleUpdateNotebookEntry]);

  const flushSave = useCallback((patch: Partial<Pick<NotebookEntry, 'title' | 'body' | 'folder' | 'tags' | 'color' | 'reminderAt'>>) => {
    if (!selectedEntryId) return;
    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    handleUpdateNotebookEntry(selectedEntryId, patch);
  }, [selectedEntryId, handleUpdateNotebookEntry]);

  // Cmd/Ctrl+S forces an immediate save (overriding the debounce) instead of
  // letting the browser's "Save page" dialog pop up.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's' && selectedEntryId) {
        e.preventDefault();
        flushSave({ title: titleDraft, body: bodyRef.current?.innerHTML ?? '' });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedEntryId, titleDraft, flushSave]);

  // Without this, a pending debounced save (scheduleSave's 500ms timer) is
  // simply thrown away the instant the tab closes, refreshes, or the app
  // backgrounds — setTimeout never gets to fire once the page is gone. That
  // silently dropped whatever was typed in roughly the last half-second
  // before a refresh, which is exactly the "I typed a note and it's gone
  // after refresh" symptom. `visibilitychange`->hidden fires reliably on
  // refresh/close/tab-switch/backgrounding (including mobile), and fires
  // *before* the page is torn down, giving the flush's Supabase request a
  // real chance to complete — unlike `beforeunload`, which we also attach
  // as a last-resort backup but where in-flight requests are more likely to
  // get cut off.
  useEffect(() => {
    const flushPending = () => {
      if (!selectedEntryId || saveTimeoutRef.current === undefined) return;
      window.clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = undefined;
      flushSave({ title: titleDraft, body: bodyRef.current?.innerHTML ?? '' });
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flushPending();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('beforeunload', flushPending);
    window.addEventListener('pagehide', flushPending);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('beforeunload', flushPending);
      window.removeEventListener('pagehide', flushPending);
    };
  }, [selectedEntryId, titleDraft, flushSave]);

  // ---- New note / selection ----
  const createNote = (template?: NotebookTemplate) => {
    const folder = !isTrashView && activeFolder !== ALL_NOTES && activeFolder !== FAVORITES ? activeFolder : (notebookFolders[0] ?? '');
    pendingNewNoteRef.current = true;
    handleAddNotebookEntry({ title: '', body: template?.bodyHtml ?? '', folder, tags: [] });
    if (isTrashView || isFavoritesView) setActiveFolder(ALL_NOTES);
    setShowTemplateMenu(false);
  };

  // ---- Title / body editing ----
  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleDraft(e.target.value);
    scheduleSave({ title: e.target.value });
  };
  const onTitleBlur = () => flushSave({ title: titleDraft });

  const onBodyInput = () => {
    const html = bodyRef.current?.innerHTML ?? '';
    scheduleSave({ body: html });
    setWordCount(countWords(html));
  };
  const onBodyBlur = () => flushSave({ body: bodyRef.current?.innerHTML ?? '' });

  // Selection is lost the instant focus leaves the contentEditable div
  // (opening a <select>, clicking a color swatch, etc.), which breaks
  // execCommand-based toolbar actions. We snapshot the last real selection
  // on every mouseup/keyup inside the editor and restore it right before
  // running a command, so toolbar controls work no matter what stole focus
  // in between.
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && bodyRef.current?.contains(sel.anchorNode)) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const exec = (command: string, value?: string) => {
    bodyRef.current?.focus();
    const sel = window.getSelection();
    if (savedRangeRef.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
    document.execCommand(command, false, value);
    onBodyInput();
  };

  const insertLink = () => {
    const url = window.prompt('Link URL');
    if (url) exec('createLink', url);
  };

  // Real interactive checklist item — a native checkbox inside the
  // contentEditable div (clicking it toggles natively; CSS handles the
  // strikethrough via :checked, see the <style> block below).
  const insertChecklistItem = () => {
    exec('insertHTML', '<div class="notebook-checklist-item"><input type="checkbox" /><span>Checklist item</span></div><br>');
  };

  // Images are inserted as a single "atomic" block: an outer
  // contenteditable="false" wrapper around the <img>. A bare <img> dropped
  // straight into a contentEditable div (which is what the browser's
  // default paste behavior does) has no text node next to it, so the
  // browser can't figure out where to put the caret around it — Backspace/
  // Delete near it silently does nothing. Wrapping it as contenteditable
  //="false" makes the browser treat the whole block as one selectable
  // unit (same trick Notion/Google Docs use for embeds): click it to
  // select, Backspace/Delete removes it in one step, and we also add a
  // hover "x" button for an explicit, obvious way to remove it. The blank
  // paragraph after it guarantees there's always somewhere for the caret
  // to land so typing right after an image never gets stuck.
  const insertImageBlock = (dataUrl: string) => {
    exec(
      'insertHTML',
      `<div class="notebook-image-block" contenteditable="false"><img src="${dataUrl}" alt="" /><button type="button" class="notebook-image-delete" contenteditable="false" title="Remove image" aria-label="Remove image">&times;</button></div><p><br></p>`
    );
  };

  const openImagePicker = () => {
    saveSelection();
    imageInputRef.current?.click();
  };

  const onImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') insertImageBlock(reader.result);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // Pasting an image (screenshot, copied photo, etc.) inserts it as the
  // same atomic block as the toolbar button, instead of letting the
  // browser drop in a bare, undeletable <img>. Pasting anything else
  // (text copied from Word, a webpage, etc.) is deliberately flattened to
  // plain text — importing someone else's nested spans/styles is exactly
  // what makes later editing (especially deleting) unpredictable.
  const onBodyPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === 'string') insertImageBlock(reader.result);
            };
            reader.readAsDataURL(file);
          }
          return;
        }
      }
    }
    e.preventDefault();
    const text = e.clipboardData?.getData('text/plain') ?? '';
    if (text) exec('insertText', text);
  };

  // Keeps the `checked` DOM attribute (not just the live property) in sync
  // after a click, since innerHTML serialization — what we persist to
  // scheduleSave — only reflects attributes, not the live `.checked`
  // property.
  const onBodyClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('.notebook-image-delete')) {
      e.preventDefault();
      target.closest('.notebook-image-block')?.remove();
      onBodyInput();
      return;
    }
    if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox') {
      window.setTimeout(() => {
        const input = target as HTMLInputElement;
        if (input.checked) input.setAttribute('checked', ''); else input.removeAttribute('checked');
        onBodyInput();
      }, 0);
    }
  };

  const onBodyKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!(e.metaKey || e.ctrlKey)) return;
    const key = e.key.toLowerCase();
    if (key === 'b') { e.preventDefault(); exec('bold'); }
    else if (key === 'i') { e.preventDefault(); exec('italic'); }
    else if (key === 'u') { e.preventDefault(); exec('underline'); }
  };

  // ---- Tags ----
  const commitTag = (tag?: string) => {
    const trimmed = (tag ?? tagInput).trim();
    if (!selectedEntry || !trimmed || selectedEntry.tags.includes(trimmed)) { setTagInput(''); return; }
    flushSave({ tags: [...selectedEntry.tags, trimmed] });
    setTagInput('');
    setShowTagSuggestions(false);
  };
  const removeTag = (tag: string) => {
    if (!selectedEntry) return;
    flushSave({ tags: selectedEntry.tags.filter(t => t !== tag) });
  };

  // ---- Export / print / duplicate ----
  const exportNote = () => {
    if (!selectedEntry) return;
    const text = `${formatNoteHeading(selectedEntry)}\n\n${stripHtml(selectedEntry.body)}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formatNoteHeading(selectedEntry).replace(/[^\w\-]+/g, '_') || 'note'}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setShowMoreMenu(false);
  };

  const printNote = () => {
    if (!selectedEntry) return;
    const w = window.open('', '_blank');
    if (!w) return;
    const title = formatNoteHeading(selectedEntry);
    w.document.write(`<!doctype html><html><head><title>${title}</title><meta charset="utf-8" />` +
      '<style>body{font-family:sans-serif;max-width:700px;margin:2rem auto;line-height:1.6;} h1{margin-bottom:0.25rem;}</style>' +
      `</head><body><h1>${title}</h1>${selectedEntry.body}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
    setShowMoreMenu(false);
  };

  const duplicateNote = () => {
    if (!selectedEntry) return;
    handleDuplicateNotebookEntry(selectedEntry.id);
    setShowMoreMenu(false);
  };

  // ---- Bulk selection ----
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ---- Folder management ----
  const submitNewFolder = () => {
    const trimmed = newFolderName.trim();
    if (trimmed) handleAddNotebookFolder(trimmed, newFolderColor ?? undefined);
    setNewFolderName('');
    setNewFolderColor(null);
    setIsAddingFolder(false);
  };

  const confirmDeleteFolder = () => {
    if (!folderPendingDelete) return;
    if (activeFolder === folderPendingDelete) setActiveFolder(ALL_NOTES);
    handleDeleteNotebookFolder(folderPendingDelete);
    setFolderPendingDelete(null);
  };

  const suggestibleTags = allTags.filter(t => !selectedEntry?.tags.includes(t) && t.toLowerCase().includes(tagInput.toLowerCase()));

  const border = theme !== 'light' ? 'border-zinc-800' : 'border-zinc-200';
  const panelBg = theme !== 'light' ? 'bg-zinc-900/50' : 'bg-white';
  const textMuted = theme !== 'light' ? 'text-zinc-500' : 'text-zinc-400';
  const textBody = theme !== 'light' ? 'text-zinc-300' : 'text-zinc-700';

  const sortLabel = sortMode === 'updated' ? 'Last updated' : sortMode === 'title' ? 'Title' : 'Date created';
  const cycleSort = () => setSortMode(m => (m === 'updated' ? 'title' : m === 'title' ? 'created' : 'updated'));

  const resolveFolderColor = (name: string) => {
    const chosen = notebookFolderColors[name];
    return (chosen && FOLDER_COLOR_DOT_BY_ID[chosen]) || folderColor(name);
  };

  const renderFolderNode = (node: FolderNode, depth: number): React.ReactNode => {
    // Top-level folders are drag-reorderable (dropping onto another root
    // folder moves this one's whole subtree to sit just before it — see
    // reorderNotebookFolders in useAppState). Nested folders stay put
    // relative to their parent since drag targeting depth is ambiguous.
    const isDraggable = depth === 0;
    const isBeingDragged = draggedFolder === node.fullPath;
    const isDragOverTarget = dragOverFolder === node.fullPath && draggedFolder !== null && draggedFolder !== node.fullPath;
    const hasChildren = node.children.length > 0;
    const collapsed = collapsedFolders.has(node.fullPath);
    return (
      <div key={node.fullPath}>
        <div
          className={cn(
            'group/folder relative flex items-center gap-1 rounded-lg pl-2.5 pr-2.5 py-1 transition-colors',
            isBeingDragged && 'opacity-40',
            isDragOverTarget && (theme !== 'light' ? 'ring-1 ring-purple-500/50' : 'ring-1 ring-purple-400/60'),
            // Selection tint now lives on the whole row (icon included),
            // not just the name text, so the folder icon is highlighted
            // too when active instead of looking unselected next to it.
            activeFolder === node.fullPath
              ? toFolderSelectedClass(resolveFolderColor(node.fullPath), theme)
              : cn(textBody, theme !== 'light' ? 'hover:bg-zinc-800/60' : 'hover:bg-zinc-50')
          )}
          draggable={isDraggable}
          onDragStart={isDraggable ? (e) => { setDraggedFolder(node.fullPath); e.dataTransfer.effectAllowed = 'move'; } : undefined}
          onDragEnd={isDraggable ? () => { setDraggedFolder(null); setDragOverFolder(null); } : undefined}
          onDragOver={isDraggable ? (e) => { if (draggedFolder && draggedFolder !== node.fullPath) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverFolder(node.fullPath); } } : undefined}
          onDragLeave={isDraggable ? () => setDragOverFolder(prev => prev === node.fullPath ? null : prev) : undefined}
          onDrop={isDraggable ? (e) => {
            e.preventDefault();
            if (draggedFolder && draggedFolder !== node.fullPath) handleReorderNotebookFolder(draggedFolder, node.fullPath);
            setDraggedFolder(null);
            setDragOverFolder(null);
          } : undefined}
        >
          {isDraggable && (
            <span
              title="Drag to reorder"
              className={cn('flex-shrink-0 w-2.5 flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover/folder:opacity-40 hover:!opacity-90 transition-opacity', textMuted)}
              style={{ marginLeft: depth * 10 }}
            >
              <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor"><circle cx="2.5" cy="2.5" r="1.4" /><circle cx="7.5" cy="2.5" r="1.4" /><circle cx="2.5" cy="7" r="1.4" /><circle cx="7.5" cy="7" r="1.4" /><circle cx="2.5" cy="11.5" r="1.4" /><circle cx="7.5" cy="11.5" r="1.4" /></svg>
            </span>
          )}

          {/* Fixed-width leading slot for the collapse chevron — only
              reserved when there's actually a chevron to show (has
              children) or when nested (depth indent). Top-level leaf
              folders skip it entirely so their icon sits closer to
              flush left, lined up with the All notes / Favorites icons
              above. */}
          {(hasChildren || depth > 0) && (
            <div style={{ marginLeft: depth * 10 }} className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
              {hasChildren && (
                <button
                  onClick={() => setCollapsedFolders(prev => {
                    const next = new Set(prev);
                    if (next.has(node.fullPath)) next.delete(node.fullPath); else next.add(node.fullPath);
                    return next;
                  })}
                  className={cn('rounded', textMuted, 'hover:text-zinc-200')}
                >
                  {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          )}

          {/* Folder icon, tinted per-folder — its own button (not nested
              inside the folder-select button below, since a <button> can't
              contain another <button>) so every folder can be recolored
              after creation, not just at creation. */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (colorPickerFolder !== node.fullPath) {
                const rect = e.currentTarget.getBoundingClientRect();
                setColorPickerPos({ top: rect.bottom + 6, left: rect.left });
              }
              setColorPickerFolder(prev => prev === node.fullPath ? null : node.fullPath);
            }}
            title="Change folder color"
            className="flex-shrink-0 p-1 rounded-md hover:ring-2 hover:ring-zinc-600 transition-all"
          >
            <Folder className={cn('w-4 h-4', toTextColorClass(resolveFolderColor(node.fullPath)))} fill="currentColor" fillOpacity={0.18} />
          </button>

          <button
            onClick={() => { setActiveFolder(node.fullPath); setActiveTagFilter(null); }}
            className="flex-1 flex items-center px-1.5 py-1 text-base text-left min-w-0"
          >
            <span className="truncate flex-1">{node.name}</span>
          </button>

          {/* Count / delete share one fixed-size slot so the row never
              changes width on hover — the count fades out and the trash
              icon fades in on top of the exact same spot, instead of the
              delete button appearing as extra width next to the count
              (which pushed the number left and made rows misalign).
              Right-aligned (not centered) so the digits themselves land
              flush against the row's right padding — same anchor point
              the All notes / Favorites counts use — instead of sitting
              centered in the middle of this wider box. */}
          <div className="relative flex-shrink-0 w-7 h-7 flex items-center justify-end">
            <span className={cn('absolute right-0 text-xs transition-opacity duration-150', textMuted, 'group-hover/folder:opacity-0')}>
              {countForFolderPath(node.fullPath)}
            </span>
            <button
              onClick={() => setFolderPendingDelete(node.fullPath)}
              title="Delete folder"
              className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-md text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 transition-opacity duration-150 opacity-0 group-hover/folder:opacity-100 focus:opacity-100"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>


          {colorPickerFolder === node.fullPath && createPortal(
            <>
              {/* Click-away catcher — sits under the menu, above everything
                  else, so a click outside closes it without needing a
                  document-level listener. */}
              <div className="fixed inset-0 z-20" onClick={() => setColorPickerFolder(null)} />
              <div
                style={{ position: 'fixed', top: colorPickerPos.top, left: colorPickerPos.left }}
                className={cn(
                  'w-36 p-2 rounded-lg border shadow-xl z-30',
                  theme !== 'light' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                )}
              >
                <div className="grid grid-cols-4 gap-1.5">
                  {NOTEBOOK_COVER_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      title={c}
                      onClick={() => { handleSetNotebookFolderColor(node.fullPath, c); setColorPickerFolder(null); }}
                      className={cn(
                        'w-5 h-5 rounded-full flex-shrink-0 transition-transform',
                        FOLDER_COLOR_DOT_BY_ID[c],
                        notebookFolderColors[node.fullPath] === c ? 'ring-2 ring-offset-1 ring-purple-400 scale-110' : 'hover:scale-110'
                      )}
                    />
                  ))}
                  {/* Reset swatch — same grid, same size as the color dots,
                      so picking "automatic" feels like just another color
                      choice instead of a separate button bolted on below. */}
                  <button
                    type="button"
                    title="Automatic color"
                    onClick={() => { handleSetNotebookFolderColor(node.fullPath, undefined); setColorPickerFolder(null); }}
                    className={cn(
                      'w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-dashed transition-transform',
                      theme !== 'light' ? 'border-zinc-600' : 'border-zinc-300',
                      !notebookFolderColors[node.fullPath] ? 'ring-2 ring-offset-1 ring-purple-400 scale-110' : 'hover:scale-110'
                    )}
                  >
                    <X className={cn('w-3 h-3', textMuted)} />
                  </button>
                </div>
              </div>
            </>,
            document.body
          )}
        </div>
        {hasChildren && !collapsed && node.children.map(child => renderFolderNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div
      className="space-y-6 min-w-0"
      style={theme !== 'light'
        ? { ['--scrollbar-thumb' as any]: 'rgba(161,161,170,0.35)', ['--scrollbar-thumb-hover' as any]: 'rgba(161,161,170,0.55)', ['--scrollbar-track' as any]: 'transparent' }
        : { ['--scrollbar-thumb' as any]: 'rgba(113,113,122,0.3)', ['--scrollbar-thumb-hover' as any]: 'rgba(113,113,122,0.5)', ['--scrollbar-track' as any]: 'transparent' }}
    >
      <PageHeader
        title="Notebook"
        description="Your mindset notes, affirmations, and personal reflections"
        actions={
          <div className="relative flex items-center">
            {/* Single fused pill — same visual weight as "Add Entry" /
                "Add Notice" on every other screen. The template chevron is
                a second click-target inside the SAME rounded container
                (divided by a 1px hairline), not a separate detached
                button, so this still reads as one control at a glance. */}
            <div className="flex items-center bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white text-sm transition-colors overflow-hidden">
              <button
                type="button"
                onClick={() => createNote()}
                className="flex items-center gap-2 pl-3 sm:pl-4 pr-3 py-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Note</span>
              </button>
              <span className="w-px h-5 bg-white/10" />
              <button
                type="button"
                onClick={() => setShowTemplateMenu(v => !v)}
                title="New from template"
                className="flex items-center justify-center pl-2 pr-3 py-2 h-full"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
            {showTemplateMenu && (
              <div className={cn('absolute right-0 top-full mt-1.5 w-60 rounded-lg border shadow-xl z-20 py-1.5', theme !== 'light' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200')}>
                {NOTEBOOK_TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => createNote(t)}
                    className={cn('w-full text-left px-3.5 py-2 transition-colors', theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-50')}
                  >
                    <p className={cn('text-sm font-medium', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>{t.name}</p>
                    <p className={cn('text-xs', textMuted)}>{t.description}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        }
      />

      {/* Themed scrollbar — matches the page's dark/light theme instead of
          the browser's default (light-on-dark, or vice versa) scrollbar.
          Colors come from the --scrollbar-* vars set above based on `theme`,
          so every `.themed-scrollbar` pane below stays in sync automatically.
          NOTE: this must NOT be the first child of the space-y-6 container
          above — Tailwind's space-y-* adds margin-top to every child past
          the first, purely by DOM order, regardless of whether that child
          actually renders visibly. A <style> tag has zero visual height but
          still counts as "a child" for that purpose, so putting it first
          silently pushed PageHeader down by one full space-y gap (it was
          being treated as the "second" item). Keeping it after PageHeader
          avoids that. */}
      <style>{`
        .themed-scrollbar { scrollbar-width: thin; scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track); }
        .themed-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .themed-scrollbar::-webkit-scrollbar-track { background: var(--scrollbar-track); }
        .themed-scrollbar::-webkit-scrollbar-thumb { background-color: var(--scrollbar-thumb); border-radius: 9999px; }
        .themed-scrollbar::-webkit-scrollbar-thumb:hover { background-color: var(--scrollbar-thumb-hover); }
      `}</style>

      {/* ---- Search + filter row ---- */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex-1 max-w-md">
          <Search className={cn('absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4', textMuted)} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes and tags"
            className={cn('w-full pl-10 pr-3.5 py-2.5 rounded-lg text-base border outline-none', panelBg, border, theme !== 'light' ? 'text-white placeholder-zinc-500 focus:border-zinc-600' : 'text-zinc-900 placeholder-zinc-400 focus:border-zinc-300')}
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFilter(v => !v)}
            title="Filter by tag"
            className={cn('p-2.5 rounded-lg border transition-colors', panelBg, border, activeTagFilter ? 'text-purple-400 border-purple-500/40' : cn(textMuted, 'hover:text-zinc-200'))}
          >
            <Filter className="w-4 h-4" />
          </button>
          {showFilter && (
            <div className={cn('absolute right-0 mt-1.5 w-56 rounded-lg border shadow-xl z-20 p-2.5', theme !== 'light' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200')}>
              <p className={cn('text-xs font-semibold uppercase tracking-wider px-2 pb-1.5', textMuted)}>Filter by tag</p>
              {allTags.length === 0 ? (
                <p className={cn('text-sm px-2 py-1.5', textMuted)}>No tags yet</p>
              ) : (
                <div className="themed-scrollbar max-h-48 overflow-y-auto flex flex-col gap-1">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => { setActiveTagFilter(prev => prev === tag ? null : tag); setShowFilter(false); }}
                      className={cn(
                        'text-left px-2 py-1.5 rounded-md text-sm transition-colors',
                        activeTagFilter === tag
                          ? (theme !== 'light' ? 'bg-purple-500/15 text-purple-300' : 'bg-purple-50 text-purple-700')
                          : cn(textBody, theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-50')
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
              {activeTagFilter && (
                <button onClick={() => { setActiveTagFilter(null); setShowFilter(false); }} className="w-full text-left px-2 py-1.5 mt-1 rounded-md text-sm text-rose-400 hover:bg-zinc-800">
                  Clear filter
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ---- 3-pane layout ----
          `lg:h-[70vh]` (not just min-h) is the fix here: below lg the three
          panes stack vertically and the page itself scrolls, so a min-height
          is fine. At lg+ they sit side-by-side as a fixed-height grid row —
          each pane is a `flex flex-col` with an inner `flex-1 overflow-y-auto`
          region (folder rail, note list, editor body) that's meant to scroll
          on its own. That only works if this grid row has a bounded height;
          with min-height alone the row had no ceiling, so a long note body
          just kept growing the row (and the whole frame) instead of
          scrolling internally. Capping it with h-[70vh] at lg gives the
          flex-1 children something finite to fill and clip against. */}
      <div className={cn('flex flex-col lg:flex-row gap-3 min-h-[75vh] lg:h-[75vh]')}
      >
        {/* ==== Folder rail ==== */}
        <div className={cn('relative flex flex-col min-h-0 rounded-xl border overflow-hidden lg:w-[248px] lg:flex-shrink-0', border, panelBg)}>
          <div className={cn('p-3.5 border-b', border)}>
            {isAddingFolder ? (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <input
                    autoFocus
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') submitNewFolder(); if (e.key === 'Escape') { setIsAddingFolder(false); setNewFolderName(''); setNewFolderColor(null); } }}
                    placeholder="Folder name, or Parent/Child"
                    className={cn('flex-1 min-w-0 px-3 py-2 rounded-lg text-sm border outline-none', theme !== 'light' ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400')}
                  />
                  {/* Explicit confirm/cancel buttons, not just Enter/blur —
                      mousedown is prevented so clicking either doesn't blur
                      the input first and fire some other handler before the
                      click registers. */}
                  <button
                    type="button"
                    title="Add folder"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={submitNewFolder}
                    disabled={!newFolderName.trim()}
                    className={cn(
                      'flex-shrink-0 p-2 rounded-lg transition-colors',
                      newFolderName.trim()
                        ? (theme !== 'light' ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white')
                        : (theme !== 'light' ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-zinc-100 text-zinc-300 cursor-not-allowed')
                    )}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    title="Cancel"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { setIsAddingFolder(false); setNewFolderName(''); setNewFolderColor(null); }}
                    className={cn('flex-shrink-0 p-2 rounded-lg transition-colors', textMuted, theme !== 'light' ? 'hover:bg-zinc-800 hover:text-zinc-200' : 'hover:bg-zinc-100 hover:text-zinc-700')}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {/* Color swatches — mousedown is prevented so clicking one
                    doesn't blur the name input above. Leaving no swatch
                    selected keeps the old automatic hash-based color, so
                    picking one is optional, not required. */}
                <div className="flex items-center gap-1.5 px-0.5">
                  {NOTEBOOK_COVER_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      title={c}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setNewFolderColor(prev => prev === c ? null : c)}
                      className={cn(
                        'w-5 h-5 rounded-full flex-shrink-0 transition-transform',
                        FOLDER_COLOR_DOT_BY_ID[c],
                        newFolderColor === c ? 'ring-2 ring-offset-1 ring-purple-400 scale-110' : 'opacity-70 hover:opacity-100'
                      )}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingFolder(true)}
                className={cn(
                  'w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-colors',
                  theme !== 'light'
                    ? 'bg-zinc-800/80 hover:bg-zinc-800 border-zinc-700/80 text-white'
                    : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-900 text-white'
                )}
              >
                <FolderPlus className="w-4 h-4" />
                Add folder
              </button>
            )}
          </div>

          <div className="themed-scrollbar flex-1 min-h-0 overflow-y-auto p-2.5">
            <p className={cn('text-xs font-semibold uppercase tracking-wider px-2.5 pt-1 pb-1.5', textMuted)}>Folders</p>

            <button
              onClick={() => { setActiveFolder(ALL_NOTES); setActiveTagFilter(null); }}
              className={cn(
                'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-base text-left transition-colors',
                activeFolder === ALL_NOTES
                  ? (theme !== 'light' ? 'bg-purple-500/10 text-purple-300' : 'bg-purple-50 text-purple-700')
                  : cn(textBody, theme !== 'light' ? 'hover:bg-zinc-800/60' : 'hover:bg-zinc-50')
              )}
            >
              <StickyNote className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 truncate">All notes</span>
              <span className={cn('text-xs', textMuted)}>{liveEntries.length}</span>
            </button>

            <button
              onClick={() => { setActiveFolder(FAVORITES); setActiveTagFilter(null); }}
              className={cn(
                'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-base text-left transition-colors',
                isFavoritesView
                  ? (theme !== 'light' ? 'bg-purple-500/10 text-purple-300' : 'bg-purple-50 text-purple-700')
                  : cn(textBody, theme !== 'light' ? 'hover:bg-zinc-800/60' : 'hover:bg-zinc-50')
              )}
            >
              <Star className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 truncate">Favorites</span>
              <span className={cn('text-xs', textMuted)}>{liveEntries.filter(e => e.favorite).length}</span>
            </button>

            {folderTree.map(node => renderFolderNode(node, 0))}
          </div>

          {/* Recently Deleted — pinned as a footer row at the very bottom
              of the panel, outside the scrollable folder list, so it stays
              put no matter how many folders there are. Styled to match the
              inset pill rows above (rounded, same padding) instead of
              stretching edge-to-edge, which read as an inconsistent strip. */}
          <div className={cn('p-2.5 border-t flex-shrink-0', border)}>
            <button
              onClick={() => { setActiveFolder(RECENTLY_DELETED); setActiveTagFilter(null); }}
              className={cn(
                'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-left font-medium transition-colors',
                isTrashView
                  ? (theme !== 'light' ? 'bg-rose-500/10 text-rose-300' : 'bg-rose-50 text-rose-700')
                  : cn(textBody, theme !== 'light' ? 'hover:bg-zinc-800/60' : 'hover:bg-zinc-50')
              )}
            >
              <Trash2 className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 truncate">Recently Deleted</span>
              <span className={cn('text-xs', textMuted)}>{deletedEntries.length}</span>
            </button>
          </div>
        </div>

        {/* ==== Notes + editor frame ==== */}
        <div className={cn('grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-0 rounded-xl border overflow-hidden min-h-0 flex-1', border, panelBg)}>
        {/* ==== Note list ==== */}
        <div className={cn('flex flex-col min-h-0 border-b lg:border-b-0 lg:border-r', border)}>
          <div className={cn('flex items-center justify-between gap-2.5 p-3.5 border-b', border)}>
            {isTrashView ? (
              <div className="flex items-center justify-between w-full">
                <span className={cn('text-sm font-medium', textMuted)}>Recently Deleted</span>
                {(deletedEntries.length > 0 || notebookDeletedFolders.length > 0) && (
                  <button onClick={() => setConfirmEmptyTrash(true)} className="text-sm font-medium text-rose-400 hover:underline">
                    Empty Trash
                  </button>
                )}
              </div>
            ) : (
              <>
                <span className={cn('text-sm font-semibold truncate', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>
                  {activeFolder === ALL_NOTES ? 'All Notes' : activeFolder === FAVORITES ? 'Favorites' : activeFolder}
                </span>
                <div className={cn('flex items-center gap-0.5 rounded-full border p-0.5 flex-shrink-0', border, theme !== 'light' ? 'bg-zinc-900' : 'bg-white')}>
                  <button
                    onClick={() => setSelectMode(v => !v)}
                    title="Select notes"
                    className={cn(
                      'flex items-center justify-center w-7 h-7 rounded-full transition-colors',
                      selectMode
                        ? 'bg-purple-500/15 text-purple-400'
                        : cn(textMuted, theme !== 'light' ? 'hover:bg-zinc-800 hover:text-zinc-200' : 'hover:bg-zinc-100 hover:text-zinc-700')
                    )}
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode(v => v === 'list' ? 'grid' : 'list')}
                    title={viewMode === 'list' ? 'Grid view' : 'List view'}
                    className={cn('flex items-center justify-center w-7 h-7 rounded-full transition-colors', textMuted, theme !== 'light' ? 'hover:bg-zinc-800 hover:text-zinc-200' : 'hover:bg-zinc-100 hover:text-zinc-700')}
                  >
                    {viewMode === 'list' ? <LayoutGrid className="w-3.5 h-3.5" /> : <Rows3 className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={cycleSort}
                    title={`Sort: ${sortLabel}`}
                    className={cn('flex items-center justify-center w-7 h-7 rounded-full transition-colors', textMuted, theme !== 'light' ? 'hover:bg-zinc-800 hover:text-zinc-200' : 'hover:bg-zinc-100 hover:text-zinc-700')}
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>

          {selectMode && !isTrashView && (
            <div className={cn('flex items-center justify-between gap-2 px-3 py-2 border-b', border, theme !== 'light' ? 'bg-zinc-900/60' : 'bg-zinc-50')}>
              <div className="flex items-center gap-2 min-w-0">
                <span className={cn(
                  'flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold flex-shrink-0 transition-colors',
                  selectedIds.size > 0 ? 'bg-purple-500 text-white' : cn(theme !== 'light' ? 'bg-zinc-800' : 'bg-zinc-200', textMuted)
                )}>
                  {selectedIds.size}
                </span>
                <span className={cn('text-sm truncate', textMuted)}>selected</span>
              </div>

              <div className={cn('flex items-center gap-0.5 rounded-full border p-0.5 flex-shrink-0', border, theme !== 'light' ? 'bg-zinc-900' : 'bg-white')}>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => selectedIds.size > 0 && setShowMoveMenu(v => !v)}
                    disabled={selectedIds.size === 0}
                    title="Move to folder"
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-full transition-colors disabled:opacity-30 disabled:pointer-events-none',
                      showMoveMenu ? 'bg-purple-500/15 text-purple-400' : textMuted,
                      theme !== 'light' ? 'hover:bg-zinc-800 hover:text-zinc-200' : 'hover:bg-zinc-100 hover:text-zinc-700'
                    )}
                  >
                    <Folder className="w-4 h-4" />
                  </button>
                  {showMoveMenu && (
                    <div className={cn('absolute right-0 top-full mt-1.5 w-48 rounded-lg border shadow-xl z-20 py-1.5', theme !== 'light' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200')}>
                      <p className={cn('text-xs font-semibold uppercase tracking-wider px-3.5 pb-1', textMuted)}>Move to</p>
                      <div className="themed-scrollbar max-h-56 overflow-y-auto">
                        <button
                          onClick={() => {
                            handleBulkMoveNotebookEntries(Array.from(selectedIds), '');
                            setSelectedIds(new Set());
                            setShowMoveMenu(false);
                          }}
                          className={cn('w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left transition-colors', textBody, theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-50')}
                        >
                          <Folder className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">Uncategorized</span>
                        </button>
                        {notebookFolders.map(f => (
                          <button
                            key={f}
                            onClick={() => {
                              handleBulkMoveNotebookEntries(Array.from(selectedIds), f);
                              setSelectedIds(new Set());
                              setShowMoveMenu(false);
                            }}
                            className={cn('w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left transition-colors', textBody, theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-50')}
                          >
                            <Folder className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{f}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <span className={cn('w-px h-4', theme !== 'light' ? 'bg-zinc-800' : 'bg-zinc-200')} />
                <button
                  onClick={() => setConfirmBulkDelete(true)}
                  disabled={selectedIds.size === 0}
                  title="Delete"
                  className="flex items-center justify-center w-8 h-8 rounded-full text-rose-400 hover:bg-rose-500/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <span className={cn('w-px h-4', theme !== 'light' ? 'bg-zinc-800' : 'bg-zinc-200')} />
                <button
                  onClick={() => { setSelectMode(false); setSelectedIds(new Set()); setShowMoveMenu(false); }}
                  title="Cancel"
                  className={cn('flex items-center justify-center w-8 h-8 rounded-full transition-colors', textMuted, theme !== 'light' ? 'hover:bg-zinc-800 hover:text-zinc-200' : 'hover:bg-zinc-100 hover:text-zinc-700')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="themed-scrollbar flex-1 min-h-0 overflow-y-auto">
            {/* Trashed folders — shown above the trashed notes themselves.
                Clicking one doesn't jump straight to its notes (they're
                soft-deleted right along with the folder); it asks to
                restore first via folderPendingRestore below. */}
            {isTrashView && notebookDeletedFolders.length > 0 && (
              <div className={cn('p-2.5 border-b', border)}>
                <p className={cn('text-xs font-semibold uppercase tracking-wider px-1.5 pb-1.5', textMuted)}>Deleted folders</p>
                <div className="space-y-0.5">
                  {notebookDeletedFolders.map(f => {
                    const count = deletedEntries.filter(e => e.folder === f.name).length;
                    const colorClass = f.color ? FOLDER_COLOR_DOT_BY_ID[f.color] : folderColor(f.name);
                    return (
                      <div key={f.name} className="group/trashfolder relative flex items-center gap-1">
                        <button
                          onClick={() => setFolderPendingRestore(f.name)}
                          title="View this folder's notes (restores it)"
                          className={cn('flex-1 flex items-center gap-2.5 text-left text-sm min-w-0 rounded-lg px-1.5 py-2 transition-colors', textBody, theme !== 'light' ? 'hover:bg-zinc-800/60' : 'hover:bg-zinc-50')}
                        >
                          <Folder className={cn('w-4 h-4 flex-shrink-0', toTextColorClass(colorClass))} fill="currentColor" fillOpacity={0.18} />
                          <span className="truncate flex-1">{f.name}</span>
                          <span className={cn('text-xs flex-shrink-0', textMuted)}>{count}</span>
                        </button>
                        <button
                          onClick={() => setDeletedFolderPendingPermanentDelete(f.name)}
                          title="Delete folder forever"
                          className="flex-shrink-0 p-1.5 rounded-md text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover/trashfolder:opacity-100 focus:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {notebookEntriesLoading ? (
              <p className={cn('text-sm text-center py-12', textMuted)}>Loading your notes...</p>
            ) : visibleEntries.length === 0 ? (
              isTrashView && notebookDeletedFolders.length > 0 ? null : (
                <div className="text-center py-12 px-5">
                  <StickyNote className={cn('w-7 h-7 mx-auto mb-2', theme !== 'light' ? 'text-zinc-700' : 'text-zinc-300')} />
                  <p className={cn('text-sm', textMuted)}>
                    {isTrashView ? 'Recently Deleted is empty.' : isFavoritesView ? 'No favorites yet.' : 'No notes here yet.'}
                  </p>
                </div>
              )
            ) : viewMode === 'grid' && !isTrashView ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-2.5">
                {visibleEntries.map(entry => {
                  const cc = entry.color ? COVER_COLOR_CLASSES[entry.color] : null;
                  const isSelected = selectedEntryId === entry.id && !selectMode;
                  return (
                    <button
                      key={entry.id}
                      onClick={() => selectMode ? toggleSelect(entry.id) : setSelectedEntryId(entry.id)}
                      className={cn(
                        'text-left p-3.5 rounded-xl border flex flex-col gap-1.5 min-h-[112px] transition-all',
                        isSelected
                          ? (theme !== 'light' ? 'bg-purple-500/10 border-purple-500/40' : 'bg-purple-50 border-purple-200')
                          : cn(
                              theme !== 'light' ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-white border-zinc-200',
                              theme !== 'light' ? 'hover:bg-zinc-800/50 hover:border-zinc-700' : 'hover:bg-zinc-50 hover:border-zinc-300'
                            ),
                        cc?.bgSoft
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {selectMode && (selectedIds.has(entry.id) ? <CheckSquare className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" /> : <Square className={cn('w-3.5 h-3.5 flex-shrink-0', textMuted)} />)}
                        {entry.pinned && <Pin className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                        {entry.favorite && <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />}
                        <p className={cn('text-base font-semibold truncate flex-1', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>
                          {formatNoteHeading(entry)}
                        </p>
                      </div>
                      <p className={cn('text-sm truncate', textMuted)}>{stripHtml(entry.body) || 'Empty note'}</p>
                      <span className={cn('text-xs mt-auto w-fit px-1.5 py-0.5 rounded-md', theme !== 'light' ? 'bg-zinc-800/80 text-zinc-500' : 'bg-zinc-100 text-zinc-500')}>
                        {formatShortDate(entry.updatedAt)}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-2 p-2.5">
              {visibleEntries.map(entry => {
                const cc = entry.color ? COVER_COLOR_CLASSES[entry.color] : null;
                const overdue = !!entry.reminderAt && new Date(entry.reminderAt).getTime() < Date.now();
                const isSelected = selectedEntryId === entry.id && !selectMode;
                return (
                  <div
                    key={entry.id}
                    className={cn(
                      'group/note relative flex items-stretch rounded-xl border transition-all',
                      isSelected
                        ? (theme !== 'light' ? 'bg-purple-500/10 border-purple-500/40' : 'bg-purple-50 border-purple-200')
                        : cn(
                            theme !== 'light' ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-white border-zinc-200',
                            theme !== 'light' ? 'hover:bg-zinc-800/50 hover:border-zinc-700' : 'hover:bg-zinc-50 hover:border-zinc-300'
                          )
                    )}
                  >
                    {selectMode && !isTrashView && (
                      <button onClick={() => toggleSelect(entry.id)} className="flex items-center pl-3.5 flex-shrink-0">
                        {selectedIds.has(entry.id) ? <CheckSquare className="w-4 h-4 text-purple-400" /> : <Square className={cn('w-4 h-4', textMuted)} />}
                      </button>
                    )}
                    {cc && <span className={cn('w-1 flex-shrink-0 rounded-l-xl', cc.bar)} />}
                    <button
                      onClick={() => selectMode && !isTrashView ? toggleSelect(entry.id) : setSelectedEntryId(entry.id)}
                      className="flex-1 text-left px-4 py-3 min-w-0"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {entry.pinned && !isTrashView && <Pin className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                        {entry.favorite && !isTrashView && <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />}
                        <p className={cn('text-base font-semibold truncate', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>
                          {formatNoteHeading(entry)}
                        </p>
                      </div>
                      <p className={cn('text-sm truncate mb-2', textMuted)}>{stripHtml(entry.body) || 'Empty note'}</p>
                      <div className="flex items-center gap-2">
                        <span className={cn('text-xs px-1.5 py-0.5 rounded-md', theme !== 'light' ? 'bg-zinc-800/80 text-zinc-500' : 'bg-zinc-100 text-zinc-500')}>
                          {formatShortDate(entry.updatedAt)}
                        </span>
                        {entry.reminderAt && !isTrashView && (
                          <span className={cn(
                            'flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md',
                            overdue
                              ? 'bg-rose-500/15 text-rose-300'
                              : (theme !== 'light' ? 'bg-zinc-800/80 text-zinc-500' : 'bg-zinc-100 text-zinc-500')
                          )}>
                            <Bell className="w-3 h-3" />
                            {formatShortDate(entry.reminderAt)}
                          </span>
                        )}
                      </div>
                    </button>
                  </div>
                );
              })}
              </div>
            )}
          </div>
        </div>

        {/* ==== Editor / detail pane ==== */}
        <div className="flex flex-col min-h-0 min-w-0">
          {!selectedEntry ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2.5 p-8">
              <StickyNote className={cn('w-9 h-9', theme !== 'light' ? 'text-zinc-700' : 'text-zinc-300')} />
              <p className={cn('text-base', textMuted)}>
                {isTrashView ? 'Nothing selected' : 'Select a note, or create a new one'}
              </p>
            </div>
          ) : isTrashView ? (
            <div className="flex flex-col min-h-0 h-full">
              <div className={cn('flex items-center justify-between gap-3.5 px-6 py-5 border-b', border)}>
                <h2 className={cn('text-xl font-semibold truncate', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>
                  {formatNoteHeading(selectedEntry)}
                </h2>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleRestoreNotebookEntry(selectedEntry.id)}
                    className={cn('flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors', theme !== 'light' ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700')}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restore
                  </button>
                  <button
                    onClick={() => setEntryPendingDelete(selectedEntry)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete forever
                  </button>
                </div>
              </div>
              <div className="themed-scrollbar flex-1 min-h-0 overflow-y-auto p-6">
                {selectedEntry.deletedAt && (
                  <p className={cn('text-sm mb-3', textMuted)}>
                    Deleted {formatFullDateTime(selectedEntry.deletedAt)} &middot; auto-purges 30 days after deletion
                  </p>
                )}
                <p className={cn('text-base leading-relaxed whitespace-pre-wrap', textBody)}>
                  {stripHtml(selectedEntry.body) || <span className="italic opacity-60">Empty note</span>}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col min-h-0 h-full min-w-0">
              {selectedEntry.color && <div className={cn('h-1 flex-shrink-0', COVER_COLOR_CLASSES[selectedEntry.color]?.bar)} />}
              {/* Title + meta + more menu */}
              <div className={cn('px-6 pt-4 pb-3 border-b', border)}>
                <div className="flex items-start justify-between gap-3.5">
                  <input
                    value={titleDraft}
                    onChange={onTitleChange}
                    onBlur={onTitleBlur}
                    placeholder="Untitled"
                    className={cn('flex-1 min-w-0 bg-transparent outline-none text-xl font-semibold', theme !== 'light' ? 'text-white placeholder-zinc-600' : 'text-zinc-900 placeholder-zinc-300')}
                  />
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setShowMoreMenu(v => !v)}
                      className={cn('p-2 rounded-md transition-colors', textMuted, 'hover:text-zinc-200')}
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    {showMoreMenu && (
                      <div className={cn('absolute right-0 mt-1 w-64 rounded-lg border shadow-xl z-20 py-1.5', theme !== 'light' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200')}>
                        <button
                          onClick={() => { handleToggleNotebookEntryPin(selectedEntry.id); setShowMoreMenu(false); }}
                          className={cn('w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left transition-colors', textBody, theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-50')}
                        >
                          {selectedEntry.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                          {selectedEntry.pinned ? 'Unpin note' : 'Pin note'}
                        </button>
                        <button
                          onClick={() => { handleToggleNotebookEntryFavorite(selectedEntry.id); setShowMoreMenu(false); }}
                          className={cn('w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left transition-colors', textBody, theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-50')}
                        >
                          <Star className={cn('w-4 h-4', selectedEntry.favorite && 'fill-amber-400 text-amber-400')} />
                          {selectedEntry.favorite ? 'Remove from favorites' : 'Add to favorites'}
                        </button>
                        <button
                          onClick={duplicateNote}
                          className={cn('w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left transition-colors', textBody, theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-50')}
                        >
                          <Copy className="w-4 h-4" />
                          Duplicate note
                        </button>
                        <button
                          onClick={exportNote}
                          className={cn('w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left transition-colors', textBody, theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-50')}
                        >
                          <Download className="w-4 h-4" />
                          Export as .txt
                        </button>
                        <button
                          onClick={printNote}
                          className={cn('w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left transition-colors', textBody, theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-50')}
                        >
                          <Printer className="w-4 h-4" />
                          Print note
                        </button>

                        <div className={cn('my-1 border-t', border)} />

                        <div className="px-3.5 py-2">
                          <p className={cn('text-xs font-semibold uppercase tracking-wider mb-1.5', textMuted)}>Cover color</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => flushSave({ color: undefined })}
                              title="No color"
                              className={cn('w-5 h-5 rounded-full border flex items-center justify-center', border, !selectedEntry.color && 'ring-2 ring-offset-1 ring-purple-400')}
                            >
                              <X className={cn('w-3 h-3', textMuted)} />
                            </button>
                            {NOTEBOOK_COVER_COLORS.map(c => (
                              <button
                                key={c}
                                onClick={() => flushSave({ color: c })}
                                title={c}
                                className={cn('w-5 h-5 rounded-full', COVER_COLOR_CLASSES[c].dot, selectedEntry.color === c && 'ring-2 ring-offset-1 ring-purple-400')}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="px-3.5 py-2">
                          <p className={cn('text-xs font-semibold uppercase tracking-wider mb-1.5', textMuted)}>Reminder</p>
                          <div className="flex items-center gap-2">
                            <input
                              type="datetime-local"
                              value={toDatetimeLocalValue(selectedEntry.reminderAt)}
                              onChange={(e) => flushSave({ reminderAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                              className={cn('flex-1 min-w-0 text-sm border rounded-md px-2 py-1.5 outline-none bg-transparent', border, textBody)}
                            />
                            {selectedEntry.reminderAt && (
                              <button onClick={() => flushSave({ reminderAt: undefined })} title="Clear reminder" className={cn(textMuted, 'hover:text-rose-400')}>
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className={cn('my-1 border-t', border)} />

                        <button
                          onClick={() => { setEntryPendingTrash(selectedEntry); setShowMoreMenu(false); }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left text-rose-400 hover:bg-zinc-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete note
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3.5 mt-1 flex-wrap">
                  <p className={cn('text-sm', textMuted)}>
                    Created {formatFullDateTime(selectedEntry.createdAt)} &middot; Last updated {formatFullDateTime(selectedEntry.updatedAt)}
                  </p>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEntryFolderMenu(v => !v)}
                      className={cn('flex items-center gap-1 text-sm transition-colors', textMuted, 'hover:text-zinc-300')}
                    >
                      {selectedEntry.folder || 'Uncategorized'}
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    {showEntryFolderMenu && (
                      <div className={cn('absolute left-0 top-full mt-1.5 w-52 rounded-lg border shadow-xl z-20 py-1.5', theme !== 'light' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200')}>
                        <div className="themed-scrollbar max-h-56 overflow-y-auto">
                          <button
                            onClick={() => { flushSave({ folder: '' }); setShowEntryFolderMenu(false); }}
                            className={cn(
                              'w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left transition-colors',
                              !selectedEntry.folder
                                ? (theme !== 'light' ? 'bg-purple-500/15 text-purple-300' : 'bg-purple-50 text-purple-700')
                                : cn(textBody, theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-50')
                            )}
                          >
                            <Folder className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">Uncategorized</span>
                          </button>
                          {notebookFolders.map(folder => (
                            <button
                              key={folder}
                              onClick={() => { flushSave({ folder }); setShowEntryFolderMenu(false); }}
                              className={cn(
                                'w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left transition-colors',
                                folder === selectedEntry.folder
                                  ? (theme !== 'light' ? 'bg-purple-500/15 text-purple-300' : 'bg-purple-50 text-purple-700')
                                  : cn(textBody, theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-50')
                              )}
                            >
                              <Folder className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{folder}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {selectedEntry.reminderAt && (
                    <span className={cn('flex items-center gap-1.5 text-sm', new Date(selectedEntry.reminderAt).getTime() < Date.now() ? 'text-rose-400' : textMuted)}>
                      <Bell className="w-3.5 h-3.5" />
                      {formatFullDateTime(selectedEntry.reminderAt)}
                    </span>
                  )}
                </div>
              </div>

              {/* Formatting toolbar */}
              <div className={cn('flex items-center gap-1 px-5 py-2 border-b overflow-x-auto', border)}>
                <div className="relative flex-shrink-0">
                  <button
                    ref={styleButtonRef}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); saveSelection(); }}
                    onClick={() => {
                      if (!showStyleMenu) {
                        const rect = styleButtonRef.current?.getBoundingClientRect();
                        if (rect) setStyleMenuPos({ top: rect.bottom + 6, left: rect.left });
                      }
                      setShowStyleMenu(v => !v);
                    }}
                    title="Text style"
                    className={cn('flex items-center gap-1 text-sm bg-transparent border rounded-md pl-2.5 pr-1.5 py-1.5 outline-none cursor-pointer', border, textMuted)}
                  >
                    Style
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {showStyleMenu && createPortal(
                    <>
                      {/* Click-away catcher — sits under the menu, above everything
                          else, so a click outside closes it without needing a
                          document-level listener. */}
                      <div className="fixed inset-0 z-20" onClick={() => setShowStyleMenu(false)} />
                      <div
                        style={{ position: 'fixed', top: styleMenuPos.top, left: styleMenuPos.left }}
                        className={cn('w-40 rounded-lg border shadow-xl z-30 py-1.5', theme !== 'light' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200')}
                      >
                        {[
                          { value: 'P', label: 'Paragraph' },
                          { value: 'H1', label: 'Heading 1' },
                          { value: 'H2', label: 'Heading 2' },
                          { value: 'H3', label: 'Heading 3' },
                        ].map(({ value, label }) => (
                          <button
                            key={value}
                            onMouseDown={(e) => { e.preventDefault(); }}
                            onClick={() => { exec('formatBlock', value); setShowStyleMenu(false); }}
                            className={cn('w-full px-3.5 py-2 text-sm text-left transition-colors', textBody, theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-50')}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </>,
                    document.body
                  )}
                </div>
                <div className={cn('w-px h-5 mx-1', theme !== 'light' ? 'bg-zinc-800' : 'bg-zinc-200')} />
                {[
                  { icon: Bold, cmd: 'bold', title: 'Bold' },
                  { icon: Italic, cmd: 'italic', title: 'Italic' },
                  { icon: Underline, cmd: 'underline', title: 'Underline' },
                  { icon: Strikethrough, cmd: 'strikeThrough', title: 'Strikethrough' },
                ].map(({ icon: Icon, cmd, title }) => (
                  <button key={cmd} onMouseDown={(e) => { e.preventDefault(); saveSelection(); }} onClick={() => exec(cmd)} title={title}
                    className={cn('p-2 rounded-md transition-colors', textMuted, 'hover:text-zinc-200', theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100')}>
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
                <input
                  type="color"
                  title="Text color"
                  onMouseDown={saveSelection}
                  onChange={(e) => exec('foreColor', e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0 flex-shrink-0"
                />
                <input
                  type="color"
                  title="Highlight color"
                  onMouseDown={saveSelection}
                  onChange={(e) => exec('hiliteColor', e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0 flex-shrink-0"
                />
                <div className={cn('w-px h-5 mx-1', theme !== 'light' ? 'bg-zinc-800' : 'bg-zinc-200')} />
                {[
                  { icon: AlignLeft, cmd: 'justifyLeft', title: 'Align left' },
                  { icon: AlignCenter, cmd: 'justifyCenter', title: 'Align center' },
                  { icon: AlignRight, cmd: 'justifyRight', title: 'Align right' },
                ].map(({ icon: Icon, cmd, title }) => (
                  <button key={cmd} onMouseDown={(e) => { e.preventDefault(); saveSelection(); }} onClick={() => exec(cmd)} title={title}
                    className={cn('p-2 rounded-md transition-colors', textMuted, 'hover:text-zinc-200', theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100')}>
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
                <div className={cn('w-px h-5 mx-1', theme !== 'light' ? 'bg-zinc-800' : 'bg-zinc-200')} />
                <button onMouseDown={(e) => { e.preventDefault(); saveSelection(); }} onClick={() => exec('insertUnorderedList')} title="Bulleted list"
                  className={cn('p-2 rounded-md transition-colors', textMuted, 'hover:text-zinc-200', theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100')}>
                  <List className="w-4 h-4" />
                </button>
                <button onMouseDown={(e) => { e.preventDefault(); saveSelection(); }} onClick={() => exec('insertOrderedList')} title="Numbered list"
                  className={cn('p-2 rounded-md transition-colors', textMuted, 'hover:text-zinc-200', theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100')}>
                  <ListOrdered className="w-4 h-4" />
                </button>
                <button onMouseDown={(e) => { e.preventDefault(); saveSelection(); }} onClick={insertChecklistItem} title="Checklist item"
                  className={cn('p-2 rounded-md transition-colors', textMuted, 'hover:text-zinc-200', theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100')}>
                  <ListChecks className="w-4 h-4" />
                </button>
                <button onMouseDown={(e) => { e.preventDefault(); saveSelection(); }} onClick={() => exec('formatBlock', 'BLOCKQUOTE')} title="Quote"
                  className={cn('p-2 rounded-md transition-colors', textMuted, 'hover:text-zinc-200', theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100')}>
                  <Quote className="w-4 h-4" />
                </button>
                <div className={cn('w-px h-5 mx-1', theme !== 'light' ? 'bg-zinc-800' : 'bg-zinc-200')} />
                <button onMouseDown={(e) => { e.preventDefault(); saveSelection(); }} onClick={insertLink} title="Insert link"
                  className={cn('p-2 rounded-md transition-colors', textMuted, 'hover:text-zinc-200', theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100')}>
                  <Link2 className="w-4 h-4" />
                </button>
                <button onMouseDown={(e) => e.preventDefault()} onClick={openImagePicker} title="Insert image"
                  className={cn('p-2 rounded-md transition-colors', textMuted, 'hover:text-zinc-200', theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100')}>
                  <ImageIcon className="w-4 h-4" />
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onImageFileChange}
                  className="hidden"
                />
                <div className={cn('w-px h-5 mx-1', theme !== 'light' ? 'bg-zinc-800' : 'bg-zinc-200')} />
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec('undo')} title="Undo"
                  className={cn('p-2 rounded-md transition-colors', textMuted, 'hover:text-zinc-200', theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100')}>
                  <Undo2 className="w-4 h-4" />
                </button>
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec('redo')} title="Redo"
                  className={cn('p-2 rounded-md transition-colors', textMuted, 'hover:text-zinc-200', theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100')}>
                  <Redo2 className="w-4 h-4" />
                </button>
                <span className={cn('ml-auto text-xs flex-shrink-0 pl-3 whitespace-nowrap', textMuted)}>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
              </div>

              {/* Body */}
              <div className="themed-scrollbar flex-1 min-h-0 overflow-y-auto px-6 py-5">
                <div
                  ref={bodyRef}
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck={false}
                  onInput={onBodyInput}
                  onBlur={onBodyBlur}
                  onClick={onBodyClick}
                  onKeyDown={onBodyKeyDown}
                  onPaste={onBodyPaste}
                  onMouseUp={saveSelection}
                  onKeyUp={saveSelection}
                  data-placeholder="Write your note... (Ctrl/Cmd+B/I/U, Ctrl/Cmd+S to save)"
                  className={cn(
                    'notebook-editable min-h-[240px] text-base leading-relaxed outline-none',
                    textBody
                  )}
                />
              </div>

              {/* Tags */}
              <div className={cn('flex flex-wrap items-center gap-2 px-6 py-3.5 border-t', border)}>
                {selectedEntry.tags.map(tag => (
                  <span key={tag} className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border', theme !== 'light' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' : 'bg-purple-50 text-purple-600 border-purple-200')}>
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-rose-400 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <div className="relative">
                  <input
                    value={tagInput}
                    onChange={(e) => { setTagInput(e.target.value); setShowTagSuggestions(true); }}
                    onFocus={() => setShowTagSuggestions(true)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitTag(); } if (e.key === 'Escape') setShowTagSuggestions(false); }}
                    onBlur={() => window.setTimeout(() => setShowTagSuggestions(false), 120)}
                    placeholder="Add tag"
                    className={cn('px-2.5 py-1.5 rounded-full text-sm border outline-none w-28 focus:w-40 transition-all', theme !== 'light' ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:border-zinc-600' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-300')}
                  />
                  {showTagSuggestions && suggestibleTags.length > 0 && (
                    <div className={cn('themed-scrollbar absolute bottom-full left-0 mb-1.5 w-44 rounded-lg border shadow-xl z-20 py-1.5 max-h-40 overflow-y-auto', theme !== 'light' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200')}>
                      {suggestibleTags.map(tag => (
                        <button
                          key={tag}
                          onMouseDown={(e) => { e.preventDefault(); commitTag(tag); }}
                          className={cn('w-full text-left px-3.5 py-1.5 text-sm transition-colors', textBody, theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-50')}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>

      <style>{`
        .notebook-editable:empty::before {
          content: attr(data-placeholder);
          color: ${theme !== 'light' ? '#71717a' : '#a1a1aa'};
        }
        .notebook-editable ul { list-style: disc; padding-left: 1.25rem; }
        .notebook-editable ol { list-style: decimal; padding-left: 1.25rem; }
        .notebook-editable img { max-width: 100%; height: auto; border-radius: 0.5rem; }
        .notebook-editable .notebook-image-block {
          position: relative;
          display: block;
          max-width: 100%;
          margin: 0.6rem 0;
          line-height: 0;
        }
        .notebook-editable .notebook-image-block img {
          display: block;
          max-width: 100%;
          border-radius: 0.6rem;
        }
        .notebook-editable .notebook-image-block .notebook-image-delete {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 26px;
          height: 26px;
          border-radius: 9999px;
          border: none;
          background: rgba(0,0,0,0.65);
          color: #fff;
          font-size: 16px;
          line-height: 1;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.15s ease;
        }
        .notebook-editable .notebook-image-block:hover .notebook-image-delete,
        .notebook-editable .notebook-image-block:focus .notebook-image-delete {
          opacity: 1;
        }
        .notebook-editable .notebook-image-block::selection,
        .notebook-editable .notebook-image-block *::selection {
          background: transparent;
        }
        .notebook-editable a { color: ${theme !== 'light' ? '#c4b5fd' : '#7c3aed'}; text-decoration: underline; }
        .notebook-editable h1 { font-size: 1.6rem; font-weight: 700; margin: 0.75rem 0; }
        .notebook-editable h2 { font-size: 1.35rem; font-weight: 700; margin: 0.6rem 0; }
        .notebook-editable h3 { font-size: 1.15rem; font-weight: 600; margin: 0.5rem 0; }
        .notebook-editable blockquote {
          border-left: 3px solid ${theme !== 'light' ? '#a78bfa' : '#7c3aed'};
          padding-left: 0.875rem;
          margin: 0.6rem 0;
          opacity: 0.85;
        }
        .notebook-editable .notebook-checklist-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin: 4px 0;
        }
        .notebook-editable .notebook-checklist-item input[type="checkbox"] {
          margin-top: 4px;
          cursor: pointer;
        }
        .notebook-editable .notebook-checklist-item input[type="checkbox"]:checked + span {
          text-decoration: line-through;
          opacity: 0.6;
        }
      `}</style>

      {/* ---- Delete folder confirm ---- */}
      {folderPendingDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-5" onClick={() => setFolderPendingDelete(null)}>
          <div className={cn('rounded-xl max-w-sm w-full border p-6', theme !== 'light' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200')} onClick={(e) => e.stopPropagation()}>
            <h3 className={cn('text-base font-semibold mb-2', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>Delete "{folderPendingDelete}"?</h3>
            <p className="text-sm text-zinc-500 mb-4 leading-relaxed">
              This folder and its notes will move to Recently Deleted together — you can restore them from there, or they'll be permanently removed after 30 days. Sub-folders aren't deleted automatically.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button onClick={() => setFolderPendingDelete(null)} className={cn('px-4 py-2 rounded-lg text-sm', theme !== 'light' ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700')}>
                Cancel
              </button>
              <button onClick={confirmDeleteFolder} className="px-4 py-2 rounded-lg text-sm font-medium bg-rose-600 hover:bg-rose-500 text-white">
                Delete Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Restore folder confirm (viewing a trashed folder's notes) ---- */}
      {folderPendingRestore && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-5" onClick={() => setFolderPendingRestore(null)}>
          <div className={cn('rounded-xl max-w-sm w-full border p-6', theme !== 'light' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200')} onClick={(e) => e.stopPropagation()}>
            <h3 className={cn('text-base font-semibold mb-2', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>Restore "{folderPendingRestore}"?</h3>
            <p className="text-sm text-zinc-500 mb-4 leading-relaxed">
              This folder is in Recently Deleted, so its notes are too — restore it to bring the folder and its notes back and open it.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button onClick={() => setFolderPendingRestore(null)} className={cn('px-4 py-2 rounded-lg text-sm', theme !== 'light' ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700')}>
                Cancel
              </button>
              <button
                onClick={() => {
                  handleRestoreNotebookFolder(folderPendingRestore);
                  setActiveFolder(folderPendingRestore);
                  setActiveTagFilter(null);
                  setFolderPendingRestore(null);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white"
              >
                Restore & Open
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Permanently delete a trashed folder (+ its still-trashed notes) ---- */}
      {deletedFolderPendingPermanentDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-5" onClick={() => setDeletedFolderPendingPermanentDelete(null)}>
          <div className={cn('rounded-xl max-w-sm w-full border p-6', theme !== 'light' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200')} onClick={(e) => e.stopPropagation()}>
            <h3 className={cn('text-base font-semibold mb-2', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>Delete "{deletedFolderPendingPermanentDelete}" forever?</h3>
            <p className="text-sm text-zinc-500 mb-4 leading-relaxed">
              This permanently deletes this folder and every note still in it. This can't be undone.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button onClick={() => setDeletedFolderPendingPermanentDelete(null)} className={cn('px-4 py-2 rounded-lg text-sm', theme !== 'light' ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700')}>
                Cancel
              </button>
              <button
                onClick={() => { handlePermanentDeleteNotebookFolder(deletedFolderPendingPermanentDelete); setDeletedFolderPendingPermanentDelete(null); }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-rose-600 hover:bg-rose-500 text-white"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Permanent delete confirm ---- */}
      {entryPendingDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-5" onClick={() => setEntryPendingDelete(null)}>
          <div className={cn('rounded-xl max-w-sm w-full border p-6', theme !== 'light' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200')} onClick={(e) => e.stopPropagation()}>
            <h3 className={cn('text-base font-semibold mb-2', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>Delete forever?</h3>
            <p className="text-sm text-zinc-500 mb-4 leading-relaxed">
              This permanently deletes "{entryPendingDelete.title || 'this note'}". This can't be undone.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button onClick={() => setEntryPendingDelete(null)} className={cn('px-4 py-2 rounded-lg text-sm', theme !== 'light' ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700')}>
                Cancel
              </button>
              <button
                onClick={() => { handlePermanentDeleteNotebookEntry(entryPendingDelete.id); setEntryPendingDelete(null); }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-rose-600 hover:bg-rose-500 text-white"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Empty trash confirm ---- */}
      {confirmEmptyTrash && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-5" onClick={() => setConfirmEmptyTrash(false)}>
          <div className={cn('rounded-xl max-w-sm w-full border p-6', theme !== 'light' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200')} onClick={(e) => e.stopPropagation()}>
            <h3 className={cn('text-base font-semibold mb-2', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>Empty trash?</h3>
            <p className="text-sm text-zinc-500 mb-4 leading-relaxed">
              This permanently deletes all {deletedEntries.length} note{deletedEntries.length === 1 ? '' : 's'}
              {notebookDeletedFolders.length > 0 && <> and {notebookDeletedFolders.length} folder{notebookDeletedFolders.length === 1 ? '' : 's'}</>} in Recently Deleted. This can't be undone.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button onClick={() => setConfirmEmptyTrash(false)} className={cn('px-4 py-2 rounded-lg text-sm', theme !== 'light' ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700')}>
                Cancel
              </button>
              <button
                onClick={() => { handleEmptyNotebookTrash(); setConfirmEmptyTrash(false); }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-rose-600 hover:bg-rose-500 text-white"
              >
                Empty Trash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Single note delete (move to trash) confirm ---- */}
      {entryPendingTrash && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-5" onClick={() => setEntryPendingTrash(null)}>
          <div className={cn('rounded-xl max-w-sm w-full border p-6', theme !== 'light' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200')} onClick={(e) => e.stopPropagation()}>
            <h3 className={cn('text-base font-semibold mb-2', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>Delete note?</h3>
            <p className="text-sm text-zinc-500 mb-4 leading-relaxed">
              "{entryPendingTrash.title || formatNoteHeading(entryPendingTrash)}" will be moved to Recently Deleted, where you can restore it later.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button onClick={() => setEntryPendingTrash(null)} className={cn('px-4 py-2 rounded-lg text-sm', theme !== 'light' ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700')}>
                Cancel
              </button>
              <button
                onClick={() => { handleSoftDeleteNotebookEntry(entryPendingTrash.id); setEntryPendingTrash(null); }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-rose-600 hover:bg-rose-500 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Bulk delete (select mode) confirm ---- */}
      {confirmBulkDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-5" onClick={() => setConfirmBulkDelete(false)}>
          <div className={cn('rounded-xl max-w-sm w-full border p-6', theme !== 'light' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200')} onClick={(e) => e.stopPropagation()}>
            <h3 className={cn('text-base font-semibold mb-2', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>
              Delete {selectedIds.size} note{selectedIds.size === 1 ? '' : 's'}?
            </h3>
            <p className="text-sm text-zinc-500 mb-4 leading-relaxed">
              {selectedIds.size === 1 ? 'This note' : `These ${selectedIds.size} notes`} will be moved to Recently Deleted, where you can restore {selectedIds.size === 1 ? 'it' : 'them'} later.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button onClick={() => setConfirmBulkDelete(false)} className={cn('px-4 py-2 rounded-lg text-sm', theme !== 'light' ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700')}>
                Cancel
              </button>
              <button
                onClick={() => {
                  handleBulkSoftDeleteNotebookEntries(Array.from(selectedIds));
                  setSelectedIds(new Set());
                  setConfirmBulkDelete(false);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-rose-600 hover:bg-rose-500 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
