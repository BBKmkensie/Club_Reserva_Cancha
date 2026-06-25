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
import { TallerService } from './taller.service';
import { CreateTallerDto } from '../dto/create-taller.dto';
import { AsignarDocenteDto } from '../dto/asignar-docente.dto';
import { ResponderAsignacionDto } from '../dto/responder-asignacion.dto';
import { DefinirHorarioDto } from '../dto/definir-horario.dto';
import { DefinirHorariosTallerDto } from '../dto/definir-horarios-taller.dto';
import { PublicarActividadDto } from '../dto/publicar-actividad.dto';
import { ActualizarPresentacionTallerDto } from '../dto/actualizar-presentacion-taller.dto';

@Controller('taller')
export class TallerController {
  constructor(private readonly tallerService: TallerService) {}

  @Get('catalogo')
  findCatalogo() {
    return this.tallerService.findCatalogo();
  }

  @Get('asignaciones/pendientes')
  getAsignacionesPendientes(@Query('profesorId', ParseIntPipe) profesorId: number) {
    return this.tallerService.getAsignacionesPendientes(profesorId);
  }

  @Get('estadisticas/semestre')
  getComparacionSemestre(
    @Query('periodoId') periodoId?: string,
    @Query('profesorId') profesorId?: string,
  ) {
    const periodo = periodoId ? parseInt(periodoId, 10) : undefined;
    const profesor = profesorId ? parseInt(profesorId, 10) : undefined;
    return this.tallerService.getComparacionSemestre(periodo, profesor);
  }

  @Post()
  create(@Body() createTallerDto: CreateTallerDto) {
    return this.tallerService.create(createTallerDto);
  }

  @Get()
  findAll() {
    return this.tallerService.findAll();
  }

  @Post(':id/asignar-docente')
  asignarDocente(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AsignarDocenteDto,
  ) {
    return this.tallerService.asignarDocente(id, dto);
  }

  @Patch('asignacion/:id/responder')
  responderAsignacion(
    @Param('id', ParseIntPipe) id: number,
    @Query('profesorId', ParseIntPipe) profesorId: number,
    @Body() dto: ResponderAsignacionDto,
  ) {
    return this.tallerService.responderAsignacion(id, profesorId, dto);
  }

  @Patch(':id/horario')
  definirHorario(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DefinirHorarioDto | DefinirHorariosTallerDto,
  ) {
    return this.tallerService.definirHorario(id, dto);
  }

  @Get(':id/horarios')
  getHorarios(@Param('id', ParseIntPipe) id: number) {
    return this.tallerService.getHorarios(id);
  }

  @Patch(':id/publicar')
  publicar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PublicarActividadDto,
  ) {
    return this.tallerService.publicar(id, dto);
  }

  @Patch(':id/presentacion')
  actualizarPresentacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarPresentacionTallerDto,
    @Query('esDirectiva') esDirectiva?: string,
    @Query('profesorId') profesorId?: string,
  ) {
    return this.tallerService.actualizarPresentacion(id, dto, {
      esDirectiva: esDirectiva === 'true',
      profesorId: profesorId ? parseInt(profesorId, 10) : undefined,
    });
  }

  @Patch(':id/cerrar')
  cerrarPeriodo(@Param('id', ParseIntPipe) id: number) {
    return this.tallerService.cerrarPeriodo(id);
  }

  @Get(':id/reporte')
  getReporte(@Param('id', ParseIntPipe) id: number) {
    return this.tallerService.getReporteActividad(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tallerService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTallerDto: Partial<CreateTallerDto>,
  ) {
    return this.tallerService.update(id, updateTallerDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tallerService.remove(id);
  }
}
