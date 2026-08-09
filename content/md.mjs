/* Convertidor markdown → HTML, sólo el subconjunto que usan las 12 partes de PVP.
   Existe para HORNEAR el HTML en build y sacar `marked` del CDN: hoy, si ese CDN
   cae, pvp.html queda EN BLANCO (ver content/README.md).

   Cubre exactamente lo inventariado en content/pvp/*.md — nada más, a propósito:
     h1/h2/h3 · listas - y 1. (un nivel de anidamiento) · citas > · hr ---
     tablas | (2 y 3 columnas) · **negrita** · *cursiva* · `código` · ``` bloques
   NO hay links, imágenes ni HTML crudo en la fuente; si algún día los hay, esto
   los escapa en vez de renderizarlos y el selftest de render-pvp.mjs lo canta. */

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* Se aplica SOBRE texto ya escapado. Negrita antes que cursiva: al consumir los
   `**` no quedan asteriscos dobles que confundan al patrón de uno solo. */
function inline(s) {
  return s
    .replace(/`([^`]+)`/g, (_, a) => `<code>${a}</code>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

const celdas = row => row.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
/* Ojo con el `|` DENTRO de la clase: la fila separadora real es `|----|----|`,
   o sea que lleva barras entre medio. Sin él, ninguna tabla se reconocía y las
   filas caían al bucle de párrafo, que no las consume → bucle infinito. */
const esSeparador = l => /^\|[\s:|-]+\|$/.test(l);

export function mdToHtml(src) {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trimEnd();

    if (!line.trim()) { i++; continue; }

    // ── bloque de código ─────────────────────────────────────────────
    if (/^```/.test(line)) {
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++; // cierra
      out.push(`<pre><code>${esc(buf.join('\n'))}</code></pre>`);
      continue;
    }

    // ── tabla ────────────────────────────────────────────────────────
    if (line.startsWith('|') && i + 1 < lines.length && esSeparador(lines[i + 1].trim())) {
      const head = celdas(line);
      i += 2;
      const body = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) body.push(celdas(lines[i++].trim()));
      out.push(
        `<div class="tabla-wrap"><table><thead><tr>${
          head.map(c => `<th>${inline(esc(c))}</th>`).join('')
        }</tr></thead><tbody>${
          body.map(r => `<tr>${r.map(c => `<td>${inline(esc(c))}</td>`).join('')}</tr>`).join('')
        }</tbody></table></div>`
      );
      continue;
    }

    // ── hr ───────────────────────────────────────────────────────────
    if (/^-{3,}$/.test(line.trim())) { out.push('<hr>'); i++; continue; }

    // ── encabezados ──────────────────────────────────────────────────
    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      // El h1 del .md es el título de la parte y lo pinta el template aparte,
      // así que acá baja un nivel: # → h2, ## → h3, ### → h4.
      const nivel = h[1].length + 1;
      out.push(`<h${nivel}>${inline(esc(h[2]))}</h${nivel}>`);
      i++;
      continue;
    }

    // ── cita ─────────────────────────────────────────────────────────
    if (line.startsWith('>')) {
      const buf = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        buf.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      out.push(`<blockquote>${inline(esc(buf.join(' ')))}</blockquote>`);
      continue;
    }

    // ── listas (un nivel de anidamiento) ─────────────────────────────
    /* `- [ ] tarea` es una CASILLA, no un guión con corchetes. El plan de 30
       días son 16 de estas y se estaban imprimiendo literales ("[ ] Define tu
       área"). Salen como <input type=checkbox> y el JS les guarda el estado. */
    const item = l => l.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
    if (item(raw)) {
      const tipo = /^\s*\d+\./.test(raw) ? 'ol' : 'ul';
      const esChecklist = /^\s*[-*]\s+\[[ xX]\]\s/.test(raw);
      let html = `<${tipo}${esChecklist ? ' class="chk"' : ''}>`;
      let abierto = false;      // ¿hay una sublista abierta?
      let liAbierto = false;
      while (i < lines.length && (item(lines[i]) || (!lines[i].trim() && item(lines[i + 1] || '')))) {
        if (!lines[i].trim()) { i++; continue; }
        const m = item(lines[i]);
        const anidado = m[1].length >= 2;
        const caja = m[3].match(/^\[([ xX])\]\s+(.*)$/);
        const txt = caja
          ? `<label><input type="checkbox"${/[xX]/.test(caja[1]) ? ' checked' : ''}><span>${inline(esc(caja[2]))}</span></label>`
          : inline(esc(m[3]));
        if (anidado) {
          if (!abierto) { html += '<ul>'; abierto = true; }
          html += `<li>${txt}</li>`;
        } else {
          if (abierto) { html += '</ul>'; abierto = false; }
          if (liAbierto) html += '</li>';
          html += `<li>${txt}`;
          liAbierto = true;
        }
        i++;
      }
      if (abierto) html += '</ul>';
      if (liAbierto) html += '</li>';
      out.push(html + `</${tipo}>`);
      continue;
    }

    // ── párrafo ──────────────────────────────────────────────────────
    const buf = [];
    while (
      i < lines.length && lines[i].trim() &&
      !/^(#{1,3}\s|>|```|\|)/.test(lines[i].trim()) &&
      !/^-{3,}$/.test(lines[i].trim()) && !item(lines[i])
    ) buf.push(lines[i++].trim());
    /* Red anti-bucle: si ninguna rama consumió la línea, el índice no avanza y
       esto gira para siempre. Preferimos romper ruidosamente a colgarnos. */
    if (!buf.length) throw new Error(`md.mjs: línea ${i + 1} no la consume ninguna regla: ${JSON.stringify(lines[i])}`);
    const parrafo = buf.join(' ');

    /* NOTA ETIQUETADA. El texto de Walter usa 21 veces el patrón
       `**Etiqueta**: cuerpo` — "Qué hacer", "La verdad", "El criterio",
       "El error más común". Son apartes, no prosa: el renderer los aplanaba a
       un párrafo más y se perdía la jerarquía que él YA escribió. */
    const nota = parrafo.match(/^\*\*([^*]{2,40})\*\*\s*:\s*(.+)$/s);
    if (nota) {
      out.push(
        `<div class="nota"><span class="nota__t">${inline(esc(nota[1]))}</span>` +
        `<p>${inline(esc(nota[2]))}</p></div>`
      );
      continue;
    }

    out.push(`<p>${inline(esc(parrafo))}</p>`);
  }

  return out.join('\n');
}

/* Texto plano de un HTML generado — el selftest lo compara contra el .md fuente
   para probar que no se perdió ni se inventó contenido. */
export function htmlToText(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ').trim();
}
