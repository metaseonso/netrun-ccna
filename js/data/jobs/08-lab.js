/* jobs/08-lab.js — District 08 · The Lab (under the college): LAN and WAN architectures, virtualisation, wireless, automation. */
(function(){
  const { gi, fa } = NETKIT;
  JOBS.push(
    // ------------------------------------------------------------------ night 52 · from Lab 52 (STP and HSRP synchronisation)
    { id: 'a-n52-charting-floor', cls: 'A', rep: 25, from: 'hypervisor', title: 'The Charting Floor', day: [52], requires: ['n52-the-blueprint'], devices: ['DSW1', 'DSW2', 'PC2'], stpView: true,
      brief: 'DISPATCH » Watson clinic, main building. Records on the charting floor are slow to open. The professor says the two distribution switches disagree about who is in charge. Line them up.\n\nCLIENT (Imani) » "Charts open slowly on the second floor and fine on the first. I have forty patients tonight and I notice every one of those seconds."',
      net: {
        devices: { DSW1: { kind: 'l3switch', mac: '0011.2252.0001' }, DSW2: { kind: 'l3switch', mac: '0011.2252.0002' }, ASW1: { kind: 'switch', mac: '0011.2252.0011' }, ASW2: { kind: 'switch', mac: '0011.2252.0012' },
          PC1: { kind: 'host', ip: '10.10.10.10', mask: '255.255.255.0', gw: '10.10.10.1' }, PC2: { kind: 'host', ip: '10.10.20.10', mask: '255.255.255.0', gw: '10.10.20.1' } },
        links: [ { a: 'DSW1', ap: 'gigabitethernet1/0/1', b: 'DSW2', bp: 'gigabitethernet1/0/1' },
          { a: 'DSW1', ap: 'gigabitethernet1/0/2', b: 'ASW1', bp: gi(1) }, { a: 'DSW2', ap: 'gigabitethernet1/0/2', b: 'ASW1', bp: gi(2) },
          { a: 'DSW1', ap: 'gigabitethernet1/0/3', b: 'ASW2', bp: gi(1) }, { a: 'DSW2', ap: 'gigabitethernet1/0/3', b: 'ASW2', bp: gi(2) },
          { a: 'ASW1', ap: fa(1), b: 'PC1' }, { a: 'ASW2', ap: fa(1), b: 'PC2' } ],
        preconfig: {
          DSW1: ['ip routing', 'vlan 10,20', 'interface range g1/0/1 - 3', 'switchport trunk encapsulation dot1q', 'switchport mode trunk',
            'interface vlan 10', 'ip address 10.10.10.2 255.255.255.0', 'standby 10 ip 10.10.10.1', 'standby 10 priority 110', 'standby 10 preempt',
            'interface vlan 20', 'ip address 10.10.20.2 255.255.255.0', 'standby 20 ip 10.10.20.1', 'standby 20 priority 110', 'standby 20 preempt'],
          DSW2: ['ip routing', 'vlan 10,20', 'spanning-tree vlan 10,20 root primary', 'interface range g1/0/1 - 3', 'switchport trunk encapsulation dot1q', 'switchport mode trunk',
            'interface vlan 10', 'ip address 10.10.10.3 255.255.255.0', 'standby 10 ip 10.10.10.1', 'interface vlan 20', 'ip address 10.10.20.3 255.255.255.0', 'standby 20 ip 10.10.20.1'],
          ASW1: ['vlan 10,20', 'interface f0/1', 'switchport mode access', 'switchport access vlan 10', 'interface range g0/1 - 2', 'switchport mode trunk'],
          ASW2: ['vlan 10,20', 'interface f0/1', 'switchport mode access', 'switchport access vlan 20', 'interface range g0/1 - 2', 'switchport mode trunk'] }
      },
      map: { w: 520, h: 340, nodes: [
          { id: 'DSW1', label: 'DSW1 · distribution', type: 'switch', x: 150, y: 60 }, { id: 'DSW2', label: 'DSW2 · distribution', type: 'switch', x: 370, y: 60 },
          { id: 'ASW1', label: 'first floor switch', type: 'switch', x: 150, y: 190 }, { id: 'ASW2', label: 'second floor switch', type: 'switch', x: 370, y: 190 },
          { id: 'PC1', label: 'admin desk', type: 'pc', x: 150, y: 286 }, { id: 'PC2', label: 'charting PC', type: 'pc', x: 370, y: 286 } ],
        links: [ { a: 'DSW1', b: 'DSW2', ap: 'gigabitethernet1/0/1', bp: 'gigabitethernet1/0/1' }, { a: 'DSW1', b: 'ASW1', ap: 'gigabitethernet1/0/2', bp: gi(1) }, { a: 'DSW2', b: 'ASW1', ap: 'gigabitethernet1/0/2', bp: gi(2) },
          { a: 'DSW1', b: 'ASW2', ap: 'gigabitethernet1/0/3', bp: gi(1) }, { a: 'DSW2', b: 'ASW2', ap: 'gigabitethernet1/0/3', bp: gi(2) }, { a: 'ASW1', b: 'PC1' }, { a: 'ASW2', b: 'PC2' } ] },
      steps: [
        { type: 'find', skill: 'lan-arch', targets: ['DSW1', 'DSW2'], text: 'Prof. Hypervisor, on the phone from the Lab: "Open the clinic\'s map. Click a switch in the distribution layer, where the floor switches meet."',
          hint: 'The pair at the top. Every floor switch has one cable to each of them.', ok: 'Prof. Hypervisor: "That one, and its twin next to it. Between them they\'re the whole middle of the clinic."',
          why: 'Prof. Hypervisor: The access switches on each floor are where the PCs plug in. Each one has a cable up to each of the two distribution switches, which gather the floors together and route between the VLANs. The clinic has no core layer above them.' },
        { type: 'form', skill: 'lan-arch', text: 'Prof. Hypervisor: "Imani\'s asking which layer does what, because the council will ask her. Tell me for each of these."',
          fields: [ { key: 'pc', label: 'The nurses\' PCs plug in here', options: ['access', 'distribution', 'core'], answer: 'access' },
            { key: 'poe', label: 'The phones get power over the cable here', options: ['access', 'distribution', 'core'], answer: 'access' },
            { key: 'l3', label: 'Layer 2 stops and routing starts here', options: ['access', 'distribution', 'core'], answer: 'distribution' },
            { key: 'join', label: 'Joins distribution blocks to each other', options: ['access', 'distribution', 'core'], answer: 'core' } ],
          hint: 'End hosts, PoE and QoS marks at the edge. The Layer 2/Layer 3 border in the middle. Speed between blocks at the top.', ok: 'Prof. Hypervisor: "Access, access, distribution, core. She\'s writing it on the whiteboard at the nurses\' station."',
          why: 'Prof. Hypervisor: End hosts plug into the access layer, and that is also where PoE, QoS marking and port security happen. The distribution layer gathers the access switches and is usually the border between Layer 2 and Layer 3. The core layer only joins distribution blocks together, as fast as possible.' },
        { type: 'choice', skill: 'lan-arch', text: 'Imani, on the speaker: "So we have the floor switches and the two big ones, and nothing above them. Is that a problem for the council?"',
          opts: ['No. It is a two-tier, collapsed core design, and a building this size needs nothing more', 'Yes. Every building needs a separate core layer', 'No, because it is a spine-leaf design', 'Yes, it should be a full mesh'], a: 0,
          hint: 'Where did the core go?', ok: 'Prof. Hypervisor: "Collapsed core. Old Root drew it that way on purpose."',
          why: 'Prof. Hypervisor: A separate core only earns its place when there are many distribution blocks to join. The clinic has one, so the distribution pair does the core\'s job too. That is a two-tier or collapsed core design. Spine-leaf is for data centres, and a full mesh would cable every switch to every other switch.' },
        { type: 'cmd', skill: 'lan-arch', text: 'Prof. Hypervisor: "Now find the argument. On DSW1, look at who is the root bridge for VLAN 20 and who is the HSRP active gateway for it."',
          need: [ { dev: 'DSW1', line: /^(do )?show spanning-tree vlan 20$/ }, { dev: 'DSW1', line: /^(do )?show standby brief$/ } ],
          hint: 'DSW1# show spanning-tree vlan 20\nDSW1# show standby brief', ok: 'Prof. Hypervisor: "There it is. DSW2 is the root for both VLANs, and DSW1 is the active gateway for both. Somebody set the root years ago and never touched the gateways."',
          why: 'Prof. Hypervisor: show spanning-tree vlan 20 says which switch is the root bridge for that VLAN: when it is DSW1 itself, the output says "This bridge is the root". show standby brief lists each HSRP group and whether this switch is Active or Standby. Here DSW2 is the root for VLAN 20 while DSW1 is its active gateway.' },
        { type: 'cmd', skill: 'lan-arch', text: 'Prof. Hypervisor: "The admin floor is VLAN 10, and DSW1 is already its active gateway. Make DSW1 its root bridge too, with DSW2 as the backup root."',
          check: (d, ctx) => { const st = ctx.compute(10); return !!(st && st.switches.DSW1 && st.switches.DSW1.isRoot) && ctx.net().hsrpActive('10.10.10.1') === 'DSW1'; },
          hint: 'DSW1(config)# spanning-tree vlan 10 root primary\nDSW2(config)# spanning-tree vlan 10 root secondary', ok: 'Prof. Hypervisor: "VLAN 10 is one box now, root and gateway both on DSW1."',
          why: 'Prof. Hypervisor: spanning-tree vlan 10 root primary sets the switch\'s priority for VLAN 10 to 24576, low enough to win the root election, and root secondary sets 28672 so that switch takes over if the root dies. With DSW1 as both root and active gateway, frames from the floors reach the gateway without crossing to DSW2 first.' },
        { type: 'cmd', skill: 'lan-arch', text: 'Prof. Hypervisor: "The charting floor is VLAN 20. DSW2 is its root already, so move the gateway: make DSW2 the HSRP active for VLAN 20, and let it take the role back after a reboot. Make DSW1 the backup root while you\'re there."',
          need: [ { dev: 'DSW2', ctx: 'interface vlan20', line: /^standby 20 preempt/ } ],
          check: (d, ctx) => { const st = ctx.compute(20); return !!(st && st.switches.DSW2 && st.switches.DSW2.isRoot) && ctx.net().hsrpActive('10.10.20.1') === 'DSW2'; },
          hint: 'DSW2(config)# interface vlan 20\nDSW2(config-if)# standby 20 priority 120\nDSW2(config-if)# standby 20 preempt\nDSW1(config)# spanning-tree vlan 20 root secondary', ok: 'Prof. Hypervisor: "DSW2 has VLAN 20 now, root and gateway. The pair is splitting the work the way Root meant it to."',
          why: 'Prof. Hypervisor: HSRP picks the active router by the highest priority, 100 by default, and the highest IP address breaks a tie. DSW1 had 110 for group 20, so standby 20 priority 120 on DSW2 beats it. standby 20 preempt lets DSW2 take the active role back when it comes up after a reboot, because without preempt a router never takes over from one that is already active.' },
        { type: 'choice', skill: 'lan-arch', text: 'Imani: "I don\'t need the details. Why did it matter which switch did which job?"',
          opts: ['Frames from the second floor went up to the root first and then across to the other switch, which was the gateway, so every request took an extra trip', 'HSRP and spanning tree cannot run on the same switch', 'The root bridge drops traffic for any VLAN it is not the gateway for', 'The active gateway must always be the switch with the lowest MAC address'], a: 0,
          hint: 'Follow a frame from the charting PC to its gateway while the other uplink is blocked.', ok: 'Prof. Hypervisor: "The extra trip. That\'s where her seconds went."',
          why: 'Prof. Hypervisor: Spanning tree blocks one uplink from each floor switch, and the path it keeps open leads towards the root. When the root was DSW2 and the gateway was DSW1, every frame from the charting floor went up to DSW2 and across the link to DSW1 before it could be routed. With the root and the gateway on the same switch, the frame reaches the gateway in one hop.' },
        { type: 'cmd', skill: 'lan-arch', text: 'Prof. Hypervisor: "Prove it from the charting PC. Trace the route to the admin desk at 10.10.10.10. The first hop should answer from DSW2."',
          need: [ { dev: 'PC2', line: /^(tracert|traceroute) 10\.10\.10\.10$/ } ], check: (d, ctx) => { const p = ctx.net().ping('PC2', '10.10.10.10'); return p.ok && (p.trail || [])[0] === '10.10.20.3'; },
          hint: 'PC2 shell:\nC:\\> tracert 10.10.10.10', ok: 'Prof. Hypervisor: "10.10.20.3, DSW2\'s own address, then the desk. One hop to the gateway."',
          why: 'Prof. Hypervisor: tracert lists the routers a packet passes, by the address each one received it on. The first hop is the charting floor\'s gateway, and it answers with the real address of the switch holding the virtual address 10.10.20.1. 10.10.20.3 is DSW2, the active gateway for VLAN 20.' }
      ],
      solution: [ { select: 'DSW1' }, 'commit', { form: { pc: 'access', poe: 'access', l3: 'distribution', join: 'core' } }, 'commit', { choose: 0 }, 'commit',
        { dev: 'DSW1', type: ['enable', 'show spanning-tree vlan 20', 'show standby brief'] }, 'commit',
        { dev: 'DSW1', type: ['configure terminal', 'spanning-tree vlan 10 root primary'] }, { dev: 'DSW2', type: ['enable', 'configure terminal', 'spanning-tree vlan 10 root secondary'] }, 'commit',
        { dev: 'DSW2', type: ['interface vlan 20', 'standby 20 priority 120', 'standby 20 preempt'] }, { dev: 'DSW1', type: ['spanning-tree vlan 20 root secondary'] }, 'commit',
        { choose: 0 }, 'commit', { dev: 'PC2', type: ['tracert 10.10.10.10'] }, 'commit' ],
      outro: 'At twenty past eleven Imani opens a chart on the second floor and it is simply there. She opens three more to be sure and goes back to her patients. In the Lab, Prof. Hypervisor writes ROOT and ACTIVE beside each switch on the clinic\'s drawing and pins it to the wall next to Halvorsen\'s blueprint.' }
  );
})();
