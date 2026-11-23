/* ============ tutoriales completos (jugador y máster) ============ */
const tg=(tab,edit)=>()=>{APP.modo="jugador";if(C){ui.screen="char";ui.tab=tab;ui.edit=!!edit}};
const tm=(tab,extra)=>()=>{APP.modo="master";C=C&&C.enemigo?null:C;ui.screen="chars";ui.mtab=tab;ui.menem=null;ui.bsel=null;if(extra)extra()};
const TCH={
 jugador:[
  ["basico","Primeros pasos","Menú, vida, pestañas, editar y deshacer.",[
    [null,"Bienvenido a Telita de Mistra","Vamos a recorrer lo básico. En cada paso te marco el botón del que hablo.",tg("personaje")],
    ['[data-a="menu"]',"Menú","Acá cambiás de personaje y abrís el compendio, sonidos, apariencia, mapas, calendario y los tutoriales.",tg("personaje")],
    ['.stage',"Tu personaje","La imagen cambia de pose en combate, y se le prenden brillos y capas con los poderes.",tg("personaje")],
    ['.hpctl',"Vida","Escribí el daño y tocá Daño o Curar. La sobrevida se gasta primero.",tg("personaje")],
    ['nav.tabs',"Pestañas","Poderes, Armas, Cuerpo, Hoja y Notas. Podés crear pestañas propias.",tg("personaje")],
    ['[data-a="edit"]',"Editar","Con Editar cambiás, agregás o borrás cualquier cosa. Tocá Listo para volver.",tg("personaje")],
    ['[data-a="undo"]',"Deshacer","Vuelve atrás el último cambio.",tg("personaje")],
    ['.foldhead',"Plegar secciones","Tocá el título de una sección o grupo para plegarlo. Cada personaje recuerda cómo lo dejaste.",tg("poderes")]]],
  ["imagen","Imagen, poses, brillos y capas","Subir imágenes, pintar zonas que brillan y superponer capas.",[
    ['.poses',"Poses","Una imagen por pose (normal, ataque, defensa, cantando…). Las de combate aparecen solas al pelear. El fondo blanco o cuadriculado se borra solo.",tg("cuerpo")],
    [null,"Zonas que brillan","En Cuerpo → Zonas que brillan creás una zona y la pintás con pinceles de efecto: rayos, fuego, hielo, sombra, sangre… Podés usar varios colores, el pincel inteligente, la varita, el lazo para mover partes y traer lo pintado desde otra pose.",tg("cuerpo")],
    [null,"Capas","Imágenes que se ponen encima o detrás del personaje (alas, armadura, aura). Se acomodan con dos dedos y se prenden con un toque.",tg("cuerpo")],
    ['.quicktog, .figcol .chips',"Prender y apagar","Debajo del personaje tenés botones rápidos para los brillos, las capas y los estados.",tg("personaje")],
    ['[data-a="mesaOn"]',"Mostrar a la mesa","Muestra tu personaje en pantalla completa para girar el celular hacia los demás.",tg("personaje")]]],
  ["poderes","Poderes, conjuros y grimorio","Recursos, grupos, niveles, preparar, favoritos y el libro.",[
    [null,"Recursos","Espacios de conjuro, ki, maniobras… Se gastan solos al usar un poder vinculado y se recargan al descansar.",tg("poderes")],
    [null,"Grupos y niveles","Cada grupo (Conjuros, Dotes, Magia malacálica…) se ordena por nivel y en orden alfabético. Lo marcado con ☆ sube arriba.",tg("poderes")],
    ['.fstar',"Favoritos","La estrella manda cualquier cosa a la barra de favoritos del combate.",tg("poderes")],
    [null,"Preparar conjuros","En Editar marcás un grupo como 'hay que prepararlos' y con 📖 Preparar elegís los del día.",tg("poderes")],
    ['[data-a="cmp"]',"Compendio","Buscá conjuros, dotes e ítems en castellano y agregalos a la ficha con un toque.",tg("poderes")],
    ['[data-a="grim"]',"Grimorio","Un libro con un conjuro por página. Cada página puede tener su dibujo y sus sonidos. Girá el celular para abrirlo.",tg("poderes")]]],
  ["armas","Armas, munición e ítems","Crítico personalizado, munición que se gasta y la vitrina.",[
    [null,"Armas","Bono, daño, crítico (doble, triple, máximo o personalizado: ×5, la mitad al máximo…) y a qué contador suma cada golpe.",tg("armas",true)],
    [null,"Munición y consumibles","Carcaj, cargadores, pociones, bombas… Vinculá un arma a su munición y se descuenta sola al tocar Disparé.",tg("armas")],
    [null,"Vitrina del arma","🎨 Imagen, evoluciones y capas: subí imágenes del arma, pintale zonas con rayos o fuego, poné un aura y elegí la evolución.",tg("armas",true)],
    [null,"Ítems mágicos","Con usos, recarga por turnos u horas, y también con vitrina propia.",tg("armas")]]],
  ["combate","Combate","Turnos, favoritos, contadores y salvaciones.",[
    ['[data-a="combat"]',"Entrar en combate","Cambia a la pose de combate y junta todo lo de pelea en una pantalla.",tg("personaje")],
    [null,"Turnos","Siguiente turno descuenta duraciones: tatuajes, capas, invocaciones, efectos retrasados y acciones preparadas.",tg("personaje")],
    [null,"Contadores y medidores","Marcas, cargas, corrupción, luz y sombra… con estilos visuales (calaveras, runas, orbe, termómetro).",tg("armas")],
    [null,"Salvaciones contra muerte","Con 0 de vida aparecen. Elegís cuántos éxitos y fallos y el estilo: velas, corazón sangrante, engranajes…",tg("hoja")]]],
  ["dados","Dados","Calculadora, modificadores y mesa de dados.",[
    ['.dicefab',"Calculadora de tiradas","Cargá el número de tu dado físico y la app suma bonos, ventaja, críticos y tus modificadores propios.",tg("personaje")],
    [null,"Mesa de dados","Dentro de la calculadora: tocá los dados del costado, caen en el cubilete, agitá (o sacudí el celular) y tiralos.",tg("personaje")]]],
  ["cuadros","Cuadros y pestañas propias","Armá tus propias mecánicas.",[
    [null,"Cuadros propios","En Editar, 'Agregar un cuadro propio' con modelos: fragmentos, sobrecarga, transformación, hechizo futuro, acción preparada, tabla d100…",tg("personaje",true)],
    [null,"Piezas","Cada cuadro combina contadores, activables por turnos, transformaciones, efectos retrasados secretos, tablas, tiradas y texto.",tg("personaje",true)],
    [null,"Dónde se muestran","Elegís si van en combate, debajo del personaje, en una pestaña o en una pestaña propia nueva (Hoja → Editar → Pestañas propias).",tg("hoja",true)]]],
  ["hoja","Hoja, notas y mundo","Hoja, reputación, secretos, notas, mapas y calendario.",[
    [null,"Hoja de personaje","Características, salvaciones, habilidades con competencia y experto, inspiración y textos.",tg("hoja")],
    [null,"Reputación y secretos","Facciones de −10 a +10 y una caja de secretos cifrada con PIN.",tg("hoja")],
    [null,"Notas","Carpetas dentro de carpetas, fotos y buscador. Estilo normal, libro, papiro o lista.",tg("notas")],
    [null,"Mapas y calendario","Desde el menú: mapas con anotaciones y un calendario de campaña con fases de la luna.",tg("personaje")]]],
  ["look","Apariencia y sonidos","Ambientaciones, estilos y audios propios.",[
    [null,"Ambientación","Medieval, ciencia ficción, steampunk, terror, feérico, piratas, moderno o pergamino. Cambia colores y letras.",tg("personaje")],
    [null,"Estilo de cada cosa","Menú → 🎨 Apariencia: vida, salvaciones, recursos, contadores y medidores con el estilo que quieras, y el modo terror.",tg("personaje")],
    [null,"Sonidos","Menú → 🎙 Sonidos: grabá o subí audios, recortalos y asignalos a armas, conjuros, páginas del grimorio o momentos como sacar 20.",tg("personaje")],
    [null,"Copias de seguridad","En Personajes → Exportar todo guardás un archivo con todo. Con Importar lo recuperás en otro celular.",tg("personaje")]]]],
 master:[
  ["mbasico","Modo máster","Cómo entrar y qué hay.",[
    ['.modesw',"Jugador o Máster","En la pantalla de Personajes elegís el modo. El máster tiene su propia mesa.",tm("ini")],
    ['.mquick',"Accesos rápidos","Mapas, calendario y la mesa de dados, a un toque.",tm("ini")],
    ['.mtabs',"Secciones","Iniciativa, Enemigos, Bestiario, Herramientas, Temporizador y Cuaderno.",tm("ini")]]],
  ["mini","Iniciativa y turnos","Orden, rondas, estados y concentración.",[
    [null,"Agregar","Sumá jugadores con un toque y enemigos de tus fichas o del bestiario. Podés repetir el mismo enemigo.",tm("ini")],
    [null,"Ordenar y tirar","Escribí la iniciativa de cada uno o tirá la de los enemigos: se ordena sola.",tm("ini")],
    [null,"Siguiente turno","Marca a quién le toca, cuenta rondas, saltea a los derrotados y descuenta estados con duración.",tm("ini")],
    [null,"Estados y concentración","Agregá Envenenado, Derribado… con duración en rondas, y marcá 🧠 concentración para acordarte de las salvaciones.",tm("ini")]]],
  ["menem","Enemigos","Fichas completas con fases y brillos.",[
    [null,"Fichas de enemigo","Cada enemigo es una ficha completa: poses, zonas que brillan, capas, poderes, armas y dados.",tm("enem")],
    [null,"Fases por vida","En cada pose poné 'Fase: aparece con vida en ___ o menos' y el enemigo cambia de forma solo al recibir daño.",tm("enem")],
    [null,"Mostrar a la mesa","📺 lo muestra en vivo con brillos, fase, vida aproximada y ambiente (nieve, tormenta, niebla…). Con ⚙ manejás todo mientras miran.",tm("enem")]]],
  ["mbest","Bestiario","330 monstruos en castellano.",[
    ['[data-bq]',"Buscar","Buscá por nombre en castellano o inglés, filtrá por tipo y VD.",tm("best")],
    [null,"Sumar al combate","Abrí un monstruo y sumalo con vida promedio o tirada. Se crea su ficha de enemigo automáticamente.",tm("best")],
    [null,"Personalizarlo","Crear ficha de enemigo te deja ponerle imagen, brillos y fases a cualquier monstruo.",tm("best")]]],
  ["mtools","Herramientas","Dificultad, generadores, estados y ambiente.",[
    [null,"Dificultad del encuentro","Calcula si el combate es bajo, moderado o alto para tu grupo según las reglas 2024.",tm("tools",()=>ui.mtool="dif")],
    [null,"Generadores","Nombres, PNJ completos, tabernas, botín y clima para improvisar. Lo que te guste va al cuaderno.",tm("tools",()=>ui.mtool="gen")],
    [null,"Estados","Referencia rápida de qué hace cada estado.",tm("tools",()=>ui.mtool="cond")],
    [null,"Ambiente sonoro","Lluvia, viento, fogata, tormenta y cueva generados por la app, y tu propia música.",tm("tools",()=>ui.mtool="amb")]]],
  ["mtimer","Temporizador, cuaderno y mapas","Presión, notas privadas y mapas.",[
    [null,"Temporizador de presión","Elegí segundos, mensaje y estilo (reloj de arena, bomba, latido, vela) y mostrales la pantalla.",tm("timer")],
    [null,"Cuaderno del máster","Notas privadas con buscador, separadas de las de los jugadores.",tm("notas")],
    [null,"Mapas","Subí mapas, poné anotaciones y mostralos con o sin ellas.",tm("ini")]]]]};
function openTutMenu(){const m=document.getElementById("modal");m.onclick=m.oninput=m.onchange=null;ui.tutMenu=ui.tutMenu||(isMaster()?"master":"jugador");renderTutMenu()}
function renderTutMenu(){const m=document.getElementById("modal"),K=ui.tutMenu,seen=APP.tutSeen||{};
  m.innerHTML=`<div class="dsheet" data-tutm><div class="dpanel"><div class="row sb"><h2 style="margin:0;font-family:var(--display)">📘 ${L("Tutoriales")}</h2><button class="btn small" data-tm="close">✕</button></div>
    <div class="modesw"><button class="${K==="jugador"?"on":""}" data-tm="tab" data-v="jugador">🧙 ${L("Jugador")}</button><button class="${K==="master"?"on":""}" data-tm="tab" data-v="master">👑 ${L("Máster")}</button></div>
    <p class="hint">${K==="jugador"?L("Elegí un capítulo. Si no tenés un personaje, se crea uno de ejemplo para practicar."):L("Todo lo que podés hacer como máster, capítulo por capítulo.")}</p>
    ${TCH[K].map(([id,t,d,st])=>`<button class="tchap" data-tm="run" data-v="${id}"><span class="tck">${seen[id]?"✓":"▶"}</span><span><b>${L(t)}</b><small>${L(d)} · ${L("{0} pasos",st.length)}</small></span></button>`).join("")}
    <button class="btn" data-tm="all" style="margin-top:8px">${L("Recorrer todos los capítulos")}</button></div></div>`}
async function tutRunChapters(ids){
  const K=ui.tutMenu;const chs=TCH[K].filter(c=>ids.includes(c[0]));if(!chs.length)return;
  if(K==="jugador"&&(!C||C.enemigo)){const pc=playerChars()[0];if(pc){await openChar(pc.id);ui.screen="char"}else{await createDemo(true)}}
  APP.tutSeen=APP.tutSeen||{};chs.forEach(c=>APP.tutSeen[c[0]]=1);APP.tutDone=true;DB.set("index",APP);
  ui.tutSteps=[].concat(...chs.map(c=>c[3].map((s,i)=>i===0?[s[0],`${L(c[1])} · ${L(s[1])}`,s[2],s[3]]:s)));document.getElementById("modal").innerHTML="";ui.tut=0;ui.tutWent=-1;tutShow()}
(function(){
  document.addEventListener("click",e=>{const b=e.target.closest("[data-tm]");if(!b)return;e.preventDefault();e.stopPropagation();const k=b.dataset.tm;
    if(k==="close"){document.getElementById("modal").innerHTML="";return}
    if(k==="tab"){ui.tutMenu=b.dataset.v;renderTutMenu();return}
    if(k==="run")tutRunChapters([b.dataset.v]);if(k==="all")tutRunChapters(TCH[ui.tutMenu].map(c=>c[0]))},true);
})();
