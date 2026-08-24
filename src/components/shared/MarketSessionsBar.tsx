import { MARKET_SESSIONS, isWithinPHTWindow, formatPHTWindowLabel, getMinutesSinceMidnight, formatPHTClockLabel } from '../../constants/marketSessions';
import { isObservingDST } from '../../constants/marketSessions';
import { cn } from '../../utils/format';
import { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';

// ============================================================
// Public Holiday Integration (Nager.Date API)
// ============================================================
// Free, no-key public holiday API: https://date.nager.at/api/v3/PublicHolidays/{year}/{countryCode}
// Only three countries are relevant to the three session cards.
type SessionCountryCode = 'US' | 'GB' | 'JP';
const SESSION_COUNTRY_CODES: SessionCountryCode[] = ['US', 'GB', 'JP'];

interface PublicHoliday {
  date: string; // "YYYY-MM-DD", in the holiday's own country calendar
  localName: string;
  name: string;
}

type HolidayCacheEntry = { year: number; fetchedAt: number; data: PublicHoliday[] };
type HolidayCache = Partial<Record<SessionCountryCode, HolidayCacheEntry>>;

const HOLIDAY_CACHE_KEY = 'marketHolidaysCache';

const loadHolidayCache = (): HolidayCache => {
  try {
    const raw = localStorage.getItem(HOLIDAY_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveHolidayCache = (cache: HolidayCache) => {
  try {
    localStorage.setItem(HOLIDAY_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Quota or serialization failure — non-fatal, holidays just get
    // refetched from the API next time the component mounts.
  }
};

// Maps a session entry to the country whose public holidays should gate it.
// Matches on `key`/`name`/`cityLabel` rather than a hardcoded key string so
// this keeps working regardless of exactly how MARKET_SESSIONS names its
// Tokyo/London/New York entries.
const getSessionCountryCode = (session: { key?: string; name?: string; cityLabel?: string }): SessionCountryCode | null => {
  const hay = `${session.key ?? ''} ${session.name ?? ''} ${session.cityLabel ?? ''}`.toLowerCase();
  if (hay.includes('tokyo') || hay.includes('asia') || hay.includes('japan')) return 'JP';
  if (hay.includes('london') || hay.includes('uk')) return 'GB';
  if (hay.includes('new york') || hay.includes('newyork')) return 'US';
  return null;
};

// Local calendar date (YYYY-MM-DD) and weekday abbreviation for `date` as
// seen in `timeZone` — used both to match a session against its country's
// holiday list and, for the PHT weekend check, against Asia/Manila.
const WEEKDAY_NUM: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const getLocalDateAndWeekday = (timeZone: string, date: Date): { dateStr: string; weekdayNum: number } => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short',
  }).formatToParts(date);
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '';
  return {
    dateStr: `${get('year')}-${get('month')}-${get('day')}`,
    weekdayNum: WEEKDAY_NUM[get('weekday')] ?? new Date(date).getDay(),
  };
};

const useSessionHolidays = () => {
  const [holidaysByCountry, setHolidaysByCountry] = useState<Partial<Record<SessionCountryCode, PublicHoliday[]>>>({});

  useEffect(() => {
    const year = new Date().getFullYear();
    const cache = loadHolidayCache();
    const fromCache: Partial<Record<SessionCountryCode, PublicHoliday[]>> = {};
    const toFetch: SessionCountryCode[] = [];

    SESSION_COUNTRY_CODES.forEach(code => {
      const cached = cache[code];
      if (cached && cached.year === year) {
        fromCache[code] = cached.data;
      } else {
        toFetch.push(code);
      }
    });

    if (Object.keys(fromCache).length > 0) {
      setHolidaysByCountry(prev => ({ ...prev, ...fromCache }));
    }

    if (toFetch.length === 0) return;

    let cancelled = false;
    (async () => {
      let cacheDirty = false;
      await Promise.all(toFetch.map(async code => {
        try {
          const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${code}`);
          if (!res.ok) return;
          const data: PublicHoliday[] = await res.json();
          if (cancelled) return;
          cache[code] = { year, fetchedAt: Date.now(), data };
          cacheDirty = true;
          setHolidaysByCountry(prev => ({ ...prev, [code]: data }));
        } catch {
          // API/network failure — that country's sessions just fall back
          // to normal weekday-hours logic until the next successful fetch.
        }
      }));
      if (cacheDirty) saveHolidayCache(cache);
    })();

    return () => { cancelled = true; };
  }, []);

  return holidaysByCountry;
};

type SessionStatusKind = 'weekend' | 'holiday' | 'open' | 'closed';

export const MarketSessionsBar: React.FC = () => {
  const { theme, tc } = useAppContext();
  // Ticks every second so the digital clocks genuinely read as "live"
  // rather than refreshing in visible jumps.
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  const holidaysByCountry = useSessionHolidays();

  const nowPHTMin = getMinutesSinceMidnight('Asia/Manila', now);
  // Weekend gate uses the PHT calendar day since every session window in
  // this bar is already expressed in PHT — keeps "today" consistent across
  // all three cards instead of each session going by its own local date.
  const { weekdayNum: phtWeekday } = getLocalDateAndWeekday('Asia/Manila', now);
  const isWeekendPHT = phtWeekday === 0 || phtWeekday === 6;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0">
      {MARKET_SESSIONS.map(session => {
        const inDST = session.dstTimeZone ? isObservingDST(session.dstTimeZone, now) : false;
        const activeWindow = session.dstTimeZone && !inDST ? session.winterWindow : session.summerWindow;
        const withinHours = isWithinPHTWindow(nowPHTMin, activeWindow);

        // Holiday check runs against the session's own country calendar
        // date, since a public holiday is defined by that country's date,
        // not PHT's (e.g. a US holiday can already be "tomorrow" in PHT).
        const countryCode = getSessionCountryCode(session);
        const { dateStr: sessionLocalDate } = getLocalDateAndWeekday(session.clockTimeZone, now);
        const holidayMatch = countryCode
          ? (holidaysByCountry[countryCode] ?? []).find(h => h.date === sessionLocalDate)
          : undefined;

        let statusKind: SessionStatusKind;
        if (isWeekendPHT) statusKind = 'weekend';
        else if (holidayMatch) statusKind = 'holiday';
        else if (withinHours) statusKind = 'open';
        else statusKind = 'closed';

        const isOpen = statusKind === 'open';
        const inKillzone = isOpen && isWithinPHTWindow(nowPHTMin, session.killzoneWindow);

        // 12-hour clock with AM/PM (e.g. "02:27:28 PM"), zero-padded hour
        // for stable digit-width alignment across all three cards.
        const localClock = now.toLocaleTimeString('en-US', {
          timeZone: session.clockTimeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
        }).replace(/^(\d):/, '0$1:');

        // Status is communicated entirely via the badge triplet (below) —
        // top-level cards keep a standard neutral zinc border per §9 "Card
        // (top-level)"; no card-level accent border.
        const badgeClass =
          statusKind === 'weekend' ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
          : statusKind === 'holiday' ? 'bg-orange-500/15 text-orange-300 border-orange-500/30'
          : isOpen ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
          : (theme !== 'light' ? 'bg-zinc-800/60 text-zinc-500 border-zinc-700/50' : 'bg-zinc-100 text-zinc-400 border-zinc-200');

        const badgeLabel =
          statusKind === 'weekend' ? '🔴 WEEKEND CLOSED'
          : statusKind === 'holiday' ? '🟠 HOLIDAY CLOSED'
          : isOpen ? '🟢 OPEN'
          : '🔴 CLOSED';

        return (
          <div
            key={session.key}
            className={cn(
              'min-w-0 rounded-xl border p-4 transition-colors',
              theme !== 'light' ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-white border-zinc-200'
            )}
          >
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <h3 className={cn('text-xs font-semibold truncate', tc.text)}>{session.name}</h3>
              <span className={cn(
                'px-1.5 py-0.5 rounded-full text-[10px] font-semibold border flex-shrink-0 whitespace-nowrap',
                badgeClass
              )}>
                {badgeLabel}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="flex items-center gap-1.5 min-w-0">
                <span className={cn('text-[10px] truncate', tc.textMuted)}>{session.cityLabel} time</span>
                {session.dstTimeZone && (
                  <span className={cn(
                    'px-1 py-0.5 rounded text-[9px] font-medium border flex-shrink-0 leading-none whitespace-nowrap',
                    inDST
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                  )}>
                    {inDST ? '☀️ DST' : '❄️ Standard'}
                  </span>
                )}
              </span>
              <span className="flex flex-col items-end gap-1">
                <span className={cn('font-mono text-sm tabular-nums tracking-tight', tc.text)}>{localClock}</span>
                {inKillzone && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                    {session.killzoneBadgeLabel}
                  </span>
                )}
              </span>
            </div>
            <p className={cn('text-[11px] truncate', tc.textMuted)}>
              {statusKind === 'holiday' && holidayMatch ? holidayMatch.localName || holidayMatch.name : formatPHTWindowLabel(activeWindow)}
            </p>
          </div>
        );
      })}
    </div>
  );
};

