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

@Controller('reserva')
export class ReservaController {
  constructor(private readonly reservaService: ReservaService) {}

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

  @Post()
  create(@Body() createReservaDto: CreateReservaDto) {
    return this.reservaService.create(createReservaDto);
  }

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

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reservaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReservaDto: Partial<CreateReservaDto>,
  ) {
    return this.reservaService.update(id, updateReservaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reservaService.remove(id);
  }
}
