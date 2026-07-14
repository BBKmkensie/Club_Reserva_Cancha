/**
 * =============================================================================
 * 4.1 auth.module.ts — MÓDULO DE AUTENTICACIÓN
 * =============================================================================
 * Este módulo "arma" el login:
 *   - Da acceso a tablas Admin, Profesor, Alumno (TypeORM)
 *   - Configura Passport con estrategia JWT por defecto
 *   - Configura JwtModule (firmar / verificar tokens) leyendo jwt.secret del .env
 *   - Registra AuthController (rutas) + AuthService + JwtStrategy (providers)
 *   - EXPORTA AuthService y JwtModule para que otros módulos los usen
 *
 * Recuerda el patrón Nest:
 *   Module registra → Controller recibe HTTP → Service hace la lógica
 * =============================================================================
 */

// Module = decorador que declara imports/controllers/providers/exports.
import { Module } from '@nestjs/common';

// JwtModule = firma tokens en login y los verifica después.
import { JwtModule } from '@nestjs/jwt';

// PassportModule = framework de estrategias de auth (aquí: JWT).
import { PassportModule } from '@nestjs/passport';

// ConfigModule/ConfigService = leen jwt.secret y jwt.expiresIn del .env.
import { ConfigModule, ConfigService } from '@nestjs/config';

// TypeOrmModule = registra entidades para poder inyectar Repository<>.
import { TypeOrmModule } from '@nestjs/typeorm';

// Entidades = tablas que AuthService consulta al hacer login.
import { Admin } from '../entities/admin.entity';
import { Profesor } from '../entities/profesor.entity';
import { Alumno } from '../entities/alumno.entity';

// AuthService = lógica de login; AuthController = rutas /auth.
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

// JwtStrategy = lee el Bearer token y llena req.user.
import { JwtStrategy } from './jwt.strategy';

/**
 * AuthModule:
 *   - imports  = piezas que este módulo necesita (BD, Passport, JWT)
 *   - controllers / providers = rutas y lógica propias
 *   - exports  = lo que otros módulos pueden reutilizar
 */
@Module({
  imports: [
    /**
     * forFeature([...]) = "este módulo puede inyectar Repository<Admin>, etc."
     * Sin esto, @InjectRepository(Admin) en AuthService fallaría.
     */
    TypeOrmModule.forFeature([Admin, Profesor, Alumno]),

    /**
     * Passport usará la estrategia llamada 'jwt' por defecto
     * (la implementa JwtStrategy extends PassportStrategy(Strategy)).
     */
    PassportModule.register({ defaultStrategy: 'jwt' }),

    /**
     * JwtModule.registerAsync: configura el secreto y la expiración
     * DESPUÉS de cargar ConfigModule (lee jwt.secret y jwt.expiresIn del .env).
     */
    JwtModule.registerAsync({
      imports: [ConfigModule],
      // useFactory = Nest llama esta función para armar las opciones JWT
      useFactory: (configService: ConfigService) => ({
        // Clave secreta para firmar el token (debe ser la misma al verificar)
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          // Cuánto dura el token (ej. '8h', '1d') — tipado estricto de Nest JWT
          expiresIn: configService.get<string>('jwt.expiresIn') as `${number}${
            | 's'
            | 'm'
            | 'h'
            | 'd'}`,
        },
      }),
      // inject = le pasa ConfigService a useFactory
      inject: [ConfigService],
    }),
  ],

  // Rutas HTTP: POST /auth/login y GET /auth/me
  controllers: [AuthController],

  // Lógica + validación del token
  providers: [AuthService, JwtStrategy],

  // exports: otros módulos pueden inyectar AuthService / usar JwtModule
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
