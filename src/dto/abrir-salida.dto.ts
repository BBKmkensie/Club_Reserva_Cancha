import { IsOptional, IsString } from 'class-validator';

export class AbrirSalidaDto {
  @IsString()
  @IsOptional()
  comentario?: string;
}
