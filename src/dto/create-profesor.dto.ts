import { IsString, IsEmail, IsInt, IsNotEmpty, IsOptional, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProfesorDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  rut: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  fotoPath?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @ValidateIf((_, value) => value !== undefined)
  @IsInt()
  tallerId?: number;

  @IsString()
  @IsOptional()
  password?: string;
}

