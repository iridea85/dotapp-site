/* Private Admin analytics panel. Independent from current Admin auth/UI. */
(() => {
  'use strict';
  const API='https://ozgpdglnycmmhilvsqsw.supabase.co';
  const KEY='sb_publishable_3VIXsCBHD6ugmcuBkZ4sqA_xuudgE60';
  const create=(tag,parent,text)=>{const x=document.createElement(tag);if(text!==undefined)x.textContent=text;if(parent)parent.append(x);return x;};
  function open() {
    if(document.querySelector('#dotapp-anon-stats'))return;
    const shade=create('div',document.body);shade.id='dotapp-anon-stats';
    shade.style.cssText='position:fixed;inset:0;z-index:1000001;background:#24192b99;display:grid;place-items:center;padding:16px;font:15px system-ui,sans-serif';
    const panel=create('section',shade);panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');
    panel.setAttribute('aria-label','Statistiche anonime dōtapp');
    panel.style.cssText='box-sizing:border-box;max-width:490px;width:100%;max-height:92vh;overflow:auto;border-radius:17px;background:#fff;color:#302637;padding:20px';
    const head=create('div',panel);head.style.cssText='display:flex;justify-content:space-between;align-items:center';
    const title=create('h2',head,'Statistiche anonime');title.style='margin:0;font-size:21px';
    const close=create('button',head,'✕');close.type='button';close.setAttribute('aria-label','Chiudi');
    close.style='font:inherit;background:none;border:0;padding:8px;color:#60476b';close.onclick=()=>shade.remove();
    const desc=create('p',panel,'Aperture e sessioni per giorno. Non equivalgono a persone uniche.');
    desc.style='font-size:13px;line-height:1.5';
    const optRow=create('label',panel);optRow.style='display:flex;align-items:center;gap:10px;font-size:13px;margin:12px 0';
    const opt=create('input',optRow);opt.type='checkbox';
    try { opt.checked=localStorage.getItem('dotapp-analytics-opt-out')==='1'; } catch (_) {}
    create('span',optRow,'Non conteggiare le aperture da questo dispositivo');
    opt.onchange=()=>{try{if(opt.checked)localStorage.setItem('dotapp-analytics-opt-out','1');else localStorage.removeItem('dotapp-analytics-opt-out');}catch(_){} };
    const status=create('p',panel,'');status.setAttribute('role','status');status.style='color:#60476b';
    const form=create('form',panel);form.style='display:grid;gap:12px';
    const email=create('input',form);email.type='email';email.required=true;email.autocomplete='username';
    email.placeholder='Email amministratore';email.style='padding:12px;border:1px solid #d8c9de;border-radius:10px;font:inherit';
    const password=create('input',form);password.type='password';password.required=true;
    password.placeholder='Password Admin';password.autocomplete='current-password';password.style=email.style.cssText;
    const submit=create('button',form,'Accedi alle statistiche');submit.type='submit';
    submit.style='padding:12px;border:0;border-radius:10px;font:inherit;font-weight:600;background:#6e5578;color:white';
    const output=create('div',panel);
    form.onsubmit=async event=>{
      event.preventDefault();submit.disabled=true;status.textContent='Verifica accesso…';output.replaceChildren();
      try {
        const tokenResponse=await fetch(API+'/auth/v1/token?grant_type=password',{
          method:'POST',credentials:'omit',headers:{apikey:KEY,'Content-Type':'application/json'},
          body:JSON.stringify({email:email.value.trim(),password:password.value})
        });
        const auth=await tokenResponse.json();
        if(!tokenResponse.ok||!auth.access_token)throw Error('Credenziali non valide.');
        const dataResponse=await fetch(API+'/rest/v1/sd_anon_daily?select=day,opens,sessions&order=day.desc&limit=3650',{
          credentials:'omit',headers:{apikey:KEY,Authorization:'Bearer '+auth.access_token}
        });
        if(!dataResponse.ok)throw Error('Lettura non autorizzata.');
        const rows=await dataResponse.json();
        if(!Array.isArray(rows)||!rows.length){status.textContent='Nessun dato disponibile. Il conteggio parte dall’attivazione.';}
        else {
          status.textContent='Dati aggregati, nessun IP o identificatore nel database statistiche.';
          const totals=rows.reduce((a,r)=>[a[0]+Number(r.opens||0),a[1]+Number(r.sessions||0)],[0,0]);
          const summary=create('p',output,'Periodo disponibile: '+totals[0]+' aperture · '+totals[1]+' sessioni stimate');
          summary.style='font-weight:700;color:#6e5578';
          const table=create('table',output);table.style='width:100%;border-collapse:collapse;font-size:14px';
          const tr=create('tr',table);
          for(const text of ['Giorno','Aperture','Sessioni']){const cell=create('th',tr,text);cell.style='padding:8px 5px;border-bottom:1px solid #ddd;text-align:left';}
          for(const r of rows.slice(0,30)){const line=create('tr',table);for(const text of [r.day,String(r.opens),String(r.sessions)]){const td=create('td',line,text);td.style='padding:8px 5px;border-bottom:1px solid #eee';}}
        }
        form.remove();
      }catch(err){status.textContent=err.message||'Dati non disponibili.';}
      finally{password.value='';submit.disabled=false;}
    };
    shade.addEventListener('click',e=>{if(e.target===shade)shade.remove();});email.focus();
  }
  window.dotappOpenAnonStats=open;
  const observer=new MutationObserver(()=>{
    const entry=document.querySelector('#scorta-settings-panel [data-admin]');
    if(!entry||document.querySelector('#scorta-settings-panel [data-anon-stats]'))return;
    const btn=create('button',entry.parentNode,'STATISTICHE ANONIME (ADMIN)');
    btn.dataset.anonStats='1';btn.type='button';
    btn.style='display:block;margin-top:16px;padding:0;border:0;background:none;color:#6e5578;font:inherit;font-size:14px;text-decoration:underline;cursor:pointer';
    btn.onclick=()=>{document.getElementById('scorta-settings-panel')?.remove();open();};
  });
  const start=()=>observer.observe(document.body,{subtree:true,childList:true});
  if(document.body)start();else document.addEventListener('DOMContentLoaded',start,{once:true});
})();
