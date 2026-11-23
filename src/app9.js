/* ============ apariencia: estilos por elemento ============ */
const LOOKS={
  hp:[["barra","Barra"],["corazon","Corazón"],["frasco","Frasco"],["monitor","Monitor vital"],["escudo","Escudo"]],
  muerte:[["puntos","Puntos"],["velas","Velas"],["corazon","Corazón sangrante"],["reactor","Celdas de energía"],["engranajes","Engranajes"],["calaveras","Calaveras"],["runas","Runas"]],
  rec:[["pips","Puntos"],["gemas","Gemas"],["llamas","Llamas"],["runas","Runas"],["baterias","Baterías"],["calaveras","Calaveras"]],
};
const TEMA_LOOK={medieval:{hp:"barra",muerte:"velas",rec:"gemas"},scifi:{hp:"monitor",muerte:"reactor",rec:"baterias"},steampunk:{hp:"frasco",muerte:"engranajes",rec:"gemas"},
  terror:{hp:"corazon",muerte:"corazon",rec:"llamas"},feerico:{hp:"frasco",muerte:"runas",rec:"runas"},pirata:{hp:"escudo",muerte:"calaveras",rec:"calaveras"},moderno:{hp:"barra",muerte:"puntos",rec:"pips"},claro:{hp:"barra",muerte:"velas",rec:"gemas"}};
function look(k,o){if(o&&o.look)return o.look;const c=(C.look||{})[k];if(c)return c;const t=TEMA_LOOK[(C.tema||APP.tema||"medieval")]||TEMA_LOOK.medieval;return t[k]}
function lookPicker(k,ref){const cur=ref?((resolve(ref)||{}).obj||{}).look||"":((C.look||{})[k]||"");
  return`<div class="lookp"><span class="hint">${L("Apariencia")}:</span><div class="chips">${[["","Según ambientación"],...LOOKS[k]].map(([v,n])=>`<button class="chip ${cur===v?"on":""}" data-a="look" data-k="${k}" data-v="${v}"${ref?` data-ref="${ref}"`:""}>${L(n)}</button>`).join("")}</div></div>`}

/* ---- íconos ---- */
const IC={
  vela:(lit,col)=>`<svg viewBox="0 0 20 44"><path d="M4 18h12v24H4Z" fill="${col}"/><path d="M4 18q3 3 6 0t6 0v4q-3 2-6 0t-6 0Z" fill="#000" opacity=".12"/><path d="M10 18v-4" stroke="#333" stroke-width="1.4"/>${lit?`<g class="flame"><path d="M10 3q5 6 0 11q-5-5 0-11Z" fill="#ffb02e"/><path d="M10 7q2.5 3.5 0 6q-2.5-2.5 0-6Z" fill="#fff3b0"/></g>`:`<path class="smoke" d="M10 13q-3-3 0-6t0-6" stroke="#888" fill="none" opacity=".5"/>`}</svg>`,
  gota:on=>`<svg viewBox="0 0 16 22"><path d="M8 1Q15 11 15 14a7 7 0 0 1-14 0Q1 11 8 1Z" fill="${on?"#9e0b12":"none"}" stroke="#9e0b12" stroke-width="1.4"/>${on?`<ellipse cx="5.5" cy="13" rx="1.6" ry="2.4" fill="#fff" opacity=".35"/>`:""}</svg>`,
  latido:on=>`<svg viewBox="0 0 24 22"><path d="M12 21 2 11a5.5 5.5 0 0 1 10-7 5.5 5.5 0 0 1 10 7Z" fill="${on?"#e0243a":"none"}" stroke="#e0243a" stroke-width="1.5"/></svg>`,
  celda:(on,c)=>`<svg viewBox="0 0 16 28"><rect x="5" y="1" width="6" height="3" fill="#7a8a96"/><rect x="1.5" y="4" width="13" height="23" rx="2" fill="none" stroke="${c}" stroke-width="1.5"/>${on?`<rect class="cell" x="4" y="7" width="8" height="17" rx="1" fill="${c}"/>`:""}</svg>`,
  engr:(on,c)=>`<svg viewBox="0 0 24 24"><g class="${on?"gear":""}" style="transform-origin:12px 12px"><path d="M10 1h4l.6 3 2.4 1 2.6-1.7 2.8 2.8-1.7 2.6 1 2.4 3 .6v4l-3 .6-1 2.4 1.7 2.6-2.8 2.8-2.6-1.7-2.4 1-.6 3h-4l-.6-3-2.4-1-2.6 1.7-2.8-2.8 1.7-2.6-1-2.4-3-.6v-4l3-.6 1-2.4-1.7-2.6 2.8-2.8 2.6 1.7 2.4-1Z" fill="${on?c:"none"}" stroke="${c}" stroke-width="1.2"/><circle cx="12" cy="12" r="3.5" fill="var(--panel)"/></g></svg>`,
  calavera:(on,c)=>`<svg viewBox="0 0 22 24"><path d="M11 1a9 9 0 0 0-9 9c0 3 1.5 5 3 6v4h12v-4c1.5-1 3-3 3-6a9 9 0 0 0-9-9Z" fill="${on?c:"none"}" stroke="${c}" stroke-width="1.4"/><circle cx="7.5" cy="11" r="2.3" fill="${on?"#111":c}"/><circle cx="14.5" cy="11" r="2.3" fill="${on?"#111":c}"/><path d="M9 20v3M11 20v3M13 20v3" stroke="${on?"#111":c}"/></svg>`,
  ancla:(on,c)=>`<svg viewBox="0 0 22 24"><circle cx="11" cy="4" r="2.5" fill="none" stroke="${c}" stroke-width="1.6"/><path d="M11 6.5V22M6 10h10M2 15q1 7 9 7t9-7" fill="none" stroke="${c}" stroke-width="${on?2.4:1.3}" opacity="${on?1:.45}"/></svg>`,
  runa:(on,c,i)=>`<svg viewBox="0 0 22 26"><path d="M3 4 11 1l8 3 1 17-9 4-9-4Z" fill="${on?c:"#2a2733"}" opacity="${on?1:.8}" stroke="${c}" stroke-width="1"/><path d="${["M8 7v12M8 9l6 4-6 4","M11 6v14M7 9l8 8M15 9l-8 8","M7 7h8l-8 12h8","M11 6l-4 6 4 6 4-6Z","M7 6v14M15 6v14M7 13h8","M8 6l6 6-6 6M14 6v12"][i%6]}" fill="none" stroke="${on?"#111":c}" stroke-width="1.6"/></svg>`,
  gema:(on,c)=>`<svg viewBox="0 0 22 22"><path d="M6 2h10l5 6-10 13L1 8Z" fill="${on?c:"none"}" stroke="${c}" stroke-width="1.3"/>${on?`<path d="M1 8h20M6 2l5 6 5-6M11 8v13" stroke="#fff" stroke-opacity=".35" fill="none"/>`:""}</svg>`,
  llama:(on,c)=>`<svg viewBox="0 0 18 24"><path class="${on?"flame":""}" d="M9 1q8 9 6 15a6.5 6.5 0 0 1-12 0Q2 11 6 8q0 4 3 5Q7 7 9 1Z" fill="${on?c:"none"}" stroke="${c}" stroke-width="1.3"/>${on?`<path d="M9 12q4 4 1 9-5-1-3-5" fill="#fff3b0" opacity=".7"/>`:""}</svg>`,
};

/* ---- salvaciones contra muerte ---- */
function deathCfg(){C.muerteCfg=C.muerteCfg||{ok:3,fail:3};return C.muerteCfg}
function deathIcon(st,kind,on,i){
  switch(st){
    case "velas":return IC.vela(on,kind==="ok"?"#efe6d2":"#4a4252");
    case "corazon":return kind==="ok"?IC.latido(on):IC.gota(on);
    case "reactor":return IC.celda(on,kind==="ok"?"#39ffb0":"#ff3b5c");
    case "engranajes":return IC.engr(on,kind==="ok"?"#c8893a":"#b8432a");
    case "calaveras":return kind==="ok"?IC.ancla(on,"#e0b45c"):IC.calavera(on,"#e3d6d0");
    case "runas":return IC.runa(on,kind==="ok"?"#7fe0a0":"#c08bff",i+(kind==="ok"?0:3));
    default:return"";
  }
}
function deathHTML(){
  const cf=deathCfg(),st=look("muerte");
  const row=kind=>Array.from({length:Math.max(1,+cf[kind]||3)},(_,i)=>{const on=i<C.muerte[kind];return`<button class="dp ${kind==="fail"?"f":""} ${on?"on":""} st-${st}" data-a="death" data-v="${kind}" data-i="${i}" aria-label="${L(kind==="ok"?"Éxito":"Fallo")} ${i+1}" aria-pressed="${on}">${deathIcon(st,kind,on,i)}</button>`}).join("");
  const heart=st==="corazon"?`<div class="bheart" style="--d:${clamp(C.muerte.fail/(+cf.fail||3),0,1)}"><svg viewBox="0 0 64 60"><defs><clipPath id="bhc"><path d="M32 58 5 31A15 15 0 0 1 32 11a15 15 0 0 1 27 20Z"/></clipPath></defs><path d="M32 58 5 31A15 15 0 0 1 32 11a15 15 0 0 1 27 20Z" fill="#2a0508" stroke="#9e0b12" stroke-width="2"/><rect clip-path="url(#bhc)" x="0" y="${(C.muerte.fail/(+cf.fail||3))*60}" width="64" height="60" fill="#c3141f" class="bfill"/></svg>${C.muerte.fail?Array.from({length:C.muerte.fail},(_,i)=>`<i class="drip" style="left:${38+i*9}%;animation-delay:${i*.45}s"></i>`).join(""):""}</div>`:"";
  const ecg=st==="reactor"?`<svg class="ecg ${C.muerte.fail>=+cf.fail?"flat":""}" viewBox="0 0 200 30" preserveAspectRatio="none"><path d="${C.muerte.fail>=+cf.fail?"M0 15H200":"M0 15h60l6-10 8 22 6-12h40l6-10 8 22 6-12h60"}" fill="none" stroke="#39ffb0" stroke-width="2"/></svg>`:"";
  return`<h3>${L("Salvaciones contra muerte")}</h3>${heart}${ecg}<div class="death look-${st}"><span>${L("Éxitos")}</span><div class="pp">${row("ok")}</div><span>${L("Fallos")}</span><div class="pp">${row("fail")}</div></div>
  ${ui.edit?`<div class="grid2" style="margin-top:6px"><label class="lbl">${L("Éxitos necesarios")}<input type="number" min="1" max="12" ${R("C.muerteCfg","ok","n")} value="${cf.ok}"></label><label class="lbl">${L("Fallos para morir")}<input type="number" min="1" max="12" ${R("C.muerteCfg","fail","n")} value="${cf.fail}"></label></div>${lookPicker("muerte")}`:""}`;
}

/* ---- vida ---- */
function hpVisual(pct,tpct,tmp){
  const st=look("hp"),low=pct<=.3,P=Math.round(pct*100);
  const tmpBar=tmp?`<div class="meter tmpm" title="${L("Sobrevida")}"><i style="width:${tpct*100}%"></i></div>`:"";
  if(st==="corazon")return`<div class="hpv hheart ${low?"low":""}"><svg viewBox="0 0 64 60"><defs><clipPath id="hpc"><path d="M32 58 5 31A15 15 0 0 1 32 11a15 15 0 0 1 27 20Z"/></clipPath></defs><path d="M32 58 5 31A15 15 0 0 1 32 11a15 15 0 0 1 27 20Z" fill="#1a0a0c" stroke="#9e0b12" stroke-width="2"/><rect clip-path="url(#hpc)" x="0" y="${60-pct*50-6}" width="64" height="70" fill="#c3141f"/><path d="M14 22q4-7 10-6" stroke="#fff" stroke-opacity=".3" stroke-width="3" fill="none" stroke-linecap="round"/></svg>${low&&pct>0?`<i class="drip" style="left:48%"></i>`:""}</div>${tmpBar}`;
  if(st==="frasco")return`<div class="hpv hflask"><svg viewBox="0 0 60 64"><defs><clipPath id="fkc"><path d="M24 4h12v14q20 8 20 26a26 18 0 0 1-52 0q0-18 20-26Z"/></clipPath></defs><path d="M24 4h12v14q20 8 20 26a26 18 0 0 1-52 0q0-18 20-26Z" fill="rgba(200,220,235,.08)" stroke="#9fb3c0" stroke-width="2"/><g clip-path="url(#fkc)"><rect x="0" y="${62-pct*44}" width="60" height="64" fill="${low?"#c3141f":"#d6233a"}"/><circle class="bub" cx="22" cy="54" r="2" fill="#fff" opacity=".4"/><circle class="bub b2" cx="34" cy="56" r="1.5" fill="#fff" opacity=".4"/></g><rect x="22" y="1" width="16" height="5" rx="2" fill="#8a6440"/></svg></div>${tmpBar}`;
  if(st==="monitor"){const sp=(0.4+ (1-pct)*1.2).toFixed(2);const col=pct>.6?"#39ffb0":pct>.3?"#ffd84a":"#ff3b5c";
    return`<div class="hpv hmon" style="--c:${col};--sp:${pct>0?(2.4-1.6*(1-pct)).toFixed(2):0}s"><svg viewBox="0 0 200 40" preserveAspectRatio="none"><path class="${pct>0?"beat":""}" d="${pct>0?"M0 20h40l5-12 7 26 6-14h30l5-12 7 26 6-14h30l5-12 7 26 6-14h20":"M0 20H200"}" fill="none" stroke="var(--c)" stroke-width="2"/></svg><div class="segs">${Array.from({length:20},(_,i)=>`<i class="${i<Math.ceil(pct*20)?"on":""}"></i>`).join("")}</div></div>${tmpBar}`}
  if(st==="escudo")return`<div class="hpv hshield ${low?"low":""}"><svg viewBox="0 0 54 62"><defs><clipPath id="shc"><path d="M27 2 50 10v18c0 16-10 26-23 32C14 54 4 44 4 28V10Z"/></clipPath></defs><path d="M27 2 50 10v18c0 16-10 26-23 32C14 54 4 44 4 28V10Z" fill="#1a1a22" stroke="var(--gold)" stroke-width="2.5"/><rect clip-path="url(#shc)" x="0" y="${62-pct*60}" width="54" height="62" fill="var(--gold)" opacity=".85"/>${pct<.66?`<path d="M20 8l5 12-4 8 6 10" stroke="#111" stroke-width="2" fill="none"/>`:""}${pct<.33?`<path d="M38 14l-6 10 5 8-4 10" stroke="#111" stroke-width="2" fill="none"/>`:""}</svg></div>${tmpBar}`;
  return`<div class="sec" style="gap:3px"><div class="meter"><i style="width:${pct*100}%"></i></div>${tmpBar}</div>`;
}

/* ---- recursos (espacios de conjuro, ki, etc.) ---- */
function resIcons(r){
  const st=look("rec",r),c=r.c||"var(--gold)";const n=r.max;
  if(st==="pips"||n>20)return`<div class="pips">${Array.from({length:Math.min(n,20)},(_,i)=>`<span class="pip ${i>=r.act?"used":""}" style="${r.c?`background:${r.c}`:""}"></span>`).join("")}</div>`;
  const f={gemas:on=>IC.gema(on,c),llamas:on=>IC.llama(on,c),runas:(on,i)=>IC.runa(on,c,i),baterias:on=>IC.celda(on,c),calaveras:on=>IC.calavera(on,c)}[st]||(on=>IC.gema(on,c));
  return`<div class="ricons st-${st}">${Array.from({length:n},(_,i)=>`<i class="${i<r.act?"on":"used"}">${f(i<r.act,i)}</i>`).join("")}</div>`;
}

/* ---- ventana de apariencia ---- */
function openLook(){const m=document.getElementById("modal");m.onclick=m.oninput=m.onchange=null;ui.lookOpen=true;renderLook()}
function renderLook(){
  const m=document.getElementById("modal");if(!ui.lookOpen)return;
  m.innerHTML=`<div class="dsheet" data-lookm><div class="dpanel"><div class="row sb"><h2 style="margin:0;font-family:var(--display)">${L("Apariencia de {0}",esc(C.nombre))}</h2><button class="btn small" data-lk="close">✕</button></div>
    <p class="hint">${L("Cada cosa puede tener su propio estilo. \"Según ambientación\" cambia solo cuando cambiás la ambientación.")}</p>
    <h3>${L("Ambientación")}</h3>${temaPicker()}
    <h3>${L("Vida")}</h3>${lookPicker("hp")}<div class="lkprev">${hpVisual(clamp(C.hp.act/(C.hp.max||1),0,1),0,0)}</div>
    <h3>${L("Salvaciones contra muerte")}</h3><div class="lkprev">${deathHTML().replace(/<h3>.*?<\/h3>/,"")}</div>
    ${ui.edit?"":`<div class="grid2"><label class="lbl">${L("Éxitos necesarios")}<input type="number" min="1" max="12" ${R("C.muerteCfg","ok","n")} value="${deathCfg().ok}"></label><label class="lbl">${L("Fallos para morir")}<input type="number" min="1" max="12" ${R("C.muerteCfg","fail","n")} value="${deathCfg().fail}"></label></div>${lookPicker("muerte")}`}
    <h3>${L("Modo terror")}</h3><label class="row hint" style="gap:6px"><input type="checkbox" ${R("C","terror","b")} ${C.terror?"checked":""} style="width:auto"> ${L("La pantalla se oscurece y tiembla a medida que perdés vida, con parpadeos y sangre en los bordes.")}</label>
    <h3>${L("Contadores")}</h3>${lookPicker("cnt")}${(C.contadores||[]).map(k=>`<div class="card"><b>${esc(k.n)}</b>${lookPicker("cnt","C.contadores."+k.id)}</div>`).join("")}
    <h3>${L("Medidores")}</h3>${lookPicker("med")}${(C.medidores||[]).map(M=>`<div class="card"><b>${esc(M.n)}</b>${medVisual(Object.assign({},M,{look:M.look||(C.look||{}).med||"barra"}))||""}${lookPicker("med","C.medidores."+M.id)}</div>`).join("")}
    <h3>${L("Recursos y espacios de conjuro")}</h3><p class="hint">${L("Estilo para todos:")}</p>${lookPicker("rec")}
    ${C.recursos.map(r=>{const ref=`C.recursos.${r.id}`;return`<div class="card"><div class="row sb"><b>${esc(r.n)}</b><label class="lbl inline">${L("Color")} <input type="color" ${R(ref,"c")} value="${r.c||"#d9a845"}"></label></div>${resIcons(r)}${lookPicker("rec",ref)}</div>`}).join("")||`<p class="hint">${L("Este personaje no tiene recursos todavía.")}</p>`}
  </div></div>`;
}
(function(){
  document.addEventListener("click",e=>{const b=e.target.closest("[data-lk]");if(!b)return;if(b.dataset.lk==="close"){ui.lookOpen=false;document.getElementById("modal").innerHTML=""}},true);
})();
