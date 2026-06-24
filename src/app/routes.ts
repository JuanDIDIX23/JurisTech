// Rutas centralizadas. Importar siempre desde aquí evita strings sueltos.

export const ROUTES = {
  home: '/',
  // Dashboard (área privada del cliente)
  dashboard: '/app',
  documents: '/app/documentos',
  tokens: '/app/tokens',
  requests: '/app/solicitudes',
  requestDetail: (id = ':id') => `/app/solicitudes/${id}`,
  profile: '/app/perfil',
} as const;
