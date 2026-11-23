/* ============ mapas ============ */
let MAPS=null;
const PINC=["#d9a845","#d6233a","#36a3ff","#39c46a","#b06cff","#ffffff"];
async function loadMaps(){if(!MAPS)MAPS=(await DB.get("mapas"))||[];return MAPS}
const saveMaps=()=>DB.set("mapas",MAPS);
function mapImgKeys(){return(MAPS||[]).map(m=>m.img).filter(Boolean)}
async function openMaps(){await loadMaps();for(const m of MAPS)if(m.img&&!IMG.has(m.img)){const v=await DB.get(m.img);if(v)IMG.set(m.img,v)}
  const mm=document.getElementById("modal");mm.onclick=mm.oninput=mm.onchange=null;ui.map={id:null,ann:true,edit:false,sel:null,z:1,x:0,y:0};renderMaps()}
function renderMaps(){
  const M=ui.map,mm=document.getElementById("modal");if(!M)return;
  const cur=M.id&&MAPS.find(x=>x.id===M.id);
  if(!cur){mm.innerHTML=`<div class="mapw" data-mapm><div class="mbar2"><h2 style="margin:0;font-family:var(--display)">🗺 ${L("Mapas")}</h2><button class="btn small" data-mp="close">✕ ${L("Cerrar")}</button></div>
    <div class="maplist">${MAPS.map(m=>{const s=getImg(m.img);return`<button class="mapcard" data-mp="open" data-id="${m.id}">${s?`<img src="${s}" alt="">`:""}<span>${esc(m.n)}</span><small>${L("{0} anotaciones",(m.pins||[]).length)}</small></button>`}).join("")}
      <label class="mapcard add">＋<span>${L("Subir mapa")}</span><input type="file" accept="image/*" data-mapup hidden></label></div>
    <p class="hint">${L("Los mapas se guardan en este celular y los ven todos los personajes. Entran en \"Exportar todo\".")}</p></div>`;return}
  const s=getImg(cur.img),sel=M.sel&&(cur.pins||[]).find(p=>p.id===M.sel);
  mm.innerHTML=`<div class="mapw" data-mapm><div class="mbar2"><button class="btn small" data-mp="back">‹ ${L("Mapas")}</button>
      ${M.edit?`<input data-mapn value="${esc(cur.n)}" style="flex:1;min-width:0">`:`<b class="mtitle">${esc(cur.n)}</b>`}
      <span class="row" style="flex-wrap:nowrap"><button class="btn small ${M.ann?"on":""}" data-mp="ann" aria-pressed="${M.ann}">${M.ann?"📍 "+L("Con anotaciones"):"🖼 "+L("Sin anotaciones")}</button><button class="btn small ${M.edit?"on":""}" data-mp="edit">${M.edit?"✓ "+L("Listo"):"✎"}</button></span></div>
    ${M.edit?`<p class="hint mhint">${L("Tocá el mapa para poner una anotación. Tocá una anotación para editarla.")}</p>`:""}
    <div class="mapview" id="mapview"><div class="mapinner" id="mapinner" style="transform:translate(${M.x}px,${M.y}px)">${s?`<img src="${s}" alt="${esc(cur.n)}" draggable="false" style="${M.nw?`width:${M.nw*M.z}px`:""}">`:""}
      ${M.ann?(cur.pins||[]).map(p=>`<button class="mpin ${M.sel===p.id?"on":""}" data-mp="pin" data-id="${p.id}" style="left:${p.x*100}%;top:${p.y*100}%;--pc:${p.c||PINC[0]}"><i></i><span>${esc(p.t||"")}</span></button>`).join(""):""}</div>
      <div class="mzoom"><button class="btn small" data-mp="zin" aria-label="${L("Acercar")}">＋</button><button class="btn small" data-mp="zout" aria-label="${L("Alejar")}">－</button><button class="btn small" data-mp="zfit" aria-label="${L("Ver entero")}">⤢</button></div></div>
    ${sel&&M.ann?`<div class="mpinbox">${M.edit?`<input data-pinf="t" value="${esc(sel.t||"")}" placeholder="${L("Nombre (ej.: Taberna del Grifo)")}"><textarea data-pinf="d" rows="3" placeholder="${L("Qué hay acá")}">${esc(sel.d||"")}</textarea>
        <div class="row">${PINC.map(c=>`<button class="pcol ${sel.c===c?"on":""}" data-mp="pcol" data-v="${c}" style="background:${c}" aria-label="${L("Color")}"></button>`).join("")}<button class="btn small danger" data-mp="pdel" style="margin-left:auto">${L("Borrar")}</button></div>`
      :`<b>${esc(sel.t||"—")}</b>${sel.d?`<div class="d" style="white-space:pre-wrap">${esc(sel.d)}</div>`:""}`}<button class="btn small ghost" data-mp="punsel">${L("Cerrar")}</button></div>`:""}
    ${M.edit?`<div class="row"><label class="btn small">${L("Cambiar imagen")}<input type="file" accept="image/*" data-mapup="${cur.id}" hidden></label><button class="btn small danger" data-mp="mdel">${ui.mdel?L("¿Seguro? Tocá otra vez"):L("Borrar mapa")}</button></div>`:""}
  </div>`;
  mapGestures();
}
function mapZ(z){const v=document.getElementById("mapview"),img=document.querySelector("#mapinner img");if(!v||!img||!img.naturalWidth)return clamp(z,.3,8);const r=v.getBoundingClientRect();const fit=Math.min(r.width/img.naturalWidth,r.height/img.naturalHeight);const dpr=window.devicePixelRatio||1;return clamp(z,fit*.8,Math.max(2/dpr,fit*3))}
function mapGestures(){
  const v=document.getElementById("mapview"),inner=document.getElementById("mapinner");if(!v||!inner)return;const M=ui.map;
  const pts=new Map();let start=null,moved=false;
  const img=inner.querySelector("img");
  const apply=()=>{inner.style.transform=`translate(${M.x}px,${M.y}px)`;if(img&&img.naturalWidth){M.nw=img.naturalWidth;img.style.width=(img.naturalWidth*M.z)+"px"}};
  v.onpointerdown=e=>{if(e.target.closest(".mzoom"))return;v.setPointerCapture(e.pointerId);pts.set(e.pointerId,{x:e.clientX,y:e.clientY});moved=false;
    if(pts.size===1)start={x:e.clientX,y:e.clientY,mx:M.x,my:M.y,t:e.target};
    if(pts.size===2){const[a,b]=[...pts.values()];start={d:Math.hypot(a.x-b.x,a.y-b.y),z:M.z,cx:(a.x+b.x)/2,cy:(a.y+b.y)/2,mx:M.x,my:M.y}}};
  v.onpointermove=e=>{if(!pts.has(e.pointerId)||!start)return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pts.size===1&&start.mx!=null&&start.d==null){const dx=e.clientX-start.x,dy=e.clientY-start.y;if(Math.abs(dx)+Math.abs(dy)>6)moved=true;M.x=start.mx+dx;M.y=start.my+dy;apply()}
    else if(pts.size===2&&start.d){const[a,b]=[...pts.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);const nz=mapZ(start.z*d/start.d);const r=v.getBoundingClientRect();const cx=start.cx-r.left,cy=start.cy-r.top;
      M.x=cx-(cx-start.mx)*(nz/start.z);M.y=cy-(cy-start.my)*(nz/start.z);M.z=nz;moved=true;apply()}};
  v.onpointerup=v.onpointercancel=e=>{const wasTap=pts.size===1&&!moved&&start&&start.d==null;pts.delete(e.pointerId);if(pts.size===0){const t=start&&start.t;start=null;
      if(wasTap&&e.type==="pointerup"){if(t&&t.closest(".mpin"))return;if(ui.map.edit)addPin(e)}}else start=null};
  v.onwheel=e=>{e.preventDefault();const r=v.getBoundingClientRect(),cx=e.clientX-r.left,cy=e.clientY-r.top,nz=mapZ(M.z*(e.deltaY<0?1.15:1/1.15));M.x=cx-(cx-M.x)*(nz/M.z);M.y=cy-(cy-M.y)*(nz/M.z);M.z=nz;apply()};
}
function mapFit(){const v=document.getElementById("mapview"),img=document.querySelector("#mapinner img");if(!v||!img||!img.naturalWidth)return;ui.map.nw=img.naturalWidth;const r=v.getBoundingClientRect();const z=Math.min(r.width/img.naturalWidth,r.height/img.naturalHeight);
  ui.map.z=z;ui.map.x=(r.width-img.naturalWidth*z)/2;ui.map.y=(r.height-img.naturalHeight*z)/2;renderMaps()}
function addPin(e){const img=document.querySelector("#mapinner img");if(!img)return;const r=img.getBoundingClientRect();const x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;if(x<0||y<0||x>1||y>1)return;
  const cur=MAPS.find(m=>m.id===ui.map.id);cur.pins=cur.pins||[];const p={id:uid(),x,y,t:"",d:"",c:PINC[0]};cur.pins.push(p);ui.map.sel=p.id;saveMaps();renderMaps();setTimeout(()=>{const i=document.querySelector('[data-pinf="t"]');if(i)i.focus()},50)}
(function(){
  document.addEventListener("click",e=>{const b=e.target.closest("[data-mp]");if(!b||!ui.map)return;e.preventDefault();e.stopPropagation();const k=b.dataset.mp,M=ui.map,cur=M.id&&MAPS.find(x=>x.id===M.id);
    if(k==="close"){ui.map=null;document.getElementById("modal").innerHTML="";return}
    if(k==="open"){M.id=b.dataset.id;M.nw=0;M.sel=null;M.edit=false;M.z=1;M.x=0;M.y=0;renderMaps();const im=document.querySelector("#mapinner img");if(im){if(im.complete)mapFit();else im.onload=mapFit}return}
    if(k==="back"){M.id=null;M.sel=null;ui.mdel=false;renderMaps();return}
    if(k==="ann"){M.ann=!M.ann;if(!M.ann)M.sel=null;renderMaps();return}
    if(k==="edit"){M.edit=!M.edit;ui.mdel=false;renderMaps();return}
    if(k==="zin"||k==="zout"){const v=document.getElementById("mapview").getBoundingClientRect(),cx=v.width/2,cy=v.height/2,nz=mapZ(M.z*(k==="zin"?1.4:1/1.4));M.x=cx-(cx-M.x)*(nz/M.z);M.y=cy-(cy-M.y)*(nz/M.z);M.z=nz;renderMaps();return}
    if(k==="zfit"){mapFit();return}
    if(k==="pin"){M.sel=M.sel===b.dataset.id?null:b.dataset.id;renderMaps();return}
    if(k==="punsel"){M.sel=null;renderMaps();return}
    if(k==="pcol"){const p=cur.pins.find(x=>x.id===M.sel);p.c=b.dataset.v;saveMaps();renderMaps();return}
    if(k==="pdel"){cur.pins=cur.pins.filter(x=>x.id!==M.sel);M.sel=null;saveMaps();renderMaps();return}
    if(k==="mdel"){if(!ui.mdel){ui.mdel=true;renderMaps();return}ui.mdel=false;MAPS=MAPS.filter(x=>x!==cur);if(cur.img)dropImg(cur.img);saveMaps();M.id=null;renderMaps();return}
  },true);
  document.addEventListener("input",e=>{const t=e.target;if(!ui.map)return;const cur=MAPS.find(x=>x.id===ui.map.id);if(!cur)return;
    if(t.matches("[data-mapn]")){cur.n=t.value;clearTimeout(t._t);t._t=setTimeout(saveMaps,400)}
    if(t.dataset.pinf){const p=(cur.pins||[]).find(x=>x.id===ui.map.sel);if(p){p[t.dataset.pinf]=t.value;const lab=document.querySelector(`.mpin[data-id="${p.id}"] span`);if(lab&&t.dataset.pinf==="t")lab.textContent=t.value;clearTimeout(t._t);t._t=setTimeout(saveMaps,400)}}});
  document.addEventListener("change",async e=>{const t=e.target;if(!t.matches("[data-mapup]"))return;const f=t.files&&t.files[0];if(!f)return;
    try{toast(L("Cargando mapa…"));const key=await fileToKey(f,3600,false,true);await loadMaps();
      if(t.dataset.mapup){const cur=MAPS.find(x=>x.id===t.dataset.mapup);if(cur.img)dropImg(cur.img);cur.img=key}
      else{const m={id:uid(),n:(f.name||L("Mapa")).replace(/\.[^.]+$/,"").slice(0,40)||L("Mapa"),img:key,pins:[]};MAPS.push(m);ui.map.id=m.id;ui.map.edit=true}
      await saveMaps();renderMaps();const im=document.querySelector("#mapinner img");if(im){if(im.complete)mapFit();else im.onload=mapFit}}
    catch(err){toast(L("No se pudo leer la imagen"))}});
})();
