/* District 01 · The Wires — nights 1–4: network devices, interfaces and cables, the OSI model and TCP/IP, the CLI.
   Osi Sevenfold's courier guild and Enable's console. Written to docs/STORY_BIBLE.md (Voice) and docs/CAMPAIGN_MAP.md. */
(function(){
  const { PS } = SRC;
  STAGES.push({ id: 'wires', arc: 'grid', title: 'STAGE 1 · THE WIRES', sub: 'devices, cables, the OSI model, the console', npc: 'osi', status: 'live', levels: [
    // ------------------------------------------------------------ night 1 · network devices
    { id: 'n01-back-room', title: 'The back room', sub: 'network devices', npc: 'osi', day: [1], src: [PS('Network_Devices.md')], unlocks: ['net-devices'],
      beats: [
        { k: 'SCENE', where: 'Kabuki · the courier guild · your first night',
          lines: [
            { who: 'narr', text: 'Dispatch\'s message was an address in Kabuki and a name, Osi Sevenfold. The address is a courier guild. Past the loading bay, a curtain of hanging cable hides a back room that hums and smells of warm plastic. A woman with a purple bob and a clipboard looks up as you come through, writes down the time, and waves you over to a rack of blinking boxes.' },
            { who: 'osi', text: 'You\'re Dispatch\'s new runner, and you\'re on time, which is a good start. Nobody here lets you touch a live network until you know what every box in this room is for, so we\'ll go through them in order.' },
            { who: 'osi', text: 'Everything with a cable in it is a [[node]]. The ones at the edges, where people actually work, are [[end hosts]]. An end host that asks for something is a [[client]], and one that answers is a [[server]].' },
            { who: 'narr', text: 'She taps the laptop on the dispatch desk, then a squat grey box on the bottom shelf with no screen at all.' },
            { who: 'osi', text: 'The dispatch laptop is a client. Every morning it asks that grey box for the parcel list, and the grey box is the server. One machine can do both jobs, too. My own laptop shares the route maps with the drivers and still asks the grey box for the list.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'So what makes something a server?', reply: 'Osi: "What it does. A server provides a service to clients: files, the parcel list, a web page. The grey box is built for it, with big disks and no screen, but a laptop running the right software is a server just the same."' },
            { tone: 'press', say: 'Does it matter what we call them?', reply: 'Osi: "It matters the first time something breaks. When a driver tells me the tablet can\'t reach the server, I know exactly where to start looking. When someone tells me the internet is down, I know nothing."' },
            { tone: 'quiet', say: '(Say nothing, and let her go on.)', reply: 'She ticks something on the clipboard and moves along the rack without waiting to be asked.' }
          ] } },
        { k: 'SCENE', where: 'The back room · the rack', real: ['cisco'],
          lines: [
            { who: 'osi', text: 'This one with twenty-four ports is the [[switch]]. Every desk, the printer and the grey box plug into it, and it passes their traffic to each other inside the building. All of that together is our [[LAN]], the local area network. Ours is a Cisco Catalyst.' },
            { who: 'osi', text: 'The small one above it, with only four ports, is the [[router]]. It joins our LAN to other networks, the depot across town and the internet, so nothing leaves this building without passing through it. It has fewer ports than the switch because it sits between networks, and there are only a few of those. Ours is a Cisco ISR.' },
            { who: 'you', text: 'And the one with the warning sticker?' },
            { who: 'osi', text: 'The [[firewall]]. It sits between the router and the outside and checks every connection against a list of rules, and it drops whatever the rules don\'t allow. Ours is an old Cisco ASA. The newer kind, like Cisco Firepower, is a [[next-generation firewall]], which can look inside the traffic and tell one application from another. Every laptop here also runs a [[host-based firewall]], a program doing the same job for that one machine.' },
            { who: 'osi', text: 'The corp towers downtown run on the same four kinds of box you\'re looking at, only more of them, in cleaner cupboards.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'If the switch dies, what stops working?', reply: 'Osi: "Everything inside the building, because every desk goes through it. The laptops couldn\'t reach the grey box or each other, even though the router would be perfectly fine."' },
            { tone: 'press', say: 'Why not plug everything into the router?', reply: 'Osi: "It has four ports and we have forty devices. A switch gives you lots of ports cheaply and moves traffic fast inside one network, and the router is built to choose paths between networks. We need both."' },
            { tone: 'care', say: 'How long have you been keeping this room running?', reply: 'She glances at the clipboard as if the answer is written there. "Eleven years. I started as a driver. Someone had to learn what the boxes did, and nobody else wanted to."' }
          ] } },
        { k: 'LORE', title: 'THE FIRST ROUTER', year: 1969, real: ['bbn'], vibe: 'Far out. A box the size of a fridge whose only friends were other boxes.',
          text: 'Osi, on the way back to the loading bay: "The first router arrived at UCLA at the end of August 1969. It was called an IMP, an Interface Message Processor, built by a company called BBN on a Honeywell minicomputer the size of a refrigerator. Its only job was passing messages between the big computers on the ARPANET, which is still exactly what the router in there does all day."' },
        { k: 'KIT', text: 'She tears a page off the clipboard: the guild\'s device card.', real: ['cisco'], kit: [
          { cmd: 'client', what: 'asks for a service' }, { cmd: 'server', what: 'provides a service. One device can be both' },
          { cmd: 'switch (Cisco Catalyst)', what: 'many ports. Connects the hosts inside one LAN' },
          { cmd: 'router (Cisco ISR)', what: 'fewer ports. Connects networks, and sends traffic over the internet' },
          { cmd: 'firewall (Cisco ASA, Firepower)', what: 'filters traffic by rules. Next-generation adds deeper inspection. Host-based runs on one PC' } ] },
        { k: 'SYNC', q: { prompt: 'A driver leans in the doorway, tablet in hand: "The parcel list lives on that grey box, and my tablet asks it for my route. Which one\'s the server?"', opts: ['The grey box on the shelf', 'My tablet', 'The switch they both plug into', 'The router'], a: 0,
          yes: 'Osi: "The grey box. It serves the list."', no: 'Osi: "The grey box. It provides the list, and the tablet asks for it."',
          why: 'Osi: A server is whatever provides the service, and here the service is the parcel list, so the grey box is the server. The tablet asks for the list, so it is the client. The switch only carries their traffic, and the router only matters once the request leaves the building.' } }
      ] },

    // ------------------------------------------------------------ night 2 · interfaces and cables
    { id: 'n02-loading-dock', title: 'The loading dock cable', sub: 'interfaces and cables', npc: 'osi', day: [2], src: [PS('Interfaces_and_Cables.md')], unlocks: ['cabling'],
      beats: [
        { k: 'SCENE', where: 'The courier guild · the loading dock · six in the morning',
          lines: [
            { who: 'narr', text: 'The loading dock smells of diesel and wet cardboard. A van has reversed over the cable that runs along the wall, and its plastic jacket is split open. Inside you can see eight thin wires, twisted together in four pairs. Osi crouches beside the damage with a torch in her teeth, and takes it out to talk.' },
            { who: 'osi', text: 'That was the only link between the rack and the dock switch. Every scanner out here went dark at five past six, and the drivers have been loading by hand ever since.' },
            { who: 'osi', text: 'It\'s a [[UTP]] cable, unshielded twisted pair. Each pair is twisted around itself so the noise from the motors and the strip lights cancels out. That noise is [[EMI]], electromagnetic interference. The plug on the end is an [[RJ45]] connector with eight pins, one for each wire.' },
            { who: 'you', text: 'Can we just splice it back together?' },
            { who: 'osi', text: 'Not this one. It ran a hundred and eighty metres, and copper Ethernet is only rated for a hundred. It has been dropping data every afternoon for years, and nobody wrote it down.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'How fast was it meant to run?', reply: 'Osi: "It\'s a gigabit port. Speeds are counted in bits per second, and a byte is eight bits, so a gigabit link moves about a hundred and twenty-five megabytes a second at best. The names go up in tens: plain Ethernet at ten megabits, [[FastEthernet]] at a hundred, [[Gigabit Ethernet]] at a thousand, then ten-gig."' },
            { tone: 'press', say: 'Who decided a hundred metres?', reply: 'Osi: "The IEEE. They write the rules for Ethernet in a standard called 802.3, and every version of it has its own number: 802.3i for ten megabit, 802.3u for a hundred, 802.3ab for a gig. Past a hundred metres the signal on copper gets too weak and too noisy to read."' },
            { tone: 'quiet', say: '(Take the torch and hold it for her.)', reply: 'She lets you take the light without a word and cuts away the damaged end in one clean snip.' }
          ] } },
        { k: 'SCENE', where: 'The loading dock · the spare parts bin', real: ['ieee'],
          lines: [
            { who: 'osi', text: 'Inside the cable, a PC or a router sends on pins 1 and 2 and listens on pins 3 and 6. A switch does the opposite: it sends on 3 and 6 and listens on 1 and 2. So between a PC and a switch you use a [[straight-through cable]], where pin 1 meets pin 1 at the other end.' },
            { who: 'osi', text: 'Between two boxes of the same kind, two switches or two routers, both sides send on the same pins, so the pairs have to cross over inside the cable. That\'s a [[crossover cable]]. Most newer boxes have [[Auto MDI-X]] and swap the pins themselves, but the dock switch is too old for that.' },
            { who: 'osi', text: 'A ten or hundred megabit link uses two of the four pairs. Gigabit and ten-gig use all four. Every link here is [[full-duplex]], so both ends can send and receive at the same time.' },
            { who: 'osi', text: 'For the dock we need glass. [[Fiber]] carries light, so motor noise can\'t touch it, and it runs much further than copper. It plugs into a small module in the switch called an [[SFP]].' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Is there more than one kind of fiber?', reply: 'Osi: "Two. [[Multimode fiber]] has a wide core that lets light in at many angles. It\'s cheaper, and it\'s good for a few hundred metres. [[Single-mode fiber]] has a narrow core, so the light goes straight down the middle. It costs more, and it runs for kilometres. For a hundred and eighty metres, multimode is plenty."' },
            { tone: 'press', say: 'Why not just run fiber everywhere?', reply: 'Osi: "Price. Every fiber link needs a pair of SFPs and the glass itself, and copper to a desk is almost free. We use fiber where copper can\'t reach or where the noise is bad, like out here."' },
            { tone: 'care', say: 'Is the copper safe to leave in the walls?', reply: 'Osi: "Safe enough, but it leaks. UTP gives off a faint signal outside the cable, and someone with the right kit can pick it up. Glass doesn\'t leak. That\'s one more reason the corp towers wire their floors in fiber."' }
          ] } },
        { k: 'LORE', title: 'THE ETHER MEMO', year: 1973, real: ['xerox'], vibe: 'A far-out memo that ended up wiring every office on the planet.',
          text: 'Osi, coiling the old cable: "On the twenty-second of May 1973, an engineer at Xerox PARC called Bob Metcalfe wrote a memo about linking the lab\'s computers with one shared cable. He called it Ethernet, after the ether that old physicists thought carried light. The IEEE made it the 802.3 standard ten years later, in 1983, and that\'s why every building on this street has an RJ45 socket in the wall."' },
        { k: 'KIT', text: 'Osi writes the dock job on the back of a delivery note.', real: ['ieee'], kit: [
          { cmd: 'RJ45 · 8 pins · UTP · 100 m max', what: 'copper Ethernet. The twists cancel EMI' },
          { cmd: '10BASE-T 802.3i · 100BASE-T 802.3u', what: '10 and 100 Mbps. Two pairs' },
          { cmd: '1000BASE-T 802.3ab · 10GBASE-T 802.3an', what: '1 and 10 Gbps. All four pairs' },
          { cmd: 'PC, router, firewall: send 1,2 · receive 3,6', what: 'a switch is the other way round' },
          { cmd: 'straight-through: different kinds · crossover: same kind', what: 'unless both ends have Auto MDI-X' },
          { cmd: 'fiber + SFP: multimode (wide core, cheaper, shorter) · single-mode (narrow core, longer, pricier)', what: 'no EMI, no leaking signal' } ] },
        { k: 'SYNC', q: { prompt: 'A driver watches you pack up: "The new scanners plug straight into the old dock switch. If the switch can\'t sort the pins out itself, which cable do they need?"', opts: ['Straight-through', 'Crossover', 'Single-mode fiber', 'A console cable'], a: 0,
          yes: 'Osi: "Straight-through. A scanner and a switch are different kinds of box."', no: 'Osi: "Straight-through. Different kinds of box, so the pins already line up."',
          why: 'Osi: A scanner sends on pins 1 and 2, like a PC, and the switch listens on 1 and 2, so a straight-through cable lines them up. Crossover is for two boxes of the same kind. Fiber would need SFPs at both ends, and a console cable is for configuring a box, not for data.' } }
      ] },
    { id: 'osi-intro', title: 'Seven floors, four in practice', sub: 'OSI model, TCP/IP, devices, cables', npc: 'osi', day: [3], src: [PS('OSI_Model_TCPSuite.md'), PS('Network_Devices.md'), PS('Interfaces_and_Cables.md')], unlocks: ['osi-layers'],
      beats: [
        { k: 'SCENE', where: 'Courier guild · sorting floor · your first morning',
          lines: [
            { who: 'narr', text: 'Seven conveyor belts, one above the other. Parcels come in at the bottom and rise. A woman with a purple bob and a clipboard watches you watch them.' },
            { who: 'osi', text: 'You are Dispatch\'s new one. Good. Everything that moves through this district passes through seven floors of this building. We call the blueprint the [[OSI model]]. Physical at the bottom, then Data Link, Network, Transport, Session, Presentation, Application.' },
            { who: 'you', text: 'Seven seems like a lot of floors.' },
            { who: 'osi', text: 'It is. The street only uses four. The [[TCP/IP suite]]: Link, Internet, Transport, Application. Same building, fewer stairs. When you argue with a corpo engineer, you say OSI. When you fix something, you touch TCP/IP.' }
          ],
          choice: { opts: [
            { say: 'What is actually on the parcels?', reply: '"Labels. Every floor wraps the parcel from the floor above and adds its own. That is [[encapsulation]]. Going down: the Transport floor makes a segment, Network makes a packet, Data Link makes a frame, Physical turns it into bits on a wire. Four names for the [[PDU]]. Learn them. Half of what the Board will ask you are only asking which one you mean."' },
            { say: 'Which floor do I care about most?', reply: '"Depends on the job. A [[switch]] works on floor two and reads frames. A [[router]] works on floor three and reads packets. A [[firewall]] reads three and up and has opinions. When someone says the network is down, your first question is which floor."' }
          ] } },
        { k: 'LORE', title: 'THE SEVEN-FLOOR PLAN', year: 1984, vibe: 'Bodacious paperwork. The street shipped four floors and moved on.', text: 'Osi, walking you to the loading dock: "ISO published this seven-floor plan in 1984. It lost. TCP/IP was already running on ARPANET, which switched over on 1 January 1983, and it came from a 1974 paper by Cerf and Kahn. We kept OSI as the language and TCP/IP as the building. That is why the Board asks about seven layers and your router only knows four."' },
        { k: 'KIT', text: 'She hands you a laminated card from the clipboard.', kit: [ { cmd: 'L1 bits · L2 frame · L3 packet · L4 segment', what: 'the four parcel names, bottom up' }, { cmd: 'switch = L2 · router = L3 · firewall = L3 and up', what: 'which box works on which floor' }, { cmd: 'UTP up to 100 m · fibre for distance', what: 'cable rule of thumb. [[Auto MDI-X]] means crossover cables are history' } ] },
        { k: 'SYNC', q: { prompt: 'A courier stops you at the door: "The router upstairs, what does it read to decide where I go?"', opts: ['The frame, Layer 2', 'The packet, Layer 3', 'The segment, Layer 4', 'The bits, Layer 1'], a: 1, yes: 'Osi, from across the floor: "Floor three. That is where the maps are."', no: 'Osi: "Routers read packets, floor three. Switches read frames, floor two."' , why: 'Osi: A switch reads the frame, Layer 2, to find the MAC address. A router reads the packet, Layer 3, to find the IP address and choose the next hop. The router decides on floor three.' } }
      ] },
    { id: 'cli-intro', title: 'Three doors', sub: 'the Cisco IOS command line', npc: 'enable', day: [4], src: [PS('Intro_to_CLI.md')], unlocks: ['cli-modes'],
      beats: [
        { k: 'SCENE', where: 'A pop-up router in Kabuki · console port · evening',
          lines: [
            { who: 'narr', text: 'A bald man with a grey beard sits on a stool beside a rack. Three doors are painted on the wall behind him. He does not get up.' },
            { who: 'enable', text: 'First door. [[User EXEC mode]]. The prompt ends in a greater-than sign. You can look. You cannot change anything.' },
            { who: 'you', text: 'How do I get past it?' },
            { who: 'enable', text: 'You say my name. The second door is [[privileged EXEC mode]]. The prompt ends in a hash. You can see everything and you can save. The third door is "configure terminal". [[Global configuration mode]]. The prompt shows (config). That is where the box changes.' }
          ],
          choice: { opts: [
            { say: 'And when I am done changing things?', reply: '"You save. The box keeps two copies of its settings. The [[running-config]] is what it is doing right now, in memory. The [[startup-config]] is what it will do after a reboot. Change the first, save it to the second, or the next power blip takes your work with it."' },
            { say: 'What if someone else gets to door two?', reply: '"Put a password on it. "enable secret" stores it hashed. "enable password" stores it in plain text. I have watched people type the second one for twenty years and I still do not know why."' }
          ] } },
        { k: 'LORE', title: 'TWO CAMPUSES, ONE BRIDGE', year: 1984, real: ['cisco'], vibe: 'Gnarly. A router built to make two networks talk, and it never stopped.', text: 'Enable: "Two people at Stanford, Bosack and Lerner, started Cisco in December 1984 so two campus networks could talk to each other. The logo is the Golden Gate Bridge. The prompts you are about to type into are older than most of the people who type into them."' },
        { k: 'KIT', text: 'He writes on the wall with a marker, under the doors.', kit: [ { cmd: 'enable', what: 'door one to door two' }, { cmd: 'configure terminal', what: 'door two to door three' }, { cmd: 'hostname NAME', what: 'name the box. it shows in the prompt' }, { cmd: 'enable secret PASSWORD', what: 'hashed password for door two' }, { cmd: 'write memory  or  copy running-config startup-config', what: 'save it' }, { cmd: 'show running-config', what: 'what the box is doing right now' } ] },
        { k: 'SYNC', q: { prompt: 'Enable, without looking up: "Which prompt tells you the third door is open?"', opts: ['SW1>', 'SW1#', 'SW1(config)#', 'SW1(config-if)#'], a: 2, yes: 'He nods. "Go on in."', no: '"(config)#. The others are door one, door two, and a side room off door three."' , why: 'Enable: The > prompt is door one, look only. The # prompt is door two, see everything and save. (config)# is door three, change the box. (config-if)# is a side room off door three for one interface.' } }
      ] }
  ] });
})();
