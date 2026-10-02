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
            { tone: 'quiet', say: '(Hold your hand out, low, for the dog.)', reply: 'Sticky sniffs your knuckles once and puts her head back down on her paws. Ace watches, then writes something on the clipboard. "She remembers the first face she meets on a port, and now she has yours."' }
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
      ] },

    // ------------------------------------------------------------ night 48 · security fundamentals
    { id: 'n48-pins-and-string', title: 'Pins and string', sub: 'security fundamentals', npc: 'ace', day: [48], src: [PS('Security_Fundamentals.md')], unlocks: ['sec-fundamentals'],
      beats: [
        { k: 'SCENE', where: 'The gate · Ace Elle\'s booth · ten past one',
          lines: [
            { who: 'narr', text: 'The booth at the gate smells of wet dog and burnt coffee, and a heater under the desk ticks as it glows orange. Rain runs down the window in sheets. Sticky lies across the doorway, so you have to step over her, and she lifts her head to watch your hands while you do. On the back wall hangs a paper map of Watson stuck full of coloured pins, with red string running between them.' },
            { who: 'ace', text: 'Sit. Dispatch says you have been inside half the buildings on that map since the spring. I want you to see what I see when I look at it.' },
            { who: 'ace', text: 'Every pin is a night something went wrong on purpose. The switch at the market that wiped Vee Lan\'s VLANs. The box under a desk in the clinic annex that made itself root. The roads going dark halfway through Every Road Home. Shell\'s password, read off the wire.' },
            { who: 'you', text: 'They don\'t look like the same kind of trouble.' },
            { who: 'ace', text: 'They came through different doors, and behind every one of them was one of three things, the [[CIA triad]]. Shell\'s password was confidentiality: only the people who should read a thing can read it. The wiped VLANs were integrity: nobody without the right changes what is there. The annex and the roads were availability: the network works when the people in the building need it.' },
            { who: 'ace', text: 'The annex had switch ports in reception that anyone could plug into. That weakness is a [[vulnerability]]. The box somebody carried in to use it is an [[exploit]]. The chance that somebody does it again next week is the [[threat]]. BPDU Guard, which Old Root put on those ports afterwards, is a [[mitigation]].' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Could it be something on the machines, not a person?', reply: 'Ace: "[[Malware]] does get in, and I check for it every time. A [[virus]] hides inside another program and runs when that program runs. A [[worm]] copies itself from machine to machine with nobody clicking anything. A [[trojan horse]] looks like something you wanted, a free game or a booking app, and opens a door once you install it. None of those needed a person standing in the annex, and this one did."' },
            { tone: 'press', say: 'So who is doing it?', reply: 'She looks at the map instead of at you. "Somebody who knows these buildings from the inside. I have a name I would like to be wrong about. I do not read a name off my list until I can prove every line of it, so ask me again when I can."' },
            { tone: 'quiet', say: '(Hold your hand out to Sticky.)', reply: 'Sticky sniffs your knuckles for a long moment, then puts her chin back on her paws. Ace: "She checked your face before she decided anything. Whoever did this checked the buildings first, too: who works nights, which doors stick, which ports are live. That is [[reconnaissance]]. Most of it is public, and all you can do is make it dull."' }
          ] } },
        { k: 'SCENE', where: 'The Watson clinic · the front desk · a quarter to eight in the morning',
          lines: [
            { who: 'narr', text: 'You walk to the clinic with Ace as the rain stops, the gutters still running and the street smelling of wet concrete and frying dough from the cart on the corner. Sticky trots ahead and stops at every doorway.' },
            { who: 'ace', text: 'The next ones will be louder. A [[DoS]] attack, denial of service, takes something off the air by drowning it. A TCP [[SYN flood]] sends the first message of the three-way handshake again and again and never finishes one, until the appointment server has no room left for real patients. Send it from ten thousand hijacked cameras at once and it is a [[DDoS]], distributed.' },
            { who: 'ace', text: 'Some of them lie about who they are. That is [[spoofing]], a fake source MAC or IP address. A box that spoofs new MAC addresses and asks for a lease with every one of them can empty a DHCP pool in a minute, which is [[DHCP exhaustion]]. Put the clinic\'s address on a question to a big public server and the answer lands on the clinic. That is a [[reflection]] attack, and when the answer is far bigger than the question it becomes [[amplification]].' },
            { who: 'ace', text: 'And the one I lose sleep over is a box that gets between two machines and reads everything that passes, a [[man-in-the-middle]]. On a switch the easy way in is ARP.' },
            { who: 'narr', text: 'The front desk smells of hand gel and printer toner. Imani is standing behind it with the desk phone still in her hand, looking at it as if it had bitten her.' },
            { who: 'Imani', text: 'A man just rang saying he was from the provider. He knew my name and the name of the ward. He said the line would drop at eight unless I read him the router password.' },
            { who: 'ace', text: 'That was [[social engineering]], and on the phone it is called [[vishing]]. He broke nothing: he found out your name and your ward, and then he asked.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Is there a name for every kind?', reply: 'Ace: "[[Phishing]] is the fake email that looks real. [[Spear phishing]] is aimed at one building, with names in it, like the call you just had. [[Whaling]] goes after the people at the top. Vishing is the phone, [[smishing]] is a text message. A [[watering hole]] attack poisons a site the target visits every day. [[Tailgating]] is walking through a locked door behind someone who has a key."' },
            { tone: 'press', say: 'Then give everyone better passwords.', reply: 'Ace: "A [[dictionary attack]] runs through lists of common words and passwords, and a [[brute force attack]] tries every combination of letters, numbers and symbols. A long password beats both, and it still loses to a phone call like that one. So the login asks for two kinds of proof: something you know, something you have, something you are. That is [[MFA]], multi-factor authentication. The clinic\'s appointment page proves who it is with a [[digital certificate]]."' },
            { tone: 'care', say: 'Imani, are you all right?', reply: 'Imani: "I am angry. Last month a cleaner let someone follow her into the comms room because he had a toolbox." Ace: "Then the ward gets a user awareness programme, where I send fake emails and phone calls to see who bites, and user training, where everyone sits down for an hour on the rules. The comms room door gets a badge reader. That is physical access control, and it matters as much as any config."' }
          ] } },
        { k: 'LORE', title: 'THE NIGHT THE NET CAUGHT FIRE', year: 1988, real: ['mit', 'cert'], vibe: 'Bogus. One grad student, six thousand boxes, zero chill.',
          text: 'Ace, pulling a pin out of the map and pushing it back in: "On the second of November 1988 a Cornell graduate student named Robert Tappan Morris let a program loose on the internet from a machine at MIT. It was a worm. It got in through holes in sendmail and finger, and it guessed passwords from a list of a few hundred common words. It got onto about six thousand machines, around a tenth of everything connected, in a day. He said he only wanted to measure how big the internet was. That month Carnegie Mellon set up the CERT Coordination Center, the first team whose whole job was answering the phone when this happens, and in 1990 he became the first person convicted under the Computer Fraud and Abuse Act. I keep it for that list of passwords. Half the words on it are still on machines in this district."' },
        { k: 'KIT', text: 'Ace tears the top sheet off her clipboard and writes on the back of it.', real: ['cisco'], kit: [
          { cmd: 'CIA: confidentiality · integrity · availability', what: 'only the right people read it · nobody unauthorised changes it · it works when it is needed' },
          { cmd: 'vulnerability · exploit · threat · mitigation', what: 'the weakness · what can use it · the chance it is used · what protects against it' },
          { cmd: 'DoS · TCP SYN flood · DDoS · DHCP exhaustion', what: 'drown it · half-open handshakes · from many sources · empty the pool with spoofed MACs' },
          { cmd: 'spoofing · reflection · amplification · man-in-the-middle (ARP spoofing) · reconnaissance', what: 'a fake source · the reply hits the victim · a bigger reply · read everything between two hosts · gather information first' },
          { cmd: 'malware: virus · worm · trojan horse', what: 'infects a host program · spreads by itself · disguised as something you wanted' },
          { cmd: 'phishing · spear phishing · whaling · vishing · smishing · watering hole · tailgating', what: 'social engineering' },
          { cmd: 'dictionary · brute force · MFA: know, have, are · digital certificates', what: 'password attacks and what stops them' },
          { cmd: 'AAA: authentication · authorization · accounting · Cisco ISE', what: 'who are you · what may you do · what did you do' },
          { cmd: 'RADIUS: UDP 1812, 1813, open standard · TACACS+: TCP 49, Cisco', what: 'the two AAA protocols' },
          { cmd: 'user awareness · user training · physical access control', what: 'fake phishing to see who bites · formal sessions · badges and locks on the closets' } ] },
        { k: 'SYNC', q: { prompt: 'Imani puts the phone down at last: "So the man on the phone who wanted the router password. What do I write in the incident book?"', opts: ['Vishing', 'Smishing', 'Whaling', 'A watering hole attack'], a: 0,
          yes: 'Ace: "Vishing. Write the time he called, too."', no: 'Ace: "Vishing. Phishing over the phone."',
          why: 'Ace: Vishing is phishing by voice, over the phone. Smishing uses SMS text messages, whaling targets the people at the top of an organisation, and a watering hole attack compromises a website the victims visit.' } }
      ] },

    // ------------------------------------------------------------ night 49 · port security
    { id: 'n49-two-doors', title: 'One face at two doors', sub: 'port security', npc: 'ace', day: [49], src: [PS('Port_Security.md')], unlocks: ['port-security'],
      beats: [
        { k: 'SCENE', where: 'Under the Kabuki market · the switch floor · twenty to midnight',
          lines: [
            { who: 'narr', text: 'The stairs down from the market are tacky with spilled soda, and the heat at the bottom smells of fryer oil and warm plastic. Mac is on his stool by the steel door with the ledger open across his knees, and for once he is not writing. Ace stands behind him reading over his shoulder. Sticky walks the row of numbered slots with her nose an inch from the metal, one slot at a time.' },
            { who: 'mac', text: 'You remember I said I\'d want someone to come and look if a face kept flipping between two slots. The card reader on the pharmacy counter has been on slot 14 since the stall opened. At twenty past ten it turned up on slot 22 as well, and for an hour it flipped between the two every few seconds.' },
            { who: 'mac', text: 'Slot 22 is the spare socket behind the noodle stall. Nothing is supposed to be on it.' },
            { who: 'ace', text: 'Somebody plugged a box in there wearing the card reader\'s MAC address. Every time it spoke, Mac moved the reader\'s line in his book to slot 22, and the payments meant for the pharmacy went to the box until the reader spoke again.' },
            { who: 'mac', text: 'Then at eleven it started throwing faces at me, hundreds of them, all made up. My book only has so many lines. Once it was full I couldn\'t write anyone new down, so I flooded their frames out of every slot, and anyone on the floor could hear the pharmacy.' },
            { who: 'ace', text: 'So we give every slot a limit. [[Port security]] tells a port how many MAC addresses it may learn, one unless you say otherwise, and what to do when one too many turns up. You switch it on with switchport port-security, and only on a port you have set to access or trunk. On a port left to dynamic auto or desirable, the switch refuses the command.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What does the port do when a stranger turns up?', reply: 'Ace: "Whatever the violation mode says. Shutdown, the default, turns the whole port off, sends a log and an SNMP message, and counts the violation. Restrict drops the stranger\'s frames and nothing else, and it still logs and counts. Protect drops them quietly, with no log and no count. I never use protect, because I want the count."' },
            { tone: 'press', say: 'Why not just pull the cable out of slot 22?', reply: 'Ace: "Because tomorrow somebody plugs it back in. The port should know which faces belong on it. You can type them in with switchport port-security mac-address, or let it learn them, and one port can hold a mix of both. Add mac-address sticky and whatever it learns is written into the running-config as if you had typed it. That is Sticky\'s trade, the [[sticky MAC]]."' },
            { tone: 'care', say: 'Mac, how did you catch it?', reply: 'Mac: "The switch wrote it down before I did. There\'s a log message for it, MACFLAP_NOTIF: host such-and-such in VLAN 1 is flapping between port Fa0/14 and port Fa0/22. I read the log every night with my coffee, before the market opens."' }
          ] } },
        { k: 'SCENE', where: 'The Kabuki market · behind the noodle stall · midnight',
          lines: [
            { who: 'narr', text: 'The noodle stall is shut, the shutters down, but the stock pot is still warm and the whole back corner smells of pork bone and scallion. Behind it, taped to the underside of the counter with grey tape, is a black box the size of a cigarette packet. A cable runs from it to the wall socket marked 22, and its one green light flickers without stopping.' },
            { who: 'ace', text: 'Leave it where it is. I want to watch it hit the door.' },
            { who: 'ace', text: 'With the violation left at shutdown, the port goes [[err-disabled]]. It stays dead after the box is gone, until somebody types shutdown and then no shutdown on it. Or the switch can do that itself with errdisable recovery cause psecure-violation. Recovery is off for every cause until you turn it on, and then it waits 300 seconds unless you set another interval.' },
            { who: 'mac', text: 'And the faces a port has learned, how long does it keep them?' },
            { who: 'ace', text: 'Until the aging time runs out, if you set one. The aging type is absolute by default, so a learned face goes when the time is up whatever it is doing. Inactivity waits for the face to go quiet first. Addresses you typed in never age unless you add aging static.' },
            { who: 'you', text: 'And to check what a port is doing?' },
            { who: 'ace', text: 'show port-security for every secure port on the switch, with its maximum, how many faces it holds and its violation count. show port-security interface for one port, with its status. show mac address-table secure for the faces themselves.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What about the desk at stall 7? It has a laptop and a label printer on one socket.', reply: 'Ace: "Then it gets switchport port-security maximum 2. Two faces are allowed and the third is a stranger. Set that one to restrict, so a third face gets dropped and counted and the laptop keeps working while you find out whose it is."' },
            { tone: 'press', say: 'Whoever planted this knew exactly which socket was live.', reply: 'Ace does not look up from the box. "They knew the pharmacy takes cards until two in the morning, and they knew Mac\'s book has an end. That is somebody who has read this floor the way we read it." She writes the box\'s serial number on the back of her hand and says nothing more.' },
            { tone: 'joke', say: 'Does Sticky ever let a face through twice?', reply: 'Sticky yawns. Ace: "She lets through as many as I tell her and remembers the first ones she saw. On a switch that is sticky learning with a maximum. Save the running-config and the sticky faces survive a reboot."' }
          ] } },
        { k: 'LORE', title: 'A BOOK WITH AN END', year: 2000, vibe: 'Wassup. Every switch on the planet just found out its book had an end.',
          text: 'Mac, closing the ledger on his thumb: "In December 2000 a researcher at the University of Michigan called Dug Song put out version 2.3 of dsniff, a free set of tools for watching networks. One of them did to a switch what that box did to my book tonight. It filled the MAC address table with made-up faces until the switch gave up and flooded everything, so a laptop on any port could hear every conversation. Every admin I knew read the list of what it could do and locked their ports down the next week. My old boss pinned the release notes above this stool, and they\'re still there."' },
        { k: 'KIT', text: 'Ace writes the order of work on the inside cover of Mac\'s ledger, and Mac lets her.', real: ['cisco'], kit: [
          { cmd: 'switchport mode access → switchport port-security', what: 'access or trunk only, never dynamic auto or desirable. Default: maximum 1, violation shutdown' },
          { cmd: 'switchport port-security maximum 2', what: 'how many MAC addresses the port may hold' },
          { cmd: 'switchport port-security violation shutdown | restrict | protect', what: 'err-disable, log, count · drop, log, count · drop only' },
          { cmd: 'switchport port-security mac-address 0060.2f11.4a01 · mac-address sticky', what: 'a face typed in · learned faces written into the running-config' },
          { cmd: 'switchport port-security aging time 60 · aging type absolute | inactivity · aging static', what: 'default type absolute; static addresses do not age by default' },
          { cmd: 'shutdown → no shutdown', what: 'brings an err-disabled port back by hand' },
          { cmd: 'errdisable recovery cause psecure-violation · errdisable recovery interval 180', what: 'the switch brings it back itself. Off for every cause by default, 300 seconds' },
          { cmd: 'show port-security · show port-security interface f0/22 · show mac address-table secure · show errdisable recovery', what: 'every secure port · one port · the secure faces · the recovery timers' } ] },
        { k: 'SYNC', q: { prompt: 'Mac, pencil behind his ear: "If I put slot 22 on protect instead, and the box keeps throwing faces all night, does the violation counter go up?"', opts: ['No. Protect drops them without a log or a count', 'Yes, once per face', 'Yes, and then the port err-disables', 'Only if sticky learning is on'], a: 0,
          yes: 'Ace: "No. You would never know it was there."', no: 'Ace: "No. Protect drops quietly. Restrict is the one that drops and counts."',
          why: 'Ace: In protect mode the port drops frames from unknown MAC addresses and does nothing else: no log or SNMP message and no violation count. Restrict drops, logs and counts. Shutdown err-disables the port, logs and counts.' } }
      ] },

    // ------------------------------------------------------------ night 50 · DHCP snooping
    { id: 'n50-a-gateway-nobody-owns', title: 'A gateway nobody owns', sub: 'DHCP snooping', npc: 'ace', day: [50], src: [PS('DHCP_Snooping.md')], unlocks: ['dhcp-snooping'],
      beats: [
        { k: 'SCENE', where: 'The Watson clinic · the nurses\' station · ten past seven in the morning',
          lines: [
            { who: 'narr', text: 'The ward smells of toast from the breakfast trolley and the sharp green of floor cleaner. The day shift is taking over, and half the screens along the nurses\' station show the same grey box: the chart could not be saved. A nurse is copying a drug round onto the back of a printout by hand. Imani stands in the middle of it with her arms folded, and Ace kneels by the nearest PC with Sticky pressed against her leg.' },
            { who: 'Imani', text: 'They were fine at midnight. The day shift switched them on at seven and every one that came up is like this. The ones the night shift never turned off still work.' },
            { who: 'ace', text: 'Look at its lease. The address is from the clinic\'s range, and the gateway is 192.168.44.254. Nothing in this building owns .254. The router is .1.' },
            { who: 'ace', text: 'When a PC starts, it shouts a DHCP Discover to everyone, and it takes the first Offer that comes back. Something on this network answered before the router did, and it handed out a gateway that leads nowhere, or leads to itself. A box that does this is a rogue DHCP server.' },
            { who: 'you', text: 'How do we stop the ward listening to it?' },
            { who: 'ace', text: '[[DHCP snooping]] on the switches. Once it is on, every port is untrusted unless you say so. You trust the ports that lead to the real server, the uplinks, and nothing else. A server message that arrives on an untrusted port gets thrown away before it reaches a single PC.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Which messages count as server messages?', reply: 'Ace: "OFFER, ACK and NAK come from servers. On an untrusted port they are dropped with no further checks. DISCOVER, REQUEST, RELEASE and DECLINE come from clients, so on an untrusted port the switch inspects them instead: the source MAC in the frame has to match the MAC inside the message, and a RELEASE or DECLINE has to come from the port where that lease lives."' },
            { tone: 'press', say: 'Why not find the box and pull it out?', reply: 'Ace: "We will, and then the next one arrives in somebody\'s handbag. Snooping also writes down every lease that goes through it properly: the MAC, the IP, the lease time, the VLAN and the port. That is the DHCP snooping binding table, and tomorrow it is the thing that catches the next trick."' },
            { tone: 'care', say: 'Imani, has anything been lost?', reply: 'Imani: "Nothing yet. The charts are sitting on the PCs waiting to be saved, and the drug round is on paper. The night of the loop we lost nine hours of it and a patient\'s records never came back. I am not doing that again."' }
          ] } },
        { k: 'SCENE', where: 'The Watson clinic · the new wing · above reception · a quarter to eight',
          lines: [
            { who: 'narr', text: 'The new wing still smells of fresh paint and the plastic on the chairs in reception. Ace is up a stepladder with her head through a ceiling tile, and a torch beam moves around in the dark up there. Dust drifts down onto Sticky, who sneezes and does not move from the foot of the ladder.' },
            { who: 'ace', text: 'Here. White plastic, a sticker that says wireless repeater, and a cable running down inside the wall to the corridor switch, which a repeater would never need.' },
            { who: 'narr', text: 'She photographs the serial number twice, then climbs down without touching it.' },
            { who: 'ace', text: 'On each switch, ip dhcp snooping switches it on and ip dhcp snooping vlan 1 says which VLANs it watches. You need both, or it watches nothing. Then ip dhcp snooping trust on each uplink.' },
            { who: 'ace', text: 'There is one trap. A snooping switch writes a note into every client request by default, [[option 82]], the relay agent information: which switch, which port. The clinic\'s router hands out the leases itself, and a Cisco router that gets a request carrying option 82 but no relay address drops it. So on these switches you turn the note off with no ip dhcp snooping information option. A switch that receives option 82 on an untrusted port drops it too.' },
            { who: 'you', text: 'And if the box just floods the switch with Discovers?' },
            { who: 'ace', text: 'That was DHCP exhaustion on my map. ip dhcp snooping limit rate 10 on the access ports. A PC that is booting sends a handful of messages, so ten a second is plenty. Go over the limit and the port goes err-disabled, and errdisable recovery cause dhcp-rate-limit brings it back on its own.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Why does option 82 exist at all?', reply: 'Ace: "For big buildings where the server is far away. The relay agent, the switch or router nearest the client, writes down where the request came in, and the server can hand out addresses by floor or by port. When the server is a router on the same network, the note only gets the request thrown away."' },
            { tone: 'press', say: 'You know whose box this is.', reply: 'Ace wipes the dust off her hands one finger at a time. "I know who had keys to this wing last week. That is a list with more than one name on it, and I will not shorten it by guessing."' },
            { tone: 'joke', say: 'Could we just trust every port and save time?', reply: 'Ace: "Then the switch believes every server it hears, which is what it was doing at seven this morning. Trust goes on the ports that face the real server, and every other port stays untrusted so the snooping can do its job."' }
          ] } },
        { k: 'LORE', title: 'A NOTE IN THE MARGIN', year: 2001, real: ['ietf'], vibe: 'Da bomb. The box in the middle started writing on your mail.',
          text: 'Ace, folding the stepladder: "In January 2001 the IETF published RFC 3046, the DHCP Relay Agent Information Option, written by Michael Patrick. Option 82. Cable companies wanted to know which street a modem was on before they gave it an address, so the box in the middle got to write a note on every request saying where it came from. That note is what our router choked on this morning. I keep it because somebody designed it for a building a hundred times this size, and it still turned up in ours."' },
        { k: 'KIT', text: 'Ace writes it on the back of the photo she took of the serial number.', real: ['cisco'], kit: [
          { cmd: 'ip dhcp snooping · ip dhcp snooping vlan 1', what: 'on for the switch and on for the VLAN. Both are needed' },
          { cmd: 'interface g0/1 → ip dhcp snooping trust', what: 'the uplinks toward the real server. Every port is untrusted by default' },
          { cmd: 'untrusted port: OFFER, ACK, NAK dropped · DISCOVER, REQUEST, RELEASE, DECLINE inspected', what: 'server messages and client messages' },
          { cmd: 'no ip dhcp snooping information option', what: 'stop adding option 82, the relay agent information. A Cisco DHCP server drops it with no relay address' },
          { cmd: 'ip dhcp snooping limit rate 10 · errdisable recovery cause dhcp-rate-limit', what: 'over the rate: err-disabled' },
          { cmd: 'show ip dhcp snooping · show ip dhcp snooping binding', what: 'the settings and trusted ports · every good lease: MAC, IP, lease, VLAN, port' } ] },
        { k: 'SYNC', q: { prompt: 'Imani, watching the screens come back one by one: "So when you switch this snooping on, is the port my PC plugs into trusted or not?"', opts: ['Untrusted, like every port until someone trusts it', 'Trusted, because it is an access port', 'Trusted only after the PC gets a lease', 'Neither until the VLAN is added'], a: 0,
          yes: 'Ace: "Untrusted. Only the uplinks get trusted."', no: 'Ace: "Untrusted. Every port starts untrusted, and I trust the uplinks by hand."',
          why: 'Ace: When DHCP snooping is enabled, every interface is untrusted by default. You configure ip dhcp snooping trust only on the ports that lead toward the legitimate DHCP server, usually the uplinks. Server messages arriving on untrusted ports are discarded.' } }
      ] },

    // ------------------------------------------------------------ night 51 · dynamic ARP inspection, the reveal, Marrow's tab
    { id: 'n51-who-is-asking', title: 'Who is asking', sub: 'dynamic ARP inspection', npc: 'ace', day: [51], src: [PS('Dynamic_Arp_Inspection.md')], unlocks: ['dai'],
      beats: [
        { k: 'SCENE', where: 'The Watson clinic · the comms room · twenty past eleven at night',
          lines: [
            { who: 'narr', text: 'The comms room is warm and dry and loud with fans, and it smells of dust cooking slowly on hot metal. Ace sits cross-legged on the floor in front of the rack with a laptop on her knees. Sticky is asleep across the doorway with one ear up. On the laptop is a printout of an ARP table from the nurses\' station, with one line circled twice in red pen.' },
            { who: 'ace', text: 'The ward PC says the router, 192.168.44.1, is at a MAC address that is not the router\'s. Something on this network has been answering ARP for the gateway with its own face, and every frame the ward sends out goes through it first. That is [[ARP spoofing]], the man in the middle from my map.' },
            { who: 'ace', text: 'Last night I put [[DAI]], dynamic ARP inspection, on the ward switch for one hour, from ten to eleven, and took it off again before anyone noticed. It inspects every ARP message that arrives on an untrusted port. The sender MAC and the sender IP inside it have to match a line in the DHCP snooping binding table, or a line in an ARP ACL, or the message is dropped. Messages on trusted ports are not inspected at all.' },
            { who: 'ace', text: 'At ten to eleven it dropped eight ARP replies that claimed to be 192.168.44.1, all from one MAC, all on port Fa0/14. I followed Fa0/14 back through the patch panel this afternoon.' },
            { who: 'you', text: 'Where does it go?' },
            { who: 'ace', text: 'Conference room B, in the new wing. Halvorsen Consolidated booked it on Tuesday to walk the council through its plans for the Exchange. Come on.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What about the printers? They never ask for a lease.', reply: 'Ace: "That is why I took it off after an hour. A box with a fixed address is not in the binding table, so DAI drops its ARP and it goes dark. You write it an ARP ACL: arp access-list, then permit ip host with its address and mac host with its MAC, and ip arp inspection filter with the list\'s name and the VLAN. DAI checks the ACL first and the binding table after."' },
            { tone: 'press', say: 'Why did the ward lose the router while it was on?', reply: 'Ace: "Because I did not trust the uplink, on purpose, to see who would notice. The router has a fixed address too, and its ARP replies come up the uplink. ip arp inspection trust goes on the uplinks and on links between switches that both run DAI. Then there is ip arp inspection validate src-mac dst-mac ip, which also checks that the MACs in the frame match the MACs inside the ARP, and that the IP addresses make sense."' },
            { tone: 'quiet', say: '(Watch the ARP table on the printout.)', reply: 'You read the circled line again: 192.168.44.1, and a MAC address that belongs to nothing on the clinic\'s inventory. Ace, without looking up: "DAI also counts. An untrusted port may send fifteen ARP packets a second by default, and a port that sends more is err-disabled. ip arp inspection limit rate changes the number, and errdisable recovery cause arp-inspection brings the port back."' }
          ] } },
        { k: 'SCENE', where: 'The new wing · conference room B · a quarter to midnight',
          lines: [
            { who: 'narr', text: 'Conference room B smells of new carpet and cold coffee. Name cards from the afternoon\'s walkthrough still stand along the table, one for each councillor, and a projector hums over a blank screen. A small black box is plugged into the floor socket under the table. At the far end sits a woman in a charcoal coat, her hands folded, a thin silver pin on her lapel. You first saw her at the Seven Bowls, paying for your noodles, and more than once since.' },
            { who: 'vesper', text: 'Ace Elle. I wondered whether you would get here first or the dog would.' },
            { who: 'ace', text: 'Vesper Kade. The market switch that wiped Vee Lan\'s VLANs. The box under the desk at the annex. The roads, the night of Every Road Home. The repeater in the ceiling on Monday. And this one.' },
            { who: 'vesper', text: 'Stress tests. Halvorsen\'s board wanted to know what this district\'s network does when somebody leans on it, and I wanted to know it more than they did.' },
            { who: 'you', text: 'You paid for my bowl at the Seven Bowls.' },
            { who: 'vesper', text: 'Before that, I vouched for you. Dispatch needed a name to take a chance on a new runner, and I gave mine. I wanted somebody fresh off the train to fail in front of the whole street, where the council could watch it happen.' },
            { who: 'vesper', text: 'Part of me hoped you would not. That part has been getting louder since the spring.' },
            { who: 'vesper', text: 'Twenty years ago I was Old Root\'s apprentice in that annex. The night of the loop the clinic went to paper for nine hours, and I carried charts up three floors with Imani. A patient\'s records never came back. I left the street that week, because I had decided it could not keep its own net safe, and I have spent twenty years getting ready to prove it.' },
            { who: 'ace', text: 'Every one of your tests was caught by somebody who lives here, and DAI caught this one in its first hour.' },
            { who: 'vesper', text: 'Then here is the last. Halvorsen inspects the clinic for the council at midnight tomorrow, and every box I have left in this building wakes up at that hour. I cannot stop them without my board asking why, and I will not. If the clinic keeps answering its own patients through all of it, I will tell the council so myself.' },
            { who: 'narr', text: 'She stands, takes the name card with her own name on it from the end of the table, and leaves the box where it is. Sticky watches her all the way to the lift and does not lie down until the doors close.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Does Old Root know?', reply: 'Vesper, at the door: "He guessed years ago. He never said a word to me about it, which is how he says most things." She presses the call button. "He taught me that DAI is only as good as the binding table under it. With snooping switched off, it has nothing to check against."' },
            { tone: 'press', say: 'Unplug your boxes tonight.', reply: 'Vesper: "Then the council hears that Halvorsen found holes, and nobody ever sees them closed. Your trusted ports, your ARP lists for the printers, your snooping and your limits all have to be in place by midnight tomorrow, and they have to hold while everything I left behind is talking at once. You want that inspection as much as I do."' },
            { tone: 'care', say: 'The patient whose records were lost. Who were they?', reply: 'She is quiet for a long time. "A boy of nine with a bad heart. His notes were rebuilt from memory by three nurses over a month, and they got most of it right. Imani remembers his name. I made myself forget it, and I have been sorry for that ever since."' }
          ] } },
        { k: 'LORE', title: 'SEVENTY-FIVE CENTS', year: 1986, real: ['lbl'], vibe: 'Gnarly. A stranger on the mainframe and a printout as long as a hallway.',
          text: 'Ace, on the stairs down from the new wing: "In August 1986 an astronomer called Clifford Stoll was running the computers at Lawrence Berkeley Laboratory, and the accounts came out seventy-five cents short. Everyone else would have rounded it off. He followed it instead, for ten months, printing every keystroke the intruder typed, until the trail ended at a man called Markus Hess in Hanover, West Germany, who was selling what he found to the KGB. Stoll wrote it all down in a book called The Cuckoo\'s Egg in 1989. I keep it for the seventy-five cents. Mine was one face at two doors in Mac\'s ledger."' },
        { k: 'KIT', text: 'Ace writes it on the back of the councillor\'s name card nobody came to collect.', real: ['cisco'], kit: [
          { cmd: 'ip arp inspection vlan 1', what: 'DAI on for VLAN 1. It checks ARP sender MAC and sender IP against the DHCP snooping binding table and ARP ACLs' },
          { cmd: 'interface g0/1 → ip arp inspection trust', what: 'uplinks and links to other DAI switches. Every port is untrusted by default; trusted ports are not inspected' },
          { cmd: 'arp access-list PRINTERS → permit ip host 192.168.44.30 mac host 0050.7966.4430', what: 'an ARP ACL for a box with a fixed address' },
          { cmd: 'ip arp inspection filter PRINTERS vlan 1', what: 'apply the ARP ACL to DAI for the VLAN' },
          { cmd: 'ip arp inspection validate src-mac dst-mac ip', what: 'extra checks: frame MACs against ARP MACs, and sane IP addresses' },
          { cmd: 'ip arp inspection limit rate 25 · errdisable recovery cause arp-inspection', what: 'default 15 packets per second on untrusted ports. Over it: err-disabled' },
          { cmd: 'show ip arp inspection · show ip arp inspection interfaces', what: 'settings, counts and drops · trust state and rate per port' } ] },
        { k: 'SYNC', q: { prompt: 'Imani, by the printer at the nurses\' station: "This one has a fixed address and never asks anyone for a lease. When you switch DAI on, does it still work?"', opts: ['Only if an ARP ACL permits its address and MAC, or its port is trusted', 'Yes, DAI only checks boxes that lease', 'Yes, because printers do not use ARP', 'No, never. It needs a lease'], a: 0,
          yes: 'Ace: "Only with an ARP ACL. I will write it one tonight."', no: 'Ace: "Only if an ARP ACL lets it through. It is not in the binding table."',
          why: 'Ace: DAI checks the sender MAC and sender IP of every ARP message on an untrusted port against ARP ACLs and the DHCP snooping binding table. A host with a static address never leased, so it is not in the binding table, and its ARP is dropped unless an ARP ACL applied with ip arp inspection filter permits it, or its port is trusted.' } },
        { k: 'SCENE', where: 'Under the overpass · Marrow\'s stall · half past one',
          lines: [
            { who: 'narr', text: 'Rain comes off the overpass in long ropes and hisses where it hits the lamp over the stall. The stall smells of bone broth, star anise and wet cardboard. Marrow is wiping the counter with a rag that has seen better decades, and he puts a bowl down in front of you before you have finished sitting.' },
            { who: 'marrow', text: 'Dispatch says you are in the clinic tomorrow at midnight with the council watching. You have the face of somebody who is planning to go in on nothing. Eat.' },
            { who: 'marrow', text: 'I ran, you know, before Dispatch had the booth. I was quick and I was broke, and I owed money to people who do not send reminders. One night I went into a dive two days without food, because I could not make myself ask anyone for a bowl.' },
            { who: 'marrow', text: 'I flatlined about forty minutes in. The ripperdoc two doors down had me back inside four minutes, and my hands have shaken ever since. You cannot run a deck with hands like these.' },
            { who: 'marrow', text: 'The man who had this stall fed me for a month and never wrote any of it down. When he retired he left me the pots, so now there is a tab. I am not kind about it.' }
          ],
          choice: { opts: [
            { tone: 'care', say: 'Why tell me tonight?', reply: 'Marrow: "Because tomorrow is the kind of dive people go into hungry to prove a point. There is no fixer in a room like that. Eat first. The clinic can wait twenty minutes for you, and it will get a better runner."' },
            { tone: 'ask', say: 'Did you ever go back in?', reply: 'Marrow turns the ladle over in his hand. "Once, a year after, to see if the shaking stopped when I was jacked in. It did not. I came out, bought the pots a new lid, and I have been standing here ever since."' },
            { tone: 'joke', say: 'Is this one on the tab?', reply: 'Marrow: "You have creds, so this one is twelve. The change goes toward the next kid who comes in without any." He does not smile, but he tops up the bowl.' }
          ] } }
      ] }
  ] });
})();
