import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  ParseIntPipe,
  Query,
  Param,
} from '@nestjs/common';
import { InscripcionSalidaService } from './inscripcion-salida.service';
import { CreateInscripcionSalidaDto } from '../dto/create-inscripcion-salida.dto';

@Controller('inscripcion-salida')
export class InscripcionSalidaController {
  constructor(private readonly inscripcionSalidaService: InscripcionSalidaService) {}

  @Post()
  inscribir(@Body() dto: CreateInscripcionSalidaDto) {
    return this.inscripcionSalidaService.inscribir(dto);
  }

  @Get('por-salida/:salidaId')
  findBySalida(@Param('salidaId', ParseIntPipe) salidaId: number) {
    return this.inscripcionSalidaService.findBySalida(salidaId);
  }

  @Get('por-alumno/:alumnoId')
  findByAlumno(@Param('alumnoId', ParseIntPipe) alumnoId: number) {
    return this.inscripcionSalidaService.findByAlumno(alumnoId);
  }

  @Delete()
  remove(
    @Query('alumnoId', ParseIntPipe) alumnoId: number,
    @Query('salidaId', ParseIntPipe) salidaId: number,
  ) {
    return this.inscripcionSalidaService.remove(alumnoId, salidaId);
  }
}
