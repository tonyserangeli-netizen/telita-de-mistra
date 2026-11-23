/* ============ enemigos = fichas completas ============ */
const enemChars=()=>APP.chars.filter(x=>x.enem);
const playerChars=()=>APP.chars.filter(x=>!x.enem);
/* fases automáticas por vida (poses con "umbral") */
function autoPhase(){
  if(!C||!C.enemigo)return;const ps=C.poses.filter(p=>p.umbral!==undefined&&p.umbral!==""&&p.umbral!==null&&C.hp.act<=+p.umbral).sort((a,b)=>(+a.umbral)-(+b.umbral));
  const t=ps[0];
  if(t&&C._fase!==t.id){C._fase=t.id;C.pose=t.id;ui.phaseFlash=Date.now();setTimeout(()=>{toast(L("¡{0} cambia de fase: {1}!",C.nombre,t.n));vib([200,100,200])},50);if(C.sndEv&&C.sndEv.fase)setTimeout(()=>playSnd(C.sndEv.fase),80)}
  else if(!t&&C._fase){C._fase="";const d=C.poses.find(p=>p.combate&&(p.umbral===undefined||p.umbral===""))||C.poses[0];if(d)C.pose=d.id}
}
function phaseEdit(p,ref){if(!C.enemigo)return"";return`<label class="lbl inline">${L("Fase: aparece con vida en")} <input type="number" ${R(ref,"umbral")} value="${p.umbral??""}" placeholder="—" style="width:4.5em"> ${L("o menos")}</label>`}
/* mostrar a la mesa: la ficha viva en pantalla completa */
function mesaHTML(){
  if(!ui.mesa||!C)return"";const amb=C.amb||"";const hp=C.hp.max?C.hp.act/C.hp.max:1;const f=C.poses.find(p=>p.id===C.pose);
  const salud=!C.enemigo||(MS&&MS.salud==="nada")?"":hp<=0?L("Derrotado"):hp<.25?L("Al borde de la muerte"):hp<.5?L("Muy herido"):hp<.9?L("Herido"):L("Ileso");
  const flash=ui.phaseFlash&&Date.now()-ui.phaseFlash<1500;
  return`<div class="mesa amb-${amb} ${flash?"phase":""}"><div class="mesastage">${stageHTML()}</div><div class="ambfx"></div>
    <div class="mscap"><div class="msname">${esc(C.nombre)}</div>${C.enemigo&&f&&f.umbral!==undefined&&f.umbral!==""?`<div class="msfase">${esc(f.n)}</div>`:""}${salud?`<div class="mshealth">${salud}</div>`:""}</div>
    <div class="mesabar ${ui.mesaBar?"open":""}"><button class="btn small" data-a="mesaBar" aria-label="${L("Controles")}">${ui.mesaBar?"▾":"⚙"}</button>
      ${ui.mesaBar?`<div class="mbody"><div class="chips">${C.poses.map(p=>`<button class="chip pose ${p.id===C.pose?"on":""}" data-a="pose" data-id="${p.id}">${esc(p.n)}</button>`).join("")}</div>
        ${quickToggles()}
        <div class="row"><input id="hp-in2" type="number" inputmode="numeric" min="0" placeholder="0" style="width:5em"><button class="btn small dmg" data-a="dmg">${L("Daño")}</button><button class="btn small heal" data-a="heal">${L("Curar")}</button>
        <select data-mesaamb>${opts(AMB.map(([k,n])=>[k,L(n)]),amb)}</select><button class="btn small" data-a="mesaOff">✕ ${L("Cerrar")}</button></div></div>`:""}</div></div>`;
}
async function newEnemy(){const c=newChar(L("Enemigo nuevo"));c.enemigo=true;c.hp={act:50,max:50,temp:0};c.poses=[{id:"pE",n:L("Normal"),img:"",combate:true}];c.pose="pE";
  await DB.set("c_"+c.id,c);APP.chars.push({id:c.id,n:c.nombre,enem:true});await DB.set("index",APP);await openChar(c.id);ui.screen="char";ui.tab="cuerpo";ui.edit=true;render();toast(L("Subí su imagen en Poses y armale lo que quieras"))}
/* migrar enemigos de la versión anterior (plantillas simples) a fichas */
async function migrateEnem(){await loadMaster();if(!MS.enem||!MS.enem.length)return;
  for(const e of MS.enem){if(e.charId)continue;const c=newChar(e.n||L("Enemigo"));c.enemigo=true;c.hp={act:+e.hpmax||30,max:+e.hpmax||30,temp:0};c.ca=e.ca||10;c.amb=e.amb||"";
    c.poses=[{id:"pE",n:L("Normal"),img:e.img||"",combate:true}].concat((e.fases||[]).map(f=>({id:"p"+f.id,n:f.n,img:f.img||e.img||"",combate:true,umbral:f.umbral})));c.pose="pE";
    if(e.nota)c.textos=[{id:uid(),t:L("Notas del máster"),b:e.nota}].concat(c.textos||[]);
    (e.fases||[]).forEach(f=>{if(f.nota)c.textos.push({id:uid(),t:f.n,b:f.nota})});
    if(+e.leg)c.recursos.push({id:uid(),n:L("Acciones legendarias"),act:+e.leg,max:+e.leg,rec:"largo"});
    await DB.set("c_"+c.id,c);APP.chars.push({id:c.id,n:c.nombre,enem:true,th:e.img||null});e.charId=c.id;MS.comb.forEach(x=>{if(x.enemId===e.id)x.charId=c.id})}
  MS.enem=[];await DB.set("master",MS);await DB.set("index",APP)}
