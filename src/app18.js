/* ============ modo máster ============ */
let MS=null;
async function loadMaster(){if(!MS){MS=(await DB.get("master"))||{};MS.comb=MS.comb||[];MS.ronda=MS.ronda||1;MS.turno=MS.turno||0;MS.enem=MS.enem||[];MS.notas=MS.notas||[];MS.timer=MS.timer||{secs:30,estilo:""};MS.salud=MS.salud||"aprox";
  for(const e of MS.enem){for(const k of [e.img,...(e.fases||[]).map(f=>f.img)])if(k&&!IMG.has(k)){const v=await DB.get(k);if(v)IMG.set(k,v)}}}return MS}
let msT=null;const saveMaster=()=>{clearTimeout(msT);msT=setTimeout(()=>DB.set("master",MS),300)};
function masterImgKeys(){const s=[];(MS&&MS.audios||[]).forEach(a=>a.k&&s.push(a.k));(MS&&MS.enem||[]).forEach(e=>{if(e.img)s.push(e.img);(e.fases||[]).forEach(f=>f.img&&s.push(f.img))});return s}
const isMaster=()=>APP.modo==="master";
function modeSwitch(){return`<div class="modesw" role="group" aria-label="${L("Modo")}"><button class="${isMaster()?"":"on"}" data-ms="modo" data-v="jugador" aria-pressed="${!isMaster()}">🧙 ${L("Jugador")}</button><button class="${isMaster()?"on":""}" data-ms="modo" data-v="master" aria-pressed="${isMaster()}">👑 ${L("Máster")}</button></div>`}
/* fases y salud */
const ENC=new Map();
async function encLoad(){for(const x of MS.comb)if(x.charId&&!ENC.has(x.charId)){const c=await DB.get("c_"+x.charId);if(c){ENC.set(x.charId,c);for(const p of c.poses||[])if(p.img&&!IMG.has(p.img)){const v=await DB.get(p.img);if(v)IMG.set(p.img,v)}}}}
function enemOf(c){return c.charId&&(C&&C.id===c.charId?C:ENC.get(c.charId))}
function faseOf(c){const e=enemOf(c);if(!e)return null;const ps=(e.poses||[]).filter(p=>p.umbral!==undefined&&p.umbral!==""&&p.umbral!==null&&c.hp<=+p.umbral).sort((a,b)=>(+a.umbral)-(+b.umbral));return ps[0]||null}
function imgOf(c){const e=enemOf(c);if(!e)return null;const f=faseOf(c);const p=f||(e.poses||[]).find(x=>x.combate)||(e.poses||[])[0];return p&&getImg(p.img)}
function saludTxt(c){if(!+c.hpmax)return"";const p=c.hp/c.hpmax;return p<=0?L("Derrotado"):p<.25?L("Al borde de la muerte"):p<.5?L("Muy herido"):p<.9?L("Herido"):L("Ileso")}
/* pantalla */
function renderMaster(){
  if(!MS){loadMaster().then(async()=>{await migrateEnem();await encLoad();render()});return`<div class="wrap"><p class="hint">…</p></div>`}
  const T=ui.mtab||"ini";
  const tabs=[["ini","⚔ "+L("Iniciativa")],["enem","👹 "+L("Enemigos")],["best","📚 "+L("Bestiario")],["tools","🛠 "+L("Herramientas")],["timer","⏳ "+L("Temporizador")],["notas","📜 "+L("Cuaderno")]];
  return`<div class="wrap master">
  <header><div class="brand">${LOGO}<span>Telita de Mistra</span><span class="hint" style="letter-spacing:0">v${APPV}</span></div></header>
  ${modeSwitch()}
  <div class="row mquick"><button class="btn small" data-a="mapsOpen">🗺 ${L("Mapas")}</button><button class="btn small" data-a="calOpen">📅 ${L("Calendario")}</button><button class="btn small" data-ms="dados">🎲 ${L("Dados")}</button><button class="btn small" data-a="tutStart">📘 ${L("Tutorial de máster")}</button></div>
  <nav class="tabs mtabs">${tabs.map(([k,n])=>`<button class="${T===k?"on":""}" data-ms="tab" data-v="${k}">${n}</button>`).join("")}</nav>
  <section class="sec">${T==="ini"?msIni():T==="enem"?msEnem():T==="best"?msBest():T==="tools"?msTools():T==="timer"?msTimer():msNotas()}</section></div>`;
}
function msIni(){
  const list=MS.comb;const cur=list[MS.turno];
  return`<div class="row sb"><h2 style="margin:0">${L("Ronda {0}",MS.ronda)}</h2><span class="row"><button class="btn small" data-ms="sort">${L("Ordenar")}</button><button class="btn small" data-ms="rollall">🎲 ${L("Tirar iniciativa de enemigos")}</button></span></div>
  ${list.length?`<label class="lbl inline hint">${L("Duración de los estados que agregues (rondas, 0 = sin límite)")} <input type="number" min="0" data-cdur value="${ui.cdur||0}" style="width:4em"></label>`:""}
  ${list.length?`<button class="btn fight bigturn" data-ms="next">${L("Siguiente turno")} ›${cur?` <small>${L("ahora: {0}",esc(cur.n))}</small>`:""}</button>`:""}
  <div class="clist">${list.map((c,i)=>{const e=enemOf(c),f=faseOf(c),img=imgOf(c),dead=c.tipo==="enem"&&+c.hpmax&&c.hp<=0;
    return`<div class="comb ${i===MS.turno?"now":""} ${c.tipo} ${dead?"dead":""}">
      <div class="cini"><input type="number" inputmode="numeric" data-mc="${c.id}|ini" value="${c.ini??""}" aria-label="${L("Iniciativa")}"></div>
      ${img?`<div class="cimg" style="background-image:url(${img})"></div>`:`<div class="cimg ph">${c.tipo==="pj"?"🧙":"👹"}</div>`}
      <div class="cbody"><div class="row sb"><input class="cname" data-mc="${c.id}|n" value="${esc(c.n)}"><button class="btn small ghost" data-ms="cdel" data-id="${c.id}" aria-label="${L("Quitar")}">×</button></div>
        ${c.tipo==="enem"?`<div class="row" style="flex-wrap:nowrap;gap:6px"><span class="hpm"><b>${c.hp}</b>/${c.hpmax}</span><input type="number" inputmode="numeric" data-mhp="${c.id}" placeholder="${L("daño")}" style="width:5em"><button class="btn small dmg" data-ms="hp" data-id="${c.id}" data-v="-1">−</button><button class="btn small heal" data-ms="hp" data-id="${c.id}" data-v="1">+</button>${+c.ca?`<span class="tag">CA ${c.ca}</span>`:""}</div>
          ${f?`<span class="tag" style="border-color:var(--crimson);color:#ff9a9a">${L("Fase")}: ${esc(f.n)}</span>`:""}
          <div class="row"><button class="btn small" data-ms="show" data-id="${c.id}">📺 ${L("Mostrar a la mesa")}</button><button class="btn small" data-ms="cfic" data-id="${c.id}">📖 ${L("Abrir ficha")}</button></div>`:""}
        ${condChips(c)}<input class="cest" data-mc="${c.id}|est" value="${esc(c.est||"")}" placeholder="${L("Estados (envenenado, derribado…)")}"></div></div>`}).join("")||`<div class="empty">${L("Agregá jugadores y enemigos para llevar la iniciativa.")}</div>`}</div>
  <div class="card"><div class="t">${L("Agregar")}</div>
    <div class="chips">${playerChars().map(ch=>`<button class="chip add" data-ms="addpj" data-n="${esc(ch.n)}">＋ ${esc(ch.n)}</button>`).join("")}<button class="chip add" data-ms="addpj" data-n="">＋ ${L("Jugador")}</button></div>
    ${enemChars().length?`<div class="chips">${enemChars().map(e=>`<button class="chip add" data-ms="addenem" data-id="${e.id}">＋ 👹 ${esc(e.n)}</button>`).join("")}</div>`:`<p class="hint">${L("Creá enemigos en la pestaña Enemigos para sumarlos acá.")}</p>`}
    ${MS.comb.length?`<button class="btn small danger" data-ms="clear">${ui.mclr?L("¿Seguro? Tocá otra vez"):L("Terminar combate y limpiar")}</button>`:""}</div>`;
}
const AMB=[["","Sin efecto"],["lluvia","Lluvia"],["nieve","Nieve"],["niebla","Niebla"],["rayos","Tormenta eléctrica"],["brasas","Brasas"],["oscuridad","Oscuridad"],["sangre","Lluvia de sangre"]];
function msEnem(){
  return`<div class="row sb"><h2 style="margin:0">${L("Enemigos")}</h2><button class="btn small on" data-ms="enew">＋ ${L("Nuevo enemigo")}</button></div>
    <p class="hint">${L("Cada enemigo es una ficha completa, como la de un personaje: poses que son sus fases (cambian solas según la vida), zonas que brillan con rayos o fuego, capas, poderes, armas, dados y combate. Lo armás una vez y lo sumás a cualquier combate.")}</p>
    <div class="elist">${enemChars().slice().sort(byName).map(e=>`<div class="ecard"><span class="eimg sm" style="${e.th&&getImg(e.th)?`background-image:url(${getImg(e.th)})`:""}">${e.th&&getImg(e.th)?"":"👹"}</span><span style="flex:1;min-width:0"><b>${esc(e.n)}</b></span>
      <button class="btn small on" data-a="openChar" data-id="${e.id}">📖 ${L("Abrir ficha")}</button><button class="btn small" data-a="dupChar" data-id="${e.id}" aria-label="${L("Duplicar")}">⧉</button><button class="btn small danger" data-a="delChar" data-id="${e.id}">${ui.confirm===e.id?L("¿Seguro?"):"×"}</button></div>`).join("")||`<div class="empty">${L("Sin enemigos todavía.")}</div>`}</div>
    <label class="lbl" style="margin-top:10px">${L("Al mostrar a la mesa, la vida se ve como")}<select data-msalud>${opts([["nada",L("No se muestra")],["aprox",L("Aproximada (herido, muy herido…)")]],MS.salud)}</select></label>`;
}
/* mostrar a la mesa */
function msShow(cid){const m=document.getElementById("modal");m.onclick=m.oninput=m.onchange=null;ui.mshow=cid;ui.mshowImg=null;renderShow()}
function renderShow(){const c=MS.comb.find(x=>x.id===ui.mshow);const m=document.getElementById("modal");if(!c){m.innerHTML="";ui.mshow=null;return}
  const e=enemOf(c),f=faseOf(c),img=imgOf(c),changed=ui.mshowImg&&ui.mshowImg!==img;ui.mshowImg=img;
  m.innerHTML=`<div class="mshow ${e&&e.grande?"big":""} amb-${(e&&e.amb)||""}" data-ms="unshow">${img?`<img class="msimg ${changed?"phase":""}" src="${img}" alt="">`:""}<div class="ambfx"></div>
    <div class="mscap"><div class="msname">${esc(c.n)}</div>${f?`<div class="msfase">${esc(f.n)}</div>`:""}${MS.salud==="aprox"&&c.tipo==="enem"?`<div class="mshealth">${saludTxt(c)}</div>`:""}</div><span class="hint msclose">${L("Tocá para cerrar")}</span></div>`}
/* temporizador */
const TSTY=[["auto","Según ambientación"],["arena","Reloj de arena"],["bomba","Bomba"],["latido","Latido"],["vela","Vela"]];
function tStyle(){const s=MS.timer.estilo||"auto";if(s!=="auto")return s;const t=(C&&C.tema)||APP.tema||"medieval";return{scifi:"bomba",moderno:"bomba",terror:"latido",steampunk:"arena"}[t]||"arena"}
function msTimer(){const T=MS.timer;return`<h2 style="margin:0">${L("Temporizador de presión")}</h2><p class="hint">${L("\"Se cierra la puerta, ¿qué hacen?\" Elegí los segundos y mostrales la pantalla.")}</p>
  <div class="chips">${[10,15,30,45,60,90,120].map(s=>`<button class="chip ${+T.secs===s?"on":""}" data-ms="tsecs" data-v="${s}">${s>=60?(s/60)+" min":s+" s"}</button>`).join("")}</div>
  <label class="lbl inline">${L("Otro (segundos)")} <input type="number" min="3" data-mtsecs value="${T.secs}" style="width:6em"></label>
  <div class="chips">${TSTY.map(([k,n])=>`<button class="chip ${(T.estilo||"auto")===k?"on":""}" data-ms="tsty" data-v="${k}">${L(n)}</button>`).join("")}</div>
  <label class="lbl">${L("Mensaje en pantalla (opcional)")}<input data-mtmsg value="${esc(T.msg||"")}" placeholder="${L("¡La puerta se está cerrando!")}"></label>
  <button class="btn fight bigturn" data-ms="tstart">▶ ${L("Empezar")}</button>`}
let TMR=null;
function tStart(){const T=MS.timer,m=document.getElementById("modal");m.onclick=m.oninput=m.onchange=null;const total=Math.max(3,+T.secs||30);TMR={total,left:total,end:Date.now()+total*1000,paused:false,iv:null,last:-1};acx();tDraw();TMR.iv=setInterval(tTick,100)}
function tTick(){if(!TMR||TMR.paused)return;const left=Math.max(0,(TMR.end-Date.now())/1000);TMR.left=left;const s=Math.ceil(left);if(s!==TMR.last){TMR.last=s;if(s>0){tBeep(s<=5?1200:700,s<=5?.09:.04,s<=5?.35:.15);if(s<=5)vib(60)}}
  if(left<=0){clearInterval(TMR.iv);tBeep(220,.9,.6);setTimeout(()=>tBeep(180,.9,.6),350);vib([400,150,400,150,800])}tDraw()}
function tBeep(f,d,v){if(APP.mute)return;const ctx=acx();if(!ctx)return;try{const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=f;o.type=tStyle()==="latido"?"sine":"square";g.gain.setValueAtTime(v*.25,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+d);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+d)}catch(e){}}
function tDraw(){const m=document.getElementById("modal");if(!TMR)return;const st=tStyle(),p=TMR.left/TMR.total,s=Math.ceil(TMR.left),done=TMR.left<=0;
  const mm=String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");let vis="";
  if(st==="arena")vis=`<svg viewBox="0 0 120 200" class="tvis"><path d="M20 10h80M20 190h80" stroke="#c9a46a" stroke-width="8" stroke-linecap="round"/><path d="M28 14c0 50 30 60 30 86S28 136 28 186h64c0-50-30-60-30-86s30-36 30-86Z" fill="rgba(200,220,235,.12)" stroke="#c9a46a" stroke-width="3"/><clipPath id="sandTop"><path d="M28 14c0 50 30 60 30 86h4c0-26 30-36 30-86Z"/></clipPath><clipPath id="sandBot"><path d="M58 100c0 26-30 36-30 86h64c0-50-30-60-30-86Z"/></clipPath><rect clip-path="url(#sandTop)" x="0" y="${14+86*(1-p)}" width="120" height="${86*p}" fill="#e8c27a"/><rect clip-path="url(#sandBot)" x="0" y="${186-86*(1-p)}" width="120" height="${86*(1-p)}" fill="#e8c27a"/>${done?"":`<line x1="60" y1="100" x2="60" y2="186" stroke="#e8c27a" stroke-width="2" class="sandfall"/>`}</svg>`;
  else if(st==="bomba")vis=`<div class="tbomb ${s<=5&&!done?"hot":""}"><div class="led">${mm}</div><svg viewBox="0 0 220 60" class="wires"><path d="M10 10q60 40 200 0" stroke="#ff3b3b" stroke-width="4" fill="none"/><path d="M10 30q90 30 200 0" stroke="#3b8bff" stroke-width="4" fill="none"/><path d="M10 50q120 -20 200 0" stroke="#ffd84a" stroke-width="4" fill="none"/></svg></div>`;
  else if(st==="latido")vis=`<div class="theart" style="--sp:${Math.max(.35,1.2*p+.3)}s"><svg viewBox="0 0 64 60"><path d="M32 58 5 31A15 15 0 0 1 32 11a15 15 0 0 1 27 20Z" fill="#9e0b12"/></svg></div>`;
  else if(st==="vela")vis=`<svg viewBox="0 0 80 200" class="tvis"><rect x="26" y="${40+140*(1-p)}" width="28" height="${140*p+10}" rx="3" fill="#efe6d2"/>${done?`<path d="M40 ${40+140*(1-p)}q-6-12 0-24" stroke="#888" fill="none" class="smoke"/>`:`<g class="flame" style="transform-origin:40px ${40+140*(1-p)}px"><path d="M40 ${10+140*(1-p)}q12 16 0 30q-12-14 0-30Z" fill="#ffb02e"/></g>`}</svg>`;
  m.innerHTML=`<div class="tfull st-${st} ${done?"done":""} ${s<=5&&!done?"hurry":""}"><div class="tmsg">${esc(MS.timer.msg||"")}</div>${vis}${st!=="bomba"?`<div class="tnum">${done?L("¡Tiempo!"):mm}</div>`:done?`<div class="tnum boom">💥 ${L("¡Tiempo!")}</div>`:""}
    <div class="row tctl2">${done?`<button class="btn on" data-ms="tagain">↻ ${L("Otra vez")}</button>`:`<button class="btn" data-ms="tpause">${TMR.paused?"▶ "+L("Seguir"):"⏸ "+L("Pausa")}</button><button class="btn" data-ms="tadd">+10 s</button>`}<button class="btn" data-ms="tstop">✕ ${L("Cerrar")}</button></div></div>`}
/* cuaderno */
function msNotas(){const q=norm(ui.mnq||"");const list=MS.notas.filter(n=>!q||norm(n.t).includes(q)||norm(n.b).includes(q));
  return`<div class="row sb"><h2 style="margin:0">${L("Cuaderno del máster")}</h2><button class="btn small on" data-ms="nnew">＋ ${L("Nueva")}</button></div>
  <input type="search" data-mnq value="${esc(ui.mnq||"")}" placeholder="${L("Buscar en el cuaderno")}">
  ${list.map(n=>`<div class="card"><div class="row" style="flex-wrap:nowrap"><input data-mn="${n.id}|t" value="${esc(n.t)}" style="flex:1;font-family:var(--display)"><button class="btn small ghost" data-ms="ndel" data-id="${n.id}">${ui.mndel===n.id?L("¿Seguro?"):"×"}</button></div><textarea rows="5" data-mn="${n.id}|b" placeholder="${L("Trama, PNJs, botín, ideas…")}">${esc(n.b)}</textarea></div>`).join("")||`<div class="empty">${L("Sin notas todavía.")}</div>`}
  <p class="hint">${L("Para las notas compartidas con los personajes, los mapas y el calendario, usá los botones de arriba.")}</p>`}
(function(){
  const upd=()=>{saveMaster();render()};
  document.addEventListener("click",async e=>{const b=e.target.closest("[data-ms]");if(!b)return;const k=b.dataset.ms;if(k!=="unshow")e.preventDefault();e.stopPropagation();
    if(k==="modo"){APP.modo=b.dataset.v;DB.set("index",APP);if(isMaster()){await loadMaster();await migrateEnem();await encLoad();ui.screen="chars"}render();return}
    await loadMaster();
    const c=b.dataset.id&&MS.comb.find(x=>x.id===b.dataset.id);
    switch(k){
      case"tab":ui.mtab=b.dataset.v;ui.menem=null;render();return;
      case"dados":openTray();return;
      case"addpj":MS.comb.push({id:uid(),tipo:"pj",n:b.dataset.n||L("Jugador"),ini:""});upd();return;
      case"addenem":{const ec=await DB.get("c_"+b.dataset.id);if(!ec)return;ENC.set(ec.id,ec);const same=MS.comb.filter(x=>x.charId===ec.id).length;MS.comb.push({id:uid(),tipo:"enem",charId:ec.id,n:ec.nombre+(same?" "+(same+1):""),hp:+ec.hp.max||0,hpmax:+ec.hp.max||0,ca:ec.ca,ini:""});upd();return}
      case"cdel":{const i=MS.comb.indexOf(c);MS.comb.splice(i,1);if(MS.turno>=MS.comb.length)MS.turno=0;upd();return}
      case"sort":MS.comb.sort((a,b)=>(+b.ini||0)-(+a.ini||0));MS.turno=0;upd();return;
      case"rollall":MS.comb.forEach(x=>{if(x.tipo==="enem"){const en=enemOf(x);x.ini=rnd(20)+(en&&en.stats?modN((en.stats.find(s=>s.k==="DES")||{v:10}).v):0)}});MS.comb.sort((a,b)=>(+b.ini||0)-(+a.ini||0));MS.turno=0;toast(L("Iniciativa tirada y ordenada"));upd();return;
      case"next":{if(!MS.comb.length)return;let n=MS.turno,guard=0;do{n++;if(n>=MS.comb.length){n=0;MS.ronda++;MS.comb.forEach(x=>{x.legU=0;x.reaU=0});toast(L("Ronda {0}",MS.ronda))}guard++}while(guard<=MS.comb.length&&MS.comb[n].tipo==="enem"&&+MS.comb[n].hpmax&&MS.comb[n].hp<=0);
        MS.turno=n;const cur=MS.comb[n];if(cur&&cur.conds&&cur.conds.length){const ended=[];cur.conds.forEach(x=>{if(+x.r>0){x.r--;if(x.r===0)ended.push(x.n)}});cur.conds=cur.conds.filter(x=>!(x.r===0&&ended.includes(x.n)));if(ended.length)setTimeout(()=>toast(L("{0}: termina {1}",cur.n,ended.map(L).join(", "))),200)}if(cur&&cur.conc)setTimeout(()=>toast(L("{0} está concentrado",cur.n)),400);if(cur&&cur.tipo==="enem"){const en=enemOf(cur);if(en){cur.legU=cur.legU;}}vib(40);upd();return}
      case"hp":{const inp=document.querySelector(`[data-mhp="${c.id}"]`);const v=parseInt(inp&&inp.value)||1;const before=faseOf(c);c.hp=clamp(c.hp+(+b.dataset.v)*v,0,+c.hpmax||9999);const after=faseOf(c);
        if(after&&after!==before){toast(L("{0} pasa a: {1}",c.n,after.n));vib([200,100,200]);if(ui.mshow===c.id)renderShow()}if(c.hp<=0&&+c.hpmax)toast(L("{0} derrotado",c.n));upd();return}
      case"leg":{const i=+b.dataset.i;c.legU=i<(c.legU||0)?i:i+1;upd();return}
      case"reac":{const i=+b.dataset.i;c.reaU=i<(c.reaU||0)?i:i+1;upd();return}
      case"show":case"cfic":{await openChar(c.charId);if(!C)return;C.hp.act=c.hp;autoPhase();ui.mesaInst=c.id;ui.screen="char";ui.mesa=k==="show";if(k==="show")ui.mesaBar=false;render();return}
      case"unshow":ui.mshow=null;document.getElementById("modal").innerHTML="";return;
      case"clear":if(!ui.mclr){ui.mclr=true;render();setTimeout(()=>{ui.mclr=false},3000);return}MS.comb=[];MS.ronda=1;MS.turno=0;ui.mclr=false;upd();return;
      case"enew":newEnemy();return;
      case"eopen":ui.menem=b.dataset.id;ui.medel=false;render();return;
      case"eback":ui.menem=null;render();return;
      case"edel":{if(!ui.medel){ui.medel=true;render();return}const en=MS.enem.find(x=>x.id===b.dataset.id);[en.img,...(en.fases||[]).map(f=>f.img)].forEach(x=>x&&dropImg(x));MS.enem=MS.enem.filter(x=>x!==en);ui.menem=null;ui.medel=false;upd();return}
      case"fadd":{const en=MS.enem.find(x=>x.id===b.dataset.id);en.fases=en.fases||[];en.fases.push({id:uid(),n:L("Fase {0}",en.fases.length+2),umbral:Math.round((+en.hpmax||30)/2),img:"",nota:""});upd();return}
      case"fdel":{const en=MS.enem.find(x=>x.id===b.dataset.id);const f=en.fases.find(x=>x.id===b.dataset.f);if(f&&f.img)dropImg(f.img);en.fases=en.fases.filter(x=>x!==f);upd();return}
      case"tsecs":MS.timer.secs=+b.dataset.v;upd();return;
      case"tsty":MS.timer.estilo=b.dataset.v;upd();return;
      case"tstart":case"tagain":if(TMR)clearInterval(TMR.iv);tStart();return;
      case"tpause":if(TMR.paused){TMR.end=Date.now()+TMR.left*1000;TMR.paused=false}else TMR.paused=true;tDraw();return;
      case"tadd":TMR.end+=10000;TMR.total+=10;tTick();return;
      case"tstop":if(TMR)clearInterval(TMR.iv);TMR=null;document.getElementById("modal").innerHTML="";return;
      case"nnew":MS.notas.unshift({id:uid(),t:L("Nota nueva"),b:""});upd();return;
      case"ndel":if(ui.mndel!==b.dataset.id){ui.mndel=b.dataset.id;render();return}MS.notas=MS.notas.filter(x=>x.id!==b.dataset.id);ui.mndel=null;upd();return;
    }
  },true);
  document.addEventListener("change",async e=>{const t=e.target;if(!MS)return;const d=t.dataset;let hit=true;
    if(d.mc){const[id,f]=d.mc.split("|");const c=MS.comb.find(x=>x.id===id);if(c)c[f]=f==="ini"?(t.value===""?"":+t.value):t.value}
    else if(d.me){const[id,f]=d.me.split("|");const en=MS.enem.find(x=>x.id===id);if(en){en[f]=t.type==="checkbox"?t.checked:t.type==="number"?+t.value:t.value;if(f==="n"||f==="hpmax"||f==="ca")MS.comb.forEach(c=>{if(c.enemId===id){if(f==="hpmax"){const was=c.hp===c.hpmax;c.hpmax=+t.value;if(was)c.hp=c.hpmax}if(f==="ca")c.ca=t.value}})}}
    else if(d.mf){const[id,fid,f]=d.mf.split("|");const en=MS.enem.find(x=>x.id===id);const fa=en&&en.fases.find(x=>x.id===fid);if(fa)fa[f]=f==="umbral"?+t.value:t.value}
    else if(d.mn){const[id,f]=d.mn.split("|");const n=MS.notas.find(x=>x.id===id);if(n)n[f]=t.value}
    else if(t.matches("[data-msalud]"))MS.salud=t.value;
    else if(t.matches("[data-mtsecs]"))MS.timer.secs=Math.max(3,+t.value||30);
    else if(t.matches("[data-mtmsg]"))MS.timer.msg=t.value;
    else if(d.meimg||d.mfimg){const f=t.files&&t.files[0];if(!f)return;try{const key=await fileToKey(f,1400,true);if(d.meimg){const en=MS.enem.find(x=>x.id===d.meimg);if(en.img)dropImg(en.img);en.img=key}else{const[id,fid]=d.mfimg.split("|");const fa=MS.enem.find(x=>x.id===id).fases.find(x=>x.id===fid);if(fa.img)dropImg(fa.img);fa.img=key}toast(L("Imagen cargada"))}catch(err){toast(L("No se pudo leer la imagen"))}}
    else hit=false;
    if(hit){saveMaster();if(!t.matches("textarea"))render()}});
  document.addEventListener("input",e=>{if(e.target.matches("[data-mnq]")){ui.mnq=e.target.value;clearTimeout(e.target._t);e.target._t=setTimeout(()=>{render();const i=document.querySelector("[data-mnq]");if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length)}},300)}});
})();
