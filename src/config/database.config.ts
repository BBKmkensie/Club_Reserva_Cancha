import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  const rawPort = process.env.DB_PORT || '5432';
  const port = parseInt(rawPort, 10);
  if (!Number.isFinite(port) || port <= 0 || port > 65535) {
    throw new Error(
      `DB_PORT inválido: "${rawPort}". Debe ser un número (ej. 5432), no una IP.`,
    );
  }

  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'proyecto_taller',
  };
});

