import { generateId } from './id';
import { WIKI_CATEGORIES } from '../types';
import type {
  TradeImage, TimeframeChart, Account, Trade, RulePillar, Rule, CustomPillar, StrategyStep, Strategy,
  ChatMessage, MarketNotice, WikiEntry, TagColor, StoredData,
} from '../types';
import { DEFAULT_TAG_COLOR, TAG_COLOR_PALETTE } from '../constants/tagColors';
import { EMOTION_OPTIONS } from '../constants/trading';
import { ACCOUNT_TYPES, SESSION_OPTIONS, TIMEFRAMES, TRADING_ACCOUNT_TYPES } from '../constants/trading';
import { RULE_ACCENT_PALETTE, RULE_ICON_OPTIONS, RULE_SEVERITIES } from '../constants/rules';

export const DATA_SCHEMA_VERSION = 6;

export const createEmptyTimeframes = (): TimeframeChart[] =>
  TIMEFRAMES.map(tf => ({ name: tf, images: [], notes: '' }));

export const normalizeTradeImage = (img: any): TradeImage => ({
  id: typeof img?.id === 'string' ? img.id : generateId(),
  url: typeof img?.url === 'string' ? img.url : '',
  type: img?.type === 'base64' ? 'base64' : 'url',
});

export const normalizeTimeframeChart = (tf: any): TimeframeChart => ({
  name: typeof tf?.name === 'string' ? tf.name : '',
  images: Array.isArray(tf?.images) ? tf.images.map(normalizeTradeImage) : [],
  notes: typeof tf?.notes === 'string' ? tf.notes : '',
});

export const normalizeAccount = (a: any): Account => ({
  id: typeof a?.id === 'string' ? a.id : generateId(),
  name: typeof a?.name === 'string' ? a.name : 'Untitled Account',
  startingBalance: typeof a?.startingBalance === 'number' ? a.startingBalance : 0,
  type: (ACCOUNT_TYPES as readonly string[]).includes(a?.type) ? a.type : 'Eval',
  customTypeName: typeof a?.customTypeName === 'string' ? a.customTypeName : undefined,
  propFirm: typeof a?.propFirm === 'string' ? a.propFirm : '',
  createdAt: typeof a?.createdAt === 'string' ? a.createdAt : new Date().toISOString(),
  hasProfitTarget: typeof a?.hasProfitTarget === 'boolean' ? a.hasProfitTarget : undefined,
  profitTarget: typeof a?.profitTarget === 'number' ? a.profitTarget : undefined,
  maxDrawdown: typeof a?.maxDrawdown === 'number' ? a.maxDrawdown : undefined,
  tradingAccountType: TRADING_ACCOUNT_TYPES.includes(a?.tradingAccountType) ? a.tradingAccountType : undefined,
  highestBalance: typeof a?.highestBalance === 'number' ? a.highestBalance : undefined,
  maxDrawdownAllowance: typeof a?.maxDrawdownAllowance === 'number' ? a.maxDrawdownAllowance : undefined,
  fixedMinBalance: typeof a?.fixedMinBalance === 'number' ? a.fixedMinBalance : undefined,
});

export const normalizeTrade = (t: any, fallbackTradeNumber: number): Trade => ({
  id: typeof t?.id === 'string' ? t.id : generateId(),
  accountId: typeof t?.accountId === 'string' ? t.accountId : '',
  symbol: typeof t?.symbol === 'string' ? t.symbol : '',
  profitLoss: typeof t?.profitLoss === 'number' ? t.profitLoss : 0,
  entryPrice: typeof t?.entryPrice === 'number' ? t.entryPrice : 0,
  exitPrice: typeof t?.exitPrice === 'number' ? t.exitPrice : undefined,
  stopLoss: typeof t?.stopLoss === 'number' ? t.stopLoss : 0,
  takeProfit: typeof t?.takeProfit === 'number' ? t.takeProfit : 0,
  slPoints: typeof t?.slPoints === 'number' ? t.slPoints : 0,
  tpPoints: typeof t?.tpPoints === 'number' ? t.tpPoints : 0,
  lotSize: typeof t?.lotSize === 'number' ? t.lotSize : undefined,
  orderType: t?.orderType === 'buy' || t?.orderType === 'sell' ? t.orderType : undefined,
  setupTypes: Array.isArray(t?.setupTypes) ? t.setupTypes : [],
  confluences: Array.isArray(t?.confluences) ? t.confluences : [],
  mistakes: Array.isArray(t?.mistakes) ? t.mistakes : [],
  // Must NOT default to 'followed' — unreviewed/imported trades have
  // rulesFollowed === undefined and need to stay that way through every
  // reload, or every unreviewed trade silently turns into a false
  // "Rules Followed" the next time the app loads.
  rulesFollowed: t?.rulesFollowed === 'broken' ? 'broken' : t?.rulesFollowed === 'followed' ? 'followed' : undefined,
  timeframes: Array.isArray(t?.timeframes) && t.timeframes.length > 0
    ? t.timeframes.map(normalizeTimeframeChart)
    : createEmptyTimeframes(),
  executionImages: Array.isArray(t?.executionImages) ? t.executionImages.map(normalizeTradeImage) : [],
  riskAmount: typeof t?.riskAmount === 'number' ? t.riskAmount : 0,
  mistakesAnalysis: typeof t?.mistakesAnalysis === 'string' ? t.mistakesAnalysis : '',
  lessonsLearned: typeof t?.lessonsLearned === 'string' ? t.lessonsLearned : '',
  emotions: Array.isArray(t?.emotions) ? t.emotions : undefined,
  notes: typeof t?.notes === 'string' ? t.notes : undefined,
  timestamp: typeof t?.timestamp === 'string' ? t.timestamp : new Date().toISOString(),
  date: typeof t?.date === 'string' ? t.date : (typeof t?.timestamp === 'string' ? t.timestamp.split('T')[0] : new Date().toISOString().split('T')[0]),
  startTime: typeof t?.startTime === 'string' ? t.startTime : undefined,
  endTime: typeof t?.endTime === 'string' ? t.endTime : undefined,
  absoluteTradeNumber: typeof t?.absoluteTradeNumber === 'number' && t.absoluteTradeNumber > 0 ? t.absoluteTradeNumber : fallbackTradeNumber,
  trackingNumber: typeof t?.trackingNumber === 'string' ? t.trackingNumber : undefined,
  session: SESSION_OPTIONS.includes(t?.session) ? t.session : undefined,
  // Broker ticket ID from MT4/MT5 import — MUST survive normalization or
  // the import duplicate-check (which reads trade.importTicketId straight
  // off live `trades`) silently loses every ticket ID on the next app
  // load/reopen, and every previously-imported trade becomes re-importable.
  importTicketId: typeof t?.importTicketId === 'string' ? t.importTicketId : undefined,
});

export const normalizeTrades = (rawTrades: any[]): Trade[] => {
  // Trades missing absoluteTradeNumber get one assigned chronologically,
  // exactly like the old one-off migration used to — but now it's just
  // one case handled by the general-purpose normalizer.
  const sortedByTime = [...rawTrades].sort((a, b) => {
    const at = new Date(a?.timestamp ?? 0).getTime();
    const bt = new Date(b?.timestamp ?? 0).getTime();
    return at - bt;
  });
  const numberByRef = new Map<any, number>();
  sortedByTime.forEach((t, idx) => numberByRef.set(t, idx + 1));
  return rawTrades.map(t => normalizeTrade(t, numberByRef.get(t) ?? 1));
};

export const normalizeStringField = (v: any, fallback = ''): string => (typeof v === 'string' ? v : fallback);

// Best-effort bucketing for rules saved before the pillar field existed —
// looks at category/title/description for obvious keywords, and falls
// back to 'execution' (the broadest catch-all bucket) if nothing matches.
export const guessRulePillar = (r: any): RulePillar => {
  const text = `${r?.category || ''} ${r?.title || ''} ${r?.description || ''}`.toLowerCase();
  if (/risk|capital|drawdown|position size|loss limit|leverage|exposure/.test(text)) return 'risk';
  if (/psycholog|emotion|mindset|cool[- ]?off|walk away|revenge|fomo|discipline/.test(text)) return 'psychology';
  return 'execution';
};

export const normalizeRule = (r: any): Rule => ({
  id: typeof r?.id === 'string' ? r.id : generateId(),
  category: normalizeStringField(r?.category),
  title: normalizeStringField(r?.title),
  description: normalizeStringField(r?.description),
  severity: RULE_SEVERITIES.includes(r?.severity) ? r.severity : 'warning',
  // Custom pillar ids aren't known here (they live in separate, dynamic
  // state), so any non-empty string is accepted as-is; only a missing/empty
  // pillar triggers the best-effort keyword guess.
  pillar: typeof r?.pillar === 'string' && r.pillar.trim() ? r.pillar : guessRulePillar(r),
  iconKind: r?.iconKind === 'emoji' || r?.iconKind === 'icon' ? r.iconKind : undefined,
  iconValue: typeof r?.iconValue === 'string' ? r.iconValue : undefined,
  color: RULE_ACCENT_PALETTE.some(c => c.id === r?.color) ? r.color : undefined,
  bulletStyle: r?.bulletStyle === 'bullet' || r?.bulletStyle === 'number' || r?.bulletStyle === 'icon' ? r.bulletStyle : undefined,
  textSize: r?.textSize === 'normal' || r?.textSize === 'large' ? r.textSize : undefined,
  itemType: r?.itemType === 'divider' ? 'divider' : 'rule',
  dividerLabel: typeof r?.dividerLabel === 'string' ? r.dividerLabel : undefined,
});

export const normalizeCustomPillar = (p: any): CustomPillar => {
  const label = normalizeStringField(p?.label, 'Custom Rules');
  return {
    id: typeof p?.id === 'string' && p.id ? p.id : generateId(),
    label,
    shortLabel: normalizeStringField(p?.shortLabel, label),
    icon: typeof p?.icon === 'string' && RULE_ICON_OPTIONS.includes(p.icon) ? p.icon : 'Layers',
    color: RULE_ACCENT_PALETTE.some(c => c.id === p?.color) ? p.color : 'indigo',
  };
};

export const normalizeStrategyStep = (s: any): StrategyStep => {
  // Two legacy shapes to account for: steps that predate the visual builder
  // entirely (no image field at all) and steps saved by the first version of
  // the builder, which had a single `imageUrl` string instead of an array.
  let images: TradeImage[];
  if (Array.isArray(s?.images)) {
    images = s.images.map(normalizeTradeImage);
  } else if (typeof s?.imageUrl === 'string' && s.imageUrl) {
    images = [{ id: generateId(), url: s.imageUrl, type: 'base64' }];
  } else {
    images = [];
  }
  return {
    id: typeof s?.id === 'string' ? s.id : generateId(),
    title: normalizeStringField(s?.title),
    notes: normalizeStringField(s?.notes),
    images,
  };
};

// Strategies saved before the step-by-step visual builder existed stored
// `steps` as a single newline-delimited string. Migrate each non-empty line
// into its own step object (title = the line, no notes/images) so old
// playbooks still render correctly in the new dynamic builder + timeline.
export const normalizeStrategySteps = (raw: any): StrategyStep[] => {
  if (Array.isArray(raw)) return raw.map(normalizeStrategyStep);
  if (typeof raw === 'string' && raw.trim()) {
    return raw.split('\n').map(line => line.trim()).filter(Boolean).map(line => ({
      id: generateId(),
      title: line,
      notes: '',
      images: [],
    }));
  }
  return [];
};

// Strategies saved before multi-image cover support existed stored a single
// `imageUrl` string instead of an `images` array — migrate that legacy shape
// into a one-item array so old playbooks still render correctly.
export const normalizeStrategyImages = (s: any): TradeImage[] => {
  if (Array.isArray(s?.images)) return s.images.map(normalizeTradeImage);
  if (typeof s?.imageUrl === 'string' && s.imageUrl) {
    return [{ id: generateId(), url: s.imageUrl, type: 'base64' }];
  }
  return [];
};

export const normalizeStrategy = (s: any): Strategy => ({
  id: typeof s?.id === 'string' ? s.id : generateId(),
  title: normalizeStringField(s?.title),
  market: normalizeStringField(s?.market),
  steps: normalizeStrategySteps(s?.steps),
  images: normalizeStrategyImages(s),
});

export const normalizeChatMessage = (m: any): ChatMessage => ({
  id: typeof m?.id === 'string' ? m.id : generateId(),
  text: normalizeStringField(m?.text),
  timestamp: typeof m?.timestamp === 'string' ? m.timestamp : new Date().toISOString(),
});

export const normalizeNotice = (n: any): MarketNotice => {
  const timestamp = typeof n?.timestamp === 'string' ? n.timestamp : new Date().toISOString();
  const messages = Array.isArray(n?.messages) ? n.messages.map(normalizeChatMessage) : [];
  // Older backups (pre anti-mistake/price-action-insight redesign) stored a
  // single static "description" string, or logged free-form entries in the
  // chat-style "messages" array. Fold whichever exists into the new
  // "description" field so nothing from an old backup is silently dropped.
  const legacyDescription = normalizeStringField(n?.description);
  const legacyMessagesText = messages.map((m: { text: string }) => m.text).filter(Boolean).join('\n\n');
  return {
    id: typeof n?.id === 'string' ? n.id : generateId(),
    type: n?.type === 'insight' ? 'insight' : 'mistake',
    title: normalizeStringField(n?.title),
    session: SESSION_OPTIONS.includes(n?.session) ? n.session : '',
    tag: normalizeStringField(n?.tag),
    imageUrl: normalizeStringField(n?.imageUrl),
    description: legacyDescription || legacyMessagesText,
    consequence: normalizeStringField(n?.consequence),
    prevention: normalizeStringField(n?.prevention),
    timestamp,
    messages,
  };
};

export const normalizeWiki = (w: any): WikiEntry => ({
  id: typeof w?.id === 'string' ? w.id : generateId(),
  title: normalizeStringField(w?.title),
  content: normalizeStringField(w?.content),
  category: normalizeStringField(w?.category),
  imageUrl: normalizeStringField(w?.imageUrl),
  keyRules: Array.isArray(w?.keyRules) ? w.keyRules.filter((r: any) => typeof r === 'string' && r.trim()) : [],
  bestSession: normalizeStringField(w?.bestSession),
  timeframe: normalizeStringField(w?.timeframe),
  contextNotes: normalizeStringField(w?.contextNotes),
});

export const normalizeNamedItem = (item: any, defaultColor: TagColor = DEFAULT_TAG_COLOR): { id: string; name: string; color: TagColor } => ({
  id: typeof item?.id === 'string' ? item.id : generateId(),
  name: normalizeStringField(item?.name),
  color: TAG_COLOR_PALETTE.some(c => c.id === item?.color) ? item.color : defaultColor,
});


export const migrateStoredData = (raw: any): StoredData => {
  const data = raw && typeof raw === 'object' ? raw : {};
  return {
    version: DATA_SCHEMA_VERSION,
    accounts: Array.isArray(data.accounts) ? data.accounts.map(normalizeAccount) : [],
    trades: Array.isArray(data.trades) ? normalizeTrades(data.trades) : [],
    rules: Array.isArray(data.rules) ? data.rules.map(normalizeRule) : [],
    strategies: Array.isArray(data.strategies) ? data.strategies.map(normalizeStrategy) : [],
    notices: Array.isArray(data.notices) ? data.notices.map(normalizeNotice) : [],
    // Older backups saved before the Knowledge Wiki existed have no
    // wikiEntries field at all. That case used to seed built-in mock
    // concepts (IFVG, Order Block, CISD, etc). The wiki now starts
    // genuinely empty for everyone — a missing field (fresh install /
    // pre-wiki backup) and an explicit empty array (user deleted every
    // entry) both just mean "no entries".
    wikiEntries: Array.isArray(data.wikiEntries) ? data.wikiEntries.map(normalizeWiki) : [],
    setupTypes: Array.isArray(data.setupTypes) ? data.setupTypes.map((item: any) => normalizeNamedItem(item, 'gray')) : [],
    confluences: Array.isArray(data.confluences) ? data.confluences.map((item: any) => normalizeNamedItem(item, 'gray')) : [],
    mistakesList: Array.isArray(data.mistakesList) ? data.mistakesList.map((item: any) => normalizeNamedItem(item, 'red')) : [],
    emotionsList: Array.isArray(data.emotionsList) && data.emotionsList.length > 0
      ? data.emotionsList.map((item: any) => normalizeNamedItem(item, 'purple'))
      : EMOTION_OPTIONS.map(name => ({ id: generateId(), name, color: 'purple' as TagColor })),
    customSymbols: Array.isArray(data.customSymbols) ? data.customSymbols.filter((s: any) => typeof s === 'string') : [],
    customPillars: Array.isArray(data.customPillars) ? data.customPillars.map(normalizeCustomPillar) : [],
  };
};
