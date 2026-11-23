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
    <div class="maplist">${MAPS.map(m=>{const s=getImg(m.img);return`<div class="mapcw"><button class="mapcard" data-mp="open" data-id="${m.id}">${s?`<img src="${s}" alt="">`:""}<span>${esc(m.n)}</span><small>${L("{0} anotaciones",(m.pins||[]).length)}</small></button><button class="mapx ${ui.mdelL===m.id?"on":""}" data-mp="ldel" data-id="${m.id}" aria-label="${L("Borrar mapa")}">${ui.mdelL===m.id?L("¿Borrar?"):"🗑"}</button></div>`}).join("")}
      <label class="mapcard add">＋<span>${L("Subir mapa")}</span><input type="file" accept="image/*" data-mapup hidden></label></div>
    <p class="hint">${L("Los mapas se guardan en este celular y los ven todos los personajes. Entran en \"Exportar todo\".")}</p></div>`;return}
  const s=getImg(cur.img),sel=M.sel&&(cur.pins||[]).find(p=>p.id===M.sel);
  mm.innerHTML=`<div class="mapw" data-mapm><div class="mbar2"><button class="btn small" data-mp="back">‹ ${L("Mapas")}</button>
      ${M.edit?`<input data-mapn value="${esc(cur.n)}" style="flex:1;min-width:0">`:`<b class="mtitle">${esc(cur.n)}</b>`}
      <span class="row" style="flex-wrap:nowrap"><button class="btn small ${M.ann?"on":""}" data-mp="ann" aria-pressed="${M.ann}" aria-label="${M.ann?L("Con anotaciones"):L("Sin anotaciones")}" title="${M.ann?L("Con anotaciones"):L("Sin anotaciones")}">${M.ann?"📍":"🖼"}</button><button class="btn small ${M.edit?"on":""}" data-mp="edit">${M.edit?"✓ "+L("Listo"):"✎ "+L("Editar")}</button></span></div>
    ${M.edit?mapTools(cur):(cur.pins||[]).length?"":`<p class="hint mhint">${L("Tocá «✎ Editar» para marcar lugares, cambiar el nombre o la imagen, o borrar el mapa.")}</p>`}
    <div class="mapview" id="mapview"><div class="mapinner ${M.edit&&M.tool==="draw"?"drawing":""}" id="mapinner" style="transform:translate(${M.x}px,${M.y}px)">${s?`<img src="${s}" alt="${esc(cur.n)}" draggable="false" style="${M.nw?`width:${M.nw*M.z}px`:""}">`:""}
      ${M.ann?(cur.pins||[]).map(p=>`<button class="mpin ${M.sel===p.id?"on":""}" data-mp="pin" data-id="${p.id}" style="left:${p.x*100}%;top:${p.y*100}%;--pc:${p.c||PINC[0]}"><i></i><span>${esc(p.t||"")}</span></button>`).join(""):""}</div>
      <div class="mzoom"><button class="btn small" data-mp="zin" aria-label="${L("Acercar")}">＋</button><button class="btn small" data-mp="zout" aria-label="${L("Alejar")}">－</button><button class="btn small" data-mp="zfit" aria-label="${L("Ver entero")}">⤢</button></div></div>
    ${sel&&M.ann?`<div class="mpinbox">${M.edit?`<input data-pinf="t" value="${esc(sel.t||"")}" placeholder="${L("Nombre (ej.: Taberna del Grifo)")}"><textarea data-pinf="d" rows="3" placeholder="${L("Qué hay acá")}">${esc(sel.d||"")}</textarea>
        <div class="row">${PINC.map(c=>`<button class="pcol ${sel.c===c?"on":""}" data-mp="pcol" data-v="${c}" style="background:${c}" aria-label="${L("Color")}"></button>`).join("")}<button class="btn small danger" data-mp="pdel" style="margin-left:auto">${L("Borrar")}</button></div>`
      :`<b>${esc(sel.t||"—")}</b>${sel.d?`<div class="d" style="white-space:pre-wrap">${esc(sel.d)}</div>`:""}`}<button class="btn small ghost" data-mp="punsel">${L("Cerrar")}</button></div>`:""}
    ${M.edit?`<div class="row"><label class="btn small">${L("Cambiar imagen")}<input type="file" accept="image/*" data-mapup="${cur.id}" hidden></label>${(cur.strokes||[]).length?`<button class="btn small danger" data-mp="dclr">${ui.dclr?L("¿Seguro? Tocá otra vez"):L("Borrar todo el dibujo")}</button>`:""}${(cur.pins||[]).length?`<button class="btn small danger" data-mp="pclr">${ui.pclr?L("¿Seguro? Tocá otra vez"):L("Borrar todas las marcas")}</button>`:""}<button class="btn small danger" data-mp="mdel">${ui.mdel?L("¿Seguro? Tocá otra vez"):L("Borrar mapa")}</button></div>`:""}
  </div>`;
  mapGestures();mapDrawSetup(cur);
}
const MAPC=["#111111","#d6233a","#d9a845","#39c46a","#36a3ff","#b06cff","#ffffff"],MAPS_SZ=[3,6,12,24];
function mapTools(cur){const M=ui.map,t=M.tool||"pin",tb=(v,ic,n)=>`<button class="btn small ${t===v?"on":""}" data-mp="tool" data-v="${v}">${ic} ${L(n)}</button>`;
  const sizes=`<span class="msz">${MAPS_SZ.map(z=>`<button class="mszb ${(M.bs||6)===z?"on":""}" data-mp="bsz" data-v="${z}" aria-label="${L("Grosor")} ${z}"><i style="width:${Math.min(z,20)}px;height:${Math.min(z,20)}px;background:${t==="erase"?"#bbb":(M.bc||"#d6233a")}"></i></button>`).join("")}</span>`;
  return`<div class="mtools">${tb("pin","📍","Marcar")}${tb("draw","✏️","Dibujar")}${tb("erase","🧽","Borrar")}${(cur.strokes||[]).length?`<button class="btn small" data-mp="undo" aria-label="${L("Deshacer")}">↶ ${L("Deshacer")}</button>`:""}</div>
  ${t==="draw"?`<div class="mtools">${MAPC.map(c=>`<button class="pcol ${(M.bc||"#d6233a")===c?"on":""}" data-mp="bcol" data-v="${c}" style="background:${c}" aria-label="${L("Color")}"></button>`).join("")}<label class="pcol mcolor" aria-label="${L("Otro color")}">🎨<input type="color" data-mapbc value="${M.bc||"#d6233a"}"></label>${sizes}</div>`:t==="erase"?`<div class="mtools">${sizes}</div>`:""}
  <p class="hint mhint">${t==="pin"?L("Tocá el mapa para poner una marca. Tocá una marca para editarla o borrarla."):t==="draw"?L("Dibujá con un dedo. Con dos dedos movés el mapa y hacés zoom."):L("Pasá el dedo para borrar el dibujo. Tocá una marca para borrarla.")}</p>`}
function mapPaint(x,cv,st,from){const W=cv.width,H=cv.height,p=st.p;x.save();x.globalCompositeOperation=st.e?"destination-out":"source-over";x.strokeStyle=x.fillStyle=st.c||"#000";x.lineWidth=Math.max(1,st.w*W);x.lineCap=x.lineJoin="round";
  if(p.length===1){x.beginPath();x.arc(p[0][0]*W,p[0][1]*H,x.lineWidth/2,0,7);x.fill()}
  else{const i0=Math.max(0,from-1);x.beginPath();x.moveTo(p[i0][0]*W,p[i0][1]*H);for(let i=i0+1;i<p.length;i++)x.lineTo(p[i][0]*W,p[i][1]*H);x.stroke()}x.restore()}
function mapReplay(cur){const cv=ui.map&&ui.map.dc;if(!cv)return;const x=cv.getContext("2d");x.clearRect(0,0,cv.width,cv.height);for(const st of cur.strokes||[])mapPaint(x,cv,st,0)}
function mapDrawSetup(cur){const M=ui.map,inner=document.getElementById("mapinner"),img=inner&&inner.querySelector("img");if(!img)return;
  const go=()=>{if(!img.naturalWidth||ui.map!==M||M.id!==cur.id)return;if(!(M.dc&&M.dcId===cur.id)){const sc=Math.min(1,1800/Math.max(img.naturalWidth,img.naturalHeight));const cv=document.createElement("canvas");cv.width=Math.round(img.naturalWidth*sc);cv.height=Math.round(img.naturalHeight*sc);cv.className="mapdraw";M.dc=cv;M.dcId=cur.id;mapReplay(cur)}
    M.dc.style.display=M.ann?"":"none";if(M.dc.parentNode!==inner||M.dc.previousSibling!==img)img.after(M.dc)};
  if(img.complete)go();else img.addEventListener("load",go,{once:true})}
function mapPinTap(id){const M=ui.map;if(!M)return;M.pinT=Date.now();const cur=MAPS.find(x=>x.id===M.id);if(!cur)return;
  if(M.edit&&M.tool==="erase"){cur.pins=(cur.pins||[]).filter(x=>x.id!==id);M.sel=null;saveMaps();toast(L("Marca borrada"));renderMaps();return}
  M.sel=M.sel===id?null:id;renderMaps()}
function mapPt(e){const r=ui.map.dc.getBoundingClientRect();if(!r.width)return null;const f=v=>Math.round(clamp(v,0,1)*10000)/10000;return[f((e.clientX-r.left)/r.width),f((e.clientY-r.top)/r.height)]}
function mapZ(z){const v=document.getElementById("mapview"),img=document.querySelector("#mapinner img");if(!v||!img||!img.naturalWidth)return clamp(z,.3,8);const r=v.getBoundingClientRect();const fit=Math.min(r.width/img.naturalWidth,r.height/img.naturalHeight);const dpr=window.devicePixelRatio||1;return clamp(z,fit*.8,Math.max(2/dpr,fit*3))}
function mapGestures(){
  const v=document.getElementById("mapview"),inner=document.getElementById("mapinner");if(!v||!inner)return;const M=ui.map;
  const pts=new Map();let start=null,moved=false;
  const img=inner.querySelector("img");
  const apply=()=>{inner.style.transform=`translate(${M.x}px,${M.y}px)`;if(img&&img.naturalWidth){M.nw=img.naturalWidth;img.style.width=(img.naturalWidth*M.z)+"px"}};
  v.onpointerdown=e=>{if(e.target.closest(".mzoom"))return;v.setPointerCapture(e.pointerId);pts.set(e.pointerId,{x:e.clientX,y:e.clientY});moved=false;
    const cur=MAPS.find(x=>x.id===M.id);
    if(pts.size===1){if(cur&&M.edit&&(M.tool==="draw"||M.tool==="erase")&&M.dc&&M.ann&&!e.target.closest(".mpin")){const pt=mapPt(e);if(pt){const r=M.dc.getBoundingClientRect();const st={c:M.bc||"#d6233a",w:Math.round((M.bs||6)*(M.tool==="erase"?2:1)/r.width*100000)/100000,p:[pt]};if(M.tool==="erase")st.e=1;cur.strokes=cur.strokes||[];cur.strokes.push(st);mapPaint(M.dc.getContext("2d"),M.dc,st,0);start={draw:st,cur,lx:e.clientX,ly:e.clientY};return}}
      start={x:e.clientX,y:e.clientY,mx:M.x,my:M.y,t:e.target}}
    if(pts.size===2&&start&&start.draw){const c2=start.cur;if(c2.strokes[c2.strokes.length-1]===start.draw){c2.strokes.pop();mapReplay(c2)}start=null}
    if(pts.size===2){const[a,b]=[...pts.values()];start={d:Math.hypot(a.x-b.x,a.y-b.y),z:M.z,cx:(a.x+b.x)/2,cy:(a.y+b.y)/2,mx:M.x,my:M.y}}};
  v.onpointermove=e=>{if(!pts.has(e.pointerId)||!start)return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pts.size===1&&start.draw){if(Math.hypot(e.clientX-start.lx,e.clientY-start.ly)<1.5)return;start.lx=e.clientX;start.ly=e.clientY;const pt=mapPt(e);if(pt){start.draw.p.push(pt);mapPaint(M.dc.getContext("2d"),M.dc,start.draw,start.draw.p.length-1)}moved=true;return}
    if(pts.size===1&&start.mx!=null&&start.d==null){const dx=e.clientX-start.x,dy=e.clientY-start.y;if(Math.abs(dx)+Math.abs(dy)>6)moved=true;M.x=start.mx+dx;M.y=start.my+dy;apply()}
    else if(pts.size===2&&start.d){const[a,b]=[...pts.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);const nz=mapZ(start.z*d/start.d);const r=v.getBoundingClientRect();const cx=start.cx-r.left,cy=start.cy-r.top;
      M.x=cx-(cx-start.mx)*(nz/start.z);M.y=cy-(cy-start.my)*(nz/start.z);M.z=nz;moved=true;apply()}};
  v.onpointerup=v.onpointercancel=e=>{if(start&&start.draw){pts.delete(e.pointerId);if(pts.size===0){const c2=start.cur;start=null;saveMaps();if(c2.strokes.length===1)renderMaps()}return}const wasTap=pts.size===1&&!moved&&start&&start.d==null;pts.delete(e.pointerId);if(pts.size===0){const t=start&&start.t;start=null;
      if(wasTap&&e.type==="pointerup"){const pn=t&&t.closest&&t.closest(".mpin");if(pn){mapPinTap(pn.dataset.id);return}if(ui.map.edit&&(ui.map.tool||"pin")==="pin")addPin(e)}}else start=null};
  v.onwheel=e=>{e.preventDefault();const r=v.getBoundingClientRect(),cx=e.clientX-r.left,cy=e.clientY-r.top,nz=mapZ(M.z*(e.deltaY<0?1.15:1/1.15));M.x=cx-(cx-M.x)*(nz/M.z);M.y=cy-(cy-M.y)*(nz/M.z);M.z=nz;apply()};
}
function mapFit(){const v=document.getElementById("mapview"),img=document.querySelector("#mapinner img");if(!v||!img||!img.naturalWidth)return;ui.map.nw=img.naturalWidth;const r=v.getBoundingClientRect();const z=Math.min(r.width/img.naturalWidth,r.height/img.naturalHeight);
  ui.map.z=z;ui.map.x=(r.width-img.naturalWidth*z)/2;ui.map.y=(r.height-img.naturalHeight*z)/2;renderMaps()}
function addPin(e){const img=document.querySelector("#mapinner img");if(!img)return;const r=img.getBoundingClientRect();const x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;if(x<0||y<0||x>1||y>1)return;
  const cur=MAPS.find(m=>m.id===ui.map.id);cur.pins=cur.pins||[];const p={id:uid(),x,y,t:"",d:"",c:PINC[0]};cur.pins.push(p);ui.map.sel=p.id;saveMaps();renderMaps();setTimeout(()=>{const i=document.querySelector('[data-pinf="t"]');if(i)i.focus()},50)}
(function(){
  document.addEventListener("click",e=>{const b=e.target.closest("[data-mp]");if(!b||!ui.map)return;e.preventDefault();e.stopPropagation();const k=b.dataset.mp,M=ui.map,cur=M.id&&MAPS.find(x=>x.id===M.id);
    if(k==="ldel"){const id=b.dataset.id;if(ui.mdelL!==id){ui.mdelL=id;renderMaps();return}ui.mdelL=null;const m=MAPS.find(x=>x.id===id);if(m){MAPS=MAPS.filter(x=>x!==m);if(m.img)dropImg(m.img);saveMaps();toast(L("Mapa borrado"))}renderMaps();return}
    if(k==="open")ui.mdelL=null;
    if(k==="close"){ui.map=null;document.getElementById("modal").innerHTML="";return}
    if(k==="open"){M.dc=null;M.id=b.dataset.id;M.nw=0;M.sel=null;M.edit=false;M.z=1;M.x=0;M.y=0;renderMaps();const im=document.querySelector("#mapinner img");if(im){if(im.complete)mapFit();else im.onload=mapFit}return}
    if(k==="back"){M.dc=null;M.id=null;M.sel=null;ui.mdel=false;renderMaps();return}
    if(k==="ann"){M.ann=!M.ann;if(!M.ann)M.sel=null;renderMaps();return}
    if(k==="edit"){M.edit=!M.edit;ui.mdel=ui.dclr=ui.pclr=false;renderMaps();return}
    if(k==="zin"||k==="zout"){const v=document.getElementById("mapview").getBoundingClientRect(),cx=v.width/2,cy=v.height/2,nz=mapZ(M.z*(k==="zin"?1.4:1/1.4));M.x=cx-(cx-M.x)*(nz/M.z);M.y=cy-(cy-M.y)*(nz/M.z);M.z=nz;renderMaps();return}
    if(k==="zfit"){mapFit();return}
    if(k==="tool"){M.tool=b.dataset.v;M.sel=null;ui.dclr=ui.pclr=false;if(M.tool!=="pin"&&!M.ann)M.ann=true;renderMaps();return}
    if(k==="bcol"){M.bc=b.dataset.v;renderMaps();return}
    if(k==="bsz"){M.bs=+b.dataset.v;renderMaps();return}
    if(k==="undo"){if(cur&&cur.strokes&&cur.strokes.length){cur.strokes.pop();mapReplay(cur);saveMaps()}renderMaps();return}
    if(k==="dclr"){if(!ui.dclr){ui.dclr=true;renderMaps();return}ui.dclr=false;cur.strokes=[];mapReplay(cur);saveMaps();toast(L("Dibujo borrado"));renderMaps();return}
    if(k==="pclr"){if(!ui.pclr){ui.pclr=true;renderMaps();return}ui.pclr=false;cur.pins=[];M.sel=null;saveMaps();toast(L("Marcas borradas"));renderMaps();return}
    if(k==="pin"){if(Date.now()-(M.pinT||0)>500)mapPinTap(b.dataset.id);return}
    if(k==="punsel"){M.sel=null;renderMaps();return}
    if(k==="pcol"){const p=cur.pins.find(x=>x.id===M.sel);p.c=b.dataset.v;saveMaps();renderMaps();return}
    if(k==="pdel"){cur.pins=cur.pins.filter(x=>x.id!==M.sel);M.sel=null;saveMaps();renderMaps();return}
    if(k==="mdel"){if(!ui.mdel){ui.mdel=true;renderMaps();return}ui.mdel=false;MAPS=MAPS.filter(x=>x!==cur);if(cur.img)dropImg(cur.img);saveMaps();M.id=null;renderMaps();return}
  },true);
  document.addEventListener("input",e=>{const t=e.target;if(!ui.map)return;const cur=MAPS.find(x=>x.id===ui.map.id);if(!cur)return;
    if(t.matches("[data-mapbc]")){ui.map.bc=t.value;document.querySelectorAll(".mszb i").forEach(i=>i.style.background=t.value);return}
    if(t.matches("[data-mapn]")){cur.n=t.value;clearTimeout(t._t);t._t=setTimeout(saveMaps,400)}
    if(t.dataset.pinf){const p=(cur.pins||[]).find(x=>x.id===ui.map.sel);if(p){p[t.dataset.pinf]=t.value;const lab=document.querySelector(`.mpin[data-id="${p.id}"] span`);if(lab&&t.dataset.pinf==="t")lab.textContent=t.value;clearTimeout(t._t);t._t=setTimeout(saveMaps,400)}}});
  document.addEventListener("change",async e=>{const t=e.target;if(!t.matches("[data-mapup]"))return;const f=t.files&&t.files[0];if(!f)return;
    try{toast(L("Cargando mapa…"));const key=await fileToKey(f,3600,false,true);await loadMaps();
      if(t.dataset.mapup){const cur=MAPS.find(x=>x.id===t.dataset.mapup);if(cur.img)dropImg(cur.img);cur.img=key;ui.map.dc=null}
      else{const m={id:uid(),n:(f.name||L("Mapa")).replace(/\.[^.]+$/,"").slice(0,40)||L("Mapa"),img:key,pins:[]};MAPS.push(m);ui.map.id=m.id;ui.map.edit=true}
      await saveMaps();renderMaps();const im=document.querySelector("#mapinner img");if(im){if(im.complete)mapFit();else im.onload=mapFit}}
    catch(err){toast(L("No se pudo leer la imagen"))}});
})();
