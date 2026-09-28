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
    ok(/Gi0\/0\s+up\s+up\s+## to PC1 ##/.test(idesc) && /Gi0\/1\s+up\s+up/.test(idesc), 'show interfaces description lists status, protocol and the description (' + idesc + ')');
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
  // 18. names and descriptions: the shell shows them as typed, the parsed config keeps them lower case for checks; legacy VLANs listed
  {
    const net = { devices: { SW1: { kind: 'switch' }, PC1: { kind: 'host', ip: '10.0.0.1', mask: '255.255.255.0' } }, links: [ { a: 'SW1', ap: 'fastethernet0/1', b: 'PC1' } ] };
    const d = devs({ SW1: ['en', 'conf t', 'vlan 10', 'name OFFICE', 'int f0/1', 'switchport mode access', 'switchport access vlan 10', 'description Accounts PC'] }); const A = Net.api(Net.build(net, d));
    const vb = Show.render(d.SW1, 'show vlan brief', A.state); ok(/10\s+OFFICE\s+active\s+Fa0\/1/.test(vb) && /1002\s+fddi-default\s+act\/unsup/.test(vb), 'show vlan brief: the name as typed, the legacy VLANs (' + vb + ')');
    ok(A.cfg('SW1').vlans[10].name === 'office' && A.cfg('SW1').interfaces['fastethernet0/1'].desc === 'accounts pc', 'config: names and descriptions stay lower case for checks');
    d.SW1.exec('do show running-config'); ok(/ name OFFICE/.test(d.SW1.out.map(o => o.s).join('\n')) && / description Accounts PC/.test(d.SW1.out.map(o => o.s).join('\n')), 'running-config: names and descriptions as typed');
  }
  // 19. keywords the abbreviation expander must leave alone; "no" removes NTP servers, syslog hosts and SNMP communities
  {
    ok(Sim.normalize('cdp run') === 'cdp run' && Sim.normalize('no cdp run') === 'no cdp run' && Sim.normalize('lldp run') === 'lldp run', 'shell: cdp run and lldp run stay themselves (' + Sim.normalize('lldp run') + ')');
    ok(Sim.normalize('sh ip int br') === 'show ip interface brief' && Sim.normalize('sh ip int g0/1') === 'show ip interface gigabitethernet0/1' && Sim.normalize('do sh ip int br') === 'do show ip interface brief', 'shell: sh ip int is show ip interface (' + Sim.normalize('sh ip int br') + ')');
    ok(Sim.normalize('logging trap 6') === 'logging trap 6' && Sim.normalize('snmp-server community watson ro') === 'snmp-server community watson ro', 'shell: logging trap and snmp ro keep their words');
    const net = { devices: { R1: { kind: 'router' }, SW1: { kind: 'switch', mac: '0001.0000.0001' }, SW2: { kind: 'switch', mac: '0001.0000.0002' } },
      links: [ { a: 'R1', ap: 'gigabitethernet0/0', b: 'SW1', bp: 'gigabitethernet0/1' }, { a: 'SW1', ap: 'gigabitethernet0/2', b: 'SW2', bp: 'gigabitethernet0/1' } ] };
    const d = devs({ R1: ['en', 'conf t', 'int g0/0', 'no shut', 'exit', 'no cdp run', 'ntp server 10.0.0.9', 'ntp server 10.0.0.8', 'no ntp server 10.0.0.9', 'ntp master 4', 'logging host 10.0.9.50', 'logging 10.0.9.51', 'no logging 10.0.9.50', 'snmp-server community public rw', 'snmp-server community watson ro', 'no snmp-server community public'],
      SW1: ['en', 'conf t', 'lldp run'], SW2: ['en', 'conf t', 'lldp run'] });
    const A = Net.api(Net.build(net, d)); const c = A.cfg('R1');
    ok(c.cdp === false && !A.neighbors('SW1').find(n => n.dev === 'R1').cdp && A.neighbors('SW1').find(n => n.dev === 'SW2').cdp, 'cdp: no cdp run turns CDP off on R1 only');
    ok(A.neighbors('SW1').find(n => n.dev === 'SW2').lldp && /SW2/.test(Show.render(d.SW1, 'show lldp neighbors', A.state)), 'lldp: lldp run on both switches makes them LLDP neighbours');
    ok(c.ntp.join() === '10.0.0.8' && c.ntpMaster === 4, 'ntp: no ntp server removes one server; ntp master stratum parsed');
    ok(c.logging.join() === '10.0.9.51', 'syslog: no logging removes a host');
    ok(c.snmp.length === 1 && c.snmp[0].community === 'watson' && c.snmp[0].mode === 'ro', 'snmp: no snmp-server community removes it; ro stays read-only');
    const r1 = new Sim.Device('R1', { kind: 'ios' }); ['en', 'conf t', 'access-list 1 remark x', 'access-list 1 deny 10.0.0.0 0.0.0.255', 'access-list 1 permit any', 'access-list 2 permit any', 'no access-list 1', 'do show running-config'].forEach(l => r1.exec(l));
    const run = r1.out[r1.out.length - 1].s; ok(!/access-list 1 /.test(run) && /access-list 2 permit any/.test(run), 'shell: no access-list 1 removes every line of list 1 from the running-config');
  }
  // 20. CDP and LLDP per port, and their timers
  {
    const net = { devices: { R1: { kind: 'router' }, EX: { kind: 'router' }, SW1: { kind: 'switch', mac: '0001.0000.0011' }, SW2: { kind: 'switch', mac: '0001.0000.0012' } },
      links: [ { a: 'EX', ap: 'gigabitethernet0/0', b: 'R1', bp: 'gigabitethernet0/1' }, { a: 'R1', ap: 'gigabitethernet0/0', b: 'SW1', bp: 'gigabitethernet0/1' }, { a: 'SW1', ap: 'gigabitethernet0/2', b: 'SW2', bp: 'gigabitethernet0/1' } ] };
    const d = devs({ EX: ['en', 'conf t', 'int g0/0', 'no shut'], R1: ['en', 'conf t', 'int g0/0', 'no shut', 'int g0/1', 'no shut', 'no cdp enable', 'exit', 'cdp timer 30', 'cdp holdtime 120'],
      SW1: ['en', 'conf t', 'lldp run', 'lldp timer 10', 'int g0/2', 'no lldp receive'], SW2: ['en', 'conf t', 'lldp run'] });
    const A = Net.api(Net.build(net, d)); const nb = (a, b) => A.neighbors(a).find(n => n.dev === b);
    ok(!nb('EX', 'R1').cdp && !nb('R1', 'EX').cdp && nb('SW1', 'R1').cdp && nb('R1', 'SW1').cdp, 'cdp: no cdp enable on one port hides only that link');
    ok(nb('SW2', 'SW1').lldp && !nb('SW1', 'SW2').lldp, 'lldp: no lldp receive on SW1 g0/2 stops SW1 learning SW2, not the other way round');
    ok(/every 30 seconds/.test(Show.render(d.R1, 'show cdp', A.state)) && /holdtime value of 120/.test(Show.render(d.R1, 'show cdp', A.state)) && /every 10 seconds/.test(Show.render(d.SW1, 'show lldp', A.state)) && /not enabled/.test(Show.render(d.R1, 'show lldp', A.state)), 'show cdp and show lldp print the timers');
  }
  // 21. NTP: a server must answer and be synchronised itself; stratum counts down from the reference clock; authentication; show clock
  {
    const net = { devices: { R1: { kind: 'router' }, R2: { kind: 'router' }, CLK: { kind: 'server', ip: '10.9.9.9', mask: '255.255.255.0', gw: '10.9.9.1', ntpStratum: 1 } },
      links: [ { a: 'CLK', b: 'R1', bp: 'gigabitethernet0/2' }, { a: 'R1', ap: 'gigabitethernet0/1', b: 'R2', bp: 'gigabitethernet0/1' } ] };
    const d = devs({ R1: ['en', 'conf t', 'int g0/2', 'ip add 10.9.9.1 255.255.255.0', 'no shut', 'int g0/1', 'ip add 10.0.12.1 255.255.255.252', 'no shut', 'int lo0', 'ip add 10.255.0.1 255.255.255.255'],
      R2: ['en', 'conf t', 'int g0/1', 'ip add 10.0.12.2 255.255.255.252', 'no shut', 'exit', 'ip route 0.0.0.0 0.0.0.0 10.0.12.1', 'ntp server 10.255.0.1'] });
    let A = Net.api(Net.build(net, d)); ok(!A.ntp('R2').synced && /not synchronised/.test(A.ntp('R2').reason), 'ntp: a server that is not synchronised itself gives no time (' + A.ntp('R2').reason + ')');
    ok(/^\*00:14:52\.211 UTC Mon Mar 1 1993$/.test(Show.render(d.R2, 'show clock', A.state)), 'show clock: unsynchronised clock is the 1993 default, marked * (' + Show.render(d.R2, 'show clock', A.state) + ')');
    d.R1.exec('ntp server 10.9.9.9'); A = Net.api(Net.build(net, d)); ok(A.ntp('R1').synced && A.ntp('R1').stratum === 2 && A.ntp('R2').synced && A.ntp('R2').stratum === 3, 'ntp: stratum 1 clock → R1 at 2 → R2 at 3');
    ok(/synchronized, stratum 3, reference is 10\.255\.0\.1/.test(Show.render(d.R2, 'show ntp status', A.state)) && /^\*~10\.255\.0\.1/m.test(Show.render(d.R2, 'show ntp associations', A.state)), 'show ntp status and associations follow the sync');
    d.R2.exec('clock timezone PST -8'); A = Net.api(Net.build(net, d)); ok(Show.render(d.R2, 'show clock', A.state) === '15:47:12.345 PST Mon Sep 28 2026', 'show clock: synchronised, no star, in the configured time zone (' + Show.render(d.R2, 'show clock', A.state) + ')');
    d.R2.exec('clock summer-time PDT recurring'); A = Net.api(Net.build(net, d)); ok(Show.render(d.R2, 'show clock', A.state) === '16:47:12.345 PDT Mon Sep 28 2026', 'show clock: summer time recurring moves September forward an hour (' + Show.render(d.R2, 'show clock', A.state) + ')');
    ok(/1993/.test(Show.render(d.R2, 'show calendar', A.state)), 'show calendar: the hardware clock is not updated without ntp update-calendar'); d.R2.exec('ntp update-calendar'); A = Net.api(Net.build(net, d)); ok(/2026/.test(Show.render(d.R2, 'show calendar', A.state)), 'show calendar: ntp update-calendar writes NTP time to the hardware clock');
    d.R2.exec('ntp authenticate'); A = Net.api(Net.build(net, d)); ok(!A.ntp('R2').synced, 'ntp: authenticate with no key for the server refuses it');
    ['ntp authentication-key 1 md5 tide', 'ntp trusted-key 1', 'ntp server 10.255.0.1 key 1'].forEach(l => d.R2.exec(l)); d.R1.exec('ntp authentication-key 1 md5 wrong'); A = Net.api(Net.build(net, d)); ok(!A.ntp('R2').synced && /authentication failed/.test(A.ntp('R2').reason), 'ntp: mismatched keys fail');
    d.R1.exec('ntp authentication-key 1 md5 tide'); A = Net.api(Net.build(net, d)); ok(A.ntp('R2').synced, 'ntp: matching trusted key → synchronised');
    const m = devs({ R3: ['en', 'conf t', 'ntp master'] }); const B = Net.api(Net.build({ devices: { R3: { kind: 'router' } }, links: [] }, m)); ok(B.ntp('R3').synced && B.ntp('R3').stratum === 8, 'ntp: ntp master alone is stratum 8');
    d.R2.exec('end'); d.R2.exec('clock set 10:00:00 28 sep 2026'); ok(d.R2.lines.some(r => r.mode === 'priv' && r.line === 'clock set 10:00:00 28 sep 2026') && !/Invalid/.test(d.R2.out[d.R2.out.length - 1].s), 'shell: clock set is accepted in privileged EXEC');
  }
  // 22. DNS: a router with ip dns server answers from its host table and forwards the rest to its name server; PCs nslookup and ping by name
  {
    const net = { devices: { R1: { kind: 'router' }, ISP: { kind: 'cloud', ip: '203.0.113.1', mask: '255.255.255.252', internet: true, dnsRecords: { 'exchange.watson.net': '198.51.100.20' } },
        PC1: { kind: 'host', ip: '10.0.1.10', mask: '255.255.255.0', gw: '10.0.1.1', dns: '10.0.1.1' }, PC2: { kind: 'host', ip: '10.0.1.11', mask: '255.255.255.0', gw: '10.0.1.1' },
        SRV: { kind: 'server', ip: '10.0.2.10', mask: '255.255.255.0', gw: '10.0.2.1' } },
      links: [ { a: 'PC1', b: 'R1', bp: 'gigabitethernet0/0' }, { a: 'PC2', b: 'R1', bp: 'gigabitethernet0/0' }, { a: 'SRV', b: 'R1', bp: 'gigabitethernet0/2' }, { a: 'R1', ap: 'gigabitethernet0/1', b: 'ISP' } ] };
    const d = devs({ R1: ['en', 'conf t', 'int g0/0', 'ip add 10.0.1.1 255.255.255.0', 'no shut', 'int g0/2', 'ip add 10.0.2.1 255.255.255.0', 'no shut', 'int g0/1', 'ip add 203.0.113.2 255.255.255.252', 'no shut', 'exit', 'ip route 0.0.0.0 0.0.0.0 203.0.113.1', 'ip host records 10.0.2.66'] });
    let A = Net.api(Net.build(net, d)); ok(!A.resolve('PC1', 'records').ok && /not a DNS server/.test(A.resolve('PC1', 'records').reason), 'dns: a router without ip dns server does not answer (' + A.resolve('PC1', 'records').reason + ')');
    ok(!A.resolve('PC2', 'records').ok && /no DNS server/.test(A.resolve('PC2', 'records').reason), 'dns: a host with no DNS server cannot resolve');
    ok(A.resolve('R1', 'records').ip === '10.0.2.66', 'dns: the router resolves its own host table');
    d.R1.exec('ip dns server'); d.R1.exec('no ip host records'); d.R1.exec('ip host records 10.0.2.10'); A = Net.api(Net.build(net, d)); ok(A.resolve('PC1', 'records').ok && A.resolve('PC1', 'records').ip === '10.0.2.10', 'dns: ip dns server answers from the host table; no ip host replaces the entry');
    ok(A.resolve('PC1', 'exchange.watson.net').nx, 'dns: a name not in the table and no name server is a non-existent domain');
    d.R1.exec('ip name-server 8.8.8.8'); A = Net.api(Net.build(net, d)); ok(A.resolve('PC1', 'exchange.watson.net').ip === '198.51.100.20', 'dns: the router forwards to its name server on the internet');
    d.R1.exec('no ip domain lookup'); A = Net.api(Net.build(net, d)); ok(!A.resolve('PC1', 'exchange.watson.net').ok && A.resolve('PC1', 'records').ok, 'dns: no ip domain lookup stops forwarding, the host table still answers');
    ok(/records\s+None\s+\(perm, OK\)\s+0\s+IP\s+10\.0\.2\.10/.test(Show.render(d.R1, 'show hosts', A.state)) && /Name servers are 8\.8\.8\.8/.test(Show.render(d.R1, 'show hosts', A.state)), 'show hosts lists the table and the name servers');
    const pc = new Sim.Device('PC1', { kind: 'host', netState: () => A.state }); pc.exec('nslookup records'); ok(/Name:\s+records\nAddress:\s+10\.0\.2\.10/.test(pc.out[pc.out.length - 1].s), 'pc: nslookup prints the answer');
    pc.exec('ping records'); ok(/Pinging records \[10\.0\.2\.10\]/.test(pc.out[pc.out.length - 1].s) && /Received = 4/.test(pc.out[pc.out.length - 1].s), 'pc: ping by name resolves then pings'); pc.exec('ipconfig /displaydns'); ok(/A \(Host\) Record . . . : 10\.0\.2\.10/.test(pc.out[pc.out.length - 1].s), 'pc: ipconfig /displaydns shows the cache');
    pc.exec('ipconfig /flushdns'); pc.exec('ipconfig /displaydns'); ok(/empty/.test(pc.out[pc.out.length - 1].s), 'pc: ipconfig /flushdns empties it');
    const r1 = d.R1; r1.netState = null; r1._netState = () => A.state; r1.exec('end'); r1.exec('ping records'); ok(r1.out.some(o => /Success rate is 100/.test(o.s)) && r1.out.filter(o => /ping records/.test(o.s)).length === 1, 'router: ping by name uses the host table, echoed once');
  }
  // 23. DHCP relay to a router's own pool, with that router's exclusions; the lease carries the DNS server
  {
    const net = { devices: { R1: { kind: 'router' }, R2: { kind: 'router' }, PC1: { kind: 'host', dhcp: true }, PC3: { kind: 'host', dhcp: true } },
      links: [ { a: 'PC1', b: 'R1', bp: 'gigabitethernet0/0' }, { a: 'R1', ap: 'gigabitethernet0/1', b: 'R2', bp: 'gigabitethernet0/1' }, { a: 'R2', ap: 'gigabitethernet0/0', b: 'PC3' } ] };
    const d = devs({ R1: ['en', 'conf t', 'int g0/0', 'ip add 10.1.1.1 255.255.255.0', 'no shut', 'int g0/1', 'ip add 10.0.12.1 255.255.255.252', 'no shut', 'exit', 'ip route 10.3.3.0 255.255.255.0 10.0.12.2',
        'ip dhcp excluded-address 10.3.3.1 10.3.3.20', 'ip dhcp pool FAR', 'network 10.3.3.0 255.255.255.0', 'default-router 10.3.3.1', 'dns-server 10.1.1.1'],
      R2: ['en', 'conf t', 'int g0/0', 'ip add 10.3.3.1 255.255.255.0', 'no shut', 'int g0/1', 'ip add 10.0.12.2 255.255.255.252', 'no shut', 'exit', 'ip route 0.0.0.0 0.0.0.0 10.0.12.1'] });
    let A = Net.api(Net.build(net, d)); ok(!A.lease('PC3').ok, 'dhcp relay: no helper, no lease across the router (' + A.lease('PC3').reason + ')');
    d.R2.exec('int g0/0'); d.R2.exec('ip helper-address 10.0.12.1'); A = Net.api(Net.build(net, d)); const l = A.lease('PC3');
    ok(l.ok && l.server === 'R1' && l.ip === '10.3.3.21' && l.gw === '10.3.3.1' && [].concat(l.dns).includes('10.1.1.1'), 'dhcp relay: helper to R1 gets a lease from R1\'s pool after its exclusions (' + JSON.stringify(l) + ')');
    ok(A.ping('PC3', '10.1.1.1').ok && /10\.3\.3\.21/.test(Show.render(d.R1, 'show ip dhcp binding', A.state)), 'dhcp relay: the relayed host routes home and shows in the server\'s bindings');
    const net2 = { devices: Object.assign({}, net.devices, { PC4: { kind: 'host', dhcp: true } }), links: net.links.concat([ { a: 'PC4', b: 'R2', bp: 'gigabitethernet0/0' } ]) }; const B = Net.api(Net.build(net2, d));
    ok(B.lease('PC3').ip === '10.3.3.21' && B.lease('PC4').ip === '10.3.3.22', 'dhcp: two clients get consecutive addresses (' + B.lease('PC3').ip + ', ' + B.lease('PC4').ip + ')');
  }
  // 24. SNMP: polls need the community (rw for a Set), its ACL and UDP 161; traps need a host, enable traps and UDP 162
  {
    const net = { devices: { R1: { kind: 'router' }, NMS: { kind: 'server', ip: '10.0.9.50', mask: '255.255.255.0', gw: '10.0.9.1' }, PC1: { kind: 'host', ip: '10.0.1.10', mask: '255.255.255.0', gw: '10.0.1.1' } },
      links: [ { a: 'NMS', b: 'R1', bp: 'gigabitethernet0/0' }, { a: 'PC1', b: 'R1', bp: 'gigabitethernet0/1' } ] };
    const d = devs({ R1: ['en', 'conf t', 'int g0/0', 'ip add 10.0.9.1 255.255.255.0', 'no shut', 'int g0/1', 'ip add 10.0.1.1 255.255.255.0', 'no shut', 'exit', 'snmp-server community cellar rw'] });
    let A = Net.api(Net.build(net, d)); ok(A.snmp('PC1', '10.0.1.1', 'cellar', true).ok, 'snmp: an rw community lets anyone who knows it Set');
    ['no snmp-server community cellar', 'access-list 40 permit host 10.0.9.50', 'snmp-server community watch ro 40', 'snmp-server contact denise', 'snmp-server location exchange hall', 'snmp-server host 10.0.9.50 version 2c watch'].forEach(l => d.R1.exec(l)); A = Net.api(Net.build(net, d));
    ok(!A.snmp('PC1', '10.0.1.1', 'cellar', true).ok && A.snmp('NMS', '10.0.9.1', 'watch').ok && !A.snmp('NMS', '10.0.9.1', 'watch', true).ok, 'snmp: ro community reads but cannot Set; the old one is gone');
    ok(!A.snmp('PC1', '10.0.1.1', 'watch').ok && /ACL 40/.test(A.snmp('PC1', '10.0.1.1', 'watch').reason), 'snmp: the community ACL refuses anyone but the NMS');
    d.R1.exec('snmp-server community watch ro'); A = Net.api(Net.build(net, d)); ok(A.cfg('R1').snmp.length === 1 && A.snmp('PC1', '10.0.1.1', 'watch').ok, 'snmp: typing a community again replaces it (the ACL is gone)'); d.R1.exec('snmp-server community watch ro 40');
    ok(A.snmpTraps('R1').length === 1 && !A.snmpTraps('R1')[0].ok, 'snmp: no traps until snmp-server enable traps'); d.R1.exec('snmp-server enable traps'); A = Net.api(Net.build(net, d)); ok(A.snmpTraps('R1')[0].ok, 'snmp: traps reach the host once enabled');
    ok(/Contact: denise/.test(Show.render(d.R1, 'show snmp', A.state)) && /Logging to 10\.0\.9\.50\.162/.test(Show.render(d.R1, 'show snmp', A.state)) && /security model: v2c/.test(Show.render(d.R1, 'show snmp host', A.state)), 'show snmp and show snmp host');
  }
  // 25. syslog: levels, hosts over UDP 514, the buffer stamped by service timestamps and sequence numbers
  {
    const net = { devices: { R1: { kind: 'router', logBuffer: [ { sev: 3, line: '3d04h: %LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to down' }, { sev: 6, line: '3d04h: %SYS-6-LOGGINGHOST_STARTSTOP: Logging to host 10.0.9.60 stopped' } ] },
        LOG: { kind: 'server', ip: '10.0.9.60', mask: '255.255.255.0', gw: '10.0.9.1' } }, links: [ { a: 'LOG', b: 'R1', bp: 'gigabitethernet0/0' } ] };
    const d = devs({ R1: ['en', 'conf t', 'int g0/0', 'ip add 10.0.9.1 255.255.255.0', 'no shut', 'exit', 'logging host 10.0.9.60', 'logging trap warnings', 'logging console 3', 'logging buffered 16384 informational', 'line con 0', 'logging synchronous'] });
    let A = Net.api(Net.build(net, d)); const c = A.cfg('R1');
    ok(c.logLevels.trap === 4 && c.logLevels.console === 3 && c.logLevels.buffered === 6 && c.logBufferSize === 16384 && c.con.loggingSync, 'syslog: levels by name or number, buffer size, logging synchronous parsed');
    ok(A.syslog('R1').length === 1 && A.syslog('R1')[0].ok && A.syslog('R1')[0].level === 4, 'syslog: the host is reached over UDP 514 at the trap level');
    let t = Show.render(d.R1, 'show logging', A.state); ok(/Trap logging: level warnings/.test(t) && /Logging to 10\.0\.9\.60/.test(t) && /Log Buffer \(16384 bytes\)/.test(t) && /LINK-3-UPDOWN/.test(t), 'show logging: levels, host and the buffer');
    d.R1.exec('exit'); d.R1.exec('service timestamps log datetime msec'); d.R1.exec('service sequence-numbers'); A = Net.api(Net.build(net, d)); t = Show.render(d.R1, 'show logging', A.state);
    ok(/000003: \*Mar  1 00:14:52\.211: %SYS-5-CONFIG_I/.test(t), 'show logging: a new line carries a sequence number and a datetime stamp (* while the clock is not synchronised) (' + t.split('\n').pop() + ')');
    d.R1.exec('logging buffered 4'); A = Net.api(Net.build(net, d)); t = Show.render(d.R1, 'show logging', A.state); ok(/LINK-3/.test(t) && !/SYS-6/.test(t) && !/SYS-5/.test(t), 'show logging: the buffer keeps only messages at its level and below');
  }
  // 26. remote logins: Telnet until the VTY lines take SSH only; SSH needs a domain, a key, login local, a user and the access-class; a switch replies through ip default-gateway
  {
    const net = { devices: { R1: { kind: 'router' }, SW1: { kind: 'switch', mac: '0042.0000.0001' }, ADM: { kind: 'host', ip: '10.0.9.10', mask: '255.255.255.0', gw: '10.0.9.1' }, PC1: { kind: 'host', ip: '10.0.1.20', mask: '255.255.255.0', gw: '10.0.1.1' } },
      links: [ { a: 'ADM', b: 'R1', bp: 'gigabitethernet0/1' }, { a: 'R1', ap: 'gigabitethernet0/0', b: 'SW1', bp: 'gigabitethernet0/1' }, { a: 'SW1', ap: 'fastethernet0/1', b: 'PC1' } ] };
    const d = devs({ R1: ['en', 'conf t', 'int g0/0', 'ip add 10.0.1.1 255.255.255.0', 'no shut', 'int g0/1', 'ip add 10.0.9.1 255.255.255.0', 'no shut', 'line vty 0 15', 'password open', 'login'],
      SW1: ['en', 'conf t', 'int vlan1', 'ip add 10.0.1.2 255.255.255.0', 'no shut'] });
    let A = Net.api(Net.build(net, d)); ok(A.telnet('ADM', '10.0.1.1').ok && !A.ssh('ADM', '10.0.1.1', 'shell').ok, 'login: Telnet with a line password works, SSH does not');
    ok(!A.ping('ADM', '10.0.1.2').ok && A.ping('PC1', '10.0.1.2').ok, 'switch: its SVI answers its own subnet only, until it has a default gateway'); d.SW1.exec('ip default-gateway 10.0.1.1'); A = Net.api(Net.build(net, d)); ok(A.ping('ADM', '10.0.1.2').ok, 'switch: ip default-gateway lets it reply across the router');
    ['exit', 'ip domain name watson.net', 'crypto key generate rsa modulus 1024', 'ip ssh version 2', 'username shell secret brass', 'line vty 0 15', 'login local', 'transport input ssh'].forEach(l => d.R1.exec(l)); A = Net.api(Net.build(net, d));
    ok(A.ssh('ADM', '10.0.1.1', 'shell').ok && !A.telnet('ADM', '10.0.1.1').ok && !A.ssh('ADM', '10.0.1.1', 'nobody').ok, 'login: SSH as a local user works, Telnet is refused, an unknown user is refused');
    ['access-list 5 permit 10.0.9.0 0.0.0.255', 'line vty 0 15', 'access-class 5 in'].forEach(l => d.R1.exec(l)); A = Net.api(Net.build(net, d)); ok(A.ssh('ADM', '10.0.1.1', 'shell').ok && !A.ssh('PC1', '10.0.1.1', 'shell').ok && /access-class 5/.test(A.ssh('PC1', '10.0.1.1', 'shell').reason), 'login: access-class limits who may connect');
    ok(d.R1.out.some(o => /The name for the keys will be: R1\.watson\.net/.test(o.s)), 'shell: crypto key generate rsa names the keys after hostname.domain (ip domain name)');
    const pc = new Sim.Device('ADM', { kind: 'host', netState: () => A.state }); pc.exec('ssh -l shell 10.0.1.1'); ok(/Open/.test(pc.out[pc.out.length - 1].s) && /SSH 2 session to R1/.test(pc.out[pc.out.length - 1].s), 'pc: ssh -l opens a session'); pc.exec('telnet 10.0.1.1'); ok(/refused/.test(pc.out[pc.out.length - 1].s), 'pc: telnet is refused');
  }
  return { pass, fails };
};
