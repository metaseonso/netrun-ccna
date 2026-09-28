#!/usr/bin/env node
/* tools/hall.js — the Hall of Fame robot. Reads every license from the Watson DB, and for each player who chose the
   Hall, writes hall/cards/<number>.svg and an entry in hall/index.json. Cards whose owner (or the maker) switched the
   `hall` column to "no" are taken down. The maker's card (maker: true) is always kept.
   Needs WATSON_DB_URL and WATSON_DB_KEY (GitHub secrets in .github/workflows/hall.yml, or .secrets/watson-db.json). */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'); const L = require(path.join(ROOT, 'js', 'license.js'));
let cfg = { url: process.env.WATSON_DB_URL, key: process.env.WATSON_DB_KEY };
const sec = path.join(ROOT, '.secrets', 'watson-db.json');
if ((!cfg.url || !cfg.key) && fs.existsSync(sec)) cfg = JSON.parse(fs.readFileSync(sec, 'utf8'));
if (!cfg.url || !cfg.key) { console.log('hall: no DB config, nothing to do'); process.exit(0); }
const HANDLE = /^[\p{L}\p{N} ._\-]{1,18}$/u; // what a handle may be on a public card
(async () => {
  const r = await fetch(cfg.url + '?' + new URLSearchParams({ key: cfg.key, action: 'licenses' }), { redirect: 'follow' });
  const d = await r.json(); if (!d.ok) throw new Error('DB said no: ' + d.why);
  const idx = path.join(ROOT, 'hall', 'index.json'); const old = fs.existsSync(idx) ? JSON.parse(fs.readFileSync(idx, 'utf8')) : { cards: [] };
  const makers = (old.cards || []).filter(c => c.maker);
  const cards = d.licenses.filter(l => l.hall && HANDLE.test(String(l.handle))).map(l => ({ number: l.number, issued: l.issued, handle: String(l.handle), cls: l.record.cls || 'A', difficulty: l.record.difficulty || '', theme: l.record.theme || 'default', stats: l.record.stats || {} }));
  const dir = path.join(ROOT, 'hall', 'cards'); fs.mkdirSync(dir, { recursive: true });
  const keep = new Set(makers.concat(cards).map(c => c.number + '.svg'));
  for (const f of fs.readdirSync(dir)) if (f.endsWith('.svg') && !keep.has(f)) fs.unlinkSync(path.join(dir, f));
  for (const c of makers.concat(cards)) fs.writeFileSync(path.join(dir, c.number + '.svg'), L.svg(c));
  const next = { updated: new Date().toISOString(), cards: makers.concat(cards) };
  const same = JSON.stringify((old.cards || []).map(c => c.number)) === JSON.stringify(next.cards.map(c => c.number));
  if (same) { console.log('hall: no change (' + next.cards.length + ' cards)'); return; }
  fs.writeFileSync(idx, JSON.stringify(next, null, 2)); console.log('hall: ' + next.cards.length + ' cards');
})().catch(e => { console.error(e.message); process.exit(1); });
