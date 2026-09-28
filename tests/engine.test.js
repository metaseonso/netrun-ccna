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
  // 10. copy over TFTP and FTP: the questions IOS asks, the file landing in flash, FTP logins, boot system, a config backup
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
  // 11. NAT as the shell shows it: pings from PCs fill the table, a dynamic pool holds one address per host and runs out,
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
  return { pass, fails };
};
