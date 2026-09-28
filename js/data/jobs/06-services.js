/* jobs/06-services.js — District 06 · The Services (the exchange hall): TCP and UDP, IPv6, NTP, DNS, DHCP, SNMP, syslog, SSH, FTP and TFTP, NAT, QoS. */
(function(){
  // the exchange hall's routers for nights 37–42: R1 the gate, R2 the clinic, R3 the market; the roof clock and the hall's servers hang off R1
  const hallNet = (extra, extraLinks, extraPre) => ({
    devices: Object.assign({ R1: { kind: 'router' }, R2: { kind: 'router' }, R3: { kind: 'router' },
      CLOCK: { kind: 'server', ip: '10.37.9.9', mask: '255.255.255.0', gw: '10.37.9.1', ntpStratum: 1 } }, extra || {}),
    links: [ { a: 'CLOCK', b: 'R1', bp: 'gigabitethernet0/2' }, { a: 'R1', ap: 'gigabitethernet0/1', b: 'R2', bp: 'gigabitethernet0/1' }, { a: 'R1', ap: 'gigabitethernet0/0', b: 'R3', bp: 'gigabitethernet0/0' } ].concat(extraLinks || []),
    preconfig: {
      R1: ['hostname R1', 'interface gigabitethernet0/2', 'ip address 10.37.9.1 255.255.255.0', 'no shutdown', 'interface gigabitethernet0/1', 'ip address 10.37.12.1 255.255.255.252', 'no shutdown',
        'interface gigabitethernet0/0', 'ip address 10.37.13.1 255.255.255.252', 'no shutdown', 'interface loopback0', 'ip address 10.37.255.1 255.255.255.255', 'exit',
        'ip route 10.37.2.0 255.255.255.0 10.37.12.2', 'ip route 10.37.3.0 255.255.255.0 10.37.13.2'].concat((extraPre || {}).R1 || []),
      R2: ['hostname R2', 'interface gigabitethernet0/1', 'ip address 10.37.12.2 255.255.255.252', 'no shutdown', 'interface gigabitethernet0/0', 'ip address 10.37.2.1 255.255.255.0', 'no shutdown', 'exit',
        'ip route 0.0.0.0 0.0.0.0 10.37.12.1'].concat((extraPre || {}).R2 || []),
      R3: ['hostname R3', 'interface gigabitethernet0/0', 'ip address 10.37.13.2 255.255.255.252', 'no shutdown', 'interface gigabitethernet0/1', 'ip address 10.37.3.1 255.255.255.0', 'no shutdown', 'exit',
        'ip route 0.0.0.0 0.0.0.0 10.37.13.1'].concat((extraPre || {}).R3 || [])
    }
  });
  const hallMap = (extraNodes, extraLinks) => ({ w: 560, h: 340, nodes: [
      { id: 'CLOCK', label: 'roof clock (GPS)', type: 'server', x: 280, y: 40 }, { id: 'R1', label: 'gate router', type: 'router', x: 280, y: 130 },
      { id: 'R2', label: 'clinic router', type: 'router', x: 120, y: 220 }, { id: 'R3', label: 'market router', type: 'router', x: 440, y: 220 } ].concat(extraNodes || []),
    links: [ { a: 'CLOCK', b: 'R1', tag: 'g0/2' }, { a: 'R1', b: 'R2', tag: 'g0/1' }, { a: 'R1', b: 'R3', tag: 'g0/0' } ].concat(extraLinks || []) });

  JOBS.push(
    // ------------------------------------------------------------------ night 37 · from Lab 37 (NTP)
    { id: 'b-n37-one-clock', cls: 'B', rep: 20, from: 'denise', title: 'One Clock for Watson', day: [37], requires: ['n37-one-clock'], devices: ['R2', 'R1', 'R3'],
      brief: 'DISPATCH » Denise can\'t line up the gate\'s, the clinic\'s and the market\'s logs for Ace, because the three routers disagree about the time. Put them all on the Exchange\'s roof clock.\n\nCLIENT (Denise) » "The gate asks the roof, the clinic and the market ask the gate. And lock the clinic\'s clock, so nobody can hand it a fake one."',
      net: hallNet(), map: hallMap(),
      steps: [
        { type: 'cmd', skill: 'ntp', text: 'Denise, in your ear: "Start with the clinic. Ask R2 what time it thinks it is."',
          need: [ { dev: 'R2', line: /^(do )?show clock( detail)?$/ } ],
          hint: 'R2> show clock', ok: 'Denise: "There\'s the star, and there\'s 1993."',
          why: 'Denise: show clock prints the software clock, the one the logs use. Nobody set R2\'s, so it started at the IOS default, 1 March 1993, in UTC, with a star in front.' },
        { type: 'choice', skill: 'ntp', text: 'Dora, reading over your shoulder: "What does the star mean?"',
          opts: ['The clock is on summer time', 'The box is set to UTC', 'The time is not authoritative: nobody set it and nothing has synchronised it', 'NTP is synchronised and trusted'], a: 2,
          hint: 'It is there before anybody has done anything to the clock.', ok: 'Denise: "Right. Don\'t trust anything logged by a clock with a star."',
          why: 'Denise: A star in front of show clock means the time is not authoritative. The software clock was never set by hand and never synchronised by NTP, so it is still counting from the hardware calendar or the 1993 default.' },
        { type: 'cmd', skill: 'ntp', text: 'Denise: "The gate first. Make R1 a client of the roof clock at 10.37.9.9."',
          check: (d, ctx) => { const t = ctx.net().ntp('R1'); return t.synced && t.server === '10.37.9.9' && t.stratum === 2; },
          hint: 'R1> enable\nR1# configure terminal\nR1(config)# ntp server 10.37.9.9', ok: 'Denise: "Stratum 2. The gate knows the time."',
          why: 'Denise: ntp server 10.37.9.9 makes R1 ask the roof clock for the time. The roof clock is stratum 1, wired to the GPS at stratum 0, so R1 becomes stratum 2. show ntp status confirms it: synchronised, stratum 2, reference 10.37.9.9.' },
        { type: 'cmd', skill: 'ntp', text: 'Denise: "Now the gate serves the other two. Have R1 speak NTP from its loopback, 10.37.255.1, so it answers from one address whatever port the question comes in on, and point R2 and R3 at that address."',
          check: (d, ctx) => { const n = ctx.net(); const a = n.ntp('R2'), b = n.ntp('R3'); return ctx.cfg('R1').ntpSource === 'loopback0' && a.synced && a.server === '10.37.255.1' && b.synced && b.server === '10.37.255.1'; },
          hint: 'R1(config)# ntp source loopback0\nR2(config)# ntp server 10.37.255.1\nR3(config)# ntp server 10.37.255.1', ok: 'Denise: "All three agree. Stratum 3 on the clinic and the market."',
          why: 'Denise: R1 is a client of the roof and a server for everyone below it at the same time. ntp source loopback0 makes R1 send its NTP messages from the loopback, an address that stays up as long as any path to R1 does. ntp server 10.37.255.1 on R2 and R3 makes them clients of R1, one stratum further down: 3.' },
        { type: 'form', skill: 'ntp', text: 'Dora, with the clipboard: "Denise says I have to know the ladder by heart. Check me?"',
          fields: [ { key: 'gps', label: 'the GPS reference clock', options: ['0', '1', '2', '3', '8', '15', '16'], answer: '0' }, { key: 'roof', label: 'the roof clock', options: ['0', '1', '2', '3', '8', '15', '16'], answer: '1' },
            { key: 'clinic', label: 'the clinic router, now', options: ['0', '1', '2', '3', '8', '15', '16'], answer: '3' }, { key: 'max', label: 'the highest stratum still trusted', options: ['0', '1', '2', '3', '8', '15', '16'], answer: '15' },
            { key: 'master', label: 'ntp master with no number', options: ['0', '1', '2', '3', '8', '15', '16'], answer: '8' }, { key: 'port', label: 'NTP runs on', options: ['UDP 123', 'TCP 123', 'UDP 514', 'UDP 161'], answer: 'UDP 123' } ],
          hint: 'Count one per hop from the GPS. Master defaults to eight. 16 means unsynchronised.', ok: 'Dora: "I got the master one wrong in my head. Eight. Thank you."',
          why: 'Denise: Reference clocks are stratum 0, the servers wired to them are stratum 1 (primary servers), and each hop down adds one (secondary servers), so the clinic is 3. Anything above 15 is treated as unreliable and a box will not sync to it; 16 means unsynchronised. ntp master without a number serves the box\'s own clock at stratum 8. NTP uses UDP port 123.' },
        { type: 'cmd', skill: 'ntp', text: 'Denise: "The nurses read the clinic\'s logs in local time. Put R2 on Pacific time, minus eight, with summer time, and have NTP keep its battery clock right too."',
          check: (d, ctx) => { const c = ctx.cfg('R2'); return !!(c.clockTz && c.clockTz.h === -8 && c.summerTime && c.ntpUpdateCalendar); },
          hint: 'R2(config)# clock timezone PST -8\nR2(config)# clock summer-time PDT recurring\nR2(config)# ntp update-calendar', ok: 'Denise: "show clock says PDT now, no star. The nurses can read it."',
          why: 'Denise: clock timezone PST -8 shifts what show clock prints by eight hours behind UTC; NTP itself keeps counting in UTC underneath. clock summer-time PDT recurring adds the daylight saving hour between March and November. ntp update-calendar writes the NTP time into the hardware calendar, so after a reboot the clock starts from the right time instead of the old battery time.' },
        { type: 'cmd', skill: 'ntp', text: 'Denise: "Now lock it. The clinic should only take time from a gate that knows key 1, rooftime. Give the key to R1 as well, or the clinic will stop believing it."',
          check: (d, ctx) => { const t = ctx.net().ntp('R2'); return !!ctx.cfg('R2').ntpAuth && t.synced && t.server === '10.37.255.1'; },
          hint: 'R1(config)# ntp authentication-key 1 md5 rooftime\nR2(config)# ntp authenticate\nR2(config)# ntp authentication-key 1 md5 rooftime\nR2(config)# ntp trusted-key 1\nR2(config)# ntp server 10.37.255.1 key 1',
          ok: 'Denise: "Locked, and still synchronised. Anyone who wants to lie to the clinic about the time needs the key now."',
          why: 'Denise: ntp authenticate makes R2 refuse time that is not authenticated. ntp authentication-key 1 md5 rooftime defines key 1, ntp trusted-key 1 says key 1 is believed, and ntp server 10.37.255.1 key 1 says that server must use it. R1 needs the same key 1 with the same string, or R2 rejects it and falls back to unsynchronised.' },
        { type: 'choice', skill: 'ntp', text: 'Denise, stretching: "Last one. If the gate goes down, I want the clinic and the market to keep each other honest until it comes back. They\'re both stratum 3. What do I type?"',
          opts: ['ntp master on both of them', 'ntp peer on each, pointing at the other', 'ntp server 0.0.0.0 on both', 'ntp source g0/0 on both'], a: 1,
          hint: 'Two servers at the same level, backing each other up.', ok: 'Denise: "Peers. Symmetric active. They\'ll hold the time together for a while."',
          why: 'Denise: ntp peer points two boxes at each other as equals, symmetric active mode, so each can take time from the other. ntp master would make each trust its own clock, which drifts; the other two commands do not make a box serve time at all.' }
      ],
      solution: [ { dev: 'R2', type: ['enable', 'show clock'] }, 'commit', { choose: 2 }, 'commit',
        { dev: 'R1', type: ['enable', 'configure terminal', 'ntp server 10.37.9.9'] }, 'commit',
        { dev: 'R1', type: ['ntp source loopback0'] }, { dev: 'R2', type: ['configure terminal', 'ntp server 10.37.255.1'] }, { dev: 'R3', type: ['enable', 'configure terminal', 'ntp server 10.37.255.1'] }, 'commit',
        { form: { gps: '0', roof: '1', clinic: '3', max: '15', master: '8', port: 'UDP 123' } }, 'commit',
        { dev: 'R2', type: ['clock timezone PST -8', 'clock summer-time PDT recurring', 'ntp update-calendar'] }, 'commit',
        { dev: 'R1', type: ['ntp authentication-key 1 md5 rooftime'] }, { dev: 'R2', type: ['ntp authenticate', 'ntp authentication-key 1 md5 rooftime', 'ntp trusted-key 1', 'ntp server 10.37.255.1 key 1'] }, 'commit',
        { choose: 1 }, 'commit' ],
      outro: 'At three Denise tapes the three logs back on the wall, in one order now, every line in step with the roof. The dawn change on the gate router lands four hours and twenty minutes after the kiosk\'s knock, and Ace reads the two lines side by side for a long time before she writes anything down.' }
  );
})();
