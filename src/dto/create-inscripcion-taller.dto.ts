/**
 * DTO para inscribir un alumno en un taller con ficha antropométrica.
 */
import { IsInt, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FichaAlumnoDto } from './ficha-alumno.dto';

/**
 * Valida alumno, taller y ficha física requerida para la inscripción.
 */
export class CreateInscripcionTallerDto {
  @IsInt()
  @IsNotEmpty()
  alumnoId: number;

  @IsInt()
  @IsNotEmpty()
  tallerId: number;

  @ValidateNested()
  @Type(() => FichaAlumnoDto)
  ficha: FichaAlumnoDto;
}
