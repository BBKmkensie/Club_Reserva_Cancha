/**
 * DTO para actualizar el umbral de ausencias permitidas.
 */
import { IsInt, Min, Max, IsOptional } from 'class-validator';

/**
 * Valida el límite de ausencias (o su alias umbral).
 */
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
