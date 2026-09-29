/* sfx.js — the game's sounds. Files in assets/sfx/ (chosen by the owner, credits in assets/sfx/CREDITS.md and the
   door's footer); the WebAudio synth below plays a cue until its file has loaded, or if it fails to.
   Sfx.play(name) · Sfx.on · Sfx.toggle(). Silent until the first user gesture (browsers require it) and when muted.
   Every sound has a visual twin in the UI; nothing is signalled by sound alone.
   Menus: tick (any button with no cue of its own), open, close, tab. Results: ok, fail, done, rite, promo, night,
   answer, miss. The street: ring, jack, sync, coin, spend, eat, fix (repair), drain, flatline. */
(function(){
  const KEY = 'netrunner-ccna-sound';
  let ctx = null, master = null, on = true;
  try { on = localStorage.getItem(KEY) !== 'off'; } catch (e) {}
  const FILES = {}; // name -> AudioBuffer, once loaded
  // per-cue level: the files are all peak-matched, so the small ones are turned down here
  const GAIN = { tick: 0.3, tab: 0.4, open: 0.45, close: 0.45, ok: 0.6, fail: 0.6, answer: 0.6, miss: 0.6, spend: 0.55, eat: 0.6, sync: 0.55, coin: 0.65, drain: 0.6, ring: 0.7, fix: 0.7, jack: 0.8, night: 0.75, done: 0.85, rite: 0.9, promo: 0.9, flatline: 0.9 };
  // the big moments play one after another instead of on top of each other (a won rite, then the class-up)
  const QUEUED = { done: 1, rite: 1, promo: 1, night: 1, coin: 1, sync: 1 }; let freeAt = 0, lastAt = 0;
  let loading = false;
  function load(){ if (loading || !ready()) return; loading = true; Object.keys(GAIN).forEach(n => fetch('assets/sfx/' + n + '.mp3').then(r => r.ok ? r.arrayBuffer() : Promise.reject()).then(a => new Promise((res, rej) => ctx.decodeAudioData(a, res, rej))).then(b => { FILES[n] = b; }).catch(() => {})); }
  function ready(){ if (ctx) return ctx; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination); return ctx; }
  // one voice: oscillator (or noise) through a gain envelope, optional pitch glide and filter
  function tone(o){ const c = ready(); if (!c) return; const t = c.currentTime + (o.at || 0); const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(o.vol || 0.2, t + (o.a || 0.005)); g.gain.exponentialRampToValueAtTime(0.0001, t + (o.d || 0.12));
    let src; if (o.noise) { const len = Math.ceil(c.sampleRate * (o.d || 0.2)); const buf = c.createBuffer(1, len, c.sampleRate); const ch = buf.getChannelData(0); for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1; src = c.createBufferSource(); src.buffer = buf; }
    else { src = c.createOscillator(); src.type = o.type || 'sine'; src.frequency.setValueAtTime(o.f, t); if (o.f2) src.frequency.exponentialRampToValueAtTime(o.f2, t + (o.d || 0.12)); }
    let node = src; if (o.lp || o.hp || o.bp) { const fl = c.createBiquadFilter(); fl.type = o.bp ? 'bandpass' : o.lp ? 'lowpass' : 'highpass'; fl.frequency.setValueAtTime(o.bp || o.lp || o.hp, t); if (o.q) fl.Q.value = o.q; const to = o.bp2 || o.lp2; if (to) fl.frequency.exponentialRampToValueAtTime(to, t + (o.d || 0.2)); node.connect(fl); node = fl; }
    node.connect(g); g.connect(master); src.start(t); src.stop(t + (o.d || 0.12) + 0.05); }
  const CUES = {
    // menus: a low thump, a band of static sweeping down, and a short detuned chirp. a shutter on a cheap deck, not a bell.
    tick: () => { tone({ f: 95, f2: 60, type: 'sine', vol: 0.09, d: 0.05 }); tone({ noise: true, vol: 0.05, d: 0.04, bp: 2400, bp2: 900, q: 6 }); },
    open: () => { tone({ f: 70, f2: 45, type: 'sine', vol: 0.12, d: 0.08 }); tone({ noise: true, vol: 0.07, d: 0.11, bp: 3200, bp2: 600, q: 5 }); tone({ f: 330, f2: 180, type: 'square', vol: 0.025, d: 0.07, at: 0.02, lp: 1600 }); tone({ f: 349, f2: 190, type: 'square', vol: 0.02, d: 0.07, at: 0.02, lp: 1600 }); },
    close: () => { tone({ noise: true, vol: 0.05, d: 0.08, bp: 700, bp2: 2600, q: 5 }); tone({ f: 60, f2: 40, type: 'sine', vol: 0.08, d: 0.06, at: 0.03 }); },
    ok: () => { tone({ f: 880, type: 'square', vol: 0.06, d: 0.07, lp: 3000 }); tone({ f: 1320, type: 'square', vol: 0.06, d: 0.1, at: 0.07, lp: 3000 }); },
    fail: () => { tone({ f: 110, type: 'sawtooth', vol: 0.09, d: 0.22, lp: 900 }); tone({ noise: true, vol: 0.04, d: 0.12, hp: 2500 }); },
    coin: () => { tone({ f: 1567, type: 'triangle', vol: 0.09, d: 0.08 }); tone({ f: 2093, type: 'triangle', vol: 0.08, d: 0.22, at: 0.06 }); },
    spend: () => { tone({ f: 1046, type: 'triangle', vol: 0.07, d: 0.08 }); tone({ f: 784, type: 'triangle', vol: 0.06, d: 0.16, at: 0.06 }); },
    eat: () => { tone({ noise: true, vol: 0.05, d: 0.08, lp: 900 }); tone({ noise: true, vol: 0.05, d: 0.08, lp: 900, at: 0.12 }); },
    fix: () => { tone({ f: 300, f2: 1200, type: 'sawtooth', vol: 0.05, d: 0.35, lp: 2200 }); tone({ f: 1200, type: 'sine', vol: 0.05, d: 0.25, at: 0.35 }); },
    jack: () => { tone({ noise: true, vol: 0.09, d: 0.7, lp: 6000, lp2: 300 }); tone({ f: 160, f2: 40, type: 'sine', vol: 0.25, d: 0.9, at: 0.5 }); },
    sync: () => { tone({ f: 1400, f2: 2200, type: 'sine', vol: 0.05, d: 0.09 }); tone({ f: 2200, type: 'sine', vol: 0.04, d: 0.08, at: 0.1 }); },
    ring: () => { for (let i = 0; i < 2; i++) { tone({ f: 1318, type: 'square', vol: 0.05, d: 0.08, at: i * 0.22, lp: 2500 }); tone({ f: 1046, type: 'square', vol: 0.05, d: 0.08, at: i * 0.22 + 0.1, lp: 2500 }); } },
    promo: () => { [523, 659, 784, 1046].forEach((f, i) => tone({ f, type: 'sawtooth', vol: 0.06, d: 0.5, at: i * 0.09, lp: 2600 })); },
    flatline: () => tone({ f: 988, type: 'sine', vol: 0.12, a: 0.02, d: 2.4 }),
    drain: () => tone({ f: 420, f2: 160, type: 'triangle', vol: 0.07, d: 0.3 })
  };
  CUES.tab = CUES.tick; CUES.done = CUES.fix; CUES.rite = CUES.promo; CUES.night = CUES.sync; CUES.answer = CUES.ok; CUES.miss = CUES.fail;
  function play(name){ lastAt = Date.now(); if (!on) return; const c = ready(); if (!c) return; if (c.state === 'suspended') c.resume(); load();
    const b = FILES[name]; if (!b) { const f = CUES[name]; if (f) try { f(); } catch (e) {} return; }
    let at = c.currentTime; if (QUEUED[name]) { at = Math.max(at, freeAt); freeAt = at + Math.min(b.duration, 2.5) + 0.05; }
    const s = c.createBufferSource(), g = c.createGain(); s.buffer = b; g.gain.value = GAIN[name] || 0.6; s.connect(g); g.connect(master); s.start(at); }
  // a button press with no cue of its own gets the tick; a cue played by the click's own handler wins
  document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('button,[role="button"],a[href],summary,[data-v]'); if (!t || t.disabled) return; const at = Date.now(); setTimeout(() => { if (lastAt < at) play('tick'); }, 0); }, true);
  ['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, () => { if (on) load(); }, { once: true, capture: true }));
  window.Sfx = { play, get on(){ return on; }, toggle(){ on = !on; try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch (e) {} if (on) play('tick'); return on; }, cues: Object.keys(CUES) };
})();
