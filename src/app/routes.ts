// Rutas centralizadas. Importar siempre desde aquí evita strings sueltos.

export const ROUTES = {
  home: '/',
  // Autenticación (públicas)
  login: '/login',
  register: '/registro',
  // Dashboard (área privada del afiliado)
  dashboard: '/app',
  documents: '/app/documentos',
  tokens: '/app/tokens',
  requests: '/app/solicitudes',
  requestDetail: (id = ':id') => `/app/solicitudes/${id}`,
  profile: '/app/perfil',
  // Panel de administración
  admin: '/admin',
  adminLeads: '/admin/leads',
  adminCitas: '/admin/citas',
  adminAfiliados: '/admin/afiliados',
  adminAfiliadoDetalle: (id = ':id') => `/admin/afiliados/${id}`,
  adminMedia: '/admin/media',
  adminSolicitudes: '/admin/solicitudes',
  adminStats: '/admin/estadisticas',
  adminConfig: '/admin/config',
} as const;
