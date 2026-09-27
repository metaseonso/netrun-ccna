/* platform/auth.js — Sign in with Google, no backend.
   Uses Google Identity Services (the gsi/client script) with the implicit token flow. The token carries identity
   (openid email profile) and one Drive scope, drive.appdata, so saves live in the player's own Google Drive, in the
   hidden app folder that only this app can see. No database, no server, nothing to host.
   Inactive until config/platform.js has googleClientId. Then: Auth.configured, Auth.user(), Auth.signIn(), Auth.signOut(), Auth.onChange(cb), Auth.token(). */
(function(){
  const SCOPES = 'openid email profile https://www.googleapis.com/auth/drive.appdata';
  const listeners = []; let current = null; let token = null; let tokenExp = 0; let client = null; let waiters = []; const KEY = 'netrunner-ccna-google';
  const settle = t => { waiters.splice(0).forEach(r => { try { r(t); } catch (e) {} }); };
  const emit = () => { const u = Auth.user(); if (u) Storage.useRemote({ token: () => Auth.token() }, u.id); else Storage.useLocal(); listeners.forEach(cb => { try { cb(u); } catch (e) { console.error(e); } }); };
  async function whoami(t){ const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: 'Bearer ' + t } }); if (!r.ok) throw new Error('userinfo ' + r.status); return r.json(); }
  const Auth = {
    configured: false, providers: ['google'],
    init(cfg){ cfg = cfg || {}; this.clientId = cfg.googleClientId || ''; if (!this.clientId) { this.configured = false; return this; }
      // the gsi script loads async; wait for it (up to ~10 s) instead of giving up at DOMContentLoaded
      if (!window.google || !google.accounts || !google.accounts.oauth2) { this._tries = (this._tries || 0) + 1; if (this._tries < 40) setTimeout(() => Auth.init(cfg), 250); return this; }
      if (client) return this; this.configured = true;
      client = google.accounts.oauth2.initTokenClient({ client_id: this.clientId, scope: SCOPES,
        error_callback: (e) => { console.warn('google sign-in', e && e.type); settle(null); emit(); },
        callback: async (resp) => { if (resp.error) { console.warn('google token', resp); settle(null); emit(); return; } token = resp.access_token; tokenExp = Date.now() + (resp.expires_in - 60) * 1000;
          try { const me = await whoami(token); current = { id: me.sub, email: me.email, name: me.name || me.email, avatar: me.picture }; try { localStorage.setItem(KEY, JSON.stringify(current)); } catch (e) {} } catch (e) { console.warn(e); current = null; token = null; }
          settle(token); emit(); } });
      // remembered identity: show the name at once; a fresh token comes with the first RECONNECT (a click, so the popup is allowed)
      try { const saved = JSON.parse(localStorage.getItem(KEY) || 'null'); if (saved && saved.id) current = saved; } catch (e) {}
      emit(); return this; },
    user(){ return current; },
    token(){ return token && Date.now() < tokenExp ? token : null; },
    needsToken(){ return !!(current && !this.token()); },
    // call from a click: opens the Google popup only if a silent refresh is not possible
    ensureToken(){ if (this.token()) return Promise.resolve(this.token()); if (!client) return Promise.resolve(null); return new Promise(res => { waiters.push(res); try { client.requestAccessToken({ prompt: '', login_hint: current && current.email || undefined }); } catch (e) { settle(null); } }); },
    signIn(){ if (!this.configured) return Promise.reject(new Error('sign-in is not configured')); return new Promise(res => { waiters.push(res); client.requestAccessToken({ prompt: 'select_account' }); }); },
    async signOut(){ if (token && window.google) { try { google.accounts.oauth2.revoke(token, () => {}); } catch (e) {} } token = null; tokenExp = 0; current = null; try { localStorage.removeItem(KEY); } catch (e) {} emit(); },
    onChange(cb){ listeners.push(cb); return () => { const i = listeners.indexOf(cb); if (i >= 0) listeners.splice(i, 1); }; }
  };
  window.Auth = Auth;
})();
