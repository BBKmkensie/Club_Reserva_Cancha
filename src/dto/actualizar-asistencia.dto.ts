import { IsInt, IsIn, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RegistroAsistenciaItemDto {
  @IsInt()
  alumnoId: number;

  @IsIn(['PRESENTE', 'AUSENTE', 'TARDE'])
  estado: 'PRESENTE' | 'AUSENTE' | 'TARDE';

  @IsString()
  @IsOptional()
  observacion?: string;
}

export class ActualizarAsistenciaDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RegistroAsistenciaItemDto)
  registros: RegistroAsistenciaItemDto[];
}
