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
import { SalidaService } from './salida.service';
import { CreateSalidaDto } from '../dto/create-salida.dto';
import { AsignarSalidaDto } from '../dto/asignar-salida.dto';
import { ProponerSalidaDto } from '../dto/proponer-salida.dto';
import { ResponderSalidaDto } from '../dto/responder-salida.dto';
import { AbrirSalidaDto } from '../dto/abrir-salida.dto';
import { CerrarSalidaDto } from '../dto/cerrar-salida.dto';

@Controller('salida')
export class SalidaController {
  constructor(private readonly salidaService: SalidaService) {}

  @Post('asignar')
  asignarDirectiva(@Body() dto: AsignarSalidaDto) {
    return this.salidaService.asignarDirectiva(dto);
  }

  @Post('proponer')
  proponerProfesor(@Body() dto: ProponerSalidaDto) {
    return this.salidaService.proponerProfesor(dto);
  }

  @Get('publicadas')
  findPublicadas(
    @Query('tallerId') tallerId?: string,
    @Query('alumnoId') alumnoId?: string,
  ) {
    if (alumnoId) {
      return this.salidaService.findPublicadasParaAlumno(parseInt(alumnoId, 10));
    }
    return this.salidaService.findPublicadas(
      tallerId ? parseInt(tallerId, 10) : undefined,
    );
  }

  @Get('pendientes/profesor/:profesorId')
  findPendientesProfesor(@Param('profesorId', ParseIntPipe) profesorId: number) {
    return this.salidaService.findPendientesProfesor(profesorId);
  }

  @Get('pendientes/directiva')
  findPendientesDirectiva() {
    return this.salidaService.findPendientesDirectiva();
  }

  @Get('por-profesor/:profesorId')
  findByProfesor(@Param('profesorId', ParseIntPipe) profesorId: number) {
    return this.salidaService.findByProfesor(profesorId);
  }

  @Post()
  create(@Body() createSalidaDto: CreateSalidaDto) {
    return this.salidaService.create(createSalidaDto);
  }

  @Get()
  findAll(@Query('tallerId') tallerId?: string) {
    if (tallerId) {
      return this.salidaService.findByTaller(parseInt(tallerId, 10));
    }
    return this.salidaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salidaService.findOne(id);
  }

  @Patch(':id/responder')
  responder(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResponderSalidaDto,
    @Query('actor') actor: 'profesor' | 'directiva',
    @Query('actorId') actorId?: string,
  ) {
    return this.salidaService.responder(
      id,
      dto,
      actor,
      actorId ? parseInt(actorId, 10) : undefined,
    );
  }

  @Patch(':id/abrir')
  abrir(
    @Param('id', ParseIntPipe) id: number,
    @Query('profesorId', ParseIntPipe) profesorId: number,
    @Body() dto: AbrirSalidaDto,
  ) {
    return this.salidaService.abrir(id, profesorId, dto);
  }

  @Patch(':id/cerrar')
  cerrar(
    @Param('id', ParseIntPipe) id: number,
    @Query('profesorId', ParseIntPipe) profesorId: number,
    @Body() dto: CerrarSalidaDto,
  ) {
    return this.salidaService.cerrar(id, profesorId, dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSalidaDto: Partial<CreateSalidaDto>,
  ) {
    return this.salidaService.update(id, updateSalidaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.salidaService.remove(id);
  }
}
