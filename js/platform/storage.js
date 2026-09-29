/* platform/storage.js — where records live. The game talks only to Storage; adapters do the work.
   LocalAdapter: this browser's localStorage, one profile per handle.
   RemoteAdapter: the signed-in player's records in the Watson DB, reached with this device's key (platform/auth.js).
   js/game.js decides which one a record uses: a handle bound to a Google account lives only in the Watson DB. */
(function(){
  const PREFIX = 'netrunner-ccna-profile:', CUR = 'netrunner-ccna-current';
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
  // Watson DB adapter: the signed-in player's records, behind this device's key (platform/auth.js). `client.token()` returns the key.
  const RemoteAdapter = {
    name: 'watson', client: null, userId: null,
    ready(){ return !!(this.client && this.userId && this.client.token()); },
    live(){ return this.ready(); },
    async req(body){ const url = (window.PLATFORM || {}).dbUrl; const key = this.client && this.client.token(); if (!url || !key) throw new Error('not signed in');
      const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ kind: 'rec', key }, body)), redirect: 'follow' });
      const d = await r.json(); if (d && d.signedOut && this.client.onSignedOut) this.client.onSignedOut(); if (!d || !d.ok) throw new Error('watson ' + ((d && d.why) || r.status)); return d; },
    async list(){ if (!this.ready()) return []; try { return (await this.req({ op: 'list' })).handles || []; } catch (e) { console.warn('records.list', e); return []; } },
    async load(h){ if (!this.ready()) return null; try { const d = await this.req({ op: 'load', handle: h }); return d.data ? JSON.parse(d.data) : null; } catch (e) { console.warn('records.load', e); return null; } },
    async save(h, state){ if (!this.ready()) return false; try { await this.req({ op: 'save', handle: h, data: JSON.stringify(state) }); return true; } catch (e) { console.warn('records.save', e); return false; } },
    async remove(h){ if (!this.ready()) return false; try { await this.req({ op: 'remove', handle: h }); return true; } catch (e) { return false; } }
  };
  const Storage = {
    local: LocalAdapter, remote: RemoteAdapter,
    useRemote(client, userId){ RemoteAdapter.client = client; RemoteAdapter.userId = userId; },
    useLocal(){ RemoteAdapter.client = null; RemoteAdapter.userId = null; },
  };
  window.Storage = Storage;
})();
