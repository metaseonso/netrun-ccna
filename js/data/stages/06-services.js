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
      ] }
  ] });
})();
