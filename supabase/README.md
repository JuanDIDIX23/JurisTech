# Supabase — JurisTech

Base de datos, políticas de seguridad y migraciones del proyecto.

## Estructura

```
supabase/
├── schema.sql                              # esquema completo (despliegue nuevo)
└── migrations/
    ├── 001_handle_new_user_metadata.sql    # perfil con nombre/empresa/teléfono
    ├── 002_datos_de_contacto.sql           # correo y WhatsApp reales
    └── 003_unique_cita_slot.sql            # una cita activa por franja
```

`schema.sql` ya incluye todas las migraciones. Sirve para levantar un proyecto
desde cero; las migraciones son para bases que ya están en producción.

## Puesta en marcha

1. Crear el proyecto en [supabase.com](https://supabase.com).
2. SQL Editor → pegar y ejecutar `schema.sql`.
3. Copiar *Project URL* y *anon key* (Settings → API) a `.env.local`:

   ```
   VITE_SUPABASE_URL=https://<proyecto>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon key>
   ```

## Crear el primer administrador

No hay registro de administradores desde la interfaz: el trigger
`handle_new_user` fuerza `rol = 'afiliado'` en todas las cuentas nuevas y nunca
lee el rol de los metadatos, de modo que nadie puede auto-asignárselo
manipulando la petición de registro. El primer admin se promueve a mano:

1. Registrarse normalmente en `/registro` y confirmar el correo.
2. Obtener el UUID del usuario:

   ```sql
   SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;
   ```

3. Promoverlo:

   ```sql
   UPDATE profiles SET rol = 'admin' WHERE id = '<uuid>';
   ```

4. Cerrar sesión y volver a entrar. El login redirige a `/admin` según el rol.

Para promover más administradores se repite el paso 3. Un admin **no** puede
cambiar roles desde el panel: `REVOKE UPDATE ON profiles` deja a
`authenticated` solo con permiso sobre `nombre`, `empresa` y `telefono`.

## Modelo de seguridad

| Tabla / vista | anon | authenticated | admin |
|---|---|---|---|
| `leads` | solo INSERT | solo INSERT | lectura y escritura |
| `citas` | solo INSERT | solo INSERT | lectura y escritura |
| `config` | solo SELECT | solo SELECT | SELECT + UPDATE |
| `profiles` | — | su propia fila | todas las filas |
| `admin_stats` | sin acceso | SELECT (filtrado por RLS) | datos reales |

Puntos que conviene no romper al modificar el esquema:

- **`is_admin()` es `SECURITY DEFINER`.** Sin ella, una policy sobre `profiles`
  que consulte `profiles` provoca `42P17: infinite recursion detected in
  policy`. Todas las policies de admin deben usar `is_admin()`, nunca un
  `EXISTS (SELECT ... FROM profiles ...)` en línea.
- **`citas` no tiene SELECT público.** La landing obtiene las horas ocupadas
  con la RPC `horas_ocupadas(fecha_consulta)`, que devuelve solo valores
  `TIME`. Abrir un `SELECT USING (true)` sobre `citas` expondría nombre,
  teléfono, correo y motivo de cada persona que agende.
- **Los INSERT del cliente no pueden encadenar `.select()`.** Sin permiso de
  lectura, PostgREST devolvería un error de RLS aunque la fila se haya
  insertado correctamente.
- **`admin_stats` usa `security_invoker = on`,** así respeta el RLS de las
  tablas base en lugar de ejecutarse con los permisos del propietario.

## Configuración editable desde el panel

La tabla `config` guarda dos claves en JSONB que el admin edita en
`/admin/config` y la landing lee en tiempo de ejecución:

- **`schedule`** — `availableDays`, `startHour`, `endHour`, `slotDuration`,
  `advanceDays`, `maxDays`, `timezone`. El modal de citas genera sus franjas a
  partir de esto.
- **`contacto`** — `email` y `whatsapp`. Alimentan el botón de WhatsApp y el
  enlace de correo.

Las constantes de `src/shared/config/schedule.ts` son únicamente el fallback
para cuando la lectura falla.

## Despliegue en Vercel

El proyecto es una SPA con React Router. `vercel.json` en la raíz reescribe
todas las rutas a `index.html`; sin eso, recargar en `/admin/leads` o entrar
por un enlace directo devolvería 404.

### Variables de entorno

En el dashboard de Vercel → **Settings → Environment Variables**, añadir estas
dos y marcarlas para *Production*, *Preview* y *Development*:

| Variable | Origen |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Settings → API → *Project URL* |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → *anon public* |

Son los mismos nombres que en `.env.local` (ver `.env.example`). Vite solo
expone al bundle las variables con prefijo `VITE_`, y las resuelve **en tiempo
de build**: después de cambiar cualquiera de las dos hay que redesplegar, no
basta con reiniciar.

La `anon key` es pública por diseño —viaja en el bundle del navegador—, así
que no es un secreto. La protección real es el RLS descrito arriba. Lo que
**nunca** debe salir de Supabase es la `service_role key`: ignora el RLS por
completo y no tiene ningún uso en este proyecto, que es solo frontend.

### Configuración del proyecto

Vercel detecta Vite automáticamente. Valores esperados:

- **Framework preset:** Vite
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Install command:** `npm install`

### Antes del primer despliegue

- Confirmar que `schema.sql` y las tres migraciones están aplicadas.
- Supabase → Authentication → URL Configuration: añadir el dominio de Vercel a
  *Site URL* y *Redirect URLs*, o los enlaces de confirmación de correo
  apuntarán a `localhost`.
