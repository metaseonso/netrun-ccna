#!/usr/bin/env node
/* tools/play.js — play one night (or several) headless, the way a player would, with the real Game API.
   For each night: talk to every level for that night (first talk syncs, skills slot, the night's calls unlock),
   check every gig for that night unlocks after the talks, jack in (hunger and chrome drop), play the golden
   solution, and report pay, rep, the quickhack and the CODEX. Then play the same gig with a fixer and check it
   pays nothing and the notes read PAID (rites must refuse). Exit 1 on any problem.
   Usage: node tools/play.js 3            one night
          node tools/play.js 3-7          a range, played in order on one handle
          node tools/play.js all          every night that has content, in order */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..'); process.chdir(ROOT);
global.window = global; global.location = { search: '', origin: 'http://localhost', pathname: '/' };
const mem = {}; global.localStorage = { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: k => { delete mem[k]; }, key: i => Object.keys(mem)[i] || null, get length(){ return Object.keys(mem).length; } };
global.document = { addEventListener(){}, body: { contains(){ return false; } }, querySelector(){ return null; }, querySelectorAll(){ return []; } }; global.setInterval = () => 0; global.addEventListener = () => {}; global.confirm = () => true;
const html = fs.readFileSync('index.html', 'utf8'); const tags = [...html.matchAll(/<script (type="text\/lazy" )?src="([^"?]+)(?:\?[^"]*)?"><\/script>/g)]; const scripts = tags.filter(m => !m[1]).concat(tags.filter(m => m[1])).map(m => m[2]) /* the game first, then the campaign, as the browser does */.filter(s => !/^https?:/.test(s) && s !== 'js/ui.js');
for (const s of scripts) vm.runInThisContext(fs.readFileSync(s, 'utf8'), { filename: s });

const arg = process.argv[2] || 'all'; let nights;
if (arg === 'all') nights = SYLLABUS.map(n => n.night); else if (arg.includes('-')) { const [a, b] = arg.split('-').map(Number); nights = []; for (let i = a; i <= b; i++) nights.push(i); } else nights = [Number(arg)];
let problems = 0; const bad = m => { problems++; console.log('  PROBLEM  ' + m); };
const levelsFor = n => { const out = []; STAGES.forEach(st => st.levels.forEach(l => { if ((l.day || [])[0] === n) out.push(l); })); return out; };
const jobsFor = n => JOBS.filter(j => (j.day || [])[0] === n);
Game.setHandle && Game.setHandle('playtest', 'x');
Game.state.creds = 500; Game.state.rep = Game.state.rep || 0;

for (const n of nights) {
  const syl = SYLLABUS.find(s => s.night === n); const levels = levelsFor(n), jobs = jobsFor(n);
  if (!levels.length && !jobs.length) { if (arg !== 'all') bad('night ' + n + ' has no level and no gig'); continue; }
  console.log('\nNIGHT ' + n + ' · ' + (syl ? syl.topic : '?'));
  const cardsBefore = Game.allCards().filter(c => c.day === n && Game.cardUnlocked && Game.cardUnlocked(c)).length;
  for (const l of levels) { const first = Game.readLevel(l.id); const slotted = (l.unlocks || []).filter(s => Game.state.skills[s] && Game.state.skills[s].slotted);
    const beats = l.beats.map(b => b.k).join(' ');
    console.log('  talk   ' + l.id.padEnd(26) + (first ? 'synced' : 'already read') + ' · slots ' + slotted.join(', ') + ' · beats ' + beats);
    if (slotted.length !== (l.unlocks || []).length) bad(l.id + ' did not slot every skill'); }
  const dayCards = Game.allCards().filter(c => c.day === n);
  if (Game.cardUnlocked) { const open = dayCards.filter(c => Game.cardUnlocked(c)).length; console.log('  calls  ' + open + ' of ' + dayCards.length + ' of the night\'s calls can now ring (was ' + cardsBefore + ')'); if (dayCards.length && !open) bad('none of the night\'s calls unlocked'); }
  for (const j of jobs) {
    const st = Game.jobStatus(j); const reads = st.locked.filter(x => x.kind === 'read'); if (reads.length) bad(j.id + ' still locked after the talks: ' + reads.map(x => x.text).join('; '));
    const classLock = st.locked.find(x => x.kind === 'class'); if (classLock) { console.log('  note   ' + j.id + ' is class-locked for this handle (' + classLock.text + '); rep set to its class to play it'); Game.state.rep = Math.max(Game.state.rep, CLASSES.find(c => c.id === j.cls).min); }
    const cost = Game.body.cost(j); const before = { rep: Game.state.rep, creds: Game.state.creds, food: Game.state.body.food, chrome: Game.state.body.chrome };
    // fixer first, on a throwaway copy of the state
    const fx = Game.runSolution(j.id, { hireFixer: true });
    if (j.rite) { if (fx.fixer && fx.fixer.ok) bad(j.id + ' is a rite and let a fixer in'); }
    else { if (!fx.ok) bad(j.id + ' fixer run failed: ' + fx.error); else if (!(fx.probe.result.rep === 0 && fx.probe.result.creds === 0 && fx.probe.codex === 'paid')) bad(j.id + ' fixer run paid something or the notes are not PAID'); }
    Game.state.body.food = Math.max(Game.state.body.food, cost.food + 10); Game.state.body.chrome = Math.max(Game.state.body.chrome, cost.chrome + 10);
    const f0 = Game.state.body.food, c0 = Game.state.body.chrome; Game.startJob(j.id); const paidFood = f0 - Game.state.body.food, paidChrome = c0 - Game.state.body.chrome; Game.abort();
    const skills = [...new Set(j.steps.map(s => s.skill))]; const clean0 = Object.fromEntries(skills.map(s => [s, (Game.state.skills[s] || {}).clean || 0]));
    const r = Game.runSolution(j.id, { keepState: true });
    if (!r.ok) { bad(j.id + ' golden run failed: ' + r.error); continue; }
    if (r.warnings.length) bad(j.id + ' warnings: ' + r.warnings.join(' | '));
    const res = r.probe.result || {}; const sharpened = skills.filter(s => ((Game.state.skills[s] || {}).clean || 0) > clean0[s]);
    console.log('  gig    ' + j.id.padEnd(26) + (j.rite ? 'RITE · ' : '') + 'class ' + j.cls + ' · ' + j.steps.length + ' floors (' + j.steps.map(s => s.type).join(' ') + ')');
    console.log('         jack in: -' + paidFood + ' hunger, -' + paidChrome + ' chrome · out: +' + res.rep + ' rep, +' + res.creds + ' creds · codex ' + r.probe.codex + ' · sharpened ' + (sharpened.join(', ') || 'nothing') + (j.rite ? ' · fixer refused' : ' · fixer run: pays 0, notes PAID'));
    if (!r.probe.done || r.probe.codex !== 'greenlit') bad(j.id + ' not greenlit after a clean run');
    if (!(res.rep > 0 && res.creds > 0)) bad(j.id + ' paid nothing on a clean run');
    j.steps.forEach((s, i) => { if (!s.why) bad(j.id + ' floor ' + (i + 1) + ' has no why'); });
  }
  console.log('  after  rep ' + Game.state.rep + ' · class ' + Game.classFor(Game.state.rep).id + ' · creds ' + Game.state.creds);
}
console.log('\n' + (problems ? 'PLAYTEST FOUND ' + problems + ' PROBLEM(S)' : 'PLAYTEST CLEAN'));
process.exit(problems ? 1 : 0);
