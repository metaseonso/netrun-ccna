/* jobs/03-floor.js — District 03 · The Floor (the switch floor under the market): switching, ARP, switch interfaces, VLANs, trunks, DTP and VTP, EtherChannel, CDP and LLDP. */
(function(){
  JOBS.push(
    // ------------------------------------------------------------------ night 5 · a topic gig (no lab): read the MAC table
    { id: 'd-n05-whose-laptop', cls: 'D', rep: 10, from: 'mac', title: 'Whose Laptop Is This', day: [5], requires: ['n05-the-door'], devices: ['PC1', 'SW1', 'SW2'],
      brief: 'DISPATCH » The market office has a laptop on its network that nobody will own up to. Mac knows its MAC address from the box it came in. Find which stall it is plugged into.\n\nCLIENT (the market office) » "It answers to 10.20.0.57 and it isn\'t ours. We want to know which stall to knock on."',
      net: {
        learn: true,
        devices: { SW1: { kind: 'switch', mac: '0011.2205.0001' }, SW2: { kind: 'switch', mac: '0011.2205.0002' },
          PC1: { kind: 'host', ip: '10.20.0.10', mask: '255.255.255.0', mac: '0060.2f84.1c10' },
          PHONES: { kind: 'host', ip: '10.20.0.33', mask: '255.255.255.0', mac: '0019.e3a0.0303' }, TEA: { kind: 'host', ip: '10.20.0.39', mask: '255.255.255.0', mac: '00e0.4c68.0909' },
          LAPTOP: { kind: 'host', ip: '10.20.0.57', mask: '255.255.255.0', mac: '0014.2251.7a3c' } },
        links: [ { a: 'SW1', ap: 'fastethernet0/1', b: 'PC1' }, { a: 'SW1', ap: 'gigabitethernet0/1', b: 'SW2', bp: 'gigabitethernet0/1' },
          { a: 'SW2', ap: 'fastethernet0/3', b: 'PHONES' }, { a: 'SW2', ap: 'fastethernet0/9', b: 'TEA' }, { a: 'SW2', ap: 'fastethernet0/14', b: 'LAPTOP' } ]
      },
      map: { w: 560, h: 300, nodes: [
          { id: 'PC1', label: 'market office PC', type: 'pc', x: 70, y: 230 }, { id: 'SW1', label: 'the door switch', type: 'switch', x: 150, y: 110 }, { id: 'SW2', label: 'the stall switch', type: 'switch', x: 380, y: 110 },
          { id: 'PHONES', label: 'a stall', type: 'pc', x: 290, y: 240 }, { id: 'TEA', label: 'a stall', type: 'pc', x: 400, y: 240 }, { id: 'LAPTOP', label: 'a stall', type: 'pc', x: 510, y: 240 } ],
        links: [ { a: 'PC1', b: 'SW1' }, { a: 'SW1', b: 'SW2', tag: 'uplink' }, { a: 'SW2', b: 'PHONES' }, { a: 'SW2', b: 'TEA' }, { a: 'SW2', b: 'LAPTOP' } ] },
      steps: [
        { type: 'order', skill: 'mac-table', text: 'Mac, pen behind his ear: "Before you touch anything, tell me what a frame looks like from the outside, front to back. Leave the payload where it is, in the middle."',
          items: ['Source MAC', 'FCS', 'Preamble', 'Type/Length', 'Destination MAC', 'SFD'],
          accept: arr => arr.join('|') === ['Preamble', 'SFD', 'Destination MAC', 'Source MAC', 'Type/Length', 'FCS'].join('|'),
          hint: 'Drumroll first, then the addresses (destination before source), then the type. The check comes last.', ok: 'Mac: "Drumroll, start, where to, where from, what\'s inside, and the sum at the end."',
          why: 'Mac: An Ethernet frame starts with the preamble and the SFD, then the header: destination MAC, source MAC, type or length. The payload follows, and the FCS trailer comes last. The destination comes before the source so a switch can start deciding where to send the frame as soon as it arrives.' },
        { type: 'calc', skill: 'mac-table', text: 'Mac: "Now the sizes. The Board asks, and so do I."',
          fields: [ { key: 'pre', label: 'Preamble (bytes)', check: v => +v === 7 }, { key: 'sfd', label: 'SFD (bytes)', check: v => +v === 1 }, { key: 'mac', label: 'Each MAC address (bytes)', check: v => +v === 6 },
            { key: 'type', label: 'Type/Length (bytes)', check: v => +v === 2 }, { key: 'fcs', label: 'FCS (bytes)', check: v => +v === 4 } ],
          answer: '7 · 1 · 6 · 2 · 4', hint: 'Seven of drumroll, one to start, six and six for the addresses, two for the type, four for the sum.', ok: 'Mac: "Seven, one, six, two, four. You can have a stool."',
          why: 'Mac: The preamble is 7 bytes and the SFD 1 byte. Each MAC address is 6 bytes, 48 bits. The type or length field is 2 bytes and the FCS trailer 4 bytes. Leaving out the preamble and SFD, the header and trailer together are 18 bytes.' },
        { type: 'cmd', skill: 'mac-table', text: 'Mac: "My door switch has only just been rebooted, so its book is empty. Make the laptop talk: ping 10.20.0.57 from the office PC, then read the door switch\'s table."',
          need: [ { dev: 'SW1', line: /^(do )?show mac address-table( dynamic)?$/ } ], check: (d, ctx) => ctx.net().macTable('SW1').some(r => r.mac === '0014.2251.7a3c'),
          hint: 'PC1 shell:\nC:\\> ping 10.20.0.57\nSW1 shell:\nSW1> enable\nSW1# show mac address-table', ok: 'Mac: "Two faces in the book now, the office PC and the laptop. The first ping lost a packet while the PC asked who had that address."',
          why: 'Mac: A switch learns only from traffic. Before the ping, nothing had crossed the door switch, so its table was empty. The ping made the office PC and the laptop send frames through it, and the switch wrote down each source MAC address with the port it arrived on.' },
        { type: 'form', skill: 'mac-table', text: 'Mac: "So which of my slots did the laptop\'s face come through?"',
          fields: [ { key: 'port', label: 'SW1 port for 0014.2251.7a3c', options: ['Fa0/1', 'Gi0/1', 'Fa0/14', 'Fa0/9'], answer: 'Gi0/1' } ],
          hint: 'Read the Ports column on the laptop\'s line in SW1\'s table.', ok: 'Mac: "Gi0/1, the uplink. That only tells us it came from further down the floor."',
          why: 'Mac: The door switch learned the laptop on Gi0/1, its uplink to the stall switch, because that is the port the laptop\'s frames arrived on. An uplink port can have many MAC addresses learned on it, one for every device beyond it, so the laptop is somewhere past the stall switch.' },
        { type: 'cmd', skill: 'mac-table', text: 'Mac: "Follow it. Read the stall switch\'s book."',
          need: [ { dev: 'SW2', line: /^(do )?show mac address-table( dynamic)?$/ } ], check: (d, ctx) => ctx.net().macTable('SW2').some(r => r.mac === '0014.2251.7a3c' && r.port === 'fastethernet0/14'),
          hint: 'SW2 shell:\nSW2> enable\nSW2# show mac address-table', ok: 'Mac: "There\'s our face on an access port."',
          why: 'Mac: On the stall switch the laptop\'s MAC address is learned on an access port with a single device behind it, so that port leads straight to the laptop. Following a MAC address switch by switch until it appears on a port with one device is how you find where something is plugged in.' },
        { type: 'form', skill: 'mac-table', text: 'Mac: "Which port? The stalls are wired one to a port, and the port number is the stall number."',
          fields: [ { key: 'port', label: 'SW2 port for 0014.2251.7a3c', options: ['Fa0/3', 'Fa0/9', 'Fa0/14', 'Gi0/1'], answer: 'Fa0/14' } ],
          hint: 'The Ports column on the laptop\'s line in SW2\'s table.', ok: 'Mac: "Stall 14, the cable seller. I\'ll send the office down."',
          why: 'Mac: The stall switch learned 0014.2251.7a3c on Fa0/14, so the laptop is plugged into port 14 of the stall switch, which is stall 14.' },
        { type: 'text', skill: 'mac-table', text: 'Mac: "The office will ask who made it. Give me the part of the address that names the maker, as it\'s written in the table."',
          check: v => String(v).toLowerCase().replace(/[^0-9a-f]/g, '') === '001422', answer: '0014.22', placeholder: 'e.g. 00d0.bc',
          hint: 'The first three bytes: the first six hex digits.', ok: 'Mac: "0014.22. The IEEE gave that one to Dell."',
          why: 'Mac: The first three bytes of a MAC address, the first six hex digits, are the OUI, which the IEEE assigns to the maker. 0014.22 is registered to Dell, so the laptop has a Dell network card. The last three bytes are the maker\'s own serial for that card.' },
        { type: 'choice', skill: 'mac-table', text: 'Mac, closing the ledger: "The stall owner will unplug it the minute the office knocks. How long before my door forgets that face?"',
          opts: ['5 minutes (300 seconds) after its last frame', 'Straight away, as soon as the cable comes out', '24 hours', 'Never, until someone clears the table'], a: 0,
          hint: 'Dynamic entries have a timer.', ok: 'Mac: "Five minutes of silence and it\'s crossed out."',
          why: 'Mac: A dynamically learned MAC address is removed from the table after 5 minutes, 300 seconds, with no frames from it. That removal is called aging. A switch also removes the entries on a port when that port goes down, and clear mac address-table dynamic empties the table by hand.' }
      ],
      solution: [ { order: [2, 5, 4, 0, 3, 1] }, 'commit', { calc: { pre: '7', sfd: '1', mac: '6', type: '2', fcs: '4' } }, 'commit',
        { dev: 'PC1', type: ['ping 10.20.0.57'] }, { dev: 'SW1', type: ['enable', 'show mac address-table'] }, 'commit', { form: { port: 'Gi0/1' } }, 'commit',
        { dev: 'SW2', type: ['enable', 'show mac address-table'] }, 'commit', { form: { port: 'Fa0/14' } }, 'commit', { text: '0014.22' }, 'commit', { choose: 0 }, 'commit' ],
      outro: 'The market office knocks on stall 14 before the morning rush. The cable seller\'s nephew had brought his own laptop in to watch football on the market\'s network, and he carries it home under his arm. Mac writes the stall number in the margin of his ledger with a small drawing of a football.' }
  );
})();
