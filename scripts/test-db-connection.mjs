import { readFileSync } from 'fs';
import pg from 'pg';

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const client = new pg.Client({
  host: env.DB_HOST,
  port: Number(env.DB_PORT),
  user: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE,
});

try {
  await client.connect();
  const { rows } = await client.query(
    `SELECT current_database() AS db,
            (SELECT count(*)::int FROM information_schema.tables WHERE table_schema = 'public') AS tablas`,
  );
  console.log('Conexion OK:', rows[0]);
} catch (err) {
  console.error('Error de conexion:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
