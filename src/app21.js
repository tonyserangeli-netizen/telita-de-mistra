/* ============ bestiario, dificultad, generadores, estados y ambiente (máster) ============ */
let BEST=null;
async function loadBest(){if(!BEST){try{BEST=(await(await fetch("bestiario-es.json")).json()).m}catch(e){BEST=[]}}return BEST}
const crLabel=m=>`${L("VD")} ${m.cr}`;
function statBlock(m){
  const md=v=>{const x=Math.floor((v-10)/2);return(x>=0?"+":"")+x};const AB6=["FUE","DES","CON","INT","SAB","CAR"];
  const sec=(t,k)=>{const a=m.a.filter(x=>x.t===k);return a.length?`<h4>${L(t)}</h4>${a.map(x=>`<p><b><i>${esc(x.n)}.</i></b> ${esc(x.d).replace(/\n/g,"<br>")}</p>`).join("")}`:""};
  return`<div class="sblock"><h3>${esc(m.n)}</h3><div class="sbty">${esc(m.ty)}</div><hr>
    <p><b>CA</b> ${m.ca} · <b>${L("PV")}</b> ${m.hp} (${esc(m.hpf)}) · <b>${L("Velocidad")}</b> ${esc(m.vel)}</p><hr>
    <div class="sbab">${m.ab.map((v,i)=>`<div><b>${AB6[i]}</b><span>${v} (${md(v)})</span></div>`).join("")}</div><hr>
    ${m.sv?`<p><b>${L("Salvaciones")}</b> ${esc(m.sv)}</p>`:""}${m.sk?`<p><b>${L("Habilidades")}</b> ${esc(m.sk)}</p>`:""}
    ${m.res?`<p><b>${L("Resistencias")}</b> ${esc(m.res)}</p>`:""}${m.inm?`<p><b>${L("Inmunidades")}</b> ${esc(m.inm)}</p>`:""}${m.vul?`<p><b>${L("Vulnerabilidades")}</b> ${esc(m.vul)}</p>`:""}${m.ci?`<p><b>${L("Inmune a estados")}</b> ${esc(m.ci)}</p>`:""}
    <p><b>${L("Sentidos")}</b> ${esc(m.sen)}</p><p><b>${L("Desafío")}</b> ${m.cr} (${m.xp} PX)</p><hr>
    ${sec("Rasgos","rasgo")}${sec("Acciones","accion")}${sec("Acciones adicionales","bonus")}${sec("Reacciones","reaccion")}${sec("Acciones legendarias","legendaria")}${sec("Conjuros","conjuro")}</div>`;
}
function dmgToSheet(s){const dice=[...String(s||"").matchAll(/\((\d+d\d+)(?: ([+-]) (\d+))?\)/g)];if(!dice.length)return s||"";const ty=(String(s).match(/de daño ([^,.]+?)(?: más|,|\.|$)/)||[])[1]||"";
  return dice.map((d,i)=>d[1]+(d[2]&&i===0?d[2]+d[3]:"")).join("+")+(ty?" "+ty:"")}
function monsterToChar(m){
  const c=newChar(m.n);c.enemigo=true;c.srd=m.en;c.clase=`${m.ty} · ${crLabel(m)}`;c.ca=m.ca;c.hp={act:m.hp,max:m.hp,temp:0};c.hpf=m.hpf;c.xp=m.xp;c.crn=m.crn;
  m.ab.forEach((v,i)=>{if(c.stats[i])c.stats[i].v=v});
  c.poses=[{id:"pE",n:L("Normal"),img:"",combate:true}];c.pose="pE";
  c.armas=m.a.filter(x=>x.b).map(x=>({...TPL("arma"),n:x.n,b:x.b,d:dmgToSheet(x.dmg),notas:x.d}));
  const G=(n,t)=>{const a=m.a.filter(x=>x.t===t&&!(t==="accion"&&x.b));return a.length?{id:uid(),n:L(n),items:a.map(x=>Object.assign(TPL("item"),{n:x.n,d:x.d,costo:0}))}:null};
  c.grupos=[G("Rasgos","rasgo"),G("Acciones","accion"),G("Acciones adicionales","bonus"),G("Reacciones","reaccion"),G("Acciones legendarias","legendaria"),G("Conjuros","conjuro")].filter(Boolean);
  if(+m.leg)c.recursos.push({id:uid(),n:L("Acciones legendarias"),act:+m.leg,max:+m.leg,rec:"largo"});
  c.textos=[{id:uid(),t:L("Datos del monstruo"),b:[`${L("Velocidad")}: ${m.vel}`,`${L("Sentidos")}: ${m.sen}`,m.sv&&`${L("Salvaciones")}: ${m.sv}`,m.sk&&`${L("Habilidades")}: ${m.sk}`,m.res&&`${L("Resistencias")}: ${m.res}`,m.inm&&`${L("Inmunidades")}: ${m.inm}`,m.vul&&`${L("Vulnerabilidades")}: ${m.vul}`,m.ci&&`${L("Inmune a estados")}: ${m.ci}`,`${L("Desafío")}: ${m.cr} (${m.xp} PX)`].filter(Boolean).join("\n")}];
  return c;
}
async function monsterSheet(m,open){const ex=enemChars().find(e=>e.srd===m.en);if(ex&&!open)return ex.id;const c=monsterToChar(m);await DB.set("c_"+c.id,c);APP.chars.push({id:c.id,n:c.nombre,enem:true,srd:m.en});await DB.set("index",APP);
  if(open){await openChar(c.id);ui.screen="char";ui.tab="personaje";render()}return c.id}
function rollFormula(f){const m=String(f||"").replace(/\s/g,"").match(/^(\d+)d(\d+)([+-]\d+)?$/);if(!m)return null;let t=+(m[3]||0);for(let i=0;i<+m[1];i++)t+=rnd(+m[2]);return Math.max(1,t)}
function msBest(){
  if(!BEST){loadBest().then(()=>render());return`<p class="hint">…</p>`}
  const q=norm(ui.bq||""),tf=ui.btipo||"",sel=ui.bsel&&BEST.find(x=>x.en===ui.bsel);
  if(sel)return`<div class="row sb"><button class="btn small" data-ms="bback">‹ ${L("Bestiario")}</button><span class="row"><button class="btn small" data-ms="badd" data-v="prom">＋ ${L("Al combate")}</button><button class="btn small" data-ms="badd" data-v="tirar">🎲 ${L("Al combate con vida tirada")}</button></span></div>
    ${statBlock(sel)}<button class="btn on" data-ms="bsheet" style="width:100%;margin-top:8px">📖 ${L("Crear ficha de enemigo (para ponerle imagen, brillos y fases)")}</button>`;
  const tipos=[...new Set(BEST.map(m=>m.ty.split(",")[0].split(" ").slice(1).join(" ")))].sort();
  let list=BEST.filter(m=>(!q||norm(m.n).includes(q)||norm(m.en).includes(q))&&(!tf||m.ty.includes(tf)));
  const crmin=ui.bcr1===undefined?"":ui.bcr1,crmax=ui.bcr2===undefined?"":ui.bcr2;if(crmin!=="")list=list.filter(m=>m.crn>=+crmin);if(crmax!=="")list=list.filter(m=>m.crn<=+crmax);
  return`<h2 style="margin:0">${L("Bestiario")}</h2><p class="hint">${L("{0} monstruos del SRD en castellano. Tocá uno para ver sus estadísticas y sumarlo al combate.",BEST.length)}</p>
    <input type="search" data-bq value="${esc(ui.bq||"")}" placeholder="${L("Buscar (goblin, dragón, lich…)")}">
    <div class="row"><select data-btipo style="flex:1"><option value="">${L("Todos los tipos")}</option>${tipos.map(t=>`<option ${t===tf?"selected":""}>${esc(t)}</option>`).join("")}</select>
      <label class="lbl inline">${L("VD")} <input type="number" step="0.125" min="0" data-bcr1 value="${crmin}" style="width:4em"> – <input type="number" min="0" data-bcr2 value="${crmax}" style="width:4em"></label></div>
    <div class="blist">${list.slice(0,ui.blim||80).map(m=>`<button class="bitem" data-ms="bopen" data-v="${esc(m.en)}"><b>${esc(m.n)}</b><small>${esc(m.ty)}</small><span class="tag">${crLabel(m)}</span><span class="hint">${m.hp} ${L("PV")} · CA ${m.ca}</span></button>`).join("")}</div>
    ${list.length>(ui.blim||80)?`<button class="btn small" data-ms="bmore">${L("Ver más")}</button>`:""}`;
}
/* ---- dificultad de encuentros (reglas 2024) ---- */
const XPB={1:[50,75,100],2:[100,150,200],3:[150,225,400],4:[250,375,500],5:[500,750,1100],6:[600,1000,1400],7:[750,1300,1700],8:[1000,1700,2100],9:[1300,2000,2600],10:[1600,2300,3100],11:[1900,2900,4100],12:[2200,3700,4700],13:[2600,4200,5400],14:[2900,4900,6200],15:[3300,5400,7800],16:[3800,6100,9800],17:[4500,7200,11700],18:[5000,8700,14200],19:[5500,10700,17200],20:[6400,13200,22000]};
function msDif(){
  const D=MS.dif=MS.dif||{n:4,lv:3,extra:[]};const lv=clamp(+D.lv||1,1,20),n=Math.max(1,+D.n||1);const b=XPB[lv].map(x=>x*n);
  const enem=MS.comb.filter(c=>c.tipo==="enem").map(c=>{const e=enemOf(c);return{n:c.n,xp:+(e&&e.xp)||0}});
  const extra=D.extra||[];const tot=enem.reduce((t,e)=>t+e.xp,0)+extra.reduce((t,e)=>t+(+e.xp||0)*(+e.q||1),0);
  const lvl=tot<=0?"":tot<=b[0]?L("Baja"):tot<=b[1]?L("Moderada"):tot<=b[2]?L("Alta"):L("Más que alta: puede ser mortal");
  const pct=b[2]?clamp(tot/(b[2]*1.3),0,1):0;
  return`<h3>${L("Dificultad del encuentro")}</h3><p class="hint">${L("Según el presupuesto de PX de las reglas 2024. Suma los enemigos del combate que tengan PX (los del bestiario) y los que agregues acá.")}</p>
    <div class="grid2"><label class="lbl">${L("Jugadores")}<input type="number" min="1" data-dif="n" value="${n}"></label><label class="lbl">${L("Nivel promedio")}<input type="number" min="1" max="20" data-dif="lv" value="${lv}"></label></div>
    <div class="difbar"><i style="left:${clamp(b[0]/(b[2]*1.3),0,1)*100}%"></i><i style="left:${clamp(b[1]/(b[2]*1.3),0,1)*100}%"></i><i style="left:${100/1.3}%"></i><b style="width:${pct*100}%"></b></div>
    <div class="row sb hint"><span>${L("Baja")} ${b[0]}</span><span>${L("Moderada")} ${b[1]}</span><span>${L("Alta")} ${b[2]}</span></div>
    <div class="dtotal"><span class="hint">${tot} PX</span><b>${lvl||"—"}</b></div>
    ${enem.length?`<p class="hint">${L("Del combate")}: ${enem.map(e=>`${esc(e.n)} (${e.xp})`).join(", ")}</p>`:""}
    ${extra.map((e,i)=>`<div class="row" style="flex-wrap:nowrap"><input data-difx="${i}|n" value="${esc(e.n)}" style="flex:1"><input type="number" min="1" data-difx="${i}|q" value="${e.q||1}" style="width:3.5em" aria-label="${L("Cantidad")}"><input type="number" data-difx="${i}|xp" value="${e.xp||0}" style="width:5.5em" aria-label="PX"><button class="btn small ghost" data-ms="difdel" data-i="${i}">×</button></div>`).join("")}
    <button class="btn small" data-ms="difadd">＋ ${L("Agregar a mano (nombre, cantidad, PX)")}</button>`;
}
/* ---- generadores ---- */
const pick=a=>a[Math.floor(Math.random()*a.length)];
const GN={humano:{m:["Aldric","Bram","Corwin","Darian","Edmund","Garrick","Hugo","Joran","Lucan","Marek","Osric","Roland","Tomas","Varek"],f:["Alina","Brenna","Cora","Delia","Elena","Greta","Ilsa","Lena","Mira","Nadia","Rosa","Selene","Tara","Yara"],a:["Ashford","Blackwood","Carrow","Dunmore","Fairhill","Greystone","Holloway","Marsh","Redwyne","Thorne","Vance","Whitlock"]},
  elfo:{m:["Aelar","Caelynn","Erevan","Galinndan","Ivellios","Laucian","Mindartis","Paelias","Riardon","Thamior","Varis"],f:["Adrie","Birel","Enna","Felosial","Ielenia","Keyleth","Lia","Naivara","Quelenna","Sariel","Valanthe"],a:["Amakiir","Galanodel","Holimion","Liadon","Meliamne","Nailo","Siannodel","Xiloscient"]},
  enano:{m:["Adrik","Baern","Bruenor","Dain","Eberk","Gardain","Harbek","Kildrak","Morgran","Rurik","Thorin","Vondal"],f:["Amber","Bardryn","Dagnal","Eldeth","Gunnloda","Hlin","Kathra","Mardred","Riswynn","Torbera","Vistra"],a:["Barbapiedra","Martillofuego","Puñohierro","Yunquerrojo","Barbagris","Picohondo","Escudoroca"]},
  mediano:{m:["Alton","Cade","Eldon","Garret","Lyle","Merric","Milo","Osborn","Perrin","Roscoe","Wellby"],f:["Andry","Bree","Callie","Kithri","Lavinia","Merla","Nedda","Paela","Seraphina","Verna"],a:["Buenbarril","Matorral","Hojaverde","Piesligeros","Colinadulce","Tealto"]},
  orco:{m:["Dench","Feng","Gell","Henk","Holg","Krusk","Mhurren","Ront","Shump","Thokk"],f:["Baggi","Emen","Engong","Kansif","Myev","Neega","Ovak","Shautha","Sutha","Volen"],a:["del Colmillo Roto","Rompehuesos","Mataosos","Cicatriz","del Clan Negro"]},
  tiefling:{m:["Akmenos","Damakos","Ekemon","Kairon","Leucis","Mordai","Skamos","Therai"],f:["Akta","Bryseis","Criella","Kallista","Lerissa","Nemeia","Orianna","Rieta"],a:["Esperanza","Canción","Tristeza","Ruina","Valor","Gloria","Ceniza"]},
  draconido:{m:["Arjhan","Balasar","Bharash","Donaar","Ghesh","Kriv","Medrash","Nadarr","Rhogar","Torinn"],f:["Akra","Biri","Daar","Harann","Kava","Korinn","Mishann","Sora","Thava","Uadjit"],a:["Clethtinthiallor","Delmirev","Kerrhylon","Myastan","Yarjerit"]}};
const GOF=["herrero","tabernera","guardia de la ciudad","mercader de especias","sacerdote","ladrona arrepentida","cazador","escriba","alquimista","marinero","bardo ambulante","noble venido a menos","curandera","mercenario","contrabandista","granjero","bibliotecaria","sepulturero","adivina","capitán de la guardia"];
const GRASGO=["habla muy rápido","nunca mira a los ojos","se ríe de sus propios chistes","colecciona cosas raras","desconfía de los magos","es exageradamente amable","tararea todo el tiempo","usa palabras rebuscadas","está siempre cansado","cuenta historias de su juventud","es muy supersticioso","mastica algo sin parar"];
const GMOT=["pagar una deuda vieja","encontrar a un familiar perdido","vengarse de un noble","salir de la ciudad sin que lo vean","proteger un secreto familiar","hacerse rico rápido","que lo dejen en paz","recuperar un objeto robado","ganarse el respeto del gremio","esconder a alguien buscado"];
const GSEC=["trabaja para el villano sin saberlo","tiene una marca maldita en la espalda","robó lo que vende","es noble y lo oculta","vio algo que no debía","le debe dinero a la persona equivocada","es un cambiaformas","guarda un mapa a medio terminar"];
const GTA=[["El","Dragón","Durmiente"],["La","Jarra","Rota"],["El","Grifo","Borracho"],["La","Sirena","Tuerta"],["El","Caldero","Humeante"],["La","Rata","Elegante"],["El","Yunque","Dorado"],["El","Cuervo","Risueño"],["La","Luna","Ahogada"],["El","Barril","Sin Fondo"],["La","Espada","Oxidada"],["El","Trol","Feliz"]];
const GESP=["estofado de jabalí","pan negro con queso de cabra","cerveza de miel","sopa de cebolla con hueso","vino especiado","empanadas de setas","guiso picante del desierto","aguardiente de enebro"];
const GRUM=["Dicen que en el pozo viejo se oyen voces de noche.","Una caravana desapareció en el paso del norte.","El alcalde paga bien a quien limpie las cloacas… y nadie volvió.","Vieron luces en la torre abandonada.","Un mercader vende mapas de una mazmorra que no existe… ¿o sí?","Los lobos ya no le temen al fuego.","Un noble busca escolta para una boda muy secreta.","Alguien está comprando todos los cuervos del mercado."];
const GOBJ=["un dado de hueso que siempre saca 3","una llave sin cerradura conocida","una carta de amor sin firmar","un mapa con una cruz tachada","una moneda de un reino que ya no existe","un frasco con una luciérnaga que no se apaga","un guante de un solo dedo","una caja de música que toca una canción triste","un diente de dragón tallado","un espejo que refleja con un segundo de atraso"];
const GCLI={primavera:["lluvia fina y templada","sol tibio con viento suave","niebla matinal que se levanta al mediodía","chaparrón repentino","cielo despejado y fresco"],verano:["calor sofocante","tormenta eléctrica por la tarde","sol abrasador sin viento","noche cálida y estrellada","viento seco y polvoriento"],otoño:["viento frío con hojas","lluvia constante","niebla espesa","cielo gris y quieto","primera helada de la mañana"],invierno:["nevada intensa","frío seco y cielo despejado","ventisca: visibilidad casi nula","lluvia helada","escarcha y viento cortante"]};
function genPNJ(){const r=pick(Object.keys(GN)),g=GN[r],s=Math.random()<.5?"m":"f";return{t:"pnj",txt:`${pick(g[s])} ${pick(g.a)}`,sub:`${L({humano:"Humano",elfo:"Elfo",enano:"Enano",mediano:"Mediano",orco:"Orco",tiefling:"Tiefling",draconido:"Dracónido"}[r])} · ${pick(GOF)}`,det:[`${L("Rasgo")}: ${pick(GRASGO)}`,`${L("Quiere")}: ${pick(GMOT)}`,`${L("Secreto")}: ${pick(GSEC)}`]}}
function genTab(){const[a,b,c]=pick(GTA);const r=pick(Object.keys(GN)),g=GN[r];return{t:"tab",txt:`${a} ${b} ${c}`,sub:`${L("Dueño/a")}: ${pick(g.m.concat(g.f))} ${pick(g.a)}`,det:[`${L("Especialidad")}: ${pick(GESP)}`,`${L("Rumor")}: ${pick(GRUM)}`,`${L("Precio de la habitación")}: ${rnd(5)+1} pp`]}}
function genBotin(cr){cr=+cr||1;const t=cr<5?0:cr<11?1:cr<17?2:3;const c=[["d6×10 pc, d6×5 pp","d6×10 pp, d6×5 po"],["d6×10 po, d6×2 pt","d6×20 po"],["d6×10 pt, d6×100 po","d6×50 pt"],["d6×1000 po, d6×200 pt","d6×500 pt"]][t];
  const roll=s=>s.replace(/d6×(\d+)/g,(_,k)=>String(rnd(6)*+k));const rare=["común","poco común","raro","muy raro"][t];let mag="";
  if(CMP&&CMP.items&&Math.random()<(.25+t*.2)){const it=CMP.items.filter(x=>String(x.ty||"").includes(rare)&&!String(x.ty||"").includes("muy raro")===(rare!=="muy raro"));if(it.length)mag=pick(it).n}
  return{t:"bot",txt:roll(pick(c)),sub:`${L("Tesoro para VD {0}",cr)}`,det:[`${L("Objeto curioso")}: ${pick(GOBJ)}`,mag?`${L("Objeto mágico")}: ${mag}`:L("Sin objeto mágico esta vez")]}}
function genClima(){const est=ui.gest||"primavera";return{t:"cli",txt:pick(GCLI[est]),sub:L(est[0].toUpperCase()+est.slice(1)),det:[`${L("Temperatura")}: ${pick(["fría","fresca","templada","cálida","agobiante"])}`,`${L("Viento")}: ${pick(["calmo","suave","fuerte","racheado"])}`]}}
function msGen(){const R=ui.gres||[];return`<h3>${L("Generadores")}</h3><p class="hint">${L("Para improvisar: tocá y sale algo nuevo. Lo que te guste lo podés pasar al cuaderno.")}</p>
  <div class="chips"><button class="chip add" data-ms="gen" data-v="nombre">🧝 ${L("Nombre")}</button><button class="chip add" data-ms="gen" data-v="pnj">🧑 ${L("PNJ completo")}</button><button class="chip add" data-ms="gen" data-v="tab">🍺 ${L("Taberna")}</button><button class="chip add" data-ms="gen" data-v="bot">💰 ${L("Botín")}</button><button class="chip add" data-ms="gen" data-v="cli">⛅ ${L("Clima")}</button></div>
  <div class="row"><label class="lbl inline">${L("VD del botín")} <input type="number" min="0" data-gcr value="${ui.gcr||1}" style="width:4em"></label><select data-gest style="width:auto">${["primavera","verano","otoño","invierno"].map(s=>`<option value="${s}" ${ui.gest===s?"selected":""}>${L(s[0].toUpperCase()+s.slice(1))}</option>`).join("")}</select></div>
  ${R.map((r,i)=>`<div class="card gen"><div class="row sb"><b>${esc(r.txt)}</b><button class="btn small ghost" data-ms="gnote" data-i="${i}">📜 ${L("Al cuaderno")}</button></div><span class="hint">${esc(r.sub||"")}</span>${(r.det||[]).map(d=>`<div class="d">${esc(d)}</div>`).join("")}</div>`).join("")}`}
/* ---- referencia de estados (resumen propio) ---- */
const CONDS=[["Agarrado","Tu velocidad es 0. Termina si quien te agarra queda incapacitado o te alejan de su alcance."],["Apresado","Velocidad 0. Los ataques contra vos tienen ventaja; los tuyos, desventaja. Desventaja en salvaciones de Destreza."],["Asustado","Desventaja en pruebas y ataques mientras veas la fuente del miedo. No podés acercarte a ella por voluntad propia."],["Aturdido","Incapacitado. Fallás las salvaciones de Fuerza y Destreza. Los ataques contra vos tienen ventaja."],["Cegado","No ves. Fallás pruebas que dependan de la vista. Tus ataques tienen desventaja y los ataques contra vos, ventaja."],["Derribado","Solo podés arrastrarte o levantarte (mitad del movimiento). Desventaja en tus ataques. Ataques cuerpo a cuerpo cercanos contra vos tienen ventaja; a distancia, desventaja."],["Ensordecido","No oís. Fallás pruebas que dependan del oído."],["Envenenado","Desventaja en tiradas de ataque y pruebas de característica."],["Hechizado","No podés atacar a quien te hechizó. Esa criatura tiene ventaja en pruebas sociales con vos."],["Incapacitado","No podés hacer acciones, acciones adicionales ni reacciones. Se rompe la concentración."],["Inconsciente","Incapacitado, derribado, soltás lo que tenés. Fallás salvaciones de FUE y DES. Ataques contra vos con ventaja; los cuerpo a cuerpo cercanos son críticos."],["Invisible","No te ven sin magia. Tus ataques tienen ventaja y los ataques contra vos, desventaja."],["Paralizado","Incapacitado, no te podés mover. Fallás salvaciones de FUE y DES. Ataques con ventaja; los cuerpo a cuerpo cercanos son críticos."],["Petrificado","Convertido en piedra: incapacitado, resistencia a todo el daño, inmune a veneno. Ataques contra vos con ventaja."],["Agotamiento","Cada nivel resta 2 a tus tiradas de d20 y 1,5 m de velocidad (reglas 2024). Con 6 niveles, morís. Un descanso largo quita un nivel."],["Concentración","Si recibís daño, salvación de Constitución (CD 10 o la mitad del daño, la mayor). Si fallás, el conjuro termina."]];
function msCond(){return`<h3>${L("Estados: referencia rápida")}</h3>${CONDS.map(([n,d])=>`<details class="grp cond"><summary>${L(n)}</summary><p>${L(d)}</p></details>`).join("")}<p class="hint">${L("Resumen hecho para la app; ante dudas, manda el reglamento que use tu mesa.")}</p>`}
/* ---- ambiente sonoro sintetizado + audios propios ---- */
const AMBS={};
function noiseBuf(ctx,sec){const b=ctx.createBuffer(1,ctx.sampleRate*sec,ctx.sampleRate),d=b.getChannelData(0);let last=0;for(let i=0;i<d.length;i++){const w=Math.random()*2-1;last=(last+.02*w)/1.02;d[i]=w*.6+last*3}return b}
function ambStart(k){const ctx=acx();if(!ctx||AMBS[k])return;const g=ctx.createGain();g.gain.value=(MS.ambVol&&MS.ambVol[k])??.5;g.connect(ctx.destination);const nodes=[];const tim=[];
  const loop=(f,q,type,gain)=>{const s=ctx.createBufferSource();s.buffer=noiseBuf(ctx,3);s.loop=true;const fl=ctx.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;const gg=ctx.createGain();gg.gain.value=gain;s.connect(fl);fl.connect(gg);gg.connect(g);s.start();nodes.push(s);return{fl,gg}};
  if(k==="lluvia"){loop(1200,.6,"bandpass",.9);loop(5000,.3,"highpass",.25)}
  if(k==="viento"){const w=loop(400,1.2,"bandpass",.9);const lfo=ctx.createOscillator(),lg=ctx.createGain();lfo.frequency.value=.12;lg.gain.value=260;lfo.connect(lg);lg.connect(w.fl.frequency);lfo.start();nodes.push(lfo)}
  if(k==="fuego"){loop(300,.7,"lowpass",.5);tim.push(setInterval(()=>{if(Math.random()<.6)rattleTo(g,ctx,1+Math.floor(Math.random()*3))},180))}
  if(k==="tormenta"){loop(1100,.6,"bandpass",.9);const th=()=>{const s=ctx.createBufferSource();s.buffer=noiseBuf(ctx,4);const fl=ctx.createBiquadFilter();fl.type="lowpass";fl.frequency.value=120;const gg=ctx.createGain();gg.gain.setValueAtTime(0,ctx.currentTime);gg.gain.linearRampToValueAtTime(1.4,ctx.currentTime+.15);gg.gain.exponentialRampToValueAtTime(.01,ctx.currentTime+3.8);s.connect(fl);fl.connect(gg);gg.connect(g);s.start();s.stop(ctx.currentTime+4)};tim.push(setInterval(()=>{if(Math.random()<.35)th()},4000));setTimeout(th,800)}
  if(k==="cueva"){loop(180,.8,"lowpass",.35);tim.push(setInterval(()=>{if(Math.random()<.5){const o=ctx.createOscillator(),gg=ctx.createGain();o.frequency.setValueAtTime(900+Math.random()*700,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(300,ctx.currentTime+.12);gg.gain.setValueAtTime(.25,ctx.currentTime);gg.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.3);o.connect(gg);gg.connect(g);o.start();o.stop(ctx.currentTime+.32)}},1100))}
  AMBS[k]={g,nodes,tim}}
function rattleTo(dest,ctx,n){for(let i=0;i<n;i++){const t=ctx.currentTime+Math.random()*.1,len=.01+Math.random()*.03;const b=ctx.createBuffer(1,Math.floor(ctx.sampleRate*len),ctx.sampleRate),d=b.getChannelData(0);for(let j=0;j<d.length;j++)d[j]=(Math.random()*2-1)*Math.pow(1-j/d.length,2);const s=ctx.createBufferSource();s.buffer=b;const gg=ctx.createGain();gg.gain.value=.3+Math.random()*.5;s.connect(gg);gg.connect(dest);s.start(t)}}
function ambStop(k){const a=AMBS[k];if(!a)return;a.tim.forEach(clearInterval);a.nodes.forEach(n=>{try{n.stop()}catch(e){}});try{a.g.disconnect()}catch(e){}delete AMBS[k]}
const AUDS={};
async function audToggle(id){if(AUDS[id]){AUDS[id].pause();delete AUDS[id];render();return}const s=(MS.audios||[]).find(x=>x.id===id);if(!s)return;let d=getImg(s.k)||await DB.get(s.k);if(!d)return;const a=new Audio(d);a.loop=!!s.loop;a.volume=s.vol??.8;a.onended=()=>{delete AUDS[id];render()};a.play().catch(()=>toast(L("No se pudo reproducir")));AUDS[id]=a;render()}
function msAmb(){const B=[["lluvia","🌧 Lluvia"],["viento","🌬 Viento"],["fuego","🔥 Fogata"],["tormenta","⛈ Tormenta"],["cueva","🕳 Cueva con goteras"]];
  return`<h3>${L("Ambiente sonoro")}</h3><p class="hint">${L("Sonidos de fondo generados por la app, sin internet. Se pueden mezclar. También podés subir tu música o grabaciones.")}</p>
  <div class="chips">${B.map(([k,n])=>`<button class="chip tog ${AMBS[k]?"lit":""}" data-ms="amb" data-v="${k}" aria-pressed="${!!AMBS[k]}">${L(n)}</button>`).join("")}</div>
  ${Object.keys(AMBS).length?`<div class="sec" style="gap:4px">${Object.keys(AMBS).map(k=>`<label class="lbl inline">${L((B.find(x=>x[0]===k)||[0,k])[1])} <input type="range" min="0" max="1.5" step="0.05" data-ambv="${k}" value="${(MS.ambVol&&MS.ambVol[k])??.5}"></label>`).join("")}</div>`:""}
  <h4>${L("Tu música y audios")}</h4>
  ${(MS.audios||[]).map(s=>`<div class="srow"><button class="btn small ${AUDS[s.id]?"on":""}" data-ms="aud" data-id="${s.id}">${AUDS[s.id]?"■":"▶"}</button><span class="sn">${esc(s.n)}</span><label class="hint row" style="gap:4px"><input type="checkbox" data-audloop="${s.id}" ${s.loop?"checked":""} style="width:auto">${L("repetir")}</label><button class="btn small danger" data-ms="auddel" data-id="${s.id}">×</button></div>`).join("")}
  <label class="btn small">＋ ${L("Subir audio o música")}<input type="file" accept="audio/*" data-audup hidden></label>
  ${Object.keys(AMBS).length||Object.keys(AUDS).length?`<button class="btn small danger" data-ms="ambstop">■ ${L("Parar todo")}</button>`:""}`}
function msTools(){const T=ui.mtool||"dif";const tabs=[["dif","⚖ "+L("Dificultad")],["gen","🎲 "+L("Generadores")],["cond","📖 "+L("Estados")],["amb","🎵 "+L("Ambiente")]];
  return`<div class="chips">${tabs.map(([k,n])=>`<button class="chip ${T===k?"on":""}" data-ms="mtool" data-v="${k}">${n}</button>`).join("")}</div>${T==="dif"?msDif():T==="gen"?msGen():T==="cond"?msCond():msAmb()}`}
/* ---- estados con duración en la iniciativa ---- */
function condChips(c){return`<div class="row cconds">${(c.conds||[]).map((x,i)=>`<button class="tag ccond" data-ms="cdrop" data-id="${c.id}" data-i="${i}" title="${L("Tocá para quitar")}">${esc(L(x.n))}${+x.r?` · ${x.r}`:""} ×</button>`).join("")}${c.conc?`<button class="tag ccond conc" data-ms="conc" data-id="${c.id}">🧠 ${L("Concentración")} ×</button>`:""}
  <select data-cadd="${c.id}" class="cadd"><option value="">＋ ${L("Estado")}</option>${CONDS.map(([n])=>`<option value="${n}">${L(n)}</option>`).join("")}</select>${c.conc?"":`<button class="btn small ghost" data-ms="conc" data-id="${c.id}" title="${L("Concentración")}">🧠</button>`}</div>`}
(function(){
  document.addEventListener("click",async e=>{const b=e.target.closest("[data-ms]");if(!b||!MS)return;const k=b.dataset.ms;const c=b.dataset.id&&MS.comb.find(x=>x.id===b.dataset.id);
    const H={
      bopen:()=>{ui.bsel=b.dataset.v;render();window.scrollTo(0,0)},bback:()=>{ui.bsel=null;render()},bmore:()=>{ui.blim=(ui.blim||80)+120;render()},
      bsheet:async()=>{const m=BEST.find(x=>x.en===ui.bsel);await monsterSheet(m,true)},
      badd:async()=>{const m=BEST.find(x=>x.en===ui.bsel);const id=await monsterSheet(m,false);const ec=await DB.get("c_"+id);ENC.set(id,ec);const same=MS.comb.filter(x=>x.charId===id).length;const hp=b.dataset.v==="tirar"?(rollFormula(m.hpf)||m.hp):m.hp;
        MS.comb.push({id:uid(),tipo:"enem",charId:id,n:m.n+(same?" "+(same+1):""),hp,hpmax:hp,ca:m.ca,ini:""});saveMaster();toast(L("{0} sumado al combate ({1} PV)",m.n,hp));render()},
      mtool:()=>{ui.mtool=b.dataset.v;render()},
      difadd:()=>{MS.dif.extra.push({n:L("Enemigo"),q:1,xp:100});saveMaster();render()},difdel:()=>{MS.dif.extra.splice(+b.dataset.i,1);saveMaster();render()},
      gen:()=>{const v=b.dataset.v;let r;if(v==="nombre"){const g=GN[pick(Object.keys(GN))];r={txt:`${pick(g.m.concat(g.f))} ${pick(g.a)}`,sub:L("Nombre"),det:[]}}else r=v==="pnj"?genPNJ():v==="tab"?genTab():v==="bot"?genBotin(ui.gcr):genClima();ui.gres=[r,...(ui.gres||[])].slice(0,8);if(v==="bot"&&!CMP)loadCmp();render()},
      gnote:()=>{const r=ui.gres[+b.dataset.i];MS.notas.unshift({id:uid(),t:r.txt,b:[r.sub,...(r.det||[])].filter(Boolean).join("\n")});saveMaster();toast(L("Pasado al cuaderno"))},
      amb:()=>{const v=b.dataset.v;if(AMBS[v])ambStop(v);else ambStart(v);render()},ambstop:()=>{Object.keys(AMBS).forEach(ambStop);Object.keys(AUDS).forEach(id=>{AUDS[id].pause();delete AUDS[id]});render()},
      aud:()=>audToggle(b.dataset.id),auddel:()=>{const s=MS.audios.find(x=>x.id===b.dataset.id);if(AUDS[s.id]){AUDS[s.id].pause();delete AUDS[s.id]}dropImg(s.k);MS.audios=MS.audios.filter(x=>x!==s);saveMaster();render()},
      cdrop:()=>{c.conds.splice(+b.dataset.i,1);saveMaster();render()},conc:()=>{c.conc=!c.conc;saveMaster();render()}};
    if(H[k]){e.preventDefault();e.stopImmediatePropagation();await H[k]()}},true);
  document.addEventListener("change",async e=>{const t=e.target;if(!MS)return;const d=t.dataset;
    if(d.dif!==undefined&&t.matches("[data-dif]")){MS.dif[d.dif]=+t.value;saveMaster();render();return}
    if(d.difx){const[i,f]=d.difx.split("|");MS.dif.extra[+i][f]=f==="n"?t.value:+t.value;saveMaster();render();return}
    if(t.matches("[data-btipo]")){ui.btipo=t.value;render();return}if(t.matches("[data-bcr1]")){ui.bcr1=t.value;render();return}if(t.matches("[data-bcr2]")){ui.bcr2=t.value;render();return}
    if(t.matches("[data-cdur]")){ui.cdur=+t.value||0;return}
    if(t.matches("[data-gcr]")){ui.gcr=+t.value;return}if(t.matches("[data-gest]")){ui.gest=t.value;return}
    if(d.cadd){const c=MS.comb.find(x=>x.id===d.cadd);if(t.value){c.conds=c.conds||[];c.conds.push({n:t.value,r:+ui.cdur||0});saveMaster();render()}return}
    if(d.audloop){const s=MS.audios.find(x=>x.id===d.audloop);s.loop=t.checked;if(AUDS[s.id])AUDS[s.id].loop=t.checked;saveMaster();return}
    if(t.matches("[data-audup]")){const f=t.files&&t.files[0];if(!f)return;if(f.size>15e6){toast(L("El audio es muy pesado (máximo 15 MB)"));return}const url=await new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.onerror=rej;fr.readAsDataURL(f)});const key=await putImg(url);MS.audios=MS.audios||[];MS.audios.push({id:uid(),n:(f.name||L("Audio")).replace(/\.[^.]+$/,"").slice(0,40),k:key,loop:true,vol:.8});saveMaster();render();return}});
  document.addEventListener("input",e=>{const t=e.target;if(!MS)return;
    if(t.matches("[data-bq]")){ui.bq=t.value;clearTimeout(t._t);t._t=setTimeout(()=>{render();const i=document.querySelector("[data-bq]");if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length)}},300)}
    if(t.dataset.ambv){const k=t.dataset.ambv;MS.ambVol=MS.ambVol||{};MS.ambVol[k]=+t.value;if(AMBS[k])AMBS[k].g.gain.value=+t.value;saveMaster()}});
})();
