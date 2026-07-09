/**
 * Estilos visuales (gradiente, icono y descripción) para tarjetas de taller en el dashboard.
 */
/** Apariencia de una tarjeta de taller en la interfaz */
export interface EstiloTarjetaTaller {
  classes: string;
  icon: string;
  descripcion: string;
}

const DESCRIPCIONES: Record<string, string> = {
  atletismo: 'Gestiona el taller de atletismo',
  basquet: 'Gestiona el taller de básquet',
  basket: 'Gestiona el taller de básquet',
  futbol: 'Gestiona el taller de fútbol',
  voley: 'Gestiona el taller de voley',
  voleibol: 'Gestiona el taller de voley',
  zumba: 'Gestiona el taller de zumba',
  folclore: 'Gestiona el taller de folclore',
  rodeo: 'Gestiona el taller de rodeo',
  emprendimiento: 'Gestiona el taller de emprendimiento',
  construccion: 'Gestiona el taller de construcción',
  teatro: 'Gestiona el taller de teatro',
  lectura: 'Gestiona el taller de lectura',
  ludoteca: 'Gestiona el taller de ludoteca',
  robotica: 'Gestiona el taller de robótica',
  musica: 'Gestiona el taller de música',
  diseno: 'Gestiona el taller de diseño',
  tejido: 'Gestiona el taller de tejido',
  cristiano: 'Gestiona el taller cristiano',
  videojuego: 'Gestiona el taller de videojuegos',
  huerta: 'Gestiona el taller de huerta',
  tenisdemesa: 'Gestiona el taller de tenis de mesa',
  musculacion: 'Gestiona el taller de musculación',
  defensapersonal: 'Gestiona el taller de defensa personal',
  cocina: 'Gestiona el taller de cocina',
};

/** Colores e iconos únicos por taller (clave normalizada sin acentos) */
const ESTILOS: Record<string, { classes: string; icon: string }> = {
  atletismo: { classes: 'bg-gradient-to-br from-orange-500 to-orange-700', icon: '🏃' },
  basquet: { classes: 'bg-gradient-to-br from-red-500 to-red-700', icon: '🏀' },
  basket: { classes: 'bg-gradient-to-br from-red-600 to-rose-800', icon: '🏀' },
  futbol: { classes: 'bg-gradient-to-br from-green-500 to-green-700', icon: '⚽' },
  voley: { classes: 'bg-gradient-to-br from-blue-500 to-blue-700', icon: '🏐' },
  voleibol: { classes: 'bg-gradient-to-br from-sky-500 to-blue-800', icon: '🏐' },
  zumba: { classes: 'bg-gradient-to-br from-pink-500 to-fuchsia-600', icon: '💃' },
  folclore: { classes: 'bg-gradient-to-br from-rose-500 to-rose-800', icon: '🪗' },
  rodeo: { classes: 'bg-gradient-to-br from-amber-600 to-yellow-800', icon: '🐴' },
  emprendimiento: { classes: 'bg-gradient-to-br from-violet-500 to-violet-800', icon: '💼' },
  construccion: { classes: 'bg-gradient-to-br from-stone-500 to-stone-700', icon: '🔨' },
  teatro: { classes: 'bg-gradient-to-br from-purple-500 to-purple-800', icon: '🎭' },
  lectura: { classes: 'bg-gradient-to-br from-teal-500 to-teal-700', icon: '📚' },
  ludoteca: { classes: 'bg-gradient-to-br from-cyan-500 to-cyan-800', icon: '🎲' },
  robotica: { classes: 'bg-gradient-to-br from-indigo-500 to-indigo-800', icon: '🤖' },
  musica: { classes: 'bg-gradient-to-br from-yellow-500 to-amber-600', icon: '🎵' },
  diseno: { classes: 'bg-gradient-to-br from-fuchsia-500 to-pink-700', icon: '🎨' },
  tejido: { classes: 'bg-gradient-to-br from-pink-400 to-rose-600', icon: '🧶' },
  cristiano: { classes: 'bg-gradient-to-br from-sky-500 to-sky-800', icon: '✝️' },
  videojuego: { classes: 'bg-gradient-to-br from-lime-500 to-lime-700', icon: '🎮' },
  huerta: { classes: 'bg-gradient-to-br from-emerald-500 to-emerald-800', icon: '🌱' },
  tenisdemesa: { classes: 'bg-gradient-to-br from-orange-400 to-red-600', icon: '🏓' },
  musculacion: { classes: 'bg-gradient-to-br from-zinc-600 to-zinc-800', icon: '💪' },
  defensapersonal: { classes: 'bg-gradient-to-br from-red-700 to-red-950', icon: '🥋' },
  cocina: { classes: 'bg-gradient-to-br from-amber-500 to-orange-600', icon: '👨‍🍳' },
};

/** Paleta de respaldo para talleres nuevos sin entrada explícita */
const PALETA_RESPALDO: { classes: string; icon: string }[] = [
  { classes: 'bg-gradient-to-br from-slate-500 to-slate-700', icon: '⭐' },
  { classes: 'bg-gradient-to-br from-blue-600 to-indigo-800', icon: '🌟' },
  { classes: 'bg-gradient-to-br from-emerald-600 to-teal-800', icon: '✨' },
  { classes: 'bg-gradient-to-br from-orange-500 to-amber-700', icon: '🔥' },
  { classes: 'bg-gradient-to-br from-rose-500 to-red-700', icon: '❤️' },
  { classes: 'bg-gradient-to-br from-violet-600 to-purple-900', icon: '💜' },
  { classes: 'bg-gradient-to-br from-cyan-600 to-blue-700', icon: '💎' },
  { classes: 'bg-gradient-to-br from-lime-600 to-green-800', icon: '🍀' },
];

/** Normaliza el nombre del tipo de taller (minúsculas, sin acentos ni separadores) */
export function normalizarTipoTaller(s: string): string {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '');
}

function hashTipo(clave: string): number {
  let h = 0;
  for (let i = 0; i < clave.length; i++) {
    h = (h * 31 + clave.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * Resuelve clases CSS, emoji e descripción para la tarjeta de un taller.
 * Usa paleta de respaldo determinística si el tipo no está catalogado.
 */
export function estiloTarjetaTaller(tipo: string): EstiloTarjetaTaller {
  const clave = normalizarTipoTaller(tipo);
  const descripcion =
    DESCRIPCIONES[clave] ??
    (tipo ? `Gestiona el taller de ${tipo.toLowerCase()}` : 'Actividad del club');

  const estilo =
    ESTILOS[clave] ??
    PALETA_RESPALDO[hashTipo(clave) % PALETA_RESPALDO.length];

  return { ...estilo, descripcion };
}
