import { MARKET_SESSIONS, isWithinPHTWindow, formatPHTWindowLabel, getMinutesSinceMidnight, formatPHTClockLabel } from '../../constants/marketSessions';
import { isObservingDST } from '../../constants/marketSessions';
import { cn } from '../../utils/format';
import { useEffect, useState } from 'react';

export const MarketSessionsBar: React.FC = () => {
  // Ticks every second so the digital clocks genuinely read as "live"
  // rather than refreshing in visible jumps.
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  const nowPHTMin = getMinutesSinceMidnight('Asia/Manila', now);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0">
      {MARKET_SESSIONS.map(session => {
        const inDST = session.dstTimeZone ? isObservingDST(session.dstTimeZone, now) : false;
        const activeWindow = session.dstTimeZone && !inDST ? session.winterWindow : session.summerWindow;
        const isOpen = isWithinPHTWindow(nowPHTMin, activeWindow);
        const inKillzone = isOpen && isWithinPHTWindow(nowPHTMin, session.killzoneWindow);
        // 12-hour clock with AM/PM (e.g. "02:27:28 PM"), zero-padded hour
        // for stable digit-width alignment across all three cards.
        const localClock = now.toLocaleTimeString('en-US', {
          timeZone: session.clockTimeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
        }).replace(/^(\d):/, '0$1:');

        return (
          <div
            key={session.key}
            className={cn(
              'min-w-0 rounded-xl border bg-zinc-900/50 p-3.5 transition-colors',
              inKillzone ? 'border-amber-500/40' : isOpen ? 'border-emerald-500/30' : 'border-zinc-800'
            )}
          >
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <h3 className="text-xs font-semibold text-white truncate">{session.name}</h3>
              <span className={cn(
                'px-1.5 py-0.5 rounded-full text-[10px] font-medium border flex-shrink-0 whitespace-nowrap',
                isOpen
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-zinc-800/60 text-zinc-500 border-zinc-700'
              )}>
                {isOpen ? '🟢 OPEN' : '🔴 CLOSED'}
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
            <p className="text-[11px] text-zinc-500 truncate">{formatPHTWindowLabel(activeWindow)}</p>

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

// ============================================================
// DATA SCHEMA VERSIONING & MIGRATION
//
// All persisted data (localStorage AND exported backup .json files) passes
// through migrateStoredData() before it ever reaches React state. This is
// what makes it safe to keep upgrading the app: an old backup made months
// ago can always be imported into whatever the current code looks like.
//
// HOW TO USE THIS WHEN YOU UPGRADE THE APP LATER:
// 1. Add/rename/remove a field on Account, Trade, Rule, etc.
// 2. Bump DATA_SCHEMA_VERSION by 1.
// 3. In the matching normalize*() function below, add a default/fallback
//    for the new field (and, if you renamed something, map the old field
//    name to the new one there too).
// That's it — both localStorage loads and backup-file imports will now
// always produce fully-shaped, current-version objects, so nothing in the
// UI ever crashes on a field that "isn't there yet" in older data.
// ============================================================
