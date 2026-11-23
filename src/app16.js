/* ============ personaje de ejemplo (para aprender a usar la app) ============ */
async function svgToKey(svg,strip){const im=await loadImage("data:image/svg+xml,"+encodeURIComponent(svg));const cv=document.createElement("canvas");cv.width=400;cv.height=600;const x=cv.getContext("2d");x.drawImage(im,0,0,400,600);if(strip)removeWhite(x,400,600);let d=cv.toDataURL("image/webp",.9);if(!d.startsWith("data:image/webp"))d=cv.toDataURL("image/png");return putImg(d)}
function maskSVG(j,parts){const L2=(a,b,w)=>`<line x1="${j[a][0]}" y1="${j[a][1]}" x2="${j[b][0]}" y2="${j[b][1]}" stroke-width="${w}"/>`;
  const seg={brazoD:L2("sl","el",26)+L2("el","hl",22),brazoI:L2("sr","er",26)+L2("er","hr",22),pecho:`<path d="M${j.sl} L${j.sr} L${j.pr} L${j.pl} Z" fill="#fff" stroke-width="10"/>`};
  return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600"><g stroke="#fff" stroke-linecap="round" fill="#fff">${parts.map(p=>seg[p]).join("")}</g></svg>`}
function haloSVG(j){return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600"><ellipse cx="${j.h[0]}" cy="${j.h[1]-52}" rx="34" ry="10" fill="none" stroke="#ffd36b" stroke-width="6"/><ellipse cx="${j.h[0]}" cy="${j.h[1]-52}" rx="34" ry="10" fill="none" stroke="#fff6c8" stroke-width="2"/></svg>`}
async function makeDemo(){
  const c=newChar(L("Aventurera de ejemplo"));
  Object.assign(c,{clase:L("Maga de batalla · personaje para aprender"),nivel:5,ca:15,hp:{act:38,max:38,temp:0}});
  [10,14,14,18,12,10].forEach((v,i)=>c.stats[i]&&(c.stats[i].v=v));
  const PO=[["normal",L("Normal"),false],["defensa",L("Defensa"),true],["ataque",L("Ataque"),true],["hechizo",L("Lanzando un hechizo"),true]];
  c.poses=[];const keys={},jj={};
  for(const[k,n,cb]of PO){const id="p_"+k;keys[k]=await svgToKey(poseSVG(k),true);jj[id]=PTPL[k].j;c.poses.push({id,n,img:keys[k],combate:cb})}
  c.pose="p_normal";c.lastCombat="p_ataque";
  const masks=async parts=>{const o={};for(const p of c.poses)o[p.id]=await svgToKey(maskSVG(jj[p.id],parts),false);return o};
  c.efectos=[
    Object.assign(TPL("efecto"),{id:"zRayo",n:L("Brazo de rayos"),on:false,dur:3,sub:[{id:uid(),estilo:"electricidad",c:"#7ff6ff",c2:"#4fb3ff",masks:await masks(["brazoD"])}]}),
    Object.assign(TPL("efecto"),{id:"zFuego",n:L("Pecho en llamas"),on:false,dur:0,sub:[{id:uid(),estilo:"fuego",c:"#ff6a00",c2:"#ffd36b",masks:await masks(["pecho"])}]}),
  ];
  const halo={};for(const p of c.poses)halo[p.id]={img:await svgToKey(haloSVG(jj[p.id]),false),x:0,y:0,s:1,r:0,f:false};
  c.capas=[Object.assign(TPL("capa"),{id:"kHalo",n:L("Halo dorado"),on:false,pos:"delante",imgs:halo})];
  c.recursos=[{id:"r1",n:L("Espacios de conjuro nivel 1"),act:4,max:4,rec:"largo"},{id:"r2",n:L("Espacios de conjuro nivel 2"),act:3,max:3,rec:"largo"},{id:"r3",n:L("Espacios de conjuro nivel 3"),act:2,max:2,rec:"largo"}];
  const it=(n,d,o={})=>Object.assign(TPL("item"),{n,d},o);
  const conj=[it(L("Rayo de relámpago"),L("Prende el brazo con rayos por 3 turnos (mirá la imagen)."),{recurso:"r3",efecto:"zRayo",dur:3,prep:true}),
    it(L("Escudo"),L("Reacción: +5 a la CA hasta tu próximo turno."),{recurso:"r1",prep:true}),
    it(L("Bola de fuego"),L("Prende el pecho en llamas mientras dura."),{recurso:"r3",efecto:"zFuego",dur:1,prep:false}),
    it(L("Proyectil mágico"),L("Tres dardos de 1d4+1."),{recurso:"r1",prep:true})];
  c.grupos=[{id:"gC",n:L("Conjuros"),prep:true,prepMax:3,items:conj},{id:"gD",n:L("Dotes"),items:[it(L("Afortunada"),L("3 puntos de suerte por día."),{usos:{act:3,max:3}})]}];
  c.armas=[{...TPL("arma"),id:"aEsp",n:L("Espada rúnica"),b:"+6",d:"2d6+3 cortante",crit:"custom",critMult:5,critMax:"mitad",contador:"kMarcas"},{...TPL("arma"),id:"aArco",n:L("Arco corto"),b:"+5",d:"1d6+2 perforante",mun:"cFl"}];
  c.consum=[{...TPL("consum"),id:"cFl",n:L("Carcaj"),tipo:"flecha",act:18,max:20},{...TPL("consum"),id:"cPo",n:L("Pociones de curación"),tipo:"pocion",act:2,max:3,cura:"2d4+2",c:"#d6233a"}];
  c.contadores=[{id:"kMarcas",n:L("Marcas rúnicas"),v:2,d:L("Cada golpe con la espada suma una marca."),accion:L("Explotar"),look:"runas",c:"#7ff6ff"}];
  c.medidores=[{id:"mCorr",n:L("Corrupción"),min:0,max:10,v:3,tipo:"sube",izq:"",der:"",vinc:L("Espada rúnica"),look:"orbe",umbrales:[{id:uid(),v:5,t:L("Los ojos se vuelven negros")},{id:uid(),v:10,t:L("La espada toma el control")}]}];
  c.mods=[{id:uid(),n:L("Bendición"),v:"1d4",a:"tirada",en:"todas",on:false},{id:uid(),n:L("Furia de la espada"),v:"+2",a:"daño",en:"ataque",on:true}];
  const a=uid(),b=uid();
  c.cuadros=[{id:uid(),n:L("Sobrecarga arcana"),donde:"combate",c:"#b06cff",bl:[{id:a,t:"activable",n:L("Sobrecarga"),d:L("Magia sin límite por 2 turnos."),dur:2,luego:b,efecto:"kHalo"},{id:b,t:"activable",n:L("Agotamiento"),d:L("No puede lanzar conjuros."),dur:1}]},
    {id:uid(),n:L("Hechizo futuro"),donde:"poderes",c:"#4fb3ff",bl:[{id:uid(),t:"futuro",n:L("Hechizos en espera"),dado:"1d4",secreto:true,cola:[]}]}];
  c.favs=["C.grupos.gC.items."+conj[0].id,"C.armas.aEsp","C.consum.cPo"];
  c.facciones=[{id:uid(),n:L("Inquisición"),v:-4,c:"#c42020",d:L("Te buscan por usar magia prohibida.")},{id:uid(),n:L("Gremio de magos"),v:5,c:"#4fb3ff",d:""}];
  c.textos=[{id:uid(),t:L("Cómo usar este ejemplo"),b:L("Este personaje está armado para que pruebes todo: tocá Usar en «Rayo de relámpago» y mirá el brazo; entrá en combate y cambiá de pose; probá la sobrecarga; abrí la mesa de dados. Cuando termines, borralo desde ☰ → Personajes.")}];
  return c;
}
async function createDemo(noTut){toast(L("Armando el personaje de ejemplo…"));try{const c=await makeDemo();await DB.set("c_"+c.id,c);APP.chars.push({id:c.id,n:c.nombre,th:c.poses[0].img});await DB.set("index",APP);await openChar(c.id);ui.screen="char";ui.tab="personaje";render();if(!noTut)setTimeout(tutStart,700)}catch(e){console.error(e);toast(L("No se pudo armar el ejemplo"))}}
