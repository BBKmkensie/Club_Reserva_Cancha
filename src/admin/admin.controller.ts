/**
 * =============================================================================
 * admin/admin.controller.ts — RUTAS HTTP DEL CRUD DE ADMIN
 * =============================================================================
 * Prefijo: @Controller('admin') → todo empieza con /admin
 *
 * Endpoints:
 *   POST   /admin      → crear admin
 *   GET    /admin      → listar todos
 *   GET    /admin/:id  → uno por id
 *   DELETE /admin/:id  → eliminar
 *
 * ParseIntPipe: convierte el :id de string a number; si no es número → 400
 * El controller NO hashea passwords ni toca la BD: solo llama al service.
 * =============================================================================
 */

// Controller/Get/Post/Delete = rutas HTTP; Body = JSON del body;
// Param = :id de la URL; ParseIntPipe = string → number con validación.
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';

// AdminService = create / findAll / findOne / remove.
import { AdminService } from './admin.service';

// CreateAdminDto = valida nombre, rut, email, password (min 6), rol opcional.
import { CreateAdminDto } from '../dto/create-admin.dto';

/**
 * AdminController:
 *   - Prefijo /admin
 *   - Solo recibe HTTP y delega al AdminService
 */
@Controller('admin')
export class AdminController {
  /** Nest inyecta AdminService (registrado en AdminModule). */
  constructor(private readonly adminService: AdminService) {}

  /**
   * POST /admin
   * @Body() createAdminDto → JSON validado por CreateAdminDto + ValidationPipe global.
   */
  @Post()
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }

  /** GET /admin — lista todos los administradores. */
  @Get()
  findAll() {
    return this.adminService.findAll();
  }

  /**
   * GET /admin/:id
   * @Param('id', ParseIntPipe) → "5" se convierte a 5; si no es número → 400.
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.findOne(id);
  }

  /**
   * DELETE /admin/:id
   * Borra el registro; si no existe, el service lanza 404.
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.remove(id);
  }
}
