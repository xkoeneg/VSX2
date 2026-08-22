import type React from 'react';
import { Filter, ChevronsUpDown, Wallet, LineChart, TrendingUp, Box } from 'lucide-react';
import type { Account } from '../../types';
import { cn } from '../../utils/format';
import { useAppContext } from '../../context/AppContext';

// Small, cross-screen render helpers that used to live as closures inside
// the giant App() component. They're used by the Dashboard, Trades,
// Discipline, Life Discipline, Calendar screens and the Account modal, so
// they live here instead of inside any one screen file.

export const renderStatCard = (
  title: string,
  value: string | number,
  icon: React.ReactNode,
  color: string = 'text-zinc-400'
) => {
  // Reads theme/tc from context via a tiny wrapper component so this can
  // still be called as a plain function (`{renderStatCard(...)}`) exactly
  // like it was in the original file.
  return <StatCardInner title={title} value={value} icon={icon} color={color} />;
};

function StatCardInner({ title, value, icon, color }: {
  title: string; value: string | number; icon: React.ReactNode; color: string;
}) {
  const { theme, tc } = useAppContext();
  return (
    <div className={cn(
      "group rounded-xl p-4 flex items-center gap-3 min-w-0 transition-all duration-200",
      theme !== 'light'
        ? 'bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/70'
        : 'bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
    )}>
      <div className={cn('p-2.5 rounded-xl flex-shrink-0', theme !== 'light' ? 'bg-zinc-800/60' : 'bg-zinc-100', color)}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className={cn("text-[11px] uppercase tracking-wider truncate font-medium", tc.textMuted)}>{title}</p>
        <p className={cn('text-lg font-semibold truncate tabular-nums',
          typeof value === 'string' && value.includes('+') ? 'text-emerald-500' :
          typeof value === 'string' && value.includes('-') ? 'text-rose-500' :
          tc.text
        )}>
          {value}
        </p>
      </div>
    </div>
  );
}

export const renderAccountTypeBadge = (account: Account) => {
  // LIVE trading accounts have no challenge "Status" (the field is hidden
  // in the Add/Edit Account form for them), so show "Live" here instead of
  // whatever the underlying `type` happens to default to.
  if (account.tradingAccountType === 'LIVE') {
    return (
      <span className="text-xs px-2 py-0.5 rounded truncate max-w-[100px] inline-block bg-blue-500/20 text-blue-400">
        Live
      </span>
    );
  }
  const displayName = account.type === 'Custom Challenge' ? (account.customTypeName || 'Custom') : account.type;
  const colors: Record<string, string> = {
    'Eval': 'bg-amber-500/20 text-amber-400',
    'Phase 1': 'bg-purple-500/20 text-purple-400',
    'Phase 2': 'bg-blue-500/20 text-blue-400',
    'Funded': 'bg-emerald-500/20 text-emerald-400',
    'Custom Challenge': 'bg-zinc-500/20 text-zinc-400',
  };
  return (
    <span className={cn('text-xs px-2 py-0.5 rounded truncate max-w-[100px] inline-block', colors[account.type] || colors['Custom Challenge'])}>
      {displayName}
    </span>
  );
};

// SHARED ACCOUNT FILTER — single source of truth for the "All Accounts"
// control used in the Dashboard, Trade History, and Performance Calendar
// page headers.
export const renderAccountFilter = () => {
  const { accountDropdownRef, showAccountDropdown, setShowAccountDropdown, selectedAccounts, setSelectedAccounts, accounts, theme, tc } = useAppContext();
  return (
    <div className="relative" ref={accountDropdownRef}>
      <button
        onClick={() => setShowAccountDropdown(!showAccountDropdown)}
        className={cn(
          "h-9 flex items-center gap-2 px-3 rounded-lg text-xs font-medium border transition-colors focus:outline-none",
          tc.btnSecondary,
          theme !== 'light' ? 'border-zinc-700/50' : 'border-zinc-200'
        )}
      >
        <Filter className="w-4 h-4 flex-shrink-0" />
        <span className="hidden sm:inline truncate max-w-[120px]">{selectedAccounts.includes('all') ? 'All Accounts' : `${selectedAccounts.length} Selected`}</span>
        <ChevronsUpDown className="w-4 h-4 flex-shrink-0" />
      </button>

      {showAccountDropdown && (
        <div className={cn(
          "absolute left-0 top-full mt-1.5 min-w-[200px] w-64 max-w-[calc(100vw-2rem)] rounded-xl shadow-2xl z-50 p-3.5 border",
          theme !== 'light' ? 'bg-zinc-900 border-white/10' : 'bg-white border-zinc-200'
        )}>
          <button
            onClick={() => setSelectedAccounts(['all'])}
            className={cn(
              'w-full text-left px-3 py-2 rounded text-sm truncate transition-colors',
              selectedAccounts.includes('all')
                ? (theme !== 'light' ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-900')
                : cn(tc.textMuted, theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100')
            )}
          >
            All Accounts
          </button>
          <div className={cn("my-2 border-t", theme !== 'light' ? 'border-zinc-800' : 'border-zinc-200')} />
          {accounts.map(acc => (
            <button
              key={acc.id}
              onClick={() => {
                if (selectedAccounts.includes('all')) {
                  setSelectedAccounts([acc.id]);
                } else if (selectedAccounts.includes(acc.id)) {
                  const newSelection = selectedAccounts.filter(a => a !== acc.id);
                  setSelectedAccounts(newSelection.length === 0 ? ['all'] : newSelection);
                } else {
                  setSelectedAccounts([...selectedAccounts, acc.id]);
                }
              }}
              className={cn(
                'w-full text-left px-3 py-2 rounded text-sm flex items-center justify-between transition-colors',
                selectedAccounts.includes(acc.id)
                  ? (theme !== 'light' ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-900')
                  : cn(tc.textMuted, theme !== 'light' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100')
              )}
            >
              <span className="truncate flex-1 mr-2">{acc.name}</span>
              {renderAccountTypeBadge(acc)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const renderTradingAccountTypeBadge = (account: Account) => {
  const type = account.tradingAccountType || 'LIVE';
  const colors: Record<string, string> = {
    'CFD': 'bg-orange-500/20 text-orange-400',
    'LIVE': 'bg-blue-500/20 text-blue-400',
    'FUTURES': 'bg-violet-500/20 text-violet-400',
    'DEMO': 'bg-zinc-500/20 text-zinc-400',
  };
  const icons: Record<string, React.ReactNode> = {
    'CFD': <Wallet className="w-3 h-3" />,
    'LIVE': <LineChart className="w-3 h-3" />,
    'FUTURES': <TrendingUp className="w-3 h-3" />,
    'DEMO': <Box className="w-3 h-3" />,
  };
  return (
    <span className={cn('text-xs px-2 py-0.5 rounded inline-flex items-center gap-1 w-fit', colors[type])}>
      {icons[type]}
      {type}
    </span>
  );
};
