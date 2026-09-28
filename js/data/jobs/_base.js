/* jobs/_base.js — the gig list every stage file pushes onto, the classes, and helpers shared by gig files.
   One gig file per district: js/data/jobs/NN-name.js, each `JOBS.push(...)`. Register new files in index.html. */
(function(){
  window.JOBS = window.JOBS || [];
  window.CLASSES = [ { id: 'D', min: 0, name: 'Class D · Street' }, { id: 'C', min: 90, name: 'Class C · Runner' }, { id: 'B', min: 250, name: 'Class B · Operator' }, { id: 'A', min: 400, name: 'Class A · Architect' } ];
  const G = 'gigabitethernet', F = 'fastethernet';
  window.NETKIT = { G, F, gi: n => G + '0/' + n, fa: n => F + '0/' + n,
    // true when the device's transcript created VLAN n in config mode
    hasVlan: (d, n) => d.lines.some(r => { let m; if (r.mode !== 'config' || !(m = r.line.match(/^vlan ([\d,\-]+)$/))) return false; return m[1].split(',').some(x => { const [a, b] = x.split('-').map(Number); return b ? n >= a && n <= b : a === n; }); }) };
})();
