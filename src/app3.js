/* ============ invocaciones ============ */
const EST={dentro:"Adentro",invocada:"Invocada",agotada:"Agotada"};
function invocHTML(compact){
  const list=C.invoc||[];
  return list.map(v=>{const ref=`C.invoc.${v.id}`,src=getImg(v.img),pct=v.hp.max?clamp(v.hp.act/v.hp.max,0,1):0;
    if(ui.edit&&!compact)return`<div class="card"><div class="row" style="flex-wrap:nowrap;align-items:flex-start"><label class="thumb" style="width:64px;flex:none;cursor:pointer;${src?`background-image:url(${src})`:""}">${src?"":"＋"}<input type="file" accept="image/*" data-invup="${v.id}" hidden></label>
      <div class="sec" style="flex:1;gap:6px"><input ${R(ref,"n")} value="${esc(v.n)}" placeholder="${L("Nombre")}"><textarea ${R(ref,"d")} placeholder="${L("Qué hace")}">${esc(v.d)}</textarea></div></div>
      <div class="grid2"><label class="lbl">${L("Vida (0 = sin vida propia)")}<input type="number" min="0" ${R(ref+".hp","max","n")} value="${v.hp.max}"></label>
      <label class="lbl">${L("Dura (turnos, 0 = sin límite)")}<input type="number" min="0" ${R(ref,"dur","n")} value="${v.dur}"></label>
      <label class="lbl">${L("Enciende la zona o capa")}<select ${R(ref,"efecto")}>${opts(linkOpts(),v.efecto,L("Ninguna"))}</select></label>
      ${sndSel(ref,"snd","Sonido al invocar")}</div>
      <button class="btn small danger" data-a="del" data-ref="${ref}">${L("Borrar")}</button></div>`;
    const st=v.estado||"dentro";
    return`<div class="card" id="inv-${v.id}"><div class="row" style="flex-wrap:nowrap;align-items:flex-start;gap:10px">${src?`<div class="thumb" style="width:${compact?48:64}px;flex:none;background-image:url(${src})"></div>`:""}
      <div class="sec" style="flex:1;gap:4px;min-width:0"><div class="top"><span class="t">${favStar(ref)}${esc(v.n)}</span><span class="tag ${st==="invocada"?"":"blue"}" style="${st==="invocada"?"color:#ff9a9a;border-color:var(--crimson)":""}">${L(EST[st])}${st==="invocada"&&v.left>0?" · "+L("quedan {0}",v.left):""}</span></div>
      ${v.d&&!compact?`<div class="d">${esc(v.d)}</div>`:""}
      ${v.hp.max?`<div class="row" style="flex-wrap:nowrap"><div class="meter" style="flex:1"><i style="width:${pct*100}%"></i></div><span class="cost">${v.hp.act}/${v.hp.max}</span></div>
        <div class="row"><input type="number" inputmode="numeric" data-invin placeholder="0" style="width:4.5em" aria-label="${L("Cantidad")}"><button class="btn small dmg" style="background:var(--crimson);border-color:var(--crimson);color:#fff" data-a="invHp" data-id="${v.id}" data-v="-1">${L("Daño")}</button><button class="btn small" style="background:#2f6b47;border-color:#2f6b47;color:#fff" data-a="invHp" data-id="${v.id}" data-v="1">${L("Curar")}</button></div>`:""}
      <div class="row" style="justify-content:flex-end">${st==="invocada"?`<button class="btn small" data-a="invState" data-id="${v.id}" data-v="dentro">${L("Volver adentro")}</button>`:`<button class="use" data-a="invState" data-id="${v.id}" data-v="invocada">${L("Invocar")}</button>`}
        ${st!=="agotada"?`<button class="btn small ghost" data-a="invState" data-id="${v.id}" data-v="agotada">${L("Agotada")}</button>`:""}</div></div></div></div>`}).join("")||(compact?"":`<div class="empty">${L("Sin invocaciones todavía.")}</div>`);
}
/* ============ pestañas ============ */
function panePoderes(){
  return`${ui.edit?`<label class="row hint" style="margin-bottom:8px;gap:6px"><input type="checkbox" ${R("C","grimOff","b")} ${C.grimOff?"":"checked"} data-inv style="width:auto"> ${L("Mostrar el grimorio (para magos)")}</label>`:""}
  ${C.grimOff?"":`<button class="btn grimbtn" data-a="grim">${L("Abrir grimorio")}<span class="hint">${L("o girá el celular")}</span></button>`}
  <button class="btn" data-a="cmp" data-v="conjuro">⌕ ${L("Buscar en el compendio (conjuros, dotes, ítems)")}</button>
  <div class="sec"><h2>${L("Recursos")}</h2><p class="hint">${L("Espacios de conjuro, usos de maniobras, puntos de ki… lo que se gasta y se recarga.")}</p>
    ${C.recursos.length?recursosHTML(false):`<div class="empty">${L("Sin recursos todavía.")}</div>`}
    <button class="btn small" data-a="add" data-ref="C.recursos" data-kind="recurso">+ ${L("Nuevo recurso")}</button></div>
  ${C.grupos.map(g=>{const ref=`C.grupos.${g.id}`;return`<div class="grp" data-fold="g:${g.id}"><div class="gh">${ui.edit?`<input ${R(ref,"n")} value="${esc(g.n)}" style="flex:1;font-family:var(--display);font-size:1.1rem"><button class="btn small danger" data-a="del" data-ref="${ref}">${L("Borrar grupo")}</button>`:`<span class="gt">${esc(g.n)}</span>${g.prep?prepHead(g):`<span class="hint">${g.items.length}</span>`}`}</div>
    ${ui.edit?`<div class="row hint" style="gap:10px"><label class="row" style="gap:6px"><input type="checkbox" ${R(ref,"prep","b")} ${g.prep?"checked":""} style="width:auto"> ${L("Hay que prepararlos cada día")}</label>${g.prep?`<label class="row" style="gap:6px">${L("Máximo")} <input type="number" min="0" ${R(ref,"prepMax","n")} value="${+g.prepMax||0}" style="width:5em"></label>`:""}</div>`:""}
    ${grpListHTML(g,ref)}
    <button class="btn small" data-a="add" data-ref="${ref}.items" data-kind="item">+ ${L("Agregar a {0}",esc(g.n))}</button></div>`}).join("")}
  <button class="btn" data-a="add" data-ref="C.grupos" data-kind="grupo">+ ${L("Nuevo grupo (ej.: Magia malacálica, Canciones, Dotes)")}</button>
  <div class="sec"><h2>${L("Invocaciones y compañeros")}</h2><p class="hint">${L("Espíritus, brujas, mascotas, criaturas… cada uno con su vida, su estado y cuántos turnos dura afuera.")}</p>
    ${invocHTML(false)}<button class="btn small" data-a="add" data-ref="C.invoc" data-kind="invoc">+ ${L("Nueva invocación")}</button></div>`;
}
function magicoCard(m){
  const ref=`C.magicos.${m.id}`;
  if(ui.edit)return`<div class="card"><input ${R(ref,"n")} value="${esc(m.n)}" placeholder="${L("Nombre")}"><textarea ${R(ref,"d")} placeholder="${L("Qué hace")}">${esc(m.d)}</textarea>${sndSel(ref)}
    <div class="grid2"><label class="lbl">${L("Usos (0 = sin contador)")}<input type="number" min="0" ${R(ref+".usos","max","n")} value="${m.usos.max}"></label>
    <label class="lbl">${L("Se recarga")}<select ${R(ref,"rec")}>${opts(RECS.map(([v,t])=>[v,L(t)]),m.rec)}</select></label>
    ${m.rec==="turnos"||m.rec==="horas"?`<label class="lbl">${m.rec==="turnos"?L("Cada cuántos turnos"):L("Cada cuántas horas")}<input type="number" min="1" ${R(ref,"recN","n")} value="${m.recN}"></label>`:""}
    <label class="lbl">${L("Dura (turnos, 0 = nada)")}<input type="number" min="0" ${R(ref,"dur","n")} value="${m.dur}"></label>
    <label class="lbl">${L("Enciende la zona o capa")}<select ${R(ref,"efecto")}>${opts(linkOpts(),m.efecto,L("Ninguna"))}</select></label></div>
    <div class="row">${visBtn(ref)}<button class="btn small danger" data-a="del" data-ref="${ref}">${L("Borrar")}</button></div></div>`;
  let rc="";if(m.rec==="turnos")rc=L("se recarga cada {0} turnos",m.recN);else if(m.rec==="horas"){rc=L("se recarga cada {0} h",m.recN);if(m.t&&m.usos.act<m.usos.max){const left=Math.max(0,(+m.recN||1)*3600e3-(Date.now()-m.t));rc+=" · "+L("faltan {0}",Math.floor(left/3600e3)+"h "+Math.ceil(left%3600e3/60e3)+"m")}}else if(m.rec!=="no")rc=L("se recarga con {0}",L(m.rec==="corto"?"descanso corto":"descanso largo").toLowerCase());
  return`<div class="card ${hasVis(m)?"hasvis":""}" id="it-${m.id}">${visThumb(m,ref)}<div class="top"><span class="t">${favStar(ref)}${esc(m.n)} ${durTag(m)}</span>${m.usos.max?`<span class="cost">${m.usos.act} / ${m.usos.max}</span>`:""}</div>
    ${m.d?`<div class="d">${esc(m.d)}</div>`:""}${rc&&m.usos.max?`<span class="hint">${rc}</span>`:""}
    <div class="row" style="justify-content:flex-end">${m.usos.max?`<button class="btn small" data-a="itemPlus" data-ref="${ref}">+</button>`:""}<button class="use" data-a="useItem" data-ref="${ref}">${L("Usar")}</button></div></div>`;
}
function medidorHTML(M){
  const ref=`C.medidores.${M.id}`;
  if(ui.edit)return`<div class="card"><input ${R(ref,"n")} value="${esc(M.n)}" placeholder="${L("Nombre (ej.: Tamaño, Hambre, Luz y sombra)")}">
    <div class="grid2"><label class="lbl">${L("Tipo")}<select ${R(ref,"tipo")}>${opts([["sube",L("Solo sube (0 → máximo)")],["bipolar",L("Dos lados (negativo ↔ positivo)")]],M.tipo)}</select></label>
    <label class="lbl">${L("Mínimo")}<input type="number" ${R(ref,"min","n")} value="${M.min}"></label><label class="lbl">${L("Máximo")}<input type="number" ${R(ref,"max","n")} value="${M.max}"></label>
    <label class="lbl">${L("Nombre del lado izquierdo")}<input ${R(ref,"izq")} value="${esc(M.izq)}"></label><label class="lbl">${L("Nombre del lado derecho")}<input ${R(ref,"der")} value="${esc(M.der)}"></label>
    <label class="lbl">${L("Pertenece a (arma, ítem…)")}<input ${R(ref,"vinc")} value="${esc(M.vinc)}"></label></div>${lookPicker("med",ref)}
    <h3>${L("Qué se desbloquea")}</h3>
    ${M.umbrales.map(u=>`<div class="row"><input type="number" ${R(ref+".umbrales."+u.id,"v","n")} value="${u.v}" style="width:5em"><input ${R(ref+".umbrales."+u.id,"t")} value="${esc(u.t)}" style="flex:1"><button class="btn small danger" data-a="del" data-ref="${ref}.umbrales.${u.id}">×</button></div>`).join("")}
    <div class="row sb"><button class="btn small" data-a="add" data-ref="${ref}.umbrales" data-kind="umbral">+ ${L("Agregar punto de desbloqueo")}</button><button class="btn small danger" data-a="del" data-ref="${ref}">${L("Borrar medidor")}</button></div></div>`;
  const span=(M.max-M.min)||1,pos=(M.v-M.min)/span*100,bip=M.tipo==="bipolar";
  const unlocked=M.umbrales.filter(u=>bip?(u.v<0?M.v<=u.v:u.v>0?M.v>=u.v:false):M.v>=u.v);
  return`<div class="card"><div class="top"><span class="t">${favStar(ref)}${esc(M.n)}</span>${M.vinc?`<span class="tag">${esc(M.vinc)}</span>`:""}</div>
    ${medVisual(M)||`<div class="mbar" style="background:${bip?"linear-gradient(90deg,#08070b,#55505e 50%,#fff8e6)":"linear-gradient(90deg,var(--bg),var(--gold))"}">${M.umbrales.map(u=>`<b style="left:${clamp((u.v-M.min)/span*100,0,100)}%"></b>`).join("")}<i style="left:${clamp(pos,0,100)}%"></i></div>`}
    <div class="row sb"><span class="hint">${esc(M.izq||M.min)}</span><span class="mval">${bip&&M.v>0?"+":""}${M.v}</span><span class="hint">${esc(M.der||M.max)}</span></div>
    <div class="row" style="justify-content:center"><button class="btn small" data-a="med" data-id="${M.id}" data-v="-1">−1</button><button class="btn small" data-a="med" data-id="${M.id}" data-v="1">+1</button></div>
    ${M.umbrales.length?`<div class="sec" style="gap:4px">${M.umbrales.map(u=>`<div class="thr ${unlocked.includes(u)?"on":""}">${u.v>0&&bip?"+":""}${u.v} · ${esc(u.t)}</div>`).join("")}</div>`:""}</div>`;
}
function paneArmas(){
  return`<div class="sec"><h2>${L("Armas y ataques")}</h2>
    ${ord(C.armas,"C.armas").map(a=>{const ref=`C.armas.${a.id}`;return ui.edit?`<div class="card"><input ${R(ref,"n")} value="${esc(a.n)}" placeholder="${L("Nombre")}">
      <div class="grid2"><label class="lbl">${L("Bono de ataque")}<input ${R(ref,"b")} value="${esc(a.b)}"></label><label class="lbl">${L("Daño")}<input ${R(ref,"d")} value="${esc(a.d)}"></label>
      <label class="lbl">${L("Al golpear suma a")}<select ${R(ref,"contador")}>${opts(C.contadores.map(k=>[k.id,k.n]),a.contador,L("Nada"))}</select></label>
      <label class="lbl">${L("Crítico")}<select ${R(ref,"crit")}>${opts(CRITS.map(([k,n])=>[k,L(n)]),a.crit||"doble")}</select></label>
      ${a.crit==="custom"?`<label class="lbl">${L("Multiplica los dados por")}<input type="number" min="1" max="20" ${R(ref,"critMult","n")} value="${+a.critMult||2}"></label>
      <label class="lbl">${L("Cuántos dados pegan al máximo")}<select ${R(ref,"critMax")}>${opts([["ninguno",L("Ninguno: se tiran todos")],["mitad",L("La mitad al máximo, el resto se tira")],["todos",L("Todos al máximo")]],a.critMax||"ninguno")}</select></label>`:""}
      <label class="lbl">${L("Usa munición")}<select ${R(ref,"mun")}>${opts((C.consum||[]).map(x=>[x.id,x.n]),a.mun||"",L("Ninguna"))}</select></label>
      ${sndSel(ref,"snd","Sonido al atacar")}</div>
      <textarea ${R(ref,"notas")} placeholder="${L("Notas")}">${esc(a.notas)}</textarea><div class="row">${visBtn(ref)}<button class="btn small danger" data-a="del" data-ref="${ref}">${L("Borrar")}</button></div></div>`
    :`<div class="card ${hasVis(a)?"hasvis":""}" id="hit-${a.id}">${visThumb(a,ref)}<div class="top"><span class="t">${favStar(ref)}${esc(a.n)}</span><span class="cost">${esc(a.b)} · ${esc(a.d)}</span></div>${a.notas?`<div class="d">${esc(a.notas)}</div>`:""}
      <div class="row" style="justify-content:flex-end">${ammoTag(a)}<button class="use" data-a="hit" data-id="${a.id}">${hitLabel(a)}</button></div></div>`}).join("")||`<div class="empty">${L("Sin armas todavía.")}</div>`}
    <button class="btn small" data-a="add" data-ref="C.armas" data-kind="arma">+ ${L("Nueva arma")}</button></div>
  ${consumHTML(false)}
  <div class="sec"><h2>${L("Contadores")}</h2><p class="hint">${L("Marcas, cargas, almas… se suman al golpear con el arma vinculada.")}</p>${contadoresHTML()}<button class="btn small" data-a="add" data-ref="C.contadores" data-kind="contador">+ ${L("Nuevo contador")}</button></div>
  <div class="sec"><h2>${L("Medidores")}</h2><p class="hint">${L("Escalas propias: luz y sombra, tamaño de una guadaña, corrupción… Pueden cambiar el color de una zona de la imagen.")}</p>${ord(C.medidores).map(medidorHTML).join("")}<button class="btn small" data-a="add" data-ref="C.medidores" data-kind="medidor">+ ${L("Nuevo medidor")}</button></div>
  <div class="sec">${barrasHTML()}</div>
  <div class="sec"><h2>${L("Ítems mágicos")}</h2>${ord(C.magicos,"C.magicos").map(magicoCard).join("")||`<div class="empty">${L("Sin ítems mágicos todavía.")}</div>`}<div class="row"><button class="btn small" data-a="add" data-ref="C.magicos" data-kind="magico">+ ${L("Nuevo ítem mágico")}</button><button class="btn small" data-a="cmp" data-v="item">⌕ ${L("Buscar en el compendio")}</button></div></div>`;
}
function stylePicker(e){
  const cur=e.estilo||"brillo";
  return`<span class="hint">${L("Efecto")}</span><div class="stylegrid">${ESTILOS.map(([k,n,c])=>{const f=styleFill(k,cur===k?e.c:c,"");return`<button class="stl ${cur===k?"on":""}" data-a="estilo" data-id="${e.id}" data-v="${k}"><i style="background:${f.bg};${f.size?`background-size:${f.size};`:""}box-shadow:0 0 8px ${f.g}"></i>${L(n)}</button>`}).join("")}</div>`;
}
function effCard(e){
  const ref=`C.efectos.${e.id}`,withImg=C.poses.filter(p=>getImg(p.img));
  const M=e.med&&C.medidores.find(x=>x.id===e.med.id);
  const paintRow=`<div class="row">${withImg.map(p=>`<button class="btn small ${zoneHasPose(e,p.id)?"on":""}" data-a="paint" data-id="${e.id}" data-v="${p.id}">✎ ${esc(p.n)}${zoneHasPose(e,p.id)?" ✓":""}</button>`).join("")||`<span class="hint">${L("Subí una imagen en Poses para poder pintar.")}</span>`}</div>`;
  if(!ui.edit)return`<div class="card"><div class="top"><span class="t">${favStar(ref)}<i class="fxdot" style="--c:${M?"var(--gold)":e.c}"></i>${esc(e.n)} ${durTag(e)}${e.estilo&&e.estilo!=="brillo"?` <span class="tag">${L((ESTILOS.find(s=>s[0]===e.estilo)||ESTILOS[0])[1])}</span>`:""}</span>${M?`<span class="tag">${esc(M.n)}</span>`:`<button class="btn small ${e.on?"on":""}" data-a="effToggle" data-id="${e.id}">${e.on?L("Encendida"):L("Apagada")}</button>`}</div>
    ${e.parte?`<span class="hint">${esc(partName(e.parte))}</span>`:""}${e.desc?`<div class="d">${esc(e.desc)}</div>`:""}
    <span class="hint">${L("Pintar la zona en cada pose:")}</span>${paintRow}</div>`;
  return`<div class="card"><input ${R(ref,"n")} value="${esc(e.n)}">
    <div class="grid2"><label class="lbl">${L("Parte del cuerpo")}<select ${R(ref,"parte")}>${opts(flatParts().map(p=>[p.id,p.label]),e.parte,L("Ninguna"))}</select></label>
    <label class="lbl">${L("Dura (turnos, 0 = sin límite)")}<input type="number" min="0" ${R(ref,"dur","n")} value="${e.dur}"></label>
    <label class="lbl">${L("Controlada por medidor")}<select data-a2="effMed" data-id="${e.id}">${opts(C.medidores.map(m=>[m.id,m.n]),M?M.id:"",L("No (se prende y apaga)"))}</select></label></div>
    ${M?`<div class="grid2">${M.tipo==="bipolar"?`<label class="lbl">${esc(M.izq||L("Negativo"))}<span class="row"><input type="color" ${R(ref+".med.neg","0")} value="${e.med.neg[0]}"><input type="color" ${R(ref+".med.neg","1")} value="${e.med.neg[1]||e.med.neg[0]}"></span></label>`:""}
      <label class="lbl">${esc(M.der||L("Positivo"))}<span class="row"><input type="color" ${R(ref+".med.pos","0")} value="${e.med.pos[0]}"><input type="color" ${R(ref+".med.pos","1")} value="${e.med.pos[1]||e.med.pos[0]}"></span></label></div><p class="hint">${L("Cuanto más avanza el medidor, más fuerte el color.")}</p>${stylePicker(e)}`
    :`${e.sub&&e.sub.length?`<span class="hint">${L("Pinceles de esta zona (cambiar acá recolorea todo lo pintado con ese pincel):")}</span>${e.sub.map((sb,i)=>{const r2=`${ref}.sub.${sb.id}`;const f=styleFill(sb.estilo||"brillo",sb.c,sb.c2);return`<div class="row" style="flex-wrap:nowrap"><i class="bsw" style="background:${f.bg};${f.size?`background-size:${f.size};`:""}box-shadow:0 0 8px ${f.g}"></i><select ${R(r2,"estilo")} style="flex:1">${opts(ESTILOS.map(([k,n])=>[k,L(n)]),sb.estilo||"brillo")}</select><input type="color" ${R(r2,"c")} value="${sb.c}" aria-label="${L("Color")}"><input type="color" ${R(r2,"c2")} value="${sb.c2||sb.c}" aria-label="${L("Segundo color")}" title="${L("Segundo color (fusión)")}"><button class="btn small danger" data-a="del" data-ref="${r2}" aria-label="${L("Borrar pincel")}">×</button></div>`}).join("")}`
      :`${stylePicker(e)}<div class="colorrow"><span class="hint">${L("Color")}</span><input type="color" ${R(ref,"c")} value="${e.c}">${SWATCH.map(s=>`<button class="sw ${e.c===s?"on":""}" style="--c:${s}" data-a="swatch" data-id="${e.id}" data-v="${s}" aria-label="${s}"></button>`).join("")}</div>`}
      <div class="grid2">${e.sub&&e.sub.length?"":`<label class="lbl inline"><input type="checkbox" data-a2="effGrad" data-id="${e.id}" ${e.c2?"checked":""}> ${L("Degradado con segundo color")}</label>${e.c2?`<input type="color" ${R(ref,"c2")} value="${e.c2}">`:""}`}
      <label class="lbl">${L("Intensidad")}<input type="range" min="0.2" max="1" step="0.05" ${R(ref,"brillo","f")} value="${e.brillo}"></label>
      <label class="lbl">${L("Resplandor")}<input type="range" min="0" max="1" step="0.05" ${R(ref,"halo","f")} value="${e.halo}"></label>
      <label class="lbl inline"><input type="checkbox" ${R(ref,"pulso","b")} ${e.pulso!==false?"checked":""}> ${L("Late")}</label></div>`}
    <textarea ${R(ref,"desc")} placeholder="${L("Descripción")}">${esc(e.desc||"")}</textarea>
    ${paintRow}
    <button class="btn small danger" data-a="del" data-ref="${ref}">${L("Borrar zona")}</button></div>`;
}
function treeHTML(nodes,base,kind){
  return nodes.map(n=>{const ref=`${base}.${n.id}`,open=!!ui.open[n.id],kids=n.k||[];
    const links=kind==="parte"?C.efectos.filter(e=>e.parte===n.id).length:0;
    return`<div class="nd"><div class="nd-h"><button class="tg" data-a="tog" data-id="${n.id}" aria-label="${open?L("Cerrar"):L("Abrir")}">${kids.length?(open?"▾":"▸"):"•"}</button>
      <button class="nt" data-a="tog" data-id="${n.id}">${esc(n.n)}</button>${links?`<span class="tag">✦ ${links}</span>`:""}${n.d?`<span class="cnt">✎</span>`:""}${kids.length?`<span class="cnt">${kids.length}</span>`:""}</div>
      ${open?`<div class="nd-b"><input ${R(ref,"n")} value="${esc(n.n)}"><textarea ${R(ref,"d")} placeholder="${L("Notas de esta parte: tatuajes, heridas, marcas…")}">${esc(n.d)}</textarea>
        <div class="row"><button class="btn small" data-a="add" data-ref="${ref}.k" data-kind="parte" data-open="${n.id}">+ ${L("Agregar parte dentro")}</button><button class="btn small danger" data-a="del" data-ref="${ref}">${L("Borrar")}</button></div></div>
        ${kids.length?`<div class="nd-k">${treeHTML(kids,ref+".k",kind)}</div>`:""}`:""}</div>`}).join("");
}
const CNAMES=[["#4fb3ff","celeste"],["#9be7ff","celeste hielo"],["#1e3cff","azul"],["#ffffff","blanco"],["#ffe14d","amarillo"],["#ffd36b","dorado claro"],["#d9a845","dorado"],["#ff7a1a","naranja"],["#ff3b3b","rojo"],["#8b0000","rojo oscuro"],["#5bbf7a","verde"],["#36e0a0","verde agua"],["#b77bff","violeta"],["#ff5fd2","rosa"],["#000000","negro"]];
function colorName(hex){const h=String(hex||"#ffffff").replace("#","");const c=[0,2,4].map(k=>parseInt(h.substr(k,2),16)||0);let best="",bd=1e9;for(const[x,n]of CNAMES){const d=[1,3,5].map((k,i)=>parseInt(x.substr(k,2),16)-c[i]).reduce((s,v)=>s+v*v,0);if(d<bd){bd=d;best=n}}return L(best)}
function prompText(){
  const name=C.nombre?` (${C.nombre})`:"";
  let s=ui.ptpl?L("Te paso dos imágenes: la primera es mi personaje{0} y la segunda es una figura gris de referencia. Generá una imagen nueva del MISMO personaje de la primera imagen haciendo exactamente la pose de la figura ({1}), en el mismo lugar y tamaño que ocupa la figura.",name,ui.promptAct||L(PTPL[ui.ptpl].n).toLowerCase())
    :L("Usá la imagen adjunta como referencia de mi personaje{0}. Generá una imagen nueva del MISMO personaje {1}.",name,ui.promptAct||"…");
  s+=" "+L("Mantené exactamente la misma cara, cuerpo, ropa, tatuajes, colores y estilo de ilustración.");
  const sel=C.efectos.filter(e=>ui.promptZ&&ui.promptZ[e.id]);
  sel.forEach(e=>{const part=partName(e.parte).toLowerCase(),zn=e.n.toLowerCase(),col=e.med?colorName(e.med.pos[1]||e.med.pos[0]):colorName(e.c);
    if(ui.promptGlow==="ia")s+=" "+(part?L("Que {0} en {1} brille en color {2}.",zn,part,col):L("Que {0} brille en color {1}.",zn,col));
    else s+=" "+(part?L("Que se vea claramente {0} en {1}, bien definido y sin brillo propio (el brillo se agrega después).",zn,part):L("Que se vea claramente {0}, bien definido y sin brillo propio (el brillo se agrega después).",zn))});
  if(!ui.ptpl)s+=" "+L("Encuadre: cuerpo completo de la cabeza a los pies, centrado, ocupando casi toda la altura de la imagen, con el mismo tamaño y posición que la imagen de referencia, sin cortar ninguna parte.");
  else s+=" "+L("No copies el color gris ni el aspecto de la figura: solo su pose y su encuadre. Que no se corte ninguna parte del cuerpo.");
  s+=" "+L("Fondo blanco liso, sin sombras en el piso, sin texto ni marcos. Formato vertical 2:3.");
  return s;
}
function bgBox(){
  const src=getImg(C.fondo);
  return`<div class="card"><div class="t">${L("Fondo")}</div><p class="hint">${L("Una imagen de fondo detrás del personaje: un paisaje, un castillo, lo que quieras. Cada pose puede tener uno propio.")}</p>
    <div class="bgthumb" style="${src?`background-image:url(${src})`:""}">${src?"":L("Sin fondo")}</div>
    <div class="row"><label class="btn small on">${src?L("Cambiar fondo"):L("Subir fondo")}<input type="file" accept="image/*" data-bgup="char" hidden></label>${src?`<button class="btn small danger" data-a="bgDel" data-v="char">${L("Quitar fondo")}</button>`:""}</div>
    ${src?`<label class="lbl">${L("Oscurecer el fondo")}<input type="range" min="0" max="0.8" step="0.05" ${R("C","fondoDim","f")} value="${C.fondoDim}"></label>`:""}</div>`;
}
function aiBox(){return`<details class="ai" data-det="ai" ${ui.det&&ui.det.ai?"open":""}><summary>${L("¿Querés pedirle la imagen a una IA? (Gemini u otra)")}</summary>${promptBox()}</details>`}
function promptBox(){
  ui.promptZ=ui.promptZ||{};
  return`<div class="card"><div class="t">${L("Texto para pedir la imagen a Gemini u otra IA")}</div>
    <p class="hint">${L("Arma el pedido para que todas las imágenes salgan con el mismo encuadre y encajen con la app.")}</p>
    <label class="lbl">${L("¿Qué está haciendo el personaje? (la pose)")}<input id="prompt-act" value="${esc(ui.promptAct)}" placeholder="${L("Ej.: en posición de ataque con la lanza")}"></label>
    <span class="hint">${L("Plantilla de pose (recomendado): una figura con la pose y el encuadre de la app para pasarle a la IA junto con tu personaje.")}</span>
    <div class="row" style="gap:6px;flex-wrap:nowrap;overflow-x:auto;padding-bottom:4px">${[["",L("Sin plantilla")],...Object.keys(PTPL).map(k=>[k,L(PTPL[k].n)])].map(([k,n])=>`<div class="pcard ${ui.ptpl===k||(!k&&!ui.ptpl)?"cur":""}" style="flex:none;width:92px;padding:4px;gap:3px;font-size:.72rem;text-align:center">
      <button data-a="ptpl" data-v="${k}" style="background:none;border:0;padding:0;color:inherit;display:flex;flex-direction:column;gap:3px;align-items:center" aria-label="${L("Usar esta pose en el texto")}: ${esc(n)}">${k?`<img src="${poseURI(k)}" alt="" style="border-radius:6px;aspect-ratio:2/3;width:82px">`:`<div class="thumb" style="width:82px">—</div>`}<span>${esc(n)}</span></button>
      ${k?`<label class="lbl inline" style="justify-content:center;font-size:.72rem"><input type="checkbox" data-dlsel="${k}" ${ui.dlSel&&ui.dlSel[k]?"checked":""}> ${L("Bajar")}</label>`:""}</div>`).join("")}</div>
    <p class="hint">${L("Tocá una figura para usarla en el texto. Marcá “Bajar” en las que quieras descargar.")}</p>
    <div class="row"><button class="btn small on" data-a="ptplDlSel" ${ui.dlSel&&Object.values(ui.dlSel).some(Boolean)?"":"disabled"}>${L("Descargar marcadas")}</button><button class="btn small" data-a="ptplDlAll">${L("Descargar todas")}</button></div>
    ${ui.ptpl?`<p class="hint">${L("Pasale a la IA: 1) la imagen de tu personaje, 2) esta plantilla, 3) el texto.")}</p>`:""}
    ${C.efectos.length?`<span class="hint">${L("Zonas que tienen que aparecer:")}</span><div class="sec" style="gap:4px">${C.efectos.map(e=>`<label class="lbl inline"><input type="checkbox" data-pz="${e.id}" ${ui.promptZ[e.id]?"checked":""}> <i class="fxdot" style="--c:${e.med?(e.med.pos[1]||e.med.pos[0]):e.c}"></i>${esc(e.n)}${e.parte?` · ${esc(partName(e.parte))}`:""}</label>`).join("")}</div>
      <label class="lbl">${L("El brillo")}<select id="prompt-glow">${opts([["app",L("Lo agrega la app (recomendado)")],["ia",L("Que la IA lo dibuje")]],ui.promptGlow||"app")}</select></label>`
      :`<p class="hint">${L("Si creás zonas que brillan (Cuerpo → Zonas que brillan), vas a poder sumarlas al pedido.")}</p>`}
    <div class="pre" id="prompt-txt" style="background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:8px">${esc(prompText())}</div>
    <div class="row"><button class="btn small on" data-a="copyPrompt">${L("Copiar texto")}</button><span class="hint">${L("Pegalo en Gemini junto con una imagen actual del personaje. Después subí el resultado en la pose.")}</span></div></div>`;
}
function paneCuerpo(){
  return`<div class="sec"><h2>${L("Poses")}</h2><p class="hint">${L("Una imagen por pose. Las marcadas como “de combate” aparecen al entrar en combate.")}</p>
    <div class="poses">${C.poses.map(p=>{const ref=`C.poses.${p.id}`,src=getImg(p.img);return`<div class="pcard ${p.id===C.pose?"cur":""}">
      <label class="thumb" style="cursor:pointer;${src?`background-image:url(${src})`:""}" title="${src?L("Cambiar imagen"):L("Subir imagen")}">${src?"":"＋<br>"+L("Subir imagen")}<input type="file" accept="image/*" data-upload="${p.id}" hidden></label>
      <input ${R(ref,"n")} value="${esc(p.n)}" aria-label="${L("Nombre de la pose")}">
      <label class="lbl inline"><input type="checkbox" ${R(ref,"combate","b")} ${p.combate?"checked":""}> ${L("De combate")}</label>${phaseEdit(p,ref)}
      <label class="lbl inline"><input type="checkbox" ${R(ref,"fondo","b")} ${p.fondo!==false?"checked":""}> ${L("Quitar fondo blanco")}</label>
      <label class="btn small" style="text-align:center">${src?L("Cambiar imagen"):L("Subir imagen")}<input type="file" accept="image/*" data-upload="${p.id}" hidden></label>
      <label class="btn small" style="text-align:center">${p.bg?L("Cambiar fondo propio"):L("Fondo propio")}<input type="file" accept="image/*" data-bgup="${p.id}" hidden></label>${p.bg?`<button class="btn small danger" data-a="bgDel" data-v="${p.id}">${L("Quitar fondo propio")}</button>`:""}
      <div class="row"><button class="btn small" data-a="pose" data-id="${p.id}">${L("Mostrar")}</button>${C.poses.length>1?`<button class="btn small danger" data-a="del" data-ref="${ref}">${L("Borrar")}</button>`:""}</div></div>`}).join("")}</div>
    <button class="btn small" data-a="add" data-ref="C.poses" data-kind="pose">+ ${L("Nueva pose (cantando, durmiendo, transformado…)")}</button>
    ${aiBox()}</div>
  <div class="sec">${bgBox()}</div>
  ${capasSection()}
  <div class="sec"><h2>${L("Zonas que brillan")}</h2><p class="hint">${L("Tatuajes, hielo, fuego, un halo… Pintá con el dedo sobre cada pose la zona que tiene que brillar.")}</p>
    ${C.efectos.map(effCard).join("")||`<div class="empty">${L("Sin zonas todavía.")}</div>`}
    <button class="btn small" data-a="add" data-ref="C.efectos" data-kind="efecto">+ ${L("Nueva zona")}</button></div>
  <div class="sec"><h2>${L("Partes del cuerpo")}</h2><p class="hint">${L("Tocá una parte para escribir notas o agregar partes dentro. Podés sumar extremidades extra.")}</p>
    <div class="tree">${treeHTML(C.cuerpo,"C.cuerpo","parte")}</div>
    <button class="btn small" data-a="add" data-ref="C.cuerpo" data-kind="parte">+ ${L("Agregar parte (brazo extra, cola, alas…)")}</button></div>
  ${C.inventarios.map(iv=>{const ref=`C.inventarios.${iv.id}`;return`<div class="sec"><h2>${ui.edit?`<input ${R(ref,"t")} value="${esc(iv.t)}" style="font-family:var(--display);font-size:1.1rem">`:esc(iv.t)}</h2>
    ${iv.items.map(x=>{const r2=`${ref}.items.${x.id}`;return ui.edit?`<div class="card"><input ${R(r2,"n")} value="${esc(x.n)}" placeholder="${L("Qué es")}"><input ${R(r2,"donde")} value="${esc(x.donde)}" placeholder="${L("Dónde está")}"><textarea ${R(r2,"d")} placeholder="${L("Notas")}">${esc(x.d)}</textarea><button class="btn small danger" data-a="del" data-ref="${r2}">${L("Borrar")}</button></div>`
      :`<div class="card"><div class="top"><span class="t">${esc(x.n)||"—"}</span>${x.donde?`<span class="cost">${esc(x.donde)}</span>`:""}</div>${x.d?`<div class="d">${esc(x.d)}</div>`:""}<div class="row" style="justify-content:flex-end"><button class="btn small" data-a="del" data-ref="${r2}">${L("Sacar")}</button></div></div>`}).join("")||`<div class="empty">${L("Vacío.")}</div>`}
    <div class="row sb"><button class="btn small" data-a="add" data-ref="${ref}.items" data-kind="invItem">+ ${L("Agregar")}</button>${ui.edit?`<button class="btn small danger" data-a="del" data-ref="${ref}">${L("Borrar lista")}</button>`:""}</div></div>`}).join("")}
  <button class="btn small" data-a="add" data-ref="C.inventarios" data-kind="inv">+ ${L("Nueva lista (inventario, tatuajes dimensionales…)")}</button>
  <div class="sec"><h2>${L("Estados")}</h2>
    ${C.estados.map(s=>{const ref=`C.estados.${s.id}`;return ui.edit?`<div class="row"><input ${R(ref,"n")} value="${esc(s.n)}" style="flex:1"><select ${R(ref,"fx")} style="width:auto">${opts(FXS.map(([v,t])=>[v,L(t)]),s.fx)}</select><button class="btn small danger" data-a="del" data-ref="${ref}">×</button></div>`
      :`<div class="mini"><span>${favStar(ref)}${esc(s.n)}</span><span class="hint">${L((FXS.find(f=>f[0]===s.fx)||FXS[0])[1])}</span><button class="btn small ${s.on?"on":""}" data-a="estado" data-id="${s.id}">${s.on?L("Activo"):L("Inactivo")}</button></div>`}).join("")}
    <button class="btn small" data-a="add" data-ref="C.estados" data-kind="estado">+ ${L("Nuevo estado")}</button></div>`;
}
function rollList(key,addKind,addLabel){
  return C[key].map(r=>{const ref=`C.${key}.${r.id}`;return ui.edit?`<div class="skedit"><input ${R(ref,"n")} value="${esc(r.n)}"><select ${R(ref,"a")}>${opts(C.stats.map(s=>[s.id,s.k]),r.a,"—")}</select><input type="number" ${R(ref,"x","n")} value="${r.x||0}" title="${L("Bono extra")}"><button class="btn small danger" data-a="del" data-ref="${ref}">×</button></div>`
    :`<div class="sk"><button class="prof ${r.p?"p"+r.p:""}" data-a="prof" data-ref="${ref}" data-v="${key==="saves"?2:3}" aria-label="${esc(r.n)}"></button><span class="v">${sg(rowVal(r))}</span><span>${esc(r.n)}${r.x?` <span class="a">(${sg(+r.x)})</span>`:""}</span><span class="a">${esc((statOf(r.a)||{}).k||"")}</span></div>`}).join("")
  +`<button class="btn small" data-a="add" data-ref="C.${key}" data-kind="${addKind}" style="margin-top:6px">+ ${addLabel}</button>`;
}
function paneHoja(){
  const box=(l,inner)=>`<div class="box"><span class="l">${l}</span>${inner}</div>`;
  const desMod=(()=>{const d=C.stats.find(s=>s.k==="DES");return d?modN(d.v):0})();
  return`<div class="row sb"><h2 style="margin:0">${L("Hoja de personaje")}</h2><button class="insp ${C.insp?"on":""}" data-a="insp">${L("Inspiración")}</button></div>
  <div class="sheet">
    <div class="blk">
      <div class="box"><h3 style="margin:0 0 4px">${L("Características")}</h3>
        ${ui.edit?C.stats.map(s=>{const ref=`C.stats.${s.id}`;return`<div class="skedit" style="grid-template-columns:4em minmax(0,1fr) 4em auto"><input ${R(ref,"k")} value="${esc(s.k)}" aria-label="${L("Abreviatura")}"><input ${R(ref,"n")} value="${esc(s.n)}"><input type="number" ${R(ref,"v","n")} value="${s.v}"><button class="btn small danger" data-a="del" data-ref="${ref}">×</button></div>`}).join("")+`<button class="btn small" data-a="add" data-ref="C.stats" data-kind="stat">+ ${L("Nueva característica")}</button><label class="lbl">${L("Clase de armadura (CA)")}<input ${R("C","ca")} value="${esc(C.ca)}"></label>`
        :C.stats.map(s=>`<div class="sk" style="grid-template-columns:3.2em 2.6em 1fr"><strong>${esc(s.k)}</strong><span class="v">${sg(modN(s.v))}</span><span>${esc(s.n)} <span class="a">(${s.v})</span></span></div>`).join("")}</div>
      <div class="vit">
        ${box(L("Nivel"),ui.edit?`<input type="number" ${R("C","nivel","n")} value="${C.nivel}">`:`<span class="n">${C.nivel}</span>`)}
        ${box(L("Competencia"),ui.edit?`<input ${R("C","profOv")} value="${esc(C.profOv)}" placeholder="${L("auto")}">`:`<span class="n">${sg(prof())}</span>`)}
        ${box(L("Iniciativa"),`<span class="n">${sg(desMod+(+C.iniExtra||0))}</span>${ui.edit?`<input type="number" ${R("C","iniExtra","n")} value="${C.iniExtra}" title="${L("Bono extra")}">`:""}`)}
        ${box(L("Velocidad"),ui.edit?`<input ${R("C","vel")} value="${esc(C.vel)}">`:`<span class="n">${esc(C.vel)}</span>`)}
        ${box(L("Dados de golpe"),ui.edit?`<input ${R("C","dadosGolpe")} value="${esc(C.dadosGolpe)}">`:`<span class="n">${esc(C.dadosGolpe)}</span>`)}
        ${box(L("Percepción pasiva"),`<span class="n">${percep()}</span>`)}

        ${C.datos.map(d=>{const ref=`C.datos.${d.id}`;return ui.edit?`<div class="box"><input ${R(ref,"l")} value="${esc(d.l)}"><input ${R(ref,"v")} value="${esc(d.v)}"><button class="btn small danger" data-a="del" data-ref="${ref}">×</button></div>`:box(esc(d.l),`<span class="n">${esc(d.v)||"—"}</span>`)}).join("")}
      </div>
      <button class="btn small" data-a="add" data-ref="C.datos" data-kind="dato">+ ${L("Agregar dato (cordura, resistencias…)")}</button>
      <div class="box"><h3 style="margin:0 0 4px">${L("Tiradas de salvación")}</h3>${rollList("saves","save",L("Agregar salvación"))}</div>
      <div class="box">${deathHTML()}</div>
    </div>
    <div class="blk"><div class="box"><h3 style="margin:0 0 4px">${L("Habilidades")}</h3>
      ${ui.edit?`<p class="hint">${L("Nombre · característica · bono extra.")}</p>`:`<p class="hint">${L("Tocá el círculo: nada → competente → experto.")}</p>`}
      ${rollList("skills","skill",L("Agregar habilidad"))}</div></div>
    <div class="blk">
      ${C.textos.map(x=>{const ref=`C.textos.${x.id}`;return`<div class="box">${ui.edit?`<div class="row"><input ${R(ref,"t")} value="${esc(x.t)}" style="flex:1"><button class="btn small danger" data-a="del" data-ref="${ref}">${L("Borrar")}</button></div><textarea ${R(ref,"b")}>${esc(x.b)}</textarea>`
        :`<h3 style="margin:0 0 4px">${esc(x.t)}</h3><div class="pre">${esc(x.b)||`<span class="hint">${L("Vacío. Tocá “Editar”.")}</span>`}</div>`}</div>`}).join("")}
      <button class="btn small" data-a="add" data-ref="C.textos" data-kind="texto">+ ${L("Agregar cuadro de texto")}</button>
    </div>
  </div>`;
}
/* notas */
function flatNotes(nodes=NOTES,path=[],out=[]){nodes.forEach(n=>{out.push({n,path});flatNotes(n.k||[],[...path,n],out)});return out}
function notesTree(nodes,base){
  return nodes.map(n=>{const ref=`${base}.${n.id}`,open=!!ui.open[n.id],kids=n.k||[];
    return`<div class="nd ${n.hecho&&nlook()==="lista"?"done":""}" id="nd-${n.id}"><div class="nd-h">${nlook()==="lista"?`<input type="checkbox" class="nchk" ${R(ref,"hecho","b")} ${n.hecho?"checked":""} aria-label="${L("Hecho")}">`:""}<button class="tg" data-a="tog" data-id="${n.id}">${open?"▾":"▸"}</button><button class="nt" data-a="tog" data-id="${n.id}">${esc(n.t)||"—"}</button>${(n.imgs||[]).length?`<span class="cnt">▣ ${n.imgs.length}</span>`:""}${kids.length?`<span class="cnt">${kids.length}</span>`:""}</div>
      ${open?`<div class="nd-b"><input ${R(ref,"t")} value="${esc(n.t)}" aria-label="${L("Título")}"><textarea ${R(ref,"b")} placeholder="${L("Escribí acá…")}">${esc(n.b)}</textarea>
        ${noteImgs(n,ref)}
        <div class="row"><button class="btn small" data-a="add" data-ref="${ref}.k" data-kind="nota" data-open="${n.id}">+ ${L("Agregar dentro")}</button><button class="btn small danger" data-a="delNote" data-ref="${ref}">${ui.confirm===n.id?L("¿Seguro? Tocá otra vez"):L("Borrar")}</button></div></div>
        ${kids.length?`<div class="nd-k">${notesTree(kids,ref+".k")}</div>`:""}`:""}</div>`}).join("");
}
function notesBody(){
  const q=ui.nq.trim();
  if(!q&&nlook()==="libro")return notesBook();
  if(!q)return`<div class="tree">${notesTree(NOTES,"N")||`<div class="empty">${L("Sin notas todavía.")}</div>`}</div><button class="btn" data-a="add" data-ref="N" data-kind="nota">+ ${L("Nueva carpeta o nota")}</button>`;
  const nq=norm(q),res=flatNotes().filter(({n})=>norm(n.t).includes(nq)||norm(n.b).includes(nq));
  if(!res.length)return`<div class="empty">${L("Nada encontrado para “{0}”.",esc(q))}</div>`;
  return`<p class="hint">${L("{0} resultados",res.length)}</p>`+res.map(({n,path})=>{
    let snip="";const b=n.b||"",i=norm(b).indexOf(nq);if(i>=0){const s=Math.max(0,i-60);snip=(s?"…":"")+b.slice(s,i+nq.length+80)+(i+nq.length+80<b.length?"…":"")}
    return`<button class="card" style="text-align:left" data-a="goNote" data-id="${n.id}"><span class="crumb">${path.map(p=>esc(p.t)).join(" › ")||L("Inicio")}</span><span class="t">${hlText(n.t,q)}</span>${snip?`<span class="d">${hlText(snip,q)}</span>`:""}</button>`}).join("");
}
function paneNotas(){
  return`<h2>${L("Notas")}</h2>${nlookBar()}
  <div class="search"><input id="nq" type="search" placeholder="${L("Buscar en todas las notas (ej.: Goblin celeste)")}" value="${esc(ui.nq)}" aria-label="${L("Buscar")}"></div>
  <div id="notes-body" class="sec nlook-${nlook()}">${notesBody()}</div>
  <p class="hint">${L("Las notas son compartidas por todos los personajes de este dispositivo.")}</p>`;
}

/* ============ página del personaje ============ */
function safe(fn,name){try{return fn()}catch(e){console.error(e);return`<div class="empty" style="border-color:var(--crimson);color:#ff9a9a">${L("Algo falló al mostrar esta parte")} (${esc(name)}): ${esc(e&&e.message||e)}</div>`}}
function renderChar(){
  refillHours();
  let T=ui.tab;if(T&&T.startsWith("p_")&&!(C.pestanas||[]).some(p=>"p_"+p.id===T))T=ui.tab="personaje";
  if(wide()){if(T==="personaje")T=C.combate?"combate":"poderes";if(T==="combate"&&!C.combate)T="poderes"}
  else if(T==="combate")T="personaje";
  const tabs=[["personaje",C.combate?L("Combate"):L("Personaje"),"m"],["combate",L("Combate"),"w"],["poderes",L("Poderes")],["armas",L("Armas")],["cuerpo",L("Cuerpo")],["hoja",L("Hoja")],...(C.pestanas||[]).map(p=>["p_"+p.id,p.n]),["notas",L("Notas")]];
  return`<div class="wrap">${headerHTML()}
  <div class="layout">${safe(()=>figcolHTML(T),"personaje")}
    <div class="panel">
      <nav class="tabs" aria-label="${L("Secciones")}">${tabs.filter(t=>t[0]!=="combate"||C.combate).map(([k,l,f])=>`<button class="${T===k?"on":""}" data-a="tab" data-v="${k}" ${f?"data-"+f:""}>${l}</button>`).join("")}</nav>
      ${C.combate?`<section class="pane ${T==="combate"?"active":""}">${safe(combatPanel,"combate")}</section>`:""}
      <section class="pane ${T==="poderes"?"active":""}">${safe(panePoderes,"poderes")}${safe(()=>cuadrosHTML("poderes"),"cuadros")}</section>
      <section class="pane ${T==="armas"?"active":""}">${safe(paneArmas,"armas")}${safe(()=>cuadrosHTML("armas"),"cuadros")}</section>
      <section class="pane ${T==="cuerpo"?"active":""}">${safe(paneCuerpo,"cuerpo")}${safe(()=>cuadrosHTML("cuerpo"),"cuadros")}</section>
      <section class="pane ${T==="hoja"?"active":""}">${safe(paneHoja,"hoja")}${safe(repHTML,"reputación")}${safe(secHTML,"secretos")}${safe(()=>cuadrosHTML("hoja"),"cuadros")}${ui.edit?safe(pestanasEdit,"pestañas"):""}</section>
${(C.pestanas||[]).map(p=>`<section class="pane ${T==="p_"+p.id?"active":""}">${safe(()=>panePropia(p),"pestaña")}</section>`).join("")}
      <section class="pane ${T==="notas"?"active":""}">${safe(paneNotas,"notas")}</section>
    </div></div></div>${drawerHTML()}${fabHTML()}${horrorHTML()}${mesaHTML()}`;
}
let rendering=false,pendingRender=false;
function render(){
  if(rendering){pendingRender=true;return}
  rendering=true;
  try{applyTema();if(C&&!isMaster()&&ui.screen!=="chars"&&ui.screen!=="wizard"&&!APP.tutDone&&!ui.tutAsked){ui.tutAsked=true;setTimeout(()=>{if(ui.tut==null&&!APP.tutDone)tutStart()},900)}if(ui.lookOpen&&C)setTimeout(renderLook,0);
    const root=document.getElementById("app");
    document.documentElement.lang=LANG;
    const ae=document.activeElement;if(ae&&root.contains(ae)&&ae.matches("input,textarea,select"))ae.blur();
    if(C&&C.enemigo){autoPhase();if(ui.mesaInst&&MS){const i=MS.comb.find(x=>x.id===ui.mesaInst);if(i&&i.charId===C.id&&i.hp!==C.hp.act){i.hp=C.hp.act;saveMaster()}}}
    root.innerHTML=(!C||ui.screen==="chars"||(isMaster()&&!(C&&C.enemigo)))?safe(renderChars,"personajes"):ui.screen==="wizard"?safe(renderWizard,"asistente"):renderChar();
    try{foldApply()}catch(e){}
  }finally{rendering=false}
  if(pendingRender){pendingRender=false;render()}
}

/* ============ asistente de creación ============ */
const WSTEPS=["Datos básicos","Imágenes","Características","Poderes","Armas y objetos","Listo"];
function renderWizard(){
  const s=ui.wstep||0,last=WSTEPS.length-1;
  const nav=`<div class="row sb" style="margin-top:6px"><button class="btn" data-a="wstep" data-v="${s-1}" ${s?"":"disabled"}>← ${L("Anterior")}</button>
    ${s<last?`<button class="btn on" data-a="wstep" data-v="${s+1}">${L("Siguiente")} →</button>`:`<button class="btn on" data-a="wdone">${L("Abrir la ficha")}</button>`}</div>`;
  let body="";
  if(s===0)body=`<p class="hint">${L("Completá lo que sepas. Todo se puede cambiar después.")}</p>
    <label class="lbl">${L("Nombre")}<input ${R("C","nombre")} value="${esc(C.nombre)}"></label>
    <label class="lbl">${L("Clase, raza, descripción corta")}<input ${R("C","clase")} value="${esc(C.clase)}" placeholder="${L("Ej.: Minotauro bárbaro · casi 4 metros")}"></label>
    <h3>${L("Ambientación")}</h3><p class="hint">${L("Cambia colores y letras de la ficha. Se puede cambiar cuando quieras desde el menú ☰.")}</p>${temaPicker()}
    <h3>${L("Tus datos")}</h3><p class="hint">${L("Clase, raza, altura, peso, edad, deidad… Cambiá el nombre de cada dato, borralos o agregá los que quieras.")}</p>
    ${C.datos.map(d=>{const ref=`C.datos.${d.id}`;return`<div class="row" style="flex-wrap:nowrap"><input ${R(ref,"l")} value="${esc(d.l)}" style="flex:1" aria-label="${L("Nombre del dato")}"><input ${R(ref,"v")} value="${esc(d.v)}" style="flex:1.3" placeholder="${L("Valor")}"><button class="btn small danger" data-a="del" data-ref="${ref}" aria-label="${L("Borrar")}">×</button></div>`}).join("")}
    <button class="btn small" data-a="add" data-ref="C.datos" data-kind="dato">+ ${L("Agregar dato")}</button>
    <h3>${L("Para los cálculos")}</h3>
    <div class="grid2"><label class="lbl">${L("Nivel")}<input type="number" ${R("C","nivel","n")} value="${C.nivel}"></label>
    <label class="lbl">${L("Vida máxima (PV)")}<input type="number" data-a3="hpmax" value="${C.hp.max}"></label>
    <label class="lbl">${L("Clase de armadura (CA)")}<input ${R("C","ca")} value="${esc(C.ca)}"></label>
    <label class="lbl">${L("Velocidad")}<input ${R("C","vel")} value="${esc(C.vel)}"></label>
    <label class="lbl">${L("Dados de golpe")}<input ${R("C","dadosGolpe")} value="${esc(C.dadosGolpe)}"></label>
</div>

    <label class="lbl">${L("Historia o rasgos especiales")}<textarea ${R("C.textos."+C.textos[0].id,"b")} placeholder="${L("Quién es, qué le pasó, qué lo hace especial…")}">${esc(C.textos[0].b)}</textarea></label>`;
  if(s===1)body=`<p class="hint">${L("Subí una imagen para cada pose: un dibujo tuyo, un archivo que ya tengas o algo hecho con IA. Las de combate aparecen solas al entrar en combate.")}</p>
    <div class="poses">${C.poses.map(p=>{const ref=`C.poses.${p.id}`,src=getImg(p.img);return`<div class="pcard"><label class="thumb" style="cursor:pointer;${src?`background-image:url(${src})`:""}">${src?"":"＋<br>"+L("Subir imagen")}<input type="file" accept="image/*" data-upload="${p.id}" hidden></label>
      <input ${R(ref,"n")} value="${esc(p.n)}" aria-label="${L("Nombre de la pose")}">
      <label class="lbl inline"><input type="checkbox" ${R(ref,"combate","b")} ${p.combate?"checked":""}> ${L("De combate")}</label>
      <label class="btn small on" style="text-align:center">${src?L("Cambiar imagen"):L("Subir imagen")}<input type="file" accept="image/*" data-upload="${p.id}" hidden></label>
      ${C.poses.length>1?`<button class="btn small danger" data-a="del" data-ref="${ref}">${L("Borrar")}</button>`:""}</div>`}).join("")}</div>
    <button class="btn small" data-a="add" data-ref="C.poses" data-kind="pose">+ ${L("Nueva pose")}</button>
    <h3>${L("Zonas que brillan")}</h3><p class="hint">${L("Tatuajes, hielo, fuego, un halo… Anotalas acá con su parte del cuerpo y color: se suman al pedido para Gemini y después las pintás sobre la imagen.")}</p>
    ${C.efectos.map(e=>{const ref=`C.efectos.${e.id}`;return`<div class="card"><input ${R(ref,"n")} value="${esc(e.n)}" placeholder="${L("Nombre")}"><div class="row"><select ${R(ref,"parte")} style="flex:1">${opts(flatParts().map(p=>[p.id,p.label]),e.parte,L("Parte del cuerpo"))}</select><input type="color" ${R(ref,"c")} value="${e.c}" aria-label="${L("Color")}"><button class="btn small danger" data-a="del" data-ref="${ref}">×</button></div>${stylePicker(e)}</div>`}).join("")}
    <button class="btn small" data-a="add" data-ref="C.efectos" data-kind="efecto">+ ${L("Nueva zona")}</button>
    ${aiBox()}
    <h3>${L("Fondo")}</h3>${bgBox()}
    <p class="hint">${L("Las zonas que brillan (tatuajes, hielo, fuego…) se pintan después en Cuerpo → Zonas que brillan.")}</p>`;
  if(s===2)body=`<p class="hint">${L("Escribí el valor de cada característica. Podés renombrarlas, borrarlas o agregar nuevas.")}</p>
    ${C.stats.map(st=>{const ref=`C.stats.${st.id}`;return`<div class="skedit" style="grid-template-columns:4.2em minmax(0,1fr) 4.6em auto"><input ${R(ref,"k")} value="${esc(st.k)}"><input ${R(ref,"n")} value="${esc(st.n)}"><input type="number" inputmode="numeric" ${R(ref,"v","n")} value="${st.v}"><button class="btn small danger" data-a="del" data-ref="${ref}">×</button></div>`}).join("")}
    <button class="btn small" data-a="add" data-ref="C.stats" data-kind="stat">+ ${L("Nueva característica")}</button>
    <p class="hint">${L("Las habilidades y salvaciones se marcan después en la pestaña Hoja.")}</p>`;
  if(s===3)body=`<p class="hint">${L("Armá grupos con los poderes del personaje y escribí qué hace cada uno. Los detalles (usos, duración, qué gastan) se ajustan después con Editar.")}</p>
    ${C.grupos.map(g=>{const ref=`C.grupos.${g.id}`;return`<div class="grp"><div class="gh"><input ${R(ref,"n")} value="${esc(g.n)}" style="flex:1;font-family:var(--display);font-size:1.1rem"><button class="btn small danger" data-a="del" data-ref="${ref}">${L("Borrar grupo")}</button></div>
      ${g.items.map(it=>{const r2=`${ref}.items.${it.id}`;return`<div class="card"><input ${R(r2,"n")} value="${esc(it.n)}" placeholder="${L("Nombre")}"><textarea ${R(r2,"d")} placeholder="${L("Qué hace")}">${esc(it.d)}</textarea><button class="btn small danger" data-a="del" data-ref="${r2}">${L("Borrar")}</button></div>`}).join("")}
      <button class="btn small" data-a="add" data-ref="${ref}.items" data-kind="item">+ ${L("Agregar a {0}",esc(g.n))}</button></div>`}).join("")}
    <button class="btn" data-a="add" data-ref="C.grupos" data-kind="grupo">+ ${L("Nuevo grupo (ej.: Magia malacálica, Canciones, Dotes)")}</button>
    <h3>${L("Recursos")}</h3><p class="hint">${L("Espacios de conjuro, usos de maniobras, puntos de ki… lo que se gasta y se recarga.")}</p>
    ${C.recursos.map(r=>{const ref=`C.recursos.${r.id}`;return`<div class="row"><input ${R(ref,"n")} value="${esc(r.n)}" style="flex:1"><input type="number" ${R(ref,"max","n")} value="${r.max}" style="width:4.5em" aria-label="${L("Máximo")}"><button class="btn small danger" data-a="del" data-ref="${ref}">×</button></div>`}).join("")}
    <button class="btn small" data-a="add" data-ref="C.recursos" data-kind="recurso">+ ${L("Nuevo recurso")}</button>`;
  if(s===4)body=`<h3>${L("Armas y ataques")}</h3>
    ${C.armas.map(a=>{const ref=`C.armas.${a.id}`;return`<div class="card"><input ${R(ref,"n")} value="${esc(a.n)}" placeholder="${L("Nombre")}"><div class="grid2"><label class="lbl">${L("Bono de ataque")}<input ${R(ref,"b")} value="${esc(a.b)}"></label><label class="lbl">${L("Daño")}<input ${R(ref,"d")} value="${esc(a.d)}"></label></div><button class="btn small danger" data-a="del" data-ref="${ref}">${L("Borrar")}</button></div>`}).join("")}
    <button class="btn small" data-a="add" data-ref="C.armas" data-kind="arma">+ ${L("Nueva arma")}</button>
    <h3>${L("Ítems mágicos")}</h3>
    ${C.magicos.map(m=>{const ref=`C.magicos.${m.id}`;return`<div class="card"><input ${R(ref,"n")} value="${esc(m.n)}" placeholder="${L("Nombre")}"><textarea ${R(ref,"d")} placeholder="${L("Qué hace")}">${esc(m.d)}</textarea><button class="btn small danger" data-a="del" data-ref="${ref}">${L("Borrar")}</button></div>`}).join("")}
    <button class="btn small" data-a="add" data-ref="C.magicos" data-kind="magico">+ ${L("Nuevo ítem mágico")}</button>
    ${C.inventarios.map(iv=>{const ref=`C.inventarios.${iv.id}`;return`<h3>${esc(iv.t)}</h3>${iv.items.map(x=>{const r2=`${ref}.items.${x.id}`;return`<div class="row"><input ${R(r2,"n")} value="${esc(x.n)}" placeholder="${L("Qué es")}" style="flex:1"><button class="btn small danger" data-a="del" data-ref="${r2}">×</button></div>`}).join("")}<button class="btn small" data-a="add" data-ref="${ref}.items" data-kind="invItem">+ ${L("Agregar")}</button>`}).join("")}`;
  if(s===5)body=`<div class="card"><div class="t">${L("¡{0} está listo!",esc(C.nombre))}</div>
    <p class="hint">${L("Lo que podés hacer ahora en la ficha:")}</p>
    <div class="pre">• ${L("Cuerpo → Zonas que brillan: pintá tatuajes, hielo o fuego sobre cada pose.")}
• ${L("Cuerpo → Partes del cuerpo: notas por parte y extremidades extra.")}
• ${L("Armas → Medidores, contadores y barras.")}
• ${L("Hoja: habilidades, salvaciones y datos extra.")}
• ${L("Tocá Editar en cualquier pestaña para cambiar o borrar lo que quieras.")}</div></div>`;
  return`<div class="wrap" style="max-width:720px"><header><div class="brand">${LOGO}<span>Telita de Mistra</span></div><button class="btn small" data-a="wdone">${L("Saltar asistente")}</button></header>
    <div class="row" style="gap:4px">${WSTEPS.map((t,i)=>`<button class="chip pose ${i===s?"on":""}" data-a="wstep" data-v="${i}">${i+1}. ${L(t)}</button>`).join("")}</div>
    <div class="pane active"><h2>${s+1}. ${L(WSTEPS[s])}</h2>${body}${nav}</div></div>`;
}

/* ============ plantillas de pose ============ */
const PTPL={
  normal:{n:"De pie",j:{h:[200,70],n:[200,105],sl:[250,125],sr:[150,125],el:[262,215],er:[138,215],hl:[268,300],hr:[132,300],pl:[228,300],pr:[172,300],kl:[232,430],kr:[168,430],fl:[236,570],fr:[164,570]}},
  ataque:{n:"Ataque",j:{h:[214,82],n:[211,116],sl:[258,138],sr:[164,132],el:[292,212],er:[112,92],hl:[318,282],hr:[72,44],pl:[236,312],pr:[182,306],kl:[272,440],kr:[128,420],fl:[332,570],fr:[80,566]}},
  defensa:{n:"Defensa",j:{h:[200,76],n:[200,111],sl:[252,131],sr:[148,131],el:[252,214],er:[148,214],hl:[166,170],hr:[234,170],pl:[230,306],pr:[170,306],kl:[264,432],kr:[136,432],fl:[292,570],fr:[108,570]}},
  hechizo:{n:"Lanzando un hechizo",j:{h:[200,72],n:[200,107],sl:[250,127],sr:[150,127],el:[302,150],er:[98,150],hl:[346,96],hr:[54,96],pl:[228,302],pr:[172,302],kl:[250,432],kr:[150,432],fl:[270,570],fr:[130,570]}},
  cantando:{n:"Cantando",j:{h:[208,66],n:[204,102],sl:[252,124],sr:[152,122],el:[248,210],er:[108,150],hl:[206,174],hr:[78,88],pl:[228,300],pr:[172,300],kl:[238,430],kr:[166,430],fl:[246,570],fr:[160,570]}},
  sentado:{n:"Sentado en el suelo",j:{h:[200,262],n:[200,296],sl:[248,314],sr:[152,314],el:[268,392],er:[132,392],hl:[262,462],hr:[138,462],pl:[226,480],pr:[174,480],kl:[300,520],kr:[100,520],fl:[226,560],fr:[174,560]}},
  durmiendo:{n:"Durmiendo (acostado)",rot:true}
};
function poseSVG(key){
  const T=PTPL[key];let j=T.j,tr="";
  if(T.rot){j=PTPL.normal.j;tr=` transform="translate(200 470) rotate(-90) scale(.62) translate(-200 -312)"`}
  const L2=(a,b,w)=>`<line x1="${j[a][0]}" y1="${j[a][1]}" x2="${j[b][0]}" y2="${j[b][1]}" stroke-width="${w}"/>`;
  const torso=`M${j.sl} L${j.sr} L${j.pr} L${j.pl} Z`;
  return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600"><rect width="400" height="600" fill="#fff"/><g${tr}><g stroke="#8d8d93" stroke-linecap="round" fill="none">${L2("pl","kl",36)}${L2("kl","fl",30)}${L2("pr","kr",36)}${L2("kr","fr",30)}${L2("n","h",20)}</g><path d="${torso}" fill="#8d8d93" stroke="#8d8d93" stroke-width="22" stroke-linejoin="round"/><circle cx="${j.h[0]}" cy="${j.h[1]-6}" r="32" fill="#8d8d93"/><g stroke="#6f6f76" stroke-linecap="round" fill="none">${L2("sl","el",30)}${L2("el","hl",26)}${L2("sr","er",30)}${L2("er","hr",26)}</g></g></svg>`;
}
const poseURI=k=>"data:image/svg+xml,"+encodeURIComponent(poseSVG(k));
