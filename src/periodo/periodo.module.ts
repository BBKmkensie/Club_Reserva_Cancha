import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeriodoAcademico } from '../entities/periodo-academico.entity';
import { PeriodoService } from './periodo.service';
import { PeriodoController } from './periodo.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([PeriodoAcademico])],
  controllers: [PeriodoController],
  providers: [PeriodoService],
  exports: [PeriodoService],
})
export class PeriodoModule {}
