/**
 * DTO para cerrar una sesión de asistencia.
 */
import { IsOptional, IsString } from 'class-validator';

/**
 * Valida las observaciones opcionales al cerrar la sesión.
 */
export class CerrarSesionDto {
  @IsString()
  @IsOptional()
  observaciones?: string;
}
