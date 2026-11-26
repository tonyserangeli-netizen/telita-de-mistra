/* ============ clima: mapas, calendario y penalizadores en la ficha ============ */
const CLI_FX=[["","Sin efecto visual"],["lluvia","Lluvia"],["nieve","Nieve"],["ventisca","Ventisca"],["niebla","Niebla"],["rayos","Tormenta eléctrica"],["hielo","Escarcha"],["calor","Calor"],["arena","Arena"],["viento","Viento"],["brasas","Brasas y ceniza"],["oscuridad","Oscuridad"],["sangre","Lluvia de sangre"]];
const CLI_PRE=[
  {id:"cli_despejado",n:"Despejado",ic:"☀️",fx:"",d:"Buen tiempo, sin penalizadores.",pen:[],est:[]},
  {id:"cli_lluvia",n:"Lluvia",ic:"🌧",fx:"lluvia",d:"Se ve y se oye peor. Los fuegos al aire libre se apagan.",pen:[{n:"Lluvia: percepción",v:"-2",a:"tirada",en:"habilidad"}],est:[]},
  {id:"cli_tormenta",n:"Tormenta",ic:"⛈",fx:"rayos",d:"Truenos, viento fuerte y lluvia intensa.",pen:[{n:"Tormenta: ataques",v:"-2",a:"tirada",en:"ataque"},{n:"Tormenta: percepción",v:"-2",a:"tirada",en:"habilidad"}],est:[]},
  {id:"cli_nieve",n:"Nevada",ic:"🌨",fx:"nieve",d:"La nieve vuelve el terreno difícil.",pen:[{n:"Nieve: iniciativa",v:"-1",a:"tirada",en:"iniciativa"}],est:[]},
  {id:"cli_ventisca",n:"Ventisca",ic:"🌬",fx:"ventisca",d:"Viento helado y nieve: casi no se ve nada.",pen:[{n:"Ventisca: habilidades",v:"-2",a:"tirada",en:"habilidad"},{n:"Ventisca: ataques",v:"-2",a:"tirada",en:"ataque"}],est:[{n:"Entumecido",fx:"sway"}]},
  {id:"cli_niebla",n:"Niebla espesa",ic:"🌫",fx:"niebla",d:"Todo lo que está a más de unos metros queda oculto.",pen:[{n:"Niebla: percepción",v:"-3",a:"tirada",en:"habilidad"}],est:[]},
  {id:"cli_calor",n:"Calor extremo",ic:"🥵",fx:"calor",d:"El calor agota: hay que tomar agua seguido.",pen:[{n:"Calor: salvaciones",v:"-1",a:"tirada",en:"salvacion"}],est:[{n:"Agobiado por el calor",fx:"none"}]},
  {id:"cli_arena",n:"Tormenta de arena",ic:"🏜",fx:"arena",d:"La arena ciega y lastima.",pen:[{n:"Arena: ataques",v:"-2",a:"tirada",en:"ataque"},{n:"Arena: percepción",v:"-3",a:"tirada",en:"habilidad"}],est:[]},
  {id:"cli_hielo",n:"Yugo del hielo eterno",ic:"🧊",fx:"hielo",d:"Un frío antinatural que cala los huesos y no se va nunca.",pen:[{n:"Hielo eterno: todas las tiradas",v:"-1",a:"tirada",en:"todas"},{n:"Hielo eterno: salvaciones",v:"-2",a:"tirada",en:"salvacion"}],est:[{n:"Congelado",fx:"oscuro"}]},
  {id:"cli_oscuridad",n:"Oscuridad antinatural",ic:"🌑",fx:"oscuridad",d:"Ni la luna ni las estrellas atraviesan esta oscuridad.",pen:[{n:"Oscuridad: percepción",v:"-3",a:"tirada",en:"habilidad"}],est:[{n:"Inquieto",fx:"none"}]},
  {id:"cli_sangre",n:"Lluvia de sangre",ic:"🩸",fx:"sangre",d:"Un mal presagio: algo terrible se acerca.",pen:[{n:"Lluvia de sangre: salvaciones",v:"-1",a:"tirada",en:"salvacion"}],est:[{n:"Perturbado",fx:"sway"}]},
];
const CLI_U=[["d","días"],["m","meses"],["y","años"],["inf","para siempre"]];
function clis(){if(!Array.isArray(APP.climas))APP.climas=clone(CLI_PRE);return APP.climas}
const cliGet=id=>id&&clis().find(c=>c.id===id);
let cliSaveT=0;function cliSave(){clearTimeout(cliSaveT);cliSaveT=setTimeout(()=>DB.set("index",APP),300)}
const cliName=c=>c?`${c.ic||"☁"} ${c.n||L("Clima")}`:L("Sin clima");
/* calendario */
function calYLen(K){return K.meses.reduce((a,m)=>a+(+m.d||0),0)||1}
function calFromN(K,N){const yl=calYLen(K);let y=Math.floor(N/yl)+1,r=N-(y-1)*yl,mi=0;while(mi<K.meses.length-1&&r>=(+K.meses[mi].d||30)){r-=+K.meses[mi].d||30;mi++}return{a:y,m:mi,d:r+1}}
function calNStr(K,N){const x=calFromN(K,N);return`${x.d} ${(K.meses[x.m]||{}).n||""} ${x.a}${K.era?" "+K.era:""}`}
function calCliId(K){K=K||APP.cal;if(!K||!K.cliR||!K.cliR.length)return"";const n=calTotal(K);let id="";for(const r of K.cliR)if(n>=r.a&&(r.b==null||n<=r.b))id=r.c;return id}
function calSpan(K,n,u){if(u==="inf")return null;n=Math.max(1,Math.round(+n||1));if(u==="d")return n;if(u==="y")return n*calYLen(K);let t=0,mi=K.mes,first=true;for(let i=0;i<n;i++){let ml=+(K.meses[mi]||{}).d||30;t+=first?ml-(+K.dia-1):ml;first=false;mi=(mi+1)%K.meses.length}return t}
function calAddCli(K,id,n,u){K.cliR=K.cliR||[];const a=calTotal(K),s=calSpan(K,n,u);K.cliR.push({id:uid(),c:id,a,b:s==null?null:a+s-1})}
/* mapas */
function mapCliId(m){if(!m||!m.cli)return"";return m.cli.src==="cal"?calCliId():(m.cli.id||"")}
/* personaje */
function cliActiveId(){if(!C||!C.cliSrc)return"";if(C.cliSrc.t==="cal")return calCliId();if(C.cliSrc.t==="map"){if(!MAPS)return C.cliOn||"";return mapCliId(MAPS.find(m=>m.id===C.cliSrc.id))}return""}
function cliSrcName(){if(!C||!C.cliSrc)return"";if(C.cliSrc.t==="cal")return L("el calendario");const m=MAPS&&MAPS.find(x=>x.id===C.cliSrc.id);return m?L("el mapa «{0}»",m.n):L("un mapa borrado")}
function cliSync(){if(!C)return;const id=cliActiveId(),c=cliGet(id),t=c?(c.t||0):0;if((C.cliOn||"")===id&&(C.cliT||0)===t)return;
  const had=C.cliOn;C.mods=(C.mods||[]).filter(m=>!m.cli);C.estados=(C.estados||[]).filter(e=>!e.cli);C.cliOn=id||"";C.cliT=t;
  if(c){for(const p of c.pen||[])C.mods.push({id:uid(),n:p.n||L("Clima"),v:p.v||"0",a:p.a||"tirada",en:p.en||"todas",on:true,cli:1});for(const s of c.est||[])C.estados.push({id:uid(),n:s.n||L("Estado"),fx:s.fx||"none",on:true,cli:1})}
  saveSoon();if(c&&c.id!==had)toast(L("{0}: se aplicaron sus efectos a {1}",cliName(c),C.nombre));else if(!c&&had)toast(L("Se quitaron los efectos del clima"))}
function cliSetSrc(src){if(!C)return;C.cliSrc=src;C.cliOn=null;C.cliT=-1;cliSync();if(!src){C.mods=(C.mods||[]).filter(m=>!m.cli);C.estados=(C.estados||[]).filter(e=>!e.cli);C.cliOn="";saveSoon()}}
{const r0=render;render=function(){try{cliSync()}catch(e){}return r0.apply(this,arguments)}}
{const c0=calChip;calChip=function(){let h=c0();try{const K=APP.cal;if(h&&K){const c=cliGet(calCliId(K));if(c)h=h.replace("</button>",` · ${esc(c.ic||"☁")}</button>`)}if(C&&C.cliSrc){const c=cliGet(C.cliOn);h+=`<button class="calchip clichip" data-ck="charOpen">${c?esc(cliName(c)):"☁ "+L("Sin clima")}</button>`}}catch(e){}return h}}
/* ---------- piezas de interfaz ---------- */
function cliOpts(sel,extra){return(extra||"")+clis().map(c=>`<option value="${esc(c.id)}" ${c.id===sel?"selected":""}>${esc(cliName(c))}</option>`).join("")}
function cliEffects(c){if(!c)return"";const P=(c.pen||[]),E=(c.est||[]);
  return`${c.d?`<p class="d" style="margin:4px 0">${esc(c.d)}</p>`:""}${P.length||E.length?`<div class="chips">${P.map(p=>`<span class="badge">${esc(p.n)} <b>${esc(p.v)}</b></span>`).join("")}${E.map(s=>`<span class="badge red">${esc(s.n)}</span>`).join("")}</div>`:`<p class="hint" style="margin:2px 0">${L("Sin penalizadores.")}</p>`}`}
function cliCharBtn(src){if(!C)return`<p class="hint">${L("Abrí un personaje para aplicarle el clima.")}</p>`;const on=C.cliSrc&&C.cliSrc.t===src.t&&(src.t!=="map"||C.cliSrc.id===src.id);
  return on?`<div class="row"><span class="hint" style="flex:1">✓ ${L("Afecta a {0}",esc(C.nombre))}</span><button class="btn small" data-ck="src" data-v="none">${L("Quitar de {0}",esc(C.nombre))}</button></div>`
    :`<button class="btn small on" data-ck="src" data-v="${src.t==="map"?"map:"+src.id:"cal"}">${L("Aplicar a {0}",esc(C.nombre))}</button>`}
function cliMgrHTML(){const E=ui.cliEd;if(!E)return`<button class="btn small" data-ck="mgr">✎ ${L("Crear o editar climas")}</button>`;
  if(E!=="list"){const c=cliGet(E);if(!c){ui.cliEd="list";return cliMgrHTML()}const R=(f,v,ph,st)=>`<input data-cki="f" data-id="${c.id}" data-f="${f}" value="${esc(v||"")}" placeholder="${esc(ph||"")}" ${st?`style="${st}"`:""}>`;
    return`<div class="card cliedit"><div class="row sb"><b>${L("Editar clima")}</b><button class="btn small on" data-ck="mgr">✓ ${L("Listo")}</button></div>
      <div class="row">${R("ic",c.ic,"☁","width:3.2em;text-align:center")}${R("n",c.n,L("Nombre (ej.: Yugo del hielo eterno)"),"flex:1;min-width:0")}</div>
      <label class="lbl">${L("Cómo se ve en el mapa")}<select data-cki="f" data-id="${c.id}" data-f="fx">${opts(CLI_FX.map(([k,n])=>[k,L(n)]),c.fx||"")}</select></label>
      <label class="lbl">${L("Descripción")}<textarea rows="2" data-cki="f" data-id="${c.id}" data-f="d">${esc(c.d||"")}</textarea></label>
      <h4>${L("Penalizadores y bonos (van a la calculadora de tiradas)")}</h4>
      ${(c.pen||[]).map((p,i)=>`<div class="modedit"><input data-cki="p" data-id="${c.id}" data-i="${i}" data-f="n" value="${esc(p.n)}" placeholder="${L("Nombre")}"><input data-cki="p" data-id="${c.id}" data-i="${i}" data-f="v" value="${esc(p.v)}" placeholder="-2 / -1d4" style="width:5.5em">
        <select data-cki="p" data-id="${c.id}" data-i="${i}" data-f="a">${opts([["tirada",L("A la tirada")],["daño",L("Al daño")]],p.a||"tirada")}</select>
        <select data-cki="p" data-id="${c.id}" data-i="${i}" data-f="en">${opts(MOD_EN.map(([k,n])=>[k,L(n)]),p.en||"todas")}</select><button class="btn small danger" data-ck="pdel" data-id="${c.id}" data-i="${i}" aria-label="${L("Borrar")}">×</button></div>`).join("")}
      <button class="btn small" data-ck="padd" data-id="${c.id}">+ ${L("Penalizador o bono")}</button>
      <h4>${L("Estados que provoca")}</h4>
      ${(c.est||[]).map((s,i)=>`<div class="row"><input data-cki="e" data-id="${c.id}" data-i="${i}" data-f="n" value="${esc(s.n)}" placeholder="${L("Nombre del estado")}" style="flex:1;min-width:0"><select data-cki="e" data-id="${c.id}" data-i="${i}" data-f="fx" style="width:auto">${opts(FXS.map(([v,t])=>[v,L(t)]),s.fx||"none")}</select><button class="btn small danger" data-ck="edel" data-id="${c.id}" data-i="${i}" aria-label="${L("Borrar")}">×</button></div>`).join("")}
      <button class="btn small" data-ck="eadd" data-id="${c.id}">+ ${L("Estado")}</button>
      <div class="row" style="margin-top:8px"><button class="btn small danger" data-ck="cdel" data-id="${c.id}">${ui.cliDel===c.id?L("¿Seguro? Tocá otra vez"):L("Borrar este clima")}</button></div></div>`}
  const miss=CLI_PRE.filter(p=>!cliGet(p.id)).length;
  return`<div class="card"><div class="row sb"><b>${L("Climas")}</b><button class="btn small on" data-ck="mgrx">✓ ${L("Listo")}</button></div>
    <div class="chips">${clis().map(c=>`<button class="chip" data-ck="ed" data-id="${c.id}">${esc(cliName(c))} ✎</button>`).join("")}</div>
    <div class="row" style="margin-top:6px"><button class="btn small on" data-ck="cnew">+ ${L("Inventar un clima")}</button>${miss?`<button class="btn small" data-ck="crest">${L("Recuperar climas básicos")}</button>`:""}</div></div>`}
/* en el mapa */
function mapCliBtn(cur){const c=cliGet(mapCliId(cur));return`<button class="btn small ${ui.map.cliP?"on":""}" data-ck="mapP" aria-label="${L("Clima")}">${c?esc(c.ic||"☁"):"☁"}</button>`}
function mapCliPanel(cur){if(!ui.map.cliP)return"";const src=cur.cli&&cur.cli.src||"",K=APP.cal,ccal=cliGet(calCliId()),c=cliGet(mapCliId(cur));
  const sel=src==="cal"?"__cal":(cur.cli&&cur.cli.id)||"";
  return`<div class="mpinbox clipanel"><div class="row sb"><b>☁ ${L("Clima de este mapa")}</b><button class="btn small ghost" data-ck="mapP">✕</button></div>
    <select data-cki="mapcli"><option value="">${L("Sin clima")}</option><option value="__cal" ${sel==="__cal"?"selected":""}>📅 ${L("Seguir el calendario")}${K?` (${L("hoy")}: ${esc(cliName(ccal))})`:""}</option>${cliOpts(sel)}</select>
    ${src==="cal"&&!(K&&K.on)?`<p class="hint">${L("Prendé el calendario desde el menú para elegir el clima de cada día.")}</p>`:""}
    ${c?`<div class="clieff">${cliEffects(c)}</div>${cliCharBtn({t:"map",id:cur.id})}`:""}
    ${cliMgrHTML()}</div>`}
/* en el calendario */
function cliCalHTML(K){const c=cliGet(calCliId(K)),n=calTotal(K),F=ui.cf||(ui.cf={sel:(clis()[0]||{}).id,n:1,u:"d"}),ml=(K.meses[K.mes]||{}).cl||[];
  const R=(K.cliR||[]).filter(r=>r.b==null||r.b>=n).slice().reverse();
  return`<div class="card clical"><div class="row sb"><b>☁ ${L("Clima de hoy")}: ${esc(cliName(c))}</b></div>${c?cliEffects(c):""}
    <div class="row" style="margin-top:6px"><select data-cki="cf" data-f="sel" style="flex:1;min-width:9em">${cliOpts(F.sel)}</select></div>
    <div class="row"><span class="hint">${L("Desde hoy, durante")}</span>${F.u==="inf"?"":`<input type="number" min="1" data-cki="cf" data-f="n" value="${F.n}" style="width:4.5em">`}<select data-cki="cf" data-f="u" style="width:auto">${opts(CLI_U.map(([k,t])=>[k,L(t)]),F.u)}</select><button class="btn small on" data-ck="calSet">${L("Poner")}</button></div>
    ${ml.length?`<button class="btn small" data-ck="calRnd">🎲 ${L("Clima al azar de {0}",esc((K.meses[K.mes]||{}).n||""))}</button>`:""}
    ${R.length?`<h4>${L("Climas programados")}</h4>${R.map(r=>{const x=cliGet(r.c);return`<div class="row clir"><span style="flex:1">${esc(cliName(x))} · ${L("desde")} ${esc(calNStr(K,r.a))} ${r.b==null?L("para siempre"):L("hasta")+" "+esc(calNStr(K,r.b))}</span><button class="btn small danger" data-ck="rdel" data-id="${r.id}" aria-label="${L("Borrar")}">×</button></div>`}).join("")}`:""}
    ${C?`<div style="margin-top:6px">${cliCharBtn({t:"cal"})}</div>`:""}
    <details class="grp"><summary>${L("Climas posibles en cada mes (para el clima al azar)")}</summary>
      ${K.meses.map((m,i)=>`<div class="climes"><b>${esc(m.n)}</b><div class="chips">${clis().map(x=>`<button class="chip tog ${(m.cl||[]).includes(x.id)?"lit":""}" style="--c:var(--gold)" data-ck="mcl" data-m="${i}" data-id="${x.id}">${esc(x.ic||"☁")} ${esc(x.n)}</button>`).join("")}</div></div>`).join("")}</details>
    ${cliMgrHTML()}</div>`}
/* hoja del personaje */
function renderCliSheet(){if(!ui.cliOpen||!C)return;const m=document.getElementById("modal"),c=cliGet(C.cliOn),s=C.cliSrc;
  m.innerHTML=`<div class="dsheet" data-clim><div class="dpanel"><div class="row sb"><h2 style="margin:0;font-family:var(--display)">☁ ${L("Clima que afecta a {0}",esc(C.nombre))}</h2><button class="btn small" data-ck="charClose">✕</button></div>
    <div class="chips"><button class="chip ${!s?"lit":""}" data-ck="src" data-v="none">${L("Ninguno")}</button><button class="chip ${s&&s.t==="cal"?"lit":""}" data-ck="src" data-v="cal">📅 ${L("El del calendario")}</button>${(MAPS||[]).map(x=>`<button class="chip ${s&&s.t==="map"&&s.id===x.id?"lit":""}" data-ck="src" data-v="map:${x.id}">🗺 ${esc(x.n)}</button>`).join("")}</div>
    ${s?`<p class="hint">${L("Sigue a {0}: si cambia el clima, los penalizadores cambian solos.",esc(cliSrcName()))}</p><h3 style="margin:6px 0 0">${esc(cliName(c))}</h3>${cliEffects(c)}`:`<p class="hint">${L("Elegí de dónde toma el clima este personaje.")}</p>`}
    ${cliMgrHTML()}</div></div>`}
function cliRe(){if(ui.map)renderMaps();else if(ui.calOpen)renderCal();else if(ui.cliOpen)renderCliSheet()}
/* ---------- eventos ---------- */
document.addEventListener("click",e=>{const b=e.target.closest("[data-ck]");if(!b)return;e.preventDefault();e.stopPropagation();const k=b.dataset.ck,K=APP.cal,c=cliGet(b.dataset.id),i=+b.dataset.i;
  if(k!=="cdel")ui.cliDel=null;
  if(k==="mapP"){ui.map.cliP=!ui.map.cliP;if(ui.map.cliP)ui.map.sel=null;else ui.cliEd=null;renderMaps();return}
  if(k==="charOpen"){const m=document.getElementById("modal");m.onclick=m.oninput=m.onchange=null;ui.cliOpen=true;loadMaps().then(renderCliSheet);return}
  if(k==="charClose"){ui.cliOpen=false;ui.cliEd=null;document.getElementById("modal").innerHTML="";render();return}
  if(k==="src"){const v=b.dataset.v;cliSetSrc(v==="none"?null:v==="cal"?{t:"cal"}:{t:"map",id:v.slice(4)});cliRe();render();return}
  if(k==="mgr"){ui.cliEd=!ui.cliEd?"list":ui.cliEd==="list"?null:"list";cliRe();render();return}
  if(k==="mgrx"){ui.cliEd=null;cliRe();return}
  if(k==="ed"){ui.cliEd=b.dataset.id;cliRe();return}
  if(k==="cnew"){const x={id:"cli_"+uid(),n:L("Clima nuevo"),ic:"🌀",fx:"",d:"",pen:[],est:[],t:Date.now()};clis().push(x);ui.cliEd=x.id;cliSave();cliRe();return}
  if(k==="crest"){for(const p of CLI_PRE)if(!cliGet(p.id))clis().push(clone(p));cliSave();cliRe();return}
  if(k==="cdel"&&c){if(ui.cliDel!==c.id){ui.cliDel=c.id;cliRe();return}ui.cliDel=null;APP.climas=clis().filter(x=>x!==c);ui.cliEd="list";cliSave();cliRe();render();return}
  if(k==="padd"&&c){c.pen=c.pen||[];c.pen.push({n:c.n+": ",v:"-1",a:"tirada",en:"todas"});c.t=Date.now();cliSave();cliRe();render();return}
  if(k==="pdel"&&c){c.pen.splice(i,1);c.t=Date.now();cliSave();cliRe();render();return}
  if(k==="eadd"&&c){c.est=c.est||[];c.est.push({n:"",fx:"none"});c.t=Date.now();cliSave();cliRe();return}
  if(k==="edel"&&c){c.est.splice(i,1);c.t=Date.now();cliSave();cliRe();render();return}
  if(!K)return;
  if(k==="calSet"){const F=ui.cf||{};if(!cliGet(F.sel)){toast(L("Elegí un clima"));return}calAddCli(K,F.sel,F.n,F.u);cliSave();toast(L("Clima puesto"));renderCal();render();return}
  if(k==="calRnd"){const ml=((K.meses[K.mes]||{}).cl||[]).filter(cliGet);if(!ml.length)return;const x=pick(ml);calAddCli(K,x,1,"d");cliSave();toast(cliName(cliGet(x)));renderCal();render();return}
  if(k==="rdel"){K.cliR=(K.cliR||[]).filter(r=>r.id!==b.dataset.id);cliSave();renderCal();render();return}
  if(k==="mcl"){const m=K.meses[+b.dataset.m];if(!m)return;m.cl=m.cl||[];const id=b.dataset.id;m.cl=m.cl.includes(id)?m.cl.filter(x=>x!==id):[...m.cl,id];cliSave();renderCal();return}
},true);
function cliField(t,live){const k=t.dataset.cki,c=cliGet(t.dataset.id),i=+t.dataset.i,f=t.dataset.f;
  if(k==="cf"){ui.cf=ui.cf||{};ui.cf[f]=t.value;if(!live&&f==="u")renderCal();return}
  if(k==="mapcli"){if(live)return;const cur=MAPS&&MAPS.find(x=>x.id===ui.map.id);if(!cur)return;const v=t.value;cur.cli=v===""?null:v==="__cal"?{src:"cal"}:{src:"fijo",id:v};saveMaps();renderMaps();render();return}
  if(!c)return;if(k==="f")c[f]=t.value;if(k==="p"&&c.pen[i])c.pen[i][f]=t.value;if(k==="e"&&c.est[i])c.est[i][f]=t.value;c.t=Date.now();cliSave();
  if(!live){render();if(f==="fx"&&ui.map)renderMaps()}}
document.addEventListener("input",e=>{const t=e.target;if(t.dataset&&t.dataset.cki&&t.tagName!=="SELECT")cliField(t,true)});
document.addEventListener("change",e=>{const t=e.target;if(t.dataset&&t.dataset.cki){e.stopPropagation();cliField(t,false)}},true);
setTimeout(()=>{loadMaps().then(()=>{if(C&&C.cliSrc)render()}).catch(()=>{})},400);
