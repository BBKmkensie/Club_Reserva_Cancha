import { IsString, IsNotEmpty } from 'class-validator';

export class LoginProfesorDto {
  @IsString()
  @IsNotEmpty()
  usuario: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
