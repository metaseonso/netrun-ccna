/* stp.js — a small, honest Spanning Tree election engine for the practicum.
   Given a topology + the commands each switch has been given in the sim, it computes
   root bridge, root cost, port roles/states and renders a believable `show spanning-tree`.
   Rules follow Day 20/21: lowest Bridge ID wins; root cost by port cost; tiebreaks by
   neighbour BID then neighbour port ID; PortFast/BPDU Guard/rogue handling included. */
(function(){
  const COST = { gi: 4, fa: 19, te: 2, e: 100 };
  const PORTNUM = { fa: 0, gi: 24, te: 48, e: 0 };

  function portKind(p){ return p.startsWith('gigabitethernet') ? 'gi' : p.startsWith('tengigabitethernet') ? 'te' : p.startsWith('fastethernet') ? 'fa' : 'e'; }
  function portNumber(p){ const m = p.match(/(\d+)\/(\d+)$/); const k = portKind(p); return (PORTNUM[k] || 0) + (m ? +m[2] : 0); }
  function shortName(p){ return p.replace('gigabitethernet', 'Gi').replace('tengigabitethernet', 'Te').replace('fastethernet', 'Fa').replace('ethernet', 'Et'); }

  // read a device's sim transcript for STP-relevant config
  function readConfig(dev, vlan, defaultMode){
    const cfg = { priority: null, rootPrimary: false, rootSecondary: false, mode: defaultMode || 'rapid-pvst', portfastDefault: false, bpduguardDefault: false, ports: {} };
    if (!dev) return cfg;
    const P = n => cfg.ports[n] || (cfg.ports[n] = { cost: null, prio: null, portfast: false, bpduguard: false, shutdown: false, mode: null });
    for (const r of dev.lines) {
      let m;
      if (r.mode === 'config') {
        if ((m = r.line.match(/^spanning-tree mode (pvst|rapid-pvst|mst)$/))) cfg.mode = m[1];
        if ((m = r.line.match(/^spanning-tree vlan ([\d,\-]+) priority (\d+)$/)) && vlanIn(m[1], vlan)) { cfg.priority = +m[2]; cfg.rootPrimary = cfg.rootSecondary = false; }
        if ((m = r.line.match(/^spanning-tree vlan ([\d,\-]+) root primary/)) && vlanIn(m[1], vlan)) { cfg.rootPrimary = true; cfg.rootSecondary = false; cfg.priority = null; }
        if ((m = r.line.match(/^spanning-tree vlan ([\d,\-]+) root secondary/)) && vlanIn(m[1], vlan)) { cfg.rootSecondary = true; cfg.rootPrimary = false; cfg.priority = null; }
        if (r.line === 'spanning-tree portfast default') cfg.portfastDefault = true;
        if (r.line === 'no spanning-tree portfast default') cfg.portfastDefault = false;
        if (r.line === 'spanning-tree portfast bpduguard default') cfg.bpduguardDefault = true;
        if (r.line === 'no spanning-tree portfast bpduguard default') cfg.bpduguardDefault = false;
      }
      if (r.mode === 'config-if' || r.mode === 'config-if-range') {
        const names = r.mode === 'config-if' ? [r.ctx.replace('interface ', '')] : expandRange(r.ctx.replace('interface range ', ''));
        for (const n of names) { const p = P(n);
          if ((m = r.line.match(/^spanning-tree (?:vlan ([\d,\-]+) )?cost (\d+)$/)) && (!m[1] || vlanIn(m[1], vlan))) p.cost = +m[2];
          if ((m = r.line.match(/^spanning-tree (?:vlan ([\d,\-]+) )?port-priority (\d+)$/)) && (!m[1] || vlanIn(m[1], vlan))) p.prio = +m[2];
          if (/^spanning-tree portfast( edge)?( trunk)?$/.test(r.line)) p.portfast = true;
          if (/^no spanning-tree portfast/.test(r.line)) p.portfast = false;
          if (r.line === 'spanning-tree bpduguard enable') p.bpduguard = true;
          if (r.line === 'spanning-tree bpduguard disable' || r.line === 'no spanning-tree bpduguard enable') p.bpduguard = false;
          if (r.line === 'shutdown') p.shutdown = true; if (r.line === 'no shutdown') p.shutdown = false;
          if ((m = r.line.match(/^switchport mode (access|trunk)$/))) p.mode = m[1];
        }
      }
    }
    return cfg;
  }
  function vlanIn(spec, vlan){ return spec.split(',').some(s => { const [a, b] = s.split('-').map(Number); return b ? (vlan >= a && vlan <= b) : a === vlan; }); }
  function expandRange(spec){ // "fastethernet0/1 - 12" or "fastethernet0/1-12" or "fastethernet0/1 , fastethernet0/5"
    const out = []; spec.split(',').forEach(part => { part = part.trim(); const m = part.match(/^([a-z-]+\d+\/)(\d+)\s*-\s*(\d+)$/); if (m) { for (let i = +m[2]; i <= +m[3]; i++) out.push(m[1] + i); } else if (part) out.push(part.replace(/\s+/g, '')); }); return out; }

  // main election
  function compute(topo, vlan, devices){
    const sw = {}; // name -> {mac, prio, bid, cfg, ports:{name:{to,peer,cost,...}}}
    const names = Object.keys(topo.switches).filter(n => !topo.switches[n].removed);
    // 1. gather config, priorities
    for (const n of names) { const t = topo.switches[n]; const cfg = t.fixed ? Object.assign({ ports: {} }, t.fixed) : readConfig(devices[n], vlan, topo.defaultMode);
      sw[n] = { name: n, mac: t.mac, cfg, ports: {}, rootCost: Infinity, rootPort: null, isRoot: false, alive: true };
      for (const pn in t.ports) { const p = t.ports[pn]; const pc = cfg.ports[pn] || {}; const kind = portKind(pn);
        sw[n].ports[pn] = { name: pn, to: p.to, peer: p.peer, host: p.host || null, kind, cost: pc.cost != null ? pc.cost : COST[kind], prio: pc.prio != null ? pc.prio : 128, num: portNumber(pn),
          portfast: false, bpduguard: false, shutdown: !!pc.shutdown, errdisabled: false, role: '-', state: 'FWD' };
        const edge = !!(p.host || p.access || pc.mode === 'access');
        const pf = !!(pc.portfast || (cfg.portfastDefault && edge));
        sw[n].ports[pn].portfast = pf; sw[n].ports[pn].bpduguard = !!(pc.bpduguard || (cfg.bpduguardDefault && pf)); } }
    // 2. BPDU guard vs rogue switches: a rogue attached to a guarded port gets that port err-disabled and is cut off
    for (const n of names) for (const pn in sw[n].ports) { const p = sw[n].ports[pn]; if (p.to && topo.switches[p.to] && topo.switches[p.to].rogue && (p.bpduguard) ) { p.errdisabled = true; } }
    // 3. priorities: root primary/secondary resolve against others' explicit priorities
    const explicit = names.filter(n => sw[n].cfg.priority != null && !sw[n].cfg.rootPrimary).map(n => sw[n].cfg.priority);
    for (const n of names) { const c = sw[n].cfg; let prio;
      if (c.rootPrimary) { const lowest = Math.min(...explicit, ...names.filter(x => x !== n && sw[x].cfg.rootPrimary).map(() => 24576), 32768); prio = lowest < 24576 ? Math.max(0, lowest - 4096) : 24576; }
      else if (c.rootSecondary) prio = 28672; else if (c.priority != null) prio = c.priority; else prio = 32768;
      sw[n].prio = prio + vlan; sw[n].bid = [sw[n].prio, sw[n].mac.replace(/[.:]/g, '')]; }
    // 4. connectivity (only through non-errdisabled, non-shutdown links) — a rogue cut off is alone
    const adj = {}; for (const n of names) adj[n] = [];
    for (const n of names) for (const pn in sw[n].ports) { const p = sw[n].ports[pn]; if (!p.to || !sw[p.to]) continue; const q = sw[p.to].ports[p.peer]; if (!q) continue; if (p.errdisabled || q.errdisabled || p.shutdown || q.shutdown) continue; adj[n].push({ via: pn, to: p.to, peerPort: p.peer, cost: p.cost }); }
    const bidLess = (a, b) => a[0] !== b[0] ? a[0] < b[0] : a[1] < b[1];
    // 5. per connected component, elect a root and compute costs
    const seen = new Set(); const roots = [];
    for (const start of names) { if (seen.has(start)) continue; const comp = []; const st = [start]; seen.add(start);
      while (st.length) { const x = st.pop(); comp.push(x); for (const e of adj[x]) if (!seen.has(e.to)) { seen.add(e.to); st.push(e.to); } }
      let root = comp[0]; for (const c of comp) if (bidLess(sw[c].bid, sw[root].bid)) root = c; roots.push(root); sw[root].isRoot = true; sw[root].rootCost = 0;
      // Dijkstra-ish with STP tiebreaks: cost, then neighbour BID, then neighbour port id
      const done = new Set([root]); const best = { [root]: { cost: 0, bid: sw[root].bid, nport: 0, via: null } };
      for (;;) { let pick = null;
        for (const x of comp) { if (done.has(x)) continue; let cand = null;
          for (const e of adj[x]) { if (!done.has(e.to)) continue; const c = best[e.to].cost + e.cost; const nb = sw[e.to].bid; const np = (sw[e.to].ports[e.peerPort].prio << 8) + sw[e.to].ports[e.peerPort].num;
            if (!cand || c < cand.cost || (c === cand.cost && (bidLess(nb, cand.bid) || (!bidLess(cand.bid, nb) && np < cand.nport)))) cand = { cost: c, bid: nb, nport: np, via: e.via, x }; }
          if (cand && (!pick || cand.cost < pick.cost)) pick = cand; }
        if (!pick) break; best[pick.x] = pick; done.add(pick.x); sw[pick.x].rootCost = pick.cost; sw[pick.x].rootPort = pick.via; }
    }
    // 6. roles per segment
    for (const n of names) for (const pn in sw[n].ports) { const p = sw[n].ports[pn];
      if (p.errdisabled) { p.role = 'Desg'; p.state = 'ERR'; continue; } if (p.shutdown) { p.role = '-'; p.state = 'DIS'; continue; }
      if (!p.to || !sw[p.to]) { p.role = 'Desg'; p.state = 'FWD'; continue; } // host port
      const other = sw[p.to]; const q = other.ports[p.peer];
      if (sw[n].rootPort === pn) { p.role = 'Root'; p.state = 'FWD'; continue; }
      if (other.rootPort === p.peer) { p.role = 'Desg'; p.state = 'FWD'; continue; }
      // neither end is a root port: designated = lower root cost, tie lower BID
      const mine = sw[n].rootCost, theirs = other.rootCost;
      const iWin = mine < theirs || (mine === theirs && bidLess(sw[n].bid, other.bid));
      if (iWin) { p.role = 'Desg'; p.state = 'FWD'; } else { p.role = 'Altn'; p.state = 'BLK'; } }
    return { vlan, switches: sw, roots };
  }

  function render(topo, vlan, devName, devices){
    const r = compute(topo, vlan, devices); const me = r.switches[devName]; if (!me) return '% no spanning tree instance';
    // find my root
    let root = null; for (const n in r.switches) if (r.switches[n].isRoot) { // root of my component: the one reachable; approximate by rootCost finite
      if (n === devName || me.rootCost < Infinity) { root = r.switches[n]; if (n === devName) break; } }
    if (me.isRoot) root = me;
    const mode = me.cfg.mode === 'pvst' ? 'ieee' : me.cfg.mode === 'mst' ? 'mstp' : 'rstp';
    const rp = me.rootPort ? me.ports[me.rootPort] : null;
    const lines = [];
    lines.push('VLAN' + String(vlan).padStart(4, '0'));
    lines.push('  Spanning tree enabled protocol ' + mode);
    lines.push('  Root ID    Priority    ' + (root ? root.prio : me.prio));
    lines.push('             Address     ' + (root ? root.mac : me.mac));
    if (me.isRoot) lines.push('             This bridge is the root');
    else { lines.push('             Cost        ' + me.rootCost); lines.push('             Port        ' + (rp ? rp.num + ' (' + longName(rp.name) + ')' : '-')); }
    lines.push('             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec');
    lines.push('');
    lines.push('  Bridge ID  Priority    ' + me.prio + '  (priority ' + (me.prio - vlan) + ' sys-id-ext ' + vlan + ')');
    lines.push('             Address     ' + me.mac);
    lines.push('             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec');
    lines.push('             Aging Time  300 sec');
    lines.push('');
    lines.push('Interface           Role Sts Cost      Prio.Nbr Type');
    lines.push('------------------- ---- --- --------- -------- --------------------------------');
    Object.values(me.ports).sort((a, b) => a.num - b.num).forEach(p => {
      if (p.state === 'DIS') return;
      const type = 'P2p' + (p.portfast ? ' Edge' : '') + (p.errdisabled ? ' *BPDUGUARD_ERRDISABLE' : '');
      lines.push(shortName(p.name).padEnd(20) + p.role.padEnd(5) + p.state.padEnd(4) + String(p.cost).padEnd(10) + (p.prio + '.' + p.num).padEnd(9) + type); });
    return lines.join('\n');
  }
  function longName(p){ return p.replace('gigabitethernet', 'GigabitEthernet').replace('fastethernet', 'FastEthernet').replace('tengigabitethernet', 'TenGigabitEthernet'); }

  window.Stp = { compute, render, readConfig, expandRange, shortName };
})();
