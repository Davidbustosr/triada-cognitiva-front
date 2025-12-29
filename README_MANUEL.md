# Triada Cognitiva Front — Guía rápida para Backend (Manuel)

## Estructura principal

- `index.html` + `styles/main.css` + `scripts/main.js`
  - Home. Secciones: hero, why, testimonios ticker, cursos destacados, docentes, FAQ, contacto, footer.

- `cursos.html` + `styles/cursos.css` + `scripts/cursos.js`
  - Listado de cursos. Renderiza cards desde `cursos.json`.

- `curso.html` + `styles/curso.css` + `scripts/curso.js`
  - Detalle de curso. Lee `?id=` en la URL y busca el curso en `cursos.json`.

- `login.html` + `styles/login.css` + `scripts/login.js`
  - Login / registro (mock). Hoy guarda una sesión en `localStorage` para simular autenticación.

- `mi-cuenta.html` + `styles/cuenta.css` + `scripts/cuenta.js`
  - Página de “Mi Cuenta”: perfil + compras (mock). La idea es que desde backend se reemplace por datos reales.

- `blog.html` + `styles/blog.css` + `scripts/blog.js`
  - Página de Blog/Pensamientos: hoy puede estar mock o cargarse desde backend.

## “Contrato” de datos (lo que el front espera)

### Cursos (`cursos.json`)
Lista (array) de objetos:
- `id` (string)
- `titulo` (string)
- `subtitulo` (string, opcional)
- `modalidad` (string, opcional)
- `duracion` (string, opcional)
- `precio` (number)
- `precio_descuento` (number, opcional)
- `descripcion` (string, opcional)
- `temas` (array de strings, opcional)
- `imagen` (string con el nombre del archivo en `assets/images/`)

**Notas:**
- `curso.js` hace `fetch("cursos.json")` y busca por `id` exacto (String).
- `imagen` se arma como `IMAGE_BASE + imagen` y si falla usa un fallback.

### Sesión (mock)
- Key: `localStorage["tc_session"]`
- Payload: `{ name, email, createdAt, ... }`

Cuando se conecte backend real:
- `login.js` debería llamar al endpoint real (POST /login, POST /register).
- `mi-cuenta.html` debería consumir algo como GET /me, GET /orders.


