/**
 * Utilidades de contraseña con PBKDF2-SHA512.
 * Centraliza hash, verificación y contraseña por defecto del sistema.
 */
import * as crypto from 'crypto';

const DEFAULT_PASSWORD = '12345';

/** Genera hash y salt para almacenar una contraseña. */
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const passwordSalt = salt ?? crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, passwordSalt, 1000, 64, 'sha512')
    .toString('hex');
  return { hash, salt: passwordSalt };
}

/**
 * Compara contraseña ingresada con hash almacenado.
 * Si no hay hash válido, acepta la contraseña por defecto (usuarios sin inicializar).
 */
export function verifyPassword(
  password: string,
  storedHash?: string | null,
  storedSalt?: string | null,
): boolean {
  if (!storedHash || !storedSalt || storedHash === 'hash') {
    return password === DEFAULT_PASSWORD;
  }
  const { hash } = hashPassword(password, storedSalt);
  return hash === storedHash;
}

/** Indica si el usuario aún no definió contraseña (placeholder o vacío en BD). */
export function needsPasswordInit(hash?: string | null): boolean {
  return !hash || hash === 'hash' || hash === '';
}

/** Contraseña temporal usada en el primer acceso antes de personalizarla. */
export function defaultPassword(): string {
  return DEFAULT_PASSWORD;
}
