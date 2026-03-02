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

@Controller('salida')
export class SalidaController {
  constructor(private readonly salidaService: SalidaService) {}

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

