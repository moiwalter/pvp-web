# La capa de datos — todo el contenido, separado del diseño

> ⚠️ **La dirección del flujo se INVIRTIÓ el 9-ago-2026.** Antes el HTML era la
> fuente y los `.md` una copia extraída. Ahora es al revés:
>
> ```
> content/pvp/*.md + pvp-indice.json   ← LA FUENTE (se edita acá)
>          ↓  node content/render-pvp.mjs
>       pvp.html                        ← GENERADO (nunca editar a mano)
> ```
>
> `extraer-pvp.mjs` quedó **retirado** y aborta si lo corres: iba en la dirección
> vieja y hoy pisaría la fuente con el generado. El conversor markdown vive en
> `md.mjs` y el markdown se **hornea en build** — ya no hay `marked` desde CDN.

Acá vive **el contenido** del sitio de Moi. Las páginas actuales (`index.html`, `lista.html`,
`pvp.html`) tienen el texto incrustado en el HTML; esto lo saca afuera para poder montar una
**imagen nueva** sin volver a escribir ni una línea.

Extraído el **8-ago-2026** de las tres páginas publicadas. Los textos son **verbatim**.

## Qué hay

| Archivo | Qué contiene |
|---|---|
| `site.json` | Todo: marca, perfil, rutas, SEO, assets, auspicio, el hub completo, La Lista completa, el armazón del método, y cifras reutilizables |
| `pvp/*.md` | Las **12 partes** del método, un archivo por parte, en markdown |
| `pvp-indice.json` | Orden, título, sección, archivo y conteo de palabras de cada parte |

Las 12 partes están afuera del JSON a propósito: son 3.631 palabras de prosa. Como archivos
`.md` se editan cómodo y los cambios se leen en el diff.

## Cómo la consume una landing nueva

```js
const site = await fetch('content/site.json').then(r => r.json());

site.perfil.titular            // "Acá está todo lo que <em>prometí</em>"
site.hub.recursos              // las 4 tarjetas, con color, tamaño, chips y peek
site.lista.plataformas         // las 8 + Workana aparte en site.lista.freelance
site.lista.roles               // la tabla de 9 puestos, con min/max numéricos
site.votacion.guias            // las 7 candidatas, con su id de Supabase
site.marca.colores             // los tokens, ya con su uso documentado
site.datos_reutilizables       // cifras ya contadas: 8 plataformas, 9 roles, 12 partes…
```

Los rangos salariales vienen **dos veces**: `rango_usd` (`"$400–1.200"`, para pintar) y
`min`/`max` numéricos (por si la landing nueva quiere ordenar, filtrar o graficar).

Cada campo con texto rico marca su realce aparte (`titular` con `<em>` + `titular_texto_plano` +
`palabra_acentuada`), para que el diseño nuevo decida cómo resaltarlo sin parsear HTML.

## Reglas que la imagen nueva no puede romper

Están en `site.json → marca.reglas_duras`. Las tres que más se rompen solas:

1. **El champán `#F7D794` es EL acento** — una sola cosa resaltada por pantalla.
2. **El azul es exclusivo de Wallbit.** Nada más lleva azul.
3. **Tuteo neutro siempre.** Nunca voseo.

Y una de ruteo: **el QR de los videos apunta a `lista.html` directo**. Esa URL no se cambia,
pase lo que pase con el diseño.

## Lo que encontré roto al extraer

**Estado al 9-ago-2026:** lo de `pvp.html` está ✅ **arreglado** en el rediseño del deck
(voseo, `og:url`, canonical, CDN, y el cierre en llamada). Lo de `lista.html` e
`index.html` sigue pendiente y se marca abajo.

### Contenido

- ✅ **Voseo — RESUELTO.** Los 5 casos que vivían en las 12 partes se corrigieron en la
  **fuente** (`content/pvp/*.md`) y `render-pvp.mjs` tiene un **gate de voseo** que hace
  fallar el build si vuelve a aparecer. El sexto (`Agendá una llamada`) murió con la
  sección de booking. Tabla original, para referencia:
  | Dónde | Dice | Debería decir |
  |---|---|---|
  | booking (línea 816) | `Agendá una llamada` | `Agenda una llamada` |
  | parte 1 (línea 889) | `no ocultes que sos de Bolivia` | `que eres de Bolivia` |
  | parte 1 (línea 905) | `pasalo por IA` | `pásalo por IA` |
  | parte 4 (línea 1033) | `Evitá estas` | `Evita estas` |
  | parte 5 (línea 1062) | `usala. Como usuario nuevo` | `úsala` |
  | parte 6 (línea 1080) | `Usá estos prompts` | `Usa estos prompts` |
  `index.html` y `lista.html` están limpias.
- **Concordancia en La Lista**: Work at a Startup dice *"El bolsa de empleo"* → *"La bolsa"*.

### Estructura y embudo

- **`lista.html` no enlaza de vuelta al hub** (`pvp.html` ya sí: cabecera y "Volver al inicio"). El QR de los videos entra por
  `lista.html`, o sea que el tráfico grande nunca descubre Mi Plata, Science Gym Coach ni la
  votación. El hub solo lo ve quien entra por la bio.
- ✅ **`og:url` de `pvp.html` — RESUELTO**: apunta a `pvp.html` y ahora declara `canonical`.
  Además cada parte tiene ancla propia (`#parte-7`), así que el deck es compartible por parte.
- **Las tres páginas comparten la misma `og:image`** (`hero.webp`) y **ninguna declara canonical**.
- **Zona "Herramientas que construí"**: una sola tarjeta a ancho completo. Se ve vacía.

### Técnico

- **Cero analítica** en las tres páginas. No hay forma de saber cuánta gente llega, por dónde
  entra ni qué recurso abre.
- **15 llamadas a `google.com/s2/favicons`** (12 en `lista.html`, 3 en `index.html`): filtra cada
  visitante a Google, y el logo de Wallbit —el auspiciador— sale de un favicon de 128px.
- **4,3 MB de peso muerto** en el repo: `hero.png` y los tres `section-*.jpg` ya no se sirven
  (las páginas solo piden los `.webp`).
- ✅ **CDN — RESUELTO**: el markdown se hornea en build con `md.mjs`. `pvp.html` ya no carga
  ningún JS externo (el selftest de `render-pvp.mjs` lo verifica en cada corrida).

### Documentación

- **`HUB.md` está desactualizado** y se contradice: dice que `index.html` "sigue siendo el
  redirect a `lista.html`" cuando ya es el hub, y lista como pendiente correr `votos.sql`.

## Estado real de la votación (verificado 8-ago-2026)

**Está viva.** El endpoint responde `201`, así que `votos.sql` ya se corrió — al revés de lo que
dice `HUB.md`. Los 7 ids de `index.html` coinciden con el `CHECK` de `votos.sql`.

Resultados: `select * from public.votos_hub_conteo;` en el SQL Editor de `imprimelibro`.
Las guías en 0 no salen en esa vista.

## Cómo se regeneran las 12 partes

Si `pvp.html` cambia y hay que re-extraer:

```bash
cd ~/Downloads/Personal/moi/pvp-web && node content/extraer-pvp.mjs
```

Corta el bloque `const sections` … `const partes` del `<script>`, lo evalúa y escribe un `.md`
por parte. Nada se retipea a mano — verificado round-trip: **12/12 idénticas al fuente**.
