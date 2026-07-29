# JurisTech — Contexto del proyecto

**SaaS para una firma jurídica corporativa colombiana.** Aplicación completa con
frontend en React y **Supabase como backend** (PostgreSQL + Auth + RLS).
En producción en Vercel.

El modelo de negocio son **tokens**: las empresas se afilian a un plan, adquieren
una bolsa de tokens y los consumen al solicitar gestiones jurídicas, conociendo
el coste estimado antes de empezar.

Estética: elegancia, profesionalismo, tecnología, confianza e innovación
(inspiración Stripe / Linear / Vercel / Notion). **Sin** iconografía clásica de
abogados (balanzas, martillos, columnas).

## Stack

- **React 18** + **Vite 5** + **TypeScript** (modo estricto, solution-style tsconfig)
- **Supabase** (`@supabase/supabase-js` 2) — PostgreSQL, Auth y Row Level Security
- **TailwindCSS 3** (paleta y tema custom en `tailwind.config.js`)
- **React Router 6** (rutas con lazy-loading)
- **Zustand 4** (estado global: sesión y perfil del afiliado)
- **Framer Motion 11** (animaciones)
- **Recharts 3** (gráficos del panel admin, siempre con `lazy()`)
- **Lucide React** (iconos)

## Scripts

```bash
npm install
npm run dev      # Vite dev server -> http://localhost:5173
npm run build    # tsc -b (typecheck) + vite build
npm run preview  # sirve el build de producción
npm run lint     # tsc --noEmit
```

## Variables de entorno

Requeridas en `.env.local` (git-ignored) y en Vercel → Settings → Environment
Variables. Ver `.env.example`.

| Variable | Origen |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Settings → API → *Project URL* |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → *anon public* |

`src/shared/lib/supabase.ts` lanza un error en tiempo de import si falta
cualquiera de las dos. Vite resuelve las `VITE_*` **en tiempo de build**:
cambiarlas en Vercel exige **redesplegar**, no basta con guardar.

La `anon key` es pública por diseño (viaja en el bundle). La protección real es
el RLS. La `service_role key` **nunca** debe salir de Supabase: este proyecto es
solo frontend y no la necesita.

## Los tres roles

| Rol | Área | Acceso |
|---|---|---|
| Público | `/` | Landing, formulario de contacto, agendamiento de citas |
| Afiliado | `/app` | Su panel: solicitudes, documentos, tokens, perfil |
| Admin | `/admin` | Leads, citas, afiliados, solicitudes, estadísticas, configuración |

El rol vive en `profiles.rol` (`'admin' | 'afiliado'`). `ProtectedRoute` resuelve
la sesión antes de decidir; si el rol no corresponde muestra una pantalla 403 con
enlace al panel correcto en lugar de expulsar al login.

## Autenticación

Supabase Auth (email + contraseña). El trigger `handle_new_user` crea la fila en
`profiles` al registrarse, copiando nombre/empresa/teléfono desde el metadata de
`signUp()` y **fijando siempre `rol = 'afiliado'`** — nunca lo lee del metadata,
para que nadie pueda auto-asignarse permisos manipulando la petición.

`authStore` (`shared/store/authStore.ts`) es la única fuente de verdad sobre
sesión y rol: la UI nunca llama a `supabase.auth` directamente.

### Crear el primer admin

No hay alta de administradores desde la interfaz. Se promueve a mano:

1. Registrarse normalmente en `/registro` y confirmar el correo.
2. Obtener el UUID:
   ```sql
   SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;
   ```
3. Promover:
   ```sql
   UPDATE profiles SET rol = 'admin' WHERE id = '<uuid>';
   ```
4. Cerrar sesión y volver a entrar: el login redirige según el rol.

Un admin **no** puede cambiar roles desde el panel: `REVOKE UPDATE ON profiles`
deja a `authenticated` con permiso solo sobre `nombre`, `empresa` y `telefono`.

Detalle completo del modelo de seguridad en `supabase/README.md`.

## Arquitectura — feature-based

```
src/
├── app/          # Composición: router, rutas, guard de sesión
│   ├── App.tsx              # BrowserRouter + Routes lazy + initialize() de auth
│   ├── routes.ts            # ROUTES central (única fuente de paths)
│   ├── components/          # ProtectedRoute (sesión + rol + 403)
│   └── ScrollToTop.tsx
├── shared/
│   ├── lib/                 # supabase (cliente), cn, format, motion, csv
│   ├── services/            # ← toda la comunicación con Supabase
│   │   ├── leads.ts         # formulario público
│   │   ├── citas.ts         # agendamiento público + RPC horas_ocupadas
│   │   ├── config.ts        # tabla config (schedule + contacto)
│   │   ├── admin.ts         # leads, citas y stats del panel
│   │   ├── afiliado.ts      # área privada del afiliado
│   │   └── admin-afiliados.ts  # gestión de afiliados y solicitudes
│   ├── store/               # authStore (sesión), afiliadoStore (perfil+ficha)
│   ├── types/supabase.ts    # tipos que mapean 1:1 con las tablas
│   ├── hooks/               # useContactConfig, useScheduleConfig
│   ├── config/schedule.ts   # SOLO fallback si falla la lectura de `config`
│   ├── constants/labels.ts  # etiquetas y tonos de los enums
│   └── ui/                  # Button, Card, Badge, Input, Select, Logo
├── features/
│   ├── landing/components/  # Hero, Nosotros, Valores, Comparativa, Tokens,
│   │                        # Faq, Contacto, AppointmentModal, Navbar, Footer
│   ├── dashboard/           # área del afiliado
│   │   ├── layout/          # DashboardLayout, Sidebar, Topbar
│   │   ├── components/      # PageContainer, StatCard, SolicitudTimeline,
│   │   │                    # NuevaSolicitudModal, CuentaEnConfiguracion
│   │   └── config/          # navigation.ts
│   └── admin/               # panel de administración
│       ├── layout/          # AdminLayout
│       ├── components/      # ModalBase, TokensModal, NotaModal,
│       │                    # NuevoAfiliadoModal, SubirDocumentoModal,
│       │                    # EditarSolicitudModal, ChartCard, charts/
│       ├── lib/             # aggregations.ts (series para los gráficos)
│       └── config/          # navigation.ts
├── pages/        # Composición de páginas (thin, orquestan features)
│   ├── LandingPage.tsx
│   ├── auth/                # LoginPage, RegisterPage
│   ├── dashboard/           # Dashboard, Solicitudes(+Detalle), Documents,
│   │                        # Tokens, Profile
│   └── admin/               # AdminDashboard, Leads, Citas, Afiliados(+Detalle),
│                            # SolicitudesAdmin, Estadisticas, Config
└── assets/
```

**Principio clave:** la UI nunca llama a `supabase` directamente; todo pasa por
`shared/services/`. Los componentes reciben datos ya tipados y con los errores
traducidos a mensajes en español.

### Alias de imports (vite.config.ts + tsconfig.app.json)

`@/*`, `@app/*`, `@shared/*`, `@features/*`, `@pages/*`, `@assets/*`

### tsconfig (solution-style)

- `tsconfig.json` → referencias a `tsconfig.app.json` (src) y `tsconfig.node.json` (vite.config).
- Requiere `@types/node` para el config de Vite.
- `src/vite-env.d.ts` tipa `ImportMetaEnv`, para que `import.meta.env.VITE_*`
  no sea `any`.

## Rutas

| Path | Página | Acceso |
|---|---|---|
| `/` | LandingPage | pública |
| `/login` | LoginPage | pública |
| `/registro` | RegisterPage | pública |
| `/app` | DashboardPage | afiliado |
| `/app/solicitudes` | SolicitudesPage | afiliado |
| `/app/solicitudes/:id` | SolicitudDetallePage | afiliado |
| `/app/documentos` | DocumentsPage | afiliado |
| `/app/tokens` | TokensPage | afiliado |
| `/app/perfil` | ProfilePage | afiliado |
| `/admin` | AdminDashboardPage | admin |
| `/admin/leads` | LeadsPage | admin |
| `/admin/citas` | CitasPage | admin |
| `/admin/afiliados` | AfiliadosPage | admin |
| `/admin/afiliados/:id` | AfiliadoDetallePage | admin |
| `/admin/solicitudes` | SolicitudesAdminPage | admin |
| `/admin/estadisticas` | EstadisticasPage | admin |
| `/admin/config` | ConfigPage | admin |
| `*` | redirect a `/` | — |

`/app` usa `DashboardLayout` y `/admin` usa `AdminLayout`, ambos con `<Outlet>`.

## Modelo de datos (Supabase)

Definición completa en `supabase/schema.sql`; el historial en
`supabase/migrations/`. Tipos TypeScript espejo en `shared/types/supabase.ts`.

| Tabla | Contenido |
|---|---|
| `profiles` | Perfil de cada usuario de `auth.users` + `rol` |
| `leads` | Formulario de contacto público |
| `citas` | Agendamiento público |
| `config` | JSONB editable desde el panel: `schedule` y `contacto` |
| `planes` | Planes de afiliación y tokens incluidos |
| `afiliados` | Extiende `profiles`: plan, saldo de tokens, estado |
| `solicitudes` | Gestiones del afiliado, código `JT-AAAA-NNNN` automático |
| `documentos` | Entregables que sube el admin |
| `token_movements` | Historial de recargas, consumos, reembolsos y ajustes |
| `admin_stats` (vista) | Contadores del dashboard admin |

Enums principales:

- **Solicitud** — tipo: 7 servicios; estado: `recibida → en_revision → en_proceso
  → entregada → cerrada` (+ `cancelada`); prioridad: `normal | urgente`.
- **Afiliado** — estado: `activo | suspendido | cancelado`.
- **Tokens** — tipo de movimiento: `recarga | consumo | reembolso | ajuste`.
- **Lead** — estado: `nuevo | contactado | en_proceso | cerrado | descartado`.
- **Cita** — estado: `pendiente | confirmada | cancelada | completada`.

Etiquetas y tonos de badges en `shared/constants/labels.ts`.

### Invariantes que no hay que romper

- **`is_admin()` es `SECURITY DEFINER`.** Una policy sobre `profiles` que
  consulte `profiles` provoca `42P17: infinite recursion detected in policy`.
  Todas las policies de admin usan `is_admin()`, nunca un `EXISTS` en línea.
- **`citas` no tiene SELECT público.** La landing obtiene las horas ocupadas con
  la RPC `horas_ocupadas(fecha_consulta)`, que devuelve solo valores `TIME`.
  Abrirla expondría los datos personales de todo el que agende.
- **Los INSERT públicos no pueden encadenar `.select()`** (`leads`, `citas`):
  sin permiso de lectura, PostgREST devuelve error de RLS aunque la fila se
  haya insertado. `solicitudes` **sí** admite `.select()`: el afiliado puede
  leer las suyas.
- **El saldo solo se mueve por `registrar_movimiento_tokens`**, una RPC que
  valida `is_admin()` y el saldo disponible. Nunca con un `UPDATE` directo:
  se perdería la trazabilidad en `token_movements`.
- **`admin_stats` usa `security_invoker = on`.** Al recrearla con
  `CREATE OR REPLACE VIEW` hay que reaplicar esa opción y los `GRANT`.
- **Recharts siempre con `lazy()`.** Su núcleo son ~313 kB y debe quedar fuera
  del chunk principal, que ningún visitante de la landing necesita descargar.

## Funcionalidad por área

- **Landing** — Hero con carrusel, Nuestra historia (misión/visión), Valores,
  Comparativa, Cómo funcionan los tokens, FAQ, Contacto. El formulario crea
  `leads` y el modal de citas crea `citas`, leyendo el horario disponible desde
  `config.schedule`.
- **Afiliado** — Resumen con saldo y actividad; solicitudes con timeline de
  estados; documentos en solo lectura (los sube el admin); historial de tokens
  con saldo reconstruido en cliente; perfil editable.
- **Admin** — Leads y citas con filtros y exportación CSV; alta de afiliados y
  recarga/consumo de tokens; gestión de solicitudes (estado, tokens, notas,
  responsable); subida de documentos por URL; estadísticas con Recharts;
  configuración de horario y datos de contacto que la landing lee en caliente.

## Diseño (tailwind.config.js)

- Paleta custom: `brand` (azul corporativo), `sand` (beige cálido de
  superficies), `stone` (gris neutro de tipografía y fondos oscuros).
- Sombras `card` / `glow`, `bg-grid-faint`, animación `fade-up`.
- Tipografía **Inter** (cargada en `index.html`).

## Convenciones

- Componentes reutilizables en `shared/ui`; los específicos de feature en su feature.
- Toda llamada a Supabase vive en `shared/services/`.
- TypeScript estricto; sin `any`.
- Loading state y mensaje de error en español en cada operación asíncrona.
- Textos de UI en **español**.
- Iconos solo desde `lucide-react`.
- **Fechas locales, nunca `toISOString()`** para obtener `YYYY-MM-DD`: convierte
  a UTC y en Colombia (UTC−5) devuelve el día anterior.

## Despliegue

- **Frontend:** Vercel. `vercel.json` reescribe todas las rutas a `index.html`
  (necesario para React Router; sin él, recargar en `/admin/leads` da 404).
  Push a `main` dispara el despliegue.
- **Backend:** Supabase. Ejecutar `supabase/schema.sql` en un proyecto nuevo, o
  las migraciones pendientes en uno existente.
- Añadir el dominio de Vercel en Supabase → Authentication → URL Configuration
  (*Site URL* y *Redirect URLs*), o los correos de confirmación apuntarán a
  `localhost`.

## Código sin uso

`ServicesSection.tsx` y `DashboardMockup.tsx` siguen en `features/landing/` pero
ya no se renderizan. Se conservan por si se recuperan; no entran en el bundle.

## Repo

GitHub: `https://github.com/JuanDIDIX23/JurisTech` (rama `main`).
