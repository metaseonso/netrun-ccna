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
      ] }
  ] });
})();
