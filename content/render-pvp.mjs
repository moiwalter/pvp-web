/* Genera pvp.html desde la capa de contenido.
   ────────────────────────────────────────────────────────────────────────────
   INVIERTE LA DIRECCIÓN del flujo viejo. Antes: pvp.html → extraer-pvp.mjs → .md
   (o sea, el HTML era la fuente y los .md una copia). Ahora la FUENTE es
   content/pvp/*.md + pvp-indice.json, y pvp.html es 100% GENERADO.

   Correr:  node content/render-pvp.mjs
   Nunca editar pvp.html a mano — la próxima corrida lo pisa.

   Qué resuelve, además del diseño:
   · saca `marked` del CDN (si ese CDN caía, pvp.html quedaba EN BLANCO)
   · mata el drift entre el contenido y su presentación
   · el tiempo de lectura sale del conteo real de palabras, no a ojo             */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mdToHtml, htmlToText } from './md.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const idx = JSON.parse(readFileSync(join(RAIZ, 'content/pvp-indice.json'), 'utf8'));

const PPM = 200;                                    // palabras por minuto, lectura en español
const minutos = p => Math.max(1, Math.round(p / PPM));
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const nn = n => String(n).padStart(2, '0');

// ── contenido ───────────────────────────────────────────────────────────────
const partes = idx.partes.map(p => {
  const src = readFileSync(join(RAIZ, p.archivo), 'utf8');
  // el h1 del .md es el título: lo pinta el template, no el cuerpo
  const cuerpo = src.replace(/^#\s+.*$/m, '').trim();
  return { ...p, min: minutos(p.palabras), html: mdToHtml(cuerpo), texto: htmlToText(mdToHtml(cuerpo)) };
});
const totalMin = minutos(partes.reduce((a, p) => a + p.palabras, 0));

// ── índice lateral ──────────────────────────────────────────────────────────
const indiceHtml = idx.secciones.map(sec => `
      <div class="idx__g">
        <span class="idx__sec">// ${esc(sec.label)}</span>
        ${sec.parts.map(id => {
          const p = partes.find(x => x.id === id);
          return `<button class="idx__p" type="button" data-go="${p.id}">
          <i>${nn(p.id + 1)}</i><span>${esc(p.titulo)}</span><em>${p.min} min</em>
        </button>`;
        }).join('\n        ')}
      </div>`).join('');

// ── las 12 partes ───────────────────────────────────────────────────────────
const partesHtml = partes.map(p => `
    <article class="parte" data-p="${p.id}" id="parte-${p.id + 1}">
      <div class="parte__tax">[${esc(p.seccion)}]—[${p.min} min]</div>
      <div class="parte__n"><span class="odo" data-odo="${p.id + 1}"></span><b>/ ${partes.length}</b></div>
      <h1>${esc(p.titulo)}</h1>
      <div class="prosa">
${p.html}
      </div>
      <nav class="parte__nav">
        ${p.id > 0
          ? `<button class="pnav" type="button" data-nav="${p.id - 1}"><span class="pnav__k">←</span><span class="pnav__t"><em>${nn(p.id)}</em>${esc(partes[p.id - 1].titulo)}</span></button>`
          : '<span></span>'}
        ${p.id < partes.length - 1
          ? `<button class="pnav pnav--r" type="button" data-nav="${p.id + 1}"><span class="pnav__t"><em>${nn(p.id + 2)}</em>${esc(partes[p.id + 1].titulo)}</span><span class="pnav__k">→</span></button>`
          : `<button class="pnav pnav--r" type="button" data-fin><span class="pnav__t"><em>FIN</em>Qué hacer ahora</span><span class="pnav__k">→</span></button>`}
      </nav>
    </article>`).join('');

// ── el cierre: La Lista, no una llamada ─────────────────────────────────────
/* El deck terminaba en un cal.com de "llamada de descubrimiento". DESIGN.md lo
   marca como veneno para esta audiencia (sus 5 comentarios más likeados son
   "me vas a vender un curso") y contradice el titular de la landing. El cierre
   real del método es ir a elegir la startup. */
const finHtml = `
    <article class="parte fin" data-p="${partes.length}" id="parte-fin">
      <div class="parte__tax">[Terminaste]—[${totalMin} min de lectura]</div>
      <h1>Ya tienes el método.<br><em>Ahora elige la empresa.</em></h1>
      <div class="prosa">
        <p>Eso era todo: las doce partes, completas y sin nada bloqueado. No hay un siguiente
        documento, no hay lista de espera y no hay llamada que agendar.</p>
        <p>Lo que sigue no se lee, se hace. Abre la lista, elige <strong>una</strong> empresa
        que te interese de verdad y haz el paso 01: investígala una tarde. El método no
        empieza cuando terminas de leer — empieza cuando eliges a quién.</p>
      </div>
      <div class="fin__ctas">
        <a href="lista.html" class="gbtn"><i class="gbtn__chip l" aria-hidden="true">+</i><span class="gbtn__lbl">Ver dónde están los trabajos</span><i class="gbtn__chip r" aria-hidden="true">+</i></a>
        <button class="link-u" type="button" data-go="0">Volver a leerlo desde el principio</button>
      </div>
    </article>`;

// ── CSS ─────────────────────────────────────────────────────────────────────
/* Mismo sistema que landing.html: tokens de good-fella, radio cero, escala
   fluida 375→1600, Geist. Lo que se agrega acá es lo que una landing no
   necesita y una lectura de ~20 min sí: medida de línea, ritmo vertical y
   los tres temas conmutables con la tecla C. */
const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --font-sans:'Geist',ui-sans-serif,system-ui,-apple-system,sans-serif;
  --font-mono:'Geist Mono',ui-monospace,'Fira Code',monospace;
  --spacing:.0625rem;
  --layout-min-w:375; --layout-max-w:1600;
  --fluid-slope:calc((100vw - calc(var(--spacing)*var(--layout-min-w)))/(var(--layout-max-w) - var(--layout-min-w)));
  --text-h1:clamp(calc(var(--spacing)*30),calc(var(--spacing)*30) + (60 - 30)*var(--fluid-slope),calc(var(--spacing)*60));
  --text-h2:clamp(calc(var(--spacing)*22),calc(var(--spacing)*22) + (30 - 22)*var(--fluid-slope),calc(var(--spacing)*30));
  --text-h3:calc(var(--spacing)*20);
  --text-body:calc(var(--spacing)*17);
  --text-sm:calc(var(--spacing)*15);
  --text-accent:calc(var(--spacing)*13);
  --ease-out-quart:cubic-bezier(.25,1,.5,1);
  --ease-in-out-quart:cubic-bezier(.76,0,.24,1);
  --ease-in-out-quint:cubic-bezier(.83,0,.17,1);
  --idx-w:calc(var(--spacing)*300);
  /* tema OSCURO (por defecto) */
  --bg:#141314; --fg:#eee; --bg-muted:#1a1a1a; --fg-muted:#818081;
  --brand:#fd551d; --brand-muted:#fd8d68;
  --border:#eeeeee1a; --border-muted:#eeeeee0d; --surface:#333;
}
[data-theme="light"]{
  --bg:#eee; --fg:#141314; --bg-muted:#f7f7f7; --fg-muted:#696869;
  --brand:#fb460d; --brand-muted:#fd8d68;
  --border:#0003; --border-muted:#0000001a; --surface:#d5d5d5;
}
/* el tema atrevido de ellos: la página ENTERA del color de marca, tinta negra */
[data-theme="brand"]{
  --bg:#fb460d; --fg:#141314; --bg-muted:#fd7142; --fg-muted:#1a1a1a;
  --brand:#141314; --brand-muted:#1a1a1a;
  --border:#0000004d; --border-muted:#00000026; --surface:#fd8d68;
}
html{-webkit-text-size-adjust:100%}
body{
  background:var(--bg);color:var(--fg);font-family:var(--font-sans);
  font-size:var(--text-body);line-height:1.65;font-weight:400;
  -webkit-font-smoothing:antialiased;
  transition:background-color .5s var(--ease-out-quart),color .5s var(--ease-out-quart);
}
img{max-width:100%;display:block}
button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
a{color:inherit;text-decoration:none}
::selection{background:var(--brand);color:var(--bg)}

/* ── COMPUERTA: el barrido diagonal, igual que en la landing ── */
.carga{position:fixed;inset:0;z-index:9999;overflow:hidden;pointer-events:none}
.carga__sq{
  position:absolute;width:200vmax;height:200vmax;left:50%;bottom:0;margin-left:-100vmax;
  background:var(--brand);transform-origin:100vmax 100%;transform:rotate(-90deg);
}
.carga[data-fase="entrando"] .carga__sq{transition:transform .8s var(--ease-in-out-quart);transform:rotate(0)}
.carga[data-fase="quieto"] .carga__sq{transform:rotate(0);margin-left:calc(-100vmax + 100vw)}
.carga[data-fase="saliendo"] .carga__sq{
  transition:transform .9s var(--ease-in-out-quart);
  margin-left:calc(-100vmax + 100vw);transform:rotate(90deg);
}

/* ── CABECERA ── */
.head{
  position:fixed;top:0;left:0;right:0;z-index:100;height:calc(var(--spacing)*60);
  display:flex;align-items:center;justify-content:space-between;
  padding:0 calc(var(--spacing)*20);
  background:var(--bg);border-bottom:1px solid var(--border);
  transition:background-color .5s var(--ease-out-quart)
}
.head__l{display:flex;align-items:center;gap:calc(var(--spacing)*14)}
.head__m{font-family:var(--font-sans);font-weight:700;font-size:var(--text-sm);letter-spacing:.02em;border:1px solid var(--fg);padding:calc(var(--spacing)*3) calc(var(--spacing)*8)}
.head__t{font-family:var(--font-mono);font-size:var(--text-accent);color:var(--fg-muted);letter-spacing:.08em;text-transform:uppercase}
.head__r{display:flex;align-items:center;gap:calc(var(--spacing)*16)}
.tecla{
  font-family:var(--font-mono);font-size:var(--text-accent);letter-spacing:.06em;
  color:var(--fg-muted);display:flex;align-items:center;gap:calc(var(--spacing)*7);
  transition:color .3s var(--ease-out-quart)
}
.tecla:hover{color:var(--brand)}
.tecla b{border:1px solid var(--border);padding:calc(var(--spacing)*2) calc(var(--spacing)*6);font-weight:400;color:var(--fg)}
.head__idx{display:none}

/* ── ARMAZÓN ── */
.deck{display:flex;padding-top:calc(var(--spacing)*60);min-height:100svh}

/* ── ÍNDICE LATERAL FIJO ── */
.idx{
  width:var(--idx-w);flex:none;position:sticky;top:calc(var(--spacing)*60);
  height:calc(100svh - var(--spacing)*60);overflow-y:auto;
  border-right:1px solid var(--border);padding:calc(var(--spacing)*28) 0 calc(var(--spacing)*16);
  display:flex;flex-direction:column;gap:calc(var(--spacing)*22)
}
.idx__volver{
  font-family:var(--font-mono);font-size:var(--text-accent);color:var(--fg-muted);
  padding:0 calc(var(--spacing)*20);letter-spacing:.06em;transition:color .3s var(--ease-out-quart)
}
.idx__volver:hover{color:var(--brand)}
.idx__g{display:flex;flex-direction:column}
.idx__sec{
  font-family:var(--font-mono);font-size:var(--text-accent);color:var(--brand);
  letter-spacing:.05em;padding:0 calc(var(--spacing)*20) calc(var(--spacing)*8)
}
.idx__p{
  display:flex;align-items:baseline;gap:calc(var(--spacing)*10);width:100%;text-align:left;
  padding:calc(var(--spacing)*7) calc(var(--spacing)*20);
  border-left:2px solid transparent;color:var(--fg-muted);font-size:var(--text-sm);line-height:1.35;
  transition:color .25s var(--ease-out-quart),border-color .25s var(--ease-out-quart),background-color .25s var(--ease-out-quart)
}
.idx__p i{font-family:var(--font-mono);font-size:var(--text-accent);font-style:normal;flex:none;opacity:.7}
.idx__p span{flex:1}
.idx__p em{font-family:var(--font-mono);font-size:var(--text-accent);font-style:normal;opacity:0;flex:none;transition:opacity .25s}
.idx__p:hover{color:var(--fg);background:var(--bg-muted)}
.idx__p:hover em{opacity:.65}
.idx__p.on{color:var(--fg);border-left-color:var(--brand)}
.idx__p.on i{color:var(--brand);opacity:1}
.idx__p.on em{opacity:.65}
.idx__p.leida i::after{content:'·';margin-left:.35em;color:var(--brand)}
.idx__pie{margin-top:auto;padding:calc(var(--spacing)*14) calc(var(--spacing)*20) 0;border-top:1px solid var(--border-muted)}
.idx__bar{display:block;height:2px;background:var(--border);overflow:hidden}
.idx__bar i{display:block;height:100%;width:0;background:var(--brand);transition:width .6s var(--ease-out-quart)}
.idx__pct{
  display:flex;justify-content:space-between;
  font-family:var(--font-mono);font-size:var(--text-accent);color:var(--fg-muted);
  letter-spacing:.06em;margin-top:calc(var(--spacing)*8)
}

/* ── LECTOR ── */
.lect{flex:1;min-width:0;display:flex;justify-content:center;padding:calc(var(--spacing)*56) calc(var(--spacing)*24) calc(var(--spacing)*100)}
.parte{width:100%;max-width:calc(var(--spacing)*720);display:none}
.parte.on{display:block}
.parte__tax{font-family:var(--font-mono);font-size:var(--text-accent);color:var(--brand);letter-spacing:.05em;margin-bottom:calc(var(--spacing)*20)}
.parte__n{display:flex;align-items:baseline;gap:calc(var(--spacing)*8);margin-bottom:calc(var(--spacing)*10);font-family:var(--font-sans);font-weight:300;font-size:calc(var(--spacing)*52);line-height:1;letter-spacing:-.03em}
.parte__n b{font-family:var(--font-mono);font-size:var(--text-accent);font-weight:400;color:var(--fg-muted);letter-spacing:.06em}
.parte h1{font-size:var(--text-h1);line-height:1.05;letter-spacing:-.025em;font-weight:500;margin-bottom:calc(var(--spacing)*32)}
.parte h1 em{font-style:normal;color:var(--brand)}

/* ── PROSA: acá es donde se lee ── */
.prosa{max-width:68ch}
.prosa>*+*{margin-top:calc(var(--spacing)*18)}
.prosa h2{font-size:var(--text-h2);line-height:1.2;letter-spacing:-.015em;font-weight:500;margin-top:calc(var(--spacing)*44)}
.prosa h3{font-size:var(--text-h3);line-height:1.3;font-weight:500;margin-top:calc(var(--spacing)*32)}
.prosa h4{font-size:var(--text-body);font-weight:700;margin-top:calc(var(--spacing)*24)}
.prosa p{color:var(--fg-muted)}
.prosa strong{color:var(--fg);font-weight:700}
.prosa em{font-style:italic}
.prosa a{color:var(--brand);text-decoration:underline;text-underline-offset:.2em}
.prosa ul,.prosa ol{padding-left:calc(var(--spacing)*20);color:var(--fg-muted)}
.prosa li+li{margin-top:calc(var(--spacing)*7)}
.prosa li::marker{color:var(--brand)}
.prosa ul ul{margin-top:calc(var(--spacing)*7);padding-left:calc(var(--spacing)*18)}
/* ── CITA: rompe la columna y se agranda. Son 18 en el documento y casi todas
      son frases que él quiere que se recuerden, no material de relleno. ── */
.prosa blockquote{
  position:relative;margin-top:calc(var(--spacing)*36);margin-bottom:calc(var(--spacing)*36);
  padding:calc(var(--spacing)*4) 0 calc(var(--spacing)*4) calc(var(--spacing)*26);
  border-left:2px solid var(--brand);
  color:var(--fg);font-size:var(--text-h2);line-height:1.28;letter-spacing:-.015em;font-weight:500;
  max-width:none
}
@media(min-width:1200px){ .prosa blockquote{margin-left:calc(var(--spacing)*-48)} }
.prosa blockquote em{font-style:normal}

/* ── NOTA ETIQUETADA: los 21 "**Qué hacer**:", "**El criterio**:"… ── */
.nota{
  border:1px solid var(--border);border-left:2px solid var(--brand);
  background:var(--bg-muted);padding:calc(var(--spacing)*18) calc(var(--spacing)*20);
}
.nota__t{
  display:block;font-family:var(--font-mono);font-size:var(--text-accent);
  color:var(--brand);letter-spacing:.08em;text-transform:uppercase;
  margin-bottom:calc(var(--spacing)*7)
}
.nota p{color:var(--fg);margin:0}

/* ── CASILLAS: el plan de 30 días es una herramienta, no un párrafo ── */
.prosa ul.chk{list-style:none;padding-left:0}
.prosa ul.chk li{margin-top:0}
.prosa ul.chk li+li{margin-top:calc(var(--spacing)*2)}
.prosa ul.chk label{
  display:flex;align-items:flex-start;gap:calc(var(--spacing)*12);cursor:pointer;
  padding:calc(var(--spacing)*10) calc(var(--spacing)*12);
  border:1px solid transparent;
  transition:background-color .25s var(--ease-out-quart),border-color .25s var(--ease-out-quart)
}
.prosa ul.chk label:hover{background:var(--bg-muted);border-color:var(--border)}
.prosa ul.chk input{
  appearance:none;-webkit-appearance:none;flex:none;
  width:calc(var(--spacing)*17);height:calc(var(--spacing)*17);margin-top:calc(var(--spacing)*4);
  border:1px solid var(--fg-muted);background:transparent;cursor:pointer;
  transition:background-color .2s,border-color .2s
}
.prosa ul.chk input:checked{background:var(--brand);border-color:var(--brand)}
.prosa ul.chk input:checked::after{
  content:'';display:block;width:100%;height:100%;
  background:var(--bg);
  clip-path:polygon(16% 52%,38% 72%,84% 24%,92% 34%,38% 88%,8% 60%)
}
.prosa ul.chk input:focus-visible{outline:2px solid var(--brand);outline-offset:2px}
.prosa ul.chk span{color:var(--fg-muted);transition:color .25s,opacity .25s}
.prosa ul.chk input:checked+span{opacity:.45;text-decoration:line-through}

/* contador del plan */
.chk-tot{
  display:flex;align-items:center;justify-content:space-between;gap:calc(var(--spacing)*14);
  font-family:var(--font-mono);font-size:var(--text-accent);color:var(--fg-muted);
  letter-spacing:.06em;border-top:1px solid var(--border);
  margin-top:calc(var(--spacing)*14);padding-top:calc(var(--spacing)*12)
}
.chk-tot b{color:var(--brand);font-weight:400}
.chk-tot button{font-family:inherit;font-size:inherit;color:var(--fg-muted);border-bottom:1px solid currentColor;letter-spacing:.06em}
.chk-tot button:hover{color:var(--brand)}

/* ── PROMPT: pensado para copiar, así que se copia ── */
.prompt{position:relative}
.prompt>pre{margin-top:0}
.prompt__c{
  /* sticky, no absolute: estos bloques miden pantallas enteras y con absolute
     el botón se iba con el scroll justo cuando hacía falta. */
  position:sticky;float:right;top:calc(var(--spacing)*72);right:0;z-index:2;
  margin:calc(var(--spacing)*10) calc(var(--spacing)*10) 0 0;
  font-family:var(--font-mono);font-size:var(--text-accent);letter-spacing:.08em;text-transform:uppercase;
  background:var(--bg);border:1px solid var(--border);color:var(--fg-muted);
  padding:calc(var(--spacing)*6) calc(var(--spacing)*11);
  transition:color .25s,border-color .25s
}
.prompt__c:hover{color:var(--brand);border-color:var(--brand)}
.prompt__c.ok{color:var(--brand);border-color:var(--brand)}
.prosa hr{border:0;border-top:1px solid var(--border);margin:calc(var(--spacing)*36) 0}
.prosa code{font-family:var(--font-mono);font-size:.88em;background:var(--bg-muted);padding:.12em .35em;border:1px solid var(--border-muted)}
.prosa pre{
  background:var(--bg-muted);border:1px solid var(--border);padding:calc(var(--spacing)*18);
  overflow-x:auto;font-size:var(--text-sm)
}
/* pre-wrap, no scroll horizontal: son PROMPTS para leer y copiar, y cortados
   a la derecha se leen como si faltara texto. */
.prosa pre code{background:none;border:0;padding:0;font-size:inherit;line-height:1.55;white-space:pre-wrap;overflow-wrap:break-word}
.tabla-wrap{overflow-x:auto;border:1px solid var(--border)}
.prosa table{border-collapse:collapse;width:100%;font-size:var(--text-sm)}
.prosa th,.prosa td{text-align:left;padding:calc(var(--spacing)*11) calc(var(--spacing)*14);border-bottom:1px solid var(--border);vertical-align:top}
.prosa th{font-family:var(--font-mono);font-size:var(--text-accent);font-weight:400;color:var(--brand);letter-spacing:.05em;text-transform:uppercase;white-space:nowrap}
.prosa td{color:var(--fg-muted)}
.prosa tbody tr:last-child td{border-bottom:0}

/* ── NAV ENTRE PARTES ── */
.parte__nav{display:flex;justify-content:space-between;gap:calc(var(--spacing)*16);margin-top:calc(var(--spacing)*56);padding-top:calc(var(--spacing)*22);border-top:1px solid var(--border)}
.pnav{display:flex;align-items:center;gap:calc(var(--spacing)*12);color:var(--fg-muted);text-align:left;transition:color .3s var(--ease-out-quart)}
.pnav--r{text-align:right}
.pnav:hover{color:var(--brand)}
.pnav__k{font-family:var(--font-mono);font-size:var(--text-h3);flex:none}
.pnav__t{display:flex;flex-direction:column;font-size:var(--text-sm);line-height:1.25}
.pnav__t em{font-family:var(--font-mono);font-size:var(--text-accent);font-style:normal;opacity:.7;letter-spacing:.06em}

/* ── CIERRE ── */
.fin__ctas{display:flex;flex-wrap:wrap;align-items:center;gap:calc(var(--spacing)*16);margin-top:calc(var(--spacing)*40)}
.gbtn{display:inline-flex;align-items:stretch;font-family:var(--font-mono);font-size:var(--text-accent);letter-spacing:.08em;text-transform:uppercase}
.gbtn__lbl{background:var(--brand);color:var(--bg);padding:calc(var(--spacing)*13) calc(var(--spacing)*18);transition:opacity .3s}
.gbtn__chip{background:var(--brand);color:var(--bg);display:flex;align-items:center;padding:0 calc(var(--spacing)*9);font-style:normal;transition:opacity .3s}
.gbtn__chip.l{display:none}
.gbtn:hover .gbtn__lbl,.gbtn:hover .gbtn__chip{opacity:.82}
.link-u{border-bottom:1px solid currentColor;padding-bottom:2px;font-size:var(--text-sm);transition:color .3s var(--ease-out-quart)}
.link-u:hover{color:var(--brand)}

/* ── REVELADO AL LEER ────────────────────────────────────────────────────
   Cada bloque de prosa sube y aparece cuando entra en pantalla. Es lo que
   convierte el scroll en avance en vez de en desplazamiento: el ojo recibe
   una cosa a la vez. Sutil a propósito (8px, no 40): en 18 minutos de lectura
   una animación grande cansa y estorba. */
.prosa>*{opacity:0;transform:translateY(calc(var(--spacing)*8));transition:opacity .5s var(--ease-out-quart),transform .5s var(--ease-out-quart)}
.prosa>*.vis{opacity:1;transform:none}
.parte h1,.parte__tax,.parte__n{transition:opacity .5s var(--ease-out-quart),transform .5s var(--ease-out-quart)}
.parte.on h1,.parte.on .parte__tax,.parte.on .parte__n{opacity:1;transform:none}

/* ── AVANCE DENTRO DE LA PARTE: hilo bajo la cabecera ── */
.hilo{position:fixed;top:calc(var(--spacing)*60);left:0;height:2px;background:var(--brand);width:0;z-index:99;transition:width .12s linear}

/* ── ODÓMETRO ── */
.odo{display:inline-flex;align-items:flex-end;overflow:hidden;line-height:1;vertical-align:baseline}
.odo__col{position:relative;display:flex;flex-direction:column;align-items:center;overflow:hidden;height:1em}
.odo__reel{display:flex;flex-direction:column;will-change:transform;transform:translateY(0);transition:transform 1.1s var(--ease-in-out-quint)}
.odo__reel>span{height:1em;display:flex;align-items:center;justify-content:center;line-height:1}

/* ── AVISO DE REANUDAR ── */
.seguir{
  position:fixed;left:50%;bottom:calc(var(--spacing)*24);transform:translate(-50%,calc(var(--spacing)*80));
  z-index:200;display:flex;align-items:center;gap:calc(var(--spacing)*14);
  background:var(--bg-muted);border:1px solid var(--border);
  padding:calc(var(--spacing)*12) calc(var(--spacing)*16);
  font-size:var(--text-sm);opacity:0;pointer-events:none;
  transition:transform .6s var(--ease-out-quart),opacity .6s var(--ease-out-quart)
}
.seguir.on{transform:translate(-50%,0);opacity:1;pointer-events:auto}
.seguir button{font-family:var(--font-mono);font-size:var(--text-accent);letter-spacing:.06em;text-transform:uppercase;color:var(--brand);border-bottom:1px solid currentColor}
.seguir .x{color:var(--fg-muted);font-size:var(--text-body);border:0}

/* ── MÓVIL: el índice se vuelve un panel ── */
@media(max-width:1023px){
  :root{--text-body:calc(var(--spacing)*16)}
  .head__idx{display:flex}
  .idx{
    position:fixed;top:calc(var(--spacing)*60);left:0;bottom:0;width:min(88vw,calc(var(--spacing)*330));
    background:var(--bg);z-index:90;transform:translateX(-101%);
    transition:transform .45s var(--ease-in-out-quart);height:auto
  }
  .idx.abierto{transform:translateX(0)}
  .velo{position:fixed;inset:calc(var(--spacing)*60) 0 0;background:#0009;z-index:89;opacity:0;pointer-events:none;transition:opacity .45s}
  .velo.on{opacity:1;pointer-events:auto}
  .lect{padding:calc(var(--spacing)*32) calc(var(--spacing)*20) calc(var(--spacing)*80)}
  .parte__n{font-size:calc(var(--spacing)*40)}
  .parte__nav{flex-direction:column;align-items:stretch;gap:calc(var(--spacing)*20)}
  .pnav--r{flex-direction:row-reverse;justify-content:flex-start;text-align:left}
}
@media(prefers-reduced-motion:reduce){
  *{animation-duration:.01ms!important;transition-duration:.01ms!important}
}`;

// ── JS ──────────────────────────────────────────────────────────────────────
/* Sin template literals adentro a propósito: este string vive dentro de uno. */
const JS = `
(function(){
  var partes = [].slice.call(document.querySelectorAll('.parte'));
  var items  = [].slice.call(document.querySelectorAll('.idx__p'));
  var TOTAL  = ${partes.length};
  var idxEl  = document.getElementById('idx');
  var velo   = document.getElementById('velo');
  var barra  = document.getElementById('barra');
  var pct    = document.getElementById('pct');
  var actual = -1;
  var LS='pvp-parte', LSTEMA='pvp-tema', LSLEIDAS='pvp-leidas';

  var leidas = {};
  try{ leidas = JSON.parse(localStorage.getItem(LSLEIDAS)||'{}'); }catch(e){}

  /* ── odómetro: los dígitos ruedan, no se escriben ── */
  function armarOdo(el){
    var s = el.getAttribute('data-odo');
    if(el.dataset.listo) return; el.dataset.listo='1'; el.innerHTML='';
    s.split('').forEach(function(ch){
      var col=document.createElement('span'); col.className='odo__col';
      var reel=document.createElement('span'); reel.className='odo__reel';
      for(var v=0;v<2;v++){ for(var d=0;d<=9;d++){ var x=document.createElement('span'); x.textContent=d; reel.appendChild(x); } }
      col.appendChild(reel); col.dataset.target=ch; el.appendChild(col);
    });
  }
  function rodar(el){
    if(!el) return; armarOdo(el);
    [].slice.call(el.querySelectorAll('.odo__col')).forEach(function(col,i){
      col.querySelector('.odo__reel').style.transform='translateY(0)';
      setTimeout(function(){
        col.querySelector('.odo__reel').style.transform='translateY(-'+(parseInt(col.dataset.target,10)+10)+'em)';
      }, 60+i*110);
    });
  }

  /* ── revelado: cada bloque aparece al entrar en pantalla ── */
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var obs = reduce ? null : new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('vis'); obs.unobserve(e.target); } });
  }, {rootMargin:'0px 0px -8% 0px', threshold:.01});
  function revelar(art){
    var bloques=[].slice.call(art.querySelectorAll('.prosa>*'));
    if(reduce){ bloques.forEach(function(b){ b.classList.add('vis'); }); return; }
    bloques.forEach(function(b){ b.classList.remove('vis'); obs.observe(b); });
    /* lo que ya entra en la primera pantalla se muestra sin esperar scroll */
    requestAnimationFrame(function(){
      bloques.forEach(function(b){ if(b.getBoundingClientRect().top < innerHeight*.92) b.classList.add('vis'); });
    });
  }

  /* ── hilo de avance dentro de la parte ── */
  var hilo=document.getElementById('hilo');
  function pintarHilo(){
    if(!hilo) return;
    var max=document.documentElement.scrollHeight-innerHeight;
    hilo.style.width = (max>40 ? Math.min(100, scrollY/max*100) : 0)+'%';
  }
  addEventListener('scroll', pintarHilo, {passive:true});
  addEventListener('resize', pintarHilo);

  /* ── casillas del plan de 30 días: se recuerdan ── */
  var LSCHK='pvp-chk';
  var marcadas={};
  try{ marcadas=JSON.parse(localStorage.getItem(LSCHK)||'{}'); }catch(e){}
  function montarCasillas(){
    [].slice.call(document.querySelectorAll('ul.chk')).forEach(function(ul,iu){
      if(ul.dataset.listo) return; ul.dataset.listo='1';
      var cajas=[].slice.call(ul.querySelectorAll('input[type=checkbox]'));
      cajas.forEach(function(c,i){
        /* La clave lleva el índice de la LISTA además del de la casilla: el plan
           tiene 4 listas (una por semana) y sin eso marcar la semana 1 marcaba
           la misma posición en las otras tres. */
        var k=(ul.closest('.parte').dataset.p)+'-'+iu+'-'+i;
        c.dataset.k=k;
        if(marcadas[k]) c.checked=true;
        c.addEventListener('change', function(){
          if(c.checked) marcadas[k]=1; else delete marcadas[k];
          try{ localStorage.setItem(LSCHK, JSON.stringify(marcadas)); }catch(e){}
          pintarTotal(ul,cajas);
        });
      });
      var pie=document.createElement('div'); pie.className='chk-tot';
      pie.innerHTML='<span></span><button type="button">Reiniciar</button>';
      ul.after(pie);
      pie.querySelector('button').addEventListener('click', function(){
        cajas.forEach(function(c){ c.checked=false; delete marcadas[c.dataset.k]; });
        try{ localStorage.setItem(LSCHK, JSON.stringify(marcadas)); }catch(e){}
        pintarTotal(ul,cajas);
      });
      pintarTotal(ul,cajas);
    });
  }
  function pintarTotal(ul,cajas){
    var pie=ul.nextElementSibling; if(!pie||!pie.classList.contains('chk-tot')) return;
    var n=cajas.filter(function(c){return c.checked;}).length;
    pie.querySelector('span').innerHTML='<b>'+n+'</b> de '+cajas.length+' hechas';
  }

  /* ── prompts: existen para copiarse ── */
  function montarPrompts(){
    [].slice.call(document.querySelectorAll('.prosa pre')).forEach(function(pre){
      if(pre.dataset.listo) return; pre.dataset.listo='1';
      var caja=document.createElement('div'); caja.className='prompt';
      pre.parentNode.insertBefore(caja,pre); caja.appendChild(pre);
      var b=document.createElement('button');
      b.type='button'; b.className='prompt__c'; b.textContent='Copiar';
      b.addEventListener('click', function(){
        var txt=pre.querySelector('code').textContent;
        function hecho(){ b.textContent='Copiado ✓'; b.classList.add('ok');
          setTimeout(function(){ b.textContent='Copiar'; b.classList.remove('ok'); },1800); }
        if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(hecho,function(){}); }
        else { var t=document.createElement('textarea'); t.value=txt; document.body.appendChild(t);
               t.select(); try{document.execCommand('copy');hecho();}catch(e){} t.remove(); }
      });
      caja.insertBefore(b, pre);
    });
  }

  function pintarIndice(){
    items.forEach(function(b){
      var id=+b.dataset.go;
      b.classList.toggle('on', id===actual);
      b.classList.toggle('leida', !!leidas[id] && id!==actual);
    });
    var hechas=Object.keys(leidas).length;
    var p=Math.round(hechas/TOTAL*100);
    if(barra) barra.style.width=p+'%';
    if(pct) pct.innerHTML='<span>'+hechas+' de '+TOTAL+'</span><span>'+p+'%</span>';
  }

  function ir(n, opts){
    opts=opts||{};
    if(n<0||n>=partes.length||n===actual) return;
    actual=n;
    partes.forEach(function(a,i){ a.classList.toggle('on', i===n); });
    if(n<TOTAL){
      leidas[n]=1;
      try{ localStorage.setItem(LSLEIDAS, JSON.stringify(leidas)); localStorage.setItem(LS, n); }catch(e){}
    }
    pintarIndice();
    rodar(partes[n].querySelector('.odo'));
    revelar(partes[n]);
    montarCasillas();
    montarPrompts();
    requestAnimationFrame(pintarHilo);
    var id = partes[n].id;
    if(!opts.silencioso && id) history.replaceState(null,'','#'+id);
    if(!opts.sinScroll) window.scrollTo(0,0);
    cerrarPanel();
  }

  /* ── barrido diagonal entre partes: el cambio se siente un evento ── */
  var capa=document.getElementById('carga'), animando=false;
  function irConBarrido(n){
    if(animando||n===actual||n<0||n>=partes.length){ return; }
    if(!capa||matchMedia('(prefers-reduced-motion: reduce)').matches){ ir(n); return; }
    animando=true;
    capa.style.display='block'; capa.dataset.fase='entrando';
    setTimeout(function(){
      ir(n);
      capa.dataset.fase='quieto';
      requestAnimationFrame(function(){ requestAnimationFrame(function(){
        capa.dataset.fase='saliendo';
        setTimeout(function(){ capa.style.display='none'; animando=false; }, 950);
      });});
    }, 820);
  }

  items.forEach(function(b){ b.addEventListener('click', function(){ irConBarrido(+b.dataset.go); }); });
  document.addEventListener('click', function(e){
    var n=e.target.closest('[data-nav]'); if(n){ irConBarrido(+n.dataset.nav); return; }
    var g=e.target.closest('[data-go]'); if(g && !g.classList.contains('idx__p')){ irConBarrido(+g.dataset.go); return; }
    if(e.target.closest('[data-fin]')){ irConBarrido(TOTAL); }
  });

  /* ── teclado: esto es lo que lo vuelve un instrumento ── */
  var TEMAS=['dark','light','brand'];
  function tema(t){
    document.documentElement.setAttribute('data-theme',t);
    try{ localStorage.setItem(LSTEMA,t); }catch(e){}
  }
  document.addEventListener('keydown', function(e){
    if(e.metaKey||e.ctrlKey||e.altKey) return;
    var t=e.target.tagName; if(t==='INPUT'||t==='TEXTAREA') return;
    if(e.key==='ArrowRight'){ e.preventDefault(); irConBarrido(actual+1); }
    else if(e.key==='ArrowLeft'){ e.preventDefault(); irConBarrido(actual-1); }
    else if(e.key==='c'||e.key==='C'){
      var cur=document.documentElement.getAttribute('data-theme')||'dark';
      tema(TEMAS[(TEMAS.indexOf(cur)+1)%TEMAS.length]);
    }
  });
  var btnTema=document.getElementById('btema');
  if(btnTema) btnTema.addEventListener('click', function(){
    var cur=document.documentElement.getAttribute('data-theme')||'dark';
    tema(TEMAS[(TEMAS.indexOf(cur)+1)%TEMAS.length]);
  });

  /* ── panel del índice en móvil ── */
  function abrirPanel(){ idxEl.classList.add('abierto'); velo.classList.add('on'); }
  function cerrarPanel(){ if(idxEl){ idxEl.classList.remove('abierto'); } if(velo){ velo.classList.remove('on'); } }
  var bIdx=document.getElementById('bidx');
  if(bIdx) bIdx.addEventListener('click', function(){
    idxEl.classList.contains('abierto') ? cerrarPanel() : abrirPanel();
  });
  if(velo) velo.addEventListener('click', cerrarPanel);

  /* ── arranque: hash > donde quedó > principio ── */
  try{ var g=localStorage.getItem(LSTEMA); if(g) document.documentElement.setAttribute('data-theme',g); }catch(e){}

  function deLaUrl(){
    var m=(location.hash||'').match(/^#parte-(\\d+|fin)$/);
    return m ? (m[1]==='fin' ? TOTAL : (+m[1]-1)) : -1;
  }
  /* Sin esto, llegar a #parte-7 desde un enlace externo —o el botón atrás—
     no movía nada: el hash se leía UNA sola vez, al cargar. */
  addEventListener('hashchange', function(){
    var n=deLaUrl();
    if(n>=0 && n<partes.length && n!==actual) ir(n,{silencioso:true});
  });

  var deHash=deLaUrl();

  var guardada=-1;
  try{ var v=localStorage.getItem(LS); if(v!==null) guardada=+v; }catch(e){}

  if(deHash>=0 && deHash<partes.length){ ir(deHash,{silencioso:true}); }
  else {
    ir(0,{silencioso:true});
    /* Que la página te DIGA dónde quedaste vale más que recordarlo en silencio:
       sin aviso, quien vuelve reempieza desde cero sin saber que había marca. */
    if(guardada>0 && guardada<TOTAL){
      var av=document.getElementById('seguir');
      var t=document.getElementById('seguir-t');
      if(av&&t){
        t.textContent='Te quedaste en la parte '+String(guardada+1).padStart(2,'0');
        setTimeout(function(){ av.classList.add('on'); }, 900);
        document.getElementById('seguir-ir').addEventListener('click', function(){
          av.classList.remove('on'); irConBarrido(guardada);
        });
        document.getElementById('seguir-x').addEventListener('click', function(){ av.classList.remove('on'); });
        setTimeout(function(){ av.classList.remove('on'); }, 12000);
      }
    }
  }
  pintarIndice();
})();`;

// ── HTML ────────────────────────────────────────────────────────────────────
const URL_BASE = 'https://moiwalter.github.io/pvp-web/';
const html = `<!DOCTYPE html>
<html lang="es" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>El método PVP — ${partes.length} partes, completo y abierto</title>

<meta name="description" content="El método PVP completo: ${partes.length} partes para conseguir trabajo remoto desde Bolivia sin portafolio, sin contactos y sin inglés avanzado. Gratis, sin registro.">
<link rel="canonical" href="${URL_BASE}pvp.html">
<meta property="og:type" content="article">
<meta property="og:title" content="El método PVP — ${partes.length} partes, completo y abierto">
<meta property="og:description" content="Investiga una startup, encuentra un problema, resuélvelo antes de que te lo pidan. El método entero, gratis y sin registro.">
<meta property="og:url" content="${URL_BASE}pvp.html">
<meta property="og:image" content="${URL_BASE}hero.webp">
<meta name="twitter:card" content="summary_large_image">

<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='%23141314'/><text x='50%25' y='56%25' font-family='Georgia,serif' font-size='19' font-weight='700' fill='%23fd551d' text-anchor='middle' dominant-baseline='middle'>M</text></svg>">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">

<!-- ⚠️ GENERADO por content/render-pvp.mjs — no editar a mano.
     Fuente: content/pvp/*.md + content/pvp-indice.json
     El markdown se hornea en build: ya no hay marked desde CDN. -->
<style>${CSS}
</style>
</head>
<body>

<div class="carga" id="carga" data-fase="entrando" aria-hidden="true" style="display:none"><div class="carga__sq"></div></div>

<header class="head">
  <div class="head__l">
    <a href="./" class="head__m">Moi</a>
    <span class="head__t">El método PVP</span>
  </div>
  <div class="head__r">
    <button class="tecla head__idx" id="bidx" type="button" aria-label="Índice"><b>☰</b><span>Índice</span></button>
    <button class="tecla" id="btema" type="button" aria-label="Cambiar tema"><b>C</b><span>Tema</span></button>
  </div>
</header>

<i class="hilo" id="hilo" aria-hidden="true"></i>
<div class="velo" id="velo"></div>

<div class="deck">
  <aside class="idx" id="idx">
    <a href="./" class="idx__volver">← Volver al inicio</a>
${indiceHtml}
    <div class="idx__pie">
      <span class="idx__bar"><i id="barra"></i></span>
      <span class="idx__pct" id="pct"></span>
    </div>
  </aside>

  <main class="lect">
${partesHtml}
${finHtml}
  </main>
</div>

<div class="seguir" id="seguir">
  <span id="seguir-t"></span>
  <button id="seguir-ir" type="button">Seguir ahí</button>
  <button class="x" id="seguir-x" type="button" aria-label="Cerrar">×</button>
</div>

<script>${JS}
</script>
</body>
</html>
`;

writeFileSync(join(RAIZ, 'pvp.html'), html, 'utf8');

// ── selftest ────────────────────────────────────────────────────────────────
const problemas = [];
const VOSEO = /\b(agendá|sos|pasalo|evitá|usala|usá|tenés|hacés|podés|querés|sabés|andá|mirá|dejá|probá|elegí)\b/gi;
for (const p of partes) {
  const v = p.texto.match(VOSEO);
  if (v) problemas.push(`voseo en la parte ${p.id + 1}: ${[...new Set(v)].join(', ')}`);
  if (!p.texto.trim()) problemas.push(`parte ${p.id + 1} quedó vacía`);
}
if (/cal\.com|calendly|agendar una llamada/i.test(html)) problemas.push('quedó un enlace de booking');
/* Busca un <script src> externo de verdad, no la palabra "marked" (que aparece
   en el comentario que explica por qué ya no está). Las fuentes de Google son
   <link>, no <script>, y son la misma dependencia que ya tiene la landing. */
const scriptsExternos = (html.match(/<script[^>]+src=["'][^"']+["']/gi) || []);
if (scriptsExternos.length) problemas.push(`quedó JS externo: ${scriptsExternos.join(', ')}`);
const enIndice = (html.match(/class="idx__p"/g) || []).length;
if (enIndice !== partes.length) problemas.push(`el índice lista ${enIndice}, deberían ser ${partes.length}`);

console.log(`pvp.html generado · ${partes.length} partes · ${partes.reduce((a, p) => a + p.palabras, 0)} palabras · ${totalMin} min · ${(html.length / 1024).toFixed(0)} KB`);
partes.forEach(p => console.log(`   ${nn(p.id + 1)}  ${String(p.palabras).padStart(3)} pal  ${p.min} min  ${p.titulo}`));
if (problemas.length) { console.error('\nPROBLEMAS:\n' + problemas.map(s => ' · ' + s).join('\n')); process.exit(1); }
console.log('\nselftest ok: sin voseo, sin booking, sin CDN, índice completo');
