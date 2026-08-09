/// <reference types="vite/client" />

// Narrows import.meta.env so VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY get
// real autocomplete + type-checking wherever they're read (supabaseClient.ts,
// and anywhere else in the app), instead of falling back to `any`.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
