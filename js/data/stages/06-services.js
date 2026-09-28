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
    // ------------------------------------------------------------ night 30 · TCP and UDP
    { id: 'n30-twins', title: 'Two couriers, one parcel', sub: 'TCP and UDP: the handshake, ports, reliability', npc: 'syn', day: [30], src: [PS('TCP_and_UDP.md')], unlocks: ['tcp-udp'],
      beats: [
        { k: 'SCENE', where: 'The exchange hall · the courier desk · Monday, 09:00',
          lines: [
            { who: 'narr', text: 'The exchange hall is loud before you are through the doors: a hundred conversations under a glass roof, phones ringing, the thump of rubber stamps. It smells of wet umbrellas and toner. Osi Sevenfold is waiting by a desk under a sign that says COURIERS, clipboard against her chest, and behind the desk two young women with the same face are sorting parcels at twice the speed of anyone else in the hall.' },
            { who: 'osi', text: 'My two best couriers, on loan to the exchange. Syn and Ack. They\'ll tell you how a parcel gets somewhere and how you know it arrived, which is not the same question.' },
            { who: 'syn', text: 'Every delivery starts with a knock. I knock, that\'s a SYN. She answers and knocks back, that\'s a SYN-ACK. I answer her knock, that\'s an ACK, and now we\'re connected.' },
            { who: 'Ack', text: 'The [[three-way handshake]]. Nothing gets handed over until all three have happened.' },
            { who: 'syn', text: 'That\'s [[TCP]], Transmission Control Protocol. Connection-oriented. Every segment gets a sequence number, and every sequence number gets acknowledged, so anything lost gets sent again and everything arrives in order. It\'s reliable, it recovers from errors, and it controls the flow.' },
            { who: 'syn', text: 'Every connection in the corp towers downtown opens with these same three messages, SYN, SYN-ACK, ACK, billions of times a second.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'How does she tell you what she\'s got so far?', reply: 'Ack: "I tell her the number of the next segment I expect. That\'s a forward acknowledgement: if I say 12, I\'ve got everything up to 11. And the window size field in the header says how much she can send before she waits for me. We grow it while things go well and shrink it when they don\'t, a sliding window. That\'s flow control."' },
            { tone: 'press', say: 'All that knocking must slow you down.', reply: 'Syn: "It does. That\'s why the other courier exists." She nods across the hall at a lad on a bike throwing envelopes onto desks without stopping. "[[UDP]]. User Datagram Protocol. No handshake, no numbers, no receipts. Less overhead, and faster, and if one goes in a puddle, nobody resends it."' },
            { tone: 'quiet', say: '(Watch the twins hand a parcel across the desk.)', reply: 'Syn slides the parcel over and says "FIN." Ack signs for it: "ACK." Ack pushes the pen back: "FIN." Syn takes it: "ACK." They let go of the parcel at the same moment. "Four messages to end it," Syn says. "Each side says it\'s done, and each side hears the other say it."' }
          ] } },
        { k: 'SCENE', where: 'The courier desk · the pigeonholes · 09:40',
          lines: [
            { who: 'narr', text: 'The wall behind the desk is a grid of wooden pigeonholes, each with a number painted on it in white. Ack runs her finger along the row as if she is counting them twice.' },
            { who: 'Ack', text: 'The address on a parcel gets it to the right building. The pigeonhole gets it to the right person inside. A [[port number]] is the pigeonhole: the Layer 4 address that says which application gets the data.' },
            { who: 'syn', text: 'The destination port names the service: 80 is HTTP, 443 HTTPS, 22 SSH, 23 Telnet, 25 SMTP, 110 POP3, 20 and 21 FTP data and control, all TCP. DHCP is UDP 67 for the server and 68 for the client, TFTP is UDP 69, SNMP UDP 161 and 162, syslog UDP 514. DNS uses 53, on both.' },
            { who: 'Ack', text: 'The source port is picked at random by whoever starts the conversation, from the ephemeral range, 49152 to 65535, so the reply comes back to the right window on the right machine. 0 to 1023 are the [[well-known ports]], 1024 to 49151 are registered.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'When would anyone choose the bike courier?', reply: 'Syn: "When late is worse than lost. Voice and video in real time: a word that arrives half a second late is useless, so don\'t wait for it, play the next one. Dispatch\'s radio calls go by UDP. Anything that has to arrive whole, a file, a web page, a bank transfer, goes by TCP."' },
            { tone: 'joke', say: 'Do you two ever finish each other\'s sentences?', reply: 'Ack: "Only when she\'s slow." Syn: "Which is never." Ack: "Which is why I have to."' },
            { tone: 'care', say: 'Why did Osi lend you to the exchange?', reply: 'Syn: "Because the exchange loses things and the guild doesn\'t." Ack: "And because Halvorsen people have started walking round this hall with tape measures, and she wants someone she trusts in here."' }
          ] } },
        { k: 'LORE', title: 'THE PAPER THAT SHOOK HANDS', year: 1974, real: ['ieee', 'ietf'], vibe: 'Right on: two guys wrote down how every computer on Earth would shake hands.',
          text: 'Syn, stamping a docket twice: "In May 1974 Vint Cerf and Bob Kahn published A Protocol for Packet Network Intercommunication in an IEEE journal. It was one protocol then, called TCP, doing everything, and in 1978 they split it into TCP and IP. UDP came in 1980, RFC 768, for the things that couldn\'t wait. Our mother was a courier too, and she had a copy of that paper pinned above her bike. We learned to read on it."' },
        { k: 'KIT', text: 'Ack writes it out on a docket, and Syn checks it twice.', real: ['ietf'], kit: [
          { cmd: 'SYN → SYN-ACK → ACK', what: 'the three-way handshake opens a TCP connection. FIN → ACK ← FIN ← ACK → closes it' },
          { cmd: 'TCP: connection-oriented, reliable, sequencing, error recovery, flow control', what: 'forward acknowledgement, window size, sliding window' },
          { cmd: 'UDP: connectionless, less overhead', what: 'real-time voice and video' },
          { cmd: 'TCP 20/21 FTP · 22 SSH · 23 Telnet · 25 SMTP · 80 HTTP · 110 POP3 · 443 HTTPS', what: 'well-known TCP ports' },
          { cmd: 'UDP 67/68 DHCP server/client · 69 TFTP · 161/162 SNMP agent/manager · 514 syslog · TCP/UDP 53 DNS', what: 'well-known UDP ports' },
          { cmd: '0-1023 well-known · 1024-49151 registered · 49152-65535 ephemeral', what: 'the source port is random, the destination port names the service' } ] },
        { k: 'SYNC', q: { prompt: 'Osi, tucking the clipboard under her arm: "The dispatch radio sends voice across the district. TCP or UDP, and why?"', opts: ['UDP. A late word is useless, so it is better to skip it than wait for a resend', 'TCP. Every word must arrive', 'TCP. It is faster', 'UDP. It retransmits lost words'], a: 0,
          yes: 'Syn: "The bike courier. Nobody waits for a lost word."', no: 'Syn: "UDP. Real-time voice can\'t wait for a resend, so it uses the courier who doesn\'t wait."',
          why: 'Syn: TCP guarantees delivery by resending anything lost, which adds delay. For real-time voice and video a late piece is worthless, so they use UDP: no handshake, no acknowledgements, less overhead, and a lost piece is simply skipped.' } }
      ] },
    // ------------------------------------------------------------ night 31 · IPv6, part 1
    { id: 'n31-empty-gallery', title: 'The gallery nobody moved into', sub: 'IPv6 addresses: 128 bits, hex, shortening, who hands them out', npc: 'sixx', day: [31], src: [PS('IPv6_Part1.md')], unlocks: ['ipv6-addr'],
      beats: [
        { k: 'SCENE', where: 'The exchange hall · the top gallery · Tuesday, 22:00',
          lines: [
            { who: 'narr', text: 'The noise of the hall fades as you climb, until there is only the hum of the lights and the smell of paint that never quite dried. The top gallery runs the whole length of the building: row after row of brass mailboxes, every one numbered, almost every one empty. At the far end a very tall figure with pale chrome skin sits reading on a bench, as if the gallery were a waiting room.' },
            { who: 'sixx', text: 'You\'re the one who came up the stairs. Most people stop at the second floor, where it\'s crowded and warm and there are never enough boxes.' },
            { who: 'sixx', text: 'The floors below run on IPv4: every [[IPv4 address]] is thirty-two bits, about four billion of them, and the world ran out years ago. Up here every address is an [[IPv6 address]], a hundred and twenty-eight bits. Enough to give every grain of sand on every beach more addresses than the whole of IPv4. I opened this gallery in 1998 and I\'ve been waiting for everyone to move in ever since.' },
            { who: 'narr', text: 'Sixx taps a brass plate on the nearest box. The number on it is long enough to wrap onto a second line: 2001:0DB8:0000:0031:0000:0000:0000:0001.' },
            { who: 'sixx', text: 'Eight groups of four hexadecimal digits, colons between them. Each digit is four bits, so each group, each quartet, is sixteen bits, and eight of them make a hundred and twenty-eight. Nobody writes them in full. You drop the leading zeros in every group, and one run of groups that are all zero becomes two colons. Once per address, or nobody could tell how many groups the double colon swallowed.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'So how short does that one get?', reply: 'Sixx: "2001:DB8:0:31::1. The 0DB8 loses its zero, the 0000 in the third group becomes 0, 0031 becomes 31, and the four zero groups at the end become ::. The third group stays, because the double colon is already spent on the longer run."' },
            { tone: 'press', say: 'If IPv4 ran out, why is this gallery still empty?', reply: 'Sixx: "Because people are clever about being lazy. NAT let a whole building hide behind one address, and it made the old floors last twenty years longer than they should have. They\'ll come up here eventually. I\'m good at waiting."' },
            { tone: 'joke', say: 'Do you ever get lonely up here?', reply: 'Sixx: "I have three hundred and forty undecillion mailboxes for company." A pause. "Also Syn brings me tea on Thursdays."' }
          ] } },
        { k: 'SCENE', where: 'The top gallery · the registry desk · 22:30',
          lines: [
            { who: 'narr', text: 'At the end of the gallery stands a heavy desk with five ledgers on it, each bound in a different colour. Sixx lays a long hand flat on them.' },
            { who: 'sixx', text: 'IANA hands out the big blocks to five regional internet registries, and they hand them to the ISPs in their part of the world. AFRINIC for Africa. APNIC for Asia-Pacific. ARIN for Canada, the United States and many Caribbean and North Atlantic islands. LACNIC for Latin America and the Caribbean. RIPE NCC for Europe, the Middle East and parts of Central Asia.' },
            { who: 'sixx', text: 'An enterprise usually gets a /48. It splits that into /64 subnets: sixteen bits of subnet ID, sixty-five thousand five hundred and thirty-six of them, and every one has sixty-four bits of host address, as many as the whole IPv4 internet, squared. The 2001:DB8 block you keep seeing is reserved for examples and documentation, so it never collides with anything real.' },
            { who: 'sixx', text: 'On a Cisco router, IPv6 routing is off until you say ipv6 unicast-routing. Without it the router answers on its own addresses and forwards nothing. The address goes on the interface as ipv6 address, then the address, a slash and the prefix length. No mask.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Why /64 for every subnet?', reply: 'Sixx: "Because the last sixty-four bits are the interface ID, and the ways a host builds its own address expect exactly sixty-four of them. Ask me about that another night. Tonight, just believe the /64."' },
            { tone: 'press', say: 'Isn\'t a /64 for a room with four PCs a waste?', reply: 'Sixx: "Up here there\'s no such thing. You\'re still counting like someone who grew up on the second floor, where every address was rationed."' },
            { tone: 'care', say: 'Why did you wait so long for everyone?', reply: 'Sixx looks down the gallery at the rows of empty boxes. "Because when the old floors are full, somebody has to have kept the lights on up here."' }
          ] } },
        { k: 'LORE', title: 'THE ROOM WITH ENOUGH BOXES', year: 1998, real: ['ietf'], vibe: 'All that and more: an address for everyone who would ever be born, and their toaster.',
          text: 'Sixx: "In December 1998 the IETF published RFC 2460, Steve Deering and Bob Hinden\'s specification for IPv6, with its hundred-and-twenty-eight-bit addresses. I was there the week it came out, and I painted the numbers on these boxes by hand that winter. It was replaced by RFC 8200 in 2017, but the boxes didn\'t change, and neither did I."' },
        { k: 'KIT', text: 'Sixx writes it on a brass-coloured luggage label and ties it to your wrist.', real: ['ietf'], kit: [
          { cmd: '128 bits · 8 quartets of 4 hex digits · 16 bits each', what: 'IPv4 is 32 bits' },
          { cmd: '2001:0DB8:0000:0031:0000:0000:0000:0001 → 2001:DB8:0:31::1', what: 'drop leading zeros in each quartet; :: replaces one run of all-zero quartets, once' },
          { cmd: 'IANA → AFRINIC · APNIC · ARIN · LACNIC · RIPE NCC → ISPs', what: 'Africa · Asia-Pacific · North America and islands · Latin America · Europe, Middle East, Central Asia' },
          { cmd: 'enterprise /48 · subnet /64 · 16-bit subnet ID = 65,536 subnets', what: 'the last 64 bits are the interface ID. 2001:DB8::/32 is for documentation' },
          { cmd: 'ipv6 unicast-routing', what: 'global config: without it the router forwards no IPv6' },
          { cmd: 'ipv6 address 2001:db8:31:1::1/64 · show ipv6 interface brief · show ipv6 route', what: 'address an interface, and check it' } ] },
        { k: 'SYNC', q: { prompt: 'Syn, arriving at the top of the stairs with a tray: "Sixx says an address can only have one double colon. Why not two?"', opts: ['With two, nobody could tell how many zero quartets each one replaced', 'Two would make the address longer', 'The second one would mean a different prefix length', 'Routers only read the first colon'], a: 0,
          yes: 'Sixx: "Exactly. One gap, you can count it. Two gaps, you\'re guessing."', no: 'Sixx: "Because :: means as many zero quartets as it takes to make eight. With two of them, the split between them would be a guess."',
          why: 'Sixx: A double colon stands for however many all-zero quartets are needed to bring the address back to eight. If an address had two, there would be no way to know how many zeros each one replaced, so :: may be used only once.' } }
      ] },
    // ------------------------------------------------------------ night 32 · IPv6, part 2
    { id: 'n32-names-from-serials', title: 'Names from serial numbers', sub: 'EUI-64, link-local, address types, multicast', npc: 'sixx', day: [32], src: [PS('IPv6_Part2.md')], unlocks: ['ipv6-eui'],
      beats: [
        { k: 'SCENE', where: 'The top gallery · Thursday, 21:30',
          lines: [
            { who: 'narr', text: 'Cardamom and steam drift along the gallery from a tray balanced on the bench: Syn\'s Thursday tea, two cups, one already empty. The gallery hums as before, but four more brass flags stand on the mailboxes now, and a delivery crate full of small grey card readers sits by the stairs.' },
            { who: 'sixx', text: 'The new wing\'s card readers. Forty of them, and I\'m not typing forty addresses. Each one will build its own interface ID out of its MAC address. That\'s [[EUI-64]], Extended Unique Identifier.' },
            { who: 'sixx', text: 'Three steps. Cut the forty-eight-bit MAC in half. Put FFFE in the middle, which makes sixty-four bits. Then flip the seventh bit. A MAC of 0019.E8A1.1C20 becomes 0019E8, FFFE, A11C20, and flipping the seventh bit turns the 00 at the front into 02: 0219:E8FF:FEA1:1C20. Put the /64 prefix in front and it has its address.' },
            { who: 'you', text: 'Why flip the seventh bit?' },
            { who: 'sixx', text: 'It\'s the U/L bit, universal or local. In a MAC a 0 there means a universally administered address, burned in by the maker, a UAA. A 1 means somebody set it by hand, a locally administered address, an LAA. EUI-64 turns that bit over. On the router it\'s one word at the end: ipv6 address 2001:db8:32:1::/64 eui-64.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What\'s the FE80 address I saw on every interface?', reply: 'Sixx: "The [[link-local]] address. Every IPv6 interface makes one for itself the moment IPv6 is on it, from FE80::/10, with an EUI-64 interface ID. It only works on its own link, so routers never forward it. Routers use it for their hellos and as next hops, and hosts can use the router\'s as their gateway. ipv6 enable switches IPv6 on without any global address, and you get the link-local alone."' },
            { tone: 'press', say: 'Isn\'t building an address from a MAC a privacy problem?', reply: 'Sixx: "Yes. Carry your laptop from one network to another and the last sixty-four bits follow you everywhere. That\'s why a laptop usually makes random interface IDs for itself instead. Card readers bolted to a wall don\'t mind being recognised."' },
            { tone: 'joke', say: 'Syn left you an empty cup.', reply: 'Sixx: "Ack drank it. Ack always drinks the first one, and Syn always brings two, and neither of them has ever mentioned it."' }
          ] } },
        { k: 'SCENE', where: 'The top gallery · the address board · 22:10',
          lines: [
            { who: 'narr', text: 'Sixx pulls a dust sheet off a board on the wall, a chart of every kind of IPv6 address, lettered in careful brass paint.' },
            { who: 'sixx', text: '[[Global unicast]] addresses are the public ones, originally 2000::/3: a global routing prefix, usually 48 bits, a 16-bit subnet ID and a 64-bit interface ID. [[Unique local]] addresses are the private ones, FC00::/7, and in practice they start with FD, then a 40-bit global ID you pick at random, then the subnet ID and the interface ID. Link-local is FE80::/10.' },
            { who: 'sixx', text: 'Unicast is one to one. [[Anycast]] is one to the nearest of many: several routers carry the same address and the network delivers to whichever is closest, ipv6 address with anycast on the end. Multicast is one to many, FF00::/8. There is no broadcast in IPv6 at all.' },
            { who: 'sixx', text: 'FF02::1 is every node on the link, like 224.0.0.1. FF02::2 is every router, like 224.0.0.2. FF02::5 and ::6 are OSPF routers and DRs, ::9 is RIP, ::A is EIGRP. The digit after FF0 is the scope: 1 interface-local, 2 link-local, 5 site-local, 8 organization-local, E global. :: on its own is the unspecified address, and ::1 is the loopback.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'So who answers FF02::2?', reply: 'Sixx: "Every router on the link, and nothing else. A host that wants to find a router asks FF02::2 instead of shouting at everyone, which is the whole point of having no broadcast."' },
            { tone: 'press', say: 'Why would anyone want private IPv6 addresses?', reply: 'Sixx: "For things that should never be reachable from outside, like the new wing\'s door readers. Unique local addresses aren\'t routed on the internet. The FD tells every router on the way that it\'s a local address."' },
            { tone: 'care', say: 'Do you paint every board by hand?', reply: 'Sixx: "Every one. The board downstairs was printed by Halvorsen\'s people last month. It has a spelling mistake in FF0E." Sixx sounds pleased about it.' }
          ] } },
        { k: 'LORE', title: 'THE DAY THEY LEFT THE LIGHT ON', year: 2012, vibe: 'Epic win: the big sites switched IPv6 on and just left it on.',
          text: 'Sixx: "On the 6th of June 2012 the world\'s big websites, network makers and internet providers switched IPv6 on for good, all on the same day. They called it World IPv6 Launch. A year before there had been a one-day test, and this time nobody switched it off again. I spent that day up here watching the first flags go up on the boxes, and I stopped counting at a thousand."' },
        { k: 'KIT', text: 'Sixx copies the board onto the back of a card reader\'s packing slip.', kit: [
          { cmd: 'EUI-64: split the MAC in half · insert FFFE · invert the 7th bit', what: '0019.E8A1.1C20 → 0219:E8FF:FEA1:1C20' },
          { cmd: 'ipv6 address 2001:db8:32:1::/64 eui-64', what: 'the router builds its own interface ID. U/L bit 0 = UAA, 1 = LAA' },
          { cmd: 'ipv6 address fe80::1 link-local · ipv6 enable', what: 'set the link-local by hand · IPv6 on, link-local only' },
          { cmd: 'global unicast 2000::/3 (48 prefix + 16 subnet + 64 interface) · unique local FC00::/7, FD + 40-bit global ID · link-local FE80::/10', what: 'public, private, this link only' },
          { cmd: 'multicast FF00::/8 · FF02::1 all nodes · ::2 all routers · ::5 OSPF · ::6 OSPF DR/BDR · ::9 RIP · ::A EIGRP', what: 'IPv4: 224.0.0.1, .2, .5, .6, .9, .10. No broadcast in IPv6' },
          { cmd: 'scope FF01 interface · FF02 link · FF05 site · FF08 organization · FF0E global', what: 'the digit after FF0' },
          { cmd: 'ipv6 address 2001:db8:32:9::1/64 anycast · :: unspecified · ::1 loopback', what: 'anycast: to the nearest of many' } ] },
        { k: 'SYNC', q: { prompt: 'Syn, collecting the cups: "Sixx says a host looking for a router doesn\'t broadcast. What does it send to instead?"', opts: ['FF02::2, all routers on the link', 'FF02::1, all nodes on the link', 'FFFF:FFFF::, the IPv6 broadcast', '::1, the loopback'], a: 0,
          yes: 'Sixx: "All routers, and only routers. Nobody else has to listen."', no: 'Sixx: "FF02::2. IPv6 has no broadcast, so it asks the all-routers group."',
          why: 'Sixx: IPv6 has no broadcast. A message for every router on the link goes to the link-local multicast group FF02::2, all routers. FF02::1 is all nodes, and ::1 is the host\'s own loopback.' } }
      ] },
    // ------------------------------------------------------------ night 33 · IPv6, part 3
    { id: 'n33-routes-to-the-wing', title: 'A road to the new wing', sub: 'the IPv6 header, NDP, SLAAC and IPv6 static routes', npc: 'sixx', day: [33], src: [PS('IPv6_Part3.md')], unlocks: ['ipv6-routes'],
      beats: [
        { k: 'SCENE', where: 'The top gallery · Friday, 20:00',
          lines: [
            { who: 'narr', text: 'Rain streams down the gallery\'s long windows and the brass mailboxes throw back the light in stripes. Forty-six flags stand on the boxes now. Sixx has a roll of paper spread on the bench, weighted at the corners with teacups, and on it a route drawn in violet ink from the exchange hall, through the cab rank, to the clinic\'s new wing.' },
            { who: 'sixx', text: 'The new wing opens soon, and its first network is IPv6. Before you route anything to it, look at what you\'re routing. The IPv6 header is a fixed forty bytes: Version, Traffic Class for QoS, Flow Label to mark a stream of packets, Payload Length, Next Header, which says what\'s inside, Hop Limit, which counts down like IPv4\'s TTL, then the two addresses.' },
            { who: 'sixx', text: 'There\'s no ARP either. [[NDP]], Neighbor Discovery Protocol, does its job with ICMPv6. A neighbor solicitation, NS, type 135, asks who has an address, and a neighbor advertisement, NA, type 136, answers. The NS doesn\'t go to everyone. It goes to the neighbour\'s [[solicited-node multicast]] address: FF02::1:FF plus the last six hex digits of the address it\'s looking for.' },
            { who: 'sixx', text: 'A host that arrives with no address sends a router solicitation, RS, type 133, to FF02::2, all routers. The router replies with a router advertisement, RA, type 134, to FF02::1, all nodes, carrying the prefix of the link. The host builds its own address from that prefix, EUI-64 or a random interface ID. That\'s [[SLAAC]], stateless address autoconfiguration.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What stops two hosts building the same address?', reply: 'Sixx: "Duplicate Address Detection, DAD. Before it uses a new address, a host sends an NS to its own solicited-node address. If anyone answers with an NA, the address is taken. Silence means it\'s free."' },
            { tone: 'press', say: 'Where do I see what NDP learned?', reply: 'Sixx: "show ipv6 neighbor on the router, the way show arp works for IPv4. And link-local addresses never go into the routing table. They belong to the link, not the road."' },
            { tone: 'quiet', say: '(Trace the violet line with your finger.)', reply: 'It runs from the gallery to the rank and on to a square labelled NEW WING, and next to the rank someone has written, in a different hand, g0/0 only?? and underlined it twice. Sixx watches you find it. "Nexthop\'s cousin had a go last week," Sixx says.' }
          ] } },
        { k: 'SCENE', where: 'The top gallery · 20:40',
          lines: [
            { who: 'narr', text: 'A cold, clean scent reaches the bench before the footsteps do. Vesper Kade comes up the last flight of stairs without hurrying, rain still beading on her charcoal coat, and looks along the gallery at the flags.' },
            { who: 'vesper', text: 'Forty-six. When I was an apprentice, this floor had three, and one of them was yours.' },
            { who: 'sixx', text: 'Four. You forget the clinic\'s.' },
            { who: 'vesper', text: 'Halvorsen\'s towers run IPv6 on every floor, and nobody there types a static route. The controller works them out.' },
            { who: 'sixx', text: 'Down here we type them, so we know what they are. There are three kinds. A recursive route names only the next hop, and the router looks up how to reach the next hop. A directly attached route names only the exit interface. A fully specified route names both.' },
            { who: 'sixx', text: 'On Ethernet a directly attached IPv6 route is accepted and never works, because the router has no next hop to look up with NDP. And if the next hop is a link-local address, the route must be fully specified, since the same FE80 address could sit on every link the router has.' },
            { who: 'vesper', text: 'Dispatch has booked you for the clinic\'s two sites tomorrow night. Everything the street has taught you, in one building. I\'d like to see how it holds.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Why are you interested in the clinic?', reply: 'Vesper: "Because it\'s where the street keeps promising it can look after itself. Tomorrow it gets to show me." She says it kindly, and doesn\'t wait for an answer.' },
            { tone: 'press', say: 'What does Halvorsen want with the exchange hall?', reply: 'Vesper: "The same thing it wants with every building in Watson: one network, run properly, by people who aren\'t tired. Ask Sixx how long this gallery has been waiting for tenants."' },
            { tone: 'care', say: 'You knew Sixx before?', reply: 'Sixx answers for her. "She painted the fourth flag. The clinic\'s. She was nineteen." Vesper looks at the flag and not at either of you.' }
          ] } },
        { k: 'LORE', title: 'THE LAST FIVE BLOCKS', year: 2011, vibe: 'Epic fail, and everybody saw it coming: the old floors were officially full.',
          text: 'Sixx: "On the 3rd of February 2011, in Miami, IANA handed out its last five /8 blocks of IPv4 addresses, one to each of the five regional registries. After that there was nothing left to give them. The stairs up to this gallery were busy for a week after that, and then they went quiet again. I kept the newspaper."' },
        { k: 'KIT', text: 'Sixx writes it in violet ink on the edge of the route map and tears the strip off for you.', kit: [
          { cmd: 'header, 40 bytes: Version · Traffic Class · Flow Label · Payload Length · Next Header · Hop Limit · source · destination', what: 'Hop Limit is IPv4\'s TTL, Next Header its Protocol field' },
          { cmd: 'NDP over ICMPv6: RS 133 → FF02::2 · RA 134 → FF02::1 · NS 135 · NA 136', what: 'replaces ARP. show ipv6 neighbor' },
          { cmd: 'solicited-node multicast: FF02::1:FF + last 6 hex digits', what: 'where an NS goes. DAD sends an NS to its own' },
          { cmd: 'SLAAC: RS/RA gives the prefix, the host adds an EUI-64 or random interface ID', what: 'DAD checks nobody else has it' },
          { cmd: 'ipv6 route 2001:db8:33:3::/64 2001:db8:33:12::2', what: 'recursive: next hop only' },
          { cmd: 'ipv6 route 2001:db8:33:3::/64 g0/1', what: 'directly attached: exit interface only. Does not work on Ethernet' },
          { cmd: 'ipv6 route ::/0 g0/1 fe80::2', what: 'fully specified: both. Required for a link-local next hop. Link-local routes never enter the table' } ] },
        { k: 'SYNC', q: { prompt: 'Sixx, capping the violet pen: "The wing\'s router should send everything to the rank\'s link-local address, FE80::2. Which kind of route?"', opts: ['Fully specified: the exit interface and FE80::2', 'Recursive: FE80::2 on its own', 'Directly attached: the exit interface on its own', 'None. Link-local addresses cannot be next hops'], a: 0,
          yes: 'Sixx: "Both halves. A link-local on its own could be on any link."', no: 'Sixx: "Fully specified. The same FE80 address can exist on every link, so the router needs the exit interface too."',
          why: 'Sixx: A link-local address is only unique on its own link, so a route that names only FE80::2 does not tell the router which link to look on. A fully specified route names the exit interface and the next hop together. A directly attached route with no next hop does not work on Ethernet.' } }
      ] }
  ] });
})();
