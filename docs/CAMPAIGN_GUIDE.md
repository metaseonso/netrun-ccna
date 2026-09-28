# CAMPAIGN GUIDE — writing into the engine

Everything the campaign author touches is data under `js/data/`. Nothing here needs a build step.
Register new files in `index.html` (one `<script>` line, keep the `?v=` suffix in step with the others).

## 1. Files

```
js/data/grid.js              ARCS, SKILLS, SRC helpers            (edit SKILLS when you add a skill)
js/data/stages/NN-name.js    one stage: STAGES.push({...})         (one file per stage)
js/data/jobs/_base.js        JOBS array, CLASSES, NETKIT helpers (gi, fa, hasVlan)
js/data/jobs/NN-name.js      one district's gigs: JOBS.push({...})  (one file per district, same NN as its stage file)
js/data/glossary.js          GLOSSARY: 'lowercase term': 'exam-grade definition'
js/data/npcs.js              NPCS cast; assets/npc/<id>.png overrides the procedural sprite
js/data/cards.js             hand-written cards; js/data/cards/dayNN.js from tools/import_apkg.py
js/data/protege-lines.js     protégé voice lines, timers, rep values
```

## 2. A level

```js
{ id: 'stp-states', title: 'Thirty seconds with a stopwatch', sub: 'Day 21 · port states and timers',
  npc: 'root', day: [21], src: [PS('Spanning_Tree_Protocol_Part2.md'), SJ('09 - Day 21 - STP Part 2.md')],
  unlocks: ['stp-states'],                 // skills slotted at level 0 when the level is read
  cards: [ { q: '...', opts: ['a','b','c','d'], a: 1, why: '...' } ],   // optional extra cards; get skill = unlocks[0]
  beats: [
    { k: 'SCENE', where: 'Clinic annex · switch closet · Wednesday, 08:05',
      lines: [ { who: 'narr', text: '...' }, { who: 'root', text: '...' }, { who: 'you', text: '...' }, { who: 'Imani', text: '...' } ],
      choice: { opts: [ { say: '...', reply: '...' }, { say: '...', reply: '...', who: 'veelan' } ] } },   // optional
    { k: 'TALK', text: '...' },            // single NPC paragraph (use sparingly; SCENE is the default)
    { k: 'LORE', title: 'FOUR DAYS ON PAPER', year: 2002, vibe: 'Totally offline. Doctors with clipboards.', text: 'Old Root: "..."' },  // a braindance: year is the hero, title the caption, vibe one line of era slang; becomes a crew call automatically
    { k: 'KIT', text: 'On the work order:', kit: [ { cmd: 'spanning-tree portfast default', what: 'global: every access port' } ] },
    { k: 'SYNC', q: { prompt: 'Imani texts you: "..."', opts: [...], a: 2, yes: '...', no: '...', why: '...' } }
  ] }
```
`who` is an NPC id, `you`, `narr`, or a capitalised plain name for a walk-on character. `[[term]]` glows and must exist in GLOSSARY.
Every level needs a KIT, a SYNC with `why`, and at least one skill in `unlocks` (lint warns otherwise).

## 3. A gig

```js
{ id: 'c-dhcp-lease-wars', cls: 'C', rep: 60, creds: 180, rite: false, from: 'denise', title: 'Lease Wars', day: [38, 49],   // creds default to 3 × rep; rite: true marks a class rite of passage
  requires: ['denise-intro', 'ace-intro'],          // level ids the player must have read
  team: { min: 2 },                                 // optional crew-size gate
  devices: ['R1', 'SW1', 'PC1'],                    // consoles shown (hosts get a PC prompt)
  brief: 'DISPATCH » ...\n\nCLIENT » "..."',
  net: {
    devices: {
      R1: { kind: 'router' }, SW1: { kind: 'switch', mac: '0001.9642.a3c0' },
      PC1: { kind: 'host', dhcp: true }, PC2: { kind: 'host', ip: '10.0.10.20', mask: '255.255.255.0', gw: '10.0.10.1' },
      ROGUE: { kind: 'rogue', role: 'dhcp', offer: { gw: '10.0.10.254', ip: '10.0.10.200', mask: '255.255.255.0' } },
      ISP: { kind: 'cloud', ip: '203.0.113.1', mask: '255.255.255.252', internet: true }
    },
    links: [ { a: 'R1', ap: 'gigabitethernet0/0', b: 'SW1', bp: 'gigabitethernet0/1' }, { a: 'SW1', ap: 'fastethernet0/1', b: 'PC1' },
             { a: 'SW1', ap: 'fastethernet0/2', b: 'PC2' }, { a: 'SW1', ap: 'fastethernet0/7', b: 'ROGUE' }, { a: 'R1', ap: 'gigabitethernet0/1', b: 'ISP' } ],
    preconfig: { R1: ['interface g0/0', 'ip address 10.0.10.1 255.255.255.0', 'no shutdown'] },   // silent starting config
    alert: ['ROGUE']                                  // nodes drawn red until removed
  },
  map: { w: 520, h: 340, nodes: [ { id: 'R1', label: 'R1', type: 'router', x: 260, y: 60 }, ... ], links: [ { a: 'R1', b: 'SW1', ap: 'gigabitethernet0/0', bp: 'gigabitethernet0/1' }, ... ] },  // optional; auto layout if omitted
  steps: [ ... ],
  solution: [ { dev: 'SW1', type: ['en', 'conf t', 'ip dhcp snooping', 'ip dhcp snooping vlan 1', 'int g0/1', 'ip dhcp snooping trust'] }, 'commit', { select: 'ROGUE' }, 'commit', ... ],
  outro: 'What changed for someone.' }
```
Device kinds: `router`, `switch`, `l3switch`, `host`, `server` (may carry `pools: [{network, mask, router, dns}]`), `cloud` (`internet: true` answers any public IP and drops private sources), `rogue` (`role: 'dhcp' | 'stp' | 'arpspoof'`), `ap`, `wlc`.
Host extras: `dhcp: true`, `mac`, `macs: [...]` or `flood: 50` (port-security), `arpspoof: true`.
Set `ctx.netDef.devices.X.removed = true` in a step's `onPass` to take a device off the network (facilities pulled it).

## 4. Step types

| type | fields | player does | passes when |
|---|---|---|---|
| `cmd` | `need` and/or `check(devs, ctx)`, `hint` | types in consoles | every `need` record exists and `check` returns true |
| `find` | `target` or `targets: [...]` | clicks a map node | selected node is a target |
| `choice` | `opts`, `a` | picks one | `a` chosen |
| `multi` | `opts`, `answers: [i, j]` | picks several | exactly that set |
| `calc` | `fields: [{key, label, check(v)}]`, `answer` | types values | every field check true |
| `order` | `items` (correct order), optional `accept(arr)` | arranges | order matches |
| `form` | `fields: [{key, label, options, answer}]`, optional `check(values)` | picks from selects | every answer matches |
| `text` | `check(value)`, `answer`, `placeholder` | types free text | check true (e.g. `v => { try { JSON.parse(v); return true } catch { return false } }`) |

Every step also has `skill`, `text` (the NPC speaking), `ok` (their reaction), `why` (plain explanation of the answer, in their voice). Optional `onPass(ctx)`.

`need` records: `{ dev: 'R1', mode: 'config' | 'config-if' | 'priv' | ..., ctx: 'interface gigabitethernet0/0' | /regex/, line: 'ip address 10.0.1.1 255.255.255.0' | /^(do )?show ip route/ }`.
Lines are normalized: lower-case, abbreviations expanded, interface names canonical (`gigabitethernet0/0`, `fastethernet0/1`), `wr` → `write memory`.

## 5. Checking outcomes — `ctx.net()`

```js
const n = ctx.net();
n.ping('PC1', '10.0.2.10').ok            // end-to-end, both directions, ACLs and NAT applied; .reason and .path explain failures
n.tcp('PC1', '10.0.1.5', 443).ok          // same with a TCP port (extended ACL tests)
n.route('R1', '10.0.2.0/24')              // { proto:'S'|'O'|'C'|..., via, iface, ad, metric } or null
n.routes('R1')                            // full table
n.up('R1', 'g0/0')  n.trunk('SW1', 'g0/1')  n.vlanOf('SW1', 'f0/5')  n.sameSegment('PC1', 'PC2')
n.ospfNeighbors('R2').length              // adjacencies
n.hsrpActive('10.0.1.254') === 'R1'
n.lease('PC1')                            // { ok, ip, gw, server, rogue, reason }
n.portsec('SW1', 'f0/9')  n.errdisabled('SW1', 'f0/9')
n.threats.arpspoof.blocked                // DAI
n.sshReady('R1').ok                       // domain + key + vty ssh + login local + a user
n.acl('R1', '10')  n.aclTest('R1', 'web', { src: '192.168.1.10', dst: '10.0.1.5', proto: 'tcp', dport: 80 }).action
n.nat('R1')  n.neighbors('SW1')  n.macTable('SW1')  n.bundles
n.issues                                  // [{kind, where}] duplex mismatch, native VLAN mismatch, OSPF area mismatch, static next-hop unreachable, port-security rejected, ...
ctx.compute(10)                           // spanning tree result for VLAN 10: .switches[name].isRoot / .rootPort / .ports[p].state
ctx.cfg('R1')                             // parsed config
```

## 6. What the console can show

`show ip interface brief · ip route · ip ospf neighbor · ip protocols · standby brief · access-lists · ip nat translations · ip nat statistics · ip dhcp binding · ip dhcp pool · ip dhcp snooping [binding] · ip arp inspection · vlan brief · interfaces trunk · interfaces status · interfaces [X] · ip interface X · mac address-table · etherchannel summary · port-security [address | interface X] · ipv6 interface brief · ipv6 route · ip ssh · cdp neighbors [detail] · lldp neighbors · ntp status · ntp associations · logging · snmp community · version · running-config · spanning-tree [vlan N]`.
Router/switch `ping`/`traceroute` and PC `ping`/`ipconfig [/all]`/`arp -a`/`tracert` run through the engine. Job-specific canned output goes in `shows: { R1: { 'show foo': 'text' } }`.

## 7. Cards and protégés

Import a day's Anki deck: `python tools/import_apkg.py <folder> --out js/data/cards`, then add the script tag. Set the day → skill map at the top of the importer. Text cards become multiple choice automatically at DM time (distractors from the same skill/day).
Protégé lines: `js/data/protege-lines.js` is organised by archetype (`arch.kid|ghost|hustler|scholar|soldier|heart`) with `common` fallbacks. Each archetype needs open[0..2], relief, escalate[1..2], forgiven, trust[1,2,4,7], milestones[3,6,10], flatline, orphan, gift lines. See `docs/CREW_ARCHETYPES.md`.

## 8. The feedback loop

- `npm test` — lint + golden runs + engine tests. A golden run that passes a step before any action prints a vacuous-check warning: fix the check.
- `?dev=1` — DEV button. STEP tab tells you exactly why a step would pass or fail right now. NET tab shows tables, hosts, issues, and a ping tester. GOLDEN plays a gig headless in the browser.
- Lint errors name the stage, level, beat, job and step. Warnings are coverage: days without a level, skills no gig exercises, terms never used.

## 9. The world's words (lint-enforced)

Player-facing text is checked for out-of-world words: flash card, Anki, exam, quiz, lesson, tutorial, study, revise,
framework, stub, CCNA, 200-301, Jeremy, XP, level up, step N. The full vocabulary table is in STORY_BIBLE Part II.
Commands, hints and `kit.cmd` are exempt (the old tongue is the old tongue). Level `sub` lines carry no day numbers.

## 10. Creds, the stall, rites

`creds` and `rep` on a gig default to its class (CLASSES in jobs/_base.js: D 60/10, C 100/15, B 150/20, A 220/25). `rite: true` marks a class rite of passage (board badge, result framing, big creds), and it **gates the class**: a player with the rep for the next class stays where they are until the rite gig of their current class is done. One rite per class (`rite: true` with that `cls`). The HUD names the rite; locked gigs say Dispatch wants to see it cleared first. Finish the rite and the promotion fires on the result screen.
Shop items live in `js/data/shop.js` with kinds `food | service | gift | favor | bd | skin`; a `bd` item needs `title`, `year`, `who`, `text`; a `food` item needs `effect.food` (and may carry `effect.danger` so it doubles as a crew gift).

### The body: food and chrome

Two meters, 0–100, in `state.body`. Only gigs drain them. At jack-in a gig costs `food` (default 15 + 5 × classRank) and `chrome` (default 10 + 5 × classRank); every failed attempt costs 1 chrome. Set `food` and `chrome` on a gig to override; rites should cost more than the gigs around them. Zero on either meter is a flatline: `Game.flatline(why)` sets `state.dead`, the FLATLINED screen shows, and the player goes back to the last sync. The board always shows the cost and warns in red when a dive would be lethal, so a death is a choice the player made. Food refills partially (`kind: 'food'`); the ripperdoc (`kind: 'service'`) refills chrome fully at one price. Marrow's tab: when the player cannot pay and food ≤ 30, one bowl per class rank is on the house, so nobody soft-locks. **No time-based drain, ever.**

### Syncs, the only save

`Game.sync(label)` snapshots the state after every first talk (`readLevel`) and every gig (`finishJob`). Telemetry, the journal, the passcode, the flatline count and the checkpoint itself ride outside the snapshot, so a reload never erases the record of what happened. There is no export or import and there must never be one. If a new beat type deserves a checkpoint, call `sync('...')` once with an in-world label.
Never add an item that skips learning. Gifts and favors are applied from the CREW screen; effects are in `engine/protege.js`.

## 11. Voice

Read `docs/STORY_BIBLE.md` before writing a line. Plain sentences. People, not lectures. The fact is the way out of the scene.
