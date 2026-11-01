'use strict';
/* Full media is saved only after the visitor asks for it. */
window.HANDBOOK_EN=Object.assign(window.HANDBOOK_EN||{}, {
  '离线手册':'Offline handbook',
  '下载完整离线手册':'Download full offline handbook',
  '在 Wi-Fi 下下载图片与菜名音频。地图底图和外部网站仍需联网。':'Download images and dish audio on Wi-Fi. Map tiles and external sites still need a connection.',
  '检查离线状态中…':'Checking offline status…'
});
(()=>{
  const button=document.getElementById('offlineDownload');
  const status=document.getElementById('offlineStatus');
  if(!button||!status)return;
  const english=()=>window.HandbookLanguage?.language==='en';
  let last={type:'checking'};
  function show(info){
    last=info;
    const en=english();
    if(info.type==='checking')status.textContent=en?'Checking offline status…':'检查离线状态中…';
    if(info.type==='unsupported')status.textContent=en?'Offline saving is unavailable in this browser.':'此浏览器无法保存离线手册。';
    if(info.type==='ready')status.textContent=info.done===info.total
      ?(en?'Full handbook saved for offline use.':'完整手册已保存，可离线阅读。')
      :(en?`${info.done}/${info.total} files saved. Download the rest on Wi-Fi.`:`已保存 ${info.done}/${info.total} 项；建议在 Wi-Fi 下下载其余内容。`);
    if(info.type==='downloading')status.textContent=en
      ?`Saving ${info.done}/${info.total} files${info.failed?' · '+info.failed+' failed':''}…`
      :`正在保存 ${info.done}/${info.total} 项${info.failed?' · '+info.failed+' 项失败':''}…`;
    if(info.type==='complete')status.textContent=info.failed
      ?(en?`${info.failed} files failed. Tap again to retry.`:`${info.failed} 项未保存，点击按钮可重试。`)
      :(en?'Full handbook saved. Map tiles and external sites still need a connection.':'完整手册已保存。地图底图与外部网站仍需联网。');
    if(info.type==='error')status.textContent=en?'Download could not start. Check your connection and retry.':'下载未能开始，请检查网络后重试。';
  }
  if(!('serviceWorker'in navigator)){show({type:'unsupported'});button.disabled=true;return}
  navigator.serviceWorker.addEventListener('message',event=>{
    const data=event.data||{};
    if(data.type==='OFFLINE_STATUS')show({type:'ready',done:data.done,total:data.total});
    if(data.type==='OFFLINE_PROGRESS')show({type:'downloading',done:data.done,total:data.total,failed:data.failed});
    if(data.type==='OFFLINE_COMPLETE'){button.disabled=false;show({type:'complete',failed:data.failed.length});}
  });
  async function worker(){const registration=await navigator.serviceWorker.ready;return registration.active||navigator.serviceWorker.controller}
  window.addEventListener('load',async()=>{
    try{(await worker())?.postMessage({type:'CHECK_OFFLINE_PACK'})}catch{show({type:'error'})}
  });
  button.addEventListener('click',async()=>{
    button.disabled=true;show({type:'downloading',done:0,total:last.total||0,failed:0});
    try{(await worker())?.postMessage({type:'DOWNLOAD_OFFLINE_PACK'})}catch{button.disabled=false;show({type:'error'})}
  });
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-language-toggle]'))setTimeout(()=>show(last),0);
  });
})();
