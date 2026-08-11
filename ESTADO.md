# Estado — landing.html

Última actualización: **11-ago-2026**. ⚠️ Los cambios del 11-ago están **sin commitear**.

## 11-ago — las cifras pasan a tener dueño

La tarjeta `// Los números` listaba cuatro cifras sin fuente (`7M descargas del
podcast`, `2,8M+ impresiones en 4 meses`, `50+ entrevistas a fundadores`, `66K
suscriptores en YouTube`). Walter la leyó y preguntó *"¿qué números?"*: bajo su
foto, "el podcast" se lee como **su** podcast, y nada de eso se puede verificar.
Frente a una audiencia cuyos 5 comentarios más likeados son de desconfianza, una
cifra sin dueño **resta** autoridad. Misma lógica que bajar el `10×` a `5×`.

Se agruparon **por fuente**, con la atribución escrita una vez por grupo:

| grupo | cifras |
|---|---|
| Startupeable — dirigí el marketing | 7M descargas · 66K suscriptores · **130+ entrevistas producidas** |
| Stacksync — San Francisco | 2,8M+ impresiones en LinkedIn · 4 meses |
| Moi — esta cuenta | **660K+ vistas en TikTok** |

Dos correcciones de fondo, no de forma:
- **`50+ entrevistas a fundadores` era falso por partida doble.** Son **130+**, y
  **producidas**, no hechas por él. Tal como estaba, se leía como que las condujo.
- **Faltaba la única cifra propia.** Las cuatro viejas eran de terceros. Los 660K+
  salen de sumar los 58 videos del corpus (`second-brain/03-areas/moiwalter/corpus`,
  664.751 al 9-ago). Sólo sube: por eso va con `+` y redondeado abajo.

Detalles que cuestan repetir:
- **`space-between`, no `flex-start`.** El comentario del CSS (línea ~515) advierte
  de un hueco de 400px que ya ocurrió: la tarjeta vecina creció y el sobrante quedó
  muerto al fondo. El sobrante se reparte **entre grupos** (`.cifg`) — si se
  repartiera entre filas, el rótulo de fuente flotaría tan lejos de sus cifras como
  de las ajenas y la atribución dejaría de leerse.
- **Las cifras bajaron de 38px a 33px.** Con 5 cifras + 3 rótulos, a 38px el
  contenido pedía 493px contra los 488px de la tarjeta vecina: se pasaba y, peor,
  no dejaba sobrante que repartir (grupos a 18px contra 14px dentro del grupo — no
  se leían como grupos). A 33px la separación es 37px contra 11px.
- ⚠️ **`scrollHeight − clientHeight` da un falso positivo de ~4px acá.** `<b>` usa
  `line-height:1`, más apretado que la caja natural de la fuente, así que la tinta
  del descendente de la última cifra sobresale y Chromium la cuenta. Ya pasaba antes
  (`space-evenly` lo escondía dejando 36px al fondo). Medir **recorte real** y que
  la última fila siga dentro de la tarjeta, no el rebalse.
- El diccionario `EN` traduce **por texto**: cada string nuevo necesitó su entrada.
  `Stacksync — San Francisco` no lleva (dos nombres propios) y queda igual a propósito.

Auditado con Playwright a 1920/1440/1280/1024/768/390: nada se recorta, ninguna
etiqueta se sale, cero errores JS, sin desborde horizontal, y el switch EN traduce
las cinco cifras. El script vive en el scratchpad de la sesión, no en el repo.

**Queda abierto**: `Stacksync — San Francisco` dice *dónde*, mientras Startupeable
dice *qué hizo*. Si se confirma que sigue vigente, `escribo para 8 perfiles de sus
fundadores` es más fuerte y deja los tres rótulos en paralelo.

## Estado al 9-ago (previo)

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

## Qué está en vivo

✅ **La landing ES la raíz desde el 9-ago-2026.** El ruteo quedó así:

| URL | Qué es |
|---|---|
| `/` (`index.html`) | **La landing** — la bio link. Antes era el hub. |
| `/pvp.html` | El método, 12 partes. **Generado** desde `content/` (ver `content/README.md`). |
| `/lista.html` | La Lista. **El QR impreso en los videos apunta acá — no se toca.** |
| `/hub.html` | El hub anterior. Sigue vivo **porque la votación de guías sólo existe ahí**. |
| `/landing.html` | Redirect a la raíz + `noindex`. Existe porque esa URL estuvo publicada. |

Cómo se resolvieron los riesgos que estaban anotados acá:
- **Las bios** (TikTok/LinkedIn/Instagram) apuntan a la raíz, así que no hubo que
  cambiar ningún enlace: cambió el contenido de la raíz, no su dirección.
- **`lista.html` no se tocó** en ninguno de los commits.
- **El inventario se hizo uno por uno**: la landing cubre *todos* los destinos que
  enlazaba el hub. Lo único exclusivo del hub es **la votación de 7 guías**, que
  está viva y recibiendo votos — por eso el hub se conserva y el pie de la raíz lo
  enlaza como *"Qué publico después"*. Sin ese enlace la votación se apagaba en
  silencio.
- El hub dejó de declarar la raíz como su `canonical`/`og:url`; ahora declara
  `hub.html`. Si no, competía consigo mismo en buscadores y previews.

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

1. ✅ **El `10×` bajó a `5×`** (9-ago). Su documento de estrategia dice 5–10x y estaba
   puesto el techo; frente a una audiencia cuyos 5 comentarios más likeados son
   desconfianza, el piso defiende mejor. Es `data-odo` en el odómetro.
2. ✅ **Switch a inglés hecho** (9-ago), toda la página, botón `EN`/`ES` en la cabecera.
   - **Diccionario por TEXTO**, no `data-en` por etiqueta: los titulares están partidos
     en `<span>` de revelado y las preguntas del FAQ están **triplicadas** en el DOM
     (el desfile de good-fella). Con diccionario las tres se traducen solas y el markup
     no se toca. Para editar el inglés: el objeto `EN` al final de `index.html`.
   - **Arranca SIEMPRE en español.** Nada de `navigator.language`: la audiencia es
     boliviana y mucha gente usa el teléfono en inglés — auto-traducir les serviría un
     idioma que no pidieron. La elección se recuerda en `localStorage`.
   - ⚠️ Es traducción de **cliente**: los buscadores siguen indexando el español. Para
     SEO real en inglés haría falta `/en/` como página propia. Decisión aparte.
   - El deck (`pvp.html`) sigue en español; el CTA lo dice: *"12 parts · nothing gated ·
     in Spanish"*.
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
