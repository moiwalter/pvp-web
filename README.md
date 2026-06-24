# PVP — Trabajo remoto desde Bolivia

Guía interactiva del método PVP (Permissionless Value Proposition) para conseguir trabajo remoto desde Bolivia.

## Deployment

Conectado a Netlify. Push a `main` → deploy automático.

## Configuración

Edita el objeto `CONFIG` al inicio del `<script>` en `index.html`:

```js
const CONFIG = {
  precio:    "XX",          // Precio en USD de la asesoría
  notionURL: "TU_URL_AQUI"  // Link a Notion para reservar horario
};
```

## Archivos que debes agregar manualmente

| Archivo | Descripción |
|---------|-------------|
| `qr-pago.png` | QR de tu método de pago |
| `og-cover.png` | Imagen para preview en redes (1200 × 630 px) |

## Estructura

```
/
├── index.html      — Página principal (todo el contenido)
├── hero.png        — Imagen del hero
├── 404.html        — Página de error
├── robots.txt      — Instrucciones para buscadores
├── sitemap.xml     — Mapa del sitio (actualizar con dominio real)
├── netlify.toml    — Configuración de Netlify
└── .gitignore
```

## Dominio

Cuando tengas el dominio, reemplaza `TU_DOMINIO.COM` en:
- `robots.txt`
- `sitemap.xml`
- `index.html` (meta og:url si la agregas)
