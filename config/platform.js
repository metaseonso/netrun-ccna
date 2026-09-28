/* config/platform.js — deployment settings. Safe to commit: a Google OAuth client ID is public by design.
   Leave googleClientId empty and the game runs fully offline: local saves, no sign-in button.
   Fill it in and players get SIGN IN WITH GOOGLE; their records are stored in their own Google Drive
   (the hidden app folder), so they follow the player across devices. Setup: docs/AUTH_PLAN.md. */
window.PLATFORM = {
  googleClientId: '18221020659-3is07svdcb7d15gk27hkhhukge6mud8t.apps.googleusercontent.com',         // e.g. '1234567890-abc123.apps.googleusercontent.com'
  dmCooldownMs: 3 * 60 * 1000,  // minimum gap between crew calls
  dmMaxPerSession: 12,
  dev: /[?&]dev=1/.test(location.search) // dev panel: lint, engine state, step evaluation, golden runs
};
