/* Stage 3 · The Floor — Ethernet switching, VLANs, trunks. Framework stub: two intro levels. */
(function(){
  const { PS, SJ } = SRC;
  STAGES.push({ id: 'floor', arc: 'grid', title: 'STAGE 3 · THE FLOOR', sub: 'switching, VLANs, trunks', npc: 'mac', status: 'live', levels: [
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
    // ------------------------------------------------------------ night 23 · EtherChannel
    { id: 'n23-two-cables', title: 'Two cables, one name', sub: 'EtherChannel: LACP, PAgP and static bundles', npc: 'veelan', day: [23], src: [PS('EtherChannel.md')], unlocks: ['etherchannel'],
      beats: [
        { k: 'SCENE', where: 'The switch floor under the market · Saturday, 21:15',
          lines: [
            { who: 'narr', text: 'Bass from the market upstairs comes through the ceiling in soft thumps, and the air down here tastes of fryer oil and warm dust. Tarps with VLAN numbers painted on them hang between the rows of switches. Vee Lan is up a ladder, re-labelling a patch panel with a paint pen, and she climbs down when she sees you.' },
            { who: 'veelan', text: 'Root\'s gone, then. Did he leave you the tag?' },
            { who: 'narr', text: 'You take the paper tag out of your pocket. She reads the shaky capitals and hands it straight back.' },
            { who: 'veelan', text: 'Twelve years ago I took this whole floor down with one bad trunk on a Saturday night. He drove over at four in the morning, fixed it, and never told a soul. I\'ve owed him ever since, and he let me argue with him every week instead of saying so.' },
            { who: 'veelan', text: 'His cable slept for six years because spanning tree won\'t let two cables between the same two switches both forward. [[EtherChannel]] ties the ports into one logical link, a [[port-channel]], and the tree only sees the one. Every cable in the bundle carries frames.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'How do the two switches agree on the bundle?', reply: 'Vee Lan: "Three ways. [[LACP]] is the IEEE\'s, 802.3ad: active asks and passive answers, so at least one side has to be active. [[PAgP]] is Cisco\'s own: desirable asks and auto answers. Or mode on, which is static, no protocol at all, and then both sides have to be on. Mix on with either protocol and you get nothing."' },
            { tone: 'press', say: 'Can his cable just join the bundle as it is?', reply: 'Vee Lan: "No. It\'s FastEthernet and the main one is gigabit, and every member has to match: speed, duplex, access or trunk, the same VLANs. I pulled a second gigabit run through the same conduit this afternoon. His cable comes out, and the new one takes its place in the bundle."' },
            { tone: 'care', say: 'Does it still bother you, owing him?', reply: 'She caps the paint pen and turns it over in her fingers. "Every week for twelve years. Tonight I get to stop."' }
          ] } },
        { k: 'SCENE', where: 'The switch floor · Vee\'s bench · 21:40',
          lines: [
            { who: 'narr', text: 'Her bench is a door laid across two filing cabinets, covered in coiled cable and cold noodles. Mac leans on the railing above it, eating the noodles.' },
            { who: 'mac', text: 'While you\'re doing the clinic, the pharmacy link\'s been dropping all week. One side of it says channel-group 2 mode on and the other says passive.' },
            { who: 'veelan', text: 'Then there\'s no bundle there at all. On won\'t negotiate and passive only answers. We\'ll fix it while we\'re in the building.' },
            { who: 'veelan', text: 'A bundle doesn\'t split one conversation across the cables. The switch hashes every frame on its addresses, source or destination MAC or IP or both, and every frame of one flow rides the same member, so nothing arrives out of order. port-channel load-balance picks the method, and show etherchannel load-balance tells you which one is running.' },
            { who: 'veelan', text: 'Up to eight members forward in one bundle, and LACP will hold eight more on standby. The channel-group number only means something on its own switch: mine can be 1 and yours can be 7.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Which way would you bundle the clinic?', reply: 'Vee Lan: "LACP. It\'s the standard, so it talks to anyone\'s switch, and it tells me when the far end stops talking."' },
            { tone: 'joke', say: 'Why not mode on everywhere? Fewer words.', reply: 'Vee Lan: "Because on never checks. Cable one member to the wrong switch and on keeps sending frames down it anyway. LACP would have refused to bundle it."' },
            { tone: 'press', say: 'Can a bundle carry routed traffic?', reply: 'Vee Lan: "On a multilayer switch, yes. no switchport on the members, then the channel-group, and the IP address goes on the port-channel interface. That\'s a Layer 3 EtherChannel, and the building\'s core switches run one."' }
          ] } },
        { k: 'LORE', title: 'MANY CABLES, ONE NAME', year: 2000, real: ['ieee', 'cisco'], vibe: 'Whassup? Four cables, answering to one name.',
          text: 'Vee Lan: "The IEEE published LACP as 802.3ad in 2000, and in 2008 it moved to its own standard, 802.1AX. Before that every vendor bundled its own way. Cisco\'s EtherChannel came from a small company called Kalpana that it bought in 1994, and PAgP came with it. Root taught me bundling on a switch from those years, which is the only reason I kept any of this."' },
        { k: 'KIT', text: 'She writes it on a strip of gaffer tape and sticks it to your sleeve.', real: ['ieee', 'cisco'], kit: [
          { cmd: 'interface range g0/2 - 3 → channel-group 1 mode active', what: 'LACP, 802.3ad: active + active or active + passive' },
          { cmd: 'channel-group 1 mode desirable | auto', what: 'PAgP, Cisco: desirable + desirable or desirable + auto' },
          { cmd: 'channel-group 1 mode on', what: 'static, no protocol: on + on only' },
          { cmd: 'members match: speed, duplex, access or trunk, VLANs', what: 'up to 8 active. LACP holds 8 more on standby. The group number is local' },
          { cmd: 'port-channel load-balance src-dst-ip · show etherchannel load-balance', what: 'per flow, hashed on source and/or destination MAC or IP' },
          { cmd: 'no switchport → channel-group 1 mode active → interface port-channel 1 → ip address', what: 'Layer 3 EtherChannel' },
          { cmd: 'show etherchannel summary', what: 'the bundle, its protocol, and P for every member that is in it' } ] },
        { k: 'SYNC', q: { prompt: 'Mac, through a mouthful of noodles: "Say the clinic side\'s channel-group 1 mode passive, and the pharmacy side is passive too. Do they bundle?"', opts: ['No. Passive only answers, so one side has to be active', 'Yes. Both are LACP', 'Only if the group numbers match', 'Only if one side is PAgP'], a: 0,
          yes: 'Vee Lan: "No bundle. Two people waiting to be asked."', no: 'Vee Lan: "No. Passive only answers. Somebody has to be active."',
          why: 'Vee Lan: LACP has two modes. Active sends LACP messages and passive only replies, so active with active or active with passive forms a bundle, and passive with passive never does. The group numbers do not have to match, and PAgP and LACP never bundle with each other.' } }
      ] }
  ] });
})();
