/**
 * =============================================================================
 * notificacion/notificacion.controller.ts — ENDPOINTS + SSE
 * =============================================================================
 * Prefijo: /notificacion
 *
 * Por cada rol (alumno / profesor / admin) hay:
 *   - GET listado / conteo no leídas
 *   - PATCH marcar una / todas como leídas
 *   - DELETE eliminar
 *   - SSE  /notificacion/sse/<rol>/:id  → stream en tiempo real
 *
 * @Sse() de Nest abre una conexión Server-Sent Events (el frontend
 * usa EventSource para recibir notificaciones sin polling).
 * =============================================================================
 */
// Sse = abre conexión Server-Sent Events; MessageEvent = payload del stream
import { Controller, Get, Patch, Delete, Param, ParseIntPipe, Sse } from '@nestjs/common';
// Observable = flujo RxJS que Nest serializa como SSE
import { Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';
import { NotificacionService } from './notificacion.service';
import { NotificacionStreamService } from './notificacion-stream.service';

/** Endpoints HTTP y SSE para notificaciones de alumnos, profesores y admins. */
@Controller('notificacion')
export class NotificacionController {
  constructor(
    private readonly notificacionService: NotificacionService,
    private readonly streamService: NotificacionStreamService,
  ) {}

  /** SSE /notificacion/sse/alumno/:alumnoId — Stream en tiempo real para un alumno. */
  @Sse('sse/alumno/:alumnoId')
  sseAlumno(@Param('alumnoId', ParseIntPipe) alumnoId: number): Observable<MessageEvent> {
    return this.streamService.streamAlumno(alumnoId);
  }

  /** SSE /notificacion/sse/profesor/:profesorId */
  @Sse('sse/profesor/:profesorId')
  sseProfesor(@Param('profesorId', ParseIntPipe) profesorId: number): Observable<MessageEvent> {
    return this.streamService.streamProfesor(profesorId);
  }

  /** GET /notificacion/por-alumno/:alumnoId — Lista notificaciones del alumno. */
  @Get('por-alumno/:alumnoId')
  findByAlumno(@Param('alumnoId', ParseIntPipe) alumnoId: number) {
    return this.notificacionService.findByAlumno(alumnoId);
  }

  /** Badge del frontend: cantidad con leida=false. */
  @Get('no-leidas/:alumnoId')
  contarNoLeidas(@Param('alumnoId', ParseIntPipe) alumnoId: number) {
    return this.notificacionService.contarNoLeidas(alumnoId);
  }

  /** PATCH /notificacion/:id/leer/:alumnoId — Marca una notificación como leída. */
  @Patch(':id/leer/:alumnoId')
  marcarLeida(
    @Param('id', ParseIntPipe) id: number,
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
  ) {
    return this.notificacionService.marcarLeida(id, alumnoId);
  }

  /** PATCH /notificacion/leer-todas/:alumnoId — marca todas como leídas. */
  @Patch('leer-todas/:alumnoId')
  marcarTodasLeidas(@Param('alumnoId', ParseIntPipe) alumnoId: number) {
    return this.notificacionService.marcarTodasLeidas(alumnoId);
  }

  /** GET /notificacion/por-profesor/:profesorId — listado del docente. */
  @Get('por-profesor/:profesorId')
  findByProfesor(@Param('profesorId', ParseIntPipe) profesorId: number) {
    return this.notificacionService.findByProfesor(profesorId);
  }

  /** GET /notificacion/no-leidas-profesor/:profesorId — conteo badge. */
  @Get('no-leidas-profesor/:profesorId')
  contarNoLeidasProfesor(@Param('profesorId', ParseIntPipe) profesorId: number) {
    return this.notificacionService.contarNoLeidasProfesor(profesorId);
  }

  /** PATCH /notificacion/:id/leer-profesor/:profesorId */
  @Patch(':id/leer-profesor/:profesorId')
  marcarLeidaProfesor(
    @Param('id', ParseIntPipe) id: number,
    @Param('profesorId', ParseIntPipe) profesorId: number,
  ) {
    return this.notificacionService.marcarLeidaProfesor(id, profesorId);
  }

  /** PATCH /notificacion/leer-todas-profesor/:profesorId */
  @Patch('leer-todas-profesor/:profesorId')
  marcarTodasLeidasProfesor(@Param('profesorId', ParseIntPipe) profesorId: number) {
    return this.notificacionService.marcarTodasLeidasProfesor(profesorId);
  }

  /** SSE /notificacion/sse/admin/:adminId — Stream en tiempo real para un administrador. */
  @Sse('sse/admin/:adminId')
  sseAdmin(@Param('adminId', ParseIntPipe) adminId: number): Observable<MessageEvent> {
    return this.streamService.streamAdmin(adminId);
  }

  /** GET /notificacion/por-admin/:adminId — listado del administrador. */
  @Get('por-admin/:adminId')
  findByAdmin(@Param('adminId', ParseIntPipe) adminId: number) {
    return this.notificacionService.findByAdmin(adminId);
  }

  /** GET /notificacion/no-leidas-admin/:adminId — conteo badge. */
  @Get('no-leidas-admin/:adminId')
  contarNoLeidasAdmin(@Param('adminId', ParseIntPipe) adminId: number) {
    return this.notificacionService.contarNoLeidasAdmin(adminId);
  }

  /** PATCH /notificacion/:id/leer-admin/:adminId */
  @Patch(':id/leer-admin/:adminId')
  marcarLeidaAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Param('adminId', ParseIntPipe) adminId: number,
  ) {
    return this.notificacionService.marcarLeidaAdmin(id, adminId);
  }

  /** PATCH /notificacion/leer-todas-admin/:adminId */
  @Patch('leer-todas-admin/:adminId')
  marcarTodasLeidasAdmin(@Param('adminId', ParseIntPipe) adminId: number) {
    return this.notificacionService.marcarTodasLeidasAdmin(adminId);
  }

  /** DELETE /notificacion/:id/alumno/:alumnoId — borra si pertenece al alumno. */
  @Delete(':id/alumno/:alumnoId')
  eliminarAlumno(
    @Param('id', ParseIntPipe) id: number,
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
  ) {
    return this.notificacionService.eliminarAlumno(id, alumnoId);
  }

  /** DELETE /notificacion/:id/profesor/:profesorId */
  @Delete(':id/profesor/:profesorId')
  eliminarProfesor(
    @Param('id', ParseIntPipe) id: number,
    @Param('profesorId', ParseIntPipe) profesorId: number,
  ) {
    return this.notificacionService.eliminarProfesor(id, profesorId);
  }

  /** DELETE /notificacion/:id/admin/:adminId */
  @Delete(':id/admin/:adminId')
  eliminarAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Param('adminId', ParseIntPipe) adminId: number,
  ) {
    return this.notificacionService.eliminarAdmin(id, adminId);
  }
}
