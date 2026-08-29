// ============================================================================
// GeminiApiKeySection.tsx
//
// Drop this into SettingsModal.tsx as its own tab/section (the widget looks
// for ctx.setSettingsModalTab('copilot') — add a 'copilot' entry to
// whatever union type settingsModalTab already uses, and render
// <GeminiApiKeySection /> when that tab is active).
//
// Not wired into a tab automatically here because SettingsModal.tsx wasn't
// part of what I was given — this component is self-contained and only
// needs to be placed inside the modal's existing tab-switch UI.
// ============================================================================

import { useState } from 'react';
import { KeyRound, ExternalLink, Eye, EyeOff, Check, Trash2 } from 'lucide-react';
import { getStoredGeminiApiKey, setStoredGeminiApiKey } from '../../services/geminiService';

export function GeminiApiKeySection() {
  const [key, setKey] = useState(() => getStoredGeminiApiKey());
  const [reveal, setReveal] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  function handleSave() {
    setStoredGeminiApiKey(key);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  }

  function handleClear() {
    setKey('');
    setStoredGeminiApiKey('');
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800/60">
          <KeyRound size={15} className="text-emerald-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">System Copilot — Gemini API Key</h3>
          <p className="mt-1 text-xs leading-relaxed text-zinc-400">
            The in-app AI copilot uses Google's Gemini API directly from your browser. Your key is stored only
            on this device (never sent to our servers) and is used solely to authenticate your own requests to Google.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-zinc-400">API Key</label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type={reveal ? 'text' : 'password'}
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="AIza..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 pr-9 text-sm text-white placeholder-zinc-600 outline-none focus:border-zinc-500"
            />
            <button
              type="button"
              onClick={() => setReveal(r => !r)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              aria-label={reveal ? 'Hide key' : 'Show key'}
            >
              {reveal ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={!key.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600"
          >
            {savedFlash ? <Check size={13} /> : null}
            {savedFlash ? 'Saved' : 'Save'}
          </button>
          <button
            onClick={handleClear}
            disabled={!key.trim()}
            aria-label="Remove key"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-700 text-zinc-500 transition-colors hover:border-rose-800 hover:text-rose-400 disabled:opacity-30"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <a
        href="https://aistudio.google.com/app/apikey"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300"
      >
        Get a free API key from Google AI Studio
        <ExternalLink size={12} />
      </a>
    </div>
  );
}
