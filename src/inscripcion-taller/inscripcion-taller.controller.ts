import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { InscripcionTallerService } from './inscripcion-taller.service';
import { CreateInscripcionTallerDto } from '../dto/create-inscripcion-taller.dto';
import { ResponderInscripcionTallerDto } from '../dto/responder-inscripcion-taller.dto';
import { ActualizarFichaAlumnoDto } from '../dto/ficha-alumno.dto';
import { ProponerInscripcionDirectivaDto } from '../dto/proponer-inscripcion-directiva.dto';
import { ResponderPropuestaInscripcionDto } from '../dto/responder-propuesta-inscripcion.dto';

@Controller('inscripcion-taller')
export class InscripcionTallerController {
  constructor(private readonly inscripcionTallerService: InscripcionTallerService) {}

  @Post()
  solicitar(@Body() dto: CreateInscripcionTallerDto) {
    return this.inscripcionTallerService.solicitar(dto);
  }

  @Get('validar/:alumnoId/:tallerId')
  validar(
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Param('tallerId', ParseIntPipe) tallerId: number,
    @Query('notificar') notificar?: string,
  ) {
    return this.inscripcionTallerService.validar(
      alumnoId,
      tallerId,
      notificar === 'true',
    );
  }

  @Get('resumen/:tallerId')
  resumen(@Param('tallerId', ParseIntPipe) tallerId: number) {
    return this.inscripcionTallerService.getResumen(tallerId);
  }

  @Get('por-taller/:tallerId')
  findByTaller(@Param('tallerId', ParseIntPipe) tallerId: number) {
    return this.inscripcionTallerService.findByTaller(tallerId);
  }

  @Get('por-alumno/:alumnoId')
  findByAlumno(@Param('alumnoId', ParseIntPipe) alumnoId: number) {
    return this.inscripcionTallerService.findByAlumno(alumnoId);
  }

  @Patch(':id/responder')
  responder(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResponderInscripcionTallerDto,
  ) {
    return this.inscripcionTallerService.responder(id, dto);
  }

  @Patch(':id/ficha')
  actualizarFicha(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarFichaAlumnoDto,
  ) {
    return this.inscripcionTallerService.actualizarFicha(id, dto);
  }

  @Post('proponer-directiva')
  proponerDirectiva(@Body() dto: ProponerInscripcionDirectivaDto) {
    return this.inscripcionTallerService.proponerDirectiva(dto);
  }

  @Get('propuestas/pendientes')
  getPropuestasPendientes() {
    return this.inscripcionTallerService.getPropuestasPendientes();
  }

  @Patch('propuestas/:id/responder')
  responderPropuesta(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResponderPropuestaInscripcionDto,
  ) {
    return this.inscripcionTallerService.responderPropuesta(id, dto);
  }
}
