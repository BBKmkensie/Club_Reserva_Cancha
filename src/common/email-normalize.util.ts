/** Corrige typos frecuentes y normaliza emails antes de guardar o enviar. */
export function normalizarEmail(email?: string | null): string | undefined {
  if (!email?.trim()) return undefined;
  let e = email.trim().toLowerCase();
  e = e.replace(/@gmial\.com$/i, '@gmail.com');
  e = e.replace(/@gmai\.com$/i, '@gmail.com');
  e = e.replace(/@gnail\.com$/i, '@gmail.com');
  return e;
}
