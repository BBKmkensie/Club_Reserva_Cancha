import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export type ModoHorarioTaller = 'POR_CURSO' | 'POR_SECCION';

export class HorarioTallerItemDto {
  @IsOptional()
  @IsString()
  curso?: string;

  @IsOptional()
  @IsString()
  seccion?: string;

  @IsInt()
  @Min(1)
  @Max(7)
  diaSemana: number;

  @IsString()
  @IsNotEmpty()
  horaInicio: string;

  @IsString()
  @IsNotEmpty()
  horaFin: string;
}

export class DefinirHorariosTallerDto {
  @IsIn(['POR_CURSO', 'POR_SECCION'])
  modo: ModoHorarioTaller;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => HorarioTallerItemDto)
  horarios: HorarioTallerItemDto[];
}
