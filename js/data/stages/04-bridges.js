/* District 04 · The Bridges — nights 20–22: spanning tree, its guards, the rapid tree. Old Root's last week at the
   Watson clinic annex. Written to docs/STORY_BIBLE.md (Voice) and docs/CAMPAIGN_MAP.md. */
(function(){
  const { PS, SJ } = SRC;
  const D21 = [PS('Spanning_Tree_Protocol_Part2.md'), SJ('09 - Day 21 - STP Part 2.md')];
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
    // ------------------------------------------------------------ 3
    { id: 'stp-states', title: 'Thirty seconds with a stopwatch', sub: 'port states and timers', npc: 'root', day: [21], src: D21, unlocks: ['stp-states'],
      beats: [
        { k: 'SCENE', where: 'Clinic annex · reception · Wednesday, 08:05',
          lines: [
            { who: 'Imani', text: 'Every morning I turn the workstation on and I wait. Half a minute, sometimes more, before it will even see the network. Is that the switch?' },
            { who: 'root', text: 'It is the switch being careful. Come to the closet. Bring your phone, we need a stopwatch.' },
            { who: 'narr', text: 'In the closet he unplugs Imani\'s cable from SW2 and plugs it back in. The port light comes on amber.' },
            { who: 'root', text: 'Start the clock. Amber means the port is not forwarding yet. A port has two settled states. Blocking, for a port that lost the election. Forwarding, for a root port or a designated port. Between them are two states it passes through on the way up.' },
            { who: 'narr', text: 'Fifteen seconds. The light is still amber.' },
            { who: 'root', text: 'That was Listening. The port only handles BPDUs. No traffic, and it does not learn addresses. Now Learning. Still no traffic, but it starts writing MAC addresses into the table so it is ready.' },
            { who: 'narr', text: 'Thirty seconds. The light turns green.' },
            { who: 'root', text: 'Forwarding. Fifteen and fifteen, set by one timer, the [[forward delay]]. The fifth word you will see on the Board is Disabled: a port somebody shut down. It is not in the tree at all.' }
          ] },
        { k: 'SCENE', where: 'Same closet',
          lines: [
            { who: 'you', text: 'Thirty seconds for a workstation seems long.' },
            { who: 'root', text: 'It is long for a workstation. It is exactly right for a switch. If a port that faces another switch started forwarding at once, it could forward into a loop before the tree had time to see it. So every port waits. There is a way to skip the wait for host ports, and I will show you on Friday, but not before you know what the wait is for.' },
            { who: 'Imani', text: 'So I just wait?' },
            { who: 'root', text: 'Until Friday. Then no.' }
          ],
          choice: { opts: [
            { say: 'What are the other timers?', reply: '"Three, and the root bridge sets all of them for the whole network. [[Hello]]: the root sends a BPDU every 2 seconds. [[Max age]]: a switch waits 20 seconds without hearing a BPDU before it decides something changed. Forward delay: the 15 seconds you just timed, twice."' },
            { say: 'What happens when a link dies?', reply: '"The switch on the far side stops hearing BPDUs on its root port. It waits max age, 20 seconds. Then it re-runs the election, and a blocked port that must wake up goes through Listening and Learning. 20 plus 15 plus 15. Fifty seconds from a dead link to a working one. Going the other way, from forwarding to blocking, is instant. Closing a door is always safe."' }
          ] } },
        { k: 'SCENE', where: 'Same closet',
          lines: [
            { who: 'root', text: 'One more thing people get wrong. A switch only sends BPDUs out of its designated ports. Root ports and blocked ports listen. So when a switch goes quiet on your root port for 20 seconds, that is how you learn your path to the root is gone.' },
            { who: 'narr', text: 'Imani goes back to reception. Old Root writes on the work order.' }
          ] },
        { k: 'LORE', title: 'FIFTY SECONDS OF NOTHING', year: 2001, vibe: 'Whack. Half a minute is a lifetime when the phones are down.', text: 'Old Root: "That fifty seconds is why the original standard got a bad name. In 2001 the IEEE published 802.1w, Rapid Spanning Tree. Same idea, new handshake, a link comes back in under a second. It renamed the roles too: alternate and backup instead of non-designated. Every modern Cisco switch runs the rapid version per VLAN by default. The old states and timers are still asked by the Board because half the buildings in Watson still run the old tree."' },
        { k: 'KIT', text: 'On the work order:', kit: [ { cmd: 'Blocking → Listening (15 s) → Learning (15 s) → Forwarding', what: 'the way up. never skipped without PortFast' }, { cmd: 'hello 2 s · forward delay 15 s · max age 20 s', what: 'defaults. the root bridge sets them for everyone' }, { cmd: 'dead link to forwarding: up to 50 s', what: 'max age + listening + learning' }, { cmd: 'forwarding → blocking: immediate', what: 'closing is always safe' }, { cmd: 'BPDUs go out designated ports only', what: 'root and blocked ports receive' } ] },
        { k: 'SYNC', q: { prompt: 'Imani texts you later: "The tech said the port was in a state where it learns addresses but still does not pass my traffic. Which one was that?"', opts: ['Blocking', 'Listening', 'Learning', 'Forwarding'], a: 2, yes: 'Old Root, reading over your shoulder: "Learning. It fills the table so that the moment it forwards, it forwards well."', no: 'Old Root: "Learning. Listening does neither. Forwarding does both. Blocking does nothing but listen for hellos."' , why: 'Old Root: Four states. Blocking only listens for hellos. Listening handles hellos, no traffic, no learning. Learning still sends no traffic, but it starts writing MAC addresses into the table. Forwarding does everything. The one that learns but does not forward is Learning.' } }
      ] },

    // ------------------------------------------------------------ 4
    { id: 'stp-bpdu', title: 'Something in reception is talking', sub: 'the BPDU, PVST+ and 802.1D', npc: 'root', day: [21], src: D21, unlocks: ['stp-bpdu'],
      beats: [
        { k: 'SCENE', where: 'Clinic annex · switch closet · Thursday, 11:30',
          lines: [
            { who: 'mac', text: 'Root. I have frames coming in on SW2 port 7 every two seconds. Same size, same destination, and it is not a broadcast address. I do not know that address.' },
            { who: 'root', text: 'Read it to me.' },
            { who: 'mac', text: 'Zero one, zero zero, zero C, CC, CC, CD.' },
            { who: 'narr', text: 'Old Root puts his coffee down.' },
            { who: 'root', text: 'Port 7 is reception. Reception has a desk, a printer and a workstation. None of those send that. That address is a switch talking.' },
            { who: 'you', text: 'How do you know from the address?' },
            { who: 'root', text: 'Because a [[BPDU]] is always sent to one of two addresses. The standard one, 802.1D, goes to 01:80:C2:00:00:00. The Cisco one, PVST+, one tree per VLAN, goes to 01:00:0C:CC:CC:CD. Mac just read you the second one. Every two seconds is the hello timer. Something in reception is a Cisco switch and it is saying hello.' }
          ] },
        { k: 'SCENE', where: 'Same closet · he opens the capture on the laptop',
          lines: [
            { who: 'root', text: 'Look at what is inside one. Root Identifier: who the sender thinks the root is. Root Path Cost: how far the sender is from that root. Bridge Identifier: the sender\'s own ID. Port Identifier: the port it left by. Then the timers: message age, max age, hello, forward delay.' },
            { who: 'narr', text: 'The Root Identifier field shows a priority of 1.' },
            { who: 'root', text: 'Priority zero, plus one for the VLAN. Lower than anything in this building. Whatever that box is, it has just won the election. Every switch in the annex now believes reception is the centre of the world.' },
            { who: 'mac', text: 'That explains the table. The gateway keeps moving ports.' }
          ],
          choice: { opts: [
            { say: 'Is that an attack?', reply: '"It could be. It is also what happens when someone brings a small managed switch from home and plugs it in for a second monitor. Either way, the fix is the same, and you will do it tomorrow. Today, learn to read the hello. A claim in a BPDU is only a claim. The tree believes every one of them unless you tell it not to."' },
            { say: 'Why does the Cisco version have its own address?', reply: '"Because the standard tree was one tree for the whole switch. Cisco wanted one tree per VLAN, so Vee Lan\'s streets could each have their own root and their own sleeping cable. The old version, PVST, only worked on ISL trunks. PVST+ works on 802.1Q trunks, which is what everyone runs. The rapid version is Rapid PVST+. Same address."' }
          ] } },
        { k: 'LORE', title: 'ONE KEYSTROKE, WHOLE BUILDING', year: 2005, vibe: 'Pwned, they called it. The word was new. The trick was not.', text: 'Vee Lan, from the doorway: "A pentester showed me a tool called Yersinia once, 2005 vintage. One keystroke and your laptop sends a BPDU with priority zero. Whole building re-elects around a laptop. He did it to make a point. The point was that every hello is a claim and the tree believes claims." Old Root: "Which is why the toolkit exists. Tomorrow."' },
        { k: 'KIT', text: 'On the work order:', kit: [ { cmd: '01:80:C2:00:00:00', what: 'IEEE 802.1D / RSTP BPDU destination' }, { cmd: '01:00:0C:CC:CC:CD', what: 'Cisco PVST+ BPDU destination' }, { cmd: 'BPDU fields: root ID · root path cost · bridge ID · port ID · timers', what: 'what is in a hello' }, { cmd: 'PVST = ISL trunks only · PVST+ = 802.1Q · Rapid PVST+ = RSTP per VLAN', what: 'the Cisco versions' } ] },
        { k: 'SYNC', q: { prompt: 'Mac, later: "New capture. Frames to 01:80:C2:00:00:00, two seconds apart. Same thing?"', opts: ['Same thing, PVST+ hellos', 'Standard IEEE STP or RSTP hellos, not the Cisco per-VLAN kind', 'CDP advertisements', 'ARP replies'], a: 1, yes: 'Old Root: "Standard tree. Not a Cisco box, or a Cisco box running the standard mode. Still a switch. Still a claim."', no: 'Old Root: "01:80:C2 is the IEEE address. Cisco per-VLAN uses 01:00:0C. Learn both. The Board will show you one and ask which."' , why: 'Old Root: Two hello addresses to remember. 01:80:C2:00:00:00 is the standard IEEE one. 01:00:0C:CC:CC:CD is the Cisco per-VLAN one, PVST+. Frames to the IEEE address every 2 seconds are standard STP or RSTP hellos. Still a switch. Still a claim.' } }
      ] },

    // ------------------------------------------------------------ 5
    { id: 'stp-toolkit', title: 'The box under the desk', sub: 'PortFast, BPDU Guard, Root Guard, Loop Guard', npc: 'root', day: [21], src: D21, unlocks: ['stp-toolkit'],
      beats: [
        { k: 'SCENE', where: 'Clinic annex · reception · Friday, 08:20',
          lines: [
            { who: 'narr', text: 'Under the reception desk, behind a bin, a small five-port switch with a sticker from a games shop. A temp named Deshawn is standing very still.' },
            { who: 'Deshawn', text: 'I needed a second port for my laptop. It was just for the week.' },
            { who: 'veelan', text: 'It has been the root bridge of a medical building since Tuesday.' },
            { who: 'root', text: 'Vee. He did not know. Nobody told the port to refuse it. That is on us.' },
            { who: 'narr', text: 'He turns to you.' },
            { who: 'root', text: 'Two tools. Learn them today and this cannot happen again in any building you touch.' }
          ] },
        { k: 'SCENE', where: 'Switch closet · SW2 console',
          lines: [
            { who: 'root', text: 'First. Imani\'s workstation waits thirty seconds every morning because the port treats it like a switch. It is not a switch. It cannot make a loop. So we tell the port to skip Listening and Learning and go straight to forwarding. That is [[PortFast]].' },
            { who: 'you', text: 'On every port?' },
            { who: 'root', text: 'On every port that faces a host. Never on a port that faces another switch. Put PortFast on an uplink and you have built the loop I spent twenty years preventing. On one port: interface, then "spanning-tree portfast". For every access port on the switch at once: "spanning-tree portfast default" in global config. That command skips trunk ports on its own.' },
            { who: 'narr', text: 'He types it on SW2 and Imani\'s port goes green in under a second.' }
          ] },
        { k: 'SCENE', where: 'Same console',
          lines: [
            { who: 'root', text: 'Second. A PortFast port faces a host, so it should never hear a BPDU. Make that a rule. [[BPDU Guard]]. If a BPDU arrives on the port, the port shuts itself off. The state is called [[err-disabled]]. Deshawn\'s box would have been talking to a dead port before it finished saying hello.' },
            { who: 'veelan', text: 'And I would have found it in the logs instead of in a re-election.' },
            { who: 'root', text: 'On one port: "spanning-tree bpduguard enable". For every PortFast port at once: "spanning-tree portfast bpduguard default". To bring a port back after you pull the box: "shutdown", then "no shutdown".' }
          ],
          choice: { opts: [
            { say: 'Are there more tools like this?', reply: '"Two you should know by name. Root Guard: a port that will never accept a superior BPDU, so nothing downstream can take the root from you. Loop Guard: a port that stops hearing BPDUs is not allowed to start forwarding, in case the cable went one-way. The Board wants PortFast and BPDU Guard cold. Know the other two exist."' },
            { say: 'What happens to Deshawn?', reply: 'Vee Lan: "He gets the talk." Old Root: "He gets a second monitor cable from the closet and the talk. Then we put the guard on every host port in the building so the next temp never gets the chance."' }
          ] } },
        { k: 'LORE', title: 'FOUR DAYS ON PAPER', year: 2002, vibe: 'Totally offline. Doctors with clipboards. Nobody laughing.', text: 'Old Root: "Err-disabled is a Cisco word. The port shows as down until someone does shutdown and no shutdown, or errdisable recovery brings it back on a timer. After that Boston hospital outage in 2002, the fix was partly this discipline. Decide which ports are edges. Guard them. Stop trusting every hello."' },
        { k: 'KIT', text: 'On the work order, underlined twice:', kit: [ { cmd: 'interface f0/1 → spanning-tree portfast', what: 'one host port goes straight to forwarding' }, { cmd: 'spanning-tree portfast default', what: 'global: every access port, never trunks' }, { cmd: 'interface f0/1 → spanning-tree bpduguard enable', what: 'one port: BPDU arrives → err-disabled' }, { cmd: 'spanning-tree portfast bpduguard default', what: 'global: every PortFast port gets the guard' }, { cmd: 'shutdown → no shutdown', what: 'recover an err-disabled port after the box is gone' }, { cmd: 'spanning-tree guard root · spanning-tree guard loop', what: 'Root Guard, Loop Guard. know the names' } ] },
        { k: 'SYNC', q: { prompt: 'Deshawn, quietly: "If the tech had put PortFast on the uplink between SW1 and SW2, what would have gone wrong?"', opts: ['Nothing, PortFast is safe anywhere', 'The uplink could start forwarding before the tree blocked it, and make a loop', 'The port would refuse to trunk', 'Convergence would be slower'], a: 1, yes: 'Old Root: "A port forwarding before the tree has judged it is a loop waiting to happen. Host ports only."', no: 'Old Root: "PortFast skips the safety states. On a switch-facing port that means forwarding into a loop before the tree can react."' , why: 'Old Root: PortFast skips the two safety waits. On a desk port that is fine, because a desk cannot make a loop. On a port to another switch, the port would forward before the tree had checked it, and two switches with two paths make a loop. A loop with no block is a broadcast storm.' } }
      ] },

    // ------------------------------------------------------------ 6
    { id: 'stp-config', title: 'Choosing on purpose', sub: 'mode, root primary and secondary, priority, cost, port-priority', npc: 'root', day: [21], src: D21, unlocks: ['stp-config'],
      beats: [
        { k: 'SCENE', where: 'Clinic annex · switch closet · Friday, 16:50',
          lines: [
            { who: 'narr', text: 'The box is packed. The mug is gone. Old Root sits on an upturned crate and hands you the laptop.' },
            { who: 'root', text: 'Last thing. On Tuesday you found out the pharmacy hand-me-down is the root by accident. We are going to choose. You type. I talk.' },
            { who: 'root', text: '"spanning-tree vlan 1 root primary" on SW1. That sets SW1\'s priority to 24576. If some other switch is already lower than that, it goes 4096 below that switch instead. Then "spanning-tree vlan 1 root secondary" on SW2. That is 28672. A backup that wins if SW1 dies.' },
            { who: 'you', text: 'Why not just type a number?' },
            { who: 'root', text: 'You can. "spanning-tree vlan 1 priority 4096". Any multiple of 4096, and zero is allowed. I like the number when I want a guarantee. The root primary command works out its number once, when you type it. If a lower switch shows up next month, it does not re-run.' }
          ] },
        { k: 'SCENE', where: 'Same closet',
          lines: [
            { who: 'veelan', text: 'While you are in there. Two departments on this annex now, VLAN 10 and VLAN 20, and both uplinks cost money. One of them is asleep all day.' },
            { who: 'root', text: 'Which is the honest use of a tree per VLAN. Make SW1 the root for VLAN 10 and SW2 the root for VLAN 20. Each the other\'s secondary. Two trees, two different sleeping ports, both cables working. Every one of these commands says which VLAN it is for. Type one without the VLAN number and it is not the command you think it is.' },
            { who: 'narr', text: 'Vee Lan almost smiles.' }
          ],
          choice: { opts: [
            { say: 'What about the mode?', reply: '"spanning-tree mode rapid-pvst" is the modern default, one rapid tree per VLAN. "pvst" is the classic one. "mst" is for very large buildings, and you will not need it here. Check what a switch is running before you assume."' },
            { say: 'Can I change which port a switch picks without touching the root?', reply: '"Yes. On a port, "spanning-tree vlan 1 cost 4" changes how much that port adds to the root cost. Lower it and the switch prefers that path. "spanning-tree vlan 1 port-priority 64" breaks ties, and it is the neighbour that reads it. Change the number and the tree follows the number."' }
          ] } },
        { k: 'SCENE', where: 'Same closet · 17:20',
          lines: [
            { who: 'root', text: 'Now look. Not on the switch you typed on. On SW3. "show spanning-tree vlan 20". Read me the Root ID.' },
            { who: 'you', text: 'It is SW2\'s address. And on VLAN 10 it is SW1.' },
            { who: 'root', text: 'Then you are done and so am I. Always look from somewhere else. The switch you configured will tell you what you typed. A different switch tells you what happened.' },
            { who: 'narr', text: 'He picks up the box. At the door he stops.' },
            { who: 'root', text: 'The tag stays on the cable.' }
          ] },
        { k: 'LORE', title: 'SIX KEYS, SEVEN KEYS', year: 2001, vibe: 'Six under the default, seven for the spare. Type it like you mean it.', text: 'Vee Lan, after he leaves: "The numbers are not magic. 24576 is six times 4096. 28672 is seven times. Both sit under the default of eight times, 32768. Cisco added the root primary and secondary commands because people kept typing raw priorities wrong. He still types the raw number when he wants to be sure. So do I."' },
        { k: 'KIT', text: 'The last work order. His handwriting, your notes:', kit: [ { cmd: 'spanning-tree mode rapid-pvst | pvst | mst', what: 'global. which tree' }, { cmd: 'spanning-tree vlan 1 root primary', what: '24576, or 4096 below the current lowest' }, { cmd: 'spanning-tree vlan 1 root secondary', what: '28672' }, { cmd: 'spanning-tree vlan 1 priority 4096', what: 'explicit. multiples of 4096' }, { cmd: 'interface g0/1 → spanning-tree vlan 1 cost 4', what: 'change what one port adds to the root cost' }, { cmd: 'interface g0/1 → spanning-tree vlan 1 port-priority 64', what: 'tiebreaker, read by the neighbour' }, { cmd: 'show spanning-tree [vlan N]', what: 'verify from a different switch' } ] },
        { k: 'SYNC', q: { prompt: 'Dispatch, that evening: "Client asks: all defaults, they typed root primary on SW3 for VLAN 1. What priority does SW3 have now?"', opts: ['0', '4096', '24576', '28672'], a: 2, yes: 'You answer before Old Root can. 24576, shown as 24577 in VLAN 1.', no: 'Dispatch: "24576. Only if another switch was already lower would it go 4096 beneath. 28672 is secondary."' , why: 'Old Root: root primary sets 24576 when nobody is lower. If some switch is already lower, it goes 4096 below that switch instead. root secondary always sets 28672. The default is 32768. VLAN 1 adds 1 to the number on screen, so you will read 24577.' } }
      ] }
  ] });
})();
