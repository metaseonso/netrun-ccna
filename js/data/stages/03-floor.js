/* Stage 3 · The Floor — Ethernet switching, VLANs, trunks. Framework stub: two intro levels. */
(function(){
  const { PS, SJ } = SRC;
  STAGES.push({ id: 'floor', arc: 'grid', title: 'STAGE 3 · THE FLOOR', sub: 'switching, VLANs, trunks', npc: 'mac', status: 'stub', levels: [
    { id: 'mac-intro', title: 'Every face, five minutes', sub: 'switching, the MAC table, ARP', npc: 'mac', day: [5,6,9], src: [PS('Ethernet_LAN_Switching_Part1.md'), PS('Ethernet_LAN_Switching_Part2.md'), SJ('02 - Day 9 - Switch Interfaces.md')], unlocks: ['mac-table'],
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
        { k: 'LORE', title: 'THE ETHER MEMO', year: 1973, vibe: 'Far out. Everyone heard everyone, and it worked anyway.', text: 'Mac: "Bob Metcalfe wrote the Ethernet memo at Xerox PARC on 22 May 1973 and named it after the luminiferous ether. ARP is from 1982, RFC 826. The first real switch came around 1990. Before that this floor was a hub: everyone heard everyone, and collisions were normal. Full duplex ended that."' },
        { k: 'KIT', text: 'He tears a page off the sign-in pad.', kit: [ { cmd: 'show mac address-table', what: 'who is on which slot' }, { cmd: 'show interfaces status', what: 'speed, duplex, VLAN per port' }, { cmd: 'interface range f0/1 - 12 → description · speed · duplex', what: 'set a batch of ports at once' } ] },
        { k: 'SYNC', q: { prompt: 'Mac, testing you: "Frame comes in for a face I have never seen. What do I do?"', opts: ['Drop it', 'Send it back out the same slot', 'Flood it out every other slot', 'Ask the router'], a: 2, yes: '"Shout first, learn later."', no: '"Unknown face, I flood it. Every slot except the one it came in on."' , why: 'Mac: I only know faces I have seen. For a face I have not seen, I send the frame out every port except the one it came from. Whoever answers, I write down. That is flooding, and it is how my table fills up.' } }
      ] },
    { id: 'vlan-intro', title: 'Borders inside one building', sub: 'VLANs, trunks, DTP/VTP, EtherChannel', npc: 'veelan', day: [16,17,18,19,23], src: [PS('VLAN_Part1.md'), PS('VLAN_Part2.md'), SJ('04 - Day 16 - VLANs Part 1.md'), SJ('11 - Day 23 - EtherChannel.md')], unlocks: ['vlan-config', 'trunk-config'],
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
        { k: 'SYNC', q: { prompt: 'Vee Lan: "Native VLAN frames on a trunk. Tagged or not?"', opts: ['Tagged with VLAN 1', 'Untagged', 'Encrypted', 'Only if DTP is on'], a: 1, yes: '"Untagged. Which is why I move it off VLAN 1 on every trunk I touch."', no: '"Untagged. That is the whole point of the native VLAN, and the whole reason attackers like a mismatched one."' , why: 'Vee Lan: On a trunk every frame gets a tag with its VLAN number, except frames from the native VLAN. Those travel with no tag at all. Both ends must agree on which VLAN is native, or untagged frames land in the wrong VLAN.' } }
      ] },

    // ------------------------------------------------------------ night 36 · CDP and LLDP
    { id: 'n36-next-door', title: 'Everyone next door', sub: 'CDP and LLDP', npc: 'mac', day: [36], src: [PS('CDP_and_LLDP.md')], unlocks: ['cdp-lldp'],
      beats: [
        { k: 'SCENE', where: 'The switch floor under the market · ten past eleven at night',
          lines: [
            { who: 'narr', text: 'The stairs down from the market are warm, and the air at the bottom smells of hot dust and old solder. Fans hum along rows of blinking boxes under a low ceiling. Mac sits at his door with twenty-four numbered slots, cracking sunflower seeds between his front teeth, and he waves you in before you reach the last step.' },
            { who: 'mac', text: 'Ace called. She said follow the clinic\'s old cable, and I did. It comes up through the floor right here and plugs into slot 24 on SW2. I\'ve never had a face on slot 24 in my life.' },
            { who: 'mac', text: 'Here\'s how I know. Every Cisco box down here says hello to the box at the other end of each cable, once a minute: its name, its model, its software, its address, which port it\'s talking from. That\'s [[CDP]], the Cisco Discovery Protocol. It\'s on by default, on every port.' },
            { who: 'you', text: 'Who hears the hello?' },
            { who: 'mac', text: 'Only the box at the other end. It goes to a multicast address, 0100.0CCC.CCCC, and a Cisco box that gets it keeps it and never passes it on. It comes every 60 seconds, and if a neighbour goes quiet for 180, the holdtime, I forget him. Version 2 is the default.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'How do I read who\'s next door?', reply: 'Mac: "show cdp neighbors. Device ID, the port on your side, the holdtime counting down, what it is, a router or a switch, its model, and the port on its side. Add detail and you get its IP address and its software version as well. show cdp entry and a name gives you one neighbour."' },
            { tone: 'press', say: 'If it tells everyone that much, why is it on?', reply: 'Mac: "Because it finds the cable the diagram got wrong, every time. You turn it off where you don\'t trust the far end: no cdp enable on that one port, or no cdp run for the whole box. show cdp tells you the timers, and show cdp traffic counts the hellos in and out."' },
            { tone: 'joke', say: 'You forget faces after five minutes and neighbours after three?', reply: 'Mac: "Faces are the MAC table, 300 seconds, and that\'s every frame on every port. Neighbours are boxes, and they\'re chatty, so 180 is plenty."' }
          ] } },
        { k: 'SCENE', where: 'The switch floor · the end of the east row · slot 24', real: ['ieee'],
          lines: [
            { who: 'narr', text: 'Slot 24 has a cable in it that comes up through a hole in the floor tiles, furred with dust along its first metre and clean after that. The box on the end is a small switch zip-tied behind the rack, lights blinking, with no label.' },
            { who: 'mac', text: 'Whatever that is, it\'s been hearing every hello on this floor for weeks. Every hostname, every address, which software each box runs and which port leads where. If I wanted to know which kiosk still had a cable to the clinic, that\'s exactly how I\'d find out.' },
            { who: 'mac', text: 'The new cameras Vee Lan ordered for the stalls aren\'t Cisco, so they don\'t speak CDP at all. They speak [[LLDP]], the Link Layer Discovery Protocol, the IEEE\'s version, 802.1AB. On a Cisco box it\'s usually off. lldp run turns it on for the box, and then each port can transmit and receive separately.' },
            { who: 'mac', text: 'LLDP says hello every 30 seconds, holds a neighbour for 120, and waits 2 seconds before it starts up on a port that\'s just come alive. It goes to 0180.C200.000E. A box can run CDP and LLDP at the same time, and CDP carries a few Cisco things LLDP doesn\'t, like the VTP domain.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Can we see what it heard?', reply: 'Mac: "Ask SW2 what\'s on slot 24, and ask for detail. CDP works both ways: if it heard us, we can hear it, and a box that says hello says its own name too."' },
            { tone: 'press', say: 'Why not pull it out right now?', reply: 'Mac: "Because Ace wants its name and its address first, and once it\'s unplugged SW2 forgets it in 180 seconds. Read it, write it down, then pull it."' },
            { tone: 'care', say: 'Did anyone come down here to plug it in?', reply: 'Mac spits a shell into his hand and looks at the stairs. "Nobody I remember. And I remember everybody. Whoever it was came up the old cable from the other end, not down my stairs."' }
          ] } },
        { k: 'LORE', title: 'EVERYONE SAYS HELLO', year: 2005, real: ['ieee'], vibe: 'That\'s hot. Every box on the block handing out business cards to strangers.',
          text: 'Mac, cracking another seed: "Cisco boxes had been introducing themselves with CDP for years, but only to other Cisco boxes. In 2005 the IEEE approved 802.1AB, LLDP, so a phone or a camera from any maker could say hello the same way. The first non-Cisco phone that showed up on this floor with its name and its port, I printed the page and pinned it by the door. It\'s still there, under the grease."' },
        { k: 'KIT', text: 'Mac writes the floor\'s rules on the inside of a sunflower-seed packet.', kit: [
          { cmd: 'show cdp neighbors · show cdp neighbors detail · show cdp entry NAME', what: 'who is on each port. Detail adds the IP address and the software version' },
          { cmd: 'cdp run · no cdp run · interface: cdp enable · no cdp enable', what: 'CDP is Cisco only and on by default. Turn it off where you don\'t trust the far end' },
          { cmd: 'CDP: every 60 s · holdtime 180 s · CDPv2 · 0100.0CCC.CCCC', what: 'cdp timer · cdp holdtime · cdp advertise-v2' },
          { cmd: 'lldp run · interface: lldp transmit · lldp receive', what: 'LLDP, IEEE 802.1AB, any maker. Usually off on Cisco. Both can run at once' },
          { cmd: 'LLDP: every 30 s · holdtime 120 s · reinit 2 s · 0180.C200.000E', what: 'lldp timer · lldp holdtime · lldp reinit' },
          { cmd: 'show cdp · show cdp traffic · show cdp interface · show lldp · show lldp neighbors [detail]', what: 'the timers, the counters, the ports, the neighbours' } ] },
        { k: 'SYNC', q: { prompt: 'Vee Lan\'s camera installer comes down the stairs with a box of cameras: "These only speak the open one, LLDP. Your Cisco switches will see them out of the box, yes?"', opts: ['Yes, LLDP is on by default on every Cisco switch', 'Usually not. LLDP is off by default on Cisco boxes until someone types lldp run', 'No, Cisco switches can only run CDP', 'Yes, but only if CDP is turned off first'], a: 1,
          yes: 'Mac: "Not until somebody tells them to. That\'s tonight\'s job."', no: 'Mac: "Off by default. lldp run, and they\'ll see each other."',
          why: 'Mac: CDP is Cisco\'s own and is on by default. LLDP is the IEEE standard, 802.1AB, and on Cisco boxes it is usually off until you type lldp run in global config. A box can run both at once, so there is no need to turn CDP off.' } }
      ] }
  ] });
})();
