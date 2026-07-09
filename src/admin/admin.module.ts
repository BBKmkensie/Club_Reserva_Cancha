/**
 * Módulo NestJS de administradores.
 * Registra servicio, controlador y repositorio TypeORM de la entidad Admin.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Admin } from '../entities/admin.entity';

/** Agrupa la gestión de cuentas de administración. */
@Module({
  imports: [TypeOrmModule.forFeature([Admin])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}

