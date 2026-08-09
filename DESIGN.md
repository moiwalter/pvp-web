# DESIGN.md — Good Fella como esqueleto para la landing de Moi

## Fuente

- URL: https://good-fella.com/
- Fecha de captura: 2026-08-08
- Evidencia: Firecrawl `branding` + `images` + `markdown` + `screenshot`
- Artefactos: `.firecrawl/goodfella-branding.json`, `.firecrawl/goodfella.md`, `.firecrawl/goodfella-shot.png`

⚠️ **La captura salió en plena transición de carga** (un barrido diagonal naranja a pantalla
completa), así que no sirve como referencia de layout. Sí confirma que el motion es pesado y
deliberado — ellos mismos lo dicen: *"Motion as medium. Every interaction is part of the brand,
not added on top."*

⚠️ **Nada de esto da derechos sobre su marca, su código, sus tipografías, sus imágenes ni su
copy.** Lo que se toma es el **sistema estructural** — orden de secciones, densidad, ritmo,
mecanismos de interacción. El contenido, la paleta final y los assets son de Moi.

---

## Resumen del sistema

Estudio de web premium. Se presenta como "the digital landmark studio". El sistema es
**brutalista-caliente**: casi negro tibio, un naranja saturado que hace de acento *y* de color de
texto, grotesca de peso alto en tamaños enormes, **radio cero en todo**, y monoespaciada para
datos y etiquetas. La página se comporta como un instrumento, no como un folleto: tiene atajos de
teclado, contadores que ruedan, y texto que se repite y desfila.

Densidad baja, escala tipográfica brutal (h1 96px contra body 16px = ratio 6:1). El aire hace el
trabajo que en otros sistemas hacen las cajas.

---

## Tokens

### Color

**Son TRES temas**, declarados como `[data-theme=dark|light|brand]`, y la tecla `C` los cicla.
Esto sale del CSS de producción (`gf-1.css`), no del scraper — el scraper reportó
`textPrimary: #FD551D` y **es falso**: el naranja es `--color-brand`, el texto es `#eee`.

| Variable | dark | light | brand |
|---|---|---|---|
| `--color-background` | `#141314` | `#eee` | **`#fb460d`** |
| `--color-foreground` | `#eee` | `#141314` | `#141314` |
| `--color-foreground-muted` | `#818081` | `#696869` | `#1a1a1a` |
| `--color-brand` | `#fd551d` | `#fb460d` | `#fd551d` |
| `--color-brand-muted` | `#fd8d68` | `#fd8d68` | `#fd8d68` |
| `--color-border` | `#eeeeee1a` | `#0003` | `#0000004d` |
| `--color-surface` | `#333` | `#d5d5d5` | `#fd8d68` |
| `--color-background-muted` | `#1a1a1a` | `#f7f7f7` | `#fd7142` |

El tema `brand` es el atrevido: **la página entera del color de marca**, con tinta negra.

### Tipografía

| Rol | Familia | Nota |
|---|---|---|
| Display + cuerpo | Aktiv Grotesk | Licenciada (Dalton Maag) — **hay que sustituirla** |
| Mono | Geist Mono | Libre (Vercel) |
| Mono alterna | Fira Code | Libre |

Escala observada: `h1 96px` · `h2 64px` · `body 16px`.

Sustitutas libres para Aktiv Grotesk, por cercanía: **Söhne** (licenciada también), **Inter Tight**,
**Instrument Sans**, **Geist Sans**. Ojo con Inter a secas: el corpus de sitios B2B lo tiene
marcado como la línea divisoria de la escuela genérica (patrón P6).

### Escala fluida (del CSS real)

`--spacing: .0625rem` = **1px**. Toda la escala se expresa multiplicando esa unidad, y la
interpolación corre entre viewport **375** y **1600** vía `--fluid-slope`.

| Rol | Mínimo | Máximo |
|---|---|---|
| `display` | 48px | **128px** |
| `h1` | 32px | 96px |
| `h2` | 36px | 64px |
| `h3` | 28px | 48px |
| `h4` | 28px | 32px |
| `subheadline` | 20px | 24px |
| `body` | 16px | 16px (fijo) |
| `accent` | 14px | 16px |

### Rejilla y geometría

```
--site-grid-columns: 12      --site-max-width: 1920px
--site-grid-gutter: 1rem     --site-header-height: 104px
--site-grid-margin: 1rem     --hero-padding-top: 256px
  (1.5rem en pantallas medias) --hero-padding-bottom: 164px
```

- **Radio: `0px` en todo.** Botones, inputs, tarjetas, imágenes. Sin excepción.
- Sombras: ninguna.

### Motion

Los `@keyframes` CSS son solo tres: `fadeIn`, `fadeOut`, `pulse`. **Todo el motion pesado es JS.**
La única librería en el bundle es **Lenis** (scroll con inercia) — ese es el motor real de que
leerlo se sienta distinto. Tienen declarado un catálogo entero de curvas
(`--ease-in-out-quart`, `--ease-out-back`, `--ease-in-quint`, etc.) que las animaciones consumen.

---

## Las 11 secciones, en orden

| # | Sección | Qué hace |
|---|---|---|
| 1 | Nav + píldora de estado | Menú overlay. Píldora: *"Accepting Projects. Join the waitlist. Only 3 spots left"* + *"Working Globally"* |
| 2 | Hero | H1 96px con salto de línea forzado + un párrafo + dos CTAs |
| 3 | Dos portales | Imágenes verticales grandes: "Featured Project" / "About the Studio" |
| 4 | **Odómetro de cifras** | Dígitos que ruedan (columnas 0-9): *"$XB+ Combined client market cap"*, *"XXM+ People reached"* |
| 5 | "How we work." | Cintillo `// Process` + pasos `01`–`04`, cada uno con título, un párrafo y una foto vertical |
| 6 | "Selected work." | Grid de proyectos. Cada uno: nombre + **taxonomía en corchetes** `[Marketing Site]—[Sports]` |
| 7 | "What's in a landmark." | Cintillo `// The build` + 6 principios, título corto + una línea |
| 8 | "Common questions" | Acordeón de 6 preguntas |
| 9 | "Start a project." | Cierre con foto, correo, y dos CTAs: *"Get in touch"* / *"Book a 15-min call"* |
| 10 | Suscripción | Un input, un botón, *"Unsubscribe anytime."* |
| 11 | Footer | Nav repetido, correos, legal, **atajos de teclado** (`⌘G` grid · `C` change color), © y firma |

## Mecanismos firmados

Esto es lo que hay que llevarse. No son adornos: son la razón de que leerlo se sienta distinto.

1. **Texto repetido ×3.** Títulos, ítems del nav y preguntas del FAQ aparecen triplicados en el
   DOM — es un desfile horizontal que corre al pasar el cursor. Aparece en toda la página.
2. **Odómetro de dígitos.** Las cifras no se escriben: ruedan columna por columna del 0 al 9.
3. **Cintillo `//`.** Las secciones se etiquetan con sintaxis de comentario de código:
   `// Process`, `// The build`.
4. **Taxonomía en corchetes.** `[Marketing Site]—[Sports]`. Clasifica sin usar chips de color.
5. **Atajos de teclado.** `⌘G` muestra la grilla, `C` cambia el color. Declara "esto es un
   instrumento" mejor que cualquier frase.
6. **Radio cero absoluto.** Ni una esquina redondeada en toda la página.
7. **Pasos numerados `01`–`04`** con foto vertical por paso.
8. **Transición de página como barrido diagonal.** Lo que capturó el screenshot.

---

# El mapeo — qué contenido de Moi va en cada sección

La estructura de Good Fella encaja con el material de Moi con una precisión incómoda: ya tiene
cifras que merecen rodar, un método numerado, una taxonomía de plataformas y un FAQ escrito.

| # | Sección Good Fella | Contenido de Moi | De dónde sale |
|---|---|---|---|
| 1 | Píldora de escasez | **La píldora anti-curso**: *"Gratis. Sin registro. Sin correo."* | `perfil.subtitulo` |
| 2 | Hero | *"Dónde están las startups que pagan en dólares"* | `lista.hero.titular` |
| 3 | Dos portales | **Las dos puertas**: La Lista / El Método | `hub.recursos[lista, pvp]` |
| 4 | Odómetro | **`1.800` · `8` · `9` · `0`** — máximo mensual en USD, plataformas, puestos sin programar, y lo que cuesta | `datos_reutilizables` |
| 5 | "How we work." 01–04 | **El método PVP en 4 pasos** | `lista.seccion_metodo.pasos` + `content/pvp/03` |
| 6 | Grid + corchetes | **Las 8 plataformas**, con su taxonomía ya escrita: `[Y Combinator]`, `[Latam · Español]` | `lista.plataformas` |
| 7 | 6 principios | **Los 9 puestos sin programar**, cada uno con su rango | `lista.roles` |
| 8 | FAQ acordeón | **El mapa de inseguridades** — 8 pares pregunta/respuesta ya escritos | `content/pvp/10-cuando-no-funciona-herramientas.md` |
| 9 | Cierre | **Decisión pendiente** — ver abajo | `pvp.booking` |
| 10 | Suscripción | **La votación de guías** — mismo mecanismo, pero no pide correo | `votacion.guias` |
| 11 | Footer | Redes + Mi Plata + Science Gym Coach + el anuncio | `hub.redes`, `hub.recursos`, `hub.anuncio` |

Las **3.631 palabras del método** no entran en este scroll. La sección 5 se queda con los 4 pasos
y las 12 partes siguen en su lector propio. La landing es la puerta, no el libro.

## Lo que NO se copia

Dos mecanismos de Good Fella son veneno para la audiencia de Moi. De los 780 comentarios de su
TikTok, **los 5 más likeados son desconfianza** — *"no me vendas cursos"*, *"asi me vendieron
herbalyfe"*, *"por hacer caso a estas cosas me estafaron"*.

1. **La escasez** (*"Only 3 spots left"*). Se invierte: donde ellos ponen urgencia, Moi pone
   abundancia. Misma posición en la página, mensaje opuesto. Ese contraste es el golpe.
2. **El cierre en llamada** (*"Book a 15-min call"*). Es exactamente la forma que su audiencia
   está esperando y temiendo — y hoy `pvp.html` ya termina en un cal.com de "llamada de
   descubrimiento". Si la landing cierra ahí, confirma la sospecha en el último paso.

## La traducción a la marca de Moi

El sistema de color se traduce rol por rol. Donde va su naranja, va el champán — con la misma
agresividad, incluido el tema `brand` de página completa.

| Variable | dark | light | brand |
|---|---|---|---|
| `--bg` | `#0B0B09` | `#EDE8DA` | **`#F7D794`** |
| `--fg` | `#EDE8DA` | `#0B0B09` | `#0B0B09` |
| `--fg-muted` | `#807C6F` | `#6B6759` | `#6E5D33` |
| `--brand` | `#F7D794` | `#8A6510` | `#0B0B09` |
| `--rose` | `#EDA6A3` | `#B5615D` | `#9C4F4B` |
| `--surface` | `#1B1A16` | `#DED7C4` | `#EFC96F` |

El champán a `#F7D794` no tiene contraste sobre crema, así que el tema claro usa un **oro
profundo `#8A6510`** — exactamente el mismo movimiento que ellos hacen al pasar de `#fd551d`
(oscuro) a `#fb460d` (claro): el acento se satura cuando el fondo se aclara.

El **rosa `#EDA6A3`** se queda en los cintillos de sección, como ya lo usa `lista.html`. Es la
pieza que impide que el sistema se lea como una traducción de otra marca.

**Tipografía:** donde va Aktiv Grotesk va **Cormorant Garamond** — una serif a 92px con tracking
cerrado es más dramática que cualquier grotesca, y es inconfundiblemente suya. **Lora** para leer,
**Space Mono** para cifras, cintillos y odómetro (ocupa el lugar de Geist Mono).

⚠️ Esto **rompe el compromiso de "solo tema oscuro"** que el sitio tenía. Es deliberado: el
ciclado de temas es uno de los mecanismos firmados. Decisión pendiente de Walter.

---

## Rerun Inputs

```
workflow: firecrawl-website-design-clone
source_url: https://good-fella.com/
target_stack: HTML + CSS a mano, una sola página, sin framework (como el resto del sitio)
output: DESIGN.md
```
