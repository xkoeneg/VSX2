// ============================================================================
// AICopilotWidget.tsx
//
// Floating bottom-right "System Copilot" chat widget. Talks to Gemini via
// geminiService.ts, executes any tool calls via copilotTools.ts against the
// real AppContext, and renders the conversation. Mount this once, near
// <SettingsModal /> in App.tsx's AppShell, so it floats above every screen.
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import { Sparkles, X, Send, Loader2, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import {
  callGemini,
  buildSystemPrompt,
  hasUsableGeminiKey,
  resolveGeminiApiKey,
  GEMINI_API_KEY_STORAGE_KEY,
  type GeminiContent,
} from '../../services/geminiService';
import { COPILOT_TOOLS, dispatchCopilotAction, buildContextSnapshot } from '../../services/copilotTools';

type ChatRole = 'user' | 'assistant' | 'system';

interface ChatBubble {
  id: string;
  role: ChatRole;
  text: string;
  ok?: boolean; // only meaningful for role === 'system'
}

const QUICK_ACTIONS = [
  'Log a new trade',
  'Filter NYC session trades',
  'Review my anti-mistakes',
  "What's my win rate?",
];

const MAX_TOOL_HOPS = 3; // guard against runaway function-call chains

function uid() {
  return Math.random().toString(36).slice(2);
}

export function AICopilotWidget() {
  const ctx = useAppContext();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatBubble[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [hasKey, setHasKey] = useState(hasUsableGeminiKey());

  const historyRef = useRef<GeminiContent[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Re-check key presence whenever the widget is opened (covers the case
  // where the user just pasted a key into Settings in another tab of the
  // app without a full reload).
  useEffect(() => {
    if (isOpen) setHasKey(hasUsableGeminiKey());
  }, [isOpen]);

  // Also react live if the key is saved while this widget is mounted.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === GEMINI_API_KEY_STORAGE_KEY) setHasKey(hasUsableGeminiKey());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isSending]);

  function pushBubble(bubble: Omit<ChatBubble, 'id'>) {
    setMessages(prev => [...prev, { ...bubble, id: uid() }]);
  }

  async function sendMessage(rawText: string) {
    const text = rawText.trim();
    if (!text || isSending) return;

    const apiKey = resolveGeminiApiKey();
    if (!apiKey) {
      pushBubble({ role: 'system', ok: false, text: 'No Gemini API key set. Add one in Settings → System Copilot.' });
      return;
    }

    setInput('');
    pushBubble({ role: 'user', text });
    historyRef.current = [...historyRef.current, { role: 'user', parts: [{ text }] }];
    setIsSending(true);

    try {
      let hops = 0;
      // Loop lets the model chain a function call -> see the result ->
      // respond in text, without the user having to prompt again.
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const systemPrompt = buildSystemPrompt(buildContextSnapshot(ctx));
        const result = await callGemini({
          apiKey,
          systemPrompt,
          history: historyRef.current,
          tools: COPILOT_TOOLS,
        });

        if (result.rawContent) historyRef.current = [...historyRef.current, result.rawContent];

        if (result.text) pushBubble({ role: 'assistant', text: result.text });

        if (result.functionCalls.length === 0) break;
        if (hops >= MAX_TOOL_HOPS) {
          pushBubble({ role: 'system', ok: false, text: 'Stopped after several chained actions — ask again if you need more.' });
          break;
        }
        hops += 1;

        const functionResponseParts: GeminiContent['parts'] = [];
        for (const call of result.functionCalls) {
          const outcome = dispatchCopilotAction(call.name, call.args, ctx);
          pushBubble({ role: 'system', ok: outcome.ok, text: outcome.message });
          functionResponseParts.push({
            functionResponse: { id: call.id, name: call.name, response: { result: outcome.message, ok: outcome.ok } },
          });
        }
        // Gemini 3.x wants tool results sent back with role 'user', with
        // each functionResponse.id matching the functionCall.id it answers.
        historyRef.current = [...historyRef.current, { role: 'user', parts: functionResponseParts }];
        // loop again so the model can turn the function result into a
        // natural-language confirmation, or chain a follow-up action
      }
    } catch (err) {
      pushBubble({ role: 'system', ok: false, text: (err as Error).message || 'Something went wrong talking to Gemini.' });
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  // ---------------------------------------------------------------------
  // Collapsed FAB
  // ---------------------------------------------------------------------
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open System Copilot"
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-200 shadow-2xl transition-colors hover:border-zinc-600 hover:bg-zinc-800"
      >
        <Sparkles size={20} className="text-emerald-400" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex h-[560px] w-[380px] flex-col overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles size={16} className="shrink-0 text-emerald-400" />
          <span className="truncate text-sm font-semibold text-white">System Copilot</span>
          <span
            className={[
              'ml-1 flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wide shrink-0',
              hasKey
                ? 'border-emerald-800 bg-emerald-950/50 text-emerald-400'
                : 'border-amber-800 bg-amber-950/50 text-amber-400',
            ].join(' ')}
          >
            {hasKey ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
            {hasKey ? 'Ready' : 'No key'}
          </span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          aria-label="Close System Copilot"
          className="shrink-0 rounded-md p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
        >
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
        {!hasKey && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-800/60 bg-amber-950/30 px-3 py-2.5 text-xs text-amber-300">
            <KeyRound size={14} className="mt-0.5 shrink-0" />
            <span>
              Add your Gemini API key in{' '}
              <button
                className="underline underline-offset-2 hover:text-amber-200"
                onClick={() => {
                  ctx.setIsSettingsModalOpen(true);
                  ctx.setSettingsModalTab('copilot');
                }}
              >
                Settings → System Copilot
              </button>{' '}
              to start chatting.
            </span>
          </div>
        )}

        {messages.length === 0 && hasKey && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-800/30 px-3 py-2.5 text-xs leading-relaxed text-zinc-400">
            Ask me about your stats, or tell me to log a trade, filter your history, or jump to a screen.
          </div>
        )}

        {messages.map(m => (
          <ChatBubbleView key={m.id} bubble={m} />
        ))}

        {isSending && (
          <div className="flex items-center gap-2 px-1 text-xs text-zinc-500">
            <Loader2 size={12} className="animate-spin" />
            Thinking…
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex shrink-0 flex-wrap gap-1.5 border-t border-zinc-800 px-3 py-2">
        {QUICK_ACTIONS.map(action => (
          <button
            key={action}
            disabled={isSending}
            onClick={() => sendMessage(action)}
            className="rounded-full border border-zinc-700 bg-zinc-800/60 px-2.5 py-1 text-[11px] text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800 disabled:opacity-40"
          >
            {action}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex shrink-0 items-center gap-2 border-t border-zinc-800 p-2.5">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
          placeholder={hasKey ? 'Ask System Copilot…' : 'Set your API key first…'}
          className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-zinc-500 disabled:opacity-50"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={isSending || !input.trim()}
          aria-label="Send"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}

function ChatBubbleView({ bubble }: { bubble: ChatBubble }) {
  if (bubble.role === 'system') {
    return (
      <div className="flex justify-center">
        <div
          className={[
            'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-mono',
            bubble.ok === false
              ? 'border-rose-900/60 bg-rose-950/30 text-rose-400'
              : 'border-emerald-900/60 bg-emerald-950/30 text-emerald-400',
          ].join(' ')}
        >
          {bubble.ok === false ? <AlertCircle size={11} /> : <CheckCircle2 size={11} />}
          {bubble.text}
        </div>
      </div>
    );
  }

  const isUser = bubble.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={[
          'max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-[13px] leading-relaxed',
          isUser ? 'bg-zinc-100 text-zinc-900' : 'border border-zinc-800 bg-zinc-800/60 text-zinc-100',
        ].join(' ')}
      >
        {bubble.text}
      </div>
    </div>
  );
}
