/* ============ grimorio y munición / consumibles ============ */

/* ---------- consumibles ---------- */
const CTIPOS=[["flecha","Flechas / virotes"],["bala","Balas / cartuchos"],["pocion","Pociones"],["bomba","Bombas / granadas"],["cuchillo","Cuchillos arrojadizos"],["dardo","Dardos"],["pergamino","Pergaminos"],["otro","Otro"]];
const CVERB={flecha:"Disparé",bala:"Disparé",pocion:"Beber",bomba:"Lanzar",cuchillo:"Lanzar",dardo:"Lanzar",pergamino:"Usar",otro:"Usar"};
function cIcon(t,c){
  c=c||"#c9a46a";
  switch(t){
    case "flecha":return`<svg viewBox="0 0 12 56"><path d="M6 2 2 10h8Z" fill="#cfd6de"/><rect x="5.2" y="9" width="1.6" height="38" fill="#8a6440"/><path d="M6 44 1 54h3l2-4 2 4h3Z" fill="${c}"/></svg>`;
    case "bala":return`<svg viewBox="0 0 12 30"><path d="M2 12Q2 3 6 1q4 2 4 11Z" fill="#c98b4a"/><rect x="2" y="12" width="8" height="15" rx="1" fill="#d9b35a"/><rect x="1.5" y="26" width="9" height="3" rx="1" fill="#a8873a"/></svg>`;
    case "pocion":return`<svg viewBox="0 0 26 32"><rect x="9" y="1" width="8" height="5" rx="1.5" fill="#8a6440"/><path d="M10 6h6v5q8 3 8 11a11 9 0 0 1-22 0q0-8 8-11Z" fill="#d6e4ee" opacity=".35"/><path d="M3.5 21a9.5 8 0 0 0 19 0q0-2-1-4H4.5q-1 2-1 4Z" fill="${c}"/><ellipse cx="9" cy="20" rx="2" ry="3" fill="#fff" opacity=".45"/></svg>`;
    case "bomba":return`<svg viewBox="0 0 28 30"><circle cx="13" cy="18" r="11" fill="#2b2b33"/><rect x="10" y="5" width="6" height="4" rx="1" fill="#555"/><path d="M15 5q3-4 7-2" stroke="#c98b4a" stroke-width="1.6" fill="none"/><circle cx="23" cy="3" r="2.2" fill="#ffb02e"/><circle cx="9" cy="14" r="2.5" fill="#fff" opacity=".18"/></svg>`;
    case "cuchillo":return`<svg viewBox="0 0 12 44"><path d="M6 1 10 26H2Z" fill="#cfd6de"/><path d="M6 1v25" stroke="#8d959e" stroke-width=".8"/><rect x="1" y="26" width="10" height="3" rx="1" fill="#8a6440"/><rect x="4" y="29" width="4" height="13" rx="1.5" fill="#5a3d26"/></svg>`;
    case "dardo":return`<svg viewBox="0 0 10 40"><path d="M5 1 3 12h4Z" fill="#cfd6de"/><rect x="4.3" y="11" width="1.4" height="20" fill="#5a3d26"/><path d="M5 28 1 38h8Z" fill="${c}"/></svg>`;
    case "pergamino":return`<svg viewBox="0 0 28 26"><rect x="4" y="4" width="20" height="18" rx="2" fill="#efe3c4"/><rect x="2" y="2" width="24" height="5" rx="2.5" fill="#d6c49a"/><rect x="2" y="19" width="24" height="5" rx="2.5" fill="#d6c49a"/><path d="M8 11h12M8 15h9" stroke="#8a6440" stroke-width="1.2"/></svg>`;
    default:return`<svg viewBox="0 0 24 24"><path d="M12 2 21 9 12 22 3 9Z" fill="${c}"/><path d="M3 9h18M12 2 8 9l4 13 4-13Z" fill="none" stroke="#fff" stroke-opacity=".35"/></svg>`;
  }
}
function cRack(x){
  const show=Math.min(x.max||x.act,30);let h="";
  if(+x.cap>0){
    h+=`<div class="rack mag" title="${L("Cargador")}">${Array.from({length:+x.cap},(_,i)=>`<i class="slot ${i<x.carga?"":"used"}">${cIcon(x.tipo,x.c)}</i>`).join("")}</div>`;
    h+=`<span class="hint">${L("Reserva")}: <b>${x.act}</b></span>`;
  }else{
    h+=`<div class="rack ${x.tipo}">${Array.from({length:show},(_,i)=>`<i class="slot ${i<x.act?"":"used"}">${cIcon(x.tipo,x.c)}</i>`).join("")}${(x.max||0)>30?`<span class="hint">+${x.max-30}</span>`:""}</div>`;
  }
  return h;
}
function consumHTML(compact){
  const list=C.consum||[];
  const cards=ord(list,"C.consum").map(x=>{const ref=`C.consum.${x.id}`;
    if(ui.edit&&!compact)return`<div class="card"><div class="row" style="flex-wrap:nowrap"><input ${R(ref,"n")} value="${esc(x.n)}" style="flex:1" placeholder="${L("Nombre")}"><select ${R(ref,"tipo")} style="width:auto">${opts(CTIPOS.map(([k,n])=>[k,L(n)]),x.tipo)}</select></div>
      <div class="grid2"><label class="lbl">${L("Cantidad")}<input type="number" min="0" ${R(ref,"act","n")} value="${x.act}"></label><label class="lbl">${L("Máximo")}<input type="number" min="0" ${R(ref,"max","n")} value="${x.max}"></label>
      <label class="lbl">${L("Cargador (0 = no usa)")}<input type="number" min="0" ${R(ref,"cap","n")} value="${+x.cap||0}"></label>
      ${x.tipo==="pocion"?`<label class="lbl">${L("Cura (ej.: 2d4+2)")}<input ${R(ref,"cura")} value="${esc(x.cura||"")}"></label>`:""}
      <label class="lbl">${L("Color")}<input type="color" ${R(ref,"c")} value="${x.c||"#c9a46a"}"></label>
      ${sndSel(ref,"snd","Sonido al usar")}${+x.cap>0?sndSel(ref,"sndR","Sonido al recargar"):""}</div>
      <textarea ${R(ref,"d")} placeholder="${L("Qué hace")}">${esc(x.d||"")}</textarea><button class="btn small danger" data-a="del" data-ref="${ref}">${L("Borrar")}</button></div>`;
    const left=+x.cap>0?x.carga:x.act;
    return`<div class="card cons" id="con-${x.id}"><div class="top"><span class="t">${favStar(ref)}${esc(x.n)}</span><span class="cost">${+x.cap>0?`${x.carga}/${x.cap} · ${L("reserva")} ${x.act}`:`${x.act}/${x.max}`}</span></div>
      ${cRack(x)}${x.d&&!compact?`<div class="d">${esc(x.d)}</div>`:""}
      <div class="row"><button class="use" data-a="cUse" data-id="${x.id}" ${left>0?"":"disabled"}>${L(CVERB[x.tipo]||"Usar")}${x.tipo==="pocion"&&x.cura?` (${esc(x.cura)})`:""}</button>
        ${+x.cap>0?`<button class="btn small" data-a="cReload" data-id="${x.id}" ${x.act>0&&x.carga<x.cap?"":"disabled"}>${L("Recargar")}</button>`:""}
        ${["flecha","cuchillo","dardo"].includes(x.tipo)&&x.gast?`<button class="btn small" data-a="cRecover" data-id="${x.id}">${L("Recuperar ({0})",Math.ceil(x.gast/2))}</button>`:""}
        <span style="margin-left:auto" class="row"><button class="btn small" data-a="cAdj" data-id="${x.id}" data-v="-1" aria-label="${L("Restar")}">−</button><button class="btn small" data-a="cAdj" data-id="${x.id}" data-v="1" aria-label="${L("Sumar")}">+</button></span></div></div>`}).join("");
  if(compact)return cards;
  return`<div class="sec"><h2>${L("Munición y consumibles")}</h2><p class="hint">${L("Carcaj, cargadores, pociones, bombas, cuchillos arrojadizos… Lo que se gasta se ve. Vinculá un arma a su munición para que se descuente sola.")}</p>
    ${cards||`<div class="empty">${L("Nada todavía.")}</div>`}
    <div class="row">${CTIPOS.slice(0,6).map(([k,n])=>`<button class="btn small" data-a="cAdd" data-v="${k}">+ ${L(n)}</button>`).join("")}</div></div>`;
}
function cSpend(x,n){n=n||1;if(+x.cap>0){if(x.carga<n)return false;x.carga-=n}else{if(x.act<n)return false;x.act-=n}x.gast=(+x.gast||0)+n;return true}
function rollExpr(s){const p=parseDmg(s);let t=p.flat;p.dice.forEach(([n,f])=>{for(let i=0;i<n;i++)t+=rnd(f)});return t}

const ammoOf=a=>a&&a.mun&&(C.consum||[]).find(x=>x.id===a.mun);
function hitLabel(a){const x=ammoOf(a);if(!x)return L("Golpeé");return L(["bala","flecha","dardo"].includes(x.tipo)?"Disparé":"Lancé")}
function ammoTag(a){const x=ammoOf(a);if(!x)return"";const left=+x.cap>0?x.carga:x.act;return`<span class="tag ${left?"":"blue"}" style="margin-right:auto">${esc(x.n)}: ${left}${+x.cap>0?"/"+x.cap:""}</span>`}
/* ---------- grimorio ---------- */
const isGrimGroup=g=>g.grim===true||(g.grim===undefined&&/magia|conjur|hechiz|spell|grimor|canci|plegar|ritual/i.test(g.n));
function grimItems(){let gs=C.grupos.filter(isGrimGroup);if(!gs.length)gs=C.grupos;const out=[];gs.forEach(g=>grpOrdered(g).forEach(it=>out.push({g,it,ref:`C.grupos.${g.id}.items.${it.id}`})));return out}
function grimUsable(it){if(unprep(grpOfItem(it),it))return{ok:false,why:L("No preparado")};const r=it.recurso&&C.recursos.find(x=>x.id===it.recurso);if(it.usos&&it.usos.max&&it.usos.act<=0)return{ok:false,why:L("Sin usos")};if(r&&+it.costo&&r.act<+it.costo)return{ok:false,why:L("Sin {0}",r.n)};return{ok:true}}
const landscape=()=>{try{return matchMedia("(orientation: landscape)").matches&&innerWidth>innerHeight}catch(e){return false}};
function grimPage(idx,items){
  if(idx===0){return`<div class="gpage idx"><div class="gtitle">${L("Grimorio de {0}",esc(C.nombre))}</div><div class="gsub">${L("Índice")}</div>
    <ol class="gindex">${items.map((x,i)=>{const u=grimUsable(x.it);return`<li class="${u.ok?"":"spent"}"><button data-g="go" data-v="${i+1}">${esc(x.it.n)}</button><span>${esc(x.g.n)}</span></li>`}).join("")||`<li>${L("Todavía no hay conjuros. Agregalos en Poderes o desde el Compendio.")}</li>`}</ol><button class="gbtn" data-g="new" style="margin-top:12px">＋ ${L("Página nueva")}</button></div>`}
  const x=items[idx-1];if(!x)return`<div class="gpage blank"></div>`;
  const it=x.it,u=grimUsable(it),r=it.recurso&&C.recursos.find(z=>z.id===it.recurso),img=getImg(it.img),ed=ui.gedit===it.id;
  const sname=id=>{const s=id&&(C.sonidos||[]).find(z=>z.id===id);return s?esc(s.n):""};
  const sline=(f,lbl)=>{const n=sname(it[f]);return`<div class="gsline"><span>${L(lbl)}:</span><b>${n||`<i>${L("sin sonido")}</i>`}</b>${n?`<button class="gbtn ghost mini" data-snd="play" data-id="${it[f]}" aria-label="${L("Escuchar")}">▶</button>`:""}<button class="gbtn ghost mini" data-snd="open" data-for="${x.ref}|${f}">${n?L("Cambiar"):"🎙 "+L("Poner sonido")}</button>${n?`<button class="gbtn ghost mini" data-g="sndoff" data-ref="${x.ref}" data-f="${f}" aria-label="${L("Quitar sonido")}">✕</button>`:""}</div>`};
  return`<div class="gpage ${u.ok||ed?"":"spent"}"><div class="geyebrow">${esc(x.g.n)}</div>
    ${ed?`<input class="gin gtitle" ${R(x.ref,"n")} value="${esc(it.n)}" placeholder="${L("Nombre del conjuro")}">`:`<div class="gtitle">${esc(it.n)}</div>`}
    <div class="gtags">${r?`<span>${esc(r.n)}: ${r.act}/${r.max}</span>`:""}${it.usos&&it.usos.max?`<span>${L("Usos")}: ${it.usos.act}/${it.usos.max}</span>`:""}${+it.dur?`<span>${+it.dur} ${L("turnos")}</span>`:""}</div>
    ${img?`<img class="gimg" src="${img}" alt="">`:""}
    ${ed?`<textarea class="gin gtext" rows="7" ${R(x.ref,"d")} placeholder="${L("Qué hace")}">${esc(it.d||"")}</textarea>`:`<div class="gtext">${esc(it.d||"")}</div>`}
    <div class="gsounds">${sline("snd","Sonido al lanzar")}${sline("sndPg","Sonido al abrir la página")}</div>
    ${ed?`<div class="gedrow"><label class="gbtn ghost">${img?L("Cambiar ilustración"):L("＋ Ilustración")}<input type="file" accept="image/*" data-grimimg="${x.ref}" hidden></label>${img?`<button class="gbtn ghost" data-g="imgoff" data-ref="${x.ref}">${L("Quitar ilustración")}</button>`:""}
      <button class="gbtn danger" data-g="del" data-ref="${x.ref}" data-gid="${x.g.id}" data-id="${it.id}">${ui.gdel===it.id?L("¿Seguro? Tocá otra vez"):"🗑 "+L("Borrar página")}</button></div>`:""}
    <div class="gfoot"><button class="gbtn ghost" data-g="edit" data-id="${it.id}">${ed?"✓ "+L("Listo"):"✎ "+L("Editar")}</button>
      <button class="gbtn" data-a="useItem" data-ref="${x.ref}" data-gcast ${u.ok?"":"disabled"}>${u.ok?L("Lanzar conjuro"):esc(u.why)}</button></div>
    ${u.ok||ed?"":`<div class="gstamp">${esc(u.why)}</div>`}<div class="gnum">${idx+1}</div></div>`;
}
function renderGrim(anim){
  const m=document.getElementById("modal");const items=grimItems();const two=landscape();const total=items.length+1;
  ui.gp=clamp(ui.gp||0,0,Math.max(0,total-1));if(two&&ui.gp%2)ui.gp--;
  const L1=grimPage(ui.gp,items),R1=two?grimPage(ui.gp+1,items):"";
  m.innerHTML=`<div class="grim ${two?"two":"one"}" data-grim><div class="gbar"><button class="gbtn ghost" data-g="close">✕ ${L("Cerrar")}</button><span>${L("Página {0} de {1}",ui.gp+1,total)}</span>
    <span class="row"><button class="gbtn ghost" data-g="go" data-v="0">${L("Índice")}</button><button class="gbtn ghost" data-g="pick">${L("Qué grupos entran")}</button></span></div>
    ${ui.gpick?`<div class="gpick">${C.grupos.map(g=>`<label><input type="checkbox" data-gpick="${g.id}" ${isGrimGroup(g)?"checked":""}> ${esc(g.n)}</label>`).join("")}</div>`:""}
    <div class="book ${anim||""}"><button class="gnav prev" data-g="prev" aria-label="${L("Página anterior")}" ${ui.gp>0?"":"disabled"}>‹</button>${L1}${R1}<button class="gnav next" data-g="next" aria-label="${L("Página siguiente")}" ${ui.gp+(two?2:1)<total?"":"disabled"}>›</button></div></div>`;
}
function openGrim(auto){const m=document.getElementById("modal");m.onclick=m.oninput=m.onchange=null;ui.grimAuto=!!auto;ui.gpick=false;renderGrim();}
function grimTurn(dir){const two=landscape(),step=two?2:1,total=grimItems().length+1,n=ui.gp+dir*step;if(n<0||n>=total)return;ui.gp=n;sfx(null,"pagina");pageSnd();renderGrim(dir>0?"turn-next":"turn-prev")}
function pageSnd(){if(APP.mute)return;const its=grimItems(),two=landscape();for(const p of two?[ui.gp,ui.gp+1]:[ui.gp]){const x=its[p-1];if(x&&x.it.sndPg){setTimeout(()=>playSnd(x.it.sndPg),C.sndEv&&C.sndEv.pagina?350:0);return}}}
(function(){
  const m=document.getElementById("modal");let sx=null,sy=null;
  m.addEventListener("click",e=>{if(!e.target.closest("[data-grim]"))return;const b=e.target.closest("[data-g]");
    if(e.target.closest("[data-gcast]")){setTimeout(()=>renderGrim(),0);return}
    if(!b)return;const k=b.dataset.g;
    if(k==="close"){m.innerHTML="";ui.grimAuto=false}
    if(k==="next")grimTurn(1);if(k==="prev")grimTurn(-1);
    if(k==="go"){ui.gp=num(b.dataset.v);pageSnd();renderGrim("turn-next")}
    if(k==="pick"){ui.gpick=!ui.gpick;renderGrim()}
    if(k==="edit"){ui.gedit=ui.gedit===b.dataset.id?null:b.dataset.id;ui.gdel=null;saveSoon();render();renderGrim()}
    if(k==="sndoff"){const r=resolve(b.dataset.ref);if(r&&r.obj){r.obj[b.dataset.f]="";saveSoon();renderGrim()}}
    if(k==="imgoff"){const r=resolve(b.dataset.ref);if(r&&r.obj&&r.obj.img){snap();dropImg(r.obj.img);r.obj.img="";saveSoon();renderGrim()}}
    if(k==="del"){const id=b.dataset.id;if(ui.gdel!==id){ui.gdel=id;renderGrim();return}
      const g=C.grupos.find(z=>z.id===b.dataset.gid);if(!g)return;snap();const it=g.items.find(z=>z.id===id);if(it&&it.img)dropImg(it.img);g.items=g.items.filter(z=>z.id!==id);ui.gdel=null;ui.gedit=null;saveSoon();render();renderGrim();toast(L("Página borrada"))}
    if(k==="new"){let g=C.grupos.find(isGrimGroup);if(!g){g={...TPL("grupo"),n:L("Conjuros"),grim:true,items:[]};C.grupos.push(g)}snap();const it=TPL("item");it.n=L("Conjuro nuevo");g.items.push(it);
      const n=grimItems().findIndex(z=>z.it.id===it.id);ui.gp=n+1;ui.gedit=it.id;saveSoon();render();renderGrim("turn-next")}});
  m.addEventListener("change",e=>{const t=e.target;if(t.dataset.gpick){const g=C.grupos.find(x=>x.id===t.dataset.gpick);if(g){C.grupos.forEach(x=>{if(x.grim===undefined)x.grim=isGrimGroup(x)});g.grim=t.checked;saveSoon();renderGrim()}}
    if(t.dataset.grimimg){const r=resolve(t.dataset.grimimg);const f=t.files&&t.files[0];if(!r||!f)return;
      (async()=>{try{const url=await new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.onerror=rej;fr.readAsDataURL(f)});const im=await loadImage(url);const s=Math.min(1,700/Math.max(im.naturalWidth,im.naturalHeight));const cv=document.createElement("canvas");cv.width=Math.round(im.naturalWidth*s);cv.height=Math.round(im.naturalHeight*s);cv.getContext("2d").drawImage(im,0,0,cv.width,cv.height);let d=cv.toDataURL("image/webp",.85);if(!d.startsWith("data:image/webp"))d=cv.toDataURL("image/jpeg",.85);const old=r.obj.img;r.obj.img=await putImg(d);if(old)dropImg(old);saveSoon();renderGrim()}catch(x){toast(L("No se pudo leer la imagen"))}})()}});
  m.addEventListener("touchstart",e=>{if(!e.target.closest(".book"))return;sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
  m.addEventListener("touchend",e=>{if(sx===null)return;const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;sx=null;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.3)grimTurn(dx<0?1:-1)},{passive:true});
  document.addEventListener("keydown",e=>{if(!document.querySelector("[data-grim]"))return;if(e.key==="ArrowRight")grimTurn(1);if(e.key==="ArrowLeft")grimTurn(-1);if(e.key==="Escape"){m.innerHTML=""}});
  try{matchMedia("(orientation: landscape)").addEventListener("change",()=>{
    const open=!!document.querySelector("[data-grim]");const coarse=matchMedia("(pointer: coarse)").matches;
    if(open){if(!landscape()&&ui.grimAuto){m.innerHTML="";ui.grimAuto=false}else renderGrim()}
    else if(coarse&&landscape()&&C&&ui.screen!=="chars"&&ui.screen!=="wizard"&&ui.tab==="poderes"&&!C.grimOff&&!m.innerHTML.trim())openGrim(true);
  })}catch(e){}
})();
