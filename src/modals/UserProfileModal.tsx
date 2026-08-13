import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Camera,
  Eye,
  Copy,
  Check,
  LogOut,
  Link as LinkIcon,
  RefreshCw,
  User as UserIcon,
  Loader2,
} from 'lucide-react';
import { ModalBackdrop } from '../components/shared/ModalBackdrop';
import { cn } from '../utils/format';
import { supabase } from '../lib/supabaseClient';

export type AuthUser = {
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  hideEmail?: boolean;
  publicPreviewEnabled?: boolean;
  viewerPasscode?: string;
};

type ProfilePrefs = {
  hideEmail: boolean;
  publicPreviewEnabled: boolean;
  viewerPasscode: string;
  avatarPresetColor: string | null;
};

const AVATAR_PRESETS: { id: string; className: string }[] = [
  { id: 'emerald', className: 'bg-gradient-to-br from-emerald-400 to-emerald-700' },
  { id: 'cyan', className: 'bg-gradient-to-br from-cyan-400 to-cyan-700' },
  { id: 'purple', className: 'bg-gradient-to-br from-purple-400 to-purple-700' },
  { id: 'amber', className: 'bg-gradient-to-br from-amber-400 to-amber-700' },
  { id: 'rose', className: 'bg-gradient-to-br from-rose-400 to-rose-700' },
  { id: 'zinc', className: 'bg-gradient-to-br from-zinc-500 to-zinc-800' },
];

const PASSCODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generatePasscode(length = 8): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += PASSCODE_CHARS[Math.floor(Math.random() * PASSCODE_CHARS.length)];
  }
  return out;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function maskEmail(email: string): string {
  const atIndex = email.indexOf('@');
  if (atIndex <= 0) return '••••••••';
  return `••••••••${email.slice(atIndex)}`;
}

function prefsKey(email: string | null): string {
  return `vsx-profile-prefs:${email || 'anon'}`;
}

const AUTH_CACHE_KEY = 'vsx-auth-user-cache';

// Synchronous last-known-user cache. Read this on initial state so the UI
// never has to fall back to a placeholder like "Account" while the async
// Supabase auth fetch is still in flight.
export function loadCachedAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const coerceBool = (v: unknown): boolean | undefined => {
      if (typeof v === 'boolean') return v;
      if (v === 'true') return true;
      if (v === 'false') return false;
      return undefined;
    };
    return {
      email: typeof parsed.email === 'string' ? parsed.email : null,
      name: typeof parsed.name === 'string' ? parsed.name : null,
      avatarUrl: typeof parsed.avatarUrl === 'string' ? parsed.avatarUrl : null,
      hideEmail: coerceBool(parsed.hideEmail),
      publicPreviewEnabled: coerceBool(parsed.publicPreviewEnabled),
      viewerPasscode: typeof parsed.viewerPasscode === 'string' ? parsed.viewerPasscode : undefined,
    };
  } catch {
    return null;
  }
}

export function saveCachedAuthUser(user: AuthUser): void {
  try {
    localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(user));
  } catch {
    // Best effort only — a full/unavailable localStorage shouldn't break the app.
  }
}

export function clearCachedAuthUser(): void {
  try {
    localStorage.removeItem(AUTH_CACHE_KEY);
  } catch {
    // ignore
  }
}

// Lightweight read used by Sidebar to apply "Hide Email in UI" outside the modal itself
export function loadHideEmailPref(email: string | null): boolean {
  try {
    const raw = localStorage.getItem(prefsKey(email));
    if (!raw) return false;
    return Boolean(JSON.parse(raw).hideEmail);
  } catch {
    return false;
  }
}

function loadPrefs(email: string | null): ProfilePrefs {
  const fallback: ProfilePrefs = {
    hideEmail: false,
    publicPreviewEnabled: false,
    viewerPasscode: generatePasscode(),
    avatarPresetColor: null,
  };
  try {
    const raw = localStorage.getItem(prefsKey(email));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return {
      hideEmail: Boolean(parsed.hideEmail),
      publicPreviewEnabled: Boolean(parsed.publicPreviewEnabled),
      viewerPasscode: typeof parsed.viewerPasscode === 'string' && parsed.viewerPasscode ? parsed.viewerPasscode : fallback.viewerPasscode,
      avatarPresetColor: typeof parsed.avatarPresetColor === 'string' ? parsed.avatarPresetColor : null,
    };
  } catch {
    return fallback;
  }
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  authUser: AuthUser | null;
  onAuthUserChange: (user: AuthUser) => void;
  onSignOut: () => void;
  onPrefsSaved?: (prefs: ProfilePrefs) => void;
}

export function UserProfileModal({ isOpen, onClose, authUser, onAuthUserChange, onSignOut, onPrefsSaved }: UserProfileModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editableName, setEditableName] = useState('');
  const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(null);
  const [avatarPresetColor, setAvatarPresetColor] = useState<string | null>(null);

  const [hideEmail, setHideEmail] = useState(false);
  const [publicPreviewEnabled, setPublicPreviewEnabled] = useState(false);
  const [viewerPasscode, setViewerPasscode] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Reset local editing state from the source of truth whenever the modal opens
  useEffect(() => {
    if (!isOpen) return;
    const prefs = loadPrefs(authUser?.email ?? null);
    setEditableName(authUser?.name ?? '');
    setUploadedAvatar(null);
    setAvatarPresetColor(prefs.avatarPresetColor);
    // authUser.hideEmail / publicPreviewEnabled / viewerPasscode (synced from
    // Supabase user_metadata) are the cross-device source of truth; the
    // local prefs value is only a same-browser fallback for when that
    // hasn't loaded yet (e.g. first paint before the auth fetch resolves).
    setHideEmail(typeof authUser?.hideEmail === 'boolean' ? authUser.hideEmail : prefs.hideEmail);
    setPublicPreviewEnabled(typeof authUser?.publicPreviewEnabled === 'boolean' ? authUser.publicPreviewEnabled : prefs.publicPreviewEnabled);
    setViewerPasscode(authUser?.viewerPasscode || prefs.viewerPasscode);
    setSaveError(null);
    setAvatarError(null);
    setCopied(false);
  }, [isOpen, authUser?.email, authUser?.name, authUser?.hideEmail, authUser?.publicPreviewEnabled, authUser?.viewerPasscode]);

  if (!isOpen) return null;

  const displayEmail = authUser?.email || '';

  const currentAvatarSrc = uploadedAvatar || (!avatarPresetColor ? authUser?.avatarUrl || null : null);
  const currentPreset = avatarPresetColor ? AVATAR_PRESETS.find(p => p.id === avatarPresetColor) : null;

  const handleAvatarFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setAvatarError(null);
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please choose an image file.');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setAvatarError('Image is too large — please pick one under 3MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedAvatar(typeof reader.result === 'string' ? reader.result : null);
      setAvatarPresetColor(null);
    };
    reader.onerror = () => setAvatarError('Could not read that file — please try another image.');
    reader.readAsDataURL(file);
  };

  const handlePickPreset = (id: string) => {
    setAvatarPresetColor(prev => (prev === id ? null : id));
    setUploadedAvatar(null);
  };

  const publicPreviewLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/preview/${
    displayEmail ? btoa(displayEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 10) : 'demo'
  }`;

  const handleCopyLink = async () => {
    const text = `${publicPreviewLink} — passcode: ${viewerPasscode}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setAvatarError(null);
      setSaveError('Could not copy to clipboard — you can select and copy manually.');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    const nextAvatarUrl = uploadedAvatar || (avatarPresetColor ? null : authUser?.avatarUrl ?? null);
    const nextName = editableName.trim() || null;
    const nextUser: AuthUser = {
      email: authUser?.email ?? null,
      name: nextName,
      avatarUrl: nextAvatarUrl,
      hideEmail,
      publicPreviewEnabled,
      viewerPasscode,
    };

    // 1. Persist locally first. This is the reliable primary store for UI
    // prefs like hideEmail/publicPreviewEnabled/viewerPasscode plus the
    // display name/avatar — it must succeed even if the Supabase call below
    // fails (e.g. a custom profile column isn't set up yet).
    try {
      const nextPrefs: ProfilePrefs = { hideEmail, publicPreviewEnabled, viewerPasscode, avatarPresetColor };
      localStorage.setItem(prefsKey(authUser?.email ?? null), JSON.stringify(nextPrefs));
      saveCachedAuthUser(nextUser);
      onPrefsSaved?.(nextPrefs);
    } catch (localErr) {
      console.error('Failed to save profile changes locally', localErr);
      setSaveError('Could not save your changes. Please try again.');
      setIsSaving(false);
      return;
    }

    // 2. Best-effort sync to Supabase. Any failure here (network, missing
    // column, validation, etc.) is logged but never blocks the local save
    // that already succeeded above.
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: nextName,
          avatar_url: nextAvatarUrl,
          hide_email: hideEmail,
          public_preview_enabled: publicPreviewEnabled,
          viewer_passcode: viewerPasscode,
        },
      });
      if (error) throw error;

      // updateUser() already returns the fresh user object, but the
      // *session* (and its JWT) other parts of the app read via
      // getSession() can still be serving a token minted before this
      // write. Force a refresh so a subsequent getSession() call — in
      // this tab or another — sees the new metadata immediately rather
      // than waiting for the token's normal refresh cycle.
      try {
        await supabase.auth.refreshSession();
      } catch (refreshErr) {
        // Non-fatal: the metadata write above already succeeded, and
        // onAuthStateChange / the next natural token refresh will
        // eventually pick it up regardless.
        console.error('Metadata saved, but session refresh failed', refreshErr);
      }
    } catch (remoteErr) {
      console.error('Could not sync profile changes to Supabase — local copy is saved', remoteErr);
    }

    onAuthUserChange(nextUser);
    setIsSaving(false);
    onClose();
  };

  return createPortal(
    <ModalBackdrop
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">Profile &amp; Account Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-shrink-0">
            <div
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center overflow-hidden border border-zinc-700',
                currentPreset ? currentPreset.className : 'bg-zinc-800'
              )}
            >
              {currentAvatarSrc ? (
                <img src={currentAvatarSrc} alt={editableName || 'Avatar'} className="w-full h-full object-cover" />
              ) : currentPreset ? (
                <span className="text-sm font-semibold text-white select-none">
                  {getInitials(editableName || 'Account')}
                </span>
              ) : (
                <UserIcon className="w-6 h-6 text-zinc-400" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Change photo"
              className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors shadow-md"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFilePick} />
          </div>

          <div className="min-w-0 flex-1">
            <label className="block text-xs font-medium text-zinc-400 mb-1">Display Name</label>
            <input
              type="text"
              value={editableName}
              onChange={(e) => setEditableName(e.target.value)}
              placeholder="Your name"
              maxLength={60}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-600/60"
            />
          </div>
        </div>

        {/* Avatar presets */}
        <div className="flex items-center gap-2 mb-1">
          {AVATAR_PRESETS.map(preset => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePickPreset(preset.id)}
              title="Use this preset"
              className={cn(
                'w-6 h-6 rounded-full flex-shrink-0 transition-all',
                preset.className,
                avatarPresetColor === preset.id ? 'ring-2 ring-offset-2 ring-offset-zinc-900 ring-emerald-400' : 'opacity-80 hover:opacity-100'
              )}
            />
          ))}
        </div>
        {avatarError && <p className="text-xs text-rose-400 mb-2">{avatarError}</p>}
        <p className="text-[11px] text-zinc-500 mb-5">Upload a photo, or pick a preset color to use your initials instead.</p>

        {/* Email privacy */}
        <div className="mb-5 pt-4 border-t border-zinc-800">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">Hide Email in UI</p>
              <p className="text-xs text-zinc-500">Completely omit your email address wherever it's shown</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={hideEmail}
              onClick={() => setHideEmail(prev => !prev)}
              className={cn(
                'relative flex-shrink-0 w-10 h-6 rounded-full transition-colors',
                hideEmail ? 'bg-emerald-500' : 'bg-zinc-700'
              )}
            >
              <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform', hideEmail && 'translate-x-4')} />
            </button>
          </div>
          {displayEmail && !hideEmail && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-800">
              <Eye className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
              <span className="text-xs text-zinc-400 truncate font-mono">{displayEmail}</span>
            </div>
          )}
        </div>

        {/* Public / viewer passcode */}
        <div className="mb-5 pt-4 border-t border-zinc-800">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">Public / Viewer Passcode</p>
              <p className="text-xs text-zinc-500">Share a read-only preview with investors or viewers</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={publicPreviewEnabled}
              onClick={() => setPublicPreviewEnabled(prev => !prev)}
              className={cn(
                'relative flex-shrink-0 w-10 h-6 rounded-full transition-colors',
                publicPreviewEnabled ? 'bg-emerald-500' : 'bg-zinc-700'
              )}
            >
              <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform', publicPreviewEnabled && 'translate-x-4')} />
            </button>
          </div>

          {publicPreviewEnabled && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={viewerPasscode}
                  onChange={(e) => setViewerPasscode(e.target.value.toUpperCase().slice(0, 16))}
                  placeholder="Viewer passcode"
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white font-mono tracking-widest placeholder:text-zinc-600 focus:outline-none focus:border-emerald-600/60"
                />
                <button
                  type="button"
                  onClick={() => setViewerPasscode(generatePasscode())}
                  title="Generate new passcode"
                  className="flex-shrink-0 p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-zinc-800/70 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors border border-zinc-800"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="truncate">{copied ? 'Copied link & passcode' : 'Copy preview link & passcode'}</span>
              </button>

              <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                <LinkIcon className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{publicPreviewLink}</span>
              </div>
            </div>
          )}
        </div>

        {saveError && <p className="text-xs text-rose-400 mb-3">{saveError}</p>}

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSaving ? 'Saving…' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium bg-transparent border border-red-900/50 text-red-400/90 hover:bg-red-950/20 hover:text-red-300 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </ModalBackdrop>,
    document.body
  );
}
