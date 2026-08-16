import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
    theme, notebookEntries, notebookEntriesLoading, notebookFolders,
    handleAddNotebookEntry, handleUpdateNotebookEntry, handleToggleNotebookEntryPin,
    handleToggleNotebookEntryFavorite, handleDuplicateNotebookEntry,
    handleBulkMoveNotebookEntries, handleBulkSoftDeleteNotebookEntries, handleEmptyNotebookTrash,
    handleSoftDeleteNotebookEntry, handleRestoreNotebookEntry, handlePermanentDeleteNotebookEntry,
    handleAddNotebookFolder, handleDeleteNotebookFolder,
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
  const [folderPendingDelete, setFolderPendingDelete] = useState<string | null>(null);
  const [entryPendingDelete, setEntryPendingDelete] = useState<NotebookEntry | null>(null);
  const [confirmEmptyTrash, setConfirmEmptyTrash] = useState(false);
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);

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
      ? deletedEntries
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
  }, [activeFolder, isTrashView, isFavoritesView, liveEntries, deletedEntries, search, activeTagFilter, sortMode]);

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
    if (trimmed) handleAddNotebookFolder(trimmed);
    setNewFolderName('');
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

  const renderFolderNode = (node: FolderNode, depth: number): React.ReactNode => {
    const isDefault = node.fullPath === 'Mindset' || node.fullPath === 'Daily Reflections';
    const hasChildren = node.children.length > 0;
    const collapsed = collapsedFolders.has(node.fullPath);
    return (
      <div key={node.fullPath}>
        <div className="group/folder relative flex items-center">
          {hasChildren ? (
            <button
              onClick={() => setCollapsedFolders(prev => {
                const next = new Set(prev);
                if (next.has(node.fullPath)) next.delete(node.fullPath); else next.add(node.fullPath);
                return next;
              })}
              style={{ marginLeft: depth * 10 }}
              className={cn('p-1 rounded flex-shrink-0', textMuted, 'hover:text-zinc-200')}
            >
              {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <span style={{ marginLeft: depth * 10 + 14 }} />
          )}
          <button
            onClick={() => { setActiveFolder(node.fullPath); setActiveTagFilter(null); }}
            className={cn(
              'flex-1 flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-base text-left transition-colors min-w-0',
              activeFolder === node.fullPath
                ? (theme !== 'light' ? 'bg-purple-500/10 text-purple-300' : 'bg-purple-50 text-purple-700')
                : cn(textBody, theme !== 'light' ? 'hover:bg-zinc-800/60' : 'hover:bg-zinc-50')
            )}
          >
            <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', folderColor(node.fullPath))} />
            <span className="truncate flex-1">{node.name}</span>
            <span className={cn('text-xs flex-shrink-0', textMuted)}>{countForFolderPath(node.fullPath)}</span>
          </button>
          {!isDefault && (
            <button
              onClick={() => setFolderPendingDelete(node.fullPath)}
              title="Delete folder"
              className={cn('absolute right-1 p-1.5 rounded-md opacity-0 group-hover/folder:opacity-100 transition-opacity', textMuted, 'hover:text-rose-400')}
            >
              <X className="w-3.5 h-3.5" />
            </button>
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
      <div className={cn('grid grid-cols-1 lg:grid-cols-[248px_320px_1fr] gap-0 rounded-xl border overflow-hidden min-h-[75vh] lg:h-[75vh]', border, panelBg)}
      >
        {/* ==== Folder rail ==== */}
        <div className={cn('flex flex-col min-h-0 border-b lg:border-b-0 lg:border-r', border)}>
          <div className={cn('p-3.5 border-b', border)}>
            {isAddingFolder ? (
              <input
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submitNewFolder(); if (e.key === 'Escape') { setIsAddingFolder(false); setNewFolderName(''); } }}
                onBlur={submitNewFolder}
                placeholder="Folder name, or Parent/Child"
                className={cn('w-full px-3 py-2 rounded-lg text-sm border outline-none', theme !== 'light' ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400')}
              />
            ) : (
              <button
                onClick={() => setIsAddingFolder(true)}
                className={cn('w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors', theme !== 'light' ? 'text-zinc-300 hover:bg-zinc-800' : 'text-zinc-700 hover:bg-zinc-50')}
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

            <div className={cn('my-2 border-t', border)} />

            <button
              onClick={() => { setActiveFolder(RECENTLY_DELETED); setActiveTagFilter(null); }}
              className={cn(
                'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-base text-left transition-colors',
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

        {/* ==== Note list ==== */}
        <div className={cn('flex flex-col min-h-0 border-b lg:border-b-0 lg:border-r', border)}>
          <div className={cn('flex items-center justify-between gap-2.5 p-3.5 border-b', border)}>
            {isTrashView ? (
              <div className="flex items-center justify-between w-full">
                <span className={cn('text-sm font-medium', textMuted)}>Recently Deleted</span>
                {deletedEntries.length > 0 && (
                  <button onClick={() => setConfirmEmptyTrash(true)} className="text-sm font-medium text-rose-400 hover:underline">
                    Empty Trash
                  </button>
                )}
              </div>
            ) : (
              <>
                <span className={cn('text-sm font-medium truncate', textBody)}>
                  {activeFolder === ALL_NOTES ? 'All Notes' : activeFolder === FAVORITES ? 'Favorites' : activeFolder}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectMode(v => !v)}
                    title="Select notes"
                    className={cn('p-1.5 rounded-md transition-colors', selectMode ? 'text-purple-400' : cn(textMuted, 'hover:text-zinc-200'))}
                  >
                    <CheckSquare className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode(v => v === 'list' ? 'grid' : 'list')}
                    title={viewMode === 'list' ? 'Grid view' : 'List view'}
                    className={cn('p-1.5 rounded-md transition-colors', textMuted, 'hover:text-zinc-200')}
                  >
                    {viewMode === 'list' ? <LayoutGrid className="w-4 h-4" /> : <Rows3 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={cycleSort}
                    title={`Sort: ${sortLabel}`}
                    className={cn('p-1.5 rounded-md transition-colors', textMuted, 'hover:text-zinc-200')}
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>

          {selectMode && !isTrashView && (
            <div className={cn('flex items-center justify-between gap-2.5 px-3.5 py-2.5 border-b', border, theme !== 'light' ? 'bg-zinc-800/40' : 'bg-zinc-50')}>
              <span className={cn('text-sm', textMuted)}>{selectedIds.size} selected</span>
              <div className="flex items-center gap-2">
                <select
                  onChange={(e) => {
                    if (e.target.value && selectedIds.size > 0) {
                      handleBulkMoveNotebookEntries(Array.from(selectedIds), e.target.value === '__uncategorized__' ? '' : e.target.value);
                      setSelectedIds(new Set());
                    }
                    e.target.value = '';
                  }}
                  defaultValue=""
                  disabled={selectedIds.size === 0}
                  className={cn('text-sm border rounded-md px-2 py-1.5 outline-none bg-transparent disabled:opacity-40', border, textMuted)}
                >
                  <option value="" disabled>Move to&hellip;</option>
                  <option value="__uncategorized__">Uncategorized</option>
                  {notebookFolders.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <button
                  onClick={() => { handleBulkSoftDeleteNotebookEntries(Array.from(selectedIds)); setSelectedIds(new Set()); }}
                  disabled={selectedIds.size === 0}
                  className="text-sm font-medium text-rose-400 px-2.5 py-1.5 rounded-md hover:bg-rose-500/10 disabled:opacity-40 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => { setSelectMode(false); setSelectedIds(new Set()); }}
                  className={cn('text-sm px-2.5 py-1.5 rounded-md transition-colors', textMuted, 'hover:text-zinc-200')}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="themed-scrollbar flex-1 min-h-0 overflow-y-auto">
            {notebookEntriesLoading ? (
              <p className={cn('text-sm text-center py-12', textMuted)}>Loading your notes...</p>
            ) : visibleEntries.length === 0 ? (
              <div className="text-center py-12 px-5">
                <StickyNote className={cn('w-7 h-7 mx-auto mb-2', theme !== 'light' ? 'text-zinc-700' : 'text-zinc-300')} />
                <p className={cn('text-sm', textMuted)}>
                  {isTrashView ? 'Recently Deleted is empty.' : isFavoritesView ? 'No favorites yet.' : 'No notes here yet.'}
                </p>
              </div>
            ) : viewMode === 'grid' && !isTrashView ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-2.5">
                {visibleEntries.map(entry => {
                  const cc = entry.color ? COVER_COLOR_CLASSES[entry.color] : null;
                  return (
                    <button
                      key={entry.id}
                      onClick={() => selectMode ? toggleSelect(entry.id) : setSelectedEntryId(entry.id)}
                      className={cn(
                        'text-left p-3.5 rounded-lg border flex flex-col gap-1.5 min-h-[112px] transition-colors',
                        border,
                        selectedEntryId === entry.id && !selectMode
                          ? (theme !== 'light' ? 'bg-zinc-800/70' : 'bg-zinc-100')
                          : (theme !== 'light' ? 'hover:bg-zinc-800/40' : 'hover:bg-zinc-50'),
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
                      <p className={cn('text-xs mt-auto', textMuted)}>{formatShortDate(entry.updatedAt)}</p>
                    </button>
                  );
                })}
              </div>
            ) : (
              visibleEntries.map(entry => {
                const cc = entry.color ? COVER_COLOR_CLASSES[entry.color] : null;
                const overdue = !!entry.reminderAt && new Date(entry.reminderAt).getTime() < Date.now();
                return (
                  <div
                    key={entry.id}
                    className={cn(
                      'flex items-stretch border-b transition-colors',
                      border,
                      selectedEntryId === entry.id && !selectMode
                        ? (theme !== 'light' ? 'bg-zinc-800/70' : 'bg-zinc-100')
                        : (theme !== 'light' ? 'hover:bg-zinc-800/40' : 'hover:bg-zinc-50')
                    )}
                  >
                    {selectMode && !isTrashView && (
                      <button onClick={() => toggleSelect(entry.id)} className="flex items-center pl-3.5 flex-shrink-0">
                        {selectedIds.has(entry.id) ? <CheckSquare className="w-4 h-4 text-purple-400" /> : <Square className={cn('w-4 h-4', textMuted)} />}
                      </button>
                    )}
                    {cc && <span className={cn('w-1 flex-shrink-0', cc.bar)} />}
                    <button
                      onClick={() => selectMode && !isTrashView ? toggleSelect(entry.id) : setSelectedEntryId(entry.id)}
                      className="flex-1 text-left px-4 py-3.5 min-w-0"
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        {entry.pinned && !isTrashView && <Pin className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                        {entry.favorite && !isTrashView && <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />}
                        <p className={cn('text-base font-semibold truncate', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>
                          {formatNoteHeading(entry)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <p className={cn('text-sm', textMuted)}>{formatShortDate(entry.updatedAt)}</p>
                        {entry.reminderAt && !isTrashView && (
                          <span className={cn('flex items-center gap-1 text-xs', overdue ? 'text-rose-400' : textMuted)}>
                            <Bell className="w-3 h-3" />
                            {formatShortDate(entry.reminderAt)}
                          </span>
                        )}
                      </div>
                    </button>
                  </div>
                );
              })
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
                          onClick={() => { handleSoftDeleteNotebookEntry(selectedEntry.id); setShowMoreMenu(false); }}
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
                  <select
                    value={selectedEntry.folder}
                    onChange={(e) => flushSave({ folder: e.target.value })}
                    className={cn('text-sm bg-transparent outline-none border-none cursor-pointer', textMuted, 'hover:text-zinc-300')}
                  >
                    {notebookFolders.map(folder => (
                      <option key={folder} value={folder} className={theme !== 'light' ? 'bg-zinc-900' : 'bg-white'}>{folder}</option>
                    ))}
                  </select>
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
                <select
                  onMouseDown={saveSelection}
                  onChange={(e) => { const v = e.target.value; if (v) exec('formatBlock', v); e.target.value = ''; }}
                  defaultValue=""
                  title="Text style"
                  className={cn('text-sm bg-transparent border rounded-md pl-1.5 pr-1 py-1.5 outline-none cursor-pointer flex-shrink-0', border, textMuted)}
                >
                  <option value="" disabled>Style</option>
                  <option value="P">Paragraph</option>
                  <option value="H1">Heading 1</option>
                  <option value="H2">Heading 2</option>
                  <option value="H3">Heading 3</option>
                </select>
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
              Notes in this folder won't be deleted — they'll move to Uncategorized. Sub-folders aren't deleted automatically.
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
              This permanently deletes all {deletedEntries.length} note{deletedEntries.length === 1 ? '' : 's'} in Recently Deleted. This can't be undone.
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
    </div>
  );
}
