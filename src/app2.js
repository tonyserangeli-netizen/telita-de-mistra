/* ============ cálculos ============ */
const wide=()=>{try{return matchMedia("(min-width:900px)").matches}catch(e){return false}};
const statOf=id=>C.stats.find(s=>s.id===id);
const prof=()=>C.profOv!==""&&!isNaN(parseInt(C.profOv))?parseInt(C.profOv):2+Math.floor((Math.max(1,C.nivel)-1)/4);
const rowVal=r=>{const s=statOf(r.a);return(s?modN(s.v):0)+(r.p||0)*prof()+(+r.x||0)};
const percep=()=>{const r=C.skills.find(s=>norm(s.n)==="percepcion");const s=C.stats.find(x=>x.k==="SAB");return 10+(r?rowVal(r):s?modN(s.v):0)};
const curPose=()=>C.poses.find(p=>p.id===C.pose)||C.poses[0];
function flatParts(tree=C.cuerpo,depth=0,out=[]){tree.forEach(n=>{out.push({id:n.id,label:"  ".repeat(depth)+n.n,n:n.n});flatParts(n.k||[],depth+1,out)});return out}
const partName=id=>{const p=flatParts().find(x=>x.id===id);return p?p.n:""};
const durTag=x=>+x.dur?`<span class="tag">${+x.dur} ${+x.dur===1?L("turno"):L("turnos")}</span>`:"";
const opts=(list,sel,empty)=>(empty!==undefined?`<option value="">${esc(empty)}</option>`:"")+list.map(([v,t])=>`<option value="${esc(v)}" ${String(v)===String(sel)?"selected":""}>${esc(t)}</option>`).join("");
const R=(ref,f,t)=>`data-ref="${ref}" data-f="${f}"${t?` data-t="${t}"`:""}`;
function hlText(text,q){
  text=String(text||"");if(!q)return esc(text);
  let n="",map=[];for(let i=0;i<text.length;i++){const c=nchar(text[i]);for(const ch of c){n+=ch;map.push(i)}}
  const qq=norm(q);let out="",last=0,from=0,idx;
  while(qq&&(idx=n.indexOf(qq,from))>=0){const s=map[idx],e=map[idx+qq.length-1]+1;if(s<last){from=idx+1;continue}out+=esc(text.slice(last,s))+"<mark>"+esc(text.slice(s,e))+"</mark>";last=e;from=idx+qq.length}
  return out+esc(text.slice(last));
}
function refillHours(){C.magicos.forEach(m=>{if(m.rec==="horas"&&m.usos.max&&m.usos.act<m.usos.max&&m.t&&Date.now()-m.t>=(+m.recN||1)*3600e3){m.usos.act=m.usos.max;m.t=0}})}

/* ============ efectos visuales ============ */
const ESTILOS=[["brillo","Brillo","#4fb3ff"],["fuego","Fuego","#ff6a00"],["hielo","Hielo / escarcha","#9be7ff"],["electricidad","Electricidad","#7ff6ff"],["humo","Humo","#9a9aa8"],["metal","Metálico / armadura","#c9d1d9"],["sombra","Sombra","#6a2bb8"],["sagrado","Luz sagrada","#ffd36b"],["veneno","Veneno / ácido","#7dff4a"],["sangre","Sangre","#c0121e"],["lava","Lava","#ff3b00"],["cristal","Cristal / arcano","#d08bff"]];
function hx(c){c=String(c||"#ffffff").replace("#","");if(c.length===3)c=c.split("").map(x=>x+x).join("");return[0,2,4].map(k=>parseInt(c.substr(k,2),16)||0)}
function mix(a,b,t){const A=hx(a),B=hx(b);return"#"+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,"0")).join("")}
function styleFill(st,c,c2){
  const L1=mix(c,"#ffffff",.55),L2=mix(c,"#ffffff",.85),D1=mix(c,"#000000",.45),D2=mix(c,"#000000",.75),C2=c2||L1;
  switch(st){
    case "fuego":return{bg:`linear-gradient(0deg,${D1} 0%,${c} 25%,${L1} 50%,${c} 70%,${D1} 85%,${c} 100%)`,size:"100% 300%",anim:"fxUp 1.6s linear infinite, fxFlick .9s steps(3) infinite",g:c};
    case "lava":return{bg:`radial-gradient(circle at 30% 40%,${L1} 0 12%,transparent 22%),radial-gradient(circle at 70% 70%,${L2} 0 8%,transparent 18%),linear-gradient(0deg,${D2},${c} 40%,${D1} 70%,${c})`,size:"60% 60%, 50% 50%, 100% 200%",anim:"fxUp 5s linear infinite",g:c};
    case "hielo":return{bg:`linear-gradient(125deg,${L2} 0%,${c} 22%,#ffffff 30%,${L1} 38%,${c} 55%,#ffffff 62%,${L2} 70%,${c} 100%)`,size:"300% 300%",anim:"fxShine 4.5s linear infinite",g:c};
    case "electricidad":return{bg:`repeating-linear-gradient(115deg,transparent 0 6px,${L2} 6px 8px,transparent 8px 15px),linear-gradient(90deg,${c},#ffffff,${c})`,size:"200% 200%, 100% 100%",anim:"fxZap .7s steps(4) infinite",g:c};
    case "humo":return{bg:`radial-gradient(circle at 20% 30%,${L1} 0,transparent 35%),radial-gradient(circle at 70% 60%,${c} 0,transparent 40%),radial-gradient(circle at 40% 80%,${D1} 0,transparent 45%),${mix(c,"#000000",.2)}`,size:"200% 200%",anim:"fxDrift 9s ease-in-out infinite alternate",g:D1,blur:3,halo:.35};
    case "metal":return{bg:`linear-gradient(115deg,${D1} 0%,${c} 25%,#ffffff 33%,${L1} 38%,${D1} 52%,${c} 70%,${L2} 78%,${D2} 100%)`,size:"250% 100%",anim:"fxShine 3.5s ease-in-out infinite",g:L1,halo:.3,solid:true};
    case "sombra":return{bg:`radial-gradient(circle at 50% 50%,${D2},${D1} 40%,${c} 70%,#000 100%)`,size:"160% 160%",anim:"fxDrift 6s ease-in-out infinite alternate",g:c,blur:1};
    case "sagrado":return{bg:`repeating-conic-gradient(from 0deg at 50% 30%,${L2} 0 6deg,${c} 6deg 14deg),linear-gradient(${L2},${c})`,size:"100% 100%",anim:"fxFlick 2.4s ease-in-out infinite",g:c};
    case "veneno":return{bg:`radial-gradient(circle at 25% 30%,${L1} 0 6%,transparent 9%),radial-gradient(circle at 65% 65%,${L2} 0 5%,transparent 8%),linear-gradient(0deg,${D1},${c},${D1})`,size:"35% 35%, 45% 45%, 100% 200%",anim:"fxUp 3s linear infinite",g:c};
    case "sangre":return{bg:`linear-gradient(180deg,${c} 0%,${D1} 45%,${D2} 100%)`,size:"100% 200%",anim:"fxDown 6s linear infinite",g:D1,halo:.4};
    case "cristal":return{bg:`conic-gradient(from 30deg,${c},${L2},${C2},${D1},${c},${L1},${c})`,size:"100% 100%",anim:"fxHue 6s linear infinite",g:c};
    default:return{bg:c2?`linear-gradient(160deg,${c},${c2})`:c,size:"",anim:"",g:c2||c};
  }
}
function zoneSubs(e){return e.sub&&e.sub.length?e.sub:[{id:"_",estilo:e.estilo||"brillo",c:e.c,c2:e.c2||"",masks:e.masks||{}}]}
const zoneHasPose=(e,pid)=>zoneSubs(e).some(s=>s.masks&&s.masks[pid]);
function medLevel(e){
  const M=C.medidores.find(x=>x.id===e.med.id);if(!M)return null;let t,side;
  if(M.tipo==="bipolar"){if(!M.v)return null;const span=Math.max(Math.abs(M.min),Math.abs(M.max))||1;t=Math.abs(M.v)/span;side=M.v<0?e.med.neg:e.med.pos}
  else{t=(M.v-M.min)/((M.max-M.min)||1);if(t<=0)return null;side=e.med.pos}
  return{t:clamp(t,0,1),side};
}
function effLayer(e,p){
  const subs=zoneSubs(e).filter(s=>s.masks&&s.masks[p.id]&&getImg(s.masks[p.id]));if(!subs.length)return"";
  let ml=null;if(e.med&&e.med.id){ml=medLevel(e);if(!ml)return""}else if(!e.on)return"";
  return subs.map(sb=>{const m=getImg(sb.masks[p.id]);let f,op,r1,r2,pulse;
    if(ml){const a=ml.side[0],b=ml.side[1],t=ml.t;f=sb.estilo&&sb.estilo!=="brillo"?styleFill(sb.estilo,a,b):{bg:b?`linear-gradient(160deg,${a},${b})`:a,g:b||a};op=0.2+0.72*t;r1=1.5+5*t;r2=3+14*t;pulse=t>=1/3}
    else{f=styleFill(sb.estilo||"brillo",sb.c,sb.c2);const h=+e.halo*(f.halo!==undefined?f.halo/.5:1);op=+e.brillo||.9;r1=1+4*h;r2=3+14*h;pulse=e.pulso!==false}
    return`<div class="glow ${pulse?"pulse":""} ${ml?"med":""}" style="filter:drop-shadow(0 0 ${(+r1).toFixed(1)}px ${f.g}) drop-shadow(0 0 ${(+r2).toFixed(1)}px ${f.g})"><div class="mfill" style="--o:${(+op).toFixed(2)};background:${f.bg};${f.size?`background-size:${f.size};`:""}${f.anim?`animation:${f.anim};`:""}${f.blur?`filter:blur(${f.blur}px);`:""}opacity:${(+op).toFixed(2)};-webkit-mask-image:url(${m});mask-image:url(${m})"></div></div>`}).join("");
}

/* ============ pantalla de personajes ============ */
function renderChars(){
  if(isMaster())return renderMaster();
  return`<div class="wrap">
  <header><div class="brand">${LOGO}<span>Telita de Mistra</span><span class="hint" style="letter-spacing:0">v${APPV}</span></div>${C?`<button class="btn" data-a="screen" data-v="char">${L("Volver")}</button>`:""}</header>
  ${modeSwitch()}
  <div class="card" style="border-color:var(--gold)"><div class="t">${L("Crear mi personaje")}</div>
    <p class="hint">${L("Te guía paso a paso: datos, imágenes, características, poderes y armas. Todo se puede cambiar después.")}</p>
    <div class="row"><input id="nc-name" placeholder="${L("Nombre")}" style="flex:1" value="${esc(ui.newName)}"><button class="btn on" data-a="newChar">${L("Empezar")}</button></div></div>
  <div class="row"><button class="btn" data-a="demo" style="flex:1">✨ ${L("Probar con un personaje de ejemplo")}</button><button class="btn" data-a="tutStart">📘 ${L("Tutoriales")}</button></div>
  <h2 style="font-family:var(--display);margin:0">${L("Personajes")}</h2>
  <div class="chars">
    ${playerChars().map(ch=>`<div class="ccard">
      <div class="thumb" style="${ch.th?`background-image:url(${getImg(ch.th)})`:""}">${ch.th?"":"?"}</div>
      <div class="sec" style="gap:6px"><div><div style="font-family:var(--display);font-size:1.2rem">${esc(ch.n)}</div>${C&&ch.id===C.id?`<span class="tag blue">${L("Abierto")}</span>`:""}</div>
        <div class="row"><button class="btn small on" data-a="openChar" data-id="${ch.id}">${L("Abrir")}</button><button class="btn small" data-a="dupChar" data-id="${ch.id}">${L("Duplicar")}</button><button class="btn small" data-a="expChar" data-id="${ch.id}">${L("Exportar")}</button>
        <button class="btn small danger" data-a="delChar" data-id="${ch.id}">${ui.confirm===ch.id?L("¿Seguro? Tocá otra vez"):L("Borrar")}</button></div></div></div>`).join("")}
  </div>
  <div class="card"><div class="t">${L("Copia de seguridad")}</div>
    <p class="hint">${L("Guardá una copia por si se borra el celular, o para pasar un personaje a otro teléfono.")}</p>
    <div class="row"><button class="btn" data-a="expAll">${L("Exportar todo")}</button><label class="btn">${L("Importar archivo")}<input type="file" data-import hidden></label></div></div>
  </div>`;
}

/* ============ cabecera, menú ============ */
function headerHTML(){
  return`<header>
    <div class="nm"><button class="btn iconbtn" data-a="menu" aria-label="${L("Menú")}">☰</button>
      <div class="t">${ui.edit?`<input ${R("C","nombre")} value="${esc(C.nombre)}" aria-label="${L("Nombre")}"><input ${R("C","clase")} value="${esc(C.clase)}" placeholder="${L("Clase, raza…")}" style="margin-top:4px;font-family:var(--body);font-size:.9rem">`
        :`<h1>${esc(C.nombre)}</h1>${C.clase?`<div class="sub">${esc(C.clase)}</div>`:""}${calChip()}`}</div></div>
    <div class="hbtns">${C.enemigo?`<button class="btn" data-a="screen" data-v="chars" title="${L("Volver a la mesa del máster")}">👑</button><button class="btn" data-a="mesaOn">📺</button>`:`<button class="btn" data-a="mesaOn" title="${L("Mostrar a la mesa")}" aria-label="${L("Mostrar a la mesa")}">📺</button>`}<button class="btn" data-a="undo" ${undo.length?"":"disabled"}>${L("Deshacer")}</button><button class="btn ${ui.edit?"on":""}" data-a="edit">${ui.edit?L("Listo"):L("Editar")}</button></div>
  </header>`;
}
function drawerHTML(){
  if(!ui.menu)return"";
  return`<div class="drawer" data-a="menuClose"><div class="dp2" data-stop>
    <div class="brand">${LOGO}<span>Telita de Mistra</span></div>
    <button class="btn" data-a="screen" data-v="chars">${L("Personajes")}</button>
    <button class="btn" data-a="wizard">${L("Asistente de creación")}</button>
    <button class="btn" data-a="cmp">${L("Compendio de conjuros e ítems")}</button>
    ${C?`<button class="btn" data-a="snd">🎙 ${L("Sonidos")}</button>`:""}
    ${C?`<button class="btn" data-a="lookOpen">🎨 ${L("Apariencia")}</button>`:""}
    <button class="btn" data-a="mapsOpen">🗺 ${L("Mapas")}</button>
    <button class="btn" data-a="calOpen">📅 ${L("Calendario de la partida")}</button>
    <button class="btn" data-a="tutStart">📘 ${L("Tutoriales")}</button>
    <h3 class="hint" style="margin-top:8px">${L("Descanso")}</h3>
    <button class="btn" data-a="rest" data-v="corto">${L("Descanso corto")}</button>
    <button class="btn" data-a="rest" data-v="largo">${L("Descanso largo")}</button>
    <h3 class="hint" style="margin-top:8px">${L("Ambientación")}${C?` · ${esc(C.nombre)}`:""}</h3>
    ${temaPicker()}
    <h3 class="hint" style="margin-top:8px">${L("Idioma")}</h3>
    <select data-lang>${opts([["es","Español"],["en","English"],["pt","Português"]],LANG)}</select>
    <h3 class="hint" style="margin-top:8px">${L("Copia de seguridad")}</h3>
    <button class="btn" data-a="expChar" data-id="${C.id}">${L("Exportar este personaje")}</button>
    <button class="btn" data-a="expAll">${L("Exportar todo")}</button>
    <label class="btn">${L("Importar archivo")}<input type="file" data-import hidden></label>
    <p class="hint" style="margin-top:auto">${L("Los datos se guardan en este dispositivo.")}<br>${L("Versión")} ${APPV}</p>
  </div></div>`;
}

/* ============ figura y columna izquierda ============ */
function stageHTML(){
  const p=curPose(),src=p&&getImg(p.img);
  const hpPct=C.hp.max?clamp(C.hp.act/C.hp.max,0,1):1;
  const fx=new Set(C.estados.filter(e=>e.on).map(e=>e.fx));if(C.hp.act<=0)fx.add("gris");fx.delete("none");
  const wound=hpPct>=.75?0:hpPct>=.5?.35:hpPct>=.25?.65:1;
  const swap=p&&p.id!==ui.lastPose;ui.lastPose=p&&p.id;const bgI=getImg((p&&p.bg)||C.fondo);
  return`<div class="stage ${[...fx].join(" ")}">
    ${bgI?`<div class="bgimg" style="background-image:url(${bgI})"></div><div class="bgdim" style="opacity:${+C.fondoDim||0}"></div>`:""}
    <div class="figure ${swap?"swap":""}">
      ${src?`${layersHTML(p,"detras")}<img src="${src}" alt="${esc(C.nombre)}">${C.efectos.map(e=>effLayer(e,p)).join("")}${layersHTML(p,"delante")}`
        :`<div class="placeholder"><svg viewBox="0 0 100 150"><circle cx="50" cy="22" r="14" fill="currentColor"/><path d="M28 45 Q50 36 72 45 L78 95 L66 96 L64 148 L54 148 L50 104 L46 148 L36 148 L34 96 L22 95 Z" fill="currentColor"/></svg><div>${L("Sin imagen todavía.")}<br>${L("Subila en Cuerpo → Poses.")}</div></div>`}
    </div>
    <div class="wound" style="opacity:${wound}"></div>
    ${fx.has("sello")?`<svg class="seal" viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="#c9b8ff" stroke-width="1.6"><circle cx="50" cy="50" r="44"/><circle cx="50" cy="50" r="34" stroke-dasharray="3 4"/><path d="M50 8 L86 72 L14 72 Z"/><path d="M50 92 L14 28 L86 28 Z"/></g></svg>`:""}
    <div class="badges">
      ${C.combate?`<span class="badge">${L("Turno")} ${C.turno}</span>`:""}
      ${C.contadores.filter(k=>k.v).map(k=>`<span class="badge gold">${esc(k.n)}: ${k.v}</span>`).join("")}
      ${(C.capas||[]).filter(c=>c.on&&c.left>0).map(c=>`<span class="badge gold">◧ ${esc(c.n)} · ${c.left}</span>`).join("")}
      ${(C.invoc||[]).filter(v=>v.estado==="invocada").map(v=>`<span class="badge blue">✦ ${esc(v.n)}${v.left>0?" · "+v.left:""}</span>`).join("")}
      ${C.estados.filter(e=>e.on).map(e=>`<span class="badge red">${esc(e.n)}</span>`).join("")}
      ${C.hp.act<=0?`<span class="badge red">0 ${L("PV")}</span>`:""}
    </div>
  </div>`;
}
function turnBar(){
  const act=C.efectos.filter(e=>e.on);
  return`<div class="turn"><div><div class="hint">${L("Turno")}</div><div class="bignum">${C.turno}</div></div>
    <div class="row" style="margin-left:auto"><button class="btn small" data-a="turnBack" ${C.turno>1?"":"disabled"} aria-label="${L("Turno anterior")}">−</button><button class="btn fight" data-a="turnNext">${L("Siguiente turno")}</button></div></div>
  ${act.length||C.tempFx.length?`<h3>${L("Efectos activos")}</h3><div class="sec" style="gap:6px">
    ${C.tempFx.map(e=>`<div class="mini"><span><i class="fxdot" style="--c:var(--gold)"></i>${esc(e.n)}</span><span class="cost">${L("quedan {0}",e.left)}</span><button class="btn small" data-a="fxEnd" data-id="${e.id}">${L("Terminar")}</button></div>`).join("")}
    ${act.map(e=>`<div class="mini"><span><i class="fxdot" style="--c:${e.c}"></i>${esc(e.n)}</span><span class="cost">${e.left>0?L("quedan {0}",e.left):L("sin límite")}</span><button class="btn small" data-a="effToggle" data-id="${e.id}">${L("Apagar")}</button></div>`).join("")}
  </div>`:""}`;
}
function hpHTML(){
  const pct=C.hp.max?clamp(C.hp.act/C.hp.max,0,1):1,tmp=+C.hp.temp||0,tpct=C.hp.max?clamp(tmp/C.hp.max,0,1):0;
  return`<div class="hpbar"><div class="hpnum">${C.hp.act}${tmp?`<span class="tmpn">+${tmp}</span>`:""}<small> / ${C.hp.max} ${L("PV")}</small></div>${hpVisual(pct,tpct,tmp)}
    ${ui.edit?`<div class="hpctl"><label class="lbl inline">${L("Máx.")} <input type="number" ${R("C.hp","max","n")} value="${C.hp.max}" style="width:5em"></label><label class="lbl inline">${L("Actual")} <input type="number" ${R("C.hp","act","n")} value="${C.hp.act}" style="width:5em"></label><label class="lbl inline">${L("Sobrevida")} <input type="number" min="0" ${R("C.hp","temp","n")} value="${tmp}" style="width:5em"></label></div>`
    :`<div class="hpctl"><input id="hp-in" type="number" inputmode="numeric" min="0" placeholder="0" aria-label="${L("Cantidad")}"><button class="btn dmg" data-a="dmg">${L("Daño")}</button><button class="btn heal" data-a="heal">${L("Curar")}</button><button class="btn tmpb" data-a="temp" title="${L("Sumar sobrevida")}">+${L("Sobrevida")}</button></div>
      ${tmp?`<p class="hint" style="grid-column:1/-1">${L("La sobrevida se gasta primero al recibir daño.")} <button class="btn small ghost" data-a="tempClear">${L("Quitar sobrevida")}</button></p>`:""}`}</div>`;
}
function statsHTML(){
  return`<div class="stats">${C.stats.map(s=>`<div class="stat"><span class="lab">${esc(s.k)}</span><span class="mod">${sg(modN(s.v))}</span></div>`).join("")}<div class="stat"><span class="lab">${L("CA")}</span><span class="mod">${esc(C.ca)}</span></div></div>`;
}
function figcolHTML(T){
  const cps=C.poses.filter(p=>!C.combate||p.combate||C.poses.every(x=>!x.combate));
  return`<aside class="figcol ${T==="personaje"?"active":""}" aria-label="${L("Personaje")}">
    ${stageHTML()}
    ${C.combate?turnBar():""}
    ${hpHTML()}
    ${statsHTML()}
    <button class="btn ${C.combate?"":"fight"}" data-a="combat">${C.combate?L("Terminar combate"):L("Entrar en combate")}</button>
    ${C.poses.length>1?`<div class="chips">${(C.combate?cps:C.poses).map(p=>`<button class="chip pose ${p.id===C.pose?"on":""}" data-a="pose" data-id="${p.id}">${esc(p.n)}</button>`).join("")}</div>`:""}
    ${C.estados.length?`<div class="chips">${C.estados.map(e=>`<button class="chip ${e.on?"on":""}" data-a="estado" data-id="${e.id}">${esc(e.n)}</button>`).join("")}</div>`:""}
    ${quickToggles()}
    ${C.combate?`<div class="cp-m">${combatPanel()}</div>`:""}
    ${C.log.length?`<h3>${L("Últimas acciones")}</h3><div class="log">${C.log.map(l=>`<span>${esc(l)}</span>`).join("")}</div>`:""}
  <div class="figcuad">${C.combate?"":favBar()}${cuadrosHTML("personaje")}${!C.combate&&cuadrosEn("combate").length?`<details class="grp" ${ui.edit?"open":""}><summary>${L("Cuadros de combate")} <span class="hint">${L("se ven al entrar en combate")}</span></summary>${cuadrosEn("combate").map(cuadroHTML).join("")}</details>`:""}</div>
  </aside>`;
}

/* ============ bloques reutilizables ============ */
function barrasHTML(){
  return`<h3>${L("Barras")}</h3>
  ${C.barras.map(b=>{const ref=`C.barras.${b.id}`,pct=clamp(b.v/(b.max||100),0,1);return ui.edit?`<div class="card">
      <div class="row"><input ${R(ref,"n")} value="${esc(b.n)}" style="flex:1"><input type="color" ${R(ref,"c")} value="${esc(b.c)}" aria-label="${L("Color")}"></div>
      <div class="grid2"><label class="lbl">${L("Máximo")}<input type="number" ${R(ref,"max","n")} value="${b.max}"></label><label class="lbl">${L("Paso de los botones")}<input type="number" ${R(ref,"paso","n")} value="${b.paso}"></label><label class="lbl">${L("Unidad")}<input ${R(ref,"u")} value="${esc(b.u)}"></label></div>
      <button class="btn small danger" data-a="del" data-ref="${ref}">${L("Borrar")}</button></div>`
    :`<div class="card" id="bar-${b.id}"><div class="top"><span class="t">${favStar(ref)}${esc(b.n)}</span><span class="t" style="color:${esc(b.c)}">${b.v}${esc(b.u)}</span></div>
      <div class="meter" style="height:14px"><i style="width:${pct*100}%;background:${esc(b.c)};box-shadow:0 0 10px ${esc(b.c)}"></i></div>
      <div class="row"><button class="btn small" data-a="barStep" data-id="${b.id}" data-v="-1">−${b.paso}</button><button class="btn small" data-a="barStep" data-id="${b.id}" data-v="1">+${b.paso}</button>
        <input type="number" inputmode="numeric" data-barin placeholder="${L("Otro")}" style="width:5.5em" aria-label="${L("Cantidad")}"><button class="btn small" data-a="barAdd" data-id="${b.id}">${L("Sumar")}</button><button class="btn small ghost" data-a="barReset" data-id="${b.id}" style="margin-left:auto">${L("Reiniciar")}</button></div></div>`}).join("")}
  <button class="btn small" data-a="add" data-ref="C.barras" data-kind="barra">+ ${L("Nueva barra")}</button>`;
}
function contadoresHTML(){
  return ord(C.contadores).map(k=>{const ref=`C.contadores.${k.id}`;return ui.edit?`<div class="card">
    <input ${R(ref,"n")} value="${esc(k.n)}"><textarea ${R(ref,"d")} placeholder="${L("Qué hace")}">${esc(k.d)}</textarea>
    <label class="lbl">${L("Texto del botón de acción")}<input ${R(ref,"accion")} value="${esc(k.accion)}"></label>
    <label class="lbl inline">${L("Color")} <input type="color" ${R(ref,"c")} value="${k.c||"#d9a845"}"></label>${lookPicker("cnt",ref)}
    <button class="btn small danger" data-a="del" data-ref="${ref}">${L("Borrar")}</button></div>`
  :`<div class="marks"><div class="row sb"><div><div class="hint">${favStar(ref)}${esc(k.n)}</div><div class="bignum">${k.v}</div></div>${cntIcons(k)}</div>
    ${k.d?`<div class="hint">${esc(k.d)}</div>`:""}
    <div class="row"><button class="btn small" data-a="cnt" data-id="${k.id}" data-v="-1" ${k.v?"":"disabled"}>−</button><button class="btn small" data-a="cnt" data-id="${k.id}" data-v="1">+</button>
    <button class="btn fight" data-a="cntAll" data-id="${k.id}" ${k.v?"":"disabled"} style="margin-left:auto">${esc(k.accion||L("Usar todo"))} ${k.v||""}</button></div></div>`}).join("");
}
function armasCompact(){
  return ord(C.armas,"C.armas").map(a=>{const k=C.contadores.find(x=>x.id===a.contador);return`<div class="card ${hasVis(a)?"hasvis":""}" id="hit-${a.id}">${visThumb(a,"C.armas."+a.id)}<div class="top"><span class="t">${favStar("C.armas."+a.id)}${esc(a.n)}</span><span class="cost">${esc(a.b)} · ${esc(a.d)}</span></div>
    <div class="row sb"><span class="hint">${k?L("Suma a: {0}",esc(k.n)):""}</span>${ammoTag(a)}<button class="use" data-a="hit" data-id="${a.id}">${hitLabel(a)}</button></div></div>`}).join("");
}
function recursosHTML(compact){
  return ord(C.recursos).map(r=>{const ref=`C.recursos.${r.id}`;return ui.edit&&!compact?`<div class="card"><input ${R(ref,"n")} value="${esc(r.n)}">
    <div class="grid2"><label class="lbl">${L("Máximo")}<input type="number" ${R(ref,"max","n")} value="${r.max}"></label><label class="lbl">${L("Se recarga")}<select ${R(ref,"rec")}>${opts(RECS.filter(x=>x[0]!=="turnos"&&x[0]!=="horas").map(([v,t])=>[v,L(t)]),r.rec)}</select></label></div>
    <button class="btn small danger" data-a="del" data-ref="${ref}">${L("Borrar")}</button></div>`
  :`<div class="res"><div><div class="rn">${favStar(ref)}${esc(r.n)}</div>${r.max<=30?resIcons(r):""}</div>
    <div class="row"><span class="cost" style="font-size:1rem">${r.act}/${r.max}</span><button class="btn small" data-a="res" data-id="${r.id}" data-v="-1" aria-label="${L("Restar")}">−</button><button class="btn small" data-a="res" data-id="${r.id}" data-v="1" aria-label="${L("Sumar")}">+</button></div></div>`}).join("");
}
function itemCard(it,ref){
  const r=C.recursos.find(x=>x.id===it.recurso),e=C.efectos.find(x=>x.id===it.efecto);
  if(ui.edit)return`<div class="card">
    <input ${R(ref,"n")} value="${esc(it.n)}" placeholder="${L("Nombre")}">
    <textarea ${R(ref,"d")} placeholder="${L("Qué hace")}">${esc(it.d)}</textarea>
    <label class="lbl">${L("Nivel (para ordenar por poder)")}<select ${R(ref,"nv")}>${opts([["",L("Sin nivel")],["0",L("Truco")],...[1,2,3,4,5,6,7,8,9].map(n=>[String(n),L("Nivel {0}",n)])],it.nv==null?(itemLevel(it)==null?"":String(itemLevel(it))):String(it.nv))}</select></label>
    ${sndSel(ref)}
    <div class="grid2">
      <label class="lbl">${L("Usos propios (0 = sin contador)")}<input type="number" min="0" ${R(ref+".usos","max","n")} value="${it.usos.max}"></label>
      <label class="lbl">${L("Se recargan")}<select ${R(ref,"rec")}>${opts(RECS.filter(x=>x[0]!=="turnos"&&x[0]!=="horas").map(([v,t])=>[v,L(t)]),it.rec)}</select></label>
      <label class="lbl">${L("Gasta de")}<select ${R(ref,"recurso")}>${opts(C.recursos.map(x=>[x.id,x.n]),it.recurso,L("Nada"))}</select></label>
      <label class="lbl">${L("Cuánto gasta")}<input type="number" min="0" ${R(ref,"costo","n")} value="${it.costo}"></label>
      <label class="lbl">${L("Dura (turnos, 0 = nada)")}<input type="number" min="0" ${R(ref,"dur","n")} value="${it.dur}"></label>
      <label class="lbl">${L("Enciende la zona o capa")}<select ${R(ref,"efecto")}>${opts(linkOpts(),it.efecto,L("Ninguna"))}</select></label>
    </div>
    <button class="btn small danger" data-a="del" data-ref="${ref}">${L("Borrar")}</button></div>`;
  const g=grpOfRef(ref),np=unprep(g,it),pm=g&&ui.prepMode===g.id;
  return`<div class="card ${np?"unprep":""}" id="it-${it.id}"><div class="top"><span class="t">${pm?`<button class="pchk ${it.prep?"on":""}" data-a="prepTog" data-pref="${ref}" aria-pressed="${!!it.prep}" aria-label="${L("Preparado")}">${it.prep?"✓":""}</button>`:favStar(ref)}${esc(it.n)} ${durTag(it)}</span>${it.usos.max?`<span class="cost">${it.usos.act} / ${it.usos.max}</span>`:""}</div>
    ${it.d?`<div class="d">${esc(it.d)}</div>`:""}
    <div class="row sb"><span class="row">${r?`<span class="tag blue">−${it.costo} ${esc(r.n)}</span>`:""}${e?`<span class="tag" style="color:${e.c};border-color:${e.c}">✦ ${esc(e.n)}</span>`:""}</span>
    <span class="row">${it.usos.max?`<button class="btn small" data-a="itemPlus" data-ref="${ref}" aria-label="${L("Recuperar un uso")}">+</button>`:""}${np?`<span class="tag">${L("No preparado")}</span>`:`<button class="use" data-a="useItem" data-ref="${ref}">${L("Usar")}</button>`}</span></div></div>`;
}
function combatPanel(){
  return`<h2>${L("Combate")}</h2>
  ${favBar()}
  ${cuadrosHTML("combate")}
  ${barrasHTML()}
  ${(C.invoc||[]).length?`<h3>${L("Invocaciones")}</h3>${invocHTML(true)}`:""}
  ${C.contadores.length?`<h3>${L("Contadores")}</h3>${contadoresHTML()}`:""}
  ${C.armas.length?`<h3>${L("Armas")}</h3>${armasCompact()}`:""}
  ${(C.consum||[]).length?`<h3>${L("Munición y consumibles")}</h3>${consumHTML(true)}`:""}
  ${C.recursos.length?`<h3>${L("Recursos")}</h3>${recursosHTML(true)}`:""}
  ${C.grupos.map(g=>g.items.filter(x=>!unprep(g,x)).length?`<details class="grp" data-det="g${g.id}" ${ui.det&&ui.det["g"+g.id]?"open":""}><summary>${esc(g.n)} <span class="hint">${g.items.filter(x=>!unprep(g,x)).length}</span></summary>${grpOrdered(g).filter(x=>!unprep(g,x)).map(it=>itemCard(it,`C.grupos.${g.id}.items.${it.id}`)).join("")}</details>`:"").join("")}
  ${C.magicos.length?`<details class="grp" data-det="mag" ${ui.det&&ui.det.mag?"open":""}><summary>${L("Ítems mágicos")} <span class="hint">${C.magicos.length}</span></summary>${ord(C.magicos,"C.magicos").map(m=>magicoCard(m)).join("")}</details>`:""}
  ${C.hp.act<=0?deathHTML():""}`;
}
