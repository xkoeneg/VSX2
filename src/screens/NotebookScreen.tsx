import type React from 'react';
import { useMemo, useState } from 'react';
import {
  Plus,
  X,
  Edit2,
  Trash2,
  Pin,
  PinOff,
  Search,
  StickyNote,
  FolderPlus,
  Folder,
  RotateCcw,
  Tag as TagIcon,
} from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import type { NotebookEntry } from '../types';
import { cn } from '../utils/format';
import { useAppContext } from '../context/AppContext';

// Sentinel folder id for the "Recently Deleted" view — not a real folder
// name, never collides with a user-created one since folder names are
// validated/trimmed on create (see handleAddNotebookFolder).
const RECENTLY_DELETED = '__recently_deleted__';

type NotebookDraft = {
  title: string;
  body: string;
  folder: string;
  tags: string[];
};

const emptyDraft = (defaultFolder: string): NotebookDraft => ({
  title: '',
  body: '',
  folder: defaultFolder,
  tags: [],
});

export function NotebookScreen() {
  const {
    theme, notebookEntries, notebookEntriesLoading, notebookFolders,
    handleAddNotebookEntry, handleUpdateNotebookEntry, handleToggleNotebookEntryPin,
    handleSoftDeleteNotebookEntry, handleRestoreNotebookEntry, handlePermanentDeleteNotebookEntry,
    handleAddNotebookFolder, handleDeleteNotebookFolder,
  } = useAppContext();

  // ---- Local screen state (scoped here, not global context — this is a
  // read/compose-focused screen with no cross-screen dependencies, same
  // rationale as the previewNotice state in NoticesScreen) ----
  const [activeFolder, setActiveFolder] = useState<string>(notebookFolders[0] ?? RECENTLY_DELETED);
  const [search, setSearch] = useState('');
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);

  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<NotebookDraft>(emptyDraft(notebookFolders[0] ?? ''));
  const [tagInput, setTagInput] = useState('');

  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderPendingDelete, setFolderPendingDelete] = useState<string | null>(null);
  const [entryPendingDelete, setEntryPendingDelete] = useState<NotebookEntry | null>(null);

  const liveEntries = useMemo(() => notebookEntries.filter(e => !e.isDeleted), [notebookEntries]);
  const deletedEntries = useMemo(() => notebookEntries.filter(e => e.isDeleted), [notebookEntries]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    liveEntries.forEach(e => e.tags.forEach(t => set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [liveEntries]);

  const visibleEntries = useMemo(() => {
    const pool = activeFolder === RECENTLY_DELETED ? deletedEntries : liveEntries.filter(e => e.folder === activeFolder);
    const q = search.trim().toLowerCase();
    const filtered = pool.filter(e => {
      const matchesSearch = !q || e.title.toLowerCase().includes(q) || e.body.toLowerCase().includes(q);
      const matchesTag = !activeTagFilter || e.tags.includes(activeTagFilter);
      return matchesSearch && matchesTag;
    });
    // Pinned first, then most recently updated.
    return filtered.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [activeFolder, liveEntries, deletedEntries, search, activeTagFilter]);

  const isTrashView = activeFolder === RECENTLY_DELETED;

  // ---- Composer (add/edit) ----
  const openAddComposer = () => {
    setEditingId(null);
    setDraft(emptyDraft(isTrashView ? (notebookFolders[0] ?? '') : activeFolder));
    setTagInput('');
    setIsComposerOpen(true);
  };

  const openEditComposer = (entry: NotebookEntry) => {
    setEditingId(entry.id);
    setDraft({ title: entry.title, body: entry.body, folder: entry.folder, tags: entry.tags });
    setTagInput('');
    setIsComposerOpen(true);
  };

  const closeComposer = () => {
    setIsComposerOpen(false);
    setEditingId(null);
  };

  const commitTagInput = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !draft.tags.includes(trimmed)) {
      setDraft(prev => ({ ...prev, tags: [...prev.tags, trimmed] }));
    }
    setTagInput('');
  };

  const removeDraftTag = (tag: string) => {
    setDraft(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const saveDraft = () => {
    const payload = { title: draft.title.trim(), body: draft.body.trim(), folder: draft.folder, tags: draft.tags };
    if (!payload.body && !payload.title) return;
    if (editingId) {
      handleUpdateNotebookEntry(editingId, payload);
    } else {
      handleAddNotebookEntry(payload);
    }
    closeComposer();
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
    if (activeFolder === folderPendingDelete) setActiveFolder(notebookFolders[0] ?? RECENTLY_DELETED);
    handleDeleteNotebookFolder(folderPendingDelete);
    setFolderPendingDelete(null);
  };

  // ---- Card ----
  const renderCard = (entry: NotebookEntry) => (
    <div
      key={entry.id}
      className={cn(
        'group relative rounded-xl border p-4 flex flex-col gap-2.5 transition-all hover:-translate-y-0.5',
        theme !== 'light' ? 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-md',
        entry.pinned && (theme !== 'light' ? 'border-amber-500/40' : 'border-amber-400/60')
      )}
    >
      {entry.pinned && !isTrashView && (
        <div className="absolute top-0 inset-x-0 h-0.5 bg-amber-500/70 rounded-t-xl" />
      )}

      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {isTrashView ? (
          <>
            <button
              onClick={() => handleRestoreNotebookEntry(entry.id)}
              title="Restore"
              className={cn('p-1.5 rounded-md transition-colors', theme !== 'light' ? 'text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800' : 'text-zinc-500 hover:text-emerald-600 hover:bg-zinc-100')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setEntryPendingDelete(entry)}
              title="Delete forever"
              className={cn('p-1.5 rounded-md transition-colors', theme !== 'light' ? 'text-zinc-400 hover:text-rose-400 hover:bg-zinc-800' : 'text-zinc-500 hover:text-rose-600 hover:bg-zinc-100')}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => handleToggleNotebookEntryPin(entry.id)}
              title={entry.pinned ? 'Unpin' : 'Pin'}
              className={cn('p-1.5 rounded-md transition-colors', theme !== 'light' ? 'text-zinc-400 hover:text-amber-400 hover:bg-zinc-800' : 'text-zinc-500 hover:text-amber-600 hover:bg-zinc-100')}
            >
              {entry.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => openEditComposer(entry)}
              title="Edit"
              className={cn('p-1.5 rounded-md transition-colors', theme !== 'light' ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100')}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleSoftDeleteNotebookEntry(entry.id)}
              title="Delete"
              className={cn('p-1.5 rounded-md transition-colors', theme !== 'light' ? 'text-zinc-400 hover:text-rose-400 hover:bg-zinc-800' : 'text-zinc-500 hover:text-rose-600 hover:bg-zinc-100')}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      <div className="pr-14">
        {entry.title ? (
          <h3 className={cn('text-sm font-semibold leading-snug line-clamp-1', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>{entry.title}</h3>
        ) : (
          <h3 className={cn('text-sm font-semibold italic leading-snug', theme !== 'light' ? 'text-zinc-600' : 'text-zinc-400')}>Untitled</h3>
        )}
      </div>

      <p className={cn('text-xs leading-relaxed line-clamp-4 whitespace-pre-wrap', theme !== 'light' ? 'text-zinc-400' : 'text-zinc-600')}>
        {entry.body || <span className="italic">Empty note</span>}
      </p>

      <div className="flex items-center justify-between gap-2 mt-1">
        <div className="flex flex-wrap gap-1 min-h-[19px]">
          {entry.tags.map(tag => (
            <span key={tag} className={cn('px-1.5 py-0.5 rounded-full text-[9px] font-semibold border', theme !== 'light' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' : 'bg-purple-50 text-purple-600 border-purple-200')}>
              {tag}
            </span>
          ))}
        </div>
        <span className={cn('text-[10px] flex-shrink-0', theme !== 'light' ? 'text-zinc-600' : 'text-zinc-400')}>
          {new Date(entry.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 min-w-0">
      <PageHeader
        title="Notebook"
        description="Your mindset notes, affirmations, and personal reflections"
        actions={
          <button
            onClick={openAddComposer}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors flex-shrink-0',
              theme !== 'light' ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-zinc-900 hover:bg-zinc-800 text-white'
            )}
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 items-start">
        {/* ---- Folder rail ---- */}
        <div className={cn('rounded-xl border p-3 flex flex-col gap-1', theme !== 'light' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-zinc-200')}>
          {notebookFolders.map(folder => {
            const count = liveEntries.filter(e => e.folder === folder).length;
            const isDefault = folder === 'Mindset' || folder === 'Daily Reflections';
            return (
              <div key={folder} className="group/folder relative flex items-center">
                <button
                  onClick={() => { setActiveFolder(folder); setActiveTagFilter(null); }}
                  className={cn(
                    'flex-1 flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm transition-colors text-left min-w-0',
                    activeFolder === folder
                      ? (theme !== 'light' ? 'bg-purple-500/10 text-purple-300' : 'bg-purple-50 text-purple-700')
                      : (theme !== 'light' ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/50' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50')
                  )}
                >
                  <Folder className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate flex-1">{folder}</span>
                  <span className={cn('text-[10px] flex-shrink-0', theme !== 'light' ? 'text-zinc-600' : 'text-zinc-400')}>{count}</span>
                </button>
                {!isDefault && (
                  <button
                    onClick={() => setFolderPendingDelete(folder)}
                    title="Delete folder"
                    className={cn('absolute right-1 p-1 rounded-md opacity-0 group-hover/folder:opacity-100 transition-opacity', theme !== 'light' ? 'text-zinc-500 hover:text-rose-400 hover:bg-zinc-800' : 'text-zinc-400 hover:text-rose-600 hover:bg-zinc-100')}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {isAddingFolder ? (
            <div className="flex items-center gap-1.5 px-1 py-1">
              <input
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submitNewFolder(); if (e.key === 'Escape') { setIsAddingFolder(false); setNewFolderName(''); } }}
                onBlur={submitNewFolder}
                placeholder="Folder name"
                className={cn('flex-1 min-w-0 px-2 py-1.5 rounded-lg text-xs border outline-none', theme !== 'light' ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400')}
              />
            </div>
          ) : (
            <button
              onClick={() => setIsAddingFolder(true)}
              className={cn('flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-colors', theme !== 'light' ? 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50')}
            >
              <FolderPlus className="w-3.5 h-3.5" />
              New Folder
            </button>
          )}

          <div className={cn('my-1 border-t', theme !== 'light' ? 'border-zinc-800' : 'border-zinc-200')} />

          <button
            onClick={() => { setActiveFolder(RECENTLY_DELETED); setActiveTagFilter(null); }}
            className={cn(
              'flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm transition-colors text-left',
              activeFolder === RECENTLY_DELETED
                ? (theme !== 'light' ? 'bg-rose-500/10 text-rose-300' : 'bg-rose-50 text-rose-700')
                : (theme !== 'light' ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/50' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50')
            )}
          >
            <Trash2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate flex-1">Recently Deleted</span>
            <span className={cn('text-[10px]', theme !== 'light' ? 'text-zinc-600' : 'text-zinc-400')}>{deletedEntries.length}</span>
          </button>
        </div>

        {/* ---- Note list ---- */}
        <div className="min-w-0 space-y-4">
          {!isTrashView && (
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className={cn('absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5', theme !== 'light' ? 'text-zinc-500' : 'text-zinc-400')} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search notes..."
                  className={cn('w-full pl-9 pr-3 py-2 rounded-lg text-sm border outline-none', theme !== 'light' ? 'bg-zinc-900/50 border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-700' : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-300')}
                />
              </div>
              {allTags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setActiveTagFilter(prev => prev === tag ? null : tag)}
                      className={cn(
                        'flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold border transition-colors',
                        activeTagFilter === tag
                          ? (theme !== 'light' ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' : 'bg-purple-100 text-purple-700 border-purple-300')
                          : (theme !== 'light' ? 'bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:text-zinc-300' : 'bg-white text-zinc-500 border-zinc-200 hover:text-zinc-700')
                      )}
                    >
                      <TagIcon className="w-2.5 h-2.5" />
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {notebookEntriesLoading ? (
            <div className={cn('text-center py-16 rounded-xl border border-dashed', theme !== 'light' ? 'border-zinc-800 bg-zinc-900/30' : 'border-zinc-300 bg-zinc-50')}>
              <p className="text-zinc-500 text-sm">Loading your notes...</p>
            </div>
          ) : visibleEntries.length > 0 ? (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
              {visibleEntries.map(renderCard)}
            </div>
          ) : (
            <div className={cn('text-center py-16 rounded-xl border border-dashed', theme !== 'light' ? 'border-zinc-800 bg-zinc-900/30' : 'border-zinc-300 bg-zinc-50')}>
              <StickyNote className={cn('w-8 h-8 mx-auto mb-3', theme !== 'light' ? 'text-zinc-700' : 'text-zinc-300')} />
              {isTrashView ? (
                <p className="text-zinc-500 text-sm">Recently Deleted is empty.</p>
              ) : (
                <>
                  <p className="text-zinc-500 text-sm mb-3">
                    {liveEntries.some(e => e.folder === activeFolder) ? 'No matches for these filters' : `No notes in ${activeFolder} yet`}
                  </p>
                  <button
                    onClick={openAddComposer}
                    className={cn('inline-flex items-center gap-1.5 text-xs transition-colors', theme !== 'light' ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-500 hover:text-zinc-800')}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Note
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ---- Composer modal (add/edit) ---- */}
      {isComposerOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-start justify-center overflow-y-auto p-4 py-8" onClick={closeComposer}>
          <div
            className={cn('rounded-xl max-w-lg w-full border overflow-hidden', theme !== 'light' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200')}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={cn('flex items-center justify-between px-5 py-4 border-b', theme !== 'light' ? 'border-zinc-800' : 'border-zinc-200')}>
              <h2 className={cn('text-sm font-semibold', theme !== 'light' ? 'text-white' : 'text-zinc-900')}>
                {editingId ? 'Edit Note' : 'New Note'}
              </h2>
              <button onClick={closeComposer} className="p-1 text-zinc-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <input
                value={draft.title}
                onChange={(e) => setDraft(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Title (optional)"
                className={cn('w-full px-3 py-2 rounded-lg text-sm border outline-none font-medium', theme !== 'light' ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:border-zinc-600' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-300')}
              />

              <textarea
                value={draft.body}
                onChange={(e) => setDraft(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Write your note..."
                rows={7}
                className={cn('w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none leading-relaxed', theme !== 'light' ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:border-zinc-600' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-300')}
              />

              <div>
                <label className={cn('text-[11px] font-semibold uppercase tracking-wider mb-1.5 block', theme !== 'light' ? 'text-zinc-400' : 'text-zinc-500')}>Folder</label>
                <select
                  value={draft.folder}
                  onChange={(e) => setDraft(prev => ({ ...prev, folder: e.target.value }))}
                  className={cn('w-full px-3 py-2 rounded-lg text-sm border outline-none', theme !== 'light' ? 'bg-zinc-800 border-zinc-700 text-white focus:border-zinc-600' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-300')}
                >
                  {notebookFolders.map(folder => (
                    <option key={folder} value={folder}>{folder}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={cn('text-[11px] font-semibold uppercase tracking-wider mb-1.5 block', theme !== 'light' ? 'text-zinc-400' : 'text-zinc-500')}>Tags</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {draft.tags.map(tag => (
                    <span key={tag} className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border', theme !== 'light' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' : 'bg-purple-50 text-purple-600 border-purple-200')}>
                      {tag}
                      <button onClick={() => removeDraftTag(tag)} className="hover:text-rose-400 transition-colors">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitTagInput(); } }}
                  onBlur={commitTagInput}
                  placeholder="Add a tag, press Enter"
                  className={cn('w-full px-3 py-2 rounded-lg text-xs border outline-none', theme !== 'light' ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:border-zinc-600' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-300')}
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editingId ? (notebookEntries.find(e => e.id === editingId)?.pinned ?? false) : false}
                    onChange={() => editingId && handleToggleNotebookEntryPin(editingId)}
                    disabled={!editingId}
                    className="w-3.5 h-3.5 rounded accent-amber-500"
                  />
                  <span className={cn(theme !== 'light' ? 'text-zinc-400' : 'text-zinc-600', !editingId && 'opacity-40')}>
                    Pinned {!editingId && '(save note first)'}
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={closeComposer}
                    className={cn('px-4 py-2 rounded-lg text-sm transition-colors', theme !== 'light' ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700')}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveDraft}
                    disabled={!draft.title.trim() && !draft.body.trim()}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      (!draft.title.trim() && !draft.body.trim())
                        ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                        : (theme !== 'light' ? 'bg-white text-zinc-900 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800')
                    )}
                  >
                    {editingId ? 'Save Changes' : 'Add Note'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
