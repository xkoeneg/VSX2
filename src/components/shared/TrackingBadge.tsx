import { cn } from '../../utils/format';

export const TrackingBadge: React.FC<{ value?: string; size?: 'sm' | 'md' }> = ({ value, size = 'md' }) => {
  if (!value) return null;
  const isSm = size === 'sm';
  return (
    <span
      className={cn(
        'inline-flex items-center flex-shrink-0 rounded bg-zinc-900 border border-zinc-800 font-mono font-medium text-zinc-300 tracking-wide',
        isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
      )}
    >
      #{value}
    </span>
  );
};

// Compact session tag (e.g. "nyc", "london") — pairs with TrackingBadge for a
// quick-glance, Notion-style overview on trade cards.
