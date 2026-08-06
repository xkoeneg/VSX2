import type { NotificationReadState } from '../types';
import { getPHTDateKey } from '../hooks/useEconomicCalendarFeed';

export const NOTIFICATION_READ_STORAGE_KEY = 'vsx_notification_read_state_v1';


export const loadNotificationReadState = (): NotificationReadState => {
  const fallback: NotificationReadState = { date: getPHTDateKey(new Date()), readIds: [] };
  try {
    const raw = localStorage.getItem(NOTIFICATION_READ_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.date === 'string' && Array.isArray(parsed.readIds)) {
      return { date: parsed.date, readIds: parsed.readIds.filter((id: unknown) => typeof id === 'string') };
    }
    return fallback;
  } catch {
    // Corrupt/blocked storage should never crash the header — just treat
    // everything as unread for today.
    return fallback;
  }
};

export const saveNotificationReadState = (state: NotificationReadState) => {
  try {
    localStorage.setItem(NOTIFICATION_READ_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore write failures (private browsing / storage full, etc.) — the
    // bell just falls back to "always unread" for the session.
  }
};

