/**
 * DTO para responder a una inscripción de taller.
 */
import { IsIn } from 'class-validator';

/**
 * Valida el estado de aceptación o rechazo de la inscripción.
 */
export class ResponderInscripcionTallerDto {
  @IsIn(['ACEPTADO', 'RECHAZADO'])
  estado: 'ACEPTADO' | 'RECHAZADO';
}
