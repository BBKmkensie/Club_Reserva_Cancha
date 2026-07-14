/**
 * =============================================================================
 * common/rut.util.ts — UTILIDADES DE RUT CHILENO
 * =============================================================================
 * Normaliza y detecta RUT para login / búsqueda de usuarios.
 *
 * Ejemplos:
 *   normalizarRut('12.345.678-9') → '123456789'
 *   pareceRut('12.345.678-9')     → true
 *   pareceRut('ana@mail.com')     → false
 * =============================================================================
 */

/**
 * normalizarRut(rut):
 *   Elimina puntos, guiones y espacios; deja dígito verificador en mayúscula.
 *   Así "12.345.678-k" y "12345678K" se comparan igual.
 */
export function normalizarRut(rut: string): string {
  return rut
    .trim() // quita espacios al inicio/final
    .replace(/\./g, '') // quita puntos
    .replace(/-/g, '') // quita guiones
    .replace(/\s/g, '') // quita espacios internos
    .toUpperCase(); // dígito verificador 'k' → 'K'
}

/**
 * pareceRut(usuario):
 *   Heurística: el texto tiene forma de RUT (7-8 dígitos + verificador).
 *   Acepta con o sin guión: 12345678-9 o 123456789.
 *
 *   No valida el dígito verificador matemático: solo la FORMA.
 */
export function pareceRut(usuario: string): boolean {
  const n = normalizarRut(usuario);
  // Con guión: 1234567-9  |  Sin guión: 12345679
  return /^\d{7,8}-[\dkK]$/.test(n) || /^\d{7,8}[\dkK]$/.test(n);
}
