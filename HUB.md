# El Hub — landing de recursos de Moi

`index.html` — la página "un nivel arriba": todo lo que Walter comparte, en un solo lugar.
Es la URL que va en la bio de TikTok/LinkedIn/Instagram.

## Ruteo

| URL | Archivo | Qué es |
|---|---|---|
| `moiwalter.github.io/pvp-web/` | `index.html` → **pasará a ser el hub** | El hub (bio link) |
| `moiwalter.github.io/pvp-web/lista.html` | `lista.html` | La Lista — **el QR de los videos apunta acá, NO tocar** |
| `moiwalter.github.io/pvp-web/pvp.html` | `pvp.html` | El método PVP |

**Estado actual**: el hub ES `index.html` (publicado 28-jul-2026). `index.html` sigue siendo el
redirect a `lista.html`. Para publicar: reemplazar `index.html` con el contenido de `hub.html`
y actualizar `sitemap.xml`.

**Por qué no rompe nada**: `index.html` hoy es *solo* un redirect, y el QR de los videos apunta
a `lista.html` directo. Cambiar la raíz no toca el embudo del video.

## Regla que se mantiene

El flujo sigue siendo **lista → PVP, nunca al revés** (ver memoria `project_pvp_web`).
El hub es un nivel *arriba* de eso: entrada general → La Lista es el tile dominante.

## Diseño

Hereda el sistema de `lista.html` — no se inventó nada nuevo:
- Paleta: `--black #0B0B09` · `--cream #EDE8DA` · `--olive #F7D794` (champagne) · `--rose #EDA6A3` · `--navy #192A56`
- Tipos: Cormorant Garamond (display) · Lora (cuerpo) · Space Mono (datos/etiquetas)
- Radio 18px, gap 1.1rem, ancho 1180px
- Grid bento: 4 columnas desktop → 2 en tablet (≤900px) → 1 en móvil (≤560px)

**Sistema de señales** (esto es lo que hace que la página se pueda escanear):
- **Marca** (arriba izq.) = identidad: iniciales mono para lo propio (`PVP`, `L`), logo para lo externo.
- **Chip** (arriba der.) = si lo puedes usar HOY: `GRATIS` · `CÓDIGO ABIERTO` · `CON WALLBIT`
- **Tamaño del tile** = qué tan central es. **El método PVP** es 2×2 (decisión de Walter 28-jul).
- **Color** = de quién es. Champán = PVP · rosa = La Lista · **azul = SOLO Wallbit**.

⛔ **El azul está reservado a Wallbit.** Se sacó de todo lo demás (avatar, botón del header,
CTA del anuncio, chips) para que el único azul de la página sea el tile de Mi Plata.
Colores reales de Wallbit sacados de su CSS de producción: `#2388FF` / `#0D99FF` sobre `#19213D`.

**Las descripciones dicen el resultado, no la función.** "Sabes cuánto puedes gastar hoy sin
arruinar el mes", no "dashboard de finanzas con API". Regla de Walter, 28-jul.

Compromiso deliberado: **solo tema oscuro**, igual que el resto del sitio.

## Qué se tomó de Bento (y qué no)

**Bento (bento.me) ya no existe.** Linktree lo compró el **6-jun-2023** y lo **apagó el 13-feb-2026**:
los perfiles se borraron y las páginas redirigen a `linktr.ee`. Fundadores: Sélim Benayat y
Mugeeb Hassan (Berlín, respaldados por Sequoia). Las cifras de abajo salieron del CSS de
producción archivado en Wayback, no de capturas.

Tomado (aplicado en `hub.html`):
- **El radio crece con el tamaño del tile** (18 / 22 / 26px) para que la curvatura se *vea* igual
  en un tile chico y en uno de 2×2. Bento usaba 20/24/28. Casi nadie hace esto.
- **La elevación es un bisel, no una sombra.** 1px de luz en el borde superior; cero drop shadow
  en reposo. En claro Bento usaba borde negro + realce blanco; acá va invertido para fondo oscuro.
- **Cada propiedad con su propia duración de transición** (`border .2s`, `background .2s`,
  `transform .24s cubic-bezier(.43,.01,.29,1)`) en vez de un `all .18s`.
- **Estado de presionado** `scale(.988)` — se siente material, no animado.
- Gap subido de 1.1rem → 1.35rem (Bento corría un ratio gap/tile altísimo, 0.59; acá no aplica
  igual porque los tiles son de contenido, no celdas de 67.5px).

**No** tomado, a propósito:
- Su hover sin desplazamiento: `lista.html` ya usa `translateY(-3px)` y manda la coherencia del sitio.
- Su grid de 8 columnas sobre celda de 67.5px: obliga a tiles cuadrados/2:1 exactos. Acá el contenido
  manda sobre la geometría.
- Tema claro único, Inter, colores prestados de cada marca destino: choca con la línea Moi.

Idea pendiente del análisis competitivo: Bento nunca tuvo bucle de crecimiento — lo que salvó a
Linktree fue **QR + imagen OG por link**. Walter ya usa QR en los videos; generar QR/OG desde el hub
sería el siguiente paso natural.

## Contenido

1. **Empieza por acá** — El método PVP *(champán, 2×2)* · La Lista *(rosa)* · Mi Plata *(azul Wallbit)*
2. **Herramientas que construí** — Science Gym Coach
3. **Anuncio** — Tu Libro Bolivia, bloque crema marcado `ANUNCIO`, fuera de las zonas de recursos
4. **Qué publico después** — 7 guías candidatas, cada una con botón **Votar**
5. **Dónde encontrarme** — TikTok · LinkedIn · Instagram

### Las 7 candidatas a votación

| id | Guía | Fuente en el vault |
|---|---|---|
| `vuelos` | Vuelos baratos | `04-resources/playbooks/vuelos-baratos.md` |
| `ai-slops` | Que no parezca escrito por IA | `04-resources/frameworks/ai_slops.md` |
| `clase-ia` | Diseña tu piloto de IA | `~/Downloads/Personal/moi/claude-class/index.html` |
| `neuro` | Que te lean hasta el final | `04-resources/frameworks/neuropsych_writing_system.md` |
| `overlay` | Animaciones para tus videos | `~/Downloads/Personal/moi/overlay-pipeline/` |
| `video-kit` | Kit de edición de video | `~/Downloads/Personal/moi/video-edit/` — **quitar el linaje Stacksync antes** |
| `lectura` | Qué estoy leyendo | `04-resources/reading/lista-lectura.md` |

Descartadas por Walter (28-jul): **La Lista Contada** (formato propio, se lo guarda),
**Mis skills de Claude Code**, **Qué quiere la juventud boliviana**.
Excluidas por IP de terceros: `kallaway_clone.md`, `sandcastles-breakdown.md`, ninja-youtube.

## Votación — cómo funciona

Cada guía tiene un botón `Votar`. Al hacer clic: pasa a `Votada ✓`, se guarda en `localStorage`
(`moi-voto-<id>`) para que no vote dos veces, y hace `POST` a `VOTE_ENDPOINT` con `{guia, ts}`.

**No se muestran contadores públicos** a propósito: una guía en 0 se ve muerta y sesga el voto.

**Backend**: Supabase (proyecto `imprimelibro`), sin servidor — la página escribe directo por
PostgREST a `public.votos_hub`. SQL y notas en `~/Projects/moi-votos`.

- No se guarda ninguna IP: un trigger calcula `sha256(ip + sal)` en el servidor. El navegador
  nunca manda la huella, así que no se puede falsificar.
- Un voto por guía por persona (índice único). El repetido devuelve 409 y la página lo trata
  como voto exitoso.
- La llave pública de la página **solo puede insertar**: RLS sin políticas de SELECT/UPDATE/DELETE.
  Aunque alguien la saque del código fuente, no lee ni borra nada.

⚠️ **Falta correr `votos.sql`** en el SQL Editor de `imprimelibro`. Hasta entonces el endpoint
devuelve 404 y el voto solo queda en el navegador. Credenciales ya verificadas (28-jul).

Los ids viven en `hub.html` y en el CHECK de `votos.sql`. Si se desincronizan, un voto real se
pierde con un 400 silencioso: `cd ~/Projects/moi-votos && node verificar-ids.mjs`

## Pendientes antes de publicar

- [ ] **Correr `~/Projects/moi-votos/votos.sql`** en el SQL Editor de `imprimelibro`
- [ ] Escribir las guías más votadas (hoy solo existe el nombre y la descripción)
- [ ] Decidir si el hub lleva auspicio Wallbit (**hoy NO lo lleva** — el auspicio es por video/recurso,
      no sobre la página personal de Walter; ponerlo ahí extendería la marca más allá del trato)
- [ ] Verificar el handle de Instagram (`@moiwalter` está en el vault pero sin actividad registrada)
- [ ] `hub.html` → `index.html` + agregar la raíz al `sitemap.xml`
- [ ] Considerar dominio propio (apuntar y listo, no hay que rehacer nada)

## Fuera a propósito

Cvander (el MSA prohíbe atribución pública) · todo lo de la cuenta `walter020895` (Stacksync) ·
Ninja YouTube y transcripts de Kallaway (IP de terceros) · Plan24 (marca Wallbit sin OK) ·
finanzas / salud / diario / documentos de identidad.
