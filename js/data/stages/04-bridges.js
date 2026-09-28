/* District 04 · The Bridges — nights 20–22: spanning tree, its guards, the rapid tree. Old Root's last week at the
   Watson clinic annex. Written to docs/STORY_BIBLE.md (Voice) and docs/CAMPAIGN_MAP.md. */
(function(){
  const { PS } = SRC;
  STAGES.push({ id: 'bridges', arc: 'grid', title: 'STAGE 4 · THE BRIDGES', sub: 'spanning tree at the clinic annex', npc: 'root', status: 'live', levels: [
    // ------------------------------------------------------------ night 20 · spanning tree, part 1
    { id: 'n20-tagged-cable', title: 'The cable that never carried a frame', sub: 'loops, the root bridge, port roles and cost', npc: 'root', day: [20], src: [PS('Spanning_Tree_Protocol_Part1.md')], unlocks: ['stp-election', 'stp-loops'],
      beats: [
        { k: 'SCENE', where: 'The Watson clinic annex · the switch closet · Monday, 22:40',
          lines: [
            { who: 'narr', text: 'The closet door sticks, then gives. Warm air rolls out over you, thick with dust and the burnt-sugar smell of a fan bearing on its way out, and under the fan\'s whine three switches tick on a rack no taller than your chest. An old man in a grey cardigan sits on an upturned crate beside them, winding a patch cable round his fist. The cardboard box at his feet holds a mug, a torch and a stack of work orders gone soft at the corners.' },
            { who: 'root', text: 'Dispatch says you\'re Class C now. Before I tell you anything, look at the rack and tell me what you see.' },
            { who: 'narr', text: 'Cables run between all three switches, and between the top two there are two cables instead of one. The second is thin and grey, and a paper tag hangs off it in shaky capitals: DO NOT UNPLUG. Every port light on the rack flickers green except the one at the far end of that cable, which glows a steady amber.' },
            { who: 'you', text: 'Two cables between the same two switches, and one of them isn\'t doing anything.' },
            { who: 'root', text: 'It hasn\'t carried a frame in six years. Every tech who comes through here wants to pull it. I finish on Friday, so by Friday you\'ll know why nobody can.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What happens when two switches have two cables between them?', reply: 'Old Root: "A broadcast goes out one cable and comes back on the other, and each switch floods every copy it gets out of every other port. Nothing in a frame counts down the way a packet\'s TTL does, so the copies never die. They pile up until the links are full and the switches spend every cycle on them. That\'s a [[broadcast storm]]."' },
            { tone: 'press', say: 'Then why run a second cable at all?', reply: 'Old Root: "Because one cable is one fault from nothing. A cut, a dead port, a cleaner with a mop bucket. The building needs the second path, so something has to keep it quiet until the first one goes."' },
            { tone: 'quiet', say: '(Wait for him to go on.)', reply: 'He finishes the coil and drops it in the box. "Twenty years ago this closet had two switches with two cables between them and nothing keeping them quiet. There were two of us on shift. The building went to paper for nine hours."' }
          ] } },
        { k: 'SCENE', where: 'The switch closet · 23:05',
          lines: [
            { who: 'narr', text: 'Footsteps squeak on the lino outside, and a nurse in blue scrubs leans in the doorway with a paper cup of something that smells of cardamom. Her badge says IMANI. She looks at the tag, then at you.' },
            { who: 'Imani', text: 'He\'s telling you about the charts. I was the one carrying them, up three floors all night, because every screen on the ward froze on the login page.' },
            { who: 'root', text: 'Every switch saw the same addresses arriving on two ports and kept moving them back and forth in its [[MAC address table]], thousands of times a second, which is what we call flapping. The tables never settled long enough to deliver one real frame.' },
            { who: 'root', text: 'Since that night every switch here runs [[spanning tree]], and they all do out of the box. They send each other hello messages called [[BPDU]]s, elect one switch as the [[root bridge]], and put every extra path to sleep. These old boxes run the classic version, IEEE 802.1D, and Cisco keeps a separate tree for every VLAN, which they call [[PVST]].' },
            { who: 'narr', text: 'He tips the laptop on top of the box towards you. A shell is already open on SW1, the top switch.' },
            { who: 'root', text: 'Type show spanning-tree and read me the Root ID, then the Bridge ID under it.' },
            { who: 'you', text: 'Root ID, priority 32769. Bridge ID, priority 32769 as well, but a different address.' },
            { who: 'root', text: 'So SW1 isn\'t in charge. The lowest [[bridge ID]] wins, and the bridge ID is the priority first, then the MAC address if the priorities tie. Nobody here ever set a priority, so all three sit at the default, 32768 plus the VLAN number, and the oldest MAC in the closet won. That\'s the pharmacy\'s hand-me-down on the bottom shelf, the slowest box in the room.' },
            { who: 'root', text: 'The corp towers downtown hold this same election on every floor, on switches that cost more than this building, and the lowest ID wins there too.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'How does each switch find its way to the root?', reply: 'Old Root: "Every port has a cost from its speed: ten megabit is 100, FastEthernet 19, gigabit 4, ten-gig 2. A switch adds up the costs along each path to the root, and the port on the cheapest one is its [[root port]]. If two paths cost the same, it takes the one through the neighbour with the lower bridge ID, and if that ties too, the neighbour\'s lower port ID."' },
            { tone: 'press', say: 'Why is the tagged cable the one asleep?', reply: 'Old Root: "Every segment gets one [[designated port]], the end with the cheaper way to the root, and it forwards. On the root bridge every port is designated. Whatever port is left over is a [[non-designated port]] and it blocks. SW1\'s end of the tag cable is designated, but SW2 already has a cheaper way to the root, so SW2\'s end blocks, and a cable with one end blocking carries nothing."' },
            { tone: 'care', say: 'Why are you leaving?', reply: 'He looks at the tag for a while before he answers. "Twenty years is long enough to keep one closet. Somebody younger should know it better than I do, and there\'s a week left to make that true."' }
          ] } },
        { k: 'LORE', title: 'ALGORHYME', year: 1985, real: ['dec', 'ieee'], vibe: 'Totally radical: a poem that kept the office network from eating itself.',
          text: 'Old Root, turning the tag over in his fingers: "Radia Perlman worked the tree out at Digital Equipment Corporation in 1985. She wrote the algorithm, then a poem about it called Algorhyme, and it starts: I think that I shall never see a graph more lovely than a tree. The IEEE made her tree the 802.1D standard in 1990. I kept a copy of that poem taped inside this door for twenty years."' },
        { k: 'KIT', text: 'He tears a work order off the pad and writes on the back in pencil.', real: ['ieee'], kit: [
          { cmd: 'bridge ID = priority (4 bits) + VLAN (12 bits) + MAC (48 bits)', what: 'lowest wins root. Default 32768 + VLAN, so VLAN 1 shows 32769. Priority moves in steps of 4096' },
          { cmd: 'cost: 10 Mb 100 · 100 Mb 19 · 1 Gb 4 · 10 Gb 2', what: 'added up along the path to the root' },
          { cmd: 'root port: lowest root cost → lowest neighbour bridge ID → lowest neighbour port ID', what: 'one on every switch except the root' },
          { cmd: 'designated port: one per segment, forwarding. Every port on the root is designated', what: 'the end with the cheaper way to the root, tie to the lower bridge ID' },
          { cmd: 'non-designated port: whatever is left', what: 'blocking. That is the sleeping cable' },
          { cmd: 'show spanning-tree', what: 'Root ID, Bridge ID, and the role and state of every port' } ] },
        { k: 'SYNC', q: { prompt: 'Imani, on her way out with the empty cup: "So the old box from the pharmacy runs the tree because it\'s the most important one in there?"', opts: ['No. It has the lowest bridge ID, and with every priority the same, the lowest MAC address decided it', 'Yes. The root is always the most important switch', 'No. The root is the switch with the most ports', 'No. The root is whichever switch was turned on first'], a: 0,
          yes: 'Old Root: "Lowest ID. Importance never came into it."', no: 'Old Root: "The lowest bridge ID. Every priority here is the default, so the oldest MAC won."',
          why: 'Old Root: The root bridge is the switch with the lowest bridge ID, which is the priority first and then the MAC address. Every switch in the annex has the default priority, 32768 plus the VLAN, so they tie and the lowest MAC address wins. Old switches tend to have low MACs, which is how the pharmacy\'s hand-me-down ended up in charge.' } }
      ] },
    // ------------------------------------------------------------ night 21 · spanning tree, part 2, and its guards
    { id: 'n21-reception-desk', title: 'Thirty seconds at reception', sub: 'port states, timers, PortFast and the guards', npc: 'root', day: [21], src: [PS('Spanning_Tree_Protocol_Part2.md')], unlocks: ['stp-toolkit', 'stp-states', 'stp-bpdu', 'stp-config'],
      beats: [
        { k: 'SCENE', where: 'The clinic annex · reception · Wednesday, 08:05',
          lines: [
            { who: 'narr', text: 'Reception smells of floor polish and burnt coffee, and behind the counter a printer is chewing slowly through a queue. Three people wait on the plastic chairs with numbered tickets. Imani stands at her workstation with a folder under one arm, watching a circle spin on a screen that has not found the network yet.' },
            { who: 'Imani', text: 'Every morning. I switch it on and it sits there for half a minute. He says it\'s the switch being careful.' },
            { who: 'root', text: 'It is. Get your phone out. You\'re the stopwatch.' },
            { who: 'narr', text: 'He reaches under the counter, pulls the workstation\'s cable out of the wall socket and pushes it back in. The little light beside the socket comes on amber.' },
            { who: 'root', text: 'Start it. A port that comes up doesn\'t forward straight away. The first fifteen seconds it\'s listening: it sends and receives BPDUs, carries no traffic, learns no addresses.' },
            { who: 'narr', text: 'Fifteen seconds. The light is still amber.' },
            { who: 'root', text: 'Now it\'s learning. Still no traffic, but it writes the MAC addresses it sees into the table, so it\'s ready the moment it opens.' },
            { who: 'narr', text: 'At thirty seconds the light turns green and Imani\'s screen blinks to the login page.' },
            { who: 'root', text: 'Forwarding. Fifteen and fifteen, and both come from one timer, the [[forward delay]]. Listening and learning are only the way up. A port settles in forwarding, or in blocking if it lost the election, and a blocking port does nothing but receive BPDUs.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What are the other timers?', reply: 'Old Root: "The root sends a BPDU every two seconds, which is the [[hello]]. A switch that hears nothing on its root port for twenty seconds, ten hellos, gives up on that path, and that\'s [[max age]]. Every switch runs on the timers the root bridge sends, whatever it has set itself."' },
            { tone: 'press', say: 'So when a cable dies, the backup is up in thirty seconds?', reply: 'Old Root: "Worse. If the switch can\'t see the cable die, it waits out max age first, twenty seconds, then the blocked port climbs through listening and learning, fifteen and fifteen, fifty seconds in all. The other way round is instant: a forwarding port can drop straight to blocking, but a blocking port has to climb."' },
            { tone: 'care', say: 'Half a minute with a patient waiting must feel long.', reply: 'Imani: "On a quiet morning it\'s half a minute. On the morning of a bus crash it\'s thirty people at this counter." Old Root: "You\'ll have it back by lunch."' }
          ] } },
        { k: 'SCENE', where: 'The switch closet · Wednesday, 09:20',
          lines: [
            { who: 'narr', text: 'The closet is cooler this morning. Someone has swapped the dying fan for a new one that hums instead of whining, and a phone on speaker leans against the rack, crackling with a market\'s worth of background noise.' },
            { who: 'mac', text: 'Root, it\'s Mac, from the floor. Your annex uplink has been sending me frames I don\'t know since six this morning, one every two seconds, all to 01:00:0C:CC:CC:CD.' },
            { who: 'root', text: 'Every two seconds is a hello, and that address is Cisco\'s per-VLAN tree, PVST+. The standard tree sends to 01:80:C2:00:00:00. Something new is talking spanning tree.' },
            { who: 'root', text: 'SW1\'s shell is open. Show spanning-tree, and read me the root.' },
            { who: 'you', text: 'Priority 4097, and an address that isn\'t on the rack. SW1\'s root port is Fa0/7.' },
            { who: 'root', text: 'Fa0/7 is the reception desk.' },
            { who: 'narr', text: 'Under the reception desk, behind the bin, you find a five-port switch the size of a paperback, warm to the touch, its one cable running into wall socket 7. The sticker on the bottom is from a hire company that closed years ago.' },
            { who: 'Imani', text: 'That wasn\'t there on Monday. Nobody on this desk has ever seen it.' },
            { who: 'root', text: 'It set its priority to 4096 and told every switch in the annex it had the best ID, and they believed it. Two things stop that in any building you touch. [[PortFast]] on the ports that face desks, so a workstation goes straight to forwarding, and never on a port to another switch. Then [[BPDU guard]] on the same ports: a BPDU arrives, the port shuts itself down, [[err-disabled]].' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Are there other guards?', reply: 'Old Root: "Root Guard, on a port that must never lead to the root: a superior BPDU arrives and the port goes broken, root inconsistent, until those BPDUs stop. Loop Guard, for a cable that has gone one-way: the port stops hearing BPDUs, max age runs out, and it goes broken, loop inconsistent, instead of forwarding. BPDU Filter stops a port sending BPDUs at all, and I\'ve never trusted it."' },
            { tone: 'press', say: 'Why not just unplug the box?', reply: 'Old Root: "Because the next one will be under a different desk. Guard the ports and it doesn\'t matter where it turns up. Then choose the root on purpose: spanning-tree vlan 1 root primary on SW1 sets 24576, or 4096 under whatever root is there now, and root secondary sets 28672 on the spare."' },
            { tone: 'quiet', say: '(Turn the little switch over in your hands.)', reply: 'The fan inside it is new, and the label on its config port is typed, not handwritten. Old Root holds out his hand for it, turns it over once, and puts it in his cardigan pocket without a word.' }
          ] } },
        { k: 'LORE', title: 'FOUR DAYS ON PAPER', year: 2002, vibe: 'Talk about a total meltdown: doctors with clipboards, runners in the halls.',
          text: 'Old Root, taping a new work order to the door: "On the thirteenth of November 2002 the network at Beth Israel Deaconess Medical Center in Boston started to fail, and it stayed broken for the best part of four days. It had grown too big and too flat for spanning tree to keep up, and the switches drowned in their own traffic. The hospital went back to paper orders and people running lab results by hand. Their CIO, John Halamka, wrote it all up so other hospitals could learn from it. I printed it that year, and it\'s been in my box ever since."' },
        { k: 'KIT', text: 'He writes the morning on a work order and hands it to you.', kit: [
          { cmd: 'blocking → listening 15 s → learning 15 s → forwarding', what: 'listening: BPDUs only. Learning: BPDUs and MAC addresses. Forwarding: everything. Blocking: receives BPDUs, nothing else' },
          { cmd: 'hello 2 s · forward delay 15 s · max age 20 s', what: 'the root bridge\'s timers rule every switch. A dead root port to a new one forwarding: up to 50 s' },
          { cmd: 'BPDU to 0100.0ccc.cccd = PVST+ · 0180.c200.0000 = standard STP', what: 'BPDUs go out designated ports' },
          { cmd: 'spanning-tree portfast · spanning-tree portfast default', what: 'one port, or every access port. Never towards a switch' },
          { cmd: 'spanning-tree bpduguard enable · spanning-tree portfast bpduguard default', what: 'a BPDU arrives → err-disabled. Back with shutdown, no shutdown, or errdisable recovery cause bpduguard (every 300 s)' },
          { cmd: 'spanning-tree guard root · spanning-tree guard loop · spanning-tree bpdufilter enable', what: 'Root Guard: superior BPDU → broken. Loop Guard: BPDUs stop → broken. Filter: sends none' },
          { cmd: 'spanning-tree vlan 1 root primary | root secondary | priority 4096', what: '24576, or 4096 under the current root · 28672 · steps of 4096' },
          { cmd: 'spanning-tree vlan 1 cost 4 · spanning-tree vlan 1 port-priority 64', what: 'on a port: change what it adds to the root cost, or break a tie' } ] },
        { k: 'SYNC', q: { prompt: 'Imani, as her workstation comes up green before she has pulled her chair in: "If they\'d put that fast setting on the cables between the switches too, what would have happened?"', opts: ['Those ports could forward before the tree had checked them, and make a loop', 'Nothing. It is safe on any port', 'The ports would refuse to come up', 'The whole building would get faster'], a: 0,
          yes: 'Old Root: "A loop before the tree could stop it. Desks only."', no: 'Old Root: "It skips the checks. Towards a switch that means a loop before the tree can react. Desks only."',
          why: 'Old Root: PortFast skips listening and learning and goes straight to forwarding. A workstation cannot make a loop, so that is safe on a desk port. A port that faces another switch could start forwarding before spanning tree had judged it, and two switches with two paths between them make a loop.' } }
      ] },
    // ------------------------------------------------------------ night 22 · rapid spanning tree
    { id: 'n22-last-shift', title: 'The last shift', sub: 'rapid spanning tree: states, roles, edge ports and link types', npc: 'root', day: [22], src: [PS('Rapid_Spanning_Tree_Protocol.md')], unlocks: ['rstp'],
      beats: [
        { k: 'SCENE', where: 'The switch closet · Friday, 16:30',
          lines: [
            { who: 'narr', text: 'The closet smells of new cardboard and packing tape. Old Root\'s box is full and taped shut on the floor, and a second one has appeared beside it, half full of manuals. The rack hums the same as ever. He is sitting on his crate with the laptop on his knees and the shell open on SW2.' },
            { who: 'root', text: 'One job left. These three still run the classic tree, so when a cable dies the wards wait fifty seconds. I want the annex on the rapid tree before I go.' },
            { who: 'you', text: 'What\'s different about it?' },
            { who: 'root', text: 'Same election, same root, same costs. The IEEE wrote it as 802.1w, and Cisco\'s per-VLAN version is Rapid PVST+. [[RSTP]] doesn\'t wait on timers to learn that a path has died. Every switch sends its own BPDUs every two seconds instead of only passing the root\'s along, and a neighbour that misses three of them is gone. Then the switches agree with each other in a quick handshake, and the backup path opens in about a second.' },
            { who: 'root', text: 'The states shrink to three. Discarding covers what blocking, listening and disabled used to, then learning, then forwarding. The ports that face desks become [[edge port]]s, which is what PortFast means on the rapid tree.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Do the port roles change too?', reply: 'Old Root: "Root and designated stay. The leftover ports split in two. An [[alternate port]] is discarding because it hears a better BPDU from another switch, and it stands in for the root port. A [[backup port]] is discarding because it hears a better BPDU from another port on the same switch, which only happens on a hub, and it stands in for a designated port."' },
            { tone: 'press', say: 'Will the old boxes argue with it?', reply: 'Old Root: "No. The rapid tree gets along with the classic one: a port that hears a classic BPDU speaks classic on that port. The BPDU says which it is, protocol version 2 for rapid, 0 for classic."' },
            { tone: 'joke', say: 'So the cables get job titles too?', reply: 'Old Root: "Every link gets a type. A full-duplex link between two switches is point-to-point, and the handshake works on it. A half-duplex port, like the one to the old hub in the pharmacy, is shared, and it falls back to the slow way. The desk ports are edge. The switch works it out from the duplex, and you can set it with spanning-tree link-type."' }
          ] } },
        { k: 'SCENE', where: 'The switch closet · Friday, 18:10',
          lines: [
            { who: 'narr', text: 'Rain on wool reaches you first, then a clean, cold scent like the lobby of a tower. A woman in a charcoal coat stands in the closet doorway with her hands in her pockets, silver hair cut straight at the jaw. She looks at the rack for a long time before she looks at either of you.' },
            { who: 'root', text: 'Vesper.' },
            { who: 'vesper', text: 'Twenty years, and it\'s the same rack. You kept the tag.' },
            { who: 'root', text: 'Vesper Kade. She kept this closet with me, a long time ago.' },
            { who: 'vesper', text: 'I speak for Halvorsen Consolidated in Watson these days. I came to see him off, and to meet the runner Dispatch keeps sending into buildings like this one. I\'ve heard your handle more than once this month.' },
            { who: 'vesper', text: 'The night of the loop, this clinic was on paper for nine hours, and one patient\'s records never came back. The street patched it and called it fixed. Halvorsen wants to buy the Watson Exchange so the district never again depends on whoever happens to be on shift.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What would Halvorsen do with the Exchange?', reply: 'Vesper: "Run one network for the whole district, closed and watched, and bill it per head. Nobody in a Halvorsen tower has ever carried a chart up a stairwell."' },
            { tone: 'press', say: 'Did you come to buy the closet too?', reply: 'Vesper: "I came to watch him leave it in good hands. Whether they are good hands is the one thing I haven\'t decided yet."' },
            { tone: 'care', say: 'You worked with him. Why did you leave?', reply: 'She looks at the tag and not at you. "After that night I couldn\'t trust a network that was only as good as the tired people holding it together, and he always could." Old Root turns back to the rack and doesn\'t answer.' }
          ] } },
        { k: 'LORE', title: 'THE HANDSHAKE', year: 2001, real: ['ieee', 'cisco'], vibe: 'Sweet: the tree finally stopped waiting fifty seconds for permission.',
          text: 'Old Root, after she has gone to wait by the reception doors: "The IEEE published 802.1w, the rapid tree, in 2001. It took what Cisco had been selling as extras, UplinkFast, BackboneFast and PortFast, and built them into the standard, and a dead link started coming back in about a second. In 2004 the rapid tree was folded into 802.1D itself. I read the draft on a night shift at this desk, and I remember thinking that fifty seconds had finally gone."' },
        { k: 'KIT', text: 'His last work order, in pencil, with the corner torn where the tape was.', real: ['ieee'], kit: [
          { cmd: 'spanning-tree mode rapid-pvst', what: 'Rapid PVST+: 802.1w, one tree per VLAN. 802.1s is MST' },
          { cmd: 'states: discarding · learning · forwarding', what: 'discarding replaces blocking, listening and disabled' },
          { cmd: 'roles: root · designated · alternate · backup', what: 'alternate: better BPDU from another switch, stands in for the root port. Backup: better BPDU from the same switch, stands in for a designated port' },
          { cmd: 'every switch sends BPDUs every 2 s · 3 missed = neighbour gone', what: 'version 2 is rapid, 0 is classic. Works alongside the classic tree' },
          { cmd: 'link types: edge (spanning-tree portfast) · point-to-point (full duplex) · shared (half duplex)', what: 'spanning-tree link-type point-to-point | shared' },
          { cmd: 'RSTP costs: 10 Mb 2,000,000 · 100 Mb 200,000 · 1 Gb 20,000 · 10 Gb 2,000 · 100 Gb 200 · 1 Tb 20 · 10 Tb 2', what: 'Cisco switches keep the short costs (19, 4) until spanning-tree pathcost method long' } ] },
        { k: 'SYNC', q: { prompt: 'Vesper, from the doorway, as if asking the room: "On the rapid tree, a port that\'s discarding because it hears a better BPDU from another switch. What do you call it?"', opts: ['An alternate port', 'A backup port', 'A designated port', 'An edge port'], a: 0,
          yes: 'Vesper: "Alternate. He taught you properly."', no: 'Old Root: "Alternate. Backup is the one that hears itself, from the same switch."',
          why: 'Old Root: On the rapid tree a discarding port that receives a superior BPDU from another switch is an alternate port, and it takes over if the root port fails. A discarding port that receives a superior BPDU from another port on the same switch is a backup port, and it stands in for a designated port. Edge ports face end hosts.' } }
      ] }
  ] });
})();
