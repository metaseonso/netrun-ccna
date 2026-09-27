# NETRUN://CCNA

A story-driven browser game for studying the **CCNA 200-301**. Static files, no build, GitHub Pages.

**Play:** https://metaseonso.github.io/netrun-ccna/ · **Dev mode:** add `?dev=1`

> **Status: Alpha framework.** The engine is complete and tested. Content built so far: Stage 4 (Spanning Tree,
> Jeremy's IT Lab days 20–21) plus one intro level per other stage. The full 63-day campaign is being written
> into this framework. Start at `docs/HANDOFF.md`.

## What it is

- **The Grid.** Each part of the network is a person in Watson district. Old Root keeps the switches at the clinic
  and has watched a loop take a building down. You learn by being in the room with them. Glowing terms are the exam
  vocabulary. Nothing levels by reading.
- **Jobs.** Dispatch sends a gig. You jack in to a live map and a real console, fix the fault the way it is really
  fixed, and verify it. The console is backed by a network engine: VLANs, trunks, spanning tree, routing (static,
  OSPF, RIP, EIGRP), HSRP, DHCP with snooping, port security, DAI, NAT, ACLs, end-to-end ping with a hop list.
  Steps check **outcomes**, not keystrokes. Skills level only when used without a hint. Rep sets your class D → A.
- **Crew.** Protégés who look up to you DM you from their own gigs. Every DM is a flash card on a timer. Right and
  in time, they get through. Wrong or late, it escalates: rep loss, then a flatline, and their orphan joins your crew.
  Spaced repetition decides which card comes when. Bigger gigs need a crew.
- **Stats.** Every attempt is timed. Misses, hints, walk-throughs, DM response times, weak skills, rep over time,
  a final report when the campaign is done.
- **Key.** Every answer in the game, explained slowly, in the character's voice. Also available mid-step as
  WALK ME THROUGH IT (costs the level-up for that step, nothing else).

## Run it

```bash
python -m http.server 8765      # http://localhost:8765/
npm test                        # lint + play every gig's golden solution + engine tests
npm run check                   # same, listing warnings
```

## Write into it

- `docs/HANDOFF.md` — what exists, what to build, the rules.
- `docs/CAMPAIGN_GUIDE.md` — schema for levels, gigs, steps, topologies; the engine API for checks; the feedback loop.
- `docs/STORY_BIBLE.md` — the world, the cast, the voice, and Part II: the immersion canon (vocabulary, legacy framing, the dive, braindances, rites, the stall).
- `docs/CREW_ARCHETYPES.md` — the six crew archetypes, bond, favors, rites.
- `docs/TASKS.md` — all 63 days mapped to stages, NPCs, skills and lab-based gigs.
- `docs/templates/` — a complete stage file and a complete gig that pass `npm test`.
- `tools/import_apkg.py` — turns Anki decks into game cards.
- `docs/AUTH_PLAN.md` — Sign in with Google; records live in the player's own Drive. Code complete, on when the owner pastes a client ID.

## Credits

Material follows Jeremy's IT Lab's CCNA course. Built alongside two note repositories, credited on the opening screen:
[psaumur/CCNA_Course_Notes](https://github.com/psaumur/CCNA_Course_Notes) and
[sparrowjumpy/CCNA-Notes](https://github.com/sparrowjumpy/CCNA-Notes) (MIT). No text is copied from either.
Lore draws on real network and security history.

## License

MIT.
