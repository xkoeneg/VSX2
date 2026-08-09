import { createClient } from '@supabase/supabase-js';

// ============================================================================
// Supabase client — single shared instance for the whole app.
//
// Reads from Vite's import.meta.env, so both vars MUST be prefixed with
// VITE_ (Vite only exposes env vars to client code if they carry that
// prefix) and defined in a .env / .env.local at the project root:
//
//   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
//   VITE_SUPABASE_ANON_KEY=your-anon-public-key
//
// The anon key is safe to ship to the client — it's the public key meant
// for browser use, gated by your Supabase Row Level Security policies, NOT
// the service_role secret key (never expose that one client-side).
// ============================================================================
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Add VITE_SUPABASE_URL and ' +
    'VITE_SUPABASE_ANON_KEY to a .env(.local) file at your project root, ' +
    'then restart the dev server (Vite only reads .env files on boot).'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Lets Supabase pick the OAuth/email-confirmation redirect tokens back
    // up out of the URL after the Google/email-link round trip.
    detectSessionInUrl: true,
  },
});

// ----------------------------------------------------------------------------
// Auth helpers — thin wrappers so UI components (LoginPage, etc.) never talk
// to the Supabase client directly. Each returns Supabase's own
// { data, error } shape; callers read `.error?.message` to surface failures.
// ----------------------------------------------------------------------------

export function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // Sends the user back to wherever the app is currently hosted
      // (localhost in dev, your real domain in prod) after Google auth —
      // no hardcoded URL to keep in sync across environments.
      redirectTo: window.location.origin,
    },
  });
}

export function signUpWithEmail(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export function signOut() {
  return supabase.auth.signOut();
}
