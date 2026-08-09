// Extrae `sections` y `partes` de pvp.html sin retipearlos: corta el bloque
// literal del <script> y lo evalúa. Así el markdown sale verbatim.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const REPO = "/Users/TERABYTE10/Downloads/Personal/moi/pvp-web";
const html = readFileSync(join(REPO, "pvp.html"), "utf8");

const ini = html.indexOf("const sections = [");
const fin = html.indexOf("function getSectionFor", ini); // primer código después de los datos
if (ini < 0 || fin < 0) throw new Error("No se encontró el bloque de datos en pvp.html");

const bloque = html.slice(ini, fin);
const { sections, partes } = new Function(bloque + "; return { sections, partes };")();

if (partes.length !== 12) throw new Error(`Esperaba 12 partes, salieron ${partes.length}`);
if (sections.length !== 3) throw new Error(`Esperaba 3 secciones, salieron ${sections.length}`);

const slug = (s) =>
  s.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const dir = join(REPO, "content", "pvp");
mkdirSync(dir, { recursive: true });

const indice = partes.map((p, i) => {
  const sec = sections.find((s) => s.parts.includes(i));
  const archivo = `${String(i).padStart(2, "0")}-${slug(p.titulo)}.md`;
  writeFileSync(join(dir, archivo), p.markdown.trimEnd() + "\n", "utf8");
  return {
    id: p.id,
    orden: i,
    titulo: p.titulo,
    seccion: sec.label,
    archivo: `content/pvp/${archivo}`,
    palabras: p.markdown.split(/\s+/).length,
  };
});

// Voseo: la regla de voz de Walter es tuteo neutro SIEMPRE. Lo marco al extraer.
const VOSEO = /\b(sos|tenés|hacés|podés|querés|sabés|andá|mirá|usá|pasá|agendá|evitá|elegí|dejá|contá|fijate|acordate|usala|pasalo|mandá|revisá|empezá)\b/gi;
const alertas = [];
for (const p of partes) {
  const hits = [...new Set((p.markdown.match(VOSEO) || []).map((m) => m.toLowerCase()))];
  if (hits.length) alertas.push({ parte: p.id, titulo: p.titulo, formas: hits });
}

writeFileSync(
  join(REPO, "content", "pvp-indice.json"),
  JSON.stringify({ secciones: sections, partes: indice }, null, 2) + "\n",
  "utf8"
);

console.log(`✓ ${partes.length} partes escritas en content/pvp/`);
console.log(`  ${indice.reduce((a, p) => a + p.palabras, 0)} palabras en total\n`);
console.log(alertas.length ? "⚠ VOSEO detectado (la regla es tuteo neutro):" : "✓ Sin voseo detectado");
for (const a of alertas) console.log(`  Parte ${a.parte} — ${a.titulo}: ${a.formas.join(", ")}`);
