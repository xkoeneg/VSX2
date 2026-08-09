import { useState } from 'react';
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Brain,
  ChevronRight,
  Scale,
  Wallet,
  CloudCog,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../lib/supabaseClient';
import { cn } from '../utils/format';

// ============================================================================
// LoginPage — full-screen auth gate shown whenever there's no active
// Supabase session (see App.tsx: `!session ? <LoginPage /> : <AppShell />`).
// Not a dialog/overlay — there's nothing to show "behind" it pre-auth, so it
// renders as its own screen rather than a modal.
//
// All three auth paths (Google OAuth, email sign in, email sign up) are
// handled here; the actual Supabase calls live in lib/supabaseClient.ts so
// this component only ever deals with form state + the resulting
// { data, error }.
// ============================================================================

type AuthMode = 'signIn' | 'signUp';

// Minimal multicolor Google "G" mark — inline so the button doesn't need an
// external image asset (and works instantly, no network round trip / flash
// of missing icon).
function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-5 h-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 16.1 3 9.3 7.5 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 45c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.6 36.4 26.9 37.5 24 37.5c-5.2 0-9.6-3.3-11.3-7.9l-6.6 5.1C9.2 40.4 16 45 24 45z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.5l6.6 5.4C41.8 35.6 45 30.4 45 24c0-1.4-.1-2.7-.4-3.5z"/>
    </svg>
  );
}

// ============================================================================
// Background preview cards — static, non-interactive mock-ups styled after
// the real screens (Dashboard's Total P&L hero + Discipline banner +
// Accounts panel + Win/Loss stat, TradeHistory's table, PerformanceCalendar's
// heatmap, RulesPlaybook's rule list, MarketNotices, and the Wiki). These are
// purely decorative: fixed demo numbers, no context/hooks, so the login
// screen never depends on live app data.
// ============================================================================

function PnLPreviewCard() {
  return (
    <div className="w-80 rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-900/60 p-5 shadow-2xl">
      <p className="text-[11px] uppercase tracking-wider font-medium text-zinc-500 mb-2">Total Profit &amp; Loss</p>
      <div className="flex items-baseline gap-2.5 flex-wrap mb-4">
        <span className="text-3xl font-bold tracking-tight tabular-nums text-emerald-500">$48,216.90</span>
        <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500">
          <TrendingUp className="w-3 h-3" />
          +12.4%
        </span>
      </div>
      <div className="flex gap-2">
        <div className="px-2.5 py-1.5 rounded-xl bg-zinc-800/60 min-w-[64px]">
          <p className="text-[9px] uppercase tracking-wider text-zinc-500">Trades</p>
          <p className="text-xs font-semibold text-white tabular-nums">312</p>
        </div>
        <div className="px-2.5 py-1.5 rounded-xl bg-zinc-800/60 min-w-[64px]">
          <p className="text-[9px] uppercase tracking-wider text-zinc-500">Win Rate</p>
          <p className="text-xs font-semibold text-white tabular-nums">64.8%</p>
        </div>
        <div className="px-2.5 py-1.5 rounded-xl bg-zinc-800/60 min-w-[64px]">
          <p className="text-[9px] uppercase tracking-wider text-zinc-500">Profit Factor</p>
          <p className="text-xs font-semibold text-white tabular-nums">2.14</p>
        </div>
      </div>
    </div>
  );
}

function DisciplinePreviewCard() {
  return (
    <div className="w-72 rounded-2xl border border-l-4 border-zinc-800/80 border-l-emerald-500 bg-zinc-900/70 p-4 shadow-2xl shadow-[0_0_18px_rgba(16,185,129,0.12)]">
      <div className="flex items-center gap-1.5 mb-3">
        <Brain className="w-4 h-4 text-violet-400" />
        <h3 className="text-sm font-semibold text-white tracking-tight">Discipline</h3>
      </div>
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="text-2xl font-bold tabular-nums text-emerald-400">78%</span>
        <span className="text-[9px] text-zinc-500 uppercase tracking-wider">follow rate</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-3">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: '78%' }} />
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="text-xs font-semibold tabular-nums">61</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400">
          <XCircle className="w-3.5 h-3.5" />
          <span className="text-xs font-semibold tabular-nums">17</span>
        </div>
        <span className="flex items-center gap-0.5 text-xs font-medium text-zinc-500 ml-1">
          Full <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}

function TradeStatsPreviewCard() {
  return (
    <div className="w-64 rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-4 shadow-2xl flex items-center gap-3">
      <div className="p-2.5 rounded-xl bg-zinc-800/60 flex-shrink-0">
        <Scale className="w-4 h-4 text-zinc-400" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider font-medium text-zinc-500">Win / Loss Ratio</p>
        <p className="text-lg font-semibold tabular-nums flex items-baseline gap-1.5">
          <span>
            <span className="text-emerald-500">202W</span>
            <span className="text-zinc-500 mx-1">-</span>
            <span className="text-rose-500">110L</span>
          </span>
          <span className="text-[10px] font-normal text-zinc-500">(312 · 64.8%)</span>
        </p>
      </div>
    </div>
  );
}

function AccountsPreviewCard() {
  return (
    <div className="w-72 rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-4 shadow-2xl relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/60" />
      <div className="pl-2">
        <div className="flex items-start justify-between mb-2 gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-white truncate mb-0.5">Apex 100K</h3>
            <p className="text-xs text-zinc-500 truncate">Apex Trader Funding</p>
          </div>
          <Wallet className="w-4 h-4 text-zinc-500 flex-shrink-0" />
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-3">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: '62%' }} />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-zinc-500">P&amp;L</span>
          <span className="text-sm font-semibold tabular-nums text-emerald-500">+$6,240.00</span>
        </div>
      </div>
    </div>
  );
}

// Mirrors TradeHistory's table: header row + a handful of trade rows with
// date/symbol/side/P&L columns, same uppercase-label header treatment.
function TradeHistoryPreviewCard() {
  const rows: Array<{ date: string; symbol: string; side: string; pnl: number }> = [
    { date: '08/04', symbol: 'NQ', side: 'Long', pnl: 420.5 },
    { date: '08/05', symbol: 'ES', side: 'Short', pnl: -180.25 },
    { date: '08/06', symbol: 'GC', side: 'Long', pnl: 610.0 },
    { date: '08/07', symbol: 'CL', side: 'Long', pnl: 95.75 },
  ];
  return (
    <div className="w-80 rounded-2xl border border-zinc-800/80 bg-zinc-900/70 shadow-2xl overflow-hidden">
      <div className="px-4 pt-3 pb-2 border-b border-white/5">
        <p className="text-xs font-semibold text-white">Trade History</p>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/5 text-left">
            <th className="px-3 py-1.5 text-[9px] text-zinc-500 uppercase tracking-wider font-medium">Date</th>
            <th className="px-3 py-1.5 text-[9px] text-zinc-500 uppercase tracking-wider font-medium">Symbol</th>
            <th className="px-3 py-1.5 text-[9px] text-zinc-500 uppercase tracking-wider font-medium">Side</th>
            <th className="px-3 py-1.5 text-[9px] text-zinc-500 uppercase tracking-wider font-medium text-right">P&amp;L</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-white/5 last:border-0">
              <td className="px-3 py-1.5 text-xs text-zinc-400 whitespace-nowrap">{r.date}</td>
              <td className="px-3 py-1.5 text-xs text-white font-semibold">{r.symbol}</td>
              <td className="px-3 py-1.5 text-xs text-zinc-400">{r.side}</td>
              <td className={cn('px-3 py-1.5 text-xs font-mono text-right font-bold', r.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                {r.pnl >= 0 ? '+' : ''}{r.pnl.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Mirrors PerformanceCalendar's win/loss heatmap grid — same rounded cells
// tinted emerald/rose/neutral depending on the day's outcome.
function CalendarHeatmapPreviewCard() {
  const cells: Array<'win' | 'loss' | 'none'> = [
    'win', 'win', 'loss', 'none', 'win', 'loss', 'win',
    'loss', 'win', 'win', 'none', 'win', 'win', 'loss',
  ];
  return (
    <div className="w-72 rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-4 shadow-2xl">
      <p className="text-xs font-semibold text-white mb-3">Performance Calendar</p>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((c, i) => (
          <div
            key={i}
            className={cn(
              'aspect-square rounded-md border',
              c === 'win' && 'bg-emerald-500/25 border-emerald-500/40',
              c === 'loss' && 'bg-rose-500/25 border-rose-500/40',
              c === 'none' && 'bg-zinc-800/40 border-zinc-800/60'
            )}
          />
        ))}
      </div>
    </div>
  );
}

// Mirrors RulesPlaybook's rule list — left-accent-bar rows in a handful of
// the same accent colors used for rule categories.
function PlaybookPreviewCard() {
  const rules: Array<{ label: string; accent: string }> = [
    { label: 'Wait for confirmation candle', accent: 'border-l-emerald-500' },
    { label: 'Max 2% risk per trade', accent: 'border-l-violet-500' },
    { label: 'No trading during news spikes', accent: 'border-l-amber-500' },
  ];
  return (
    <div className="w-72 rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-4 shadow-2xl">
      <p className="text-xs font-semibold text-white mb-3">Rules Playbook</p>
      <div className="space-y-2">
        {rules.map((r, i) => (
          <div key={i} className={cn('flex items-center gap-2 rounded-lg border-l-4 bg-zinc-800/40 px-2.5 py-2', r.accent)}>
            <span className="text-xs text-zinc-300 truncate">{r.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Mirrors MarketNotices' notice cards.
function NoticePreviewCard() {
  return (
    <div className="w-64 rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-4 shadow-2xl">
      <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Market Notice</p>
      <p className="text-sm font-semibold text-white mb-1">FOMC Rate Decision</p>
      <p className="text-xs text-zinc-500">High impact · 2:00 PM EST</p>
    </div>
  );
}

// Mirrors the Knowledge Wiki's entry cards — category chip + title + snippet.
function WikiPreviewCard() {
  return (
    <div className="w-64 rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-4 shadow-2xl">
      <span className="inline-block text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 mb-2">
        Strategy
      </span>
      <p className="text-sm font-semibold text-white mb-1">Order Block Entries</p>
      <p className="text-xs text-zinc-500 line-clamp-2">
        Identify the last down candle before an impulsive move up, then wait for price to return to that zone.
      </p>
    </div>
  );
}

// The cluster of cards that fills the background, cycling through every
// preview variant so the wall is a mix of every screen, not just a repeat
// of one card.
const PREVIEW_CARDS = [
  PnLPreviewCard,
  TradeHistoryPreviewCard,
  DisciplinePreviewCard,
  CalendarHeatmapPreviewCard,
  AccountsPreviewCard,
  PlaybookPreviewCard,
  TradeStatsPreviewCard,
  NoticePreviewCard,
  WikiPreviewCard,
  AccountsPreviewCard,
  CalendarHeatmapPreviewCard,
  TradeHistoryPreviewCard,
  DisciplinePreviewCard,
  PlaybookPreviewCard,
  PnLPreviewCard,
  WikiPreviewCard,
];

// translateZ depth (px) per tile, cycled — negative pushes a card further
// from the camera (back layer), positive pulls it closer (front layer).
const DEPTH_CYCLE = [0, -140, 70, -70, 140, -210, 35, -105];

// Depth-based opacity so far-back cards recede visually instead of
// competing for attention with the ones up front.
function opacityForDepth(depth: number) {
  const fade = Math.min(Math.abs(depth) / 260, 0.45);
  return (0.9 - fade).toFixed(2);
}

// Dense, wall-to-wall tilted 3D backdrop built from every preview card
// above. Sits behind the login panel; pointer-events are disabled so it
// never intercepts clicks. Structure, innermost to outermost:
//   Card
//   -> per-tile translateZ depth layer (static, creates the 3D stack)
//   -> unified rotateX/rotateY/rotateZ cluster (static tilt, req'd by design)
//   -> single scene-wide drift animation (the "continuous motion" layer)
//   -> perspective root
function AppPreviewBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#0d0f12]" aria-hidden="true">
      <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: '1400px' }}>
        <div className="login-scene-drift" style={{ transformStyle: 'preserve-3d' }}>
          <div
            className="flex flex-wrap content-start gap-5 p-6"
            style={{
              width: '1900px',
              maxWidth: 'none',
              transform: 'rotateX(14deg) rotateY(-18deg) rotateZ(4deg)',
              transformStyle: 'preserve-3d',
            }}
          >
            {PREVIEW_CARDS.map((Card, i) => {
              const depth = DEPTH_CYCLE[i % DEPTH_CYCLE.length];
              return (
                <div
                  key={i}
                  style={{ transform: `translateZ(${depth}px)`, opacity: opacityForDepth(depth) }}
                >
                  <Card />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Darken + fade edges so the login panel stays legible */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0f12]/55 via-[#0d0f12]/75 to-[#0d0f12]" />
      <div className="absolute inset-0 bg-[#0d0f12]/35" />

      <style>{`
        @keyframes login-scene-drift {
          0% { transform: translate3d(-1.4%, -1%, 0) rotate(-0.4deg); }
          50% { transform: translate3d(1.4%, 1%, 0) rotate(0.4deg); }
          100% { transform: translate3d(-1.4%, -1%, 0) rotate(-0.4deg); }
        }
        .login-scene-drift {
          animation: login-scene-drift 48s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .login-scene-drift { animation: none; }
        }
      `}</style>
    </div>
  );
}


export function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setErrorMsg(null);
    setInfoMsg(null);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    setIsGoogleSubmitting(true);
    const { error } = await signInWithGoogle();
    // On success the browser navigates away to Google's consent screen, so
    // there's no "success" branch to handle here — only surface a failure
    // to *start* the OAuth flow (e.g. provider misconfigured).
    if (error) {
      setErrorMsg(error.message);
      setIsGoogleSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Enter both an email and a password.');
      return;
    }
    if (mode === 'signUp') {
      if (password.length < 8) {
        setErrorMsg('Password must be at least 8 characters.');
        return;
      }
      if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/;'`~]/.test(password)) {
        setErrorMsg('Password must include at least one special character.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
    }

    setIsSubmitting(true);
    const { data, error } =
      mode === 'signIn'
        ? await signInWithEmail(email.trim(), password)
        : await signUpWithEmail(email.trim(), password);
    setIsSubmitting(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    // Supabase's signUp() succeeds with a user but NO session whenever email
    // confirmation is required by the project's Auth settings — that's not
    // an error, but it also doesn't log the person in yet, so tell them.
    if (mode === 'signUp' && data.user && !data.session) {
      setInfoMsg('Check your inbox to confirm your email, then sign in.');
      return;
    }
    // Otherwise: session is now set, App.tsx's onAuthStateChange listener
    // picks it up and swaps this screen out for the dashboard automatically
    // — nothing else to do here.
  };

  const inputClass =
    'w-full h-11 px-3.5 rounded-lg bg-[#15171b] border border-zinc-800 text-white text-[16px] ' +
    'placeholder:text-zinc-500 outline-none transition-colors focus:border-zinc-500 focus:bg-[#181a1f]';

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#0d0f12] px-4 py-10 overflow-hidden">
      <AppPreviewBackdrop />

      <div className="relative z-10 w-full max-w-sm bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/80 shadow-2xl shadow-emerald-950/20 rounded-2xl p-6 sm:p-7">
        {/* Header */}
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">VSX</h1>
          <p className="mt-1.5 text-sm text-zinc-500">Institutional Trading &amp; Discipline Journal</p>
        </div>

        {/* Google OAuth — front and center */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleSubmitting || isSubmitting}
          className="w-full h-11 flex items-center justify-center gap-2.5 rounded-lg bg-white text-zinc-900 text-sm font-medium hover:bg-zinc-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isGoogleSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-xs text-zinc-500 uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {/* Error / info banners */}
        {errorMsg && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2.5 text-sm text-red-300">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {infoMsg && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-emerald-900/50 bg-emerald-950/40 px-3 py-2.5 text-sm text-emerald-300">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* Email / password form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="auth-email" className="block text-xs font-medium text-zinc-400 mb-1.5">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="auth-password" className="block text-xs font-medium text-zinc-400">
                Password
              </label>
              {mode === 'signIn' && (
                <button
                  type="button"
                  onClick={() => setInfoMsg('Password reset isn\'t wired up yet — check back soon.')}
                  className="text-xs font-medium text-zinc-500 hover:text-white transition-colors"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'signUp' ? '8+ characters, 1 special' : '••••••••'}
                className={cn(inputClass, 'pr-11')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {mode === 'signUp' && (
              <p className="mt-1.5 text-[11px] text-zinc-500">
                Must be 8+ characters and include a special character (e.g. ! @ # $).
              </p>
            )}
          </div>

          {mode === 'signUp' && (
            <div>
              <label htmlFor="auth-confirm-password" className="block text-xs font-medium text-zinc-400 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="auth-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className={cn(inputClass, 'pr-11')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(v => !v)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isGoogleSubmitting}
            className="w-full h-11 mt-1 flex items-center justify-center gap-2 rounded-lg bg-zinc-100 text-zinc-900 text-sm font-medium hover:bg-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'signIn' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Bottom form switcher */}
        <p className="mt-5 text-center text-xs text-zinc-500">
          {mode === 'signIn' ? (
            <>Don't have an account?{' '}
              <button type="button" onClick={() => switchMode('signUp')} className="text-zinc-300 hover:text-white underline underline-offset-2">
                Sign up
              </button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button type="button" onClick={() => switchMode('signIn')} className="text-zinc-300 hover:text-white underline underline-offset-2">
                Sign in
              </button>
            </>
          )}
        </p>

        {/* Trust badges */}
        <div className="mt-6 pt-5 border-t border-zinc-800/80 flex items-center justify-center gap-4 text-[10px] uppercase tracking-wider text-zinc-500">
          <span className="flex items-center gap-1.5">
            <CloudCog className="w-3.5 h-3.5" />
            Cloud Synced
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Encrypted
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Multi-Account
          </span>
        </div>
      </div>
    </div>
  );
}
