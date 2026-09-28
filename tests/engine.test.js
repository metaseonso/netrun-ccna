/* tests/engine.test.js — network engine fixtures. Each one is also a worked example of the job.net format.
   Run by tools/check.js (globals Net, Sim, NetConfig, Stp are already loaded). */
module.exports.run = function({ out }){
  let pass = 0, fails = 0; const ok = (c, m) => { if (c) pass++; else { fails++; out('FAIL   ' + m); } };
  const dev = (n, kind, lines) => { const d = new Sim.Device(n, { kind: kind || 'ios' }); (lines || []).forEach(l => d.exec(l)); return d; };
  const devs = (spec) => { const o = {}; for (const n in spec) o[n] = dev(n, 'ios', spec[n]); for (const n in o) o[n]._all = o; return o; };

  // 1. two routers, static routes, hosts ping across
  {
    const net = { devices: { R1: { kind: 'router' }, R2: { kind: 'router' }, PC1: { kind: 'host', ip: '10.0.1.10', mask: '255.255.255.0', gw: '10.0.1.1' }, PC2: { kind: 'host', ip: '10.0.2.10', mask: '255.255.255.0', gw: '10.0.2.1' } },
      links: [ { a: 'PC1', b: 'R1', bp: 'gigabitethernet0/0' }, { a: 'R1', ap: 'gigabitethernet0/1', b: 'R2', bp: 'gigabitethernet0/1' }, { a: 'R2', ap: 'gigabitethernet0/0', b: 'PC2' } ] };
    const d = devs({ R1: ['en', 'conf t', 'int g0/0', 'ip address 10.0.1.1 255.255.255.0', 'no shut', 'int g0/1', 'ip address 10.0.12.1 255.255.255.252', 'no shut'], R2: ['en', 'conf t', 'int g0/0', 'ip address 10.0.2.1 255.255.255.0', 'no shut', 'int g0/1', 'ip address 10.0.12.2 255.255.255.252', 'no shut'] });
    let A = Net.api(Net.build(net, d)); const p0 = A.ping('PC1', '10.0.2.10'); ok(!p0.ok && /no route/.test(p0.reason), 'static: no route before routes (' + p0.reason + ')');
    ok(A.ping('PC1', '10.0.1.1').ok, 'static: host reaches its gateway');
    d.R1.exec('ip route 10.0.2.0 255.255.255.0 10.0.12.2'); A = Net.api(Net.build(net, d)); const p1 = A.ping('PC1', '10.0.2.10'); ok(!p1.ok && /reply failed/.test(p1.reason), 'static: one-way route fails on the reply (' + p1.reason + ')');
    d.R2.exec('ip route 10.0.1.0 255.255.255.0 10.0.12.1'); A = Net.api(Net.build(net, d)); const p2 = A.ping('PC1', '10.0.2.10'); ok(p2.ok, 'static: both routes → ping works (' + p2.reason + ')'); ok(A.route('R1', '10.0.2.0/24') && A.route('R1', '10.0.2.0/24').proto === 'S', 'static: route appears as S');
    ok(/S\s+10\.0\.2\.0\/24/.test(Show.render(d.R1, 'show ip route', A.state)), 'show ip route lists the static route');
    d.R1.exec('int g0/0'); d.R1.exec('description ## to PC1 ##'); A = Net.api(Net.build(net, d)); const idesc = Show.render(d.R1, 'show interfaces description', A.state);
    ok(/Gi0\/0\s+up\s+up\s+## to pc1 ##/.test(idesc) && /Gi0\/1\s+up\s+up/.test(idesc), 'show interfaces description lists status, protocol and the description (' + idesc + ')');
    // shutdown breaks it
    // traceroute shows the forward path only: each router's ingress address, then the target
    const tr = A.ping('PC1', '10.0.2.10'); ok(JSON.stringify(tr.trail) === JSON.stringify(['10.0.1.1', '10.0.12.2', '10.0.2.10']), 'trace: hops are the ingress addresses, forward only (' + JSON.stringify(tr.trail) + ')');
    const pc = new Sim.Device('PC1', { kind: 'host', netState: () => A.state }); pc.exec('tracert 10.0.2.10'); const txt = pc.out.map(o => o.s).join('\n'); ok(/10\.0\.12\.2/.test(txt) && !/R2|PC1\s*$/m.test(txt.split('\n').slice(1).join('\n')) && /Trace complete/.test(txt), 'trace: PC tracert prints addresses, not names');
    ok(JSON.stringify(A.ping('R1', '10.0.2.10').trail) === JSON.stringify(['10.0.12.2', '10.0.2.10']), 'trace: a router tracing lists the next hops, not itself');
    d.R2.exec('int g0/0'); d.R2.exec('shutdown'); A = Net.api(Net.build(net, d)); ok(!A.ping('PC1', '10.0.2.10').ok, 'static: shutdown interface breaks reachability');
  }
  // 2. OSPF adjacency and learned routes, passive interface
  {
    const net = { devices: { R1: { kind: 'router' }, R2: { kind: 'router' }, R3: { kind: 'router' }, PC1: { kind: 'host', ip: '10.0.1.10', mask: '255.255.255.0', gw: '10.0.1.1' }, PC3: { kind: 'host', ip: '10.0.3.10', mask: '255.255.255.0', gw: '10.0.3.1' } },
      links: [ { a: 'PC1', b: 'R1', bp: 'gigabitethernet0/0' }, { a: 'R1', ap: 'gigabitethernet0/1', b: 'R2', bp: 'gigabitethernet0/0' }, { a: 'R2', ap: 'gigabitethernet0/1', b: 'R3', bp: 'gigabitethernet0/0' }, { a: 'R3', ap: 'gigabitethernet0/1', b: 'PC3' } ] };
    const d = devs({ R1: ['en', 'conf t', 'int g0/0', 'ip add 10.0.1.1 255.255.255.0', 'no shut', 'int g0/1', 'ip add 10.0.12.1 255.255.255.0', 'no shut', 'router ospf 1', 'router-id 1.1.1.1', 'network 10.0.0.0 0.0.255.255 area 0', 'passive-interface g0/0'],
      R2: ['en', 'conf t', 'int g0/0', 'ip add 10.0.12.2 255.255.255.0', 'no shut', 'int g0/1', 'ip add 10.0.23.2 255.255.255.0', 'no shut', 'router ospf 1', 'network 10.0.12.0 0.0.0.255 area 0', 'network 10.0.23.0 0.0.0.255 area 0'],
      R3: ['en', 'conf t', 'int g0/0', 'ip add 10.0.23.3 255.255.255.0', 'no shut', 'int g0/1', 'ip add 10.0.3.1 255.255.255.0', 'no shut', 'router ospf 1', 'network 10.0.23.0 0.0.0.255 area 0', 'network 10.0.3.0 0.0.0.255 area 0', 'passive-interface g0/1'] });
    const A = Net.api(Net.build(net, d)); ok(A.ospfNeighbors('R2').length === 2, 'ospf: R2 has two neighbours (' + A.ospfNeighbors('R2').length + ')'); ok(A.ospfNeighbors('R1').length === 1, 'ospf: R1 has one neighbour');
    const r = A.route('R1', '10.0.3.0/24'); ok(r && r.proto === 'O' && r.via === '10.0.12.2', 'ospf: R1 learns 10.0.3.0/24 via R2 (' + JSON.stringify(r) + ')'); ok(A.ping('PC1', '10.0.3.10').ok, 'ospf: end-to-end ping works');
    ok(/1\.1\.1\.1/.test(Show.render(d.R2, 'show ip ospf neighbor', A.state)), 'show ip ospf neighbor lists router-id 1.1.1.1');
    // area mismatch kills adjacency
    d.R3.exec('router ospf 1'); d.R3.exec('no network 10.0.23.0 0.0.0.255 area 0'); const d3 = devs({ R3: ['en', 'conf t', 'int g0/0', 'ip add 10.0.23.3 255.255.255.0', 'no shut', 'int g0/1', 'ip add 10.0.3.1 255.255.255.0', 'no shut', 'router ospf 1', 'network 10.0.23.0 0.0.0.255 area 1', 'network 10.0.3.0 0.0.0.255 area 1'] }); d3.R1 = d.R1; d3.R2 = d.R2; for (const n in d3) d3[n]._all = d3;
    const B = Net.api(Net.build(net, d3)); ok(A.ospfNeighbors('R2').length === 2 && B.ospfNeighbors('R2').length === 1 && B.issues.some(i => i.kind === 'ospf-area-mismatch'), 'ospf: area mismatch → no adjacency + issue reported');
  }
  // 3. standard ACL near destination, extended ACL near source
  {
    const net = { devices: { R1: { kind: 'router' }, PC1: { kind: 'host', ip: '192.168.1.10', mask: '255.255.255.0', gw: '192.168.1.1' }, PC2: { kind: 'host', ip: '192.168.2.10', mask: '255.255.255.0', gw: '192.168.2.1' }, SRV: { kind: 'server', ip: '10.0.1.5', mask: '255.255.255.0', gw: '10.0.1.1' } },
      links: [ { a: 'PC1', b: 'R1', bp: 'gigabitethernet0/0' }, { a: 'PC2', b: 'R1', bp: 'gigabitethernet0/1' }, { a: 'SRV', b: 'R1', bp: 'gigabitethernet0/2' } ] };
    const base = ['en', 'conf t', 'int g0/0', 'ip add 192.168.1.1 255.255.255.0', 'no shut', 'int g0/1', 'ip add 192.168.2.1 255.255.255.0', 'no shut', 'int g0/2', 'ip add 10.0.1.1 255.255.255.0', 'no shut'];
    let d = devs({ R1: base }); let A = Net.api(Net.build(net, d)); ok(A.ping('PC2', '10.0.1.5').ok, 'acl: baseline reachability');
    d.R1.exec('access-list 10 deny 192.168.2.0 0.0.0.255'); d.R1.exec('access-list 10 permit any'); d.R1.exec('int g0/2'); d.R1.exec('ip access-group 10 out'); A = Net.api(Net.build(net, d));
    const p = A.ping('PC2', '10.0.1.5'); ok(!p.ok && /ACL 10/.test(p.reason), 'acl: standard ACL blocks PC2 (' + p.reason + ')'); ok(A.ping('PC1', '10.0.1.5').ok, 'acl: PC1 still permitted');
    d = devs({ R1: base.concat(['ip access-list extended WEB', 'permit tcp 192.168.1.0 0.0.0.255 host 10.0.1.5 eq 80', 'deny ip any any', 'int g0/0', 'ip access-group WEB in']) }); A = Net.api(Net.build(net, d));
    ok(A.tcp('PC1', '10.0.1.5', 80).ok, 'acl: extended permits HTTP'); const t = A.tcp('PC1', '10.0.1.5', 22); ok(!t.ok && /web/i.test(t.reason), 'acl: extended denies SSH (' + t.reason + ')'); ok(!A.ping('PC1', '10.0.1.5').ok, 'acl: extended denies ICMP');
    ok(/deny/.test(Show.render(d.R1, 'show access-lists', A.state)), 'show access-lists renders');
  }
  // 4. NAT: PAT to the internet, static NAT inbound
  {
    const net = { devices: { R1: { kind: 'router' }, ISP: { kind: 'cloud', ip: '203.0.113.1', mask: '255.255.255.252', internet: true }, PC1: { kind: 'host', ip: '192.168.1.10', mask: '255.255.255.0', gw: '192.168.1.1' }, SRV: { kind: 'server', ip: '192.168.1.50', mask: '255.255.255.0', gw: '192.168.1.1' } },
      links: [ { a: 'PC1', b: 'R1', bp: 'gigabitethernet0/0' }, { a: 'SRV', b: 'R1', bp: 'gigabitethernet0/0' }, { a: 'R1', ap: 'gigabitethernet0/1', b: 'ISP' } ] };
    const base = ['en', 'conf t', 'int g0/0', 'ip add 192.168.1.1 255.255.255.0', 'no shut', 'int g0/1', 'ip add 203.0.113.2 255.255.255.252', 'no shut', 'ip route 0.0.0.0 0.0.0.0 203.0.113.1'];
    let d = devs({ R1: base }); let A = Net.api(Net.build(net, d)); const p0 = A.ping('PC1', '8.8.8.8'); ok(!p0.ok && /private/.test(p0.reason), 'nat: ISP drops private source without NAT (' + p0.reason + ')');
    d.R1.exec('access-list 1 permit 192.168.1.0 0.0.0.255'); d.R1.exec('ip nat inside source list 1 interface g0/1 overload'); d.R1.exec('int g0/0'); d.R1.exec('ip nat inside'); d.R1.exec('int g0/1'); d.R1.exec('ip nat outside'); A = Net.api(Net.build(net, d));
    const p1 = A.ping('PC1', '8.8.8.8'); ok(p1.ok && p1.nat.length && p1.nat[0].global === '203.0.113.2', 'nat: PAT translates and ping works (' + p1.reason + ')');
    const p15 = A.ping('ISP', '203.0.113.3'); ok(!p15.ok, 'nat: an unmapped address on the provider link answers nothing (' + p15.reason + ')');
    d.R1.exec('ip nat inside source static 192.168.1.50 203.0.113.3'); A = Net.api(Net.build(net, d)); const p2 = A.ping('ISP', '203.0.113.3'); ok(p2.ok, 'nat: static NAT reachable from outside (' + p2.reason + ')');
    ok(p2.dst === 'SRV' && p2.path.some(p => p.act === 'NAT 203.0.113.3 → 192.168.1.50') && p2.path.some(p => p.act === 'NAT 192.168.1.50 → 203.0.113.3'), 'nat: the internet hands the static address to R1, and the server\'s answer leaves translated (' + JSON.stringify(p2.path) + ')');
  }
  // 5. VLANs, trunk, router-on-a-stick, DHCP with snooping and a rogue
  {
    const net = { devices: { R1: { kind: 'router' }, SW1: { kind: 'switch', mac: '0001.9642.a3c0' }, PC1: { kind: 'host', dhcp: true }, PC2: { kind: 'host', ip: '10.0.20.10', mask: '255.255.255.0', gw: '10.0.20.1' }, ROGUE: { kind: 'rogue', role: 'dhcp', offer: { gw: '10.0.10.254', ip: '10.0.10.200', mask: '255.255.255.0' } } },
      links: [ { a: 'R1', ap: 'gigabitethernet0/0', b: 'SW1', bp: 'gigabitethernet0/1' }, { a: 'SW1', ap: 'fastethernet0/1', b: 'PC1' }, { a: 'SW1', ap: 'fastethernet0/2', b: 'PC2' }, { a: 'SW1', ap: 'fastethernet0/7', b: 'ROGUE' } ] };
    const d = devs({ R1: ['en', 'conf t', 'int g0/0', 'no shut', 'int g0/0.10', 'encapsulation dot1q 10', 'ip add 10.0.10.1 255.255.255.0', 'int g0/0.20', 'encapsulation dot1q 20', 'ip add 10.0.20.1 255.255.255.0', 'ip dhcp excluded-address 10.0.10.1 10.0.10.9', 'ip dhcp pool V10', 'network 10.0.10.0 255.255.255.0', 'default-router 10.0.10.1', 'dns-server 8.8.8.8'],
      SW1: ['en', 'conf t', 'vlan 10,20', 'int f0/1', 'switchport mode access', 'switchport access vlan 10', 'int f0/2', 'switchport mode access', 'switchport access vlan 20', 'int f0/7', 'switchport mode access', 'switchport access vlan 10', 'int g0/1', 'switchport mode trunk'] });
    let A = Net.api(Net.build(net, d)); ok(A.trunk('SW1', 'g0/1'), 'l2: trunk formed'); ok(A.ping('PC2', '10.0.20.1').ok, 'l2: PC2 reaches subinterface gateway');
    ok(A.hosts.PC1.rogue === true, 'dhcp: rogue wins the lease without snooping (' + JSON.stringify(A.hosts.PC1.lease) + ')');
    d.SW1.exec('ip dhcp snooping'); d.SW1.exec('ip dhcp snooping vlan 10'); d.SW1.exec('int g0/1'); d.SW1.exec('ip dhcp snooping trust'); A = Net.api(Net.build(net, d));
    ok(A.hosts.PC1.rogue === false && A.hosts.PC1.ip === '10.0.10.10' && A.hosts.PC1.gw === '10.0.10.1', 'dhcp: with snooping the router lease wins, first free after exclusions (' + A.hosts.PC1.ip + ')');
    ok(A.ping('PC1', '10.0.20.10').ok, 'l3: inter-VLAN routing works end to end');
    ok(/10\.0\.10\.10/.test(Show.render(d.R1, 'show ip dhcp binding', A.state)), 'show ip dhcp binding lists the lease');
  }
  // 6. port security shutdown vs restrict; DAI
  {
    const net = { devices: { SW1: { kind: 'switch', mac: '0001.9642.a3c0' }, R1: { kind: 'router' }, PC1: { kind: 'host', ip: '10.0.1.10', mask: '255.255.255.0', gw: '10.0.1.1' }, ATK: { kind: 'host', ip: '10.0.1.66', mask: '255.255.255.0', gw: '10.0.1.1', flood: 50, arpspoof: true } },
      links: [ { a: 'R1', ap: 'gigabitethernet0/0', b: 'SW1', bp: 'gigabitethernet0/1' }, { a: 'SW1', ap: 'fastethernet0/1', b: 'PC1' }, { a: 'SW1', ap: 'fastethernet0/9', b: 'ATK' } ] };
    const d = devs({ R1: ['en', 'conf t', 'int g0/0', 'ip add 10.0.1.1 255.255.255.0', 'no shut'], SW1: ['en', 'conf t', 'int f0/9', 'switchport port-security', 'switchport port-security maximum 2'] });
    let A = Net.api(Net.build(net, d)); ok(A.portsec('SW1', 'f0/9').rejected, 'portsec: rejected without access mode');
    d.SW1.exec('int f0/9'); d.SW1.exec('switchport mode access'); A = Net.api(Net.build(net, d)); ok(A.errdisabled('SW1', 'f0/9') && !A.ping('ATK', '10.0.1.1').ok, 'portsec: flood → err-disabled, attacker cut off');
    d.SW1.exec('switchport port-security violation restrict'); A = Net.api(Net.build(net, d)); ok(!A.errdisabled('SW1', 'f0/9') && A.portsec('SW1', 'f0/9').violations === 48, 'portsec: restrict keeps port up and counts violations (' + A.portsec('SW1', 'f0/9').violations + ')');
    ok(A.threats.arpspoof && !A.threats.arpspoof.blocked, 'dai: spoofing not blocked without DAI');
    d.SW1.exec('exit'); d.SW1.exec('ip dhcp snooping'); d.SW1.exec('ip dhcp snooping vlan 1'); d.SW1.exec('ip arp inspection vlan 1'); d.SW1.exec('int g0/1'); d.SW1.exec('ip arp inspection trust'); A = Net.api(Net.build(net, d)); ok(A.threats.arpspoof.blocked, 'dai: enabled on VLAN → spoof dropped');
  }
  // 7. HSRP active election, EtherChannel, SSH readiness, IPv6
  {
    const net = { devices: { R1: { kind: 'router' }, R2: { kind: 'router' }, SW1: { kind: 'switch', mac: '0001.9642.a3c0' }, SW2: { kind: 'switch', mac: '0002.9642.a3c0' }, PC1: { kind: 'host', ip: '10.0.1.10', mask: '255.255.255.0', gw: '10.0.1.254' } },
      links: [ { a: 'R1', ap: 'gigabitethernet0/0', b: 'SW1', bp: 'gigabitethernet0/1' }, { a: 'R2', ap: 'gigabitethernet0/0', b: 'SW1', bp: 'gigabitethernet0/2' }, { a: 'SW1', ap: 'fastethernet0/1', b: 'PC1' }, { a: 'SW1', ap: 'gigabitethernet0/3', b: 'SW2', bp: 'gigabitethernet0/1' }, { a: 'SW1', ap: 'gigabitethernet0/4', b: 'SW2', bp: 'gigabitethernet0/2' } ] };
    const d = devs({ R1: ['en', 'conf t', 'hostname R1', 'int g0/0', 'ip add 10.0.1.1 255.255.255.0', 'no shut', 'standby 1 ip 10.0.1.254', 'standby 1 priority 110', 'standby 1 preempt', 'exit', 'ip domain-name watson.local', 'crypto key generate rsa modulus 2048', 'username admin secret pw', 'line vty 0 4', 'transport input ssh', 'login local', 'exit', 'ipv6 unicast-routing', 'int g0/0', 'ipv6 address 2001:db8:1::1/64'],
      R2: ['en', 'conf t', 'int g0/0', 'ip add 10.0.1.2 255.255.255.0', 'no shut', 'standby 1 ip 10.0.1.254'], SW1: ['en', 'conf t', 'int range g0/3 - 4', 'channel-group 1 mode active', 'switchport mode trunk'], SW2: ['en', 'conf t', 'int range g0/1 - 2', 'channel-group 1 mode passive', 'switchport mode trunk'] });
    const A = Net.api(Net.build(net, d)); ok(A.hsrpActive('10.0.1.254') === 'R1', 'hsrp: R1 active by priority'); ok(A.ping('PC1', '10.0.1.254').ok, 'hsrp: VIP answers');
    ok(Object.keys(A.bundles).length === 1, 'etherchannel: LACP bundle formed'); ok(A.sshReady('R1').ok, 'ssh: R1 ready (' + JSON.stringify(A.sshReady('R1')) + ')'); ok(!A.sshReady('R2').ok, 'ssh: R2 not ready');
    ok(A.state.tables6.R1.some(e => e.prefix === '2001:db8:1::' && e.len === 64), 'ipv6: connected v6 route (' + JSON.stringify(A.state.tables6.R1) + ')'); ok(/Po1/.test(Show.render(d.SW1, 'show etherchannel summary', A.state)), 'show etherchannel summary renders');
    ok(/Active/.test(Show.render(d.R1, 'show standby brief', A.state)), 'show standby brief renders');
  }
  // 8. config parser basics + normalize abbreviations
  {
    const d = dev('R9', 'ios', ['en', 'conf t', 'ho R9', 'int g0/0', 'ip add 1.1.1.1 255.255.255.0', 'no shut', 'ip access-list standard ONLY', '10 permit host 1.1.1.5', 'exit', 'ip route 0.0.0.0 0.0.0.0 1.1.1.254']); const c = NetConfig.parse(d);
    ok(c.hostname === 'R9', 'config: hostname'); ok(c.interfaces['gigabitethernet0/0'] && c.interfaces['gigabitethernet0/0'].ip === '1.1.1.1', 'config: interface ip via abbreviations'); ok(c.acls.only && c.acls.only.entries[0].src === '1.1.1.5', 'config: named ACL entry (names are lowercased by the console)'); ok(c.routes.length === 1 && c.routes[0].via === '1.1.1.254', 'config: static route');
  }
  // 9. the shell: running-config from the config (last one wins, no removes), password encryption, the enable prompt, startup-config, pipes, help
  {
    const d = new Sim.Device('R1', { kind: 'ios' }); const run = () => { const n = d.out.length; d.exec('do show running-config'); return d.out.slice(n).map(o => o.s).join('\n'); };
    const last = () => d.out[d.out.length - 1].s;
    d.exec('?'); ok(/enable\s+Turn on privileged commands/.test(last()), 'shell: ? lists the user EXEC commands');
    d.exec('enable'); d.exec('show startup-config'); ok(/startup-config is not present/.test(last()), 'shell: no startup-config before a save');
    d.exec('configure terminal'); d.exec('hostname NB-R1'); d.exec('hostname KB-R1'); d.exec('enable password noodles');
    let t = run(); ok((t.match(/hostname/g) || []).length === 1 && /hostname KB-R1/.test(t), 'shell: hostname appears once, the last one typed');
    ok(/enable password noodles/.test(t) && /no service password-encryption/.test(t), 'shell: enable password in plain text before encryption');
    d.exec('service password-encryption'); t = run(); ok(/enable password 7 [0-9A-F]{4,}/.test(t) && !/noodles/.test(t), 'shell: service password-encryption shows type 7');
    d.exec('no service password-encryption'); t = run(); ok(/enable password 7 /.test(t) && /no service password-encryption/.test(t), 'shell: removing encryption does not decrypt existing passwords');
    d.exec('enable secret broth'); t = run(); ok(/enable secret 5 \$1\$/.test(t) && !/broth/.test(t), 'shell: enable secret shows as type 5');
    d.exec('do show running-config | include enable'); ok(last().split('\n').every(l => /enable/.test(l)) && last().split('\n').length === 2, 'shell: | include filters the lines (' + last() + ')');
    d.exec('end'); d.exec('disable'); d.exec('enable'); ok(d.pending === 'enable' && d.prompt() === 'Password:', 'shell: enable asks for the password once one is set');
    d.exec('noodles'); ok(d.mode === 'user', 'shell: the enable password is ignored when a secret exists'); d.exec('broth'); ok(d.mode === 'priv', 'shell: the secret opens privileged EXEC');
    ok(!d.lines.some(r => r.line === 'broth' || r.line === 'noodles'), 'shell: typed passwords are not recorded');
    d.exec('copy running-config startup-config'); d.exec('show startup-config'); ok(/hostname KB-R1/.test(last()) && /Using \d+ out of/.test(last()), 'shell: write saves the running-config to startup');
  }
  // 10. learning (net.learn): MAC tables and ARP caches fill only from pings typed in a shell; checks never teach the network
  {
    const net = { learn: true, devices: { SW1: { kind: 'switch' }, SW2: { kind: 'switch' }, R1: { kind: 'router' }, PC1: { kind: 'host', ip: '10.0.0.11', mask: '255.255.255.0', gw: '10.0.0.1', mac: '00d0.bc11.1111' }, PC3: { kind: 'host', ip: '10.0.0.13', mask: '255.255.255.0', gw: '10.0.0.1', mac: '0060.2f33.3333' }, SRV: { kind: 'host', ip: '10.9.0.5', mask: '255.255.255.0', gw: '10.9.0.1' } },
      links: [ { a: 'SW1', ap: 'fastethernet0/1', b: 'PC1' }, { a: 'SW1', ap: 'gigabitethernet0/1', b: 'SW2', bp: 'gigabitethernet0/1' }, { a: 'SW2', ap: 'fastethernet0/3', b: 'PC3' }, { a: 'R1', ap: 'gigabitethernet0/0', b: 'SW1', bp: 'gigabitethernet0/2' }, { a: 'R1', ap: 'gigabitethernet0/1', b: 'SRV' } ] };
    const d = {}; let cache = null, key = null; const st = () => { const k = Object.values(d).map(x => x.lines.length).join(); if (k !== key) { cache = Net.build(net, d); key = k; } return cache; };
    ['SW1', 'SW2', 'R1'].forEach(n => { d[n] = new Sim.Device(n, { kind: 'ios', netState: st }); }); d.PC1 = new Sim.Device('PC1', { kind: 'host', netState: st }); for (const n in d) d[n]._all = d;
    d.R1.preload(['int g0/0', 'ip add 10.0.0.1 255.255.255.0', 'no shut', 'int g0/1', 'ip add 10.9.0.1 255.255.255.0', 'no shut']);
    const last = n => d[n].out[d[n].out.length - 1].s;
    ok(Net.api(st()).macTable('SW1').length === 0, 'learn: the MAC table starts empty');
    ok(Net.api(st()).ping('PC1', '10.0.0.13').ok && Net.api(st()).macTable('SW1').length === 0, 'learn: a check\'s ping teaches the network nothing');
    d.PC1.exec('ping 10.0.0.13', d); ok(/Request timed out[\s\S]*Received = 3, Lost = 1/.test(last('PC1')), 'learn: the first ping loses one packet to ARP');
    const t1 = Net.api(st()).macTable('SW1'); ok(t1.some(r => r.mac === '00d0.bc11.1111' && r.port === 'fastethernet0/1') && t1.some(r => r.mac === '0060.2f33.3333' && r.port === 'gigabitethernet0/1'), 'learn: SW1 learns both sources on the right ports (' + JSON.stringify(t1) + ')');
    ok(Net.api(st()).macTable('SW2').some(r => r.mac === '00d0.bc11.1111' && r.port === 'gigabitethernet0/1'), 'learn: SW2 learns PC1 on its uplink');
    d.PC1.exec('ping 10.0.0.13', d); ok(/Received = 4, Lost = 0/.test(last('PC1')), 'learn: the second ping loses nothing');
    d.PC1.exec('arp -a', d); ok(/10\.0\.0\.13\s+00-60-2f-33-33-33/.test(last('PC1')), 'learn: arp -a shows the learned neighbour');
    d.SW1.exec('enable'); d.SW1.exec('clear mac address-table dynamic'); ok(Net.api(st()).macTable('SW1').length === 0 && Net.api(st()).macTable('SW2').length > 0, 'learn: clear mac address-table dynamic empties only that switch');
    d.PC1.exec('ping 10.9.0.5', d); d.R1.exec('enable'); d.R1.exec('show arp'); ok(/10\.0\.0\.11\s+0\s+00d0\.bc11\.1111/.test(last('R1')) && /10\.9\.0\.5/.test(last('R1')), 'learn: the router learns both sides of a routed ping (' + last('R1') + ')');
    d.PC1.exec('arp -d', d); d.PC1.exec('arp -a', d); ok(/No ARP Entries/.test(last('PC1')), 'learn: arp -d clears the PC cache');
  }
  // 11. speed and duplex negotiation: auto/auto is full; a hard-coded end makes the auto end fall back to half at 100; speeds must match
  {
    const net = { devices: { SW1: { kind: 'switch' }, SW2: { kind: 'switch' } }, links: [ { a: 'SW1', ap: 'fastethernet0/10', b: 'SW2', bp: 'fastethernet0/1' } ] };
    const mk = (a, b) => ({ SW1: dev('SW1', 'ios', ['en', 'conf t', 'int f0/10'].concat(a)), SW2: dev('SW2', 'ios', ['en', 'conf t', 'int f0/1'].concat(b)) });
    let d = mk([], []); let A = Net.api(Net.build(net, d)); const i1 = A.iface('SW1', 'f0/10');
    ok(i1.op.speed === 100 && i1.op.duplex === 'full' && i1.op.autoDuplex && !A.issues.length, 'nego: auto on both ends gives 100/full (' + JSON.stringify(i1.op) + ')');
    d = mk(['speed 100', 'duplex full'], []); A = Net.api(Net.build(net, d));
    ok(A.iface('SW2', 'f0/1').op.duplex === 'half' && A.issues.some(x => x.kind === 'duplex-mismatch'), 'nego: a hard-coded end leaves the auto end at half duplex, a mismatch');
    ok(/a-half\s+a-100/.test(Show.render(d.SW2, 'show interfaces status', A.state)), 'nego: show interfaces status marks negotiated values with a-');
    ok(/[1-9]\d* CRC/.test(Show.render(d.SW1, 'show interfaces f0/10', A.state)) && /[1-9]\d* late collision/.test(Show.render(d.SW2, 'show interfaces f0/1', A.state)), 'nego: the full end counts CRC errors and the half end late collisions');
    d = mk(['speed 100', 'duplex full'], ['speed 100', 'duplex full']); A = Net.api(Net.build(net, d)); ok(!A.issues.length && / 0 CRC/.test(Show.render(d.SW1, 'show interfaces f0/10', A.state)), 'nego: matching hard-coded ends are clean');
    d = mk(['speed 100'], ['speed 10']); A = Net.api(Net.build(net, d)); ok(!A.up('SW1', 'f0/10') && A.issues.some(x => x.kind === 'speed-mismatch'), 'nego: different hard-coded speeds keep the link down');
  }
  // 12. a routing loop: traceroute repeats the two routers to hop 30, a PC ping reports TTL expired in transit
  {
    const net = { devices: { R1: { kind: 'router' }, R2: { kind: 'router' }, PC1: { kind: 'host', ip: '10.0.1.10', mask: '255.255.255.0', gw: '10.0.1.1' } },
      links: [ { a: 'PC1', b: 'R1', bp: 'gigabitethernet0/0' }, { a: 'R1', ap: 'gigabitethernet0/1', b: 'R2', bp: 'gigabitethernet0/1' } ] };
    const d = devs({ R1: ['en', 'conf t', 'int g0/0', 'ip add 10.0.1.1 255.255.255.0', 'no shut', 'int g0/1', 'ip add 10.0.12.1 255.255.255.252', 'no shut', 'ip route 10.9.0.0 255.255.255.0 10.0.12.2'],
      R2: ['en', 'conf t', 'int g0/1', 'ip add 10.0.12.2 255.255.255.252', 'no shut', 'ip route 10.9.0.0 255.255.255.0 10.0.12.1'] });
    const A = Net.api(Net.build(net, d)); const r = A.ping('PC1', '10.9.0.5'); const lines = Net.traceLines(r, 'pc');
    ok(!r.ok && /loop/.test(r.reason) && lines.length === 30 && /10\.0\.12\.2$/.test(lines[1]) && /10\.0\.12\.1$/.test(lines[2]) && /10\.0\.12\.2$/.test(lines[29]), 'loop: tracert bounces between the two routers to hop 30 (' + lines.slice(0, 4).join(' | ') + ')');
    const pc = new Sim.Device('PC1', { kind: 'host', netState: () => A.state }); pc.exec('ping 10.9.0.5'); ok(/TTL expired in transit/.test(pc.out.map(o => o.s).join('\n')), 'loop: ping reports TTL expired in transit');
  }
  // 13. static routes three ways (next hop, exit interface with proxy ARP, both), local routes, IOS layout of show ip route
  {
    const net = { devices: { R1: { kind: 'router' }, R2: { kind: 'router' }, PC1: { kind: 'host', ip: '10.0.1.10', mask: '255.255.255.0', gw: '10.0.1.1' }, PC2: { kind: 'host', ip: '10.0.2.10', mask: '255.255.255.0', gw: '10.0.2.1' } },
      links: [ { a: 'PC1', b: 'R1', bp: 'gigabitethernet0/0' }, { a: 'R1', ap: 'gigabitethernet0/1', b: 'R2', bp: 'gigabitethernet0/1' }, { a: 'R2', ap: 'gigabitethernet0/0', b: 'PC2' } ] };
    const base1 = ['en', 'conf t', 'int g0/0', 'ip add 10.0.1.1 255.255.255.0', 'no shut', 'int g0/1', 'ip add 10.0.12.1 255.255.255.252', 'no shut', 'exit'], base2 = ['en', 'conf t', 'int g0/0', 'ip add 10.0.2.1 255.255.255.0', 'no shut', 'int g0/1', 'ip add 10.0.12.2 255.255.255.252', 'no shut', 'exit', 'ip route 10.0.1.0 255.255.255.0 10.0.12.1'];
    let d = devs({ R1: base1.concat(['ip route 10.0.2.0 255.255.255.0 g0/1']), R2: base2 }); let A = Net.api(Net.build(net, d)); let r = A.route('R1', '10.0.2.0/24');
    ok(r && r.iface === 'gigabitethernet0/1' && !r.via && A.ping('PC1', '10.0.2.10').ok, 'static: exit-interface route works through proxy ARP (' + JSON.stringify(r) + ')');
    ok(/S\s+10\.0\.2\.0\/24 is directly connected, GigabitEthernet0\/1/.test(Show.render(d.R1, 'show ip route', A.state)), 'static: an exit-interface route shows as directly connected');
    d = devs({ R1: base1.concat(['ip route 10.0.2.0 255.255.255.0 g0/1 10.0.12.2 5']), R2: base2 }); A = Net.api(Net.build(net, d)); r = A.route('R1', '10.0.2.0/24');
    ok(r && r.via === '10.0.12.2' && r.iface === 'gigabitethernet0/1' && r.ad === 5 && A.ping('PC1', '10.0.2.10').ok, 'static: exit interface plus next hop, with an AD (' + JSON.stringify(r) + ')');
    const txt = Show.render(d.R1, 'show ip route', A.state); ok(/L\s+10\.0\.1\.1\/32 is directly connected/.test(txt) && /10\.0\.0\.0\/8 is variably subnetted/.test(txt) && /\[5\/0\] via 10\.0\.12\.2, GigabitEthernet0\/1/.test(txt), 'show ip route: local /32 routes and classful headers');
    d.R1.exec('no ip route 10.0.2.0 255.255.255.0 g0/1 10.0.12.2'); A = Net.api(Net.build(net, d)); ok(!A.route('R1', '10.0.2.0/24'), 'static: no ip route removes an exit-interface route');
    d.R1.exec('ip route 10.0.2.0 255.255.255.0 10.0.12.2'); d.R1.exec('int g0/1'); d.R1.exec('shutdown'); A = Net.api(Net.build(net, d)); ok(!A.route('R1', '10.0.2.0/24'), 'static: the route leaves the table when its interface goes down');
  }
  // 14. copy over TFTP and FTP: the questions IOS asks, the file landing in flash, FTP logins, boot system, a config backup
  {
    const img = 'c2900-universalk9-mz.spa.155-3.m4a.bin';
    const net = { devices: { R1: { kind: 'router' }, SW1: { kind: 'switch', mac: '0001.4300.0001' }, SRV1: { kind: 'server', ip: '10.0.43.100', mask: '255.255.255.0', gw: '10.0.43.1', files: [{ name: img, size: 97794040 }], ftp: { user: 'shell', pass: 'keys' } } },
      links: [ { a: 'R1', ap: 'gigabitethernet0/0', b: 'SW1', bp: 'gigabitethernet0/1' }, { a: 'SW1', ap: 'fastethernet0/1', b: 'SRV1' } ] };
    const d = devs({ R1: ['en', 'conf t', 'int g0/0', 'ip add 10.0.43.1 255.255.255.0', 'no shut', 'end'], SW1: [] }); let S = Net.build(net, d); d.R1._netState = () => (S = Net.build(net, d));
    const R1 = d.R1; const said = () => R1.out.map(o => o.s).join('\n');
    R1.exec('copy tftp: flash:'); ok(R1.ask && R1.prompt() === 'Address or name of remote host []? ', 'copy: asks for the remote host');
    R1.exec('10.0.43.100'); ok(R1.prompt() === 'Source filename []? ', 'copy: asks for the source file'); R1.exec(img.toUpperCase()); ok(R1.prompt() === 'Destination filename [' + img + ']? ', 'copy: offers the source name as the destination');
    R1.exec(''); ok(!R1.ask && R1.prompt() === 'R1#' && (R1.flash || []).some(f => f.name === img) && /\[OK - 97794040 bytes\]/.test(said()), 'copy: TFTP download lands in flash');
    ok(new RegExp(img.replace(/\./g, '\\.')).test(Show.render(R1, 'show flash', S)) && /c2900-universalk9-mz\.SPA\.151-4\.M4\.bin/.test(Show.render(R1, 'show flash:', S)), 'show flash lists the old image and the new one');
    ok(/network\s+rw\s+tftp:/.test(Show.render(R1, 'show file systems', S)) && /disk\s+rw\s+flash:/.test(Show.render(R1, 'show file systems', S)), 'show file systems lists disk and network types');
    const n0 = R1.out.length; R1.exec('copy ftp://10.0.43.100/' + img + ' flash:'); R1.exec(''); ok(/Incorrect Login\/Password/.test(R1.out.slice(n0).map(o => o.s).join('\n')), 'copy: FTP refuses a box with no matching ip ftp username/password');
    R1.exec('conf t'); R1.exec('ip ftp username shell'); R1.exec('ip ftp password keys'); R1.exec('boot system flash:' + img); R1.exec('end');
    const n1 = R1.out.length; R1.exec('copy ftp://10.0.43.100/' + img + ' flash:'); R1.exec(''); ok(/\[OK - 97794040 bytes\]/.test(R1.out.slice(n1).map(o => o.s).join('\n')), 'copy: FTP works once the login matches');
    const c = NetConfig.parse(R1); ok(c.ftpUser === 'shell' && c.ftpPass === 'keys' && (c.bootSystem || [])[0] === img, 'config: ip ftp username/password and boot system are parsed');
    R1.exec('copy tftp: flash:'); R1.exec('10.0.43.100'); R1.exec('missing.bin'); R1.exec(''); ok(/No such file/.test(said()), 'copy: a file the server does not have fails');
    R1.exec('copy running-config tftp:'); R1.exec('10.0.43.100'); ok(R1.prompt() === 'Destination filename [r1-confg]? ', 'copy: a config backup offers hostname-confg'); R1.exec('');
    ok((R1.sent || []).some(x => x.file === 'r1-confg' && x.what === 'running-config' && x.proto === 'tftp') && R1.lines.some(r => r.line === 'copy running-config tftp://10.0.43.100/r1-confg'), 'copy: the running-config goes to the TFTP server and is recorded');
    R1.exec('copy tftp: flash:'); R1.exec('10.0.43.99'); R1.exec(img); R1.exec(''); ok(/Timed out/.test(said()), 'copy: an address nobody answers times out');
  }
  // 15. NAT as the shell shows it: pings from PCs fill the table, a dynamic pool holds one address per host and runs out,
  //     clear ip nat translation * frees it, a new statement for the same list replaces the old one, PAT keeps ports apart
  {
    const net = { devices: { R1: { kind: 'router' }, SW1: { kind: 'switch', mac: '0001.4500.0001' }, ISP: { kind: 'cloud', ip: '203.0.113.1', mask: '255.255.255.248', internet: true },
      PC1: { kind: 'host', ip: '192.168.45.11', mask: '255.255.255.0', gw: '192.168.45.1' }, PC2: { kind: 'host', ip: '192.168.45.12', mask: '255.255.255.0', gw: '192.168.45.1' }, PC3: { kind: 'host', ip: '192.168.45.13', mask: '255.255.255.0', gw: '192.168.45.1' } },
      links: [ { a: 'R1', ap: 'gigabitethernet0/0', b: 'SW1', bp: 'gigabitethernet0/1' }, { a: 'SW1', ap: 'fastethernet0/1', b: 'PC1' }, { a: 'SW1', ap: 'fastethernet0/2', b: 'PC2' }, { a: 'SW1', ap: 'fastethernet0/3', b: 'PC3' }, { a: 'R1', ap: 'gigabitethernet0/1', b: 'ISP' } ] };
    const d = devs({ R1: ['en', 'conf t', 'int g0/0', 'ip add 192.168.45.1 255.255.255.0', 'no shut', 'ip nat inside', 'int g0/1', 'ip add 203.0.113.2 255.255.255.248', 'no shut', 'ip nat outside', 'exit', 'ip route 0.0.0.0 0.0.0.0 203.0.113.1',
      'access-list 1 permit 192.168.45.0 0.0.0.255', 'ip nat pool bowls 203.0.113.3 203.0.113.4 netmask 255.255.255.248', 'ip nat inside source list 1 pool bowls', 'ip nat inside source static 192.168.45.50 203.0.113.6', 'end'], SW1: [] });
    const st = () => Net.build(net, d); for (const n of ['PC1', 'PC2', 'PC3']) { d[n] = new Sim.Device(n, { kind: 'host', netState: st }); d[n]._all = d; } d.R1._netState = st;
    const say = (n, c) => { const k = d[n].out.length; d[n].exec(c, d); return d[n].out.slice(k).map(o => o.s).join('\n'); };
    ok(/Reply from 8\.8\.8\.8/.test(say('PC1', 'ping 8.8.8.8')) && (d.R1._natSeen || []).length === 1, 'nat: a PC ping fills the router\'s translation table');
    say('PC2', 'ping 8.8.8.8'); const g = d.R1._natSeen.map(t => t.global); ok(g[0] === '203.0.113.3' && g[1] === '203.0.113.4', 'nat: the dynamic pool hands each host its own address (' + g.join(', ') + ')');
    say('PC1', 'ping 8.8.4.4'); ok(d.R1._natSeen.filter(t => t.inside === '192.168.45.11').every(t => t.global === '203.0.113.3'), 'nat: a host keeps its pool address for its next ping');
    ok(/no global address/.test(say('PC3', 'ping 8.8.8.8')), 'nat: the third host finds the pool empty and the packet is dropped');
    const tr = Show.render(d.R1, 'show ip nat translations', st()); ok(/---\s+203\.0\.113\.6\s+192\.168\.45\.50/.test(tr) && /icmp\s+203\.0\.113\.3:1\s+192\.168\.45\.11:1\s+8\.8\.8\.8:1\s+8\.8\.8\.8:1/.test(tr), 'show ip nat translations: static mapping and the outside address, local and global the same (' + tr + ')');
    d.R1.exec('clear ip nat translation *'); ok(!d.R1._natSeen.length && /203\.0\.113\.6/.test(Show.render(d.R1, 'show ip nat translations', st())), 'nat: clear ip nat translation * empties the dynamic entries, static stays');
    ok(/Reply from/.test(say('PC3', 'ping 8.8.8.8')), 'nat: after the clear the pool has room again');
    d.R1.exec('conf t'); d.R1.exec('ip nat inside source list 1 pool bowls overload'); d.R1.exec('end'); ok(NetConfig.parse(d.R1).natDynamic.length === 1 && NetConfig.parse(d.R1).natDynamic[0].overload, 'nat: a new statement for list 1 replaces the old one');
    ok(/Reply from/.test(say('PC1', 'ping 8.8.8.8')) && /Reply from/.test(say('PC2', 'ping 8.8.8.8')), 'nat: with overload every host gets out');
    const pat = d.R1._natSeen.filter(t => t.kind === 'pat'); ok(pat.length >= 2 && new Set(pat.map(t => t.global + ':' + t.gport)).size === pat.length, 'nat: PAT gives each host its own port on the shared address');
    const run = d.R1.exec('show running-config') || d.R1.out[d.R1.out.length - 1].s; ok((run.match(/ip nat inside source list 1/g) || []).length === 1, 'running-config shows one statement for list 1');
  }
  // 16. voice VLANs: a phone (voice: true) joins the port's voice VLAN, the PC stays in the access VLAN; show interfaces X switchport
  {
    const net = { devices: { R1: { kind: 'router' }, SW1: { kind: 'switch', mac: '0001.4600.0001' }, PH1: { kind: 'host', voice: true, ip: '10.46.11.21', mask: '255.255.255.0', gw: '10.46.11.1' }, PC1: { kind: 'host', ip: '10.46.10.21', mask: '255.255.255.0', gw: '10.46.10.1' } },
      links: [ { a: 'R1', ap: 'gigabitethernet0/0', b: 'SW1', bp: 'gigabitethernet0/1' }, { a: 'SW1', ap: 'fastethernet0/1', b: 'PH1' }, { a: 'SW1', ap: 'fastethernet0/2', b: 'PC1' } ] };
    const d = devs({ R1: ['en', 'conf t', 'int g0/0', 'no shut', 'int g0/0.10', 'encapsulation dot1q 10', 'ip add 10.46.10.1 255.255.255.0', 'int g0/0.11', 'encapsulation dot1q 11', 'ip add 10.46.11.1 255.255.255.0'],
      SW1: ['en', 'conf t', 'vlan 10', 'name data', 'vlan 11', 'name voice', 'int g0/1', 'switchport mode trunk', 'int range f0/1 - 2', 'switchport mode access', 'switchport access vlan 10'] });
    let A = Net.api(Net.build(net, d)); ok(!A.ping('PH1', '10.46.11.1').ok && A.ping('PC1', '10.46.10.1').ok, 'voice: with no voice VLAN the phone sits in the data VLAN and cannot reach its gateway');
    d.SW1.exec('int f0/1'); d.SW1.exec('switchport voice vlan 11'); d.SW1.exec('power inline police'); A = Net.api(Net.build(net, d)); ok(A.ping('PH1', '10.46.11.1').ok && A.ping('PC1', '10.46.10.1').ok, 'voice: switchport voice vlan puts the phone in VLAN 11');
    const c = NetConfig.parse(d.SW1).interfaces['fastethernet0/1']; ok(c.voiceVlan === 11 && c.powerPolice === 'errdisable', 'config: voice vlan and power inline police parsed');
    const t = Show.render(d.SW1, 'show interfaces f0/1 switchport', A.state); ok(/Access Mode VLAN: 10 \(data\)/.test(t) && /Voice VLAN: 11 \(voice\)/.test(t) && /Administrative Mode: static access/.test(t), 'show interfaces switchport shows the access and voice VLANs (' + t + ')');
  }
  // 17. QoS (MQC): class-map and policy-map sub-modes, the parsed policy, service-policy and trust, running-config nesting, the show commands
  {
    const net = { devices: { R1: { kind: 'router' }, SW1: { kind: 'switch', mac: '0001.4700.0001' } }, links: [ { a: 'R1', ap: 'gigabitethernet0/0', b: 'SW1', bp: 'gigabitethernet0/1' } ] };
    const d = devs({ R1: ['en', 'conf t', 'class-map match-any VOICE', 'match dscp ef', 'class-map match-any WEB', 'match protocol https', 'policy-map MARK', 'class WEB', 'set dscp af31', 'exit', 'exit',
      'policy-map WAN-OUT', 'class VOICE', 'priority percent 20', 'class class-default', 'fair-queue', 'police 8000000 conform-action transmit exceed-action drop', 'exit', 'exit', 'int g0/0', 'service-policy output WAN-OUT', 'service-policy input MARK', 'end'],
      SW1: ['en', 'conf t', 'int f0/1', 'mls qos trust device cisco-phone', 'mls qos trust cos'] });
    ok(d.R1.mode === 'priv', 'qos: the sub-modes unwind with exit and end');
    const q = NetConfig.parse(d.R1).qos; const wan = q.policyMaps['wan-out'];
    ok(q.classMaps.voice && q.classMaps.voice.type === 'match-any' && q.classMaps.voice.matches[0] === 'dscp ef' && q.classMaps.web.matches[0] === 'protocol https', 'qos: class-maps and their matches are parsed');
    ok(wan && wan.order.join(',') === 'voice,class-default' && wan.classes.voice.priority.percent === 20 && wan.classes['class-default'].fairQueue && wan.classes['class-default'].police.bps === 8000000 && q.policyMaps.mark.classes.web.setDscp === 'af31', 'qos: policy-maps, classes, priority, fair-queue, police, set dscp');
    const i = NetConfig.parse(d.R1).interfaces['gigabitethernet0/0']; ok(i.servicePolicy.output === 'wan-out' && i.servicePolicy.input === 'mark', 'qos: service-policy input and output on the interface');
    const s = NetConfig.parse(d.SW1).interfaces['fastethernet0/1']; ok(s.qosTrustDevice === 'cisco-phone' && s.qosTrust === 'cos', 'qos: mls qos trust and trust device on a switch port');
    const S = Net.build(net, d); const run = (() => { const n = d.R1.out.length; d.R1.exec('show running-config'); return d.R1.out.slice(n).map(o => o.s).join('\n'); })();
    ok(/policy-map wan-out\n class voice\n  priority percent 20\n class class-default\n  fair-queue/.test(run) && /class-map match-any voice\n match dscp ef/.test(run), 'running-config nests classes under their policy-map (' + run.slice(run.indexOf('class-map'), run.indexOf('class-map') + 200) + ')');
    ok(/Match dscp ef \(46\)/.test(Show.render(d.R1, 'show class-map', S)) && /Strict Priority, 20% of the link/.test(Show.render(d.R1, 'show policy-map', S)), 'show class-map and show policy-map render');
    const pi = Show.render(d.R1, 'show policy-map interface g0/0', S); ok(/Service-policy output: wan-out/.test(pi) && /Service-policy input: mark/.test(pi) && /set dscp af31 \(26\)/.test(pi), 'show policy-map interface lists both directions and the AF31 value (' + pi + ')');
  }
  // 18. switch security: an err-disabled port stays down after the offender is unplugged (shutdown / no shutdown or errdisable
  //     recovery bring it back); option 82 (opt-in net.option82) stops an IOS DHCP server until no ip dhcp snooping information
  //     option; DAI drops the ARP of the untrusted uplink and of static hosts until trust or an ARP ACL; the show commands
  {
    const net = { option82: true, devices: { R1: { kind: 'router' }, SW1: { kind: 'switch', mac: '0001.5000.0001' }, PC1: { kind: 'host', dhcp: true, mac: '0050.7966.0001' },
        PRN: { kind: 'host', ip: '10.50.0.5', mask: '255.255.255.0', gw: '10.50.0.1', mac: '0050.7966.0005' }, BOX: { kind: 'host', flood: 6 }, BOX2: { kind: 'host', flood: 6 }, SPOOF: { kind: 'rogue', role: 'arpspoof', claims: '10.50.0.1', mac: '0bad.0bad.0001' } },
      links: [ { a: 'R1', ap: 'gigabitethernet0/0', b: 'SW1', bp: 'gigabitethernet0/1' }, { a: 'SW1', ap: 'fastethernet0/1', b: 'PC1' }, { a: 'SW1', ap: 'fastethernet0/5', b: 'PRN' },
        { a: 'SW1', ap: 'fastethernet0/9', b: 'BOX' }, { a: 'SW1', ap: 'fastethernet0/8', b: 'BOX2' }, { a: 'SW1', ap: 'fastethernet0/7', b: 'SPOOF' } ] };
    const d = devs({ R1: ['en', 'conf t', 'int g0/0', 'ip add 10.50.0.1 255.255.255.0', 'no shut', 'exit', 'ip dhcp excluded-address 10.50.0.1 10.50.0.9', 'ip dhcp pool clinic', 'network 10.50.0.0 255.255.255.0', 'default-router 10.50.0.1'],
      SW1: ['en', 'conf t', 'int range f0/8 - 9', 'switchport mode access', 'switchport port-security'] });
    let A = Net.api(Net.build(net, d)); ok(A.errdisabled('SW1', 'f0/9') && A.errdisabled('SW1', 'f0/8'), 'errdisable: both flooding boxes shut their ports');
    net.devices.BOX.removed = true; net.devices.BOX2.removed = true; A = Net.api(Net.build(net, d)); ok(A.errdisabled('SW1', 'f0/9') && /err-disabled/.test(Show.render(d.SW1, 'show interfaces status', A.state)), 'errdisable: the port stays err-disabled after the box is unplugged');
    d.SW1.exec('int f0/9'); d.SW1.exec('shutdown'); d.SW1.exec('no shutdown'); A = Net.api(Net.build(net, d)); ok(!A.errdisabled('SW1', 'f0/9') && A.errdisabled('SW1', 'f0/8'), 'errdisable: shutdown then no shutdown brings back that port only');
    d.SW1.exec('exit'); d.SW1.exec('errdisable recovery cause psecure-violation'); d.SW1.exec('errdisable recovery interval 180'); A = Net.api(Net.build(net, d)); ok(!A.errdisabled('SW1', 'f0/8'), 'errdisable: recovery for psecure-violation brings the other back');
    ok(/psecure-violation\s+Enabled/.test(Show.render(d.SW1, 'show errdisable recovery', A.state)) && /Timer interval: 180 seconds/.test(Show.render(d.SW1, 'show errdisable recovery', A.state)), 'show errdisable recovery lists the cause and the interval');
    ok(A.hosts.PC1.ip === '10.50.0.10', 'option 82: without snooping the router hands out the lease (' + A.hosts.PC1.ip + ')');
    d.SW1.exec('ip dhcp snooping'); d.SW1.exec('ip dhcp snooping vlan 1'); A = Net.api(Net.build(net, d)); ok(!A.lease('PC1').ok && /snooping/.test(A.lease('PC1').reason), 'snooping: untrusted uplink drops the router\'s offer (' + A.lease('PC1').reason + ')');
    d.SW1.exec('int g0/1'); d.SW1.exec('ip dhcp snooping trust'); d.SW1.exec('int f0/1'); d.SW1.exec('ip dhcp snooping limit rate 10'); A = Net.api(Net.build(net, d)); ok(!A.lease('PC1').ok && /option 82/.test(A.lease('PC1').reason), 'option 82: the IOS server drops the request with giaddr 0 (' + A.lease('PC1').reason + ')');
    d.SW1.exec('exit'); d.SW1.exec('no ip dhcp snooping information option'); A = Net.api(Net.build(net, d)); ok(A.lease('PC1').ok && !A.lease('PC1').rogue, 'option 82: no ip dhcp snooping information option → the lease arrives');
    const sn = Show.render(d.SW1, 'show ip dhcp snooping', A.state); ok(/option 82 is disabled/.test(sn) && /FastEthernet0\/1\s+no\s+10/.test(sn), 'show ip dhcp snooping shows option 82 and the rate limit (' + sn + ')');
    ok(/00:50:79:66:00:01\s+10\.50\.0\.10\s+86400\s+dhcp-snooping\s+1\s+FastEthernet0\/1/.test(Show.render(d.SW1, 'show ip dhcp snooping binding', A.state)), 'show ip dhcp snooping binding: MAC, IP, VLAN and port');
    ok(!A.threats.arpspoof.blocked && A.ping('PRN', '10.50.0.1').ok, 'dai: off, nothing is inspected');
    d.SW1.exec('ip arp inspection vlan 1'); A = Net.api(Net.build(net, d)); const p1 = A.ping('PC1', '10.50.0.1');
    ok(A.threats.arpspoof.blocked && !p1.ok && A.daiDrops.some(x => x.dev === 'R1'), 'dai: the untrusted uplink loses the router\'s ARP, so the leased PC cannot reach its gateway (' + p1.reason + ')');
    d.SW1.exec('int g0/1'); d.SW1.exec('ip arp inspection trust'); A = Net.api(Net.build(net, d)); const p2 = A.ping('PRN', '10.50.0.1');
    ok(A.ping('PC1', '10.50.0.1').ok && !p2.ok && /binding table/.test(p2.reason) && !A.ping('PC1', '10.50.0.5').ok, 'dai: trusted uplink; the static printer is not in the binding table and goes dark (' + p2.reason + ')');
    d.SW1.exec('exit'); d.SW1.exec('arp access-list printers'); d.SW1.exec('permit ip host 10.50.0.5 mac host 0050.7966.0005'); d.SW1.exec('exit'); d.SW1.exec('ip arp inspection filter printers vlan 1'); d.SW1.exec('ip arp inspection validate src-mac dst-mac ip');
    A = Net.api(Net.build(net, d)); ok(A.ping('PRN', '10.50.0.1').ok && A.ping('PC1', '10.50.0.5').ok && A.threats.arpspoof.blocked, 'dai: an ARP ACL lets the static printer through, the spoof stays blocked');
    const ai = Show.render(d.SW1, 'show ip arp inspection', A.state); ok(/Source Mac Validation\s+: Enabled/.test(ai) && /IP Address Validation\s+: Enabled/.test(ai) && /printers/.test(ai) && /Invalid ARPs \(Res\) on Fa0\/7, vlan 1\.\(\[0bad\.0bad\.0001\/10\.50\.0\.1/.test(ai), 'show ip arp inspection shows validation, the ACL and the spoof it dropped (' + ai + ')');
    ok(/Gi0\/1\s+Trusted\s+None/.test(Show.render(d.SW1, 'show ip arp inspection interfaces', A.state)) && /Fa0\/1\s+Untrusted\s+15/.test(Show.render(d.SW1, 'show ip arp inspection interfaces', A.state)), 'show ip arp inspection interfaces: trust state and the 15 pps default');
    const run = (() => { const n = d.SW1.out.length; d.SW1.exec('do show running-config'); return d.SW1.out.slice(n).map(o => o.s).join('\n'); })(); ok(/arp access-list printers\n permit ip host 10\.50\.0\.5 mac host 0050\.7966\.0005/.test(run), 'running-config prints the ARP ACL');
  }
  return { pass, fails };
};
