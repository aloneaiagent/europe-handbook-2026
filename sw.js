/* The shell is available after a light install. The complete media pack downloads only on request. */
const CACHE='eu-handbook-v78';
const CORE_FILES=["./", "index.html", "embed-test.html", "manifest.webmanifest", "style.css", "experience.css", "vendor/leaflet.css", "vendor/leaflet.js", "data.js", "map-data.js", "maps.js", "food-data.js", "ticket-details.js", "experience.js", "experience-embed-test.js", "departure-data.js", "app.js", "i18n-data.js", "i18n.js", "embed-height-test.js", "offline.js", "assets/europe-cover-iphone17.webp"];
const FULL_FILES=["./", "index.html", "embed-test.html", "manifest.webmanifest", "style.css", "experience.css", "vendor/leaflet.css", "vendor/leaflet.js", "data.js", "map-data.js", "maps.js", "food-data.js", "ticket-details.js", "experience.js", "experience-embed-test.js", "departure-data.js", "app.js", "i18n-data.js", "i18n.js", "embed-height-test.js", "offline.js", "assets/europe-cover-iphone17.webp", "assets/official-monumentale.jpg", "assets/official-castello.jpg", "assets/banners/day-4-milan-v3.webp", "assets/brera-mantegna.jpg", "assets/banners/day-4-milan-v2.webp", "assets/banners/day-5-milan-v2.webp", "assets/restaurant-photos/marchesi.jpg", "assets/restaurant-photos/ratana.jpg", "assets/restaurant-photos/casalinga.jpg", "assets/restaurant-photos/berbere.jpg", "assets/restaurant-photos/forno.jpg", "assets/restaurant-photos/armando.jpg", "assets/restaurant-photos/arcangelo.jpg", "assets/restaurant-photos/chartier.jpg", "assets/restaurant-photos/cochon.jpg", "assets/restaurant-photos/marches.jpg", "assets/restaurant-photos/mama.jpg", "assets/restaurant-photos/grandpan.webp", "assets/restaurant-photos/trippa.jpg", "assets/restaurant-photos/dry.jpg", "assets/restaurant-photos/cibreo_restaurant.jpg", "assets/restaurant-photos/pizzarium.jpg", "assets/restaurant-photos/lavazza.jpg", "assets/gambero-rosso-logo.png", "assets/chopin.jpg", "assets/yoko.png", "assets/europe-art-poster.png", "assets/organ.jpg", "assets/colosseum.jpg", "assets/trevi.png", "assets/lucas.jpg", "assets/trevi.jpg", "assets/colosseum-large.jpg", "assets/duomo.jpg", "assets/sophia.webp", "assets/louvre.jpg", "assets/peter.jpg", "assets/milan.jpg", "assets/uffizi.jpg", "assets/lesmis.jpg", "assets/opera.jpg", "assets/kissin.jpg", "assets/florence.webp", "assets/accademia.jpg", "assets/vatican.jpg", "assets/borghese.png", "assets/borghese.jpg", "assets/banners/journey.webp", "assets/banners/day-9.webp", "assets/banners/day-8.webp", "assets/banners/day-14.webp", "assets/banners/day-15.webp", "assets/banners/day-17.webp", "assets/banners/day-16.webp", "assets/banners/day-12.webp", "assets/banners/day-13.webp", "assets/banners/day-11.webp", "assets/banners/day-10.webp", "assets/banners/day-18.webp", "assets/banners/day-6.webp", "assets/banners/day-7.webp", "assets/banners/day-5.webp", "assets/banners/day-4.webp", "assets/banners/day-3.webp", "assets/banners/day-2.webp", "assets/audio/marchesi.wav", "assets/audio/pave.wav", "assets/audio/mama.wav", "assets/audio/rovello.wav", "assets/audio/pinsere.wav", "assets/audio/lavazza.wav", "assets/audio/arcangelo.wav", "assets/audio/casalinga.wav", "assets/audio/ratana.wav", "assets/audio/chartier.wav", "assets/audio/latini.wav", "assets/audio/marches.wav", "assets/audio/grandpan.wav", "assets/audio/roscioli.wav", "assets/audio/forno.wav", "assets/audio/pizzarium.wav", "assets/audio/pesa.wav", "assets/audio/mario.wav", "assets/audio/armando.wav", "assets/audio/cochon.wav", "assets/audio/berbere.wav", "assets/audio/luini.wav", "assets/audio/cibreo.wav", "assets/audio/mollien.wav", "assets/food/coffee.jpg", "assets/food/pizza-slice.jpg", "assets/food/seasonal.jpg", "assets/food/ribollita.jpg", "assets/food/onionsoup.jpg", "assets/food/croissant.jpg", "assets/food/panzerotto.jpg", "assets/food/stew.jpg", "assets/food/amatriciana.jpg", "assets/food/suppli.jpg", "assets/food/ossobuco.jpg", "assets/food/pinsa.jpg", "assets/food/pizza.jpg", "assets/food/carbonara.jpg", "assets/food/sandwich.jpg", "assets/food/risotto.jpg", "assets/food/panettone.jpg", "vendor/LEAFLET-LICENSE.txt", "vendor/images/layers.png", "vendor/images/marker-icon.png", "vendor/images/marker-icon-2x.png", "vendor/images/marker-shadow.png", "vendor/images/layers-2x.png"];
const key=file=>new URL(file,self.registration.scope).href;
async function cacheFiles(files,client){
  const cache=await caches.open(CACHE);
  let done=0;const failed=[];let next=0;
  const report=()=>client?.postMessage({type:'OFFLINE_PROGRESS',done,total:files.length,failed:failed.length});
  report();
  async function worker(){
    while(next<files.length){
      const file=files[next++],url=key(file);
      try{
        if(!await cache.match(url,{ignoreSearch:true})){
          const response=await fetch(url);
          if(!response.ok)throw Error(String(response.status));
          await cache.put(url,response);
        }
      }catch(error){failed.push(file)}
      done++;report();
    }
  }
  await Promise.all(Array.from({length:3},worker));
  client?.postMessage({type:'OFFLINE_COMPLETE',done,total:files.length,failed});
}
self.addEventListener('install',event=>event.waitUntil(
  caches.open(CACHE).then(cache=>cache.addAll(CORE_FILES.map(key))).then(()=>self.skipWaiting())
));
self.addEventListener('activate',event=>event.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('eu-handbook-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
));
self.addEventListener('message',event=>{
  if(event.data?.type==='CHECK_OFFLINE_PACK'){
    event.waitUntil((async()=>{const cache=await caches.open(CACHE);let done=0;
      for(const file of FULL_FILES)if(await cache.match(key(file),{ignoreSearch:true}))done++;
      event.source?.postMessage({type:'OFFLINE_STATUS',done,total:FULL_FILES.length});
    })());
  }
  if(event.data?.type==='DOWNLOAD_OFFLINE_PACK')event.waitUntil(cacheFiles(FULL_FILES,event.source));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==location.origin)return;
  const url=new URL(event.request.url),isImage=/\.(?:webp|png|jpe?g|gif|svg)$/i.test(url.pathname);
  let cacheTask=Promise.resolve();
  const responseTask=(async()=>{
    const cache=await caches.open(CACHE);
    const cached=await cache.match(event.request,{ignoreSearch:true});
    if(isImage&&cached)return cached;
    try{const response=await fetch(event.request);
      if(response.ok&&response.status!==206)cacheTask=cache.put(event.request,response.clone()).catch(()=>{});
      return response;
    }catch{return cached||new Response('This resource is not available offline.',{status:503})}
  })();
  event.respondWith(responseTask);
  event.waitUntil(responseTask.then(()=>cacheTask).catch(()=>{}));
});
