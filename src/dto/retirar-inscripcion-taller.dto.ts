import { IsInt, Min } from 'class-validator';

export class RetirarInscripcionTallerDto {
  @IsInt()
  @Min(1)
  alumnoId: number;
}
