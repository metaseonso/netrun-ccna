/* engine/protege.js — the crew. Every protégé is a young runner who looks up to the player, born into one of six
   archetypes (js/data/protege-lines.js). You send them on the risky gigs because the street has no junior tier.
   They call the player when stuck. Right and in time: they get through and the bond grows. Wrong or late: it
   escalates. At danger 3 the client does not let them leave; their orphan joins the crew carrying a keepsake.
   Gratitude at 3 / 6 / 10 saves. Trust lines at bond thresholds. Gifts from the shop: calm, antenna, burner.
   A Dispatch favor pulls a runner out. Team size gates bigger gigs (job.team = { min: 2 }). This file is machinery. */
(function(){
  const FIRST = ['Jun', 'Rosa', 'Teo', 'Mika', 'Dev', 'Anaya', 'Kofi', 'Lena', 'Ravi', 'Sol', 'Ines', 'Yara', 'Bo', 'Niko', 'Priya', 'Cal', 'Amara', 'Ezra', 'Noor', 'Tomas', 'Wren', 'Idris', 'Suki', 'Mateo', 'Hana', 'Luca', 'Zia', 'Oren', 'Tali', 'Kai'];
  const HANDLE = ['byte', 'stray', 'echo', 'glitch', 'moth', 'pixel', 'static', 'spark', 'nib', 'flick', 'wire', 'dot', 'fuse', 'blip', 'tick', 'zero', 'ash', 'lumen', 'volt', 'bit'];
  const ARCHS = ['kid', 'ghost', 'hustler', 'scholar', 'soldier', 'heart'];
  const rng = seed => { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return (s % 10000) / 10000; }; };
  const T = () => (window.PROTEGE_LINES || {});
  const pick = (arr, r) => Array.isArray(arr) && arr.length ? arr[Math.floor(r() * arr.length)] : (typeof arr === 'string' ? arr : '');
  // archetype line with common fallback: path like ['open', 2] or ['trust', 4] or ['gift', 'noodles']
  function line(p, path, r){ const L = T(); const dig = (root) => { let cur = root; for (const k of path) { if (cur == null) return null; cur = cur[k]; } return cur; }; const a = L.arch && L.arch[p.arch] ? dig(L.arch[p.arch]) : null; const v = (a && (Array.isArray(a) ? a.length : a)) ? a : dig(L.common || {}); return pick(v, r); }
  const fill = (s, p, extra) => (s || '').replace(/\{name\}/g, p.name).replace(/\{handle\}/g, p.handle).replace(/\{you\}/g, extra && extra.you || 'you').replace(/\{job\}/g, p.job || 'the job').replace(/\{client\}/g, p.client || 'the client').replace(/\{sib\}/g, extra && extra.sib || 'big sib').replace(/\{want\}/g, p.want || 'to get out of Watson').replace(/\{keepsake\}/g, p.keepsake || 'a cracked deck');

  function make(seedNum, parent, archOverride){ const r = rng(seedNum * 7919 + 13); const L = T(); const arch = archOverride || ARCHS[Math.floor(r() * ARCHS.length)]; const A = (L.arch && L.arch[arch]) || {};
    const name = FIRST[Math.floor(r() * FIRST.length)]; const handle = HANDLE[Math.floor(r() * HANDLE.length)] + Math.floor(r() * 90 + 10);
    return { id: 'p' + seedNum, name, handle, arch, joined: Date.now(), status: 'active', danger: 0, answered: 0, saved: 0, failed: 0, lineage: parent || null, job: null, client: null, want: pick(A.wants || L.wants, r), keepsake: parent ? pick(L.keepsakes, r) : null, timerBonus: 0, insurance: 0, milestones: [], trustSeen: [],
      look: { seed: 'protege' + seedNum, skin: ['#f0c9a5', '#c89a6f', '#8d5a3b', '#e8b58f', '#d8a274'][Math.floor(r() * 5)], hair: ['#1a1a22', '#5a3f8a', '#c8481a', '#3ff6ff', '#ff3fa4'][Math.floor(r() * 5)], hairStyle: ['short', 'bob', 'spiky', 'bun', 'mohawk'][Math.floor(r() * 5)], outfit: '#1c2438', accent: ['#3ff6ff', '#ff3fa4', '#4dff88', '#ffd23f'][Math.floor(r() * 4)], eyes: '#e6f1ff', hat: ['none', 'cap', 'beanie', 'headset'][Math.floor(r() * 4)], mood: arch === 'ghost' || arch === 'soldier' ? 'flat' : 'smile' } }; }
  function recruit(roster, reason, parent, arch){ const seq = (roster.seq || 0) + 1; roster.seq = seq; const p = make(seq, parent, arch); p.recruitReason = reason; roster.list.push(p); return p; }
  const active = roster => roster.list.filter(p => p.status === 'active');
  const lost = roster => roster.list.filter(p => p.status === 'flatlined');
  const archOf = p => (T().arch && T().arch[p.arch]) || { name: p.arch, tagline: '' };
  function bond(p){ const B = T().bond || { levels: ['closed', 'guarded', 'talking', 'trusts you', 'family'], at: [0, 1, 2, 4, 7] }; let i = 0; B.at.forEach((n, k) => { if (p.saved >= n) i = k; }); return { level: i, name: B.levels[i], next: B.at[i + 1] || null, max: B.levels.length - 1 }; }
  function teamCheck(job, roster){ const need = job.team || null; if (!need) return { ok: true }; const n = active(roster).length; if (need.min && n < need.min) return { ok: false, text: 'Your crew is too thin. ' + n + ' running, this gig needs ' + need.min + '. Keep your people alive.' }; return { ok: true }; }

  function dm(p, card, extra){ const r = rng(Date.now() ^ (p.id.charCodeAt(1) << 8)); const L = T(); p.job = p.job || pick(L.jobs, r); p.client = p.client || pick(L.clients, r);
    const open = fill(line(p, ['open', Math.min(p.danger, 2)], r) || '{name}: hey, quick one.', p, extra); const seconds = (L.timers || [60, 45, 30])[Math.min(p.danger, 2)] + (p.timerBonus || 0);
    return { id: 'dm' + Date.now(), protege: p.id, card: card.id, open, q: card.q, opts: card.opts || null, type: card.type || (card.opts ? 'choice' : 'text'), seconds, danger: p.danger, sent: Date.now(), bond: bond(p).name, arch: archOf(p).name }; }
  function resolve(p, roster, correct, timedOut, extra){ const r = rng(Date.now() ^ 99); const L = T(); const out = { correct, timedOut, flatlined: false, forgiven: false, orphan: null, repDelta: 0, credsDelta: 0, text: '', milestone: null, trust: null, bond: null };
    if (correct) { p.answered++; p.saved++; if (p.danger > 0) p.danger--; out.repDelta = (L.rep && L.rep.correct) || 2; out.credsDelta = (L.creds && L.creds.correct) || 5; out.text = fill(line(p, ['relief'], r), p, extra); p.job = null; p.client = null;
      const b = bond(p); out.bond = b; const at = (L.bond && L.bond.at) || [0, 1, 2, 4, 7]; if (at.includes(p.saved) && p.saved > 0 && !(p.trustSeen || []).includes(p.saved)) { p.trustSeen = (p.trustSeen || []).concat([p.saved]); out.trust = fill(line(p, ['trust', p.saved], r), p, extra) || null; }
      if (line(p, ['milestones', p.saved], r) && !(p.milestones || []).includes(p.saved) && (L.common.milestones || {})[p.saved] !== undefined) { p.milestones = (p.milestones || []).concat([p.saved]); out.milestone = fill(line(p, ['milestones', p.saved], r), p, extra); } return out; }
    p.answered++;
    if (p.insurance > 0) { p.insurance--; p.failed++; out.forgiven = true; out.text = fill(line(p, ['forgiven'], r), p, extra); p.job = null; p.client = null; return out; }
    p.failed++; p.danger++; out.repDelta = -((L.rep && L.rep.wrong) || 5);
    if (p.danger >= 3) { p.status = 'flatlined'; p.flatlinedAt = Date.now(); out.flatlined = true; out.repDelta = -((L.rep && L.rep.flatline) || 15); const orphan = recruit(roster, 'orphan of ' + p.name, p.id, p.arch === 'heart' ? 'kid' : undefined); out.orphan = orphan; out.text = fill(line(p, ['flatline'], r), p, extra).replace(/\{orphan\}/g, orphan.name); out.orphanIntro = fill(line(p, ['orphan'], r), orphan, extra).replace(/\{name\}/g, orphan.name); return out; }
    out.text = fill(line(p, ['escalate', Math.min(p.danger, 2)], r), p, extra); return out; }
  function decay(roster, now){ active(roster).forEach(p => { if (p.danger > 0 && p.lastDecay && now - p.lastDecay > 6 * 3600e3) { p.danger--; p.lastDecay = now; } if (!p.lastDecay) p.lastDecay = now; }); }
  function give(p, item){ const r = rng(Date.now()); const e = item.effect || {}; if (e.danger) p.danger = Math.max(0, p.danger + e.danger); if (e.timerBonus) p.timerBonus = (p.timerBonus || 0) + e.timerBonus; if (e.insurance) p.insurance = (p.insurance || 0) + e.insurance; return fill(line(p, ['gift', item.id], r) || '{name}: thank you.', p); }
  function favor(p){ const r = rng(Date.now()); const L = T(); p.danger = 0; p.job = null; p.client = null; p.favors = (p.favors || 0) + 1; return { dispatch: fill(pick((L.dispatch || {}).favor, r), p), them: fill(line(p, ['gift', 'favor'], r), p) }; }

  window.Protege = { make, recruit, active, lost, teamCheck, dm, resolve, decay, give, favor, fill, bond, archOf, ARCHS };
})();
