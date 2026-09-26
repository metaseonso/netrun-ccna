/* gig.template.js — copy into js/data/jobs.js (or a js/data/jobs/*.js file that pushes onto window.JOBS).
   This example is a complete Class C gig for Day 39 (DHCP) using the network engine. It passes `npm test` as written
   once the level ids in `requires` exist. Every step has text (the NPC talking), ok (reaction), why (plain answer). */
(function(){
  const gi = n => 'gigabitethernet0/' + n, fa = n => 'fastethernet0/' + n;
  window.JOBS = window.JOBS || [];
  JOBS.push({
    id: 'c-lease-wars', cls: 'C', rep: 60, from: 'denise', title: 'Lease Wars', day: [39],
    requires: ['denise-intro'], team: null,
    devices: ['R1', 'SW1', 'PC1'],
    brief: 'DISPATCH » Class C. The Charter Hill school says half the classroom PCs come up with no address in the morning. Denise thinks somebody is handing out leases who should not be.\n\nTEACHER » "Twelve machines, three work. The three that work cannot reach anything."',
    net: {
      devices: {
        R1: { kind: 'router' }, SW1: { kind: 'switch', mac: '0001.9642.a3c0' },
        PC1: { kind: 'host', dhcp: true }, PC2: { kind: 'host', dhcp: true },
        SRV: { kind: 'server', ip: '10.0.10.5', mask: '255.255.255.0', gw: '10.0.10.1' },
        ROGUE: { kind: 'rogue', role: 'dhcp', offer: { gw: '10.0.10.254', ip: '10.0.10.200', mask: '255.255.255.0' } }
      },
      links: [ { a: 'R1', ap: gi(0), b: 'SW1', bp: gi(1) }, { a: 'SW1', ap: fa(1), b: 'PC1' }, { a: 'SW1', ap: fa(2), b: 'PC2' }, { a: 'SW1', ap: fa(3), b: 'SRV' }, { a: 'SW1', ap: fa(9), b: 'ROGUE' } ],
      preconfig: { R1: ['interface g0/0', 'ip address 10.0.10.1 255.255.255.0', 'no shutdown'] },
      alert: ['ROGUE']
    },
    steps: [
      { type: 'cmd', skill: 'dhcp', text: 'Denise: "Start with the truth. Go to PC1 and ask it who gave it an address."', need: [ { dev: 'PC1', line: /^ipconfig/ } ], hint: 'PC1> ipconfig /all', ok: '"DHCP Server: ROGUE. There it is."',
        why: 'Denise: On a PC, ipconfig /all shows the address, the gateway and which server handed them out. If the server is not the router, someone else is answering the Discover first.' },
      { type: 'find', skill: 'dhcp', text: '"Click the thing that answered."', target: 'ROGUE', hint: 'The device the lease came from, drawn red.', ok: '"Desk 9. Of course it is desk 9."',
        why: 'Denise: The PC told you the server. The map shows which port that device is on. That is the rogue.' },
      { type: 'cmd', skill: 'dhcp', text: '"Now give the router a real pool so the classroom has somewhere legitimate to get addresses. Exclude .1 to .9, default router .1, DNS 10.0.10.5."',
        check: (d, ctx) => { const c = ctx.cfg('R1').dhcp; const p = Object.values(c.pools).find(x => x.network === '10.0.10.0'); return !!(p && p.router === '10.0.10.1' && p.dns.includes('10.0.10.5') && c.excluded.some(([a, b]) => a === '10.0.10.1' && b === '10.0.10.9')); },
        hint: 'R1(config)# ip dhcp excluded-address 10.0.10.1 10.0.10.9\nR1(config)# ip dhcp pool CLASS\nR1(dhcp-config)# network 10.0.10.0 255.255.255.0\nR1(dhcp-config)# default-router 10.0.10.1\nR1(dhcp-config)# dns-server 10.0.10.5', ok: '"Pool is up. The rogue is still faster, though."',
        why: 'Denise: A pool is four lines. Exclude the addresses you use by hand first, or the pool will hand them out. Then the pool: network, default-router, dns-server.' },
      { type: 'cmd', skill: 'dhcp', text: '"Make the switch refuse lease offers from anything except the router. Snooping on, VLAN 1, and the uplink is the only trusted port."',
        check: (d, ctx) => { const n = ctx.net(); const l = n.lease('PC1'); return !!(l && l.ok && !l.rogue && l.server === 'R1'); },
        hint: 'SW1(config)# ip dhcp snooping\nSW1(config)# ip dhcp snooping vlan 1\nSW1(config)# interface g0/1\nSW1(config-if)# ip dhcp snooping trust', ok: '"PC1 just got 10.0.10.10 from R1. Twelve machines will come up tomorrow."',
        why: 'Denise: DHCP snooping makes every port untrusted for server messages unless you say otherwise. The rogue on desk 9 is on an untrusted port, so its Offer is dropped. The router is behind g0/1, so trust g0/1. Check with ipconfig on PC1: the server is R1 now.' },
      { type: 'cmd', skill: 'dhcp', text: '"Prove the classroom can reach the file server."', check: (d, ctx) => ctx.net().ping('PC1', '10.0.10.5').ok && d.PC1.lines.some(r => /^ping 10\.0\.10\.5/.test(r.line)), hint: 'PC1> ping 10.0.10.5', ok: '"Reply from 10.0.10.5. Go home."',
        why: 'Denise: A lease from the right server gives the right gateway. With the right gateway and the same subnet, the ping to the server works. Type it on the PC so we both see it.' }
    ],
    solution: [ { dev: 'PC1', type: ['ipconfig /all'] }, 'commit', { select: 'ROGUE' }, 'commit',
      { dev: 'R1', type: ['en', 'conf t', 'ip dhcp excluded-address 10.0.10.1 10.0.10.9', 'ip dhcp pool CLASS', 'network 10.0.10.0 255.255.255.0', 'default-router 10.0.10.1', 'dns-server 10.0.10.5'] }, 'commit',
      { dev: 'SW1', type: ['en', 'conf t', 'ip dhcp snooping', 'ip dhcp snooping vlan 1', 'int g0/1', 'ip dhcp snooping trust'] }, 'commit',
      { dev: 'PC1', type: ['ping 10.0.10.5'] }, 'commit' ],
    outro: 'The teacher unplugs desk 9 herself. Denise: "Trust is a port setting. Everything else is hope." Dispatch: "Rep credited."'
  });
})();
