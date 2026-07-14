/**
 * =============================================================================
 * 4.2 auth.controller.ts — RUTAS HTTP DE LOGIN
 * =============================================================================
 * Prefijo: @Controller('auth') → todas las rutas empiezan con /auth
 *
 * Endpoints:
 *   POST /auth/login  → público (@Public), recibe usuario/password, devuelve JWT
 *   GET  /auth/me     → protegido (necesita Bearer token), devuelve el perfil
 *
 * El controller NO valida contraseñas ni firma tokens: eso lo hace AuthService.
 * =============================================================================
 */

// Body = lee el JSON del body; Controller = marca la clase como rutas HTTP;
// Get/Post = métodos HTTP; Req = objeto Request de Express.
import { Body, Controller, Get, Post, Req } from '@nestjs/common';

// AuthService = lógica real del login (buscar usuario, verificar password, firmar JWT).
import { AuthService } from './auth.service';

// LoginDto = forma esperada del body { usuario, password, tipo? } con validadores.
import { LoginDto } from '../dto/login.dto';

// @Public() = marca la ruta para que JwtAuthGuard NO exija token.
import { Public } from './public.decorator';

// JwtPayload = forma de lo que Passport deja en req.user tras validar el JWT.
import { JwtPayload } from './auth.types';

/**
 * AuthController:
 *   - Prefijo de ruta: /auth
 *   - Solo recibe HTTP y delega al AuthService (controller delgado).
 */
@Controller('auth')
export class AuthController {
  /**
   * Nest inyecta AuthService automáticamente (declarado en AuthModule).
   * No hacemos "new AuthService()" a mano: eso lo resuelve el DI de Nest.
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/login
   *
   * @Public() → cualquiera puede llamar (sin estar logueado).
   * @Body() dto → Nest toma el JSON del body y lo convierte/valida a LoginDto.
   * Luego delega a authService.login(dto), que:
   *   1) busca el usuario en BD
   *   2) verifica la contraseña
   *   3) firma un JWT
   *   4) retorna { accessToken, user }
   */
  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    // Toda la lógica vive en el service; el controller solo reenvía
    return this.authService.login(dto);
  }

  /**
   * GET /auth/me
   *
   * NO tiene @Public() → requiere Authorization: Bearer <token>.
   * Passport/JwtStrategy ya validó el token y puso el payload en req.user.
   * Aquí solo devolvemos un objeto limpio al frontend (id, nombre, role, tipo...).
   *
   * @Req() req → objeto Request de Express; req.user lo llena JwtStrategy.validate()
   */
  @Get('me')
  me(@Req() req: { user: JwtPayload }) {
    // req.user = payload JWT ya validado por JwtStrategy
    const user = req.user;
    return {
      id: user.sub, // en JWT, "sub" = subject = id del usuario
      nombre: user.nombre,
      role: user.role, // permiso: super_admin | admin | usuario
      tipo: user.tipo, // perfil: admin | directiva | profesor | alumno | apoderado
      tallerId: user.tallerId, // taller asociado (profesor/alumno), si aplica
    };
  }
}
