/**
 * Cliente HTTP centralizado del frontend.
 * Agrupa todas las peticiones REST hacia el backend del sistema de talleres y reservas de cancha.
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/** Datos físicos del alumno asociados a una inscripción o ficha de taller */
export interface FichaAlumnoPayload {
  altura: number;
  peso: number;
  porcentajeGrasa: number;
  sedentario: boolean;
}

/**
 * Servicio inyectable que encapsula la comunicación con la API REST.
 * Expone métodos por dominio: autenticación, talleres, alumnos, reservas, asistencia y notificaciones.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** Autentica con tipo de usuario explícito (flujo legado). */
  login(tipo: 'admin' | 'directiva' | 'profesor' | 'alumno' | 'apoderado', usuario: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { tipo, usuario, password });
  }

  /** Autentica con usuario y contraseña; el backend resuelve el tipo de cuenta. */
  loginUnified(usuario: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { usuario, password });
  }

  /** Obtiene el resumen del portal del apoderado (hijo, asistencia, taller inscrito). */
  getApoderadoResumen(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/apoderado/resumen`);
  }

  // Admin
  /** Lista todos los administradores del sistema */
  getAdmins(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin`);
  }

  /** Obtiene un administrador por ID */
  getAdmin(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/${id}`);
  }

  /** Crea un nuevo administrador */
  createAdmin(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin`, data);
  }

  /** Elimina un administrador por ID */
  deleteAdmin(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/${id}`);
  }

  // Taller
  /** Lista todos los talleres/actividades */
  getTalleres(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/taller`);
  }

  /** Catálogo público de tipos de taller disponibles */
  getCatalogoTalleres(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/taller/catalogo`);
  }

  /** Detalle de un ítem del catálogo de talleres */
  getCatalogoTallerDetalle(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/taller/catalogo/${id}`);
  }

  /** Obtiene un taller por ID */
  getTaller(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/taller/${id}`);
  }

  /** Crea un nuevo taller/actividad */
  createTaller(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/taller`, data);
  }

  /** Actualiza datos generales de un taller */
  updateTaller(id: number, data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/taller/${id}`, data);
  }

  /** Actualiza descripción, foto y profesor visible en la presentación del taller */
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

  /** Elimina un taller por ID */
  deleteTaller(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/taller/${id}`);
  }

  /** Asigna un profesor como docente de la actividad */
  asignarDocenteActividad(tallerId: number, profesorId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/taller/${tallerId}/asignar-docente`, { profesorId });
  }

  /** Asignaciones de actividad pendientes de respuesta del profesor */
  getAsignacionesPendientes(profesorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/taller/asignaciones/pendientes?profesorId=${profesorId}`);
  }

  /** Acepta o rechaza una asignación de docente */
  responderAsignacion(asignacionId: number, profesorId: number, acepta: boolean, motivo?: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/taller/asignaciones/${asignacionId}/responder`, {
      profesorId, acepta, motivo,
    });
  }

  /** Define o actualiza el horario de una actividad */
  definirHorarioActividad(tallerId: number, horario: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/taller/${tallerId}/horario`, horario);
  }

  /** Publica la actividad y opcionalmente define fechas de inscripción */
  publicarActividad(tallerId: number, data?: { fechaAperturaInscripcion?: string; fechaCierreInscripcion?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/taller/${tallerId}/publicar`, data ?? {});
  }

  /** Cierra la actividad (fin del período operativo) */
  cerrarActividad(tallerId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/taller/${tallerId}/cerrar`, {});
  }

  /** Reporte consolidado de una actividad (inscripciones, asistencia, espacios) */
  getReporteActividad(tallerId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/taller/${tallerId}/reporte`);
  }

  // Alumno
  /** Lista alumnos, opcionalmente filtrados por taller */
  getAlumnos(tallerId?: number): Observable<any[]> {
    const url = tallerId
      ? `${this.apiUrl}/alumno?tallerId=${tallerId}`
      : `${this.apiUrl}/alumno`;
    return this.http.get<any[]>(url);
  }

  /** Obtiene un alumno por ID */
  getAlumno(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/alumno/${id}`);
  }

  /** Registra un nuevo alumno */
  createAlumno(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/alumno`, data);
  }

  /** Actualiza datos de un alumno */
  updateAlumno(id: number, data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/alumno/${id}`, data);
  }

  /** Elimina un alumno por ID */
  deleteAlumno(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/alumno/${id}`);
  }

  // Profesor
  /** Lista profesores, opcionalmente filtrados por taller */
  getProfesores(tallerId?: number): Observable<any[]> {
    const url = tallerId
      ? `${this.apiUrl}/profesor?tallerId=${tallerId}`
      : `${this.apiUrl}/profesor`;
    return this.http.get<any[]>(url);
  }

  /** Obtiene un profesor por ID */
  getProfesor(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profesor/${id}`);
  }

  /** Autentica a un profesor (endpoint dedicado) */
  loginProfesor(usuario: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/profesor/login`, { usuario, password });
  }

  /** Crea un nuevo profesor */
  createProfesor(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/profesor`, data);
  }

  /** Actualiza datos de un profesor */
  updateProfesor(id: number, data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/profesor/${id}`, data);
  }

  /** Elimina un profesor por ID */
  deleteProfesor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/profesor/${id}`);
  }

  // Reserva
  /** Lista reservas de cancha, con filtros opcionales por taller y fecha */
  getReservas(tallerId?: number, fecha?: string): Observable<any[]> {
    let url = `${this.apiUrl}/reserva`;
    const params: string[] = [];
    if (tallerId) params.push(`tallerId=${tallerId}`);
    if (fecha) params.push(`fecha=${fecha}`);
    if (params.length > 0) url += '?' + params.join('&');
    return this.http.get<any[]>(url);
  }

  /** Obtiene una reserva por ID */
  getReserva(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reserva/${id}`);
  }

  /** Crea una nueva reserva de cancha */
  createReserva(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reserva`, data);
  }

  /** Actualiza una reserva existente */
  updateReserva(id: number, data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/reserva/${id}`, data);
  }

  /** Elimina una reserva por ID */
  deleteReserva(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reserva/${id}`);
  }

  /** Consulta los slots disponibles/ocupados de la cancha para una fecha. */
  getDisponibilidadCancha(fecha: string, espacio = 'Cancha Principal'): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/reserva/disponibilidad?fecha=${fecha}&espacio=${encodeURIComponent(espacio)}`,
    );
  }

  /** Disponibilidad semanal de la cancha (slots por día) */
  getDisponibilidadSemanaCancha(fechaInicio?: string, espacio = 'Cancha Principal'): Observable<any[]> {
    let url = `${this.apiUrl}/reserva/disponibilidad-semana?espacio=${encodeURIComponent(espacio)}`;
    if (fechaInicio) url += `&fechaInicio=${fechaInicio}`;
    return this.http.get<any[]>(url);
  }

  /** Franjas horarias configuradas para un espacio de cancha */
  getFranjasCancha(espacio = 'Cancha Principal'): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/franja-cancha?espacio=${encodeURIComponent(espacio)}`,
    );
  }

  /** Actualiza las franjas activas y duración por día de la semana */
  actualizarFranjasCancha(
    franjas: { diaSemana: number; horaInicio: string; activa: boolean; duracionMinutos?: number }[],
    espacio = 'Cancha Principal',
  ): Observable<any[]> {
    return this.http.put<any[]>(`${this.apiUrl}/franja-cancha`, { espacio, franjas });
  }

  // Salida
  /** Lista salidas pedagógicas, opcionalmente por taller */
  getSalidas(tallerId?: number): Observable<any[]> {
    const url = tallerId
      ? `${this.apiUrl}/salida?tallerId=${tallerId}`
      : `${this.apiUrl}/salida`;
    return this.http.get<any[]>(url);
  }

  /** Obtiene una salida por ID */
  getSalida(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/salida/${id}`);
  }

  /** Crea una nueva salida pedagógica */
  createSalida(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/salida`, data);
  }

  /** Actualiza datos de una salida */
  updateSalida(id: number, data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/salida/${id}`, data);
  }

  /** Elimina una salida por ID */
  deleteSalida(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/salida/${id}`);
  }

  /** Salidas publicadas visibles para inscripción de alumnos */
  getSalidasPublicadas(tallerId?: number, alumnoId?: number): Observable<any[]> {
    const params = new URLSearchParams();
    if (tallerId != null) params.set('tallerId', String(tallerId));
    if (alumnoId != null) params.set('alumnoId', String(alumnoId));
    const q = params.toString() ? `?${params}` : '';
    return this.http.get<any[]>(`${this.apiUrl}/salida/publicadas${q}`);
  }

  /** Salidas propuestas pendientes de aprobación del profesor */
  getSalidasPendientesProfesor(profesorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/salida/pendientes/profesor/${profesorId}`);
  }

  /** Salidas pendientes de revisión por la directiva */
  getSalidasPendientesDirectiva(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/salida/pendientes/directiva`);
  }

  /** Historial de salidas gestionadas por un profesor */
  getSalidasPorProfesor(profesorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/salida/por-profesor/${profesorId}`);
  }

  /** La directiva asigna una salida a un taller y profesor */
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

  /** El profesor propone una salida para aprobación */
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

  /** Acepta o rechaza una salida (profesor o directiva) */
  responderSalida(id: number, acepta: boolean, actor: 'profesor' | 'directiva', actorId?: number, motivo?: string): Observable<any> {
    const params = new URLSearchParams({ actor });
    if (actorId != null) params.set('actorId', String(actorId));
    return this.http.patch<any>(`${this.apiUrl}/salida/${id}/responder?${params}`, { acepta, motivo });
  }

  /** El profesor abre una salida el día de la actividad */
  abrirSalida(id: number, profesorId: number, comentario?: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/salida/${id}/abrir?profesorId=${profesorId}`, { comentario });
  }

  /** El profesor cierra la salida con resultado y comentario */
  cerrarSalida(id: number, profesorId: number, resultado: 'EXITO' | 'FRACASO', comentario: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/salida/${id}/cerrar?profesorId=${profesorId}`, { resultado, comentario });
  }

  // Inscripción salida
  /** Inscribe a un alumno en una salida publicada */
  inscribirSalida(alumnoId: number, salidaId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/inscripcion-salida`, { alumnoId, salidaId });
  }

  /** Inscripciones de salida de un alumno */
  getInscripcionesPorAlumno(alumnoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inscripcion-salida/por-alumno/${alumnoId}`);
  }

  /** Alumnos inscritos en una salida */
  getInscripcionesPorSalida(salidaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inscripcion-salida/por-salida/${salidaId}`);
  }

  /** Cancela la inscripción de un alumno en una salida */
  desinscribirSalida(alumnoId: number, salidaId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/inscripcion-salida?alumnoId=${alumnoId}&salidaId=${salidaId}`);
  }

  // Inscripción taller
  /** Valida cupos, conflictos de horario y elegibilidad antes de inscribirse a un taller. */
  validarInscripcionTaller(alumnoId: number, tallerId: number, notificar = false): Observable<any> {
    const q = notificar ? '?notificar=true' : '';
    return this.http.get<any>(`${this.apiUrl}/inscripcion-taller/validar/${alumnoId}/${tallerId}${q}`);
  }

  /** Resumen de cupos e inscripciones de un taller */
  getResumenInscripcionesTaller(tallerId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/inscripcion-taller/resumen/${tallerId}`);
  }

  /** Envía una solicitud de inscripción con la ficha física del alumno. */
  solicitarInscripcionTaller(alumnoId: number, tallerId: number, ficha: FichaAlumnoPayload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/inscripcion-taller`, { alumnoId, tallerId, ficha });
  }

  /** Actualiza la ficha física asociada a una inscripción */
  actualizarFichaInscripcion(inscripcionId: number, ficha: Partial<FichaAlumnoPayload>): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/inscripcion-taller/${inscripcionId}/ficha`, ficha);
  }

  /** Inscripciones a talleres de un alumno */
  getInscripcionesTallerPorAlumno(alumnoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inscripcion-taller/por-alumno/${alumnoId}`);
  }

  /** Inscripciones de un taller */
  getInscripcionesTallerPorTaller(tallerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inscripcion-taller/por-taller/${tallerId}`);
  }

  /** Solicitudes de inscripción pendientes de respuesta */
  getInscripcionesPendientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inscripcion-taller/pendientes`);
  }

  /** La directiva propone inscribir a un alumno en un taller */
  proponerInscripcionDirectiva(
    alumnoId: number,
    tallerId: number,
    opts?: { tallerHorarioId?: number; mensajeApoderado?: string },
  ): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/inscripcion-taller/proponer-directiva`, {
      alumnoId,
      tallerId,
      tallerHorarioId: opts?.tallerHorarioId,
      mensajeApoderado: opts?.mensajeApoderado,
    });
  }

  /** El apoderado propone inscribir a su hijo en un taller */
  proponerInscripcionApoderado(
    tallerId: number,
    opts?: { tallerHorarioId?: number; horarioPropuestoTexto?: string; mensajeApoderado?: string },
  ): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/apoderado/proponer-inscripcion/${tallerId}`, {
      tallerHorarioId: opts?.tallerHorarioId,
      horarioPropuestoTexto: opts?.horarioPropuestoTexto,
      mensajeApoderado: opts?.mensajeApoderado,
    });
  }

  /** Propuestas de inscripción enviadas por el apoderado autenticado */
  getMisPropuestasApoderado(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/apoderado/mis-propuestas`);
  }

  /** Propone una actividad libre no catalogada (flujo apoderado) */
  proponerActividadLibre(data: {
    actividadNombre: string;
    actividadDescripcion?: string;
    horarioPropuestoTexto: string;
    mensajeApoderado?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/apoderado/proponer-actividad-libre`, data);
  }

  /** Propuestas de inscripción pendientes de gestión */
  getPropuestasPendientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inscripcion-taller/propuestas/pendientes`);
  }

  /** Responde a una propuesta de inscripción (aceptar/rechazar con opciones de horario) */
  responderPropuestaInscripcion(
    id: number,
    acepta: boolean,
    opts?: {
      motivoRechazo?: string;
      horarioSugeridoId?: number;
      horarioSugeridoTexto?: string;
      mensajeDirectiva?: string;
    },
  ): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/inscripcion-taller/propuestas/${id}/responder`, {
      acepta,
      motivoRechazo: opts?.motivoRechazo,
      horarioSugeridoId: opts?.horarioSugeridoId,
      horarioSugeridoTexto: opts?.horarioSugeridoTexto,
      mensajeDirectiva: opts?.mensajeDirectiva,
    });
  }

  /** Acepta o rechaza una solicitud de inscripción a taller */
  responderInscripcionTaller(id: number, estado: 'ACEPTADO' | 'RECHAZADO'): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/inscripcion-taller/${id}/responder`, { estado });
  }

  /** El alumno se retira de un taller inscrito */
  retirarseDeTaller(inscripcionId: number, alumnoId: number) {
    return this.http.patch<{ ok: true }>(`${this.apiUrl}/inscripcion-taller/${inscripcionId}/retirar`, {
      alumnoId,
    });
  }

  // Fichas alumno por taller
  /** Fichas de alumnos de un taller (con filtros por rol y solo inscritos) */
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

  /** Guarda o actualiza la ficha física de un alumno en un taller */
  guardarFichaAlumnoTaller(alumnoId: number, tallerId: number, ficha: Partial<FichaAlumnoPayload>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/ficha-alumno/${alumnoId}/${tallerId}`, ficha);
  }

  /** Obtiene la ficha de un alumno en un taller específico */
  getFichaAlumnoTaller(alumnoId: number, tallerId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ficha-alumno/${alumnoId}/${tallerId}`);
  }

  // Asistencia
  /** Abre una sesión de asistencia para el taller en la fecha indicada (hoy por defecto). */
  abrirSesionAsistencia(tallerId: number, profesorId: number, fecha?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/asistencia/sesion/abrir`, { tallerId, profesorId, fecha });
  }

  /** Sesión de asistencia abierta del taller, si existe */
  getSesionActiva(tallerId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/asistencia/sesion/activa/${tallerId}`);
  }

  /** Historial de sesiones de asistencia de un taller */
  getHistorialSesiones(tallerId: number): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/asistencia/sesiones/${tallerId}`);
  }

  /** Actualiza los registros de asistencia de una sesión abierta */
  actualizarAsistencia(sesionId: number, registros: any[]): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/asistencia/sesion/${sesionId}/registros`, { registros });
  }

  /** Cierra la sesión de asistencia con observaciones opcionales */
  cerrarSesionAsistencia(sesionId: number, observaciones?: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/asistencia/sesion/${sesionId}/cerrar`, { observaciones });
  }

  /** Reporte de asistencia agregado de un taller */
  getReporteAsistencia(tallerId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/asistencia/reporte/${tallerId}`);
  }

  /** Alertas de ausencia recurrente para gestión (opcionalmente por taller) */
  getAlertasGestion(tallerId?: number): Observable<any[]> {
    const q = tallerId ? `?tallerId=${tallerId}` : '';
    return this.http.get<any[]>(`${this.apiUrl}/asistencia/alertas/gestion${q}`);
  }

  /** Actualiza el umbral de ausencias que dispara alertas en un taller */
  actualizarUmbralAusencias(tallerId: number, umbral: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/asistencia/umbral/${tallerId}`, { umbralAusencias: umbral });
  }

  /** Registra contacto con apoderado por una alerta de ausencia */
  contactarApoderado(alertaId: number, notas: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/asistencia/alertas/${alertaId}/contactar`, { notas });
  }

  /** Marca una alerta de ausencia como resuelta */
  resolverAlerta(alertaId: number, notas: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/asistencia/alertas/${alertaId}/resolver`, { notas });
  }

  // Período
  /** Período académico activo en el sistema */
  getPeriodoActivo(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/periodo/activo`);
  }

  /** Lista todos los períodos académicos */
  getPeriodos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/periodo`);
  }

  /** Crea o actualiza la configuración del período académico */
  configurarPeriodo(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/periodo`, data);
  }

  /** Estadísticas comparativas del semestre por período y/o profesor */
  getComparacionSemestre(periodoId?: number, profesorId?: number): Observable<any> {
    const params: string[] = [];
    if (periodoId != null) params.push(`periodoId=${periodoId}`);
    if (profesorId != null) params.push(`profesorId=${profesorId}`);
    const q = params.length ? `?${params.join('&')}` : '';
    return this.http.get<any>(`${this.apiUrl}/taller/estadisticas/semestre${q}`);
  }

  // Notificaciones
  /** Notificaciones de un alumno */
  getNotificaciones(alumnoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/notificacion/por-alumno/${alumnoId}`);
  }

  /** Marca una notificación como leída (alumno) */
  marcarNotificacionLeida(id: number, alumnoId: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/notificacion/${id}/leer/${alumnoId}`, {});
  }

  /** Marca todas las notificaciones como leídas (alumno) */
  marcarTodasNotificacionesLeidas(alumnoId: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/notificacion/leer-todas/${alumnoId}`, {});
  }

  /** Notificaciones de un profesor */
  getNotificacionesProfesor(profesorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/notificacion/por-profesor/${profesorId}`);
  }

  /** Marca una notificación como leída (profesor) */
  marcarNotificacionLeidaProfesor(id: number, profesorId: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/notificacion/${id}/leer-profesor/${profesorId}`, {});
  }

  /** Marca todas las notificaciones como leídas (profesor) */
  marcarTodasNotificacionesLeidasProfesor(profesorId: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/notificacion/leer-todas-profesor/${profesorId}`, {});
  }

  /** Notificaciones de un administrador/directiva */
  getNotificacionesAdmin(adminId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/notificacion/por-admin/${adminId}`);
  }

  /** Marca una notificación como leída (admin) */
  marcarNotificacionLeidaAdmin(id: number, adminId: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/notificacion/${id}/leer-admin/${adminId}`, {});
  }

  /** Marca todas las notificaciones como leídas (admin) */
  marcarTodasNotificacionesLeidasAdmin(adminId: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/notificacion/leer-todas-admin/${adminId}`, {});
  }

  /** Elimina una notificación según el rol del destinatario */
  eliminarNotificacion(id: number, userId: number, rol: 'alumno' | 'profesor' | 'admin'): Observable<void> {
    const path =
      rol === 'alumno'
        ? `notificacion/${id}/alumno/${userId}`
        : rol === 'profesor'
          ? `notificacion/${id}/profesor/${userId}`
          : `notificacion/${id}/admin/${userId}`;
    return this.http.delete<void>(`${this.apiUrl}/${path}`);
  }
}
