/**
 * Controlador REST de alumnos.
 * Expone CRUD y filtrado opcional por taller.
 */
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
import { AlumnoService } from './alumno.service';
import { CreateAlumnoDto } from '../dto/create-alumno.dto';

@Controller('alumno')
export class AlumnoController {
  constructor(private readonly alumnoService: AlumnoService) {}

  @Post()
  create(@Body() createAlumnoDto: CreateAlumnoDto) {
    return this.alumnoService.create(createAlumnoDto);
  }

  /** Lista todos los alumnos o solo los de un taller si se pasa `tallerId`. */
  @Get()
  findAll(@Query('tallerId') tallerId?: string) {
    if (tallerId) {
      return this.alumnoService.findByTaller(parseInt(tallerId, 10));
    }
    return this.alumnoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.alumnoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAlumnoDto: Partial<CreateAlumnoDto>,
  ) {
    return this.alumnoService.update(id, updateAlumnoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.alumnoService.remove(id);
  }
}
