/* game.js — state, progression, the run loop, protégé DMs, telemetry hooks, the golden-solution runner.
   LAYER 1 (Grid): reading a level slots a skill at level 0. Nothing levels by reading.
   LAYER 2 (Jobs): a skill levels only when used in a practicum step WITHOUT a hint or a fixer.
   Rep comes from gigs and from keeping protégés alive. Rep sets class. Class + reads + crew size gate gigs. */
(function(){
  const VERSION = 3; // records from earlier builds are dropped, not migrated (alpha reset)
  const LEVEL_NAMES = ['SLOTTED', 'SYNCED', 'WIRED', 'BURNED-IN'];
  const LEVEL_AT = [0, 1, 3, 6];
  const P = () => window.PLATFORM || {};

  const fresh = () => ({ v: VERSION, handle: '', rep: 0, creds: 0, read: {}, skills: {}, jobsDone: {}, log: [], created: Date.now(), updated: Date.now(), events: [], stats: null, roster: { seq: 0, list: [] }, cards: {}, dm: null, dmLog: [], dmCount: 0, lastDmAt: 0, recruits: {}, inventory: {}, perks: { theme: null, skins: [] }, bd: [], body: { food: 100, chrome: 100, tab: 0, owed: 0 }, checkpoint: null, dead: null, meta: { deaths: 0, syncs: 0, lastSync: 0 }, pass: null, owner: null, codex: {}, completedAt: null, license: null });
  // fill in keys added since a record was written (same VERSION only; older records are dropped in load())
  function migrate(s){ const out = Object.assign(fresh(), s || {}); out.v = VERSION; out.perks = Object.assign({ theme: null, skins: [] }, out.perks || {}); out.body = Object.assign({ food: 100, chrome: 100, tab: 0, owed: 0 }, out.body || {}); out.meta = Object.assign({ deaths: 0, syncs: 0, lastSync: 0 }, out.meta || {}); (out.roster.list || []).forEach(p => { p.timerBonus = p.timerBonus || 0; p.insurance = p.insurance || 0; p.milestones = p.milestones || []; p.trustSeen = p.trustSeen || []; }); Telemetry.ensure(out); return out; }
  const usable = s => !!s && (s.v || 0) >= VERSION;
  let state = fresh();
  function load(h){ const s = Storage.local.loadSync(h); if (s && !usable(s)) { Storage.local.remove(h); console.info('record from an earlier build dropped:', h); } return usable(s) ? migrate(s) : Object.assign(fresh(), { handle: h }); }
  try { const cur = Storage.local.current(); const r = cur && Storage.local.loadSync(cur); if (r && !r.owner) state = load(cur); } catch (e) {} // a Google record never opens from the browser
  try { for (let i = localStorage.length - 1; i >= 0; i--) { const k = localStorage.key(i); if (k && k.startsWith('netrun-ccna-')) localStorage.removeItem(k); } } catch (e) {} // keys from before the rename
  Telemetry.ensure(state);
  // a handle-only record lives in this browser. a Google record lives only in the player's Drive: memory while playing, Drive on every save.
  let dirty = false, inflight = null, flushTimer = null, names = null;
  const save = () => { if (!state.handle) return; state.updated = Date.now(); if (state.owner) { dirty = true; flush(); return; } Storage.local.saveSync(state.handle, state); Storage.local.setCurrent(state.handle); };
  // Drive writes: one in flight at a time, a few seconds apart while playing, at once on a sync, LOG OUT, SIGN OUT or a hidden tab.
  function flush(now){ if (!state.owner || !dirty) return inflight || Promise.resolve(true); if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
    if (!now) { flushTimer = setTimeout(() => flush(true), 4000); return Promise.resolve(false); }
    if (inflight) return inflight.then(() => flush(true));
    if (!(window.Auth && Auth.token()) || !Storage.remote.ready()) return Promise.resolve(false); // stays dirty: the HUD shows RECONNECT
    const h = state.handle, snap = JSON.parse(JSON.stringify(state)); dirty = false;
    inflight = Storage.remote.save(h, snap).then(ok => { inflight = null; if (!ok) dirty = true; else if (names && !names.includes(h)) names = names.concat(h).sort(); return ok; });
    return inflight; }
  const log = (s) => { state.log.unshift({ t: Date.now(), s }); state.log = state.log.slice(0, 300); save(); };
  const ev = (type, data) => Telemetry.event(state, type, data);

  // ---- progression -------------------------------------------------------------
  // class = rep threshold AND the rite of the class below (the gig flagged rite:true with that cls). No rite written yet = no gate.
  const classRank = id => CLASSES.findIndex(k => k.id === id);
  // what a gig pays on a first clear, and the rep it is worth: its own numbers, else its class's
  const clsOf = id => CLASSES.find(c => c.id === id) || CLASSES[0];
  const pay = job => job.creds != null ? job.creds : clsOf(job.cls).pay;
  const repOf = job => job.rep != null ? job.rep : clsOf(job.cls).rep;
  const riteFor = cls => (window.JOBS || []).find(j => j.rite && j.cls === cls) || null;
  const riteCleared = cls => { const r = riteFor(cls); return !r || !!state.jobsDone[r.id]; };
  const classFor = rep => { let c = CLASSES[0]; for (let i = 1; i < CLASSES.length; i++) { if (rep >= CLASSES[i].min && riteCleared(CLASSES[i - 1].id)) c = CLASSES[i]; else break; } return c; };
  const nextClass = rep => CLASSES[classRank(classFor(rep).id) + 1] || null;
  // the rite standing between the player and the next class (rep is there, the rite is not)
  const riteBlocking = () => { const nx = nextClass(state.rep); if (!nx || state.rep < nx.min) return null; const r = riteFor(classFor(state.rep).id); return r && !state.jobsDone[r.id] ? r : null; };

  // ---- the body: two meters. only gigs drain them (food and chrome, at jack-in; a little chrome per bad call). getting paid is how you refill.
  //      a meter at zero is a flatline. the player always sees the cost before jacking in, so a death is a choice they made.
  const body = {
    max: 100,
    cost(job){ const r = classRank(job.cls); return { food: job.food != null ? job.food : 15 + 5 * r, chrome: job.chrome != null ? job.chrome : 10 + 5 * r }; },
    lethal(job){ const c = body.cost(job); return state.body.food - c.food <= 0 || state.body.chrome - c.chrome <= 0; },
    low(){ return state.body.food <= 30 || state.body.chrome <= 30; },
    eat(id){ const it = shop.items().find(x => x.id === id); if (!it || it.kind !== 'food' || !(state.inventory[id] > 0)) return { ok: false, why: 'nothing to eat' }; if (state.body.food >= body.max) return { ok: false, why: 'you are full. keep it, or hand it to a runner who needs it.' };
      state.inventory[id]--; const before = state.body.food; state.body.food = Math.min(body.max, state.body.food + (it.effect.food || 0)); ev('eat', { item: id, food: state.body.food }); log('Ate ' + it.name + ' (food ' + before + ' → ' + state.body.food + ')'); save(); return { ok: true, item: it, food: state.body.food }; },
    wear(n, why){ if (!state.handle) return false; state.body.chrome = Math.max(0, state.body.chrome - n); if (state.body.chrome <= 0) { flatline(why || 'the chrome gave out.'); return true; } return false; }
  };
  function flatline(why){ state.dead = { at: Date.now(), why, food: state.body.food, chrome: state.body.chrome, job: run ? run.job.id : null }; state.meta.deaths++; const fn = run && run.job.day ? run.job.day[0] : null; if (fn) { state.meta.flatNights = state.meta.flatNights || {}; state.meta.flatNights[fn] = (state.meta.flatNights[fn] || 0) + 1; } ev('flatline', { why, job: state.dead.job }); log('FLATLINED. ' + why); run = null; save(); }
  // a sync is the only save the player gets: after a talk, after a gig. no chips, no manual saves. pacing stays ours.
  // telemetry, the journal and the passcode ride outside the snapshot so a reload never erases the record of what happened.
  const KEEP = ['events', 'log', 'dmLog', 'meta', 'checkpoint', 'pass', 'owner', 'codex', 'completedAt', 'license'];
  function sync(label){ syncInner(label); flush(true); }
  function syncInner(label){ const data = {}; for (const k in state) if (!KEEP.includes(k) && k !== 'dead') data[k] = state[k]; state.checkpoint = { at: Date.now(), label, data: JSON.parse(JSON.stringify(data)) }; state.meta.syncs++; state.meta.lastSync = Date.now(); ev('sync', { label }); save(); }
  function reload(){ const cp = state.checkpoint; const keep = {}; KEEP.forEach(k => { keep[k] = state[k]; }); const h = state.handle; state = cp ? migrate(Object.assign({}, cp.data, keep, { handle: h })) : Object.assign(fresh(), keep, { handle: h }); state.dead = null; run = null; ev('reload', { label: cp ? cp.label : null }); log(cp ? 'Back to the last sync: ' + cp.label : 'No sync on record. Starting over under this handle.'); save(); return !!cp; }
  const levelById = id => { for (const st of STAGES) for (const l of st.levels) if (l.id === id) return l; return null; };
  const stageOf = lid => STAGES.find(st => st.levels.some(l => l.id === lid));
  function skill(id){ return state.skills[id] || (state.skills[id] = { uses: 0, clean: 0, level: 0, slotted: false }); }
  function skillLevel(clean){ let lv = 0; LEVEL_AT.forEach((n, i) => { if (clean >= n) lv = i; }); return lv; }
  function addRep(delta, why, before){ before = before || classFor(state.rep).id; state.rep = Math.max(0, state.rep + delta); ev('rep', { rep: state.rep, delta, why }); const after = classFor(state.rep).id; if (classRank(after) > classRank(before)) { log('PROMOTED to Class ' + after); onPromotion(after); return after; } return null; }

  function addCreds(delta, why){ state.creds = Math.max(0, (state.creds || 0) + delta); ev('creds', { creds: state.creds, delta, why }); }
  function readLevel(id){ const l = levelById(id); if (!l) return; const first = !state.read[id]; state.read[id] = Date.now(); (l.unlocks || []).forEach(s => { skill(s).slotted = true; }); if (first) { ev('read', { level: id }); log('Synced with ' + NPCS[l.npc].name + ' — "' + l.title + '"'); } if (first) sync('talk · ' + l.title); else save(); return first; }

  function jobStatus(job){ const me = classFor(state.rep); const locked = [];
    if (classRank(job.cls) > classRank(me.id)) { const rb = riteBlocking(); locked.push({ kind: 'class', text: rb && classRank(job.cls) === classRank(me.id) + 1 ? 'Dispatch wants to see you clear "' + rb.title + '" first' : 'Needs Class ' + job.cls + ' rep (' + CLASSES[classRank(job.cls)].min + ')' }); }
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
    if (!opts.silent) { const c = body.cost(job); state.body.food = Math.max(0, state.body.food - c.food); state.body.chrome = Math.max(0, state.body.chrome - c.chrome); ev('body', { job: job.id, food: state.body.food, chrome: state.body.chrome });
      if (state.body.food <= 0) { flatline('you went in hungry. ' + (job.rite ? 'the rite' : 'the dive') + ' took the rest.'); return null; } if (state.body.chrome <= 0) { flatline('the chrome was already failing. it quit two floors down.'); return null; } save(); }
    const topo = job.topo ? JSON.parse(JSON.stringify(job.topo)) : null; const netDef = job.net ? JSON.parse(JSON.stringify(job.net)) : null;
    const devices = {}; const R = { job, topo, netDef, devices, step: 0, hinted: {}, sharpened: {}, fails: {}, done: [], selected: null, feedback: null, calc: {}, choice: null, multi: new Set(), order: null, form: {}, text: '', active: job.devices[0], history: [], startedAt: Date.now(), stepStart: Date.now(), lastWhy: null, hintShown: null, _netKey: null, _net: null };
    const ctx = { job, topo, netDef, devices, get selected(){ return R.selected; },
      state(){ if (!netDef) return null; const key = Object.values(devices).map(d => d.lines.length).join(',') + '|' + JSON.stringify(Object.keys(netDef.devices).map(n => !!netDef.devices[n].removed)); if (R._netKey !== key) { R._net = Net.build(netDef, devices); R._netKey = key; } return R._net; },
      net(){ const s = ctx.state(); return s ? Net.api(s) : null; }, cfg(dev){ return devices[dev] ? NetConfig.parse(devices[dev]) : null; },
      compute(vlan){ vlan = vlan || 1; if (topo) return Stp.compute(topo, vlan, devices); const s = ctx.state(); if (!s) return null; return s.stp[vlan] || (s.stpTopo ? Stp.compute(s.stpTopo, vlan, devices) : null); } };
    R.ctx = ctx;
    // every router and switch in the network gets a device, so its starting config applies even without a console; the player only sees job.devices
    const all = job.devices.slice(); if (netDef) Object.keys(netDef.devices).forEach(n => { if (!all.includes(n) && ['router', 'switch', 'l3switch'].includes(netDef.devices[n].kind)) all.push(n); });
    all.forEach(n => { const kind = netDef && netDef.devices[n] && ['host', 'server'].includes(netDef.devices[n].kind) ? 'host' : 'ios'; const shows = topo ? stpShowsFor(topo) : {}; if (job.shows && job.shows[n]) Object.assign(shows, job.shows[n]);
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
      if (st.type === 'find') { const tg = st.targets || [st.target]; return { ok: tg.includes(run.selected), why: run.selected ? 'Not that one. Look again.' : 'Click a box on the map first.' }; }
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
    if (!r.ok) { run.fails[i] = (run.fails[i] || 0) + 1; run.feedback = { ok: false, text: r.why, bad: r.bad }; ev('step_attempt', { job: run.job.id, step: i, skill: st.skill, stepType: st.type, ok: false, ms }); if (body.wear(1, 'the chrome burned out mid-dive, ' + (run.job.steps.length - i) + ' floors from the top.')) return { ok: false, dead: true, why: 'flatlined' }; return r; }
    const clean = !run.hinted[i] && !run.outsourced; const k = skill(st.skill); k.uses++;
    // one step of sharpening per quickhack per gig: a skill burns in over several nights, never in one dive
    if (clean && !run.sharpened[st.skill]) { k.clean++; run.sharpened[st.skill] = true; } const before = k.level; k.level = skillLevel(k.clean); k.slotted = true;
    const leveled = k.level > before ? { skill: st.skill, level: k.level } : null; run.done.push({ step: i, clean, leveled, ms, fails: run.fails[i] || 0 });
    ev('step_attempt', { job: run.job.id, step: i, skill: st.skill, stepType: st.type, ok: true, ms, failsBefore: run.fails[i] || 0, hinted: !!run.hinted[i] });
    if (st.onPass) { try { st.onPass(run.ctx); } catch (e) { console.error(e); } }
    run.feedback = { ok: true, text: st.ok || 'Done.', leveled }; run.lastWhy = st.why || null; run.step++; run.selected = null; run.choice = null; run.calc = {}; run.multi = new Set(); run.order = null; run.form = {}; run.text = ''; run.hintShown = null; run.stepStart = Date.now(); save();
    if (run.step >= run.job.steps.length) return finishJob(); return r; }
  function useHint(){ run.hinted[run.step] = true; ev('hint', { job: run.job.id, step: run.step, skill: currentStep().skill }); return currentStep().hint; }
  function answerOf(st){ if (!st) return ''; if (st.type === 'choice') return String.fromCharCode(65 + st.a) + '. ' + st.opts[st.a]; if (st.type === 'multi') return st.answers.map(i => String.fromCharCode(65 + i) + '. ' + st.opts[i]).join('  ·  '); if (st.type === 'find') return 'Click ' + (st.targets || [st.target]).join(' or ') + ' on the map.'; if (st.type === 'calc') return st.answer || st.fields.map(f => f.label).join(' · '); if (st.type === 'order') return st.items.map((x, i) => (i + 1) + '. ' + x).join('\n'); if (st.type === 'form') return st.fields.map(f => f.label + ': ' + f.answer).join('\n'); if (st.type === 'text') return st.answer || '(see explanation)'; return st.hint || ''; }
  function finishJob(){ const job = run.job; const prev = state.jobsDone[job.id]; const hintedCount = Object.keys(run.hinted).length; const fails = Object.values(run.fails).reduce((a, b) => a + b, 0); const ms = Date.now() - run.startedAt;
    // a fixer's run: the client is served, the fixer keeps the pay. nothing greenlit, no rep, no sync. the gig stays on the Board.
    if (run.outsourced) { ev('job_finish', { job: job.id, ms, fails, hints: hintedCount, rep: 0, outsourced: true }); log('Gig handed off: ' + job.title + ' (the fixer kept the pay)'); save();
      run.result = { rep: 0, creds: 0, hintedCount, fails, ms, leveled: [], promoted: null, repeat: !!prev, recruit: null, outsourced: true }; return { ok: true, finished: true, result: run.result }; }
    let rep = repOf(job); if (prev) rep = Math.round(rep * 0.4); rep = Math.max(Math.round(repOf(job) * 0.2), Math.round(rep * Math.max(0.3, 1 - 0.1 * hintedCount)));
    const creds = Math.round(pay(job) * (prev ? 0.4 : 1)); addCreds(creds, 'gig ' + job.id);
    const settled = Math.min(state.body.owed || 0, creds); if (settled) { addCreds(-settled, 'marrow tab'); state.body.owed -= settled; log('Marrow took ' + settled + ' creds off the tab'); } if (!state.body.owed) state.body.tab = 0;
    const before = classFor(state.rep).id; state.jobsDone[job.id] = { times: (prev ? prev.times : 0) + 1, last: Date.now(), best: Math.max(prev ? prev.best : 0, run.done.filter(d => d.clean).length), bestMs: Math.min(prev && prev.bestMs || Infinity, ms) };
    if (job.id === window.FINALE && !state.completedAt) { state.completedAt = Date.now(); log('Opening Night. The Watson Exchange held.'); ev('complete', { job: job.id }); }
    const promoted = addRep(rep, 'gig ' + job.id, before); // a rite clears the gate, so the class is re-read after the gig is on the books
    const leveled = run.done.filter(d => d.leveled).map(d => d.leveled); ev('job_finish', { job: job.id, ms, fails, hints: hintedCount, rep });
    log('Gig done: ' + job.title + ' (+' + rep + ' rep, ' + Math.round(ms / 1000) + 's' + (hintedCount ? ', ' + hintedCount + ' hinted' : ', clean') + (fails ? ', ' + fails + ' failed attempts' : '') + ')');
    let recruit = null; if (!state.roster.list.length) { recruit = Protege.recruit(state.roster, 'first gig'); log(Protege.fill((PROTEGE_LINES.recruit || [])[1] || '{name} joined your crew.', recruit)); }
    sync('gig · ' + job.title); run.result = { rep, creds, settled, hintedCount, fails, ms, leveled, promoted, repeat: !!prev, recruit }; return { ok: true, finished: true, result: run.result }; }
  // ---- the fixer: a subcontractor who sells the whole gig's notes for the gig's pay ---------------
  // the run that hires one pays nothing, greenlights nothing and sharpens nothing. the notes stay in the codex for good,
  // readable in that dive only through the fixer's button, and after it only outside a dive. rites are watched: no fixers.
  const fixer = {
    price(job){ return pay(job); },
    can(){ if (!run || run.result) return { ok: false, why: 'Not in a dive.' }; if (run.outsourced) return { ok: false, why: 'The fixer is already on it.' };
      if (run.job.rite) return { ok: false, why: 'The Board watches rites. No fixer will touch this one.' };
      if (codexStatus(run.job) !== 'sealed') return { ok: false, why: 'You already have the notes for this gig. They are in the CODEX.', have: true }; const price = fixer.price(run.job);
      if ((state.creds || 0) < price) return { ok: false, why: 'A fixer wants ' + price + ' creds for this gig. You have ' + (state.creds || 0) + '.', price }; return { ok: true, price }; },
    hire(){ const c = fixer.can(); if (!c.ok) return c; addCreds(-c.price, 'fixer ' + run.job.id); run.outsourced = true; if (!state.jobsDone[run.job.id]) state.codex[run.job.id] = 'paid';
      ev('fixer', { job: run.job.id, price: c.price, step: run.step }); log('Hired a fixer on ' + run.job.title + ' for ' + c.price + ' creds'); save(); return { ok: true, price: c.price }; }
  };
  // a gig's codex entry: greenlit once you clear it, paid once a fixer sold it to you, sealed otherwise
  const codexStatus = job => state.jobsDone[job.id] ? 'greenlit' : (state.codex || {})[job.id] === 'paid' ? 'paid' : 'sealed';

  // ---- completion: the nights you finished, the license record ---------------------------------------
  // a night is done when every talk set on it was heard and every gig set on it was cleared at least once
  function nightDone(n){ const ls = []; STAGES.forEach(stg => stg.levels.forEach(l => { if ((l.day || []).includes(n)) ls.push(l); })); if (!ls.length) return false;
    const gs = JOBS.filter(j => (j.day || []).includes(n)); return ls.every(l => state.read[l.id]) && gs.every(j => state.jobsDone[j.id]); }
  function licenseRecord(){ const st = state.stats || {}, steps = st.steps || {}; const nights = (window.SYLLABUS || []).filter(x => nightDone(x.night)).length;
    const fp = [state.handle, state.created, state.completedAt].join('|'); let h = 0x811c9dc5; for (const c of fp) { h ^= c.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
    return { fingerprint: h.toString(16) + '-' + (state.completedAt || 0).toString(36), completedAt: state.completedAt ? new Date(state.completedAt).toISOString() : null, cls: classFor(state.rep).id,
      stats: { nights, gigs: Object.keys(state.jobsDone).length, clean: steps.passes ? Math.round(100 * (steps.firstTry || 0) / steps.passes) : null, hours: Math.round((st.playMs || 0) / 360000) / 10,
        saved: state.roster.list.reduce((a, p) => a + (p.saved || 0), 0), lost: Protege.lost(state.roster).length, flatlines: state.meta.deaths || 0, fixers: Object.keys(state.codex || {}).length } }; }
  function setLicense(l){ state.license = l; log('Licensed: ' + l.number); save(); }

  // ---- the stall -----------------------------------------------------------------------
  const shop = {
    items(){ return window.SHOP || []; },
    price(item){ return Math.round(item.price * (1 + 0.5 * classRank(classFor(state.rep).id))); },
    // Marrow's tab: a broke runner under 70 gets food or the patch on credit, up to 2 + classRank items at once. Under 70, not
    // 30: a rite costs up to 45 hunger and 38 chrome, and a runner at 40 with no creds must still be able to get in. The next
    // pay settles it, and the tab opens again, so nobody is ever stuck outside a dive.
    onTab(it){ const low = (it.kind === 'food' && state.body.food < 70) || (it.kind === 'service' && (it.effect.chrome || 100) < 100 && state.body.chrome < 70); return low && state.creds < shop.price(it) && state.body.tab < 2 + classRank(classFor(state.rep).id); },
    owned(id){ const it = shop.items().find(x => x.id === id); if (!it) return 0; if (it.kind === 'bd') return state.bd.includes(id) ? 1 : 0; if (it.kind === 'skin') return state.perks.skins.includes(id) ? 1 : 0; return state.inventory[id] || 0; },
    buy(id){ const it = shop.items().find(x => x.id === id); if (!it) return { ok: false, why: 'no such item' }; let price = shop.price(it); if ((it.kind === 'bd' || it.kind === 'skin') && shop.owned(id)) return { ok: false, why: 'you already have it' }; if (it.max && shop.owned(id) >= it.max) return { ok: false, why: 'you can only hold ' + it.max + '.' }; if (it.kind === 'service' && state.body.chrome >= body.max) return { ok: false, why: 'nothing to fix. the ripperdoc sends you home.' };
      let onTheHouse = false; if (state.creds < price) { if (shop.onTab(it)) { onTheHouse = true; state.body.tab++; state.body.owed = (state.body.owed || 0) + price; price = 0; } else return { ok: false, why: 'not enough creds. ' + (price - state.creds) + ' short.' }; }
      if (price) addCreds(-price, 'bought ' + it.id); if (it.kind === 'gift' || it.kind === 'food' || it.kind === 'favor') state.inventory[id] = (state.inventory[id] || 0) + 1; if (it.kind === 'service') state.body.chrome = Math.min(body.max, state.body.chrome + (it.effect.chrome || body.max)); if (it.kind === 'bd') state.bd.push(id); if (it.kind === 'skin') { state.perks.skins.push(id); state.perks.theme = it.effect.theme; }
      ev('buy', { item: id, price, tab: onTheHouse }); log((onTheHouse ? 'Marrow put it on the tab: ' : 'Bought ') + it.name + (onTheHouse ? '' : ' from Marrow (' + price + ' creds)')); save(); return { ok: true, item: it, price, onTheHouse }; },
    give(itemId, protegeId){ const it = shop.items().find(x => x.id === itemId); const p = state.roster.list.find(x => x.id === protegeId); if (!it || !p || !(state.inventory[itemId] > 0) || p.status !== 'active') return { ok: false }; state.inventory[itemId]--; const line = Protege.give(p, it); ev('gift', { item: itemId, protege: protegeId }); log('Gave ' + it.name + ' to ' + p.name); state.dmLog.unshift({ t: Date.now(), protege: p.id, name: p.name, letter: true, text: line }); save(); return { ok: true, line }; },
    favor(protegeId){ const p = state.roster.list.find(x => x.id === protegeId); if (!p || p.status !== 'active') return { ok: false, why: 'no such runner' }; if (!(state.inventory.favor > 0)) return { ok: false, why: (PROTEGE_LINES.dispatch || {}).favorEmpty || 'no favor on the books' }; state.inventory.favor--; const out = Protege.favor(p); ev('favor', { protege: protegeId }); log('Called in a favor for ' + p.name); state.dmLog.unshift({ t: Date.now(), protege: p.id, name: 'Dispatch', letter: true, text: out.dispatch }, { t: Date.now() + 1, protege: p.id, name: p.name, letter: true, text: out.them }); if (state.dm && state.dm.protege === p.id) state.dm = null; save(); return { ok: true, out }; },
    setTheme(id){ if (id && !state.perks.skins.some(s => shop.items().find(x => x.id === s).effect.theme === id)) return false; state.perks.theme = id || null; save(); return true; }
  };
  function abort(){ if (run && !run.result) { ev('job_abort', { job: run.job.id, step: run.step }); log('Jacked out early: ' + run.job.title); } run = null; }

  // ---- golden solution runner (tools/check.js and the dev panel) --------------------
  function runSolution(jobId, opts){ opts = opts || {}; const job = JOBS.find(j => j.id === jobId); if (!job) return { ok: false, error: 'no job ' + jobId }; if (!job.solution) return { ok: false, error: 'job has no solution', job: jobId };
    const snap = JSON.stringify(state); const savedRun = run; const res = { job: jobId, ok: true, steps: [], warnings: [], error: null };
    try { startJob(jobId, { silent: true }); const r = run; let i = 0; if (opts.hireFixer) { state.creds = Math.max(state.creds || 0, fixer.price(job)); res.fixer = fixer.hire(); } const acts = job.solution.slice(); let stepIdx = 0; let checkedVacuous = -1;
      const vac = () => { if (checkedVacuous === r.step) return; checkedVacuous = r.step; const st = currentStep(); if (!st) return; const e = evaluate(); if (e.ok && st.type !== 'choice') res.warnings.push('step ' + (r.step + 1) + ' (' + st.type + ') passes before any action — the check is vacuous'); };
      for (const a of acts) { if (r.result) { res.warnings.push('solution has actions after the gig finished'); break; } vac();
        if (a === 'commit') { const st = currentStep(); const out = commit(); res.steps.push({ i: r.done.length, type: st.type, skill: st.skill, ok: !!out.ok, why: out.ok ? null : (r.feedback && r.feedback.text) }); if (!out.ok) { res.ok = false; res.error = 'step ' + (r.step + 1) + ' (' + st.type + ' · ' + st.skill + ') did not pass: ' + (r.feedback && r.feedback.text); res.console = Object.fromEntries(Object.entries(r.devices).map(([n, d]) => [n, d.out.slice(-6).map(o => o.s).join('\n')])); if (out.err) res.error += ' [' + out.err.message + ']'; break; } continue; }
        if (a.dev && a.type) { const d = r.devices[a.dev]; if (!d) { res.ok = false; res.error = 'solution types into unknown device ' + a.dev; break; } r.active = a.dev; a.type.forEach(l => d.exec(l, r.devices)); }
        if (a.select) r.selected = a.select; if (a.choose != null) r.choice = a.choose; if (a.multi) r.multi = new Set(a.multi); if (a.calc) r.calc = Object.assign({}, a.calc); if (a.order) r.order = a.order.slice(); if (a.form) r.form = Object.assign({}, a.form); if (a.text != null) r.text = a.text; }
      if (res.ok && !r.result) { res.ok = false; res.error = 'solution ended at step ' + (r.step + 1) + ' of ' + job.steps.length + ' without finishing the gig'; }
      res.probe = { done: !!state.jobsDone[jobId], codex: codexStatus(job), rep: state.rep, creds: state.creds, result: r.result };
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
  function reset(){ const h = state.handle, pass = state.pass, owner = state.owner; Storage.local.remove(h); state = Object.assign(fresh(), { handle: h, pass, owner }); run = null; save(); }
  // not security, by design: a passcode keeps two people on one deck out of each other's record. it is hashed so it is not stored as typed.
  function hashPass(p){ let h = 0x811c9dc5; for (const c of String(p)) { h ^= c.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0') + String(p).length.toString(16); }
  function setHandle(h, pass){ h = (h || '').trim().slice(0, 18); pass = (pass || '').trim(); if (!h) return { ok: false, why: 'pick a handle', field: 'handle' }; const isNew = !Storage.local.listSync().includes(h);
    if (!pass) return { ok: false, why: isNew ? 'pick a passcode too. anything. you need it again after LOG OUT.' : 'passcode for ' + h + '?', field: 'pass' };
    const s = load(h); if (s.owner) return { ok: false, why: h + ' is bound to a Google account. SIGN IN WITH GOOGLE to jack in.', field: 'handle' };
    if (s.pass && s.pass !== hashPass(pass)) return { ok: false, why: 'that is not the passcode for ' + h, field: 'pass' };
    state = s; state.handle = h; if (!state.pass) state.pass = hashPass(pass); save(); if (isNew) log('Handle registered: ' + h); return { ok: true, isNew }; }
  // signed in with Google: the account is the key. no passcode. the record lives in the account's Drive, never in this browser.
  const gUser = () => window.Auth && Auth.user && Auth.user();
  const LAST = 'netrunner-ccna-last-google'; // the last handle's name for this account, so the door can offer it. a name, not a record.
  const lastHandle = () => { try { const v = JSON.parse(localStorage.getItem(LAST) || 'null'); const u = gUser(); return v && u && v.id === u.id ? v.h : null; } catch (e) { return null; } };
  const setLast = h => { try { const u = gUser(); if (h && u) localStorage.setItem(LAST, JSON.stringify({ id: u.id, h })); else localStorage.removeItem(LAST); } catch (e) {} };
  let driveOk = null, linking = false, linkP = Promise.resolve();
  function myHandles(){ if (!gUser() || !names) return []; const l = lastHandle(); return names.slice().sort((a, b) => (b === l) - (a === l)); }
  function deckHandles(){ return Storage.local.listSync().filter(h => { const r = Storage.local.loadSync(h); return !(r && r.owner); }); }
  // Google gives the Drive folder only when its box is ticked on the consent screen. no folder, no save file.
  // why Drive said no: 'scope' = the box was not ticked; 'api' = the Drive API is off in the game's Google project; 'other' = anything else
  let driveWhy = null;
  async function checkDrive(){ driveWhy = null; try { const r = await fetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&pageSize=1&fields=files(id)', { headers: { Authorization: 'Bearer ' + Auth.token() } }); if (r.ok) return true;
      let body = {}; try { body = await r.json(); } catch (e) {} const err = body.error || {}; const reason = ((err.errors || [])[0] || {}).reason || (err.details || []).map(d => d.reason).filter(Boolean)[0] || err.status || '';
      let granted = null; try { const ti = await fetch('https://oauth2.googleapis.com/tokeninfo', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'access_token=' + encodeURIComponent(Auth.token()) }); const t = await ti.json(); granted = String(t.scope || '').split(' ').includes('https://www.googleapis.com/auth/drive.appdata'); } catch (e) {}
      const kind = granted === false || /insufficient/i.test(reason) ? 'scope' : /accessNotConfigured|SERVICE_DISABLED|disabled/i.test(reason + ' ' + (err.message || '')) ? 'api' : 'other';
      driveWhy = { kind, status: r.status, reason, message: String(err.message || '').slice(0, 300), granted }; console.warn('drive check', driveWhy); return false; } catch (e) { return true; } }
  async function openBound(h, u){ let rec = await Storage.remote.load(h); if (rec && !usable(rec)) rec = null; const isNew = !rec;
    state = migrate(rec || Object.assign(fresh(), { handle: h })); state.handle = h; state.owner = u.id; state.pass = null; run = null; setLast(h);
    if (isNew) { log('Handle registered: ' + h); dirty = true; await flush(true); } return { ok: true, isNew }; }
  // a signed-in player never types a passcode. a handle on this deck with no account binds as it is opened and leaves the browser.
  async function claimHandle(h, pass){ const u = gUser(); if (!u) return setHandle(h, pass); h = (h || '').trim().slice(0, 18); if (!h) return { ok: false, why: 'pick a handle', field: 'handle' };
    if (!Auth.token()) { const t = await Auth.ensureToken(); if (!t) return { ok: false, why: 'Google did not answer. try again.', field: 'handle' }; }
    await linkP; if (driveOk === false) return { ok: false, why: 'your save file needs the Drive box ticked. press ALLOW DRIVE.', field: 'handle' };
    if (names && names.includes(h)) return openBound(h, u);
    const local = Storage.local.loadSync(h);
    if (local && local.owner && local.owner !== u.id) return { ok: false, why: h + ' belongs to another account on this deck. pick another handle.', field: 'handle' };
    if (local && usable(local)) { const rec = migrate(local); rec.owner = u.id; rec.pass = null; if (!await Storage.remote.save(h, rec)) return { ok: false, why: 'your Drive did not take the record. try again.', field: 'handle' };
      Storage.local.remove(h); if (Storage.local.current() === h) Storage.local.setCurrent(null); names = (names || []).concat(h).sort(); state = rec; run = null; setLast(h); log('Handle bound to ' + (u.email || u.name)); return { ok: true, isNew: false }; }
    return openBound(h, u); }
  function logout(){ if (state.owner) flush(true); else save(); run = null; state = fresh(); dirty = false; Storage.local.setCurrent(null); }
  if (typeof document !== 'undefined' && document.addEventListener) document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && state.owner) flush(true); });
  // no exportSave / importSave on purpose: the deck syncs after every talk and every gig, and that is the only save there is.
  // sign-in: check the Drive folder, move this account's records that older builds kept in the browser up to Drive, list the handle names.
  // records load one at a time, when the player picks a handle. another handle on a shared deck stays on the deck.
  function onAuth(user){ linkP = link(user); return linkP; }
  async function link(user){ const draw = () => { if (window.UI) UI.render(); };
    if (!user) { Storage.useLocal(); names = null; driveOk = null; if (state.owner) { run = null; state = fresh(); dirty = false; } setLast(null); return draw(); }
    if (state.owner && state.owner !== user.id) { run = null; state = fresh(); dirty = false; }
    if (!Auth.token()) return draw();
    linking = true; draw();
    try { driveOk = await checkDrive(); if (!driveOk) return;
      if (state.handle && !state.owner) { const h = state.handle; state.owner = user.id; state.pass = null; Storage.local.remove(h); Storage.local.setCurrent(null); setLast(h); log('Handle bound to ' + (user.email || user.name)); dirty = true; }
      for (const h of Storage.local.listSync()) { const local = Storage.local.loadSync(h); if (!local || local.owner !== user.id) continue; const remote = await Storage.remote.load(h); if (usable(local) && (!remote || (local.updated || 0) > (remote.updated || 0)) && !await Storage.remote.save(h, local)) continue; Storage.local.remove(h); }
      names = await Storage.remote.list(); if (dirty) await flush(true);
    } catch (e) { console.warn('auth link', e); } finally { linking = false; draw(); } }
  if (window.Auth) Auth.onChange(onAuth);
  const flushNow = () => flush(true);
  // closing the tab with a Google record not yet in Drive: push it, and let the browser ask before it goes.
  window.addEventListener('beforeunload', e => { const unsaved = state.owner && (dirty || inflight); Telemetry.touch(state); if (!state.owner) return save(); if (unsaved) { flush(true); e.preventDefault(); e.returnValue = ''; } });

  window.Game = { get state(){ return state; }, get run(){ return run; }, save, log, classFor, nextClass, classRank, levelById, stageOf, readLevel, jobStatus, startJob, currentStep, evaluate, commit, useHint, answerOf, abort, finishJob, runSolution, reset, setHandle, claimHandle, myHandles, deckHandles, lastHandle, flushNow, get linking(){ return linking; }, get driveOk(){ return driveOk; }, get driveWhy(){ return driveWhy; }, recheckDrive(){ const u = gUser(); return u ? onAuth(u) : Promise.resolve(); }, get unsaved(){ return !!(state.owner && dirty); }, logout, riteFor, riteBlocking, body, sync, reload, profiles: () => Storage.local.listSync(), skill, allCards, cardUnlocked, dm, dev, addRep, addCreds, pay, repOf, shop, fixer, codexStatus, nightDone, licenseRecord, setLicense, get completed(){ return !!state.completedAt; }, stats: () => Telemetry.summary(state, { levels: STAGES.reduce((a, s) => a + s.levels.length, 0), read: Object.keys(state.read).length, jobs: JOBS.length, done: Object.keys(state.jobsDone).length, roster: state.roster, retention: SRS.retention(state.cards), cards: allCards().length, unlocked: allCards().filter(cardUnlocked).length }), LEVEL_NAMES, LEVEL_AT, VERSION };
})();
