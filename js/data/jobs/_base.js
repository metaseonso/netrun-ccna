/* jobs/_base.js — the gig list every stage file pushes onto, the classes, and helpers shared by gig files.
   One gig file per district: js/data/jobs/NN-name.js, each `JOBS.push(...)`. Register new files in index.html. */
(function(){
  window.JOBS = window.JOBS || [];
  // rep to reach each class, and what a first clear pays at that class (docs/CAMPAIGN_MAP.md, section 7). A gig may set its own rep and creds.
  window.CLASSES = [ { id: 'D', min: 0, name: 'Class D · Street', rep: 10, pay: 60 }, { id: 'C', min: 180, name: 'Class C · Runner', rep: 15, pay: 100 },
    { id: 'B', min: 420, name: 'Class B · Operator', rep: 20, pay: 150 }, { id: 'A', min: 820, name: 'Class A · Architect', rep: 25, pay: 220 } ];
  // how hard the street is. `pay` replaces the class pay by class (D C B A) for every gig that does not set its own creds
  // (the rites do, and pay the same on every setting); `wear` is the chrome a wrong commit burns. Tuned by simulating all
  // 68 gigs in order (docs/HANDOFF.md, Rules): a runner who misses 8 times a gig ends Normal with about 1,340 creds, and
  // runs out at the Class B rite on Cyberpsycho, which is for runners who rarely miss.
  window.DIFFICULTY = {
    easy:        { name: 'ROOKIE',        pay: [60, 100, 150, 220], wear: 1 },
    normal:      { name: 'EDGERUNNER',      pay: [60, 95, 135, 190],  wear: 1 },
    cyberpsycho: { name: 'CYBERPSYCHO', pay: [60, 90, 130, 180],  wear: 2 }
  };
  window.DIFFICULTY_ORDER = ['easy', 'normal', 'cyberpsycho'];
  const G = 'gigabitethernet', F = 'fastethernet';
  window.NETKIT = { G, F, gi: n => G + '0/' + n, fa: n => F + '0/' + n,
    // true when the device's transcript created VLAN n in config mode
    hasVlan: (d, n) => d.lines.some(r => { let m; if (r.mode !== 'config' || !(m = r.line.match(/^vlan ([\d,\-]+)$/))) return false; return m[1].split(',').some(x => { const [a, b] = x.split('-').map(Number); return b ? n >= a && n <= b : a === n; }); }) };
})();
