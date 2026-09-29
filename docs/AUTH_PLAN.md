# Sign in with Google, once per device; saves in the Watson DB

Changed 2026-09-29. The old build kept records in the player's Google Drive app folder. Drive tokens last one hour,
so the game kept opening Google popups. That build is gone. Old Drive records do not carry over.

## How it works

- Google is used for **identity only**. The door and the account menu show Google's own **Continue with Google**
  button (Google Identity Services, `google.accounts.id`). Scopes: `openid email profile`. No Drive.
- Google gives the page an ID token. `js/platform/auth.js` posts it to the Watson DB (`{kind:'session', idToken}`).
- `tools/watson-db.gs` checks the token with Google (tokeninfo: audience, issuer, expiry), then makes a random
  64-hex **device key**. The sheet keeps only its SHA-256 hash (`sessions` tab). The page keeps the key in
  localStorage (`netrunner-ccna-session`).
- From then on the key is all the device needs. Records list, load, save and delete through the Watson DB
  (`{kind:'rec', key, op}`, `records` tab, one row per handle, the JSON split into 45,000-character cells). No Google
  call, no popup, on every reload and every later day. The key does not expire.
- **SIGN OUT** deletes the key in the browser and in the sheet. If the sheet no longer knows a key (signed out
  elsewhere, row deleted), the next call answers `signedOut` and the page returns to the door.
- **The Google account is the key to the handles.** After sign-in the door lists every handle on that account and
  reopens the last one. No passcode. A handle is bound (`state.owner` = the Google user id) the first time it is used.
  A bound handle cannot be opened with a passcode. SIGN OUT sends a bound handle back to the door.
- A signed-in record lives in memory while playing. `save()` marks it dirty; `flush()` writes it at once on a sync
  (every talk and gig), LOG OUT, SIGN OUT and a hidden tab; between syncs after 20 quiet seconds, at most a minute late. Closing the tab with an unsaved record makes the
  browser ask first.
- Limits per account: 20 handles, 2 MB per record (a full playthrough is about 210 KB).
- Local handles (name + passcode, no Google) stay in the browser, logged in until LOG OUT. They are not security.
  The owner accepted that.

## Setup

Already done. `config/platform.js` holds `googleClientId` and `dbUrl`. The client id is also written in
`tools/watson-db.gs` (`CLIENT_ID`); if the client id ever changes, change both.

The Google Cloud OAuth client needs only the **Authorized JavaScript origins** (`https://metaseonso.github.io`,
`http://127.0.0.1:8765`, `http://localhost:8765`). The Drive API and the `drive.appdata` scope are no longer used; the
owner may remove them from the consent screen.

## For the campaign author

- Do not touch `js/platform/*.js` for content work. Records are plain JSON; new state keys just need a default in
  `fresh()` in `js/game.js` and a fill-in in `migrate()`.
- `VERSION` in `js/game.js` is 3. Raising it **drops** every older record on purpose (alpha rule). Do not raise it
  for a new key; only for a shape change that cannot be filled in.
- The `Storage` adapter interface (`list/load/save/remove`) is the seam if the store ever moves again.
