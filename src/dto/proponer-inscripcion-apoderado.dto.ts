import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ProponerInscripcionApoderadoDto {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  tallerHorarioId?: number;

  @IsString()
  @IsOptional()
  mensajeApoderado?: string;
}
