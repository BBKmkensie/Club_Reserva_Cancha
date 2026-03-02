import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateInscripcionTallerDto {
  @IsInt()
  @IsNotEmpty()
  alumnoId: number;

  @IsInt()
  @IsNotEmpty()
  tallerId: number;
}
