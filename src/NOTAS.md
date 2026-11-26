# Telita de Mistra — notas para seguir trabajando

App de fichas de personaje para D&D (campaña propia, muy personalizable). PWA en JavaScript sin dependencias, se publica con GitHub Pages en https://tonyserangeli-netizen.github.io/telita-de-mistra/

## Cómo se arma y publica
- El código vive en `src/` repartido en piezas: `app1.js` … `app22.js`, `style.css` y `shell.html`.
- `python3 src/build.py` junta todo en `index.html`, en la raíz del proyecto.
- Al publicar, subir el número de caché en `sw.js` (`telita-vNN`) y la versión `APPV` en `src/app1.js`.
- Textos traducidos: en `src/tr.txt`, una línea por texto con el formato `castellano|inglés|portugués`. En el código se usan con `L("texto")`.
- Los datos se guardan en el celular (IndexedDB "telita"). Exportar/Importar arma y lee un .json con todo.

## Qué hace cada pieza
| Pieza | Contenido |
|---|---|
| app1 | Base: datos, imágenes, plantillas `TPL`, `newChar`, `imgKeys` |
| app2 | Pantallas: personaje, lista de personajes, encabezado, menú, vida, combate, recursos, ítems |
| app3 | Pestañas (Poderes, Armas, Cuerpo, Hoja, Notas), asistente, `render()` |
| app4 | Acciones (`onClick`/`onChange`), editor de pinceles `openPainter` (sirve para personaje y para armas), quitar fondo blanco/cuadriculado, exportar/importar |
| app5 | Capas, fotos en notas, calculadora de dados con críticos (incluye el personalizado), compendio |
| app6 | Munición y consumibles; grimorio (sonido por página, editar/borrar páginas) |
| app7 | Ambientaciones (temas) |
| app8 | Sonidos: grabar, recortar y asignar |
| app9 | Apariencia por elemento (vida, salvaciones, recursos) |
| app10 | Vitrina de armas e ítems: evoluciones, capas, zonas pintadas, aura |
| app11 | Estilos de notas: libro, papiro, lista |
| app12 | Cuadros y pestañas propias (contador, activable, transformación, efecto retrasado, tabla, tirada, acción preparada) |
| app13 | Favoritos, preparar conjuros, calendario, reputación, modo terror, estilos de contadores y medidores, secretos con PIN, motor del tutorial |
| app14 | Mapas con anotaciones |
| app15 | Mesa de dados con cubilete |
| app16 | Personaje de ejemplo |
| app17 | Orden alfabético, conjuros por nivel, favoritos arriba |
| app18 | Modo máster: iniciativa, temporizador, cuaderno |
| app19 | Secciones plegables |
| app20 | Enemigos como fichas completas, fases por vida, "mostrar a la mesa" |
| app21 | Bestiario, dificultad de encuentros, generadores, estados, ambiente sonoro |
| app22 | Tutoriales por capítulos (jugador y máster) |
| app23 | Clima: climas editables (`APP.climas`), clima por mapa (`m.cli`), clima por rangos en el calendario (`APP.cal.cliR`, climas posibles por mes en `meses[i].cl`), y penalizadores/estados que se aplican solos a la ficha (`C.cliSrc`, marcados con `cli:1`) |

## Datos
- `compendio-srd-es.json` y `bestiario-es.json` salen del SRD en español (CC BY 4.0). Los scripts que los arman están en `src/datos/`.
- Las dotes del PDF que pasó Tony **no** van en la app pública (tienen derechos de autor): se las di como archivo aparte para importar.

## Pendientes
- Probar en un iPhone real.
- Celulares conectados (código de partida, avisos del máster, dados a distancia, nube): necesita un servicio en internet. Consultar antes cualquier cosa paga.
- Mapas más completos: niebla de guerra, pisos, marcas ocultas.
- Subir de nivel guiado, comparar personajes, modo mesa, huella para los secretos.
