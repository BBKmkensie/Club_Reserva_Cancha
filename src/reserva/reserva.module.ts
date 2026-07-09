/**
 * Módulo de reservas de cancha.
 * Agrupa reservas, franjas horarias y servicios de seed de datos iniciales.
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

@Module({
  imports: [TypeOrmModule.forFeature([Reserva, FranjaCancha, Taller, Profesor, PeriodoAcademico])],
  controllers: [ReservaController, FranjaCanchaController],
  providers: [ReservaService, FranjaCanchaService, ReservaCanchaSeedService],
  exports: [ReservaService, FranjaCanchaService, ReservaCanchaSeedService],
})
export class ReservaModule {}
