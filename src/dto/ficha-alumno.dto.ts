import { IsBoolean, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FichaAlumnoDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(50)
  @Max(250)
  altura: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(20)
  @Max(300)
  peso: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  @Max(60)
  porcentajeGrasa: number;

  @IsBoolean()
  sedentario: boolean;
}

export class ActualizarFichaAlumnoDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(50)
  @Max(250)
  altura?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(20)
  @Max(300)
  peso?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  @Max(60)
  porcentajeGrasa?: number;

  @IsOptional()
  @IsBoolean()
  sedentario?: boolean;
}
