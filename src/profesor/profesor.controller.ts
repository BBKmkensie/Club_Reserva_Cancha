/**
 * Controlador REST de profesores.
 * CRUD, filtrado por taller y endpoint legacy de login propio.
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
import { ProfesorService } from './profesor.service';
import { CreateProfesorDto } from '../dto/create-profesor.dto';
import { LoginProfesorDto } from '../dto/login-profesor.dto';

@Controller('profesor')
export class ProfesorController {
  constructor(private readonly profesorService: ProfesorService) {}

  /** Login histórico; el flujo principal usa POST /auth/login. */
  @Post('login')
  login(@Body() dto: LoginProfesorDto) {
    return this.profesorService.login(dto.usuario, dto.password);
  }

  @Post()
  create(@Body() createProfesorDto: CreateProfesorDto) {
    return this.profesorService.create(createProfesorDto);
  }

  /** Lista todos los profesores o solo los de un taller si se pasa `tallerId`. */
  @Get()
  findAll(@Query('tallerId') tallerId?: string) {
    if (tallerId) {
      return this.profesorService.findByTaller(parseInt(tallerId, 10));
    }
    return this.profesorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.profesorService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProfesorDto: Partial<CreateProfesorDto>,
  ) {
    return this.profesorService.update(id, updateProfesorDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.profesorService.remove(id);
  }
}
