/**
 * DTOs para actualizar registros de asistencia de una sesión.
 */
import { IsInt, IsIn, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Valida el estado de asistencia de un alumno individual.
 */
export class RegistroAsistenciaItemDto {
  @IsInt()
  alumnoId: number;

  @IsIn(['PRESENTE', 'AUSENTE'])
  estado: 'PRESENTE' | 'AUSENTE';

  @IsString()
  @IsOptional()
  observacion?: string;
}

/**
 * Valida la lista de registros de asistencia a actualizar.
 */
export class ActualizarAsistenciaDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RegistroAsistenciaItemDto)
  registros: RegistroAsistenciaItemDto[];
}
