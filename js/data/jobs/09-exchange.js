/* jobs/09-exchange.js — District 09 · The Watson Exchange: the finale (window.FINALE = 'z-watson-exchange').
   Built from the course's Mega Lab addressing plan (docs/megalab/ADDRESSING.md), scaled to one long dive:
   R1 with two ISPs, cores CSW1/CSW2, distribution pairs DSW-A1/A2 (the clinic) and DSW-B1/B2 (the street's servers),
   four access switches, VLANs 10/20/30/40/99, HSRP VIPs, OSPF area 0 over routed /30s. CSW1<>CSW2 is one routed link
   (10.0.0.40/30) instead of the plan's Layer 3 Port-channel, and each side keeps two of its three access switches.
   The crews built the cores, R1's routing and the whole B side during the week; the player builds the clinic's A side,
   one floor for each kind of trouble the campaign taught. Every floor checks the engine's state. */
(function(){
  const { gi, fa } = NETKIT;
  const G = p => 'gigabitethernet' + p;
  // a routed uplink on a multilayer switch
  const routed = (p, ip) => ['interface ' + p, 'no switchport', 'ip address ' + ip + ' 255.255.255.252'];
  const ospf = (rid, uplinks) => ['router ospf 1', 'router-id ' + rid, 'network 10.0.0.0 0.255.255.255 area 0', 'passive-interface default'].concat(uplinks.map(u => 'no passive-interface ' + u));
  const svi = (v, ip, mask, vip, extra) => ['interface vlan ' + v, 'ip address ' + ip + ' ' + mask, 'no shutdown', 'standby ' + v + ' ip ' + vip].concat(extra || []);
  const trunks = range => ['interface range ' + range, 'switchport trunk encapsulation dot1q', 'switchport mode trunk'];
  const M28 = '255.255.255.240', M24 = '255.255.255.0';
  const VIP = { 10: '10.1.0.1', 20: '10.2.0.1', 40: '10.6.0.1', 99: '10.0.0.1' };
  const saved = /^(do )?(write memory|copy running-config startup-config)$/;

  JOBS.push(
    { id: 'z-watson-exchange', cls: 'A', rep: 150, creds: 1000, rite: true, team: { min: 3 }, food: 45, chrome: 38, from: 'dispatch', title: 'The Watson Exchange', day: [64], requires: ['z-opening-night'],
      devices: ['ASW-A1', 'DSW-A1', 'DSW-A2', 'R1', 'PC-A1', 'PC-A2'],
      brief: 'DISPATCH » Opening Night. The Watson Exchange. The crews built most of it this week. The clinic\'s side is yours, and the council votes at midnight on whatever is still green. Crew of three at least. No fixer will touch this one.\n\nCLIENT (Clerk Adebayo) » "The council\'s terms are simple. The street\'s own network, built by the street, carrying the clinic\'s new wing when its doors open. If it holds, Watson keeps the Exchange."',
      net: {
        devices: {
          ISPA: { kind: 'cloud', ip: '203.0.113.1', mask: '255.255.255.252', internet: true }, ISPB: { kind: 'cloud', ip: '203.0.113.5', mask: '255.255.255.252', internet: true },
          R1: { kind: 'router' },
          CSW1: { kind: 'l3switch', mac: '0011.2264.c001' }, CSW2: { kind: 'l3switch', mac: '0011.2264.c002' },
          'DSW-A1': { kind: 'l3switch', mac: '0011.2264.a102' }, 'DSW-A2': { kind: 'l3switch', mac: '0011.2264.a101' },
          'DSW-B1': { kind: 'l3switch', mac: '0011.2264.b101' }, 'DSW-B2': { kind: 'l3switch', mac: '0011.2264.b102' },
          'ASW-A1': { kind: 'switch', mac: '0011.2264.a201' }, 'ASW-A2': { kind: 'switch', mac: '0011.2264.a202' },
          'ASW-B1': { kind: 'switch', mac: '0011.2264.b201' }, 'ASW-B3': { kind: 'switch', mac: '0011.2264.b203' },
          LWAP1: { kind: 'ap', ip: '10.0.0.8', mask: M28, gw: '10.0.0.1' }, WLC1: { kind: 'server', ip: '10.0.0.7', mask: M28, gw: '10.0.0.1' },
          'PC-A1': { kind: 'host', ip: '10.1.0.10', mask: M24, gw: '10.1.0.1' }, 'PC-A2': { kind: 'host', dhcp: true },
          Phone1: { kind: 'host', ip: '10.2.0.10', mask: M24, gw: '10.2.0.1' },
          'PC-B1': { kind: 'host', ip: '10.3.0.10', mask: M24, gw: '10.3.0.1' },
          SRV1: { kind: 'server', ip: '10.5.0.10', mask: M24, gw: '10.5.0.1', pools: [ { network: '10.1.0.0', mask: M24, router: '10.1.0.1', dns: ['10.5.0.10'] } ] }
        },
        links: [
          { a: 'R1', ap: 'gigabitethernet0/0/0', b: 'ISPA' }, { a: 'R1', ap: 'gigabitethernet0/1/0', b: 'ISPB' },
          { a: 'R1', ap: gi(0), b: 'CSW1', bp: G('1/0/1') }, { a: 'R1', ap: gi(1), b: 'CSW2', bp: G('1/0/1') }, { a: 'CSW1', ap: G('1/0/2'), b: 'CSW2', bp: G('1/0/2') },
          { a: 'CSW1', ap: G('1/1/1'), b: 'DSW-A1', bp: G('1/1/1') }, { a: 'CSW1', ap: G('1/1/2'), b: 'DSW-A2', bp: G('1/1/1') }, { a: 'CSW1', ap: G('1/1/3'), b: 'DSW-B1', bp: G('1/1/1') }, { a: 'CSW1', ap: G('1/1/4'), b: 'DSW-B2', bp: G('1/1/1') },
          { a: 'CSW2', ap: G('1/1/1'), b: 'DSW-A1', bp: G('1/1/2') }, { a: 'CSW2', ap: G('1/1/2'), b: 'DSW-A2', bp: G('1/1/2') }, { a: 'CSW2', ap: G('1/1/3'), b: 'DSW-B1', bp: G('1/1/2') }, { a: 'CSW2', ap: G('1/1/4'), b: 'DSW-B2', bp: G('1/1/2') },
          { a: 'DSW-A1', ap: G('1/0/4'), b: 'DSW-A2', bp: G('1/0/4') }, { a: 'DSW-A1', ap: G('1/0/5'), b: 'DSW-A2', bp: G('1/0/5') },
          { a: 'DSW-B1', ap: G('1/0/4'), b: 'DSW-B2', bp: G('1/0/4') }, { a: 'DSW-B1', ap: G('1/0/5'), b: 'DSW-B2', bp: G('1/0/5') },
          { a: 'DSW-A1', ap: G('1/0/1'), b: 'ASW-A1', bp: gi(1) }, { a: 'DSW-A2', ap: G('1/0/1'), b: 'ASW-A1', bp: gi(2) }, { a: 'DSW-A1', ap: G('1/0/2'), b: 'ASW-A2', bp: gi(1) }, { a: 'DSW-A2', ap: G('1/0/2'), b: 'ASW-A2', bp: gi(2) },
          { a: 'DSW-B1', ap: G('1/0/1'), b: 'ASW-B1', bp: gi(1) }, { a: 'DSW-B2', ap: G('1/0/1'), b: 'ASW-B1', bp: gi(2) }, { a: 'DSW-B1', ap: G('1/0/3'), b: 'ASW-B3', bp: gi(1) }, { a: 'DSW-B2', ap: G('1/0/3'), b: 'ASW-B3', bp: gi(2) },
          { a: 'ASW-A1', ap: fa(1), b: 'LWAP1' }, { a: 'ASW-A1', ap: fa(2), b: 'WLC1' }, { a: 'ASW-A1', ap: fa(3), b: 'PC-A1' }, { a: 'ASW-A1', ap: fa(4), b: 'PC-A2' },
          { a: 'ASW-A2', ap: fa(1), b: 'Phone1' }, { a: 'ASW-B1', ap: fa(3), b: 'PC-B1' }, { a: 'ASW-B3', ap: fa(1), b: 'SRV1' } ],
        preconfig: {
          R1: ['hostname R1', 'interface g0/0/0', 'description ISPA', 'ip address 203.0.113.2 255.255.255.252', 'no shutdown', 'interface g0/1/0', 'description ISPB', 'ip address 203.0.113.6 255.255.255.252', 'no shutdown',
            'interface g0/0', 'ip address 10.0.0.33 255.255.255.252', 'no shutdown', 'interface g0/1', 'ip address 10.0.0.37 255.255.255.252', 'no shutdown', 'interface loopback0', 'ip address 10.0.0.76 255.255.255.255',
            'ip route 0.0.0.0 0.0.0.0 203.0.113.1', 'ip route 0.0.0.0 0.0.0.0 203.0.113.5 2',
            'router ospf 1', 'router-id 10.0.0.76', 'network 10.0.0.32 0.0.0.3 area 0', 'network 10.0.0.36 0.0.0.3 area 0', 'network 10.0.0.76 0.0.0.0 area 0', 'default-information originate'],
          CSW1: ['hostname CSW1', 'ip routing'].concat(routed('g1/0/1', '10.0.0.34'), routed('g1/0/2', '10.0.0.41'), routed('g1/1/1', '10.0.0.45'), routed('g1/1/2', '10.0.0.49'), routed('g1/1/3', '10.0.0.53'), routed('g1/1/4', '10.0.0.57'),
            ['interface loopback0', 'ip address 10.0.0.77 255.255.255.255', 'router ospf 1', 'router-id 10.0.0.77', 'network 10.0.0.0 0.255.255.255 area 0']),
          CSW2: ['hostname CSW2', 'ip routing'].concat(routed('g1/0/1', '10.0.0.38'), routed('g1/0/2', '10.0.0.42'), routed('g1/1/1', '10.0.0.61'), routed('g1/1/2', '10.0.0.65'), routed('g1/1/3', '10.0.0.69'), routed('g1/1/4', '10.0.0.73'),
            ['interface loopback0', 'ip address 10.0.0.78 255.255.255.255', 'router ospf 1', 'router-id 10.0.0.78', 'network 10.0.0.0 0.255.255.255 area 0']),
          'DSW-A1': ['hostname DSW-A1', 'ip routing', 'vlan 10', 'name PCS', 'vlan 20', 'name PHONES', 'vlan 40', 'name WIFI', 'vlan 99', 'name MGMT'].concat(routed('g1/1/1', '10.0.0.46'), routed('g1/1/2', '10.0.0.62'),
            ['interface loopback0', 'ip address 10.0.0.79 255.255.255.255'], trunks('g1/0/1 - 2'), trunks('g1/0/4 - 5'),
            svi(10, '10.1.0.2', M24, VIP[10], ['ip helper-address 10.5.0.10']), svi(20, '10.2.0.2', M24, VIP[20]), svi(40, '10.6.0.2', M24, VIP[40]), svi(99, '10.0.0.2', M28, VIP[99]),
            ospf('10.0.0.79', ['g1/1/1', 'g1/1/2'])),
          'DSW-A2': ['hostname DSW-A2', 'ip routing', 'vlan 10', 'name PCS', 'vlan 20', 'name PHONES', 'vlan 40', 'name WIFI', 'vlan 99', 'name MGMT'].concat(routed('g1/1/1', '10.0.0.50'), routed('g1/1/2', '10.0.0.66'),
            ['interface loopback0', 'ip address 10.0.0.80 255.255.255.255'], trunks('g1/0/1 - 2'), trunks('g1/0/4 - 5'),
            svi(10, '10.1.0.3', M24, VIP[10], ['ip helper-address 10.5.0.10']), svi(20, '10.2.0.3', M24, VIP[20]), svi(40, '10.6.0.3', M24, VIP[40]), svi(99, '10.0.0.3', M28, VIP[99])),
          'DSW-B1': ['hostname DSW-B1', 'ip routing', 'vlan 10,20,30,99', 'spanning-tree vlan 10,99 root primary', 'spanning-tree vlan 20,30 root secondary'].concat(routed('g1/1/1', '10.0.0.54'), routed('g1/1/2', '10.0.0.70'),
            ['interface loopback0', 'ip address 10.0.0.81 255.255.255.255'], trunks('g1/0/1'), trunks('g1/0/3'), trunks('g1/0/4 - 5'), ['channel-group 1 mode active'],
            svi(10, '10.3.0.2', M24, '10.3.0.1', ['standby 10 priority 110', 'standby 10 preempt']), svi(20, '10.4.0.2', M24, '10.4.0.1'), svi(30, '10.5.0.2', M24, '10.5.0.1'), svi(99, '10.0.0.18', M28, '10.0.0.17', ['standby 99 priority 110', 'standby 99 preempt']),
            ospf('10.0.0.81', ['g1/1/1', 'g1/1/2'])),
          'DSW-B2': ['hostname DSW-B2', 'ip routing', 'vlan 10,20,30,99', 'spanning-tree vlan 20,30 root primary', 'spanning-tree vlan 10,99 root secondary'].concat(routed('g1/1/1', '10.0.0.58'), routed('g1/1/2', '10.0.0.74'),
            ['interface loopback0', 'ip address 10.0.0.82 255.255.255.255'], trunks('g1/0/1'), trunks('g1/0/3'), trunks('g1/0/4 - 5'), ['channel-group 1 mode active'],
            svi(10, '10.3.0.3', M24, '10.3.0.1'), svi(20, '10.4.0.3', M24, '10.4.0.1', ['standby 20 priority 110', 'standby 20 preempt']), svi(30, '10.5.0.3', M24, '10.5.0.1', ['standby 30 priority 110', 'standby 30 preempt']), svi(99, '10.0.0.19', M28, '10.0.0.17'),
            ospf('10.0.0.82', ['g1/1/1', 'g1/1/2'])),
          'ASW-A1': ['hostname ASW-A1'],
          'ASW-A2': ['hostname ASW-A2', 'vlan 10,20,40,99', 'interface f0/1', 'switchport mode access', 'switchport access vlan 20', 'interface range g0/1 - 2', 'switchport mode trunk', 'interface vlan 99', 'ip address 10.0.0.5 255.255.255.240', 'no shutdown', 'ip default-gateway 10.0.0.1'],
          'ASW-B1': ['hostname ASW-B1', 'vlan 10,20,30,99', 'interface f0/3', 'switchport mode access', 'switchport access vlan 10', 'interface range g0/1 - 2', 'switchport mode trunk', 'interface vlan 99', 'ip address 10.0.0.20 255.255.255.240', 'no shutdown', 'ip default-gateway 10.0.0.17'],
          'ASW-B3': ['hostname ASW-B3', 'vlan 10,20,30,99', 'interface f0/1', 'switchport mode access', 'switchport access vlan 30', 'interface range g0/1 - 2', 'switchport mode trunk', 'interface vlan 99', 'ip address 10.0.0.22 255.255.255.240', 'no shutdown', 'ip default-gateway 10.0.0.17'] }
      },
      map: { w: 760, h: 500, nodes: [
          { id: 'ISPA', label: 'ISPA', type: 'cloud', x: 270, y: 34 }, { id: 'ISPB', label: 'ISPB · backup', type: 'cloud', x: 500, y: 34 },
          { id: 'R1', label: 'R1 · the edge', type: 'router', x: 385, y: 104 },
          { id: 'CSW1', label: 'CSW1 · core', type: 'switch', x: 250, y: 184 }, { id: 'CSW2', label: 'CSW2 · core', type: 'switch', x: 520, y: 184 },
          { id: 'DSW-A1', label: 'DSW-A1 · clinic', type: 'switch', x: 110, y: 278 }, { id: 'DSW-A2', label: 'DSW-A2 · clinic', type: 'switch', x: 290, y: 278 },
          { id: 'DSW-B1', label: 'DSW-B1 · servers', type: 'switch', x: 480, y: 278 }, { id: 'DSW-B2', label: 'DSW-B2 · servers', type: 'switch', x: 660, y: 278 },
          { id: 'ASW-A1', label: 'ASW-A1 · new wing', type: 'switch', x: 120, y: 372 }, { id: 'ASW-A2', label: 'ASW-A2 · ward phones', type: 'switch', x: 300, y: 372 },
          { id: 'ASW-B1', label: 'ASW-B1', type: 'switch', x: 480, y: 372 }, { id: 'ASW-B3', label: 'ASW-B3', type: 'switch', x: 670, y: 372 },
          { id: 'LWAP1', label: 'LWAP1', type: 'pc', x: 26, y: 456, small: true }, { id: 'WLC1', label: 'WLC1', type: 'server', x: 84, y: 456, small: true },
          { id: 'PC-A1', label: 'nurses\' station', type: 'pc', x: 150, y: 456, small: true }, { id: 'PC-A2', label: 'ward PC', type: 'pc', x: 216, y: 456, small: true },
          { id: 'Phone1', label: 'ward phone', type: 'pc', x: 300, y: 456, small: true }, { id: 'PC-B1', label: 'street PC', type: 'pc', x: 480, y: 456, small: true },
          { id: 'SRV1', label: 'SRV1 · street servers', type: 'server', x: 670, y: 456, small: true } ],
        links: [ { a: 'R1', b: 'ISPA' }, { a: 'R1', b: 'ISPB' }, { a: 'R1', b: 'CSW1' }, { a: 'R1', b: 'CSW2' }, { a: 'CSW1', b: 'CSW2' },
          { a: 'CSW1', b: 'DSW-A1' }, { a: 'CSW1', b: 'DSW-A2' }, { a: 'CSW1', b: 'DSW-B1' }, { a: 'CSW1', b: 'DSW-B2' }, { a: 'CSW2', b: 'DSW-A1' }, { a: 'CSW2', b: 'DSW-A2' }, { a: 'CSW2', b: 'DSW-B1' }, { a: 'CSW2', b: 'DSW-B2' },
          { a: 'DSW-A1', b: 'DSW-A2', tag: 'G1/0/4-5' }, { a: 'DSW-B1', b: 'DSW-B2', tag: 'Po1' },
          { a: 'DSW-A1', b: 'ASW-A1' }, { a: 'DSW-A2', b: 'ASW-A1' }, { a: 'DSW-A1', b: 'ASW-A2' }, { a: 'DSW-A2', b: 'ASW-A2' },
          { a: 'DSW-B1', b: 'ASW-B1' }, { a: 'DSW-B2', b: 'ASW-B1' }, { a: 'DSW-B1', b: 'ASW-B3' }, { a: 'DSW-B2', b: 'ASW-B3' },
          { a: 'ASW-A1', b: 'LWAP1' }, { a: 'ASW-A1', b: 'WLC1' }, { a: 'ASW-A1', b: 'PC-A1' }, { a: 'ASW-A1', b: 'PC-A2' }, { a: 'ASW-A2', b: 'Phone1' }, { a: 'ASW-B1', b: 'PC-B1' }, { a: 'ASW-B3', b: 'SRV1' } ] },
      steps: [
        // Act I · the access floor
        { type: 'cmd', skill: 'vlan-config', text: 'Vee Lan, at the wing\'s rack with her sleeves pushed up: "ASW-A1 is out of its box and knows nothing. Give it VLANs 10, 20, 40 and 99. The nurses\' station on f0/3 and the ward PC on f0/4 go in VLAN 10. Its two uplinks, g0/1 and g0/2, are trunks. Old Root is watching from the back, so do it properly."',
          check: (d, ctx) => { const n = ctx.net(), c = ctx.cfg('ASW-A1'); return [10, 20, 40, 99].every(v => c.vlans[v]) && n.vlanOf('ASW-A1', fa(3)) === 10 && n.vlanOf('ASW-A1', fa(4)) === 10 && n.trunk('ASW-A1', gi(1)) && n.trunk('ASW-A1', gi(2)) && c.interfaces[gi(1)] && c.interfaces[gi(1)].mode === 'trunk' && c.interfaces[gi(2)] && c.interfaces[gi(2)].mode === 'trunk' && n.ping('PC-A1', VIP[10]).ok; },
          hint: 'ASW-A1(config)# vlan 10,20,40,99\nASW-A1(config-vlan)# interface range f0/3 - 4\nASW-A1(config-if-range)# switchport mode access\nASW-A1(config-if-range)# switchport access vlan 10\nASW-A1(config-if-range)# interface range g0/1 - 2\nASW-A1(config-if-range)# switchport mode trunk',
          ok: 'Vee Lan: "The nurses\' station reaches its gateway. The wing has borders."',
          why: 'Vee Lan: vlan 10,20,40,99 creates the VLANs. An access port belongs to one VLAN: switchport mode access, then switchport access vlan 10. A trunk carries every VLAN between switches with 802.1Q tags: switchport mode trunk, set on purpose rather than left to DTP. With both, the PC in VLAN 10 reaches the HSRP gateway 10.1.0.1 on the distribution pair.' },
        // Act II · the bundle
        { type: 'cmd', skill: 'etherchannel', text: 'Vee Lan: "DSW-A1 and DSW-A2 have two cables between them, g1/0/4 and g1/0/5, and spanning tree is blocking one of them. Bundle them into one Port-channel with LACP on both switches."',
          check: (d, ctx) => { const b = Object.values(ctx.net().bundles).find(g => [g.a, g.b].sort().join('|') === 'DSW-A1|DSW-A2'); return !!b && b.links.length === 2; },
          hint: 'DSW-A1(config)# interface range g1/0/4 - 5\nDSW-A1(config-if-range)# channel-group 1 mode active\n(the same on DSW-A2: active, or passive)',
          ok: 'Vee Lan, not looking at the back row: "Both cables carrying, and nothing blocked. I paid that one back a long time ago."',
          why: 'Vee Lan: channel-group 1 mode active runs LACP and bundles the two ports into Port-channel 1. LACP needs at least one side active: active with active, or active with passive. Spanning tree then sees one logical link, so neither cable is blocked and both carry traffic.' },
        // Act II · the routes
        { type: 'cmd', skill: 'ospf-basics', text: 'Ospef, arms folded, reading the plan: "DSW-A2 has not said a word to anyone. Bring it into OSPF, process 1, area 0, with every 10 network. Make every interface passive except its two uplinks to the cores. Nobody moves until it agrees with the others."',
          check: (d, ctx) => { const n = ctx.net(); const nb = n.ospfNeighbors('DSW-A2'); const r = n.route('R1', '10.0.0.80/32'); const o = n.state.ospf.routers['DSW-A2']; const v10 = o && o.ifaces.find(x => x.iface === 'vlan10');
            return nb.length === 2 && nb.every(x => x.dev === 'CSW1' || x.dev === 'CSW2') && !!r && r.proto === 'O' && !!v10 && v10.passive; },
          hint: 'DSW-A2(config)# router ospf 1\nDSW-A2(config-router)# router-id 10.0.0.80\nDSW-A2(config-router)# network 10.0.0.0 0.255.255.255 area 0\nDSW-A2(config-router)# passive-interface default\nDSW-A2(config-router)# no passive-interface g1/1/1\nDSW-A2(config-router)# no passive-interface g1/1/2',
          ok: 'Ospef: "Two neighbours, both cores, and R1 knows DSW-A2\'s loopback."',
          why: 'Ospef: network 10.0.0.0 0.255.255.255 area 0 puts every interface with a 10 address into OSPF area 0. passive-interface default stops OSPF hellos on all of them, so the switch still advertises its VLAN subnets but forms no neighbours on the user VLANs. no passive-interface on the two routed uplinks lets it become neighbours with CSW1 and CSW2, and its loopback 10.0.0.80 reaches R1\'s table as an O route.' },
        // Act III · the leases
        { type: 'cmd', skill: 'dhcp-snooping', text: 'Ace, with Sticky sitting at her feet facing the hall: "The ward PC on f0/4 gets its address from SRV1 across the building. Before the doors open, nothing on this wing gets a lease from anywhere else. DHCP snooping on ASW-A1 for VLAN 10, and trust only the ports the real offers come in on."',
          check: (d, ctx) => { const n = ctx.net(), c = ctx.cfg('ASW-A1'); const l = n.lease('PC-A2'); return c.dhcp.snooping && c.dhcp.snoopVlans.has(10) && !!l && l.ok && !l.rogue && l.server === 'SRV1' && c.interfaces[fa(4)] && !c.interfaces[fa(4)].snoopTrust; },
          hint: 'ASW-A1(config)# ip dhcp snooping\nASW-A1(config)# ip dhcp snooping vlan 10\nASW-A1(config)# interface range g0/1 - 2\nASW-A1(config-if-range)# ip dhcp snooping trust',
          ok: 'Ace: "The ward PC has its lease from SRV1, through a door we chose. Sticky can stop staring at the builders\' cupboard."',
          why: 'Ace: DHCP snooping drops DHCP server messages that arrive on untrusted ports. It must be switched on globally and for each VLAN. The real offers from SRV1 come in over the uplinks from the distribution pair, which relays them with ip helper-address, so g0/1 and g0/2 are trusted. The PC ports stay untrusted, so a DHCP server plugged in there would be ignored.' },
        // Act III · the locks
        { type: 'cmd', skill: 'ssh', text: 'Shell, speaking quietly so nobody else hears the password: "Ansible\'s play reaches ASW-A1 over SSH and nothing else. Give it its management address, 10.0.0.4/28 in VLAN 99, with 10.0.0.1 as its default gateway, then SSH only: a domain, RSA keys of at least 2048 bits, a local user, and the vty lines set to log in locally and accept only SSH."',
          check: (d, ctx) => { const n = ctx.net(), c = ctx.cfg('ASW-A1'); return n.sshReady('ASW-A1').ok && c.sshKeyBits >= 2048 && !(c.vty.transport || []).includes('telnet') && n.ping('PC-B1', '10.0.0.4').ok; },
          hint: 'ASW-A1(config)# interface vlan 99\nASW-A1(config-if)# ip address 10.0.0.4 255.255.255.240\nASW-A1(config-if)# no shutdown\nASW-A1(config-if)# exit\nASW-A1(config)# ip default-gateway 10.0.0.1\nASW-A1(config)# ip domain-name watson.lab\nASW-A1(config)# crypto key generate rsa modulus 2048\nASW-A1(config)# username shell secret <password>\nASW-A1(config)# line vty 0 15\nASW-A1(config-line)# login local\nASW-A1(config-line)# transport input ssh',
          ok: 'Shell: "A machine on the far side of the building can reach it, and only over SSH. Nothing crosses in the clear."',
          why: 'Shell: A Layer 2 switch is managed through an SVI, here VLAN 99 with 10.0.0.4/28, and it uses ip default-gateway to answer anyone outside that subnet. SSH needs a domain name and RSA keys, a local username for login local, and transport input ssh on the vty lines so Telnet is refused.' },
        // Act III · the mask
        { type: 'cmd', skill: 'nat-dynamic', text: 'Nat, leaning on R1\'s rack as if it owed him money: "Everything in here is a 10 address, and ISPA drops every one of them. Give the whole building one mask: PAT on R1, every 10 address translated to G0/0/0\'s address on the way out. The cores\' side is inside, the ISPs\' side is outside."',
          check: (d, ctx) => { const n = ctx.net(); const p = n.ping('PC-A1', '8.8.8.8'); return p.ok && (p.nat || []).some(t => t.global === '203.0.113.2') && n.ping('PC-B1', '8.8.8.8').ok; },
          hint: 'R1(config)# access-list 1 permit 10.0.0.0 0.255.255.255\nR1(config)# ip nat inside source list 1 interface g0/0/0 overload\nR1(config)# interface range g0/0 - 1\nR1(config-if-range)# ip nat inside\nR1(config-if-range)# interface g0/0/0\nR1(config-if)# ip nat outside\nR1(config-if)# interface g0/1/0\nR1(config-if)# ip nat outside',
          ok: 'Nat: "One face for the whole street. ISPA sees 203.0.113.2 and nothing else."',
          why: 'Nat: PAT (NAT overload) translates many inside local addresses to one inside global address, keeping them apart by port number. access-list 1 chooses which addresses are translated, ip nat inside source list 1 interface g0/0/0 overload uses G0/0/0\'s address, and every interface is marked ip nat inside (towards the cores) or ip nat outside (towards the ISPs). Traffic arriving from both cores has to be inside.' },
        // Act IV · the architecture
        { type: 'cmd', skill: 'lan-arch', text: 'Prof. Hypervisor, pencil behind her ear: "Now the clinic\'s pair. Split the work and make each VLAN\'s root bridge its HSRP active: DSW-A1 for VLANs 10 and 99, DSW-A2 for VLANs 20 and 40, each the backup root for the other two. Priority 110 on the active side, with preempt."',
          check: (d, ctx) => { const n = ctx.net(); const own = { 10: 'DSW-A1', 99: 'DSW-A1', 20: 'DSW-A2', 40: 'DSW-A2' };
            return Object.keys(own).every(v => { const st = ctx.compute(+v); return !!(st && st.switches[own[v]] && st.switches[own[v]].isRoot) && n.hsrpActive(VIP[v]) === own[v]; }); },
          hint: 'DSW-A1(config)# spanning-tree vlan 10,99 root primary\nDSW-A1(config)# spanning-tree vlan 20,40 root secondary\nDSW-A1(config)# interface vlan 10\nDSW-A1(config-if)# standby 10 priority 110\nDSW-A1(config-if)# standby 10 preempt\n(the same for vlan 99 on DSW-A1, and for 20 and 40 on DSW-A2, with root primary for 20,40 and root secondary for 10,99)',
          ok: 'Prof. Hypervisor: "Four VLANs, and each one\'s root and gateway are the same box. Old Root just uncrossed his arms."',
          why: 'Prof. Hypervisor: spanning-tree vlan 10,99 root primary makes DSW-A1 the root bridge for those VLANs, and root secondary makes it the backup for the others. standby N priority 110 beats the default of 100, and preempt lets it take the active role back after a reboot. With the root and the active gateway on the same switch for each VLAN, frames from the access switches reach their gateway without crossing the distribution link, and the two switches share the load.' },
        // Act IV · the radio
        { type: 'cmd', skill: 'wlc-config', text: 'Beacon, antenna headband crooked, one eye on the wing across the street: "The wing\'s AP is on f0/1 and its controller is on f0/2, and both of them live in the management VLAN, 99. The AP is lightweight. Give them the right kind of port, and let LWAP1 find WLC1 and the servers."',
          check: (d, ctx) => { const n = ctx.net(); return n.vlanOf('ASW-A1', fa(1)) === 99 && !n.trunk('ASW-A1', fa(1)) && n.vlanOf('ASW-A1', fa(2)) === 99 && n.ping('LWAP1', '10.0.0.7').ok && n.ping('LWAP1', '10.5.0.10').ok; },
          hint: 'ASW-A1(config)# interface range f0/1 - 2\nASW-A1(config-if-range)# switchport mode access\nASW-A1(config-if-range)# switchport access vlan 99',
          ok: 'Beacon: "LWAP1 just joined WLC1. Across the street, the wing\'s SSIDs are on the air."',
          why: 'Beacon: A lightweight AP sends everything to its WLC inside CAPWAP tunnels, so it needs one VLAN and connects to an access port. Here the AP and the controller\'s management interface are both in VLAN 99, and the AP reaches the servers through the management VLAN\'s gateway, 10.0.0.1.' },
        // Opening Night · the proof
        { type: 'cmd', skill: 'packet-life', text: 'Dispatch, in your ear: "Eleven minutes. Prove it end to end and save it. From the nurses\' station, ping SRV1 at 10.5.0.10. From the ward PC, ping the internet, 8.8.8.8. Then write memory on every box you touched: ASW-A1, DSW-A1, DSW-A2, R1."',
          need: [ { dev: 'PC-A1', line: /^ping 10\.5\.0\.10$/ }, { dev: 'PC-A2', line: /^ping 8\.8\.8\.8$/ }, { dev: 'ASW-A1', line: saved }, { dev: 'DSW-A1', line: saved }, { dev: 'DSW-A2', line: saved }, { dev: 'R1', line: saved } ],
          check: (d, ctx) => { const n = ctx.net(); return n.ping('PC-A1', '10.5.0.10').ok && n.ping('PC-A2', '8.8.8.8').ok && n.ping('Phone1', '10.3.0.10').ok && n.ping('LWAP1', '10.0.0.7').ok && ['ASW-A1', 'DSW-A1', 'DSW-A2', 'R1'].every(x => d[x].startup); },
          hint: 'PC-A1 shell:  C:\\> ping 10.5.0.10\nPC-A2 shell:  C:\\> ping 8.8.8.8\nthen on ASW-A1, DSW-A1, DSW-A2 and R1:  # write memory',
          ok: 'On Clerk Adebayo\'s laptop the last grey square turns green.',
          why: 'Dispatch: A ping from the wing to SRV1 crosses the access switch, the distribution pair, a core and the servers\' side, so it proves every layer on the way. A ping to the internet from the ward PC proves its DHCP lease, the default route OSPF carried from R1, and PAT. write memory copies each running-config to startup-config, so a power cut at one minute past midnight changes nothing.' }
      ],
      solution: [
        { dev: 'ASW-A1', type: ['enable', 'configure terminal', 'vlan 10,20,40,99', 'interface range f0/3 - 4', 'switchport mode access', 'switchport access vlan 10', 'interface range g0/1 - 2', 'switchport mode trunk'] }, 'commit',
        { dev: 'DSW-A1', type: ['enable', 'configure terminal', 'interface range g1/0/4 - 5', 'channel-group 1 mode active'] }, { dev: 'DSW-A2', type: ['enable', 'configure terminal', 'interface range g1/0/4 - 5', 'channel-group 1 mode active'] }, 'commit',
        { dev: 'DSW-A2', type: ['router ospf 1', 'router-id 10.0.0.80', 'network 10.0.0.0 0.255.255.255 area 0', 'passive-interface default', 'no passive-interface g1/1/1', 'no passive-interface g1/1/2'] }, 'commit',
        { dev: 'ASW-A1', type: ['ip dhcp snooping', 'ip dhcp snooping vlan 10', 'interface range g0/1 - 2', 'ip dhcp snooping trust'] }, 'commit',
        { dev: 'ASW-A1', type: ['interface vlan 99', 'ip address 10.0.0.4 255.255.255.240', 'no shutdown', 'exit', 'ip default-gateway 10.0.0.1', 'ip domain-name watson.lab', 'crypto key generate rsa modulus 2048', 'username shell secret nightshift', 'line vty 0 15', 'login local', 'transport input ssh'] }, 'commit',
        { dev: 'R1', type: ['enable', 'configure terminal', 'access-list 1 permit 10.0.0.0 0.255.255.255', 'ip nat inside source list 1 interface g0/0/0 overload', 'interface range g0/0 - 1', 'ip nat inside', 'interface g0/0/0', 'ip nat outside', 'interface g0/1/0', 'ip nat outside'] }, 'commit',
        { dev: 'DSW-A1', type: ['spanning-tree vlan 10,99 root primary', 'spanning-tree vlan 20,40 root secondary', 'interface vlan 10', 'standby 10 priority 110', 'standby 10 preempt', 'interface vlan 99', 'standby 99 priority 110', 'standby 99 preempt'] },
        { dev: 'DSW-A2', type: ['spanning-tree vlan 20,40 root primary', 'spanning-tree vlan 10,99 root secondary', 'interface vlan 20', 'standby 20 priority 110', 'standby 20 preempt', 'interface vlan 40', 'standby 40 priority 110', 'standby 40 preempt'] }, 'commit',
        { dev: 'ASW-A1', type: ['interface range f0/1 - 2', 'switchport mode access', 'switchport access vlan 99'] }, 'commit',
        { dev: 'PC-A1', type: ['ping 10.5.0.10'] }, { dev: 'PC-A2', type: ['ping 8.8.8.8'] },
        { dev: 'ASW-A1', type: ['end', 'write memory'] }, { dev: 'DSW-A1', type: ['end', 'write memory'] }, { dev: 'DSW-A2', type: ['end', 'write memory'] }, { dev: 'R1', type: ['end', 'write memory'] }, 'commit' ],
      outro: 'At eleven minutes to midnight Clerk Adebayo stands, opens the ledger and reads the result into the hall: every box on the dashboard green, the clinic\'s new wing carried on the street\'s own network, Halvorsen Consolidated\'s tender declined, and the Watson Exchange to stay in the district\'s hands. Across the street the new wing\'s lights come on floor by floor, and a nurse at a second-floor window lifts a ward phone to her ear. At the back of the hall Old Root catches your eye and nods once. Vesper Kade buttons her grey coat on her way to the door and stops beside you. "I told the council the street couldn\'t keep its own net, and tonight it did." She goes out into the street without looking back.\n\nDISPATCH » Well done.' }
  );
})();
