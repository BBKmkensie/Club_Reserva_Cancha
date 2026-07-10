import { readFileSync, existsSync } from 'fs';
import pg from 'pg';

function loadEnv() {
  if (!existsSync('.env')) {
    throw new Error('No existe .env en la raíz del proyecto.');
  }
  return Object.fromEntries(
    readFileSync('.env', 'utf8')
      .split(/\r?\n/)
      .filter((l) => l && !l.startsWith('#'))
      .map((l) => {
        const i = l.indexOf('=');
        return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
      }),
  );
}

const env = loadEnv();
const sslEnabled = env.DB_SSL === 'true';

const client = new pg.Client({
  host: env.DB_HOST,
  port: Number(env.DB_PORT || 5432),
  user: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE,
  ...(sslEnabled ? { ssl: { rejectUnauthorized: env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' } } : {}),
});

try {
  await client.connect();
  const { rows } = await client.query(
    `SELECT current_database() AS db,
            current_user AS usuario,
            (SELECT count(*)::int FROM information_schema.tables WHERE table_schema = 'public') AS tablas`,
  );
  console.log('Conexion OK:', rows[0]);
} catch (err) {
  console.error('Error de conexion:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
