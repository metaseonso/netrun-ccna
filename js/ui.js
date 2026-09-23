/* ui.js — rendering. Vanilla DOM, no build. Views: intro, home, grid, level, jobs, run, deck, log. */
(function(){
  const $ = s => document.querySelector(s); const app = () => $('#app');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let view = 'home', cur = { stage: null, level: null, beat: 0, job: null, synced: null };

  // [[Term]] → glowing unique-NPC style term with hover definition
  function rich(text){
    return esc(text).replace(/\[\[([^\]]+)\]\]/g, (m, t) => { const def = GLOSSARY[t.toLowerCase()] || 'See the codex.'; return '<span class="term" data-def="' + esc(def) + '">' + esc(t) + '</span>'; })
      .replace(/"([^"]{2,80}?)"/g, (m, q) => /^[a-z0-9 \-\/\.\,]+$/i.test(q) && /^(show|spanning-tree|configure|interface|enable|write|copy|ip |vlan|hostname|switchport|do |no |root|end$)/i.test(q) ? '<code>' + q + '</code>' : m);
  }
  function toast(msg, cls){ let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); } const d = document.createElement('div'); d.className = cls || ''; d.textContent = msg; t.appendChild(d); setTimeout(() => d.remove(), 4200); }

  function npcEl(id, size){
    const n = NPCS[id]; const wrap = document.createElement('span'); wrap.style.display = 'inline-block';
    const img = new Image(); img.alt = n.name; img.src = 'assets/npc/' + id + '.png';
    const cv = document.createElement('canvas'); Sprite.animate(cv, n.look);
    img.onload = () => { wrap.innerHTML = ''; wrap.appendChild(img); }; img.onerror = () => { if (!wrap.contains(cv)) { wrap.innerHTML = ''; wrap.appendChild(cv); } };
    wrap.appendChild(cv); return wrap;
  }

  // ---- HUD ------------------------------------------------------------------
  function hud(){
    const s = Game.state, c = Game.classFor(s.rep), nx = Game.nextClass(s.rep);
    const pct = nx ? Math.round(((s.rep - c.min) / (nx.min - c.min)) * 100) : 100;
    const openJobs = JOBS.filter(j => Game.jobStatus(j).locked.length === 0 && !s.jobsDone[j.id]).length;
    return '<div class="hud"><div class="logo">NETRUN<small>://</small>CCNA</div>' +
      '<div class="handle">handle <b>' + esc(s.handle || '—') + '</b></div><span class="cls ' + c.id + '">CLASS ' + c.id + '</span>' +
      '<div class="rep"><span>REP ' + s.rep + (nx ? ' / ' + nx.min + ' → Class ' + nx.id : ' · MAX for this arc') + '</span><div class="bar"><i style="width:' + pct + '%"></i></div></div>' +
      '<div class="nav">' + [['home', 'MAP'], ['grid', 'GRID'], ['jobs', 'JOBS'], ['deck', 'DECK'], ['log', 'LOG']].map(([v, l]) => '<button data-v="' + v + '" class="' + (view === v || (v === 'grid' && view === 'level') || (v === 'jobs' && view === 'run') ? 'on' : '') + '">' + l + (v === 'jobs' && openJobs ? '<span class="badge">' + openJobs + '</span>' : '') + '</button>').join('') + '</div></div>';
  }

  // ---- views ----------------------------------------------------------------
  function intro(){
    return '<div class="intro"><h1 class="glitch">NETRUN<span>://</span>CCNA</h1><p>Two layers. <b>THE GRID</b>: talk to the systems themselves. They are people here. Learn what they are, what they did, what is in your deck.<br><b>JOBS</b>: Dispatch sends gigs. You jack in, see the fault, fix it the way it is really fixed. Skills level only when you use them unprompted. Rep climbs. Class climbs. Bigger gigs fold in the smaller ones.</p>' +
      '<p class="muted">Demo arc: The Grid · Stage 4 · Spanning Tree (Jeremy\'s IT Lab days 20–21). Exam bar: CCNA 200-301.</p>' +
      '<p><input id="handle" placeholder="your handle" maxlength="18" autocomplete="off"> <button class="btn mag" id="go">JACK IN</button></p></div>';
  }

  function home(){
    const s = Game.state; const reads = Object.keys(s.read).length; const total = STAGES.reduce((a, st) => a + st.levels.length, 0);
    const done = Object.keys(s.jobsDone).length;
    return '<div class="panel"><h2>JOURNEY MAP</h2><div class="muted">one arc per discipline. rep and class carry across. only one is mapped so far.</div><div class="arcs" style="margin-top:12px">' +
      ARCS.map(a => '<div class="arc ' + (a.status === 'play' ? 'play' : 'lock') + '" ' + (a.status === 'play' ? 'data-v="grid"' : '') + '><div class="n">ARC ' + a.n + '</div><div class="t">' + a.title + '</div><div class="st">' + esc(a.sub) + '</div>' +
        (a.status === 'play' ? '<div style="margin-top:8px"><span class="tag on">playable</span><span class="tag">' + reads + '/' + total + ' synced</span><span class="tag">' + done + '/' + JOBS.length + ' gigs</span></div>' : '<div style="margin-top:8px"><span class="tag lock">signal lost · not yet mapped</span></div>') + '</div>').join('') + '</div></div>' +
      '<div class="grid2"><div class="panel"><h2>LAYER 1 · THE GRID</h2><p class="dim">Macro. Concepts. Each system is an NPC whose name gives it away. Glowing <span class="term" data-def="Like this. Hover any glowing term for the exam-grade definition.">terms</span> are the vocabulary the exam and the job both expect. Reading slots a skill into your deck at level 0. Nothing levels by reading.</p><button class="btn" data-v="grid">ENTER THE GRID</button></div>' +
      '<div class="panel"><h2>LAYER 2 · JOBS</h2><p class="dim">Micro. Practice. A HUD message from Dispatch, a live net map, a real console. A skill levels only when you use it without a hint. Repeat gigs for less rep but real consolidation. Class A gigs contain Class D work, packaged as one night.</p><button class="btn mag" data-v="jobs">OPEN INBOX</button></div></div>' +
      '<div class="footer">Built on notes by <a href="https://github.com/psaumur/CCNA_Course_Notes" target="_blank">psaumur/CCNA_Course_Notes</a> and <a href="https://github.com/sparrowjumpy/CCNA-Notes" target="_blank">sparrowjumpy/CCNA-Notes</a> (both following Jeremy\'s IT Lab). Lore drawn from real network security history. MIT.</div>';
  }

  function grid(){
    const s = Game.state; if (!cur.stage) cur.stage = STAGES.find(st => st.status === 'live').id;
    const st = STAGES.find(x => x.id === cur.stage);
    return '<div class="panel"><h2>THE GRID · ARC 01</h2><div class="stages"><div class="stagelist">' +
      STAGES.map(x => { const n = x.levels.filter(l => s.read[l.id]).length; return '<button data-stage="' + x.id + '" class="' + (x.id === cur.stage ? 'on' : '') + '">' + esc(x.title) + '<span class="p">' + n + '/' + x.levels.length + '</span><br><span class="muted">' + esc(x.sub) + '</span></button>'; }).join('') + '</div>' +
      '<div><div class="row" style="margin-bottom:10px">' + npcCard(st.npc) + '<div><div class="muted" style="font-size:11px;letter-spacing:.14em">' + (st.status === 'live' ? '<span class="tag on">demo stage · fully built</span>' : '<span class="tag">framework stub · intro only</span>') + '</div><div style="font-size:15px;font-weight:700;margin-top:4px">' + esc(NPCS[st.npc].name) + ' <span class="muted">· ' + esc(NPCS[st.npc].sys) + '</span></div><div class="dim">' + esc(NPCS[st.npc].role) + '</div></div></div>' +
      '<div class="levels">' + st.levels.map(l => '<div class="level ' + (s.read[l.id] ? 'done' : '') + '" data-level="' + l.id + '">' + (s.read[l.id] ? '<span class="chk">✓</span>' : '') + '<div class="who">' + esc(NPCS[l.npc].name) + '</div><div class="t">' + esc(l.title) + '</div><div class="s">' + esc(l.sub) + '</div></div>').join('') + '</div></div></div></div>';
  }
  function npcCard(id){ const w = document.createElement('div'); w.className = 'npcbox'; w.style.width = '64px'; const e = npcEl(id); e.querySelector('canvas,img').style.width = '64px'; e.querySelector('canvas,img').style.height = '64px'; w.appendChild(e); return w.outerHTML.replace('<canvas', '<canvas data-npc="' + id + '"'); }

  function level(){
    const l = Game.levelById(cur.level); const n = NPCS[l.npc]; const b = l.beats[cur.beat]; const last = cur.beat === l.beats.length - 1;
    let body = '';
    if (b.k === 'TALK') body = '<div class="speech"><div class="k">' + esc(n.name.toUpperCase()) + '</div>' + rich(b.text) + '</div>';
    if (b.k === 'LORE') body = '<div class="speech lore"><div class="k">LORE · REAL HISTORY</div>' + rich(b.text) + '</div>';
    if (b.k === 'KIT') body = '<div class="speech kit"><div class="k">DECK · SLOTTING</div>' + rich(b.text) + '<ul class="kitlist">' + b.kit.map(k => '<li><code>' + esc(k.cmd) + '</code> <span class="dim">' + rich(k.what) + '</span></li>').join('') + '</ul></div>';
    if (b.k === 'SYNC') { const q = b.q; body = '<div class="speech sync"><div class="k">SYNC CHECK · exam angle · no rep, no pressure</div>' + rich(q.prompt) + '<div class="opts">' + q.opts.map((o, i) => '<button data-opt="' + i + '" class="' + (cur.synced == null ? '' : i === q.a ? 'right' : i === cur.synced ? 'wrong' : '') + '">' + esc(o) + '</button>').join('') + '</div>' + (cur.synced == null ? '' : '<div style="margin-top:8px" class="' + (cur.synced === q.a ? 'good' : 'warn') + '">' + rich(cur.synced === q.a ? q.yes : q.no) + '</div>') + '</div>'; }
    return '<div class="panel"><div class="row" style="justify-content:space-between"><h2>' + esc(l.title) + '</h2><button class="btn ghost" data-v="grid">← GRID</button></div><div class="muted" style="font-size:11px">' + esc(l.sub) + '</div>' +
      '<div class="dlg" style="margin-top:14px"><div class="npcbox" id="npcbox"><div class="name">' + esc(n.name) + '</div><div class="sys">' + esc(n.sys) + '</div><div class="role">' + esc(n.role) + '</div></div>' +
      '<div>' + body + '<div class="dots">' + l.beats.map((x, i) => '<i class="' + (i <= cur.beat ? 'on' : '') + '"></i>').join('') + '</div><div class="row">' +
      (cur.beat > 0 ? '<button class="btn ghost" id="prev">BACK</button>' : '') + (!last ? '<button class="btn" id="next">NEXT ▸</button>' : '<button class="btn grn" id="finish">SYNC COMPLETE ✓</button>') +
      '<span class="muted" style="font-size:11px">' + (b.k === 'SYNC' && cur.synced == null ? 'answer, or skip — reading never levels a skill; using it in a gig does' : '') + '</span></div>' +
      '<div class="srcs">sources · ' + l.src.map(s => '<a href="' + s.url + '" target="_blank">' + esc(s.label) + '</a>').join(' · ') + ' · day ' + l.day.join(', ') + '</div></div></div></div>';
  }

  function jobs(){
    const s = Game.state; const list = JOBS.map(j => ({ j, st: Game.jobStatus(j) }));
    const sel = cur.job ? list.find(x => x.j.id === cur.job) : null;
    return '<div class="panel"><h2>INBOX · DISPATCH</h2><div class="inbox"><div>' + list.map(({ j, st }) => '<div class="msg ' + (st.locked.length ? 'lock' : '') + (cur.job === j.id ? ' on' : '') + '" data-job="' + j.id + '"><span class="cls ' + j.cls + '">' + j.cls + '</span><div class="from">FROM ' + esc(NPCS[j.from].name.toUpperCase()) + ' · +' + j.rep + ' REP</div><div class="t">' + esc(j.title) + '</div><div class="meta">' + (st.done ? '✓ done ×' + st.done.times + ' · repeat for 40%' : st.locked.length ? '🔒 ' + st.locked.length + ' requirement' + (st.locked.length > 1 ? 's' : '') : '● open') + '</div></div>').join('') + '</div>' +
      '<div>' + (sel ? jobDetail(sel.j, sel.st) : '<div class="muted">select a message. locked gigs tell you who to talk to first.</div>') + '</div></div></div>';
  }
  function jobDetail(j, st){
    return '<div class="row"><span class="cls ' + j.cls + '">CLASS ' + j.cls + '</span><b>' + esc(j.title) + '</b><span class="muted">from ' + esc(NPCS[j.from].name) + ' · +' + j.rep + ' rep' + (st.done ? ' (repeat: +' + Math.round(j.rep * 0.4) + ')' : '') + '</span></div>' +
      '<div class="brief">' + rich(j.brief) + '</div>' +
      '<div class="muted" style="font-size:11px">skills exercised: ' + [...new Set(j.steps.map(s => s.skill))].map(k => '<span class="tag">' + esc(SKILLS[k] || k) + '</span>').join('') + '</div>' +
      (st.locked.length ? '<h3>LOCKED</h3><ul class="reqs">' + st.locked.map(r => '<li class="warn">' + (r.kind === 'read' ? '<a data-level="' + r.id + '">' + esc(r.text) + '</a>' : esc(r.text)) + '</li>').join('') + '</ul>' : '<p><button class="btn mag" data-start="' + j.id + '">JACK IN ▸</button></p>');
  }

  // ---- net run ----------------------------------------------------------------
  function runView(){
    const r = Game.run; if (!r) { view = 'jobs'; return jobs(); }
    if (r.result) return resultView(r);
    const st = Game.currentStep(); const n = NPCS[r.job.from];
    return '<div class="panel"><div class="row" style="justify-content:space-between"><h2>NET RUN · ' + esc(r.job.title) + ' <span class="cls ' + r.job.cls + '" style="font-size:11px">CLASS ' + r.job.cls + '</span></h2><button class="btn ghost" id="abort">JACK OUT</button></div>' +
      '<div class="run"><div><div class="netmap" id="netmap"><div class="label">LIVE MAP · click nodes to inspect' + (r.topo ? ' · tree computed from your config' : '') + '</div></div>' +
      '<ol class="steps" style="margin-top:10px">' + r.job.steps.map((s, i) => '<li class="' + (i < r.step ? 'done' : i === r.step ? 'cur' : '') + (r.hinted[i] ? ' hinted' : '') + '">' + (i + 1) + '. ' + esc(SKILLS[s.skill] || s.skill) + (i === r.step ? ' ◂' : '') + '</li>').join('') + '</ol></div>' +
      '<div><div class="task"><div class="npcline"><span id="npcsmall"></span><div><div class="who">' + esc(n.name.toUpperCase()) + ' · step ' + (r.step + 1) + '/' + r.job.steps.length + '</div><div>' + rich(st.text) + '</div></div></div>' + stepInput(st, r) +
      (r.feedback ? '<div style="margin-top:8px" class="' + (r.feedback.ok ? 'good' : 'bad') + '">' + rich(r.feedback.text) + (r.feedback.leveled ? ' <span class="mag">▲ ' + esc(SKILLS[r.feedback.leveled.skill]) + ' → ' + Game.LEVEL_NAMES[r.feedback.leveled.level] + '</span>' : '') + '</div>' : '') +
      (r.hintShown ? '<div class="hintbox">' + esc(r.hintShown) + '</div>' : '') +
      '<div class="row" style="margin-top:10px"><button class="btn grn" id="commit">COMMIT ▸</button>' + (st.hint ? '<button class="btn ghost" id="hint">' + (r.hinted[r.step] ? 'HINT SHOWN' : 'HINT (no level-up this step)') + '</button>' : '') + '</div></div>' +
      (r.job.devices.length ? consoleView(r) : '') + '</div></div></div>';
  }
  function stepInput(st, r){
    if (st.type === 'choice') return '<div class="opts" style="margin-top:8px">' + st.opts.map((o, i) => '<button data-choice="' + i + '" class="' + (r.choice === i ? 'right' : '') + '" style="' + (r.choice === i ? 'border-color:var(--cyan);color:var(--cyan)' : '') + '">' + String.fromCharCode(65 + i) + '. ' + esc(o) + '</button>').join('') + '</div>';
    if (st.type === 'calc') return '<div class="calc" style="margin-top:8px">' + st.fields.map(f => '<label>' + esc(f.label) + '<input data-calc="' + f.key + '" value="' + esc(r.calc[f.key] || '') + '" class="' + (r.feedback && r.feedback.bad ? (r.feedback.bad.includes(f.key) ? 'no' : 'ok') : '') + '" autocomplete="off"></label>').join('') + '</div>';
    if (st.type === 'find') return '<div class="muted" style="margin-top:8px;font-size:12px">selected: <b class="warn">' + esc(r.selected || 'nothing yet') + '</b> — click a node on the map, then COMMIT.</div>';
    return '<div class="muted" style="margin-top:8px;font-size:12px">work in the console below, then COMMIT. abbreviations work (conf t, int g0/1, sh span, do sh run).</div>';
  }
  function consoleView(r){
    const d = r.devices[r.active];
    return '<div class="console"><div class="devs">' + r.job.devices.map(n => '<button data-dev="' + n + '" class="' + (n === r.active ? 'on' : '') + '">' + n + '</button>').join('') + '<span class="muted" style="padding:5px 10px;font-size:10px">' + esc(d.prompt()) + '</span></div>' +
      '<div class="out" id="conout">' + d.out.map(o => '<div class="' + o.t + '">' + esc(o.s) + '</div>').join('') + '</div>' +
      '<div class="in-row"><span id="prompt">' + esc(d.prompt()) + '</span><input id="conin" autocomplete="off" spellcheck="false" placeholder="type IOS here · ↑ history · Enter"></div></div>';
  }
  function drawMap(){
    const r = Game.run; const box = $('#netmap'); if (!r || !box) return; const m = r.job.map; const W = m.w || 520, H = m.h || 300;
    let comp = null; if (r.topo) { try { comp = r.ctx.compute(r.vlanView || 1); } catch (e) { console.error(e); } }
    const nodeCls = {}; const portRole = {};
    if (comp) { for (const n in comp.switches) { const s = comp.switches[n]; if (s.isRoot && !r.topo.switches[n].removed) nodeCls[n] = (nodeCls[n] || '') + ' root'; for (const pn in s.ports) portRole[n + '|' + pn] = s.ports[pn]; } }
    (m.alert || []).forEach(a => { if (!(r.topo && r.topo.switches[a] && r.topo.switches[a].removed)) nodeCls[a] = (nodeCls[a] || '') + ' alert'; });
    const pos = {}; m.nodes.forEach(n => pos[n.id] = n);
    let svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">';
    m.links.forEach(l => { const a = pos[l.a], b = pos[l.b]; if (!a || !b) return; let cls = 'link'; let hidden = false;
      const pa = l.ap ? portRole[l.a + '|' + l.ap] : null, pb = l.bp ? portRole[l.b + '|' + l.bp] : null;
      if (r.topo && r.topo.switches[l.b] && r.topo.switches[l.b].removed) hidden = true;
      if (pa && pa.errdisabled || pb && pb.errdisabled) cls += ' err'; else if (pa && pa.state === 'BLK' || pb && pb.state === 'BLK') cls += ' blocked'; else if ((m.alert || []).includes(l.b) || (m.alert || []).includes(l.a)) cls += ' hot';
      if (hidden) return;
      svg += '<line class="' + cls + '" x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '"/>';
      const tagAt = (p, from, to, txt, cls2) => { const dx = to.x - from.x, dy = to.y - from.y, L = Math.hypot(dx, dy) || 1; const x = from.x + dx / L * 34, y = from.y + dy / L * 34; svg += '<text class="ptag ' + cls2 + '" x="' + x + '" y="' + (y - 4) + '" text-anchor="middle">' + esc(txt) + '</text>'; };
      if (pa) tagAt(pa, a, b, Stp.shortName(l.ap) + ' ' + (pa.errdisabled ? 'ERR' : pa.role === 'Root' ? 'R' : pa.role === 'Altn' ? 'A' : pa.role === 'Desg' ? 'D' : ''), pa.state === 'BLK' ? 'blk' : pa.role === 'Root' ? 'root' : '');
      if (pb) tagAt(pb, b, a, Stp.shortName(l.bp) + ' ' + (pb.errdisabled ? 'ERR' : pb.role === 'Root' ? 'R' : pb.role === 'Altn' ? 'A' : pb.role === 'Desg' ? 'D' : ''), pb.state === 'BLK' ? 'blk' : pb.role === 'Root' ? 'root' : '');
      if (l.tag) svg += '<text class="ptag" x="' + ((a.x + b.x) / 2) + '" y="' + ((a.y + b.y) / 2 - 6) + '" text-anchor="middle">' + esc(l.tag) + '</text>'; });
    m.nodes.forEach(n => { if (r.topo && r.topo.switches[n.id] && r.topo.switches[n.id].removed) return; const c = 'node ' + (n.type === 'rogue' ? 'rogue ' : '') + (nodeCls[n.id] || '') + (r.selected === n.id ? ' sel' : ''); const s = n.small ? 14 : 22;
      svg += '<g class="' + c + '" data-node="' + n.id + '" transform="translate(' + n.x + ',' + n.y + ')">';
      if (n.type === 'switch' || n.type === 'rogue') svg += '<rect class="body" x="-' + (s + 6) + '" y="-' + (s / 2) + '" width="' + (2 * s + 12) + '" height="' + s + '" rx="3"/><path d="M-12 -3 h8 M-8 -6 l4 3 -4 3 M4 3 h8 M8 0 l-4 3 4 3" stroke="currentColor" fill="none" stroke-width="1.2" style="color:var(--cyan2)"/>';
      else if (n.type === 'router') svg += '<circle class="body" r="' + s + '"/><path d="M-10 0 h20 M4 -6 l6 6 -6 6 M-4 -6 l-6 6 6 6" stroke="var(--cyan2)" fill="none" stroke-width="1.5"/>';
      else if (n.type === 'pc') svg += '<rect class="body" x="-' + s + '" y="-' + (s * .7) + '" width="' + (2 * s) + '" height="' + (s * 1.2) + '" rx="2"/><rect x="-' + (s * .4) + '" y="' + (s * .5) + '" width="' + (s * .8) + '" height="3" fill="var(--line)"/>';
      else if (n.type === 'server') svg += '<rect class="body" x="-' + s + '" y="-' + (s * 1.1) + '" width="' + (2 * s) + '" height="' + (s * 2) + '" rx="2"/>';
      else svg += '<ellipse class="body" rx="' + (s + 8) + '" ry="' + (s * .7) + '"/>';
      svg += '<text y="' + (n.type === 'pc' ? s + 12 : s + 14) + '" text-anchor="middle">' + esc(n.label) + '</text></g>'; });
    svg += '</svg>'; box.innerHTML = '<div class="label">LIVE MAP · click a node to select' + (comp ? ' · tree computed from your config · R root port · D designated · A alternate (blocking) · ERR err-disabled' : '') + '</div>' + svg;
  }
  function resultView(r){
    const res = r.result; const c = Game.classFor(Game.state.rep);
    return '<div class="panel result"><h2>RUN COMPLETE</h2><div class="big">+' + res.rep + ' REP</div><div class="dim">' + (res.repeat ? 'repeat run · consolidation pays 40%' : 'first clear') + (res.hintedCount ? ' · ' + res.hintedCount + ' hinted step' + (res.hintedCount > 1 ? 's' : '') + ' (no level-up on those)' : ' · no hints. clean.') + '</div>' +
      (res.promoted ? '<div class="mag" style="font-family:var(--disp);font-size:20px;margin-top:10px">▲ PROMOTED · CLASS ' + res.promoted + '</div>' : '') +
      (res.leveled.length ? '<div class="lvls">' + res.leveled.map(l => '<div><span class="tag new">LEVEL UP</span> ' + esc(SKILLS[l.skill]) + ' → <b>' + Game.LEVEL_NAMES[l.level] + '</b></div>').join('') + '</div>' : '<div class="muted" style="margin-top:8px">no skill levelled this run — clean uses stack across runs: 1 → SYNCED, 3 → WIRED, 6 → BURNED-IN</div>') +
      '<div class="brief" style="text-align:left;margin-top:16px">' + rich(r.job.outro) + '</div><div class="row" style="justify-content:center"><button class="btn mag" data-v="jobs" id="backjobs">BACK TO INBOX</button><button class="btn" data-v="deck">VIEW DECK</button></div><div class="muted" style="margin-top:8px">now Class ' + c.id + ' · ' + Game.state.rep + ' rep</div></div>';
  }

  function deck(){
    const s = Game.state;
    return '<div class="panel"><h2>DECK · quickhacks you can run without prompting</h2><div class="muted">slotted by reading · levelled only by clean use in gigs · 1 → SYNCED · 3 → WIRED · 6 → BURNED-IN</div><div class="deck" style="margin-top:12px">' +
      Object.keys(SKILLS).map(k => { const sk = s.skills[k]; const lv = sk ? sk.level : 0; const next = Game.LEVEL_AT[lv + 1]; const pct = sk ? (next ? Math.round(((sk.clean - Game.LEVEL_AT[lv]) / (next - Game.LEVEL_AT[lv])) * 100) : 100) : 0;
        return '<div class="skill l' + lv + '"><div class="n">' + esc(SKILLS[k]) + '</div><div class="lv">' + (sk && sk.slotted ? Game.LEVEL_NAMES[lv] : 'NOT SLOTTED') + (sk ? ' · ' + sk.clean + ' clean / ' + sk.uses + ' uses' : '') + '</div><div class="bar"><i style="width:' + pct + '%"></i></div></div>'; }).join('') + '</div>' +
      '<h3>SAVE</h3><div class="row"><button class="btn ghost" id="export">EXPORT SAVE</button><button class="btn ghost" id="import">IMPORT SAVE</button><button class="btn ghost" id="wipe" style="border-color:var(--red);color:var(--red)">WIPE</button></div><textarea id="savebox" style="width:100%;height:60px;margin-top:8px;background:#050710;color:var(--ink2);border:1px solid var(--line);font:11px var(--mono)" placeholder="export writes JSON here; paste JSON here then IMPORT"></textarea></div>';
  }
  function logView(){ return '<div class="panel"><h2>LOG</h2><div class="log">' + (Game.state.log.length ? Game.state.log.map(l => '<div><time>' + new Date(l.t).toLocaleString() + '</time>' + esc(l.s) + '</div>').join('') : '<div class="muted">nothing yet.</div>') + '</div></div>'; }

  // ---- render + events -----------------------------------------------------
  function render(){
    const s = Game.state; const a = app();
    if (!s.handle) { a.innerHTML = intro(); $('#go').onclick = () => { Game.setHandle($('#handle').value); view = 'home'; render(); }; $('#handle').onkeydown = e => { if (e.key === 'Enter') $('#go').click(); }; $('#handle').focus(); return; }
    let body = '';
    if (view === 'home') body = home(); else if (view === 'grid') body = grid(); else if (view === 'level') body = level(); else if (view === 'jobs') body = jobs(); else if (view === 'run') body = runView(); else if (view === 'deck') body = deck(); else body = logView();
    a.innerHTML = hud() + body;
    // mount sprites
    a.querySelectorAll('canvas[data-npc]').forEach(c => { const id = c.getAttribute('data-npc'); const el = npcEl(id); const inner = el.querySelector('canvas,img'); inner.style.width = '64px'; inner.style.height = '64px'; c.replaceWith(el); });
    if (view === 'level') { const l = Game.levelById(cur.level); const box = $('#npcbox'); box.insertBefore(npcEl(l.npc), box.firstChild); }
    if (view === 'run' && Game.run && !Game.run.result) { $('#npcsmall').appendChild(npcEl(Game.run.job.from)); drawMap(); const o = $('#conout'); if (o) o.scrollTop = o.scrollHeight; const inp = $('#conin'); if (inp) { inp.focus(); } }
    window.scrollTo({ top: view === 'run' ? window.scrollY : 0 });
  }

  document.addEventListener('click', e => {
    const t = e.target.closest('[data-v],[data-stage],[data-level],[data-job],[data-start],[data-opt],[data-choice],[data-dev],[data-node],#next,#prev,#finish,#commit,#hint,#abort,#export,#import,#wipe'); if (!t) return;
    if (t.dataset.v) { if (view === 'run' && Game.run && !Game.run.result && t.dataset.v !== 'run') { if (!confirm('Jack out? Progress on this gig is lost.')) return; Game.abort(); } view = t.dataset.v; if (view === 'jobs' && Game.run && Game.run.result) Game.abort(); return render(); }
    if (t.dataset.stage) { cur.stage = t.dataset.stage; return render(); }
    if (t.dataset.level) { cur.level = t.dataset.level; cur.beat = 0; cur.synced = null; cur.stage = Game.stageOf(cur.level).id; view = 'level'; return render(); }
    if (t.dataset.job) { if (t.classList.contains('lock')) { cur.job = t.dataset.job; return render(); } cur.job = t.dataset.job; return render(); }
    if (t.dataset.start) { Game.startJob(t.dataset.start); view = 'run'; return render(); }
    if (t.dataset.opt) { cur.synced = +t.dataset.opt; return render(); }
    if (t.id === 'next') { cur.beat++; cur.synced = null; return render(); }
    if (t.id === 'prev') { cur.beat--; cur.synced = null; return render(); }
    if (t.id === 'finish') { const first = Game.readLevel(cur.level); if (first) toast('SYNCED · ' + Game.levelById(cur.level).title + ' · skills slotted'); view = 'grid'; return render(); }
    if (t.dataset.choice) { Game.run.choice = +t.dataset.choice; return render(); }
    if (t.dataset.dev) { Game.run.active = t.dataset.dev; return render(); }
    if (t.dataset.node) { Game.run.selected = t.dataset.node; Game.run.feedback = null; return render(); }
    if (t.id === 'commit') { const r = Game.run; if (Game.currentStep().type === 'calc') document.querySelectorAll('[data-calc]').forEach(i => r.calc[i.dataset.calc] = i.value); const res = Game.commit(); r.hintShown = null; if (res.ok) { toast(res.finished ? 'GIG COMPLETE' : 'STEP CLEARED', 'grn'); if (r.feedback && r.feedback.leveled) toast('LEVEL UP · ' + SKILLS[r.feedback.leveled.skill] + ' → ' + Game.LEVEL_NAMES[r.feedback.leveled.level], 'mag'); if (res.result && res.result.promoted) toast('PROMOTED · CLASS ' + res.result.promoted, 'yel'); } return render(); }
    if (t.id === 'hint') { Game.run.hintShown = Game.useHint(); return render(); }
    if (t.id === 'abort') { if (confirm('Jack out? Progress on this gig is lost.')) { Game.abort(); view = 'jobs'; render(); } return; }
    if (t.id === 'export') { $('#savebox').value = Game.exportSave(); return; }
    if (t.id === 'import') { if (Game.importSave($('#savebox').value)) { toast('SAVE IMPORTED'); render(); } else toast('bad save JSON', 'mag'); return; }
    if (t.id === 'wipe') { if (confirm('Wipe all progress?')) { Game.reset(); render(); } return; }
  });
  document.addEventListener('keydown', e => {
    const inp = e.target; if (!inp || inp.id !== 'conin') return; const r = Game.run; if (!r) return; const d = r.devices[r.active];
    if (e.key === 'Enter') { const raw = inp.value; r.history.push(raw); r.hIdx = r.history.length; d.exec(raw, r.devices); inp.value = ''; const o = $('#conout'); o.innerHTML = d.out.map(x => '<div class="' + x.t + '">' + esc(x.s) + '</div>').join(''); o.scrollTop = o.scrollHeight; $('#prompt').textContent = d.prompt(); document.querySelector('.console .devs .muted').textContent = d.prompt(); if (r.topo) drawMap(); }
    if (e.key === 'ArrowUp') { r.hIdx = Math.max(0, (r.hIdx == null ? r.history.length : r.hIdx) - 1); inp.value = r.history[r.hIdx] || ''; e.preventDefault(); }
    if (e.key === 'ArrowDown') { r.hIdx = Math.min(r.history.length, (r.hIdx == null ? r.history.length : r.hIdx) + 1); inp.value = r.history[r.hIdx] || ''; e.preventDefault(); }
    if (e.key === 'Tab') { e.preventDefault(); }
  });
  document.addEventListener('input', e => { if (e.target.dataset && e.target.dataset.calc && Game.run) Game.run.calc[e.target.dataset.calc] = e.target.value; });

  window.UI = { render, toast, go: v => { view = v; render(); } };
  document.addEventListener('DOMContentLoaded', render);
})();
