import * as crypto from 'crypto';

const DEFAULT_PASSWORD = '12345';

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const passwordSalt = salt ?? crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, passwordSalt, 1000, 64, 'sha512')
    .toString('hex');
  return { hash, salt: passwordSalt };
}

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

export function needsPasswordInit(hash?: string | null): boolean {
  return !hash || hash === 'hash' || hash === '';
}

export function defaultPassword(): string {
  return DEFAULT_PASSWORD;
}
