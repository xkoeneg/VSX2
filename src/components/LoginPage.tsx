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
// the real Dashboard components (Total P&L hero, Discipline status banner,
// Win/Loss stat card, Accounts panel). These are purely decorative: fixed
// demo numbers, no context/hooks, so the login screen never depends on
// live app data.
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

// Tilted, drifting 3D backdrop built from the mock preview cards above.
// Sits behind the login panel; pointer-events are disabled so it never
// intercepts clicks, and each card gets a slightly different float
// duration/delay so the whole scene feels alive rather than uniform.
function AppPreviewBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: '1200px' }}>
        <div
          className="relative w-[1500px] max-w-none h-[900px]"
          style={{
            transform: 'rotateX(15deg) rotateY(-20deg) rotateZ(5deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          <div
            className="absolute opacity-80 login-float-a"
            style={{ top: '6%', left: '4%' }}
          >
            <PnLPreviewCard />
          </div>

          <div
            className="absolute opacity-70 login-float-b hidden md:block"
            style={{ top: '10%', right: '6%' }}
          >
            <DisciplinePreviewCard />
          </div>

          <div
            className="absolute opacity-70 login-float-c hidden lg:block"
            style={{ bottom: '14%', left: '10%' }}
          >
            <TradeStatsPreviewCard />
          </div>

          <div
            className="absolute opacity-75 login-float-d"
            style={{ bottom: '8%', right: '10%' }}
          >
            <AccountsPreviewCard />
          </div>
        </div>
      </div>

      {/* Darken + fade edges so the login panel stays legible */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0f12]/50 via-[#0d0f12]/70 to-[#0d0f12]" />
      <div className="absolute inset-0 bg-[#0d0f12]/30" />

      <style>{`
        @keyframes login-float-a {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50% { transform: translate3d(14px, -22px, 0) rotate(1.5deg); }
        }
        @keyframes login-float-b {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50% { transform: translate3d(-18px, 18px, 0) rotate(-2deg); }
        }
        @keyframes login-float-c {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50% { transform: translate3d(12px, 20px, 0) rotate(1deg); }
        }
        @keyframes login-float-d {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50% { transform: translate3d(-14px, -16px, 0) rotate(-1.5deg); }
        }
        .login-float-a { animation: login-float-a 22s ease-in-out infinite; }
        .login-float-b { animation: login-float-b 26s ease-in-out infinite; animation-delay: -4s; }
        .login-float-c { animation: login-float-c 19s ease-in-out infinite; animation-delay: -9s; }
        .login-float-d { animation: login-float-d 24s ease-in-out infinite; animation-delay: -13s; }
        @media (prefers-reduced-motion: reduce) {
          .login-float-a, .login-float-b, .login-float-c, .login-float-d { animation: none; }
        }
      `}</style>
    </div>
  );
}

export function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setErrorMsg(null);
    setInfoMsg(null);
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
    if (mode === 'signUp' && password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
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

      <div className="relative z-10 w-full max-w-sm rounded-3xl backdrop-blur-md bg-black/60 border border-white/5 shadow-2xl p-5 sm:p-6">
        <div className="mb-8 text-center">
          <span className="font-bold text-2xl uppercase tracking-wider text-white">VSX</span>
          <p className="mt-1.5 text-sm text-zinc-500">Sign in to your trading journal</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#111318] shadow-2xl overflow-hidden">
          {/* Sign In / Sign Up tab toggle */}
          <div className="grid grid-cols-2 gap-1 p-1.5 m-4 mb-0 rounded-xl bg-[#0d0f12] border border-zinc-800">
            {(['signIn', 'signUp'] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={cn(
                  'h-10 rounded-lg text-sm font-medium transition-colors',
                  mode === m
                    ? 'bg-zinc-100 text-zinc-900'
                    : 'text-zinc-400 hover:text-white'
                )}
              >
                {m === 'signIn' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <div className="p-6 pt-5">
            {/* Google OAuth */}
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
                <label htmlFor="auth-password" className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={mode === 'signUp' ? 'At least 6 characters' : '••••••••'}
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
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isGoogleSubmitting}
                className="w-full h-11 mt-1 flex items-center justify-center gap-2 rounded-lg bg-zinc-100 text-zinc-900 text-sm font-medium hover:bg-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {mode === 'signIn' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-600">
          {mode === 'signIn' ? (
            <>Don't have an account?{' '}
              <button type="button" onClick={() => switchMode('signUp')} className="text-zinc-400 hover:text-white underline underline-offset-2">
                Sign up
              </button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button type="button" onClick={() => switchMode('signIn')} className="text-zinc-400 hover:text-white underline underline-offset-2">
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
