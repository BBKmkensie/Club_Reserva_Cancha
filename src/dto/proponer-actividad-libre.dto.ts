/**
 * DTO para que un apoderado proponga una actividad libre.
 */
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * Valida nombre, descripción, horario propuesto y mensaje al apoderado.
 */
export class ProponerActividadLibreDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  actividadNombre: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  actividadDescripcion?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  horarioPropuestoTexto: string;

  @IsString()
  @IsOptional()
  mensajeApoderado?: string;
}
