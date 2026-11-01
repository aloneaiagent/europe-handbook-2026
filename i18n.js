/* Local, reversible text localisation. Data identifiers, addresses, URLs and audio languages stay intact. */
window.HandbookLanguage=(()=>{
 const dict=window.HANDBOOK_EN||{}, chinese=/[\u3400-\u9fff]/;
 const terms=Object.keys(dict).sort((a,b)=>b.length-a.length),pattern=new RegExp(terms.map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');
 let lang='zh';try{lang=localStorage.getItem('eu-language')==='en'?'en':'zh'}catch{}
 const originals=new WeakMap(),attributes=new WeakMap();let observer,scheduled=false;
 function translate(s){if(!s||!chinese.test(s))return s;const trimmed=s.trim();if(dict[trimmed]!==undefined)return s.replace(trimmed,dict[trimmed]);return s.replace(pattern,m=>dict[m]).replace(/11月(\d+)日/g,'Nov $1').replace(/星期([一二三四五六日])/g,(_,v)=>({一:'Monday',二:'Tuesday',三:'Wednesday',四:'Thursday',五:'Friday',六:'Saturday',日:'Sunday'}[v])).replace(/周([一二三四五六日])/g,(_,v)=>({一:'Mon',二:'Tue',三:'Wed',四:'Thu',五:'Fri',六:'Sat',日:'Sun'}[v])).replace(/(\d+(?:\.\d+)?)公里/g,'$1 km').replace(/(\d+)分钟/g,'$1 min').replace(/约(?=\d)/g,'about ').replace(/(\d+)米/g,'$1 m');}
 function text(node){let record=originals.get(node),value=node.nodeValue;if(!record||value!==record.last){record={zh:value,last:value};originals.set(node,record)}const next=lang==='en'?translate(record.zh):record.zh;if(next!==value)node.nodeValue=next;record.last=next;}
 function apply(){scheduled=false;observer?.disconnect();document.documentElement.lang=lang==='en'?'en':'zh-CN';const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode(n){return n.parentElement?.closest('script,style,textarea,[data-language-toggle]')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;}});let n;while(n=walker.nextNode())text(n);
 for(const el of document.querySelectorAll('[title],[aria-label],[alt],[placeholder],[data-status-label]')){let records=attributes.get(el)||{};for(const name of ['title','aria-label','alt','placeholder','data-status-label']){if(!el.hasAttribute(name)||el.hasAttribute('data-language-toggle'))continue;let value=el.getAttribute(name),r=records[name];if(!r||value!==r.last)r={zh:value,last:value};const next=lang==='en'?translate(r.zh):r.zh;if(next!==value)el.setAttribute(name,next);r.last=next;records[name]=r}attributes.set(el,records)}
 const title=document.querySelector('title')?.firstChild;if(title)text(title);
 document.querySelectorAll('[data-language-toggle]').forEach(b=>{b.textContent=lang==='en'?'中文':'EN';b.setAttribute('aria-label',lang==='en'?'Switch to Chinese':'切换为英文');b.title=lang==='en'?'切换为中文':'Switch to English'});
 observer?.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['title','aria-label','alt','placeholder','data-status-label']});}
 function set(next){lang=next;try{localStorage.setItem('eu-language',lang)}catch{}apply()}
 document.addEventListener('click',e=>{if(e.target.closest('[data-language-toggle]'))set(lang==='en'?'zh':'en')});
 observer=new MutationObserver(()=>{if(!scheduled){scheduled=true;queueMicrotask(apply)}});apply();
 return {translate,set,get language(){return lang},apply};
})();
