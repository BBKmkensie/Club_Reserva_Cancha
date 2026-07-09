/**
 * DTO para que un apoderado proponga la inscripción de su pupilo.
 */
import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Valida horario sugerido y mensaje opcional de la propuesta.
 */
export class ProponerInscripcionApoderadoDto {
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
