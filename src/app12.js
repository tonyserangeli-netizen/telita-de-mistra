/* ============ cuadros personalizados: cada jugador arma sus mecánicas ============ */
const BTIPOS=[["contador","Contador"],["activable","Activable por turnos"],["transformacion","Transformación"],["futuro","Efecto retrasado"],["tabla","Tabla aleatoria"],["tirada","Tirada"],["texto","Texto"],["preparada","Acción preparada"]];
const BPLANT=[
  ["vacio","Cuadro vacío",()=>({n:L("Cuadro nuevo"),bl:[]})],
  ["fragmentos","Contador de fragmentos",()=>({n:L("Fragmentos"),bl:[{t:"contador",n:L("Fragmentos absorbidos"),act:0,max:5,paso:1},{t:"tirada",n:L("Salvación contra la locura"),f:"1d20"},{t:"texto",n:L("Qué pasa"),d:L("Escribí acá qué hace cada fragmento.")}]})],
  ["sobrecarga","Sobrecarga y agotamiento",()=>{const a=uid(),b=uid();return{n:L("Sobrecarga"),bl:[{id:a,t:"activable",n:L("Sobrecarga"),d:L("Magia sin límite."),dur:3,luego:b},{id:b,t:"activable",n:L("Agotamiento"),d:L("No puede usar magia."),dur:2}]}}],
  ["transformacion","Transformación",()=>({n:L("Transformación"),bl:[{t:"transformacion",n:L("Forma de lobo"),d:L("Elegí a qué pose cambia y qué capas o zonas se prenden."),dur:0}]})],
  ["futuro","Hechizo futuro",()=>({n:L("Hechizo futuro"),bl:[{t:"futuro",n:L("Hechizos en espera"),dado:"1d4",secreto:true,cola:[]}]})],
  ["temporal","Hechizo temporal",()=>({n:L("Hechizo temporal"),bl:[{t:"activable",n:L("Hechizo con duración"),d:L("Dura los turnos que pongas y se apaga solo. Podés vincularle una zona o capa que brille."),dur:10}]})],
  ["preparada","Acción preparada",()=>({n:L("Acción preparada"),bl:[{t:"preparada",n:L("Preparar acción"),disp:"",acc:""}]})],
  ["tabla","Tabla d100",()=>({n:L("Magia del caos"),bl:[{t:"tabla",n:L("Tabla de magia del caos"),dado:"1d100",filas:L("1-10: Escribí el efecto\n11-20: Otro efecto\n21-100: …")}]})],
];
const LUGARES=()=>[["combate",L("Pantalla de combate")],["personaje",L("Debajo del personaje")],["poderes",L("Poderes")],["armas",L("Armas")],["cuerpo",L("Cuerpo")],["hoja",L("Hoja")],...(C.pestanas||[]).map(p=>[p.id,L("Pestaña: {0}",p.n)])];
const cRef=(c,b)=>`C.cuadros.${c.id}`+(b?`.bl.${b.id}`:"");
function cuadrosEn(lugar){const ok=new Set(LUGARES().map(x=>x[0]));return(C.cuadros||[]).filter(c=>{const d=ok.has(c.donde)?c.donde:"combate";return d===lugar})}
function cuadrosHTML(lugar,addBtn){
  const cs=cuadrosEn(lugar);
  const list=cs.map(cuadroHTML).join("");
  const add=ui.edit||addBtn?`<div class="cuadadd"><span class="hint">${L("Agregar un cuadro propio:")}</span><div class="chips">${BPLANT.map(([k,n])=>`<button class="chip add" data-cx="new" data-v="${k}" data-l="${lugar}">＋ ${L(n)}</button>`).join("")}</div></div>`:"";
  return list+add;
}
function cuadroHTML(c){
  const ref=cRef(c);
  if(ui.edit)return`<div class="cuad edit" style="--cc:${c.c||"var(--gold)"}"><div class="row" style="flex-wrap:nowrap"><input ${R(ref,"n")} value="${esc(c.n)}" style="flex:1" aria-label="${L("Nombre del cuadro")}"><input type="color" ${R(ref,"c")} value="${c.c||"#d9a845"}" aria-label="${L("Color")}"></div>
    <label class="lbl">${L("Dónde se muestra")}<select ${R(ref,"donde")}>${opts(LUGARES(),c.donde||"combate")}</select></label>
    ${(c.bl||[]).map((b,i)=>blEdit(c,b,i)).join("")}
    <div class="chips">${BTIPOS.map(([k,n])=>`<button class="chip add" data-cx="addb" data-id="${c.id}" data-v="${k}">＋ ${L(n)}</button>`).join("")}</div>
    <div class="row"><button class="btn small" data-cx="up" data-id="${c.id}">↑</button><button class="btn small" data-cx="down" data-id="${c.id}">↓</button><button class="btn small danger" data-cx="del" data-id="${c.id}">${ui.cdel===c.id?L("¿Seguro? Tocá otra vez"):L("Borrar cuadro")}</button></div></div>`;
  return`<div class="cuad" style="--cc:${c.c||"var(--gold)"}"><h3>${esc(c.n)}</h3>${(c.bl||[]).map(b=>blView(c,b)).join("")||`<p class="hint">${L("Vacío. Tocá Editar para agregarle cosas.")}</p>`}</div>`;
}
function blEdit(c,b,i){
  const r=cRef(c,b),T=(BTIPOS.find(x=>x[0]===b.t)||[0,""])[1];
  const others=(c.bl||[]).filter(x=>x.id!==b.id&&(x.t==="activable"||x.t==="transformacion")).map(x=>[x.id,x.n]);
  let f="";
  if(b.t==="contador")f=`<div class="grid2"><label class="lbl">${L("Valor")}<input type="number" ${R(r,"act","n")} value="${b.act}"></label><label class="lbl">${L("Máximo (0 = sin tope)")}<input type="number" min="0" ${R(r,"max","n")} value="${b.max}"></label><label class="lbl">${L("Suma o resta de a")}<input type="number" min="1" ${R(r,"paso","n")} value="${b.paso||1}"></label></div>`;
  if(b.t==="activable"||b.t==="transformacion")f=`<textarea ${R(r,"d")} placeholder="${L("Qué hace")}">${esc(b.d||"")}</textarea>
    <div class="grid2"><label class="lbl">${L("Dura (turnos, 0 = hasta apagarlo)")}<input type="number" min="0" ${R(r,"dur","n")} value="${b.dur||0}"></label>
    <label class="lbl">${L("Al terminar, activa")}<select ${R(r,"luego")}>${opts(others,b.luego||"",L("Nada"))}</select></label>
    ${b.t==="transformacion"?`<label class="lbl">${L("Cambia a la pose")}<select ${R(r,"pose")}>${opts(C.poses.map(p=>[p.id,p.n]),b.pose||"",L("No cambia"))}</select></label>`:""}
    <label class="lbl">${L("Enciende la zona o capa")}<select ${R(r,"efecto")}>${opts(linkOpts(),b.efecto||"",L("Ninguna"))}</select></label>
    ${b.t==="transformacion"?`<label class="lbl">${L("Enciende otra zona o capa")}<select ${R(r,"efecto2")}>${opts(linkOpts(),b.efecto2||"",L("Ninguna"))}</select></label>`:""}</div>${sndSel(r,"snd","Sonido al activar")}`;
  if(b.t==="futuro")f=`<div class="grid2"><label class="lbl">${L("Turnos que tarda (dado o número)")}<input ${R(r,"dado")} value="${esc(b.dado||"1d4")}"></label></div><label class="row hint" style="gap:6px"><input type="checkbox" ${R(r,"secreto","b")} ${b.secreto?"checked":""} style="width:auto"> ${L("Secreto: no mostrar el nombre ni los turnos en pantalla")}</label>${sndSel(r,"snd","Sonido cuando se activa")}`;
  if(b.t==="tabla")f=`<label class="lbl">${L("Dado")}<input ${R(r,"dado")} value="${esc(b.dado||"1d100")}"></label><label class="lbl">${L("Resultados (uno por renglón: 1-5: efecto)")}<textarea rows="7" ${R(r,"filas")}>${esc(b.filas||"")}</textarea></label>`;
  if(b.t==="tirada")f=`<label class="lbl">${L("Fórmula (ej.: 2d6+3)")}<input ${R(r,"f")} value="${esc(b.f||"1d20")}"></label>`;
  if(b.t==="texto")f=`<textarea rows="3" ${R(r,"d")}>${esc(b.d||"")}</textarea>`;
  if(b.t==="preparada")f=`<p class="hint">${L("En pantalla escribís el disparador (\"cuando el orco cruce la puerta\") y la acción. Dura hasta tu próximo turno.")}</p>${sndSel(r,"snd","Sonido cuando se cumple")}`;
  return`<div class="blk edit"><div class="row sb"><span class="tag">${L(T)}</span><span class="row"><button class="btn small" data-cx="bup" data-id="${c.id}" data-b="${b.id}" aria-label="${L("Subir")}">↑</button><button class="btn small danger" data-cx="bdel" data-id="${c.id}" data-b="${b.id}" aria-label="${L("Borrar")}">${ui.cdel===b.id?L("¿Seguro?"):"×"}</button></span></div>
    <input ${R(r,"n")} value="${esc(b.n||"")}" placeholder="${L("Nombre")}">${f}</div>`;
}
function blView(c,b){
  const id=`data-id="${c.id}" data-b="${b.id}"`;
  if(b.t==="contador"){const mx=+b.max||0,pct=mx?clamp(b.act/mx,0,1):0;
    return`<div class="blk"><div class="row sb"><b>${favStar(cRef(c,b))}${esc(b.n)}</b><span class="row"><button class="btn small" data-cx="cnt" ${id} data-v="-1" aria-label="${L("Restar")}">−</button><span class="cbig">${b.act}${mx?`<small>/${mx}</small>`:""}</span><button class="btn small" data-cx="cnt" ${id} data-v="1" aria-label="${L("Sumar")}">+</button></span></div>${mx?`<div class="meter"><i style="width:${pct*100}%;background:var(--cc)"></i></div>`:""}</div>`}
  if(b.t==="activable"||b.t==="transformacion"){const on=!!b.on;
    return`<div class="blk act ${on?"on":""}"><div class="row sb"><span>${favStar(cRef(c,b))}<b>${esc(b.n)}</b>${on&&+b.left>0?` <span class="tag">${L("{0} turnos",b.left)}</span>`:""}</span><button class="use ${on?"on":""}" data-cx="act" ${id} aria-pressed="${on}">${on?L("Apagar"):b.t==="transformacion"?L("Transformarse"):L("Activar")}</button></div>${b.d?`<div class="d">${esc(b.d)}</div>`:""}</div>`}
  if(b.t==="futuro"){const sh=ui.fut&&ui.fut[b.id];
    return`<div class="blk"><b>${esc(b.n)}</b><div class="row" style="flex-wrap:nowrap;margin-top:4px"><input data-futq="${b.id}" placeholder="${L("¿Qué hechizo o efecto?")}" style="flex:1"><button class="btn small on" data-cx="fut" ${id}>${L("Programar")}</button></div>
      ${(b.cola||[]).length?`<ul class="fcola">${b.cola.map(q=>`<li>${b.secreto&&!sh?`<span>✦ ${L("Efecto secreto")}</span><span class="hint">???</span>`:`<span>${esc(q.q)}</span><span class="tag">${L("en {0} turnos",q.left)}</span>`}<button class="btn small ghost" data-cx="futdel" ${id} data-q="${q.id}" aria-label="${L("Cancelar")}">×</button></li>`).join("")}</ul>
      ${b.secreto?`<button class="btn small ghost" data-cx="futver" ${id}>${sh?L("Ocultar"):"👁 "+L("Ver (solo vos)")}</button>`:""}`:""}</div>`}
  if(b.t==="tabla"){const res=ui.tres&&ui.tres[b.id];
    return`<div class="blk"><b>${favStar(cRef(c,b))}${esc(b.n)}</b><div class="row" style="flex-wrap:nowrap;margin-top:4px"><button class="btn small on" data-cx="tab" ${id}>🎲 ${L("Tirar {0}",esc(b.dado||"1d100"))}</button><input type="number" inputmode="numeric" data-tabq="${b.id}" placeholder="${L("o poné tu dado")}" style="flex:1;min-width:0"><button class="btn small" data-cx="tabv" ${id}>${L("Ver")}</button></div>${res?`<div class="tres"><span class="cbig">${res.n}</span> ${esc(res.t)}</div>`:""}</div>`}
  if(b.t==="tirada")return`<div class="blk"><div class="row sb"><b>${favStar(cRef(c,b))}${esc(b.n)}</b><button class="btn small on" data-cx="roll" ${id}>🎲 ${esc(b.f||"1d20")}</button></div>${ui.tres&&ui.tres[b.id]?`<div class="tres"><span class="cbig">${ui.tres[b.id].n}</span> ${esc(ui.tres[b.id].t||"")}</div>`:""}</div>`;
  if(b.t==="preparada"){if(b.armed)return`<div class="blk act on"><b>⏳ ${esc(b.n)}</b><div class="d">${L("Cuando")}: <b>${esc(b.disp||"—")}</b><br>${L("Hago")}: <b>${esc(b.acc||"—")}</b></div><div class="row"><button class="use on" data-cx="prepGo" ${id}>${L("¡Se cumplió!")}</button><button class="btn small ghost" data-cx="prepNo" ${id}>${L("Cancelar")}</button></div></div>`;
    return`<div class="blk"><b>${esc(b.n)}</b><input data-pdisp="${b.id}" placeholder="${L("Cuando… (el disparador)")}" value="${esc(b.disp||"")}"><input data-pacc="${b.id}" placeholder="${L("Hago… (la acción o el conjuro)")}" value="${esc(b.acc||"")}"><button class="btn small on" data-cx="prepArm" ${id}>${L("Preparar")}</button></div>`}
  if(b.t==="texto")return`<div class="blk"><b>${esc(b.n||"")}</b><div class="d" style="white-space:pre-wrap">${esc(b.d||"")}</div></div>`;
  return"";
}
function rollF(f){f=String(f||"").replace(/\s/g,"");let tot=0;const parts=f.match(/[+-]?[^+-]+/g)||[];
  for(const p of parts){const s=p[0]==="-"?-1:1,q=p.replace(/^[+-]/,"");const m=q.match(/^(\d*)d(\d+)$/i);if(m){const n=+m[1]||1;for(let i=0;i<n;i++)tot+=s*rnd(+m[2])}else tot+=s*(parseInt(q)||0)}return tot}
function tablaFind(b,n){for(const l of String(b.filas||"").split("\n")){const m=l.match(/^\s*(\d+)\s*(?:[-–a]\s*(\d+))?\s*[:.)-]\s*(.*)$/);if(m){const a=+m[1],z=m[2]?+m[2]:a;if(n>=a&&n<=z)return m[3]}}return L("No hay nada para ese número en la tabla.")}
/* activar / apagar */
function blFind(id){for(const c of C.cuadros||[])for(const b of c.bl||[])if(b.id===id)return{c,b};return null}
function blOn(b,on){
  if(on){b.on=true;b.left=+b.dur||0;if(b.t==="transformacion"&&b.pose){b.prev=C.pose;C.pose=b.pose}
    [b.efecto,b.efecto2].forEach(x=>{if(x){const e=linkFind(x);if(e){e.on=true;e.left=+b.dur||0}}});sfx(b);log(L("Activó {0}",b.n))}
  else{b.on=false;b.left=0;if(b.t==="transformacion"&&b.prev){if(C.poses.some(p=>p.id===b.prev))C.pose=b.prev;b.prev=""}
    [b.efecto,b.efecto2].forEach(x=>{if(x){const e=linkFind(x);if(e){e.on=false;e.left=0}}})}
}
function cuadrosTurn(off){
  const fired=[],pend=[];
  (C.cuadros||[]).forEach(c=>(c.bl||[]).forEach(b=>{
    if((b.t==="activable"||b.t==="transformacion")&&b.on&&+b.left>0){b.left--;if(b.left===0){blOn(b,false);off.push(b.n);if(b.luego)pend.push(b.luego)}}
    if(b.t==="preparada"&&b.armed){b.armed=false;off.push(L("Acción preparada: {0}",b.acc||b.n))}
    if(b.t==="futuro"&&(b.cola||[]).length){b.cola.forEach(q=>q.left--);const now=b.cola.filter(q=>q.left<=0);b.cola=b.cola.filter(q=>q.left>0);now.forEach(q=>{fired.push(L("¡Se activa {0}!",q.q));if(b.snd)setTimeout(()=>playSnd(b.snd),200)})}
  }));
  pend.forEach(id=>{const n=blFind(id);if(n){blOn(n.b,true);fired.push(L("Empieza: {0}",n.b.n))}});
  if(fired.length){setTimeout(()=>{toast(fired.join(" · "));vib([200,80,200,80,400])},350);fired.forEach(f=>log(f))}
}
(function(){
  document.addEventListener("click",e=>{const t=e.target.closest("[data-cx]");if(!t||!C)return;e.preventDefault();e.stopPropagation();
    const k=t.dataset.cx,c=(C.cuadros||[]).find(x=>x.id===t.dataset.id),b=c&&(c.bl||[]).find(x=>x.id===t.dataset.b);
    const done=(save=true)=>{if(save)saveSoon();render()};
    if(k==="new"){const p=BPLANT.find(x=>x[0]===t.dataset.v);snap();const nc=Object.assign({id:uid(),donde:t.dataset.l||"combate",c:"#d9a845"},p[2]());nc.bl=nc.bl.map(x=>Object.assign({id:uid()},x));
      // reparar referencias "luego" de la plantilla (usa los ids pedidos)
      C.cuadros=C.cuadros||[];C.cuadros.push(nc);ui.edit=true;done();toast(L("Cuadro agregado: cambiale lo que quieras"));return}
    if(k==="addb"){snap();const nb={id:uid(),t:t.dataset.v,n:L((BTIPOS.find(x=>x[0]===t.dataset.v)||[0,""])[1])};
      if(nb.t==="preparada")Object.assign(nb,{disp:"",acc:""});if(nb.t==="contador")Object.assign(nb,{act:0,max:0,paso:1});if(nb.t==="activable"||nb.t==="transformacion")nb.dur=0;if(nb.t==="futuro")Object.assign(nb,{dado:"1d4",secreto:true,cola:[]});if(nb.t==="tabla")Object.assign(nb,{dado:"1d100",filas:""});if(nb.t==="tirada")nb.f="1d20";
      c.bl.push(nb);done();return}
    if(k==="del"){if(ui.cdel!==c.id){ui.cdel=c.id;render();return}snap();C.cuadros=C.cuadros.filter(x=>x!==c);ui.cdel=null;done();return}
    if(k==="up"||k==="down"){const a=C.cuadros,i=a.indexOf(c),j=i+(k==="up"?-1:1);if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];done();return}
    if(k==="bup"){const a=c.bl,i=a.indexOf(b);if(i>0){[a[i-1],a[i]]=[a[i],a[i-1]];done()}return}
    if(k==="bdel"){if(ui.cdel!==b.id){ui.cdel=b.id;render();return}snap();c.bl=c.bl.filter(x=>x!==b);ui.cdel=null;done();return}
    if(k==="cnt"){snap();const st=(+b.paso||1)*(+t.dataset.v);b.act=(+b.act||0)+st;if(+b.max)b.act=clamp(b.act,0,+b.max);else b.act=Math.max(0,b.act);if(+b.max&&b.act===+b.max&&st>0){toast(L("{0}: ¡al máximo!",b.n));vib(150)}done();return}
    if(k==="act"){snap();blOn(b,!b.on);done();return}
    if(k==="fut"){const inp=document.querySelector(`[data-futq="${b.id}"]`);const q=(inp&&inp.value.trim())||L("Efecto");const n=Math.max(1,/d/i.test(b.dado||"")?rollF(b.dado):(parseInt(b.dado)||1));
      snap();b.cola=b.cola||[];b.cola.push({id:uid(),q,left:n});log(L("Programó un efecto"));toast(b.secreto?L("Programado en secreto 🤫"):L("{0}: sale en {1} turnos",q,n));done();return}
    if(k==="futdel"){b.cola=(b.cola||[]).filter(q=>q.id!==t.dataset.q);done();return}
    if(k==="futver"){ui.fut=ui.fut||{};ui.fut[b.id]=!ui.fut[b.id];render();return}
    if(k==="tab"||k==="tabv"){let n;if(k==="tab")n=rollF(b.dado||"1d100");else{const inp=document.querySelector(`[data-tabq="${b.id}"]`);n=parseInt(inp&&inp.value);if(!n){toast(L("Poné el número que sacaste"));return}}
      ui.tres=ui.tres||{};ui.tres[b.id]={n,t:tablaFind(b,n)};log(`${b.n}: ${n}`);render();return}
    if(k==="prepArm"){const d=document.querySelector(`[data-pdisp="${b.id}"]`),a=document.querySelector(`[data-pacc="${b.id}"]`);b.disp=d?d.value.trim():"";b.acc=a?a.value.trim():"";if(!b.disp&&!b.acc){toast(L("Escribí el disparador o la acción"));return}b.armed=true;log(L("Preparó: {0}",b.acc||b.disp));done();return}
    if(k==="prepGo"){b.armed=false;sfx(b);vib([100,50,200]);log(L("¡Acción preparada! {0}",b.acc||b.disp));toast(L("¡Ahora! {0}",b.acc||b.disp));done();return}
    if(k==="prepNo"){b.armed=false;done();return}
    if(k==="roll"){const n=rollF(b.f);ui.tres=ui.tres||{};ui.tres[b.id]={n,t:""};log(`${b.n}: ${n}`);render();return}
  },true);
})();
/* pestañas propias */
function pestanasEdit(){
  return`<div class="sec"><h2>${L("Pestañas propias")}</h2><p class="hint">${L("Creá una pestaña nueva (por ejemplo \"Fragmentos\" o \"Licantropía\") y mandá ahí los cuadros que quieras.")}</p>
    ${(C.pestanas||[]).map(p=>`<div class="row" style="flex-wrap:nowrap"><input ${R(`C.pestanas.${p.id}`,"n")} value="${esc(p.n)}" style="flex:1"><button class="btn small danger" data-a="del" data-ref="C.pestanas.${p.id}">${L("Borrar")}</button></div>`).join("")}
    <button class="btn small" data-a="pestNew">+ ${L("Nueva pestaña")}</button></div>`;
}
function panePropia(p){return`<h2>${esc(p.n)}</h2>${cuadrosHTML(p.id,true)}`}
