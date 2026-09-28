/* jobs/04-bridges.js — District 04 · The Bridges (nights 20–22): spanning tree, its guards and the rapid tree, at the
   Watson clinic annex. Also holds the Class C rite, Every Road Home (night 33). */
(function(){
  const { gi, fa } = NETKIT;

  JOBS.push(
    // ------------------------------------------------------------------ night 20 · from Lab 20 (analyzing STP)
    { id: 'c-n20-closet-tree', cls: 'C', rep: 15, from: 'root', title: 'The Tree in the Closet', day: [20], requires: ['n20-tagged-cable'], devices: ['SW1', 'SW2', 'SW3', 'PC2'],
      brief: 'DISPATCH » Old Root wants the clinic annex\'s spanning tree read before he hands the closet over. Find the root, name every port\'s job, then pull the wards\' main cable and prove the backup takes over.\n\nCLIENT (Old Root) » "Nobody chose the root in this closet. Look first, and tell me who won."',
      net: {
        stpMode: 'pvst',
        devices: {
          SW1: { kind: 'switch', mac: '0019.e8a1.1c01' }, SW2: { kind: 'switch', mac: '0c11.7a3b.9902' }, SW3: { kind: 'switch', mac: '0001.4a3c.0e03' },
          PC1: { kind: 'host', ip: '10.20.0.11', mask: '255.255.255.0' }, PC2: { kind: 'host', ip: '10.20.0.21', mask: '255.255.255.0' }, PC3: { kind: 'host', ip: '10.20.0.31', mask: '255.255.255.0' }
        },
        links: [ { a: 'SW3', ap: gi(1), b: 'SW1', bp: gi(1) }, { a: 'SW3', ap: gi(2), b: 'SW2', bp: gi(1) }, { a: 'SW1', ap: gi(2), b: 'SW2', bp: gi(2) }, { a: 'SW1', ap: fa(24), b: 'SW2', bp: fa(24) },
          { a: 'SW1', ap: fa(1), b: 'PC1' }, { a: 'SW2', ap: fa(1), b: 'PC2' }, { a: 'SW3', ap: fa(1), b: 'PC3' } ]
      },
      map: { w: 540, h: 360, nodes: [
          { id: 'SW1', label: 'SW1 · top of the rack', type: 'switch', x: 150, y: 90 }, { id: 'SW2', label: 'SW2 · the wards', type: 'switch', x: 400, y: 90 }, { id: 'SW3', label: 'SW3 · the pharmacy\'s old box', type: 'switch', x: 275, y: 240 },
          { id: 'PC1', label: 'reception', type: 'pc', x: 50, y: 190 }, { id: 'PC2', label: 'ward station', type: 'pc', x: 500, y: 190 }, { id: 'PC3', label: 'pharmacy till', type: 'pc', x: 275, y: 330 } ],
        links: [ { a: 'SW3', b: 'SW1', ap: gi(1), bp: gi(1) }, { a: 'SW3', b: 'SW2', ap: gi(2), bp: gi(1) }, { a: 'SW1', b: 'SW2', ap: gi(2), bp: gi(2) }, { a: 'SW1', b: 'SW2', ap: fa(24), bp: fa(24), tag: 'DO NOT UNPLUG' },
          { a: 'SW1', b: 'PC1' }, { a: 'SW2', b: 'PC2' }, { a: 'SW3', b: 'PC3' } ] },
      steps: [
        { type: 'cmd', skill: 'stp-election', text: 'Old Root, from his crate: "Sit at SW1. Show me its tree, and read the Root ID before anything else."',
          need: [ { dev: 'SW1', line: /^(do )?show spanning-tree( vlan 1)?$/ } ], hint: 'SW1> enable\nSW1# show spanning-tree', ok: 'Old Root: "Two IDs, two different addresses. So SW1 is not the one in charge."',
          why: 'Old Root: show spanning-tree prints two blocks. Root ID is the switch every switch agrees is the root. Bridge ID is the switch you are sitting on. When the two addresses differ, you are not on the root. On SW1 they differ.' },
        { type: 'find', skill: 'stp-election', target: 'SW3', text: 'Old Root: "The address in the Root ID belongs to one of the three. Click the one that won."', hint: 'Every priority is 32769, so the lowest MAC address wins. Compare the three MACs on the map\'s switches with the Root ID.',
          ok: 'Old Root: "The pharmacy\'s old box, 0001.4a3c.0e03. Lowest MAC in the room."',
          why: 'Old Root: The lowest bridge ID wins the election, and the bridge ID is the priority, then the MAC address. All three switches have the default priority, 32768 plus VLAN 1, so they tie, and the lowest MAC decides. SW3\'s 0001.4a3c.0e03 is lower than SW1\'s 0019.e8a1.1c01 and SW2\'s 0c11.7a3b.9902, so SW3 is the root.' },
        { type: 'calc', skill: 'stp-election', text: 'Imani, reading over your shoulder: "Thirty-two thousand seven hundred and sixty-nine. Why the odd number?"',
          fields: [ { key: 'prio', label: 'the default bridge priority', check: v => String(v).replace(/[,\s]/g, '') === '32768' },
            { key: 'vlan', label: 'the VLAN number added to it', check: v => String(v).trim() === '1' },
            { key: 'bits', label: 'bits of the bridge ID that carry the VLAN', check: v => String(v).trim() === '12' } ],
          answer: '32768 + VLAN 1 = 32769. The VLAN rides in the 12-bit extended system ID.', hint: 'The priority is 4 bits, the VLAN is 12 bits, the MAC is 48 bits.', ok: 'Old Root: "Default priority plus the VLAN. She\'ll never unsee it now."',
          why: 'Old Root: The bridge ID is a 4-bit priority, a 12-bit extended system ID that holds the VLAN number, and the 48-bit MAC address. The default priority is 32768, and the VLAN is added on top, so every switch in VLAN 1 shows 32769. Because the priority only has 4 bits, you can only change it in steps of 4096.' },
        { type: 'form', skill: 'stp-election', text: 'Old Root: "Now every port with a switch on the other end. Tell me what job each one has. Use show spanning-tree on SW2 and SW3 if you need it."',
          fields: [ { key: 's1g1', label: 'SW1 Gi0/1 (to the pharmacy box)', options: ['root port', 'designated port', 'non-designated (blocking)'], answer: 'root port' },
            { key: 's1g2', label: 'SW1 Gi0/2 (to SW2)', options: ['root port', 'designated port', 'non-designated (blocking)'], answer: 'designated port' },
            { key: 's2g2', label: 'SW2 Gi0/2 (to SW1)', options: ['root port', 'designated port', 'non-designated (blocking)'], answer: 'non-designated (blocking)' },
            { key: 's2f24', label: 'SW2 Fa0/24 (the tagged cable)', options: ['root port', 'designated port', 'non-designated (blocking)'], answer: 'non-designated (blocking)' },
            { key: 's3g2', label: 'SW3 Gi0/2 (to SW2)', options: ['root port', 'designated port', 'non-designated (blocking)'], answer: 'designated port' } ],
          hint: 'On SW2: show spanning-tree. Root = root port, Desg = designated, Altn BLK = non-designated. Every port on the root bridge is designated.', ok: 'Old Root: "Two ports asleep on SW2, and one of them is the tag. Now you know what the tag is."',
          why: 'Old Root: SW1 and SW2 each reach the root over one gigabit link, cost 4, so Gi0/1 is the root port on both. Every port on the root, SW3, is designated. On the two cables between SW1 and SW2 both switches have root cost 4, so the lower bridge ID, SW1, wins the designated port on each, and SW2\'s ends, Gi0/2 and the tagged Fa0/24, are non-designated and block.' },
        { type: 'choice', skill: 'stp-election', text: 'Imani: "Both of those switches are the same distance from the pharmacy box. Why does SW1 get to keep its end of the cable open?"',
          opts: ['They tie on root cost, so the lower bridge ID wins, and SW1\'s MAC is lower', 'SW1 has the lower root cost', 'SW1 has more ports', 'SW1\'s port number is lower'], a: 0,
          hint: 'Designated port: lowest root cost first, then lowest bridge ID.', ok: 'Old Root: "A tie, broken by the ID. Same as the election."',
          why: 'Old Root: On each segment the designated port goes to the switch with the lower root cost. SW1 and SW2 both have root cost 4, so it is a tie, and a tie goes to the lower bridge ID. The priorities match, so the MAC decides, and SW1\'s 0019.e8a1.1c01 is lower than SW2\'s 0c11.7a3b.9902.' },
        { type: 'cmd', skill: 'stp-election', text: 'Old Root: "Now the part I brought you here for. Pull the wards\' main cable: shut SW2 Gi0/1. Then go to the ward station and ping the pharmacy till at 10.20.0.31."',
          need: [ { dev: 'PC2', line: /^ping 10\.20\.0\.31$/ } ], check: (d, ctx) => { const s = ctx.compute(1).switches.SW2; return !ctx.net().up('SW2', 'g0/1') && s.rootPort === gi(2) && ctx.net().ping('PC2', '10.20.0.31').ok; },
          hint: 'SW2# configure terminal\nSW2(config)# interface g0/1\nSW2(config-if)# shutdown\n\nPC2:\nC:\\> ping 10.20.0.31', ok: 'Old Root: "Replies, and the wards never knew. SW2 found another way to the root."',
          why: 'Old Root: When SW2 Gi0/1 goes down, SW2 loses its root port and picks again from what is left. Gi0/2 reaches the root through SW1 at 4 + 4 = 8. The tagged Fa0/24 reaches it through SW1 at 19 + 4 = 23. Eight is cheaper, so Gi0/2 becomes the root port and starts forwarding, and the ward station reaches the pharmacy through SW1.' },
        { type: 'calc', skill: 'stp-election', text: 'Old Root: "Read SW2\'s tree again and give me the numbers."',
          fields: [ { key: 'rp', label: 'SW2\'s root port now', check: v => /^(gi|gigabitethernet)\s*0\/2$/i.test(String(v).trim()) },
            { key: 'cost', label: 'SW2\'s root cost now', check: v => String(v).trim() === '8' },
            { key: 'tag', label: 'what the path through the tagged cable would cost', check: v => String(v).trim() === '23' } ],
          answer: 'Root port Gi0/2, root cost 8. Through the tagged cable: 19 + 4 = 23.', hint: 'Add the cost of every link on the way to the root: gigabit 4, FastEthernet 19.', ok: 'Old Root: "Eight against twenty-three. The tag still sleeps, because there\'s a better road."',
          why: 'Old Root: Root cost is the sum of the port costs along the path to the root. Through Gi0/2 it is SW2\'s gigabit link to SW1, 4, plus SW1\'s gigabit link to the root, 4, which makes 8. Through the tagged FastEthernet cable it is 19 + 4 = 23. The lowest root cost wins, so Gi0/2 is the root port and the tagged cable stays blocked.' },
        { type: 'cmd', skill: 'stp-election', text: 'Old Root: "Put it back. Bring SW2 Gi0/1 up and let the tree settle where it was."',
          check: (d, ctx) => ctx.net().up('SW2', 'g0/1') && ctx.compute(1).switches.SW2.rootPort === gi(1),
          hint: 'SW2(config-if)# no shutdown', ok: 'Old Root: "Gi0/1 is the root port again, cost 4. The tree always goes back to the cheapest road."',
          why: 'Old Root: With Gi0/1 up again, SW2 has a path to the root that costs 4, straight to SW3. That beats the 8 through SW1, so Gi0/1 becomes the root port again and Gi0/2 goes back to blocking. Spanning tree always settles on the cheapest path it can see.' }
      ],
      solution: [ { dev: 'SW1', type: ['enable', 'show spanning-tree'] }, 'commit', { select: 'SW3' }, 'commit', { calc: { prio: '32768', vlan: '1', bits: '12' } }, 'commit',
        { form: { s1g1: 'root port', s1g2: 'designated port', s2g2: 'non-designated (blocking)', s2f24: 'non-designated (blocking)', s3g2: 'designated port' } }, 'commit', { choose: 0 }, 'commit',
        { dev: 'SW2', type: ['enable', 'configure terminal', 'interface g0/1', 'shutdown'] }, { dev: 'PC2', type: ['ping 10.20.0.31'] }, 'commit', { calc: { rp: 'Gi0/2', cost: '8', tag: '23' } }, 'commit',
        { dev: 'SW2', type: ['no shutdown'] }, 'commit' ],
      outro: 'At midnight Old Root pencils the tree on the inside of the closet door, with SW3 circled and an X on each of SW2\'s sleeping ports. Up on the ward, the night shift never noticed their cable being pulled. He leaves the tag where it hangs.' }
  );
})();
