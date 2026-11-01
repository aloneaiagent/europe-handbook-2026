(()=>{
  const target='https://lam.art';
  const send=()=>{
    const footer=document.querySelector('.site-footer');
    const nav=document.querySelector('.daily-nav');
    const height=footer ? Math.ceil(footer.getBoundingClientRect().bottom+scrollY) : document.body.scrollHeight;
    const rect=nav?.getBoundingClientRect();
    const dates=nav ? [...nav.querySelectorAll('.date-card')].map(a=>({
      hash:a.getAttribute('href'),day:a.querySelector('strong')?.textContent||'',
      weekday:a.querySelector('small')?.textContent||'',city:a.querySelector('span')?.textContent||'',
      selected:a.classList.contains('selected')
    })) : [];
    const tabs=nav ? [...nav.querySelectorAll('.content-tabs a')].map(a=>({
      hash:a.getAttribute('href'),label:a.textContent||'',selected:a.classList.contains('selected')
    })) : [];
    parent.postMessage({kind:'europe-handbook-layout',height,hash:location.hash,
      nav:nav?{top:Math.ceil(rect.top+scrollY),height:Math.ceil(rect.height),country:nav.dataset.country,dates,tabs}:null,
      theme:document.documentElement.dataset.theme||'light'},target);
  };
  new ResizeObserver(send).observe(document.body);
  addEventListener('load',send);
  addEventListener('hashchange',()=>requestAnimationFrame(send));
  addEventListener('message',event=>{
    if(event.origin!==target||event.data?.kind!=='europe-handbook-navigate')return;
    const hash=event.data.hash;
    if(typeof hash==='string'&&/^#(?:overview|day-2026-11-(?:0[2-9]|1[0-8])(?:-guide|-food)?)$/.test(hash))location.hash=hash;
  });
  document.fonts?.ready.then(send);
  setTimeout(send,1000);
})();
