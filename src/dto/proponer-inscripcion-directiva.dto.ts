import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class ProponerInscripcionDirectivaDto {
  @IsInt()
  @Type(() => Number)
  alumnoId: number;

  @IsInt()
  @Type(() => Number)
  tallerId: number;
}
