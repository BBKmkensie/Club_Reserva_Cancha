/**
 * DTO para subir imagen de evidencia de asistencia en una salida (base64).
 */
import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class SubirImagenSalidaDto {
  @IsString()
  @IsNotEmpty()
  imagenBase64: string;

  @IsIn(['image/jpeg', 'image/png', 'image/webp', 'image/jpg'])
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/jpg';
}
