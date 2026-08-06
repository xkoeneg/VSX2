import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useAppState } from '../hooks/useAppState';

// ============================================================================
// AppContext — makes the giant useAppState() result available to every
// screen/modal component without threading a huge prop list through JSX.
// Every screen file calls useAppContext() and destructures whatever subset
// of state/handlers it needs (they're all optional to use, just available).
// ============================================================================

type AppContextValue = ReturnType<typeof useAppState>;

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const state = useAppState();
  return <AppContext.Provider value={state}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within an AppProvider');
  return ctx;
}
