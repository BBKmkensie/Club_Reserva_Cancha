import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FichaAlumnoPayload {
  altura: number;
  peso: number;
  porcentajeGrasa: number;
  sedentario: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(tipo: 'admin' | 'directiva' | 'profesor' | 'alumno' | 'apoderado', usuario: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { tipo, usuario, password });
  }

  loginUnified(usuario: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { usuario, password });
  }

  // Admin
  getAdmins(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin`);
  }

  getAdmin(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/${id}`);
  }

  createAdmin(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin`, data);
  }

  deleteAdmin(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/${id}`);
  }

  // Taller
  getTalleres(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/taller`);
  }

  getCatalogoTalleres(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/taller/catalogo`);
  }

  getCatalogoTallerDetalle(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/taller/catalogo/${id}`);
  }

  getTaller(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/taller/${id}`);
  }

  createTaller(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/taller`, data);
  }

  updateTaller(id: number, data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/taller/${id}`, data);
  }

  actualizarPresentacionTaller(
    tallerId: number,
    data: { descripcion?: string; fotoPath?: string; profesorId?: number },
    opts?: { esDirectiva?: boolean; profesorId?: number },
  ): Observable<any> {
    const params = new URLSearchParams();
    if (opts?.esDirectiva) params.set('esDirectiva', 'true');
    if (opts?.profesorId != null) params.set('profesorId', String(opts.profesorId));
    const qs = params.toString();
    const url = `${this.apiUrl}/taller/${tallerId}/presentacion${qs ? `?${qs}` : ''}`;
    return this.http.patch<any>(url, data);
  }

  deleteTaller(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/taller/${id}`);
  }

  asignarDocenteActividad(tallerId: number, profesorId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/taller/${tallerId}/asignar-docente`, { profesorId });
  }

  getAsignacionesPendientes(profesorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/taller/asignaciones/pendientes?profesorId=${profesorId}`);
  }

  responderAsignacion(asignacionId: number, profesorId: number, acepta: boolean, motivo?: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/taller/asignaciones/${asignacionId}/responder`, {
      profesorId, acepta, motivo,
    });
  }

  definirHorarioActividad(tallerId: number, horario: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/taller/${tallerId}/horario`, horario);
  }

  publicarActividad(tallerId: number, data?: { fechaAperturaInscripcion?: string; fechaCierreInscripcion?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/taller/${tallerId}/publicar`, data ?? {});
  }

  cerrarActividad(tallerId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/taller/${tallerId}/cerrar`, {});
  }

  getReporteActividad(tallerId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/taller/${tallerId}/reporte`);
  }

  // Alumno
  getAlumnos(tallerId?: number): Observable<any[]> {
    const url = tallerId
      ? `${this.apiUrl}/alumno?tallerId=${tallerId}`
      : `${this.apiUrl}/alumno`;
    return this.http.get<any[]>(url);
  }

  getAlumno(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/alumno/${id}`);
  }

  createAlumno(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/alumno`, data);
  }

  updateAlumno(id: number, data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/alumno/${id}`, data);
  }

  deleteAlumno(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/alumno/${id}`);
  }

  // Profesor
  getProfesores(tallerId?: number): Observable<any[]> {
    const url = tallerId
      ? `${this.apiUrl}/profesor?tallerId=${tallerId}`
      : `${this.apiUrl}/profesor`;
    return this.http.get<any[]>(url);
  }

  getProfesor(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profesor/${id}`);
  }

  loginProfesor(usuario: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/profesor/login`, { usuario, password });
  }

  createProfesor(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/profesor`, data);
  }

  updateProfesor(id: number, data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/profesor/${id}`, data);
  }

  deleteProfesor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/profesor/${id}`);
  }

  // Reserva
  getReservas(tallerId?: number, fecha?: string): Observable<any[]> {
    let url = `${this.apiUrl}/reserva`;
    const params: string[] = [];
    if (tallerId) params.push(`tallerId=${tallerId}`);
    if (fecha) params.push(`fecha=${fecha}`);
    if (params.length > 0) url += '?' + params.join('&');
    return this.http.get<any[]>(url);
  }

  getReserva(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reserva/${id}`);
  }

  createReserva(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reserva`, data);
  }

  updateReserva(id: number, data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/reserva/${id}`, data);
  }

  deleteReserva(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reserva/${id}`);
  }

  getDisponibilidadCancha(fecha: string, espacio = 'Cancha Principal'): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/reserva/disponibilidad?fecha=${fecha}&espacio=${encodeURIComponent(espacio)}`,
    );
  }

  getFranjasCancha(espacio = 'Cancha Principal'): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/franja-cancha?espacio=${encodeURIComponent(espacio)}`,
    );
  }

  actualizarFranjasCancha(
    franjas: { diaSemana: number; horaInicio: string; activa: boolean; duracionHoras?: number }[],
    espacio = 'Cancha Principal',
  ): Observable<any[]> {
    return this.http.put<any[]>(`${this.apiUrl}/franja-cancha`, { espacio, franjas });
  }

  // Salida
  getSalidas(tallerId?: number): Observable<any[]> {
    const url = tallerId
      ? `${this.apiUrl}/salida?tallerId=${tallerId}`
      : `${this.apiUrl}/salida`;
    return this.http.get<any[]>(url);
  }

  getSalida(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/salida/${id}`);
  }

  createSalida(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/salida`, data);
  }

  updateSalida(id: number, data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/salida/${id}`, data);
  }

  deleteSalida(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/salida/${id}`);
  }

  getSalidasPublicadas(tallerId?: number, alumnoId?: number): Observable<any[]> {
    const params = new URLSearchParams();
    if (tallerId != null) params.set('tallerId', String(tallerId));
    if (alumnoId != null) params.set('alumnoId', String(alumnoId));
    const q = params.toString() ? `?${params}` : '';
    return this.http.get<any[]>(`${this.apiUrl}/salida/publicadas${q}`);
  }

  getSalidasPendientesProfesor(profesorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/salida/pendientes/profesor/${profesorId}`);
  }

  getSalidasPendientesDirectiva(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/salida/pendientes/directiva`);
  }

  getSalidasPorProfesor(profesorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/salida/por-profesor/${profesorId}`);
  }

  asignarSalidaDirectiva(data: {
    destino: string;
    fecha: string;
    hora?: string;
    descripcion?: string;
    tallerId: number;
    profesorId: number;
    adminId?: number;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/salida/asignar`, data);
  }

  proponerSalidaProfesor(data: {
    destino: string;
    fecha: string;
    hora?: string;
    descripcion?: string;
    tallerId: number;
    profesorId: number;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/salida/proponer`, data);
  }

  responderSalida(id: number, acepta: boolean, actor: 'profesor' | 'directiva', actorId?: number, motivo?: string): Observable<any> {
    const params = new URLSearchParams({ actor });
    if (actorId != null) params.set('actorId', String(actorId));
    return this.http.patch<any>(`${this.apiUrl}/salida/${id}/responder?${params}`, { acepta, motivo });
  }

  abrirSalida(id: number, profesorId: number, comentario?: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/salida/${id}/abrir?profesorId=${profesorId}`, { comentario });
  }

  cerrarSalida(id: number, profesorId: number, resultado: 'EXITO' | 'FRACASO', comentario: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/salida/${id}/cerrar?profesorId=${profesorId}`, { resultado, comentario });
  }

  // Inscripción salida
  inscribirSalida(alumnoId: number, salidaId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/inscripcion-salida`, { alumnoId, salidaId });
  }

  getInscripcionesPorAlumno(alumnoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inscripcion-salida/por-alumno/${alumnoId}`);
  }

  getInscripcionesPorSalida(salidaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inscripcion-salida/por-salida/${salidaId}`);
  }

  desinscribirSalida(alumnoId: number, salidaId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/inscripcion-salida?alumnoId=${alumnoId}&salidaId=${salidaId}`);
  }

  // Inscripción taller
  validarInscripcionTaller(alumnoId: number, tallerId: number, notificar = false): Observable<any> {
    const q = notificar ? '?notificar=true' : '';
    return this.http.get<any>(`${this.apiUrl}/inscripcion-taller/validar/${alumnoId}/${tallerId}${q}`);
  }

  getResumenInscripcionesTaller(tallerId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/inscripcion-taller/resumen/${tallerId}`);
  }

  solicitarInscripcionTaller(alumnoId: number, tallerId: number, ficha: FichaAlumnoPayload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/inscripcion-taller`, { alumnoId, tallerId, ficha });
  }

  actualizarFichaInscripcion(inscripcionId: number, ficha: Partial<FichaAlumnoPayload>): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/inscripcion-taller/${inscripcionId}/ficha`, ficha);
  }

  getInscripcionesTallerPorAlumno(alumnoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inscripcion-taller/por-alumno/${alumnoId}`);
  }

  getInscripcionesTallerPorTaller(tallerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inscripcion-taller/por-taller/${tallerId}`);
  }

  getInscripcionesPendientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inscripcion-taller/pendientes`);
  }

  proponerInscripcionDirectiva(alumnoId: number, tallerId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/inscripcion-taller/proponer-directiva`, { alumnoId, tallerId });
  }

  responderInscripcionTaller(id: number, estado: 'ACEPTADO' | 'RECHAZADO'): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/inscripcion-taller/${id}/responder`, { estado });
  }

  // Fichas alumno por taller
  getFichasAlumnosPorTaller(
    tallerId: number,
    opts?: { soloInscritos?: boolean; esCoordinacion?: boolean; profesorId?: number },
  ): Observable<any> {
    const params = new URLSearchParams();
    if (opts?.soloInscritos) params.set('soloInscritos', 'true');
    if (opts?.esCoordinacion) params.set('esCoordinacion', 'true');
    if (opts?.profesorId != null) params.set('profesorId', String(opts.profesorId));
    const q = params.toString() ? `?${params}` : '';
    return this.http.get<any>(`${this.apiUrl}/ficha-alumno/taller/${tallerId}${q}`);
  }

  guardarFichaAlumnoTaller(alumnoId: number, tallerId: number, ficha: Partial<FichaAlumnoPayload>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/ficha-alumno/${alumnoId}/${tallerId}`, ficha);
  }

  getFichaAlumnoTaller(alumnoId: number, tallerId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ficha-alumno/${alumnoId}/${tallerId}`);
  }

  // Asistencia
  abrirSesionAsistencia(tallerId: number, profesorId: number, fecha?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/asistencia/sesion/abrir`, { tallerId, profesorId, fecha });
  }

  getSesionActiva(tallerId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/asistencia/sesion/activa/${tallerId}`);
  }

  getHistorialSesiones(tallerId: number): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/asistencia/sesiones/${tallerId}`);
  }

  actualizarAsistencia(sesionId: number, registros: any[]): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/asistencia/sesion/${sesionId}/registros`, { registros });
  }

  cerrarSesionAsistencia(sesionId: number, observaciones?: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/asistencia/sesion/${sesionId}/cerrar`, { observaciones });
  }

  getReporteAsistencia(tallerId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/asistencia/reporte/${tallerId}`);
  }

  getAlertasGestion(tallerId?: number): Observable<any[]> {
    const q = tallerId ? `?tallerId=${tallerId}` : '';
    return this.http.get<any[]>(`${this.apiUrl}/asistencia/alertas/gestion${q}`);
  }

  actualizarUmbralAusencias(tallerId: number, umbral: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/asistencia/umbral/${tallerId}`, { umbral });
  }

  contactarApoderado(alertaId: number, notas: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/asistencia/alertas/${alertaId}/contactar`, { notas });
  }

  resolverAlerta(alertaId: number, notas: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/asistencia/alertas/${alertaId}/resolver`, { notas });
  }

  // Período
  getPeriodoActivo(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/periodo/activo`);
  }

  getPeriodos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/periodo`);
  }

  configurarPeriodo(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/periodo`, data);
  }

  getComparacionSemestre(periodoId?: number, profesorId?: number): Observable<any> {
    const params: string[] = [];
    if (periodoId != null) params.push(`periodoId=${periodoId}`);
    if (profesorId != null) params.push(`profesorId=${profesorId}`);
    const q = params.length ? `?${params.join('&')}` : '';
    return this.http.get<any>(`${this.apiUrl}/taller/estadisticas/semestre${q}`);
  }

  // Notificaciones
  getNotificaciones(alumnoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/notificacion/por-alumno/${alumnoId}`);
  }

  marcarNotificacionLeida(id: number, alumnoId: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/notificacion/${id}/leer/${alumnoId}`, {});
  }

  marcarTodasNotificacionesLeidas(alumnoId: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/notificacion/leer-todas/${alumnoId}`, {});
  }
}
