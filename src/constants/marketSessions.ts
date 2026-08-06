import type { MarketSessionDef } from '../types';
import type { PHTWindow } from '../types';

export const getTimeZoneOffsetMinutes = (timeZone: string, date: Date): number => {
  const raw = new Intl.DateTimeFormat('en-US', {
    timeZone, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(date).reduce((acc, p) => {
    if (p.type !== 'literal') acc[p.type] = p.value;
    return acc;
  }, {} as Record<string, string>);
  // Some environments report midnight as "24" under hour: '2-digit'.
  const hour = raw.hour === '24' ? 0 : Number(raw.hour);
  const asUTC = Date.UTC(Number(raw.year), Number(raw.month) - 1, Number(raw.day), hour, Number(raw.minute), Number(raw.second));
  // Rounded to the nearest whole minute: Intl.DateTimeFormat's parts only
  // resolve down to whole seconds (no milliseconds), while `date.getTime()`
  // still carries real-world milliseconds (e.g. from a setInterval tick).
  // Without rounding, that mismatch produces fractional offsets like
  // -240.006 instead of a clean -240, which then fail the strict `===`
  // equality check in isObservingDST() below almost all the time — making
  // the bar silently fall back to winter windows even in the middle of
  // summer DST. Real-world timezone offsets are always whole minutes, so
  // rounding here is always safe.
  return Math.round((asUTC - date.getTime()) / 60000);
};

// True when `timeZone` is currently observing DST. Compares the current
// offset against that same zone's Jan 1 / Jul 1 offsets for the current
// year — for the northern-hemisphere zones this bar cares about (UK/US),
// the larger of those two offsets is always the DST (Summer) offset.
// Zones with no DST at all (offsets equal, e.g. Asia/Tokyo, Asia/Manila)
// always resolve to false.
export const isObservingDST = (timeZone: string, date: Date): boolean => {
  const jan = getTimeZoneOffsetMinutes(timeZone, new Date(Date.UTC(date.getUTCFullYear(), 0, 1)));
  const jul = getTimeZoneOffsetMinutes(timeZone, new Date(Date.UTC(date.getUTCFullYear(), 6, 1)));
  if (jan === jul) return false;
  return getTimeZoneOffsetMinutes(timeZone, date) === Math.max(jan, jul);
};

// Minutes since midnight for a timeZone's current wall-clock reading —
// used to place `now` inside each session/killzone window below, which
// are all authored as PHT minutes-since-midnight.
export const getMinutesSinceMidnight = (timeZone: string, date: Date): number => {
  const raw = new Intl.DateTimeFormat('en-US', {
    timeZone, hour12: false, hour: '2-digit', minute: '2-digit',
  }).formatToParts(date).reduce((acc, p) => {
    if (p.type !== 'literal') acc[p.type] = p.value;
    return acc;
  }, {} as Record<string, string>);
  const hour = raw.hour === '24' ? 0 : Number(raw.hour);
  return hour * 60 + Number(raw.minute);
};


// A moment (0-1439 minutes since PHT midnight) is "inside" a window if it
// falls in [openMin, closeMin) directly, OR if adding a full day to it
// lands inside that range — the latter is what correctly handles windows
// that cross midnight (e.g. New York's ~21:30-04:00 PHT window) when
// `nowMin` is a small post-midnight value.
export const isWithinPHTWindow = (nowMin: number, win: PHTWindow): boolean =>
  (nowMin >= win.openMin && nowMin < win.closeMin) ||
  (nowMin + 1440 >= win.openMin && nowMin + 1440 < win.closeMin);

export const formatPHTClockLabel = (hour: number, minute: number): string => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(minute).padStart(2, '0')} ${period}`;
};

export const formatPHTWindowLabel = (win: PHTWindow): string => {
  const open = formatPHTClockLabel(Math.floor((win.openMin % 1440) / 60), win.openMin % 60);
  const close = formatPHTClockLabel(Math.floor((win.closeMin % 1440) / 60), win.closeMin % 60);
  return `${open} – ${close} PHT`;
};


export const MARKET_SESSIONS: MarketSessionDef[] = [
  {
    key: 'tokyo',
    name: 'Tokyo / Asian Session',
    cityLabel: 'Tokyo',
    clockTimeZone: 'Asia/Tokyo',
    dstTimeZone: null,
    summerWindow: { openMin: 8 * 60, closeMin: 14 * 60 }, // 8:00 AM - 2:00 PM PHT
    winterWindow: { openMin: 8 * 60, closeMin: 14 * 60 },
    killzoneWindow: { openMin: 8 * 60, closeMin: 10 * 60 }, // 8:00 - 10:00 AM PHT
    killzoneBadgeLabel: '⚡ ASIAN KILLZONE',
  },
  {
    key: 'london',
    name: 'London Session',
    cityLabel: 'London',
    clockTimeZone: 'Europe/London',
    dstTimeZone: 'Europe/London',
    summerWindow: { openMin: 15 * 60, closeMin: 23 * 60 + 30 }, // 3:00 PM - 11:30 PM PHT (BST)
    winterWindow: { openMin: 16 * 60, closeMin: 24 * 60 + 30 }, // 4:00 PM - 12:30 AM PHT (GMT)
    killzoneWindow: { openMin: 15 * 60, closeMin: 17 * 60 }, // 3:00 - 5:00 PM PHT
    killzoneBadgeLabel: '⚡ LONDON KILLZONE',
  },
  {
    key: 'newyork',
    name: 'New York Session',
    cityLabel: 'New York',
    clockTimeZone: 'America/New_York',
    dstTimeZone: 'America/New_York',
    summerWindow: { openMin: 21 * 60 + 30, closeMin: 24 * 60 + 4 * 60 }, // 9:30 PM - 4:00 AM PHT (EDT)
    winterWindow: { openMin: 22 * 60 + 30, closeMin: 24 * 60 + 5 * 60 }, // 10:30 PM - 5:00 AM PHT (EST)
    killzoneWindow: { openMin: 20 * 60, closeMin: 23 * 60 }, // 8:00 - 11:00 PM PHT
    killzoneBadgeLabel: '⚡ NY KILLZONE',
  },
];

// Horizontal row of 3 dark mode mini-cards — one per session — each with
// a live local-time digital clock, an OPEN/CLOSED badge driven by the
// DST-aware PHT window above, and a killzone badge when the current
// moment falls inside that session's high-probability window.
