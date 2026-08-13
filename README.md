# Plan Paciente — Frontend

SPA en React + TypeScript (Vite) que consume la API del backend de
[`vmg-plan-paciente-backend`](https://github.com/crlmgn/vmg-plan-paciente-backend).

## Stack

- **Vite + React 19 + TypeScript**
- **react-router-dom** para el ruteo y los guards por rol
- **axios** como cliente HTTP, con interceptores para adjuntar el JWT y
  refrescarlo automáticamente ante un 401
- Sin librería de UI — CSS plano en `src/index.css`

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # ajustar VITE_API_URL si el backend no está en :8000
npm run dev
```

Requiere el backend corriendo (ver
[`vmg-plan-paciente-backend`](https://github.com/crlmgn/vmg-plan-paciente-backend))
para que las pantallas tengan datos reales con los que trabajar.

**Alternativa — levantar los 3 repos juntos con un solo comando:** hay un
`docker-compose.yml` orquestador al nivel del directorio que contiene los 3
repos clonados como hermanos (backend, frontend y
[`vmg-plan-paciente-db`](https://github.com/crlmgn/vmg-plan-paciente-db)). Ver
el `README.md` en ese directorio.

```bash
npm run build     # build de producción a dist/
npm run lint       # oxlint
npm run preview   # sirve el build de producción localmente
```

## Autenticación

`src/api/client.ts` mantiene un cliente `axios` con dos interceptores:
- **Request**: agrega `Authorization: Bearer <access>` si hay un token guardado.
- **Response**: si una petición devuelve 401 y hay `refresh` token guardado,
  intenta `POST /auth/token/refresh/` una vez y reintenta la petición original;
  si el refresh también falla, limpia la sesión y notifica a `AuthContext`
  (que redirige a login mediante los guards de ruta).

Los tokens se guardan en `localStorage` (`src/api/tokens.ts`). `AuthContext`
(`src/auth/AuthContext.tsx`) expone `usuario`, `login()` y `logout()`, y al
montar la app intenta restaurar la sesión llamando a `GET /usuarios/me/` si hay
un access token guardado.

## Rutas

| Ruta | Acceso | Pantalla |
|---|---|---|
| `/` | Pública | Redirige según rol, o landing si no hay sesión |
| `/registro` | Pública | Autorregistro de farmacia (cascada provincia→cantón→distrito) |
| `/login` | Pública | Login |
| `/activar-cuenta?uid=&token=` | Pública (token) | Define password tras la aprobación |
| `/medicamentos` | Autenticado (admin o farmacia) | Listado de medicamentos y planes; **admin también agrega/edita/elimina** medicamentos y planes ahí mismo |
| `/canjes` | Autenticado (admin o farmacia) | Control de canjes (fecha, farmacia, cliente); **admin puede editar** fecha/farmacia de un canje ya registrado |
| `/admin/farmacias` | Solo admin | Mantenimiento: **agregar** (alta manual), filtrar, aprobar, rechazar, editar, **eliminar** |
| `/admin/clientes` | Solo admin | Mantenimiento de clientes: buscar, editar, eliminar, ver historial de compras/canjes y elegibilidad |
| `/mi-farmacia` | Solo farmacia | Datos de la farmacia propia |
| `/atender-cliente` | Admin o farmacia | Buscar/registrar cliente, ver elegibilidad de canje (con progreso claro "llevás X de Y"), historial de compras, registrar compra o canje. Un admin debe elegir primero en nombre de qué farmacia está atendiendo. |

Los guards (`src/routes/ProtectedRoute.tsx`) redirigen a `/login` si no hay
sesión, o a `/` si el rol no coincide con el requerido por la ruta.

## Estructura

```
src/
├── api/            # un módulo por dominio (auth, farmacias, medicamentos, ubicaciones, clientes, compras) + cliente axios
├── auth/           # AuthContext (sesión, login/logout)
├── routes/         # Layout (header/nav) y guards de ruta
├── pages/          # una pantalla por archivo (incluye ClientesPage, mantenimiento de clientes)
├── components/     # Logo, UbicacionSelects (cascada provincia→cantón→distrito), y lo que se comparta entre pantallas
├── types/          # interfaces TS que reflejan los serializers del backend
├── assets/         # logo-no-alto.png (logo de marca)
└── App.tsx         # definición de rutas
```

`UbicacionSelects` se reutiliza en el registro público de farmacias y en su
edición desde el panel admin — la lógica de carga en cascada no se duplica
entre ambos formularios.

El logo (`src/assets/logo-no-alto.png`, componente `src/components/Logo.tsx`)
se usa en el header (`routes/Layout.tsx`) y como favicon
(`public/favicon.png`).

## Docker

El `Dockerfile` de este repo corre el dev server de Vite con hot reload —
pensado para el `docker-compose.yml` orquestador que levanta los 3 repos
juntos (backend + frontend + db), no para producción.
