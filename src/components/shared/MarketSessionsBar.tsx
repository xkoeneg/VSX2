import { MARKET_SESSIONS, isWithinPHTWindow, formatPHTWindowLabel, getMinutesSinceMidnight, formatPHTClockLabel } from '../../constants/marketSessions';
import { isObservingDST } from '../../constants/marketSessions';
import { cn } from '../../utils/format';
import { useEffect, useState } from 'react';

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

        const cardBorderClass =
          statusKind === 'weekend' ? 'border-rose-500/30'
          : statusKind === 'holiday' ? 'border-orange-500/30'
          : inKillzone ? 'border-amber-500/40'
          : isOpen ? 'border-emerald-500/30'
          : 'border-zinc-800';

        const badgeClass =
          statusKind === 'weekend' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          : statusKind === 'holiday' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
          : isOpen ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          : 'bg-zinc-800/60 text-zinc-500 border-zinc-700';

        const badgeLabel =
          statusKind === 'weekend' ? '🔴 WEEKEND CLOSED'
          : statusKind === 'holiday' ? '🟠 HOLIDAY CLOSED'
          : isOpen ? '🟢 OPEN'
          : '🔴 CLOSED';

        return (
          <div
            key={session.key}
            className={cn(
              'min-w-0 rounded-xl border bg-zinc-900/50 p-3.5 transition-colors',
              cardBorderClass
            )}
          >
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <h3 className="text-xs font-semibold text-white truncate">{session.name}</h3>
              <span className={cn(
                'px-1.5 py-0.5 rounded-full text-[10px] font-medium border flex-shrink-0 whitespace-nowrap',
                badgeClass
              )}>
                {badgeLabel}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="flex items-center gap-1.5 min-w-0">
                <span className="text-[10px] text-zinc-500 truncate">{session.cityLabel} time</span>
                {session.dstTimeZone && (
                  <span className={cn(
                    'px-1 py-0.5 rounded text-[9px] font-medium border flex-shrink-0 leading-none whitespace-nowrap',
                    inDST
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                  )}>
                    {inDST ? '☀️ DST' : '❄️ Standard'}
                  </span>
                )}
              </span>
              <span className="font-mono text-sm text-zinc-200 tabular-nums tracking-tight">{localClock}</span>
            </div>
            <p className="text-[11px] text-zinc-500 truncate">
              {statusKind === 'holiday' && holidayMatch ? holidayMatch.localName || holidayMatch.name : formatPHTWindowLabel(activeWindow)}
            </p>

            <div className="mt-2 h-5 flex items-center">
              {inKillzone && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {session.killzoneBadgeLabel}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

