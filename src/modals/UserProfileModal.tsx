import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Camera,
  Eye,
  EyeOff,
  Copy,
  Check,
  LogOut,
  Link as LinkIcon,
  RefreshCw,
  AlertTriangle,
  User as UserIcon,
  Loader2,
  DollarSign,
  Percent,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { ModalBackdrop } from '../components/shared/ModalBackdrop';
import { cn } from '../utils/format';
import { supabase } from '../lib/supabaseClient';

export type AuthUser = {
  id: string | null;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  // When set, the small avatar bubble should render as solid-color
  // initials instead of `avatarUrl` — mirrors public.profiles.avatar_preset_color.
  // Kept in AuthUser (not just local ProfilePrefs) so Sidebar's own small
  // avatar bubble can actually see which preset was picked; it used to
  // live only in the modal's local ProfilePrefs, which Sidebar never had
  // access to, so a chosen preset color never showed up outside the modal.
  avatarPresetColor?: string | null;
  hideEmail?: boolean;
  // Two-factor viewer access: a passcode picks the view mode (full $ vs
  // masked %/R:R), the master password is the shared second factor that
  // must ALSO be correct regardless of which passcode was entered. See
  // handleViewerPasscodeSubmit in LoginPage.tsx and the verify_viewer_access
  // RPC for the actual gate — these two passcodes alone are not sufficient
  // to unlock anything without the master password too.
  investorPasscode?: string;
  friendPasscode?: string;
  // Never populated with the real secret — the profiles row only ever
  // stores a server-side bcrypt hash (master_password_hash, via pgcrypto),
  // and that hash is never sent back to the client. This flag just tells
  // the UI "a master password is already set" so the settings field can
  // show a neutral placeholder instead of either leaking or re-prompting
  // for a password that already exists.
  hasMasterPassword?: boolean;
  // Cross-device source of truth for whether /preview/[id] is currently
  // reachable at all for this user (see public_preview_enabled in
  // sql/001_preview_access.sql). Wiring this in fully means loading it
  // wherever AuthUser is populated from `profiles` on sign-in — that logic
  // lives in context/AppContext.tsx, which wasn't part of what I could see
  // here, so for now it's read the same way the passcodes already are
  // below (authUser value wins, falls back to the local-only cache) and
  // needs that same fetch added on the AppContext side to be fully synced.
  publicPreviewEnabled?: boolean;
};

type ProfilePrefs = {
  hideEmail: boolean;
  publicPreviewEnabled: boolean;
  investorPasscode: string;
  friendPasscode: string;
  avatarPresetColor: string | null;
};

// Exported so Sidebar's own small avatar bubble can render the same
// preset swatch + initials treatment as this modal does.
export const AVATAR_PRESETS: { id: string; className: string }[] = [
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

export function getInitials(name: string): string {
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
    return {
      id: typeof parsed.id === 'string' ? parsed.id : null,
      email: typeof parsed.email === 'string' ? parsed.email : null,
      name: typeof parsed.name === 'string' ? parsed.name : null,
      avatarUrl: typeof parsed.avatarUrl === 'string' ? parsed.avatarUrl : null,
      avatarPresetColor: typeof parsed.avatarPresetColor === 'string' ? parsed.avatarPresetColor : null,
      hideEmail: typeof parsed.hideEmail === 'boolean' ? parsed.hideEmail : undefined,
      investorPasscode: typeof parsed.investorPasscode === 'string' ? parsed.investorPasscode : undefined,
      friendPasscode: typeof parsed.friendPasscode === 'string' ? parsed.friendPasscode : undefined,
      hasMasterPassword: typeof parsed.hasMasterPassword === 'boolean' ? parsed.hasMasterPassword : undefined,
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
    investorPasscode: generatePasscode(),
    friendPasscode: generatePasscode(),
    avatarPresetColor: null,
  };
  try {
    const raw = localStorage.getItem(prefsKey(email));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return {
      hideEmail: Boolean(parsed.hideEmail),
      publicPreviewEnabled: Boolean(parsed.publicPreviewEnabled),
      investorPasscode: typeof parsed.investorPasscode === 'string' && parsed.investorPasscode ? parsed.investorPasscode : fallback.investorPasscode,
      friendPasscode: typeof parsed.friendPasscode === 'string' && parsed.friendPasscode ? parsed.friendPasscode : fallback.friendPasscode,
      avatarPresetColor: typeof parsed.avatarPresetColor === 'string' ? parsed.avatarPresetColor : null,
    };
  } catch {
    return fallback;
  }
}

// One row of the two-passcode UI (investor or friend). Both behave
// identically — value/regenerate/confirm — they just differ in copy and
// which piece of state they're wired to, so this stays a plain prop-driven
// component rather than duplicating the JSX twice below.
function PasscodeRow({
  label,
  hint,
  accentIcon,
  value,
  onChange,
  confirming,
  onRequestRegenerate,
  onCancelRegenerate,
  onConfirmRegenerate,
}: {
  label: string;
  hint: string;
  accentIcon: React.ReactNode;
  value: string;
  onChange: (next: string) => void;
  confirming: boolean;
  onRequestRegenerate: () => void;
  onCancelRegenerate: () => void;
  onConfirmRegenerate: () => void;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-2.5">
      <div className="flex items-center gap-1.5 mb-1.5">
        {accentIcon}
        <p className="text-xs font-medium text-white">{label}</p>
      </div>
      <p className="text-[11px] text-zinc-500 mb-2">{hint}</p>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase().slice(0, 16))}
          placeholder="Passcode"
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white font-mono tracking-widest placeholder:text-zinc-600 focus:outline-none focus:border-emerald-600/60"
        />
        <button
          type="button"
          onClick={onRequestRegenerate}
          title="Generate new passcode"
          className="flex-shrink-0 p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {confirming && (
        <div className="flex flex-col gap-2 mt-2 px-3 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-start gap-2 text-xs text-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>Generating a new code replaces this one. Anyone using the current passcode will lose access as soon as you save.</span>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={onCancelRegenerate}
              className="px-2.5 py-1 rounded text-xs font-medium text-zinc-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirmRegenerate}
              className="px-2.5 py-1 rounded text-xs font-medium bg-amber-500 text-amber-950 hover:bg-amber-400 transition-colors"
            >
              Generate new code
            </button>
          </div>
        </div>
      )}
    </div>
  );
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
  const [investorPasscode, setInvestorPasscode] = useState('');
  const [friendPasscode, setFriendPasscode] = useState('');

  // Second factor required alongside EITHER passcode above. Deliberately
  // never pre-filled from a saved value — the server only ever gives us
  // back `hasMasterPassword` (a boolean), never the password or its hash —
  // so this field starts empty every time the modal opens and only gets
  // sent/changed if the user actually types something new.
  const [masterPasswordInput, setMasterPasswordInput] = useState('');
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [hasMasterPassword, setHasMasterPassword] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [copied, setCopied] = useState<'investor' | 'friend' | null>(null);
  // Gates each regenerate ⟳ button behind an explicit confirmation — once
  // saved, a new passcode immediately locks out anyone still using the old
  // one, so this shouldn't be a single accidental click. Tracks which of
  // the two passcodes is mid-confirmation (or neither).
  const [confirmingRegenerate, setConfirmingRegenerate] = useState<'investor' | 'friend' | null>(null);

  // Reset local editing state from the source of truth whenever the modal opens
  useEffect(() => {
    if (!isOpen) return;
    const prefs = loadPrefs(authUser?.email ?? null);
    setEditableName(authUser?.name ?? '');
    setUploadedAvatar(null);
    // authUser.avatarPresetColor / hideEmail / investorPasscode / friendPasscode are synced
    // from the public.profiles table (cross-device source of truth); the
    // local prefs value is only a same-browser fallback for when that
    // hasn't loaded yet (e.g. first paint before the auth fetch resolves).
    // publicPreviewEnabled isn't in the profiles table yet, so it stays
    // local-only for now.
    setAvatarPresetColor(
      authUser && typeof authUser.avatarPresetColor !== 'undefined' ? authUser.avatarPresetColor : prefs.avatarPresetColor
    );
    setHideEmail(typeof authUser?.hideEmail === 'boolean' ? authUser.hideEmail : prefs.hideEmail);
    setPublicPreviewEnabled(
      typeof authUser?.publicPreviewEnabled === 'boolean' ? authUser.publicPreviewEnabled : prefs.publicPreviewEnabled
    );
    setInvestorPasscode(authUser?.investorPasscode || prefs.investorPasscode);
    setFriendPasscode(authUser?.friendPasscode || prefs.friendPasscode);
    setMasterPasswordInput('');
    setShowMasterPassword(false);
    setHasMasterPassword(Boolean(authUser?.hasMasterPassword));
    setSaveError(null);
    setAvatarError(null);
    setCopied(null);
    setConfirmingRegenerate(null);
  }, [
    isOpen,
    authUser?.email,
    authUser?.name,
    authUser?.hideEmail,
    authUser?.investorPasscode,
    authUser?.friendPasscode,
    authUser?.hasMasterPassword,
    authUser?.avatarPresetColor,
    authUser?.publicPreviewEnabled,
  ]);

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

  // NOTE: this used to be `btoa(displayEmail)...` — a hash of the email,
  // not the actual user id. That silently broke the /preview/[user_id]
  // route (get_preview_journal looks up profiles by real id), so this now
  // uses authUser.id directly, same as what's stored in `profiles.id`.
  const publicPreviewLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/preview/${
    authUser?.id || 'demo'
  }`;

  const handleCopyLink = async (kind: 'investor' | 'friend') => {
    const passcode = kind === 'investor' ? investorPasscode : friendPasscode;
    const masterNote = hasMasterPassword || masterPasswordInput
      ? ' + your master password'
      : ' (set a master password below before sharing — a passcode alone won\u2019t unlock anything)';
    const text = `${publicPreviewLink} — passcode: ${passcode}${masterNote}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setAvatarError(null);
      setSaveError('Could not copy to clipboard — you can select and copy manually.');
    }
  };

  const handleSave = async () => {
    // Master password is optional to *change* on any given save, but if the
    // user is turning public preview on for the first time and hasn't set
    // one yet (locally or on the server), block the save — a passcode with
    // no master password isn't the two-factor setup that was asked for, and
    // it's better to say so here than to let someone believe they're
    // protected when they aren't.
    if (publicPreviewEnabled && !hasMasterPassword && !masterPasswordInput.trim()) {
      setSaveError('Set a master password before enabling the public preview — it\u2019s required alongside either passcode.');
      return;
    }
    if (masterPasswordInput && masterPasswordInput.trim().length < 8) {
      setSaveError('Master password must be at least 8 characters.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    const nextAvatarUrl = uploadedAvatar || (avatarPresetColor ? null : authUser?.avatarUrl ?? null);
    const nextName = editableName.trim() || null;
    const nextUser: AuthUser = {
      id: authUser?.id ?? null,
      email: authUser?.email ?? null,
      name: nextName,
      avatarUrl: nextAvatarUrl,
      avatarPresetColor,
      hideEmail,
      investorPasscode,
      friendPasscode,
      hasMasterPassword: hasMasterPassword || Boolean(masterPasswordInput.trim()),
      publicPreviewEnabled,
    };

    // 1. Persist locally first. This is the reliable primary store for UI
    // prefs like publicPreviewEnabled (still local-only) plus an instant
    // mirror of everything else — it must succeed even if the network
    // calls below fail. Deliberately excludes the master password itself —
    // that only ever lives server-side as a hash (see step 2b below), never
    // in localStorage or the AuthUser cache.
    try {
      const nextPrefs: ProfilePrefs = { hideEmail, publicPreviewEnabled, investorPasscode, friendPasscode, avatarPresetColor };
      localStorage.setItem(prefsKey(authUser?.email ?? null), JSON.stringify(nextPrefs));
      saveCachedAuthUser(nextUser);
      onPrefsSaved?.(nextPrefs);
    } catch (localErr) {
      console.error('Failed to save profile changes locally', localErr);
      setSaveError('Could not save your changes. Please try again.');
      setIsSaving(false);
      return;
    }

    // 2. Sync display_name / hide_email / viewer_passcode / avatar_url to
    // public.profiles — deliberately NOT auth user_metadata. Some OAuth
    // providers overwrite user_metadata wholesale with fresh provider
    // claims on every sign-in, which was silently wiping these settings on
    // other browsers/devices. The profiles table is a normal RLS-protected
    // row keyed by user id, so it isn't touched by the auth/OAuth flow at
    // all.
    //
    // avatar_url used to be synced via supabase.auth.updateUser({ data:
    // { avatar_url } }), which writes into auth user_metadata — and
    // user_metadata gets embedded directly into every JWT access token
    // Supabase issues. A base64-encoded photo there bloats every
    // subsequent request's Authorization header past Supabase's edge
    // proxy limits, and the connection gets killed before a response can
    // even form (net::ERR_CONNECTION_RESET / ERR_HTTP2_PROTOCOL_ERROR) —
    // which then breaks every other Supabase call in the app, not just
    // this one. Storing it as a plain profiles column avoids the JWT
    // entirely, so there's no updateUser()/refreshSession() step anymore.
    let remoteFailed = false;
    try {
      const userId = authUser?.id;
      if (!userId) throw new Error('No authenticated user id — cannot sync profile.');
      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        display_name: nextName,
        hide_email: hideEmail,
        // Plain columns, same as the old single viewer_passcode — these are
        // meant to be readable/shareable by the owner (the copy-link button
        // above needs the literal value), so they're not hashed. They're
        // also not the real gate on their own anymore: verify_viewer_access
        // requires the master password too (see below), which IS hashed.
        investor_passcode: investorPasscode,
        friend_passcode: friendPasscode,
        // Previously local-only (see the comment on `ProfilePrefs` above),
        // which meant switching this off didn't actually revoke an
        // already-shared preview link for anyone who still had it —
        // get_preview_journal() checks this column server-side, so it now
        // has to be persisted for the toggle to mean anything.
        public_preview_enabled: publicPreviewEnabled,
        avatar_url: nextAvatarUrl,
        avatar_preset_color: avatarPresetColor,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    } catch (remoteErr) {
      console.error('Could not sync profile to Supabase — local copy is saved', remoteErr);
      setSaveError('Saved on this device, but syncing to your account failed — it may not show up on other browsers yet.');
      remoteFailed = true;
    }

    // 2b. Master password goes through its own RPC rather than the plain
    // upsert above — set_master_password() hashes it server-side (pgcrypto
    // bcrypt) before it ever touches a row, so the plaintext only exists
    // for the duration of this one request and is never stored or echoed
    // back. Only called when the user actually typed a new one; leaving
    // the field blank keeps whatever password is already set.
    if (masterPasswordInput.trim()) {
      try {
        const userId = authUser?.id;
        if (!userId) throw new Error('No authenticated user id.');
        const { error } = await supabase.rpc('set_master_password', {
          p_owner_id: userId,
          p_master_password: masterPasswordInput.trim(),
        });
        if (error) throw error;
        setHasMasterPassword(true);
        nextUser.hasMasterPassword = true;
      } catch (mpErr) {
        console.error('Could not update master password', mpErr);
        setSaveError(prev => prev ?? 'Saved everything else, but the master password update failed — try again.');
        remoteFailed = true;
      }
    }
    // Always clear the typed password from state after a save attempt —
    // success or failure, it shouldn't linger in memory/the input longer
    // than it has to.
    setMasterPasswordInput('');

    onAuthUserChange(nextUser);
    setIsSaving(false);
    if (!remoteFailed) onClose();
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

        {/* Public / viewer passcodes — two-factor: a passcode picks the view
            mode, the master password (below) is required in addition to
            either one. */}
        <div className="mb-5 pt-4 border-t border-zinc-800">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">Public / Viewer Passcodes</p>
              <p className="text-xs text-zinc-500">Share a read-only preview — requires a passcode AND your master password</p>
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
            <div className="flex flex-col gap-2.5">
              <PasscodeRow
                label="Investor Passcode"
                hint="Full access — real dollar amounts"
                accentIcon={<DollarSign className="w-3.5 h-3.5 text-emerald-400" />}
                value={investorPasscode}
                onChange={setInvestorPasscode}
                confirming={confirmingRegenerate === 'investor'}
                onRequestRegenerate={() => setConfirmingRegenerate('investor')}
                onCancelRegenerate={() => setConfirmingRegenerate(null)}
                onConfirmRegenerate={() => {
                  setInvestorPasscode(generatePasscode());
                  setConfirmingRegenerate(null);
                }}
              />
              <PasscodeRow
                label="Public / Friend Passcode"
                hint="Masked — percentages and R:R only, no dollar amounts"
                accentIcon={<Percent className="w-3.5 h-3.5 text-cyan-400" />}
                value={friendPasscode}
                onChange={setFriendPasscode}
                confirming={confirmingRegenerate === 'friend'}
                onRequestRegenerate={() => setConfirmingRegenerate('friend')}
                onCancelRegenerate={() => setConfirmingRegenerate(null)}
                onConfirmRegenerate={() => {
                  setFriendPasscode(generatePasscode());
                  setConfirmingRegenerate(null);
                }}
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyLink('investor')}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-zinc-800/70 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors border border-zinc-800"
                >
                  {copied === 'investor' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="truncate">{copied === 'investor' ? 'Copied' : 'Copy investor link'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyLink('friend')}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-zinc-800/70 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors border border-zinc-800"
                >
                  {copied === 'friend' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="truncate">{copied === 'friend' ? 'Copied' : 'Copy friend link'}</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                <LinkIcon className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{publicPreviewLink}</span>
              </div>
            </div>
          )}
        </div>

        {/* Master password — the required second factor for both passcodes
            above. Only relevant (and only shown) while Public / Viewer
            Passcodes is on; with it off there's no preview to gate, so the
            field would just be confusing clutter. Field is always empty on
            open; typing something new is the only way to change it (see
            the RPC-based save in handleSave), so leaving it blank on save
            just keeps the existing password. */}
        {publicPreviewEnabled && (
          <div className="mb-5 pt-4 border-t border-zinc-800">
            <div className="flex items-center gap-1.5 mb-1">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <p className="text-sm font-medium text-white">Master Password</p>
            </div>
            <p className="text-xs text-zinc-500 mb-2">
              Required in addition to whichever passcode is entered — without it, a passcode alone can't open the preview.
            </p>
            <div className="relative">
              <input
                type={showMasterPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={masterPasswordInput}
                onChange={(e) => setMasterPasswordInput(e.target.value)}
                placeholder={hasMasterPassword ? 'Currently set — enter to change' : 'e.g. MyJournal2026!'}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-3 pr-10 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-600/60"
              />
              <button
                type="button"
                onClick={() => setShowMasterPassword(v => !v)}
                aria-label={showMasterPassword ? 'Hide password' : 'Show password'}
                className="absolute right-0 top-0 h-full w-10 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showMasterPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-zinc-500">
              <ShieldCheck className="w-3 h-3 flex-shrink-0" />
              <span>{hasMasterPassword ? 'A master password is set on this account.' : 'No master password set yet — required before sharing.'}</span>
            </div>
          </div>
        )}

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
