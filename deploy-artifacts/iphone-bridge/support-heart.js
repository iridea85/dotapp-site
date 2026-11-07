/* dōtapp support heart — visual-only overlay, no app data writes. */
(() => {
  'use strict';
  if (window.__dotappSupportHeartMounted) return;
  window.__dotappSupportHeartMounted = true;

  const SUPPORT_URL = 'https://revolut.me/irideaf';
  const HEART_ID = 'dotapp-support-heart';
  const DIALOG_ID = 'dotapp-support-dialog';

  function closeDialog() {
    document.getElementById(DIALOG_ID)?.remove();
  }

  function openDialog() {
    closeDialog();
    const shade = document.createElement('div');
    shade.id = DIALOG_ID;
    shade.setAttribute('role', 'presentation');
    shade.style.cssText = [
      'position:fixed','inset:0','z-index:1000004','display:flex','align-items:center','justify-content:center',
      'padding:24px','box-sizing:border-box','background:rgba(25,15,31,.48)','font-family:system-ui,-apple-system,sans-serif'
    ].join(';');

    const card = document.createElement('section');
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    card.setAttribute('aria-labelledby', 'dotapp-support-title');
    card.style.cssText = [
      'width:min(100%,420px)','background:#fff','color:#302637','border-radius:20px','padding:22px',
      'box-shadow:0 18px 56px rgba(32,16,39,.32)','box-sizing:border-box','text-align:center'
    ].join(';');

    const heart = document.createElement('div');
    heart.textContent = '♥';
    heart.setAttribute('aria-hidden', 'true');
    heart.style.cssText = 'font-size:34px;line-height:1;color:#6e5578;margin-bottom:8px';

    const title = document.createElement('h2');
    title.id = 'dotapp-support-title';
    title.textContent = 'Sostieni dōtapp';
    title.style.cssText = 'margin:0 0 10px;font-size:22px;line-height:1.2';

    const text = document.createElement('p');
    text.textContent = 'Se dōtapp ti è utile e vuoi sostenere il progetto, puoi farlo qui. Grazie per il tuo supporto 💜';
    text.style.cssText = 'margin:0 0 18px;font-size:15px;line-height:1.45;color:#5b4a60';

    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;justify-content:center';

    const support = document.createElement('a');
    support.href = SUPPORT_URL;
    support.target = '_blank';
    support.rel = 'noopener noreferrer';
    support.textContent = 'SOSTIENI DŌTAPP';
    support.style.cssText = [
      'display:inline-flex','align-items:center','justify-content:center','min-height:46px','padding:0 16px',
      'border-radius:12px','background:#6e5578','color:#fff','text-decoration:none','font-weight:700','font-size:14px'
    ].join(';');

    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'CHIUDI';
    close.style.cssText = [
      'min-height:46px','padding:0 16px','border-radius:12px','border:1px solid #d8c9de','background:#fff',
      'color:#60476b','font-weight:700','font-size:14px'
    ].join(';');
    close.addEventListener('click', closeDialog);

    actions.append(support, close);
    card.append(heart, title, text, actions);
    shade.append(card);
    shade.addEventListener('click', event => { if (event.target === shade) closeDialog(); });
    document.addEventListener('keydown', function escape(event) {
      if (event.key !== 'Escape') return;
      closeDialog();
      document.removeEventListener('keydown', escape);
    });
    document.body.append(shade);
    close.focus();
  }

  function mount() {
    if (!document.body || document.getElementById(HEART_ID)) return;
    const button = document.createElement('button');
    button.id = HEART_ID;
    button.type = 'button';
    button.setAttribute('aria-label', 'Sostieni dōtapp');
    button.title = 'Sostieni dōtapp';
    button.innerHTML = '<span aria-hidden="true" style="font-size:18px;line-height:1">♥</span><span>Sostieni dōtapp</span>';
    button.style.cssText = [
      'position:fixed','top:calc(10px + env(safe-area-inset-top))','right:58px','z-index:1000002',
      'display:flex','align-items:center','gap:5px','min-height:34px','padding:5px 9px','border:1px solid rgba(110,85,120,.22)',
      'border-radius:999px','background:rgba(255,255,255,.94)','color:#6e5578','box-shadow:0 3px 14px rgba(32,16,39,.12)',
      'font:700 11px/1.1 system-ui,-apple-system,sans-serif','cursor:pointer','backdrop-filter:blur(8px)','-webkit-backdrop-filter:blur(8px)'
    ].join(';');
    button.addEventListener('click', openDialog);
    document.body.append(button);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true});
  else mount();
})();