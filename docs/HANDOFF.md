# HANDOFF — NETRUN://CCNA · Alpha framework → full campaign

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
| Content lint | `js/engine/validate.js` | done |
| Golden-solution runner | `Game.runSolution` in `js/game.js`, `tools/check.js` | done |
| Dev panel (`?dev=1`): lint, step diagnosis, net state, ping tester, golden runs, cards | `js/ui.js` | done |
| Storage + auth interface, Supabase-ready | `js/platform/*.js`, `config/platform.js`, `docs/AUTH_PLAN.md` | scaffolded, inactive until configured |
| Anki importer + page registration | `tools/import_apkg.py`, `tools/register_cards.py` | done; course files at `C:\Users\Seonso\Desktop\CCNA Course Files` |
| Content: Stage 4 (Days 20–21) | `js/data/stages/04-bridges.js`, 7 gigs in `js/data/jobs.js`, 30 cards | built, the reference for tone and depth |
| Content: Stages 1–3, 5–8 | `js/data/stages/*.js` | one intro level each; everything else is yours |

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
1. Level(s) in the stage file, written to the story bible, with `why` on the question, `KIT`, `LORE`.
2. Cards imported (or written) and tagged with the right skill.
3. A gig with a `net` topology, steps that check **outcomes** through `ctx.net()`, a `why` on every step,
   and a `solution` that passes in `npm test` with no vacuous-step warning.
4. Glossary entries for every `[[term]]` you used.
5. `npm test` green.

## Rules

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

## Known limits of the engine (extend with tests if a day needs them)

- OSPF: single process, areas honoured for adjacency, no DR/BDR, no LSA types, cost from bandwidth or `ip ospf cost`.
- RIP/EIGRP: adjacency and hop-style metrics only; enough for `show ip route` codes and reachability.
- IPv6: interface addresses, link-local/EUI-64, connected + static routes; no OSPFv3, no ping6 through the forwarding engine yet.
- NAT: static, dynamic pool, PAT overload; translation table is built from pings sent in the console.
- Wireless: no radio model. Use `form`, `choice`, `order` steps for WLC configuration days.
- QoS, SNMP, syslog, NTP, CDP/LLDP, FTP/TFTP: config is parsed and shown; no traffic effect. Use `need` + `show`.
- Automation days: use `text` steps with a validator (JSON.parse, regex) and `order` steps.

## CHANGELOG (append engine changes here)

- 2026-09-27 · Alpha framework complete. Engine, tooling, telemetry, protégés, platform scaffold.
