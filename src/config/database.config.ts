/**
 * =============================================================================
 * config/database.config.ts — CONFIGURACIÓN DE POSTGRESQL
 * =============================================================================
 * NestJS ConfigModule carga este archivo con registerAs('database', ...).
 * Luego AppModule / TypeOrmModule leen ConfigService.get('database.host'), etc.
 *
 * Todas las credenciales salen de variables de entorno (.env):
 *   DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE, DB_SSL
 *
 * Si falta alguna, hay un valor por defecto seguro para desarrollo local.
 * =============================================================================
 */

// registerAs = registra un namespace de config (ej. 'database') en ConfigModule.
import { registerAs } from '@nestjs/config';

/**
 * registerAs('database', factory):
 *   - 'database' = namespace → ConfigService.get('database.host')
 *   - factory = función que Nest ejecuta al arrancar; debe devolver un objeto plano
 */
export default registerAs('database', () => {
  // Puerto crudo del .env (string); default 5432 = puerto clásico de PostgreSQL
  const rawPort = process.env.DB_PORT || '5432';
  // parseInt(..., 10) = convierte string a número en base decimal
  const port = parseInt(rawPort, 10);

  // Validación temprana: evita confundir una IP con un puerto
  if (!Number.isFinite(port) || port <= 0 || port > 65535) {
    throw new Error(
      `DB_PORT inválido: "${rawPort}". Debe ser un número (ej. 5432), no una IP.`,
    );
  }

  // Objeto que queda disponible como database.* en ConfigService
  return {
    host: process.env.DB_HOST || '127.0.0.1', // IP/host del servidor Postgres
    port, // número ya validado
    username: process.env.DB_USERNAME || 'postgres', // usuario de BD
    password: process.env.DB_PASSWORD || '', // clave de BD
    database: process.env.DB_DATABASE || 'proyecto_taller', // nombre de la BD
    // SSL solo si DB_SSL=true (útil en nubes como Railway/Heroku)
    ssl: process.env.DB_SSL === 'true',
  };
});
