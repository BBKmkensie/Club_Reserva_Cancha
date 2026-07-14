/**
 * =============================================================================
 * alumno/alumno.controller.ts — RUTAS HTTP CRUD DE ALUMNOS
 * =============================================================================
 * Prefijo: /alumno
 *
 *   POST   /alumno              → crear
 *   GET    /alumno              → listar todos
 *   GET    /alumno?tallerId=3   → filtrar por taller (query string)
 *   GET    /alumno/:id          → uno por id
 *   PATCH  /alumno/:id          → actualizar parcial
 *   DELETE /alumno/:id          → eliminar
 *
 * @Query('tallerId') lee ?tallerId= de la URL (opcional).
 * =============================================================================
 */

// Controller/Get/Post/Patch/Delete = rutas HTTP; Body = JSON;
// Param = :id; ParseIntPipe = string→number; Query = ?tallerId= de la URL.
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

// AlumnoService = create / findAll / findByTaller / findOne / update / remove.
import { AlumnoService } from './alumno.service';

// CreateAlumnoDto = datos de creación (nombre, rut, email, edad, password...).
import { CreateAlumnoDto } from '../dto/create-alumno.dto';

/**
 * AlumnoController:
 *   - Prefijo /alumno
 *   - Controller delgado: solo HTTP → AlumnoService
 */
@Controller('alumno')
export class AlumnoController {
  /** Nest inyecta AlumnoService (registrado en AlumnoModule). */
  constructor(private readonly alumnoService: AlumnoService) {}

  /** POST /alumno — crea alumno (edad validada, password hasheada en el service). */
  @Post()
  create(@Body() createAlumnoDto: CreateAlumnoDto) {
    return this.alumnoService.create(createAlumnoDto);
  }

  /**
   * GET /alumno o GET /alumno?tallerId=5
   * Si viene tallerId → solo alumnos de ese taller; si no → todos.
   */
  @Get()
  findAll(@Query('tallerId') tallerId?: string) {
    // ?tallerId= llega como string; parseInt(..., 10) lo pasa a number
    if (tallerId) {
      return this.alumnoService.findByTaller(parseInt(tallerId, 10));
    }
    return this.alumnoService.findAll();
  }

  /** GET /alumno/:id */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.alumnoService.findOne(id);
  }

  /**
   * PATCH /alumno/:id
   * Partial<CreateAlumnoDto> = se pueden mandar solo algunos campos
   * (ej. solo { telefono: "..." } sin reenviar todo).
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAlumnoDto: Partial<CreateAlumnoDto>,
  ) {
    return this.alumnoService.update(id, updateAlumnoDto);
  }

  /** DELETE /alumno/:id */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.alumnoService.remove(id);
  }
}
