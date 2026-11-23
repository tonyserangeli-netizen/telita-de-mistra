/* ============ sonidos: grabar, recortar y asignar ============ */
const SEV=[["tirada","Tirar el d20"],["crit","20 natural (crítico)"],["pifia","1 natural (pifia)"],["dano","Recibir daño"],["cura","Curarse"],["turno","Pasar de turno"],["combate","Entrar en combate"],["descanso","Descansar"],["recarga","Recargar un arma"],["pagina","Pasar página del grimorio"],["agitar","Agitar el cubilete"],["dados","Dados cayendo en la mesa"]];
let ACX=null;const SBUF=new Map();
function acx(){try{if(!ACX){const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;ACX=new A()}if(ACX.state==="suspended")ACX.resume()}catch(e){return null}return ACX}
async function sndBuf(k){if(SBUF.has(k))return SBUF.get(k);let d=getImg(k);if(!d){d=await DB.get(k);if(d)IMG.set(k,d)}if(!d)return null;
  const ab=await(await fetch(d)).arrayBuffer();const ctx=acx();if(!ctx)return null;
  const b=await new Promise((res,rej)=>{const p=ctx.decodeAudioData(ab,res,rej);if(p&&p.then)p.then(res,rej)});SBUF.set(k,b);return b}
let SPLAY=null;
async function playSnd(id,from,to){
  if(!id)return null;const s=(C.sonidos||[]).find(x=>x.id===id);if(!s)return null;const ctx=acx();if(!ctx)return null;
  try{const b=await sndBuf(s.k);if(!b)return null;const src=ctx.createBufferSource();src.buffer=b;const g=ctx.createGain();g.gain.value=s.vol==null?1:+s.vol;src.connect(g);g.connect(ctx.destination);
    const ini=from!=null?from:(+s.ini||0),fin=to!=null?to:(+s.fin||b.duration);src.start(0,ini,Math.max(.05,fin-ini));SPLAY={src,t0:ctx.currentTime,ini,fin};return src}
  catch(e){toast(L("Este celular no puede reproducir ese audio"));return null}
}
function sfx(o,ev){if(APP.mute||!C)return;const id=(o&&o.snd)||(ev&&C.sndEv&&C.sndEv[ev]);if(id)playSnd(id)}
function sndSel(ref,f,lbl){f=f||"snd";const r=resolve(ref);const v=(r&&r.obj&&r.obj[f])||"";
  return`<div class="lbl">${L(lbl||"Sonido")}<span class="row sndrow"><select ${R(ref,f)}>${opts((C.sonidos||[]).map(s=>[s.id,s.n]),v,L("Ninguno"))}</select>${v?`<button class="btn small" data-snd="play" data-id="${v}" aria-label="${L("Escuchar")}">▶</button>`:""}<button class="btn small" data-snd="open" data-for="${ref}|${f}" title="${L("Grabar o subir un sonido")}">🎙</button></span></div>`}

/* ---- análisis ---- */
function peaks(b,n){const d=b.getChannelData(0),step=Math.max(1,Math.floor(d.length/n)),out=[];for(let i=0;i<n;i++){let m=0;for(let j=i*step;j<Math.min(d.length,(i+1)*step);j+=4){const v=Math.abs(d[j]);if(v>m)m=v}out.push(m)}return out}
function autoTrim(b){const d=b.getChannelData(0),sr=b.sampleRate;let mx=0;for(let i=0;i<d.length;i+=8)mx=Math.max(mx,Math.abs(d[i]));const th=Math.max(.02,mx*.12);
  let a=0,z=d.length-1;while(a<d.length&&Math.abs(d[a])<th)a++;while(z>a&&Math.abs(d[z])<th)z--;
  return{ini:Math.max(0,a/sr-.04),fin:Math.min(b.duration,z/sr+.12)}}

/* ---- grabación ---- */
let REC=null;
async function recStart(){
  if(!navigator.mediaDevices||!window.MediaRecorder){toast(L("Este navegador no deja grabar. Subí un archivo de audio."));return}
  acx();
  try{const st=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
    const mr=new MediaRecorder(st);const ch=[];mr.ondataavailable=e=>{if(e.data&&e.data.size)ch.push(e.data)};
    mr.onstop=async()=>{st.getTracks().forEach(t=>t.stop());clearInterval(REC&&REC.iv);const bl=new Blob(ch,{type:mr.mimeType||"audio/mp4"});REC=null;await addSound(bl,L("Grabación {0}",(C.sonidos||[]).length+1));};
    REC={mr,t:Date.now(),iv:setInterval(()=>{const el=document.getElementById("rec-t");if(el)el.textContent=((Date.now()-REC.t)/1000).toFixed(1)+" s";if(Date.now()-REC.t>30000)recStop()},100)};
    mr.start();renderSnd()}
  catch(e){toast(L("No se pudo usar el micrófono. Revisá el permiso en los ajustes del celular."))}
}
function recStop(){if(REC&&REC.mr.state!=="inactive")REC.mr.stop()}
async function addSound(blob,name){
  if(!blob||!blob.size){toast(L("No se grabó nada"));renderSnd();return}
  if(blob.size>4e6){toast(L("El audio es muy largo (máximo unos 4 MB)"));return}
  const url=await new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.onerror=rej;fr.readAsDataURL(blob)});
  const k=await putImg(url);let ini=0,fin=0;
  try{const b=await sndBuf(k);const t=autoTrim(b);ini=t.ini;fin=t.fin}catch(e){await DB.del(k);IMG.delete(k);toast(L("No se pudo leer ese audio"));renderSnd();return}
  C.sonidos=C.sonidos||[];const s={id:uid(),n:name,k,ini,fin,vol:1};C.sonidos.push(s);
  if(ui.sndFor){const[ref,f]=ui.sndFor.split("|");const r=resolve(ref);if(r&&r.obj){r.obj[f]=s.id}ui.sndFor=null}
  ui.sndEdit=s.id;saveSoon();render();renderSnd();
}

/* ---- ventana ---- */
function sndEditor(s){
  return`<div class="sedit"><div class="row" style="flex-wrap:nowrap"><input ${R(`C.sonidos.${s.id}`,"n")} value="${esc(s.n)}" style="flex:1"><button class="btn small" data-snd="done">${L("Listo")}</button></div>
    <canvas id="wave" class="wave" width="640" height="110"></canvas>
    <p class="hint">${L("Arrastrá las dos rayas doradas para dejar solo la parte que querés.")}</p>
    <div class="row"><button class="btn on" data-snd="prev">▶ ${L("Escuchar recorte")}</button><button class="btn small" data-snd="all">${L("Escuchar todo")}</button><button class="btn small" data-snd="auto">${L("Cortar silencios")}</button></div>
    <div class="grid2"><label class="lbl">${L("Empieza (seg)")}<input type="number" step="0.05" min="0" data-sf="ini" value="${(+s.ini||0).toFixed(2)}"></label><label class="lbl">${L("Termina (seg)")}<input type="number" step="0.05" min="0" data-sf="fin" value="${(+s.fin||0).toFixed(2)}"></label>
    <label class="lbl">${L("Volumen")}<input type="range" min="0" max="2" step="0.05" data-sf="vol" value="${s.vol==null?1:s.vol}"></label></div></div>`;
}
function renderSnd(){
  const m=document.getElementById("modal");if(!m.querySelector("[data-sndm]")&&m.innerHTML.trim()&&!ui.sndOpen)return;
  C.sonidos=C.sonidos||[];C.sndEv=C.sndEv||{};const ed=ui.sndEdit&&C.sonidos.find(x=>x.id===ui.sndEdit);
  const forTxt=ui.sndFor?(()=>{const r=resolve(ui.sndFor.split("|")[0]);return r&&r.obj?L("Lo que grabes o subas se asigna a: {0}",r.obj.n||C.nombre):""})():"";
  m.innerHTML=`<div class="dsheet" data-sndm><div class="dpanel snd"><div class="row sb"><h2 style="margin:0">${L("Sonidos de {0}",esc(C.nombre))}</h2><button class="btn small" data-snd="close">✕</button></div>
    ${forTxt?`<p class="tag" style="display:inline-block">${esc(forTxt)}</p>`:""}
    <div class="row">${REC?`<button class="btn rec on" data-snd="stop">■ ${L("Parar")} <span id="rec-t">0.0 s</span></button>`:`<button class="btn rec" data-snd="rec">● ${L("Grabar")}</button>`}
      <label class="btn">${L("Subir audio")}<input type="file" accept="audio/*,video/*" data-sndup hidden></label>
      <label class="row hint" style="margin-left:auto;gap:6px"><input type="checkbox" data-sndmute ${APP.mute?"":"checked"} style="width:auto"> ${L("Sonidos activados")}</label></div>
    ${ed?sndEditor(ed):""}
    <h3>${L("Biblioteca")}</h3>
    ${C.sonidos.map(s=>`<div class="srow ${ed&&ed.id===s.id?"on":""}"><button class="btn small" data-snd="play" data-id="${s.id}" aria-label="${L("Escuchar")}">▶</button><span class="sn">${esc(s.n)}</span><span class="hint">${((+s.fin||0)-(+s.ini||0)).toFixed(1)} s</span>
      ${ui.sndFor?`<button class="btn small" data-snd="assign" data-id="${s.id}">${L("Usar este")}</button>`:""}<button class="btn small" data-snd="edit" data-id="${s.id}">${L("Recortar")}</button><button class="btn small danger" data-snd="del" data-id="${s.id}">×</button></div>`).join("")||`<div class="empty">${L("Todavía no hay sonidos. Grabá uno o subí un audio.")}</div>`}
    <h3>${L("Momentos")}</h3><p class="hint">${L("Sonidos que suenan solos en estos momentos. Para armas, munición, poderes, ítems mágicos e invocaciones, elegí el sonido al editar cada uno (botón 🎙).")}</p>
    <div class="grid2">${SEV.map(([k,n])=>`<label class="lbl">${L(n)}<select ${R("C.sndEv",k)}>${opts(C.sonidos.map(s=>[s.id,s.n]),C.sndEv[k]||"",L("Ninguno"))}</select></label>`).join("")}</div></div></div>`;
  if(ed)drawWave(ed);
}
function openSnd(forRef){ui.sndOpen=true;ui.sndFor=forRef||null;ui.sndEdit=null;const m=document.getElementById("modal");m.innerHTML="";m.onclick=m.oninput=m.onchange=null;renderSnd()}
let WV=null;
async function drawWave(s){
  const cv=document.getElementById("wave");if(!cv)return;let b;try{b=await sndBuf(s.k)}catch(e){return}if(!b)return;
  const W=cv.width,H=cv.height,pk=peaks(b,W/2),ctx=cv.getContext("2d"),dur=b.duration;if(!(+s.fin))s.fin=dur;
  WV={s,b,cv,dur};
  const draw=(play)=>{ctx.clearRect(0,0,W,H);const x1=s.ini/dur*W,x2=s.fin/dur*W;
    ctx.fillStyle="rgba(217,168,69,.12)";ctx.fillRect(x1,0,x2-x1,H);
    pk.forEach((v,i)=>{const x=i*2,h=Math.max(1,v*H*.9);ctx.fillStyle=(x>=x1&&x<=x2)?"#ebe2cf":"#5a5366";ctx.fillRect(x,(H-h)/2,1.5,h)});
    ctx.fillStyle="#d9a845";[x1,x2].forEach(x=>{ctx.fillRect(x-1.5,0,3,H);ctx.beginPath();ctx.arc(x,H-8,8,0,7);ctx.fill()});
    if(play!=null){ctx.fillStyle="#4fb3ff";ctx.fillRect(play/dur*W,0,2,H)}};
  WV.draw=draw;draw();
  let drag=null;const pos=e=>{const r=cv.getBoundingClientRect();return clamp((e.clientX-r.left)/r.width,0,1)*dur};
  cv.onpointerdown=e=>{const t=pos(e);drag=Math.abs(t-s.ini)<Math.abs(t-s.fin)?"ini":"fin";cv.setPointerCapture(e.pointerId);move(e)};
  const move=e=>{if(!drag)return;let t=pos(e);if(drag==="ini")s.ini=Math.min(t,s.fin-.05);else s.fin=Math.max(t,s.ini+.05);s.ini=Math.max(0,s.ini);s.fin=Math.min(dur,s.fin);draw();
    const a=document.querySelector('[data-sf="ini"]'),z=document.querySelector('[data-sf="fin"]');if(a)a.value=s.ini.toFixed(2);if(z)z.value=s.fin.toFixed(2)};
  cv.onpointermove=move;cv.onpointerup=cv.onpointercancel=()=>{if(drag){drag=null;saveSoon()}};
}
function playhead(){if(!WV||!SPLAY||!ACX)return;const t=SPLAY.ini+(ACX.currentTime-SPLAY.t0);if(t>SPLAY.fin||!document.getElementById("wave")){WV.draw&&WV.draw();return}WV.draw(t);requestAnimationFrame(playhead)}
(function(){
  document.addEventListener("click",async e=>{const b=e.target.closest("[data-snd]");if(!b)return;e.preventDefault();e.stopPropagation();const k=b.dataset.snd,id=b.dataset.id;
    if(k==="play"){acx();playSnd(id);return}
    if(k==="open"){const back=b.closest("[data-grim]")?"grim":null;openSnd(b.dataset.for);ui.sndBack=back;return}
    if(k==="close"){recStop();ui.sndOpen=false;ui.sndFor=null;document.getElementById("modal").innerHTML="";render();if(ui.sndBack==="grim"){ui.sndBack=null;openGrim(false)}return}
    if(k==="rec"){recStart();return}
    if(k==="stop"){recStop();return}
    if(k==="edit"){ui.sndEdit=id;renderSnd();return}
    if(k==="done"){ui.sndEdit=null;saveSoon();render();renderSnd();return}
    if(k==="assign"){const[ref,f]=ui.sndFor.split("|");const r=resolve(ref);if(r&&r.obj){snap();r.obj[f]=id;saveSoon()}ui.sndFor=null;ui.sndOpen=false;document.getElementById("modal").innerHTML="";render();toast(L("Sonido asignado"));if(ui.sndBack==="grim"){ui.sndBack=null;openGrim(false)}return}
    if(k==="del"){const s=C.sonidos.find(x=>x.id===id);if(!s)return;if(ui.sndDel!==id){ui.sndDel=id;b.textContent=L("¿Borrar?");setTimeout(()=>{ui.sndDel=null},3000);return}
      snap();C.sonidos=C.sonidos.filter(x=>x.id!==id);SBUF.delete(s.k);dropImg(s.k);if(ui.sndEdit===id)ui.sndEdit=null;saveSoon();render();renderSnd();return}
    const s=WV&&WV.s;if(!s)return;
    if(k==="prev"){acx();await playSnd(s.id);playhead();return}
    if(k==="all"){acx();await playSnd(s.id,0,WV.dur);playhead();return}
    if(k==="auto"){const t=autoTrim(WV.b);s.ini=t.ini;s.fin=t.fin;saveSoon();renderSnd();return}
  },true);
  document.addEventListener("change",e=>{const t=e.target;
    if(t.matches("[data-sndup]")){const f=t.files&&t.files[0];if(f)addSound(f,(f.name||L("Audio")).replace(/\.[^.]+$/,"").slice(0,40));return}
    if(t.matches("[data-sndmute]")){APP.mute=!t.checked;DB.set("index",APP);return}
    if(t.matches("[data-sf]")&&WV){const s=WV.s,f=t.dataset.sf;let v=parseFloat(t.value)||0;
      if(f==="ini")s.ini=clamp(v,0,s.fin-.05);if(f==="fin")s.fin=clamp(v,s.ini+.05,WV.dur);if(f==="vol")s.vol=clamp(v,0,2);saveSoon();WV.draw&&WV.draw()}});
})();
