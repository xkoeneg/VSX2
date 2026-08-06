import type { EconomicEvent, MarketEffect } from '../types';


// Myfxbook titles each event with the COUNTRY name, not the currency code
// (e.g. "United States Core PCE Price Index MoM"), so this maps the
// country prefix to a currency. Only the majors are listed — extend as
// needed if you want to filter by other currencies later.
export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  'united states': 'USD',
  'euro area': 'EUR',
  'eurozone': 'EUR',
  'germany': 'EUR',
  'france': 'EUR',
  'italy': 'EUR',
  'spain': 'EUR',
  'united kingdom': 'GBP',
  'japan': 'JPY',
  'canada': 'CAD',
  'australia': 'AUD',
  'new zealand': 'NZD',
  'switzerland': 'CHF',
  'china': 'CNY',
};

export const getCurrencyFromTitle = (title: string): string => {
  const lower = title.toLowerCase();
  for (const country of Object.keys(COUNTRY_CURRENCY_MAP)) {
    if (lower.startsWith(country)) return COUNTRY_CURRENCY_MAP[country];
  }
  return '';
};

// Myfxbook encodes impact as a CSS class on a <span> inside the
// description table: sprite-no-impact / sprite-low-impact /
// sprite-medium-impact / sprite-high-impact.
export const getImpactFromDescriptionHtml = (html: string): EconomicEvent['impact'] => {
  const match = html.match(/sprite-(no|low|medium|high)-impact/);
  if (!match) return 'none';
  return (match[1] === 'no' ? 'none' : match[1]) as EconomicEvent['impact'];
};

// Best-effort directional hint (beat/miss) for the Actual column — only
// meaningful when both Actual and Forecast parse as numbers. Handles %,
// $, and K/M/B suffixes (e.g. "1.395M", "-1.54%", "$16.0B").
export const compareActualToForecast = (actual: string, forecast: string): 'up' | 'down' | null => {
  const parse = (v: string): number | null => {
    if (!v) return null;
    const cleaned = v.replace(/[,%$]/g, '').trim();
    const multiplier = /B$/i.test(cleaned) ? 1e9 : /M$/i.test(cleaned) ? 1e6 : /K$/i.test(cleaned) ? 1e3 : 1;
    const num = parseFloat(cleaned.replace(/[BMK]$/i, ''));
    return Number.isNaN(num) ? null : num * multiplier;
  };
  const a = parse(actual);
  const f = parse(forecast);
  if (a === null || f === null || a === f) return null;
  return a > f ? 'up' : 'down';
};

// Parses the raw RSS XML (as returned by /api/calendar) into typed
// events. Each <item>'s <description> is itself an HTML <table> (Time
// left / Impact / Previous / Consensus / Actual), so it's parsed a
// second time as HTML to pull the cell values out.
export const parseCalendarXml = (xmlText: string): EconomicEvent[] => {
  const xmlDoc = new DOMParser().parseFromString(xmlText, 'text/xml');
  if (xmlDoc.querySelector('parsererror')) return [];
  const items = Array.from(xmlDoc.querySelectorAll('item'));

  return items.map((item, idx) => {
    const title = item.querySelector('title')?.textContent?.trim() || 'Unknown Event';
    const pubDateStr = item.querySelector('pubDate')?.textContent?.trim() || '';
    const descriptionHtml = item.querySelector('description')?.textContent || '';

    const descDoc = new DOMParser().parseFromString(descriptionHtml, 'text/html');
    const cells = Array.from(descDoc.querySelectorAll('td')).map(td => td.textContent?.trim() || '');
    const [, , previous = '', forecast = '', actual = ''] = cells;

    const parsedDate = pubDateStr ? new Date(pubDateStr) : null;

    return {
      id: `${idx}-${title}-${pubDateStr}`,
      title,
      currency: getCurrencyFromTitle(title),
      impact: getImpactFromDescriptionHtml(descriptionHtml),
      time: parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : null,
      previous,
      forecast,
      actual,
    };
  });
};

export const IMPACT_META: Record<EconomicEvent['impact'], { label: string; className: string }> = {
  high: { label: 'High', className: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  medium: { label: 'Medium', className: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  low: { label: 'Low', className: 'bg-zinc-700/30 text-zinc-400 border-zinc-700/50' },
  none: { label: 'None', className: 'bg-zinc-800/40 text-zinc-500 border-zinc-800' },
};

// Same tolerant numeric parser used by compareActualToForecast (%, $, and
// K/M/B suffixes), pulled out standalone so the Market Effect badge and the
// Actual-column trend arrow always agree with each other.
export const parseCalendarNumber = (v: string): number | null => {
  if (!v) return null;
  const cleaned = v.replace(/[,%$]/g, '').trim();
  if (!cleaned) return null;
  const multiplier = /B$/i.test(cleaned) ? 1e9 : /M$/i.test(cleaned) ? 1e6 : /K$/i.test(cleaned) ? 1e3 : 1;
  const num = parseFloat(cleaned.replace(/[BMK]$/i, ''));
  return Number.isNaN(num) ? null : num * multiplier;
};

// Market Effect badge — a plain-English "what does this mean for USD" read
// on top of the raw Actual vs Forecast numbers. Deliberately conservative:
// anything that doesn't cleanly parse as a beat/miss (missing Actual, equal
// values, or unparsable text) falls back to a neutral "Pending" badge
// instead of guessing, so it can never crash or mislabel on odd feed data.
export const MARKET_EFFECT_META: Record<MarketEffect, { label: string; className: string }> = {
  bullish: { label: 'Bullish / Good for USD', className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  bearish: { label: 'Bearish / Bad for USD', className: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  neutral: { label: 'Pending / Neutral', className: 'bg-zinc-700/30 text-zinc-400 border-zinc-700/50' },
};
export const getMarketEffect = (actual: string, forecast: string): MarketEffect => {
  const a = parseCalendarNumber(actual);
  const f = parseCalendarNumber(forecast);
  if (a === null || f === null || a === f) return 'neutral';
  return a > f ? 'bullish' : 'bearish';
};

// Renders an event time in Philippine Time (UTC+8) instead of UTC. PHT has
// no DST so it's safe to hard-code the IANA zone here.
export const formatEventTimePHT = (date: Date | null): string => {
  if (!date) return '—';
  return date.toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Manila',
  }) + ' PHT';
};

// Live "Time Left" countdown, recomputed against whatever `now` the caller
// passes in (the card ticks this every 30s). Handles null/invalid event
// times and negative/zero deltas safely so a malformed feed entry never
// crashes the row — it just reads "—" or "Passed".
export const formatCountdown = (eventTime: Date | null, now: Date): string => {
  if (!eventTime || Number.isNaN(eventTime.getTime())) return '—';
  const diffMs = eventTime.getTime() - now.getTime();
  if (diffMs <= 0) return 'Passed';
  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `In ${days}d ${hours}h`;
  if (hours > 0) return `In ${hours}h ${minutes}m`;
  if (minutes > 0) return `In ${minutes}m`;
  return 'In <1m';
};

// Shared data-fetching hook — pulls /api/calendar, parses it, and
// auto-refreshes every 5 minutes. Both the full Economic Calendar card and
// the header Notification Bell call this independently (each owns its own
// small poll), so either can be dropped or moved without the other
// breaking, at the cost of two lightweight fetches instead of one shared
// store — an acceptable tradeoff for a feed this small.
