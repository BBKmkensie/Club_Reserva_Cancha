import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservaService } from './reserva.service';
import { ReservaController } from './reserva.controller';
import { FranjaCanchaController } from './franja-cancha.controller';
import { FranjaCanchaService } from './franja-cancha.service';
import { Reserva } from '../entities/reserva.entity';
import { FranjaCancha } from '../entities/franja-cancha.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reserva, FranjaCancha])],
  controllers: [ReservaController, FranjaCanchaController],
  providers: [ReservaService, FranjaCanchaService],
  exports: [ReservaService, FranjaCanchaService],
})
export class ReservaModule {}
