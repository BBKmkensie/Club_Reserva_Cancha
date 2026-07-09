import { Taller } from '../entities/taller.entity';
import { TallerHorario } from '../entities/taller-horario.entity';

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export function normalizarHora(hora: string): string {
  return hora.length >= 5 ? hora.slice(0, 5) : hora;
}

export function textoHorarioBloque(h: {
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  curso?: string | null;
  seccion?: string | null;
}): string {
  const dia = DIAS[h.diaSemana] ?? `Día ${h.diaSemana}`;
  const base = `${dia} ${normalizarHora(h.horaInicio)} - ${normalizarHora(h.horaFin)}`;
  if (h.curso) return `${h.curso}: ${base}`;
  if (h.seccion && h.seccion !== 'General') return `Sección ${h.seccion}: ${base}`;
  return base;
}

export function textoHorarioTaller(taller: Taller): string | null {
  if (taller.horarios?.length) {
    return taller.horarios.map((h) => textoHorarioBloque(h)).join(' · ');
  }
  if (taller.diaSemana != null && taller.horaInicio && taller.horaFin) {
    return textoHorarioBloque({
      diaSemana: taller.diaSemana,
      horaInicio: taller.horaInicio,
      horaFin: taller.horaFin,
    });
  }
  return null;
}

export function opcionesHorarioTaller(taller: Taller): { id: number | null; etiqueta: string }[] {
  if (taller.horarios?.length) {
    return taller.horarios.map((h) => ({
      id: h.id,
      etiqueta: textoHorarioBloque(h),
    }));
  }
  const texto = textoHorarioTaller(taller);
  if (texto) return [{ id: null, etiqueta: texto }];
  return [];
}

export function textoHorarioPorId(
  horario: TallerHorario | null | undefined,
  fallback?: string | null,
): string | null {
  if (horario) return textoHorarioBloque(horario);
  return fallback ?? null;
}
