/**
 * =============================================================================
 * app/services/api.service.ts — Cliente HTTP centralizado (REST)
 * =============================================================================
 * Servicio inyectable (providedIn: 'root') que encapsula TODAS las peticiones
 * al backend NestJS. Usa environment.apiUrl como base y HttpClient de Angular.
 *
 * Dominios: Auth, Apoderado, Admin, Taller, Alumno, Profesor, Reserva,
 * Franja-cancha, Salida, Inscripciones, Asistencia, Período, Notificaciones,
 * Fichas alumno.
 *
 * El authInterceptor adjunta el JWT automáticamente; no hace falta pasarlo aquí.
 * Cada método público indica VERBO + endpoint debajo del comentario.
 * =============================================================================
 */

// Injectable = servicio disponible en toda la app.
import { Injectable } from '@angular/core';

// HttpClient = cliente HTTP de Angular (get/post/patch/put/delete).
import { HttpClient } from '@angular/common/http';

// Observable = la respuesta llega de forma asíncrona (subscribe / async pipe).
import { Observable } from 'rxjs';

// apiUrl de desarrollo o producción.
import { environment } from '../../environments/environment';

/**
 * Datos físicos del alumno asociados a una inscripción o ficha de taller.
 * Se envían en solicitarInscripcionTaller / guardarFichaAlumnoTaller.
 */
export interface FichaAlumnoPayload {
  // Estatura en cm (opcional).
  altura?: number | null;
  // Peso en kg (opcional).
  peso?: number | null;
  // % de grasa corporal (opcional).
  porcentajeGrasa?: number | null;
  // Si el alumno es sedentario (opcional).
  sedentario?: boolean | null;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  // Prefijo de todas las URLs (ej. http://localhost:3000 o '' en prod).
  private apiUrl = environment.apiUrl;

  // Angular inyecta HttpClient (registrado en main.ts con provideHttpClient).
  constructor(private http: HttpClient) {}

  // =========================================================================
  // AUTH
  // =========================================================================

  /** POST /auth/login — login con tipo de usuario explícito (flujo legado). */
  login(tipo: 'admin' | 'directiva' | 'profesor' | 'alumno' | 'apoderado', usuario: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { tipo, usuario, password });
  }

  /** POST /auth/login — login unificado; el backend resuelve el tipo de cuenta. */
  loginUnified(usuario: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { usuario, password });
  }

  // =========================================================================
  // APODERADO
  // =========================================================================

  /** GET /apoderado/resumen — hijo, asistencia y taller del portal apoderado. */
  getApoderadoResumen(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/apoderado/resumen`);
  }

  // =========================================================================
  // ADMIN
  // =========================================================================

  /** GET /admin — lista todos los administradores. */
  getAdmins(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin`);
  }

  /** GET /admin/:id — obtiene un administrador por ID. */
  getAdmin(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/${id}`);
  }

  /** POST /admin — crea un nuevo administrador. */
  createAdmin(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin`, data);
  }

  /** DELETE /admin/:id — elimina un administrador. */
  deleteAdmin(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/${id}`);
  }

  // =========================================================================
  // TALLER / ACTIVIDAD
  // =========================================================================

  /** GET /taller — lista todos los talleres/actividades. */
  getTalleres(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/taller`);
  }

  /** GET /taller/catalogo — catálogo público de tipos de taller. */
  getCatalogoTalleres(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/taller/catalogo`);
  }

  /** GET /taller/catalogo/:id — detalle de un ítem del catálogo. */
  getCatalogoTallerDetalle(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/taller/catalogo/${id}`);
  }

  /** GET /taller/:id — detalle de un taller por ID. */
  getTaller(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/taller/${id}`);
  }

  /** POST /taller — crea un nuevo taller/actividad. */
  createTaller(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/taller`, data);
  }

  /** PATCH /taller/:id — actualiza datos generales del taller. */
  updateTaller(id: number, data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/taller/${id}`, data);
  }

  /**
   * PATCH /taller/:id/presentacion — descripción, foto y profesor visible.
   * Query opcionales: esDirectiva, profesorId.
   */
  actualizarPresentacionTaller(
    tallerId: number,
    data: { descripcion?: string; fotoPath?: string; profesorId?: number },
    opts?: { esDirectiva?: boolean; profesorId?: number },
  ): Observable<any> {
    // Armamos query string solo con los flags que vengan.
    const params = new URLSearchParams();
    if (opts?.esDirectiva) params.set('esDirectiva', 'true');
    if (opts?.profesorId != null) params.set('profesorId', String(opts.profesorId));
    const qs = params.toString();
    const url = `${this.apiUrl}/taller/${tallerId}/presentacion${qs ? `?${qs}` : ''}`;
    return this.http.patch<any>(url, data);
  }

  /** DELETE /taller/:id — elimina un taller. */
  deleteTaller(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/taller/${id}`);
  }

  /** POST /taller/:id/asignar-docente — asigna profesor a la actividad. */
  asignarDocenteActividad(tallerId: number, profesorId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/taller/${tallerId}/asignar-docente`, { profesorId });
  }

  /** GET /taller/asignaciones/pendientes?profesorId= — asignaciones por responder. */
  getAsignacionesPendientes(profesorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/taller/asignaciones/pendientes?profesorId=${profesorId}`);
  }

  /** PATCH /taller/asignaciones/:id/responder — acepta o rechaza asignación. */
  responderAsignacion(asignacionId: number, profesorId: number, acepta: boolean, motivo?: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/taller/asignaciones/${asignacionId}/responder`, {
      profesorId, acepta, motivo,
    });
  }

  /** PATCH /taller/:id/horario — define o actualiza el horario de la actividad. */
  definirHorarioActividad(tallerId: number, horario: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/taller/${tallerId}/horario`, horario);
  }

  /** POST /taller/:id/publicar — publica la actividad (fechas de inscripción opcionales). */
  publicarActividad(tallerId: number, data?: { fechaAperturaInscripcion?: string; fechaCierreInscripcion?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/taller/${tallerId}/publicar`, data ?? {});
  }

  /** POST /taller/:id/cerrar — cierra la actividad (fin del período operativo). */
  cerrarActividad(tallerId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/taller/${tallerId}/cerrar`, {});
  }

  /** GET /taller/:id/reporte — reporte consolidado (inscripciones, asistencia…). */
  getReporteActividad(tallerId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/taller/${tallerId}/reporte`);
  }

  // =========================================================================
  // ALUMNO
  // =========================================================================

  /** GET /alumno o /alumno?tallerId= — lista alumnos (filtro opcional por taller). */
  getAlumnos(tallerId?: number): Observable<any[]> {
    const url = tallerId
      ? `${this.apiUrl}/alumno?tallerId=${tallerId}`
      : `${this.apiUrl}/alumno`;
    return this.http.get<any[]>(url);
  }

  /** GET /alumno/:id — obtiene un alumno por ID. */
  getAlumno(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/alumno/${id}`);
  }

  /** POST /alumno — registra un nuevo alumno. */
  createAlumno(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/alumno`, data);
  }

  /** PATCH /alumno/:id — actualiza datos de un alumno. */
  updateAlumno(id: number, data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/alumno/${id}`, data);
  }

  /** DELETE /alumno/:id — elimina un alumno. */
  deleteAlumno(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/alumno/${id}`);
  }

  // =========================================================================
  // PROFESOR
  // =========================================================================

  /** GET /profesor o /profesor?tallerId= — lista profesores. */
  getProfesores(tallerId?: number): Observable<any[]> {
    const url = tallerId
      ? `${this.apiUrl}/profesor?tallerId=${tallerId}`
      : `${this.apiUrl}/profesor`;
    return this.http.get<any[]>(url);
  }

  /** GET /profesor/:id — obtiene un profesor por ID. */
  getProfesor(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profesor/${id}`);
  }

  /** POST /profesor/login — autentica a un profesor (endpoint dedicado). */
  loginProfesor(usuario: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/profesor/login`, { usuario, password });
  }

  /** POST /profesor — crea un nuevo profesor. */
  createProfesor(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/profesor`, data);
  }

  /** PATCH /profesor/:id — actualiza datos de un profesor. */
  updateProfesor(id: number, data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/profesor/${id}`, data);
  }

  /** DELETE /profesor/:id — elimina un profesor. */
  deleteProfesor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/profesor/${id}`);
  }

  // =========================================================================
  // RESERVA DE CANCHA
  // =========================================================================

  /** GET /reserva?tallerId=&fecha= — lista reservas (filtros opcionales). */
  getReservas(tallerId?: number, fecha?: string): Observable<any[]> {
    let url = `${this.apiUrl}/reserva`;
    const params: string[] = [];
    if (tallerId) params.push(`tallerId=${tallerId}`);
    if (fecha) params.push(`fecha=${fecha}`);
    if (params.length > 0) url += '?' + params.join('&');
    return this.http.get<any[]>(url);
  }

  /** GET /reserva/:id — obtiene una reserva por ID. */
  getReserva(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reserva/${id}`);
  }

  /** POST /reserva — crea una nueva reserva de cancha. */
  createReserva(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reserva`, data);
  }

  /** PATCH /reserva/:id — actualiza una reserva existente. */
  updateReserva(id: number, data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/reserva/${id}`, data);
  }

  /** DELETE /reserva/:id — elimina una reserva. */
  deleteReserva(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reserva/${id}`);
  }

  /** GET /reserva/disponibilidad?fecha=&espacio= — slots libres/ocupados del día. */
  getDisponibilidadCancha(fecha: string, espacio = 'Cancha Principal'): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/reserva/disponibilidad?fecha=${fecha}&espacio=${encodeURIComponent(espacio)}`,
    );
  }

  /** GET /reserva/disponibilidad-semana?espacio=&fechaInicio= — slots de la semana. */
  getDisponibilidadSemanaCancha(fechaInicio?: string, espacio = 'Cancha Principal'): Observable<any[]> {
    let url = `${this.apiUrl}/reserva/disponibilidad-semana?espacio=${encodeURIComponent(espacio)}`;
    if (fechaInicio) url += `&fechaInicio=${fechaInicio}`;
    return this.http.get<any[]>(url);
  }

  /** GET /franja-cancha?espacio= — franjas horarias configuradas del espacio. */
  getFranjasCancha(espacio = 'Cancha Principal'): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/franja-cancha?espacio=${encodeURIComponent(espacio)}`,
    );
  }

  /** PUT /franja-cancha — actualiza franjas activas y duración por día. */
  actualizarFranjasCancha(
    franjas: { diaSemana: number; horaInicio: string; activa: boolean; duracionMinutos?: number }[],
    espacio = 'Cancha Principal',
  ): Observable<any[]> {
    return this.http.put<any[]>(`${this.apiUrl}/franja-cancha`, { espacio, franjas });
  }

  // =========================================================================
  // SALIDA PEDAGÓGICA
  // =========================================================================

  /** GET /salida?tallerId=&alumnoId=&profesorId= — lista salidas (filtros opcionales). */
  getSalidas(tallerId?: number, alumnoId?: number, profesorId?: number): Observable<any[]> {
    const params = new URLSearchParams();
    if (tallerId != null) params.set('tallerId', String(tallerId));
    if (alumnoId != null) params.set('alumnoId', String(alumnoId));
    if (profesorId != null) params.set('profesorId', String(profesorId));
    const q = params.toString() ? `?${params}` : '';
    return this.http.get<any[]>(`${this.apiUrl}/salida${q}`);
  }

  /** GET /salida/:id — obtiene una salida por ID. */
  getSalida(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/salida/${id}`);
  }

  /** POST /salida — crea una nueva salida pedagógica. */
  createSalida(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/salida`, data);
  }

  /** PATCH /salida/:id — actualiza datos de una salida. */
  updateSalida(id: number, data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/salida/${id}`, data);
  }

  /** DELETE /salida/:id — elimina una salida. */
  deleteSalida(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/salida/${id}`);
  }

  /** GET /salida/publicadas — salidas visibles para inscripción de alumnos. */
  getSalidasPublicadas(tallerId?: number, alumnoId?: number): Observable<any[]> {
    const params = new URLSearchParams();
    if (tallerId != null) params.set('tallerId', String(tallerId));
    if (alumnoId != null) params.set('alumnoId', String(alumnoId));
    const q = params.toString() ? `?${params}` : '';
    return this.http.get<any[]>(`${this.apiUrl}/salida/publicadas${q}`);
  }

  /** GET /salida/pendientes/profesor/:profesorId — propuestas pendientes del profesor. */
  getSalidasPendientesProfesor(profesorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/salida/pendientes/profesor/${profesorId}`);
  }

  /** GET /salida/pendientes/directiva — salidas pendientes de revisión directiva. */
  getSalidasPendientesDirectiva(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/salida/pendientes/directiva`);
  }

  /** GET /salida/por-profesor/:profesorId — salidas del taller del profesor o a su nombre. */
  getSalidasPorProfesor(profesorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/salida/por-profesor/${profesorId}`);
  }

  /** POST /salida/asignar — la directiva asigna salida a taller + profesor. */
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

  /** POST /salida/proponer — el profesor propone una salida para aprobación. */
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

  /** PATCH /salida/:id/responder?actor= — acepta o rechaza (profesor | directiva). */
  responderSalida(id: number, acepta: boolean, actor: 'profesor' | 'directiva', actorId?: number, motivo?: string): Observable<any> {
    const params = new URLSearchParams({ actor });
    if (actorId != null) params.set('actorId', String(actorId));
    return this.http.patch<any>(`${this.apiUrl}/salida/${id}/responder?${params}`, { acepta, motivo });
  }

  /** PATCH /salida/:id/abrir?profesorId= — el profesor abre la salida el día de la actividad. */
  abrirSalida(id: number, profesorId: number, comentario?: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/salida/${id}/abrir?profesorId=${profesorId}`, { comentario });
  }

  /** PATCH /salida/:id/cerrar?profesorId= — cierra con resultado EXITO | FRACASO. */
  cerrarSalida(id: number, profesorId: number, resultado: 'EXITO' | 'FRACASO', comentario: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/salida/${id}/cerrar?profesorId=${profesorId}`, { resultado, comentario });
  }

  /** GET /salida/:id/asistencia — detalle de asistencia de la salida. */
  getAsistenciaSalida(salidaId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/salida/${salidaId}/asistencia`);
  }

  /** POST /salida/:id/asistencia/iniciar — inicia lista con alumnos inscritos. */
  iniciarAsistenciaSalida(salidaId: number, profesorId: number): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/salida/${salidaId}/asistencia/iniciar?profesorId=${profesorId}`,
      {},
    );
  }

  /** PATCH /salida/:id/asistencia/registros — presentes/ausentes. */
  actualizarAsistenciaSalida(
    salidaId: number,
    profesorId: number,
    registros: Array<{ alumnoId: number; estado: 'PRESENTE' | 'AUSENTE'; observacion?: string }>,
  ): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/salida/${salidaId}/asistencia/registros?profesorId=${profesorId}`,
      { registros },
    );
  }

  /** PATCH /salida/:id/asistencia/cerrar — cierra la asistencia de la salida. */
  cerrarAsistenciaSalida(salidaId: number, profesorId: number, observaciones?: string): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/salida/${salidaId}/asistencia/cerrar?profesorId=${profesorId}`,
      { observaciones },
    );
  }

  /** POST /salida/:id/asistencia/imagen — sube evidencia fotográfica. */
  subirImagenAsistenciaSalida(
    salidaId: number,
    profesorId: number,
    data: { base64: string; mimeType: string },
  ): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/salida/${salidaId}/asistencia/imagen?profesorId=${profesorId}`,
      { imagenBase64: data.base64, mimeType: data.mimeType },
    );
  }

  // =========================================================================
  // INSCRIPCIÓN A SALIDA
  // =========================================================================

  /** POST /inscripcion-salida — inscribe alumno en una salida publicada. */
  inscribirSalida(alumnoId: number, salidaId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/inscripcion-salida`, { alumnoId, salidaId });
  }

  /** GET /inscripcion-salida/por-alumno/:alumnoId — inscripciones de salida del alumno. */
  getInscripcionesPorAlumno(alumnoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inscripcion-salida/por-alumno/${alumnoId}`);
  }

  /** GET /inscripcion-salida/por-salida/:salidaId — alumnos inscritos en la salida. */
  getInscripcionesPorSalida(salidaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inscripcion-salida/por-salida/${salidaId}`);
  }

  /** DELETE /inscripcion-salida?alumnoId=&salidaId= — cancela inscripción. */
  desinscribirSalida(alumnoId: number, salidaId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/inscripcion-salida?alumnoId=${alumnoId}&salidaId=${salidaId}`);
  }

  // =========================================================================
  // INSCRIPCIÓN A TALLER
  // =========================================================================

  /** GET /inscripcion-taller/validar/:alumnoId/:tallerId — cupos, conflictos, elegibilidad. */
  validarInscripcionTaller(alumnoId: number, tallerId: number, notificar = false): Observable<any> {
    const q = notificar ? '?notificar=true' : '';
    return this.http.get<any>(`${this.apiUrl}/inscripcion-taller/validar/${alumnoId}/${tallerId}${q}`);
  }

  /** GET /inscripcion-taller/resumen/:tallerId — cupos e inscripciones del taller. */
  /** GET /inscripcion-taller/resumen/:tallerId — cupos, conteos e inscripciones del taller. */
  getResumenInscripcionesTaller(tallerId: number, ocultarDatosFisicos = false): Observable<any> {
    const q = ocultarDatosFisicos ? '?ocultarDatosFisicos=true' : '';
    return this.http.get<any>(`${this.apiUrl}/inscripcion-taller/resumen/${tallerId}${q}`);
  }

  /** POST /inscripcion-taller — solicita inscripción (ficha opcional en deportivos). */
  solicitarInscripcionTaller(alumnoId: number, tallerId: number, ficha?: FichaAlumnoPayload | null): Observable<any> {
    const body: any = { alumnoId, tallerId };
    if (ficha != null) body.ficha = ficha;
    return this.http.post<any>(`${this.apiUrl}/inscripcion-taller`, body);
  }

  /** PATCH /inscripcion-taller/:id/ficha — actualiza ficha física de la inscripción. */
  actualizarFichaInscripcion(inscripcionId: number, ficha: Partial<FichaAlumnoPayload>): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/inscripcion-taller/${inscripcionId}/ficha`, ficha);
  }

  /** GET /inscripcion-taller/por-alumno/:alumnoId — inscripciones a talleres del alumno. */
  getInscripcionesTallerPorAlumno(alumnoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inscripcion-taller/por-alumno/${alumnoId}`);
  }

  /** GET /inscripcion-taller/por-taller/:tallerId — inscripciones de un taller. */
  getInscripcionesTallerPorTaller(tallerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inscripcion-taller/por-taller/${tallerId}`);
  }

  /** GET /inscripcion-taller/pendientes — solicitudes pendientes de respuesta. */
  getInscripcionesPendientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inscripcion-taller/pendientes`);
  }

  /** POST /inscripcion-taller/proponer-directiva — directiva propone inscripción. */
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

  /** POST /apoderado/proponer-inscripcion/:tallerId — apoderado propone inscripción del hijo. */
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

  /** GET /apoderado/mis-propuestas — propuestas enviadas por el apoderado autenticado. */
  getMisPropuestasApoderado(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/apoderado/mis-propuestas`);
  }

  /** POST /apoderado/proponer-actividad-libre — propone actividad no catalogada. */
  proponerActividadLibre(data: {
    actividadNombre: string;
    actividadDescripcion?: string;
    horarioPropuestoTexto: string;
    mensajeApoderado?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/apoderado/proponer-actividad-libre`, data);
  }

  /** POST /inscripcion-taller/proponer-inscripcion/:tallerId — alumno propone inscripción del catálogo. */
  proponerInscripcionAlumno(
    tallerId: number,
    opts?: { tallerHorarioId?: number; horarioPropuestoTexto?: string; mensajeApoderado?: string },
  ): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/inscripcion-taller/proponer-inscripcion/${tallerId}`, {
      tallerHorarioId: opts?.tallerHorarioId,
      horarioPropuestoTexto: opts?.horarioPropuestoTexto,
      mensajeApoderado: opts?.mensajeApoderado,
    });
  }

  /** POST /inscripcion-taller/proponer-actividad-libre — alumno propone actividad libre a directiva. */
  proponerActividadLibreAlumno(data: {
    actividadNombre: string;
    actividadDescripcion?: string;
    horarioPropuestoTexto: string;
    mensajeApoderado?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/inscripcion-taller/proponer-actividad-libre`, data);
  }

  /** GET /inscripcion-taller/mis-propuestas — propuestas del alumno autenticado. */
  getMisPropuestasAlumno(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inscripcion-taller/mis-propuestas`);
  }

  /** GET /inscripcion-taller/propuestas/pendientes — propuestas pendientes de gestión. */
  getPropuestasPendientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inscripcion-taller/propuestas/pendientes`);
  }

  /** PATCH /inscripcion-taller/propuestas/:id/responder — acepta/rechaza propuesta. */
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

  /** PATCH /inscripcion-taller/:id/responder — acepta o rechaza solicitud (ACEPTADO|RECHAZADO). */
  responderInscripcionTaller(id: number, estado: 'ACEPTADO' | 'RECHAZADO'): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/inscripcion-taller/${id}/responder`, { estado });
  }

  /** PATCH /inscripcion-taller/:id/retirar — el alumno se retira del taller. */
  retirarseDeTaller(inscripcionId: number, alumnoId: number) {
    return this.http.patch<{ ok: true }>(`${this.apiUrl}/inscripcion-taller/${inscripcionId}/retirar`, {
      alumnoId,
    });
  }

  // =========================================================================
  // FICHAS ALUMNO POR TALLER
  // =========================================================================

  /** GET /ficha-alumno/taller/:tallerId — fichas del taller (filtros por rol). */
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

  /** PUT /ficha-alumno/:alumnoId/:tallerId — guarda o actualiza ficha física. */
  guardarFichaAlumnoTaller(alumnoId: number, tallerId: number, ficha: Partial<FichaAlumnoPayload>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/ficha-alumno/${alumnoId}/${tallerId}`, ficha);
  }

  /** GET /ficha-alumno/:alumnoId/:tallerId — ficha de un alumno en un taller. */
  getFichaAlumnoTaller(alumnoId: number, tallerId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ficha-alumno/${alumnoId}/${tallerId}`);
  }

  /** GET /ficha-alumno/alumno/:alumnoId/ultima — última ficha física conocida (cualquier taller). */
  getUltimaFichaAlumno(alumnoId: number): Observable<{
    encontrada: boolean;
    altura?: number;
    peso?: number;
    porcentajeGrasa?: number;
    sedentario?: boolean;
    tallerId?: number | null;
    fuente?: 'ficha' | 'inscripcion';
  }> {
    return this.http.get<any>(`${this.apiUrl}/ficha-alumno/alumno/${alumnoId}/ultima`);
  }

  // =========================================================================
  // ASISTENCIA
  // =========================================================================

  /** POST /asistencia/sesion/abrir — abre sesión de asistencia (fecha hoy por defecto). */
  abrirSesionAsistencia(tallerId: number, profesorId: number, fecha?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/asistencia/sesion/abrir`, { tallerId, profesorId, fecha });
  }

  /** GET /asistencia/sesion/activa/:tallerId — sesión abierta del taller, si existe. */
  getSesionActiva(tallerId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/asistencia/sesion/activa/${tallerId}`);
  }

  /** GET /asistencia/sesiones/:tallerId — historial de sesiones del taller. */
  getHistorialSesiones(tallerId: number): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/asistencia/sesiones/${tallerId}`);
  }

  /** PATCH /asistencia/sesion/:sesionId/registros — actualiza presentes/ausentes. */
  actualizarAsistencia(sesionId: number, registros: any[]): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/asistencia/sesion/${sesionId}/registros`, { registros });
  }

  /** PATCH /asistencia/sesion/:sesionId/cerrar — cierra la sesión (observaciones opcionales). */
  cerrarSesionAsistencia(sesionId: number, observaciones?: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/asistencia/sesion/${sesionId}/cerrar`, { observaciones });
  }

  /** GET /asistencia/reporte/:tallerId — reporte de asistencia agregado. */
  getReporteAsistencia(tallerId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/asistencia/reporte/${tallerId}`);
  }

  /** GET /asistencia/alertas/gestion?tallerId= — alertas de ausencia recurrente. */
  getAlertasGestion(tallerId?: number): Observable<any[]> {
    const q = tallerId ? `?tallerId=${tallerId}` : '';
    return this.http.get<any[]>(`${this.apiUrl}/asistencia/alertas/gestion${q}`);
  }

  /** PATCH /asistencia/umbral/:tallerId — umbral de ausencias que dispara alertas. */
  actualizarUmbralAusencias(tallerId: number, umbral: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/asistencia/umbral/${tallerId}`, { umbralAusencias: umbral });
  }

  /** PATCH /asistencia/alertas/:alertaId/contactar — registra contacto con apoderado. */
  contactarApoderado(alertaId: number, notas: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/asistencia/alertas/${alertaId}/contactar`, { notas });
  }

  /** PATCH /asistencia/alertas/:alertaId/resolver — marca alerta como resuelta. */
  resolverAlerta(alertaId: number, notas: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/asistencia/alertas/${alertaId}/resolver`, { notas });
  }

  // =========================================================================
  // PERÍODO ACADÉMICO
  // =========================================================================

  /** GET /periodo/activo — período académico activo. */
  getPeriodoActivo(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/periodo/activo`);
  }

  /** GET /periodo — lista todos los períodos académicos. */
  getPeriodos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/periodo`);
  }

  /** PUT /periodo — crea o actualiza la configuración del período. */
  configurarPeriodo(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/periodo`, data);
  }

  /** DELETE /periodo/:id — elimina un período inactivo del historial. */
  eliminarPeriodo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/periodo/${id}`);
  }

  /** GET /taller/estadisticas/semestre?periodoId=&profesorId= — comparación de semestre. */
  getComparacionSemestre(periodoId?: number, profesorId?: number): Observable<any> {
    const params: string[] = [];
    if (periodoId != null) params.push(`periodoId=${periodoId}`);
    if (profesorId != null) params.push(`profesorId=${profesorId}`);
    const q = params.length ? `?${params.join('&')}` : '';
    return this.http.get<any>(`${this.apiUrl}/taller/estadisticas/semestre${q}`);
  }

  // =========================================================================
  // NOTIFICACIONES
  // =========================================================================

  /** GET /notificacion/mias — notificaciones del usuario autenticado. */
  getNotificaciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/notificacion/mias`);
  }

  /** PATCH /notificacion/:id/leer — marca una como leída. */
  marcarNotificacionLeida(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/notificacion/${id}/leer`, {});
  }

  /** PATCH /notificacion/leer-todas — marca todas leídas. */
  marcarTodasNotificacionesLeidas(): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/notificacion/leer-todas`, {});
  }

  /** @deprecated Usar getNotificaciones() — el backend filtra por JWT. */
  getNotificacionesAlumno(_alumnoId: number): Observable<any[]> {
    return this.getNotificaciones();
  }

  /** @deprecated Usar marcarNotificacionLeida(id). */
  marcarNotificacionLeidaAlumno(id: number, _alumnoId: number): Observable<any> {
    return this.marcarNotificacionLeida(id);
  }

  /** @deprecated Usar marcarTodasNotificacionesLeidas(). */
  marcarTodasNotificacionesLeidasAlumno(_alumnoId: number): Observable<any> {
    return this.marcarTodasNotificacionesLeidas();
  }

  /** @deprecated Usar getNotificaciones(). */
  getNotificacionesProfesor(_profesorId: number): Observable<any[]> {
    return this.getNotificaciones();
  }

  /** @deprecated Usar marcarNotificacionLeida(id). */
  marcarNotificacionLeidaProfesor(id: number, _profesorId: number): Observable<any> {
    return this.marcarNotificacionLeida(id);
  }

  /** @deprecated Usar marcarTodasNotificacionesLeidas(). */
  marcarTodasNotificacionesLeidasProfesor(_profesorId: number): Observable<any> {
    return this.marcarTodasNotificacionesLeidas();
  }

  /** @deprecated Usar getNotificaciones(). */
  getNotificacionesAdmin(_adminId: number): Observable<any[]> {
    return this.getNotificaciones();
  }

  /** @deprecated Usar marcarNotificacionLeida(id). */
  marcarNotificacionLeidaAdmin(id: number, _adminId: number): Observable<any> {
    return this.marcarNotificacionLeida(id);
  }

  /** @deprecated Usar marcarTodasNotificacionesLeidas(). */
  marcarTodasNotificacionesLeidasAdmin(_adminId: number): Observable<any> {
    return this.marcarTodasNotificacionesLeidas();
  }

  /** DELETE /notificacion/:id — elimina una notificación del usuario autenticado. */
  eliminarNotificacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/notificacion/${id}`);
  }
}
