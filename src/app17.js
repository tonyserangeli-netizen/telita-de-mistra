/* ============ orden alfabético, niveles y favoritos arriba ============ */
const byName=(a,b)=>String(a.n||"").localeCompare(String(b.n||""),undefined,{numeric:true,sensitivity:"base"});
const isFav=ref=>(C.favs||[]).includes(ref);
function ord(arr,base){if(ui.edit||!arr)return arr||[];const s=[...arr].sort(byName);if(!base)return s;return[...s.filter(x=>isFav(`${base}.${x.id}`)),...s.filter(x=>!isFav(`${base}.${x.id}`))]}
function itemLevel(it){
  if(it.nv!==undefined&&it.nv!==null&&it.nv!=="")return +it.nv;
  const d=String(it.d||"");let m=d.match(/^\s*(?:Nivel|Level|Nível)\s+(\d)\b/i);if(m)return +m[1];if(/^\s*(?:Truco|Cantrip)\b/i.test(d))return 0;return null}
const lvlName=n=>n===0?L("Trucos"):L("Nivel {0}",n);
function grpListHTML(g,ref){
  const items=g.items;if(!items.length)return`<div class="empty">${L("Vacío.")}</div>`;
  if(ui.edit)return items.map(it=>itemCard(it,`${ref}.items.${it.id}`)).join("");
  const card=it=>itemCard(it,`${ref}.items.${it.id}`);
  const favs=items.filter(it=>isFav(`${ref}.items.${it.id}`)).sort(byName),rest=items.filter(it=>!isFav(`${ref}.items.${it.id}`));
  let html=favs.length?`<div class="lvlh">★ ${L("Favoritos")}</div>${favs.map(card).join("")}`:"";
  const lv=new Map();let none=[];rest.forEach(it=>{const n=itemLevel(it);if(n==null)none.push(it);else{if(!lv.has(n))lv.set(n,[]);lv.get(n).push(it)}});
  if(!lv.size)return html+(favs.length&&none.length?`<div class="lvlh">${L("Todos")}</div>`:"")+none.sort(byName).map(card).join("");
  [...lv.keys()].sort((a,b)=>a-b).forEach(n=>{html+=`<div class="lvlh">${lvlName(n)}</div>`+lv.get(n).sort(byName).map(card).join("")});
  if(none.length)html+=`<div class="lvlh">${L("Sin nivel")}</div>`+none.sort(byName).map(card).join("");
  return html;
}
function grpOrdered(g){const items=[...g.items];return items.sort((a,b)=>{const la=itemLevel(a),lb=itemLevel(b);return(la==null?99:la)-(lb==null?99:lb)||byName(a,b)})}
