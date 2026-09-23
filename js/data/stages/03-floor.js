/* Stage 3 · The Floor — Ethernet switching, VLANs, trunks. Framework stub: two intro levels. */
(function(){
  const { PS, SJ } = SRC;
  STAGES.push({ id: 'floor', arc: 'grid', title: 'STAGE 3 · THE FLOOR', sub: 'switching, VLANs, trunks', npc: 'mac', status: 'stub', levels: [
    { id: 'mac-intro', title: 'Every face, five minutes', sub: 'Days 5–6, 9 · switching, the MAC table, ARP', npc: 'mac', day: [5,6,9], src: [PS('Ethernet_LAN_Switching_Part1.md'), PS('Ethernet_LAN_Switching_Part2.md'), SJ('02 - Day 9 - Switch Interfaces.md')], unlocks: ['mac-table'],
      beats: [
        { k: 'SCENE', where: 'The switch floor · a door with twenty-four numbered slots',
          lines: [
            { who: 'mac', text: 'New face. Come in. Every frame that comes through a slot, I read the sender\'s [[MAC address]] and write down which slot it came from. That list is the [[MAC address table]]. I keep a name for 300 seconds. If you do not talk again, I forget you.' },
            { who: 'you', text: 'What if a frame is for someone you have not written down?' },
            { who: 'mac', text: 'Then I shout it out every slot except the one it came from. That is [[flooding]]. Whoever answers, I write down. A [[broadcast]] to all F\'s gets shouted on purpose.' }
          ],
          choice: { opts: [
            { say: 'How do hosts find each other\'s addresses in the first place?', reply: '"[[ARP]]. A host shouts, who has 10.0.0.5, tell me. One host answers with its MAC. Everyone who heard it writes it down. Simple. Ace Elle will tell you later how badly that can be abused."' },
            { say: 'What is the most common problem you see?', reply: '"A [[speed/duplex mismatch]]. One end set by hand, the other set to auto. The link comes up and crawls. Look at "show interfaces status" before you blame anything else."' }
          ] } },
        { k: 'LORE', text: 'Mac: "Bob Metcalfe wrote the Ethernet memo at Xerox PARC on 22 May 1973 and named it after the luminiferous ether. ARP is from 1982, RFC 826. The first real switch came around 1990. Before that this floor was a hub: everyone heard everyone, and collisions were normal. Full duplex ended that."' },
        { k: 'KIT', text: 'He tears a page off the sign-in pad.', kit: [ { cmd: 'show mac address-table', what: 'who is on which slot' }, { cmd: 'show interfaces status', what: 'speed, duplex, VLAN per port' }, { cmd: 'interface range f0/1 - 12 → description · speed · duplex', what: 'set a batch of ports at once' } ] },
        { k: 'SYNC', q: { prompt: 'Mac, testing you: "Frame comes in for a face I have never seen. What do I do?"', opts: ['Drop it', 'Send it back out the same slot', 'Flood it out every other slot', 'Ask the router'], a: 2, yes: '"Shout first, learn later."', no: '"Unknown face, I flood it. Every slot except the one it came in on."' } }
      ] },
    { id: 'vlan-intro', title: 'Borders inside one building', sub: 'Days 16–19, 23 · VLANs, trunks, DTP/VTP, EtherChannel', npc: 'veelan', day: [16,17,18,19,23], src: [PS('VLAN_Part1.md'), PS('VLAN_Part2.md'), SJ('04 - Day 16 - VLANs Part 1.md'), SJ('11 - Day 23 - EtherChannel.md')], unlocks: ['vlan-config', 'trunk-config'],
      beats: [
        { k: 'SCENE', where: 'Second floor of the clinic annex · a taped line down the middle of the corridor',
          lines: [
            { who: 'veelan', text: 'Sales on that side, engineering on this side. Same switch. A [[VLAN]] is a border drawn in software. Mac\'s flooding stops at the tape.' },
            { who: 'you', text: 'How does a port know which side it is on?' },
            { who: 'veelan', text: 'You tell it. A host port is an [[access port]]: one VLAN, frames leave untagged. Between switches, or up to a router, you run a [[trunk port]]. Every frame on a trunk carries an [[802.1Q]] tag with its VLAN number. Except one VLAN, the [[native VLAN]], which rides untagged. Keep it the same on both ends.' }
          ],
          choice: { opts: [
            { say: 'How do the two sides talk?', reply: '"Through a router. [[Router on a stick]]: one trunk up to it, one subinterface per VLAN. Or an [[SVI]] on a Layer 3 switch. And ask Old Root about this too. With PVST+, every VLAN gets its own spanning tree."' },
            { say: 'Why do you care about borders so much?', reply: '"Target, 2013. Attackers got in through a heating contractor\'s login and walked straight to the tills. Forty million cards. One flat network. The tape on this floor is not bureaucracy."' }
          ] } },
        { k: 'KIT', text: 'She writes on the tape with a marker.', kit: [ { cmd: 'vlan 10 → name SALES', what: 'create a VLAN' }, { cmd: 'interface f0/5 → switchport mode access → switchport access vlan 10', what: 'put a host port on it' }, { cmd: 'interface g0/1 → switchport trunk encapsulation dot1q → switchport mode trunk', what: 'trunk between switches' }, { cmd: 'switchport trunk allowed vlan 10,20 · switchport trunk native vlan 99', what: 'limit the trunk, move the native VLAN off 1' }, { cmd: 'show vlan brief · show interfaces trunk', what: 'check' } ] },
        { k: 'SYNC', q: { prompt: 'Vee Lan: "Native VLAN frames on a trunk. Tagged or not?"', opts: ['Tagged with VLAN 1', 'Untagged', 'Encrypted', 'Only if DTP is on'], a: 1, yes: '"Untagged. Which is why I move it off VLAN 1 on every trunk I touch."', no: '"Untagged. That is the whole point of the native VLAN, and the whole reason attackers like a mismatched one."' } }
      ] }
  ] });
})();
