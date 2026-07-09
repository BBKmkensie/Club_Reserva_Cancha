/**
 * DTO para inscribir un alumno en una salida pedagógica.
 */
import { IsInt, IsNotEmpty } from 'class-validator';

/**
 * Valida los identificadores de alumno y salida.
 */
export class CreateInscripcionSalidaDto {
  @IsInt()
  @IsNotEmpty()
  alumnoId: number;

  @IsInt()
  @IsNotEmpty()
  salidaId: number;
}
