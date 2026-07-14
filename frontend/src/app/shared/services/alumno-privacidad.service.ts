/**
 * =============================================================================
 * app/shared/services/alumno-privacidad.service.ts — Privacidad de datos de alumnos
 * =============================================================================
 * Facade (fachada) que enmascara nombre, RUT, correo y teléfono según el rol.
 *
 * Regla de negocio:
 *   Super admin → debeEnmascararDatosAlumno() = true → datos parcialmente ocultos
 *   Otros roles → ven los datos completos
 *
 * La lógica de enmascarado vive en alumno-privacidad.util.ts;
 * este servicio solo consulta AuthRoleService y delega.
 * =============================================================================
 */

import { Injectable, inject } from '@angular/core';

// Para saber si el usuario actual es super_admin.
import { AuthRoleService } from './auth-role.service';

// Función pura que aplica el enmascarado campo a campo.
import { datosAlumnoVisibles, DatosAlumnoVisibles } from '../utils/alumno-privacidad.util';

@Injectable({ providedIn: 'root' })
export class AlumnoPrivacidadService {
  // Sesión actual (rol).
  private auth = inject(AuthRoleService);

  /**
   * ¿Debemos ocultar datos personales?
   * Delega en AuthRoleService.debeEnmascararDatosAlumno() (super admin).
   */
  debeEnmascarar(): boolean {
    return this.auth.debeEnmascararDatosAlumno();
  }

  /**
   * Recibe un objeto alumno (o null) y devuelve
   * { nombre, rut, email, telefono } ya visibles u ocultos.
   */
  alumno(
    alumno: { nombre?: string | null; rut?: string | null; email?: string | null; telefono?: string | null } | null | undefined,
  ): DatosAlumnoVisibles {
    return datosAlumnoVisibles(alumno, this.debeEnmascarar());
  }

  /**
   * Atajo: solo el nombre visible (completo o enmascarado).
   * Útil en listados donde solo muestras el nombre.
   */
  nombre(valor?: string | null): string {
    return datosAlumnoVisibles({ nombre: valor }, this.debeEnmascarar()).nombre;
  }

  /** Atajo: solo el RUT visible. */
  rut(valor?: string | null): string {
    return datosAlumnoVisibles({ rut: valor }, this.debeEnmascarar()).rut;
  }

  /** Atajo: solo el correo visible. */
  email(valor?: string | null): string {
    return datosAlumnoVisibles({ email: valor }, this.debeEnmascarar()).email;
  }

  /** Atajo: solo el teléfono visible. */
  telefono(valor?: string | null): string {
    return datosAlumnoVisibles({ telefono: valor }, this.debeEnmascarar()).telefono;
  }
}
