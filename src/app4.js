/* ============ acciones ============ */
function resolve(ref){
  const parts=ref.split(".");let cur=parts[0]==="N"?NOTES:C,parent=null,key=null;
  for(let i=1;i<parts.length;i++){const s=parts[i];parent=cur;if(Array.isArray(cur)){key=cur.findIndex(x=>x&&x.id===s);cur=key>=0?cur[key]:undefined}else{key=s;cur=cur[s]}if(cur===undefined||cur===null)return null}
  return{obj:cur,parent,key};
}
function startFx(x){
  const d=+x.dur||0;
  if(x.efecto){const e=linkFind(x.efecto);if(e){e.on=true;e.left=d||(+e.dur||0);return}}
  if(d>0){C.tempFx=C.tempFx.filter(f=>f.n!==x.n);C.tempFx.push({id:uid(),n:x.n,left:d,d})}
}
function setCombat(on){
  C.combate=on;
  if(on){C.turno=1;const cp=C.poses.filter(p=>p.combate);const last=cp.find(p=>p.id===C.lastCombat);if(cp.length)C.pose=(last||cp[cp.length>1?cp.length-1:0]).id;ui.tab="combate"}
  else{C.turno=0;const np=C.poses.find(p=>!p.combate);if(np)C.pose=np.id;if(ui.tab==="combate")ui.tab=wide()?"poderes":"personaje"}
}
function nextTurn(){
  C.turno++;const off=[];
  [...C.efectos,...(C.capas||[])].forEach(e=>{if(e.on&&e.left>0){e.left--;if(e.left===0){e.on=false;off.push(e.n)}}});
  C.tempFx.forEach(f=>{f.left--;if(f.left<=0)off.push(f.n)});C.tempFx=C.tempFx.filter(f=>f.left>0);
  (C.invoc||[]).forEach(v=>{if(v.estado==="invocada"&&v.left>0){v.left--;if(v.left===0){v.estado="dentro";off.push(v.n);if(v.efecto){const e=linkFind(v.efecto);if(e){e.on=false;e.left=0}}}}});
  C.magicos.forEach(m=>{if(m.rec==="turnos"&&m.cd>0){m.cd--;if(m.cd===0&&m.usos.act<m.usos.max){m.usos.act++;if(m.usos.act<m.usos.max)m.cd=+m.recN||1}}});
  cuadrosTurn(off);
  log(L("Turno {0}",C.turno)+(off.length?" · "+L("terminó: {0}",off.join(", ")):""));
  return off;
}
function rest(kind){
  C.recursos.forEach(r=>{if(r.rec===kind||(kind==="largo"&&r.rec==="corto"))r.act=r.max});
  C.grupos.forEach(g=>g.items.forEach(it=>{if(it.usos.max&&(it.rec===kind||(kind==="largo"&&it.rec==="corto")))it.usos.act=it.usos.max}));
  C.magicos.forEach(m=>{if(m.rec===kind||(kind==="largo"&&m.rec==="corto")){m.usos.act=m.usos.max;m.t=0}});
  if(kind==="largo"){C.hp.act=C.hp.max;C.muerte={ok:0,fail:0}}
  log(kind==="largo"?L("Descanso largo"):L("Descanso corto"));
}
const NOMUT=new Set(["mesaOn","mesaOff","mesaBar","demo","mapsOpen","prepMode","calOpen","tutStart","nlook","nbp","nbnew","nbsub","lookOpen","snd","grim","capaAdjust","viewImg","dice","cmp","ptpl","ptplDl","ptplDlSel","ptplDlAll","wstep","wdone","wizard","tab","edit","menu","menuClose","screen","tog","paint","copyPrompt","goNote","openChar","expChar","expAll","undo","dupChar","delChar","newChar","delNote"]);
async function onClick(ev){
  const b=ev.target.closest("[data-a]");if(!b)return;
  const stop=ev.target.closest("[data-stop]");if(stop&&b.contains(stop))return;
  if(b.tagName==="LABEL"||b.tagName==="SELECT"||b.tagName==="INPUT")return;
  const a=b.dataset.a,D=b.dataset;
  if(!NOMUT.has(a))snap();
  let msg="",noSave=false;
  switch(a){
    case "tab":ui.tab=D.v;render();try{window.scrollTo({top:0})}catch(e){}return;
    case "edit":ui.edit=!ui.edit;render();return;
    case "menu":ui.menu=true;render();return;
    case "menuClose":ui.menu=false;render();return;
    case "screen":ui.screen=D.v;ui.menu=false;ui.confirm=null;render();return;
    case "tog":ui.open[D.id]=!ui.open[D.id];render();return;
    case "undo":{const p=undo.pop();if(p){C=JSON.parse(p);saveSoon();render();toast(L("Deshecho"))}return}
    case "openChar":await openChar(D.id);ui.screen="char";ui.confirm=null;render();return;
    case "newChar":{const n=(document.getElementById("nc-name")||{}).value||"";const c=newChar(n.trim()||L("Nuevo personaje"));await DB.set("c_"+c.id,c);APP.chars.push({id:c.id,n:c.nombre});await openChar(c.id);ui.newName="";ui.screen="wizard";ui.wstep=0;ui.tab="personaje";render();try{window.scrollTo({top:0})}catch(e){}return}
    case "dupChar":{const src=await DB.get("c_"+D.id);if(!src)return;const c=clone(src);c.id=uid();c.nombre=src.nombre+" "+L("(copia)");await DB.set("c_"+c.id,c);APP.chars.push({id:c.id,n:c.nombre,th:(APP.chars.find(x=>x.id===D.id)||{}).th,enem:!!src.enemigo});await DB.set("index",APP);render();return}
    case "delChar":{if(ui.confirm!==D.id){ui.confirm=D.id;render();return}APP.chars=APP.chars.filter(x=>x.id!==D.id);await DB.del("c_"+D.id);if(C&&C.id===D.id){C=null;APP.cur=null}ui.confirm=null;await DB.set("index",APP);render();return}
    case "wstep":ui.wstep=clamp(num(D.v),0,WSTEPS.length-1);render();try{window.scrollTo({top:0})}catch(e){}return;
    case "wdone":ui.screen="char";ui.tab="personaje";render();try{window.scrollTo({top:0})}catch(e){}return;
    case "wizard":ui.screen="wizard";ui.wstep=0;ui.menu=false;render();return;
    case "expChar":await exportChar(D.id);return;
    case "expAll":await exportAll();return;
    case "paint":ui.paint={eid:D.id,pid:D.v};openPainter();return;
    case "bgDel":{if(D.v==="char"){dropImg(C.fondo);C.fondo=null}else{const p=C.poses.find(x=>x.id===D.v);if(p){dropImg(p.bg);p.bg=null}}break}
    case "ptpl":ui.ptpl=D.v||"";if(D.v)ui.promptAct=L(PTPL[D.v].n).toLowerCase();render();return;
    case "ptplDl":downloadPoses([ui.ptpl]);return;
    case "ptplDlSel":downloadPoses(Object.keys(ui.dlSel||{}).filter(k=>ui.dlSel[k]));return;
    case "ptplDlAll":downloadPoses(Object.keys(PTPL));return;
    case "copyPrompt":copyText(prompText());return;
    case "goNote":{const f=flatNotes().find(x=>x.n.id===D.id);if(f){f.path.forEach(p=>ui.open[p.id]=true);ui.open[D.id]=true}ui.nq="";render();requestAnimationFrame(()=>{const el=document.getElementById("nd-"+D.id);if(el)el.scrollIntoView({block:"center"})});return}
    case "delNote":{const r=resolve(D.ref);if(!r)return;if(ui.confirm!==r.obj.id){ui.confirm=r.obj.id;render();return}r.parent.splice(r.key,1);ui.confirm=null;saveNotes();render();return}
    case "add":{
      const it=TPL(D.kind);
      if(D.ref==="N"){NOTES.push(it);ui.open[it.id]=true;saveNotes();render();return}
      const r=resolve(D.ref);if(!r||!Array.isArray(r.obj))return;
      if(D.kind==="pose"&&C.poses.length)it.combate=true;
      r.obj.push(it);if(D.open)ui.open[D.open]=true;if(D.kind==="efecto"){ui.promptZ=ui.promptZ||{};ui.promptZ[it.id]=true}
      if(["parte","nota"].includes(D.kind))ui.open[it.id]=true;
      if(!["parte","nota","invItem","umbral"].includes(D.kind))ui.edit=true;
      if(D.ref.startsWith("N")){saveNotes();render();return}
      break}
    case "del":{const r=resolve(D.ref);if(!r||!Array.isArray(r.parent))return;const o=r.parent[r.key];r.parent.splice(r.key,1);
      if(o&&o.masks)Object.values(o.masks).forEach(dropImg);if(o&&o.sub)o.sub.forEach(sb=>Object.values(sb.masks||{}).forEach(dropImg));if(o&&o.img&&C.poses.indexOf(o)<0)dropImg(o.img);
      if(o&&C.pose===o.id&&C.poses[0])C.pose=C.poses[0].id;
      if(D.ref.startsWith("N")){saveNotes();render();return}
      msg=L("Borrado");break}
    case "dmg":case "heal":{const v=num(((ui.mesa&&document.getElementById("hp-in2"))||document.getElementById("hp-in")||{}).value);if(!v){undo.pop();return}
      sfx(null,a==="dmg"?"dano":"cura");
      if(a==="dmg"&&C.terror){document.body.classList.add("hshake");setTimeout(()=>document.body.classList.remove("hshake"),500)}
      if(a==="dmg"){if(!C.combate)setCombat(true);const t=+C.hp.temp||0,abs=Math.min(t,v);C.hp.temp=t-abs;C.hp.act=Math.max(0,C.hp.act-(v-abs));log(L("Recibió {0} de daño",v)+(abs?` (${abs} ${L("de sobrevida")})`:""));msg="−"+v+" "+L("PV")+(abs?` · ${L("Sobrevida")}: ${C.hp.temp}`:"")}
      else{C.hp.act=Math.min(C.hp.max,C.hp.act+v);log(L("Se curó {0}",v));msg="+"+v+" "+L("PV")}break}
    case "temp":{const v=num((document.getElementById("hp-in")||{}).value);if(!v){undo.pop();toast(L("Escribí cuánta sobrevida sumar"));return}C.hp.temp=(+C.hp.temp||0)+v;log(L("Ganó {0} de sobrevida",v));msg="+"+v+" "+L("Sobrevida");break}
    case "tempClear":C.hp.temp=0;break;
    case "combat":setCombat(!C.combate);if(C.combate)sfx(null,"combate");log(C.combate?L("Entró en combate"):L("Terminó el combate"));msg=C.combate?L("¡En combate!"):L("Combate terminado");break;
    case "pose":C.pose=D.id;{const p=curPose();if(p&&p.combate)C.lastCombat=p.id}break;
    case "estado":{const s=C.estados.find(x=>x.id===D.id);s.on=!s.on;log(s.n+": "+(s.on?L("activo"):L("inactivo")));break}
    case "turnNext":{const off=nextTurn();sfx(null,"turno");msg=off.length?L("Turno {0} · terminó: {1}",C.turno,off.join(", ")):L("Turno {0}",C.turno);break}
    case "turnBack":if(C.turno>1)C.turno--;break;
    case "fxEnd":C.tempFx=C.tempFx.filter(f=>f.id!==D.id);break;
    case "cAdd":{C.consum=C.consum||[];const it=TPL("consum");const tp=CTIPOS.find(x=>x[0]===D.v);it.tipo=D.v;it.n=L(tp?tp[1]:"Munición");
      if(D.v==="bala"){it.cap=6;it.carga=6;it.act=24;it.max=24}if(D.v==="pocion"){it.act=it.max=3;it.cura="2d4+2";it.c="#d6233a"}if(D.v==="bomba"){it.act=it.max=3;it.c="#2b2b33"}if(D.v==="cuchillo"){it.act=it.max=6}if(D.v==="dardo"){it.act=it.max=10;it.c="#36e0a0"}
      C.consum.push(it);ui.edit=true;break}
    case "cUse":{const x=C.consum.find(y=>y.id===D.id);if(!cSpend(x)){undo.pop();toast(L("No queda: {0}",x.n));return}sfx(x);
      if(x.tipo==="pocion"&&x.cura){const h=rollExpr(x.cura);C.hp.act=Math.min(C.hp.max,C.hp.act+h);log(L("Bebió {0}: +{1} PV",x.n,h));msg=L("Curaste {0} PV",h)}else{log(L("Usó {0}",x.n));msg=`${x.n}: ${+x.cap>0?x.carga:x.act}`}flash("con-"+x.id);break}
    case "cReload":{const x=C.consum.find(y=>y.id===D.id);const n=Math.min(+x.cap-x.carga,x.act);if(n<=0){undo.pop();return}x.carga+=n;x.act-=n;sfx(x.sndR?{snd:x.sndR}:null,"recarga");log(L("Recargó {0}",x.n));msg=L("Recargado: {0}/{1}",x.carga,x.cap);break}
    case "cRecover":{const x=C.consum.find(y=>y.id===D.id);const n=Math.ceil((+x.gast||0)/2);x.act=Math.min(x.max||x.act+n,x.act+n);x.gast=0;msg=L("Recuperaste {0}",n);break}
    case "cAdj":{const x=C.consum.find(y=>y.id===D.id);x.act=Math.max(0,x.act+num(D.v));if(x.max&&x.act>x.max&&!(+x.cap))x.max=x.act;break}
    case "grim":openGrim(false);return;
    case "prepMode":ui.prepMode=ui.prepMode===D.id?null:D.id;render();return;
    case "prepTog":{const it=resolve(D.pref).obj,g=grpOfRef(D.pref);if(!it.prep&&g&&+g.prepMax&&prepCount(g)>=+g.prepMax){undo.pop();toast(L("Ya preparaste el máximo ({0})",g.prepMax));render();return}it.prep=!it.prep;break}
    case "rep":{const f=(C.facciones||[]).find(x=>x.id===D.id);f.v=clamp((+f.v||0)+num(D.v),-10,10);log(`${f.n}: ${f.v>0?"+":""}${f.v}`);break}
    case "repAdd":C.facciones=C.facciones||[];C.facciones.push({id:uid(),n:L("Facción nueva"),v:0,c:"#d9a845",d:""});ui.edit=true;break;
    case "demo":createDemo();return;
    case "mesaOn":ui.mesa=true;ui.mesaBar=false;render();return;
    case "mesaOff":ui.mesa=false;ui.mesaInst=null;render();return;
    case "mesaBar":ui.mesaBar=!ui.mesaBar;render();return;
    case "mapsOpen":ui.menu=false;render();openMaps();return;
    case "calOpen":ui.menu=false;render();openCal();return;
    case "tutStart":ui.menu=false;render();openTutMenu();return;
    case "pestNew":{C.pestanas=C.pestanas||[];const p={id:uid(),n:L("Pestaña nueva")};C.pestanas.push(p);ui.tab="p_"+p.id;break}
    case "nlook":APP.nlook=D.v;DB.set("index",APP);render();return;
    case "nbp":ui.nbp=num(D.v);render();document.getElementById("notes-body")?.scrollIntoView({block:"start",behavior:"smooth"});return;
    case "nbnew":{const it=TPL("nota");it.t=L("Página nueva");NOTES.push(it);saveNotes();ui.nbp=flatNotes().findIndex(x=>x.n===it)+1;render();return}
    case "nbsub":{const r=resolve(D.ref);if(!r)return;const it=TPL("nota");it.t=L("Página nueva");r.obj.k=r.obj.k||[];r.obj.k.push(it);saveNotes();ui.nbp=flatNotes().findIndex(x=>x.n===it)+1;render();return}
    case "lookOpen":ui.menu=false;render();openLook();return;
    case "look":{if(D.ref){const r=resolve(D.ref);if(r&&r.obj)r.obj.look=D.v}else{C.look=C.look||{};C.look[D.k]=D.v}break}
    case "snd":ui.menu=false;render();openSnd();return;
    case "tema":{if(C)C.tema=D.v;APP.tema=D.v;DB.set("index",APP);break}
    case "capaToggle":{const c=C.capas.find(x=>x.id===D.id);if(c.on){c.on=false;c.left=0}else{c.on=true;c.left=+c.dur||0;if(!Object.keys(c.imgs||{}).length)msg=L("Subí una imagen para esta capa en Cuerpo → Capas")}break}
    case "capaImgDel":{const c=C.capas.find(x=>x.id===D.id);const li=c.imgs[D.v];delete c.imgs[D.v];if(li&&!Object.values(c.imgs).some(v=>v.img===li.img))dropImg(li.img);break}
    case "capaCopy":{const c=C.capas.find(x=>x.id===D.id);const src=c.imgs[C.pose]||Object.values(c.imgs)[0];if(!src){undo.pop();return}let n=0;C.poses.forEach(p=>{if(!c.imgs[p.id]){c.imgs[p.id]=Object.assign({},src);n++}});msg=n?L("Copiada a {0} pose(s). Acomodala en cada una si hace falta.",n):L("Todas las poses ya tienen imagen");break}
    case "capaAdjust":openLayerAdjust(D.id,D.v);return;
    case "viewImg":viewImg(D.k,D.ref);return;
    case "dice":diceOpen();return;
    case "cmp":openCmp(D.v);return;
    case "effToggle":{const e=C.efectos.find(x=>x.id===D.id);if(e.on){e.on=false;e.left=0}else{e.on=true;e.left=+e.dur||0}break}
    case "estilo":{const e=C.efectos.find(z=>z.id===D.id);const st=ESTILOS.find(s=>s[0]===D.v);if((e.estilo||"brillo")!==D.v&&st){e.estilo=D.v;e.c=st[2];e.c2="";if(D.v==="metal"){e.halo=.3;e.brillo=.95}}break}
    case "swatch":{const e=C.efectos.find(x=>x.id===D.id);e.c=D.v;break}
    case "barStep":{const x=C.barras.find(b=>b.id===D.id);x.v=clamp(x.v+num(D.v)*(+x.paso||1),0,x.max||100);flash("bar-"+x.id);break}
    case "barAdd":{const x=C.barras.find(b=>b.id===D.id);const inp=b.closest(".card")&&b.closest(".card").querySelector("input[data-barin]");const v=num(inp&&inp.value);if(!v){undo.pop();return}x.v=clamp(x.v+v,0,x.max||100);msg=x.n+": "+x.v+x.u;break}
    case "barReset":{const x=C.barras.find(b=>b.id===D.id);x.v=0;break}
    case "cnt":{const k=C.contadores.find(x=>x.id===D.id);k.v=Math.max(0,k.v+num(D.v));break}
    case "cntAll":{const k=C.contadores.find(x=>x.id===D.id);if(!k.v){undo.pop();return}log(`${k.accion||L("Usar todo")}: ${k.n} (${k.v})`);msg=`${k.accion||L("Usar todo")} · ${k.v}`;k.v=0;break}
    case "hit":{const w=C.armas.find(x=>x.id===D.id);const am=ammoOf(w);if(am&&!cSpend(am)){undo.pop();toast(+am.cap>0&&am.act>0?L("Cargador vacío: tocá Recargar"):L("Sin munición: {0}",am.n));vib(200);return}const k=C.contadores.find(x=>x.id===w.contador);if(k)k.v++;sfx(w.snd?w:am);log(L("Golpeó con {0}",w.n)+(k?` (+1 ${k.n})`:""));msg=k?`+1 · ${k.n}: ${k.v}`:L("Golpe con {0}",w.n);flash("hit-"+w.id);break}
    case "invState":{const v=C.invoc.find(x=>x.id===D.id);v.estado=D.v;const e=linkFind(v.efecto);
      if(D.v==="invocada"){sfx(v);v.left=+v.dur||0;if(e){e.on=true;e.left=v.left}log(L("Invocó a {0}",v.n));msg=L("Invocó a {0}",v.n)}else{v.left=0;if(e){e.on=false;e.left=0}log(`${v.n}: ${L(EST[D.v]).toLowerCase()}`)}flash("inv-"+v.id);break}
    case "invHp":{const v=C.invoc.find(x=>x.id===D.id);const c=b.closest(".card");const inp=c&&c.querySelector("input[data-invin]");const n=num(inp&&inp.value);if(!n){undo.pop();return}
      v.hp.act=clamp(v.hp.act+n*num(D.v),0,v.hp.max);if(v.hp.act===0&&v.estado==="invocada")v.estado="agotada";msg=`${v.n}: ${v.hp.act}/${v.hp.max}`;break}
    case "res":{const r=C.recursos.find(x=>x.id===D.id);r.act=clamp(r.act+num(D.v),0,r.max);break}
    case "med":{const M=C.medidores.find(x=>x.id===D.id);M.v=clamp(M.v+num(D.v),M.min,M.max);log(`${M.n}: ${M.v}`);break}
    case "prof":{const r=resolve(D.ref).obj;r.p=((r.p||0)+1)%num(D.v);break}
    case "insp":C.insp=!C.insp;msg=C.insp?L("Inspiración ganada"):L("Inspiración usada");break;
    case "death":{const cf=deathCfg(),k=D.v,i=num(D.i);C.muerte[k]=(i<C.muerte[k])?i:i+1;
      if(C.muerte.ok>=(+cf.ok||3)){C.muerte={ok:0,fail:0};C.hp.act=Math.max(C.hp.act,1);log(L("Se estabilizó"));msg=L("¡Estabilizado!")}
      else if(k==="fail"&&C.muerte.fail>=(+cf.fail||3)){log(L("Cayó: {0} fallos",C.muerte.fail));msg=L("Sin más salvaciones…");vib([300,100,300])}break}
    case "rest":rest(D.v);sfx(null,"descanso");ui.menu=false;msg=D.v==="largo"?L("Descanso largo: todo recargado"):L("Descanso corto");break;
    case "itemPlus":{const it=resolve(D.ref).obj;if(it.usos.act<it.usos.max)it.usos.act++;else{undo.pop();return}break}
    case "useItem":{const it=resolve(D.ref).obj;if(unprep(grpOfRef(D.ref),it)){undo.pop();toast(L("{0} no está preparado hoy",it.n));return}const r=it.recurso&&C.recursos.find(x=>x.id===it.recurso);const cost=+it.costo||0;
      if(it.usos.max&&it.usos.act<=0){undo.pop();toast(L("No quedan usos de {0}",it.n));return}
      if(r&&cost&&r.act<cost){undo.pop();toast(L("No alcanza: {0}",r.n));return}
      if(it.usos.max){it.usos.act--;if(it.rec==="horas"&&!it.t)it.t=Date.now();if(it.rec==="turnos"&&!it.cd)it.cd=+it.recN||1}
      if(r&&cost)r.act-=cost;
      startFx(it);sfx(it);log(L("Usó {0}",it.n));msg=it.n+(it.usos.max?" · "+L("quedan {0}",it.usos.act):"")+(r&&cost?" · "+r.n+" "+r.act:"");flash("it-"+it.id);break}
    default:undo.pop();return;
  }
  if(!noSave)saveSoon();render();if(msg)toast(msg);
}
function onChange(ev){
  const t=ev.target;
  if(t.matches("[data-mesaamb]")){C.amb=t.value;saveSoon();render();return}
  if(t.matches("[data-nbsel]")){ui.nbp=num(t.value);render();return}
  if(t.matches("[data-lang]")){LANG=t.value;APP.lang=LANG;DB.set("index",APP);render();return}
  if(t.matches("[data-upload]")){uploadPose(t.dataset.upload,t.files&&t.files[0]);return}
  if(t.matches("[data-capaup]")){uploadCapa(t.dataset.capaup,t.dataset.pose,t.files&&t.files[0]);return}
  if(t.matches("[data-noteimg]")){addNoteImgs(t.dataset.noteimg,[...(t.files||[])]);return}
  if(t.matches("[data-invup]")){uploadInvoc(t.dataset.invup,t.files&&t.files[0]);return}
  if(t.matches("[data-bgup]")){uploadBg(t.dataset.bgup,t.files&&t.files[0]);return}
  if(t.matches("[data-import]")){importFile(t.files&&t.files[0]);return}
  if(t.id==="prompt-act"){ui.promptAct=t.value;const p=document.getElementById("prompt-txt");if(p)p.textContent=prompText();return}
  if(t.id==="nc-name"){ui.newName=t.value;return}
  if(t.dataset.dlsel){ui.dlSel=ui.dlSel||{};ui.dlSel[t.dataset.dlsel]=t.checked;const bt=document.querySelector('[data-a="ptplDlSel"]');if(bt)bt.disabled=!Object.values(ui.dlSel).some(Boolean);return}
  if(t.dataset.pz){ui.promptZ=ui.promptZ||{};ui.promptZ[t.dataset.pz]=t.checked;const p=document.getElementById("prompt-txt");if(p)p.textContent=prompText();return}
  if(t.id==="prompt-glow"){ui.promptGlow=t.value;const p=document.getElementById("prompt-txt");if(p)p.textContent=prompText();return}
  if(t.dataset.a3==="hpmax"){snap();const v=Math.max(1,num(t.value));if(C.hp.act===C.hp.max||C.hp.act>v)C.hp.act=v;C.hp.max=v;saveSoon();return}
  if(t.dataset.a2==="effMed"){snap();const e=C.efectos.find(x=>x.id===t.dataset.id);e.med=t.value?{id:t.value,neg:(e.med&&e.med.neg)||["#050304","#c0121e"],pos:(e.med&&e.med.pos)||["#fffdf4","#e3b44e"]}:null;saveSoon();render();return}
  if(t.dataset.a2==="effGrad"){snap();const e=C.efectos.find(x=>x.id===t.dataset.id);e.c2=t.checked?(e.c2||"#ffffff"):"";saveSoon();render();return}
  const ref=t.dataset.ref,f=t.dataset.f;if(!ref||!f)return;
  const r=resolve(ref);if(!r)return;
  if(!ref.startsWith("N"))snap();
  const o=r.obj,ty=t.dataset.t;let v=t.value;
  if(ty==="n")v=num(v);else if(ty==="f")v=parseFloat(v)||0;else if(ty==="b")v=t.hasAttribute("data-inv")?!t.checked:t.checked;
  const old=o[f];o[f]=v;
  if(f==="max"&&"act" in o){if(o.act===old||o.act>v)o.act=v;if(o.act<0)o.act=0}
  if("min" in o&&"max" in o&&"v" in o&&o.umbrales){if(o.min>o.max)o.max=o.min;o.v=clamp(o.v,o.min,o.max)}
  if(o===C.hp){C.hp.max=Math.max(1,C.hp.max);C.hp.act=clamp(C.hp.act,0,C.hp.max)}
  if(o.paso!==undefined&&f==="max")o.v=clamp(o.v,0,o.max||100);
  if(ref.startsWith("N")){saveNotes();if(f==="t")render();return}
  saveSoon();
  if(t.type==="range"||t.type==="color"||t.type==="checkbox"||t.tagName==="SELECT"||f==="n"||f==="k"||f==="nombre"||f==="clase"||ty==="n")render();
}
function onInput(ev){
  const t=ev.target;
  if(t.id==="nq"){ui.nq=t.value;const nb=document.getElementById("notes-body");if(nb)nb.innerHTML=notesBody();return}
  if(t.id==="prompt-act"){ui.promptAct=t.value;const p=document.getElementById("prompt-txt");if(p)p.textContent=prompText()}
}
function copyText(s){
  const ok=()=>toast(L("Texto copiado"));
  try{navigator.clipboard.writeText(s).then(ok,fallback)}catch(e){fallback()}
  function fallback(){const ta=document.createElement("textarea");ta.value=s;document.body.appendChild(ta);ta.select();try{document.execCommand("copy");ok()}catch(e){toast(L("Seleccioná el texto y copialo a mano"))}ta.remove()}
}

/* ============ imágenes de poses ============ */
function loadImage(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src})}
function removeChecker(ctx,w,h){
  const d=ctx.getImageData(0,0,w,h),p=d.data;const lum=i=>(p[i*4]*.3+p[i*4+1]*.59+p[i*4+2]*.11);const neu=i=>Math.max(p[i*4],p[i*4+1],p[i*4+2])-Math.min(p[i*4],p[i*4+1],p[i*4+2])<22;
  const hist=new Array(32).fill(0);let tot=0;const bord=[];for(let x=0;x<w;x+=2){bord.push(x,(h-1)*w+x,w+x,(h-2)*w+x)}for(let y=0;y<h;y+=2){bord.push(y*w,y*w+w-1,y*w+1,y*w+w-2)}
  for(const i of bord){tot++;if(p[i*4+3]>20&&neu(i))hist[Math.min(31,lum(i)>>3)]++}
  const pk=[];for(let k=0;k<32;k++){const v=hist[k]+(hist[k-1]||0)+(hist[k+1]||0);if(hist[k]>=(hist[k-1]||0)&&hist[k]>=(hist[k+1]||0)&&v>tot*.12)pk.push([k,v])}
  pk.sort((a,b)=>b[1]-a[1]);if(pk.length<2)return false;const c1=pk[0][0]*8+4,c2=pk[1][0]*8+4;if(Math.abs(c1-c2)<10||pk[0][1]+pk[1][1]<tot*.55)return false;
  const isBg=i=>{if(p[i*4+3]<20)return true;if(!neu(i))return false;const l=lum(i);return Math.abs(l-c1)<20||Math.abs(l-c2)<20||(l>Math.min(c1,c2)-6&&l<Math.max(c1,c2)+6)};
  const seen=new Uint8Array(w*h),st=[];for(let x=0;x<w;x++){st.push(x,(h-1)*w+x)}for(let y=0;y<h;y++){st.push(y*w,y*w+w-1)}
  while(st.length){const i=st.pop();if(seen[i])continue;seen[i]=1;if(!isBg(i))continue;p[i*4+3]=0;const x=i%w,y=(i/w)|0;if(x>0)st.push(i-1);if(x<w-1)st.push(i+1);if(y>0)st.push(i-w);if(y<h-1)st.push(i+w)}
  /* huecos cerrados grandes con el mismo cuadriculado */
  const seen2=new Uint8Array(w*h),minArea=Math.max(200,w*h*0.0015);
  for(let s=0;s<w*h;s++){if(seen2[s]||p[s*4+3]<20||!isBg(s))continue;const comp=[],q=[s];seen2[s]=1;let lo=0,hi=0;
    while(q.length){const i=q.pop();comp.push(i);const l=lum(i);if(Math.abs(l-Math.min(c1,c2))<12)lo++;else if(Math.abs(l-Math.max(c1,c2))<12)hi++;const x=i%w,y=(i/w)|0;const nb=[x>0?i-1:-1,x<w-1?i+1:-1,y>0?i-w:-1,y<h-1?i+w:-1];for(const j of nb){if(j>=0&&!seen2[j]&&p[j*4+3]>=20&&isBg(j)){seen2[j]=1;q.push(j)}}}
    if(comp.length>=minArea&&lo>comp.length*.2&&hi>comp.length*.2)for(const i of comp)p[i*4+3]=0}
  /* borde: suavizar restos grises pegados */
  for(let pass=0;pass<2;pass++){const kill=[];for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const i=y*w+x;if(p[i*4+3]<20||!isBg(i))continue;if(p[(i-1)*4+3]<20||p[(i+1)*4+3]<20||p[(i-w)*4+3]<20||p[(i+w)*4+3]<20)kill.push(i)}for(const i of kill)p[i*4+3]=0}
  ctx.putImageData(d,0,0);return true;
}
function removeWhite(ctx,w,h){
  try{removeChecker(ctx,w,h)}catch(e){}
  const d=ctx.getImageData(0,0,w,h),p=d.data,seen=new Uint8Array(w*h),st=[];
  const isW=i=>{const r=p[i*4],g=p[i*4+1],b=p[i*4+2],a=p[i*4+3];if(a<20)return true;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);return mn>228&&mx-mn<22};
  for(let x=0;x<w;x++){st.push(x,(h-1)*w+x)}for(let y=0;y<h;y++){st.push(y*w,y*w+w-1)}
  while(st.length){const i=st.pop();if(seen[i])continue;seen[i]=1;if(!isW(i))continue;p[i*4+3]=0;const x=i%w,y=(i/w)|0;if(x>0)st.push(i-1);if(x<w-1)st.push(i+1);if(y>0)st.push(i-w);if(y<h-1)st.push(i+w)}
  const seen2=new Uint8Array(w*h),minArea=Math.max(120,w*h*0.0003);
  const isPure=i=>{const r=p[i*4],g=p[i*4+1],b=p[i*4+2];return p[i*4+3]>20&&Math.min(r,g,b)>236&&Math.max(r,g,b)-Math.min(r,g,b)<14};
  for(let s=0;s<w*h;s++){if(seen2[s]||!isPure(s))continue;const comp=[],q=[s];seen2[s]=1;
    while(q.length){const i=q.pop();comp.push(i);const x=i%w,y=(i/w)|0;const nb=[x>0?i-1:-1,x<w-1?i+1:-1,y>0?i-w:-1,y<h-1?i+w:-1];for(const j of nb){if(j>=0&&!seen2[j]&&isPure(j)){seen2[j]=1;q.push(j)}}}
    if(comp.length>=minArea)for(const i of comp)p[i*4+3]=0}
  for(let pass=0;pass<2;pass++){const kill=[];for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const i=y*w+x;if(p[i*4+3]<20)continue;const mn=Math.min(p[i*4],p[i*4+1],p[i*4+2]);if(mn<190)continue;if(p[(i-1)*4+3]<20||p[(i+1)*4+3]<20||p[(i-w)*4+3]<20||p[(i+w)*4+3]<20)kill.push(i)}for(const i of kill)p[i*4+3]=0}
  ctx.putImageData(d,0,0);
}
async function uploadPose(pid,file){
  if(!file)return;
  try{
    const url=await new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.onerror=rej;fr.readAsDataURL(file)});
    const im=await loadImage(url);const s=Math.min(1,1000/Math.max(im.naturalWidth,im.naturalHeight));
    const w=Math.round(im.naturalWidth*s),h=Math.round(im.naturalHeight*s);
    const cv=document.createElement("canvas");cv.width=w;cv.height=h;const ctx=cv.getContext("2d");ctx.drawImage(im,0,0,w,h);
    const p=C.poses.find(x=>x.id===pid);if(p.fondo!==false)removeWhite(ctx,w,h);
    let data=cv.toDataURL("image/webp",.88);if(!data.startsWith("data:image/webp"))data=cv.toDataURL("image/png");
    snap();const key=await putImg(data);const old=p.img;p.img=key;p.w=w;p.h=h;dropImg(old);
    C.pose=p.id;await updateThumb();saveSoon();render();toast(old?L("Imagen cambiada. Revisá las zonas pintadas de esta pose."):L("Imagen cargada"));
  }catch(e){toast(L("No se pudo leer la imagen"))}
}
async function uploadInvoc(id,file){
  if(!file)return;
  try{const url=await new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.onerror=rej;fr.readAsDataURL(file)});
    const im=await loadImage(url);const s=Math.min(1,500/Math.max(im.naturalWidth,im.naturalHeight));const w=Math.round(im.naturalWidth*s),h=Math.round(im.naturalHeight*s);
    const cv=document.createElement("canvas");cv.width=w;cv.height=h;const ctx=cv.getContext("2d");ctx.drawImage(im,0,0,w,h);removeWhite(ctx,w,h);
    let data=cv.toDataURL("image/webp",.86);if(!data.startsWith("data:image/webp"))data=cv.toDataURL("image/png");
    snap();const key=await putImg(data);const v=C.invoc.find(x=>x.id===id);dropImg(v.img);v.img=key;saveSoon();render();toast(L("Imagen cargada"));
  }catch(e){toast(L("No se pudo leer la imagen"))}
}
async function uploadBg(target,file){
  if(!file)return;
  try{const url=await new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.onerror=rej;fr.readAsDataURL(file)});
    const im=await loadImage(url);const s=Math.min(1,1400/Math.max(im.naturalWidth,im.naturalHeight));const w=Math.round(im.naturalWidth*s),h=Math.round(im.naturalHeight*s);
    const cv=document.createElement("canvas");cv.width=w;cv.height=h;cv.getContext("2d").drawImage(im,0,0,w,h);
    let data=cv.toDataURL("image/webp",.82);if(!data.startsWith("data:image/webp"))data=cv.toDataURL("image/jpeg",.85);
    snap();const key=await putImg(data);
    if(target==="char"){dropImg(C.fondo);C.fondo=key}else{const p=C.poses.find(x=>x.id===target);if(p){dropImg(p.bg);p.bg=key}}
    saveSoon();render();toast(L("Fondo cargado"));
  }catch(e){toast(L("No se pudo leer la imagen"))}
}
async function updateThumb(){const e=APP.chars.find(x=>x.id===C.id);const p=C.poses.find(x=>getImg(x.img));if(e){e.th=p?p.img:null;await DB.set("index",APP)}}

/* ============ pintar zonas ============ */
function PZ(){if(ui.paint&&ui.paint.vis){const r=resolve(ui.paint.vis);return r?visOf(r.obj).zonas:[]}return C.efectos}
function PP(){if(ui.paint&&ui.paint.vis){const r=resolve(ui.paint.vis);return r?visOf(r.obj).evo:[]}return C.poses}
async function openPainter(){
  const e=PZ().find(x=>x.id===ui.paint.eid),p=PP().find(x=>x.id===ui.paint.pid);if(!e||!p)return;
  const src=getImg(p.img);const im=await loadImage(src);
  const s0=Math.min(1,900/Math.max(im.naturalWidth,im.naturalHeight));const W=Math.round(im.naturalWidth*s0),H=Math.round(im.naturalHeight*s0);
  const m=document.getElementById("modal");m.onclick=m.oninput=m.onchange=null;
  const others=PP().filter(x=>x.id!==p.id&&zoneHasPose(e,x.id)&&getImg(x.img));
  m.innerHTML=`<div class="paint"><div class="row sb"><div><strong>${esc(e.n)}</strong> · <span class="hint">${esc(p.n)}</span></div><div class="row"><button class="btn small" data-p="undo">↶ ${L("Deshacer")}</button><button class="btn" data-p="cancel">${L("Cancelar")}</button><button class="btn on" data-p="save">${L("Guardar")}</button></div></div>
    <div class="banner" hidden></div>
    <div class="pv" style="overflow:hidden;touch-action:none"><div class="box2" style="--ar:${W}/${H};transform-origin:0 0;touch-action:none"><img class="base" src="${src}" alt=""><div class="subs"></div><canvas class="fl" width="${W}" height="${H}" style="pointer-events:none;opacity:.9"></canvas><svg class="lasso" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><path d="" fill="rgba(217,168,69,.15)" stroke="#d9a845" stroke-width="${Math.max(2,W/250)}" stroke-dasharray="${W/80} ${W/120}"/></svg></div></div>
    <div class="row"><button class="btn small" data-p="zin" aria-label="${L("Acercar")}">＋</button><button class="btn small" data-p="zout" aria-label="${L("Alejar")}">－</button><button class="btn small" data-p="z1">1:1</button><button class="btn small" data-p="hand">✋ ${L("Mover vista")}</button><span class="hint">${L("Con dos dedos también agrandás y movés.")}</span></div>
    <div class="brushes"></div>
    <div class="row tools">
      <button class="btn small on" data-p="brush">${L("Pincel")}</button><button class="btn small" data-p="smart">${L("Pincel inteligente")}</button><button class="btn small" data-p="wand">${L("Varita")}</button><button class="btn small" data-p="erase">${L("Borrador")}</button><button class="btn small" data-p="lasso">◌ ${L("Lazo")}</button>
      <label class="lbl inline">${L("Tamaño")} <input type="range" min="2" max="90" value="18" data-p="size" style="width:90px"></label>
      <label class="lbl inline">${L("Tolerancia")} <input type="range" min="4" max="120" value="26" data-p="tol" style="width:90px"></label>
      <button class="btn small danger" data-p="clear">${L("Limpiar")}</button></div>
    ${others.length?`<div class="row"><span class="hint">${L("Traer de otra pose:")}</span>${others.map(o=>`<button class="btn small" data-p="from" data-v="${o.id}">${esc(o.n)}</button>`).join("")}</div>`:""}
    <div class="row xf" hidden><button class="btn small" data-p="flip">⇋ ${L("Espejar")}</button><button class="btn small on" data-p="fix">${L("Fijar")}</button><button class="btn small" data-p="xcancel">${L("Descartar")}</button><span class="hint">${L("Arrastrá para mover. Con dos dedos agrandás y girás.")}</span></div>
    <p class="hint">${L("Elegí un pincel de efecto y pintá: ves el efecto mientras pintás. Podés usar varios pinceles y colores en la misma zona. El lazo rodea una parte para moverla, agrandarla o girarla.")}</p></div>`;
  const box=m.querySelector(".box2"),pv=m.querySelector(".pv"),subsEl=m.querySelector(".subs"),fl=m.querySelector("canvas.fl"),fctx=fl.getContext("2d"),lpath=m.querySelector(".lasso path"),banner=m.querySelector(".banner"),baseImg=m.querySelector("img.base");
  const ref=document.createElement("canvas");ref.width=W;ref.height=H;const rctx=ref.getContext("2d",{willReadFrequently:true});rctx.drawImage(im,0,0,W,H);const PX=rctx.getImageData(0,0,W,H).data;
  /* pinceles (sub-capas de la zona) */
  const S=zoneSubs(e).map(sb=>({id:sb.id==="_"?uid():sb.id,estilo:sb.estilo||"brillo",c:sb.c||"#4fb3ff",c2:sb.c2||"",masks:Object.assign({},sb.masks||{})}));
  const mkLayer=sb=>{const w=document.createElement("div");w.className="sublayer";const cv=document.createElement("canvas");cv.width=W;cv.height=H;const pr=document.createElement("div");pr.className="mfill";w.append(pr,cv);subsEl.appendChild(w);sb.cv=cv;sb.ctx=cv.getContext("2d",{willReadFrequently:true});sb.pr=pr;sb.wrap=w;styleSub(sb)};
  const styleSub=sb=>{const f=styleFill(sb.estilo,sb.c,sb.c2);Object.assign(sb.pr.style,{background:f.bg,backgroundSize:f.size||"",animation:f.anim||"",filter:f.blur?`blur(${f.blur}px)`:""});sb.pr.style.setProperty("--o",".95");sb.wrap.style.filter=`drop-shadow(0 0 3px ${f.g}) drop-shadow(0 0 9px ${f.g})`};
  const rgb=c=>hx(c);
  for(const sb of S){mkLayer(sb);const k=sb.masks[p.id];const mi=k&&getImg(k);if(mi){const img=await loadImage(mi);sb.ctx.drawImage(img,0,0,W,H);sb.ctx.globalCompositeOperation="source-in";sb.ctx.fillStyle=sb.c;sb.ctx.fillRect(0,0,W,H);sb.ctx.globalCompositeOperation="source-over"}}
  if(!S.length){const sb={id:uid(),estilo:e.estilo||"brillo",c:e.c||"#4fb3ff",c2:e.c2||"",masks:{}};S.push(sb);mkLayer(sb)}
  let cur=0;const usedAnywhere=sb=>Object.keys(sb.masks).some(k=>k!==p.id)||hasInk(sb);
  const hasInk=sb=>{const d=sb.ctx.getImageData(0,0,W,H).data;for(let i=3;i<d.length;i+=32)if(d[i]>10)return true;return false};
  const prevT={};const updPrev=(sb,now)=>{const go=()=>{const u=sb.cv.toDataURL();sb.pr.style.webkitMaskImage=sb.pr.style.maskImage=`url(${u})`;prevT[sb.id]=Date.now()};if(now||!prevT[sb.id]||Date.now()-prevT[sb.id]>140)go();else{clearTimeout(sb.tm);sb.tm=setTimeout(go,150)}};
  S.forEach(sb=>updPrev(sb,true));
  const brushesEl=m.querySelector(".brushes");
  const renderBrushes=()=>{const sb=S[cur];brushesEl.innerHTML=`<div class="row" style="gap:6px">${S.map((x,i)=>{const f=styleFill(x.estilo,x.c,x.c2);return`<button class="brush ${i===cur?"on":""}" data-p="bsel" data-v="${i}"><i class="bsw" style="background:${f.bg};${f.size?`background-size:${f.size};`:""}box-shadow:0 0 8px ${f.g}"></i>${L((ESTILOS.find(s=>s[0]===x.estilo)||ESTILOS[0])[1])}</button>`}).join("")}<button class="brush" data-p="bnew">+ ${L("Pincel")}</button></div>
    <div class="row"><select data-p="bst" style="width:auto">${opts(ESTILOS.map(([k,n])=>[k,L(n)]),sb.estilo)}</select><label class="lbl inline">${L("Color")} <input type="color" data-p="bc" value="${sb.c}"></label><label class="lbl inline"><input type="checkbox" data-p="bfx" ${sb.c2?"checked":""}> ${L("Fusionar con")}</label>${sb.c2?`<input type="color" data-p="bc2" value="${sb.c2}">`:""}${SWATCH.slice(0,9).map(s=>`<button class="sw ${sb.c===s?"on":""}" style="--c:${s}" data-p="bsw" data-v="${s}" aria-label="${s}"></button>`).join("")}</div>`};
  const setBrush=(patch)=>{const sb=S[cur];const nx=Object.assign({estilo:sb.estilo,c:sb.c,c2:sb.c2},patch);
    if(usedAnywhere(sb)){let k=S.findIndex(x=>x.estilo===nx.estilo&&x.c===nx.c&&(x.c2||"")===(nx.c2||""));if(k<0){const n={id:uid(),...nx,masks:{}};S.push(n);mkLayer(n);updPrev(n,true);k=S.length-1}cur=k}
    else{Object.assign(sb,nx);styleSub(sb);sb.ctx.globalCompositeOperation="source-in";sb.ctx.fillStyle=sb.c;sb.ctx.fillRect(0,0,W,H);sb.ctx.globalCompositeOperation="source-over";updPrev(sb,true)}
    renderBrushes()};
  renderBrushes();
  /* zoom y vista */
  let Z=1,TX=0,TY=0;
  const applyZ=()=>{Z=clamp(Z,1,8);const bw=box.offsetWidth,bh=box.offsetHeight;TX=clamp(TX,bw-bw*Z,0);TY=clamp(TY,bh-bh*Z,0);box.style.transform=`translate(${TX}px,${TY}px) scale(${Z})`};
  const zoomAt=(nz,cx,cy)=>{const r=box.getBoundingClientRect(),u=(cx-r.left)/Z,v=(cy-r.top)/Z,bx=r.left-TX,by=r.top-TY;Z=clamp(nz,1,8);TX=cx-u*Z-bx;TY=cy-v*Z-by;applyZ()};
  const zoomCenter=f=>{const r=box.getBoundingClientRect();zoomAt(Z*f,r.left+r.width/2,r.top+r.height/2)};
  pv.addEventListener("wheel",ev=>{ev.preventDefault();if(FLT&&!ev.ctrlKey){if(ev.shiftKey)FLT.r+=ev.deltaY>0?3:-3;else FLT.s=clamp(FLT.s*(ev.deltaY<0?1.06:1/1.06),.1,6);drawFloat();return}zoomAt(Z*(ev.deltaY<0?1.15:1/1.15),ev.clientX,ev.clientY)},{passive:false});
  /* herramientas */
  let mode="brush",size=18,tol=26,drawing=false,lx=0,ly=0,seed=null,hist=[],FLT=null,lasso=null,fromPose=null;
  const push=(idxs)=>{hist.push((idxs||S.map((_,i)=>i)).map(i=>[i,S[i].ctx.getImageData(0,0,W,H)]));if(hist.length>12)hist.shift()};
  const pos=evt=>{const r=box.getBoundingClientRect();return[(evt.clientX-r.left)*W/r.width,(evt.clientY-r.top)*H/r.height,W/r.width]};
  const near=(i,c)=>{if(PX[i*4+3]<25)return false;const dr=PX[i*4]-c[0],dg=PX[i*4+1]-c[1],db=PX[i*4+2]-c[2];return dr*dr+dg*dg+db*db<=tol*tol*3};
  const colorAt=(x,y)=>{x=clamp(Math.round(x),0,W-1);y=clamp(Math.round(y),0,H-1);let r=0,g=0,b=0,n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=clamp(x+dx,0,W-1),yy=clamp(y+dy,0,H-1),i=(yy*W+xx)*4;r+=PX[i];g+=PX[i+1];b+=PX[i+2];n++}return[r/n,g/n,b/n]};
  const stroke=(ctx,x1,y1,x2,y2,w,col,erase)=>{ctx.globalCompositeOperation=erase?"destination-out":"source-over";ctx.strokeStyle=col;ctx.lineWidth=w;ctx.lineCap="round";ctx.lineJoin="round";ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.globalCompositeOperation="source-over"};
  const line=(x1,y1,x2,y2,sc)=>{if(mode==="erase"){S.forEach(sb=>{stroke(sb.ctx,x1,y1,x2,y2,size*sc,"#000",true);updPrev(sb)})}else{const sb=S[cur];stroke(sb.ctx,x1,y1,x2,y2,size*sc,sb.c,false);updPrev(sb)}};
  const smart=(x1,y1,x2,y2,sc)=>{const sb=S[cur],RGB=rgb(sb.c),ctx=sb.ctx,r=size*sc/2,x0=Math.max(0,Math.floor(Math.min(x1,x2)-r)),y0=Math.max(0,Math.floor(Math.min(y1,y2)-r)),xa=Math.min(W-1,Math.ceil(Math.max(x1,x2)+r)),ya=Math.min(H-1,Math.ceil(Math.max(y1,y2)+r));
    const bw=xa-x0+1,bh=ya-y0+1;if(bw<1||bh<1)return;const md=ctx.getImageData(x0,y0,bw,bh),d=md.data;const vx=x2-x1,vy=y2-y1,L2=vx*vx+vy*vy||1;
    for(let yy=0;yy<bh;yy++)for(let xx=0;xx<bw;xx++){const X=x0+xx,Y=y0+yy;let t=((X-x1)*vx+(Y-y1)*vy)/L2;t=t<0?0:t>1?1:t;const ddx=X-(x1+t*vx),ddy=Y-(y1+t*vy);if(ddx*ddx+ddy*ddy>r*r)continue;if(!near(Y*W+X,seed))continue;const k=(yy*bw+xx)*4;d[k]=RGB[0];d[k+1]=RGB[1];d[k+2]=RGB[2];d[k+3]=255}
    ctx.putImageData(md,x0,y0);updPrev(sb)};
  const wand=(x,y)=>{const sb=S[cur],RGB=rgb(sb.c);x=clamp(Math.round(x),0,W-1);y=clamp(Math.round(y),0,H-1);const c=colorAt(x,y);const md=sb.ctx.getImageData(0,0,W,H),d=md.data,seen=new Uint8Array(W*H),st=[y*W+x];let n=0;
    while(st.length){const i=st.pop();if(seen[i])continue;seen[i]=1;if(!near(i,c))continue;d[i*4]=RGB[0];d[i*4+1]=RGB[1];d[i*4+2]=RGB[2];d[i*4+3]=255;n++;const xx=i%W,yy=(i/W)|0;if(xx>0)st.push(i-1);if(xx<W-1)st.push(i+1);if(yy>0)st.push(i-W);if(yy<H-1)st.push(i+W)}
    sb.ctx.putImageData(md,0,0);updPrev(sb,true);if(n<15)toast(L("Casi nada seleccionado: subí la tolerancia"))};
  /* lazo y bloque flotante */
  const lassoPath=pts=>{const pth=new Path2D();pts.forEach((q,i)=>i?pth.lineTo(q[0],q[1]):pth.moveTo(q[0],q[1]));pth.closePath();return pth};
  const drawFloat=()=>{fctx.clearRect(0,0,W,H);if(!FLT)return;FLT.parts.forEach(pt=>{fctx.save();fctx.translate(FLT.cx+FLT.x,FLT.cy+FLT.y);fctx.rotate(FLT.r*Math.PI/180);fctx.scale(FLT.s*(FLT.f?-1:1),FLT.s);fctx.translate(-FLT.cx,-FLT.cy);fctx.drawImage(pt.cv,0,0);fctx.restore()})};
  const showXf=on=>{m.querySelector(".xf").hidden=!on};
  const setBanner=t=>{banner.hidden=!t;banner.textContent=t||""};
  const buildFloat=async(pts,srcPose)=>{
    const pth=pts?lassoPath(pts):null;const parts=[];let minx=W,miny=H,maxx=0,maxy=0;
    if(pts)pts.forEach(([x,y])=>{minx=Math.min(minx,x);miny=Math.min(miny,y);maxx=Math.max(maxx,x);maxy=Math.max(maxy,y)});else{minx=0;miny=0;maxx=W;maxy=H}
    if(srcPose){for(const sb of zoneSubs(e)){const k=sb.masks&&sb.masks[srcPose.id];const mi=k&&getImg(k);if(!mi)continue;const cv=document.createElement("canvas");cv.width=W;cv.height=H;const c2=cv.getContext("2d");if(pth){c2.save();c2.clip(pth)}c2.drawImage(await loadImage(mi),0,0,W,H);if(pth)c2.restore();const tgt=S.find(x=>x.id===sb.id);c2.globalCompositeOperation="source-in";c2.fillStyle=(tgt||sb).c;c2.fillRect(0,0,W,H);parts.push({id:sb.id,meta:{estilo:sb.estilo,c:sb.c,c2:sb.c2},cv})}}
    else{push();S.forEach(sb=>{const cv=document.createElement("canvas");cv.width=W;cv.height=H;const c2=cv.getContext("2d");c2.save();c2.clip(pth);c2.drawImage(sb.cv,0,0);c2.restore();parts.push({id:sb.id,cv});sb.ctx.save();sb.ctx.clip(pth);sb.ctx.clearRect(0,0,W,H);sb.ctx.restore();updPrev(sb,true)})}
    FLT={parts,cx:(minx+maxx)/2,cy:(miny+maxy)/2,x:0,y:0,s:1,r:0,f:false};lpath.setAttribute("d","");showXf(true);drawFloat();setBanner(L("Acomodá la parte: arrastrá con un dedo, agrandá y girá con dos. Después tocá Fijar."));
  };
  const fixFloat=()=>{if(!FLT)return;push();FLT.parts.forEach(pt=>{let sb=S.find(x=>x.id===pt.id);if(!sb){sb={id:pt.id,estilo:pt.meta.estilo||"brillo",c:pt.meta.c||"#4fb3ff",c2:pt.meta.c2||"",masks:{}};S.push(sb);mkLayer(sb)}
      const c=sb.ctx;c.save();c.translate(FLT.cx+FLT.x,FLT.cy+FLT.y);c.rotate(FLT.r*Math.PI/180);c.scale(FLT.s*(FLT.f?-1:1),FLT.s);c.translate(-FLT.cx,-FLT.cy);c.drawImage(pt.cv,0,0);c.restore();updPrev(sb,true)});
    FLT=null;drawFloat();showXf(false);setBanner("");renderBrushes()};
  const startFrom=async pid=>{const sp=PP().find(x=>x.id===pid);if(!sp)return;fromPose=sp;baseImg.src=getImg(sp.img);subsEl.style.visibility="hidden";
    const tmp=[];for(const sb of zoneSubs(e)){const k=sb.masks&&sb.masks[pid];const mi=k&&getImg(k);if(mi)tmp.push(await loadImage(mi))}fctx.clearRect(0,0,W,H);fctx.globalAlpha=.85;tmp.forEach(i=>fctx.drawImage(i,0,0,W,H));fctx.globalCompositeOperation="source-in";fctx.fillStyle="#d9a845";fctx.fillRect(0,0,W,H);fctx.globalCompositeOperation="source-over";fctx.globalAlpha=1;
    setTool("lasso");setBanner(L("Rodeá con el dedo lo que querés traer de «{0}». O tocá Todo.",sp.n));banner.insertAdjacentHTML("beforeend",` <button class="btn small on" data-p="fromAll">${L("Todo")}</button>`)};
  const endFrom=()=>{fromPose=null;baseImg.src=src;subsEl.style.visibility="";fctx.clearRect(0,0,W,H)};
  const setTool=k=>{mode=k;m.querySelectorAll('.tools [data-p="brush"],.tools [data-p="smart"],.tools [data-p="wand"],.tools [data-p="erase"],.tools [data-p="lasso"],[data-p="hand"]').forEach(x=>x.classList.toggle("on",x.dataset.p===k))};
  /* gestos */
  const PTR=new Map();let pinch=null,pan=null,fg=null;
  const two=()=>{const v=[...PTR.values()];return{d:Math.hypot(v[0].x-v[1].x,v[0].y-v[1].y)||1,a:Math.atan2(v[1].y-v[0].y,v[1].x-v[0].x),x:(v[0].x+v[1].x)/2,y:(v[0].y+v[1].y)/2}};
  const snapFG=()=>{const r=box.getBoundingClientRect();if(PTR.size>=2){const t=two();fg={two:true,...t,F:{...FLT},k:W/r.width}}else if(PTR.size===1){const v=[...PTR.values()][0];fg={two:false,x:v.x,y:v.y,F:{...FLT},k:W/r.width}}else fg=null};
  box.addEventListener("pointerdown",ev=>{ev.preventDefault();try{box.setPointerCapture(ev.pointerId)}catch(x){}PTR.set(ev.pointerId,{x:ev.clientX,y:ev.clientY});
    if(FLT){snapFG();return}
    if(PTR.size===2){if(drawing){const h=hist.pop();if(h)h.forEach(([i,d])=>{S[i].ctx.putImageData(d,0,0);updPrev(S[i],true)})}drawing=false;lasso=null;lpath.setAttribute("d","");const t=two(),r=box.getBoundingClientRect();pinch={d:t.d,z:Z,u:(t.x-r.left)/Z,v:(t.y-r.top)/Z,bx:r.left-TX,by:r.top-TY};return}
    if(PTR.size>2)return;
    if(mode==="hand"){pan={x:ev.clientX,y:ev.clientY,tx:TX,ty:TY};return}
    const[x,y,sc]=pos(ev);
    if(mode==="lasso"){lasso=[[x,y]];return}
    if(fromPose)return;
    if(mode==="wand"){push([cur]);wand(x,y);return}
    push(mode==="erase"?null:[cur]);drawing=true;lx=x;ly=y;
    if(mode==="smart"){seed=colorAt(x,y);smart(x,y,x,y,sc)}else line(x,y,x+.01,y,sc)});
  box.addEventListener("pointermove",ev=>{if(PTR.has(ev.pointerId))PTR.set(ev.pointerId,{x:ev.clientX,y:ev.clientY});else return;
    if(FLT&&fg){if(fg.two&&PTR.size>=2){const t=two();FLT.s=clamp(fg.F.s*t.d/fg.d,.1,6);FLT.r=fg.F.r+(t.a-fg.a)*180/Math.PI;FLT.x=fg.F.x+(t.x-fg.x)*fg.k;FLT.y=fg.F.y+(t.y-fg.y)*fg.k}else if(!fg.two){FLT.x=fg.F.x+(ev.clientX-fg.x)*fg.k;FLT.y=fg.F.y+(ev.clientY-fg.y)*fg.k}drawFloat();return}
    if(pinch&&PTR.size>=2){const t=two();Z=clamp(pinch.z*t.d/pinch.d,1,8);TX=t.x-pinch.u*Z-pinch.bx;TY=t.y-pinch.v*Z-pinch.by;applyZ();return}
    if(pan){TX=pan.tx+(ev.clientX-pan.x);TY=pan.ty+(ev.clientY-pan.y);applyZ();return}
    const[x,y,sc]=pos(ev);
    if(lasso){lasso.push([x,y]);lpath.setAttribute("d","M"+lasso.map(q=>q[0].toFixed(1)+" "+q[1].toFixed(1)).join(" L")+" Z");return}
    if(!drawing)return;if(mode==="smart")smart(lx,ly,x,y,sc);else line(lx,ly,x,y,sc);lx=x;ly=y});
  const up=ev=>{PTR.delete(ev.pointerId);if(FLT){snapFG();return}if(PTR.size<2)pinch=null;
    if(!PTR.size){if(drawing)S.forEach(sb=>updPrev(sb,true));drawing=false;pan=null;
      if(lasso){const pts=lasso;lasso=null;if(pts.length>6){if(fromPose){const fp=fromPose;endFrom();buildFloat(pts,fp)}else buildFloat(pts,null)}else lpath.setAttribute("d","")}}};
  ["pointerup","pointercancel"].forEach(n=>box.addEventListener(n,up));
  /* botones */
  m.onclick=async ev=>{const b=ev.target.closest("[data-p]");if(!b||b.tagName==="INPUT"||b.tagName==="SELECT")return;const k=b.dataset.p;
    if(["brush","smart","wand","erase","hand","lasso"].includes(k)){if(FLT)return;setTool(k);if(k==="lasso"&&!fromPose)setBanner(L("Rodeá con el dedo la parte que querés mover, agrandar o girar."));else if(!fromPose)setBanner("")}
    if(k==="zin")zoomCenter(1.5);if(k==="zout")zoomCenter(1/1.5);if(k==="z1"){Z=1;TX=0;TY=0;applyZ()}
    if(k==="clear"){push();S.forEach(sb=>{sb.ctx.clearRect(0,0,W,H);updPrev(sb,true)})}
    if(k==="undo"){const h=hist.pop();if(h)h.forEach(([i,d])=>{if(S[i]){S[i].ctx.putImageData(d,0,0);updPrev(S[i],true)}})}
    if(k==="bsel"){cur=num(b.dataset.v);renderBrushes();if(["erase","lasso","hand"].includes(mode))setTool("brush")}
    if(k==="bnew"){const sb={id:uid(),estilo:"electricidad",c:"#7ff6ff",c2:"",masks:{}};S.push(sb);mkLayer(sb);updPrev(sb,true);cur=S.length-1;renderBrushes();setTool("brush")}
    if(k==="bsw")setBrush({c:b.dataset.v});
    if(k==="from")startFrom(b.dataset.v);
    if(k==="fromAll"&&fromPose){const fp=fromPose;endFrom();lpath.setAttribute("d","");buildFloat(null,fp)}
    if(k==="flip"&&FLT){FLT.f=!FLT.f;drawFloat()}
    if(k==="fix")fixFloat();
    if(k==="xcancel"&&FLT){const wasCut=!FLT.parts[0]||!FLT.parts[0].meta;FLT=null;drawFloat();showXf(false);setBanner("");if(wasCut){const h=hist.pop();if(h)h.forEach(([i,d])=>{S[i].ctx.putImageData(d,0,0);updPrev(S[i],true)})}}
    if(k==="cancel"){m.innerHTML="";m.onclick=m.oninput=m.onchange=null;const vr=ui.paint&&ui.paint.vis;ui.paint=null;if(vr)openVis(vr)}
    if(k==="save"){if(FLT)fixFloat();snap();const prevKeys=[];
      for(const sb of S){const old=sb.masks[p.id];if(hasInk(sb)){const out=document.createElement("canvas");out.width=W;out.height=H;const o=out.getContext("2d");o.drawImage(sb.cv,0,0);o.globalCompositeOperation="source-in";o.fillStyle="#fff";o.fillRect(0,0,W,H);sb.masks[p.id]=await putImg(out.toDataURL("image/png"))}else delete sb.masks[p.id];if(old&&old!==sb.masks[p.id])prevKeys.push(old)}
      e.sub=S.filter(sb=>Object.keys(sb.masks).length).map(sb=>({id:sb.id,estilo:sb.estilo,c:sb.c,c2:sb.c2,masks:sb.masks}));
      if(e.masks){e.masks={}}if(e.sub[0]){e.c=e.sub[0].c;e.estilo=e.sub[0].estilo}
      const live=new Set();e.sub.forEach(sb=>Object.values(sb.masks).forEach(k=>live.add(k)));prevKeys.filter(k=>!live.has(k)).forEach(dropImg);
      const any=e.sub.some(sb=>sb.masks[p.id]);m.innerHTML="";m.onclick=m.oninput=m.onchange=null;const vr=ui.paint&&ui.paint.vis;ui.paint=null;if(vr){const vo=resolve(vr);if(vo)visOf(vo.obj).cur=p.id}else C.pose=p.id;if(!e.med&&any)e.on=true;saveSoon();render();if(vr)openVis(vr);toast(any?L("Zona guardada"):L("Zona borrada"))}
  };
  m.oninput=ev=>{const k=ev.target.dataset.p;if(k==="size")size=num(ev.target.value);if(k==="tol")tol=num(ev.target.value)};
  m.onchange=ev=>{const t=ev.target,k=t.dataset.p;if(k==="bst")setBrush({estilo:t.value});if(k==="bc")setBrush({c:t.value});if(k==="bc2")setBrush({c2:t.value});if(k==="bfx")setBrush({c2:t.checked?"#ffffff":""})};
}

async function poseBlob(k){const im=await loadImage(poseURI(k));const cv=document.createElement("canvas");cv.width=800;cv.height=1200;cv.getContext("2d").drawImage(im,0,0,800,1200);return await new Promise(r=>cv.toBlob(r,"image/png"))}
async function downloadPoses(keys){
  keys=keys.filter(k=>PTPL[k]);if(!keys.length)return;
  const files=[];for(const k of keys)files.push(new File([await poseBlob(k)],`pose-${k}.png`,{type:"image/png"}));
  try{if(navigator.canShare&&navigator.canShare({files})&&/iphone|ipad|android/i.test(navigator.userAgent)){await navigator.share({files,title:"Telita de Mistra"});return}}catch(e){if(e&&e.name==="AbortError")return}
  for(const f of files){const a=document.createElement("a");a.href=URL.createObjectURL(f);a.download=f.name;document.body.appendChild(a);a.click();await new Promise(r=>setTimeout(r,350));URL.revokeObjectURL(a.href);a.remove()}
  toast(files.length>1?L("{0} plantillas descargadas",files.length):L("Plantilla descargada"));
}
/* ============ copia de seguridad ============ */
async function collectImgs(c){const o={};for(const k of imgKeys(c)){const v=IMG.get(k)||await DB.get(k);if(v)o[k]=v}return o}
async function download(name,obj){
  const blob=new Blob([JSON.stringify(obj)],{type:"application/json"});
  try{const f=new File([blob],name,{type:"application/json"});if(navigator.canShare&&navigator.canShare({files:[f]})&&/iphone|ipad|android/i.test(navigator.userAgent)){await navigator.share({files:[f],title:name});return}}catch(e){if(e&&e.name==="AbortError")return}
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);toast(L("Copia descargada"));
}
async function exportChar(id){const c=(C&&C.id===id)?C:await DB.get("c_"+id);if(!c)return;await download(`Telita - ${c.nombre}.json`,{app:"telita",tipo:"personaje",v:2,char:c,imgs:await collectImgs(c)})}
async function exportAll(){const chars=[],imgs={};for(const ch of APP.chars){const c=(C&&C.id===ch.id)?C:await DB.get("c_"+ch.id);if(c){chars.push(c);Object.assign(imgs,await collectImgs(c))}}await loadMaps();await loadMaster();for(const k of [...noteImgKeys(),...mapImgKeys(),...masterImgKeys()]){const v=IMG.get(k)||await DB.get(k);if(v)imgs[k]=v}await download("Telita de Mistra - copia completa.json",{app:"telita",tipo:"todo",v:2,chars,notes:NOTES,mapas:MAPS,master:MS,lib:LIB||await DB.get("lib")||[],imgs})}
async function importFile(file){
  if(!file)return;
  try{
    const o=JSON.parse(await file.text());if(o.app!=="telita")throw 0;
    for(const[k,v]of Object.entries(o.imgs||{})){IMG.set(k,v);await DB.set(k,v)}
    const add=async c=>{repair(c);if(APP.chars.some(x=>x.id===c.id))c.id=uid();await DB.set("c_"+c.id,c);const p=c.poses.find(x=>x.img);APP.chars.push({id:c.id,n:c.nombre,th:p?p.img:null});return c};
    let last=null,n=0,nl=0;
    if(o.tipo==="personaje"&&o.char){last=await add(o.char);n=1}
    if(o.tipo==="todo"){for(const c of o.chars||[]){last=await add(c);n++}if(Array.isArray(o.notes)&&o.notes.length){NOTES.push(...o.notes);await saveNotes()}if(o.master&&typeof o.master==="object"){await loadMaster();(o.master.enem||[]).forEach(x=>{if(!MS.enem.some(y=>y.id===x.id))MS.enem.push(x)});(o.master.notas||[]).forEach(x=>{if(!MS.notas.some(y=>y.id===x.id))MS.notas.push(x)});await DB.set("master",MS)}if(Array.isArray(o.mapas)&&o.mapas.length){await loadMaps();o.mapas.forEach(x=>{if(!MAPS.some(y=>y.id===x.id))MAPS.push(x)});await saveMaps()}if(Array.isArray(o.lib)&&o.lib.length){LIB=(LIB||(await DB.get("lib"))||[]);o.lib.forEach(x=>{const i=LIB.findIndex(y=>y.id===x.id);if(i<0){LIB.push(x);nl++}else LIB[i]=x});await DB.set("lib",LIB)}}
    await DB.set("index",APP);if(last){await openChar(last.id);ui.screen="char"}ui.menu=false;render();toast(n||!o.lib||!o.lib.length?L("{0} personaje(s) importado(s)",n):L("{0} entradas agregadas a tu compendio",nl||o.lib.length));
  }catch(e){toast(L("Ese archivo no es una copia de Telita de Mistra"))}
}

/* ============ inicio ============ */
async function openChar(id){
  const c=id&&await DB.get("c_"+id);
  if(!c){C=null;ui.screen="chars";return}
  C=repair(c);APP.cur=C.id;undo=[];ui.lastPose=null;await loadImgs(C);await DB.set("index",APP);
}
document.addEventListener("click",onClick);
document.addEventListener("change",onChange);
document.addEventListener("input",onInput);
document.addEventListener("toggle",e=>{const d=e.target;if(d&&d.dataset&&d.dataset.det){ui.det=ui.det||{};ui.det[d.dataset.det]=d.open}},true);
document.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.matches&&e.target.matches("[data-invin]")){e.preventDefault();const c=e.target.closest(".card");const bt=c&&c.querySelector('[data-a="invHp"][data-v="-1"]');if(bt)bt.click();return}if(e.key==="Enter"&&e.target.matches&&e.target.matches("[data-barin]")){e.preventDefault();const c=e.target.closest(".card");const bt=c&&c.querySelector('[data-a="barAdd"]');if(bt)bt.click();return}if(e.key==="Enter"&&e.target.id==="hp-in"){e.preventDefault();const b=document.querySelector('[data-a="dmg"]');if(b)b.click()}if(e.key==="Enter"&&e.target.id==="nc-name"){e.preventDefault();ui.newName=e.target.value;const b=document.querySelector('[data-a="newChar"]');if(b)b.click()}});
try{matchMedia("(min-width:900px)").addEventListener("change",()=>{if(C)render()})}catch(e){}
setInterval(()=>{if(C&&C.magicos.some(m=>m.rec==="horas"&&m.t)&&!document.querySelector("input:focus,textarea:focus"))render()},60000);
window.TL=(s)=>L(s);
window.addEventListener("error",e=>{try{toast(L("Error")+": "+(e.message||"?"))}catch(x){}});
window.addEventListener("unhandledrejection",e=>{try{toast(L("Error")+": "+((e.reason&&e.reason.message)||e.reason||"?"))}catch(x){}});
(async function init(){
  await DB.open();
  try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
  let idx=await DB.get("index");NOTES=(await DB.get("notes"))||defaultNotes();
  if(!idx){
    let old=null;try{old=JSON.parse(localStorage.getItem("ficha-dorian-v2")||"null")}catch(e){}
    const nl=(navigator.language||"es").slice(0,2);
    idx={chars:[],cur:null,lang:["en","pt"].includes(nl)?nl:"es"};
    if(old){const d=makeDorian();migrateOld(d,old);await DB.set("c_"+d.id,d);idx.chars.push({id:d.id,n:d.nombre,th:"dor_base"});idx.cur=d.id}
    else ui.screen="chars";
    await saveNotes();await DB.set("index",idx);
  }
  APP=idx;
  for(const k of noteImgKeys()){if(!IMG.has(k)){const v=await DB.get(k);if(v)IMG.set(k,v)}}
  for(const ch of APP.chars){if(ch.th&&!IMG.has(ch.th)){let v=await DB.get(ch.th);if(!v&&ch.th.startsWith("dor_")){const d=await loadDor();v=d[ch.th];if(v)await DB.set(ch.th,v)}if(v)IMG.set(ch.th,v)}}LANG=APP.lang||"es";ui.promptAct=L("durmiendo");
  await openChar(APP.cur||(APP.chars[0]&&APP.chars[0].id));
  render();
})();
