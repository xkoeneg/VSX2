import type { SessionOption } from '../../types';
import { cn } from '../../utils/format';
import { SESSION_SHORT_LABEL } from '../../constants/trading';

export const SessionBadge: React.FC<{ value?: SessionOption | string; size?: 'sm' | 'md' }> = ({ value, size = 'md' }) => {
  if (!value) return null;
  const isSm = size === 'sm';
  const label = SESSION_SHORT_LABEL[value as SessionOption] || value.toLowerCase();
  return (
    <span
      className={cn(
        'inline-flex items-center rounded bg-zinc-900 border border-zinc-800 font-mono font-medium text-zinc-500 tracking-wide',
        isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
      )}
    >
      {label}
    </span>
  );
};

// ============================================================
// ECONOMIC CALENDAR — USD high-impact events pulled live from the
// Myfxbook RSS feed via /api/calendar (a Vercel serverless function that
// fetches the feed server-side so the browser never hits Myfxbook
// directly, permanently avoiding CORS). Self-contained: owns its own
// fetch/parse/refresh state so it can be dropped in anywhere.
// ============================================================
