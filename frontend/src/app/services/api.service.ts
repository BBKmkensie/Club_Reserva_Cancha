import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Admin endpoints
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

  // Taller endpoints
  getTalleres(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/taller`);
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

  deleteTaller(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/taller/${id}`);
  }

  // Alumno endpoints
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

  // Profesor endpoints
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

  // Reserva endpoints
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

  // Salida endpoints
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

  // Inscripción alumno a salida (usuarios/alumnos)
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

  // Inscripción a taller (solicitud → profesor acepta/rechaza)
  solicitarInscripcionTaller(alumnoId: number, tallerId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/inscripcion-taller`, { alumnoId, tallerId });
  }

  getInscripcionesTallerPorAlumno(alumnoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inscripcion-taller/por-alumno/${alumnoId}`);
  }

  getInscripcionesTallerPorTaller(tallerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inscripcion-taller/por-taller/${tallerId}`);
  }

  responderInscripcionTaller(id: number, estado: 'ACEPTADO' | 'RECHAZADO'): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/inscripcion-taller/${id}/responder`, { estado });
  }
}

