/**
 * =============================================================================
 * apoderado/apoderado.module.ts — MÓDULO DEL PORTAL DE APODERADOS
 * =============================================================================
 * El apoderado NO es una tabla aparte: sus datos viven en columnas del Alumno
 * (apoderadoNombre, apoderadoRut, apoderadoEmail, password...).
 *
 * forwardRef(InscripcionTallerModule): evita dependencia circular
 * (apoderado propone → inscripcion-taller; inscripcion puede notificar apoderado).
 * =============================================================================
 */
// forwardRef = rompe dependencia circular con InscripcionTallerModule
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// Alumno guarda datos del apoderado en columnas (no hay tabla apoderados)
import { Alumno } from '../entities/alumno.entity';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { SesionAsistencia } from '../entities/sesion-asistencia.entity';
import { ApoderadoService } from './apoderado.service';
import { ApoderadoController } from './apoderado.controller';
import { ApoderadoSeedService } from './apoderado-seed.service';
import { ApoderadoNotifyService } from './apoderado-notify.service';
import { RegistroAsistencia } from '../entities/registro-asistencia.entity';
// AuthModule = JwtAuthGuard / JwtStrategy para proteger /apoderado/*
import { AuthModule } from '../auth/auth.module';
import { Profesor } from '../entities/profesor.entity';
import { InscripcionTallerModule } from '../inscripcion-taller/inscripcion-taller.module';

/** Agrupa la funcionalidad del portal y utilidades de apoderados. */
@Module({
  imports: [
    TypeOrmModule.forFeature([Alumno, InscripcionTaller, SesionAsistencia, Profesor, RegistroAsistencia]),
    AuthModule,
    forwardRef(() => InscripcionTallerModule),
  ],
  controllers: [ApoderadoController],
  providers: [ApoderadoService, ApoderadoSeedService, ApoderadoNotifyService],
  exports: [ApoderadoService, ApoderadoSeedService, ApoderadoNotifyService],
})
export class ApoderadoModule {}
