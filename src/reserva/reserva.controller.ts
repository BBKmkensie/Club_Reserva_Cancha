/**
 * =============================================================================
 * reserva/reserva.controller.ts — ENDPOINTS HTTP DE RESERVAS
 * =============================================================================
 * Prefijo de ruta: /reserva
 *
 * Endpoints:
 *   GET    /reserva/disponibilidad-semana  → grilla de 7 días
 *   GET    /reserva/disponibilidad         → slots de un día
 *   POST   /reserva                        → crear reserva
 *   GET    /reserva                        → listar (filtros tallerId / fecha)
 *   GET    /reserva/:id                    → detalle
 *   PATCH  /reserva/:id                    → actualizar
 *   DELETE /reserva/:id                    → eliminar
 *
 * La lógica de negocio vive en ReservaService; aquí solo se recibe la
 * petición HTTP, se parsean query/params y se delega al service.
 * =============================================================================
 */
// Get/Post/Patch/Delete = verbos HTTP; Body = JSON; Param = :id; Query = ?clave=;
// ParseIntPipe convierte el string de la URL a number.
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
import { ReservaService } from './reserva.service';
import { CreateReservaDto } from '../dto/create-reserva.dto';
import { CANCHA_ESPACIO_DEFAULT } from './cancha.constants';

/** @Controller('reserva') = todas las rutas de esta clase empiezan con /reserva */
@Controller('reserva')
export class ReservaController {
  /** Nest inyecta ReservaService automáticamente (está en providers del módulo). */
  constructor(private readonly reservaService: ReservaService) {}

  /**
   * GET /reserva/disponibilidad-semana?fechaInicio=&espacio=
   * @Query lee query string. Devuelve los 7 días desde el lunes de esa semana.
   */
  @Get('disponibilidad-semana')
  obtenerDisponibilidadSemana(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('espacio') espacio?: string,
  ) {
    // Si no mandan espacio, usamos "Cancha Principal"
    return this.reservaService.obtenerDisponibilidadSemana(
      fechaInicio,
      espacio ?? CANCHA_ESPACIO_DEFAULT,
    );
  }

  /**
   * GET /reserva/disponibilidad?fecha=YYYY-MM-DD&espacio=
   * Slots de un solo día con estado disponible / ocupada / no_habilitada.
   */
  @Get('disponibilidad')
  obtenerDisponibilidad(
    @Query('fecha') fecha: string,
    @Query('espacio') espacio?: string,
  ) {
    return this.reservaService.obtenerDisponibilidad(
      fecha,
      espacio ?? CANCHA_ESPACIO_DEFAULT,
    );
  }

  /**
   * POST /reserva — @Body() CreateReservaDto (fecha, horas, tallerId, etc.).
   * El service valida franja y solapes antes de save().
   */
  @Post()
  create(@Body() createReservaDto: CreateReservaDto) {
    return this.reservaService.create(createReservaDto);
  }

  /**
   * GET /reserva — listado con filtros opcionales por query string.
   * Si viene tallerId → reservas de ese taller.
   * Si viene fecha → reservas de ese día.
   * Si no hay filtros → todas.
   */
  @Get()
  findAll(
    @Query('tallerId') tallerId?: string,
    @Query('fecha') fecha?: string,
  ) {
    if (tallerId) {
      return this.reservaService.findByTaller(parseInt(tallerId, 10));
    }
    if (fecha) {
      return this.reservaService.findByFecha(fecha);
    }
    return this.reservaService.findAll();
  }

  /**
   * GET /reserva/:id
   * @Param('id', ParseIntPipe) convierte el string de la URL a number.
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reservaService.findOne(id);
  }

  /** PATCH /reserva/:id — actualización parcial (Partial<CreateReservaDto>). */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReservaDto: Partial<CreateReservaDto>,
  ) {
    return this.reservaService.update(id, updateReservaDto);
  }

  /** DELETE /reserva/:id — elimina la reserva de la BD. */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reservaService.remove(id);
  }
}
