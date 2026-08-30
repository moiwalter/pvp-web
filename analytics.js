/* ══════════════════════════════════════════════════════════════════════════
   analytics.js — GA4 para las 4 páginas de pvp-web
   ──────────────────────────────────────────────────────────────────────────
   ⚠️ SE CARGA SIEMPRE COMO ARCHIVO LOCAL:  <script defer src="analytics.js">
      El loader de Google se inyecta DESDE ACÁ, nunca con un <script src>
      remoto en el HTML. Dos razones, las dos duras:
        1. El selftest de content/render-pvp.mjs (~línea 808) aborta el build
           si encuentra JS remoto en pvp.html. Y tiene razón: un CDN caído ya
           dejó esta página en blanco una vez.
        2. Si googletagmanager no responde, este archivo ya corrió y la página
           funciona igual. La medición es opcional; la página no.

   PARA ENCENDERLO: pega el Measurement ID en GA_ID, acá abajo. Es el único
   lugar donde vive. Con GA_ID vacío el archivo es inerte (no pide red) pero
   los eventos se siguen imprimiendo en consola — sirve para verificar la
   instrumentación antes de tener la propiedad.

   PARA AGREGAR UN EVENTO NUEVO: no se toca este archivo. Se le pone al
   elemento un atributo  data-ga="nombre_del_evento"  y, si hace falta,
   data-ga-loquesea="valor"  → llega como parámetro. Ver ANALYTICS.md.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var GA_ID = '';   /* ← pega acá el Measurement ID (G-XXXXXXXXXX) */

  var DEBUG = !GA_ID || location.search.indexOf('gadebug') !== -1 ||
              location.hostname === 'localhost' || location.hostname === '127.0.0.1';

  /* ── 1. gtag ──────────────────────────────────────────────────────────── */
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());

  /* ── 2. De dónde vino ──────────────────────────────────────────────────
     El QR impreso en los videos apunta a lista.html PELADO y no se puede
     cambiar (ya está en videos publicados), así que no hay ?utm_source que
     valga. Lo que sí se puede separar son los orígenes que importan:

       interno     · venía de otra página de este mismo sitio
       inapp_*     · navegador dentro de TikTok/Instagram → tocó el link de bio
       directo     · sin referrer: escaneó el QR con la cámara, o tecleó la URL
       <host>      · un buscador o cualquier otro sitio

     ⚠️ "directo" NO es lo mismo que "QR": también cae ahí quien guardó el
     link. Pero sin tocar un QR ya impreso, es lo más cerca que se llega.
     Los links NUEVOS que salgan en videos deberían llevar ?f=qr y entonces
     esto se vuelve exacto — ese parámetro ya se lee más abajo. */
  function origen() {
    var forzado = (location.search.match(/[?&]f=([a-z0-9_-]{1,20})/i) || [])[1];
    if (forzado) return forzado.toLowerCase();

    var ref = document.referrer || '';
    var ua  = navigator.userAgent || '';

    if (ref && ref.indexOf('//' + location.host) !== -1) return 'interno';
    if (/BytedanceWebview|musical_ly|Trill|TikTok/i.test(ua)) return 'inapp_tiktok';
    if (/Instagram/i.test(ua))   return 'inapp_instagram';
    if (/FBAN|FBAV|FB_IAB/i.test(ua)) return 'inapp_facebook';
    if (/LinkedInApp/i.test(ua)) return 'inapp_linkedin';
    if (!ref) return 'directo';
    try { return new URL(ref).hostname.replace(/^www\./, ''); } catch (e) { return 'otro'; }
  }

  function pagina() {
    var f = location.pathname.split('/').pop() || 'index.html';
    return f.replace(/\.html$/, '') || 'index';
  }

  /* Van pegados a TODOS los eventos, no sólo al page_view: así el embudo se
     puede segmentar por origen en cualquier paso, no sólo en la entrada.
     Se mezclan a mano en vez de confiar en que los params de config se
     propaguen — eso depende de detalles de gtag que cambian sin aviso. */
  var COMUNES = { origen: origen(), pagina: pagina() };

  if (GA_ID) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    (document.head || document.documentElement).appendChild(s);
    /* debug_mode hace que estos eventos aparezcan EN VIVO en el DebugView de
       GA4 (Admin → DebugView), que es la única forma de verificar sin esperar
       24-48h a los informes estándar. Sólo se manda desde localhost o con
       ?gadebug — el tráfico real nunca lo lleva. */
    gtag('config', GA_ID, DEBUG ? Object.assign({ debug_mode: true }, COMUNES) : COMUNES);
  }

  /* ── 3. El emisor ─────────────────────────────────────────────────────── */
  function ev(nombre, params) {
    var p = { origen: COMUNES.origen, pagina: COMUNES.pagina };
    if (DEBUG) p.debug_mode = true;
    if (params) for (var k in params) {
      var v = params[k];
      if (v === undefined || v === null || v === '') continue;
      /* GA4 corta los valores en 100 caracteres. Mejor cortarlos acá, donde
         se ve, que allá, donde el dato aparece truncado sin explicación. */
      p[k] = (typeof v === 'number') ? v : String(v).slice(0, 100);
    }
    if (GA_ID) gtag('event', nombre, p);
    if (DEBUG) console.log('[ga]', nombre, p);
  }
  window.moiEv = ev;   /* pvp.html lo usa para casillas y prompts */

  /* ── 4. Capa declarativa: data-ga en el HTML ──────────────────────────
     data-ga="nombre"        → dispara ese evento
     data-ga-lugar="header"  → llega como parámetro  lugar="header"
     Un <a> a otro dominio SIN data-ga dispara "salida" solo, con el host
     como destino: los 11 links de bolsas de trabajo no necesitan marcado.

     Captura (true) para que corra aunque alguien detenga la propagación.
     No hace falta preventDefault ni retrasar la navegación: GA4 manda por
     navigator.sendBeacon, que sobrevive a que la página se descargue. */
  function datos(el) {
    var out = {};
    for (var k in el.dataset) {
      if (k.length > 2 && k.slice(0, 2) === 'ga') {
        var nombre = k.slice(2)
          .replace(/([A-Z])/g, function (m, c) { return '_' + c.toLowerCase(); })
          .replace(/^_/, '');
        out[nombre] = el.dataset[k];
      }
    }
    return out;
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var el = t.closest('[data-ga], a[href]');
    if (!el) return;

    if (el.dataset && el.dataset.ga) { ev(el.dataset.ga, datos(el)); return; }

    var href = el.getAttribute('href') || '';
    if (!/^https?:/i.test(href)) return;          /* relativo = navegación interna */
    var host;
    try { host = new URL(el.href).hostname.replace(/^www\./, ''); } catch (_) { return; }
    if (host === location.hostname) return;

    var extra = datos(el);
    extra.destino = host;
    ev('salida', extra);
  }, true);

  if (DEBUG) {
    console.log('[ga] ' + (GA_ID ? GA_ID : 'SIN ID — sólo consola') +
                ' · pagina=' + COMUNES.pagina + ' · origen=' + COMUNES.origen);
  }
})();
