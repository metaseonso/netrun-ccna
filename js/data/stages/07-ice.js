/* District 07 · The ICE — the gate. Nights 34 and 35 (standard and extended ACLs); nights 48–51 follow (security
   fundamentals, port security, DHCP snooping, DAI). Ace Elle and her dog Sticky. Written to docs/STORY_BIBLE.md (Voice)
   and docs/CAMPAIGN_MAP.md. */
(function(){
  const { PS } = SRC;
  STAGES.push({ id: 'ice', arc: 'grid', title: 'STAGE 7 · THE ICE', sub: 'ACLs, security fundamentals, port security, snooping', npc: 'ace', status: 'live', levels: [
    // ------------------------------------------------------------ night 34 · standard ACLs
    { id: 'n34-top-to-bottom', title: 'Top to bottom, once', sub: 'standard ACLs', npc: 'ace', day: [34], src: [PS('Standard_Access_Control_Lists.md')], unlocks: ['acl-standard'],
      beats: [
        { k: 'SCENE', where: 'The gate · Ace Elle\'s booth · twenty to two in the morning',
          lines: [
            { who: 'narr', text: 'Rain drums on the booth\'s tin roof, and a space heater under the desk blows hot air that smells of wet dog. Two routers hum on a shelf above a steel door. A woman with short dark-red hair and a scar across one cheek reads a clipboard with her finger, line by line, from the top. A brown dog lies across the doorway and watches your hands.' },
            { who: 'ace', text: 'You\'re the one who brought Every Road Home back up. Dispatch says you\'re Class B now, so you get my problems. Sit where Sticky can see you.' },
            { who: 'ace', text: 'Last night somebody at a market kiosk reached the clinic\'s records server. They didn\'t take anything that I can find. They knocked, the door opened, and they walked away again, and I want that door shut before they come back.' },
            { who: 'ace', text: 'The door is an [[ACL]], an access control list. Every line on it is an [[access control entry]]. I read it from the top, and the first line that matches the packet decides: permit or deny, and I stop reading. If I reach the bottom and nothing matched, it doesn\'t get in. Nobody types that last rule. It\'s the [[implicit deny]], and it\'s at the bottom of every list.' },
            { who: 'you', text: 'What does a line check?' },
            { who: 'ace', text: 'On a [[standard ACL]], only the source address, where the packet came from. It can\'t see where it\'s going. So I put it as close to the destination as I can, right in front of the records server, or it will turn away people who were headed somewhere else.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'How do you write a line?', reply: 'Ace: "Standard lists get a number from 1 to 99, or 1300 to 1999 when those run out. access-list 10 permit, then an address and a [[wildcard mask]]. A 0 bit in the mask means that bit has to match, a 1 means I don\'t care, so 0.0.0.255 takes the whole /24. The words any and host save typing: any is everyone, host is one address."' },
            { tone: 'press', say: 'Why not stop them at the gate, where they come in?', reply: 'Ace: "Because this list only knows who you are, not where you\'re going. Put it on the market\'s port and that kiosk can\'t reach anything at all: the council\'s page, the noodle bars, my office. I want to stop one knock at one door."' },
            { tone: 'quiet', say: '(Hold your hand out, low, for the dog.)', reply: 'Sticky sniffs your knuckles once and puts her head back down on her paws. Ace watches, then writes something on the clipboard. "She remembers the first face on a port. Now she\'ll remember yours."' }
          ] } },
        { k: 'SCENE', where: 'The booth · the router shelf',
          lines: [
            { who: 'ace', text: 'A list does nothing sitting in the config. You apply it to an interface, inbound or outbound. Inbound, the router checks the packet as it arrives, before it looks at its routing table. Outbound, it checks it on the way out of the port. One list per direction on each interface, so two at most.' },
            { who: 'ace', text: 'The records server hangs off R2\'s g0/0. Outbound on that port is the last door before the server, and that\'s where the list goes.' },
            { who: 'ace', text: 'You can name a list instead of numbering it. ip access-list standard, then the name, and every line inside gets a sequence number, 10, 20, 30, so you can find it again. show access-lists reads them all back to you in order.' },
            { who: 'narr', text: 'She turns the clipboard round. Under the rules, somebody has written a date in pencil and underlined it twice: the night a switch nobody owned wiped the market floor\'s VLANs. Below it is a column of dates and times, one for every door tried since.' },
            { who: 'ace', text: 'Whoever it is knows which kiosk still has the clinic\'s old cable running under the market floor. Not many people are left who do.' },
            { who: 'narr', text: 'She reaches up and lays two fingers on the warm lid of R2, the way you would check on a sleeping animal.' },
            { who: 'ace', text: 'The towers downtown guard their doors with this same kind of list, on this same kind of box, read top to bottom.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Inbound or outbound, how do I choose?', reply: 'Ace: "Ask what the router should throw away. Inbound on the market\'s port, the kiosk loses everything past it. Outbound on the records port, it only loses the records. With a standard list, outbound near the destination is nearly always right."' },
            { tone: 'press', say: 'Who do you think it is?', reply: 'She taps the pencilled date with one fingernail. "When I can prove it, I\'ll say it, and not before." Sticky\'s ears go up at her tone and settle again.' },
            { tone: 'joke', say: 'Does Sticky get a list too?', reply: 'Ace: "Sticky\'s is shorter. The first face she sees on a port is allowed, and nobody else. She doesn\'t need to read it twice."' }
          ] } },
        { k: 'LORE', title: 'THE LIST AT THE GATEWAY', year: 1988, real: ['dec'], vibe: 'Bodacious. A computer that finally asked who you were before it let you in.',
          text: 'Ace, feeding Sticky a biscuit from her pocket: "My first boss kept a photocopy of this taped inside the booth. In 1988 engineers at Digital Equipment Corporation, DEC, built the first packet filters: a gateway that read the addresses on every packet and checked them against a list before it let one through. In 1989 one of them, Jeff Mogul, published how it worked so that anyone could build one. He built the first filter at this gate from that paper."' },
        { k: 'KIT', text: 'Ace writes the gate\'s rules on the back of a visitor pass and hands it over.', kit: [
          { cmd: 'access-list 10 permit 192.168.1.0 0.0.0.255', what: 'standard, numbered 1–99 or 1300–1999. Source address only. Top to bottom, first match wins' },
          { cmd: 'access-list 10 deny host 192.168.2.10 · access-list 10 permit any', what: 'host is one address, any is everyone. Nothing matched at the bottom: implicit deny' },
          { cmd: 'access-list 10 remark TEXT', what: 'a note on the list for the next person' },
          { cmd: 'interface g0/0 · ip access-group 10 out', what: 'apply it close to the destination. One list per interface per direction' },
          { cmd: 'ip access-list standard NAME · 10 permit host 192.168.1.10 · 20 deny any', what: 'a named standard list. Every line has a sequence number' },
          { cmd: 'show access-lists · show ip access-lists', what: 'read every list back, in order' } ] },
        { k: 'SYNC', q: { prompt: 'Nurse Imani comes to the gate for her night-shift badge and reads the list over your shoulder: "It only says permit 192.168.1.0 0.0.0.255. Our new pharmacy laptop is on 192.168.5.20. Can it open the records?"', opts: ['No. It matches no line, so the implicit deny drops it', 'Yes. Nothing on the list denies it', 'Yes, because the list is only applied outbound', 'Only after the clinic desks have used it first'], a: 0,
          yes: 'Ace: "No. It needs its own line."', no: 'Ace: "No. It matches nothing, and the bottom of the list says no to everything."',
          why: 'Ace: The list has one line, a permit for 192.168.1.0 with wildcard 0.0.0.255, which is the clinic\'s 192.168.1.x desks. 192.168.5.20 doesn\'t match it, so the router reaches the bottom of the list, where the implicit deny drops everything that matched nothing. If the pharmacy should get in, add access-list 10 permit 192.168.5.0 0.0.0.255.' } }
      ] },

    // ------------------------------------------------------------ night 35 · extended ACLs
    { id: 'n35-wrong-side', title: 'The wrong side of town', sub: 'extended ACLs', npc: 'ace', day: [35], src: [PS('Extended_Access_Control_Lists.md')], unlocks: ['acl-extended'],
      beats: [
        { k: 'SCENE', where: 'The gate · the booth window · a quarter past seven in the morning',
          lines: [
            { who: 'narr', text: 'The market is loud before you reach it: shutters going up, a generator coughing, a dozen people all talking at once. The queue at Ace\'s window smells of fish and frying oil, and half the people in it are holding card readers with the same red light blinking on the front. Marrow is at the back of it with a paper bag of buns.' },
            { who: 'marrow', text: 'Nobody in the market has taken a card since six. I\'ve got half of them eating on a tab. Eat one of these while she explains it to you.' },
            { who: 'ace', text: 'Somebody put a list on R1 at dawn. Standard list, deny the market, permit everything else, inbound on the market\'s port. It\'s on the wrong side of town. A standard list near the source stops the source from going anywhere, so the tills can\'t reach the payments server, or the council, or anything past this booth.' },
            { who: 'you', text: 'Who put it there?' },
            { who: 'ace', text: 'There\'s a remark on it that says per gate policy, and I didn\'t write it. Either somebody panicked about the kiosk and wanted to help, or somebody wanted the market angry at the gate. Take it off first. Then we write the list the market should have had.' },
            { who: 'ace', text: 'That one is an [[extended ACL]]. It reads the protocol, the source, the destination, and the ports, so it can say exactly which traffic it means. Numbers 100 to 199, or 2000 to 2699. Because it can be that exact, it goes close to the source, and the traffic it drops never crosses the district.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What does a line look like?', reply: 'Ace: "access-list 100 deny tcp, then the source and its wildcard, then the destination and its wildcard, then eq and the port. The host keyword before an address means that one address. The protocol can be ip for everything, or tcp, udp, icmp, even ospf. permit ip any any at the end lets the rest through, because the implicit deny is still waiting underneath."' },
            { tone: 'press', say: 'If extended lists are so exact, why keep standard ones at all?', reply: 'Ace: "They\'re short, and short lists get read right. A standard list has one job, and it\'s fine for that job as long as it stands next to the destination. It turns into a wall when somebody puts it at the source, like this morning."' },
            { tone: 'care', say: 'Marrow, how bad is the tab?', reply: 'Marrow: "Forty-one bowls. I\'ll get most of it back. The fishmonger never pays, card or no card."' }
          ] } },
        { k: 'SCENE', where: 'The booth · the router shelf · the queue thinning outside', real: ['ietf'],
          lines: [
            { who: 'ace', text: 'An extended line can match ports several ways. eq is one port. gt is every port above a number, lt every port below one, neq every port but one, and range is a first and a last. The port you usually care about is the destination\'s: 443 for the payments page, 22 for SSH.' },
            { who: 'ace', text: 'The protocol goes by its number in the IP header too. [[ICMP]] is 1, TCP is 6, UDP is 17, EIGRP is 88, OSPF is 89. Write ip and you mean all of them.' },
            { who: 'you', text: 'And when one line in the middle is wrong?' },
            { who: 'ace', text: 'A numbered list can be opened like a named one, ip access-list extended 100, and then every line shows its sequence number. Type a new line with a number of its own, 25, and it slides in between 20 and 30. Type no 30 and line 30 is gone. From global config you can\'t pull out one line of a numbered list; you\'d delete the whole thing.' },
            { who: 'ace', text: 'If the numbers get crowded, ip access-list resequence 100 10 10 renumbers the list from 10 in steps of 10. And show ip interface on a port tells you which lists are on it, in and out, which is how I found this morning\'s.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Which port number do I match, the source or the destination?', reply: 'Ace: "Where you put it tells me. A port written after the source address is the source port, and after the destination address it\'s the destination port. A till talking to the payments page uses some high port of its own and 443 at the far end, so the 443 goes after the destination."' },
            { tone: 'press', say: 'Somebody wanted the market angry at you. Why?', reply: 'Ace: "A market that can\'t take cards starts saying the street can\'t keep its own net. There are people downtown who would be glad to hear the council say that too." She says it to the clipboard, not to you.' },
            { tone: 'quiet', say: '(Watch Sticky, who is watching the queue.)', reply: 'The dog\'s eyes follow one man in a clean grey coat to the end of the queue and back out into the market. He never reaches the window. Ace sees you watching the dog and writes the time down.' }
          ] } },
        { k: 'LORE', title: 'TEN MINUTES IN JANUARY', year: 2003, real: ['microsoft'], vibe: 'Pwned. Half the internet got served before breakfast.',
          text: 'Ace, with the last of Marrow\'s buns: "On the twenty-fifth of January 2003, a worm called SQL Slammer went out at about half past five in the morning, UTC. It fit in a single UDP packet to port 1434, where Microsoft SQL Server listened, and it doubled every few seconds. Within ten minutes it had found nearly every server it could infect, about seventy-five thousand of them. The operators who got their networks back that morning did it with one extended line: deny udp any any eq 1434. My first boss typed it on this shelf and kept the printout in the drawer."' },
        { k: 'KIT', text: 'Ace copies the morning\'s fix onto the back of a market receipt.', kit: [
          { cmd: 'access-list 100 deny ip 192.168.2.0 0.0.0.255 host 10.0.20.10', what: 'extended, numbered 100–199 or 2000–2699: protocol, source, destination, ports' },
          { cmd: 'access-list 100 permit tcp 192.168.2.0 0.0.0.255 host 10.0.40.10 eq 443', what: 'the port after the destination is the destination port' },
          { cmd: 'access-list 100 permit ip any any · interface g0/1 · ip access-group 100 in', what: 'let the rest through, then apply it close to the source' },
          { cmd: 'eq 443 · gt 1023 · lt 1024 · neq 23 · range 20 21', what: 'one port, above, below, all but one, first to last' },
          { cmd: 'ICMP 1 · TCP 6 · UDP 17 · EIGRP 88 · OSPF 89', what: 'IP protocol numbers. ip matches them all' },
          { cmd: 'ip access-list extended 100 · 25 permit ... · no 30', what: 'insert or delete one line by sequence number' },
          { cmd: 'ip access-list resequence 100 10 10 · show ip interface g0/1', what: 'renumber from 10 by 10 · which lists are on a port' } ] },
        { k: 'SYNC', q: { prompt: 'Marrow, packing up the empty bag: "Last night\'s list sat by the market\'s port and cut us off from everything. Yours sits in the same place. Why is that fine now?"', opts: ['Because an extended list names the destination and the port, so it only drops the traffic it means to', 'Because extended lists only apply outbound', 'Because the implicit deny doesn\'t exist on extended lists', 'Because number 100 has priority over number 1'], a: 0,
          yes: 'Ace: "Because it knows where you\'re going."', no: 'Ace: "Because it can see where you\'re going, and a standard list can\'t."',
          why: 'Ace: A standard list reads only the source, so near the source it blocks that source from everywhere. An extended list also reads the destination, the protocol and the port, so near the source it drops exactly the traffic it names, and everything else goes on. It still ends in an implicit deny, which is why the last line is permit ip any any.' } }
      ] }
  ] });
})();
