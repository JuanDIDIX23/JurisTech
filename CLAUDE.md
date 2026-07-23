# JurisTech — Contexto del proyecto

Plataforma **SaaS para una firma jurídica moderna**. Frontend únicamente, con
**datos mock** (sin backend ni APIs reales). Diseñada para escalar a backend en
el futuro sin reescribir la UI.

Estética: elegancia, profesionalismo, tecnología, confianza e innovación
(inspiración Stripe / Linear / Vercel / Notion). **Sin** iconografía clásica de
abogados (balanzas, martillos, columnas).

## Stack

- **React 18** + **Vite 5** + **TypeScript** (modo estricto, solution-style tsconfig)
- **TailwindCSS 3** (paleta y tema custom en `tailwind.config.js`)
- **React Router 6** (rutas con lazy-loading)
- **Zustand 4** (estado global, hoy alimentado por mocks)
- **Framer Motion 11** (animaciones)
- **Lucide React** (iconos)

## Scripts

```bash
npm install
npm run dev      # Vite dev server -> http://localhost:5173
npm run build    # tsc -b (typecheck) + vite build
npm run preview  # sirve el build de producción
npm run lint     # tsc --noEmit
```

## Arquitectura — feature-based

```
src/
├── app/          # Composición de la app: <App>, router, ScrollToTop, rutas
│   ├── App.tsx           # BrowserRouter + <Routes> con páginas lazy
│   ├── routes.ts         # ROUTES central (única fuente de paths)
│   └── ScrollToTop.tsx
├── shared/       # Reutilizable y agnóstico de feature
│   ├── ui/               # Design system: Button, Card, Badge, Input, Select, Logo
│   ├── types/            # Tipos de dominio (Company, LegalRequest, DocumentItem…)
│   ├── store/            # useAppStore (Zustand)
│   ├── mocks/            # data.ts: datos simulados (futuro reemplazo por API)
│   ├── lib/              # cn (classnames), format (fechas/moneda), motion (variants)
│   └── constants/        # labels.ts: etiquetas y tonos de estados/tipos
├── features/
│   ├── landing/          # Landing pública (secciones + mockup de dashboard)
│   │   ├── components/   # HeroSection, BenefitsSection, TokensSection,
│   │   │                 # ServicesSection, FaqSection, FinalCtaSection,
│   │   │                 # LandingNavbar, LandingFooter, DashboardMockup, SectionHeading
│   │   └── index.ts      # barrel export
│   └── dashboard/        # Área privada
│       ├── layout/       # DashboardLayout, Sidebar, Topbar
│       ├── components/   # PageContainer, StatCard, StatusBadge,
│       │                 # DocumentTypeIcon, RequestTimeline
│       └── config/       # navigation.ts (items del sidebar)
├── pages/        # Composición de páginas (thin, orquestan features)
│   ├── LandingPage.tsx
│   └── dashboard/        # DashboardPage, DocumentsPage, TokensPage,
│                         # RequestsPage, ProfilePage
└── assets/
```

**Principio clave:** la UI nunca importa mocks directamente; todo pasa por
`useAppStore`. Migrar a backend = cambiar solo la inicialización del store
(y/o añadir data-fetching), sin tocar componentes.

### Alias de imports (vite.config.ts + tsconfig.app.json)

`@/*`, `@app/*`, `@shared/*`, `@features/*`, `@pages/*`, `@assets/*`

### tsconfig (solution-style)

- `tsconfig.json` → referencias a `tsconfig.app.json` (src) y `tsconfig.node.json` (vite.config).
- Requiere `@types/node` (ya instalado) para el config de Vite.

## Rutas

| Path                      | Página            |
|---------------------------|-------------------|
| `/`                       | LandingPage       |
| `/app`                    | DashboardPage     |
| `/app/documentos`         | DocumentsPage     |
| `/app/tokens`             | TokensPage        |
| `/app/solicitudes`        | RequestsPage      |
| `/app/solicitudes/:id`    | RequestsPage (detalle seleccionado) |
| `/app/perfil`             | ProfilePage       |
| `*`                       | redirect a `/`    |

El área `/app` usa `DashboardLayout` (Sidebar + Topbar) como layout con `<Outlet>`.

## Modelo de dominio (src/shared/types)

- **Company** + **Plan** (tier starter/growth/enterprise, tokens mensuales, precio, features).
- **TokenSummary** (`purchased`, `consumed`, `remaining`) + **TokenMovement**
  (type: purchase/consumption/refund/bonus, amount, balanceAfter).
- **DocumentItem** (type: contract/report/legal_opinion/invoice/policy/other).
- **LegalRequest** (status: pending/in_review/in_progress/completed/cancelled;
  category: corporate/labor/tax/compliance/ip/data_protection) con
  **RequestTimelineEvent[]** para el timeline visual.

Etiquetas y colores de estos enums viven en `src/shared/constants/labels.ts`
(`REQUEST_STATUS_LABELS`, `REQUEST_STATUS_TONE`, `DOCUMENT_TYPE_LABELS`, etc.).

## Funcionalidad por pantalla

- **Landing**: Hero (título "Asesoría jurídica inteligente para empresas
  modernas" + mockup animado de dashboard), Beneficios, Cómo funcionan los
  tokens, Servicios (6 áreas), FAQ (acordeón), CTA final, footer.
- **Dashboard**: métricas (tokens disponibles/consumidos, solicitudes activas,
  documentos), barra de consumo, solicitudes activas, documentos recientes.
- **Documentos**: tabla con búsqueda + filtro por tipo, descarga (mock), estado vacío.
- **Tokens**: comprados/utilizados/restantes, gauge radial SVG, historial de movimientos.
- **Solicitudes**: maestro-detalle, filtro por estado, **timeline visual** por solicitud.
- **Perfil**: datos de empresa + plan contratado con features.

## Diseño (tailwind.config.js)

- Paleta custom: `navy` (azul marino), `graphite` (gris grafito), `accent`
  (azul tecnológico), + blanco. Sombras `card`/`glow`, `bg-grid-faint`, animaciones.
- Tipografía **Inter** (cargada en `index.html`).

## Convenciones

- Componentes reutilizables en `shared/ui`; los específicos de feature en su feature.
- Barrel exports (`index.ts`) por feature.
- TypeScript estricto; sin `any`.
- Textos de UI en **español**.
- Iconos solo desde `lucide-react`.

## Repo

GitHub: `https://github.com/JuanDIDIX23/JurisTech` (rama `main`).
