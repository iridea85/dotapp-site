/* dōtapp support panel; opened exclusively by the native Flutter header action. */
(() => {
  'use strict';

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
    card.innerHTML='<div aria-hidden="true" style="width:48px;height:48px;margin:0 auto 10px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#fff0f2"><svg viewBox="0 0 512 512" width="26" height="26" aria-hidden="true" focusable="false"><g transform="translate(0 512) scale(1 -1)"><path fill="#d63b4c" d="M285 83C269 68 244 68 227 83L225 85C113 186 40 253 43 335C44 372 63 406 93 427C149 465 218 447 256 403C294 447 363 465 419 427C449 406 468 372 469 335C472 253 399 186 287 84L285 83Z"/></g></svg></div><h2 style="margin:0 0 10px;font-size:22px">Sostieni dōtapp</h2><p style="margin:0 0 18px;font-size:15px;line-height:1.45;color:#5b4a60">Se dōtapp ti è utile e vuoi sostenere il progetto, puoi farlo qui. Grazie per il tuo supporto 💜</p>';
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

  window.dotappOpenSupport = openDialog;
})();
