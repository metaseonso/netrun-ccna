/* District 06 · The Services — the exchange hall. Nights 37–42 here: NTP, DNS, DHCP, SNMP, syslog, SSH (Denise and her intern
   Dora, Beacon, Shell and Enable). Nights 30–33 and 43–47 are written alongside. Written to docs/STORY_BIBLE.md (Voice) and
   docs/CAMPAIGN_MAP.md. */
(function(){
  const { PS } = SRC;
  STAGES.push({ id: 'services', arc: 'grid', title: 'STAGE 6 · THE SERVICES', sub: 'TCP/UDP, IPv6, NTP, DNS, DHCP, SNMP, syslog, SSH, NAT, QoS', npc: 'denise', status: 'live', levels: [
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
            { who: 'Imani', text: 'The desks type records, like they always do, and this comes up asking for our passwords. I only caught it because it says Watson Clinc. Nobody\'s typed a password into it. I don\'t think.' },
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
            { tone: 'press', say: 'Why can\'t the router tell you who changed it?', reply: 'Denise: "Because everybody logs into it with the same password, from the same shell, and its log lives in its own memory. Ace keeps telling me that. Tonight I believe her."' },
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
            { tone: 'care', say: 'You built this map yourself?', reply: 'Denise: "Over six years, one dot at a time. Every dot is somebody who called me at three in the morning because the box was down and nobody had noticed. Now I notice first."' }
          ] } },
        { k: 'SCENE', where: 'The switchboard room · the clinic router\'s dot', real: ['ietf'],
          lines: [
            { who: 'denise', text: 'Three versions matter. v1 was first. v2c is the one everyone runs, with GetBulk and Informs added and still only a community string for a password. v3 adds real authentication and encryption, and it\'s the only one I\'d call secure.' },
            { who: 'narr', text: 'She clicks the clinic router\'s dot. A window opens with its details. Under communities there are two lines: nightwatch, read-only, which is hers, and one more, read-write, called rootcellar.' },
            { who: 'denise', text: 'Rootcellar. Old Root used that string on the clinic\'s first routers, twenty years ago, back when his own apprentices were running the cables. It was never supposed to leave the clinic. My backup from August doesn\'t have it on this router, or on the market\'s.' },
            { who: 'narr', text: 'Ace is in the doorway with Sticky. She reads the window over Denise\'s shoulder and says nothing at all. Then she turns her clipboard face down on the desk.' },
            { who: 'denise', text: 'Somebody who knew that string could have changed the gate\'s list at dawn without ever opening a shell. With Set.' }
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
      ] }
  ] });
})();
