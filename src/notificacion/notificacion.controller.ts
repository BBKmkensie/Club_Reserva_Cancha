import { Controller, Get, Patch, Delete, Param, ParseIntPipe, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';
import { NotificacionService } from './notificacion.service';
import { NotificacionStreamService } from './notificacion-stream.service';

@Controller('notificacion')
export class NotificacionController {
  constructor(
    private readonly notificacionService: NotificacionService,
    private readonly streamService: NotificacionStreamService,
  ) {}

  @Sse('sse/alumno/:alumnoId')
  sseAlumno(@Param('alumnoId', ParseIntPipe) alumnoId: number): Observable<MessageEvent> {
    return this.streamService.streamAlumno(alumnoId);
  }

  @Sse('sse/profesor/:profesorId')
  sseProfesor(@Param('profesorId', ParseIntPipe) profesorId: number): Observable<MessageEvent> {
    return this.streamService.streamProfesor(profesorId);
  }

  @Get('por-alumno/:alumnoId')
  findByAlumno(@Param('alumnoId', ParseIntPipe) alumnoId: number) {
    return this.notificacionService.findByAlumno(alumnoId);
  }

  @Get('no-leidas/:alumnoId')
  contarNoLeidas(@Param('alumnoId', ParseIntPipe) alumnoId: number) {
    return this.notificacionService.contarNoLeidas(alumnoId);
  }

  @Patch(':id/leer/:alumnoId')
  marcarLeida(
    @Param('id', ParseIntPipe) id: number,
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
  ) {
    return this.notificacionService.marcarLeida(id, alumnoId);
  }

  @Patch('leer-todas/:alumnoId')
  marcarTodasLeidas(@Param('alumnoId', ParseIntPipe) alumnoId: number) {
    return this.notificacionService.marcarTodasLeidas(alumnoId);
  }

  @Get('por-profesor/:profesorId')
  findByProfesor(@Param('profesorId', ParseIntPipe) profesorId: number) {
    return this.notificacionService.findByProfesor(profesorId);
  }

  @Get('no-leidas-profesor/:profesorId')
  contarNoLeidasProfesor(@Param('profesorId', ParseIntPipe) profesorId: number) {
    return this.notificacionService.contarNoLeidasProfesor(profesorId);
  }

  @Patch(':id/leer-profesor/:profesorId')
  marcarLeidaProfesor(
    @Param('id', ParseIntPipe) id: number,
    @Param('profesorId', ParseIntPipe) profesorId: number,
  ) {
    return this.notificacionService.marcarLeidaProfesor(id, profesorId);
  }

  @Patch('leer-todas-profesor/:profesorId')
  marcarTodasLeidasProfesor(@Param('profesorId', ParseIntPipe) profesorId: number) {
    return this.notificacionService.marcarTodasLeidasProfesor(profesorId);
  }

  @Sse('sse/admin/:adminId')
  sseAdmin(@Param('adminId', ParseIntPipe) adminId: number): Observable<MessageEvent> {
    return this.streamService.streamAdmin(adminId);
  }

  @Get('por-admin/:adminId')
  findByAdmin(@Param('adminId', ParseIntPipe) adminId: number) {
    return this.notificacionService.findByAdmin(adminId);
  }

  @Get('no-leidas-admin/:adminId')
  contarNoLeidasAdmin(@Param('adminId', ParseIntPipe) adminId: number) {
    return this.notificacionService.contarNoLeidasAdmin(adminId);
  }

  @Patch(':id/leer-admin/:adminId')
  marcarLeidaAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Param('adminId', ParseIntPipe) adminId: number,
  ) {
    return this.notificacionService.marcarLeidaAdmin(id, adminId);
  }

  @Patch('leer-todas-admin/:adminId')
  marcarTodasLeidasAdmin(@Param('adminId', ParseIntPipe) adminId: number) {
    return this.notificacionService.marcarTodasLeidasAdmin(adminId);
  }

  @Delete(':id/alumno/:alumnoId')
  eliminarAlumno(
    @Param('id', ParseIntPipe) id: number,
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
  ) {
    return this.notificacionService.eliminarAlumno(id, alumnoId);
  }

  @Delete(':id/profesor/:profesorId')
  eliminarProfesor(
    @Param('id', ParseIntPipe) id: number,
    @Param('profesorId', ParseIntPipe) profesorId: number,
  ) {
    return this.notificacionService.eliminarProfesor(id, profesorId);
  }

  @Delete(':id/admin/:adminId')
  eliminarAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Param('adminId', ParseIntPipe) adminId: number,
  ) {
    return this.notificacionService.eliminarAdmin(id, adminId);
  }
}
