/* tests/game.test.js — game rules that content must not be able to break. Run by tools/check.js (Game, JOBS loaded). */
module.exports.run = function({ out }){
  let pass = 0, fails = 0; const ok = (c, m) => { if (c) pass++; else { fails++; out('FAIL   ' + m); } };
  const first = JOBS.find(j => j.solution && !j.rite);
  const rite = JOBS.find(j => j.solution && j.rite);

  // the fixer: the run pays nothing, greenlights nothing, and the notes are paid for
  {
    const r = Game.runSolution(first.id, { hireFixer: true });
    ok(r.ok, 'fixer: the gig still finishes (' + r.error + ')');
    ok(r.fixer && r.fixer.ok, 'fixer: hire goes through (' + JSON.stringify(r.fixer) + ')');
    ok(r.probe && r.probe.result && r.probe.result.outsourced, 'fixer: the result says outsourced');
    ok(r.probe && r.probe.result.rep === 0 && r.probe.result.creds === 0, 'fixer: no rep and no creds');
    ok(r.probe && !r.probe.done, 'fixer: the gig is not greenlit');
    ok(r.probe && r.probe.codex === 'paid', 'fixer: the codex entry is paid (' + (r.probe && r.probe.codex) + ')');
    ok(r.probe && r.probe.creds === 0, 'fixer: the fee took the creds (' + (r.probe && r.probe.creds) + ')');
  }
  // a clean clear greenlights
  {
    const r = Game.runSolution(first.id);
    ok(r.ok && r.probe.done && r.probe.codex === 'greenlit', 'codex: a clean clear greenlights (' + (r.probe && r.probe.codex) + ')');
    ok(r.probe.result.rep > 0 && r.probe.result.creds > 0, 'codex: a clean clear pays');
  }
  // rites cannot be outsourced
  if (rite) {
    const r = Game.runSolution(rite.id, { hireFixer: true });
    ok(r.fixer && !r.fixer.ok, 'fixer: a rite refuses the fixer');
    ok(r.probe && r.probe.codex === 'greenlit', 'fixer: the rite is cleared the honest way');
  }
  // once the notes are owned, no fixer is offered again: a repeat run is the player's own
  {
    const snap = JSON.stringify(Game.state); Game.state.codex = { [first.id]: 'paid' };
    Game.startJob(first.id, { silent: true }); const c = Game.fixer.can(); Game.abort();
    ok(!c.ok && c.have, 'fixer: not offered when the notes are already paid (' + JSON.stringify(c) + ')');
    Object.assign(Game.state, JSON.parse(snap));
  }
  // a gig sharpens each quickhack by one step at most, however many floors use it
  {
    const snap = JSON.stringify(Game.state); const one = JOBS.find(j => j.solution && new Set(j.steps.map(x => x.skill)).size === 1 && j.steps.length > 2);
    if (one) { const k = one.steps[0].skill; const before = (Game.state.skills[k] || {}).clean || 0; const r = Game.runSolution(one.id, { keepState: true });
      ok(r.ok && ((Game.state.skills[k] || {}).clean || 0) === before + 1, 'sharpening: one gig adds one clean use to ' + k + ' (' + ((Game.state.skills[k] || {}).clean) + ')'); }
    Object.keys(Game.state).forEach(key => delete Game.state[key]); Object.assign(Game.state, JSON.parse(snap));
  }
  // a router or switch without a console still gets its starting config (night 2's dock switch starts with its port shut)
  if (JOBS.find(j => j.id === 'd-n02-dock-link')) {
    Game.startJob('d-n02-dock-link', { silent: true }); const p = Game.run.ctx.net().ping('PC1', '192.168.1.60'); Game.abort();
    ok(!p.ok, 'setup: a device with no console still gets its preconfig (' + p.reason + ')');
  }
  // nothing leaked out of the probe runs
  ok(!Game.state.codex || !Game.state.codex[first.id], 'runs do not leak into the saved state');
  // difficulty: pay by class follows it (rites keep their own), a wrong commit burns its wear; picked once, then only lowered
  {
    const keep = JSON.parse(JSON.stringify({ difficulty: Game.state.difficulty, diffPicked: Game.state.diffPicked, jobsDone: Game.state.jobsDone, body: Game.state.body, handle: Game.state.handle }));
    const gB = JOBS.find(j => j.cls === 'B' && !j.rite && j.creds == null), riteB = JOBS.find(j => j.rite && j.cls === 'B');
    Game.state.handle = Game.state.handle || 'difftest'; Game.state.jobsDone = {};
    for (const k of DIFFICULTY_ORDER) { Game.state.diffPicked = false; ok(Game.setDifficulty(k).ok && Game.pay(gB) === DIFFICULTY[k].pay[2], 'setting: ' + k + ' pays ' + DIFFICULTY[k].pay[2] + ' for a Class B gig (' + Game.pay(gB) + ')');
      ok(Game.pay(riteB) === riteB.creds, 'setting: ' + k + ' leaves the rite at ' + riteB.creds); }
    Game.state.diffPicked = false; Game.setDifficulty('cyberpsycho'); Game.state.body.chrome = 100; const g = JOBS.find(j => j.solution && j.steps.some(s => s.type === 'choice') && j.cls === 'D');
    Game.startJob(g.id, { silent: true }); while (Game.currentStep() && Game.currentStep().type !== 'choice') { Game.run.step++; } const st = Game.currentStep(); Game.run.choice = (st.a + 1) % st.opts.length; Game.commit();
    ok(Game.state.body.chrome === 100 - DIFFICULTY.cyberpsycho.wear, 'setting: a wrong commit on cyberpsycho burns ' + DIFFICULTY.cyberpsycho.wear + ' chrome (' + Game.state.body.chrome + ')'); Game.abort();
    ok(Game.state.diffPicked && Game.setDifficulty('normal').ok && Game.state.difficulty === 'normal', 'difficulty: lowered after the pick');
    ok(!Game.setDifficulty('cyberpsycho').ok && Game.state.difficulty === 'normal', 'difficulty: never raised again, even before the first gig');
    ok(!Game.setDifficulty('normal').ok, 'difficulty: the same one is not a change');
    ok(Game.setDifficulty('easy').ok && Game.state.difficulty === 'easy', 'difficulty: lowered again');
    ok(Game.licenseRecord().difficulty === 'easy', 'setting: the license record carries it');
    // the license colours: the default deck and every skin switched on during the run; anything else falls back
    const pk = JSON.parse(JSON.stringify(Game.state.perks)); Game.state.perks = { theme: null, skins: ['skin-noir'], used: [] };
    ok(Game.cardThemes().join() === 'default', 'card: only the default deck before any skin is used');
    Game.shop.setTheme('noir'); Game.shop.setTheme(null);
    ok(Game.cardThemes().join() === 'default,noir' && Game.licenseRecord('noir').theme === 'noir', 'card: a skin used once can print the card (' + Game.cardThemes() + ')');
    ok(Game.licenseRecord('ember').theme === 'default', 'card: a skin never used cannot (' + Game.licenseRecord('ember').theme + ')');
    Game.state.perks = pk;
    Object.assign(Game.state, keep);
  }
  // the stall: prices scale by half the base price per class; Marrow's patch adds 35 chrome, the tune-up fills it
  {
    const keep = JSON.parse(JSON.stringify({ rep: Game.state.rep, creds: Game.state.creds, body: Game.state.body, handle: Game.state.handle, jobsDone: Game.state.jobsDone }));
    const patch = SHOP.find(i => i.id === 'patch'), tune = SHOP.find(i => i.id === 'tuneup');
    Game.state.handle = Game.state.handle || 'shoptest'; Game.state.rep = 0; Game.state.jobsDone = {};
    ok(Game.shop.price(patch) === patch.price, 'stall: class D pays the base price (' + Game.shop.price(patch) + ')');
    Game.state.creds = 1000; Game.state.body.chrome = 40; let r = Game.shop.buy('patch');
    ok(r.ok && Game.state.body.chrome === 75 && Game.state.creds === 1000 - patch.price, 'stall: the patch adds 35 chrome (' + Game.state.body.chrome + ')');
    Game.state.body.chrome = 90; Game.shop.buy('patch'); ok(Game.state.body.chrome === 100, 'stall: the patch stops at 100 (' + Game.state.body.chrome + ')');
    r = Game.shop.buy('patch'); ok(!r.ok, 'stall: nothing to patch at 100');
    Game.state.body.chrome = 10; Game.shop.buy('tuneup'); ok(Game.state.body.chrome === 100, 'stall: the tune-up fills chrome to 100');
    const riteD = JOBS.find(j => j.rite && j.cls === 'D'); if (riteD) { Game.state.rep = CLASSES[1].min; Game.state.jobsDone = { [riteD.id]: 1 };
      ok(Game.shop.price(tune) === Math.round(tune.price * 1.5), 'stall: class C pays one and a half times (' + Game.shop.price(tune) + ')'); }
    // Dispatch's favor: buying it puts one on the books, and a runner can hold only one
    Game.state.rep = 0; Game.state.jobsDone = {}; Game.state.creds = 1000; Game.state.inventory = Game.state.inventory || {}; delete Game.state.inventory.favor;
    r = Game.shop.buy('favor'); ok(r.ok && Game.state.inventory.favor === 1, 'favor: bought and held (' + Game.state.inventory.favor + ')');
    r = Game.shop.buy('favor'); ok(!r.ok && Game.state.inventory.favor === 1 && Game.state.creds === 1000 - SHOP.find(i => i.id === 'favor').price, 'favor: a second one is refused and costs nothing');
    delete Game.state.inventory.favor;
    // Marrow's tab: broke and low, the patch goes on credit; the next pay settles it and the tab opens again
    Game.state.rep = 0; Game.state.jobsDone = {}; Game.state.creds = 0; Game.state.body.chrome = 20; Game.state.body.tab = 0; Game.state.body.owed = 0;
    r = Game.shop.buy('patch'); ok(r.ok && r.onTheHouse && Game.state.body.chrome === 55 && Game.state.body.owed === patch.price, 'tab: a broke runner at 20 chrome gets the patch on the tab (' + JSON.stringify(r) + ')');
    Game.state.body.chrome = 80; r = Game.shop.buy('patch'); ok(!r.ok, 'tab: no credit at 70 chrome or more');
    Game.state.body.food = 10; r = Game.shop.buy('protein'); ok(r.ok && r.onTheHouse && Game.state.body.tab === 2, 'tab: food goes on it too (' + Game.state.body.tab + ')');
    Game.state.body.chrome = 20; r = Game.shop.buy('patch'); ok(!r.ok, 'tab: class D holds two items at once');
    Game.state.body.food = 100; Game.state.body.chrome = 100; const owed = Game.state.body.owed; const g = JOBS.find(j => j.solution && !j.rite && j.cls === 'D');
    Game.startJob(g.id); const res = Game.finishJob().result; const cut = Math.min(owed, res.creds); ok(res.settled === cut && Game.state.body.owed === owed - cut && Game.state.body.tab === (owed > cut ? 2 : 0) && Game.state.creds === res.creds - cut, 'tab: the next pay settles it (' + JSON.stringify({ settled: res.settled, owed: Game.state.body.owed, creds: Game.state.creds }) + ')');
    Object.assign(Game.state, keep);
  }
  // a dive in progress survives a reload: the floor, the misses and every command typed come back
  {
    const keep = JSON.parse(JSON.stringify({ first: Game.state.first, body: Game.state.body, handle: Game.state.handle, dive: Game.state.dive || null, read: Game.state.read }));
    Game.state.handle = Game.state.handle || 'divetest'; Game.state.first = null; Game.state.body.food = 100; Game.state.body.chrome = 100;
    Game.startJob('d-n04-seven-bowls'); const dev = Game.run.active; Game.run.form = {}; Game.commit();
    ['enable', 'configure terminal', 'hostname BOWLS'].forEach(c => Game.exec(c));
    const saved = JSON.parse(JSON.stringify(Game.state.dive)); ok(saved && saved.cmds.length === 3 && saved.fails[0] === 1, 'dive: the record keeps the floor, misses and commands (' + (saved && saved.cmds.length) + ' commands)');
    Game.abort(); ok(!Game.state.dive, 'dive: JACK OUT ends it'); Game.state.dive = saved;
    const r = Game.resume(); ok(r && r.step === 0 && r.fails[0] === 1 && r.cmds.length === 3 && r.devices[dev].prompt().startsWith('BOWLS'), 'dive: resume brings back the floor, the misses and the config (' + (r && r.devices[dev].prompt()) + ')');
    Game.abort(); Object.assign(Game.state, keep); if (!keep.dive) delete Game.state.dive;
  }
  // a floor that changes the network (onPass) is replayed on resume, so the next floor can still be cleared
  {
    const keep = JSON.parse(JSON.stringify({ first: Game.state.first, body: Game.state.body, handle: Game.state.handle, dive: Game.state.dive || null }));
    Game.state.handle = Game.state.handle || 'divetest'; Game.state.first = null; Game.state.body.food = 100; Game.state.body.chrome = 100;
    const g = JOBS.find(j => j.solution && j.steps.some((st, i) => st.onPass && i < j.steps.length - 1)); const k = g.steps.findIndex(st => st.onPass);
    Game.startJob(g.id);
    // play the golden solution up to and including the onPass floor, through the public calls, then reload
    const acts = g.solution.slice(); let passed = 0; while (acts.length && passed <= k) { const a = acts.shift(); const r = Game.run;
      if (a === 'commit') { const out = Game.commit(); if (out && out.ok) passed++; continue; }
      if (a.select) r.selected = a.select; if (a.choose != null) r.choice = a.choose; if (a.multi) r.multi = new Set(a.multi); if (a.order) r.order = a.order.slice(); if (a.form) r.form = Object.assign({}, a.form); if (a.calc) r.calc = Object.assign({}, a.calc); if (a.text != null) r.text = a.text;
      if (a.dev) { r.active = a.dev; (a.type || []).forEach(c => Game.exec(c)); } }
    const saved = JSON.parse(JSON.stringify(Game.state.dive)); const before = JSON.stringify(Object.keys(Game.run.devices).map(n => Game.run.devices[n].lines.length));
    Game.abort(); Game.state.dive = saved; const r2 = Game.resume(); const after = JSON.stringify(Object.keys(r2.devices).map(n => r2.devices[n].lines.length));
    ok(r2.step === k + 1 && before === after, 'dive: a floor\'s own network change comes back on resume (' + g.id + ', floor ' + (k + 1) + ': ' + before + ' vs ' + after + ')');
    Game.abort(); Object.assign(Game.state, keep); if (!keep.dive) delete Game.state.dive;
  }
  // the first night: steps only move forward, the first dive costs no chrome, no crew call rings before the crew step
  {
    const keep = JSON.parse(JSON.stringify({ first: Game.state.first, body: Game.state.body, handle: Game.state.handle, dm: Game.state.dm, rep: Game.state.rep, read: Game.state.read, roster: Game.state.roster, cards: Game.state.cards, dmLog: Game.state.dmLog, lastDmAt: Game.state.lastDmAt }));
    Game.state.handle = Game.state.handle || 'firsttest'; Game.state.first = 'map';
    ok(!Game.first.go('welcome') && Game.first.at === 'map', 'first night: a step never goes back through go()');
    ok(Game.first.go('talk') && Game.first.at === 'talk', 'first night: map moves on to talk');
    Game.state.first = 'dive'; Game.state.body.chrome = 100; const g = JOBS.find(j => j.solution && !j.rite && j.cls === 'D' && j.steps[0].type === 'choice') || JOBS.find(j => j.solution && !j.rite && j.cls === 'D');
    Game.startJob(g.id); const c0 = Game.state.body.chrome; Game.run.choice = -1; Game.run.text = '#nothing#'; let r = Game.commit();
    ok(!r.ok && Game.state.body.chrome === c0, 'first night: a wrong answer on the first dive costs no chrome (' + c0 + ' → ' + Game.state.body.chrome + ')');
    Game.state.first = null; r = Game.commit(); ok(!r.ok && Game.state.body.chrome < c0, 'first night: after it, a wrong answer costs chrome (' + Game.state.body.chrome + ')'); Game.abort();
    Game.state.first = 'board'; Game.state.dm = null; ok(Game.dm.maybeCreate(true) === null, 'first night: no crew call before the crew step, even forced');
    Game.state.first = 'crew'; Game.state.dm = null; Game.state.read['n01-back-room'] = Game.state.read['n01-back-room'] || Date.now(); if (!Protege.active(Game.state.roster).length) Protege.recruit(Game.state.roster, 'test');
    const d = Game.dm.maybeCreate(true); if (d) { Game.dm.open(); const p = Game.state.roster.list.find(x => x.id === d.protege), dz = p.danger, rep0 = Game.state.rep; const wrong = d.type === 'choice' ? (d.a + 1) % d.opts.length : 0;
      const res = Game.dm.answer(wrong); ok(!res.ok && Game.state.rep === rep0 && p.danger === dz, 'first night: a missed first call costs no rep and no danger (' + rep0 + ' → ' + Game.state.rep + ', danger ' + dz + ' → ' + p.danger + ')'); }
    else ok(false, 'first night: the crew step can force a call');
    Game.state.first = 'archive'; ok(Game.first.end('done') && Game.first.at === null, 'first night: end() clears it');
    ok(!Game.first.go('map'), 'first night: nothing moves once it is over');
    Object.assign(Game.state, keep);
  }
  return { pass, fails };
};
