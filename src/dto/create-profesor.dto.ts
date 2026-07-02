import { IsString, IsEmail, IsInt, IsNotEmpty, IsOptional } from 'class-validator';

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

  @IsInt()
  @IsNotEmpty()
  tallerId: number;

  @IsString()
  @IsOptional()
  password?: string;
}

