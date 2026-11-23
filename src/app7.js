/* ============ ambientaciones (temas) ============ */
const TEMAS=[
  ["medieval","Medieval fantástico","Alegreya+SC:wght@500;700&family=Alegreya+Sans:wght@400;500;700",["#14121a","#d9a845","#c2343c"]],
  ["scifi","Ciencia ficción","Orbitron:wght@500;700&family=Exo+2:wght@400;500;700",["#070d12","#39ffb0","#00e5ff"]],
  ["steampunk","Steampunk","IM+Fell+English+SC&family=Crimson+Pro:wght@400;500;700",["#17110b","#c8893a","#5fb3a8"]],
  ["terror","Terror gótico","Pirata+One&family=Cormorant+Garamond:wght@500;600;700",["#0b0707","#b31b1b","#8a6cff"]],
  ["feerico","Bosque feérico","Uncial+Antiqua&family=Nunito:wght@400;600;700",["#0b140f","#b6e36a","#c08bff"]],
  ["pirata","Piratas y mar","Pirata+One&family=Lora:wght@400;500;700",["#0a141c","#e0b45c","#3fc1c9"]],
  ["moderno","Moderno / urbano","Barlow+Condensed:wght@600;700&family=Barlow:wght@400;500;700",["#121417","#ffcc33","#ff4d6d"]],
  ["claro","Pergamino (claro)","Alegreya+SC:wght@500;700&family=Alegreya+Sans:wght@400;500;700",["#efe6d2","#8a5a1c","#a3262d"]],
];
const temaLoaded=new Set(["medieval","claro"]);
function applyTema(){
  const t=(C&&C.tema)||APP.tema||"medieval";const root=document.documentElement;
  if(root.dataset.tema!==t){root.dataset.tema=t;const d=TEMAS.find(x=>x[0]===t);
    if(d&&!temaLoaded.has(t)){temaLoaded.add(t);const l=document.createElement("link");l.rel="stylesheet";l.href=`https://fonts.googleapis.com/css2?family=${d[2]}&display=swap`;document.head.appendChild(l)}
    const m=document.querySelector('meta[name=theme-color]');if(m&&d)m.content=d[3][0]}
}
function temaPicker(){
  const cur=(C&&C.tema)||APP.tema||"medieval";
  return`<div class="temas">${TEMAS.map(([k,n,,c])=>`<button class="tema ${k===cur?"on":""}" data-a="tema" data-v="${k}" aria-pressed="${k===cur}"><span class="tsw" style="background:${c[0]}"><i style="background:${c[1]}"></i><i style="background:${c[2]}"></i></span>${L(n)}</button>`).join("")}</div>`;
}
