/**
 * DTO para retirar la inscripción de un alumno en un taller.
 */
import { IsInt, Min } from 'class-validator';

/**
 * Valida el identificador del alumno a desinscribir.
 */
export class RetirarInscripcionTallerDto {
  @IsInt()
  @Min(1)
  alumnoId: number;
}
