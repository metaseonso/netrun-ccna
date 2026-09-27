/* platform/storage.js — where records live. The game talks only to Storage; adapters do the work.
   LocalAdapter: this browser's localStorage, one profile per handle.
   RemoteAdapter: the signed-in player's Google Drive app folder (drive.appdata), one JSON file per handle.
   After sign-in, Storage.mergeLocalIntoRemote() uploads local profiles once; then remote is primary and local is a cache. */
(function(){
  const PREFIX = 'netrun-ccna-profile:', CUR = 'netrun-ccna-current';
  const LocalAdapter = {
    name: 'local',
    list(){ return Promise.resolve(LocalAdapter.listSync()); },
    load(h){ return Promise.resolve(LocalAdapter.loadSync(h)); },
    save(h, state){ LocalAdapter.saveSync(h, state); return Promise.resolve(true); },
    remove(h){ try { localStorage.removeItem(PREFIX + h); } catch (e) {} return Promise.resolve(true); },
    loadSync(h){ try { return JSON.parse(localStorage.getItem(PREFIX + h) || 'null'); } catch (e) { return null; } },
    saveSync(h, state){ try { localStorage.setItem(PREFIX + h, JSON.stringify(state)); } catch (e) {} },
    listSync(){ const o = []; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(PREFIX)) o.push(k.slice(PREFIX.length)); } } catch (e) {} return o.sort(); },
    current(){ try { return localStorage.getItem(CUR); } catch (e) { return null; } },
    setCurrent(h){ try { if (h) localStorage.setItem(CUR, h); else localStorage.removeItem(CUR); } catch (e) {} }
  };
  // Drive appData adapter. `client.token()` returns a bearer token or null.
  const API = 'https://www.googleapis.com/drive/v3', UP = 'https://www.googleapis.com/upload/drive/v3';
  const RemoteAdapter = {
    name: 'drive', client: null, userId: null, ids: {},
    ready(){ return !!(this.client && this.userId); },
    async tok(){ const t = this.client && this.client.token(); if (!t) throw new Error('no token'); return t; },
    live(){ return this.ready() && !!this.client.token(); },
    async req(url, opts){ const t = await this.tok(); const r = await fetch(url, Object.assign({}, opts, { headers: Object.assign({ Authorization: 'Bearer ' + t }, (opts && opts.headers) || {}) })); if (!r.ok) throw new Error('drive ' + r.status + ' ' + (await r.text()).slice(0, 120)); return r; },
    fname: h => 'netrun-' + encodeURIComponent(h) + '.json',
    async find(h){ if (this.ids[h]) return this.ids[h]; const r = await this.req(API + '/files?spaces=appDataFolder&fields=files(id,name,modifiedTime)&q=' + encodeURIComponent("name='" + this.fname(h) + "'")); const d = await r.json(); const f = d.files && d.files[0]; if (f) this.ids[h] = f.id; return f ? f.id : null; },
    async list(){ if (!this.ready()) return []; try { const r = await this.req(API + '/files?spaces=appDataFolder&fields=files(id,name)&pageSize=100'); const d = await r.json(); return (d.files || []).map(f => f.name).filter(n => /^netrun-.*\.json$/.test(n)).map(n => decodeURIComponent(n.slice(7, -5))).sort(); } catch (e) { console.warn('drive.list', e); return []; } },
    async load(h){ if (!this.ready()) return null; try { const id = await this.find(h); if (!id) return null; const r = await this.req(API + '/files/' + id + '?alt=media'); return await r.json(); } catch (e) { console.warn('drive.load', e); return null; } },
    async save(h, state){ if (!this.ready()) return false; try { const id = await this.find(h); const meta = { name: this.fname(h), parents: id ? undefined : ['appDataFolder'] }; const boundary = 'netrun' + Date.now();
        const body = '--' + boundary + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' + JSON.stringify(meta) + '\r\n--' + boundary + '\r\nContent-Type: application/json\r\n\r\n' + JSON.stringify(state) + '\r\n--' + boundary + '--';
        const r = await this.req(UP + '/files' + (id ? '/' + id : '') + '?uploadType=multipart&fields=id', { method: id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'multipart/related; boundary=' + boundary }, body }); const d = await r.json(); this.ids[h] = d.id; return true; } catch (e) { console.warn('drive.save', e); return false; } },
    async remove(h){ if (!this.ready()) return false; try { const id = await this.find(h); if (id) await this.req(API + '/files/' + id, { method: 'DELETE' }); delete this.ids[h]; return true; } catch (e) { return false; } }
  };
  let pending = null, lastPush = 0;
  const Storage = {
    local: LocalAdapter, remote: RemoteAdapter, primary: LocalAdapter,
    useRemote(client, userId){ RemoteAdapter.client = client; RemoteAdapter.userId = userId; RemoteAdapter.ids = {}; this.primary = RemoteAdapter; },
    useLocal(){ this.primary = LocalAdapter; },
    async mergeLocalIntoRemote(){ if (!RemoteAdapter.ready()) return { merged: 0 }; let merged = 0; for (const h of LocalAdapter.listSync()) { const local = LocalAdapter.loadSync(h); const remote = await RemoteAdapter.load(h); if (local && (!remote || (local.updated || 0) > (remote.updated || 0))) { if (await RemoteAdapter.save(h, local)) merged++; } } return { merged }; },
    // debounced background push: at most one upload every 15 s, plus an immediate one when `now` is set
    pushIfRemote(h, state, now){ if (this.primary !== RemoteAdapter || !RemoteAdapter.live()) return false; const go = () => { lastPush = Date.now(); pending = null; RemoteAdapter.save(h, state); }; if (now || Date.now() - lastPush > 15000) { if (pending) { clearTimeout(pending); pending = null; } go(); } else if (!pending) pending = setTimeout(go, 15000 - (Date.now() - lastPush)); return true; }
  };
  window.Storage = Storage;
})();
