/* platform/auth.js — Sign in with Google, once per device.
   Google Identity Services' sign-in button asks Google who the player is (an ID token; no Drive, no other scope).
   The Watson DB (tools/watson-db.gs) checks that token with Google and hands this device a random key. From then on
   the key is all the device needs: records load and save through the Watson DB, with no Google calls and no popups,
   on every reload and every later day. Signing out deletes the key on both ends.
   Inactive until config/platform.js has googleClientId and dbUrl.
   API: Auth.configured, Auth.user(), Auth.token() (the device key), Auth.mountButton(el), Auth.signIn(), Auth.signOut(),
   Auth.onChange(cb), Auth.needsToken() (always false now), Auth.ensureToken(). */
(function(){
  const KEY = 'netrunner-ccna-session', OLD = 'netrunner-ccna-google';
  const listeners = []; let session = null; let waiters = []; let ready = false, told = false; const mounted = new Set();
  const settle = t => { waiters.splice(0).forEach(r => { try { r(t); } catch (e) {} }); };
  const store = { get(){ try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }, set(v){ try { v ? localStorage.setItem(KEY, JSON.stringify(v)) : localStorage.removeItem(KEY); } catch (e) {} } };
  const dbUrl = () => (window.PLATFORM || {}).dbUrl || '';
  const post = body => fetch(dbUrl(), { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body), redirect: 'follow' }).then(r => r.json());
  const emit = () => { told = true; const u = Auth.user(); if (u) Storage.useRemote({ token: () => Auth.token(), onSignedOut: () => Auth.forget() }, u.id); else Storage.useLocal(); listeners.forEach(cb => { try { cb(u); } catch (e) { console.error(e); } }); };
  // Google's answer to a sign-in: trade the ID token for this device's key
  async function onCredential(resp){
    try { const d = await post({ kind: 'session', idToken: resp && resp.credential });
      if (!d || !d.ok || !d.key) throw new Error((d && d.why) || 'no key');
      session = { key: d.key, user: d.user }; store.set(session); settle(d.key); emit();
    } catch (e) { console.warn('sign-in', e); settle(null); if (window.UI && UI.toast) UI.toast('Sign-in did not go through. Try again.', 'mag'); } }
  const Auth = {
    configured: false, providers: ['google'],
    init(cfg){ cfg = cfg || {}; this.clientId = cfg.googleClientId || ''; if (!this.clientId || !cfg.dbUrl) { this.configured = false; return this; }
      try { localStorage.removeItem(OLD); } catch (e) {} // the Drive sign-in this replaced
      if (!session) { const s = store.get(); if (s && s.key && s.user && s.user.id) session = s; }
      // the gsi script loads async; wait for it (up to ~10 s). A saved key works without it.
      if (!window.google || !google.accounts || !google.accounts.id) { this._tries = (this._tries || 0) + 1; if (this._tries === 1 && session) emit(); if (this._tries < 40) setTimeout(() => Auth.init(cfg), 250); return this; }
      if (ready) return this; ready = true; this.configured = true;
      google.accounts.id.initialize({ client_id: this.clientId, callback: onCredential, auto_select: false, cancel_on_tap_outside: true, use_fedcm_for_button: true, use_fedcm_for_prompt: true, context: 'signin', itp_support: true });
      mounted.forEach(el => el.isConnected ? this.mountButton(el) : mounted.delete(el));
      // a saved key was already announced while the script loaded; otherwise tell the door that Google sign-in is here
      if (!told || !session) emit(); return this; },
    // Google's own button, drawn into el (the door, or the sign-in box in the account menu)
    mountButton(el){ if (!el) return; mounted.forEach(m => { if (!m.isConnected) mounted.delete(m); }); mounted.add(el); if (!ready) return; if (el.dataset.gsi === '1' && el.childElementCount) return; el.dataset.gsi = '1';
      try { google.accounts.id.renderButton(el, { type: 'standard', theme: 'filled_black', size: 'large', text: 'continue_with', shape: 'rectangular', logo_alignment: 'left', width: Math.min(360, Math.max(220, el.clientWidth || 300)) }); } catch (e) { console.warn('gsi button', e); } },
    user(){ return session ? session.user : null; },
    token(){ return session ? session.key : null; },
    needsToken(){ return false; },
    ensureToken(){ return Promise.resolve(this.token()); },
    // the One Tap prompt, for a click that is not on Google's button; the button stays the reliable path
    signIn(){ if (!this.configured) return Promise.reject(new Error('sign-in is not configured')); return new Promise(res => { waiters.push(res); try { google.accounts.id.prompt(n => { if (n && (n.isNotDisplayed && n.isNotDisplayed() || n.isSkippedMoment && n.isSkippedMoment())) settle(null); }); } catch (e) { settle(null); } }); },
    // the Watson DB no longer knows this key (signed out on another device, or removed): drop it here too
    forget(){ session = null; store.set(null); emit(); },
    async signOut(){ const key = this.token(); session = null; store.set(null); try { if (window.google && google.accounts && google.accounts.id) google.accounts.id.disableAutoSelect(); } catch (e) {}
      emit(); if (key && dbUrl()) { try { await post({ kind: 'signout', key }); } catch (e) {} } },
    onChange(cb){ listeners.push(cb); return () => { const i = listeners.indexOf(cb); if (i >= 0) listeners.splice(i, 1); }; }
  };
  window.Auth = Auth;
})();
