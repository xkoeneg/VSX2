import { WIKI_CATEGORIES } from '../types';
export { WIKI_CATEGORIES };
import type { WikiCategory, WikiEntry, WikiCandle } from '../types';

export const WIKI_CATEGORY_STYLES: Record<WikiCategory, { badge: string; active: string; dot: string; icon: string; glow: string; ring: string }> = {
  'PD Arrays': { badge: 'bg-blue-950/40 text-blue-300 border border-blue-500/30', active: 'bg-blue-500/15 text-blue-300 border-blue-500/40', dot: 'bg-blue-500', icon: 'text-blue-500', glow: 'shadow-[0_0_10px_-2px_rgba(59,130,246,0.6)]', ring: 'border-blue-500/40' },
  'Market Structure': { badge: 'bg-purple-950/40 text-purple-300 border border-purple-500/30', active: 'bg-purple-500/15 text-purple-300 border-purple-500/40', dot: 'bg-purple-500', icon: 'text-purple-500', glow: 'shadow-[0_0_10px_-2px_rgba(168,85,247,0.6)]', ring: 'border-purple-500/40' },
  'Terminology': { badge: 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30', active: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40', dot: 'bg-emerald-500', icon: 'text-emerald-500', glow: 'shadow-[0_0_10px_-2px_rgba(16,185,129,0.6)]', ring: 'border-emerald-500/40' },
  'Execution Models': { badge: 'bg-amber-950/40 text-amber-300 border border-amber-500/30', active: 'bg-amber-500/15 text-amber-300 border-amber-500/40', dot: 'bg-amber-500', icon: 'text-amber-500', glow: 'shadow-[0_0_10px_-2px_rgba(245,158,11,0.6)]', ring: 'border-amber-500/40' },
};
export const WIKI_CATEGORY_FALLBACK_STYLE = { badge: 'bg-zinc-800 text-zinc-400 border border-zinc-700', active: 'bg-zinc-700/50 text-zinc-300 border-zinc-600', dot: 'bg-zinc-500', icon: 'text-zinc-500', glow: '', ring: 'border-zinc-700' };
export const getWikiCategoryStyle = (category?: string) =>
  (category && WIKI_CATEGORY_STYLES[category as WikiCategory]) || WIKI_CATEGORY_FALLBACK_STYLE;


// ---- Wiki diagram thumbnails --------------------------------------------
// The default PD Array entries ship with tiny generated SVG chart diagrams
// (candles + a highlighted zone) so the gallery renders fully illustrated
// out of the box instead of empty image placeholders. Encoded as inline
// data URIs — no network fetch, no external asset dependency.
export const svgToDataUri = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;


export const buildWikiChartSvg = (opts: {
  accent: string;
  candles: WikiCandle[];
  highlight?: { x: number; y: number; w: number; h: number };
  level?: number;
  arrow?: { x1: number; y1: number; x2: number; y2: number };
}) => {
  const { accent, candles, highlight, level, arrow } = opts;
  const candleEls = candles.map(c => {
    const bullish = c.close < c.open; // smaller y = higher price
    const fill = bullish ? '#10b981' : '#ef4444';
    const bodyTop = Math.min(c.open, c.close);
    const bodyH = Math.max(Math.abs(c.close - c.open), 3);
    return `<line x1="${c.x}" y1="${c.high}" x2="${c.x}" y2="${c.low}" stroke="${fill}" stroke-width="2"/><rect x="${c.x - 8}" y="${bodyTop}" width="16" height="${bodyH}" fill="${fill}" rx="1.5"/>`;
  }).join('');
  const highlightEl = highlight ? `<rect x="${highlight.x}" y="${highlight.y}" width="${highlight.w}" height="${highlight.h}" fill="${accent}" fill-opacity="0.16" stroke="${accent}" stroke-width="1.5" stroke-dasharray="4 3" rx="3"/>` : '';
  const levelEl = typeof level === 'number' ? `<line x1="0" y1="${level}" x2="400" y2="${level}" stroke="${accent}" stroke-width="1.25" stroke-dasharray="5 4" stroke-opacity="0.7"/>` : '';
  const arrowEl = arrow ? `<line x1="${arrow.x1}" y1="${arrow.y1}" x2="${arrow.x2}" y2="${arrow.y2}" stroke="${accent}" stroke-width="2" marker-end="url(#arrowhead)"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><defs><marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="${accent}"/></marker></defs><rect width="400" height="200" fill="#0a0a0f"/>${[40, 80, 120, 160].map(y => `<line x1="0" y1="${y}" x2="400" y2="${y}" stroke="#1c1c22" stroke-width="1"/>`).join('')}${levelEl}${highlightEl}${candleEls}${arrowEl}</svg>`;
};

export const WIKI_IFVG_SVG = buildWikiChartSvg({
  accent: '#3b82f6',
  candles: [
    { x: 30, open: 60, close: 90, high: 55, low: 95 },
    { x: 80, open: 90, close: 120, high: 85, low: 125 },
    { x: 130, open: 120, close: 80, high: 75, low: 125 },
    { x: 180, open: 80, close: 60, high: 55, low: 85 },
    { x: 230, open: 60, close: 95, high: 55, low: 100 },
    { x: 280, open: 95, close: 65, high: 60, low: 100 },
    { x: 330, open: 65, close: 50, high: 45, low: 70 },
  ],
  highlight: { x: 150, y: 65, w: 110, h: 35 },
  arrow: { x1: 230, y1: 95, x2: 255, y2: 75 },
});

export const WIKI_CISD_SVG = buildWikiChartSvg({
  accent: '#a855f7',
  candles: [
    { x: 30, open: 60, close: 90, high: 55, low: 95 },
    { x: 80, open: 90, close: 115, high: 85, low: 120 },
    { x: 130, open: 115, close: 135, high: 110, low: 140 },
    { x: 180, open: 135, close: 100, high: 95, low: 140 },
    { x: 230, open: 100, close: 80, high: 75, low: 105 },
    { x: 280, open: 80, close: 95, high: 75, low: 100 },
    { x: 330, open: 95, close: 70, high: 65, low: 100 },
  ],
  level: 115,
  highlight: { x: 160, y: 95, w: 40, h: 45 },
});

export const WIKI_ORDER_BLOCK_SVG = buildWikiChartSvg({
  accent: '#3b82f6',
  candles: [
    { x: 30, open: 70, close: 90, high: 65, low: 95 },
    { x: 80, open: 90, close: 75, high: 70, low: 95 },
    { x: 130, open: 75, close: 100, high: 70, low: 105 },
    { x: 180, open: 100, close: 60, high: 55, low: 105 },
    { x: 230, open: 60, close: 40, high: 35, low: 65 },
    { x: 280, open: 40, close: 65, high: 35, low: 70 },
    { x: 330, open: 65, close: 35, high: 30, low: 70 },
  ],
  highlight: { x: 114, y: 75, w: 186, h: 30 },
});

export const WIKI_LIQUIDITY_SWEEP_SVG = buildWikiChartSvg({
  accent: '#a855f7',
  candles: [
    { x: 30, open: 60, close: 75, high: 55, low: 80 },
    { x: 80, open: 75, close: 65, high: 60, low: 80 },
    { x: 130, open: 65, close: 78, high: 60, low: 82 },
    { x: 180, open: 78, close: 70, high: 65, low: 83 },
    { x: 230, open: 70, close: 95, high: 65, low: 100 },
    { x: 280, open: 95, close: 60, high: 55, low: 100 },
    { x: 330, open: 60, close: 40, high: 35, low: 65 },
  ],
  level: 82,
  highlight: { x: 214, y: 82, w: 32, h: 18 },
});

// Ships pre-populated so the Knowledge Wiki page is never an empty screen
// on first load — used as the initial wikiEntries state and only replaced
// once a saved backup (which may legitimately be an empty array, e.g. the
// user deleted everything) finishes loading from localStorage.
export const DEFAULT_WIKI_ENTRIES: WikiEntry[] = [
  {
    id: 'default-ifvg',
    title: 'Inverse Fair Value Gap (IFVG)',
    content: 'A Fair Value Gap that gets fully closed through and flips polarity — the old FVG now acts as an inverse support/resistance zone in the opposite direction.',
    category: 'PD Arrays',
    imageUrl: svgToDataUri(WIKI_IFVG_SVG),
    keyRules: [
      'Original FVG must be fully closed through (body close)',
      'Displacement Candle confirms the flip',
      'Respect the zone on first retest',
      'HTF Confluence increases probability',
    ],
    bestSession: 'NY Open',
    timeframe: '1m / 5m',
    contextNotes: 'Best traded when aligned with a higher-timeframe draw on liquidity.',
  },
  {
    id: 'default-cisd',
    title: 'Change In State of Delivery (CISD)',
    content: "A shift in short-term delivery — price closes back through the open of the most recent opposing candle, signaling a change in near-term order flow.",
    category: 'Market Structure',
    imageUrl: svgToDataUri(WIKI_CISD_SVG),
    keyRules: [
      "Close must break the opposing candle's open",
      'Look for it right after a liquidity sweep',
      'Confirms short-term shift, not full MSS',
      'Combine with FVG / Order Block for entry',
    ],
    bestSession: 'London / NY Overlap',
    timeframe: '1m / 3m',
    contextNotes: 'Use as an early confirmation trigger before higher-timeframe structure actually breaks.',
  },
  {
    id: 'default-order-block',
    title: 'Order Block',
    content: 'The last opposing candle before a strong displacement move — marks the footprint of institutional order flow and often gets revisited before continuation.',
    category: 'PD Arrays',
    imageUrl: svgToDataUri(WIKI_ORDER_BLOCK_SVG),
    keyRules: [
      'Last down/up candle before displacement',
      'Must be followed by a strong impulsive move',
      'Body Close Rule: trade the candle body, not the wick',
      'Unmitigated OBs carry more weight',
    ],
    bestSession: 'NY Session',
    timeframe: '5m / 15m HTF',
    contextNotes: 'Unmitigated order blocks on higher timeframes carry more weight than intraday ones.',
  },
  {
    id: 'default-liquidity-sweep',
    title: 'Liquidity Sweep',
    content: 'A deliberate move through resting liquidity (equal highs/lows, old swing points) to trigger stops before reversing hard in the opposite direction.',
    category: 'Market Structure',
    imageUrl: svgToDataUri(WIKI_LIQUIDITY_SWEEP_SVG),
    keyRules: [
      'Wick through prior swing high/low',
      'Quick rejection back inside range',
      'Displacement Candle confirms the reversal',
      'Often precedes a CISD or full MSS',
    ],
    bestSession: 'Asia Low / NY Open',
    timeframe: '1m / 5m',
    contextNotes: 'Watch for equal highs/lows — that resting liquidity is the pool being targeted.',
  },
];

