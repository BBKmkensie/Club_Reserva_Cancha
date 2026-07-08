const { Client } = require('pg');

(async () => {
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  const counts = await client.query(`
    SELECT
      (SELECT COUNT(*)::int FROM talleres) AS talleres,
      (SELECT COUNT(*)::int FROM reservas) AS reservas,
      (SELECT COUNT(*)::int FROM admin) AS admins,
      (SELECT COUNT(*)::int FROM alumnos) AS alumnos
  `);
  const periodo = await client.query(
    'SELECT nombre, fecha_apertura, fecha_cierre FROM periodo_academico WHERE activo = true LIMIT 1',
  );
  console.log('COUNTS', counts.rows[0]);
  console.log('PERIODO', periodo.rows[0] || null);
  await client.end();
})().catch((e) => {
  console.error('ERROR', e.message);
  process.exit(1);
});
