/* District 03 · The Floor — the switch floor under the Kabuki market. Mac works the door; Vee Lan draws the borders.
   Nights 5, 6, 9 (switching, ARP, switch interfaces), 16–19 (VLANs, trunks, multilayer switching, DTP and VTP), then 23 and 36.
   Written to docs/STORY_BIBLE.md (Voice) and docs/CAMPAIGN_MAP.md. */
(function(){
  const { PS, SJ } = SRC;
  STAGES.push({ id: 'floor', arc: 'grid', title: 'STAGE 3 · THE FLOOR', sub: 'switching, VLANs, trunks', npc: 'mac', status: 'live', levels: [
    // ------------------------------------------------------------ night 5 · Ethernet LAN switching, part 1
    { id: 'n05-the-door', title: 'Every face for five minutes', sub: 'Ethernet frames and the MAC address table', npc: 'mac', day: [5], src: [PS('Ethernet_LAN_Switching_Part1.md')], unlocks: ['mac-table'],
      beats: [
        { k: 'SCENE', where: 'Under the Kabuki market · the switch floor · just after midnight',
          lines: [
            { who: 'narr', text: 'The stairs down from the market are tacky with spilled soda, and at the bottom the air is ten degrees hotter than the street. Fryer oil drifts down through the grates in the ceiling, over the steady hum of the racks. By a steel door with twenty-four numbered slots cut into it, a young man in a green cap sits on a stool with a ledger open on his knee, writing without looking up.' },
            { who: 'mac', text: 'New face. Give me a second, I\'m writing down the last three. There. I\'m Mac, and I work this door, which means I read the outside of every frame that comes through one of these slots.' },
            { who: 'mac', text: 'A frame opens with a drumroll so the far end can get in step: seven bytes of 10101010, the [[preamble]]. Then one byte of 10101011, the [[SFD]], the start frame delimiter, which says the drumroll is over. After that come six bytes of destination MAC address, six bytes of source MAC address, and two bytes of type or length.' },
            { who: 'mac', text: 'The type tells me what the frame is carrying. 0x0800 means an IPv4 packet and 0x86DD means IPv6. If the number in that field is 1500 or less it\'s a length instead, and 1536 or more means it\'s a type. At the very end there\'s a four-byte trailer, the [[FCS]], the frame check sequence. It\'s a CRC worked out over the whole frame, and if my sum doesn\'t match it, the frame got damaged on the way and I bin it.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What does a MAC address actually look like?', reply: 'Mac: "Forty-eight bits, which is six bytes, written as twelve hex digits, like 0014.2251.7A3C. Hex runs 0 to 9 and then A to F for ten to fifteen. The first three bytes are the [[OUI]], the number the IEEE gives each maker, and the maker picks the last three. It\'s burned into the card at the factory, so people also call it the [[BIA]], the burned-in address."' },
            { tone: 'press', say: 'Why bother checking the sum on every frame?', reply: 'Mac: "Because cables get stepped on. You were on Osi\'s loading dock, so you\'ve seen what a van does to copper. A frame that picked up noise on the way looks fine from the outside, and the FCS is the only way I find out it isn\'t."' },
            { tone: 'joke', say: 'Do you ever get to sleep?', reply: 'He laughs without looking up from the ledger. "I nap between frames, and on a market night there are a lot of frames."' }
          ] } },
        { k: 'SCENE', where: 'The switch floor · the door',
          lines: [
            { who: 'mac', text: 'Every time a frame comes in, I write down its source MAC address and the slot it came through. That list is the [[MAC address table]]. I only ever learn from the source address, never the destination.' },
            { who: 'mac', text: 'When a frame comes in for a face I\'ve already written down, a [[unicast]] frame to someone I know, I send it out that one slot and no other. When it\'s for a face I\'ve never seen, an [[unknown unicast]], I send a copy out of every slot except the one it came in on. That\'s [[flooding]]. Whoever answers, I write down.' },
            { who: 'mac', text: 'And I forget on purpose. If a face hasn\'t sent me anything for five minutes, three hundred seconds, I cross it out. That\'s [[aging]]. People move their laptops between stalls, and a table that never forgot would keep sending frames to empty chairs.' },
            { who: 'you', text: 'What if the same face turns up at two slots?' },
            { who: 'mac', text: 'Then I believe the newest one and move the entry. If it keeps flipping back and forth between two slots, something is badly wrong on this floor, and I\'d want someone to come and look. The towers downtown have whole floors of switches like this one, and every one of them keeps its book the way I keep mine.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What goes in each line of the book?', reply: 'Mac: "Four things: the VLAN, the MAC address, how I learned it, and the port. Anything I picked up from traffic is DYNAMIC. You see it all with show mac address-table."' },
            { tone: 'press', say: 'Why not keep every face forever?', reply: 'Mac: "Because the table has a size limit and the market doesn\'t. A stall that closed last week would sit in my book taking up a line, and a laptop that moved from stall 3 to stall 14 would keep getting its frames at stall 3."' },
            { tone: 'care', say: 'Does anyone ever thank you for this?', reply: 'Mac shrugs. "The market only comes down here when something stops working. Vee Lan says thank you about twice a year, and she means it both times."' }
          ] } },
        { k: 'LORE', title: 'A DOOR WITH A MEMORY', year: 1990, real: ['kalpana', 'cisco'], vibe: 'Fresh. The hub finally learned to shut up and listen.',
          text: 'Mac, flipping back through the ledger: "Before 1990 this floor ran on hubs. A hub repeats every frame out of every port, so every desk hears every conversation and they all trip over each other. In 1990 a small company called Kalpana sold the first Ethernet switch, the EtherSwitch, which learned where each address lived and only sent frames there. Cisco bought Kalpana in 1994, and the boxes on this floor are its great-grandchildren. My old boss kept a Kalpana badge in the drawer of this stool."' },
        { k: 'KIT', text: 'Mac tears a page out of the back of the ledger and writes on it.', real: ['ieee'], kit: [
          { cmd: 'preamble 7 · SFD 1 · destination 6 · source 6 · type/length 2 · ... · FCS 4 (bytes)', what: 'an Ethernet frame. 10101010 ×7, then 10101011. FCS is a CRC' },
          { cmd: 'type 0x0800 IPv4 · 0x86DD IPv6 · ≤1500 length · ≥1536 type', what: 'what the frame carries' },
          { cmd: 'MAC: 48 bits · 6 bytes · 12 hex digits · first 3 bytes = OUI', what: 'the burned-in address' },
          { cmd: 'learn the SOURCE · forward known unicast · flood unknown unicast', what: 'the switch\'s three habits. Never back out the port it came in on' },
          { cmd: 'show mac address-table', what: 'the book: VLAN, MAC, DYNAMIC, port. Entries age out after 5 minutes (300 s)' } ] },
        { k: 'SYNC', q: { prompt: 'A vendor leaning over the stair rail calls down: "My new till hasn\'t sent a thing since I plugged it in. If somebody sends it a frame, what does your door do?"', opts: ['Floods it out every slot except the one it came in on', 'Drops it, because the till is not in the table', 'Sends it back out the slot it came in on', 'Keeps it until the till speaks'], a: 0,
          yes: 'Mac: "Out every slot but one. When your till answers, I\'ll write it down."', no: 'Mac: "I flood it. Every slot except the one it came in on, and I learn the till when it answers."',
          why: 'Mac: The till has never sent a frame, so its MAC address is not in the table. A frame for an unknown unicast address is flooded out of every port except the one it arrived on. When the till replies, the switch learns its MAC address from the reply\'s source field.' } }
      ] },
    // ------------------------------------------------------------ night 6 · Ethernet LAN switching, part 2 (ARP)
    { id: 'n06-who-has', title: 'The first receipt of the morning', sub: 'ARP, ping and the MAC address table', npc: 'mac', day: [6], src: [PS('Ethernet_LAN_Switching_Part2.md')], unlocks: ['arp'],
      beats: [
        { k: 'SCENE', where: 'The Kabuki market · Hanna\'s print stall · opening time',
          lines: [
            { who: 'narr', text: 'The market shutters rattle up one after another, and the smell of hot toner mixes with frying dough from the stall next door. Hanna\'s print stall is a counter, a till and a receipt printer on a shelf behind her, wedged between a phone repair booth and a tea stall. She is holding up a blank strip of receipt paper as Mac comes up the stairs behind you.' },
            { who: 'Hanna', text: 'Every morning it\'s the same. The first sale of the day, the till says it sent the receipt and the printer does nothing. The second sale prints fine, and so does every one after it until closing.' },
            { who: 'mac', text: 'That\'s the till asking a question before it can print. The till knows the printer\'s IP address, but a frame needs a MAC address, and overnight the till forgot which MAC goes with that IP. So before it can send the receipt, it has to ask.' },
            { who: 'mac', text: 'It asks with [[ARP]], the address resolution protocol. The till sends an [[ARP request]] to the broadcast address, FFFF.FFFF.FFFF, so every device in the building hears it: who has 10.20.0.112, tell 10.20.0.25. Only the printer answers, with an [[ARP reply]] sent straight back to the till, unicast. The till writes the answer in its ARP table and sends the receipt.' },
            { who: 'Hanna', text: 'So why doesn\'t the first receipt come out once it knows?' },
            { who: 'mac', text: 'Because the till only waits a moment for each receipt, and asking takes longer than that moment. The first one gives up while the till is still waiting for the printer to answer. By the second sale the answer is already written down.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'How do I see what the till has written down?', reply: 'Mac: "On the till, arp -a. Windows, Mac and Linux all use the same command. On one of our Cisco boxes it\'s show arp. Each line is an IP address and the MAC that goes with it."' },
            { tone: 'press', say: 'Isn\'t a broadcast to the whole building wasteful?', reply: 'Mac: "It is, a little. Every device has to open it and check whether it\'s the one being asked for. That\'s why the answer is written down afterwards, so the till only has to shout once, and the reply goes back to one device only."' },
            { tone: 'care', say: 'Hanna, has this been costing you sales?', reply: 'Hanna: "The customers wait while I print it again. Nobody leaves, but I feel stupid every single morning." Mac tells her it\'s the till\'s fault, not hers, and she looks happier than the problem deserves.' }
          ] } },
        { k: 'SCENE', where: 'The switch floor · the door',
          lines: [
            { who: 'mac', text: '[[Ping]] works the same way underneath. It sends an ICMP echo request and waits for an ICMP echo reply. The first ping to a device you haven\'t talked to lately usually loses one, because it waits on ARP the same way Hanna\'s first receipt does.' },
            { who: 'mac', text: 'Some numbers the Board likes. An Ethernet header and trailer come to 18 bytes, not counting the preamble and SFD. The smallest frame allowed is 64 bytes, so the payload has to be at least 46. An ARP request is shorter than that, so the sender pads it out with zeros. An ARP frame carries type 0x0806.' },
            { who: 'mac', text: 'My book and the till\'s ARP table are two separate things. My book says which slot a MAC is behind. The ARP table says which MAC goes with an IP. If I lose my book, the till still knows the printer\'s MAC; I flood the frame, and I learn the printer again from its answer.' },
            { who: 'you', text: 'Can you wipe your book on purpose?' },
            { who: 'mac', text: 'clear mac address-table dynamic wipes every entry I learned. Add address and a MAC to forget one face, or interface and a port to forget everything on one slot. The five-minute aging does the same thing slowly.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Why would you ever clear it by hand?', reply: 'Mac: "When something has moved and I\'m still sending its frames to the old slot. A printer that\'s moved stalls stays quiet until someone talks to it, so I could keep the old slot for five whole minutes. Clearing it makes me flood the next frame and learn the new slot from the reply."' },
            { tone: 'press', say: 'What stops someone faking an ARP reply?', reply: 'Mac frowns at the ledger. "Nothing in ARP itself. Whoever answers gets believed. Ace Elle at the gate has a lot to say about that, and I\'d let her say it."' },
            { tone: 'quiet', say: '(Watch him write the printer\'s MAC in the ledger.)', reply: 'He writes 0060.b0c1.2e12 next to slot 12, then, in the margin, Hanna\'s name and a tiny drawing of a receipt.' }
          ] } },
        { k: 'LORE', title: 'WHO HAS', year: 1982, real: ['ietf'], vibe: 'Like, totally. One box shouts a question at the room and the right one answers.',
          text: 'Mac, putting the ledger away: "ARP is RFC 826. David Plummer wrote it in November 1982, when he was a student at MIT, so machines on an Ethernet could find each other\'s hardware addresses from an internet address. Every till and printer in this market still asks his question the way he wrote it."' },
        { k: 'KIT', text: 'Mac writes it on the back of one of Hanna\'s blank receipts.', kit: [
          { cmd: 'ARP request: broadcast to FFFF.FFFF.FFFF · ARP reply: unicast · type 0x0806', what: 'who has this IP, tell me your MAC' },
          { cmd: 'arp -a (PC)  ·  show arp (Cisco)', what: 'the ARP table: IP to MAC' },
          { cmd: 'ping: ICMP echo request · echo reply', what: 'the first ping often loses one while ARP runs' },
          { cmd: 'header + trailer 18 B · minimum frame 64 B · minimum payload 46 B', what: 'shorter payloads get padded' },
          { cmd: 'clear mac address-table dynamic [address MAC | interface PORT]', what: 'forget learned faces. Aging does it after 5 minutes' } ] },
        { k: 'SYNC', q: { prompt: 'Hanna, tearing off a test receipt: "When the till asks who has the printer\'s address, who actually hears the question?"', opts: ['Every device in the building, because the request is a broadcast', 'Only the printer', 'Only the switch', 'Only the router'], a: 0,
          yes: 'Mac: "Everyone hears it, and only the printer answers."', no: 'Mac: "Everyone. The request goes to FFFF.FFFF.FFFF, and only the printer answers it."',
          why: 'Mac: An ARP request is sent to the broadcast MAC address FFFF.FFFF.FFFF, so the switch floods it to every device in the LAN. Every device reads it, but only the one with the requested IP address answers, and its ARP reply is unicast back to the asker.' } }
      ] },
    // ------------------------------------------------------------ night 9 · switch interfaces
    { id: 'n09-dropped-frames', title: 'The cameras that stutter', sub: 'speed, duplex and interface errors', npc: 'mac', day: [9], src: [PS('Switch_Interfaces.md')], unlocks: ['switch-ifaces'],
      beats: [
        { k: 'SCENE', where: 'The switch floor · the camera closet at the end of the aisle',
          lines: [
            { who: 'narr', text: 'The camera closet is barely wide enough for two people and a rack, and it smells of dust cooking on warm electronics. On a monitor bolted to the wall, sixteen grey squares show the market above, and every few seconds the picture in each one freezes, smears and jumps forward. Mac is in the doorway with his arms folded. A woman with long black hair and a thin scar through one eyebrow is kneeling at the rack with a torch.' },
            { who: 'veelan', text: 'I\'m Vee Lan. I draw the borders on this floor, and I get called when something crosses one. The cameras have been stuttering for a month, and it started the week he touched this port.' },
            { who: 'mac', text: 'I set it to a hundred, full duplex, because auto is lazy. The cable\'s bad, that\'s all it is.' },
            { who: 'veelan', text: 'The cable\'s fine. Every port starts on auto for speed and duplex, and two ends on auto negotiate the fastest speed they share, at full duplex. You hard-coded your end, so it stopped negotiating. The camera switch on the other end is still on auto, and when nobody answers the negotiation it has to guess.' },
            { who: 'veelan', text: 'It can hear the speed on the wire, so it gets 100 right. It can\'t hear the duplex, so at 10 or 100 it falls back to [[half duplex]]. Mac\'s end is on [[full duplex]] and the camera end is on half. That\'s a [[duplex mismatch]].' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What\'s actually different between half and full?', reply: 'Vee Lan: "At full duplex a port sends and receives at the same time. At half duplex it can only do one at a time, and if it hears something arrive while it\'s sending, it thinks there\'s been a collision, stops, and tries again later. Mac\'s end never stops to listen, so the camera end keeps backing off, and frames get cut short."' },
            { tone: 'press', say: 'Mac, why hard-code it at all?', reply: 'Mac: "Because a switch once came up at ten meg on auto and nobody noticed for a week." Vee Lan: "Then you set both ends, not one. With one end on manual and the other on auto you get exactly this."' },
            { tone: 'quiet', say: '(Watch the camera picture freeze and jump.)', reply: 'The feed from the stairs freezes on a man halfway down a step and then jumps to an empty stairwell. Vee Lan watches it too and says nothing.' }
          ] } },
        { k: 'SCENE', where: 'The camera closet · the rack',
          lines: [
            { who: 'veelan', text: 'The counters on show interfaces tell you which end is suffering. [[Runts]] are frames shorter than 64 bytes, and [[giants]] are longer than 1518. [[CRC]] errors are frames whose FCS didn\'t add up. Frame errors are frames with a bad format. Input errors is the total of all the receive problems, and output errors counts frames the port failed to send.' },
            { who: 'veelan', text: 'A duplex mismatch has a signature. The full-duplex end fills up with CRC errors and runts, because the half-duplex end keeps abandoning frames partway through. The half-duplex end counts [[late collision]]s, collisions after the first 64 bytes, which should never happen on a working link.' },
            { who: 'mac', text: 'Before switches, this floor ran on hubs. Everything plugged into a hub shared one [[collision domain]], and they all had to run half duplex with [[CSMA/CD]]: listen before you send, and if two send at once, both stop and wait a random time. Every switch port is its own collision domain, so full duplex works.' },
            { who: 'veelan', text: 'When you configure more than one port the same way, use interface range, so you type the settings once. Switch ports come up on their own: up/up with a device on the end, down/down with nothing plugged in.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'So how do we fix it?', reply: 'Vee Lan: "Make both ends agree. Either both on auto, which is what I\'d do, or both hard-coded to speed 100 and duplex full. Then read the status again and watch the errors stop climbing."' },
            { tone: 'press', say: 'Why does Vee Lan owe Old Root?', reply: 'Mac glances at her. She keeps her eyes on the rack. "He taught me this floor when nobody else would. I\'ll pay him back when I find something he couldn\'t fix. Get on with the cameras."' },
            { tone: 'joke', say: 'Should I stand between you two?', reply: 'Mac grins. "Every time she\'s on this floor. She\'s usually right, which makes it worse."' }
          ] } },
        { k: 'LORE', title: 'A HUNDRED MEG', year: 1995, real: ['ieee'], vibe: 'All that. Ten times the speed, and everybody still blamed the cable.',
          text: 'Vee Lan, coiling the torch cable: "The IEEE approved Fast Ethernet, 802.3u, in June 1995. A hundred megabits on the same kind of copper that carried ten, and it brought autonegotiation with it, so a new card and an old card could agree on a speed without anyone touching them. Old Root put the first hundred-meg switch into the clinic. He says he still has the box it came in."' },
        { k: 'KIT', text: 'Vee Lan writes on the closet door in grease pencil.', kit: [
          { cmd: 'speed 100 · duplex full · speed auto · duplex auto', what: 'defaults are auto. Set both ends the same, or leave both on auto' },
          { cmd: 'hard-coded end + auto end: auto senses speed, uses half duplex at 10/100', what: 'the duplex mismatch' },
          { cmd: 'show interfaces status · show interfaces g0/1', what: 'a- means negotiated. Counters: runts <64 B, giants >1518 B, CRC, frame, input and output errors, late collisions' },
          { cmd: 'interface range f0/2 - 4', what: 'configure several ports at once' },
          { cmd: 'hub: one collision domain, half duplex, CSMA/CD · switch: one collision domain per port', what: 'why full duplex needs a switch' } ] },
        { k: 'SYNC', q: { prompt: 'Mac, still not convinced: "My end is 100 and full. The camera end is on auto. What does the camera end end up running?"', opts: ['100 Mb/s at half duplex', '100 Mb/s at full duplex', '10 Mb/s at half duplex', 'Nothing. The link stays down'], a: 0,
          yes: 'Vee Lan: "A hundred, half. Now you know why the cameras stutter."', no: 'Vee Lan: "It hears 100 on the wire and can\'t negotiate the duplex, so it uses half."',
          why: 'Vee Lan: Hard-coding speed and duplex on one end disables autonegotiation there. The auto end can still sense the speed, 100 Mb/s, but not the duplex, so at 10 or 100 Mb/s it defaults to half duplex. One end at full and the other at half is a duplex mismatch.' } }
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
      ] }
  ] });
})();
