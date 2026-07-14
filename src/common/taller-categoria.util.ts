/**
 * Clasificación de talleres por categoría (espejo del frontend).
 * Usado para reglas de negocio como exigir ficha física solo en deportes.
 */
export function normalizarNombreTaller(nombre: string): string {
  return (nombre || '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

const TIPOS_DEPORTES = new Set([
  'futbol',
  'voley',
  'voleibol',
  'basquet',
  'basket',
  'tenisdemesa',
  'musculacion',
  'defensapersonal',
  'atletismo',
  'zumba',
]);

/** True si el taller es un club deportivo y requiere ficha antropométrica. */
export function requiereFichaFisica(tipo: string): boolean {
  return TIPOS_DEPORTES.has(normalizarNombreTaller(tipo));
}
