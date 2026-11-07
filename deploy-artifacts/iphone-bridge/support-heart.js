/* dōtapp support panel; opened exclusively by the native Flutter header action. */
(() => {
  'use strict';
  if (window.__dotappSupportPanelNativeV4) return;
  window.__dotappSupportPanelNativeV4 = true;

  const SUPPORT_URL='https://revolut.me/irideaf';
  const DIALOG_ID='dotapp-support-dialog';

  function closeDialog(){ document.getElementById(DIALOG_ID)?.remove(); }

  function openDialog(){
    closeDialog();
    const shade=document.createElement('div');
    shade.id=DIALOG_ID;
    shade.style.cssText='position:fixed;inset:0;z-index:1000004;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;background:rgba(25,15,31,.48);font-family:system-ui,-apple-system,sans-serif';
    const card=document.createElement('section');
    card.setAttribute('role','dialog');
    card.setAttribute('aria-modal','true');
    card.style.cssText='width:min(100%,420px);background:#fff;color:#302637;border-radius:20px;padding:22px;box-shadow:0 18px 56px rgba(32,16,39,.32);box-sizing:border-box;text-align:center';
    card.innerHTML='<div aria-hidden="true" style="width:48px;height:48px;margin:0 auto 10px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#fff0f2"><svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" focusable="false"><path fill="#d63b4c" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></div><h2 style="margin:0 0 10px;font-size:22px">Sostieni dōtapp</h2><p style="margin:0 0 18px;font-size:15px;line-height:1.45;color:#5b4a60">Se dōtapp ti è utile e vuoi sostenere il progetto, puoi farlo qui. Grazie per il tuo supporto 💜</p>';
    const support=document.createElement('a');
    support.href=SUPPORT_URL;
    support.target='_blank';
    support.rel='noopener noreferrer';
    support.textContent='SOSTIENI DŌTAPP';
    support.style.cssText='display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 16px;border-radius:12px;background:#6e5578;color:#fff;text-decoration:none;font-weight:700;font-size:14px';
    const close=document.createElement('button');
    close.type='button';
    close.textContent='CHIUDI';
    close.style.cssText='min-height:46px;padding:0 16px;margin-left:10px;border-radius:12px;border:1px solid #d8c9de;background:#fff;color:#60476b;font-weight:700;font-size:14px';
    close.onclick=closeDialog;
    card.append(support,close);
    shade.append(card);
    shade.onclick=e=>{if(e.target===shade)closeDialog();};
    document.body.append(shade);
  }


  // Production fallback for the native Flutter heart.
  // No visual overlay: this only forwards a tap in the heart's header slot
  // to the existing support panel if the compiled web bridge does not fire.
  function isNativeHeartTarget(event) {
    const x = event.clientX, y = event.clientY;
    if (typeof x !== 'number' || typeof y !== 'number') return false;
    // Native AppBar row = 36px heart immediately before 48px Settings.
    // Keep a small tolerance without touching the Settings hitbox.
    const left = innerWidth - 104;
    const right = innerWidth - 62;
    const top = 34;
    const bottom = 92;
    return x >= left && x <= right && y >= top && y <= bottom;
  }

  // Reliable production fallback for CanvasKit: pointer events reach window capture
  // even when Flutter consumes the synthetic click. This adds no visual overlay.
  let heartPointerDown = false;
  function inNativeHeartSlot(event) {
    const x = event.clientX, y = event.clientY;
    if (typeof x !== 'number' || typeof y !== 'number') return false;
    // Native AppBar actions: 36px heart immediately before the 48px Settings gear.
    // Reserve the gear hitbox completely; use only the heart's own slot.
    // AppBar layout: right padding ~20px, 48px Settings, then 36px heart.
    // Therefore heart occupies [width-104, width-68].
    const leftEdgeOfHeart = innerWidth - 104;
    const rightEdgeOfHeart = innerWidth - 68;
    const appBarTop = 16;
    const appBarBottom = 86;
    return x >= leftEdgeOfHeart && x < rightEdgeOfHeart && y >= appBarTop && y <= appBarBottom;
  }

  window.addEventListener('pointerdown', event => {
    heartPointerDown = inNativeHeartSlot(event);
    if (!heartPointerDown) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, {capture:true, passive:false});

  window.addEventListener('pointerup', event => {
    const activate = heartPointerDown && inNativeHeartSlot(event);
    heartPointerDown = false;
    if (!activate) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    setTimeout(openDialog, 0);
  }, {capture:true, passive:false});

  window.addEventListener('pointercancel', () => { heartPointerDown = false; }, {capture:true, passive:true});

  window.dotappOpenSupport = openDialog;
})();
