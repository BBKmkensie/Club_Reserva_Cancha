import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateInscripcionSalidaDto {
  @IsInt()
  @IsNotEmpty()
  alumnoId: number;

  @IsInt()
  @IsNotEmpty()
  salidaId: number;
}
