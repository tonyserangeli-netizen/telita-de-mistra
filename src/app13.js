/* ============ favoritos ============ */
function favStar(ref){const on=(C.favs||[]).includes(ref);return`<button class="fstar ${on?"on":""}" data-fav="${ref}" aria-pressed="${on}" aria-label="${on?L("Quitar de favoritos"):L("Agregar a favoritos")}">${on?"★":"☆"}</button>`}
function favBar(){
  const out=[];C.favs=(C.favs||[]).filter(r=>resolve(r));
  for(const ref of C.favs){const o=resolve(ref).obj;if(!o)continue;let btn="";
    if(/^C\.(grupos\..+\.items|magicos)\./.test(ref)){const u=o.usos&&o.usos.max?` <small>${o.usos.act}/${o.usos.max}</small>`:"";btn=`<button class="fav" data-a="useItem" data-ref="${ref}">${esc(o.n)}${u}</button>`}
    else if(ref.startsWith("C.armas.")){btn=`<button class="fav" data-a="hit" data-id="${o.id}">⚔ ${esc(o.n)}</button>`}
    else if(ref.startsWith("C.consum.")){btn=`<button class="fav" data-a="cUse" data-id="${o.id}">${esc(o.n)} <small>${+o.cap>0?o.carga:o.act}</small></button>`}
    else if(ref.startsWith("C.recursos.")){btn=`<button class="fav" data-a="res" data-id="${o.id}" data-v="-1">${esc(o.n)} <small>${o.act}/${o.max}</small> −1</button>`}
    else if(ref.startsWith("C.contadores.")){btn=`<button class="fav" data-a="cnt" data-id="${o.id}" data-v="1">${esc(o.n)} <small>${o.v}</small> ＋</button>`}
    else if(ref.startsWith("C.medidores.")){btn=`<span class="fav favg">${esc(o.n)} <small>${o.v}</small><button data-a="med" data-id="${o.id}" data-v="-1" aria-label="${L("Restar")}">−</button><button data-a="med" data-id="${o.id}" data-v="1" aria-label="${L("Sumar")}">＋</button></span>`}
    else if(ref.startsWith("C.barras.")){btn=`<span class="fav favg">${esc(o.n)} <small>${o.v}</small><button data-a="barStep" data-id="${o.id}" data-v="-1">−</button><button data-a="barStep" data-id="${o.id}" data-v="1">＋</button></span>`}
    else if(ref.startsWith("C.invoc.")){const inv=o.estado==="invocada";btn=`<button class="fav ${inv?"lit":""}" data-a="invState" data-id="${o.id}" data-v="${inv?"dentro":"invocada"}">${inv?"◉":"○"} ${esc(o.n)}${inv&&+o.left?` <small>${o.left}</small>`:""}</button>`}
    else if(ref.startsWith("C.efectos.")){btn=`<button class="fav ${o.on?"lit":""}" data-a="effToggle" data-id="${o.id}">✦ ${esc(o.n)}</button>`}
    else if(ref.startsWith("C.capas.")){btn=`<button class="fav ${o.on?"lit":""}" data-a="capaToggle" data-id="${o.id}">◧ ${esc(o.n)}</button>`}
    else if(ref.startsWith("C.estados.")){btn=`<button class="fav ${o.on?"lit":""}" data-a="estado" data-id="${o.id}">${esc(o.n)}</button>`}
    else if(ref.startsWith("C.cuadros.")){const m=ref.match(/^C\.cuadros\.([^.]+)\.bl\.([^.]+)$/);if(!m)continue;
      if(o.t==="activable"||o.t==="transformacion")btn=`<button class="fav ${o.on?"lit":""}" data-cx="act" data-id="${m[1]}" data-b="${m[2]}">${esc(o.n)}${o.on&&+o.left?` <small>${o.left}</small>`:""}</button>`;
      else if(o.t==="tirada")btn=`<button class="fav" data-cx="roll" data-id="${m[1]}" data-b="${m[2]}">🎲 ${esc(o.n)}</button>`;
      else if(o.t==="contador")btn=`<button class="fav" data-cx="cnt" data-v="1" data-id="${m[1]}" data-b="${m[2]}">${esc(o.n)} <small>${o.act}</small> ＋</button>`;
      else if(o.t==="tabla")btn=`<button class="fav" data-cx="tab" data-id="${m[1]}" data-b="${m[2]}">🎲 ${esc(o.n)}</button>`}
    if(btn)out.push(btn)}
  return out.length?`<div class="favbar" aria-label="${L("Favoritos")}"><span class="fl">★</span>${out.join("")}</div>`:"";
}
/* ============ preparar conjuros ============ */
const grpOfRef=ref=>{const m=String(ref).match(/^C\.grupos\.([^.]+)\.items\./);return m&&C.grupos.find(g=>g.id===m[1])};
const grpOfItem=it=>C.grupos.find(g=>g.items.includes(it));
const prepCount=g=>g.items.filter(i=>i.prep).length;
const unprep=(g,it)=>!!(g&&g.prep&&!it.prep);
function prepHead(g){if(!g.prep)return"";const n=prepCount(g),mx=+g.prepMax||0;
  return`<span class="tag ${mx&&n>mx?"blue":""}">${L("Preparados {0}",n+(mx?"/"+mx:""))}</span><button class="btn small ${ui.prepMode===g.id?"on":""}" data-a="prepMode" data-id="${g.id}">${ui.prepMode===g.id?"✓ "+L("Listo"):"📖 "+L("Preparar")}</button>`}
/* ============ calendario de partida ============ */
const CAL_PRESETS={
  propio:{n:"Propio",meses:Array.from({length:12},(_,i)=>({n:"Mes "+(i+1),d:30})),semana:["Día 1","Día 2","Día 3","Día 4","Día 5","Día 6","Día 7"],era:"",luna:28},
  harptos:{n:"Harptos (Reinos Olvidados)",meses:"Martillo,Alturiak,Ches,Tarsakh,Mirtul,Kythorn,Flamarregla,Eleasis,Eleint,Marpenoth,Uktar,Nochal".split(",").map(n=>({n,d:30})),semana:["Primer día","Segundo día","Tercer día","Cuarto día","Quinto día","Sexto día","Séptimo día","Octavo día","Noveno día","Décimo día"],era:"CV",luna:30},
  gregoriano:{n:"Gregoriano (época real, ej. Cthulhu)",meses:[["Enero",31],["Febrero",28],["Marzo",31],["Abril",30],["Mayo",31],["Junio",30],["Julio",31],["Agosto",31],["Septiembre",30],["Octubre",31],["Noviembre",30],["Diciembre",31]].map(([n,d])=>({n,d})),semana:["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"],era:"",luna:29.53},
};
function cal(){if(!APP.cal){const p=CAL_PRESETS.propio;APP.cal={on:false,preset:"propio",meses:p.meses,semana:p.semana,era:p.era,lunaCiclo:p.luna,lunaOff:0,anio:1,mes:0,dia:1,ev:{}}}return APP.cal}
function calTotal(K){let t=0;const ylen=K.meses.reduce((a,m)=>a+(+m.d||0),0)||1;t=(+K.anio-1)*ylen;for(let i=0;i<K.mes;i++)t+=+K.meses[i].d||0;return t+(+K.dia-1)}
const MOONS=["🌑","🌒","🌓","🌔","🌕","🌖","🌗","🌘"],MOONN=["Luna nueva","Creciente","Cuarto creciente","Gibosa creciente","Luna llena","Gibosa menguante","Cuarto menguante","Menguante"];
function moon(K){const c=+K.lunaCiclo||28;const ph=((calTotal(K)+(+K.lunaOff||0))%c+c)%c/c;const i=Math.round(ph*8)%8;return{i,e:MOONS[i],n:MOONN[i]}}
function calStr(K){const m=K.meses[K.mes]||{n:"?"};const wd=K.semana.length?K.semana[calTotal(K)%K.semana.length]:"";return`${wd?wd+", ":""}${K.dia} ${L("de")} ${m.n}, ${K.anio}${K.era?" "+K.era:""}`}
const calKey=K=>`${K.anio}-${K.mes}-${K.dia}`;
function calMove(n){const K=cal();K.dia=+K.dia+n;for(let g=0;g<5000;g++){const ml=+(K.meses[K.mes]||{}).d||30;if(K.dia>ml){K.dia-=ml;K.mes++;if(K.mes>=K.meses.length){K.mes=0;K.anio++}}else if(K.dia<1){K.mes--;if(K.mes<0){K.mes=K.meses.length-1;K.anio--}K.dia+=+(K.meses[K.mes]||{}).d||30}else break}
  DB.set("index",APP);const mo=moon(K);if(mo.i===4)toast(L("🌕 Esta noche hay luna llena"))}
function calChip(){const K=APP.cal;if(!K||!K.on)return"";const mo=moon(K);return`<button class="calchip" data-a="calOpen" title="${L(mo.n)}">${mo.e} ${esc(calStr(K))}${K.ev&&K.ev[calKey(K)]?" ✎":""}</button>`}
function openCal(){const m=document.getElementById("modal");m.onclick=m.oninput=m.onchange=null;ui.calOpen=true;renderCal()}
function renderCal(){
  if(!ui.calOpen)return;const K=cal(),mo=moon(K),m=document.getElementById("modal");
  const up=Object.entries(K.ev||{}).filter(([k,v])=>v&&v.trim()).map(([k,v])=>{const[a,me,d]=k.split("-").map(Number);return{k,a,me,d,v}}).sort((x,y)=>(x.a-y.a)||(x.me-y.me)||(x.d-y.d));
  m.innerHTML=`<div class="dsheet" data-calm><div class="dpanel"><div class="row sb"><h2 style="margin:0;font-family:var(--display)">📅 ${L("Calendario de la partida")}</h2><button class="btn small" data-cl="close">✕</button></div>
    <label class="row hint" style="gap:6px"><input type="checkbox" data-cf="on" ${K.on?"checked":""} style="width:auto"> ${L("Mostrar la fecha arriba de la ficha")}</label>
    <div class="caltoday"><div class="moon" title="${L(mo.n)}">${mo.e}</div><div><div class="cdate">${esc(calStr(K))}</div><div class="hint">${L(mo.n)}</div></div></div>
    <div class="row"><button class="btn small" data-cl="mv" data-v="-1">− ${L("1 día")}</button><button class="btn small on" data-cl="mv" data-v="1">+ ${L("1 día")}</button><button class="btn small" data-cl="mv" data-v="7">+ ${L("1 semana")}</button><button class="btn small" data-cl="mv" data-v="${+(K.meses[K.mes]||{}).d||30}">+ ${L("1 mes")}</button></div>
    ${cliCalHTML(K)}
    <label class="lbl">${L("Qué pasa este día (lo ven todos los personajes de este celular)")}<textarea rows="3" data-cev>${esc((K.ev||{})[calKey(K)]||"")}</textarea></label>
    ${up.length?`<h3>${L("Días anotados")}</h3><div class="calev">${up.map(e=>`<button class="card" data-cl="go" data-v="${e.k}"><b>${e.d} ${esc((K.meses[e.me]||{}).n||"")} ${e.a}</b><span class="d">${esc(e.v.slice(0,90))}</span></button>`).join("")}</div>`:""}
    <details class="grp"><summary>${L("Configurar calendario")}</summary>
      <label class="lbl">${L("Modelo")}<select data-cf="preset">${Object.entries(CAL_PRESETS).map(([k,p])=>`<option value="${k}" ${K.preset===k?"selected":""}>${L(p.n)}</option>`).join("")}</select></label>
      <div class="grid2"><label class="lbl">${L("Día")}<input type="number" min="1" data-cf="dia" value="${K.dia}"></label><label class="lbl">${L("Mes")}<select data-cf="mes">${K.meses.map((x,i)=>`<option value="${i}" ${i===K.mes?"selected":""}>${esc(x.n)}</option>`).join("")}</select></label>
      <label class="lbl">${L("Año")}<input type="number" data-cf="anio" value="${K.anio}"></label><label class="lbl">${L("Era (ej.: CV, d.C.)")}<input data-cf="era" value="${esc(K.era||"")}"></label>
      <label class="lbl">${L("Días del ciclo lunar")}<input type="number" step="0.01" min="1" data-cf="lunaCiclo" value="${K.lunaCiclo}"></label><label class="lbl">${L("Correr la luna (días)")}<input type="number" data-cf="lunaOff" value="${K.lunaOff||0}"></label></div>
      <label class="lbl">${L("Meses (uno por renglón: Nombre: días)")}<textarea rows="6" data-cf="meses">${esc(K.meses.map(x=>`${x.n}: ${x.d}`).join("\n"))}</textarea></label>
      <label class="lbl">${L("Días de la semana (separados por coma)")}<input data-cf="semana" value="${esc(K.semana.join(", "))}"></label></details>
  </div></div>`;
}
/* ============ reputación con facciones ============ */
const REPN=[[-8,"Enemigo jurado"],[-4,"Hostil"],[-1,"Desconfiado"],[1,"Neutral"],[4,"Amistoso"],[8,"Aliado"],[99,"Venerado"]];
const repLabel=v=>{for(const[t,n]of REPN)if(v<t)return L(n);return L("Venerado")};
function repHTML(){
  const F=C.facciones||[];
  return`<div class="sec"><h2>${L("Reputación con facciones")}</h2><p class="hint">${L("Cuánto te aprecian u odian los distintos grupos, de −10 a +10.")}</p>
    ${F.map(f=>{const ref=`C.facciones.${f.id}`,p=(clamp(+f.v||0,-10,10)+10)/20*100;
      return ui.edit?`<div class="card"><div class="row" style="flex-wrap:nowrap"><input ${R(ref,"n")} value="${esc(f.n)}" style="flex:1"><input type="color" ${R(ref,"c")} value="${f.c||"#d9a845"}"></div><textarea ${R(ref,"d")} placeholder="${L("Notas sobre esta facción")}">${esc(f.d||"")}</textarea><button class="btn small danger" data-a="del" data-ref="${ref}">${L("Borrar")}</button></div>`
      :`<div class="rep"><div class="row sb"><b style="color:${f.c||"var(--gold)"}">${esc(f.n)}</b><span class="tag">${repLabel(+f.v||0)} · ${(+f.v>0?"+":"")+(+f.v||0)}</span></div>
        <div class="repbar"><i class="mid"></i><b style="left:${p}%;background:${f.c||"var(--gold)"}"></b></div>
        <div class="row sb"><button class="btn small" data-a="rep" data-id="${f.id}" data-v="-1" aria-label="${L("Bajar")}">−</button>${f.d?`<span class="hint" style="flex:1;text-align:center">${esc(f.d)}</span>`:""}<button class="btn small" data-a="rep" data-id="${f.id}" data-v="1" aria-label="${L("Subir")}">+</button></div></div>`}).join("")||`<div class="empty">${L("Sin facciones todavía.")}</div>`}
    <button class="btn small" data-a="repAdd">+ ${L("Nueva facción")}</button></div>`;
}
/* ============ modo terror ============ */
function horrorHTML(){if(!C.terror)return"";const d=C.hp.max?clamp(1-C.hp.act/C.hp.max,0,1):0;return`<div class="horror ${d>.7?"crit":""}" style="--d:${d.toFixed(2)}" aria-hidden="true"></div>`}
/* ============ estilos de contadores y medidores ============ */
LOOKS.cnt=[["numero","Número y marcas"],["calaveras","Calaveras"],["gotas","Gotas de sangre"],["llamas","Llamas"],["runas","Runas"],["gemas","Gemas"]];
LOOKS.med=[["barra","Barra"],["termometro","Termómetro"],["aguja","Aguja"],["orbe","Orbe"]];
function cntIcons(k){const st=look("cnt",k)||"numero",n=Math.min(+k.v||0,30);if(st==="numero")return`<div class="mk-pips">${Array.from({length:Math.min(n,20)},()=>"<i></i>").join("")}</div>`;
  const c=k.c||"var(--gold)",f={calaveras:()=>IC.calavera(true,"#e3d6d0"),gotas:()=>IC.gota(true),llamas:()=>IC.llama(true,c),runas:i=>IC.runa(true,c,i),gemas:()=>IC.gema(true,c)}[st];
  return`<div class="ricons cnti">${Array.from({length:n},(_,i)=>`<i>${f(i)}</i>`).join("")}</div>`}
function medVisual(M){const st=look("med",M)||"barra";const span=(M.max-M.min)||1,p=clamp((M.v-M.min)/span,0,1),bip=M.tipo==="bipolar";
  const col=bip?(M.v<0?"#7a2cc9":M.v>0?"#f2d27a":"#888"):"var(--gold)";
  if(st==="termometro")return`<div class="mthermo"><svg viewBox="0 0 40 120"><rect x="14" y="6" width="12" height="90" rx="6" fill="var(--bg)" stroke="var(--line)"/><rect x="16" y="${8+86*(1-p)}" width="8" height="${86*p}" rx="4" fill="${col}"/><circle cx="20" cy="104" r="12" fill="${col}" stroke="var(--line)"/></svg></div>`;
  if(st==="aguja"){const a=-90+180*p;return`<div class="mgauge"><svg viewBox="0 0 120 70"><path d="M10 64a50 50 0 0 1 100 0" fill="none" stroke="${bip?"url(#mgg)":"var(--line)"}" stroke-width="10"/><defs><linearGradient id="mgg"><stop offset="0" stop-color="#2a1040"/><stop offset=".5" stop-color="#666"/><stop offset="1" stop-color="#fff2c0"/></linearGradient></defs><g style="transform:rotate(${a}deg);transform-origin:60px 64px;transition:transform .5s"><path d="M58 64 60 18 62 64Z" fill="${col}"/></g><circle cx="60" cy="64" r="5" fill="${col}"/></svg></div>`}
  if(st==="orbe")return`<div class="morb" style="--p:${p};--c:${col}"><svg viewBox="0 0 80 80"><defs><clipPath id="orbc${M.id}"><circle cx="40" cy="40" r="34"/></clipPath></defs><circle cx="40" cy="40" r="36" fill="var(--bg)" stroke="${col}" stroke-width="2"/><g clip-path="url(#orbc${M.id})"><rect x="0" y="${6+68*(1-p)}" width="80" height="80" fill="${col}" opacity=".85"/></g><ellipse cx="30" cy="24" rx="10" ry="5" fill="#fff" opacity=".18"/></svg></div>`;
  return null}
/* ============ secretos con PIN ============ */
const b64=a=>btoa(String.fromCharCode(...new Uint8Array(a))),ub64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function secKey(pin,salt){const base=await crypto.subtle.importKey("raw",new TextEncoder().encode(pin),"PBKDF2",false,["deriveKey"]);return crypto.subtle.deriveKey({name:"PBKDF2",salt,iterations:150000,hash:"SHA-256"},base,{name:"AES-GCM",length:256},false,["encrypt","decrypt"])}
async function secSave(pin,text){const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));const k=await secKey(pin,salt);const ct=await crypto.subtle.encrypt({name:"AES-GCM",iv},k,new TextEncoder().encode(text));C.secreto={salt:b64(salt),iv:b64(iv),ct:b64(ct)};saveSoon()}
async function secOpen(pin){const S=C.secreto;const k=await secKey(pin,ub64(S.salt));const pt=await crypto.subtle.decrypt({name:"AES-GCM",iv:ub64(S.iv)},k,ub64(S.ct));return new TextDecoder().decode(pt)}
let SEC=null;// {id,pin,txt} solo en memoria
function secHTML(){
  const open=SEC&&SEC.id===C.id;
  if(!C.secreto)return`<div class="sec secret"><h2>🔒 ${L("Secretos")}</h2><p class="hint">${L("Lo que el resto de la mesa no tiene que ver. Queda cifrado con un PIN: sin el PIN no se puede leer, ni siquiera desde una copia de seguridad.")}</p>
    <div class="row"><input type="password" inputmode="numeric" id="sec-p1" placeholder="${L("PIN nuevo (4 o más)")}" style="flex:1;min-width:0"><input type="password" inputmode="numeric" id="sec-p2" placeholder="${L("Repetilo")}" style="flex:1;min-width:0"><button class="btn small on" data-sec="create">${L("Crear")}</button></div></div>`;
  if(!open)return`<div class="sec secret"><h2>🔒 ${L("Secretos")}</h2><div class="row"><input type="password" inputmode="numeric" id="sec-pin" placeholder="PIN" style="flex:1;min-width:0"><button class="btn small on" data-sec="open">${L("Abrir")}</button></div></div>`;
  return`<div class="sec secret open"><div class="row sb"><h2 style="margin:0">🔓 ${L("Secretos")}</h2><button class="btn small" data-sec="lock">🔒 ${L("Guardar y cerrar")}</button></div>
    <textarea id="sec-txt" rows="8" placeholder="${L("Escribí acá tus secretos…")}">${esc(SEC.txt)}</textarea>
    <div class="row"><button class="btn small danger" data-sec="wipe">${ui.secWipe?L("¿Borrar todo? Tocá otra vez"):L("Borrar secretos y PIN")}</button></div></div>`;
}
/* ============ tutorial ============ */
const TUT=[
  [null,"Bienvenido a Telita de Mistra","Un recorrido rápido por lo importante. Lo podés repetir cuando quieras desde el menú ☰."],
  ['[data-a="menu"]',"Menú","Acá cambiás de personaje, abrís el compendio, los sonidos, la apariencia, el calendario y hacés copias de seguridad."],
  ['.stage',"Tu personaje","La imagen cambia de pose en combate, y las zonas y capas se prenden con los poderes."],
  ['.hpctl',"Vida","Escribí el daño que te hicieron y tocá Daño o Curar. La sobrevida se gasta primero."],
  ['[data-a="combat"]',"Combate","Entrá en combate para ver todo lo de pelea junto y llevar la cuenta de los turnos."],
  ['nav.tabs',"Pestañas","Poderes, armas, cuerpo, hoja de personaje y notas. También podés crear pestañas propias."],
  ['[data-a="edit"]',"Editar","Con Editar cambiás, agregás o borrás cualquier cosa de la ficha, y armás tus propios cuadros."],
  ['.favbar',"Favoritos","Lo que marcás con ☆ aparece acá como botón rápido."],
  ['.dicefab',"Dados","Cargá lo que sacaste en tus dados físicos y la app suma bonos, ventaja y críticos."],
  ['[data-a="undo"]',"Deshacer","¿Te equivocaste? Deshacer vuelve atrás el último cambio."],
  [null,"Hay mucho más","En el menú ☰ → 📘 Tutoriales tenés capítulos de todo: poderes, armas, brillos, combate, dados, cuadros propios, sonidos… y un tutorial completo para máster.",null],
  [null,"¡Listo!","Todo se guarda solo en este celular. Usá Exportar todo de vez en cuando como copia de seguridad."]];
function tutStart(){ui.tutSteps=null;ui.tutWent=-1;ui.tut=0;tutShow()}
function tutShow(){let el=document.getElementById("tut");if(ui.tut==null){if(el)el.remove();return}
  if(!el){el=document.createElement("div");el.id="tut";document.body.appendChild(el)}
  const ST=ui.tutSteps||TUT;if(ui.tut>=ST.length){ui.tut=null;ui.tutSteps=null;el.remove();return}
  const step=ST[ui.tut];if(step[3]&&ui.tutWent!==ui.tut){ui.tutWent=ui.tut;try{step[3]()}catch(e){}render();el.innerHTML="";setTimeout(tutShow,300);return}
  const[sel,t,d]=step;let tg=sel&&[...document.querySelectorAll(sel)].find(x=>x.offsetParent!==null);
  if(tg)tg.scrollIntoView({block:"center",behavior:"instant"});const r=tg?tg.getBoundingClientRect():null;
  const hole=r?`<div class="thole" style="left:${r.left-6}px;top:${r.top-6}px;width:${r.width+12}px;height:${r.height+12}px"></div>`:`<div class="thole none"></div>`;
  const below=r?r.bottom+160<innerHeight:true;const top=r?(below?r.bottom+14:Math.max(10,r.top-190)):innerHeight/2-90;
  el.innerHTML=`${hole}<div class="tbub" role="dialog" aria-label="${L(t)}" style="top:${top}px"><div class="hint">${ui.tut+1} / ${ST.length}</div><h3>${L(t)}</h3><p>${L(d)}</p>
    ${ui.tut===0&&!ui.tutSteps&&!/^(Aventurera|Example|Aventureira)/.test(C&&C.nombre||"")?`<button class="btn small" data-tut="demo" style="width:100%;margin-bottom:8px">✨ ${L("Hacerlo con un personaje de ejemplo")}</button>`:""}<div class="row sb"><button class="btn small ghost" data-tut="skip">${L("Saltar")}</button><span class="row">${ui.tut?`<button class="btn small" data-tut="prev">‹</button>`:""}<button class="btn small on" data-tut="next">${ui.tut===ST.length-1?L("Terminar"):L("Siguiente")} ›</button></span></div></div>`}
(function(){
  document.addEventListener("click",async e=>{
    const f=e.target.closest("[data-fav]");if(f&&C){e.preventDefault();e.stopPropagation();C.favs=C.favs||[];const r=f.dataset.fav;C.favs=C.favs.includes(r)?C.favs.filter(x=>x!==r):[...C.favs,r];saveSoon();render();return}
    const tt=e.target.closest("[data-tut]");if(tt){e.preventDefault();const k=tt.dataset.tut;if(k==="next")ui.tut=ui.tut+1>=(ui.tutSteps||TUT).length?null:ui.tut+1;if(k==="prev")ui.tut=Math.max(0,ui.tut-1);if(k==="skip")ui.tut=null;if(k==="demo"){ui.tut=null;APP.tutDone=true;tutShow();createDemo();return}if(ui.tut==null){APP.tutDone=true;ui.tutSteps=null;DB.set("index",APP)}tutShow();return}
    const cl=e.target.closest("[data-cl]");if(cl){e.preventDefault();e.stopPropagation();const K=cal(),k=cl.dataset.cl;
      if(k==="close"){ui.calOpen=false;document.getElementById("modal").innerHTML="";render();return}
      if(k==="mv"){calMove(+cl.dataset.v)}
      if(k==="go"){const[a,m,d]=cl.dataset.v.split("-").map(Number);K.anio=a;K.mes=m;K.dia=d;DB.set("index",APP)}
      renderCal();render();return}
    const s=e.target.closest("[data-sec]");if(s&&C){e.preventDefault();e.stopPropagation();const k=s.dataset.sec;
      try{
        if(k==="create"){const a=(document.getElementById("sec-p1")||{}).value||"",b=(document.getElementById("sec-p2")||{}).value||"";if(a.length<4){toast(L("El PIN tiene que tener 4 o más caracteres"));return}if(a!==b){toast(L("Los dos PIN no coinciden"));return}await secSave(a,"");SEC={id:C.id,pin:a,txt:""};render();toast(L("Secretos creados. ¡No te olvides el PIN!"));return}
        if(k==="open"){const p=(document.getElementById("sec-pin")||{}).value||"";try{const t=await secOpen(p);SEC={id:C.id,pin:p,txt:t};render()}catch(err){toast(L("PIN incorrecto"));vib(200)}return}
        if(k==="lock"){const t=(document.getElementById("sec-txt")||{}).value||"";await secSave(SEC.pin,t);SEC=null;render();toast(L("Guardado y cerrado"));return}
        if(k==="wipe"){if(!ui.secWipe){ui.secWipe=true;render();setTimeout(()=>{ui.secWipe=false},3000);return}delete C.secreto;SEC=null;ui.secWipe=false;saveSoon();render();return}
      }catch(err){toast(L("Este navegador no permite cifrar. Abrí la app desde el link https."))}
      return}
  },true);
  document.addEventListener("input",e=>{const t=e.target;if(t.id==="sec-txt"&&SEC)SEC.txt=t.value;if(t.matches("[data-cev]")){const K=cal();K.ev=K.ev||{};K.ev[calKey(K)]=t.value;clearTimeout(t._t);t._t=setTimeout(()=>DB.set("index",APP),400)}});
  document.addEventListener("change",e=>{const t=e.target;if(!t.dataset.cf)return;const K=cal(),f=t.dataset.cf;
    if(f==="on")K.on=t.checked;
    else if(f==="preset"){const p=CAL_PRESETS[t.value];if(p){K.preset=t.value;K.meses=JSON.parse(JSON.stringify(p.meses));K.semana=[...p.semana];K.era=p.era;K.lunaCiclo=p.luna;K.mes=Math.min(K.mes,K.meses.length-1)}}
    else if(f==="meses"){const ms=t.value.split("\n").filter(l=>l.trim()).map((l,i)=>{const m=l.match(/^(.+?)\s*[:=]\s*(\d+)\s*$/);const o=m?{n:m[1].trim(),d:+m[2]}:{n:l.trim(),d:30};const cl=(K.meses[i]||{}).cl;if(cl)o.cl=cl;return o});if(ms.length){K.meses=ms;K.mes=Math.min(K.mes,ms.length-1);K.preset="propio"}}
    else if(f==="semana")K.semana=t.value.split(",").map(x=>x.trim()).filter(Boolean);
    else if(f==="era")K.era=t.value;
    else K[f]=f==="lunaCiclo"?Math.max(1,parseFloat(t.value)||28):(parseInt(t.value)||0);
    if(f==="dia")K.dia=clamp(K.dia,1,+(K.meses[K.mes]||{}).d||30);
    DB.set("index",APP);renderCal();render()});
})();
