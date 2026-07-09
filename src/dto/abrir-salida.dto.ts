/**
 * DTO para abrir el registro de una salida pedagógica.
 */
import { IsOptional, IsString } from 'class-validator';

/**
 * Valida el comentario opcional al abrir la salida.
 */
export class AbrirSalidaDto {
  @IsString()
  @IsOptional()
  comentario?: string;
}
