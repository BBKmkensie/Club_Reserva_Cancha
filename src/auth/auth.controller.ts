import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../dto/login.dto';
import { Public } from './public.decorator';
import { JwtPayload } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  me(@Req() req: { user: JwtPayload }) {
    const user = req.user;
    return {
      id: user.sub,
      nombre: user.nombre,
      role: user.role,
      tipo: user.tipo,
      tallerId: user.tallerId,
    };
  }
}
