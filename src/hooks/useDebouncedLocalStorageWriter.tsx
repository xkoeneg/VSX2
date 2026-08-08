import { useCallback, useEffect, useRef } from 'react';

/**
 * Debounces localStorage.setItem calls so rapid state changes (typing in a
 * note field, dragging an image, toggling a checkbox) don't synchronously
 * JSON.stringify + write a multi-MB blob (trade screenshots are stored as
 * base64) on every single render commit. That serialize+write pair is the
 * single biggest main-thread blocker in this app outside of React's own
 * render — this defers it until the user pauses, so keystrokes and
 * animations stay smooth.
 *
 * Writes are coalesced per storage key: calling write('tradingJournal', a)
 * then write('tradingJournal', b) 50ms later cancels the first write and
 * only ever persists `b`. Nothing is lost on tab close — a pending write is
 * flushed synchronously on 'beforeunload' and on the tab going hidden.
 */
export function useDebouncedLocalStorageWriter(delay = 500) {
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const pending = useRef<Map<string, string>>(new Map());
  const errorHandlers = useRef<Map<string, (e: unknown) => void>>(new Map());

  const flushKey = useCallback((key: string) => {
    const timer = timers.current.get(key);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(key);
    }
    const value = pending.current.get(key);
    if (value === undefined) return;
    pending.current.delete(key);
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      errorHandlers.current.get(key)?.(e);
    } finally {
      errorHandlers.current.delete(key);
    }
  }, []);

  const flushAll = useCallback(() => {
    for (const key of Array.from(pending.current.keys())) flushKey(key);
  }, [flushKey]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flushAll();
    };
    window.addEventListener('beforeunload', flushAll);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('beforeunload', flushAll);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      // Component tree is unmounting (e.g. hot reload) — don't drop writes.
      flushAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Schedule `value` to be written to `key`, debounced by `delay` ms. */
  const write = useCallback((key: string, value: string, onError?: (e: unknown) => void) => {
    pending.current.set(key, value);
    if (onError) errorHandlers.current.set(key, onError);
    const existing = timers.current.get(key);
    if (existing) clearTimeout(existing);
    timers.current.set(key, setTimeout(() => flushKey(key), delay));
  }, [delay, flushKey]);

  return { write, flushAll };
}
