/**
 * DTO para que la directiva proponga inscripción de un alumno a taller.
 */
import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Valida alumno, taller, horario y mensaje de la propuesta.
 */
export class ProponerInscripcionDirectivaDto {
  @IsInt()
  @Type(() => Number)
  alumnoId: number;

  @IsInt()
  @Type(() => Number)
  tallerId: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  tallerHorarioId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  horarioPropuestoTexto?: string;

  @IsString()
  @IsOptional()
  mensajeApoderado?: string;
}
