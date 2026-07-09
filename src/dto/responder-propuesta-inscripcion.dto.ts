import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ResponderPropuestaInscripcionDto {
  @IsBoolean()
  acepta: boolean;

  @IsString()
  @IsOptional()
  motivoRechazo?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  horarioSugeridoId?: number;

  @IsString()
  @IsOptional()
  mensajeDirectiva?: string;
}
