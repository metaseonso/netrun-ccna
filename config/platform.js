/* config/platform.js — deployment settings. Safe to commit: the Supabase anon key is a public key by design;
   access is controlled by row-level security (see docs/AUTH_PLAN.md).
   Leave supabaseUrl empty and the game runs fully offline with local saves and no sign-in button. */
window.PLATFORM = {
  supabaseUrl: '',            // e.g. 'https://abcdefgh.supabase.co'
  supabaseAnonKey: '',        // the project's anon public key
  providers: ['google'],          // Sign in with Google. Add 'github' or 'discord' later if wanted.
  redirectTo: null,           // null = this page
  dmCooldownMs: 3 * 60 * 1000, // minimum gap between protégé DMs
  dmMaxPerSession: 12,
  dev: /[?&]dev=1/.test(location.search) // dev panel: lint, engine state, step evaluation, golden runs
};
