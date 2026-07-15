/**
 * =============================================================================
 * notificacion/notificacion.controller.ts — ENDPOINTS + SSE
 * =============================================================================
 * Prefijo: /notificacion
 *
 * Todas las rutas exigen JWT. El destinatario se obtiene del token (sub + tipo),
 * no del id en la URL, para que cada usuario solo vea sus propias notificaciones.
 *
 * Rutas principales (usuario autenticado):
 *   GET    /notificacion/mias
 *   GET    /notificacion/no-leidas
 *   PATCH  /notificacion/:id/leer
 *   PATCH  /notificacion/leer-todas
 *   DELETE /notificacion/:id
 *   SSE    /notificacion/sse?access_token=...
 * =============================================================================
 */
import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  Sse,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';
import { NotificacionService } from './notificacion.service';
import { NotificacionStreamService } from './notificacion-stream.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/auth.types';
import { NotificacionScope, assertNotificacionOwner, resolveNotificacionScope } from './notificacion-scope.util';

/** Endpoints HTTP y SSE para notificaciones de alumnos, profesores y admins. */
@Controller('notificacion')
@UseGuards(JwtAuthGuard)
export class NotificacionController {
  constructor(
    private readonly notificacionService: NotificacionService,
    private readonly streamService: NotificacionStreamService,
  ) {}

  /** GET /notificacion/mias — listado del usuario autenticado. */
  @Get('mias')
  findMine(@Req() req: { user: JwtPayload }) {
    return this.notificacionService.findForUser(req.user);
  }

  /** GET /notificacion/no-leidas — conteo badge del usuario autenticado. */
  @Get('no-leidas')
  contarNoLeidasMine(@Req() req: { user: JwtPayload }) {
    return this.notificacionService.contarNoLeidasForUser(req.user);
  }

  /** PATCH /notificacion/:id/leer — marca una como leída (usuario autenticado). */
  @Patch(':id/leer')
  marcarLeidaMine(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: JwtPayload },
  ) {
    return this.notificacionService.marcarLeidaForUser(id, req.user);
  }

  /** PATCH /notificacion/leer-todas — marca todas como leídas. */
  @Patch('leer-todas')
  marcarTodasLeidasMine(@Req() req: { user: JwtPayload }) {
    return this.notificacionService.marcarTodasLeidasForUser(req.user);
  }

  /** DELETE /notificacion/:id — elimina si pertenece al usuario autenticado. */
  @Delete(':id')
  eliminarMine(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: JwtPayload },
  ) {
    return this.notificacionService.eliminarForUser(id, req.user);
  }

  /** SSE /notificacion/sse?access_token=... — stream en tiempo real del usuario autenticado. */
  @Sse('sse')
  sseMine(@Req() req: { user: JwtPayload }): Observable<MessageEvent> {
    const scope = resolveNotificacionScope(req.user);
    return this.openStream(scope, req.user.sub);
  }

  // --- Rutas legacy (compatibilidad): exigen que el id coincida con el JWT ---

  /** SSE /notificacion/sse/alumno/:alumnoId */
  @Sse('sse/alumno/:alumnoId')
  sseAlumno(
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Req() req: { user: JwtPayload },
  ): Observable<MessageEvent> {
    assertNotificacionOwner(req.user, 'alumno', alumnoId);
    return this.streamService.streamAlumno(alumnoId);
  }

  /** SSE /notificacion/sse/profesor/:profesorId */
  @Sse('sse/profesor/:profesorId')
  sseProfesor(
    @Param('profesorId', ParseIntPipe) profesorId: number,
    @Req() req: { user: JwtPayload },
  ): Observable<MessageEvent> {
    assertNotificacionOwner(req.user, 'profesor', profesorId);
    return this.streamService.streamProfesor(profesorId);
  }

  /** SSE /notificacion/sse/admin/:adminId */
  @Sse('sse/admin/:adminId')
  sseAdmin(
    @Param('adminId', ParseIntPipe) adminId: number,
    @Req() req: { user: JwtPayload },
  ): Observable<MessageEvent> {
    assertNotificacionOwner(req.user, 'admin', adminId);
    return this.streamService.streamAdmin(adminId);
  }

  /** GET /notificacion/por-alumno/:alumnoId */
  @Get('por-alumno/:alumnoId')
  findByAlumno(
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Req() req: { user: JwtPayload },
  ) {
    assertNotificacionOwner(req.user, 'alumno', alumnoId);
    return this.notificacionService.findByAlumno(alumnoId);
  }

  /** GET /notificacion/no-leidas/:alumnoId */
  @Get('no-leidas/:alumnoId')
  contarNoLeidas(
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Req() req: { user: JwtPayload },
  ) {
    assertNotificacionOwner(req.user, 'alumno', alumnoId);
    return this.notificacionService.contarNoLeidas(alumnoId);
  }

  /** PATCH /notificacion/:id/leer/:alumnoId */
  @Patch(':id/leer/:alumnoId')
  marcarLeida(
    @Param('id', ParseIntPipe) id: number,
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Req() req: { user: JwtPayload },
  ) {
    assertNotificacionOwner(req.user, 'alumno', alumnoId);
    return this.notificacionService.marcarLeida(id, alumnoId);
  }

  /** PATCH /notificacion/leer-todas/:alumnoId */
  @Patch('leer-todas/:alumnoId')
  marcarTodasLeidas(
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Req() req: { user: JwtPayload },
  ) {
    assertNotificacionOwner(req.user, 'alumno', alumnoId);
    return this.notificacionService.marcarTodasLeidas(alumnoId);
  }

  /** GET /notificacion/por-profesor/:profesorId */
  @Get('por-profesor/:profesorId')
  findByProfesor(
    @Param('profesorId', ParseIntPipe) profesorId: number,
    @Req() req: { user: JwtPayload },
  ) {
    assertNotificacionOwner(req.user, 'profesor', profesorId);
    return this.notificacionService.findByProfesor(profesorId);
  }

  /** GET /notificacion/no-leidas-profesor/:profesorId */
  @Get('no-leidas-profesor/:profesorId')
  contarNoLeidasProfesor(
    @Param('profesorId', ParseIntPipe) profesorId: number,
    @Req() req: { user: JwtPayload },
  ) {
    assertNotificacionOwner(req.user, 'profesor', profesorId);
    return this.notificacionService.contarNoLeidasProfesor(profesorId);
  }

  /** PATCH /notificacion/:id/leer-profesor/:profesorId */
  @Patch(':id/leer-profesor/:profesorId')
  marcarLeidaProfesor(
    @Param('id', ParseIntPipe) id: number,
    @Param('profesorId', ParseIntPipe) profesorId: number,
    @Req() req: { user: JwtPayload },
  ) {
    assertNotificacionOwner(req.user, 'profesor', profesorId);
    return this.notificacionService.marcarLeidaProfesor(id, profesorId);
  }

  /** PATCH /notificacion/leer-todas-profesor/:profesorId */
  @Patch('leer-todas-profesor/:profesorId')
  marcarTodasLeidasProfesor(
    @Param('profesorId', ParseIntPipe) profesorId: number,
    @Req() req: { user: JwtPayload },
  ) {
    assertNotificacionOwner(req.user, 'profesor', profesorId);
    return this.notificacionService.marcarTodasLeidasProfesor(profesorId);
  }

  /** GET /notificacion/por-admin/:adminId */
  @Get('por-admin/:adminId')
  findByAdmin(
    @Param('adminId', ParseIntPipe) adminId: number,
    @Req() req: { user: JwtPayload },
  ) {
    assertNotificacionOwner(req.user, 'admin', adminId);
    return this.notificacionService.findByAdmin(adminId);
  }

  /** GET /notificacion/no-leidas-admin/:adminId */
  @Get('no-leidas-admin/:adminId')
  contarNoLeidasAdmin(
    @Param('adminId', ParseIntPipe) adminId: number,
    @Req() req: { user: JwtPayload },
  ) {
    assertNotificacionOwner(req.user, 'admin', adminId);
    return this.notificacionService.contarNoLeidasAdmin(adminId);
  }

  /** PATCH /notificacion/:id/leer-admin/:adminId */
  @Patch(':id/leer-admin/:adminId')
  marcarLeidaAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Param('adminId', ParseIntPipe) adminId: number,
    @Req() req: { user: JwtPayload },
  ) {
    assertNotificacionOwner(req.user, 'admin', adminId);
    return this.notificacionService.marcarLeidaAdmin(id, adminId);
  }

  /** PATCH /notificacion/leer-todas-admin/:adminId */
  @Patch('leer-todas-admin/:adminId')
  marcarTodasLeidasAdmin(
    @Param('adminId', ParseIntPipe) adminId: number,
    @Req() req: { user: JwtPayload },
  ) {
    assertNotificacionOwner(req.user, 'admin', adminId);
    return this.notificacionService.marcarTodasLeidasAdmin(adminId);
  }

  /** DELETE /notificacion/:id/alumno/:alumnoId */
  @Delete(':id/alumno/:alumnoId')
  eliminarAlumno(
    @Param('id', ParseIntPipe) id: number,
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Req() req: { user: JwtPayload },
  ) {
    assertNotificacionOwner(req.user, 'alumno', alumnoId);
    return this.notificacionService.eliminarAlumno(id, alumnoId);
  }

  /** DELETE /notificacion/:id/profesor/:profesorId */
  @Delete(':id/profesor/:profesorId')
  eliminarProfesor(
    @Param('id', ParseIntPipe) id: number,
    @Param('profesorId', ParseIntPipe) profesorId: number,
    @Req() req: { user: JwtPayload },
  ) {
    assertNotificacionOwner(req.user, 'profesor', profesorId);
    return this.notificacionService.eliminarProfesor(id, profesorId);
  }

  /** DELETE /notificacion/:id/admin/:adminId */
  @Delete(':id/admin/:adminId')
  eliminarAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Param('adminId', ParseIntPipe) adminId: number,
    @Req() req: { user: JwtPayload },
  ) {
    assertNotificacionOwner(req.user, 'admin', adminId);
    return this.notificacionService.eliminarAdmin(id, adminId);
  }

  private openStream(scope: NotificacionScope, ownerId: number): Observable<MessageEvent> {
    switch (scope) {
      case 'alumno':
        return this.streamService.streamAlumno(ownerId);
      case 'profesor':
        return this.streamService.streamProfesor(ownerId);
      case 'admin':
        return this.streamService.streamAdmin(ownerId);
    }
  }
}
