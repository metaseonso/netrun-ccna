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
      ] }
  ] });
})();
