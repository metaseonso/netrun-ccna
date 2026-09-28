#!/usr/bin/env node
/* tools/watson-db.js — read and update the Watson DB (suggestions and licenses) from the command line.
   Needs .secrets/watson-db.json: { "url": "<web app url>", "key": "<private key from setup()>" }  (git-ignored)
   node tools/watson-db.js list [status]          suggestions, newest last (status: new, ticketed, scoped, in progress, done, declined)
   node tools/watson-db.js set <id> <status> [note]
   node tools/watson-db.js licenses               every license issued */
const fs = require('fs'), path = require('path');
const file = path.join(__dirname, '..', '.secrets', 'watson-db.json');
let cfg = { url: process.env.WATSON_DB_URL, key: process.env.WATSON_DB_KEY };
if ((!cfg.url || !cfg.key) && fs.existsSync(file)) cfg = JSON.parse(fs.readFileSync(file, 'utf8'));
if (!cfg.url || !cfg.key) { console.error('No DB config. Put { "url", "key" } in .secrets/watson-db.json (see docs/WATSON_DB.md).'); process.exit(2); }
const [cmd = 'list', ...rest] = process.argv.slice(2);
const q = o => cfg.url + '?' + new URLSearchParams(Object.assign({ key: cfg.key }, o)).toString();
(async () => {
  let o;
  if (cmd === 'set') o = { action: 'set', id: rest[0], status: rest[1], note: rest.slice(2).join(' ') };
  else if (cmd === 'licenses') o = { action: 'licenses' };
  else o = rest[0] ? { status: rest.join(' ') } : {};
  const r = await fetch(q(o), { redirect: 'follow' }); const d = await r.json();
  if (!d.ok) { console.error('DB said no:', d.why); process.exit(1); }
  if (cmd === 'set') return console.log('updated', rest[0], '→', rest[1]);
  if (cmd === 'licenses') return d.licenses.forEach(l => console.log(l.number, l.issued.slice(0, 10), l.handle, l.hall ? 'hall' : 'private', 'class ' + (l.record.cls || '?')));
  if (!d.suggestions.length) return console.log('No suggestions' + (o.status ? ' with status ' + o.status : '') + '.');
  d.suggestions.forEach(s => console.log('\n' + s.id + ' · ' + s.status + ' · ' + String(s.received).slice(0, 16) + ' · ' + s.handle + ' · ' + s.screen + (s.night ? ' · night ' + s.night : '') + ' · ' + s.version + '\n  ' + String(s.text).replace(/\n/g, '\n  ') + (s.note ? '\n  note: ' + s.note : '')));
})().catch(e => { console.error(e.message); process.exit(1); });
