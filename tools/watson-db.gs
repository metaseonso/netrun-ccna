/* watson-db.gs — the game's only database: a Google Sheet the owner owns, behind an Apps Script web app.
   Three tabs: `suggestions` (the in-game suggestion box), `licenses` (the numbered license issued on completion) and
   `pulse` (anonymous progress, one row per random player id: class, nights finished, flatlines, first day, furthest
   night, fixers bought, build, the day each night was first finished, flatlines by night). The public `stats` action
   adds `pulse` and `licenses` up for the sign-in page; it never returns a row. The owner's dashboard (owner.html) reads
   all three with the key through `?action=dashboard`.
   Anyone may write (rate limited, sizes capped). Reading and updating need the private key, which only the owner,
   the Hall of Fame robot (.github/workflows/hall.yml) and tools/watson-db.js hold. Setup: docs/WATSON_DB.md. */

const SUG_HEAD = ['id', 'received', 'handle', 'screen', 'night', 'version', 'text', 'status', 'note', 'updated'];
const LIC_HEAD = ['number', 'issued', 'handle', 'hall', 'record'];
const PULSE_HEAD = ['id', 'updated', 'cls', 'nights', 'flatlines', 'first', 'reached', 'fixers', 'version', 'trail', 'flats', 'licensed'];
const STATUSES = ['new', 'ticketed', 'scoped', 'in progress', 'done', 'declined'];

// Run once from the editor (pick setup, press Run). Makes both tabs and a private key, and logs the key.
function setup() {
  tab_('suggestions', SUG_HEAD); tab_('licenses', LIC_HEAD); tab_('pulse', PULSE_HEAD);
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('KEY')) props.setProperty('KEY', Utilities.getUuid().replace(/-/g, ''));
  Logger.log('Private key: ' + props.getProperty('KEY'));
}

function tab_(name, head) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sh.getLastRow() === 0) sh.appendRow(head);
  else if (sh.getLastColumn() < head.length) sh.getRange(1, 1, 1, head.length).setValues([head]); // an older sheet grows new columns
  return sh;
}
const rows_ = (sh, n) => sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, n).getValues() : [];
const json_ = o => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
const clip_ = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').slice(0, n);
const keyOk_ = p => p.key && p.key === PropertiesService.getScriptProperties().getProperty('KEY');
function limit_(bucket, seconds) { const c = CacheService.getScriptCache(); if (c.get(bucket)) return false; c.put(bucket, '1', seconds); return true; }

// players write here: { kind: 'suggestion', ... } or { kind: 'license', ... }
function doPost(e) {
  let d = {};
  try { d = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, why: 'bad json' }); }
  const who = clip_(d.handle, 40) || 'anon';
  const lock = LockService.getScriptLock(); lock.waitLock(8000);
  try {
    if (d.kind === 'license') return license_(d, who);
    if (d.kind === 'pulse') return pulse_(d);
    return suggestion_(d, who);
  } finally { lock.releaseLock(); }
}

function suggestion_(d, who) {
  const text = clip_(d.text, 2000).trim();
  if (text.length < 3) return json_({ ok: false, why: 'too short' });
  if (!limit_('s:' + who, 30)) return json_({ ok: false, why: 'one suggestion every 30 seconds' });
  const hour = 'g:' + new Date().toISOString().slice(0, 13); const c = CacheService.getScriptCache(); const n = Number(c.get(hour) || 0);
  if (n > 200) return json_({ ok: false, why: 'the box is full this hour' }); c.put(hour, String(n + 1), 3600);
  const sh = tab_('suggestions', SUG_HEAD);
  const id = 'S' + String(sh.getLastRow()).padStart(4, '0');
  sh.appendRow([id, new Date().toISOString(), who, clip_(d.screen, 40), clip_(d.night, 10), clip_(d.version, 20), text, 'new', '', '']);
  return json_({ ok: true, id });
}

// anonymous progress: a random id per record, never the handle
function pulse_(d) {
  const id = clip_(d.id, 40); if (!/^[a-z0-9-]{6,40}$/.test(id)) return json_({ ok: false, why: 'bad id' });
  if (!limit_('p:' + id, 60)) return json_({ ok: true, later: true });
  const cls = /^[ABCD]$/.test(d.cls) ? d.cls : 'D', nights = Math.max(0, Math.min(63, Number(d.nights) || 0)), flat = Math.max(0, Math.min(9999, Number(d.flatlines) || 0));
  const sh = tab_('pulse', PULSE_HEAD); const rows = rows_(sh, PULSE_HEAD.length); const i = rows.findIndex(r => r[0] === id);
  const day = v => /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : '';
  const nightMap = (o, ok) => { const out = {}; Object.keys(o && typeof o === 'object' ? o : {}).slice(0, 70).forEach(k => { const n = Number(k); if (n >= 1 && n <= 64 && ok(o[k])) out[n] = o[k]; }); return JSON.stringify(out); };
  const row = [id, new Date().toISOString(), cls, nights, flat, day(d.first), Math.max(0, Math.min(64, Number(d.reached) || 0)), Math.max(0, Math.min(999, Number(d.fixers) || 0)),
    clip_(d.version, 12), nightMap(d.trail, v => !!day(v)), nightMap(d.flats, v => Number(v) >= 0 && Number(v) < 10000), d.licensed ? 'yes' : 'no'];
  if (i < 0) sh.appendRow(row); else sh.getRange(i + 2, 1, 1, PULSE_HEAD.length).setValues([row]);
  CacheService.getScriptCache().remove('stats');
  return json_({ ok: true });
}

// one license per handle and record fingerprint; asking again returns the same number
function license_(d, who) {
  const rec = d.record || {}; const fp = clip_(rec.fingerprint, 80);
  if (!fp || !rec.completedAt) return json_({ ok: false, why: 'no completion on this record' });
  const sh = tab_('licenses', LIC_HEAD); const rows = rows_(sh, LIC_HEAD.length);
  const mine = rows.find(r => r[2] === who && JSON.parse(r[4] || '{}').fingerprint === fp);
  if (mine) return json_({ ok: true, number: mine[0], issued: mine[1], again: true });
  if (!limit_('l:' + who, 60)) return json_({ ok: false, why: 'one license a minute' });
  const number = 'NR-' + String(rows.length + 1).padStart(6, '0');
  const issued = new Date().toISOString();
  const keep = JSON.stringify({ fingerprint: fp, completedAt: clip_(rec.completedAt, 40), cls: clip_(rec.cls, 2), stats: rec.stats || {} }).slice(0, 4000);
  sh.appendRow([number, issued, who, d.hall ? 'yes' : 'no', keep]);
  return json_({ ok: true, number, issued });
}

// the owner, the Hall of Fame robot and Claude read and update here, with the key
function doGet(e) {
  const p = e.parameter || {};
  if (p.action === 'stats') return json_(stats_());
  if (!keyOk_(p)) return json_({ ok: false, why: 'key' });
  if (p.action === 'dashboard') return json_(dashboard_());
  if (p.action === 'licenses') {
    const list = rows_(tab_('licenses', LIC_HEAD), LIC_HEAD.length).map(r => ({ number: r[0], issued: r[1], handle: r[2], hall: r[3] === 'yes', record: JSON.parse(r[4] || '{}') }));
    return json_({ ok: true, count: list.length, licenses: list });
  }
  const sh = tab_('suggestions', SUG_HEAD); const rows = rows_(sh, SUG_HEAD.length);
  if (p.action === 'set') {
    if (STATUSES.indexOf(p.status) < 0) return json_({ ok: false, why: 'status must be one of ' + STATUSES.join(', ') });
    const i = rows.findIndex(r => r[0] === p.id); if (i < 0) return json_({ ok: false, why: 'no such id' });
    sh.getRange(i + 2, 8, 1, 3).setValues([[p.status, clip_(p.note, 1000), new Date().toISOString()]]);
    return json_({ ok: true });
  }
  const list = rows.map(r => Object.fromEntries(SUG_HEAD.map((h, k) => [h, r[k]]))).filter(r => !p.status || r.status === p.status);
  return json_({ ok: true, count: list.length, suggestions: list });
}

// everything the owner's dashboard draws, in one read: every pulse row, every suggestion, every license (without the record)
function dashboard_() {
  const pj = v => { try { return JSON.parse(v || '{}'); } catch (e) { return {}; } };
  const pulse = rows_(tab_('pulse', PULSE_HEAD), PULSE_HEAD.length).map(r => ({ id: r[0], updated: r[1], cls: r[2], nights: Number(r[3]) || 0, flatlines: Number(r[4]) || 0,
    first: r[5] || '', reached: Number(r[6]) || 0, fixers: Number(r[7]) || 0, version: r[8] || '', trail: pj(r[9]), flats: pj(r[10]), licensed: r[11] === 'yes' }));
  const suggestions = rows_(tab_('suggestions', SUG_HEAD), SUG_HEAD.length).map(r => Object.fromEntries(SUG_HEAD.map((h, k) => [h, r[k]])));
  const licenses = rows_(tab_('licenses', LIC_HEAD), LIC_HEAD.length).map(r => { const rec = pj(r[4]); return { number: r[0], issued: r[1], handle: r[2], hall: r[3] === 'yes', cls: rec.cls || '' }; });
  return { ok: true, at: new Date().toISOString(), pulse, suggestions, licenses };
}

// public numbers for the sign-in page, cached for five minutes
function stats_() {
  const c = CacheService.getScriptCache(); const hit = c.get('stats'); if (hit) return JSON.parse(hit);
  const pulse = rows_(tab_('pulse', PULSE_HEAD), PULSE_HEAD.length); const lic = rows_(tab_('licenses', LIC_HEAD), LIC_HEAD.length);
  const out = { ok: true, netrunners: pulse.length, licensed: lic.length, nights: pulse.reduce((a, r) => a + (Number(r[3]) || 0), 0), flatlines: pulse.reduce((a, r) => a + (Number(r[4]) || 0), 0), at: new Date().toISOString() };
  c.put('stats', JSON.stringify(out), 300); return out;
}
