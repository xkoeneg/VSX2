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
} from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import type { NotebookEntry } from '../types';
import { cn } from '../utils/format';
import { useAppContext } from '../context/AppContext';

// Sentinel folder ids — not real folder names, never collide with a
// user-created one since folder names are validated/trimmed on create
// (see handleAddNotebookFolder).
const ALL_NOTES = '__all_notes__';
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

export function NotebookScreen() {
  const {
    theme, notebookEntries, notebookEntriesLoading, notebookFolders,
    handleAddNotebookEntry, handleUpdateNotebookEntry, handleToggleNotebookEntryPin,
    handleSoftDeleteNotebookEntry, handleRestoreNotebookEntry, handlePermanentDeleteNotebookEntry,
    handleAddNotebookFolder, handleDeleteNotebookFolder,
  } = useAppContext();

  // ---- Local screen state ----
  const [activeFolder, setActiveFolder] = useState<string>(ALL_NOTES);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [sortByTitle, setSortByTitle] = useState(false);

  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderPendingDelete, setFolderPendingDelete] = useState<string | null>(null);
  const [entryPendingDelete, setEntryPendingDelete] = useState<NotebookEntry | null>(null);

  const [titleDraft, setTitleDraft] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const bodyRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<number | undefined>(undefined);
  const pendingNewNoteRef = useRef(false);
  const loadedEntryIdRef = useRef<string | null>(null);

  const liveEntries = useMemo(() => notebookEntries.filter(e => !e.isDeleted), [notebookEntries]);
  const deletedEntries = useMemo(() => notebookEntries.filter(e => e.isDeleted), [notebookEntries]);
  const isTrashView = activeFolder === RECENTLY_DELETED;

  const allTags = useMemo(() => {
    const set = new Set<string>();
    liveEntries.forEach(e => e.tags.forEach(t => set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [liveEntries]);

  const visibleEntries = useMemo(() => {
    const pool = isTrashView
      ? deletedEntries
      : activeFolder === ALL_NOTES
        ? liveEntries
        : liveEntries.filter(e => e.folder === activeFolder);
    const q = search.trim().toLowerCase();
    const filtered = pool.filter(e => {
      const matchesSearch = !q || e.title.toLowerCase().includes(q) || stripHtml(e.body).toLowerCase().includes(q);
      const matchesTag = !activeTagFilter || e.tags.includes(activeTagFilter);
      return matchesSearch && matchesTag;
    });
    return filtered.sort((a, b) => {
      if (!isTrashView && a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (sortByTitle) return formatNoteHeading(a).localeCompare(formatNoteHeading(b));
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [activeFolder, isTrashView, liveEntries, deletedEntries, search, activeTagFilter, sortByTitle]);

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
    setTagInput('');
  }, [selectedEntry]);

  const scheduleSave = useCallback((patch: Partial<Pick<NotebookEntry, 'title' | 'body' | 'folder' | 'tags'>>) => {
    if (!selectedEntryId) return;
    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(() => {
      handleUpdateNotebookEntry(selectedEntryId, patch);
    }, 500);
  }, [selectedEntryId, handleUpdateNotebookEntry]);

  const flushSave = useCallback((patch: Partial<Pick<NotebookEntry, 'title' | 'body' | 'folder' | 'tags'>>) => {
    if (!selectedEntryId) return;
    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    handleUpdateNotebookEntry(selectedEntryId, patch);
  }, [selectedEntryId, handleUpdateNotebookEntry]);

  // ---- New note / selection ----
  const createNote = () => {
    const folder = !isTrashView && activeFolder !== ALL_NOTES ? activeFolder : (notebookFolders[0] ?? '');
    pendingNewNoteRef.current = true;
    handleAddNotebookEntry({ title: '', body: '', folder, tags: [] });
    if (isTrashView) setActiveFolder(ALL_NOTES);
  };

  // ---- Title / body editing ----
  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleDraft(e.target.value);
    scheduleSave({ title: e.target.value });
  };
  const onTitleBlur = () => flushSave({ title: titleDraft });

  const onBodyInput = () => {
    scheduleSave({ body: bodyRef.current?.innerHTML ?? '' });
  };
  const onBodyBlur = () => flushSave({ body: bodyRef.current?.innerHTML ?? '' });

  const exec = (command: string, value?: string) => {
    bodyRef.current?.focus();
    document.execCommand(command, false, value);
    onBodyInput();
  };

  const insertLink = () => {
    const url = window.prompt('Link URL');
    if (url) exec('createLink', url);
  };

  const insertChecklistItem = () => {
    exec('insertHTML', '☐ ');
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

  return (
    <div className="space-y-4 min-w-0">
      <PageHeader
        title="Notebook"
        description="Your mindset notes, affirmations, and personal reflections"
      />

      {/* ---- Search + filter row ---- */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className={cn('absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5', textMuted)} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes"
            className={cn('w-full pl-9 pr-3 py-2 rounded-lg text-sm border outline-none', panelBg, border, theme !== 'light' ? 'text-white placeholder-zinc-500 focus:border-zinc-600' : 'text-zinc-900 placeholder-zinc-400 focus:border-zinc-300')}
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFilter(v => !v)}
            title="Filter by tag"
            className={cn('p-2 rounded-lg border transition-colors', panelBg, border, activeTagFilter ? 'text-purple-400 border-purple-500/40' : cn(textMuted, 'hover:text-zinc-200'))}
          >
            <Filter className="w-3.5 h-3.5" />
          </button>
          {showFilter && (
            <div className={cn('absolute right-0 mt-1.5 w-52 rounded-lg border shadow-xl z-20 p-2', theme !== 'light' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200')}>
              <p className={cn('text-[10px] font-semibold uppercase tracking-wider px-1.5 pb-1.5', textMuted)}>Filter by tag</p>
              {allTags.length === 0 ? (
                <p className={cn('text-xs px-1.5 py-1', textMuted)}>No tags yet</p>
              ) : (
                <div className="max-h-48 overflow-y-auto flex flex-col gap-0.5">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => { setActiveTagFilter(prev => prev === tag ? null : tag); setShowFilter(false); }}
                      className={cn(
                        'text-left px-1.5 py-1 rounded-md text-xs transition-colors',
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
                <button onClick={() => { setActiveTagFilter(null); setShowFilter(false); }} className="w-full text-left px-1.5 py-1 mt-1 rounded-md text-xs text-rose-400 hover:bg-zinc-800">
                  Clear filter
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ---- 3-pane layout ---- */}
      <div className={cn('grid grid-cols-1 lg:grid-cols-[220px_280px_1fr] gap-0 rounded-xl border overflow-hidden', border, panelBg)}
        style={{ minHeight: '70vh' }}
      >
        {/* ==== Folder rail ==== */}
        <div className={cn('flex flex-col border-b lg:border-b-0 lg:border-r', border)}>
          <div className={cn('p-3 border-b', border)}>
            {isAddingFolder ? (
              <input
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submitNewFolder(); if (e.key === 'Escape') { setIsAddingFolder(false); setNewFolderName(''); } }}
                onBlur={submitNewFolder}
                placeholder="Folder name"
                className={cn('w-full px-2.5 py-1.5 rounded-lg text-xs border outline-none', theme !== 'light' ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400')}
              />
            ) : (
              <button
                onClick={() => setIsAddingFolder(true)}
                className={cn('w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors', theme !== 'light' ? 'text-zinc-300 hover:bg-zinc-800' : 'text-zinc-700 hover:bg-zinc-50')}
              >
                <FolderPlus className="w-3.5 h-3.5" />
                Add folder
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <p className={cn('text-[10px] font-semibold uppercase tracking-wider px-2 pt-1 pb-1.5', textMuted)}>Folders</p>

            <button
              onClick={() => { setActiveFolder(ALL_NOTES); setActiveTagFilter(null); }}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-left transition-colors',
                activeFolder === ALL_NOTES
                  ? (theme !== 'light' ? 'bg-purple-500/10 text-purple-300' : 'bg-purple-50 text-purple-700')
                  : cn(textBody, theme !== 'light' ? 'hover:bg-zinc-800/60' : 'hover:bg-zinc-50')
              )}
            >
              <StickyNote className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="flex-1 truncate">All notes</span>
              <span className={cn('text-[10px]', textMuted)}>{liveEntries.length}</span>
            </button>

            {notebookFolders.map(folder => {
              const count = liveEntries.filter(e => e.folder === folder).length;
              const isDefault = folder === 'Mindset' || folder === 'Daily Reflections';
              return (
                <div key={folder} className="group/folder relative flex items-center">
                  <button
                    onClick={() => { setActiveFolder(folder); setActiveTagFilter(null); }}
                    className={cn(
                      'flex-1 flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-left transition-colors min-w-0',
                      activeFolder === folder
                        ? (theme !== 'light' ? 'bg-purple-500/10 text-purple-300' : 'bg-purple-50 text-purple-700')
                        : cn(textBody, theme !== 'light' ? 'hover:bg-zinc-800/60' : 'hover:bg-zinc-50')
                    )}
                  >
                    <span className={cn('w-2 h-2 rounded-full flex-shrink-0', folderColor(folder))} />
                    <span className="truncate flex-1">{folder}</span>
                    <span className={cn('text-[10px] flex-shrink-0', textMuted)}>{count}</span>
                  </button>
                  {!isDefault && (
                    <button
                      onClick={() => setFolderPendingDelete(folder)}
                      title="Delete folder"
                      className={cn('absolute right-1 p-1 rounded-md opacity-0 group-hover/folder:opacity-100 transition-opacity', textMuted, 'hover:text-rose-400')}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}

            <div className={cn('my-2 border-t', border)} />

            <button
              onClick={() => { setActiveFolder(RECENTLY_DELETED); setActiveTagFilter(null); }}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-left transition-colors',
                isTrashView
                  ? (theme !== 'light' ? 'bg-rose-500/10 text-rose-300' : 'bg-rose-50 text-rose-700')
                  : cn(textBody, theme !== 'light' ? 'hover:bg-zinc-800/60' : 'hover:bg-zinc-50')
              )}
            >
              <Trash2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="flex-1 truncate">Recently Deleted</span>
              <span className={cn('text-[10px]', textMuted)}>{deletedEntries.length}</span>
            </button>
          </div>
        </div>

        {/* ==== Note list ==== */}
        <div className={cn('flex flex-col border-b lg:border-b-0 lg:border-r', border)}>
          <div className={cn('flex items-center justify-between gap-2 p-3 border-b', border)}>
            {isTrashView ? (
              <span className={cn('text-xs font-medium', textMuted)}>Recently Deleted</span>
            ) : (
              <button
                onClick={createNote}
                className={cn('flex items-center gap-1.5 text-xs font-medium transition-colors', theme !== 'light' ? 'text-zinc-300 hover:text-white' : 'text-zinc-700 hover:text-zinc-900')}
              >
                <Plus className="w-3.5 h-3.5" />
                New note
              </button>
            )}
            <button
              onClick={() => setSortByTitle(v => !v)}
              title={sortByTitle ? 'Sort by title' : 'Sort by last updated'}
              className={cn('p-1 rounded-md transition-colors', textMuted, 'hover:text-zinc-200')}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {notebookEntriesLoading ? (
              <p className={cn('text-xs text-center py-10', textMuted)}>Loading your notes...</p>
            ) : visibleEntries.length === 0 ? (
              <div className="text-center py-10 px-4">
                <StickyNote className={cn('w-6 h-6 mx-auto mb-2', theme !== 'light' ? 'text-zinc-700' : 'text-zinc-300')} />
                <p className={cn('text-xs', textMuted)}>
                  {isTrashView ? 'Recently Deleted is empty.' : 'No notes here yet.'}
                </p>
              </div>
            ) : (
              visibleEntries.map(entry => (
                <button
                  key={entry.id}
                  onClick={() => setSelectedEntryId(entry.id)}
                  className={cn(
                    'w-full text-left px-3.5 py-3 border-b transition-colors',
                    border,
                    selectedEntryId === entry.id
                      ? (theme !== 'light' ? 'bg-zinc-800/70' : 'bg-zinc-100')
                      : (theme !== 'light' ? 'hover:bg-zinc-800/40' : 'hover:bg-zinc-50')
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {entry.pinned && !isTrashView && <Pin className="w-2.5 h-2.5 text-amber-400 flex-shrink-0" />}
                    <p className={cn('text-sm font-semibold truncate', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>
                      {formatNoteHeading(entry)}
                    </p>
                  </div>
                  <p className={cn('text-[11px]', textMuted)}>{formatShortDate(entry.updatedAt)}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ==== Editor / detail pane ==== */}
        <div className="flex flex-col min-w-0">
          {!selectedEntry ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 p-8">
              <StickyNote className={cn('w-8 h-8', theme !== 'light' ? 'text-zinc-700' : 'text-zinc-300')} />
              <p className={cn('text-sm', textMuted)}>
                {isTrashView ? 'Nothing selected' : 'Select a note, or create a new one'}
              </p>
            </div>
          ) : isTrashView ? (
            <div className="flex flex-col h-full">
              <div className={cn('flex items-center justify-between gap-3 px-5 py-4 border-b', border)}>
                <h2 className={cn('text-lg font-semibold truncate', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>
                  {formatNoteHeading(selectedEntry)}
                </h2>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleRestoreNotebookEntry(selectedEntry.id)}
                    className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors', theme !== 'light' ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700')}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restore
                  </button>
                  <button
                    onClick={() => setEntryPendingDelete(selectedEntry)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete forever
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <p className={cn('text-sm leading-relaxed whitespace-pre-wrap', textBody)}>
                  {stripHtml(selectedEntry.body) || <span className="italic opacity-60">Empty note</span>}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full min-w-0">
              {/* Title + meta + more menu */}
              <div className={cn('px-5 pt-4 pb-3 border-b', border)}>
                <div className="flex items-start justify-between gap-3">
                  <input
                    value={titleDraft}
                    onChange={onTitleChange}
                    onBlur={onTitleBlur}
                    placeholder="Untitled"
                    className={cn('flex-1 min-w-0 bg-transparent outline-none text-lg font-semibold', theme !== 'light' ? 'text-white placeholder-zinc-600' : 'text-zinc-900 placeholder-zinc-300')}
                  />
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setShowMoreMenu(v => !v)}
                      className={cn('p-1.5 rounded-md transition-colors', textMuted, 'hover:text-zinc-200')}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {showMoreMenu && (
                      <div className={cn('absolute right-0 mt-1 w-40 rounded-lg border shadow-xl z-20 py-1', theme !== 'light' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200')}>
                        <button
                          onClick={() => { handleToggleNotebookEntryPin(selectedEntry.id); setShowMoreMenu(false); }}
                          className={cn('w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left transition-colors', textBody, theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-50')}
                        >
                          {selectedEntry.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                          {selectedEntry.pinned ? 'Unpin note' : 'Pin note'}
                        </button>
                        <button
                          onClick={() => { handleSoftDeleteNotebookEntry(selectedEntry.id); setShowMoreMenu(false); }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left text-rose-400 hover:bg-zinc-800 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete note
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <p className={cn('text-[11px]', textMuted)}>
                    Created {formatFullDateTime(selectedEntry.createdAt)} &middot; Last updated {formatFullDateTime(selectedEntry.updatedAt)}
                  </p>
                  <select
                    value={selectedEntry.folder}
                    onChange={(e) => flushSave({ folder: e.target.value })}
                    className={cn('text-[11px] bg-transparent outline-none border-none cursor-pointer', textMuted, 'hover:text-zinc-300')}
                  >
                    {notebookFolders.map(folder => (
                      <option key={folder} value={folder} className={theme !== 'light' ? 'bg-zinc-900' : 'bg-white'}>{folder}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Formatting toolbar */}
              <div className={cn('flex items-center gap-0.5 px-4 py-1.5 border-b overflow-x-auto', border)}>
                {[
                  { icon: Bold, cmd: 'bold', title: 'Bold' },
                  { icon: Italic, cmd: 'italic', title: 'Italic' },
                  { icon: Underline, cmd: 'underline', title: 'Underline' },
                ].map(({ icon: Icon, cmd, title }) => (
                  <button key={cmd} onMouseDown={(e) => e.preventDefault()} onClick={() => exec(cmd)} title={title}
                    className={cn('p-1.5 rounded-md transition-colors', textMuted, 'hover:text-zinc-200', theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100')}>
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}
                <div className={cn('w-px h-4 mx-1', theme !== 'light' ? 'bg-zinc-800' : 'bg-zinc-200')} />
                {[
                  { icon: AlignLeft, cmd: 'justifyLeft', title: 'Align left' },
                  { icon: AlignCenter, cmd: 'justifyCenter', title: 'Align center' },
                  { icon: AlignRight, cmd: 'justifyRight', title: 'Align right' },
                ].map(({ icon: Icon, cmd, title }) => (
                  <button key={cmd} onMouseDown={(e) => e.preventDefault()} onClick={() => exec(cmd)} title={title}
                    className={cn('p-1.5 rounded-md transition-colors', textMuted, 'hover:text-zinc-200', theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100')}>
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}
                <div className={cn('w-px h-4 mx-1', theme !== 'light' ? 'bg-zinc-800' : 'bg-zinc-200')} />
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec('insertUnorderedList')} title="Bulleted list"
                  className={cn('p-1.5 rounded-md transition-colors', textMuted, 'hover:text-zinc-200', theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100')}>
                  <List className="w-3.5 h-3.5" />
                </button>
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec('insertOrderedList')} title="Numbered list"
                  className={cn('p-1.5 rounded-md transition-colors', textMuted, 'hover:text-zinc-200', theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100')}>
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button onMouseDown={(e) => e.preventDefault()} onClick={insertChecklistItem} title="Checklist item"
                  className={cn('p-1.5 rounded-md transition-colors', textMuted, 'hover:text-zinc-200', theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100')}>
                  <ListChecks className="w-3.5 h-3.5" />
                </button>
                <div className={cn('w-px h-4 mx-1', theme !== 'light' ? 'bg-zinc-800' : 'bg-zinc-200')} />
                <button onMouseDown={(e) => e.preventDefault()} onClick={insertLink} title="Insert link"
                  className={cn('p-1.5 rounded-md transition-colors', textMuted, 'hover:text-zinc-200', theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100')}>
                  <Link2 className="w-3.5 h-3.5" />
                </button>
                <div className={cn('w-px h-4 mx-1', theme !== 'light' ? 'bg-zinc-800' : 'bg-zinc-200')} />
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec('undo')} title="Undo"
                  className={cn('p-1.5 rounded-md transition-colors', textMuted, 'hover:text-zinc-200', theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100')}>
                  <Undo2 className="w-3.5 h-3.5" />
                </button>
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec('redo')} title="Redo"
                  className={cn('p-1.5 rounded-md transition-colors', textMuted, 'hover:text-zinc-200', theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100')}>
                  <Redo2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <div
                  ref={bodyRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={onBodyInput}
                  onBlur={onBodyBlur}
                  data-placeholder="Write your note..."
                  className={cn(
                    'notebook-editable min-h-[200px] text-sm leading-relaxed outline-none',
                    textBody
                  )}
                />
              </div>

              {/* Tags */}
              <div className={cn('flex flex-wrap items-center gap-1.5 px-5 py-3 border-t', border)}>
                {selectedEntry.tags.map(tag => (
                  <span key={tag} className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border', theme !== 'light' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' : 'bg-purple-50 text-purple-600 border-purple-200')}>
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-rose-400 transition-colors">
                      <X className="w-2.5 h-2.5" />
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
                    className={cn('px-2 py-1 rounded-full text-[11px] border outline-none w-24 focus:w-36 transition-all', theme !== 'light' ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:border-zinc-600' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-300')}
                  />
                  {showTagSuggestions && suggestibleTags.length > 0 && (
                    <div className={cn('absolute bottom-full left-0 mb-1.5 w-40 rounded-lg border shadow-xl z-20 py-1 max-h-40 overflow-y-auto', theme !== 'light' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200')}>
                      {suggestibleTags.map(tag => (
                        <button
                          key={tag}
                          onMouseDown={(e) => { e.preventDefault(); commitTag(tag); }}
                          className={cn('w-full text-left px-3 py-1 text-xs transition-colors', textBody, theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-50')}
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
        .notebook-editable a { color: ${theme !== 'light' ? '#c4b5fd' : '#7c3aed'}; text-decoration: underline; }
      `}</style>

      {/* ---- Delete folder confirm ---- */}
      {folderPendingDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={() => setFolderPendingDelete(null)}>
          <div className={cn('rounded-xl max-w-sm w-full border p-5', theme !== 'light' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200')} onClick={(e) => e.stopPropagation()}>
            <h3 className={cn('text-sm font-semibold mb-2', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>Delete "{folderPendingDelete}"?</h3>
            <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
              Notes in this folder won't be deleted — they'll move to Uncategorized.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setFolderPendingDelete(null)} className={cn('px-3.5 py-1.5 rounded-lg text-xs', theme !== 'light' ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700')}>
                Cancel
              </button>
              <button onClick={confirmDeleteFolder} className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white">
                Delete Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Permanent delete confirm ---- */}
      {entryPendingDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={() => setEntryPendingDelete(null)}>
          <div className={cn('rounded-xl max-w-sm w-full border p-5', theme !== 'light' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200')} onClick={(e) => e.stopPropagation()}>
            <h3 className={cn('text-sm font-semibold mb-2', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>Delete forever?</h3>
            <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
              This permanently deletes "{entryPendingDelete.title || 'this note'}". This can't be undone.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setEntryPendingDelete(null)} className={cn('px-3.5 py-1.5 rounded-lg text-xs', theme !== 'light' ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700')}>
                Cancel
              </button>
              <button
                onClick={() => { handlePermanentDeleteNotebookEntry(entryPendingDelete.id); setEntryPendingDelete(null); }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
