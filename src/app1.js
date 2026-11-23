"use strict";
/* ============ utilidades ============ */
const APPV="6.5";
let DOR=null;
async function loadDor(){return DOR||(DOR={})}
const DICT=__DICT__;
let LANG="es";
const L=(s,...a)=>{let r=(LANG!=="es"&&DICT[LANG]&&DICT[LANG][s])||s;a.forEach((v,i)=>{r=r.split("{"+i+"}").join(v)});return r};
const uid=()=>Date.now().toString(36).slice(-4)+Math.random().toString(36).slice(2,7);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clone=o=>JSON.parse(JSON.stringify(o));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const sg=n=>(n>=0?"+":"")+n;
const modN=v=>Math.floor(((+v||0)-10)/2);
const num=v=>{const n=parseInt(v,10);return isNaN(n)?0:n};
const nchar=ch=>ch.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
const norm=s=>String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
const LOGO='<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="lgl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7fc4ff"/><stop offset="1" stop-color="#3b5fb0"/></linearGradient></defs><path d="M6 10 Q14 6 22 10 Q27 12 30 10 L27 18 L32 24 L26 30 L31 37 L25 44 L30 51 L26 56 Q18 59 10 55 Q6 53 6 50 Z" fill="url(#lgl)" stroke="#d9a845" stroke-width="1.6" stroke-linejoin="round"/><path d="M36 12 Q42 9 50 12 Q56 14 58 12 L58 52 Q52 56 44 54 Q38 52 34 55 L38 48 L33 41 L39 35 L34 28 L40 22 L35 16 Z" fill="url(#lgl)" stroke="#d9a845" stroke-width="1.6" stroke-linejoin="round" transform="rotate(6 46 34)"/></svg>';
const SWATCH=["#4fb3ff","#9be7ff","#ffffff","#ffd36b","#d9a845","#ff3b3b","#c0121e","#ff7a1a","#5bbf7a","#36e0a0","#b77bff","#ff5fd2","#222222"];
const FXS=[["none","Sin efecto en la imagen"],["sway","Se tambalea"],["gris","Gris (inconsciente)"],["oscuro","Oscurecido"],["sello","Sello (apaga brillos)"]];
const RECS=[["no","Sin recarga"],["corto","Descanso corto"],["largo","Descanso largo"],["turnos","Cada X turnos"],["horas","Cada X horas"]];

/* ============ almacenamiento ============ */
const MEM=new Map();
const DB={db:null,
  async open(){try{this.db=await new Promise((res,rej)=>{const r=indexedDB.open("telita",1);r.onupgradeneeded=()=>r.result.createObjectStore("kv");r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}catch(e){this.db=null}},
  get(k){if(!this.db)return Promise.resolve(MEM.get(k));return new Promise(res=>{try{const q=this.db.transaction("kv").objectStore("kv").get(k);q.onsuccess=()=>res(q.result);q.onerror=()=>res(MEM.get(k))}catch(e){res(MEM.get(k))}})},
  set(k,v){MEM.set(k,v);if(!this.db)return Promise.resolve();return new Promise(res=>{try{const tx=this.db.transaction("kv","readwrite");tx.objectStore("kv").put(v,k);tx.oncomplete=()=>res();tx.onerror=()=>res()}catch(e){res()}})},
  del(k){MEM.delete(k);if(!this.db)return Promise.resolve();return new Promise(res=>{try{const tx=this.db.transaction("kv","readwrite");tx.objectStore("kv").delete(k);tx.oncomplete=()=>res();tx.onerror=()=>res()}catch(e){res()}})}
};
const IMG=new Map();
const getImg=k=>k?(IMG.get(k)||null):null;
async function putImg(data){const k="img_"+uid();IMG.set(k,data);await DB.set(k,data);return k}
async function dropImg(k){if(k){IMG.delete(k);await DB.del(k)}}
function imgKeys(c){const s=new Set();(c.poses||[]).forEach(p=>{p.img&&s.add(p.img);p.bg&&s.add(p.bg)});c.fondo&&s.add(c.fondo);(c.invoc||[]).forEach(v=>v.img&&s.add(v.img));(c.sonidos||[]).forEach(x=>x.k&&s.add(x.k));[...(c.armas||[]),...(c.magicos||[])].forEach(o=>{if(o.vis){(o.vis.evo||[]).forEach(e=>e.img&&s.add(e.img));(o.vis.capas||[]).forEach(e=>e.img&&s.add(e.img));(o.vis.zonas||[]).forEach(z=>(z.sub||[]).forEach(sb=>Object.values(sb.masks||{}).forEach(k=>k&&s.add(k))))}});(c.grupos||[]).forEach(g=>(g.items||[]).forEach(it=>it.img&&s.add(it.img)));(c.efectos||[]).forEach(e=>(e.sub||[]).forEach(sb=>Object.values(sb.masks||{}).forEach(k=>s.add(k))));(c.capas||[]).forEach(k=>Object.values(k.imgs||{}).forEach(v=>v&&v.img&&s.add(v.img)));(c.efectos||[]).forEach(e=>Object.values(e.masks||{}).forEach(k=>s.add(k)));return[...s]}
async function loadImgs(c){for(const k of imgKeys(c)){if(IMG.has(k))continue;let v=await DB.get(k);if(!v&&k.startsWith("dor_")){const d=await loadDor();v=d[k];if(v)await DB.set(k,v)}if(v)IMG.set(k,v)}}

/* ============ estado ============ */
let APP={chars:[],cur:null,lang:"es"};
let C=null, NOTES=[];
const ui={screen:"char",tab:"personaje",edit:false,menu:false,open:{},nq:"",paint:null,confirm:null,promptAct:"durmiendo",lastPose:null,newName:""};
let undo=[];
let saveT=null;
function saveSoon(){clearTimeout(saveT);saveT=setTimeout(saveNow,250)}
async function saveNow(){if(!C)return;await DB.set("c_"+C.id,C);const e=APP.chars.find(x=>x.id===C.id);if(e)e.n=C.nombre;await DB.set("index",APP)}
const saveNotes=()=>DB.set("notes",NOTES);
function snap(){if(!C)return;undo.push(JSON.stringify(C));if(undo.length>40)undo.shift()}
function log(t){C.log.unshift(new Date().toLocaleTimeString(LANG==="en"?"en-US":LANG==="pt"?"pt-BR":"es-AR",{hour:"2-digit",minute:"2-digit"})+" · "+t);C.log=C.log.slice(0,40)}
function toast(t){const e=document.getElementById("toast");if(!e||!t)return;e.textContent=t;e.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("show"),1900)}
function flash(id){requestAnimationFrame(()=>{document.querySelectorAll("#"+id).forEach(el=>{el.classList.remove("flash");void el.offsetWidth;el.classList.add("flash")})})}

/* ============ plantillas ============ */
const STAT6=[["FUE","Fuerza"],["DES","Destreza"],["CON","Constitución"],["INT","Inteligencia"],["SAB","Sabiduría"],["CAR","Carisma"]];
const SKILLS=[["Acrobacias","DES"],["Arcanos","INT"],["Atletismo","FUE"],["Engaño","CAR"],["Historia","INT"],["Interpretación","CAR"],["Intimidación","CAR"],["Investigación","INT"],["Juego de manos","DES"],["Medicina","SAB"],["Naturaleza","INT"],["Percepción","SAB"],["Perspicacia","SAB"],["Persuasión","CAR"],["Religión","INT"],["Sigilo","DES"],["Supervivencia","SAB"],["Trato con animales","SAB"]];
function bodyTree(){
  const n=(name,k=[])=>({id:uid(),n:name,d:"",k});
  const fingers=()=>["Pulgar","Índice","Medio","Anular","Meñique"].map(x=>n(x));
  const arm=s=>n("Brazo "+s,[n("Hombro"),n("Brazo"),n("Codo"),n("Antebrazo"),n("Muñeca"),n("Mano",[n("Palma"),n("Dorso"),n("Dedos",fingers())])]);
  const leg=s=>n("Pierna "+s,[n("Cadera"),n("Muslo"),n("Rodilla"),n("Pantorrilla"),n("Tobillo"),n("Pie",[n("Planta"),n("Empeine"),n("Dedos del pie")])]);
  return [n("Cuerpo completo"),n("Cabeza",[n("Cabello"),n("Cara",[n("Frente"),n("Ojo izquierdo"),n("Ojo derecho"),n("Nariz"),n("Boca"),n("Mejillas"),n("Mentón")]),n("Oreja izquierda"),n("Oreja derecha")]),n("Cuello"),n("Torso",[n("Pecho"),n("Espalda"),n("Abdomen"),n("Cintura")]),arm("derecho"),arm("izquierdo"),leg("derecha"),leg("izquierda")];
}
function TPL(kind){
  const id=uid();
  switch(kind){
    case "grupo":return{id,n:L("Nuevo grupo"),items:[]};
    case "item":return{id,n:L("Nuevo poder"),d:"",usos:{act:0,max:0},rec:"largo",recurso:"",costo:1,dur:0,efecto:""};
    case "recurso":return{id,n:L("Nuevo recurso"),act:2,max:2,rec:"largo"};
    case "arma":return{id,n:L("Nueva arma"),b:"+0",d:"1d6",notas:"",contador:"",crit:"doble"};
    case "contador":return{id,n:L("Nuevo contador"),v:0,d:"",accion:L("Usar todo")};
    case "medidor":return{id,n:L("Nuevo medidor"),min:0,max:10,v:0,tipo:"sube",izq:"",der:"",vinc:"",umbrales:[]};
    case "umbral":return{id,v:5,t:L("Qué se desbloquea")};
    case "magico":return{id,n:L("Nuevo ítem mágico"),d:"",usos:{act:1,max:1},rec:"largo",recN:1,dur:0,efecto:"",t:0,cd:0};
    case "efecto":return{id,n:L("Nueva zona de brillo"),parte:"",c:"#4fb3ff",c2:"",brillo:.9,halo:.5,pulso:true,on:false,dur:0,left:0,med:null,masks:{}};
    case "pose":return{id,n:L("Nueva pose"),img:null,combate:false,fondo:true};
    case "parte":return{id,n:L("Nueva parte"),d:"",k:[]};
    case "inv":return{id,t:L("Nueva lista"),items:[]};
    case "invItem":return{id,n:"",donde:"",d:""};
    case "estado":return{id,n:L("Nuevo estado"),on:false,fx:"none"};
    case "stat":return{id,k:"NUE",n:L("Nueva"),v:10};
    case "save":return{id,n:L("Nueva salvación"),a:"",p:0,x:0};
    case "skill":return{id,n:L("Nueva habilidad"),a:"",p:0,x:0};
    case "dato":return{id,l:L("Nuevo dato"),v:""};
    case "texto":return{id,t:L("Nuevo cuadro"),b:""};
    case "nota":return{id,t:L("Nueva nota"),b:"",k:[]};
    case "consum":return{id,n:L("Munición"),tipo:"flecha",act:20,max:20,cap:0,carga:0,cura:"",c:"#c9a46a",d:"",gast:0};
    case "capa":return{id,n:L("Nueva capa"),on:false,pos:"delante",op:1,dur:0,left:0,fondo:true,imgs:{}};
    case "invoc":return{id,n:L("Nueva invocación"),d:"",img:null,hp:{act:0,max:0},estado:"dentro",dur:0,left:0,efecto:""};
    case "barra":return{id,n:L("Nueva barra"),c:"#c2343c",v:0,max:100,paso:5,u:"%"};
  }
}
function newChar(nombre){
  return{
    id:uid(),v:2,nombre:nombre||L("Nuevo personaje"),clase:"",nivel:1,
    stats:STAT6.map(([k,n])=>({id:k,k,n,v:10})),ca:10,hp:{act:10,max:10,temp:0},iniExtra:0,vel:"9 m",dadosGolpe:"1d8",profOv:"",insp:false,muerte:{ok:0,fail:0},
    saves:STAT6.map(([k,n])=>({id:uid(),n,a:k,p:0,x:0})),skills:SKILLS.map(([n,a])=>({id:uid(),n,a,p:0,x:0})),
    datos:[{id:uid(),l:"Clase",v:""},{id:uid(),l:"Raza",v:""},{id:uid(),l:"Altura",v:""},{id:uid(),l:"Peso",v:""},{id:uid(),l:"Edad",v:""}],textos:[{id:uid(),t:"Rasgos y poderes especiales",b:""},{id:uid(),t:"Competencias e idiomas",b:""},{id:uid(),t:"Equipo",b:""}],
    poses:[{id:uid(),n:"Normal",img:null,combate:false,fondo:true}],pose:null,lastCombat:null,
    cuerpo:bodyTree(),efectos:[],medidores:[],recursos:[],
    grupos:[{id:uid(),n:"Magia",items:[]},{id:uid(),n:"Dotes",items:[]}],
    armas:[],magicos:[],contadores:[],barras:[],inventarios:[{id:uid(),t:"Inventario",items:[]}],
    estados:[{id:uid(),n:"Aturdido",on:false,fx:"sway"},{id:uid(),n:"Inconsciente",on:false,fx:"gris"}],
    fondo:null,fondoDim:.25,invoc:[],capas:[],mods:[],consum:[],sonidos:[],sndEv:{},look:{},muerteCfg:{ok:3,fail:3},cuadros:[],pestanas:[],favs:[],facciones:[],terror:false,
    combate:false,turno:0,tempFx:[],log:[]
  };
}
function findPart(tree,name){for(const n of tree){if(n.n===name)return n;const r=findPart(n.k||[],name);if(r)return r}return null}
function makeDorian(){
  const c=newChar("Dorian");
  Object.assign(c,{clase:"Guerrero malacálico · dos espadas cortas",nivel:5,ca:17,hp:{act:120,max:120,temp:0},dadosGolpe:"5d10"});
  [16,18,16,10,12,11].forEach((v,i)=>c.stats[i].v=v);
  c.saves.forEach(s=>{if(s.a==="FUE"||s.a==="CON")s.p=1});
  c.skills.forEach(s=>{if(["Atletismo","Intimidación","Percepción"].includes(s.n))s.p=1});
  c.poses=[{id:"pN",n:"Normal",img:"dor_base",combate:false},{id:"pD",n:"Defensa",img:"dor_def",combate:true},{id:"pA",n:"Ataque",img:"dor_atk",combate:true}];
  c.pose="pN";c.lastCombat="pA";
  const P=n=>(findPart(c.cuerpo,n)||{}).id||"";
  const zone=(id,n,parte,col,dur,z)=>({id,n,parte:P(parte),c:col,c2:"",brillo:.92,halo:.5,pulso:true,on:false,dur,left:0,med:null,masks:{pN:`dor_m_${z}_n`,pD:`dor_m_${z}_d`,pA:`dor_m_${z}_a`}});
  c.efectos=[zone("eBD","Tatuaje · brazo derecho (telequinesis)","Brazo derecho","#4fb3ff",3,"brazoDer"),zone("ePe","Tatuaje · pecho","Pecho","#ff3b3b",0,"pecho"),zone("eAb","Tatuaje · abdomen","Abdomen","#ff3b3b",0,"abdomen"),zone("eBI","Tatuaje · brazo izquierdo","Brazo izquierdo","#ff3b3b",0,"brazoIzq")];
  const hoja=zone("eHoja","Hojas de las espadas","","#ffffff",0,"blade");hoja.med={id:"mLuz",neg:["#050304","#c0121e"],pos:["#fffdf4","#e3b44e"]};c.efectos.push(hoja);
  c.medidores=[{id:"mLuz",n:"Luz y sombra",min:-15,max:15,v:0,tipo:"bipolar",izq:"Sombra",der:"Luz",vinc:"Espadas cortas",umbrales:[{id:uid(),v:-5,t:"Sombras que atrapan los pies · daño en área"},{id:uid(),v:5,t:"Daño radiante"}]}];
  c.contadores=[{id:"cMarca",n:"Marcas de las espadas",v:0,d:"Las espadas dejan una marca en cada golpe. Al explotarlas, cada marca hace daño extra.",accion:"Explotar"}];
  c.armas=[{id:uid(),n:"Espada corta (mano derecha)",b:"+7",d:"1d6+4 cortante",notas:"",contador:"cMarca"},{id:uid(),n:"Espada corta (mano izquierda)",b:"+7",d:"1d6 cortante",notas:"",contador:"cMarca"}];
  c.recursos=[{id:"rEsp1",n:"Espacios de conjuro nivel 1",act:2,max:2,rec:"largo"},{id:"rMan",n:"Usos de maniobras",act:4,max:4,rec:"corto"}];
  const it=(n,d,o={})=>Object.assign({id:uid(),n,d,usos:{act:0,max:0},rec:"largo",recurso:"",costo:1,dur:0,efecto:""},o);
  c.grupos=[
    {id:uid(),n:"Magia",items:[it("Escudo","Reacción: +5 a la CA hasta el inicio de tu próximo turno.",{recurso:"rEsp1",dur:1}),it("Mano de mago","Truco: una mano espectral que mueve objetos livianos.")]},
    {id:uid(),n:"Magia malacálica",items:[it("Telequinesis","Tatuaje azul del brazo derecho: se enciende al usarla.",{efecto:"eBD",dur:3}),it("Guardar en el cuerpo","Mete o saca objetos de su cuerpo; lo guardado queda como tatuaje.")]},
    {id:uid(),n:"Dotes y maniobras",items:[it("Maniobra de derribo","Si conecta el golpe, el objetivo hace una salvación de FUE (CD 15) o cae derribado.",{recurso:"rMan"}),it("Ataque con dos armas","Ataque extra con la espada de la otra mano."),it("Magia del caos","Se da ventaja en una tirada. Después se tira en la tabla de 100 del máster.",{recurso:"rMan"})]},
    {id:uid(),n:"Habilidades del arma",items:[it("Corte doble","Ataca con las dos espadas a la vez.",{usos:{act:2,max:2}}),it("Parada","Reacción: suma a la CA contra un ataque cuerpo a cuerpo.",{usos:{act:3,max:3}})]}
  ];
  c.inventarios=[{id:uid(),t:"Tatuajes dimensionales",items:[{id:uid(),n:"Dos espadas cortas",donde:"Antebrazos",d:"Sus armas principales; las saca para combatir."}]}];
  c.estados=[{id:uid(),n:"Aturdido",on:false,fx:"sway"},{id:uid(),n:"Fuera de combate",on:false,fx:"gris"},{id:uid(),n:"Poderes sellados",on:false,fx:"sello"}];
  c.textos=[{id:uid(),t:"Rasgos y poderes especiales",b:"Su cuerpo es un objeto dimensional: lo que guarda adentro queda como tatuaje."},{id:uid(),t:"Competencias e idiomas",b:"Idiomas: común\nArmaduras ligeras y medianas, escudos\nArmas simples y marciales"},{id:uid(),t:"Equipo",b:"Dos espadas cortas\nFaja roja\nBrazales de cuero"}];
  return c;
}
/* migra la ficha anterior (versión de un solo personaje) */
function migrateOld(c,o){
  try{
    const setIf=(k,v)=>{if(v!==undefined&&v!==null)c[k]=v};
    setIf("nombre",o.nombre);setIf("clase",o.clase);setIf("ca",o.ca);setIf("nivel",o.nivel);setIf("vel",o.vel);setIf("dadosGolpe",o.dadosGolpe);setIf("iniExtra",o.iniExtra);setIf("profOv",o.profOv);setIf("insp",o.insp);
    if(o.muerte)c.muerte=o.muerte;
    if(o.stats)c.stats.forEach(s=>{if(o.stats[s.id]!==undefined)s.v=o.stats[s.id]});
    if(o.hp)c.hp={act:o.hp.act,max:o.hp.max,temp:0};
    if(Array.isArray(o.saves))c.saves=o.saves.map(s=>({id:uid(),n:s.n,a:s.a==="—"?"":s.a,p:s.p||0,x:s.x||0}));
    if(Array.isArray(o.skills))c.skills=o.skills.map(s=>({id:uid(),n:s.n,a:s.a==="—"?"":s.a,p:s.p||0,x:s.x||0}));
    if(Array.isArray(o.datos))c.datos=o.datos.map(d=>({id:uid(),l:d.l,v:d.v}));
    if(Array.isArray(o.notas))c.textos=o.notas.map(n=>({id:uid(),t:n.t,b:n.b}));
    if(Array.isArray(o.ataques))c.armas=o.ataques.map(a=>({id:uid(),n:a.n,b:a.b,d:a.d,notas:"",contador:a.mk?"cMarca":""}));
    if(o.marcas){const m=c.contadores[0];m.v=o.marcas.n||0;if(o.marcas.desc)m.d=o.marcas.desc}
    if(typeof o.balance==="number")c.medidores[0].v=o.balance;
    const colorMap={azul:"#4fb3ff",rojo:"#ff3b3b",blanco:"#fff4dc",violeta:"#b77bff"};
    const tatMap={brazoDer:"eBD",pecho:"ePe",abdomen:"eAb",brazoIzq:"eBI"};
    if(Array.isArray(o.tat))o.tat.forEach(t=>{
      let e=c.efectos.find(x=>x.id===tatMap[t.id]);
      if(!e){e=Object.assign(TPL("efecto"),{id:t.id});c.efectos.push(e)}
      e.n=t.nombre||e.n;e.c=colorMap[t.color]||e.c;e.on=!!t.on;e.dur=t.dur||0;e.left=t.left||0;if(t.desc)e.desc=t.desc;
    });
    const gMag=c.grupos[0],gMala=c.grupos[1],gDot=c.grupos[2],gArm=c.grupos[3];
    if(o.pool){const r=c.recursos.find(r=>r.id==="rMan");r.n=o.pool.nombre||r.n;r.max=o.pool.max;r.act=o.pool.act}
    if(o.slots){c.recursos=c.recursos.filter(r=>r.id!=="rEsp1");Object.entries(o.slots).forEach(([lv,s])=>{if(s.max>0)c.recursos.push({id:"rEsp"+lv,n:"Espacios de conjuro nivel "+lv,act:s.max-s.used,max:s.max,rec:"largo"})})}
    const tatEff=id=>tatMap[id]||id||"";
    if(Array.isArray(o.conj))gMag.items=o.conj.map(x=>({id:uid(),n:x.n,d:x.d||"",usos:{act:0,max:0},rec:"largo",recurso:x.lv>0?"rEsp"+x.lv:"",costo:1,dur:x.dur||0,efecto:""}));
    if(Array.isArray(o.mala))gMala.items=o.mala.map(x=>({id:uid(),n:x.n,d:x.d||"",usos:{act:x.act||0,max:x.max||0},rec:"largo",recurso:"",costo:1,dur:x.dur||0,efecto:x.tat?tatEff(x.tat):""}));
    if(Array.isArray(o.dotes))gDot.items=o.dotes.map(x=>({id:uid(),n:x.n,d:x.d||"",usos:{act:0,max:0},rec:"largo",recurso:x.cost?"rMan":"",costo:x.cost||1,dur:x.dur||0,efecto:""}));
    if(Array.isArray(o.arma))gArm.items=o.arma.map(x=>({id:uid(),n:x.n,d:x.d||"",usos:{act:x.act||0,max:x.max||0},rec:"largo",recurso:"",costo:1,dur:x.dur||0,efecto:""}));
    if(Array.isArray(o.dim))c.inventarios[0].items=o.dim.map(x=>({id:uid(),n:x.n,donde:x.z||"",d:x.d||""}));
    const st=c.estados;if(o.aturdido)st[0].on=true;if(o.ko)st[1].on=true;if(o.sellado)st[2].on=true;
    if(o.combate){c.combate=true;c.turno=o.turno||1;c.pose=o.postura==="defensa"?"pD":"pA";c.lastCombat=c.pose}
    if(Array.isArray(o.efectos))c.tempFx=o.efectos.map(e=>({id:uid(),n:e.n,left:e.left,d:e.d||e.left}));
    if(Array.isArray(o.log))c.log=o.log.slice(0,40);
  }catch(e){console.warn("migración parcial",e)}
}
function repair(c){const b=newChar(c.nombre);for(const k of Object.keys(b))if(c[k]===undefined)c[k]=b[k];if(!c.pose&&c.poses[0])c.pose=c.poses[0].id;return c}
function defaultNotes(){
  const n=(t,b="",k=[])=>({id:uid(),t,b,k});
  return[n("Facciones","Ejemplo: borralo o cambialo como quieras.",[n("Inquisición","",[n("Misiones","",[n("Primera misión","Qué pasó, recompensas, pistas…")]),n("Personajes importantes","",[n("Líder",""),n("Sublíder",""),n("Soldado","")])])])];
}
