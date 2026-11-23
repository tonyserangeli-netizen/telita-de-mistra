/* ============ capas, interruptores, fotos en notas, dados, compendio ============ */
const linkFind=id=>id?(C.efectos.find(e=>e.id===id)||(C.capas||[]).find(c=>c.id===id)||null):null;
const linkOpts=()=>[...C.efectos.map(x=>[x.id,x.n]),...(C.capas||[]).map(x=>[x.id,L("Capa")+": "+x.n])];
const vib=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};

/* ---------- capas ---------- */
function layerImg(c,p){
  const li=c.imgs&&c.imgs[p.id];if(!li||!li.img)return"";const src=getImg(li.img);if(!src)return"";
  return`<img class="capa" src="${src}" alt="" style="opacity:${+c.op||1};transform:translate(${+li.x||0}%,${+li.y||0}%) rotate(${+li.r||0}deg) scale(${(+li.s||1)*(li.f?-1:1)},${+li.s||1})">`;
}
function layersHTML(p,pos){return(C.capas||[]).filter(c=>c.on&&(c.pos||"delante")===pos).map(c=>layerImg(c,p)).join("")}
function quickToggles(){
  const z=C.efectos.filter(e=>!e.med),k=C.capas||[];
  if(!z.length&&!k.length)return"";
  return`<div class="sec" style="gap:4px"><span class="hint">${L("Brillos y capas")}</span><div class="chips">
    ${z.map(e=>`<button class="chip tog ${e.on?"lit":""}" style="--c:${e.c}" data-a="effToggle" data-id="${e.id}"><i class="fxdot" style="--c:${e.c}"></i>${esc(e.n)}${e.on&&e.left>0?` · ${e.left}`:""}</button>`).join("")}
    ${k.map(c=>`<button class="chip tog ${c.on?"lit":""}" style="--c:var(--gold)" data-a="capaToggle" data-id="${c.id}">◧ ${esc(c.n)}${c.on&&c.left>0?` · ${c.left}`:""}</button>`).join("")}
  </div></div>`;
}
function capasSection(){
  const list=C.capas||[];
  return`<div class="sec"><h2>${L("Capas")}</h2><p class="hint">${L("Imágenes que se ponen encima o detrás del personaje: armaduras, alas, espectros, auras, brazos de más… Se prenden y apagan con un toque.")}</p>
  ${list.map(c=>{const ref=`C.capas.${c.id}`;return`<div class="card">
    <div class="row" style="flex-wrap:nowrap">${favStar(ref)}<input ${R(ref,"n")} value="${esc(c.n)}" style="flex:1" aria-label="${L("Nombre")}"><button class="btn small ${c.on?"on":""}" data-a="capaToggle" data-id="${c.id}">${c.on?L("Encendida"):L("Apagada")}</button></div>
    <div class="grid2"><label class="lbl">${L("Lugar")}<select ${R(ref,"pos")}>${opts([["delante",L("Delante del personaje")],["detras",L("Detrás del personaje")]],c.pos||"delante")}</select></label>
      <label class="lbl">${L("Dura (turnos, 0 = sin límite)")}<input type="number" min="0" ${R(ref,"dur","n")} value="${+c.dur||0}"></label>
      <label class="lbl">${L("Transparencia")}<input type="range" min="0.15" max="1" step="0.05" ${R(ref,"op","f")} value="${+c.op||1}"></label>
      <label class="lbl inline"><input type="checkbox" ${R(ref,"fondo","b")} ${c.fondo!==false?"checked":""}> ${L("Quitar fondo blanco al subir")}</label></div>
    <div class="sec" style="gap:6px">${C.poses.map(p=>{const li=c.imgs&&c.imgs[p.id],src=li&&getImg(li.img);return`<div class="mini" style="grid-template-columns:44px 1fr auto">
      <label class="thumb" style="width:44px;cursor:pointer;${src?`background-image:url(${src})`:""}">${src?"":"＋"}<input type="file" accept="image/*" data-capaup="${c.id}" data-pose="${p.id}" hidden></label>
      <span>${esc(p.n)}<br><span class="hint">${src?L("Imagen cargada"):L("Sin imagen")}</span></span>
      <span class="row">${src?`<button class="btn small" data-a="capaAdjust" data-id="${c.id}" data-v="${p.id}" ${getImg(p.img)?"":"disabled"}>✥ ${L("Acomodar")}</button><button class="btn small danger" data-a="capaImgDel" data-id="${c.id}" data-v="${p.id}" aria-label="${L("Quitar")}">×</button>`:`<label class="btn small">${L("Subir")}<input type="file" accept="image/*" data-capaup="${c.id}" data-pose="${p.id}" hidden></label>`}</span></div>`}).join("")}</div>
    <div class="row sb">${Object.keys(c.imgs||{}).length&&C.poses.length>1?`<button class="btn small" data-a="capaCopy" data-id="${c.id}">${L("Usar en las poses que faltan")}</button>`:"<span></span>"}<button class="btn small danger" data-a="del" data-ref="${ref}">${L("Borrar capa")}</button></div>
  </div>`}).join("")||`<div class="empty">${L("Sin capas todavía.")}</div>`}
  <button class="btn small" data-a="add" data-ref="C.capas" data-kind="capa">+ ${L("Nueva capa")}</button></div>`;
}
async function uploadCapa(cid,pid,file){
  if(!file)return;
  try{const url=await new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.onerror=rej;fr.readAsDataURL(file)});
    const im=await loadImage(url);const s=Math.min(1,1000/Math.max(im.naturalWidth,im.naturalHeight));const w=Math.round(im.naturalWidth*s),h=Math.round(im.naturalHeight*s);
    const cv=document.createElement("canvas");cv.width=w;cv.height=h;const ctx=cv.getContext("2d");ctx.drawImage(im,0,0,w,h);
    const c=C.capas.find(x=>x.id===cid);if(c.fondo!==false)removeWhite(ctx,w,h);
    let data=cv.toDataURL("image/webp",.88);if(!data.startsWith("data:image/webp"))data=cv.toDataURL("image/png");
    snap();const key=await putImg(data);c.imgs=c.imgs||{};const old=c.imgs[pid];c.imgs[pid]={img:key,x:0,y:0,s:1,r:0,f:false};if(old&&!Object.values(c.imgs).some(v=>v!==c.imgs[pid]&&v.img===old.img))dropImg(old.img);
    C.pose=pid;c.on=true;saveSoon();render();toast(L("Imagen cargada"));
  }catch(e){toast(L("No se pudo leer la imagen"))}
}
async function openLayerAdjust(cid,pid){
  const c=C.capas.find(x=>x.id===cid),p=C.poses.find(x=>x.id===pid);if(!c||!p)return;const li=c.imgs[pid];if(!li)return;
  const T={x:+li.x||0,y:+li.y||0,s:+li.s||1,r:+li.r||0,f:!!li.f};
  const m=document.getElementById("modal");
  m.innerHTML=`<div class="paint"><div class="row sb"><div><strong>${esc(c.n)}</strong> · <span class="hint">${esc(p.n)}</span></div><div class="row"><button class="btn" data-q="cancel">${L("Cancelar")}</button><button class="btn on" data-q="save">${L("Guardar")}</button></div></div>
    <div class="pv" style="overflow:hidden;touch-action:none"><div class="stage adj" style="max-width:min(100%,calc((100svh - 230px) * 2 / 3));cursor:grab">
      ${(c.pos||"delante")==="detras"?`<img class="capa" alt="">`:""}<img class="base" src="${getImg(p.img)}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain">${(c.pos||"delante")!=="detras"?`<img class="capa" alt="">`:""}</div></div>
    <div class="row"><button class="btn small" data-q="flip">⇋ ${L("Espejar")}</button><button class="btn small" data-q="reset">${L("Restablecer")}</button>
      <label class="lbl inline">${L("Tamaño")} <input type="range" min="20" max="300" data-q="s" style="width:90px"></label><label class="lbl inline">${L("Giro")} <input type="range" min="-180" max="180" data-q="r" style="width:90px"></label></div>
    <p class="hint">${L("Arrastrá con un dedo para mover. Con dos dedos agrandás, achicás y girás a la vez.")}</p></div>`;
  const st=m.querySelector(".stage.adj"),ci=m.querySelector("img.capa");ci.src=getImg(li.img);ci.style.cssText="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;opacity:"+(+c.op||1);
  const sIn=m.querySelector('[data-q="s"]'),rIn=m.querySelector('[data-q="r"]');
  const draw=()=>{ci.style.transform=`translate(${T.x}%,${T.y}%) rotate(${T.r}deg) scale(${T.s*(T.f?-1:1)},${T.s})`;sIn.value=Math.round(T.s*100);rIn.value=Math.round(((T.r+540)%360)-180)};draw();
  const P=new Map();let g=null;
  const snapG=()=>{const v=[...P.values()],r=st.getBoundingClientRect();if(v.length>=2){g={two:true,d:Math.hypot(v[0].x-v[1].x,v[0].y-v[1].y)||1,a:Math.atan2(v[1].y-v[0].y,v[1].x-v[0].x),mx:(v[0].x+v[1].x)/2,my:(v[0].y+v[1].y)/2,T:{...T},w:r.width,h:r.height}}else if(v.length===1){g={two:false,x:v[0].x,y:v[0].y,T:{...T},w:r.width,h:r.height}}else g=null};
  st.addEventListener("pointerdown",e=>{e.preventDefault();try{st.setPointerCapture(e.pointerId)}catch(x){}P.set(e.pointerId,{x:e.clientX,y:e.clientY});snapG()});
  st.addEventListener("pointermove",e=>{if(!P.has(e.pointerId)||!g)return;P.set(e.pointerId,{x:e.clientX,y:e.clientY});const v=[...P.values()];
    if(g.two&&v.length>=2){const d=Math.hypot(v[0].x-v[1].x,v[0].y-v[1].y)||1,a=Math.atan2(v[1].y-v[0].y,v[1].x-v[0].x),mx=(v[0].x+v[1].x)/2,my=(v[0].y+v[1].y)/2;
      T.s=clamp(g.T.s*d/g.d,.2,3);T.r=g.T.r+(a-g.a)*180/Math.PI;T.x=g.T.x+(mx-g.mx)/g.w*100;T.y=g.T.y+(my-g.my)/g.h*100}
    else if(!g.two){T.x=g.T.x+(e.clientX-g.x)/g.w*100;T.y=g.T.y+(e.clientY-g.y)/g.h*100}
    draw()});
  ["pointerup","pointercancel"].forEach(n=>st.addEventListener(n,e=>{P.delete(e.pointerId);snapG()}));
  st.addEventListener("wheel",e=>{e.preventDefault();if(e.shiftKey)T.r+=e.deltaY>0?3:-3;else T.s=clamp(T.s*(e.deltaY<0?1.06:1/1.06),.2,3);draw()},{passive:false});
  m.oninput=e=>{const k=e.target.dataset.q;if(k==="s")T.s=num(e.target.value)/100;if(k==="r")T.r=num(e.target.value);draw()};
  m.onclick=e=>{const b=e.target.closest("[data-q]");if(!b||b.tagName==="INPUT")return;const k=b.dataset.q;
    if(k==="flip"){T.f=!T.f;draw()}if(k==="reset"){Object.assign(T,{x:0,y:0,s:1,r:0,f:false});draw()}
    if(k==="cancel"){m.innerHTML="";m.onclick=m.oninput=null}
    if(k==="save"){snap();Object.assign(li,{x:+T.x.toFixed(2),y:+T.y.toFixed(2),s:+T.s.toFixed(3),r:+T.r.toFixed(1),f:T.f});C.pose=pid;c.on=true;m.innerHTML="";m.onclick=m.oninput=null;saveSoon();render();toast(L("Capa acomodada"))}};
}

/* ---------- fotos en notas ---------- */
function noteImgs(n,ref){
  return`<div class="nimgs">${(n.imgs||[]).map(k=>{const s=getImg(k);return`<button class="nimg" data-a="viewImg" data-k="${k}" data-ref="${ref}" style="${s?`background-image:url(${s})`:""}" aria-label="${L("Ver foto")}"></button>`}).join("")}
    <label class="nimg add">＋<span>${L("Foto")}</span><input type="file" accept="image/*" multiple data-noteimg="${ref}" hidden></label></div>`;
}
async function addNoteImgs(ref,files){
  const r=resolve(ref);if(!r||!files||!files.length)return;const n=r.obj;n.imgs=n.imgs||[];
  for(const f of files){try{const url=await new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.onerror=rej;fr.readAsDataURL(f)});
    const im=await loadImage(url);const s=Math.min(1,1400/Math.max(im.naturalWidth,im.naturalHeight));const w=Math.round(im.naturalWidth*s),h=Math.round(im.naturalHeight*s);
    const cv=document.createElement("canvas");cv.width=w;cv.height=h;cv.getContext("2d").drawImage(im,0,0,w,h);let d=cv.toDataURL("image/webp",.82);if(!d.startsWith("data:image/webp"))d=cv.toDataURL("image/jpeg",.85);
    n.imgs.push(await putImg(d))}catch(e){toast(L("No se pudo leer la imagen"))}}
  await saveNotes();render();toast(L("Foto agregada"));
}
function viewImg(k,ref){
  const m=document.getElementById("modal"),s=getImg(k);if(!s)return;
  m.innerHTML=`<div class="paint" style="gap:8px"><div class="row sb"><span></span><div class="row"><button class="btn small danger" data-q="del">${L("Borrar foto")}</button><button class="btn on" data-q="close">${L("Cerrar")}</button></div></div>
    <div class="pv"><img src="${s}" alt="" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:10px"></div></div>`;
  let armed=false;
  m.onclick=async e=>{const b=e.target.closest("[data-q]");if(!b)return;
    if(b.dataset.q==="close"){m.innerHTML="";m.onclick=null}
    if(b.dataset.q==="del"){if(!armed){armed=true;b.textContent=L("¿Seguro? Tocá otra vez");return}const r=resolve(ref);if(r){r.obj.imgs=(r.obj.imgs||[]).filter(x=>x!==k);await saveNotes();dropImg(k)}m.innerHTML="";m.onclick=null;render()}};
}
const noteImgKeys=(nodes=NOTES,out=[])=>{nodes.forEach(n=>{(n.imgs||[]).forEach(k=>out.push(k));noteImgKeys(n.k||[],out)});return out};

/* ---------- calculadora de tiradas ---------- */
const rnd=n=>{try{const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]%n+1}catch(e){return Math.floor(Math.random()*n)+1}};
function parseDmg(s){
  s=String(s||"");const dice=[];let rest=s.replace(/(\d*)\s*d\s*(\d+)/gi,(m,a,b)=>{dice.push([+a||1,+b]);return" "});
  let flat=0;(rest.match(/[+-]\s*\d+/g)||[]).forEach(x=>flat+=parseInt(x.replace(/\s/g,"")));
  const first=rest.trim().match(/^\d+/);if(!dice.length&&first)flat+=+first[0];
  const tipo=rest.replace(/[+-]\s*\d+/g,"").replace(/^\s*\d+/,"").trim();
  return{dice,flat,tipo};
}
const CRITS=[["doble","Duplicar dados"],["triple","Triplicar dados"],["max","Daño máximo"],["maxmas","Máximo + tirada normal"],["custom","Personalizado (multiplicar y máximos)"],["nada","Sin crítico"]];
function diceOpen(){const mm=document.getElementById("modal");mm.onclick=mm.oninput=null;ui.dc=ui.dc||{tab:"ataque",sel:"",adv:"normal",bonus:0,hist:[]};ui.dc.r=null;renderDice()}
function dcOptions(){
  const t=ui.dc.tab;
  if(t==="ataque")return C.armas.map(a=>[a.id,a.n]);
  if(t==="habilidad")return C.skills.map(s=>[s.id,s.n]);
  if(t==="salvacion")return C.saves.map(s=>[s.id,s.n]);
  if(t==="caract")return C.stats.map(s=>[s.id,s.n||s.k]);
  return[];
}
function dcBonus(){
  const t=ui.dc.tab,id=ui.dc.sel;
  if(t==="ataque"){const a=C.armas.find(x=>x.id===id);return a?num(String(a.b).replace(/\s/g,"")):0}
  if(t==="habilidad"){const s=C.skills.find(x=>x.id===id);return s?rowVal(s):0}
  if(t==="salvacion"){const s=C.saves.find(x=>x.id===id);return s?rowVal(s):0}
  if(t==="caract"){const s=C.stats.find(x=>x.id===id);return s?modN(s.v):0}
  if(t==="iniciativa"){const d=C.stats.find(s=>s.k==="DES");return(d?modN(d.v):0)+(+C.iniExtra||0)}
  return num(ui.dc.bonus);
}
function renderDice(){
  const m=document.getElementById("modal"),D=ui.dc;const o=dcOptions();if(o.length&&!o.some(x=>x[0]===D.sel))D.sel=o[0][0];
  const w=D.tab==="ataque"&&C.armas.find(x=>x.id===D.sel);const pd=w?parseDmg(w.d):null;
  const tabs=[["ataque","Ataque"],["habilidad","Habilidad"],["salvacion","Salvación"],["caract","Característica"],["iniciativa","Iniciativa"],["libre","Libre"]];
  m.innerHTML=`<div class="dsheet" data-dsheet><div class="dpanel">
    <div class="row sb"><h2 style="font-family:var(--display);margin:0">${L("Tirada")}</h2><span class="row" style="flex-wrap:nowrap"><button class="btn on" data-q="tray">🎲 ${L("Mesa de dados")}</button><button class="btn" data-q="close">${L("Cerrar")}</button></span></div>
    <div class="chips">${tabs.map(([k,n])=>`<button class="chip pose ${D.tab===k?"on":""}" data-q="tab" data-v="${k}">${L(n)}</button>`).join("")}</div>
    ${o.length?`<select data-q="sel">${opts(o,D.sel)}</select>`:D.tab==="libre"?`<label class="lbl">${L("Bonificador")}<input type="number" data-q="bonus" value="${num(D.bonus)}"></label>`:""}
    ${D.tab==="ataque"&&!o.length?`<p class="hint">${L("Agregá armas en la pestaña Armas.")}</p>`:""}
    <div class="row"><span class="hint">${L("Bonificador")}: <b class="dbon">${sg(dcBonus())}</b></span><span style="margin-left:auto" class="chips">${[["normal","Normal"],["ventaja","Ventaja"],["desventaja","Desventaja"]].map(([k,n])=>`<button class="chip pose ${D.adv===k?"on":""}" data-q="adv" data-v="${k}">${L(n)}</button>`).join("")}</span></div>
    ${modsCard()}
    <div class="drow"><label class="lbl">${L("Lo que salió en el d20")}<input type="number" inputmode="numeric" min="1" max="20" data-q="d1" value="${D.d1??""}" class="dbig"></label>
      ${D.adv!=="normal"?`<label class="lbl">${L("Segundo d20")}<input type="number" inputmode="numeric" min="1" max="20" data-q="d2" value="${D.d2??""}" class="dbig"></label>`:""}
      <button class="btn" data-q="roll20">${L("Tirar virtual")}</button></div>
    <div class="dres" data-dres></div>
    ${pd&&(pd.dice.length||pd.flat)?`<div class="card"><div class="row sb"><strong>${L("Daño")}</strong><span class="hint">${esc(w.d)}</span></div>
      <label class="lbl">${L("Crítico")}<select data-q="crit">${opts(CRITS.map(([k,n])=>[k,L(n)]),w.crit||"doble")}</select></label>${w.crit==="custom"?`<span class="hint">×${+w.critMult||2} · ${L({ninguno:"se tiran todos",mitad:"la mitad al máximo",todos:"todos al máximo"}[w.critMax||"ninguno"])}</span>`:""}
      <div class="drow"><label class="lbl"><span data-dlabel>${L("Suma de los dados de daño")}</span><input type="number" inputmode="numeric" data-q="dmg" value="${D.dmg??""}" class="dbig"></label><button class="btn" data-q="rolldmg">${L("Tirar virtual")}</button></div>
      <div class="dres" data-ddres></div></div>`:""}
    ${D.hist.length?`<h3>${L("Últimas tiradas")}</h3><div class="log">${D.hist.map(h=>`<span>${esc(h)}</span>`).join("")}</div>`:""}
  </div></div>`;
  dcCompute();
}
const MOD_EN=[["todas","Todas las tiradas"],["ataque","Ataques"],["habilidad","Habilidades"],["salvacion","Salvaciones"],["caract","Características"],["iniciativa","Iniciativa"],["libre","Libre"]];
function modsFor(kind){const D=ui.dc;return(C.mods||[]).filter(m=>m.on&&(m.a||"tirada")===kind&&((m.en||"todas")==="todas"||m.en===D.tab))}
function modSum(kind){const D=ui.dc;let tot=0;const parts=[];modsFor(kind).forEach(m=>{const p=parseDmg(m.v);let v=p.flat;if(p.dice.length){const r=D.md&&D.md[m.id];v+=num(r)}tot+=v;parts.push(`${sg(v)} ${m.n}`)});if(kind==="tirada"&&num(D.extra)){tot+=num(D.extra);parts.push(`${sg(num(D.extra))} ${L("otro")}`)}return{tot,parts}}
function rollModDice(kind){const D=ui.dc;D.md=D.md||{};modsFor(kind).forEach(m=>{const p=parseDmg(m.v);if(p.dice.length){let s=0;p.dice.forEach(([n,f])=>{for(let i=0;i<n;i++)s+=rnd(f)});D.md[m.id]=s}})}
function modsCard(){
  const D=ui.dc,list=(C.mods||[]).filter(m=>(m.en||"todas")==="todas"||m.en===D.tab);
  if(D.medit)return`<div class="card"><div class="row sb"><strong>${L("Modificadores")}</strong><button class="btn small on" data-q="medit">${L("Listo")}</button></div>
    <p class="hint">${L("Valor: un número (+2, -1) o dados (1d4, +1d6). Se guardan en el personaje.")}</p>
    ${(C.mods||[]).map(m=>`<div class="modedit"><input data-q="mf" data-id="${m.id}" data-f="n" value="${esc(m.n)}" placeholder="${L("Nombre")}"><input data-q="mf" data-id="${m.id}" data-f="v" value="${esc(m.v)}" placeholder="+2 / 1d4" style="width:5.5em">
      <select data-q="mf" data-id="${m.id}" data-f="a">${opts([["tirada",L("A la tirada")],["daño",L("Al daño")]],m.a||"tirada")}</select>
      <select data-q="mf" data-id="${m.id}" data-f="en">${opts(MOD_EN.map(([k,n])=>[k,L(n)]),m.en||"todas")}</select><button class="btn small danger" data-q="mdel" data-v="${m.id}" aria-label="${L("Borrar")}">×</button></div>`).join("")||`<p class="hint">${L("Todavía no hay modificadores.")}</p>`}
    <button class="btn small" data-q="madd">+ ${L("Agregar modificador")}</button></div>`;
  return`<div class="card"><div class="row sb"><strong>${L("Modificadores")}</strong><button class="btn small" data-q="medit">${L("Editar")}</button></div>
    ${list.length?`<div class="chips">${list.map(m=>`<button class="chip tog ${m.on?"lit":""}" style="--c:var(--gold)" data-q="mtog" data-v="${m.id}">${esc(m.n)} <b>${esc(String(m.v).trim().match(/^[+-]/)?m.v:"+"+m.v)}</b>${(m.a||"tirada")==="daño"?` · ${L("daño")}`:""}</button>`).join("")}</div>`:`<p class="hint">${L("Agregá los tuyos: bendición, ventaja de terreno, furia, maldición… y prendelos cuando correspondan.")}</p>`}
    ${(C.mods||[]).filter(m=>m.on&&parseDmg(m.v).dice.length&&((m.en||"todas")==="todas"||m.en===D.tab)).map(m=>`<label class="lbl inline">${L("Resultado de {0} ({1})",esc(parseDmg(m.v).dice.map(([n,s])=>n+"d"+s).join("+")),esc(m.n))}<input type="number" inputmode="numeric" data-q="mdice" data-v="${m.id}" value="${D.md&&D.md[m.id]!=null?D.md[m.id]:""}" style="width:5em"></label>`).join("")}
    <label class="lbl inline">${L("Otro (solo esta tirada)")}<input type="number" data-q="extra" value="${D.extra??""}" style="width:5em"></label></div>`;
}
function dcCompute(){
  const m=document.getElementById("modal"),D=ui.dc;if(!m.querySelector("[data-dsheet]"))return;
  const b=dcBonus(),bo=m.querySelector(".dbon");if(bo)bo.textContent=sg(b);
  const d1=num(D.d1),d2=num(D.d2);let nat=null;
  if(d1){nat=D.adv==="normal"||!d2?d1:(D.adv==="ventaja"?Math.max(d1,d2):Math.min(d1,d2))}
  const crit=nat===20,fail=nat===1;D.crit=crit;
  const ms=modSum("tirada");const total=nat?nat+b+ms.tot:null;D.total=total;D.parts=ms.parts;
  const r=m.querySelector("[data-dres]");
  if(r)r.innerHTML=nat?`<div class="dtotal ${crit?"crit":fail?"fail":""}"><span class="hint">${nat} ${sg(b)}${ms.parts.length?" "+esc(ms.parts.join(" ")):""} =</span><b>${total}</b>${crit?`<em>${L("¡Crítico!")}</em>`:fail?`<em>${L("Pifia")}</em>`:""}</div>`:`<p class="hint">${L("Escribí lo que salió en tu dado o tocá Tirar virtual.")}</p>`;
  const w=D.tab==="ataque"&&C.armas.find(x=>x.id===D.sel);const dd=m.querySelector("[data-ddres]");
  if(w&&dd){const pd=parseDmg(w.d),mode=w.crit||"doble",isC=crit&&mode!=="nada";
    let mult=isC?(mode==="triple"?3:mode==="doble"?2:mode==="custom"?Math.max(1,+w.critMult||2):1):1;const dl=m.querySelector("[data-dlabel]");
    const cm=isC&&mode==="custom"?(w.critMax||"ninguno"):isC&&mode==="max"?"todos":"ninguno";
    const groups=pd.dice.map(([n,s])=>{const tot=n*mult,mx=cm==="todos"?tot:cm==="mitad"?Math.floor(tot/2):0;return{s,roll:tot-mx,mx}});
    const diceTxt=groups.filter(g=>g.roll).map(g=>`${g.roll}d${g.s}`).join(" + ")||"—";
    const maxFixed=groups.reduce((t,g)=>t+g.mx*g.s,0);
    const maxSum=pd.dice.reduce((t,[n,s])=>t+n*s,0);
    const extra=isC&&mode==="maxmas"?maxSum:maxFixed;
    const noRoll=groups.every(g=>!g.roll)&&groups.length>0;
    if(dl)dl.textContent=noRoll?L("Daño máximo: no hace falta tirar"):(maxFixed?L("Tirá {0} y escribí la suma (+{1} fijo por máximos)",diceTxt,maxFixed):L("Tirá {0} y escribí la suma",diceTxt));
    const dr=dl&&dl.closest(".drow");if(dr){const inp=dr.querySelector("input"),bt=dr.querySelector("button");if(inp)inp.style.display=noRoll?"none":"";if(bt)bt.style.display=noRoll?"none":""}
    let tot=null;const sum=num(D.dmg);const md=modSum("daño");
    if(noRoll)tot=extra+pd.flat+md.tot;else if(sum){tot=sum+pd.flat+extra+md.tot}
    dd.innerHTML=tot!==null?`<div class="dtotal ${isC?"crit":""}"><span class="hint">${noRoll?"":sum}${extra?`${noRoll?"":" + "}${extra}`:""} ${sg(pd.flat)}${md.parts.length?" "+esc(md.parts.join(" ")):""} =</span><b>${tot}</b><em>${esc(pd.tipo)}</em></div>`+`<button class="btn small" data-q="log">${L("Anotar en el registro")}</button>`:"";
    D.tot=tot;D.diceTxt=diceTxt;D.mult=mult}
}
function dcLabel(){const o=dcOptions().find(x=>x[0]===ui.dc.sel);return o?o[1]:L({libre:"Libre",iniciativa:"Iniciativa"}[ui.dc.tab]||"")}
function diceClick(e){
  const b=e.target.closest("[data-q]");if(!b||b.tagName==="INPUT"||b.tagName==="SELECT")return;const k=b.dataset.q,D=ui.dc,m=document.getElementById("modal");
  if(k==="tray"){openTray();return}
  if(k==="close"){m.innerHTML="";return}
  if(k==="tab"){D.tab=b.dataset.v;D.sel="";D.d1=D.d2=D.dmg=null;renderDice();return}
  if(k==="adv"){D.adv=b.dataset.v;renderDice();return}
  if(k==="medit"){D.medit=!D.medit;renderDice();return}
  if(k==="madd"){snap();C.mods=C.mods||[];C.mods.push({id:uid(),n:L("Nuevo modificador"),v:"+1",a:"tirada",en:"todas",on:true});saveSoon();renderDice();return}
  if(k==="mdel"){snap();C.mods=C.mods.filter(x=>x.id!==b.dataset.v);saveSoon();renderDice();return}
  if(k==="mtog"){const x=C.mods.find(y=>y.id===b.dataset.v);x.on=!x.on;saveSoon();renderDice();return}
  if(k==="roll20"){D.d1=rnd(20);D.d2=D.adv!=="normal"?rnd(20):null;rollModDice("tirada");renderDice();{const nn=D.adv==="normal"||!D.d2?D.d1:(D.adv==="ventaja"?Math.max(D.d1,D.d2):Math.min(D.d1,D.d2));sfx(null,nn===20&&C.sndEv&&C.sndEv.crit?"crit":nn===1&&C.sndEv&&C.sndEv.pifia?"pifia":"tirada")}if(D.crit)vib([60,40,120]);pushHist();return}
  if(k==="rolldmg"){const w=C.armas.find(x=>x.id===D.sel);if(!w)return;const pd=parseDmg(w.d);let s=0;pd.dice.forEach(([n,f])=>{for(let i=0;i<n*(D.mult||1);i++)s+=rnd(f)});D.dmg=s;rollModDice("daño");renderDice();return}
  if(k==="log"){pushHist(true);renderDice();toast(L("Anotado"));return}
}
function pushHist(withDmg){
  const D=ui.dc,d1=num(D.d1);if(!d1)return;const b=dcBonus();let nat=D.adv==="normal"||!num(D.d2)?d1:(D.adv==="ventaja"?Math.max(d1,num(D.d2)):Math.min(d1,num(D.d2)));
  dcCompute();const tot=D.total!=null?D.total:nat+b;
  let s=`${dcLabel()}: ${nat}${sg(b)}${(D.parts||[]).length?" "+D.parts.join(" "):""} = ${tot}${nat===20?" · "+L("¡Crítico!"):nat===1?" · "+L("Pifia"):""}`;if(withDmg&&D.tot!==null&&D.tot!==undefined)s+=` · ${L("Daño")} ${D.tot}`;
  D.hist.unshift(s);D.hist=D.hist.slice(0,6);log(s);saveSoon();
}
function diceInput(e){
  const t=e.target,k=t.dataset.q;if(!k)return;const D=ui.dc;
  if(k==="d1"||k==="d2"||k==="dmg"){D[k]=t.value===""?null:num(t.value);dcCompute()}
  if(k==="bonus"){D.bonus=num(t.value);dcCompute()}
  if(k==="extra"){D.extra=t.value===""?null:num(t.value);dcCompute()}
  if(k==="mdice"){D.md=D.md||{};D.md[t.dataset.v]=t.value===""?null:num(t.value);dcCompute()}
}
function diceChange(e){
  const t=e.target,k=t.dataset.q;if(!k)return;const D=ui.dc;
  if(k==="sel"){D.sel=t.value;D.dmg=null;renderDice()}
  if(k==="mf"){const x=C.mods.find(y=>y.id===t.dataset.id);if(x){snap();x[t.dataset.f]=t.value;saveSoon()}if(t.tagName==="SELECT")renderDice()}
  if(k==="crit"){const w=C.armas.find(x=>x.id===D.sel);if(w){snap();w.crit=t.value;saveSoon()}renderDice()}
  if(k==="d1"&&ui.dc.crit)vib([60,40,120]);
}
const D20='<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 4 58 19v26L32 60 6 45V19Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M32 4 18 24h28Zm-14 20L6 45m12-21 14 36m0-36L58 45M46 24 32 60M6 19l12 5m40-5-12 5M18 24l-12 21h52L46 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" opacity=".75"/><text x="32" y="40" font-size="13" text-anchor="middle" fill="currentColor" font-family="Georgia,serif" font-weight="700">20</text></svg>';
const fabHTML=()=>`<button class="dicefab" data-a="dice" aria-label="${L("Calculadora de tiradas")}">${D20}</button>`;

/* ---------- compendio ---------- */
let CMP=null,LIB=null;
const ESC_ES={abjuration:"abjuración",conjuration:"conjuración",divination:"adivinación",enchantment:"encantamiento",evocation:"evocación",illusion:"ilusión",necromancy:"nigromancia",transmutation:"transmutación"};
const CLS_ES={Bard:"Bardo",Cleric:"Clérigo",Druid:"Druida",Paladin:"Paladín",Ranger:"Explorador",Sorcerer:"Hechicero",Warlock:"Brujo",Wizard:"Mago"};
const clsName=c=>LANG==="en"?c:LANG==="pt"?({Bard:"Bardo",Cleric:"Clérigo",Druid:"Druida",Paladin:"Paladino",Ranger:"Patrulheiro",Sorcerer:"Feiticeiro",Warlock:"Bruxo",Wizard:"Mago"}[c]||c):(CLS_ES[c]||c);
const schName=s=>LANG==="en"?s:(ESC_ES[s]||s);
let CMPL=null;
async function loadCmp(){const want=LANG==="es"?"es":"en";if(CMP&&CMPL!==want)CMP=null;if(!CMP){try{const r=await fetch(`compendio-srd-${want}.json`);CMP=await r.json();CMPL=want}catch(e){CMP={spells:[],items:[],feats:[],err:true}}}if(!LIB)LIB=(await DB.get("lib"))||[];return CMP}
const saveLib=()=>DB.set("lib",LIB);
function cmpEntries(){
  const t=ui.cmp.tab;const own=(LIB||[]).filter(x=>t==="mios"||x.tipo===t).map(x=>Object.assign({own:true},x));
  if(t==="mios")return own;
  const src=t==="conjuro"?CMP.spells:t==="item"?CMP.items:CMP.feats;
  return[...own,...src.map((x,i)=>Object.assign({i,tipo:t},x))];
}
function cmpMeta(x){
  if(x.own)return x.meta||"";
  if(x.tipo==="conjuro")return[(x.lv?L("Nivel {0}",x.lv):L("Truco"))+" · "+schName(x.sc)+(x.ri?" · "+L("ritual"):""),x.ct,x.rg,x.co,x.du,(x.cl||[]).map(clsName).join(", ")].filter(Boolean).join(" · ");
  return x.ty||"";
}
function renderCmp(){
  const m=document.getElementById("modal"),U=ui.cmp;
  if(!CMP){m.innerHTML=`<div class="paint"><div class="empty">${L("Cargando compendio…")}</div></div>`;loadCmp().then(renderCmp);return}
  if(U.sel){renderCmpDetail();return}
  const q=norm(U.q);let list=cmpEntries();
  if(U.tab==="conjuro"){if(U.lv!=="")list=list.filter(x=>x.own||x.lv===+U.lv);if(U.cls)list=list.filter(x=>x.own||(x.cl||[]).includes(U.cls))}
  if(q)list=list.filter(x=>norm(x.n).includes(q)||(x.en&&norm(x.en).includes(q))||norm(x.d).includes(q)||norm(x.meta||"").includes(q));
  list.sort((a,b)=>(b.own?1:0)-(a.own?1:0)||(norm(a.n).startsWith(q)?0:1)-(norm(b.n).startsWith(q)?0:1)||(a.lv||0)-(b.lv||0)||a.n.localeCompare(b.n));
  const shown=list.slice(0,U.lim||60);
  m.innerHTML=`<div class="paint cmp"><div class="row sb"><h2 style="font-family:var(--display);margin:0">${L("Compendio")}</h2><button class="btn" data-q="close">${L("Cerrar")}</button></div>
    <div class="chips">${[["conjuro","Conjuros"],["item","Ítems mágicos"],["dote","Dotes"],["mios","Mis entradas"]].map(([k,n])=>`<button class="chip pose ${U.tab===k?"on":""}" data-q="tab" data-v="${k}">${L(n)}</button>`).join("")}</div>
    <input type="search" data-q="q" value="${esc(U.q)}" placeholder="${L("Buscar (nombre o texto)…")}" style="font-size:1rem;padding:9px 12px">
    ${U.tab==="conjuro"?`<div class="row"><select data-q="lv" style="width:auto">${opts([["",L("Todos los niveles")],["0",L("Trucos")],...[1,2,3,4,5,6,7,8,9].map(n=>[String(n),L("Nivel {0}",n)])],U.lv)}</select><select data-q="cls" style="width:auto">${opts([["",L("Todas las clases")],...Object.keys(CLS_ES).map(c=>[c,clsName(c)])],U.cls)}</select></div>`:""}
    <div class="cmplist">${shown.map(x=>`<button class="card cmprow" data-q="open" data-v="${x.own?"o:"+x.id:x.tipo+":"+x.i}"><span class="top"><span class="t">${hlText(x.n,U.q)}</span>${x.own?`<span class="tag blue">${L("propio")}</span>`:""}</span><span class="hint">${esc(cmpMeta(x))}</span></button>`).join("")||`<div class="empty">${L("Nada encontrado.")}</div>`}
      ${list.length>shown.length?`<button class="btn" data-q="more">${L("Mostrar más ({0})",list.length-shown.length)}</button>`:""}</div>
    <div class="row sb"><button class="btn small" data-q="new">+ ${L("Nueva entrada propia")}</button><span class="hint" style="font-size:.72rem">${(CMPL==="es"?L("Conjuros y dotes: SRD 5.2.1 en español; ítems mágicos: SRD 5.1 en español. Material de Wizards of the Coast (CC BY 4.0). Traducciones de la comunidad: translate-dnd5e-sdr2-es y ravanno-dnd5e-es."):L("Incluye material del SRD 5.1 de Wizards of the Coast (CC BY 4.0). Texto en inglés por ahora."))}</span></div></div>`;
}
function cmpFind(v){const[t,i]=v.split(":");if(t==="o")return Object.assign({own:true},LIB.find(x=>x.id===i)||{});const src=t==="conjuro"?CMP.spells:t==="item"?CMP.items:CMP.feats;return Object.assign({i:+i,tipo:t},src[+i])}
function renderCmpDetail(){
  const m=document.getElementById("modal"),U=ui.cmp;const x=U.sel==="new"?{own:true,id:uid(),tipo:U.tab==="mios"?"conjuro":U.tab,n:"",meta:"",d:"",isNew:true}:cmpFind(U.sel);U.cur=x;
  const dest=x.tipo==="item"?[["__mag",L("Ítems mágicos")]]:C?C.grupos.map(g=>[g.id,g.n]):[];
  m.innerHTML=`<div class="paint cmp"><div class="row sb"><button class="btn" data-q="back">← ${L("Volver")}</button><button class="btn" data-q="close">${L("Cerrar")}</button></div>
    <div class="cmpdet">${x.own?`<label class="lbl">${L("Tipo")}<select data-q="ot">${opts([["conjuro",L("Conjuro")],["item",L("Ítem mágico")],["dote",L("Dote")],["otro",L("Otro")]],x.tipo)}</select></label>
      <label class="lbl">${L("Nombre")}<input data-q="on" value="${esc(x.n)}"></label><label class="lbl">${L("Detalle corto (nivel, escuela, alcance…)")}<input data-q="om" value="${esc(x.meta||"")}"></label><label class="lbl">${L("Texto")}<textarea data-q="od" style="min-height:180px">${esc(x.d)}</textarea></label>
      <div class="row"><button class="btn on" data-q="osave">${L("Guardar en mi compendio")}</button>${x.isNew?"":`<button class="btn small danger" data-q="odel">${L("Borrar")}</button>`}</div>`
      :`<h2 style="font-family:var(--display);margin:0">${esc(x.n)}</h2><p class="hint">${esc(cmpMeta(x))}${x.cn&&!/^Concentr/.test(x.du||"")?" · "+L("Concentración"):""}</p><div class="pre">${esc(x.d)}</div>`}
    </div>
    ${C&&!x.isNew?`<div class="card"><div class="t">${L("Agregar a la ficha de {0}",esc(C.nombre))}</div><div class="row"><select data-q="dest" style="flex:1">${opts(dest,U.dest&&dest.some(d=>d[0]===U.dest)?U.dest:(dest.find(d=>/magia|conjur|spell/i.test(d[1]))||dest[0]||[""])[0])}</select><button class="btn on" data-q="add">${L("Agregar")}</button></div></div>`:""}
  </div>`;
}
function cmpAdd(){
  const x=ui.cmp.cur,m=document.getElementById("modal");const sel=m.querySelector('[data-q="dest"]');if(!x||!sel||!C)return;snap();
  const meta=cmpMeta(x);const d=(meta?meta+"\n\n":"")+(x.d||"");
  if(sel.value==="__mag"){const it=TPL("magico");Object.assign(it,{n:x.n,d,usos:{act:0,max:0}});C.magicos.push(it)}
  else{const g=C.grupos.find(z=>z.id===sel.value);if(!g){toast(L("Creá un grupo en Poderes primero"));return}const it=TPL("item");it.n=x.n;it.d=d;if(x.tipo==="conjuro"&&x.lv!=null)it.nv=String(x.lv);
    if(x.tipo==="conjuro"&&x.lv>0){const r=C.recursos.find(r=>new RegExp("(nivel|level|nível)\\s*"+x.lv+"\\b","i").test(r.n));if(r)it.recurso=r.id}
    g.items.push(it);ui.cmp.dest=g.id}
  saveSoon();render();toast(L("{0} agregado a la ficha",x.n));
}
function cmpClick(e){
  const b=e.target.closest("[data-q]");if(!b||b.tagName==="INPUT"||b.tagName==="SELECT"||b.tagName==="TEXTAREA")return;const k=b.dataset.q,U=ui.cmp,m=document.getElementById("modal");
  if(k==="close"){m.innerHTML="";return}
  if(k==="tab"){U.tab=b.dataset.v;U.lim=60;renderCmp();return}
  if(k==="more"){U.lim=(U.lim||60)+80;renderCmp();return}
  if(k==="open"){U.sel=b.dataset.v;renderCmp();m.scrollTop=0;return}
  if(k==="new"){U.sel="new";renderCmp();return}
  if(k==="back"){U.sel=null;renderCmp();return}
  if(k==="add"){cmpAdd();return}
  if(k==="osave"){const x=U.cur;const g=q=>(m.querySelector(`[data-q="${q}"]`)||{}).value||"";const e2={id:x.id,tipo:g("ot")||x.tipo,n:g("on").trim()||L("Sin nombre"),meta:g("om"),d:g("od")};
    const i=LIB.findIndex(y=>y.id===x.id);if(i>=0)LIB[i]=e2;else LIB.push(e2);saveLib();U.sel="o:"+e2.id;renderCmp();toast(L("Guardado en tu compendio"));return}
  if(k==="odel"){if(!b.dataset.armed){b.dataset.armed=1;b.textContent=L("¿Seguro? Tocá otra vez");return}LIB=LIB.filter(y=>y.id!==U.cur.id);saveLib();U.sel=null;renderCmp();return}
}
function cmpInput(e){const t=e.target,k=t.dataset.q;if(k==="q"){ui.cmp.q=t.value;ui.cmp.lim=60;const pos=t.selectionStart;renderCmp();const n=document.querySelector('#modal [data-q="q"]');if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(x){}}}}
function cmpChange(e){const t=e.target,k=t.dataset.q;if(k==="lv"||k==="cls"){ui.cmp[k]=t.value;renderCmp()}if(k==="dest")ui.cmp.dest=t.value}
function openCmp(tab){const mm=document.getElementById("modal");mm.onclick=mm.oninput=null;ui.cmp=ui.cmp||{tab:"conjuro",q:"",lv:"",cls:"",lim:60};if(tab)ui.cmp.tab=tab;ui.cmp.sel=null;ui.menu=false;render();renderCmp()}

/* ---------- ruteo de eventos del modal ---------- */
document.getElementById("modal").addEventListener("click",e=>{if(e.target.closest("[data-dsheet]")||(e.target.matches(".dsheet")))diceClick(e);else if(e.target.closest(".cmp"))cmpClick(e)});
document.getElementById("modal").addEventListener("input",e=>{if(e.target.closest("[data-dsheet]"))diceInput(e);else if(e.target.closest(".cmp"))cmpInput(e)});
document.getElementById("modal").addEventListener("change",e=>{if(e.target.closest("[data-dsheet]"))diceChange(e);else if(e.target.closest(".cmp"))cmpChange(e)});
document.getElementById("modal").addEventListener("click",e=>{if(e.target.classList&&e.target.classList.contains("dsheet"))document.getElementById("modal").innerHTML=""});
