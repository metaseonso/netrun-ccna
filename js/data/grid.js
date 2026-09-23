/* grid.js — LAYER 1: the Grid. Arcs → stages → levels. Concepts, lore, deck (kit).
   Dialogue beats: k = TALK | LORE | KIT | SYNC. Terms in [[double brackets]] glow like unique NPC names.
   Day numbers follow Jeremy's IT Lab CCNA order; src links point at the two note repos we credit.
   DEMO SCOPE: Old Root's stage (Day 20–21, STP) is fully built. Other stages are framework stubs — one intro level each. */
(function(){
  const PS = f => ({ label: 'psaumur notes', url: 'https://github.com/psaumur/CCNA_Course_Notes/blob/main/Course_Notes/' + f });
  const SJ = f => ({ label: 'sparrowjumpy notes', url: 'https://github.com/sparrowjumpy/CCNA-Notes/blob/main/' + encodeURIComponent(f) });

  window.ARCS = [
    { n: '00', id: 'wetware', title: 'WETWARE', sub: 'how the machine thinks. hardware, OS, the shell.', status: 'lock' },
    { n: '01', id: 'grid', title: 'THE GRID', sub: 'networking. the CCNA arc. how the city is wired.', status: 'play' },
    { n: '02', id: 'ice', title: 'ICE', sub: 'defensive security fundamentals. what bites back.', status: 'lock' },
    { n: '03', id: 'blackice', title: 'BLACK ICE', sub: 'offensive. red team. authorized breaking.', status: 'lock' },
    { n: '04', id: 'blackwall', title: 'THE BLACKWALL', sub: 'SOC, incident response, forensics. holding the line.', status: 'lock' }
  ];

  window.STAGES = [
    // ---------------------------------------------------------------- stage: wires (stub)
    { id: 'wires', arc: 'grid', title: 'STAGE 1 · THE WIRES', sub: 'devices, cables, OSI, the CLI door', npc: 'osi', status: 'stub', levels: [
      { id: 'osi-intro', title: 'Seven layers, four in practice', sub: 'Days 1–3 · OSI model, TCP/IP, devices, cables', npc: 'osi', day: [1,2,3], src: [PS('OSI_Model_TCPSuite.md'), PS('Network_Devices.md'), PS('Interfaces_and_Cables.md')], unlocks: ['osi-layers'],
        beats: [
          { k: 'TALK', text: 'New face. Good. Everything you will ever do in the Grid happens on one of seven floors. I run the courier guild that walks packets between them. We call the blueprint the [[OSI model]]. Physical at the bottom, Application at the top. Please Do Not Throw Sausage Pizza Away, if you need it.' },
          { k: 'TALK', text: 'The street runs a shorter version, the [[TCP/IP suite]]: four layers. Same building, fewer stairs. When you argue with a corpo tech, you speak OSI. When you fix something, you touch TCP/IP.' },
          { k: 'TALK', text: 'Each floor wraps the parcel from above with its own label. That is [[encapsulation]]. Segment, packet, frame, bits. Learn the names of the parcels, the [[PDU]]s, and half the exam questions answer themselves.' },
          { k: 'LORE', text: 'Real history: ISO published the OSI model in 1984. It lost. TCP/IP, born from Cerf and Kahn\'s 1974 paper, was already running on ARPANET, which switched over on 1 January 1983. We kept OSI as a language, not a system. That is why it is on your exam and not on your router.' },
          { k: 'KIT', text: 'Your deck gets its first slot.', kit: [ { cmd: 'L1 bits · L2 frame · L3 packet · L4 segment', what: 'PDU names, bottom-up' }, { cmd: 'switch = L2 · router = L3 · firewall = L3+', what: 'which box lives on which floor' }, { cmd: 'UTP ≤100 m · fiber for distance', what: 'cabling rule of thumb; [[Auto MDI-X]] makes crossover cables history' } ] },
          { k: 'SYNC', q: { prompt: 'A router looks at which parcel to decide where to send it?', opts: ['The frame (Layer 2)', 'The packet (Layer 3)', 'The segment (Layer 4)', 'The bits (Layer 1)'], a: 1, yes: 'Third floor. That is where I keep the maps.', no: 'Close. Routers read Layer 3, the packet. Switches read frames.' } }
        ] },
      { id: 'cli-intro', title: 'Three doors deep', sub: 'Day 4 · Cisco IOS CLI modes', npc: 'enable', day: [4], src: [PS('Intro_to_CLI.md')], unlocks: ['cli-modes'],
        beats: [
          { k: 'TALK', text: 'Door one: [[user EXEC mode]]. Prompt ends in >. You look. You do not touch.' },
          { k: 'TALK', text: 'Say my name and I open door two: [[privileged EXEC mode]]. Prompt ends in #. Now you see everything, and you can save. Door three is "configure terminal": [[global configuration mode]], (config)#. That is where the box changes.' },
          { k: 'TALK', text: 'Two configs. The [[running-config]] is what the box is doing right now, in RAM. The [[startup-config]] is what it does after a reboot. Change one, save to the other, or lose it all at the next power blip.' },
          { k: 'LORE', text: 'Cisco was founded in December 1984 by Leonard Bosack and Sandy Lerner at Stanford, shipping a multiprotocol router so two campus networks could talk. The logo is the Golden Gate Bridge. IOS grew from there; the > and # prompts you are about to type into are older than most netrunners.' },
          { k: 'KIT', text: 'Slotting the door commands.', kit: [ { cmd: 'enable', what: 'user → privileged' }, { cmd: 'configure terminal', what: 'privileged → global config' }, { cmd: 'hostname NAME', what: 'name the box (shows in the prompt)' }, { cmd: 'enable secret PASS', what: '[[enable secret]]: hashed password for door two' }, { cmd: 'write memory  /  copy running-config startup-config', what: 'save it or lose it' }, { cmd: 'show running-config', what: 'what is happening right now' } ] },
          { k: 'SYNC', q: { prompt: 'Which prompt means you are in global configuration mode?', opts: ['SW1>', 'SW1#', 'SW1(config)#', 'SW1(config-if)#'], a: 2, yes: 'Door three. Go on in.', no: 'That one is (config)#. The others are doors one, two and an interface sub-room.' } }
        ] }
    ] },

    // ---------------------------------------------------------------- stage: the block (stub)
    { id: 'block', arc: 'grid', title: 'STAGE 2 · THE BLOCK', sub: 'IPv4 addressing and subnetting', npc: 'cider', status: 'stub', levels: [
      { id: 'cider-intro', title: 'Slicing the block', sub: 'Days 7–13 · IPv4, subnetting, VLSM', npc: 'cider', day: [7,11,12,13], src: [PS('IPv4_Addressing_Part1.md'), PS('Subnetting_Part1.md'), PS('Subnetting_VLSM_Part3.md'), SJ('01 - Day 8 - IPv4 Addressing (Part 2).md')], unlocks: ['subnetting'],
        beats: [
          { k: 'TALK', text: 'Sit. An [[IPv4 address]] is 32 bits. The [[subnet mask]] says which bits name the street and which name the house. /24 means 24 street bits, 8 house bits, 256 doors, 254 you can actually live in.' },
          { k: 'TALK', text: 'The first door is the [[network address]]. The last is the [[broadcast address]]. Everything between is the [[usable range]]. Hand a host either end and it will not work and you will not know why for an hour.' },
          { k: 'TALK', text: 'Need streets of different sizes? [[VLSM]]. Cut the biggest first. Then the next. Never the other way, or you fragment the block and I have to hear about it.' },
          { k: 'LORE', text: 'We used to hand out addresses in classes, A, B, C, like fixed-size lots. Wasteful. [[CIDR]] replaced that in 1993 (RFC 1519). It bought time, but on 3 February 2011 IANA handed the last five /8 blocks to the regional registries. IPv4 ran out. NAT and IPv6 are how the city keeps growing anyway.' },
          { k: 'KIT', text: 'Slot the slicing tools.', kit: [ { cmd: '/24 = 255.255.255.0 · /25 = .128 · /26 = .192 · /27 = .224 · /28 = .240 · /29 = .248 · /30 = .252', what: 'mask ladder' }, { cmd: 'hosts = 2^(32−prefix) − 2', what: 'usable doors' }, { cmd: 'block size = 256 − last mask octet', what: 'jump between subnets' }, { cmd: 'interface g0/0 → ip address A.B.C.D MASK → no shutdown', what: 'give a router interface a door' } ] },
          { k: 'SYNC', q: { prompt: '192.168.10.0/26 — how many usable host addresses?', opts: ['64', '62', '30', '126'], a: 1, yes: '64 minus the two ends. Clean cut.', no: '/26 leaves 6 host bits: 64 doors, 62 usable.' } }
        ] }
    ] },

    // ---------------------------------------------------------------- stage: the floor (stub)
    { id: 'floor', arc: 'grid', title: 'STAGE 3 · THE FLOOR', sub: 'Ethernet switching, VLANs, trunks', npc: 'mac', status: 'stub', levels: [
      { id: 'mac-intro', title: 'Every face, five minutes', sub: 'Days 5–6, 9 · switching, MAC table, ARP', npc: 'mac', day: [5,6,9], src: [PS('Ethernet_LAN_Switching_Part1.md'), PS('Ethernet_LAN_Switching_Part2.md'), SJ('02 - Day 9 - Switch Interfaces.md')], unlocks: ['mac-table'],
        beats: [
          { k: 'TALK', text: 'I work the door on the floor. Every frame that comes in, I read the source [[MAC address]] and note which port it came from. That is my [[MAC address table]]. I forget you after 300 seconds unless you talk again. Nothing personal.' },
          { k: 'TALK', text: 'Frame for a face I do not know? I shout it out every door except the one it came in. That is [[flooding]]. It is how I learn. A [[broadcast]] to FF:FF:FF:FF:FF:FF gets the same treatment on purpose.' },
          { k: 'TALK', text: 'Hosts find each other\'s faces with [[ARP]]: "who has 10.0.0.5?" One answers. Everyone caches it. Simple. Also, as you will learn from Ace Elle, wildly abusable.' },
          { k: 'LORE', text: 'Bob Metcalfe wrote the Ethernet memo at Xerox PARC on 22 May 1973, naming it after the luminiferous ether. ARP is RFC 826, 1982. The first switches only arrived around 1990 (Kalpana). Before that, hubs: everyone heard everything, and collisions were a lifestyle.' },
          { k: 'KIT', text: 'Slot the floor commands.', kit: [ { cmd: 'show mac address-table', what: 'who is on which port' }, { cmd: 'show interfaces status', what: 'speed, duplex, VLAN per port; catch a [[speed/duplex mismatch]]' }, { cmd: 'interface range f0/1 - 12 → description / speed / duplex', what: 'bulk port config' } ] },
          { k: 'SYNC', q: { prompt: 'A switch gets a frame for a destination MAC it has never seen. It will…', opts: ['drop it', 'send it back out the same port', 'flood it out all other ports', 'ask the router'], a: 2, yes: 'Shout first, learn later.', no: 'Unknown unicast gets flooded out every port except the source.' } }
        ] },
      { id: 'vlan-intro', title: 'Borders inside a building', sub: 'Days 16–19, 23 · VLANs, trunks, DTP/VTP, EtherChannel', npc: 'veelan', day: [16,17,18,19,23], src: [PS('VLAN_Part1.md'), PS('VLAN_Part2.md'), SJ('04 - Day 16 - VLANs Part 1.md'), SJ('11 - Day 23 - EtherChannel.md')], unlocks: ['vlan-config', 'trunk-config'],
        beats: [
          { k: 'TALK', text: 'One switch. Many streets. A [[VLAN]] is a broadcast domain drawn in software. Sales on 10, Engineering on 20, and Mac\'s flooding stops at the line.' },
          { k: 'TALK', text: 'Host ports are [[access port]]s: one VLAN, untagged. Between switches, or up to a router, you run a [[trunk port]]: every frame carries a [[802.1Q]] tag with its VLAN number. Except the [[native VLAN]], which rides untagged. Keep it matched on both ends or things get weird.' },
          { k: 'TALK', text: 'Streets do not talk without a router. [[Router on a stick]]: one trunk, one subinterface per VLAN. Or an [[SVI]] on a Layer 3 switch. Old Root cares about this too: with PVST+, every VLAN gets its own spanning tree.' },
          { k: 'LORE', text: 'Segmentation is the difference between a breach and a catastrophe. Target, 2013: attackers got in through an HVAC vendor\'s credentials and walked to the point-of-sale systems. Forty million cards. Flat network. Borders are not bureaucracy.' },
          { k: 'KIT', text: 'Slot the border commands.', kit: [ { cmd: 'vlan 10 → name SALES', what: 'create a street' }, { cmd: 'interface f0/5 → switchport mode access → switchport access vlan 10', what: 'put a host on it' }, { cmd: 'interface g0/1 → switchport trunk encapsulation dot1q → switchport mode trunk', what: 'trunk between switches' }, { cmd: 'switchport trunk allowed vlan 10,20 · switchport trunk native vlan 99', what: 'prune, and move the native VLAN off 1' }, { cmd: 'show vlan brief · show interfaces trunk', what: 'verify' } ] },
          { k: 'SYNC', q: { prompt: 'Frames of the native VLAN cross a trunk…', opts: ['tagged with VLAN 1', 'untagged', 'encrypted', 'only if DTP is on'], a: 1, yes: 'Untagged. Which is why attackers love a mismatched one.', no: 'Native VLAN frames go untagged on an 802.1Q trunk.' } }
        ] }
    ] },

    // ---------------------------------------------------------------- stage: the bridges (DEMO — fully built)
    { id: 'bridges', arc: 'grid', title: 'STAGE 4 · THE BRIDGES', sub: 'Spanning Tree Protocol · Days 20–21 · DEMO STAGE', npc: 'root', status: 'live', levels: [
      { id: 'stp-why', title: 'Why the keeper exists', sub: 'Day 20 · loops, broadcast storms', npc: 'root', day: [20], src: [PS('Spanning_Tree_Protocol_Part1.md'), SJ('08 - Day 20 - STP Part 1.md')], unlocks: ['stp-loops'],
        beats: [
          { k: 'TALK', text: 'Sit a moment. You have met Mac. Mac floods what he does not know. Now picture two switches joined by two cables, for safety. A broadcast goes out. Mac floods it. The other switch floods it back. Nothing in a frame counts down. No [[TTL]] at Layer 2. It goes around forever.' },
          { k: 'TALK', text: 'That is a [[broadcast storm]]. Every loop of the ring adds a copy. In seconds the links are full, the CPUs are pinned, and every MAC table flaps because the same face keeps arriving on two doors. The floor goes dark. Choom, I have watched a whole hospital go dark.' },
          { k: 'TALK', text: 'So the city keeps me. [[Spanning tree]]. I look at every redundant path and I close all but one. The cable stays plugged in, ready, but the port sleeps. If the live path dies, I wake the sleeper. Redundancy without the ring.' },
          { k: 'LORE', text: 'Radia Perlman designed the spanning tree algorithm in 1985, in a few days, at DEC. She wrote it up as a poem, "Algorhyme": "I think that I shall never see / a graph more lovely than a tree." It became IEEE 802.1D in 1990. In November 2002, Beth Israel Deaconess Medical Center in Boston lost its network for almost four days to a spanning tree meltdown. Doctors went back to paper. That is the storm I mean.' },
          { k: 'KIT', text: 'The first thing in your deck for this stage is not a command. It is a reflex.', kit: [ { cmd: 'two paths between switches = a loop unless something blocks one', what: 'the reflex' }, { cmd: 'show spanning-tree', what: 'the only command you need to start seeing the tree' } ] },
          { k: 'SYNC', q: { prompt: 'Why can a Layer 2 loop run forever when a Layer 3 loop cannot?', opts: ['Switches are faster than routers', 'Frames have no TTL; packets do', 'Broadcasts are Layer 3 only', 'Routers block loops with ACLs'], a: 1, yes: 'Nothing in a frame counts down. So I do.', no: 'A packet\'s TTL dies at zero. A frame has no such mercy. That is the whole reason for me.' } }
        ] },
      { id: 'stp-election', title: 'The election', sub: 'Day 20 · root bridge, root ports, designated ports, cost', npc: 'root', day: [20], src: [PS('Spanning_Tree_Protocol_Part1.md'), SJ('08 - Day 20 - STP Part 1.md')], unlocks: ['stp-election'],
        beats: [
          { k: 'TALK', text: 'One switch must be the centre of the tree: the [[root bridge]]. Every switch sends [[BPDU]]s, hello messages, with its Bridge ID. Priority first, then MAC address. Lowest wins. Default priority is 32768 plus the VLAN number, and since MACs are basically random, the oldest switch in the building usually wins. That is not a plan. That is an accident.' },
          { k: 'TALK', text: 'Every other switch picks one port that faces me: its root port. It picks by root cost, the sum of port costs on the way to me. Gigabit costs 4. FastEthernet costs 19. Ten-gig costs 2. Lower total wins. If two paths tie, the one through the neighbour with the lower Bridge ID. Still tied, the neighbour\'s lower port ID.' },
          { k: 'TALK', text: 'Then every cable segment gets one designated port: the end with the lower root cost, tie broken by lower Bridge ID. All my ports are designated; I am the root. Anything left over is non-designated. It blocks. It listens to BPDUs and forwards nothing. That sleeping port is the whole trick.' },
          { k: 'LORE', text: 'The priority is a 16-bit field. Cisco splits it: 4 bits of priority in steps of 4096, 12 bits of VLAN. That is why every priority you ever set is a multiple of 4096 and why "32769" shows up in VLAN 1. The design dates to 802.1t, 2001, so per-VLAN trees could share one MAC address.' },
          { k: 'KIT', text: 'Slot the numbers. They will be on the exam and in the job.', kit: [ { cmd: 'Bridge ID = priority (+VLAN) . MAC — lowest wins root', what: 'election' }, { cmd: 'cost: 10 Mb 100 · 100 Mb 19 · 1 Gb 4 · 10 Gb 2', what: 'port costs' }, { cmd: 'root port: lowest root cost → lowest neighbour BID → lowest neighbour port ID', what: 'tiebreak order' }, { cmd: 'designated per segment: lowest root cost → lowest BID', what: 'one per cable' }, { cmd: 'show spanning-tree', what: 'Root ID vs Bridge ID; "This bridge is the root"' } ] },
          { k: 'SYNC', q: { prompt: 'SW2 reaches the root by a FastEthernet link directly, or by two Gigabit links through SW3. Which is its root port?', opts: ['The FastEthernet link (cost 19)', 'The Gigabit path via SW3 (cost 8)', 'Both, load balanced', 'The one with the lower MAC'], a: 1, yes: '4 plus 4 is 8. 8 is less than 19. Two hops can be closer than one.', no: 'Add the costs: Gig 4 + Gig 4 = 8, less than one FastEthernet at 19. Hop count means nothing to me.' } }
        ] },
      { id: 'stp-states', title: 'Port states and timers', sub: 'Day 21 · blocking, listening, learning, forwarding · hello, forward delay, max age', npc: 'root', day: [21], src: [PS('Spanning_Tree_Protocol_Part2.md'), SJ('09 - Day 21 - STP Part 2.md')], unlocks: ['stp-states'],
        beats: [
          { k: 'TALK', text: 'A port has two stable moods and two moods it passes through. Stable: Blocking, for non-designated ports. Forwarding, for root and designated ports. Blocking hears BPDUs, forwards nothing, learns nothing. Forwarding does everything.' },
          { k: 'TALK', text: 'Between them, Listening then Learning. Fifteen seconds each, set by the [[forward delay]] timer. In Listening the port only handles BPDUs. In Learning it also starts writing MAC addresses, but still forwards no traffic. Only after both does it forward. Disabled is the fifth word: administratively shut, not in the tree at all.' },
          { k: 'TALK', text: 'Three timers, all dictated by the root bridge. [[Hello]]: I send a BPDU every 2 seconds. [[Max age]]: a switch waits 20 seconds of silence before it decides the topology changed. So a blocked port that must wake up takes 20 + 15 + 15. Fifty seconds. A forwarding port can drop to blocking at once. Waking is slow on purpose. Sleeping never is.' },
          { k: 'TALK', text: 'One more thing people miss. Switches only send BPDUs out designated ports. Root ports and blocked ports receive them. Silence on a root port for 20 seconds is how a switch learns its path to me has died.' },
          { k: 'LORE', text: 'The 50-second wake-up is why the original 802.1D got a reputation, and why 802.1w, [[RSTP]], arrived in 2001 with sub-second convergence and new role names: alternate and backup instead of "non-designated". Modern Cisco switches run Rapid PVST+ by default. The states and timers are still on the exam because the classic tree is still in half the buildings you will ever jack into.' },
          { k: 'KIT', text: 'Slot the timeline.', kit: [ { cmd: 'BLK → LST (15 s) → LRN (15 s) → FWD', what: 'the wake-up path, never skipped without PortFast' }, { cmd: 'hello 2 s · forward delay 15 s · max age 20 s', what: 'defaults, root bridge decides for everyone' }, { cmd: 'blocked → forwarding worst case 50 s', what: 'max age + listening + learning' }, { cmd: 'forwarding → blocking: immediate', what: 'closing a door is always safe' } ] },
          { k: 'SYNC', q: { prompt: 'In which state does a port learn MAC addresses but still not forward user traffic?', opts: ['Blocking', 'Listening', 'Learning', 'Forwarding'], a: 2, yes: 'Learning. It fills Mac\'s table so the moment it forwards, it forwards well.', no: 'Learning is the one that writes MACs but stays silent. Listening does neither; Forwarding does both.' } }
        ] },
      { id: 'stp-bpdu', title: 'The hello message', sub: 'Day 21 · BPDU fields, PVST+ vs 802.1D', npc: 'root', day: [21], src: [PS('Spanning_Tree_Protocol_Part2.md'), SJ('09 - Day 21 - STP Part 2.md')], unlocks: ['stp-bpdu'],
        beats: [
          { k: 'TALK', text: 'The [[BPDU]] is a small frame. It carries the Root Identifier: who we all think the root is. The Root Path Cost: how far the sender is from that root. The Bridge Identifier of the sender. The Port Identifier it left by. And the four timers: message age, max age, hello, forward delay.' },
          { k: 'TALK', text: 'Where it is addressed tells you which dialect you are hearing. Standard 802.1D BPDUs go to 01:80:C2:00:00:00. Cisco\'s per-VLAN flavour, PVST+, sends to 01:00:0C:CC:CC:CD. Both are multicast. Both are eaten by switches, never forwarded by a hub-minded box.' },
          { k: 'TALK', text: 'PVST, the old one, only worked on ISL trunks. PVST+ works on [[802.1Q]]. Rapid PVST+ is the same idea running RSTP. One tree per VLAN means Vee Lan\'s streets can each have a different root, and a different blocked port. That is load balancing, if you plan it. Or chaos, if you do not.' },
          { k: 'LORE', text: 'A BPDU is also an attack surface. Anyone who can plug in a box that speaks STP can send a BPDU claiming priority 0 and become the root of your building. Tools like Yersinia, 2005, made this a one-keystroke trick. Every hello you hear is a claim. The Toolkit is how you decide who gets to make claims.' },
          { k: 'KIT', text: 'Slot the addresses.', kit: [ { cmd: '01:80:C2:00:00:00', what: 'IEEE STP / RSTP BPDU destination' }, { cmd: '01:00:0C:CC:CC:CD', what: 'Cisco PVST+ BPDU destination' }, { cmd: 'BPDU = root ID · root path cost · bridge ID · port ID · timers', what: 'the fields' }, { cmd: 'PVST+ = 802.1Q · PVST = ISL only', what: 'trunk compatibility' } ] },
          { k: 'SYNC', q: { prompt: 'A capture shows frames to 01:00:0C:CC:CC:CD every 2 seconds. What are they?', opts: ['CDP advertisements', 'PVST+ BPDUs', 'IEEE 802.1D BPDUs', 'ARP replies'], a: 1, yes: 'Cisco per-VLAN hellos. Two seconds apart, as I said.', no: 'That address is Cisco PVST+. IEEE BPDUs use 01:80:C2:00:00:00. CDP shares the Cisco prefix but that is a different story.' } }
        ] },
      { id: 'stp-toolkit', title: 'The toolkit', sub: 'Day 21 · PortFast, BPDU Guard, Root Guard, Loop Guard', npc: 'root', day: [21], src: [PS('Spanning_Tree_Protocol_Part2.md'), SJ('09 - Day 21 - STP Part 2.md')], unlocks: ['stp-toolkit'],
        beats: [
          { k: 'TALK', text: 'A desk PC does not need thirty seconds of Listening and Learning. It is not a switch; it cannot form a loop. [[PortFast]] lets a port skip straight to Forwarding. Put it on host ports. Never on a port that faces another switch. Do that and you have built the loop I exist to prevent.' },
          { k: 'TALK', text: 'Since a PortFast port should never hear a BPDU, make that a rule: [[BPDU Guard]]. If a BPDU arrives, the port goes [[err-disabled]] on the spot. Someone plugged a switch under their desk? Door shut. Someone running Yersinia? Door shut.' },
          { k: 'TALK', text: 'Two more, quietly. Root Guard: a port that must never accept a superior BPDU, so no one downstream can steal the root. Loop Guard: a port that stops hearing BPDUs is not allowed to start forwarding, in case the link went one-way. The exam wants PortFast and BPDU Guard cold. Know the other two by name.' },
          { k: 'LORE', text: 'The err-disabled state is a Cisco convention; the port shows as down until someone does shutdown, no shutdown, or errdisable recovery kicks in. In the 2002 Boston hospital outage, part of the fix was exactly this discipline: define which ports are edges, guard them, and stop trusting every hello.' },
          { k: 'KIT', text: 'Slot the toolkit.', kit: [ { cmd: 'interface f0/1 → spanning-tree portfast', what: 'one host port skips to forwarding' }, { cmd: 'spanning-tree portfast default', what: 'global: every access port gets PortFast (never trunks)' }, { cmd: 'interface f0/1 → spanning-tree bpduguard enable', what: 'one port: BPDU arrives → err-disabled' }, { cmd: 'spanning-tree portfast bpduguard default', what: 'global: every PortFast port gets BPDU Guard' }, { cmd: 'shutdown / no shutdown', what: 'recover an err-disabled port after you pull the rogue' }, { cmd: 'spanning-tree guard root  ·  spanning-tree guard loop', what: 'Root Guard, Loop Guard (know the names)' } ] },
          { k: 'SYNC', q: { prompt: 'PortFast is enabled on a port that connects to another switch. What is the risk?', opts: ['Slower convergence', 'A Layer 2 loop before STP can block the port', 'The port cannot trunk', 'Nothing; PortFast is safe anywhere'], a: 1, yes: 'A port forwarding before I have judged it is a loop waiting to be born.', no: 'PortFast skips the safety states. On a switch-facing port that means forwarding into a loop before the tree can react.' } }
        ] },
      { id: 'stp-config', title: 'Shaping the tree', sub: 'Day 21 · mode, root primary/secondary, priority, cost, port-priority', npc: 'root', day: [21], src: [PS('Spanning_Tree_Protocol_Part2.md'), SJ('09 - Day 21 - STP Part 2.md')], unlocks: ['stp-config'],
        beats: [
          { k: 'TALK', text: 'Do not let the oldest switch be the root by accident. Choose. "spanning-tree vlan 1 root primary" sets the priority to 24576. If some other switch is already lower, it goes 4096 below that one instead. "root secondary" sets 28672, a backup that wins if the primary dies.' },
          { k: 'TALK', text: 'Or set it by hand: "spanning-tree vlan 1 priority 4096". Multiples of 4096 only; 0 is allowed. Per VLAN, always. Make SW1 root for VLAN 10 and SW2 root for VLAN 20 and both uplinks carry traffic. That is the honest use of PVST+.' },
          { k: 'TALK', text: 'The mode: "spanning-tree mode rapid-pvst" is the modern default; "pvst" is classic; "mst" is for very large buildings. On a port, "spanning-tree cost 4" changes the root cost that port adds, and "spanning-tree port-priority 64" breaks ties on the neighbour\'s side. Then look. Always look. "show spanning-tree" is the whole truth of the tree.' },
          { k: 'LORE', text: 'The 24576 and 28672 numbers are not magic: 24576 is 6 × 4096, 28672 is 7 × 4096, both comfortably under the default 8 × 4096 = 32768. The macro was added so admins would stop typing raw priorities wrong. Fun fact: the "root primary" command is a one-time calculation. If a lower switch appears later, it does not re-run. Set priority explicitly if you want a guarantee.' },
          { k: 'KIT', text: 'Slot the shaping commands. These are the job.', kit: [ { cmd: 'spanning-tree mode rapid-pvst | pvst | mst', what: 'global; which tree dialect' }, { cmd: 'spanning-tree vlan 1 root primary', what: '24576, or 4096 below the current lowest' }, { cmd: 'spanning-tree vlan 1 root secondary', what: '28672' }, { cmd: 'spanning-tree vlan 1 priority 4096', what: 'explicit, multiples of 4096' }, { cmd: 'interface g0/1 → spanning-tree vlan 1 cost 4', what: 'nudge the root cost on one port' }, { cmd: 'interface g0/1 → spanning-tree vlan 1 port-priority 64', what: 'tiebreaker seen by the neighbour' }, { cmd: 'show spanning-tree [vlan N]', what: 'verify: Root ID, Bridge ID, roles and states' } ] },
          { k: 'SYNC', q: { prompt: 'All switches are at default priority. You type "spanning-tree vlan 1 root primary" on SW3. Its priority for VLAN 1 becomes…', opts: ['0', '4096', '24576', '28672'], a: 2, yes: 'Twenty-four thousand five hundred seventy-six. Plus one for the VLAN, in the display.', no: '24576. Only if someone was already lower would it go 4096 beneath them. 28672 is "secondary".' } }
        ] }
    ] },

    // ---------------------------------------------------------------- stage: the roads (stub)
    { id: 'roads', arc: 'grid', title: 'STAGE 5 · THE ROADS', sub: 'routing: static, OSPF, FHRP', npc: 'nexthop', status: 'stub', levels: [
      { id: 'nexthop-intro', title: 'One hop at a time', sub: 'Days 11, 14–15 · routing fundamentals, static routes', npc: 'nexthop', day: [11,14,15], src: [PS('Routing_Fundamentals_Part1.md'), PS('Static_Routing_Part2.md'), PS('Life_of_a_Packet.md')], unlocks: ['static-route'],
        beats: [
          { k: 'TALK', text: 'People think a router knows the way. Nah. It knows the [[next hop]]. That is it. A packet gets in my cab, I look at my [[routing table]], I drive it one block to the next cab. Every cab does that and somehow the whole city works.' },
          { k: 'TALK', text: 'My table has [[connected route]]s, streets I have a door on. [[Static route]]s a human typed. And routes Ospef gossips to me. If more than one fits, [[longest prefix match]] wins. If nothing fits, the [[default route]] wins. If there is no default, the packet dies in my cab. Sad. Happens.' },
          { k: 'LORE', text: 'The first router was the IMP, an Interface Message Processor built by BBN on a Honeywell 516. On 29 October 1969 UCLA tried to send "LOGIN" to Stanford through it. The system crashed after "LO". First message on the internet: "lo". Cab crashed on the first fare. We got better.' },
          { k: 'KIT', text: 'Slot the cab commands.', kit: [ { cmd: 'ip route 10.0.2.0 255.255.255.0 10.0.12.2', what: 'static route via next hop' }, { cmd: 'ip route 0.0.0.0 0.0.0.0 203.0.113.1', what: 'default route toward the ISP' }, { cmd: 'show ip route', what: 'read the table: C connected, S static, S* default, O OSPF' } ] },
          { k: 'SYNC', q: { prompt: 'Routes 10.0.0.0/8, 10.1.0.0/16 and 0.0.0.0/0 all exist. A packet to 10.1.2.3 uses…', opts: ['10.0.0.0/8', '10.1.0.0/16', '0.0.0.0/0', 'whichever was typed first'], a: 1, yes: 'Most specific street. Always.', no: 'Longest prefix match: /16 beats /8 beats the default.' } }
        ] }
    ] },

    // ---------------------------------------------------------------- stage: services (stub)
    { id: 'services', arc: 'grid', title: 'STAGE 6 · THE SERVICES', sub: 'TCP/UDP, IPv6, DNS, DHCP, NAT, SSH', npc: 'denise', status: 'stub', levels: [
      { id: 'denise-intro', title: 'Names, leases, one clock', sub: 'Days 37–39 · DNS, DHCP, NTP', npc: 'denise', day: [37,38,39], src: [PS('DNS.md'), PS('DHCP.md'), PS('NTP.md'), SJ('27 - Day 38 - DNS.md')], unlocks: ['dhcp'],
        beats: [
          { k: 'TALK', text: 'Operator. You want a name, I give you a number. That is [[DNS]]. You want a number for yourself, my intern Dora leases you one: Discover, Offer, Request, Ack. That is [[DHCP]]. And everyone sets their watch to me, because logs without [[NTP]] are fiction.' },
          { k: 'LORE', text: 'Before DNS there was one text file, HOSTS.TXT, kept at SRI by Elizabeth "Jake" Feinler\'s team, and everyone downloaded it. Paul Mockapetris replaced it with DNS in 1983. On 21 October 2016 the Mirai botnet, built from IoT devices with default passwords, flooded the Dyn DNS provider, and half the US internet forgot everyone\'s name for a morning.' },
          { k: 'KIT', text: 'Slot the service commands.', kit: [ { cmd: 'ip dhcp excluded-address 10.0.0.1 10.0.0.10 → ip dhcp pool LAN → network 10.0.0.0 255.255.255.0 → default-router 10.0.0.1 → dns-server 8.8.8.8', what: 'a router as DHCP server' }, { cmd: 'ip helper-address 10.0.9.5', what: '[[DHCP relay]] on the LAN interface' }, { cmd: 'ntp server 10.0.9.9 · show ntp status', what: 'time' } ] }
        ] }
    ] },

    // ---------------------------------------------------------------- stage: ice (stub)
    { id: 'ice', arc: 'grid', title: 'STAGE 7 · THE ICE', sub: 'security fundamentals, ACLs, port security, snooping', npc: 'ace', status: 'stub', levels: [
      { id: 'ace-intro', title: 'Top to bottom, once', sub: 'Days 34–35, 48–50 · ACLs, port security, DHCP snooping, DAI', npc: 'ace', day: [34,35,48,49,50], src: [PS('Standard_Access_Control_Lists.md'), PS('Port_Security.md'), PS('DHCP_Snooping.md'), SJ('23 - Day 34 - Standard ACLs.md')], unlocks: ['acl-standard', 'port-security'],
        beats: [
          { k: 'TALK', text: 'An [[ACL]] is a list. I read it top to bottom. First line that matches, I act and stop reading. If I reach the end, [[implicit deny]]. Everything. That is not cruelty. That is the default.' },
          { k: 'TALK', text: 'Sticky here works the switch ports. [[Port security]]: how many faces a port may learn, and what to do when a stranger shows up. She remembers the first face she sees and keeps it. [[Sticky MAC]]. Do not pet her.' },
          { k: 'LORE', text: 'On 2 November 1988 Robert Tappan Morris released a worm that hit about a tenth of the internet in a day. It was the first conviction under the Computer Fraud and Abuse Act and the reason CERT/CC exists. Every list I read is a descendant of that night.' },
          { k: 'KIT', text: 'Slot the gate commands.', kit: [ { cmd: 'access-list 10 deny 192.168.2.0 0.0.0.255 → access-list 10 permit any', what: 'standard numbered ACL with [[wildcard mask]]' }, { cmd: 'interface g0/2 → ip access-group 10 out', what: 'apply near the destination' }, { cmd: 'switchport port-security → maximum 2 → violation restrict → mac-address sticky', what: 'Sticky\'s leash' } ] }
        ] }
    ] },

    // ---------------------------------------------------------------- stage: the lab & beyond (stub)
    { id: 'lab', arc: 'grid', title: 'STAGE 8 · THE LAB', sub: 'wireless, virtualization, automation', npc: 'hypervisor', status: 'stub', levels: [
      { id: 'hyper-intro', title: 'Little instances', sub: 'Days 55–63 · virtualization, cloud, SDN, automation', npc: 'hypervisor', day: [55,56,57,60,61,62,63], src: [PS('Virtualizations_and_Cloud_Part1.md'), PS('Software_Defined_Networking.md'), PS('Ansible_Puppet_Chef.md')], unlocks: ['virtualization'],
        beats: [
          { k: 'TALK', text: 'Welcome to the Lab. Every practicum you run in this game is a little instance in my basement. A [[hypervisor]] runs many [[virtual machine]]s on one box; a [[container]] shares the kernel and starts in a blink. When you jack in on a job, you are inside one of mine. Break it freely. I have snapshots.' },
          { k: 'LORE', text: 'IBM ran the first virtual machines on the CP-40 in 1967. VMware made it mainstream in 1998. Docker put containers in everyone\'s hands at PyCon in March 2013. Jason and Ansible live down the hall: JSON is from 2001, Ansible from 2012, named after the faster-than-light communicator in Ursula K. Le Guin\'s novels.' },
          { k: 'KIT', text: 'Slot the vocabulary.', kit: [ { cmd: 'Type 1 (ESXi, Hyper-V) · Type 2 (VirtualBox, Workstation)', what: 'bare metal vs hosted' }, { cmd: '[[control plane]] · [[data plane]] · [[management plane]]', what: 'SDN splits the first from the second' }, { cmd: 'GET · POST · PUT · PATCH · DELETE', what: '[[REST API]] verbs' } ] }
        ] }
    ] }
  ];

  window.SKILLS = {
    'osi-layers': 'OSI / TCP-IP layers', 'cli-modes': 'IOS CLI modes & saving', 'subnetting': 'Subnetting', 'mac-table': 'MAC table & ARP', 'vlan-config': 'VLAN config', 'trunk-config': 'Trunk config',
    'stp-loops': 'Loop awareness', 'stp-election': 'STP election & cost', 'stp-states': 'STP states & timers', 'stp-bpdu': 'BPDU reading', 'stp-toolkit': 'PortFast / BPDU Guard', 'stp-config': 'Shaping the tree',
    'static-route': 'Static routing', 'dhcp': 'DHCP', 'acl-standard': 'Standard ACLs', 'port-security': 'Port security', 'virtualization': 'Virtualization vocabulary'
  };
})();
