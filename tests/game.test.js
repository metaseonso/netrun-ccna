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
  // nothing leaked out of the probe runs
  ok(!Game.state.codex || !Game.state.codex[first.id], 'runs do not leak into the saved state');
  return { pass, fails };
};
