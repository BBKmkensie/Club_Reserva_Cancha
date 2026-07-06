import { IsInt, Min, Max, IsOptional } from 'class-validator';

export class ActualizarUmbralDto {
  @IsInt()
  @Min(1)
  @Max(20)
  @IsOptional()
  umbralAusencias?: number;

  /** Alias aceptado por el frontend */
  @IsInt()
  @Min(1)
  @Max(20)
  @IsOptional()
  umbral?: number;
}
