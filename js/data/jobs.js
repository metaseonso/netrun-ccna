/* jobs.js — LAYER 2: gigs. A message from Dispatch, a line from the client, then the NPC with you in the building.
   Step types: find (click a node) · cmd (type IOS; validated by `need` command records and/or `check(devs, ctx)` state)
               · choice (a question someone in the room actually asks) · calc (typed answers). Each step names the `skill` it exercises.
   Higher-class gigs bring back earlier problems in new buildings, because that is what work is. */
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
  const triMap = (alert) => ({ w: 520, h: 340, nodes: [
      { id: 'SW1', label: 'SW1', type: 'switch', x: 260, y: 80 }, { id: 'SW2', label: 'SW2', type: 'switch', x: 110, y: 220 }, { id: 'SW3', label: 'SW3', type: 'switch', x: 410, y: 220 },
      { id: 'PC1', label: 'PCs ×12', type: 'pc', x: 400, y: 40, small: true }, { id: 'PC2', label: 'PCs ×12', type: 'pc', x: 40, y: 290, small: true }, { id: 'PC3', label: 'PCs ×12', type: 'pc', x: 480, y: 290, small: true } ],
    links: [ { a: 'SW1', b: 'SW2', ap: gi(1), bp: gi(1) }, { a: 'SW1', b: 'SW3', ap: gi(2), bp: gi(1) }, { a: 'SW2', b: 'SW3', ap: gi(2), bp: gi(2) },
      { a: 'SW1', b: 'PC1' }, { a: 'SW2', b: 'PC2' }, { a: 'SW3', b: 'PC3' } ], alert: alert || [] });

  const hasVlan = (d, n) => d.lines.some(r => { let m; if (r.mode !== 'config' || !(m = r.line.match(/^vlan ([\d,\-]+)$/))) return false; return m[1].split(',').some(x => { const [a, b] = x.split('-').map(Number); return b ? n >= a && n <= b : a === n; }); });

  // ---- shared steps (the cumulative-review mechanic) ---------------------------
  const S = {
    modeRapid: (devs) => ({ type: 'cmd', skill: 'stp-config', text: 'Old Root, on the phone: "Check what those boxes are running first. If it says pvst, they are on the classic tree with the fifty-second wake-up. Put every one of them on Rapid PVST+ before you shape anything."',
      check: (d, ctx) => devs.every(n => ctx.compute(1).switches[n].cfg.mode === 'rapid-pvst'),
      hint: devs.map(n => n + '(config)# spanning-tree mode rapid-pvst').join('\n'), ok: '"Rapid. Now a dead link comes back in under a second instead of fifty. Go on."' }),
    vlans: (devs, ids) => ({ type: 'cmd', skill: 'vlan-config', text: 'Vee Lan, from the next room: "Before he starts drawing trees, VLANs ' + ids.join(' and ') + ' need to exist on every switch. They do not yet. Create them."',
      check: (d) => devs.every(n => ids.every(v => hasVlan(d[n], v))),
      hint: devs[0] + '(config)# vlan ' + ids.join(',') + '\n(repeat on ' + devs.slice(1).join(', ') + ')   — "show vlan brief" to check', ok: 'Vee Lan: "Good. Now each one can have its own tree."' }),
    saveAll: (devs) => ({ type: 'cmd', skill: 'cli-modes', text: 'Old Root: "Save it. If this building reboots tonight I do not want to be woken up to explain what you did."', need: devs.map(n => ({ dev: n, line: /^(do )?write memory$/ })),
      hint: devs.map(n => n + '# write memory   (or: copy running-config startup-config)').join('\n'), ok: '"[OK]. It will survive the night."' })
  };

  // ============================================================================
  window.JOBS = [
    // ------------------------------------------------------------------ D · First Jack-In
    { id: 'd-first-jack', cls: 'D', rep: 30, from: 'enable', title: 'First Jack-In', requires: ['cli-intro'], devices: ['R1'],
      brief: 'DISPATCH » Enable has a pop-up router in Kabuki with nothing on it yet. Name it, put a password on the second door, save. That is the whole gig. Do not overthink it.\n\nCLIENT (a noodle bar owner) » "The man said it needs a name and a password. I do not know what that means. Please do not break the card reader."',
      map: { w: 520, h: 200, nodes: [ { id: 'R1', label: 'R1', type: 'router', x: 260, y: 90 }, { id: 'PC', label: 'your deck', type: 'pc', x: 90, y: 90 } ], links: [ { a: 'PC', b: 'R1' } ] },
      shows: { R1: { 'show version': 'Cisco IOS Software, C2900 Software (C2900-UNIVERSALK9-M), Version 15.1(4)M4\nR1 uptime is 3 minutes\nSystem image file is "flash0:c2900-universalk9-mz.SPA.151-4.M4.bin"' } },
      steps: [
        { type: 'cmd', skill: 'cli-modes', text: 'Enable, from his stool: "Door one, door two, door three. Get to global configuration on R1. I want to see (config)# in the prompt."', need: [ { dev: 'R1', mode: 'priv', line: 'configure terminal' } ], hint: 'R1> enable\nR1# configure terminal', ok: '"Third door. In."' },
        { type: 'cmd', skill: 'cli-modes', text: '"The owner wants it called NC-R1. The prompt will change when you get it right."', need: [ { dev: 'R1', mode: 'config', line: 'hostname nc-r1' } ], hint: 'R1(config)# hostname NC-R1', ok: '"It knows its name."' },
        { type: 'cmd', skill: 'cli-modes', text: '"Lock door two. The hashed kind. Any password you like, I will not read it."', need: [ { dev: 'R1', mode: 'config', line: /^enable secret \S+/ } ], hint: 'NC-R1(config)# enable secret <password>', ok: '"Hashed. The other command stores it in plain text. I have never understood who chooses that."' },
        { type: 'choice', skill: 'cli-modes', text: 'The owner, from behind the counter: "So it is done? If the power goes, it stays?"', opts: ['Yes, it is in the startup-config now', 'No. It is in the running-config, in memory. A reboot loses it until it is saved', 'Yes, it is in flash with the software', 'It is only in the terminal history'], a: 1, hint: 'Memory is now. NVRAM is after a reboot.', ok: 'Enable: "Correct. So do something about it."' },
        { type: 'cmd', skill: 'cli-modes', text: '"Save it."', need: [ { dev: 'R1', line: /^(do )?write memory$/ } ], hint: 'NC-R1# write memory   (or copy running-config startup-config)', ok: '"[OK]. Door closes behind you."' }
      ], outro: 'The owner brings you a bowl of noodles you did not order. Enable nods once, which is as much as anyone gets. Dispatch: "Rep credited. Old Root is asking for someone at the clinic."' },

    // ------------------------------------------------------------------ D · The Accidental Root (Day 20/21)
    { id: 'd-storm-warning', cls: 'D', rep: 30, from: 'root', title: 'The Accidental Root', requires: ['stp-why', 'stp-election', 'stp-config'], devices: ['SW1', 'SW2', 'SW3'],
      brief: 'DISPATCH » Old Root wants you back at the clinic annex. Three switches, and the wrong one is running the tree. He wants you to find it and fix it while he watches. Low stakes. Do it clean.\n\nOLD ROOT » "Nobody chose the root in this building. I want you to choose it. Look first."',
      topo: triangle({ SW1: '00d0.f8e4.0a01', SW2: '0c11.7a3b.9902', SW3: '0001.9642.a3c0' }), map: triMap(),
      steps: [
        { type: 'find', skill: 'stp-election', text: 'Old Root, arms folded: "Run "show spanning-tree" on any of them. The Root ID is the same everywhere. Now find the switch whose own Bridge ID matches it, and click it on the map."', target: 'SW3', hint: 'Every switch prints "Root ID … Address 0001.9642.a3c0". Find the switch whose "Bridge ID … Address" is that same MAC. All priorities are default, so the lowest MAC won.', ok: '"SW3. The pharmacy hand-me-down. Oldest MAC address in the room, so it won an election nobody held."' },
        { type: 'cmd', skill: 'stp-config', text: '"Make SW1 the root for VLAN 1. I do not care which command you use. I care what the tree does afterwards."', check: (d, ctx) => ctx.compute(1).switches.SW1.isRoot, hint: 'SW1(config)# spanning-tree vlan 1 root primary\n   — or —\nSW1(config)# spanning-tree vlan 1 priority 4096', ok: '"SW1 is the centre. The tree regrew around it in under a second. These are rapid."' },
        { type: 'cmd', skill: 'stp-election', text: '"Do not trust the switch you typed on. Go to SW2 and look at its tree."', need: [ { dev: 'SW2', line: /^(do )?show spanning-tree/ } ], hint: 'SW2# show spanning-tree   (or "do show spanning-tree" from config mode)', ok: '"Root ID address is SW1\'s now. And SW2 has a root port. Read it to me."' },
        { type: 'choice', skill: 'stp-election', text: '"Which port on SW2 is the root port, and why that one?"', opts: ['Gi0/1, straight to SW1, root cost 4', 'Gi0/2, toward SW3, root cost 4', 'Fa0/1, the lowest port number', 'None. SW2 became the secondary root'], a: 0, hint: 'Root port = lowest root cost to SW1. SW2\'s direct gigabit link costs 4. Going through SW3 would be 8.', ok: '"Four is less than eight. The port that faces me is the cheapest one. Good."' }
      ], outro: 'Old Root: "The nurses will not notice anything. That is what a good change looks like." Dispatch: "Rep credited. Run it again if you want the reflex to stick. Repeats pay less than new gigs."' },

    // ------------------------------------------------------------------ D · Thirty Seconds Every Morning
    { id: 'd-thirty-seconds', cls: 'D', rep: 30, from: 'root', title: 'Thirty Seconds Every Morning', requires: ['stp-states', 'stp-toolkit'], devices: ['SW1', 'SW2', 'SW3'],
      brief: 'DISPATCH » Clinic annex again. Reception says every workstation on SW2 waits half a minute after boot before it gets network. Old Root says it is a timer and he wants the toolkit used properly.\n\nIMANI (reception) » "Half a minute, every morning, with a patient standing in front of me. If it is the switch, please fix the switch."',
      topo: triangle({ SW1: '0001.9642.a3c0', SW2: '0c11.7a3b.9902', SW3: '00d0.f8e4.0a01' }), map: triMap(),
      steps: [
        { type: 'choice', skill: 'stp-states', text: 'Old Root, in the closet: "Thirty seconds on the host ports. Which two states is Imani waiting through?"', opts: ['Blocking, then Listening', 'Listening, then Learning, 15 seconds each', 'Learning, then Forwarding', 'Max Age, then Hello'], a: 1, hint: 'Forward Delay is 15 seconds, and it applies twice.', ok: '"Listening, then Learning. Fifteen and fifteen. For a workstation that cannot form a loop."' },
        { type: 'cmd', skill: 'stp-toolkit', text: '"Fix it on SW2. Ports 1 through 12 face desks. They should go straight to forwarding. Do them as a range or set the global default. Not the uplinks."', check: (d, ctx) => { const c = ctx.compute(1).switches.SW2; for (let i = 1; i <= 12; i++) if (!c.ports[fa(i)].portfast) return false; return true; },
          hint: 'SW2(config)# interface range f0/1 - 12\nSW2(config-if-range)# spanning-tree portfast\n   — or globally —\nSW2(config)# spanning-tree portfast default', ok: '"Edge ports. "show spanning-tree" marks them P2p Edge now."' },
        { type: 'cmd', skill: 'stp-toolkit', text: '"A fast door needs a guard. If any of those twelve ever hears a BPDU, it shuts itself."', check: (d, ctx) => { const c = ctx.compute(1).switches.SW2; for (let i = 1; i <= 12; i++) if (!c.ports[fa(i)].bpduguard) return false; return true; },
          hint: 'SW2(config-if-range)# spanning-tree bpduguard enable\n   — or globally —\nSW2(config)# spanning-tree portfast bpduguard default', ok: '"Now a switch under a desk gets err-disabled before it finishes saying hello."' },
        { type: 'choice', skill: 'stp-states', text: 'Imani, from the doorway: "The old tech said if a cable dies it can take almost a minute to come back. Is that true?"', opts: ['No, 2 seconds', 'No, 15 seconds', 'No, 30 seconds', 'Yes, up to 50 seconds on the classic tree'], a: 3, hint: 'Max Age + Listening + Learning.', ok: 'Old Root: "Twenty, fifteen, fifteen. Fifty. Which is why the rapid version exists, and why this building runs it."' },
        S.saveAll(['SW2'])
      ], outro: 'Imani reboots her workstation to check. The port goes green before she has finished sitting down. Old Root: "Fast where it is safe. Slow where it is not." Dispatch: "Rep credited."' },

    // ------------------------------------------------------------------ C · The Box Under the Desk
    { id: 'c-rogue-switch', cls: 'C', rep: 60, from: 'root', title: 'The Box Under the Desk', requires: ['stp-bpdu', 'stp-toolkit', 'stp-config'], devices: ['SW1', 'SW2', 'SW3'],
      brief: 'DISPATCH » Class C. Something at the clinic is claiming to be the root bridge with priority zero. Half the floor is routing through a box nobody owns. Old Root wants it found, cut, and the root chosen on purpose this time.\n\nVEE LAN » "The gateway has moved ports three times since Tuesday. Find whatever it is before I do."',
      topo: triangle({ SW1: '0001.9642.a3c0', SW2: '0c11.7a3b.9902', SW3: '00d0.f8e4.0a01' }, t => { t.switches.SW2.ports[fa(7)] = { to: 'ROGUE', peer: fa(1), access: true }; t.switches.ROGUE = { mac: '0000.0c9f.f001', rogue: true, fixed: { priority: 0, mode: 'pvst', ports: {} }, ports: { [fa(1)]: { to: 'SW2', peer: fa(7) } } }; }),
      map: (() => { const m = triMap(['ROGUE']); m.nodes.push({ id: 'ROGUE', label: '?? under desk 7', type: 'rogue', x: 160, y: 300 }); m.links.push({ a: 'SW2', b: 'ROGUE', ap: fa(7), bp: fa(1) }); return m; })(),
      steps: [
        { type: 'find', skill: 'stp-bpdu', text: 'Old Root: "Start on SW2. "show spanning-tree". Read the Root ID priority, then follow SW2\'s root port to whatever is on the other end. Click it."', target: 'ROGUE', hint: 'Root ID priority 1 (0 plus VLAN 1) and a MAC none of your switches own. SW2\'s root port is Fa0/7. Follow it.', ok: '"Priority zero. A small managed switch someone brought from home, or a laptop running a tool. The fix is the same."' },
        { type: 'cmd', skill: 'stp-toolkit', text: '"Shut that door, and make it shut itself next time. SW2 Fa0/7 goes err-disabled the moment it hears a BPDU."', check: (d, ctx) => ctx.compute(1).switches.SW2.ports[fa(7)].errdisabled,
          hint: 'SW2(config)# interface f0/7\nSW2(config-if)# spanning-tree portfast\nSW2(config-if)# spanning-tree bpduguard enable\n   — or globally —\nSW2(config)# spanning-tree portfast default\nSW2(config)# spanning-tree portfast bpduguard default', ok: '%SPANTREE-2-BLOCK_BPDUGUARD: Received BPDU on port Fa0/7. Disabling port.\nOld Root: "There. It is talking to a closed door."' },
        { type: 'cmd', skill: 'stp-config', text: '"Now choose. VLAN 1: SW1 primary root, SW2 secondary. The next box that shows up has to beat a real number."', check: (d, ctx) => { const c = ctx.compute(1); return c.switches.SW1.isRoot && c.switches.SW2.prio === 28673; },
          hint: 'SW1(config)# spanning-tree vlan 1 root primary\nSW2(config)# spanning-tree vlan 1 root secondary', ok: '"24576 and 28672. Lower than any default, and a backup if SW1 dies."' },
        { type: 'choice', skill: 'stp-bpdu', text: 'Mac, on the radio: "Those hellos were going to 01:00:0C:CC:CC:CD. What was that thing speaking?"', opts: ['Standard IEEE 802.1D', 'Cisco PVST+', 'LLDP', 'CDP'], a: 1, hint: 'IEEE uses 01:80:C2:00:00:00. The 01:00:0C prefix is Cisco.', ok: 'Old Root: "Cisco per-VLAN. So a real switch, not a toy. Somebody brought it from work."' },
        { type: 'cmd', skill: 'stp-toolkit', text: '"Facilities pulled the box. Bring Fa0/7 back. You know the two words."', need: [ { dev: 'SW2', ctx: 'interface ' + fa(7), line: 'shutdown' }, { dev: 'SW2', ctx: 'interface ' + fa(7), line: 'no shutdown' } ], onPass: (ctx) => { ctx.topo.switches.ROGUE.removed = true; },
          hint: 'SW2(config)# interface f0/7\nSW2(config-if)# shutdown\nSW2(config-if)# no shutdown', ok: '"Up, guarded, and honest. Desk 7 has its network back."' }
      ], outro: 'The temp gets a second monitor cable from the closet and a short talk from Vee Lan. Old Root: "You did not just fix it. You made it unable to happen twice." Dispatch: "Rep credited. Class C gigs are open to you now."' },

    // ------------------------------------------------------------------ C · The Long Way Round
    { id: 'c-cost-of-path', cls: 'C', rep: 60, from: 'root', title: 'The Long Way Round', requires: ['stp-election', 'stp-config'], devices: ['SW1', 'SW2', 'SW3'],
      brief: 'DISPATCH » Class C. A corpo office in Westbrook paid for a direct fibre from SW1 to SW3 and is angry that traffic still goes through SW2. Old Root says the tree is doing exactly what the numbers say. Do the numbers, then change them.\n\nCLIENT (office manager) » "We paid for the direct line. Why is it dark?"',
      topo: { defaultMode: 'rapid-pvst', switches: {
        SW1: { mac: '0001.9642.a3c0', ports: Object.assign({ [gi(1)]: { to: 'SW2', peer: gi(1) }, [fa(24)]: { to: 'SW3', peer: fa(24) } }, hosts('SW1', 1, 8, 'PC1-')) },
        SW2: { mac: '000a.b7c1.2202', ports: Object.assign({ [gi(1)]: { to: 'SW1', peer: gi(1) }, [gi(2)]: { to: 'SW3', peer: gi(1) } }, hosts('SW2', 1, 8, 'PC2-')) },
        SW3: { mac: '00d0.f8e4.0a01', ports: Object.assign({ [gi(1)]: { to: 'SW2', peer: gi(2) }, [fa(24)]: { to: 'SW1', peer: fa(24) } }, hosts('SW3', 1, 8, 'PC3-')) } } },
      map: { w: 520, h: 300, nodes: [ { id: 'SW1', label: 'SW1 (root)', type: 'switch', x: 90, y: 80 }, { id: 'SW2', label: 'SW2', type: 'switch', x: 260, y: 220 }, { id: 'SW3', label: 'SW3', type: 'switch', x: 430, y: 80 }, { id: 'PC3', label: 'servers', type: 'server', x: 480, y: 250, small: true } ],
        links: [ { a: 'SW1', b: 'SW2', ap: gi(1), bp: gi(1), tag: 'Gig' }, { a: 'SW2', b: 'SW3', ap: gi(2), bp: gi(1), tag: 'Gig' }, { a: 'SW1', b: 'SW3', ap: fa(24), bp: fa(24), tag: 'FastE (the direct line)' }, { a: 'SW3', b: 'PC3' } ] },
      steps: [
        { type: 'calc', skill: 'stp-election', text: 'Old Root: "Numbers first. From SW3, what does each path to the root cost, and which port did it pick?"', fields: [
            { key: 'direct', label: 'Root cost via Fa0/24 (the direct line to SW1)', check: v => v.trim() === '19' },
            { key: 'via', label: 'Root cost via Gi0/1 (through SW2)', check: v => v.trim() === '8' },
            { key: 'rp', label: 'SW3 root port (Gi0/1 or Fa0/24)', check: v => /^(gi|gigabitethernet)\s*0\/1$/i.test(v.trim()) } ],
          hint: 'FastEthernet costs 19. Gigabit costs 4. Two gigabit hops are 4 + 4 = 8. Lower wins.', ok: '"Nineteen against eight. The direct line lost to two copper hops, fair and square. The client bought the wrong speed. Now we work around it."' },
        { type: 'cmd', skill: 'stp-config', text: '"The client wants the direct line active. Do not touch priorities. Make Fa0/24 SW3\'s root port by changing cost."', check: (d, ctx) => ctx.compute(1).switches.SW3.rootPort === fa(24),
          hint: 'SW3(config)# interface f0/24\nSW3(config-if)# spanning-tree vlan 1 cost 4      (anything below 8 works)\n   — or raise the other side —\nSW3(config)# interface g0/1\nSW3(config-if)# spanning-tree vlan 1 cost 100', ok: '"Fa0/24 is Root, forwarding. You changed the number and the tree followed."' },
        { type: 'choice', skill: 'stp-election', text: 'The office manager, looking at the map: "So which link is dark now?"', opts: ['Gi0/1, toward SW2', 'Fa0/24, toward SW1', 'Fa0/1, a desk port', 'None. SW3 is the root now'], a: 0, hint: 'Only one port can face the root. The other switch-facing port has to sleep.', ok: 'Old Root: "Gi0/1 sleeps. The ring is broken in exactly one place, and it is the place the client asked for."' },
        { type: 'choice', skill: 'stp-states', text: '"While we are here. Which timer sets how long Listening and Learning last?"', opts: ['Hello, 2 s', 'Forward Delay, 15 s', 'Max Age, 20 s', 'Aging, 300 s'], a: 1, hint: 'Fifteen seconds, applied twice.', ok: '"Forward Delay. Set by the root bridge for the whole tree."' },
        { type: 'cmd', skill: 'stp-election', text: '"Look at it from SW3 once more. Then we are done."', need: [ { dev: 'SW3', line: /^(do )?show spanning-tree/ } ], hint: 'SW3# show spanning-tree', ok: '"Root port Fa0/24, cost 4. Your number, not the default."' }
      ], outro: 'The office manager watches the direct line light up and stops talking about the invoice. Old Root: "You changed the tree by changing what it measures. That is the only clean way." Dispatch: "Rep credited."' },

    // ------------------------------------------------------------------ B · Two Trees, Two Uplinks
    { id: 'b-per-vlan-split', cls: 'B', rep: 100, from: 'root', title: 'Two Trees, Two Uplinks', requires: ['vlan-intro', 'stp-config', 'stp-bpdu'], devices: ['SW1', 'SW2', 'SW3'],
      brief: 'DISPATCH » Class B. Vee Lan and Old Root are on the same building in Charter Hill: two departments, two VLANs, two uplinks, and one uplink sits idle all day because one root rules everything. Split the trees. Both links should earn their keep.\n\nVEE LAN » "Streets 10 and 20. Make them exist before he starts."\nOLD ROOT » "One root per street. Each the other\'s backup."',
      topo: triangle({ SW1: '0001.9642.a3c0', SW2: '0c11.7a3b.9902', SW3: '00d0.f8e4.0a01' }, t => { t.defaultMode = 'pvst'; }), map: triMap(),
      steps: [
        S.vlans(['SW1', 'SW2', 'SW3'], [10, 20]),
        S.modeRapid(['SW1', 'SW2', 'SW3']),
        { type: 'cmd', skill: 'stp-config', text: 'Old Root: "VLAN 10 roots at SW1 with SW2 as secondary. VLAN 20 roots at SW2 with SW1 as secondary. Four commands, and every one of them says which VLAN."',
          check: (d, ctx) => { const a = ctx.compute(10), b = ctx.compute(20); return a.switches.SW1.isRoot && a.switches.SW2.prio === 28672 + 10 && b.switches.SW2.isRoot && b.switches.SW1.prio === 28672 + 20; },
          hint: 'SW1(config)# spanning-tree vlan 10 root primary\nSW1(config)# spanning-tree vlan 20 root secondary\nSW2(config)# spanning-tree vlan 20 root primary\nSW2(config)# spanning-tree vlan 10 root secondary', ok: '"Two trees, two roots, two sleeping ports in different places. Both uplinks carry traffic now."' },
        { type: 'cmd', skill: 'stp-election', text: '"Prove it from SW3. VLAN 20 specifically."', need: [ { dev: 'SW3', line: /^(do )?show spanning-tree vlan 20$/ } ], hint: 'SW3# show spanning-tree vlan 20', ok: '"Root ID is SW2 for VLAN 20. Run it for VLAN 10 and watch it change."' },
        { type: 'choice', skill: 'stp-election', text: 'Vee Lan: "On SW3, VLAN 20, which port faces the root?"', opts: ['Gi0/1, toward SW1', 'Gi0/2, toward SW2, cost 4', 'Fa0/1', 'None. SW3 is root for VLAN 20'], a: 1, hint: 'VLAN 20\'s root is SW2. Which SW3 port connects straight to SW2?', ok: 'Old Root: "Gi0/2. And for VLAN 10 it is Gi0/1. Same cables, different trees."' },
        { type: 'choice', skill: 'stp-config', text: 'Vee Lan again: "You typed nothing about VLAN 1. What happened to its tree?"', opts: ['It also moved to SW1', 'Nothing. With PVST+ every VLAN has its own tree', 'It collapsed until reboot', 'It merged into VLAN 10'], a: 1, hint: 'Every command you typed said vlan 10 or vlan 20.', ok: 'Old Root: "Nothing. Whatever accident ruled VLAN 1 still rules it. Fix that on your own time."' },
        S.saveAll(['SW1', 'SW2', 'SW3'])
      ], outro: 'Vee Lan and Old Root look at the same screen and, for once, neither says anything. Dispatch: "That is Class B work. Rep credited."' },

    // ------------------------------------------------------------------ A · The Night Before Opening
    { id: 'a-last-storm', cls: 'A', rep: 200, from: 'root', title: 'The Night Before Opening', requires: ['stp-why', 'stp-election', 'stp-states', 'stp-bpdu', 'stp-toolkit', 'stp-config'], devices: ['SW1', 'SW2', 'SW3', 'SW4'],
      brief: 'DISPATCH » Class A. New corpo floor in City Center opens at 06:00. Four switches, classic PVST+, no VLANs, no guards, and something is already claiming root on SW4 with priority zero. Old Root came out of retirement for one night to sit beside you. He will not touch the keyboard.\n\nOLD ROOT » "Everything you have learned. One building. Do not rush the forwarding state."',
      topo: { defaultMode: 'pvst', switches: {
        SW1: { mac: '0001.9642.a3c0', ports: Object.assign({ [gi(1)]: { to: 'SW2', peer: gi(1) }, [gi(2)]: { to: 'SW3', peer: gi(1) } }, hosts('SW1', 1, 8, 'PC1-')) },
        SW2: { mac: '0c11.7a3b.9902', ports: Object.assign({ [gi(1)]: { to: 'SW1', peer: gi(1) }, [gi(2)]: { to: 'SW4', peer: gi(1) }, [fa(24)]: { to: 'SW3', peer: fa(24) } }, hosts('SW2', 1, 8, 'PC2-')) },
        SW3: { mac: '00d0.f8e4.0a01', ports: Object.assign({ [gi(1)]: { to: 'SW1', peer: gi(2) }, [gi(2)]: { to: 'SW4', peer: gi(2) }, [fa(24)]: { to: 'SW2', peer: fa(24) } }, hosts('SW3', 1, 8, 'PC3-')) },
        SW4: { mac: '0000.5e00.5301', ports: Object.assign({ [gi(1)]: { to: 'SW2', peer: gi(2) }, [gi(2)]: { to: 'SW3', peer: gi(2) }, [fa(3)]: { to: 'ROGUE', peer: fa(1), access: true } }, hosts('SW4', 1, 2, 'PC4-'), hosts('SW4', 4, 8, 'PC4-')) },
        ROGUE: { mac: '0000.0c9f.f002', rogue: true, fixed: { priority: 0, mode: 'pvst', ports: {} }, ports: { [fa(1)]: { to: 'SW4', peer: fa(3) } } } } },
      map: { w: 520, h: 360, nodes: [ { id: 'SW1', label: 'SW1', type: 'switch', x: 120, y: 60 }, { id: 'SW2', label: 'SW2', type: 'switch', x: 400, y: 60 }, { id: 'SW3', label: 'SW3', type: 'switch', x: 120, y: 230 }, { id: 'SW4', label: 'SW4', type: 'switch', x: 400, y: 230 }, { id: 'ROGUE', label: '?? desk 3', type: 'rogue', x: 470, y: 315 }, { id: 'PC1', label: 'PCs', type: 'pc', x: 40, y: 30, small: true }, { id: 'PC3', label: 'PCs', type: 'pc', x: 40, y: 290, small: true } ],
        links: [ { a: 'SW1', b: 'SW2', ap: gi(1), bp: gi(1) }, { a: 'SW1', b: 'SW3', ap: gi(2), bp: gi(1) }, { a: 'SW2', b: 'SW4', ap: gi(2), bp: gi(1) }, { a: 'SW3', b: 'SW4', ap: gi(2), bp: gi(2) }, { a: 'SW2', b: 'SW3', ap: fa(24), bp: fa(24), tag: 'FastE' }, { a: 'SW4', b: 'ROGUE', ap: fa(3), bp: fa(1) }, { a: 'SW1', b: 'PC1' }, { a: 'SW3', b: 'PC3' } ], alert: ['ROGUE'] },
      steps: [
        { type: 'find', skill: 'stp-bpdu', text: 'Old Root: "Start where the lie is. Read the tree on SW4, follow its root port, click whatever is claiming root."', target: 'ROGUE', hint: 'SW4# show spanning-tree — Root ID priority 1, root port Fa0/3.', ok: '"Priority zero at desk 3. Of course."' },
        S.modeRapid(['SW1', 'SW2', 'SW3', 'SW4']),
        { type: 'cmd', skill: 'stp-toolkit', text: '"Guard the whole floor at once. On all four: every access port PortFast, every PortFast port guarded. Globally. SW4 Fa0/3 should go err-disabled the moment you finish."',
          check: (d, ctx) => { const c = ctx.compute(1); return ['SW1', 'SW2', 'SW3', 'SW4'].every(n => c.switches[n].cfg.portfastDefault && c.switches[n].cfg.bpduguardDefault) && c.switches.SW4.ports[fa(3)].errdisabled; },
          hint: 'SWx(config)# spanning-tree portfast default\nSWx(config)# spanning-tree portfast bpduguard default\n(on SW1, SW2, SW3 and SW4)', ok: '%SPANTREE-2-BLOCK_BPDUGUARD on SW4 Fa0/3.\nOld Root: "It is talking to a closed door."' },
        S.vlans(['SW1', 'SW2', 'SW3', 'SW4'], [10, 20]),
        { type: 'cmd', skill: 'stp-config', text: '"Shape both trees. VLAN 10: SW1 primary, SW2 secondary. VLAN 20: SW2 primary, SW1 secondary."',
          check: (d, ctx) => { const a = ctx.compute(10), b = ctx.compute(20); return a.switches.SW1.isRoot && a.switches.SW2.prio === 28682 && b.switches.SW2.isRoot && b.switches.SW1.prio === 28692; },
          hint: 'SW1(config)# spanning-tree vlan 10 root primary\nSW1(config)# spanning-tree vlan 20 root secondary\nSW2(config)# spanning-tree vlan 20 root primary\nSW2(config)# spanning-tree vlan 10 root secondary', ok: '"Two roots, chosen. Two backups, chosen."' },
        { type: 'calc', skill: 'stp-election', text: '"VLAN 10, root is SW1. SW4 can get there through SW2 or through SW3. Do the numbers and tell me what it picked and why."', fields: [
            { key: 'cost', label: 'SW4 root cost for VLAN 10 (either path)', check: v => v.trim() === '8' },
            { key: 'rp', label: 'SW4 root port for VLAN 10 (Gi0/1 or Gi0/2)', check: v => /^(gi|gigabitethernet)\s*0\/1$/i.test(v.trim()) },
            { key: 'why', label: 'The tiebreaker that decided it (cost / neighbour BID / port ID)', check: v => /bid|bridge/i.test(v) } ],
          hint: 'Both paths cost 4 + 4 = 8. Tie → lower neighbour Bridge ID. SW2 is secondary root (28672+10); SW3 is default (32768+10). SW2 wins, so Gi0/1.', ok: '"Eight against eight, settled by the neighbour\'s Bridge ID. SW2 is the secondary, so SW2 is lower, so Gi0/1."' },
        { type: 'cmd', skill: 'stp-config', text: '"I want SW4 to prefer SW3 for VLAN 10 anyway. SW2 carries VLAN 20. No priorities. Cost only."', check: (d, ctx) => ctx.compute(10).switches.SW4.rootPort === gi(2),
          hint: 'SW4(config)# interface g0/2\nSW4(config-if)# spanning-tree vlan 10 cost 3      (anything that makes the SW3 path cost less than 8)', ok: '"Seven beats eight. VLAN 10 leans left, VLAN 20 leans right. Both uplinks work."' },
        { type: 'cmd', skill: 'stp-toolkit', text: '"Facilities pulled the desk-3 box. Recover SW4 Fa0/3."', need: [ { dev: 'SW4', ctx: 'interface ' + fa(3), line: 'shutdown' }, { dev: 'SW4', ctx: 'interface ' + fa(3), line: 'no shutdown' } ], onPass: (ctx) => { ctx.topo.switches.ROGUE.removed = true; }, hint: 'SW4(config)# interface f0/3\nSW4(config-if)# shutdown\nSW4(config-if)# no shutdown', ok: '"Back up. Still guarded."' },
        { type: 'choice', skill: 'stp-bpdu', text: '"Two questions while the config settles. A standard IEEE 802.1D hello goes to which address?"', opts: ['01:00:0C:CC:CC:CD', '01:80:C2:00:00:00', 'FF:FF:FF:FF:FF:FF', '01:00:5E:00:00:01'], a: 1, hint: 'The Cisco one starts with 01:00:0C. The IEEE one starts with 01:80:C2.', ok: '"01:80:C2:00:00:00. Reserved. A bridge never forwards it."' },
        { type: 'choice', skill: 'stp-states', text: '"And the default Max Age?"', opts: ['2 seconds', '15 seconds', '20 seconds', '50 seconds'], a: 2, hint: 'Ten hellos.', ok: '"Twenty seconds of silence before a switch stops believing its root."' },
        S.saveAll(['SW1', 'SW2', 'SW3', 'SW4'])
      ], outro: 'At 05:40 the cleaners arrive and the floor is quiet. Old Root stands up slowly. "It will hold. It will hold through the next person with a bodega switch, and the one after." Dispatch: "Class A confirmed. There is nothing above it in this arc. The next arc is not mapped yet."' }
  ];

  window.CLASSES = [ { id: 'D', min: 0, name: 'Class D · Street' }, { id: 'C', min: 90, name: 'Class C · Runner' }, { id: 'B', min: 250, name: 'Class B · Operator' }, { id: 'A', min: 400, name: 'Class A · Architect' } ];
})();
