/* dōtapp support heart — Home only, positioned beside Settings. */
(() => {
  'use strict';
  if (window.__dotappSupportHeartHomeV2) return;
  window.__dotappSupportHeartHomeV2 = true;

  const SUPPORT_URL='https://revolut.me/irideaf';
  const HEART_ID='dotapp-support-heart';
  const DIALOG_ID='dotapp-support-dialog';
  const SIZE=36, GAP=8;

  function closeDialog(){ document.getElementById(DIALOG_ID)?.remove(); }

  function openDialog(){
    closeDialog();
    const shade=document.createElement('div');
    shade.id=DIALOG_ID;
    shade.style.cssText='position:fixed;inset:0;z-index:1000004;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;background:rgba(25,15,31,.48);font-family:system-ui,-apple-system,sans-serif';
    const card=document.createElement('section');
    card.setAttribute('role','dialog'); card.setAttribute('aria-modal','true');
    card.style.cssText='width:min(100%,420px);background:#fff;color:#302637;border-radius:20px;padding:22px;box-shadow:0 18px 56px rgba(32,16,39,.32);box-sizing:border-box;text-align:center';
    card.innerHTML='<div aria-hidden="true" style="font-size:34px;line-height:1;color:#d63b4c;margin-bottom:8px">♥</div><h2 style="margin:0 0 10px;font-size:22px">Sostieni dōtapp</h2><p style="margin:0 0 18px;font-size:15px;line-height:1.45;color:#5b4a60">Se dōtapp ti è utile e vuoi sostenere il progetto, puoi farlo qui. Grazie per il tuo supporto 💜</p>';
    const support=document.createElement('a');
    support.href=SUPPORT_URL; support.target='_blank'; support.rel='noopener noreferrer'; support.textContent='SOSTIENI DŌTAPP';
    support.style.cssText='display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 16px;border-radius:12px;background:#6e5578;color:#fff;text-decoration:none;font-weight:700;font-size:14px';
    const close=document.createElement('button');
    close.type='button'; close.textContent='CHIUDI'; close.style.cssText='min-height:46px;padding:0 16px;margin-left:10px;border-radius:12px;border:1px solid #d8c9de;background:#fff;color:#60476b;font-weight:700;font-size:14px';
    close.onclick=closeDialog;
    card.append(support,close); shade.append(card); shade.onclick=e=>{if(e.target===shade)closeDialog();};
    document.body.append(shade);
  }

  function visible(el){
    if(!(el instanceof Element)) return false;
    const r=el.getBoundingClientRect(), s=getComputedStyle(el);
    return r.width>16&&r.height>16&&r.bottom>0&&r.right>0&&r.top<innerHeight&&r.left<innerWidth&&s.display!=='none'&&s.visibility!=='hidden'&&s.opacity!=='0';
  }

  function findSettings(){
    for(const el of document.querySelectorAll('[aria-label*="impostazioni" i],[title*="impostazioni" i],[data-tooltip*="impostazioni" i]')) if(visible(el)) return el;
    for(const el of document.querySelectorAll('button,[role="button"],flt-semantics')){
      if(!visible(el)) continue;
      const t=[el.getAttribute?.('aria-label'),el.getAttribute?.('title'),el.textContent].filter(Boolean).join(' ').toLocaleLowerCase('it-IT');
      if(t.includes('impostazioni')) return el;
    }
    return null;
  }

  function ensureHeart(){
    let b=document.getElementById(HEART_ID);
    if(b) return b;
    b=document.createElement('button');
    b.id=HEART_ID; b.type='button'; b.setAttribute('aria-label','Sostieni dōtapp'); b.title='Sostieni dōtapp'; b.textContent='♥';
    b.style.cssText='position:fixed;z-index:1000002;display:none;width:36px;height:36px;padding:0;margin:0;border:0;background:transparent;color:#d63b4c;font:700 24px/36px system-ui,-apple-system,sans-serif;text-align:center;cursor:pointer;filter:drop-shadow(0 1px 1px rgba(0,0,0,.10))';
    b.onclick=openDialog; document.body.append(b); return b;
  }

  function sync(){
    const b=ensureHeart(), settings=findSettings();
    if(!settings){ b.style.display='none'; closeDialog(); return; }
    const r=settings.getBoundingClientRect();
    b.style.top=Math.max(0,r.top+(r.height-SIZE)/2)+'px';
    b.style.left=Math.max(4,r.left-GAP-SIZE)+'px';
    b.style.right='auto';
    b.style.display='block';
  }

  let raf=0;
  const schedule=()=>{ if(raf) cancelAnimationFrame(raf); raf=requestAnimationFrame(()=>{raf=0;sync();}); };
  const boot=()=>{
    ensureHeart();
    new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['aria-label','title','style','class']});
    addEventListener('resize',schedule,{passive:true}); addEventListener('orientationchange',schedule,{passive:true});
    addEventListener('popstate',schedule); addEventListener('hashchange',schedule); document.addEventListener('visibilitychange',schedule);
    setInterval(schedule,900); schedule();
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();