import { IsInt, Min, Max } from 'class-validator';

export class ActualizarUmbralDto {
  @IsInt()
  @Min(1)
  @Max(20)
  umbralAusencias: number;
}
