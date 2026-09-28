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
      ] }
  ] });
})();
