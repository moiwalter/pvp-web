# Plan — pasar el método PVP al formato de la landing

Escrito el **9-ago-2026**. Complementa `ESTADO.md` (dónde quedó la landing) y
`content/README.md` (qué se extrajo y qué salió roto).

---

## Por qué se siente imposible

No es falta de ganas ni de diseño. Son dos paredes reales:

**1. Las unidades no calzan.** La unidad del deck es **un clic**. La unidad de la landing es
**una banda**. Doce partes no son doce secciones — eso da una página infinita. Y no hay
conversión mecánica entre las dos: cada parte necesita una decisión editorial.

**2. Cada paso está escrito dos veces.** La escena del método vive duplicada en el markup:
`#metodo` (`.pin`, escena fijada de 320vh, sólo ≥1024px) y su caída apilada `.stack`
(sólo <1024px). Hoy son 4 pasos × 2 = 8 bloques a mano. Con 12 partes serían **24**, y
cualquier corrección hay que hacerla en los dos lados o se desincronizan en silencio.

**3. La que no se ve venir:** un paso fijado aguanta **~30 palabras**. Una parte de PVP tiene
**~300**. No son el mismo objeto. Por eso "pasarlo al formato" no es traducir — son **dos cosas
distintas que construir**:

| capa | qué es | tamaño |
|---|---|---|
| **el mapa** | las 12 partes como pasos: título + glosa + una cifra | ~360 palabras |
| **el cuerpo** | la instrucción real: prompts, plantillas, el plan de 30 días | 3.631 palabras |

El mapa entra en el formato de la landing sin forzar nada. El cuerpo **no cabe** en una escena
fijada, pase lo que pase.

---

## Lo que ya está resuelto (no rehacer)

- `content/pvp/*.md` — las 12 partes, verbatim, **round-trip verificado 12/12**
- `content/pvp-indice.json` — orden, título, sección, archivo, palabras
- `content/extraer-pvp.mjs` — regenera desde `pvp.html`
- La landing **ya tiene el mecanismo**: escena fijada `#metodo` con pasos (`.hw__paso`),
  paneles de cifra (`.hw__panel`), marcador (`#hw-marca`) y riel (`.pin__rail`)

O sea: el contenido ya está libre de la presentación y el motor visual ya está construido y
probado. Falta el puente.

---

## La decisión que bloquea el layout

**¿Dónde viven las 3.631 palabras del cuerpo?** Las tres secciones del índice pesan
936 / 1.839 / 856 palabras (Antes de empezar · El método PVP · Ejecutar).

### A — Todo en una página
El mapa (3 escenas fijadas) y debajo de cada una su cuerpo. Una URL, un scroll, ~4.000 palabras.
- **A favor:** es literalmente "pasarlo a este formato". Una sola cosa que compartir.
- **En contra:** 3× la landing actual. El formato good-fella vive del contraste entre bandas y
  del ritmo; a esa extensión el ritmo se pierde. En móvil son ~25 min de scroll sin descanso.

### B — Tres páginas, una por sección del índice
Cada una abre con su escena fijada y sigue con su cuerpo.
- **A favor:** cada página queda en ~1.200 palabras — exactamente el tamaño donde el formato
  funciona (la landing tiene 1.245).
- **En contra:** hay que inventar la navegación entre las tres, que hoy no existe. Y se pierde
  la URL única `pvp.html`.

### C — La landing se queda el mapa; `pvp.html` se reviste ✅ recomendada
Las 12 partes entran a la landing como 3 escenas fijadas (el gancho). El cuerpo sigue en
`pvp.html` con su lector de pasos, repintado al sistema nuevo.
- **A favor:** el más barato y el que menos rompe. Conserva la URL, el CTA de booking y el
  avance con clic — que **para instrucciones pagina mejor que un scroll infinito**. El embudo
  ya está armado así ("Leer el método completo · 12 partes · nada bloqueado").
- **En contra:** no es "todo en un formato" — son dos formatos conviviendo. Con la misma piel.

> **El argumento de fondo para C:** el trabajo de la landing es *vender* el método; el de
> `pvp.html` es *entregarlo*. Poner 3.631 palabras de instrucción delante de alguien que todavía
> no decidió es lo único que las tres opciones pueden hacer mal.

---

## Lo que se hace igual, elija lo que elija

**Empezar por F2 hoy no requiere haber decidido nada.**

### F1 · Arreglar lo que ya está roto
Documentado en `content/README.md`, nada tocado todavía: **6 voseo publicados** en `pvp.html`
(`Agendá`, `sos`, `pasalo`, `Evitá`, `usala`, `Usá`) · `og:url` apunta a la raíz · ninguna
página declara canonical · *"El bolsa de empleo"* en La Lista.

⚠️ **Ojo con la dirección del flujo.** Hoy `extraer-pvp.mjs` va `pvp.html → .md`. Si se corrige
el `.md` y después se re-extrae, la corrección se pierde. F3 invierte la dirección; hasta
entonces, corregir en `pvp.html` y re-extraer.

### F2 · Extender la capa de datos — **el único trabajo que no se puede automatizar**
Agregar a cada parte de `pvp-indice.json`:

```json
{
  "id": 3,
  "slug": "que-es-pvp",
  "titulo": "Qué es PVP y cómo funciona",
  "gloss": "≤25 palabras: qué gana quien lee esta parte",
  "cifra": "9",
  "pie": "secciones tiene el documento"
}
```

Dos reglas:
- **La glosa dice el RESULTADO, no la función** — "Sales con un documento que se puede mandar",
  no "explica la estructura del entregable".
- **La cifra tiene que ser un número que defiendas.** El panel derecho de la escena fijada está
  construido alrededor de una cifra. ⚠️ **Riesgo concreto a verificar acá:** si 4–5 de las 12
  partes no tienen un número honesto, el panel se queda sin contenido y hay que darle una
  variante sin cifra. Es lo primero que se sabrá al escribir las 12.

Son 12 glosas (~300 palabras) + 12 cifras. Una sesión.

### F3 · Un renderer, no markup a mano
Un script que lea `pvp-indice.json` + los `.md` y **emita las dos versiones** (fijada y apilada)
desde la misma fuente. Mata el problema de las 24 copias antes de que exista — y de paso arregla
el riesgo de drift que los 4 pasos actuales ya tienen.

Acá se invierte la dirección: `content/` pasa a ser la fuente, `pvp.html` pasa a ser generado.

### F4 · Aplicar la decisión de layout
Sólo esta fase depende de A / B / C.

### F5 · Sacar `marked` del CDN
Con F3 hecho, el markdown se hornea en build. Elimina el punto único de falla (hoy si el CDN
cae, `pvp.html` queda **en blanco**) y una llamada externa bloqueante.

### F6 · Verificación
Extender el chequeo de anclajes que ya corre, y agregar dos compuertas:
- **grep de voseo** sobre lo generado — la regla es dura y ya se rompió 6 veces
- `lista.html` intacta y el botón "Leer el método completo" resolviendo

---

## Lo que no se toca

- **`lista.html`** — el QR ya impreso en videos publicados apunta ahí. Esa URL no cambia.
- **`index.html`** — sigue siendo el hub hasta que se decida promover la landing (`ESTADO.md`).
