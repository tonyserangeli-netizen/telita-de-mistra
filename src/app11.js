/* ============ estilos de notas ============ */
const NLOOKS=[["base","Normal"],["libro","Libro"],["papiro","Papiro"],["lista","Lista"]];
const nlook=()=>APP.nlook||"base";
function nlookBar(){return`<div class="chips nlbar" role="group" aria-label="${L("Estilo de las notas")}">${NLOOKS.map(([k,n])=>`<button class="chip ${nlook()===k?"on":""}" data-a="nlook" data-v="${k}" aria-pressed="${nlook()===k}">${L(n)}</button>`).join("")}</div>`}
const noteRef=(n,path)=>"N."+[...path,n].map(x=>x.id).join(".k.");
function notesBook(){
  const pages=flatNotes();const total=pages.length+1;ui.nbp=clamp(ui.nbp||0,0,total-1);const p=ui.nbp;
  const nav=`<div class="nbnav"><button class="gbtn ghost" data-a="nbp" data-v="${p-1}" ${p>0?"":"disabled"} aria-label="${L("Página anterior")}">‹</button>
    <select data-nbsel aria-label="${L("Ir a la página")}"><option value="0">${L("Índice")}</option>${pages.map(({n,path},i)=>`<option value="${i+1}" ${p===i+1?"selected":""}>${"— ".repeat(path.length)}${esc(n.t||"—")}</option>`).join("")}</select>
    <button class="gbtn ghost" data-a="nbp" data-v="${p+1}" ${p<total-1?"":"disabled"} aria-label="${L("Página siguiente")}">›</button></div>`;
  let body;
  if(p===0)body=`<div class="gtitle">${L("Cuaderno")}</div><div class="gsub">${L("Índice")}</div>
    <ol class="gindex nbidx">${pages.map(({n,path},i)=>`<li style="padding-left:${path.length*14}px"><button data-a="nbp" data-v="${i+1}">${esc(n.t||"—")}</button><span>${i+2}</span></li>`).join("")||`<li>${L("Sin notas todavía.")}</li>`}</ol>
    <button class="gbtn" data-a="nbnew" style="margin-top:12px">＋ ${L("Página nueva")}</button>`;
  else{const{n,path}=pages[p-1],ref=noteRef(n,path);
    body=`<div class="geyebrow">${path.map(x=>esc(x.t)).join(" › ")||L("Cuaderno")}</div>
    <input class="gin gtitle" ${R(ref,"t")} value="${esc(n.t)}" aria-label="${L("Título")}">
    <textarea class="gin gtext" rows="12" ${R(ref,"b")} placeholder="${L("Escribí acá…")}">${esc(n.b)}</textarea>
    ${noteImgs(n,ref)}
    ${(n.k||[]).length?`<div class="gsub" style="margin-top:10px">${L("Páginas dentro")}</div><ul class="nbkids">${n.k.map(c=>{const i=pages.findIndex(x=>x.n===c);return`<li><button data-a="nbp" data-v="${i+1}">${esc(c.t||"—")}</button></li>`}).join("")}</ul>`:""}
    <div class="gedrow"><button class="gbtn ghost" data-a="nbsub" data-ref="${ref}">＋ ${L("Página dentro de esta")}</button><button class="gbtn ghost" data-a="nbnew">＋ ${L("Página nueva")}</button>
      <button class="gbtn danger" data-a="delNote" data-ref="${ref}">${ui.confirm===n.id?L("¿Seguro? Tocá otra vez"):"🗑 "+L("Borrar página")}</button></div>`}
  return`${nav}<div class="nbook"><div class="gpage">${body}<div class="gnum">${p+1}</div></div></div>${nav}`;
}
