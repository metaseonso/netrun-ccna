/* engine/telemetry.js — timestamps, counters, and the numbers behind the STATS dashboard.
   Every attempt, hint, DM answer, rep change and session is an event with a time.
   Aggregates are kept incrementally so the dashboard is cheap; the raw event log is capped. */
(function(){
  const CAP = 4000;
  const freshStats = () => ({ steps: { attempts: 0, passes: 0, fails: 0, hints: 0, ms: 0, firstTry: 0 }, bySkill: {}, byType: {}, jobs: { started: 0, finished: 0, aborted: 0, ms: 0, byJob: {} }, dms: { asked: 0, correct: 0, wrong: 0, timeouts: 0, ms: 0, bySkill: {} }, reads: 0, repHistory: [], streak: { current: 0, best: 0 }, sessions: [], playMs: 0 });
  // fills in missing fields without replacing objects, so references held during an event stay live
  function ensure(state){ state.events = state.events || []; if (!state.stats) state.stats = freshStats(); const f = freshStats(); for (const k in f) { if (state.stats[k] == null) state.stats[k] = f[k]; else if (typeof f[k] === 'object' && !Array.isArray(f[k])) for (const kk in f[k]) if (state.stats[k][kk] == null) state.stats[k][kk] = f[k][kk]; } return state.stats; }
  const bucket = (o, k) => o[k] || (o[k] = { attempts: 0, passes: 0, fails: 0, hints: 0, ms: 0 });

  function event(state, type, data){ const st = ensure(state); const e = Object.assign({ t: Date.now(), type }, data || {}); state.events.push(e); if (state.events.length > CAP) state.events.splice(0, state.events.length - CAP); touch(state);
    switch (type) {
      case 'step_attempt': { const s = st.steps; s.attempts++; const sk = bucket(st.bySkill, e.skill), ty = bucket(st.byType, e.stepType); sk.attempts++; ty.attempts++;
        if (e.ok) { s.passes++; sk.passes++; ty.passes++; s.ms += e.ms || 0; sk.ms += e.ms || 0; ty.ms += e.ms || 0; if (e.failsBefore === 0 && !e.hinted) s.firstTry++; st.streak.current++; st.streak.best = Math.max(st.streak.best, st.streak.current); }
        else { s.fails++; sk.fails++; ty.fails++; st.streak.current = 0; } break; }
      case 'hint': { st.steps.hints++; bucket(st.bySkill, e.skill).hints++; break; }
      case 'job_start': { st.jobs.started++; const j = st.jobs.byJob[e.job] || (st.jobs.byJob[e.job] = { runs: 0, finished: 0, bestMs: null, fails: 0, hints: 0 }); j.runs++; break; }
      case 'job_finish': { st.jobs.finished++; st.jobs.ms += e.ms || 0; const j = st.jobs.byJob[e.job] || (st.jobs.byJob[e.job] = { runs: 0, finished: 0, bestMs: null, fails: 0, hints: 0 }); j.finished++; j.fails += e.fails || 0; j.hints += e.hints || 0; if (j.bestMs == null || (e.ms || 0) < j.bestMs) j.bestMs = e.ms || 0; break; }
      case 'job_abort': { st.jobs.aborted++; break; }
      case 'dm_answer': { const d = st.dms; d.asked++; if (e.timedOut) d.timeouts++; else if (e.ok) d.correct++; else d.wrong++; d.ms += e.ms || 0; const b = d.bySkill[e.skill] || (d.bySkill[e.skill] = { asked: 0, correct: 0 }); b.asked++; if (e.ok) b.correct++; break; }
      case 'rep': { st.repHistory.push({ t: e.t, rep: e.rep, why: e.why }); if (st.repHistory.length > 400) st.repHistory.splice(0, st.repHistory.length - 400); break; }
      case 'read': { st.reads++; break; }
    }
    return e; }
  function touch(state){ const st = ensure(state); const now = Date.now(); const s = st.sessions[st.sessions.length - 1]; if (s && now - s.end < 20 * 60e3) { st.playMs += now - s.end; s.end = now; } else st.sessions.push({ start: now, end: now }); if (st.sessions.length > 200) st.sessions.splice(0, st.sessions.length - 200); }

  // dashboard view model
  function summary(state, extra){ const st = ensure(state); const pct = (a, b) => b ? Math.round(100 * a / b) : null; const fmt = ms => ms == null ? '—' : ms < 60e3 ? Math.round(ms / 1000) + 's' : Math.round(ms / 60e3) + 'm ' + Math.round((ms % 60e3) / 1000) + 's';
    const skills = Object.keys(st.bySkill).map(k => { const b = st.bySkill[k]; return { skill: k, name: (window.SKILLS || {})[k] || k, attempts: b.attempts, passes: b.passes, fails: b.fails, accuracy: pct(b.passes, b.attempts), avgMs: b.passes ? Math.round(b.ms / b.passes) : null, hints: b.hints }; }).sort((a, b) => (a.accuracy == null ? 101 : a.accuracy) - (b.accuracy == null ? 101 : b.accuracy));
    const weak = skills.filter(s => s.attempts >= 2).slice(0, 3); const strong = skills.filter(s => s.attempts >= 2).slice(-3).reverse();
    const types = Object.keys(st.byType).map(k => ({ type: k, accuracy: pct(st.byType[k].passes, st.byType[k].attempts), avgMs: st.byType[k].passes ? Math.round(st.byType[k].ms / st.byType[k].passes) : null, attempts: st.byType[k].attempts }));
    return { steps: { attempts: st.steps.attempts, accuracy: pct(st.steps.passes, st.steps.attempts), firstTry: pct(st.steps.firstTry, st.steps.passes), avg: fmt(st.steps.passes ? st.steps.ms / st.steps.passes : null), hints: st.steps.hints, hintRate: pct(st.steps.hints, st.steps.passes) },
      jobs: { started: st.jobs.started, finished: st.jobs.finished, aborted: st.jobs.aborted, avg: fmt(st.jobs.finished ? st.jobs.ms / st.jobs.finished : null), byJob: st.jobs.byJob },
      dms: { asked: st.dms.asked, accuracy: pct(st.dms.correct, st.dms.asked), timeouts: st.dms.timeouts, avg: fmt(st.dms.asked ? st.dms.ms / st.dms.asked : null) },
      skills, weak, strong, types, streak: st.streak, repHistory: st.repHistory, sessions: st.sessions.length, playTime: fmt(st.playMs), reads: st.reads, fmt, extra: extra || {} }; }

  window.Telemetry = { event, ensure, summary, touch, freshStats };
})();
