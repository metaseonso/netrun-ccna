/* game.js — state, progression, the run loop, protégé DMs, telemetry hooks, the golden-solution runner.
   LAYER 1 (Grid): reading a level slots a skill at level 0. Nothing levels by reading.
   LAYER 2 (Jobs): a skill levels only when used in a practicum step WITHOUT a hint or walk-through.
   Rep comes from gigs and from keeping protégés alive. Rep sets class. Class + reads + crew size gate gigs. */
(function(){
  const VERSION = 2;
  const LEVEL_NAMES = ['SLOTTED', 'SYNCED', 'WIRED', 'BURNED-IN'];
  const LEVEL_AT = [0, 1, 3, 6];
  const P = () => window.PLATFORM || {};

  const fresh = () => ({ v: VERSION, handle: '', rep: 0, creds: 0, read: {}, skills: {}, jobsDone: {}, log: [], created: Date.now(), updated: Date.now(), events: [], stats: null, roster: { seq: 0, list: [] }, cards: {}, dm: null, dmLog: [], dmCount: 0, lastDmAt: 0, recruits: {}, inventory: {}, perks: { theme: null, skins: [] }, bd: [] });
  function migrate(s){ const f = fresh(); const out = Object.assign(f, s || {}); out.v = VERSION; out.roster = out.roster || { seq: 0, list: [] }; out.cards = out.cards || {}; out.dmLog = out.dmLog || []; out.recruits = out.recruits || {}; out.creds = out.creds || 0; out.inventory = out.inventory || {}; out.perks = Object.assign({ theme: null, skins: [] }, out.perks || {}); out.bd = out.bd || [];
    // crew recruited before archetypes existed: give them one, deterministically, plus the fields that came later
    (out.roster.list || []).forEach((p, i) => { if (!p.arch) { let h = 0; for (const c of (p.id || 'p' + i)) h = (h * 31 + c.charCodeAt(0)) >>> 0; p.arch = Protege.ARCHS[h % Protege.ARCHS.length]; } if (!p.want) { const L = window.PROTEGE_LINES || {}; const A = (L.arch || {})[p.arch] || {}; const w = A.wants || L.wants || []; p.want = w[i % Math.max(1, w.length)] || null; } p.timerBonus = p.timerBonus || 0; p.insurance = p.insurance || 0; p.milestones = p.milestones || []; p.trustSeen = p.trustSeen || []; });
    Telemetry.ensure(out); return out; }
  let state = fresh();
  function load(h){ const s = Storage.local.loadSync(h); return s ? migrate(s) : Object.assign(fresh(), { handle: h }); }
  try { const cur = Storage.local.current(); if (cur) state = load(cur); else { const legacy = JSON.parse(localStorage.getItem('netrun-ccna-save-v1') || 'null'); if (legacy && legacy.handle) { state = migrate(legacy); Storage.local.saveSync(state.handle, state); Storage.local.setCurrent(state.handle); localStorage.removeItem('netrun-ccna-save-v1'); } } } catch (e) {}
  Telemetry.ensure(state);
  const save = () => { if (!state.handle) return; state.updated = Date.now(); Storage.local.saveSync(state.handle, state); Storage.local.setCurrent(state.handle); Storage.pushIfRemote(state.handle, state); };
  const log = (s) => { state.log.unshift({ t: Date.now(), s }); state.log = state.log.slice(0, 300); save(); };
  const ev = (type, data) => Telemetry.event(state, type, data);

  // ---- progression -------------------------------------------------------------
  const classFor = rep => { let c = CLASSES[0]; for (const k of CLASSES) if (rep >= k.min) c = k; return c; };
  const nextClass = rep => CLASSES.find(k => k.min > rep) || null;
  const classRank = id => CLASSES.findIndex(k => k.id === id);
  const levelById = id => { for (const st of STAGES) for (const l of st.levels) if (l.id === id) return l; return null; };
  const stageOf = lid => STAGES.find(st => st.levels.some(l => l.id === lid));
  function skill(id){ return state.skills[id] || (state.skills[id] = { uses: 0, clean: 0, level: 0, slotted: false }); }
  function skillLevel(clean){ let lv = 0; LEVEL_AT.forEach((n, i) => { if (clean >= n) lv = i; }); return lv; }
  function addRep(delta, why){ const before = classFor(state.rep).id; state.rep = Math.max(0, state.rep + delta); ev('rep', { rep: state.rep, delta, why }); const after = classFor(state.rep).id; if (classRank(after) > classRank(before)) { log('PROMOTED to Class ' + after); onPromotion(after); return after; } return null; }

  function addCreds(delta, why){ state.creds = Math.max(0, (state.creds || 0) + delta); ev('creds', { creds: state.creds, delta, why }); }
  function readLevel(id){ const l = levelById(id); if (!l) return; const first = !state.read[id]; state.read[id] = Date.now(); (l.unlocks || []).forEach(s => { skill(s).slotted = true; }); if (first) { ev('read', { level: id }); log('Synced with ' + NPCS[l.npc].name + ' — "' + l.title + '"'); } save(); return first; }

  function jobStatus(job){ const me = classFor(state.rep); const locked = [];
    if (classRank(job.cls) > classRank(me.id)) locked.push({ kind: 'class', text: 'Needs Class ' + job.cls + ' rep (' + CLASSES[classRank(job.cls)].min + ')' });
    (job.requires || []).forEach(r => { if (!state.read[r]) { const l = levelById(r); locked.push({ kind: 'read', id: r, text: l ? 'Talk to ' + NPCS[l.npc].name + ': "' + l.title + '"' : 'Read ' + r }); } });
    const t = Protege.teamCheck(job, state.roster); if (!t.ok) locked.push({ kind: 'team', text: t.text });
    return { locked, done: state.jobsDone[job.id] || null }; }

  // ---- cards & protégés ----------------------------------------------------------
  function allCards(){ const out = (window.CARDS || []).slice(); STAGES.forEach(st => st.levels.forEach(l => { (l.cards || []).forEach((c, i) => out.push(Object.assign({ id: l.id + '-c' + (i + 1), level: l.id, skill: (l.unlocks || [])[0] }, c)));
      // every braindance becomes a call: the title, what year?
      l.beats.forEach((b, i) => { if (b.k === 'LORE' && b.title && b.year) out.push({ id: l.id + '-bd' + (i + 1), level: l.id, skill: (l.unlocks || [])[0], day: (l.day || [])[0], type: 'text', year: true, q: 'The braindance "' + b.title + '". What year?', a: String(b.year), why: (b.text || '').split(/(?<=\.)\s/)[0] }); }); })); return out; }
  const readDays = () => { const d = new Set(); for (const id in state.read) { const l = levelById(id); if (l) (l.day || []).forEach(x => d.add(x)); } return d; };
  function cardUnlocked(c){ if (c.level) return !!state.read[c.level]; if (c.skill && state.skills[c.skill] && state.skills[c.skill].slotted) return true; if (c.day) return readDays().has(c.day); return false; }
  function onPromotion(cls){ if (!state.recruits[cls]) { state.recruits[cls] = true; const p = Protege.recruit(state.roster, 'promotion to Class ' + cls); log(Protege.fill((PROTEGE_LINES.recruit || [])[0] || '{name} joined your crew.', p)); } }
  const dm = {
    pending(){ return state.dm; },
    maybeCreate(force){ if (state.dm) return state.dm; if (run && !run.result) return null; const now = Date.now(); const active = Protege.active(state.roster); if (!active.length) return null;
      if (!force && now - (state.lastDmAt || 0) < (P().dmCooldownMs || 180000)) return null; Protege.decay(state.roster, now);
      const cards = allCards(); const due = SRS.due(cards, state.cards, cardUnlocked, now); if (!due.length) return null; const card = SRS.pick(due, state.cards, 1, now)[0];
      const p = active.slice().sort((a, b) => b.danger - a.danger)[Math.floor(Math.random() * Math.min(2, active.length))] || active[0];
      const you = state.handle; const d = Protege.dm(p, card, { you, sib: 'big sib' });
      let opts = card.opts, a = card.a, type = card.type || (card.opts ? 'choice' : 'text');
      if (type === 'text' && /^(yes|no)/i.test(String(card.a).trim())) { opts = ['Yes', 'No']; a = /^yes/i.test(String(card.a).trim()) ? 0 : 1; type = 'choice'; }
      else if (type === 'text' && /^\d{4}$/.test(String(card.a).trim())) { const y = +card.a; const pool = [...new Set(cards.filter(c => /^\d{4}$/.test(String(c.a)) && +c.a !== y).map(c => +c.a))]; const picks = []; const cand = pool.length >= 3 ? pool : pool.concat([y - 3, y + 2, y - 11, y + 7].filter(v => v !== y)); for (let i = 0; i < cand.length && picks.length < 3; i++) { const v = cand[(i * 5 + now) % cand.length]; if (!picks.includes(v)) picks.push(v); } opts = [String(y)].concat(picks.map(String)); for (let i = opts.length - 1; i > 0; i--) { const j = (now + i * 17) % (i + 1); [opts[i], opts[j]] = [opts[j], opts[i]]; } a = opts.indexOf(String(y)); type = 'choice'; }
      else if (type === 'text') { const pool = cards.filter(c => c.id !== card.id && c.a && c.a !== card.a && (c.skill === card.skill || c.day === card.day)); const others = pool.length >= 3 ? pool : cards.filter(c => c.id !== card.id && c.a && c.a !== card.a); const picks = []; const seen = new Set([String(card.a)]); for (let i = 0; i < others.length && picks.length < 3; i++) { const c = others[(i * 7 + now) % others.length]; if (!seen.has(String(c.a))) { seen.add(String(c.a)); picks.push(String(c.a)); } } opts = [String(card.a)].concat(picks); for (let i = opts.length - 1; i > 0; i--) { const j = (now + i * 31) % (i + 1); [opts[i], opts[j]] = [opts[j], opts[i]]; } a = opts.indexOf(String(card.a)); type = 'choice'; }
      state.dm = Object.assign(d, { type, opts, a, skill: card.skill || null, why: card.why || null, answerText: card.a, openedAt: null }); state.dmCount++; ev('dm_sent', { card: card.id, protege: p.id }); save(); return state.dm; },
    open(){ if (state.dm && !state.dm.openedAt) { state.dm.openedAt = Date.now(); save(); } return state.dm; },
    remaining(){ const d = state.dm; if (!d || !d.openedAt) return null; return Math.max(0, d.seconds * 1000 - (Date.now() - d.openedAt)); },
    answer(idx){ const d = state.dm; if (!d) return null; const ok = d.type === 'choice' ? idx === d.a : false; return finish(ok, false, idx); },
    timeout(){ if (!state.dm) return null; return finish(false, true, null); }
  };
  function finish(ok, timedOut, idx){ const d = state.dm; const p = state.roster.list.find(x => x.id === d.protege); const ms = d.openedAt ? Date.now() - d.openedAt : null;
    const out = Protege.resolve(p, state.roster, ok, timedOut, { you: state.handle, sib: 'big sib' }); state.cards[d.card] = SRS.grade(state.cards[d.card], ok, Date.now(), ms);
    ev('dm_answer', { card: d.card, protege: p.id, ok, timedOut, ms, skill: d.skill, forgiven: out.forgiven }); const promoted = out.repDelta ? addRep(out.repDelta, ok ? 'crew call answered' : timedOut ? 'crew call missed' : 'crew call wrong') : null; if (out.credsDelta) addCreds(out.credsDelta, 'crew call');
    state.dmLog.unshift({ t: Date.now(), protege: p.id, name: p.name, q: d.q, chosen: idx, correct: d.a, opts: d.opts, ok, timedOut, forgiven: out.forgiven, text: out.text, flatlined: out.flatlined, orphan: out.orphan ? out.orphan.name : null, repDelta: out.repDelta, why: d.why });
    if (out.trust) state.dmLog.unshift({ t: Date.now() + 1, protege: p.id, name: p.name, letter: true, trust: true, text: out.trust }); if (out.milestone) state.dmLog.unshift({ t: Date.now() + 2, protege: p.id, name: p.name, letter: true, text: out.milestone }); if (out.orphanIntro) state.dmLog.unshift({ t: Date.now() + 2, protege: out.orphan.id, name: 'Dispatch', letter: true, text: out.orphanIntro }); state.dmLog = state.dmLog.slice(0, 80);
    log((out.forgiven ? 'Burner took the hit for ' : ok ? 'Saved ' : timedOut ? 'Too late for ' : 'Failed ') + p.name + (out.repDelta ? ' (' + (out.repDelta >= 0 ? '+' : '') + out.repDelta + ' rep)' : '') + (out.flatlined ? ' — FLATLINED. ' + out.orphan.name + ' joins the crew.' : '') + (out.milestone ? ' — a letter arrived.' : ''));
    state.dm = null; state.lastDmAt = Date.now(); save(); return { ok, timedOut, out, protege: p, promoted, why: d.why, answerText: d.opts ? d.opts[d.a] : d.answerText }; }

  // ---- a run ----------------------------------------------------------------------
  let run = null;
  function startJob(id, opts){ const job = JOBS.find(j => j.id === id); if (!job) return null; opts = opts || {};
    const topo = job.topo ? JSON.parse(JSON.stringify(job.topo)) : null; const netDef = job.net ? JSON.parse(JSON.stringify(job.net)) : null;
    const devices = {}; const R = { job, topo, netDef, devices, step: 0, hinted: {}, walked: {}, fails: {}, done: [], selected: null, feedback: null, calc: {}, choice: null, multi: new Set(), order: null, form: {}, text: '', active: job.devices[0], history: [], startedAt: Date.now(), stepStart: Date.now(), lastWhy: null, walk: null, hintShown: null, _netKey: null, _net: null };
    const ctx = { job, topo, netDef, devices, get selected(){ return R.selected; },
      state(){ if (!netDef) return null; const key = Object.values(devices).map(d => d.lines.length).join(',') + '|' + JSON.stringify(Object.keys(netDef.devices).map(n => !!netDef.devices[n].removed)); if (R._netKey !== key) { R._net = Net.build(netDef, devices); R._netKey = key; } return R._net; },
      net(){ const s = ctx.state(); return s ? Net.api(s) : null; }, cfg(dev){ return devices[dev] ? NetConfig.parse(devices[dev]) : null; },
      compute(vlan){ vlan = vlan || 1; if (topo) return Stp.compute(topo, vlan, devices); const s = ctx.state(); if (!s) return null; return s.stp[vlan] || (s.stpTopo ? Stp.compute(s.stpTopo, vlan, devices) : null); } };
    R.ctx = ctx;
    job.devices.forEach(n => { const kind = netDef && netDef.devices[n] && ['host', 'server'].includes(netDef.devices[n].kind) ? 'host' : 'ios'; const shows = topo ? stpShowsFor(topo) : {}; if (job.shows && job.shows[n]) Object.assign(shows, job.shows[n]);
      devices[n] = new Sim.Device(n, { shows, kind, netState: () => ctx.state(), banner: kind === 'host' ? n + ' — type help' : n + ' con0 is now available\n\nPress RETURN to get started.' }); });
    if (netDef && netDef.preconfig) for (const n in netDef.preconfig) if (devices[n]) devices[n].preload(netDef.preconfig[n]);
    run = R; if (!opts.silent) { ev('job_start', { job: id }); log('Jacked in: ' + job.title); } return run; }
  function stpShowsFor(topo){ return {
      'show spanning-tree': (d, all) => Stp.render(topo, 1, d.name, all), 'show spanning-tree vlan 1': (d, all) => Stp.render(topo, 1, d.name, all), 'show spanning-tree vlan 10': (d, all) => Stp.render(topo, 10, d.name, all), 'show spanning-tree vlan 20': (d, all) => Stp.render(topo, 20, d.name, all),
      'show spanning-tree summary': (d, all) => { const c = Stp.compute(topo, 1, all).switches[d.name]; return 'Switch is in ' + c.cfg.mode + ' mode\nRoot bridge for: ' + (c.isRoot ? 'VLAN0001' : 'none') + '\nPortfast Default            is ' + (c.cfg.portfastDefault ? 'enabled' : 'disabled') + '\nPortFast BPDU Guard Default is ' + (c.cfg.bpduguardDefault ? 'enabled' : 'disabled'); },
      'show vlan brief': (d) => { const v = { 1: 'default' }; d.lines.forEach(r => { let m; if (r.mode === 'config' && (m = r.line.match(/^vlan ([\d,\-]+)$/))) m[1].split(',').forEach(x => { const [a, b] = x.split('-').map(Number); for (let i = a; i <= (b || a); i++) v[i] = v[i] || ('VLAN' + String(i).padStart(4, '0')); }); if (r.mode === 'config-vlan' && (m = r.line.match(/^name (\S+)$/))) { const id = +(r.ctx.replace('vlan ', '').split(/[,-]/)[0]); v[id] = m[1]; } }); return 'VLAN Name                             Status    Ports\n---- -------------------------------- --------- -------------------\n' + Object.keys(v).map(k => String(k).padEnd(5) + v[k].padEnd(33) + 'active').join('\n'); },
      'show interfaces status': (d, all) => { const c = Stp.compute(topo, 1, all).switches[d.name]; return 'Port      Name   Status       Vlan  Duplex Speed Type\n' + Object.values(c.ports).map(p => Stp.shortName(p.name).padEnd(10) + ''.padEnd(7) + (p.errdisabled ? 'err-disabled' : p.shutdown ? 'disabled    ' : 'connected   ') + ' ' + (p.to && !p.host ? 'trunk' : '1    ') + ' a-full ' + (p.kind === 'gi' ? 'a-1000' : 'a-100 ') + ' 10/100' + (p.kind === 'gi' ? '/1000' : '') + 'BaseTX').join('\n'); } }; }

  function currentStep(){ return run ? run.job.steps[run.step] : null; }
  const norm = s => String(s == null ? '' : s).trim().toLowerCase().replace(/\s+/g, ' ');
  function evaluate(){ const st = currentStep(); if (!st) return { ok: false, why: 'no step' };
    try {
      if (st.type === 'find') { const tg = st.targets || [st.target]; return { ok: tg.includes(run.selected), why: run.selected ? 'That is ' + run.selected + '. Look again.' : 'Click a node on the map first.' }; }
      if (st.type === 'choice') return { ok: run.choice === st.a, why: run.choice == null ? 'Pick an answer.' : 'Not that one.' };
      if (st.type === 'multi') { const want = new Set(st.answers); const have = run.multi; const ok = want.size === have.size && [...want].every(x => have.has(x)); return { ok, why: have.size ? 'Not that set.' : 'Select every answer that applies.' }; }
      if (st.type === 'calc') { const bad = st.fields.filter(f => !f.check(run.calc[f.key] || '')); return { ok: bad.length === 0, why: bad.length ? 'Check: ' + bad.map(f => f.label).join(' · ') : '', bad: bad.map(f => f.key) }; }
      if (st.type === 'order') { const o = run.order || st.items.map((_, i) => i); const ok = st.accept ? !!st.accept(o.map(i => st.items[i])) : o.every((v, i) => v === i); return { ok, why: 'Not that order.' }; }
      if (st.type === 'form') { const vals = run.form; const bad = st.fields.filter(f => norm(vals[f.key]) !== norm(f.answer)); const ok = st.check ? !!st.check(vals) : bad.length === 0; return { ok, why: ok ? '' : 'Check: ' + bad.map(f => f.label).join(' · '), bad: bad.map(f => f.key) }; }
      if (st.type === 'text') { const ok = !!st.check(run.text || ''); return { ok, why: run.text ? 'Not quite.' : 'Type your answer.' }; }
      if (st.type === 'cmd') { let missing = []; if (st.need) missing = Sim.satisfied(run.devices, st.need); let ok = missing.length === 0; let err = null; if (ok && st.check) { try { ok = !!st.check(run.devices, run.ctx); } catch (e) { console.error(e); err = e; ok = false; } }
        return { ok, why: ok ? '' : err ? 'Check function threw: ' + err.message : (missing.length ? 'The transcript does not show it yet' + (missing[0].dev ? ' on ' + missing[0].dev : '') + '.' : 'The state is not there yet. Look again.'), missing, err }; }
    } catch (e) { console.error(e); return { ok: false, why: 'evaluation error: ' + e.message, err: e }; }
    return { ok: false, why: '?' }; }

  function commit(){ const st = currentStep(); if (!st) return { ok: false }; const r = evaluate(); const i = run.step; const ms = Date.now() - run.stepStart;
    if (!r.ok) { run.fails[i] = (run.fails[i] || 0) + 1; run.feedback = { ok: false, text: r.why, bad: r.bad }; ev('step_attempt', { job: run.job.id, step: i, skill: st.skill, stepType: st.type, ok: false, ms }); return r; }
    const clean = !run.hinted[i] && !run.walked[i]; const k = skill(st.skill); k.uses++; if (clean) k.clean++; const before = k.level; k.level = skillLevel(k.clean); k.slotted = true;
    const leveled = k.level > before ? { skill: st.skill, level: k.level } : null; run.done.push({ step: i, clean, leveled, ms, fails: run.fails[i] || 0 });
    ev('step_attempt', { job: run.job.id, step: i, skill: st.skill, stepType: st.type, ok: true, ms, failsBefore: run.fails[i] || 0, hinted: !!run.hinted[i], walked: !!run.walked[i] });
    if (st.onPass) { try { st.onPass(run.ctx); } catch (e) { console.error(e); } }
    run.feedback = { ok: true, text: st.ok || 'Done.', leveled }; run.lastWhy = st.why || null; run.step++; run.selected = null; run.choice = null; run.calc = {}; run.multi = new Set(); run.order = null; run.form = {}; run.text = ''; run.walk = null; run.hintShown = null; run.stepStart = Date.now(); save();
    if (run.step >= run.job.steps.length) return finishJob(); return r; }
  function useHint(){ run.hinted[run.step] = true; ev('hint', { job: run.job.id, step: run.step, skill: currentStep().skill }); return currentStep().hint; }
  function answerOf(st){ if (!st) return ''; if (st.type === 'choice') return String.fromCharCode(65 + st.a) + '. ' + st.opts[st.a]; if (st.type === 'multi') return st.answers.map(i => String.fromCharCode(65 + i) + '. ' + st.opts[i]).join('  ·  '); if (st.type === 'find') return 'Click ' + (st.targets || [st.target]).join(' or ') + ' on the map.'; if (st.type === 'calc') return st.answer || st.fields.map(f => f.label).join(' · '); if (st.type === 'order') return st.items.map((x, i) => (i + 1) + '. ' + x).join('\n'); if (st.type === 'form') return st.fields.map(f => f.label + ': ' + f.answer).join('\n'); if (st.type === 'text') return st.answer || '(see explanation)'; return st.hint || ''; }
  function reveal(){ run.walked[run.step] = true; run.hinted[run.step] = true; ev('walk', { job: run.job.id, step: run.step, skill: currentStep().skill }); const st = currentStep(); return { answer: answerOf(st), why: st.why || '' }; }
  function finishJob(){ const job = run.job; const prev = state.jobsDone[job.id]; const hintedCount = Object.keys(run.hinted).length; const fails = Object.values(run.fails).reduce((a, b) => a + b, 0); const ms = Date.now() - run.startedAt;
    let rep = job.rep; if (prev) rep = Math.round(rep * 0.4); rep = Math.max(Math.round(job.rep * 0.2), Math.round(rep * Math.max(0.3, 1 - 0.1 * hintedCount)));
    const creds = Math.round((job.creds || job.rep * 3) * (prev ? 0.4 : 1)); addCreds(creds, 'gig ' + job.id);
    const promoted = addRep(rep, 'gig ' + job.id); state.jobsDone[job.id] = { times: (prev ? prev.times : 0) + 1, last: Date.now(), best: Math.max(prev ? prev.best : 0, run.done.filter(d => d.clean).length), bestMs: Math.min(prev && prev.bestMs || Infinity, ms) };
    const leveled = run.done.filter(d => d.leveled).map(d => d.leveled); ev('job_finish', { job: job.id, ms, fails, hints: hintedCount, rep });
    log('Gig done: ' + job.title + ' (+' + rep + ' rep, ' + Math.round(ms / 1000) + 's' + (hintedCount ? ', ' + hintedCount + ' hinted' : ', clean') + (fails ? ', ' + fails + ' failed attempts' : '') + ')');
    let recruit = null; if (!state.roster.list.length) { recruit = Protege.recruit(state.roster, 'first gig'); log(Protege.fill((PROTEGE_LINES.recruit || [])[1] || '{name} joined your crew.', recruit)); }
    save(); run.result = { rep, creds, hintedCount, fails, ms, leveled, promoted, repeat: !!prev, recruit }; return { ok: true, finished: true, result: run.result }; }
  // ---- the stall -----------------------------------------------------------------------
  const shop = {
    items(){ return window.SHOP || []; },
    price(item){ return Math.round(item.price * (1 + 0.25 * classRank(classFor(state.rep).id))); },
    owned(id){ const it = shop.items().find(x => x.id === id); if (!it) return 0; if (it.kind === 'bd') return state.bd.includes(id) ? 1 : 0; if (it.kind === 'skin') return state.perks.skins.includes(id) ? 1 : 0; return state.inventory[id] || 0; },
    buy(id){ const it = shop.items().find(x => x.id === id); if (!it) return { ok: false, why: 'no such item' }; const price = shop.price(it); if ((it.kind === 'bd' || it.kind === 'skin') && shop.owned(id)) return { ok: false, why: 'you already have it' }; if (state.creds < price) return { ok: false, why: 'not enough creds. ' + (price - state.creds) + ' short.' };
      addCreds(-price, 'bought ' + it.id); if (it.kind === 'gift' || it.kind === 'perk') state.inventory[id] = (state.inventory[id] || 0) + 1; if (it.kind === 'bd') state.bd.push(id); if (it.kind === 'skin') { state.perks.skins.push(id); state.perks.theme = it.effect.theme; }
      ev('buy', { item: id, price }); log('Bought ' + it.name + ' from Marrow (' + price + ' creds)'); save(); return { ok: true, item: it, price }; },
    give(itemId, protegeId){ const it = shop.items().find(x => x.id === itemId); const p = state.roster.list.find(x => x.id === protegeId); if (!it || !p || !(state.inventory[itemId] > 0) || p.status !== 'active') return { ok: false }; state.inventory[itemId]--; const line = Protege.give(p, it); ev('gift', { item: itemId, protege: protegeId }); log('Gave ' + it.name + ' to ' + p.name); state.dmLog.unshift({ t: Date.now(), protege: p.id, name: p.name, letter: true, text: line }); save(); return { ok: true, line }; },
    favor(protegeId){ const p = state.roster.list.find(x => x.id === protegeId); if (!p || p.status !== 'active') return { ok: false, why: 'no such runner' }; if (!(state.inventory.favor > 0)) return { ok: false, why: (PROTEGE_LINES.dispatch || {}).favorEmpty || 'no favor on the books' }; state.inventory.favor--; const out = Protege.favor(p); ev('favor', { protege: protegeId }); log('Called in a favor for ' + p.name); state.dmLog.unshift({ t: Date.now(), protege: p.id, name: 'Dispatch', letter: true, text: out.dispatch }, { t: Date.now() + 1, protege: p.id, name: p.name, letter: true, text: out.them }); if (state.dm && state.dm.protege === p.id) state.dm = null; save(); return { ok: true, out }; },
    setTheme(id){ if (id && !state.perks.skins.some(s => shop.items().find(x => x.id === s).effect.theme === id)) return false; state.perks.theme = id || null; save(); return true; }
  };
  function abort(){ if (run && !run.result) { ev('job_abort', { job: run.job.id, step: run.step }); log('Jacked out early: ' + run.job.title); } run = null; }

  // ---- golden solution runner (tools/check.js and the dev panel) --------------------
  function runSolution(jobId, opts){ opts = opts || {}; const job = JOBS.find(j => j.id === jobId); if (!job) return { ok: false, error: 'no job ' + jobId }; if (!job.solution) return { ok: false, error: 'job has no solution', job: jobId };
    const snap = JSON.stringify(state); const savedRun = run; const res = { job: jobId, ok: true, steps: [], warnings: [], error: null };
    try { startJob(jobId, { silent: true }); const r = run; let i = 0; const acts = job.solution.slice(); let stepIdx = 0; let checkedVacuous = -1;
      const vac = () => { if (checkedVacuous === r.step) return; checkedVacuous = r.step; const st = currentStep(); if (!st) return; const e = evaluate(); if (e.ok && st.type !== 'choice') res.warnings.push('step ' + (r.step + 1) + ' (' + st.type + ') passes before any action — the check is vacuous'); };
      for (const a of acts) { if (r.result) { res.warnings.push('solution has actions after the gig finished'); break; } vac();
        if (a === 'commit') { const st = currentStep(); const out = commit(); res.steps.push({ i: r.done.length, type: st.type, skill: st.skill, ok: !!out.ok, why: out.ok ? null : (r.feedback && r.feedback.text) }); if (!out.ok) { res.ok = false; res.error = 'step ' + (r.step + 1) + ' (' + st.type + ' · ' + st.skill + ') did not pass: ' + (r.feedback && r.feedback.text); res.console = Object.fromEntries(Object.entries(r.devices).map(([n, d]) => [n, d.out.slice(-6).map(o => o.s).join('\n')])); if (out.err) res.error += ' [' + out.err.message + ']'; break; } continue; }
        if (a.dev && a.type) { const d = r.devices[a.dev]; if (!d) { res.ok = false; res.error = 'solution types into unknown device ' + a.dev; break; } r.active = a.dev; a.type.forEach(l => d.exec(l, r.devices)); }
        if (a.select) r.selected = a.select; if (a.choose != null) r.choice = a.choose; if (a.multi) r.multi = new Set(a.multi); if (a.calc) r.calc = Object.assign({}, a.calc); if (a.order) r.order = a.order.slice(); if (a.form) r.form = Object.assign({}, a.form); if (a.text != null) r.text = a.text; }
      if (res.ok && !r.result) { res.ok = false; res.error = 'solution ended at step ' + (r.step + 1) + ' of ' + job.steps.length + ' without finishing the gig'; }
    } catch (e) { res.ok = false; res.error = 'exception: ' + (e.stack || e.message); }
    finally { if (!opts.keepState) { state = migrate(JSON.parse(snap)); } run = savedRun; }
    return res; }

  // ---- dev helpers --------------------------------------------------------------------
  const dev = { lint(){ return Validate.all({ STAGES, JOBS, NPCS, GLOSSARY, SKILLS, CARDS: allCards(), ARCS, CLASSES, SHOP: window.SHOP, PROTEGE_LINES: window.PROTEGE_LINES }); },
    stepDiag(){ if (!run || run.result) return null; const st = currentStep(); const e = evaluate(); const out = { step: run.step + 1, type: st.type, skill: st.skill, ok: e.ok, why: e.why, err: e.err ? String(e.err.stack || e.err) : null };
      if (st.type === 'cmd' && st.need) out.need = st.need.map(n => ({ dev: n.dev, mode: n.mode || '*', ctx: n.ctx ? String(n.ctx) : '*', line: String(n.line), satisfied: !(e.missing || []).includes(n) }));
      if (st.type === 'cmd' && st.check) out.check = st.check.toString().slice(0, 400); const s = run.ctx.state && run.ctx.state(); if (s) { out.issues = s.issues; out.hosts = s.hosts; out.tables = s.tables; } return out; },
    netState(){ return run && run.ctx.state ? run.ctx.state() : null }, ping(from, to){ const n = run && run.ctx.net(); return n ? n.ping(from, to) : null }, transcripts(){ return run ? Object.fromEntries(Object.entries(run.devices).map(([n, d]) => [n, d.lines])) : null } };

  // ---- profiles -------------------------------------------------------------------
  function reset(){ const h = state.handle; Storage.local.remove(h); state = Object.assign(fresh(), { handle: h }); run = null; save(); }
  function setHandle(h){ h = h.trim().slice(0, 18); if (!h) return false; const isNew = !Storage.local.listSync().includes(h); state = load(h); state.handle = h; save(); if (isNew) log('Handle registered: ' + h); return true; }
  function logout(){ save(); run = null; state = fresh(); Storage.local.setCurrent(null); }
  function exportSave(){ return JSON.stringify(state); }
  function importSave(txt){ try { const s = JSON.parse(txt); if (s && typeof s.rep === 'number') { state = migrate(s); save(); return true; } } catch (e) {} return false; }
  async function onAuth(user){ if (!user) { Storage.useLocal(); return; } try { await Storage.mergeLocalIntoRemote(); if (state.handle) { const remote = await Storage.remote.load(state.handle); if (remote && (remote.updated || 0) >= (state.updated || 0)) { state = migrate(remote); } } save(); } catch (e) { console.warn('auth sync', e); } if (window.UI) UI.render(); }
  if (window.Auth) Auth.onChange(onAuth);
  window.addEventListener('beforeunload', () => { Telemetry.touch(state); save(); });

  window.Game = { get state(){ return state; }, get run(){ return run; }, save, log, classFor, nextClass, classRank, levelById, stageOf, readLevel, jobStatus, startJob, currentStep, evaluate, commit, useHint, reveal, answerOf, abort, finishJob, runSolution, reset, setHandle, logout, profiles: () => Storage.local.listSync(), exportSave, importSave, skill, allCards, cardUnlocked, dm, dev, addRep, addCreds, shop, stats: () => Telemetry.summary(state, { levels: STAGES.reduce((a, s) => a + s.levels.length, 0), read: Object.keys(state.read).length, jobs: JOBS.length, done: Object.keys(state.jobsDone).length, roster: state.roster, retention: SRS.retention(state.cards), cards: allCards().length, unlocked: allCards().filter(cardUnlocked).length }), LEVEL_NAMES, LEVEL_AT, VERSION };
})();
