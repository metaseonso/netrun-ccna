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
    d.R1.exec('ip nat inside source static 192.168.1.50 203.0.113.3'); A = Net.api(Net.build(net, d)); const p2 = A.ping('ISP', '203.0.113.3'); ok(p2.ok, 'nat: static NAT reachable from outside (' + p2.reason + ')');
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
  // 10. keywords the abbreviation expander must leave alone; "no" removes NTP servers, syslog hosts and SNMP communities
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
  // 11. CDP and LLDP per port, and their timers
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
  // 12. NTP: a server must answer and be synchronised itself; stratum counts down from the reference clock; authentication; show clock
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
  // 13. DNS: a router with ip dns server answers from its host table and forwards the rest to its name server; PCs nslookup and ping by name
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
  // 14. DHCP relay to a router's own pool, with that router's exclusions; the lease carries the DNS server
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
  // 15. SNMP: polls need the community (rw for a Set), its ACL and UDP 161; traps need a host, enable traps and UDP 162
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
  // 16. syslog: levels, hosts over UDP 514, the buffer stamped by service timestamps and sequence numbers
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
  return { pass, fails };
};
