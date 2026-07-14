
import { normalizarTipoTaller } from './taller-tarjeta.util';


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


export interface CategoriaTallerOption {
  id: Exclude<CategoriaTallerId, 'todas'>;
  label: string;
  icon: string;
}


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

  cristiano: 'religion',

  folclore: 'artes',
  teatro: 'artes',
  musica: 'artes',
  diseno: 'artes',
  tejido: 'artes',

  robotica: 'tecnologia',
  videojuego: 'tecnologia',

  emprendimiento: 'emprendimiento',
  construccion: 'emprendimiento',

  lectura: 'educacion',
  ludoteca: 'educacion',
  cocina: 'educacion',

  huerta: 'naturaleza',
  rodeo: 'naturaleza',
};


export function categoriaDeTaller(tipo: string): Exclude<CategoriaTallerId, 'todas'> {
  const clave = normalizarTipoTaller(tipo);
  return MAPA_TIPO_CATEGORIA[clave] ?? 'otros';
}


export function requiereFichaFisica(tipo: string): boolean {
  return categoriaDeTaller(tipo) === 'deportes';
}


export function filtrarTalleresPorCategoria<T extends { tipo?: string }>(
  talleres: T[],
  categoria: CategoriaTallerId,
): T[] {
  if (categoria === 'todas') return talleres;
  return talleres.filter((t) => categoriaDeTaller(t.tipo ?? '') === categoria);
}


export function categoriasDisponiblesParaTalleres<T extends { tipo?: string }>(
  talleres: T[],
): CategoriaTallerOption[] {
  const presentes = new Set(talleres.map((t) => categoriaDeTaller(t.tipo ?? '')));
  return CATEGORIAS_TALLER.filter((c) => presentes.has(c.id));
}
