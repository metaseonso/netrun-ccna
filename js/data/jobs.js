/* jobs.js — LAYER 2: gigs. HUD messages from Dispatch on behalf of an NPC. Each job = brief + net run + practicum.
   Step types: find (click a node) · cmd (type IOS; validated by `need` command records and/or `check(devs, ctx)` state)
               · choice (exam-style MCQ) · calc (typed answers). Each step names the `skill` it exercises.
   Higher-class jobs nest lower-class steps on purpose: cumulative review packaged as one scenario. */
(function(){
  const G = 'gigabitethernet', F = 'fastethernet';
  const gi = n => G + '0/' + n, fa = n => F + '0/' + n;

  // ---- topology builders ----------------------------------------------------
  function hosts(sw, from, to, prefix){ const o = {}; for (let i = from; i <= to; i++) o[fa(i)] = { host: prefix + i }; return o; }
  function triangle(macs, extra){
    const t = { defaultMode: 'rapid-pvst', switches: {
      SW1: { mac: macs.SW1, ports: Object.assign({ [gi(1)]: { to: 'SW2', peer: gi(1) }, [gi(2)]: { to: 'SW3', peer: gi(1) } }, hosts('SW1', 1, 12, 'PC1-')) },
      SW2: { mac: macs.SW2, ports: Object.assign({ [gi(1)]: { to: 'SW1', peer: gi(1) }, [gi(2)]: { to: 'SW3', peer: gi(2) } }, hosts('SW2', 1, 12, 'PC2-')) },
      SW3: { mac: macs.SW3, ports: Object.assign({ [gi(1)]: { to: 'SW1', peer: gi(2) }, [gi(2)]: { to: 'SW2', peer: gi(2) } }, hosts('SW3', 1, 12, 'PC3-')) } } };
    if (extra) extra(t); return t;
  }
  const triMap = (alert) => ({ w: 520, h: 300, nodes: [
      { id: 'SW1', label: 'SW1', type: 'switch', x: 260, y: 60 }, { id: 'SW2', label: 'SW2', type: 'switch', x: 110, y: 200 }, { id: 'SW3', label: 'SW3', type: 'switch', x: 410, y: 200 },
      { id: 'PC1', label: 'PCs ×12', type: 'pc', x: 260, y: 20, small: true }, { id: 'PC2', label: 'PCs ×12', type: 'pc', x: 40, y: 270, small: true }, { id: 'PC3', label: 'PCs ×12', type: 'pc', x: 480, y: 270, small: true } ],
    links: [ { a: 'SW1', b: 'SW2', ap: gi(1), bp: gi(1) }, { a: 'SW1', b: 'SW3', ap: gi(2), bp: gi(1) }, { a: 'SW2', b: 'SW3', ap: gi(2), bp: gi(2) },
      { a: 'SW1', b: 'PC1' }, { a: 'SW2', b: 'PC2' }, { a: 'SW3', b: 'PC3' } ], alert: alert || [] });

  function stpShows(topo, extraShows){
    const sh = {
      'show spanning-tree': (d, all) => Stp.render(topo, 1, d.name, all),
      'show spanning-tree vlan 1': (d, all) => Stp.render(topo, 1, d.name, all),
      'show spanning-tree vlan 10': (d, all) => Stp.render(topo, 10, d.name, all),
      'show spanning-tree vlan 20': (d, all) => Stp.render(topo, 20, d.name, all),
      'show spanning-tree summary': (d, all) => { const c = Stp.compute(topo, 1, all).switches[d.name]; return 'Switch is in ' + (c.cfg.mode === 'pvst' ? 'pvst' : c.cfg.mode) + ' mode\nRoot bridge for: ' + (c.isRoot ? 'VLAN0001' : 'none') + '\nPortfast Default            is ' + (c.cfg.portfastDefault ? 'enabled' : 'disabled') + '\nPortFast BPDU Guard Default is ' + (c.cfg.bpduguardDefault ? 'enabled' : 'disabled'); },
      'show vlan brief': (d) => { const v = { 1: 'default' }; d.lines.forEach(r => { let m; if (r.mode === 'config' && (m = r.line.match(/^vlan ([\d,\-]+)$/))) Stp.expandRange ? m[1].split(',').forEach(x => { const [a, b] = x.split('-').map(Number); for (let i = a; i <= (b || a); i++) v[i] = v[i] || ('VLAN' + String(i).padStart(4, '0')); }) : null; if (r.mode === 'config-vlan' && (m = r.line.match(/^name (\S+)$/))) { const id = +(r.ctx.replace('vlan ', '').split(/[,-]/)[0]); v[id] = m[1]; } });
        return 'VLAN Name                             Status    Ports\n---- -------------------------------- --------- -------------------\n' + Object.keys(v).map(k => String(k).padEnd(5) + v[k].padEnd(33) + 'active').join('\n'); },
      'show interfaces status': (d, all) => { const c = Stp.compute(topo, 1, all).switches[d.name]; return 'Port      Name   Status       Vlan  Duplex Speed Type\n' + Object.values(c.ports).map(p => Stp.shortName(p.name).padEnd(10) + ''.padEnd(7) + (p.errdisabled ? 'err-disabled' : p.shutdown ? 'disabled    ' : (p.to || p.host) ? 'connected   ' : 'notconnect  ') + ' ' + (p.to && !p.host ? 'trunk' : '1    ') + ' a-full ' + (p.kind === 'gi' ? 'a-1000' : 'a-100 ') + ' 10/100' + (p.kind === 'gi' ? '/1000' : '') + 'BaseTX').join('\n'); }
    };
    return Object.assign(sh, extraShows || {});
  }
  const hasVlan = (d, n) => d.lines.some(r => { let m; if (r.mode !== 'config' || !(m = r.line.match(/^vlan ([\d,\-]+)$/))) return false; return m[1].split(',').some(x => { const [a, b] = x.split('-').map(Number); return b ? n >= a && n <= b : a === n; }); });
  const allPorts = (c, from, to) => { for (let i = from; i <= to; i++) { const p = c.ports[fa(i)]; if (!p) return false; } return true; };

  // ---- shared step factories (reuse = the cumulative-review mechanic) -------
  const S = {
    modeRapid: (devs) => ({ type: 'cmd', skill: 'stp-config', text: 'These boxes are still on classic PVST+. Move every switch to Rapid PVST+. All of them. I will check.',
      check: (d, ctx) => devs.every(n => ctx.compute(1).switches[n].cfg.mode === 'rapid-pvst'),
      hint: devs.map(n => n + '(config)# spanning-tree mode rapid-pvst').join('\n'), ok: 'Rapid. Sub-second when a link dies. Good.' }),
    vlans: (devs, ids) => ({ type: 'cmd', skill: 'vlan-config', text: 'Vee Lan wants streets ' + ids.join(' and ') + ' to exist on every switch before I shape anything. Create them.',
      check: (d) => devs.every(n => ids.every(v => hasVlan(d[n], v))),
      hint: devs[0] + '(config)# vlan ' + ids.join(',') + '\n(repeat on ' + devs.slice(1).join(', ') + ')   — "show vlan brief" to check', ok: 'Streets drawn. Now each one gets its own tree.' }),
    saveAll: (devs) => ({ type: 'cmd', skill: 'cli-modes', text: 'Save it. I do not repeat myself after a reboot.', need: devs.map(n => ({ dev: n, line: /^(do )?write memory$/ })),
      hint: devs.map(n => n + '# write memory   (or: copy running-config startup-config)').join('\n'), ok: '[OK]. Now it survives the dark.' })
  };

  // ============================================================================
  window.JOBS = [
    // ------------------------------------------------------------------ D · First Jack-In (framework demo, non-STP)
    { id: 'd-first-jack', cls: 'D', rep: 30, from: 'enable', title: 'First Jack-In', requires: ['cli-intro'], devices: ['R1'],
      brief: 'DISPATCH » new blood. Enable is holding a door open for you at a pop-up router in Kabuki. Nothing fancy. Get in, name the box, lock door two, save your work. Do not flatline on the tutorial gig, choom.',
      map: { w: 520, h: 200, nodes: [ { id: 'R1', label: 'R1', type: 'router', x: 260, y: 90 }, { id: 'PC', label: 'your deck', type: 'pc', x: 90, y: 90 } ], links: [ { a: 'PC', b: 'R1' } ] },
      shows: { R1: { 'show version': 'Cisco IOS Software, C2900 Software (C2900-UNIVERSALK9-M), Version 15.1(4)M4\nR1 uptime is 3 minutes\nSystem image file is "flash0:c2900-universalk9-mz.SPA.151-4.M4.bin"' } },
      steps: [
        { type: 'cmd', skill: 'cli-modes', text: 'Door one, door two, door three. Get yourself to global configuration mode on R1. Prompt should end in (config)#.', need: [ { dev: 'R1', mode: 'priv', line: 'configure terminal' } ], hint: 'R1> enable\nR1# configure terminal', ok: 'Third door. In you go.' },
        { type: 'cmd', skill: 'cli-modes', text: 'Name it NC-R1. The prompt will tell you if you got it.', need: [ { dev: 'R1', mode: 'config', line: 'hostname nc-r1' } ], hint: 'R1(config)# hostname NC-R1', ok: 'It knows its own name now.' },
        { type: 'cmd', skill: 'cli-modes', text: 'Lock door two with a hashed password. Not the plaintext one. Pick any secret.', need: [ { dev: 'R1', mode: 'config', line: /^enable secret \S+/ } ], hint: 'NC-R1(config)# enable secret <password>', ok: 'Hashed. "enable password" would have been readable. Never that.' },
        { type: 'choice', skill: 'cli-modes', text: 'Everything you just did lives where, right now?', opts: ['startup-config, in NVRAM', 'running-config, in RAM', 'flash, next to the IOS image', 'the terminal history only'], a: 1, hint: 'RAM = right now. NVRAM = after reboot.', ok: 'RAM. Which means a power blip eats it.' },
        { type: 'cmd', skill: 'cli-modes', text: 'So save it.', need: [ { dev: 'R1', line: /^(do )?write memory$/ } ], hint: 'NC-R1# write memory   (or copy running-config startup-config)', ok: '[OK]. Door closes behind you. Gig done.' }
      ], outro: 'Enable nods once. That is the most you will ever get from him. Dispatch pings: rep credited.' },

    // ------------------------------------------------------------------ D · Storm Warning (Day 20/21)
    { id: 'd-storm-warning', cls: 'D', rep: 30, from: 'root', title: 'Storm Warning', requires: ['stp-why', 'stp-election', 'stp-config'], devices: ['SW1', 'SW2', 'SW3'],
      brief: 'DISPATCH » Old Root has a three-switch office in Watson that "feels slow". He says the tree grew by accident. Find out who is root, then choose one on purpose. Class D, low ICE, good first real gig.\n\nOLD ROOT » The oldest switch in that building is running the tree because nobody told it not to. Look, then decide.',
      topo: triangle({ SW1: '00d0.f8e4.0a01', SW2: '0c11.7a3b.9902', SW3: '0001.9642.a3c0' }), map: triMap(),
      steps: [
        { type: 'find', skill: 'stp-election', text: 'Jack in. Run "show spanning-tree" on any switch. The Root ID is the same everywhere. Click the switch whose Bridge ID address matches it.', target: 'SW3', hint: 'Every switch prints "Root ID … Address 0001.9642.a3c0". Find the switch whose own "Bridge ID … Address" is that same MAC. Lowest MAC won, because every priority is default.', ok: 'SW3. Oldest MAC in the room. An accident, as I said.' },
        { type: 'cmd', skill: 'stp-config', text: 'Make SW1 the root bridge for VLAN 1. Your choice how. I only check the outcome.', check: (d, ctx) => ctx.compute(1).switches.SW1.isRoot, hint: 'SW1(config)# spanning-tree vlan 1 root primary\n   — or —\nSW1(config)# spanning-tree vlan 1 priority 4096', ok: 'SW1 is the centre now. The tree re-grew around it in under a second, because these are rapid.' },
        { type: 'cmd', skill: 'stp-election', text: 'Never trust the switch you configured. Prove it from SW2: look at its tree.', need: [ { dev: 'SW2', line: /^(do )?show spanning-tree/ } ], hint: 'SW2# show spanning-tree   (or "do show spanning-tree" from config mode)', ok: 'Root ID address is SW1\'s MAC. "This bridge is the root" is gone from SW2. Good.' },
        { type: 'choice', skill: 'stp-election', text: 'On SW2, which port is the root port now, and why?', opts: ['Gi0/1 — directly toward SW1, root cost 4', 'Gi0/2 — toward SW3, root cost 4', 'Fa0/1 — lowest port number', 'None — SW2 became the secondary root'], a: 0, hint: 'Root port = lowest root cost to SW1. SW2\'s direct Gigabit link costs 4; going through SW3 would be 8.', ok: 'Four is less than eight. The port that faces me is always the cheapest one.' }
      ], outro: 'Old Root: "The building will not notice. That is the point." Dispatch: rep credited. More Class D gigs are open; run them again if you want the reflex to stick.' },

    // ------------------------------------------------------------------ D · Thirty Seconds of Silence (Day 21 states/timers/toolkit)
    { id: 'd-thirty-seconds', cls: 'D', rep: 30, from: 'root', title: 'Thirty Seconds of Silence', requires: ['stp-states', 'stp-toolkit'], devices: ['SW1', 'SW2', 'SW3'],
      brief: 'DISPATCH » Same Watson office. Now the corpos complain every desk PC on SW2 takes half a minute to get network after boot. It\'s giving "skill issue" but it is actually a timer. Old Root wants the toolkit used properly. Class D.',
      topo: triangle({ SW1: '0001.9642.a3c0', SW2: '0c11.7a3b.9902', SW3: '00d0.f8e4.0a01' }), map: triMap(),
      steps: [
        { type: 'choice', skill: 'stp-states', text: 'Thirty seconds, every boot, on SW2 Fa0/1–12. Which two states are those host ports sitting through?', opts: ['Blocking then Listening', 'Listening then Learning, 15 s each', 'Learning then Forwarding', 'Max Age then Hello'], a: 1, hint: 'Forward Delay is 15 s, and it is applied twice.', ok: 'Listening, Learning. Fifteen and fifteen. For a PC that can never form a loop.' },
        { type: 'cmd', skill: 'stp-toolkit', text: 'Fix it. Those twelve host ports on SW2 should go straight to forwarding. Interface range or global default, I do not mind.', check: (d, ctx) => { const c = ctx.compute(1).switches.SW2; for (let i = 1; i <= 12; i++) if (!c.ports[fa(i)].portfast) return false; return true; },
          hint: 'SW2(config)# interface range f0/1 - 12\nSW2(config-if-range)# spanning-tree portfast\n   — or globally —\nSW2(config)# spanning-tree portfast default', ok: 'Edge ports. "show spanning-tree" will mark them P2p Edge.' },
        { type: 'cmd', skill: 'stp-toolkit', text: 'A fast door needs a guard. If any of those ports ever hears a BPDU, it must shut itself.', check: (d, ctx) => { const c = ctx.compute(1).switches.SW2; for (let i = 1; i <= 12; i++) if (!c.ports[fa(i)].bpduguard) return false; return true; },
          hint: 'SW2(config-if-range)# spanning-tree bpduguard enable\n   — or globally —\nSW2(config)# spanning-tree portfast bpduguard default', ok: 'Now a rogue switch under a desk gets err-disabled before it can say hello.' },
        { type: 'choice', skill: 'stp-states', text: 'Exam angle. Under classic 802.1D, a blocked port on SW3 must take over after its neighbour dies. Worst case, how long until it forwards?', opts: ['2 seconds', '15 seconds', '30 seconds', '50 seconds'], a: 3, hint: 'Max Age + Listening + Learning.', ok: 'Twenty, fifteen, fifteen. Fifty. Which is why RSTP exists.' },
        S.saveAll(['SW2'])
      ], outro: 'Old Root: "Fast where it is safe. Slow where it is not. That is the whole toolkit." Rep credited.' },

    // ------------------------------------------------------------------ C · The Rogue Switch (Day 21 BPDU + toolkit + config; nests D)
    { id: 'c-rogue-switch', cls: 'C', rep: 60, from: 'root', title: 'The Rogue Switch', requires: ['stp-bpdu', 'stp-toolkit', 'stp-config'], devices: ['SW1', 'SW2', 'SW3'],
      brief: 'DISPATCH » Class C. Something in the Watson office is claiming to be the root bridge with priority ZERO and half the floor is now hairpinning through a box nobody owns. Old Root is, in his words, "displeased". Find it, cut it, and choose the root on purpose this time.\n\nOLD ROOT » Every hello is a claim. Somebody is lying.',
      topo: triangle({ SW1: '0001.9642.a3c0', SW2: '0c11.7a3b.9902', SW3: '00d0.f8e4.0a01' }, t => { t.switches.SW2.ports[fa(7)] = { to: 'ROGUE', peer: fa(1), access: true }; t.switches.ROGUE = { mac: '0000.0c9f.f001', rogue: true, fixed: { priority: 0, mode: 'pvst', ports: {} }, ports: { [fa(1)]: { to: 'SW2', peer: fa(7) } } }; }),
      map: (() => { const m = triMap(['ROGUE']); m.nodes.push({ id: 'ROGUE', label: '?? under desk 7', type: 'rogue', x: 110, y: 275 }); m.links.push({ a: 'SW2', b: 'ROGUE', ap: fa(7), bp: fa(1) }); return m; })(),
      steps: [
        { type: 'find', skill: 'stp-bpdu', text: '"show spanning-tree" on SW2. Read the Root ID priority. Follow the root port. Click the box that is now the root of this building.', target: 'ROGUE', hint: 'Root ID priority 1 (0 + VLAN 1) and a MAC none of your switches own. SW2\'s root port is Fa0/7. Follow it.', ok: 'Priority zero. A ten-eddie switch from a bodega, or a deck running Yersinia. Same fix.' },
        { type: 'cmd', skill: 'stp-toolkit', text: 'Shut that door, and make it shut itself next time. SW2 Fa0/7 must go err-disabled the moment it hears a BPDU.', check: (d, ctx) => ctx.compute(1).switches.SW2.ports[fa(7)].errdisabled,
          hint: 'SW2(config)# interface f0/7\nSW2(config-if)# spanning-tree portfast\nSW2(config-if)# spanning-tree bpduguard enable\n   — or globally —\nSW2(config)# spanning-tree portfast default\nSW2(config)# spanning-tree portfast bpduguard default', ok: '%SPANTREE-2-BLOCK_BPDUGUARD: Received BPDU on port Fa0/7. Disabling port. The lie stops here.' },
        { type: 'cmd', skill: 'stp-config', text: 'Now choose on purpose. VLAN 1: SW1 primary root, SW2 secondary. Then the next rogue has to beat a real number.', check: (d, ctx) => { const c = ctx.compute(1); return c.switches.SW1.isRoot && c.switches.SW2.prio === 28673; },
          hint: 'SW1(config)# spanning-tree vlan 1 root primary\nSW2(config)# spanning-tree vlan 1 root secondary', ok: '24576 and 28672. Lower than any default, and a backup if SW1 dies.' },
        { type: 'choice', skill: 'stp-bpdu', text: 'The rogue\'s BPDUs were addressed to 01:00:0C:CC:CC:CD. What was it speaking?', opts: ['IEEE 802.1D standard STP', 'Cisco PVST+', 'LLDP', 'CDP'], a: 1, hint: 'IEEE uses 01:80:C2:00:00:00. The 01:00:0C prefix is Cisco.', ok: 'Cisco per-VLAN. Which means it was a real switch, not a toy. Someone brought it from work.' },
        { type: 'cmd', skill: 'stp-toolkit', text: 'Facilities pulled the box. Bring Fa0/7 back from err-disabled. You know the two words.', need: [ { dev: 'SW2', ctx: 'interface ' + fa(7), line: 'shutdown' }, { dev: 'SW2', ctx: 'interface ' + fa(7), line: 'no shutdown' } ], onPass: (ctx) => { ctx.topo.switches.ROGUE.removed = true; },
          hint: 'SW2(config)# interface f0/7\nSW2(config-if)# shutdown\nSW2(config-if)# no shutdown', ok: 'Up, guarded, and honest. Desk 7 gets its network back.' }
      ], outro: 'Old Root: "You did not just fix it. You made it unable to happen twice. That is the difference between a tech and a netrunner." Rep credited. Class C gigs unlocking.' },

    // ------------------------------------------------------------------ C · Cost of the Path (Day 20/21 election, cost, port config; nests states)
    { id: 'c-cost-of-path', cls: 'C', rep: 60, from: 'root', title: 'Cost of the Path', requires: ['stp-election', 'stp-config'], devices: ['SW1', 'SW2', 'SW3'],
      brief: 'DISPATCH » Class C. A corpo in Westbrook paid for dark fibre straight from SW1 to SW3 and is furious that traffic "takes the long way" through SW2. Old Root says the tree is doing exactly what the numbers say. Your job: do the numbers, then change them.\n\nOLD ROOT » Hop count means nothing to me. Cost does.',
      topo: { defaultMode: 'rapid-pvst', switches: {
        SW1: { mac: '0001.9642.a3c0', ports: Object.assign({ [gi(1)]: { to: 'SW2', peer: gi(1) }, [fa(24)]: { to: 'SW3', peer: fa(24) } }, hosts('SW1', 1, 8, 'PC1-')) },
        SW2: { mac: '000a.b7c1.2202', ports: Object.assign({ [gi(1)]: { to: 'SW1', peer: gi(1) }, [gi(2)]: { to: 'SW3', peer: gi(1) } }, hosts('SW2', 1, 8, 'PC2-')) },
        SW3: { mac: '00d0.f8e4.0a01', ports: Object.assign({ [gi(1)]: { to: 'SW2', peer: gi(2) }, [fa(24)]: { to: 'SW1', peer: fa(24) } }, hosts('SW3', 1, 8, 'PC3-')) } } },
      map: { w: 520, h: 300, nodes: [ { id: 'SW1', label: 'SW1 (root)', type: 'switch', x: 90, y: 80 }, { id: 'SW2', label: 'SW2', type: 'switch', x: 260, y: 220 }, { id: 'SW3', label: 'SW3', type: 'switch', x: 430, y: 80 }, { id: 'PC3', label: 'servers', type: 'server', x: 480, y: 250, small: true } ],
        links: [ { a: 'SW1', b: 'SW2', ap: gi(1), bp: gi(1), tag: 'Gig' }, { a: 'SW2', b: 'SW3', ap: gi(2), bp: gi(1), tag: 'Gig' }, { a: 'SW1', b: 'SW3', ap: fa(24), bp: fa(24), tag: 'FastE (dark fibre)' }, { a: 'SW3', b: 'PC3' } ] },
      steps: [
        { type: 'calc', skill: 'stp-election', text: 'Numbers first. From SW3, what is the root cost by each path, and which port is the root port?', fields: [
            { key: 'direct', label: 'Root cost via Fa0/24 (direct link to SW1)', check: v => v.trim() === '19' },
            { key: 'via', label: 'Root cost via Gi0/1 (through SW2)', check: v => v.trim() === '8' },
            { key: 'rp', label: 'SW3 root port (e.g. Gi0/1 or Fa0/24)', check: v => /^(gi|gigabitethernet)\s*0\/1$/i.test(v.trim()) } ],
          hint: 'FastEthernet = 19. Gigabit = 4. Two Gigabit hops = 4 + 4 = 8. Lower wins.', ok: 'Nineteen against eight. The fibre lost to two copper hops, fair and square. Now we cheat, honestly.' },
        { type: 'cmd', skill: 'stp-config', text: 'The client wants the direct SW1–SW3 link active. Do not touch priorities. Make Fa0/24 SW3\'s root port by changing cost.', check: (d, ctx) => ctx.compute(1).switches.SW3.rootPort === fa(24),
          hint: 'SW3(config)# interface f0/24\nSW3(config-if)# spanning-tree vlan 1 cost 4      (anything below 8 works)\n   — or raise the other side —\nSW3(config)# interface g0/1\nSW3(config-if)# spanning-tree vlan 1 cost 100', ok: 'Fa0/24 is Root FWD now. The number changed; the tree followed.' },
        { type: 'choice', skill: 'stp-election', text: 'Which SW3 port is now Alternate, blocking?', opts: ['Gi0/1 — toward SW2', 'Fa0/24 — toward SW1', 'Fa0/1 — a host port', 'None; SW3 has become root'], a: 0, hint: 'Only one port faces the root. The other switch-facing port has to sleep.', ok: 'Gi0/1 sleeps. The ring is broken exactly once, exactly where the client wanted.' },
        { type: 'choice', skill: 'stp-states', text: 'Exam angle. Which timer sets the length of the Listening and Learning states?', opts: ['Hello — 2 s', 'Forward Delay — 15 s', 'Max Age — 20 s', 'Aging — 300 s'], a: 1, hint: 'Fifteen seconds, applied twice.', ok: 'Forward Delay. Dictated by the root bridge for the whole tree.' },
        { type: 'cmd', skill: 'stp-election', text: 'Look at it from SW3 one more time. Then we are done.', need: [ { dev: 'SW3', line: /^(do )?show spanning-tree/ } ], hint: 'SW3# show spanning-tree', ok: 'Root port Fa0/24, cost 4 — your number, not the default. The client can stop shouting.' }
      ], outro: 'Old Root: "You changed the tree by changing what it measures. That is the only clean way." Rep credited.' },

    // ------------------------------------------------------------------ B · Per-VLAN Split (Day 21 PVST+, mode, primary/secondary per VLAN; nests VLAN creation)
    { id: 'b-per-vlan-split', cls: 'B', rep: 100, from: 'root', title: 'Per-VLAN Split', requires: ['vlan-intro', 'stp-config', 'stp-bpdu'], devices: ['SW1', 'SW2', 'SW3'],
      brief: 'DISPATCH » Class B. Vee Lan and Old Root are working the same building in Charter Hill: two departments, two VLANs, two uplinks, and right now one uplink sits idle because one root rules everything. Split the trees. Both links should earn their keep.\n\nVEE LAN » Streets 10 and 20. Make them exist before he starts drawing trees on them.\nOLD ROOT » One root per street. Each the other\'s backup.',
      topo: triangle({ SW1: '0001.9642.a3c0', SW2: '0c11.7a3b.9902', SW3: '00d0.f8e4.0a01' }, t => { t.defaultMode = 'pvst'; }), map: triMap(),
      steps: [
        S.vlans(['SW1', 'SW2', 'SW3'], [10, 20]),
        S.modeRapid(['SW1', 'SW2', 'SW3']),
        { type: 'cmd', skill: 'stp-config', text: 'VLAN 10 roots at SW1 with SW2 as secondary. VLAN 20 roots at SW2 with SW1 as secondary. Four commands. Per VLAN, always.',
          check: (d, ctx) => { const a = ctx.compute(10), b = ctx.compute(20); return a.switches.SW1.isRoot && a.switches.SW2.prio === 28672 + 10 && b.switches.SW2.isRoot && b.switches.SW1.prio === 28672 + 20; },
          hint: 'SW1(config)# spanning-tree vlan 10 root primary\nSW1(config)# spanning-tree vlan 20 root secondary\nSW2(config)# spanning-tree vlan 20 root primary\nSW2(config)# spanning-tree vlan 10 root secondary', ok: 'Two trees, two roots, two blocked ports in different places. Both uplinks carry traffic now.' },
        { type: 'cmd', skill: 'stp-election', text: 'Prove it from SW3, for VLAN 20 specifically.', need: [ { dev: 'SW3', line: /^(do )?show spanning-tree vlan 20$/ } ], hint: 'SW3# show spanning-tree vlan 20', ok: 'Root ID is SW2\'s MAC for VLAN 20. Run it for VLAN 10 and watch it change.' },
        { type: 'choice', skill: 'stp-election', text: 'On SW3, VLAN 20: which port is the root port?', opts: ['Gi0/1 — toward SW1', 'Gi0/2 — toward SW2, cost 4', 'Fa0/1', 'None; SW3 is root for VLAN 20'], a: 1, hint: 'VLAN 20\'s root is SW2. Which SW3 port faces SW2 directly?', ok: 'Gi0/2. And for VLAN 10 it is Gi0/1. Same cables, different trees.' },
        { type: 'choice', skill: 'stp-config', text: 'You typed nothing for VLAN 1. Its topology…', opts: ['also moved to SW1', 'is unchanged — with PVST+, every VLAN has its own tree', 'collapsed until reboot', 'merged into VLAN 10'], a: 1, hint: 'Every command you typed said "vlan 10" or "vlan 20".', ok: 'Unchanged. Whatever accident ruled VLAN 1 still rules it. Fix that too, if you have the rep.' },
        S.saveAll(['SW1', 'SW2', 'SW3'])
      ], outro: 'Vee Lan: "Clean borders." Old Root: "Clean trees." Dispatch: that is Class B work. Rep credited.' },

    // ------------------------------------------------------------------ A · Old Root's Last Storm (everything, one building, one night)
    { id: 'a-last-storm', cls: 'A', rep: 200, from: 'root', title: "Old Root's Last Storm", requires: ['stp-why', 'stp-election', 'stp-states', 'stp-bpdu', 'stp-toolkit', 'stp-config'], devices: ['SW1', 'SW2', 'SW3', 'SW4'],
      brief: 'DISPATCH » Class A. Four switches, a new corpo floor in City Center, opening at 06:00. Something is already claiming root on SW4 with priority zero. Classic PVST+ everywhere. No VLANs. No guards. No plan. Old Root wants the whole tree shaped before sunrise, and he wants it to survive the next idiot with a bodega switch.\n\nOLD ROOT » Everything you have learned. One building. One night. Do not rush the forwarding state.',
      topo: { defaultMode: 'pvst', switches: {
        SW1: { mac: '0001.9642.a3c0', ports: Object.assign({ [gi(1)]: { to: 'SW2', peer: gi(1) }, [gi(2)]: { to: 'SW3', peer: gi(1) } }, hosts('SW1', 1, 8, 'PC1-')) },
        SW2: { mac: '0c11.7a3b.9902', ports: Object.assign({ [gi(1)]: { to: 'SW1', peer: gi(1) }, [gi(2)]: { to: 'SW4', peer: gi(1) }, [fa(24)]: { to: 'SW3', peer: fa(24) } }, hosts('SW2', 1, 8, 'PC2-')) },
        SW3: { mac: '00d0.f8e4.0a01', ports: Object.assign({ [gi(1)]: { to: 'SW1', peer: gi(2) }, [gi(2)]: { to: 'SW4', peer: gi(2) }, [fa(24)]: { to: 'SW2', peer: fa(24) } }, hosts('SW3', 1, 8, 'PC3-')) },
        SW4: { mac: '0000.5e00.5301', ports: Object.assign({ [gi(1)]: { to: 'SW2', peer: gi(2) }, [gi(2)]: { to: 'SW3', peer: gi(2) }, [fa(3)]: { to: 'ROGUE', peer: fa(1), access: true } }, hosts('SW4', 1, 2, 'PC4-'), hosts('SW4', 4, 8, 'PC4-')) },
        ROGUE: { mac: '0000.0c9f.f002', rogue: true, fixed: { priority: 0, mode: 'pvst', ports: {} }, ports: { [fa(1)]: { to: 'SW4', peer: fa(3) } } } } },
      map: { w: 520, h: 320, nodes: [ { id: 'SW1', label: 'SW1', type: 'switch', x: 120, y: 60 }, { id: 'SW2', label: 'SW2', type: 'switch', x: 400, y: 60 }, { id: 'SW3', label: 'SW3', type: 'switch', x: 120, y: 230 }, { id: 'SW4', label: 'SW4', type: 'switch', x: 400, y: 230 }, { id: 'ROGUE', label: '?? desk 3', type: 'rogue', x: 480, y: 300 }, { id: 'PC1', label: 'PCs', type: 'pc', x: 40, y: 30, small: true }, { id: 'PC3', label: 'PCs', type: 'pc', x: 40, y: 290, small: true } ],
        links: [ { a: 'SW1', b: 'SW2', ap: gi(1), bp: gi(1) }, { a: 'SW1', b: 'SW3', ap: gi(2), bp: gi(1) }, { a: 'SW2', b: 'SW4', ap: gi(2), bp: gi(1) }, { a: 'SW3', b: 'SW4', ap: gi(2), bp: gi(2) }, { a: 'SW2', b: 'SW3', ap: fa(24), bp: fa(24), tag: 'FastE' }, { a: 'SW4', b: 'ROGUE', ap: fa(3), bp: fa(1) }, { a: 'SW1', b: 'PC1' }, { a: 'SW3', b: 'PC3' } ], alert: ['ROGUE'] },
      steps: [
        { type: 'find', skill: 'stp-bpdu', text: 'Start where the lie is. Read the tree on SW4, follow its root port, click the box claiming root.', target: 'ROGUE', hint: 'SW4# show spanning-tree — Root ID priority 1, root port Fa0/3.', ok: 'Priority zero at desk 3. Of course.' },
        S.modeRapid(['SW1', 'SW2', 'SW3', 'SW4']),
        { type: 'cmd', skill: 'stp-toolkit', text: 'Guard the whole floor at once. On all four switches: every access port PortFast, every PortFast port BPDU-guarded. Globally. SW4 Fa0/3 should go err-disabled the moment you finish.',
          check: (d, ctx) => { const c = ctx.compute(1); return ['SW1', 'SW2', 'SW3', 'SW4'].every(n => c.switches[n].cfg.portfastDefault && c.switches[n].cfg.bpduguardDefault) && c.switches.SW4.ports[fa(3)].errdisabled; },
          hint: 'SWx(config)# spanning-tree portfast default\nSWx(config)# spanning-tree portfast bpduguard default\n(on SW1, SW2, SW3 and SW4)', ok: '%SPANTREE-2-BLOCK_BPDUGUARD on SW4 Fa0/3. The rogue is talking to a closed door.' },
        S.vlans(['SW1', 'SW2', 'SW3', 'SW4'], [10, 20]),
        { type: 'cmd', skill: 'stp-config', text: 'Shape both trees. VLAN 10: SW1 primary, SW2 secondary. VLAN 20: SW2 primary, SW1 secondary.',
          check: (d, ctx) => { const a = ctx.compute(10), b = ctx.compute(20); return a.switches.SW1.isRoot && a.switches.SW2.prio === 28682 && b.switches.SW2.isRoot && b.switches.SW1.prio === 28692; },
          hint: 'SW1(config)# spanning-tree vlan 10 root primary\nSW1(config)# spanning-tree vlan 20 root secondary\nSW2(config)# spanning-tree vlan 20 root primary\nSW2(config)# spanning-tree vlan 10 root secondary', ok: 'Two roots, chosen. Two backups, chosen.' },
        { type: 'calc', skill: 'stp-election', text: 'VLAN 10, root SW1. SW4 can reach it through SW2 or through SW3. Do the numbers.', fields: [
            { key: 'cost', label: 'SW4 root cost for VLAN 10 (either path)', check: v => v.trim() === '8' },
            { key: 'rp', label: 'SW4 root port for VLAN 10 (Gi0/1 or Gi0/2)', check: v => /^(gi|gigabitethernet)\s*0\/1$/i.test(v.trim()) },
            { key: 'why', label: 'Tiebreaker that decided it (cost / neighbour BID / port ID)', check: v => /bid|bridge/i.test(v) } ],
          hint: 'Both paths cost 4 + 4 = 8. Tie → lower neighbour Bridge ID. SW2 is secondary root (28672+10); SW3 is default (32768+10). SW2 wins, so Gi0/1.', ok: 'Eight against eight, settled by the neighbour\'s Bridge ID. SW2 is the secondary, so SW2 is lower, so Gi0/1.' },
        { type: 'cmd', skill: 'stp-config', text: 'I want SW4 to prefer SW3 for VLAN 10 anyway; SW2 carries VLAN 20. No priorities. Cost only.', check: (d, ctx) => ctx.compute(10).switches.SW4.rootPort === gi(2),
          hint: 'SW4(config)# interface g0/2\nSW4(config-if)# spanning-tree vlan 10 cost 3      (anything that makes the SW3 path < 8)', ok: 'Seven beats eight. VLAN 10 leans left, VLAN 20 leans right. Both uplinks work.' },
        { type: 'cmd', skill: 'stp-toolkit', text: 'Facilities pulled the desk-3 box. Recover SW4 Fa0/3.', need: [ { dev: 'SW4', ctx: 'interface ' + fa(3), line: 'shutdown' }, { dev: 'SW4', ctx: 'interface ' + fa(3), line: 'no shutdown' } ], onPass: (ctx) => { ctx.topo.switches.ROGUE.removed = true; }, hint: 'SW4(config)# interface f0/3\nSW4(config-if)# shutdown\nSW4(config-if)# no shutdown', ok: 'Back up. Still guarded.' },
        { type: 'choice', skill: 'stp-bpdu', text: 'Exam angle. A standard IEEE 802.1D BPDU is sent to which destination MAC?', opts: ['01:00:0C:CC:CC:CD', '01:80:C2:00:00:00', 'FF:FF:FF:FF:FF:FF', '01:00:5E:00:00:01'], a: 1, hint: 'The Cisco one starts with 01:00:0C. The IEEE one starts with 01:80:C2.', ok: '01:80:C2:00:00:00. Reserved, link-local, never forwarded by a bridge.' },
        { type: 'choice', skill: 'stp-states', text: 'Exam angle. Default Max Age?', opts: ['2 seconds', '15 seconds', '20 seconds', '50 seconds'], a: 2, hint: 'Ten hellos.', ok: 'Twenty seconds of silence before a switch stops believing its root.' },
        S.saveAll(['SW1', 'SW2', 'SW3', 'SW4'])
      ], outro: 'Old Root sits down. "It will hold. It will hold through the next idiot, and the one after." Dispatch: Class A confirmed. There is no higher class in this arc. The next arc is not yet mapped.' }
  ];

  window.CLASSES = [ { id: 'D', min: 0, name: 'Class D · Street' }, { id: 'C', min: 90, name: 'Class C · Runner' }, { id: 'B', min: 250, name: 'Class B · Operator' }, { id: 'A', min: 400, name: 'Class A · Architect' } ];
})();
