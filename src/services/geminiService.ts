// ============================================================================
// geminiService.ts
//
// Thin client for Google's Gemini API (gemini-1.5-flash) used by the
// in-app "System Copilot". Talks directly to Google from the browser
// (BYOK model) — there is no backend proxy, so the user's own API key
// never leaves their machine except to call generativelanguage.googleapis.com.
//
// This file is intentionally dumb: it knows how to (a) resolve an API key,
// (b) build a system prompt out of a snapshot of app state, and (c) make
// one generateContent call. It knows nothing about AppContext or React —
// that wiring lives in copilotTools.ts / AICopilotWidget.tsx.
// ============================================================================

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Same storage key used by the Settings panel (GeminiApiKeySection.tsx).
// Deliberately localStorage, not Supabase: this is the one piece of app
// state that should NEVER round-trip through our backend — it's a
// user-owned secret for a third-party API, not journal data.
export const GEMINI_API_KEY_STORAGE_KEY = 'vsx_gemini_api_key';

export function getStoredGeminiApiKey(): string {
  try {
    return localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY)?.trim() || '';
  } catch {
    return '';
  }
}

export function setStoredGeminiApiKey(key: string): void {
  try {
    if (key.trim()) localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, key.trim());
    else localStorage.removeItem(GEMINI_API_KEY_STORAGE_KEY);
  } catch {
    // localStorage unavailable (private browsing etc.) — silently no-op,
    // the widget will just report "no API key" and prompt again.
  }
}

/**
 * Resolution order per the BYOK spec: user's own key (local storage /
 * settings state) always wins if present, otherwise fall back to a
 * developer-provided build-time key for local/dev usage.
 */
export function resolveGeminiApiKey(userSuppliedKey?: string): string {
  const fromArg = userSuppliedKey?.trim();
  if (fromArg) return fromArg;
  const fromStorage = getStoredGeminiApiKey();
  if (fromStorage) return fromStorage;
  const fromEnv = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim();
  return fromEnv || '';
}

export function hasUsableGeminiKey(): boolean {
  return resolveGeminiApiKey().length > 0;
}

// ----------------------------------------------------------------------------
// Gemini wire types (subset of the v1beta generateContent schema — only
// what this widget actually uses).
// ----------------------------------------------------------------------------

export interface GeminiFunctionDeclaration {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export type GeminiPart =
  | { text: string }
  | { functionCall: { name: string; args: Record<string, unknown> } }
  | { functionResponse: { name: string; response: Record<string, unknown> } };

export interface GeminiContent {
  role: 'user' | 'model' | 'function';
  parts: GeminiPart[];
}

interface GenerateContentResponse {
  candidates?: Array<{
    content: { role: string; parts: GeminiPart[] };
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
  error?: { message: string; status?: string };
}

export interface CopilotTurnResult {
  /** Plain-text reply from the model, if any (may be empty if it only called functions). */
  text: string;
  /** Any function/tool calls the model wants executed. */
  functionCalls: Array<{ name: string; args: Record<string, unknown> }>;
  /** The raw model content block, needed to append to history / send functionResponses back. */
  rawContent: GeminiContent | null;
}

/**
 * Single call to Gemini's generateContent endpoint.
 */
export async function callGemini(params: {
  apiKey: string;
  systemPrompt: string;
  history: GeminiContent[];
  tools?: GeminiFunctionDeclaration[];
}): Promise<CopilotTurnResult> {
  const { apiKey, systemPrompt, history, tools } = params;

  if (!apiKey) {
    throw new Error(
      'No Gemini API key configured. Add one in Settings → System Copilot to use the AI copilot.'
    );
  }

  const body: Record<string, unknown> = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: history,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1024,
    },
  };

  if (tools && tools.length > 0) {
    body.tools = [{ functionDeclarations: tools }];
    // AUTO lets the model decide whether a function call is warranted;
    // it will still answer in plain text for anything conversational.
    body.tool_config = { function_calling_config: { mode: 'AUTO' } };
  }

  const res = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data: GenerateContentResponse = await res.json();

  if (!res.ok) {
    const message = data.error?.message || `Gemini request failed (HTTP ${res.status}).`;
    throw new Error(message);
  }

  if (data.promptFeedback?.blockReason) {
    return {
      text: `I can't respond to that (blocked: ${data.promptFeedback.blockReason}).`,
      functionCalls: [],
      rawContent: null,
    };
  }

  const candidate = data.candidates?.[0];
  const parts = candidate?.content?.parts || [];

  const text = parts
    .filter((p): p is { text: string } => 'text' in p)
    .map(p => p.text)
    .join('')
    .trim();

  const functionCalls = parts
    .filter((p): p is { functionCall: { name: string; args: Record<string, unknown> } } => 'functionCall' in p)
    .map(p => p.functionCall);

  return {
    text,
    functionCalls,
    rawContent: candidate?.content
      ? { role: 'model', parts: candidate.content.parts }
      : null,
  };
}

// ----------------------------------------------------------------------------
// System prompt construction
// ----------------------------------------------------------------------------

/**
 * A deliberately-lightweight snapshot of live app state. Built fresh from
 * useAppContext() on every message so the copilot always has current
 * numbers — see buildContextSnapshot() in copilotTools.ts for how this
 * gets assembled from the real context.
 */
export interface CopilotContextSnapshot {
  currentScreen: string;
  accounts: Array<{ id: string; name: string; propFirm: string; type: string; startingBalance: number }>;
  selectedAccountFilter: string;
  totalTrades: number;
  totalPnL: number;
  winRate: number;
  profitFactor: number;
  disciplineFollowRate: number;
  activeRuleTitles: string[];
  recentMarketNoticeTitles: string[];
  recentMistakeTags: string[];
  tradeFilters: {
    search: string;
    account: string;
    session: string;
    outcome: string;
    rulesFollowed: string;
  };
}

const SYSTEM_PROMPT_HEADER = `You are "System Copilot", an embedded trading-journal assistant built into VSX Trading Journal, a discretionary-trading discipline & performance-tracking app.

You have two jobs:
1. Answer questions using general trading/market knowledge AND the live in-app context provided below.
2. When the user asks you to DO something in the app (log a trade, filter a list, navigate somewhere, add an account, review discipline, etc.), call the appropriate function instead of just describing how to do it. Only call a function when the user's intent to perform that action is clear — ask a brief clarifying question first if a required value (like which account, or win/loss) is missing or ambiguous, rather than guessing.

Rules:
- Never invent account IDs, trade IDs, or numeric P&L figures — use only what's in the provided context or what the user just told you.
- Keep replies short and conversational; this is a small chat widget, not a report.
- You are not a licensed financial advisor — for anything touching real trading decisions, be a helpful second pair of eyes, not a source of financial advice.
- If a request is destructive (deleting a trade, resetting an account), it's fine to call the function — the app itself will still show the user a confirmation step before anything is actually removed.`;

export function buildSystemPrompt(ctx: CopilotContextSnapshot): string {
  const accountsList =
    ctx.accounts.length > 0
      ? ctx.accounts.map(a => `  - ${a.name} (${a.propFirm || 'no firm'}, ${a.type}, id: ${a.id})`).join('\n')
      : '  (no accounts yet)';

  const rulesList = ctx.activeRuleTitles.length > 0 ? ctx.activeRuleTitles.slice(0, 20).join('; ') : '(none defined yet)';
  const noticesList =
    ctx.recentMarketNoticeTitles.length > 0 ? ctx.recentMarketNoticeTitles.slice(0, 10).join('; ') : '(none yet)';
  const mistakesList = ctx.recentMistakeTags.length > 0 ? ctx.recentMistakeTags.slice(0, 15).join(', ') : '(none logged)';

  return `${SYSTEM_PROMPT_HEADER}

=== LIVE APP CONTEXT (read-only snapshot, may be stale by a few seconds) ===
Current screen: ${ctx.currentScreen}
Active account filter: ${ctx.selectedAccountFilter}

Accounts:
${accountsList}

Performance summary (current filter scope):
  - Total trades: ${ctx.totalTrades}
  - Total P&L: ${ctx.totalPnL.toFixed(2)}
  - Win rate: ${ctx.winRate.toFixed(1)}%
  - Profit factor: ${ctx.profitFactor.toFixed(2)}
  - Rule follow rate: ${ctx.disciplineFollowRate.toFixed(0)}%

Active rules (Playbook): ${rulesList}
Recent Market Notices: ${noticesList}
Recently logged mistake tags: ${mistakesList}

Current Trade History filters: search="${ctx.tradeFilters.search}", account=${ctx.tradeFilters.account}, session=${ctx.tradeFilters.session}, outcome=${ctx.tradeFilters.outcome}, rulesFollowed=${ctx.tradeFilters.rulesFollowed}
=== END CONTEXT ===`;
}
