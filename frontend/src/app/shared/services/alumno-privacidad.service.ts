import { Injectable, inject } from '@angular/core';
import { AuthRoleService } from './auth-role.service';
import { datosAlumnoVisibles, DatosAlumnoVisibles } from '../utils/alumno-privacidad.util';

@Injectable({ providedIn: 'root' })
export class AlumnoPrivacidadService {
  private auth = inject(AuthRoleService);

  debeEnmascarar(): boolean {
    return this.auth.debeEnmascararDatosAlumno();
  }

  alumno(
    alumno: { nombre?: string | null; rut?: string | null; email?: string | null; telefono?: string | null } | null | undefined,
  ): DatosAlumnoVisibles {
    return datosAlumnoVisibles(alumno, this.debeEnmascarar());
  }

  nombre(valor?: string | null): string {
    return datosAlumnoVisibles({ nombre: valor }, this.debeEnmascarar()).nombre;
  }

  rut(valor?: string | null): string {
    return datosAlumnoVisibles({ rut: valor }, this.debeEnmascarar()).rut;
  }

  email(valor?: string | null): string {
    return datosAlumnoVisibles({ email: valor }, this.debeEnmascarar()).email;
  }
}
