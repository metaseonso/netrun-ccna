/* platform/auth.js — identity. Inactive until config/platform.js has a Supabase URL and the SDK script is loaded.
   Interface the game uses:  Auth.configured, Auth.user(), Auth.signIn(provider), Auth.signOut(), Auth.onChange(cb), Auth.providers
   Post-handoff steps are in docs/AUTH_PLAN.md. Nothing else in the game needs to change. */
(function(){
  const listeners = []; let current = null; let client = null;
  const Auth = {
    configured: false, providers: [], client: null,
    init(cfg){ cfg = cfg || {}; this.providers = cfg.providers || ['google', 'github', 'discord'];
      if (!cfg.supabaseUrl || !cfg.supabaseAnonKey || !window.supabase || !window.supabase.createClient) { this.configured = false; return this; }
      client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey); this.client = client; this.configured = true; this.redirectTo = cfg.redirectTo || (location.origin + location.pathname);
      client.auth.getSession().then(({ data }) => { current = data && data.session ? data.session.user : null; emit(); });
      client.auth.onAuthStateChange((_event, session) => { current = session ? session.user : null; emit(); });
      return this; },
    user(){ return current ? { id: current.id, email: current.email, name: (current.user_metadata && (current.user_metadata.full_name || current.user_metadata.user_name || current.user_metadata.name)) || current.email, avatar: current.user_metadata && current.user_metadata.avatar_url } : null; },
    async signIn(provider){ if (!this.configured) throw new Error('auth not configured'); const { error } = await client.auth.signInWithOAuth({ provider, options: { redirectTo: this.redirectTo } }); if (error) throw error; },
    async signOut(){ if (!this.configured) return; await client.auth.signOut(); current = null; emit(); },
    onChange(cb){ listeners.push(cb); return () => { const i = listeners.indexOf(cb); if (i >= 0) listeners.splice(i, 1); }; }
  };
  function emit(){ const u = Auth.user(); if (u && client) Storage.useRemote(client, u.id); else Storage.useLocal(); listeners.forEach(cb => { try { cb(u); } catch (e) { console.error(e); } }); }
  window.Auth = Auth;
})();
