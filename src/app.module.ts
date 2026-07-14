/**
 * =============================================================================
 * app.module.ts — MÓDULO RAÍZ (el "tablero" que conecta TODO el backend)
 * =============================================================================
 * En NestJS, un @Module agrupa:
 *   - imports:    otros módulos que este necesita
 *   - controllers: rutas HTTP de ESTE módulo
 *   - providers:  servicios (lógica) de ESTE módulo
 *
 * AppModule es especial: lo usa main.ts al crear la app.
 * Aquí se conecta:
 *   1) Variables de entorno (.env)
 *   2) PostgreSQL (TypeORM)
 *   3) Todos los módulos de dominio (auth, taller, alumno, etc.)
 * =============================================================================
 */

// Module = decorador Nest del módulo raíz.
import { Module } from '@nestjs/common';

// ConfigModule = lee el .env; ConfigService = permite leer valores tipados.
import { ConfigModule, ConfigService } from '@nestjs/config';

// TypeOrmModule = puente NestJS ↔ TypeORM ↔ PostgreSQL.
import { TypeOrmModule } from '@nestjs/typeorm';

// AppController / AppService = GET /health (health check).
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Archivos de config que exportan { host, port, secret, etc. } desde process.env.
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import mailConfig from './config/mail.config';

// --- Módulos de dominio (cada carpeta = un área del negocio) ---
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { TallerModule } from './taller/taller.module';
import { AlumnoModule } from './alumno/alumno.module';
import { ProfesorModule } from './profesor/profesor.module';
import { ReservaModule } from './reserva/reserva.module';
import { SalidaModule } from './salida/salida.module';
import { InscripcionSalidaModule } from './inscripcion-salida/inscripcion-salida.module';
import { InscripcionTallerModule } from './inscripcion-taller/inscripcion-taller.module';
import { PeriodoModule } from './periodo/periodo.module';
import { AsistenciaModule } from './asistencia/asistencia.module';
import { FichaAlumnoModule } from './ficha-alumno/ficha-alumno.module';
import { NotificacionModule } from './notificacion/notificacion.module';
import { ApoderadoModule } from './apoderado/apoderado.module';
import { ReportesModule } from './reportes/reportes.module';

// --- Entidades (clases TypeORM = tablas PostgreSQL) ---
import { Admin } from './entities/admin.entity';
import { Taller } from './entities/taller.entity';
import { Alumno } from './entities/alumno.entity';
import { Profesor } from './entities/profesor.entity';
import { Reserva } from './entities/reserva.entity';
import { Salida } from './entities/salida.entity';
import { InscripcionSalida } from './entities/inscripcion-salida.entity';
import { InscripcionTaller } from './entities/inscripcion-taller.entity';

/**
 * AppModule:
 *   Módulo raíz. NestFactory.create(AppModule) en main.ts arranca todo esto.
 */
@Module({
  imports: [
    // ---------- 1) Configuración global (.env) ----------
    ConfigModule.forRoot({
      // isGlobal: true → ConfigService disponible en TODOS los módulos sin reimportar
      isGlobal: true,
      // load: registra namespaces: database.*, jwt.*, mail.*
      load: [databaseConfig, jwtConfig, mailConfig],
    }),

    // ---------- 2) Conexión a PostgreSQL ----------
    // forRootAsync: la config se resuelve DESPUÉS de cargar el .env (async)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      // useFactory: función que Nest llama para armar las opciones de TypeORM
      useFactory: (configService: ConfigService) => {
        // Lee database.ssl desde database.config.ts (variable DB_SSL)
        const ssl = configService.get<boolean>('database.ssl');
        return {
          // Motor: PostgreSQL (no MySQL, no SQL Server)
          type: 'postgres',
          // Credenciales leídas del .env vía database.config.ts
          host: configService.get('database.host'),
          port: configService.get('database.port'),
          username: configService.get('database.username'),
          password: configService.get('database.password'),
          database: configService.get('database.database'),
          // SSL opcional para cloud (Supabase, RDS, Azure). Solo si DB_SSL=true
          ...(ssl
            ? {
                ssl: {
                  rejectUnauthorized:
                    process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
                },
              }
            : {}),
          // Entidades principales registradas explícitamente
          entities: [
            Admin,
            Taller,
            Alumno,
            Profesor,
            Reserva,
            Salida,
            InscripcionSalida,
            InscripcionTaller,
          ],
          // synchronize: false → TypeORM NO crea/altera tablas al arrancar.
          // El esquema se aplica con scripts SQL (más seguro en producción).
          synchronize: false,
          // autoLoadEntities: true → también carga entidades de forFeature() en otros módulos
          autoLoadEntities: true,
        };
      },
      // inject: le pasa ConfigService a useFactory
      inject: [ConfigService],
    }),

    // ---------- 3) Módulos de dominio ----------
    // Cada uno trae sus controllers + services + endpoints
    PeriodoModule, // período académico (ventanas de inscripción)
    AuthModule, // login JWT (admin, profesor, alumno, apoderado)
    AdminModule, // CRUD admin
    TallerModule, // talleres (núcleo del negocio)
    AlumnoModule, // CRUD alumnos
    ProfesorModule, // CRUD profesores
    ReservaModule, // reservas de cancha
    SalidaModule, // salidas pedagógicas
    InscripcionSalidaModule, // alumno ↔ salida
    InscripcionTallerModule, // alumno ↔ taller
    AsistenciaModule, // listas y alertas de ausencia
    FichaAlumnoModule, // ficha física por taller
    NotificacionModule, // avisos in-app
    ApoderadoModule, // portal / propuestas del apoderado
    ReportesModule, // reportes agregados
  ],

  // Controller propio de AppModule (solo GET /health)
  controllers: [AppController],
  // Service propio de AppModule (mensaje "Hello World!")
  providers: [AppService],
})
export class AppModule {}
