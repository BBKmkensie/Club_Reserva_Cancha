/** Ej.: "Nicolas Reyes" → "Nicolas R" */
export function enmascararNombreCompleto(nombre: string | null | undefined): string {
  if (!nombre?.trim()) return '—';
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length <= 1) return partes[0];
  const inicial = partes[partes.length - 1].charAt(0).toUpperCase();
  return `${partes[0]} ${inicial}`;
}

/** Solo los primeros 5 dígitos del RUT */
export function enmascararRut(rut: string | null | undefined): string {
  if (!rut?.trim()) return '—';
  const digitos = rut.replace(/\D/g, '');
  if (!digitos) return '—';
  return digitos.slice(0, 5);
}

/** Ej.: "nicolasreyes@gmail.com" → "nicolasr@gmail.com */
export function enmascararEmail(email: string | null | undefined): string {
  if (!email?.trim()) return '—';
  const trimmed = email.trim();
  const at = trimmed.indexOf('@');
  if (at <= 0) return trimmed;
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  const visible = local.length <= 8
    ? (local.length <= 1 ? '*' : `${local.charAt(0)}***`)
    : local.slice(0, 8);
  return `${visible}@${domain}`;
}

export function enmascararTelefono(telefono: string | null | undefined): string {
  if (!telefono?.trim()) return '—';
  const digitos = telefono.replace(/\D/g, '');
  if (!digitos) return '—';
  return digitos.slice(0, 4);
}

export interface DatosAlumnoVisibles {
  nombre: string;
  rut: string;
  email: string;
  telefono: string;
}

export function datosAlumnoVisibles(
  alumno: { nombre?: string | null; rut?: string | null; email?: string | null; telefono?: string | null } | null | undefined,
  enmascarar: boolean,
): DatosAlumnoVisibles {
  if (!alumno) {
    return { nombre: '—', rut: '—', email: '—', telefono: '—' };
  }
  if (!enmascarar) {
    return {
      nombre: alumno.nombre ?? '—',
      rut: alumno.rut ?? '—',
      email: alumno.email ?? '—',
      telefono: alumno.telefono ?? '—',
    };
  }
  return {
    nombre: enmascararNombreCompleto(alumno.nombre),
    rut: enmascararRut(alumno.rut),
    email: enmascararEmail(alumno.email),
    telefono: enmascararTelefono(alumno.telefono),
  };
}
