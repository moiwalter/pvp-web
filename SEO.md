# SEO — pvp-web

Trabajado el **30-ago-2026**. El estado se verifica solo:

```bash
node verificar-seo.mjs
```

Chequea las 4 páginas: canonical, un solo `<h1>`, largo de title/description, `og:`
completo, JSON-LD que parsea y sin `@id` huérfanos, el `ItemList` cuadrado contra
las tarjetas reales, el sitemap y el `noindex` de la 404. Sale 1 si algo está mal.

---

## Lo que se arregló

| | Antes | Ahora |
|---|---|---|
| `canonical` en `lista.html` | **faltaba** | puesto |
| Structured data | **0 de 4 páginas** | JSON-LD en las 4 |
| `<h1>` en `pvp.html` | **13** (uno por parte) | 1 + 13 `<h2>` |
| `og:site_name` · `locale` · dimensiones | faltaban en las 4 | puestos |
| `twitter:` completo | faltaba en `index` | puesto |
| `lastmod` en el sitemap | ninguno | las 4 URLs |
| `404.html` | indexable, sin `h1` ni description | `noindex` + `h1` + description |
| description de la landing | **199 car.** — Google cortaba el "gratis, sin registro" | 153 car., entra entera |

### El canonical de `lista.html` era el más urgente

Es la página del QR: la de más tráfico y la única sin canonical. Y desde el 30-ago
recibe además `?f=qr` (de analytics) más los `?fbclid` / `?igshid` que pegan las
redes. Sin canonical, cada variante era una URL distinta con contenido idéntico y
la autoridad se repartía entre todas.

### `pvp.html` tenía 13 `<h1>`

Una por parte. Para un buscador eso son 13 documentos sueltos, no un método de 12
partes. Ahora el `<h1>` es el rótulo del header (*El método PVP*, que ya estaba
ahí y se ve igual) y las 12 partes + el cierre son `<h2>`.

⚠️ Se cambió en el **generador**, no en `pvp.html`. El CSS seguía a los títulos
por etiqueta (`.parte h1`), así que también se movió — y `.head__t` necesitó
`font-weight:400` explícito, porque como `<span>` heredaba 400 del body y como
`<h1>` habría salido negrita.

### Structured data — qué se puso y qué NO

| Página | Nodos |
|---|---|
| `index.html` | `WebSite` + `Person` |
| `lista.html` | `WebSite` + `Person` + `WebPage` + `ItemList` (9 plataformas) + `BreadcrumbList` |
| `pvp.html` | `Person` + `WebSite` + `Article` + `BreadcrumbList` |
| `hub.html` | `WebSite` + `Person` + `CollectionPage` + `BreadcrumbList` |

⚠️ **`Person` y `WebSite` se repiten en las 4 a propósito.** Google parsea el
structured data **por página**: un `{"@id": "...#walter"}` cuyo nodo vive en otra
página deja al autor sin nombre. El `@id` compartido es lo que le dice que es la
misma entidad en las cuatro. El selftest revisa que no queden `@id` colgando.

**No se puso `FAQPage` ni `HowTo`, y no es un olvido**: Google retiró los rich
results de ambos en 2023 (FAQ quedó sólo para sitios de gobierno y salud). Meterlos
sería cargo cult. De lo que quedó, **`BreadcrumbList` es el único con premio
visible en el SERP** — reemplaza la URL cruda por la miga. `Person` y `Article` no
pintan nada pero ayudan a que Google entienda quién escribe.

### `dateModified` sale del contenido, no del build

`render-pvp.mjs` lo calcula del `mtime` más reciente de `content/pvp/*.md`.
Regenerar sin cambiar un `.md` no le dice a Google que hay algo nuevo.
`datePublished` es fijo: `2026-08-08`, el primer commit real del contenido.

---

## Lo que NO se tocó, y por qué

**Las imágenes se quedaron sin `width`/`height`.** 22 no los tienen, y la receta
de manual dice ponerlos. Pero se midió el CLS real en móvil (390px) y da **0.000
en las 4 páginas** — tu CSS ya reserva el espacio. Añadir atributos habría sido
churn con riesgo de romper el layout que auditaste, a cambio de nada.

Medido de paso (móvil, umbral bueno de Google entre paréntesis):

| | CLS (≤0.10) | LCP (≤2500ms) |
|---|---|---|
| landing | 0.000 | ~1460 ms |
| lista | 0.000 | ~190 ms |
| pvp | 0.000 | ~270 ms |
| hub | 0.000 | ~300 ms |

Core Web Vitals no es el problema de este sitio.

---

## Pendientes

### ~~1. Los `<title>`~~ — hecho el 30-ago

Se pasaron a híbrido: el arranque del hook + los términos que la gente busca.
**Los `<h1>` y todo el copy visible quedaron intactos** — el `<title>` sólo se ve
en la pestaña y en el resultado de Google.

| Página | Antes | Ahora |
|---|---|---|
| `index.html` | Moi — Hay una forma nueva de ganarse la vida | Ganarse la vida de otra forma — trabajo remoto en dólares |
| `pvp.html` | El método PVP — 12 partes, completo y abierto | El método PVP — trabajo remoto sin portafolio ni contactos |
| `hub.html` | Moi — Todo lo que comparto, en un solo lugar | Todo lo que comparto: trabajo remoto, finanzas e IA |
| `lista.html` | La Lista — Trabajo remoto en dólares desde Bolivia | *sin cambios, ya estaba bien* |

⚠️ El de la landing se ajustó respecto de lo aprobado en la conversación:
*"Hay una forma nueva de ganarse la vida — trabajo remoto en dólares"* medía **66
caracteres** y Google cortaba justo en "en dólares", que es el término que más
vale. `Ganarse la vida de otra forma` fue la única variante que entra en 60
conservando **remoto** y **dólares** a la vez.

Se cambiaron también `og:title` y `twitter:title`: Google usa el `og:title` como
una de sus fuentes cuando reescribe el titular del SERP, así que dejarlos
distintos aumentaba la probabilidad de que ignore el `<title>` nuevo. Como el
híbrido conserva el hook, en redes no se pierde casi nada.

⚠️ En `index.html` el título vive **en cuatro sitios**: `<title>`, `og:title`,
`twitter:title` y el objeto `TITULOS` del switch EN (`~línea 1779`). Si lo cambias,
cámbialo en los cuatro.

### 2. Inglés de verdad (`/en/` + `hreflang`)

El switch EN es de **cliente**: Google indexa sólo el español. Ya estaba anotado
como pendiente. Necesita páginas propias bajo `/en/` con `hreflang` cruzado.

### 3. Search Console sin verificar

No hay `google-site-verification` en ninguna página. Sin eso no hay datos de qué
consultas te traen gente — y sin datos, el SEO es a ciegas. Es el paso que más
rinde de esta lista.

### 4. Cosas menores

- **~4,4 MB de peso muerto** en el repo: `hero.png`, `section-{1,2,3}.jpg` y
  `section-{1,2,3}.webp`. Las webp de sección están declaradas como `bg` en
  `content/pvp-indice.json` pero **el generador nunca las usa**. No se sirven, así
  que no afectan al SEO — sólo al peso del repo. No las borré: es tu llamada.
- **`404.html` quedó en la marca vieja** (azul marino + dorado + Cormorant, y su
  propio favicon `P`). El resto del sitio pasó a negro + naranja + Geist el 12-ago.
  Es deuda de marca, no de SEO, por eso sólo se le arreglaron los metadatos.

---

## Mantenerlo

- **Si agregas o quitas una plataforma en `lista.html`**, actualiza también el
  `ItemList` del JSON-LD. `node verificar-seo.mjs` te avisa si se desincronizan —
  está probado con una plataforma falsa: los tres chequeos saltaron.
- **`lastmod` del sitemap**: actualízalo cuando cambie el contenido de verdad. Un
  `lastmod` que miente Google lo empieza a ignorar y deja de servir para nada.
- **`pvp.html` no se edita a mano.** Todo lo de arriba vive en
  `content/render-pvp.mjs`.
