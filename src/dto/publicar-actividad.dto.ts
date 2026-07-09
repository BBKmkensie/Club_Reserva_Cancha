/**
 * DTO para publicar una actividad y abrir su ventana de inscripción.
 */
import { IsDateString, IsOptional } from 'class-validator';

/**
 * Valida fechas opcionales de apertura y cierre de inscripciones.
 */
export class PublicarActividadDto {
  @IsDateString()
  @IsOptional()
  fechaAperturaInscripcion?: string;

  @IsDateString()
  @IsOptional()
  fechaCierreInscripcion?: string;
}
