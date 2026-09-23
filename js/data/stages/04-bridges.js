/* Stage 4 · The Bridges — Spanning Tree, Days 20–21. The demo stage. One week at the Watson clinic annex.
   Written as scenes. See docs/STORY_BIBLE.md. Facts follow Jeremy's IT Lab Days 20 and 21 exactly. */
(function(){
  const { PS, SJ } = SRC;
  const D20 = [PS('Spanning_Tree_Protocol_Part1.md'), SJ('08 - Day 20 - STP Part 1.md')];
  const D21 = [PS('Spanning_Tree_Protocol_Part2.md'), SJ('09 - Day 21 - STP Part 2.md')];

  STAGES.push({ id: 'bridges', arc: 'grid', title: 'STAGE 4 · THE BRIDGES', sub: 'Spanning Tree · the clinic annex · Days 20–21 · DEMO STAGE', npc: 'root', status: 'live', levels: [

    // ------------------------------------------------------------ 1
    { id: 'stp-why', title: 'The cable that never carried a frame', sub: 'Day 20 · why loops kill a network', npc: 'root', day: [20], src: D20, unlocks: ['stp-loops'],
      beats: [
        { k: 'SCENE', where: 'Watson clinic annex · switch closet · Monday, 22:40',
          lines: [
            { who: 'narr', text: 'The closet is warm and smells of dust. Three switches on a rack. A cardboard box on the floor with a coffee mug in it. An old man is winding a cable around his hand.' },
            { who: 'root', text: 'You are the new one Dispatch sent. Good. Come here and look at this before I go.' },
            { who: 'narr', text: 'He points at the second switch. Two cables run from it to the first switch. One of them has a paper tag: DO NOT UNPLUG.' },
            { who: 'root', text: 'That second cable has been plugged in for six years. It has never carried a single frame. Every tech who comes through here wants to pull it.' },
            { who: 'you', text: 'Why keep a cable that does nothing?' },
            { who: 'root', text: 'Because I remember the night we did not have it.' }
          ],
          choice: { opts: [
            { say: 'Tell me about that night.', reply: 'A fibre got cut in the street. One path, so the annex went dark. A nurse named Imani carried paper charts up three floors for nine hours. After that I ran a second cable. Then I had a different problem.' },
            { say: 'So the second cable is a backup.', reply: 'It is. But a backup cable is also a second path, and two paths between two switches make a ring. Rings are the thing that kills a network faster than a cut fibre. Sit down. This part matters.' }
          ] } },
        { k: 'SCENE', where: 'Same closet · he draws on the back of a work order',
          lines: [
            { who: 'root', text: 'A switch that gets a broadcast sends it out every other port. That is its job. Now put two cables between two switches and send one broadcast.' },
            { who: 'narr', text: 'He draws two boxes and two lines. Then an arrow going around and around.' },
            { who: 'root', text: 'Switch one floods it down both cables. Switch two gets it twice and floods each copy back. There is nothing in a frame that counts down. A packet has a [[TTL]] and dies after enough hops. A frame does not. It goes around until something breaks.' },
            { who: 'you', text: 'How fast does it break?' },
            { who: 'root', text: 'Seconds. Every trip around adds copies. The links fill up. The switches spend all their CPU on it. And every MAC table goes wrong, because the same address keeps arriving on two different ports. That is a [[broadcast storm]]. Nurses cannot log in, the printers fall over, and your phone starts ringing.' }
          ] },
        { k: 'SCENE', where: 'Same closet',
          lines: [
            { who: 'root', text: 'So the cable stays, and something has to keep it quiet. That something is [[spanning tree]]. Every switch runs it. Together they look at every extra path and put all but one to sleep.' },
            { who: 'narr', text: 'He taps the tagged cable.' },
            { who: 'root', text: 'This one is asleep. Plugged in, light on, no traffic. If the live path dies, the switches wake it up. That is the whole idea. Keep the ring, break the loop.' },
            { who: 'you', text: 'And you have been doing that by hand for twenty years?' },
            { who: 'root', text: 'No. The protocol does it. I have been making sure it does it the way I want, which is a different job, and it is the one you are here to learn.' }
          ] },
        { k: 'LORE', text: 'Old Root, still winding cable: "The woman who worked this out was Radia Perlman, in 1985, at DEC. She wrote the algorithm in a few days and then wrote it again as a poem, because she said the poem was easier to remember. It became the IEEE standard 802.1D in 1990. In November 2002 a hospital in Boston, Beth Israel Deaconess, lost its whole network for close to four days to a spanning tree failure. The doctors went back to paper. I read about that when I was younger than you. It is why I keep the tag on the cable."' },
        { k: 'KIT', text: 'He tears off the work order and hands it to you. On the back, in pencil:', kit: [ { cmd: 'two paths between two switches = a loop, unless something blocks one', what: 'the thing to see before anything else' }, { cmd: 'show spanning-tree', what: 'the one command that shows you which port is asleep' } ] },
        { k: 'SYNC', q: { prompt: 'Imani, the nurse, stops by the closet: "The tech before you said a loop on the switches is like a loop on the internet. Is that right?"', opts: ['Yes, both are stopped by the TTL', 'No. A packet has a TTL and dies. A frame has no TTL, so a switch loop runs until something breaks', 'Yes, both are stopped by the router', 'No. Frames stop after 15 hops'], a: 1, yes: 'Old Root nods once. "That is the answer. Frames do not count down. We have to do it for them."', no: 'Old Root shakes his head. "A packet dies at TTL zero. A frame never dies. That is why I exist."' } }
      ] },

    // ------------------------------------------------------------ 2
    { id: 'stp-election', title: 'Who is in charge here', sub: 'Day 20 · root bridge, root ports, designated ports, cost', npc: 'root', day: [20], src: D20, unlocks: ['stp-election'],
      beats: [
        { k: 'SCENE', where: 'Clinic annex · switch closet · Tuesday, 07:10',
          lines: [
            { who: 'narr', text: 'Old Root is already there, coffee in hand, a laptop open on the box. Three switches: SW1, SW2, SW3.' },
            { who: 'root', text: 'Three switches. One of them is in charge. The others measure everything from it. Do you know which one?' },
            { who: 'you', text: 'The one you set up as the main one?' },
            { who: 'root', text: 'I never set one up. Nobody did. Type "show spanning-tree" on any of them and read the line that says Root ID.' },
            { who: 'narr', text: 'The screen shows a priority of 32769 and a MAC address. Every switch prints the same address.' },
            { who: 'root', text: 'That is the [[root bridge]]. The centre of the tree. Every switch sends hello messages called [[BPDU]]s with its own Bridge ID, and the lowest Bridge ID wins. Bridge ID is the priority first, then the MAC address. Every switch here has the default priority, 32768 plus the VLAN number. So they tie on priority and the lowest MAC address wins.' }
          ],
          choice: { opts: [
            { say: 'So the oldest switch is in charge.', reply: '"Usually, yes. Old MAC addresses tend to be lower. SW3 is a hand-me-down from the pharmacy. It is the slowest box in the room and it runs the tree because nobody told it not to. That is not a design. It is an accident."' },
            { say: 'Does it matter which one is root?', reply: '"It decides which paths stay awake. If the root is a slow switch in a corner, traffic between the two good switches goes through the corner. Yes, it matters. We will fix it on Friday. Today you learn how it chose."' }
          ] } },
        { k: 'SCENE', where: 'Same closet · he draws three boxes in a triangle',
          lines: [
            { who: 'root', text: 'Once the root is known, every other switch picks one port that faces the root. Its root port. It picks by cost. Every port has a cost from its speed: 10 megabit is 100, 100 megabit is 19, a gigabit is 4, ten gigabit is 2. Add up the costs along a path to the root. Lowest total wins.' },
            { who: 'you', text: 'Not the fewest hops?' },
            { who: 'root', text: 'Hops mean nothing here. Two gigabit links cost 8. One FastEthernet link costs 19. The switch will go two hops to save eleven points. If two paths tie on cost, it takes the one through the neighbour with the lower Bridge ID. If that still ties, the neighbour\'s lower port number.' },
            { who: 'narr', text: 'He writes the numbers under the triangle: 4, 4, 19.' },
            { who: 'root', text: 'Then every cable gets one designated port. The end with the lower cost to the root. Tie goes to the lower Bridge ID. On the root, every port is designated, because its cost is zero. Whatever port is left over with no job is non-designated. It blocks. That is your sleeping cable.' }
          ] },
        { k: 'LORE', text: 'Old Root, while you write: "The priority field is sixteen bits. In 2001 the standard, 802.1t, split it: four bits for the priority you set, twelve bits for the VLAN number. That is why every priority you will ever type is a multiple of 4096, and why VLAN 1 shows as 32769 and VLAN 10 shows as 32778. People think the display is wrong. It is telling you the VLAN."' },
        { k: 'KIT', text: 'On the work order, under the triangle:', kit: [ { cmd: 'Bridge ID = priority (+ VLAN) . MAC address  →  lowest wins root', what: 'the election' }, { cmd: 'cost: 10 Mb 100 · 100 Mb 19 · 1 Gb 4 · 10 Gb 2', what: 'per port, by speed' }, { cmd: 'root port: lowest root cost → lowest neighbour Bridge ID → lowest neighbour port ID', what: 'one per non-root switch' }, { cmd: 'designated port: lowest root cost → lowest Bridge ID', what: 'one per cable' }, { cmd: 'show spanning-tree', what: 'Root ID vs Bridge ID. "This bridge is the root" if it is.' } ] },
        { k: 'SYNC', q: { prompt: 'Vee Lan calls from the second floor: "SW2 has a FastEthernet cable straight to the root, and two gigabit links through SW3. Which one is it using?"', opts: ['The FastEthernet link, cost 19', 'The gigabit path through SW3, cost 8', 'Both, it balances them', 'The one with the lower MAC'], a: 1, yes: 'Old Root: "Four and four is eight. Eight is less than nineteen. Tell her the long way is the short way."', no: 'Old Root: "Add the costs. Two gigabit links are 8. One FastEthernet is 19. The switch takes the 8."' } }
      ] },

    // ------------------------------------------------------------ 3
    { id: 'stp-states', title: 'Thirty seconds with a stopwatch', sub: 'Day 21 · port states and timers', npc: 'root', day: [21], src: D21, unlocks: ['stp-states'],
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
            { who: 'root', text: 'Forwarding. Fifteen and fifteen, set by one timer, the [[forward delay]]. The fifth word you will see on the exam is Disabled: a port somebody shut down. It is not in the tree at all.' }
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
        { k: 'LORE', text: 'Old Root: "That fifty seconds is why the original standard got a bad name. In 2001 the IEEE published 802.1w, Rapid Spanning Tree. Same idea, new handshake, a link comes back in under a second. It renamed the roles too: alternate and backup instead of non-designated. Every modern Cisco switch runs the rapid version per VLAN by default. The old states and timers are still on your exam because half the buildings in Watson still run the old tree."' },
        { k: 'KIT', text: 'On the work order:', kit: [ { cmd: 'Blocking → Listening (15 s) → Learning (15 s) → Forwarding', what: 'the way up. never skipped without PortFast' }, { cmd: 'hello 2 s · forward delay 15 s · max age 20 s', what: 'defaults. the root bridge sets them for everyone' }, { cmd: 'dead link to forwarding: up to 50 s', what: 'max age + listening + learning' }, { cmd: 'forwarding → blocking: immediate', what: 'closing is always safe' }, { cmd: 'BPDUs go out designated ports only', what: 'root and blocked ports receive' } ] },
        { k: 'SYNC', q: { prompt: 'Imani texts you later: "The tech said the port was in a state where it learns addresses but still does not pass my traffic. Which one was that?"', opts: ['Blocking', 'Listening', 'Learning', 'Forwarding'], a: 2, yes: 'Old Root, reading over your shoulder: "Learning. It fills the table so that the moment it forwards, it forwards well."', no: 'Old Root: "Learning. Listening does neither. Forwarding does both. Blocking does nothing but listen for hellos."' } }
      ] },

    // ------------------------------------------------------------ 4
    { id: 'stp-bpdu', title: 'Something in reception is talking', sub: 'Day 21 · the BPDU, PVST+ and 802.1D', npc: 'root', day: [21], src: D21, unlocks: ['stp-bpdu'],
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
        { k: 'LORE', text: 'Vee Lan, from the doorway: "A pentester showed me a tool called Yersinia once, 2005 vintage. One keystroke and your laptop sends a BPDU with priority zero. Whole building re-elects around a laptop. He did it to make a point. The point was that every hello is a claim and the tree believes claims." Old Root: "Which is why the toolkit exists. Tomorrow."' },
        { k: 'KIT', text: 'On the work order:', kit: [ { cmd: '01:80:C2:00:00:00', what: 'IEEE 802.1D / RSTP BPDU destination' }, { cmd: '01:00:0C:CC:CC:CD', what: 'Cisco PVST+ BPDU destination' }, { cmd: 'BPDU fields: root ID · root path cost · bridge ID · port ID · timers', what: 'what is in a hello' }, { cmd: 'PVST = ISL trunks only · PVST+ = 802.1Q · Rapid PVST+ = RSTP per VLAN', what: 'the Cisco versions' } ] },
        { k: 'SYNC', q: { prompt: 'Mac, later: "New capture. Frames to 01:80:C2:00:00:00, two seconds apart. Same thing?"', opts: ['Same thing, PVST+ hellos', 'Standard IEEE STP or RSTP hellos, not the Cisco per-VLAN kind', 'CDP advertisements', 'ARP replies'], a: 1, yes: 'Old Root: "Standard tree. Not a Cisco box, or a Cisco box running the standard mode. Still a switch. Still a claim."', no: 'Old Root: "01:80:C2 is the IEEE address. Cisco per-VLAN uses 01:00:0C. Learn both. The exam will show you one and ask which."' } }
      ] },

    // ------------------------------------------------------------ 5
    { id: 'stp-toolkit', title: 'The box under the desk', sub: 'Day 21 · PortFast, BPDU Guard, Root Guard, Loop Guard', npc: 'root', day: [21], src: D21, unlocks: ['stp-toolkit'],
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
            { say: 'Are there more tools like this?', reply: '"Two you should know by name. Root Guard: a port that will never accept a superior BPDU, so nothing downstream can take the root from you. Loop Guard: a port that stops hearing BPDUs is not allowed to start forwarding, in case the cable went one-way. The exam wants PortFast and BPDU Guard cold. Know the other two exist."' },
            { say: 'What happens to Deshawn?', reply: 'Vee Lan: "He gets the talk." Old Root: "He gets a second monitor cable from the closet and the talk. Then we put the guard on every host port in the building so the next temp never gets the chance."' }
          ] } },
        { k: 'LORE', text: 'Old Root: "Err-disabled is a Cisco word. The port shows as down until someone does shutdown and no shutdown, or errdisable recovery brings it back on a timer. After that Boston hospital outage in 2002, the fix was partly this discipline. Decide which ports are edges. Guard them. Stop trusting every hello."' },
        { k: 'KIT', text: 'On the work order, underlined twice:', kit: [ { cmd: 'interface f0/1 → spanning-tree portfast', what: 'one host port goes straight to forwarding' }, { cmd: 'spanning-tree portfast default', what: 'global: every access port, never trunks' }, { cmd: 'interface f0/1 → spanning-tree bpduguard enable', what: 'one port: BPDU arrives → err-disabled' }, { cmd: 'spanning-tree portfast bpduguard default', what: 'global: every PortFast port gets the guard' }, { cmd: 'shutdown → no shutdown', what: 'recover an err-disabled port after the box is gone' }, { cmd: 'spanning-tree guard root · spanning-tree guard loop', what: 'Root Guard, Loop Guard. know the names' } ] },
        { k: 'SYNC', q: { prompt: 'Deshawn, quietly: "If the tech had put PortFast on the uplink between SW1 and SW2, what would have gone wrong?"', opts: ['Nothing, PortFast is safe anywhere', 'The uplink could start forwarding before the tree blocked it, and make a loop', 'The port would refuse to trunk', 'Convergence would be slower'], a: 1, yes: 'Old Root: "A port forwarding before the tree has judged it is a loop waiting to happen. Host ports only."', no: 'Old Root: "PortFast skips the safety states. On a switch-facing port that means forwarding into a loop before the tree can react."' } }
      ] },

    // ------------------------------------------------------------ 6
    { id: 'stp-config', title: 'Choosing on purpose', sub: 'Day 21 · mode, root primary and secondary, priority, cost, port-priority', npc: 'root', day: [21], src: D21, unlocks: ['stp-config'],
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
        { k: 'LORE', text: 'Vee Lan, after he leaves: "The numbers are not magic. 24576 is six times 4096. 28672 is seven times. Both sit under the default of eight times, 32768. Cisco added the root primary and secondary commands because people kept typing raw priorities wrong. He still types the raw number when he wants to be sure. So do I."' },
        { k: 'KIT', text: 'The last work order. His handwriting, your notes:', kit: [ { cmd: 'spanning-tree mode rapid-pvst | pvst | mst', what: 'global. which tree' }, { cmd: 'spanning-tree vlan 1 root primary', what: '24576, or 4096 below the current lowest' }, { cmd: 'spanning-tree vlan 1 root secondary', what: '28672' }, { cmd: 'spanning-tree vlan 1 priority 4096', what: 'explicit. multiples of 4096' }, { cmd: 'interface g0/1 → spanning-tree vlan 1 cost 4', what: 'change what one port adds to the root cost' }, { cmd: 'interface g0/1 → spanning-tree vlan 1 port-priority 64', what: 'tiebreaker, read by the neighbour' }, { cmd: 'show spanning-tree [vlan N]', what: 'verify from a different switch' } ] },
        { k: 'SYNC', q: { prompt: 'Dispatch, that evening: "Client asks: all defaults, they typed root primary on SW3 for VLAN 1. What priority does SW3 have now?"', opts: ['0', '4096', '24576', '28672'], a: 2, yes: 'You answer before Old Root can. 24576, shown as 24577 in VLAN 1.', no: 'Dispatch: "24576. Only if another switch was already lower would it go 4096 beneath. 28672 is secondary."' } }
      ] }
  ] });
})();
