/* jobs/07-ice.js — District 07 · The ICE (the gate): ACLs, security fundamentals, port security, DHCP snooping, DAI. */
(function(){
  // the gate's network: R1 at the gate joins the clinic and the market; R2 behind it holds the records server and Ace's office
  const gateNet = (extra) => ({
    devices: Object.assign({
      R1: { kind: 'router' }, R2: { kind: 'router' }, SW1: { kind: 'switch', mac: '0034.0000.0001' }, SW2: { kind: 'switch', mac: '0034.0000.0002' },
      PC1: { kind: 'host', ip: '192.168.1.10', mask: '255.255.255.0', gw: '192.168.1.1' }, PC2: { kind: 'host', ip: '192.168.1.20', mask: '255.255.255.0', gw: '192.168.1.1' },
      PC3: { kind: 'host', ip: '192.168.2.10', mask: '255.255.255.0', gw: '192.168.2.1' }, PC5: { kind: 'host', ip: '192.168.2.11', mask: '255.255.255.0', gw: '192.168.2.1' },
      SRV1: { kind: 'server', ip: '10.0.20.10', mask: '255.255.255.0', gw: '10.0.20.1' }, PC4: { kind: 'host', ip: '10.0.30.10', mask: '255.255.255.0', gw: '10.0.30.1' }
    }, extra || {}),
    links: [ { a: 'R1', ap: 'gigabitethernet0/0', b: 'SW1', bp: 'gigabitethernet0/1' }, { a: 'SW1', ap: 'fastethernet0/1', b: 'PC1' }, { a: 'SW1', ap: 'fastethernet0/2', b: 'PC2' },
      { a: 'R1', ap: 'gigabitethernet0/1', b: 'SW2', bp: 'gigabitethernet0/1' }, { a: 'SW2', ap: 'fastethernet0/1', b: 'PC3' }, { a: 'SW2', ap: 'fastethernet0/2', b: 'PC5' },
      { a: 'R1', ap: 'gigabitethernet0/2', b: 'R2', bp: 'gigabitethernet0/2' }, { a: 'R2', ap: 'gigabitethernet0/0', b: 'SRV1' }, { a: 'R2', ap: 'gigabitethernet0/1', b: 'PC4' } ],
    preconfig: {
      R1: ['hostname R1', 'interface gigabitethernet0/0', 'ip address 192.168.1.1 255.255.255.0', 'no shutdown', 'interface gigabitethernet0/1', 'ip address 192.168.2.1 255.255.255.0', 'no shutdown',
        'interface gigabitethernet0/2', 'ip address 10.0.12.1 255.255.255.252', 'no shutdown', 'exit', 'ip route 10.0.20.0 255.255.255.0 10.0.12.2', 'ip route 10.0.30.0 255.255.255.0 10.0.12.2'],
      R2: ['hostname R2', 'interface gigabitethernet0/0', 'ip address 10.0.20.1 255.255.255.0', 'no shutdown', 'interface gigabitethernet0/1', 'ip address 10.0.30.1 255.255.255.0', 'no shutdown',
        'interface gigabitethernet0/2', 'ip address 10.0.12.2 255.255.255.252', 'no shutdown', 'exit', 'ip route 192.168.1.0 255.255.255.0 10.0.12.1', 'ip route 192.168.2.0 255.255.255.0 10.0.12.1']
    }
  });
  const gateMap = { w: 600, h: 360, nodes: [
      { id: 'PC1', label: 'clinic admin desk', type: 'pc', x: 50, y: 60 }, { id: 'PC2', label: 'clinic front desk', type: 'pc', x: 50, y: 140 }, { id: 'SW1', label: 'clinic switch', type: 'switch', x: 150, y: 100 },
      { id: 'PC3', label: 'market kiosk', type: 'pc', x: 50, y: 240 }, { id: 'PC5', label: 'market till', type: 'pc', x: 50, y: 320 }, { id: 'SW2', label: 'market switch', type: 'switch', x: 150, y: 280 },
      { id: 'R1', label: 'R1', type: 'router', x: 270, y: 190 }, { id: 'R2', label: 'R2', type: 'router', x: 420, y: 190 },
      { id: 'SRV1', label: 'records server', type: 'server', x: 540, y: 110 }, { id: 'PC4', label: 'Ace\'s office', type: 'pc', x: 540, y: 280 } ],
    links: [ { a: 'PC1', b: 'SW1' }, { a: 'PC2', b: 'SW1' }, { a: 'SW1', b: 'R1', tag: 'g0/0' }, { a: 'PC3', b: 'SW2' }, { a: 'PC5', b: 'SW2' }, { a: 'SW2', b: 'R1', tag: 'g0/1' },
      { a: 'R1', b: 'R2', tag: 'g0/2' }, { a: 'R2', b: 'SRV1', tag: 'g0/0' }, { a: 'R2', b: 'PC4', tag: 'g0/1' } ] };

  JOBS.push(
    // ------------------------------------------------------------------ night 34 · from Lab 34 (standard ACLs)
    { id: 'b-n34-records-door', cls: 'B', rep: 20, from: 'ace', title: 'The Records Door', day: [34], requires: ['n34-top-to-bottom'], devices: ['R2', 'R1', 'PC3', 'PC1'],
      brief: 'DISPATCH » A market kiosk reached the clinic\'s records server last night. Ace Elle wants a standard list on the records door before morning, and one on her own office.\n\nCLIENT (Ace Elle) » "Clinic desks get the records. Nobody else does. Then my office: the whole market may knock except the kiosk that did it."',
      net: gateNet(), map: gateMap,
      steps: [
        { type: 'find', skill: 'acl-standard', target: 'R2', text: 'Ace, clipboard under her arm: "A standard list only reads the source address. Click the router it belongs on if it has to protect the records server."',
          hint: 'Close to the destination. Which router is the records server plugged into?', ok: 'Ace: "R2. The last box before the server."',
          why: 'Ace: A standard ACL matches only the source address, so it can\'t tell traffic for the records server from traffic going anywhere else. Put it close to the destination, on R2, which the records server hangs off, and it only stops what is heading for the server.' },
        { type: 'cmd', skill: 'acl-standard', text: 'Ace: "Write list 10 on R2. Put a remark on it so the next person knows what it\'s for, then let the clinic\'s desks through, 192.168.1.0/24. Leave the rest to the bottom of the list."',
          check: (d, ctx) => { const n = ctx.net(); return n.aclTest('R2', '10', { src: '192.168.1.20' }).action === 'permit' && n.aclTest('R2', '10', { src: '192.168.1.10' }).action === 'permit' && n.aclTest('R2', '10', { src: '192.168.2.10' }).action === 'deny' && n.aclTest('R2', '10', { src: '10.0.30.10' }).action === 'deny'; },
          hint: 'R2> enable\nR2# configure terminal\nR2(config)# access-list 10 remark records: clinic desks only\nR2(config)# access-list 10 permit 192.168.1.0 0.0.0.255', ok: 'Ace: "One line and the one nobody writes. That\'s enough."',
          why: 'Ace: access-list 10 permit 192.168.1.0 0.0.0.255 matches every source from 192.168.1.0 to 192.168.1.255, the clinic\'s desks. Anything else reaches the bottom of the list and the implicit deny drops it, so the kiosk at 192.168.2.10 and my office are both refused without a deny line. The remark changes nothing for packets; it is a note for people.' },
        { type: 'cmd', skill: 'acl-standard', text: 'Ace: "The list is written and doing nothing. Put it outbound on R2\'s g0/0, the port to the records server. The kiosk must still reach my office."',
          check: (d, ctx) => { const n = ctx.net(); return n.ping('PC1', '10.0.20.10').ok && n.ping('PC2', '10.0.20.10').ok && !n.ping('PC3', '10.0.20.10').ok && n.ping('PC3', '10.0.30.10').ok && n.ping('PC5', '10.0.30.10').ok; },
          hint: 'R2(config)# interface g0/0\nR2(config-if)# ip access-group 10 out', ok: 'Ace: "Clinic in, kiosk out, and the market can still find my office."',
          why: 'Ace: ip access-group 10 out on g0/0 makes R2 check every packet leaving that port for the records server. Clinic sources match the permit and go through. Everyone else hits the implicit deny. Traffic to my office leaves by g0/1, where no list is applied, so nobody loses it.' },
        { type: 'cmd', skill: 'acl-standard', text: 'Ace: "Now knock from the kiosk yourself. Ping the records server at 10.0.20.10 from PC3."',
          need: [ { dev: 'PC3', line: /^ping 10\.0\.20\.10$/ } ], check: (d, ctx) => !ctx.net().ping('PC3', '10.0.20.10').ok,
          hint: 'PC3 console:\nC:\\> ping 10.0.20.10', ok: 'Ace: "Four timeouts. That\'s what the kiosk will see tonight."',
          why: 'Ace: The kiosk\'s ping crosses R1 and R2 and dies on its way out of R2\'s g0/0, where list 10 has no line for 192.168.2.10 and the implicit deny drops it. The reason line under the timeouts names the list and the port.' },
        { type: 'order', skill: 'acl-standard', text: 'Ace: "My office next. The kiosk at 192.168.2.10 stays out. The rest of the market may knock, and so may the clinic. Put these lines in the order I\'ll read them."',
          items: ['permit 192.168.2.0 0.0.0.255', 'deny host 192.168.2.10', 'permit 192.168.1.0 0.0.0.255'],
          accept: arr => arr.indexOf('deny host 192.168.2.10') < arr.indexOf('permit 192.168.2.0 0.0.0.255'),
          hint: 'The first line that matches wins. The kiosk matches two of these.', ok: 'Ace: "The kiosk meets its deny before it ever reaches the market\'s permit."',
          why: 'Ace: 192.168.2.10 matches both deny host 192.168.2.10 and permit 192.168.2.0 0.0.0.255. I stop at the first line that matches, so the deny has to sit above the permit. Put the permit first and the deny is never read. The clinic\'s line can go anywhere, because nothing else matches it.' },
        { type: 'cmd', skill: 'acl-standard', text: 'Ace: "Write it as a named list on R2, call it OFFICE, in that order. Put it outbound on g0/1, the port to my office."',
          check: (d, ctx) => { const n = ctx.net(); const c = ctx.cfg('R2'); const i = c.interfaces['gigabitethernet0/1']; const a = i && i.aclOut && c.acls[i.aclOut];
            return !!(a && a.type === 'standard' && !/^\d+$/.test(a.id)) && !n.ping('PC3', '10.0.30.10').ok && n.ping('PC5', '10.0.30.10').ok && n.ping('PC1', '10.0.30.10').ok; },
          hint: 'R2(config)# ip access-list standard OFFICE\nR2(config-std-nacl)# deny host 192.168.2.10\nR2(config-std-nacl)# permit 192.168.2.0 0.0.0.255\nR2(config-std-nacl)# permit 192.168.1.0 0.0.0.255\nR2(config-std-nacl)# interface g0/1\nR2(config-if)# ip access-group OFFICE out',
          ok: 'Ace: "The till gets in, the clinic gets in, the kiosk doesn\'t. Read it back with show access-lists if you like."',
          why: 'Ace: ip access-list standard OFFICE opens a named list, and each line you type gets the next sequence number: 10 deny host 192.168.2.10, 20 permit 192.168.2.0 0.0.0.255, 30 permit 192.168.1.0 0.0.0.255. Applied outbound on g0/1, it stops the kiosk at my office door, lets the market\'s till and the clinic through, and drops anyone else at the implicit deny.' },
        { type: 'calc', skill: 'acl-standard', text: 'Ace: "The clinic is giving its new pharmacy 192.168.1.64/26. When they want in, what wildcard do I write after 192.168.1.64? And what wildcard is the word host short for?"',
          fields: [ { key: 'w26', label: 'wildcard for a /26', check: v => String(v).trim() === '0.0.0.63' }, { key: 'host', label: 'wildcard meaning one host', check: v => String(v).trim() === '0.0.0.0' } ],
          answer: '0.0.0.63 · 0.0.0.0', hint: 'A wildcard is the subnet mask flipped: 255.255.255.255 minus the mask.', ok: 'Ace: "Sixty-three, and all zeros for one face."',
          why: 'Ace: A /26 mask is 255.255.255.192. The wildcard is 255.255.255.255 minus the mask, so 0.0.0.63: the last six bits are free and the rest must match, which covers 192.168.1.64 to 192.168.1.127. host 192.168.1.10 is short for 192.168.1.10 0.0.0.0, where every bit must match.' },
        { type: 'multi', skill: 'acl-standard', text: 'Ace, flipping back through the clipboard: "Old lists all over this district. Which of these numbers can only be standard lists?"',
          opts: ['1', '99', '100', '1300', '1999', '2000'], answers: [0, 1, 3, 4],
          hint: 'Two ranges: one for everyone, one for when those ran out.', ok: 'Ace: "1 to 99, and 1300 to 1999. The others are the long lists."',
          why: 'Ace: Standard numbered lists use 1 to 99 and, when those run out, 1300 to 1999. 100 and 2000 fall in the extended ranges, 100 to 199 and 2000 to 2699, which read far more than the source address.' }
      ],
      solution: [ { select: 'R2' }, 'commit',
        { dev: 'R2', type: ['enable', 'configure terminal', 'access-list 10 remark records: clinic desks only', 'access-list 10 permit 192.168.1.0 0.0.0.255'] }, 'commit',
        { dev: 'R2', type: ['interface g0/0', 'ip access-group 10 out', 'exit'] }, 'commit',
        { dev: 'PC3', type: ['ping 10.0.20.10'] }, 'commit',
        { order: [1, 0, 2] }, 'commit',
        { dev: 'R2', type: ['ip access-list standard OFFICE', 'deny host 192.168.2.10', 'permit 192.168.2.0 0.0.0.255', 'permit 192.168.1.0 0.0.0.255', 'interface g0/1', 'ip access-group OFFICE out', 'end'] }, 'commit',
        { calc: { w26: '0.0.0.63', host: '0.0.0.0' } }, 'commit', { multi: [0, 1, 3, 4] }, 'commit' ],
      outro: 'At six the kiosk knocks again, twice, and gets nothing. Ace writes the time under the pencilled date on her clipboard, and Imani\'s front desk opens the morning\'s records without noticing a thing. Sticky sleeps across the doorway until the rain stops.' }
  );
})();
