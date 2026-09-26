/* engine/srs.js — spaced repetition for flash cards (Leitner boxes on real time).
   Card state: { box, due, seen, correct, wrong, streak, last, ms:[...] }. Box 0 = new/failed. */
(function(){
  const MIN = 60e3, HOUR = 3600e3, DAY = 86400e3;
  const INTERVALS = [10 * MIN, HOUR, DAY, 3 * DAY, 7 * DAY, 21 * DAY, 60 * DAY];
  const fresh = () => ({ box: 0, due: 0, seen: 0, correct: 0, wrong: 0, streak: 0, last: 0, ms: [] });
  function grade(st, correct, now, ms){
    st = Object.assign(fresh(), st || {}); st.seen++; st.last = now; if (ms != null) { st.ms.push(ms); st.ms = st.ms.slice(-10); }
    if (correct) { st.correct++; st.streak++; st.box = Math.min(INTERVALS.length - 1, st.box + 1); }
    else { st.wrong++; st.streak = 0; st.box = Math.max(0, st.box - 2); }
    st.due = now + INTERVALS[st.box]; return st;
  }
  // which cards are due: unlocked (their level was read), and (never seen, or due passed)
  function due(cards, states, unlocked, now){ return cards.filter(c => unlocked(c) && (!states[c.id] || states[c.id].due <= now)); }
  // pick n, favouring low boxes and long-unseen cards; deterministic-ish with a seed
  function pick(dueCards, states, n, seed){ let s = (seed || Date.now()) >>> 0; const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return (s % 1000) / 1000; };
    const w = dueCards.map(c => { const st = states[c.id]; const box = st ? st.box : 0; return { c, w: (8 - box) + (st && st.wrong ? st.wrong : 0) + rnd() * 2 }; }).sort((a, b) => b.w - a.w); return w.slice(0, n).map(x => x.c); }
  function retention(states){ const s = Object.values(states); const seen = s.filter(x => x.seen); if (!seen.length) return null; const strong = seen.filter(x => x.box >= 3).length; return { cards: seen.length, strong, weak: seen.filter(x => x.box <= 1).length, accuracy: Math.round(100 * seen.reduce((a, x) => a + x.correct, 0) / Math.max(1, seen.reduce((a, x) => a + x.seen, 0))) }; }
  window.SRS = { INTERVALS, fresh, grade, due, pick, retention };
})();
