/* Stage 6 · The Services — DNS, DHCP, NTP and the rest. Framework stub: one intro level. */
(function(){
  const { PS, SJ } = SRC;
  STAGES.push({ id: 'services', arc: 'grid', title: 'STAGE 6 · THE SERVICES', sub: 'TCP/UDP, IPv6, DNS, DHCP, NAT, SSH', npc: 'denise', status: 'live', levels: [
    { id: 'denise-intro', title: 'Names, leases, one clock', sub: 'DNS, DHCP, NTP', npc: 'denise', day: [37,38,39], src: [PS('DNS.md'), PS('DHCP.md'), PS('NTP.md'), SJ('27 - Day 38 - DNS.md')], unlocks: ['dhcp'],
      beats: [
        { k: 'SCENE', where: 'The exchange · a room of switchboards · a wall clock everyone keeps looking at',
          lines: [
            { who: 'denise', text: 'Operator. Three jobs in this room. You give me a name, I give you a number. That is [[DNS]]. You arrive with no number, my intern Dora leases you one. Discover, Offer, Request, Acknowledge. That is [[DHCP]]. And everyone sets their watch by that clock, because a log with the wrong time is a story, not evidence. That is [[NTP]].' },
            { who: 'you', text: 'What does a lease actually give me?' },
            { who: 'denise', text: 'An address, a mask, a gateway, a DNS server, and a time limit. When the limit is half gone you ask to renew. If Dora is on another floor, the router forwards your shout to her. That is a [[DHCP relay]].' }
          ],
          choice: { opts: [
            { say: 'What happens when DNS goes down?', reply: '"Everything still works and nobody can use it. On 21 October 2016 a botnet called Mirai, built from cameras with default passwords, flooded a DNS provider called Dyn. Half the sites in the country forgot their own names for a morning. The servers were fine. Nobody could find them."' },
            { say: 'Why does the clock matter so much?', reply: '"Because when something goes wrong you line up logs from five machines. If their clocks disagree by four minutes, you cannot tell what happened first. NTP is from 1985, David Mills. Stratum 0 is an atomic clock. Everyone syncs downward from there."' }
          ] } },
        { k: 'LORE', title: 'ONE FILE FOR THE WHOLE WORLD', year: 1983, vibe: 'Totally rad, totally doomed. Everybody downloaded the same list.', text: 'Denise: "Before DNS there was one text file, HOSTS.TXT, kept at SRI by Elizabeth Feinler\'s team, and every computer on the network downloaded it. Paul Mockapetris replaced it in 1983 with a system where nobody holds the whole list. That is the one you use."' },
        { k: 'KIT', text: 'A card from the switchboard drawer.', kit: [ { cmd: 'ip dhcp excluded-address 10.0.0.1 10.0.0.10 → ip dhcp pool LAN → network 10.0.0.0 255.255.255.0 → default-router 10.0.0.1 → dns-server 8.8.8.8', what: 'a router as the DHCP server' }, { cmd: 'ip helper-address 10.0.9.5', what: 'DHCP relay on the LAN interface' }, { cmd: 'ntp server 10.0.9.9 · show ntp status', what: 'time' } ] },
        { k: 'SYNC', q: { prompt: 'Dora, nervous: "Four messages in a lease. What order?"', opts: ['Offer, Discover, Request, Ack', 'Discover, Offer, Request, Ack', 'Request, Offer, Discover, Ack', 'Discover, Request, Offer, Ack'], a: 1, yes: 'Denise: "DORA. She will remember it now."', no: 'Denise: "Discover, Offer, Request, Acknowledge. The client shouts first."' , why: 'Denise: The client shouts Discover. The server answers Offer. The client says Request, I want that one. The server says Acknowledge, it is yours. D, O, R, A. Dora.' } }
      ] },

    // ------------------------------------------------------------ night 43 · FTP and TFTP
    { id: 'n43-the-image', title: 'Ninety-seven million bytes', sub: 'FTP and TFTP', npc: 'shell', day: [43], src: [PS('FTP_and_TFTP.md')], unlocks: ['ftp-tftp'],
      beats: [
        { k: 'SCENE', where: 'The exchange hall · Shell\'s lock bench · twenty past one',
          lines: [
            { who: 'narr', text: 'The lock bench at the back of the exchange hall smells of machine oil and brass filings, and the key-cutting wheel is still spinning down when you arrive. Shell has his hood up. Beside a tray of key blanks sits a laptop with one file on its screen, ninety-seven million bytes long, and a printed advisory with one paragraph circled in pencil.' },
            { who: 'shell', text: 'The clinic\'s two routers are running an image with a hole in it, and the vendor closed the hole in this one. Tonight it goes onto both of them. I want you to see what the file passes on the way.' },
            { who: 'shell', text: 'The routers can fetch it two ways. [[TFTP]], trivial file transfer, listens on UDP port 69. It has no username, no password and no encryption, so anyone who can reach the server can take any file on it, and anyone on the wire can read the file going past.' },
            { who: 'you', text: 'And the other way?' },
            { who: 'shell', text: '[[FTP]]. It asks for a username and a password, so the server knows who is taking what. Then it sends them across the wire in cleartext, like everything else it sends. I changed every lock in this district after a password was read off a wire, and FTP would have handed that one over just the same.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'How does TFTP know the file arrived whole?', reply: 'Shell: "It takes turns. The server sends one block and waits until the client acknowledges it, then sends the next. That is lock-step. It runs over UDP, which checks nothing, so it does its own checking that way. The first request goes to port 69, and after that both ends talk from random ports called TIDs, transfer IDs. Connection, data transfer, termination, and it is done."' },
            { tone: 'press', say: 'Why not carry it over on a stick?', reply: 'Shell: "Because the routers are locked in a cabinet two floors under the ward, and a stick in a pocket goes missing. The file goes over the wire. What I choose is who can reach the server while it does, and tonight that is the two routers and nobody else."' },
            { tone: 'quiet', say: '(Watch him file the key.)', reply: 'He files three strokes, holds the blank up to the lamp, files one more. "FTP opens two connections. Control on TCP port 21, where the login and the commands go. Data on TCP port 20, where the file goes. TFTP has one conversation and no login at all."' }
          ] } },
        { k: 'SCENE', where: 'The Watson clinic · the basement comms room · five past two', real: ['cisco'],
          lines: [
            { who: 'narr', text: 'The clinic basement is cold and dry, and the air conditioner ticks each time it cycles. Two routers sit in a locked cabinet, with the grey image server on the shelf below them, all three plugged into one small switch with no other cables in it. Shell opens the cabinet with a key from his own ring.' },
            { who: 'shell', text: 'A router keeps files in more than one place, and IOS calls each place a file system. Flash holds the images, and its type is disk. NVRAM holds the startup-config, and its type is nvram. tftp: and ftp: are servers somewhere else on the network, and their type is network. The rest are opaque, things the box keeps for itself.' },
            { who: 'shell', text: 'show flash tells you what is in flash and how much room is left. Once the new file is in, boot system tells the router which image to load the next time it starts, and you save that line like any other. It keeps running the old image until it restarts.' },
            { who: 'you', text: 'When does it restart?' },
            { who: 'shell', text: 'Four in the morning, when the ward is quietest. Imani has already told the night shift.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Which FTP mode will the routers use?', reply: 'Shell: "Passive, because I set the server up that way. In active mode the client opens the control connection and the server opens the data connection back to the client. In passive mode the client opens both. A firewall in front of the client drops a connection that starts from outside, so passive gets through where active does not."' },
            { tone: 'press', say: 'If FTP leaks the password, why use it at all?', reply: 'Shell: "Because TFTP has no password to leak, and the second router is on a switch the cleaners can reach. FTP at least makes the server ask who is taking the file. The routers get a login that opens nothing else, and I delete it before I leave. FTPS is FTP with encryption on top, and this server is too old to speak it."' },
            { tone: 'care', say: 'Will the ward phones drop at four?', reply: 'Shell: "For a few minutes, because they ride on these routers. Imani asked for five minutes\' warning and a runner on the ward while it happens. That can be you, if you want it."' }
          ] } },
        { k: 'LORE', title: 'A LOGIN IN THE CLEAR', year: 1971, real: ['mit'], vibe: 'Groovy. A handful of computers, and every one of them trusted the rest.',
          text: 'Shell, locking the cabinet again: "On the sixteenth of April 1971 a student at MIT called Abhay Bhushan published RFC 114, the first file transfer protocol for the ARPANET. The network was a handful of universities and labs, run by people who knew each other, so the password went across in plain text because nobody on the wire was a stranger. The protocol grew up, and the plain text came with it. I keep this one for the part about strangers."' },
        { k: 'KIT', text: 'Shell writes the order of work on the back of the advisory.', kit: [
          { cmd: 'TFTP · UDP 69', what: 'no login, no encryption. Lock-step: one block, one acknowledgement. Random ports (TIDs) after the first request' },
          { cmd: 'FTP · TCP 21 control · TCP 20 data', what: 'username and password, sent in cleartext. FTPS adds encryption' },
          { cmd: 'FTP active · passive', what: 'active: the server opens the data connection. Passive: the client opens it' },
          { cmd: 'show flash · show file systems', what: 'flash: is disk, nvram: is nvram, tftp: and ftp: are network, system: is opaque' },
          { cmd: 'copy tftp: flash:', what: 'asks for the server, the source file and the destination name' },
          { cmd: 'ip ftp username NAME · ip ftp password PASS · copy ftp: flash:', what: 'FTP needs the login set first' },
          { cmd: 'boot system flash:FILE · write memory', what: 'load that image at the next restart' } ] },
        { k: 'SYNC', q: { prompt: 'Imani, the ward phone against her shoulder: "The file goes over TFTP. Could somebody on the ward read it going past?"', opts: ['Yes. TFTP has no encryption', 'No. UDP port 69 is encrypted', 'Only if they know the TFTP password', 'No. TFTP never leaves the router'], a: 0,
          yes: 'Shell: "Yes. That is why the switch it crosses has no other cables in it tonight."', no: 'Shell: "Yes. TFTP has no password and no encryption."',
          why: 'Shell: TFTP, on UDP port 69, has no login and no encryption. Anyone who can see the traffic can read the file, and anyone who can reach the server can take any file on it. The only protection is keeping everyone else off the network it crosses.' } }
      ] },

    // ------------------------------------------------------------ night 44 · NAT, part 1
    { id: 'n44-one-face', title: 'A face the street has seen', sub: 'NAT, part 1', npc: 'nat', day: [44], src: [PS('Network_Address_Translation_Part1.md')], unlocks: ['nat-static'],
      beats: [
        { k: 'SCENE', where: 'The exchange hall · Nat\'s mask stall · half past nine',
          lines: [
            { who: 'narr', text: 'Nat\'s stall is warm from a heat lamp clamped to the awning, and it smells of lacquer and new rubber. Masks hang in rows on brass hooks, most of them chrome, and a desk fan turns slowly under them so they nod at you as you come up. Nat is painting an eyebrow onto a blank with a brush the width of a hair.' },
            { who: 'nat', text: 'Dispatch says the clinic wants a face on the street. Sit. Every machine in that building has a private address, 192.168 and something. RFC 1918 set aside three blocks that any building may use: 10.0.0.0/8, 172.16.0.0/12 and 192.168.0.0/16. Because everybody uses them, the internet will not carry them anywhere.' },
            { who: 'you', text: 'Then how does the clinic reach anything outside?' },
            { who: 'nat', text: 'It wears a mask. The router on the edge swaps the private source address for a public one on the way out and swaps it back on the way in. That is [[NAT]]. A [[static NAT]] mapping ties one private address to one public address for good, so the street can find it from outside, and that is what the clinic\'s new appointment server needs.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What are the four addresses people talk about?', reply: 'Nat: "Inside is the clinic\'s host, outside is whoever it talks to. Local is how an address looks from inside, global is how it looks from outside. The server\'s 192.168 address is its [[inside local]], its public address is its [[inside global]]. The far end\'s real address is its [[outside global]], and when you only translate the source, its [[outside local]] is the same number."' },
            { tone: 'press', say: 'A mask is a lie. Why does anyone trust it?', reply: 'Nat, still painting: "Because it was only meant to last a year or two. NAT was written down in 1994 to buy time until everybody moved to a bigger address space. Sixx has been waiting for that move since 1998, and meanwhile every building in Watson wears one of my masks."' },
            { tone: 'joke', say: 'Do you have one in my size?', reply: 'Nat laughs without looking up. "The clinic\'s provider gave it a /29, eight public addresses from 203.0.113.0 to 203.0.113.7. The first is the network and the last is the broadcast, the provider\'s router has .1 and the clinic\'s router has .2. That leaves four, and I am not wasting one on you."' }
          ] } },
        { k: 'SCENE', where: 'The Watson clinic · the comms room · eleven at night', real: ['cisco'],
          lines: [
            { who: 'narr', text: 'The comms room hums with fans and carries the dry heat of a rack that runs day and night. The new wing\'s appointment server stands on the floor still half in its shrink-wrap, a sticker on the side reading 192.168.44.10. Nat sets a tackle box of masks on top of it, opens the lid and takes nothing out.' },
            { who: 'nat', text: 'First the router has to know which side is which. ip nat inside on the interface toward the clinic, ip nat outside on the interface toward the provider. Then the mapping itself: ip nat inside source static, the private address, then the public one.' },
            { who: 'nat', text: 'show ip nat translations prints the table. A static mapping sits in it all the time, whether anyone is talking or not, and every conversation through the router adds a line with the far end\'s address. clear ip nat translation * wipes the conversations and leaves the static mappings, because those live in the config.' },
            { who: 'you', text: 'And show ip nat statistics?' },
            { who: 'nat', text: 'How many translations are live, and which interfaces are inside and outside. It is the first thing I read when somebody says NAT is broken, because half the time one interface has neither.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Who can reach the server once it has a public face?', reply: 'Nat: "Anyone on the internet who knows the address, from the first minute. A static mapping works in both directions, which is why a server gets one and a nurse\'s PC mostly does not need one. Ace will want her list in front of it before long."' },
            { tone: 'press', say: 'Why not give every PC a static mapping?', reply: 'Nat: "Four public addresses and forty PCs. Static is one to one, so it runs out at four. Come back tomorrow night and I will show you how the rest of them share a face."' },
            { tone: 'care', say: 'Is the new wing opening soon?', reply: 'Nat: "On Opening Night, the same night the council votes on the Exchange. An appointment page that answers from the street is one small thing the district can point at when Halvorsen says we cannot run our own net."' }
          ] } },
        { k: 'LORE', title: 'A SHORT-TERM SOLUTION', year: 1994, real: ['ietf'], vibe: 'All that and a bag of chips. A quick fix nobody planned to keep.',
          text: 'Nat, closing the tackle box: "In May 1994 Kjeld Egevang and Paul Francis published RFC 1631, the IP Network Address Translator. They called it a short-term solution, something to hold the address space together until a bigger one arrived. It is in every building on this street. I keep this one on the stall because every temporary fix I have ever sold is still out there working."' },
        { k: 'KIT', text: 'Nat writes the job inside the lid of the tackle box.', kit: [
          { cmd: 'RFC 1918: 10.0.0.0/8 · 172.16.0.0/12 · 192.168.0.0/16', what: 'private addresses. The internet does not route them' },
          { cmd: 'interface g0/0 → ip nat inside · interface g0/1 → ip nat outside', what: 'which side is which' },
          { cmd: 'ip nat inside source static 192.168.44.10 203.0.113.3', what: 'static NAT: inside local to inside global, one to one, both directions' },
          { cmd: 'show ip nat translations · show ip nat statistics', what: 'the table · the counts and the inside and outside interfaces' },
          { cmd: 'clear ip nat translation *', what: 'clears the dynamic entries. Static mappings stay' },
          { cmd: 'inside local · inside global · outside local · outside global', what: 'inside or outside: whose host. Local or global: seen from which side' } ] },
        { k: 'SYNC', q: { prompt: 'Dora, passing the stall with a stack of lease cards: "The appointment server is 192.168.44.10 inside and 203.0.113.3 on the street. Which one is its inside global?"', opts: ['203.0.113.3', '192.168.44.10', '203.0.113.2', '8.8.8.8'], a: 0,
          yes: 'Nat: "The street address. She has it."', no: 'Nat: "203.0.113.3. Inside global is the inside host as the outside sees it."',
          why: 'Nat: Inside means the clinic\'s own host, and global means how it looks from outside, so the inside global is the public address the street sees, 203.0.113.3. The private 192.168.44.10 is its inside local. 203.0.113.2 is the router\'s own outside interface.' } }
      ] },

    // ------------------------------------------------------------ night 45 · NAT, part 2
    { id: 'n45-many-faces', title: 'Eleven things and one address', sub: 'NAT, part 2', npc: 'nat', day: [45], src: [PS('Network_Address_Translation_Part2.md')], unlocks: ['nat-dynamic'],
      beats: [
        { k: 'SCENE', where: 'The exchange hall · Nat\'s mask stall · nine at night',
          lines: [
            { who: 'narr', text: 'The heat lamp is on again and the masks nod on their hooks. Pinned to the front of the stall, under a strip of tape, is a note from the clinic\'s records clerk in careful handwriting: When is it my turn? Nat has drawn a small mask in the corner of it.' },
            { who: 'nat', text: 'The clinic has two public addresses left, .5 and .6, and forty machines that want them. So we stop mapping by hand. With dynamic NAT the router keeps a pool of public addresses and hands one to each inside host the first time it goes out, one to one, until the pool is empty.' },
            { who: 'nat', text: 'An access list tells the router whose traffic to translate. If the list permits the source, the router translates it. If the list denies it, the router sends it on untranslated, and it does not drop it. The list chooses who gets a mask, and that is all it does here.' },
            { who: 'you', text: 'And when the pool is empty?' },
            { who: 'nat', text: 'The next machine that needs a mask gets nothing, and the router drops its packet. The address stays with whoever has it until the translation times out or somebody clears it.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'How do I tell the router what is in the pool?', reply: 'Nat: "ip nat pool, a name, the first address and the last, then either prefix-length 29 or netmask 255.255.255.248. Then ip nat inside source list 1 pool and the name. The router does the mapping from there."' },
            { tone: 'press', say: 'Two addresses for forty machines is never going to work.', reply: 'Nat: "Not one to one. So tonight we make it many to one. The router can put a whole crew behind one mask and tell them apart by port. Come and eat, I will show you a bar that has done it for years."' },
            { tone: 'care', say: 'Did the clerk get her prescriptions through?', reply: 'Nat: "She phoned them in, like every morning for a year. Tonight she gets a mask, and so do the two receptionists, and they will all have to share it."' }
          ] } },
        { k: 'SCENE', where: 'Kabuki · the Seven Bowls noodle bar · half past ten',
          lines: [
            { who: 'narr', text: 'Steam rolls off the pots and fogs the window, and the air is thick with star anise and scallion. Ladles clatter against steel. Order tablets are clipped along the wall above eight stools, and above the fridge, beside a lucky cat, sits a small router with a label in Ma Tsai\'s handwriting.' },
            { who: 'Ma Tsai', text: 'You are the one who named my router. Now I have eleven things on it, the tablets, the till, the card machine, my phone, and my provider gives me one address.' },
            { who: 'nat', text: 'And all eleven get out, because the router tells them apart by port. That is [[PAT]], port address translation, and people call it NAT overload. Every tablet goes out as the same public address with its own source port, and the router remembers which port belongs to which tablet.' },
            { who: 'you', text: 'How many can share one address?' },
            { who: 'nat', text: 'There are sixty-five thousand ports, so thousands. On her router it is one line: ip nat inside source list 1 interface g0/1 overload. The list picks who gets translated and the interface says to use the router\'s own public address. At the clinic you will name the pool instead of the interface and put overload on the end.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Why not use PAT for everything?', reply: 'Nat: "For going out, you nearly always do, because it saves the most addresses. It only works for conversations started from inside, though. A stranger on the street cannot start a conversation with one of these tablets, because the router has no idea which tablet he wants. That is what static NAT is for."' },
            { tone: 'care', say: 'Does the bank mind that everything shares one address?', reply: 'Ma Tsai: "The bank asked me once which address the card machine uses, and I read them the one on the sticker. They were happy. Nobody outside can tell the till from my phone."' },
            { tone: 'joke', say: 'Can I get a bowl while we are here?', reply: 'Ma Tsai sets one down in front of you before you finish asking. "Nat eats here every Thursday and still has not paid for the first bowl." Nat, not looking up: "It was a temporary arrangement."' }
          ] } },
        { k: 'LORE', title: 'THREE BLOCKS FOR EVERYONE', year: 1996, real: ['ietf'], vibe: 'Da bomb. Every office got its own little internet behind one door.',
          text: 'Nat, between mouthfuls: "In February 1996 the IETF published RFC 1918, Address Allocation for Private Internets, by Rekhter, Moskowitz, Karrenberg, de Groot and Lear. It set aside the three private blocks so every company could number its own machines however it liked, as long as none of those numbers ever went out on the internet. Put that next to NAT and you get this bar: eleven private faces and one public one. I keep it because it made my trade."' },
        { k: 'KIT', text: 'Nat writes on the back of Ma Tsai\'s menu, under the specials.', kit: [
          { cmd: 'access-list 1 permit 192.168.44.0 0.0.0.255', what: 'whose traffic gets translated. Denied traffic goes out untranslated, not dropped' },
          { cmd: 'ip nat pool CLINIC 203.0.113.5 203.0.113.6 prefix-length 29', what: 'the public addresses to hand out (or netmask 255.255.255.248)' },
          { cmd: 'ip nat inside source list 1 pool CLINIC', what: 'dynamic NAT: the router makes one-to-one mappings itself. Pool empty: the packet is dropped' },
          { cmd: 'ip nat inside source list 1 pool CLINIC overload', what: 'PAT on a pool' },
          { cmd: 'ip nat inside source list 1 interface g0/1 overload', what: 'PAT on the router\'s own public address' },
          { cmd: 'PAT · NAT overload', what: 'many inside addresses on one inside global, told apart by port. Saves the most public addresses' } ] },
        { k: 'SYNC', q: { prompt: 'Ma Tsai, wiping the counter: "The card machine, the tablets and my phone all go out on one address. What do you call that?"', opts: ['PAT, or NAT overload', 'Static NAT', 'Dynamic NAT from a pool', 'A private address'], a: 0,
          yes: 'Nat: "Overload. She has been running it for years without knowing the name."', no: 'Nat: "PAT. Many inside addresses, one global address, told apart by port."',
          why: 'Nat: When many inside hosts share one inside global address at the same time, the router tells their conversations apart by source port. That is PAT, port address translation, also called NAT overload. Static NAT and dynamic NAT are both one to one.' } }
      ] }
  ] });
})();
