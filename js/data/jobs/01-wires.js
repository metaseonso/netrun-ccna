/* jobs/01-wires.js — District 01 · The Wires (nights 1–4): devices, cables, the OSI model, the CLI. */
(function(){
  JOBS.push(
    // ------------------------------------------------------------------ night 1 · from Lab 01 (Packet Tracer introduction)
    { id: 'd-n01-back-room-map', cls: 'D', rep: 10, from: 'osi', title: 'A Map of the Back Room', day: [1], requires: ['n01-back-room'], devices: ['PC1', 'PC2'],
      brief: 'DISPATCH » Osi needs a map of the guild\'s back room before a new driver starts tomorrow. Mark every box, then check the laptops can reach the parcel server.\n\nCLIENT (Osi Sevenfold) » "The last map was drawn before I started here, and half the boxes on it are gone. Mark what is actually on the rack."',
      net: {
        devices: {
          ISP: { kind: 'cloud', ip: '203.0.113.1', mask: '255.255.255.252', internet: true },
          FW1: { kind: 'router' }, R1: { kind: 'router' }, SW1: { kind: 'switch', mac: '0011.2201.0001' },
          PC1: { kind: 'host', ip: '192.168.1.10', mask: '255.255.255.0', gw: '192.168.1.1' },
          PC2: { kind: 'host', ip: '192.168.1.11', mask: '255.255.255.0', gw: '192.168.1.1' },
          SRV1: { kind: 'server', ip: '192.168.1.100', mask: '255.255.255.0', gw: '192.168.1.1' }
        },
        links: [ { a: 'ISP', b: 'FW1', bp: 'gigabitethernet0/1' }, { a: 'FW1', ap: 'gigabitethernet0/0', b: 'R1', bp: 'gigabitethernet0/1' },
          { a: 'R1', ap: 'gigabitethernet0/0', b: 'SW1', bp: 'gigabitethernet0/1' },
          { a: 'SW1', ap: 'fastethernet0/1', b: 'PC1' }, { a: 'SW1', ap: 'fastethernet0/2', b: 'PC2' }, { a: 'SW1', ap: 'fastethernet0/24', b: 'SRV1' } ],
        preconfig: { R1: ['interface gigabitethernet0/0', 'ip address 192.168.1.1 255.255.255.0', 'no shutdown'] }
      },
      map: { w: 520, h: 380, nodes: [
          { id: 'ISP', label: 'the depot and the internet', type: 'cloud', x: 260, y: 32 },
          { id: 'FW1', label: 'A', type: 'firewall', x: 260, y: 100 }, { id: 'R1', label: 'B', type: 'router', x: 260, y: 170 },
          { id: 'SW1', label: 'C', type: 'switch', x: 260, y: 240 },
          { id: 'PC1', label: 'dispatch laptop', type: 'pc', x: 90, y: 320 }, { id: 'PC2', label: 'driver tablet', type: 'pc', x: 260, y: 320 }, { id: 'SRV1', label: 'D', type: 'server', x: 430, y: 316 } ],
        links: [ { a: 'ISP', b: 'FW1' }, { a: 'FW1', b: 'R1' }, { a: 'R1', b: 'SW1' }, { a: 'SW1', b: 'PC1' }, { a: 'SW1', b: 'PC2' }, { a: 'SW1', b: 'SRV1' } ] },
      steps: [
        { type: 'find', skill: 'net-devices', target: 'SW1', text: 'Osi, pen ready: "Start with the box every desk plugs into. Click it on the map."', hint: 'The long flat box with arrows both ways. Every laptop hangs off it.', ok: 'Osi: "The switch. C."',
          why: 'Osi: The switch is the box every desk, the printer and the server plug into. On a map it is drawn as a long flat box with arrows pointing both ways, because it passes traffic back and forth inside one LAN.' },
        { type: 'find', skill: 'net-devices', target: 'R1', text: 'Osi: "Now the one that joins us to the depot and the internet."', hint: 'The round one, between the switch and the outside.', ok: 'Osi: "The router. B."',
          why: 'Osi: The router joins our network to other networks, so it sits between the switch and the outside. On a map it is a circle with arrows, because it sends traffic out in different directions.' },
        { type: 'find', skill: 'net-devices', target: 'FW1', text: 'Osi: "And the one that checks every connection against the rules before it gets in."', hint: 'The brick wall, right on the edge.', ok: 'Osi: "The firewall. A."',
          why: 'Osi: The firewall sits on the edge, between the router and the outside, and checks every connection against its rules. On a map it is drawn as a brick wall.' },
        { type: 'find', skill: 'net-devices', target: 'SRV1', text: 'Osi: "Last box. The one that holds the parcel list."', hint: 'The tall one at the end of a switch port.', ok: 'Osi: "The grey box. D. That\'s every box on the rack."',
          why: 'Osi: The server holds the parcel list and hands it to anyone who asks. On a map it is drawn as a tall box, like a tower PC with no screen.' },
        { type: 'multi', skill: 'net-devices', text: 'Osi: "The new driver will ask which of these are end hosts. Mark all of them."', opts: ['The dispatch laptop', 'The driver tablet', 'The parcel server', 'The switch', 'The router', 'The firewall'], answers: [0, 1, 2],
          hint: 'End hosts are where people work or where services live. The rest carry traffic between them.', ok: 'Osi: "Those three. Everything else only carries their traffic."',
          why: 'Osi: End hosts sit at the edges of the network: the laptop and the tablet are clients, and the parcel server is a server. The switch, the router and the firewall are network devices that carry and check traffic between the end hosts.' },
        { type: 'cmd', skill: 'net-devices', text: 'Osi: "Now prove the room works. Open the dispatch laptop\'s console and ping the parcel server at 192.168.1.100."',
          need: [ { dev: 'PC1', line: /^ping 192\.168\.1\.100$/ } ], check: (d, ctx) => ctx.net().ping('PC1', '192.168.1.100').ok,
          hint: 'PC1 console:\nC:\\> ping 192.168.1.100', ok: 'Osi: "Four replies. The laptop, the switch and the server are all doing their jobs."',
          why: 'Osi: ping sends a small test message to an address and waits for an answer. From the dispatch laptop, type ping 192.168.1.100. Four replies mean the laptop, the switch between them and the server all work. Timeouts mean one of them does not.' },
        { type: 'choice', skill: 'net-devices', text: 'Osi, tapping the rack: "One morning nothing in the building can reach anything else in the building, but the router\'s lights are all green. Which box do you check first?"', opts: ['The switch', 'The router', 'The firewall', 'The parcel server'], a: 0,
          hint: 'Which box does every desk go through to reach every other desk?', ok: 'Osi: "The switch. Write that on the map too."',
          why: 'Osi: Inside the building, every device reaches every other device through the switch. If nothing inside can talk to anything else, the switch is the first suspect. The router and the firewall only matter when traffic leaves the building, and one dead server would not stop the laptops reaching each other.' }
      ],
      solution: [ { select: 'SW1' }, 'commit', { select: 'R1' }, 'commit', { select: 'FW1' }, 'commit', { select: 'SRV1' }, 'commit', { multi: [0, 1, 2] }, 'commit', { dev: 'PC1', type: ['ping 192.168.1.100'] }, 'commit', { choose: 0 }, 'commit' ],
      outro: 'Osi pins the new map above the rack, next to a faded photo of her first van. When the new driver comes in tomorrow, every box on the rack will have a name.' },

    // ------------------------------------------------------------------ D · First Jack-In
    { id: 'd-first-jack', cls: 'D', rep: 30, from: 'enable', title: 'First Jack-In', requires: ['cli-intro'], devices: ['R1'],
      brief: 'DISPATCH » Enable has a pop-up router in Kabuki with nothing on it yet. Name it, put a password on the second door, save. That is the whole gig. Do not overthink it.\n\nCLIENT (a noodle bar owner) » "The man said it needs a name and a password. I do not know what that means. Please do not break the card reader."',
      map: { w: 520, h: 200, nodes: [ { id: 'R1', label: 'R1', type: 'router', x: 260, y: 90 }, { id: 'PC', label: 'your deck', type: 'pc', x: 90, y: 90 } ], links: [ { a: 'PC', b: 'R1' } ] },
      shows: { R1: { 'show version': 'Cisco IOS Software, C2900 Software (C2900-UNIVERSALK9-M), Version 15.1(4)M4\nR1 uptime is 3 minutes\nSystem image file is "flash0:c2900-universalk9-mz.SPA.151-4.M4.bin"' } },
      day: [4], team: null,
      solution: [ { dev: 'R1', type: ['enable', 'configure terminal'] }, 'commit', { dev: 'R1', type: ['hostname NC-R1'] }, 'commit', { dev: 'R1', type: ['enable secret cyber'] }, 'commit', { choose: 1 }, 'commit', { dev: 'R1', type: ['end', 'copy run start'] }, 'commit' ],
      steps: [
        { type: 'cmd', skill: 'cli-modes', text: 'Enable, from his stool: "Door one, door two, door three. Get to global configuration on R1. I want to see (config)# in the prompt."', need: [ { dev: 'R1', mode: 'priv', line: 'configure terminal' } ], hint: 'R1> enable\nR1# configure terminal', ok: '"Third door. In."',
          why: 'Enable: Three doors. When you arrive the prompt ends in > and you can only look. Type enable to open door two. The prompt changes to #. Type configure terminal to open door three. The prompt changes to (config)#. Only behind door three can you change the box. Short forms work: en, then conf t.' },
        { type: 'cmd', skill: 'cli-modes', text: '"The owner wants it called NC-R1. The prompt will change when you get it right."', need: [ { dev: 'R1', mode: 'config', line: 'hostname nc-r1' } ], hint: 'R1(config)# hostname NC-R1', ok: '"It knows its name."',
          why: 'Enable: The box has a name and it shows at the start of every prompt. Behind door three, type hostname NC-R1. Look at the prompt. If it now says NC-R1(config)#, it worked. If it still says R1, you are behind the wrong door or the name is misspelled.' },
        { type: 'cmd', skill: 'cli-modes', text: '"Lock door two. The hashed kind. Any password you like, I will not read it."', need: [ { dev: 'R1', mode: 'config', line: /^enable secret \S+/ } ], hint: 'NC-R1(config)# enable secret <password>', ok: '"Hashed. The other command stores it in plain text. I have never understood who chooses that."',
          why: 'Enable: This is the password for door two. Type enable secret followed by any word. The word secret matters. It scrambles the password before saving it, so anyone reading the config sees nonsense. The other command, enable password, saves it as plain readable text. Never that one.' },
        { type: 'choice', skill: 'cli-modes', text: 'The owner, from behind the counter: "So it is done? If the power goes, it stays?"', opts: ['Yes, it is in the startup-config now', 'No. It is in the running-config, in memory. A reboot loses it until it is saved', 'Yes, it is in flash with the software', 'It is only in the terminal history'], a: 1, hint: 'Memory is now. NVRAM is after a reboot.', ok: 'Enable: "Correct. So do something about it."',
          why: 'Enable: The box keeps two copies of its settings. The running-config is what it is doing right now, and it lives in memory. Memory forgets when the power goes. The startup-config is the saved copy the box reads when it turns on. Nothing you typed has been saved yet. So the honest answer to the owner is: not yet.' },
        { type: 'cmd', skill: 'cli-modes', text: '"Save it."', need: [ { dev: 'R1', line: /^(do )?write memory$/ } ], hint: 'NC-R1# write memory   (or copy running-config startup-config)', ok: '"[OK]. Door closes behind you."',
          why: 'Enable: Saving copies memory into the startup file. Two ways to say it: write memory, or copy running-config startup-config. Short forms: wr, or copy run start. The box answers [OK]. If you are still behind door three, type end first, or say do write memory. After that, a power cut cannot take your work.' }
      ], outro: 'The owner brings you a bowl of noodles you did not order. Enable nods once, which is as much as anyone gets. Dispatch: "Rep credited. Old Root is asking for someone at the clinic."' },

    // ------------------------------------------------------------------ night 2 · from Lab 02 (connecting devices)
    { id: 'd-n02-dock-link', cls: 'D', rep: 10, from: 'osi', title: 'The Loading Dock Link', day: [2], requires: ['n02-loading-dock'], devices: ['PC1'],
      brief: 'DISPATCH » The guild\'s link to the loading dock is dead and the drivers are scanning parcels by hand. Osi has the parts. Plan the new cabling with her and get the dock back online.\n\nCLIENT (Osi Sevenfold) » "I need the right cable on every link this time. Last time someone guessed, and it cost us six years of dropped scans."',
      net: {
        devices: { R1: { kind: 'router' }, SW1: { kind: 'switch', mac: '0011.2202.0001' }, SW2: { kind: 'switch', mac: '0011.2202.0002' },
          PC1: { kind: 'host', ip: '192.168.1.10', mask: '255.255.255.0', gw: '192.168.1.1' }, SCAN1: { kind: 'host', ip: '192.168.1.60', mask: '255.255.255.0', gw: '192.168.1.1' } },
        links: [ { a: 'R1', ap: 'gigabitethernet0/0', b: 'SW1', bp: 'gigabitethernet0/1' }, { a: 'SW1', ap: 'gigabitethernet0/2', b: 'SW2', bp: 'gigabitethernet0/1' },
          { a: 'SW1', ap: 'fastethernet0/1', b: 'PC1' }, { a: 'SW2', ap: 'fastethernet0/1', b: 'SCAN1' } ],
        preconfig: { R1: ['interface gigabitethernet0/0', 'ip address 192.168.1.1 255.255.255.0', 'no shutdown'], SW2: ['interface gigabitethernet0/1', 'shutdown'] }
      },
      map: { w: 520, h: 330, nodes: [
          { id: 'R1', label: 'guild router', type: 'router', x: 120, y: 70 }, { id: 'SW1', label: 'rack switch', type: 'switch', x: 120, y: 170 },
          { id: 'PC1', label: 'dispatch laptop', type: 'pc', x: 120, y: 270 }, { id: 'SW2', label: 'dock switch', type: 'switch', x: 400, y: 170 }, { id: 'SCAN1', label: 'dock scanner', type: 'pc', x: 400, y: 270 } ],
        links: [ { a: 'R1', b: 'SW1' }, { a: 'SW1', b: 'PC1' }, { a: 'SW1', b: 'SW2', ap: 'gigabitethernet0/2', bp: 'gigabitethernet0/1', tag: '180 m' }, { a: 'SW2', b: 'SCAN1' } ] },
      steps: [
        { type: 'find', skill: 'cabling', target: 'SW2', text: 'Osi, pointing at the map on her tablet: "One link on here is dead. Click the box at the dock end of it."', hint: 'Look for the dashed line. The dock end is on the right.', ok: 'Osi: "The dock switch. Everything out here hangs off it."',
          why: 'Osi: A dashed line on the map means the link is down. The dead link runs from the rack switch to the dock switch, a hundred and eighty metres away, and the dock switch is the box at the far end.' },
        { type: 'choice', skill: 'cabling', text: 'Osi: "The dock is a hundred and eighty metres from the rack. What\'s the cheapest thing that will actually reach?"', opts: ['A new UTP cable, the same as before', 'Multimode fiber with an SFP at each end', 'Single-mode fiber with an SFP at each end', 'Two UTP cables joined in the middle'], a: 1,
          hint: 'Copper stops at 100 metres. Of the two kinds of glass, one is cheaper.', ok: 'Osi: "Multimode. It reaches, and it costs half as much."',
          onPass: (ctx) => { if (ctx.devices.SW2) ctx.devices.SW2.preload(['interface gigabitethernet0/1', 'no shutdown']); },
          why: 'Osi: UTP is only rated for 100 metres, and joining two cables in the middle does not change that. Both kinds of fiber reach 180 metres, but multimode is cheaper and is good for a few hundred metres, so it is the right choice. Single-mode is for kilometres.' },
        { type: 'cmd', skill: 'cabling', text: 'Osi, as the fiber\'s link light turns green: "It\'s in. Prove it from the dispatch laptop: ping the dock scanner at 192.168.1.60."',
          need: [ { dev: 'PC1', line: /^ping 192\.168\.1\.60$/ } ], check: (d, ctx) => ctx.net().ping('PC1', '192.168.1.60').ok,
          hint: 'PC1 console:\nC:\\> ping 192.168.1.60', ok: 'Osi: "Four replies from the dock. The scanners are back."',
          why: 'Osi: The laptop is in the rack room and the scanner is on the dock, so a reply means every piece in between works: the laptop, the rack switch, the new fiber and both SFPs, and the dock switch.' },
        { type: 'form', skill: 'cabling', text: 'Osi: "The dock switch is old and has no Auto MDI-X. Tell me which copper cable goes on each of these new links."',
          fields: [ { key: 'pcsw', label: 'Scanner to dock switch', options: ['straight-through', 'crossover'], answer: 'straight-through' },
            { key: 'swsw', label: 'Dock switch to a spare switch', options: ['straight-through', 'crossover'], answer: 'crossover' },
            { key: 'rtsw', label: 'Router to dock switch', options: ['straight-through', 'crossover'], answer: 'straight-through' },
            { key: 'rtrt', label: 'Router to router', options: ['straight-through', 'crossover'], answer: 'crossover' } ],
          hint: 'Different kinds of box: straight-through. Same kind: crossover.', ok: 'Osi: "All four right. I\'m labelling the bin."',
          why: 'Osi: PCs, scanners and routers send on pins 1 and 2, and switches send on pins 3 and 6. When two different kinds meet, the pins already line up, so a straight-through cable works. When two of the same kind meet, both send on the same pins, so the pairs have to cross over. A router to a switch is different kinds, so straight-through. Two routers are the same kind, so crossover.' },
        { type: 'calc', skill: 'cabling', text: 'A driver, watching: "The new link\'s a gig, right? How much is that, exactly?"',
          fields: [ { key: 'bits', label: 'bits per second in 1 gigabit', check: v => String(v).replace(/[,\s_]/g, '') === '1000000000' },
            { key: 'bytes', label: 'megabytes per second, at most', check: v => Number(String(v).replace(/[,\s]/g, '')) === 125 } ],
          answer: '1000000000 bits · 125 MB/s', hint: 'Giga is a billion. There are 8 bits in a byte.', ok: 'Osi: "A hundred and twenty-five. Tell the drivers that\'s why the scans upload instantly now."',
          why: 'Osi: Giga means a billion, so a gigabit is 1,000,000,000 bits. Network speeds are counted in bits, and a byte is 8 bits, so a gigabit per second is at most 1,000,000,000 divided by 8, which is 125,000,000 bytes, or 125 megabytes, per second.' },
        { type: 'order', skill: 'cabling', text: 'Osi: "The spare bin has four kinds of copper module in it. Sort them slowest to fastest so nobody grabs the wrong one."',
          items: ['1000BASE-T (802.3ab)', '10BASE-T (802.3i)', '10GBASE-T (802.3an)', '100BASE-T (802.3u)'],
          accept: arr => arr.join('|') === ['10BASE-T (802.3i)', '100BASE-T (802.3u)', '1000BASE-T (802.3ab)', '10GBASE-T (802.3an)'].join('|'),
          hint: 'The number before BASE is the speed in megabits.', ok: 'Osi: "Ten, a hundred, a thousand, ten thousand. Bin sorted."',
          why: 'Osi: The number at the start of the name is the speed in megabits per second: 10BASE-T is 10 Mbps, 100BASE-T is 100 Mbps, 1000BASE-T is 1 Gbps, and 10GBASE-T is 10 Gbps. Each has its own IEEE 802.3 name: i, u, ab and an.' },
        { type: 'choice', skill: 'cabling', text: 'Osi, closing the bin: "Last one. Why did the old copper link drop scans every afternoon but never in the morning?"', opts: ['The vans run their motors on the dock in the afternoon, and that noise hit a cable already past its length', 'Copper gets slower as it warms up', 'The switch turns its ports off after lunch', 'Fiber interference from the next building'], a: 0,
          hint: 'What makes electrical noise on a loading dock?', ok: 'Osi: "The vans. The fiber won\'t care about them."',
          why: 'Osi: Motors make electromagnetic interference. UTP twists its pairs to cancel noise, but a cable run past its 100 metre limit already has a weak signal, so the extra noise from the vans in the afternoon was enough to corrupt it. Fiber carries light, so EMI does not affect it.' }
      ],
      solution: [ { select: 'SW2' }, 'commit', { choose: 1 }, 'commit', { dev: 'PC1', type: ['ping 192.168.1.60'] }, 'commit', { form: { pcsw: 'straight-through', swsw: 'crossover', rtsw: 'straight-through', rtrt: 'crossover' } }, 'commit', { calc: { bits: '1000000000', bytes: '125' } }, 'commit',
        { order: [1, 3, 0, 2] }, 'commit', { choose: 0 }, 'commit' ],
      outro: 'At ten past eight the dock scanners chirp back to life, one after another down the line. The drivers stop loading by hand, and Osi writes the new cable on her map in green ink.' }
  );
})();
