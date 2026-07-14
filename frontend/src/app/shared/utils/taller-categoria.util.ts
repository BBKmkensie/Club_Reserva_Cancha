/**
 * =============================================================================
 * app/shared/utils/taller-categoria.util.ts — Categorías de talleres para filtros
 * =============================================================================
 * Agrupa tipos de taller (deportes, religión, artes, etc.) para filtrar el
 * catálogo en el dashboard sin depender de un campo en base de datos.
 * =============================================================================
 */
import { normalizarTipoTaller } from './taller-tarjeta.util';

/** Identificador de categoría de filtro (incluye «todas»). */
export type CategoriaTallerId =
  | 'todas'
  | 'deportes'
  | 'religion'
  | 'artes'
  | 'tecnologia'
  | 'emprendimiento'
  | 'educacion'
  | 'naturaleza'
  | 'otros';

/** Opción de chip/filtro en el dashboard (sin la opción «Todas»). */
export interface CategoriaTallerOption {
  id: Exclude<CategoriaTallerId, 'todas'>;
  label: string;
  icon: string;
}

/** Opciones de filtro visibles en el dashboard (sin «Todas», que se agrega aparte). */
export const CATEGORIAS_TALLER: CategoriaTallerOption[] = [
  { id: 'deportes', label: 'Deportes', icon: '⚽' },
  { id: 'religion', label: 'Religión', icon: '✝️' },
  { id: 'artes', label: 'Artes y cultura', icon: '🎭' },
  { id: 'tecnologia', label: 'Tecnología', icon: '🤖' },
  { id: 'emprendimiento', label: 'Emprendimiento', icon: '💼' },
  { id: 'educacion', label: 'Educación y juegos', icon: '📚' },
  { id: 'naturaleza', label: 'Naturaleza y tradición', icon: '🌱' },
  { id: 'otros', label: 'Otros', icon: '⭐' },
];

const MAPA_TIPO_CATEGORIA: Record<string, Exclude<CategoriaTallerId, 'todas'>> = {
  // Deportes
  futbol: 'deportes',
  voley: 'deportes',
  voleibol: 'deportes',
  basquet: 'deportes',
  basket: 'deportes',
  tenisdemesa: 'deportes',
  musculacion: 'deportes',
  defensapersonal: 'deportes',
  atletismo: 'deportes',
  zumba: 'deportes',
  // Religión
  cristiano: 'religion',
  // Artes y cultura
  folclore: 'artes',
  teatro: 'artes',
  musica: 'artes',
  diseno: 'artes',
  tejido: 'artes',
  // Tecnología
  robotica: 'tecnologia',
  videojuego: 'tecnologia',
  // Emprendimiento
  emprendimiento: 'emprendimiento',
  construccion: 'emprendimiento',
  // Educación y juegos
  lectura: 'educacion',
  ludoteca: 'educacion',
  cocina: 'educacion',
  // Naturaleza y tradición
  huerta: 'naturaleza',
  rodeo: 'naturaleza',
};

/** Resuelve la categoría de un taller a partir de su tipo/nombre. */
export function categoriaDeTaller(tipo: string): Exclude<CategoriaTallerId, 'todas'> {
  const clave = normalizarTipoTaller(tipo);
  return MAPA_TIPO_CATEGORIA[clave] ?? 'otros';
}

/**
 * La ficha física (altura, peso, % grasa, sedentario) solo aplica a clubes deportivos.
 * Talleres de artes, religión, tecnología, etc. no la requieren.
 */
export function requiereFichaFisica(tipo: string): boolean {
  return categoriaDeTaller(tipo) === 'deportes';
}

/** Filtra una lista de talleres por categoría seleccionada. */
export function filtrarTalleresPorCategoria<T extends { tipo?: string }>(
  talleres: T[],
  categoria: CategoriaTallerId,
): T[] {
  if (categoria === 'todas') return talleres;
  return talleres.filter((t) => categoriaDeTaller(t.tipo ?? '') === categoria);
}

/** Categorías que tienen al menos un taller en la lista dada (para mostrar chips con conteo). */
export function categoriasDisponiblesParaTalleres<T extends { tipo?: string }>(
  talleres: T[],
): CategoriaTallerOption[] {
  const presentes = new Set(talleres.map((t) => categoriaDeTaller(t.tipo ?? '')));
  return CATEGORIAS_TALLER.filter((c) => presentes.has(c.id));
}
