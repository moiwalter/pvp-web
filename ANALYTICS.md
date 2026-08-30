# Analytics — GA4 en pvp-web

Instalado el **30-ago-2026**. Dos archivos: `analytics.js` (todo el motor) y una
línea `<script defer src="analytics.js?v=1">` en el `<head>` de las 4 páginas.

---

## ⚠️ Por qué NO está el snippet de Google

El snippet que da GA4 es `<script src="https://www.googletagmanager.com/...">`.
**Acá eso rompe el build**: el selftest de `content/render-pvp.mjs` (~línea 808)
aborta si encuentra JS remoto en `pvp.html`, porque un CDN caído ya dejó esa
página en blanco una vez.

Así que `analytics.js` es **local** y el loader de Google se inyecta desde
adentro. Efecto secundario bueno: si googletagmanager no responde, la página
funciona igual. Verificado — con la petición bloqueada, `pvp.html` renderiza
completo y sin errores de JS.

**No muevas el loader al HTML.** El build te lo va a rechazar, y con razón.

---

## Encenderlo — 3 pasos

### 1. Crear la propiedad
analytics.google.com → Admin → Crear propiedad → flujo de datos **Web** →
`https://moiwalter.github.io` → copiar el **Measurement ID** (`G-XXXXXXXXXX`).

### 2. Pegar el ID
Un solo lugar, `analytics.js`:

```js
var GA_ID = '';   /* ← pega acá el Measurement ID (G-XXXXXXXXXX) */
```

Con el ID vacío el archivo es inerte (no pide red) pero sigue imprimiendo los
eventos en consola. Sirve para ver la instrumentación antes de tener cuenta.

### 3. ⚠️ Registrar las dimensiones — el paso que todos se saltan

**En GA4 los parámetros de un evento NO aparecen en ningún informe hasta que los
registras como dimensión, y el registro NO es retroactivo.** Lo que se recolectó
antes queda perdido a nivel de parámetro. Es *la* razón por la que la gente cree
que GA4 "no funciona".

Admin → Visualización de datos → **Definiciones personalizadas** → Crear.
Todas con alcance **Evento**:

| Dimensión | Parámetro | Para qué |
|---|---|---|
| Origen | `origen` | de dónde vino — el embudo entero se segmenta por esto |
| Página | `pagina` | index · lista · pvp · hub |
| Destino | `destino` | a qué dominio salió |
| Lugar | `lugar` | qué posición del link se usó (header/hero/pie/pill/tile) |
| Parte | `parte` | qué parte del método (0-11) |
| Lista | `lista` | qué semana del plan de 30 días (1-4) |

Y como **métricas** personalizadas (alcance Evento, unidad Estándar):

| Métrica | Parámetro |
|---|---|
| Hechas | `hechas` |
| Total | `total` |

Hazlo **el mismo día** que pegas el ID.

---

## ⚠️ Chequeo del día uno: el deck puede inflar los pageviews

`pvp.html` llama `history.replaceState` **cada vez que cambias de parte**
(`pvp.html:1006`). GA4 tiene, dentro de *Enhanced Measurement*, un sub-interruptor
llamado **"Cambios de página basados en eventos del historial del navegador"**.
Si está encendido, cada parte del deck puede contar como un **pageview nuevo**:
un lector que llega a la parte 12 valdría ~12 pageviews.

Eso no rompe nada, pero **desfigura el embudo**: `lista.html → pvp.html` daría una
conversión inventada.

No pude verificarlo sin tu propiedad real (con un ID falso Google no devuelve la
config de Enhanced Measurement). **Compruébalo en 60 segundos:**

1. Con el ID ya pegado, abre `pvp.html` y GA4 → Informes → **Tiempo real**
2. Avanza 5 partes del deck
3. Si los pageviews suben de 1 a 6 → apágalo:
   Admin → Flujos de datos → tu flujo → Enhanced Measurement (⚙️) →
   desmarcar sólo **"Cambios de página basados en eventos del historial"**

Los demás sub-interruptores de Enhanced Measurement déjalos encendidos: el evento
`scroll` (90% de profundidad) te da gratis una señal de lectura en `pvp.html`.

---

## Los eventos

`origen` y `pagina` van pegados a **todos** los eventos, no sólo al `page_view`.
Por eso el embudo se puede segmentar por origen en cualquier paso.

| Evento | Cuándo | Parámetros propios |
|---|---|---|
| `page_view` | automático, cada página | — |
| `a_metodo` | click interno hacia `pvp.html` | `lugar` |
| `a_lista` | click interno hacia `lista.html` | `lugar` |
| `a_landing` · `a_hub` | click interno hacia la raíz / el hub | `lugar` |
| `salida` | click a **cualquier** dominio externo | `destino`, `lugar` (si lo tiene) |
| `casilla` | marca/desmarca una casilla del plan de 30 días | `parte`, `lista`, `hechas`, `total` |
| `semana_completa` | marcó **todas** las de una semana | `parte`, `lista` |
| `prompt_copiado` | copió uno de los prompts | `parte` |

`casilla`, `semana_completa` y `prompt_copiado` son la señal de **ejecución** —
distinguen al que lee del que hace. `semana_completa` es la más fuerte que tienes.

**Los 11 links de bolsas de trabajo no están marcados y no hace falta**: cualquier
`<a>` a otro dominio dispara `salida` solo, con el host como `destino`.

---

## Agregar un evento nuevo

No se toca `analytics.js`. Se le pone un atributo al elemento:

```html
<a href="..." data-ga="lo_que_sea" data-ga-lugar="donde">
```

`data-ga` es el nombre del evento; cualquier `data-ga-loquesea` llega como
parámetro `loquesea`. Un `data-ga-lugar` suelto en un link externo enriquece el
`salida` automático sin cambiarle el nombre (así están los 3 de Wallbit).

⚠️ Si el parámetro es nuevo, **regístralo como dimensión** o no lo vas a ver.

Desde JS: `if (window.moiEv) moiEv('nombre', {param: valor});`

**Extensión que ya está a una línea**: profundidad del deck. En
`content/render-pvp.mjs`, dentro de `marcarLeida` (donde hace
`localStorage.setItem(LS, n)`), agregar:
`if(window.moiEv) moiEv('parte_leida', {parte:n});`
Te diría en qué parte de las 12 abandonan.

---

## Lo que NO mide, y por qué

**El QR impreso no se puede atribuir con certeza.** Apunta a `lista.html` pelado
y ya está en videos publicados — no se le puede agregar `?utm_source`. Lo que sí
se separa:

| `origen` | Qué significa |
|---|---|
| `directo` | sin referrer → escaneó el QR con la cámara, o tecleó la URL |
| `inapp_tiktok` | navegador dentro de TikTok → tocó el link de la bio |
| `inapp_instagram` · `inapp_facebook` · `inapp_linkedin` | ídem, otra red |
| `interno` | venía de otra página del propio sitio |
| `google.com`, etc. | buscador u otro sitio |

`directo` **no es** exactamente "QR" (ahí cae también quien guardó el link), pero
sin tocar un QR ya impreso es lo más cerca que se llega.

**Para los links NUEVOS**: si el próximo video lleva
`moiwalter.github.io/pvp-web/lista.html?f=qr`, entonces `origen=qr` es exacto.
`analytics.js` ya lee ese parámetro — cualquier valor sirve (`?f=tiktok23`,
`?f=live`), no hay que tocar código.

---

## Cookies y consentimiento

GA4 pone cookies `_ga`. Tu audiencia es sobre todo LatAm, donde eso no exige
banner, pero alguien en España sí entra bajo GDPR.

**No pusimos banner** (arruinaría una página cuyo punto entero es el oficio).
Para que eso siga siendo defendible: **deja Google Signals APAGADO** — Admin →
Configuración de datos → Recopilación de datos. Viene apagado por defecto; si lo
enciendes, entras en territorio de publicidad y ahí el banner sí hace falta.

---

## Verificar en local

```bash
cd ~/Projects/pvp-web
python3 -m http.server 8791     # ⚠️ por HTTP, nunca doble clic: file:// apaga el retrato ASCII
```

Abre `localhost:8791`, consola del navegador. En localhost `DEBUG` se enciende
solo y cada evento se imprime `[ga] nombre {params}`. Con el ID puesto, además
salen en vivo en el **DebugView** de GA4.

En producción: `?gadebug` en la URL fuerza lo mismo.

⚠️ **La consola de Chrome recorta el preview a 5 propiedades.** Si ves
`{origen, pagina, parte, lista, hechas}` sin `total`, no falta: está recortado.

La suite que verificó esto (22 chequeos: embudo, salidas, casillas, prompts,
detección de origen y resiliencia con Google caído) vive en el scratchpad de la
sesión, no en el repo.

---

## ⚠️ Ojo: hay dos copias del repo

- `~/Projects/pvp-web` ← **esta es la buena**, la que está sincronizada con `main`
- `~/Downloads/Personal/moi/pvp-web` ← copia vieja, se quedó en el commit `d076c6a` (9-ago)

El 30-ago había todavía un `http.server` del 9-ago vivo en el 8791 sirviendo la
copia vieja. Si abres localhost:8791 y no ves tus cambios, es eso:
`lsof -nP -iTCP:8791 -sTCP:LISTEN` y mira el `cwd` del proceso.
