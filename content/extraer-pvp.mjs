/* ⛔ RETIRADO el 9-ago-2026. No lo corras: el flujo va al revés que antes.
   ────────────────────────────────────────────────────────────────────────────
   Este script existía para EXTRAER las 12 partes desde pvp.html hacia .md,
   porque el HTML era la fuente y los .md una copia.

   Desde el rediseño del deck, la dirección está invertida:

        content/pvp/*.md  +  content/pvp-indice.json      ← LA FUENTE
                        ↓  node content/render-pvp.mjs
                     pvp.html                             ← GENERADO

   Correrlo hoy sobrescribiría los .md (la fuente) con lo que salga del HTML
   (el generado), o sea que perdería toda corrección hecha en el markdown —
   incluidos los 5 arreglos de voseo del 9-ago.

   Para regenerar el sitio:   node content/render-pvp.mjs
   Recuperar este extractor:  git show 172384f -- content/extraer-pvp.mjs      */

console.error(`
⛔ content/extraer-pvp.mjs está RETIRADO.

   El flujo ahora es  content/pvp/*.md → render-pvp.mjs → pvp.html
   (antes era al revés). Correr esto pisaría la fuente con el generado.

   ¿Querías regenerar el sitio?   node content/render-pvp.mjs
`);
process.exit(1);
