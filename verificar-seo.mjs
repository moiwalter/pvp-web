#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════════════
   verificar-seo.mjs — invariantes de SEO de las 4 páginas.
   Corre:  node verificar-seo.mjs      (sale 1 si algo está mal)

   Existe por una razón concreta: el ItemList de lista.html lleva las 9
   plataformas ESCRITAS en el JSON-LD. El día que agregues o quites una tarjeta
   y no toques el JSON-LD, el structured data miente y no hay ningún síntoma
   visible. Esto lo cuenta y te avisa.
   ══════════════════════════════════════════════════════════════════════════ */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const RAIZ = dirname(fileURLToPath(import.meta.url));
const leer = f => readFileSync(join(RAIZ, f), 'utf8');
const problemas = [];
const pega = (f, m) => problemas.push(`${f}: ${m}`);

const PAGINAS = ['index.html', 'lista.html', 'pvp.html', 'hub.html'];

for (const f of PAGINAS) {
  const s = leer(f);

  /* ── canonical: sin esto, ?f=qr y los ?fbclid de las redes son URLs
        distintas con el mismo contenido ── */
  const canon = s.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  if (!canon) pega(f, 'sin <link rel="canonical">');
  else if (!canon[1].startsWith('https://')) pega(f, 'canonical no absoluto');

  /* ── un solo h1 ── */
  const h1 = (s.match(/<h1[\s>]/gi) || []).length;
  if (h1 !== 1) pega(f, `tiene ${h1} <h1>, debe tener exactamente 1`);

  /* ── description con largo utilizable ── */
  const d = s.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  if (!d) pega(f, 'sin meta description');
  else if (d[1].length < 70 || d[1].length > 165)
    pega(f, `description de ${d[1].length} car. (útil: 70-165)`);

  /* ── title ── */
  const t = s.match(/<title>([^<]*)<\/title>/i);
  if (!t) pega(f, 'sin <title>');
  else if (t[1].length > 60) pega(f, `title de ${t[1].length} car. (Google corta ~60)`);

  /* ── og:image con dimensiones (sin ellas hay scrapers que no pintan card) ── */
  for (const p of ['og:image', 'og:image:width', 'og:image:height', 'og:site_name'])
    if (!s.includes(`property="${p}"`)) pega(f, `falta ${p}`);

  /* ── JSON-LD: que sea JSON de verdad y sin @id colgando ── */
  const bloques = [...s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (bloques.length !== 1) { pega(f, `${bloques.length} bloques JSON-LD, debe haber 1`); continue; }
  let g;
  try { g = JSON.parse(bloques[0][1]); }
  catch (e) { pega(f, 'JSON-LD no parsea: ' + e.message); continue; }

  const nodos = g['@graph'] || [g];
  const ids = new Set(nodos.map(n => n['@id']).filter(Boolean));
  const refs = new Set();
  (function buscar(o) {
    if (Array.isArray(o)) return o.forEach(buscar);
    if (o && typeof o === 'object') {
      const k = Object.keys(o);
      if (k.length === 1 && k[0] === '@id') refs.add(o['@id']);
      else Object.values(o).forEach(buscar);
    }
  })(nodos);
  /* Google parsea POR PÁGINA: un {'@id': ...} cuyo nodo vive en otra página
     deja al autor (o al sitio) sin nombre acá. */
  for (const r of refs) if (!ids.has(r)) pega(f, `@id huérfano en el JSON-LD: ${r}`);

  /* ── lista.html: el ItemList tiene que cuadrar con las tarjetas reales ── */
  if (f === 'lista.html') {
    const tarjetas = (s.match(/class="card-name"/g) || []).length;
    const il = nodos.find(n => n['@type'] === 'ItemList');
    if (!il) pega(f, 'sin ItemList en el JSON-LD');
    else {
      if (il.itemListElement.length !== tarjetas)
        pega(f, `el ItemList lista ${il.itemListElement.length} plataformas y hay ${tarjetas} tarjetas`);
      if (il.numberOfItems !== tarjetas)
        pega(f, `numberOfItems=${il.numberOfItems} pero hay ${tarjetas} tarjetas`);
      const nombres = [...s.matchAll(/class="card-name">([^<]*)</g)].map(m => m[1].trim());
      for (const n of nombres)
        if (!il.itemListElement.some(x => x.name === n))
          pega(f, `"${n}" está en la página pero no en el ItemList`);
    }
  }
}

/* ── sitemap ── */
const sm = leer('sitemap.xml');
for (const f of PAGINAS) {
  const url = f === 'index.html' ? 'pvp-web/</loc>' : `pvp-web/${f}</loc>`;
  if (!sm.includes(url)) problemas.push(`sitemap.xml: falta ${f}`);
}
if ((sm.match(/<lastmod>/g) || []).length !== (sm.match(/<loc>/g) || []).length)
  problemas.push('sitemap.xml: hay <loc> sin su <lastmod>');

/* ── 404 fuera del índice ── */
if (!/name="robots"[^>]*noindex/.test(leer('404.html')))
  problemas.push('404.html: debería llevar noindex (una 404 indexada roba clicks)');

if (problemas.length) {
  console.error('PROBLEMAS DE SEO:\n' + problemas.map(s => ' · ' + s).join('\n'));
  process.exit(1);
}
console.log(`selftest SEO ok: ${PAGINAS.length} páginas · canonical, un h1, title/description,`);
console.log('og completo, JSON-LD válido sin @id huérfanos, ItemList cuadrado, sitemap y 404.');
