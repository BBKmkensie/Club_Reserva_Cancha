import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { InscripcionTallerService } from './inscripcion-taller.service';
import { InscripcionTallerController } from './inscripcion-taller.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InscripcionTaller])],
  controllers: [InscripcionTallerController],
  providers: [InscripcionTallerService],
  exports: [InscripcionTallerService],
})
export class InscripcionTallerModule {}
