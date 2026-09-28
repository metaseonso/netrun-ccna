/* Stage 7 · The Ice — security fundamentals, ACLs, port security. Framework stub: one intro level. */
(function(){
  const { PS, SJ } = SRC;
  STAGES.push({ id: 'ice', arc: 'grid', title: 'STAGE 7 · THE ICE', sub: 'security fundamentals, ACLs, port security, snooping', npc: 'ace', status: 'live', levels: [
    { id: 'ace-intro', title: 'Top to bottom, once', sub: 'ACLs, port security, DHCP snooping, DAI', npc: 'ace', day: [34,35,48,49,50], src: [PS('Standard_Access_Control_Lists.md'), PS('Port_Security.md'), PS('DHCP_Snooping.md'), SJ('23 - Day 34 - Standard ACLs.md')], unlocks: ['acl-standard', 'port-security'],
      beats: [
        { k: 'SCENE', where: 'A gate on the corpo side of Watson · a clipboard · a dog',
          lines: [
            { who: 'narr', text: 'A woman with short red hair and a scar reads from a list. A brown dog sits beside her and watches your hands.' },
            { who: 'ace', text: 'This is an [[ACL]]. A list of rules. I read it from the top. The first line that matches you, I do what it says and I stop reading. If I get to the bottom and nothing matched, you do not get in. That last rule is not written down. It is always there. [[Implicit deny]].' },
            { who: 'you', text: 'So the order of the list matters.' },
            { who: 'ace', text: 'The order is the list. Put the permit above the deny and the deny never runs. I will not explain that twice.' }
          ],
          choice: { opts: [
            { say: 'What does the dog do?', reply: '"Sticky works the switch ports. [[Port security]]. She learns the first face that shows up on a port and keeps it. [[Sticky MAC]]. Second face on the same port, she does what I told her: shut it, drop the stranger, or drop and count. Do not pet her."' },
            { say: 'Where does a list like this go?', reply: '"A standard list only looks at where you came from, so it goes close to where you are going. An extended list looks at source, destination and port, so it goes close to where you started. Inbound or outbound on an interface. The list does nothing until it is applied."' }
          ] } },
        { k: 'LORE', title: 'THE NIGHT THE NET CAUGHT FIRE', year: 1988, vibe: 'Bogus. One grad student, six thousand boxes, zero chill.', text: 'Ace Elle, not looking up from the clipboard: "On 2 November 1988 a graduate student named Robert Morris released a worm that hit about a tenth of the machines on the internet in a day. First conviction under the computer fraud law. The CERT coordination centre was set up because of it. Every list I read is a descendant of that night."' },
        { k: 'KIT', text: 'A page off the clipboard.', kit: [ { cmd: 'access-list 10 deny 192.168.2.0 0.0.0.255 → access-list 10 permit any', what: 'a standard numbered list with a [[wildcard mask]]' }, { cmd: 'interface g0/2 → ip access-group 10 out', what: 'apply it, close to the destination' }, { cmd: 'switchport port-security → maximum 2 → violation restrict → mac-address sticky', what: 'Sticky\'s instructions' } ] },
        { k: 'SYNC', q: { prompt: 'Ace Elle: "Packet reaches the end of my list. No line matched. What happens?"', opts: ['It is permitted', 'It is dropped by the implicit deny', 'It is logged and permitted', 'It goes back to the top'], a: 1, yes: '"Dropped. Nobody wrote that rule. Nobody has to."', no: '"Implicit deny. If nothing matched, it does not get in."' , why: 'Ace Elle: Every list ends with a rule nobody types: deny everything else. If a packet reaches the bottom without matching a line, that hidden rule drops it. Implicit deny.' } }
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
      ] }
  ] });
})();
