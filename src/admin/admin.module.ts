/**
 * =============================================================================
 * admin/admin.module.ts — MÓDULO CRUD DE ADMINISTRADORES
 * =============================================================================
 * Patrón Nest (igual que AuthModule, pero más simple):
 *   Module registra → Controller recibe HTTP → Service habla con PostgreSQL
 *
 * forFeature([Admin]) = este módulo puede inyectar Repository<Admin>
 * exports: [AdminService] = otros módulos pueden usar AdminService
 * =============================================================================
 */

// Module = decorador Nest que agrupa imports/controllers/providers/exports.
import { Module } from '@nestjs/common';

// TypeOrmModule = registra la entidad Admin para inyectar Repository<Admin>.
import { TypeOrmModule } from '@nestjs/typeorm';

// AdminService = lógica CRUD; AdminController = rutas /admin.
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

// Admin = entidad TypeORM (= tabla `admin`).
import { Admin } from '../entities/admin.entity';

/**
 * AdminModule:
 *   - imports    → acceso a tabla admin
 *   - controllers → rutas HTTP /admin
 *   - providers  → lógica CRUD
 *   - exports    → AdminService reutilizable desde otros módulos
 */
@Module({
  imports: [TypeOrmModule.forFeature([Admin])], // acceso a tabla `admin`
  controllers: [AdminController], // rutas /admin
  providers: [AdminService], // lógica CRUD
  exports: [AdminService], // reusable desde AuthModule u otros
})
export class AdminModule {}
