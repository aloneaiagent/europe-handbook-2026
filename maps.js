/* Leaflet map. Only public, verified itinerary coordinates are bundled.
   No automatic geocoding or location permission; personal addresses remain local. */
window.HandbookMap=(()=>{
 let map=null,layer=null,tiles=null,revision=0,transitMap=null;
 const e=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function point(s){if(!s?.address)return null;return window.MAP_DATA?.places?.[s.address]||null}
 function clear(){revision++;if(transitMap){transitMap.remove();transitMap=null}if(map){map.remove();map=null}layer=null}
 function key(a,b,mode){return [a.lat,a.lon,b.lat,b.lon,mode].join('|')}
 const status=(html)=>{const el=document.getElementById('mapStatus');if(el)el.innerHTML=html};
 function render(stops,index=0){clear();const node=document.getElementById('embeddedMap');if(!node)return;const rev=revision;
 if(!window.L){status('地图组件未加载，请刷新页面。');return}
 map=L.map(node,{scrollWheelZoom:false,tap:false});layer=L.featureGroup().addTo(map);
 tiles=L.tileLayer(window.MAP_DATA?.tileUrl||'https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors · <a href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noopener">纠错</a>'}).addTo(map);
 let failed=0;tiles.on('tileerror',()=>{if(++failed===3&&rev===revision){const n=document.getElementById('tileNotice');if(n)n.textContent='底图加载失败：请检查网络；下方地址仍可使用。'}});
 const from=stops[index],to=stops[index+1],a=point(from),b=point(to);
 const marker=(p,label,name,color)=>L.marker([p.lat,p.lon],{icon:L.divIcon({className:'route-map-pin',html:`<span style="background:${color}">${e(label)}</span>`,iconSize:[28,28],iconAnchor:[14,14]})}).bindPopup(`<strong>${e(name)}</strong><br><small>${e(p.note||'场馆/地点位置；请按门票入口进场')}</small>`).addTo(layer);
 const seen=new Set([a,b].filter(Boolean).map(p=>p.lat+','+p.lon));stops.forEach((s,i)=>{const p=point(s);if(!p)return;const k=p.lat+','+p.lon;if(seen.has(k)||i===index||i===index+1)return;seen.add(k);marker(p,i+1,s.name+(p.approximate?'（机场范围）':''),'#899180')});
 if(a)marker(a,index+1,from.name+(a.approximate?'（机场范围）':''),'#3f685b');if(b&&(a?.lat!==b.lat||a?.lon!==b.lon))marker(b,index+2,to.name+(b.approximate?'（机场范围）':''),'#b35b3e');
 const fit=()=>{if(!map)return;const bounds=layer.getBounds();if(bounds.isValid())map.fitBounds(bounds,{padding:[25,25],maxZoom:16});else map.setView([48.8566,2.3522],11)};
 const fitButton=document.getElementById('mapFit');if(fitButton)fitButton.onclick=fit;
 const expandButton=document.getElementById('mapExpand');if(expandButton)expandButton.onclick=()=>{node.classList.toggle('expanded-map');map.invalidateSize();fit()};
 if(!a||!b){fit();status(!a&&!b?'此路段的精确地址尚未补齐，暂不绘制路线。':'部分端点尚未核实坐标，内嵌地图仅显示已核实地点；已录入的地址可通过下方导航按钮查看。');return}
 if(a.lat===b.lat&&a.lon===b.lon){fit();status('住处周边自由活动 · 地图已定位住处。');return}
 if(stops.length>2&&stops.slice(1).every(s=>s.transport)){
 stops.slice(0,-1).forEach((s,i)=>{const x=point(s),y=point(stops[i+1]);if(x&&y)L.polyline([[x.lat,x.lon],[y.lat,y.lon]],{color:i===index?'#087bfa':'#7398bb',weight:3,dashArray:'8 8'}).addTo(layer)});
 stops.forEach(s=>{const p=point(s);if(p)L.tooltip({permanent:true,direction:'top',offset:[0,-12]}).setLatLng([p.lat,p.lon]).setContent(e(s.name)).addTo(layer)});
 fit();status('<strong>北京 → 重庆 → 米兰 · 完整联程</strong><br>虚线仅示意三地旅行顺序，不代表实际飞行航路。重庆—米兰段于11月3日凌晨出发。');return;
 }
 if(to.transport){L.polyline([[a.lat,a.lon],[b.lat,b.lon]],{color:'#9b7761',weight:3,dashArray:'8 8'}).addTo(layer);fit();status(`<strong>${e(to.transport)}</strong> · 虚线仅示意起终点，不代表实际航线或铁路线。${a.approximate||b.approximate?'<br><small>奥利机场标记仅代表机场范围，T1入口待核对。</small>':''}`);return}
 const distance=L.latLng(a.lat,a.lon).distanceTo(L.latLng(b.lat,b.lon));const stadium=/San Siro/i.test((from.address||'')+' '+(to.address||''));const mode=stadium||distance>5500?'car':'foot';
 const route=window.MAP_DATA?.routes?.[key(a,b,mode)];
 if(route?.geometry){const line=L.geoJSON(route.geometry,{style:{color:mode==='foot'?'#356e69':'#4c7198',weight:5,opacity:.9}}).addTo(layer);map.fitBounds(line.getBounds(),{padding:[28,28],maxZoom:17});const km=route.distance<1000?Math.round(route.distance)+'米':(route.distance/1000).toFixed(1)+'公里';const mins=Math.max(1,Math.round(route.duration/60));status(`${stadium?'<p>球场往返优先地铁；下图为出租车道路参考，不是地铁线路。散场封路、等车和拥堵未计入。</p>':''}<strong>${mode==='foot'?'步行路线':'驾车路线参考'} · ${km} · 约${mins}分钟</strong><br><small>OSRM / OpenStreetMap 路网估算，非实时交通${mode==='car'?'，也非公交方案':''}；以现场道路和入口为准。${a.approximate||b.approximate?'机场端点为机场范围近似位置，并非T1精确入口。':''}</small>`)}
 else {fit();status('已显示起终点；这段道路路线暂不可用，未用直线代替导航。')}
 }
 function renderJourney(){clear();const node=document.getElementById('journeyMap');if(!node||!window.L)return;map=L.map(node,{scrollWheelZoom:false});layer=L.featureGroup().addTo(map);const locations=[['米兰',45.4642,9.1900],['佛罗伦萨',43.7696,11.2558],['罗马',41.9028,12.4964],['巴黎',48.8566,2.3522]];
const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);tiles.on('tileerror',()=>{const el=document.getElementById('journeyMapStatus');if(el)el.textContent='底图暂未加载，城市标记及连线仍可查看。'});
locations.forEach((p,i)=>{L.marker([p[1],p[2]],{icon:L.divIcon({className:'route-map-pin',html:`<span style="background:#087bfa">${i+1}</span>`,iconSize:[28,28],iconAnchor:[14,14]})}).bindTooltip(p[0],{permanent:true,direction:i===1?'left':'right'}).addTo(layer)});
for(let i=0;i<3;i++)L.polyline([[locations[i][1],locations[i][2]],[locations[i+1][1],locations[i+1][2]]],{color:i===2?'#32a4ee':'#087bfa',weight:3,dashArray:i===2?'8 8':null}).addTo(layer);
map.fitBounds(layer.getBounds(),{padding:[45,45]});}

 function renderTransit(stops,index){
 const node=document.getElementById('transitMap');if(!node||!window.L)return;
 if(transitMap)transitMap.remove();transitMap=L.map(node,{scrollWheelZoom:false});
 L.tileLayer(window.MAP_DATA.tileUrl,{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · 站点 © <a href="https://gisportal.comune.milano.it/server/rest/services/D_Mobilita/ATM_Metro/MapServer">Comune di Milano</a> CC BY 4.0'}).addTo(transitMap).on('tileerror',()=>{const n=document.getElementById('transitMapNotice');if(n)n.textContent='底图暂未加载，站点和换乘顺序仍可查看。'});
 const stations=window.MAP_DATA.transitStations,from=stops[index],to=stops[index+1],station=(name,label,mode)=>({...stations[name],name:label||name,mode});
 let points;
 if(/Malpensa/i.test(from.address))points=[{...point(from),name:'Malpensa T1'},station('CADORNA FN M1','Cadorna · 换M1','express'),station('DUOMO M1','Duomo · M1','M1'),station('DUOMO M3','Duomo · 换M3','walk'),station('MONTENAPOLEONE','Montenapoleone','M3'),{...point(to),name:'DOMYA 酒店',mode:'walk'}];
 else if(/Teatro Nazionale/i.test(to.address))points=[{...point(from),name:'DOMYA 酒店'},station('MONTENAPOLEONE','Montenapoleone','walk'),station('DUOMO M3','Duomo · M3','M3'),station('DUOMO M1','Duomo · 换M1','walk'),station('WAGNER','Wagner','M1'),{...point(to),name:'Teatro Nazionale',mode:'walk'}];
 else points=[{...point(from),name:'Teatro Nazionale'},station('WAGNER','Wagner','walk'),station('DUOMO M1','Duomo · M1','M1'),station('DUOMO M3','Duomo · 换M3','walk'),station('MONTENAPOLEONE','Montenapoleone','M3'),{...point(to),name:'DOMYA 酒店',mode:'walk'}];
 const transitLines=[],transitPins=[];const highlight=i=>{transitLines.forEach((line,j)=>line.setStyle({opacity:j===i||j===i-1?1:.22,weight:j===i||j===i-1?6:3}));transitPins.forEach((pin,j)=>pin.setOpacity(j===i?1:.65));};const group=L.featureGroup().addTo(transitMap),colors={express:'#087bfa',M1:'#de3443',M3:'#c89b12',walk:'#667b70'};
 points.forEach((p,i)=>{if(!Number.isFinite(p.lat)||!Number.isFinite(p.lon))return;const pin=L.marker([p.lat,p.lon],{icon:L.divIcon({className:'route-map-pin',html:`<span style="background:${colors[p.mode]||'#087bfa'}">${i+1}</span>`,iconSize:[28,28],iconAnchor:[14,14]})}).bindTooltip(e(p.name)).bindPopup(e(p.name)).addTo(group);transitPins.push(pin);pin.on('click',()=>highlight(i));if(i){const a=points[i-1];if(Number.isFinite(a.lat))transitLines.push(L.polyline([[a.lat,a.lon],[p.lat,p.lon]],{color:colors[p.mode],weight:4,dashArray:p.mode==='walk'?'3 7':'8 5'}).addTo(group))}});
 const fitTransit=city=>{transitLines.forEach(l=>l.setStyle({opacity:1,weight:4}));transitPins.forEach(pin=>pin.setOpacity(1));const chosen=city?points.filter(p=>p.lon>9):points;const bounds=L.latLngBounds(chosen.filter(p=>Number.isFinite(p.lat)).map(p=>[p.lat,p.lon]));if(bounds.isValid())transitMap.fitBounds(bounds,{padding:[35,35],maxZoom:16});document.getElementById('transitFull')?.setAttribute('aria-pressed',String(!city));document.getElementById('transitCity')?.setAttribute('aria-pressed',String(city));};
 document.getElementById('transitFull').onclick=()=>fitTransit(false);document.getElementById('transitCity').onclick=()=>fitTransit(true);fitTransit(false);
 const n=document.getElementById('transitMapNotice');if(n)n.textContent=points.map((p,i)=>`${i+1}. ${p.name}`).join(' → ');
 }
return {render,clear,point,key,renderJourney,renderTransit};
})();
