import type { ParsedMTTrade, MTColumnRole } from '../types';


// Strips thousands separators / currency symbols / parenthesis-negatives and
// returns a finite number, defaulting to 0 for anything unparsable.
export const parseMTNumber = (raw: string | undefined): number => {
  if (!raw) return 0;
  let s = raw.trim();
  if (!s) return 0;
  const negParen = /^\(.*\)$/.test(s);
  s = s.replace(/[()]/g, '').replace(/[, ]/g, '').replace(/[^\d.\-]/g, '');
  if (!s || s === '-' || s === '.') return 0;
  const n = parseFloat(s);
  if (isNaN(n)) return 0;
  return negParen ? -Math.abs(n) : n;
};

// MT4/MT5 timestamps look like "2024.01.15 10:23:45" or "2024.01.15 10:23".
// Converts to ISO 8601; falls back to the raw trimmed string if it doesn't match.
export const parseMTTimestamp = (raw: string | undefined): string => {
  if (!raw) return '';
  const s = raw.trim();
  const m = s.match(/(\d{4})[.\-\/](\d{2})[.\-\/](\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return s;
  const [, y, mo, d, h, mi, se] = m;
  return `${y}-${mo}-${d}T${h}:${mi}:${se || '00'}`;
};


// Your broker's server clock is NOT Philippine time. Confirmed reading:
// broker showed 16:56 at the same moment PH time was 21:56 — the server
// runs 5 hours BEHIND PH time, so we add 5 hours to every parsed
// timestamp before it reaches Trade History.
// If you ever switch brokers/servers, just update this one number.
export const BROKER_TO_PH_OFFSET_HOURS = 5;

// Shifts a naive "YYYY-MM-DDTHH:MM:SS" string (no timezone attached) by
// offsetHours, correctly rolling over day/month/year boundaries. We anchor
// the arithmetic in UTC purely as a neutral calculator — the input/output
// strings stay naive local-time strings, not real UTC.
export const shiftNaiveIsoHours = (iso: string, offsetHours: number): string => {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/);
  if (!m) return iso; // didn't come from parseMTTimestamp (e.g. raw fallback) — leave as-is
  const [, y, mo, d, h, mi, se] = m;
  const anchor = new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +se));
  anchor.setUTCHours(anchor.getUTCHours() + offsetHours);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${anchor.getUTCFullYear()}-${pad(anchor.getUTCMonth() + 1)}-${pad(anchor.getUTCDate())}T${pad(anchor.getUTCHours())}:${pad(anchor.getUTCMinutes())}:${pad(anchor.getUTCSeconds())}`;
};

// Parses a raw MT4/MT5 timestamp straight into PH local time, ready to show
// in Trade History.
export const parseMTTimestampToPH = (raw: string | undefined): string =>
  shiftNaiveIsoHours(parseMTTimestamp(raw), BROKER_TO_PH_OFFSET_HOURS);

// Order matters: more specific patterns (profit/commission/swap/taxes/sl/tp)
// are checked before the generic "price" pattern so e.g. "S / L" never gets
// mis-tagged. Ticket/time/type/size/symbol are unambiguous.
export const MT_HEADER_PATTERNS: [MTColumnRole, RegExp][] = [
  ['ticket', /^(ticket|order|position|deal)(\s*#|\s*id)?$/i],
  ['time', /time/i],
  ['type', /^type$/i],
  ['size', /^(size|volume|lots?)$/i],
  ['symbol', /^(symbol|item|instrument)$/i],
  ['profit', /^(profit|net\s*profit|p\s*\/?\s*l)$/i],
  ['commission', /commission/i],
  ['swap', /swap/i],
  ['taxes', /tax/i],
  ['sl', /^s\s*\/?\s*l$|stop\s*loss/i],
  ['tp', /^t\s*\/?\s*p$|take\s*profit/i],
  ['price', /^price$/i],
];

// Classifies a header row into { role: [columnIndex, ...] }, indices kept in
// left-to-right order so duplicate roles (two "Price" or two "Time" columns)
// can be resolved positionally: occurrence 0 = open, occurrence 1 = close.
export const classifyMTHeaders = (headers: string[]): Partial<Record<MTColumnRole, number[]>> => {
  const roles: Partial<Record<MTColumnRole, number[]>> = {};
  headers.forEach((rawHeader, idx) => {
    const header = rawHeader.trim();
    if (!header) return;
    for (const [role, pattern] of MT_HEADER_PATTERNS) {
      if (pattern.test(header)) {
        (roles[role] = roles[role] || []).push(idx);
        return;
      }
    }
  });
  return roles;
};

export const MT_TICKET_HEADER_RE = /^(ticket|order|position|deal)(\s*#|\s*id)?$/i;

// Turns classified column roles + one data row into a ParsedMTTrade, or null
// if the row doesn't look like a real closed buy/sell trade (e.g. balance,
// credit, deposit, or cancelled-order rows that MT4/MT5 reports also list).
export const rowToMTTrade = (cells: string[], roles: Partial<Record<MTColumnRole, number[]>>, tradeNumber: number): ParsedMTTrade | null => {
  const get = (role: MTColumnRole, occurrence: number = 0): string | undefined => {
    const idxList = roles[role];
    if (!idxList || idxList.length <= occurrence) return undefined;
    return cells[idxList[occurrence]];
  };

  const ticketRaw = get('ticket');
  const typeRaw = (get('type') || '').trim().toLowerCase();
  if (!ticketRaw || !/^\d+$/.test(ticketRaw.trim())) return null;
  if (typeRaw !== 'buy' && typeRaw !== 'sell') return null;

  const openTime = parseMTTimestampToPH(get('time', 0));
  const closeTime = parseMTTimestampToPH(get('time', 1)) || openTime;
  const entryPrice = parseMTNumber(get('price', 0));
  const exitPrice = parseMTNumber(get('price', 1));
  const profitBase = parseMTNumber(get('profit'));
  const commission = parseMTNumber(get('commission'));
  const swap = parseMTNumber(get('swap'));
  const taxes = parseMTNumber(get('taxes'));

  return {
    tradeNumber,
    ticketId: ticketRaw.trim(),
    symbol: (get('symbol') || '').trim().toUpperCase(),
    orderType: typeRaw as 'buy' | 'sell',
    lotSize: parseMTNumber(get('size')),
    openTime,
    closeTime,
    entryPrice,
    exitPrice,
    stopLoss: parseMTNumber(get('sl')),
    takeProfit: parseMTNumber(get('tp')),
    profitLoss: profitBase + commission + swap + taxes,
  };
};

// Splits a CSV/TSV line respecting simple double-quoted fields.
export const splitMTDelimitedLine = (line: string, delimiter: string): string[] => {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === delimiter && !inQuotes) {
      cells.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  cells.push(current);
  return cells.map(c => c.trim().replace(/^"|"$/g, ''));
};

export const parseMT4MT5Csv = (text: string): ParsedMTTrade[] => {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];
  const delimiter = (lines[0].match(/\t/g)?.length || 0) >= (lines[0].match(/,/g)?.length || 0) ? '\t' : ',';

  const trades: ParsedMTTrade[] = [];
  let roles: Partial<Record<MTColumnRole, number[]>> | null = null;
  // Auto-numbers trades in the order they're found, so you never have to
  // type in a trade # by hand.
  let nextTradeNumber = 1;

  for (const line of lines) {
    const cells = splitMTDelimitedLine(line, delimiter);
    // (Re)detect the header whenever a "Ticket"/"Order"/"Position"/"Deal"
    // column shows up, since some exports repeat headers per section.
    const looksLikeHeader = cells.some(c => MT_TICKET_HEADER_RE.test(c.trim()));
    if (looksLikeHeader) {
      roles = classifyMTHeaders(cells);
      continue;
    }
    if (!roles) continue;
    const trade = rowToMTTrade(cells, roles, nextTradeNumber);
    if (trade) {
      trades.push(trade);
      nextTradeNumber++;
    }
  }
  return trades;
};

// Modern MT5 "Save as Report" HTML packs Positions, Orders and Deals into
// ONE <table>, each section announced by a lone <th colspan="..."> title
// cell (e.g. <th colspan="14"><div><b>Positions</b></div></th>).
export const MT_SECTION_TITLE_RE = /^(positions|orders|deals|results)$/i;

export const parseMT4MT5Html = (text: string): ParsedMTTrade[] => {
  const doc = new DOMParser().parseFromString(text, 'text/html');
  const rows = Array.from(doc.querySelectorAll('table tr'));
  const trades: ParsedMTTrade[] = [];
  let roles: Partial<Record<MTColumnRole, number[]>> | null = null;
  // Orders and Deals headers use column names ("Order", "Deal") that also
  // satisfy the ticket-column pattern below, so without tracking which
  // section we're in, their individual order-fill / half-trade deal rows
  // get misread as complete trades — duplicating/corrupting the real
  // Positions rows, which are the only ones with both an entry and exit.
  let inPositionsSection = false;
  // Auto-numbers trades in the order they're found, so you never have to
  // type in a trade # by hand.
  let nextTradeNumber = 1;

  for (const row of rows) {
    const headerCells = Array.from(row.querySelectorAll('th'));
    if (headerCells.length === 1) {
      const title = (headerCells[0].textContent || '').trim();
      if (MT_SECTION_TITLE_RE.test(title)) {
        inPositionsSection = title.toLowerCase() === 'positions';
        roles = null;
        continue;
      }
    }

    // MT5 inserts class="hidden" spacer cells into Positions data rows
    // (to share column widths with the Orders section) that have no
    // counterpart in the Positions header row — including them shifts
    // every later column off by one. Drop them from both header and data
    // rows so cell indices actually line up.
    const cells = Array.from(row.querySelectorAll('td, th'))
      .filter(c => !/(^|\s)hidden(\s|$)/.test(c.className || ''))
      .map(c => (c.textContent || '').trim());
    if (cells.length === 0 || cells.every(c => !c)) continue;
    const looksLikeHeader = cells.some(c => MT_TICKET_HEADER_RE.test(c));
    if (looksLikeHeader) {
      roles = classifyMTHeaders(cells);
      continue;
    }
    if (!roles || !inPositionsSection) continue;
    const trade = rowToMTTrade(cells, roles, nextTradeNumber);
    if (trade) {
      trades.push(trade);
      nextTradeNumber++;
    }
  }
  return trades;
};

// Entry point — dispatches on file extension (falling back to content
// sniffing) and never throws; returns an empty array if nothing recognizable
// is found so callers can show one clean "no valid trades found" message
// instead of a raw JS error.
export const parseMTFile = (fileName: string, text: string): ParsedMTTrade[] => {
  try {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.html') || lower.endsWith('.htm')) return parseMT4MT5Html(text);
    if (lower.endsWith('.csv')) return parseMT4MT5Csv(text);
    if (/<html|<table/i.test(text.slice(0, 2000))) return parseMT4MT5Html(text);
    return parseMT4MT5Csv(text);
  } catch {
    return [];
  }
};
// MT5's "Save as Report" HTML export is very often saved as UTF-16 (with a
// BOM), not UTF-8. Blob/File.text() always decodes as UTF-8 regardless of
// the file's real encoding, which turns a UTF-16 report into unreadable
// mojibake before parsing even starts. Sniff the encoding from the leading
// bytes ourselves (BOM if present, otherwise a null-byte heuristic — plain
// ASCII/UTF-8 HTML won't have runs of 0x00 bytes, UTF-16 always does) and
// decode accordingly.
export const readMTReportFileText = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  if (bytes.length >= 2 && bytes[0] === 0xFF && bytes[1] === 0xFE) {
    return new TextDecoder('utf-16le').decode(buffer);
  }
  if (bytes.length >= 2 && bytes[0] === 0xFE && bytes[1] === 0xFF) {
    return new TextDecoder('utf-16be').decode(buffer);
  }
  const sampleLen = Math.min(bytes.length, 1000);
  let nullCount = 0;
  for (let i = 0; i < sampleLen; i++) if (bytes[i] === 0) nullCount++;
  if (sampleLen > 0 && nullCount > sampleLen * 0.3) {
    return new TextDecoder('utf-16le').decode(buffer);
  }
  return new TextDecoder('utf-8').decode(buffer);
};
// ================== end MT4/MT5 Trade Import: parsing helpers ==================

