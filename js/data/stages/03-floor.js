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
        { k: 'LORE', title: 'WHO HAS', year: 1982, real: ['ietf', 'mit'], vibe: 'Like, totally. One box shouts a question at the room and the right one answers.',
          text: 'Mac, putting the ledger away: "ARP is RFC 826. David Plummer wrote it in November 1982, when he was a student at MIT, so machines on an Ethernet could find each other\'s hardware addresses from an internet address. Every till and printer in this market still asks his question the way he wrote it."' },
        { k: 'KIT', real: ['cisco'], text: 'Mac writes it on the back of one of Hanna\'s blank receipts.', kit: [
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

    // ------------------------------------------------------------ night 16 · VLANs, part 1
    { id: 'n16-borders', title: 'Tape on the floor', sub: 'broadcast domains and VLANs', npc: 'veelan', day: [16], src: [PS('VLAN_Part1.md')], unlocks: ['vlan-config'],
      beats: [
        { k: 'SCENE', where: 'The Kabuki market · the office above the stalls · morning',
          lines: [
            { who: 'narr', text: 'The market office is a mezzanine over the stalls, and the smell of frying dough comes up through the floor with the noise. Three desks share one switch with the stall cable that runs down to sixty traders, the security cameras and a free hotspot by the stairs. Vee Lan is on her knees laying a strip of yellow tape across the carpet between the desks and the stairwell.' },
            { who: 'veelan', text: 'The office does the market\'s books on the same network as every stall and every stranger on the hotspot. One switch, one [[broadcast domain]]: every ARP request from a phone on the stairs lands on the accountant\'s PC, and anyone who can plug in can see the accounts server.' },
            { who: 'veelan', text: 'A [[VLAN]] draws a border inside the switch. Ports in VLAN 10 only hear VLAN 10, ports in VLAN 20 only hear VLAN 20, and a broadcast stops at the edge of its own VLAN. It\'s a Layer 2 border: the switch keeps the VLANs apart and won\'t forward a frame from one to another.' },
            { who: 'veelan', text: 'The office gets VLAN 10, the stalls VLAN 20 and the cameras VLAN 30. Each VLAN is its own subnet, and anything that needs to cross from one to another has to go through a router.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What VLANs does a switch come with?', reply: 'Vee Lan: "Five. VLAN 1, the default, which every port starts in, and 1002 to 1005, leftovers from Token Ring and FDDI that you can\'t delete. Everything on this floor is in VLAN 1 right now, which is the problem."' },
            { tone: 'press', say: 'Couldn\'t you just use three switches?', reply: 'Vee Lan: "I could, and buy two more switches, and run new cable, and do it again every time someone moves a desk. When the pharmacy downstairs wants its own border, I add a line to the config instead of buying another switch."' },
            { tone: 'care', say: 'Why do you care so much about lines on the floor?', reply: 'She presses the end of the tape flat. "Because Old Root taught me that most of what goes wrong on a network is something where it shouldn\'t be. A border stops things wandering. I owe him that lesson, and I hate owing him."' }
          ] } },
        { k: 'SCENE', where: 'The market office · the switch under the desk',
          lines: [
            { who: 'veelan', text: 'You create a VLAN in global configuration with vlan and its number, and give it a name so the next person knows what it\'s for. Then each port that connects to a host becomes an [[access port]] in one VLAN: switchport mode access, then switchport access vlan and the number.' },
            { who: 'veelan', text: 'A port that carries more than one VLAN, between switches, is a [[trunk port]]. That\'s tomorrow night\'s problem. Tonight the router gets one cable per VLAN, one port in each, and routes between them.' },
            { who: 'veelan', text: 'show vlan brief lists every VLAN with its name and the access ports in it. If a port\'s in the wrong VLAN, that\'s where you see it.' },
            { who: 'narr', text: 'Mac leans in the doorway with a tea from the stall below.' },
            { who: 'mac', text: 'The cameras too? Some of those are mine.' },
            { who: 'veelan', text: 'Especially the cameras, Mac. Anyone on the hotspot can pull up the stairwell feed right now.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'How does a PC in VLAN 10 reach the stalls, then?', reply: 'Vee Lan: "Through the router. The PC sends to its gateway, the router\'s address in VLAN 10, and the router sends it out its port in VLAN 20. Every crossing goes through a box I can put rules on."' },
            { tone: 'press', say: 'What stops a stall plugging into an office port?', reply: 'Vee Lan: "Tonight, the tape and the fact that the office ports are behind a locked door. Later, port security, which Ace Elle will want to talk to you about. A VLAN keeps traffic apart; it doesn\'t stop someone plugging in."' },
            { tone: 'joke', say: 'Does Mac get a VLAN of his own?', reply: 'Mac, from the doorway: "VLAN 99. For management." Vee Lan: "That\'s a real thing, and you\'re getting it next week, and it won\'t be yours."' }
          ] } },
        { k: 'LORE', title: 'THE HEATING CONTRACTOR', year: 2013, real: ['target'], vibe: 'Cray. A heating contractor\'s login, one flat network, forty million cards gone.',
          text: 'Vee Lan, cutting the tape with her teeth: "In late 2013 somebody broke into a big American retailer, Target, using a login stolen from the company that serviced its heating and air conditioning. From there they reached the tills, and card details for about forty million customers went out the door. The heating contractor\'s login should never have been anywhere near a till. I tell that story to every shop that asks why I want borders."' },
        { k: 'KIT', text: 'Vee Lan writes on the yellow tape with a marker.', kit: [
          { cmd: 'VLAN = one broadcast domain · Layer 2 · no forwarding between VLANs without a router', what: 'a border inside a switch' },
          { cmd: 'default VLANs 1, 1002–1005 · every port starts in VLAN 1', what: 'what a new switch has' },
          { cmd: 'vlan 10 → name OFFICE', what: 'create and name a VLAN' },
          { cmd: 'interface f0/1 → switchport mode access → switchport access vlan 10', what: 'an access port: one VLAN, for hosts' },
          { cmd: 'show vlan brief', what: 'every VLAN, its name and its access ports' } ] },
        { k: 'SYNC', q: { prompt: 'The accountant, watching you work: "If a phone on the stairs sends a broadcast, does my PC still get it?"', opts: ['No. The broadcast stays inside the stalls\' VLAN', 'Yes. Broadcasts go to every port on the switch', 'Only if the router forwards it', 'Only if it is an ARP request'], a: 0,
          yes: 'Vee Lan: "No. It stops at the tape."', no: 'Vee Lan: "No. A VLAN is its own broadcast domain, so a broadcast only reaches ports in the same VLAN."',
          why: 'Vee Lan: Each VLAN is a separate broadcast domain. The switch floods a broadcast only out of ports in the VLAN it arrived on, and routers do not forward broadcasts, so a broadcast from the stalls\' VLAN never reaches the office VLAN.' } }
      ] },

    // ------------------------------------------------------------ night 17 · VLANs, part 2: trunks and router on a stick
    { id: 'n17-one-cable', title: 'Three borders down one cable', sub: 'trunks, 802.1Q and router on a stick', npc: 'veelan', day: [17], src: [PS('VLAN_Part2.md')], unlocks: ['trunk-config'],
      beats: [
        { k: 'SCENE', where: 'The Kabuki market · the stall hall · a service corridor behind the stalls',
          lines: [
            { who: 'narr', text: 'The service corridor behind the stalls is narrow and hot, lit by a single tube, and it smells of cardboard boxes and the grease trap from the dumpling stand. A second switch hangs on the wall here, new, with one cable running from it up through a hole in the ceiling to the office. Vee Lan is standing on a crate with a torch in her mouth, and takes it out when she sees you.' },
            { who: 'veelan', text: 'The market grew. The stalls on this side hang off this switch now, and the office switch is upstairs, and there\'s one cable between them. Office, stalls and cameras all have ports on both switches.' },
            { who: 'veelan', text: 'An access port carries one VLAN, so one cable would mean one VLAN. A [[trunk port]] carries many. Every frame that goes across it gets a tag with its VLAN number, so the switch at the other end knows which room to let it into. Access ports are untagged; trunk ports are the tagged ones.' },
            { who: 'veelan', text: 'The tag is [[802.1Q]], dot1q for short, the standard one. Cisco had its own once, ISL, which you\'ll only meet in old closets. The tag is four bytes, slipped into the frame right after the source MAC address.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What\'s in those four bytes?', reply: 'Vee Lan: "Sixteen bits of TPID, always 0x8100, which says a tag follows. Three bits of PCP, the priority, which is class of service. One bit of DEI, which says the frame can be dropped first if the link is busy. Twelve bits of VID, the VLAN ID."' },
            { tone: 'press', say: 'Twelve bits. So how many VLANs can there be?', reply: 'Vee Lan: "Twelve bits count 0 to 4095, but 0 and 4095 are reserved, so 1 to 4094. The normal range is 1 to 1005 and the extended range is 1006 to 4094. This market will never need more than about ten."' },
            { tone: 'care', say: 'Do you ever stop working?', reply: 'Vee Lan: "When the market closes. Then Mac and I eat dumplings on the stairs and argue about cable." She almost smiles. "Don\'t tell him I said that."' }
          ] } },
        { k: 'SCENE', where: 'The office · the router shelf',
          lines: [
            { who: 'veelan', text: 'One VLAN on every trunk rides without a tag, the [[native VLAN]]. It\'s VLAN 1 unless you change it, and a switch that gets an untagged frame on a trunk puts it in the native VLAN. Both ends must agree which one that is, or frames leak from one room into another.' },
            { who: 'veelan', text: 'I set the native VLAN to one nobody uses, 99, on both ends, and I tell the trunk which VLANs it may carry with switchport trunk allowed vlan. Left alone, a trunk carries every VLAN on the switch, including the ones that have no business upstairs.' },
            { who: 'veelan', text: 'The router had one port per VLAN last night. Mac has since borrowed two of them for the cameras, so now it gets one cable, a trunk, and I cut that one port into [[subinterface]]s, one per VLAN. That\'s [[router on a stick]]. Each subinterface says which VLAN tag it answers with encapsulation dot1q and the number, and gets the gateway address for that VLAN.' },
            { who: 'veelan', text: 'show interfaces trunk shows which ports are trunking, their native VLAN, and which VLANs are allowed and active on each.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Why change the native VLAN at all?', reply: 'Vee Lan: "Because untagged frames on a trunk land in the native VLAN, and anyone who can send untagged frames can try to get into it. Put the native VLAN somewhere empty and there\'s nothing in there to reach."' },
            { tone: 'press', say: 'Isn\'t one cable to the router a bottleneck?', reply: 'Vee Lan: "Every packet between VLANs goes up that cable and back down it, so yes, it\'s the busiest wire in the building. For a market it\'s fine. When it isn\'t fine, the switch does the routing itself, and that\'s tomorrow."' },
            { tone: 'quiet', say: '(Watch her label the cable.)', reply: 'She writes TRUNK 10 20 30 / NATIVE 99 on a cable tie and pulls it tight, then snips the tail off with her teeth.' }
          ] } },
        { k: 'LORE', title: 'FOUR BYTES AFTER THE SOURCE', year: 1998, real: ['ieee'], vibe: 'Phat. Four bytes in the header, and every switch on earth could share its borders.',
          text: 'Vee Lan, climbing down off the crate: "The IEEE approved 802.1Q in December 1998. Before that, if your switches came from two makers, they couldn\'t agree how to mark a VLAN on a shared cable, and every vendor had its own trick. Four bytes after the source address settled it. Old Root still has the ISL switches from the clinic in a box, and he won\'t throw them out."' },
        { k: 'KIT', text: 'Vee Lan writes on a cable tie and hands you the spare.', real: ['ieee'], kit: [
          { cmd: '802.1Q tag: 4 bytes after the source MAC · TPID 0x8100 (16) · PCP (3) · DEI (1) · VID (12)', what: 'VLANs 1–4094 · normal 1–1005 · extended 1006–4094' },
          { cmd: 'switchport trunk encapsulation dot1q → switchport mode trunk', what: 'the first line only on switches that also know ISL' },
          { cmd: 'switchport trunk allowed vlan 10,20,30 · switchport trunk native vlan 99', what: 'limit the trunk; native VLAN on both ends, unused' },
          { cmd: 'interface g0/0.10 → encapsulation dot1q 10 → ip address 10.17.10.1 255.255.255.0', what: 'router on a stick: one subinterface per VLAN, then no shutdown on g0/0' },
          { cmd: 'show interfaces trunk', what: 'trunking ports, native VLAN, allowed and active VLANs' } ] },
        { k: 'SYNC', q: { prompt: 'Mac, reading the cable tie: "A frame arrives on the trunk with no tag at all. Which VLAN does the switch put it in?"', opts: ['The native VLAN', 'VLAN 1, always', 'None. It drops untagged frames on a trunk', 'The VLAN of the port it leaves on'], a: 0,
          yes: 'Vee Lan: "The native VLAN. On this trunk, 99."', no: 'Vee Lan: "The native VLAN, the one VLAN that crosses a trunk without a tag."',
          why: 'Vee Lan: Frames in the native VLAN cross a trunk without a tag, and a switch that receives an untagged frame on a trunk assigns it to the native VLAN. The native VLAN is VLAN 1 by default; here it was changed to 99 on both ends.' } }
      ] },

    // ------------------------------------------------------------ night 18 · VLANs, part 3: multilayer switching
    { id: 'n18-the-busiest-wire', title: 'The busiest wire in the building', sub: 'multilayer switching, SVIs and routed ports', npc: 'veelan', day: [18], src: [PS('VLAN_Part3.md')], unlocks: ['l3-switching'],
      beats: [
        { k: 'SCENE', where: 'The Kabuki market · the office · a Saturday, at the lunch rush',
          lines: [
            { who: 'narr', text: 'Saturday lunch fills the market until the floor shakes, and the office smells of the dumplings everybody is eating at their desks. On the monitor the camera feeds stutter again, and at the counter below Hanna waves a receipt that came out half-printed. Vee Lan has her hand flat on the cable that runs up to the router, as if she could feel the traffic in it.' },
            { who: 'veelan', text: 'Every packet from one VLAN to another goes up this cable to the router and comes straight back down it. On a Saturday that\'s the cameras, the tills, the printers and the office, all squeezing through one gigabit, twice.' },
            { who: 'veelan', text: 'So the switch does the routing itself. A [[multilayer switch]], a Layer 3 switch, can route between VLANs as well as switch inside them. Each VLAN gets a [[SVI]], a switch virtual interface, interface vlan 10 and so on, with the gateway address on it, and the switch routes between them at full speed without anything leaving the box.' },
            { who: 'veelan', text: 'Two things catch everyone. SVIs start shut down, so each one needs no shutdown. And a switch won\'t route between them until you type ip routing in global configuration. Without it, the SVIs are just addresses the switch answers on.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Why does an SVI stay down even after no shutdown sometimes?', reply: 'Vee Lan: "Because its VLAN has to exist on the switch, and at least one port in that VLAN, or a trunk carrying it, has to be up. An SVI for a VLAN with nobody in it stays down. That saves you routing to an empty room."' },
            { tone: 'press', say: 'Then what\'s the router for?', reply: 'Vee Lan: "The way out. The switch routes inside the market, and the router joins the market to everything else: the internet, the other districts. The link between them doesn\'t need to be a trunk any more. It\'s one network with two ends."' },
            { tone: 'care', say: 'Hanna looks close to throwing that printer.', reply: 'Vee Lan glances down at the counter. "She\'s thrown one before. Go and tell her the receipts will be fine by three, and then make it true."' }
          ] } },
        { k: 'SCENE', where: 'The office · the new switch on the rack',
          lines: [
            { who: 'veelan', text: 'A switch port can also stop being a switchport altogether. no switchport on the interface turns it into a [[routed port]], like a router\'s: it leaves every VLAN, it doesn\'t trunk, spanning tree ignores it, and you put an IP address straight on it. The link up to the router is going to be one of those, a /30 with an address at each end.' },
            { who: 'veelan', text: 'That uplink is a trunk right now. The quickest way to wipe a port back to how it left the factory is default interface and its name, in global configuration. Then no switchport, then the address.' },
            { who: 'veelan', text: 'The router\'s subinterfaces have to go, or two boxes will answer for the same gateway addresses. no interface g0/0.10 deletes a subinterface outright.' },
            { who: 'veelan', text: 'One more thing from the router-on-a-stick days, because the Board still asks. If a router subinterface should carry the native VLAN, untagged, you write encapsulation dot1q and the VLAN, then the word native.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What does the switch\'s routing table look like after?', reply: 'Vee Lan: "Like a router\'s. A C route for each SVI\'s network and for the uplink, an L for each of its own addresses, and whatever static routes you give it. A default route pointing at the router covers everything outside the market."' },
            { tone: 'press', say: 'Couldn\'t the switch just do everything and lose the router?', reply: 'Vee Lan: "For routing between our own VLANs, yes. For the internet, the market still needs NAT and a firewall and a provider link, and that\'s router work. Nat would tell you the same thing, at length."' },
            { tone: 'quiet', say: '(Watch the camera feed while she works.)', reply: 'The stairwell feed freezes on a delivery man with a crate of cabbages, then jumps forward. Vee Lan doesn\'t look up from the rack.' }
          ] } },
        { k: 'LORE', title: 'THE BOX THAT DID BOTH', year: 1999, real: ['cisco'], vibe: 'Da bomb. One chassis that switched and routed at full speed, and every campus wanted one.',
          text: 'Vee Lan, sliding the new switch into the rack: "Cisco shipped the Catalyst 6500 in 1999, a big chassis that could switch and route in hardware at the same time. For twenty years you could find one in the middle of half the campuses and hospitals on earth. The clinic had one. Old Root called it the fridge, because of the noise, and kept one of its fans on his desk after it went."' },
        { k: 'KIT', text: 'Vee Lan writes on the rack\'s blanking plate in grease pencil.', real: ['cisco'], kit: [
          { cmd: 'ip routing', what: 'a multilayer switch routes only after this' },
          { cmd: 'interface vlan 10 → ip address 10.18.10.1 255.255.255.0 → no shutdown', what: 'an SVI: starts shut down; up only when its VLAN has a live port' },
          { cmd: 'default interface g0/2 → no switchport → ip address 10.18.0.1 255.255.255.252', what: 'a routed port: no VLANs, no trunk, no spanning tree' },
          { cmd: 'no interface g0/0.10', what: 'delete a subinterface' },
          { cmd: 'encapsulation dot1q 99 native', what: 'a router subinterface for the native VLAN (untagged)' } ] },
        { k: 'SYNC', q: { prompt: 'Mac, from the doorway: "You gave the switch three SVIs with addresses and the PCs still can\'t reach each other. What\'s missing?"', opts: ['ip routing, and no shutdown on each SVI', 'A trunk to the router', 'A default gateway on the switch', 'VTP'], a: 0,
          yes: 'Vee Lan: "Both. SVIs start shut, and the switch won\'t route until it\'s told to."', no: 'Vee Lan: "SVIs start shut down, and a switch won\'t route between them without ip routing."',
          why: 'Vee Lan: An SVI is administratively down until no shutdown is entered on it. Even with the SVIs up, a multilayer switch only routes between them after ip routing is enabled in global configuration. Without it, the SVIs are just management addresses.' } }
      ] },
    // ------------------------------------------------------------ night 19 · DTP and VTP (and Vesper's first test)
    { id: 'n19-the-spare-switch', title: 'The spare switch', sub: 'DTP and VTP', npc: 'veelan', day: [19], src: [PS('VLAN_Part3.md'), PS('DTP_VTP.md')], unlocks: ['dtp-vtp'],
      beats: [
        { k: 'SCENE', where: 'The Kabuki market · the stall hall · Friday, eight in the evening',
          lines: [
            { who: 'narr', text: 'The stall hall at the Friday rush is loud with sizzling pans and shouted orders, and hot enough that the steam from the dumpling baskets hangs under the lights. Every till in the row has gone dark. Traders are taking cash and writing prices on their palms. In the service corridor, on the shelf beside the hall switch, sits a small grey switch that you have never seen before, cabled into the hall switch\'s spare port, its lights blinking green.' },
            { who: 'veelan', text: 'Every VLAN on this floor is gone. Office, stalls, cameras, all of it, on both switches, in the same second. The ports that were in them are inactive, and the only thing left is VLAN 1.' },
            { who: 'veelan', text: 'That\'s [[VTP]], the VLAN trunking protocol. Our switches share one VTP domain, MARKET. The hall switch is the [[VTP server]]: I make a VLAN on it and it tells the others over the trunks. The office switch is a [[VTP client]]: it can\'t make VLANs of its own and copies whatever the server says.' },
            { who: 'veelan', text: 'Every change on a server raises its [[revision number]]. When two switches in the same domain disagree, the one with the higher revision wins, and everyone copies it. That little grey box came from someone\'s lab with the domain name MARKET and a revision of fifty-seven, and an empty VLAN list. Ours was nine.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Is there a mode that doesn\'t copy anyone?', reply: 'Vee Lan: "[[VTP transparent]]. A transparent switch keeps its own VLANs, lets you add and delete them locally, and passes other switches\' adverts along without taking them. Its revision stays at zero. Servers and transparent switches keep their VLANs in NVRAM. A client on version 1 or 2 doesn\'t, and learns them again after a reboot."' },
            { tone: 'press', say: 'How do you make a spare switch safe before you plug it in?', reply: 'Vee Lan: "Knock its revision back to zero. Change its domain to a name nobody uses, or set it to transparent, and the revision resets. Then it can\'t win anything. Whoever plugged this one in either didn\'t know that or knew it very well."' },
            { tone: 'quiet', say: '(Put your hand on the grey switch.)', reply: 'It is warm under your palm, and has been running for a while. The asset tag on its side has been scraped off with something sharp, and the only marking left is a strip of label tape that reads TEST-03.' }
          ] } },
        { k: 'SCENE', where: 'The service corridor · the hall switch',
          lines: [
            { who: 'veelan', text: 'VTP only travels over trunks, and that spare port was never meant to be one. It was left at the default, dynamic auto. The grey box was set to [[DTP]], the dynamic trunking protocol, in dynamic desirable mode, so it asked to trunk, and our port said yes.' },
            { who: 'veelan', text: 'Desirable asks, auto only answers. Desirable and auto make a trunk, desirable and desirable make a trunk, and auto and auto both wait for the other and stay access. A port set to trunk trunks with anything dynamic, and a port set to access never trunks at all.' },
            { who: 'veelan', text: 'So every port that isn\'t a trunk gets switchport mode access. Every trunk gets switchport mode trunk and switchport nonegotiate, which stops it sending DTP at all.' },
            { who: 'narr', text: 'Footsteps in the corridor, unhurried, over the noise from the hall. A woman in a charcoal coat stops at the end of it, silver bob, a thin silver pin on her lapel. You last saw her paying for your noodles at the Seven Bowls.' },
            { who: 'vesper', text: 'Vesper Kade. I look after Halvorsen Consolidated\'s interests in Watson. I heard the market\'s tills were down on a Friday, and I wanted to see for myself how long it takes the street to fix its own network. A managed service would have had them back in minutes.' },
            { who: 'veelan', text: 'Old Root had an apprentice who talked like that, before she left the street.' },
            { who: 'vesper', text: 'Good evening, Vee.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Why would Halvorsen care about a market\'s tills?', reply: 'Vesper: "Because the council votes on the Watson Exchange on Opening Night, and every outage on this street is a reason to vote for a network that doesn\'t have them." She looks at the grey switch without touching it. "Somebody should find out whose that is."' },
            { tone: 'press', say: 'You got here very quickly.', reply: 'Vesper: "I was two stalls down, buying dumplings." She holds up a paper bag as if it answers the question, and nobody in the corridor says anything else.' },
            { tone: 'care', say: 'Vee, do you want me to deal with her?', reply: 'Vee Lan doesn\'t look away from the rack. "Deal with the VLANs. She can watch, if she likes watching." Vesper smiles as though that was the answer she wanted.' }
          ] } },
        { k: 'LORE', title: 'THE COFFEE POT ON THE NETWORK', year: 1991, vibe: 'Excellent! Somebody plugged in a camera, and the whole lab could see the coffee pot.',
          text: 'Vee Lan, after Vesper has gone: "In 1991 at the Cambridge University computer lab, somebody pointed a camera at the coffee pot in the Trojan Room and put the picture on the network, so nobody walked up three flights to an empty pot. It was a joke that ran for ten years. I think about that pot every time I find a box on a shelf that nobody here plugged in."' },
        { k: 'KIT', text: 'Vee Lan writes on the scraped side of the grey switch.', kit: [
          { cmd: 'VTP server: creates VLANs, advertises · client: copies, cannot create · transparent: keeps its own, forwards adverts, revision 0', what: 'default: server, version 1. Version 3 carries VLANs 1006–4094' },
          { cmd: 'higher revision in the same domain wins', what: 'reset a spare to 0: new domain name, or transparent' },
          { cmd: 'show vtp status', what: 'domain, mode, revision, VLAN count' },
          { cmd: 'desirable + auto or desirable = trunk · auto + auto = access · trunk + dynamic = trunk · anything + access = access', what: 'DTP. Newer switches default to dynamic auto' },
          { cmd: 'switchport mode access · switchport mode trunk + switchport nonegotiate', what: 'turn DTP off. DTP frames ride the native VLAN (802.1Q)' } ] },
        { k: 'SYNC', q: { prompt: 'Mac, staring at the grey box: "Our port was dynamic auto. If the spare had been dynamic auto too, what would have happened?"', opts: ['Nothing. Two auto ports stay access, so no trunk and no VTP', 'The same wipe', 'A trunk, because auto always trunks with auto', 'The ports would go err-disabled'], a: 0,
          yes: 'Vee Lan: "Nothing. Two ports waiting for the other to ask."', no: 'Vee Lan: "Auto only answers, it never asks. Two of them stay access, and VTP only crosses trunks."',
          why: 'Vee Lan: Dynamic auto never starts DTP negotiation; it only accepts an offer. Two dynamic auto ports both wait and the link stays an access link. VTP advertisements only travel over trunks, so the spare switch could not have overwritten the VLANs.' } }
      ] },
    // ------------------------------------------------------------ night 23 · EtherChannel
    { id: 'n23-two-cables', title: 'Two cables, one name', sub: 'EtherChannel: LACP, PAgP and static bundles', npc: 'veelan', day: [23], src: [PS('Etherchannel.md')], unlocks: ['etherchannel'],
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
        { k: 'LORE', title: 'MANY CABLES, ONE NAME', year: 2000, real: ['ieee', 'cisco', 'kalpana'], vibe: 'Whassup? Four cables, answering to one name.',
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
        { k: 'LORE', title: 'EVERYONE SAYS HELLO', year: 2005, real: ['ieee', 'cisco'], vibe: 'That\'s hot. Every box on the block handing out business cards to strangers.',
          text: 'Mac, cracking another seed: "Cisco boxes had been introducing themselves with CDP for years, but only to other Cisco boxes. In 2005 the IEEE approved 802.1AB, LLDP, so a phone or a camera from any maker could say hello the same way. The first non-Cisco phone that showed up on this floor with its name and its port, I printed the page and pinned it by the door. It\'s still there, under the grease."' },
        { k: 'KIT', real: ['cisco', 'ieee'], text: 'Mac writes the floor\'s rules on the inside of a sunflower-seed packet.', kit: [
          { cmd: 'show cdp neighbors · show cdp neighbors detail · show cdp entry NAME', what: 'who is on each port. Detail adds the IP address and the software version' },
          { cmd: 'cdp run · no cdp run · interface: cdp enable · no cdp enable', what: 'CDP is Cisco only and on by default. Turn it off where you don\'t trust the far end' },
          { cmd: 'CDP: every 60 s · holdtime 180 s · CDPv2 · 0100.0CCC.CCCC', what: 'cdp timer · cdp holdtime · cdp advertise-v2' },
          { cmd: 'lldp run · interface: lldp transmit · lldp receive', what: 'LLDP, IEEE 802.1AB, any maker. Usually off on Cisco. Both can run at once' },
          { cmd: 'LLDP: every 30 s · holdtime 120 s · reinit 2 s · 0180.C200.000E', what: 'lldp timer · lldp holdtime · lldp reinit' },
          { cmd: 'show cdp · show cdp traffic · show cdp interface · show lldp · show lldp neighbors [detail]', what: 'the timers, the counters, the ports, the neighbours' } ] },
        { k: 'SYNC', q: { prompt: 'Vee Lan\'s camera installer comes down the stairs with a box of cameras: "These only speak the open one, LLDP. Your Cisco switches will see them out of the box, yes?"', opts: ['Yes, LLDP is on by default on every Cisco switch', 'Usually not. LLDP is off by default on Cisco boxes until someone types lldp run', 'No, Cisco switches can only run CDP', 'Yes, but only if CDP is turned off first'], a: 1,
          yes: 'Mac: "Not until somebody tells them to, and tonight that\'s you."', no: 'Mac: "Off by default. lldp run, and they\'ll see each other."',
          why: 'Mac: CDP is Cisco\'s own and is on by default. LLDP is the IEEE standard, 802.1AB, and on Cisco boxes it is usually off until you type lldp run in global config. A box can run both at once, so there is no need to turn CDP off.' } }
      ] }
  ] });
})();
