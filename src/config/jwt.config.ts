import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'reservas-cancha-dev-secret-cambiar-en-produccion',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
}));
