# NETRUNNER://CCNA

A story-driven browser game for studying the **CCNA 200-301**. Static files, no build, GitHub Pages.

**Play:** https://metaseonso.github.io/netrun-ccna/ · **Dev mode:** add `?dev=1`

> **Alpha 1.0 (2026-09-28, build ?v=78).** The campaign is complete. 63 nights across nine districts, 68 gigs, three rites of passage and the
> finale, The Watson Exchange. Every gig is played by `npm test`. Start at `docs/HANDOFF.md`.

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
- **Survive.** Every gig costs food and chrome at jack-in; pay comes when it is done. Marrow sells food and a chrome patch, keeps a
  tab for broke runners, and knows a ripperdoc. Zero on either meter is a flatline: FLATLINED, game over, back to the last sync. The deck syncs after
  every talk and every gig; there is no manual save. A handle is a name and a passcode, remembered until you log out.
- **Stats.** Every attempt is timed. Misses, hints, DM response times, weak skills, rep over time,
  a final report when the campaign is done.
- **CODEX.** Every gig's notes, every word and every braindance you have heard. A gig's notes open when you clear it
  yourself, or when you pay a fixer to take a floor (the fixer keeps the pay; rites refuse fixers).

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
- `docs/TASKS.md` — all 63 nights mapped to stages, NPCs, skills and lab-based gigs, and what is left.
- New content: copy a night's block from `js/data/stages/` and `js/data/jobs/`; the format is in `docs/CAMPAIGN_GUIDE.md`.
- `tools/import_apkg.py` — turns Anki decks into game cards.
- `docs/AUTH_PLAN.md` — Sign in with Google once per device; records live in the Watson DB. Live.
- `docs/WATSON_DB.md` — the suggestion box, licenses, the anonymous pulse and the owner's dashboard (`owner.html`).

## Credits

Material follows Jeremy's IT Lab's CCNA course. Built alongside two note repositories, credited on the opening screen:
[psaumur/CCNA_Course_Notes](https://github.com/psaumur/CCNA_Course_Notes) and
[sparrowjumpy/CCNA-Notes](https://github.com/sparrowjumpy/CCNA-Notes) (MIT). No text is copied from either.
Lore draws on real network and security history.

## License

MIT.
