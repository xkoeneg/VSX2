import { useState, useEffect, useRef, useCallback } from 'react';
import type { EconomicEvent } from '../types';
import { parseCalendarXml } from '../utils/economicCalendar';

export function useEconomicCalendarFeed() {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadCalendar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/calendar');
      if (!res.ok) throw new Error(`Feed request failed (${res.status})`);
      const xmlText = await res.text();
      setEvents(parseCalendarXml(xmlText));
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load the economic calendar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCalendar();
    // Auto-refresh every 5 minutes so Actual/Forecast values (and today's
    // notification list) stay current.
    const interval = setInterval(loadCalendar, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadCalendar]);

  return { events, loading, error, lastUpdated, loadCalendar };
}

// Philippine-Time calendar-day string (e.g. "8/5/2026"), used to decide
// which events count as "today" for the notification bell and to key the
// localStorage read-state so the unread badge resets at midnight PHT.
export const getPHTDateKey = (date: Date): string =>
  date.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });

export const isSamePHTDay = (a: Date, b: Date): boolean => getPHTDateKey(a) === getPHTDateKey(b);

