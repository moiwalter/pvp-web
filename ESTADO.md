# Estado — landing.html

Última actualización: **9-ago-2026**, árbol limpio en `main`.

## Arreglado el 9-ago (tarde) — la página ya no tiene defectos conocidos

Auditoría con Playwright a 1920/1440/1280/1024/768/390. Cero errores de JS, cero
desborde horizontal, cero voseo. Tres cosas estaban rotas y se arreglaron:

1. **El titular del pie se cortaba en TODO ancho de escritorio.** `.dsp` usaba
   `--text-display` puro: la línea *"Ganarte la vida en otro mercado."* medía
   **1650px dentro de una columna de 1016px** a 1440, y `.foot{overflow:hidden}`
   la recortaba en silencio (se leía *"…en otro merc"*). La segunda línea también
   se salía. Medido: 250–290px de exceso entre 768 y 1440.
   **Arreglo**: el titular se parte en **tres** líneas (como el hero) y `.dsp` se
   mide contra su propia columna — `min(var(--text-display),10.5cqi)` sobre
   `.foot__col{container-type:inline-size}`. Así el tipo se queda grande en vez
   de encogerse. Verificado: las 3 líneas caben en los 6 anchos.
   De paso se borró `.foot__big`, que era CSS muerto (ningún nodo lo usaba).

2. **Dos capturas de plataforma eran la pantalla anti-bots de Cloudflare**, no el
   sitio: `weworkremotely.webp` (sale en la landing, una de las 4 tarjetas) y
   `workana.webp` (sale en La Lista). Se recapturaron con un navegador real
   —cargan sin desafío, no hubo que evadir nada— a los mismos 1120×700 webp.

3. **La votación se RETIRÓ de la landing** (decisión de Walter, 9-ago). Con ella
   se fueron su sección, su CSS (`.cells`/`.cell*`), su JS y la llave pública de
   Supabase que vivía en esta página. Sigue **viva en el hub** (`index.html`) con
   los mismos 7 ids. El CTA secundario del cierre apuntaba a `#votar` y ahora va
   a `lista.html`, así que no quedaron anclas muertas.
   Antes de sacarla quedó verificada de punta a punta **sin ensuciar los
   resultados**: los 7 `data-id` coincidían con el hub y con el `CHECK` de
   `votos.sql`, y un POST con una guía inválida devuelve `400 guia_conocida` —
   prueba endpoint + llave + RLS de INSERT vivos **sin insertar un voto**. Ese es
   el chequeo barato para repetir cuando se toquen los ids (aplica al hub).

También verificado: las 4 tarjetas del método están **sincronizadas** entre la
escena fijada (`.hw__paso`) y la caída apilada de móvil (`.stack__i`) — el drift
que `PLAN-METODO.md` advierte todavía no ocurrió.

⚠️ **No es un bug**: en el FAQ cada pregunta se ve **repetida en gris**. Es el
desfile ×3 de good-fella (`.mq`, línea ~594), reproducido a propósito; al pasar
el cursor desfila. No "arreglarlo".

▶ **Lo siguiente está planificado en `PLAN-METODO.md`**: pasar las 12 partes del método
PVP al formato de la landing. Ese archivo tiene el diagnóstico, la decisión de layout
abierta (A/B/C) y por dónde arrancar sin haberla tomado.

## Qué está en vivo y qué no

`landing.html` está **publicada pero NO es la página principal**:
`moiwalter.github.io/pvp-web/landing.html`

La raíz sigue siendo `index.html`, el hub anterior. **Ninguno de los commits tocó
`index.html`, `lista.html` ni `pvp.html`.**

⛔ **Antes de promoverla a la raíz**, tener presente que:
- Esa URL está en las bios de TikTok, LinkedIn e Instagram.
- **`lista.html` recibe el QR ya impreso en videos publicados** — esa URL no se toca.
- El hub actual tiene recursos que sólo viven ahí (la votación de guías, Mi Plata,
  Science Gym Coach, el anuncio). La landing los cubre casi todos, pero hay que
  revisar uno por uno antes de que el hub desaparezca.

## Qué es

Reproducción de la arquitectura de **good-fella.com** con contenido de Moi. El sistema
de origen está documentado en `DESIGN.md` (tokens reales de su CSS, mecanismos, mapeo).
El contenido vive separado en `content/` (`site.json` + las 12 partes del método).

**Orden de secciones y bandas** (la alternancia es deliberada, medida de su sitio):

| sección | banda |
|---|---|
| Hero | negro |
| Quién te habla y de qué | blanco |
| Se empieza por el trabajo | negro |
| Tener la lista no basta (método) | blanco |
| Dónde están los trabajos | negro |
| Las preguntas incómodas | blanco |
| No hay siguiente paso que cobrar | negro |
| Lo demás que construí | blanco |

**Mecanismos reproducidos**, todos medidos del DOM/CSS de producción, no a ojo:
- Revelado de titular con dos barras que barren (`.rv` + `i.b1`/`i.b2`)
- Escena fijada de 320vh con los 4 pasos visibles y marcador que se desplaza
- "Selected work": columna fija con miniaturas + 4 tarjetas 16:10 + enlace al resto
- Ruleta de letras al pasar el cursor (`"L," → "LET'I>`" → final`)
- Carga: compuerta que gira sobre pivote anclado abajo; el pivote salta 100vw para salir
- Lenis local (MIT) para el scroll con inercia
- Rejilla de 12, radio cero, ritmo 64/128, escala fluida 375→1600

## Decisiones pendientes de Walter

1. **El `10×`** de la sección del trabajo. Su documento de estrategia
   (`03-areas/moiwalter/workflow/estrategia-contenido.md`) dice **5–10x**; está puesto
   el techo. Frente a una audiencia cuyos 5 comentarios más likeados son desconfianza,
   el piso defiende mejor.
2. **Switch a inglés.** Pedido, no hecho: falta definir si va toda la página o sólo la
   presentación. No es un botón — son dos versiones de texto a mantener en sincronía.
3. **Pilares 03 y 06** ("IA sin bullshit", "Los que ya entraron") no enlazan a nada.
4. **Promover a la raíz** — ver arriba.
5. **El layout del método (A/B/C)** — la decisión está descrita en `PLAN-METODO.md`.
   No bloquea: las 12 glosas y las 12 cifras se escriben igual en los tres casos.

## Nunca construidos (de good-fella)

El menú overlay a pantalla completa · el atajo `⌘G` de grilla · los dos portales de
imagen del hero (dependen de fotos que no existen).

## Gotchas

- **Hay que abrirla por HTTP, no con doble clic.** Con `file://` el navegador contamina
  el canvas y el retrato ASCII se desactiva solo. Servidor local:
  `python3 -m http.server 8791` en esta carpeta.
- **Aktiv Grotesk no es transferible**: vive en el Typekit de ellos, atado a sus dominios.
  Va **Geist**. Para la real, crear kit propio en Adobe Fonts y cambiar `--font-sans`.
- **Verificar colores en banda OSCURA.** En la clara `--rose` y `--brand` son el mismo hex
  (`#fb460d`), así que un test ahí pasa sin probar nada. Ese error hizo que un arreglo de
  color pasara verde sin haber entrado.
- **Auditoría**: el script de Playwright con 21 verificaciones vive en el scratchpad de la
  sesión, no en el repo. Cubre revelados, escena fijada, odómetro, ruleta, temas, FAQ,
  votos y desborde móvil.
- Los assets huérfanos (`logos/tribunal.webp`, 5 capturas de plataformas) se conservan a
  propósito: regenerarlos exige volver a scrapear sitios vivos.
