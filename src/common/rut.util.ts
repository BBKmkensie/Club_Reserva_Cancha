/**
 * Utilidades para normalizar y detectar RUT chileno.
 * Usado en login y búsqueda de usuarios por identificador.
 */

/** Elimina puntos, guiones y espacios; deja dígito verificador en mayúscula. */
export function normalizarRut(rut: string): string {
  return rut.trim().replace(/\./g, '').replace(/-/g, '').replace(/\s/g, '').toUpperCase();
}

/** Heurística: el texto tiene forma de RUT (7-8 dígitos + verificador). */
export function pareceRut(usuario: string): boolean {
  const n = normalizarRut(usuario);
  return /^\d{7,8}-[\dkK]$/.test(n) || /^\d{7,8}[\dkK]$/.test(n);
}
