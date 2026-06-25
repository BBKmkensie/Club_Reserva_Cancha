import { IsInt, IsOptional, IsString } from 'class-validator';

export class ActualizarPresentacionTallerDto {
  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  fotoPath?: string;

  @IsOptional()
  @IsInt()
  profesorId?: number;
}
