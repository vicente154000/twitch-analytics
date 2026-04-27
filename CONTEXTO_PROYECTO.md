# Contexto del Proyecto: Kebab Anime Explorer

> Generado el 2026-04-27 — Proyecto React + Vite para explorar animes usando la API de Jikan (MyAnimeList).

---

## 📦 Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Framework | React 19.1.1 |
| Bundler | Vite 7.1.3 |
| Lenguaje | JavaScript (JSX) |
| Enrutador | React Router DOM 6.30.1 |
| Linter | ESLint 9 con plugins de React |
| API Externa | [Jikan v4](https://docs.api.jikan.moe/) (API no oficial de MyAnimeList) |
| Estilos | CSS vanilla con variables CSS (dark theme) |
| Fuentes | Manrope (700, 800) + Inter (400, 700) via Google Fonts |

---

## 🏗️ Estructura del Proyecto

```
proyecto-final-kebab/
├── index.html                    # Entry point HTML (lang="es")
├── package.json                  # Dependencias y scripts
├── vite.config.js                # Configuración de Vite (plugin React)
├── eslint.config.js              # Configuración de ESLint
├── CONTEXTO_PROYECTO.md          # ← Este archivo
├── plans/
│   └── renombrar-variables-espanol.md   # Plan de refactor: renombrar a español
└── src/
    ├── main.jsx                  # Punto de entrada React (BrowserRouter)
    ├── App.jsx                   # Configuración de rutas
    ├── styles.css                # Estilos globales (753 líneas, dark theme)
    ├── hooks/
    │   └── useAsync.js           # Hook personalizado para peticiones asíncronas
    ├── services/
    │   └── jikan.js              # Cliente API Jikan (fetch)
    ├── utils/
    │   └── anime.js              # Utilidades de formateo de datos de anime
    ├── components/
    │   ├── AnimeCard.jsx         # Tarjeta de anime para grillas
    │   ├── Layout.jsx            # Layout principal (top bar + bottom nav)
    │   └── Pagination.jsx        # Componente de paginación
    └── pages/
        ├── Home.jsx              # Página de inicio (trending, featured, géneros)
        ├── Explorar.jsx          # Página de búsqueda con filtros
        └── Detalles.jsx          # Página de detalle de anime
```

---

## 🧩 Arquitectura y Flujo de Datos

### 1. [`src/main.jsx`](src/main.jsx) — Entry Point
- Renderiza `<App />` dentro de `<StrictMode>` y `<BrowserRouter>`.
- Importa `styles.css` global.

### 2. [`src/App.jsx`](src/App.jsx) — Router
- Define 3 rutas anidadas dentro de `<Layout />`:
  - `/` → `Inicio` (Home)
  - `/anime` → `ListaAnime` (Explorar)
  - `/anime/:id` → `DetalleAnime` (Detalles)
  - `*` → redirect a `/`

### 3. [`src/hooks/useAsync.js`](src/hooks/useAsync.js) — Hook Core
- **Propósito**: Ejecuta una función fábrica asíncrona y maneja el estado (`idle`, `loading`, `success`, `error`).
- **Características**:
  - Usa `AbortController` para cancelar peticiones al desmontar.
  - Usa un contador (`idSolicitudRef`) para evitar race conditions (si se inician múltiples solicitudes seguidas, solo la última actualiza el estado).
  - Guarda la fábrica en una ref para no incluirla en las deps del `useEffect`.
- **Retorna**: `{ status, data, error }`

### 4. [`src/services/jikan.js`](src/services/jikan.js) — API Client
- **Base URL**: `https://api.jikan.moe/v4`
- **Funciones exportadas**:
  - `obtenerTopAnime({ page, limit, signal })` → `GET /top/anime`
  - `obtenerTemporadaActual({ page, limit, signal })` → `GET /seasons/now`
  - `buscarAnime({ q, page, limit, type, status, rating, order_by, sort, signal })` → `GET /anime`
  - `obtenerAnimePorId({ id, signal })` → `GET /anime/{id}/full`
  - `obtenerPersonajesAnime({ id, signal })` → `GET /anime/{id}/characters`
  - `obtenerImagenesAnime({ id, signal })` → `GET /anime/{id}/pictures`
- **Manejo de errores**: Lanza `Error` con código HTTP y detalles si `!response.ok`.

### 5. [`src/utils/anime.js`](src/utils/anime.js) — Helpers
- `tituloAnime(anime)` → Extrae el mejor título disponible (title → title_english → title_japanese → "Anime").
- `posterAnime(anime)` → Extrae la mejor URL de imagen disponible (webp > jpg, large > normal).
- `unirGeneros(anime)` → Une los nombres de géneros en string separado por coma.

### 6. [`src/components/Layout.jsx`](src/components/Layout.jsx) — Shell
- **Top bar**: Logo "NEOANIME" + icono de búsqueda (link a `/anime`).
- **Bottom nav**: 4 items (HOME, BROWSE, LIBRARY, PROFILE) — los últimos 3 apuntan a `/anime`.
- **Responsive**: Mobile-first, max-width 430px centrado.

### 7. [`src/components/AnimeCard.jsx`](src/components/AnimeCard.jsx) — Card
- Props: `anime` (objeto de Jikan).
- Muestra: poster, título, puntuación, tipo, año.
- Envuelto en `<Link to={/anime/${mal_id}}>`.

### 8. [`src/components/Pagination.jsx`](src/components/Pagination.jsx) — Paginación
- Props: `pagina`, `tieneAnterior`, `tieneSiguiente`, `alAnterior`, `alSiguiente`.
- Botones "← Anterior" y "Siguiente →" con disabled.

### 9. [`src/pages/Home.jsx`](src/pages/Home.jsx) — Página de Inicio
- **Secciones**:
  1. **Buscador**: Input con `onKeyDown` que navega a `/anime?q=...`.
  2. **Chips de categorías**: ACTION, SCI-FI, SEINEN, CYBERPUNK, CLASSIC (estáticos).
  3. **Trending Now**: Hero card (primer anime del top) + mini card (segundo).
  4. **Featured Titles**: Carrusel horizontal con la temporada actual.
  5. **Discover by Genre**: Grid de 6 botones de género que navegan a búsqueda.
- Usa `useAsync` con `obtenerTopAnime` y `obtenerTemporadaActual`.

### 10. [`src/pages/Explorar.jsx`](src/pages/Explorar.jsx) — Búsqueda
- **Filtros**: Search (texto), Type (select), Status (select), Rating (select).
- **Estrategia de estado**: Usa `borrador` local para el formulario y solo actualiza `URLSearchParams` al enviar (evita entradas en historial por cada pulsación).
- **Paginación**: Botones anterior/siguiente + total aproximado.
- **Grid de resultados**: 2 columnas (3 en desktop).

### 11. [`src/pages/Detalles.jsx`](src/pages/Detalles.jsx) — Detalle de Anime
- **3 llamadas en paralelo** con `Promise.all`:
  - Detalle principal (`/anime/{id}/full`) — obligatorio.
  - Personajes (`/anime/{id}/characters`) — con catch, opcional.
  - Imágenes (`/anime/{id}/pictures`) — con catch, opcional.
- **Secciones**: Hero con overlay, sinopsis, personajes principales (hasta 6), galería de concept art (hasta 9).
- **Título**: Primera palabra en color texto, resto en color acento.

---

## 🎨 Sistema de Diseño (CSS)

### Tokens CSS (variables)
| Variable | Valor | Uso |
|---|---|---|
| `--bg` | `#131313` | Fondo principal |
| `--surface` | `#1b1b1b` | Superficies |
| `--surface2` | `#2a2a2a` | Superficies secundarias |
| `--text` | `#e2e2e2` | Texto principal |
| `--accent` | `#e50914` | Rojo Netflix-like |
| `--muted` | `rgba(233, 188, 182, 0.6)` | Texto secundario |
| `--frame-max` | `430px` | Ancho máximo mobile-first |

### Layout
- `.appShell`: Centrado horizontal con fondo `#0e0e0e`.
- `.appFrame`: `max-width: 430px`, fondo `--bg`.
- `.appContent`: Padding superior e inferior para top bar y bottom nav.
- `.bottomNav`: Fixed bottom, 4 columnas, blur backdrop.

### Componentes clave
- `.heroCard` / `.miniCard`: Cards con imagen de fondo y gradiente.
- `.posterCard`: 200x300px para carrusel.
- `.gridCards`: Grid 2 columnas (3 en `@media >=520px`).
- `.detailHero`: 650px de altura con overlay doble gradiente.

---

## 🔄 Flujo de Dependencias

```
jikan.js (servicio API)
  ├── Home.jsx (useAsync + obtenerTopAnime, obtenerTemporadaActual)
  ├── Explorar.jsx (useAsync + buscarAnime)
  └── Detalles.jsx (useAsync + obtenerAnimePorId, obtenerPersonajesAnime, obtenerImagenesAnime)

anime.js (utilidades)
  └── Detalles.jsx

useAsync.js (hook)
  ├── Home.jsx
  ├── Explorar.jsx
  └── Detalles.jsx

AnimeCard.jsx (componente)
  ├── Home.jsx
  ├── Explorar.jsx
  └── Detalles.jsx

Pagination.jsx (componente)
  └── Explorar.jsx

Layout.jsx (componente)
  └── App.jsx (router)
```

---

## 📝 Convenciones del Código

- **Idioma**: Español — variables, funciones, parámetros y comentarios en español (camelCase).
- **Constantes**: UPPER_SNAKE_CASE (ej. `URL_BASE_JIKAN`, `LIMITE`).
- **Componentes**: PascalCase (ej. `TarjetaAnime`, `Paginacion`).
- **Hooks**: Prefijo `use` (ej. `useAsync`).
- **Props**: camelCase en español (ej. `tieneAnterior`, `alSiguiente`).
- **JSX**: Atributos nativos en inglés (`className`, `htmlFor`, `onClick`), strings de UI en inglés.
- **API Jikan**: Las propiedades de la API (`mal_id`, `title`, `data`, `pagination`) NO se traducen.

---

## ⚙️ Scripts Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia servidor de desarrollo Vite |
| `npm run build` | Build de producción |
| `npm run preview` | Vista previa del build |
| `npm run lint` | ESLint sobre todo el proyecto |

---

## 🔗 API Jikan — Endpoints Usados

| Endpoint | Función | Propósito |
|---|---|---|
| `GET /top/anime` | `obtenerTopAnime` | Top animes (Home trending) |
| `GET /seasons/now` | `obtenerTemporadaActual` | Temporada actual (Home featured) |
| `GET /anime` | `buscarAnime` | Búsqueda con filtros (Explorar) |
| `GET /anime/{id}/full` | `obtenerAnimePorId` | Detalle completo (Detalles) |
| `GET /anime/{id}/characters` | `obtenerPersonajesAnime` | Personajes (Detalles) |
| `GET /anime/{id}/pictures` | `obtenerImagenesAnime` | Galería de imágenes (Detalles) |

---

## 🧠 Notas Técnicas Importantes

1. **Race Conditions en useAsync**: El hook usa un contador (`idSolicitudRef`) para asegurar que solo la respuesta de la solicitud más reciente actualice el estado. Esto es crítico en StrictMode (React 19) donde los efectos se montan/desmontan dos veces.

2. **AbortController**: Todas las peticiones reciben `signal` para cancelación. El hook aborta al desmontar. Las funciones de servicio propagan la signal a `fetch()`.

3. **Estrategia de búsqueda en Explorar**: Se usa un "borrador" local para el formulario. Solo al enviar se actualiza la URL (y por tanto las dependencias de `useAsync`). Esto evita que cada pulsación de tecla dispare una nueva petición y genere entradas en el historial.

4. **Fallback en Detalles**: Las llamadas de personajes e imágenes tienen `.catch(() => null)` para que si fallan no impidan mostrar el detalle principal.

5. **Responsive**: Mobile-first con max-width 430px. El layout se adapta con media queries a partir de 520px y 680px.

6. **ESLint**: La regla `react-hooks/exhaustive-deps` está desactivada específicamente para `useAsync.js` porque la fábrica se pasa por ref intencionadamente.
