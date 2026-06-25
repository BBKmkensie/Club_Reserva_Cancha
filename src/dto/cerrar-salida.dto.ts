import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CerrarSalidaDto {
  @IsIn(['EXITO', 'FRACASO'])
  resultado: 'EXITO' | 'FRACASO';

  @IsString()
  @IsNotEmpty()
  comentario: string;
}
