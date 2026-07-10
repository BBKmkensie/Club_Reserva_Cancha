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
const ssl = { rejectUnauthorized: env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' };

function createClient(database) {
  return new pg.Client({
    host: env.DB_HOST,
    port: Number(env.DB_PORT || 5432),
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database,
    ssl,
  });
}

const targetDb = env.DB_DATABASE || 'ClubAgenda';

const admin = createClient('postgres');
await admin.connect();

const exists = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [targetDb]);
if (exists.rowCount === 0) {
  await admin.query(`CREATE DATABASE "${targetDb}"`);
  console.log(`Base de datos creada: ${targetDb}`);
} else {
  console.log(`Base de datos ya existe: ${targetDb}`);
}
await admin.end();

const app = createClient(targetDb);
await app.connect();
const tables = await app.query(
  `SELECT count(*)::int AS tablas FROM information_schema.tables WHERE table_schema = 'public'`,
);
console.log(`Tablas en ${targetDb}:`, tables.rows[0].tablas);
await app.end();
console.log('Listo.');
