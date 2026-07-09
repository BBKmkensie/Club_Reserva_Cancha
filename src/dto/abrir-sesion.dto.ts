/**
 * DTO para abrir una sesión de asistencia en un taller.
 */
import { IsInt, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

/**
 * Valida taller, profesor y fecha opcional de la sesión.
 */
export class AbrirSesionDto {
  @IsInt()
  @IsNotEmpty()
  tallerId: number;

  @IsInt()
  @IsNotEmpty()
  profesorId: number;

  @IsDateString()
  @IsOptional()
  fecha?: string;
}
