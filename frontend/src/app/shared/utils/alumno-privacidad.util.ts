/**
 * =============================================================================
 * app/shared/utils/alumno-privacidad.util.ts — Enmascaramiento de datos personales
 * =============================================================================
 * Funciones para ocultar parcialmente nombre, RUT, email y teléfono de alumnos
 * cuando el rol del usuario no debe ver información sensible completa.
 * Se usa en fichas-alumnos, portal-apoderado y ficha-grafico-taller.
 *
 * Exporta: enmascararNombreCompleto(), enmascararRut(), enmascararEmail(),
 *          enmascararTelefono(), datosAlumnoVisibles().
 * =============================================================================
 */

/**
 * Enmascara un nombre completo mostrando solo el primer nombre y la inicial
 * del apellido. Ejemplo: «Nicolas Reyes» → «Nicolas R».
 */
export function enmascararNombreCompleto(nombre: string | null | undefined): string {
  if (!nombre?.trim()) return '—';
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length <= 1) return partes[0];
  const inicial = partes[partes.length - 1].charAt(0).toUpperCase();
  return `${partes[0]} ${inicial}`;
}

/**
 * Enmascara un RUT mostrando solo los primeros 5 dígitos numéricos.
 */
export function enmascararRut(rut: string | null | undefined): string {
  if (!rut?.trim()) return '—';
  const digitos = rut.replace(/\D/g, '');
  if (!digitos) return '—';
  return digitos.slice(0, 5);
}

/**
 * Enmascara la parte local de un email conservando el dominio visible.
 * Ejemplo: «nicolasreyes@gmail.com» → «nicolasr@gmail.com».
 */
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

/**
 * Enmascara un teléfono mostrando solo los primeros 4 dígitos numéricos.
 */
export function enmascararTelefono(telefono: string | null | undefined): string {
  if (!telefono?.trim()) return '—';
  const digitos = telefono.replace(/\D/g, '');
  if (!digitos) return '—';
  return digitos.slice(0, 4);
}

/** Campos de alumno listos para mostrar en la interfaz con valores enmascarados o completos. */
export interface DatosAlumnoVisibles {
  nombre: string;
  rut: string;
  email: string;
  telefono: string;
}

/**
 * Resuelve los datos visibles de un alumno aplicando enmascaramiento si el
 * parámetro enmascarar es true. Si el alumno es null, devuelve «—» en todos
 * los campos.
 */
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
