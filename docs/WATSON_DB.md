# The Watson DB — suggestions and licenses

The game has no server. Its one database is a Google Sheet the owner owns, behind a small Apps Script web app
(`tools/watson-db.gs`). It holds two tabs:

- `suggestions` — what players type into the SUGGEST box in the HUD. Each row gets an id (`S0001`) and a status:
  new → ticketed → scoped → in progress → done, or declined.
- `licenses` — the numbered license a player gets when they finish the game (`NR-000001`), with the date, the handle,
  whether they chose the Hall of Fame, and their record.

Anyone can write (rate limited and size capped). Reading and updating need the private key.

## Setting it up (owner, about three minutes, once)

1. Open https://sheets.new (a new Google Sheet). Name it `Watson DB`.
2. **Extensions → Apps Script.** Delete what is in the editor. Paste all of `tools/watson-db.gs`. Save.
3. At the top, pick the function **setup** and press **Run**. Allow the permissions Google asks for (it is your own
   script touching your own sheet). Open **Execution log**: it shows `Private key: ...`. Copy the key.
4. **Deploy → New deployment → type: Web app.** Execute as: **Me**. Who has access: **Anyone**. Deploy. Copy the
   **Web app URL** (it ends in `/exec`).
5. Give Claude the URL and the key. Claude puts the URL in `config/platform.js` (`dbUrl`, public) and the key in
   `.secrets/watson-db.json` (never committed), and adds both as GitHub secrets for the Hall of Fame robot.

Changing the script later: **Deploy → Manage deployments → edit → Version: New version**. The URL stays the same.

## Reading and working the tickets

```bash
node tools/watson-db.js list            # every suggestion
node tools/watson-db.js list new        # only new ones
node tools/watson-db.js set S0007 scoped "HUD: add a sound slider; next UI pass"
node tools/watson-db.js licenses        # every license issued
```

Claude's routine when asked to "check the suggestion box": list `new`, mark each `ticketed` with a one-line scope
note, fix or build what fits the plan, and mark it `done` with the commit, or `declined` with the reason.

## The owner's dashboard

`owner.html` on the live site (for example `https://<site>/owner.html`). Paste the private key and press OPEN. Tick
"Remember the key on this device" only on your own machine. It shows: players, active players, licenses, nights
finished, flatlines, fixers, new players by week, the furthest night reached, where players stall, flatlines by night,
median days to each rite, classes and builds, open suggestions and every license. `owner.html?demo=1` draws made-up
numbers without the key.

The page reads `?action=dashboard`, added on 2026-09-28. **After that date, redeploy the script once:** paste the new
`tools/watson-db.gs` into the Apps Script editor, save, then **Deploy → Manage deployments → edit → Version: New
version → Deploy**. The URL stays the same. The `pulse` tab grows its new columns by itself on the next write. Players on
older builds keep sending the short record; they show as "older" and have no dates.
