/* jobs/03-floor.js — District 03 · The Floor (the switch floor under the market): switching, ARP, switch interfaces, VLANs, trunks, DTP and VTP, EtherChannel, CDP and LLDP. */
(function(){
  JOBS.push(
    // ------------------------------------------------------------------ night 36 · from Lab 36 (CDP and LLDP)
    { id: 'b-n36-slot-24', cls: 'B', rep: 20, from: 'mac', title: 'Slot Twenty-Four', day: [36], requires: ['n36-next-door'], devices: ['SW2', 'R1', 'SW1', 'SW3'],
      brief: 'DISPATCH » The clinic\'s old cable ends on the switch floor, in a box nobody owns. Mac wants to know what it heard, then the floor made quiet where it should be and talking where it should be.\n\nCLIENT (Mac) » "Get its name and its address for Ace, then pull it. After that, the cameras on the west stalls need LLDP."',
      net: {
        devices: {
          R1: { kind: 'router' }, EXCH: { kind: 'router' }, SW1: { kind: 'switch', mac: '0036.0000.0001' }, SW2: { kind: 'switch', mac: '0036.0000.0002' }, SW3: { kind: 'switch', mac: '0036.0000.0003' },
          'TEST-04': { kind: 'switch', mac: '0036.0000.0099' }
        },
        links: [ { a: 'EXCH', ap: 'gigabitethernet0/0', b: 'R1', bp: 'gigabitethernet0/1' }, { a: 'R1', ap: 'gigabitethernet0/0', b: 'SW1', bp: 'gigabitethernet0/1' },
          { a: 'SW1', ap: 'gigabitethernet0/2', b: 'SW2', bp: 'gigabitethernet0/1' }, { a: 'SW1', ap: 'gigabitethernet0/3', b: 'SW3', bp: 'gigabitethernet0/1' }, { a: 'SW2', ap: 'fastethernet0/24', b: 'TEST-04', bp: 'gigabitethernet0/1' } ],
        preconfig: {
          EXCH: ['hostname EXCH', 'interface gigabitethernet0/0', 'ip address 172.16.36.1 255.255.255.252', 'no shutdown'],
          R1: ['hostname R1', 'interface gigabitethernet0/0', 'ip address 10.36.0.1 255.255.255.0', 'no shutdown', 'interface gigabitethernet0/1', 'ip address 172.16.36.2 255.255.255.252', 'no shutdown'],
          SW1: ['hostname SW1', 'interface vlan1', 'ip address 10.36.0.11 255.255.255.0', 'no shutdown'], SW2: ['hostname SW2', 'interface vlan1', 'ip address 10.36.0.12 255.255.255.0', 'no shutdown'],
          SW3: ['hostname SW3', 'interface vlan1', 'ip address 10.36.0.13 255.255.255.0', 'no shutdown'], 'TEST-04': ['hostname TEST-04', 'interface vlan1', 'ip address 10.36.0.99 255.255.255.0', 'no shutdown']
        }
      },
      map: { w: 560, h: 340, nodes: [
          { id: 'EXCH', label: 'the Exchange\'s router', type: 'router', x: 280, y: 36 }, { id: 'R1', label: 'market router', type: 'router', x: 280, y: 110 }, { id: 'SW1', label: 'floor core', type: 'switch', x: 280, y: 190 },
          { id: 'SW2', label: 'east stalls', type: 'switch', x: 130, y: 270 }, { id: 'SW3', label: 'west stalls', type: 'switch', x: 430, y: 270 }, { id: 'TEST-04', label: '? (slot 24)', type: 'switch', x: 40, y: 190 } ],
        links: [ { a: 'EXCH', b: 'R1' }, { a: 'R1', b: 'SW1' }, { a: 'SW1', b: 'SW2' }, { a: 'SW1', b: 'SW3' }, { a: 'SW2', b: 'TEST-04', tag: 'the old cable' } ] },
      steps: [
        { type: 'cmd', skill: 'cdp-lldp', text: 'Mac, leaning on the rack: "Ask SW2 who its neighbours are. Slot 24 is Fa0/24."',
          need: [ { dev: 'SW2', line: /^(do )?show cdp neighbors( detail)?$/ } ],
          hint: 'SW2> enable\nSW2# show cdp neighbors', ok: 'Mac: "There. Fa0/24, a switch, and it answered with a name."',
          why: 'Mac: show cdp neighbors lists every Cisco box that has said hello on one of SW2\'s ports: its device ID, which is its hostname, the local port, the holdtime left, what it is, its model, and the port on its side. The box on the old cable is a Cisco switch, so it said hello like everyone else.' },
        { type: 'calc', skill: 'cdp-lldp', text: 'Mac, pen out: "Ace wants two things off it: the name it gives and its IP address. The address is only in the detail."',
          fields: [ { key: 'name', label: 'its hostname (device ID)', check: v => String(v).trim().toLowerCase() === 'test-04' }, { key: 'ip', label: 'its IP address', check: v => String(v).trim() === '10.36.0.99' } ],
          answer: 'TEST-04 · 10.36.0.99', hint: 'SW2# show cdp neighbors detail', ok: 'Mac: "TEST-04, at 10.36.0.99. Somebody numbers their toys."',
          why: 'Mac: show cdp neighbors detail adds each neighbour\'s entry address, its IP, and its platform and software version. The device ID is the hostname the box gave itself, TEST-04, and its entry address is 10.36.0.99, on the floor\'s own subnet.' },
        { type: 'cmd', skill: 'cdp-lldp', text: 'Mac: "Got it. Now turn CDP off on slot 24, so whatever gets plugged in there next hears nothing from us, and shut the port. Ace will take the box."',
          check: (d, ctx) => { const i = ctx.cfg('SW2').interfaces['fastethernet0/24']; return !!(i && i.cdpOff && i.shutdown === true); },
          onPass: (ctx) => { ctx.netDef.devices['TEST-04'].removed = true; },
          hint: 'SW2# configure terminal\nSW2(config)# interface f0/24\nSW2(config-if)# no cdp enable\nSW2(config-if)# shutdown', ok: 'Mac: "Quiet, and dark. Ace is on her way down with a bag."',
          why: 'Mac: no cdp enable on an interface stops CDP on that one port, in and out, and leaves it running everywhere else. shutdown turns the port off. With both, anything plugged into slot 24 later gets no link and, if someone turns the port back on, still no hellos.' },
        { type: 'form', skill: 'cdp-lldp', text: 'Ace, arriving with the switch in a bag and Sticky at her heel: "How long was it hearing us, and how often? Give me CDP\'s numbers."',
          fields: [ { key: 'timer', label: 'CDP hello every', options: ['30 seconds', '60 seconds', '120 seconds', '180 seconds'], answer: '60 seconds' },
            { key: 'hold', label: 'CDP holdtime', options: ['30 seconds', '60 seconds', '120 seconds', '180 seconds'], answer: '180 seconds' },
            { key: 'ver', label: 'CDP version by default', options: ['CDPv1', 'CDPv2'], answer: 'CDPv2' },
            { key: 'mac', label: 'CDP multicast MAC', options: ['0100.0CCC.CCCC', '0180.C200.000E', 'FFFF.FFFF.FFFF', '0100.0CCC.CCCD'], answer: '0100.0CCC.CCCC' } ],
          hint: 'A minute, three minutes, version 2, and the Cisco address with all the Cs.', ok: 'Ace: "A hello a minute, for weeks. It heard everything."',
          why: 'Mac: CDP sends a hello every 60 seconds and a neighbour is kept for 180 seconds after its last one, the holdtime. CDPv2 is the default version. The hellos go to the multicast MAC 0100.0CCC.CCCC. 0180.C200.000E is LLDP\'s address, and FFFF.FFFF.FFFF is broadcast.' },
        { type: 'cmd', skill: 'cdp-lldp', text: 'Mac: "One more leak. R1\'s g0/1 faces the Exchange\'s router, which isn\'t ours, and whoever runs that box can read R1\'s name, model and software. Stop CDP on that port only. R1 must still see SW1."',
          check: (d, ctx) => { const n = ctx.net(); const ex = n.neighbors('R1').find(x => x.dev === 'EXCH'), sw = n.neighbors('R1').find(x => x.dev === 'SW1'); return !!(ex && !ex.cdp && sw && sw.cdp); },
          hint: 'R1> enable\nR1# configure terminal\nR1(config)# interface g0/1\nR1(config-if)# no cdp enable', ok: 'Mac: "The Exchange sees a cable and a light, and nothing else."',
          why: 'Mac: no cdp enable on g0/1 stops CDP on the port facing the Exchange, in both directions, while R1 keeps its hellos with SW1 on g0/0. no cdp run would have done too much: it turns CDP off on the whole router, and we\'d lose R1 from our own map.' },
        { type: 'cmd', skill: 'cdp-lldp', text: 'Mac: "The cameras on the west stalls speak LLDP only, and their controller wants to see the floor. Turn LLDP on for SW1 and SW3, so they introduce themselves to each other."',
          check: (d, ctx) => { const n = ctx.net(); const a = n.neighbors('SW3').find(x => x.dev === 'SW1'), b = n.neighbors('SW1').find(x => x.dev === 'SW3'); return !!(a && a.lldp && b && b.lldp); },
          hint: 'SW1# configure terminal\nSW1(config)# lldp run\n(and the same on SW3)', ok: 'Mac: "They\'re talking. Twice as often as CDP, too."',
          why: 'Mac: LLDP is off by default on Cisco switches. lldp run in global config turns it on for the whole box, and every port then transmits and receives LLDP unless you say no lldp transmit or no lldp receive on it. Both ends need it, because each one has to send its own hello.' },
        { type: 'cmd', skill: 'cdp-lldp', text: 'Mac: "Check it from SW3\'s side with LLDP\'s own command."',
          need: [ { dev: 'SW3', line: /^(do )?show lldp neighbors( detail)?$/ } ], check: (d, ctx) => { const a = ctx.net().neighbors('SW3').find(x => x.dev === 'SW1'); return !!(a && a.lldp); },
          hint: 'SW3# show lldp neighbors', ok: 'Mac: "SW1, on Gi0/1, holdtime 120. The installer can plug in."',
          why: 'Mac: show lldp neighbors is LLDP\'s version of show cdp neighbors: the neighbour\'s name, the local port, the holdtime and the port on its side. show lldp neighbors detail adds the addresses, and show lldp shows the timers.' },
        { type: 'form', skill: 'cdp-lldp', text: 'The camera installer, reading from a manual: "Our controller asks for LLDP\'s numbers. Can you fill these in?"',
          fields: [ { key: 'timer', label: 'LLDP hello every', options: ['2 seconds', '30 seconds', '60 seconds', '120 seconds', '180 seconds'], answer: '30 seconds' },
            { key: 'hold', label: 'LLDP holdtime', options: ['2 seconds', '30 seconds', '60 seconds', '120 seconds', '180 seconds'], answer: '120 seconds' },
            { key: 'reinit', label: 'LLDP reinitialisation delay', options: ['2 seconds', '30 seconds', '60 seconds', '120 seconds', '180 seconds'], answer: '2 seconds' },
            { key: 'mac', label: 'LLDP multicast MAC', options: ['0100.0CCC.CCCC', '0180.C200.000E', 'FFFF.FFFF.FFFF'], answer: '0180.C200.000E' } ],
          hint: 'Half of CDP\'s numbers, roughly, and the IEEE\'s address.', ok: 'Installer: "Thirty, a hundred and twenty, two. Thank you."',
          why: 'Mac: LLDP sends a hello every 30 seconds, keeps a neighbour for 120 seconds, and waits 2 seconds before starting up on a port that has just been enabled, the reinitialisation delay. Its frames go to 0180.C200.000E. You change them with lldp timer, lldp holdtime and lldp reinit.' }
      ],
      solution: [ { dev: 'SW2', type: ['enable', 'show cdp neighbors', 'show cdp neighbors detail'] }, 'commit',
        { calc: { name: 'TEST-04', ip: '10.36.0.99' } }, 'commit',
        { dev: 'SW2', type: ['configure terminal', 'interface f0/24', 'no cdp enable', 'shutdown', 'end'] }, 'commit',
        { form: { timer: '60 seconds', hold: '180 seconds', ver: 'CDPv2', mac: '0100.0CCC.CCCC' } }, 'commit',
        { dev: 'R1', type: ['enable', 'configure terminal', 'interface g0/1', 'no cdp enable', 'end'] }, 'commit',
        { dev: 'SW1', type: ['enable', 'configure terminal', 'lldp run', 'end'] }, { dev: 'SW3', type: ['enable', 'configure terminal', 'lldp run', 'end'] }, 'commit',
        { dev: 'SW3', type: ['show lldp neighbors'] }, 'commit',
        { form: { timer: '30 seconds', hold: '120 seconds', reinit: '2 seconds', mac: '0180.C200.000E' } }, 'commit' ],
      outro: 'The cameras go up on the west stalls the next morning, and their controller draws the floor for the first time. Ace carries TEST-04 out in a bag without opening it and writes 10.36.0.99 in the column under the pencilled date. Mac hangs a sign on slot 24: ASK ME FIRST.' }
  );
})();
