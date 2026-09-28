/* District 06 · The Services — the exchange hall. Nights 37–42 here: NTP, DNS, DHCP, SNMP, syslog, SSH (Denise and her intern
   Dora, Beacon, Shell and Enable). Nights 30–33 and 43–47 are written alongside. Written to docs/STORY_BIBLE.md (Voice) and
   docs/CAMPAIGN_MAP.md. */
(function(){
  const { PS } = SRC;
  STAGES.push({ id: 'services', arc: 'grid', title: 'STAGE 6 · THE SERVICES', sub: 'TCP/UDP, IPv6, NTP, DNS, DHCP, SNMP, syslog, SSH, NAT, QoS', npc: 'denise', status: 'live', levels: [
    // ------------------------------------------------------------ night 30 · TCP and UDP
    { id: 'n30-twins', title: 'Two couriers, one parcel', sub: 'TCP and UDP: the handshake, ports, reliability', npc: 'syn', day: [30], src: [PS('TCP_and_UDP.md')], unlocks: ['tcp-udp'],
      beats: [
        { k: 'SCENE', where: 'The exchange hall · the courier desk · Monday, 09:00',
          lines: [
            { who: 'narr', text: 'The exchange hall is loud before you are through the doors: a hundred conversations under a glass roof, phones ringing, the thump of rubber stamps. It smells of wet umbrellas and toner. Osi Sevenfold is waiting by a desk under a sign that says COURIERS, clipboard against her chest, and behind the desk two young women with the same face are sorting parcels at twice the speed of anyone else in the hall.' },
            { who: 'osi', text: 'My two best couriers, on loan to the exchange. Syn and Ack. They\'ll tell you how a parcel gets somewhere and how you know it arrived, which is not the same question.' },
            { who: 'syn', text: 'Every delivery starts with a knock. I knock, that\'s a SYN. She answers and knocks back, that\'s a SYN-ACK. I answer her knock, that\'s an ACK, and now we\'re connected.' },
            { who: 'Ack', text: 'The [[three-way handshake]]. Nothing gets handed over until all three have happened.' },
            { who: 'syn', text: 'That\'s [[TCP]], Transmission Control Protocol, and it\'s connection-oriented. Every segment gets a sequence number, and every sequence number gets acknowledged, so anything lost gets sent again and everything arrives in order. It\'s reliable, it recovers from errors, and it controls the flow.' },
            { who: 'syn', text: 'Every connection in the corp towers downtown opens with these same three messages, SYN, SYN-ACK, ACK, billions of times a second.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'How does she tell you what she\'s got so far?', reply: 'Ack: "I tell her the number of the next segment I expect. That\'s a forward acknowledgement: if I say 12, I\'ve got everything up to 11. And the window size field in the header says how much she can send before she waits for me. We grow it while things go well and shrink it when they don\'t, a sliding window, and that\'s flow control."' },
            { tone: 'press', say: 'All that knocking must slow you down.', reply: 'Syn: "It does. That\'s why the other courier exists." She nods across the hall at a lad on a bike throwing envelopes onto desks without stopping. "[[UDP]], User Datagram Protocol. No handshake, no numbers, no receipts. Less overhead, and faster, and if one goes in a puddle, nobody resends it."' },
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
            { who: 'sixx', text: 'On a Cisco router, IPv6 routing is off until you say ipv6 unicast-routing. Without it the router answers on its own addresses and forwards nothing. The address goes on the interface as ipv6 address, then the address, a slash and the prefix length, with no mask.' }
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
            { who: 'narr', text: 'Rain streams down the gallery\'s long windows and the brass mailboxes throw back the light in stripes. Fifty flags stand on the boxes now. Sixx has a roll of paper spread on the bench, weighted at the corners with teacups, and on it a route drawn in violet ink from the exchange hall, through the cab rank, to the clinic\'s new wing.' },
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
            { tone: 'care', say: 'You knew Sixx before?', reply: 'Sixx answers for her. "She painted the fourth flag, the clinic\'s, when she was nineteen." Vesper looks at the flag and not at either of you.' }
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
      ] },
    // ------------------------------------------------------------ night 37 · NTP
    { id: 'n37-one-clock', title: 'One clock', sub: 'NTP and the device clocks', npc: 'denise', day: [37], src: [PS('NTP.md')], unlocks: ['ntp'],
      beats: [
        { k: 'SCENE', where: 'The exchange hall · Denise\'s switchboard room · half past midnight',
          lines: [
            { who: 'narr', text: 'The exchange hall hums like a hive. Rows of old switchboards stand dark along the walls, and in one lit corner a woman in a headset works three screens at once. The room smells of burnt coffee and warm printer paper. Above her desk hangs a big round clock, and under it three strips of printout are taped to the wall side by side.' },
            { who: 'denise', text: 'You\'re Ace\'s runner. Sit down, there\'s coffee, it\'s terrible. Ace asked me to line these up for her, and I can\'t do it.' },
            { who: 'denise', text: 'These are the logs from the gate router, the clinic router and the market router, the night the kiosk knocked. The gate says twenty to two. The clinic says it\'s March 1993. The market is eleven minutes ahead of the gate. If I can\'t put them in order I can\'t tell Ace what happened first, and a log you can\'t put in order is only a story somebody typed.' },
            { who: 'you', text: 'Why does the clinic think it\'s 1993?' },
            { who: 'denise', text: 'Because nobody ever told it the time. A Cisco box has two clocks. The hardware calendar runs on a battery, and the software clock is the one the logs use. At boot the software clock copies the calendar, and if nobody ever set either one, it starts at the IOS default, the first of March 1993. show clock puts a star in front of the time to say it isn\'t authoritative. And it counts in UTC unless somebody gives it a time zone.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Can\'t I just set them by hand?', reply: 'Denise: "You can. clock set from privileged EXEC, the time, then the day and month in either order, then the year. calendar set does the hardware clock the same way. clock update-calendar copies the software clock into the calendar, and clock read-calendar goes the other way. It holds until the next battery dies, and then the gate and the clinic drift apart again."' },
            { tone: 'press', say: 'Eleven minutes. Does it really matter?', reply: 'Denise: "Ace has a list that somebody changed at six and a kiosk that knocked at twenty to two. If the market\'s clock is eleven minutes fast, I can\'t even tell her how far apart they were. Get the order wrong and one visitor looks like two, or two look like one."' },
            { tone: 'care', say: 'When did you last sleep?', reply: 'Denise laughs into her mug. "Dora asked me that at eight. I\'ll sleep when the clocks agree."' }
          ] } },
        { k: 'SCENE', where: 'The switchboard room · the big clock on the wall', real: ['ietf'],
          lines: [
            { who: 'denise', text: 'So we don\'t set them by hand. We use [[NTP]], the Network Time Protocol: one box that knows the time, and everyone asks it. It runs over UDP, port 123.' },
            { who: 'denise', text: 'There\'s a GPS receiver on the roof. The satellites carry atomic clocks, and a reference clock like that is [[stratum]] 0. The box it\'s wired into, the Exchange\'s roof clock, is stratum 1, a primary server. Anything that asks the roof clock is stratum 2, a secondary server, and every hop down adds one. Past 15 nobody believes it, and 16 means not synchronised at all. Lower is better.' },
            { who: 'denise', text: 'A box can be a client and a server at the same time. The gate router asks the roof, and the clinic and the market ask the gate. A client needs one line, ntp server and the address. ntp master tells a box to trust its own clock and serve it, at stratum 8 unless you give it a number, for a network with no roof clock at all.' },
            { who: 'denise', text: 'NTP itself only ever counts in UTC. The time zone is for the people reading show clock, and ntp update-calendar keeps the battery clock in step so the right time survives a reboot.' },
            { who: 'narr', text: 'She takes the three printouts off the wall and lays them face down on the desk, one on top of the other.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What if two servers are just as good?', reply: 'Denise: "Give one the word prefer at the end of its ntp server line and the box picks it when they tie. Two boxes at the same stratum can also back each other up with ntp peer, pointing each at the other. That\'s symmetric active mode."' },
            { tone: 'press', say: 'What stops someone feeding the district a fake time?', reply: 'Denise: "Authentication. ntp authenticate switches it on. ntp authentication-key gives a key a number and an MD5 string, ntp trusted-key says which numbers you believe, and ntp server with key says which key that server must use. A server that can\'t prove it knows the key gets ignored. If I wanted to hide what I\'d done on a network, the first thing I\'d change is the clock."' },
            { tone: 'quiet', say: '(Watch the big clock on the wall.)', reply: 'The second hand sweeps past the twelve. By the time on Denise\'s screen, it is four minutes slow. She sees you notice. "That one\'s for visitors. Nobody logs anything by it."' }
          ] } },
        { k: 'LORE', title: 'THE TIMEKEEPER OF DELAWARE', year: 1985, real: ['ietf'], vibe: 'Radical. Every computer on the net checking its watch against the same guy.',
          text: 'Denise, turning her mug in her hands: "In September 1985 David Mills at the University of Delaware published the Network Time Protocol as RFC 958. He kept refining it for decades, until machines on opposite sides of the world could agree on the time to within a few milliseconds. I keep RFC 958 written on the side of the switchboard, because every log on this street leans on it, and hardly anyone knows his name."' },
        { k: 'KIT', text: 'Denise writes the clocks down on the back of a timesheet.', kit: [
          { cmd: 'show clock · show clock detail · show calendar', what: '* means not authoritative. The software clock starts from the hardware calendar. Default zone UTC' },
          { cmd: 'clock set 23:47:00 28 Sep 2026 · calendar set ... · clock update-calendar · clock read-calendar', what: 'by hand, from privileged EXEC' },
          { cmd: 'clock timezone PST -8 · clock summer-time PDT recurring', what: 'for the people reading it. NTP itself only uses UTC' },
          { cmd: 'ntp server 10.37.255.1 [prefer] · ntp master [stratum]', what: 'ask a server · serve your own clock, stratum 8 by default' },
          { cmd: 'stratum 0 reference clock · 1 primary · 2 and up secondary · over 15 not trusted', what: 'lower stratum is preferred. UDP port 123' },
          { cmd: 'ntp source loopback0 · ntp update-calendar · ntp peer 10.37.3.1', what: 'the address it speaks from · keep the calendar in step · symmetric active' },
          { cmd: 'ntp authenticate · ntp authentication-key 1 md5 KEY · ntp trusted-key 1 · ntp server IP key 1', what: 'only believe a server that knows the key' },
          { cmd: 'show ntp status · show ntp associations', what: 'synchronised or not, the stratum, and who from' } ] },
        { k: 'SYNC', q: { prompt: 'Dora, Denise\'s intern, leans over the desk with a pencil: "The market router asks the gate router, and the gate router asks the roof clock, which is wired to the GPS. So what stratum is the market router?"', opts: ['1', '2', '3', '16'], a: 2,
          yes: 'Denise: "Three. One for every hop down from the GPS."', no: 'Denise: "Count the hops. GPS 0, roof 1, gate 2, market 3."',
          why: 'Denise: The GPS reference clock is stratum 0. The roof clock is wired straight to it, so it is stratum 1. The gate router gets its time from the roof clock, stratum 2, and the market router gets its time from the gate, stratum 3. Each server adds one.' } }
      ] },

    // ------------------------------------------------------------ night 38 · DNS
    { id: 'n38-names', title: 'A name for every number', sub: 'DNS', npc: 'denise', day: [38], src: [PS('DNS.md')], unlocks: ['dns'],
      beats: [
        { k: 'SCENE', where: 'The exchange hall · the switchboard room · a quarter to ten at night',
          lines: [
            { who: 'narr', text: 'The coffee is fresher tonight, and the room smells of it. One of Denise\'s three screens shows the clinic\'s front desk on a video call. Imani is on it, still in her scrubs, holding a printout up to the camera: a login page with the clinic\'s logo on it and the clinic\'s name spelled wrong.' },
            { who: 'Imani', text: 'The desks type records, like they always do, and this comes up asking for our passwords. I only caught it because it says Watson Clinc. I don\'t think anybody\'s typed a password into it yet.' },
            { who: 'denise', text: 'Nobody types numbers, that\'s the trouble. You type records, and something turns it into an address. That something is [[DNS]], the Domain Name System, and in Watson the something is me: the exchange router answers names for the whole district. If somebody changed my answer, every desk goes wherever I say.' },
            { who: 'you', text: 'How does a desk know to ask you?' },
            { who: 'denise', text: 'It\'s told. Either somebody types my address into the PC, or it comes with the lease when the desk gets its address from DHCP, along with the gateway. ipconfig /all on a Windows desk shows you which DNS servers it\'s using.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What does the question actually look like?', reply: 'Denise: "Small. Where is records, please, and the answer comes back as a record. An A record maps a name to an IPv4 address, and an AAAA record maps it to an IPv6 one. It goes over UDP, port 53, because it\'s one question and one answer. If the answer is bigger than 512 bytes, it goes over TCP instead."' },
            { tone: 'press', say: 'So anyone who can change your answers owns the clinic?', reply: 'Denise: "Anyone who can change them, or anyone who can get a desk to ask somebody else. That\'s why the desks ask me and nobody else, and why I want to know who touched my table."' },
            { tone: 'care', say: 'Imani, are you all right?', reply: 'Imani: "I\'ve had worse nights. I carried charts up three floors once, you know." She puts the printout down. "This one just feels like somebody wanted us to look stupid."' }
          ] } },
        { k: 'SCENE', where: 'The switchboard room · Denise\'s screen', real: ['sri'],
          lines: [
            { who: 'denise', text: 'The exchange router can be a small DNS server all by itself. ip dns server switches that on. ip host and a name and an address puts a line in its host table, and it answers from the table first. show hosts reads the table back.' },
            { who: 'denise', text: 'Anything that isn\'t in my table, I ask a bigger server out on the internet. ip name-server gives the router that server\'s address, and ip domain lookup lets it ask. Lookup is on by default, and plenty of people switch it off, because a router with nobody to ask stops for a few seconds on every mistyped command, trying to look it up as a name.' },
            { who: 'narr', text: 'She turns the screen toward you. The table has six lines. One of them says records, and the address after it is on the clinic\'s own subnet, 10.37.2.66, where the records server has never lived.' },
            { who: 'denise', text: 'I didn\'t type that. Nobody\'s logged into this router since I last saved it, as far as the router can tell me, and the router can\'t tell me much.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Can a PC remember an answer?', reply: 'Denise: "It caches them, for as long as the record says. ipconfig /displaydns shows what a Windows desk remembers, and ipconfig /flushdns makes it forget, so the next question goes to the server again. After tonight, every desk at the clinic gets a flush."' },
            { tone: 'press', say: 'Why can\'t the router tell you who changed it?', reply: 'Denise: "Because everybody logs into it with the same password, from the same shell, and its log lives in its own memory. Ace has been telling me that for a year, and tonight I believe her."' },
            { tone: 'quiet', say: '(Read the other five lines of the table.)', reply: 'council, market, gate, printer and the payments server, each with its address, in Denise\'s spelling. When she scrolls to the running-config, the records line is the last of them, typed after everything else.' }
          ] } },
        { k: 'LORE', title: 'ONE FILE FOR THE WHOLE WORLD', year: 1983, real: ['sri'], vibe: 'Gag me with a spoon. Every computer on the net downloading the same phone book.',
          text: 'Denise, scrolling the table: "Before 1983 every computer on the ARPANET kept one text file, HOSTS.TXT, and fetched a fresh copy from the Network Information Center at SRI, where Elizabeth Feinler\'s team kept it by hand. In November 1983 Paul Mockapetris published RFC 882 and RFC 883: a system where nobody keeps the whole list, and every server knows who to ask next. Every computer still keeps a hosts file somewhere, in a folder nobody opens."' },
        { k: 'KIT', text: 'Denise writes the names on the back of a call sheet.', real: ['sri'], kit: [
          { cmd: 'A · AAAA', what: 'name to IPv4 · name to IPv6' },
          { cmd: 'UDP 53 · TCP 53 over 512 bytes', what: 'one question, one answer' },
          { cmd: 'ip dns server · ip host records 10.37.20.10 · show hosts', what: 'the router answers from its own host table' },
          { cmd: 'ip name-server 8.8.8.8 · ip domain lookup (old: ip domain-lookup)', what: 'ask a bigger server for the rest. Lookup is on by default' },
          { cmd: 'ip domain name watson.net (old: ip domain-name)', what: 'the router\'s own domain' },
          { cmd: 'ipconfig /all · ipconfig /displaydns · ipconfig /flushdns', what: 'which DNS servers a Windows desk uses · its cache · empty the cache' },
          { cmd: 'nslookup records · ping records · ping 10.37.20.10 -n 10', what: 'ask by name · ping by name · ping ten times' } ] },
        { k: 'SYNC', q: { prompt: 'Imani, on the call: "So when the desk asks for records and gets 10.37.20.10 back, what kind of answer is that?"', opts: ['An AAAA record', 'An A record', 'A lease', 'A host route'], a: 1,
          yes: 'Denise: "An A record. A name and an IPv4 address."', no: 'Denise: "An A record. AAAA is the IPv6 one."',
          why: 'Denise: An A record maps a name to an IPv4 address, like records to 10.37.20.10. An AAAA record maps a name to an IPv6 address. A lease is what DHCP hands out, and a route is how a router forwards, not how a name becomes a number.' } }
      ] },

    // ------------------------------------------------------------ night 39 · DHCP
    { id: 'n39-leases', title: 'Dora\'s desk', sub: 'DHCP', npc: 'denise', day: [39], src: [PS('DHCP.md')], unlocks: ['dhcp'],
      beats: [
        { k: 'SCENE', where: 'The exchange hall · the lease desk · eleven at night',
          lines: [
            { who: 'narr', text: 'The hall is cold tonight and the radiators tick as they warm up. By the door, under a hand-lettered sign that says LEASES, a young woman sits at a desk with a roll of numbered paper tickets, the kind a deli counter uses, and a laptop open to the exchange router\'s shell. The desk smells of photocopier toner and orange peel.' },
            { who: 'Dora', text: 'Denise says I\'m doing the leases from now on. Which means I\'m doing the router. Which means you\'re going to watch me do the router.' },
            { who: 'denise', text: 'Every desk, till and laptop in the district that doesn\'t have a fixed address gets one from here. [[DHCP]], the Dynamic Host Configuration Protocol. A lease gives a host its address and mask, its default gateway, its DNS server, sometimes a domain name, and a time limit.' },
            { who: 'denise', text: 'A host asking for its first lease has no address at all, so it can\'t talk to anyone in particular. It shouts. Four messages: Discover, Offer, Request, Acknowledge.' },
            { who: 'Dora', text: 'D, O, R, A. Yes. Everybody makes the joke. I\'ve heard it nine times this week.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Who says what, and to whom?', reply: 'Denise: "The client sends Discover and Request, the server sends Offer and Ack. Discover is always a broadcast, because the client knows nobody. Request is broadcast too, so every server that made an offer hears which one was taken. Offer and Ack can be broadcast or unicast, depending on what the client asked for."' },
            { tone: 'press', say: 'What about the boxes that must never move, the printers?', reply: 'Denise: "You keep their addresses out of the pool. ip dhcp excluded-address and a first and last address, in global config. The server skips them and hands out the first free address after."' },
            { tone: 'care', say: 'How was your first week, Dora?', reply: 'Dora: "On Monday I typed ipconfig /release on my own laptop by mistake. It sent a Release to the server, straight to it, unicast, and gave the address back, and I had no address at all until I typed ipconfig /renew. Denise laughed for a full minute."' }
          ] } },
        { k: 'SCENE', where: 'The lease desk · Dora\'s laptop', real: ['ietf'],
          lines: [
            { who: 'denise', text: 'The hall\'s own desks are easy: they sit on the exchange router\'s own port, so their shout reaches it. The clinic\'s desks are behind the clinic router, and a broadcast never crosses a router.' },
            { who: 'denise', text: 'So the clinic router becomes a [[DHCP relay]]. ip helper-address on the port the desks are on, pointing at the server. It catches the shout and forwards it to the server as a unicast, with its own port\'s address written inside, so the server knows which pool to answer from.' },
            { who: 'Dora', text: 'And the pool is ip dhcp pool and a name. Then network, default-router, dns-server, domain-name, lease. Lease is days, hours, minutes, or infinite.' },
            { who: 'denise', text: 'A router can be on the other end, too. ip address dhcp on an interface makes the router a DHCP client, which is how the market router takes its address from its internet provider. And show ip dhcp binding on the server lists every address it has leased, and to which hardware address.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'How does the server pick the right pool for a relayed request?', reply: 'Denise: "By the address the relay wrote in. The clinic router puts its own port\'s address, 10.37.2.1, into the request. The exchange router looks for the pool whose network holds 10.37.2.1, and leases from that one."' },
            { tone: 'press', say: 'Why not put a DHCP server in every building?', reply: 'Denise: "Because then there are nine tables to read when something goes wrong, and nine places for someone to change something quietly. One server, one table, one person who knows it."' },
            { tone: 'quiet', say: '(Watch Dora type.)', reply: 'She types a line, then reads it back aloud to the screen, the way Denise reads numbers back to callers. When she gets one wrong she says "no" to herself, types the no version, and does it again.' }
          ] } },
        { k: 'LORE', title: 'AN ADDRESS THAT FINDS YOU', year: 1993, real: ['ietf'], vibe: 'All that and a bag of chips. You plug in and the network hands you a name tag.',
          text: 'Denise, tearing a ticket off Dora\'s roll: "In October 1993 Ralph Droms, at Bucknell University, published DHCP as RFC 1531. It grew out of an older protocol called BOOTP, from 1985, which could hand out addresses but never take them back. Droms added the lease: an address you get to keep for a while and then return. Before that, somebody like me walked round with a clipboard and wrote an address on every machine."' },
        { k: 'KIT', text: 'Dora writes it on the back of a ticket and gives you number 39.', kit: [
          { cmd: 'Discover → Offer → Request → Ack', what: 'client sends D and R, server sends O and A. Discover and Request always broadcast; Offer and Ack either' },
          { cmd: 'ip dhcp excluded-address 10.37.2.1 10.37.2.49', what: 'keep fixed addresses out of the pool' },
          { cmd: 'ip dhcp pool CLINIC · network 10.37.2.0 255.255.255.0 · default-router 10.37.2.1 · dns-server 10.37.255.1', what: 'the pool, and what a lease carries' },
          { cmd: 'domain-name watson.net · lease 0 12 (days hours minutes, or infinite)', what: 'the domain, and how long a lease lasts' },
          { cmd: 'interface g0/0 · ip helper-address 10.37.12.1', what: 'relay: catch the broadcast, send it on to the server as a unicast' },
          { cmd: 'ip address dhcp', what: 'on an interface: the router becomes a DHCP client' },
          { cmd: 'show ip dhcp binding · show ip dhcp pool', what: 'who has which address · the pools' },
          { cmd: 'ipconfig /release · ipconfig /renew', what: 'give the lease back (a unicast Release) · ask for one again' } ] },
        { k: 'SYNC', q: { prompt: 'Dora, testing herself out loud: "Two of the four come from the client. Which two?"', opts: ['Offer and Ack', 'Discover and Request', 'Discover and Ack', 'Request and Offer'], a: 1,
          yes: 'Dora: "Discover and Request. The client asks twice, the server answers twice."', no: 'Denise: "Discover and Request. The server sends the Offer and the Ack."',
          why: 'Denise: The client sends Discover, looking for any server, and Request, taking one offer. The server sends Offer, proposing an address, and Ack, confirming it. Discover and Request are broadcasts; Offer and Ack can be broadcast or unicast.' } }
      ] },

    // ------------------------------------------------------------ night 40 · SNMP
    { id: 'n40-every-box', title: 'Every box at once', sub: 'SNMP', npc: 'denise', day: [40], src: [PS('SNMP.md')], unlocks: ['snmp'],
      beats: [
        { k: 'SCENE', where: 'The exchange hall · the switchboard room · one in the morning',
          lines: [
            { who: 'narr', text: 'Cold air falls from a vent above the desk, and a server fan whines somewhere under it. Denise has a fourth screen tonight, bolted to the switchboard with two brackets and a lot of tape. It shows a map of the district in green dots, one for every router and switch, each with a tiny graph beside it that ticks along like a heartbeat.' },
            { who: 'denise', text: 'This is how I watch every box at once without logging into any of them. The program on this screen is the manager, and the machine it runs on is the [[NMS]], the network management station. Every box on the map runs an agent that answers it. That\'s [[SNMP]], the Simple Network Management Protocol.' },
            { who: 'denise', text: 'Each agent keeps its numbers in a [[MIB]], a management information base: CPU, memory, every port\'s counters, the hostname, the uptime. Every one of those variables has an [[OID]], an object identifier, a long dotted number that says exactly which value you mean.' },
            { who: 'you', text: 'So the NMS asks, and the box answers?' },
            { who: 'denise', text: 'Mostly. The manager sends Get for one or more values, GetNext to walk to the next one, and GetBulk to take a whole run of them at once, which is GetNext done efficiently. The agent answers every one of those with a Response. And the manager can send Set, which changes a value on the box.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Does the box ever speak first?', reply: 'Denise: "When something happens, a port going down, a fan dying, it sends a notification without being asked. A Trap is sent and forgotten. An Inform has to be acknowledged by the manager, so the box knows it arrived. The agents listen on UDP port 161, and the manager listens for notifications on UDP port 162."' },
            { tone: 'press', say: 'Set can change the box? From here?', reply: 'Denise: "With the right community string, yes. A community is a password that comes in two kinds: ro, read-only, and rw, read-write. An rw community is as good as the enable secret, and in version 2c it crosses the wire in plain text."' },
            { tone: 'care', say: 'You built this map yourself?', reply: 'Denise: "Over six years, one dot at a time. Every dot is somebody who called me at three in the morning because the box was down and nobody had noticed, and these days I notice before they call."' }
          ] } },
        { k: 'SCENE', where: 'The switchboard room · the clinic router\'s dot', real: ['ietf'],
          lines: [
            { who: 'denise', text: 'Three versions matter. v1 was first. v2c is the one everyone runs, with GetBulk and Informs added and still only a community string for a password. v3 adds real authentication and encryption, and it\'s the only one I\'d call secure.' },
            { who: 'narr', text: 'She clicks the clinic router\'s dot. A window opens with its details. Under communities there are two lines: nightwatch, read-only, which is hers, and one more, read-write, called rootcellar.' },
            { who: 'denise', text: 'Rootcellar. Old Root used that string on the clinic\'s first routers, twenty years ago, back when his own apprentices were running the cables. It was never supposed to leave the clinic. My backup from August doesn\'t have it on this router, or on the market\'s.' },
            { who: 'narr', text: 'Ace is in the doorway with Sticky. She reads the window over Denise\'s shoulder and says nothing at all. Then she turns her clipboard face down on the desk.' },
            { who: 'denise', text: 'Somebody who knew that string could have changed the gate\'s list at dawn without ever opening a shell, with one Set.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'How do we shut it?', reply: 'Denise: "no snmp-server community rootcellar on every box it\'s on. Then a read-only community with an access list, snmp-server community nightwatch ro 40, so only my NMS may ask at all. The notifications go to snmp-server host, and snmp-server enable traps turns them on."' },
            { tone: 'press', say: 'Ace, who else knew that string?', reply: 'Ace turns the clipboard over again, looks at it, and turns it back. "Old Root. The people he trained. Some of them are dead and some of them left." She goes back out to the hall without another word, and Sticky follows her.' },
            { tone: 'quiet', say: '(Look at the other dots.)', reply: 'The map is all green. The market router\'s window shows the same second community, rootcellar, read-write. The gate router\'s shows only nightwatch; Denise fixed that one herself an hour before you came in.' }
          ] } },
        { k: 'LORE', title: 'THE STOPGAP THAT STAYED', year: 1988, real: ['ietf'], vibe: 'Most excellent. One screen watching every box on the net.',
          text: 'Denise, closing the window: "In August 1988 Jeffrey Case, Mark Fedor, Martin Schoffstall and James Davin published the Simple Network Management Protocol as RFC 1067. The IETF meant it as a short-term fix while a much bigger management system, from the OSI people, was finished. Nearly everyone kept the short-term fix. It\'s still the thing that tells me which box to worry about first."' },
        { k: 'KIT', text: 'Denise sticks a note to the bottom of the fourth screen.', kit: [
          { cmd: 'NMS (manager) · managed devices (agent) · MIB · OID', what: 'who asks, who answers, where the values live, the name of each value' },
          { cmd: 'Get · GetNext · GetBulk · Set · Response · Trap · Inform', what: 'read, read, read · write · response · notification (unacknowledged) · notification (acknowledged)' },
          { cmd: 'agent UDP 161 · manager UDP 162 · v1 · v2c · v3', what: 'v2c is common, communities in plain text; v3 authenticates and encrypts' },
          { cmd: 'snmp-server community nightwatch ro 40 · no snmp-server community rootcellar', what: 'a read-only string, only for the hosts ACL 40 permits · remove one' },
          { cmd: 'snmp-server contact TEXT · snmp-server location TEXT', what: 'who to call and where the box is' },
          { cmd: 'snmp-server host 10.37.9.50 version 2c nightwatch · snmp-server enable traps', what: 'where the notifications go, and switching them on' },
          { cmd: 'show snmp · show snmp community · show snmp host', what: 'the agent, the strings, the notification hosts' } ] },
        { k: 'SYNC', q: { prompt: 'Dora, eating an orange at the lease desk: "If the router tells the NMS a port went down and wants to know the NMS heard it, what does it send?"', opts: ['A Trap', 'A Response', 'An Inform', 'A GetNext'], a: 2,
          yes: 'Denise: "An Inform. It waits for the acknowledgement."', no: 'Denise: "An Inform. A Trap is sent and never acknowledged."',
          why: 'Denise: Both Trap and Inform are notifications the agent sends without being asked. A Trap is not acknowledged, so the agent never knows if it arrived. An Inform is acknowledged by the manager. A Response answers a Get, GetNext, GetBulk or Set, and GetNext comes from the manager.' } }
      ] },

    // ------------------------------------------------------------ night 41 · syslog
    { id: 'n41-on-air', title: 'The night band', sub: 'syslog', npc: 'beacon', day: [41], src: [PS('Syslog.md')], unlocks: ['syslog'],
      beats: [
        { k: 'SCENE', where: 'The exchange hall · the attic · Beacon\'s station, on air',
          lines: [
            { who: 'narr', text: 'The attic stairs are narrow, and the air at the top is hot and smells of warm electronics and cheap incense. A red bulb over the door says ON AIR. Inside, a woman with pink spiky hair leans into a microphone on a boom arm, and on the screen beside her mixing desk, lines of text scroll past, every one with a percent sign in it.' },
            { who: 'beacon', text: '...and that\'s the market router telling us port seven on the east stalls went down at two minutes past eleven and came back at four minutes past, so whoever kicked that cable, I heard you. This is Beacon on the Watson night band.' },
            { who: 'narr', text: 'She flips a switch, the red bulb goes dark, and a record starts on its own.' },
            { who: 'beacon', text: 'You\'re Ace\'s runner! Come in, mind the cables, sit on the amp. Every night I read the district\'s logs on air. Every Cisco box writes down what happens to it: a port going down, somebody logging in, somebody changing the config. That\'s [[syslog]].' },
            { who: 'beacon', text: 'By default a box only shows its messages on the console line and keeps them in a buffer in its own memory, and the buffer\'s gone when the power goes. Point the box at a syslog server and it sends every line there too, over UDP port 514. Mine is the grey box under this desk.' },
            { who: 'you', text: 'Why read them on air?' },
            { who: 'beacon', text: 'Because when the whole street hears that a router changed, the person who changed it has to explain it to the whole street.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'How do I read one of those lines?', reply: 'Beacon: "Left to right. A sequence number, if the box is set to number them. A timestamp. Then the percent sign and three words joined by dashes: the facility, the part of the box that\'s talking, like LINK or SYS; the severity, a number; and the mnemonic, a short code for what happened, like UPDOWN. After the colon, the description in plain words."' },
            { tone: 'press', say: 'What do the severity numbers mean?', reply: 'Beacon: "Lower is worse. 0 Emergency, 1 Alert, 2 Critical, 3 Error, 4 Warning, 5 Notice, 6 Informational, 7 Debugging. Every Awesome Cisco Engineer Will Need Ice cream Daily. When I set a level, the box sends that level and everything worse."' },
            { tone: 'joke', say: 'Do you take requests?', reply: 'Beacon: "From anyone who can tell me why channel 6 is the only channel worth broadcasting on. Nobody\'s managed it yet. Ask me again when you\'re ready to lose that argument."' }
          ] } },
        { k: 'SCENE', where: 'The attic · the scrolling screen', real: ['cisco'],
          lines: [
            { who: 'beacon', text: 'Every place a message can go has its own level. logging console for the console line, logging monitor for people on the VTY lines, and they also have to type terminal monitor to see anything. logging buffered for the buffer, with a size in bytes if you want a bigger one. And logging trap for the syslog servers, which you name with logging host or just logging and the address.' },
            { who: 'beacon', text: 'service timestamps log datetime msec puts the date and time on every line, from the box\'s clock, so it only helps if Denise has already fixed the clock. service sequence-numbers numbers them, so I know if one went missing. And logging synchronous on the console line keeps a message from landing in the middle of whatever you\'re typing.' },
            { who: 'narr', text: 'She scrolls back through a file she saved from the gate router\'s buffer, the morning the market\'s tills went dead. The timestamps say 3d04h, three days and four hours since the box last booted, and nothing about the date. She stops on one line and taps it with a fingernail painted the same pink as her hair.' },
            { who: 'beacon', text: 'Configured from console by vty0. That means somebody came in over the network, not with a cable in the console port, and changed the config. There\'s an address in brackets. I\'m not reading that one on air until Ace hears it first.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Why doesn\'t it say who logged in?', reply: 'Beacon: "Because the gate\'s VTY lines only ask for a password, one password for everyone. No username, so nothing to write down. Shell\'s been shouting about that for a year, and you\'re next."' },
            { tone: 'press', say: 'Couldn\'t someone just delete the log?', reply: 'Beacon: "From the buffer, easily, it\'s only memory. From my server, they\'d have to get into this attic. That\'s the point of sending it somewhere else the moment it happens."' },
            { tone: 'quiet', say: '(Read the rest of the file.)', reply: 'Four more lines follow the one she tapped: the same address logging out two minutes later, and then nothing but ports going up and down until the market opened.' }
          ] } },
        { k: 'LORE', title: 'WRITTEN DOWN TWENTY YEARS LATE', year: 2001, real: ['cisco', 'ietf'], vibe: 'Whatever. The logs were there all along; nobody had written down how.',
          text: 'Beacon, cueing the next record: "Eric Allman wrote syslog in the early eighties at Berkeley, for his mail program, Sendmail, and everything else on Unix started using it because it was there. Nobody wrote down how it worked for almost twenty years. In August 2001 Chris Lonvick at Cisco finally described it for the IETF in RFC 3164, the BSD syslog protocol. I keep a copy taped to the transmitter, because every line on this screen follows it."' },
        { k: 'KIT', text: 'Beacon scribbles on the back of a record sleeve.', kit: [
          { cmd: 'seq: timestamp: %FACILITY-SEVERITY-MNEMONIC: description', what: 'one syslog line, e.g. %LINK-3-UPDOWN' },
          { cmd: '0 Emergency · 1 Alert · 2 Critical · 3 Error · 4 Warning · 5 Notice · 6 Informational · 7 Debugging', what: 'a level sends that severity and everything worse' },
          { cmd: 'logging console 4 · logging monitor 6 · logging buffered 16384 6', what: 'console line, VTY lines, the buffer (with a size)' },
          { cmd: 'logging host 10.37.3.60 (or logging 10.37.3.60) · logging trap informational', what: 'a syslog server over UDP 514, and the level it gets' },
          { cmd: 'terminal monitor', what: 'on an SSH or Telnet session: show me the messages' },
          { cmd: 'service timestamps log datetime msec · service sequence-numbers', what: 'date and time on every line · number every line' },
          { cmd: 'line con 0 · logging synchronous', what: 'messages stop landing in the middle of your typing' },
          { cmd: 'show logging', what: 'the levels, the servers and the buffer' } ] },
        { k: 'SYNC', q: { prompt: 'Beacon, hand over the microphone switch: "A line comes in marked 4. Is that worse or better news than a 6?"', opts: ['Better. Higher numbers are worse', 'Worse. 4 is a Warning, 6 is only Informational', 'The same. Both are notifications', 'It depends on the facility'], a: 1,
          yes: 'Beacon: "Worse. A 4 is a Warning."', no: 'Beacon: "Worse. The lower the number, the worse the news."',
          why: 'Beacon: Syslog severity runs from 0, Emergency, the worst, down to 7, Debugging. 4 is Warning and 6 is Informational, so a 4 is worse news. The facility says which part of the box is talking, not how bad it is.' } }
      ] },

    // ------------------------------------------------------------ night 42 · SSH
    { id: 'n42-new-locks', title: 'New locks', sub: 'console port and VTY security, Telnet and SSH', npc: 'shell', day: [42], src: [PS('SSH.md')], unlocks: ['ssh'],
      beats: [
        { k: 'SCENE', where: 'The exchange hall · a workbench by the back stairs · ten at night',
          lines: [
            { who: 'narr', text: 'The corner by the back stairs smells of machine oil and brass filings. Someone in a dark hood and a cloth mask sits at a workbench, taking a padlock apart with a jeweller\'s screwdriver, pins laid out in a row on a rag. On a stool beside the bench, arms folded, sits a bald man with a grey beard you last saw guarding three painted doors in Kabuki.' },
            { who: 'shell', text: 'The gate\'s VTY lines let anyone in who knew one word, and that word crossed the wire in the clear every time somebody used it. That\'s [[Telnet]], TCP port 23. Anything plugged in along the way can read it all: the password, every command, every answer. The box on slot 24 was plugged in along the way.' },
            { who: 'enable', text: 'The console port is a door you must stand in front of. The VTY lines are sixteen doors, 0 to 15, and anyone can knock on them from anywhere. I have said so since this hall had a router.' },
            { who: 'you', text: 'So what goes on those sixteen doors?' },
            { who: 'shell', text: '[[SSH]], Secure Shell, TCP port 22. The same shell, but everything inside is encrypted, the login included. And every person gets a username of their own, so the log can finally say who.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What does a router need before it can speak SSH?', reply: 'Shell: "A hostname, a domain name, and an RSA key pair. The key is named after the [[FQDN]], the fully qualified domain name, which is the hostname and the domain together: R2.watson.net. crypto key generate rsa makes it, and SSH version 2 wants 768 bits at least. Then ip ssh version 2, a username with a secret, and on the VTY lines, login local and transport input ssh."' },
            { tone: 'press', say: 'Enable, there was a password on those doors. Why wasn\'t it enough?', reply: 'Enable: "A password is enough if nobody hears you say it. Over Telnet, the whole street hears. One word, shared by everyone, and the log cannot tell you whose mouth it came out of."' },
            { tone: 'care', say: 'Shell, why locks?', reply: 'Shell sets the screwdriver down. "Years ago somebody read the clinic router\'s password off a Telnet session in the market and switched the pharmacy off for a night. I spent the next month changing every lock in Watson. Now I\'m doing it again."' }
          ] } },
        { k: 'SCENE', where: 'The workbench · a router on the bench with its lid off', real: ['cisco'],
          lines: [
            { who: 'shell', text: 'Only some software can do it. The IOS images with K9 in their name carry the cryptography; the NPE ones, no payload encryption, can\'t do SSH at all. show version tells you which you have. show ip ssh tells you whether SSH is on and which version: 1.99 means the box speaks both 1 and 2, and I want 2 only.' },
            { who: 'shell', text: 'On the VTY lines: login local checks the username and password you made. transport input ssh refuses anything else; it can also say telnet, all or none. exec-timeout throws out a session that sits idle, and access-class with a standard list decides who may knock at all.' },
            { who: 'enable', text: 'And the console port. By default it asks for nothing. line console 0, then password and login for one word, or login local for a name. Do not leave the first door open because the other sixteen are locked.' },
            { who: 'shell', text: 'A switch gets the same locks on its management SVI, interface vlan1 with an address. It isn\'t a router, so it needs ip default-gateway, or it can hear you from another subnet and never answer.' },
            { who: 'enable', text: 'Then you save. Root always saved first, and twice. A lock you did not save falls off at the next power cut.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Why a standard list for access-class?', reply: 'Shell: "Because the question is only who is knocking. access-class 5 in on the VTY lines checks the source address of every new session against list 5, and the implicit deny turns everyone else away before they even see a login prompt."' },
            { tone: 'press', say: 'You two agree on anything?', reply: 'Enable: "We agree the doors need locks." Shell: "We disagree about which door matters most." Enable: "The one you forgot." Shell goes back to the padlock without answering, which Enable seems to count as a win.' },
            { tone: 'quiet', say: '(Watch Shell put the padlock back together.)', reply: 'Six pins go back in, each into its own chamber, in an order Shell doesn\'t need to check. The shackle clicks shut. Shell tries three keys from a ring, and only the last one turns.' }
          ] } },
        { k: 'LORE', title: 'THE SNIFFER IN HELSINKI', year: 1995, vibe: 'As if! Passwords flying across the wire in plain text for anyone with a sniffer.',
          text: 'Shell, putting the padlock in the bag: "In the spring of 1995 someone ran a password sniffer on the network at the Helsinki University of Technology and collected thousands of logins. A researcher there, Tatu Ylönen, wrote a program so that nothing typed at a remote shell ever crossed the wire in the clear again. He called it the Secure Shell and gave it away that July. Within months it was on computers all over the world. I learned my trade from his source code, the way other locksmiths learn from an old master\'s locks."' },
        { k: 'KIT', text: 'Shell hands you a key tag with the steps stamped into the brass.', real: ['cisco'], kit: [
          { cmd: 'hostname R2 · ip domain name watson.net · crypto key generate rsa modulus 2048', what: 'the key is named after the FQDN, R2.watson.net. 768 bits or more for SSHv2' },
          { cmd: 'ip ssh version 2 · show ip ssh · show version', what: '1.99 means versions 1 and 2. Only K9 images do SSH' },
          { cmd: 'username shell secret PASSWORD', what: 'a name for every person' },
          { cmd: 'line vty 0 15 · login local · transport input ssh · exec-timeout 5 0', what: 'sixteen doors: users, SSH only, out after five idle minutes' },
          { cmd: 'access-list 5 permit 10.37.9.0 0.0.0.255 · line vty 0 15 · access-class 5 in', what: 'only the admin subnet may knock' },
          { cmd: 'line console 0 · password WORD · login (or login local)', what: 'the console port asks for nothing until you tell it to' },
          { cmd: 'interface vlan1 · ip address 10.37.2.2 255.255.255.0 · ip default-gateway 10.37.2.1', what: 'a switch you can reach from another subnet' },
          { cmd: 'Telnet TCP 23, clear text · SSH TCP 22, encrypted · ssh -l shell 10.37.12.2', what: 'from a PC: connect as a user' } ] },
        { k: 'SYNC', q: { prompt: 'Enable, reading show ip ssh over your shoulder: "SSH Enabled, version 1.99. What does the box mean by that?"', opts: ['It is running a version between 1 and 2', 'It speaks both SSH version 1 and version 2', 'It speaks version 2 only', 'SSH is off until a key is made'], a: 1,
          yes: 'Shell: "Both. ip ssh version 2 makes it 2 only."', no: 'Shell: "1.99 means both 1 and 2. I want 2 only."',
          why: 'Shell: A box that supports SSH version 1 and version 2 at the same time reports version 1.99. SSHv1 has known weaknesses, so ip ssh version 2 limits it to version 2. show ip ssh shows the version in use.' } }
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
      ] },

    // ------------------------------------------------------------ night 46 · QoS, part 1, and voice VLANs
    { id: 'n46-pieces-of-a-word', title: 'Pieces of a word', sub: 'voice VLANs, PoE and QoS, part 1', npc: 'dispatch', day: [46], src: [PS('QoS_Part1.md')], unlocks: ['voice-vlan'],
      beats: [
        { k: 'SCENE', where: 'Dispatch\'s booth · the job board · a quarter to midnight',
          lines: [
            { who: 'narr', text: 'The booth smells of hot electronics and old coffee. Every radio on the shelf is turned down low, and together they hiss like rain on a tin roof. Dispatch sits with a headset pushed back and one hand on a fader, and for once there is no job slip on the counter.' },
            { who: 'dispatch', text: 'Clinic phones break up every evening. Imani called twice. You learn this one from me, tonight and tomorrow.' },
            { who: 'dispatch', text: 'Old phones rode the PSTN. Public switched telephone network. Own copper, POTS, plain old telephone service. Clinic went VoIP in the spring. Voice over IP. Same cables as the computers now.' },
            { who: 'dispatch', text: 'One socket per desk. Phone plugs into the wall, PC plugs into the phone. Switch port gets a [[voice VLAN]]. Phone tags its voice with it. PC sends untagged, lands in the access VLAN. Still an access port.' },
            { who: 'you', text: 'How does the phone know which VLAN to tag?' },
            { who: 'dispatch', text: 'Switch tells it. CDP. Same port feeds it power, too. [[PoE]]. Switch is the PSE, power sourcing equipment. Phone is the PD, powered device.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'How much power can one port give?', reply: 'Dispatch: "Depends. Cisco inline power, 7 watts, two pairs. PoE, 802.3af, 15 watts, two pairs. PoE+, 802.3at, 30, two pairs. UPoE and UPoE+, both 802.3bt, 60 and 100, all four pairs. Power policing stops a device drawing too much. power inline police, port goes err-disabled and logs it. Add action log, port restarts and logs it."' },
            { tone: 'press', say: 'Why not give the phones their own switch?', reply: 'Dispatch: "Money. Clinic has one cable to each bed. Two VLANs down one access port, voice tagged, data untagged. The phone does the sorting."' },
            { tone: 'quiet', say: '(Listen to the radios.)', reply: 'Under the hiss a courier calls in a drop, and a cab calls a fare across Kabuki, and each voice comes through whole. Dispatch taps the fader. "Every one of those waits in a queue somewhere, and mine are set to go first."' }
          ] } },
        { k: 'SCENE', where: 'The Watson clinic · the nurses\' station · ten past seven in the evening',
          lines: [
            { who: 'narr', text: 'The ward smells of hand gel and the dinner trolley, and monitors chirp one after another down the corridor. Imani holds a handset out to you across the desk. The voice in it arrives in pieces: a word, a gap, half a word.' },
            { who: 'Imani', text: 'That is the pharmacy downstairs. Every evening, when the day shift uploads its charts, the phones do this. The night of the loop I walked charts up three floors. I would rather not start walking prescriptions down.' },
            { who: 'narr', text: 'Dispatch, in your ear, over a radio with a bad battery:' },
            { who: 'dispatch', text: 'Four numbers. [[Bandwidth]], what the link holds. [[Delay]], time one way, source to destination. [[Jitter]], how much that delay changes packet to packet. Loss, packets that never arrive. Voice wants delay 150 milliseconds or less. Jitter 30 or less. Loss one percent or less.' },
            { who: 'dispatch', text: 'Seven o\'clock. Charts upload. Router\'s queue fills. Default is FIFO, first in, first out. Queue full, newest packets dropped. [[Tail drop]]. Voice packets land in the tail and the words drop out.' },
            { who: 'you', text: 'Can the router drop something else instead?' },
            { who: 'dispatch', text: 'Queues are tomorrow night; tonight is the VLANs.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What else goes wrong with tail drop?', reply: 'Dispatch: "Every TCP sender loses packets at the same moment. All of them slow down together and speed up together. Queue empties, fills, empties. TCP global synchronization. RED, random early detection, drops a few packets at random before the queue is full, so senders slow down one at a time. WRED does it by weight. Drops more of what matters less."' },
            { tone: 'care', say: 'Imani, how long has this been happening?', reply: 'Imani: "Since the new phones came in the spring. The old ones had their own copper and never broke up once. Now they share every cable on the ward with the computers."' },
            { tone: 'press', say: 'Just buy a bigger link.', reply: 'Dispatch: "Bigger link, bigger uploads. Queue still fills at seven. Voice has to go first. That is [[QoS]]."' }
          ] } },
        { k: 'LORE', title: 'A VOICE IN PACKETS', year: 1995, real: ['vocaltec'], vibe: 'Phat. Talk to anybody on the planet for the price of a modem call.',
          text: 'Dispatch, turning a radio down another notch: "February 1995. Small company in Israel, VocalTec. Sold a program called InternetPhone. One PC to another, voice cut into packets, across the internet. Needed a sound card, a microphone and patience. Sounded worse than this radio. Kept it because now it carries every call in the clinic."' },
        { k: 'KIT', text: 'Dispatch writes it on a job slip, the only one with no job on it.', kit: [
          { cmd: 'PSTN · POTS · VoIP', what: 'the old phone network, plain old telephone service, voice over IP' },
          { cmd: 'switchport mode access · switchport access vlan 10 · switchport voice vlan 11', what: 'PC untagged in VLAN 10, the phone tags its voice with VLAN 11. CDP tells the phone' },
          { cmd: 'show interfaces f0/1 switchport', what: 'Access Mode VLAN and Voice VLAN' },
          { cmd: 'PoE: the PSE (switch) powers the PD (phone)', what: 'Cisco ILP 7 W · 802.3af 15 W · 802.3at 30 W, two pairs · 802.3bt 60 W and 100 W, four pairs' },
          { cmd: 'power inline police · power inline police action log', what: 'too much power: err-disable and log · restart and log' },
          { cmd: 'voice: delay 150 ms or less one way · jitter 30 ms or less · loss 1% or less', what: 'bandwidth, delay, jitter, loss' },
          { cmd: 'FIFO · tail drop · TCP global synchronization · RED · WRED', what: 'a full queue drops the newest. Random early drops keep senders from moving together' } ] },
        { k: 'SYNC', q: { prompt: 'Imani, still holding the handset: "So the phone and my PC share one socket. Which one tags its traffic?"', opts: ['The phone, with the voice VLAN', 'The PC, with the access VLAN', 'Both of them', 'Neither. The switch tags everything'], a: 0,
          yes: 'Dispatch: "Phone. Next."', no: 'Dispatch: "Phone tags. PC does not."',
          why: 'Dispatch: With switchport voice vlan on the port, the phone tags its voice frames with the voice VLAN. The PC behind the phone sends untagged frames as usual, and the switch puts them in the access VLAN. The port stays an access port.' } }
      ] },

    // ------------------------------------------------------------ night 47 · QoS, part 2
    { id: 'n47-who-goes-first', title: 'Who goes first', sub: 'QoS, part 2', npc: 'dispatch', day: [47], src: [PS('QoS_Part2.md')], unlocks: ['qos'],
      beats: [
        { k: 'SCENE', where: 'Dispatch\'s booth · the job board · eleven at night',
          lines: [
            { who: 'narr', text: 'Rain drums on the booth\'s tin roof and the radios hiss under it. One set on the top shelf has a red strip of tape across its dial. When it crackles, Dispatch lifts the fader on it before the others, every time, without looking.' },
            { who: 'dispatch', text: 'That one is the clinic line, and it goes first. A router can do the same. Three jobs: classify, mark, queue.' },
            { who: 'dispatch', text: 'Classify first. Decide what a packet is, by access list, by NBAR, or by the mark already on it. NBAR is network based application recognition. Reads the traffic and names the application.' },
            { who: 'dispatch', text: 'Marks go in two places. Layer 2, the 802.1Q tag has three bits for it. PCP, or CoS. 0 is best effort, 3 is call signalling and critical, 4 is video, 5 is voice. Layer 3, the IP header. Used to be IP precedence, three bits. Now [[DSCP]], six bits.' },
            { who: 'you', text: 'Six bits is sixty-four values. Which ones matter?' },
            { who: 'dispatch', text: 'DF, default forwarding, 0. Best effort. EF, expedited forwarding, 46. Voice. AF, assured forwarding, AF11 to AF43: class times eight, plus drop precedence times two. CS, class selector, class times eight. RFC 4594 says voice EF, interactive video AF4x, streaming video AF3x, high priority data AF2x, best effort DF.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What does the second digit in AF mean?', reply: 'Dispatch: "Drop precedence. AF41, AF42, AF43, same class, same queue. When the queue fills, AF43 goes first, AF41 last. AF41 is 34, AF42 is 36, AF43 is 38. Class 3 is 26, 28, 30. Class 2 is 18, 20, 22. Class 1 is 10, 12, 14."' },
            { tone: 'press', say: 'Anyone can mark their own packets EF.', reply: 'Dispatch: "Right. So you choose where you start believing marks. [[Trust boundary]]. Clinic phones mark voice CoS 5 and call signalling CoS 3, so the boundary sits at the phone. Switch trusts the phone, not the PC behind it. PC marks EF, switch wipes it."' },
            { tone: 'quiet', say: '(Watch the red-taped radio.)', reply: 'It crackles twice in a minute, and twice the other radios dip under it. Nobody else in the queue is dropped. They wait a second longer, and then they are heard.' }
          ] } },
        { k: 'SCENE', where: 'The Watson clinic · the comms room · ten to seven in the evening',
          lines: [
            { who: 'narr', text: 'The comms room is warm and the router\'s fans are already louder than they were an hour ago. Upstairs the day shift is starting to save its charts. Imani leans in the doorway with a handset in one hand and her other hand over the mouthpiece.' },
            { who: 'Imani', text: 'The pharmacy is on the line. Tell me when to start talking.' },
            { who: 'dispatch', text: 'Queuing next. The router gives every class its own queue. CBWFQ, class-based weighted fair queuing. Takes turns round the queues by weight. Every class gets its minimum bandwidth. Voice cannot wait its turn, so voice goes in LLQ. Low latency queuing. A strict priority queue. Always emptied first.' },
            { who: 'dispatch', text: 'Provider polices the clinic at its rate. [[Policing]] drops what goes over. [[Shaping]] holds it in a queue and sends it later. Drop at the provider, TCP backs off, uploads crawl. Shape your own side, you choose what waits.' },
            { who: 'you', text: 'And if voice takes the whole link?' },
            { who: 'dispatch', text: 'priority percent 20. Voice gets up to a fifth of the link, ahead of everything, and anything over that is policed so the charts still get their share.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'How does the router know a chart upload from a web page?', reply: 'Dispatch: "NBAR. match protocol https in a class-map. Both are HTTPS, so both land in that class. Good enough. Charts are the busiest HTTPS on the ward at seven. Mark them AF21, high priority data."' },
            { tone: 'care', say: 'Imani, what time do you usually call the pharmacy?', reply: 'Imani: "Ten past seven, every night, when the drug round starts. It is the worst possible minute for the phones, and it is the one minute I cannot move."' },
            { tone: 'press', say: 'Why not police the uploads ourselves?', reply: 'Dispatch: "Policing drops. Nurse uploads a chart, packets dropped, TCP sends them again, chart takes longer. Shaping waits instead. Police the traffic you would rather drop, and shape the traffic you only need to slow down."' }
          ] } },
        { k: 'LORE', title: 'SIX BITS OF WHO GOES FIRST', year: 1998, real: ['ietf'], vibe: 'All that. The internet stopped treating every packet the same.',
          text: 'Dispatch, peeling the red tape off the dial and pressing it back down: "December 1998. RFC 2474. Nichols, Blake, Baker, Black. Took the old type of service byte in the IP header. Six bits of it became DSCP. Every packet since can say how much waiting it will stand. Kept it because a radio booth has worked that way since before either of us."' },
        { k: 'KIT', text: 'Dispatch hands over the job slip for tonight, written on both sides.', kit: [
          { cmd: 'PCP/CoS (3 bits, in the 802.1Q tag): 0 best effort · 3 critical, call signalling · 4 video · 5 voice', what: 'Layer 2 marks' },
          { cmd: 'DSCP (6 bits): DF 0 · EF 46 · AFxy = 8x + 2y · CSx = 8x', what: 'Layer 3 marks. IP precedence was the old 3 bits' },
          { cmd: 'RFC 4594: voice EF · interactive video AF4x · streaming video AF3x · high priority data AF2x · best effort DF', what: 'who gets which mark' },
          { cmd: 'class-map match-any VOICE → match dscp ef', what: 'classify by the mark on it (or match protocol https: NBAR)' },
          { cmd: 'policy-map WAN-OUT → class VOICE → priority percent 20 → class CHARTS → bandwidth percent 40', what: 'LLQ for voice, CBWFQ minimums for the rest' },
          { cmd: 'interface g0/1 → service-policy output WAN-OUT', what: 'apply it in one direction on one interface' },
          { cmd: 'mls qos trust device cisco-phone · mls qos trust cos', what: 'the trust boundary at the phone' },
          { cmd: 'shape average · police', what: 'shaping: traffic over the rate waits in a queue · policing: traffic over the rate is dropped' } ] },
        { k: 'SYNC', q: { prompt: 'Imani, hand still over the mouthpiece: "So what does my phone put on its voice, the thing that says it goes first?"', opts: ['DSCP EF, 46', 'DSCP AF41, 34', 'CoS 3', 'DSCP DF, 0'], a: 0,
          yes: 'Dispatch: "EF. Tell the pharmacy to hold one minute."', no: 'Dispatch: "EF, 46. Voice."',
          why: 'Dispatch: IP phones mark their voice DSCP EF, expedited forwarding, value 46, and CoS 5 on the tag. CoS 3 is what they put on call signalling. AF41 is interactive video, and DF, 0, is best effort.' } }
      ] }
  ] });
})();
