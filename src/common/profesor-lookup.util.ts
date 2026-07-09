/**
 * Búsqueda de profesor por credencial de login.
 * Intenta email, RUT normalizado, nombre o tipo de taller asociado.
 */
import { Repository } from 'typeorm';
import { Profesor } from '../entities/profesor.entity';
import { normalizarRut } from './rut.util';

/**
 * Resuelve un profesor a partir del identificador ingresado en login.
 * El orden de prioridad evita falsos positivos entre email, RUT y nombre.
 */
export async function buscarProfesorPorUsuario(
  repo: Repository<Profesor>,
  usuario: string,
): Promise<Profesor | null> {
  const raw = usuario.trim();
  if (!raw) return null;

  const lower = raw.toLowerCase();
  if (lower.includes('@')) {
    const byEmail = await repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.taller', 't')
      .where('LOWER(TRIM(p.email)) = :email', { email: lower })
      .getOne();
    if (byEmail) return byEmail;
  }

  const rutNorm = normalizarRut(raw);
  if (rutNorm) {
    // Comparación en SQL para tolerar formatos distintos del mismo RUT
    const byRut = await repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.taller', 't')
      .where("REPLACE(REPLACE(UPPER(TRIM(p.rut)), '.', ''), '-', '') = :rut", { rut: rutNorm })
      .getOne();
    if (byRut) return byRut;
  }

  // Último recurso: nombre del profesor o tipo/nombre del taller
  const list = await repo
    .createQueryBuilder('p')
    .leftJoinAndSelect('p.taller', 't')
    .where('LOWER(TRIM(p.nombre)) = :u', { u: lower })
    .orWhere('LOWER(TRIM(t.tipo)) = :u', { u: lower })
    .getMany();
  return list.length > 0 ? list[0] : null;
}
