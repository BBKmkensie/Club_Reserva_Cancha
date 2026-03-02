import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { InscripcionTallerService } from './inscripcion-taller.service';
import { CreateInscripcionTallerDto } from '../dto/create-inscripcion-taller.dto';
import { ResponderInscripcionTallerDto } from '../dto/responder-inscripcion-taller.dto';

@Controller('inscripcion-taller')
export class InscripcionTallerController {
  constructor(private readonly inscripcionTallerService: InscripcionTallerService) {}

  @Post()
  solicitar(@Body() dto: CreateInscripcionTallerDto) {
    return this.inscripcionTallerService.solicitar(dto);
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
}
