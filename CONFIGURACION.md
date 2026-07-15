# Configuración del Proyecto

## Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con la siguiente estructura:

```env
# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_contraseña_aqui
DB_DATABASE=proyecto_taller

# Application
PORT=3000

# Email (SMTP) — ver sección "Correo electrónico" más abajo
MAIL_ENABLED=false
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=
SMTP_PASS=
SMTP_FROM=Reservas Cancha <noreply@reservas.local>
```

### Notas importantes:

1. **DB_HOST**: Dirección IP del servidor PostgreSQL (por defecto: 127.0.0.1 para localhost)
2. **DB_PORT**: Puerto de PostgreSQL (por defecto: 5432)
3. **DB_USERNAME**: Usuario de la base de datos (por defecto: postgres)
4. **DB_PASSWORD**: Contraseña de la base de datos
5. **DB_DATABASE**: Nombre de la base de datos (proyecto_taller)
6. **PORT**: Puerto donde correrá la aplicación NestJS (por defecto: 3000)
7. **MAIL_ENABLED**: `true` envía correos reales; `false` (o vacío) solo los registra en consola
8. **SMTP_***: Credenciales del servidor SMTP (Mailtrap, Gmail, SendGrid, etc.)

## Correo electrónico

El backend usa **nodemailer** para notificar por email (inscripciones, alertas de asistencia, contacto a apoderados, etc.).

### Modo desarrollo (sin SMTP)

En tu `.env`:

```env
MAIL_ENABLED=false
```

Al iniciar el backend verás:

`Email deshabilitado (MAIL_ENABLED=false). Los correos se registran en consola.`

Cada notificación aparecerá como `[EMAIL simulado] Para: ... | Asunto: ...` en la terminal. Las notificaciones **dentro de la app** siguen funcionando con normalidad.

### Configurar Mailtrap (recomendado para pruebas)

[Mailtrap](https://mailtrap.io) captura los correos en una bandeja de prueba sin enviarlos a usuarios reales.

1. Crea una cuenta gratuita en [mailtrap.io](https://mailtrap.io).
2. Ve a **Email Testing → Inboxes → [tu inbox] → SMTP Settings**.
3. Elige integración **Nodemailer** (o copia host, puerto, usuario y contraseña).
4. Pega los datos en tu `.env`:

```env
MAIL_ENABLED=true
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=tu_usuario_mailtrap
SMTP_PASS=tu_contraseña_mailtrap
SMTP_FROM=Reservas Cancha <noreply@reservas.local>
```

5. Reinicia el backend:

```bash
npm run start:dev
```

6. Deberías ver: `Email habilitado (sandbox.smtp.mailtrap.io:2525)`.
7. Dispara una acción que envíe correo (por ejemplo, aprobar una inscripción) y revisa la bandeja en Mailtrap.

### Producción (Azure App Service — clubagenda)

En **Azure Portal** → App Service **clubagenda** → **Settings** → **Environment variables** (Application settings), agrega:

```env
MAIL_ENABLED=true
SMTP_HOST=smtp.tuproveedor.cl
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=Club Agenda <noreply@tudominio.cl>
FRONTEND_URL=https://clubagenda-fbenbceetecuhjbs.chilecentral-01.azurewebsites.net
```

Reinicia la app. Comprueba en el navegador:

`GET https://tu-dominio.azurewebsites.net/health/mail`

Debe responder `{ "ok": true, "mailEnabled": true, "smtpConfigured": true }`. Si `mailEnabled` o `smtpConfigured` es `false`, **no llegará ningún correo** (solo notificaciones en la app).

#### Configurar Gmail (recomendado para pruebas)

1. Entra a tu cuenta Google → **Seguridad** → activa **Verificación en 2 pasos**.
2. Crea una **Contraseña de aplicación** (App password) para “Correo”.
3. En Azure, agrega estas variables:

```env
MAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=osvaldobsavedra@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
SMTP_FROM=Club Agenda <osvaldobsavedra@gmail.com>
FRONTEND_URL=https://clubagenda-XXXX.azurewebsites.net
```

4. **Reinicia** el App Service.
5. Inscríbete de nuevo o pide una prueba: el correo va a `email` del alumno en la ficha (Alumnos → editar).

**Importante:** `SMTP_PASS` es la contraseña de aplicación de 16 caracteres, **no** tu contraseña normal de Gmail.

### Producción (genérico)

Usa las credenciales de tu proveedor real (SendGrid, Amazon SES, servidor SMTP institucional, etc.) y un remitente válido en `SMTP_FROM`.

```env
MAIL_ENABLED=true
SMTP_HOST=smtp.tuproveedor.cl
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=Reservas Cancha <noreply@tudominio.cl>
```

## Verificación de la Base de Datos

Asegúrate de que:

1. PostgreSQL esté corriendo en tu sistema
2. La base de datos `proyecto_taller` esté creada
3. Las tablas estén creadas según el esquema SQL proporcionado
4. Tengas permisos de acceso con el usuario configurado

## Probar la Conexión

Una vez configurado el `.env`, puedes iniciar la aplicación:

```bash
npm run start:dev
```

Si la conexión es exitosa, verás un mensaje indicando que la aplicación está corriendo en el puerto configurado.
