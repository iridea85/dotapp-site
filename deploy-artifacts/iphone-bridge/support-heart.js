/* dōtapp support heart — compact header action beside Settings. */
(() => {
  'use strict';
  if (window.__dotappSupportHeartHeaderV3) return;
  window.__dotappSupportHeartHeaderV3 = true;

  const SUPPORT_URL='https://revolut.me/irideaf';
  const HEART_ID='dotapp-support-heart';
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
    card.innerHTML='<div aria-hidden="true" style="font-size:34px;line-height:1;color:#d63b4c;margin-bottom:8px">♥</div><h2 style="margin:0 0 10px;font-size:22px">Sostieni dōtapp</h2><p style="margin:0 0 18px;font-size:15px;line-height:1.45;color:#5b4a60">Se dōtapp ti è utile e vuoi sostenere il progetto, puoi farlo qui. Grazie per il tuo supporto 💜</p>';
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

  function mount(){
    if(!document.body || document.getElementById(HEART_ID)) return;
    const b=document.createElement('button');
    b.id=HEART_ID;
    b.type='button';
    b.setAttribute('aria-label','Sostieni dōtapp');
    b.title='Sostieni dōtapp';
    b.textContent='♥';
    b.style.cssText=[
      'position:fixed',
      'top:calc(16px + env(safe-area-inset-top))',
      'right:150px',
      'z-index:1000002',
      'width:38px',
      'height:38px',
      'padding:0',
      'margin:0',
      'border:0',
      'border-radius:50%',
      'background:transparent',
      'color:#d63b4c',
      'font:700 26px/38px system-ui,-apple-system,sans-serif',
      'text-align:center',
      'cursor:pointer',
      'filter:drop-shadow(0 1px 1px rgba(0,0,0,.10))'
    ].join(';');
    b.onclick=openDialog;
    document.body.append(b);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})();