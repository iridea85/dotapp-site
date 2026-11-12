// Private preview: assistance and protected Admin entry only.
(() => {
  const version = 'v27';
  function genericDevice() {
    const ua = navigator.userAgent || '';
    if (/Android/i.test(ua)) return /Chrome|CriOS/i.test(ua) ? 'Android · Chrome' : 'Android · altro browser';
    if (/iPhone|iPad|iPod/i.test(ua)) return /Safari/i.test(ua) ? 'iOS · Safari' : 'iOS · altro browser';
    if (/Firefox/i.test(ua)) return 'Desktop · Firefox';
    if (/Chrome/i.test(ua)) return 'Desktop · Chrome';
    if (/Safari/i.test(ua)) return 'Desktop · Safari';
    return 'Altro dispositivo';
  }

  // Presentation only: preserve mounted controls, their labels and existing callbacks.
  function styleSettings(shade) {
    const paths = {
      backup: '<path d="M12 3v12m-4-4 4 4 4-4M5 15v5h14v-5"/>',
      install: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M9 11l2 2 4-4M10 18h4"/>',
      order: '<path d="M8 6h12M8 12h12M8 18h12M3 4v16m-2-2 2 2 2-2"/>',
      messages: '<path d="M20 15a3 3 0 0 1-3 3H8l-5 3V6a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3zM7 8h9M7 12h6"/>',
      admin: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>'
    };
    for (const [selector, icon] of [['[data-backup]','backup'], ['[data-installation-guide]','install'], ['[data-nav-order]','order'], ['[data-messages]','messages'], ['[data-admin]','admin']]) {
      const button = shade.querySelector(selector);
      if (!button) continue;
      const label = button.textContent.replace(/^✅\s*/, '');
      const installed = selector === '[data-installation-guide]' && button.disabled;
      button.classList.add('settings-action');
      if (installed) button.classList.add('settings-installed');
      const mark = document.createElement('span'); mark.className = 'settings-icon'; mark.setAttribute('aria-hidden','true');
      mark.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + (installed ? '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>' : paths[icon]) + '</svg>';
      const text = document.createElement('span'); text.className = 'settings-label'; text.textContent = label;
      const end = document.createElement('span'); end.className = 'settings-chevron'; end.setAttribute('aria-hidden','true');
      end.innerHTML = installed ? '' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>';
      button.replaceChildren(mark, text, end);
    }
  }

  function showPanel() {
    if (document.querySelector('#scorta-settings-panel')) return;
    const shade = document.createElement('div');
    shade.id = 'scorta-settings-panel';
    shade.style.cssText = 'position:fixed;inset:0;z-index:999999;background:#22152988;display:grid;place-items:center;padding:16px;font:16px system-ui,sans-serif';
    shade.innerHTML = `<style>
      #scorta-settings-panel { padding:12px!important; }
      #scorta-settings-panel * { box-sizing:border-box; }
      #scorta-settings-panel .settings-dialog { width:100%;max-width:460px;max-height:calc(100vh - 24px);max-height:calc(100dvh - 24px);padding:20px!important;border:1px solid #e7dfea;border-radius:22px!important;box-shadow:0 22px 70px #24122d33!important; }
      #scorta-settings-panel header { gap:12px;padding-bottom:18px;border-bottom:1px solid #eee8f0; }
      #scorta-settings-panel h2 { font-size:22px!important;letter-spacing:-.025em;font-weight:700; }
      #scorta-settings-panel [data-close] { display:grid;place-items:center;width:36px;height:36px;padding:0;border-radius:50%;background:#f5f0f7!important;flex-shrink:0;cursor:pointer; }
      #scorta-settings-panel .settings-actions { display:grid;grid-auto-rows:1fr;gap:8px;margin-top:18px; }
      #scorta-settings-panel .settings-actions>div { margin:0!important;min-width:0; }
      #scorta-settings-panel .settings-action { display:flex!important;align-items:center;gap:12px;width:100%!important;height:100%;min-height:64px;padding:12px!important;border:1px solid #e1d6e6!important;border-radius:14px!important;background:#fff!important;color:#60476b!important;font:650 .875rem/1.35 system-ui,sans-serif!important;text-align:left;text-decoration:none!important;cursor:pointer;box-shadow:0 2px 5px #35213d04; }
      #scorta-settings-panel .settings-label { flex:1;min-width:0;overflow-wrap:break-word; }
      #scorta-settings-panel .settings-icon { display:grid;place-items:center;width:36px;height:36px;flex:0 0 36px;border-radius:10px;background:#f3edf6;color:#70537d; }
      #scorta-settings-panel .settings-icon svg { width:21px;height:21px; }
      #scorta-settings-panel .settings-chevron { width:14px;flex:0 0 14px;color:#99869f; }
      #scorta-settings-panel .settings-chevron svg { display:block;width:14px;height:14px; }
      #scorta-settings-panel [data-backup] { background:#faf7fc!important;border-color:#d6c5df!important; }
      #scorta-settings-panel .settings-installed { color:#38614d!important;background:#f5faf7!important;border-color:#dce9e1!important;opacity:1!important;cursor:default; }
      #scorta-settings-panel .settings-installed .settings-icon { background:#e7f2ec;color:#47745c; }
      #scorta-settings-panel .settings-action:enabled:hover { border-color:#bca6c6!important;background:#f8f4fa!important; }
      #scorta-settings-panel button:focus-visible,#scorta-settings-panel input:focus-visible,#scorta-settings-panel textarea:focus-visible,#scorta-settings-panel select:focus-visible { outline:3px solid #a780b6;outline-offset:2px; }
      #scorta-settings-panel .settings-report { margin-top:20px!important;padding:16px!important;border:1px solid #e5dce9!important;border-radius:16px;background:#faf8fb; }
      #scorta-settings-panel .settings-report>strong { display:block;font-size:.75rem;letter-spacing:.07em;font-weight:750;color:#6c5676; }
      #scorta-settings-panel .settings-report label { display:block;font-size:.875rem;font-weight:600;color:#584760; }
      #scorta-settings-panel .settings-report select,#scorta-settings-panel .settings-report textarea { max-width:100%;border:1px solid #d8cbdf;border-radius:10px;background:#fff;color:#302637;font:400 .9375rem/1.4 system-ui,sans-serif; }
      #scorta-settings-panel .settings-report select { min-height:44px; }
      #scorta-settings-panel .settings-report textarea { resize:vertical; }
      #scorta-settings-panel .settings-report button { min-height:46px;font-size:.875rem!important;font-weight:650!important;border-radius:11px!important; }
      #scorta-settings-panel .settings-admin { margin-top:12px!important;padding-top:0!important;border-top:0!important; }
      #scorta-settings-panel .settings-admin .settings-action { min-height:56px;background:#faf8fb!important;box-shadow:none; }
      #scorta-settings-panel .settings-admin .settings-icon { width:32px;height:32px;flex-basis:32px;background:#eee7f2; }
      @media(max-width:359px) { #scorta-settings-panel .settings-dialog { padding:16px!important; } #scorta-settings-panel .settings-action { gap:8px;padding:10px!important; } #scorta-settings-panel .settings-icon { width:32px;height:32px;flex-basis:32px; } #scorta-settings-panel .settings-chevron { display:none; } }
    </style><section class="settings-dialog" role="dialog" aria-modal="true" aria-label="Impostazioni dōtapp" style="background:white;color:#302637;border-radius:18px;max-width:460px;width:100%;max-height:90vh;overflow:auto;padding:22px;box-shadow:0 18px 45px #0003">
      <header style="display:flex;justify-content:space-between;align-items:center"><h2 style="margin:0;font-size:22px">Impostazioni</h2><button type="button" data-close aria-label="Chiudi" style="border:0;background:none;font-size:26px;color:#6e5578">×</button></header>
      <div class="settings-actions"><div style="margin-top:18px"><button type="button" data-backup style="font:inherit;font-weight:600;border:1px solid #d8c9de;background:white;color:#60476b;border-radius:10px;padding:12px;width:100%">BACKUP E TRASFERIMENTO DATI</button></div>
      <div style="margin-top:18px"><button type="button" data-nav-order style="font:inherit;font-weight:700;border:1px solid #d8c9de;background:white;color:#60476b;border-radius:10px;padding:12px 14px;width:100%">ORDINE MENU INFERIORE</button></div>
      <div style="margin-top:18px"><button type="button" data-messages style="font:inherit;border:1px solid #d8c9de;background:white;color:#60476b;border-radius:10px;padding:11px 14px;width:100%">Messaggi App</button></div>
      </div><div class="settings-report" style="border-top:1px solid #e8dfeb;margin-top:18px;padding-top:16px"><strong>SEGNALA UN PROBLEMA</strong><form data-report style="display:grid;gap:12px;margin-top:12px"><label>Categoria<select required name="category" style="display:block;width:100%;padding:10px;margin-top:5px"><option>Funzionamento</option><option>Catalogo</option><option>Altro</option></select></label><label>Descrizione<textarea required minlength="10" maxlength="2000" name="description" style="display:block;width:100%;min-height:90px;padding:10px;margin-top:5px"></textarea></label><button type="submit" style="background:#6e5578;color:white;border:0;border-radius:10px;padding:12px 18px;font:inherit">Invia segnalazione</button></form></div>
      <div class="settings-admin" style="border-top:1px solid #e8dfeb;margin-top:20px;padding-top:16px"><button type="button" data-admin style="font:inherit;font-size:14px;color:#6e5578;border:0;background:none;padding:0;text-decoration:underline;text-underline-offset:3px">AREA ADMIN</button></div>
      <section data-support aria-labelledby="scorta-support-title" style="border:1px solid #e8dfeb;border-radius:12px;margin-top:18px;padding:14px;background:#faf8fb">
        <h3 id="scorta-support-title" style="margin:0;font-size:16px;font-weight:600">❤️ Sostieni dōtapp</h3>
        <p style="margin:8px 0;font-size:14px;line-height:1.5">Se l’app ti è utile e vuoi contribuire volontariamente al suo mantenimento, puoi offrire un piccolo supporto.</p>
        <p style="margin:0 0 10px;font-size:13px;line-height:1.5;color:#60476b">È facoltativo: l’app resta utilizzabile senza contribuire. Nessun abbonamento, nessuna funzione premium e nessun importo obbligatorio.</p>
        <a href="https://revolut.me/irideaf" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;min-height:44px;box-sizing:border-box;padding:10px 14px;border:1px solid #d8c9de;border-radius:10px;background:white;color:#60476b;font-size:14px;font-weight:600;text-decoration:none">SOSTIENI L’APP</a>
      </section>
      <details data-app-info style="border-top:1px solid #e8dfeb;margin-top:20px;padding-top:16px">
        <summary style="cursor:pointer;min-height:44px;display:list-item;font-weight:600">Informazioni sull’app</summary>
        <h3 style="margin:8px 0">dōtapp</h3>
        <p style="font-size:14px;line-height:1.5">La tua scorta di oli, organizzata.</p>
        <p style="font-size:13px;line-height:1.5">Applicazione indipendente. Non affiliata a dōTERRA.</p>
        <h4 style="font-size:14px">INFORMAZIONI E MARCHI</h4>
        <p style="font-size:13px;line-height:1.6">dōtapp è un’applicazione indipendente e non è affiliata, sponsorizzata, approvata o sviluppata da dōTERRA o dalle sue società affiliate.</p>
        <p style="font-size:13px;line-height:1.6">dōTERRA® e i nomi dei prodotti eventualmente citati appartengono ai rispettivi titolari e vengono utilizzati esclusivamente per identificare i prodotti gestiti dall’utente nell’app.</p>
        <p style="font-size:13px;line-height:1.6">I contenuti personali inseriti nel Ricettario sono creati e gestiti dall’utente.</p>
      </details>
      <p data-status role="status" style="font-size:14px;color:#60476b;min-height:20px"></p></section>`;
    document.body.append(shade);
    window.dotappMigration?.mountSettings(shade);
    window.dotappInstallationIntro?.mountSettings(shade);
    window.dotappUpdates?.mountSettings(shade);
    styleSettings(shade);
    const status = shade.querySelector('[data-status]');
    shade.querySelector('[data-backup]').onclick = () => window.dotappBackup?.open();
    shade.querySelector('[data-admin]').onclick = () => {
      if (!window.scortaOpenAdmin) { status.textContent = 'Attendi il caricamento dell’app e riprova.'; return; }
      shade.remove(); window.scortaOpenAdmin();
    };
    shade.querySelector('[data-nav-order]').onclick = () => {
      if (!window.scortaOpenNavSettings) { status.textContent = 'Attendi il caricamento dell’app e riprova.'; return; }
      shade.remove(); window.scortaOpenNavSettings();
    };
    shade.querySelector('[data-messages]').onclick = () => { shade.remove(); window.scortaOpenMessages?.(); };
    shade.querySelector('[data-close]').onclick = () => shade.remove();
    shade.addEventListener('click', event => { if (event.target === shade) shade.remove(); });
    shade.querySelector('[data-report]').onsubmit = async event => {
      event.preventDefault();
      const form = event.currentTarget;
      const button = form.querySelector('button[type="submit"]');
      const data = new FormData(form);
      button.disabled = true;
      status.textContent = '';
      try {
        const response = await fetch('https://ozgpdglnycmmhilvsqsw.supabase.co/rest/v1/sd_reports', {
          method: 'POST', credentials: 'omit', headers: { 'Content-Type': 'application/json', apikey: 'sb_publishable_3VIXsCBHD6ugmcuBkZ4sqA_xuudgE60', Prefer: 'return=minimal' },
          body: JSON.stringify({ category: data.get('category'), description: data.get('description'), app_version: version, device_info: genericDevice() }),
        });
        const result = response.status === 201 || response.status === 204 ? {} : await response.json();
        if (!response.ok) throw new Error(result.message || result.error || 'Invio non riuscito');
        form.reset(); status.textContent = 'Segnalazione inviata.';
      } catch (error) { status.textContent = error.message || 'Invio non riuscito.'; }
      finally { button.disabled = false; }
    };
  }

  window.scortaOpenSettings = showPanel;
})();
