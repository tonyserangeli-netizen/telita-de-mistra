/* ============ vitrina: imagen, evoluciones, capas y aura de armas e ítems ============ */
const AURAS=[["ninguna","Sin aura"],["brillo","Brillo"],["pulso","Pulso"],["fuego","Fuego"],["hielo","Escarcha"],["sombra","Sombra"],["rayos","Rayos"],["sagrado","Sagrado"]];
function visOf(o){o.vis=o.vis||{evo:[],cur:"",capas:[],c:"#d9a845",aura:"ninguna",fondo:true};o.vis.evo=o.vis.evo||[];o.vis.capas=o.vis.capas||[];o.vis.zonas=o.vis.zonas||[];return o.vis}
function visCur(v){return v.evo.find(e=>e.id===v.cur)||v.evo[0]}
function hasVis(o){return!!(o&&o.vis&&o.vis.evo&&o.vis.evo.some(e=>e.img))}
function visStage(o,cls){
  const v=visOf(o),e=visCur(v),src=e&&getImg(e.img);
  return`<div class="vstage ${cls||""} aura-${v.aura||"ninguna"}" style="--vc:${v.c||"#d9a845"}">${src?`<div class="vfig"><img class="vbase" src="${src}" alt="">${v.zonas.map(z=>effLayer(z,{id:e.id})).join("")}
    ${v.capas.filter(c=>c.on&&c.img).map(c=>{const s=getImg(c.img);return s?`<img class="vcapa" src="${s}" alt="" style="transform:translate(${+c.x||0}%,${+c.y||0}%) scale(${c.s==null?1:c.s}) rotate(${+c.r||0}deg)">`:""}).join("")}</div>`:`<div class="vempty">${L("Sin imagen")}</div>`}
    ${v.aura==="rayos"?`<svg class="vbolt" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M20 10l12 22-8 4 14 26-6 3 16 25"/><path d="M78 6l-10 20 8 4-12 24 7 3-13 30"/></svg>`:""}</div>`;
}
function visThumb(o,ref){return hasVis(o)?`<button class="vthumb" data-vx="open" data-ref="${ref}" aria-label="${L("Ver {0}",esc(o.n))}">${visStage(o,"mini")}</button>`:""}
function visBtn(ref){return`<button class="btn small" data-vx="open" data-ref="${ref}">🎨 ${L("Imagen, evoluciones y capas")}</button>`}

async function fileToKey(file,max,strip,opaque){
  const url=await new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.onerror=rej;fr.readAsDataURL(file)});
  const im=await loadImage(url);const s=Math.min(1,max/Math.max(im.naturalWidth,im.naturalHeight));const w=Math.round(im.naturalWidth*s),h=Math.round(im.naturalHeight*s);
  const cv=document.createElement("canvas");cv.width=w;cv.height=h;const ctx=cv.getContext("2d");ctx.drawImage(im,0,0,w,h);if(strip)removeWhite(ctx,w,h);
  let d=cv.toDataURL("image/webp",.88);if(!d.startsWith("data:image/webp"))d=opaque?cv.toDataURL("image/jpeg",.9):cv.toDataURL("image/png");return putImg(d);
}
function openVis(ref){const m=document.getElementById("modal");m.onclick=m.oninput=m.onchange=null;ui.vis=ref;ui.visEd=false;renderVis()}
function renderVis(){
  const ref=ui.vis,r=ref&&resolve(ref);const m=document.getElementById("modal");if(!r||!r.obj){ui.vis=null;return}
  const o=r.obj,v=visOf(o),cur=visCur(v),ed=ui.visEd,vr=ref+".vis";
  m.innerHTML=`<div class="dsheet" data-vism><div class="dpanel vis"><div class="row sb"><h2 style="margin:0;font-family:var(--display)">${esc(o.n)}</h2><span class="row"><button class="btn small ${ed?"on":""}" data-vx="ed">${ed?"✓ "+L("Listo"):"✎ "+L("Editar")}</button><button class="btn small" data-vx="close">✕</button></span></div>
    <div id="vstage-wrap">${visStage(o,"big")}</div>
    <h3>${L("Evoluciones")}</h3><p class="hint">${L("Cada evolución es una imagen distinta del arma u objeto (normal, despierta, maldita…). Tocá una para cambiarla.")}</p>
    <div class="chips">${v.evo.map((e,i)=>`<button class="chip pose ${cur&&cur.id===e.id?"on":""}" data-vx="evo" data-id="${e.id}">${esc(e.n||L("Evolución {0}",i+1))}</button>`).join("")}
      <label class="chip add">＋ ${L("Evolución")}<input type="file" accept="image/*" data-visup="evo" hidden></label></div>
    ${ed?v.evo.map(e=>`<div class="card vrow"><input ${R(`${vr}.evo.${e.id}`,"n")} value="${esc(e.n)}" placeholder="${L("Nombre de la evolución")}"><div class="row"><label class="btn small">${L("Cambiar imagen")}<input type="file" accept="image/*" data-visup="evoimg" data-id="${e.id}" hidden></label><button class="btn small danger" data-vx="delevo" data-id="${e.id}">${ui.vdel===e.id?L("¿Seguro? Tocá otra vez"):L("Borrar")}</button></div></div>`).join(""):""}
    <h3>${L("Capas superpuestas")}</h3><p class="hint">${L("Imágenes que se ponen encima: llamas, runas, sangre, gemas engarzadas… Se prenden y apagan con un toque.")}</p>
    <div class="chips">${v.capas.map(c=>`<button class="chip tog ${c.on?"lit":""}" data-vx="capa" data-id="${c.id}" aria-pressed="${!!c.on}">${esc(c.n)}</button>`).join("")}
      <label class="chip add">＋ ${L("Capa")}<input type="file" accept="image/*" data-visup="capa" hidden></label></div>
    ${ed?v.capas.map(c=>{const cr=`${vr}.capas.${c.id}`;return`<div class="card vrow"><input ${R(cr,"n")} value="${esc(c.n)}">
      <div class="grid2"><label class="lbl">${L("Mover ↔")}<input type="range" min="-60" max="60" step="1" data-vxr="${c.id}|x" value="${+c.x||0}"></label><label class="lbl">${L("Mover ↕")}<input type="range" min="-60" max="60" step="1" data-vxr="${c.id}|y" value="${+c.y||0}"></label>
      <label class="lbl">${L("Tamaño")}<input type="range" min="0.2" max="2.5" step="0.02" data-vxr="${c.id}|s" value="${c.s==null?1:c.s}"></label><label class="lbl">${L("Girar")}<input type="range" min="-180" max="180" step="1" data-vxr="${c.id}|r" value="${+c.r||0}"></label></div>
      <div class="row"><label class="btn small">${L("Cambiar imagen")}<input type="file" accept="image/*" data-visup="capaimg" data-id="${c.id}" hidden></label><button class="btn small danger" data-vx="delcapa" data-id="${c.id}">${ui.vdel===c.id?L("¿Seguro? Tocá otra vez"):L("Borrar")}</button></div></div>`}).join(""):""}
    <h3>${L("Zonas que brillan")}</h3><p class="hint">${L("Pintá partes del arma con rayos, fuego, hielo, sangre… con los mismos pinceles que el personaje. Tocá una zona para prenderla o apagarla.")}</p>
    <div class="chips">${v.zonas.map(z=>`<button class="chip tog ${z.on?"lit":""}" data-vx="ztog" data-id="${z.id}" aria-pressed="${!!z.on}">✦ ${esc(z.n)}</button>`).join("")}
      ${cur&&cur.img?`<button class="chip add" data-vx="zadd">🖌 ＋ ${L("Pintar zona nueva")}</button>`:`<span class="hint">${L("Primero subí una imagen (evolución).")}</span>`}</div>
    ${ed?v.zonas.map(z=>`<div class="card vrow"><input ${R(`${vr}.zonas.${z.id}`,"n")} value="${esc(z.n)}"><div class="row">${cur&&cur.img?`<button class="btn small" data-vx="zpaint" data-id="${z.id}">🖌 ${L("Pintar en esta evolución")}</button>`:""}<button class="btn small danger" data-vx="zdel" data-id="${z.id}">${ui.vdel===z.id?L("¿Seguro? Tocá otra vez"):L("Borrar")}</button></div></div>`).join(""):""}
    <h3>${L("Color y aura")}</h3>
    <div class="row"><label class="lbl inline">${L("Color")} <input type="color" ${R(vr,"c")} value="${v.c||"#d9a845"}" data-vlive></label></div>
    <div class="chips">${AURAS.map(([k,n])=>`<button class="chip ${v.aura===k?"on":""}" data-vx="aura" data-v="${k}">${L(n)}</button>`).join("")}</div>
    <label class="row hint" style="gap:6px;margin-top:8px"><input type="checkbox" ${R(vr,"fondo","b")} ${v.fondo!==false?"checked":""} style="width:auto"> ${L("Quitar el fondo blanco al subir imágenes")}</label>
  </div></div>`;
}
function visRestage(){const r=resolve(ui.vis);const w=document.getElementById("vstage-wrap");if(r&&w)w.innerHTML=visStage(r.obj,"big")}
(function(){
  document.addEventListener("click",e=>{const b=e.target.closest("[data-vx]");if(!b)return;e.preventDefault();e.stopPropagation();const k=b.dataset.vx;
    if(k==="open"){openVis(b.dataset.ref);return}
    const r=resolve(ui.vis);if(!r)return;const v=visOf(r.obj),id=b.dataset.id;
    if(k==="close"){ui.vis=null;document.getElementById("modal").innerHTML="";render();return}
    if(k==="ed"){ui.visEd=!ui.visEd;ui.vdel=null;render();renderVis();return}
    if(k==="evo"){v.cur=id;saveSoon();render();renderVis();return}
    if(k==="capa"){const c=v.capas.find(x=>x.id===id);c.on=!c.on;saveSoon();render();renderVis();return}
    if(k==="ztog"){const z=v.zonas.find(x=>x.id===id);z.on=!z.on;saveSoon();render();renderVis();return}
    if(k==="zadd"||k==="zpaint"){const cur=visCur(v);if(!cur)return;let z;if(k==="zadd"){z=Object.assign(TPL("efecto"),{n:L("Zona {0}",v.zonas.length+1),on:true,sub:[]});v.zonas.push(z)}else z=v.zonas.find(x=>x.id===id);
      ui.paint={eid:z.id,pid:cur.id,vis:ui.vis};openPainter();return}
    if(k==="zdel"){if(ui.vdel!==id){ui.vdel=id;renderVis();return}snap();const z=v.zonas.find(x=>x.id===id);(z.sub||[]).forEach(sb=>Object.values(sb.masks||{}).forEach(dropImg));v.zonas=v.zonas.filter(x=>x!==z);ui.vdel=null;saveSoon();render();renderVis();return}
    if(k==="aura"){v.aura=b.dataset.v;saveSoon();render();renderVis();return}
    if(k==="delevo"||k==="delcapa"){if(ui.vdel!==id){ui.vdel=id;renderVis();return}snap();const arr=k==="delevo"?"evo":"capas";const x=v[arr].find(z=>z.id===id);if(x&&x.img)dropImg(x.img);v[arr]=v[arr].filter(z=>z.id!==id);if(v.cur===id)v.cur="";ui.vdel=null;saveSoon();render();renderVis();return}
  },true);
  document.addEventListener("input",e=>{const t=e.target;if(t.dataset.vxr){const[id,f]=t.dataset.vxr.split("|");const r=resolve(ui.vis);if(!r)return;const c=visOf(r.obj).capas.find(x=>x.id===id);if(c){c[f]=parseFloat(t.value);visRestage();saveSoon()}}
    else if(t.hasAttribute("data-vlive")&&ui.vis){const r=resolve(ui.vis);if(r){visOf(r.obj).c=t.value;visRestage()}}});
  document.addEventListener("change",async e=>{const t=e.target;if(t.dataset.vxr){render();return}if(!t.dataset.visup)return;const f=t.files&&t.files[0];const r=resolve(ui.vis);if(!f||!r)return;const v=visOf(r.obj),k=t.dataset.visup;
    try{const key=await fileToKey(f,900,v.fondo!==false);snap();const nm=(f.name||"").replace(/\.[^.]+$/,"").slice(0,30);
      if(k==="evo"){const e2={id:uid(),n:v.evo.length?nm||L("Evolución {0}",v.evo.length+1):L("Normal"),img:key};v.evo.push(e2);v.cur=e2.id}
      if(k==="capa"){v.capas.push({id:uid(),n:nm||L("Capa {0}",v.capas.length+1),img:key,on:true,x:0,y:0,s:1,r:0})}
      if(k==="evoimg"||k==="capaimg"){const x=v[k==="evoimg"?"evo":"capas"].find(z=>z.id===t.dataset.id);if(x){if(x.img)dropImg(x.img);x.img=key}}
      saveSoon();render();renderVis();toast(L("Imagen cargada"))}catch(err){toast(L("No se pudo leer la imagen"))}});
})();
