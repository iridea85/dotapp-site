/* dōtapp: privacy-minimal aggregate analytics (opt-in at deployment, no identifiers). */
(() => {
  'use strict';
  // Explicit production scope: previews, test hosts, and local builds MUST NOT send hits.
  if (location.origin !== 'https://do-tapp.it') return;
  const BASE = 'https://ozgpdglnycmmhilvsqsw.supabase.co';
  const KEY = 'sb_publishable_3VIXsCBHD6ugmcuBkZ4sqA_xuudgE60'; // public key (not a secret)
  let attempted = false;
  async function recordOnce() {
    if (attempted) return;
    if (document.visibilityState === 'prerender' || document.visibilityState === 'hidden') return;
    attempted = true;
    const date = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(new Date());
    const key = 'dotapp-anon-metric-session-' + date;
    let first = false;
    try { first = sessionStorage.getItem(key) !== '1'; } catch (_) { /* count open only */ }
    try {
      const response = await fetch(BASE + '/rest/v1/rpc/sd_anon_hit', {
        method: 'POST', mode: 'cors', credentials: 'omit', keepalive: true,
        headers: { apikey: KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_first_session: first })
      });
      if (response.ok && first) {
        try { sessionStorage.setItem(key, '1'); } catch (_) { /* no lasting state */ }
      }
    } catch (_) { /* analytics must never prevent app startup */ }
  }
  function onReady() {
    if (document.visibilityState === 'hidden' || document.visibilityState === 'prerender') {
      document.addEventListener('visibilitychange', recordOnce, { once: true });
    } else recordOnce();
  }
  // Counts successfully rendered app loads, not previews or broken splash screens.
  window.addEventListener('flutter-first-frame', onReady, { once: true });
})();
