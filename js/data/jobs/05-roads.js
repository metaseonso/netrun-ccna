/* jobs/05-roads.js — District 05 · The Roads (the cab rank and the map room): static routes, the life of a packet, dynamic routing, RIP, EIGRP, OSPF, HSRP. */
(function(){
  const { gi } = NETKIT;
  JOBS.push(
    // ------------------------------------------------------------------ night 24 · from Lab 24 (floating static routes)
    { id: 'c-n24-back-road', cls: 'C', rep: 15, from: 'nexthop', title: 'The Back Road', day: [24], requires: ['n24-night-routes'], devices: ['R1', 'R4', 'PC1'],
      brief: 'DISPATCH » The cab rank\'s link to the depot runs over the bridge, and the bridge closes for repairs every night at one. Nexthop wants a back road through the canal office that only opens when the bridge road is gone.\n\nCLIENT (Nexthop) » "OSPF already knows the bridge. I want the canal on a card, floating, and I want to watch it take over."',
      net: {
        devices: {
          R1: { kind: 'router' }, R2: { kind: 'router' }, R3: { kind: 'router' }, R4: { kind: 'router' },
          PC1: { kind: 'host', ip: '10.24.1.10', mask: '255.255.255.0', gw: '10.24.1.1' }, PC4: { kind: 'host', ip: '10.24.4.10', mask: '255.255.255.0', gw: '10.24.4.1' }
        },
        links: [ { a: 'PC1', b: 'R1', bp: gi(0) }, { a: 'R1', ap: gi(1), b: 'R2', bp: gi(0) }, { a: 'R2', ap: gi(1), b: 'R4', bp: gi(1) }, { a: 'R1', ap: gi(2), b: 'R3', bp: gi(0) }, { a: 'R3', ap: gi(1), b: 'R4', bp: gi(2) }, { a: 'R4', ap: gi(0), b: 'PC4' } ],
        preconfig: {
          R1: ['interface g0/0', 'ip address 10.24.1.1 255.255.255.0', 'no shutdown', 'interface g0/1', 'ip address 10.24.12.1 255.255.255.252', 'no shutdown', 'interface g0/2', 'ip address 10.24.13.1 255.255.255.252', 'no shutdown',
            'router ospf 1', 'network 10.24.1.0 0.0.0.255 area 0', 'network 10.24.12.0 0.0.0.3 area 0', 'passive-interface g0/0'],
          R2: ['interface g0/0', 'ip address 10.24.12.2 255.255.255.252', 'no shutdown', 'interface g0/1', 'ip address 10.24.24.1 255.255.255.252', 'no shutdown', 'router ospf 1', 'network 10.24.12.0 0.0.0.3 area 0', 'network 10.24.24.0 0.0.0.3 area 0'],
          R3: ['interface g0/0', 'ip address 10.24.13.2 255.255.255.252', 'no shutdown', 'interface g0/1', 'ip address 10.24.34.1 255.255.255.252', 'no shutdown', 'ip route 10.24.1.0 255.255.255.0 10.24.13.1', 'ip route 10.24.4.0 255.255.255.0 10.24.34.2'],
          R4: ['interface g0/0', 'ip address 10.24.4.1 255.255.255.0', 'no shutdown', 'interface g0/1', 'ip address 10.24.24.2 255.255.255.252', 'no shutdown', 'interface g0/2', 'ip address 10.24.34.2 255.255.255.252', 'no shutdown',
            'router ospf 1', 'network 10.24.4.0 0.0.0.255 area 0', 'network 10.24.24.0 0.0.0.3 area 0', 'passive-interface g0/0']
        }
      },
      map: { w: 560, h: 330, nodes: [
          { id: 'PC1', label: 'cab rank dispatch', type: 'pc', x: 40, y: 160 }, { id: 'R1', label: 'R1 · the cab rank', type: 'router', x: 150, y: 160 },
          { id: 'R2', label: 'R2 · the bridge', type: 'router', x: 290, y: 60 }, { id: 'R3', label: 'R3 · the canal office', type: 'router', x: 290, y: 260 },
          { id: 'R4', label: 'R4 · the depot', type: 'router', x: 430, y: 160 }, { id: 'PC4', label: 'depot dispatch', type: 'pc', x: 530, y: 160 } ],
        links: [ { a: 'PC1', b: 'R1' }, { a: 'R1', b: 'R2', ap: gi(1), bp: gi(0), tag: 'OSPF' }, { a: 'R2', b: 'R4', ap: gi(1), bp: gi(1), tag: 'OSPF' }, { a: 'R1', b: 'R3', ap: gi(2), bp: gi(0), tag: 'the canal' }, { a: 'R3', b: 'R4', ap: gi(1), bp: gi(2), tag: 'the canal' }, { a: 'R4', b: 'PC4' } ] },
      steps: [
        { type: 'cmd', skill: 'dynamic-routing', text: 'Nexthop, over the radio: "Start at the rank. Show me R1\'s routing table and find the depot, 10.24.4.0/24."',
          need: [ { dev: 'R1', line: /^(do )?show ip route$/ } ], hint: 'R1> enable\nR1# show ip route', ok: 'Nexthop: "There it is, an O. OSPF heard about the depot over the bridge."',
          why: 'Nexthop: show ip route lists every route the router has chosen. The code at the start of a line says where it came from: C connected, S static, O OSPF. R1 learned 10.24.4.0/24 from OSPF, so it starts with O, and the via address is R2 on the bridge.' },
        { type: 'calc', skill: 'dynamic-routing', text: 'Nexthop: "Read me the numbers in the brackets on that line."',
          fields: [ { key: 'ad', label: 'administrative distance', check: v => String(v).trim() === '110' }, { key: 'metric', label: 'metric', check: v => String(v).trim() === '3' },
            { key: 'via', label: 'next hop', check: v => String(v).trim() === '10.24.12.2' } ],
          answer: 'O 10.24.4.0/24 [110/3] via 10.24.12.2: AD 110, metric 3, next hop 10.24.12.2.', hint: 'The brackets read [AD/metric].', ok: 'Nexthop: "One-ten and three. OSPF\'s distance, and the cost of the road."',
          why: 'Nexthop: In a route line the brackets hold [administrative distance/metric]. OSPF\'s AD is 110, and the metric is the OSPF cost of the whole path: R1 to R2, R2 to R4, and R4\'s depot network, 1 each on gigabit, which makes 3. The address after via is the next hop, R2 at 10.24.12.2.' },
        { type: 'order', skill: 'dynamic-routing', text: 'A driver at the coffee van: "Settle something for us. Put these in the order a router trusts them, most trusted first."',
          items: ['OSPF', 'static route', 'RIP', 'EIGRP', 'connected', 'iBGP', 'eBGP', 'EIGRP external'],
          accept: arr => arr.join('|') === ['connected', 'static route', 'eBGP', 'EIGRP', 'OSPF', 'RIP', 'EIGRP external', 'iBGP'].join('|'),
          hint: 'Lowest AD first: 0, 1, 20, 90, 110, 120, 170, 200.', ok: 'Nexthop: "Connected, static, eBGP, EIGRP, OSPF, RIP, external EIGRP, iBGP. Pay the man."',
          why: 'Nexthop: A router trusts the lowest administrative distance most. Connected is 0, static 1, eBGP 20, EIGRP 90, OSPF 110, RIP 120, external EIGRP 170 and iBGP 200. IGRP is 100 and IS-IS 115, and a route with AD 255 is never used.' },
        { type: 'form', skill: 'dynamic-routing', text: 'Nexthop: "The new drivers keep mixing the families up. Sort them."',
          fields: [ { key: 'rip', label: 'RIP', options: ['distance vector', 'link state', 'path vector'], answer: 'distance vector' }, { key: 'eigrp', label: 'EIGRP', options: ['distance vector', 'link state', 'path vector'], answer: 'distance vector' },
            { key: 'ospf', label: 'OSPF', options: ['distance vector', 'link state', 'path vector'], answer: 'link state' }, { key: 'isis', label: 'IS-IS', options: ['distance vector', 'link state', 'path vector'], answer: 'link state' },
            { key: 'bgp', label: 'BGP', options: ['distance vector', 'link state', 'path vector'], answer: 'path vector' } ],
          hint: 'Rumours from neighbours, the whole map, or the path between organisations.', ok: 'Nexthop: "Two rumour-mongers, two map readers, and BGP on its own."',
          why: 'Nexthop: RIP and EIGRP are distance vector IGPs: each router only knows what its neighbours tell it, routing by rumour. OSPF and IS-IS are link state IGPs: every router builds a map of the whole network and works out the paths itself, which costs more CPU and reacts faster. BGP is the only EGP, and it is path vector.' },
        { type: 'cmd', skill: 'dynamic-routing', text: 'Nexthop: "Now write the canal on a card. On R1, a static route to the depot through the canal office at 10.24.13.2, and on R4 one back to the rank through 10.24.34.1. Both must float over OSPF."',
          check: (d, ctx) => { const f = (r, pre, via) => (ctx.cfg(r).routes || []).some(x => x.prefix === pre && x.mask === '255.255.255.0' && x.via === via && x.ad > 110 && x.ad < 255); const n = ctx.net(); return f('R1', '10.24.4.0', '10.24.13.2') && f('R4', '10.24.1.0', '10.24.34.1') && n.route('R1', '10.24.4.0/24').proto === 'O' && n.route('R4', '10.24.1.0/24').proto === 'O'; },
          hint: 'R1(config)# ip route 10.24.4.0 255.255.255.0 10.24.13.2 111\nR4(config)# ip route 10.24.1.0 255.255.255.0 10.24.34.1 111', ok: 'Nexthop: "Still an O in the table. The card\'s in the glovebox, waiting."',
          why: 'Nexthop: ip route network mask next-hop distance adds a static route with its own administrative distance. At the default of 1 it would beat OSPF and take over at once. At 111 it loses to OSPF\'s 110, so it stays out of the routing table while the OSPF route exists. That is a floating static route. R4 needs its own back to the rank, or the replies would have no way home.' },
        { type: 'cmd', skill: 'dynamic-routing', text: 'Nexthop: "One o\'clock. The bridge is shutting. Take R1\'s bridge link down, shut Gi0/1, and ping the depot dispatch at 10.24.4.10 from the rank."',
          need: [ { dev: 'PC1', line: /^ping 10\.24\.4\.10$/ } ], check: (d, ctx) => { const n = ctx.net(); const r = n.route('R1', '10.24.4.0/24'); return !n.up('R1', 'g0/1') && r && r.proto === 'S' && r.via === '10.24.13.2' && n.ping('PC1', '10.24.4.10').ok; },
          hint: 'R1(config)# interface g0/1\nR1(config-if)# shutdown\n\nPC1:\nC:\\> ping 10.24.4.10', ok: 'Nexthop: "Replies, round by the canal. S in the table, AD 111."',
          why: 'Nexthop: With Gi0/1 down, R1 loses its OSPF neighbour over the bridge and the OSPF route to the depot disappears. The floating static route, AD 111, is now the best route left, so it drops into the table as S via 10.24.13.2, and R4\'s floating route carries the replies back the same way.' },
        { type: 'choice', skill: 'dynamic-routing', text: 'The driver again: "Say OSPF hands the rank two roads to the depot, both with metric 3. Which one does it use?"',
          opts: ['Both. Equal metrics go into the table together and traffic is shared', 'The one it heard first', 'The one with the lower next-hop address', 'Neither until one is removed'], a: 0,
          hint: 'Equal cost multi-path.', ok: 'Nexthop: "Both. ECMP. Split the fares."',
          why: 'Nexthop: When one protocol offers two routes to the same network with the same metric, the router puts both in the table and load-balances across them. That is ECMP, equal cost multi-path.' },
        { type: 'cmd', skill: 'dynamic-routing', text: 'Nexthop: "Five o\'clock, the bridge opens. Bring Gi0/1 back and watch the card go back in the glovebox."',
          check: (d, ctx) => { const n = ctx.net(); const r = n.route('R1', '10.24.4.0/24'); return n.up('R1', 'g0/1') && r && r.proto === 'O'; },
          hint: 'R1(config-if)# no shutdown', ok: 'Nexthop: "O again. The canal waits for tomorrow night."',
          why: 'Nexthop: When Gi0/1 comes back, OSPF learns the depot over the bridge again. Its AD of 110 beats the static route\'s 111, so the OSPF route returns to the table and the floating static route drops back out, still configured, waiting for the next time.' }
      ],
      solution: [ { dev: 'R1', type: ['enable', 'show ip route'] }, 'commit', { calc: { ad: '110', metric: '3', via: '10.24.12.2' } }, 'commit', { order: [4, 1, 6, 3, 0, 2, 7, 5] }, 'commit',
        { form: { rip: 'distance vector', eigrp: 'distance vector', ospf: 'link state', isis: 'link state', bgp: 'path vector' } }, 'commit',
        { dev: 'R1', type: ['configure terminal', 'ip route 10.24.4.0 255.255.255.0 10.24.13.2 111'] }, { dev: 'R4', type: ['enable', 'configure terminal', 'ip route 10.24.1.0 255.255.255.0 10.24.34.1 111'] }, 'commit',
        { dev: 'R1', type: ['interface g0/1', 'shutdown'] }, { dev: 'PC1', type: ['ping 10.24.4.10'] }, 'commit', { choose: 0 }, 'commit', { dev: 'R1', type: ['no shutdown'] }, 'commit' ],
      outro: 'At ten past one the bridge goes dark and not one driver\'s radio asks which way now. The depot dispatcher sends Nexthop a photo of the canal road at dawn, empty and wet, with a thumbs-up drawn on it in marker.' }
  );
})();
