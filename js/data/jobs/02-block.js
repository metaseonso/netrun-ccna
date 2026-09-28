/* jobs/02-block.js — District 02 · The Block (Cider's bar): IPv4 addresses, the IPv4 header, subnetting, VLSM. */
(function(){
  JOBS.push(
    // ------------------------------------------------------------------ night 7 · a topic gig (no lab): addresses, classes, a port that is down
    { id: 'd-n07-coasters', cls: 'D', rep: 10, from: 'cider', title: 'Coasters', day: [7], requires: ['n07-the-counter'], devices: ['R1'],
      brief: 'DISPATCH » Cider has a stack of coasters with addresses on them and a jukebox that went quiet. Work through the coasters, then get the jukebox back.\n\nCLIENT (Cider) » "Show me you can count, then fix my music. In that order."',
      net: {
        devices: { R1: { kind: 'router' }, SW1: { kind: 'switch', mac: '0011.2207.0001' }, SW2: { kind: 'switch', mac: '0011.2207.0002' },
          TILL: { kind: 'host', ip: '192.168.1.20', mask: '255.255.255.0', gw: '192.168.1.1' }, JUKEBOX: { kind: 'host', ip: '192.168.7.20', mask: '255.255.255.0', gw: '192.168.7.1' } },
        links: [ { a: 'R1', ap: 'gigabitethernet0/0', b: 'SW1', bp: 'gigabitethernet0/1' }, { a: 'SW1', ap: 'fastethernet0/1', b: 'TILL' }, { a: 'R1', ap: 'gigabitethernet0/1', b: 'SW2', bp: 'gigabitethernet0/1' }, { a: 'SW2', ap: 'fastethernet0/1', b: 'JUKEBOX' } ],
        preconfig: { R1: ['hostname CIDER', 'interface gigabitethernet0/0', 'ip address 192.168.1.1 255.255.255.0', 'no shutdown', 'interface gigabitethernet0/1', 'ip address 192.168.7.1 255.255.255.0'] }
      },
      map: { w: 520, h: 280, nodes: [ { id: 'R1', label: 'CIDER (the bar router)', type: 'router', x: 260, y: 60 }, { id: 'SW1', label: 'bar switch', type: 'switch', x: 140, y: 150 }, { id: 'SW2', label: 'back room switch', type: 'switch', x: 380, y: 150 },
          { id: 'TILL', label: 'till', type: 'pc', x: 140, y: 236 }, { id: 'JUKEBOX', label: 'jukebox', type: 'pc', x: 380, y: 236 } ],
        links: [ { a: 'R1', b: 'SW1' }, { a: 'SW1', b: 'TILL' }, { a: 'R1', b: 'SW2' }, { a: 'SW2', b: 'JUKEBOX' } ] },
      steps: [
        { type: 'calc', skill: 'ipv4-addr', text: 'Cider, sliding the first coaster over: "Binary on the front, decimal on the back, and I\'ve rubbed half of them out. Fill them in."',
          fields: [ { key: 'a', label: '11000000 in decimal', check: v => +v === 192 }, { key: 'b', label: '10101000 in decimal', check: v => +v === 168 },
            { key: 'c', label: '77 in binary (8 bits)', check: v => String(v).replace(/\s/g, '') === '01001101' } ],
          answer: '192 · 168 · 01001101', hint: 'Bit values from the left: 128 64 32 16 8 4 2 1.', ok: 'Cider: "One ninety-two, one sixty-eight, and 77 is 64 plus 8 plus 4 plus 1."',
          why: 'Cider: Each bit of an octet is worth 128, 64, 32, 16, 8, 4, 2, 1 from the left. 11000000 is 128 + 64 = 192. 10101000 is 128 + 32 + 8 = 168. For 77: no 128, one 64 (13 left), no 32, no 16, one 8 (5 left), one 4 (1 left), no 2, one 1, so 01001101.' },
        { type: 'form', skill: 'ipv4-addr', text: 'Cider: "Second coaster. Sort these by what they are."',
          fields: [ { key: 'a', label: '10.4.4.4', options: ['Class A', 'Class B', 'Class C', 'Class D (multicast)', 'loopback'], answer: 'Class A' },
            { key: 'b', label: '172.20.1.1', options: ['Class A', 'Class B', 'Class C', 'Class D (multicast)', 'loopback'], answer: 'Class B' },
            { key: 'c', label: '192.168.7.7', options: ['Class A', 'Class B', 'Class C', 'Class D (multicast)', 'loopback'], answer: 'Class C' },
            { key: 'd', label: '224.0.0.5', options: ['Class A', 'Class B', 'Class C', 'Class D (multicast)', 'loopback'], answer: 'Class D (multicast)' },
            { key: 'e', label: '127.0.0.1', options: ['Class A', 'Class B', 'Class C', 'Class D (multicast)', 'loopback'], answer: 'loopback' } ],
          hint: 'A 0–127, B 128–191, C 192–223, D 224–239. 127 is kept for loopback.', ok: 'Cider: "All five. That one at the bottom talks only to itself."',
          why: 'Cider: The first octet decides the class. 10 is 0–127, class A. 172 is 128–191, class B. 192 is 192–223, class C. 224 is 224–239, class D, multicast. 127 falls in the class A range but is reserved for loopback, a device testing its own network stack.' },
        { type: 'form', skill: 'ipv4-addr', text: 'Cider: "Third coaster: the default mask for each class. The Board asks for these in its sleep."',
          fields: [ { key: 'a', label: 'Class A (/8)', options: ['255.0.0.0', '255.255.0.0', '255.255.255.0'], answer: '255.0.0.0' }, { key: 'b', label: 'Class B (/16)', options: ['255.0.0.0', '255.255.0.0', '255.255.255.0'], answer: '255.255.0.0' },
            { key: 'c', label: 'Class C (/24)', options: ['255.0.0.0', '255.255.0.0', '255.255.255.0'], answer: '255.255.255.0' } ],
          hint: 'Each 255 is eight network bits.', ok: 'Cider: "Eight, sixteen, twenty-four bits of network."',
          why: 'Cider: The prefix length counts the network bits, and the mask writes them as octets of 255. /8 is 255.0.0.0, /16 is 255.255.0.0 and /24 is 255.255.255.0, the default masks for classes A, B and C.' },
        { type: 'calc', skill: 'ipv4-addr', text: 'Cider: "Last coaster. The landlord\'s address is 172.20.33.9 on its class\'s default mask. Give me the network address and the broadcast address."',
          fields: [ { key: 'net', label: 'Network address', check: v => String(v).trim() === '172.20.0.0' }, { key: 'bc', label: 'Broadcast address', check: v => String(v).trim() === '172.20.255.255' } ],
          answer: '172.20.0.0 · 172.20.255.255', hint: 'Class B: /16. The last two octets are the host part.', ok: 'Cider: "Host bits all zero, then all ones."',
          why: 'Cider: 172 is class B, so the default mask is /16 and the last two octets are host bits. Setting all host bits to 0 gives the network address, 172.20.0.0. Setting them all to 1 gives the broadcast address, 172.20.255.255.' },
        { type: 'choice', skill: 'ipv4-addr', text: 'Cider, tapping the first octet of an address on a delivery slip: "It starts with the bits 110. What class is it?"',
          opts: ['Class C', 'Class A', 'Class B', 'Class D'], a: 0,
          hint: 'A starts 0, B starts 10, C starts 110, D starts 1110.', ok: 'Cider: "Class C, 192 to 223."',
          why: 'Cider: The leading bits of the first octet fix the class: 0 for A, 10 for B, 110 for C, 1110 for D and 1111 for E. 110xxxxx runs from 11000000 = 192 to 11011111 = 223, which is class C.' },
        { type: 'cmd', skill: 'ipv4-addr', text: 'Cider: "Now my music. The jukebox is on the back room network, 192.168.7.0/24, and the router\'s port for it has an address but no pulse. Wake it up."',
          check: (d, ctx) => ctx.net().up('R1', 'g0/1') && ctx.net().ping('JUKEBOX', '192.168.7.1').ok,
          hint: 'CIDER> enable\nCIDER# configure terminal\nCIDER(config)# interface g0/1\nCIDER(config-if)# no shutdown', ok: 'Cider: "There\'s the bass line. Leave the volume where it is."',
          why: 'Cider: A router\'s interfaces are administratively down until you type no shutdown on them, even when they already have an address. From global configuration, interface g0/1 then no shutdown brings the port up, and the jukebox can reach its gateway, 192.168.7.1, again.' },
        { type: 'choice', skill: 'ipv4-addr', text: 'Cider, as the jukebox starts up: "The jukebox\'s manual says to give it 192.168.7.255 so everyone can hear it. Why won\'t I let it have that?"',
          opts: ['It is the broadcast address of 192.168.7.0/24, so it cannot be a host\'s address', 'It is a class D address', 'It is the network address', 'It is outside 192.168.7.0/24'], a: 0,
          hint: 'What are the host bits of .255 on a /24?', ok: 'Cider: "It\'s the broadcast. The jukebox keeps .20."',
          why: 'Cider: On 192.168.7.0/24 the last octet is the host part. 192.168.7.255 has every host bit set to 1, so it is the broadcast address for the network, and it cannot be assigned to a host. 192.168.7.0 is the network address, and the hosts get .1 to .254.' }
      ],
      solution: [ { calc: { a: '192', b: '168', c: '01001101' } }, 'commit', { form: { a: 'Class A', b: 'Class B', c: 'Class C', d: 'Class D (multicast)', e: 'loopback' } }, 'commit',
        { form: { a: '255.0.0.0', b: '255.255.0.0', c: '255.255.255.0' } }, 'commit', { calc: { net: '172.20.0.0', bc: '172.20.255.255' } }, 'commit', { choose: 0 }, 'commit',
        { dev: 'R1', type: ['enable', 'configure terminal', 'interface g0/1', 'no shutdown'] }, 'commit', { choose: 0 }, 'commit' ],
      outro: 'The jukebox plays something old with a lot of saxophone in it. Cider stacks the coasters you filled in behind the till and keeps one with your handle on it, and she stops charging for the cider.' }
  );
})();
