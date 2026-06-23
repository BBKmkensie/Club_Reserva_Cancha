import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

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
