/* Stage 1 · The Wires — devices, cables, the OSI model, the CLI. Framework stub: two intro levels. */
(function(){
  const { PS } = SRC;
  STAGES.push({ id: 'wires', arc: 'grid', title: 'STAGE 1 · THE WIRES', sub: 'devices, cables, the OSI model, the console', npc: 'osi', status: 'stub', levels: [
    { id: 'osi-intro', title: 'Seven floors, four in practice', sub: 'Days 1–3 · OSI model, TCP/IP, devices, cables', npc: 'osi', day: [1,2,3], src: [PS('OSI_Model_TCPSuite.md'), PS('Network_Devices.md'), PS('Interfaces_and_Cables.md')], unlocks: ['osi-layers'],
      beats: [
        { k: 'SCENE', where: 'Courier guild · sorting floor · your first morning',
          lines: [
            { who: 'narr', text: 'Seven conveyor belts, one above the other. Parcels come in at the bottom and rise. A woman with a purple bob and a clipboard watches you watch them.' },
            { who: 'osi', text: 'You are Dispatch\'s new one. Good. Everything that moves through this district passes through seven floors of this building. We call the blueprint the [[OSI model]]. Physical at the bottom, then Data Link, Network, Transport, Session, Presentation, Application.' },
            { who: 'you', text: 'Seven seems like a lot of floors.' },
            { who: 'osi', text: 'It is. The street only uses four. The [[TCP/IP suite]]: Link, Internet, Transport, Application. Same building, fewer stairs. When you argue with a corpo engineer, you say OSI. When you fix something, you touch TCP/IP.' }
          ],
          choice: { opts: [
            { say: 'What is actually on the parcels?', reply: '"Labels. Every floor wraps the parcel from the floor above and adds its own. That is [[encapsulation]]. Going down: the Transport floor makes a segment, Network makes a packet, Data Link makes a frame, Physical turns it into bits on a wire. Four names for the [[PDU]]. Learn them. Half the questions you will be asked are only asking which one you mean."' },
            { say: 'Which floor do I care about most?', reply: '"Depends on the job. A [[switch]] works on floor two and reads frames. A [[router]] works on floor three and reads packets. A [[firewall]] reads three and up and has opinions. When someone says the network is down, your first question is which floor."' }
          ] } },
        { k: 'LORE', text: 'Osi, walking you to the loading dock: "ISO published this seven-floor plan in 1984. It lost. TCP/IP was already running on ARPANET, which switched over on 1 January 1983, and it came from a 1974 paper by Cerf and Kahn. We kept OSI as the language and TCP/IP as the building. That is why the exam asks about seven layers and your router only knows four."' },
        { k: 'KIT', text: 'She hands you a laminated card from the clipboard.', kit: [ { cmd: 'L1 bits · L2 frame · L3 packet · L4 segment', what: 'the four parcel names, bottom up' }, { cmd: 'switch = L2 · router = L3 · firewall = L3 and up', what: 'which box works on which floor' }, { cmd: 'UTP up to 100 m · fibre for distance', what: 'cable rule of thumb. [[Auto MDI-X]] means crossover cables are history' } ] },
        { k: 'SYNC', q: { prompt: 'A courier stops you at the door: "The router upstairs, what does it read to decide where I go?"', opts: ['The frame, Layer 2', 'The packet, Layer 3', 'The segment, Layer 4', 'The bits, Layer 1'], a: 1, yes: 'Osi, from across the floor: "Floor three. That is where the maps are."', no: 'Osi: "Routers read packets, floor three. Switches read frames, floor two."' } }
      ] },
    { id: 'cli-intro', title: 'Three doors', sub: 'Day 4 · the Cisco IOS command line', npc: 'enable', day: [4], src: [PS('Intro_to_CLI.md')], unlocks: ['cli-modes'],
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
        { k: 'LORE', text: 'Enable: "Two people at Stanford, Bosack and Lerner, started Cisco in December 1984 so two campus networks could talk to each other. The logo is the Golden Gate Bridge. The prompts you are about to type into are older than most of the people who type into them."' },
        { k: 'KIT', text: 'He writes on the wall with a marker, under the doors.', kit: [ { cmd: 'enable', what: 'door one to door two' }, { cmd: 'configure terminal', what: 'door two to door three' }, { cmd: 'hostname NAME', what: 'name the box. it shows in the prompt' }, { cmd: 'enable secret PASSWORD', what: 'hashed password for door two' }, { cmd: 'write memory  or  copy running-config startup-config', what: 'save it' }, { cmd: 'show running-config', what: 'what the box is doing right now' } ] },
        { k: 'SYNC', q: { prompt: 'Enable, without looking up: "Which prompt tells you the third door is open?"', opts: ['SW1>', 'SW1#', 'SW1(config)#', 'SW1(config-if)#'], a: 2, yes: 'He nods. "Go on in."', no: '"(config)#. The others are door one, door two, and a side room off door three."' } }
      ] }
  ] });
})();
