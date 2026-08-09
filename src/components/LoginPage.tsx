import { useState } from 'react';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0d0f12] px-4 py-10">
      <div className="w-full max-w-sm">
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
