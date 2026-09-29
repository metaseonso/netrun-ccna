#!/usr/bin/env node
/* tools/check.js — the developer feedback loop, headless.
   1. lint every content file (schema, references, coverage)
   2. play every gig's golden solution through the real engine; report the exact step and reason on failure
   3. run engine unit tests (tests/engine.test.js)
   Exit code 1 on any error. Run with `npm test` or `node tools/check.js [--warnings] [--job <id>] [--quiet]`. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..'); process.chdir(ROOT);
const args = process.argv.slice(2); const flag = f => args.includes(f); const opt = f => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };

// ---- boot a fake browser and load the game exactly as index.html does
global.window = global; global.location = { search: '', origin: 'http://localhost', pathname: '/' };
const mem = {}; global.localStorage = { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: k => { delete mem[k]; }, key: i => Object.keys(mem)[i] || null, get length(){ return Object.keys(mem).length; } };
global.document = { addEventListener(){}, body: { contains(){ return false; } }, querySelector(){ return null; }, querySelectorAll(){ return []; } }; global.setInterval = () => 0; global.addEventListener = () => {}; global.confirm = () => true;
const html = fs.readFileSync('index.html', 'utf8'); const tags = [...html.matchAll(/<script (type="text\/lazy" )?src="([^"?]+)(?:\?[^"]*)?"><\/script>/g)]; const scripts = tags.filter(m => !m[1]).concat(tags.filter(m => m[1])).map(m => m[2]) /* the game first, then the campaign, as the browser does */.filter(s => !/^https?:/.test(s) && s !== 'js/ui.js');
const errors = []; for (const s of scripts) { try { vm.runInThisContext(fs.readFileSync(s, 'utf8'), { filename: s }); } catch (e) { errors.push('LOAD ' + s + ': ' + e.message); } }
if (errors.length) { console.log(errors.join('\n')); process.exit(1); }

let fails = 0; const out = (s) => { if (!flag('--quiet')) console.log(s); };
// ---- 1. lint
const lint = Validate.all({ STAGES, JOBS, NPCS, GLOSSARY, SKILLS, CARDS: Game.allCards(), ARCS, CLASSES, SHOP: window.SHOP, PROTEGE_LINES: window.PROTEGE_LINES });
out('== LINT ==');
lint.errors.forEach(e => { out('ERROR  ' + e.where + ' — ' + e.msg); fails++; });
if (flag('--warnings')) lint.warnings.forEach(w => out('warn   ' + w.where + ' — ' + w.msg)); else out('(' + lint.warnings.length + ' warnings; pass --warnings to list them)');
const c = lint.coverage; out('counts: ' + Object.entries(c.counts).map(([k, v]) => k + ' ' + v).join(' · ')); out('days without a level: ' + (c.missingDays.length ? c.missingDays.length + ' (' + c.missingDays.slice(0, 12).join(',') + (c.missingDays.length > 12 ? '…' : '') + ')' : 'none'));
if (c.skillsUnused.length) out('skills no gig exercises: ' + c.skillsUnused.join(', '));

// ---- 2. golden solutions
out('\n== GIGS (golden solutions) ==');
const only = opt('--job'); let played = 0;
for (const j of JOBS) { if (only && j.id !== only) continue; if (!j.solution) { out('skip   ' + j.id + ' — no solution'); continue; } played++; const t0 = Date.now(); const r = Game.runSolution(j.id); const ms = Date.now() - t0;
  if (r.ok) out('PASS   ' + j.id.padEnd(22) + r.steps.length + ' steps ' + ms + 'ms' + (r.warnings.length ? '  ⚠ ' + r.warnings.join(' | ') : ''));
  else { fails++; out('FAIL   ' + j.id.padEnd(22) + r.error); if (r.console) for (const d in r.console) out('        [' + d + ']\n' + r.console[d].split('\n').map(l => '          ' + l).join('\n')); r.warnings.forEach(w => out('        ⚠ ' + w)); } }
out(played + ' gigs played');

// ---- 3. engine tests
out('\n== ENGINE TESTS ==');
try { const T = require(path.join(ROOT, 'tests', 'engine.test.js')); const res = T.run({ out }); fails += res.fails; out(res.pass + ' passed, ' + res.fails + ' failed'); } catch (e) { out('engine tests could not run: ' + e.message); fails++; }

// ---- 4. game rules (the fixer, the codex)
out('\n== GAME RULES ==');
try { const G = require(path.join(ROOT, 'tests', 'game.test.js')); const res = G.run({ out }); fails += res.fails; out(res.pass + ' passed, ' + res.fails + ' failed'); } catch (e) { out('game tests could not run: ' + e.message); fails++; }

out('\n' + (fails ? 'CHECK FAILED (' + fails + ')' : 'CHECK PASSED'));
process.exit(fails ? 1 : 0);
