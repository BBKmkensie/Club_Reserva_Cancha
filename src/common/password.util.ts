/**
 * =============================================================================
 * common/password.util.ts — UTILIDADES DE CONTRASEÑA (PBKDF2-SHA512)
 * =============================================================================
 * Centraliza hash, verificación y contraseña por defecto del sistema.
 * Lo usan AuthService, seeds de alumnos, etc.
 *
 * Flujo típico:
 *   1) hashPassword('12345') → { hash, salt }  (guardar en BD)
 *   2) verifyPassword(input, hash, salt) → true/false
 *   3) needsPasswordInit(hash) → ¿aún es placeholder / vacío?
 *   4) defaultPassword() → '12345' (clave temporal de primer acceso)
 * =============================================================================
 */

// crypto = módulo nativo de Node.js (randomBytes, pbkdf2Sync).
import * as crypto from 'crypto';

/** Contraseña temporal de primer acceso (NO usar en producción como clave final). */
const DEFAULT_PASSWORD = '12345';

/**
 * hashPassword(password, salt?):
 *   - Genera (o reutiliza) un salt aleatorio
 *   - Aplica PBKDF2-SHA512 (1000 iteraciones, 64 bytes) → string hex
 *   - Retorna { hash, salt } para guardar en la entidad
 *
 * Si pasas salt (ej. al verificar), recalcula el hash con ese mismo salt.
 */
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  // Si no hay salt → generar 16 bytes aleatorios en hex
  const passwordSalt = salt ?? crypto.randomBytes(16).toString('hex');
  // PBKDF2: password + salt + iteraciones + largo + algoritmo
  const hash = crypto
    .pbkdf2Sync(password, passwordSalt, 1000, 64, 'sha512')
    .toString('hex');
  return { hash, salt: passwordSalt };
}

/**
 * verifyPassword(password, storedHash, storedSalt):
 *   Compara la contraseña ingresada con el hash almacenado.
 *
 * Si no hay hash válido (null, vacío o placeholder 'hash'):
 *   acepta la contraseña por defecto (usuarios sin inicializar).
 */
export function verifyPassword(
  password: string,
  storedHash?: string | null,
  storedSalt?: string | null,
): boolean {
  // Sin hash real → solo pasa la clave temporal
  if (!storedHash || !storedSalt || storedHash === 'hash') {
    return password === DEFAULT_PASSWORD;
  }
  // Recalcula hash con el salt guardado y compara
  const { hash } = hashPassword(password, storedSalt);
  return hash === storedHash;
}

/**
 * needsPasswordInit(hash):
 *   Indica si el usuario aún no definió contraseña
 *   (placeholder 'hash', null o string vacío en BD).
 */
export function needsPasswordInit(hash?: string | null): boolean {
  return !hash || hash === 'hash' || hash === '';
}

/**
 * defaultPassword():
 *   Contraseña temporal usada en el primer acceso antes de personalizarla.
 */
export function defaultPassword(): string {
  return DEFAULT_PASSWORD;
}
