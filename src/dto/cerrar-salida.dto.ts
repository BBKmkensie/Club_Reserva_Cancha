/**
 * DTO para cerrar una salida pedagógica con resultado.
 */
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

/**
 * Valida el resultado y comentario obligatorio del cierre.
 */
export class CerrarSalidaDto {
  @IsIn(['EXITO', 'FRACASO'])
  resultado: 'EXITO' | 'FRACASO';

  @IsString()
  @IsNotEmpty()
  comentario: string;
}
