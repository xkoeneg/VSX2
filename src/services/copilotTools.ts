// ============================================================================
// copilotTools.ts
//
// Two things live here:
//  1. COPILOT_TOOLS — the Gemini functionDeclarations payload describing
//     every app action the model is allowed to trigger.
//  2. dispatchCopilotAction() — takes a { name, args } call from Gemini and
//     maps it onto the REAL handlers returned by useAppState() (via
//     useAppContext()). Nothing here is invented; every branch below calls
//     an existing handler from AppContext.tsx / useAppState.tsx.
//
// IMPORTANT PATTERN NOTE:
// Several mutation handlers in this codebase (handleAddTrade,
// handleAddAccount, ...) don't take arguments — they read from a "draft"
// piece of state (newTrade/setNewTrade, newAccount/setNewAccount) that the
// existing forms also write to. So "AI creates a trade" is implemented the
// same way a human filling out the Add Trade modal would: populate the
// draft via setNewTrade(...), then call handleAddTrade(). This means the
// copilot is reusing the exact same validation/Supabase-write path as the
// UI — nothing is bypassed.
//
// SAFETY / SCOPE NOTE:
// This is a representative, high-value slice of the app's actions, not
// literally every CRUD function in useAppState (that return object has
// 300+ members, most of them raw setState for form/UI plumbing). Two
// deliberate exclusions:
//   - handleFullSystemReset is NOT exposed to the model. A chat-driven
//     "wipe everything" action is a bad idea regardless of how well the
//     model is prompted.
//   - Deletes call the *existing* confirm-first handlers (handleDeleteTrade
//     etc.), which only ARM the app's own confirmation modal — the AI
//     cannot itself skip that human-in-the-loop step.
// Add more tools by following the same two steps: (a) add a
// GeminiFunctionDeclaration below, (b) add a case in dispatchCopilotAction.
// ============================================================================

import type { GeminiFunctionDeclaration, CopilotContextSnapshot } from './geminiService';
import type { ViewType, NoticeType } from '../types';

// The context value is the full return type of useAppState(). Importing the
// hook's return type directly (rather than redeclaring it) means this file
// can never silently drift from the real AppContext shape.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { useAppState } from '../hooks/useAppState';
type AppContextValue = ReturnType<typeof useAppState>;

const VIEW_VALUES: ViewType[] = [
  'dashboard', 'trades', 'discipline', 'lifeDiscipline', 'playbook', 'notices', 'wiki', 'calendar', 'notebook',
];

// ----------------------------------------------------------------------------
// 1. Tool schemas sent to Gemini
// ----------------------------------------------------------------------------

export const COPILOT_TOOLS: GeminiFunctionDeclaration[] = [
  {
    name: 'navigate_to_screen',
    description: 'Switch the main app view to a different screen. Use this whenever the user asks to go/see/open a particular section of the app.',
    parameters: {
      type: 'object',
      properties: {
        screen: {
          type: 'string',
          enum: VIEW_VALUES,
          description: 'Target screen. "trades" = Trade History, "discipline" = Discipline Tracker, "lifeDiscipline" = Life Discipline Hub, "playbook" = Rules Playbook, "notices" = Market Notices, "wiki" = Knowledge Wiki, "calendar" = Performance Calendar.',
        },
      },
      required: ['screen'],
    },
  },
  {
    name: 'open_add_trade_form',
    description: 'Open the blank "Add Trade" modal for the user to fill in themselves. Use this instead of log_trade when the user wants to log a trade but hasn\'t given you enough details to fill it in for them yet.',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'log_trade',
    description: "Create and save a fully-specified trade directly, without opening the manual form. Only call this once you have the account, symbol, P&L, and whether rules were followed — ask the user for anything missing first rather than guessing.",
    parameters: {
      type: 'object',
      properties: {
        accountId: { type: 'string', description: 'Exact id of the account this trade belongs to (from the Accounts list in context).' },
        symbol: { type: 'string', description: 'Ticker/instrument, e.g. "NQ", "ES", "EURUSD".' },
        profitLoss: { type: 'number', description: 'Net P&L in account currency. Negative for a loss.' },
        entryPrice: { type: 'number' },
        stopLoss: { type: 'number' },
        takeProfit: { type: 'number' },
        riskAmount: { type: 'number', description: 'Dollar amount risked on this trade.' },
        rulesFollowed: { type: 'string', enum: ['followed', 'broken'], description: 'Whether the user followed their trading rules on this trade. Required.' },
        date: { type: 'string', description: 'Trade date, YYYY-MM-DD. Defaults to today if omitted.' },
        setupTypes: { type: 'array', items: { type: 'string' }, description: 'Setup/strategy tags for this trade.' },
        mistakes: { type: 'array', items: { type: 'string' }, description: 'Mistake tags for this trade, if any.' },
        notes: { type: 'string', description: 'Free-form notes about the trade.' },
      },
      required: ['accountId', 'symbol', 'profitLoss', 'rulesFollowed'],
    },
  },
  {
    name: 'delete_trade',
    description: "Arm deletion of a specific trade by id. This opens the app's existing delete-confirmation prompt — it does not delete anything by itself.",
    parameters: {
      type: 'object',
      properties: { tradeId: { type: 'string', description: 'The id of the trade to delete.' } },
      required: ['tradeId'],
    },
  },
  {
    name: 'filter_trades',
    description: 'Apply filters to the Trade History list and navigate there. Omit any field you don\'t want to change.',
    parameters: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Free-text search (symbol, notes, etc).' },
        accountId: { type: 'string', description: 'Account id to filter to, or "all".' },
        session: { type: 'string', enum: ['all', 'NYC', 'London', 'Asia', 'Pre-market Open'] },
        outcome: { type: 'string', enum: ['all', 'profit', 'loss', 'breakeven'] },
        rulesFollowed: { type: 'string', enum: ['all', 'followed', 'broken'] },
      },
    },
  },
  {
    name: 'reset_trade_filters',
    description: 'Clear all Trade History filters back to defaults.',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'add_account',
    description: 'Create a new trading account. Ask for name and starting balance if not given.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        propFirm: { type: 'string', description: 'Prop firm name, or empty for a personal account.' },
        startingBalance: { type: 'number' },
        type: { type: 'string', enum: ['Eval', 'Phase 1', 'Phase 2', 'Funded', 'Custom Challenge'] },
        tradingAccountType: { type: 'string', enum: ['CFD', 'LIVE', 'FUTURES', 'DEMO'] },
      },
      required: ['name', 'startingBalance'],
    },
  },
  {
    name: 'record_payout_reset',
    description: 'Record a payout / reset the P&L cycle baseline for a Funded/CFD-style account, without touching trade history.',
    parameters: {
      type: 'object',
      properties: { accountId: { type: 'string' } },
      required: ['accountId'],
    },
  },
  {
    name: 'open_add_market_notice',
    description: 'Open the Add Market Notice modal, pre-set to either a mistake writeup or an insight/takeaway.',
    parameters: {
      type: 'object',
      properties: { noticeType: { type: 'string', enum: ['mistake', 'insight'] } },
      required: ['noticeType'],
    },
  },
  {
    name: 'open_add_rule',
    description: 'Open the Add Rule modal in the Rules Playbook.',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'open_settings',
    description: "Open the app's Settings panel, optionally to a specific tab.",
    parameters: {
      type: 'object',
      properties: {
        tab: { type: 'string', enum: ['appearance', 'backup', 'copilot'], description: '"copilot" is the System Copilot / Gemini API key tab.' },
      },
    },
  },
  {
    name: 'toggle_privacy_mode',
    description: 'Toggle Privacy Mode, which masks dollar figures on screen.',
    parameters: { type: 'object', properties: {} },
  },
];

// ----------------------------------------------------------------------------
// 2. Dispatcher — executes one Gemini function call against real AppContext
// ----------------------------------------------------------------------------

export interface DispatchResult {
  /** Short human-readable line shown as a "System Action" chat bubble. */
  message: string;
  ok: boolean;
}

export function dispatchCopilotAction(
  name: string,
  args: Record<string, unknown>,
  ctx: AppContextValue
): DispatchResult {
  const str = (v: unknown) => (typeof v === 'string' ? v : undefined);
  const num = (v: unknown) => (typeof v === 'number' ? v : undefined);
  const arr = (v: unknown) => (Array.isArray(v) ? (v as string[]) : undefined);

  try {
    switch (name) {
      case 'navigate_to_screen': {
        const screen = str(args.screen) as ViewType | undefined;
        if (!screen || !VIEW_VALUES.includes(screen)) {
          return { ok: false, message: `Unknown screen "${args.screen}".` };
        }
        ctx.setView(screen);
        return { ok: true, message: `Navigated to ${screen}.` };
      }

      case 'open_add_trade_form': {
        ctx.setView('trades');
        ctx.setShowAddTrade(true);
        return { ok: true, message: 'Opened the Add Trade form.' };
      }

      case 'log_trade': {
        const accountId = str(args.accountId);
        const symbol = str(args.symbol);
        const rulesFollowed = str(args.rulesFollowed);
        if (!accountId || !symbol || (rulesFollowed !== 'followed' && rulesFollowed !== 'broken')) {
          return { ok: false, message: 'Missing required trade fields (account, symbol, rulesFollowed).' };
        }
        const accountExists = ctx.accounts.some(a => a.id === accountId);
        if (!accountExists) {
          return { ok: false, message: `No account found with id "${accountId}".` };
        }
        // Populate the same draft state the Add Trade modal writes to, then
        // reuse the real handler so validation + Supabase write happen
        // exactly as they would for a manually-entered trade.
        ctx.setNewTrade(prev => ({
          ...prev,
          accountId,
          symbol: symbol.toUpperCase(),
          profitLoss: num(args.profitLoss) ?? 0,
          entryPrice: num(args.entryPrice) ?? 0,
          stopLoss: num(args.stopLoss) ?? 0,
          takeProfit: num(args.takeProfit) ?? 0,
          riskAmount: num(args.riskAmount) ?? 0,
          rulesFollowed: rulesFollowed as 'followed' | 'broken',
          date: str(args.date) || ctx.getTodayLocalDate(),
          setupTypes: arr(args.setupTypes) ?? [],
          mistakes: arr(args.mistakes) ?? [],
          mistakesAnalysis: str(args.notes) ?? '',
        }));
        // handleAddTrade reads from the newTrade state set above. React
        // batches this within the same tick/handler, so by the time
        // handleAddTrade runs in the microtask queue the draft is current.
        queueMicrotask(() => ctx.handleAddTrade());
        return { ok: true, message: `Logged ${symbol.toUpperCase()} trade (${num(args.profitLoss) ?? 0 >= 0 ? '+' : ''}${num(args.profitLoss) ?? 0}).` };
      }

      case 'delete_trade': {
        const tradeId = str(args.tradeId);
        if (!tradeId) return { ok: false, message: 'No trade id given.' };
        ctx.handleDeleteTrade(tradeId);
        return { ok: true, message: 'Delete confirmation opened — confirm in the dialog to finish.' };
      }

      case 'filter_trades': {
        ctx.setView('trades');
        if (typeof args.search === 'string') ctx.setDbSearch(args.search);
        if (typeof args.accountId === 'string') ctx.setDbAccountFilter(args.accountId);
        if (typeof args.session === 'string') ctx.setDbSessionFilter(args.session);
        if (typeof args.outcome === 'string') ctx.setDbOutcomeFilter(args.outcome as any);
        if (typeof args.rulesFollowed === 'string') ctx.setDbRulesFilter(args.rulesFollowed as any);
        return { ok: true, message: 'Filter applied to Trade History.' };
      }

      case 'reset_trade_filters': {
        ctx.setDbSearch('');
        ctx.setDbAccountFilter('all');
        ctx.setDbSessionFilter('all');
        ctx.setDbOutcomeFilter('all');
        ctx.setDbRulesFilter('all');
        return { ok: true, message: 'Trade History filters reset.' };
      }

      case 'add_account': {
        const nameVal = str(args.name);
        const startingBalance = num(args.startingBalance);
        if (!nameVal || startingBalance === undefined) {
          return { ok: false, message: 'Missing account name or starting balance.' };
        }
        ctx.setNewAccount(prev => ({
          ...prev,
          name: nameVal,
          propFirm: str(args.propFirm) ?? '',
          startingBalance,
          highestBalance: startingBalance,
          type: (str(args.type) as any) ?? 'Eval',
          tradingAccountType: (str(args.tradingAccountType) as any) ?? 'LIVE',
        }));
        queueMicrotask(() => ctx.handleAddAccount());
        return { ok: true, message: `Account "${nameVal}" added.` };
      }

      case 'record_payout_reset': {
        const accountId = str(args.accountId);
        if (!accountId) return { ok: false, message: 'No account id given.' };
        ctx.handleRecordPayoutReset(accountId);
        return { ok: true, message: 'Payout reset recorded for that account.' };
      }

      case 'open_add_market_notice': {
        const noticeType = (str(args.noticeType) as NoticeType | undefined) ?? 'mistake';
        ctx.setView('notices');
        ctx.handleOpenAddNotice(noticeType);
        return { ok: true, message: `Opened Add Market Notice (${noticeType}).` };
      }

      case 'open_add_rule': {
        ctx.setView('playbook');
        ctx.openAddRuleModal();
        return { ok: true, message: 'Opened Add Rule form.' };
      }

      case 'open_settings': {
        ctx.setIsSettingsModalOpen(true);
        const tab = str(args.tab);
        if (tab === 'appearance' || tab === 'backup' || tab === 'copilot') {
          ctx.setSettingsModalTab(tab);
        }
        return { ok: true, message: 'Opened Settings.' };
      }

      case 'toggle_privacy_mode': {
        ctx.setPrivacyMode(prev => !prev);
        return { ok: true, message: 'Privacy mode toggled.' };
      }

      default:
        return { ok: false, message: `Unrecognized action "${name}".` };
    }
  } catch (err) {
    console.error('Copilot action failed:', name, args, err);
    return { ok: false, message: `Couldn't complete "${name}": ${(err as Error).message}` };
  }
}

// ----------------------------------------------------------------------------
// 3. Context snapshot builder — turns live AppContext into the small,
//    serializable summary that goes into the system prompt.
// ----------------------------------------------------------------------------

export function buildContextSnapshot(ctx: AppContextValue): CopilotContextSnapshot {
  const trades = ctx.filteredTrades ?? ctx.trades ?? [];
  const totalTrades = trades.length;
  const totalPnL = trades.reduce((sum: number, t: any) => sum + (t.profitLoss || 0), 0);
  const wins = trades.filter((t: any) => (t.profitLoss || 0) > 0);
  const losses = trades.filter((t: any) => (t.profitLoss || 0) < 0);
  const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;
  const grossWin = wins.reduce((s: number, t: any) => s + (t.profitLoss || 0), 0);
  const grossLoss = Math.abs(losses.reduce((s: number, t: any) => s + (t.profitLoss || 0), 0));
  const profitFactor = grossLoss > 0 ? grossWin / grossLoss : 0;
  const reviewed = trades.filter((t: any) => t.rulesFollowed === 'followed' || t.rulesFollowed === 'broken');
  const followed = reviewed.filter((t: any) => t.rulesFollowed === 'followed');
  const disciplineFollowRate = reviewed.length > 0 ? (followed.length / reviewed.length) * 100 : 0;

  return {
    currentScreen: ctx.view,
    accounts: (ctx.accounts ?? []).map((a: any) => ({
      id: a.id,
      name: a.name,
      propFirm: a.propFirm,
      type: a.type,
      startingBalance: a.startingBalance,
    })),
    selectedAccountFilter:
      ctx.selectedAccounts && ctx.selectedAccounts.length > 0
        ? `${ctx.selectedAccounts.length} selected`
        : 'All Accounts',
    totalTrades,
    totalPnL,
    winRate,
    profitFactor,
    disciplineFollowRate,
    activeRuleTitles: (ctx.rules ?? []).map((r: any) => r.title),
    recentMarketNoticeTitles: (ctx.notices ?? [])
      .slice()
      .sort((a: any, b: any) => (b.timestamp || '').localeCompare(a.timestamp || ''))
      .slice(0, 10)
      .map((n: any) => n.whatHappenedTitle || n.keyTakeawayTitle || n.title),
    recentMistakeTags: (ctx.mistakesList ?? []).map((m: any) => m.name),
    tradeFilters: {
      search: ctx.dbSearch ?? '',
      account: ctx.dbAccountFilter ?? 'all',
      session: ctx.dbSessionFilter ?? 'all',
      outcome: ctx.dbOutcomeFilter ?? 'all',
      rulesFollowed: ctx.dbRulesFilter ?? 'all',
    },
  };
}
