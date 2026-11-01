(()=>{
  const frame=document.getElementById('europeFlowFrame');
  if(!frame)return;
  document.documentElement.style.overflowAnchor='none';
  document.body.style.overflowAnchor='none';
  frame.style.overflowAnchor='none';
  const childOrigin='https://aloneaiagent.github.io';
  const host=document.createElement('div');
  host.id='europeStickyNavigation';
  host.style.display='none';
  document.body.appendChild(host);
  const root=host.attachShadow({mode:'open'});
  const style=document.createElement('style');
  style.textContent=`
    :host{all:initial;position:fixed;top:0;left:0;right:0;z-index:2147483000;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;color:#172b46;background:#f4f7fb;box-shadow:0 5px 14px #122b4b25}
    *{box-sizing:border-box}nav{display:flex;gap:4px;overflow:auto;scrollbar-width:none;scroll-behavior:smooth}nav::-webkit-scrollbar{display:none}
    .dates{padding:4px 8px 2px;scroll-snap-type:x proximity}.date{flex:0 0 65px;display:flex;flex-direction:column;align-items:center;gap:0;padding:2px 4px;border-radius:6px;text-decoration:none;color:#4d617a;scroll-snap-align:center}
    .date small,.date span{font-size:9px;line-height:1.3;white-space:nowrap}.date strong{font-size:17px;line-height:1.2}.date.selected{background:#087bfa;color:white}
    .tabs{margin:0 8px 4px;border:1px solid #dce6f2;border-radius:7px;overflow:hidden;gap:0}.tab{flex:1;padding:5px 4px;text-align:center;text-decoration:none;font-size:12px;line-height:1.35;color:#172b46;background:#fff}
    .it .tab:first-child{background:#008348;color:#fff}.it .tab:last-child{background:#ce293d;color:#fff}.fr .tab:first-child{background:#002b7f;color:#fff}.fr .tab:last-child{background:#ce293d;color:#fff}.tab.selected{font-weight:800;text-decoration:underline;text-underline-offset:4px}
    :host(.dark){background:#14253b;color:#fff}:host(.dark) .date{color:#e5eefc}:host(.dark) .date.selected{color:#fff}:host(.dark) .tabs{border-color:#49617e}:host(.dark) .tab:nth-child(2){background:#243a58;color:#fff}
  `;
  root.appendChild(style);
  const dates=document.createElement('nav');dates.className='dates';dates.setAttribute('aria-label','选择旅行日期');
  const tabs=document.createElement('nav');tabs.className='tabs';tabs.setAttribute('aria-label','手册内容分类');
  root.append(dates,tabs);
  let layout=null,pendingNavigation=false;
  const link=(item,cls)=>{
    const a=document.createElement('a');a.href=item.hash;a.className=cls+(item.selected?' selected':'');
    if(cls==='date'){
      for(const [tag,value] of [['small',item.weekday],['strong',item.day],['span',item.city]]){const el=document.createElement(tag);el.textContent=value;a.appendChild(el)}
    }else a.textContent=item.label;
    return a;
  };
  const updateVisibility=()=>{
    if(!layout?.nav){host.style.display='none';return}
    const frameTop=scrollY+frame.getBoundingClientRect().top;
    host.style.display=scrollY>frameTop+layout.nav.top-4?'block':'none';
  };
  addEventListener('scroll',updateVisibility,{passive:true});
  addEventListener('resize',updateVisibility);
  root.addEventListener('click',e=>{
    const a=e.target.closest('a[href^="#"]');if(!a)return;
    e.preventDefault();
    if(a.getAttribute('href')===layout?.hash)return;
    pendingNavigation=true;
    frame.contentWindow.postMessage({kind:'europe-handbook-navigate',hash:a.getAttribute('href')},childOrigin);
  });
  addEventListener('message',e=>{
    if(e.origin!==childOrigin||e.source!==frame.contentWindow||e.data?.kind!=='europe-handbook-layout')return;
    const next=e.data;
    if(!Number.isFinite(next.height)||next.height<500||next.height>16000)return;
    frame.style.height=Math.ceil(next.height)+'px';
    const routeChanged=layout?.hash!==next.hash;
    layout=next;
    host.classList.toggle('dark',next.theme==='dark');
    if(next.nav){
      dates.replaceChildren(...next.nav.dates.map(x=>link(x,'date')));
      tabs.replaceChildren(...next.nav.tabs.map(x=>link(x,'tab')));
      tabs.className='tabs '+(next.nav.country||'');
      const selected=dates.querySelector('.selected');
      if(selected)dates.scrollLeft=selected.offsetLeft-(dates.clientWidth-selected.clientWidth)/2;
    }
    requestAnimationFrame(()=>{
      if(pendingNavigation&&routeChanged&&next.nav){
        const frameTop=scrollY+frame.getBoundingClientRect().top;
        scrollTo({top:frameTop+next.nav.top+next.nav.height-host.offsetHeight,behavior:'instant'});
        pendingNavigation=false;
      }
      updateVisibility();
    });
  });
})();
