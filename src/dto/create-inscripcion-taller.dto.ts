import { IsInt, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FichaAlumnoDto } from './ficha-alumno.dto';

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
