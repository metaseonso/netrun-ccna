/* shop.js — Marrow's stall. Creds buy things that feed the loops, never things that skip them.
   kinds: food (eat it: +food; some can also be given to a protégé) · service (chrome back: the ripperdoc's tune-up to full, or Marrow's patch for 35)
          gift (given to a protégé from CREW) · favor (Dispatch pulls a runner out; hold one at a time) · bd (a braindance for the CODEX) · skin (deck theme).
   Prices scale with class: price × (1 + 0.5 × classRank), so D 1×, C 1.5×, B 2×, A 2.5×. Every gig costs food and chrome at jack-in (Game.body.cost). */
window.SHOP = [
  { id: 'protein', kind: 'food', name: 'Synth-protein bar', price: 12, blurb: 'A cheap protein bar. Enough to get you through one more dive.', effect: { food: 15 },
    line: 'Marrow: "Nobody buys these because they like them."' },
  { id: 'noodles', kind: 'food', name: 'Noodle bowl', price: 30, blurb: 'Broth from the place on Kabuki with the broken sign. Eat it, or give it to a runner who is under pressure.', effect: { food: 40, danger: -1 },
    line: 'Marrow: "Careful, it\'s hot."' },
  { id: 'ciders', kind: 'food', name: 'Hot plate at Cider\'s', price: 70, blurb: 'A full meal at Cider\'s bar. You leave full, however empty you came in.', effect: { food: 100 },
    line: 'Marrow: "Tell Cider I sent you and she\'ll give you the big plate."' },
  { id: 'tuneup', kind: 'service', name: 'Ripperdoc tune-up', price: 120, blurb: 'The ripperdoc two doors down repairs your chrome to full. Same price every time.', effect: { chrome: 100 },
    line: 'Marrow: "He only does full repairs, so don\'t ask him for half."' },
  { id: 'patch', kind: 'service', name: 'Marrow\'s patch', price: 50, blurb: 'Sealant and tape from under Marrow\'s counter. Puts back 35 chrome. It costs less than the ripperdoc, and more for each point.', effect: { chrome: 35 },
    line: 'Marrow: "It\'s sealant and tape, and it will hold until you can pay the doc."' },
  { id: 'antenna', kind: 'gift', name: 'Better antenna', price: 140, blurb: 'Gives one runner 15 more seconds on every call to you, for good.', effect: { timerBonus: 15 },
    line: 'Marrow: "I pulled it off a corpo drone that won\'t be needing it."' },
  { id: 'burner', kind: 'gift', name: 'Burner deck', price: 320, blurb: 'The next bad call on one runner hits the burner instead of them. Used up after one call.', effect: { insurance: 1 },
    line: 'Marrow: "I hope you never need it."' },
  { id: 'favor', kind: 'favor', name: 'A favor from Dispatch', price: 450, max: 1, blurb: 'Dispatch pulls one runner out of real trouble. The gig is lost, and Dispatch remembers. You can hold one.',
    line: 'Marrow: "Dispatch sells these through me so nobody sees Dispatch selling anything. Spend it on someone who needs it."' },
  { id: 'bd-lo', kind: 'bd', name: 'BD · LO', price: 60, year: 1969, title: 'LO', who: 'nexthop', blurb: 'A recording of the first message ever sent between two machines on the old net.',
    text: 'Nexthop, handing you the chip: "29 October 1969. A student at UCLA types L, then O, to a machine at Stanford through a router the size of a fridge. The link dies on the G. First word on the internet: LO. As in, lo and behold. Or as in, that is as far as we got. Both, I think."' },
  { id: 'bd-cuckoo', kind: 'bd', name: 'BD · SEVENTY-FIVE CENTS', price: 60, year: 1986, title: 'SEVENTY-FIVE CENTS', who: 'dispatch', blurb: 'The first recorded hunt for an intruder on the net, which started with a 75-cent accounting error.',
    text: 'Dispatch: "1986. An astronomer named Clifford Stoll is asked to find a seventy-five cent discrepancy in a lab\'s computer billing. He finds a stranger in the system. He spends a year tracing them, with printers and pagers and a sleeping bag under his desk, back through the phone network to Germany. Every fixer on this street owes that man a drink."' },
  { id: 'bd-mitnick', kind: 'bd', name: 'BD · THE VOICE ON THE LINE', price: 60, year: 1995, title: 'THE VOICE ON THE LINE', who: 'ace', blurb: 'A runner who got into systems by talking to people, not by typing.',
    text: 'Ace Elle: "Kevin Mitnick. Arrested 15 February 1995. People remember him as a hacker. Most of what he did was pick up a phone, sound like he belonged, and ask. Every list I keep is for packets. Nobody has written a list for the human at the desk. That is still your job."' },
  { id: 'skin-ember', kind: 'skin', name: 'Deck skin · Ember', price: 200, blurb: 'Warm orange for your deck and screens.', effect: { theme: 'ember' } },
  { id: 'skin-ghost', kind: 'skin', name: 'Deck skin · Ghost', price: 200, blurb: 'White and grey for your deck and screens.', effect: { theme: 'ghost' } },
  { id: 'skin-noir', kind: 'skin', name: 'Deck skin · Noir', price: 200, blurb: 'Green on black, like the oldest shells.', effect: { theme: 'noir' } }
];
