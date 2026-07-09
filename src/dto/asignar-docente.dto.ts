/**
 * DTO para asignar un docente a un taller.
 */
import { IsInt, IsNotEmpty } from 'class-validator';

/**
 * Valida el identificador del profesor a asignar.
 */
export class AsignarDocenteDto {
  @IsInt()
  @IsNotEmpty()
  profesorId: number;
}
