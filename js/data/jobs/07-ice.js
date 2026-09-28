/* jobs/07-ice.js — District 07 · The ICE (the gate): ACLs, security fundamentals, port security, DHCP snooping, DAI. */
(function(){
  // the gate's network: R1 at the gate joins the clinic and the market; R2 behind it holds the records server and Ace's office
  const gateNet = (extra, extraLinks, extraPre) => ({
    devices: Object.assign({
      R1: { kind: 'router' }, R2: { kind: 'router' }, SW1: { kind: 'switch', mac: '0034.0000.0001' }, SW2: { kind: 'switch', mac: '0034.0000.0002' },
      PC1: { kind: 'host', ip: '192.168.1.10', mask: '255.255.255.0', gw: '192.168.1.1' }, PC2: { kind: 'host', ip: '192.168.1.20', mask: '255.255.255.0', gw: '192.168.1.1' },
      PC3: { kind: 'host', ip: '192.168.2.10', mask: '255.255.255.0', gw: '192.168.2.1' }, PC5: { kind: 'host', ip: '192.168.2.11', mask: '255.255.255.0', gw: '192.168.2.1' },
      SRV1: { kind: 'server', ip: '10.0.20.10', mask: '255.255.255.0', gw: '10.0.20.1' }, PC4: { kind: 'host', ip: '10.0.30.10', mask: '255.255.255.0', gw: '10.0.30.1' }
    }, extra || {}),
    links: [ { a: 'R1', ap: 'gigabitethernet0/0', b: 'SW1', bp: 'gigabitethernet0/1' }, { a: 'SW1', ap: 'fastethernet0/1', b: 'PC1' }, { a: 'SW1', ap: 'fastethernet0/2', b: 'PC2' },
      { a: 'R1', ap: 'gigabitethernet0/1', b: 'SW2', bp: 'gigabitethernet0/1' }, { a: 'SW2', ap: 'fastethernet0/1', b: 'PC3' }, { a: 'SW2', ap: 'fastethernet0/2', b: 'PC5' },
      { a: 'R1', ap: 'gigabitethernet0/2', b: 'R2', bp: 'gigabitethernet0/2' }, { a: 'R2', ap: 'gigabitethernet0/0', b: 'SRV1' }, { a: 'R2', ap: 'gigabitethernet0/1', b: 'PC4' } ].concat(extraLinks || []),
    preconfig: {
      R1: ['hostname R1', 'interface gigabitethernet0/0', 'ip address 192.168.1.1 255.255.255.0', 'no shutdown', 'interface gigabitethernet0/1', 'ip address 192.168.2.1 255.255.255.0', 'no shutdown',
        'interface gigabitethernet0/2', 'ip address 10.0.12.1 255.255.255.252', 'no shutdown', 'exit', 'ip route 10.0.20.0 255.255.255.0 10.0.12.2', 'ip route 10.0.30.0 255.255.255.0 10.0.12.2'].concat((extraPre || {}).R1 || []),
      R2: ['hostname R2', 'interface gigabitethernet0/0', 'ip address 10.0.20.1 255.255.255.0', 'no shutdown', 'interface gigabitethernet0/1', 'ip address 10.0.30.1 255.255.255.0', 'no shutdown',
        'interface gigabitethernet0/2', 'ip address 10.0.12.2 255.255.255.252', 'no shutdown', 'exit', 'ip route 192.168.1.0 255.255.255.0 10.0.12.1', 'ip route 192.168.2.0 255.255.255.0 10.0.12.1'].concat((extraPre || {}).R2 || [])
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
          hint: 'R2> enable\nR2# configure terminal\nR2(config)# access-list 10 remark records: clinic desks only\nR2(config)# access-list 10 permit 192.168.1.0 0.0.0.255', ok: 'Ace: "One permit line, and the implicit deny that nobody writes does the rest."',
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
      outro: 'At six the kiosk knocks again, twice, and gets nothing. Ace writes the time under the pencilled date on her clipboard, and Imani\'s front desk opens the morning\'s records without noticing a thing. Sticky sleeps across the doorway until the rain stops.' },

    // ------------------------------------------------------------------ night 35 · from Lab 35 (extended ACLs)
    { id: 'b-n35-market-tills', cls: 'B', rep: 20, from: 'ace', title: 'The Market\'s Tills', day: [35], requires: ['n35-wrong-side'], devices: ['R1', 'PC5', 'PC3'],
      brief: 'DISPATCH » Every till in the market went dead at six. Somebody put a list on the gate router at dawn. Ace wants it gone and the right one in its place before the lunch crowd.\n\nCLIENT (Ace Elle) » "The market pays over 443 to the payments server and gets nowhere near the records. Everything else they do is their own business."',
      net: gateNet({ SRV2: { kind: 'server', ip: '10.0.40.10', mask: '255.255.255.0', gw: '10.0.40.1' } }, [ { a: 'R2', ap: 'gigabitethernet0/3', b: 'SRV2' } ], {
        R1: ['ip route 10.0.40.0 255.255.255.0 10.0.12.2', 'access-list 1 remark per gate policy', 'access-list 1 deny 192.168.2.0 0.0.0.255', 'access-list 1 permit any', 'interface gigabitethernet0/1', 'ip access-group 1 in'],
        R2: ['interface gigabitethernet0/3', 'ip address 10.0.40.1 255.255.255.0', 'no shutdown', 'exit', 'access-list 10 remark records: clinic desks only', 'access-list 10 permit 192.168.1.0 0.0.0.255', 'interface gigabitethernet0/0', 'ip access-group 10 out'] }),
      map: { w: 600, h: 400, nodes: gateMap.nodes.concat([ { id: 'SRV2', label: 'payments server', type: 'server', x: 540, y: 360 } ]).map(n => n.id === 'PC4' ? Object.assign({}, n, { y: 250 }) : n),
        links: gateMap.links.concat([ { a: 'R2', b: 'SRV2', tag: 'g0/3' } ]) },
      steps: [
        { type: 'cmd', skill: 'acl-extended', text: 'Ace: "Before you touch anything, look. Ask R1 which lists are on the market\'s port, g0/1."',
          need: [ { dev: 'R1', line: /^(do )?show ip interface gigabitethernet0\/1$/ } ],
          hint: 'R1> enable\nR1# show ip interface g0/1', ok: 'Ace: "Inbound access list is 1. That\'s this morning\'s."',
          why: 'Ace: show ip interface and a port name lists the lists applied to that port: Outgoing access list and Inbound access list. show access-lists tells you what a list says; show ip interface tells you where it is working.' },
        { type: 'choice', skill: 'acl-extended', text: 'Ace: "List 1 says deny 192.168.2.0 0.0.0.255, then permit any, inbound on g0/1. Tell me what it\'s doing to the market."',
          opts: ['Nothing, because numbered lists cannot be applied inbound', 'It stops every packet from the market at the gate, whatever it is for', 'It only stops the market reaching the records server', 'It stops traffic coming back to the market from the payments server'], a: 1,
          hint: 'A standard list reads one thing. Where does it stand?', ok: 'Ace: "Everything. The tills, the council, all of it."',
          why: 'Ace: A standard list matches the source only. Inbound on the market\'s port, every packet from 192.168.2.x hits the deny before the router has even looked where it is going, so the market loses everything past R1. That is a standard list on the wrong side of town: it belongs next to the destination.' },
        { type: 'cmd', skill: 'acl-extended', text: 'Ace: "Take it off the port, and delete the list so nobody puts it back by accident. The till at 192.168.2.11 should reach the payments page again."',
          check: (d, ctx) => { const i = ctx.cfg('R1').interfaces['gigabitethernet0/1']; return !(i && i.aclIn) && ctx.net().tcp('PC5', '10.0.40.10', 443).ok; },
          hint: 'R1# configure terminal\nR1(config)# interface g0/1\nR1(config-if)# no ip access-group 1 in\nR1(config-if)# exit\nR1(config)# no access-list 1', ok: 'Marrow, through the window: "Readers are green. I\'m closing the tab."',
          why: 'Ace: no ip access-group 1 in takes the list off the port, and the market\'s traffic is routed normally again. no access-list 1 in global config deletes the whole numbered list. Removing the list first matters: a port pointing at a list that doesn\'t exist permits everything, but a list you meant to delete can come back with one line.' },
        { type: 'form', skill: 'acl-extended', text: 'Ace, pencil ready: "An extended line names the protocol. Give me the protocol numbers, so you know what ip means when you write it."',
          fields: [ { key: 'icmp', label: 'ICMP', options: ['1', '6', '17', '88', '89'], answer: '1' }, { key: 'tcp', label: 'TCP', options: ['1', '6', '17', '88', '89'], answer: '6' },
            { key: 'udp', label: 'UDP', options: ['1', '6', '17', '88', '89'], answer: '17' }, { key: 'eigrp', label: 'EIGRP', options: ['1', '6', '17', '88', '89'], answer: '88' }, { key: 'ospf', label: 'OSPF', options: ['1', '6', '17', '88', '89'], answer: '89' } ],
          hint: 'ICMP is first. TCP 6, UDP 17. The two routing protocols sit together in the eighties.', ok: 'Ace: "One, six, seventeen, eighty-eight, eighty-nine."',
          why: 'Ace: The IP header has a protocol field that says what is inside the packet. ICMP is 1, TCP is 6, UDP is 17, EIGRP is 88 and OSPF is 89. An extended line that says ip matches every one of them; tcp, udp or icmp matches only that one.' },
        { type: 'cmd', skill: 'acl-extended', text: 'Ace: "Now the list the market should have had. Number 100, on R1. The market never reaches the records server at 10.0.20.10. It reaches the payments server at 10.0.40.10 on TCP 443 and nothing else. Everything else it does is allowed."',
          check: (d, ctx) => { const n = ctx.net(); const t = (src, dst, proto, dport) => n.aclTest('R1', '100', { src, dst, proto, dport }).action;
            return t('192.168.2.10', '10.0.20.10', 'tcp', 443) === 'deny' && t('192.168.2.11', '10.0.40.10', 'tcp', 443) === 'permit' && t('192.168.2.11', '10.0.40.10', 'tcp', 80) === 'deny' && t('192.168.2.11', '10.0.40.10', 'icmp') === 'deny' && t('192.168.2.11', '10.0.30.10', 'icmp') === 'permit' && t('192.168.2.10', '10.0.30.10', 'tcp', 80) === 'permit'; },
          hint: 'R1(config)# access-list 100 deny ip 192.168.2.0 0.0.0.255 host 10.0.20.10\nR1(config)# access-list 100 permit tcp 192.168.2.0 0.0.0.255 host 10.0.40.10 eq 443\nR1(config)# access-list 100 deny ip 192.168.2.0 0.0.0.255 host 10.0.40.10\nR1(config)# access-list 100 permit ip any any',
          ok: 'Ace: "Four lines. The third one is the one people forget."',
          why: 'Ace: Line one drops anything from the market to the records server. Line two lets the market reach the payments server on TCP 443. Line three drops everything else from the market to the payments server; without it, line four would let port 80 and pings through. Line four, permit ip any any, keeps the implicit deny from taking the rest of the market\'s traffic.' },
        { type: 'cmd', skill: 'acl-extended', text: 'Ace: "Apply it close to the source: inbound on the market\'s port, g0/1."',
          check: (d, ctx) => { const n = ctx.net(); return ctx.cfg('R1').interfaces['gigabitethernet0/1'].aclIn === '100' && n.tcp('PC5', '10.0.40.10', 443).ok && !n.tcp('PC5', '10.0.40.10', 80).ok && !n.ping('PC3', '10.0.20.10').ok && n.ping('PC3', '10.0.30.10').ok && n.ping('PC1', '10.0.40.10').ok; },
          hint: 'R1(config)# interface g0/1\nR1(config-if)# ip access-group 100 in', ok: 'Ace: "The tills pay, the kiosk stays out of the records, and my office still gets visitors."',
          why: 'Ace: ip access-group 100 in on g0/1 checks every packet from the market as it arrives at R1. The traffic the list denies is dropped at the gate and never crosses to R2. Because each line names a destination and a port, the market keeps everything else, and the clinic, on another port, is not touched at all.' },
        { type: 'cmd', skill: 'acl-extended', text: 'Marrow, back at the window: "The payments company says the tills need 8443 as well, for the receipts." Ace: "Open list 100 by name and slide that line in above the deny, at 25."',
          check: (d, ctx) => { const n = ctx.net(); const a = ctx.cfg('R1').acls['100']; return !!(a && a.entries.some(e => e.seq === 25)) && n.tcp('PC5', '10.0.40.10', 8443).ok && n.tcp('PC5', '10.0.40.10', 443).ok && !n.tcp('PC5', '10.0.40.10', 80).ok; },
          hint: 'R1(config)# ip access-list extended 100\nR1(config-ext-nacl)# 25 permit tcp 192.168.2.0 0.0.0.255 host 10.0.40.10 eq 8443', ok: 'Marrow: "Receipts are printing. That\'s the first time this week."',
          why: 'Ace: ip access-list extended 100 opens the numbered list the way you open a named one, and its lines show as 10, 20, 30, 40. A line typed with its own number, 25, goes in between 20 and 30, above the deny for the payments server, so 8443 is permitted before the deny is read. From global config you could only add to the bottom, and the deny at 30 would have caught it.' },
        { type: 'form', skill: 'acl-extended', text: 'Ace, closing the clipboard: "Last thing. Tell me how to match each of these ports."',
          fields: [ { key: 'one', label: 'only the payments page, 443', options: ['eq 443', 'gt 1023', 'lt 1024', 'neq 23', 'range 20 21'], answer: 'eq 443' },
            { key: 'high', label: 'every port above 1023', options: ['eq 443', 'gt 1023', 'lt 1024', 'neq 23', 'range 20 21'], answer: 'gt 1023' },
            { key: 'low', label: 'every well-known port, 0 to 1023', options: ['eq 443', 'gt 1023', 'lt 1024', 'neq 23', 'range 20 21'], answer: 'lt 1024' },
            { key: 'but', label: 'every port except Telnet', options: ['eq 443', 'gt 1023', 'lt 1024', 'neq 23', 'range 20 21'], answer: 'neq 23' },
            { key: 'ftp', label: 'FTP\'s two ports, 20 and 21', options: ['eq 443', 'gt 1023', 'lt 1024', 'neq 23', 'range 20 21'], answer: 'range 20 21' } ],
          hint: 'eq equal, gt greater than, lt less than, neq not equal, range first to last.', ok: 'Ace: "Good. Go and eat something Marrow didn\'t have to put on a tab."',
          why: 'Ace: eq matches one port. gt matches every port greater than the number, so gt 1023 is 1024 and up. lt matches every port less than the number, so lt 1024 is 0 to 1023. neq matches every port except that one. range takes a lowest and a highest port and matches both and everything between.' }
      ],
      solution: [ { dev: 'R1', type: ['enable', 'show ip interface g0/1'] }, 'commit', { choose: 1 }, 'commit',
        { dev: 'R1', type: ['configure terminal', 'interface g0/1', 'no ip access-group 1 in', 'exit', 'no access-list 1'] }, 'commit',
        { form: { icmp: '1', tcp: '6', udp: '17', eigrp: '88', ospf: '89' } }, 'commit',
        { dev: 'R1', type: ['access-list 100 remark market: no records, payments on 443 only', 'access-list 100 deny ip 192.168.2.0 0.0.0.255 host 10.0.20.10', 'access-list 100 permit tcp 192.168.2.0 0.0.0.255 host 10.0.40.10 eq 443', 'access-list 100 deny ip 192.168.2.0 0.0.0.255 host 10.0.40.10', 'access-list 100 permit ip any any'] }, 'commit',
        { dev: 'R1', type: ['interface g0/1', 'ip access-group 100 in', 'exit'] }, 'commit',
        { dev: 'R1', type: ['ip access-list extended 100', '25 permit tcp 192.168.2.0 0.0.0.255 host 10.0.40.10 eq 8443', 'end'] }, 'commit',
        { form: { one: 'eq 443', high: 'gt 1023', low: 'lt 1024', but: 'neq 23', ftp: 'range 20 21' } }, 'commit' ],
      outro: 'By noon the market is paying with cards again, and Marrow tears up forty-one tab slips in front of the fishmonger, who does not take the hint. Ace adds a line to the column under the pencilled date: 06:00, list 1, per gate policy, not me.' }
  );
})();
