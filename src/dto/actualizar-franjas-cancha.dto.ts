import { IsBoolean, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class FranjaCanchaItemDto {
  @IsInt()
  @Min(1)
  @Max(7)
  diaSemana: number;

  @IsString()
  horaInicio: string;

  @IsBoolean()
  activa: boolean;

  /** Duración en horas (1 por defecto). Solo la directiva puede usar > 1. */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  duracionHoras?: number;
}

export class ActualizarFranjasCanchaDto {
  @IsOptional()
  @IsString()
  espacio?: string;

  @ValidateNested({ each: true })
  @Type(() => FranjaCanchaItemDto)
  franjas: FranjaCanchaItemDto[];
}
