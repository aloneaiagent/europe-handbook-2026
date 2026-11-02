(()=>{
  const frame=document.getElementById('europeFlowFrame');
  if(!frame)return;
  document.documentElement.style.overflowAnchor='none';
  document.body.style.overflowAnchor='none';
  frame.style.overflowAnchor='none';
  const childOrigin='https://aloneaiagent.github.io';
  const coverUrl=childOrigin+'/europe-handbook-2026/assets/europe-cover-iphone17.webp';
  let coverTimer;
  const closeCover=()=>{
    clearInterval(coverTimer);
    document.getElementById('europeParentCover')?.remove();
    try{sessionStorage.setItem('europe-parent-cover-seen','1')}catch{}
    frame.contentWindow.postMessage({kind:'europe-handbook-navigate',hash:'#overview'},childOrigin);
    scrollTo({top:0,left:0,behavior:'instant'});
  };
  const openCover=()=>{
    document.getElementById('europeParentCover')?.remove();
    const cover=document.createElement('div');
    cover.id='europeParentCover';
    cover.setAttribute('role','dialog');
    cover.setAttribute('aria-label','欧洲历险记封面');
    Object.assign(cover.style,{position:'fixed',inset:'0',width:'100vw',height:'100dvh',minHeight:'100svh',zIndex:'2147483647',background:'#081727',overflow:'hidden'});
    const img=document.createElement('img');
    img.src=coverUrl;img.alt='欧洲教堂、美术馆与音乐之旅插画';
    Object.assign(img.style,{display:'block',width:'100%',height:'100%',objectFit:'cover',objectPosition:'center center'});
    const skip=document.createElement('button');
    skip.type='button';skip.setAttribute('aria-label','跳过封面，进入总览');skip.textContent='5s';
    Object.assign(skip.style,{position:'absolute',top:'max(18px,env(safe-area-inset-top))',right:'18px',boxSizing:'border-box',display:'grid',placeItems:'center',padding:'0',width:'54px',height:'54px',minWidth:'0',minHeight:'0',appearance:'none',border:'4px solid #d97343',borderRadius:'50%',boxShadow:'inset 0 0 0 2px #b8d2e9',background:'#173554e8',color:'#fff',font:'600 16px -apple-system,sans-serif'});
    skip.addEventListener('click',closeCover);
    const title=document.createElement('div');
    Object.assign(title.style,{position:'absolute',left:'0',right:'0',bottom:'0',padding:'65px 20px calc(env(safe-area-inset-bottom) + 25px)',textAlign:'center',color:'#fff',background:'linear-gradient(transparent,#071a32d9)',fontFamily:'Georgia,"Songti SC",serif'});
    const byline=document.createElement('small');byline.textContent='NICOLAS LEE · EUROPE 2026';
    Object.assign(byline.style,{display:'block',font:'600 11px -apple-system,sans-serif',letterSpacing:'4px',marginBottom:'13px'});
    const name=document.createElement('strong');name.textContent='欧洲历险记';
    Object.assign(name.style,{display:'block',fontSize:'clamp(30px,9vw,48px)',lineHeight:'1.2'});
    title.append(byline,name);
    cover.append(img,title,skip);document.body.append(cover);
    const start=()=>{
      if(!cover.isConnected)return;
      let count=5;clearInterval(coverTimer);
      coverTimer=setInterval(()=>{if(document.hidden)return;count--;skip.textContent=Math.max(0,count)+'s';if(count<=0)closeCover()},1000);
    };
    if(img.complete)start();else{img.addEventListener('load',start,{once:true});img.addEventListener('error',start,{once:true})}
  };
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
  let layout=null,pendingNavigation=false,dialogOpen=false;
  const link=(item,cls)=>{
    const a=document.createElement('a');a.href=item.hash;a.className=cls+(item.selected?' selected':'');
    if(cls==='date'){
      for(const [tag,value] of [['small',item.weekday],['strong',item.day],['span',item.city]]){const el=document.createElement(tag);el.textContent=value;a.appendChild(el)}
    }else a.textContent=item.label;
    return a;
  };
  const updateVisibility=()=>{
    const frameTop=scrollY+frame.getBoundingClientRect().top;
    frame.contentWindow.postMessage({kind:'europe-handbook-viewport',
      top:Math.max(16,Math.ceil(scrollY-frameTop+innerHeight*.08)),maxHeight:Math.floor(innerHeight*.84)},childOrigin);
    if(!layout?.nav){host.style.display='none';return}
    host.style.display=!dialogOpen&&scrollY>frameTop+layout.nav.top-4?'block':'none';
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
    if(e.origin===childOrigin&&e.source===frame.contentWindow&&e.data?.kind==='europe-handbook-cover'){openCover();return}
    if(e.origin===childOrigin&&e.source===frame.contentWindow&&e.data?.kind==='europe-handbook-dialog'){
      dialogOpen=!!e.data.open;
      updateVisibility();
      return;
    }
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
  try{if(!sessionStorage.getItem('europe-parent-cover-seen'))openCover()}catch{openCover()}
})();
