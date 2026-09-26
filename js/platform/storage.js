/* platform/storage.js — where saves live. Game talks only to Storage; adapters do the work.
   LocalAdapter: localStorage, one profile per handle (today).
   RemoteAdapter: Supabase table `profiles` keyed by the signed-in user (after the OAuth handoff; see docs/AUTH_PLAN.md).
   When a user signs in, Storage.mergeLocalInto(remote) uploads the local profile once, then remote is primary. */
(function(){
  const PREFIX = 'netrun-ccna-profile:', CUR = 'netrun-ccna-current';
  const LocalAdapter = {
    name: 'local',
    list(){ const o = []; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(PREFIX)) o.push(k.slice(PREFIX.length)); } } catch (e) {} return Promise.resolve(o.sort()); },
    load(h){ try { const s = JSON.parse(localStorage.getItem(PREFIX + h) || 'null'); return Promise.resolve(s); } catch (e) { return Promise.resolve(null); } },
    save(h, state){ try { localStorage.setItem(PREFIX + h, JSON.stringify(state)); } catch (e) {} return Promise.resolve(true); },
    remove(h){ try { localStorage.removeItem(PREFIX + h); } catch (e) {} return Promise.resolve(true); },
    // synchronous mirrors used by Game at boot (localStorage is sync; remote is not)
    loadSync(h){ try { return JSON.parse(localStorage.getItem(PREFIX + h) || 'null'); } catch (e) { return null; } },
    saveSync(h, state){ try { localStorage.setItem(PREFIX + h, JSON.stringify(state)); } catch (e) {} },
    listSync(){ const o = []; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(PREFIX)) o.push(k.slice(PREFIX.length)); } } catch (e) {} return o.sort(); },
    current(){ try { return localStorage.getItem(CUR); } catch (e) { return null; } },
    setCurrent(h){ try { if (h) localStorage.setItem(CUR, h); else localStorage.removeItem(CUR); } catch (e) {} }
  };
  // Remote adapter: implemented against the Supabase JS client. Inactive until Auth is configured and a user is signed in.
  const RemoteAdapter = {
    name: 'remote', client: null, userId: null,
    ready(){ return !!(this.client && this.userId); },
    async list(){ if (!this.ready()) return []; const { data, error } = await this.client.from('profiles').select('handle').eq('user_id', this.userId); if (error) { console.warn('storage.list', error); return []; } return data.map(r => r.handle).sort(); },
    async load(h){ if (!this.ready()) return null; const { data, error } = await this.client.from('profiles').select('state').eq('user_id', this.userId).eq('handle', h).maybeSingle(); if (error) { console.warn('storage.load', error); return null; } return data ? data.state : null; },
    async save(h, state){ if (!this.ready()) return false; const { error } = await this.client.from('profiles').upsert({ user_id: this.userId, handle: h, state, updated_at: new Date().toISOString() }, { onConflict: 'user_id,handle' }); if (error) console.warn('storage.save', error); return !error; },
    async remove(h){ if (!this.ready()) return false; const { error } = await this.client.from('profiles').delete().eq('user_id', this.userId).eq('handle', h); return !error; }
  };
  const Storage = {
    local: LocalAdapter, remote: RemoteAdapter, primary: LocalAdapter,
    useRemote(client, userId){ RemoteAdapter.client = client; RemoteAdapter.userId = userId; this.primary = RemoteAdapter; },
    useLocal(){ this.primary = LocalAdapter; },
    // one-time upload of local profiles after first sign-in (remote wins if both exist and remote is newer)
    async mergeLocalIntoRemote(){ if (!RemoteAdapter.ready()) return { merged: 0 }; let merged = 0; for (const h of LocalAdapter.listSync()) { const local = LocalAdapter.loadSync(h); const remote = await RemoteAdapter.load(h); if (!remote || (local && (local.updated || 0) > (remote.updated || 0))) { await RemoteAdapter.save(h, local); merged++; } } return { merged }; },
    // background sync: called by Game.save when remote is primary
    async pushIfRemote(h, state){ if (this.primary === RemoteAdapter && RemoteAdapter.ready()) return RemoteAdapter.save(h, state); return false; }
  };
  window.Storage = Storage;
})();
