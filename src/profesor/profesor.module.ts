/**
 * =============================================================================
 * profesor/profesor.module.ts — MÓDULO DE PROFESORES
 * =============================================================================
 * CRUD + login legacy (POST /profesor/login).
 * El login principal del sistema es POST /auth/login (AuthModule).
 * =============================================================================
 */

// Module = decorador Nest que agrupa imports/controllers/providers/exports.
import { Module } from '@nestjs/common';

// TypeOrmModule = registra la entidad Profesor para Repository<Profesor>.
import { TypeOrmModule } from '@nestjs/typeorm';

// ProfesorService = lógica CRUD + login legacy.
import { ProfesorService } from './profesor.service';

// ProfesorController = rutas HTTP /profesor.
import { ProfesorController } from './profesor.controller';

// Profesor = entidad TypeORM (= tabla `profesores`).
import { Profesor } from '../entities/profesor.entity';

/**
 * ProfesorModule:
 *   - CRUD de profesores
 *   - Exporta ProfesorService por si otros módulos lo necesitan
 */
@Module({
  imports: [TypeOrmModule.forFeature([Profesor])], // tabla `profesores`
  controllers: [ProfesorController],
  providers: [ProfesorService],
  exports: [ProfesorService],
})
export class ProfesorModule {}
