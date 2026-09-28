/* District 09 · The Watson Exchange — Opening Night, after night 63. The finale's scene; the gig is z-watson-exchange in
   js/data/jobs/09-exchange.js (window.FINALE). Everyone is here. Written to docs/STORY_BIBLE.md (Voice) and docs/CAMPAIGN_MAP.md. */
(function(){
  const { PS } = SRC;
  STAGES.push({ id: 'exchange', arc: 'grid', title: 'STAGE 9 · THE WATSON EXCHANGE', sub: 'Opening Night', npc: 'dispatch', status: 'live', levels: [
    // ------------------------------------------------------------ Opening Night (after night 63)
    { id: 'z-opening-night', title: 'Opening Night', sub: 'the Watson Exchange', npc: 'dispatch', day: [64], src: [PS('LAN_Architectures.md'), PS('OSPF_Part1.md'), PS('First_Hop_Redundancy_Protocols.md')], unlocks: ['lan-arch'],
      beats: [
        { k: 'SCENE', where: 'The Watson Exchange · the switch hall · Opening Night, nine in the evening',
          lines: [
            { who: 'narr', text: 'The Watson Exchange smells of old brass and new cable. The hall was built for telephone operators, and their long wooden switchboards still line one wall under dust sheets. Along the other wall stand the racks, old and new, with patch cables hanging in bundles, waiting for hands. The council has set out rows of folding chairs, and at a card table at the front Clerk Adebayo sits with the dashboard laptop. Every square on it is grey.' },
            { who: 'narr', text: 'Every runner you have trained is here, every one of them still breathing, in borrowed jackets at the patch panels. Imani has come across from the clinic in her scrubs. On the last chair of the last row sits a grey-bearded man with his coat still buttoned.' },
            { who: 'dispatch', text: 'You\'re on. Council votes at midnight on whatever is still green.' },
            { who: 'Clerk Adebayo', text: 'The council\'s terms, for the record. The street\'s own network, built tonight by the street, carrying the clinic\'s new wing when its doors open at midnight. If it holds, Watson keeps the Exchange. If it does not, Halvorsen Consolidated\'s tender stands.' },
            { who: 'narr', text: 'By the old switchboards, apart from everyone, a woman in a long grey coat stands with her hands folded in front of her. Vesper Kade is looking at the plan taped to the rack beside her, not at you.' },
            { who: 'vesper', text: 'Halvorsen\'s tower runs on this same drawing. Two cores, a pair of distribution switches for every block, OSPF between them. I drew theirs. I\'m here to watch, like everyone else.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What\'s left to build?', reply: 'Prof. Hypervisor: "Less than it looks. The crews spent the week on it. The edge router, both cores and the whole B side, where the street\'s servers live, are built and tested. The clinic\'s A side is yours: the new wing\'s switch, the pair of switches above it, the wing\'s security, the way out to the internet, and the wing\'s radio."' },
            { tone: 'press', say: 'Why is she allowed in here?', reply: 'Ace: "She asked the council for a seat, and the council said the hall is public. She keeps her hands where Sticky can see them. If she touches a cable, it\'s the last cable she touches in Watson."' },
            { tone: 'quiet', say: '(Look to the back of the hall.)', reply: 'Old Root lifts two fingers from his knee, the way a man waves from a car he is not stopping. He does not get up. The DO NOT UNPLUG tag is in your pocket, and its edge presses against your hand.' }
          ] } },
        { k: 'SCENE', where: 'The Watson Exchange · the plan on the rack', real: ['cisco'],
          lines: [
            { who: 'narr', text: 'The plan is four sheets taped edge to edge, in Prof. Hypervisor\'s handwriting with Jason\'s typed labels stuck over it. Beacon has written PLATINUM beside the phones in pink marker, and someone has drawn Sticky in the corner.' },
            { who: 'hypervisor', text: 'R1 at the top, with two internet providers, ISPA and ISPB. Two core switches under it, CSW1 and CSW2. Under the cores, two distribution pairs: DSW-A1 and DSW-A2 for the clinic, DSW-B1 and DSW-B2 for the street\'s servers. Every link between them is a routed /30, and OSPF runs over all of them in area 0.' },
            { who: 'hypervisor', text: 'The VLANs are the same on both sides: 10 for PCs, 20 for phones, 30 for servers, 40 for Wi-Fi, 99 for management. Each distribution pair shares a virtual gateway with HSRP, the .1 in every subnet. On the clinic\'s side that\'s 10.1.0.1 for the PCs and 10.0.0.1 for management.' },
            { who: 'veelan', text: 'And under every distribution pair, the access switches, each with one cable to each switch above it. The new wing\'s is ASW-A1. It came out of its box at six o\'clock.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Where does the internet come in?', reply: 'Nat: "Through R1, wearing one mask. Everything inside is a 10 address, so R1 translates every one of them to its own public address on the way out to ISPA, with PAT. If ISPA goes, a floating default route to ISPB waits behind it with a worse administrative distance."' },
            { tone: 'press', say: 'Why two of everything?', reply: 'Prof. Hypervisor: "So nothing in the building has only one path. Two cores, two distribution switches for each block, two uplinks from every access switch. The only thing there is one of is R1, and the council has already asked me about that."' },
            { tone: 'care', say: 'Imani, is the wing ready?', reply: 'Imani: "The ward phones are on their chargers and the first patients are booked for the morning. The doors open at midnight whether we\'re ready or not. I\'m staying until the lights come on."' }
          ] } },
        { k: 'LORE', title: 'EVERYTHING YOU CARRIED IN', year: 1969, vibe: 'Far out, gnarly, da bomb, YOLO: every decade talking at once.',
          text: 'Dispatch, in your ear, flat as ever: "For the record. 1969, a router the size of a fridge arrives at UCLA. 1973, a memo about one shared cable. 1983, the whole net changes language in a night. 1985, a poem about a tree. 1988, a worm eats the internet. 2002, a hospital goes to paper for four days. 1953, a phone exchange where no call waits. 1994, a packet inside a packet. 2012, a messenger named out of a novel. Every one of those is in this hall tonight, running."' },
        { k: 'KIT', text: 'Prof. Hypervisor tears off the plan\'s last sheet and hands it to you.', kit: [
          { cmd: 'VLAN 10 PCs · 20 phones · 30 servers · 40 Wi-Fi · 99 management', what: 'A side: 10.1.0.0/24, 10.2.0.0/24, 10.6.0.0/24 (Wi-Fi), 10.0.0.0/28 (management). Gateways are the HSRP .1' },
          { cmd: 'DSW-A1 .2 · DSW-A2 .3 · VIP .1', what: 'in every A-side subnet' },
          { cmd: 'R1: G0/0/0 203.0.113.2 to ISPA · G0/1/0 203.0.113.6 to ISPB · G0/0 and G0/1 to the cores', what: 'the edge' },
          { cmd: 'router ospf 1 · network 10.0.0.0 0.255.255.255 area 0 · passive-interface default · no passive-interface <uplink>', what: 'OSPF on the distribution switches' },
          { cmd: 'spanning-tree vlan N root primary · standby N priority 110 · standby N preempt', what: 'root and gateway on the same switch: DSW-A1 for 10 and 99, DSW-A2 for 20 and 40' },
          { cmd: 'ip nat inside source list 1 interface g0/0/0 overload', what: 'PAT on R1. Inside towards the cores, outside towards the ISPs' },
          { cmd: 'ip dhcp snooping · ip dhcp snooping vlan 10 · ip dhcp snooping trust', what: 'on the wing switch, trust the uplinks' },
          { cmd: 'write memory', what: 'on every box you touch, before midnight' } ] },
        { k: 'SYNC', q: { prompt: 'Clerk Adebayo, pen over the ledger: "For the minutes. The new wing\'s PCs are in VLAN 10 on the clinic\'s side. What is their default gateway?"', opts: ['10.1.0.1, the HSRP virtual address', '10.1.0.2, DSW-A1', '10.1.0.3, DSW-A2', '10.0.0.33, R1'], a: 0,
          yes: 'Prof. Hypervisor: "The virtual one. Whichever switch is active answers for it."', no: 'Prof. Hypervisor: "10.1.0.1, the virtual address. The PCs never need to know which switch is active."',
          why: 'Prof. Hypervisor: HSRP gives the two distribution switches one shared virtual IP, 10.1.0.1, and the active switch answers for it. The PCs use the virtual address as their gateway, so if the active switch fails the standby takes over and nobody changes a setting. 10.1.0.2 and 10.1.0.3 are the switches\' own addresses.' } }
      ] }
  ] });
})();
