/* game.js — state, progression, and the two-layer rules.
   LAYER 1 (Grid): reading a level "slots" a skill into the deck at level 0. No XP for reading.
   LAYER 2 (Jobs): a skill levels only when used in a practicum step WITHOUT a hint (clean use).
   Rep comes from jobs. Rep sets class. Class + reads gate jobs. Higher-class jobs nest lower-class steps. */
(function(){
  const KEY = 'netrun-ccna-save-v1';
  const LEVEL_NAMES = ['SLOTTED', 'SYNCED', 'WIRED', 'BURNED-IN'];
  const LEVEL_AT = [0, 1, 3, 6]; // clean uses needed

  const fresh = () => ({ handle: '', rep: 0, read: {}, skills: {}, jobsDone: {}, log: [], created: Date.now() });
  // one save per handle; the current handle is remembered so a reload resumes
  const PKEY = h => 'netrun-ccna-profile:' + h, CUR = 'netrun-ccna-current';
  let state = fresh();
  function load(h){ try { const s = JSON.parse(localStorage.getItem(PKEY(h)) || 'null'); if (s) return Object.assign(fresh(), s); } catch (e) {} return Object.assign(fresh(), { handle: h }); }
  try { const cur = localStorage.getItem(CUR); if (cur) state = load(cur); else { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && s.handle) { state = Object.assign(fresh(), s); localStorage.setItem(PKEY(s.handle), JSON.stringify(state)); localStorage.setItem(CUR, s.handle); localStorage.removeItem(KEY); } } } catch (e) {}
  const save = () => { try { if (state.handle) { localStorage.setItem(PKEY(state.handle), JSON.stringify(state)); localStorage.setItem(CUR, state.handle); } } catch (e) {} };
  function profiles(){ const o = []; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('netrun-ccna-profile:')) o.push(k.slice(20)); } } catch (e) {} return o.sort(); }
  function logout(){ save(); run = null; state = fresh(); try { localStorage.removeItem(CUR); } catch (e) {} }
  const log = (s) => { state.log.unshift({ t: Date.now(), s }); state.log = state.log.slice(0, 200); save(); };

  const classFor = rep => { let c = CLASSES[0]; for (const k of CLASSES) if (rep >= k.min) c = k; return c; };
  const nextClass = rep => CLASSES.find(k => k.min > rep) || null;
  const classRank = id => CLASSES.findIndex(k => k.id === id);

  const levelById = id => { for (const st of STAGES) for (const l of st.levels) if (l.id === id) return l; return null; };
  const stageOf = lid => STAGES.find(st => st.levels.some(l => l.id === lid));

  function skill(id){ return state.skills[id] || (state.skills[id] = { uses: 0, clean: 0, level: 0, slotted: false }); }
  function skillLevel(clean){ let lv = 0; LEVEL_AT.forEach((n, i) => { if (clean >= n) lv = i; }); return lv; }

  function readLevel(id){
    const l = levelById(id); if (!l) return;
    const first = !state.read[id]; state.read[id] = Date.now();
    (l.unlocks || []).forEach(s => { const k = skill(s); if (!k.slotted) { k.slotted = true; } });
    if (first) log('Synced with ' + NPCS[l.npc].name + ' — "' + l.title + '"');
    save(); return first;
  }

  function jobStatus(job){
    const me = classFor(state.rep); const locked = [];
    if (classRank(job.cls) > classRank(me.id)) locked.push({ kind: 'class', text: 'Needs Class ' + job.cls + ' rep (' + CLASSES[classRank(job.cls)].min + ')' });
    (job.requires || []).forEach(r => { if (!state.read[r]) { const l = levelById(r); locked.push({ kind: 'read', id: r, text: 'Talk to ' + NPCS[l.npc].name + ': "' + l.title + '"' }); } });
    return { locked, done: state.jobsDone[job.id] || null };
  }

  // ---- a run ----------------------------------------------------------------
  let run = null;
  function startJob(id){
    const job = JOBS.find(j => j.id === id); if (!job) return null;
    // deep-ish clone of topology so `removed` flags reset per run
    const topo = job.topo ? JSON.parse(JSON.stringify(job.topo)) : null;
    const devices = {};
    job.devices.forEach(n => { const shows = job.topo ? stpShowsFor(topo) : ((job.shows && job.shows[n]) || {}); if (job.shows && job.shows[n] && job.topo) Object.assign(shows, job.shows[n]);
      devices[n] = new Sim.Device(n, { shows, banner: n + ' con0 is now available\n\nPress RETURN to get started.' }); });
    run = { job, topo, devices, step: 0, hinted: {}, done: [], selected: null, feedback: null, calc: {}, choice: null, active: job.devices[0], history: [] };
    run.ctx = { job, topo, devices, compute: (vlan) => Stp.compute(topo, vlan || 1, devices), get selected(){ return run.selected; } };
    log('Jacked in: ' + job.title);
    return run;
  }
  function stpShowsFor(topo){ // jobs.js builds shows against its own topo object; rebuild against the cloned one
    return {
      'show spanning-tree': (d, all) => Stp.render(topo, 1, d.name, all), 'show spanning-tree vlan 1': (d, all) => Stp.render(topo, 1, d.name, all),
      'show spanning-tree vlan 10': (d, all) => Stp.render(topo, 10, d.name, all), 'show spanning-tree vlan 20': (d, all) => Stp.render(topo, 20, d.name, all),
      'show spanning-tree summary': (d, all) => { const c = Stp.compute(topo, 1, all).switches[d.name]; return 'Switch is in ' + c.cfg.mode + ' mode\nRoot bridge for: ' + (c.isRoot ? 'VLAN0001' : 'none') + '\nPortfast Default            is ' + (c.cfg.portfastDefault ? 'enabled' : 'disabled') + '\nPortFast BPDU Guard Default is ' + (c.cfg.bpduguardDefault ? 'enabled' : 'disabled'); },
      'show vlan brief': (d) => { const v = { 1: 'default' }; d.lines.forEach(r => { let m; if (r.mode === 'config' && (m = r.line.match(/^vlan ([\d,\-]+)$/))) m[1].split(',').forEach(x => { const [a, b] = x.split('-').map(Number); for (let i = a; i <= (b || a); i++) v[i] = v[i] || ('VLAN' + String(i).padStart(4, '0')); }); if (r.mode === 'config-vlan' && (m = r.line.match(/^name (\S+)$/))) { const id = +(r.ctx.replace('vlan ', '').split(/[,-]/)[0]); v[id] = m[1]; } });
        return 'VLAN Name                             Status    Ports\n---- -------------------------------- --------- -------------------\n' + Object.keys(v).map(k => String(k).padEnd(5) + v[k].padEnd(33) + 'active').join('\n'); },
      'show interfaces status': (d, all) => { const c = Stp.compute(topo, 1, all).switches[d.name]; return 'Port      Name   Status       Vlan  Duplex Speed Type\n' + Object.values(c.ports).map(p => Stp.shortName(p.name).padEnd(10) + ''.padEnd(7) + (p.errdisabled ? 'err-disabled' : p.shutdown ? 'disabled    ' : 'connected   ') + ' ' + (p.to && !p.host ? 'trunk' : '1    ') + ' a-full ' + (p.kind === 'gi' ? 'a-1000' : 'a-100 ') + ' 10/100' + (p.kind === 'gi' ? '/1000' : '') + 'BaseTX').join('\n'); }
    };
  }

  function currentStep(){ return run ? run.job.steps[run.step] : null; }

  function evaluate(){
    const st = currentStep(); if (!st) return { ok: false, why: 'no step' };
    if (st.type === 'find') return { ok: run.selected === st.target, why: run.selected ? 'That is ' + run.selected + '. Look again.' : 'Click a node on the map first.' };
    if (st.type === 'choice') return { ok: run.choice === st.a, why: run.choice == null ? 'Pick an answer.' : 'Not that one.' };
    if (st.type === 'calc') { const bad = st.fields.filter(f => !f.check(run.calc[f.key] || '')); return { ok: bad.length === 0, why: bad.length ? 'Check: ' + bad.map(f => f.label).join(' · ') : '' , bad: bad.map(f => f.key) }; }
    if (st.type === 'cmd') {
      let missing = [];
      if (st.need) missing = Sim.satisfied(run.devices, st.need);
      let ok = missing.length === 0;
      if (ok && st.check) { try { ok = !!st.check(run.devices, run.ctx); } catch (e) { console.error(e); ok = false; } }
      return { ok, why: ok ? '' : (missing.length ? 'The transcript does not show it yet' + (missing[0].dev ? ' on ' + missing[0].dev : '') + '.' : 'The state is not there yet. Look at the tree.') };
    }
    return { ok: false, why: '?' };
  }

  function commit(){
    const st = currentStep(); const r = evaluate();
    if (!r.ok) { run.feedback = { ok: false, text: r.why, bad: r.bad }; run.fails = (run.fails || 0) + 1; return r; }
    const clean = !run.hinted[run.step];
    const k = skill(st.skill); k.uses++; if (clean) k.clean++;
    const before = k.level; k.level = skillLevel(k.clean); k.slotted = true;
    const leveled = k.level > before ? { skill: st.skill, level: k.level } : null;
    run.done.push({ step: run.step, clean, leveled });
    if (st.onPass) { try { st.onPass(run.ctx); } catch (e) { console.error(e); } }
    run.feedback = { ok: true, text: st.ok || 'Done.', leveled };
    run.step++; run.selected = null; run.choice = null; run.calc = {};
    save();
    if (run.step >= run.job.steps.length) return finishJob();
    return r;
  }

  function useHint(){ run.hinted[run.step] = true; return currentStep().hint; }

  function finishJob(){
    const job = run.job; const prev = state.jobsDone[job.id];
    const hintedCount = Object.keys(run.hinted).length;
    let rep = job.rep; if (prev) rep = Math.round(rep * 0.4);
    rep = Math.max(Math.round(job.rep * 0.2), Math.round(rep * Math.max(0.3, 1 - 0.1 * hintedCount)));
    const oldClass = classFor(state.rep).id; state.rep += rep; const newClass = classFor(state.rep).id;
    state.jobsDone[job.id] = { times: (prev ? prev.times : 0) + 1, last: Date.now(), best: Math.max(prev ? prev.best : 0, run.done.filter(d => d.clean).length) };
    const leveled = run.done.filter(d => d.leveled).map(d => d.leveled);
    log('Gig done: ' + job.title + ' (+' + rep + ' rep' + (hintedCount ? ', ' + hintedCount + ' hinted' : ', clean') + ')');
    if (newClass !== oldClass) log('PROMOTED to Class ' + newClass);
    save();
    run.result = { rep, hintedCount, leveled, promoted: newClass !== oldClass ? newClass : null, repeat: !!prev };
    return { ok: true, finished: true, result: run.result };
  }

  function abort(){ if (run) log('Jacked out early: ' + run.job.title); run = null; }
  function reset(){ const h = state.handle; try { localStorage.removeItem(PKEY(h)); } catch (e) {} state = fresh(); state.handle = h; run = null; save(); }
  function setHandle(h){ h = h.trim().slice(0, 18); if (!h) return false; const isNew = !profiles().includes(h); state = load(h); state.handle = h; save(); if (isNew) log('Handle registered: ' + h); return true; }
  function exportSave(){ return JSON.stringify(state); }
  function importSave(txt){ try { const s = JSON.parse(txt); if (s && typeof s.rep === 'number') { state = Object.assign(fresh(), s); save(); return true; } } catch (e) {} return false; }

  window.Game = { get state(){ return state; }, get run(){ return run; }, save, log, classFor, nextClass, classRank, levelById, stageOf, readLevel, jobStatus, startJob, currentStep, evaluate, commit, useHint, abort, reset, setHandle, logout, profiles, exportSave, importSave, skill, LEVEL_NAMES, LEVEL_AT };
})();
