import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalidaService } from './salida.service';
import { SalidaController } from './salida.controller';
import { Salida } from '../entities/salida.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Salida])],
  controllers: [SalidaController],
  providers: [SalidaService],
  exports: [SalidaService],
})
export class SalidaModule {}

