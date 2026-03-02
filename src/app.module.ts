import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import { AdminModule } from './admin/admin.module';
import { TallerModule } from './taller/taller.module';
import { AlumnoModule } from './alumno/alumno.module';
import { ProfesorModule } from './profesor/profesor.module';
import { ReservaModule } from './reserva/reserva.module';
import { SalidaModule } from './salida/salida.module';
import { InscripcionSalidaModule } from './inscripcion-salida/inscripcion-salida.module';
import { InscripcionTallerModule } from './inscripcion-taller/inscripcion-taller.module';
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
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [Admin, Taller, Alumno, Profesor, Reserva, Salida, InscripcionSalida, InscripcionTaller],
        synchronize: false, // Desactivado porque las tablas ya están creadas manualmente
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    AdminModule,
    TallerModule,
    AlumnoModule,
    ProfesorModule,
    ReservaModule,
    SalidaModule,
    InscripcionSalidaModule,
    InscripcionTallerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
