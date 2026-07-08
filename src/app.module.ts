import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import mailConfig from './config/mail.config';
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
import { Admin } from './entities/admin.entity';
import { Taller } from './entities/taller.entity';
import { Alumno } from './entities/alumno.entity';
import { Profesor } from './entities/profesor.entity';
import { Reserva } from './entities/reserva.entity';
import { Salida } from './entities/salida.entity';
import { InscripcionSalida } from './entities/inscripcion-salida.entity';
import { InscripcionTaller } from './entities/inscripcion-taller.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, mailConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const ssl = configService.get<boolean>('database.ssl');
        return {
          type: 'postgres',
          host: configService.get('database.host'),
          port: configService.get('database.port'),
          username: configService.get('database.username'),
          password: configService.get('database.password'),
          database: configService.get('database.database'),
          ...(ssl
            ? { ssl: { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' } }
            : {}),
          entities: [Admin, Taller, Alumno, Profesor, Reserva, Salida, InscripcionSalida, InscripcionTaller],
          synchronize: false,
          autoLoadEntities: true,
        };
      },
      inject: [ConfigService],
    }),
    PeriodoModule,
    AuthModule,
    AdminModule,
    TallerModule,
    AlumnoModule,
    ProfesorModule,
    ReservaModule,
    SalidaModule,
    InscripcionSalidaModule,
    InscripcionTallerModule,
    AsistenciaModule,
    FichaAlumnoModule,
    NotificacionModule,
    ApoderadoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
