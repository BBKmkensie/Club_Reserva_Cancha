import { IsDateString, IsOptional } from 'class-validator';

export class PublicarActividadDto {
  @IsDateString()
  @IsOptional()
  fechaAperturaInscripcion?: string;

  @IsDateString()
  @IsOptional()
  fechaCierreInscripcion?: string;
}
