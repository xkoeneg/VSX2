// ---- Trade duration display helpers (Trade Detail Modal only) ----
// Pure, read-only formatting utilities that operate on the already-saved
// `startTime` / `endTime` strings (stored as "HH:MM", 24h). These do not
// mutate `trades`, do not participate in save/update logic, and exist
// solely to support rendering in the trade preview/detail modal.
export const formatTimeDisplay = (time?: string): string | null => {
  if (!time) return null;
  const [hStr, mStr] = time.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${displayHour}:${String(m).padStart(2, '0')} ${period}`;
};

// Returns total minutes between startTime and endTime ("HH:MM" 24h strings).
// If endTime is earlier than startTime, assumes the trade crossed midnight.
export const calculateTradeDurationMinutes = (startTime?: string, endTime?: string): number | null => {
  if (!startTime || !endTime) return null;
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  if ([sh, sm, eh, em].some(n => Number.isNaN(n))) return null;
  let diffMinutes = (eh * 60 + em) - (sh * 60 + sm);
  if (diffMinutes < 0) diffMinutes += 24 * 60; // trade spanned midnight
  return diffMinutes;
};

// Formats a minute count into a compact label, e.g. "10 mins" or "1h 15m".
export const formatTradeDuration = (minutes: number | null): string | null => {
  if (minutes === null) return null;
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'}`;
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  return remMinutes === 0 ? `${hours}h` : `${hours}h ${remMinutes}m`;
};

// Manual "Trade #" badge — user-entered reference (e.g. Notion log ID, day marker).
// Kept intentionally minimal (dark chip, thin border) so it sits quietly alongside
// the rules-followed indicator instead of competing for attention.
