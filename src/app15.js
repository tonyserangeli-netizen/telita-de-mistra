/* ============ mesa de dados virtual ============ */
const DCARAS=[4,6,8,10,12,20,100];
function dieSVG(s,val,cls){
  const shapes={4:"M32 6 60 56H4Z",6:"M8 8h48v48H8Z",8:"M32 3 60 32 32 61 4 32Z",10:"M32 3 60 26 32 61 4 26Z",12:"M32 3 59 22 49 56H15L5 22Z",20:"M32 3 58 18v28L32 61 6 46V18Z",100:"M32 4a28 28 0 1 1 0 56a28 28 0 1 1 0-56Z"};
  const ty=s===4?44:36;
  return`<svg viewBox="0 0 64 64" class="${cls||""}"><path d="${shapes[s]||shapes[6]}" fill="var(--dfill,#d9a845)" stroke="#111" stroke-width="2.5" stroke-linejoin="round"/>${val!=null?`<text x="32" y="${ty}" text-anchor="middle" dominant-baseline="middle" font-size="${String(val).length>2?16:22}" font-weight="700" fill="#111" font-family="system-ui,sans-serif">${val}</text>`:`<text x="32" y="${ty}" text-anchor="middle" dominant-baseline="middle" font-size="${s===100?14:15}" font-weight="700" fill="#111" font-family="system-ui,sans-serif">d${s===100?"%":s}</text>`}</svg>`;
}
const DCOL={4:"#7fe0a0",6:"#ebe2cf",8:"#4fb3ff",10:"#c08bff",12:"#ff9a5a",20:"#d9a845",100:"#ff5d7a"};
function openTray(){const m=document.getElementById("modal");m.onclick=m.oninput=m.onchange=null;ui.tray=ui.tray||{cup:[],res:null,mod:0,shaken:0,hist:[]};ui.tray.res=null;renderTray();motionOn()}
function trayExpr(cup){const c={};cup.forEach(s=>c[s]=(c[s]||0)+1);return Object.keys(c).sort((a,b)=>a-b).map(s=>`${c[s]}d${s==100?"%":s}`).join(" + ")}
function renderTray(){
  const T=ui.tray,m=document.getElementById("modal");if(!T)return;
  const res=T.res,sum=res?res.reduce((t,d)=>t+d.v,0):0,tot=sum+(+T.mod||0);
  const d20s=res?res.filter(d=>d.s===20):[];const nat20=d20s.some(d=>d.v===20),nat1=d20s.some(d=>d.v===1);
  m.innerHTML=`<div class="tray" data-traym>
    <div class="mbar2">${C&&!isMaster()?`<button class="btn small" data-tr="back">‹ ${L("Calculadora")}</button>`:"<span></span>"}<b class="mtitle">🎲 ${L("Mesa de dados")}</b><button class="btn small" data-tr="close">✕</button></div>
    <div class="tmain">
      <div class="ttable" id="ttable">${res?res.map((d,i)=>`<div class="tdie ${d.s===20&&d.v===20?"n20":d.s===20&&d.v===1?"n1":""}" style="--dfill:${DCOL[d.s]};left:${d.x}%;top:${d.y}%;--r:${d.r}deg;--dx:${d.dx}px;animation-delay:${i*40}ms">${dieSVG(d.s,d.v)}</div>`).join(""):`<p class="hint tempty">${L("Tocá los dados de la derecha para meterlos en el cubilete.")}</p>`}</div>
      <div class="tside" role="group" aria-label="${L("Dados")}">${DCARAS.map(s=>`<button class="tpick" data-tr="add" data-v="${s}" style="--dfill:${DCOL[s]}" aria-label="${L("Agregar d{0}",s)}">${dieSVG(s)}</button>`).join("")}</div>
    </div>
    ${res?`<div class="tres2 ${nat20?"crit":nat1?"fail":""}"><div><span class="hint">${esc(trayExpr(res.map(d=>d.s)))}${+T.mod?` ${sg(+T.mod)}`:""}</span><div class="ttot">${tot}</div>${nat20?`<em>${L("¡20 natural!")}</em>`:nat1?`<em>${L("1 natural…")}</em>`:""}</div>
      <div class="col">${d20s.length===1?`<button class="btn small" data-tr="use20">${L("Usar como d20")}</button>`:""}<button class="btn small" data-tr="usedmg">${L("Usar como daño")}</button></div></div>`:""}
    <div class="tcupwrap">
      <button class="tcup ${T.cup.length?"":"empty"}" id="tcup" data-tr="shake" aria-label="${L("Agitar el cubilete")}">
        <svg viewBox="0 0 120 110"><path d="M14 18h92l-12 86H26Z" fill="#3b2a1a" stroke="#8a6440" stroke-width="3"/><path d="M14 18h92" stroke="#c9a46a" stroke-width="6" stroke-linecap="round"/><path d="M24 40h72M28 76h64" stroke="#8a6440" stroke-width="2" opacity=".6"/></svg>
        <div class="tin">${T.cup.slice(-12).map((s,i)=>`<i style="--dfill:${DCOL[s]};--o:${(i%4)*14-20}px;--h:${Math.floor(i/4)*12}px">${dieSVG(s)}</i>`).join("")}</div>
        ${T.cup.length?`<span class="tcount">${T.cup.length}</span>`:""}
      </button>
      <div class="tctl"><div class="texpr">${T.cup.length?esc(trayExpr(T.cup)):L("Cubilete vacío")}</div>
        <label class="lbl inline">${L("Suma fija")} <input type="number" data-trmod value="${+T.mod||0}" style="width:4.5em"></label>
        <div class="row"><button class="btn small" data-tr="empty" ${T.cup.length?"":"disabled"}>${L("Vaciar")}</button><button class="btn small" data-tr="shake" ${T.cup.length?"":"disabled"}>${L("Agitar")}</button><button class="btn on" data-tr="throw" ${T.cup.length?"":"disabled"}>${L("¡Tirar!")}</button></div>
        <p class="hint" style="margin:0">${L("También podés sacudir el celular y soltar.")}</p></div>
    </div>
    ${T.hist.length?`<div class="thist">${T.hist.slice(0,6).map(h=>`<span>${esc(h)}</span>`).join("")}</div>`:""}
  </div>`;
}
/* sonido de dados sintetizado (si no hay uno propio) */
function rattle(n,spread){const ctx=acx();if(!ctx)return;try{const t0=ctx.currentTime;for(let i=0;i<n;i++){const t=t0+Math.random()*spread;const len=.03+Math.random()*.03;const buf=ctx.createBuffer(1,Math.floor(ctx.sampleRate*len),ctx.sampleRate);const d=buf.getChannelData(0);for(let j=0;j<d.length;j++)d[j]=(Math.random()*2-1)*Math.pow(1-j/d.length,3);
  const src=ctx.createBufferSource();src.buffer=buf;const f=ctx.createBiquadFilter();f.type="bandpass";f.frequency.value=1800+Math.random()*2600;f.Q.value=2;const g=ctx.createGain();g.gain.value=.35+Math.random()*.35;src.connect(f);f.connect(g);g.connect(ctx.destination);src.start(t)}}catch(e){}}
function trayShake(){const T=ui.tray;if(!T||!T.cup.length)return;T.shaken++;const c=document.getElementById("tcup");if(c){c.classList.remove("shaking");void c.offsetWidth;c.classList.add("shaking")}
  if(!APP.mute){if(C&&C.sndEv&&C.sndEv.agitar)playSnd(C.sndEv.agitar);else rattle(Math.min(14,4+T.cup.length*2),.45)}vib(40)}
function trayThrow(){const T=ui.tray;if(!T||!T.cup.length)return;
  const res=T.cup.map((s,i)=>({s,v:rnd(s),x:8+Math.random()*72,y:10+Math.random()*62,r:Math.floor(Math.random()*90-45),dx:Math.floor(Math.random()*60-30)}));
  // separar un poco para que no se pisen
  res.forEach((d,i)=>{for(let k=0;k<i;k++){const o=res[k];if(Math.abs(o.x-d.x)<14&&Math.abs(o.y-d.y)<16){d.x=(d.x+17)%82+4;d.y=(d.y+19)%70+6}}});
  T.res=res;T.shaken=0;const sum=res.reduce((t,d)=>t+d.v,0)+(+T.mod||0);T.hist.unshift(`${trayExpr(T.cup)}${+T.mod?` ${sg(+T.mod)}`:""} = ${sum}`);T.hist=T.hist.slice(0,12);
  if(!APP.mute){if(C&&C.sndEv&&C.sndEv.dados)playSnd(C.sndEv.dados);else rattle(Math.min(22,6+res.length*3),.9)}
  if(C){const n20=res.find(d=>d.s===20);if(n20&&n20.v===20)setTimeout(()=>sfx(null,"crit"),500);else if(n20&&n20.v===1)setTimeout(()=>sfx(null,"pifia"),500);log(L("Dados: {0}",T.hist[0]))}
  vib([30,40,30,40,60]);renderTray()}
/* sacudir el celular */
let MOT=null;
function motionOn(){if(MOT)return;let last=0,shakes=0,quiet=null;
  MOT=e=>{if(!document.querySelector("[data-traym]")){motionOff();return}const a=e.accelerationIncludingGravity||e.acceleration;if(!a)return;const g=Math.hypot(a.x||0,a.y||0,a.z||0);const now=Date.now();
    if(Math.abs(g-9.8)>9&&now-last>180){last=now;shakes++;trayShake();clearTimeout(quiet);quiet=setTimeout(()=>{if(shakes>=2)trayThrow();shakes=0},650)}};
  window.addEventListener("devicemotion",MOT)}
function motionOff(){if(MOT){window.removeEventListener("devicemotion",MOT);MOT=null}}
async function motionAsk(){try{if(window.DeviceMotionEvent&&typeof DeviceMotionEvent.requestPermission==="function"&&!ui.motionAsked){ui.motionAsked=true;await DeviceMotionEvent.requestPermission()}}catch(e){}}
(function(){
  document.addEventListener("click",e=>{const b=e.target.closest("[data-tr]");if(!b||!ui.tray)return;e.preventDefault();e.stopPropagation();const k=b.dataset.tr,T=ui.tray;motionAsk();
    if(k==="close"){motionOff();document.getElementById("modal").innerHTML="";return}
    if(k==="back"){motionOff();if(!C){document.getElementById("modal").innerHTML="";return}diceOpen();return}
    if(k==="add"){if(T.cup.length>=40){toast(L("Ya hay muchos dados en el cubilete"));return}T.cup.push(+b.dataset.v);if(T.res){T.res=null}if(!APP.mute)rattle(2,.08);renderTray();const c=document.getElementById("tcup");if(c){c.classList.add("plop");setTimeout(()=>c.classList.remove("plop"),250)}return}
    if(k==="empty"){T.cup=[];T.res=null;renderTray();return}
    if(k==="shake"){if(!T.cup.length){toast(L("Primero meté dados en el cubilete"));return}trayShake();return}
    if(k==="throw"){trayThrow();return}
    if(k==="use20"||k==="usedmg"){const res=T.res||[];motionOff();diceOpen();const D=ui.dc;if(k==="use20"){D.d1=(res.find(d=>d.s===20)||{}).v}else{const nd=res.filter(d=>d.s!==20);D.dmg=(nd.length?nd:res).reduce((t,d)=>t+d.v,0)}renderDice();return}
  },true);
  document.addEventListener("input",e=>{if(e.target.matches("[data-trmod]")&&ui.tray){ui.tray.mod=parseInt(e.target.value)||0}});
})();
