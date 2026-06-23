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
```

### Notas importantes:

1. **DB_HOST**: Dirección IP del servidor PostgreSQL (por defecto: 127.0.0.1 para localhost)
2. **DB_PORT**: Puerto de PostgreSQL (por defecto: 5432)
3. **DB_USERNAME**: Usuario de la base de datos (por defecto: postgres)
4. **DB_PASSWORD**: Contraseña de la base de datos
5. **DB_DATABASE**: Nombre de la base de datos (proyecto_taller)
6. **PORT**: Puerto donde correrá la aplicación NestJS (por defecto: 3000)

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
