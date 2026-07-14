/**
 * =============================================================================
 * periodo/periodo.module.ts — MÓDULO GLOBAL DEL PERÍODO ACADÉMICO
 * =============================================================================
 * @Global() = PeriodoService queda disponible en TODOS los módulos sin
 * tener que importar PeriodoModule en cada uno (útil porque inscripciones,
 * talleres, etc. consultan si el período está abierto).
 *
 * Prefijo HTTP del controller: /periodo
 * =============================================================================
 */
// Global = PeriodoService inyectable en todo AppModule sin re-importar
import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeriodoAcademico } from '../entities/periodo-academico.entity';
import { PeriodoService } from './periodo.service';
import { PeriodoController } from './periodo.controller';

/** Agrupa la configuración y consulta del período académico vigente. */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([PeriodoAcademico])],
  controllers: [PeriodoController],
  providers: [PeriodoService],
  exports: [PeriodoService],
})
export class PeriodoModule {}
