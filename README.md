# NETRUN://CCNA

A lightweight browser game for studying the **CCNA 200-301**, styled as a netrunner's HUD.
No build step. No backend. Static files, GitHub Pages.

**Play:** https://metaseonso.github.io/netrun-ccna/

> Demo scope for the first showing: **Stage 4 · The Bridges** — Spanning Tree Protocol,
> Jeremy's IT Lab **Days 20–21** — fully built on both layers. Every other stage is a framework
> stub (one intro level each) so the rest of the material can be slotted in the same way.

## Credits

The material follows Jeremy's IT Lab's free CCNA course. The game's stage/day structure and the
"source" links on every level point at two note repositories this project is built on:

- **psaumur / CCNA_Course_Notes** — https://github.com/psaumur/CCNA_Course_Notes (63 days of notes)
- **sparrowjumpy / CCNA-Notes** — https://github.com/sparrowjumpy/CCNA-Notes (MIT; days 8–38)

No text from either repo is copied into the game. The game is original writing that links back to
them as the reading companion. Lore beats reference real network and security history
(Perlman's spanning tree and "Algorhyme", the 2002 Beth Israel Deaconess STP meltdown, the Morris
worm, Mockapetris and DNS, Ylönen and SSH, Mirai/Dyn, IPv4 exhaustion, and so on).

## The two layers

**Layer 1 · THE GRID (macro, concepts).**
Each system is an NPC whose name gives it away: *Old Root* is spanning tree, *Cider* is CIDR,
*Ace Elle* is the ACL, *Prof. Hypervisor* runs the lab. They talk in short beats. Official terms
glow like unique-NPC names in an RPG; hover for the exam-grade definition. Each level ends with the
**deck** (the commands and numbers you now carry) and a no-stakes **sync check** written at exam
difficulty. Reading a level *slots* a skill at level 0. **Nothing levels by reading.**

**Layer 2 · JOBS (micro, practice).**
Dispatch sends a HUD message. You jack in to a live network map and a simulated IOS console
(abbreviations work: `conf t`, `int g0/1`, `sh span`, `do sh run`). You find the fault, fix it the
way it is actually fixed, and verify it. A skill levels **only when you use it without a hint**
(1 clean use → SYNCED, 3 → WIRED, 6 → BURNED-IN). Rep sets your class: **D → C → B → A**.
Higher-class gigs deliberately fold in lower-class steps as one scenario, so review rides along
with the new concept. Repeating a gig pays 40% rep but counts fully for skill consolidation.

The spanning tree gigs run on a small real election engine (`js/stp.js`): root bridge, root cost,
port roles and states, PortFast/BPDU Guard, rogue switches, per-VLAN trees. `show spanning-tree`
in the console reflects whatever you configured, so both `root primary` and `priority 4096` pass
the "make SW1 root" step — the game checks outcomes, not keystrokes.

## Adding content (framework guide)

Everything is data in `js/data/`:

| File | What | Add by |
|---|---|---|
| `npcs.js` | cast: name, system, role, voice, procedural sprite `look` | one object per NPC; drop `assets/npc/<id>.png` to override the sprite |
| `glossary.js` | glowing terms | `'term': 'exam-grade definition'` — write `[[term]]` in any dialogue |
| `grid.js` | Layer 1 arcs → stages → levels → beats (`TALK`/`LORE`/`KIT`/`SYNC`) | a level object with `unlocks: ['skill-id']` and `src` links; set the stage `status: 'live'` when complete |
| `jobs.js` | Layer 2 gigs: brief, map, devices, steps | a job with `cls`, `rep`, `requires: [level ids]`, and steps of type `cmd` / `find` / `choice` / `calc` |

A `cmd` step validates by `need` (normalized command records: `{dev, mode?, ctx?, line}`) and/or
`check(devices, ctx)` (state, e.g. `ctx.compute(1).switches.SW1.isRoot`). For non-STP topics the
console already speaks routers, ACLs, DHCP pools, OSPF, lines and NAT prompts; canned `show`
output goes in the job's `shows` map (strings or functions of device state).

Skill IDs live in `SKILLS` at the bottom of `grid.js`. Class thresholds in `CLASSES` at the bottom
of `jobs.js`.

## Art

NPCs are drawn procedurally in-browser (`js/sprite.js`) so the game needs no image assets.
`tools/gen_npcs.py` can generate real portraits into `assets/npc/` through either OpenRouter
(illustrated) or PixelLab (pixel art); the game prefers a PNG when one exists.

## Run locally

```bash
python -m http.server 8765
```

then open http://localhost:8765/.

## License

MIT. See `LICENSE`.
