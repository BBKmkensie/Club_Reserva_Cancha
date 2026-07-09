/**
 * DTO para definir un bloque horario individual.
 */
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

/**
 * Valida día de la semana y rango de horas del bloque.
 */
export class DefinirHorarioDto {
  @IsInt()
  @Min(1)
  @Max(7)
  diaSemana: number;

  @IsString()
  @IsNotEmpty()
  horaInicio: string;

  @IsString()
  @IsNotEmpty()
  horaFin: string;
}
