/* engine/net.js — the network state engine.
   A gig declares a topology (job.net). Players type into Sim consoles. This module reads every device's
   parsed config (NetConfig) and computes what the network would actually do: VLAN segments, trunks,
   STP blocking, EtherChannel, routing tables (connected, static, OSPF, RIP, EIGRP), HSRP, DHCP leases
   (with snooping), port security, DAI, NAT, ACLs, and end-to-end ping/TCP reachability with a hop list.
   Content checks read the result: ctx.net().ping('PC1','10.0.2.10').ok, ctx.net().route('R1','0.0.0.0/0'), ...

   Topology format (job.net):
   { devices: { R1:{kind:'router'}, SW1:{kind:'switch',mac:'0001.9642.a3c0'}, PC1:{kind:'host',ip:'10.0.1.10',mask:'255.255.255.0',gw:'10.0.1.1',mac:'0200.0000.0001'},
                SRV1:{kind:'server',ip:...}, ISP:{kind:'cloud',ip:'203.0.113.1',mask:'255.255.255.252',internet:true},
                ROGUE:{kind:'rogue',role:'dhcp'|'stp'|'arpspoof',offer:{gw:'10.0.1.254'}}, ATK:{kind:'host',flood:200} },
     links: [ {a:'R1',ap:'gigabitethernet0/0',b:'SW1',bp:'gigabitethernet0/1'}, {a:'SW1',ap:'fastethernet0/1',b:'PC1'} ],
     preconfig: { R1:['interface g0/0','ip address 10.0.1.1 255.255.255.0','no shutdown'] } }   // applied silently at start
*/
(function(){
  const IP = Sim.ip;
  const RFC1918 = ip => { const n = IP.ip2n(ip); return (n >>> 24) === 10 || ((n >>> 20) === 0xac1) || ((n >>> 16) === 0xc0a8); };
  const inSubnet = (ip, net, mask) => IP.validIp(ip) && ((IP.ip2n(ip) & IP.mask(mlen(mask))) >>> 0) === ((IP.ip2n(net) & IP.mask(mlen(mask))) >>> 0);
  const mlen = mask => { if (typeof mask === 'number') return mask; const n = IP.ip2n(mask); let c = 0; for (let i = 31; i >= 0 && (n >>> i) & 1; i--) c++; return c; };
  const wildMatch = (ip, addr, wild) => { const w = IP.ip2n(wild); return ((IP.ip2n(ip) & ~w) >>> 0) === ((IP.ip2n(addr) & ~w) >>> 0); };
  const netOf = (ip, mask) => IP.n2ip((IP.ip2n(ip) & IP.mask(mlen(mask))) >>> 0);
  const kindOf = p => p.startsWith('gigabitethernet') ? 'gi' : p.startsWith('fastethernet') ? 'fa' : p.startsWith('serial') ? 'se' : p.startsWith('tengigabitethernet') ? 'te' : p.startsWith('loopback') ? 'lo' : p.startsWith('vlan') ? 'vlan' : p.startsWith('port-channel') ? 'po' : 'e';
  const BW = { gi: 1000000, fa: 100000, se: 1544, te: 10000000, lo: 8000000, vlan: 1000000, po: 1000000, e: 10000 }; // kbps
  BW.tu = 100; // a GRE tunnel's default bandwidth is 100 kbps, so OSPF costs it 1000
  const parentOf = p => p.includes('.') ? p.split('.')[0] : null;
  const short = p => p.replace('gigabitethernet', 'Gi').replace('tengigabitethernet', 'Te').replace('fastethernet', 'Fa').replace('serial', 'Se').replace('loopback', 'Lo').replace('port-channel', 'Po').replace(/^vlan/, 'Vl');

  // ---------------------------------------------------------------- union find
  function UF(){ const p = {}; const f = x => { p[x] = p[x] === undefined ? x : p[x]; while (p[x] !== x) { p[x] = p[p[x]]; x = p[x]; } return x; }; return { find: f, union: (a, b) => { a = f(a); b = f(b); if (a !== b) p[a] = b; }, has: x => p[x] !== undefined }; }

  // ---------------------------------------------------------------- build
  function build(net0, devices, opts){
    opts = opts || {};
    // devices flagged removed (e.g. a rogue that facilities pulled) vanish with their links
    const net = { devices: {}, links: [], preconfig: net0.preconfig, stpMode: net0.stpMode }; for (const n in net0.devices) if (!net0.devices[n].removed) net.devices[n] = net0.devices[n]; net.links = (net0.links || []).filter(l => net.devices[l.a] && net.devices[l.b]);
    const S = { net, devices, cfg: {}, ifaces: {}, links: [], segs: {}, segOf: {}, owners: {}, l3: [], routers: [], tables: {}, tables6: {}, hosts: {}, dhcp: {}, portsec: {}, hsrp: {}, threats: {}, issues: [], adj: {}, stp: {}, trunks: {}, bundles: {}, macTable: {}, natTables: {}, ospf: { neighbors: {}, routers: {} } };
    const D = net.devices;
    for (const n in D) { const d = D[n]; S.cfg[n] = devices[n] ? NetConfig.parse(devices[n]) : NetConfig.blank(); }
    // interfaces from links
    const portsOf = {}; for (const n in D) portsOf[n] = {};
    net.links.forEach((l, idx) => { const L = { a: l.a, ap: (l.ap || 'eth0').replace(/\s+/g, ''), b: l.b, bp: (l.bp || 'eth0').replace(/\s+/g, ''), kind: l.kind || null, id: idx }; S.links.push(L); portsOf[l.a][L.ap] = { link: L, peer: l.b, peerPort: L.bp }; portsOf[l.b][L.bp] = { link: L, peer: l.a, peerPort: L.ap }; });
    S.ports = portsOf;
    // interface state per sim device
    for (const n in D) { const d = D[n], cfg = S.cfg[n]; const isSwitch = d.kind === 'switch' || d.kind === 'l3switch'; const isRouter = d.kind === 'router';
      const names = new Set([...Object.keys(portsOf[n]), ...Object.keys(cfg.interfaces)]);
      S.ifaces[n] = {};
      for (const p of names) { const c = cfg.interfaces[p] || NetConfig.iface(NetConfig.blank(), p); const cabled = !!portsOf[n][p]; const kind = kindOf(p); const par = parentOf(p);
        let admin; if (c.shutdown === true) admin = false; else if (c.shutdown === false) admin = true; else admin = !!par || !(isRouter && (kind === 'gi' || kind === 'fa' || kind === 'se' || kind === 'e')); // router physical ports start shut
        if (kind === 'vlan' && n && isSwitch && c.shutdown == null && p === 'vlan1') admin = false;
        let up = admin && (par ? true : (kind === 'lo' || kind === 'vlan' || kind === 'po' ? true : cabled));
        S.ifaces[n][p] = { name: p, kind, cfg: c, cabled, admin, up, errdisabled: false, parent: par, peer: cabled ? portsOf[n][p].peer : null, peerPort: cabled ? portsOf[n][p].peerPort : null, mode: null, vlan: null, allowed: null, native: 1, trunk: false, bundle: null }; }
      // subinterfaces need the parent up
      for (const p in S.ifaces[n]) { const i = S.ifaces[n][p]; if (i.parent) { const par = S.ifaces[n][i.parent]; i.up = i.admin && !!(par && par.up); i.cabled = !!(par && par.cabled); i.peer = par && par.peer; i.peerPort = par && par.peerPort; } }
    }
    // GRE tunnels: a tunnel interface is not shut by default. It comes up when the two ends name each other (tunnel source and
    // tunnel destination) and the underlay carries a packet from one end's address to the other's, judged on the network without tunnels
    const tunnels = []; for (const n in D) for (const p in S.ifaces[n]) if (p.startsWith('tunnel')) { const i = S.ifaces[n][p]; i.kind = 'tu'; i.admin = i.cfg.shutdown !== true; i.up = false; tunnels.push({ dev: n, iface: p, i }); }
    S.tunnelPairs = [];
    if (tunnels.length && !opts.noTunnels) { const S0 = build(net0, devices, Object.assign({}, opts, { noTunnels: true }));
      const srcIp = t => { const s = t.i.cfg.tunnelSource; if (!s) return null; if (IP.validIp(s)) return s; const own = S0.ifaces[t.dev] && S0.ifaces[t.dev][Sim.canonIf(s) || s]; return own && own.up && own.cfg.ip ? own.cfg.ip : null; };
      tunnels.forEach(t => { t.src = srcIp(t); t.dst = t.i.cfg.tunnelDest || null; t.ok = !!(t.i.admin && t.src && t.dst && S0.routers.includes(t.dev) && ping(S0, t.dev, t.dst, { src: t.src }).ok); });
      tunnels.forEach(t => { const peer = tunnels.find(u => u !== t && t.ok && u.ok && u.src === t.dst && u.dst === t.src); if (!peer) return; t.i.up = true; t.i.peer = peer.dev; t.i.peerPort = peer.iface; if (t.dev + '|' + t.iface < peer.dev + '|' + peer.iface) S.tunnelPairs.push([t, peer]); }); }
    // duplex/speed mismatch issues
    S.links.forEach(L => { const a = S.ifaces[L.a] && S.ifaces[L.a][L.ap], b = S.ifaces[L.b] && S.ifaces[L.b][L.bp]; if (a && b && a.cfg.duplex && b.cfg.duplex && a.cfg.duplex !== b.cfg.duplex && a.cfg.duplex !== 'auto' && b.cfg.duplex !== 'auto') S.issues.push({ kind: 'duplex-mismatch', where: L.a + ' ' + short(L.ap) + ' / ' + L.b + ' ' + short(L.bp) }); });

    // ---- switch port modes, trunks, bundles
    const isSw = n => D[n].kind === 'switch' || D[n].kind === 'l3switch';
    // a multilayer switch port with `no switchport` is a routed port: no VLAN, no trunk, no spanning tree, an IP address like a router's
    const routedPort = (n, p) => D[n].kind === 'l3switch' && !!(S.ifaces[n] && S.ifaces[n][p] && S.ifaces[n][p].cfg.routed);
    for (const n in D) if (isSw(n)) for (const p in S.ifaces[n]) { const i = S.ifaces[n][p]; if (i.kind === 'vlan' || i.kind === 'lo' || i.parent || routedPort(n, p)) continue; const c = i.cfg;
      i.mode = c.mode || 'dynamic auto'; i.vlan = c.accessVlan || 1; i.native = c.native || 1; i.allowed = c.allowed; }
    // trunk decision per switch-switch or switch-router link
    S.links.forEach(L => { if (!isSw(L.a) && !isSw(L.b)) return; const ends = [[L.a, L.ap], [L.b, L.bp]].filter(([n, p]) => isSw(n) && !routedPort(n, p)); if (!ends.length) return;
      const modes = ends.map(([n, p]) => S.ifaces[n][p].mode);
      let trunk;
      if (ends.length === 2) { const [m1, m2] = modes; const on = m => m === 'trunk', acc = m => m === 'access', des = m => m === 'dynamic desirable';
        trunk = (on(m1) || on(m2) || des(m1) || des(m2)) && !acc(m1) && !acc(m2) && !(modes.every(m => m === 'dynamic auto')); if (acc(m1) && on(m2) || acc(m2) && on(m1)) S.issues.push({ kind: 'trunk-mode-mismatch', where: L.a + '/' + L.b }); }
      else { const [m] = modes; trunk = m === 'trunk'; }
      ends.forEach(([n, p]) => { S.ifaces[n][p].trunk = trunk; });
      if (trunk && ends.length === 2) { const [n1, p1] = ends[0], [n2, p2] = ends[1]; if (S.ifaces[n1][p1].native !== S.ifaces[n2][p2].native) S.issues.push({ kind: 'native-vlan-mismatch', where: n1 + ' ' + short(p1) + ' (' + S.ifaces[n1][p1].native + ') / ' + n2 + ' ' + short(p2) + ' (' + S.ifaces[n2][p2].native + ')' }); } });
    // EtherChannel bundles: same pair of switches, both ends channel-group, compatible modes
    const pairKey = (a, b) => [a, b].sort().join('|');
    const groups = {};
    S.links.forEach(L => { if (!(isSw(L.a) && isSw(L.b)) || routedPort(L.a, L.ap) || routedPort(L.b, L.bp)) return; const ca = S.ifaces[L.a][L.ap].cfg.channel, cb = S.ifaces[L.b][L.bp].cfg.channel; if (!ca || !cb) return;
      const ok = (ca.mode === 'on' && cb.mode === 'on') || (['active', 'passive'].includes(ca.mode) && ['active', 'passive'].includes(cb.mode) && !(ca.mode === 'passive' && cb.mode === 'passive')) || (['desirable', 'auto'].includes(ca.mode) && ['desirable', 'auto'].includes(cb.mode) && !(ca.mode === 'auto' && cb.mode === 'auto'));
      const k = pairKey(L.a, L.b) + '#' + ca.group + '/' + cb.group; (groups[k] = groups[k] || { a: L.a, b: L.b, ga: ca.group, gb: cb.group, links: [], ok }).links.push(L); if (!ok) groups[k].ok = false; });
    for (const k in groups) { const g = groups[k]; if (!g.ok) { S.issues.push({ kind: 'etherchannel-mode-mismatch', where: g.a + '/' + g.b }); continue; } g.links.forEach((L, i) => { S.ifaces[L.a][L.ap].bundle = g; S.ifaces[L.b][L.bp].bundle = g; L.bundleMember = i > 0; }); S.bundles[k] = g; }

    // ---- STP per VLAN on the switch subgraph
    const switches = Object.keys(D).filter(isSw); const rogueStp = Object.keys(D).filter(n => D[n].kind === 'rogue' && D[n].role === 'stp');
    if (switches.length) { const topo = { defaultMode: net.stpMode || 'rapid-pvst', switches: {} };
      switches.forEach(n => { const ports = {}; for (const p in S.ifaces[n]) { const i = S.ifaces[n][p]; if (i.kind === 'vlan' || i.kind === 'lo' || i.parent) continue; if (!i.cabled || !i.up || routedPort(n, p)) continue; const L = portsOf[n][p]; if (L.link.bundleMember) continue; if ((isSw(i.peer) && !routedPort(i.peer, i.peerPort)) || rogueStp.includes(i.peer)) ports[p] = { to: i.peer, peer: i.peerPort }; else ports[p] = { host: i.peer, access: !i.trunk }; } topo.switches[n] = { mac: D[n].mac || synthMac(n), ports }; });
      rogueStp.forEach(n => { const ports = {}; for (const p in portsOf[n]) ports[p] = { to: portsOf[n][p].peer, peer: portsOf[n][p].peerPort }; topo.switches[n] = { mac: D[n].mac || '0000.0c9f.f0' + String(Object.keys(topo.switches).length).padStart(2, '0'), rogue: true, fixed: { priority: D[n].priority != null ? D[n].priority : 0, mode: 'pvst', ports: {} }, ports, removed: !!D[n].removed }; });
      S.stpTopo = topo; S.stpVlans = new Set([1]); switches.forEach(n => Object.keys(S.cfg[n].vlans).forEach(v => S.stpVlans.add(+v)));
      S.stpVlans.forEach(v => { try { S.stp[v] = Stp.compute(topo, v, devices); } catch (e) { S.issues.push({ kind: 'stp-error', where: String(e) }); } });
      // bpdu guard err-disable on rogue-facing ports
      for (const n of switches) { const c = S.stp[1] && S.stp[1].switches[n]; if (!c) continue; for (const p in c.ports) if (c.ports[p].errdisabled) { S.ifaces[n][p].errdisabled = true; S.ifaces[n][p].up = false; } }
    }

    // ---- port security (needs host mac counts)
    for (const n of switches) for (const p in S.ifaces[n]) { const i = S.ifaces[n][p]; const ps = i.cfg.portsec; if (!ps || !ps.enabled) continue; if (i.mode !== 'access' && i.mode !== 'trunk') { S.issues.push({ kind: 'port-security-needs-access-mode', where: n + ' ' + short(p) }); S.portsec[n + '|' + p] = { enabled: false, rejected: true }; continue; }
      const peer = i.peer && D[i.peer]; const seen = peer ? (peer.macs ? peer.macs.slice() : peer.flood ? Array.from({ length: peer.flood }, (_, k) => 'dead.beef.' + String(k).padStart(4, '0')) : [peer.mac || synthMac(i.peer)]) : [];
      const allowed = ps.macs.slice(); const learned = []; let violations = 0;
      for (const m of seen) { if (allowed.includes(m)) continue; if (allowed.length + learned.length < ps.max) learned.push(m); else violations++; }
      const st = { enabled: true, max: ps.max, violation: ps.violation, sticky: ps.sticky, allowed, learned, violations, status: 'Secure-up' };
      if (violations > 0) { if (ps.violation === 'shutdown') { i.errdisabled = true; i.up = false; st.status = 'Secure-shutdown'; } else st.status = 'Secure-up'; }
      S.portsec[n + '|' + p] = st; }

    // ---- L2 segments (union-find over (switch,vlan) nodes, host ports, router ifaces, clouds)
    const uf = UF(); const node = (n, v) => n + '@' + v; const hostNode = n => 'H:' + n; const ifNode = (n, p) => 'I:' + n + '|' + p;
    const blockedIn = (v, n, p) => { const st = S.stp[v] || S.stp[1]; if (!st || !st.switches[n]) return false; const pp = st.switches[n].ports[p]; return !!(pp && (pp.state === 'BLK' || pp.errdisabled)); };
    const carries = (i, v) => i.trunk ? (!i.allowed || i.allowed.has(v)) : i.vlan === v;
    S.links.forEach(L => { const a = S.ifaces[L.a] && S.ifaces[L.a][L.ap], b = S.ifaces[L.b] && S.ifaces[L.b][L.bp]; if (!a || !b || !a.up || !b.up) return; if (L.bundleMember) return;
      const ka = D[L.a].kind, kb = D[L.b].kind; const swA = isSw(L.a) && !routedPort(L.a, L.ap), swB = isSw(L.b) && !routedPort(L.b, L.bp);
      if (swA && swB) { // switch-switch
        const vl = new Set([1]); [L.a, L.b].forEach(n => Object.keys(S.cfg[n].vlans).forEach(v => vl.add(+v))); [a, b].forEach(i => { vl.add(i.vlan); vl.add(i.native); });
        vl.forEach(v => { if (blockedIn(v, L.a, L.ap) || blockedIn(v, L.b, L.bp)) return;
          if (a.trunk && b.trunk) { if (carries(a, v) && carries(b, v)) { const va = v === a.native ? a.native : v, vb = v === b.native ? b.native : v; uf.union(node(L.a, v), node(L.b, v)); if (a.native !== b.native && (v === a.native || v === b.native)) { uf.union(node(L.a, a.native), node(L.b, b.native)); } } }
          else if (!a.trunk && !b.trunk) { if (a.vlan === v) uf.union(node(L.a, a.vlan), node(L.b, b.vlan)); }
          else { const t = a.trunk ? a : b, acc = a.trunk ? b : a, tn = a.trunk ? L.a : L.b, an = a.trunk ? L.b : L.a; if (v === t.native) uf.union(node(tn, t.native), node(an, acc.vlan)); } }); }
      else if (swA || swB) { const sw = swA ? L.a : L.b, swp = swA ? L.ap : L.bp, oth = swA ? L.b : L.a, othp = swA ? L.bp : L.ap; const si = S.ifaces[sw][swp]; const ok = D[oth].kind;
        if (ok === 'router' || ok === 'l3switch') { // router port and its subinterfaces
          const base = S.ifaces[oth][othp]; if (si.trunk) { uf.union(node(sw, si.native), ifNode(oth, othp)); for (const p in S.ifaces[oth]) { const sub = S.ifaces[oth][p]; if (sub.parent === othp && sub.up && sub.cfg.dot1q != null) { if (!blockedIn(sub.cfg.dot1q, sw, swp) && carries(si, sub.cfg.dot1q)) uf.union(node(sw, sub.cfg.dot1q === si.native ? si.native : sub.cfg.dot1q), ifNode(oth, p)); } } }
          else { if (!blockedIn(si.vlan, sw, swp)) uf.union(node(sw, si.vlan), ifNode(oth, othp)); } }
        else { const v = si.trunk ? si.native : si.vlan; if (!blockedIn(v, sw, swp)) uf.union(node(sw, v), hostNode(oth)); } }
      else { // no switch: point to point
        const na = (ka === 'router' || ka === 'l3switch') ? ifNode(L.a, L.ap) : hostNode(L.a), nb = (kb === 'router' || kb === 'l3switch') ? ifNode(L.b, L.bp) : hostNode(L.b); uf.union(na, nb); } });
    // SVIs join their VLAN node
    for (const n of switches) for (const p in S.ifaces[n]) { const i = S.ifaces[n][p]; if (i.kind === 'vlan' && i.up && i.cfg.ip) { const v = +p.replace('vlan', ''); uf.union(node(n, v), ifNode(n, p)); } }
    // a GRE tunnel whose two ends match is a point-to-point link between them
    S.tunnelPairs.forEach(([a, b]) => uf.union(ifNode(a.dev, a.iface), ifNode(b.dev, b.iface)));
    S.uf = uf; S.node = node; S.hostNode = hostNode; S.ifNode = ifNode;
    const segId = x => uf.find(x);

    // ---- L3 interfaces and owners per segment
    const addOwner = (seg, o) => (S.owners[seg] = S.owners[seg] || []).push(o);
    for (const n in D) { const d = D[n];
      if (d.kind === 'router' || d.kind === 'l3switch' || d.kind === 'switch') { for (const p in S.ifaces[n]) { const i = S.ifaces[n][p]; if (!i.cfg.ip || !i.up) continue; if (d.kind === 'switch' && i.kind !== 'vlan') continue; const seg = segId(ifNode(n, p)); const o = { dev: n, iface: p, ip: i.cfg.ip, mask: i.cfg.mask, seg, kind: 'iface', mac: synthMac(n + p) }; S.l3.push(o); addOwner(seg, o); i.cfg.secondary.forEach(sc => addOwner(seg, { dev: n, iface: p, ip: sc.ip, mask: sc.mask, seg, kind: 'iface' })); } }
      if (d.kind === 'cloud') { const seg = segId(hostNode(n)); const o = { dev: n, iface: 'eth0', ip: d.ip, mask: d.mask || '255.255.255.252', seg, kind: 'cloud', internet: !!d.internet, serves: d.serves || [] }; S.l3.push(o); addOwner(seg, o); S.hosts[n] = { ip: d.ip, mask: o.mask, gw: null, seg, kind: 'cloud', up: true }; }
    }
    S.routers = Object.keys(D).filter(n => D[n].kind === 'router' || D[n].kind === 'l3switch' || (D[n].kind === 'switch' && S.cfg[n].ipRouting));
    // HSRP
    const grp = {}; S.l3.forEach(o => { if (o.kind !== 'iface') return; const i = S.ifaces[o.dev][o.iface]; for (const g in i.cfg.standby) { const s = i.cfg.standby[g]; if (!s.ip) continue; const k = o.seg + '#' + g; (grp[k] = grp[k] || { seg: o.seg, group: +g, vip: s.ip, members: [] }).members.push({ dev: o.dev, iface: o.iface, ip: o.ip, priority: s.priority != null ? s.priority : 100, preempt: !!s.preempt }); } });
    for (const k in grp) { const g = grp[k]; g.members.sort((a, b) => b.priority - a.priority || IP.ip2n(b.ip) - IP.ip2n(a.ip)); g.active = g.members[0]; g.standby = g.members[1] || null; S.hsrp[k] = g; addOwner(g.seg, { dev: g.active.dev, iface: g.active.iface, ip: g.vip, mask: null, seg: g.seg, kind: 'vip', group: g.group, mac: '0000.0c07.ac' + (+g.group).toString(16).padStart(2, '0') }); }

    // ---- DHCP for hosts, then host table
    for (const n in D) { const d = D[n]; if (!['host', 'server', 'ap'].includes(d.kind)) continue; const seg = segId(hostNode(n)); const port = portsOf[n]['eth0'] || Object.values(portsOf[n])[0];
      const upstream = port && S.ifaces[port.peer] && S.ifaces[port.peer][port.peerPort]; const linkUp = !!(upstream && upstream.up && !upstream.errdisabled);
      let h = { name: n, ip: d.ip || null, mask: d.mask || null, gw: d.gw || null, dns: d.dns || null, seg, kind: d.kind, up: linkUp, dhcp: !!d.dhcp, lease: null, mac: d.mac || synthMac(n) };
      if (d.dhcp && linkUp) { const r = dhcpResolve(S, n, seg); h.lease = r; if (r.ok) { h.ip = r.ip; h.mask = r.mask; h.gw = r.gw; h.dns = r.dns; h.server = r.server; h.rogue = r.rogue; } else { h.ip = null; } }
      S.hosts[n] = h; if (h.ip && linkUp) addOwner(seg, { dev: n, iface: 'eth0', ip: h.ip, mask: h.mask, seg, kind: 'host', mac: h.mac }); }
    // DAI / arp spoof
    for (const n in D) { const d = D[n]; if (d.kind === 'rogue' && d.role === 'arpspoof' || (d.kind === 'host' && d.arpspoof)) { const seg = segId(hostNode(n)); const port = Object.values(portsOf[n])[0]; const sw = port && port.peer, swp = port && port.peerPort; const vlan = sw && isSw(sw) ? (S.ifaces[sw][swp].trunk ? S.ifaces[sw][swp].native : S.ifaces[sw][swp].vlan) : null;
      const dai = sw && isSw(sw) && S.cfg[sw].dhcp.daiVlans.has(vlan) && S.cfg[sw].dhcp.snooping; const trusted = sw && isSw(sw) && S.ifaces[sw][swp].cfg.daiTrust; S.threats.arpspoof = { attacker: n, seg, blocked: !!(dai && !trusted), reason: dai ? (trusted ? 'port trusted' : 'DAI dropped spoofed ARP') : 'no DAI on VLAN ' + vlan }; } }

    // ---- routing tables
    buildRouting(S);
    // ---- MAC tables & neighbors
    buildMacTables(S); buildNeighbors(S);
    return S;
  }
  function synthMac(seed){ let h = 0; for (const c of seed) h = (h * 33 + c.charCodeAt(0)) >>> 0; const hex = h.toString(16).padStart(8, '0'); return '0200.' + hex.slice(0, 4) + '.' + hex.slice(4, 8); }

  // ---------------------------------------------------------------- DHCP
  function dhcpResolve(S, host, seg){
    const D = S.net.devices; const cands = [];
    // legit: router interfaces on segment with matching pool on that router
    for (const o of S.owners[seg] || []) { if (o.kind !== 'iface') continue; const pools = S.cfg[o.dev].dhcp.pools; for (const pn in pools) { const p = pools[pn]; if (p.network && inSubnet(o.ip, p.network, p.mask)) cands.push({ dev: o.dev, via: o, pool: p, kind: 'router', rogue: false }); }
      // relay: helper-address to a server device by IP
      const i = S.ifaces[o.dev][o.iface]; for (const h of i.cfg.helpers) { for (const sn in D) { const sd = D[sn]; if ((sd.kind === 'server' || sd.kind === 'host') && sd.ip === h && sd.pools) for (const p of sd.pools) if (p.network && inSubnet(o.ip, p.network, p.mask)) cands.push({ dev: sn, via: o, pool: p, kind: 'relay', rogue: false, relayIf: o }); } } }
    // servers directly on segment
    for (const n in D) { const d = D[n]; if ((d.kind === 'server') && d.pools && S.uf.find(S.hostNode(n)) === seg) for (const p of d.pools) cands.push({ dev: n, pool: p, kind: 'server', rogue: false }); if (d.kind === 'rogue' && d.role === 'dhcp' && S.uf.find(S.hostNode(n)) === seg && !d.removed) cands.push({ dev: n, pool: null, kind: 'rogue', rogue: true, offer: d.offer || {} }); }
    // snooping filter: walk from candidate to host through switches; every switch with snooping on this VLAN must receive the offer on a trusted port
    const pass = cands.filter(c => snoopAllows(S, c, host));
    const rogue = pass.find(c => c.rogue); const legit = pass.find(c => !c.rogue);
    const dropped = cands.filter(c => !pass.includes(c)).map(c => c.dev);
    if (rogue) return { ok: true, rogue: true, server: rogue.dev, ip: rogue.offer.ip || nextFree(S, seg, '0.0.0.0', null, host), mask: rogue.offer.mask || '255.255.255.0', gw: rogue.offer.gw || null, dns: rogue.offer.dns || null, dropped };
    if (legit) { const p = legit.pool; const ip = nextFree(S, seg, p.network, p.mask, host, legit.dev); return { ok: !!ip, rogue: false, server: legit.dev, ip, mask: p.mask, gw: p.router, dns: p.dns, dropped, reason: ip ? null : 'pool exhausted' }; }
    return { ok: false, reason: cands.length ? 'offers dropped by DHCP snooping: ' + dropped.join(', ') : 'no DHCP server reachable', dropped };
  }
  function nextFree(S, seg, network, mask, host, serverDev){ // deterministic: hosts in name order get consecutive addresses after excluded/reserved ones
    const D = S.net.devices; const excl = serverDev && S.cfg[serverDev] ? S.cfg[serverDev].dhcp.excluded : []; const used = new Set((S.owners[seg] || []).map(o => o.ip));
    const base = IP.ip2n(network); const size = Math.pow(2, 32 - mlen(mask)); const order = Object.keys(D).filter(n => D[n].dhcp && S.uf.find(S.hostNode(n)) === seg).sort(); const idx = order.indexOf(host);
    let count = 0; for (let k = 1; k < size - 1; k++) { const ip = IP.n2ip(base + k); if (used.has(ip)) continue; if (excl.some(([a, b]) => IP.ip2n(ip) >= IP.ip2n(a) && IP.ip2n(ip) <= IP.ip2n(b))) continue; if (count === idx) return ip; count++; } return null;
  }
  function snoopAllows(S, cand, host){ // BFS over links inside the host's segment from candidate device to host
    const D = S.net.devices; const isSw = n => D[n].kind === 'switch' || D[n].kind === 'l3switch'; const start = cand.kind === 'router' || cand.kind === 'relay' ? cand.via.dev : cand.dev;
    const q = [[start, null]]; const seen = new Set([start]); const prev = {};
    while (q.length) { const [n] = q.shift(); if (n === host) break; for (const p in S.ports[n]) { const pr = S.ports[n][p]; const i = S.ifaces[n] && S.ifaces[n][p]; if (i && (!i.up)) continue; const m = pr.peer; if (seen.has(m)) continue; seen.add(m); prev[m] = [n, p, pr.peerPort]; q.push([m]); } }
    if (!seen.has(host)) return true; // not on a switched path we can judge
    let cur = host; while (prev[cur]) { const [from, fromPort, inPort] = prev[cur]; if (isSw(cur)) { const cfg = S.cfg[cur]; const inIf = S.ifaces[cur][inPort]; const vlan = inIf.trunk ? inIf.native : inIf.vlan; const hostVlan = vlan; if (cfg.dhcp.snooping && cfg.dhcp.snoopVlans.has(hostVlan) && !inIf.cfg.snoopTrust) return false; } cur = from; }
    return true;
  }

  // ---------------------------------------------------------------- routing
  function buildRouting(S){
    const D = S.net.devices;
    // per-router candidate routes
    const cands = {}; const add = (r, e) => (cands[r] = cands[r] || []).push(e);
    for (const r of S.routers) { for (const o of S.l3) if (o.dev === r && o.kind === 'iface') add(r, { prefix: netOf(o.ip, o.mask), len: mlen(o.mask), via: null, iface: o.iface, proto: 'C', ad: 0, metric: 0 });
      for (const st of S.cfg[r].routes) { let iface = null, via = st.via; if (!IP.validIp(via)) { iface = Sim.canonIf(via) || via; via = null; } else { const o = S.l3.find(x => x.dev === r && x.kind === 'iface' && inSubnet(via, netOf(x.ip, x.mask), x.mask)); if (!o) { S.issues.push({ kind: 'static-route-nexthop-unreachable', where: r + ' ' + st.prefix + ' via ' + via }); continue; } iface = o.iface; }
        add(r, { prefix: st.prefix, len: mlen(st.mask), via, iface, proto: st.prefix === '0.0.0.0' ? 'S*' : 'S', ad: st.ad, metric: 0 }); } }
    // OSPF
    const ospfRouters = S.routers.filter(r => S.cfg[r].ospf);
    const inOspf = (r, o) => { const c = S.cfg[r].ospf; const i = S.ifaces[r][o.iface]; if (i.cfg.ospfArea != null) return { area: i.cfg.ospfArea }; for (const n of c.networks) if (wildMatch(o.ip, n.addr, n.wild)) return { area: n.area }; return null; };
    const isPassive = (r, iface) => { const c = S.cfg[r].ospf; if (c.passiveDefault) return !c.noPassive.has(iface); return c.passive.has(iface); };
    const cost = (r, iface) => { const i = S.ifaces[r][iface]; if (i.cfg.ospfCost) return i.cfg.ospfCost; const ref = (S.cfg[r].ospf.refBw || 100) * 1000; return Math.max(1, Math.floor(ref / (BW[i.kind] || 100000))); };
    const routerIdOf = r => { const c = S.cfg[r].ospf; if (c.routerId) return c.routerId; const los = S.l3.filter(o => o.dev === r && o.kind === 'iface' && o.iface.startsWith('loopback')).map(o => o.ip).sort((a, b) => IP.ip2n(b) - IP.ip2n(a)); if (los.length) return los[0]; const all = S.l3.filter(o => o.dev === r && o.kind === 'iface').map(o => o.ip).sort((a, b) => IP.ip2n(b) - IP.ip2n(a)); return all[0] || '0.0.0.0'; };
    const adj = {}; ospfRouters.forEach(r => { adj[r] = []; S.ospf.routers[r] = { id: routerIdOf(r), ifaces: [] }; });
    for (const r of ospfRouters) for (const o of S.l3) { if (o.dev !== r || o.kind !== 'iface') continue; const m = inOspf(r, o); if (!m) continue; S.ospf.routers[r].ifaces.push({ iface: o.iface, area: m.area, passive: isPassive(r, o.iface), cost: cost(r, o.iface), net: netOf(o.ip, o.mask), len: mlen(o.mask) });
      if (isPassive(r, o.iface)) continue; for (const p of S.owners[o.seg] || []) { if (p.kind !== 'iface' || p.dev === r || !ospfRouters.includes(p.dev)) continue; const pm = inOspf(p.dev, p); if (!pm || isPassive(p.dev, p.iface)) continue; if (pm.area !== m.area) { S.issues.push({ kind: 'ospf-area-mismatch', where: r + ' ' + short(o.iface) + ' area ' + m.area + ' / ' + p.dev + ' ' + short(p.iface) + ' area ' + pm.area }); continue; } if (mlen(o.mask) !== mlen(p.mask)) { S.issues.push({ kind: 'ospf-mask-mismatch', where: r + '/' + p.dev }); continue; }
        adj[r].push({ to: p.dev, via: p.ip, iface: o.iface, cost: cost(r, o.iface) }); (S.ospf.neighbors[r] = S.ospf.neighbors[r] || []).push({ id: routerIdOf(p.dev), ip: p.ip, iface: o.iface, state: 'FULL', dev: p.dev }); } }
    for (const r of ospfRouters) { // dijkstra
      const dist = { [r]: 0 }, first = {}, done = new Set(); const pq = [[0, r, null]];
      while (pq.length) { pq.sort((a, b) => a[0] - b[0]); const [d, u, f] = pq.shift(); if (done.has(u)) continue; done.add(u); if (f) first[u] = f;
        for (const e of adj[u]) { const nd = d + e.cost; if (dist[e.to] == null || nd < dist[e.to]) { dist[e.to] = nd; pq.push([nd, e.to, f || { via: e.via, iface: e.iface }]); } else if (nd === dist[e.to] && !done.has(e.to) && f) { (first[e.to + '#ecmp'] = first[e.to + '#ecmp'] || []).push(f); } } }
      for (const t in dist) { if (t === r) continue; const f = first[t]; if (!f) continue; for (const ni of S.ospf.routers[t].ifaces) { const own = S.ospf.routers[r].ifaces.find(x => x.net === ni.net && x.len === ni.len); if (own) continue; add(r, { prefix: ni.net, len: ni.len, via: f.via, iface: f.iface, proto: 'O', ad: 110, metric: dist[t] + ni.cost }); }
        if (S.cfg[t].ospf.defaultOriginate && S.cfg[t].routes.some(x => x.prefix === '0.0.0.0')) add(r, { prefix: '0.0.0.0', len: 0, via: f.via, iface: f.iface, proto: 'O*E2', ad: 110, metric: 1 }); } }
    // RIP / EIGRP: hop-based over shared network statements
    for (const proto of ['rip', 'eigrp']) { const rs = S.routers.filter(r => S.cfg[r][proto]); if (!rs.length) continue;
      const enabled = (r, o) => { const c = S.cfg[r][proto]; return c.networks.some(n => { const a = typeof n === 'string' ? n : n.addr; const w = typeof n === 'string' ? null : n.wild; if (w) return wildMatch(o.ip, a, w); const cls = IP.ip2n(a) >>> 24; const len = cls < 128 ? 8 : cls < 192 ? 16 : 24; return inSubnet(o.ip, a, len); }); };
      const adj2 = {}; rs.forEach(r => adj2[r] = []);
      for (const r of rs) for (const o of S.l3) { if (o.dev !== r || o.kind !== 'iface' || !enabled(r, o)) continue; for (const p of S.owners[o.seg] || []) if (p.kind === 'iface' && p.dev !== r && rs.includes(p.dev) && enabled(p.dev, p)) adj2[r].push({ to: p.dev, via: p.ip, iface: o.iface, cost: proto === 'rip' ? 1 : Math.floor(256 * (10000000 / (BW[S.ifaces[r][o.iface].kind] || 100000) + 100)) }); }
      for (const r of rs) { const dist = { [r]: 0 }, first = {}, done = new Set(); const pq = [[0, r, null]];
        while (pq.length) { pq.sort((a, b) => a[0] - b[0]); const [d, u, f] = pq.shift(); if (done.has(u)) continue; done.add(u); if (f) first[u] = f; for (const e of adj2[u]) { const nd = d + e.cost; if (dist[e.to] == null || nd < dist[e.to]) { dist[e.to] = nd; pq.push([nd, e.to, f || { via: e.via, iface: e.iface }]); } } }
        for (const t in dist) { if (t === r) continue; const f = first[t]; if (!f) continue; if (proto === 'rip' && dist[t] > 15) continue; for (const o of S.l3) { if (o.dev !== t || o.kind !== 'iface' || !enabled(t, o)) continue; const pre = netOf(o.ip, o.mask), len = mlen(o.mask); if (S.l3.some(x => x.dev === r && x.kind === 'iface' && netOf(x.ip, x.mask) === pre)) continue; add(r, { prefix: pre, len, via: f.via, iface: f.iface, proto: proto === 'rip' ? 'R' : 'D', ad: proto === 'rip' ? 120 : 90, metric: proto === 'rip' ? dist[t] : dist[t] + 2816 }); } } } }
    // select best per prefix
    for (const r of S.routers) { const best = {}; for (const e of cands[r] || []) { const k = e.prefix + '/' + e.len; const cur = best[k]; if (!cur || e.ad < cur[0].ad || (e.ad === cur[0].ad && e.metric < cur[0].metric)) best[k] = [e]; else if (e.ad === cur[0].ad && e.metric === cur[0].metric && !cur.some(x => x.via === e.via && x.iface === e.iface)) cur.push(e); }
      S.tables[r] = Object.values(best).flat().sort((a, b) => IP.ip2n(a.prefix) - IP.ip2n(b.prefix) || b.len - a.len); }
    // IPv6: connected + static only
    for (const r of S.routers) { const t6 = []; for (const p in S.ifaces[r]) { const i = S.ifaces[r][p]; if (!i.up) continue; for (const a of i.cfg.ipv6) { const addr = a.eui64 ? eui64(a.addr, synthMac(r + p)) : a.addr; t6.push({ prefix: v6net(addr, a.prefix), len: a.prefix, via: null, iface: p, proto: 'C', ad: 0 }); } }
      for (const st of S.cfg[r].routes6) { const [pre, len] = st.prefix.split('/'); t6.push({ prefix: IP.ipv6compress(pre), len: +len, via: IP.validIp(st.via) ? null : (st.via.includes(':') ? st.via : null), iface: st.via.includes(':') ? null : (Sim.canonIf(st.via) || st.via), proto: st.prefix.startsWith('::/0') || pre === '::' ? 'S' : 'S', ad: 1 }); }
      S.tables6[r] = t6; }
  }
  function eui64(prefixAddr, mac){ const h = mac.replace(/[.:]/g, ''); const b = parseInt(h.slice(0, 2), 16) ^ 2; const id = b.toString(16).padStart(2, '0') + h.slice(2, 4) + ':' + h.slice(4, 6) + 'ff:fe' + h.slice(6, 8) + ':' + h.slice(8, 12); const p = prefixAddr.replace(/::$/, ''); return IP.ipv6compress(p + ':' + id); }
  function v6net(addr, len){ const full = expand6(addr); const bits = BigInt('0x' + full.replace(/:/g, '')); const mask = len === 0 ? 0n : ((1n << 128n) - 1n) << BigInt(128 - len); const net = bits & mask; const hex = net.toString(16).padStart(32, '0'); return IP.ipv6compress(hex.match(/.{4}/g).join(':')); }
  function expand6(a){ let h = a.toLowerCase().split('::'); let parts; if (h.length === 2) { const l = h[0] ? h[0].split(':') : [], r = h[1] ? h[1].split(':') : []; parts = l.concat(new Array(8 - l.length - r.length).fill('0'), r); } else parts = h[0].split(':'); return parts.map(x => x.padStart(4, '0')).join(':'); }

  function buildMacTables(S){ const D = S.net.devices; const isSw = n => D[n].kind === 'switch' || D[n].kind === 'l3switch';
    for (const sw in D) { if (!isSw(sw)) continue; const rows = [];
      for (const o of Object.values(S.owners).flat()) { if (!o.mac) continue; if (o.dev === sw) continue; const port = portToward(S, sw, o.dev); if (!port) continue; const i = S.ifaces[sw][port]; const vlan = i.trunk ? (o.kind === 'iface' && S.ifaces[o.dev][o.iface].cfg.dot1q) || i.native : i.vlan; rows.push({ vlan, mac: o.mac, port, who: o.dev }); }
      S.macTable[sw] = rows.sort((a, b) => a.vlan - b.vlan || a.mac.localeCompare(b.mac)); } }
  function portToward(S, from, to){ const q = [from]; const prev = { [from]: null }; while (q.length) { const n = q.shift(); if (n === to) break; for (const p in S.ports[n]) { const pr = S.ports[n][p]; const i = S.ifaces[n] && S.ifaces[n][p]; if (i && !i.up) continue; if (prev[pr.peer] !== undefined) continue; prev[pr.peer] = [n, p]; q.push(pr.peer); } }
    if (prev[to] === undefined) return null; let cur = to; let port = null; while (prev[cur]) { const [n, p] = prev[cur]; if (n === from) port = p; cur = n; } return port; }
  function buildNeighbors(S){ const D = S.net.devices; S.neighbors = {}; for (const L of S.links) { const ka = D[L.a].kind, kb = D[L.b].kind; const netdev = k => ['router', 'switch', 'l3switch'].includes(k); if (!netdev(ka) || !netdev(kb)) continue; const a = S.ifaces[L.a][L.ap], b = S.ifaces[L.b][L.bp]; if (!a.up || !b.up) continue;
      (S.neighbors[L.a] = S.neighbors[L.a] || []).push({ dev: L.b, local: L.ap, remote: L.bp, cdp: S.cfg[L.a].cdp && S.cfg[L.b].cdp, lldp: S.cfg[L.a].lldp && S.cfg[L.b].lldp, platform: kb === 'router' ? 'cisco ISR4321' : 'cisco WS-C2960', ip: (S.l3.find(o => o.dev === L.b && o.kind === 'iface') || {}).ip || '' });
      (S.neighbors[L.b] = S.neighbors[L.b] || []).push({ dev: L.a, local: L.bp, remote: L.ap, cdp: S.cfg[L.a].cdp && S.cfg[L.b].cdp, lldp: S.cfg[L.a].lldp && S.cfg[L.b].lldp, platform: ka === 'router' ? 'cisco ISR4321' : 'cisco WS-C2960', ip: (S.l3.find(o => o.dev === L.a && o.kind === 'iface') || {}).ip || '' }); } }

  // ---------------------------------------------------------------- ACL / NAT
  function aclEval(S, dev, aclId, pkt){ const a = S.cfg[dev].acls[aclId]; if (!a) return { action: 'permit', reason: 'ACL ' + aclId + ' not defined (permits all)' };
    for (const e of a.entries) { if (a.type === 'standard') { if (wildMatch(pkt.src, e.src, e.swild)) return { action: e.action, line: e, seq: e.seq }; continue; }
      if (e.proto !== 'ip' && e.proto !== pkt.proto) continue; if (!wildMatch(pkt.src, e.src, e.swild)) continue; if (!wildMatch(pkt.dst, e.dst, e.dwild)) continue;
      const pm = (spec, v) => !spec || (spec.op === 'eq' ? v === spec.p : spec.op === 'gt' ? v > spec.p : spec.op === 'lt' ? v < spec.p : spec.op === 'neq' ? v !== spec.p : spec.op === 'range' ? v >= spec.a && v <= spec.b : true); if (!pm(e.sport, pkt.sport) || !pm(e.dport, pkt.dport)) continue; return { action: e.action, line: e, seq: e.seq }; }
    return { action: 'deny', reason: 'implicit deny at end of ACL ' + aclId, implicit: true }; }
  function natOut(S, dev, inIf, outIf, pkt, tbl){ const cfg = S.cfg[dev]; const ii = S.ifaces[dev][inIf], oi = S.ifaces[dev][outIf]; if (!(ii && ii.cfg.natInside && oi && oi.cfg.natOutside)) return null;
    for (const s of cfg.natStatic) if (s.inside === pkt.src) { tbl.push({ inside: pkt.src, global: s.outside, kind: 'static', proto: pkt.proto, port: pkt.sport }); return s.outside; }
    for (const d of cfg.natDynamic) { const r = aclEval(S, dev, d.acl, { src: pkt.src, dst: pkt.dst, proto: 'ip' }); if (r.action !== 'permit') continue; let g = null; if (d.iface) { const o = S.l3.find(x => x.dev === dev && x.iface === (Sim.canonIf(d.iface) || d.iface)); g = o && o.ip; } else if (d.pool && cfg.natPools[d.pool]) { const p = cfg.natPools[d.pool]; const used = tbl.filter(t => t.pool === d.pool).map(t => t.global); const size = IP.ip2n(p.end) - IP.ip2n(p.start) + 1; for (let k = 0; k < size; k++) { const cand = IP.n2ip(IP.ip2n(p.start) + k); if (!used.includes(cand) || d.overload) { g = cand; break; } } }
      if (!g) return { fail: 'NAT: no global address available' }; tbl.push({ inside: pkt.src, global: g, kind: d.overload ? 'pat' : 'dynamic', proto: pkt.proto, port: pkt.sport, pool: d.pool }); return g; }
    return null; }

  // ---------------------------------------------------------------- forwarding
  function ownerOn(S, seg, ip){ return (S.owners[seg] || []).find(o => o.ip === ip) || (S.owners[seg] || []).find(o => o.kind === 'cloud' && (o.internet && !RFC1918(ip) || o.serves.includes(ip))); }
  function lookup(S, r, ip){ const t = S.tables[r] || []; let best = null; for (const e of t) { if (!inSubnet(ip, e.prefix, e.len)) continue; if (!best || e.len > best.len) best = e; } return best; }
  function ping(S, from, dstIp, opts){
    opts = opts || {}; const proto = opts.proto || 'icmp'; const pkt0 = { src: null, dst: dstIp, proto, sport: opts.sport || 49152, dport: opts.dport || (proto === 'icmp' ? null : 80) };
    const D = S.net.devices; const path = []; const natTbl = []; const fail = (reason, extra) => Object.assign({ ok: false, reason, path, nat: natTbl }, extra || {});
    if (!IP.validIp(dstIp)) return fail('bad destination ' + dstIp);
    // source
    let cur, seg, pkt = Object.assign({}, pkt0);
    if (S.hosts[from]) { const h = S.hosts[from]; if (!h.up) return fail(from + ' has no link'); if (!h.ip) return fail(from + ' has no IP address' + (h.lease && h.lease.reason ? ' (' + h.lease.reason + ')' : '')); pkt.src = h.ip; cur = { kind: 'host', dev: from, seg: h.seg, ip: h.ip, mask: h.mask, gw: h.gw }; }
    else if (S.routers.includes(from)) { const rt = lookup(S, from, dstIp); if (!rt) return fail(from + ' has no route to ' + dstIp); const o = S.l3.find(x => x.dev === from && x.iface === rt.iface); pkt.src = opts.src || (o ? o.ip : null); if (!pkt.src) return fail('no source address'); cur = { kind: 'router', dev: from, inIf: null }; }
    else return fail(from + ' cannot originate traffic');
    const res = forward(S, cur, pkt, path, natTbl, 'request'); const trail = (path.trail || []).slice(); if (res.ok && trail[trail.length - 1] !== dstIp) trail.push(dstIp); if (!res.ok) return fail(res.reason, { hops: res.hops, trail });
    // reply
    const rpkt = { src: res.dstIp, dst: pkt.src === res.srcSeen ? pkt.src : res.srcSeen, proto, sport: pkt.dport, dport: pkt.sport, reply: true };
    const back = forward(S, res.at, rpkt, path, natTbl, 'reply'); if (!back.ok) return fail('reply failed: ' + back.reason, { hops: res.hops, trail });
    return { ok: true, reason: 'reply from ' + res.dstDev, path, nat: natTbl, hops: res.hops, dst: res.dstDev, trail };
  }
  function forward(S, cur, pkt, path, natTbl, dir){
    const D = S.net.devices; let ttl = 30; const visited = new Set(); let hops = 0; let srcSeen = pkt.src;
    for (;;) { if (ttl-- <= 0) return { ok: false, reason: 'TTL expired (routing loop?)', hops };
      if (cur.kind === 'host' || cur.kind === 'cloud') { const h = S.hosts[cur.dev]; let target;
        if (cur.kind === 'cloud') { const o = S.l3.find(x => x.dev === cur.dev); if (RFC1918(pkt.dst) && !o.serves.includes(pkt.dst)) return { ok: false, reason: cur.dev + ' will not route a private address (' + pkt.dst + ')', hops }; target = ownerOn(S, o.seg, pkt.dst) || (S.owners[o.seg] || []).find(x => x.kind === 'iface'); if (!target) return { ok: false, reason: cur.dev + ' has no next hop', hops }; if (target.ip !== pkt.dst && target.kind === 'iface') { path.push({ dev: cur.dev, act: 'forward to ' + target.dev }); cur = { kind: 'router', dev: target.dev, inIf: target.iface }; continue; } }
        else { if (inSubnet(pkt.dst, netOf(h.ip, h.mask), h.mask)) target = ownerOn(S, h.seg, pkt.dst); else { if (!h.gw) return { ok: false, reason: cur.dev + ' has no default gateway', hops }; target = ownerOn(S, h.seg, h.gw); if (!target) return { ok: false, reason: cur.dev + ' cannot reach its gateway ' + h.gw + ' (no ARP reply)', hops }; if (target.kind === 'host' || (target.kind === 'cloud')) return { ok: false, reason: 'gateway ' + h.gw + ' is not a router', hops }; } }
        if (!target) return { ok: false, reason: 'no host ' + pkt.dst + ' on ' + cur.dev + "'s network", hops };
        path.push({ dev: cur.dev, act: (target.ip === pkt.dst ? 'deliver to ' : 'send to gateway ') + target.dev });
        if (target.ip === pkt.dst || (target.kind === 'cloud' && target.ip !== pkt.dst)) { if (target.kind === 'iface' || target.kind === 'vip') { const c = { kind: 'router', dev: target.dev, inIf: target.iface }; return deliverRouter(S, c, pkt, path, natTbl, hops, srcSeen); } return { ok: true, at: { kind: target.kind === 'cloud' ? 'cloud' : 'host', dev: target.dev, seg: target.seg }, dstDev: target.dev, dstIp: pkt.dst, hops, srcSeen }; }
        cur = { kind: 'router', dev: target.dev, inIf: target.iface }; continue; }
      // router
      const r = cur.dev; hops++; if (dir === 'request' && cur.inIf) { const ii = S.ifaces[r][cur.inIf]; (path.trail = path.trail || []).push(ii && ii.cfg.ip || r); } const key = r + '|' + pkt.dst + '|' + dir; if (visited.has(key)) return { ok: false, reason: 'loop at ' + r, hops }; visited.add(key);
      if (cur.inIf) { const ii = S.ifaces[r][cur.inIf]; if (ii && ii.cfg.aclIn) { const v = aclEval(S, r, ii.cfg.aclIn, pkt); if (v.action === 'deny') { path.push({ dev: r, act: 'DENIED inbound on ' + short(cur.inIf) + ' by ACL ' + ii.cfg.aclIn + (v.implicit ? ' (implicit deny)' : ' line ' + v.seq) }); return { ok: false, reason: 'denied by ACL ' + ii.cfg.aclIn + ' inbound on ' + r + ' ' + short(cur.inIf), hops }; } }
        // NAT inbound from outside: translate global -> inside local
        if (ii && ii.cfg.natOutside) { const t = natTbl.find(x => x.global === pkt.dst); if (t) { path.push({ dev: r, act: 'NAT ' + pkt.dst + ' → ' + t.inside }); pkt = Object.assign({}, pkt, { dst: t.inside }); } else { const st = S.cfg[r].natStatic.find(x => x.outside === pkt.dst); if (st) { path.push({ dev: r, act: 'NAT ' + pkt.dst + ' → ' + st.inside }); pkt = Object.assign({}, pkt, { dst: st.inside }); } } } }
      // is it for me?
      const mine = S.l3.find(o => o.dev === r && o.kind === 'iface' && o.ip === pkt.dst) || Object.values(S.hsrp).find(g => g.vip === pkt.dst && g.active.dev === r);
      if (mine) { path.push({ dev: r, act: 'deliver (local)' }); return { ok: true, at: { kind: 'router', dev: r, inIf: null }, dstDev: r, dstIp: pkt.dst, hops, srcSeen }; }
      const rt = lookup(S, r, pkt.dst); if (!rt) { path.push({ dev: r, act: 'no route to ' + pkt.dst }); return { ok: false, reason: r + ' has no route to ' + pkt.dst, hops }; }
      const outIf = rt.iface; const oi = S.ifaces[r][outIf]; if (!oi || !oi.up) return { ok: false, reason: r + ' egress ' + short(outIf) + ' is down', hops };
      // NAT outbound
      if (cur.inIf && !pkt.reply) { const g = natOut(S, r, cur.inIf, outIf, pkt, natTbl); if (g && g.fail) { path.push({ dev: r, act: g.fail }); return { ok: false, reason: g.fail, hops }; } if (g) { path.push({ dev: r, act: 'NAT ' + pkt.src + ' → ' + g }); pkt = Object.assign({}, pkt, { src: g }); srcSeen = g; } }
      if (pkt.reply && oi.cfg.natInside) { /* reply heading back inside: src stays */ }
      if (oi.cfg.aclOut) { const v = aclEval(S, r, oi.cfg.aclOut, pkt); if (v.action === 'deny') { path.push({ dev: r, act: 'DENIED outbound on ' + short(outIf) + ' by ACL ' + oi.cfg.aclOut + (v.implicit ? ' (implicit deny)' : ' line ' + v.seq) }); return { ok: false, reason: 'denied by ACL ' + oi.cfg.aclOut + ' outbound on ' + r + ' ' + short(outIf), hops }; } }
      const o = S.l3.find(x => x.dev === r && x.iface === outIf); const seg = o && o.seg;
      const nh = rt.via || pkt.dst; const target = ownerOn(S, seg, nh); path.push({ dev: r, act: 'route ' + rt.prefix + '/' + rt.len + ' [' + rt.proto + '] via ' + (rt.via || short(outIf)) });
      if (!target) return { ok: false, reason: r + ': next hop ' + nh + ' unreachable on ' + short(outIf) + ' (no ARP reply)', hops };
      if (target.ip === pkt.dst && (target.kind === 'host')) { path.push({ dev: target.dev, act: 'deliver' }); return { ok: true, at: { kind: 'host', dev: target.dev, seg }, dstDev: target.dev, dstIp: pkt.dst, hops, srcSeen }; }
      if (target.kind === 'cloud') { if (target.internet && RFC1918(pkt.src)) { path.push({ dev: target.dev, act: 'DROP private source ' + pkt.src }); return { ok: false, reason: target.dev + ' drops packets from private address ' + pkt.src + ' (no NAT?)', hops }; } path.push({ dev: target.dev, act: target.ip === pkt.dst ? 'deliver' : 'internet delivers to ' + pkt.dst }); return { ok: true, at: { kind: 'cloud', dev: target.dev, seg }, dstDev: target.dev, dstIp: pkt.dst, hops, srcSeen }; }
      if (target.kind === 'iface' || target.kind === 'vip') { cur = { kind: 'router', dev: target.dev, inIf: target.iface }; continue; }
      return { ok: false, reason: 'unhandled target', hops }; }
  }
  function deliverRouter(S, c, pkt, path, natTbl, hops, srcSeen){ const r = c.dev; const ii = S.ifaces[r][c.inIf]; if (ii && ii.cfg.aclIn) { const v = aclEval(S, r, ii.cfg.aclIn, pkt); if (v.action === 'deny') return { ok: false, reason: 'denied by ACL ' + ii.cfg.aclIn + ' inbound on ' + r, hops }; } path.push({ dev: r, act: 'deliver (local)' }); return { ok: true, at: { kind: 'router', dev: r, inIf: null }, dstDev: r, dstIp: pkt.dst, hops, srcSeen }; }

  // ---------------------------------------------------------------- public helpers for checks
  function api(S){
    return {
      state: S, cfg: d => S.cfg[d], issues: S.issues, hosts: S.hosts, tables: S.tables,
      ping: (from, to, o) => ping(S, from, to, o), tcp: (from, to, port) => ping(S, from, to, { proto: 'tcp', dport: port }),
      route: (r, prefix) => { const [p, l] = prefix.split('/'); return (S.tables[r] || []).find(e => e.prefix === p && e.len === +l) || null; },
      routes: r => S.tables[r] || [], iface: (d, p) => S.ifaces[d] && S.ifaces[d][Sim.canonIf(p) || p], up: (d, p) => { const i = S.ifaces[d] && S.ifaces[d][Sim.canonIf(p) || p]; return !!(i && i.up); },
      trunk: (d, p) => { const i = S.ifaces[d] && S.ifaces[d][Sim.canonIf(p) || p]; return !!(i && i.trunk); }, vlanOf: (d, p) => { const i = S.ifaces[d] && S.ifaces[d][Sim.canonIf(p) || p]; return i ? i.vlan : null; },
      sameSegment: (a, b) => { const na = S.hosts[a] ? S.hostNode(a) : null, nb = S.hosts[b] ? S.hostNode(b) : null; return !!(na && nb && S.uf.find(na) === S.uf.find(nb)); },
      ospfNeighbors: r => S.ospf.neighbors[r] || [], hsrpActive: vip => { const g = Object.values(S.hsrp).find(x => x.vip === vip); return g ? g.active.dev : null; },
      lease: h => S.hosts[h] && S.hosts[h].lease, portsec: (d, p) => S.portsec[d + '|' + (Sim.canonIf(p) || p)], errdisabled: (d, p) => { const i = S.ifaces[d] && S.ifaces[d][Sim.canonIf(p) || p]; return !!(i && i.errdisabled); },
      threats: S.threats, stp: v => S.stp[v || 1],
      sshReady: d => { const c = S.cfg[d]; const vty = c.vty; const ok = !!(c.hostname && c.hostname !== d.replace(/\d+$/, '') || true) && !!c.domain && c.sshKeyBits > 0 && !!(vty.transport && vty.transport.includes('ssh')) && vty.login === 'local' && c.users.length > 0; return { ok, hostname: !!c.hostname, domain: !!c.domain, key: c.sshKeyBits, transport: vty.transport, login: vty.login, users: c.users.length }; },
      acl: (d, id) => S.cfg[d].acls[id] || null, aclTest: (d, id, pkt) => aclEval(S, d, id, pkt),
      nat: d => ({ static: S.cfg[d].natStatic, dynamic: S.cfg[d].natDynamic, pools: S.cfg[d].natPools }),
      neighbors: d => S.neighbors[d] || [], macTable: d => S.macTable[d] || [], bundles: S.bundles
    };
  }

  // traceroute as the consoles print it: the forward path only, one line per hop, the ingress address of each router, then the target
  function traceLines(r, style){ const t = r.trail || []; const row = (i, ip) => style === 'pc' ? '  ' + String(i).padStart(2) + '    <1 ms    <1 ms    <1 ms  ' + ip : '  ' + i + ' ' + ip + ' 0 msec 0 msec 0 msec';
    const out = t.map((ip, i) => row(i + 1, ip)); if (!r.ok) out.push(style === 'pc' ? '  ' + String(t.length + 1).padStart(2) + '     *        *        *     Request timed out.' : '  ' + (t.length + 1) + '  *  *  * '); return out; }
  window.Net = { build, api, ping, traceLines, aclEval, lookup, inSubnet, mlen, netOf, RFC1918, short, kindOf, eui64, synthMac };
})();
