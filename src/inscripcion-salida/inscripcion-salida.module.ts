import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InscripcionSalidaService } from './inscripcion-salida.service';
import { InscripcionSalidaController } from './inscripcion-salida.controller';
import { InscripcionSalida } from '../entities/inscripcion-salida.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InscripcionSalida])],
  controllers: [InscripcionSalidaController],
  providers: [InscripcionSalidaService],
  exports: [InscripcionSalidaService],
})
export class InscripcionSalidaModule {}
