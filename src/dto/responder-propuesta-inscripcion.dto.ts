/**
 * DTO para responder a una propuesta de inscripción a taller.
 */
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Valida aceptación, motivo de rechazo y horario sugerido opcional.
 */
export class ResponderPropuestaInscripcionDto {
  @IsBoolean()
  acepta: boolean;

  @IsString()
  @IsOptional()
  motivoRechazo?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  horarioSugeridoId?: number;

  @IsString()
  @IsOptional()
  mensajeDirectiva?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  horarioSugeridoTexto?: string;
}
