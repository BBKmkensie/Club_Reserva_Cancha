/**
 * DTOs para actualizar franjas horarias de canchas deportivas.
 */
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Valida día, horario, estado y duración de una franja.
 */
export class FranjaCanchaItemDto {
  @IsInt()
  @Min(1)
  @Max(7)
  diaSemana: number;

  @IsString()
  horaInicio: string;

  @IsBoolean()
  activa: boolean;

  /** Duración en minutos (30 por defecto). Solo la directiva puede ampliar franjas. */
  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(180)
  duracionMinutos?: number;
}

/**
 * Valida el espacio y el conjunto de franjas a modificar.
 */
export class ActualizarFranjasCanchaDto {
  @IsOptional()
  @IsString()
  espacio?: string;

  @ValidateNested({ each: true })
  @Type(() => FranjaCanchaItemDto)
  franjas: FranjaCanchaItemDto[];
}
