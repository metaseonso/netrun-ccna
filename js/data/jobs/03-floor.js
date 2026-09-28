/* jobs/03-floor.js — District 03 · The Floor (the switch floor under the market): switching, ARP, switch interfaces, VLANs, trunks, DTP and VTP, EtherChannel, CDP and LLDP. */
(function(){
  const { gi, fa } = NETKIT;
  JOBS.push(
    // ------------------------------------------------------------------ night 23 · from Lab 23 (EtherChannel)
    { id: 'c-n23-tag-bundle', cls: 'C', rep: 15, from: 'veelan', title: 'The Tag on the Bundle', day: [23], requires: ['n23-two-cables'], devices: ['SW1', 'SW2', 'SW3'],
      brief: 'DISPATCH » Vee Lan is at the clinic annex with a new gigabit run between SW1 and SW2. Bundle the two cables so both carry traffic, fix the pharmacy link that won\'t bundle, and save.\n\nCLIENT (Vee Lan) » "Old Root\'s cable slept for six years. I want both of these awake before the night shift changes over."',
      net: {
        devices: {
          SW1: { kind: 'switch', mac: '0019.e8a1.1c01' }, SW2: { kind: 'switch', mac: '0c11.7a3b.9902' }, SW3: { kind: 'switch', mac: '0001.4a3c.0e03' },
          PC1: { kind: 'host', ip: '10.20.0.11', mask: '255.255.255.0' }, PC2: { kind: 'host', ip: '10.20.0.21', mask: '255.255.255.0' }
        },
        links: [ { a: 'SW1', ap: gi(2), b: 'SW2', bp: gi(2) }, { a: 'SW1', ap: gi(3), b: 'SW2', bp: gi(3) }, { a: 'SW3', ap: gi(1), b: 'SW1', bp: gi(1) }, { a: 'SW3', ap: gi(3), b: 'SW1', bp: gi(4) },
          { a: 'SW1', ap: fa(1), b: 'PC1' }, { a: 'SW2', ap: fa(1), b: 'PC2' } ],
        preconfig: { SW1: ['spanning-tree mode rapid-pvst', 'spanning-tree vlan 1 root primary', 'interface g0/1', 'channel-group 2 mode passive', 'interface g0/4', 'channel-group 2 mode passive'],
          SW2: ['spanning-tree mode rapid-pvst', 'spanning-tree vlan 1 root secondary'],
          SW3: ['spanning-tree mode rapid-pvst', 'interface g0/1', 'channel-group 2 mode on', 'interface g0/3', 'channel-group 2 mode on'] }
      },
      map: { w: 540, h: 360, nodes: [
          { id: 'SW1', label: 'SW1 · the root', type: 'switch', x: 150, y: 90 }, { id: 'SW2', label: 'SW2 · the wards', type: 'switch', x: 400, y: 90 }, { id: 'SW3', label: 'SW3 · the pharmacy', type: 'switch', x: 150, y: 260 },
          { id: 'PC1', label: 'reception', type: 'pc', x: 40, y: 170 }, { id: 'PC2', label: 'ward station', type: 'pc', x: 500, y: 200 } ],
        links: [ { a: 'SW1', b: 'SW2', ap: gi(2), bp: gi(2) }, { a: 'SW1', b: 'SW2', ap: gi(3), bp: gi(3), tag: 'the new run' }, { a: 'SW3', b: 'SW1', ap: gi(1), bp: gi(1) }, { a: 'SW3', b: 'SW1', ap: gi(3), bp: gi(4), tag: 'pharmacy pair' },
          { a: 'SW1', b: 'PC1' }, { a: 'SW2', b: 'PC2' } ] },
      steps: [
        { type: 'choice', skill: 'etherchannel', text: 'Vee Lan, coiling the old grey cable over her arm: "Tell Imani why I couldn\'t just bundle his FastEthernet cable with the gigabit one."',
          opts: ['Every member of a bundle must match speed and duplex, and a 100 Mbps port cannot join a 1 Gbps one', 'FastEthernet ports cannot carry VLAN 1', 'A bundle can only have one member per switch', 'Spanning tree would block it anyway'], a: 0,
          hint: 'What has to be the same on every port in a bundle?', ok: 'Vee Lan: "Speed, duplex, mode and VLANs, the same on every member. So I brought a matching cable."',
          why: 'Vee Lan: An EtherChannel only bundles ports that match: the same speed and duplex, the same access or trunk mode, and the same VLANs. The tagged cable was FastEthernet and the main link gigabit, so they could never be members of one bundle. A second gigabit cable matches.' },
        { type: 'cmd', skill: 'etherchannel', text: 'Vee Lan: "SW1 and SW2 now have Gi0/2 and Gi0/3 between them. Bundle them with LACP. At least one side has to ask."',
          check: (d, ctx) => { const n = ctx.net(); const g = Object.values(n.bundles).find(b => [b.a, b.b].sort().join() === 'SW1,SW2'); if (!g || g.links.length !== 2) return false; const m = n.iface('SW1', 'g0/2').cfg.channel.mode; return ['active', 'passive'].includes(m); },
          hint: 'SW1(config)# interface range g0/2 - 3\nSW1(config-if-range)# channel-group 1 mode active\nSW2(config)# interface range g0/2 - 3\nSW2(config-if-range)# channel-group 1 mode active   (or passive)', ok: 'Vee Lan: "Po1 is up. The tree sees one link now, and nothing between those two is blocking."',
          why: 'Vee Lan: channel-group 1 mode active on both ports of SW1 makes them LACP members of port-channel 1, and active asks the other side to bundle. On SW2 the same ports take channel-group 1 mode active or passive. Once both ends agree, the two cables become one logical link, and spanning tree has nothing left to block between SW1 and SW2.' },
        { type: 'cmd', skill: 'etherchannel', text: 'Vee Lan: "Look from the wards\' side. Show me the bundle on SW2."',
          need: [ { dev: 'SW2', line: /^(do )?show etherchannel summary$/ } ], hint: 'SW2# show etherchannel summary', ok: 'Vee Lan: "Po1, LACP, both ports with a P. P is bundled. That\'s what we want to see."',
          why: 'Vee Lan: show etherchannel summary lists every port-channel on the switch, the protocol it negotiated, LACP or PAgP or a dash for mode on, and the member ports. A (P) after a port means it is bundled in the port-channel.' },
        { type: 'form', skill: 'etherchannel', text: 'Mac, on the phone: "Before you touch the pharmacy pair, tell me which of these would ever bundle."',
          fields: [ { key: 'ap', label: 'active + passive', options: ['bundles', 'no bundle'], answer: 'bundles' },
            { key: 'pp', label: 'passive + passive', options: ['bundles', 'no bundle'], answer: 'no bundle' },
            { key: 'da', label: 'desirable + auto', options: ['bundles', 'no bundle'], answer: 'bundles' },
            { key: 'aa', label: 'auto + auto', options: ['bundles', 'no bundle'], answer: 'no bundle' },
            { key: 'op', label: 'on + passive', options: ['bundles', 'no bundle'], answer: 'no bundle' },
            { key: 'oo', label: 'on + on', options: ['bundles', 'no bundle'], answer: 'bundles' } ],
          hint: 'Active and desirable ask. Passive and auto only answer. On never negotiates.', ok: 'Mac: "So the pharmacy pair was never going to bundle."',
          why: 'Vee Lan: LACP forms a bundle when at least one side is active. PAgP forms one when at least one side is desirable. Passive with passive and auto with auto both wait forever. Mode on uses no protocol, so it only bundles with on at the other end, never with active, passive, desirable or auto.' },
        { type: 'cmd', skill: 'etherchannel', text: 'Vee Lan: "Now the pharmacy. SW3 says on, SW1 says passive, so there\'s no bundle and one cable is asleep. Make them agree."',
          check: (d, ctx) => { const n = ctx.net(); return Object.values(n.bundles).some(b => [b.a, b.b].sort().join() === 'SW1,SW3' && b.links.length === 2) && !n.issues.some(i => i.kind === 'etherchannel-mode-mismatch'); },
          hint: 'Either match SW3 with mode on:\nSW1(config)# interface range g0/1, g0/4\nSW1(config-if-range)# channel-group 2 mode on\nor use LACP on both sides:\nSW3(config)# interface range g0/1, g0/3\nSW3(config-if-range)# channel-group 2 mode active', ok: 'Vee Lan: "Po2 is up. The pharmacy has both its cables awake too."',
          why: 'Vee Lan: Mode on never sends a negotiation message, and passive only answers one, so on with passive never bundles. Either set SW1\'s two ports to channel-group 2 mode on to match SW3, or, better, put SW3\'s ports into mode active so LACP runs on both sides and checks every member.' },
        { type: 'calc', skill: 'etherchannel', text: 'Imani, who has come down to watch: "How many cables can you tie together like that?"',
          fields: [ { key: 'act', label: 'members forwarding in one bundle, at most', check: v => String(v).trim() === '8' },
            { key: 'lacp', label: 'members LACP can hold, active plus standby', check: v => String(v).trim() === '16' } ],
          answer: '8 active. LACP adds up to 8 standby, 16 in all.', hint: 'Eight forward. LACP can keep the same number again waiting.', ok: 'Vee Lan: "Eight at once, and LACP keeps eight more waiting in the wings."',
          why: 'Vee Lan: An EtherChannel forwards on up to 8 member ports at once. LACP can also hold up to 8 more as standby members, 16 in all, and brings one in if an active member fails.' },
        { type: 'choice', skill: 'etherchannel', text: 'Imani: "So when I send one big scan up to the wards, does it go down both cables at once and get there twice as fast?"',
          opts: ['No. Each flow is hashed onto one member by its addresses, so one transfer uses one cable, and different flows share the bundle', 'Yes. Every frame is split across both cables', 'No. The second cable only carries traffic if the first fails', 'Yes, but only with PAgP'], a: 0,
          hint: 'How does the switch keep frames of one conversation in order?', ok: 'Vee Lan: "One flow, one cable. The whole ward\'s traffic spreads across both."',
          why: 'Vee Lan: The switch picks a member for each frame by hashing its addresses, source and destination MAC or IP, so every frame of one flow takes the same cable and arrives in order. One big transfer uses one member; many flows from many machines spread across all of them. port-channel load-balance src-dst-ip sets the method, and show etherchannel load-balance shows it.' },
        { type: 'cmd', skill: 'cli-modes', text: 'Vee Lan: "Save all three. I\'m not coming back at four in the morning for anybody."',
          check: (d) => ['SW1', 'SW2', 'SW3'].every(n => d[n].startup && /channel-group/.test(d[n].startup)) && /channel-group 1/.test(d.SW1.startup) && /channel-group 1/.test(d.SW2.startup),
          hint: 'SW1# write memory\nSW2# write memory\nSW3# write memory', ok: 'Vee Lan: "[OK], three times. Now I\'m even."',
          why: 'Vee Lan: The bundles live in the running-config until they are saved. write memory, or copy running-config startup-config, on SW1, SW2 and SW3 puts them in the startup-config, so the port-channels come back after a power cut.' }
      ],
      solution: [ { choose: 0 }, 'commit',
        { dev: 'SW1', type: ['enable', 'configure terminal', 'interface range g0/2 - 3', 'channel-group 1 mode active'] }, { dev: 'SW2', type: ['enable', 'configure terminal', 'interface range g0/2 - 3', 'channel-group 1 mode passive'] }, 'commit',
        { dev: 'SW2', type: ['do show etherchannel summary'] }, 'commit', { form: { ap: 'bundles', pp: 'no bundle', da: 'bundles', aa: 'no bundle', op: 'no bundle', oo: 'bundles' } }, 'commit',
        { dev: 'SW3', type: ['enable', 'configure terminal', 'interface g0/1', 'channel-group 2 mode active', 'interface g0/3', 'channel-group 2 mode active'] }, 'commit',
        { calc: { act: '8', lacp: '16' } }, 'commit', { choose: 0 }, 'commit',
        { dev: 'SW1', type: ['end', 'write memory'] }, { dev: 'SW2', type: ['end', 'write memory'] }, { dev: 'SW3', type: ['end', 'write memory'] }, 'commit' ],
      outro: 'Vee Lan writes a new tag in paint pen, DO NOT UNPLUG EITHER, and ties it round the bundle where the old grey cable used to run. Both link lights blink green under it. She photographs it and sends the picture to Old Root.' }
  );
})();
