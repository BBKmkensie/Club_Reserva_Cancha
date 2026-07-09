/**
 * DTO para actualizar la presentación pública de un taller.
 */
import { IsInt, IsOptional, IsString } from 'class-validator';

/**
 * Valida descripción, imagen y profesor opcionales del taller.
 */
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
