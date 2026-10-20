/* New-user installation guide. Uses the existing native prompt manager; never reads app data. */
(() => {
  'use strict';
  const w = window, DISMISSED = 'installation_intro_dismissed', INSTALLED = 'dotapp_installation_completed_v1';
  let panel, section, statusBox, continueButton, previousFocus, waitTimer, confirmationTimer;
  let platform, iosGuideOpen = false, timedOut = false, installedObserved = false, automaticChecked = false;
  const ios = () => /iPhone|iPad|iPod/i.test(navigator.userAgent || '') || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const safari = () => /Safari/i.test(navigator.userAgent || '') && !/CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo|GSA|Chrome|Android/i.test(navigator.userAgent || '');
  const standalone = () => !!w.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;
  const installed = () => installedObserved || standalone() || w.dotappPwaInstall?.status.installed === true;
  function read(key) { try { return localStorage.getItem(key); } catch (_) { return 'true'; } }
  function remember(key) { try { localStorage.setItem(key, 'true'); } catch (_) { /* The current visit remains usable without storage. */ } }
  function migrationOwnsScreen() {
    return /^#transfer=/.test(location.hash) || w.dotappMigrationOwnsInstall === true ||
      !!document.getElementById('dotapp-transfer-v2')?.isConnected || read('dotapp_transfer_completed_v2') === 'true' ||
      read('dotapp_backup_restore_journal_v1') !== null;
  }
  function node(tag, text, parent) { const el = document.createElement(tag); if (text) el.textContent = text; parent?.append(el); return el; }
  function button(text, action, parent, secondary = false) {
    const el = node('button', text, parent); el.type = 'button'; el.className = secondary ? 'intro-secondary' : 'intro-primary'; el.onclick = action; return el;
  }
  function close() {
    w.clearTimeout(waitTimer); w.clearTimeout(confirmationTimer); panel?.remove(); panel = null;
    previousFocus?.focus?.({preventScroll: true});
  }
  function continueInBrowser() { remember(DISMISSED); close(); }
  function paintStatus() {
    if (!panel?.isConnected || !statusBox) return;
    if (migrationOwnsScreen()) { close(); return; }
    // appinstalled owns the one-time confirmation below. Never recreate a badge on Home.
    if (installed()) { if (standalone()) close(); return; }
    statusBox.replaceChildren();
    const heading = node('h2', platform === 'ios' ? 'IPHONE / IPAD' : 'ANDROID', statusBox);
    heading.className = 'intro-platform-title';
    if (platform === 'ios') {
      node('p', 'Su iPhone l’installazione si fa da Safari.', statusBox);
      if (ios() && !safari()) node('p', 'Per installare dōtapp su iPhone, apri questa pagina in Safari.', statusBox).className = 'intro-note';
      function showSteps() {
        if (statusBox.querySelector('ol')) return;
        const list = node('ol', '', statusBox);
        for (const text of ['Apri dōtapp in Safari', 'Tocca il pulsante Condividi', 'Scorri e scegli “Aggiungi alla schermata Home”', 'Tocca “Aggiungi”']) node('li', text, list);
        list.tabIndex = -1;
      }
      button('COME INSTALLARE SU IPHONE', () => { iosGuideOpen = true; showSteps(); statusBox.querySelector('ol').focus({preventScroll: true}); }, statusBox);
      if (iosGuideOpen) showSteps();
      return;
    }
    node('p', 'Installa dōtapp come una vera app sul tuo telefono.', statusBox);
    const state = w.dotappPwaInstall?.status;
    if (state?.available) {
      button('INSTALLA DŌTAPP', () => {
        // This call stays synchronous in the real tap. The manager alone owns deferredPrompt.
        try { const work = w.dotappPwaInstall.install(); Promise.resolve(work).catch(() => { timedOut = true; paintStatus(); }); }
        catch (_) { timedOut = true; paintStatus(); }
      }, statusBox);
    } else {
      const waiting = !timedOut && (state?.pending !== false || state?.installing);
      const b = button(waiting ? 'Preparazione installazione…' : 'INSTALLA DŌTAPP', () => {}, statusBox);
      b.disabled = true;
      const p = node('p', waiting ? 'Stiamo preparando l’installazione. Puoi continuare a usare dōtapp nel browser.' :
        'Se il pulsante non compare, apri il menu del browser e scegli Installa app / Aggiungi alla schermata Home.', statusBox);
      p.className = 'intro-note'; p.setAttribute('role', 'status');
    }
  }
  function show({manual = false} = {}) {
    if (migrationOwnsScreen()) return;
    if (installed()) { remember(INSTALLED); return; }
    if (panel?.isConnected) { panel.focus(); return; }
    if (!manual && (read(DISMISSED) === 'true' || read(INSTALLED) === 'true')) return;
    previousFocus = document.activeElement;
    platform = ios() ? 'ios' : 'android'; iosGuideOpen = false; timedOut = false;
    panel = node('div', '', document.body); panel.id = 'dotapp-installation-intro';
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-labelledby', 'dotapp-intro-title'); panel.tabIndex = -1;
    section = node('section', '', panel); section.className = 'intro-content';
    const brand = node('header', '', section); brand.className = 'intro-brand';
    brand.innerHTML = '<svg viewBox="128 108 256 232" aria-hidden="true" focusable="false"><path fill="currentColor" d="M256 330 C231 309 132 249 132 183 C132 143 159 116 196 116 C222 116 241 130 256 150 C271 130 290 116 316 116 C353 116 380 143 380 183 C380 249 281 309 256 330 Z"/></svg><strong>dōtapp</strong>';
    node('h1', 'Installa dōtapp sul tuo telefono', section).id = 'dotapp-intro-title';
    node('p', 'Puoi usarla anche dal browser, ma installandola avrai un’esperienza più comoda e la troverai direttamente nella schermata Home.', section).className = 'intro-lead';
    const choices = node('div', '', section); choices.className = 'intro-choices';
    const android = button('ANDROID', () => select('android'), choices, true);
    const iphone = button('IPHONE / IPAD', () => select('ios'), choices, true);
    function select(value) {
      platform = value;
      android.setAttribute('aria-pressed', String(value === 'android')); iphone.setAttribute('aria-pressed', String(value === 'ios'));
      paintStatus();
    }
    statusBox = node('section', '', section); statusBox.className = 'intro-platform'; statusBox.setAttribute('aria-label', 'Guida installazione');
    continueButton = button('CONTINUA NEL BROWSER', continueInBrowser, section, true); continueButton.className += ' intro-continue';
    select(platform);
    waitTimer = w.setTimeout(() => { timedOut = true; paintStatus(); }, 30000);
    panel.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const buttons = [...panel.querySelectorAll('button')].filter(b => !b.disabled);
      if (!buttons.length) return;
      const index = buttons.indexOf(document.activeElement);
      if (index < 0 || (!event.shiftKey && index === buttons.length - 1) || (event.shiftKey && index === 0)) {
        event.preventDefault(); buttons[event.shiftKey ? buttons.length - 1 : 0].focus();
      }
    });
    panel.focus({preventScroll: true});
  }
  function mountSettings(shade) {
    if (shade.querySelector('[data-installation-guide]')) return;
    const anchor = shade.querySelector('[data-backup]')?.parentElement;
    if (!anchor) return;
    const row = node('div', ''); row.style.marginTop = '18px';
    const b = button('Guida installazione dōtapp', () => { shade.remove(); show({manual: true}); }, row, true);
    b.setAttribute('data-installation-guide', '');
    b.style.cssText = 'font:inherit;font-weight:600;min-height:48px;border:1px solid #d8c9de;background:white;color:#60476b;border-radius:10px;padding:12px;width:100%';
    if (installed()) { b.textContent = '✅ dōtapp è installato'; b.disabled = true; }
    anchor.after(row);
  }
  function start() {
    if (automaticChecked) return; automaticChecked = true;
    if (migrationOwnsScreen()) return;
    if (installed()) { remember(INSTALLED); return; }
    // Optional browser-supported detection only; never infer installation from a prior tap.
    try {
      const related = navigator.getInstalledRelatedApps?.();
      if (related) Promise.resolve(related).then(apps => {
        if (apps?.some(app => app.platform === 'webapp' && [app.id, app.url].some(value => {
          if (!value) return false; try { return new URL(value, location.href).href === location.origin + '/'; } catch (_) { return false; }
        }))) { installedObserved = true; remember(INSTALLED); close(); }
      }).catch(() => {});
    } catch (_) {}
    show();
  }
  // Kept independent of Flutter startup, the transport and all personal-data keys.
  try {
    const style = node('style', '', document.head);
    style.textContent = `#dotapp-installation-intro{position:fixed;inset:0;z-index:2147483645;overflow-y:auto;background:#faf7fa;color:#302637;font:16px/1.5 system-ui,sans-serif;box-sizing:border-box;padding:calc(24px + env(safe-area-inset-top)) 20px calc(24px + env(safe-area-inset-bottom));outline:none}#dotapp-installation-intro *{box-sizing:border-box}#dotapp-installation-intro .intro-content{max-width:540px;margin:auto}#dotapp-installation-intro .intro-brand{color:#6e5578;display:flex;flex-direction:column;align-items:center;gap:4px;margin:8px 0 24px}#dotapp-installation-intro .intro-brand svg{width:68px;height:62px}#dotapp-installation-intro .intro-brand strong{font-size:27px;font-weight:650}#dotapp-installation-intro h1{font-size:clamp(25px,6vw,32px);line-height:1.2;letter-spacing:-.025em;text-align:center;margin:0 0 16px}#dotapp-installation-intro .intro-lead{text-align:center;color:#65566b;margin:0 0 26px}#dotapp-installation-intro .intro-choices{display:grid;grid-template-columns:1fr 1fr;gap:10px}#dotapp-installation-intro button{font:inherit;font-size:14px;font-weight:700;min-height:50px;cursor:pointer;border-radius:13px;padding:13px 12px}#dotapp-installation-intro button:focus-visible{outline:3px solid #ac7aaf;outline-offset:3px}#dotapp-installation-intro .intro-secondary{color:#60476b;border:1px solid #d7c9dc;background:white}#dotapp-installation-intro [aria-pressed=true]{color:white;background:#6e5578;border-color:#6e5578}#dotapp-installation-intro .intro-primary{width:100%;border:0;background:#6e5578;color:white}#dotapp-installation-intro button:disabled{cursor:default;opacity:.65}#dotapp-installation-intro .intro-platform{background:white;border:1px solid #e8dfeb;border-radius:18px;padding:20px;margin:14px 0 8px}#dotapp-installation-intro .intro-platform-title{font-size:16px;letter-spacing:.04em;margin:0 0 8px}#dotapp-installation-intro .intro-platform p{margin:8px 0 18px}#dotapp-installation-intro .intro-note{font-size:14px;color:#65566b}#dotapp-installation-intro ol{padding-left:23px;margin:20px 0 0}#dotapp-installation-intro li{margin:12px 0;padding-left:4px}#dotapp-installation-intro .intro-continue{display:block;width:100%;border:0;background:none;margin-top:12px}#dotapp-installation-intro .intro-confirmation{text-align:center;padding:40px 8px}`;
    w.dotappInstallationIntro = Object.freeze({open: () => show({manual: true}), mountSettings});
    w.dotappPwaInstall?.subscribe(() => { try { paintStatus(); } catch (_) { close(); } });
    w.addEventListener('appinstalled', () => {
      if (migrationOwnsScreen()) return;
      installedObserved = true; remember(INSTALLED); remember(DISMISSED);
      if (!panel?.isConnected) {
        const toast = node('div', '✅ dōtapp installato', document.body); toast.setAttribute('role', 'status');
        toast.style.cssText = 'position:fixed;bottom:calc(90px + env(safe-area-inset-bottom));left:20px;right:20px;z-index:2147483645;background:#6e5578;color:white;padding:16px;text-align:center;border-radius:14px;font:600 16px system-ui';
        w.setTimeout(() => toast.remove(), 1800); return;
      }
      w.clearTimeout(waitTimer); section.replaceChildren(); statusBox = null;
      node('h2', '✅ dōtapp installato', section).className = 'intro-confirmation';
      confirmationTimer = w.setTimeout(close, 1800);
    });
    const safeStart = () => { try { start(); } catch (_) { close(); } };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', safeStart, {once: true}); else safeStart();
  } catch (_) { close(); /* Never block Flutter or migration. */ }
})();
