/**
 * =============================================================================
 * reserva/reserva.module.ts — MÓDULO DE RESERVAS DE CANCHA
 * =============================================================================
 * Agrupa todo lo relacionado con la cancha deportiva:
 *   - Reservas (quién ocupa qué franja en qué fecha)
 *   - Franjas horarias (qué bloques habilita la directiva)
 *   - Seed de reservas deportivas del semestre (fútbol/vóley)
 *
 * TypeOrmModule.forFeature(...) registra las entidades para inyectar
 * repositorios TypeORM en los services de este módulo.
 * exports: permite que otros módulos usen ReservaService / FranjaCanchaService.
 * =============================================================================
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservaService } from './reserva.service';
import { ReservaController } from './reserva.controller';
import { FranjaCanchaController } from './franja-cancha.controller';
import { FranjaCanchaService } from './franja-cancha.service';
import { Reserva } from '../entities/reserva.entity';
import { FranjaCancha } from '../entities/franja-cancha.entity';
import { Taller } from '../entities/taller.entity';
import { Profesor } from '../entities/profesor.entity';
import { PeriodoAcademico } from '../entities/periodo-academico.entity';
import { ReservaCanchaSeedService } from './reserva-cancha-seed.service';

/**
 * @Module: declara controllers, providers y entidades TypeORM del dominio cancha.
 * TypeOrmModule.forFeature = permite @InjectRepository(Reserva | FranjaCancha | …).
 */
@Module({
  // Entidades disponibles vía @InjectRepository en los services
  imports: [TypeOrmModule.forFeature([Reserva, FranjaCancha, Taller, Profesor, PeriodoAcademico])],
  // Endpoints HTTP: /reserva y /franja-cancha
  controllers: [ReservaController, FranjaCanchaController],
  providers: [ReservaService, FranjaCanchaService, ReservaCanchaSeedService],
  // Otros módulos pueden importar ReservaModule y usar estos services
  exports: [ReservaService, FranjaCanchaService, ReservaCanchaSeedService],
})
export class ReservaModule {}
