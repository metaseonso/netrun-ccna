# HANDOFF — NETRUNNER://CCNA · Alpha framework → full campaign

You are picking up a finished engine and writing the campaign into it. This file is the map. Read it,
then `docs/CAMPAIGN_GUIDE.md` (how to write content), `docs/STORY_BIBLE.md` (how it must sound),
`docs/TASKS.md` (what to build, in order). You should not need the chat that produced this.

## What exists

| Layer | Where | State |
|---|---|---|
| Console sim (IOS grammar, abbreviations, modes, hosts) | `js/sim.js` | done |
| Config parser (transcript → structured config) | `js/engine/config.js` | done |
| Network engine (VLAN/trunk/STP/EtherChannel, routing C/S/OSPF/RIP/EIGRP, HSRP, DHCP + snooping, port security, DAI, NAT, ACL, ping/tcp with hop path, IPv6 basics) | `js/engine/net.js` | done, tested in `tests/engine.test.js` |
| `show` renderers (30+ commands) + PC console | `js/engine/show.js` | done |
| Spanning tree election engine | `js/engine/stp.js` | done |
| Flash cards: spaced repetition | `js/engine/srs.js` | done |
| Protégés: roster, DMs, escalation, flatline, orphans, team gating | `js/engine/protege.js` + `js/data/protege-lines.js` | done, voice lines are seed content |
| Telemetry + stats dashboard | `js/engine/telemetry.js`, STATS view in `js/ui.js` | done |
| Content lint (schema, references, coverage, **out-of-world words**, braindance fields, archetype completeness) | `js/engine/validate.js` | done |
| Creds + Marrow's stall (gifts, Dispatch favor, braindances, deck skins) | `js/data/shop.js`, `Game.shop` in `js/game.js` | done |
| Crew archetypes, bond, trust letters, gratitude, favors, orphan keepsakes | `js/engine/protege.js`, `js/data/protege-lines.js`, `docs/CREW_ARCHETYPES.md` | done, seed voice lines |
| The dive transition, braindance title cards, in-world interface vocabulary | `js/ui.js`, `css/world.css` | done |
| Golden-solution runner | `Game.runSolution` in `js/game.js`, `tools/check.js` | done |
| Dev panel (`?dev=1`): lint, step diagnosis, net state, ping tester, golden runs, cards | `js/ui.js` | done |
| Sign in with Google + saves in the player's Drive | `js/platform/*.js`, `config/platform.js`, `docs/AUTH_PLAN.md` | complete; switches on when the owner pastes the Google client ID |
| Local handles: name + passcode, remembered until LOG OUT | `Game.setHandle(h, pass)` in `js/game.js`, the door in `js/ui.js` | complete; not security, by design |
| The body: FOOD and CHROME meters, gig costs, food + ripperdoc at the stall, Marrow's tab | `Game.body` in `js/game.js`, `js/data/shop.js` | complete; numbers are first-pass, tune by playing |
| Syncs (the only save) + the FLATLINED screen with reload / exit | `Game.sync`, `Game.reload`, `Game.flatline`; `deadView()` in `js/ui.js` | complete; no export/import exists on purpose |
| Anki importer + page registration | `tools/import_apkg.py`, `tools/register_cards.py` | done; course files at `C:\Users\Seonso\Desktop\CCNA Course Files` |
| Content: Stage 4 (Days 20–21) | `js/data/stages/04-bridges.js`, 7 gigs in `js/data/jobs.js`, 30 cards | built, the reference for tone and depth |
| Content: Stages 1–3, 5–8 | `js/data/stages/*.js` | one intro level each; everything else is yours |

## Your first hour

0. **Your first message to the owner is the sign-in walkthrough.** Open `docs/AUTH_PLAN.md` and take them through it
   live, one screen at a time: ask what they see, give the next click, wait. Stop when the Google client ID is in
   `config/platform.js`, pushed, and SIGN IN WITH GOOGLE works on the live site. About ten minutes. Do this before any
   campaign work.
1. `npm test`. Green. Then `python -m http.server 8765` and open `http://localhost:8765/?dev=1`. Make a handle (name +
   any passcode). Press DEV.
2. Read `docs/STORY_BIBLE.md` end to end, then `docs/CREW_ARCHETYPES.md`. These are not suggestions.
3. Play Stage 4 as a player: meet Old Root, take the Class D dives, watch FOOD and CHROME drop, eat at Marrow's, pick up
   one crew call, buy Dev a bowl of noodles, go in on empty once and read the FLATLINED screen. That is the bar.
4. **Your first deliverable is the HUD.** The menu is full: MAP GRID BOARD CREW STALL DECK CODEX RECORD JOURNAL, plus
   DEV, LOG OUT, sign-in, two meters, rep, class, creds, crew count, the rite line. Give every nav item a proper icon
   (inline SVG, one stroke style, 16–18px, label beside it, badge kept), group the HUD into three clear bands
   (identity · body and rep · nav), make the meters readable at a glance on a phone, and give the stall, board and crew
   screens the same clarity pass. No new colours; the tokens in `css/style.css` are the palette. Commit that before Day 22.
5. Warm up on **Day 22 (Rapid STP)**: one level in `04-bridges.js` with a braindance, one gig with a `net` topology and
   a golden solution, register nothing new (same stage file). `npm test` green. Commit.
6. Then work `docs/TASKS.md` in order, one day per commit.

## How to work

```bash
npm test                # lint + every golden solution + engine tests. Must pass before every commit.
npm run check           # same, with warnings listed
python -m http.server 8765   # then open http://localhost:8765/?dev=1
```

The dev panel (`?dev=1`, DEV button in the top bar) shows: lint errors live, why the current step would
pass or fail (which `need` lines are missing, what `check` returned, engine issues), routing tables and
a ping tester for the current gig, and one-click golden runs. If something is wrong, it is visible.

## What to build

The full CCNA arc: Jeremy's IT Lab days 1–63. Each day gets at least one level (a scene with a person
in it), the day's Anki deck as cards, and one gig built from that day's Packet Tracer lab. Mega Lab
becomes the Class A capstone. `docs/TASKS.md` lists every day with its stage, NPC, skills and the lab.

Definition of done for a day:
1. Level(s) in the stage file, written as scenes to the bible: people, a place, a problem; `KIT`; a `SYNC` with `why`; a `LORE` braindance with `title`, `year`, `vibe` (era slang, one line).
2. One line in the stage where a character says the corpo future is built on this street tech (once per stage is enough).
3. The day's deck already imported; map the day to a real skill in `tools/import_apkg.py` DAY_SKILL once its skill exists, re-run with `--force` for that day.
4. A gig from the day's Packet Tracer lab: `net` topology, steps that check **outcomes** through `ctx.net()`, `why` on every step, `creds`, a `solution` that passes in `npm test` with no vacuous-step warning. Rites (`rite: true`) for the last gig of each class.
5. Glossary entries for every `[[term]]` you used. Zero out-of-world words (the lint lists them).
6. `npm test` green. Play the day once in the browser with `?dev=1`.

## Rules

- **Survival is the loop.** Every gig costs food and chrome at jack-in (`Game.body.cost`; override with `food` / `chrome`
  on the gig, rites cost more). Pay comes at the end. Zero on either meter is a flatline. Never add a time-based drain:
  a player who walks away for a week must find the game exactly where they left it.
- **Syncs are the only save.** `readLevel` (first time) and `finishJob` call `Game.sync(label)`. There is no export,
  import or manual save, and there must never be one. If a new beat type earns a checkpoint, call `sync('...')` once
  with an in-world label. Never call it from a purchase or a crew call.
- **Remembering the player is the standard.** A handle stays logged in until LOG OUT; a Google account stays signed in
  until SIGN OUT. Do not add a "remember me" box.

- **Do not change the engine to make content pass.** If the engine genuinely lacks a feature (a `show`
  command, a config verb, a state rule), add it in `js/engine/*` **with a test** in `tests/engine.test.js`,
  in its own commit, and note it in the CHANGELOG section below.
- **Checks read state, not keystrokes.** `ctx.net().ping('PC1','10.0.2.10').ok` beats `need: [{line:/ip route/}]`.
  Use `need` only for pure verification steps ("look at it from SW3") and for topics with no state.
- **Every step has a `why`.** The KEY tab and WALK ME THROUGH IT depend on it. Lint enforces it.
- **Every gig has a `solution`.** No exceptions. The runner is the only proof the gig can be finished.
- Console input is lower-cased. ACL names, hostnames and VLAN names come out lower-case in state.
- Router physical interfaces start **shut down**, like real IOS. Switch ports start up. Preconfigure with `net.preconfig`.
- Keep facts exam-exact. The two note repos and the Anki decks are the source of truth for numbers and commands.

## Known gaps you will inherit (not engine limits)

- **HUD and menu clarity** (first deliverable, see "Your first hour" step 4): icons for every nav item, three bands,
  meters readable on a phone.
- **Survival numbers are a first pass.** Costs 15 + 5 × classRank food and 10 + 5 × classRank chrome, 1 chrome per bad
  call; food at 12 / 30 / 70 creds for 15 / 40 / 100; the ripperdoc at 120 for a full chrome. A Class D gig pays 90.
  Play three classes and tune. Marrow's tab (one free bowl per class rank when the player is broke and under 30 food)
  is the anti-soft-lock; keep something like it.

- **Rites are now a real gate.** `Game.classFor` only promotes when the rep is there **and** the rite gig of the class
  below is done (`rite: true` + `cls`). No rite written for a class = no gate, so the campaign can grow in order.
  The three flagged demo gigs (`c-rogue-switch`, `b-per-vlan-split`, `a-last-storm`) are placeholders: write the
  true rites for D→C (a Class D rite does not exist yet), C→B and B→A. Bigger topologies, a payday, an outro where
  the district starts calling the player by their class. Retcon the demo gigs freely; nothing is saved from the alpha.
- All twenty NPCs have portraits. New NPCs you add get the procedural sprite until the owner runs `tools/gen_npcs.py`
  (add a `SUBJECTS` line for them). Do not run it yourself; it spends money.
- Archetype voice lines are seed content: 3–4 lines per situation. Add depth, keep every situation covered (lint warns).
- The crew's calls use real-time spacing (10 min, 1 h, 1 d …). In dev, DEV → CALLS → FORCE CALL.
- `Day 63 (part 2) Terraform` deck skipped (new Anki format; not exam content). Terraform gets a mention in Ansible's stage, no more.
- Sign-in is code-complete (Google, saves in the player's own Drive). It is off until the owner pastes a client ID
  into `config/platform.js`; `docs/AUTH_PLAN.md` has the ten-minute setup. Never touch `js/platform/` for content.
- Save records are `VERSION` 3. Older records are dropped, not migrated. New keys go in `fresh()` with a default;
  do not raise `VERSION` for that.
- Mobile: the door, MAP, STALL and HUD fit a 375px phone. The dive (map + console side by side) stacks; test it once
  per new gig shape.

## Known limits of the engine (extend with tests if a day needs them)

- OSPF: single process, areas honoured for adjacency, no DR/BDR, no LSA types, cost from bandwidth or `ip ospf cost`.
- RIP/EIGRP: adjacency and hop-style metrics only; enough for `show ip route` codes and reachability.
- IPv6: interface addresses, link-local/EUI-64, connected + static routes; no OSPFv3, no ping6 through the forwarding engine yet.
- NAT: static, dynamic pool, PAT overload; translation table is built from pings sent in the console.
- Wireless: no radio model. Use `form`, `choice`, `order` steps for WLC configuration days.
- QoS, SNMP, syslog, NTP, CDP/LLDP, FTP/TFTP: config is parsed and shown; no traffic effect. Use `need` + `show`.
- Automation days: use `text` steps with a validator (JSON.parse, regex) and `order` steps.

## CHANGELOG (append engine changes here)

- 2026-09-28 · Sign-in live (client ID in `config/platform.js`, consent screen published, brand review pending). The door
  now treats the Google account as the key: `Game.claimHandle`, `Game.myHandles`, `Game.deckHandles`, `Game.linking`,
  `state.owner`. `onAuth` in `js/game.js` binds and syncs only the signed-in account's records. `privacy.html` and
  `terms.html` at the site root, linked from the door and the no-script home page. Cache version `?v=14`.

- 2026-09-27 · Renamed to NETRUNNER://CCNA (storage keys `netrunner-ccna-*`). Added the body (`Game.body`: food and
  chrome meters, gig costs, wear per bad call, `eat`), the stall kinds `food` and `service`, Marrow's tab, syncs as the
  only save (`Game.sync` / `Game.reload`), the FLATLINED screen (`Game.flatline`, `state.dead`, `state.meta.deaths`),
  local handles with passcodes (`Game.setHandle(h, pass)`), removed export/import. Rites gate classes. Sign in with
  Google + Drive app-folder saves, code complete.

- 2026-09-27 · Alpha framework complete. Engine, tooling, telemetry, protégés, platform scaffold.

## Immersion rules (binding)

- Read `docs/STORY_BIBLE.md` Part II before writing anything. The vocabulary table there is law.
- `npm test` warns on out-of-world words in player-facing text. Fix every one before commit.
- Every LORE beat has `title`, `year` and `vibe` (a braindance: the year is the hero, the title is the caption, the vibe is one line of era slang). Every stage has one "legacy is the foundation" line.
- Crew archetypes, bond, favors and rites: `docs/CREW_ARCHETYPES.md`. Every archetype must have every line set (lint warns).
- Each class has a rite of passage gig: `rite: true`, big `creds`, a story payoff in the outro.
- Every protégé milestone (3/6/10 saves) has a gratitude line in `protege-lines.js`; every flatline an orphan keepsake line.
- Gigs declare `creds` (default 3 × rep). Shop items live in `js/data/shop.js`; do not add items that bypass learning.
