/* db.js — the game's two writes to the Watson DB (tools/watson-db.gs): a suggestion, and a license on completion.
   Off when config/platform.js has no dbUrl. Apps Script answers from another origin, so a plain-text POST is used
   (no preflight). A suggestion only needs to arrive; a license needs its number back, so it reads the reply. */
(function(){
  const url = () => (window.PLATFORM || {}).dbUrl || '';
  const post = (body) => fetch(url(), { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body), redirect: 'follow' });
  window.WatsonDB = {
    get on(){ return !!url(); },
    async suggest(o){ if (!url()) return { ok: false, why: 'The suggestion box is not connected yet.' };
      try { const r = await post(Object.assign({ kind: 'suggestion' }, o)); try { return await r.json(); } catch (e) { return { ok: true }; } }
      catch (e) { try { await fetch(url(), { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ kind: 'suggestion' }, o)) }); return { ok: true }; } catch (e2) { return { ok: false, why: 'No connection. Try again later.' }; } } },
    async license(o){ if (!url()) return { ok: false, why: 'The license office is not connected yet.' };
      try { const r = await post(Object.assign({ kind: 'license' }, o)); return await r.json(); } catch (e) { return { ok: false, why: 'No connection. Try again later.' }; } }
  };
})();
