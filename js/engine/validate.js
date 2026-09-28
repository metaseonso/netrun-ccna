/* engine/validate.js — content lint. Runs in node (tools/check.js) and in the browser dev panel (?dev=1).
   Every error names where it is and what to fix. Warnings are coverage gaps, not breakage. */
(function(){
  const BEATS = new Set(['TALK', 'LORE', 'KIT', 'SYNC', 'SCENE']);
  const STEPS = new Set(['cmd', 'find', 'choice', 'multi', 'calc', 'order', 'form', 'text']);
  const TERM = /\[\[([^\]]+)\]\]/g;

  // words that break the world when a player can read them (commands and hints are exempt)
  const BANNED = /(flash ?cards?|anki|exam|exams|quiz|quizzes|lesson|lessons|tutorial|study|studying|revise|revision|framework|stub|ccna|200-301|jeremy|xp|level up|step \d+)/i;
  function all(C){
    const E = [], W = []; const err = (where, msg) => E.push({ where, msg }); const warn = (where, msg) => W.push({ where, msg });
    const world = (where, text) => { if (typeof text !== 'string') return; const m = text.match(BANNED); if (m) warn(where, 'out-of-world word "' + m[0] + '" — see STORY_BIBLE Part II vocabulary'); };
    const { STAGES = [], JOBS = [], NPCS = {}, GLOSSARY = {}, SKILLS = {}, CARDS = [], ARCS = [] } = C;
    const levelIds = new Set(), stageIds = new Set(), jobIds = new Set(); const termsUsed = new Set(), skillsSlotted = new Set(), skillsUsed = new Set(), levelsRequired = new Set(); const days = {};
    const checkTerms = (where, text) => { if (typeof text !== 'string') return; let m; TERM.lastIndex = 0; while ((m = TERM.exec(text))) { const k = m[1].toLowerCase(); termsUsed.add(k); if (!GLOSSARY[k]) err(where, 'term [[' + m[1] + ']] is not in the glossary'); } };
    const day = (n, kind, id) => { if (!Array.isArray(n)) return; n.forEach(d => { days[d] = days[d] || { levels: [], jobs: [], cards: 0 }; days[d][kind].push(id); }); };
    if (!ARCS.some(a => a.status === 'play')) err('ARCS', 'no playable arc');
    // ---- stages & levels
    STAGES.forEach((st, si) => { const w0 = 'stage ' + (st.id || '#' + si);
      if (!st.id) err(w0, 'missing id'); if (stageIds.has(st.id)) err(w0, 'duplicate stage id'); stageIds.add(st.id);
      if (!ARCS.some(a => a.id === st.arc)) err(w0, 'arc "' + st.arc + '" does not exist'); if (!NPCS[st.npc]) err(w0, 'npc "' + st.npc + '" does not exist'); if (!['live', 'stub'].includes(st.status)) err(w0, 'status must be live or stub');
      if (!Array.isArray(st.levels) || !st.levels.length) { err(w0, 'no levels'); return; }
      st.levels.forEach((l, li) => { const w = w0 + ' › level ' + (l.id || '#' + li);
        if (!l.id) err(w, 'missing id'); if (levelIds.has(l.id)) err(w, 'duplicate level id'); levelIds.add(l.id);
        if (!l.title) err(w, 'missing title'); world(w, l.title + ' ' + (l.sub || '')); if (!NPCS[l.npc]) err(w, 'npc "' + l.npc + '" does not exist'); if (!Array.isArray(l.day) || !l.day.length) err(w, 'day must be an array of day numbers'); day(l.day, 'levels', l.id);
        if (!Array.isArray(l.src) || !l.src.length) warn(w, 'no source links'); (l.unlocks || []).forEach(s => { if (!SKILLS[s]) err(w, 'unlocks unknown skill "' + s + '"'); skillsSlotted.add(s); }); if (!(l.unlocks || []).length) warn(w, 'unlocks no skill');
        if (!Array.isArray(l.beats) || !l.beats.length) { err(w, 'no beats'); return; }
        let syncs = 0, kits = 0;
        l.beats.forEach((b, bi) => { const wb = w + ' › beat ' + (bi + 1) + ' (' + b.k + ')'; if (!BEATS.has(b.k)) { err(wb, 'unknown beat kind'); return; }
          if (b.k === 'TALK' || b.k === 'LORE') { if (!b.text) err(wb, 'missing text'); checkTerms(wb, b.text); world(wb, b.text); }
          if (b.k === 'LORE') { if (!b.title) warn(wb, 'LORE beat has no title (braindances have title cards)'); if (!b.year) warn(wb, 'LORE beat has no year'); world(wb, b.title); }
          if (b.k === 'KIT') { kits++; if (!Array.isArray(b.kit) || !b.kit.length) err(wb, 'kit must be a non-empty array of {cmd, what}'); (b.kit || []).forEach((k, ki) => { if (!k.cmd || !k.what) err(wb + ' item ' + (ki + 1), 'kit item needs cmd and what'); checkTerms(wb, k.what); world(wb + ' item ' + (ki + 1), k.what); }); world(wb, b.text); }
          if (b.k === 'SCENE') { if (!Array.isArray(b.lines) || !b.lines.length) err(wb, 'scene needs lines'); (b.lines || []).forEach((ln, i) => { if (!ln.who || !ln.text) err(wb + ' line ' + (i + 1), 'line needs who and text'); world(wb + ' line ' + (i + 1), ln.text); if (ln.who && ln.who !== 'you' && ln.who !== 'narr' && !NPCS[ln.who] && !/^[A-Z]/.test(ln.who)) warn(wb + ' line ' + (i + 1), 'speaker "' + ln.who + '" is not an NPC id (shown as a plain name)'); checkTerms(wb, ln.text); });
            if (b.choice) { if (!Array.isArray(b.choice.opts) || b.choice.opts.length < 2) err(wb, 'choice needs 2+ opts'); (b.choice.opts || []).forEach((o, i) => { if (!o.say || !o.reply) err(wb + ' choice ' + (i + 1), 'option needs say and reply'); checkTerms(wb, o.reply); world(wb + ' choice ' + (i + 1), o.say + ' ' + o.reply); }); } }
          if (b.k === 'SYNC') { syncs++; const q = b.q; if (!q) { err(wb, 'missing q'); return; } if (!q.prompt) err(wb, 'q.prompt missing'); if (!Array.isArray(q.opts) || q.opts.length < 2) err(wb, 'q.opts needs 2+ options'); if (typeof q.a !== 'number' || !q.opts || q.a < 0 || q.a >= q.opts.length) err(wb, 'q.a must index into q.opts'); if (!q.yes || !q.no) err(wb, 'q.yes and q.no required'); if (!q.why) err(wb, 'q.why (plain explanation) required'); checkTerms(wb, q.prompt); world(wb, [q.prompt, q.yes, q.no, q.why].concat(q.opts || []).join(' ')); } });
        if (!syncs) warn(w, 'no SYNC question'); if (!kits) warn(w, 'no KIT beat (nothing carried out of the scene)');
        (l.cards || []).forEach((c, ci) => checkCard(c, w + ' › card ' + (ci + 1), err, warn, SKILLS, true)); }); });
    // ---- jobs
    const CLASSES = C.CLASSES || [{ id: 'D' }, { id: 'C' }, { id: 'B' }, { id: 'A' }];
    JOBS.forEach((j, ji) => { const w = 'job ' + (j.id || '#' + ji);
      if (!j.id) err(w, 'missing id'); if (jobIds.has(j.id)) err(w, 'duplicate job id'); jobIds.add(j.id);
      if (!CLASSES.some(c => c.id === j.cls)) err(w, 'cls "' + j.cls + '" is not a class'); if (typeof j.rep !== 'number') err(w, 'rep must be a number'); if (!NPCS[j.from]) err(w, 'from "' + j.from + '" is not an NPC'); if (!j.title) err(w, 'missing title'); if (!j.brief) err(w, 'missing brief'); if (!j.outro) warn(w, 'missing outro');
      (j.requires || []).forEach(r => { if (!levelIds.has(r)) err(w, 'requires unknown level "' + r + '"'); levelsRequired.add(r); });
      if (!Array.isArray(j.devices) || !j.devices.length) err(w, 'devices must list at least one console');
      if (j.net) { const D = j.net.devices || {}; if (!Object.keys(D).length) err(w, 'net.devices is empty'); (j.devices || []).forEach(d => { if (!D[d]) err(w, 'console "' + d + '" is not in net.devices'); });
        (j.net.links || []).forEach((L, li) => { if (!D[L.a]) err(w + ' link ' + (li + 1), 'unknown device ' + L.a); if (!D[L.b]) err(w + ' link ' + (li + 1), 'unknown device ' + L.b); ['router', 'switch', 'l3switch'].forEach(k => { if (D[L.a] && D[L.a].kind === k && !L.ap) err(w + ' link ' + (li + 1), L.a + ' needs a port name (ap)'); if (D[L.b] && D[L.b].kind === k && !L.bp) err(w + ' link ' + (li + 1), L.b + ' needs a port name (bp)'); }); });
        for (const n in D) { const d = D[n]; if (!['router', 'switch', 'l3switch', 'host', 'server', 'cloud', 'rogue', 'ap', 'wlc'].includes(d.kind)) err(w, 'device ' + n + ' has unknown kind "' + d.kind + '"'); if (d.kind === 'host' && !d.dhcp && !d.ip) warn(w, 'host ' + n + ' has neither ip nor dhcp'); if (d.kind === 'cloud' && !d.ip) err(w, 'cloud ' + n + ' needs ip'); } }
      else if (!j.topo) warn(w, 'no net or topo: console has no state engine (cmd steps can only use need)');
      if (j.map) { const ids = new Set((j.map.nodes || []).map(n => n.id)); (j.map.links || []).forEach((L, li) => { if (!ids.has(L.a) || !ids.has(L.b)) err(w + ' map link ' + (li + 1), 'links unknown node'); }); if (j.net) for (const n in j.net.devices) if (!ids.has(n) && j.net.devices[n].kind !== 'server') warn(w, 'device ' + n + ' is not drawn on the map'); }
      else warn(w, 'no map (auto layout will be used)');
      if (!Array.isArray(j.steps) || !j.steps.length) { err(w, 'no steps'); return; }
      j.steps.forEach((s, si) => { const ws = w + ' › step ' + (si + 1) + ' (' + s.type + ')'; if (!STEPS.has(s.type)) { err(ws, 'unknown step type'); return; }
        if (!s.skill) err(ws, 'missing skill'); else { if (!SKILLS[s.skill]) err(ws, 'skill "' + s.skill + '" not in SKILLS'); skillsUsed.add(s.skill); }
        if (!s.text) err(ws, 'missing text'); checkTerms(ws, s.text); if (!s.why) err(ws, 'missing why (plain explanation; feeds the CODEX)'); if (!s.ok) warn(ws, 'missing ok (reaction line)'); world(ws, [s.text, s.ok, s.why].concat(s.opts || []).join(' '));
        if (s.type === 'cmd' && !s.need && !s.check) err(ws, 'cmd step needs `need` and/or `check`'); if (s.type === 'cmd' && !s.hint) warn(ws, 'cmd step has no hint (Dispatch will have nothing to say)');
        if (s.type === 'find') { const ids = new Set(((j.map || {}).nodes || []).map(n => n.id)); const tg = s.targets || [s.target]; if (!tg.length || !tg[0]) err(ws, 'find needs target'); tg.forEach(t => { if (j.map && !ids.has(t)) err(ws, 'target "' + t + '" is not a map node'); }); }
        if (s.type === 'choice') { if (!Array.isArray(s.opts) || s.opts.length < 2) err(ws, 'choice needs 2+ opts'); if (typeof s.a !== 'number' || !s.opts || s.a < 0 || s.a >= s.opts.length) err(ws, 'a must index into opts'); }
        if (s.type === 'multi') { if (!Array.isArray(s.opts) || s.opts.length < 2) err(ws, 'multi needs opts'); if (!Array.isArray(s.answers) || !s.answers.length) err(ws, 'multi needs answers (array of indexes)'); }
        if (s.type === 'calc') { if (!Array.isArray(s.fields) || !s.fields.length) err(ws, 'calc needs fields'); (s.fields || []).forEach((f, fi) => { if (!f.key || !f.label || typeof f.check !== 'function') err(ws + ' field ' + (fi + 1), 'field needs key, label, check(value)'); }); if (!s.answer) warn(ws, 'calc has no answer text for the CODEX'); }
        if (s.type === 'order') { if (!Array.isArray(s.items) || s.items.length < 2) err(ws, 'order needs items in the correct order'); }
        if (s.type === 'form') { if (!Array.isArray(s.fields) || !s.fields.length) err(ws, 'form needs fields'); (s.fields || []).forEach((f, fi) => { if (!f.key || !f.label || !Array.isArray(f.options) || f.answer == null) err(ws + ' field ' + (fi + 1), 'form field needs key, label, options, answer'); }); }
        if (s.type === 'text') { if (typeof s.check !== 'function') err(ws, 'text step needs check(value)'); if (!s.answer) warn(ws, 'text step has no answer text for the CODEX'); } });
      if (!j.solution) warn(w, 'no golden solution (tools/check cannot prove this gig is passable)');
      if (Array.isArray(j.day)) day(j.day, 'jobs', j.id); });
    // ---- npcs, glossary, cards
    for (const id in NPCS) { const n = NPCS[id]; const w = 'npc ' + id; if (!n.name || !n.sys || !n.role) err(w, 'needs name, sys, role'); if (!n.look) warn(w, 'no look (procedural sprite will be default)'); }
    for (const k in GLOSSARY) { if (k !== k.toLowerCase()) err('glossary "' + k + '"', 'keys must be lowercase'); if (!GLOSSARY[k] || GLOSSARY[k].length < 20) warn('glossary "' + k + '"', 'definition is very short'); world('glossary "' + k + '"', GLOSSARY[k]); }
    for (const id in NPCS) world('npc ' + id, (NPCS[id].role || '') + ' ' + (NPCS[id].voice || ''));
    (C.SHOP || []).forEach(it => world('shop ' + it.id, [it.name, it.blurb, it.line, it.text].join(' ')));
    const PL = C.PROTEGE_LINES || {}; JSON.stringify(PL, (k, v) => { if (typeof v === 'string') world('protege-lines', v); return v; });
    const NEED = [['open', 0], ['open', 1], ['open', 2], ['relief'], ['escalate', 1], ['escalate', 2], ['trust', 1], ['trust', 2], ['trust', 4], ['trust', 7], ['milestones', 3], ['milestones', 6], ['milestones', 10], ['flatline'], ['orphan']];
    for (const id in (PL.arch || {})) { const A = PL.arch[id]; NEED.forEach(path => { let cur = A; for (const k of path) cur = cur == null ? null : cur[k]; if (!cur || (Array.isArray(cur) && !cur.length)) warn('archetype ' + id, 'missing lines for ' + path.join('.') + ' (falls back to common; players will notice)'); }); }
    CARDS.forEach((c, i) => { checkCard(c, 'card ' + (c.id || '#' + i), err, warn, SKILLS); world('card ' + (c.id || '#' + i), (c.q || '') + ' ' + (c.a || '')); if (c.day) { days[c.day] = days[c.day] || { levels: [], jobs: [], cards: 0 }; days[c.day].cards++; } });
    const cardIds = new Set(); CARDS.forEach(c => { if (cardIds.has(c.id)) err('card ' + c.id, 'duplicate card id'); cardIds.add(c.id); });
    // ---- coverage
    const skillsUnused = Object.keys(SKILLS).filter(s => !skillsUsed.has(s)); const skillsNeverSlotted = Object.keys(SKILLS).filter(s => !skillsSlotted.has(s));
    const termsUnused = Object.keys(GLOSSARY).filter(t => !termsUsed.has(t)); const levelsUnrequired = [...levelIds].filter(l => !levelsRequired.has(l));
    skillsUnused.forEach(s => warn('skill ' + s, 'no gig step exercises it (it can never level)')); skillsNeverSlotted.forEach(s => warn('skill ' + s, 'no level unlocks it'));
    const missingDays = []; for (let d = 1; d <= 63; d++) if (!days[d] || !days[d].levels.length) missingDays.push(d);
    return { errors: E, warnings: W, coverage: { days, missingDays, skillsUnused, skillsNeverSlotted, termsUnused, levelsUnrequired, counts: { stages: STAGES.length, levels: levelIds.size, jobs: JOBS.length, cards: CARDS.length, terms: Object.keys(GLOSSARY).length, npcs: Object.keys(NPCS).length } } };
  }
  function checkCard(c, w, err, warn, SKILLS, inLevel){ if (!c.id && !inLevel) err(w, 'card missing id'); if (!c.q || c.a == null || c.a === '') err(w, 'card needs q and a'); if (c.skill && !SKILLS[c.skill] && !/^day-\d+$/.test(c.skill)) err(w, 'card skill "' + c.skill + '" not in SKILLS'); if (!c.skill && !c.level) warn(w, 'card has no skill or level (cannot be unlocked)'); if (c.opts && (!Array.isArray(c.opts) || typeof c.a !== 'number')) err(w, 'choice card: a must index into opts'); }
  function format(res){ const lines = []; res.errors.forEach(e => lines.push('ERROR  ' + e.where + ' — ' + e.msg)); res.warnings.forEach(e => lines.push('warn   ' + e.where + ' — ' + e.msg)); const c = res.coverage; lines.push('', 'counts: ' + Object.entries(c.counts).map(([k, v]) => k + ' ' + v).join(' · '), 'days without a level: ' + (c.missingDays.length ? c.missingDays.join(',') : 'none')); return lines.join('\n'); }
  window.Validate = { all, format };
})();
