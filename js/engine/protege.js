/* engine/protege.js — protégés: the flash-card mechanic wearing a face.
   Every protégé is a young runner who looks up to the player. They get sent on their own gigs and DM the player
   when stuck. The DM is a flash card. Answer right and in time: they get through. Answer wrong or too late:
   their situation escalates. At danger 3 they are flatlined by the client and their orphan joins the crew.
   Team size gates bigger gigs (job.team = { min: 2 }), so memory and practicum pull on each other.
   Voice lines live in js/data/protege-lines.js (content). This file is machinery. */
(function(){
  const FIRST = ['Jun', 'Rosa', 'Teo', 'Mika', 'Dev', 'Anaya', 'Kofi', 'Lena', 'Ravi', 'Sol', 'Ines', 'Yara', 'Bo', 'Niko', 'Priya', 'Cal', 'Amara', 'Ezra', 'Noor', 'Tomas', 'Wren', 'Idris', 'Suki', 'Mateo', 'Hana', 'Luca', 'Zia', 'Oren', 'Tali', 'Kai'];
  const HANDLE = ['byte', 'stray', 'echo', 'glitch', 'moth', 'pixel', 'static', 'spark', 'nib', 'flick', 'wire', 'dot', 'fuse', 'blip', 'tick', 'zero', 'ash', 'lumen', 'volt', 'bit'];
  const rng = seed => { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return (s % 10000) / 10000; }; };
  const T = () => (window.PROTEGE_LINES || {});
  const pickLine = (arr, r) => arr && arr.length ? arr[Math.floor(r() * arr.length)] : '';
  const fill = (s, p, extra) => (s || '').replace(/\{name\}/g, p.name).replace(/\{handle\}/g, p.handle).replace(/\{you\}/g, extra && extra.you || 'you').replace(/\{job\}/g, p.job || 'the job').replace(/\{client\}/g, p.client || 'the client').replace(/\{sib\}/g, extra && extra.sib || 'big sib');

  function make(seedNum, parent){ const r = rng(seedNum * 7919 + 13); const name = FIRST[Math.floor(r() * FIRST.length)]; const handle = HANDLE[Math.floor(r() * HANDLE.length)] + Math.floor(r() * 90 + 10);
    return { id: 'p' + seedNum, name, handle, joined: Date.now(), status: 'active', danger: 0, answered: 0, saved: 0, failed: 0, lineage: parent || null, job: null, client: null, look: { seed: 'protege' + seedNum, skin: ['#f0c9a5', '#c89a6f', '#8d5a3b', '#e8b58f', '#d8a274'][Math.floor(r() * 5)], hair: ['#1a1a22', '#5a3f8a', '#c8481a', '#3ff6ff', '#ff3fa4'][Math.floor(r() * 5)], hairStyle: ['short', 'bob', 'spiky', 'bun', 'mohawk'][Math.floor(r() * 5)], outfit: '#1c2438', accent: ['#3ff6ff', '#ff3fa4', '#4dff88', '#ffd23f'][Math.floor(r() * 4)], eyes: '#e6f1ff', hat: ['none', 'cap', 'beanie', 'headset'][Math.floor(r() * 4)], mood: 'smile' } }; }
  function recruit(roster, reason, parent){ const seq = (roster.seq || 0) + 1; roster.seq = seq; const p = make(seq, parent); p.recruitReason = reason; roster.list.push(p); return p; }
  const active = roster => roster.list.filter(p => p.status === 'active');
  const lost = roster => roster.list.filter(p => p.status === 'flatlined');
  function teamCheck(job, roster){ const need = job.team || null; if (!need) return { ok: true }; const n = active(roster).length; if (need.min && n < need.min) return { ok: false, text: 'Your crew is too thin. ' + n + ' running, this gig needs ' + need.min + '. Keep your protégés alive.' }; return { ok: true }; }

  // build a DM for a protégé holding a card
  function dm(p, card, extra){ const r = rng(Date.now() ^ (p.id.charCodeAt(1) << 8)); const L = T(); const jobs = L.jobs || ['a router install in Kabuki', 'a switch swap at the clinic', 'a corpo audit in Westbrook']; const clients = L.clients || ['a corpo tech', 'the building manager', 'a fixer']; p.job = p.job || jobs[Math.floor(r() * jobs.length)]; p.client = p.client || clients[Math.floor(r() * clients.length)];
    const open = fill(pickLine(L.open && L.open[p.danger] || L.open && L.open[0] || ['{name}: hey, quick one.'], r), p, extra); const seconds = (L.timers || [60, 45, 30])[Math.min(p.danger, 2)];
    return { id: 'dm' + Date.now(), protege: p.id, card: card.id, open, q: card.q, opts: card.opts || null, type: card.type || (card.opts ? 'choice' : 'text'), seconds, danger: p.danger, sent: Date.now() }; }
  // resolve an answer: returns the narrative outcome and mutates the protégé
  function resolve(p, roster, correct, timedOut, extra){ const r = rng(Date.now() ^ 99); const L = T(); let out = { correct, timedOut, flatlined: false, orphan: null, repDelta: 0, text: '' };
    if (correct) { p.answered++; p.saved++; if (p.danger > 0) p.danger--; out.repDelta = (L.rep && L.rep.correct) || 2; out.text = fill(pickLine(L.relief || ['{name}: okay. okay. that worked. thank you {sib}.'], r), p, extra); p.job = null; p.client = null; return out; }
    p.answered++; p.failed++; p.danger++; out.repDelta = -((L.rep && L.rep.wrong) || 5);
    if (p.danger >= 3) { p.status = 'flatlined'; p.flatlinedAt = Date.now(); out.flatlined = true; out.repDelta = -((L.rep && L.rep.flatline) || 15); const orphan = recruit(roster, 'orphan of ' + p.name, p.id); out.orphan = orphan; out.text = fill(pickLine(L.flatline || ['{name}: I think it is over for me, {sib}. Please take care of {orphan}.'], r), p, extra).replace(/\{orphan\}/g, orphan.name); return out; }
    out.text = fill(pickLine(L.escalate && L.escalate[p.danger] || ['{name}: that did not work. they are getting angry.'], r), p, extra); return out; }
  function decay(roster, now){ active(roster).forEach(p => { if (p.danger > 0 && p.lastDecay && now - p.lastDecay > 6 * 3600e3) { p.danger--; p.lastDecay = now; } if (!p.lastDecay) p.lastDecay = now; }); }

  window.Protege = { make, recruit, active, lost, teamCheck, dm, resolve, decay, fill };
})();
