/**
 * =============================================================================
 * profesor/profesor.controller.ts — RUTAS HTTP DE PROFESORES
 * =============================================================================
 * Prefijo: /profesor
 *
 *   POST   /profesor/login       → login legacy (hoy se prefiere /auth/login)
 *   POST   /profesor             → crear
 *   GET    /profesor             → listar (opcional ?tallerId=)
 *   GET    /profesor/:id         → uno
 *   PATCH  /profesor/:id         → actualizar
 *   DELETE /profesor/:id         → eliminar
 *
 * Orden de rutas: 'login' va ANTES de ':id' para que Nest no confunda
 * "login" con un id numérico.
 * =============================================================================
 */

// Controller/Get/Post/Patch/Delete = rutas HTTP; Body = JSON;
// Param = :id; ParseIntPipe = string→number; Query = ?tallerId=.
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';

// ProfesorService = create / findAll / login / update / remove...
import { ProfesorService } from './profesor.service';

// CreateProfesorDto = datos de creación (nombre, rut, email, tallerId, password...).
import { CreateProfesorDto } from '../dto/create-profesor.dto';

// LoginProfesorDto = body del login legacy { usuario, password }.
import { LoginProfesorDto } from '../dto/login-profesor.dto';

/**
 * ProfesorController:
 *   - Prefijo /profesor
 *   - 'login' declarado ANTES de ':id' para no chocar con la ruta dinámica
 */
@Controller('profesor')
export class ProfesorController {
  /** Nest inyecta ProfesorService (registrado en ProfesorModule). */
  constructor(private readonly profesorService: ProfesorService) {}

  /**
   * POST /profesor/login
   * Login histórico; el flujo principal usa POST /auth/login.
   */
  @Post('login')
  login(@Body() dto: LoginProfesorDto) {
    return this.profesorService.login(dto.usuario, dto.password);
  }

  /** POST /profesor — crear profesor ligado a un tallerId obligatorio. */
  @Post()
  create(@Body() createProfesorDto: CreateProfesorDto) {
    return this.profesorService.create(createProfesorDto);
  }

  /**
   * GET /profesor o GET /profesor?tallerId=2
   * Si viene tallerId → filtra; si no → lista todos.
   */
  @Get()
  findAll(@Query('tallerId') tallerId?: string) {
    if (tallerId) {
      return this.profesorService.findByTaller(parseInt(tallerId, 10));
    }
    return this.profesorService.findAll();
  }

  /** GET /profesor/:id */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.profesorService.findOne(id);
  }

  /**
   * PATCH /profesor/:id
   * Partial<CreateProfesorDto> = actualización parcial (solo campos enviados).
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProfesorDto: Partial<CreateProfesorDto>,
  ) {
    return this.profesorService.update(id, updateProfesorDto);
  }

  /** DELETE /profesor/:id */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.profesorService.remove(id);
  }
}
