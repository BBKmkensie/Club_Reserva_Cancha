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

  /** Duración en minutos (30 por defecto). Solo la directiva puede ampliar franjas. */
  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(180)
  duracionMinutos?: number;
}

export class ActualizarFranjasCanchaDto {
  @IsOptional()
  @IsString()
  espacio?: string;

  @ValidateNested({ each: true })
  @Type(() => FranjaCanchaItemDto)
  franjas: FranjaCanchaItemDto[];
}
