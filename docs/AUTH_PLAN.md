# Sign in with Google, saves in the player's Drive

No backend. No database. Nothing to host or pay for. The code is complete and live in the repo; it switches on
when one value is filled in: `googleClientId` in `config/platform.js`.

## What happens when it is on

- The door and the HUD show **SIGN IN WITH GOOGLE**. Google's own popup asks for the account and for permission
  to keep the game's files in the player's Drive.
- Every record (one per handle) is written as a small JSON file into the player's Google Drive **app folder**.
  That folder is hidden from the player's normal Drive view and only this app can read it. The player can revoke it
  any time at myaccount.google.com → Security → Third-party access.
- Local saves keep working. On sign-in, newer local records are pushed up, newer Drive records are pulled down, so
  the same handles show on the door on any device. Saves go up at most every 15 seconds, and at once on LOG OUT
  or when the tab is hidden.
- Google tokens last one hour. The name stays in the HUD; when the token is gone a **RECONNECT** button pulses.
  One click renews it (the popup needs a click, browsers block it otherwise). Background saves never open popups.
- Nothing about a player ever leaves their browser except to Google's own APIs.

## Setting it up (owner, about ten minutes, once)

1. Go to https://console.cloud.google.com/ and make a project. Name: `netrun-ccna`.
2. **APIs & Services → Library**: enable **Google Drive API**.
3. **APIs & Services → OAuth consent screen** (now called "Google Auth Platform → Branding / Audience"):
   - User type **External**. App name `NETRUN://CCNA`, your support email, your email as developer contact.
   - **Scopes**: add `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`, and
     `https://www.googleapis.com/auth/drive.appdata`.
   - **Audience**: while it says **Testing**, only the emails you list under Test users can sign in (up to 100).
     Click **Publish app** when you want anyone to sign in. The scopes above are the low-risk kind; if Google asks
     for a verification review anyway, the app still works for test users while it is pending.
4. **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - Application type **Web application**. Name `netrun web`.
   - **Authorized JavaScript origins**: `https://metaseonso.github.io` and `http://127.0.0.1:8765` and `http://localhost:8765`.
   - No redirect URIs are needed (token flow, popup).
   - Copy the **Client ID** (ends in `.apps.googleusercontent.com`). It is public; the repo can hold it.
5. Paste it into `config/platform.js`:

   ```js
   googleClientId: 'PASTE-IT-HERE.apps.googleusercontent.com',
   ```

6. Commit, push, open the live site, click SIGN IN WITH GOOGLE, play one gig, open the site in another browser,
   sign in, and the handle is on the door with the gig done.

## For the campaign author

- Do not touch `js/platform/*.js` for content work. Records are plain JSON; new state keys just need a default in
  `fresh()` in `js/game.js` and a fill-in in `migrate()`.
- `VERSION` in `js/game.js` is 3. Raising it **drops** every older record on purpose (alpha rule). Do not raise it
  for a new key; only for a shape change that cannot be filled in.
- A signed-in player with no token is normal (the hour ran out). Everything still saves locally; the RECONNECT
  button handles the rest.

## Why Google Drive and not a database

A database needs an account, a schema, row-level rules, a key in the page and a bill. The Drive app folder is per
player, per app, free, and the player owns it. For a static GitHub Pages game with a few hundred players that is the
right size. If the game later needs leaderboards or shared crews, add a small backend then; the `Storage` adapter
interface (`list/load/save/remove`) is the seam.
