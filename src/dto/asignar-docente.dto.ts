import { IsInt, IsNotEmpty } from 'class-validator';

export class AsignarDocenteDto {
  @IsInt()
  @IsNotEmpty()
  profesorId: number;
}
