/**
 * Servicio de privacidad de datos de alumnos en la interfaz.
 * Aplica enmascaramiento de nombre, RUT, correo y teléfono según el rol del usuario autenticado.
 */
import { Injectable, inject } from '@angular/core';
import { AuthRoleService } from './auth-role.service';
import { datosAlumnoVisibles, DatosAlumnoVisibles } from '../utils/alumno-privacidad.util';

/**
 * Facade para exponer datos de alumno respetando las reglas de privacidad del rol actual.
 */
@Injectable({ providedIn: 'root' })
export class AlumnoPrivacidadService {
  private auth = inject(AuthRoleService);

  /** Indica si el usuario actual debe ver datos de alumno enmascarados. */
  debeEnmascarar(): boolean {
    return this.auth.debeEnmascararDatosAlumno();
  }

  /**
   * Devuelve los campos visibles de un alumno (completos o enmascarados).
   */
  alumno(
    alumno: { nombre?: string | null; rut?: string | null; email?: string | null; telefono?: string | null } | null | undefined,
  ): DatosAlumnoVisibles {
    return datosAlumnoVisibles(alumno, this.debeEnmascarar());
  }

  /** Devuelve el nombre visible del alumno según las reglas de privacidad. */
  nombre(valor?: string | null): string {
    return datosAlumnoVisibles({ nombre: valor }, this.debeEnmascarar()).nombre;
  }

  /** Devuelve el RUT visible del alumno según las reglas de privacidad. */
  rut(valor?: string | null): string {
    return datosAlumnoVisibles({ rut: valor }, this.debeEnmascarar()).rut;
  }

  /** Devuelve el correo visible del alumno según las reglas de privacidad. */
  email(valor?: string | null): string {
    return datosAlumnoVisibles({ email: valor }, this.debeEnmascarar()).email;
  }
}
