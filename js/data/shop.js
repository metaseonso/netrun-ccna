/* shop.js — Marrow's stall. Creds buy things that feed the loops, never things that skip them.
   kinds: food (eat it: +food; some can also be given to a protégé) · service (the ripperdoc: chrome back to full, one price)
          gift (given to a protégé from CREW) · favor (Dispatch pulls a runner out; hold one at a time) · bd (a braindance for the CODEX) · skin (deck theme).
   Prices scale with class: price × (1 + 0.25 × classRank). Every gig costs food and chrome at jack-in (Game.body.cost). */
window.SHOP = [
  { id: 'protein', kind: 'food', name: 'Synth-protein bar', price: 12, blurb: 'Tastes like the wrapper. Keeps you upright for one more dive.', effect: { food: 15 },
    line: 'Marrow: "Nobody buys these because they want to."' },
  { id: 'noodles', kind: 'food', name: 'Noodle bowl', price: 30, blurb: 'From the place on Kabuki with the broken sign. Eat it, or hand it to a runner who needs calming down one notch.', effect: { food: 40, danger: -1 },
    line: 'Marrow: "Hot. Salty. Fixes about a third of what is wrong with anyone."' },
  { id: 'ciders', kind: 'food', name: 'Hot plate at Cider\'s', price: 70, blurb: 'Cider feeds you until you stop shaking. Full, however empty you came in.', effect: { food: 100 },
    line: 'Marrow: "Tell her I sent you. She will charge you the same, but she will smile."' },
  { id: 'tuneup', kind: 'service', name: 'Ripperdoc tune-up', price: 120, blurb: 'Two doors down, no sign. Full service on the chrome, no questions. One price, every time, whatever state you bring it in.', effect: { chrome: 100 },
    line: 'Marrow: "He does not do partials. Says half-fixed chrome is how he gets repeat customers, and he hates repeat customers."' },
  { id: 'antenna', kind: 'gift', name: 'Better antenna', price: 140, blurb: 'A protégé\'s calls reach you sooner. Fifteen more seconds on every call from them, for good.', effect: { timerBonus: 15 },
    line: 'Marrow: "Salvaged off a corpo drone. The drone did not need it any more."' },
  { id: 'burner', kind: 'gift', name: 'Burner deck', price: 320, blurb: 'One bad call forgiven. When it goes wrong, the burner takes the hit instead of them. Single use.', effect: { insurance: 1 },
    line: 'Marrow: "You are not buying a deck. You are buying a night you do not have to remember."' },
  { id: 'favor', kind: 'favor', name: 'A favor from Dispatch', price: 450, max: 1, blurb: 'When one of yours is in real trouble, Dispatch pulls them off the job with a lie. Danger gone. The gig is lost. Dispatch remembers. You can hold one.',
    line: 'Marrow: "I do not sell these. Dispatch does, through me, so nobody sees Dispatch selling anything. Use it on someone worth it. They all are."' },
  { id: 'bd-lo', kind: 'bd', name: 'BD · LO', price: 60, year: 1969, title: 'LO', who: 'nexthop', blurb: 'A recording of the first message ever sent between two machines on the old net.',
    text: 'Nexthop, handing you the chip: "29 October 1969. A student at UCLA types L, then O, to a machine at Stanford through a router the size of a fridge. The link dies on the G. First word on the internet: LO. As in, lo and behold. Or as in, that is as far as we got. Both, I think."' },
  { id: 'bd-cuckoo', kind: 'bd', name: 'BD · SEVENTY-FIVE CENTS', price: 60, year: 1986, title: 'SEVENTY-FIVE CENTS', who: 'dispatch', blurb: 'The first documented hunt for an intruder on the net, and it started with an accounting error.',
    text: 'Dispatch: "1986. An astronomer named Clifford Stoll is asked to find a seventy-five cent discrepancy in a lab\'s computer billing. He finds a stranger in the system. He spends a year tracing them, with printers and pagers and a sleeping bag under his desk, back through the phone network to Germany. Every fixer on this street owes that man a drink."' },
  { id: 'bd-mitnick', kind: 'bd', name: 'BD · THE VOICE ON THE LINE', price: 60, year: 1995, title: 'THE VOICE ON THE LINE', who: 'ace', blurb: 'The runner who barely typed. He talked.',
    text: 'Ace Elle: "Kevin Mitnick. Arrested 15 February 1995. People remember him as a hacker. Most of what he did was pick up a phone, sound like he belonged, and ask. Every list I keep is for packets. Nobody has written a list for the human at the desk. That is still your job."' },
  { id: 'skin-ember', kind: 'skin', name: 'Deck skin · Ember', price: 200, blurb: 'Warm oranges. For runners who like the room a little on fire.', effect: { theme: 'ember' } },
  { id: 'skin-ghost', kind: 'skin', name: 'Deck skin · Ghost', price: 200, blurb: 'White and grey. Corpo clean. Ironic, on this street.', effect: { theme: 'ghost' } },
  { id: 'skin-noir', kind: 'skin', name: 'Deck skin · Noir', price: 200, blurb: 'Green on black, like the oldest shells. Old Root approves.', effect: { theme: 'noir' } }
];
