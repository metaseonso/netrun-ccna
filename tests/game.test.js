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
    Object.assign(Game.state, keep);
  }
  return { pass, fails };
};
