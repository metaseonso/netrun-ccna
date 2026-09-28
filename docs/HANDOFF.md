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
- **Every step has a `why`.** The CODEX and the fixer's notes show it. Lint enforces it.
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
- All 72 decks are imported. Six decks (days 3, 5, 59, 61) and Terraform use Anki's compressed format; `tools/import_apkg.py` now reads it (needs `pip install zstandard`). Card pictures: `tools/extract_card_images.py` → `js/data/cards/images.js`, shown in crew calls.
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

- 2026-09-28 · VTP: `vtp mode server|client|transparent`, `vtp domain`, `vtp version`, `vtp password`; every VLAN change on a
  server or client raises its revision (a net device may set `vtpRevision` to play a spare switch from someone's lab); servers
  and clients in one domain joined by trunks take the VLAN database with the highest revision, transparent switches keep
  their own at revision 0, a switch with no domain joins the one it hears; access ports whose VLAN vanished go `inactive`;
  clients refuse `vlan N`; `switchport access vlan N` creates a missing VLAN like IOS; `show vtp status`; `api.vtp`, `api.vlans`.
  DTP: `switchport nonegotiate` on a trunk leaves a dynamic neighbour as access (a mismatch). Tested (section 28).
  `no vlan 10` is no longer read as `no vlan10` (interface Vlan10).

- 2026-09-28 · Multilayer switching: SVIs start shut down (all of them, not only VLAN 1) and their line protocol is up only when
  the VLAN exists and a switchport carrying it is up (autostate); a `switch` routes between its interfaces only with `ip
  routing` (without it, it still answers on its own SVIs); `no switchport` makes a routed port with its own address (it leaves
  VLANs, trunking and spanning tree); `default interface X` resets a port; `default` is no longer expanded to
  `default-information`; `no interface X` deletes a subinterface, SVI or loopback. Tested in `tests/engine.test.js` (section 27).

- 2026-09-28 · The shell keeps the case you typed for VLAN names and interface descriptions (`show vlan brief`, `show interfaces
  description`, `show interfaces`, running-config), while the parsed config keeps them lower case for checks (`name`, `desc`;
  the typed form is `shown`, `descShown`). `show vlan brief` lists the legacy VLANs 1002–1005. Tested (section 18).

- 2026-09-28 · Static routes three ways: `ip route P M NEXTHOP`, `ip route P M EXIT` (the router ARPs for the destination and
  the neighbour answers by proxy ARP) and `ip route P M EXIT NEXTHOP`, each with an optional AD; a route whose exit
  interface is down leaves the table. `show ip route` prints like IOS: full codes, local /32 routes, entries grouped under
  their classful network (`is variably subnetted, N subnets, M masks`). Tested in `tests/engine.test.js` (section 13).

- 2026-09-28 · Routing loops: traceroute repeats the looping routers up to hop 30, and a PC ping into a loop answers `TTL expired
  in transit` from the last router. Tested in `tests/engine.test.js` (section 12).

- 2026-09-28 · Speed and duplex negotiation per link (`i.op`): auto on both ends is the fastest common speed at full duplex; a
  hard-coded end turns negotiation off, so the auto end senses the speed and falls back to half duplex at 10/100 (a mismatch);
  different hard-coded speeds keep the link down (`speed-mismatch`). `show interfaces` prints the operating values and error
  counters (CRC, runts, frame on the full end, late collisions on the half end during a mismatch); `show interfaces status` marks
  negotiated values `a-`. Tested in `tests/engine.test.js` (section 11).

- 2026-09-28 · `show interfaces description` (status, protocol, description per port). Tested in `tests/engine.test.js` (section 1).

- 2026-09-28 · Learning, opt-in per gig with `net.learn: true`: switches learn source MACs and hosts and routers learn ARP
  entries only from pings and traceroutes typed in a shell (checks never teach the network); the first ping over a hop with no
  ARP entry loses one packet (`Request timed out.` / `.!!!!`); `clear mac address-table dynamic [address|interface]`,
  `clear arp-cache`, PC `arp -d`; `show arp` / `show ip arp` on routers; `api.macTable`, `api.arp`. Without `learn` the tables
  stay all-knowing as before. PC ping prints real Windows statistics. Tested in `tests/engine.test.js` (section 10).
- 2026-09-28 · FTP and TFTP in the shell: `copy tftp: flash:`, `copy ftp: flash:` (or `copy tftp://host/file flash:`) ask for
  the host, the source and the destination like IOS (`Device.ask`, the prompt shows the question; an empty answer takes the
  default), then the file moves if the router can ping the server, the server's net device lists it in `files: [{ name, size }]`,
  and for FTP the box's `ip ftp username`/`ip ftp password` match the server's `ftp: { user, pass }`. Downloads land in
  `dev.flash`; `copy running-config|startup-config|flash:<file> tftp:|ftp:` records uploads in `dev.sent`; both add a
  `copy <proto>://host/file ...` line to the transcript. `show flash`, `show file systems`; `boot system`, `ip ftp username`,
  `ip ftp password` parsed (`cfg.bootSystem`, `cfg.ftpUser`, `cfg.ftpPass`). Tested.
- 2026-09-28 · NAT as the shell shows it: a ping from a PC now fills the translation table of every router it crossed (it
  used to take a ping from the router itself); a dynamic pool gives each inside host its own address and keeps it until
  `clear ip nat translation *` (new), so a small pool runs out and the next host's packet is dropped; PAT gives each host its
  own port on the shared address; a new `ip nat inside source list N ...` replaces the old one for that list, and
  `no ip nat inside source list|static` removes it. `show ip nat translations` lists static mappings from the config and the
  outside address of every translation. Tested.
- 2026-09-28 · The internet and NAT: a ping from a `cloud` now leaves as the internet (it used to take the PC path and
  "deliver" any public address to itself); traffic from the internet for a router's static NAT address or NAT pool is
  handed to that router (`cloudHandoff`), an address on the provider link that nobody holds answers nothing, and a
  server's reply leaves wearing its static mapping. Before this, `ping('ISP', <static global>)` passed without reaching
  the server. Tested.
- 2026-09-28 · Voice VLANs: `switchport voice vlan N` and `power inline police [action errdisable|log]` are parsed
  (`cfg.interfaces[p].voiceVlan`, `.powerPolice`); a host with `voice: true` (an IP phone) joins its port's voice VLAN when
  the port has one, else the access VLAN; `show interfaces X switchport` shows the mode, the access VLAN and the voice VLAN.
  Tested.
- 2026-09-28 · QoS (MQC) in the shell: `class-map [match-any|match-all] N` (config-cmap), `policy-map N` (config-pmap) and
  `class N` inside it (config-pmap-c), plus `arp access-list N` (config-arp-nacl), are real sub-modes; running-config prints
  class-maps and policy-maps (classes nested) before the interfaces. Parsed into `cfg.qos.classMaps` (matches) and
  `cfg.qos.policyMaps` (`order`, `classes[n]`: `setDscp`, `setCos`, `priority`, `bandwidth`, `police`, `shape`,
  `fairQueue`, `wred`); `service-policy input|output N` and `mls qos trust cos|dscp|device cisco-phone` on interfaces.
  `show class-map`, `show policy-map`, `show policy-map interface [X]` (DSCP names shown with their values; counters stay
  at zero, there is no traffic model). Tested.
- 2026-09-28 · The shell's abbreviation expander no longer eats keywords: `cdp run` / `lldp run` (they were read as `running-config`,
  so CDP could not be turned off and LLDP never on), `sh ip int br` and `sh ip int g0/1` (they became `show ip interfaces`, which
  had no output), `logging trap N` and `snmp-server community X ro`. The parser honours `no ntp server X`, `no logging X`,
  `no snmp-server community X`, and reads `ntp master [stratum]` (`cfg.ntpMaster`, default 8). Tested (section 10).
  `no access-list N` removes every line of list N from the running-config, not just the first. Tested (section 10).

- 2026-09-28 · CDP and LLDP per port: `no cdp enable` / `cdp enable`, `no lldp transmit` / `no lldp receive` on an interface
  (`Net` `discoveryPorts`: LLDP needs the sender to transmit and the listener to receive); `cdp timer|holdtime N`,
  `lldp timer|holdtime|reinit N`, `[no] cdp advertise-v2` are parsed; `show cdp` and `show lldp` print the global timers.
  Tested (section 11).

- 2026-09-28 · NTP has state (`Net.ntpSync`, `ctx.net().ntp('R2')` → `{ synced, stratum, server, reason, tried }`): an `ntp server`
  must answer a ping and be synchronised itself (a router) or be a server/cloud with `ntpStratum` in the gig's `net`; stratum is the
  server's plus one, above 15 is unsynchronised; `ntp master [n]` is its own clock (default 8); `ntp authenticate` needs
  `ntp server X key N`, `ntp trusted-key N` and a matching `ntp authentication-key N md5 K` on the server. Parsed too: `ntp peer`,
  `ntp source`, `ntp update-calendar`, `clock timezone NAME H [M]`, `clock summer-time NAME recurring`. `show ntp status` and
  `show ntp associations` follow the real sync; new `show clock [detail]` (the 1993 IOS default with `*` until NTP syncs, then
  the time in the configured zone) and `show calendar`. `clock set`, `calendar set`, `clock read-calendar`, `clock update-calendar`
  are accepted in privileged EXEC; `clock summer-time NAME recurring` follows the US rule (second Sunday in March to the first
  Sunday in November). Tested (section 12).

- 2026-09-28 · DNS (`Net.resolve`, `ctx.net().resolve('PC1', 'records')` → `{ ok, ip, server, reason, nx }`): a host asks its DNS
  servers (`dns` on the host, or the DHCP lease) over UDP 53, so ACLs apply; a router with `ip dns server` answers from its
  `ip host NAME IP` table and forwards the rest to its `ip name-server`s while `ip domain lookup` is on (the default); a server or
  cloud answers from `dnsRecords: { name: ip }` in the gig's `net`. Parsed: `ip host`, `no ip host`, `ip name-server`,
  `[no] ip dns server`, `[no] ip domain lookup` / `ip domain-lookup`. PCs: `nslookup NAME`, `ping NAME`, `tracert NAME`,
  `ipconfig /displaydns`, `ipconfig /flushdns`. Routers: `show hosts`, `ping NAME` / `traceroute NAME` (translated first).
  Tested (section 13).

- 2026-09-28 · DHCP relay to a router's own pool: `ip helper-address` pointing at an interface address of a router that has a pool
  for the relay interface's subnet gives the host a lease from that pool, after that router's `ip dhcp excluded-address` ranges
  (before, relay only reached `server` devices with `pools`). The path between relay and server is not checked. Tested (section 14).
  Two DHCP clients on one segment now get consecutive addresses (.21 and .22); the second used to skip one. Tested (section 14).

- 2026-09-28 · SNMP has state: `ctx.net().snmp(nms, agentIp, community, write)` → `{ ok, reason }` (the community must exist,
  `rw` for a Set, its ACL from `snmp-server community X ro|rw ACL` must permit the manager, and UDP 161 must get through);
  `ctx.net().snmpTraps('R1')` → one entry per `snmp-server host` (needs `snmp-server enable traps` and UDP 162). Parsed:
  `snmp-server contact`, `location`, `host IP [version 1|2c|3] COMMUNITY`, `no snmp-server host`, `enable traps [types]`.
  New `show snmp` and `show snmp host`. Tested (section 15).

- 2026-09-28 · Syslog has state: `logging console|monitor|buffered|trap LEVEL` (by number or name; `buffered` takes a size),
  `no logging console|monitor|buffered`, `service timestamps log datetime|uptime [msec]`, `service sequence-numbers`, and
  `logging synchronous` on a line are parsed (`cfg.logLevels`, `logBufferSize`, `logTs`, `logSeq`, `con.loggingSync`).
  `ctx.net().syslog('R1')` → one entry per `logging host`, reached over UDP 514, at the trap level (default 6). `show logging`
  prints the real levels and hosts and a buffer: a gig's old lines (`net.devices.R1.logBuffer: [{ sev, line }]`) plus a
  `%SYS-5-CONFIG_I` line for the player's own configuring, stamped the way the box is set now (sequence number, datetime from
  `show clock` with `*` while unsynchronised, or uptime), filtered by the buffer level. Tested (section 16).

- 2026-09-28 · Remote logins: `ctx.net().ssh(from, ip, user)` and `ctx.net().telnet(from, ip)` → `{ ok, dev, reason }`. SSH needs a
  domain and an RSA key (768+ bits for `ip ssh version 2`), `login local` with the user, `transport input` allowing ssh, the VTY
  `access-class` to permit the source, and TCP 22 through; Telnet needs transport to allow it (no transport line allows it), a
  password or local login, the access-class and TCP 23. PCs: `ssh -l USER IP`, `telnet IP`. A Layer 2 switch with an SVI now
  replies through `ip default-gateway` (it had no way back to other subnets). Tested (section 17).
  `crypto key generate rsa` names the keys after `ip domain name` as well as the older `ip domain-name`. Tested (section 17).

- 2026-09-28 · The IOS shell, part 1 (`js/sim.js`): `show running-config` is built from the config, not the transcript (the last
  hostname wins, `no X` removes X, every port of the box is listed, router ports show `shutdown` until `no shutdown`); `service
  password-encryption` shows type 7 and removing it decrypts nothing; `enable secret` shows type 5; `enable` asks `Password:` once a
  password or secret is set (the secret wins; typed passwords are never recorded); `write` / `copy run start` saves to
  `show startup-config` (a gig's preconfig counts as saved); `| include | exclude | begin | section`; `?` lists each mode's
  commands. Tested in `tests/engine.test.js` (section 9).

- 2026-09-28 · Traceroute prints the forward path only, one line per hop with the ingress address of each router, then the
  target (`Net.ping(...).trail`, `Net.traceLines`); PC `tracert` and IOS `traceroute` share it. Tested in `tests/engine.test.js`.
  `tools/play.js <night|a-b|all>` plays nights headless through the Game API (talks, calls, jack-in cost, golden run, pay, fixer, CODEX).

- 2026-09-28 · Every router and switch in a gig's `net` gets a device at jack-in, so `preconfig` applies to boxes with no
  console too; only `devices` show as consoles. A gig sharpens each quickhack one step at most. Spanning-tree marks on the
  map show only for gigs with a `topo` or `stpView: true`. Class thresholds C 180, B 420, A 820; pay and rep default per class.

- 2026-09-28 · UI overhaul, part 1. HUD in three bands with icons, five top-level menus, HUNGER and CHROME INTEGRITY
  meters, hover tips (`data-tip` on any element), phone tab bar (`css/hud.css`). **The fixer replaces SHOW ME:**
  `Game.fixer.can()/hire()` in a dive; the fee is the gig's pay; the run pays nothing, greenlights nothing, sharpens
  nothing, and does not sync. `Game.codexStatus(job)` is `greenlit` (cleared), `paid` (fixer) or `sealed`;
  `state.codex` holds paid entries and survives a reload. Rites refuse fixers; owned notes stop the offer.
  The CODEX has tabs (gigs, words, braindances, people), filters and search (`css/screens.css`).
  Rules tested in `tests/game.test.js` (stage 4 of `npm test`).

- 2026-09-28 · Sign-in live (client ID in `config/platform.js`, consent screen published, brand review pending). The door
  now treats the Google account as the key: `Game.claimHandle`, `Game.myHandles`, `Game.deckHandles`, `Game.linking`,
  `state.owner`. A Google record lives only in Drive (memory while playing, `flush()` to Drive, never localStorage);
  handle-only records stay in the browser. Signed-in players never type a passcode. The door explains the Drive box. `privacy.html` and
  `terms.html` at the site root, linked from the door and the no-script home page. Cache version `?v=15`.

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
